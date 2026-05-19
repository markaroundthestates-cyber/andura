## Task: Faza 2.5 batch 4 Engine Bayesian Nutrition Inference V1 implement per ADR 026 §9.4 + ADR 018 §2
**Model:** Opus
**Status:** Complete

### Pre-flight
- Backup tag: `pre-faza2.5-bayesian-nutrition-v1-implement-2026-05-06-1550` ✅ pushed origin
- Clean tree pre-execution: yes
- Baseline tests: **1898 PASS / 0 FAIL** ✅
- Grep PATHS verified: ADR 026 §9.4 LANDED line 881 + ADR 018 §2 + ADR 022 SPEC READY V1 + ADR 009 (Convergence Guard amendment) + ADR 017 + Pain-Aware ADR + `src/engine/periodization/` + `src/engine/goalAdaptation/` + `src/engine/energyAdjustment/` + `src/coach/orchestrator/result.js` toate exist
- §9.4 spec source confirmed canonical (commit `685fdd4`)
- Tooling availability: `test:run` (vitest 3.2.4) + `typecheck` (tsc) ✅; **NO `lint`** (anti-Slip 4 transparent skip)

### Modificări

**`src/engine/bayesianNutrition/`** NEW directory (8 source modules + 6 test files = 14 files, 3020 LOC):

Source modules:
- `constants.js` (251 LOC) — CALIBRATION_TIERS T0/T1/T2 + STRONG_PRIOR_SLOPE T0=70/30→T1=80/20→T2=90/10 + KALMAN_DEFAULTS Hall 2008 + R²>0.85 gate + EWMA fallback feature flag `bayesian_kalman_v1` + VOLUME_METRIC_WEIGHTS 3:2:1 (Lower:Upper:Isolation) + PROFILE_TYPING 0.55-0.85 + 0.70 default T0 + 15% Hamming + 2 sesiuni 14d + SCHEMA_CONSTANTS observations N=20 + CI 0.95 + ANTI_SPAM 28d + cap 4/year + VOLUME_LANDMARKS compound min 3 + isolation graceful 0.3× + PHASE_RESET_LAYERS 1+2 reset / 4 preserve + EDGE_CASES pregnant/post-bariatric/kidney + age 75+ + ED history + disclaimer + UI_TIER Tier 1+2 only NU blocking + ENERGY_VARIANCE_MODIFIER 1.30 amplify + neutral T0 1.0 + PERFORMANCE_BUDGET <50ms median
- `types.js` (172 LOC) — JSDoc `BayesianNutritionResult` extends DimensionResult + 5-field `BayesianNutritionBlueprint` (nutrition_inference_metadata + likelihood_probabilities + profile_typing + ui_tier + passive_mode_active) + signals + `Prior`/`Posterior`/`Observation`/`KalmanState`/`ProfileTypingState`/`LikelihoodProbabilities`/`DisagreementFlagSignal`/`EnergyVarianceSignal`/`PassiveModeSignal` typedefs
- `priorPosterior.js` (228 LOC) — `resolveTier` + `strongPriorSlope` + `initPriorFromDemographic` + `conjugateUpdate` Normal-Normal closed-form (NU MCMC) + `decayPosteriorToPrior` natural posterior=prior_next A3 + `evaluatePhaseReset` Hibrid Layer 1+2 reset / preserve Layer 4 A5 + `detectSpecialPriors` Passive Mode tripwire + age 75+ + ED history E2
- `kalmanFilter.js` (196 LOC) — `computeR2` coefficient determination + `kalmanUpdate1D` closed-form + `ewmaUpdate` fallback + `evaluateR2Gate` >0.85 strict + `isKalmanFeatureFlagEnabled` + `runKalmanWithFallback` full chain B2 (Hall 2008 + R²>0.85 + EWMA feature flag)
- `volumeLandmarks.js` (180 LOC) — `lookupIsraetelLandmarks` + `resolveMovementCategory` (squat/deadlift→lower / bench/OHP→upper / curl/lateral→isolation) + `volumeMetricWeight` 3:2:1 + `computeWeightedVolume` + `countCompoundObservations` 14d window + `computeIsolationDegradation` 0.3× când compound <3 + `computePersonalizedLandmarks` Hibrid lookup + regression
- `profileTyping.js` (213 LOC) — `computeMoodScore` Linear Sum Weighted (LVM defer v1.5) B4 + `resolveProfileTypingThreshold` 0.55-0.85 D3 + `exceedsHammingHysteresis` 15% strict > + `meetsConsecutiveQualifier` 2 sesiuni 14d window + `evaluateProfileTypingFlip` cumulative gating + `evaluateAntiSpam` 28d + cap 4/year D6
- `crossEngineHooks.js` (183 LOC) — `emitGoalAdaptationDisagreement` flag CDL Tier 1 silent C2 + `applyEnergyVarianceModifier` neutral T0 / DOWN T1+ × 1.30 amplify C3 + `applySigmaModifier` post-conjugate update + `emitPassiveModeSignal` E2 + `getConvergenceGuardReference` §9.4.6 NU duplicate (ADR 009 amendment owns) + `forwardConstraintObject` Hook pass-through immutable
- `index.js` (441 LOC) — entry `evaluate(ctx) → BayesianNutritionResult` async pure total + ENGINE_ID 'bayesianNutrition' + computeConfidence + normalCdf approximation Abramowitz & Stegun 26.2.17 + computeLikelihoodProbabilities {deficit/surplus/maintenance} sum=1.0 D2 + computeConfidenceInterval 95% CI + resolveUiTier Tier 1+2 only NU blocking modal D4 + pipeline 4th position canonical clarified header

