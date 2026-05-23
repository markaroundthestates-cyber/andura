# Shape check integration audit chat 5 — 2026-05-23

## Baseline (per chat 5 SUBSTRATE-ZETA-FIX)

- scheduleStore.ts saveWeekly() shape bridge bug LANDED + fixed: pre-fix passed `DayKind[]` strings catre `commitCalendarEdit` care expected `{day, active}[]` objects (scheduleAdapter.d.ts §11-13). `dayConfig.active` on string `'training'` = `undefined`, never `=== false` → rest day overrides silent no-op.
- Sibling boundaries verificate sweep deep pentru pattern recidive: type drift inter-store/engine/UI, particular acolo unde TS strict ratează (cross-module `Record<string, unknown>` boundaries, JSDoc engine signatures + runtime DB.get/localStorage cross-reads).

## Boundaries audited

### 1. workoutStore.sessionsHistory ↔ pipeline `recentSessions` (engine periodization/deload/energyAdjustment)

- Store shape: `LastSessionSummary[] = { title, meta, ts, sets?, durationMin?, volumeKg?, exercises? }` (workoutStore.ts L65-77).
- Pipeline consumer expectation: `recentSessions[*]` cu campuri **rir / energy / weekIdx / injury / daysAgo** (verificat src/engine/periodization/mesocycle.js L93-122 isMariusDualSignalGreen + macrocycle.js L103 + energyAdjustment/index.js L214 + deload/triggerHierarchy.js L246 + goalAdaptation/pushBackTiers.js L76).
- Adapter buildUserStateForPipeline (scheduleAdapterAggregate.ts L35-60) face passthrough: `recentSessions: sessionsHistory ?? []` — ZERO transform.
- Gap severity HIGH: complete shape miss. Toate engine consumers silently treat fiecare session ca lipsa campuri → `weekRirSessions.length === 0`, `anyRedRecent === false`, `injury !== true` → engine logic permanent baseline path. Marius dual-signal NICIODATA green; injury block NICIODATA detected; deload trigger hierarchy energy-down NICIODATA fires.

### 2. workoutStore PR detection ↔ DB.pr-records (MMI silent cap + PR engine prior history)

- Workout.tsx L240-244 trimite `history[].map(h => ({ex, w: h.kg, reps: h.reps}))` → `detectPR(exercise, set, history)` (engineWrappers.ts L207-235 → engine prEngine.js L30). Conversie kg→w corecta locally. OK.
- DAR: PR engine se bazeaza pe `history` doar din **current session in-memory** (workoutStore.history record-by-exIdx). NU consumer din past sessions persisted: `DB.get('pr-records')` populated NUMAI de src/pages/coach/pr.js (vanilla legacy, orphaned post-D028 main.js retire).
- React side scan: ZERO write la `DB.set('pr-records')` sau `localStorage.setItem('pr-records')` în prod path (singura referinta = test setup engineWrappers.mmi-silent-cap.test.ts L50).
- Gap severity CRITICAL: post-D028 vanilla retired, `pr-records` localStorage cheie permanent goala in productie. Consecinte cascada:
  - **MMI silent auto-cap niciodata declanseaza** (buildSilentMmiContext L335-346 returns null when `prRecords.length === 0`). Returning user 6+mo Marius/Maria primesc baseline weights ZERO re-resume protection — bug-ul exact pe care MMI Engine #9 LOCK 10 trebuia sa rezolve.
  - **PR detection scope-session-only**: fiecare prima zi training noua zero comparable history → niciun PR trigger primele 1-2 sets per exercitiu; intre sesiuni "uita" max-weight pe ex.

### 3. DB.get('logs') consumers ↔ React production write path

- 5 engines citesc DB.get('logs'): adherence.js L17, aa.js L12, fatigue.js L7, patternLearning.js L143, readiness.js (kcals/prots), dp.js L122, stagnationDetector (via getMuscleState muscleMap.js L60 indirect).
- React production scan: ZERO write la `DB.set('logs')` sau `localStorage.setItem('logs')` în src/react/ prod path (singura referinta = test setup `ResetCoachConfirm.test.tsx` L41 + engineWrappers.mmi-silent-cap.test.ts L45).
- Toate scrierile DB.set('logs') stau în src/pages/coach/session.js L125 L351 + logging.js L198 + util/logBackup.js L26 + util/logsMigration.js L35 + onboarding.js L119 + inject.js L75 L181 — **toate vanilla legacy orphans post-D028**.
- Gap severity CRITICAL: pipeline engines functional dar input-starved. Readiness compute returneaza baseline tot timpul, fatigue → DATE INSUFICIENTE permanent, adherence score → tot timpul baseline ~50, weakness/stagnation detectors → empty results, MMI extractSessionDatesLocal L266-273 returns [], muscleRecovery getRecoveryByGroup → toate "recovered".
- Notă: engineWrappers.ts composers (`getPatternsBanner`, `getCoachRestReason`, `getLaggingSignal`) NU mai folosesc DB.get('logs') ci flatten din `useWorkoutStore.getState().sessionsHistory` (L639-652, L767-780, L820-833) — flattens corect cu `set.timestamp` mapped la `ts`. ACEASTA ramura functioneaza. DAR engine internal `getReadiness`/`getFatigue`/`getAdherenceOutput` invoca engine direct care reads DB.get('logs') — ramane starved.

