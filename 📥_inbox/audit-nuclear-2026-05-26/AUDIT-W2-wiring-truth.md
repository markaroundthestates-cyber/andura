# AUDIT-W2 — Wiring Truth (Contradiction Resolution: A3 vs A5)

**Mandate:** Resolve the contradiction between AUDIT-3 ("BN/TDEE brain is input-starved, always baseline 2640") and AUDIT-5 ("engines read live history and adapt, 92-94%, can deliver"). READ-ONLY, end-to-end line-by-line trace.
**Date:** 2026-05-26 · **Baseline:** main HEAD working tree
**Method:** Traced every caller, every engine entry contract, every UI consumer. No recall — every claim is `path:line` verbatim.

---

## VERDICT IN ONE LINE

**AUDIT-3 is CORRECT. AUDIT-5 is WRONG on the nutrition claim.** The workout brain genuinely adapts to live user state; the Bayesian/Kalman TDEE brain is structurally present but functionally dormant in the shipped UI — it returns the hardcoded baseline 2640 kcal on every call because no caller and no pipeline path ever feeds it `meta.observations`. A5's headline "92-94% / engines read live history and adapt" is TRUE for workout and FALSE for nutrition; A5's specific claim that the Kalman "adaptive TDEE NU 2000 hardcoded" is "REAL" (A5 §2 table row #4, line 62) is refuted by code.

---

## (1) WORKOUT PATH — VERDICT: GENUINELY CABLED (A3 confirmed, A5 confirmed)

**Live UI screen → function → engine, traced:**

1. `Antrenor.tsx:126` — the live Coach tab calls `getCoachToday()` in a mount effect (the shipped consumer).
2. `engineWrappers.ts:488 getTodayWorkout` → `:490 composePlannedWorkoutToday()` → `:492 applyMmiCapToWorkout()`.
3. `scheduleAdapterAggregate.ts:539 buildUserStateForPipeline()` → `:540 getDailyWorkout(userState, now)`.
4. `engine/schedule/scheduleAdapter.js:421 getDailyWorkout` → `:454 runPipeline(ctx, adapters)` with the real **8-adapter** array (`:441-450`: periodization, goalAdaptation, energyAdjustment, bayesianNutrition, tempo, specialization, warmup, deload) → `:482 buildSession(...)`.

**Does the pipeline receive REAL user state?** YES. `buildUserStateForPipeline` (`scheduleAdapterAggregate.ts:373-470`) assembles, from honest persisted sources:

- `user.{age,sex,goal,frequency,experience,weight,height}` ← `useOnboardingStore.getState().data` (`:381,442-449`)
- `user.bfPct` ← Deurenberg fraction estimate (`:420`, divided to fraction — the "raw percent false-positives every user" trap is explicitly avoided, `:418-419`)
- `user.trainingWeeks` ← earliest-session anchor (`:428-431`)
- `profileTier` ← `tierForExperience(...)` (`:439`)
- `meta.persona` ← canonical `resolvePersonaId(age)` (`:436-438`)
- `meta.goalPhase` ← `goalPhaseForGoal(goal)`, correctly OMITTED for auto/null (`:440,467`)
- `meta.painButtonActive / painAffectedGroups` ← live Pain CDL `DB.get(PAIN_CDL_KEY)` + 42-day lookback (`:389,462-463`)
- `recentSessions[*].rir / injury / energyDirection / weekIdx / daysAgo` ← real `sessionsHistory` reversed newest-first + overlay (`:400-417`)
- DP weight: `toPlannedExercise` uses `DP.recommend(name)` with history, `suggestStartWeight(name, experienceEn)` cold-start, RO→EN experience map (`:507-518`)

**Verdict:** A3's "genuinely cabled / Bugatti-grade" workout claim is VERIFIED. A5's claim that workout engines "read live history and adapt weights" is VERIFIED. The workout half of the brand promise holds.

---

## (2) NUTRITION / TDEE PATH — VERDICT: INPUT-STARVED, ALWAYS BASELINE (A3 confirmed, A5 refuted) — THE KEY QUESTION

**Every caller of the BN path, traced (grep `getNutritionTargetTodayReal|getNutritionTargetsToday`, non-test):**

| Caller | Line | Passes userState? |
|--------|------|:---:|
| `NutritionInline.tsx` | `:66` `getNutritionTargetTodayReal(dateISO)` | **NO** |
| `Progres/TDEEStrip.tsx` | `:91` `getNutritionTargetTodayReal(todayIso())` | **NO** |

These are the ONLY two non-test consumers. Neither passes the optional 2nd arg.

**The forwarding chain:**
- `bayesianNutritionAggregate.ts:37` `getNutritionTargetTodayReal(dateISO, userState?)` → `:53 getNutritionTargetsToday(userState)` (forwards `undefined`).
- `engineWrappers.ts:590 getNutritionTargetsToday(userState?)` → `:597 const ctx = (userState ?? {})` → `:598 await evaluateBN(ctx)` = `evaluateBN({})`.

**What `evaluateBN({})` returns — the decisive engine contract:**
- `bayesianNutrition/index.js:270` `meta.observations` → `[]` → `:280 obsCount = 0`. Posterior never updates off prior (`:283` guard false).
- `:445-447`:
  ```js
  const tierResult = (obsCount === 0 && !Number.isFinite(meta.demographicMu))
    ? 'none'
    : 'MED';
  ```
  With `ctx={}`: `obsCount===0` AND `meta.demographicMu` undefined → **`tier: 'none'`**.
- Back at `engineWrappers.ts:599`: `if (!result || result.tier === 'none') ... return BASELINE_NUTRITION;`
- `BASELINE_NUTRITION.kcalTarget = 2640` (`engineWrappers.ts:522-523`, "mockup verbatim L1812").

**So every call to the nutrition UI returns hardcoded 2640 kcal.** The only things that move the displayed target are (a) a manual log (aggregate priority 1, `bayesianNutritionAggregate.ts:42-50`) or (b) the B001 phase override (`engineWrappers.ts:565-588`, derived from `BASELINE_NUTRITION.kcalTarget * multiplier` — itself baseline-derived, not Kalman-derived).

**Does an observations-builder exist anywhere?** NO. Grep `observations` across `src/react/**` returns only a comment (`engineWrappers.ts:615`) and a test fixture. Nothing constructs an `observations[]` from `nutritionStore.dailyLog` or `progresStore.weightLog`. A3's M-2 is confirmed verbatim.

**Does the BN engine EVER receive real observations in ANY UI flow — including via the workout pipeline?** NO. The workout pipeline DOES invoke `bayesianNutritionAdapter` (`scheduleAdapter.js:445`), and that adapter calls the real engine (`bayesianNutritionAdapter.js:144 evaluateBayesianNutrition(adaptedCtx)`). But `adaptedCtx` = `{...ctx, meta:{...ctx.meta, periodizationConstraint}}` (`:136-142`), and `ctx` derives from `buildUserStateForPipeline()` whose `meta` block sets ONLY `painButtonActive/painAffectedGroups/persona/goalPhase` (`scheduleAdapterAggregate.ts:459-468`) — NO `observations`, NO `demographicMu`. And even if it did, the pipeline's `getDailyWorkout` return (`scheduleAdapter.js:484-495`) only surfaces warmup/deload/specialization/exercises — the BN `posterior.mu` is computed and then **discarded**. It never reaches the kcal UI.

**Verdict:** A3's H-1 + M-2 are CORRECT and exact. A5 §2 row #4 (line 62: "Kalman FLIP-ON... brand-promise adaptive TDEE NU 2000 hardcoded REAL") and A5 §4 (line 160: "getNutritionTargetsToday reads posterior") are MISLEADING — the wrapper *can* read posterior, but in the shipped call sites it never gets a posterior worth reading because the ctx is empty → tier 'none' → baseline. A5 verified the code *exists* but did not trace the *call sites*; A3 traced the call sites. A3 wins.

---

## (3) PER-ENGINE: ADAPTS-LIVE vs DORMANT

| # | Engine | Adapts to live user in shipped UI? | Evidence |
|---|--------|:---:|----------|
| 1 | Periodization | **LIVE** | runs in `runPipeline`, output (`volume_target_pct`) consumed via blueprints; fed real `recentSessions/weekIdx` |
| 2 | Goal Adaptation | **LIVE** | runs in pipeline; reads `recentSessions[*].injury/daysAgo` + `goalPhase` from real state |
| 3 | Energy Adjustment | **LIVE** | runs in pipeline; reads `energyDirection` overlay (from persisted `energyEmoji`) |
| 4 | **Bayesian Nutrition (Kalman TDEE)** | **DORMANT** | invoked with empty ctx → `tier:'none'` → baseline 2640 (`index.js:445`, `engineWrappers.ts:599`). NEVER receives `observations`. **This is the brand-promise engine.** |
| 5 | Tempo / Form Cues | **LIVE** | pipeline slot 5; surfaced via getWhyExerciseSummary |
| 6 | Specialization | **LIVE** | pipeline slot 6; `target_muscle_group` → `buildSession` weakGroups (`scheduleAdapter.js:476-479`); Gate inputs (persona/tier/pain) fed real |
| 7 | Warm-up | **LIVE** | pipeline slot 7; `warmup` blueprint surfaced in WorkoutPreview (`scheduleAdapterAggregate.ts:562-567`) |
| 8 | Deload | **LIVE** | pipeline slot 8; `intensity_modifier` → `intensityMod` UI (`scheduleAdapterAggregate.ts:554-578`) |
| 9 | MMI #9 | **LIVE (silent)** | `applyMmiCapToWorkout` (`engineWrappers.ts:492`) caps returning-user weights; effect active, UI reveal deferred (D059 open) — A5's "silent" call is fair |

Auxiliary engines (readiness, fatigue, PR, adherence, streak, muscle recovery, weakness, coach director) — all read real `sessionsHistory`/`DB` directly; **LIVE** (A3 §103 confirms, spot-checked consistent).

**One engine out of nine is dormant — and it is the flagship "adaptive TDEE Kalman" engine #4.**

---

## (4) COMPOSITION-PATH CANONICAL DECLARATION (A5's "two paths")

A5 flagged "two engine-composition paths coexist" (A5 line 82, line 189). Identified:

- **Path A — orchestrator `runPipeline` (8 adapters) via `scheduleAdapter.getDailyWorkout`.** This is the WORKOUT path. CANONICAL for the planned-workout output. Live, real-state-fed, shipped (`Antrenor.tsx:126` → `getTodayWorkout`).
- **Path B — direct pure-engine calls in React `engineWrappers`/`coachDirectorAggregate` (Option B Bugatti, `engineWrappers.ts:688`).** Used for the auxiliary surfaces (patterns banner, adherence, readiness, fatigue, PR, nutrition wrapper). This deliberately bypasses `CoachDirector.buildSession` to avoid its side-effects (CDL write/Sentry/auto-backup) per the inline rationale (`engineWrappers.ts:688-691`, `coachDirectorAggregate.ts:4`).

**Neither path is dead** — they serve different surfaces and are both wired+tested. This is a documented design split, not divergence. **BUT note:** the BN engine is reachable through BOTH paths (Path A adapter slot 4, Path B nutrition wrapper) and is starved in BOTH — Path A discards its kcal output, Path B feeds it an empty ctx. The dormancy is not a path-selection bug; it is a missing observations-builder regardless of path.

Also worth flagging (latent, not active): A3's M-1 — `buildUserStateForPipeline` hardcodes `Date.now()` internally (`scheduleAdapterAggregate.ts:383`) while `composePlannedWorkoutToday(now=new Date())` accepts an injected clock (`:536,540`). Confirmed. Production-safe (default), test-injectability seam only.

---

## (5) BLUNT STATEMENT — DOES THE BRAND PROMISE HOLD?

**PARTIALLY.** "A coach that thinks for you" holds for the **workout half** and is genuinely impressive — periodization, deload, specialization, MMI re-resume cap, DP weight progression, readiness, fatigue all adapt to the user's real logged history, persona, tier, pain, and energy. That half is Bugatti-grade and shipped.

**The nutrition half is dead.** The headline "adaptive TDEE Kalman filter, NU 2000 kcal hardcoded" (PRIMER §2 engine #4) does NOT hold in the shipped UI. Every user — Gigel, Marius, Maria — sees **2640 kcal** until they manually log, and the engine never learns from their weight log or calorie log because nothing builds the `observations[]` it consumes. The Kalman filter, conjugate prior update, tier-based slope, kcal-floor-1200 filter — all implemented and tested — run on an empty input every single time. It is a working engine with the input pipe disconnected: "vizor fără ușă," exactly the pattern the cycle-4 keystone closed for workout but never closed for nutrition.

**What it takes to activate it** (scope, concrete):
1. Build an observations-builder in `src/react/lib` (does not exist) that maps `nutritionStore.dailyLog` (logged kcal) + `progresStore.weightLog` (weight deltas) into the `{weightDelta, adherenceRate, reportedEnergyMood, timestampMs}[]` shape the engine reads (`bayesianNutrition/index.js:270,277`).
2. Build a `BayesianNutritionContext` (user demographics for `demographicMu/demographicSigma` so tier escapes 'none'; `profileTier`; the observations array).
3. Pass it from the two consumers: `NutritionInline.tsx:66` and `TDEEStrip.tsx:91` (and thread through `getNutritionTargetTodayReal` → `getNutritionTargetsToday`, which already accept it — the plumbing past the call site is done).

Until then, the "thinking" nutrition coach is, by code, a static number. A3 stated this exactly; A5's 92-94% over-counts because it scored "engine implemented + wrapper wired" without tracing that the wrapper is called with `{}`.

**Net for the CEO:** the structural moat is ~half-built-live. Workout brain: real. Nutrition brain: a connected battery with no wire to the sensor. One focused task (the observations-builder + ctx, ~one slice) flips engine #4 from dormant to live and makes the brand promise whole.
