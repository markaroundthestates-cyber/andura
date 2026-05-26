# AUDIT-3 — React State + Engine→UI Wiring (Nuclear, line-by-line)

**Auditor slice:** Zustand stores + hooks + lib (engine↔UI glue) + keystone `buildUserStateForPipeline` + scheduleStore time-bomb.
**Date:** 2026-05-26 · **Mode:** READ-ONLY, exhaustive (every line read, not sampled).
**Baseline:** main HEAD per CHAT_STATE (`48c4a7ae` pushed; cycle-4 extreme-quality-ready).

---

## (1) Coverage — files read line by line

**Stores (8/8):**
- `src/react/stores/workoutStore.ts` (585 LOC) — full
- `src/react/stores/scheduleStore.ts` (165 LOC) — full
- `src/react/stores/onboardingStore.ts` (245 LOC) — full
- `src/react/stores/appStore.ts` (57 LOC) — full
- `src/react/stores/coachStore.ts` (56 LOC) — full
- `src/react/stores/nutritionStore.ts` (81 LOC) — full
- `src/react/stores/settingsStore.ts` (106 LOC) — full
- `src/react/stores/progresStore.ts` (75 LOC) — full

**Hooks (1/1):** `src/react/hooks/useNetworkStatus.ts` — full

**lib/ (keystone + wiring + relevant):**
- `scheduleAdapterAggregate.ts` (587 LOC, **the keystone** `buildUserStateForPipeline`) — full
- `engineWrappers.ts` (1004 LOC, all 14 wrappers + MMI silent cap + BN + adherence) — full
- `coachDirectorAggregate.ts`, `bayesianNutritionAggregate.ts`, `prRecordsWriteback.ts`, `prHistoryAggregate.ts`, `engineSignalsAggregate.ts`, `aaFrictionDetect.ts`, `sessionRating.ts`, `useSessionsByDate.ts`, `dexieMigration.ts`, `reactBoot.ts`, `themeSync.ts`, `coachVoice.ts`, `navigation.ts`, `toast.ts`, `storageEstimate.ts`, `exerciseDisplay.ts` (header) — full/relevant
- `format.ts`, `pluralRo.ts`, `webviewDetect.ts` — skimmed (pure formatters, no state/wiring)

**Glue consumers cross-read for wiring proof:**
- `routes/screens/antrenor/EnergyCheck.tsx` (saveReadiness wire) — full
- `routes/screens/antrenor/PostRpe.tsx` (finishSession + energyEmoji wire) — relevant range
- `routes/screens/antrenor/Workout.tsx` (intensityMod application, aaFriction, mount FSM) — relevant range
- `routes/screens/antrenor/Antrenor.tsx` (getCoachToday async effect) — relevant range
- `components/Calendar7Day.tsx` (Monday auto-reset effect) — relevant range
- `components/NutritionInline.tsx` + `components/Progres/TDEEStrip.tsx` (BN consumer call sites) — relevant range
- Engine cross-reads: `engine/bayesianNutrition/index.js` + `priorPosterior.js` (verify ctx contract), `engine/readiness.js` (saveReadiness)
- `__tests__/stores/scheduleStore.test.ts` — full

---

## (2) Findings

### CRITICAL
**None.** No data-loss, no engine-killer, no hydration corruption found in this slice.

### HIGH

