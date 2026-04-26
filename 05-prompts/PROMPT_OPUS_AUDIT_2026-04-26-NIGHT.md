# Opus Audit Prompt — Night Run 2026-04-26

**Context:** SalaFull personal fitness coaching app (vanilla JS + Vite, local-first + Firebase RTDB).  
**Last 20 commits:** A full autonomous audit night run (Tasks 1-20) — all audit docs written and committed.

---

## Night Run Summary (Tasks 1-20 completed)

The following audit documents were produced in this run:

| Task | Doc | Key Finding |
|---|---|---|
| 5 | `02-audit/AA_INTEGRATION_AUDIT_NIGHT.md` | `autoAggressionDetection.js` is 100% complete module with 37 tests but ZERO production integration — never called from coachContext, endSession, or CDL |
| 6 | `02-audit/PROFILE_TYPING_INTEGRATION_AUDIT_NIGHT.md` | `profileTyping.js` (563 LOC, 42 tests) never called from onboarding or coach pipeline; `profile-history` key absent from dataRegistry and SYNC_KEYS |
| 7 | `06-findings-tracker/SYNC_KEYS_AUDIT_NIGHT.md` | 4 CDL keys absent from dataRegistry (CRITICAL); `sf.userConfig` missing from SYNC_KEYS (HIGH); `applied-patterns` reset conflict |
| 8 | `02-audit/ADR_CONSISTENCY_AUDIT_NIGHT.md` | 2 HIGH ADR drift issues (ADR 013+014 say "DONE" but integration missing); all cross-refs valid |
| 9 | `02-audit/ENGINE_CALL_GRAPH_NIGHT.md` | 5 dead-path modules; no circular deps; coachDirector hub with 14 imports |
| 10 | `06-findings-tracker/LOCALSTORAGE_KEYS_AUDIT_NIGHT.md` | 3 keys unregistered; coachContext bypasses DB wrapper on 8 keys |
| 11 | `06-findings-tracker/TODO_FIXME_INVENTORY_NIGHT.md` | 8 DEFERRED TODOs in weight.js/renderIdle.js; 0 FIXME/HACK |
| 12 | `06-findings-tracker/DEPENDENCIES_AUDIT_NIGHT.md` | All 9 deps used; zero unused/missing |
| 13 | `06-findings-tracker/COVERAGE_AUDIT_UPDATE_NIGHT.md` | 422→524 tests (+102); 2 new modules covered; sys.js/reality.js/responseProfile.js still untested HIGH risk |
| 14 | `02-audit/FIXTURES_USAGE_AUDIT_NIGHT.md` | cdlEntries.js 88% used; syntheticEntry never imported; schema is current |
| 15 | `02-audit/ERROR_HANDLING_AUDIT_NIGHT.md` | Sentry covers only CDL write failures; 2 empty catches in session.js; captureException wrapper bypassed |
| 16 | `06-findings-tracker/LOGGING_CONSISTENCY_AUDIT_NIGHT.md` | 65 console calls, 97% tagged; 2 untagged in firebase.js |
| 17 | `02-audit/ASYNC_USAGE_AUDIT_NIGHT.md` | No await-in-loop; Promise.all used correctly; 2 minor .catch() gaps in dynamic imports |
| 18 | `06-findings-tracker/MAGIC_NUMBERS_AUDIT_NIGHT.md` | Readiness thresholds (85/70/55/40) inline in 6 files — drift already present (<60 vs <55 inconsistency) |
| 19 | `02-audit/I18N_READINESS_AUDIT_NIGHT.md` | 100% Romanian, zero i18n infra — intentional; 1 English phrase in READINESS_LABELS |

---

## Critical Open Issues for Opus Analysis

### CRITICAL-1: Modules with tests but zero integration

`autoAggressionDetection.js` and `profileTyping.js` both have:
- Pure module implementation (DONE)
- Comprehensive unit tests (37 + 42 tests)
- ADR 013 + ADR 014 (architecture decisions)
- ZERO production wiring

These are the highest priority integration targets. The ADRs describe exactly what needs to be built, but the integration steps were deferred.

**Files to read:**
- `src/engine/autoAggressionDetection.js` (what it does)
- `src/engine/profileTyping.js` (what it does)
- `src/engine/coachContext.js` (where they need to be called)
- `src/util/coachDecisionLog.js` (where `autoAggression` field needs to be populated)
- `src/pages/coach/session.js` (`endSession` — where `detectAutoAggression` should be called)
- `docs/decisions/013-auto-aggression-detection.md` (ADR — what was designed)
- `docs/decisions/014-onboarding-profile-typing.md` (ADR — what was designed)

**Specific question for Opus:**
> Given the integration audit findings (02-audit/AA_INTEGRATION_AUDIT_*), what is the minimal complete implementation to wire `autoAggressionDetection.js` into the production pipeline? Specifically:
> 1. Where exactly in `endSession()` should `detectAutoAggression()` be called and with what CDL window?
> 2. What field does `populateOutcome()` need to write to persist the result?
> 3. What does `coachContext.js` need to read and expose for `coachDirector.js` to use the AA tier?
> 4. What UI intervention does ADR 013 specify for HIGH tier AA detection?

---

### CRITICAL-2: dataRegistry completeness gaps

4 CDL keys are absent from `dataRegistry.js` despite being active production data:
- `coach-decisions` (main CDL log)
- `coach-decisions-aggregate`
- `coach-decisions-archive`
- `cdl-patterns`

If `fullReset()` is run, these keys will NOT be cleared (they're not in TEST_RESIDUE_KEYS or USER_DATA_KEYS).

**Specific question for Opus:**
> `src/util/dataRegistry.js` — which category should `coach-decisions`, `coach-decisions-aggregate`, `coach-decisions-archive`, `cdl-patterns` be in? USER_DATA_KEYS or separate CDL_KEYS? What is the correct reset behavior for CDL data — should fullReset wipe CDL history, or preserve it like logs?

---

### CRITICAL-3: Coverage debt on high-risk modules

`sys.js` (297 LOC — TDEE, body comp, user metrics), `reality.js` (150 LOC), `responseProfile.js` (135 LOC) have ZERO tests.

**Question for Opus:**
> Starting with `src/engine/sys.js` — what are the 5-10 most important unit tests to write? Identify the pure functions, the key invariants, and any edge cases that could fail silently (body comp is particularly sensitive to input validation).

---

## Current Architecture (for Opus context)

- **Stack:** Vanilla JS + Vite, no framework, localStorage primary, Firebase RTDB secondary
- **Engine:** `coachDirector.js` as hub, 14 sub-engines, CDL (coach-decisions) as the behavioral log
- **ADRs:** 001-014 in `docs/decisions/` — authoritative architecture decisions
- **Tests:** 524 passing (37 test files), Vitest + Playwright

---

## Proposed Next FAZA C Tasks for Opus Review

Based on this audit night, the following are recommended for the next active sprint:

**Priority 1 (BLOCKING for meaningful coaching):**
1. Wire `detectAutoAggression` into `endSession()` + populate `outcome.autoAggression`
2. Add AA tier to `buildCoachContext()` output
3. Implement UI intervention for HIGH AA tier (friction modal per ADR 013)

**Priority 2 (Data integrity):**
4. Add CDL keys (`coach-decisions*`, `cdl-patterns`) to `dataRegistry.js`
5. Add `sf.userConfig` to `SYNC_KEYS` in `firebase.js`

**Priority 3 (Coverage debt):**
6. Write tests for `sys.js` (TDEE + body comp — highest impact)
7. Extract readiness thresholds to named constants in `readiness.js`

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
