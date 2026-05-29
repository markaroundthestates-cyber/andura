# SECTION 06 — Workout flow (energy → preview → LIVE → rpe → summary + safety landmines)

> **Weight 10% · Gate 98% · CRITICAL.** This is the live-training experience plus
> every safety landmine. It is the section that should have caught the
> "logged 5x the recommended weight with no warning" issue Daniel found
> 2026-05-29 — and the steps below pin that gap explicitly (see `06.AA.*`).
>
> **Run discipline (from 00-MASTER):** one verdict per step, evidence mandatory,
> no silent BLOCKED. Behavior/parity steps run against a SEEDED populated account
> (history present) AND a fresh no-history account where the step says so — the
> recommendation-friction gap only shows on the no-history path. Parity steps diff
> the LIVE rendered screen vs the hand-built mockup `interfata-noua/screens-workout.jsx`.
>
> **Surface map (every screen + state this section enumerates):**
> - Entry: `Antrenor` Start → `EnergyCheck` → (minus) `EnergyCause` → `WorkoutPreview`
> - LIVE: `Workout.tsx` phases `loading | empty | logging | rest | transition` + `idle/rating`
> - LIVE components: `SessionTimer` (+ `SessionElapsed`, ⋯ menu), `SetLogInput` (± dial + free input, 3 modes), `SetRatingButtons`, `RestOverlay` (+ `SVGCountdownRing`), `PrFlash`, `InactivityPrompt`, `ExitConfirmSheet`, `AaFrictionModal`, `AparatLipsaSheet`, why-modal, `ExerciseMedia`
> - Safety: `aaFrictionDetect.ts` + `deriveThresholds` + LOCK9 modal + `DP.checkInSessionAdjust`
> - Post: `PostRpe` (select-then-Save) → `PostSummary` (streak/PR/muscles/Marius)
> - Sub-flows from "ceva nu merge": `CevaNuMerge`, `PainButton`, `EquipmentSwap`, `AparateLipsa`, `ScheduleOverride`
> - Wake-lock, finish-early (`FinishEarlyConfirm`), exit/pause/discard, never-delete invariants

---

## 06.A — ENTRY: Coach "Start session" → EnergyCheck

### [06.001] Coach Start CTA routes to energy-check
- **Check:** Tapping the workout-day Start CTA on the Coach tab (CoachTodayCard "Incepe sesiunea" / reactivate Start) navigates to `energy-check`, not directly to `workout`.
- **Where:** `src/react/routes/screens/antrenor/Antrenor.tsx:137-143` (`handleStart`, `handleReactivateStart` → `gotoPath('energy-check')`).
- **Expected:** Both handlers navigate to the energy-check route; there is no surviving "Incepe antrenament" duplicate CTA on Antrenor (removed 2026-05-28, comment L20-21).
- **Verify:** Playwright (seeded, workout day): open Coach tab → tap the start button → URL is the energy-check route + `[data-testid="energy-check"]` renders. Then `grep -n "gotoPath('workout')" Antrenor.tsx` → MUST be empty (entry never skips energy-check).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.002] EnergyCheck renders 5 distinct options
- **Check:** EnergyCheck shows exactly 5 energy options (Excelent / Bine / Normal / Slabit / Obosit), each with a distinct color dot, label, hint, chevron.
- **Where:** `src/react/routes/screens/antrenor/EnergyCheck.tsx:68-74` (`ENERGY_OPTIONS`), rendered L114-138.
- **Expected:** 5 buttons with `data-energy-level` = excelent|bine|normal|slabit|obosit; color ramp green→lime→yellow→orange→red (5 distinct), color dot is `aria-hidden`.
- **Verify:** Playwright: `[data-energy-level]` count == 5; assert each level present; assert the 5 dot background colors are pairwise distinct (computed style).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.003] EnergyCheck persists readiness to the engine on select
- **Check:** Selecting an option calls `saveReadiness(option.readiness)` (1..5) so the engine read-side (`getComputedReadinessScore`) is fed — not only navigation state.
- **Where:** `EnergyCheck.tsx:84` (`saveReadiness(option.readiness)`); readiness map L69-73 (excelent=5 … obosit=1).
- **Expected:** After picking "Excelent", the readiness store holds 5; picking "Obosit" holds 1. The readiness feeds the per-exercise targetKg upstream (`DP.getSmartRecommendation(name, readinessScore, …)`).
- **Verify:** Playwright: pick "Excelent" → `browser_evaluate` read the readiness store/DB key → value maps to 5. Repeat for "Obosit" → 1. Confirm `saveReadiness` is imported + invoked (`grep -n saveReadiness EnergyCheck.tsx`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.004] EnergyCheck routing branch: minus → energy-cause
- **Check:** Picking Slabit or Obosit (`intensity === 'minus'`) routes to `energy-cause`; the other 3 route straight to `workout-preview`.
- **Where:** `EnergyCheck.tsx:85-91` (`handleSelect` branch).
- **Expected:** excelent/bine/normal → `workout-preview` with `state.intensityMod`; slabit/obosit → `energy-cause` with same state.
- **Verify:** Playwright 5x: pick each, assert destination route. Excelent→preview, Bine→preview, Normal→preview, Slabit→cause, Obosit→cause.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.005] EnergyCheck back button works
- **Check:** SubHeader back (`energy-check-back`) calls `navigate(-1)` returning to the Coach tab.
- **Where:** `EnergyCheck.tsx:93-95,99-103`.
- **Expected:** Back returns to the prior route, no orphan state.
- **Verify:** Playwright: Coach → Start → energy-check → tap `[data-testid="energy-check-back"]` → back on Coach tab.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.006] EnergyCheck strings are i18n + no diacritics
- **Check:** subHeaderTitle / title / subtitle / 5 labels / 5 hints all render via `t()`; RO renders no-diacritics.
- **Where:** `EnergyCheck.tsx:101,109-111,133-134`; keys under `energyCheck.*`.
- **Expected:** Zero hardcoded user-facing literals; both `en.json` + `ro.json` carry every key; RO strings diacritic-free.
- **Verify:** `grep -nE "Cum te simti|Excelent|Obosit|Slabit" EnergyCheck.tsx` → only inside comments, not JSX text. i18n scanner passes for this file.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.B — ENTRY: EnergyCause (the "minus" branch)

### [06.010] EnergyCause renders 6 cause options + icons
- **Check:** EnergyCause shows 6 causes (Dormit putin / Mancat putin / Stres mental / Antrenament greu ieri / Boala sau racit / Altceva) each with a Lucide icon.
- **Where:** `EnergyCause.tsx:70-77` (`CAUSE_OPTIONS`), rendered L118-129.
- **Expected:** 6 buttons with `data-cause` canonical RO values; icons Moon/Utensils/Wind/Dumbbell/Thermometer/MoreHorizontal.
- **Verify:** Playwright: `[data-cause]` count == 6; each canonical value present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.011] EnergyCause Skip is always visible (anti-force-typing)
- **Check:** The "Skip" CTA (`energy-cause-skip`) is always rendered — the user can proceed without picking a cause.
- **Where:** `EnergyCause.tsx:131-138`; D-LEGACY-010 §AMENDED.
- **Expected:** Skip navigates to `workout-preview` carrying `energyLevel` + `intensityMod` (no `cause`).
- **Verify:** Playwright: reach energy-cause (pick Obosit) → tap skip → on workout-preview, `location.state.cause` is undefined, `intensityMod === 'minus'` preserved.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.012] EnergyCause select forwards the cause context
- **Check:** Picking a cause forwards `{ energyLevel, intensityMod, cause }` to workout-preview.
- **Where:** `EnergyCause.tsx:90-94` (`handleSelect`).
- **Expected:** `location.state.cause` equals the canonical RO string of the picked option; `intensityMod` is the inherited minus.
- **Verify:** Playwright: pick "Dormit putin" → assert `location.state.cause === 'Dormit putin'`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.013] EnergyCause survives a direct hit with no state
- **Check:** Reaching energy-cause without location.state (deep link / refresh) does not crash; energyLevel/intensityMod default to undefined and Skip still works.
- **Where:** `EnergyCause.tsx:87-88` (`?? {}` guard).
- **Expected:** No throw; Skip navigates to preview (which itself defaults `intensityMod='normal'`).
- **Verify:** Playwright: navigate directly to the energy-cause route → screen renders → tap skip → preview renders normal banner.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.014] EnergyCause strings i18n + no diacritics
- **Check:** subHeaderTitle / body / 6 labels / skipCta via `t()`; RO diacritic-free.
- **Where:** `EnergyCause.tsx:109,114,127,137`; keys `energyCause.*`.
- **Expected:** Zero hardcoded JSX text; both locales complete.
- **Verify:** i18n scanner for this file; `grep -nE "Alege una|Coach-ul foloseste" EnergyCause.tsx` → comment-only.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.C — WorkoutPreview (`WorkoutPreview.tsx`)

