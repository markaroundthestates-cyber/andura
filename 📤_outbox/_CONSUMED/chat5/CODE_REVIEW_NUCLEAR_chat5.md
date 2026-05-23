# Code Review Nuclear chat 5 — Pre-Beta Code Quality

**Date:** 2026-05-23
**Reviewer:** gsd-code-reviewer Opus subagent
**Scope:** Pre-Beta nuclear gate, code quality + bugs + smells (excludes security + UI surface — those run parallel)
**Methodology:** Read-only Grep + Glob + Read primary src paths (engines / orchestrator / stores / react components / lib / util)
**Files reviewed in depth:** 28 source files across `src/engine/`, `src/coach/orchestrator/`, `src/react/stores/`, `src/react/components/`, `src/react/lib/`, `src/util/`, plus `src/db.js`, `src/firebase.js`, `src/main.tsx`, `src/constants.js`

---

## §0 Verdict TL;DR

**YELLOW-WITH-CLEANUP** — Engineering baseline is solid Bugatti (TS strict, 5387+ PASS, zero `as any` în production, modern patterns). NU sunt CRITs care blochează Beta launch din cod-quality lens, dar surface 4 HIGH issues care merită fix pre-Beta + 8 MED cleanup recommendations. Two CRIT-level findings on **persona type fragmentation across stores** (`gigica` vs `gigel` divergence) and **timezone-sensitive date comparison** care pot cauza silent UX drift live `andura.app`.

**Severity counts:**
- **CRIT:** 2
- **HIGH:** 4
- **MED:** 8
- **LOW:** 5
- **NIT:** 3

**Top concerns 1-line each:**
1. **Persona enum split:** `appStore.Persona = 'gigica'` vs `coachStore.Persona = 'gigel'` — same prop, two universes (CRIT-CODE-01)
2. **TZ comparison bug:** `reality.js` compares local `tod()` vs UTC `TARGET_DATE.toISOString()` (CRIT-CODE-02)
3. **CoachTodayCard hardcoded quote:** lies to users ("Pectoralii recupereaza din marti") regardless of training context (HIGH-CODE-03)
4. **engineWrappers logs-flatten duplication:** identical 12-line block repeated 3x în same file (HIGH-CODE-04)

---

## §1 Engine layer quality

### CRIT-CODE-01 — Persona literal-union fragmentation (cross-store inconsistency)

**File:** `src/react/stores/appStore.ts:18` + `src/react/stores/coachStore.ts:16` + `src/engine/tempo/tempoPrescription.js:171`

**Issue:** Two distinct Persona type unions:
- `appStore.ts`: `'maria' | 'gigica' | 'marius'` (default `'gigica'`)
- `coachStore.ts`: `'maria' | 'gigel' | 'marius'` (default `'gigel'`)
- `tempoPrescription.js:171`: `persona: persona ?? 'gigel'` în file ce typed `'maria'|'gigica'|'marius'`

Engines (volumeLandmarks, tempo, specialization, warmup, periodization) all use `'gigica'` canonical. Tests (`tempoParity.test.js`, `deloadParity.test.js`, `periodization/tests/integration.test.js`) verify `'gigica'`. Mockup persona CSS classes (`.persona-gigica`) match `appStore` schema. **`coachStore` is the outlier with `'gigel'`.**

**Impact (BUGATTI BLOCKER pre-Beta):**
- Live `andura.app` has user with `coachStore.persona='gigel'`. Engine pipeline expects `'gigica'`. Engine receives unknown enum → fallback path triggered silently → user gets generic recommendations instead of tier-specific persona-tuned ones.
- `tempoPrescription.js:171` hardcodes `'gigel'` fallback DESPITE engine canonical being `'gigica'` (per `tempo/types.js:21` JSDoc). Engine self-pollution.
- Tests in `react/__tests__/stores/coachStore.test.ts` lock the wrong enum: lines 10, 24, 62, 63 assert `'gigel'` — they ENFORCE the bug.

**Fix recommendation:**
- Pick canonical `'gigica'` (engine + mockup wins).
- Migration: `coachStore` persist `migrate` function `'gigel' → 'gigica'`.
- Update `coachStore.test.ts` 4 assertions.
- Fix `tempoPrescription.js:171` fallback `'gigel' → 'gigica'`.
- Estimated 30min fix (codebase + tests + migration).

---

### MED-CODE-05 — Dead function in coachDirector

**File:** `src/engine/coachDirector.js:558-564`