Tests (~6 files, 1156 LOC, 142 tests):
- `tests/priorPosterior.test.js` (24 tests) — tier resolve + Strong Prior slope sums + initPriorFromDemographic + conjugateUpdate Normal-Normal closed-form + decay natural + phase reset CUT↔BULK + Passive Mode pregnant/post-bariatric/kidney + age 75+ + ED history disclaimer
- `tests/kalmanFilter.test.js` (22 tests) — R² computation + Kalman 1D update + EWMA fallback + R²>0.85 gate strict edge + feature flag check + full chain integration
- `tests/volumeLandmarks.test.js` (24 tests) — Israetel lookup + movement category classification + weighted volume 3:2:1 + compound observations 14d window + isolation graceful 0.3× boundary
- `tests/profileTyping.test.js` (22 tests) — mood Linear Sum Weighted + threshold T0/T1+ + Hamming 15% strict edge + consecutive qualifier 2 sesiuni 14d + flip evaluation cumulative + anti-spam 28d + cap 4/year
- `tests/crossEngineHooks.test.js` (24 tests) — disagreement flag CDL + σ variance modifier neutral T0 / amplify T1+ DOWN + sigma multiplicative + Passive Mode signal + Convergence Guard reference frozen + forward constraint pass-through
- `tests/index.test.js` (26 tests) — entry contract DimensionResult + 5-field blueprint + total function + deterministic 10-invocation + Pregnant→Passive Mode→Tier 2 banner + age 80+ Special Priors + Disagreement → Tier 1 silent + Energy DOWN T1+ → σ amplify + T0 → neutral + Phase reset CUT→BULK + Kalman flag enabled vs disabled + isolation graceful degradation + likelihood sum=1.0 + UI Tier 1+2 only + Hard rule NEVER specific kcal + nutrition schema D1 + 95% CI + anti-spam 28d cooldown + forward Hook 4

### Build + Tests
- **Tests:** 1898 → **2040 PASS / 0 FAIL** (+142 new tests Bayesian Nutrition batch 4)
- **Typecheck:** ✅ clean (`tsc --noEmit`)
- **Surgical bug fix pre-commit:** 1 test expectation incorrect — `priorPosterior.test.js` "defensive null prior" test expected returning prior defaults (mu=0, sigma=1.0) but function correctly defensive: uses default prior {mu:0,sigma:1.0} then runs full conjugate update toward sampleMean=5 + sample variance + N=5 → posterior mu=4.166. Fixed test cu corrected expectation (Number.isFinite + posterior shifts toward sample) + added separate boundary case for zero-observations preserving defaults. ZERO src/ engine bugs uncovered post-fix.

### Commits (1)
- `8615ec1` feat(engine): batch 4 Bayesian Nutrition Inference V1 implement per ADR 026 §9.4 + ADR 018 §2 — Pure-function module 8 source + 6 test files; pipeline §42.10 position 4th canonical clarified header; 32-35 decisions Cluster A-E verbatim §9.4 SSOT (commit 685fdd4) + ADR 022 complementary; Gaussian Conjugate Prior + Strong Prior tier slope 70/30→80/20→90/10 + closed-form Normal-Normal posterior update + Kalman 1D Hall 2008 + R²>0.85 gate + EWMA fallback + Volume metric 3:2:1 + Mood LSW + Israetel lookup + isolation graceful 0.3× + Profile Typing 0.55-0.85 + Hamming 15% + 2 sesiuni 14d + UI Tier 1+2 NU blocking + Hard rule NEVER specific kcal + Anti-spam 28d + cap 4/year + Hook #2 disagreement flag CDL + Hook #5 σ variance modifier + Passive Mode tripwire + Convergence Guard reference §9.4.6 NU duplicate; 1898 → 2040 PASS / 0 FAIL (+142); typecheck clean; surgical priorPosterior test expectation fix transparency; pattern structural batch 1+2+3 commits 1303b62+bf9814e+69ec9ce honored; cumulative LOCKED V1 ~659 PRESERVED