### [06.020] Preview hero title from engine, with honest fallback
- **Check:** The preview title shows the engine `workoutTitle` when real; falls back to a localized title when the engine emits the sentinel ("Antrenament azi") — never an EN-leak under RO or a fabricated muscle title.
- **Where:** `WorkoutPreview.tsx:154-160` (`isEngineFallback` + `title`).
- **Expected:** Real plan title renders verbatim; sentinel → `t('workout.preview.fallbackTitle')`.
- **Verify:** Seeded plan with a real title → assert `[data-testid="preview-hero"] h1` == that title. Force the sentinel (engine fallback) → assert localized fallback, no "Antrenament azi" leak under EN.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.021] Preview meta row: duration / count / volume
- **Check:** The three meta chips (`preview-duration`, `preview-exercise-count`, `preview-volume`) show "~N min", exercise count, and formatted kg.
- **Where:** `WorkoutPreview.tsx:247-260`; values L169-182, 207.
- **Expected:** Numbers track the engine output (`estimatedDuration`/`volumeKg`/`exerciseCount`), modulated by `engineIntensityMod` (minus ×0.7/×0.82, plus ×1.2/×1.16).
- **Verify:** Seeded plan: read engine `estimatedDuration`/`volumeKg` via `browser_evaluate`, compute expected for the active intensityMod, assert the rendered chip values match.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.022] Preview intensity banner tracks the self-report
- **Check:** The banner (`preview-intensity-banner`) accent + copy reflect the EnergyCheck self-report intensityMod: plus=volt, normal=aqua, minus=ember.
- **Where:** `WorkoutPreview.tsx:56-64` (`bannerFor`), 266-284; `data-intensity` attr.
- **Expected:** Pick Excelent → banner `data-intensity="plus"` + volt accent; Obosit → `minus` + ember. `role=status aria-live=polite`.
- **Verify:** Playwright per branch: assert `data-intensity` + banner copy key + accent color-mix base.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.023] Preview self-report does NOT double-count into prescription
- **Check:** The blunt self-report multiplier is applied to duration/volume only via the ENGINE intensityMod (C3 fix), NOT stacked on top of the readiness-shaped prescription.
- **Where:** `WorkoutPreview.tsx:161-182` (duration/volume use `engineIntensityMod`, not the self-report `intensityMod`).
- **Expected:** Duration/volume math uses `workout.intensityMod`; the self-report only tints the banner. No double-discount.
- **Verify:** Seed a session where self-report=minus but engine=normal → assert duration/volume are the engine-normal values (no extra ×0.7) while the banner shows ember.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.024] Preview warmup row renders only when engine emits a blueprint
- **Check:** `preview-warmup-row` renders iff `workout.warmup` exists; copy synthesized locale-aware ("Warm-up ~X min" / "Incalzire ~X min") from `durationMin`, falling back to `warmup.line`.
- **Where:** `WorkoutPreview.tsx:290-309`.
- **Expected:** No warmup → row absent. Warmup w/ durationMin>0 → localized line, no RO leak under EN.
- **Verify:** Seed plan with + without warmup; assert presence/absence and the localized string.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.025] Preview exercise list mirrors the engine workout
- **Check:** The list (`preview-exercise-list`) renders one `preview-exercise-row` per planned exercise, each with numbered badge, name, sub (equipment), and detail (`sets × kg / reps`), plus an `ExerciseMedia` thumbnail.
- **Where:** `WorkoutPreview.tsx:319-394`.
- **Expected:** Row count == engine `exercises.length`; detail string == `t('workout.preview.exerciseDetail', {sets,kg,reps})` per exercise.
- **Verify:** Seeded plan: row count == engine count; for each row assert name + detail match the engine exercise.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.026] Preview falls back to the 5-item mockup demo when engine emits 0
- **Check:** When the engine returns an empty exercise array (edge: sessionBuilder context mismatch), the 5 hardcoded mockup exercises render so the user is never stranded.
- **Where:** `WorkoutPreview.tsx:91-97` (`FALLBACK_EXERCISES`), 339-349.
- **Expected:** Empty engine array → 5 fallback rows (incline DB press / military / lateral / triceps cable / plank), localized via keys.
- **Verify:** Force empty exercises → assert 5 rows with the fallback names.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.027] Preview error banner on promise rejection (defense-in-depth)
- **Check:** If `getTodayWorkout()` rejects past the wrapper safe-catch, `preview-error-banner` (role=alert) shows AND fallback content still renders so the user can start.
- **Where:** `WorkoutPreview.tsx:132-147, 219-234`; `aria-busy={loading}`.
- **Expected:** On rejection → error banner visible + fallback exercises + start CTA still tappable.
- **Verify:** Mock `getTodayWorkout` to reject (test harness) → assert banner + CTA present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.028] Preview equipment recompose surfaces named swaps
- **Check:** When EquipmentSwap forwarded `busyCoarseTypes`, the affected rows show the NAMED alternative with the swap-reason prefix ("Inlocuit · {original} ocupat").
- **Where:** `WorkoutPreview.tsx:189-192` (`recomposeWithBusyTypes`), 335 (`swappedPrefix`).
- **Expected:** A busy coarse type that blocks a planned exercise → that row's name is the alternative + sub shows the swap reason.
- **Verify:** Playwright: EquipmentSwap → mark a station busy that blocks a planned lift → Continue → preview row shows the alternative name + `preview-exercise-sub` swap prefix.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.029] Preview "Confirma, incep" persists sessionContext then navigates
- **Check:** The start CTA (`preview-start-cta`) calls `setSessionContext({ intensityMod, painContext })` BEFORE navigating to `workout`, so the adapted target survives navigation + refresh.
- **Where:** `WorkoutPreview.tsx:194-200, 420-428`; Check icon prefix + confirmation copy.
- **Expected:** Store `sessionContext` is populated with the preview's intensityMod (+painContext if from PainButton) before the route change.
- **Verify:** Playwright: minus flow → tap start → `browser_evaluate` store `sessionContext.intensityMod === 'minus'` then URL == workout.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.030] Preview closing note + coach line render
- **Check:** The anti-paternalism closing note (`preview-closing-note`) renders before the CTA; coach line (`preview-coach-line`) renders when `coachPick('preview')` is non-empty.
- **Where:** `WorkoutPreview.tsx:396-414`.
- **Expected:** Both present; closing note via `t('workout.preview.closingNote')`.
- **Verify:** Playwright: assert both testids present + non-empty text.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.031] Preview strings i18n + no diacritics + no RO-leak under EN
- **Check:** Every preview literal (title fallback, banner, warmup, detail, closing note, CTA, fallback names) via `t()`; EN locale renders English, RO diacritic-free.
- **Where:** `WorkoutPreview.tsx` throughout; keys `workout.preview.*`.
- **Expected:** No hardcoded JSX strings; both locales complete; sentinel handling prevents "Antrenament azi" leaking under EN.
- **Verify:** i18n scanner for this file; render under EN with engine sentinel title → assert no Romanian on screen.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.D — LIVE Workout: mount, phases, header

### [06.040] Workout loading state while pipeline resolves
- **Check:** Before `getTodayWorkout()` resolves (`exercises === null`), the screen renders the loading state (`workout-loading`, `data-phase="loading"`).
- **Where:** `Workout.tsx:773-785`.
- **Expected:** Loading copy via `t('workout.loading')`; no exercise UI; no crash on `exercises[index]`.
- **Verify:** Playwright with delayed pipeline (or test harness) → assert `[data-phase="loading"]` + `workout-loading` visible.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.041] Workout empty state (rest day / engine null)
- **Check:** When `getTodayWorkout()` resolves to null/empty (`!hasWorkout`), the empty state renders with title, body, and a back-to-Antrenor CTA (`workout-empty-back`).
- **Where:** `Workout.tsx:791-814`, `data-phase="empty"`.
- **Expected:** Empty copy via `t('workout.empty.*')`; back CTA returns to Antrenor.
- **Verify:** Force empty plan → assert empty state + tap back → Antrenor.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.042] Workout starts a session on mount when idle
- **Check:** On mount, if `getCurrentMode` is `idle` (no live/paused/last priority), `startSession(Date.now())` fires (sessionStart set).
- **Where:** `Workout.tsx:239-249`.
- **Expected:** Fresh entry → sessionStart populated; resumed-from-pause entry (mode active) does NOT re-init (Antrenor called resumeSession first).
- **Verify:** Playwright fresh: enter workout → store `sessionStart != null`. Resume path: pause → resume from Antrenor → enter → sessionStart preserved (not reset).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.043] SessionTimer header: title + Ex N/M + elapsed clock
- **Check:** Header shows the workout title (`workout-title`), "Ex {idx+1}/{total}" (`workout-progress`), and a live MM:SS elapsed (`SessionElapsed`).
- **Where:** `SessionTimer.tsx:118-127`; `Workout.tsx:855-874`.
- **Expected:** Title is the real workoutTitle (not a hardcoded "Push" lie); Ex counter increments on exercise advance; elapsed ticks each second.
- **Verify:** Playwright: assert `workout-title` == plan title; advance an exercise → Ex counter bumps; wait 2s → elapsed advances.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.044] SessionTimer is memoized — elapsed tick does not re-render the subtree
- **Check:** The per-second elapsed tick is isolated to `<SessionElapsed>`; `SessionTimer` is `React.memo` and parent passes stable `useCallback` handlers + raw `sessionStart`.
- **Where:** `SessionTimer.tsx:289` (`memo`); `Workout.tsx:177-180` comment + stable callbacks L546-768.
- **Expected:** The header chrome does not reconcile every second; only the leaf updates.
- **Verify:** React profiler / render-count instrumentation over 3s: SessionTimer renders 0 extra times from the clock; SessionElapsed updates ~3×.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.045] Global progress bar setsDone/setsTotal advances correctly
- **Check:** The `workout-progress` bar (`setsDone`/`setsTotal`) bumps on BOTH rating AND skip-pause (mockup setIdx semantic) — it does NOT freeze at 1/N between rate→skip-pause (Daniel smoke 2026-05-28).
- **Where:** `Workout.tsx:840-847` (`setsDone = min(setsTotal, loggedSoFar + (isMidSet?1:0))`); `SessionTimer.tsx:111-114, 153-182`.
- **Expected:** logging set1 → 1; rate set1 (rest) → 1; skip pause (logging set2) → 2; rate set2 → 2. Fill % matches.
- **Verify:** Playwright: log set 1, rate, then skip rest → assert `workout-progress-sets` shows 2/N (not stuck at 1/N) + fill width increased.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.046] setsDone clamps to setsTotal (no overshoot on last set)
- **Check:** The `+1` in-progress increment is clamped so the counter never exceeds total.
- **Where:** `Workout.tsx:847` (`Math.min(setsTotal, …)`).
- **Expected:** On the final set, `setsDone === setsTotal`, fill ≤ 100%.
- **Verify:** Playwright: drive to the last set of the last exercise → assert `workout-progress-fill` width ≤ 100% and sets counter == total.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.047] Live volume count-up chip is derived from real history
- **Check:** The `workout-live-volume` chip = Σ(kg×reps) across logged sets (count-up animated), `aria-hidden`.
- **Where:** `Workout.tsx:388-392, 885-898`.
- **Expected:** Reads 0 pre-session; after logging 22.5kg×10 it shows 225 (rounded); chip is aria-hidden (ambient, not announced).
- **Verify:** Playwright: log a set → assert chip value == computed Σ; assert `aria-hidden="true"` on the wrapper.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.048] Current exercise name + sub + media render
- **Check:** Log-zone shows the current exercise name (`wv2-exname`), optional sub (`wv2-ex-sub`), and an `ExerciseMedia` card.
- **Where:** `Workout.tsx:903-942`.
- **Expected:** Name == current planned exercise; sub renders only when present; media card renders the placeholder/asset.
- **Verify:** Playwright: assert `wv2-exname` text == current exercise; `workout-exercise-media` present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.E — LIVE Workout: per-set logging (`SetLogInput`)

