# Hardcoded Values Audit — FAZA 1.2

**Generat:** 2026-04-24  
**Scope:** `src/` (exclus `__tests__/`, `inject.js`, `adminPrefill.js` — dev-only, flag-gated)

---

## Summary

| Metric | Valoare |
|--------|---------|
| Total findings | 35 |
| Files affected | 12 |
| USER_DATA | 6 |
| TARGET | 12 |
| PATH | 3 |
| DATE | 8 |
| OTHER | 6 |

---

## Findings

### USER_DATA — Date biometrice hardcodate în engine

| # | Fișier | Linie | Valoare | Context |
|---|--------|-------|---------|---------|
| 1 | `src/engine/sys.js` | 6 | `HEIGHT: 183` | SYS object — înălțime cm |
| 2 | `src/engine/sys.js` | 7 | `START_KG: 111.4` | SYS object — greutate start |
| 3 | `src/engine/sys.js` | 8 | `START_BF: 23` | SYS object — %BF baseline din analiză foto |
| 4 | `src/engine/sys.js` | 9 | `AGE: 30` | SYS object — vârstă |
| 5 | `src/engine/coachContext.js` | 144–145 | `return 110.4` | Fallback current weight: `return dates.length > 0 ? weights[dates[0]] : 110.4;` / `catch { return 110.4; }` |
| 6 | `src/engine/coachContext.js` | 23 | `targetWeight: 101.5` | Hardcodat în context object, nu importă `TW_KG` din constants |

```js
// sys.js:5-9
export const SYS = {
  HEIGHT: 183,
  START_KG: 111.4,
  START_BF: 23,
  AGE: 30,
```

```js
// coachContext.js:144-145
return dates.length > 0 ? weights[dates[0]] : 110.4;
} catch { return 110.4; }
```

---

### TARGET — Valori nutritionale/greutate inline (în loc de import din constants)

`src/constants.js` are sursa de adevăr (`KCAL_TARGET=1800`, `PROT_TARGET=180`, `TW_KG=101.5`), dar sunt duplicate inline în 12 locuri:

| # | Fișier | Linie | Valoare | Context |
|---|--------|-------|---------|---------|
| 7 | `src/engine/readiness.js` | 67 | `1800, 180` | `window.__constants \|\| { KCAL_TARGET: 1800, PROT_TARGET: 180 }` — fallback duplicat |
| 8 | `src/engine/proactiveEngine.js` | 153 | `1800` | `if (avgKcal < 1800)` — nu folosește `KCAL_TARGET` |
| 9 | `src/engine/proactiveEngine.js` | 157 | `1800` | Text mesaj: `` `Sub 1800 kcal — risc...` `` |
| 10 | `src/engine/reality.js` | 53 | `1800` | String: `'Menții 1800 kcal ✓'` |
| 11 | `src/engine/reality.js` | 77 | `1800` | String: `'Menții 1800 kcal fix până 20 iulie ✓'` |
| 12 | `src/pages/coach/renderIdle.js` | 177 | `1800, 180` | `getReadinessScore(..., 1800, 180)` — nu importă constants |
| 13 | `src/pages/weight.js` | 746 | `1800` | `const kcalTarget = 1800` — variabilă locală |
| 14 | `src/pages/dashboard.js` | 458 | `101.5` | `dates.map(() => 101.5)` — nu folosește `TW_KG` |
| 15 | `src/pages/dashboard.js` | 482 | `101.5` | Label: `'Target 101.5 kg'` hardcodat |
| 16 | `src/pages/dashboard.js` | 540 | `180` | `` `Deficit ${180 - todProt}g` `` — nu folosește `PROT_TARGET` |
| 17 | `src/pages/dashboard.js` | 541 | `180` | String: `'180g+ esențial'` |
| 18 | `src/pages/plan.js` | 52–53 | `180` | `todProt>=180` + `'g / target 180g'` — nu importă `PROT_TARGET` |

---

### PATH — Firebase paths duplicate