### 4. onboardingStore ↔ MMI engine + Bayesian Nutrition pipeline

- Store shape OK: `data.{age, sex, goal, frequency, experience, weight}` typed strict (Sex, Goal, Frequency, Experience unions).
- Adapter buildUserStateForPipeline L46-53 trimite `user` aggregate cu Big 6. Engine context.user shape mai larg (`Record<string, unknown>`).
- MMI silent cap NU consuma direct onboarding — doar logs + pr-records via DB.
- Gap severity LOW: shape OK, dar `goal` legacy migrate (definire→slabire, sanatate→longevitate) — engine downstream se uita la 'masa'/'forta'/etc; daca user old-version persisted 'definire' și migrate ruleaza partial → goal-aware engine paths (periodization phaseAutoDetection) may not match. Migrate function L140-150 handles, persist version=2 trigger.

### 5. scheduleStore ↔ scheduleAdapter (post-SUBSTRATE-ZETA-FIX)

- Post-fix `dayConfigs = state.days.map((kind, idx) => ({day: DAY_KEYS[idx], active: kind === 'training'}))` L106-109 — shape match `CalendarOverrideDay[]` din scheduleAdapter.d.ts §11-13. OK.
- DEFAULT_WEEK in scheduleStore.ts L36 = `['training', 'rest', 'training', 'rest', 'training', 'training', 'rest']` indexed L,Ma,Mi,J,V,S,D mapped la DAY_KEYS L,M,M2,J,V,S,D — ordering canonic match.
- saveWeekly dispatcher dynamic import → catch Sentry — OK.
- Gap severity NONE remaining (post-fix verified).

### 6. settingsStore.telemetryOptIn ↔ Sentry init

- main.tsx L29-36 gate corect: initSentry() conditional pe telemetryOptIn=true initial + subscribe pe transition false→true.
- captureException pe sentry.js L113-128 returns silently daca `!_initialized` — gate respectat downstream chiar daca un caller ratează pre-check.
- Gap severity LOW: documented limitation in main.tsx comment L24-28: NU se poate un-init Sentry runtime (SDK limit). User revoca post-init = scope ramane active session — necesita reload pentru full disable. Trade-off acceptabil pentru pre-Beta (revocare rare).

### 7. coachStore ↔ coachDirectorAggregate

- coachStore = doar UI persona/schedContext/reactivateDismissed (L18-22). NU consuma direct engine.
- coachDirectorAggregate.getCoachToday(opts) compose readiness/fatigue/plannedWorkout/restReason/patternsBanner/alerts. Toate provenite din engineWrappers cu try/catch graceful baseline fallback.
- Gap severity NONE: composer layer Bugatti — toate composers null-safe + source flag aggregate engine|baseline.

### 8. RPE submission shape PostRpe → finishSession

- PostRpe submit (PostRpe.tsx L65-121) compose `LastSessionSummary` cu exercises breakdown {kg, reps, rating, timestamp, isPR?}. workoutStore.setLastRating + finishSession atomic.
- isPR field declared optional (workoutStore.ts L60). PostRpe NU set isPR pe breakdown sets — markPRHit happens in Workout pre-flow set-by-set, dar prData on store nu se mapeaza in `session.exercises[*].sets[*].isPR` la submit. Trace: prHistoryAggregate.ts L36 reads `set.isPR` din session, never set true din PostRpe handleSubmit.
- Gap severity MEDIUM: PRRecord aggregate (Istoric PR Wall + Progres streak prCount) reads `set.isPR` flag care permanent false → PR Wall NICIODATA populated cu PR-uri reale din sessions completed. Antrenor prWallRecent (coachDirectorAggregate.ts L70) = empty always.

### 9. NutritionTarget pipeline shape

- BN engine emite doar `kcal posterior.mu` + `confidence` enum ('low'|'medium'|'high'). Macros (protein/fat/carbs) preserved baseline V1.
- engineWrappers.getNutritionTargetsToday L509-554 mapeaza corect: `kcalTarget` (engine sau baseline), `proteinTargetG/fatG/carbsG` baseline V1 fixed.
- bayesianNutritionAggregate.ts L37-60 priority manual > engine > baseline. OK.
- Gap severity LOW: documented limitation source `baseline` returnat când engine emit `tier === 'none'` (T0 fresh < pragul de observatii). Acceptable.

