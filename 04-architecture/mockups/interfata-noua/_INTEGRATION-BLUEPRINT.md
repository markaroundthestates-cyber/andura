# Phase-2 Integration Blueprint — "Andura Pulse" → Real React App

> Produced by the Phase-2 analysis agent (2026-05-29, autonomous Pulse arc). Read-only audit of all 7 mockup files + 5 tab roots + full workout flow + sub-components + stores + engineWrappers + router + i18n. Citations are `file:line`. This is the **integration contract** each per-screen executor must follow. Swap the skin, keep the brain.

## Cardinal rules (frame everything)

1. **The mockup is a layout/interaction spec, NOT an architecture.** Daniel's mock (`app.jsx:74-102`) runs on a local `stage`+`tab`+`workout` state machine that swaps components in place. The real app runs on **React Router** (`router.tsx:136-230`) — every screen is a URL, the workout flow is **5 separate lazy routes**, the brain is **Zustand stores + engine adapters** (`engineWrappers.ts`). Re-skin the real routed components to match his structure; **never** collapse real routes into one component, **never** replace router nav with local `useState` stage.

2. **The "source swap" promise mostly holds.** His mock data shapes (`data.jsx`) were deliberately modeled on real store/engine outputs — his `plannedWorkout` ≈ `PlannedWorkoutOutput` (`engineWrappers.ts:168-181`), his `readiness`/`fatigue`/`nutrition` ≈ the real engine outputs. Integration is mostly a wiring swap. EXCEPT where his new structure asks for data the engine doesn't expose yet (flagged per-screen).

3. **Never delete invisible-but-critical wiring** when matching his cleaner happy-path. Master list at the bottom.

4. **i18n mandatory.** Every visible string goes through `t('…')` (en.json/ro.json, RO no-diacritics per D-LEGACY-064). His mock hardcodes English — every reskinned string must reuse the existing key. Don't hardcode.

5. **Theme tokens.** His mock runs on `--accent`/`--motion`/`--volt`/`--aqua`/`--ember`/`--ink`/`--surface`. The real app's Pulse foundation (Phase 1) defines the token layer + Tailwind mapping + 4 named themes + `prefers-reduced-motion` gating (`useCountUp`, `ConfettiBurst`). Reskin via token NAMES; do not hardcode hex.

---

# GROUP A — ENTRY

## A1. SPLASH — real `Splash.tsx`
- **Mockup** (`screens-entry.jsx:25-52`): auto-advancing splash — `PulseMark` animated logo, "ANDURA" gradient wordmark, tagline, 3-dot loader; `setTimeout(onDone,2600)` + tap-to-skip. No CTAs.
- **Structural change**: real `Splash.tsx:28-127` is a MANUAL landing page with two CTAs (`splash-cta` login `:91`, `splash-secondary` signup `:107`) + trust footer. Daniel removed CTAs → auto-advance into Auth + animated `PulseMark`.
- **Preserve**: `isAuthenticated` routing (`:30,93`); testids `splash`,`splash-cta`,`splash-secondary`,`splash-trust-footer`; i18n `splash.*`; `Ripple`.
- **Approach**: reskin to animated mark + dots; on timer/tap → `navigate(isAuthenticated ? '/app/antrenor' : '/auth')`. Keep tap-to-skip. Build `PulseMark` (port SVG `screens-entry.jsx:8-18`).
- **Risk**: routing tests assert `splash-cta`/`splash-secondary` exist → removing them is a test-contract break (update tests). Keep tap-to-skip so returning users aren't forced to wait 2.6s.