**Issue:** `_hasRecentLog(exerciseName, recentLogs)` declared with underscore prefix (signaling "private/unused") and confirmed via `Grep _hasRecentLog` → zero references anywhere în src/. Dead code shipped to production bundle (~150 bytes minified).

**Fix:** Delete function entirely. Low blast radius (zero callers).

---

### MED-CODE-06 — Production debug logging în engine path

**File:** `src/engine/coachDirector.js:135` + `:284` + `:375`

**Issue:** Production code calls `console.log('[CoachDirector] Calibration:', calibration.name)` (line 135) every single `buildSession()` call. Per `sentry.js` comment line 7-8 "console.log debug stripped (production console drop via vite esbuild)" — but coachDirector is in engine src/, esbuild's `drop: ['console']` should handle. Verify Vite config has esbuild console drop active in prod build. If not, this leaks to user DevTools console at every session start.

Lines 284 + 375 also have `console.error` for AA cluster failure + CDL write failure — these are intentional logging for engineering diagnostics (Sentry captures separately), but the `console.log` calibration line is debug noise.

**Fix:** Remove `console.log('[CoachDirector] Calibration:', ...)` line 135. Sentry already captures errors; calibration name not actionable production-side. `console.error` paths fine (engineering signal).

---

### HIGH-CODE-07 — `getLaggingSignal` hardcoded "2 sapt" lie

**File:** `src/react/lib/engineWrappers.ts:817-847`

**Issue:** Line 808: `const STAGNATION_WEEKS_LAGGING_DEFAULT = 2;` then line 839: `` return `${label} sub-volum ${STAGNATION_WEEKS_LAGGING_DEFAULT} sapt - focus azi pe sesiune.` ``. The function returns the same hardcoded "2 sapt" string regardless of how long the actual weak group has been sub-volume. The engine `detectWeakGroups` returns weakness signal but does NOT communicate the actual stagnation duration.

**Impact:** Marius post-pause user with 12-week pause sees "sub-volum 2 sapt" — Bugatti truth violation. Gigel filter: "dubios pentru user" — yes.

**Fix:** Either drop the "2 sapt" entirely (`"${label} sub-volum - focus azi"`) OR pipe actual `stagnationWeeks` from `detectGlobalStagnation` output through the composer chain.

---

### CRIT-CODE-02 — Timezone-sensitive date comparison in reality.js

**File:** `src/engine/reality.js:90`

**Issue:**
```javascript
const today = tod();  // returns local YYYY-MM-DD via 'sv' locale
if (today < TARGET_DATE.toISOString().slice(0, 10) && !phaseOverride) {
```

`tod()` returns local timezone date (per `db.js:14` comment: "fix UTC bug 26 apr 2026"). But `TARGET_DATE.toISOString()` returns UTC. When user în Bucharest (UTC+2/+3) checks the app on July 20 evening local time, UTC is still July 20. But edge case: if user is in Hawaii (UTC-10) at 21:00 local on July 20, UTC is already July 21. Comparison shows "post-target" when locally still pre-target.

