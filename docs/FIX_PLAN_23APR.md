# FIX PLAN — 2026-04-23 (Umeri + Brațe — Daniel session bugs)

Planning-only. No code changes. Sonnet executes after sign-off.

Session context: Daniel (owner) ran 3 real sessions (Apr 21 PULL / Apr 22 PUSH / Apr 23 UMERI+BRATE). Four critical bugs surfaced. Root-cause analysis below uses current tree (post-commit `4849850` — calibration gate for coach.js + main init clear).

---

## BUG 1 — LOGS PERSISTENCE (CRITICAL) — seturile reale se pierd la `rateSession()`

### Root cause
`cleanFakeLogs()` in `src/pages/coach.js:1143-1157` destroys all non-baseline logs because of a **string-vs-number mismatch** in the validSessions check.

```js
// src/pages/coach.js:1146-1156
const sessions = {};
logs.filter(l => !l.baseline).forEach(l => {
  if (!sessions[l.session]) sessions[l.session] = [];   // key COERCED to string
  sessions[l.session].push(l);
});
const validSessions = new Set(
  Object.entries(sessions)
    .filter(([, sets]) => sets.length >= 2 || sets.some(l => l.earlyStop))
    .map(([sid]) => sid)                                 // sid is STRING
);
const result = logs.filter(l => l.baseline || validSessions.has(l.session));
//                                                              ^^^^^^^^^^
//                                                              NUMBER — has() is SameValueZero → false
```

- `l.session` is set at `src/pages/coach.js:563` as `state.sessStart` → `Date.now()` (Number).
- `restoreRealLogs` at `src/util/dataCleanup.js:366+` stores `session: PULL_SESSION_TS` (Number).
- `Set<string>.has(number)` uses SameValueZero equality → always **false**.
- Result: every non-baseline log fails `validSessions.has(...)` → filtered out.

`cleanFakeLogs()` is called from `rateSession()` in `src/pages/coach.js:876`, which runs at the end of every real session. So:
- Apr 21 end → wipes Apr 21 non-baseline logs
- Apr 22 end → wipes Apr 21+22 (re-injected) non-baseline logs
- Apr 23 end → wipes all 3 days; `session-ratings` is untouched, so its entries survive → exact symptom in Daniel's CSV (ratings + readiness + closed-days OK, logs empty apart from 51 baseline).

The admin prefill on Apr 23 re-added Apr 21+22 via `restoreRealLogs({ merge: true })`, then Daniel's Apr 23 session ended → `cleanFakeLogs` wiped all again.

### Files modified
- `src/pages/coach.js` — fix `cleanFakeLogs` comparison (line ~1156 — use `String(l.session)` both sides, or store number keys via a Map/Number‑coerced set).
- `src/engine/__tests__/` — new unit test: `cleanFakeLogs.test.js` or extend a coach-helper test file. Pure logic test, no DOM needed — extract the core filter into a pure helper.

### Ordering in execution
Fix Bug 1 **first** (it blocks everything else). Without valid logs, calibration tier detection, DP recommendations, PR extraction, pattern learning, and adminPrefill verification are all downstream-broken.

### Risk
Concrete regressions:
- `extractAndSavePRs()` runs *before* `cleanFakeLogs()` (src/pages/coach.js:875-876). If we ever re-order, PR records persist pointing to a removed log. Keep current order.
- `Date.now()` as session key has ms granularity: two sessions started in the same ms collapse. Ignore — impossible in practice (session is manually started).
- Legacy localStorage with logs already-corrupted: fix restores future writes but does not resurrect old data. Daniel's Apr 23 session is permanently lost unless Firebase has an earlier snapshot. Verify `firebase:users/daniel/logs` contains Apr 23 entries; if yes, `syncFromFirebase` merge-by-ts will restore them once the bug is fixed.
- `confirmReps()` persists logs per-set via `DB.set('logs', …)`. That path is fine. The only destructive sites are `cancelWorkout()`, `endSession()` sub-5-min auto-delete, and `cleanFakeLogs()`. Only the last is buggy.

### Tests
- **unit** (`src/engine/__tests__/cleanFakeLogs.test.js`, new):
  - Session with 3 sets, all `session=Date.now()` number → preserved.
  - Session with 1 set, no earlyStop → removed.
  - Session with 1 set + earlyStop → preserved.
  - Mixed baseline (session shared) + real multi-set sessions → both preserved.
  - Edge: `session` stored as both number and string in different logs — must still match.
