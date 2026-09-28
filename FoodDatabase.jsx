// FoodDatabase.jsx — Ingredient + Recipe management
// Exported to window for use in main app

const { useState: _useState, useMemo: _useMemo, useRef: _useRef } = React;

// ─── parsePortion ─────────────────────────────────────────────────────────────
function parsePortion(portion) {
  if (!portion) return { baseQty: 1, unit: '' };
  const m = String(portion).match(/^([\d.]+)\s*(.+?)(\s*\(.*\))?$/);
  if (m) return { baseQty: parseFloat(m[1]) || 1, unit: m[2].trim() };
  return { baseQty: 1, unit: portion };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9); }
function r1x(n) { return Math.round((n || 0) * 10) / 10; }

const MACRO_FIELDS = [
  { key: 'cal', label: 'Calories', unit: 'kcal', color: '#1a6bb5' },
  { key: 'p',   label: 'Protein',  unit: 'g',    color: '#00895a' },
  { key: 'c',   label: 'Carbs',    unit: 'g',    color: '#b85c00' },
  { key: 'f',   label: 'Fiber',    unit: 'g',    color: '#6a5acd' },
  { key: 's',   label: 'Sugars',   unit: 'g',    color: '#c0396b' },
  { key: 'fat', label: 'Fat',      unit: 'g',    color: '#6b6b63' },
];

function macroSum(items, foodDB) {
  const z = { cal: 0, p: 0, c: 0, f: 0, s: 0, fat: 0 };
  items.forEach(({ foodId, mult, enteredQty, foodPortion }) => {
    const food = foodDB.find(f => f.id === foodId);
    if (!food) return;
    // use enteredQty/baseQty if available, else fall back to mult
    const effectiveMult = (enteredQty !== undefined && foodPortion)
      ? (enteredQty / (parsePortion(foodPortion).baseQty || 1))
      : (mult || 1);
    z.cal += (food.cal || 0) * effectiveMult;
    z.p   += (food.p   || 0) * effectiveMult;
    z.c   += (food.c   || 0) * effectiveMult;
    z.f   += (food.f   || 0) * effectiveMult;
    z.s   += (food.s   || 0) * effectiveMult;
    z.fat += (food.fat || 0) * effectiveMult;
  });
  return z;
}

// ─── Modal Shell ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, width = 500, children, footer }) {
  return (
    <div className="modal-wrap" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ background: 'var(--surface)', borderRadius: 10, width, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--text2)', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface2)' }}>{footer}</div>}
      </div>
    </div>
  );
}

function Field({ label, unit, value, onChange, type = 'number', step = '0.1', wide }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: wide ? '1 1 100%' : '1 1 calc(33% - 8px)', minWidth: 80 }}>
      <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}{unit && <span style={{ fontWeight: 400 }}> ({unit})</span>}</label>
      <input type={type} value={value} step={step} onChange={e => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontFamily: type === 'number' ? 'var(--mono)' : 'var(--sans)', fontSize: 13, outline: 'none', background: 'var(--bg)', width: '100%' }} />
    </div>
  );
}

