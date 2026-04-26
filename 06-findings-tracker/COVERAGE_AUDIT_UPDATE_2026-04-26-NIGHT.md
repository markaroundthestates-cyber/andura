# Coverage Audit UPDATE — 2026-04-26 NIGHT

**Delta from:** `COVERAGE_AUDIT_2026-04-26.md` (snapshot: 422 tests)  
**Delta to:** 2026-04-27 NIGHT run (snapshot: 524 tests)  
**Net change:** +102 tests

---

## New Test Files Added Since 2026-04-26

| Test file | Date added | Tests | Covers |
|---|---|---|---|
| `autoAggressionDetection.test.js` | 2026-04-27 00:15 | 37 | `autoAggressionDetection.js` (361 LOC) |
| `profileTyping.test.js` | 2026-04-27 00:47 | 42 | `profileTyping.js` (563 LOC) |

**Total new tests from these files:** 79  
**Remaining delta (102 - 79 = 23):** Organic test additions to existing suites (coachDirector, adherence, dp, proactiveEngine, calibration, patternLearning, etc.)

---

## Coverage Status Change

### autoAggressionDetection.js — was UNCOVERED → now COVERED

**Prior state:** ❌ NONE (not even listed in prior audit — module was post-ADR-013 addition)  
**Current state:** ✅ 37 tests  
**LOC:** 361  
**Test coverage scope:**
- `detectAutoAggression()` — all 5 signals (missedSets, deloadCount, escalatingRPE, earlyEnds, weeklyDecline)
- `aggregateAutoAggression()` — aggregation + threshold logic
- `computeEscalation()` — escalation tier derivation
- Hyperfocus amplifier
- Edge cases: empty input, null guards, boundary values

**CRITICAL CAVEAT:** Despite 37 unit tests, module has ZERO production integration (per AA_INTEGRATION_AUDIT_NIGHT).  
Tests verify module logic in isolation — NOT end-to-end pipeline correctness.

---

### profileTyping.js — was UNCOVERED → now COVERED

**Prior state:** ❌ NONE (not listed in prior audit — module was post-ADR-014 addition)  
**Current state:** ✅ 42 tests  
**LOC:** 563  
**Test coverage scope:**
- `analyzeProfile()` — Sprinter/Marathon/Yo-yo/Strategic classification
- `inferBehavioralProfile()` — behavioral signal inference
- `reconciliationAction()` — 5 reconciliation cases
- `detectYoyoRisk()` — Yo-yo risk detection
- Edge cases, multi-signal conflicts

**CRITICAL CAVEAT:** Despite 42 unit tests, module has ZERO production integration (per PROFILE_TYPING_INTEGRATION_AUDIT_NIGHT).  
Tests verify module logic in isolation — NOT onboarding/coaching pipeline.

---

## Updated Coverage Summary

### Engine modules

| Before (2026-04-26) | After (2026-04-27) | Change |
|---|---|---|
| 27 modules | 29 modules | +2 (autoAggressionDetection, profileTyping) |
| 16 covered (59%) | 18 covered (62%) | +2 |
| 11 uncovered (41%) | 11 uncovered (38%) | +2 moved to covered |

### Util modules — UNCHANGED

| Before | After | Change |
|---|---|---|
| 12 modules, 9 covered (75%) | 12 modules, 9 covered (75%) | No change |

### Overall

| Metric | Before | After | Delta |
|---|---|---|---|
| Total modules | 39 | 41 | +2 |
| Total covered | 25 (64%) | 27 (66%) | +2 |
| Total uncovered | 14 (36%) | 14 (34%) | 0 (new modules added WITH tests) |
| **Tests** | **422** | **524** | **+102** |

---

## HIGH RISK Modules — Status Unchanged

These were HIGH risk in prior audit and remain untested:

| Module | LOC | Risk | Status |
|---|---|---|---|
| `sys.js` | 297 | HIGH | ❌ STILL UNCOVERED |
| `reality.js` | 150 | HIGH | ❌ STILL UNCOVERED |
| `responseProfile.js` | 135 | HIGH | ❌ STILL UNCOVERED |
| `recompileEngine.js` | 109 | MEDIUM-HIGH | ❌ STILL UNCOVERED |

---

## Observations

**Positive signal:** Both new ADR modules (013, 014) shipped with comprehensive test suites.  
`autoAggressionDetection.js` (37 tests) and `profileTyping.js` (42 tests) represent ~79 tests added purely for new functionality.  

**Warning:** Good unit test coverage on orphaned modules creates a false sense of safety.  
The modules are isolated (per ENGINE_CALL_GRAPH_NIGHT: DEAD PATH) — their test coverage is module-level, not system-level.

**Priority unchanged:** `sys.js`, `reality.js`, `responseProfile.js` remain the primary coverage debt.

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
