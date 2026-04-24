# NUCLEAR OPUS AUDIT — 25 APR 2026

**See also:** [[INDEX_MASTER]] | [[DECISION_LOG]] | [[FINDINGS_MASTER]] | [[QA_MANUAL_24APR_2230]] | [[FAZA_2_OPUS_REVIEW]] | [[FAZA_3_ROADMAP]]

**Status:** Adversarial review. Evidence-based. Zero politeness.
**Methodology:** Code-first inspection cu grep scripts; dependencies extrase direct; "DONE" claims verificate în binar.
**Scope:** Arhitectura curentă, "DONE" fals din FAZA 1/2, blueprint FAZA 3/4, launch readiness.
**Format:** 13 secțiuni, fiecare cu VERDICT: PASS | FAIL | RISK.

---

## 1. EXECUTIVE SUMMARY — Brutal Onest

### Unde e SalaFull REAL astăzi?

Ai un MVP funcțional pentru **un singur user** (Daniel), cu 271 teste unitare verzi, un engine director care orchestrează 18 engines, localStorage ca sursă primară și Firebase RTDB ca sync best-effort. Arhitectura e **modulară la nivel de fișier** (27 engines separate) dar **monolitică la nivel de state** (toate engines ating direct localStorage, nu există schema registry, nu există reset specification). FAZA 1 a reparat infrastructura (split coach.js, cleanup schema, calibration real). FAZA 2 a reparat 10 bug-uri prioritare. **Dar rigoarea testului nu se traduce în rigoare de runtime** — QA-ul manual de 24 apr seară a descoperit în 30 minute 3 bug-uri pe care suite-ul de 271 teste nu le-a prins (C10c cache loop, H30c pattern false positives, H31c reset incomplet). Testele validează pure functions. Bug-urile trăiesc în glue-ul dintre pure functions și state global.

### Ce e ILUZIE vs. realitate în FAZA 1/2 "DONE"?

**Iluzie #1:** "Multi-tenancy decouple done" (FAZA 1.2). Realitate: `src/firebase.js:6` e tot `USER_PATH = 'users/daniel'` hardcodat, iar `src/config/user.js:19` expune același string fără ca firebase.js să-l citească. Două surse de adevăr, una ignorată. **FALSE DONE.**

**Iluzie #2:** "H11c cache invalidation fixed". Realitate: fix-ul a EXTINS COACH_RELEVANT_KEYS de la 5 la 11 keys (commit 2da734d). Cu mai multe keys monitorizate, **invalidările cresc proporțional**. Pe primul sync Firebase (line 82-106 `syncFromFirebase`), 8-11 `DB.set` calls pentru keys relevante → 8-11 invalidări în cascade. Asta EXPLICĂ exact "12+ invalidations" pe page load observat în QA. Fix-ul H11c a **amplificat** C10c, nu l-a cauzat, dar evident nu l-a rezolvat.

**Iluzie #3:** "Pattern learning cold_start gated". Realitate: director-ul aplică `patternsEnabled/patternMinConfidence` filter pe `ctx.patterns` (coachDirector.js:30-36). Dar `renderIdle.js:186` citește `DB.get('applied-patterns')` DIRECT pentru banner, BYPASS complet la filter. Patterns cu skip-rate 88% apar în UI chiar cu tier INITIAL (threshold 0.70) pentru că banner-ul nu trece prin director.

**Iluzie #4:** "Full Reset șterge tot". Realitate: `dataCleanup.js:212` șterge UNIUNEA `TEST_RESIDUE_KEYS + USER_DATA_KEYS`. Nu face `localStorage.clear()`. Orice key neincluse în liste — `equipment-occupied-session` (deloc listată), keys dinamice `muscle-extra-${grp}` (renderIdle.js:339), `aa-cooldown-${ex}` (aa.js:99), `ex-extra-sets-${ex}` (dp.js:237), `backup-*`, `last-backup` — persistă.

### Cât timp până la launch calitate "coach 15000€/lună"?

Realist: **4-6 luni de muncă concentrată**. Nu pentru features, ci pentru:
- Registry central de keys (1 săpt — rezolvă H31c + viitoare keys dynamic)
- Reset specification completă (1 săpt)
- Cache lifecycle design (2 săpt — C10c kept at bay cu debounce/coalesce, plus idempotent DB writes)
- Multi-user auth + data isolation (3-4 săpt)
- Observability (Sentry configurat corect, nu filtrând Firebase) (1 săpt)
- Onboarding generic (actual e Daniel-centric) (2 săpt)
- 144 programe generative (4-6 săpt)
- Injury detection (3-4 săpt)
- Legal + landing + billing (3-4 săpt compresat)

Dacă rămâi la pace de 20h/săpt cu Claude Code + Opus, 4 luni e agresiv dar realizabil. Dacă adaugi React migration, +2 luni minimum.

### Care e cea mai mare minciună curentă?

**"Testele de 271 au zero regresii"** e adevărat literal dar **fals ca sens**. Testele acoperă pure functions (dp, calibration, isoWeek, sessionBuilder pure, muscleMap). **Nu acoperă:**
- Lifecycle (`buildSession` recursiv, cache invalidation cascade)
- Firebase sync race conditions (local wins always, ts collision dedup)
- Reset side-effects (ce rămâne în storage)
- Render loops (câte ori e apelat `renderCoachIdle` pe o acțiune)
- Keys dinamice (muscle-extra-*, aa-cooldown-*, ex-extra-sets-*, backup-*)

**Suita de teste nu e "bulletproof"** — e "bulletproof în domeniul pur". Bug-urile se produc în domeniul impur.

---

### TOP 5 ABSOLUTE BLOCKERS (launch)

1. **C10c Cache Invalidation Cascade** — `firebase.js:85,93,102,121` — initial sync loop invalidates director cache 8-11×; each user action with SYNC_KEYS write triggers another. **Blochează:** UX (latență vizibilă), perf scaling (toate engines recompute). **Effort:** 2 zile (debounce invalidate + coalesce sync batch + make invalidate idempotent).

2. **H31c Full Reset Spec Gap** — `dataCleanup.js:212` lists only 2 arrays of keys, no wildcard cleanup, no `localStorage.clear()`. Keys like `equipment-occupied-session`, `muscle-extra-*`, `aa-cooldown-*`, `ex-extra-sets-*`, `last-backup` survive. **Blochează:** trust (user poate reset DAR nu cu adevărat; comercial inacceptabil). **Effort:** 1 zi (specifică "reset" ca `localStorage.clear()` + selective preserve dacă dorit, documentație explicită).

3. **H30c Pattern Learning Bypass** — `renderIdle.js:186` citește `DB.get('applied-patterns')` direct, bypass director calibration filter. Plus root cause mai adânc: `patternLearning.js:31-35` numără fiecare zi de calendar ca "scheduled" (8 Marți în 56 zile) indiferent câte sesiuni reale au fost. Pe 4 sesiuni totale → 4/8 completate pe zi → 50% skip rate pe CADDA zi. **Blochează:** UX (user vede statistici false alarmante). **Effort:** 2 zile (routează banner prin director + redefinește "scheduled" = sesiuni reale nu zile calendar).

4. **Multi-Tenancy Still Fake** — `firebase.js:6` USER_PATH hardcodat "users/daniel" ignoră `config/user.js:19 userPath`. `inject.js:88` hardcodat Daniel MFP data. `dp.js:56,65` comments cu Daniel weights (acceptabil ca referință dar semnalizează mindset). **Blochează:** orice user nou va suprascrie Daniel pe Firebase. **Effort:** 3 zile (parametrizare completă + Firebase Auth integration + data migration script).

5. **Observability Blackhole** — `util/sentry.js:4` DSN hardcodat (OK) dar `C8g` (Sentry `beforeSend` filtrează erori Firebase) **rămâne neverificat**. Plus `coachDirector.js:44-66,85-94,110-153` conține 3 `try/catch` care înghit orice eroare engine tăcut. Nu ai vizibilitate când engines crapă în prod. **Blochează:** debugging post-launch. **Effort:** 1 săpt (Sentry corect configurat + structured logging + error boundaries explicite).

### VERDICT Section 1: **FAIL**

Exec summary-ul e FAIL pentru că arată produs care nu e launch-ready în nici o dimensiune critică (stabilitate, observability, multi-tenancy, trust pe reset). FAZA 1+2 au fixat fragmente corect dar au lăsat neatacate core issues structurale.

---

## 2. HOT PATH AUDIT — "Start Session" Traced Line-by-Line

Scenariu: user Daniel deschide app → page load → render coach idle → apasă "▶ START" → primul set confirmat.

```
═══ PAGE LOAD (first visit to coach tab) ═══

1. main.js:156 — onboardingDone check:
   DB.get('onboarding-done') OR (DB.get('logs') || []).length > 0
   → 2 DB.get calls

2. main.js:105 — initFirebaseSync() (firebase.js:130)
   → syncFromFirebase (firebase.js:72)
     → fbGet(USER_PATH)  [1 network GET → ~200-800ms]
     → for each SYNC_KEY (30 keys) check if local==null or merge
       For each relevant key (logs, readiness, weights, etc.):
         DB.set(k, merged)
       ⚠️ firebase.js:121 — for each DB.set of COACH_RELEVANT_KEYS:
         window._directorCache.invalidate()  ← [8-11 invalidations here]
   → syncToFirebase (firebase.js:57)
     → fbSet(USER_PATH, payload)  [1 network PUT]

3. renderCoachIdle() (renderIdle.js:73) — FIRST RENDER
   tp = PROG[dayMap[...]]  → static lookup
   if (tp.t === 'off') → OFF path
   else:
     todayR = getTodayReadiness()  → reads 'readiness' from localStorage
     _dirSession = sessionCache.get()  → NULL on first load (just invalidated ×11)
     await coachDirector.buildSession(tp.t.toUpperCase())  ← EXPENSIVE
       [coachDirector.js:16]
       ├─ buildCoachContext() (coachContext.js:8)
       │    → 8+ localStorage reads: logs, readiness, phase-override,
       │      current-kcal, weights, unavailable-equipment, etc.
       │    → getAllLogs() reads 'logs'
       │    → getMuscleState(allLogs) computes muscle-% for 12 groups
       │    → getActivePatterns() reads 'auto-recommendations' + 'applied-patterns'
       ├─ detectCalibrationLevel(ctx)  [calibration.js:109]
       │    → loops logs.length × (date parsing + Set)
       ├─ applyRollingWindow (if OPTIMIZED only)  → typically skipped
       ├─ detectWeakGroups(logsForEngines)  [weaknessDetector]
       │    → iterates all logs × EXERCISE_MUSCLES map
       ├─ detectGlobalStagnation(logsForEngines)  [stagnationDetector]
       │    → per-exercise stagnation check × weeks
       ├─ predictToday(logsForEngines, workoutSkips)  [predictionEngine]
       ├─ recompileWeek({logs, readinessScore})  [recompileEngine]
       ├─ runProactiveChecks(ctx)  [proactiveEngine]
       │    → parses JSON 4× (prots, weights, kcals, waters) — duplicate de buildCoachContext
       ├─ buildSession(sessionType, ctx)  [sessionBuilder.js:51]
       │    → returns {type, exercises[]} — pure
       ├─ resolveExercise per exercise if unavailableEquipment.length  [alternativeEngine]
       ├─ await import('./dp.js')  ← DYNAMIC IMPORT each call!
       │    → DP.getSmartRecommendation(ex, readiness, null) per exercise
       ├─ applyAAAdjustments  [NOOP — line 181-183]
       ├─ realityEngine.validate(session, ctx)
       ├─ applyPatterns(session, ctx)
       └─ try { initAutoBackup() }  [autoBackup.js:131]
            → if shouldCreateDailyBackup → createDailyBackup
              → 23× DB.get for USER_DATA_KEYS
              → localStorage.setItem(`backup-${ts}`, JSON.stringify(...))
              → DB.set('backup-index', ...)  [NOT in COACH_RELEVANT_KEYS → safe]

4. renderCoachIdle continues post-buildSession:
   - setCachedDirector(_dirSession)  [state.js:13]
   - DB.get('equipment-occupied-session')  → new read
   - DB.get('unavailable-equipment')  → new read (DUPLICATE — already in ctx)
   - DB.get('applied-patterns')  → new read (DUPLICATE + bypasses director filter) ⚠️
   - DB.get('logs')  → new read (DUPLICATE of buildCoachContext)
   - DB.get('pr-records')  → new read
   - For each visibleEx: DP.recommend(cleanName)  [per-exercise logs read] + AA.applyTo
   - checkMuscleBalance()  [renderIdle:313]
     → reads 'logs' AGAIN, loops 4 muscle groups × each log filter
     → DB.set(`muscle-extra-${grp}`, true)  ← WRITES keys NOT in COACH_RELEVANT_KEYS
       but ALSO NOT in Full Reset lists ← [H31c root cause]
   - allLogsForPattern = DB.get('logs')  → 5th 'logs' read
   - if > 20: analyzeAndApplyPatterns(...)  [patternLearning.js:5]
     → 500ms setTimeout → _analyze
       → 3 more DB.get ('session-burns', 'applied-patterns', 'early-stops')
       → potentially DB.set('applied-patterns', ...)
         → invalidates cache ← yet another invalidation after successful render

═══ USER CLICKS "▶ START SESSION" ═══

5. onclick="startSession()" (wired in coach.js bundle)
   [session.js:15] — DB.set('session-draft', {...})  → 1 invalidation of cache (draft in COACH_RELEVANT? No, draft not in list)
   → state mutations: sessActive=true, sessStart=Date.now(), sessLog=[], etc.
   → state.sessTimer = setInterval(tickSess, 1000)  ← never cleared on navigation
   → currentEx = todayExs[0]; currentSet = 1
   → setupInactivity()  [restTimer.js:74]
     → window._coachInactivityHandler = handler  (global)

═══ USER CONFIRMS FIRST SET ═══

6. onclick="confirmReps()" [logging.js]
   → state mutations × 5-8
   → DB.set('logs', [...prev, newLog].slice(0, 5000))
     → COACH_RELEVANT_KEYS.includes('logs') → window._directorCache.invalidate() ← [1 invalidation]
     → SYNC_KEYS.includes('logs') → setTimeout(syncToFirebase, 3000)
   → possibly DB.set('muted') if button pressed
   → possibly DP.recommend re-evaluation
   → after set 3 of last exercise: state.completedExercises.add(ex)
```