- **e2e** (`tests/e2e/scenarios/session-logs-persist.spec.js`, new):
  - Seed `logs` with a full session (5 sets, session=number), trigger `rateSession('normal', {...})` via page.evaluate, assert logs count unchanged (+session-ratings +1).

### Commit message
```
fix: cleanFakeLogs string-number mismatch destroyed all real logs

Object.entries coerces the session key to string when building the
validSessions Set, but the final filter checks with the raw number from
l.session. Set<string>.has(number) always returns false, so every real
session failed the validity check and every non-baseline log was deleted
on every rateSession() call.

Logs now survive rateSession. Baseline tests cover number-keyed sessions
and the earlyStop-singleton exception.
```

---

## BUG 2 — CALIBRATION GATE LEAK → Dashboard banner false-positives

### Root cause
Two missed spots. Commit `4849850` gated `src/pages/coach.js` reads, but:

1. **Dashboard leak** — `src/pages/dashboard.js:260-278` reads `getAppliedPatterns()` with **no calibration gate** and renders the "Am ajustat programul automat" card. Exact text on screenshot ("Marți are 88% skip rate — sesiune scurtată la esențiale") matches the `description` field written in `src/engine/patternLearning.js:46`.

   ```js
   // src/pages/dashboard.js:262
   const patterns = getAppliedPatterns().filter(p => Date.now() - p.appliedAt < 14*86400000);
   if (patterns.length) { /* renders banner unconditionally */ }
   ```

2. **Init-order race** — `src/main.js:145-148`:
   ```js
   clearStalePatternsIfColdStart();   // (a) clears localStorage applied-patterns
   cleanDuplicateLogs();
   …
   await initFirebaseSync();          // (b) sync pulls remote applied-patterns back
   ```
   `syncFromFirebase` in `src/firebase.js:84-85` sees `local[k] == null` (we just removed it) and writes `DB.set(k, remote[k])` — Firebase has the stale patterns from earlier buggy runs, so they come right back. Clearing is pointless.

Auxiliary: the write-side guards in `patternLearning.js:35-38` (`totalCompleted < 4`, burns in last 4 weeks < 4) prevent *new* SKIP_DAY writes for Daniel today, but stale ones from earlier (before guards / before the cold_start clear existed) survive in Firebase.

### Files modified
- `src/pages/dashboard.js` — gate `autoRecEl` patterns read by calibration level (mirror of coach.js:298). Read `window._directorCache.get()?.calibrationLevel?.patternsEnabled` with session-count fallback.
- `src/main.js` — move `clearStalePatternsIfColdStart()` to **after** `initFirebaseSync()`, and have it clear Firebase too (via `clearFirebaseKeys(['applied-patterns','pattern-learning-cache','detected-patterns'])` from `src/firebase.js`).
- `src/firebase.js` — already has `clearFirebaseKeys` (line 43). Reuse.
- `src/util/adminPrefill.js` — add explicit clear of pattern caches after prefill (belt-and-braces: prefill re-creates cold-start state, stale patterns should not survive).

### Ordering in execution
After Bug 1 (once logs persist correctly, calibration tier detection from `detectCalibrationLevel` becomes accurate). Can run in parallel with Bug 3 and Bug 4 — no code path overlap.

### Risk
Concrete regressions:
- Dashboard rename-gate may hide legitimate auto-recs for PERSONALIZING+ users. Mitigation: the gate is `patternsEnabled !== false` — matches coach.js, preserves behavior for tier ≥ INITIAL.
- `clearFirebaseKeys` issues DELETE requests. Must **not** fire during an active session (could race with concurrent `syncToFirebase`). Put behind the cold-start guard and the firebase-sync-done flag.
- Moving `clearStalePatternsIfColdStart` after `initFirebaseSync` means first paint can show stale patterns for ~200ms before the clear. Acceptable; banners are also gated in UI, so user never sees them for cold_start/initial.
- `clearFirebaseKeys` needs `await` — currently `init()` is async, so we can. Do not fire-and-forget; otherwise same race re-appears.

### Tests
- **unit** (extend `src/engine/__tests__/calibration.test.js`):
  - Dashboard gate: mock `window._directorCache`, assert `getAppliedPatterns` is not rendered when `patternsEnabled === false`.
