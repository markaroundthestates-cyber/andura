# Logging Consistency Audit — 2026-04-26 NIGHT

**Scope:** `src/` production code — all `console.*` calls, prefix patterns, severity levels  
**Method:** grep console.log/warn/error/info/debug  
**Total console calls:** 65 (36 log + 23 warn + 6 error + 0 info + 0 debug)

---

## Volume by File

### console.log

| File | Count |
|---|---|
| `src/util/dataCleanup.js` | 19 |
| `src/util/sentry.js` | 4 |
| `src/firebase.js` | 4 |
| `src/main.js` | 3 |
| `src/engine/recalibration.js` | 2 |
| `src/util/logsMigration.js` | 1 |
| `src/util/adminPrefill.js` | 1 |
| `src/pages/coach/state.js` | 1 |
| `src/engine/coachDirector.js` | 1 |

### console.warn

| File | Count |
|---|---|
| `src/util/dataCleanup.js` | 11 |
| `src/firebase.js` | 4 |
| `src/util/sentry.js` | 2 |
| `src/pages/coach/session.js` | 2 |
| `src/util/coachDecisionLog.js` | 1 |
| `src/util/autoBackup.js` | 1 |
| `src/pages/coach/renderIdle.js` | 1 |
| `src/engine/coachContext.js` | 1 |

### console.error

| File | Count |
|---|---|
| `src/pages/coach/session.js` | 2 |
| `src/util/dataCleanup.js` | 1 |
| `src/util/autoBackup.js` | 1 |
| `src/main.js` | 1 |
| `src/engine/coachDirector.js` | 1 |

### console.info / console.debug

**Zero usage** — not used anywhere in production code.

---

## Prefix / Tag Analysis

### Tagged logs (with `[Module]` prefix) — 63/65 = 97%

| Tag | Count | Module |
|---|---|---|
| `[DataCleanup]` | 31 | dataCleanup.js |
| `[Sentry]` | 6 | sentry.js |
| `[Firebase]` | 6 | firebase.js |
| `[session]` | 4 | session.js |
| `[CDL]` | 3 | coachDecisionLog.js |
| `[Recalibration]` | 2 | recalibration.js |
| `[Migration]` / `[Migration UTC→Local]` | 3 | logsMigration.js |
| `[CoachDirector]` | 2 | coachDirector.js |
| `[renderIdle]` | 1 | renderIdle.js |
| `[coachContext]` | 1 | coachContext.js |
| `[Calibration]` | 1 | calibration.js |
| `[Cache]` | 1 | firebase.js |
| `[AdminPrefill]` | 1 | adminPrefill.js |
| `[inject]` | 1 | inject.js |

**Coverage:** 97% of console calls use `[Module]` prefix. Very consistent.

---

## Issues

### L1 — 2 untagged console.warn in firebase.js (LOW)

**File:** `src/firebase.js:70`, `:121`
```js
console.warn('Firebase sync failed:', e);
console.warn('Firebase load failed:', e);
```

Missing `[Firebase]` prefix. 4 other firebase.js console calls ARE tagged.

**Fix:** `console.warn('[Firebase] sync failed:', e)` and `console.warn('[Firebase] load failed:', e)`

---

### L2 — Tag capitalization inconsistency (COSMETIC)

Mixed capitalization across tags:
- `[DataCleanup]` — PascalCase
- `[session]` — lowercase
- `[coachContext]` — camelCase
- `[CoachDirector]` — PascalCase
- `[renderIdle]` — camelCase

**Risk:** NONE — cosmetic. Module is identifiable regardless.  
**Recommendation:** Standardize to PascalCase at next edit (not urgent).

---

### L3 — dataCleanup.js dominates log output (OBSERVATION)

30 out of 65 console calls (46%) are in `dataCleanup.js`. In production normal operation:
- `fullReset()` alone logs 8+ lines
- `resetTestData()` logs 4 lines per call

This is verbose but intentional for a destructive operation with audit trail requirements. No change needed.

---

### L4 — recalibration.js has 2 console.log (DEAD PATH)

`src/engine/recalibration.js` has 2 `console.log` calls. Per ENGINE_CALL_GRAPH_NIGHT, this module is a DEAD PATH (not imported in production). Logs will never fire in production.

---

### L5 — No console.info or console.debug (OBSERVATION)

Zero uses of `console.info` or `console.debug`. All informational logging is via `console.log`.  
This is consistent — no severity gradient between `log` and `info`. The pattern is:  
`console.log` = operational trace, `console.warn` = degraded mode, `console.error` = failure.

---

## Severity Usage Correctness

Spot-checking severity semantics:

| Severity | Usage examples | Correct? |
|---|---|---|
| `console.error` | CDL write failure, autoBackup restore fail, main.js error init | ✓ Reserved for real failures |
| `console.warn` | Firebase sync failed (non-blocking), CDL outcome skipped, session CDL cancel skipped | ✓ Degraded mode, non-blocking |
| `console.log` | DataCleanup progress, Sentry init, Firebase key operations, coaching calibration | ✓ Operational trace |

**Severity semantics are consistent.** No misuse of `console.error` for warnings or vice versa.

---

## Summary

| Metric | Value | Status |
|---|---|---|
| Total console calls | 65 | OK |
| Tagged with `[Module]` | 63 (97%) | ✓ Very good |
| Untagged calls | 2 | Minor fix needed |
| Severity semantics | Consistent | ✓ |
| `console.info/debug` | 0 | ✓ (no noisy debug logs) |
| Dead path logs | 2 (recalibration.js) | Non-blocking |

**Overall:** Logging is well-structured and nearly uniform. Only 2 untagged calls in firebase.js and cosmetic capitalization inconsistency.

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
