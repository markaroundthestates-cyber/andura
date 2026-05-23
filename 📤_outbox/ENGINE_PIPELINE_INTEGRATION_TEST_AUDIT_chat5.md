---
title: ENGINE_PIPELINE_INTEGRATION_TEST_AUDIT_chat5
date: 2026-05-23
chat: 5
type: AUDIT_READ_ONLY
scope: Big 11 React wrappers + 8 orchestrator adapters + MMI Engine #9 — integration test coverage matrix + gaps
mode: Co-CTO read-only investigation
agent: Opus subagent (manager-spawned)
authority: D063 LOCKED V1 + D066 LOCKED V1 + D074 LOCKED V1 + D-LEGACY-098 LOCK 10
---

# Engine Pipeline Integration Test Audit — chat 5

## §1 Executive summary

| Layer | Count | Sentry anti-drift | Unit coverage | Integration coverage |
|---|---|---|---|---|
| Big 11 React wrappers (`engineWrappers.ts`) | 11 adapters / 13 exports | 11/11 (12 capture sites) | 7/7 specific witnesses | 1 real-wire (scheduleAdapterAggregate) |
| Orchestrator pipeline adapters (`src/coach/orchestrator/adapters/*`) | 8 adapters | 8/8 (per `assertAllOrchestratorAdaptersInstrumented.test.js`) | 8/8 parity tests | 4-7 full-chain integration scenarios concentrated in `deloadParity.test.js` |
| MMI Engine #9 (`muscleMemoryAdapter.js`) | 1 module | NOT applicable (silent path) | 220 LOC unit + 268 LOC index | 279 LOC silent-cap React wire test (`engineWrappers.mmi-silent-cap.test.ts`) |

**Verdict:** Coverage healthy on three pillars (per-engine unit, parity legacy↔orchestrated, Sentry anti-drift). Gaps cluster around (a) MMI pipeline integration cu real `getDailyWorkout` path (silent-cap tested in isolation, NOT cu pipeline output), (b) MMI Engine #9 NU joins 8-adapter pipeline chain so 8-chain integration test never exercises MMI compose order ADR-033 §32.1 "LOCK 10 LAST in chain" invariant, (c) React wrappers nu au explicit shape-check witnesses pentru engine output blueprints (drift catch deferred to runtime fallback). 3 HIGH / 4 MED / 4 LOW gaps identified.

## §2 Methodology

- **Filesystem inventory.** Glob `src/coach/orchestrator/adapters/*.js`, `src/react/lib/engineWrappers.ts`, `src/engine/muscleMemoryAdapter.js` + `src/engine/muscleMemoryIndex.js`.
- **Test discovery.** Glob `src/**/*.test.{js,ts,tsx}`, separate unit (`src/engine/**`) from parity (`src/coach/orchestrator/__tests__/*Parity*`) from anti-drift (`*adapters_instrumented*`) from real-wire React (`engineWrappers*.test.ts`, `scheduleAdapterAggregate.realwire.test.ts`).
- **Pipeline flow walk.** Read `src/engine/schedule/scheduleAdapter.js` §`getDailyWorkout` adapter sequence + `src/react/lib/scheduleAdapterAggregate.ts` aggregation contract + `src/react/lib/engineWrappers.ts` MMI compose order.
- **Cross-ref.** DECISIONS.md §D063 (lines 1269-1306) + §D066 (lines 1401-1440) + §D074 (lines 1799-1838).
- **Constraints.** READ-ONLY. No source/test edits. Single commit for the report file only.

## §3 Engine inventory

### §3.1 Orchestrator pipeline adapters (8 — Pipeline §42.10 sequential)