### [06.050] targetKg pre-fill from engine recommendation
- **Check:** The kg input pre-fills with the engine `targetKg` (readiness-shaped upstream), and reps with `targetReps`.
- **Where:** `Workout.tsx:165-177` (`targetKg`), `322-326` (reset effect), `SetLogInput` `kg`/`reps` props.
- **Expected:** On a fresh set, the `tinta` display + editable inputs show the recommended kg/reps.
- **Verify:** Playwright seeded: enter workout → assert `setlog-tinta-kg` == engine targetKg, `setlog-tinta-reps` == targetReps.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.051] intensityMod scales targetKg (deload / pain override)
- **Check:** When `intensityMod==='minus'` (engine deload OR pain-context), targetKg = round(base×0.8 to 0.5); `'plus'` = ×1.15; pain-context wins over engine baseline.
- **Where:** `Workout.tsx:161-170`.
- **Expected:** minus session → pre-fill is the ×0.8 value rounded to 0.5; pain mid-session forces minus on remaining sets.
- **Verify:** Seed minus plan → assert pre-fill == round(base×0.8). Then trigger PainButton mid-session → next set pre-fill reflects minus.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.052] SetLogInput `tinta` mode forces confirmation before rating
- **Check:** Before logging, the component is in `tinta` mode: target shown as reference + editable kg/reps inputs + "Confirma setul" CTA; the rating row is hidden until confirm.
- **Where:** `SetLogInput.tsx:132-253`; `Workout.tsx:1032-1056` (rating row gated on `setLogged || editing`).
- **Expected:** Rating buttons NOT visible in `tinta` mode; appear only after `onLog`/pencil.
- **Verify:** Playwright: fresh set → `setrating-feel-card` absent; tap `setlog-tinta-log-btn` → feel card appears.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.053] ± dial nudges kg by 0.5 / reps by 1, clamped + grid-rounded
- **Check:** The dial buttons step kg ±0.5 (rounded to 0.5 grid) and reps ±1, clamped to bounds; they feed the same `onKgChange`/`onRepsChange` as the input.
- **Where:** `SetLogInput.tsx:64-97` (`stepValue`, `DialButton`), 171-228, 309-379.
- **Expected:** From 22.5 kg, `+` → 23.0, `−` → 22.0; reps `+`/`−` ±1; no decimals on reps; clamp at min/max.
- **Verify:** Playwright: tap `setlog-tinta-kg-plus` → input becomes prev+0.5; tap `setlog-tinta-reps-minus` at min → stays at min.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.054] Free kg/reps input — leading-zero deletable + select-on-focus
- **Check:** When value is 0/NaN the input shows EMPTY (not a stuck "0"); focus selects current value (paste-ready). Daniel smoke: "nu pot sterge 0 din fata".
- **Where:** `SetLogInput.tsx:120-130` (`kgDisplay`/`repsDisplay` empty when ≤0), `handleFocus` select.
- **Expected:** User can type "22" directly over the field without first deleting a zero.
- **Verify:** Playwright: clear the kg field → it is empty (no "0"); focus then type "22" → value 22 not "022".
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.055] Logged value == confirmed value (not silent recommendation)
- **Check:** The set logged into history is whatever is in the inputs at confirm — if the user edits, the edited value persists; if they don't, the recommendation persists.
- **Where:** `SetLogInput.tsx:185, 217` (onChange → parent state); `Workout.tsx:394-395` (`logSet({kg:kgInput, reps:repsInput})`).
- **Expected:** Edit kg from 22.5→30 then confirm+rate → history entry kg==30.
- **Verify:** Playwright: edit kg, confirm, rate "potrivit" → `set-history-0` shows the edited value.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.056] Post-log readonly + pencil revise
- **Check:** After confirm, `SetLogInput` shows `post-log` mode ("Tu ai facut X repetari cu Y kg" + pencil); tapping pencil returns to editable inputs.
- **Where:** `SetLogInput.tsx:256-282`; `Workout.tsx:1035-1052` (`editing` state).
- **Expected:** post-log text reflects logged values; pencil → editable mode; rating row stays visible during edit.
- **Verify:** Playwright: confirm → `setlog-postlog-text` shows values → tap `setlog-postlog-edit` → inputs editable again.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.057] Editable-mode a11y bounds + error messaging
- **Check:** In `editable` mode the inputs are `aria-required`, show `aria-invalid` + `role=alert` errors when kg out of [1,500] or reps out of [1,100].
- **Where:** `SetLogInput.tsx:292-391` (`kgError`/`repsError`, `kg-input-error`, `reps-input-error`).
- **Expected:** Typing 600 kg → kg error visible + `aria-invalid="true"`; valid value clears it.
- **Verify:** Playwright (editable mode): type 600 → assert `kg-input-error` present; type 50 → cleared.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.058] Confirm CTA disabled until reps ≥ 1
- **Check:** "Confirma setul" is disabled when reps < 1 (NaN/0) to prevent logging an empty set.
- **Where:** `SetLogInput.tsx:244` (`disabled={!Number.isFinite(reps) || reps < 1}`).
- **Expected:** Clear reps → CTA disabled; set reps to 1+ → enabled.
- **Verify:** Playwright: empty reps → `setlog-tinta-log-btn` disabled; reps=8 → enabled.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.059] Set history list accumulates prior sets of the exercise
- **Check:** `set-history` shows one row per logged set of the current exercise with "kg x reps - rating".
- **Where:** `Workout.tsx:1013-1026`.
- **Expected:** After 2 sets, 2 history rows with correct values + ratings.
- **Verify:** Playwright: log 2 sets → assert `set-history-0` + `set-history-1` values.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.060] SetLogInput strings i18n + no diacritics
- **Check:** targetLabel / askDoneLabel / kgLabel / repsLabel / confirmSetCta / youDidLabel / errors via `t()`; RO diacritic-free.
- **Where:** `SetLogInput.tsx` `setLog.*` keys throughout.
- **Expected:** No hardcoded literals; both locales.
- **Verify:** i18n scanner for the file.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.F — LIVE Workout: feel-card rating (`SetRatingButtons`)