## A2. AUTH — real `Auth.tsx`
- **Mockup** (`screens-entry.jsx:55-114`): login/signup toggle, email field, "Send sign-in link", Google ghost (both modes), mode switch, **"Continue without account"**, magic-link sent state, terms footer.
- **Structural changes / clashes**:
  - His Google shows in BOTH modes; real app **hides Google in signup** intentionally (`Auth.tsx:206` `showGoogle && mode==='login'`). **Keep real rule.**
  - His "Continue without account" (`:85`) — real app has **no anonymous path** (auth-gated). **Drop it** (guest mode = backend scope, flag to Daniel).
  - His signup has **no consent checkbox**; real app **gates signup on Terms/Privacy consent** (`Auth.tsx:60,280-289`). **Keep the consent gate (legal).**
  - His send is simulated; real calls **`sendMagicLink`** (`Auth.tsx:66`).
- **Preserve**: `sendMagicLink`,`buildGoogleSignInUrl` (`auth.js`); webview warning (`auth-webview-warning`); testids `auth`,`auth-back-splash`,`auth-sent`,`auth-back`,`auth-google`,`auth-email-input`,`auth-consent`,`auth-consent-checkbox`,`auth-send`; i18n `auth.*`.
- **Approach**: reskin card/field/divider + `PulseMark` header. Map email→`auth-email-input`, primary→`auth-send`, Google→`auth-google` (login-only), sent card→`auth-sent`. ADD BACK consent checkbox in signup. DROP "continue without account."

## A3. ONBOARDING — real `Onboarding.tsx`
- **Mockup** (`screens-entry.jsx:117-262`): 8 steps `['goal','age','sex','freq','level','kg','cm','summary']`, progress bar + back + N/total; per-step ChoiceList / 2-tile sex / Stepper / BigNumberInput / OnboardSummary; single Continue CTA.
- **Structural change**: **near-identical** — real app is 8 steps too (`Onboarding.tsx:38`), step-per-URL `/onboarding/:step`. Diffs: step ORDER (mock leads `goal`, real leads `age` `:63`) + his summary step. Already uses round-dot progress on both.
- **Preserve**: `useOnboardingStore` `data`/`setField`/`finalize`/`validateOnboardingField`; **per-step validation gate + Gigel-friendly toast** (`:62-87`); `finalize()`+`completed` guard (`:88-105`); **weight-timeline seed** `seedFromProfileIfEmpty` (`:96-101`); testid `onboarding-step-N`; i18n `onboarding.*`.
- **Approach**: reskin step bodies to his controls, wire each to `setField(...)`. Keep validation+finalize+seed (the brain). **Map his English goal IDs** (`auto/strength/muscle/cut/maintain`, `data.jsx:72-78`) → real RO vocab (`slabire/masa/forta/mentenanta/auto`, `engineWrappers.ts:821-836`). Do NOT introduce English IDs into the store; do NOT regress `'longevitate'` (dropped 2026-05-28 → `mentenanta`). Keep `:step` URL + validation array in sync if reordering.

---

# GROUP B — COACH / ANTRENOR

## B1. ANTRENOR (home) — real `Antrenor.tsx`
- **Mockup** (`screens-antrenor.jsx:4-65`): header; **HERO readiness card** = `ReadinessOrb` animated ring + verdict + "PRIMED FOR A PR" pill; **COACH TODAY card** = workout title + coach quote + lagging signal + meta chips + "Start session" + "Want something else?"; **TrainingSchedule** 7-day editable pill row.
- **Structural changes**: real `Antrenor.tsx:140-238` stacks 10 blocks. Daniel:
  - **Promotes readiness to a big animated ORB hero** (real = flat StatsGrid cell + ReadinessVerdict line). His biggest Coach change.
  - **Visually drops** PatternsBanner, AlertsBanner, PRWallRecent, ResumeSessionCard, ReactivateCard, PRNotificationBanner. These are engine outputs / critical UX. **DO NOT delete** — they're conditional (render nothing when empty) so they coexist with his clean happy-path. **ResumeSessionCard especially must survive** (paused-session recovery).
  - TrainingSchedule = real **Calendar7Day** (already wired to `scheduleStore`).
  - His "+15%" chip is hardcoded → use engine `intensityMod`.
