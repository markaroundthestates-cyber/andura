# EXEC_QUEUE Specs — AA Detection Layer + CDL Fixtures Pre-Task

**Pentru:** `10-exec-queue/EXEC_QUEUE.md`  
**Tasks:** 2 (CDL-FIXTURES pre-task + AA-DETECTION main)  
**Type:** Append at end of EXEC_QUEUE.md, after existing TASK entries  
**Dependencies:** ADR 011 schema additions pushed (vezi ADR-011-PATCH-2026-04-26.md), ADR 013 pushed  
**Sequencing:** Pasul 2-3 din 8-step plan post-handover

---

## TASK CDL-FIXTURES — Pre-task pentru AA Detection
**Model:** Sonnet
**Type:** EXEC (test infrastructure)
**Priority:** HIGH
**Status:** PENDING
**Created:** 2026-04-26
**Estimated:** 5-10 min real (Sonnet xhigh, ratio 0.25-0.35)

**Description:**

Creează `tests/fixtures/cdlEntries.js` cu CDL entries variate pentru reuse în tests downstream (AA Detection + Profile Typing + future engines).

Reduces drift în tests AA Detection care altfel ar genera fixtures fresh per test → inconsistencies între test files.

**Pre-flight verifications:**

```bash
# Verify directory structure
ls tests/fixtures/ 2>/dev/null || echo "fixtures dir doesn't exist — create"

# Verify existing CDL fixtures (avoid collision)
grep -rln "cdlEntries\|coach-decisions" tests/fixtures/ 2>/dev/null

# Verify CDL schema actual (must match what we generate)
cat src/util/coachDecisionLog.js | grep -A 30 "writeProposed\|populateOutcome" | head -60

# Verify ADR 011 schema additions pushed (autoAggression + rest_marked fields)
grep -A 5 "autoAggression\|rest_marked" docs/decisions/011-coach-decision-log-architecture.md
```

**GATE:** Dacă ADR 011 schema additions NU sunt în doc (autoAggression + rest_marked fields absent) — STOP, raportează. Acest task assume schema additions deja pushed.

**Module spec — `tests/fixtures/cdlEntries.js`:**

Export factory functions pentru entries variate. NU export raw arrays (Sonnet downstream va genera tests cu compose).

```javascript
/**
 * CDL test fixtures — factory functions for varied entries.
 * Use in tests via composition, NOT raw imports.
 *
 * Schema: per ADR 011 (incl. extension 2026-04-26 — autoAggression + rest_marked).
 */

// Helper: ISO date offset from today
export function dateOffset(daysAgo) { /* YYYY-MM-DD */ }

// Helper: timestamp offset from now
export function tsOffset(daysAgo, hour = 12) { /* number */ }

// Factory: real workout entry (executed=true, no deviation)
export function realWorkoutEntry(opts) { /* ... */ }
// opts: { date, sessionType, exercises, proposedSets, actualSets, calibrationLevel, readinessScore, isInCut, weakGroups }

// Factory: synthetic backfill entry (synthetic=true, all extension fields null)
export function syntheticEntry(opts) { /* ... */ }

// Factory: skip entry (executed=false, rest_marked variants)
export function skipEntry(opts) { /* ... */ }
// opts: { date, sessionType, restMarkedValue: null|true|false }

// Factory: deviation entry (executed=true, deviation=true, actualVolume>proposedVolume)
export function deviationEntry(opts) { /* ... */ }
// opts: { date, sessionType, proposedSets, actualSets, addedExercises }

// Factory: outcome with autoAggression populated
export function entryWithAA(opts) { /* ... */ }
// opts: { date, tier, signals, escalating, amplified, amplifierReason }

// Pre-built scenarios (compose factories internally):

// Scenario: 3+ consecutive volume creep sessions within 21 days (signal #1 trigger)
export function scenarioVolumeCreep(opts) { /* returns array of 3-5 entries */ }
// opts: { count, sessionTypeRotation, baseDate }

// Scenario: 3+ weeks recovery debt (signal #5 trigger, ISO weeks Mon-Sun)
export function scenarioRecoveryDebt(opts) { /* ... */ }
// opts: { weekCount, restDaysPerWeek }

// Scenario: composite fatigue ≥50% Hard/Very Hard sessions in week
export function scenarioCompositeFatigue(opts) { /* ... */ }

// Scenario: hyperfocus pattern (8h+ in app, 4+ days/week — separate logs fixture)
export function scenarioHyperfocus(opts) { /* ... */ }

// Scenario: clean profile (no signals, no AA)
export function scenarioClean(opts) { /* ... */ }
```

**Acceptance:**