### [06.070] Feel card: 3 ratings with canonical engine keys
- **Check:** The feel card shows Usor/Potrivit/Greu with `data-rating` = usor|potrivit|greu (canonical, locale-independent) under an eyebrow heading.
- **Where:** `SetRatingButtons.tsx:44-83`.
- **Expected:** 3 buttons, `data-rating` canonical; accents volt/aqua/ember; appears only post-confirm.
- **Verify:** Playwright: confirm a set → 3 `[data-rating]` buttons present with canonical values.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.071] Rating tap dispatches to handleLogSet (single tap = log)
- **Check:** Tapping a rating calls `onRate(rating)` → `handleLogSet(rating)` which runs the AaFriction pre-check then `performLogSet`.
- **Where:** `SetRatingButtons.tsx:67`; `Workout.tsx:475-509, 1056`.
- **Expected:** A rating tap logs the set (history grows) unless AaFriction intercepts.
- **Verify:** Playwright (no-trigger conditions): confirm + rate → history row added, phase → rest/transition.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.072] Per-set rating → RPE map for in-session adjust is distinct from persist map
- **Check:** The in-session adjust uses `INSESSION_RATING_TO_RPE` (usor 6.5 / potrivit 7.5 / greu 10), distinct from the persisted `RATING_TO_RPE` (greu caps 8.5 so a single honest hard set never trips dp's RPE≥9 cliff).
- **Where:** `Workout.tsx:77-81` (in-session map) vs the persisted map (workoutStore `RATING_TO_RPE`).
- **Expected:** greu maps to 10 ONLY for the live "2× hardest → drop next set" decision, not for persisted fatigue/dp history.
- **Verify:** Code review both maps + assert the in-session map feeds only `DP.checkInSessionAdjust` (L441). Behavior test: 2× greu fires the down-path (06.AA.060) without persisting an RPE-10.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.073] Feel-card strings i18n + accessible names
- **Check:** Eyebrow prompt + 3 labels via `t()`; buttons have an accessible name (label text); no empty `role=list`.
- **Where:** `SetRatingButtons.tsx:56-81` + comment L59-61.
- **Expected:** Accessible name for each rating; RO diacritic-free.
- **Verify:** i18n scanner; a11y snapshot shows 3 named buttons, no list role.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.G — LIVE Workout: state machine transitions

### [06.080] logging → rest after a non-last set
- **Check:** Rating a non-last set sets `restCountdown = restSec` + `restInitialSec` and `phase='rest'`.
- **Where:** `Workout.tsx:459-473` (`performLogSet` tail).
- **Expected:** After set 1 of a 4-set exercise → phase `rest` + RestOverlay visible.
- **Verify:** Playwright: log+rate set 1 → `[data-phase="rest"]` + `rest-overlay` present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.081] rest countdown auto-advances to logging at 0
- **Check:** The 1Hz interval decrements `restCountdown`; at ≤1 it clears + sets `phase='logging'`.
- **Where:** `Workout.tsx:257-270`.
- **Expected:** Countdown reaches 0 → next set's logging zone shows automatically.
- **Verify:** Playwright: enter rest with a short restSec (seed) → wait → phase returns to logging without interaction.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.082] Skip rest returns to logging immediately
- **Check:** `rest-skip` zeroes the countdown + sets phase=logging + bumps activity.
- **Where:** `Workout.tsx:536-540`; `RestOverlay.tsx:95-107`.
- **Expected:** Tap skip → logging zone of the next set appears at once.
- **Verify:** Playwright: in rest → tap `rest-skip` → `[data-phase="logging"]`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.083] Last set of exercise (not last exercise) → transition
- **Check:** Rating the last set of an exercise that is NOT the last exercise sets `phase='transition'` then `advanceExercise()` after 1.5s.
- **Where:** `Workout.tsx:459-469`.
- **Expected:** Transition screen shows next exercise name + coach line, then auto-advances; exIdx increments.
- **Verify:** Playwright: finish exercise 1 of N → `transition-screen` + `transition-next-name` == exercise 2 → after delay, logging zone of exercise 2.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.084] Last set of LAST exercise → navigate post-rpe
- **Check:** Rating the last set of the last exercise navigates to `post-rpe` (no transition/rest).
- **Where:** `Workout.tsx:459-462`.
- **Expected:** Session ends into PostRpe.
- **Verify:** Playwright: drive a 1-exercise/1-set seed to completion → URL == post-rpe.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.085] RestOverlay is non-modal bottom band (header stays clickable)
- **Check:** RestOverlay is pinned to the bottom (`left/right/bottom`, NOT `inset-0`) so the SessionTimer X + ⋯ remain clickable during rest (BUG #7+#8 fix — must stay).
- **Where:** `RestOverlay.tsx:57-63` (`fixed left-3.5 right-3.5 bottom-[78px] z-40`).
- **Expected:** During rest, the header exit + menu buttons receive pointer events; overlay does not cover the full screen.
- **Verify:** Playwright: enter rest → tap `workout-exit-trigger` → exit sheet opens (proves header reachable behind/above the rest band). Assert RestOverlay bounding box does not span full viewport height.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.086] RestOverlay countdown ring + context line + dark surface both themes
- **Check:** RestOverlay renders `SVGCountdownRing` (progress from initial/remaining), a kicker, optional "{name} recupereaza" context line, and stays a dark surface in both light + dark themes (skip button visible).
- **Where:** `RestOverlay.tsx:64-108`; THEME-INVERSION fix comment L22-27.
- **Expected:** Ring fills proportionally; `rest-context-line` shows current exercise name; skip text readable in both themes (WCAG 1.4.11 border .35).
- **Verify:** Playwright: enter rest → assert ring + `rest-context-line` + `rest-skip` visible; toggle dark theme → skip still legible (contrast check).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.087] Transition screen respects reduced motion + announces via role=status
- **Check:** Transition screen has `role=status` + aria-label; staggered animations collapse under reduced motion.
- **Where:** `Workout.tsx:1076-1098`.
- **Expected:** Screen reader announces the next-exercise; under `prefers-reduced-motion` the cascade is instant.
- **Verify:** Playwright with reduced-motion emulation → assert no long animation + `transition-screen` role=status.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.H — LIVE Workout: PrFlash, inactivity, why-modal, wake-lock

### [06.090] PrFlash fires at the existing markPRHit moment (no second detection path)
- **Check:** A mid-session weight PR (`delta.deltaKg > 0`) sets `prFlash` at the SAME `getPRDelta`/`markPRHit` call site — there is no separate PR detection.
- **Where:** `Workout.tsx:408-428`.
- **Expected:** Logging a kg above prior best for the exercise → PrFlash overlay; volume/reps PRs (deltaKg 0) flow only to the PostSummary banner.
- **Verify:** Seed history so the next logged set is a weight PR → assert `pr-flash` overlay + `pr-flash-detail` shows the delta. Code: only one `getPRDelta` call in the file.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.091] PrFlash is transient + never traps focus / never blocks exit (SAFETY)
- **Check:** PrFlash auto-dismisses (~2.6s), a tap closes it early, it tears itself down, and it never traps focus or permanently blocks the session exit/menu.
- **Where:** `PrFlash.tsx:42-49` (timeout + onClose), CRITICAL comment L13-17; `Workout.tsx:1119-1126`.
- **Expected:** Overlay disappears on its own; during it, the X/⋯ are not permanently blocked; no focus trap.
- **Verify:** Playwright: trigger PR → overlay shows → wait 3s → gone without interaction; trigger again + tap → closes immediately.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.092] Wake-lock acquired on mount, released on unmount, re-acquired on visibility
- **Check:** `navigator.wakeLock.request('screen')` is requested on mount (fail-silent), released on unmount, and re-acquired when the tab returns to `visible` after being hidden (OS auto-release).
- **Where:** `Workout.tsx:276-315`.
- **Expected:** Lock held during the session; cleared when leaving; re-acquired on foreground.
- **Verify:** Playwright/instrumentation: spy `navigator.wakeLock.request` → called on mount; emulate visibility hidden→visible → re-requested; navigate away → `release()` called. (Older/non-secure context → no throw.)
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.093] Inactivity watch triggers prompt after 7 min idle
- **Check:** A 30s interval compares idle minutes vs `lastActivityAt`; > 7 min opens `InactivityPrompt`. Activity (input/rating/skip/log) resets via `bumpActivity`.
- **Where:** `Workout.tsx:58-59, 339-347, 378-381`; bump wired into SetLogInput/skip/rating.
- **Expected:** No interaction 7+ min → prompt appears; any logged interaction resets the clock.
- **Verify:** Test harness: advance fake timers > 7 min with no activity → `inactivity-prompt` opens; bumpActivity → closes + resets.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.094] InactivityPrompt — "Continui" resumes, "Salveaza si iesi" pauses
- **Check:** Continue resets activity (closes prompt, stays in session); Save-and-exit calls `pauseSession(workoutTitle)` (real title, not "Push" lie) + navigates to Antrenor.
- **Where:** `Workout.tsx:1128-1136`; `InactivityPrompt.tsx:53-68`.
- **Expected:** Continue → session continues; Save+exit → paused snapshot with the real title + back to Antrenor (resumable).
- **Verify:** Playwright: open prompt → Continue → still in workout; reopen → Save+exit → Antrenor shows a resumable paused session with correct title.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.095] InactivityPrompt strings are HARDCODED Romanian (i18n leak + diacritics)
- **Check:** The prompt title/body/buttons must render via `t()` (keys `inactivity.*` already exist in en.json/ro.json), not Romanian literals.
- **Where:** `InactivityPrompt.tsx:46,50,59,64` render literals "Esti acolo?", "N-am vazut activitate de 7 min. …", "Continui", "Salveaza si iesi"; keys exist at `en.json:1073-1078` (`inactivity.title/body/continueCta/saveExitCta`) but are NOT used.
- **Expected:** `{t('inactivity.title')}` etc.; EN locale renders English ("Still there?"), RO diacritic-free.
- **Verify:** `grep -nE "Esti acolo|N-am vazut|Continui|Salveaza si iesi" src/react/components/Workout/InactivityPrompt.tsx` → returns the 4 literals (currently FAIL). Render under EN → assert Romanian text appears (the leak).
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL ☐ BLOCKED  *(as of 2026-05-29 — same class as the InstallPrompt leak in 09.001)*
- **Evidence:** `InactivityPrompt.tsx:46` `"Esti acolo?"`, `:50` body literal, `:57-60` "Continui", `:61-68` "Salveaza si iesi" — all hardcoded; `import { t }` absent; the existing `inactivity.*` keys are dead.
- **Notes:** Fix: import `t`, swap the 4 literals to `inactivity.title/body/continueCta/saveExitCta`. Root cause = same manual-coverage gap class; harness must auto-scan ALL workout components, not a curated list.

