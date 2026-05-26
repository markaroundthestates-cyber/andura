# AUDIT-W2 — Engine Brain Numerical Re-Derivation (Nuclear, Pre-Beta)

**Scope:** Independent line-by-line re-derivation of all math-dense `src/engine/**` formulas. Recomputed by hand, ignoring comments. Trust nothing.
**Date:** 2026-05-26 · **Mode:** read-only · **Reference:** AUDIT-1-engines.md (prior pass, F1/F4).

---

## 1. Per-formula re-derivation table

| Formula | Correct (re-derived by hand) | Code | Verdict | path:line |
|---------|------------------------------|------|---------|-----------|
| **Kalman predict (variance)** | σ_pred² = σ_prev² + Q² | `sigmaPrev*sigmaPrev + Q*Q` | MATCH | `bayesianNutrition/kalmanFilter.js:128` |
| **Kalman gain** | K = σ_pred²/(σ_pred²+R²), K∈[0,1) for Q,R>0 | `sigmaPredSq/(sigmaPredSq+R*R)` | MATCH | `kalmanFilter.js:131` |
| **Kalman update mean** | μ' = μ_pred + K(z−μ_pred) | `muPred + kalmanGain*(obs-muPred)` | MATCH | `kalmanFilter.js:132` |
| **Kalman update variance** | σ'² = (1−K)σ_pred², ≥0 | `(1-kalmanGain)*sigmaPredSq`, `Math.max(0,…)` sqrt | MATCH (neg-guarded) | `kalmanFilter.js:133-134` |
| **Q default (×0.01)** | "bridge" 22×0.01 = 0.22 | `metabolicAdaptationKcalPerKgLbm*0.01` | MATCH to constant; derivation is a **fudge factor** (see N1) | `kalmanFilter.js:122`, `constants.js:67` |
| **EWMA** | a·obs+(1−a)·prev, a∈[0,1] | `a*obs+(1-a)*prev` | MATCH | `kalmanFilter.js:155` |
| **R²** | 1 − SS_res/SS_tot | `1-(ssRes/ssTot)`, guarded ssTot=0→0, <2 pairs→0 | MATCH | `kalmanFilter.js:88-96` |
| **R² gate** | strict `>` 0.85 | `r2 > 0.85` | MATCH (intentional strict) | `kalmanFilter.js:175` |
| **Conjugate precision** | post_prec = w_p·prior_prec + N·w_i·lik_prec | `priorPrec*slopePrior + n*likPrec*slopeInput` | MATCH (E-03 partition fix valid) | `priorPosterior.js:115-118` |
| **Conjugate mean** | (w_p·prior_prec·μ_p + N·w_i·lik_prec·x̄)/post_prec | exact | MATCH; guarded post_prec≤0→prior | `priorPosterior.js:119-124` |
| **Conjugate sigma** | √(1/post_prec) | `Math.sqrt(1/posteriorPrecision)` | MATCH | `priorPosterior.js:125` |
| **Likelihood probs** | P(X<−σ), P(X>+σ), remainder; band ±σ about 0 | standardized via posterior (μ,σ); self-consistent | MATCH | `bayesianNutrition/index.js:124-148` |
| **Normal CDF (A&S 26.2.17)** | tail poly; |err|~7.5e-8 for x≥0 | as published; **Φ(0)≈0.505** small bias | MATCH (acceptable approx) | `index.js:88-103` |
| **95% CI** | μ ± 1.96σ | `mu ± 1.96*sigma` | MATCH | `index.js:160-164` |
| **Sample variance** | Σ(x−x̄)²/(n−1), Bessel | `…/(weightDeltas.length-1)`, n=1→prior var | MATCH | `index.js:289-292` |
| **Kcal floor filter** | drop kcalDaily < 1200; pass-through if absent/non-finite | `kcalDaily < 1200` → exclude | MATCH | `observationFilter.js:66`, `constants.js:290` |
| **Volume target** | MAV·persona·recovery·goal·block·phase, cap=min(raw,MRV) | exact, `Math.min(raw,MRV)`, round≥0 | MATCH | `periodization/volumeLandmarks.js:122-124` |
| **DELOAD multipliers** | vol 1−0.45=0.55, int 1−0.125=0.875 | 0.55 / 0.875 | MATCH | `periodization/constants.js:119-122` |
| **week%4 phase** | W1 LOAD / W2 LOAD+ / W3 PEAK / W4 DELOAD, OOR→W1 | `WEEK_PHASES[w] ?? WEEK_PHASES[1]` | MATCH | `mesocycle.js:27-32` |
| **RIR per phase** | LOAD+ −1, PEAK −2, floor 0 | `Math.max(0, base−1/−2)` | MATCH | `mesocycle.js:70-77` |
| **Block scaling** | M1 1.00 / M2 1.10 / M3 1.15 | as table | MATCH | `periodization/constants.js:129-133` |
| **Intensity corridor / goal** | per-goal floor/ceiling, default hipertrofie | switch; **no `slabire` case** | MISMATCH (F4) | `periodization/crossEngineHooks.js:99-108` |
| **Hard-cap intensity** | min(ceiling, 0.90); floor≤ceiling | `Math.min(…,0.90)`, `Math.min(floor,ceiling)` | MATCH | `crossEngineHooks.js:69-79` |
| **Energy ±15%/±10%** | DOWN −ceiling, UP +ceiling; T0 0.10 / T1+ 0.15 | `-ceiling` / `+ceiling`; `magnitudeT0=0.10`, `T1Plus=0.15` | MATCH | `bidirectionalAdjustment.js:189-227`, `constants.js:65-68` |
| **UP phase gate** | forbid PEAK + LOAD+ | `forbiddenPhases:['PEAK','LOAD+']` | MATCH (correct here) | `energyAdjustment/constants.js:92` |
| **Tempo high-intensity** | PEAK or **LOAD+** | `PEAK \|\| LOAD` (bare LOAD) | MISMATCH (F1) | `tempo/crossEngineHooks.js:58`, `tempo/constants.js:187-190` |
| **Deload Final_Depth** | MAX(45,60,30)+mods(cap 15), ext→60, clamp[0,100] | exact | MATCH | `deload/depthCalculator.js:64-90` |
| **Deload resolving** | step-down 45/2 = 22.5 | `depthScheduledPct/2` | MATCH | `depthCalculator.js:68` |
| **Composite trigger** | perf>15 ∧ rest>1.5 ∧ rir≥2 (3/3) | `>15`, `>1.5`, `>=2`, `metricsHit===3` | MATCH | `triggerHierarchy.js:51-57`, `constants.js:198-202` |
| **Intensity decrement** | −12.5%, RIR +1 | `12.5`, `1` | MATCH | `deload/constants.js:176-177` |
| **Brzycki 1RM** | w·36/(37−r), valid 1≤r≤12 | `weight*(36/(37-reps))`, guard `reps<1\|\|reps>12` | MATCH (divisor∈[25,36], never 0) | `weaknessDetector.js:25-28` |
| **Weak-group ratio** | orm/avg, avg>0 guard | `avg>0 ? orm/avg : 1`, `<0.8` weak | MATCH | `weaknessDetector.js:154-158` |
| **US Navy BF men** | 495/(1.0324−0.19077·log10(W−N)+0.15456·log10(H))−450 | exact, cm, guarded | MATCH | `usNavyBF.js:35-37` |
| **US Navy BF women** | 495/(1.29579−0.35004·log10(W+Hip−N)+0.22100·log10(H))−450 | exact | MATCH | `usNavyBF.js:29-31` |
| **Target-weight projection** | LBM=kg(1−BF/100); tgt=LBM/(1−tBF/100) | exact, BF<100 guards no div0 | MATCH | `usNavyBF.js:55-56` |
| **MMI start** | peak·startMult; buckets [6,12)0.80 [12,24)0.70 [24,∞)0.60 | exact, half-open | MATCH ADR 033 | `muscleMemoryIndex.js:23-25,61` |
| **MMI boost** | weeks 0..(N−1) → boostMult, else 1.0 | exact | MATCH | `muscleMemoryIndex.js:75-81` |
| **MMI applied weight** | start·boost | `mmiStart.startKg*boost` | MATCH (see N2) | `muscleMemoryAdapter.js:69` |
| **Macro: protein** | g = round(LBM·g/kg), midpoint 1.9 | `round(lbm*1.9)` (TOTAL g) | MATCH value; **key mislabels as per_kg** (F3) | `phaseAutoDetection.js:207,216` |
| **Macro: carb remainder** | (kcal−4·protG−9·fatG)/4, ≥0 | exact | MATCH | `phaseAutoDetection.js:212-213` |
| **computeLbm** | LBM = kg(1−BF) with BF as **fraction 0-1** | `kg*(1-bf)` only if `0<bf<1`, else kg·0.85 | MATCH in-module; cross-module unit clash (B1) | `phaseAutoDetection.js:172-181` |
| **Mood score** | mean of present components, [0,1] | `sum/count`, empty→0.5 | MATCH | `profileTyping.js:42-63` |
| **Hamming hysteresis** | \|inc−curr\|/\|curr\| > 0.15, curr=0 special | exact, guarded | MATCH | `profileTyping.js:99-106` |
| **Anti-spam cooldown** | floor((now−last)/DAY) < 28 | exact | MATCH | `profileTyping.js:204-205` |
| **Warmup duration** | midpoint(low, clamped high), low≤high | `round((low+high)/2)`, guard | MATCH; DELOAD reuses Energy-DOWN const (N3) | `durationCalculator.js:135,149` |
| **Mode×Phase clamp** | floor 0.80 / ceiling 1.20 vol+int | exact | MATCH | `trainingModifiers.js:145-158` |