- **Preserve**: `getCoachToday()`→`CoachTodayOutput` (`:36-37,107-130`) supplying readiness/fatigue/isRestDay/plannedWorkout/patternsBanner/alerts/prWallRecent; `antrenor-error-banner`; `useWorkoutStore` `getCurrentMode`→`pausedSnap` gates Resume (`:181-187`), `lastSession`+14d gates Reactivate, `streak`,`prHit`; `useCoachStore` `schedContext`/`persona`/`reactivateDismissed`; **`handleStart`→`navigate(gotoPath('energy-check'))`** (`:132-134`); `ReadinessOutput` shape `score`/`key`/`label`/`color`/`canPR`; testids `antrenor-home`,`antrenor-header-date`,`coach-today-override`, Calendar7Day's `calendar-7day`/`calendar-day-N`/`calendar-edit-toggle`/`calendar-save`; i18n `antrenor.*`/`coachToday.*`. NOTE: ObiectivSelector relocated to Progres (his mock correctly omits); bottom "Incepe antrenament" CTA removed (his mock correctly has none).
- **Approach**: build `ReadinessOrb` (port `ui.jsx:117-140`+`Ring` `:89-114`), feed `coach.readiness.score/label/canPR`. Keep a compact 2-stat row for streak+fatigue so signal isn't lost. Reskin `CoachTodayCard` (glow corner exists `:158-182`); "Start session"→`onStart`(energy-check), override→`coach-today-override`→`schedule-override`; replace "+15%" with engine `intensityMod`. Reskin `Calendar7Day`→his pill row (already wired `:38-44`). **Fold dropped banners back in**: Resume+Reactivate at very top, Patterns/Alerts as thin strips, PRWallRecent at bottom.
- **Risk**: `ReadinessOrb` needs `--motion`/`--accent` (from Phase-1 tokens) or adapt to real palette tokens.

---

# GROUP C — WORKOUT FLOW (Daniel's flagged "biggest changes")

> **HEADLINE:** Daniel folded the whole flow into one `WorkoutFlow` with internal `phase` machine `energy→preview→live→postrpe→summary` (`screens-workout.jsx:5-16`). The real app splits this across **5 routed screens** + `workoutStore` FSM. **DO NOT collapse the routes.** Port his per-phase LAYOUTS onto the corresponding real screens; port his live-workout INTERACTION MODEL onto `Workout.tsx`. His `LiveWorkout` (`:118-388`) is the spec for `Workout.tsx`.

## C1. ENERGY CHECK — real `EnergyCheck.tsx`
- **Mockup** (`:32-61`): "How do you feel?" + 5 energy rows (excellent/good/normal/low/tired), glowing dot + label + hint + chevron.
- **Structural change**: **parity** — real is already 5 options (`ENERGY_OPTIONS:67-73`) with colored dot+label+hint. Only diff: his dots glow (cosmetic).
- **Preserve**: **`saveReadiness(option.readiness)`** (`:83` — persists 1-5 to engine, real bug-fix); routing branch `minus→energy-cause` else `→workout-preview` with `location.state={energyLevel,intensityMod}` (`:84-89`); testids `energy-check`,`energy-check-back`,`data-energy-level`,`data-intensity`; i18n `energyCheck.*`.
- **Approach**: reskin rows to glowing-dot. Map his 5 levels→real `ENERGY_OPTIONS` (keep `readiness:1-5`+`intensity`). Keep `saveReadiness` + **keep the `energy-cause` branch** (his mock skips it — real app needs it for "minus" energy).