| # | Adapter | File | Engine domain |
|---|---|---|---|
| 1 | `periodizationAdapter` | `src/coach/orchestrator/adapters/periodizationAdapter.js` | Macrocycle/mesocycle/volume landmarks — `src/engine/periodization/*` |
| 2 | `goalAdaptationAdapter` | `src/coach/orchestrator/adapters/goalAdaptationAdapter.js` | Phase auto-detect + templates + training modifiers — `src/engine/goalAdaptation/*` |
| 3 | `energyAdjustmentAdapter` | `src/coach/orchestrator/adapters/energyAdjustmentAdapter.js` | Bidirectional adjustment + yoyo anti-flap — `src/engine/energyAdjustment/*` |
| 4 | `bayesianNutritionAdapter` | `src/coach/orchestrator/adapters/bayesianNutritionAdapter.js` | Kalman filter + posterior + observation filter — `src/engine/bayesianNutrition/*` |
| 5 | `tempoAdapter` | `src/coach/orchestrator/adapters/tempoAdapter.js` | Form cues + mind-muscle + tempo prescription — `src/engine/tempo/*` |
| 6 | `specializationAdapter` | `src/coach/orchestrator/adapters/specializationAdapter.js` | Weakness consumer + activation gating + cooldown — `src/engine/specialization/*` |
| 7 | `warmupAdapter` | `src/coach/orchestrator/adapters/warmupAdapter.js` | Hybrid warm-up routine — engine source path under `src/engine/warmup/*` per adapter §D2 doc |
| 8 | `deloadAdapter` | `src/coach/orchestrator/adapters/deloadAdapter.js` | Trigger hierarchy + depth + duration + partial scope — `src/engine/deload/*` |

`ORDERED_ADAPTERS` barrel at `src/coach/orchestrator/adapters/index.js` lines 52-61 freezes the sequence; `src/engine/schedule/scheduleAdapter.js` lines 441-450 hard-codes it again (NOT consuming the barrel — see §6 LOW gap).

### §3.2 React engine wrappers (11 logical adapters / 13 exports in `engineWrappers.ts`)

