# FAZA 2 — Execution Plan

**Created:** 2026-04-24
**Status:** AUDIT ONLY — zero cod modificat
**Total effort estimat:** ~7h
**Refs:** AUDIT_COACH_JS_24APR.md, AUDIT_BULLETPROOF_23APR.md, SESSIONBUILDER_AUDIT_1_6.md

---

## Executive Summary

FAZA 2 atacă 3 niveluri de probleme: (1) session building complet static — tot contextul calculat (weakGroups, stagnation, prediction, allLogs) este ignorat complet la selecția exercițiilor; (2) 5 bug-uri UX active care cauzează state leak, duplicate date, și UX confuz (cancelWorkout incomplet, rateSession double-tap, resume counter broken, patternAnalysis fără inflight guard, cache invalidare incompletă); (3) 3 bug-uri de logică în engines (muscleState contract mismatch → alerte undertrained mereu silențioase, isoWeek inconsistent între module, phase-unaware stagnation detection).

Efortul total estimat: ~7h. Riscul principal este Priority 1 (sessionBuilder OPT A) — schimbă ce exerciții apar, poate surprinde userul cu exerciții nefamiliare dacă logica context-aware e prea agresivă. Mitigare: feature flag sau threshold conservativ. Priority 2 bug-urile au risc scăzut — fix-urile sunt izolate și bine definite din audit, cu fix-uri exacte documentate.

Exit criteria: (a) zero duplicate entries în `session-ratings` după 100 rapid-taps, (b) `completedExercises.size > 0` după resume cu draft existent, (c) `checkRecoveryGroups` returnează alerte reale la >5 zile de la ultima sesiune, (d) sessionBuilder produce exerciții diferite pentru user cu `weakGroups=['delt_mid']` vs user fără, (e) cancelWorkout cu DevTools → zero event listeners orfani pe document după anulare.

---

## Priority 1 — sessionBuilder Context-Aware (OPT C + OPT A)

### Starea curentă

`fallbackSessionBuilder` în `coachDirector.js:180-201` — returnează listă statică de exerciții per tip sesiune. Ignoră complet: `ctx.weakGroups`, `ctx.stagnationWeeks`, `ctx.predictionToday`, `ctx.recompile`, `ctx.allLogs`. Funcția e în clasa `CoachDirector`, nu e testabilă izolat.

### Sub-task P1.1 — OPT C: Extrage ca funcție pură (45 min)

**Ce face:**
- Creează `src/engine/sessionBuilder.js` cu `export function buildSession(sessionType, ctx)`
- Mută logica din `fallbackSessionBuilder` verbatim (EXERCISE_LISTS + equipMap + filter)
- `coachDirector.js`: înlocuiește `this.fallbackSessionBuilder(sessionType, ctx)` cu `buildSession(sessionType, ctx)` (import static)
- `CoachDirector.fallbackSessionBuilder` method ștearsă

**Fișiere:** `src/engine/sessionBuilder.js` (creat), `src/engine/coachDirector.js`

**Teste noi:**
```js
it('returns exercises for PUSH session with all equipment available')
it('filters exercises when equipment unavailable')
it('returns FULL_UPPER fallback for unknown session type')
```

**Risk:** NONE — comportament identic, mai testabil.

---

### Sub-task P1.2 — OPT A: Context-aware selection (2h)

**Ce face:** Adaugă logică context-aware în `buildSession`:

**A. weakGroups → prioritizare**
```js
// dacă ctx.weakGroups include 'delt_mid' → PUSH session prioritizează DB Shoulder Press + Lateral Raises
// dacă ctx.weakGroups include 'lat' → PULL session prioritizează Lat Pulldown + Cable Row în top
const reorder = (names, ctx) => {
  const weakExercises = MUSCLE_EXERCISE_MAP.filter(({muscle}) => ctx.weakGroups.includes(muscle));
  return [...names.filter(n => weakExercises.some(e => e.exercises.includes(n))),
          ...names.filter(n => !weakExercises.some(e => e.exercises.includes(n)))];
};
```

**B. stagnation → alternativă la exercițiu stagnat**
```js
// dacă ctx.stagnationWeeks > 3 pentru un exercițiu → inject alternativă (resolveExercise deja face asta pentru equipment)
// folosim alternativeEngine.resolveExercise cu fake 'stagnation' flag
```

**C. predictionToday.isHighRisk → reduce volum**
```js
// dacă ctx.predictionToday?.isHighRisk → returnează max 4 exerciții în loc de 5-6
if (ctx.predictionToday?.isHighRisk) names = names.slice(0, Math.min(names.length, 4));
```

