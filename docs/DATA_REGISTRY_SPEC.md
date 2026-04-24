# DATA REGISTRY SPEC — Task #27

**File:** `src/util/dataRegistry.js`  
**Status:** ACTIVE (Task #27, 25 apr 2026)  
**Fixes:** C11c (reset cache cascade), H31c (incomplete reset), H32c (rerun onboarding post-reset)

---

## Purpose

Single source of truth for all localStorage keys used by SalaFull. Eliminates the registry gap
that caused H31c (dynamic keys surviving Full Reset) and provides the foundation for the
whitelist-based `fullReset` rewrite.

---

## Key Categories

### `USER_DATA_KEYS`
Stable training and nutrition data. Deleted by `fullReset`. Preserved by `resetTestData`.

Keys: `weights`, `kcals`, `prots`, `logs`, `readiness`, `phase-override`, `phase-log`,
`phase-change-date`, `bf-override`, `pr-records`, `current-kcal`, `suppl-list`, `waters`,
`workout-skips`, `session-burns`, `wellbeing`, `notif-enabled`, `closed-days`, `muted`,
`onboarding-done`, `onboarding-completed`, `last-recalibration`, `sf.userConfig`

### `TEST_RESIDUE_KEYS`
Coach/session transient state. Deleted by both `resetTestData` and `fullReset`.

Keys: `auto-recommendations`, `applied-patterns`, `applied-recommendations`, `early-stops`,
`session-draft`, `peak-hours`, `step-streaks`, `session-start-hours`, `session-ratings`,
`dev-mode`, `unavailable-equipment`, `equipment-occupied-session`, `pattern-learning-cache`,
`detected-patterns`, `weak-group-cache`, `response-profile`, `steps-today`

**Note H31c fix:** `equipment-occupied-session` and recalibration cache keys (`weak-group-cache`,
`response-profile`, `pattern-learning-cache`, `detected-patterns`) were previously missing from
all delete lists. Now included.

### `COACH_RELEVANT_KEYS`
Subset (11 keys) that trigger director cache invalidation via `scheduleInvalidation()` when
written through `DB.set`. Defined here, imported by `firebase.js` — single source of truth.

Keys (11): `logs`, `readiness`, `phase-override`, `current-kcal`, `weights`,
`unavailable-equipment`, `equipment-occupied-session`, `applied-patterns`,
`session-burns`, `early-stops`, `workout-skips`

### `DYNAMIC_KEY_PREFIXES`
Prefixes for keys generated at runtime with template literals. These keys can't be in any
static list — they're matched by prefix scan via `getAllDynamicKeys()`.

Prefixes: `ex-extra-sets-` (dp.js), `muscle-extra-` (renderIdle.js),
`aa-cooldown-` (aa.js), `backup-` (autoBackup.js / dataCleanup.js)

### `PRESERVE_ON_RESET_KEYS`
Keys that survive `fullReset`. The whitelist approach uses `localStorage.clear()` then restores
these three keys if they existed before the clear.

Keys: `device-id` (Firebase device identity), `active-theme` (UI preference), `last-backup` (undo)

---

## fullReset Whitelist Approach

**Old behavior** (blacklist, H31c root cause):
```javascript
const ALL_KEYS = [...TEST_RESIDUE_KEYS, ...USER_DATA_KEYS, 'onboarding-done', 'onboarding-completed'];
ALL_KEYS.forEach(k => localStorage.removeItem(k));
// Dynamic keys (ex-extra-sets-*, muscle-extra-*, aa-cooldown-*) were NOT deleted
```

**New behavior** (whitelist, Task #27):
```javascript
// Save preserve list
const preserved = {};
PRESERVE_ON_RESET_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v) preserved[k] = v; });
// Wipe everything
localStorage.clear();
// Restore preserve list
Object.entries(preserved).forEach(([k, v]) => localStorage.setItem(k, v));
// Write post-reload sync suppressor
localStorage.setItem('__suppressFirebaseSyncUntil', String(Date.now() + 10000));
```

---

## C11c Fix — Reset Cache Cascade

**Root cause:** `dataCleanup.js` called `window._directorCache.invalidate()` directly at 4 sites
(lines 174, 279, 339, 433), bypassing the debounce introduced in Task #26.

**Fix:** All 4 direct `invalidate()` calls replaced with `scheduleInvalidation()` (imported from
`firebase.js`). This routes through the 250ms debounce, collapsing reset-triggered invalidations
to 1 net event.

---

## H32c Fix — Rerun Onboarding Post-Reset

**Root cause:** `window._suppressFirebaseSync = true` in `fullReset` does not survive the
`location.reload()` call (window properties are lost on page load). After reload, `initFirebaseSync`
runs immediately and Firebase may return stale data (if the PUT null hasn't propagated yet),
restoring `onboarding-done: true` and all other data, effectively un-doing the reset.

**Fix:** Before any reset operation, write:
```javascript
localStorage.setItem('__suppressFirebaseSyncUntil', String(Date.now() + 10000));
```

`syncFromFirebase` in `firebase.js` now checks this key before fetching:
```javascript
const suppressUntil = localStorage.getItem('__suppressFirebaseSyncUntil');
if (suppressUntil && Date.now() < Number(suppressUntil)) {
  console.log('[Firebase] Sync suppressed post-reset until ...');
  return false;
}
```

The 10-second window covers the Firebase PUT null propagation delay. After the window expires,
Firebase sync resumes normally (on next page action).

---

## Known Gaps (not addressed in this task)

- `autoBackup.js` has its own local `USER_DATA_KEYS` list — not yet consolidated with registry.
  Will be addressed in a FAZA 3 cleanup pass.
- `SYNC_KEYS` in `firebase.js` is still defined inline — future consolidation can move it here.
- `steps-today` is in `TEST_RESIDUE_KEYS` but not in `SYNC_KEYS` — consistent, just noted.

---

## Feature Flag

`window.__dataRegistryEnabled = true` is set in `main.js` on app initialization. Provides a
console-visible signal that the registry is active. No behavior gating — for diagnostics only.