- File `tests/fixtures/cdlEntries.js` created
- Factory functions cover: real, synthetic, skip (3 rest_marked variants), deviation, AA-populated
- Pre-built scenarios: volumeCreep, recoveryDebt, compositeFatigue, hyperfocus, clean
- All entries valid per ADR 011 schema (incl. extension fields)
- Zero test failures introduced (NO new tests in this task — fixtures only, used by downstream tasks)
- Build green: `npm run build`
- Existing tests green: `npm run test:run`

**Commit:** `feat(test): TASK CDL-FIXTURES — coachDecisionLog test fixtures (factory + scenarios)`

**Push:** `git push`

**Raport final în chat (format Daniel paste):**

```
[PROMPT 1 — TASK CDL-FIXTURES — model: sonnet]
Pre-flight:
- fixtures/ dir exists: ✅/❌
- ADR 011 schema additions present: ✅/❌
- CDL schema verified: <list functions>
Build: ✅/❌
Tests: 445/445 maintained (no new tests)
Commit: <hash>
Issues: NONE / desc
```

**Dependencies:** ADR 011 schema additions pushed. ADR 013 pushed (already DONE).

---

## TASK AA-DETECTION — Auto-Aggression Detection Layer
**Model:** Sonnet
**Type:** EXEC (engine module pure functions)
**Priority:** HIGH
**Status:** PENDING
**Created:** 2026-04-26
**Estimated:** 30-45 min real (Sonnet xhigh, ratio 0.25-0.35 — refactor MECANIC clear-scoped)

**Description:**

Implementează `src/engine/autoAggressionDetection.js` ca pure functions module conform ADR 013. Module standalone — NO integration cu coachContext.js sau alte engines (separate task).

**SCOPE STRICT:** Engine module pure ONLY. NU atinge:
- `src/engine/coachContext.js` (integration = future task)
- `src/util/coachDecisionLog.js` (consume API existing only)
- Onboarding UI / banner UI / intervention UI (future tasks)
- Profile Typing module (separate spec, paralel — can run independent)

**Pre-flight verifications:**

```bash
# Verify CDL API surface
grep -n "export function" src/util/coachDecisionLog.js

# Verify ADR 013 + ADR 011 extension pushed
ls docs/decisions/013-auto-aggression-detection.md
grep -A 5 "outcome.autoAggression" docs/decisions/011-coach-decision-log-architecture.md

# Verify CDL fixtures exists (TASK CDL-FIXTURES DONE)
ls tests/fixtures/cdlEntries.js

# Verify test infrastructure
cat src/util/__tests__/coachDecisionLog.test.js | head -30  # pattern to follow

# Verify isoWeek utility (used for ISO 8601 week boundaries per ADR 013)
grep -rn "isoWeek\|getISOWeek" src/ --include="*.js" | head -5
```

**GATE:** Dacă oricare prerequisite missing — STOP, raportează:
- ADR 011 schema additions absent → block, push first
- ADR 013 absent → block, push first
- CDL fixtures absent → block, run TASK CDL-FIXTURES first
- isoWeek utility absent → flag, decision needed (use existing helper or import from new lib)

---

**Module spec — `src/engine/autoAggressionDetection.js`:**

```javascript
/**
 * Auto-Aggression Detection — pure functions module.
 *
 * Detects user self-sabotage patterns per ADR 013.
 * 5 signals + 1 amplifier (hyperfocus).
 * No side effects — caller decides what to do with output.
 *
 * Reads CDL entries (filtered by caller). Does NOT read raw logs directly
 * (logs reads are responsibility of CDL outcome population layer).
 *
 * Reference: ADR 013 (signals + windows + tier logic)
 *            ADR 011 (CDL schema, including extension 2026-04-26)
 */
```

**Public API:**

```javascript
/**
 * Detect AA signals on current entry context (write-side, single entry).
 * Run during populateOutcome to persist autoAggression in CDL.
 *
 * @param {object} opts
 * @param {object} opts.currentEntry - CDL entry with outcome populated (no autoAggression yet)
 * @param {Array} opts.recentEntries - last 30d CDL entries (excl. current)
 * @param {object} [opts.hyperfocusData] - { hoursInApp7d, daysWithHyperfocus } from logs/analytics
 * @returns {object} - autoAggression object per ADR 011 schema
 *   { tier, signals[], escalating, amplified, amplifierReason }
 */
export function detectAutoAggression({ currentEntry, recentEntries, hyperfocusData }) { ... }

/**
 * Aggregate AA signals across CDL entries for buildSession context (read-side, snapshot).
 * Run during buildSession to compute ctx.autoAggression for intervention layer + banner UI.
 *
 * @param {Array} cdlEntries - CDL entries (typically last 30d, filtered by caller)
 * @returns {object} - aggregated AA snapshot
 *   { signals[], tier, escalating, amplified, amplifierReason, riskFlags[] }
 */
export function aggregateAutoAggression(cdlEntries) { ... }

/**
 * Compute escalation flag — MED tier sustained 2+ consecutive weeks.
 *
 * @param {Array} cdlEntries - CDL entries with outcome.autoAggression populated
 * @returns {boolean}
 */
export function computeEscalation(cdlEntries) { ... }
```

