---
title: STUB / WIRING AUDIT — "Vizor fara usa" hunt
type: audit
date: 2026-05-26
author: fresh-eyes audit agent (read-only)
scope: src/react/routes/screens/** + src/react/components/** + engine bridge (engineWrappers / scheduleAdapterAggregate / scheduleAdapter / sessionBuilder)
method: end-to-end wiring trace per user action (NU code-quality, NU tests-green, NU mockup-parity)
verdict_legend: WIRED = real engine/data path end-to-end | PARTIAL = wired but a meaningful slice is inert | STUB-FACADE = renders + looks done but does nothing real | DEAD = code exists but nothing active imports/uses it
---

# STUB / WIRING AUDIT — looks-done-but-isnt hunt

**Trigger.** Daniel discovered equipment-based exercise SUBSTITUTION is not wired: `EquipmentSwap.tsx` is a self-declared stub, and the engine built for it (`alternativeEngine.js` + `alternative-finder.js`) lives only in `99-archive/`. Mission: find EVERY other instance of the same pattern. Nothing was assumed to work just because it renders or has green tests.

---

## §0 Executive summary

I traced all 48 screens in `src/react/routes/screens/**`, the central engine bridge (`engineWrappers.ts` + `scheduleAdapterAggregate.ts`), the live workout pipeline (`scheduleAdapter.getDailyWorkout` + `sessionBuilder.buildSession`), and the exercise-library + alternativeEngine status.

**Headline: the data/persistence/auth/nutrition layer is genuinely well-wired. The damage is concentrated in ONE cluster — the in-workout "adapt my session" flow (equipment + override) — plus the dormant exercise library, plus 2 small preference facades.**

### Counts (user-facing features/flows, not file count)

| Verdict | Count | What it means |
|---|---|---|
| **WIRED** | ~34 | Real engine/store/persistence end-to-end |
| **PARTIAL** | 3 | Wired, but a meaningful slice is silently inert |
| **STUB-FACADE** | 4 | Renders + looks done, does nothing real (2 with a FALSE on-screen claim) |
| **DEAD** | 2 code assets | Built, archived, nothing active uses them |

### Ranked "looks done but isn't" findings (by user-visibility / harm)

1. **[STUB-FACADE — CRITICAL, user-visible]** Equipment SUBSTITUTION ("Aparat ocupat" → EquipmentSwap). Hardcoded 5-item list, and the busy-equipment context it produces is **dropped by the consumer** + the engine entry point takes no equipment arg. Doubly dead. (Confirms Daniel's finding.)
2. **[DEAD — CRITICAL, structural]** The **657-exercise library** (`exerciseMetadata.js`, 5040 lines, Fitbod-parity, with `equipment_alternatives` + `fallback_cascade` purpose-built for substitution) is **entirely in `99-archive/`**. The LIVE app builds every workout from **~22 hardcoded exercise names** in `sessionBuilder.js` / `coldStartGuidelines.js`. PRIMER §2/§4 "library 657/657 = 100% LANDED" is **not true for the running app**.
3. **[DEAD]** `alternativeEngine.js` + `smart-routing/alternative-finder.js` — archived, zero active imports. The only references in active `src/` are in **comments**. Confirmed dead.
4. **[PARTIAL — HIGH, user-visible]** "Vreau alt antrenament" (`ScheduleOverride`). 5 options shown; only easier/harder have a cosmetic effect (banner + duration scaling). "Alta grupa", "Mobilitate", "Cardio doar" → `overrideKind` is **dropped by WorkoutPreview** → identical normal workout. The user is told "Coach respecta" but the coach does nothing for 3 of 5 options.
5. **[PARTIAL — HIGH]** Missing-equipment (`AparateLipsa`) IS persisted + consumed, BUT **5 of the 10 picker items map to an empty engine set** (`banca-inclinata / banca-plana / bara-halterelor / power-rack / banda-elastica`). Marking those missing has **zero effect** on the workout. Half the picker is cosmetic.
6. **[STUB-FACADE — MED, FALSE claim]** `SettingsThemes` (4-palette picker). On-screen copy says **"Se aplica instant" / "4 teme disponibile"** but it only writes `wv2-palette-theme`, which **nothing reads**. No palette swap happens. (NOTE: light/dark/auto in `SettingsAppearance` IS wired via `themeSync.ts` — only the 4-palette picker is dead.)
7. **[STUB-FACADE — LOW]** `SettingsPrefs` unit system **kg ↔ lb** is persist-only. No weight display anywhere converts. Switch to lb → still shows kg everywhere.
8. **[STUB-FACADE — LOW, self-honest]** `SettingsSubscription` is a placeholder ("In curand", Beta gratuit). Makes NO false promise → acceptable, not harmful.

**Bottom line for the gate:** the engine brain, persistence, auth, GDPR, PR/streak, readiness, pain-adaptation, nutrition, notifications are real. But the product's *signature differentiator* — "I don't have / don't want this exercise → coach gives an alternative" — is the single most broken thing, and the 657-library that was supposed to power it is dormant in the archive. These passed prior nuclear audits because they render, have green tests, and match the mockup; none of those check that the wire reaches the engine.

---

## §1 Feature / screen verdict table

Evidence is `file:line`. "What user expects" = the on-screen promise / mockup intent.

### Antrenor tab — the in-workout adaptation cluster (the damage zone)

| Feature / screen | What user expects | What actually happens | Verdict | Evidence |
|---|---|---|---|---|
| **EquipmentSwap** ("Aparat ocupat") | Mark a busy machine → coach swaps in an alternative exercise | Hardcoded 5-machine list (`bench/smith/...`, NOT the real session). `handleContinue` puts busy ids in `location.state.equipmentContext`; WorkoutPreview's `handleStart` persists only `intensityMod`+`painContext` → **drops equipmentContext**; and `getTodayWorkout()` takes **no equipment arg**. Nothing reaches the engine. | **STUB-FACADE** | `EquipmentSwap.tsx:35-41,57-62`; consumer drops it `WorkoutPreview.tsx:163-169`; entry has no arg `engineWrappers.ts:506` |
| **In-workout "Aparat ocupat" button** | Quick swap mid-set | Routes to the dead EquipmentSwap above | **STUB-FACADE** | `Workout.tsx:612-621` |
| **ScheduleOverride** ("Vreau alt antrenament") | Pick easier/harder/other-muscle/mobility/cardio → coach changes today | Passes `overrideKind`+`intensityMod`. WorkoutPreview consumes only `intensityMod` (banner + duration scaling). **`overrideKind` dropped** → "Alta grupa"/"Mobilitate"/"Cardio doar" all collapse to a normal workout; even easier/harder don't change the exercise list. | **PARTIAL** | `ScheduleOverride.tsx:44-57`; consumer ignores overrideKind `WorkoutPreview.tsx:104,163-169` |
| **AparateLipsa** (permanent missing equipment) | Bifez ce nu am → coach exclude/substituie permanent | Persists to `wv2-missing-equipment` (real) and `getDailyWorkout` reads + subtracts it before `buildSession`. **BUT** 5 of 10 items translate to `[]` engine ids (no effect); and `buildSession` only filters ~17 hardcoded names. | **PARTIAL** (wire real, half the items inert) | persist `scheduleAdapter.js:190-197`; consumed `scheduleAdapter.js:435-437,477-482`; empty maps `scheduleAdapter.js:340-344` |
| **PainButton** ("Ma doare ceva") | Report pain → coach avoids the region now + future | Persists append-only `pain-cdl` AND `buildUserStateForPipeline` reads it → feeds specialization Gate 4 + goalAdaptation push-back injury gates. Genuinely closes the loop. | **WIRED** | persist `PainButton.tsx:112-121`; consumed `scheduleAdapterAggregate.ts:385,404,458-459` |
| **CevaNuMerge** (problem triage) | Route to the right adaptation | Pure router; correctly tags `from:'workout'` for AparateLipsa. Destinations' quality varies (see above). | **WIRED** (as a router) | `CevaNuMerge.tsx:41-62` |
| **EnergyCheck** (5-state energy) | Self-report → coach adjusts intensity | `saveReadiness(1..5)` persists per-UID; read side (`getComputedReadinessScore`) feeds readiness/fatigue/deload. Comment notes prior bug (was nav-only) now fixed. | **WIRED** | `EnergyCheck.tsx:80` + comment 54-57 |
| **EnergyCause** | Capture cause of low energy | Routing/context to preview. Light but consistent with flow. | **WIRED** (thin) | n/a (router) |
| **WorkoutPreview** | Show today's real planned session | `getTodayWorkout()` → real 8-adapter pipeline. Renders engine exercises when present; falls back to 5 hardcoded mockup exercises + default duration/volume on null/empty. **This fallback is where a dead engine would silently look "fine".** | **WIRED** (with a demo fallback) | `WorkoutPreview.tsx:121-137,274-289`; fallback list 92-98 |
| **Workout** (state machine) | Log sets, rest, PR detection, adapt weight | Real: `getTodayWorkout`, `logSet`, `getPRDelta` → `markPRHit`, deload `intensityMod` applied to targetKg, aaFriction via engine signals, wake-lock, inactivity. Self-report intensity intentionally NOT re-multiplied here (feeds engine via readiness — design, not stub). | **WIRED** | `Workout.tsx:87-97,118-124,317-344,379-388` |
| **PostRpe** | Rate session → persist + feed learning | Real: `finishSession` (rejects persist if planned null — Bugatti truth), enrich PR, `refreshPRRecordsFromLogs`, `incrementStreak`, persists energy signal. | **WIRED** | `PostRpe.tsx:75-169` |
| **PostSummary** | Show session recap + PR + streak | Reads workoutStore (lastSession/prHit/prData/streak). | **WIRED** | `PostSummary.tsx:70-76` |
| **Antrenor (home)** | Coach today card, readiness, patterns, PRs | `getCoachToday()` real aggregate (readiness+fatigue+plannedWorkout+patterns+PRs+alerts+restReason). | **WIRED** | `Antrenor.tsx:40,51`; aggregate `coachDirectorAggregate.ts:60-95` |

### Progres / Istoric tabs

| Feature / screen | What user expects | What actually happens | Verdict | Evidence |
|---|---|---|---|---|
| Progres (home) | Coach signals + weight/body summary | `getCoachToday()` + progresStore | **WIRED** | `Progres.tsx:110-114` |
| LogWeight | Save a weigh-in | `progresStore.addWeightEntry` | **WIRED** | grep `LogWeight.tsx:addWeightEntry` |
| BodyData | Save body metrics | `progresStore.addBodyDataEntry` | **WIRED** | grep `BodyData.tsx:addBodyDataEntry` |
| WeightTimeline | Range chart + KPI + delta | Reads `progresStore.weightLog`, builds SVG trend | **WIRED** | `WeightTimeline.tsx:70-99` |
| WeightLogList | All weigh-ins | Reads `progresStore.weightLog` | **WIRED** | grep `WeightLogList.tsx:weightLog` |
| Istoric (timeline) | Real session history | `workoutStore.sessionsHistory` | **WIRED** | grep `Istoric.tsx:sessionsHistory` |
| IstoricDetail | Per-session drill-down | `workoutStore.sessionsHistory` | **WIRED** | grep `IstoricDetail.tsx` |
| PrWall | All-time PRs + 3 stats | `getPRHistoryAll()` real aggregate | **WIRED** | `PrWall.tsx:34-43` |

### Cont tab

| Feature / screen | What user expects | What actually happens | Verdict | Evidence |
|---|---|---|---|---|
| LogoutConfirm | Sign out | `authSignOut()` clears firebase-* tokens | **WIRED** | `LogoutConfirm.tsx:59-60` |
| DeleteAccountConfirm | Wipe account everywhere | Store resets + `localStorage.clear()` + `wipeUserDB(uid)` + `authSignOut()` (ordering hardened) | **WIRED** | `DeleteAccountConfirm.tsx:23-38` |
| ResetDataConfirm | Wipe all local data | 4 store resets + localStorage wipe incl unprefixed engine keys | **WIRED** | `ResetDataConfirm.tsx:85-91` |
| ResetCoachConfirm | Reset coach learning | `resetCoachState()` util | **WIRED** | `ResetCoachConfirm.tsx:66` |
| SchimbaFazaConfirm | Manual phase (CUT/BULK/…) | `setPhaseOverride()` → DB('phase-override'); consumed by nutrition `getPhaseOverrideKcalToday` + dp.js | **WIRED** | `SchimbaFazaConfirm.tsx:105`; consumer `engineWrappers.ts:630-654` |
| ProgramChangeConfirm | Change goal → regenerate | `setField('goal',...)` → onboardingStore → pipeline `goalPhaseForGoal` | **WIRED** | `ProgramChangeConfirm.tsx:35-40` |
| RedoOnboardingConfirm | Redo onboarding | `onboardingStore.reset()` | **WIRED** | grep `RedoOnboardingConfirm.tsx:reset` |
| SettingsExport | Export my data (JSON) | Serializes all stores + wv2-* keys → download | **WIRED** | `SettingsExport.tsx:142-157` |
| SettingsImport | Import history CSV | `historyImportParser` → `applyHistoryImport` (live) | **WIRED** | `SettingsImport.tsx:166-169` |
| SettingsNotifications | Push reminders | `enablePushNotifications` (FCM real) + `syncNotificationPrefs` → RTDB; per-event toggles persist | **WIRED** (client; server pending Daniel VAPID/secrets) | `SettingsNotifications.tsx:124-160` |
| SettingsAppearance — light/dark/auto | Theme switch | `settingsStore.theme` → `themeSync.ts` applies `data-theme` (real). In-file comment "store value-only V1" is STALE. | **WIRED** | `themeSync.ts:22-25,50-60` |
| SettingsAppearance — bottom nav style | Compact/comfortable | Consumed by BottomNav | **WIRED** | grep BottomNav uses bottomNavStyle |
| SettingsPrefs — weekStart | Calendar start day | Consumed by Calendar7Day | **WIRED** | grep Calendar7Day uses weekStart |
| **SettingsPrefs — unit kg/lb** | Show weights in lb | Persist-only; **no display converts** (LogWeight/WeightTimeline/WeightLogList/BodyData all kg) | **STUB-FACADE** (low) | no consumer: grep `unitSystem` absent from progres screens |
| **SettingsThemes (4 palettes)** | "Se aplica instant" | Writes `wv2-palette-theme`; **nothing reads it**; no swap | **STUB-FACADE** (false claim) | `SettingsThemes.tsx:66-69,93,131`; only writer |
| **SettingsSubscription** | Subscribe | "In curand" placeholder, no flow | **STUB-FACADE** (self-honest, OK) | `SettingsSubscription.tsx:1-5,50-58` |
| SettingsProfile / Privacy / About / Support / FAQ / Terms / Privacy | View/edit | Read/write onboarding/settings stores or static content | **WIRED** | grep `SettingsProfile.tsx`, `SettingsPrivacy.tsx` |
| Onboarding | Big-6 → save profile | `onboardingStore.finalize` → feeds pipeline | **WIRED** | grep `Onboarding.tsx:finalize` |
| Auth / AuthCallback / Splash | Magic-link / OAuth | auth.js + localStorage pendingEmail flow | **WIRED** | `AuthCallback.tsx:8-9` |

---

## §2 The confirmed truth (the 3 you asked about)

### A. Equipment substitution — CONFIRMED BROKEN (worse than just "a stub")
`EquipmentSwap.tsx` is a self-declared stub (its own header: *"Phase 3 stub placeholder … Phase 4+ wires engine cascade"*), with a hardcoded 5-item list (`EquipmentSwap.tsx:35-41`) unrelated to the real session. But it is **doubly dead**:
1. `handleContinue` (`:57-62`) passes busy ids in `location.state.equipmentContext`.
2. The consumer **`WorkoutPreview.handleStart` (`:163-169`) only persists `intensityMod` + `painContext`** to the store — it never reads `equipmentContext`.
3. The pipeline entry **`getTodayWorkout()` (`engineWrappers.ts:506`) takes no arguments** and `buildUserStateForPipeline` never reads busy-equipment — so even a perfect EquipmentSwap couldn't get its data into the engine.

So the temporary-busy-equipment path has **no wire at all**, end to end. Contrast: the *permanent* missing-equipment path (`AparateLipsa`) IS wired (persist + pipeline subtract), just with 5 inert items.

### B. The "657 exercise library" — DORMANT in the archive; live app uses ~22 names
- There is **no exercises.json / library/ / exerciseLibrary in `src/`**. The only metadata library with `equipment_type` / `equipment_alternatives` / `fallback_cascade` is **`99-archive/vanilla-legacy-pre-D028/src/schema/exerciseMetadata.js` (5040 lines)** — archived/dead.
- The **live** workout vocabulary is hardcoded: `sessionBuilder.js` `EXERCISES_BY_TYPE` (~17 names across 5 session types) + `coldStartGuidelines.js` `EXERCISE_BANK` + `exerciseMapping.js` `SIMILAR_EXERCISES`. The RO display map `exerciseDisplay.ts` covers ~22 names and its own comment states: *"There is NO nameRo field in the 657-exercise library; these are curated translations of the **bounded engine vocabulary**, not 657 fabricated strings."* (`exerciseDisplay.ts:16-21`).
- Net: a Gigel/Marius user only ever receives exercises from that ~22-name bank. The 657-library + its `fallback_cascade` (built explicitly to power equipment substitution) are not loaded by the running app. **PRIMER §2/§4 "library 657/657 = 100% LANDED" is a claim about the archived vanilla codebase, not the React production app.**

### C. alternativeEngine — DEAD, confirmed
- `alternativeEngine.js` and `smart-routing/alternative-finder.js` exist **only** in `99-archive/vanilla-legacy-pre-D028/` (+ stale worktree clones + a `coverage/*.html` artifact). No active `src/` file imports them.
- The two active-`src/` hits for "alternativeEngine" are **comments only** (`exerciseDisplay.ts`, `scheduleAdapterAggregate.ts`) describing the *English-canonical-name* convention — not a runtime dependency. Confirmed nothing active uses it.

---

## §3 Other PRIMER-claimed engines — reachability check

Cross-checked PRIMER §2 (8+1 engines + auxiliaries) against actual React reachability:

| Claim | Reachable + functional in React? | Notes / Evidence |
|---|---|---|
| Engine #1 Periodization | YES | In `getDailyWorkout` adapter array, output consumed (`volume_target_pct`) | `scheduleAdapter.js:441-490` |
| Engine #2 Goal Adaptation | YES | `goalPhase` wired from onboarding goal; AUTO phase from weight trend | `scheduleAdapterAggregate.ts:334-347`; `engineWrappers.ts:674-717` |
| Engine #3 Energy Adjustment | PARTIAL/indirect | Pipeline adapter present; the user-facing **'plus'** intensity path is not emitted by composer (only deload 'minus'). Comment: *"Phase 7+ wires 'plus' via Energy Adjustment composite"* | `scheduleAdapterAggregate.ts:546-553` |
| Engine #4 Bayesian Nutrition (Kalman) | YES (rebuilt 2026-05-26) | `getNutritionTargetsToday` real per-user TDEE + Kalman posterior + floor | `engineWrappers.ts:733-781` |
| Engine #5 Tempo / Form cues | PARTIAL | Adapter in pipeline; **no dedicated tempo UI surface** found in screens (warm-up line + why-exercise are the visible coach text). Engine runs, UI exposure thin. | adapter present `scheduleAdapter.js:447` |
| Engine #6 Specialization | YES (gates now fed) | Gate inputs (persona/tier/goalPhase/injury) wired via builder | `scheduleAdapterAggregate.ts:432-464` |
| Engine #7 Warm-up | YES | `warmup` blueprint surfaced to WorkoutPreview row | `scheduleAdapterAggregate.ts:554-563`; `WorkoutPreview.tsx:248-260` |
| Engine #8 Deload | YES | `intensity_modifier` → `minus` applied to targetKg | `scheduleAdapterAggregate.ts:546-553`; `Workout.tsx:118-124` |
| Engine #9 MMI re-resume cap | YES (silent auto-cap) | `applyMmiCapToWorkout` reads pr-records + pause; UI prompt deferred (silent) | `engineWrappers.ts:419-486` |
| Coach Director output | YES | `getCoachToday` composer (Option B, not the heavyweight class) | `coachDirectorAggregate.ts:60-95` |
| Muscle Recovery / Weakness / PR / Readiness / Streak | YES | `getCoachRestReason` / `getLaggingSignal` / `getPRDelta` / `getReadiness` / streak | `engineWrappers.ts` various |
| Notifications (FCM) | YES (client) | `enablePushNotifications` + RTDB sync; server-side needs Daniel VAPID/secrets/deploy | `SettingsNotifications.tsx:137`; `pushNotifications.ts` |
| Patterns banner (LOW_ADHERENCE + STAGNATION) | YES | `getPatternsBanner` real, gated ≥3 sessions | `engineWrappers.ts:910-960` |

**Caveat on "the engine runs":** the pipeline is real and the gates are now fed, but **everything downstream of `sessionBuilder` is still limited to ~22 exercises**. So Periodization/Specialization/Weakness "prioritize" and "filter" over a 22-name bank, not a 657-exercise library. The brain is wired; the body of exercises it can choose from is tiny.

---

## §4 Trust assessment — how much can we trust PRIMER "LANDED"?

**Medium. Trust the plumbing; verify every "feature" claim against the running React app, not the engine folder or the archive.**

- **High-trust (verified real here):** auth/logout/delete, GDPR export/import, weight/body/PR/streak/history, readiness, pain-adaptation, nutrition brain (Kalman, rebuilt 2026-05-26), notifications client, theme (light/dark), all destructive drill-downs. These are wired end-to-end with honest fallbacks.
- **Low-trust / contradicted by code:**
  - **"library 657/657 = 100% LANDED" (PRIMER §2/§4/§6)** — true of the archived vanilla schema; **the React app ships ~22 exercises**. This is the biggest gap between claim and running reality.
  - **Equipment substitution** — the differentiator; not wired (busy) / half-inert (missing).
  - **"engines pipeline 8/8 + MMI #9 LANDED" (PRIMER)** — the engines *execute*, but two of the user-facing adaptation surfaces they're supposed to drive (equipment swap, schedule override beyond easier/harder) don't carry their data through, and the exercise bank is tiny. "Engine exists + tested" was repeatedly conflated with "feature works for the user".

**Why prior nuclear audits missed all this:** they optimized for code-quality, tests-green, math-correctness, and mockup-parity. Every broken item here **renders correctly, has passing tests, and matches the mockup** — the failure is purely that the wire doesn't reach the engine, or the engine's data source (the 657 library) was archived out from under it. The `WorkoutPreview` hardcoded fallback (`:92-98`) is especially deceptive: when the engine returns nothing, the screen shows a plausible 5-exercise Push session, so a manual smoke test looks healthy.

**Recommended verification lens going forward (not fixes — per scope):** for each "LANDED feature," trace user-action → store/persist write → engine input → engine output → UI read. If any hop is missing, it's a facade regardless of tests/parity. Priority re-checks: (1) wire EquipmentSwap+override context through `handleStart`/`getTodayWorkout`; (2) decide whether the 657 library gets loaded into `sessionBuilder` or PRIMER is corrected; (3) complete the 5 empty equipment maps or remove those picker rows; (4) fix or hide SettingsThemes "instant" claim + kg/lb.

---

## §5 Notes on method / confidence

- Read-only. No code modified, nothing committed.
- Every verdict above has a `file:line`. Where I wrote WIRED I confirmed an actual store/engine/persistence call, not just an import.
- Worktree copies under `.claude/worktrees/**` and `coverage/**` were ignored as non-source (they only echo the archive).
- One residual unknown (low impact): I did not exhaustively trace `EnergyCause` content beyond confirming it routes with state; it is a thin router, not a claimed engine surface.