**Impact:** For Romanian users only minor (UTC+2/+3 doesn't trigger), but generally violates the explicit `db.js:9` comment "NEVER use toISOString() for 'today' date in production — UTC bug at midnight". The bug is reintroduced here.

**Fix:** Replace `TARGET_DATE.toISOString().slice(0, 10)` with `TARGET_DATE.toLocaleDateString('sv')` consistent with `tod()` semantics. Same fix anywhere else mixed.

---

### MED-CODE-08 — `applyPatterns` mutates session.exercises

**File:** `src/engine/coachDirector.js:435-449`

**Issue:** `applyPatterns` slices `session.exercises` in-place: `session.exercises = session.exercises.slice(0, newCount);`. While `.slice()` creates new array, the assignment mutates the session object. Combined with the for-loop, if multiple patterns matched (only one type matches here, so impact bounded), mutations could compound. Pure-function ADR-026 §9 invariant questioned.

**Fix:** Could rebuild as `return { ...session, exercises: session.exercises.slice(0, newCount), patternApplied: {...} }` for stronger immutability. Low impact today (single match), but Bugatti craft.

---

## §2 Substrate layer quality

### HIGH-CODE-09 — `db.js` `DB.set` unguarded

**File:** `src/db.js:5`

**Issue:**
```javascript
set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
```

NO try/catch wrap. `localStorage.setItem` throws `QuotaExceededError` when storage full (typical mobile Safari limit ~5MB). Currently propagates uncaught to caller. Most callers (e.g., `readiness.saveReadiness`, `autoBackup.createDailyBackup`) don't wrap either → reaches ErrorBoundary as render crash. Maria 65 with 200+ days of logs could hit quota.

**Fix:** Wrap `DB.set` in try/catch + capture via Sentry tag `localStorage_quota`. Optionally: gracefully degrade by triggering `pruneOldBackups()` then retry once. Pattern matches `autoBackup.js:54-60` which DOES handle this for the backup key itself (showing maintainer awareness, just not surfaced into DB.set).

---

### MED-CODE-10 — `scheduleStore.saveWeekly` fire-and-forget commits editMode optimistically

**File:** `src/react/stores/scheduleStore.ts:67-132`

**Issue:** `set({ editMode: false })` at line 132 fires immediately, BEFORE the dynamic import + commit promise resolves (lines 113-128). If `commitCalendarEdit` throws or import fails, editMode is cleared but the engine commit didn't happen. Comment lines 76-79 acknowledge "UX sticks with optimistic" intentionally, but Sentry breadcrumbs only — no UX retry hint.

**Fix:** Acceptable per Daniel's anti-paternalism (no failure modal blocking user). At minimum: emit additional Sentry breadcrumb tagged with commit failure for Co-CTO production observability. Optional MED v1.1: persist a `lastCommitOk: boolean` field user-visible somewhere subtle (toast: "Schimbarile s-au salvat — sync server in curs"). Defer post-Beta.

---

### MED-CODE-11 — `workoutStore.pauseSession` hardcoded 'Push' + meta string

**File:** `src/react/stores/workoutStore.ts:195-210`

**Issue:** When user pauses session, snapshot stores `title: 'Push'` literal (line 199) and `meta: ex ${s.exIdx + 1}` regardless of actual workout type. If user pauses a PULL or LEGS session, ResumeSessionCard later displays "Push" title incorrectly.

**Fix:** Pass title + meta as parameters to `pauseSession(title, meta)` OR derive from current `getTodayWorkout().workoutTitle`. ResumeSessionCard consumer surface — verify how it consumes title. Estimated 20min fix.

---

### LOW-CODE-12 — `settingsStore.setNotificationTime` accepts any string

**File:** `src/react/stores/settingsStore.ts:73`

**Issue:**
```typescript
setNotificationTime: (hhmm) => set({ notificationTime: hhmm }),
```

No HH:MM validation. User-driven input via SettingsNotifications screen could pass `"99:99"` or `"abc"`. Downstream consumers (Notifications scheduler) might parse and fail silently or render garbage.

**Fix:** Add regex validation `/^([01]\d|2[0-3]):[0-5]\d$/` test before set. Defer to UI input validation if already enforced there (verify SettingsNotifications.tsx).

---

### LOW-CODE-13 — `nutritionStore` lacks negative-value guard

**File:** `src/react/stores/nutritionStore.ts:62-65`

**Issue:** `setDailyKcal(dateISO, kcal)` and `setDailyProtein(dateISO, protein)` accept any number including negative. NutritionInline already validates `n >= 0 && n <= 9999` (line 79) and `0..500` (line 86), but if any future caller bypasses NutritionInline (CSV import, future LogMeal), invalid values reach store + engines.

**Fix:** Guard in upsertEntry (defensive in-depth): `if (typeof patch.kcal === 'number' && patch.kcal < 0) return log;`. 5-line fix.

---

## §3 React components quality

### HIGH-CODE-03 — CoachTodayCard hardcoded quote text always shown

**File:** `src/react/components/Antrenor/CoachTodayCard.tsx:104`

**Issue:**
```tsx
„Pectoralii recupereaza din marti · spatele e gata.&rdquo;
```

Hardcoded text shown regardless of training context. Comment line 9-12 explicitly notes this is "PERMANENT DESIGN ELEMENT mockup parity" — but as a code quality + UX honesty lens, this is **misleading content for the live user.** A user who hasn't trained chest recently sees "Pectoralii recupereaza" — false claim.

This is a Bugatti truth violation — Gigel filter applies: "Cum reacționează Gigel? Dubios pentru user?" YES, dubios.

**Fix options:**
- A) Drop the quote line entirely (mockup parity break, requires Daniel CEO approval — STRATEGIC, not tactical)
- B) Conditionally render only when engine emits a relevant context (e.g., 1 muscle group recovered ≥48h, message dynamically generated)
- C) Replace with rotating generic Andura voice line from `coachVoice.preview` pool