- **e2e** (`tests/e2e/scenarios/calibration-ui.spec.js` — extend existing file):
  - Seed `applied-patterns` in localStorage AND in `users/daniel/applied-patterns` via Firebase stub, logs = only baseline. Reload. Assert:
    - localStorage `applied-patterns` is cleared after init.
    - Dashboard "Am ajustat programul automat" card is NOT rendered.
    - `Marți are 88%` / `Joi are 100%` text absent from page.

### Commit message
```
fix: dashboard pattern banner + firebase-restore race for cold_start

Two leaks remained after commit 4849850:
 - dashboard.js rendered applied-patterns unconditionally
 - clearStalePatternsIfColdStart ran BEFORE initFirebaseSync, so the
   merge immediately repopulated patterns from remote

Dashboard now reads calibrationLevel.patternsEnabled via the director
cache (same gate as coach.js). Clear runs after sync and also deletes
the keys from Firebase via clearFirebaseKeys.

AdminPrefill clears pattern caches too — prefill is a cold-start
operation and must never leave stale patterns behind.
```

---

## BUG 3 — REP CAP CUT nu se aplică la template display (și nici la progression)

### Root cause
Two layers:

1. **Display strings are hardcoded in PROG constants** — `src/constants.js:46-50`:
   ```js
   {day:'Joi', … ex:[
     {n:'Cable Curl',s:'3×10–12',g:'brate'},
     {n:'Preacher Curl',s:'3×10–12',g:'brate'},
     …
   ]}
   ```
   The coach preview renders `e.s` literally (`src/pages/coach.js:376` — `${e.s||''}`). Never consulted by `realityEngine`, so the CUT cap is invisible here.

2. **DP progression / REP_RANGES not phase-aware** — `src/engine/dp.js:9-18`:
   ```js
   REP_RANGES: {
     'Cable Curl':[10,12], 'Preacher Curl':[10,12], 'Bayesian Curl':[10,12], …
   }
   ```
   `DP.recommend()` uses `rMax=12`. `atTopReps` requires last 3 sessions at reps >= 12, then weight bumps. The `realityEngine` post-hook at `src/engine/reality.js:42-45` subtracts 1 rep when CUT and reps>10 — but that's a one-step decrement AFTER DP already produced the recommendation, not a policy. It does NOT change the display string, does not change `rMax`, and lets DP keep chasing 12 reps.

Daniel's correct conceptual model: in CUT, **reps fixed at 10, weight progresses when 3×10 clean @ RPE≤8**. This is a DP-level policy, not a post-hoc cap.

### Files modified
- `src/engine/dp.js`:
  - Introduce `getPhaseAwareRepRange(ex, isInCut)` — caps rMax at 10 in CUT for isolation exercises (keep full range for compounds where 6–10 is already CUT-safe).
  - Use it inside `_recommendRaw` (replace `range = this.REP_RANGES[ex]`) and `getSmartRecommendation` / `getRepsRange`.
  - Remove or reduce the one-rep decrement in reality.js (it becomes redundant once DP ranges are phase-aware — but leave a narrow fallback for non-DP paths).
- `src/engine/reality.js:42-45` — remove the `reps > 10 → reps - 1` patch; phase-aware DP is the right place.
- `src/pages/coach.js` — in the preview renderer (line 376 and line 37-45-ish for session card), parse `e.s` (`"3×10–12"`), and when `ctx.isInCut` cap the upper bound at 10 for isolation exercises. Use a helper so constants don't need editing. Alternative: compute display from DP range instead of reading `e.s` verbatim — cleaner.
- `src/engine/coldStartGuidelines.js:144-148` — already caps CUT to max 10 for cold_start; leave as-is, it's consistent.

### Ordering in execution
Independent of Bug 1 and Bug 2. Can run in parallel. Depends on nothing.

### Risk
Concrete regressions:
- Existing DP tests assume `rMax=12` for isolation — expect failures in `dp.test.js` (if present) and coachDirector tests that set phase. Must update expected values.
- Removing reality.js rep-cap breaks any non-DP recommendation path (e.g., cold_start fallback that bypasses DP). Must verify `realityEngine.validate` still handles the `recommendation.reps > 10` case when a session was NOT built by DP.
- `e.s` display change must handle every string format in PROG (`"3×10–12"`, `"4×12–15"`, `"2×15"`, `"3×12–15+drop"`). Use a safe regex parser; fall back to the original string on parse failure.
- "Progression by weight only" changes user-visible behavior for biceps/triceps — Daniel has already signed off on this intent, but double-check: are there CUT users in the wild other than Daniel? No (single-user app), so low external risk.

