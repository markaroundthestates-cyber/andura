# SECTION 08 — Data / state / persistence (CRITICAL — gate 98%)

> **Goal.** Every piece of user data has exactly ONE source of truth, persists
> correctly, survives a reload, and — when the user is logged in — backs up to
> Firebase. This is the section that *would have caught* the body-fat split-source
> bug Daniel found 2026-05-29, and it is the section that answers the only
> question that matters at the gym: **"can I use it without losing my data?"**
>
> **Why this is CRITICAL.** Data loss is the one bug a fitness app cannot
> survive — a user who logs three months of training and then loses it on a
> cache-clear never comes back. The store layer (8 Zustand stores), the legacy
> Tier-0 flat keys (`src/db.js` localStorage), the Tier-1 IndexedDB archive
> (`src/storage/db.js`), and the Tier-2 Firebase RTDB backup (`src/firebase.js`)
> are FOUR overlapping persistence substrates with DIFFERENT key namespaces and
> DIFFERENT sync coverage. The split-source class of bug lives exactly in the
> seams between them.
>
> **Scope of this file.** Per-store persist config (×8), every cross-store
> duplicated value, IndexedDB schema + per-UID namespacing, Firebase sync
> coverage + the skip-auth-vs-logged-in data-loss matrix, reload/persistence
> behavior, and GDPR export/delete completeness across both tiers.
>
> **Run discipline (from 00-MASTER §HOW TO RUN).** One verdict per step. Evidence
> mandatory — a PASS with no `file:line`/computed-value/command-output is INVALID
> and scored FAIL. Behavior steps run against a SEEDED account (see
> §APPENDIX-SEED in the master run), never an empty one. BLOCKED only when an env
> dependency is genuinely missing — never to dodge a checkable item; >5% BLOCKED
> in this section fails the section regardless of the rest.

---

## 08.A — Per-store persist configuration (one step per store × per knob)

> The eight Zustand stores all use `persist(..., { name, storage:
> createJSONStorage(() => localStorage), partialize, [version], [migrate] })`.
> The checks below verify each store's `name` key is unique + correctly
> namespaced (`wv2-*`), that `partialize` persists the data and excludes
> runtime-only + action functions, and — where a `version`/`migrate` exists —
> that the migration is correct + lossless.

### [08.001] appStore — persist `name` key is `wv2-app-store`
- **Check:** `useAppStore` persists under the localStorage key `wv2-app-store`.
- **Where:** `src/react/stores/appStore.ts:49`
- **Expected:** `name: 'wv2-app-store'`. Unique among all eight stores; `wv2-` prefix is the export/wipe contract (`SettingsExport.collectTier0Keys` scans `wv2-*`).
- **Verify:** `grep -n "name:" src/react/stores/appStore.ts` → exactly `name: 'wv2-app-store'`. Cross-check no other store reuses this string.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.002] appStore — `partialize` persists ONLY `isSkipAuth`
- **Check:** appStore persists `isSkipAuth` and nothing else (persona/initialized/isAuthenticated are session-scope or token-derived).
- **Where:** `src/react/stores/appStore.ts:51-54`
- **Expected:** `partialize: (state) => ({ isSkipAuth: state.isSkipAuth })`. `isAuthenticated` deliberately NOT persisted (derived from `firebase-*` tokens via ProtectedRoute); `persona`+`initialized` reset each session.
- **Verify:** Read the `partialize` body. Then in DevTools: set skip-auth on, reload → `JSON.parse(localStorage['wv2-app-store']).state` contains only `isSkipAuth`. Confirm `isAuthenticated` is NOT a persisted key.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Risk if `isAuthenticated` were persisted: a stale `true` would let a signed-out user past ProtectedRoute on reload. Confirm it is NOT.

### [08.003] appStore — no `version`/`migrate` is acceptable (shape never broke)
- **Check:** appStore omits `version`+`migrate`; that is correct because its persisted shape (`{isSkipAuth}`) has never changed.
- **Where:** `src/react/stores/appStore.ts:48-55`
- **Expected:** No migration needed — single boolean, additive-safe. A persisted blob from any prior version still hydrates `isSkipAuth` (or defaults `false`).
- **Verify:** Confirm no `version:`/`migrate:` in the persist options. Seed `localStorage['wv2-app-store']` with `{state:{},version:0}` → reload → no crash, `isSkipAuth` defaults `false`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.004] coachStore — persist `name` key is `wv2-coach-store`
- **Check:** `useCoachStore` persists under `wv2-coach-store`, unique.
- **Where:** `src/react/stores/coachStore.ts:43`
- **Expected:** `name: 'wv2-coach-store'`.
- **Verify:** `grep -n "name:" src/react/stores/coachStore.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.005] coachStore — `partialize` persists data fields, excludes actions
- **Check:** coachStore persists `schedContext`, `persona`, `reactivateDismissed`; action functions are excluded.
- **Where:** `src/react/stores/coachStore.ts:49-53`
- **Expected:** `partialize` returns exactly `{schedContext, persona, reactivateDismissed}` — no `set*`/`dismiss*` functions serialized.
- **Verify:** Read partialize. Reload after `dismissReactivate()` → `JSON.parse(localStorage['wv2-coach-store']).state` has `reactivateDismissed:true` and contains zero function-typed values.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `persona` is duplicated with `appStore.persona` — see cross-store step [08.030].

### [08.006] coachStore — `schedContext` placeholder is a known runtime stub, not real coach output
- **Check:** persisted `schedContext` defaults `'workout'` (Phase-3 placeholder), NOT derived from `coachDirector.buildSession()`.
- **Where:** `src/react/stores/coachStore.ts:34` + JSDoc lines 5-6
- **Expected:** Documented placeholder. PARTIAL if the audit expects real coach-derived context but finds the hardcoded stub still shipping at Beta.
- **Verify:** Read default + JSDoc. Confirm no wire to `coachDirector` writes `schedContext` in production paths (`grep -rn setSchedContext src/react`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.007] nutritionStore — persist `name` key is `wv2-nutrition-store`
- **Check:** `useNutritionStore` persists under `wv2-nutrition-store`, unique.
- **Where:** `src/react/stores/nutritionStore.ts:70`
- **Expected:** `name: 'wv2-nutrition-store'`.
- **Verify:** `grep -n "name:" src/react/stores/nutritionStore.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.008] nutritionStore — `partialize` persists `dailyLog` only
- **Check:** Only `dailyLog` is persisted; `setDailyKcal`/`setDailyProtein`/`getDaily`/`reset` excluded.
- **Where:** `src/react/stores/nutritionStore.ts:76-78`
- **Expected:** `partialize: (state) => ({ dailyLog: state.dailyLog })`.
- **Verify:** Read partialize. Log a kcal value → reload → `JSON.parse(localStorage['wv2-nutrition-store']).state.dailyLog` retains the entry; no functions present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.009] nutritionStore — `upsertEntry` dedupes by `dateISO` (one entry per day)
- **Check:** Logging kcal twice on the same day overwrites the day's entry, never duplicates.
- **Where:** `src/react/stores/nutritionStore.ts:37-56` (`upsertEntry` findIndex by `dateISO`)
- **Expected:** `setDailyKcal(d, 100)` then `setDailyKcal(d, 200)` → `dailyLog` has ONE entry for `d` with `kcal:200`, fresh `ts`.
- **Verify:** Run `nutritionStore.test.ts` upsert case OR Node REPL: import store, call twice, assert `dailyLog.length === 1`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `dailyLog` is UNBOUNDED (no rolling cap, unlike `sessionsHistory`). On a 2–3yr horizon ~1 entry/day ≈ ~1100 entries — small, but flag if no cap and quota math is not documented (contrast [08.024]).