**D. calibrationLevel.rollingWindowMonths → variety din allLogs**
```js
// pentru OPTIMIZED: dacă un exercițiu apare în ultimele 2 sesiuni → deprioritizează în favoarea altui din grup
```

**Fișiere:** `src/engine/sessionBuilder.js`

**Constant nou necesar:** `MUSCLE_EXERCISE_MAP` (map grupe musculare → exerciții) — poate fi extras din EXERCISE_MUSCLES în muscleMap.js

**Teste noi:**
```js
it('prioritizes shoulder exercises when delt_mid is weak group')
it('reduces volume to 4 exercises when predictionToday.isHighRisk=true')
it('for PULL session with lat weakness, Lat Pulldown is first')
it('produces valid session when ctx is minimal (cold start)')
```

**Risk:** MEDIUM — selecție diferită față de azi. Mitigare: conservativ (nu schimbă exerciții, reordonează și trimite), feature flag `ctx.calibrationLevel.contextSelectionEnabled` (deja disponibil pe tier PERSONALIZING+).

**Edge cases:**
- ctx fără weakGroups (Cold Start) → fallback la ordine statică ✓
- toate echipamentele indisponibile → `filtered` array vid → return `{ exercises: [] }` (e validat de realityEngine downstream)
- sessionType unknown → FULL_UPPER default ✓
- predictionToday null → safe optional chain ✓

---

## Priority 2 — UX Bug Fixes

### Status actual (verificat în cod split)

| ID | Finding | Fișier actual | Status |
|----|---------|---------------|--------|
| C2c | cancelWorkout nu cheamă clearDraft/teardownInactivity/releaseWakeLock + nu resetează state fields | `src/pages/coach/session.js:90` | **OPEN** |
| C3c | rateSession fără idempotency guard — double-tap dublează session-ratings + notes | `src/pages/coach/rating.js:57` | **OPEN** |
| H4c | resume draft pierde completedExercises → progress counter arată 0/N la resume | `src/pages/coach/session.js:34` | **OPEN** |
| H6c | analyzeAndApplyPatterns fără inflight guard → CPU waste la nav rapid | `src/engine/patternLearning.js:3` | **OPEN** |
| H11c | COACH_RELEVANT_KEYS lipsă: unavailable-equipment, equipment-occupied-session, applied-patterns | `src/firebase.js:118` | **OPEN** |

### Fix exact per bug

**C2c — cancelWorkout (session.js:90-107)**

Lipsă față de `endSession`: `clearDraft()`, `teardownInactivity()`, `releaseWakeLock()`, și reset state complet.

```js
export function cancelWorkout() {
  if (!confirm('Anulezi antrenamentul? Nicio dată nu va fi salvată.')) return;
  clearInterval(state.sessTimer); state.sessTimer = null;
  stopPause();
  state.sessActive = false; state.lastPauseEndedAt = null;
  state.completedExercises = new Set();       // ← ADD
  state.dropSetUsedThisSession = false;        // ← ADD
  state.earlyStopReason = null;               // ← ADD
  state.sessionKgOverride = null;             // ← ADD
  state.activeNotes?.clear();                 // ← ADD (if activeNotes is Set)
  clearDraft();                               // ← ADD
  teardownInactivity();                       // ← ADD
  releaseWakeLock();                          // ← ADD
  if (state.sessStart) { ... }  // logs cleanup existent
  // ... rest identic
}
```

**Effort:** 15 min. **Risk:** LOW.

---

**C3c — rateSession idempotency (rating.js:57)**

```js
export function rateSession(rating, summaryData) {
  // Idempotency guard — ADD AT TOP:
  const sRatingsCheck = DB.get('session-ratings') || [];
  if (sRatingsCheck.some(r => r.session === state.sessStart)) {
    const modal = document.getElementById('rating-modal');
    if (modal) modal.remove();
    return;
  }
  clearDraft();
  // ... restul neschimbat
}
```

Alternativ complementar: disable butonul la prim click (în showSessionRating). Ambele recomandate — defense in depth.

**Effort:** 10 min. **Risk:** VERY LOW.

---

**H4c — resume completedExercises (session.js:34-47)**

Resume path curent: `state.completedExercises = new Set()` — mereu gol.

