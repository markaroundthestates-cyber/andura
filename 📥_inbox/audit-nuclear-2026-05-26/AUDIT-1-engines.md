# AUDIT-1 — Engine Brain (Nuclear, Pre-Beta)

**Scope:** `src/engine/**` exhaustive line-by-line + orchestrator wiring cross-check (`src/coach/orchestrator/`) for pipeline ordering / MMI composition.
**Date:** 2026-05-26 · **Mode:** read-only · **Reference:** ANDURA_PRIMER §2-§3, ADR 026 §9.1-§9.8, ADR 030, ADR 018.

---

## 1. Coverage — files read

### Pipeline-pure engines (8 + cross-cutting), read in full

**Periodization (#1):** `periodization/index.js`, `mesocycle.js`, `macrocycle.js`, `volumeLandmarks.js`, `crossEngineHooks.js`, `constants.js`
**Goal Adaptation (#2):** `goalAdaptation/index.js`, `phaseAutoDetection.js`, `templates.js`, `trainingModifiers.js`, `pushBackTiers.js`, `crossEngineHooks.js`, `constants.js`
**Energy Adjustment (#3):** `energyAdjustment/index.js`, `bidirectionalAdjustment.js`, `emojiAggregation.js`, `yoyoAntiFlap.js`, `crossEngineHooks.js`, `medicalReferral.js`, `constants.js`
**Bayesian Nutrition (#4):** `bayesianNutrition/index.js`, `kalmanFilter.js`, `priorPosterior.js`, `observationFilter.js`, `profileTyping.js`, `crossEngineHooks.js`, `constants.js` (volumeLandmarks not re-read in full — used in index)
**Tempo (#5):** `tempo/index.js`, `tempoPrescription.js`, `formCues.js`, `mindMuscle.js`, `crossEngineHooks.js`, `constants.js`
**Specialization (#6):** `specialization/index.js`, `activationGating.js`, `weaknessConsumer.js`, `cooldownManager.js`, `applicationStrategy.js`, `crossEngineHooks.js`, `constants.js`
**Warm-up (#7):** `warmup/index.js`, `durationCalculator.js`, `skipManager.js`, `constants.js` (routineComposer/cooldownEmitter/crossEngineHooks — read by reference via index)
**Deload (#8):** `deload/index.js`, `triggerHierarchy.js`, `depthCalculator.js`, `constants.js` (durationManager/partialScopeResolver/crossEngineHooks — read by reference via index)

### MMI (#9) + auxiliary + cross-cutting

`muscleMemoryIndex.js`, `muscleMemoryAdapter.js`, `weaknessDetector.js`, `prEngine.js`, `usNavyBF.js`, `muscleRecovery.js`, `readiness.js`, `fatigue.js`, `calibration.js`, `proactiveEngine.js` (partial), `coach/orchestrator/index.js` (runner), `coach/orchestrator/adapters/index.js` (ORDERED_ADAPTERS), `react/lib/coachDirectorAggregate.ts`.

### Verification grep

Ran `Date.now|Math.random|new Date()` across all 8 pipeline subfolders: **ZERO hits in any source file** (only in test files + doc comments). Pure-function discipline (ADR 026 §9) fully respected in the pipeline.

Not fully line-read (lower-risk, large barrel/data files): `dp.js`, `sys.js`, `whyEngine.js`, `stagnationDetector.js`, `adherence.js`, `sessionBuilder.js`, `muscleMap.js`, `exerciseMapping.js`, `coldStartGuidelines.js`, `muscleRecoveryConstants.js`, types.js files, `.d.ts`. Test files (`__tests__/`, `tests/`) excluded per scope (audit target = source).

---

## 2. Findings

| # | Sev | Location | Finding | Why it matters |
|---|-----|----------|---------|----------------|
| F1 | **HIGH** | `tempo/constants.js:187-190` + `tempo/crossEngineHooks.js:58` + `tempo/tempoPrescription.js:76` | `HIGH_INTENSITY_PHASES = { PEAK:'PEAK', LOAD:'LOAD' }` and the comparisons flag bare **`LOAD`** (week 1, the LIGHTEST/baseline mesocycle week) as "high intensity", while NOT flagging **`LOAD+`** (week 2, the actually-heavier week). The code's own doc comments say "PEAK or **LOAD+**" (constants.js:181, crossEngineHooks.js:3-4) and the EnergyAdjustment engine correctly uses `forbiddenPhases:['PEAK','LOAD+']` (`energyAdjustment/constants.js:92`). Periodization phases are LOAD(W1)→LOAD+(W2)→PEAK(W3)→DELOAD(W4). | Tempo applies form-conservative tempo (3-2-2-0, slower) on the wrong week — on W1 (light) instead of W2 (heavy LOAD+). Inverted phase classification = wrong cue/tempo for the user during the actual high-stress week, and unnecessary conservatism on the easy week. Code contradicts its own spec comment + the sibling engine. Real correctness bug, not cosmetic. |
| F2 | **MED** | `periodization/volumeLandmarks.js:62,66` (`resolveGoalId`) | Duplicate-branch dead conditions: `g.startsWith('forta') \|\| g.startsWith('forta')` and `g.startsWith('sanatate') \|\| g.startsWith('sanatate')` — the second operand is identical to the first (NFD strip already removed diacritics, so the intended `forță`/`sănătate` forms collapse to the same string). Harmless logically but signals a copy-paste error; the diacritic-form intent is silently not handled distinctly. | Dead/redundant branches shipping to prod. No wrong output, but indicates the diacritic-handling was never actually distinct. NIT-adjacent but flagged MED because it's a recurring pattern (also `trainingModifiers.js:36-37` `resolveModeOverlay` has `m==='estetica'\|\|m==='estetica'` and `m==='forta'\|\|m==='forta'`). |
| F3 | **MED** | `goalAdaptation/phaseAutoDetection.js:196-219` (`computeMacroSplit`) | Field names misrepresent values. Returns `{ protein_g_per_kg_lbm: proteinG, fat_g_per_kg: fatG, carb_g }` but `proteinG = round(lbm × proteinPerKgLbm)` and `fatG = round(kg × fatPerKg)` are **total grams**, not per-kg values. The keys say "per_kg" / "per_kg_lbm". | Any downstream consumer trusting the key name would treat ~150g total protein as "150 g/kg LBM" — absurd. Currently no consumer reads these (engine output `recommendations:[]` V1, blueprint only in trace), so blast radius is low today, but it's a latent landmine for Stage-3 wiring. Label-vs-value mismatch. |
| F4 | **MED** | `goalAdaptation/volumeLandmarks.js:64` (`resolveGoalId`) + `periodization/constants.js:79` (`GOAL_MODIFIERS`) + `crossEngineHooks.js:99` (`intensityCorridorForGoal`) | `resolveGoalId` can return `'slabire'`, but `GOAL_MODIFIERS` has no `slabire` key (falls back to `hipertrofie` 1.00 via `??`) and `intensityCorridorForGoal` has no `slabire` case (falls back to hipertrofie 0.70-0.85). So a weight-loss ("slabire") user gets **hypertrophy volume + hypertrophy intensity corridor** from Periodization. The JSDoc `@returns` on `computeMuscleVolumeTarget` even omits `slabire` from its goalId union. | A cut/weight-loss user silently receives full hypertrophy volume targets and a high intensity corridor from the #1 engine — opposite of the conservative deficit-aware load a slabire goal implies. Not catastrophic (GoalAdaptation later detects CUT phase via template), but Periodization's volume map is wrong for this goal. Drift between the goal taxonomy used by GoalAdaptation (handles slabire) and Periodization (does not). |
| F5 | **LOW** | `deload/index.js:355` | `signals.push('deload_aa_driven_volume_cut_30_rir_up_intensity_down_b4_obligatoriu')` is pushed **unconditionally for every non-IDLE deload state** (incl. SCHEDULED_LINEAR and RESOLVING), but the label asserts "AA-driven". A scheduled calendar (linear) deload is not AA-driven. | Misleading CDL/audit signal — forensic transparency (ADR 011) is degraded; a scheduled W4 deload logs an "AA-driven" attribution. Cosmetic for behavior, wrong for the audit trail. |
| F6 | **LOW** | `kalmanFilter.js:70` / `constants.js:70` | Naming inversion: the feature-flag constant is `ewmaFallbackFlag: 'bayesian_kalman_v1'`. When the flag is **enabled** Kalman runs (EWMA is the fallback when disabled), so the constant key `ewmaFallbackFlag` reads backwards from its actual semantics. Functionally correct (verified against `runKalmanWithFallback`). | Pure readability/maintenance trap — a future editor could flip the polarity assuming the name describes "EWMA on". No runtime impact. |
| F7 | **LOW** | `bayesianNutrition/profileTyping.js:167-171` (`evaluateProfileTypingFlip`) | When neither `hammingExceeds` nor `qualifierMet` is true, `flapSuppressed` is set true even though no flip was ever attempted (incoming == current within hysteresis). "Suppressed" implies an attempted-and-blocked flip; here it's a no-op. | Minor semantic imprecision in an emitted signal (`profile_typing_flap_suppressed`). No wrong threshold; just noisy CDL. |
| F8 | **NIT** | `bayesianNutrition/index.js:178-181` (`resolveUiTier`) | `if (disagreementFlagged === true) return TIER_1_SILENT;` then the final `return TIER_1_SILENT;` — the disagreement branch is functionally redundant (both arms return the same value). Dead branch. | No behavioral effect; documents intent but is unreachable-equivalent. Clean-up candidate. |
| F9 | **NIT** | `goalAdaptation/index.js:111` | `isNewbie = Number(user.trainingWeeks) <= 12` — when `trainingWeeks` is missing, `Number(undefined)` is `NaN`, `NaN <= 12` is `false` (safe), but the intent (unknown → not-newbie) is implicit/accidental rather than explicit. Same pattern is handled explicitly in `templates.js:33-37` (`isNewbieEffect` guards `Number.isFinite`). Inconsistent defensive style across the two newbie checks. | Works today; brittle if `trainingWeeks` ever arrives as `"0"`-string edge. Consistency nit. |
| F10 | **NIT** | `periodization/volumeLandmarks.js:53` JSDoc | `@returns` union for `resolveGoalId` lists `slabire` but `computeMuscleVolumeTarget` (line 95) `@param goalId` union omits `slabire` — type docs disagree with each other re: the same value (ties to F4). | Doc drift; reinforces the F4 gap. |

---

## 3. Daniel questions (cross-cutting)

### 3a. Is any documented pipeline engine missing / stubbed / not wired?

**No engine is missing or stubbed.** All 8 prescriptive engines (Periodization → Goal Adaptation → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload) are fully implemented as pure-function `evaluate(ctx)` modules **and wired** via `coach/orchestrator/adapters/index.js → ORDERED_ADAPTERS` in the exact canonical §42.10 order. The orchestrator runner (`coach/orchestrator/index.js`) propagates a frozen Constraint Object engine-to-engine correctly (`Object.freeze`, `extendEngineContext`), with severity-aware halt/continue.

**MMI (#9)** is implemented (`muscleMemoryIndex.js` + `muscleMemoryAdapter.js`) and **composes last** — but NOT inside `ORDERED_ADAPTERS`. It is applied at the recommendation layer (DP → AA → accelerated-learning → **MMI last**, per `muscleMemoryAdapter.js:7-17`). This matches the documented "compose LAST" intent (PRIMER §2 #9), just via a different seam (React `engineWrappers`/adapter), not the 8-adapter orchestrator. Correct by design (ADR 033), but worth knowing MMI is not part of the orchestrator's sequential frozen-constraint chain.

**Auxiliary engines** (Muscle Recovery, Weakness Detector, PR Wall, Readiness, Streak, Coach Director, Fatigue) all exist. These are I/O-boundary engines (read `DB`/`Date.now()` directly) — which is **allowed** per PRIMER §3 ("side-effects la I/O boundary"), distinct from the strict-pure pipeline subfolders. `muscleRecovery.js`/`calibration.js` inject `now` with a `Date.now()` default — testable and acceptable.

### 3b. Does the brain logic match documented intent, or drift?

Overwhelmingly matches. Math verified correct: Brzycki 1RM (`weight × 36/(37−reps)`, guarded 1-12 reps), US Navy BF (Hodgdon-Beckett metric), Kalman 1D (standard predict/update, gain, variance), Normal-Normal conjugate posterior (precision-weighted, slope partition fixed per E-03 comment), MMI lookup+boost (matches ADR 033 table exactly), deload Final_Depth `MAX(45,60,30)+modifiers` with 60% extension clamp, ±15%/±10% T0/T1+ asymmetry, kcal floor 1200 filter, week%4 mesocycle (`computePhase` defensive coerce to W1), DELOAD multipliers (vol 0.55 = −45%, int 0.875 = −12.5%). Constraint Object is frozen recursively and forwarded read-only by every downstream engine (`forwardConstraintObject` re-freezes; none mutate inputs).

**Drifts found:** F1 (Tempo high-intensity = bare LOAD vs spec/sibling LOAD+) is the one real logic drift. F4 (Periodization has no `slabire` goal → falls to hipertrofie) is a taxonomy drift between #1 and #2. F2/F3/F10 are code-vs-comment / label-vs-value drifts.

### 3c. Could the brain produce a harmful / absurd recommendation in any edge case?

The engines are heavily defended (total functions, never throw, MRV hard cap, 90% 1RM hard cap, kcal floor 1200, KalmanState validation against corrupt persisted `mu="NaN"`, conservative-block on missing `nowMs` for cooldowns, Passive Mode tripwire for pregnant/post-bariatric/kidney, age-75 + ED-history special priors, medical referral copy). I found **no path that yields a directly dangerous absolute recommendation** in the pure pipeline (engines emit corridors/signals, `recommendations:[]` V1 — the absolute prescription happens downstream).

Residual concerns:
- **F4 (slabire → hypertrophy load):** the most "absurd-output" path — a weight-loss user gets Periodization volume/intensity tuned for mass gain. Mitigated downstream by phase=CUT detection, but the #1 engine's corridor is wrong for that goal.
- **F1 (Tempo LOAD vs LOAD+):** wrong-week conservatism — not harmful, but defeats the safety intent on the actually-heavy week.
- **MMI safety:** verified the conservative re-resume start (0.60-0.80×) wins last and boost expires after 3 weeks; no overshoot path found. `validateKalmanState` explicitly guards the "target 0 kg → lose 80 kg overnight" catastrophe the comment warns about.

---

## 4. Readiness — this slice

**~88%.**

The brain is genuinely peak-craft: all 8 engines + MMI implemented pure, wired in canonical order, frozen Constraint Object propagated without mutation, math correct across 1RM/Kalman/conjugate/deload/MMI, defensive total-function semantics everywhere, and rich safety gating (MRV/90%-1RM caps, kcal floor, passive mode, medical referral). The deductions are: one real logic drift (F1 Tempo phase inverted), one goal-taxonomy gap (F4 slabire), and a cluster of label/comment-vs-code mismatches (F2/F3/F5) that erode the forensic-audit and downstream-wiring guarantees a Bugatti brain demands. None are Beta-blocking on their own, but F1 + F4 are worth fixing before the brain's outputs are surfaced to users at full fidelity.