### [08.010] onboardingStore — persist `name` key is `wv2-onboarding-store`
- **Check:** `useOnboardingStore` persists under `wv2-onboarding-store`, unique.
- **Where:** `src/react/stores/onboardingStore.ts:272`
- **Expected:** `name: 'wv2-onboarding-store'`.
- **Verify:** `grep -n "name:" src/react/stores/onboardingStore.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.011] onboardingStore — `version: 5` and `partialize` persist data+completed+completedAt
- **Check:** `version: 5`; `partialize` returns `{data, completed, completedAt}`; actions excluded.
- **Where:** `src/react/stores/onboardingStore.ts:287, 292-296`
- **Expected:** `version: 5`, partialize exactly those three keys.
- **Verify:** Read both. Finalize onboarding → reload → `JSON.parse(localStorage['wv2-onboarding-store'])` shows `version:5` + `state.completed:true` + full `data`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.012] onboardingStore — `migrate` v<5 maps legacy goals losslessly
- **Check:** A persisted blob with `goal:'longevitate'` (or `'definire'`/`'sanatate'`) at `version<5` migrates to a valid current `Goal` with zero data loss on the other fields.
- **Where:** `src/react/stores/onboardingStore.ts:297-320` + `migrateLegacyGoal` lines 213-224
- **Expected:** `'definire'→'slabire'`, `'sanatate'→'mentenanta'`, `'longevitate'→'mentenanta'`; all other `data` fields preserved via `{...EMPTY, ...state.data, goal: migrated}`.
- **Verify:** Run `onboardingStore.test.ts` migration cases. OR seed `localStorage['wv2-onboarding-store']={"state":{"data":{"goal":"longevitate","age":30,"weight":80},"completed":true},"version":4}` → reload → `goal==='mentenanta'`, `age===30`, `weight===80`, `completed===true`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Spread order is correct (`...EMPTY` first so removed fields default null, then `state.data` so existing values win, then `goal` override). Confirm no field clobbered to null.

### [08.013] onboardingStore — `migrate` backfills new optional fields (`targetWeight`/`targetDate`) as null
- **Check:** A v3 blob (pre-`targetWeight`/`targetDate`) hydrates with both new fields = null, no crash.
- **Where:** `src/react/stores/onboardingStore.ts:307-313` (`...EMPTY` spread) + EMPTY lines 188-199
- **Expected:** Existing user gets `targetWeight:null`, `targetDate:null` defaults; no breaking change.
- **Verify:** Seed a v3 blob with no target fields → reload → state has `targetWeight===null && targetDate===null`; Big-6 intact.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.014] onboardingStore — `setField` rejects engine-killer values silently (catastrophe gate)
- **Check:** `setField('weight', NaN/Infinity/-5/0)` is rejected (store unchanged), preserving in-progress typing for finite intermediate values.
- **Where:** `src/react/stores/onboardingStore.ts:232-239` + `isSafeOnboardingValue` lines 110-129
- **Expected:** Non-finite / ≤0 numerics never reach the store; valid partial typing (e.g. `1` mid-`16`) allowed.
- **Verify:** Run onboardingStore tests for `isSafeOnboardingValue`. OR call `setField('weight', NaN)` then read `data.weight` — unchanged.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Defense-in-depth: store catches catastrophes, UI catches range (`validateOnboardingField`). Confirm both layers exist.

### [08.015] onboardingStore — `finalize` requires the Big-7, skips optional targets
- **Check:** `finalize()` marks `completed:true` only when all 7 required fields are present + in-range; it does NOT block on null `targetWeight`/`targetDate`.
- **Where:** `src/react/stores/onboardingStore.ts:258-267` (`REQUIRED_FIELDS` array)
- **Expected:** All-null Big-7 → no completion (U-02 guard); valid Big-7 + null targets → `completed:true`. (Regression target: BUG-onboarding-step8-gata 2026-05-28 where iterating all keys blocked finalize on optional nulls.)
- **Verify:** Reproduce: fill Big-7 valid, leave targets null, call `finalize()` → `completed===true`. Then null one required field → `finalize()` → still `false`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.016] progresStore — persist `name` key is `wv2-progres-store`
- **Check:** `useProgresStore` persists under `wv2-progres-store`, unique.
- **Where:** `src/react/stores/progresStore.ts:179`
- **Expected:** `name: 'wv2-progres-store'`.
- **Verify:** `grep -n "name:" src/react/stores/progresStore.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.017] progresStore — `partialize` persists `weightLog`+`bodyData`+`targetObiectiv`
- **Check:** All three data slices persist; actions excluded.
- **Where:** `src/react/stores/progresStore.ts:185-189`
- **Expected:** `partialize` returns exactly `{weightLog, bodyData, targetObiectiv}`.
- **Verify:** Read partialize. Add a weight entry → reload → `state.weightLog` retains it.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** progresStore has NO `version`/`migrate`. `weightLog`/`bodyData`/`targetObiectiv` are all additive across history; confirm a blob missing `targetObiectiv` hydrates without crash (the initializer default `EMPTY_TARGET` covers it) → [08.018].

### [08.018] progresStore — blob missing `targetObiectiv` hydrates safely (no migrate)
- **Check:** A persisted blob written before `targetObiectiv` existed still loads; `targetObiectiv` falls back to `{weightKg:null, month:null}`.
- **Where:** `src/react/stores/progresStore.ts:121, 128` (`EMPTY_TARGET` default in initializer)
- **Expected:** Zustand merges persisted partial over initial state → missing key keeps initializer default. No crash, no NaN.
- **Verify:** Seed `localStorage['wv2-progres-store']={"state":{"weightLog":[{"kg":80,"date":"2026-05-01","ts":1}],"bodyData":[]},"version":0}` → reload → `targetObiectiv` is `{weightKg:null,month:null}`, weightLog intact.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Because there is no `version`, a future shape change to `weightLog`/`bodyData` entries has NO migration path. Flag as a latent risk if entry shape ever changes post-Beta.

