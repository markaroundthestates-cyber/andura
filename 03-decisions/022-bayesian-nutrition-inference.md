# ADR 022 — Bayesian Nutrition Inference

**Status:** 🟢 **SPEC READY V1** (~32-35 decisions Cluster A-E LOCKED V1 chat strategic 2026-05-05 birou after) — populate post stub Faza 3
**Date:** 2026-05-04 (stub creation per §36.95 ADR Numbering Additive + §36.96 G + §36.100 Engine #3) + **2026-05-05 birou after (SPEC COMPLETE chat strategic Engines #3+#4+#5 spec sessions)**
**See also:** [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.95 (ADR Numbering Additive) + §36.100 Engine #3 (Bayesian Nutrition Engine roadmap) + §3.5.1 PRODUCT_STRATEGY_SPEC_v1 (Strong Prior tier-based) + [[017-demographic-prior-database]] (T0 prior baseline) + [[018-engine-extensibility-architecture]] (Dimension Registry plug-in foundation) + [[009-calibration-tiers]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" cross-cutting + [[../01-vision/PRODUCT_STRATEGY_SPEC_v1|PRODUCT_STRATEGY_SPEC]]

---

## Status

**SPEC READY V1** post chat strategic 2026-05-05 birou after Daniel + Claude (cluster engines #3+#4+#5 spec sessions). Cluster A-E LOCKED V1 ~32-35 decisions cumulative. Convergence Guard "T2 Unlock" architectural extension cross-cutting surfaced mid-Engine #3 — amendment ADR 009 inline (NU Engine #3 specific, behavioral validation rule cross-cutting all tier transitions).

CC implementation effort estimate: ~150-250h autonomous per §36.100 Engine #3.

---

## Context

Andura nutrition reasoning V1 = deterministic formulas (Mifflin-St Jeor / Harris-Benedict / Katch-McArdle) point estimates rigid → mismatch când user reportează BF% inaccurate sau activity level subjective. Need: Bayesian inference layer = posterior distribution care actualizează cu observații (weight delta + adherence + reported energy) → calibration time -50% per Strong Prior strategy §3.5.1 + aliniat SUFLET F1 Triangulation (interval estimat NU single point) + F6 Adaptive output no inference forced.

Pattern aliniat ADR 017 + 018: Bayesian Nutrition = dimension nouă plug-in via Dimension Registry. Tier-aware activation (T0 demographic prior baseline, T1+ Strong Prior 80% input + 20% baseline per §3.5.1 PRODUCT_STRATEGY_SPEC, T2+ behavioral inference erodează prior peste timp).

---

## Decision — Cluster A-E LOCKED V1

### Cluster A — Prior form + slope tier-based + decay + validation

- **A1 Prior distribution form:** **Gaussian Conjugate Prior** local-first JS tractable. NU Hierarchical Bayesian — V1 scope. Conjugate pair (Normal-Normal) closed-form posterior update — no MCMC, no JAX, runs device-side <50ms median.
- **A2 Strong Prior dynamic slope tier-based:** input-blend ratio scales cu data quantity:
  - Big 6 minim T0 = 70% prior / 30% input (low confidence — protect against single-data-point overshoot)
  - Big 6 + 14 zile observations T1 = 80/20 (per §3.5.1 baseline calibration time -50%)
  - Big 6 + Convergence Guard satisfied T2 = 90/10 (high confidence — inference erodează prior)
- **A3 Bayesian decay natural:** posterior(week N) = prior(week N+1). NU explicit decay rule — math-native, no exponential decay parameter to tune. Self-balancing per Conjugate update math.
- **A4 Validation strategy Hibrid:** synthetic personas pre-Beta (R²>0.85 simulator gate, Hall 2008 metabolic adaptation literature defaults) + real anonymized Beta cohort post v1.5+ (dietician panel corroborate, anti-overconfidence Mensa-grade validation Daniel push-back).
- **A5 Phase reset Hibrid:** CUT → BULK transition = Layer 1 (kcal_baseline) + Layer 2 (macro_split) RESET / preserve Layer 4 (Goal Shift Event Handler §36.35 streak preservation).

### Cluster B — Cadence + Kalman + volume metric + mood

- **B1 Adaptive cadence:** T1+ = weekly weigh-in + adherence rate (CDL-sourced). Daily fallback T0 = sparse weigh-ins acceptable, 14 zile observation buffer pre Profile Typing threshold.
- **B2 Kalman 1D peak craft cu 3 caveats:**
  - Caveat 1: defaults Hall 2008 literature (NIH metabolic adaptation rate ~22 kcal/kg LBM lost per Forbes equation)
  - Caveat 2: R²>0.85 validation gate pre-Beta simulator — fail = revert EWMA fallback
  - Caveat 3: EWMA fallback feature flag (`bayesian_kalman_v1` rollout per ADR 018 featureFlags pattern)
- **B3 Volume metric weighted compound:isolation 3:2:1:** Lower body compound (squat, deadlift, hip thrust) × 3 / Upper body compound (bench, OHP, row) × 2 / Isolation (curl, lateral raise, leg ext) × 1. Reflects metabolic disruption magnitude per movement category.
- **B4 Mood scoring Linear Sum Weighted normalized:** energy-readiness + emoji + sleep-self-report aggregate. LVM (latent variable model) defer v1.5 — V1 = simple weighted normalize (sum ÷ count, scale 0-1).

### Cluster C — Volume landmarks + cross-engine integration

- **C1 Volume landmarks Hibrid lookup + regression:** Israetel 11 grupuri musculare lookup baseline + regression personalized STRICT compound only (data quality high). Isolation graceful degradation 0.3× când compound observations <3 în window 14 zile (anti-overfit small-N isolation noise).
- **C2 Cross-engine #2 (Goal Adaptation) integration:** Engine #2 phase output (CUT/BULK/MAINTAIN/RECOMP) = Engine #3 prior conditioning input. Disagreement flag CDL când Engine #2 phase ≠ Engine #3 inferred phase (Invariant 5 Medical Safety protect — disagreement = Tier 1 silent flag, NU autonomous override).
- **C3 Cross-engine #5 (Energy Adjustment) integration:** Engine #5 readiness output = pre-processing modulator Engine #3 variance σ. NU linear discount — readiness scăzut crește σ observații recent semnalând zgomot inflamație/stres/cortisol (Mensa-grade insight Gemini articulated). Neutral fallback T0 cold start (sigma_modifier = 1.0 default until 14 zile observations).

### Cluster D — Schema + output + threshold + UI tier

- **D1 Schema:** standard `nutrition_inference_metadata` field în CDL session entry:
  ```
  nutrition_inference_metadata: {
    prior: { mu, sigma, source: 'demographic_prior' | 'posterior_n_minus_1' },
    posterior: { mu, sigma, observations_count: N, ci_lower, ci_upper },
    observations: [ /* N=20 rolling window */ ],
    confidence_interval: { lower, upper, level: 0.95 }
  }
  ```
- **D2 Output structure:** `{deficit_likelihood, surplus_likelihood, maintenance_likelihood}` probabilities (sum = 1.0). NU absolute kcal output — **hard rule preserved §3.5.1 NEVER specific kcal recommendation**.
- **D3 Profile Typing threshold:** Adaptive 0.55-0.85 T1+ cu 0.70 default T0. Hamming hysteresis 15% — anti-flap profile change (don't flip-flop între phases on noise). 2 sesiuni consecutive 14 zile window = qualifier explicit.
- **D4 UI tier:** Tier 1 silent (CDL log only) + Tier 2 banner discret (informational, NU action-required). NU blocking modal — Maria 65 autonomy preserve. Tier 3 (modal blocking opt-in) reserved for explicit Engine #2 Goal Shift trigger, NU Engine #3 inference.
- **D5 Hard rule preserved §3.5.1:** NEVER specific kcal output în UI. Bugatti differential vs MFP/Lose-It (specific kcal pseudo-precision Maria 65 confusion).
- **D6 Anti-spam aliniat Engine #2:** 28 zile rolling cooldown re-prompt when phase transition detected. Max 4 prompts/year cap.

### Cluster E — Validation panel + edge cases

- **E1 Validation panel Hibrid:** simulator R²>0.85 pre-Beta (synthetic personas Hall 2008 metabolic adaptation literature — Marius advanced 4-6 săpt CUT, Maria 65 maintenance, Gigica intermediate BULK) + dietician panel post-Beta v1.5 corroborate (N validators × M users sample, anti-overconfidence Mensa-grade gate).
- **E2 Edge cases Hibrid Passive Mode tripwire:** pregnant + post-bariatric + kidney disease = Passive Mode tripwire (engine NU output adjustment, deferral medical care). Special priors: >75 ani + ED history (eating disorder) = special priors set + disclaimer onboarding ("Andura NU înlocuiește sfat medical").
- **E3 Convergence Guard "T2 Unlock" cross-cutting ADR 009:** see [[009-calibration-tiers]] §AMENDMENT 2026-05-05 birou after — formula final post 5 iterations refinement.

### Cluster Convergence Guard "T2 Unlock" cross-cutting (NEW arhitectural extension ADR 009)

**Surfaced mid-Engine #3 spec session — Daniel push-back fundamental seminal:** *"T2 = Behavioral Validation NOT just statistical convergence"* — engine trebuie observe self-report aliniază realitate biologică CDL ÎNAINTE adaptări agresive. Eu (Claude) am gândit pure math, Daniel a articulat scope adevărat T2.

**Formula final post 5 iterations refinement:**

```
T2 Unlock = (
  30% reducere σ²(prior_t-1, posterior_t)
  OR
  σ < MAX(10% kcal_baseline, 200 kcal absolute floor)
  OR
  σ < 5% body_weight proportional
)
AND N ≥ 10 sesiuni cu (outcome.executed && volume_adherence_vs_pain_adjusted ≥ 80%)
AND max 2 Pain-Aware sesiuni din ultimele 10
```

**Rationale per condition:**
- σ² 30% reducere = primary statistical convergence signal
- σ MAX(10% kcal_baseline, 200 kcal absolute floor) = pragmatic noise floor (food tracking realitate ±200 kcal natural — Daniel push-back pragmatic protejare Maria 65)
- σ < 5% body_weight proportional = scale for very-low-kcal-baseline edge cases (Maria 65 small frame, kcal_baseline mic înseamnă 10% absolute trivial)
- N ≥ 10 sesiuni = minimum statistical power
- volume_adherence_vs_pain_adjusted ≥ 80% = Daniel push-back rejection brittle deviation (swap bar→gantere = signal metabolic VALID, NU penalize substitution)
- max 2 Pain-Aware sesiuni din ultimele 10 = anti-T2-progress-via-pain-ignoring (Gigel guardrail, "Bugatti hits guardrail real")

**Pain-Aware definition (Hybrid Spec V1):**
- **(a) STRICT user-triggered Pain Button only** — NU engine proactive DELOAD/Energy/Goal phase modifiers. Clean signal monitor only USER FRICTION (decoupling safety/reward Invariant 5 Medical Safety per Clean Signal rule)
- **(i) BINARY V1** — any click during session → full session `pain_aware: true`
- **Forward-compat v1.5 silent vector:** `pain_trigger_set: [index_set]` in CDL metadata. V1 = collect silent (NU acted upon). V1.5 = threshold rule (>50% sets affected = stricter T2 gate). ZERO schema migration required (additive field).

**UX wording Pain Button preserve EXACT:**
> "Siguranța e pe primul loc. Am ajustat restul sesiunii."

ZERO T2 disclosure (anti-regret + anti-behavioral conditioning Gigel ignoring pain pentru T2 progress = "Bugatti hits guardrail real").

---

## Consequences

### Positive

- **Calibration time -50%** per Strong Prior dynamic slope tier-based vs naive deterministic Mifflin-St Jeor (§3.5.1 PRODUCT_STRATEGY)
- **Bugatti differential vs MFP/Lose-It** — Bayesian posterior CI (interval estimat) NU pseudo-precision specific kcal point estimate
- **Mathematical clean** — Conjugate pair closed-form, NU MCMC, runs device-side <50ms (ADR 026 Q8.1 budget compliant)
- **Forward-compat v1.5** Pain-Aware silent vector + LVM mood + dietician panel + RIR/Tempo gate = ZERO schema migration paths preserved
- **Cross-engine integration clean** — disagreement flag CDL Engine #2 + variance σ modifier Engine #5 = principled coupling, NU monolithic
- **Convergence Guard "T2 Unlock"** = behavioral validation NOT just statistical (Daniel articulation) — anti-Bugatti-fakery T2 unlock when self-report misaligns biology
- **Maria 65 autonomy preserve** — Tier 1+2 only NU blocking modal, 28 zile cooldown anti-spam

### Negative

- **Implementation effort ~150-250h CC autonomous** per §36.100 Engine #3 (Bayesian inference + cross-engine integration + CDL schema extension + Profile Typing threshold + simulator R²>0.85 gate)
- **Validation gate pre-Beta R²>0.85 simulator** = blocking gate (fail = revert EWMA fallback feature flag)
- **Dietician panel post-Beta v1.5 cost** — N validators × M users sample (Mensa-grade anti-overconfidence)
- **Convergence Guard "T2 Unlock" complexity** — multi-condition formula (5 conditions AND/OR) = test surface area substantial (Property-based + Golden Master per ADR 026 Q7 3-tier test suite)

### Risks

- **Kalman 1D divergence on edge cases** (very-old + ED history + post-bariatric) — mitigation: Hibrid Passive Mode tripwire + Special priors + EWMA fallback feature flag
- **Profile Typing flap** between phases on noise — mitigation: 15% Hamming hysteresis + 2 sesiuni consecutive 14 zile window
- **Engine #2 disagreement cascade** — Engine #2 says BULK + Engine #3 inferred CUT = which wins? Decision: Engine #2 phase = blueprint authority, Engine #3 disagreement = Tier 1 silent flag CDL only (NU autonomous override Invariant 5 Medical Safety protect)
- **Pain-Aware threshold v1.5 retroactive** — `pain_trigger_set` vector forward-compat ZERO migration, but legacy V1 sessions = silent flag binary only (acceptable trade-off, V1.5 retroactive aware via vector availability)

---

## Reconsideration Triggers

1. **Simulator R²<0.85 pre-Beta** → revert EWMA fallback feature flag, defer Bayesian Kalman 1D rollout v1.5+
2. **Engine #2 disagreement >15% sessions** → re-evaluate disagreement Tier 1 silent vs banner Tier 2 escalation
3. **Profile Typing flap rate >5% week-over-week** → tighten Hamming hysteresis 15% → 20% or extend qualifier 2 sesiuni → 3 sesiuni
4. **Pain-Aware false-positive rate >10%** (user clicks Pain Button without genuine pain — exploration / curiosity) → revisit binary V1 → threshold rule (>50% sets) earlier than v1.5
5. **Dietician panel post-Beta v1.5 corroboration <80%** → re-evaluate Bayesian framework altogether (potential pivot Hierarchical Bayesian or full-LLM-as-judge approach)

---

## Cross-references

- [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.95 (ADR Numbering Additive — split rationale) + §36.100 (7 Engines roadmap, Engine #3) + §3.5.1 cross-ref PRODUCT_STRATEGY_SPEC_v1 Strong Prior tier-based + §36.41 Composite Signal cross-ref + §36.82.3 deload prompt cross-ref
- [[017-demographic-prior-database]] (T0 baseline, K-NN K=10, 6 anchor personas + 44 edge cases + 450 algorithmic = 500 profiles)
- [[018-engine-extensibility-architecture]] (Dimension Registry plug-in pattern — Bayesian Nutrition = new dimension)
- [[009-calibration-tiers]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" (cross-cutting architectural extension surfaced mid-Engine #3)
- [[011-coach-decision-log-architecture]] (CDL schema extension target for `nutrition_inference_metadata` + `pain_aware` + `pain_trigger_set` forward-compat v1.5)
- [[../01-vision/PRODUCT_STRATEGY_SPEC_v1|PRODUCT_STRATEGY_SPEC]] §3.5.1 (Strong Prior 80% input + 20% baseline calibration time -50%)
- [[../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE_SPEC]] (5 voices + 27 reguli arbitration — Bayesian verdict feeds REALTIME + PROJECTION voices + Triangulation F1 SUFLET)
- [[ADR_PAIN_DISCOMFORT_BUTTON_v1]] (Pain-Aware definition (a) STRICT user-triggered + (i) BINARY V1 cross-ref)
- [[026-offline-coaching-decision-tree-exhaustive]] (Engine #3 ~32-35 decisions consumate engine spec, NU branches enumeration)

---

🦫 **Stub Faza 3 → SPEC READY V1 chat strategic 2026-05-05 birou after. Convergence Guard "T2 Unlock" architectural extension cross-cutting ADR 009 (NU Engine #3 specific). Bugatti paradigm: behavioral validation NOT just statistical convergence + Maria 65 autonomy preserve + Pain-Aware Hybrid Spec V1 binary + forward-compat v1.5 vector ZERO migration. ZERO fabrication, zero scope creep. Engine #3 of 7 prescriptive engines roadmap §36.100 SPEC COMPLETE.**