| # | Wrapper export | Lines (in file) | Underlying engine module |
|---|---|---|---|
| 1 | `getReadiness` | L164-184 | `src/engine/readiness.js` |
| 2 | `getFatigue` | L194-218 | `src/engine/fatigue.js` |
| 3 | `getPRDelta` | L243-271 | `src/engine/prEngine.js` |
| 4 | `getTodayWorkout` (async) | L443-455 | `scheduleAdapterAggregate.composePlannedWorkoutToday` → orchestrator runPipeline 8-chain |
| 5 | `getNutritionTargetsToday` (async) | L545-590 | `src/engine/bayesianNutrition/index.js` (`evaluate`) |
| 6 | `getAdherenceOutput` | L621-637 | `src/engine/adherence.js` |
| 7 | `getPatternsBanner` | L687-737 | `src/engine/stagnationDetector.js` + `src/engine/adherence.js` (2 catch sub-paths) |
| 8 | `getProactiveAlerts` | L770-786 | `src/engine/proactiveEngine.js` |
| 9 | `getCoachRestReason` | L810-833 | `src/engine/muscleRecovery.js` + readiness |
| 10 | `getLaggingSignal` | L854-871 | `src/engine/weaknessDetector.js` |
| 11 | `getCoachTodayQuote` | L908-935 | `src/engine/muscleRecovery.js` |
| (helper) | `applyMmiCapToWorkout` | L410-423 | `applyMuscleMemoryUpgrade` (MMI Engine #9) |
| (const) | `STAGNATION_WEEKS_THRESHOLD` | L672 | shared business rule |

Plus 2 private helpers excluded from D063 anti-drift scope by design: `buildSilentMmiContext` (L356-399) and `getPhaseOverrideKcalToday` (L520-543).

### §3.3 MMI Engine #9 (`muscleMemory` family)

| Module | Path | Role |
|---|---|---|
| `muscleMemoryAdapter` | `src/engine/muscleMemoryAdapter.js` (130 LOC) | `applyMuscleMemoryUpgrade(recommendation, exerciseName, mmiContext, dpEngine)` — recommendation transform, applied LAST in compose chain per ADR-033 §32.1 |
| `muscleMemoryIndex` | `src/engine/muscleMemoryIndex.js` (97 LOC) | Pure math: `computeMmiStartingWeight` + `computeMmiBoostMultiplier` (3 buckets: 6-12mo / 12-24mo / 24+mo) |

MMI is NOT an orchestrator-pipeline adapter — it sits as a *post-pipeline* recommendation transform invoked by `engineWrappers.applyMmiCapToWorkout` (React side) and historically wired via `src/pages/coach/logging.js` on the vanilla side (now retired post D028).

## §4 Test coverage matrix

### §4.1 Orchestrator pipeline adapters (8/8)

| Adapter | Unit (engine internals) | Parity test (legacy↔orchestrated) | Sentry anti-drift | Shape-check |
|---|---|---|---|---|
| periodization | Y (6 files, 1241 LOC `src/engine/periodization/tests/*`) | Y `periodizationParity.test.js` 281 LOC | Y `assertAllOrchestratorAdaptersInstrumented.test.js` lines 28-37 | Y parity tests assert blueprint 5-field shape |
| goalAdaptation | Y (5 files, 1084 LOC `src/engine/goalAdaptation/tests/*`) | Y `goalAdaptationParity.test.js` 347 LOC | Y | Y via parity blueprint asserts |
| energyAdjustment | Y (5 files, 1006 LOC `src/engine/energyAdjustment/tests/*`) | Y `energyAdjustmentParity.test.js` 417 LOC | Y | Y via parity Hook 4 re-emission asserts |
| bayesianNutrition | Y (8 files, 1556 LOC `src/engine/bayesianNutrition/tests/*` — kalman/posterior/profile typing/etc) | Y `bayesianNutritionParity.test.js` 471 LOC | Y | Y parity asserts `meta.nutrition_inference_metadata.posterior.mu` shape |
| tempo | Y (5 files, 1285 LOC `src/engine/tempo/tests/*`) | Y `tempoParity.test.js` 473 LOC | Y | Y via parity blueprint asserts |
| specialization | Y (7 files, 1926 LOC `src/engine/specialization/tests/*`) | Y `specializationParity.test.js` 476 LOC | Y | Y parity asserts `target_muscle_group` shape |
| warmup | partial (no `src/engine/warmup/tests/*` discovered via Glob — see §6 MED-1) | Y `warmupParity.test.js` 493 LOC | Y | Y via parity blueprint asserts (12-field meta) |
| deload | Y (6 files, 1461 LOC `src/engine/deload/tests/*`) | Y `deloadParity.test.js` 549 LOC (richest — owns full 8-chain integration cases) | Y | Y via parity blueprint asserts |

### §4.2 React wrappers (11/11 Sentry; 7 dedicated witness files)

| Wrapper | Dedicated unit/witness test | Sentry anti-drift | Integration (real-wire) |
|---|---|---|---|
| `getReadiness` | indirect via `engineWrappers.test.ts` (287 LOC) | Y `assert_all_adapters_instrumented.test.ts` lines 36-48 | indirect via `coachDirectorAggregate.test.ts` |
| `getFatigue` | indirect via `engineWrappers.test.ts` | Y | indirect |
| `getPRDelta` | indirect via `engineWrappers.test.ts` | Y | Y in `PostRpe.handleSubmit.prRecords.test.tsx` |
| `getTodayWorkout` | Y `engineWrappers.mmi-silent-cap.test.ts` (279 LOC, mocked `composePlannedWorkoutToday`) | Y | Y `scheduleAdapterAggregate.realwire.test.ts` (286 LOC — exercises real `getDailyWorkout` 8-chain) |
| `getNutritionTargetsToday` | Y `engineWrappers.getNutritionTargetsToday.test.ts` (159 LOC — covers tier 'none', floor 1200, phase override) | Y | partial — phase override path covered, not full BN pipeline |
| `getAdherenceOutput` | Y `engineWrappers.adherence.test.ts` (99 LOC) | Y | indirect |
| `getPatternsBanner` | Y `engineWrappers.patternsBanner.test.ts` (206 LOC, covers STAGNATION + LOW_ADHERENCE 2 catch sub-paths) | Y (2 sites) | indirect |
| `getProactiveAlerts` | Y `engineWrappers.proactiveAlerts.test.ts` (133 LOC) | Y | indirect |
| `getCoachRestReason` | indirect via component test `CoachRestCard.test.tsx` | Y | indirect |
| `getLaggingSignal` | indirect via `CoachTodayCard.test.tsx` | Y | indirect |
| `getCoachTodayQuote` | indirect via `CoachTodayCard.test.tsx` | Y | indirect |

`assert_all_adapters_instrumented.test.ts` enforces 5 invariants: tag presence, 12 capture sites count, `util/sentry.js` consent-gate import path (D055), `source: 'engine-adapter-fallback'` co-occurrence, and orphan-catch heuristic with whitelist of 2 private helpers.

### §4.3 MMI Engine #9

| Module | Unit | Integration | Sentry | Shape |
|---|---|---|---|---|
| `muscleMemoryAdapter` | Y `src/engine/__tests__/muscleMemoryAdapter.test.js` (220 LOC — bucket boundaries, forensic flags, idempotency) | Y `engineWrappers.mmi-silent-cap.test.ts` (279 LOC — silent auto-cap React wire) | NOT instrumented (silent path by design — see §5.4) | Y unit covers `_muscleMemoryApplied` + `_mmiOriginalKg` forensic flag shape |
| `muscleMemoryIndex` | Y `src/engine/__tests__/muscleMemoryIndex.test.js` (268 LOC — 3 bucket math) | NONE direct | NOT instrumented | Y |

### §4.4 Pipeline runner + barrel

| Component | Test | LOC |
|---|---|---|
| `runPipeline` | `orchestrator.test.js` | 164 |
| `Result`/`ok`/`err`/`isOk` | `result.test.js` | 89 |
| `contextBuilder.buildEngineContext`/`extendEngineContext` | `contextBuilder.test.js` | 67 |
| `budget` utility | `budget.test.js` | (in `utilities/__tests__`) |
| `convergenceGuard` utility | `convergenceGuard.test.js` | (in `utilities/__tests__`) |
| `scheduleAdapter.getDailyWorkout` | `scheduleAdapter.getDailyWorkout.test.js` | covers pipeline empty, hard-halt, throws |

## §5 Pipeline flow walk

### §5.1 Onboarding T0 → first workout

Onboarding stores `userState` (`age`, `sex`, `goal`, `frequency`, `experience`, `weight`) → on first day-of-week active flag, `composePlannedWorkoutToday()` calls `getDailyWorkout(userState, now)` which:

1. Checks calendar override for rest day.
2. Computes available equipment minus missing.
3. Builds `engineContext` and runs all 8 adapters sequentially: Periodization → GoalAdaptation → EnergyAdjustment → BayesianNutrition → Tempo → Specialization → Warmup → Deload.
4. Aggregates blueprints by `output.id` and feeds them to `buildSession(sessionType, sessionCtx)` for exercise selection.

**T0 fresh user signals.** With zero `recentSessions`, `weights={}`, `profileTier='T1'` default, several engines emit `tier='none'`/`confidence='low'`. Periodization integration test confirms `tier 'none' + confidence 'low'` on empty ctx (`src/engine/periodization/tests/integration.test.js` line 61-65). Bayesian Nutrition returns `tier 'none'` for T0 with no observations → React wrapper falls back to `BASELINE_NUTRITION` (`engineWrappers.ts` L484-489) — covered by `engineWrappers.getNutritionTargetsToday.test.ts`.

**Coverage status.** Full real-wire path covered by `scheduleAdapterAggregate.realwire.test.ts` "training day" case. MMI Engine #9 IS post-pipeline applied via `applyMmiCapToWorkout(planned)` in `getTodayWorkout` L447 but **only when `pauseMonths >= 6`** — T0 returns null context, baseline preserved.

### §5.2 Daily workout (returning user)

1. Pre-render: `getTodayWorkout()` awaits `composePlannedWorkoutToday()` (8-chain pipeline) → applies MMI silent cap if `pauseMonths >= 6` AND `userChoice !== 'refused'`.
2. During: `useWorkoutStore` tracks `sessionsHistory`; `getReadiness`, `getFatigue`, `getCoachRestReason`, `getLaggingSignal`, `getCoachTodayQuote`, `getPatternsBanner`, `getProactiveAlerts` invoked in render hooks of Antrenor cards.
3. Post: `PostRpe.handleSubmit` writes pr-records via `prRecordsWriteback.ts`, then `detectPR`/`getPRDelta` consumes for banner.

**Coverage status.** All 8 chain steps covered individually (parity tests) + full chain covered by `deloadParity.test.js` `Periodization → ... → Deload full 8-chain end-to-end` line 370 + sub-span ordering assert. Real engine integration via `scheduleAdapterAggregate.realwire.test.ts` confirms `intensityMod ∈ {'plus','normal','minus'}` and `volumeKg` propagation.

### §5.3 PR detection + Silent MMI compose

PR pipeline: `PostRpe.handleSubmit` → `prRecordsWriteback` updates `DB.pr-records` → next render `getPRDelta(exercise, set, history)` consults `detectPR` → emits enriched delta (Epley 1RM) for `PostSummary` banner.

MMI compose chain per `muscleMemoryAdapter.js` doc lines 7-12: `DP.recommend → AA.applyTo → applyAcceleratedLearningUpgrade → applyMuscleMemoryUpgrade` (LAST). React production wire applies MMI *after* the 8-adapter pipeline emits `targetKg`, NOT inside the pipeline itself.

**Coverage status.** PR side covered. MMI compose-chain ordering (LAST-in-chain invariant per ADR-033 §32.1) NOT exercised in any integration test — only the React-side outer wrapper `applyMmiCapToWorkout` is tested in isolation (silent-cap test mocks `composePlannedWorkoutToday`). See §6 HIGH-1.

### §5.4 Fatigue + adherence detectors

- `getFatigue` reads `DB.logs` / `DB.wellbeing` via `calculateFatigueScore` (engine).
- `getAdherenceOutput` reads `DB.kcals` + `DB.prots` + CDL via `getAdherenceScore`.
- `getPatternsBanner` composes both: STAGNATION (via `detectGlobalStagnation` over `sessionsHistory` >= 2 weeks threshold `STAGNATION_WEEKS_THRESHOLD` L672) + LOW_ADHERENCE (gated `sessionsHistory.length >= 3` L675).
- `getProactiveAlerts` maps engine severity `warning|info|success` → UI `warn|info|info` (success collapses; default `info`).

**Coverage status.** All four React wrappers have dedicated witness files. Engine-side unit coverage: 467 LOC `fatigue.test.js` + 216 LOC `adherence.test.js` + 97 LOC `stagnationDetector.test.js` + 148 LOC `proactiveEngine.test.js` + 219 LOC `weaknessDetector.test.js` + 386 LOC `muscleRecovery.test.js`. Healthy.

## §6 Coverage gaps (prioritized)

### HIGH (blocker pre-Beta risk)

**HIGH-1 — MMI compose-order invariant has no integration witness.** ADR-033 §32.1 + `muscleMemoryAdapter.js` lines 7-17 doc the LAST-in-chain ordering rule (MMI applies AFTER `applyAcceleratedLearningUpgrade` so the conservative re-resume baseline wins). No test exercises `DP.recommend → AA.applyTo → applyAcceleratedLearningUpgrade → applyMuscleMemoryUpgrade` end-to-end with both upgrade paths active simultaneously. Drift risk: future refactor swaps order silently and Marius post-pause receives accelerated-learning boost on top of MMI starting weight → over-aggression.

**HIGH-2 — MMI Sentry instrumentation gap is undocumented behavior, not tested.** D074 §2 carves out orchestrator pipeline adapters from D063 Sentry scope, but MMI sits in a *third* layer (post-pipeline React wrapper transform). `applyMmiCapToWorkout` in `engineWrappers.ts` L410-423 has NO try/catch and NO Sentry capture. If `applyMuscleMemoryUpgrade` throws on malformed `mmiContext` from `buildSilentMmiContext`, the caller `getTodayWorkout` outer catch L448 emits source `engine-adapter-fallback`/adapter `getTodayWorkout` — wrong tag, hides MMI as root cause in ops dashboard. No test asserts the tag is correct vs wrong.

**HIGH-3 — Orchestrator-adapter parity tests verify ENGINE behavior, NOT runtime pipeline composition in production path.** Parity tests construct `buildOrchestratedCtx(userState, co)` with the Constraint Object pre-seeded; real production path runs Periodization first to emit it. The `scheduleAdapterAggregate.realwire.test.ts` exercises the real chain but asserts only top-level shape (`intensityMod`, `volumeKg`, exercises array), NOT that downstream engines actually consumed the upstream Constraint Object. Drift risk: future change to Periodization output field name `constraintObject` → downstream engines silently fall back to default Floor/Ceiling → no test fails (parity test still passes because it injects CO directly).

### MED (drift risk pre-Beta)

**MED-1 — Warm-up engine has no `src/engine/warmup/tests/*` directory.** All 7 other engines have a per-engine test directory under `src/engine/<engine>/tests/`. Warm-up engine has `warmupParity.test.js` (493 LOC) at the orchestrator layer but no internal unit tests for the Hybrid 5-10 min routine sub-modules. Bugatti gap — engine internals untested at unit granularity. (Note: Glob for `src/engine/warmup*` and `src/engine/warm-up/**` returned no matches — warmup engine module location should be verified by Co-CTO.)

**MED-2 — `assertAllOrchestratorAdaptersInstrumented.test.js` is NEWER than D074, which states orchestrator adapters are "0/8 Sentry instrumented currently".** Either D074 §1 bullet 2 + §4 line 1836 "verified 0/8" is stale (orchestrator adapters since instrumented in Wave 7-22 overnight, see `assertAllOrchestratorAdaptersInstrumented.test.js` line 39 `EXPECTED_ADAPTER_COUNT = 8` + line 91 lock count assertion) OR the test file is asserting state that exists but D074 was written before that wave. SSOT precision drift — Daniel + Co-CTO need to reconcile D074 wording vs current 8/8 orchestrator Sentry state. (Empirical: file exists, asserts 8/8 adapter Sentry tag + `orchestrator-adapter-fallback` source tag.)

**MED-3 — `scheduleAdapter.getDailyWorkout` hardcodes adapter sequence (lines 441-450) instead of importing `ORDERED_ADAPTERS` from barrel.** Two sources of truth for pipeline order: `adapters/index.js` `ORDERED_ADAPTERS` (frozen const) and `scheduleAdapter.js` inline literal. Drift risk: ordering change in barrel NOT propagated to production runtime. No test asserts the two arrays match.

**MED-4 — React `getTodayWorkout` MMI cap wire is tested in isolation only.** `engineWrappers.mmi-silent-cap.test.ts` mocks `composePlannedWorkoutToday` and tests `applyMmiCapToWorkout(workout)` cu synthetic workouts. No test exercises the real `composePlannedWorkoutToday → applyMmiCapToWorkout` chain end-to-end with a real returning-user fixture (`pauseMonths >= 6` + populated `pr-records` + real pipeline output). Risk: pipeline-emitted exercise names mismatch keys in `peakPrePauseKgPerExercise` (e.g., engine emits `'Bench Press'` but pr-records key is `'bench-press'`) → MMI silently no-ops production.

### LOW (robustness)

**LOW-1 — No shape-check witness for React wrapper output interfaces.** `engineWrappers.ts` exports `ReadinessOutput`, `FatigueOutput`, `PRDelta`, `PlannedWorkoutOutput`, `NutritionTargetsEngine`, `AdherenceOutput`, `PatternBanner`, `ProactiveAlert`, `CoachRestReason`, `CoachTodayQuote` interfaces. No test reads compiled types or asserts engine-emitted fields cover the full surface. Drift risk: engine drops a field (e.g., Bayesian engine omits `confidence` enum) → React `mapBNConfidence` defaults to `0.2` silently.

**LOW-2 — No orphan-test scan.** This audit did not exhaustively grep for tests targeting removed/deprecated engines. Spot-check found only active engine modules — but with 8203 LOC engine cluster tests + 2538 LOC `__tests__` flat suite, a programmatic scan would be a separate post-Beta task.

**LOW-3 — `getPatternsBanner` 2 catch sub-paths inconsistently instrumented.** D063 anti-drift test counts 12 capture sites (11 + 1 extra for `getPatternsBanner` STAGNATION/LOW_ADHERENCE). If a 3rd pattern is added to `getPatternsBanner`, the anti-drift test EXPECTED_CAPTURE_EXCEPTION_SITES constant must be bumped manually. Future-self trap risk.

**LOW-4 — `STAGNATION_WEEKS_THRESHOLD` (=2) shared business rule has no invariant assertion test.** `engineWrappers.ts` L672 exports the const and comments "NU schimba fără update DECISIONS.md". No test reads the const and pins it to `2` — drift could go unnoticed in mockup-vs-prod parity until visual audit catches it.

## §7 Recommendations (prioritized — concrete test additions)

1. **HIGH-1 fix — Add `composeChainOrdering.test.js`** in `src/engine/__tests__/`. Test the full `DP.recommend → AA.applyTo → applyAcceleratedLearningUpgrade → applyMuscleMemoryUpgrade` pipeline with a synthetic `mmiContext` (`pauseMonths=7`, peak 200kg) + AA active. Assert MMI starting weight WINS over AA upgrade (LAST-in-chain invariant). ~80-120 LOC.
2. **HIGH-2 fix — Add MMI Sentry instrumentation test sibling.** Wrap `applyMuscleMemoryUpgrade` invocation in `applyMmiCapToWorkout` cu try/catch + `captureException({tags: {source: 'engine-adapter-fallback', adapter: 'applyMmiCapToWorkout'}})`. Add witness in `engineWrappers.sentry.test.ts`. Update `assert_all_adapters_instrumented.test.ts` REQUIRED_ADAPTERS list + EXPECTED_CAPTURE_EXCEPTION_SITES count.
3. **HIGH-3 fix — Add real-pipeline Constraint Object propagation witness.** In `scheduleAdapterAggregate.realwire.test.ts`, spy on `runPipeline` invocation and assert downstream adapter input `ctx.meta.constraintObject` is non-null after Periodization step. ~30 LOC addition.
4. **MED-1 fix — Locate or create `src/engine/warmup/` module + tests.** If module lives elsewhere (e.g., inline in `warmupAdapter.js`), refactor extract to `src/engine/warmup/index.js` + add per-sub-module tests matching the 7-sibling pattern.
5. **MED-2 fix — Reconcile D074 wording vs current orchestrator 8/8 Sentry state.** Either update D074 §4 line 1836 ("0/8 verified" → "0/8 was state pre-Wave-7-22; 8/8 post") OR confirm pipeline adapter Sentry is intentional pre-D074. Append clarification note (NOT supersede per D007).
6. **MED-3 fix — Replace `scheduleAdapter.getDailyWorkout` hardcoded array with `ORDERED_ADAPTERS` import.** Single-source ordering invariant. Add asserts in `scheduleAdapter.getDailyWorkout.test.js` that pipeline call uses imported barrel.
7. **MED-4 fix — Add real-wire MMI integration test.** Combine `scheduleAdapterAggregate.realwire.test.ts` fixture cu MMI silent-cap seed (returning user 7-month pause + real pr-records). Assert pipeline-emitted exercise names map cleanly to MMI peak keys (no silent no-op due to name mismatch).
8. **LOW-1 fix — Add shape-check witness file** `engineOutputShapes.contract.test.ts` reading each wrapper output type guard + running against real engine fixture. Catches engine field drops.
9. **LOW-3 fix — Make `assert_all_adapters_instrumented.test.ts` count derivation dynamic.** Instead of hardcoded `EXPECTED_CAPTURE_EXCEPTION_SITES = 12`, count required adapters + walk source for known multi-catch list. Removes manual-bump trap.
10. **LOW-4 fix — Add `STAGNATION_WEEKS_THRESHOLD` invariant assertion** in `engineWrappers.test.ts`. One-liner pinning const to `2` with comment citing mockup `andura-clasic.html` L747.

## §8 Cross-refs

- **DECISIONS.md §D063** (lines 1269-1306) — Engine adapter Sentry coverage 100% test instrument anti-drift LOCKED V1. Scope clarified by D074.
- **DECISIONS.md §D066** (lines 1401-1440) — MMI Engine #9 silent cap React production wire LOCKED V1 (engine layer LANDED, UI prompt deferred).
- **DECISIONS.md §D074** (lines 1799-1838) — D063 scope clarification (React wrappers ONLY). NOTE: §4 line 1836 "0/8 Sentry verified" appears stale vs current `assertAllOrchestratorAdaptersInstrumented.test.js` 8/8 lock. See §6 MED-2.
- **DECISIONS.md §D-LEGACY-098** — LOCK 10 ADR 033 MMI Engine #9 V1 LANDED.
- **ADR 030** `_FROZEN/030-adapter-design-pattern.md` D1-D5 + §3.6 RESOLVED V1 — severity-aware policy.
- **ADR 026** `_FROZEN/026-offline-coaching-decision-tree-exhaustive.md` §42.10 + §1.10 — pipeline sequence sequential strict + Constraint Object propagation.
- **ADR 033** `_FROZEN/033-muscle-memory-index.md` §32.1-§32.3 — MMI bucket spec + LAST-in-chain compose order.
- **Anti-drift tests:**
  - `src/react/__tests__/lib/assert_all_adapters_instrumented.test.ts` (158 LOC, commit ad82ab65 Wave 12) — React wrappers 11/11 + 12 capture sites.
  - `src/coach/orchestrator/__tests__/assertAllOrchestratorAdaptersInstrumented.test.js` (104 LOC) — orchestrator 8/8 adapter Sentry tag + `orchestrator-adapter-fallback` source tag.
- **Pipeline runtime entry:** `src/engine/schedule/scheduleAdapter.js` `getDailyWorkout` L421-497 + `src/react/lib/scheduleAdapterAggregate.ts` `composePlannedWorkoutToday` aggregator.

---

**Verdict (repeat for fast scan).** 8/8 orchestrator + 11/11 React wrapper + MMI Engine #9 covered cu solid per-engine unit + parity + Sentry anti-drift. 3 HIGH gaps (MMI compose-order invariant, MMI Sentry tag attribution, real-pipeline Constraint Object propagation witness) + 4 MED + 4 LOW. Pre-Beta priority: address HIGH-1 + HIGH-2 + HIGH-3 + MED-2 (D074 wording reconciliation) before launch.
