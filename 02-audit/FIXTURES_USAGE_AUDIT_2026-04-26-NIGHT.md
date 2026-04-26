# Test Fixtures Usage Audit — 2026-04-26 NIGHT

**Scope:** `tests/fixtures/cdlEntries.js` — exports, consumers, coverage gaps  
**Other fixtures dirs:** `tests/e2e/fixtures/` (users.js — separate e2e fixture, NOT in scope)

---

## Fixture File: tests/fixtures/cdlEntries.js

**LOC:** 753  
**Schema compliance:** ADR 011 (incl. 2026-04-26 extension: `autoAggression`, `rest_marked`, `setsRPE`)

---

## Exported Functions

### Helpers (utilities)

| Export | Type | Purpose |
|---|---|---|
| `dateOffset(daysAgo)` | utility | Returns `YYYY-MM-DD` string for N days ago |
| `tsOffset(daysAgo, hour)` | utility | Returns Unix timestamp for N days ago |

### Factories (single entry builders)

| Export | Type | Purpose |
|---|---|---|
| `realWorkoutEntry(opts)` | factory | `executed=true`, full outcome, supports `setsRPE`, `earlyStop`, `rating` |
| `syntheticEntry(opts)` | factory | `synthetic=true`, all extension fields null |
| `skipEntry(opts)` | factory | `executed=false`, `rest_marked` 3-state (null/true/false) |
| `deviationEntry(opts)` | factory | `deviation=true`, `actualSets > proposedSets`, `deviationReason` support |
| `entryWithAA(opts)` | factory | Extends `realWorkoutEntry` with populated `autoAggression` field |

### Scenarios (pre-built CDL arrays)

| Export | Type | Purpose |
|---|---|---|
| `scenarioVolumeCreep(opts)` | scenario | ≥3 consecutive deviation entries within 21 days (AA signal #1) |
| `scenarioRecoveryDebt(opts)` | scenario | Multi-week recovery deficit via rest_marked patterns (AA signal #5) |
| `scenarioCompositeFatigue(opts)` | scenario | ≥50% Hard/Very Hard setsRPE per session (AA signal #4) |
| `scenarioHyperfocus(opts)` | scenario | 8h+ in app 4+ days/week — returns `{ cdlEntries, hyperfocusData }` |
| `scenarioClean(opts)` | scenario | No AA signals, healthy pattern baseline |
| `scenarioSprinter(opts)` | scenario | Sprinter behavioral signature for profileTyping |
| `scenarioMarathon(opts)` | scenario | Marathon behavioral signature for profileTyping |
| `scenarioYoyo(opts)` | scenario | Yo-yo signature — returns `{ cdlEntries, hyperfocusData }` |
| `scenarioStrategic(opts)` | scenario | Strategic signature — conscious deviations with reason |

**Total exports:** 16 (2 helpers + 5 factories + 9 scenarios)

---

## Consumers

| File | Type | Imported from cdlEntries.js |
|---|---|---|
| `src/engine/__tests__/autoAggressionDetection.test.js` | unit test | `dateOffset, realWorkoutEntry, deviationEntry, skipEntry, entryWithAA, scenarioVolumeCreep, scenarioRecoveryDebt, scenarioCompositeFatigue, scenarioHyperfocus, scenarioClean` |
| `src/engine/__tests__/profileTyping.test.js` | unit test | `realWorkoutEntry, deviationEntry, skipEntry, scenarioVolumeCreep, scenarioClean, scenarioSprinter, scenarioMarathon, scenarioYoyo, scenarioStrategic` |
| `src/engine/__tests__/coachDirector.test.js` | unit test | NOT imported (coachDirector uses inline test data) |

**Total consumers:** 2 unit test files

---

## Coverage: Exported functions vs usage

| Export | Used by AA test | Used by Profile test | Status |
|---|---|---|---|
| `dateOffset` | ✓ | — | USED |
| `tsOffset` | — | — | UNUSED ⚠️ |
| `realWorkoutEntry` | ✓ | ✓ | USED |
| `syntheticEntry` | — | — | UNUSED ⚠️ |
| `skipEntry` | ✓ | ✓ | USED |
| `deviationEntry` | ✓ | ✓ | USED |
| `entryWithAA` | ✓ | — | USED |
| `scenarioVolumeCreep` | ✓ | ✓ | USED |
| `scenarioRecoveryDebt` | ✓ | — | USED |
| `scenarioCompositeFatigue` | ✓ | — | USED |
| `scenarioHyperfocus` | ✓ | — | USED |
| `scenarioClean` | ✓ | ✓ | USED |
| `scenarioSprinter` | — | ✓ | USED |
| `scenarioMarathon` | — | ✓ | USED |
| `scenarioYoyo` | — | ✓ | USED |
| `scenarioStrategic` | — | ✓ | USED |

**Used:** 14/16 (88%)  
**Unused:** 2/16 (12%)

---

## Unused Exports

### `tsOffset` — unused utility

`tsOffset(daysAgo, hour)` returns a Unix timestamp for N days ago.  
Never imported. `dateOffset` (string form) is used instead.  
`realWorkoutEntry` already calls `dateToTs()` internally to convert the date string to ts.

**Risk:** LOW — utility never called. No dead logic risk.  
**Recommendation:** Remove if not planned for near-term use, OR keep if `tsOffset` is reserved for future direct-timestamp fixtures.

### `syntheticEntry` — unused factory

`syntheticEntry(opts)` builds `synthetic=true` CDL entries for backfill history scenarios.  
Never imported in any test file.

**Risk:** MEDIUM — synthetic entries are a distinct CDL category with different schema behavior (`partial: true`, null readiness, null duration). Not having tests that use synthetic entries means the distinction between real and synthetic entries in pattern learning / adherence calculations is untested via fixtures.

**Known context:** `cdlBackfill.js` writes synthetic entries. `adherence.test.js` and `patternLearning.test.js` may use inline synthetic entries or stubs — NOT via this factory.

**Recommendation:** Either use in cdlBackfill or patternLearning tests, or document why it's not needed.

---

## Schema Currency Check

Fixture schema vs ADR 011 extended schema (2026-04-26):

| ADR 011 extension field | Present in fixtures? |
|---|---|
| `outcome.autoAggression` | ✓ (`entryWithAA`, null in base factories) |
| `outcome.rest_marked` | ✓ (`skipEntry` — null/true/false) |
| `outcome.setsRPE` | ✓ (`realWorkoutEntry`, `deviationEntry`, `scenarioCompositeFatigue`) |

**Schema is current.** All 3 extension fields are present and testable.

---

## E2E Fixture Separation

`tests/e2e/fixtures/users.js` is a SEPARATE fixture file (e2e user states: EMPTY, CUT_ACTIVE, WITH_HISTORY, CONTAMINATED).  
It does NOT import from `cdlEntries.js` — different abstraction layer.

**No cross-contamination between unit and e2e fixture layers.** Clean separation.

---

## Summary

| Category | Count |
|---|---|
| Total exports | 16 |
| Used exports | 14 (88%) |
| Unused exports | 2 (tsOffset, syntheticEntry) |
| Consumer test files | 2 |
| Schema currency | Current (ADR 011 extended) |

**Overall:** Fixture file is well-structured and mostly used. `syntheticEntry` is the notable gap — synthetic CDL entries exist in production (cdlBackfill) but are not exercised via fixtures in any test.

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