## C2. WORKOUT PREVIEW — real `WorkoutPreview.tsx`
- **Mockup** (`:64-114`): "TODAY'S SESSION" + title + meta row + intensity banner (colored by energy) + warm-up + numbered exercise list (num badge + name + sets/reps/kg + muscle pill) + reassurance note + "Confirm, let's go".
- **Structural change**: **strong parity** — real already has all of this (`:216-422`). His rows show a muscle Pill vs real `ExerciseMedia` thumbnail (`:359-371`) — recommend KEEP media (Daniel "#11" feature).
- **Preserve**: `getTodayWorkout()`→`PlannedWorkoutOutput` (`:139-155`); loading/error + `preview-error-banner`; `aria-busy`; **`setSessionContext({intensityMod,painContext})` before navigate to workout** (`:202-206` — THE bridge carrying energy/pain into live session); engine `intensityMod` shapes duration/volume; `recomposeWithBusyTypes` equipment swaps + `swapReason`; fallback list when engine empty; testids `workout-preview`,`preview-hero`,`preview-duration`,`preview-exercise-count`,`preview-volume`,`preview-warmup-row`,`preview-exercise-list`,`preview-exercise-row`,`preview-coach-line`,`preview-closing-note`,`preview-start-cta`; i18n `workout.preview.*`.
- **Approach**: reskin to his card/list. Map banner→`preview-intensity-banner`, hero→chips, warm-up→`preview-warmup-row`, rows→`preview-exercise-row` (keep ExerciseMedia), CTA→`preview-start-cta` (→`setSessionContext`+navigate). **Don't lose `setSessionContext`** — it's the whole energy→pain→live data path.