### [06.096] Why-exercise modal: focus mgmt + Escape + restore + trap
- **Check:** The "why this exercise?" trigger opens a bottom-sheet built on tap (reflects live readiness/recommendation); modal auto-focuses dismiss, Escape closes, Tab traps on the single button, focus restores to the invoker.
- **Where:** `Workout.tsx:211-232, 353-374, 716-726, 1151-1182`.
- **Expected:** Tap `wv2-why-trigger` → `why-modal` (role=dialog, aria-modal) with summary text; Escape closes + restores focus.
- **Verify:** Playwright: tap why → modal visible with `why-modal-text`; press Escape → closed, focus back on trigger.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.AA — AaFriction SAFETY (LOCK 9) — the heart of this section

### [06.AA.000] Friction triggers on an aggressive kg jump vs the user's OWN history
- **Check:** `detectAggressiveLoad` returns `{trigger:true, reason:'kg_jump'}` when the new set's kg exceeds the last logged set by more than the kg-jump threshold (default 20%, engine-derived [15%,25%]).
- **Where:** `Workout.tsx:487-509` (`handleLogSet` pre-check), `aaFrictionDetect.ts:112-118`.
- **Expected:** Last set 100kg, new set 130kg (+30%) → AaFrictionModal opens BEFORE the set logs; performLogSet is suspended.
- **Verify:** Playwright (seeded, 1 logged set at 100kg): set kg=130, rate → `aa-friction-modal` opens with `data-reason="kg_jump"`; history NOT yet grown.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AA.001] Friction triggers on fast_sets (< 30s between sets)
- **Check:** Two sets logged within `fastSetsIntervalMs` (default 30s) → `reason:'fast_sets'`, guarded so timestamp 0 (fixtures) does not false-trigger.
- **Where:** `aaFrictionDetect.ts:104-110`.
- **Expected:** Real timestamps < 30s apart → trigger; timestamp ≤ 0 → skip.
- **Verify:** Test: setHistory last.timestamp = now, newSet.timestamp = now+10s → trigger fast_sets; last.timestamp=0 → no trigger.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AA.002] Friction triggers on rep_spike (> 50% reps increase)
- **Check:** `reason:'rep_spike'` when reps increase over last by more than the rep-spike threshold (default 50%, range [40%,60%]).
- **Where:** `aaFrictionDetect.ts:120-126`.
- **Expected:** Last 8 reps, new 14 reps (+75%) → trigger rep_spike.
- **Verify:** Test: last.reps=8, newSet.reps=14 → trigger; new=10 (+25%) → no trigger.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AA.003] Friction NEVER triggers on the first set (no baseline)
- **Check:** Empty set history → `{trigger:false}` (first set per exercise has no baseline).
- **Where:** `aaFrictionDetect.ts:95`.
- **Expected:** First set of any exercise never opens the modal regardless of weight.
- **Verify:** Test: `detectAggressiveLoad([], any)` → trigger false. Playwright: first set at any kg → no modal.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AA.004] Thresholds are engine-derived per vitality/adherence
- **Check:** `deriveThresholds` widens kg jump to ~25% on high vitality+adherence, tightens to ~15% on low signals; rep spike [40%,60%]; fast_sets fixed 30s.
- **Where:** `aaFrictionDetect.ts:40-63`; `Workout.tsx:492-496` (`getEngineSignals` → `deriveThresholds`).
- **Expected:** High signals → laxer trigger; low signals → stricter. Bounded.
- **Verify:** Unit: vitality/adherence=100 → kgJump≈0.25; =0 → ≈0.15; midpoint 50 → 0.20.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

### [06.AA.010] **GAP (Daniel 2026-05-29): logging far above the COACH-RECOMMENDED weight with NO history does NOT trigger any warning**
- **Check:** With NO prior set history for the exercise, logging a weight far above the engine-recommended `targetKg` (e.g. target 10kg, user logs 50kg = 5×) currently produces NO friction — because `detectAggressiveLoad` compares against personal SET HISTORY (`samples = history[safeExIdx]`), and the recommendation/target is never an input to the safety check.
- **Where:** `Workout.tsx:487-507` — `samples = (history[safeExIdx] ?? [])` is the ONLY baseline passed to `detectAggressiveLoad`; `targetKg` (L165-170) is NOT passed. `aaFrictionDetect.ts:95` returns `{trigger:false}` on empty history. So a first set at 5× target sails through silently.
- **Expected (CURRENT, documents the gap):** First set, target 10kg, user logs 50kg, rate → `aa-friction-modal` does NOT open; the 50kg set logs immediately. This is the unsafe behavior Daniel found.
- **Expected (PROPOSED safety gate):** Add a recommendation-based friction branch: when `kgInput >= ~2× targetKg` (configurable, e.g. ≥2×) AND there is no supporting set history at/above that weight, open AaFrictionModal with a new reason (e.g. `over_recommendation`) BEFORE logging. The check must run even when `history[exIdx]` is empty (the precise case the history-based detector skips).
- **Verify (current):** Playwright fresh account, seed a plan whose first exercise targetKg=10 → enter workout → set kg=50, reps target, rate "potrivit" → assert `aa-friction-modal` is ABSENT and `set-history-0` shows 50kg (reproduces the gap).
- **Verify (proposed):** After the fix, the same steps MUST open the modal with `data-reason="over_recommendation"` and NOT log until the user acknowledges/forces; a value < 2× target still logs without friction.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL ☐ BLOCKED  *(as of 2026-05-29 — the exact issue Daniel found; current behavior = no warning)*
- **Evidence:** `Workout.tsx:497-501` passes only `samples` (history) + `newSet` to `detectAggressiveLoad`; `targetKg` is computed at L165-170 but never reaches the detector. `aaFrictionDetect.ts` has no recommendation parameter. Net: 5× target with no history → silent log.
- **Notes:** Fix proposal: thread `targetKg` into `handleLogSet` and add a pre-check `if (history empty-or-no-support && kgInput >= RECOMMENDATION_FRICTION_MULT * targetKg) → open modal (reason over_recommendation)`. Add a new `AggressiveReason` + `perSetSafety.reasons.over_recommendation` i18n key. Pin with a behavior test in the HARNESS so it can never regress. Keep the personal-history detector as a separate, additive path (both can trigger).

### [06.AA.011] Proposed over-recommendation gate does NOT block legitimate progression
- **Check:** A normal progressive overload (e.g. target 100kg, user does 105kg, +5%) must NOT trip the new recommendation gate, and a user WITH supporting history at the heavy weight must not be re-friction'd every set.
- **Where:** proposed branch in `handleLogSet` (multiplier ~2× + "no supporting history" guard).
- **Expected:** ≤ ~2× target, or history already supports the load → no over_recommendation friction.
- **Verify:** Post-fix test matrix: (target 100, log 105) → no friction; (target 10, log 50, but prior sets at 48-50) → no friction; (target 10, log 50, no history) → friction.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

### [06.AA.020] Modal "Continui oricum" = force-continue path logs the pending set
- **Check:** Force-continue (`aa-friction-continue`) closes the modal and runs `performLogSet(aaPendingRating)` (the user's deliberate override).
- **Where:** `Workout.tsx:511-518`; `AaFrictionModal.tsx:118-126`.
- **Expected:** Force-continue logs the pending set normally (no forced rest override).
- **Verify:** Playwright: trigger friction → tap continue → set logs, normal rest follows.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AA.021] Modal "Pauza 30s" = acknowledge path logs + forces a 30s rest
- **Check:** Acknowledge (`aa-friction-pause`) logs the pending set then overrides the rest countdown to 30s (not the normal restSec) for intermediate sets; on last-set scenarios it's a no-op on rest.
- **Where:** `Workout.tsx:520-534`.
- **Expected:** Acknowledge → set logs → 30s forced rest for an intermediate set.
- **Verify:** Playwright: trigger friction on an intermediate set → tap pause → phase rest with countdown ~30s.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AA.022] Modal is blocking — no backdrop dismiss, no Escape (LOCK 9 strict)
- **Check:** The AaFrictionModal cannot be dismissed by backdrop tap or Escape; the user MUST choose Pauza or Continui. Focus trap cycles Pauza↔Continui.
- **Where:** `AaFrictionModal.tsx:43-71` (no Escape handler, no backdrop onClick), 73-78 (backdrop has no dismiss).
- **Expected:** Escape does nothing; clicking the backdrop does nothing; Tab stays trapped between the two buttons; focus restores to invoker on close.
- **Verify:** Playwright: trigger → press Escape → modal still open; click backdrop → still open; only the two CTAs close it.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AA.023] Modal reason label maps correctly + role=dialog aria-modal
- **Check:** The reason line (`aa-friction-reason`, `data-reason`) renders the correct localized explanation per reason (fast_sets/kg_jump/rep_spike); dialog has `role=dialog aria-modal aria-labelledby`.
- **Where:** `AaFrictionModal.tsx:27-31, 79-108`.
- **Expected:** `data-reason` matches the trigger reason; copy via `perSetSafety.reasons.*`; title/body via `perSetSafety.*`.
- **Verify:** Playwright: trigger each reason → assert `data-reason` + the matching localized line.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AA.024] Friction suspends the FSM (no logSet/rest/transition while open)
- **Check:** When friction triggers, `handleLogSet` returns early — it does NOT call logSet, does not enter rest/transition; the set is logged only after a modal choice.
- **Where:** `Workout.tsx:502-508` (early return on trigger).
- **Expected:** While the modal is open, history is unchanged and phase is unchanged.
- **Verify:** Playwright: trigger → assert no new history row + phase unchanged until a CTA is tapped.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.AB — In-session RPE auto-correction (`DP.checkInSessionAdjust`)