**H-1 — Bayesian/adaptive-TDEE brain NOT fed real user state via the UI path (`engineWrappers.ts:590` + `bayesianNutritionAggregate.ts:53` + `NutritionInline.tsx:66` + `Progres/TDEEStrip.tsx:91`).**
The keystone fix (cycle-4) cabled the **workout** pipeline (`buildUserStateForPipeline`) correctly. The **nutrition** brain is a separate, still-uncabled path:
- `getNutritionTargetsToday(userState?)` accepts an optional `BayesianNutritionContext`, but **both** real consumers call `getNutritionTargetTodayReal(dateISO)` with **no** userState. That forwards `undefined` → `getNutritionTargetsToday()` → `evaluateBN({})`.
- The BN engine reads its observations from `ctx.meta.observations`, the demographic prior from `ctx.meta.demographicMu/demographicSigma`, and tier from `ctx.profileTier` (`bayesianNutrition/index.js:216,228,234,270`; `priorPosterior.js:31` defaults to T0 on empty). With `ctx={}` → zero observations, no prior source, tier resolves T0/low confidence → wrapper falls to `BASELINE_NUTRITION` (2640 kcal / 180g) every time.
- Net: the **only** thing that moves the displayed kcal target is (a) a manual log, or (b) the B001 phase-override (`getPhaseOverrideKcalToday`). The advertised "adaptive TDEE Kalman filter (NU 2000 kcal hardcoded)" (PRIMER §2 engine #4 brand-promise) does **not** receive logged weight/intake observations through the React UI. It is wired *structurally* (the wrapper, floor-1200, confidence map all work) but **starved of input** — exactly the "vizor fără ușă" pattern the cycle-4 keystone was meant to close, but only the workout half was closed.
- Note: the workout pipeline's `composePlannedWorkoutToday` also does NOT pass `meta.observations`, but that's acceptable there because the workout side only consumes periodization/deload output, not the BN kcal estimate. The kcal estimate is surfaced ONLY through the nutrition consumers above — which pass `{}`.

This is the single biggest honest gap in the "engine→UI complete" claim. Verify against CHAT_STATE/HANDOVER cycle-4: the keystone proof ("istoric→55kg, cold-start→30/21kg") is all **DP weight progression** (workout), never a Bayesian-TDEE-adapts-from-weight-log proof. The nutrition brain claim is unproven and, by code, inactive.

### MEDIUM

**M-1 — `composePlannedWorkoutToday` reads `Date.now()` directly while accepting an injectable `now: Date` (`scheduleAdapterAggregate.ts:383` vs `:537`).**
`buildUserStateForPipeline()` hard-codes `const now = Date.now()` internally, but `composePlannedWorkoutToday(now = new Date())` takes an injectable clock and passes it to `getDailyWorkout(userState, now)`. So the daysAgo/weekIdx/injury-window math inside the userState uses wall-clock `Date.now()`, while the pipeline's day-selection uses the injected `now`. In tests that inject a `now` these two diverge. Not a production flake (prod passes default), but it's an injectability seam that defeats deterministic testing of the recentSessions overlay and could mask a real off-by-one near midnight. Recommend threading `now` into `buildUserStateForPipeline(now)`.

**M-2 — BN/workout pipeline never passes `meta.observations`, so even if H-1 were wired, the Kalman would still see no intake data.**
Tracing the BN ctx contract, `meta.observations` is the field the Kalman update consumes (`bayesianNutrition/index.js:270`). Nothing in `src/react/**` ever constructs an `observations[]` array (grep: zero matches for `observations:` / `meta.observations` in React). Closing H-1 requires building observations from `nutritionStore.dailyLog` + `progresStore.weightLog` — that builder does not exist. Flagging so H-1's fix isn't scoped as "just pass userState".

### LOW

**L-1 — `progresStore.addBodyDataEntry` appends without dedup-by-date while `addWeightEntry` upserts (`progresStore.ts:56`).** Inconsistent: two body-measurement saves same day create two rows; weight saves overwrite. Minor data-hygiene asymmetry; comment U-10 only covers weight.

**L-2 — `nutritionStore.dailyLog` has no rolling cap (`nutritionStore.ts:61`).** `sessionsHistory` got `SESSIONS_HISTORY_MAX=500` and logs got `LOGS_MAX=5000`, but the daily nutrition log grows unbounded (1 entry/day = ~365/yr, low risk, but inconsistent with the quota-protection rationale applied elsewhere).

**L-3 — `getPhaseOverrideKcalToday` reads raw `localStorage` keys `phase-override`/`phase-log` directly (`engineWrappers.ts:567,575`) instead of through `DB`/a store.** Bypasses the per-UID `DB` namespace that the rest of the engine I/O uses; a multi-account switch on the same device could read another user's phase override. Low likelihood (phase override is niche) but it's an un-namespaced state read.

### NIT

**N-1 — `scheduleStore.ts:2` header comment says "State auto-resets next Monday (ephemeral...)" but the store itself does NOT self-reset.** The reset lives in `Calendar7Day.tsx:41-46` (effect comparing `weekStartIso()` vs stored `weekStartISO`). The store is passive. Comment is misleading about *where* the behavior lives — it only fires if `Calendar7Day` mounts. If a future surface consumes schedule without mounting Calendar7Day, the stale week never resets. (See Daniel-Q time-bomb note.)

**N-2 — `coachStore.schedContext` defaults hardcoded `'workout'` with a stale comment "In prod _schedContext va veni din coachDirector.buildSession()" (`coachStore.ts:4,33`).** Antrenor now derives rest/training from `getCoachToday().isRestDay` (`Antrenor.tsx:147` prefers engine), so `coachStore.schedContext` is a vestigial fallback. Not wrong, but the comment implies an unfulfilled wire.

**N-3 — `appStore.persona` default `'gigica'` vs type `'maria'|'gigica'|'marius'`; `resolvePersonaId` in the pipeline derives persona from age independently.** Two persona sources (appStore/coachStore UI persona vs engine-derived persona in `buildUserStateForPipeline:436`). They don't conflict (engine ignores the store persona) but it's two parallel notions of "persona".

---

## (3) Daniel questions — answered explicitly

**Q: Is the engine→UI wiring complete and proven, or are there fields the UI still fakes/defaults?**

**Mostly complete on the WORKOUT side — genuinely impressive and proven. INCOMPLETE on the NUTRITION/Bayesian side.**

WORKOUT keystone (`buildUserStateForPipeline`) — verified REAL, each field traced to an honest source:
- `user.{age,sex,goal,frequency,experience,weight,height}` ← `onboardingStore.data` ✓
- `user.bfPct` ← Deurenberg estimate, correctly divided by 100 to a **fraction** (the comment explicitly calls out the "raw percent false-positives every user" trap and avoids it) ✓
- `user.trainingWeeks` ← derived from earliest session ts ✓
- `profileTier` ← experience→T0/T1/T2 ✓
- `meta.persona` ← canonical `resolvePersonaId(age)` ✓
- `meta.goalPhase` ← goal→BULK/CUT/MAINTAIN, correctly **omitted** for 'auto'/null (engine auto-detects) ✓
- `meta.painButtonActive/painAffectedGroups` ← live Pain CDL (`DB('pain-cdl')`) with 42-day lookback + canonical region→group map ✓
- `recentSessions[*].rir` ← per-session mode rating→RIR ✓
- `recentSessions[*].injury` ← Pain CDL overlay ✓
- `recentSessions[*].energyDirection` ← persisted `energyEmoji` (UP/NONE/DOWN) ✓
- `recentSessions[*].weekIdx` ← session-timeline modulo-4 mesocycle ✓
- `recentSessions[*].daysAgo` ← pure from ts ✓

The per-set RPE chain is real: each set's coarse rating→RPE (`RATING_TO_RPE`, workoutStore:176) persisted to `DB('logs')` in `finishSession`→`persistSessionLogs`, consumed by dp/fatigue. The readiness chain is real: `EnergyCheck.handleSelect`→`saveReadiness(1..5)`→engine read-side; `intensityMod`→`sessionContext`→`PostRpe` maps to `energyEmoji` on the persisted session→builder `energyDirection`. The DP weight wiring is real (`toPlannedExercise` uses `DP.recommend` with history, `suggestStartWeight(name, experienceEn)` cold-start, RO→EN experience map prevents the silent x1.0 default). MMI silent cap, PR writeback, adherence, stagnation, lagging — all read real `sessionsHistory`/`DB`. **This half earns the cycle-4 "keystone landed" claim.**

NUTRITION side — **NOT proven, and by code inactive** (see H-1 + M-2). The adaptive TDEE displayed in NutritionInline/TDEEStrip is `BASELINE_NUTRITION` (2640) unless manually logged or phase-overridden. The Kalman never receives observations through the UI. If Daniel taps through nutrition expecting it to "learn" from his weight log, it will not.

**Defaulted/hardcoded fields still reaching UI:**
- Nutrition macros (protein 180 / fat 70 / carbs 280) are **intentionally** baseline V1 (engine emits only kcal) — documented, acceptable.
- Nutrition kcal target is **effectively** baseline (H-1) — NOT acceptable vs brand-promise, but it's a wiring gap not a lie in the data.
- `aaFrictionDetect` thresholds: Workout DOES feed `getEngineSignals()` vitality/adherence into `deriveThresholds` (Workout.tsx:379-384) ✓ — not faked.
- `coachStore.schedContext` 'workout' default is superseded by engine `isRestDay` in Antrenor ✓.

**Q: Any remaining time-bomb (date/timezone-dependent) logic?**

The scheduleStore time-bomb is **genuinely fixed** — but the fix lives in the *consumer*, not the store:
- `Calendar7Day.tsx:41-46` compares live `weekStartIso()` to stored `weekStartISO` on mount and calls `resetWeekly(currentMonday)` on mismatch. Anchored to the current week, not a hardcoded date. ✓
- `scheduleStore.test.ts:23-28` correctly uses `currentWeekDay()` relative to live `new Date()` rather than the old hardcoded `2026-05-18` for the engine round-trip (the hardcoded `MONDAY_2026_05_18` is only used as a deliberately-stale `resetStore` seed). ✓
- `weekStartIso` Monday math (`scheduleStore.ts:20`) uses local `getDay()`/`getDate()` — DST-safe, no UTC shift. ✓

Residual / watch items (none are active production flakes):
- **N-1**: the auto-reset only fires if `Calendar7Day` mounts. If any future surface reads schedule days without that component, a stale week persists. The store should arguably self-heal in a selector. Low risk today (Calendar7Day is the schedule surface).
- **M-1**: `buildUserStateForPipeline` uses `Date.now()` internally while `composePlannedWorkoutToday` accepts an injected clock — a midnight-boundary off-by-one is theoretically possible and is untestable deterministically. Worth threading `now`.
- Date keying elsewhere is correct and tz-consistent: `todTs`/`localKey`/`useSessionsByDate` all use local `getFullYear/Month/Date` (explicitly avoid `toISOString` UTC drift); `diffCalendarDays`/`nextStreak` parse ISO-day as UTC-midnight for DST-safe integer deltas. `isoWeekKey` (dexieMigration) uses the standard Thursday-anchored ISO algorithm. No flakes.
- `dexieMigration.isoWeekKey` (UTC) vs scheduleStore week (local Monday) use different week definitions, but they serve different purposes (Tier-2 archive aggregation vs UI calendar) and never cross-compare. Not a bug.

---

## (4) Readiness % for this slice

**Slice readiness: 84%.**

Justification:
- **State correctness: ~95%.** All 8 stores have explicit `partialize` (actions excluded, defense-in-depth), correct version/migrate on onboarding, runtime-only fields (sessionStart/sessionContext/editMode) kept out of persistence to avoid stale-edit ghosts, rolling caps on the high-growth slices, day-boundary streak logic correct, finishSession side-effect (log writeback) soft-fails without breaking the render contract. Hydration races handled (reactBoot idempotency guards keyed by UID, StrictMode-safe; async effects use `cancelled` flags + cleanup throughout). Only nits (L-1/L-2/L-3) here.
- **Workout engine→UI wiring: ~95%.** The keystone is real, honest, anti-fabrication-disciplined, and the per-field sourcing is Bugatti-grade. This is the strongest part of the slice.
- **Nutrition engine→UI wiring: ~40%.** Structurally present, input-starved (H-1+M-2). The "adaptive TDEE" brand promise is not delivered through the UI. This single gap is the main drag on the score — it's the kind of thing that reads as "complete" in a code skim but is inert at runtime.
- **Time-bombs: ~90%.** The known scheduleStore bomb is defused and anchored to the live week; residuals (N-1 consumer-coupling, M-1 clock-injection seam) are latent, not active.

The slice is **not** Beta-blocking on state mechanics, but H-1 should be a Daniel decision: either (a) wire the BN observations builder before Beta to honor the "adaptive TDEE" promise, or (b) consciously accept baseline-nutrition-V1 for Beta and adjust the brand framing. By code today it is (b) silently.