### 10. PostSummary banner cu deltaKg/deltaPct/oneRMEstimate

- PRDelta engineWrappers L82-92 enrich engine output cu Epley 1RM estimate. workoutStore.markPRHit propaga prData cu deltaPct/oneRMEstimate optional fields.
- PostSummary cititor: ZERO scan needed — confirmed via grep prData consumer pattern in PostSummary.tsx existent.
- Gap severity NONE pe shape, dar dependent de PR detection scope (Gap #2/#8 cascada).

## Gaps identified

4 HIGH/CRITICAL + 1 MEDIUM + 2 LOW + 5 NONE:

- **Gap CRITICAL #2**: pr-records production unreachable post-D028. MMI silent cap niciodata declanseaza in productie → returning user weight protection broken. Engine #9 LOCK 10 spec deviation factual.
- **Gap CRITICAL #3**: DB.get('logs') consumers empty in React productie. Readiness/fatigue/adherence/aa/dp/patternLearning/stagnationDetector engine paths permanent baseline starved. Composer layer (Banner + RestReason + LaggingSignal) functional pe sessionsHistory flatten DAR adapter-level engine calls (`getReadiness`/`getFatigue`/`getAdherenceOutput`) input-starved → permanent null/baseline output.
- **Gap HIGH #1**: recentSessions shape mismatch profund. LastSessionSummary nu contine campuri rir/energy/weekIdx/injury/daysAgo care toate engine downstream consumers asteapta. Pipeline silent runs cu zero-signal data.
- **Gap MEDIUM #8**: PR Wall sessionsHistory.exercises[*].sets[*].isPR niciodata set true din PostRpe handleSubmit. PR Wall empty in Istoric tab + Antrenor prWallRecent slice empty.
- **Gap LOW #4**: onboarding goal legacy migrate edge case (definire/sanatate persisted pre-v2) — bounded by migration version=2.
- **Gap LOW #6**: Sentry un-init runtime limitation (SDK bound). Acceptable pre-Beta trade-off.

## Top 3 priority recommendations

1. **CRITICAL — bridge React workoutStore writes → DB('logs') + DB('pr-records')**: Add localStorage writeback shim in `finishSession` action sau in PostRpe handleSubmit care append entry-uri flatten din session.exercises[*].sets[*] la `DB.get('logs')` + recompute peak per exercise → `DB.set('pr-records', ...)`. Sau migrate toate adapter wrappers sa nu mai citeasca DB direct ci sa preia logs din workoutStore.sessionsHistory flatten (deja folosit in composers L639/767/820 — extinde la `getReadiness`/`getFatigue`/`getAdherenceOutput` internals fork). Severity CRITICAL — engines functional dar starved cancels Bugatti craft investit in engine pipeline LANDED 9/9.

2. **HIGH — bridge LastSessionSummary → recentSessions shape transform**: Add `toEngineSession(summary)` mapper in scheduleAdapterAggregate.ts care expand LastSessionSummary cu derived `rir` (din lastRating: 'usoara'→3, 'normala'→2, 'grea'→1 baseline heuristic), `energy` (deriv din readiness if available), `weekIdx` (din ts ISO week diff vs onboarding completedAt). ZERO src/engine/* mutation. Severity HIGH — periodization/deload/energyAdjustment dual-signal logic functional doar cu shape complet.

3. **MEDIUM — wire isPR flag in PostRpe handleSubmit**: extend PostRpe.tsx L80-105 cu re-run detectPR pe history flat per exercise + set isPR=true pe set entry-urile detected. Sau folosit workoutStore.prData (last PR detected in-session) sa marcheze ultimul set per exercitiu cu prData.exercise match. Severity MEDIUM — afecteaza PR Wall populated + streak prCount accurate, dar baseline UI render preserved (no crashes, just empty cards).

## Daniel CEO decisions

- (a) Accept CRITICAL #2/#3 ca pre-Beta Iter 1 Mass Fix V2 candidates? Wave architecture pentru shim logs/pr-records writeback este isolated additive (~30-50 LOC in workoutStore.finishSession + PostRpe handleSubmit) — putem land safely fara mutation src/engine/*.
- (b) HIGH #1 shape transform recentSessions: heuristic mapping din lastRating→rir = approximation imprecisa, dar baseline functional > permanent empty. Accept ca Iter 1 Wave B candidate cu LOCK V1 mapping table?
- (c) MEDIUM #8 isPR wire este simplu (~10 LOC PostRpe.tsx). Land singular commit pre-Beta?

## Blockers

NONE pe execution path. Toate findings READ-ONLY src/, zero `git commit`. Raport singular livrabil.