### Tests
- **unit** (`src/engine/__tests__/dp.test.js`, new or extended):
  - `getPhaseAwareRepRange('Cable Curl', true)` → `[10, 10]`.
  - `getPhaseAwareRepRange('Cable Curl', false)` → `[10, 12]`.
  - `DP.recommend('Cable Curl')` in CUT with last log 10kg × 10 RPE 7 → INCREASE to 11kg, not "consolidate at 11 reps".
  - `DP.recommend('Lat Pulldown')` (compound) in CUT — keeps `[8,12]` (no cap on compounds).
- **e2e** (`tests/e2e/scenarios/cut-rep-display.spec.js`, new):
  - Phase=CUT, render coach today on Joi. Assert DOM contains `Cable Curl` + `3×10` (not `3×10–12`).

### Commit message
```
fix: CUT phase caps isolation reps at 10; weight is the progression axis

DP.REP_RANGES becomes phase-aware via getPhaseAwareRepRange.
In CUT, isolation exercises (Cable Curl, Preacher Curl, Pushdown,
Bayesian, Incline DB Curl, Overhead Triceps, …) target a fixed 10
reps; once 3×10 clean at RPE ≤ 8, weight increments by one equipment
step. Compounds keep their native rep range.

Reality.js no longer post-decrements reps>10 — DP is now authoritative.
Coach preview strings are transformed from PROG's "3×10–12" → "3×10"
when isInCut, so template and recommendation agree.

Rationale: in CUT, asking for +2 reps at fixed weight is not a valid
progression (glycogen/cortisol/deficit make rep escalation unreliable).
Weight-only progression at capped reps is the correct policy.
```

---

## BUG 4 — REST TIMER DOUBLE-START

### Root cause
The inactivity auto-pause in `src/pages/coach.js:62-80` fires again after the initial post-set pause has already expired.

Flow:
1. Daniel commits set → `confirmReps()` (line 588) → `startPause(60s)` → `state.pauseTimer = setInterval(...)`.
2. 60s later → timer hits 0 → `stopPause()` + `hidePauseScreen()` + `updateExCard()`. `state.pauseTimer = null`. UI now on "Set 2".
3. Daniel waits another 2–3 min (aparat ocupat). No user events.
4. Inactivity handler (2-min delay, line 73) fires. Guard `state.sessActive && !state.pauseTimer` passes — both true. `startPause(...)` fires. Pause screen pops again ("URMEAZĂ: current ex") — **this is the "second" pause Daniel sees** while still waiting.
5. He skips it manually, then does the real set, commits — `confirmReps` fires yet ANOTHER `startPause`.

There is no explicit state machine; the inactivity handler cannot distinguish "user between sets, still resting" from "user went idle mid-set". Both look like `sessActive && !pauseTimer`.

Secondary finding: `startPause` always calls `stopPause()` first (line 600), so there's no literal setInterval overlap — but the UX bug (pause appearing over an in-progress rest) is what Daniel is reporting.

### Files modified
- `src/pages/coach.js`:
  - Introduce a `state.lastPauseEndedAt` timestamp, written in the `pauseLeft <= 0` branch (line 618-623).
  - Change inactivity handler guard (line 68-73) to also require: "no pause ended within last N seconds" (e.g., 5 min). If the timer just ended, the user is clearly mid-rest, not mid-set — don't re-arm.
  - Reset `lastPauseEndedAt = null` on user interaction inside the active set (e.g., tapping `setDone`, `confirmReps`, `editSessionKg`) — so the inactivity pause can legitimately fire during true mid-set inactivity.
- `src/state.js` — add `lastPauseEndedAt: null` to state object.

Alternative (bigger): introduce an explicit state machine `IDLE / SET_ACTIVE / RESTING / POST_REST_WAITING`. Overkill for this bug — state-flag approach is sufficient.

### Ordering in execution
Independent. Can run in parallel with Bugs 2 and 3.

### Risk
Concrete regressions:
- If user does a genuinely long mid-set idle immediately after a rest ends, inactivity pause is suppressed for up to 5 min. Acceptable — they still have the pause button.
- `lastPauseEndedAt` not cleared on session end → first pause of next session incorrectly suppresses inactivity. Mitigation: clear in `endSession()` and `cancelWorkout()`.
- Tests that assert inactivity auto-pause may need additional setup. Check `tests/e2e/scenarios/coach-screen.spec.js`.