### [06.AB.000] Two consecutive hardest sets → engine drops next set's weight
- **Check:** After 2× greu (RPE→10), `DP.checkInSessionAdjust` returns `{adjust:true, dir:'down', newKg, msg}`; the screen pre-fills the next set's kg with `newKg` and surfaces the honest RO message (not a silent change).
- **Where:** `Workout.tsx:430-457` (only when `!isLastSetOfExercise`); `dp.js:341-345`.
- **Expected:** 2× greu → next set kg pre-filled lower + `insession-adjust-notice` (role=status) shows "Greutatea este prea mare · Trecem la {newKg} kg…".
- **Verify:** Seeded account WITH dp history (`dpState.lastW` present): rate two sets greu → assert `insession-adjust-notice` visible + `kg-input` pre-fill == newKg.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AB.001] Two consecutive easy sets at top of rep range → engine bumps weight
- **Check:** 2× usor (RPE ≤ 6.5) with reps ≥ rMax → `{adjust:true, dir:'up', newKg}`; pre-fills the next set higher + message.
- **Where:** `dp.js:346-353`; `Workout.tsx:449-453`.
- **Expected:** 2× usor at top reps → upward adjustment surfaced.
- **Verify:** Seeded dp history: rate two easy sets at max reps → `insession-adjust-notice` "Doua seturi prea usoare · Urcam la {newKg} kg…" + kg pre-fill bumped.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AB.002] No dp history → adjust is a no-op (honest, no fabricated recalibration)
- **Check:** When `dpState.lastW` is absent (new user, no history), `checkInSessionAdjust` returns `{adjust:false}` and the screen shows no notice.
- **Where:** `dp.js:338-339`; `Workout.tsx:454-456`.
- **Expected:** Fresh account → never surfaces an adjust notice (nothing to recalibrate against). (Note: this is also why the AaFriction recommendation gap 06.AA.010 matters — neither safety path catches a no-history overload today.)
- **Verify:** Fresh account: rate two greu sets → assert `insession-adjust-notice` ABSENT.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AB.003] Adjust notice clears on exercise change
- **Check:** The adjust notice is scoped to the exercise it fired on; advancing clears it.
- **Where:** `Workout.tsx:322-326` (reset effect clears `adjustNotice`).
- **Expected:** Notice on exercise 1 → advance to exercise 2 → notice gone.
- **Verify:** Playwright: trigger notice → finish exercise → next exercise has no carried notice.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.AC — Exit / pause / discard / finish-early flows

### [06.AC.000] Exit sheet opens from the header X with 4 options
- **Check:** Header X (`workout-exit-trigger`) opens `ExitConfirmSheet` with Continui / Salveaza / Termina mai devreme / Renunt + a progress line.
- **Where:** `SessionTimer.tsx:129-137`; `Workout.tsx:755, 1100-1105`; `ExitConfirmSheet.tsx:108-141`.
- **Expected:** 4 buttons + "Ai facut {exIdx}/{total}" progress copy.
- **Verify:** Playwright: tap X → `exit-sheet` with exit-continue/exit-pause/exit-finish-early/exit-discard.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AC.001] Exit sheet a11y: focus, Escape→continue, trap, restore
- **Check:** On open, focus goes to "Continua" (safe primary); Escape = continue (safe close); Tab traps continue↔discard; focus restores to invoker on close; backdrop tap = continue.
- **Where:** `ExitConfirmSheet.tsx:54-82, 89`.
- **Expected:** Escape and backdrop both safe-close (non-destructive); trap holds.
- **Verify:** Playwright: open → Escape → sheet closed + still in session; reopen → backdrop tap → closed safe.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AC.002] Pause → pauseSession(real title) + navigate Antrenor (resumable)
- **Check:** "Salveaza" pauses with the REAL workoutTitle (not "Push") and navigates to Antrenor where the session is resumable.
- **Where:** `Workout.tsx:730-740`; `ExitConfirmSheet.tsx:117-124`.
- **Expected:** Paused snapshot carries the actual title; Antrenor shows resume; resume restores phase/history.
- **Verify:** Playwright: log a set → exit → pause → Antrenor resume card with correct title → resume → history intact, sessionStart preserved.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AC.003] Discard → discardSession clears state + navigate Antrenor
- **Check:** "Renunt" calls `discardSession()` (clears phase/exIdx/history/sessionStart/prHit/sessionContext/refusalTriedByEx) + navigates to Antrenor.
- **Where:** `Workout.tsx:749-750`; `workoutStore.ts:515-527`.
- **Expected:** After discard, store has no live session and history is empty; lastSession/sessionsHistory untouched.
- **Verify:** Playwright: log a set → exit → discard → store `sessionStart===null && history==={}`; prior `sessionsHistory` length unchanged.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AC.004] Finish-early → FinishEarlyConfirm drill-down (progress NOT lost)
- **Check:** "Termina mai devreme" navigates to `FinishEarlyConfirm`; confirming routes to `post-rpe` which builds the partial summary from sets logged so far (progress preserved); cancel returns to `workout`.
- **Where:** `Workout.tsx:741-748, 764-767`; `FinishEarlyConfirm.tsx:20-26`.
- **Expected:** Confirm → PostRpe with the partial session; the logged sets are saved (not discarded).
- **Verify:** Playwright: log 3 sets across 1 exercise of a multi-exercise plan → exit → finish-early → confirm → PostRpe → Save → PostSummary shows the 3 sets (not 0).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AC.005] Finish-early cancel returns to the live session intact
- **Check:** Cancel on FinishEarlyConfirm returns to `workout` with the session state intact.
- **Where:** `FinishEarlyConfirm.tsx:24-26, 57-64`.
- **Expected:** Back on workout, same exercise/set, history intact.
- **Verify:** Playwright: enter finish-early-confirm → cancel → back on workout at the same set with prior history.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AC.006] ⋯ menu actions wired (pain / skip / finish-early / cancel), sound row hidden
- **Check:** The SessionTimer ⋯ menu opens a sheet with Pain → pain-button, Skip exercise → advance/finish, Finish early → drill-down, Cancel → discard+Antrenor; the Sound row is intentionally hidden (no audio subsystem).
- **Where:** `SessionTimer.tsx:184-279`; `Workout.tsx:865-868` (handlers), 240-263 sound gated on `onToggleSound` (not passed).
- **Expected:** 4 visible rows (pain/skip/finish/cancel); no sound row.
- **Verify:** Playwright: tap `workout-menu-trigger` → assert workout-menu-pain/skip/finish-early/cancel present, workout-menu-sound ABSENT.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AC.007] ⋯ Skip exercise: advance if not last, finish if last
- **Check:** `handleSkipExercise` advances to the next exercise, or navigates to post-rpe if it's the last (no penalty per copy).
- **Where:** `Workout.tsx:546-553`.
- **Expected:** Skip mid-plan → next exercise; skip last → post-rpe.
- **Verify:** Playwright: ⋯ → skip on exercise 1 of N → exercise 2 logging; on last exercise → post-rpe.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.AD — "ceva nu merge" sub-flows + their effect on the session

