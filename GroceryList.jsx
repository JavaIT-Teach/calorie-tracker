// ─── GroceryList component ─────────────────────────────────────────────────────
// Generates a 5-day shopping list from a single day's log. Recipes are expanded
// into their ingredients via lineItems; direct foods are taken at face value.
// Stocked ingredients (toggle per food) are excluded.

const _glState = React;
const _glUseState = _glState.useState;
const _glUseMemo = _glState.useMemo;

// Persistent storage helpers (self-contained — survive close/reopen + reload)
function _glLoad(key, def) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; }
  catch (e) { return def; }
}
function _glSave(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}

// Category mapping by foodId. Anything not in the map falls into "other".
const GROCERY_CATEGORIES = {
  // Proteins
  chicken_breast: 'proteins', chicken_thighs: 'proteins', shrimp: 'proteins',
  salmon: 'proteins', ground_beef: 'proteins', kirkland_ham: 'proteins',
  whey_protein: 'proteins', gainer: 'proteins',
  boiled_egg: 'proteins', eggs: 'proteins', egg_white: 'proteins',
  // Dairy
  greek_yogurt: 'dairy', greek_yogurt_0: 'dairy',
  cream_cheese: 'dairy', havarti: 'dairy', provolone: 'dairy',
  feta: 'dairy', mozzarella: 'dairy', ricotta: 'dairy',
  kefir: 'dairy', butter: 'dairy',
  // Carbs
  potatoes: 'carbs', sweet_potatoes: 'carbs',
  rudolphs_bread: 'carbs', pasta: 'carbs', tortilla: 'carbs',
  protein_tortilla: 'carbs', rice: 'carbs', flour: 'carbs',
  lavash: 'carbs', sukhari: 'carbs', yasno_oats_1: 'carbs', bran_bread: 'carbs', rice_cakes: 'carbs',
  // Produce
  banana: 'produce', diced_tomatoes: 'produce', avocado: 'produce',
  bell_peppers: 'produce', red_onions: 'produce', cucumbers: 'produce',
  garlic: 'produce', mushrooms: 'produce', spinach: 'produce', onion: 'produce',
  // Condiments & sauces
  olive_oil: 'condiments', sunflower_oil: 'condiments', soy_sauce: 'condiments', honey: 'condiments',
  chicken_broth: 'condiments', marinara: 'condiments',
  kalamata_olives: 'condiments',
};

const CATEGORY_ORDER = ['proteins', 'carbs', 'dairy', 'produce', 'condiments', 'other'];
const CATEGORY_LABELS = {
  proteins: 'Proteins', carbs: 'Carbs', dairy: 'Dairy',
  produce: 'Produce', condiments: 'Condiments & sauces', other: 'Other',
};

// Parse "100 g" → { baseQty: 100, unit: "g" }
function _glParsePortion(p) {
  if (!p) return { baseQty: 1, unit: '' };
  const m = String(p).match(/^([\d.]+)\s*(.+?)(\s*\(.*\))?$/);
  if (m) return { baseQty: parseFloat(m[1]) || 1, unit: m[2].trim() };
  return { baseQty: 1, unit: p };
}

// Expand one logged item into one or more concrete ingredient quantities.
function expandLogItem(item, foodDB) {
  const itemMult = item.qty_mult || 1;
  // Recipe with line items → expand
  if (Array.isArray(item.lineItems) && item.lineItems.length) {
    return item.lineItems
      .filter(li => li.foodId)
      .map(li => {
        const food = foodDB.find(f => f.id === li.foodId);
        const parsed = _glParsePortion(li.foodPortion || food?.portion || '');
        const qty = (li.enteredQty != null ? li.enteredQty : parsed.baseQty) * itemMult;
        return {
          foodId: li.foodId,
          foodName: li.foodName || food?.name || li.foodId,
          qty,
          unit: li.unit || parsed.unit || '',
        };
      });
  }
  // Direct food: match item.id against foodDB
  const food = foodDB.find(f => f.id === item.id);
  if (food) {
    const parsed = _glParsePortion(food.portion);
    return [{
      foodId: food.id,
      foodName: food.name,
      qty: parsed.baseQty * itemMult,
      unit: parsed.unit,
    }];
  }
  // Unknown — keep the qty string as-is so it isn't silently dropped
  return [{
    foodId: null,
    foodName: item.name,
    qty: 0,
    unit: item.qty || '',
    unknown: true,
  }];
}

function aggregateIngredients(meals, foodDB, multiplier) {
  const buckets = {};
  meals.forEach(meal => {
    (meal.items || []).forEach(item => {
      expandLogItem(item, foodDB).forEach(ing => {
        const key = ing.foodId || `__${ing.foodName}`;
        if (!buckets[key]) {
          buckets[key] = {
            foodId: ing.foodId,
            foodName: ing.foodName,
            unit: ing.unit,
            qty: 0,
            unknown: ing.unknown,
          };
        }
        buckets[key].qty += (ing.qty || 0) * multiplier;
      });
    });
  });
  return Object.values(buckets);
}