---

## 2. New numeric bugs / drifts found beyond AUDIT-1

### B1 — MED · Cross-module BF% unit clash (fraction vs percent)
`goalAdaptation/computeLbm` (`phaseAutoDetection.js:172-181`), `isFatRichProfile` (`templates.js:65-70`) and the push-back risk scorer (`pushBackTiers.js:48-56`) all treat `user.bfPct` as a **fraction 0-1** (thresholds `bfPctHighMale: 0.25`, guard `bf > 0 && bf < 1`, tests use `0.25`/`0.30`). But `usNavyBF.estimateBF_USNavy` returns BF as a **percentage 2-60** (`usNavyBF.js:41`, e.g. `18.5`). The two are internally self-consistent within their own module, but the **field name `bfPct` and the JSDoc "BF% high (>=25%)" are ambiguous**, and any future wiring that feeds the US-Navy estimator output into `user.bfPct` will:
- in `computeLbm`: a real value like `20` fails `bf < 1` → silently falls through to the `kg*0.85` fallback (ignores the measured BF entirely);
- in `isFatRichProfile`/push-back: `20 >= 0.25` always true → every user flagged fat-rich / +1 risk.

No consumer wires these today (engine `recommendations:[]` V1), so blast radius is latent — but it is a genuine unit landmine for Stage-3 wiring, distinct from AUDIT-1's F3. The two engines disagree on the unit of the same conceptual quantity.

