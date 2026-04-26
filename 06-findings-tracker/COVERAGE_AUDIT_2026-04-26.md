# Coverage Audit — 2026-04-26

**Methodology:** For each src/engine/*.js and src/util/*.js, check existence of __tests__/<name>.test.js (or tests/<name>.test.js). Count test cases per file using grep for `it(` / `test(`. Flag gaps.

**Snapshot date:** 2026-04-26 (post-TASK #30.10 + ADR 012)  
**Total tests at snapshot:** 422/422 passing

---

## Engine modules

| Module | Test file | Tests | Notes |
|---|---|---|---|
| aa.js | ✅ aa.test.js | 5 | KNOWN ISSUE: AA partial broken — RPE logic disabled (notes-only mode, FAZA 1.7). Tests cover active surface. |
| adherence.js | ✅ adherence.test.js | 17 | Rewritten post-30.7 (CDL primary + logs fallback). |
| alerts.js | ❌ NONE | — | 4 LOC — likely just constants/exports. Low risk. |
| alternativeEngine.js | ✅ alternativeEngine.test.js | 10 | |
| calibration.js | ✅ calibration.test.js | 34 | +8 new tests added post-ADR 012 (tier decay). |
| coachContext.js | ✅ coachContext.test.js | 5 | Coverage THIN — only CDL patterns shape tested. ctx composition logic untested. |
| coachDirector.js | ✅ coachDirector.test.js | 39 | Comprehensive. Includes CDL write, degraded mode, equipment, CUT/BULK. |
| coldStartGuidelines.js | ❌ NONE | — | 172 LOC — guidelines for COLD_START users. Medium risk (output affects coach recommendations). |
| dp.js | ✅ dp.test.js | 8 | Double Progression engine. Coverage reasonable. |
| exerciseMapping.js | ❌ NONE | — | 40 LOC — exercise name mapping / normalization. Low-medium risk. |
| fatigue.js | ❌ NONE | — | 87 LOC — fatigue detection logic. Medium risk. |
| muscleMap.js | ❌ NONE | — | 129 LOC — muscle → exercise mapping constants. Low risk (data, not logic). |
| patternLearning.js | ✅ patternLearning.test.js | 13 | Covers analyzeFromCDL + legacy analyzeAndApplyPatterns. |
| plateauInterventions.js | ✅ plateauInterventions.test.js | 11 | |
| predictionEngine.js | ✅ predictionEngine.test.js | 9 | |
| proactiveEngine.js | ✅ proactiveEngine.test.js | 19 | Includes protein target. |
| readiness.js | ❌ NONE | — | 70 LOC — getReadinessScore. MEDIUM risk (M15c: clamp 10-100 hides negative values). Known deferred bug. |
| reality.js | ❌ NONE | — | 150 LOC — reality check engine. HIGH risk — significant logic, no coverage. |
| recalibration.js | ❌ NONE | — | 56 LOC — recalibration triggers. Medium risk. |
| recompileEngine.js | ❌ NONE | — | 109 LOC — engine recompile logic. Medium-high risk. |
| responseProfile.js | ❌ NONE | — | 135 LOC — frequency sensitivity, response profiling. HIGH risk (isoWeek bug was in similar logic — H13g fixed in FAZA 2). |
| ruleEngine.js | ✅ ruleEngine.test.js | 15 | |
| sessionBuilder.js | ✅ sessionBuilder.test.js | 11 | OPT C + OPT A. |
| stagnationDetector.js | ✅ stagnationDetector.test.js | 10 | |
| sys.js | ❌ NONE | — | 297 LOC — largest untested engine module. Contains TDEE, body comp calculations, user metrics. HIGH risk. |
| weaknessDetector.js | ✅ weaknessDetector.test.js | 13 | |
| whyEngine.js | ✅ whyEngine.test.js | 11 | |

---

## Util modules

| Module | Test file | Tests | Notes |
|---|---|---|---|
| adminPrefill.js | ❌ NONE | — | 71 LOC — DEFERRED (M6g: contains Daniel-specific data, launch risk). NOT testing until launch prep. |
| autoBackup.js | ✅ autoBackup.test.js | 12 | |
| cdlBackfill.js | ✅ cdlBackfill.test.js | 27 | Comprehensive. |
| coachDecisionLog.js | ✅ coachDecisionLog.test.js | 17 | CDL primitive. Full coverage. |
| dataCleanup.js | ✅ dataCleanup.test.js | 17 | Includes Full Reset, firebase suppression. |
| dataRegistry.js | ✅ dataRegistry.test.js | 17 | |
| dataIntegrity.js | ✅ dataIntegrity.test.js | 4 | THIN — only 4 tests for data integrity validation. |
| logBackup.js | ✅ logBackup.test.js | 6 | |
| logFilter.js | ❌ NONE | — | 19 LOC — filter utility. Low risk (pure function, simple). |
| logNormalize.js | ❌ NONE | — | 19 LOC — normalization utility. Low risk. |
| logsMigration.js | ✅ tests/logsMigration.test.js | 7 | Note: in `tests/` not `__tests__/` — different directory. |
| sentry.js | ❌ NONE | — | 68 LOC — Sentry wrapper. DEFERRED (C8g: Sentry filter issue deferred to FAZA 3 observability). |
| tierStorage.js | ✅ tierStorage.test.js | 13 | |

---

## Gaps identified

### HIGH RISK — untested significant logic

| Module | LOC | Risk | Reason |
|---|---|---|---|
| `sys.js` | 297 | HIGH | Largest untested engine. TDEE, body comp, user metrics — output affects every recommendation. |
| `reality.js` | 150 | HIGH | Reality check engine — 150 LOC with zero tests. |
| `responseProfile.js` | 135 | HIGH | Frequency sensitivity / response profiling. isoWeek class of bugs likely lurk here (H13g was in similar code). |
| `recompileEngine.js` | 109 | MEDIUM-HIGH | Engine recompile logic — affects how engines are re-run after data change. |

### MEDIUM RISK — covered by indirect tests only

| Module | LOC | Risk | Reason |
|---|---|---|---|
| `fatigue.js` | 87 | MEDIUM | Fatigue detection — affects recovery recommendations. |
| `coldStartGuidelines.js` | 172 | MEDIUM | Guidelines for new users — tested indirectly via coachDirector. |
| `recalibration.js` | 56 | MEDIUM | Recalibration triggers — no direct tests. |
| `readiness.js` | 70 | MEDIUM | M15c deferred: clamp 10-100 hides real negative values. |
| `coachContext.js` | ✅ partial | MEDIUM | Only 5 tests for a critical composition module. Missing: CDL pattern integration with suppression, ctx.allSessions shape. |
| `dataIntegrity.js` | ✅ partial | LOW-MED | Only 4 tests for integrity validation. |

### LOW RISK — constants / pure data

| Module | LOC | Reason |
|---|---|---|
| `alerts.js` | 4 | Likely just exports — verify before writing tests |
| `exerciseMapping.js` | 40 | Data mapping constants |
| `muscleMap.js` | 129 | Data constants — muscle → exercise mapping |
| `logFilter.js` | 19 | Simple pure function |
| `logNormalize.js` | 19 | Simple pure function |

---

## Recommendations

### Priority 1 — Write tests for HIGH risk before FAZA 3 starts

1. `sys.js` — TDEE + body comp + user metrics. Most impact per test written.
2. `reality.js` — Reality check engine logic.
3. `responseProfile.js` — Frequency sensitivity (H13g class of bugs).
4. `recompileEngine.js` — Engine recompile triggers.

### Priority 2 — Extend thin coverage

5. `coachContext.js` — 5 → 15+ tests (CDL patterns, suppression logic, allSessions shape).
6. `dataIntegrity.js` — 4 → 10+ tests.
7. `fatigue.js` + `readiness.js` — medium priority.

### Priority 3 — Low-risk utilities (write if touching in future PRs)

8. `logFilter.js`, `logNormalize.js`, `exerciseMapping.js` — write tests when modifying.

### NOT recommended

- Writing tests blind for `adminPrefill.js` — M6g (Daniel-specific data) deferred to launch prep.
- Writing tests for `sentry.js` in isolation — C8g deferred to FAZA 3 observability.
- Writing tests for `alerts.js` until content verified (4 LOC may be just constants).

---

## Summary stats

| Category | Count |
|---|---|
| Engine modules total | 27 |
| Engine modules with tests | 16 (59%) |
| Engine modules WITHOUT tests | 11 (41%) |
| Util modules total | 12 |
| Util modules with tests | 9 (75%) |
| Util modules WITHOUT tests | 3 (25%) + sentry deferred |
| **Total modules** | **39** |
| **Total covered** | **25 (64%)** |
| **Total uncovered** | **14 (36%)** |