**Recommendation:** Option B with engine wire — tactical Co-CTO domain, ~3-5h dev (extract `getRecoveryByGroup` top recovered → format RO sentence via composer). Defer if Daniel CEO prefers mockup parity preserve (LOW priority then).

---

### HIGH-CODE-04 — `engineWrappers.ts` logs-flatten duplication 3×

**File:** `src/react/lib/engineWrappers.ts:640-652` + `:767-780` + `:820-832`

**Issue:** Identical 12-line block repeated 3 times across `getPatternsBanner`, `getCoachRestReason`, `getLaggingSignal`:
```typescript
const logs: Array<{ ex: string; ts: number; w: number; reps: number }> = [];
for (const session of sessions) {
  if (!session.exercises) continue;
  for (const ex of session.exercises) {
    for (const set of ex.sets) {
      logs.push({
        ex: ex.exerciseName,
        ts: set.timestamp,
        w: set.kg,
        reps: set.reps,
      });
    }
  }
}
```

Classic DRY violation. Bug fix in one spot ≠ propagated to others. If `ExerciseHistoryEntry` schema changes (rename `kg → weight`), 3 simultaneous edits required.

**Fix:** Extract `flattenSessionsToLogs(sessions: LastSessionSummary[]): Array<{ex,ts,w,reps}>` shared helper at module top. Each call site becomes 1-line. ~20min refactor + 1 unit test added.

---

### MED-CODE-14 — `TDEEStrip` doesn't refresh when day crosses midnight

**File:** `src/react/components/Progres/TDEEStrip.tsx:78-84`

**Issue:**
```typescript
useEffect(() => {
  let cancelled = false;
  getNutritionTargetTodayReal(todayIso()).then((t) => {
    if (!cancelled) setTarget(t);
  });
  return () => { cancelled = true; };
}, []);
```

`todayIso()` snapshot taken at mount. PWA always-on user who stays on Progres tab past midnight sees stale yesterday target. Long-running session.

**Fix:** Add `useEffect` listener for `visibilitychange` or `focus` event that re-fetches `getNutritionTargetTodayReal(todayIso())`. OR use a recurring timer (less ideal). Same pattern affects other "today-keyed" components — `NutritionInline.tsx:56-62` similar (dateISO from `todayIso()` snapshot).

---

### MED-CODE-15 — `ProtectedRoute` re-binds listeners every isAuthenticated change

**File:** `src/react/routes/ProtectedRoute.tsx:41-60`

**Issue:** `useEffect` dep array `[isAuthenticated, setAuthenticated]`. Whenever `isAuthenticated` changes (e.g., login/logout), the effect cleanup runs (removing listeners), then effect re-runs (adding new listeners). Inefficient but not broken. The `sync()` closure captures fresh `isAuthenticated` per run, so correctness OK.

**Fix:** Restructure to put listeners in mount-only `[]` effect, and have `sync()` read latest via `useRef`. Avoid 2-cycle re-binding. ~15min fix.

---

### MED-CODE-16 — `autoBackup.restoreFromBackup` no transaction safety

**File:** `src/util/autoBackup.js:103-135`

**Issue:** Loop on line 128-132:
```javascript
for (const [k, v] of Object.entries(backup.data)) {
  DB.set(k, v);
  keysRestored++;
}
```

If `DB.set` throws mid-loop (quota exceeded), some keys are restored, others not. Partial state with no rollback. Combined with HIGH-CODE-09 (DB.set unguarded), this is a real failure mode.

**Fix:** Snapshot current state before loop, restore on throw. OR validate all `DB.set` calls would succeed first (probe + total size estimate). Defer post-Beta — restoreFromBackup is rare user action.

---

### MED-CODE-17 — `firebase.js` window globals leak into React bundle

**File:** `src/firebase.js:362-363` + `src/react/lib/networkStatus.ts:21`

**Issue:** `networkStatus.ts` imports `FIREBASE_URL` from `firebase.js`. Vite bundles entire module (no tree-shake for module-level side-effects), so production React bundle includes:
```javascript
window.syncToFirebase = syncToFirebase;
window.syncFromFirebase = syncFromFirebase;
```

These functions are now globally accessible. Combined with `autoBackup.js:166-170` exposing `window.listBackups`, `window.restoreFromBackup`, `window.createDailyBackup` (verified — autoBackup imported by coachDirector.js, in production path), an XSS would have amplified impact.