| # | Fișier | Linie | Valoare | Context |
|---|--------|-------|---------|---------|
| 19 | `src/firebase.js` | 5–6 | `FIREBASE_URL` + `USER_PATH = 'users/daniel'` | Sursă de adevăr — OK aici |
| 20 | `src/util/dataCleanup.js` | 127–128 | `FIREBASE_URL` + `USER_PATH = 'users/daniel'` | Duplicat — nu importă din `firebase.js` |
| 21 | `src/util/dataCleanup.js` | 206–207 | `FIREBASE_URL` + `USER_PATH = 'users/daniel'` | Al doilea duplicat în același fișier |

```js
// dataCleanup.js:126-130 (duplicat de 2 ori)
const FIREBASE_URL = 'https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app';
const USER_PATH = 'users/daniel';
```

---

### DATE — TARGET_DATE inline în loc de import din constants

`src/constants.js:5` exportă `TARGET_DATE = new Date('2026-07-20')`, dar e ignorat în:

| # | Fișier | Linie | Context |
|---|--------|-------|---------|
| 22 | `src/engine/sys.js` | 85 | `const PILOT_DATE = new Date('2026-07-20')` |
| 23 | `src/engine/sys.js` | 135 | `new Date() >= new Date('2026-07-20')` |
| 24 | `src/engine/sys.js` | 265 | `new Date() < new Date('2026-07-20')` |
| 25 | `src/engine/dp.js` | 152 | `new Date() < new Date('2026-07-20')` |
| 26 | `src/engine/dp.js` | 253 | `new Date() < new Date('2026-07-20')` |
| 27 | `src/engine/dp.js` | 291 | `new Date() < new Date('2026-07-20')` |
| 28 | `src/engine/dp.js` | 317 | `new Date() < new Date('2026-07-20')` |
| 29 | `src/engine/dp.js` | 344 | `new Date() < new Date('2026-07-20')` |

Notă: `src/engine/coachContext.js:8` e OK — creează `july20_2026` local și o folosește consistent în același fișier.

---

### OTHER — Comentarii cu nume propriu în codul de producție

| # | Fișier | Linie | Context |
|---|--------|-------|---------|
| 30 | `src/engine/dp.js` | 56 | `// Daniel: Lat Pulldown 64, Cable Row 72...` — calibrare MAX_KG |
| 31 | `src/engine/dp.js` | 65 | `// per ganteră — Daniel face 20-22kg` |
| 32 | `src/engine/sys.js` | 23 | `// Refined for athletic males + age correction` — gender locked |
| 33 | `src/engine/sys.js` | 24 | `-16.2` în formula Deurenberg — constanta pentru bărbați |
| 34 | `src/engine/sys.js` | 32 | `// Calibrate from start: if started at 23% with 111.4kg` — comentariu cu date personale |
| 35 | `src/engine/adherence.js` | 26 | `prots[today] >= 150` — threshold ≠ PROT_TARGET, hardcodat la 150 (83% din 180g) |

---

## Files Affected

| Fișier | Findings | Categorii |
|--------|----------|-----------|
| `src/constants.js` | — | Sursă de adevăr ✓ |
| `src/firebase.js` | 1 | PATH (sursă) |
| `src/engine/sys.js` | 7 | USER_DATA (4) + DATE (3) |
| `src/engine/coachContext.js` | 2 | USER_DATA |
| `src/engine/dp.js` | 7 | DATE (5) + OTHER (2) |
| `src/engine/readiness.js` | 1 | TARGET |
| `src/engine/proactiveEngine.js` | 2 | TARGET |
| `src/engine/reality.js` | 2 | TARGET |
| `src/engine/adherence.js` | 1 | OTHER |
| `src/pages/coach/renderIdle.js` | 1 | TARGET |
| `src/pages/weight.js` | 1 | TARGET |
| `src/pages/dashboard.js` | 4 | TARGET |
| `src/pages/plan.js` | 2 | TARGET |
| `src/util/dataCleanup.js` | 2 | PATH |

