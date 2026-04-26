# Error Handling Audit — 2026-04-26 NIGHT

**Scope:** `src/` production code — try/catch coverage, swallowed errors, Sentry integration, unhandled promises  
**Method:** grep try/catch, grep catch({}), grep .then() without .catch(), read Sentry integration  
**Total try/catch blocks:** 68 in production code (excl. tests)

---

## Summary by Category

| Category | Count | Status |
|---|---|---|
| Good: try/catch with fallback return | ~35 | OK |
| Good: try/catch with Sentry capture | 3 | OK (CDL paths only) |
| Concern: silent empty catch `catch {}` or `catch (e) {}` | 12 | REVIEW |
| Concern: `.then()` without `.catch()` | 2 | MINOR |
| Concern: Firebase errors filtered from Sentry | 1 pattern | KNOWN (C8g) |

---

## Good Patterns

### db.js — JSON.parse safety wrapper

```js
get: k => { try { return JSON.parse(localStorage.getItem(k) || 'null') } catch { return null } }
```

**Pattern:** Parse error → return null. Consistent, prevents crash on corrupt storage.

---

### firebase.js — network error resilience

All three primitives (`fbGet`, `fbSet`, `fbRemove`) follow identical pattern:
```js
async function fbGet(path) {
  try {
    const r = await fetch(...)
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}
```

`syncToFirebase` and `syncFromFirebase` also caught: return `false` on network failure.

**Assessment:** Correct. Firebase is best-effort (ADR 002 — local-first). Silent null/false on failure is intentional.

---

### coachDirector.js + session.js — CDL write degraded mode

CDL write failures are the only path with both catch + Sentry:
```js
try { await writeProposed(...) }
catch (err) {
  Sentry.captureException(err, { tags: { component: 'coachDirector', op: 'cdl_write' } });
  // continue with cdlEntryId: null
}
```

Same pattern in `session.js` for CDL `populateOutcome` (cancel + end-session paths).

**Assessment:** Correct. CDL is critical data — degraded mode with Sentry notification is the right approach.

---

### coachDirector.js — proactive checks isolation

```js
try { ... proactive engine checks ... }
catch { /* proactive checks are non-blocking */ }
```

**Assessment:** Acceptable. Proactive recommendations are advisory, not blocking. Silent catch correct.

---

## Concerns

### C1 — Empty silent catches in session.js (MEDIUM)

**File:** `src/pages/coach/session.js:135`, `:236`
```js
} catch (_) {}
```

Two distinct catch blocks swallow errors completely with no logging. Context around line 135 is CDL cancel outer block; around 236 is end-session.

**Risk:** If a non-CDL error occurs in these paths (e.g., `state` corruption), it disappears silently. No log, no Sentry.

**Recommendation:** Add `console.error('[session] unexpected error:', _)` at minimum, or verify these are intentionally ignoring only specific benign errors.

---

### C2 — Empty silent catch in ui.js (LOW)

**File:** `src/ui/ui.js:28`
```js
} catch (e) {}
```

No logging. If UI render fails, error vanishes.

**Risk:** LOW — UI utilities often wrap browser API calls (scroll, focus, etc.) where errors are expected in certain states. Verify line 28 context confirms this assumption.

---

### C3 — WakeLock release silent catch (ACCEPTABLE)

**File:** `src/pages/coach/session.js:315`
```js
try { if (wakeLockRef.current) { wakeLockRef.current.release()... } } catch (e) {}
```

WakeLock is a browser API that can throw on certain states. Silent catch is standard practice for WakeLock.

**Assessment:** OK — intentional.

---

### C4 — Promise chains without `.catch()` (MINOR)

**File:** `src/main.js:124`
```js
import('./firebase.js').then(m => m.syncToFirebase && m.syncToFirebase());
```

**File:** `src/pages/coach/modals.js:156`
```js
import('../../engine/whyEngine.js').then(({ explainRecommendation }) => { ... });
```

Neither `.then()` has a `.catch()` chained.

**Risk:** If the dynamic import itself fails (network error on chunk load), it results in an unhandled promise rejection. `syncToFirebase` internally catches errors, but the import itself may not.

**Recommendation:** Add `.catch(() => {})` or `.catch(e => console.warn(...))` to both.

---

### C5 — Firebase errors filtered from Sentry (KNOWN — C8g)

**File:** `src/util/sentry.js:35-37`
```js
if (msg.includes('NetworkError') || msg.includes('Failed to fetch')) return null;
if (msg.includes('Firebase') || msg.includes('firebasedatabase')) return null;
```

All Firebase and network errors are explicitly filtered before reaching Sentry.

**Risk:** Firebase sync failures in production are invisible in Sentry. If sync breaks, there is no alert path.

**Status:** Deferred per C8g — FAZA 3 observability work. Noted here for completeness.

---

### C6 — Sentry integration inconsistency (MEDIUM)

**Pattern A:** `window.Sentry?.captureException(err, ...)` — used in coachDirector.js, session.js  
**Pattern B:** `captureException(error, context)` from `util/sentry.js` — defined but NOT used anywhere outside sentry.js itself

`captureException` utility function in `util/sentry.js` (line ~60) wraps the call with scope/extras. But production code bypasses this wrapper and calls `window.Sentry?.captureException` directly (without proper scope extras).

**Risk:** The `captureException` wrapper in sentry.js adds structured extras via `scope.setExtra`. The direct `window.Sentry?.captureException` calls skip this — error context in Sentry is minimal.

**Recommendation:** Standardize on the `captureException` wrapper from `util/sentry.js`. Import and use it instead of `window.Sentry` directly.

---

### C7 — coachContext.js — many inline try/catch, inconsistent logging (LOW)

`coachContext.js` has 12+ try/catch blocks, each returning a safe default. Pattern is correct but inconsistent — some have `console.warn` on catch, others are silent.

**Risk:** LOW — all return safe defaults. But if context assembly silently fails on a key dimension (e.g., CDL patterns), coachDirector receives degraded context with no observable signal.

---

## Async Functions Without Error Propagation

All `async` functions in `firebase.js` catch internally and return `null`/`false`. No async function propagates throws to callers — callers cannot distinguish "empty data" from "network error" except by checking return value explicitly.

This is consistent with ADR 001 (local-first) and intentional design.

---

## Sentry Coverage Map

| Component | CDL write | Network | Engine errors | UI errors |
|---|---|---|---|---|
| coachDirector | ✓ Sentry | — | ✗ silent | — |
| session.js (CDL cancel/end) | ✓ Sentry | — | ✗ silent outer | — |
| firebase.js | — | ✗ filtered (C8g) | — | — |
| main.js | ✗ | — | — | — |
| weight.js | — | — | — | ✗ silent |
| pages (general) | — | — | — | ✗ no coverage |

**Sentry coverage is narrow:** Only CDL write failures are observed. All other critical paths (context build failures, page render errors, engine exceptions) are invisible in Sentry.

---

## Summary by Severity

| ID | Finding | Severity |
|---|---|---|
| C1 | Empty silent catches in session.js (lines 135, 236) | MEDIUM |
| C6 | Sentry wrapper bypassed — direct `window.Sentry` calls | MEDIUM |
| C4 | Dynamic import `.then()` without `.catch()` | MINOR |
| C5 | Firebase errors filtered from Sentry | KNOWN (C8g deferred) |
| C2 | Silent catch in ui.js | LOW |
| C3 | WakeLock silent catch | ACCEPTABLE |
| C7 | coachContext.js inconsistent catch logging | LOW |

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