### [08.019] progresStore — `addWeightEntry` upserts by `date` (one weigh-in per day)
- **Check:** Logging weight twice the same date overwrites; different dates append.
- **Where:** `src/react/stores/progresStore.ts:132-142`
- **Expected:** Same-date second call replaces the entry (idx found), fresh `ts`; new date pushes.
- **Verify:** Run `progresStore.test.ts`. OR REPL: `addWeightEntry({kg:80,date:'2026-05-01'})` then `{kg:81,date:'2026-05-01'}` → `weightLog.length===1 && weightLog[0].kg===81`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.020] progresStore — `weightLog` is UNBOUNDED (no rolling cap)
- **Check:** `weightLog` and `bodyData` have no `.slice()` cap, unlike `workoutStore.sessionsHistory` (capped 500) and `logs` (capped 5000).
- **Where:** `src/react/stores/progresStore.ts:132-146` (append/upsert, no slice)
- **Expected:** Daily weigh-ins over 2–3yr ≈ ~1100 entries (tiny). Acceptable — but the ASYMMETRY with capped stores should be deliberate, not accidental. PARTIAL if the audit judges an uncapped growth path is undocumented.
- **Verify:** Confirm no slice/cap in `addWeightEntry`/`addBodyDataEntry`. Estimate worst-case size (entries × ~60 bytes) vs 5MB localStorage budget.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.021] scheduleStore — persist `name` key is `wv2-schedule-store`
- **Check:** `useScheduleStore` persists under `wv2-schedule-store`, unique.
- **Where:** `src/react/stores/scheduleStore.ts:154`
- **Expected:** `name: 'wv2-schedule-store'`.
- **Verify:** `grep -n "name:" src/react/stores/scheduleStore.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.022] scheduleStore — `partialize` persists `weekStartISO`+`days`, excludes `editMode`
- **Check:** `editMode` is session-scope (NOT persisted) so navigating away mid-edit returns out of edit mode; `weekStartISO`+`days` persist.
- **Where:** `src/react/stores/scheduleStore.ts:159-162`
- **Expected:** `partialize` returns only `{weekStartISO, days}`.
- **Verify:** Enter edit mode → reload → `JSON.parse(localStorage['wv2-schedule-store']).state` has NO `editMode`; store re-inits `editMode:false`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** No `version`/`migrate`. `days` is a fixed 7-tuple — shape stable.

### [08.023] workoutStore — persist `name` key is `wv2-workout-store`
- **Check:** `useWorkoutStore` persists under `wv2-workout-store`, unique.
- **Where:** `src/react/stores/workoutStore.ts:646`
- **Expected:** `name: 'wv2-workout-store'`.
- **Verify:** `grep -n "name:" src/react/stores/workoutStore.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.024] workoutStore — `partialize` persists history+streak, EXCLUDES runtime-only
- **Check:** persists `pausedSnapshot`, `lastSession`, `sessionsHistory`, `streak`, `lastStreakDate`; EXCLUDES `sessionStart`, `sessionContext`, `refusalTriedByEx`, `exIdx`, `setIdx`, `phase`, `history`, `prHit`, `prData`, `lastRating`.
- **Where:** `src/react/stores/workoutStore.ts:652-658`
- **Expected:** Exactly the five persisted keys. Mid-session runtime (`sessionStart`, live `history`, `phase`) deliberately NOT persisted (a reload mid-workout drops to idle, falls back to `pausedSnapshot` only if explicitly paused).
- **Verify:** Read partialize. Start a session (don't pause), reload → persisted blob has NO `sessionStart`; `getCurrentMode` returns `idle`/`finished`/`paused`, never a half-live `active`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** **Reload-mid-workout data-loss check:** an in-progress session that is NOT paused loses its logged sets on reload (only `pausedSnapshot` survives). Verify the live-workout UI auto-pauses or persists `history` before any reload-risk path, OR flag as in-workout data loss (gym-critical). Cross-ref Section 06.

### [08.025] workoutStore — `sessionsHistory` rolling cap = 500 (quota protection)
- **Check:** `finishSession` caps `sessionsHistory` at 500 newest entries (`SESSIONS_HISTORY_MAX`).
- **Where:** `src/react/stores/workoutStore.ts:190, 546` (`.slice(-SESSIONS_HISTORY_MAX)`)
- **Expected:** ~1.4yr daily-use window; oldest sessions drop first; no silent localStorage-quota persist failure.
- **Verify:** Run `workoutStore.test.ts`. OR REPL: push 501 sessions → `sessionsHistory.length === 500` and the FIRST pushed is gone.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** A 500-session cap means a 3-year daily user LOSES the oldest sessions from `sessionsHistory`. Tier-1 IDB archive is the intended overflow (see [08.040]) — verify sessions older than the cap are archived to IndexedDB, NOT silently dropped. If not archived, this is real history loss → FAIL.

### [08.026] workoutStore — `finishSession` writes per-set logs to Tier-0 `logs` for engines
- **Check:** `finishSession` calls `persistSessionLogs`, which writes flat per-set entries to `DB.get/set('logs')` so engine adapters (readiness/fatigue/adherence/MMI/stagnation) receive real history.
- **Where:** `src/react/stores/workoutStore.ts:223-243, 537` + `buildLogEntriesFromSummary` 192-221
- **Expected:** After a finished session, `localStorage['logs']` (UNPREFIXED, Tier-0) contains per-set entries `{date,ex,w,kg,set,reps,ts,session,rpe?}`, newest-first, capped `LOGS_MAX=5000`.
- **Verify:** Finish a seeded session → DevTools `JSON.parse(localStorage.logs)` has entries with the session's exercises; confirm `rpe` derived from per-set `rating` via `RATING_TO_RPE`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** This is the CRIT#2 shape-check fix — without it the React path never fed engines. **Dual-write hazard:** the SAME session now lives in `wv2-workout-store.sessionsHistory` (rich) AND flat `logs` (per-set). Confirm they cannot diverge (e.g. a discarded session must not leave orphan `logs`). See cross-store [08.034].

### [08.027] settingsStore — persist `name` key is `wv2-settings-store`
- **Check:** `useSettingsStore` persists under `wv2-settings-store`, unique.
- **Where:** `src/react/stores/settingsStore.ts:94`
- **Expected:** `name: 'wv2-settings-store'`.
- **Verify:** `grep -n "name:" src/react/stores/settingsStore.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.028] settingsStore — `partialize` persists all 13 preference fields, excludes actions
- **Check:** persists theme, accent, notifications*, unitSystem, weekStart, telemetryOptIn, dataExportConsent, bottomNavStyle, acceptedDisclaimer, acceptedDisclaimerAt; actions excluded.
- **Where:** `src/react/stores/settingsStore.ts:100-114`
- **Expected:** All 13 keys present in partialize; no function values.
- **Verify:** Read partialize against the `SettingsState` interface (lines 16-30) — every non-action field must appear. Toggle theme → reload → persists.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `acceptedDisclaimer`/`acceptedDisclaimerAt` persistence is a CROSS-CUTTING invariant (Section 15 — medical disclaimer must not re-prompt forever, but must be re-presentable). Confirm both persist.

### [08.029] settingsStore — `acceptedDisclaimer` survives reload (disclaimer not re-shown)
- **Check:** Accepting the medical disclaimer persists `acceptedDisclaimer:true`+timestamp so it is not re-shown on reload.
- **Where:** `src/react/stores/settingsStore.ts:89-90` (`acceptDisclaimer`) + partialize 112-113
- **Expected:** After `acceptDisclaimer()`, reload → `acceptedDisclaimer===true`, `acceptedDisclaimerAt` a number; disclaimer gate not re-triggered.
- **Verify:** Accept → reload → read persisted blob; confirm UI does not re-present disclaimer. Cross-ref Section 15 invariant.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 08.B — Source-of-truth unification (the body-fat class of bug)

> Every value that can be read from TWO places is a split-source-of-truth
> candidate. For each, the audit must name the CANONICAL source and confirm ALL
> readers agree. This subsection pre-fills the bf% FAIL Daniel found and then
> enumerates every other duplicated value.

### [08.030] Current weight — canonical source is the latest-by-DATE `weightLog` entry
- **Check:** Every consumer of "current weight" (BMR, TDEE, protein target, bf%, periodization) reads the same canonical value: the most-recent-by-DATE `weightLog` entry, falling back to `onboardingStore.data.weight`.
- **Where:** Canonical reader `src/react/lib/userTdee.ts:348-362` (`getCurrentWeightKg` — reduces by `e.date > m.date`, NOT positional).
- **Expected:** All readers route through `getCurrentWeightKg` (or an equivalent latest-by-date selector). `onboardingStore.data.weight` is ONLY the cold-start seed.
- **Verify:** `grep -rn "weightLog\[" src/react` and `grep -rn "data.weight" src/react` → every "current weight" read must agree with `getCurrentWeightKg`. List every divergent reader.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** This is the unification anchor for [08.031]–[08.033].

### [08.031] Body-fat % reacts to a profile weight change
- **Check:** Changing weight in the profile updates the body-fat % shown on Progress.
- **Where:** `src/react/components/Progres/BodyFatStrip.tsx:39` + `src/react/routes/screens/cont/SettingsProfile.tsx:162-164`.
- **Expected:** bf% recomputes from the current weight the user just set.
- **Verify:** Playwright on a seeded account → note bf% on Progress → change weight in Profile → Save → return to Progress → bf% changed accordingly.
- **Verdict:** ☐ PASS ☑ PARTIAL ☐ FAIL ☐ BLOCKED  *(as of 2026-05-29 — see Notes; verify current behavior)*
- **Evidence:** `BodyFatStrip.tsx:39` reads `weightLog[weightLog.length - 1]?.kg ?? onboardingWeight` (POSITIONAL last). `SettingsProfile.handleSave` (lines 162-164) now DOES upsert today's weigh-in into `weightLog` when weight changed (`§weight-continuity` fix). So the original FAIL (profile edit didn't touch weightLog) is REMEDIATED for the common case. **Residual split:** BodyFatStrip reads `weightLog[length-1]` POSITIONALLY while the canonical reader `getCurrentWeightKg` (userTdee.ts:358-360) reads MAX-BY-DATE. A back-dated weigh-in (a forgotten day logged later, pushed to the array tail) makes BodyFatStrip and BMR/TDEE/protein DISAGREE on "current weight" → bf% diverges from every other body-comp readout.
- **Notes:** Fix: make `BodyFatStrip` read `getCurrentWeightKg()` instead of `weightLog[length-1]` so all body-comp surfaces share ONE canonical current-weight source. Re-run the back-dated-weigh-in case to confirm convergence. Pin a behavior test: log weight 110 (today), then back-date a 95 (yesterday) AFTER → assert BodyFatStrip uses 110, identical to BMRStrip.

### [08.032] Body composition (waist/neck) — one physical source across Cont + Progres
- **Check:** Waist/neck measurements entered in Cont→Profil and in Progres→Masuratori feed the SAME US-Navy bf% via a per-field aggregation over full history (not just the last entry).
- **Where:** `src/react/stores/progresStore.ts:79-104` (`latestBodyMeasurements`) consumed by `BodyFatStrip.tsx:34` and `SettingsProfile.tsx:65`.
- **Expected:** Entering neck in Cont then chest in Progres still yields US-Navy bf% (neck not lost because the later Progres entry lacks it). Each field = most-recent entry where present.
- **Verify:** Seed: Cont writes `{neckCm, waistCm}` on day1; Progres writes `{waistCm, chestCm}` on day2. Read bf% → must still be US-Navy (neck recovered from day1), NOT Deurenberg fallback. Run `progresStore.test.ts` `latestBodyMeasurements` cases.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** This is the Smoke 2026-05-28 #15 fix. Confirm both readers (`BodyFatStrip`, `SettingsProfile`) call `latestBodyMeasurements`, not raw `bodyData[length-1]`. `grep -rn "bodyData\[" src/react`.

### [08.033] Height — single source `onboardingStore.data.height`
- **Check:** Height is read+written from ONE place; SettingsProfile edits the same `data.height` that feeds BMR/US-Navy.
- **Where:** `src/react/stores/onboardingStore.ts` `data.height`; edited at `SettingsProfile.tsx:296-300`; consumed by `BodyFatStrip.tsx:29` + BMRStrip.
- **Expected:** No separate local height state in SettingsProfile (RE-U-01 reconciliation); editing it moves BMR + bf%.
- **Verify:** `grep -rn "height" src/react/routes/screens/cont/SettingsProfile.tsx` → height uses `draft.height` (store), NOT a separate `useState`. Edit height → BMRStrip + BodyFatStrip both move.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.034] Workout session — `sessionsHistory` (Zustand) vs flat `logs` (Tier-0) cannot diverge
- **Check:** A finished session writes BOTH `wv2-workout-store.sessionsHistory` AND flat `logs`; a discarded/abandoned session writes NEITHER. They never desync.
- **Where:** `src/react/stores/workoutStore.ts:529-553` (finish writes both) vs `discardSession` 515-527 (writes neither) + `persistSessionLogs` 223-243.
- **Expected:** Only `finishSession` persists; `discardSession`/`reset`/`pauseSession` do not write `logs`. No path leaves orphan `logs` entries for a session absent from `sessionsHistory`.
- **Verify:** Finish a session → both populated with the same `session` id. Then start+discard a session → `logs` gains NO new entries, `sessionsHistory` unchanged.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Two representations of one truth is the canonical split-source risk. Engines read `logs`; UI reads `sessionsHistory`. If they disagree, the coach sees a different history than the user. Flag any write path that touches only one.

### [08.035] Persona — `appStore.persona` vs `coachStore.persona` (duplicated enum)
- **Check:** `Persona` exists in BOTH `appStore` (line 18-29) and `coachStore` (line 16, 20). Identify which is canonical and confirm readers do not split.
- **Where:** `src/react/stores/appStore.ts:18,39` + `src/react/stores/coachStore.ts:16,34`.
- **Expected:** ONE canonical persona source. If both are written independently, a user could see persona X in coach copy and persona Y elsewhere.
- **Verify:** `grep -rn "setPersona\|\.persona" src/react` → list every reader+writer. Determine if appStore.persona is dead/unused vs coachStore.persona canonical (appStore persona is NOT in its partialize — line 54 persists only `isSkipAuth` — so appStore.persona is session-only).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** appStore.persona is NOT persisted (partialize line 54 = `{isSkipAuth}` only); coachStore.persona IS persisted (line 49-53). Determine which the UI actually reads.
- **Notes:** If both are read in different components, that is a split source for persona. Recommend deleting the unused one.

### [08.036] Target weight/date — canonical is `progresStore.targetObiectiv`, NOT `onboardingStore.targetWeight`
- **Check:** Target weight + deadline exist in BOTH `onboardingStore.data.targetWeight/targetDate` AND `progresStore.targetObiectiv.{weightKg,month}`. Name the canonical one; confirm kcal-target consumer reads it.
- **Where:** `onboardingStore.ts:45,52` vs `progresStore.ts:34-39,121,147-166`; ObiectivCard (Progres) writes via `setTargetObiectiv`.
- **Expected:** Per `§obiectiv-tinta`, ObiectivCard persists to `progresStore.targetObiectiv`; `engineWrappers.getTargetKcalToday` should read THAT. The `onboardingStore.targetWeight/targetDate` fields (added Smoke #16) may now be a SECOND, possibly-stale copy.
- **Verify:** `grep -rn "targetObiectiv\|targetWeight\|targetDate" src/react` → which store does the kcal/ETA consumer read? Are both written? If onboardingStore.target* is written by no UI path, it is dead duplication; if written by an old path, it is a split source.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** SettingsProfile comments (lines 176-179) say targets are persisted in ObiectivCard via `progresStore`, and SettingsProfile no longer writes them — but `onboardingStore` STILL declares `targetWeight`/`targetDate` with full bounds validation (lines 45-52, 84-92, 164-171). Confirm exactly one is live; flag the other as dead-or-divergent.

### [08.037] Notification prefs — settingsStore vs Firebase `notificationPrefs` sibling node
- **Check:** Notification settings (enabled/frequency/days/time) live in `settingsStore` (Tier-0) AND are mirrored to a Firebase `notificationPrefs` node by `notificationPrefsSync.ts`. Confirm direction of truth + that the PATCH-not-PUT sync doesn't clobber.
- **Where:** `src/react/stores/settingsStore.ts:19-23` + `src/firebase.js:258-262` (PATCH preserves siblings) + `notificationPrefsSync.ts` (referenced).
- **Expected:** settingsStore is canonical local; the Firebase sibling is a mirror for FCM delivery. `syncToFirebase` uses PATCH so it does not delete `notificationPrefs`/`fcmTokens`.
- **Verify:** Read `firebase.js:258-263` (PATCH rationale). Confirm `notificationPrefsSync.ts` writes the sibling; toggle a notification setting → local persists; confirm no whole-tree PUT exists that would drop the sibling.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.038] No store reads `bf-override` from two places (Tier-0 legacy vs settings)
- **Check:** `bf-override` (manual bf%) appears in `USER_DATA_KEYS` (dataRegistry) and `SYNC_KEYS` (firebase). SettingsProfile has a `bfManual`/`bfOverride` local-state UI (lines 81-82, 314-339). Confirm where it persists and that there is one source.
- **Where:** `src/util/dataRegistry.js:8` (`bf-override`) + `src/firebase.js:80` (`bf-override` in SYNC_KEYS) + `SettingsProfile.tsx:81-82` (local `bfOverride` state).
- **Expected:** If the manual bf% override is meant to persist, it must write to a single canonical key.
- **Verify:** `grep -rn "bf-override\|bfOverride\|bfManual" src/` → does `SettingsProfile` PERSIST the override, or is it discarded on unmount? Trace whether `bf-override` (Tier-0) is still written by any React path.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** `SettingsProfile.tsx:81-82` `bfManual`/`bfOverride` are local `useState` — `handleSave` (lines 124-181) does NOT write them anywhere. Manual bf% override appears DISCARDED on save (data loss for that field) while `bf-override` Tier-0 key still ships in SYNC_KEYS — likely a dead/orphan field.
- **Notes:** Either wire the manual override to a canonical key (and remove the orphan), or remove the UI. Discarded user input is a Gigel-confusing silent loss.

---

## 08.C — Tier-0 localStorage (legacy flat keys) integrity

> Pre-React engine code (`src/db.js` + engine wrappers) writes UNPREFIXED flat
> keys (`logs`, `weights`, `coach-decisions`, ...). These coexist with the
> `wv2-*` Zustand keys. The registry (`src/util/dataRegistry.js`) is the SSOT for
> what those keys are and how reset treats them.

### [08.039] `DB.set` returns a quota-error result instead of crashing the tree
- **Check:** `DB.set` catches `QuotaExceededError`, captures to Sentry, and returns `{ok:false, error:'quota_exceeded'}` rather than throwing into React render.
- **Where:** `src/db.js:18-29`
- **Expected:** On quota exhaustion (Safari/iOS 5MB), `DB.set` does not crash; returns a structured failure.
- **Verify:** Mock `localStorage.setItem` to throw `QuotaExceededError` → `DB.set('k','v')` returns `{ok:false,error:'quota_exceeded',key:'k'}` and does not throw.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Existing callers fire-and-forget the return — confirm no caller NEEDS to react to a quota failure (e.g. user should be warned their workout did not save). Zustand `persist` does NOT route through `DB.set`; its own quota failure path is separate → [08.045].

### [08.040] Tier-0 → Tier-1 rotation archives old `logs`/CDL to IndexedDB (no loss at cap)
- **Check:** Entries aged past the rotation window are moved from Tier-0 to Tier-1 IDB (`tieringEngine`), not dropped when the `logs` 5000-cap or `sessionsHistory` 500-cap clips them.
- **Where:** `src/storage/tieringEngine.js` + `src/storage/db.js` stores `LOGS_TIER1`/`CDL_TIER1`.
- **Expected:** Rotation copies-then-deletes (transactional) so capped Tier-0 data survives in Tier-1, exportable via GDPR export ([08.052]).
- **Verify:** Run `tieringEngine.test.js`. OR seed >cap entries, trigger rotation, assert Tier-1 `tier1All(LOGS_TIER1)` contains the overflow and Tier-0 was trimmed.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** **Critical seam:** the `workoutStore.sessionsHistory` 500-cap ([08.025]) drops the OLDEST sessions. Confirm those dropped sessions were already archived to Tier-1 (via the flat `logs` rotation) BEFORE the cap clips them — otherwise old workouts are gone for good. If `sessionsHistory` overflow has no archive, that is FAIL (history loss).

### [08.041] `dataRegistry` key lists are complete + match what is actually written
- **Check:** `USER_DATA_KEYS` + `CDL_KEYS` + `TEST_RESIDUE_KEYS` + `DYNAMIC_KEY_PREFIXES` cover every flat key any engine wrapper writes.
- **Where:** `src/util/dataRegistry.js:6-57`
- **Expected:** No flat key is written by code but absent from the registry (the registry drives export + reset; a missing key = un-exported + un-reset = GDPR + privacy gap). Known prior gap: `pain-cdl` (written by engineWrappers, absent from registry — patched into export at `SettingsExport.tsx:29`).
- **Verify:** `grep -rnoE "DB\.set\(['\"][a-z-]+" src/ | sort -u` → list every flat key written; diff against the registry arrays + `pain-cdl`. Report any key written-but-unregistered.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `pain-cdl` is the canonical example of a registry gap that broke export. Hunt for others (dynamic-prefix keys especially).

### [08.042] `PRESERVE_ON_RESET_KEYS` keeps device identity + theme across reset
- **Check:** `fullReset` preserves `device-id`, `active-theme`, `last-backup`, `data-owner-uid`; wipes everything else per the registry semantics.
- **Where:** `src/util/dataRegistry.js:45`
- **Expected:** After reset, `device-id` survives (so a returning same-uid user is not needlessly re-wiped — H1 shared-device fix) but training data is gone.
- **Verify:** Trigger reset on seeded data → `localStorage['device-id']` survives, `localStorage['logs']` gone. Confirm `data-owner-uid` marker logic in `util/dataReset.js enforceDataOwner`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.043] `tod`/`todTs` use LOCAL timezone (never `toISOString` for "today")
- **Check:** Date keys use `toLocaleDateString('sv')` (local), not `toISOString()` (UTC) — the 26-Apr-2026 midnight bug.
- **Where:** `src/db.js:38-44` (`tod`, `todTs`, `todDate`).
- **Expected:** A workout logged at 23:30 local appears under TODAY's date, not tomorrow's UTC date.
- **Verify:** `grep -rn "toISOString" src/` → confirm no production "today date" path uses it (export `exportedAt` ISO timestamp at `SettingsExport.tsx:92` is fine — that's a full timestamp, not a day-key). Mock clock to 23:30 local in a non-UTC tz → `tod()` returns the local day.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Day-boundary correctness underpins streak ([08.026]/Section 06), daily nutrition log ([08.009]), and weigh-in upsert ([08.019]). A UTC regression silently mis-buckets all three.

---

## 08.D — Tier-1 IndexedDB (`src/storage/db.js`) per-UID isolation + schema

### [08.044] IndexedDB is namespaced per UID (`andura_<uid>` / `andura_anonymous_<deviceId>`)
- **Check:** Each user's IDB is a separate Dexie DB named `andura_<namespace>`; resolution order is auth uid → anonymous deviceId → legacy fallback.
- **Where:** `src/storage/db.js:116-145` (`getNamespace`), `215-221` (`getDb` → `andura_<ns>`).
- **Expected:** Logged-in user A and anonymous user B on the same device have DISTINCT DBs; no cross-read.
- **Verify:** Run `db.test.js`. OR: with auth uid set, `getNamespace()` returns the sanitized uid; clear auth, set `device-id` → returns `anonymous_<deviceId>`. Confirm `_sanitizeNamespace` strips non-alphanumerics.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `_namespace` is module-cached; it invalidates only via `closeDb()`/`_resetNamespaceCache()`. Stale-namespace risk if a uid change doesn't call `closeDb()` → [08.047].

### [08.045] Zustand `persist` (localStorage) is NOT per-UID — shared-device leak risk
- **Check:** The eight `wv2-*` Zustand stores persist to localStorage under FIXED keys (not uid-suffixed), unlike the per-UID IndexedDB. On a shared device, user B sees user A's `wv2-*` data until a reset/owner-check fires.
- **Where:** all stores `name: 'wv2-*'` (no uid suffix) vs `src/storage/db.js` per-UID DBs + `data-owner-uid` marker in `dataRegistry.js:45`.
- **Expected:** A `data-owner-uid` enforcement (`util/dataReset.js enforceDataOwner`) wipes Tier-0 + `wv2-*` when a DIFFERENT uid logs in on the same device. Verify it covers the `wv2-*` stores, not just flat keys.
- **Verify:** Seed user A's `wv2-progres-store`, log in as user B (different uid) → confirm `enforceDataOwner` clears the `wv2-*` stores (not just `logs`). If it only clears flat keys, user B inherits A's weight log → privacy + data-integrity FAIL.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-ref Section 12 (security) — shared-device data leakage. This is the single biggest namespacing asymmetry: IDB is isolated, localStorage is not.

### [08.046] Dexie schema v1→v2 migration is additive + idempotent
- **Check:** `_defineSchema` defines v1 stores + v2 additive `status` index on `migration_events`, with an idempotent backfill upgrade hook.
- **Where:** `src/storage/db.js:181-206` + `SCHEMA_VERSION=2` line 63.
- **Expected:** v2 only ADDS an index; the `.upgrade(tx=>...)` backfill checks `rec.status===undefined` before setting (re-run safe); a v1 user upgrades without data loss.
- **Verify:** Run `db.test.js` upgrade path. OR open a v1 DB, bump to v2 → existing `migration_events` records gain `status:'success'`, no records lost, index queryable.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** The CDL/LOGS/APPLIED_PATTERNS stores are unchanged v1→v2 (inherit). Confirm no destructive index removal.

### [08.047] Anonymous→auth IDB migration module EXISTS and is wired
- **Check:** `src/storage/migrateAnonymousToAuth.js` exists, performs atomic copy+verify+delete `andura_anonymous_<deviceId>` → `andura_<uid>`, and calls `closeDb()` after to invalidate the namespace cache.
- **Where:** Referenced by `src/storage/db.js` JSDoc lines 19-21, 108-113 (`§B021` cache-invalidation contract), 168-169.
- **Expected:** On signup-after-anonymous-training, the anonymous IDB data migrates to the uid DB; the cache is invalidated so subsequent writes hit the right DB.
- **Verify:** `ls src/storage/migrateAnonymousToAuth.js`. If MISSING → anonymous IDB training data is ORPHANED on signup (data loss). If present, confirm it calls `closeDb()`/`_resetNamespaceCache()` in a `finally` and verifies the copy before deleting the source.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL ☐ BLOCKED  *(as of 2026-05-29 — see Evidence; re-verify)*
- **Evidence:** `src/storage/` contains only `db.js`, `tieringEngine.js`, `__tests__/`. `migrateAnonymousToAuth.js` is referenced by `db.js` comments (lines 20, 112, 169) as the file that MUST call `closeDb()` post-migration, but the file does NOT exist on disk. → An anonymous user who trains then signs up keeps an orphaned `andura_anonymous_<deviceId>` IDB; the new `andura_<uid>` DB starts empty. Tier-1 archive (rotated logs/CDL) is lost across the signup boundary.
- **Notes:** Either implement the migration module (atomic copy+verify+delete, then `closeDb()`), or remove the dangling references and document that anonymous Tier-1 archive does not migrate. Note: Tier-0 localStorage flat keys + `wv2-*` stores are NOT uid-namespaced, so they survive signup in place — but Tier-1 IDB does not. Verify the real-world impact (most fresh-signup users have little Tier-1 archive yet, but a long anonymous trial would lose archived history).

### [08.048] `tier1Add` verifies the write (read-back) and throws on silent quota failure
- **Check:** `tier1Add` does `put` then `get(entry.id)` and throws if the read-back is empty — defending against silent IndexedDB quota failures.
- **Where:** `src/storage/db.js:246-253`.
- **Expected:** A write that silently no-ops (quota) raises `tier1Add verify failed` rather than pretending success.
- **Verify:** Run `db.test.js`. OR mock a `put` that doesn't persist → `tier1Add` rejects.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.049] `wipeUserDB` + `wipeAnonymousDBs` leave no IDB residue (GDPR Art. 17)
- **Check:** Account delete wipes `andura_<uid>` AND sweeps every `andura_anonymous_*` DB on the device.
- **Where:** `src/storage/db.js:322-371` (`wipeAnonymousDBs`, `wipeUserDB`).
- **Expected:** After `wipeUserDB(uid)`, neither the uid DB nor any anonymous-prefixed DB remains (enumerated via `indexedDB.databases()`); graceful no-op where the API is unavailable (older Safari).
- **Verify:** Run `wipeUserDB.test.js`. OR seed `andura_<uid>` + `andura_anonymous_x` → `wipeUserDB(uid)` → `indexedDB.databases()` shows neither.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** On Safari without `indexedDB.databases()`, anonymous DBs cannot be enumerated → residue survives. Document this as a known browser-limited GDPR edge; cross-ref Section 12.

---

## 08.E — Tier-2 Firebase sync (REST RTDB, ADR 002) + data-loss matrix

> Firebase backup is the difference between "lost my data on a cache clear" and
> "logged in on a new phone and it was all there." The audit must establish
> EXACTLY which data backs up and which does not.

### [08.050] Zustand `wv2-*` store data does NOT back up to Firebase (coverage gap)
- **Check:** Firebase `SYNC_KEYS` enumerate ONLY legacy flat Tier-0 keys (`weights`, `kcals`, `logs`, `readiness`, `pr-records`, `sf.userConfig`, ...). The `wv2-*` Zustand stores (onboarding, progres weightLog/bodyData/targetObiectiv, nutrition dailyLog, workout sessionsHistory/streak, settings, schedule, coach) are NOT in `SYNC_KEYS` and are never PATCHed to RTDB.
- **Where:** `src/firebase.js:80` (`SYNC_KEYS`), `229-266` (`syncToFirebase` iterates only `SYNC_KEYS`), `379-388` (`DB.set` override schedules sync only for `SYNC_KEYS`). No store calls `syncToFirebase`; `grep -rn "syncToFirebase\|wv2-" src/firebase.js`.
- **Expected:** If logged-in is supposed to mean "my data is backed up," the Zustand-store data must reach Firebase. Today it does not — only the flat per-set `logs` (written by `finishSession.persistSessionLogs`) + `weights`/`sf.userConfig` etc. back up.
- **Verify:** `grep -n "SYNC_KEYS" src/firebase.js` → list its members; diff against the eight `wv2-*` store names. Then: logged-in seeded account → trigger a sync → inspect the RTDB PATCH payload (network tab or `fbPatch` log) → confirm whether `wv2-progres-store.weightLog` / `wv2-workout-store.sessionsHistory` appear. They will NOT.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** `SYNC_KEYS` (firebase.js:80) = flat keys only; no `wv2-*` member, no store imports `syncToFirebase`. Workout per-set history reaches Firebase ONLY via the flat `logs` writeback ([08.026]); the rich `sessionsHistory`, the entire `progres` weight/body log, `nutrition` dailyLog, onboarding profile, settings, and schedule are localStorage-only.
- **Notes:** This is the central Tier-2 finding. Decide per data class: which `wv2-*` data is "must back up" (weightLog, sessionsHistory, onboarding profile, targetObiectiv) vs "device-local OK" (settings theme, schedule editMode). For must-back-up classes, either (a) add a store→Firebase sync, or (b) confirm the equivalent data already round-trips via a flat SYNC_KEY (e.g. `weights`/`logs`) and the Zustand store is a derived view. If neither, a logged-in user who reinstalls LOSES weight history + session detail → CRITICAL for a CRITICAL section.

### [08.051] Data-loss scenario matrix — skip-auth vs logged-in
- **Check:** Enumerate, for each persistence substrate, what survives each loss event. Build the matrix below and verify each cell against real behavior.
- **Where:** appStore `isSkipAuth` (skip-auth = local-only); `firebase.js` sync (logged-in); IDB per-UID.
- **Expected (the matrix to VERIFY, not assume):**

  | Event | Skip-auth (local-only) | Logged-in (Firebase keys) | Logged-in (`wv2-*` stores) |
  |---|---|---|---|
  | App reload / reopen | survives (localStorage+IDB) | survives | survives |
  | Browser cache clear / "clear site data" | **LOST (all tiers)** | restored from RTDB on next login (SYNC_KEYS only) | **LOST** ([08.050]) |
  | PWA uninstall + reinstall | **LOST** | restored (SYNC_KEYS only) | **LOST** |
  | New device, same login | n/a (no account) | restored (SYNC_KEYS only) | **LOST** |
  | localStorage quota exceeded | partial loss | partial loss (RTDB has prior) | **persist may silently fail** ([08.045]) |

- **Verify:** For each cell: (skip-auth) seed → clear site data → reopen → data gone. (logged-in flat keys) seed `logs`/`weights` → clear → re-login → restored via `syncFromFirebase`. (logged-in wv2) seed `weightLog` → clear → re-login → confirm whether `weightLog` returns (it will NOT per [08.050]).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** The "gym without losing data" answer is: skip-auth users have ZERO backup (clear-cache = total loss); logged-in users back up only the flat SYNC_KEYS, NOT the `wv2-*` stores. Confirm onboarding/UI honestly communicates the skip-auth no-backup risk (Maria-65 test-drive paradigm). Cross-ref Section 01.

### [08.052] `syncToFirebase` uses PATCH (preserves sibling nodes) + is suppressed during delete
- **Check:** `syncToFirebase` PATCHes only `SYNC_KEYS`+metadata (not a whole-tree PUT that would delete `fcmTokens`/`notificationPrefs`), and early-returns when `window._suppressFirebaseSync` is set.
- **Where:** `src/firebase.js:238-264` (suppress gate + `fbPatch`).
- **Expected:** PATCH merges; suppress flag neutralizes any armed 3s-debounced push during the delete/reset window (RE-S-01).
- **Verify:** Inspect `fbPatch` call (line 263) — method is PATCH. Set `_suppressFirebaseSync=true` → `syncToFirebase()` returns `false` without a network call (run `firebase-syncSuppress.test.js`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Run `firebase-fcmSiblingSurvival.test.js` to confirm PATCH does not delete FCM siblings.

### [08.053] `syncFromFirebase` merge — local-wins conflict + array-merge by `ts`
- **Check:** On restore, object keys merge with LOCAL winning conflicts (`Object.assign({}, remote, local)`); arrays merge by unique `ts`, sorted newest-first, capped 5000; scalars keep local.
- **Where:** `src/firebase.js:295-320`.
- **Expected:** A documented KNOWN LIMITATION: same-date edits on two devices → local always wins (no per-entry timestamp LWW). Confirm the merge doesn't drop remote-only entries.
- **Verify:** Run `firebase-*` tests. OR seed local `logs` + a disjoint remote `logs` → after merge both sets present, deduped by `ts`, ≤5000.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** The local-wins-on-conflict rule means a fresh reinstall (empty local) correctly pulls remote (`local==null → DB.set(remote)`, line 299), but a partially-populated local could shadow newer remote edits. Acceptable for single-device; flag for multi-device. Cross-ref tombstone filter (line 326) — deleted entries must not resurrect.

### [08.054] Sync is debounced (3s) + chunked (25) + timeout-bounded (15s)
- **Check:** `DB.set` schedules `syncToFirebase` on a 3s debounce; `bulkSync` chunks at 25 sequentially; `_fbFetch` aborts at 15s.
- **Where:** `src/firebase.js:384-387` (3s debounce), `130-173` (`SYNC_CHUNK_SIZE=25`, `bulkSync`), `111-118` (`FIREBASE_FETCH_TIMEOUT_MS=15000`).
- **Expected:** Rapid logging coalesces into one push; large backfills don't contend; a hung network can't block forever.
- **Verify:** Run `firebase-timeout.test.js`, `firebase-bulkSync.test.js`, `firebase-cache-coalesce.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** A workout finished and closed within the 3s debounce window before the push fires relies on `initFirebaseSync` (line 393-401) pushing merged state on next open. Confirm that catch-up push exists so a fast close doesn't drop the last session from backup.

### [08.055] `getUserPath` returns null when no auth + no fallback → sync skips cleanly
- **Check:** When there is no auth uid and no legacy fallback path, `getUserPath()` is null and both sync directions early-return `false` (no crash, no write to a wrong path).
- **Where:** `src/firebase.js:65-73` (`getUserPath`), `243-247` + `279-283` (null guards).
- **Expected:** Skip-auth user → `getUserPath()` null → `syncToFirebase`/`syncFromFirebase` no-op. No RTDB write under `users/daniel` legacy path for a real anonymous user.
- **Verify:** Run `firebase-userpath.test.js`. OR clear auth → `getUserPath()` null → `syncToFirebase()` logs "no auth + no fallback, skipping", returns false.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `LEGACY_USER_PATH = 'users/daniel'` (line 40) — confirm this is NOT used as a live fallback for real users (would cross-write everyone into Daniel's node). Cross-ref Section 12.

### [08.056] `schemaVersion` tolerant read — older/newer remote docs don't corrupt
- **Check:** Absent `_schemaVersion` → treated as v1; remote newer than client → warn + merge known keys only (no crash).
- **Where:** `src/firebase.js:287-293` + `USER_DOC_SCHEMA_VERSION=1` line 76.
- **Expected:** Forward/backward compatible read.
- **Verify:** Run `firebase-schemaVersion.test.js`. OR seed remote with `_schemaVersion:99` → restore warns, merges SYNC_KEYS, no throw.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 08.F — Reload / persistence behavior (the machine bar)

> These are the behavior tests the HARNESS must pin (00-MASTER §13–17): the
> deterministic proof that data survives a reload. Each step is a full
> seed→act→reload→assert loop on a real rendered app (Playwright on a seeded
> account), with the equivalent Vitest behavior test named as the machine bar.

### [08.057] Log a workout → reload → it is present in History
- **Check:** A finished workout appears in History after a full page reload.
- **Where:** `workoutStore.finishSession` → `sessionsHistory` (persisted) → History tab.
- **Expected:** The session is in History post-reload with correct title/sets/volume.
- **Verify:** Playwright seeded: complete a session → reload → History shows it. Vitest bar: `workoutStore.test.ts` finish→rehydrate asserts `sessionsHistory` persists.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-ref Section 04 (History) + Section 06 (workout flow).

### [08.058] Log weight → reload → weight + trend present on Progress
- **Check:** A logged weigh-in persists across reload and updates the trend.
- **Where:** `progresStore.addWeightEntry` → `weightLog` (persisted) → Progress tab.
- **Expected:** weightLog entry survives; bf%/BMR/trend reflect it post-reload.
- **Verify:** Playwright: log 82kg → reload → Progress shows 82kg + updated trend. Vitest bar: `progresStore.test.ts` add→rehydrate.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.059] Change a profile value → reload → persists AND propagates
- **Check:** Editing weight/height in Profile persists across reload and the change reaches BMR + bf% + protein target.
- **Where:** `SettingsProfile.handleSave` → onboardingStore + weightLog upsert.
- **Expected:** Post-reload the edited value is in the store AND every derived readout reflects it.
- **Verify:** Playwright: edit weight 80→70, Save → reload → Profile shows 70, BMRStrip + BodyFatStrip + protein target all use 70. Vitest bar pins the upsert.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** This is the regression test for the body-fat split-source class. Pin the back-dated-weigh-in variant from [08.031].

### [08.060] Log nutrition kcal → reload → present for the same day
- **Check:** A logged daily kcal/protein value persists across reload under the correct local date.
- **Where:** `nutritionStore.setDailyKcal` → `dailyLog` (persisted).
- **Expected:** Same-day entry survives reload; day-key is local-tz correct.
- **Verify:** Playwright: log 2400 kcal → reload → Nutrition shows 2400 today. Vitest bar: `nutritionStore` upsert + rehydrate.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.061] Edit weekly schedule → reload → days persist, edit-mode resets
- **Check:** Toggling training/rest days + saving persists `days`; reload returns the user OUT of edit mode.
- **Where:** `scheduleStore` `days` persisted, `editMode` not persisted.
- **Expected:** Days survive; `editMode` is `false` on reload.
- **Verify:** Playwright: edit a day, save → reload → day kept, edit mode off. Vitest bar: `scheduleStore.test.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.062] Streak survives reload + respects calendar-day boundary
- **Check:** `streak` + `lastStreakDate` persist; two sessions same day don't double-count; next-day +1; gap resets to 1 — across a reload.
- **Where:** `workoutStore` `nextStreak` 258-269 + persisted `streak`/`lastStreakDate`.
- **Expected:** Deterministic day-boundary behavior survives reload.
- **Verify:** Vitest bar: `workoutStore.test.ts` `nextStreak`/`incrementStreak` cases with injected `now`. Playwright: finish two sessions same day → streak unchanged across reload.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-ref Section 06 + the local-tz day-key dependency [08.043].

### [08.063] Mid-workout reload behavior is explicit (no half-live ghost session)
- **Check:** Reloading DURING an unpaused live session resolves to a clean state (idle/finished/paused), never a corrupt half-active session; in-progress sets that were not persisted are accounted for honestly.
- **Where:** `workoutStore.partialize` (excludes `sessionStart`/live `history`) + `getCurrentMode` 341-360.
- **Expected:** On reload mid-session, `getCurrentMode` returns a defined mode; if live sets are dropped, the UI does not falsely claim they are saved.
- **Verify:** Playwright: start session, log 2 sets, reload WITHOUT pausing → confirm the app state (does it offer resume? lose the sets silently? show idle?). Document the actual behavior.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Gym-critical: a phone that backgrounds + reloads mid-set must not lose logged sets without telling the user. If sets vanish silently → FAIL. Cross-ref [08.024] + Section 06.

---

## 08.G — GDPR data export / delete completeness (Art. 17 + 20, both tiers)

### [08.064] Export includes ALL `wv2-*` store data (Art. 20 portability)
- **Check:** `SettingsExport` aggregates the five exported Zustand stores' full state + every `wv2-*` localStorage key.
- **Where:** `src/react/routes/screens/cont/SettingsExport.tsx:89-104` (`buildExportPayload`), `52-72` (`collectTier0Keys` scans `wv2-*`).
- **Expected:** Export `stores` object includes onboarding/workout/nutrition/settings/schedule getState(); `tier0Keys` includes every `wv2-*` key.
- **Verify:** On a seeded account, trigger export → open the JSON → confirm `stores.workout.sessionsHistory`, `stores.onboarding.data`, and `tier0Keys["wv2-progres-store"]` are all present + non-empty.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `coachStore` is NOT in the export `stores` object (only 5 of 8 stores listed, lines 95-99) — but `wv2-coach-store` IS captured by the `wv2-*` `collectTier0Keys` loop. Confirm `appStore` (`wv2-app-store`) is also captured by the loop. Net: all 8 stores should appear in `tier0Keys` even though only 5 appear in `stores`.

### [08.065] Export includes unprefixed legacy data keys (Art. 20 — the S-02 fix)
- **Check:** Export pulls the canonical unprefixed flat keys (`logs`, `weights`, `coach-decisions`, `pr-records`, `pain-cdl`, `cdl-patterns`, ...) — not just `wv2-*`.
- **Where:** `SettingsExport.tsx:26-30` (`LEGACY_DATA_KEYS = USER_DATA_KEYS + CDL_KEYS + 'pain-cdl'`) consumed at lines 64-67.
- **Expected:** Every registry user-data + CDL key present in localStorage is included; auth keys (`firebase-*`) intentionally EXCLUDED (S-04).
- **Verify:** Seed flat `logs` + `coach-decisions` + `pain-cdl` → export → confirm all three appear in `tier0Keys`; confirm NO `firebase-*` token leaks into the export.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Re-run [08.041] — any flat key written but absent from `LEGACY_DATA_KEYS` is silently un-exported = Art. 20 gap. `pain-cdl` was the prior leak; hunt for others.

### [08.066] Export includes Tier-1 IDB archive (Art. 20 — §28-M4)
- **Check:** Export pulls the Tier-1 IndexedDB stores (CDL/logs/applied_patterns archived sessions >90 days).
- **Where:** `SettingsExport.tsx:74-87` (`collectTier1` via `tier1All`).
- **Expected:** `payload.tier1.{cdl,logs,appliedPatterns}` populated when IDB has data; empty arrays (graceful) when unavailable.
- **Verify:** Seed Tier-1 (`tier1Bulk(LOGS_TIER1, [...])`) → export → `payload.tier1.logs` contains them.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Without this, archived old sessions (rotated out of Tier-0 per [08.040]) would be un-exportable. Confirm the rotation+export pair covers the FULL history a user expects.
- **Notes (gap):** Export does NOT pull from Firebase RTDB — it is purely local (`ZERO server upload`, lines 3-4). For a logged-in user whose ONLY copy of some data is in RTDB (none today, since RTDB is a backup of local), this is fine; confirm the export is a complete superset of what RTDB holds.

### [08.067] Account delete erases Tier-0 (localStorage.clear) + Tier-1 (IDB) + Tier-2 (RTDB)
- **Check:** `DeleteAccountConfirm` wipes ALL three tiers: `localStorage.clear()`, `wipeUserDB(uid)`, and an awaited RTDB `DELETE users/<uid>`.
- **Where:** `src/react/routes/screens/cont/DeleteAccountConfirm.tsx:26-117`.
- **Expected:** Tier-0 fully cleared (not just `wv2-*` — the S-01 fix uses `localStorage.clear()`), Tier-1 wiped (`wipeRemoteData→wipeUserDB`), Tier-2 RTDB DELETE issued BEFORE token clear (RE-S-01), with an 8s timeout fallback.
- **Verify:** Seed all three tiers on a logged-in account → "Sterge contul definitiv" → confirm localStorage empty, IDB DBs deleted, RTDB `users/<uid>` gone (or DELETE issued within 8s). Run `DeleteAccountConfirm.test.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Verify ORDER: `wipeRemoteData` (uses still-valid token) is AWAITED before `authSignOut()` clears tokens (lines 105-114) — the RE-S-01 fix. If the order regresses, the cloud DELETE fires with a null token and the backup survives → data-resurrection on next login = CRITICAL GDPR FAIL.

