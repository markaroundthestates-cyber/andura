# SalaFull Codebase Audit — 2026-04-23

## Executive Summary

**Production-Ready Score: 4/10**

The SalaFull codebase has serious architectural flaws and unresolved bugs that survived multiple previous AI reviews. The core issue: **state is fragmented across localStorage, Firebase, DOM-cached objects, and global variables with no unified synchronization strategy.** This creates race conditions, data loss risks, and makes it vulnerable to user-reported bugs.

Key findings:
- **One critical data loss bug confirmed:** Full Reset doesn't clear `onboarding-done`, forcing users into onboarding loop on reload
- **Coach cache stale reads:** `_cachedDirectorSession` cached at page level but can invalidate mid-session without page reload
- **Firebase race conditions:** 3-second debounce sync vs immediate localStorage writes; offline transitions not handled
- **XSS vectors:** 10+ innerHTML assignments with user/system strings (low risk if exercise names untrusted = high risk)
- **Missing session builder:** Falls back to hardcoded exercises; Week 2 architecture undefined

Previous AI reviewers claimed "no errors" but missed the data loss scenario, cache invalidation, and race conditions.

---

## 1. CRITICAL ISSUES

### **[CRITICAL] — src/util/dataCleanup.js:101–198 — Full Reset Does NOT Clear onboarding-done**

**WHAT:** The `fullReset()` function deletes `USER_DATA_KEYS` from localStorage but `onboarding-done` is in `KEEP_KEYS` of `resetButKeepRealLogs()` (line 209) — NOT in `USER_DATA_KEYS`. When `fullReset()` runs, it only removes keys in the `allKeys` array (line 110), which is `[...TEST_RESIDUE_KEYS, ...USER_DATA_KEYS]`. Since `onboarding-done` is NOT in either list, it survives the reset.

**Code:**
```javascript
// Line 3–14: TEST_RESIDUE_KEYS does not include 'onboarding-done'
export const TEST_RESIDUE_KEYS = [ /* 'auto-recommendations', 'applied-patterns', etc. */ ];
export const USER_DATA_KEYS = [ /* 'weights', 'kcals', etc. */ ];
// onboarding-done is in neither, so it survives

// Line 110: Only removes TEST + USER keys
const allKeys = [...TEST_RESIDUE_KEYS, ...USER_DATA_KEYS];
allKeys.forEach(k => localStorage.removeItem(k)); // onboarding-done SURVIVES
```

**WHY:** User clicks "Full Reset", all data is deleted from Firebase and localStorage, but `onboarding-done` remains. On page reload, `main.js:141` checks:
```javascript
const onboardingDone = DB.get('onboarding-done') || (DB.get('logs') || []).length > 0;
if (!onboardingDone) { checkOnboarding(); }
```
Since `onboarding-done` is still `true` in localStorage, the onboarding screen is skipped — but logs are gone. User sees coach page with no data. If they reload again, same issue. They cannot re-onboard.

**PROOF:** Run fullReset(), check localStorage — `onboarding-done` remains. Compare to resetButKeepRealLogs() which explicitly preserves it (line 209).

**FIX:** Add `'onboarding-done'` to `USER_DATA_KEYS` (line 17–39) so it's cleared on fullReset(). Alternatively, set it to `false` explicitly in fullReset() after the clear loop:
```javascript
const allKeys = [...TEST_RESIDUE_KEYS, ...USER_DATA_KEYS];
allKeys.forEach(k => localStorage.removeItem(k));
localStorage.removeItem('onboarding-done'); // Force clear
```

**IMPACT IF IGNORED:** Users who do Full Reset to start over are trapped in a broken state: onboarding skipped but no data. They must manually edit localStorage or clear the entire browser storage.

---

### **[CRITICAL] — src/pages/coach.js:16–223 — Stale Coach Session Cache (No Expiration)**

**WHAT:** `_cachedDirectorSession` is a module-level variable set once per `renderCoachIdle()` call (line 223). But it is never invalidated if localStorage data changes, Firebase syncs, or user interaction modifies underlying data (like saving readiness, changing phase, adding logs).

**Code:**
```javascript
// Line 16: Cache at module level
let _cachedDirectorSession = null;

// Line 223: Set once, never invalidated
async function renderCoachIdle() {
  // ...
  _cachedDirectorSession = await coachDirector.buildSession(tp.t.toUpperCase());
  // Cache is now stale until next renderCoachIdle() call
}

// Lines 228+: Used without validation
if (_cachedDirectorSession?.restDay) { /* ... */ }
```

