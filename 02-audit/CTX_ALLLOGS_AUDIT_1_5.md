# ctx.allLogs Audit — FAZA 1.5

**Data:** 2026-04-24  
**Scope:** Audit-only — zero modificări cod  
**Problemă:** ctx.allLogs derivat din recentLogs (3 sesiuni) în loc de full history

---

## Current State — cum se construiește

### Pas 1: buildCoachContext() — `src/engine/coachContext.js:8`

```js
const allLogs = getAllLogs();          // ✅ citește TOATE logurile din localStorage
const recentLogs = getLastNSessions(3); // ⚠️ primele 3 zile unice cu loguri

return {
  muscleState: getMuscleState(allLogs),  // ✅ full history pentru muscleMap
  recentLogs,                            // ⚠️ context conține NUMAI 3 sesiuni
  // allLogs NU este inclus în context!
};
```

`getAllLogs()` citește `localStorage['logs']` complet — potențial 500+ entries.  
`getLastNSessions(3)` returnează `[{ date, logs[] }, { date, logs[] }, { date, logs[] }]` — max 3 zile.

### Pas 2: coachDirector.buildSession() — `src/engine/coachDirector.js:23`

```js
const allLogs = ctx.recentLogs?.flatMap(s => s.logs ?? []) ?? [];
ctx.allLogs = allLogs; // ❌ suprascrie orice ar fi în ctx.allLogs cu ultimele 3 sesiuni
```

**Efectul concret:** Un user cu 100 sesiuni în storage are `ctx.allLogs` cu ~18 loguri (3 sesiuni × ~6 sets).

### Pas 3: Engines primesc `logsForEngines = ctx.allLogs` — limitat la 3 sesiuni

| Engine | Funcție | Impact |
|---|---|---|
| `calibration.js:110` | `detectCalibrationLevel(ctx)` | Vede max 3 sesiuni → COLD_START forever chiar cu 100 sesiuni |
| `coachDirector.js:51` | `detectWeakGroups(logsForEngines)` | Detectează grupe slabe din 3 sesiuni, nu din istoricul real |
| `coachDirector.js:55` | `detectGlobalStagnation(logsForEngines)` | Stagnation detector orb la pattern-uri mai vechi de 3 sesiuni |
| `coachDirector.js:59` | `predictToday(logsForEngines, workoutSkips)` | Predicție bazată pe 3 sesiuni, nu tendința reală |
| `coachDirector.js:62` | `recompileWeek(...)` | Săptămâna curentă OK, dar fără context înainte |
| `recalibration.js:28` | `runRecalibration(ctx)` | Recalibrare pe date insuficiente |

### Ce funcționează corect (accesează full history direct)

- `muscleState` — calculat în `buildCoachContext` cu `allLogs` complet ✅
- `AA.check()` — citește `DP.getLogs(ex, 9)` direct din DB ✅
- `DP.recommend()` — citește `DB.get('logs')` direct ✅
- `adherence.js` — citește `DB.get('logs')` direct ✅
- `dashboard.js`, `session.js` — citesc `DB.get('logs')` direct ✅

---

## Target State — full history access

`ctx.allLogs` trebuie să fie `getAllLogs()` complet, aplicat cu rolling window de calibration dacă e cazul.

### Fix în 2 linii — `coachContext.js`

```js
// ÎN: buildCoachContext()
return {
  ...
  recentLogs,
  allLogs: getAllLogs(),  // ← ADAUGĂ această linie
  ...
};
```

### Fix în coachDirector.js (elimina derivarea din recentLogs)

```js
// ÎN LOC DE (linia 23-24):
const allLogs = ctx.recentLogs?.flatMap(s => s.logs ?? []) ?? [];
ctx.allLogs = allLogs;

// ÎNLOCUIEȘTE CU:
const allLogs = ctx.allLogs ?? [];
// ctx.allLogs vine din buildCoachContext — full history
```

Rolling window (`applyRollingWindow`) continuă să se aplice pe `allLogs` din context (linia 40), nu pe derivatul din recentLogs.

---

## Migration Path

1. **Pas 1** — `coachContext.js`: adaugă `allLogs: getAllLogs()` în return
2. **Pas 2** — `coachDirector.js:23-24`: înlocuiește derivarea cu `const allLogs = ctx.allLogs ?? [];`
3. **Test**: `detectCalibrationLevel` trebuie să returneze PERSONALIZING/PERSONALIZED pentru un user cu 30+ sesiuni
4. **Verificare**: `ctx.weakGroups` și `ctx.stagnationWeeks` trebuie să se schimbe față de valorile anterioare

---

## Performance Analysis

| Dimensiune | Impact |
|---|---|
| 500 loguri (cap max) | ~50 KB JSON — trivial în JS |
| `flatMap(3 sesiuni)` vs `getAllLogs()` | Diferență: 0ms vs 0ms (ambele sub 1ms) |
| `getAllLogs()` deja apelat în `buildCoachContext` | Apelat o singură dată — zero apel extra |
| `detectWeakGroups(500 logs)` | ~5ms vs ~0.5ms — imperceptibil |
| Caching necesar? | **NU** — 500 obiecte JS mici, inlineable |

`getAllLogs()` este **deja apelat** în `buildCoachContext` pentru `getMuscleState`. Adăugarea lui în return object nu costă nimic — e deja în memorie.

---

## Risk Assessment

| Risc | Nivel | Detalii |
|---|---|---|
| Performance regressions | **NONE** | getAllLogs() deja apelat, 500 loguri trivial |
| Behavioral change în calibration | **MEDIUM** | User cu 30+ sesiuni va fi PERSONALIZING, nu COLD_START — CORECT, dar comportamentul se schimbă |
| Behavioral change în weakGroups | **LOW** | Mai multă date = detectare mai precisă |
| Memory | **NONE** | Aceleași obiecte, o referință în plus |
| Rollback | **trivial** | Revert linia din coachContext.js și 1 linie din coachDirector.js |

---

## Recomandare: SIMPLE FIX (2 linii, zero caching needed)

**Fix-ul este trivial** — `getAllLogs()` e deja apelat în `buildCoachContext` și rezultatul e în memorie. Singura schimbare: expune-l în context și înlocuiește derivarea falsă din coachDirector.

**Nu e nevoie de caching layer** — datele sunt deja în localStorage (persistent), nu compute-intensive.

**Risc principal:** calibration level va sări de la COLD_START la PERSONALIZING pentru useri cu >28 sesiuni. Aceasta este comportamentul CORECT — dar poate activa engines (weakGroups, stagnation, prediction) care nu au date de calibrare la ora curentă. Verificare cu user real recomandata.

---

*Generat de: Claude Sonnet 4.6 | Audit-only, zero cod modificat*