**Fix:** Wrap window assignments in `if (typeof window !== 'undefined' && import.meta.env?.MODE !== 'production')` to dev-only. Then production XSS reduces blast radius. **HIGH SECURITY OVERLAP — coordinate with `gsd-security-auditor` parallel batch.**

---

### LOW-CODE-18 — `format.ts formatMMSS` returns "M:SS" without floor for fractional input

**File:** `src/react/lib/format.ts:17-22`

**Issue:** `formatMMSS(60.5)` returns `"1:0.5"` because:
- `Math.floor(60.5 / 60) = 1`
- `60.5 % 60 = 0.5`
- `String(0.5).padStart(2, '0') = "0.5"`

In real usage, callers pass integer second counts (Date.now diff / 1000 → typically floored upstream), but defensive coverage missing.

**Fix:** Add `Math.floor(s)` on the seconds:
```typescript
const s = Math.floor(seconds % 60);
```

Also, `formatMMSS(3700)` returns `"61:40"` (no hours boundary). Acceptable for current use cases (session ≤ ~3h max).

---

## §4 Utility layer quality

### NIT-CODE-19 — Magic numbers without named constants

**Files:** Multiple

Examples:
- `src/engine/coachDirector.js:438`: `Math.max(3, Math.ceil(originalCount * 0.8))` — magic 0.8 reduction factor
- `src/engine/coachDirector.js:422`: `Math.max(2, Math.floor((e.sets || 3) * 0.7))` — magic 0.7 AA reduction
- `src/engine/coachDirector.js:238`: `Math.round(exercise.recommendation.kg * 0.7 * 2) / 2` — magic deload 0.7

These ARE documented in ADRs but inline constants would be more readable. `const AA_VOLUME_REDUCTION_FACTOR = 0.7` etc.

**Recommendation:** Defer. Don't refactor pre-Beta.

---

### LOW-CODE-20 — `coachDecisionLog.generateEntryId` uses Math.random for IDs

**File:** `src/util/coachDecisionLog.js:114-122`

**Issue:** ID uses `Math.random()` for 4-char suffix. With 36-char charset and 4 positions, collision space = 1,679,616 per minute (since ID includes HH:MM). Theoretically possible collision if multiple writes within same minute (idempotency 4h window mostly catches). Not crypto-sensitive (CDL audit trail).

**Fix:** Acceptable as-is. Could use `crypto.getRandomValues(new Uint8Array(2))` if rebuilding, but no real risk.

---

## §5 Type safety findings

### MED-CODE-21 — `as unknown as` casts in production stores (acceptable but brittle)

**File:** `src/react/stores/scheduleStore.ts:65` + `:114` + `src/react/stores/settingsStore.ts:71`

**Issue:** Double-cast `as unknown as` is used to narrow `DayKind[]` ↔ `WeekDays` (readonly 7-tuple) where TS structural can't infer from spread. While necessary today, double-casts hide future schema drift. If `WeekDays` becomes 8-tuple, this silently survives.

**Fix:** Could replace with type guards or tuple constructor patterns. Defer post-Beta.

---

### NIT-CODE-22 — JSDoc-typed JS files in `src/engine/` lose strict checking

**Files:** Many `src/engine/*.js` files

**Observation:** Engines are `.js` with JSDoc `@type` annotations + sibling `.d.ts` companions (per Phase 4 task_11). This is acceptable strategy per TS strict baseline (D045 audit). Code quality OK but tighter would be migration to TS. Big lift, defer post-Beta. Per `TYPESCRIPT_STRICT_AUDIT_chat5.md` baseline EXCELLENT — agree.

---

## §6 Test quality findings

### Observation: ZERO skipped/todo in src/ tests

Verified via Grep `it\.skip|test\.skip|it\.todo|test\.todo` across `src/` — no matches. The "7 todo" claim from `PRE_BETA_CHECKLIST_chat5.md` line 48 likely refers to elsewhere (could be `__checks__/` Playwright or another scope).

### LOW-CODE-23 — `coachStore.test.ts` enforces `gigel` bug

**File:** `src/react/__tests__/stores/coachStore.test.ts:10` + `:24` + `:62` + `:63`

**Issue:** Tests assert `persona: 'gigel'` and `setPersona('gigel')`. This LOCKS the persona enum bug (CRIT-CODE-01) by passing tests. Bug fix requires test updates simultaneous.

**Fix:** Per CRIT-CODE-01 fix, update assertions to `'gigica'`.

---

### NIT-CODE-24 — Some test files lack proper mock teardown