Fix — derivă din sessLog:
```js
// În resume branch, după state.sessLog = [...draft.sessLog]:
const exSetCounts = {};
draft.sessLog.forEach(s => { exSetCounts[s.ex] = (exSetCounts[s.ex] || 0) + 1; });
for (const [ex, count] of Object.entries(exSetCounts)) {
  if (count >= (EX_SETS[ex] || 3)) state.completedExercises.add(ex);
}
// NU mai face: state.completedExercises = new Set()
```

**Effort:** 20 min. **Risk:** LOW (derivare din date existente, nu din date noi).

---

**H6c — patternLearning inflight guard (patternLearning.js:3)**

```js
let _patternAnalyzeInFlight = false;
export function analyzeAndApplyPatterns(logs) {
  if (_patternAnalyzeInFlight) return;     // ← ADD
  _patternAnalyzeInFlight = true;           // ← ADD
  setTimeout(() => {
    try { _analyze(logs); } finally { _patternAnalyzeInFlight = false; } // ← WRAP
  }, 500);
}
```

**Effort:** 10 min. **Risk:** NONE.

---

**H11c — COACH_RELEVANT_KEYS (firebase.js:118)**

```js
const COACH_RELEVANT_KEYS = [
  'logs', 'readiness', 'phase-override', 'current-kcal', 'weights',
  'unavailable-equipment',      // ← ADD (markEquipmentUnavailable)
  'equipment-occupied-session', // ← ADD (markOccupied, selectAlternative)
  'applied-patterns',           // ← ADD (patternLearning._analyze)
  'session-burns',              // ← ADD (early stop + session end)
  'early-stops',                // ← ADD (early stop marker)
  'workout-skips',              // ← ADD (skip tracking)
];
```

**Effort:** 5 min. **Risk:** NONE — cache se invalidează mai des, dar corect.

---

### Batching P2

| Batch | Bug-uri | Fișiere | Effort |
|-------|---------|---------|--------|
| P2-A | H11c | firebase.js | 5 min |
| P2-B | C3c | rating.js | 10 min |
| P2-C | C2c + H4c | session.js | 35 min |
| P2-D | H6c | patternLearning.js | 10 min |

**Total P2: ~60 min + 30 min teste**

---

## Priority 3 — Logic Bugs

### Status actual (verificat în cod)

| ID | Finding | Fișier | Status |
|----|---------|--------|--------|
| M3g | stagnationDetector.isoWeek — year-boundary edge case (week 52/53 vs W01) | `src/engine/stagnationDetector.js:10` | **OPEN** |
| H13g | responseProfile isoWeek — complet diferit și mai rupt (Math.ceil) | `src/engine/responseProfile.js:78` | **OPEN** |
| H14g | proactiveEngine.checkRecoveryGroups — muscleState contract mismatch: primește `{muscle: 0-100}`, așteaptă `{muscle: {fatigue, daysSinceLast}}` → alerte undertrained MEREU silențioase | `src/engine/proactiveEngine.js:93` + `muscleMap.js:68` | **OPEN** |
| M7c | Logs fără câmpul `phase` → stagnation analysis cross-CUT/BULK compară greutăți incomparabile | `src/pages/coach/logging.js:99` | **OPEN** |

### Fix exact per bug

**M3g + H13g — isoWeek shared helper (batch)**

Creează `src/util/dateUtils.js`:
```js
export function isoWeek(ts) {
  const d = new Date(ts || Date.now());
  // ISO 8601: week containing first Thursday of year
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const diff = d - startOfWeek1;
  const week = Math.floor(diff / (7 * 24 * 3600 * 1000)) + 1;
  // Handle year-end edge case: if week > 52, check if it belongs to next year W01
  if (week < 1) {
    // belongs to previous year — compute that year's last week
    return isoWeek(new Date(d.getFullYear(), 0, 0).getTime());
  }
  // Use ISO year (may differ from calendar year at year boundary)
  const isoYear = week > 52 ? (d.getMonth() === 11 && d.getDate() > 28 ? d.getFullYear() + 1 : d.getFullYear()) : d.getFullYear();
  const isoYearWeek = isoYear === d.getFullYear() + 1 ? 1 : week;
  return `${isoYear}-W${String(isoYearWeek).padStart(2, '0')}`;
}
```

- `stagnationDetector.js`: înlocuiește funcția locală `isoWeek` cu import
- `responseProfile.js:78`: înlocuiește `Math.ceil(...)` cu `isoWeek(ts)`