### B2 — LOW · ProfileTyping consecutive-count assumes most-recent-first ordering
`meetsConsecutiveQualifier` (`profileTyping.js:127-135`) and the count loop in `evaluateProfileTypingFlip` (`profileTyping.js:157-165`) `break` on the first session that is out-of-window (`daysAgo > 14`) or not aligned. This silently assumes `recentSessions` is sorted most-recent-first. If an oldest-first array is passed, the first element can be >14 days old → immediate break → qualifier never satisfied even with 2 recent aligned sessions (false flap-suppression). This is the same ordering fragility `weaknessDetector.js` explicitly hardened against (E-05 fix, ts-max selection). No arithmetic error; contract-dependent.

### B3 — NIT · trainingModifiers duplicate-operand branches (extends F2)
`resolveModeOverlay` (`trainingModifiers.js:36-37`): `m==='estetica' || m==='estetica'` and `m==='forta' || m==='forta' || …` — second operand identical to first (same copy-paste class as AUDIT-1 F2 in `volumeLandmarks.js:62,66`). Dead operand, no wrong output.

### N1 — Note · Q "×0.01" derivation is a fudge, not Forbes
`kalmanFilter.js:20-40` cap-comment claims the `×0.01` bridge lands Q in 0.17-0.30 kg/day, but its own inline Forbes math (`22 kcal/kg ÷ 7700 kcal/kg ≈ 0.0029`, i.e. ×0.00013) contradicts the `×0.01` it actually uses, and the worked Marius example yields 0.17 while the constant is 0.22. The code uses `22×0.01 = 0.22` consistently — the *number shipped is fine and conservative*, but the cited derivation is internally inconsistent (documented as "empirical bridge constant chosen to land Q in range"). Not a code bug; a comment that overstates a scientific basis.

### N2 — Note · MMI 6-12mo boost returns user to 100% of pre-pause peak
6-12mo bucket: `startMult 0.80 × boostMult 1.25 = 1.00×` peak in weeks 0-2. So a user 6-12 months detrained is started, during the boost window, at exactly their pre-pause max. (12-24mo → 0.77×, 24+ → 0.60×.) This is per ADR 033 table and bounded downstream by DP `roundToStep` + the conservative "MMI wins last" ordering, so not a math error — but it is the most aggressive MMI path and worth a product-safety glance for the 6-12mo persona.

### N3 — NIT · Warmup DELOAD clamp reuses the Energy-DOWN constant
`durationCalculator.js:135` clamps DELOAD upper bound to `SCHEMA_CONSTANTS.durationMaxEnergyDown` (=7), the same constant the Energy-DOWN branch uses at line 140. Comment (line 110/133) says "clamp to lower-tier upper bound". Behavior still shortens duration correctly; the constant is semantically mislabeled for the DELOAD branch (mislabel class, like AUDIT-1 F6).

---

## 3. Confirmation / refutation of F1 + F4

