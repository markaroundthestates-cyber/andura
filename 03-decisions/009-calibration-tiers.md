# 009. Calibration Tiers for User Maturity

**See also:** [[DECISION_LOG]] | [[CTX_ALLLOGS_AUDIT_1_5]] | [[ENGINE_ARCHITECTURE]] | [[003-double-progression-engine]]

## Status
Accepted

## Context
The coaching engine must work correctly for a brand-new user (0 sessions) as well as
for a seasoned user with 2 years of history. Without tier gating:

- A user with 2 gym sessions in 56 days saw "Marți 88% skip rate, Joi 100%" — false
  positives from patternLearning counting calendar occurrences as scheduled sessions.
- Cold-start users received no proactive guidance because pattern/stagnation engines
  returned empty results rather than population-prior recommendations.
- Expensive engines (responseProfile, weaknessDetector) ran on every page load even
  with 3 log entries, wasting compute and returning meaningless results.

## Decision

5-tier calibration system determined by **days since first session** AND **unique
session count** (whichever produces the lower tier wins — conservative):

| Tier            | ID | Days   | Sessions | Patterns | Weak Group | Stagnation | Prediction | Profile | Rolling Window |
|-----------------|----|--------|----------|----------|------------|------------|------------|---------|----------------|
| COLD_START      | 0  | < 7    | < 3      | off      | off        | off        | off        | off     | —              |
| INITIAL         | 1  | 7–28   | 3–12     | high (≥70%)| off     | off        | off        | off     | —              |
| PERSONALIZING   | 2  | 28–90  | 12–40    | med (≥60%)| on       | on         | on         | off     | —              |
| PERSONALIZED    | 3  | 90–180 | 40–80    | std (≥50%)| on       | on         | on         | on      | —              |
| OPTIMIZED       | 4  | 180+   | 80+      | low (≥45%)| on       | on         | on         | on      | 6 months       |

**Recalibration frequency** drops with maturity:
- COLD_START: per_session (triggered on session complete, not timer)
- INITIAL: daily (≥ 20h interval)
- PERSONALIZING / PERSONALIZED: weekly (≥ 7 days)
- OPTIMIZED: monthly_or_trigger (≥ 30 days, or forced by PR/injury/break events)

**Cold start is not silence.** COLD_START users receive a `generateColdStartSession()`
based on onboarding (experience, goal) using population-prior starting weights. This
prevents the "no recommendations on day 1" problem.

**Calibration banner** in the coach UI: COLD_START and INITIAL users see a purple
"🧠 Inițializare / Calibrare inițială" banner explaining the learning phase. Banner
disappears at PERSONALIZING and above.

## Consequences

### Positive
- Zero false positives on pattern detection for new users (gates off entirely)
- New users get intelligent, safe starting weights from day 1
- Expensive engines (responseProfile, weaknessDetector) only run when sufficient data exists
- Rolling window at OPTIMIZED prevents old sessions from skewing recommendations
- Transparency: banner informs user the system is still learning
- Recalibration cost scales with tier: cheap for cold start, rare for optimized

### Negative
- 5-tier config adds code surface area
- Unit test matrix grows: every engine needs cold_start + optimized test cases
- `detectCalibrationLevel` is a pure function on `ctx.allLogs` — inaccurate if logs
  are filtered elsewhere before reaching the director