### [08.068] Delete sets the sync-suppression window so a stale push can't resurrect the account
- **Check:** Delete sets `window._suppressFirebaseSync=true` up-front AND persists `__suppressFirebaseSyncUntil` AFTER `localStorage.clear()`, so neither an armed 3s push nor the next boot's `syncFromFirebase` recreates `users/<uid>`.
- **Where:** `DeleteAccountConfirm.tsx:105` (flag) + `47` (post-clear `__suppressFirebaseSyncUntil`); enforced at `firebase.js:238-241` + `269-277`.
- **Expected:** No `syncToFirebase` push during the wipe window; next boot's restore short-circuits for 10s.
- **Verify:** Run the delete flow with a network spy → no PATCH to `users/<uid>` after delete; `localStorage['__suppressFirebaseSyncUntil']` is a future timestamp post-clear.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-ref [08.052] + Section 12. This closes RE-S-01/RE-S-02 data-resurrection.

### [08.069] Delete requires fresh re-auth (Art. 17 destructive-action gate)
- **Check:** `DeleteAccountConfirm` requires `isAuthFresh()`; stale auth redirects to re-auth before any wipe.
- **Where:** `DeleteAccountConfirm.tsx:80-86` (`isAuthFresh` gate → `/auth?reason=reauth_required_for_delete`).
- **Expected:** A user with a stale session cannot one-tap-delete; must re-authenticate.
- **Verify:** Force `isAuthFresh()` false → tap delete → redirected to auth, NO wipe occurred (data intact). Run `DeleteAccountConfirm.test.tsx` freshness case.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [08.070] Delete copy matches reality (no false "30-day grace" promise)
- **Check:** Danger-screen delete sub-text does NOT promise a 30-day recovery grace; the React flow is immediate hard wipe.
- **Where:** `SettingsDanger.tsx:80-84` (U-06 fix removed the false promise) + `DeleteAccountConfirm` immediate wipe.
- **Expected:** Copy = immediate irreversible deletion; no grace-period claim anywhere.
- **Verify:** `grep -rniE "30 zile|grace|recuper" src/i18n/ro.json src/react/routes/screens/cont/` → no delete-recovery-grace string. Confirm `settings.danger.deleteRowSub` matches immediate-deletion reality.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** A grace-period promise the code doesn't honor is a Gigel-trust + legal hazard. Cross-ref Section 12 + Section 15.