**Effort:** 30 min + teste. **Risk:** LOW — schimbă key-urile pentru loguri la year boundary (Dec/Jan), poate reseta stagnation detection temporar la rulare.

---

**H14g — muscleState contract (proactiveEngine.js:93 sau muscleMap.js:68)**

Două abordări:

**Opțiune A (recomandat):** Adaptează `checkRecoveryGroups` să folosească formatul actual:
```js
export function checkRecoveryGroups(logs, muscleState) {
  // muscleState = {muscle: fatiguePercent 0-100}
  // Calculăm daysSinceLast direct din logs
  const now = Date.now();
  const lastLogPerMuscle = {};
  (logs || []).filter(l => !l.baseline && l.ex).forEach(l => {
    const ms = EXERCISE_MUSCLES[l.ex];
    if (!ms) return;
    const ts = l.ts || new Date(l.date).getTime();
    [...ms.primary, ...ms.secondary].forEach(m => {
      if (!lastLogPerMuscle[m] || ts > lastLogPerMuscle[m]) lastLogPerMuscle[m] = ts;
    });
  });
  const undertrained = Object.entries(muscleState)
    .filter(([muscle, fatiguePercent]) => {
      const lastTs = lastLogPerMuscle[muscle];
      if (!lastTs) return true; // never trained
      const daysSinceLast = (now - lastTs) / (24 * 3600 * 1000);
      return fatiguePercent < 10 && daysSinceLast > 5; // fresh AND stale
    })
    .map(([muscle]) => muscle);
  // ... rest as before
}
```

**Opțiune B:** Schimbă `getMuscleState` să returneze `{muscle: {fatiguePercent, daysSinceLast}}` — breaking change în coachContext.js care folosește muscleState pentru alte calcule.

**Recomandat: Opțiune A** — zero impact pe alte consumatori.

**Effort:** 30 min + test. **Risk:** LOW.

---

**M7c — Phase tagging în logs (logging.js:99)**

```js
// În confirmReps, la logs.unshift:
logs.unshift({
  date: tod(), ex: state.currentEx, w: logKg, sets: 1,
  reps: String(state.sessRepsInput), notes: noteArr, ts: Date.now(),
  session: state.sessStart,
  phase: SYS.getPhase()   // ← ADD (import SYS din sys.js)
});
```

Aceasta îmbogățește logurile viitoare. Loguri istorice rămân fără phase (nu se migrează — engines tratează `log.phase === undefined` ca "unknown").

**Effort:** 10 min. **Risk:** NONE — field adițional, nu breaking.

---

## Cross-Cutting Concerns

### Batching optimal

| Batch | Tasks | Fișiere | Effort | Dependențe |
|-------|-------|---------|--------|------------|
| P2-A | H11c cache keys | firebase.js | 5 min | NONE |
| P2-B | C3c rateSession | rating.js | 10 min | NONE |
| P2-C | C2c + H4c | session.js | 35 min | NONE |
| P2-D | H6c patternLearning | patternLearning.js | 10 min | NONE |
| P3-A | M3g + H13g isoWeek | dateUtils.js + stagnationDetector + responseProfile | 30 min | NONE |
| P3-B | H14g muscleState | proactiveEngine.js | 30 min | NONE |
| P3-C | M7c phase tagging | logging.js | 10 min | SYS import |
| P1-C | OPT C sessionBuilder | sessionBuilder.js + coachDirector | 45 min | NONE |
| P1-A | OPT A context-aware | sessionBuilder.js | 2h | P1-C DONE |

### Safety nets

- **P2-C** (session.js): teste manuale cu draft simulat înainte de deploy
- **P1-A** (sessionBuilder OPT A): conservativ — reordonare, nu excludere. Testezi cu profil PERSONALIZING+.
- **P3-A** (isoWeek): unit test cu date 2026-12-30, 2026-12-31, 2027-01-01, 2027-01-02 — aceeași ISO week trebuie să returneze același key.
- **P3-B** (muscleState): test că `checkRecoveryGroups` returnează alerte non-empty dacă last session >5 zile.

---

## Test Strategy

### Exit criteria explicit