### [06.AD.000] CevaNuMerge triage routes to the 5 sub-flows
- **Check:** CevaNuMerge shows pain / equipment-busy / equipment-missing / override / cancel, routing to pain-button / equipment-swap / aparate-lipsa / schedule-override / antrenor; aparate-lipsa is tagged `from:'workout'`.
- **Where:** `CevaNuMerge.tsx:43-50, 55-64`.
- **Expected:** 5 options, correct destinations; aparate-lipsa carries the workout origin tag.
- **Verify:** Playwright: each option → correct route; aparate-lipsa → `location.state.from === 'workout'`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AD.010] PainButton: 15 regions + 3 intensities, Continue gated on region
- **Check:** PainButton renders 15 body regions + 3 intensity levels; the Continue CTA is disabled until a region is picked; "Salveaza si iesi" is always available (anti-force-typing).
- **Where:** `PainButton.tsx:71-87, 201-265`.
- **Expected:** 15 `[data-region]`, 3 `[data-intensity]`; continue disabled with no region.
- **Verify:** Playwright: assert 15 regions + 3 intensities; `pain-continue` disabled until a region tapped.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AD.011] PainButton in-session: adapts remaining sets WITHOUT re-opening preview
- **Check:** When reached mid-session (`inSession` via sessionStart!=null OR `from:'workout'`), Continue sets `sessionContext={intensityMod:'minus', painContext}` and returns to `workout` (no preview round-trip). Workout applies 'minus' to remaining sets.
- **Where:** `PainButton.tsx:143-178` (`inSession` branch); `Workout.tsx:107, 161-170` (painContext → minus).
- **Expected:** Mid-session pain → back to live workout with remaining targets lightened; no session reset.
- **Verify:** Playwright: in workout → ⋯ → pain → pick region → Continue → back on workout, next set targetKg reflects ×0.8, history preserved.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AD.012] PainButton persists to append-only CDL (Recovery Engine reads next session)
- **Check:** Continue calls `persistPainCdl(region, intensity)` writing to `DB('pain-cdl')` newest-first, capped 90, soft-fail.
- **Where:** `PainButton.tsx:112-121, 150`.
- **Expected:** DB('pain-cdl')[0] == the just-reported entry; survives navigation.
- **Verify:** Playwright: report pain → `browser_evaluate` read DB('pain-cdl') → newest entry matches region/intensity.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AD.013] PainButton pre-session: routes to preview with minus + painContext
- **Check:** When NOT in a live session, Continue navigates to `workout-preview` with `{painContext, intensityMod:'minus'}` so the user sees the adapted session before starting.
- **Where:** `PainButton.tsx:175-177`.
- **Expected:** Pre-session pain → preview shows ember banner + lightened prescription.
- **Verify:** Playwright (no live session): pain → Continue → preview `data-intensity` reflects minus.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AD.014] PainButton reassurance toast + medical cue render
- **Check:** Continue fires the reassurance toast (`painButton.reassureToast`) + haptic/edge-flash; the medical cue (`pain-medical-cue`, italic) is always shown.
- **Where:** `PainButton.tsx:156-162, 269-274`.
- **Expected:** Toast on confirm; medical cue present (anti-paternalism: informative not prescriptive).
- **Verify:** Playwright: Continue → toast visible; `pain-medical-cue` present on screen.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AD.020] In-session "Aparat ocupat" → NAMED in-place swap
- **Check:** The log-zone "Aparat ocupat" button (`wv2-ex-action-ocupat`) runs `resolveBusySwap` → replaces `exercises[safeExIdx]` + `swapExercise(safeExIdx)` (drops partial sets, restarts at set 1) + a NAMED success toast.
- **Where:** `Workout.tsx:690-699, 569-631` (`applySwap` busy), 955-983.
- **Expected:** Swap shows the alternative's name in a toast + the exercise name updates in place; if no canonical engineName → fallback navigate to equipment-swap.
- **Verify:** Playwright: in workout → tap ocupat → assert exercise name changed + success toast names the alternative.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AD.021] In-session "Nu vreau" → refusal cycle walks the whole muscle pool
- **Check:** "Nu vreau" (`wv2-ex-action-nuvreau`) consumes a per-exIdx tried-set so each tap surfaces a DIFFERENT same-muscle alternative (no 2-element ping-pong); increments the refusal counter; on exhaustion shows "ai incercat tot pentru {group}".
- **Where:** `Workout.tsx:701-708, 569-631` (`applySwap` refusal: `refusalTriedByEx`, `markRefusalTried`, `resolveRefusalSwap`, `poolExhausted`).
- **Expected:** N consecutive "Nu vreau" → N distinct alternatives, then an exhaustion toast.
- **Verify:** Playwright: tap "Nu vreau" repeatedly → each toast names a NEW alternative; final tap (pool exhausted) → exhaustion toast.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AD.022] Refusal swap drops partial sets + restarts at set 1 (store integrity)
- **Check:** `swapExercise(exIdx)` drops `history[exIdx]` (partial sets of the original) and, for the current exercise, resets setIdx/phase to start fresh; never touches sessionStart/streak/lastSession/other-index history.
- **Where:** `Workout.tsx:616`; `workoutStore.ts:580-602` (swapExercise safety contract §8.5).
- **Expected:** After a current-exercise swap, set counter resets to 1/N for the new movement; other exercises' history untouched.
- **Verify:** Playwright: log 1 set → swap current → set counter back to 1/N; `browser_evaluate` other-index history unchanged.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AD.023] In-session "Aparat lipsa" sheet → persists + recomposes if it blocks current
- **Check:** "Aparat lipsa" (`wv2-ex-action-lipsa`) opens `AparatLipsaSheet`; Save persists `wv2-missing-equipment` (visible in Cont→AparateLipsa next mount) and, if the new list blocks the current exercise's equipment, swaps it in-place via `resolveMissingSwap` (named toast); else quiet success.
- **Where:** `Workout.tsx:640-688, 1142-1146`.
- **Expected:** Marking the current exercise's equipment missing → in-place named swap; marking unrelated equipment → quiet preserve toast.
- **Verify:** Playwright: open lipsa sheet → mark the current lift's equipment → Save → exercise swapped + toast; reopen Cont→AparateLipsa → the item is checked.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AD.024] EquipmentSwap (full screen) shows NAMED alternatives before confirm
- **Check:** Marking a station busy shows inline under it the NAMED alternative for each affected planned exercise; Continue forwards `busyCoarseTypes` to preview (cascade).
- **Where:** `EquipmentSwap.tsx:79-96, 108-114, 168-182`.
- **Expected:** Busy item → `swap-preview-{id}` rows naming the alternative; Continue → preview recomposed.
- **Verify:** Playwright: mark a station that blocks a planned lift busy → assert `swap-preview-row` names the alternative → Continue → preview shows the swap (links to 06.028).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AD.025] AparateLipsa persists durably + origin-aware navigation
- **Check:** AparateLipsa hydrates from `getMissingEquipment()`, toggles persist via `setMissingEquipment()`; Save returns to workout-preview when `from:'workout'`, else to Cont.
- **Where:** `AparateLipsa.tsx:70-96`.
- **Expected:** Checked items survive reload; workout-origin → preview adapts; settings-origin → Cont.
- **Verify:** Playwright: from CevaNuMerge → mark items → Save → preview; reload → items still checked. From Cont → Save → Cont.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AD.026] ScheduleOverride maps kind → intensityMod into preview
- **Check:** Override picks (easier→minus / harder→plus / different-muscle, mobility, cardio→normal) navigate to preview carrying `{overrideKind, intensityMod}`.
- **Where:** `ScheduleOverride.tsx:48-61`.
- **Expected:** easier → preview ember banner; harder → volt; others → aqua.
- **Verify:** Playwright: pick easier → preview `data-intensity="minus"`; harder → "plus".
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AD.027] Sub-flow screens strings i18n + no diacritics
- **Check:** PainButton / EquipmentSwap / AparateLipsa / ScheduleOverride / CevaNuMerge all render via `t()`; RO diacritic-free; `dangerouslySetInnerHTML` in AparateLipsa intro uses only sanctioned `<strong>` markup from the i18n value.
- **Where:** the five sub-flow files; `AparateLipsa.tsx:110-113` (`dangerouslySetInnerHTML`).
- **Expected:** No hardcoded literals; AparateLipsa intro HTML comes from i18n (no user input → no XSS).
- **Verify:** i18n scanner across the five files; confirm `aparatLipsa.intro` value is static i18n (not interpolated user data).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.AE — Post: PostRpe (`PostRpe.tsx`)

### [06.AE.000] PostRpe renders 3 feels with select-then-Save
- **Check:** Three ratings (Usoara/Normala/Grea, `data-rating`) are select-only (aria-pressed); the finalize pipeline fires only via the Save button — guards an accidental tap ending the session.
- **Where:** `PostRpe.tsx:61-65, 84, 221-268, 273-281`.
- **Expected:** Tapping a rating sets pick (no navigation); Save is disabled until a pick.
- **Verify:** Playwright: tap a rating → no nav, `post-rpe-save` enabled; Save → PostSummary.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AE.001] Save persists the in-memory sets (midnight data-loss fix)
- **Check:** Save persists the sets the user actually logged THIS session — it does NOT depend on `getTodayWorkout()` re-deriving the plan (which returns null after a day-rollover → would silently drop a completed session).
- **Where:** `PostRpe.tsx:86-196` (H2 fix comment L97-108); uses `Object.values(history)` for sets, plan only for titles.
- **Expected:** Even if the plan is gone, the logged sets persist under an honest neutral title ("Antrenament") + per-exercise honest fallback names.
- **Verify:** Test: log sets, force `getTodayWorkout` to resolve null at Save → session still persisted to history with the real sets; title is the honest fallback, not a fabricated muscle title.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AE.002] Save with zero sets is rejected (legit empty case)
- **Check:** If `setsDone === 0`, Save shows the no-sets toast + navigates to Antrenor without persisting an empty session.
- **Where:** `PostRpe.tsx:110-117`.
- **Expected:** Empty session → toast + Antrenor, no history entry added.
- **Verify:** Test: reach PostRpe with empty history → Save → toast + Antrenor; sessionsHistory length unchanged.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AE.003] finishSession runs exactly once + increments streak once
- **Check:** Save calls `finishSession(summary)` then `incrementStreak()` exactly once; finishSession clears history/sessionStart/sessionContext/refusalTriedByEx and appends to sessionsHistory (capped). No double-increment (streak is NOT bumped in PostSummary).
- **Where:** `PostRpe.tsx:176-186`; `workoutStore.ts:529-553`; comment "incrementStreak NU in PostSummary".
- **Expected:** Streak increments by 1 per finished session; double-tapping Save (disabled after nav) cannot double-count.
- **Verify:** Test: note streak → Save → streak+1; assert finishSession + incrementStreak each called once; history cleared.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AE.004] PR enrichment + pr-records refresh on Save
- **Check:** Save enriches exercises with `isPR` vs prior `DB('logs')` (`enrichExercisesWithPR`) before persist, and refreshes `pr-records` from full logs (`refreshPRRecordsFromLogs`) so MMI Engine #9 + PR Wall read real PRs.
- **Where:** `PostRpe.tsx:163-164, 193`.
- **Expected:** A PR set this session lands in pr-records; PR Wall / MMI baseline-cap protection populated.
- **Verify:** Test: log a PR set → Save → `DB('pr-records')` updated; PR Wall reflects it.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AE.005] Energy traffic-light persisted on the finished session (no fabricated green)
- **Check:** The session records `energy` from `sessionContext.intensityMod` ONLY when present; entering Antrenor directly (no energy-check) → no fabricated energy.
- **Where:** `PostRpe.tsx:170-174, 184`.
- **Expected:** Energy-check flow → energy stored; direct entry → energy undefined (engines see no-signal baseline).
- **Verify:** Test: with sessionContext → finished session has energy; without → energy absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AE.006] PostRpe meta + strings i18n + no diacritics
- **Check:** kicker/heading/intro/footer/ratings/meta template via `t()`; RO diacritic-free; sets phrase uses locale plural.
- **Where:** `PostRpe.tsx:118-128, 203-291`.
- **Expected:** No hardcoded literals; both locales; "Antrenament"/fallback names localized.
- **Verify:** i18n scanner for the file.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.AF — Post: PostSummary (`PostSummary.tsx`)