**F1 — CONFIRMED (HIGH).** `tempo/constants.js:187-190` `HIGH_INTENSITY_PHASES = { PEAK:'PEAK', LOAD:'LOAD' }`; `tempo/crossEngineHooks.js:58` `amplified = phase === PEAK || phase === LOAD`. The doc comments at `crossEngineHooks.js:3-4` and `constants.js:181` both say **"PEAK or LOAD+"**, and the sibling EnergyAdjustment correctly uses `['PEAK','LOAD+']` (`energyAdjustment/constants.js:92`). Mesocycle order is LOAD(W1,lightest)→LOAD+(W2,heavy)→PEAK(W3)→DELOAD(W4) (`periodization/constants.js:107-112`). So Tempo applies form-conservative tempo (`3-2-2-0`) on **W1 (light)** and **omits W2 LOAD+ (the actually-heavy week)** — inverted phase classification. Real logic bug, exactly as AUDIT-1 stated.

**F4 — CONFIRMED (MED).** `periodization/volumeLandmarks.js:64` `resolveGoalId` can return `'slabire'`. `periodization/constants.js:79` `GOAL_MODIFIERS` has **no `slabire` key** → `?? GOAL_MODIFIERS.hipertrofie` (1.00) at `volumeLandmarks.js:117`. `crossEngineHooks.js:99-108` `intensityCorridorForGoal` has **no `slabire` case** → default hipertrofie 0.70-0.85. So a weight-loss user receives full hypertrophy volume + a hypertrophy intensity corridor from Engine #1. Contrast: GoalAdaptation *does* map `slabire` (`goalAdaptation/constants.js:42`, template `slabire` rir 1-2 / rep 10-15). Taxonomy drift between #1 and #2, exactly as AUDIT-1 stated. (GoalAdaptation phase=CUT mitigates downstream; Periodization corridor itself remains wrong.)

---

## 4. NaN / divide-by-zero / negative-variance paths

**None reachable in the pure pipeline.** Every division is guarded:
- Kalman variance can never go negative: `Math.max(0, sigmaNewSq)` before sqrt (`kalmanFilter.js:134`); gain denominator `σ_pred²+R²` with R defaulted to 1.0 when ≤0 (`:123`).
- Conjugate: `posteriorPrecision <= 0 || !Number.isFinite` short-circuits to prior (`priorPosterior.js:119`); `sampleVar` floored to 1.0 when ≤0 (`:98`); `n===0` returns prior (`:103`).
- Brzycki divisor `37−reps` ∈ [25,36] (reps guarded 1-12) — never 0 (`weaknessDetector.js:26`).
- US Navy: `inner<=0`/`denom<=0` → null; BF clamped [2,60] (`usNavyBF.js`); projection guards BF<100 so `1−BF/100 ≠ 0`.
- R²: `ssTot===0 → 0`; <2 valid pairs → 0 (`kalmanFilter.js:86,95`).
- Mood: empty components → 0.5, no `/0` (`profileTyping.js:61`).
- Weak ratio: `avg>0 ? orm/avg : 1` (`weaknessDetector.js:155`).
- Hamming: `curr===0` special-cased (`profileTyping.js:103`).
- `validateKalmanState` rejects corrupt persisted `mu="NaN"`/negative sigma before any update (`kalmanFilter.js:216-240`).
- `normalCdf` returns 0.5 on non-finite input (`index.js:89`).

The only float imprecision is the Normal-CDF approximation (`Φ(0)≈0.505`, ~0.5% off at the origin) — cosmetic, sub-percent, and the result is re-normalized to sum to 1.0 (`index.js:136-147`).

---

## 5. Blunt math-correctness % for the brain

**~96%.**

Every core formula re-derived by hand — Kalman 1D (predict/gain/update/variance-floor), Normal-Normal conjugate (precision-weighted with valid E-03 slope partition), Brzycki, US-Navy Hodgdon-Beckett (metric, both sexes), LBM/target-weight projection, MMI lookup+boost, deload Final_Depth MAX+modifiers+60%-clamp, ±15%/±10% asymmetry, DELOAD 0.55/0.875, week%4, volume MAV·…·cap-at-MRV, macro carb-remainder, Mode×Phase ±20% clamp — **all arithmetically correct, with no reachable NaN/÷0/negative-variance path.** Defensive total-function discipline is genuinely Bugatti.

The 4-point deduction is for two real classification/taxonomy bugs that produce *wrong-but-finite* numbers: **F1** (Tempo high-intensity = bare LOAD instead of LOAD+ → form-conservative tempo fires on the wrong, lighter week and is absent on the heavy week) and **F4** (Periodization has no `slabire` goal → weight-loss user silently gets the hypertrophy volume+intensity corridor). Plus latent/cosmetic: **B1** cross-module BF% fraction-vs-percent unit landmine, **B2** ProfileTyping ordering fragility, **B3/N1/N2/N3** dead-operand / overstated-derivation / aggressive-MMI / mislabeled-constant. None throw, none crash; F1 and F4 are the two that change a user-facing prescription in the wrong direction and should be fixed before engine outputs are surfaced at full fidelity.