| Criteriu | Test type | Pass dacă |
|---------|-----------|-----------|
| No duplicate session-ratings | Unit | `rateSession` apelat de 2× → `session-ratings.length` = 1 |
| Resume progress counter | Unit | Draft cu 2 exerciții complete → `completedExercises.size` = 2 după resume |
| cancelWorkout no leak | E2E / manual | DevTools → Event Listeners pe document = 0 după cancel |
| Pattern analysis inflight | Unit | `analyzeAndApplyPatterns` apelat 5× rapid → setTimeout armat 1 dată |
| Cache invalidation | Unit | `DB.set('unavailable-equipment', [...])` → `_directorCache.invalidate()` apelat |
| checkRecoveryGroups returns alerts | Unit | muscleState cu lat=5, lastLog >6 zile → alert `undertrained` |
| isoWeek consistency | Unit | 2026-12-30 și 2027-01-01 (aceeași săptămână ISO) → același key |
| sessionBuilder context-aware | Unit | ctx.weakGroups=['delt_mid'] + PUSH → DB Shoulder Press primul |

### Teste automate noi (estimate ~25 teste total)

- `session.test.js`: cancelWorkout state reset (3 teste), resume completedExercises (2 teste)
- `rating.test.js`: idempotency guard (2 teste)
- `patternLearning.test.js`: inflight guard (2 teste)
- `dateUtils.test.js`: isoWeek year-boundary (4 teste)
- `proactiveEngine.test.js`: checkRecoveryGroups real alerts (3 teste)
- `sessionBuilder.test.js`: context-aware selection (5+ teste)
- `firebase.test.js`: cache invalidation keys (2 teste)

### QA manual flows mandatory

1. **Start → Cancel → Start nou**: verifici că nu e draft "ghost" de la sesiunea anulată
2. **End session → rating tap rapid 2×**: verifici că apare 1 entry în session-ratings
3. **Start → 3 seturi → refresh → resume**: verifici că counter arată corect
4. **Mark echipament indisponibil → sesiune nouă**: exercițiul absent, nu din cache vechi
5. **5+ zile fără antrenament → coach idle**: alertă undertrained apare

---

## Ordine Execuție Recomandată

### Opțiunea A — P1 first (biggest impact)
P1.1 (OPT C) → P1.2 (OPT A) → P2 batch-uri → P3 batch-uri

**Pro:** Impact vizibil imediat pe selectarea exercițiilor.  
**Con:** P1.2 e 2h, risc MEDIUM. Dacă e blocat, P2 fix-urile simple nu sunt livrate.

### Opțiunea B — P2 first (clean wins, momentum)
P2-A → P2-B → P2-C → P2-D → P1.1 → P1.2 → P3

**Pro:** 4 bug-uri fix-uite în ~1h total. Confidence crescut. Baseline stabilizat.  
**Con:** Impact UX real (sessionBuilder) vine mai târziu.

### Opțiunea C — Hybrid (RECOMANDATĂ)
P2-A + P2-B + P2-D (simple, independent) → P2-C (session.js) → P3-A (dateUtils) → P3-B + P3-C → P1.1 (OPT C) → P1.2 (OPT A)

**Justificare:** 
- P2-A, P2-B, P2-D sunt 1-liner fixes — batch-uite în 1 task (~25 min total + teste)
- P2-C (session.js) este mai complex — task separat (~35 min)
- P3-A + P3-B + P3-C sunt izolate — batch-uite în 1 task engines (~70 min)
- P1.1 OPT C pregătește structura fără risc (~45 min)
- P1.2 OPT A la final — schimbă comportament visible, testat pe baza solidă

**Total: ~7h, distribuite în 5 task-uri executabile.**

---

## Task List Ready-to-Queue

### TASK #22 — P2 Simple Fixes Batch (P2-A + P2-B + P2-D)
**Priority:** HIGH | **Effort:** 25 min + teste

Fișiere: `src/firebase.js`, `src/pages/coach/rating.js`, `src/engine/patternLearning.js`

Modificări:
1. `firebase.js:118` — adaugă `'unavailable-equipment', 'equipment-occupied-session', 'applied-patterns', 'session-burns', 'early-stops', 'workout-skips'` în COACH_RELEVANT_KEYS
2. `rating.js:57` — adaugă idempotency guard la topul `rateSession`:
   ```js
   const sRatingsCheck = DB.get('session-ratings') || [];
   if (sRatingsCheck.some(r => r.session === state.sessStart)) {
     document.getElementById('rating-modal')?.remove(); return;
   }
   ```
3. `patternLearning.js:3` — adaugă `_patternAnalyzeInFlight` flag
4. Teste: 2 rating idempotency + 2 inflight guard + 2 cache keys → 6 teste noi

---

### TASK #23 — P2 Session Fixes (C2c + H4c)
**Priority:** HIGH | **Effort:** 35 min + teste

Fișier: `src/pages/coach/session.js`