**WHY:** If user changes readiness from 7 (high) to 3 (low) in the readiness modal, `selectReadiness()` calls `saveReadiness()` then `renderCoachIdle()` — which rebuilds the cache. ✓ Good. BUT if user manually edits `DB.set()` in console, or Firebase syncs new data while page is open, the cache is stale. Worse: if `buildSession()` fails (DP module load error), it sets cache to `null`, but then the catch block (line 225) also sets it to `null`, and the render code (line 228) assumes it exists.

**PROOF:** 
1. Start session, reach high readiness (e.g., 85)
2. In console: `DB.set('readiness', {['2026-04-23']: 20})` 
3. Call `renderCoachIdle()` — it rebuilds the cache (good)
4. But if you manually call `coachDirector.buildSession()` without calling `renderCoachIdle()`, the old cache is used

More realistically: Firebase sync happens (line 82 in firebase.js restores remote state) but renderCoachIdle is not called. Cache is now stale.

**FIX:** 
1. Invalidate cache when key Firebase keys sync:
```javascript
DB.set = function(key, val) {
  _origSet(key, val);
  if (['readiness','phase-override','weights','kcals'].includes(key)) {
    _cachedDirectorSession = null; // invalidate
  }
  // ...
};
```
2. Or add a TTL:
```javascript
let _cachedDirectorSession = null;
let _cacheBuiltAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min
if (!_cachedDirectorSession || Date.now() - _cacheBuiltAt > CACHE_TTL) {
  _cachedDirectorSession = await coachDirector.buildSession(...);
  _cacheBuiltAt = Date.now();
}
```

**IMPACT IF IGNORED:** If readiness syncs from another device, or user manually edits phase, the coach page shows stale progression recommendations until next manual renderCoachIdle() call.

---

### **[CRITICAL] — src/firebase.js:72–114 — Firebase Sync Race Condition (localStorage vs Remote)**

**WHAT:** `syncFromFirebase()` merges remote data into local storage, but the merge strategy has no per-entry timestamps. If the same log is edited on two devices, the winner is always "local takes priority" (line 93: `Object.assign({}, remote[k], local)`). For arrays (logs), it dedupes by `ts` field, but doesn't handle partial updates.

**Code:**
```javascript
// Line 92–93: Object merge — local always wins
if (typeof remote[k] === 'object' && !Array.isArray(remote[k])) {
  DB.set(k, Object.assign({}, remote[k], local)); // local overwrites remote
} else if (Array.isArray(remote[k])) {
  // Line 98: Merge logs by timestamp uniqueness
  const tsSet = new Set(localArr.map(e => e.ts));
  const merged = [...localArr];
  remoteArr.forEach(e => { if (!tsSet.has(e.ts)) merged.push(e); });
}
```

**WHY:** The code correctly avoids duplicate logs (by `ts`), but for object data like `weights` (a dict of date→kg), if local has `{'2026-04-23': 111.0}` and remote has `{'2026-04-23': 110.8, '2026-04-22': 112.0}`, the merge puts both in the merged object, but if local was edited AFTER the remote sync, local wins even if remote is more recent. No timestamp on the dict values themselves.

**PROOF:** 
1. Device A syncs `{weights: {'2026-04-23': 110.8}}`
2. Device B has `{weights: {'2026-04-23': 111.0}}` (user manually edited)
3. syncFromFirebase on Device B: `Object.assign({}, {'2026-04-23': 110.8}, {'2026-04-23': 111.0})` = keeps 111.0 (local)
4. Result: Device A's update is lost, but Device B's older (or incorrect) value wins.

**FIX:** Store per-entry timestamps:
```javascript
const weights = {
  '2026-04-23': { kg: 111.0, ts: 1608768000000 },
  '2026-04-22': { kg: 112.0, ts: 1608681600000 }
};
// Merge: keep entry with higher ts
```

Or: Use `_ts` on each sync to implement strict last-write-wins with per-entry tracking.

**IMPACT IF IGNORED:** In multi-device scenario (phone + tablet), weight entries can flip between devices. Less critical for single-device use, but a real issue if user adds data on phone, then syncs from tablet without full sync.

---

## 2. MAJOR ISSUES