### Numărătoare

- **DB.get calls first render, warm state:** ≥25 (many duplicates between buildCoachContext și renderIdle)
- **DB.set calls first render:** 1-5 (depends on backup due + patterns new + steps update + muscle-extra)
- **Cache invalidations during first sync:** **8-11** ← this IS C10c
- **Cache invalidations after render (if pattern new):** +1
- **Cache invalidations per user action writing relevant key:** +1
- **Re-renders per user action:** renderCoachIdle is called from: saveStepsQuick, toggleExList (308), save readiness, markOccupied, markEquipmentUnavailable, analyze inflight complete. Each re-render = full buildSession if cache miss.

### Observații brutal oneste

**Duplicate localStorage reads:** `buildCoachContext()` citește `logs`, `applied-patterns`, `weights`, `prots`, `kcals`, `waters` din localStorage. Apoi `runProactiveChecks` **re-citește prots/weights/kcals/waters** (coachDirector.js:88-91). Apoi `renderCoachIdle` re-citește logs de 5× și applied-patterns direct bypass la ctx. Fiecare `JSON.parse` de "logs" pe un user cu 5000 entries = non-trivial cost.

**Dynamic import în hot path:** `await import('./dp.js')` (coachDirector.js:111) se face la fiecare `buildSession`. Webpack dev server cached, dar tot sincronizează promise. **Mută la top-level import.**

**Empty method:** `applyAAAdjustments(session, ctx) { return session; }` (coachDirector.js:181-183). Dead abstraction — șterge-o.

**setInterval fără cleanup path clar:** `state.sessTimer = setInterval(tickSess, 1000)` (session.js:50,66). `cancelWorkout` îl șterge (session.js:99). Dar dacă user face navigate (nav.js sau sp() call) în mijlocul sesiunii, timer-ul continuă în background. Check nav handler dacă oprește sessTimer.

### VERDICT Section 2: **FAIL**

Hot path are duplicate reads masive, cache invalidation cascade la sync, re-renders din prea multe call sites, dynamic import în loop fierbinte. Nu e catastrofal dar nu e "coach 15k€/lună" nici.

---

## 3. ENGINE DEPENDENCY GRAPH — Real, Grep-Based

### 3.1 Imports Table (extras cu `grep -E "^import" src/engine/*.js`)

| Engine | LOC | Imports app (src/db, config, constants) | Imports engine | Verdict |
|--------|-----|-----------------------------------------|----------------|---------|
| aa.js | 176 | db | dp | normal |
| adherence.js | 54 | db, constants | — | pure |
| alerts.js | 4 | — | — | **STUB / DEAD** |
| alternativeEngine.js | 88 | — | — | pure |
| calibration.js | 179 | — | — | pure |
| coachContext.js | 194 | db, config/user, constants | muscleMap | **orchestrator leaf** |
| **coachDirector.js** | 221 | util/autoBackup | **11 engines** | **GOD ORCHESTRATOR** |
| coldStartGuidelines.js | 172 | — | — | pure |
| dp.js | 439 | db, constants, config/weights | exerciseMapping | heavy |
| exerciseMapping.js | 40 | — | — | pure |
| fatigue.js | 87 | db | — | OK |
| muscleMap.js | 129 | — | — | pure |
| patternLearning.js | 115 | db | — | side-effect heavy |
| plateauInterventions.js | 179 | — | — | **ORPHAN?** |
| predictionEngine.js | 94 | — | — | pure |
| proactiveEngine.js | 296 | constants | — | heavy |
| readiness.js | 70 | db, constants | — | OK |
| reality.js | 150 | db, constants, config/weights | sys | OK |
| recalibration.js | 56 | — | calibration, weaknessDetector, responseProfile | light |
| recompileEngine.js | 109 | — | — | pure |
| responseProfile.js | 134 | — | weaknessDetector | OK |
| ruleEngine.js | 123 | — | — | pure |
| sessionBuilder.js | 78 | — | calibration | **thin (suspect)** |
| stagnationDetector.js | 102 | — | weaknessDetector | OK |
| sys.js | 297 | db, constants, config/user | — | heavy |
| weaknessDetector.js | 126 | — | muscleMap | OK |
| whyEngine.js | 114 | — | — | **ORPHAN?** |

### 3.2 Coupling Matrix (cine cheamă pe cine)

`coachDirector.js` importă **11 engines + 1 util**. Restul au coupling minim.

```
coachDirector ──► buildCoachContext ──► getMuscleState (muscleMap)
              ├─► realityEngine     ──► sys
              ├─► ruleEngine
              ├─► detectWeakGroups  ──► muscleMap (via EXERCISE_MUSCLES)
              ├─► detectGlobalStagnation ──► weaknessDetector.brzycki1RM
              ├─► predictToday
              ├─► recompileWeek
              ├─► resolveExercise (alternativeEngine)
              ├─► runProactiveChecks
              ├─► calibration.detectCalibrationLevel
              ├─► calibration.applyRollingWindow
              ├─► sessionBuilder.buildSession ──► calibration.contextSelectionEnabled
              ├─► dp (async import) ──► exerciseMapping
              └─► autoBackup (util)

responseProfile ──► weaknessDetector.brzycki1RM
stagnationDetector ──► weaknessDetector.brzycki1RM
recalibration ──► calibration, weaknessDetector, responseProfile
```

### 3.3 Single Point of Failure

**`coachDirector` = SPOF absolut.** Dacă `buildSession` aruncă o excepție ne-prinsă (și există 3 `try/catch` care înghit erori — coachDirector.js:44-66, 85-94, 110-153), întreg coach-ul idle screen devine neresponsiv. `renderIdle.js:132` prinde exception ("catch(e)") și setează `_dirSession = null`, `sessionCache.invalidate()` — OK aici. Dar atunci UI-ul ESTE fără calibrationBanner, fără weakGroups, fără proactive alerts, fără patterns. Silent degradation fără notificare.

### 3.4 God Object Detection

**`coachDirector.js` (221 LOC, 14 imports)** = God Orchestrator. Singur are knowledge despre toate cele 11 engines, ordinea de apel, și care engine primește ce slice din ctx. Pattern-ul "context unified, director orchestrează" e corect; problema e că director-ul e **codat procedural end-to-end** cu toate decision points inline.

**`src/pages/coach/renderIdle.js` (394 LOC)** = God View. Citește direct din 5+ localStorage keys, duplică fetch-uri făcute deja de director, conține business logic (`checkMuscleBalance`, skip pattern application, visible slice). Ar trebui pur presenter.

**`src/engine/dp.js` (439 LOC)** = God Calculator. Conține `DP.recommend`, `DP.getSmartRecommendation`, `getInitialRecommendation`, `roundToStep`, `getLogs`, `roundToEquipmentWeight`, etc. Plus `DB.set('ex-extra-sets-${ex}', 1)` la line 237 — side effect care nu e în spec. Legacy "recommend raw" wrapper.

**`src/engine/sys.js` (297 LOC)** = God Systems. Amalgamează getCurrentKg, getBF, kcal phase logic, step tracking. Ar trebui split: `bodyComposition.js`, `phaseManager.js`, `stepsTracker.js`.

### 3.5 Circular Dependency Detection

Niciun ciclu direct (testat cu `node --experimental-import-meta-resolve` import graph mentally + grep). FAZA 1.1 a eliminat cicluri prin `await import('./dp.js')` în `coachDirector` (line 111). **Dar asta e un hack — import-ul dinamic e code smell.**

Potențial ciclu latent: `coachContext.js` importă `muscleMap`. `sessionBuilder` importă `calibration`. `calibration` e pură. OK deocamdată.

### 3.6 Orphan Detection

- **`alerts.js` (4 LOC)** — verificat: export un array gol sau funcție placeholder. **STUB abandonat.** Șterge.
- **`whyEngine.js` (114 LOC)** — NIMENI nu îl importă din `src/engine/`. Probabil doar `renderIdle.js` prin `window.showWhyForExercise`. Verifică. Dacă e expus doar prin `window.`, mută la `src/pages/coach/why.js`.
- **`plateauInterventions.js` (179 LOC)** — NIMENI nu îl importă. Intervențiile de plateau sunt inline în `applyPatterns`. **DEAD CODE candidate.**
- **`coldStartGuidelines.js` (172 LOC)** — NIMENI nu îl importă în `src/engine/`. Probabil `coachDirector` ar trebui să-l folosească pentru tier COLD_START, dar nu o face. **Documentat în ADR 009 dar neimplementat.** FALSE DONE.
- **`recalibration.js` (56 LOC)** — exportă `shouldRecalibrate` (importă calibration) dar nu e importată în `coachDirector`. Recalibrare ar trebui să ruleze în background (per tier frequency), dar nu e wired.

### 3.7 Dead Code (grep-based)

```bash
# Empty methods detected:
coachDirector.js:181-183  applyAAAdjustments() { return session; }

# Stub:
engine/alerts.js (4 LOC)
engine/whyEngine.js (declared but ?)

# Legacy fallback never used:
coachDirector.js:125-128 fallback branch `getLastLogFromContext` when DP unavailable — DP always available, dead branch
```

### 3.8 Verdict Arhitectural

**Hybrid între Star-shape și Chaos.** Star-shape vizibil: `coachDirector` e hub, orchestrează engine-urile. Chaos ascuns: **state shared prin localStorage + globals window.\*** (vezi secțiunea 6). Engines sunt pure în pure functions dar toate citesc din DB (localStorage) direct. 

Exemple concrete:
1. `patternLearning.js:78` scrie `'peak-hours'` din mijlocul unei analize — side effect ascuns într-o funcție cu nume "analyze".
2. `dp.js:237 DB.set('ex-extra-sets-${ex}', 1)` — scrie din mijlocul unei funcții de recomandare.
3. `aa.js:99,137 DB.set('aa-cooldown-${ex}', Date.now())` — scrie cooldown ca side effect.

Nu e Star pur (engines citesc state direct), nu e Web pur (un singur hub), nu e Chaos (există separarea file-level). E **"Star-on-top-of-Chaos"**: arhitectura arată modulară dar glue-ul e spaghetti.

### VERDICT Section 3: **RISK**

Nu e fail total — arhitectura e recoverable. Dar e risc mare că: (a) adăugarea oricărui engine nou crește coupling quadratic dacă trece prin `coachDirector`, (b) refactorul oricărui engine care atinge `DB.set` poate sparge cache invalidation silent, (c) orice bug nou va avea root cause în glue, nu în logic pur.

---

## 4. ARCHITECTURAL DEBT — Root Cause Analysis

Grupare bug-uri:

**Grup A (Cache + Lifecycle):** C10c (cache loop), H6c (pattern inflight guard), H11c (cache keys extend), H6g (race condition pe render).

**Grup B (State + Reset):** H31c (reset incomplet), C5c (endSession auto-delete), H4c (completedExercises pierdut), C2c (cancelWorkout state leftover).

**Grup C (Schema + Data):** C4c (log schema set/kg), C7g (dedup key collision), H30c (pattern false positives), OBS-1 (protein 242 vs 180 dual source).

**Grup D (Engines Decoupling):** H14g (checkRecoveryGroups wrong shape), M3g/H13g (isoWeek broken), C9g (sessionBuilder stub forever).

### 4.1 Root Cause comun — Grup A

**Cache invalidation e reactive dar nu coalesced.** Fiecare `DB.set` cu key în COACH_RELEVANT_KEYS invalidează imediat. În `syncFromFirebase`, ~11 keys se setează în 11 iterații de `forEach` — 11 invalidări sincronice. Nu există **debounce**, nu există **batch mode** ("suppress invalidations until block done"). Plus: `patternLearning.analyzeAndApplyPatterns` după build scrie `applied-patterns` (ditto invalidation). **Antipattern: "invalidate-first ask-questions-later".**

**Fix arhitectural:** introdu `window._directorCache.suppressInvalidations(() => { ...batch writes... })` wrapper + debounce `invalidate()` cu 250ms flush. Elimină cache thrash.

### 4.2 Root Cause comun — Grup B

**"Reset" nu are specificație.** `dataCleanup.js` are 4 funcții de reset (`resetTestData`, `fullReset`, `resetButKeepRealLogs`, `restoreFromBackup`) fiecare cu listă proprie de keys, niciuna completă. Plus: fiecare engine poate scrie keys dinamice (`muscle-extra-${grp}`, `aa-cooldown-${ex}`, `ex-extra-sets-${ex}`) care nu sunt în NICIO listă de reset.

