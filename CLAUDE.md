# Macro Tracker

Single-page React 18 app with no build step. `index.html` loads React, ReactDOM
and Babel from unpkg; Babel compiles the JSX in the browser. The other files are
`data.js` (seed foods, seed recipes, diet plans, helpers), `FoodDatabase.jsx`,
`GroceryList.jsx` and `tweaks-panel.jsx`. The site is served by GitHub Pages
from the repository root on `main`. Keep this single-file setup unless the owner
asks otherwise.

## User data rules (mandatory)

All user data lives in the browser's `localStorage`. These rules apply to every
change:

1. **Stored data is the source of truth.** Data saved from the app must never be
   overwritten by a code deploy. That covers the log, goals, foods, recipes,
   stock marks, grocery check-offs and custom grocery items.
2. **Migrations only add missing items or fix broken fields.** A migration must
   never replace a value the user could have edited, such as a macro, quantity,
   name or goal. Each migration has a unique versioned flag
   (`migration_<name>_v1`), must be idempotent, and goes in the `MIGRATIONS`
   array in `index.html`. Never reuse or rename a flag.
3. **Seeds only fill gaps.** A seed food or recipe in `data.js` is added only if
   its ID has never been offered before (recorded in `macroseeded_v1`) and is not
   in storage. If the ID exists in storage, the stored version wins, and seed
   items the user deleted are not re-added. Editing an existing seed changes new
   installs only. To change an existing user's item, ask the owner first, and
   never do it silently in code.
4. **Back up before changing anything.** On load, before seed fill or
   migrations, every `macro*` key is copied to `macrobackup_v1` as
   `{ savedAt, data: { key: rawString } }`. If the backup fails, nothing runs.
   Do not remove or bypass this step.

Code that writes to `localStorage` outside a user action is a bug. Exception:
the load sequence in `index.html` (`protectAndUpgradeData`).

## Storage keys

| Key | Contents |
|---|---|
| `macrolog_v1` | `{ "YYYY-MM-DD": [ { time, items[] } ] }` (logged items are snapshots) |
| `macrogoals_v1` | `{ cal, p, c, f, s, fat }` |
| `macrofooddb_v1` | ingredients array |
| `macrorecipes_v1` | recipes array (totals are derived live from `lineItems`) |
| `macrostocked_v1` | food IDs marked in stock |
| `macrogrocery_checked_v1` | grocery check-offs, grouped by day × days |
| `macrogrocery_custom_v1` | custom grocery items |
| `macroseeded_v1` | `{ foods: [ids], recipes: [ids] }` seed IDs already offered |
| `macrobackup_v1` | snapshot taken before the last seed fill or migration run |
| `migration_*` | migration flags (`'done'`) |

Macro fields: `cal`, `p` protein, `c` carbs, `f` fiber, `s` sugar, `fat`.

## Dates

Date keys are local calendar dates. Use `localDateKey(d)` and `todayKey()` from
`data.js`, never `toISOString().slice(0, 10)`, which returns the UTC date.

## Adding things

- **New food or recipe for everyone:** add it to `FOOD_DB` or `RECIPES` with a
  new, unique ID. The seed fill adds it on the next load.
- **Fixing a broken field for existing users:** add a migration that only touches
  records where the field is missing or clearly invalid.
- **Verify** every data change by loading the app with an existing store: edit
  data in the UI, deploy the change, reload, and confirm the edits are unchanged.
