# ADR 011: Coach Decision Log (CDL) as Architectural Primitive

**Status:** Accepted
**Date:** 2026-04-25
**See also:** [[DECISION_LOG]] | [[009-calibration-tiers]] | [[006-tier-storage-for-logs]] | [[004-rule-engine-numeric-priorities]] | [[OPUS_NUCLEAR_AUDIT_25APR]] | [[FINDINGS_MASTER]] (H30c)

---

## Context

SalaFull's vision is a coach that "follows the body, not the calendar" (PROJECT_VISION). The current architecture cannot deliver this because **coach decisions are not persisted**.

Today:
- `decisionTrace` from `ruleEngine.evaluate(ctx)` exists in-memory per request, then evaporates
- `logs` (localStorage) record what the user **executed**, never what the coach **proposed**
- `applied-patterns` stores post-hoc analysis results, not the reasoning behind daily decisions
- `coachDirector.buildSession()` returns a session object that lives only until the next render

**The gap:** there is no persistent record of what the coach proposed for day X, in what context, with what reasoning, and how the user responded to that proposal.

This gap produces concrete failures:

1. **H30c (pattern false positives):** `patternLearning` measures skip rate per calendar day (Marți, Miercuri, etc.) without knowing whether a session was ever proposed for that day. A user with 3 real sessions sees "Marți 88% skip rate" — nonsense.

2. **No adherence signal:** `adherence.js` counts logs against a static PROG template. It cannot distinguish "user ignored coach's proposal" from "coach proposed rest day, user rested" — both look identical.

3. **No learning loop:** `responseProfile` infers volume/frequency sensitivity from raw logs alone. It cannot answer "when the coach proposed PULL light at 48h post-PUSH, did the user recover better than when proposed PULL heavy?" — because it doesn't know what was proposed.

4. **No transparency:** users cannot ask "why did the coach recommend X yesterday?" because the reasoning was discarded.

5. **No foundation for dynamic scheduling:** any future move from PROG-static to coach-decided weekly plan requires a record of what was decided and when.

The current "scheduled day = PROG[dayOfWeek]" model is fundamentally calendar-bound. Following the body means decisions are made daily based on context (recovery, fatigue, volume debt, energy signals), not against a fixed weekly grid. This requires a primitive the architecture currently lacks.

---

## Decision

Introduce **Coach Decision Log (CDL)** as a first-class architectural primitive: an append-only, persistent log of every session-level decision the coach makes, with full context snapshot, proposed action, rationale, and post-execution outcome.

### Schema

Each CDL entry:

```js
{
  id: 'cd_2026-04-25_18:42',         // unique, sortable
  ts: 1745596920000,                  // decision creation timestamp
  date: '2026-04-25',                 // local date the decision applies to
  synthetic: false,                   // true for backfilled entries (see §Backfill)
  superseded: false,                  // see §Idempotency
  supersedes: null,                   // string id of prior superseded entry, if any

  context: {                          // ctx snapshot at decision time
    calibrationLevel: 'PERSONALIZING',
    readinessScore: 75,
    fatigueIndex: 0.3,
    daysSinceLastSession: 2,
    lastSessionType: 'PULL',
    isInCut: true,
    weakGroups: ['shoulders'],
    stagnationWeeks: 0,
    predictionToday: { isHighRisk: false, probability: 0.12 },
    partial: false                    // true for synthetic entries with reconstructed-only fields
  },

  proposed: {                         // what the coach decided
    sessionType: 'PUSH',
    rationale: {
      winnerId: 'CUT_CONSERVATIVE',   // stable rule ID — see §Stable Rule IDs
      winnerPriority: 85,
      overridden: ['WEAK_GROUP_PRIORITY']
    },
    exercises: ['Incline DB Press', 'Pec Deck', 'DB Shoulder Press', 'Triceps Pushdown'],
    proposedSets: 18,                  // pre-stored sum to avoid recompute at outcome time
    volumeMultiplier: 0.9,
    notes: 'shoulders weak but PUSH day; face pulls included as compensation'
  },

  outcome: {                          // populated post-execution; null until then
    executed: true,                   // true | false | 'partial' | null
    deviation: false,                 // true if actualSessionType !== proposed.sessionType
    actualSessionType: 'PUSH',
    matchScore: 0.92,                 // null when deviation === true
    completedExercises: 4,
    totalProposedExercises: 4,
    actualSets: 16,
    proposedSets: 18,
    actualExercises: ['Incline DB Press', 'Pec Deck', 'DB Shoulder Press', 'Triceps Pushdown'],  // for Jaccard in matchScore
    actualDurationMins: 42,            // wall-clock duration; null on synthetic backfill entries
    earlyStop: false,
    rating: 'normal',
    completedAt: 1745617200000
  }
}
```