Modificări:
1. `cancelWorkout` (linia 90): adaugă după `stopPause()`:
   - `state.completedExercises = new Set()`
   - `state.dropSetUsedThisSession = false; state.earlyStopReason = null; state.sessionKgOverride = null`
   - `clearDraft(); teardownInactivity(); releaseWakeLock()`
2. Resume path (linia 34): înlocuiește `state.completedExercises = new Set()` cu derivare din sessLog:
   ```js
   const exSetCounts = {};
   draft.sessLog.forEach(s => { exSetCounts[s.ex] = (exSetCounts[s.ex] || 0) + 1; });
   state.completedExercises = new Set(
     Object.entries(exSetCounts).filter(([ex, n]) => n >= (EX_SETS[ex] || 3)).map(([ex]) => ex)
   );
   ```
3. Teste: 3 cancelWorkout state reset + 2 resume completedExercises → 5 teste noi

---

### TASK #24 — P3 Engine Logic Batch (M3g + H13g + H14g + M7c)
**Priority:** MEDIUM | **Effort:** 75 min + teste

Fișiere: `src/util/dateUtils.js` (creat), `src/engine/stagnationDetector.js`, `src/engine/responseProfile.js`, `src/engine/proactiveEngine.js`, `src/pages/coach/logging.js`

Modificări:
1. Creează `src/util/dateUtils.js` cu `export function isoWeek(ts)` — robust ISO 8601
2. `stagnationDetector.js:10` — înlocuiește funcția locală isoWeek cu import din dateUtils
3. `responseProfile.js:78` — înlocuiește `Math.ceil(...)` cu `isoWeek(ts)` din dateUtils
4. `proactiveEngine.js:93` — fix `checkRecoveryGroups` să calculeze `daysSinceLast` din logs direct
5. `logging.js:99` — adaugă `phase: SYS.getPhase()` în log object
6. Teste: 4 isoWeek boundary + 3 proactiveEngine undertrained + 1 phase tag → 8 teste noi

---

### TASK #25 — P1.1 SessionBuilder OPT C (structura pură)
**Priority:** HIGH | **Effort:** 45 min + teste

Fișiere: `src/engine/sessionBuilder.js` (creat), `src/engine/coachDirector.js`

Modificări:
1. Creează `src/engine/sessionBuilder.js` cu:
   - Constantele `EXERCISE_LISTS` + `EQUIP_MAP` (mutate din coachDirector.fallbackSessionBuilder)
   - `export function buildSession(sessionType, ctx)` — logică identică cu fallbackSessionBuilder
2. `coachDirector.js`: 
   - Import `import { buildSession } from './sessionBuilder.js'`
   - `this.fallbackSessionBuilder(sessionType, ctx)` → `buildSession(sessionType, ctx)`
   - Șterge metoda `fallbackSessionBuilder` din clasă
3. Teste: 3 pentru buildSession (PUSH/PULL/unknown + equipment filter) → 3 teste noi

---

### TASK #26 — P1.2 SessionBuilder OPT A (context-aware)
**Priority:** HIGH | **Effort:** 2h + teste

Fișier: `src/engine/sessionBuilder.js`

Modificări (toate în `buildSession`):
1. Adaugă `MUSCLE_EXERCISE_MAP` — map grupe musculare → exerciții din grupele respective
2. `weakGroups` → reordonare: exerciții care antrenează grupe slabe → front
3. `stagnationWeeks > 3` → inject `resolveExercise` cu forced alternative pentru exercițiul stagnat
4. `predictionToday?.isHighRisk` → `names = names.slice(0, Math.min(names.length, 4))`
5. `calibrationLevel` < PERSONALIZING → skip context logic (folosește ordine statică, safe)
6. Teste: 5+ pentru fiecare branching logic + edge cases (nil ctx, COLD_START, full OPTIMIZED)
7. Manual test: sesiune reală → verifici că exercițiile selectate reflectă weakGroups

---

### TASK #27 — FAZA 2 Vault Update
**Priority:** LOW | **Effort:** 15 min

Fișiere: `00-index/INDEX_MASTER.md`, `03-decisions/DECISION_LOG.md`, `docs/FAZA_2_ROADMAP.md`

Modificări: Marchează FAZA 2 sub-fazele completate, adaugă entry DECISION_LOG cu decizii, update FAZA_2_ROADMAP cu status.

---

*Generat de: Claude Sonnet 4.6 | AUDIT ONLY — zero cod modificat*