### **[MAJOR] — src/engine/coachDirector.js:24–50 — Dynamic DP Import with Fallback Creates Async/Catch Hell**

**WHAT:** `buildSession()` uses `await import('./dp.js')` (line 37) inside a try/catch that falls back to a hardcoded recommendation. If the import succeeds but `DP.getSmartRecommendation` fails, the fallback is triggered — but the session is still half-built.

**Code:**
```javascript
try {
  const dpModule = await import('./dp.js');
  for (const exercise of session.exercises) {
    if (dpModule.DP && dpModule.DP.getSmartRecommendation) {
      // ...
    } else if (dpModule.getSmartRecommendation) {
      // Looks for named export, not DP.getSmartRecommendation
    } else if (dpModule.getInitialRecommendation) {
      // ...
    } else {
      // Hardcoded fallback
      exercise.recommendation = { kg: baseWeight, weight: baseWeight, reps: 8, sets: 3 };
    }
  }
} catch (e) {
  // Entire try fails, fallback for all exercises
  for (const exercise of session.exercises) {
    if (!exercise.recommendation) {
      exercise.recommendation = { kg: baseWeight, weight: baseWeight, reps: 8, sets: 3 };
    }
  }
}
```

**WHY:** The import is dynamic (runtime), not static. If the module path is wrong or there's a syntax error in dp.js, the catch block triggers and the whole session gets dummy recommendations. Also: why is DP exported as a named export (`DP.getSmartRecommendation`) when you're checking for both named exports (`dpModule.getSmartRecommendation`)? This is brittle.

**PROOF:** Check `src/engine/dp.js:1–7` — DP is exported as named `export const DP = {...}`. So `dpModule.DP` exists, but `dpModule.getSmartRecommendation` would NOT exist unless separately exported.

**FIX:** Use static import at the top:
```javascript
import { DP } from './dp.js';
// No try/catch needed for import errors — let them bubble

export class CoachDirector {
  async buildSession(sessionType) {
    // ...
    for (const exercise of session.exercises) {
      exercise.recommendation = DP.getSmartRecommendation(exercise.name, ctx.readiness.score, null);
      // ...
    }
  }
}
```

**IMPACT IF IGNORED:** If dp.js has a build error, all DP recommendations silently become dummy values (8 reps, no progression tracking). Users won't know the recommendation engine is broken.

---

### **[MAJOR] — src/main.js:141–145 — Onboarding Check Doesn't Handle Corrupted State**

**WHAT:** The onboarding gate checks two conditions:
```javascript
const onboardingDone = DB.get('onboarding-done') || (DB.get('logs') || []).length > 0;
if (!onboardingDone) { checkOnboarding(); }
```

If `onboarding-done` is `true` but logs are empty (due to data loss or reset), the user skips onboarding and sees the coach page with no data. No fallback.

**WHY:** The OR condition assumes one of them is reliable. But if onboarding-done=true and logs=[], the app is in an inconsistent state. User sees empty coach UI.