---

## Recommendations

### Imediat — FAZA 1.2 (fără breaking changes)

**1. `src/engine/sys.js` → extrage bio în `src/config/user.js`**

```js
// src/config/user.js (nou)
export const USER = {
  HEIGHT_CM: 183,
  START_KG:  111.4,
  START_BF:  23,
  AGE:       30,
};
```

`sys.js` importă `USER` și înlocuiește cele 4 literale. Zero breaking changes.

**2. `src/engine/coachContext.js:23` — înlocuiește `101.5` cu `TW_KG`**

```js
import { TW_KG } from '../constants.js';
// ...
targetWeight: TW_KG,
```

**3. `src/engine/coachContext.js:144-145` — fallback current weight**

Înlocuiește `110.4` cu `USER.START_KG` din `config/user.js`. E o valoare de fallback rezonabilă (ultimul weight cunoscut).

**4. `src/engine/dp.js` + `src/engine/sys.js` — importă `TARGET_DATE` din constants**

8 locuri cu `new Date('2026-07-20')` → `import { TARGET_DATE } from '../constants.js'` + folosește direct.

**5. `src/util/dataCleanup.js` — importă din `firebase.js`**

```js
import { FIREBASE_URL, USER_PATH } from '../firebase.js';
```

Necesită export în `firebase.js` (sunt `const` private acum).

**6. Inline TARGET/PROT duplicates în pages**

- `renderIdle.js:177` → `import { KCAL_TARGET, PROT_TARGET } from '../../constants.js'`
- `weight.js:746` → folosește `KCAL_TARGET` importat (deja importat la linia 3)
- `dashboard.js:458,482,540,541` → folosește `TW_KG`, `PROT_TARGET` (deja importate)
- `plan.js:52-53` → `import { PROT_TARGET }` + folosește variabila
- `adherence.js:26` → consideră dacă `150` e intentional (≠ PROT_TARGET) sau bug

**7. Comentarii "Daniel" în cod**

`dp.js:56,65` + `sys.js:32,34` — înlocuiește cu comentarii generic (`// calibrated on user baseline`). Nu afectează comportamentul.

---

### FAZA 4+ — Multi-tenancy real

**Firebase path `users/daniel`** → `users/${uid}` (auth UID)  
**SYS.HEIGHT, AGE, START_BF, START_KG** → citit din profil Firebase per user  
**KCAL_TARGET, PROT_TARGET** → per-user în Firebase, cu defaults în `config/`  
**TARGET_DATE, START_DATE** → per-goal în Firebase  

---

### Ce NU se atinge acum

- `src/inject.js` — dev tool, flag-gated (`DEV_INJECT_BASELINE`)
- `src/util/adminPrefill.js` — dev tool, flag-gated
- `src/engine/sys.js:24` — formula `-16.2` e constanta Deurenberg pentru bărbați, nu date personale
- `src/engine/proactiveEngine.js:19` — `bodyweightKg * 2.2` e formula standard g/kg proteină

---

## Prioritate execuție

| Prioritate | Task | Effort | Impact |
|------------|------|--------|--------|
| HIGH | Creează `config/user.js` + update `sys.js` | 30min | Elimină 4 USER_DATA |
| HIGH | `coachContext.js` — folosește `TW_KG` + `USER.START_KG` | 5min | Elimină 2 USER_DATA |
| HIGH | `dp.js` + `sys.js` — importă `TARGET_DATE` | 15min | Elimină 8 DATE |
| MEDIUM | `dataCleanup.js` — exportă + importă din `firebase.js` | 10min | Elimină 2 PATH dup |
| MEDIUM | Pages inline constants (`renderIdle`, `weight`, `dashboard`, `plan`) | 20min | Elimină 7 TARGET |
| LOW | Comentarii "Daniel" → generic | 5min | Clean code |
| LOW | `adherence.js:26` — verifică dacă `150` e intentional | 5min | Audit |
