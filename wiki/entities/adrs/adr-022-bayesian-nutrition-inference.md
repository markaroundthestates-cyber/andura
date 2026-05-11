---
title: ADR 022 — Bayesian Nutrition Inference (Engine 8 Pipeline §42.10)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-30
authority: 03-decisions/022-bayesian-nutrition-inference.md Bayesian inference TDEE + BMR + macro adaptive Kalman filter
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-026-offline-coaching-tree]]"
  - "[[adr-015-getbf-calibration-only]]"
  - "[[../../concepts/moat-strategy]]"
amendments: []
---

# ADR 022 — Bayesian Nutrition Inference

## Synthesis

ADR 022 = Bayesian Nutrition Inference engine. Estimate TDEE + BMR + macro adaptive cu Kalman filter prior posterior update post observation (weight + intake + activity). LOCK V1 2026-04-30. Replaces hardcoded "2000 kcal" placeholder pre-fix; getPhase pipeline §42.10 Engine 8 (Bayesian Nutrition). Cross-ref ADR 015 getBF calibration only (BF metric input). Bug fix STAGE 2 prod bugs reconcile 2026-05-11 P1-FLAG-PROD-AUTO-FAZA + P1-FLAG-PROD-BF-EDIT RESOLVED commit `c7d8457` + `05ba372` (sys.js drop pilotActive gate AUTO branch + Katch-McArdle BF-aware când finite + Mifflin fallback). Tests 14/14 PASS preserved + 5 regression (T4a + T4b + T8 + T_AUTO_pre_pilot + T_BF_edit_recalc). Sub-modules: priorPosterior + profileTyping + kalmanFilter + volumeLandmarks + crossEngineHooks (in `src/engine/bayesianNutrition/`).

## Verbatim quotes Daniel

Daniel verbatim chat ACASĂ 2026-04-30 Bayesian engine rationale:
> *"Bayesian inference adaptive — Kalman filter prior posterior. TDEE estimate refined chat-to-chat. NU hardcoded 2000 kcal."*

Daniel verbatim chat ACASĂ 2026-05-11 P1-FLAG-PROD-AUTO-FAZA + P1-FLAG-PROD-BF-EDIT bug fix rationale (catalysator slip "2000 kcal hardcoded" stale):
> *"in prod nu mai e nimic hardcoded. drop pilotActive gate. Katch-McArdle BF-aware când finite, Mifflin fallback. fix prod bugs reconcile."*

Daniel verbatim chat ACASĂ 2026-05-11 mea culpa scribe post slip "2000 kcal hardcoded":
> *"halucinezi presupunere stale. cauta in cod."*

## Bugatti framing notes

**Gigel test relevance:** Bayesian inference = engineer-side complexity. Gigel UX surface = single line `🎯 Azi: ${kcal} kcal · ${prot}g protein` (F9 BMR strip simplified, V1_FEATURES_AUDIT verdict).

**Quality > Speed via Kalman filter:** Adaptive update prior posterior post observation = continuous learning user-specific. NU hardcoded baseline 2000 kcal one-size-fits-all.

**Anti-RE considerations:** Prod bugs reconcile STAGE 2 2026-05-11 = anti-recurrence "2000 kcal hardcoded" claim (Daniel handover stale ref → ground truth git verify revealed fix landed `05ba372` previous chat). §AR.3 Ground Truth Git Verify trigger.

**Anti-paternalism notes:** Bayesian NU = "we know better than user". Adaptive = respect user-specific signal (weight trend + intake variation + activity context). User can edit BF + Bayesian recalc downstream.

**Voice tone notes:** Daniel-ism "halucinezi presupunere stale" + "cauta in cod" recurring §AR.3 trigger pattern. Pre-flight grep filesystem ÎNAINTE referenced paths.

## Cross-refs raw layer

- [[../../../03-decisions/022-bayesian-nutrition-inference]] (Bayesian inference ADR)
- [[../../../03-decisions/015-getbf-calibration-only]] (BF metric input)
- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §42.10 Engine 8 Bayesian Nutrition
- [[../../../src/engine/bayesianNutrition/]] (sub-modules priorPosterior + profileTyping + kalmanFilter + volumeLandmarks + crossEngineHooks)
- [[../../../src/engine/sys.js]] (lines 54-67 estimateTDEE Katch-McArdle BF-aware + Mifflin fallback)
- [[../../../03-decisions/DECISION_LOG]] §2026-05-11 STAGE 2 Prod bugs reconcile P1-FLAG-PROD-AUTO-FAZA + P1-FLAG-PROD-BF-EDIT RESOLVED commit `c7d8457`
- [[../../../DIFF_FLAGS]] §P1-FLAG-PROD-AUTO-FAZA-2026-05-10 RESOLVED + §P1-FLAG-PROD-BF-EDIT-KCAL-2026-05-10 RESOLVED

🦫 **ADR 022 Bayesian Nutrition Inference LOCK V1 2026-04-30. Engine 8 pipeline §42.10. Kalman filter prior posterior adaptive. Prod bugs reconcile RESOLVED 2026-05-11.**