### Tests
- **unit**: inactivity logic extracted to a pure helper `shouldAutoPause(state, now, { lastPauseEndedAt, activeSince })` — assert false when `now - lastPauseEndedAt < 5min`, true otherwise.
- **e2e** (`tests/e2e/scenarios/rest-timer.spec.js`, new):
  - Start session, commit set, advance clock > 60s so pause ends, advance another 2 min without interaction. Assert no second pause screen appears.
  - Start session, commit set, skip pause, advance clock 2 min without interaction. Assert inactivity pause DOES appear (set-active case).

### Commit message
```
fix: inactivity timer no longer re-arms pause immediately after rest

state.lastPauseEndedAt is stamped when a rest timer naturally expires.
The inactivity handler suppresses auto-pause if the last rest ended
within the past 5 minutes — the user is clearly still resting (e.g.,
equipment blocked), not idle mid-set.

User interactions (setDone, confirmReps, editSessionKg) reset the
stamp so genuine mid-set inactivity is still detected.
```

---

## DEPENDENCY GRAPH

```
Bug 1 (logs persist)  ─────┐
                           ├── prerequisites for accurate tier detection, PR extraction, integration tests
Bug 2 (pattern gate)  ─────┘   (only Bug 2 needs Bug 1's data shape — cold_start detection relies on logs)

Bug 3 (CUT reps)      ─── independent
Bug 4 (rest timer)    ─── independent
```

Execution order: **1 → 2, in parallel with 3 and 4**.

---

## COMMIT PLAN (4 atomic, rollback-friendly)

1. `fix: cleanFakeLogs string-number mismatch destroyed all real logs`
   - `src/pages/coach.js` (~line 1143-1157)
   - `src/engine/__tests__/cleanFakeLogs.test.js` (new, pure helper)
   - `tests/e2e/scenarios/session-logs-persist.spec.js` (new)

2. `fix: dashboard pattern banner + firebase-restore race for cold_start`
   - `src/pages/dashboard.js` (gate the read at ~line 260)
   - `src/main.js` (reorder + await Firebase clear)
   - `src/util/adminPrefill.js` (clear pattern caches after prefill)
   - `tests/e2e/scenarios/calibration-ui.spec.js` (extend)

3. `fix: CUT phase caps isolation reps at 10; weight is the progression axis`
   - `src/engine/dp.js` (add `getPhaseAwareRepRange`, use in `_recommendRaw` + `getSmartRecommendation` + `getRepsRange`)
   - `src/engine/reality.js` (remove redundant rep decrement)
   - `src/pages/coach.js` (transform `e.s` display at render time)
   - `src/engine/__tests__/dp.test.js` (new)
   - `tests/e2e/scenarios/cut-rep-display.spec.js` (new)

4. `fix: inactivity timer no longer re-arms pause immediately after rest`
   - `src/state.js` (add `lastPauseEndedAt`)
   - `src/pages/coach.js` (inactivity guard + setters + clear on end/cancel)
   - `tests/e2e/scenarios/rest-timer.spec.js` (new)

Each commit is self-contained, has its own tests, and can be reverted individually.

---

## RED FLAGS uncovered during audit

1. **`cleanFakeLogs` has been silently destroying data since at least commit `8fa7d2f`** (probably earlier — the string/number bug is latent by construction). Daniel has almost certainly lost older session data too. Recommend a one-shot Firebase snapshot export before touching anything, to give us a pre-fix baseline to compare against.
2. **`syncFromFirebase` array-merge uses `e.ts` uniqueness**, but logs contain `ts` from `Date.now()`. Two devices logging in the same ms collapse. Low-prob, non-urgent — note in docs.
3. **`clearStalePatternsIfColdStart` has no Firebase coverage**, so even after the fix, old Firebase entries from pre-guard runs may survive other clears (e.g., `resetButKeepRealLogs` misses them too — its Firebase coverage is `TEST_RESIDUE_KEYS.map(k => fbModule.removeKey(...))` but the `removeKey` export doesn't exist in `src/firebase.js`, only `clearFirebaseKeys` does — another latent bug in `src/util/dataCleanup.js:311`).
4. **Bug 3's conceptual change (reps fixed, weight progresses in CUT)** is correct in principle but requires confirming the compound list — current implementation has DB Shoulder Press etc. at 6–10 already, so no CUT cap needed. Verify by walking `EX_REPS` in constants.js against `COMPOUND_EX`.
