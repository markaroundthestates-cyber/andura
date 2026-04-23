# ADR 006: Three-Tier Log Storage

**Status:** Accepted  
**Date:** 2026-04-23

## Context

localStorage is limited to ~5MB. Workout logs accumulate indefinitely. After 1–2 years, storage will overflow.

## Decision

Implement TierStorage with three tiers:
- **Live (0–90 days):** Full entry-level data, used by DP and all engines.
- **Aggregate (90d–1yr):** Compressed to daily summaries (sets, avgWeight, exercises).
- **Archive (>1yr):** Monthly summaries only (sessions, totalSets, topExercises).

Compression runs on `saveTiers(logs)` when full log array is available.

## Consequences

- **Positive:** Storage stays bounded regardless of training duration.
- **Positive:** Live tier is fast — DP and WhyEngine only need recent data.
- **Negative:** Aggregate/archive data loses per-set resolution — historical PRs after 90 days not recoverable from tier data alone (mitigated by daily backup system).
- **Implementation note:** Currently `saveTiers` is called manually; automatic trigger on `DB.set('logs', ...)` is a future improvement.