**Internal helpers (NOT exported, but tested via internal `_` prefix convention):**

```javascript
// Signal detectors — each returns boolean, NO side effects

export function _detectVolumeCreep(entries) { /* ... */ }
// 3+ consecutive sessions with deviation=true AND actualVolume > proposedVolume
// AND span ≤21 days (anti-stale on sporadic users)
// "actualVolume > proposedVolume" = added exercises (extra-sets), NOT total sets/kg

export function _detectCalorieAcceleration(entries) { /* ... */ }
// kcal_target drops >300 kcal on 7-day rolling window
// Reads context.kcal_target across entries

export function _detectFrustrationMarkers(entries) { /* ... */ }
// 14-day rolling window
// rating ≤2 (proxy temporary, until AA fix DONE — proxy already replaced with composite fatigue marker per ADR 013)
// + add volume same or next session (volume creep semantic)
// NOTE: same definition as volume creep signal (per HANDOVER) — implement as composite

export function _detectIgnoreRecovery(entries) { /* ... */ }
// 7-day rolling window
// composite fatigue ≥2 markers in week + zero early-stops + continue volume

export function _detectRecoveryDebt(entries) { /* ... */ }
// 3+ ISO weeks (Mon-Sun) consecutive with <2 rest_marked=true days/week
// Streak BREAKS at first week with ≥2 rest days
// MUST be combined with at least 1 other signal (per ADR 013 §1 — "singular = noise for aggressive profiles")

export function _detectHyperfocusAmplifier(hyperfocusData) { /* ... */ }
// 7-day rolling, 8h+/day for 4+ days/week
// Returns { amplified: bool, reason: string|null }
// NOT a detection signal — calibration heuristic only

export function _computeCompositeFatigue(entry) { /* ... */ }
// ≥50% sets rated Hard (RPE 9) or Very Hard (RPE 10) in single session
// Easy/OK NOT counted; sets without RPE NOT counted in denominator

export function _isoWeek(date) { /* ... */ }
// ISO 8601 week (Mon-Sun, Thursday rule)
// USE existing utility if available (search isoWeek/getISOWeek in src/)
// IF NOT EXISTS — flag in pre-flight, DO NOT create new (ADR alignment with responseProfile.js, stagnationDetector.js)

export function _computeTier(signalCount) { /* ... */ }
// Pure signal count → tier
// 0 → 'none', 1 → 'LOW', 2-3 → 'MED', 4-5 → 'HIGH'
```

**Tier logic (from ADR 013 + HANDOVER):**

```
signal count → tier
0 → 'none'
1 → 'LOW'
2-3 → 'MED'
4-5 → 'HIGH'
```

`escalating: true` if MED tier in 2+ consecutive weeks.

`amplified: true` if hyperfocus pattern detected (regardless of tier).

`amplifierReason: string | null` — descriptive ('hyperfocus_pattern_8h_4days_per_week'), null if !amplified.

**Output structure (matches ADR 011 schema extension):**

```javascript
{
  tier: 'none' | 'LOW' | 'MED' | 'HIGH',
  signals: ['volume_creep', 'frustration', 'ignore_recovery', 'recovery_debt', 'calorie_acceleration'],  // subset
  escalating: boolean,
  amplified: boolean,
  amplifierReason: string | null,
  riskFlags: ['YO-YO_RISK'] | []  // empty for now, populated by Profile Typing future
}
```

**Tests — `src/engine/__tests__/autoAggressionDetection.test.js`:**

Minim 20 tests, mandatory:

**Signal #1 — Volume Creep (4 tests):**
1. 3 consecutive deviation=true entries within 21 days → trigger
2. 3 deviations spread over 22+ days → NO trigger (anti-stale)
3. 3 deviations but 1 has actualVolume = proposedVolume → NO trigger (no creep)
4. 3 deviations interrupted by rest day → NO trigger (not consecutive)

**Signal #2 — Calorie Acceleration (4 tests):**
5. kcal_target drops 350 kcal in 7d → trigger
6. kcal_target drops 200 kcal in 7d → NO trigger (under 300 threshold)
7. kcal_target drops 600 kcal but over 14d → NO trigger (outside 7d window)
8. kcal_target stable across 7d → NO trigger

**Signal #3 — Frustration Markers (4 tests):**
9. rating=2 + volume creep next session within 14d → trigger
10. rating=2 + no volume creep → NO trigger
11. rating=3 + volume creep → NO trigger (rating threshold not met)
12. rating=2 + volume creep but >14d apart → NO trigger