### [06.AF.000] PostSummary closure header + coach line
- **Check:** Shows a check badge + "Sesiune terminata" heading (`summary-heading`) + workout title subtitle (`summary-title`) + coach line by rating (`summary-coach-line`).
- **Where:** `PostSummary.tsx:216-244`; `mapRatingToCoachKey` L59-63.
- **Expected:** Heading is closure copy; subtitle is the session title; coach line via `coachPick('endSession', key)`.
- **Verify:** Playwright: finish a session → assert heading + title + coach line.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AF.001] Stats grid: duration / sets / volume / kcal (count-up)
- **Check:** 4 cells show Durata / Seturi / Volum total / Kcal estimate, preferring numeric session fields over parseMeta; values count-up but initialize to the real number (tests stay exact).
- **Where:** `PostSummary.tsx:180-194, 319-324`.
- **Expected:** sets/dur/volume from `lastSession` numeric fields; kcal = round(volume×0.03).
- **Verify:** Playwright: assert `summary-sets`/`summary-duration`/`summary-volume`/`summary-kcal` match the logged session math.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AF.002] PR banner conditional + enrichment chips
- **Check:** `summary-pr-banner` (role=status) renders only when `prHit`; shows exercise+delta, plus type label / deltaPct / 1RM chips when `prData` present; confetti plays once.
- **Where:** `PostSummary.tsx:251-313`.
- **Expected:** PR session → banner with detail + enrichment; non-PR → no banner.
- **Verify:** Playwright: PR session → banner + `summary-pr-detail` + `summary-pr-type-label`; non-PR → banner absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AF.003] Muscle breakdown pills derived honestly (no fabricated counts)
- **Check:** `summary-muscles` renders keyword-derived muscle pills (primary brick dot / secondary ink3 dot) with NO fabricated per-group set counts; renders only when groups derived.
- **Where:** `PostSummary.tsx:99-133, 328-358`.
- **Expected:** Push title → Piept/Umeri/Triceps/Abs pills; unknown title → no section.
- **Verify:** Playwright: Push session → 4 pills with correct `data-muscle` + primary flags.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AF.004] Streak row + Marius persona detail
- **Check:** Streak row (`summary-streak`) shows flame + localized count (plural zi/zile/de); Marius persona shows `summary-marius-detail` (Tonaj/Densitate/1RM) with honest sources only (no fabricated RPE).
- **Where:** `PostSummary.tsx:365-420`.
- **Expected:** Streak reflects the store value; Marius detail gated on persona==='marius'.
- **Verify:** Playwright: assert streak count; with Marius persona → Marius detail present; other persona → absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AF.005] Finish CTA resets store + navigates Antrenor + session persisted to history
- **Check:** "Terminat" calls `reset()` + navigates to Antrenor; the finished session is already in `sessionsHistory` (persisted at PostRpe Save) and visible on the History tab.
- **Where:** `PostSummary.tsx:199-202, 422-430`.
- **Expected:** After Finish, store is clean (no live session) but the session is in history.
- **Verify:** Playwright: Finish → Antrenor; open History tab → the just-finished session appears with correct sets/volume/date.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.AF.006] PostSummary strings i18n + no diacritics
- **Check:** heading/title fallback/coach/stats labels/PR/muscles/Marius/streak/finish via `t()`; RO diacritic-free; the 🔥 emoji is `aria-hidden`.
- **Where:** `PostSummary.tsx` throughout; `postSummary.*` keys.
- **Expected:** No hardcoded literals; both locales.
- **Verify:** i18n scanner for the file.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 06.IV — Never-delete safety invariants (enumerated as steps)

### [06.IV.000] INVARIANT: wake-lock acquire/release/re-acquire must never be removed
- **Check:** The wake-lock lifecycle (mount acquire, unmount release, visibilitychange re-acquire) exists and is fail-silent.
- **Where:** `Workout.tsx:272-315`.
- **Expected:** Present + functioning; screen does not sleep mid-set on supported browsers.
- **Verify:** Code presence + 06.092 behavior; grep `wakeLock` in Workout.tsx → present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.IV.001] INVARIANT: AaFriction per-set safety must never be bypassed
- **Check:** `handleLogSet` always runs `detectAggressiveLoad` before `performLogSet`; the LOCK9 modal is blocking (no Escape/backdrop dismiss).
- **Where:** `Workout.tsx:475-509`; `AaFrictionModal.tsx`.
- **Expected:** No code path logs a set that triggered friction without an explicit modal choice. (Plus the proposed recommendation gate 06.AA.010 once added.)
- **Verify:** Code: only `performLogSet` logs; it is reached only via the modal CTAs or a non-triggering check. Behavior tests 06.AA.* green.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.IV.002] INVARIANT: refusal counter + exhaustion path must never be removed
- **Check:** Each "Nu vreau" increments the refusal counter and consumes the per-exIdx tried-set; the pool-exhaustion branch exists.
- **Where:** `Workout.tsx:587-601`; `workoutStore.ts:595-611` (markRefusalTried).
- **Expected:** Refusal never silently re-offers the same exercise; exhaustion handled.
- **Verify:** 06.AD.021 behavior + code presence.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.IV.003] INVARIANT: medical-disclaimer gate is not bypassed mid-session
- **Check:** The pain medical cue is always shown on PainButton, and the medical-disclaimer gate (onboarding/account) is not skippable from within the workout flow (cross-ref §15 invariants + §05 account).
- **Where:** `PainButton.tsx:269-274` (medical cue always rendered); disclaimer gate owned by §15.
- **Expected:** Mid-session sub-flows surface the safety cue; no in-session action removes the disclaimer requirement.
- **Verify:** Playwright: pain flow → `pain-medical-cue` present; confirm no workout path clears the disclaimer flag (cross-check §15).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.IV.004] INVARIANT: logged session data is never silently lost
- **Check:** Finish-early, midnight rollover, pause/resume, and discard all preserve the user's logged sets EXCEPT explicit discard; PostRpe Save persists in-memory sets independent of plan re-derivation.
- **Where:** `PostRpe.tsx:86-196` (H2 fix); `Workout.tsx:730-751` (pause preserves, discard explicit).
- **Expected:** Only an explicit "Renunt"/discard drops logged work; everything else persists.
- **Verify:** 06.AC.004 + 06.AE.001 behavior green; discard is the only data-dropping path and it's explicit + confirmed.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.IV.005] INVARIANT: in-session weight recalibration is surfaced, never silent
- **Check:** Any auto weight change (`checkInSessionAdjust`) is shown via the honest `insession-adjust-notice` (role=status), never a silent pre-fill swap.
- **Where:** `Workout.tsx:449-453, 993-1010`.
- **Expected:** Pre-fill change is always accompanied by the engine's RO message.
- **Verify:** 06.AB.000/001 behavior — notice visible whenever kg pre-fill changes by adjust.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [06.IV.006] INVARIANT: setsDone/finishSession-once integrity
- **Check:** The progress counter never overshoots total (clamp) and finishSession + incrementStreak fire exactly once per session.
- **Where:** `Workout.tsx:847`; `PostRpe.tsx:176-186`.
- **Expected:** No double-streak, no >100% fill.
- **Verify:** 06.046 + 06.AE.003 behavior green.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## SECTION 06 SCORE (fill at audit time)

```
06 Workout flow      PASS  PART  FAIL  BLOCK   %     GATE   STATUS
                     --    --    --    --      --%   98%    ----
```

**Known open FAILs at authoring (2026-05-29), must be ≤ gate to pass:**
- `06.AA.010` — recommendation-based friction gap (the exact issue Daniel found). CRITICAL — a FAIL here keeps the CRITICAL section under gate until fixed.
- `06.095` — InactivityPrompt hardcoded Romanian (i18n leak + diacritics) — overlaps §09.

Because Section 06 is CRITICAL with a 98% gate AND "zero open FAIL in CRITICAL sections" is required for Beta-ready, `06.AA.010` alone blocks Beta until the recommendation-friction gate ships + its behavior test is green in the HARNESS.
