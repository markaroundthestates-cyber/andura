# ADR 022 — Bayesian Nutrition Inference

**Status:** 🟡 **STUB / PENDING SPEC** (file create per Vault Hygiene Sprint Faza 3, 2026-05-04 — full spec deferred to dedicated chat strategic NEW post Auth Flow §36.80)
**Date:** 2026-05-04 (stub creation per §36.95 ADR Numbering Additive + §36.96 G + §36.100 Engine #3)
**See also:** [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.95 (ADR Numbering Additive) + §36.100 Engine #3 (Bayesian Nutrition Engine roadmap) + §3.5.1 PRODUCT_STRATEGY_SPEC_v1 (Strong Prior tier-based) + [[017-demographic-prior-database]] (T0 prior baseline) + [[018-engine-extensibility-architecture]] (Dimension Registry plug-in foundation) + [[../01-vision/PRODUCT_STRATEGY_SPEC_v1|PRODUCT_STRATEGY_SPEC]]

---

## ⚠️ STATUS — STUB

**Provenance:** ADR 022 referenced 9+ ori în vault (PRODUCT_STRATEGY §3.5.1 + DECISION_LOG + HANDOVER §29.7 + §28.6 + §29 + ADR_MULTI_TENANT_AUTH fixture name + MULTI_TENANT_AUTH_MIGRATION_SPEC §334) FĂRĂ file fizic. Audit Vault Hygiene Faza 1 §2 a detectat ca **ORPHAN-1 finding HIGH**. §36.95 a decis SPLIT scope ambiguu (Bayesian Nutrition + Goal-Driven Templates) → ADR 022 = Bayesian Nutrition Inference (acest file) + ADR 024 = Goal-Driven Templates ([[024-goal-driven-program-templates]]).

**Acest stub = placeholder pentru spec full PENDING.** Daniel chat strategic dedicat NEW post Vault Hygiene + Auth Flow §36.80 va genera spec complet (estimate ~2-4h chat strategic + ~150-250h CC autonomous per §36.100 Engine #3).

---

## Scope summary (stub level)

**Decision domain:** Bayesian inference layer pentru nutrition (kcal + macro) calculations cu adjustment per phase × goal × age × BF% × activity.

**Pattern aliniat ADR 017 + 018:** Bayesian Nutrition = dimension nouă plug-in via Dimension Registry. Tier-aware activation (T0 demographic prior baseline, T1+ Strong Prior 80% input + 20% baseline per §3.5.1 PRODUCT_STRATEGY_SPEC, T2+ behavioral inference erodează prior peste timp).

**Why Bayesian (vs deterministic formula):**
- Mifflin-St Jeor / Harris-Benedict / Katch-McArdle = point estimates rigid → mismatch când user reportează BF% inaccurate sau activity level subjective
- Bayesian inference = posterior distribution care actualizează cu observații (weight delta + adherence + reported energy) → calibration time -50% per Strong Prior strategy
- Aliniat SUFLET F1 Triangulation (interval estimat NU single point) + F6 Adaptive output no inference forced

---

## Open Questions (PENDING chat strategic NEW)

1. **Prior distribution form:** Gaussian per kcal target (μ = formula estimate, σ = function of T0/T1/T2 confidence)? Or hierarchical Bayesian cu population-level priors din ADR 017 demographic database?
2. **Likelihood update cadence:** Weekly weigh-in + adherence rate (CDL-sourced)? Daily fallback dacă weigh-ins sparse?
3. **Macro split inference:** Prior fixed (40C/30P/30F default) sau learned din user behavior + goal?
4. **Phase transitions** (CUT → MAINTAIN → BULK): how Bayesian posterior carries over vs reset?
5. **Cross-engine integration:** how Bayesian Nutrition Engine consumes Goal Adaptation Engine output ([[024-goal-driven-program-templates]]) + Energy Adjustment Engine signals (§36.100 Engine #5)?
6. **CDL schema extension:** new `nutrition_inference_metadata` field — prior + posterior + observations vector + confidence interval per session?
7. **Edge cases:** post-bariatric / pregnant / lactating / very-old (>75) populations — special priors sau exclusion (Passive Mode tripwire)?
8. **Validation criteria:** ground truth comparison vs registered dietician panel? N validators × M users sample? Acceptance threshold (R² > 0.85)?

---

## Cross-references

- [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.95 (ADR Numbering Additive — split rationale) + §36.100 (7 Engines roadmap, Engine #3) + §3.5.1 cross-ref PRODUCT_STRATEGY_SPEC_v1 Strong Prior tier-based
- [[017-demographic-prior-database]] (T0 baseline, K-NN K=10, 6 anchor personas + 44 edge cases + 450 algorithmic = 500 profiles)
- [[018-engine-extensibility-architecture]] (Dimension Registry plug-in pattern — Bayesian Nutrition = new dimension)
- [[009-calibration-tiers]] (T0/T1/T2 confidence axis controls Bayesian prior strength)
- [[011-coach-decision-log-architecture]] (CDL schema extension target for `nutrition_inference_metadata`)
- [[../01-vision/PRODUCT_STRATEGY_SPEC_v1|PRODUCT_STRATEGY_SPEC]] §3.5.1 (Strong Prior 80% input + 20% baseline calibration time -50%)
- [[../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE_SPEC]] (5 voices + 27 reguli arbitration — Bayesian verdict feeds REALTIME + PROJECTION voices)

---

🦫 **Stub created Faza 3. Full spec PENDING dedicated chat strategic post Vault Hygiene + Auth Flow §36.80. ZERO fabrication, zero scope creep. Placeholder honors §36.95 ADR Numbering Additive + ORPHAN-1 resolution.**
