---
title: ADR Composite Signal Layer v1 (3/3 Simultaneous Threshold Arbitration)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-05-02
authority: 03-decisions/ADR_COMPOSITE_SIGNAL_LAYER_v1.md LOCKED V1 per ALIGNMENT_QUESTIONS Q1 Daniel response BATCH_05 final Sprint 4.x cluster
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-cascade-defense]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[adr-013-auto-aggression-detection]]"
amendments: []
---

# ADR Composite Signal Layer v1

## Synthesis

ADR_COMPOSITE_SIGNAL_LAYER = arbitration intermediate între engines individuale (ProactiveEngine + StagnationDetector + RuleEngine) și CASCADE_DEFENSE final arbiter. Engines individuale pot da false positives la triggers individuali — Maria 65 cu o sesiune slabă declanșează deload prematur, Marius 25 cu RPE inflated declanșează push prematur. Single-metric arbitrary thresholds (e.g., 50% scor cumulative) = false positive rate observat ~30% în synthetic data Chat C analysis. Origine §36.41 Chat C SELF-CORRECTION EXTENSION.

**Decision: Composite Signal Layer declanșează DOAR când 3 metrici simultan abnormal** (3/3 simultaneous threshold per §36.41 — NU cumulative score):
1. **Performance Drop** > 15% volume reduction vs rolling avg 3 sesiuni anterior
2. **Rest Time Multiplier** > 1.5× normal pe exercițiu (signal recuperare insuficientă)
3. **RIR Mismatch** ≥ 2 (declared RIR off de actual rep failure)

**Lifecycle state machine:** Idle → Flagged (3/3 detected) → Cooldown (3 sesiuni post-flag, NU re-trigger imediat) → Resolving (2 sesiuni clean → flag cleared) → Idle. Output: `composite_signal_active: true` flag → CASCADE_DEFENSE Layer D budget ≤50ms arbitration decide action (deload preventiv vs continue cu monitoring). Backwards-compatible cu existing engines — Composite Signal ortogonal NU înlocuiește ProactiveEngine/StagnationDetector.

## Verbatim quotes Daniel

Daniel verbatim Q1 ALIGNMENT response §36.41 3/3 simultaneous AND logic rationale:
> *"Composite Signal declanșează DOAR când 3 metrici simultan abnormal. NU cumulative score 50% arbitrary. 3/3 AND logic — Performance Drop 15% + Rest Time 1.5× + RIR Mismatch 2. False positive rate ~30% single-metric → near-zero 3/3."*

Daniel verbatim lifecycle cooldown anti-hyperreactive pattern:
> *"Lifecycle cooldown 3 sesiuni post-flag. NU re-trigger imediat. Resolving 2 sesiuni clean → flag cleared. Anti-hyperreactive coach pattern F-NEW-3 cooldown principle."*

## Bugatti framing notes

**Gigel test relevance:** Composite Signal NU user-facing direct — invisible behind CASCADE_DEFENSE Layer D decision. User vede output (deload preventiv OR continue) NU input (3 metrici flags).

**Quality > Speed via 3/3 AND logic:** False positive reduction (~30% → near-zero) via 3-metric simultaneous threshold. NU detectează drift gradual cu DOAR 1-2 metrici = acceptable trade-off (Bayesian σ variance Engine #3 handles single-metric early signal cross-engine).

**Anti-RE considerations:** Threshold tuning post-launch (Performance Drop 15% / Rest Time 1.5× / RIR Mismatch 2 = initial estimates; A/B post-data). Reconsideration trigger explicit. Pattern: ship V1 LOCKED initial estimates + monitor post-Beta calibration.

**Anti-paternalism notes:** Output `composite_signal_active: true` → CASCADE_DEFENSE Layer D arbitration (budget ≤50ms) decide action, NU auto-blocaj. User downstream în Layer D engine logic, NU forced override silent.

## Cross-refs raw layer

- [[../../../03-decisions/ADR_COMPOSITE_SIGNAL_LAYER_v1]] §Decision 3/3 simultaneous threshold verbatim
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.41 Chat C SELF-CORRECTION EXTENSION origin
- [[../../../03-decisions/ADR_CASCADE_DEFENSE_v1]] Layer D Final Arbiter integration budget ≤50ms
- [[../../../03-decisions/013-auto-aggression-detection]] AA detector cross-ref (potential signal feed-in)
- [[../../../03-decisions/011-coach-decision-log-architecture]] CDL extension `rest_seconds_per_set` field schema dependency
- [[../../../03-decisions/DECISION_LOG]] §2026-05-02 ALIGNMENT_QUESTIONS Q1 LOCK V1

🦫 **ADR Composite Signal Layer LOCKED V1 2026-05-02. 3/3 simultaneous threshold (Performance Drop + Rest Time + RIR Mismatch). Lifecycle Idle→Flagged→Cooldown→Resolving. False positive rate near-zero vs 30% single-metric. CASCADE_DEFENSE Layer D integration.**