**Schema additions (26 Apr 2026, post-implementation reconciliation):** `proposed.proposedSets`, `outcome.actualExercises`, `outcome.actualDurationMins` were added during TASK #30.4 + #30.5 implementation as concrete needs surfaced. `proposedSets` avoids recomputing total sets at outcome time. `actualExercises` (array) is required for the Jaccard overlap component of matchScore. `actualDurationMins` provides wall-clock session duration for future recovery/fatigue engines. On synthetic backfill entries (`synthetic: true`), `actualDurationMins` may be reconstructed from `max(log.ts) - min(log.ts)` when ≥2 logs exist, or remain absent. ADR updated to reflect deployed schema. See FINDINGS_MASTER finding S1 (26 apr).

### Stable Rule IDs

`rationale.winnerId` references the **stable rule ID** exported from `ruleEngine.js`, not a display name. The `RULES` const in `src/engine/ruleEngine.js` exposes immutable string IDs (`REST_DAY`, `DELOAD`, `CUT_CONSERVATIVE`, `WEAK_GROUP_PRIORITY`, `VOLUME_COMPENSATION`, `STAGNATION_WEEK_8/6/4`, `PATTERN_EARLY_END`).

**Verified at ADR time (25 Apr 2026):** rules already have stable string IDs in `RULES.<RULE_NAME>.id`. No prerequisite refactor needed for CDL implementation. Current IDs are the contract going forward.

**Rename policy:** Renaming a rule ID requires an explicit migration step that rewrites `rationale.winnerId` for affected entries (Tier 1 + Tier 2 + Archive). Adding new rules is non-breaking. Removing rules requires migration to a sentinel value (`DEPRECATED_<original_id>`) preserved for historical entries, never reused.

Reserved ID: `SYNTHETIC_BACKFILL` for entries created by the backfill script. Never assigned to a real rule.

### matchScore — gate, not weighted

When `outcome.actualSessionType !== proposed.sessionType`, `matchScore = null` and `deviation = true`. Deviation is a categorically different signal from partial execution; mixing them as a numeric average pollutes adherence rate.

When `actualSessionType === proposed.sessionType`:

```
matchScore = 0.6 × volumeRatio + 0.4 × exerciseOverlap

volumeRatio    = clamp(actualSets / proposedSets, 0, 1.5)
exerciseOverlap = jaccard(actualExercises, proposedExercises)
```

`patternLearning` exposes two distinct metrics:
- **adherenceRate** = entries.where(executed && !deviation) / entries.where(proposed)
- **deviationRate** = entries.where(deviation) / entries.where(proposed)

These categories drive different engine responses:
- low adherence + zero deviation → user executes partially (volume too high? fatigue?)
- high deviation → user does not accept proposals (UX issue or coach misreads needs)

### Idempotency

CDL enforces **one active entry per `date`** at any moment. Multiple `coachDirector.buildSession()` invocations within a day must not produce duplicate entries.

**Rules:**

1. **Daily idempotency.** `coachDirector.buildSession()` checks if an entry exists for `today.date` before writing. If found:
   - **Age < 4h AND key context unchanged** → return existing entry's `proposed` unchanged. No new entry created.
   - **Key context changed significantly OR age ≥ 4h** → mark existing entry `superseded: true`, create new entry with `supersedes: <old_id>`. The old entry remains in storage (for audit trail) but is filtered out of "active" queries.

2. **Significant context change** is defined as any of:
   - `readinessScore` delta > 20 (absolute, not %; e.g., 75 → 55 is significant)
   - `weakGroups` set changed (added or removed any group)
   - `calibrationLevel` changed (tier transition)
   - `isInCut` changed
   - `predictionToday.isHighRisk` flipped

3. **Outcome population** (`endSession`, `cancelWorkout`) targets the **most recent, non-superseded entry** for `today.date`. If no entry exists (unlikely — director should have written one at session start), create a synthetic outcome-only entry with `rationale.winnerId = 'NO_PROPOSED'` for audit.

4. **Active queries** (read by `patternLearning`, `adherence`, `responseProfile`) filter out `superseded: true` entries by default. Superseded chain is reachable for audit/transparency views only.

5. **Append-only storage.** No CDL entry is ever deleted (within its tier). Updates allowed only:
   - `superseded: false → true` (state transition, never reversed)
   - `outcome: null → populated` (one-way write, immutable after population)

### Storage — TierStorage alignment per ADR 006 + ADR 009

