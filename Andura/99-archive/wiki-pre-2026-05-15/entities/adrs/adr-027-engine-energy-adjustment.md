---
title: ADR 027 — Engine Energy Adjustment (Pipeline §42.10 3rd)
type: entity
subtype: adr
status: spec-reference
locked_date: 2026-05-06
authority: 03-decisions/027-engine-energy-adjustment.md SPEC REFERENCE redirect canonical ADR 026 §9.3 (26-28 decisions Cluster 1-5)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-026-offline-coaching-tree]]"
  - "[[adr-018-engine-extensibility-architecture]]"
  - "[[adr-022-bayesian-nutrition-inference]]"
  - "[[adr-009-calibration-tiers]]"
amendments: []
---

# ADR 027 — Engine Energy Adjustment

## Synthesis

ADR 027 = SPEC REFERENCE redirect-only (canonical SSOT ADR 026 §9.3). Engine Energy Adjustment = pipeline §42.10 **3rd position** (NU "Engine #5" legacy naming chat strategic spec session ordering). Adjusts session volume + intensity în Periodization Floor/Ceiling coridor based on user pre-session readiness signals (manual emoji 🟢🟡🔴 holistic input + drill-down strict 🔴 only Q15=C anti-Maria-65-friction).

**Decisions core LOCKED V1:** Bidirectional ±15% Q6=D conservative range tier-aware T0=±10% T1+=±15% Q13=B. Asymmetric trigger logic Q7=B (UP +15% requires N≥3 conditions cumulative + Periodization phase gate "high_intensity != true" anti "Sarcastic UP" Marius 5:1 săpt 4-5; DOWN -15% single trigger immediate). MRV invariant 1 immutable Q8=A + soft override sub-Floor max 2 consecutive → Engine Deload trigger Q9 anti-drift. Bayesian σ variance modifier Engine #3 Q12=C. Yo-yo anti-flap 3-session window V1 only Q14=D. Medical referral copy Gigel test PASS Q18=D verbatim "Consultă medicul de familie sau un specialist în medicină sportivă". Implementation `src/engine/energyAdjustment/` V1 LANDED commit `69ec9ce` Faza 2.5 batch 3 + 5 tests modules + bidirectionalAdjustment + crossEngineHooks + emojiAggregation + yoyoAntiFlap.

## Verbatim quotes Daniel

Daniel verbatim Q15=C anti-Maria-65-friction rationale (drill-down strict 🔴 only):
> *"Maria 65 ZERO friction. 🟢🟡 = no drill-down. 🔴 only = drill-down de ce. Anti-Maria-friction default."*

Daniel verbatim Q7=B asymmetric trigger anti "Sarcastic UP":
> *"UP +15% requires N≥3 conditions cumulative + Periodization phase gate. NU sarcastic UP Marius 5:1 săpt 4-5. DOWN -15% single trigger immediate — recovery imperative."*

## Bugatti framing notes

**Gigel test relevance:** Emoji 🟢🟡🔴 holistic input = zero gândire user (3 opțiuni clare). Drill-down strict 🔴 only = anti-Maria-friction (anti-paternalism cu engine pre-fill default Q15=C).

**Quality > Speed via tier-aware thresholds:** T0=±10% conservative / T1+=±15% trust earned. Pattern: trust calibrated cu tier progression.

**Anti-RE considerations:** Yo-yo anti-flap 3-session window V1 only Q14=D = anti-recurrence pattern (1 sesiune up → 1 down → 1 up = yo-yo flag, NU oscilație legitim). Pattern: detection require >=3 sesiuni signal consistency.

**Anti-paternalism notes:** Q18=D medical referral copy Gigel test PASS — engine NU diagnostichează, doar redirect la specialist. ZERO medical claim wording. User agency preserved.

## Cross-refs raw layer

- [[../../../03-decisions/027-engine-energy-adjustment]] §Redirect SPEC REFERENCE
- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §9.3 canonical 26-28 decisions Cluster 1-5
- [[../../../03-decisions/018-engine-extensibility-architecture]] §2 Standardized Dimension Contract evaluate(ctx) → EnergyAdjustmentResult
- [[../../../03-decisions/022-bayesian-nutrition-inference]] σ variance modifier Q12=C cross-engine integration
- [[../../../03-decisions/009-calibration-tiers]] §AMENDMENT 2026-05-05 Convergence Guard T2 Unlock tier-aware T0/T1+ thresholds Q13=B
- [[../../../📤_outbox/_archive/2026-05/149_HANDOVER_2026-05-05_birou_late_engines5-6-7_spec_sessions_CONSUMED]] Source 1 26-28 decisions Cluster 1-5
- [[../../../src/engine/energyAdjustment/]] V1 LANDED Faza 2.5 batch 3 commit `69ec9ce`

🦫 **ADR 027 SPEC REFERENCE Engine Energy Adjustment pipeline §42.10 3rd. Bidirectional ±15% tier-aware + asymmetric trigger + Yo-yo anti-flap + medical referral Gigel PASS.**