**Signal #4 — Ignore Recovery (4 tests):**
13. composite fatigue ≥2 markers + zero early-stops + continue volume in 7d → trigger
14. composite fatigue ≥2 + early-stop logged → NO trigger
15. composite fatigue 1 marker only → NO trigger (insufficient)
16. composite fatigue ≥2 + volume drop → NO trigger (recovery acknowledged)

**Signal #5 — Recovery Debt (4 tests):**
17. 3 consecutive ISO weeks with <2 rest_marked=true days + 1 other signal → trigger
18. 3 weeks <2 rest days but ZERO other signals → NO trigger (singular = noise)
19. 3 weeks pattern but week 4 has ≥2 rest_marked=true → NO trigger (streak broken)
20. 2 weeks only (insufficient duration) → NO trigger

**Composite + Integration (extra, beyond 20 minimum):**
21. Hyperfocus amplifier sets amplified=true regardless of signals
22. computeEscalation returns true on 2+ consecutive MED weeks
23. aggregateAutoAggression on 30d entries returns expected snapshot
24. detectAutoAggression on entry with no signals returns tier='none', signals=[]
25. _computeTier maps counts correctly (boundary cases 0/1/2/3/4/5)

**Test structure:**

```javascript
import { describe, it, expect } from 'vitest';
import {
  detectAutoAggression,
  aggregateAutoAggression,
  computeEscalation,
  _detectVolumeCreep,
  // ... internal helpers
} from '../autoAggressionDetection.js';
import {
  scenarioVolumeCreep,
  scenarioRecoveryDebt,
  scenarioCompositeFatigue,
  scenarioClean,
  realWorkoutEntry,
  deviationEntry,
  // ... factories from CDL-FIXTURES task
} from '../../../tests/fixtures/cdlEntries.js';

describe('autoAggressionDetection — Volume Creep', () => {
  it('triggers on 3+ consecutive deviations within 21 days', () => {
    const entries = scenarioVolumeCreep({ count: 3, baseDate: '2026-04-01' });
    expect(_detectVolumeCreep(entries)).toBe(true);
  });
  // ... etc
});
```

**Build + tests:**

- `npm run build` — zero errors
- `npm run test:run` — 20+ new tests pass, zero existing tests break (445 baseline → 465+)
- Zero `console.log` in implementation (use existing logger pattern if one exists, else strip)

**Documentation in code:**

- File header: comment block referencing ADR 013 + ADR 011 (extension)
- JSDoc on public functions with semantic reference
- Inline comments at threshold values (with starting value + reconsider trigger reference)

**Acceptance:**

- `src/engine/autoAggressionDetection.js` exists with public API as specified
- `src/engine/__tests__/autoAggressionDetection.test.js` exists with 20+ tests, all pass
- ZERO modifications to other files (coachContext.js, coachDecisionLog.js, etc.)
- Build green
- Test suite green (no regressions)
- Commit: `feat(engine): TASK AA-DETECTION — autoAggressionDetection.js pure module + 20+ tests (ADR 013)`
- Push to main

**Dependencies:**
- ADR 011 schema additions pushed (autoAggression + rest_marked) — CRITICAL
- ADR 013 pushed — already DONE
- TASK CDL-FIXTURES DONE
- isoWeek utility exists OR flag in pre-flight

**Raport final în chat (format Daniel paste):**

```
[PROMPT 2 — TASK AA-DETECTION — model: sonnet]
Pre-flight:
- ADR 011 schema additions present: ✅/❌
- ADR 013 present: ✅/❌
- CDL fixtures present: ✅/❌
- isoWeek utility found at: <path> | NOT FOUND (flagged)
- CDL public API verified: <list>
Build: ✅/❌
Tests: XXX/YYY pass (was 445 baseline + N from CDL-FIXTURES, +20 new)
Commit: <hash>
Issues: NONE / desc
```

---

## NU FACE (anti-scope-creep enforcement)

- NU integra în `coachContext.js` (separate task — AA Detection Integration)
- NU modifica `coachDirector.js` (separate task)
- NU adăuga UI strings, banner display, intervention layer (future tasks per ADR 013 implementation order)
- NU implementa Profile Typing thresholds calibration (future task — AA v1.1 post 50+ users data)
- NU modifica `populateOutcome` în coachDecisionLog.js (separate task — write integration)
- NU implementa hyperfocus data collection (assume passed in via opts.hyperfocusData)

STOP după push. Awaiting Daniel sign-off pentru next task (Profile Typing spec).

---

*Specs generated: 2026-04-26 night. Pasul 2 din 8-step sequencing post-handover.*
