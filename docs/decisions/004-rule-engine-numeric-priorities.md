# ADR 004: Rule Engine with Numeric Priorities

**Status:** Accepted  
**Date:** 2026-04-23

## Context

Multiple signals (readiness, fatigue, phase, stagnation, patterns) can conflict. We need a deterministic way to resolve conflicts.

## Decision

Implement a Rule Engine where each rule has a numeric priority (0–100). `evaluate(ctx)` fires all applicable rules, sorts by priority DESC, and returns the highest-priority winner with the rest in `overridden`.

Priority scale:
- 100: REST_DAY (safety)
- 95: DELOAD (fatigue)
- 85: CUT_CONSERVATIVE (phase constraint)
- 70: WEAK_GROUP_PRIORITY
- 60: VOLUME_COMPENSATION
- 40–50: STAGNATION (weeks 4/6/8)
- 30: PATTERN_EARLY_END

## Consequences

- **Positive:** Fully deterministic. Easy to reason about and test.
- **Positive:** Trace output shows all fired rules — helpful for debugging and user transparency.
- **Negative:** Binary priority (winner-takes-all) can miss nuanced multi-factor cases. Acceptable for current scope.
