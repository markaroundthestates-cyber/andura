# TASK 3 — LOCK 8 KCAL_FLOOR informative toast pe import flow

**Track:** P4 Track 2 fix 3 (per `ANDURA_PRIMER.md` §6).
**Category:** SAFETY + UX tactical.
**Atomic commit type:** `feat(import-nutritie):` sau `fix(safety):`.

## Intent

Per `DECISIONS.md §D-LEGACY-041` LOCK 8 Kcal Floor 1200 Bayesian Nutrition observation filter — engine-side filter LANDED (commit `51728bc`). Acum trebuie surfaced la UI nivel cu **informative toast** când import MFP/JSON conține kcal valori sub 1200/zi.

**Anti-paternalism ABSOLUTE invariant (`DECISIONS.md §D-LEGACY-061`):**
- Toast = **informează NU block** save.
- User decide ce face cu info.
- Engine internal filtrează valorile observation pentru Bayesian update (engine logic deja LANDED) — UI toast = transparent user notification ZERO override decision.

## Spec engine wire (verbatim D-LEGACY-041 + D-LEGACY-061)

> Engine Bayesian Nutrition (Engine #3) filter `KCAL_FLOOR_VALIDATION = 1200`: dacă observation `dailyKcal < 1200` → engine NU folosește valoarea pentru Kalman update (potential data corruption / underreport flag). Save raw în log invariant — engine doar skip update.

UI surface:
> La import flow finalizat (CSV/JSON MFP sau manual log), dacă pipeline detectează valori `kcal < 1200` în dataset import → toast informative:
> *"Am observat zile cu < 1200 kcal. Coach-ul exclude acele zile din calibrare (poate fi underreport). Datele rămân salvate."*
> Toast 4-5 sec, dismiss-on-tap, ZERO block save flow.

## Discovery (CC autonomous)

1. **Locate import flow în prod:** `grep -rn "importMFP\|triggerMFPImport\|csvImport\|importNutrition" src/` → identifică funcție(le) import.
2. **Locate Bayesian engine filter:** `grep -rn "KCAL_FLOOR\|1200" src/engines/ src/coach/` → confirmă engine-side LANDED + valoarea exactă (1200).
3. **Locate toast utility:** `grep -rn "showToast\|toastShow\|function.*toast" src/` → identifică toast UI function existing.
4. **Read commit `51728bc`:** `git show 51728bc --stat` + `git show 51728bc` → context engine implementation pentru wire UI corespondent.

## Fix concret

În funcția import (e.g., `src/pages/weight.js` `triggerMFPImport` sau `src/import/mfpImporter.js`):
```js
// După parse CSV/JSON, înainte return:
const lowKcalDays = parsedData.filter(d => d.kcal > 0 && d.kcal < KCAL_FLOOR);
if (lowKcalDays.length > 0) {
  showToast(
    `Am observat ${lowKcalDays.length} zile cu < ${KCAL_FLOOR} kcal. ` +
    `Coach-ul exclude acele zile din calibrare (poate fi underreport). ` +
    `Datele rămân salvate.`,
    { duration: 5000, dismissible: true }
  );
}
// Continue normal save flow — ZERO block.
```

**Constant import:**
```js
import { KCAL_FLOOR } from '../engines/bayesianNutrition.js'; // path real CC discovery
// sau dacă constant nu exportat → export adăugat în bayesianNutrition.js (single-line export, NU refactor)
```

## Wording final user-facing

Wording draft above e provisional. Per `DECISIONS.md §D009` CEO scope strict UI wording autonomous compose = SLIP DEFAULT → flag în `📤_outbox/LATEST.md §Wording-review-pending` pentru Daniel CEO review (TASK 7).

CC tactical: implementă cu wording draft above ca placeholder funcțional, MARCAȚI explicit în comment cod:
```js
// TODO(CEO-review): wording draft, pending Daniel review TASK 7 wording inventory.
showToast(...)
```

## Acceptance criteria

- [x] Toast wired la finalizarea import flow când detect kcal < KCAL_FLOOR în dataset.
- [x] ZERO block save — toast informative pure (UX flow continuă identic).
- [x] Constant `KCAL_FLOOR` importat din engine source NU hardcoded literal 1200 (single source of truth).
- [x] Anti-paternalism preserved per `D-LEGACY-061`.
- [x] Wording marcat `TODO(CEO-review)` pentru TASK 7 review batch.
- [x] Tests baseline preserved 3734 PASS (TASK 4 adaugă unit test pentru această logică).
- [x] Atomic commit conventional: `feat(import-nutritie): wire LOCK 8 kcal floor informative toast (anti-paternalism preserved)`.

## Files atinse

- `src/pages/weight.js` (sau `src/import/*.js` — discovery).
- Eventual `src/engines/bayesianNutrition.js` (export `KCAL_FLOOR` dacă încă nu exportat).
- ZERO mockup modificat.

## Raport per task

```
TASK 3 ✓/✗ — <commit hash>
- Files: <list>
- KCAL_FLOOR constant source: <path:line>
- Import flow location: <path:function>
- Wording flagged TODO(CEO-review): yes
- Tests preserved: 3734 PASS ✓
```
