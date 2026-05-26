---
title: SWEEP AUDIT — Test honesty + E2E journey completeness + app-layer bugs/security
type: audit
date: 2026-05-26
author: fresh-eyes senior-engineer sweep agent (read-only)
scope: src/** tests (engine + react) + core user journeys end-to-end + app-layer bugs/edge-cases/security (auth/restoreSession, FCM, per-UID isolation, magic-link)
method: 3 NEW lenses (test honesty, journey completion, bugs/security) — explicitly NON-overlapping with siblings STUB-WIRING-AUDIT.md (façade/feature wiring) + DECISION-FACTOR-AUDIT.md (engine decision inputs) + ENGINE-CORRECTNESS-ARCH-AUDIT.md (math/architecture)
verdict_legend: CRITICAL / HIGH / MED / LOW per finding. Test honesty = % of suite that guards REAL end-to-end behaviour vs isolated-unit-with-fabricated-inputs.
companions: STUB-WIRING-AUDIT.md + DECISION-FACTOR-AUDIT.md (read first — this doc builds on their confirmed facts without repeating them)
---

# SWEEP AUDIT — "4434 green: real or hollow?" + journeys + app-layer bugs/security

This is the final lens of the due-diligence sweep. I did NOT re-audit feature-wiring (STUB), engine decision-factors (DECISION-FACTOR), or engine math/architecture (ENGINE-CORRECTNESS). I assessed three things the others did not: (1) whether the ~4434 passing tests actually guarantee anything, (2) whether the headline user journeys complete and reflect the user's inputs, (3) app-layer bugs + auth/security.

---

## §0 Executive summary

### Test-honesty verdict

**~80–85% of the suite is genuinely real as UNIT tests. But the suite as a whole gives a FALSE impression of end-to-end feature correctness, because the ~15–20% that is hollow is concentrated in exactly the features prior audits flagged as broken — and only ONE shallow test bridges the production builder → engine → UI.** A skeptic should read "4434 green" as "the math and the rendering are well-covered; the *wires between them are barely covered*, and several green test blocks protect dead or input-starved code."

Two framings, because "% real" is ambiguous:
- **As unit tests:** ~85% real. Nutrition, auth, stores, PR/streak/readiness math, pure engine functions, util — all genuinely tested with realistic inputs. Not tautological.
- **As guarantees that the FEATURE works for a user:** much lower for the *training* half. The single real-wire integration test (`scheduleAdapterAggregate.realwire.test.ts`) only asserts output *shape* + the DP weight; it never asserts that readiness, periodization week, deload, or weakness change anything. Every other test that touches those behaviours either mocks the engine bridge (screen tests) or hand-feeds a `meta` shape production never assembles (engine tests).

### Worst offenders (test honesty)

| # | File:line | Pattern | Severity |
|---|---|---|---|
| 1 | `src/engine/schedule/__tests__/scheduleAdapter.getDailyWorkout.test.js:18-28` | `buildUserState()` hand-feeds `meta:{weeksElapsed:0}`; production `buildUserStateForPipeline` (`scheduleAdapterAggregate.ts:455-464`) NEVER sets `weeksElapsed`. Test proves a dependency prod drops, yet passes. | HIGH |
| 2 | `src/engine/__tests__/dp.test.js:125-237` | 10 `it` blocks test `DP.checkInSessionAdjust` + `DP.getSmartRecommendation` — both have ZERO production callers (`grep` confirms only the definitions in `dp.js:330,378`). Delete both functions → app behaves identically, tests still green. | HIGH |
| 3 | `src/react/__tests__/screens/antrenor/Workout.test.tsx:29-44` | The headline workout screen (80 `it` blocks) `vi.mock`s `getTodayWorkout` to a static `PHASE_5_FIXTURE` + mocks `getWhyExerciseSummary`. The real `composePlannedWorkoutToday` pipeline is never exercised here. If prod returned garbage/null, these still pass. | HIGH |
| 4 | `src/engine/periodization/tests/*` (180 it) + `deload/tests/*` (159 it) + `specialization/tests/*` (214 it) | All feed `meta.weeksElapsed` / reactive-deload triggers / `meta.lifetimeLogs` that the production builder omits (per DECISION-FACTOR §2). Engine math is correctly tested; the tests silently certify behaviours that are inert in the live pipeline. | MED (false-confidence, not false-pass) |
| 5 | `src/engine/__tests__/enginesBatch.test.js:11-22` | Re-implements a LOCAL copy of `isoWeek` inside the test file and tests the copy — production `isoWeek` lives in `src/util/isoWeek.js` (imported by `stagnationDetector.js:6`) and is NOT imported here. Tautological. (Mitigated: real `isoWeek` IS tested in `src/util/__tests__/isoWeek.test.js`.) | LOW |
| 6 | `src/react/__tests__/screens/antrenor/PostRpe.test.tsx` (51 it) + `Antrenor.test.tsx` + `WorkoutPreview.test.tsx` + `CoachTodayCard.test.tsx` | Mock `engineWrappers` (`getTodayWorkout`/`getCoachTodayQuote`/`getPRDelta`). Correctly-scoped component unit tests, but they create the *appearance* of journey coverage while guaranteeing nothing about engine output. | MED (collectively) |

**Quantified:** 11 React test files `vi.mock` the engine bridge; 30 of 134 files use `vi.mock` at all; exactly **1** file (`scheduleAdapterAggregate.realwire.test.ts`) drives the real production pipeline end-to-end — and it asserts shape + DP weight only. Total `it/test` calls ≈ 4464 (matches the ~4434 claim).

### E2E journey pass/break table

| # | Journey | Completes? | Output reflects user input? | Verdict |
|---|---|---|---|---|
| a | signup → onboarding → first workout → log sets → post-RPE → summary | YES | Partly — weights/PR/streak/summary real; "adapt to YOUR state today" largely not (see DECISION-FACTOR) | **PASS (with shallow adaptation)** |
| b | returning → readiness/energy → adapted workout → PR | YES (no dead-end) | **NO for weight** — readiness does NOT move the prescribed kg (only the rarely-firing deload `intensityMod` does). Comment `Workout.tsx:110-118` falsely claims otherwise. | **BREAK (silent wrong-result)** |
| c | missing-equipment → adapted workout | Often YES; **DEAD-END if user marks all/most equipment missing** → empty session → screen shows false "Astazi e zi de odihna" | Partly (5/10 picker items inert per STUB) | **PARTIAL / DEAD-END edge** |
| d | weight logging → nutrition target adaptation | YES | YES — genuinely adapts (Kalman TDEE from real weight+intake, floor, override precedence). The strongest journey. | **PASS** |
| e | settings / account actions (logout / delete / reset / export / import) | YES | YES for delete/reset/export; **logout leaves all local PII in place** (security finding below) | **PASS (logout has a data-isolation gap)** |

### CRITICAL/HIGH bug + security counts

- **CRITICAL: 0** strictly (the shared-device leak is HIGH given the product's stated single-user-device model, not CRITICAL).
- **HIGH: 3** — (H1) logout does not wipe local PII + no per-UID localStorage namespace → shared-device cross-user data leak + cloud contamination; (H2) PostRpe re-derives the plan at finish → completed workout silently NOT saved if the day rolled over to a rest day (midnight data loss); (H3) journey-b readiness→weight is a silent wrong-result (false on-screen claim).
- **MED: 4** — (M1) missing-equipment empty-session false "rest day" dead-end; (M2) PostRpe title/exercise-id drift across a day boundary; (M3) store-boundary input validation gap (`addWeightEntry`/`addBodyDataEntry` unvalidated; body-data no upsert → daily duplicates); (M4) Google OAuth nonce generated but never stored/verified (no replay/CSRF protection beyond Firebase server-side token validation).
- **LOW: 2** — isoWeek tautology (covered elsewhere); module-load `throw` on placeholder API key in PROD (intended fail-fast, but a missing env var hard-crashes the whole bundle at import).

---

## §1 Test honesty — detail

### 1.1 The "hand-fed meta" pattern (the systemic one) — HIGH false-confidence

DECISION-FACTOR §3 named this; I confirmed it verbatim and quantified it.

- `scheduleAdapter.getDailyWorkout.test.js:18-28` builds `meta:{ weeksElapsed: 0 }` for every case. The PRODUCTION assembler `buildUserStateForPipeline` (`scheduleAdapterAggregate.ts:455-464`) returns a `meta` with only `painButtonActive`, `painAffectedGroups`, `persona`, `goalPhase` — **no `weeksElapsed`**. So the engine test feeds the exact field prod omits.
- `periodization/tests/integration.test.js:83-93` *proves* `weeksElapsed=0→LOAD` and `weeksElapsed=3→DELOAD`. The engine is correct. But because prod never feeds `weeksElapsed` (→ NaN → frozen week 0 per DECISION-FACTOR #3), this green test certifies a progression that never advances in the live app.
- Same shape for `deload/tests` (159 it, feed `performanceDropPct`/`rirMismatch`/`aaDetectionActive`/etc. that the builder never assembles) and `specialization/tests` (214 it, feed `meta.lifetimeLogs`/`recentLogs` the builder never sets).

**Why this fools audits:** every one of these tests is a *correct, non-tautological unit test of the engine*. Nothing is wrong with the engine. The dishonesty is structural: there is no test that asserts the *production builder produces the meta the engine needs*, so the gap between "engine works given X" and "prod never provides X" is invisible. The single integration test that could catch it (`realwire`) asserts only shape + DP weight.

### 1.2 Tests for dead functions — HIGH (false protection)

`dp.test.js:125-237` — 8 tests for `checkInSessionAdjust` (2×RPE10→drop / 2×easy→bump) + 2 for `getSmartRecommendation` (readiness<60 holds weight). Both functions have **zero production callers** (`grep getSmartRecommendation|checkInSessionAdjust src --include=*.ts,*.tsx,*.js` minus tests → only `dp.js:330` and `dp.js:378`, the definitions). These 10 green tests imply "in-session RPE auto-correct" and "readiness-gated weight" are protected behaviours; they are dead code (DECISION-FACTOR #1, #2). Note also these tests heavily `vi.fn()`-mock `DP.getState` (lines 59/82/101/127/201/221) — they test branch logic given a state, never that the state is assembled.

### 1.3 Screen tests mock the brain — MED (collectively, false journey-coverage)

`Workout.test.tsx` (80 it), `PostRpe.test.tsx` (51 it), `WorkoutPreview.test.tsx`, `Antrenor.test.tsx`, `CoachTodayCard.test.tsx` all `vi.mock` `engineWrappers` (`getTodayWorkout`, `getCoachTodayQuote`, `getPRDelta`, `getWhyExerciseSummary`). These are *correctly-scoped* component unit tests — that's legitimate. The honesty problem is what they're *taken to mean*: a green "Workout screen" suite looks like end-to-end workout coverage, but the real pipeline (`composePlannedWorkoutToday`) is mocked away. If the pipeline returned `null` on a training day, these tests would not notice; only the live app (or the one shallow real-wire test) would.

### 1.4 What is genuinely REAL (confirmed solid — not crying wolf)

- **Nutrition** is the gold standard. `nutritionObservations.test.ts` feeds realistic weight+intake windows, asserts the energy-balance math (grain-of-salt: gained-while-logging-deficit → TDEE *below* log, line 58-68), imports the REAL engine `evaluateBN`. The builder itself (`nutritionObservations.ts`) guards every input with `Number.isFinite`, clamps absurd TDEE (`>12000||<=0` → skip, line 157), is pure. Journey (d) is real end-to-end.
- **auth.js** — TTL on pending email, 30s throttle, in-flight refresh dedup (`_refreshInFlight`), definitive-vs-transient failure classification (`_isDefinitiveAuthFailure`), CSPRNG nonce, Retry-After clamp. Genuinely hardened.
- **reactBoot.ts** — idempotency keyed by UID (`_postAuthDoneForUid`), local-always-wins merge invariants documented + real, graceful per-step degradation.
- **workoutStore** — `persistSessionLogs` writeback is real (the quiet enabler for DP/fatigue/PR), streak day-boundary logic correct, rolling caps.
- **sessionBuilder.test.js / prEngine / readiness / muscleRecovery / util** — real imports, real assertions.

---

## §2 E2E journeys — detail

### (a) New user → first workout → summary — PASS (shallow adaptation)
Onboarding → `onboardingStore.finalize` → pipeline. First workout: `getTodayWorkout` → real DP cold-start weights (`suggestStartWeight` scaled by experience, verified in `realwire.test.ts:328-367`). Log sets → `logSet`. PostRpe → `finishSession` (writeback) → PR enrich → streak → summary. Completes, no dead-end. Adaptation is shallow (rest=90s fixed, sets=3 fixed, no readiness→weight — all per DECISION-FACTOR), but the journey *finishes and saves correctly*.

### (b) Returning → readiness → adapted workout — BREAK (silent wrong-result)
EnergyCheck persists readiness (`saveReadiness`), and readiness genuinely feeds the *score/fatigue/coach-voice*. But the **prescribed weight does not change with readiness**: `Workout.tsx:118-124` applies only `engineIntensityMod` (the deload output, mostly inert per DECISION-FACTOR #4), and the comment at `:110-118` *claims* the self-report "already shapes the prescription via the readiness read-side" — which is false (`getSmartRecommendation` is never called). The user reports "exhausted", the app shows the same target kg, while telling them it adapted. Journey completes but produces a wrong/misrepresented result. **HIGH (H3).**

### (c) Missing-equipment → adapted workout — PARTIAL + DEAD-END edge (M1)
Permanent missing-equipment IS persisted + subtracted (`scheduleAdapter.js`), but 5/10 picker items map to `[]` (STUB §1). **New finding:** when filtering empties the session, `getDailyWorkout` returns `exercises: []` (NOT null — `scheduleAdapter.js:49`), so `Workout.tsx:99` (`hasWorkout = length>0`) is false and the screen renders **"Astazi e zi de odihna / Nu ai antrenament programat azi"** (`Workout.tsx:516-527`). A user who marked all equipment missing on a real training day is told it's a rest day, with only an "Inapoi" button and no bodyweight fallback. Misleading dead-end.

### (d) Weight → nutrition target — PASS
`LogWeight` (validated 30-250, future-date blocked, `Number.isFinite`) → `progresStore.addWeightEntry` → `NutritionInline` reads `readBayesianNutritionContext()` (line 69) → `getNutritionTargetsToday` → Kalman posterior.mu × goal mult, floored, override-precedence. Genuinely adapts to logged data. Strongest journey.

### (e) Settings/account — PASS, with logout gap
Delete (`localStorage.clear()` + `wipeUserDB(uid)` + `authSignOut`), Reset (`clearUserDataKeys`), Export/Import — all real and complete. **Logout** (`LogoutConfirm.tsx:21-31`) clears only `firebase-*` tokens + store flags — see H1.

---

## §3 Bugs / edge-cases / security — detail (app-layer, not re-covering ENGINE-CORRECTNESS)

### H1 — Shared-device cross-user data leak (no per-UID localStorage namespace + logout doesn't wipe) — HIGH
- Tier 0 storage `src/db.js:17` is bare `localStorage.getItem(k)` — **no UID prefix**. Only IndexedDB is namespaced (`andura_${uid}`, `src/storage/db.js:10`). Cloud is per-UID (`users/${auth.uid}`, `firebase.js:67`).
- `LogoutConfirm.handleConfirm` (`LogoutConfirm.tsx:21-31`) calls `authSignOut()` (tokens only) + store flags — it does NOT clear `wv2-*` / `logs` / `pain-cdl` / `wv2-progres-store` / `wv2-workout-store`.
- **Net:** user A logs out, user B logs in on the same browser → B sees A's training history, weight log, body measurements, pain history, settings. Worse: `runPostAuthSync` → `initFirebaseSync` uses local-always-wins merge (`reactBoot.ts` header invariant) → A's leftover local data gets **pushed up to B's cloud node**.
- Caveat (honest): the product's stated model is single-user-per-device, and the logout copy assumes same-email re-login ("le vei regasi exact unde le-ai lasat"). On that happy path it's fine. The leak is the shared-device / account-switch path. Delete + Reset are safe (full wipe). Rated HIGH not CRITICAL because of the single-user design intent — but for a Play-Store launch this is the kind of thing a reviewer/regulator flags.

### H2 — PostRpe re-derives the plan at finish → midnight data loss — HIGH
- The planned workout is fetched at `Workout.tsx:89` into *component-local* state, never persisted to the store. PostRpe is a separate route that **re-calls `getTodayWorkout()`** (`PostRpe.tsx:91`) to recover the title + exercise ids.
- `getTodayWorkout` → `composePlannedWorkoutToday(now = new Date())` is **day-of-week dependent**. If a session is finished after the calendar day rolls over to a configured rest day, `getTodayWorkout()` returns `null` → PostRpe's Bugatti-truth guard (`PostRpe.tsx:92-100`) **rejects the persist entirely** → the user's completed, logged workout is NOT saved to `sessionsHistory` (only a toast). A late-night lifter crossing midnight into a rest day loses the whole session.
- The guard intended to prevent fake titles instead destroys real data on a temporal edge. Root cause: plan not captured at `startSession` and threaded to finish.

### H3 — Readiness→weight silent wrong-result + false on-screen claim — HIGH
See journey (b). `Workout.tsx:110-118` comment asserts readiness shapes the prescription; it does not. This is both a wiring gap (DECISION-FACTOR's lens) AND an app-layer correctness/honesty bug (a comment that lies about behaviour the UI implies). Flagged here for the journey impact; the wiring root-cause is DECISION-FACTOR #1.

### M1 — Empty-session false "rest day" dead-end — MED
See journey (c). `Workout.tsx:516` conflates "engine returned no exercises" with "rest day". Should distinguish "all your equipment is filtered out — here's a bodyweight option / adjust equipment" from a genuine calendar rest day.

### M2 — PostRpe title/exercise-id drift across day boundary — MED
Companion to H2: if finished after midnight on a *different training day* (not a rest day), the recovered title + `exercises[exIdx]` ids come from the NEW day's template (`PostRpe.tsx:101,107`), mislabeling the saved session and mis-mapping the per-exercise breakdown.

### M3 — Store-boundary input validation gap — MED
- `progresStore.addWeightEntry` (`progresStore.ts:46`) and `addBodyDataEntry` (`:57`) do NO validation — they trust the caller. The UI (`LogWeight`) guards 30-250, but the store is the persistence boundary; any other writer (e.g. `SettingsImport` CSV path, future callers) can inject NaN/negative/absurd values that then flow into the nutrition energy-balance math. (Nutrition clamps absurd *TDEE* at line 157, but a corrupt raw weight still pollutes the trend window.)
- `addBodyDataEntry` has **no upsert-by-date** (unlike `addWeightEntry` which upserts at `:49`). Two body-data saves same day → two rows → silent duplicates in the timeline.

### M4 — Google OAuth nonce is cosmetic — MED
`buildGoogleSignInUrl` (`auth.js:236-237`) generates a CSPRNG nonce and puts it in the OAuth request, but it is **never stored** (not in localStorage/sessionStorage) and **never verified** on return — `AuthCallback.tsx:35-37` extracts `id_token` from the fragment and exchanges it directly. There is also no OAuth `state` param. So the nonce provides no replay/CSRF protection; the only real protection is Firebase's server-side `id_token` signature/audience validation inside `signInWithIdp`. For a public PWA implicit flow this is acceptable in practice (Firebase validates the token), but the nonce as written gives a false sense of CSRF protection and should either be wired (store → verify the returned token's `nonce` claim) or removed/documented. Honest severity: MED (defence-in-depth gap, not an open hole, because Firebase validates server-side).

### LOW-1 — isoWeek tautology — LOW
`enginesBatch.test.js:11-22` tests a local copy of `isoWeek`, not production `src/util/isoWeek.js`. Real coverage exists in `src/util/__tests__/isoWeek.test.js`, so this is redundancy, not a gap.

### LOW-2 — Module-load throw on placeholder API key in PROD — LOW
`auth.js:32-37` throws at module import if `FIREBASE_API_KEY === 'PLACEHOLDER_WEB_API_KEY'` and `import.meta.env.PROD`. Intended fail-fast (D040 lesson), and correct in spirit — but a missing `VITE_FIREBASE_API_KEY` env var hard-crashes the *entire bundle at import* (white screen, no graceful auth-disabled mode). Acceptable given the deploy injects it; noted so Daniel knows a build-env misconfig = total blank app, not a degraded one.

### Confirmed-solid security (not crying wolf)
- Magic-link flow: pending-email TTL + post-fail clear (`AuthCallback.tsx:79-82`), throttle, hash-cleared pre-navigate to avoid token-in-referrer (`AuthCallback.tsx:41`). Solid.
- `restoreSession` (`auth.js:461-477`): offline returning user is NOT force-signed-out; only definitive auth rejection clears. Correct.
- FCM tokens stored per-UID (`users/<uid>/fcmTokens/<token>`, `pushNotifications.ts:11`), VAPID/config gated graceful. Fine (server-side delivery still pending Daniel secrets per STUB).
- Medical disclaimer gate mounts in Layout before training flow, persists, doesn't reappear (`Layout.disclaimerGate.test.tsx`) — real safety gate.
- Skip-auth ("fara cont") correctly resets on logout (`LogoutConfirm.tsx:29`, U-14 fix).

---

## §4 Method / confidence / uncertainty
- Read-only. Nothing run, nothing modified, nothing committed. All verdicts have `file:line`.
- I did NOT find a separate Login/Signup file pair — the "Login/Signup split" the brief mentioned is a `mode: 'login'|'signup'` state inside `Auth.tsx` (line 41), same screen, both calling the same `sendMagicLink` (Firebase creates the account on first link-open). The magic-link "self-signup" path is therefore: anyone can enter any email → receive a link → first open creates the account. That is by design (passwordless), gated on a consent checkbox in signup mode; no additional abuse vector beyond email-send throttle (which exists, 30s).
- H2 (midnight data loss): I confirmed `getTodayWorkout` defaults `now` to `new Date()` and is day-of-week dependent, and that the plan is not persisted to the store (only component-local in Workout.tsx). I did NOT execute a midnight-crossing scenario; the data-loss is a static-trace conclusion (high confidence on the mechanism, the exact trigger window depends on the user's calendar config — if the next day is also a training day it's M2 mislabel, if it's a rest day it's H2 loss).
- H1 (shared-device leak): confirmed no UID prefix in `src/db.js`, confirmed LogoutConfirm scope. The cloud-contamination amplification depends on `initFirebaseSync` running post-login with leftover local data; I relied on the documented local-always-wins merge invariant in `reactBoot.ts` rather than re-tracing `firebase.js` line-by-line.
- Test-honesty % is an engineering estimate from broad sampling (engine ~1768 it, react ~1860 it, others ≈ rest of 4464), not a per-test census. The *direction* (most units real; the hollow part concentrated in the broken-feature engines + mocked screen tests + dead-function tests) is high-confidence and corroborated by DECISION-FACTOR.
