---
title: Spec Faza 2 Filter Strategy V1 — Consume flagged_only.json → Claude Reasoning Fill + Daniel Policy Lock
type: entity-spec
status: draft
last_updated: 2026-05-12
cross_refs:
  - "[[../../../04-architecture/FAZA_2_FILTER_STRATEGY_V1]]"
  - "[[spec-scenarios-simulator]]"
  - "[[spec-andura-validation-framework]]"
---

# Spec Faza 2 Filter Strategy V1

## Synthesis

**FAZA_2_FILTER_STRATEGY_V1** = Status SPEC DRAFT V1 pending Daniel LOCK pre Faza 2 chat-uri kickoff (§7 Pre-Beta gate criteria sync'd 2026-05-10 cu ANDURA_VALIDATION_FRAMEWORK_V1 §7 LOCKED V1 2026-05-05 evening: Gate 1 ≥95% strict + Gate 2 DROPPED + Gate 3 selective Daniel review). **Authority:** workflow plan post simulator delivery for Claude reasoning fill + Daniel product policy lock.

**§1 TRIGGER:** Post simulator (Artefact 2 + 3) delivery complete: `simulations/scenarios_coverage_v1.json` full report toate branches + `simulations/scenarios_coverage_v1_flagged_only.json` subset issues only. Faza 2 = consume `flagged_only.json` → Claude reasoning fill per branch + Daniel product policy lock strategic edge cases.

**§2 ESTIMATE FLAGGED ISSUES (Realist post simulator first run):** Total branches ~1500-2000 + AUTO_RESOLVED ~85% (engines pipeline deterministic + invariants PASS + no flags) + FLAGGED ~15% = ~225-300 branches require Claude reasoning fill. **Distribuție flagged categories estimative:** engines_disagree ~40% flagged (~90-120 branches most common) + circuit_breaker_fallback ~20% (~45-60 branches) + coverage_gap ~15% (~35-45 branches) + output_non_sane ~10% (~22-30 branches bug spec gap signals) + remainder strategic edge cases ~15% ~22-45 branches.

Cross-ref scenarios simulator [[spec-scenarios-simulator]] §1 PURPOSE content production engine NU testing infrastructure. Cross-ref validation framework [[spec-andura-validation-framework]] §7 Gate criteria preserved consistent 2026-05-10 sync.

## Verbatim quotes Daniel

Daniel verbatim §1 TRIGGER post-simulator delivery rationale workflow:
> *"Faza 2 = consume flagged_only.json → Claude reasoning fill per branch + Daniel product policy lock strategic edge cases."*

Daniel verbatim Bugatti philosophy 3-instance workflow Claude→Gemini→Claude→Daniel rationale §1 NORTH STAR alignment:
> *"Faza 2 workflow 3-instance Claude→Gemini→Claude→Daniel închide 5-10% legitimate disagreement gap exact."*

Daniel verbatim §7 Pre-Beta gate criteria sync 2026-05-10 ADR 020 + ANDURA_VALIDATION_FRAMEWORK §7 alignment:
> *"§7 Pre-Beta gate criteria sync 2026-05-10 cu ANDURA_VALIDATION_FRAMEWORK §7 LOCKED V1 2026-05-05 evening: Gate 1 ≥95% strict + Gate 2 DROPPED + Gate 3 selective Daniel review."*

## Bugatti framing notes

**Gigel test relevance:** Faza 2 Filter Strategy invisible la user (post-Beta content production workflow). Surface UI = product quality output Claude reasoning fill applied downstream. Backend infrastructure transparent.

**Quality > Speed via 3-instance Claude→Gemini→Claude→Daniel workflow:** Faza 2 closes 5-10% legitimate disagreement gap exact (single-instance Claude ≤95% → 3-instance ≥95% target). Pattern: multi-instance review pipeline preserves quality threshold.

**Anti-RE considerations:** Flagged distribution categories explicit (40%/20%/15%/10%/15%) = anti-recurrence "flagged bucket all-trash". Pattern: explicit categories enable targeted Claude reasoning fill per category type.

**Anti-paternalism notes:** Daniel product policy lock strategic edge cases = CEO scope preserved. NU forced engine auto-resolve strategic decisions. Edge case escalation gate preserves CEO judgment user agency.

**Voice tone notes:** Daniel-ism "Bugatti philosophy 3-instance workflow" recurring pattern (Claude→Gemini→Claude→Daniel pipeline craft discipline preserved).

## Cross-refs raw layer

- [[../../../04-architecture/FAZA_2_FILTER_STRATEGY_V1]] §1 TRIGGER + §2 ESTIMATE FLAGGED ISSUES + §7 Pre-Beta gate criteria sync
- [[../../../04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1]] §1 PURPOSE simulator content production engine source
- [[../../../04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1]] §1 NORTH STAR ≥95% strict + §7 Gate criteria sync 2026-05-10
- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §1.10 Pipeline §42.10 8 prescriptive engines
- [[../../../03-decisions/DECISION_LOG]] §2026-05-10 FAZA 2 Filter Strategy §7 sync ANDURA_VALIDATION_FRAMEWORK
- [[spec-scenarios-simulator]] (Cluster D sibling spec content production engine)
- [[spec-andura-validation-framework]] (Cluster D sibling spec correctness gate criteria sync)

🦫 **Spec Faza 2 Filter Strategy V1 SPEC DRAFT pending Daniel LOCK. Consume flagged_only.json → Claude reasoning fill ~225-300 branches + Daniel policy lock strategic edge cases. 3-instance Claude→Gemini→Claude→Daniel workflow closes 5-10% gap. §7 sync 2026-05-10 ANDURA_VALIDATION_FRAMEWORK preserved.**