Three retention tiers. **Tier 1 = 180 days** is locked to `responseProfile`'s rolling window at OPTIMIZED tier per ADR 009. Zero data loss at the boundary `responseProfile` reads from. If ADR 009 amends the rolling window, ADR 011 follows (see Reconsideration Triggers).

| Tier | Window | Content |
|------|--------|---------|
| 1 — Full detail | last 180 days | Full entry: context snapshot + proposed + outcome + rationale |
| 2 — Aggregate | 180 days to 1 year | sessionType, calibrationLevel, rationale.winnerId, outcome.executed, outcome.matchScore, outcome.deviation. Drop: full context, exercises list, overridden rules |
| 3 — Archive forever | beyond 1 year | Monthly metrics: count per (sessionType × month), executedRate, avgMatchScore, deviationRate |

Storage keys (kebab-case, consistent with existing SalaFull conventions like `applied-patterns`, `pattern-learning-cache`):
- `coach-decisions` — Tier 1, array
- `coach-decisions-aggregate` — Tier 2, array, demoted from Tier 1 on retention pass
- `coach-decisions-archive` — Tier 3, monthly rollup object

Demotion runs on `initAutoBackup` daily tick (existing infrastructure). Demotion is transactional: failed demotion preserves Tier 1 entry until success. No entry is ever lost mid-demotion.

### Firebase sync

CDL syncs to Firebase RTDB at `users/{uid}/coach-decisions`, `coach-decisions-aggregate`, `coach-decisions-archive` — same pattern as `logs` (ADR 001, ADR 002). Local-first, eventual consistent. Same `_suppressFirebaseSync` flag honored.

CDL keys added to `SYNC_KEYS` in `firebase.js`. Append-only semantics + immutable outcome + monotonic superseded transition make last-write-wins acceptable for sync conflicts.

### Backfill from existing logs

Daniel has 80+ real sessions pre-CDL. Cutover with empty CDL would force the coach to "forget" the user for 1-3 months. Inacceptable.

Solution: synthetic backfill from existing `logs` array.

For each historical session (grouped by `session` timestamp):
- Reverse-infer `proposed.sessionType` from exercise muscle groups
- `proposed.exercises` = list of unique exercises in the session
- `context` snapshot reconstructed from fields computable retrospectively (calibration level at that date, isInCut at that date based on phase history). Fields not reconstructable (readiness at that moment, weakGroups computed against then-current logs) are set to `null`. Entry's `context.partial = true`.
- `outcome` populated directly from logs (executed = true, completedExercises, actualSets, deviation = false since synthetic assumes match)
- `proposed.rationale = { winnerId: 'SYNTHETIC_BACKFILL', winnerPriority: null, overridden: [] }`
- Entry-level `synthetic: true`

Synthetic entries are usable by `patternLearning` and `responseProfile` with **reduced weight (0.5×)** in any aggregation. They do not block real-time learning but provide pattern continuity. The 0.5 weight is judgment-call default; reconsideration trigger #1 covers cases where this weighting produces wrong patterns.

**Backfill validation gate (mandatory):** Daniel performs manual review on 10 random sample synthetic entries before subtask 4 (director integration) starts. Per entry verified:
- `proposed.sessionType` reverse-inferred matches actual session type intent
- `proposed.exercises` list matches logs for that session
- `outcome.executed`, `outcome.completedExercises`, `outcome.actualSets` match logs

Explicit Daniel sign-off recorded in `EXEC_RESULTS.md`. If any sample fails, backfill script is fixed and re-run on full history before subtask 4 unblocks.

Backfill runs once at CDL deployment, then synthetic entries are read-only forever.

### Decommissioning `applied-patterns`

Trigger-based parallel run, not time-based:

1. CDL has ≥30 entries with `outcome.executed != null` (real, not synthetic)
2. Zero detected mismatches between `CDL.outcome.actualSessionType` and `logs[ts].session` for those 30 entries (automated test)
3. Manual validation by Daniel: `patternLearning` running on CDL produces sensible patterns

All three required. Time-based 2-week rule rejected — depends on training cadence which varies.