**Observation:** Several tests in `react/__tests__/screens/` mock `engineWrappers` and `useWorkoutStore.getState`. Most use `beforeEach + afterEach` cleanup, BUT some rely on Vitest's auto-isolation. With `useWorkoutStore` being a Zustand singleton, leaked state between tests possible. Risk: flakiness later. Not seen in current 5387+ PASS baseline (so working today).

**Fix:** Add explicit `useWorkoutStore.setState(initialState)` in afterEach where consumed. Defer post-Beta — not blocking.

---

## §7 Pre-Beta verdict

**Code quality Beta-launch verdict: YELLOW-WITH-CLEANUP**

Beta launch is **NOT BLOCKED** by code quality findings — engineering baseline meets Bugatti craft per Daniel mandate. ZERO `as any` în production, comprehensive defensive fallbacks (try/catch + Sentry capture pattern), modern React idioms (useMemo guards, dep arrays mostly correct, exhaustive type narrowing).

**Recommended pre-Beta tactical fixes (Co-CTO autonomous, 4 items ~2h total):**

1. **CRIT-CODE-01** persona enum unify (`gigel → gigica`) + tests + migration — ~30 min
2. **HIGH-CODE-04** flattenSessionsToLogs DRY extraction în engineWrappers.ts — ~20 min
3. **HIGH-CODE-09** DB.set wrap try/catch + Sentry capture — ~15 min
4. **MED-CODE-05** delete dead `_hasRecentLog` function — ~5 min

**Recommended post-Beta cleanups (defer):**
- HIGH-CODE-07 `getLaggingSignal` "2 sapt" fix
- HIGH-CODE-03 CoachTodayCard quote dynamic wire (needs Daniel CEO mockup parity decision)
- MED-CODE-17 firebase.js window leak (security audit coordinate)
- MED-CODE-08 applyPatterns immutability hardening
- MED-CODE-11 workoutStore.pauseSession hardcoded "Push"
- All LOW + NIT items

**Recommended Daniel CEO decision needed:**
- HIGH-CODE-03 CoachTodayCard quote: preserve mockup verbatim OR engine-wire dynamic? Mockup parity vs Bugatti truth trade-off.

---

## §8 Co-CTO autonomous fix candidates

Co-CTO tactical mandate, ZERO Daniel CEO strategic input required per `feedback_co_cto_no_review_ask`:

1. **CRIT-CODE-01** Persona enum unify — pick `'gigica'` (engine + mockup wins), migrate coachStore, update 4 test assertions, fix tempoPrescription.js fallback. Single atomic Bugatti commit.
2. **CRIT-CODE-02** Replace `TARGET_DATE.toISOString()` cu `TARGET_DATE.toLocaleDateString('sv')` în reality.js:90 (consistency cu `tod()`).
3. **HIGH-CODE-04** Extract `flattenSessionsToLogs` helper în engineWrappers.ts — clean DRY.
4. **HIGH-CODE-09** Wrap `DB.set` în try/catch + Sentry. Pattern matches `autoBackup.js:54-60` existing.
5. **MED-CODE-05** Delete dead `_hasRecentLog`.
6. **MED-CODE-06** Remove `console.log calibration` line 135 (verify vite esbuild drop active first via build inspect).
7. **MED-CODE-13** Add `setDailyKcal/Protein` negative-value guard în upsertEntry.
8. **LOW-CODE-18** Add `Math.floor(s)` în formatMMSS defensive.

All 8 above tactical — no Daniel CEO strategic decision required.

---

## §9 Daniel CEO actions remaining

Strategic-only decisions (NU Co-CTO mandate):

1. **HIGH-CODE-03** CoachTodayCard quote: preserve mockup verbatim "Pectoralii recupereaza..." OR allow engine-wire dynamic (drops mockup parity)? Bugatti truth vs design fidelity trade-off. Strategic UX.
2. **MED-CODE-15** ProtectedRoute listener re-bind optimization: defer post-Beta? (Recommend defer — non-blocking, pre-Beta NU touch unless visible UX bug.)
3. **MED-CODE-17** firebase.js window leak: coordinate with `gsd-security-auditor` parallel audit. Recommend Co-CTO autonomous fix post-security-audit findings.

ZERO further strategic input needed for code quality lens. All other findings are tactical Co-CTO domain.

---

**End Code Review Nuclear chat 5. Manager out.**

— Co-CTO subagent gsd-code-reviewer Opus 2026-05-23