### [08.071] Reset-data (keep account) wipes training data but preserves device + theme
- **Check:** The "reset data" flow (distinct from delete) clears training/nutrition/session data but keeps `device-id`/`active-theme` and the account itself.
- **Where:** `ResetDataConfirm` (drill-down from `SettingsDanger.tsx:60`) + `PRESERVE_ON_RESET_KEYS` (dataRegistry:45) + store `reset()`/`resetStreak()`.
- **Expected:** Post-reset: weightLog/sessionsHistory/dailyLog empty, settings theme kept, still logged in.
- **Verify:** Seed → reset-data → confirm training stores empty, `wv2-settings-store` theme intact, auth intact, `device-id` survives.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Confirm reset-data clears BOTH the `wv2-*` stores (via store `.reset()`) AND the flat Tier-0 training keys (via `fullReset`/`dataCleanup`), so no orphan flat `logs` survive a "reset" that the UI claims was complete.

---

## 08.H — Section gate

- **Gate:** 98% (CRITICAL). Beta-ready requires this section ≥98% AND zero open
  FAIL — a single confirmed data-loss or split-source FAIL blocks Beta.
- **Pre-filled FAIL/PARTIAL to resolve before the gate can pass:**
  - **[08.031]** PARTIAL — BodyFatStrip reads `weightLog[length-1]` positionally vs canonical `getCurrentWeightKg` (max-by-date); diverges on a back-dated weigh-in. Unify to one current-weight source.
  - **[08.047]** FAIL — `migrateAnonymousToAuth.js` referenced but absent; anonymous Tier-1 IDB archive orphaned on signup. Implement or remove + document.
  - **[08.050]** likely FAIL — `wv2-*` Zustand store data (weightLog, sessionsHistory, onboarding profile, targetObiectiv, nutrition) does NOT back up to Firebase; only flat SYNC_KEYS do. Decide per data class; a logged-in reinstall currently loses weight history + rich session detail.
  - **[08.038]** likely FAIL/PARTIAL — manual bf% override (`bfOverride`) discarded on Save; orphan `bf-override` Tier-0 key still in SYNC_KEYS.
- **Open judgment items for the auditor:** [08.020] uncapped weightLog, [08.025]+[08.040] sessionsHistory cap vs Tier-1 archive (history-loss check), [08.045] localStorage not per-UID (shared-device leak), [08.063] mid-workout reload set-loss.