**Pre-decommission audit (additional gate):** when all three triggers fire, run a 7-day diff audit comparing CDL-derived patterns against legacy `applied-patterns` output. Daniel reviews the diff. If both produce equivalent patterns (modulo CDL's filtered false positives that motivated this work), decommission proceeds. If divergence is unexplained, hold and investigate.

During parallel period: writes go to both CDL and `applied-patterns`. Reads prefer CDL; fallback to `applied-patterns` if CDL is empty for the requested day. After all gates pass: clean break — `applied-patterns` removed from code, storage cleanup added to data registry (Task #27 follow-up).

### Banner suppression for insufficient CDL data

`renderIdle.js` pattern banner is suppressed entirely when CDL real entries (`executed === true && synthetic === false`) count is below `CALIBRATION_LEVELS.INITIAL.minSessions` (currently 3 per ADR 009). No pattern claims with insufficient real data.

Implementation reuses the existing tier gate from `calibration.js`. Synthetic-only history is not sufficient for banner activation — even if backfill produced 100 synthetic entries, banner stays off until real CDL entries pass the threshold. This is a deliberate strictness: pattern claims must be backed by decisions the live coach actually made.

When suppressed, `renderIdle.js` does not query `ctx.patterns` for banner content. No fallback to legacy `applied-patterns` here — banner suppression takes precedence.

### Integration points

- **`coachDirector.buildSession()`** writes `proposed` + `context` + `rationale` to CDL on session generation, with idempotency check
- **`endSession()`** populates `outcome` on the most recent non-superseded CDL entry for today
- **`cancelWorkout()`** populates `outcome.executed = false` on today's active entry
- **`patternLearning`** reads CDL instead of `applied-patterns` (after decommission gate)
- **`adherence.js`** rewritten to read CDL instead of counting raw logs against PROG
- **`renderIdle.js`** banner sourced from `ctx.patterns` (filtered by director, sourced from CDL); suppressed if insufficient real entries
- **No engine reads `applied-patterns` directly post-decommission** — single source of truth

---

## Alternatives Considered

### Alternative A — WeeklyPlan dynamic object

A persistent weekly plan object that the coach mutates as the week unfolds (recovery insertion, swap, deload).

**Rejected because:**
- Higher complexity: requires plan diff, conflict resolution, mid-week reschedule logic
- Weekly granularity loses per-decision rationale (why was Wednesday changed from PUSH to OFF?)
- Doesn't solve the audit/transparency problem (no history of decisions, only current state)
- CDL append-only achieves the same outcome (a week of decisions reconstructable from last 7 entries) with simpler semantics
- WeeklyPlan can be derived from CDL later if needed; reverse is not true

### Alternative B — Extend `applied-patterns` with proposed sessions

Add proposed session data to existing `applied-patterns` storage, evolve in place.

**Rejected because:**
- `applied-patterns` semantics are post-hoc analysis, not real-time decisions. Conflating creates confused storage with two purposes.
- Existing entries (SKIP_DAY, EARLY_END, STAGNATION) have no schema overlap with proposed sessions
- H30c is rooted in `applied-patterns` design; extending it carries the bug forward
- Clean break with new primitive is cheaper than mutating shared storage that 3+ engines read

### Alternative C — In-memory only, derived from logs at runtime

Compute "what the coach would have proposed" retroactively from logs whenever an engine needs it.

**Rejected because:**
- Decisions depend on context (readiness, fatigue, weakGroups) at decision time. Reconstructing context retroactively is unreliable.
- No transparency for users — cannot show "this is why the coach said X yesterday"
- Same compute repeated on every read = performance cost
- Defeats the purpose of a learning system: coach state at t=N must be queryable from t=N+1, not recomputed

### Alternative D — Database backend (Firestore document model)

Move all storage to Firestore with proper document schema for decisions.

**Rejected because:**
- Out of scope for current architecture (ADR 002: REST not SDK, ADR 001: local-first)
- Migration cost is multi-week refactor of all storage paths
- Reconsideration trigger documented below if scale demands it post-launch

---

## Reconsideration Triggers

Revisit this ADR when any of the following occur:

1. **Pattern detection systematically wrong after 60+ real CDL entries.** If `patternLearning` reading CDL still produces obviously wrong patterns (Daniel observation or QA finding), the schema is missing a signal — or synthetic weight (0.5×) is mis-calibrated. Audit and amend.

2. **`responseProfile` produces results contradicting physical intuition.** If volume/frequency sensitivity scores are clearly wrong despite 6 months of data, CDL context snapshot is missing relevant fields (e.g., sleep, stress, nutrition deviation).

3. **Storage capacity hits 80% of localStorage budget even with TierStorage.** Indicates retention windows or schema density need adjustment. Likely mitigation: drop more fields from Tier 2, or shorten Tier 1 if `responseProfile` rolling window also shortens.

4. **Backend migration triggered (Firestore, Postgres, custom API).** CDL schema must be portable. Document explicit migration path before launch.

5. **`responseProfile` rolling window in ADR 009 changes.** Tier 1 retention is locked to that window. If ADR 009 amends OPTIMIZED to 9 months or 12 months, CDL Tier 1 follows.

6. **Multi-tenancy real auth deployed.** CDL path becomes `users/{authUid}/coach-decisions`. Schema unchanged but migration step required.

7. **Idempotency conflict observed.** If duplicate entries appear for the same date despite the 4h + context-change rules, idempotency policy needs revision (e.g., shorter than 4h window, additional context fields tracked).

8. **Schema drift detected post-implementation.** If audit reveals fields written by code but not specified in ADR (or vice versa), trigger ADR review: accept drift (update ADR), revert (remove from code), or refactor. Drift is normal as concrete implementation surfaces needs ADR couldn't anticipate; the requirement is that ADR remains in sync with deployed code, not that code matches ADR exactly.

---

## Consequences

### Positive

- Coach reasoning becomes persistent and auditable — foundation for "decisii verificabile" moat (PROJECT_VISION)
- H30c (pattern false positives) resolves naturally: `patternLearning` reads coach decisions, not calendar days
- Adherence becomes meaningful: "did the user execute what was proposed" is now answerable
- `responseProfile` learning loop closes: response can be correlated with proposed context
- User-facing transparency unlocked: "why did coach say X" answerable directly from CDL entry
- Foundation for dynamic weekly scheduling without prematurely committing to that abstraction
- Single source of truth for coach behavior — replaces multiple partial stores

### Negative

- Schema surface area grows: CDL becomes a contract that must be honored by 4+ engines
- Storage size: ~125KB Tier 1 for active user (250 sessions/year × 6 months × ~1KB/entry). Within 5MB localStorage budget, but consumes 2.5% of it from one feature.
- Migration complexity: backfill must run once and produce trusted synthetic entries; bugs in backfill = corrupt baseline (mitigated by 10-sample manual validation gate)
- Decommissioning `applied-patterns` is a refactor across `renderIdle.js`, `coachDirector.js`, `patternLearning.js`, `dataRegistry.js`. Must be atomic at trigger fire.
- New testing surface: 15+ test cases minimum (CDL write, read, demotion, sync, backfill, matchScore gate, decommission triggers, idempotency, superseded chain)
- Synthetic entries with reduced weight introduce a two-class signal in pattern detection. Must be documented in any engine that aggregates CDL.

### Risks

- **Backfill correctness:** retrospective context reconstruction is best-effort. If `synthetic: true` entries are weighted incorrectly in aggregation, they bias learning. Mitigation: 10-sample manual validation gate + explicit unit tests on aggregation behavior with mixed real/synthetic entries.
- **Decommission timing:** if the three triggers are met but a hidden CDL bug exists, removing `applied-patterns` causes silent regression. Mitigation: 7-day pre-decommission diff audit gate.
- **TierStorage demotion bugs:** entries lost during Tier 1 → Tier 2 demotion = lost decision history. Mitigation: demotion runs as transaction; failed demotion preserves Tier 1 entry until success.
- **Idempotency edge cases:** rapid context changes (e.g., user edits readiness twice within 5 minutes) could trigger excessive supersede chains. Mitigation: covered by reconsideration trigger #7; minimum hold time between supersedes can be added if observed.

---

## Implementation Order

This ADR is the contract. Implementation follows in TASK #30 (split into ordered subtasks):

1. ADR 011 merged, reviewed, accepted
2. `src/util/coachDecisionLog.js` — schema, read/write/demote/sync primitives + idempotency rules + tests (15+ cases including 2 concurrency + 1 superseded chain)
3. Backfill script (`src/util/cdlBackfill.js`) — synthetic entry generation from logs + tests on Daniel's actual history + 10-sample validation gate signed off in EXEC_RESULTS.md
4. Integration: `coachDirector.buildSession()` writes CDL on session generation with idempotency check
5. Integration: `endSession()` + `cancelWorkout()` populate outcome on most-recent non-superseded entry
6. `patternLearning` reads CDL + parallel write to `applied-patterns` (decommission gate active)
7. `adherence.js` rewritten to read CDL
8. `renderIdle.js` banner sourced from `ctx.patterns` (CDL-backed); suppressed if real CDL entries < 3
9. Decommission validation: 30 entries + zero mismatch + manual sign-off + 7-day diff audit → remove `applied-patterns`
10. H30c closed in FINDINGS_MASTER

Each subtask has its own EXEC_QUEUE entry with acceptance criteria and tests.

---

*Authored by: Co-CTO chat (Opus). Reviewed by: Daniel (CEO + Product). Implementation: Claude Code (Sonnet) per TASK #30 subtask sequence.*