## C3. LIVE WORKOUT — real `Workout.tsx` — **THE BIG ONE**
- **Mockup** (`:118-388`): header X-exit + progress track + live volume count-up; "EXERCISE n OF m" + "Why? 💡"; name + muscle pill + swapped pill; `ExerciseMedia`; collapsible **form cue**; **set chips** row; live **coach adjustment line**; **two-mode logger** — `feel` mode (Easy/Right/Hard big buttons + beat-plan pill) vs `NumDial` logger (± steppers Weight+Reps + Confirm set); action chips **Pain/Busy/Skip**; overlays RestOverlay (full-screen ring), PrFlash, exit Sheet, why Sheet, busy-swap Sheet, pain Sheet.
- **Structural changes vs real (map carefully — several COLLIDE with deliberate decisions)**:
  - **(a) Logging 2-step**: his NumDial±→Confirm→separate feel-mode. Real = tinta-confirm: `SetLogInput` prefills editable engine target→"Confirma setul"→inline `SetRatingButtons` (`Workout.tsx:974-998`). **Both are "confirm then rate."** Keep real FSM+testids; reskin `SetLogInput` to ADD ± dial **alongside** type-input (don't lose free-type — Maria 65 types; keep leading-0 fix `SetLogInput.tsx:80,85-87` + a11y bounds). Reskin `SetRatingButtons`→his big "feel" card (keep `data-rating` `usor/potrivit/greu`).
  - **(b) Live coach adjustment**: his hand-rolled ±kg on 2× hard/easy (`:153-169`). Real does it via **`DP.checkInSessionAdjust`**→`adjustNotice` `role=status` (`:402-429`, testid `insession-adjust-notice`). **Keep engine path**; render his coach-line styling fed from `adjustNotice`.
  - **(c) PR celebration — promote it**: his full-screen `PrFlash` mid-session (`:438-457`). Real detects PR via `getPRDelta`+`markPRHit` (`:376-400`) but celebrates only on PostSummary. Implementable: add `PrFlash` overlay driven by the existing `getPRDelta` result at `performLogSet`. **Keep PostSummary banner too.**
  - **(d) Rest overlay — DELIBERATE real decision**: his full-screen `RestOverlay` (`:406-435` `inset:0`). Real is a **non-modal bottom card** ON PURPOSE — `RestOverlay.tsx:14-20` "BUG #7+#8 … card NON-modal pinned bottom (NU full-screen inset-0) … so X + ⋯ stay clickable during rest." Full-screen **re-breaks** exit-during-rest. **Keep his ring visual but honor the constraint** (bottom card, OR full-screen with exit/skip reachable). Biggest behavioral trap.
  - **(e) In-session actions**: his Pain/Busy/Skip. Real = 3-button substitution row "Aparat ocupat/Aparat lipsa/Nu vreau" (`:906-934`, testids `wv2-ex-action-{ocupat,lipsa,nuvreau}`) + Pain/Skip/Finish-early in SessionTimer ⋯ menu. Substitution is a **moat feature**: `resolveBusySwap`/`resolveMissingSwap`/`resolveRefusalSwap` + **refusal exhaustion** (`refusalTriedByEx`,`markRefusalTried` `:541-603`) + `AparatLipsaSheet`. Map his Busy→`handleOcupat`, Pain→`handleGoPain`, Skip→`handleSkipExercise`. **Don't lose "Aparat lipsa" + refusal exhaustion.**
  - **(f) Why? + form cue**: his "Why?"→Sheet + collapsible cue. Real `wv2-why-trigger`→`getWhyExerciseSummary` engine explainer in focus-trapped modal (`:688-698,1079-1110`). Keep engine `whyText`. His cue has **no engine source** (see risk).
  - **(g) Progress + volume**: keep the carefully-fixed `setsDone` formula (`:790-819` — Daniel's "counter stuck at 1/17" fix). Live volume count-up is new (derivable from `history` sum kg×reps).
  - **(h) Transition**: parity, reskin.
- **Preserve (the brain)**: `useWorkoutStore` FSM (`:83-103`) phase/exIdx/history/sessionStart/logSet/setPhase/advanceExercise/pauseSession/discardSession/markPRHit/swapExercise/markRefusalTried/sessionContext; `performLogSet` transitions (`:373-445`); `getTodayWorkout()` 3-state; `getPRDelta`+`markPRHit`; `DP.checkInSessionAdjust`→`adjustNotice`; **Anti-aggressive load LOCK 9** `detectAggressiveLoad`+`deriveThresholds`+`getEngineSignals`→`AaFrictionModal` (`:447-506,1049-1054`); substitution moat + refusal exhaustion; **inactivity watch** (`:329-337,1056-1064`); **wake lock** (`:266-305`); sub-components `SessionTimer`/`SetLogInput`/`SetRatingButtons`/`RestOverlay`/`ExitConfirmSheet`/`AparatLipsaSheet`/`InactivityPrompt`/`ExerciseMedia`/`AaFrictionModal`; finish routing last-set→`navigate(gotoPath('post-rpe'))`; testids `workout`,`log-zone`,`wv2-exname`,`wv2-why-trigger`,`wv2-ex-actions`,`wv2-ex-action-{ocupat,lipsa,nuvreau}`,`set-history`,`set-history-N`,`rest-overlay`,`rest-skip`,`transition-screen`,`why-modal`,`insession-adjust-notice` + SessionTimer's `workout-title/progress/elapsed/exit-trigger/menu-*` + SetLogInput's `kg-input/reps-input/setlog-tinta-*/setlog-postlog-*`; i18n `workout.*`.
- **Risks**: NO `cue` field in engine (his cue+why are mock; real `PlannedExercise` `engineWrappers.ts:144-166` has `sub` not `cue`) — use `sub` or flag V2 content. Rest full-screen re-breaks exit (BUG #7+#8). Don't hand-roll kg math. Don't lose AaFriction/refusal/AparatLipsa/wake-lock/inactivity. His PR `ex.id==='bench'` is mock; real `getPRDelta` general.

## C4. POST-RPE — real `PostRpe.tsx`
- **Mockup** (`:460-492`): "ONE QUESTION" + "How was the session?" + 3 selectable rows Easy/Right/Hard (radio + check) + "Save" (disabled until pick).
- **Structural change**: parity, minor — his **select-then-Save** two-tap vs real **one-tap-submits** (each button calls `handleSubmit` directly `:212`).
- **Preserve**: **`handleSubmit` = session-finalize pipeline** (`:79-189`): setLastRating→compute sets/volume/duration from history→getTodayWorkout title (honest fallback)→build `SessionExerciseBreakdown` with `enrichExercisesWithPR`→persist energy traffic-light from sessionContext→**`finishSession(summary)`**→**`incrementStreak()`**→**`refreshPRRecordsFromLogs()`**→navigate post-summary; empty-session guard; testids `post-rpe`,`post-rpe-intro`,`data-rating`,`post-rpe-footer`; i18n `postRpe.*`.
- **Approach**: reskin rows to radio-style + add Save; hold `pick` in state, call `handleSubmit(pick)` on Save. **Keep entire pipeline.** Map Easy/Right/Hard→`usoara/normala/grea`, keep `data-rating`. Don't move `incrementStreak`/`finishSession`/`refreshPRRecordsFromLogs` (must fire exactly once here — comment warns against double-increment).
- **Risk**: tests assert single-tap-submit on `data-rating` → Save gate changes flow (update tests).

## C5. SUMMARY — real `PostSummary.tsx`
- **Mockup** (`:495-561`): confetti (if PR) + check badge + "SESSION COMPLETE" + "Good session."; PR banner; 3-stat grid Duration/Sets/Volume (count-up); **muscle-group bars** (label+bar+sets); streak card; "Done".
- **Structural change**: strong parity. Real (`:205-412`) = heading + coach line + PR banner w/ confetti+enrichment + **4-stat grid (incl Kcal)** + **muscle pills** + persona-gated Marius detail + streak inline row + Done. Diffs: his bars vs real pills; his 3 stats (no Kcal) vs real 4 — **keep Kcal**; his streak card vs real inline row; his mock omits **Marius persona detail** — **keep it**.
- **Preserve**: `useWorkoutStore` lastSession/lastRating/streak/prHit/prData/**`reset()`**; `useCoachStore.persona`; `useCountUp`; `coachPick('endSession')`; `deriveMuscleGroups` from title (`:98-132` — Phase-3 keyword derivation; engine `muscleGroups` is Phase-5 TODO); `ConfettiBurst`,`Ripple`; `handleFinish`→`reset()`+navigate antrenor; testids `post-summary`,`summary-heading/title/coach-line`,`summary-pr-banner/detail/enrichment`,`summary-stats-grid`,`summary-duration/sets/volume/kcal`,`summary-muscles`,`summary-marius-detail`,`summary-streak`,`summary-finish`; i18n `postSummary.*`.
- **Approach**: reskin layout; keep **4-stat** grid (don't drop Kcal); his muscle **bars**→reskin pills (same `deriveMuscleGroups` source); keep `reset()` on Done + Marius block + ConfettiBurst.
- **Risk**: his per-group `sets` counts have **no real source** (`deriveMuscleGroups` yields labels+primary flag only; engine breakdown is Phase-5 TODO) → keep pills (no count) or flag. His "13-day"/"+5kg bench" are hardcoded; real from `streak`/`prData`.

---

# GROUP D — PROGRESS — real `Progres.tsx`
- **Mockup** (`screens-tabs.jsx:5-162`): header; **TODAY** kcal HERO (kcalTarget count-up + PHASE pill + protein + TDEE) + 2 mini-stats Fatigue+BMR + BodyFat strip; **TREND** weight Sparkline 8-week + delta + projection; **ACTIONS** log-weight + last-weigh-in + trend + body-measurements; **MUSCLE RECOVERY** Big-11 ring grid; **GOAL** GoalPicker + target/ETA.
- **Structural change**: **Daniel already restructured the REAL Progres into nearly this shape** (`Progres.tsx:25-38` documents 5 zones AZI/TENDINTA/ACTIUNI/OBIECTIV/LOG MANUAL — this was the `fce2cc35` reorder). Diffs: his TREND uses Sparkline vs real `HeatMapWeekly`+`ProjectionStrip`; his **MUSCLE RECOVERY ring grid is NET-NEW** (real Progres has no recovery grid; data exists `getRecoveryByGroup`/`GROUP_LABELS_RO_BIG11` `engineWrappers.ts:37-40`); real has extra **LOG MANUAL** (NutritionInline) + **AlertsBanner** his mock omits — keep them.
- **Preserve**: `useProgresStore` weightLog/bodyData/targetObiectiv; `getCoachToday()`→alerts; strip components own their engine wires (TDEEStrip→`getNutritionTargetsToday`, FatigueStrip→`getFatigue`, BMRStrip, BodyFatStrip→`estimateBfFraction`, ProjectionStrip→`readTdeeEstimateKcal`, HeatMapWeekly, ObiectivGoalCard/ObiectivCard); testids `progres-home`,`progres-zone-{azi,tendinta,actiuni,obiectiv,log}`,`fatigue-bmr-grid`,`cta-log-weight`,`last-weight-card`,`cta-weight-timeline`,`cta-body-data`,`last-body-card`,`alerte-azi-label`; **document-order: alerts-banner BEFORE cta-log-weight** (`:135`); nav `log-weight`/`weight-timeline`/`body-data`; i18n `progres.*`.
- **Approach**: reskin existing 5-zone Progres to his cards. kcal HERO→reskin `TDEEStrip` (already a hero post-`fce2cc35`); Fatigue/BMR→`fatigue-bmr-grid`; Sparkline→augment/replace HeatMapWeekly (port `ui.jsx:143-176`, feed weightLog); **add recovery grid zone** fed by `getRecoveryByGroup`; GoalPicker→reskin `ObiectivGoalCard`. **Keep AlertsBanner + LOG MANUAL + all CTAs + testids + document-order.**
- **Risk**: recovery grid is the net-new feature — verify wrapper returns `{name,pct}` Big-11 shape. His goal pills English→map to RO vocab (see A3). HERO/projection mock values hardcoded; real from engine.

---

# GROUP E — HISTORY — real `Istoric.tsx` (+ `IstoricDetail.tsx`) — Daniel's other flagged big-change area
- **Mockup** (`screens-tabs.jsx:165-313`): header + 3 stats (streak/sessions/records); **month calendar** w/ nav + colored day marks by session-state (hard/normal/easy/recovery/rest) + legend; **"HOW YOUR SESSIONS FELT"** 90-day card (Easy/Right/Hard counts + bars); **SESSIONS** list (title + PR trophy + date + duration/sets/volume).
- **Structural change**: **real Istoric is ALREADY richer** and has the same sections (`:51-195`): 3-stat grid, CalendarHeatmap, RatingsStrip90Day, PR Wall list w/ "see all", VirtualSessionList. **KEY DIFF**: his session cards have **NO drill-down** (`:258`); real list **navigates to `IstoricDetail`** (`:191`→`/app/istoric/${idx}`) — a whole screen w/ per-exercise breakdown (`IstoricDetail.tsx:160-209`). **DO NOT lose drill-down.** His mock also has no PR Wall (real does, keep it) + plain `.map` vs real **window-virtualized** list (keep virtualization).
- **Preserve**: `useWorkoutStore.sessionsHistory`+`streak`, reverse-chrono sort; **`getStreakStats()`**→currentStreak/totalSessions/prCount; **`getPRHistoryAll()`**→PR wall; `formatDate` i18n; CalendarHeatmap/RatingsStrip90Day/VirtualSessionList; **drill-down `onSelect(idx)→/app/istoric/${idx}`**→IstoricDetail reads `sessionsHistory[idx]`; testids `istoric-home`,`istoric-stats-grid`,`stats-streak/total/pr`,`istoric-pr-wall`,`istoric-pr-wall-see-all`,`pr-row-N`,`istoric-empty` + IstoricDetail's `istoric-detail`,`istoric-detail-stats-grid`,`detail-ex-*`,`detail-set-*`; i18n `istoric.*`.
- **Approach**: reskin to his layout; 3-stat→`istoric-stats-grid`; month calendar→reskin CalendarHeatmap (keep month-nav, add his state-color legend if heatmap can emit per-day state); "sessions felt"→reskin RatingsStrip90Day; session cards→reskin VirtualSessionList rows but **keep `onSelect` drill-down + virtualization**. Keep PR Wall + IstoricDetail.
- **Risk**: his cards look tappable but don't drill down — **preserve the navigate** (detail view is a major feature). His calendar state colors need per-day session-state source — verify CalendarHeatmap exposes it (his `:175` is mock `cycle`). Counts hardcoded; real from `getStreakStats`/`RatingsStrip90Day`.

---

# GROUP F — ACCOUNT — real `Cont.tsx`
- **Mockup** (`screens-tabs.jsx:316-404`): header; profile card (avatar initial + name + email + streak pill); **APPEARANCE card** = accent swatches (4) + Dark/Light toggle, LIVE; grouped row lists ACCOUNT/GENERAL/DATA&PRIVACY/HELP; **LOGOUT & DELETE** danger button; version+tagline footer.
- **Structural change**: strong parity + one addition. Real (`:104-205`) = profile card + 5 sections (cont/general/privacy/danger/help) + version+tagline. Daniel:
  - **Pulls Appearance UP into an inline LIVE card** (accent+dark/light); real has Appearance as a **row→`settings-appearance`/`settings-themes`** (`:71`). His inline switcher must wire to the real `settingsStore`/`SettingsThemes.tsx`, **not** ephemeral state (his `app.jsx:82-84,116-120` tweak model is a mockup-only harness).
  - His profile shows a **streak pill** (minor add).
  - His "Logout & delete" single button collapses two destructive flows the real app **separates behind confirm screens** (`logout-confirm`/`delete-account-confirm` `router.tsx:216-217`) — **keep the gating (legal/safety).**
- **Preserve**: `getUserProfileDisplay()`→initial/name/email from JWT; `gotoPath` row nav via `target` + all section/row targets (`:57-102`); theme→`settingsStore`+SettingsThemes/SettingsAppearance; testids `cont-home`,`cont-account-card`,`cont-account-initial/name/email`,`cont-section-{id}`,`cont-row-{id}`,`cont-version`,`cont-version-tagline`; i18n `cont.*`.
- **Approach**: reskin cards/rows; profile→`cont-account-card` + streak pill (from `useWorkoutStore.streak`); grouped rows→existing `SECTIONS` map (keep `target` nav + testids); build inline APPEARANCE card wired to real theme store; "Logout & delete"→route to real confirm drill-downs.
- **Risk**: live theme switcher must hook real theme store. Real palette has named themes (Clasic/mov/Luxury/Living Body) richer than his 4 accents — reconcile (treat his as accent-only OR map to theme set). Keep confirm-screen gating.

---

# CROSS-CUTTING NOTES

1. **His shared primitives** (`ui.jsx`): `Icon` (custom SVG) → real uses **lucide-react**; `Ring`/`ReadinessOrb`/`Sparkline`/`Confetti`/`Sheet`/`BottomNav`/`Kicker`/`Pill`/`CountUp`. Real equivalents: `ConfettiBurst`, `Ripple`, `useCountUp`, real `BottomNav`, `SVGCountdownRing`. Build `ReadinessOrb`/`Sparkline`/`Ring`/`PulseMark` as new; reuse real `useCountUp`/`ConfettiBurst`/lucide.
2. **BottomNav**: his tabs Coach/Progress/History/Account match real 4 tabs (`tabs.*`). Real nav is router-driven; his is local `onChange`. **Keep router-driven.**
3. **Source-swap exceptions** (his structure outruns the engine — data-availability checks, not pure reskins): per-exercise **`cue`** (workout); per-muscle **`sets` counts** (summary bars); **muscle-recovery grid** on Progres (engine has data, tab doesn't surface yet); calendar **per-day state colors** (history).

## NEVER DELETE (invisible-but-critical wiring — mostly Daniel's own prior smoke fixes)
AaFriction (LOCK 9) · refusal exhaustion · AparatLipsa · wake lock · inactivity watch · ResumeSessionCard · consent gate · drill-down navigation · confirm-screen gating · the `setsDone` formula · `setSessionContext` · `saveReadiness` · `finishSession`/`incrementStreak`/`refreshPRRecordsFromLogs`.