### Pushed
- origin/main: yes (`7b8deba..8615ec1 main -> main`)

### Issues
- **Surgical bug fix transparency:** 1 test expectation incorrect în `priorPosterior.test.js` "defensive null prior" — function defensive uses default prior then runs full update; test expected returning prior defaults wrongly. Fixed cu corrected expectations: posterior shifts toward sample + sigma reduced. Added separate boundary case (null prior + zero observations) preserving defaults. NU silent skip — explicit transparency per surgical discipline batches 1+2+3 precedent.
- **Tooling skipped (transparency):** `npm run lint` does NOT exist in package.json (anti-Slip 4 reinforced — verified pre-flight, NU fabricated execute).
- **Pipeline canonical position 4th clarified header** — `index.js` + `constants.js` documentation explicitly cite §42.10 position 4th canonical (post §9.3 Energy 3rd LANDED commit `69ec9ce` precedent) anti-recurrence numbering ambiguity downstream batches 5-7 references.
- **Convergence Guard reference pattern documented** — `crossEngineHooks.getConvergenceGuardReference()` returns frozen metadata pointing la ADR 009 §AMENDMENT 2026-05-05 birou after canonical SSOT + note explicit "rule = behavioral validation cross-cutting all tier transitions T0→T1→T2, NU Engine #3 specific" + redirect actual T2 Unlock evaluation la `src/coach/orchestrator/utilities/convergenceGuard.js` (Phase 1-2 foundation commit `5a16550` reusable). NU duplicate logic in Bayesian module.
- **Cumulative LOCKED V1 ~659 PRESERVED unchanged** (implementation aggregation only verbatim §9.4 spec, ZERO net new substantive decisions).
- **Pre-flight grep PATHS + tooling availability ✅** anti-Slip 2 + Slip 4 + Slip 5 reinforced (memory rule `feedback_grep_before_prompt_cc.md` honored — §9.4 SSOT cited NU §45.x stale NU `127_HANDOVER` candidate uncertain).

### Next action — chat NEW pickup priority pivot

**P1.2.5 batch 5 Faza 2.5 §9.5 Engine Tempo Module-Level Spec V1 compile** (NEXT chat strategic per pipeline §42.10 sequential):
- Pre-compile §9.5 ADR 026 Engine Tempo Module-Level Spec V1 pattern Bugatti SSOT consistent §9.1+§9.2+§9.3+§9.4 (compile drafts LANDED commits `cd6d9a4`+`6be84f8`+`2f9aa79`+`685fdd4`)
- Source: ADR 028 Tempo Form Cues + chat strategic Tempo spec materials (consumed archives — `149_HANDOVER_..._engines5-6-7_spec_sessions_CONSUMED.md` Engine #6 Tempo section ~28-30 decisions Cluster A-E)
- Pattern §9.1+§9.2+§9.3+§9.4 honored: Cluster A-E verbatim + Reconsideration Triggers + Cross-refs ADR 018 §2 + ADR 026 §1.10 Pipeline Order + position 5th canonical
- Estimate ~50-83 min real velocity X×3 rule (precedent §9.1+§9.2+§9.3+§9.4 compile drafts)

**Faza 2.5 batches 5-8 sequential per pipeline §42.10** (post Bayesian V1 LANDED batch 4):
- Pre-implement compile §9.5-§9.8 ADR 026 pattern Bugatti SSOT consistent
- Engine Tempo (5th) → Specialization (6th) → Warm-up (7th) → Deload (8th)
- Pipeline §42.10 sequential canonical: Periodization → Goal Adaptation → **Energy** (3rd LANDED) → **Bayesian** (4th LANDED batch 4) → **Tempo** (5th NEXT) → **Specialization** (6th) → **Warm-up** (7th) → **Deload** (8th)

**ADR 022 status preserved** (NU file flip recommend — distilled detail complementary la §9.4 SSOT canonical, both references reusable post Bayesian V1 LANDED).
