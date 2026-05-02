# Test Coverage Report — Baseline (BATCH_07)

**Date:** 2026-05-02
**Tests run:** 1203 tests, 75 test files
**Tool:** vitest@3.2.4 + @vitest/coverage-v8@3.2.4

## Overall coverage

| Metric | Coverage |
|--------|----------|
| Lines | **60.33%** |
| Branches | **78.38%** |
| Functions | **77.73%** |
| Statements | **60.33%** |

**Tests delta context:** 1110 (pre Sprint 4.x) → 1174 (post Sprint 4.x BATCH_05) → 1203 (post BATCH_03 Golden Master).

## High coverage modules (≥90%) — sample top

- `src/schema/exerciseMetadata.js` — 100% / 85.7% (BATCH_03 + BATCH_05 audit)
- `src/schema/pricing.js` — 100% / 100% (BATCH_05 Sprint 4.x)
- `src/storage/db.js` — 97.27% / 77.41%
- `src/storage/tier2Stub.js` — 100% / 100%
- `src/storage/tieredRead.js` — 96.92% / 88.88%
- `src/storage/tieringEngine.js` — 94.66% / 65.67%
- `src/auth.js` — 93.66% / 66.1%
- `src/bootstrap.js` — 100% / 94.44%
- `src/constants.js` — 100%
- `src/util/cdlBackfill.js` — 97.02% / 85.39%
- `src/util/coachDecisionLog.js` — 91.54%
- `src/util/featureFlags.js` — 96.29% / 91.66%
- `src/util/isoWeek.js` — 100%
- `src/util/logBackup.js` — 100%
- `src/util/logFilter.js` — 100%
- `src/util/dataRegistry.js` — 100%
- `src/util/logsMigration.js` — 95.16%
- `src/util/tombstones.js` — 97.54%

## Gaps (<50%) — actionable

### UI / Pages (legitimate — UI testing requires e2e Playwright suite, NOT vitest unit)
- `src/pages/coach/logging.js` — 0% (UI page integration)
- `src/pages/coach/modals.js` — 0% (UI modals)
- `src/pages/coach/pr.js` — 0% (UI PR record)
- `src/pages/coach/rating.js` — 0% (UI rating modal)
- `src/pages/coach/restTimer.js` — 0% (UI timer)
- `src/pages/coach/state.js` — 0% (UI state machine)
- `src/pages/coach/util.js` — 0% (UI utils)
- `src/pages/coach/renderIdle.js` — 12.47% (UI render)

### Themes (visual layer)
- `src/themes/themeManager.js` — 0%
- `src/themes/themes.js` — 0%

### UI navigation
- `src/ui/nav.js` — 0%
- `src/ui/ui.js` — 36.84%

### Data cleanup / Sentry (boundary code)
- `src/util/dataCleanup.js` — 49.12% (data cleanup edge cases)
- `src/util/sentry.js` — 18.91% (error reporting integration)
- `src/util/adminPrefill.js` — 0% (admin tool)

## Zero coverage — entire files

UI / pages (10 files) + themes (2) + nav (1) + sentry (1) + admin (1) = ~15 files la 0%. Toate sunt UI integration / dev tools / themes — NU acoperite în unit tests, requires e2e Playwright suite (out of scope vitest unit coverage).

## Recommendations

### Pre-Beta priorities

- **None blocking pentru pilot Beta** — UI gaps vor fi acoperite de e2e Playwright tests existing (`tests/regression.spec.js`, `tests/visual.spec.js`, etc.) which run separately
- Engine layer (src/engine/) cu coverage ≥80% medie
- Schema + storage + auth cu coverage ≥90%

### Post-Beta backlog

- Sprint UI Integration va consume aceleași UI files (currently 0%) — coverage vrea cresc post-integration cu noi tests
- `dataCleanup.js` 49.12% — adăugare edge cases (storage full / corrupted state) post-Beta
- `sentry.js` 18.91% — error reporting tests post error scenarios real

### Sprint UI Integration impact estimate

- Sprint UI consume ~10 currently 0% UI files
- Post-Sprint coverage estimate: lines 60.33% → ~70-75% (adding 1500-2000 covered lines în UI)
- Confidence pre-Beta: HIGH (engines well-covered, UI = legitimate testing layer Playwright)

## Baseline locked

This report = baseline 2026-05-02 reference. Future cluster regression check:

```bash
npx vitest run --coverage
```

Compare against this baseline:
- **Lines:** 60.33% (target: maintain or grow)
- **Branches:** 78.38% (target: maintain)
- **Functions:** 77.73% (target: maintain)
- **Statements:** 60.33% (target: maintain or grow)

Flag dacă coverage drops >5% post Sprint UI Integration (signal regression).

## Cross-refs

- Tests delta tracking: HANDOVER_GLOBAL §36.64 (Golden Master adds 29) + Sprint 4.x cluster summary
- Sprint UI Integration scope: §36.71 cumulative session-lock (BATCH_10)
- Coverage tooling: `package.json` `@vitest/coverage-v8@^3.2.4` + `vitest.config.js` coverage section
