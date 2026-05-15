---
title: ADR 004 — Rule Engine Numeric Priorities
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-23
authority: 03-decisions/004-rule-engine-numeric-priorities.md raw layer §Decision (numeric priorities 0-100 winner-takes-all)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-003-double-progression-engine]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[adr-013-auto-aggression-detection]]"
  - "[[adr-026-offline-coaching-tree]]"
amendments: []
---

# ADR 004 — Rule Engine Numeric Priorities

## Synthesis

ADR 004 = decision Rule Engine cu numeric priorities (0-100) deterministic conflict resolution. Original LOCK V1 2026-04-23. `evaluate(ctx)` fires applicable rules, sorts priority DESC, returns highest winner cu rest în `overridden`. Priority scale: **100 REST_DAY** (safety top) → **95 DELOAD** (fatigue) → **85 CUT_CONSERVATIVE** (phase) → **70 WEAK_GROUP_PRIORITY** → **60 VOLUME_COMPENSATION** → **40-50 STAGNATION** (weeks 4/6/8) → **30 PATTERN_EARLY_END**. Trace output shows ALL fired rules — debugging + user transparency. Binary winner-takes-all = acceptable current scope (NU nuanced multi-factor weighting). Foundation Coach Decision Log ADR 011 `rationale.winnerId` reference stable rule IDs exported `RULES` const `src/engine/ruleEngine.js`. Cross-ref Auto-Aggression detection ADR 013 priorities + Offline Coaching Tree ADR 026 §42.10 pipeline orchestration.

## Verbatim quotes Daniel

Verbatim quotes Daniel: catalog pending raw-layer text limited — synthesis-only entity per voice policy §1 footnote 6 exception. ADR 004 raw 2026-04-23 foundational decision pre daniel-isms density. Daniel articulation general chat strategic universal rule priority deterministic:

> *"vreau decizii verificabile. NU magie black-box. Coach decide pe regulă claritate, NU vibe."*

(Context paraphrased synthesis — `decizii verificabile` = MOAT_STRATEGY core phrase recurring Daniel verbatim chat strategic.)

## Bugatti framing notes

**Quality > Speed via determinism:** Fully deterministic rule engine = easy reason about + test. Trace output ALL fired rules = audit trail Bugatti craft. NU ML black-box premature optimization.

**Anti-RE considerations:** Rule IDs stable strings (`REST_DAY` / `DELOAD` / `CUT_CONSERVATIVE` etc.) cross-ref ADR 011 `rationale.winnerId` contract — rename requires explicit migration. Priority numbers internal, NU public-facing. Anti-RE protection preserved (user vede decision rationale prose, NU priority math).

**Voice tone notes:** "Decizii verificabile" = MOAT_STRATEGY core phrase Daniel articulation chat strategic recurring. Rule engine = mechanism implementation acestei promise.

## Cross-refs raw layer

- [[../../../03-decisions/004-rule-engine-numeric-priorities]] §Decision (priority scale 0-100) + §Consequences
- [[../../../03-decisions/003-double-progression-engine]] §Decision (DP layer feeds rule engine)
- [[../../../03-decisions/011-coach-decision-log-architecture]] §Stable Rule IDs (RULES const contract)
- [[../../../03-decisions/013-auto-aggression-detection]] §Severity tiers (AA integration rule engine priorities)
- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §42.10 pipeline (rule engine orchestration)
- [[../../../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1]] §Arbitrator section (rule engine ↔ arbitrator integration)
- [[../../../03-decisions/DECISION_LOG]] §2026-04-23 entry

🦫 **ADR 004 Rule Engine Numeric Priorities LOCK V1 2026-04-23. Deterministic conflict resolution foundation. Stable RULES IDs contract Coach Decision Log lineage. Decizii verificabile MOAT_STRATEGY mechanism implementation.**