// ─── IngredientModal ──────────────────────────────────────────────────────────
function IngredientModal({ ingredient, onSave, onClose }) {
  const isNew = !ingredient;
  const [form, setForm] = _useState(ingredient ? { ...ingredient } : { id: uid(), name: '', portion: '100 g', cal: 0, p: 0, c: 0, f: 0, s: 0, fat: 0 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function save() {
    if (!form.name.trim()) return alert('Name required');
    onSave(form);
    onClose();
  }

  return (
    <Modal title={isNew ? 'New Ingredient' : `Edit — ${ingredient.name}`} onClose={onClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 6, background: 'none', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} style={{ padding: '8px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            {isNew ? 'Add Ingredient' : 'Save Changes'}
          </button>
        </div>
      }>
      <div style={{ padding: 20, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Field label="Name" type="text" value={form.name} onChange={v => set('name', v)} wide step={undefined} />
        <Field label="Portion size" type="text" value={form.portion} onChange={v => set('portion', v)} wide step={undefined} />
        {MACRO_FIELDS.map(({ key, label, unit }) => (
          <Field key={key} label={label} unit={unit} value={form[key]} onChange={v => set(key, v)} />
        ))}
      </div>
      <div style={{ margin: '0 20px 16px', padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
        Estimated from macros: {r1x(form.p * 4 + form.c * 4 + form.fat * 9)} kcal &nbsp;·&nbsp; entered: {form.cal} kcal
      </div>
    </Modal>
  );
}

// ─── Ingredient row picker inside recipe builder ───────────────────────────────
function IngredientPicker({ foodDB, lineItems, onChange, onAddIngredient }) {
  const [search, _setSearch] = _useState('');
  const [dropOpen, setDropOpen] = _useState(false);
  const [activeIdx, setActiveIdx] = _useState(null); // which line is being searched

  const filtered = foodDB.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).slice(0, 20);

  function openSearch(idx) { setActiveIdx(idx); _setSearch(''); setDropOpen(true); }

  function pick(idx, food) {
    const parsed = parsePortion(food.portion);
    const n = [...lineItems];
    n[idx] = { ...n[idx], foodId: food.id, foodName: food.name, foodPortion: food.portion, enteredQty: parsed.baseQty, unit: parsed.unit, mult: 1 };
    onChange(n);
    setDropOpen(false);
    setActiveIdx(null);
  }

  function addLine() { onChange([...lineItems, { id: uid(), foodId: null, foodName: '', foodPortion: '', enteredQty: 1, unit: '' }]); }
  function removeLine(idx) { onChange(lineItems.filter((_, i) => i !== idx)); }
  function setQty(idx, v) {
    const n = [...lineItems];
    const parsed = parsePortion(n[idx].foodPortion);
    const qty = parseFloat(v) || 0;
    n[idx] = { ...n[idx], enteredQty: qty, mult: qty / (parsed.baseQty || 1) };
    onChange(n);
  }

  return (
    <div>
      {lineItems.map((line, idx) => (
        <div key={line.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 24px', gap: 8, alignItems: 'center', padding: '8px 20px', borderBottom: '1px solid var(--border)' }}>
          {/* Food selector */}
          <div style={{ position: 'relative' }}>
            <div onClick={() => openSearch(idx)}
              style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, cursor: 'pointer', background: 'var(--bg)', color: line.foodId ? 'var(--text)' : 'var(--text3)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{line.foodName || 'Select ingredient…'}</span>
              {line.foodPortion && <span style={{ color: 'var(--text3)', fontSize: 11, fontFamily: 'var(--mono)' }}>{line.foodPortion}</span>}
            </div>
            {dropOpen && activeIdx === idx && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, zIndex: 100, boxShadow: 'var(--shadow)', maxHeight: 220, overflowY: 'auto' }}>
                <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--surface)' }}>
                  <input autoFocus value={search} onChange={e => _setSearch(e.target.value)}
                    placeholder="Search…"
                    style={{ width: '100%', padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, outline: 'none', background: 'var(--bg)' }} />
                </div>
                {filtered.map(food => (
                  <div key={food.id} onClick={() => pick(idx, food)}
                    style={{ padding: '8px 10px', cursor: 'pointer', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span>{food.name}</span>
                    <span style={{ color: 'var(--text3)', fontSize: 10, fontFamily: 'var(--mono)' }}>{food.portion}</span>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>No results for "{search}"</div>
                    <button onClick={() => { onAddIngredient(search, idx, pick); setDropOpen(false); }}
                      style={{ width: '100%', padding: '7px 0', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      + Add "{search}" as new ingredient
                    </button>
                  </div>
                )}
                <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border)', position: 'sticky', bottom: 0, background: 'var(--surface)' }}>
                  <button onClick={() => { onAddIngredient(search, idx, pick); setDropOpen(false); }}
                    style={{ width: '100%', padding: '6px 0', border: '1px dashed var(--border)', borderRadius: 6, fontSize: 11, color: 'var(--text2)', cursor: 'pointer', background: 'none' }}>
                    + New ingredient…
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Smart qty input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', background: 'var(--bg)' }}>
            <input type="number" min={0} step={parsePortion(line.foodPortion).unit === 'g' || parsePortion(line.foodPortion).unit === 'ml' ? 10 : 0.5}
              value={line.enteredQty ?? parsePortion(line.foodPortion).baseQty}
              onChange={e => setQty(idx, e.target.value)}
              style={{ width: 58, padding: '5px 8px', border: 'none', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, outline: 'none', background: 'transparent', textAlign: 'right' }} />
            {line.unit && (
              <span style={{ padding: '5px 8px 5px 2px', fontSize: 11, color: 'var(--text2)', borderLeft: '1px solid var(--border)', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>
                {line.unit}
              </span>
            )}
          </div>
          <button onClick={() => removeLine(idx)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 16, cursor: 'pointer', padding: 0, textAlign: 'center' }}>×</button>
        </div>
      ))}
      <div style={{ padding: '10px 20px' }}>
        <button onClick={addLine} style={{ padding: '7px 14px', border: '1px dashed var(--border)', borderRadius: 6, background: 'none', fontSize: 12, color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
          + Add ingredient
        </button>
      </div>
    </div>
  );
}

// ─── RecipeModal ───────────────────────────────────────────────────────────────
function RecipeModal({ recipe, foodDB, onSave, onAddToFoodDB, onClose }) {
  const isNew = !recipe;
  const [name, setName] = _useState(recipe?.name || '');
  const [portion, setPortion] = _useState(recipe?.portion || '1 portion');
  const [lineItems, setLineItems] = _useState(
    recipe?.lineItems || [{ id: uid(), foodId: null, foodName: '', foodPortion: '', mult: 1 }]
  );
  const [manualMacros, setManualMacros] = _useState(recipe?.lineItems ? false : !!recipe);
  const [manualForm, setManualForm] = _useState({ cal: recipe?.cal || 0, p: recipe?.p || 0, c: recipe?.c || 0, f: recipe?.f || 0, s: recipe?.s || 0, fat: recipe?.fat || 0 });

  // Inline ingredient creator state
  const [inlineIngr, setInlineIngr] = _useState(null); // { defaultName, onPick }

  const calcTotals = _useMemo(() => macroSum(lineItems.filter(l => l.foodId), foodDB), [lineItems, foodDB]);
  const totals = manualMacros ? manualForm : calcTotals;

  function handleAddIngredient(defaultName, lineIdx, pickFn) {
    setInlineIngr({ defaultName, lineIdx, pickFn });
  }

  function handleInlineSave(newFood) {
    onAddToFoodDB(newFood);
    if (inlineIngr?.pickFn) inlineIngr.pickFn(inlineIngr.lineIdx, newFood);
    setInlineIngr(null);
  }

  function save() {
    if (!name.trim()) return alert('Recipe name required');
    const macros = manualMacros ? manualForm : calcTotals;
    onSave({
      id: recipe?.id || uid(),
      name: name.trim(),
      portion,
      lineItems: manualMacros ? undefined : lineItems.filter(l => l.foodId),
      ...macros
    });
    onClose();
  }

  const setM = (k, v) => setManualForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <Modal title={isNew ? 'New Recipe' : `Edit — ${recipe.name}`} onClose={onClose} width={560}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={manualMacros} onChange={e => setManualMacros(e.target.checked)} />
              Override macros manually
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 6, background: 'none', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} style={{ padding: '8px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                {isNew ? 'Create Recipe' : 'Save Changes'}
              </button>
            </div>
          </div>
        }>

        {/* Name + portion */}
        <div style={{ padding: '16px 20px 12px', display: 'flex', gap: 12, borderBottom: '1px solid var(--border)' }}>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>Recipe Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tomato Egg Dish"
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, outline: 'none', background: 'var(--bg)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>Portion size</label>
            <input value={portion} onChange={e => setPortion(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, outline: 'none', background: 'var(--bg)' }} />
          </div>
        </div>

        {/* Ingredient lines or manual macros */}
        {manualMacros ? (
          <div style={{ padding: 20, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {MACRO_FIELDS.map(({ key, label, unit }) => (
              <Field key={key} label={label} unit={unit} value={manualForm[key]} onChange={v => setM(key, v)} />
            ))}
          </div>
        ) : (
          <>
            <div style={{ padding: '10px 20px 6px', display: 'grid', gridTemplateColumns: '1fr 90px 24px', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ingredient</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' }}>Amount</span>
              <span />
            </div>
            <IngredientPicker foodDB={foodDB} lineItems={lineItems} onChange={setLineItems} onAddIngredient={handleAddIngredient} />
          </>
        )}

        {/* Calculated macros preview */}
        {!manualMacros && (
          <div style={{ margin: '0 20px 16px', padding: '12px 14px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Calculated Totals</div>
            <div className="recipe-totals" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 4 }}>
              {MACRO_FIELDS.map(({ key, label, unit, color }) => (
                <div key={key} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color }}>{r1x(calcTotals[key])}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Inline ingredient creator */}
      {inlineIngr && (
        <IngredientModal
          ingredient={{ id: uid(), name: inlineIngr.defaultName, portion: '100 g', cal: 0, p: 0, c: 0, f: 0, s: 0, fat: 0 }}
          onSave={handleInlineSave}
          onClose={() => setInlineIngr(null)}
        />
      )}
    </>
  );
}

// ─── FoodDatabase screen ───────────────────────────────────────────────────────
function FoodDatabase({ foodDB, setFoodDB, recipes, setRecipes }) {
  const [tab, setTab] = _useState('ingredients');
  const [search, setSearch] = _useState('');
  const [sort, setSort] = _useState('name');
  const [editIngredient, setEditIngredient] = _useState(null);
  const [showNewIngredient, setShowNewIngredient] = _useState(false);
  const [editRecipe, setEditRecipe] = _useState(null);
  const [showNewRecipe, setShowNewRecipe] = _useState(false);
  const [confirmDelete, setConfirmDelete] = _useState(null);

  const items = tab === 'ingredients' ? foodDB : recipes;
  const filtered = items
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : (b[sort] || 0) - (a[sort] || 0));

  function saveIngredient(food) {
    setFoodDB(db => db.find(f => f.id === food.id) ? db.map(f => f.id === food.id ? food : f) : [...db, food]);
  }
  function deleteIngredient(id) {
    setFoodDB(db => db.filter(f => f.id !== id));
    setConfirmDelete(null);
  }

  function saveRecipe(rec) {
    setRecipes(rs => rs.find(r => r.id === rec.id) ? rs.map(r => r.id === rec.id ? rec : r) : [...rs, rec]);
  }
  function deleteRecipe(id) {
    setRecipes(rs => rs.filter(r => r.id !== id));
    setConfirmDelete(null);
  }

  function addToFoodDB(food) {
    setFoodDB(db => db.find(f => f.id === food.id) ? db : [...db, food]);
  }

  const cols = tab === 'ingredients'
    ? [{ key: 'name', label: 'Item', w: '1fr' }, { key: 'portion', label: 'Portion', w: '90px' }, { key: 'cal', label: 'kcal', w: '64px' }, { key: 'p', label: 'Prot', w: '56px' }, { key: 'c', label: 'Carbs', w: '56px' }, { key: 'f', label: 'Fiber', w: '56px' }, { key: 's', label: 'Sugar', w: '56px' }, { key: 'fat', label: 'Fat', w: '56px' }, { key: '_actions', label: '', w: '64px' }]
    : [{ key: 'name', label: 'Recipe', w: '1fr' }, { key: 'portion', label: 'Portion', w: '100px' }, { key: 'cal', label: 'kcal', w: '64px' }, { key: 'p', label: 'Prot', w: '56px' }, { key: 'c', label: 'Carbs', w: '56px' }, { key: 'f', label: 'Fiber', w: '56px' }, { key: 's', label: 'Sugar', w: '56px' }, { key: 'fat', label: 'Fat', w: '56px' }, { key: '_actions', label: '', w: '64px' }];

  const gridTemplate = cols.map(c => c.w).join(' ');

  return (
    <div className="page" style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>Reference</div>
          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 2 }}>Food Database</div>
        </div>
        <button onClick={() => tab === 'ingredients' ? setShowNewIngredient(true) : setShowNewRecipe(true)}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + {tab === 'ingredients' ? 'New Ingredient' : 'New Recipe'}
        </button>
      </div>

      <div className="db-toolbar" style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
          style={{ flex: 1, maxWidth: 300, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, outline: 'none', background: 'var(--surface)' }} />
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', background: 'var(--surface)' }}>
          {['ingredients', 'recipes'].map(t => (
            <button key={t} onClick={() => { setTab(t); setSearch(''); setSort('name'); }}
              style={{ padding: '7px 18px', border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text2)' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{filtered.length} items</span>
      </div>

      <div className="db-card" style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        {/* Header */}
        <div className="db-row" style={{ display: 'grid', gridTemplateColumns: gridTemplate, gap: '0 8px', padding: '10px 16px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
          {cols.map(c => c.key === '_actions' ? <div key="_a" /> : (
            <button key={c.key} onClick={() => c.key !== 'portion' && setSort(c.key)}
              style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 700, color: sort === c.key ? 'var(--accent)' : 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: c.key === 'name' ? 'left' : 'right', background: 'none', border: 'none', cursor: c.key !== 'portion' ? 'pointer' : 'default', padding: 0 }}>
              {c.label}{sort === c.key ? ' ↓' : ''}
            </button>
          ))}
        </div>

        <div className="db-scroll" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
          {filtered.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No items found.</div>
          )}
          {filtered.map((item, i) => {
            // for recipes with lineItems, show calculated macros
            const macros = item.lineItems ? macroSum(item.lineItems, foodDB) : item;
            return (
              <div key={item.id} className="db-row" style={{ display: 'grid', gridTemplateColumns: gridTemplate, gap: '0 8px', padding: '10px 16px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</span>
                  {item.lineItems && <span style={{ fontSize: 10, color: 'var(--accent)', marginLeft: 6, fontFamily: 'var(--mono)' }}>{item.lineItems.length} ingr.</span>}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)', textAlign: 'right' }}>{item.portion}</span>
                {['cal','p','c','f','s','fat'].map(k => (
                  <span key={k} style={{ fontFamily: 'var(--mono)', fontSize: 12, textAlign: 'right', color: (macros[k] || 0) === 0 ? 'var(--text3)' : 'var(--text)' }}>
                    {r1x(macros[k] || 0)}
                  </span>
                ))}
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button onClick={() => tab === 'ingredients' ? setEditIngredient(item) : setEditRecipe(item)}
                    style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: 'var(--text2)' }}>
                    Edit
                  </button>
                  <button onClick={() => setConfirmDelete({ id: item.id, name: item.name, type: tab })}
                    style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 6px', fontSize: 11, cursor: 'pointer', color: 'var(--red)' }}>
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showNewIngredient && <IngredientModal onSave={saveIngredient} onClose={() => setShowNewIngredient(false)} />}
      {editIngredient && <IngredientModal ingredient={editIngredient} onSave={saveIngredient} onClose={() => setEditIngredient(null)} />}
      {showNewRecipe && <RecipeModal foodDB={foodDB} onSave={saveRecipe} onAddToFoodDB={addToFoodDB} onClose={() => setShowNewRecipe(false)} />}
      {editRecipe && <RecipeModal recipe={editRecipe} foodDB={foodDB} onSave={saveRecipe} onAddToFoodDB={addToFoodDB} onClose={() => setEditRecipe(null)} />}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="modal-wrap" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-box" style={{ background: 'var(--surface)', borderRadius: 10, padding: 24, width: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Delete "{confirmDelete.name}"?</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 20 }}>This cannot be undone.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 6, background: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => confirmDelete.type === 'ingredients' ? deleteIngredient(confirmDelete.id) : deleteRecipe(confirmDelete.id)}
                style={{ padding: '8px 16px', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export to window
Object.assign(window, { FoodDatabase });