function formatQty(qty, unit) {
  if (!qty) return '—';
  const rounded = qty >= 100 ? Math.round(qty) : Math.round(qty * 10) / 10;
  return `${rounded}${unit ? ' ' + unit : ''}`;
}

function GroceryList({ meals, foodDB, stocked, setStocked, onClose, dateKey }) {
  const [days, setDays] = _glUseState(5);
  const [showStocked, setShowStocked] = _glUseState(false);

  // ── Persistent check-off + custom items (localStorage) ──
  // checked is bucketed per (source day × days) so each week's list keeps its own
  // picked-up state; custom items are global so staples (e.g. garbage bags) recur.
  const CHECK_KEY = 'macrogrocery_checked_v1';
  const CUSTOM_KEY = 'macrogrocery_custom_v1';
  const [checkedAll, setCheckedAll] = _glUseState(() => _glLoad(CHECK_KEY, {}));
  const [custom, setCustom] = _glUseState(() => _glLoad(CUSTOM_KEY, []));
  const [showAdd, setShowAdd] = _glUseState(false);
  const [addName, setAddName] = _glUseState('');
  const [addQty, setAddQty] = _glUseState('');
  const [copied, setCopied] = _glUseState(false);
  const [copyText, setCopyText] = _glUseState(null);
  const copyAreaRef = React.useRef(null);

  const srcKey = dateKey || new Date().toISOString().slice(0, 10);
  const bucketKey = srcKey + 'x' + days;
  const checked = checkedAll[bucketKey] || {};

  const startDate = new Date(srcKey + 'T00:00:00');
  const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + days - 1);
  const fmtD = d => d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  const rangeStr = `${fmtD(startDate)} – ${fmtD(endDate)}`;

  function persistChecked(next) { setCheckedAll(next); _glSave(CHECK_KEY, next); }
  function persistCustom(next) { setCustom(next); _glSave(CUSTOM_KEY, next); }
  function toggleChecked(itemKey) {
    const bucket = { ...(checkedAll[bucketKey] || {}) };
    if (bucket[itemKey]) delete bucket[itemKey]; else bucket[itemKey] = 1;
    persistChecked({ ...checkedAll, [bucketKey]: bucket });
  }
  function clearChecked() {
    persistChecked({ ...checkedAll, [bucketKey]: {} });
  }
  function addCustomItem(e) {
    if (e) e.preventDefault();
    const nm = addName.trim(); if (!nm) return;
    const item = { id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: nm, qty: addQty.trim() };
    persistCustom([...custom, item]);
    setAddName(''); setAddQty(''); setShowAdd(false);
  }
  function removeCustomItem(id) {
    persistCustom(custom.filter(c => c.id !== id));
    const bucket = { ...(checkedAll[bucketKey] || {}) };
    if (bucket['cust_' + id]) { delete bucket['cust_' + id]; persistChecked({ ...checkedAll, [bucketKey]: bucket }); }
  }

  const aggregated = _glUseMemo(
    () => aggregateIngredients(meals || [], foodDB || [], days),
    [meals, foodDB, days]
  );

  const grouped = _glUseMemo(() => {
    const g = {};
    CATEGORY_ORDER.forEach(c => g[c] = []);
    aggregated.forEach(ing => {
      const cat = (ing.foodId && GROCERY_CATEGORIES[ing.foodId]) || 'other';
      g[cat].push(ing);
    });
    Object.values(g).forEach(arr => arr.sort((a, b) => a.foodName.localeCompare(b.foodName)));
    return g;
  }, [aggregated]);

  function toggleStocked(foodId) {
    if (!foodId) return;
    setStocked(prev => prev.includes(foodId)
      ? prev.filter(x => x !== foodId)
      : [...prev, foodId]);
  }

  function clearStocked() { setStocked([]); }

  function buildListText() {
    const lines = [`Grocery list — week of ${fmtD(startDate)} (${days} day${days === 1 ? '' : 's'})`];
    CATEGORY_ORDER.forEach(cat => {
      const items = (grouped[cat] || []).filter(i => !stocked.includes(i.foodId));
      if (!items.length) return;
      lines.push('', CATEGORY_LABELS[cat].toUpperCase());
      items.forEach(i => lines.push(`  • ${i.foodName} — ${i.unknown ? i.unit : formatQty(i.qty, i.unit)}`));
    });
    if (custom.length) {
      lines.push('', 'CUSTOM ITEMS');
      custom.forEach(c => lines.push(`  • ${c.name}${c.qty ? ' — ' + c.qty : ''}`));
    }
    return lines.join('\n');
  }

  // The app runs inside an iframe where the async Clipboard API is blocked by
  // permissions policy (clipboard-write reports "denied") and also rejects with
  // NotAllowedError when the frame isn't focused. Awaiting that rejection burns
  // the transient user activation, so execCommand then fails too. Order matters:
  // synchronous execCommand FIRST, inside the live gesture; async API second.
  function legacyCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:none;opacity:0;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  function flashCopied() { setCopied(true); setTimeout(() => setCopied(false), 2000); }

  function copyToClipboard() {
    const text = buildListText();
    // 1. Synchronous path — still inside the user gesture.
    if (legacyCopy(text)) { setCopyText(null); flashCopied(); return; }
    // 2. Modern API, fire-and-forget. Works when the page isn't framed.
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => { setCopyText(null); flashCopied(); })
        .catch(() => setCopyText(text));
      return;
    }
    // 3. Neither worked: show the text in-page so it can be selected by hand.
    setCopyText(text);
  }

  React.useEffect(() => {
    if (copyText && copyAreaRef.current) {
      copyAreaRef.current.focus();
      copyAreaRef.current.select();
    }
  }, [copyText]);

  // ISO-week helpers for the export title
  function _getISOWeek(d) {
    const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = dt.getUTCDay() || 7;
    dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
    return { week, year: dt.getUTCFullYear() };
  }

  function exportAsChecklist() {
    const today = new Date(srcKey + 'T00:00:00');
    const end = new Date(today); end.setDate(end.getDate() + (days - 1));
    const fmt = d => d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
    const fmtFull = d => d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
    const { week, year } = _getISOWeek(today);
    const rangeStr = `${fmt(today)} – ${fmtFull(end)}`;
    const titleLine = `Week ${week}, ${year}`;

    // Always show all default categories (even if empty), with "Other" reserved for non-food items.
    // Generated items skip those already stocked. Each category gets an "Add item" form;
    // user can also add brand-new custom categories at the bottom.
    const EXPORT_CAT_ORDER = ['proteins', 'carbs', 'dairy', 'produce', 'condiments', 'other'];
    const EXPORT_CAT_LABELS = {
      proteins: 'Proteins', carbs: 'Carbs', dairy: 'Dairy',
      produce: 'Produce', condiments: 'Condiments', other: 'Other',
    };

    const sections = EXPORT_CAT_ORDER.map(cat => ({
      cat, label: EXPORT_CAT_LABELS[cat],
      items: (grouped[cat] || []).filter(i => !stocked.includes(i.foodId)),
    }));

    // Carry the in-app custom items into the exported artifact as a dedicated section.
    if (custom && custom.length) {
      sections.push({
        cat: 'custom', label: 'Custom items',
        items: custom.map(c => ({ foodName: c.name, unit: c.qty, unknown: true, foodId: null })),
      });
    }

    const totalItems = sections.reduce((n, s) => n + s.items.length, 0);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

    const sectionsHtml = sections.map(s => `
        <section class="cat" data-cat="${esc(s.cat)}">
          <h2><span class="cat-label">${esc(s.label)}</span> <span class="count">${s.items.length}</span></h2>
          <ul class="items">
            ${s.items.map((i, idx) => `
              <li class="row" data-generated="1">
                <label>
                  <input type="checkbox" data-key="gen__${esc(s.cat)}__${esc((i.foodId || i.foodName) + '_' + idx)}" />
                  <span class="name">${esc(i.foodName)}</span>
                  <span class="qty">${esc(i.unknown ? i.unit : formatQty(i.qty, i.unit))}</span>
                </label>
              </li>`).join('')}
          </ul>
          <div class="add-row">
            <button class="add-btn" type="button" data-action="show-add">+ Add item</button>
            <form class="add-form" hidden>
              <input type="text" class="add-name" placeholder="Item name" autocomplete="off" />
              <input type="text" class="add-qty"  placeholder="Qty (optional)" autocomplete="off" />
              <button type="submit" class="add-save">Add</button>
              <button type="button" class="add-cancel">×</button>
            </form>
          </div>
        </section>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="theme-color" content="#00895a" />
<title>${esc(titleLine)} — Grocery Checklist</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  :root {
    --bg: #f4f4f0; --surface: #fff; --surface2: #faf9f6;
    --text: #1a1a1a; --text2: #555; --text3: #999;
    --border: #e3e1d8; --accent: #00895a; --accent-bg: #e6f3ed;
    --red: #c44; --mono: 'IBM Plex Mono', 'SF Mono', Menlo, Consolas, monospace;
    --sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #1a1a1a; --surface: #242422; --surface2: #2a2a27;
      --text: #f0efe9; --text2: #aaa; --text3: #777; --border: #38362f; --accent-bg: #163a2d; }
  }
  html, body { background: var(--bg); color: var(--text); font-family: var(--sans);
    -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.4; }
  body { padding: max(20px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
    max(40px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
    max-width: 640px; margin: 0 auto; }
  header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
  .eyebrow { font-family: var(--mono); font-size: 11px; color: var(--text3);
    text-transform: uppercase; letter-spacing: 1.2px; }
  h1 { font-size: 26px; font-weight: 600; margin-top: 4px; letter-spacing: -0.01em; }
  .range { font-family: var(--mono); font-size: 13px; color: var(--text2); margin-top: 4px; }
  .meta { display: flex; justify-content: space-between; align-items: center;
    margin-top: 12px; font-family: var(--mono); font-size: 11px; color: var(--text3);
    text-transform: uppercase; letter-spacing: 0.6px; }
  .progress { height: 4px; background: var(--border); border-radius: 2px;
    overflow: hidden; margin-top: 10px; }
  .progress > div { height: 100%; background: var(--accent); width: 0%; transition: width 0.25s ease; }

  .cat { margin-top: 18px; background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden; }
  .cat h2 { font-size: 11px; font-family: var(--mono); font-weight: 600; color: var(--accent);
    text-transform: uppercase; letter-spacing: 1px; padding: 10px 16px;
    background: var(--surface2); border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .cat h2 .cat-label { flex: 1; }
  .cat h2 .count { font-family: var(--mono); color: var(--text3); font-weight: 400; }
  .cat h2 .cat-del { background: none; border: none; color: var(--text3); font-size: 16px;
    cursor: pointer; padding: 0 4px; line-height: 1; }
  .cat h2 .cat-del:hover { color: var(--red); }
  ul.items { list-style: none; }
  li.row { border-bottom: 1px solid var(--border); position: relative; }
  li.row:last-child { border-bottom: none; }
  label { display: flex; align-items: center; gap: 14px; padding: 14px 16px;
    cursor: pointer; min-height: 52px; user-select: none; -webkit-user-select: none; }
  input[type="checkbox"] { appearance: none; -webkit-appearance: none;
    width: 22px; height: 22px; min-width: 22px; border: 1.5px solid var(--text3);
    border-radius: 6px; background: var(--surface); cursor: pointer; position: relative;
    transition: background 0.15s, border-color 0.15s; }
  input[type="checkbox"]:checked { background: var(--accent); border-color: var(--accent); }
  input[type="checkbox"]:checked::after {
    content: ''; position: absolute; left: 6px; top: 2px;
    width: 6px; height: 12px; border: solid #fff; border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  .name { flex: 1; font-size: 15px; font-weight: 500;
    transition: color 0.2s, text-decoration-color 0.2s; }
  .qty { font-family: var(--mono); font-size: 13px; font-weight: 600; color: var(--text2);
    background: var(--bg); padding: 4px 10px; border-radius: 6px; white-space: nowrap; }
  li.row.done { opacity: 0.45; }
  li.row.done .name { text-decoration: line-through; text-decoration-thickness: 1.5px; color: var(--text3); }
  li.row.done .qty { color: var(--text3); }
  .row-del { position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: var(--text3); font-size: 18px; cursor: pointer;
    padding: 4px 8px; opacity: 0; transition: opacity 0.15s; }
  li.row.custom:hover .row-del, li.row.custom:focus-within .row-del { opacity: 1; }
  @media (hover: none) { li.row.custom .row-del { opacity: 1; } }

  /* Add item UI */
  .add-row { padding: 8px 12px; background: var(--surface2); }
  .add-btn { background: none; border: 1px dashed var(--border); width: 100%;
    padding: 10px; border-radius: 8px; font-family: var(--mono); font-size: 12px;
    color: var(--text2); cursor: pointer; font-weight: 600; letter-spacing: 0.5px; }
  .add-btn:active { background: var(--bg); }
  .add-form { display: flex; gap: 6px; align-items: center; padding: 4px 0; }
  .add-form input { flex: 1; min-width: 0; padding: 10px 12px; font-size: 14px;
    border: 1px solid var(--border); border-radius: 8px; background: var(--surface);
    color: var(--text); font-family: var(--sans); outline: none; }
  .add-form input.add-qty { flex: 0 0 110px; font-family: var(--mono); font-size: 13px; }
  .add-form input:focus { border-color: var(--accent); }
  .add-form .add-save { background: var(--accent); color: #fff; border: none;
    padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .add-form .add-cancel { background: none; border: none; color: var(--text3);
    font-size: 22px; cursor: pointer; padding: 0 6px; line-height: 1; }

  .new-cat-row { margin-top: 18px; }
  .new-cat-btn { width: 100%; background: none; border: 1.5px dashed var(--border);
    color: var(--text2); padding: 16px; border-radius: 12px; font-size: 13px;
    font-weight: 600; cursor: pointer; font-family: var(--sans); }
  .new-cat-btn:active { background: var(--surface); }
  .new-cat-form { display: flex; gap: 6px; margin-top: 18px; }
  .new-cat-form input { flex: 1; min-width: 0; padding: 12px 14px; font-size: 14px;
    border: 1px solid var(--border); border-radius: 8px; background: var(--surface);
    color: var(--text); font-family: var(--sans); outline: none; }
  .new-cat-form input:focus { border-color: var(--accent); }
  .new-cat-form button.add-save { background: var(--accent); color: #fff; border: none;
    padding: 12px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; }
  .new-cat-form button.add-cancel { background: none; border: none; color: var(--text3);
    font-size: 22px; cursor: pointer; padding: 0 8px; }

  .footer { margin-top: 28px; padding: 14px 16px; text-align: center;
    font-family: var(--mono); font-size: 10px; color: var(--text3); letter-spacing: 0.5px; }
  .actions { display: flex; gap: 8px; margin-top: 12px; }
  .actions button {
    flex: 1; padding: 10px; font-family: var(--mono); font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.8px; color: var(--text2);
    background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
    cursor: pointer;
  }
  .actions button:active { background: var(--bg); }
</style>
</head>
<body>
  <header>
    <div class="eyebrow">Grocery checklist</div>
    <h1>${esc(titleLine)}</h1>
    <div class="range">${esc(rangeStr)} · ${days} day${days === 1 ? '' : 's'}</div>
    <div class="progress"><div id="bar"></div></div>
    <div class="meta">
      <span><span id="done">0</span> / <span id="total">${totalItems}</span> picked up</span>
      <span id="remaining">${totalItems} remaining</span>
    </div>
    <div class="actions">
      <button id="resetBtn">Reset all</button>
      <button id="checkAllBtn">Check all</button>
    </div>
  </header>
  <main id="main">
    ${sectionsHtml}
  </main>
  <div class="new-cat-row">
    <button class="new-cat-btn" id="newCatBtn" type="button">+ Add category</button>
    <form class="new-cat-form" id="newCatForm" hidden>
      <input type="text" id="newCatName" placeholder="Category name" autocomplete="off" />
      <button type="submit" class="add-save">Add</button>
      <button type="button" class="add-cancel" id="newCatCancel">×</button>
    </form>
  </div>
  <div class="footer">Saved locally on this device · works offline</div>
<script>
(function() {
  var STORAGE_KEY = 'grocery_checklist_${esc(titleLine).replace(/\\s+/g, '_').toLowerCase()}_${days}d';
  // state: { checked: { key: 1 }, customItems: { catId: [{key,name,qty}] }, customCats: [{id,label}] }
  var state = { checked: {}, customItems: {}, customCats: [] };
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      // Backward compat: if it's the old shape ({key:1, ...}), treat as checked map
      if (parsed && typeof parsed === 'object' && (parsed.checked || parsed.customItems || parsed.customCats)) {
        state = Object.assign(state, parsed);
        state.checked = state.checked || {};
        state.customItems = state.customItems || {};
        state.customCats = state.customCats || [];
      } else if (parsed && typeof parsed === 'object') {
        state.checked = parsed;
      }
    }
  } catch(e) {}

  var doneEl = document.getElementById('done');
  var totalEl = document.getElementById('total');
  var remEl = document.getElementById('remaining');
  var barEl = document.getElementById('bar');
  var main = document.getElementById('main');

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
  }
  function uid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function updateRow(b) {
    var li = b.closest('li');
    if (b.checked) li.classList.add('done'); else li.classList.remove('done');
  }
  function updateMeta() {
    var boxes = document.querySelectorAll('input[type="checkbox"]');
    var done = 0;
    boxes.forEach(function(b) { if (b.checked) done++; });
    var total = boxes.length;
    doneEl.textContent = done;
    totalEl.textContent = total;
    remEl.textContent = (total - done) + ' remaining';
    barEl.style.width = total ? ((done / total) * 100) + '%' : '0%';
    // Update per-section counts
    document.querySelectorAll('section.cat').forEach(function(sec) {
      var n = sec.querySelectorAll('input[type="checkbox"]').length;
      var c = sec.querySelector('.count');
      if (c) c.textContent = n;
    });
  }
  function wireCheckbox(b) {
    if (state.checked[b.dataset.key]) b.checked = true;
    updateRow(b);
    b.addEventListener('change', function() {
      if (b.checked) state.checked[b.dataset.key] = 1;
      else delete state.checked[b.dataset.key];
      updateRow(b); updateMeta(); persist();
    });
  }

  function makeCustomRow(catId, item) {
    var li = document.createElement('li');
    li.className = 'row custom';
    li.dataset.key = item.key;
    var label = document.createElement('label');
    var cb = document.createElement('input');
    cb.type = 'checkbox'; cb.dataset.key = item.key;
    var name = document.createElement('span'); name.className = 'name'; name.textContent = item.name;
    label.appendChild(cb); label.appendChild(name);
    if (item.qty) {
      var qty = document.createElement('span'); qty.className = 'qty'; qty.textContent = item.qty;
      label.appendChild(qty);
    }
    li.appendChild(label);
    var del = document.createElement('button');
    del.type = 'button'; del.className = 'row-del'; del.textContent = '×';
    del.setAttribute('aria-label', 'Remove ' + item.name);
    del.addEventListener('click', function(e) {
      e.preventDefault(); e.stopPropagation();
      var arr = state.customItems[catId] || [];
      state.customItems[catId] = arr.filter(function(x) { return x.key !== item.key; });
      delete state.checked[item.key];
      li.remove(); updateMeta(); persist();
    });
    li.appendChild(del);
    wireCheckbox(cb);
    return li;
  }

  function wireAddItem(section) {
    var catId = section.dataset.cat;
    var btn = section.querySelector('button[data-action="show-add"]');
    var form = section.querySelector('.add-form');
    var nameI = section.querySelector('.add-name');
    var qtyI = section.querySelector('.add-qty');
    var cancel = section.querySelector('.add-cancel');
    var list = section.querySelector('ul.items');

    function show() { btn.hidden = true; form.hidden = false; nameI.value = ''; qtyI.value = ''; nameI.focus(); }
    function hide() { btn.hidden = false; form.hidden = true; }
    btn.addEventListener('click', show);
    cancel.addEventListener('click', hide);
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var nm = nameI.value.trim(); if (!nm) return;
      var item = { key: uid(), name: nm, qty: qtyI.value.trim() };
      state.customItems[catId] = state.customItems[catId] || [];
      state.customItems[catId].push(item);
      list.appendChild(makeCustomRow(catId, item));
      hide(); updateMeta(); persist();
    });
  }

  function buildCustomCategory(cat) {
    var sec = document.createElement('section');
    sec.className = 'cat'; sec.dataset.cat = cat.id;
    sec.innerHTML =
      '<h2><span class="cat-label"></span> <span class="count">0</span>' +
        '<button type="button" class="cat-del" aria-label="Delete category">×</button></h2>' +
      '<ul class="items"></ul>' +
      '<div class="add-row">' +
        '<button class="add-btn" type="button" data-action="show-add">+ Add item</button>' +
        '<form class="add-form" hidden>' +
          '<input type="text" class="add-name" placeholder="Item name" autocomplete="off" />' +
          '<input type="text" class="add-qty"  placeholder="Qty (optional)" autocomplete="off" />' +
          '<button type="submit" class="add-save">Add</button>' +
          '<button type="button" class="add-cancel">×</button>' +
        '</form>' +
      '</div>';
    sec.querySelector('.cat-label').textContent = cat.label;
    sec.querySelector('.cat-del').addEventListener('click', function() {
      if (!confirm('Delete category "' + cat.label + '" and all its items?')) return;
      state.customCats = state.customCats.filter(function(c) { return c.id !== cat.id; });
      (state.customItems[cat.id] || []).forEach(function(it) { delete state.checked[it.key]; });
      delete state.customItems[cat.id];
      sec.remove(); updateMeta(); persist();
    });
    main.appendChild(sec);
    wireAddItem(sec);
    return sec;
  }

  // Wire generated rows
  document.querySelectorAll('input[type="checkbox"]').forEach(wireCheckbox);

  // Wire built-in section add-item forms
  document.querySelectorAll('section.cat').forEach(wireAddItem);

  // Restore custom items into their categories
  Object.keys(state.customItems).forEach(function(catId) {
    var sec = document.querySelector('section.cat[data-cat="' + catId + '"]');
    if (!sec) return; // custom category not yet built — handled below
    var list = sec.querySelector('ul.items');
    (state.customItems[catId] || []).forEach(function(it) { list.appendChild(makeCustomRow(catId, it)); });
  });

  // Restore custom categories
  state.customCats.forEach(function(cat) {
    var sec = buildCustomCategory(cat);
    var list = sec.querySelector('ul.items');
    (state.customItems[cat.id] || []).forEach(function(it) { list.appendChild(makeCustomRow(cat.id, it)); });
  });

  // Add Category button
  var newCatBtn = document.getElementById('newCatBtn');
  var newCatForm = document.getElementById('newCatForm');
  var newCatName = document.getElementById('newCatName');
  var newCatCancel = document.getElementById('newCatCancel');
  newCatBtn.addEventListener('click', function() {
    newCatBtn.hidden = true; newCatForm.hidden = false; newCatName.value = ''; newCatName.focus();
  });
  newCatCancel.addEventListener('click', function() {
    newCatBtn.hidden = false; newCatForm.hidden = true;
  });
  newCatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var nm = newCatName.value.trim(); if (!nm) return;
    var cat = { id: uid(), label: nm };
    state.customCats.push(cat);
    buildCustomCategory(cat);
    newCatBtn.hidden = false; newCatForm.hidden = true;
    persist();
  });

  // Top-level reset / check all
  document.getElementById('resetBtn').addEventListener('click', function() {
    if (!confirm('Uncheck all items?')) return;
    document.querySelectorAll('input[type="checkbox"]').forEach(function(b) {
      b.checked = false; updateRow(b);
    });
    state.checked = {};
    updateMeta(); persist();
  });
  document.getElementById('checkAllBtn').addEventListener('click', function() {
    document.querySelectorAll('input[type="checkbox"]').forEach(function(b) {
      b.checked = true; updateRow(b);
      state.checked[b.dataset.key] = 1;
    });
    updateMeta(); persist();
  });

  updateMeta();
})();
</script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Grocery — Week ${week} (${fmt(today).replace(/[, ]/g,'-')} to ${fmt(end).replace(/[, ]/g,'-')}).html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
  }

  const activeIngredients = aggregated.filter(i => !stocked.includes(i.foodId));
  const totalStocked = aggregated.length - activeIngredients.length;
  const genKeys = activeIngredients.map(i => 'gen_' + (i.foodId || i.foodName));
  const custKeys = custom.map(c => 'cust_' + c.id);
  const totalCount = genKeys.length + custKeys.length;
  const doneCount = [...genKeys, ...custKeys].filter(k => checked[k]).length;
  const totalActive = activeIngredients.length;
  const donePct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // ── Shared row renderer for a checkable line item ──
  // Plain function (not a nested component) so toggling never remounts the list.
  const renderRow = ({ rowKey, itemKey, name, qty, badge, isStocked, onStock, onDelete, dim }) => {
    const isChecked = !!checked[itemKey];
    return (
      <div key={rowKey} style={{ display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 20px', borderBottom: '1px solid var(--border)',
        opacity: dim ? 0.5 : 1, position: 'relative' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 11, flex: 1, minWidth: 0, cursor: 'pointer' }}>
          <input type="checkbox" checked={isChecked} onChange={() => toggleChecked(itemKey)}
            style={{ accentColor: 'var(--accent)', width: 17, height: 17, flexShrink: 0, cursor: 'pointer' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: isChecked ? 'var(--text3)' : 'var(--text)',
            textDecoration: isChecked ? 'line-through' : 'none', textDecorationThickness: 1.5,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </span>
          {badge && <span style={{ fontSize: 10, color: 'var(--amber)', background: 'var(--amber-bg)',
            padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>{badge}</span>}
        </label>
        {qty ? (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600,
            color: isChecked ? 'var(--text3)' : 'var(--text2)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {qty}
          </span>
        ) : null}
        {onStock && (
          <button onClick={onStock}
            title={isStocked ? 'In stock — click to add back to the list' : 'Mark as always in stock (hide from list)'}
            style={{ flexShrink: 0, fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
              letterSpacing: 0.3, padding: '4px 8px', borderRadius: 5, cursor: 'pointer',
              border: `1px solid ${isStocked ? 'var(--accent)' : 'var(--border)'}`,
              background: isStocked ? 'var(--accent-bg)' : 'transparent',
              color: isStocked ? 'var(--accent)' : 'var(--text3)' }}>
            {isStocked ? 'in stock' : 'stock'}
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} title="Remove custom item" aria-label="Remove custom item"
            style={{ flexShrink: 0, background: 'none', border: 'none', color: 'var(--text3)',
              fontSize: 17, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>×</button>
        )}
      </div>
    );
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      className="modal-wrap"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1500,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-box" style={{ background: 'var(--surface)', borderRadius: 10, width: 560, maxWidth: '95vw',
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: 1 }}>Grocery list</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>
                Week of {fmtD(startDate)}
              </div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', marginTop: 2 }}>
                logged day × {days} {days === 1 ? 'day' : 'days'} · {rangeStr}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18,
              color: 'var(--text2)', cursor: 'pointer', padding: '0 4px' }}>✕</button>
          </div>

          {/* Day multiplier */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: 0.5, marginRight: 4 }}>Days</span>
            {[3, 5, 7, 14].map(n => {
              const active = days === n;
              return (
                <button key={n} onClick={() => setDays(n)}
                  style={{ flex: '0 0 auto', padding: '5px 12px', borderRadius: 6, fontSize: 12,
                    fontWeight: 600, fontFamily: 'var(--mono)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    background: active ? 'var(--accent-bg)' : 'var(--bg)',
                    color: active ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer' }}>
                  {n}
                </button>
              );
            })}
          </div>

          {/* Progress */}
          <div style={{ marginTop: 12 }}>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${donePct}%`, background: 'var(--accent)', transition: 'width 0.25s ease' }} />
            </div>
            <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', marginTop: 6 }}>
              {doneCount} / {totalCount} picked up · {totalCount - doneCount} remaining
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {/* ── Auto-generated ingredient list ── */}
          {aggregated.length === 0 ? (
            <div style={{ padding: '32px 40px', textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>
              No meals logged for this day. The auto-generated list is empty — you can still add custom items below.
            </div>
          ) : (
            CATEGORY_ORDER.map(cat => {
              const items = grouped[cat] || [];
              const active = items.filter(i => !stocked.includes(i.foodId));
              const stocks = items.filter(i => stocked.includes(i.foodId));
              const visibleStocked = showStocked ? stocks : [];
              if (active.length === 0 && visibleStocked.length === 0) return null;
              return (
                <div key={cat} style={{ borderBottom: '1px solid var(--border)' }}>
                  <div style={{ padding: '10px 20px', background: 'var(--surface2)',
                    fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 600,
                    color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    {CATEGORY_LABELS[cat]} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>· {active.length}</span>
                  </div>
                  {[...active, ...visibleStocked].map(ing => {
                    const isStocked = stocked.includes(ing.foodId);
                    const itemKey = 'gen_' + (ing.foodId || ing.foodName);
                    return renderRow({
                      rowKey: itemKey,
                      itemKey: itemKey,
                      name: ing.foodName,
                      qty: ing.unknown ? ing.unit : formatQty(ing.qty, ing.unit),
                      badge: ing.unknown ? 'not in DB' : null,
                      isStocked: isStocked,
                      dim: isStocked,
                      onStock: ing.foodId ? () => toggleStocked(ing.foodId) : null,
                    });
                  })}
                </div>
              );
            })
          )}

          {/* ── Custom items (separate section, persists across sessions) ── */}
          <div style={{ borderTop: '3px solid var(--border)' }}>
            <div style={{ padding: '10px 20px', background: 'var(--surface2)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 600,
                color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Custom items <span style={{ color: 'var(--text3)', fontWeight: 400 }}>· {custom.length}</span>
              </span>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>non-food · stays on your list</span>
            </div>
            {custom.map(c => renderRow({
              rowKey: c.id,
              itemKey: 'cust_' + c.id,
              name: c.name,
              qty: c.qty || '',
              onDelete: () => removeCustomItem(c.id),
            }))}
            <div style={{ padding: '10px 20px' }}>
              {showAdd ? (
                <form onSubmit={addCustomItem} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input autoFocus value={addName} onChange={e => setAddName(e.target.value)}
                    placeholder="Item name (e.g. garbage bags)"
                    style={{ flex: 1, minWidth: 0, padding: '8px 10px', border: '1px solid var(--border)',
                      borderRadius: 6, fontSize: 13, outline: 'none', background: 'var(--bg)' }} />
                  <input value={addQty} onChange={e => setAddQty(e.target.value)}
                    placeholder="Qty"
                    style={{ width: 80, flexShrink: 0, padding: '8px 10px', border: '1px solid var(--border)',
                      borderRadius: 6, fontSize: 13, fontFamily: 'var(--mono)', outline: 'none', background: 'var(--bg)' }} />
                  <button type="submit"
                    style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6,
                      padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>Add</button>
                  <button type="button" onClick={() => { setShowAdd(false); setAddName(''); setAddQty(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 20, cursor: 'pointer', padding: '0 4px' }}>×</button>
                </form>
              ) : (
                <button onClick={() => setShowAdd(true)}
                  style={{ width: '100%', background: 'none', border: '1px dashed var(--border)',
                    borderRadius: 8, padding: '10px', fontFamily: 'var(--mono)', fontSize: 12,
                    fontWeight: 600, color: 'var(--text2)', cursor: 'pointer', letterSpacing: 0.5 }}>
                  + Add custom item
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clipboard fallback — this frame blocks the Clipboard API, so the list
            is offered as selectable text instead. prompt() is suppressed here. */}
        {copyText && (
          <div style={{ borderTop: '1px solid var(--border)', background: 'var(--amber-bg)', padding: '12px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--amber)', fontWeight: 600 }}>
                This frame blocks direct clipboard access — press {navigator.platform.indexOf('Mac') === 0 ? '⌘' : 'Ctrl'}+C to copy the selected text
              </span>
              <button onClick={() => setCopyText(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 17, cursor: 'pointer', padding: '0 4px', lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
            <textarea ref={copyAreaRef} readOnly value={copyText}
              onFocus={e => e.target.select()}
              style={{ width: '100%', height: 120, resize: 'vertical', padding: '10px 12px',
                border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)',
                color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.5, outline: 'none' }} />
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)',
          background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>
            {totalActive} to buy{totalStocked ? ` · ${totalStocked} stocked` : ''}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {doneCount > 0 && (
              <button onClick={clearChecked}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                  padding: '7px 12px', fontSize: 12, color: 'var(--text2)', cursor: 'pointer' }}>
                Uncheck all
              </button>
            )}
            {totalStocked > 0 && (
              <button onClick={clearStocked} title="Clear every in-stock mark"
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                  padding: '7px 12px', fontSize: 12, color: 'var(--text2)', cursor: 'pointer' }}>
                Clear stocked
              </button>
            )}
            {totalStocked > 0 && (
              <button onClick={() => setShowStocked(s => !s)}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                  padding: '7px 12px', fontSize: 12, color: 'var(--text2)', cursor: 'pointer' }}>
                {showStocked ? 'Hide stocked' : 'Show stocked'}
              </button>
            )}
            <button onClick={exportAsChecklist} disabled={totalActive === 0 && custom.length === 0}
              style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6,
                padding: '8px 14px', fontSize: 12, fontWeight: 600,
                opacity: (totalActive === 0 && custom.length === 0) ? 0.4 : 1,
                cursor: (totalActive === 0 && custom.length === 0) ? 'not-allowed' : 'pointer' }}>
              Export
            </button>
            <button onClick={copyToClipboard} disabled={totalActive === 0 && custom.length === 0}
              style={{ background: copied ? 'var(--text)' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6,
                padding: '8px 14px', fontSize: 12, fontWeight: 600, minWidth: 78, transition: 'background 0.15s',
                opacity: (totalActive === 0 && custom.length === 0) ? 0.4 : 1,
                cursor: (totalActive === 0 && custom.length === 0) ? 'not-allowed' : 'pointer' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.GroceryList = GroceryList;
