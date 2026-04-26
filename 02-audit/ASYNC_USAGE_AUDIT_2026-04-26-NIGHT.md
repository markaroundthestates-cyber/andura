# Async/Await Usage Audit — 2026-04-26 NIGHT

**Scope:** `src/` production code — async patterns, anti-patterns, parallelization opportunities  
**Total async functions:** 24  
**Method:** grep async/await, Promise.*, .then() patterns

---

## Async Function Distribution

| File | Async functions |
|---|---|
| `src/firebase.js` | 6 (fbGet, fbSet, fbRemove, clearFirebaseKeys, syncToFirebase, syncFromFirebase, initFirebaseSync) |
| `src/util/dataCleanup.js` | 8+ (fullReset, resetTestData, clearRemoteData, clearCaches, unregisterServiceWorker, clearIndexedDB, downloadBackup, etc.) |
| `src/util/sentry.js` | 1 (initSentry) |
| `src/pages/coach/session.js` | 1 (requestWakeLock) |
| `src/util/autoBackup.js` | 2 (initAutoBackup, restoreFromBackup) |
| Others | misc |

---

## Good Patterns

### Promise.allSettled for parallel removals (firebase.js)

```js
const results = await Promise.allSettled(
  keys.map(async key => {
    const ok = await fbRemove(`${USER_PATH}/${key}`);
    ...
  })
);
```

`clearFirebaseKeys` uses `Promise.allSettled` for parallel key removals — correct. No serial bottleneck.

---

### Promise.all for independent IO operations (dataCleanup.js)

```js
await Promise.all(registrations.map(r => r.unregister()));
await Promise.all(cacheKeys.map(k => caches.delete(k)));
await Promise.all(dbs.map(db => new Promise((res) => { ... })));
await Promise.all(TEST_RESIDUE_KEYS.map(k => fbModule.removeKey(k).catch(() => {})));
```

Independent cleanup operations correctly parallelized. Good.

---

### initFirebaseSync — correct sequential dependency

```js
const synced = await syncFromFirebase();
if (synced) {
  await syncToFirebase();  // must come after sync-from (push merged local back)
}
```

Serial awaits here are intentional — `syncToFirebase` must run AFTER `syncFromFirebase` to push back merged data. Not an anti-pattern.

---

## Issues

### A1 — `.then()` mixed with async/await in main.js (MINOR)

**File:** `src/main.js:124`
```js
import('./firebase.js').then(m => m.syncToFirebase && m.syncToFirebase());
```

This is inside an event listener (not inside an `async function`), so `.then()` is forced by context. However, the inner `syncToFirebase()` is called without `await` — intentional fire-and-forget, but has no `.catch()`.

**Pattern mixing risk:** LOW — the pattern is readable. The missing `.catch()` is the actual issue (noted in ERROR_HANDLING_AUDIT).

---

### A2 — `.then()` in modals.js dynamic import (MINOR)

**File:** `src/pages/coach/modals.js:156`
```js
import('../../engine/whyEngine.js').then(({ explainRecommendation }) => {
  ...
});
```

Not inside an `async` function context, so `.then()` is the correct form here. No `.catch()` is the concern (same as A1).

---

### A3 — initSentry fire-and-forget without await (INTENTIONAL)

**File:** `src/main.js:3`
```js
initSentry(); // fire-and-forget, production only
```

`initSentry` is `async` but called without `await`. This is intentional — Sentry init is non-blocking and must not delay app startup.

**Assessment:** OK — documented with comment. Not an anti-pattern given the intent.

---

### A4 — syncToFirebase fire-and-forget in rating.js (INTENTIONAL)

**File:** `src/pages/coach/rating.js:85`
```js
syncToFirebase().catch(() => {});
```

Explicit fire-and-forget with empty `.catch()`. Intent is clear: post-rating sync is non-blocking.

**Assessment:** OK. The `.catch(() => {})` prevents unhandled rejection. Intentional.

---

### A5 — No await-in-loop anti-patterns found

No `for` loop containing sequential `await` calls was found. All batch async operations correctly use `Promise.all` or `Promise.allSettled`.

---

### A6 — dataCleanup.js serial IO steps that could theoretically parallelize

**File:** `src/util/dataCleanup.js` — `fullReset()`
```js
const registrations = await navigator.serviceWorker.getRegistrations();
await Promise.all(registrations.map(r => r.unregister()));
// ...
const cacheKeys = await caches.keys();
await Promise.all(cacheKeys.map(k => caches.delete(k)));
// ...
const dbs = await indexedDB.databases();
await Promise.all(dbs.map(...));
```

Three serial `getRegistrations → clear`, `keys → clear`, `databases → clear` blocks. Could be done in parallel with:
```js
await Promise.all([
  clearServiceWorkers(),
  clearCaches(),
  clearIndexedDB()
]);
```

**Risk:** LOW — fullReset is infrequent destructive operation. Performance is not a concern here.  
**Recommendation:** Not worth refactoring.

---

## Summary

| ID | Finding | Severity |
|---|---|---|
| A1 | `.then()` in main.js without `.catch()` | MINOR (see ERROR_HANDLING_AUDIT) |
| A2 | `.then()` in modals.js without `.catch()` | MINOR |
| A3 | initSentry fire-and-forget | INTENTIONAL — OK |
| A4 | syncToFirebase fire-and-forget in rating.js | INTENTIONAL — OK |
| A5 | Await-in-loop anti-patterns | NONE FOUND ✓ |
| A6 | Serial IO in fullReset | LOW / not worth refactoring |

**Overall:** Async usage is clean. No `await` inside `forEach`, no unintended sequential bottlenecks in hot paths. The two `.then()` issues (A1, A2) are minor and share the missing `.catch()` finding already documented in the error handling audit.

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
