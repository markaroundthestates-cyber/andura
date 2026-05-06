# ADR 027 — Engine Energy Adjustment

**Status:** 🔵 **SPEC REFERENCE** (canonical SSOT în [[026-offline-coaching-decision-tree-exhaustive]] §9.3 — flipped 2026-05-06 evening chat-8 din 🟡 STUB legacy, redirect-only)
**Date:** 2026-05-05 (initial stub creation Vault Hygiene CC TASK 4) → **2026-05-06 evening chat-8 acasă FLIP STUB → SPEC REFERENCE** (post pipeline §42.10 V1 closure 8/8 cleanup batch)
**Pipeline §42.10 position:** **3rd** (NU "Engine #5" naming legacy chat strategic spec session ordering 2026-05-05 birou late — pipeline §42.10 canonical position 3rd)
**Implementation:** `src/engine/energyAdjustment/` V1 LANDED commit `69ec9ce` (Faza 2.5 batch 3)
**See also:** [[026-offline-coaching-decision-tree-exhaustive#§9.3 Engine Energy Adjustment Module-Level Spec V1|ADR 026 §9.3]] (canonical 26-28 decisions Cluster 1-5 verbatim 2-way parity ✅) + `149_HANDOVER_2026-05-05_birou_late_engines5-6-7_spec_sessions_CONSUMED.md` (Source 1) + [[../00-index/CURRENT_STATE|CURRENT_STATE]] §RECENT 2026-05-05 birou late entry (Source 2)

---

## ⚪ STATUS — SPEC REFERENCE (redirect-only, post stub flip)

This ADR was **flipped from 🟡 STUB → 🔵 SPEC REFERENCE** în vault hygiene cleanup batch post-pipeline §42.10 V1 closure 8/8 (2026-05-06 evening chat-8 acasă). The canonical specification lives în [[026-offline-coaching-decision-tree-exhaustive]] §9.3 (commit `2f9aa79` 2026-05-06 afternoon chat-4 acasă, +177 LOC, 26-28 decisions Cluster 1-5 verbatim, 2-way parity ✅ Source 1 `149_HANDOVER` Engine #5 Energy section + Source 2 CURRENT_STATE §RECENT 2026-05-05 birou late).

---

## Redirect

> **For canonical decisions, Cluster 1-5 breakdown, sources, parity check evidence, and Reconsideration Triggers, see [[026-offline-coaching-decision-tree-exhaustive#§9.3 Engine Energy Adjustment Module-Level Spec V1|ADR 026 §9.3]].**

---

## Scope summary (1-line)

Engine Energy Adjustment — adjusts session volume + intensity within Periodization Floor/Ceiling coridor based on user pre-session readiness signals (manual emoji 🟢🟡🔴 holistic input + drill-down strict 🔴 only Q15=C anti-Maria-65-friction). Bidirectional ±15% Q6=D conservative range tier-aware T0=±10% T1+=±15% Q13=B, asymmetric trigger logic Q7=B (UP +15% requires N≥3 conditions cumulative + Periodization phase gate "high_intensity != true" anti "Sarcastic UP" Marius 5:1 săpt 4-5; DOWN -15% single trigger immediate). MRV invariant 1 immutable Q8=A + soft override sub-Floor max 2 consecutive → Engine Deload trigger Q9 anti-drift, Bayesian σ variance modifier Engine #3 Q12=C, Yo-yo anti-flap 3-session window V1 only Q14=D, medical referral copy Gigel test PASS Q18=D verbatim "Consultă medicul de familie sau un specialist în medicină sportivă". Pipeline §42.10 3rd canonical (NU "Engine #5" legacy naming).

---

## Naming clarification

Source 1+2 reference "Engine #5 Energy Adjustment" = chat strategic spec session ordering legacy (2026-05-05 birou late 3-engine cluster #5+#6+#7 spec session) NU pipeline §42.10 canonical position. Pipeline §42.10 canonical: Periodization (1st) → Goal Adaptation (2nd) → **Energy Adjustment (3rd)** → Bayesian Nutrition (4th) → Tempo (5th) → Specialization (6th) → Warm-up (7th) → Deload (8th).

---

## Cross-refs

- [[026-offline-coaching-decision-tree-exhaustive#§9.3 Engine Energy Adjustment Module-Level Spec V1|ADR 026 §9.3]] — canonical SSOT (26-28 decisions Cluster 1-5)
- [[018-engine-extensibility-architecture]] §2 Standardized Dimension Contract (`evaluate(ctx) → EnergyAdjustmentResult`)
- [[022-bayesian-nutrition-inference]] σ variance modifier Q12=C cross-engine integration
- [[009-calibration-tiers]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" — tier-aware T0/T1+ thresholds Q13=B
- [[ADR_OUTLIER_FILTER_v1]] §EXT-1 streak counter cross-ref Yo-yo anti-flap Q14=D
- [[030-adapter-design-pattern]] D1-D5 LOCKED V1 foundation Hexagonal
- [[ADR_PAIN_DISCOMFORT_BUTTON_v1]] Pain-Aware Clean Signal rule preserved §9.4.6 (Engine Energy NU proactive trigger Cluster 5)

---

**Implementation reference:** `src/engine/energyAdjustment/` V1 LANDED commit `69ec9ce` (Faza 2.5 batch 3, 8 source modules + 5 test files, +112 tests 1786→1898 PASS, surgical yoyo bug fix pre-commit transparency Bugatti craft test layer caught bug pre-prod ZERO src bug post-fix).
