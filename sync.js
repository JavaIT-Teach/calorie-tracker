/* ─── CloudSync: saves the tracker's data to a PRIVATE GitHub repository ───────
 * Same design as Lesson Plan Builder's GitHub sync:
 *  - All app data (every macro* key except the backup, plus migration flags) is
 *    stored as one file, macro-data.json, in a private repo of the owner's
 *    (default JavaIT-Teach/calorie-tracker-data). GitHub keeps every version.
 *  - The key is a fine-grained token that can only read/write that repo's
 *    contents. It is kept in this browser only (CONFIG_KEY has no "macro"
 *    prefix, so it is never in backups or in the synced file).
 *  - Changes are sent ~8 s after the last edit, and straight away when the tab
 *    is hidden. GitHub is checked on open, when the tab comes back, and every
 *    few minutes.
 *  - Never overwrites without asking: if both this device and GitHub changed,
 *    the app asks which copy to keep. Taking the GitHub copy backs up this
 *    device's data to macrobackup_v1 first, then reloads the page.
 *  - Nothing is sent while any saved data can't be read (StorageGuard), so a
 *    broken value is never copied to GitHub or other devices.
 */
window.CloudSync = (function () {
  const CONFIG_KEY = 'ct-sync-v1';          // { owner, repo, token, sha, dirty, autoDirty }
  const EDITED_KEY = 'ct-edited-at';        // last user edit on this device
  const BACKUP_KEY = 'macrobackup_v1';
  const FILE = 'macro-data.json';
  const CHECK_EVERY = 3 * 60 * 1000;
  const delay = () => (window.CT_SYNC_DELAY != null ? window.CT_SYNC_DELAY : 8000);

  let state = { status: 'off', msg: '', at: 0, conflict: null, newer: null };
  const listeners = new Set();
  let pushT = null, syncing = false, again = false, started = false, editSeq = 0;

  function set(p) { state = Object.assign({}, state, p); setTimeout(() => listeners.forEach(fn => fn(state)), 0); }
  function cfg() { try { return JSON.parse(localStorage.getItem(CONFIG_KEY)) || null; } catch (e) { return null; } }
  function setCfg(c) { try { if (c) localStorage.setItem(CONFIG_KEY, JSON.stringify(c)); else localStorage.removeItem(CONFIG_KEY); } catch (e) {} }
  function patchCfg(p) { const c = cfg(); if (c) setCfg(Object.assign(c, p)); }

  // ── What is synced ──
  const isSynced = k => (k.startsWith('macro') && k !== BACKUP_KEY) || k.startsWith('migration_');
  function localKeys() { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (isSynced(k)) out.push(k); } return out.sort(); }
  // Throws (with a plain message) if any synced value can't be read.
  function snapshot() {
    const bad = StorageGuard.status().unreadable;
    const data = {};
    for (const k of localKeys()) {
      const raw = localStorage.getItem(k);
      if (k.startsWith('migration_')) { data[k] = raw; continue; }
      try { data[k] = JSON.parse(raw); } catch (e) { bad.push(k); }
    }
    if (bad.length) { const e = new Error('unreadable'); e.plain = "Some saved data can't be read, so nothing is sent to GitHub. Fix it first (see the red bar)."; throw e; }
    return data;
  }
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const days = data => Object.values((data && data.macrolog_v1) || {}).filter(d => Array.isArray(d) && d.length).length;

  // ── GitHub API ──
  function gh(c, method, path, body, accept) {
    const headers = { Authorization: 'Bearer ' + c.token, Accept: accept || 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (body) headers['Content-Type'] = 'application/json';
    return fetch('https://api.github.com' + path, { method, headers, cache: 'no-store', body: body ? JSON.stringify(body) : undefined });
  }
  const filePath = c => `/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${FILE}`;
  const httpErr = s => { const e = new Error('HTTP ' + s); e.status = s; return e; };
  function b64enc(str) { const b = new TextEncoder().encode(str); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
  function b64dec(b64) { const s = atob(b64.replace(/\s/g, '')); return new TextDecoder().decode(Uint8Array.from(s, ch => ch.charCodeAt(0))); }

  async function readRemote(c) {
    const r = await gh(c, 'GET', filePath(c));
    if (r.status === 404) return null;
    if (!r.ok) throw httpErr(r.status);
    const meta = await r.json();
    let text;
    if (meta.encoding === 'base64' && meta.content) text = b64dec(meta.content);
    else { const r2 = await gh(c, 'GET', filePath(c), null, 'application/vnd.github.raw+json'); if (!r2.ok) throw httpErr(r2.status); text = await r2.text(); }
    let file = null; try { file = JSON.parse(text); } catch (e) {}
    if (!file || file.app !== 'calorie-tracker' || !file.data || typeof file.data !== 'object') {
      const e = new Error('bad file'); e.plain = `The data file on GitHub (${FILE}) is damaged. Nothing was changed.`; throw e;
    }
    return { sha: meta.sha, file };
  }

  // Replace this device's data with the GitHub copy. Backs up first; reloads.
  function applyRemote(remote) {
    const local = {}; for (const k of localKeys()) local[k] = localStorage.getItem(k);
    try { localStorage.setItem(BACKUP_KEY, JSON.stringify({ savedAt: new Date().toISOString(), reason: 'before loading the GitHub copy', data: local })); }
    catch (e) { const err = new Error('backup'); err.plain = 'Could not back up this device first, so the GitHub copy was not loaded.'; throw err; }
    const data = remote.file.data;
    for (const k of Object.keys(local)) if (!(k in data)) localStorage.removeItem(k);
    for (const [k, v] of Object.entries(data)) if (isSynced(k)) localStorage.setItem(k, k.startsWith('migration_') ? String(v) : JSON.stringify(v));
    patchCfg({ sha: remote.sha, dirty: false, autoDirty: false });
    location.reload();
  }

  async function syncOnce(mode, depth) {
    let c = cfg(); if (!c) return;
    if (StorageGuard.status().unreadable.length) { snapshot(); } // throws with the plain message
    const remote = await readRemote(c);
    c = cfg(); if (!c) return;
    if (remote && remote.sha !== c.sha) {
      // GitHub has a version this device has not seen.
      const local = snapshot();
      if (same(remote.file.data, local)) { patchCfg({ sha: remote.sha, dirty: false, autoDirty: false }); set({ status: 'ok', msg: '', at: Date.now(), newer: null }); return; }
      if (!c.dirty) {
        // Only load-time additions (seed fill / migrations) differ: safe to take
        // GitHub's copy; the reload re-applies those additions on top.
        if (mode === 'check') { set({ newer: remote, status: 'newer' }); return; }
        applyRemote(remote); return;
      }
      set({ status: 'conflict', conflict: { remote, remoteSavedAt: remote.file.savedAt, remoteDays: days(remote.file.data), localDays: days(local), localEditedAt: localStorage.getItem(EDITED_KEY) } });
      return;
    }
    if (remote && !c.dirty && !c.autoDirty) { set({ status: 'ok', msg: '', at: state.at || Date.now(), newer: null }); return; }
    // Send this device's data.
    set({ status: 'saving', msg: '' });
    const seq = editSeq;
    const now = new Date();
    const file = { app: 'calorie-tracker', version: 1, savedAt: now.toISOString(), data: snapshot() };
    const body = { message: `Data saved ${now.toISOString().slice(0, 16).replace('T', ' ')} UTC`, content: b64enc(JSON.stringify(file, null, 1)) };
    if (remote) body.sha = remote.sha;
    const r = await gh(c, 'PUT', filePath(c), body);
    if ((r.status === 409 || r.status === 422) && depth < 2) return syncOnce(mode, depth + 1);
    if (!r.ok) throw httpErr(r.status);
    const j = await r.json();
    const still = editSeq !== seq;
    patchCfg({ sha: j.content.sha, dirty: still, autoDirty: false });
    set({ status: still ? 'pending' : 'ok', msg: '', at: Date.now(), newer: null });
    if (still) queue();
  }

  function fail(e) {
    let msg;
    if (e.plain) msg = e.plain;
    else if (!e.status) msg = 'No internet. Saved on this device; it will be sent to GitHub when you are back online.';
    else if (e.status === 401) msg = 'Your GitHub key does not work any more. Paste a new one on the GitHub sync screen.';
    else if (e.status === 403 || e.status === 404) msg = "GitHub would not let the app in. Check the key can read and write the data repository's contents.";
    else msg = 'GitHub did not answer properly. Saved on this device; will try again.';
    set({ status: 'error', msg });
  }

  async function syncNow(mode) {
    if (!cfg() || state.conflict) return;
    if (syncing) { again = true; return; }
    syncing = true; clearTimeout(pushT);
    try { await syncOnce(mode || 'auto', 0); } catch (e) { fail(e); }
    finally { syncing = false; if (again) { again = false; syncNow(mode); } }
  }
  function queue(ms) {
    if (!cfg() || state.conflict) return;
    clearTimeout(pushT);
    pushT = setTimeout(() => syncNow('auto'), ms == null ? delay() : ms);
    if (state.status !== 'saving' && state.status !== 'error') set({ status: 'pending' });
  }

  // Called by StorageGuard after every successful user save.
  function changed() {
    editSeq++;
    try { localStorage.setItem(EDITED_KEY, new Date().toISOString()); } catch (e) {}
    if (!cfg()) return;
    patchCfg({ dirty: true });
    queue();
  }

  async function connect(owner, repo, token) {
    owner = owner.trim(); repo = repo.trim(); token = token.trim();
    if (!owner || !repo || !token) return 'Fill in all three boxes.';
    let r;
    try { r = await gh({ token }, 'GET', `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`); }
    catch (e) { return 'No internet. Try again when you are online.'; }
    if (r.status === 401) return 'This key does not work. Check that you copied all of it.';
    if (!r.ok) return `Cannot open ${owner}/${repo} with this key. Check the names, and that the key was made for this repository.`;
    const info = await r.json();
    if (!info.private) return 'This repository is public, so anyone could read your meals and goals. Make it private on GitHub first.';
    // A device with its own data must never be silently replaced by the GitHub copy.
    let hasData = !!localStorage.getItem(EDITED_KEY);
    try { hasData = hasData || days({ macrolog_v1: JSON.parse(localStorage.getItem('macrolog_v1')) }) > 0; } catch (e) { hasData = true; }
    setCfg({ owner, repo, token, sha: null, dirty: hasData, autoDirty: false });
    set({ status: 'pending', msg: '', conflict: null });
    await syncNow('auto');
    return null;
  }
  function disconnect() { clearTimeout(pushT); setCfg(null); set({ status: 'off', msg: '', conflict: null, newer: null }); }
  function resolve(which) {
    const cf = state.conflict; if (!cf) return;
    if (which === 'github') { set({ conflict: null }); try { applyRemote(cf.remote); } catch (e) { fail(e); } return; }
    patchCfg({ sha: cf.remote.sha, dirty: true });
    set({ conflict: null });
    syncNow('auto');
  }
  function loadNewer() { const n = state.newer; if (!n) return; try { applyRemote(n); } catch (e) { fail(e); } }

  function start() {
    if (started) return; started = true;
    const c = cfg();
    if (c && window.__ctLoadChanged) patchCfg({ autoDirty: true });
    if (c) { set({ status: 'pending' }); syncNow('auto'); }
    document.addEventListener('visibilitychange', () => {
      if (!cfg()) return;
      if (document.visibilityState === 'hidden') { if (cfg().dirty) syncNow('auto'); }
      else syncNow('auto');
    });
    window.addEventListener('online', () => { if (cfg()) syncNow('auto'); });
    setInterval(() => { if (cfg() && document.visibilityState === 'visible' && !state.conflict) syncNow('check'); }, CHECK_EVERY);
  }

  function info() { const c = cfg(); return c ? { owner: c.owner, repo: c.repo } : null; }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  return { start, changed, connect, disconnect, resolve, loadNewer, syncNow: () => syncNow('auto'), state: () => state, info, subscribe, FILE };
})();
