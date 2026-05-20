# ADR 003: Double Progression (DP) as Core Weight Recommendation Engine

**Status:** Accepted  
**Date:** 2026-04-23
**See also:** [[DECISION_LOG]] | [[COGNITIVE_ARCHITECTURE_SPEC_v1]] | [[004-rule-engine-numeric-priorities]]

## Context

Weight recommendations need a principled system that adapts to the user's actual performance history rather than fixed tables.

## Decision

Implement a 5-stage Double Progression engine:
1. **INIT** — No history; use initial estimation from similar exercises.
2. **SCALE_BACK** — Missed reps at last session; reduce weight.
3. **CONSOLIDATE** — Hit reps but RIR > 2; stay at weight.
4. **INCREASE** — Hit all reps with RIR ≤ 2; increase by equipment step.
5. **TECHNIQUE/DROP** — Plateau trigger; change technique.

Weight increments follow equipment-specific steps (dumbbells: 2.5kg, cable stack: 2.5kg, barbell: 5kg).

## Consequences

- **Positive:** Personalized recommendations based on actual performance.
- **Positive:** Handles equipment constraints natively.
- **Negative:** Requires minimum 2-3 sessions of history to be meaningful.
- **Negative:** Single-exercise DP cannot account for cross-exercise fatigue accumulation (addressed by RuleEngine + FatigueIndex).