**PROOF:** Run fullReset() (which doesn't clear onboarding-done due to bug #1), then reload. `onboarding-done=true`, `logs=[]`, so onboarding is skipped.

**FIX:** Check for logical consistency:
```javascript
const onboardingDone = DB.get('onboarding-done') === true;
const hasLogs = (DB.get('logs') || []).length > 0;
if (!onboardingDone && !hasLogs) {
  checkOnboarding();
} else if (onboardingDone && !hasLogs) {
  // Corrupted state: force re-onboarding
  DB.set('onboarding-done', false);
  checkOnboarding();
}
```

**IMPACT IF IGNORED:** Data loss followed by reload leaves user in broken state with no visible recovery path.

---

### **[MAJOR] — src/firebase.js:117–124 — Debounce Timer Doesn't Handle Rapid DB.set() Calls**

**WHAT:** The sync-to-Firebase debounce (line 122) sets a 3-second timer. If user does 5 quick `DB.set()` calls (log 5 sets, edit weight, adjust kcal), only the last one triggers a sync after 3 seconds. But what if the page closes before the timer fires?

**Code:**
```javascript
let _syncTimer = null;
const _origSet = DB.set.bind(DB);
DB.set = function(key, val) {
  _origSet(key, val); // Write to localStorage immediately
  if (SYNC_KEYS.includes(key) && !window._suppressFirebaseSync) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(syncToFirebase, 3000); // 3 seconds later...
  }
};
```

**WHY:** If user adds 3 workout sets, then closes the tab/app before 3 seconds, the sync never fires. The data is in localStorage but not pushed to Firebase. On next page load, if localStorage is cleared (OS memory pressure, user manual clear), those logs are gone.

**PROOF:** 
1. Start a session, log 3 sets
2. Close the tab immediately (within 3 seconds)
3. Open the app again — check Firebase. The 3 sets may not be there if the page closed before the debounce fired.

**FIX:** Use a hybrid approach — sync on page unload:
```javascript
window.addEventListener('beforeunload', () => {
  if (_syncTimer) {
    clearTimeout(_syncTimer);
    syncToFirebase(); // Force sync now, not in 3 seconds
  }
});
```

Also: The `suppressFirebaseSync` flag (line 120) blocks ALL syncs for 3 seconds during dataCleanup. If user does DB.set() during that window, the change is still written to localStorage but won't sync for 6+ seconds total (3 suppress + 3 debounce). Race condition if tab closes.

**IMPACT IF IGNORED:** Session data can be lost if user closes the app within 3 seconds of logging it, and localStorage is subsequently cleared.

---

### **[MAJOR] — src/pages/coach.js:254, 1215, 1217 — No Sanitization on Exercise Names in innerHTML**

**WHAT:** Exercise names are inserted directly into innerHTML without escaping:
```javascript
// Line 254
mlEl.innerHTML=`MAIN LIFT: <strong style="color:var(--accent)">${mlName.toUpperCase()}</strong>...`;

// Line 1217
<div style="font-size:13px;font-weight:700">${e.ex}</div>

// Line 1320 (select alternative)
<button onclick="selectAlternative('${original}','${a.name}')">
```

**WHY:** If an exercise name contains special characters or quotes, it can break the HTML or inject code. Example: if `e.ex` is `Lat "Pulldown' onclick="alert(1)"`, the HTML becomes:
```html
<div>Lat "Pulldown' onclick="alert(1)"</div>
```
The quote closes the style attribute, and `onclick` executes.

**PROOF:** In console:
```javascript
DB.set('logs', [{ex: 'Lat\\" onclick=\\"alert(1)\\"', w: 64, reps: 8}]);
// Reload page, the script executes
```

**FIX:** Use `textContent` instead of `innerHTML` for user-controlled data:
```javascript
const exDiv = document.createElement('div');
exDiv.style.fontSize = '13px';
exDiv.style.fontWeight = '700';
exDiv.textContent = e.ex; // No escaping needed
parentEl.appendChild(exDiv);
```

Or: HTML-escape before inserting:
```javascript
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
mlEl.innerHTML = `MAIN LIFT: <strong>${escapeHtml(mlName.toUpperCase())}</strong>...`;
```

**IMPACT IF IGNORED:** Low risk in current app (exercise names are system-defined), but if you ever allow user-created exercise names or import from untrusted sources, XSS is possible.

---

## 3. MINOR ISSUES

### **[MINOR] — src/engine/coachDirector.js:63 — Unsafe .toLowerCase() on recommendation.technique**

**WHAT:** 
```javascript
exercise.technique = exercise.recommendation.technique.toLowerCase().startsWith('drop')
  ? 'drop'
  : exercise.recommendation.technique;
```

If `recommendation.technique` is `undefined` or `null`, `.toLowerCase()` crashes.

**FIX:** 
```javascript
const tech = exercise.recommendation?.technique || '';
exercise.technique = tech.toLowerCase().startsWith('drop') ? 'drop' : tech;
```

---

### **[MINOR] — src/engine/patternLearning.js:5–92 — Async Analysis with setTimeout, No Error Handling**

**WHAT:** 
```javascript
export function analyzeAndApplyPatterns(logs) {
  setTimeout(() => _analyze(logs), 500);
}

function _analyze(logs) {
  if (!logs || logs.length < 20) return;
  // 8 calls to DB.get/set, no error handling
  DB.set('applied-patterns', all.slice(-20));
}
```

The async call is fire-and-forget. If `_analyze()` throws (e.g., JSON.parse error in DB.get), it fails silently. Also: running 500ms after initial call means it can race with user actions.

**FIX:** Use Promise, log errors:
```javascript
export async function analyzeAndApplyPatterns(logs) {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    await _analyze(logs);
  } catch (e) {
    console.error('[PatternLearning]', e);
  }
}
```

---

### **[MINOR] — src/pages/weight.js:227–234 — getKcalTargetForDate() Assumes Phase Log Exists**

**WHAT:** 
```javascript
function getKcalTargetForDate(dateStr) {
  const phaseLogs = DB.get('phase-log') || [];
  const sorted = [...phaseLogs].sort((a,b) => b.date.localeCompare(a.date));
  const entry = sorted.find(e => e.date <= dateStr);
  return entry ? entry.kcalTarget : 1800;
}
```

If `phase-log` is never initialized, it defaults to `1800`. But if the user is actually in BULK phase (after July 20), the kcal target should be different. The function has no way to know the current phase is BULK unless explicitly logged.

**FIX:** Fall back to current phase if no log:
```javascript
const entry = sorted.find(e => e.date <= dateStr);
if (entry) return entry.kcalTarget;
// No entry found; check current phase
const phaseOverride = DB.get('phase-override') || 'AUTO';
const now = new Date();
if (phaseOverride === 'BULK' || (phaseOverride === 'AUTO' && now >= new Date('2026-07-20'))) {
  return 2400; // or getSYS().getKcalTarget()
}
return 1800; // CUT
```

---

## 4. ANTI-PATTERNS

### **[ANTI-PATTERN] — Global State Management (localStorage as Single Source)**

The entire app treats localStorage as a database with no consistency guarantees. Multiple modules read/write directly:
- `coachDirector.js` → buildCoachContext() → reads weights, readiness, phase
- `firebase.js` → overwrites localStorage with remote data
- `coach.js` → reads/writes readiness, logs, session-draft
- No transaction semantics, no version control

**Example race:**
1. Coach page renders, caches `readiness=85` 
2. Firebase syncs and overwrites with `readiness=40`
3. Coach page still shows "high readiness" recommendations
4. User starts session based on stale cache

Better: Implement a centralized state manager (Redux-like) with subscriptions, or use a real database.

---

### **[ANTI-PATTERN] — No Type Safety**

All data flows are untyped. A log entry can be:
```javascript
{ex, w, reps, rpe, set, session, date, ts, baseline, ...}  // real format
{exercise, weight, reps, ...}  // test format in dp.js
{exercise, weight, ...}  // coach.js expectations
```

`coachDirector.js:147` handles both:
```javascript
const log = (session.logs || []).find(l => (l.exercise || l.ex) === name);
```

This is a code smell. Should use a typed schema.

---

### **[ANTI-PATTERN] — Hardcoded Exercise Lists in Multiple Files**

Exercise definitions are duplicated:
- `constants.js:11–32` (COMPOUND_EX, EX_SETS, EX_REPS)
- `engine/dp.js:9–76` (REP_RANGES, WEIGHT_STEPS, MAX_KG)
- `engine/coachDirector.js:94–111` (fallbackSessionBuilder hardcoded names)
- `inject.js:116–174` (baseline exercises)

If you add a new exercise, you must update 4 files. Source of bugs.

**FIX:** Single exercises.json config file.

---

## 5. ARCHITECTURE CONCERNS

### **No Restore After Full Reset**

After Full Reset, there is **no option to restore from backup**. The user loses all data and cannot recover. Firebase is cleared (line 128–131 in dataCleanup.js). This violates the principle of "destructive actions need an undo."

**FIX:** Before clearing Firebase, save a backup with timestamp:
```javascript
await fbSet(`${USER_PATH}/__backup_${Date.now()}`, remote);
```

---

### **Session Builder is a Stub**

`src/engine/sessionBuilder.js` exports `null`. The entire session building falls back to hardcoded exercises in `coachDirector.js`. This is fine for MVP, but Week 2 architecture is undefined. How will predictive session building integrate? Where does the Prediction Engine live?

---

### **No Offline-First Architecture**

The app syncs to Firebase on every data write (with 3-second debounce). If offline:
- Writes still go to localStorage ✓
- But sync() silently fails; user doesn't know data isn't backed up
- No "offline queue" — if page closes before coming back online, data stays local-only

Better: Implement a proper offline queue (IndexedDB) that replays syncs when online.

---

## 6. WHAT PREVIOUS AI REVIEWERS MISSED

1. **Data loss bug (Critical #1):** `fullReset()` doesn't clear `onboarding-done` — nobody caught this.
2. **Cache invalidation (Critical #2):** `_cachedDirectorSession` has no expiration or invalidation strategy.
3. **Firebase merge semantics:** No last-write-wins per-entry; local always wins.
4. **Debounce window risk:** Page close before 3-second sync fires = data loss.
5. **Exercise name escaping:** XSS possible if names are ever user-generated.
6. **Type confusion:** Same data object called both `{ex, w}` and `{exercise, weight}`.

Previous reviews said "no errors" — that's demonstrably false. The bugs are in the code.

---

## 7. WHAT IS ACTUALLY GOOD

1. **DP Engine Logic:** `dp.js:130–338` is well-structured progression tracking with clear stages (CONSOLIDATE, INCREASE, STAGNANT, etc.). RPE-based recommendations are sound.

2. **Reality Engine:** `reality.js` correctly validates equipment constraints and adjusts recommendations down in deficit phase.

3. **Readiness Integration:** `readiness.js:30–47` properly factors readiness into volumemultiplier and CUT vs BULK behavior.

4. **AA (Auto-Adjust):** `aa.js:6–233` correctly detects bad form, sleep issues, and suppresses increases intelligently.

5. **Firebase Sync Design:** The debounce pattern (3 seconds) is reasonable for batching writes. The merge-by-timestamp for arrays is correct.

6. **Coach UI Responsiveness:** Real-time RFE adjustments, inactivity auto-pause, session timing — all well-implemented.

7. **Pattern Learning:** Detects skip days, early stops, stagnation over 8 weeks; applies corrective actions (session shortening, deload suggestions).

8. **Export/Import:** Backup export as JSON is comprehensive and includes all user data.

---

## 8. KNOWN USER-REPORTED ISSUES (root cause each)

### **Issue 1: Full Reset Does NOT Trigger Onboarding on Reload**
**Root cause:** Critical Bug #1 — `onboarding-done` survives fullReset(). User sees blank coach page after reset + reload because onboarding is skipped but logs are gone.

### **Issue 2: No Restore Option After Full Reset**
**Root cause:** By design — fullReset() doesn't save a backup, and Firebase is deleted (line 128–131). User data is gone permanently.

### **Issue 3: Session History Needs Better Grouping**
**Root cause:** `coach.js:78–124` groups sessions by date, but doesn't group multiple sessions on the same day. If user does morning + evening session, they appear as separate lines with no visual grouping. Solution: Group by `[date + startHour]` or add a session counter.

### **Issue 4: Dynamic Import Warning During Build**
**Root cause:** `coachDirector.js:24,37` uses dynamic `await import()`. Bundlers (Vite, Webpack) issue warnings because they can't statically analyze the import. Solution: Use static import instead (see Major Issue #1).

---

## 9. FINAL VERDICT

### Overall Score: 4/10

**Not production-ready.** The critical data loss bug and stale cache issue make this unsafe for real users. Previous reviews missed serious bugs.

### Dangerously Wrong:
- ✗ Full Reset doesn't clear all flags — data recovery impossible
- ✗ Coach session cache has no invalidation — stale recommendations possible
- ✗ Firebase merge has no last-write-wins semantics — multi-device conflicts
- ✗ Page close before sync fires = data loss
- ✗ No error handling in pattern learning async

### Now Acceptable (with fixes):
- ✓ DP progression logic
- ✓ Readiness scoring
- ✓ AA auto-adjust
- ✓ Pattern detection

### Should Be Rewritten:
- ✗ State management (no centralized store)
- ✗ Exercise schema (duplicated across 4 files)
- ✗ Firebase sync (no per-entry timestamps)
- ✗ Offline strategy (no queue; silent failures)

### Is Coach Engine Architecture Sound?
**No.** The DP logic itself is good, but it's called through a stale-cached session builder, with no integration test. If you reload mid-session, the cache might not invalidate. The engine has no way to signal "I'm stale, rebuild me."

### Safe to Build Week 2 On Top of This?
**No.** Week 2 would inherit the broken state management. Adding complexity on a fragile foundation is asking for worse bugs. Fix the foundation first:

1. Implement proper fullReset (clear ALL keys including onboarding-done)
2. Add cache invalidation (subscribe to key changes, or TTL)
3. Fix Firebase merge (per-entry timestamps)
4. Add beforeunload sync (don't lose data on page close)
5. Consolidate exercise definitions into one file

After these fixes, the codebase would be ready for Week 2.