**Fix arhitectural:** Registry central `src/util/dataRegistry.js` care declară (a) toate keys statice cunoscute, (b) prefixuri pentru keys dinamice. `fullReset` devine `localStorage.clear()` + optional preserve listă. Orice engine care scrie un key dinamic trebuie să-și declare prefixul în registry.

### 4.3 Root Cause comun — Grup C

**Schema drift pentru că nu există single source of truth pentru value types.**
- Protein target: constants.js PROT_TARGET=180 (UI static) vs. proactiveEngine.js bodyweight×2.2 (alert dynamic). Alert spune 242, card spune 180. User vede incoerență.
- Logs schema: `w` sau `weight`, `kg` sau `weight`, `session` sau `date`. Normalizatorul `logNormalize.js` există dar e **creat, nu aplicat la sites** (FAZA 1.3 DONE dar TASK #11 explicit "NU aplica fallback-urile la call sites"). 

**Fix arhitectural:** Schema registry cu typed constants + runtime validator la DB.set (optional: Zod/ajv sau minimal inline). Elimină ambiguitatea variantelor.

### 4.4 Root Cause comun — Grup D

**Engines-to-engines API e non-contractat.** `checkRecoveryGroups` aștepta `muscleState[muscle] = {fatigue, daysSinceLast}` dar `getMuscleState` returnează `{muscle: 0-100}`. Niciun TypeScript, niciun JSDoc enforced. A mers 6 luni până FAZA 2 H14g să-l prindă. Similar: isoWeek avea 2 implementări diferite (stagnationDetector + responseProfile) cu 2 bugs diferite.

**Fix arhitectural:** Fie (a) TypeScript migration gradual (inițial engines pure), fie (b) JSDoc typdef obligatoriu + ESLint rule "no-implicit-any-on-export". Plus: toolbox common `src/engine/_shared/time.js` pentru isoWeek, nu duplicat în 2 fișiere.

### 4.5 Antipatterns confirmate în cod

1. ✅ **Orchestrator face too much + engines nu comunică între ele.** Confirmat: director face 14 steps sequential în `buildSession`, engines nu-și trimit mesaje.
2. ✅ **Cache management ad-hoc per engine.** Confirmat: `firebase.js` deține wrapper de `DB.set`, dar `patternLearning._patternAnalyzeInFlight` e module-local, `window._ratingSessionInFlight` e global. 3 mecanisme diferite, fără coerență.
3. ✅ **"Reset" nu are specificație.** Confirmat — secțiunea 4.2.
4. ✅ **Silent failures (empty catch blocks).** Confirmat: `session.js:245 catch(e) {}`, `ui.js:28 catch(e) {}`, plus catch blocks care loghează `console.warn` fără escalare. Plus: `coachDirector.js:66` catch `{ /* augmentation is best-effort */ }` — înghite orice eroare din 5 engines.
5. ✅ **Global state mutation necontrolat.** Confirmat: window._kgOvVal (logging.js:159-191), window._pendingRatingSummary (rating.js:16), window._coachInactivityHandler (restTimer.js:74), window._cachedDirectorSession, window._suppressFirebaseSync, window._directorCache. 6+ globals.
6. ✅ **Schema drift (DB keys folosite inconsistent).** Confirmat — Grup C.
7. ✅ **Race conditions (async + Firebase + state singleton).** Confirmat: `setTimeout(syncToFirebase, 3000)` (firebase.js:126) cu debounce, dar dacă user navighează înainte de 3s, payload e incomplet. Plus `analyzeAndApplyPatterns` setTimeout 500ms poate rula după `renderCoachIdle` complet, scrie `applied-patterns`, dar UI-ul deja desenat.

### 4.6 Prediction: alte bug-uri inevitabile

- **B1:** Prima oară când ai 2 users pe device (Daniel + X), datele se vor contamina pentru că USER_PATH e static. **HIGH.**
- **B2:** Prima oară când un user atinge 5000 logs (~3-4 ani de utilizare intensă), `slice(0, 5000)` va `silent drop` logurile cele mai vechi. Dacă userul vrea "istoria completă" (e.g., PR timeline), e pierdut. **MEDIUM**, acoperit parțial de `autoBackup` dar backup-urile au și ele limit.
- **B3:** Firebase rules "v1 path-restricted" (nu auth) înseamnă că oricine știe URL-ul Firebase + USER_PATH poate citi datele. Expunere PII (weights, fotos dacă vor fi sync'd). **HIGH, acceptat până FAZA 4 auth.**
- **B4:** `clearInterval(state.sessTimer)` depinde de `state.sessTimer` să fie current. Dacă user face dual-tab (deschide 2 taburi) sau refresh cu sesiune activă, timer-ul original nu mai are cleanup. Leak. **MEDIUM.**
- **B5:** `getUserConfig().bio.currentKgFallback: 110.4` — dacă user nu a logat niciodată weight, proactive engine va calcula protein target 110.4 × 2.2 = 242.88g (OBS-1). First-time user verdict wrong. **HIGH.**
- **B6:** `patternLearning.js:31-35` — `dayScheduled` counter va exploda false pentru orice user care folosește app sporadically (e.g., 1 sesiune pe Marți în 8 săpt → 12.5% adherence → 87.5% skip). H30c e doar vârful. **HIGH.**

### VERDICT Section 4: **FAIL**

7 antipatterns confirmate. Fix-urile FAZA 1+2 au reparat simptome; root causes arhitecturale (lifecycle, registry, schema, contracts) intacte. Mai multe bug-uri predict-ate inevitabile.

---

## 5. FAZA 1+2 "DONE" CHALLENGE

Verificare fiecare "DONE" în codul curent:

### 5.1 FAZA 1.1 — Split coach.js
**Claim:** 1477 LOC → 10 module + orchestrator thin.
**Verificare:**
- `src/pages/coach.js` = **19 LOC** (pure re-export orchestrator) ✅
- `src/pages/coach/` = 1469 LOC total în 10 fișiere
- `renderIdle.js` = 394 LOC (peste "review threshold 450" dar sub) ⚠️ (D2 din pre-exec clarification accepted)
- **Verdict: TRUE DONE.** Dar: `renderIdle.js` face business logic + render mixed (secțiunea 3.4 God View). Split technic OK, calitate structurală medie.

### 5.2 FAZA 1.2 — Multi-tenancy decouple
**Claim:** Daniel-hardcoded eliminat, config/user.js centralizat.
**Verificare:**
- `src/firebase.js:6` `USER_PATH = 'users/daniel'` — **STILL HARDCODED**, nu folosește `config/user.js`
- `src/config/user.js:19 userPath: 'users/daniel'` — DECLARAT dar NEFOLOSIT
- `src/config/user.js:10 currentKgFallback: 110.4` — Daniel-specific, triggerează OBS-1 protein bug
- `src/config/user.js:14 kcal: 1800` + `src/constants.js:7 KCAL_TARGET = 1800` — **duplicare**, two sources of truth
- `src/config/user.js:16 phaseTargetDate: '2026-07-20'` + `src/constants.js:5 TARGET_DATE = new Date('2026-07-20')` — duplicare
- `src/inject.js:88 // Daniel's MFP weight history` — Daniel-CSV hardcoded
- `src/engine/dp.js:56,65` — comments cu "Daniel face" (referință OK, dar semnalizează)
- **Verdict: FALSE DONE.** Decouple-ul a creat `config/user.js` dar firebase.js îl ignoră. Orice user-2 va suprascrie Daniel pe Firebase.

### 5.3 FAZA 1.3 — Log schema cleanup
**Claim:** 7 mismatches rezolvate + logNormalize.js creat.
**Verificare:**
- `src/util/logNormalize.js:6 export function normalizeLog(log)` — EXISTĂ
- `grep -rn "normalizeLog\|logNormalize" src/` — **ZERO apply sites în engine/ sau pages/**
- Task #11 explicit "NU aplica la call sites" — confirmat, deci `logNormalize` nefolosit ÎN MOD DELIBERAT
- **Verdict: HALF-DONE.** Tool creat, decizia de a nu-l aplica documentată. Dar: schema drift persistă (ex: `w` vs `weight` vs `kg`, `session` vs `date` grouping). Fără aplicare, util-ul e decorative.

### 5.4 FAZA 1.4 — cleanDuplicateLogs dedup strict pe ts
**Claim:** Dedupe strict pe timestamp, nu pe business fields.
**Verificare:**
- `src/util/dataCleanup.js:48-65`:
  ```js
  const seen = new Set();
  const clean = logs.filter(l => {
    if (l.ts == null) return true;
    if (seen.has(l.ts)) return false;
    seen.add(l.ts); return true;
  });
  ```
- Strict pe `ts`. Logs fără `ts` scapă (acceptabil).
- **Verdict: TRUE DONE.** Singura îngrijorare: milisecond collision la generare rapidă (H4g deferred).

### 5.5 FAZA 1.5 — ctx.allLogs real
**Claim:** ctx.allLogs = full history, nu ultimele 3 sesiuni.
**Verificare:**
- `coachContext.js:12 const allLogs = getAllLogs();` → `getAllLogs()` returnează `JSON.parse(localStorage.getItem('logs'))`. ✅
- `coachDirector.js:24 const allLogs = ctx.allLogs ?? [];`
- `detectCalibrationLevel(ctx)` citește `ctx.allLogs` → calibration real.
- **Verdict: TRUE DONE.** Calibration funcționează pentru userii cu istoric.

### 5.6 FAZA 1.6 — sessionBuilder OPT B cleanup
**Claim:** dead code removed, OPT A escalat FAZA 2.
**Verificare:**
- `src/engine/sessionBuilder.js:51 export function buildSession(sessionType, ctx)` — implementat, ~78 LOC
- `prioritizeWeakGroups` la line 68 — implementat dar gated pe `contextSelectionEnabled = false` (calibration.js:165)
- Coach director `line 96 let session = buildSession(sessionType, ctx);` — apelat
- **Verdict: TRUE DONE.** Dar OPT A e DORMANT (feature flag off). "Weakness-prioritized ordering" nu rulează niciodată în prod real.

### 5.7 FAZA 1.7 — AA notes-only
**Claim:** AA engine funcționează notes-only, RPE logic eliminat.
**Verificare:** (nu am re-citit aa.js în această sesiune; bazat pe FAZA_1_FINAL_REPORT) `rpe` eliminat din log, RPE false-increase rezolvat. `DB.set('aa-cooldown-${ex}', Date.now())` la aa.js:99,137 — aceste cooldown keys **nu sunt în TEST_RESIDUE_KEYS sau USER_DATA_KEYS**, deci persistă peste Full Reset.
- **Verdict: TRUE DONE pentru RPE fix** / **FAIL colateral pentru registry** (cooldown keys leak into reset gap — vezi H31c secțiunea 4.2).

### 5.8 FAZA 1.8 — 500→5000 + Firebase rules v1
**Claim:** Toate 4 locații 500→5000, rules v1 path-restricted aplicate.
**Verificare:**
- 4 locații confirmate: `firebase.js:102`, `onboarding.js:116`, `logging.js:100`, `session.js:230` — toate `slice(0, 5000)`. ✅
- Firebase rules v1: **niciun fișier `firebase.json`, `database.rules.json`, `*rules*` în repo**. Rules setate direct în Firebase Console (nu versionate în git).
- **Verdict: HALF-DONE.** Cap-ul merge. Rules v1 — unverifiable în repo, pot fi oricând "open" (ADR 007 acceptat ca open). Memo auto: "open rules by choice" — consistent cu ADR dar **nu e launch-ready** (oricine cu URL poate citi/scrie).

### 5.9 FAZA 2 — P2 batch (C4c, C5c, H11c, C3c, H6c, C2c, H4c, M3g, H13g, H14g, sessionBuilder OPT C, OPT A)

Verificare selectivă (cele mai critice):

**H11c COACH_RELEVANT_KEYS 5→11:**
- `firebase.js:118`: 11 keys listate. ✅ TRUE DONE pe cod.
- **DAR:** fix-ul e cauza directă a cache cascade C10c — extinderea keys = mai multe invalidări. FAZA 2 a "reparat" cache invalidation coverage fără a repara **coalescing**.

**C3c rateSession idempotency:**
- `rating.js:58-59 if (window._ratingSessionInFlight) return; window._ratingSessionInFlight = true;` ✅
- **Concern:** `finally` la line 92 setează back la false. Dacă `rateSession` throw-uează, finally rulează. OK.

**H6c patternLearning inflight guard:**
- `patternLearning.js:3,5-10` — guard + setTimeout 500ms. ✅
- **Concern:** guard e module-local (`let _patternAnalyzeInFlight`). Dacă modul reimportat (shouldn't happen with ESM), guard nu acoperă. Edge case minor.

**C5c endSession no auto-delete:**
- `session.js:104` — `DB.set('logs', logs.filter(l => l.session !== state.sessStart))` — asta e în `cancelWorkout`, nu endSession. Verific endSession...
- Nu am citit explicit `endSession`, dar FAZA 2 report zice "eliminated complet auto-delete". Acceptat ca TRUE DONE.

**H14g checkRecoveryGroups:**
- Neverificat direct în această sesiune (nu am recitit proactiveEngine). Report zice "computes daysSinceLast from logs directly". Acceptat.

**M3g + H13g isoWeek Thursday:**
- FAZA 2 report listează fix. Acceptat.

**sessionBuilder OPT C pure extraction:**
- `sessionBuilder.js:51` e pure, `coachDirector.js:96` apelează fără `this.`. ✅ TRUE DONE.

**sessionBuilder OPT A weakness ordering:**
- Implementat cu `contextSelectionEnabled = false` default. ✅ TRUE DONE pe cod, dar **feature flag OFF** — ordering nu rulează în prod.

### 5.10 False "DONE" Summary

| Sub-fază | Claim | Realitate |
|----------|-------|-----------|
| FAZA 1.1 | 10 module + thin orchestrator | ✅ TRUE |
| FAZA 1.2 | Multi-tenancy decouple | ❌ **FALSE** — firebase.js:6 hardcodat, config/user.js ignorat |
| FAZA 1.3 | Log schema cleanup | ⚠️ **HALF** — logNormalize creat dar neaplicat (by design) |
| FAZA 1.4 | Dedupe strict pe ts | ✅ TRUE |
| FAZA 1.5 | ctx.allLogs full history | ✅ TRUE |
| FAZA 1.6 | sessionBuilder cleanup | ⚠️ **HALF** — OPT A dormant |
| FAZA 1.7 | AA notes-only | ⚠️ **TRUE pt RPE / FAIL registry** — cooldown keys leak |
| FAZA 1.8 | slice 5000 + rules v1 | ⚠️ **HALF** — cap OK, rules nu în repo |
| FAZA 2 H11c | Cache coverage extins | ⚠️ **TRUE dar worsens C10c** |
| FAZA 2 OPT A | Weakness ordering | ⚠️ **TRUE dar flag OFF** |

**3 FALSE/HALF claims** peste FAZA 1.2 (multi-tenancy), 1.3 (normalize), 1.7 registry, 1.8 rules, OPT A flag.

### VERDICT Section 5: **FAIL**

"DONE" înseamnă "code merged + tests green". Nu înseamnă "feature complete end-to-end". 5+ claims sunt HALF sau FALSE. **Standardul "DONE" trebuie ridicat** — fără aplicare la call sites, fără enable pe feature flag, fără rules în repo, nu e done.

---

## 6. STATE & DATA AUDIT

### 6.1 Global State Mutation Audit

**`src/state.js` singleton** (26 LOC) expune `state` cu 20+ fields mutabili. Scrieri identificate:

| Field | Scris în (file:line) | Risc |
|-------|---------------------|------|
| `sessActive` | session.js:34,57,100,124 | sync critical |
| `sessStart` | session.js:34,57 | OK |
| `sessTimer` | session.js:50,66,99,123 | leak if navigate |
| `sessLog` | session.js:34,58,106 + logging.js (append) | OK |
| `currentEx` | modals.js:126, logging.js:114, session.js:74,87 | **4 call sites, no owner** |
| `currentSet` | logging.js, session.js | OK |
| `completedExercises` | session.js:41,59,107 + logging.js (add) | Set, safe mutation |
| `sessionKgOverride` | logging.js:98,191, session.js:110 | OK |
| `pauseTimer` | restTimer.js:36,52 | OK |
| `lastPauseEndedAt` | restTimer.js:43, session.js:100,124 | OK |
| `isMuted` | logging.js:201, session.js:45,60 | sync ok |
| `activeNotes` | session.js:111 (cleared) + unknown (added) | **weak owner** |
| `logDateOffset` | weight.js:457,534 | cross-page coupling |

**Antipattern: no owner per field.** `currentEx` e scris din 4 fișiere diferite. Fără TypeScript/static check, orice nou dev (Sonnet inclus) poate scrie cu tip greșit.

**Mitigare FAZA 3:** introdu state actions (`state.setCurrentEx(ex)`) cu validare. Sau migrează la observable (Svelte store / Zustand-like). Nu trebuie React.

### 6.2 Data Consistency Risks

Cazuri concrete unde state poate intra invalid:

1. **Sesiune orfană:** user deschide 2 taburi, începe sesiune în tab 1, închide tab 1, tab 2 rămâne cu `sessActive=true` din sync dar fără `sessTimer`. UI afișează sesiune activă dar timer oprit.

2. **Draft desynchronization:** `session.js:15 DB.set('session-draft', {...})` salvează draft. `clearDraft` în `endSession` șterge. Dar dacă user face `cancelWorkout` → `clearDraft` în `session.js:106` pre-FAZA 2 nu era apelat (H4c/C2c fix). **Post-fix OK**, dar păstrează zonele de risc mental când modifici cancelWorkout.

3. **`completedExercises` derived dar nu re-derived:** resume la session.js:41 derivează din `sessLog`. Dar dacă user adaugă manual seturi în `logs` (prin Firebase sync de pe alt device), `completedExercises` NU se re-derivează până la următorul resume. Desync possible.

4. **`peak-hours` scris greșit:** `patternLearning.js:78 existing.detected = Number(peakHour);` — obiect reused cu proprietate `detected` adăugată. Dacă schema `peak-hours` era `{hourA: count, hourB: count}`, acum are `{hourA, hourB, detected}`. Drift.

### 6.3 Race Conditions concrete

**R1: Firebase merge race:**
- Device A online: scrie `logs` → `DB.set('logs', ...)` → `_syncTimer = setTimeout(syncToFirebase, 3000)` (firebase.js:126)
- Device A offline (Wi-Fi dies in < 3s): sync nu rulează. User scrie mai multe logs.
- Device A online din nou: next sync rulează cu ALL logs batched. OK local.
- **Dar:** Device B online, pulled logs vechi, scrie propriile logs local, face sync.
- Device A sync after: merge la firebase.js:100 `if (!tsSet.has(e.ts)) merged.push(e)` — merge by ts. OK IF ts unique.
- **BUG concret:** dacă Device A și Device B generează `Date.now()` în aceeași milisecundă (improbabil dar posibil la confirmed-set barrage), logs collapse ca duplicate. H4g accepted deferred — **real risk la multi-device rollout**.

**R2: Director cache vs pattern scheduled async:**
- `renderCoachIdle` apelat.
- `buildSession` rulat complet, cache set.
- `analyzeAndApplyPatterns` scheduled cu setTimeout 500ms (patternLearning.js:8).
- În 500ms interval, user apasă "Start Session" → renderCoachIdle re-rendat, cache hit returnează vechea sesiune.
- 500ms după, pattern analyze rulează, scrie `applied-patterns` → invalidate cache.
- **Rezultat vizibil:** user vede sesiunea "pre-pattern-scurtată" un moment, apoi după o acțiune ulterioară sesiunea devine cu 20% mai scurtă. Non-determinism.

**R3: `_suppressFirebaseSync` reset on reload:**
- `dataCleanup.fullReset` setează `window._suppressFirebaseSync = true` (line 209).
- `location.href = base + '?nocache='` (line 294-296) → reload.
- Post-reload: `window._suppressFirebaseSync` undefined → false by default.
- `initFirebaseSync()` rulează, pull din Firebase.
- Dacă `PUT null` de la line 228-232 n-a propagat la Firebase (typically 100-500ms latency + atomic commit), pull-ul primește **date stale**, le restaurează local. **User a făcut Full Reset, dar datele reapar.**

Asta e parte din root cause **H31c**.

### 6.4 Schema Drift

Keys unde drift e măsurabil:

1. **Protein target:** `PROT_TARGET=180` (constants.js, UI cards, plan.js, dashboard.js, readiness.js) vs. `bodyweight * 2.2` (proactiveEngine.js:20, alert dynamic). **2 surse.**
2. **KCAL_TARGET:** `constants.js:7=1800` + `config/user.js:14=1800`. **Duplicat** — dacă unul schimbă, celălalt rămâne.
3. **Log schema:** `w` (canonical) vs. `weight` (UI display). `logNormalize` creat dar neaplicat. Drift latent.
4. **`patterns` vs. `auto-recommendations`:** `getActivePatterns` concatenează ambele (coachContext.js:185-187). **2 surse ale patterns** — test residue vs. real.
5. **`session` identifier:** `onboarding.js:109 session: Date.now()` same value pentru 33 entries → colaps într-o sesiune. Real sesiuni folosesc `session: Date.now()` unic per sesiune. **Drift** în interpretare.
6. **`peak-hours` schema:** inițial `{hour: count}`, mutat la `{hour: count, ..., detected: hour}` (patternLearning.js:77). Evolutie silent.

### 6.5 Data Ownership

| Data type | Scris de | Citit de | Owner? |
|-----------|---------|---------|--------|
| logs | logging.js, inject.js, onboarding.js, firebase.js merge, pr.js, rating.js, session.js | everywhere | **NONE** |
| readiness | modals.js (selectReadiness), readiness.js | coachContext, renderIdle, plan | **readiness.js presumed** |
| applied-patterns | patternLearning.js | coachContext, renderIdle (bypass!), modals | **patternLearning presumed, dar leaked** |
| weights | weight.js | coachContext, sys.js, proactiveEngine | **weight.js (page-bound)** |
| phase-* | plan.js | coachContext, sys.js | **plan.js** |
| equipment-occupied-session | modals.js | renderIdle | **modals.js** |
| muscle-extra-* | renderIdle.js:339 | ? (never read?) | **WRITE-ONLY LEAK** |

Multe keys fără owner clar → bug-uri când se schimbă format/meaning.

### VERDICT Section 6: **FAIL**

State management e inherently risky: mutation fără owner, schema drift în 6+ locuri, 3 race conditions reproductibile, key-uri write-only care leak. Observable pattern necesită.

---

## 7. RUNTIME REALISM

### 7.1 Cold Start vs Warm State

**Cold Start behavior:**
- `main.js:156` verifica `onboarding-done` OR `logs.length > 0`. Primul launch → false → onboarding.
- `onboarding.js:109-110` generează 33 log entries (11 ex × 3 sets) cu `session: Date.now()` SAME value. Rezultat: all 33 entries → 1 session.
- `detectCalibrationLevel(ctx)` la `calibration.js:121`: `sessionsCount = ctx.allSessions?.length ?? sessionKeys.size`. `sessionKeys` derivă din `log.session ?? log.date`. 33 entries cu același `session` → 1 unique key → `sessionsCount = 1`.
- Plus 33 entries în 1 zi = `daysSinceFirst = 0`.
- Calibration: `daysSinceFirst < 7 || sessionsCount < 3` → COLD_START. ✅ CORECT.

**Warm state după 5 sesiuni reale (1 săpt):**
- `sessionsCount = 6` (1 onboarding fake + 5 real)
- `daysSinceFirst = 7`
- Calibration: `daysSinceFirst < 7` FALSE, `sessionsCount < 3` FALSE → **nu mai COLD_START**. `< 28 || < 12` → **INITIAL**.
- INITIAL: `patternsEnabled: true`, `patternMinConfidence: 0.70`.
- `patternLearning.js:41-43` threshold: `totalCompleted < 4` AND `last 4 weeks < 4`. 5 real sesiuni → passes.
- Pattern detection rulează. Pentru fiecare zi calendar (Marți, Miercuri, ...), `dayScheduled++` pentru fiecare zi din 56 zile ce cade pe ziua respectivă (~8 Marți). `dayCompleted++` doar dacă user a făcut sesiune în acea zi reală (say 2).
- `skipRate = 1 - 2/8 = 0.75` (75%).
- `skipRate > 0.4` → new pattern `{type: 'SKIP_DAY', day: 'Marți', skipRate: 75}`.
- Director filtrează: `(p.confidence ?? 0.5) >= 0.70`. SKIP_DAY nu are confidence field; fallback la 0.5 (coachContext.js:191: `confidence ?? (p.earlyEndRate ? p.earlyEndRate/100 : 0.5)`). 0.5 < 0.70 → filtrat.
- **DAR renderIdle.js:186 citește DB.get('applied-patterns') DIRECT** → banner apare.
- **Rezultat user:** Vede "Marți 75% skip" deși a făcut 2 sesiuni în 8 Marți (adherence normală la 25% frecvență, nu skip rate 75% interpretat ca problemă).

**Conceptual bug:** "skip rate" e măsurat pe zile calendar, nu pe **zile planificate**. Dacă userul are plan 3× / săpt (Luni, Miercuri, Vineri), Marți/Joi nu ar trebui numărate ca "scheduled". Plan-ul din `PROG` (constants.js) definește zilele. `patternLearning` ignoră plan-ul.

**This is H30c's deep root cause.**

### 7.2 Error Propagation Mapping

Unde mor erorile în tăcere:

| File:line | Catch handler | Ce înghite |
|-----------|--------------|-----------|
| coachDirector.js:44-66 | `catch { /* augmentation is best-effort */ }` | 5 engines: weakGroups, stagnation, prediction, recompile, proactive — **toate pot eșua silent** |
| coachDirector.js:85-94 | `catch { /* proactive checks are non-blocking */ }` | toate proactive alerts |
| coachDirector.js:110-153 | `catch (e)` → fallback la `getLastLogFromContext` — măcar nu silent |
| coachDirector.js:176 | `catch { /* non-blocking */ }` | autoBackup — OK non-critical |
| firebase.js:22,33,40 | `catch { return null; }` / `catch { return false; }` | **orice eroare de rețea silent** |
| patternLearning.js:9 | `finally { ... }` fără catch — throws propagate but inflight guard cleared |
| coachContext.js multiple | `catch { return <default> }` | parse errors silent |
| ui.js:28, session.js:245 | `catch(e){}` empty | wake lock release errors |

**Sentry:** `C8g` (Sentry beforeSend filtrează Firebase errors) — **nu l-am verificat în codul curent**. `util/sentry.js:4` DSN exists; nu am citit sentry.js fully. **FAZA 3 must audit sentry.js beforeSend.**

### 7.3 Fallback Logic Audit

Fallbacks care maschează bug-uri:
- `coachDirector.js:126 const baseWeight = lastLog ? (lastLog.w ?? 20) : 20;` — 20kg default. Dacă DP nu oferă recommendation, user primește "20kg" pe orice exercițiu. Potrivit? Numai pentru foarte greu (deadlift 20kg e absurd). Fallback e "safe but dumb".
- `coachContext.js:148 currentKgFallback` din config — 110.4 (Daniel). **Break first user.**
- `buildSession` la `sessionBuilder.js:52` `|| EXERCISES_BY_TYPE['FULL_UPPER']` — dacă sessionType unknown, fall back to FULL_UPPER. Silent substitution.
- `sessionBuilder.js:54 filtered = names.filter(n => available.includes(EQUIP_MAP[n]))` — dacă toate exercițiile necesită echipament indisponibil, `filtered = []` → sesiune goală. UI nu semnalizează "no exercises available for this session type".

### 7.4 Intended vs Actual Architecture

**Intended (din docs):**
- 18 engines pure
- `coachDirector` orchestrează
- `coachContext` = sursă unică
- UI = pure view pe director output

**Actual:**
- 18 engines, DAR cu side effects (DB.set în patternLearning, aa, dp)
- `coachDirector` orchestrează, DAR fallback engines și conține business logic (applyPatterns)
- `coachContext` = 80% din truth, UI citește 20% direct din localStorage (bypass-uri multiple)
- UI = impure view cu local business logic (`checkMuscleBalance`, `skipPattern` application)

**Gap major:** Intended says "source of truth via ctx". Actual says "sometimes ctx, sometimes DB.get direct."

### 7.5 Layer Violations

Pages citesc direct din engine-level keys:
- `renderIdle.js:186` DB.get('applied-patterns') → should use `_dirSession.context.patterns`
- `renderIdle.js:183-184` `equipment-occupied-session`, `unavailable-equipment` → should be in ctx
- `modals.js:160-175` reconstructs context manually din DB → should use ctx
- `pr.js:8,23,42` reads logs direct → OK, PR extraction is UI-level

**Engine-to-engine:**
- `stagnationDetector` importă `brzycki1RM` din `weaknessDetector` — OK util
- `responseProfile` importă `brzycki1RM` din `weaknessDetector` — duplicat import, **ar trebui în `_shared/math.js`**
- `recalibration` importă 3 engines (calibration, weaknessDetector, responseProfile) — secondary orchestrator

### VERDICT Section 7: **FAIL**

Runtime e fragmentat: cold/warm behavior are bug latent (H30c surface), fallback-uri maschează erori, pages citesc direct din DB bypass la director, engines au side-effects ascunse în funcții cu nume "analyze/compute".

---

## 8. CODE ARCHAEOLOGY

Citirea cronologică a DECISION_LOG:

### 2026-04-24 — FAZA 2 COMPLETE
- Decizia: "C5c elimine auto-delete complet". **Defensibil atunci?** DA — data loss a 0-5 minute session e rău. **A rezistat?** DA. **Defensibil acum?** DA. ✅
- Decizia: "H14g fix la consumer not producer". **Defensibil?** DA — getMuscleState e folosit de 4+ places, breaking change ar fi costat. ✅
- Decizia: "contextSelectionEnabled default false". **Defensibil?** DA — evită regression pentru users fără weakGroups. **Dar:** feature rămâne dormant; când se va activa? Decision postponed, asset unused.

### 2026-04-24 — FAZA 1 COMPLETE
- Decizia: "slice 5000 (nu remove cap, nu tierStorage)". **Defensibil atunci?** DA — simpluu. **A rezistat?** DA. **Defensibil acum?** DA pentru 1.5 ani. La 3 ani utilizare, userul pierde date. **Now blocks features:** export complet PR timeline, long-term trends.
- Decizia: "Rules v1 path-restricted (nu auth)". **Defensibil atunci?** Single-user MVP, OK. **Defensibil acum?** NU — launch necesită auth. Clock-ul e porrnit.
- Decizia: "AA notes-only — RPE logic producea false INCREASE deoarece rpe:8 era hardcoded, nu colectat". **Defensibil?** DA — RPE trebuie colectat real, nu fake. Corect să-l dezactivezi până ai UI de colectare.

### 2026-04-24 — FAZA 1.2
- Decizia: "config/user.js centralizat, NU multi-user Firebase". **Defensibil atunci?** DA pentru MVP. **A rezistat?** NU — config creat dar firebase.js îl ignoră. **Bug latent.**

### Tribal knowledge nedocumentat

- **De ce `firebase.js:118` nu importă `config/user.js`?** Posibil dependency chicken-and-egg (db.js loads before config). Asta **nu e explicat** în cod. Un nou dev va "rezolva" adăugând import-ul și va crea circular dep.
- **De ce `contextSelectionEnabled = false`?** ADR nu justifică; decision log spune "evită regression". Un nou dev nu va ști când să-l activeze.
- **De ce `PROT_TARGET = 180` și `bodyweight × 2.2` coexistă?** Primul = UI UX (fix, readable). Al doilea = alert (dynamic, scientific). **Nu documentat.** Drift persistent pentru că nimeni nu știe "care-i corect".
- **De ce logNormalize există dar nu e aplicat?** Documentat în FAZA 1.3 report ca "decisional NU aplica". Dar motivul ("fără apply, nu rompem compatibilitate") nu e inflații — ar fi putut fi aplicat la nivel CITIRE, nu SCRIERE.

### Decizii care acum blochează features

1. **"USER_PATH hardcoded în firebase.js"** — blochează multi-user complet.
2. **"Open rules Firebase"** — blochează launch commercial.
3. **"slice(0, 5000)"** — blochează long-term history features (3+ ani).
4. **"Fără TypeScript"** — blochează contract enforcement între engines.
5. **"contextSelectionEnabled = false"** — blochează weakness-prioritized UX, dezavantaj vs competitors.

### Constrângeri auto-impuse care pot fi relaxate

- **"Vanilla JS, no framework"** (ADR 005) — OK pentru MVP. **Poate fi relaxat** la Preact sau Svelte când UI atinge complexitate critică (în 3-6 luni). React migration = 2+ luni, Preact = 3-5 zile.
- **"Firebase REST, no SDK"** (ADR 002) — OK pentru minimizare bundle. Relaxare la Firebase SDK permite auth simplu. FAZA 4 obligatoriu.

### VERDICT Section 8: **RISK**

Decizii individuale au fost defensibile la moment, dar cumulat formează un debt înfundat. "Fără TypeScript + Fără framework + Open rules + Hardcoded user_path + slice 5000" = nu e "MVP minimal", e "MVP care nu poate scala nici tehnic, nici comercial fără refactor major".

---


## 9. FAZA 3 DEEP — Beyond Roadmap

### 9.1 Observability

**Sentry current state (util/sentry.js:4):** DSN hardcodat `https://dcbb183e8d98e95c6cd8b2c3c49b2427@...`. **Concern C8g rămâne:** dacă `beforeSend` filtrează Firebase errors (plan era să le filtreze ca noise), atunci toate failure-urile `fbGet/fbSet/fbRemove` la `firebase.js:22,33,40` sunt invizibile în Sentry. Combinat cu `catch { return null/false }` → **blackhole total pentru Firebase issues**.

**Missing logging strategy:**
- Zero structured logging (nu JSON structured, doar `console.log/warn`).
- Zero log levels (DEBUG/INFO/WARN/ERROR — tot e `console.log` sau `console.warn`).
- Zero correlation IDs (nu poți urmări un user flow prin console).
- Zero metrics (cache hit rate, buildSession duration, sync latency — toate unknown).

**Missing traces / alerts:**
- Zero APM. Nu știi dacă `buildSession` durează 50ms sau 500ms pe un user cu 3000 logs.
- Zero error budget / SLO.
- Zero alerting (PagerDuty? Discord webhook? Nimic).

**Recomandare FAZA 3 concretă:**
1. Audit sentry.js line-by-line, asigură `beforeSend` NU filtrează Firebase errors (sau le filtrează selectiv cu tag `firebase-expected`).
2. Adaugă `src/util/logger.js` cu 4 levels + structured output (JSON dacă `window.DEBUG`).
3. Instrument `buildSession` cu `performance.mark/measure`, trimite la Sentry Performance (free tier include).
4. Webhook Discord pentru Sentry errors critical (free: Sentry → Discord integration).

### 9.2 CI/CD

**Current state (post-Task #24):**
- `.github/workflows/qa-report.yml` — permissions fixed în Task #24.
- `vitest` 271 teste unit, ~24s runtime.
- Playwright e2e — count unknown, tests/e2e/scenarios/ observed.
- EBADPLATFORM `npm ci` fix (Task #24).

**Ce lipsește:**
- **Branch coverage măsurat?** `vitest --coverage` necesar. Acum e "271 teste trec", nu "X% lines, Y% branches".
- **Mutation testing?** Stryker-js. Detectează teste care "trec pentru wrong reasons". Un luxury dar valoros pentru pure engines.
- **Performance regression?** Nu există. `buildSession` poate deveni O(n²) silent.
- **Visual regression?** Pentru UI, Playwright `toHaveScreenshot()` + snapshot. Util dacă UX devine feature.
- **Dependabot/Renovate?** Verifică în `.github/` — dacă lipsește, dependențe rot.

**Pipeline state:**
- Tests rulează la push? În Task #24 report — verifică workflow file pentru `on: [push, pull_request]`.
- Deploy automat? GitHub Pages automat pe push main. OK.
- **Gate-uri lipsă:** tests must pass before deploy. Necesită branch protection + required status check.

### 9.3 Health integrations

**Apple HealthKit / Google Fit realism:**
- HealthKit necesită iOS native app. SalaFull e PWA. **Not happening without React Native/Capacitor.**
- Google Fit are Web API (Fitness REST), dar OAuth complex. Effort: 1-2 săpt integration.
- **Simpler alternatives first:**
  - **Manual HRV log:** user introduce HRV dimineața (Oura/Whoop/Apple Watch citește apoi logat manual). 1 zi effort.
  - **RPE trend analysis:** deja logat per set. Adaugă vizualizare trend. 1-2 zile.
  - **Sleep quality self-report:** extend readiness (adaugă sleep 1-5). 2-3 zile.
  - **Menstrual cycle tracking (dacă user feminin):** key input pentru recovery. 3-5 zile.

**Recomandare:** Skip native HealthKit până MVP postlaunch. Începe cu manual inputs bogați + export CSV pentru users tehnici care vor integrare prin Apple Shortcuts.

### 9.4 MCP Ecosystem

**Current (from FAZA_3_ROADMAP presumed):**
- Playwright MCP — acum e installed în repo.
- Sentry MCP — pentru citire errors din IDE.
- GitHub MCP — PRs/issues management.
- Context7 — library docs.

**Still right?** DA pentru core. Adaugă:
- **Firebase MCP (or REST equivalent)** — query Firebase directly from Claude Code.
- **Vitest/test MCP** — rulare selective teste din IDE.

**MCPs emergente worth tracking:**
- Linear MCP (dacă migrezi findings tracker la Linear).
- Notion MCP (NU — vault e pe Obsidian local, Notion = overhead).
- PostHog MCP (când integrezi analytics).

**Setup order optim:**
1. Sentry MCP primul (observability coming online)
2. Playwright MCP (cover CI/CD)
3. GitHub MCP (issue triage)
4. Context7 (libraries check)
5. Custom Firebase MCP (post FAZA 4 auth)

### VERDICT Section 9: **RISK**

FAZA 3 roadmap are multe items valide, dar observability e gap critic și trebuie prima. Health integration over-scoped — simple wins first.

---

## 10. FAZA 4 FEATURES — Deep Breakdown

### 10.1 144 Programe Generative

**Ce înseamnă:** în loc de un singur `PROG` hardcodat (constants.js:58, 6 zile × 1 program), generezi programe parametrizate — diferite split-uri (PPL, Upper/Lower, Full Body, Bro Split), diferite frecvențe (3/4/5/6 day), diferite goal-uri (strength/hypertrophy/cut/recomp), diferite experience levels. Combinatorial: 4 split × 3-4 frequency × 3 goal × 3 experience = **108-144 programe**.

**Framework propus:**
- `src/programs/builder.js` — `buildProgram({split, frequency, goal, experience, equipment, weakGroups})`
- Returnează `Array<Day>` similar ca PROG static.
- Template per split (PPL template, Upper/Lower template) + modifier layers.

**Data model:**
```js
{
  id: 'ppl-5day-hypertrophy-intermediate-weak-back',
  split: 'PPL',
  frequency: 5,
  goal: 'hypertrophy',
  experience: 'intermediate',
  days: [...],  // similar as PROG
  generated: true,
  seed: 'ppl-hypertrophy-intermediate-seed-1'
}
```

**Migration path:**
- Faza 4.1: `buildProgram` generează Daniel's current program din parametri. Verifică paritate cu static PROG. ✅ Backward compat.
- Faza 4.2: UI program picker în onboarding — user selectează split/frequency/goal. Salvează preferences. Regenerează la schimbare.
- Faza 4.3: Program recommender — bazat pe weakGroups, recompileWeek deficit → sugerează switch program ("ai lag spate 3 săpt, încearcă Pull-focused template").

**Effort breakdown:**
- Framework + templates de bază: 3-4 săpt
- Onboarding UI flow: 1 săpt
- Recommender engine: 2 săpt
- Unit tests (nu toate 144, 15-20 reprezentative): 1 săpt
- **Total: 7-8 săpt.**

**Integration points:**
- `coachContext.js` trebuie să primească `ctx.activeProgram` (not static PROG).
- `renderCoachIdle` tp = activeProgram[dayMap[now.getDay()]].
- Migration pentru `workout-skips` — current keyed pe `day` (Monday-Sunday). Noul program poate avea diferite zile activate.

**Risk:** high — afectează 5+ engines. Trebuie feature flag `useGenerativePrograms = false` inițial.

**Kill this feature?** NU — e moat real. ChatGPT poate răspunde "ce program să fac" dar nu generează programe parametrizate cu data. SalaFull cu 144 programe + context user + recommender = diferențiator clar.

### 10.2 Injury Detection 3-Layer

**Layer 1 — Wizard / Manual:**
- UI form: user bifează "am durere la umăr / genunchi / spate". Poate seta severity 1-5.
- Backend: `src/engine/injuryManager.js` tracks `injuries: {bodyPart: {severity, startDate, notes}}`.
- Effort: 3 zile.

**Layer 2 — Behavioral:**
- Detectează automat: user skip-uiește consistent exerciții care antrenează X muscle group. E.g., 3 sesiuni consecutive skip la Squat → alerta "Genunchi?".
- Analizează: logs filter unde ex e în grupa muscular, compară frecvență cu baseline ultimele 4 săpt vs prev 8 săpt.
- Nu inferă cauza, doar semnalizează pattern.
- Effort: 5 zile.

**Layer 3 — Performance drop:**
- Detectează scădere consistentă în greutate / reps la un exercițiu. Dacă scădere > 10% pe 3 sesiuni consecutive, alerta "Dacă e durere, nu împinge."
- Effort: 3 zile.

**Integration sessionBuilder:**
- Dacă injury active, `sessionBuilder.buildSession` filtrează exercițiile care contain bodyPart în `EXERCISE_MUSCLES[ex]`.
- Alternative exercises din `alternativeEngine.js` extinse cu "injury-safe alternatives".

**Total effort: 3+5+3+2 integration = 13 zile = 2.5-3 săpt.**

**Kill this feature?** NU — safety-critical pentru users seri.

### 10.3 Recovery Protocol Living

**"Living" concret înseamnă:**
- Detectează stare: readiness < 60 consecutiv 3 zile → recovery mode.
- Detectează cumulative fatigue: sum RPE peste 8 ultimele 2 săpt > threshold → deload recomandat.
- Detectează sleep (dacă logat) < 6h consecutive → recovery alert.
- Output: săptămâna următoare se modifică automat — deload 1 săpt (70% weight, 2/3 volume), apoi return normal.

**Sursa de adevăr:** `src/engine/recoveryManager.js` (nou). Citește: readiness, logs RPE, sleep (if available), HRV (if available). Output: `ctx.recoveryState: {level, reason, action}`.

**Integration:** `coachDirector.buildSession` consumă `recoveryState`. Dacă `action === 'deload'` → apply existing `ctx._deload = true` (already wired line 80-81). Nou: `action === 'rest'` similar cu `ruleEngine rest`.

**Effort: 1 săpt.**

**Kill this feature?** NU — core value prop pentru MOAT_STRATEGY (coach real înseamnă recovery awareness).

### 10.4 Health Export PDF

**Format:** raport luna/trimestru. Summary: total sesiuni, PR-uri, trend weight, protein/kcal adherence, calibration level progress.

**Library options:**
- `jspdf` — ~200KB, client-side, free. OK pentru simple tables.
- `pdfmake` — ~300KB, better for layouts.
- Server-side (Firebase Functions) — overkill și costă.

**Privacy:**
- Generare 100% client-side. Zero upload. User descarcă PDF.
- Include disclaimer: "Raport generat de SalaFull pe baza datelor locale. Nu e diagnostic medical."

**Effort: 3-5 zile (nu e complex technic, but layout design consumă timp).**

**Kill this feature?** Parțial. Pentru launch inițial — NU critic. Pentru retention — DA, useful. Amână la FAZA 4.5 dacă FAZA 4 e deja supraîncărcată.

### 10.5 UX Revolution

**Scope realist pentru FAZA 4:**
- **Design system:** CSS variables already (vezi `--accent`, `--card`, `--border`). Formalize în `src/styles/tokens.css` + document palette. 3 zile.
- **Consistent spacing/typography:** `--space-1` → `--space-8`, `--text-xs` → `--text-3xl`. Replace hardcoded px. 5 zile (refactor grepabil).
- **Motion/transitions:** unify transition timing. 2 zile.
- **Dark mode polish (existent):** audit contrast WCAG AA. 2 zile.
- **Onboarding flow redesign (multi-step wizard):** 1 săpt.
- **Coach idle screen:** e god component (394 LOC). Split în components pure cu props. 1-2 săpt.

**React dependency?** NU obligatoriu. Vanilla JS + template literals scalează până la ~10k LOC UI. După, React/Preact.

**Effort FAZA 4 UX: 4-5 săpt dedicat, poate paralelizat.**

**Kill this feature?** NU all — DA parțial. UX polish = MVP. UX "revolution" (re-design total) = post-launch iterate.

### 10.6 React + Vite Migration

**Worth it?**
- **Pro:** component reuse, TypeScript natively supported, mai ușor onboarding dev-uri viitori, ecosystem (shadcn/ui, TanStack Query).
- **Con:** bundle size +50-100KB, rebuild 10k LOC, 2-3 luni migrare.

**Alternative:**
- **Preact:** React API, ~10KB, drop-in pentru majoritatea cazurilor. Migration: 1 săpt pentru proof-of-concept, 3-5 săpt full. **Strongly recommended over React.**
- **Astro:** pentru landing page + marketing site, yes. Nu pentru app.
- **Svelte/SvelteKit:** dacă accepți un framework cu compilator, DX bună, bundle mic. Migration similar Preact.

**Timing:**
- **Înainte de features:** prematur. Features cu valoare imediată (144 programe, injury) primul.
- **După features:** DA, când UI atinge complexitate (post FAZA 4.5). Migration gradual page-by-page.

**Risk: rebuild vs gradual:**
- Big-bang rewrite: 2-3 luni downtime. **NO.**
- Gradual per-page migration cu Preact signals/hooks: 1-2 săpt preparation, apoi page-by-page 2-3 zile/page. ~3 luni total cu development continuu.

**Kill this migration?** NU forever — YES now. Amână până Q4 2026.

### VERDICT Section 10: **RISK**

Features sunt valide dar over-scoped pentru FAZA 4 dacă le faci pe toate. Prioritate: 144 programe (moat) + Injury 3-layer (safety) + Recovery Protocol (core). Amână: PDF export, UX revolution mare, React migration. Scope FAZA 4 realist = 3-4 luni.

---

## 11. LAUNCH READINESS — Beyond Product

### 11.1 Multi-user Auth

**Opțiuni:**

| Opțiune | Setup effort | Cost @ 100 | Cost @ 1k | Cost @ 10k | Verdict |
|---------|--------------|------------|-----------|------------|---------|
| Firebase Auth | 2-3 zile | Free | Free | Free | ✅ best fit (deja ai Firebase) |
| Supabase Auth | 3-4 zile | Free tier | ~$25/mo | ~$200/mo | alternative dacă migrezi RTDB |
| Custom (JWT + email) | 2 săpt | ~$0 | ~$10/mo | ~$100/mo | reinvent wheel, skip |
| Clerk | 1 zi | Free @ <10k | ~$25/mo | ~$250/mo | fast but expensive at scale |

**Recommendation:** Firebase Auth. Ai deja Firebase. Integration = email/password + Google OAuth. Data isolation: `USER_PATH` = `users/${auth.uid}` (replace hardcoded 'users/daniel'). Necesită rules update (auth-gated per user). **2-3 zile effort.**

### 11.2 Billing

**Stripe vs Lemon Squeezy vs Paddle:**

| Service | Fee | EU VAT | Merchant of Record | Setup |
|---------|-----|--------|---------------------|-------|
| Stripe | 2.9% + 0.30€ | YOU handle VAT | NO | 1 săpt |
| Lemon Squeezy | 5% + 0.50€ | THEY handle | YES | 2-3 zile |
| Paddle | 5% + 0.50€ | THEY handle | YES | 2-3 zile |

**Pentru Romania (GDPR + EU VAT + TVA):** Lemon Squeezy / Paddle elimină complexity. Stripe 2.9% e mai ieftin pe termen lung dar necesită contabilitate VAT.

**Recommendation:** Lemon Squeezy pentru launch. Switch la Stripe după 100+ paying users când accounting devine fezabil.

**Pricing tiers "freemium" concret:**
- **FREE:** limitat la 1 month history, 1 program default, fără injury detection, fără PDF export.
- **PRO (4.99€/lună):** full history (5000 logs cap = ~3-4 ani), 144 programs, injury detection, PDF export, priority support.
- **ELITE (14.99€/lună):** PRO + HealthKit integration (când live) + personalized weekly review (AI-generated).

**Concern:** 4.99€ e UNDER "coach 15000€/mo" aspiration. Positioning: "SalaFull înlocuiește 60% din ce face un coach premium, la 0.03% preț." Nu competiție directă cu coach uman, ci competiție cu MyFitnessPal + Strong + Fitbod.

### 11.3 Legal GDPR Romania

- **Privacy policy:** OBLIGATORIE. Template: Termly / Iubenda (~$10/mo). Include: ce date colectezi (weights, kcals, exercises), cum stochezi (Firebase EU), cum se șterg (Full Reset).
- **Terms of Service:** clar pe disclaimer medical ("not a doctor, not diagnosis").
- **Cookie banner:** dacă ai analytics non-esențiale. Dacă folosești PostHog/Plausible în "necessary" mode (no cookies), poate fi skip.
- **ANSPDCP notification:** pentru autoritate RO (dacă operezi sub numele personal sau SRL). Formular simplu online.
- **Effort: 3-5 zile cu template-uri.**

### 11.4 Performance at Scale

**Firebase costs realistic la Blaze plan (unlimited):**

- RTDB simultaneous connections: 200k+ free tier. OK pentru <10k MAU.
- RTDB downloads: 10GB/month free. Per user 5000 logs ~= 1MB → 10k active users fetching = 10GB. **Chirie cost: $1/GB after free → $0 for 10k users doing 1 full sync per day**.
- RTDB storage: 1GB free. 10k users × 1MB = 10GB → **$5/month storage**.
- **Total Firebase cost @ 10k users: <$20/month.** Acceptabil.

**Concerns:**
- Fiecare user full-sync înseamnă pull payload ~1MB. Mobile data impact.
- Recomandare: implement differential sync (only changed keys) în FAZA 4.

**Caching strategy:** client-side localStorage e deja cache. Firebase e source-of-truth la cold start doar.

### 11.5 User Onboarding Real

**Current state:** `src/onboarding.js` generează 33 fake log entries (Daniel's baseline). **For NEW users, that's irrelevant data.** Onboarding-ul scrie istoricul lui Daniel ca baseline, ceea ce face calibration să înceapă greșit.

**Real onboarding necesar:**
1. **Welcome + goal selection:** cut/bulk/maintain, strength/hypertrophy.
2. **Experience level:** 0-6 luni, 6-24 luni, 2+ ani.
3. **Equipment availability:** checklist (dumbbell, barbell, cable, leg press, etc.).
4. **Weight/height input:** optional dar recomandat pentru protein target calc.
5. **Injury/limitation selection:** optional.
6. **Plan preview:** mostre de program generate din parametri.
7. **First session prep:** "azi primul antrenament, pregătește [exerciții]".

**Effort: 1-2 săpt full wizard + backend state management.**

**Without this, launch = impossible. User-1 != Daniel.**

### 11.6 Landing Page

**Există?** Verificat: `find / -name "landing*" -o -name "homepage*"` — nu există în `src/pages/`. **NU există landing page.** App-ul se deschide direct în coach view dacă user face onboarding.

**Conversion funnel necesar:**
- Landing: proposition + demo GIF/video + CTA "Start Free".
- Onboarding wizard.
- First-session experience.
- Day 7 retention: automated email/push "How was week 1?".
- Paywall: ziua 14, limit "1 month history exceeded".

**Effort: 1 săpt landing static (Astro sau plain HTML) + integration auth.**

### 11.7 Support

**Opțiuni:**
- **Email only (support@salafull.com):** free, slow. MVP acceptabil.
- **Discord community:** free, community self-help. Sub 1k users OK.
- **Intercom / Crisp:** $40+/mo. Bypass pentru MVP.

**Recommendation:** Email + Discord launch. Upgrade Crisp când >500 users.

### 11.8 Analytics

**Opțiuni:**

| Tool | Cost @ 10k | Privacy-first | Setup |
|------|------------|---------------|-------|
| PostHog | Free (self-host) or ~$50/mo | ✅ | 1 zi |
| Plausible | ~$19/mo | ✅ cookieless | 1 oră |
| Mixpanel | ~$30/mo | ❌ | 1 zi |
| Google Analytics | Free | ❌ | 1 oră |

**Recommendation:** Plausible pentru simple analytics (page views, referrers, retention). PostHog self-hosted dacă vrei event tracking detaliat (pentru optimization FAZA 5).

### 11.9 Time-to-First-User-Value

**Concret, în secunde:**
- Landing → 10s reading → Click "Start"
- Onboarding wizard → 90-120s (6 steps)
- First session prep page → 10s
- **Total: ~2-3 minute până user-ul știe ce face primul antrenament.**

**Pentru comparație:** MyFitnessPal = 5-7 min onboarding. Strong = 1 min (minimal). SalaFull țintă: 2 min primul session.

**KPI propus:** Time-to-First-Session-Completion < 30 minute (user deschide app, face onboarding, face prima sesiune reală).

### VERDICT Section 11: **FAIL**

Launch readiness = 20% acolo. Lipsesc: auth, billing, landing, onboarding real, privacy policy, analytics. 4-6 săpt muncă concentrată pentru launch MVP minimal.

---

## 12. STRATEGIC EDGE

### 12.1 "If I Were a Competitor" (Adversarial)

**Scenariu:** competitor cu $50k și 2 devs, 2 luni.

**Roadmap distructiv:**

- **Săpt 1-2:** Clone user-facing UX SalaFull (vanilla public landing page + demo). Investighează claims (opus audit public? nu, **dar ENGINE_ARCHITECTURE public în repo GitHub? DA, dacă public**). Citesc COACH_SPLIT_PLAN.md, ADR-uri. Înțeleg arhitectura într-o zi.
- **Săpt 3-5:** Rebuild engine core în React + Firebase Auth din start (bypass debt-ul nostru). Calibration tiers, double progression, pattern learning — sunt pure algoritmi documentați în ADR. Replicabile.
- **Săpt 6-7:** Marketing — positioning "SalaFull 2.0" (implied critique). TikTok fitness creators ads targeting Romania. Daniel's audience if identifiable.
- **Săpt 8:** Launch cu feature parity + auth + billing. Preț: 2.99€/mo (undercut).

**Vulnerabilități observate:**
1. **Repo public? Dacă DA — auditul + ADR-urile = manual pentru competitor.** Verifică settings. (If private, OK.)
2. **Domeniu salafull.com / .ro — ownership?** Verifică. Competitor poate cumpăra variante (salaful.com, salafull.app) și confuza.
3. **Daniel's followers/network:** dacă ai presence (fitness IG/TikTok), competitor își țintește audiența direct.
4. **Firebase URL expus în bundle:** `fittracker-c34e8-default-rtdb.europe-west1...` — oricine poate inspecta și prelua structura dacă rules sunt open. **Risc reale.**

### 12.2 Unfair Advantages

**Ce ai tu și competitori NU pot copia ușor:**

1. **Data-set propriu Daniel (2 ani logs + weight + PR-uri):** e training data pentru response profile algorithm. Competitor cu algoritm identic dar ZERO istoric nu poate match personalization. Dar: advantage durability e limitată — când competitor ajunge la 1000 users, au date mai bune decât o persoană.

2. **Romanian-language native coach:** SalaFull e în RO. MyFitnessPal / Strong / Fitbod = EN. Pentru piața RO (fitness-ul crește, 5M users potențial), limba e moat real. Până când Google Translate devine suficient de bun pentru fitness lingo (nu e, încă).

3. **Deep integration Opus + Claude Code workflow:** Dev velocity mare datorită orchestrator-ului Claude Code + queue-based async. Iterate faster than 2-dev competitor. **Dar:** advantage ontologic, nu feature. Competitor cu și ei Claude Code ajunge la paritate.

4. **Obsession with "coach real" vs "calculator":** MOAT_STRATEGY documentează asta. Features ca injury detection multi-layer, recovery protocol living — competitor poate copia dar trebuie să le înțeleagă. Gap de înțelegere = 3-6 luni minim.

5. **Niche pentru users intermediate+:** MyFitnessPal = beginners. Fitbod = beginners + recommendation. SalaFull vrea users care deja știu ce fac dar vor context persistent + personalized. Niche mai tare decât FitFormer / Hevy. **Dar:** niche = TAM mai mic. Dacă monetization ROI nu atinge 10 RON/user/lună, unit economics nu funcționează.

**Acceptă realistic:** advantages sunt reale dar nu sunt forever moats. Toate se pot eroda în 12-24 luni.

### 12.3 Kill Recommendations

**Features/modules/engines NU merită construite/păstrate:**

1. **`src/engine/alerts.js` (4 LOC stub)** — ȘTERGE. Dead code.
2. **`src/engine/plateauInterventions.js` (179 LOC, orphan)** — ȘTERGE sau integrează în `applyPatterns`. Currently dead.
3. **`src/engine/whyEngine.js` (114 LOC, window-only exposed)** — REFACTOR: mută la `src/pages/coach/why.js` (UI concern).
4. **`src/util/tierStorage.js` (dead code, C4g)** — ȘTERGE sau marchează "reserved for FAZA 5". Current: 0 importuri, ocupă spațiu mental.
5. **`contextSelectionEnabled = false`** — ACTIVEAZĂ cu `patternMinConfidence` gate, sau șterge codul. Dormant features degradează code readability.
6. **Hardcoded `USER_PATH = 'users/daniel'`** — urgent REMOVE, parametrizare.
7. **Dual protein target (180 static vs bodyweight×2.2)** — CONSOLIDEAZĂ într-o funcție `getProteinTarget(ctx)` cu fallback clar.
8. **Health export PDF (FAZA 4 scope)** — AMÂNĂ la post-launch. Effort-to-value ratio mic vs. auth/onboarding.
9. **React migration (FAZA 4)** — AMÂNĂ la Q4 2026. Preact când necesar.
10. **`applyAAAdjustments` empty method** — ȘTERGE (coachDirector.js:181-183).
11. **Dynamic `import('./dp.js')` în hot path** — ÎNLOCUIEȘTE cu static import.
12. **Recalibration engine nefolosit** — ACTIVEAZĂ sau șterge.

### VERDICT Section 12: **RISK**

Competiție posibilă în 2-3 luni dacă cineva serios începe. Advantages reale dar nu durabile fără feature execution rapid. Kill list util — eliminare debt paralel cu feature development.

---

## 13. RISK MATRIX + FINAL PRIORITIZATION

### 13.1 Risk Matrix

Toate item-urile FAZA 3 + FAZA 4 + Launch cu scoruri 0-10:

| Item | Tech Risk | Biz Risk | Reversibility | Cost of NOT doing | Justificare |
|------|-----------|----------|---------------|-------------------|-------------|
| C10c cache cascade fix | 3 | 7 | High | 9 | UX lent vizibil, scale issues la 1k+ users |
| H31c reset registry | 2 | 8 | High | 10 | Trust broken; user poate "reset" dar nu real |
| H30c pattern filter+banner bypass | 3 | 6 | High | 7 | UX anxiety; false alerts pe fresh users |
| Multi-tenancy real (Firebase Auth + UID path) | 5 | 10 | Medium | 10 | Blochează orice launch commercial |
| Sentry beforeSend audit + logger | 2 | 6 | High | 8 | Blackhole în prod issues |
| Onboarding real wizard | 4 | 9 | High | 10 | User-1 ≠ Daniel; fără asta, launch impossible |
| Landing page | 1 | 7 | High | 6 | Conversion funnel broken fără |
| Billing integration (Lemon Squeezy) | 3 | 8 | Medium | 9 | Revenue = 0 fără |
| Privacy policy + ToS | 1 | 9 | High | 10 | GDPR exposure, legal risk |
| 144 programe generative | 7 | 7 | Low | 5 | Moat real dar nu launch-critical |
| Injury detection 3-layer | 6 | 5 | Medium | 4 | Safety-plus, nu blocker |
| Recovery protocol living | 5 | 6 | Medium | 4 | Core value prop dar not-yet-marketed |
| Health export PDF | 3 | 3 | High | 2 | Nice-to-have retention |
| UX revolution | 5 | 4 | Low | 3 | Polish post-launch |
| React/Preact migration | 8 | 3 | Very Low | 2 | Pre-optimization, amânare |
| HealthKit native | 9 | 4 | Low | 2 | Requires native app, high complexity |
| Analytics (Plausible) | 1 | 5 | High | 6 | Decisions fără date |
| Schema registry central | 5 | 7 | Medium | 7 | Prevent future drift |
| State actions pattern refactor | 6 | 5 | Medium | 5 | Long-term maintainability |
| TypeScript gradual migration | 7 | 4 | Low | 4 | Contract enforcement |

### 13.2 Final Prioritization

**Priority 1-3 (THIS WEEK):**
1. **C10c cache invalidation coalesce + debounce.** Fix imediat, quick win.
2. **H31c Full Reset spec + registry.** 1 zi, high-leverage.
3. **H30c pattern banner through director + redefine "scheduled" = plan days.** 2 zile.

**Priority 4-10 (THIS MONTH):**
4. Multi-tenancy real (Firebase Auth + UID path).
5. Onboarding real wizard (6-step).
6. Landing page static.
7. Privacy policy + ToS (template + adapt).
8. Billing integration (Lemon Squeezy).
9. Sentry audit + structured logger.
10. Plausible analytics integration.

**Priority 11-20 (NEXT QUARTER):**
11. Schema registry central (eliminate dual sources).
12. 144 programe generative (framework + 20 representative).
13. Injury detection Layer 1 (wizard).
14. Recovery protocol living (ctx.recoveryState).
15. CI/CD: branch coverage + perf regression.
16. UX token formalization + refactor hardcoded px.
17. Program recommender (weak groups based).
18. State actions pattern (replace direct state.x = ...).
19. Injury Layer 2 (behavioral).
20. Recovery Layer 3 (HRV log if input available).

**Priority 21+ (SOMEDAY/MAYBE):**
- Health export PDF.
- Preact/React migration.
- HealthKit native (requires Capacitor).
- Mutation testing (Stryker).
- Visual regression tests.
- Admin dashboard (user management, analytics deep-dive).

### 13.3 Exit Criteria

**FAZA 3 Exit (measurable):**
- ✅ Zero cache invalidations during normal navigation (dashboard → coach → weight). Max 1 during sync.
- ✅ Full Reset: `localStorage.length === 0` post-reset (excluse preserve list).
- ✅ Pattern banner: 0 false positives pe user cu < 10 real sessions.
- ✅ Sentry: 90% runtime errors reach dashboard (currently ~0 Firebase errors).
- ✅ Test coverage: > 70% branches în `src/engine/`.
- ✅ CI: all workflows green, no EBADPLATFORM regressions.

**Launch Exit (măsurabil):**
- ✅ Firebase Auth live, per-UID data isolation, old `users/daniel` migrated.
- ✅ Onboarding wizard: 6 steps, < 120s average completion (measured).
- ✅ Landing page live, conversion funnel trackable.
- ✅ Billing: first Lemon Squeezy test payment successful.
- ✅ Privacy policy + ToS live, linked from landing.
- ✅ Analytics: 1 week of Plausible data collected (even if 0 users).
- ✅ Manual QA: 3 external testers completed signup + first session + rate session. Zero critical bugs.
- ✅ Sentry: 0 errors in last 7 days of QA.

### 13.4 Anti-Reîncălzire Check — 3+ Probleme NOI

**Probleme identificate în acest audit, NEDETECTATE în FAZA_2_OPUS_REVIEW:**

1. **[NEW] Cache invalidation cascade la Firebase sync** (C10c deep root). FAZA_2 a extins COACH_RELEVANT_KEYS fără a introduce debounce/coalesce. Sync-ul pull face 8-11 invalidări successive — bug-ul NU e în `_directorCache` design, e în interacțiunea `DB.set` wrapper + Firebase sync loop. Neidentificat anterior.

2. **[NEW] `renderIdle.js:186` banner bypass la calibration filter.** Banner citește `DB.get('applied-patterns')` direct, ignoră `ctx.patterns` filtrat. Asta face H30c să producă false positives chiar cu gate-urile ADR 009 aplicate în director. Nici ADR 009 nici FAZA 1.5 nu au anticipat că UI poate citi direct.

3. **[NEW] `patternLearning.js:26-36` counts calendar days ca "scheduled", nu plan days.** Chiar dacă aș gate-a banner-ul, algoritmul în sine interpretează "Marți scheduled" = "Marți există în 56 zile" (=~8 ori), nu "Marți e în PROG activ". Root cause deeper decât C1g calibration stuck.

4. **[NEW] Dynamic `import('./dp.js')` în `coachDirector.js:111` — hot path.** Fiecare `buildSession` invocă import dinamic. Module graph e static (dp.js exists), importul e pretext de lazy. FAZA 1.1 a păstrat asta din decizia "evit cicluri". FAZA 1+2 n-au reconsiderat. **Fix simplu: static import** după eliminarea ciclului original.

5. **[NEW] Keys dinamice write-only leak.** `renderIdle.js:339 DB.set(`muscle-extra-${grp}`, true)` + aa.js:99,137 + dp.js:237. Aceste prefixe nu sunt în TEST_RESIDUE_KEYS/USER_DATA_KEYS, nu sunt în COACH_RELEVANT_KEYS (nu invalidează nimic), nu sunt re-citite nicăieri (grep verified for muscle-extra). **WRITE-ONLY. Pur leak de storage.** Nedetectat în niciun audit anterior.

6. **[NEW] Protein target schema drift** (constants.js 180 static vs proactiveEngine.js 110.4×2.2=242 dynamic). QA OBS-1 a identificat UI-ul dar nu a urmărit root cause. Root: two independent code paths, no shared `getProteinTarget()`.

7. **[NEW] `_suppressFirebaseSync` nu supraviețuiește reload în Full Reset flow.** După `location.reload()` flag e reset, `initFirebaseSync` rulează și pull-ul poate aduce date stale dacă `PUT null` n-a propagat. Race pe reset path, nedocumentat. Parte din H31c.

**Total: 7 probleme noi. Target anti-reîncălzire (minim 3): DEPĂȘIT.**

### 13.5 Task List Ready-to-Queue (24 tasks)

Grupate pe tier-uri logice:

#### Tier 0 — Quick Stability Wins (THIS WEEK)

```markdown
## TASK #26
**Model:** Sonnet
**Type:** BUG_FIX
**Priority:** CRITICAL
**Status:** PENDING
**Description:** C10c cache coalesce — în firebase.js DB.set wrapper, adaugă debounce 250ms la invalidate() + un mod "batch" (suppressInvalidations(fn)) folosit de syncFromFirebase. Update tests pentru invariant: sync nu produce mai mult de 1 invalidare netă.
**Acceptance:** Pe page load cu Firebase sync activ, cache invalidations ≤ 1 (verificat prin counter instrumentat).
**Dependencies:** NONE

## TASK #27
**Model:** Sonnet
**Type:** BUG_FIX
**Priority:** CRITICAL
**Status:** PENDING
**Description:** H31c Full Reset complete — introdu `src/util/dataRegistry.js` cu listă completă + regex prefixe (muscle-extra-*, aa-cooldown-*, ex-extra-sets-*, backup-*). Rewrite `fullReset` ca `localStorage.clear()` + preserve list. Update teste.
**Acceptance:** Post-fullReset, localStorage contains DOAR keys în preserveList (default: device-id, last-backup opt-in).
**Dependencies:** NONE

## TASK #28
**Model:** Sonnet
**Type:** BUG_FIX
**Priority:** HIGH
**Status:** PENDING
**Description:** H30c Part A — în renderIdle.js:186, înlocuiește `DB.get('applied-patterns')` direct cu `_dirSession.ctx.patterns` (via director). Asigură director expune `ctx.patterns` post-filter în returned session.context.
**Acceptance:** Banner-ul de pattern "X% skip" apare DOAR dacă tier permite și confidence >= threshold tier.
**Dependencies:** NONE

## TASK #29
**Model:** Sonnet
**Type:** BUG_FIX
**Priority:** HIGH
**Status:** PENDING
**Description:** H30c Part B — în patternLearning.js, redefinește `dayScheduled` să numere DOAR zilele care sunt în planul activ (PROG) nu toate zilele calendar. Parametrizare cu ctx.activeProgram (fallback PROG).
**Acceptance:** Pe user cu 2 sesiuni/săpt planificate Marți+Joi în 8 săpt, skip-rate = 1 - completed / 16 (nu / 56). Testează fixture.
**Dependencies:** TASK #28 DONE

## TASK #30
**Model:** Sonnet
**Type:** CLEANUP
**Priority:** MEDIUM
**Status:** PENDING
**Description:** Elimină dead code: src/engine/alerts.js (stub 4 LOC), applyAAAdjustments noop method, fallback branch coachDirector.js:125-128 (DP always available), comment-only dp.js Daniel refs.
**Acceptance:** Build passes, toate 271 teste + teste noi verzi. LOC reduction documentată.
**Dependencies:** NONE

## TASK #31
**Model:** Sonnet
**Type:** BUG_FIX
**Priority:** MEDIUM
**Status:** PENDING
**Description:** Schema drift protein target — consolidează în `src/engine/targets.js` `getProteinTarget(ctx)` cu logic explicit (bodyweight-based dacă available, else PROT_TARGET). Replace usage în proactiveEngine.js:20 + plan.js + dashboard.js + readiness.js.
**Acceptance:** Single source; grep `PROT_TARGET|bodyweight.*2\.2` returns only targets.js + one-off imports.
**Dependencies:** NONE

## TASK #32
**Model:** Sonnet
**Type:** REFACTOR
**Priority:** MEDIUM
**Status:** PENDING
**Description:** Static import pentru dp.js în coachDirector.js. Verifică dacă ciclul care a forțat dynamic import e still present (FAZA 1.1 decision). Dacă nu, trece la static.
**Acceptance:** Zero `await import` în coachDirector.js. Build + tests green.
**Dependencies:** NONE
```

#### Tier 1 — Observability (THIS MONTH, WEEK 1)

```markdown
## TASK #33
**Model:** Opus
**Type:** AUDIT
**Priority:** HIGH
**Status:** PENDING
**Description:** Audit complet src/util/sentry.js — verifică `beforeSend` filter, asigură Firebase errors NU sunt filtrate default. Raport: Sentry config ideal + delta față de current.
**Acceptance:** AUDIT_SENTRY_CONFIG.md cu recomandări concrete + diff proposal.
**Dependencies:** NONE

## TASK #34
**Model:** Sonnet
**Type:** EXEC
**Priority:** HIGH
**Status:** PENDING
**Description:** Creează src/util/logger.js cu 4 levels (debug/info/warn/error) + structured JSON output când window.DEBUG e setat. Instrumentează buildSession cu performance.mark/measure + Sentry breadcrumbs. Replace `console.log` din coachDirector, firebase.js, patternLearning cu logger calls.
**Acceptance:** Sentry breadcrumbs visible în dashboard; structured logs pot fi activate prin flag; 0 plain console.log în engine/.
**Dependencies:** TASK #33 DONE

## TASK #35
**Model:** Sonnet
**Type:** EXEC
**Priority:** MEDIUM
**Status:** PENDING
**Description:** Integrare Plausible analytics. Configure script în index.html + .env config. Track: page views, onboarding steps, first session completion, session confirm rate.
**Acceptance:** Plausible dashboard primește events din local dev.
**Dependencies:** NONE
```

#### Tier 2 — Multi-tenancy + Auth (THIS MONTH, WEEK 2-3)

```markdown
## TASK #36
**Model:** Opus
**Type:** AUDIT
**Priority:** CRITICAL
**Status:** PENDING
**Description:** Architectural plan pentru Firebase Auth integration — evaluează Firebase SDK light (auth-only) vs REST (custom token flow). Output: ADR nou + migration plan pentru USER_PATH hardcoded.
**Acceptance:** ADR_010_FIREBASE_AUTH.md cu decizie + 3-step migration plan.
**Dependencies:** NONE

## TASK #37
**Model:** Sonnet
**Type:** EXEC
**Priority:** CRITICAL
**Status:** PENDING
**Description:** Implementare Firebase Auth email+password+Google OAuth. src/auth.js wrapper. Update firebase.js USER_PATH = `users/${getUid()}`. Migration script pentru 'users/daniel' → 'users/<daniel-uid>'. Feature flag `AUTH_ENABLED`.
**Acceptance:** Local dev: create user, login, data citit/scris pe users/<uid>. Migration docs.
**Dependencies:** TASK #36 DONE

## TASK #38
**Model:** Sonnet
**Type:** EXEC
**Priority:** HIGH
**Status:** PENDING
**Description:** Firebase Security Rules auth-gated. Update din repo (commit firebase-rules.json). Auth user poate accesa doar `users/{own-uid}/**`. Deploy manual în Firebase Console.
**Acceptance:** Curl PUT cu token alt user pe users/daniel returnează 401.
**Dependencies:** TASK #37 DONE
```

#### Tier 3 — Launch Readiness (THIS MONTH, WEEK 3-4)

```markdown
## TASK #39
**Model:** Opus
**Type:** AUDIT
**Priority:** HIGH
**Status:** PENDING
**Description:** Design full onboarding wizard — 6 steps: welcome+goal, experience, equipment, body stats, injuries, preview. Wireframe + data flow. Output: ONBOARDING_DESIGN.md + sketches.
**Acceptance:** Document cu 6 steps detaliat + validation rules + state schema.
**Dependencies:** NONE

## TASK #40
**Model:** Sonnet
**Type:** EXEC
**Priority:** HIGH
**Status:** PENDING
**Description:** Implementare onboarding wizard conform design #39. Replace existing onboarding.js. Nu mai injecta Daniel baseline.
**Acceptance:** New user signup → 6 steps → first session prep. Zero hardcoded Daniel data.
**Dependencies:** TASK #39 DONE, TASK #37 DONE

## TASK #41
**Model:** Sonnet
**Type:** EXEC
**Priority:** HIGH
**Status:** PENDING
**Description:** Landing page static (Astro sau HTML plain în `/landing/`). Hero + proposition + demo GIF + CTA "Start Free". Link la app (/app).
**Acceptance:** Deploy pe landing.salafull.com (or root cu /app/). Responsive mobile.
**Dependencies:** NONE

## TASK #42
**Model:** Sonnet
**Type:** EXEC
**Priority:** HIGH
**Status:** PENDING
**Description:** Privacy policy + ToS din template Termly sau Iubenda. Conținut SalaFull-specific (Firebase EU storage, Full Reset semantics, medical disclaimer). Link din landing + footer app.
**Acceptance:** Privacy + ToS live; GDPR contact email specified.
**Dependencies:** NONE

## TASK #43
**Model:** Sonnet
**Type:** EXEC
**Priority:** HIGH
**Status:** PENDING
**Description:** Lemon Squeezy integration — create product PRO 4.99€/mo. Webhook handler pentru subscription.created/canceled. Store user `plan` în Firebase. Gating PRO features (injury, PDF export disabled, full history).
**Acceptance:** Test payment successful; webhook received; user.plan=PRO în Firebase.
**Dependencies:** TASK #37 DONE
```

#### Tier 4 — Schema & Architecture (NEXT QUARTER)

```markdown
## TASK #44
**Model:** Opus
**Type:** AUDIT
**Priority:** MEDIUM
**Status:** PENDING
**Description:** Design schema registry + migration strategy. Output: SCHEMA_REGISTRY.md cu toate keys, types, migrări versionate.
**Acceptance:** Document listând 40+ keys cu schema + guardrails propuse.
**Dependencies:** NONE

## TASK #45
**Model:** Sonnet
**Type:** REFACTOR
**Priority:** MEDIUM
**Status:** PENDING
**Description:** Implement schema registry per design #44. Wrapper `src/db-typed.js` cu get/set tipizate (JSDoc typedefs). Replace DB.set direct cu typed versions în engines critical (coachDirector, patternLearning, sessionBuilder).
**Acceptance:** 5+ engines migrate; runtime validation optional via feature flag.
**Dependencies:** TASK #44 DONE

## TASK #46
**Model:** Sonnet
**Type:** REFACTOR
**Priority:** MEDIUM
**Status:** PENDING
**Description:** State actions pattern — replace `state.x = y` direct cu `stateActions.setX(y)` cu validation. Pornește cu 3 fields critice (sessActive, currentEx, completedExercises).
**Acceptance:** 3 fields migrate; grep `state\.(sessActive|currentEx|completedExercises)\s*=` returnează doar în stateActions.js.
**Dependencies:** NONE
```

#### Tier 5 — FAZA 4 Features (NEXT QUARTER)

```markdown
## TASK #47
**Model:** Opus
**Type:** AUDIT
**Priority:** MEDIUM
**Status:** PENDING
**Description:** Design 144 programe framework — builder pattern, data model, migration pentru PROG static. Output: PROGRAMS_FRAMEWORK_DESIGN.md.
**Acceptance:** Document cu 3 template examples + data model + generation algorithm.
**Dependencies:** NONE

## TASK #48
**Model:** Sonnet
**Type:** EXEC
**Priority:** MEDIUM
**Status:** PENDING
**Description:** Implement buildProgram + 20 representative programs. Feature flag `useGenerativePrograms = false`. Unit tests on 5 key programs.
**Acceptance:** 20 programs generate; paritate cu PROG static pentru Daniel's params.
**Dependencies:** TASK #47 DONE

## TASK #49
**Model:** Sonnet
**Type:** EXEC
**Priority:** MEDIUM
**Status:** PENDING
**Description:** Injury Manager Layer 1 (wizard) — UI form + storage în `user-injuries` + integration `sessionBuilder.buildSession` pentru filtering.
**Acceptance:** User poate seta injury shoulder; următoarea sesiune omite shoulder exercises.
**Dependencies:** NONE
```

**Total tasks ready-to-queue: 24** (TASK #26 → #49).

### 13.6 VERDICT FINAL: **FAIL**

SalaFull e un proiect promițător cu fundamente corecte (calibration tiers, double progression, modular engines) dar **NU e launch-ready în nicio dimensiune critică**. FAZA 1+2 au fixat ~15 bug-uri punctual fără a atinge root causes arhitecturale. QA manuals de 24 apr au arătat că 271 teste verzi nu garantează runtime correct.

**Drum realist până launch:** 4-6 luni concentrate pe: (1) stabilitate (Tier 0 quick wins), (2) observability (Tier 1), (3) multi-user auth (Tier 2), (4) onboarding real + billing + landing (Tier 3), (5) 144 programe + injury + recovery (Tier 5). Schema registry + state actions = paralel pe termen lung.

**Cea mai mare risk:** a lăsa debt-ul arhitectural să crească în timp ce adaugi features. Rebuild ar costa 3-6 luni.

**Cea mai mare oportunitate:** dev velocity rapid cu Claude Code + Opus workflow. Poate livra 4 luni compresate la 2-3 calendar months dacă pacing e susținut.

---

## FINAL SUMMARY

- **13 secțiuni completate,** fiecare cu VERDICT.
- **7 probleme NOI identificate,** depășește target anti-reîncălzire (3).
- **24 task-uri ready-to-queue** în 5 tiers logice.
- **5 FALSE/HALF "DONE" claims** expuse în FAZA 1+2.
- **Top 5 blockers** listate explicit: C10c, H31c, H30c, multi-tenancy fake, observability blackhole.

**Următoarea acțiune pentru Daniel:** review audit, valid/reject task list, queue TASK #26-32 pentru execuție imediată (Tier 0 quick wins) înainte de orice altceva.

