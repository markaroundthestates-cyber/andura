# ARIA live regions deeper audit chat 5 — 2026-05-23

Read-only deeper sweep peste W4-AUDIT-DEEPER chat 5 a11y DIM 2 ARIA GREEN baseline.
Scope: identify dynamic UI surface uncovered de aria-live announcement actual.

## Baseline cantitativa

- Surse `aria-live` directe in `src/`: 12 fisiere (10 productie + 2 teste). Total 12 ocurente productie:
  - `react/components/Toast.tsx:69` (dynamic role/live per variant)
  - `react/components/OfflineBanner.tsx:29, 44` (dual instance)
  - `react/components/CaptivePortalBanner.tsx:23`
  - `react/components/Antrenor/ReadinessVerdict.tsx:20`
  - `react/components/Antrenor/PRNotificationBanner.tsx:20`
  - `react/components/Antrenor/PatternsBanner.tsx:24`
  - `react/components/Antrenor/AlertsBanner.tsx:24` (dynamic urgent → assertive)
  - `react/components/Istoric/CalendarHeatmap.tsx:190`
  - `react/routes/router.tsx:102` (LazyRoute Suspense fallback)
- `role="status"` uncovered de aria-live explicit: 14 ocurente (implicit polite per ARIA spec, dar `aria-live` lipseste)
- `role="alert"` uncovered de aria-live explicit: 7 ocurente (implicit assertive per ARIA spec)
- `aria-atomic="true"` doar 2 instante (Toast + CalendarHeatmap month-announce)

## Covered (aria-live explicit prezent)

- Toast viewport — dynamic polite/assertive per variant (info/success/warning vs error/critical) + aria-atomic
- OfflineBanner — polite, dual placement
- CaptivePortalBanner — polite, role="status"
- ReadinessVerdict — polite, F4 readiness label change
- PRNotificationBanner — polite, F11 PR detected toast
- PatternsBanner — polite, STAGNATION/LOW_ADHERENCE coach signals
- AlertsBanner — dynamic, urgent → assertive (3-tier severity)
- CalendarHeatmap — month-announce sr-only, polite, aria-atomic on month change
- LazyRoute Suspense fallback — polite spinner "Se incarca"

## Implicit-only coverage (role=status/alert FARA aria-live explicit)

Per ARIA spec `role="status"` implica `aria-live="polite"` si `role="alert"` implica `aria-live="assertive"`, deci screen readers Inca anunta. Totusi explicit attribute = best practice cross-browser (Safari iOS gap istoric).

- UpdatePrompt.tsx:58 — role="status" PWA new version
- ResumeSessionCard.tsx:32 — role="region" (NU live, semantic landmark — OK)
- ReactivateCard.tsx:28 — role="region" win-back inactive (NU live — OK semantic landmark)
- CoachTodayCard.tsx:81 — role="region" coach recommended today (NU live, semantic — OK)
- CoachRestCard.tsx:60 — role="region" rest day mode (NU live, semantic — OK)
- WorkoutPreview.tsx:149, 158, 189 — role="status"/"region" intensity banner + hero + warmup (intensity banner = MED candidate aria-live)
- Workout.tsx:485 — role="status" transition screen "Urmatorul: {name}"
- PostSummary.tsx:198 — role="status" PR banner (post-session)
- Onboarding.tsx:160, 327 — role="alert" form validation errors
- Auth.tsx:106 — role="status" WebView platform banner; :214 role="alert" error
- BodyData.tsx:142 — role="alert" input error
- LogWeight.tsx:103, 134 — role="alert" input errors
- SetLogInput.tsx:163, 192 — role="alert" kg/reps input errors
- SettingsExport.tsx:161, 170 — role="status"/role="alert" export feedback
- SettingsProfile.tsx:205 — role="status" "Profil salvat"
- SettingsNotifications.tsx:169 — role="status" permission warning
- SettingsDanger.tsx:32 — role="status" cream warning banner

## Uncovered candidates (potential gaps)

### HIGH severity (workflow-critical state changes invizibile la screen reader)

**HIGH-1 — Workout phase transitions invizibile**
`Workout.tsx` state machine 5 fase (idle/logging/rating/rest/transition) cu UI swap mare per fase. Screen reader user NU primeste anunt cand:
- Set logat → phase devine 'rest' (RestOverlay apare cu dialog modal — captured prin role="dialog" focus, dar transition `logging → rest` NU anuntata explicit)
- Set logat ultima ex → phase 'transition' (Workout.tsx:485 are role="status" implicit polite — OK partial, dar fara aria-live explicit)
- Rest countdown reaches 0 → phase reverse la 'logging' (NU anuntat — user trebuie sa observe vizual ring color change)
- Modal RestOverlay are role="dialog" + aria-label "Pauza activa" — dialog focus auto-anunta, OK
- SVGCountdownRing role="timer" aria-label dynamic mm:ss — TIMER role implica live polite, OK partial
Effort fix: ~30-60 min — add hidden `<div aria-live="polite" className="sr-only">` la Workout.tsx care anunta phase change (e.g., "Pauza activa", "Continui setul", "Urmatorul exercitiu: {name}")

**HIGH-2 — Set log submission feedback invizibil**
SetLogInput submit → workoutStore.logSet via handleLogSet (Workout.tsx:276). UI shows set in history strip (Set N: kg x reps) DAR submit confirmation NU anuntat la screen reader. Visual feedback = set apare in history list, dar SR user NU stie ca submit a reusit pana navigheaza prin DOM.
Effort fix: ~20-30 min — add sr-only aria-live polite annouce post-logSet "Set {N} logat: {kg}kg x {reps}"

**HIGH-3 — Calorii/proteine update NutritionInline invizibil**
NutritionInline.tsx saveKcal/saveProtein → setDailyKcal/setDailyProtein la nutritionStore. Display value (`nutri-kcal-val`/`nutri-protein-val`) updateaza fara aria-live wrapper. Sub-label "Logat manual" vs "Auto din engine" updateaza simultan dar fara anunt.
Effort fix: ~15-20 min — wrap save acknowledgement intr-un aria-live polite hidden region "Kcal salvat: {n}"

### MED severity (nice-to-have feedback for accessibility user)

**MED-1 — InstallPrompt aparitie**
`InstallPrompt.tsx:64` are role="region" dar fara aria-live. Banner apare dynamic la `beforeinstallprompt` event. Maria 65 user invizibil schimba contextul (subtle, NU critical).
Effort fix: ~5 min — adauga aria-live="polite" pe div root.

**MED-2 — InactivityPrompt aparitie**
`InactivityPrompt.tsx:36` are role="dialog" — dialog auto-foca, dar `aria-live` lipseste; pentru user care nu primeste focus immediate (race condition), dialog prompt invizibil.
Effort fix: ~10 min — adauga aria-live="polite" + aria-modal="true" pentru forma completa modal.

**MED-3 — WorkoutPreview intensity banner change**
`WorkoutPreview.tsx:149` role="status" preview-intensity-banner. Cand intensity mod schimba (energy → cause → preview flow), banner content schimba dar fara aria-live explicit. Gigel user energy check flow → preview, banner update important.
Effort fix: ~5 min — adauga aria-live="polite".

**MED-4 — Calendar7Day save acknowledgement**
`Calendar7Day.tsx` saveWeekly() silent (no toast confirmation). User toggleaza zi training/rest + Salveaza, NU primeste anunt. Visual feedback = edit mode exits (NU pencil/check icon swap, doar disabled). Vizibil polite candidate.
Effort fix: ~15-20 min — adauga toast.success("Program salvat") post saveWeekly + ar trigger aria-live via Toast viewport already covered.

**MED-5 — UpdatePrompt new version aparitie**
`UpdatePrompt.tsx:58` role="status" — implicit polite, OK partial dar aria-live explicit absent. PWA update critical pre-Beta dar non-urgent (poate astepta).
Effort fix: ~5 min — adauga aria-live="polite".

### LOW severity (cosmetic polish)

**LOW-1 — StatsGrid valori update**
`StatsGrid.tsx:21` role="region" landmark, NU live. Streak/Fatigue/Readiness update doar la mount, NU dynamic dupa logging. Probabil NU merita aria-live (NU dynamic in-session).
Effort: skip.

**LOW-2 — SessionPill text change**
`SessionPill.tsx:120` button cu aria-label "Reia sesiunea curenta" + label dynamic "{exercise} · {N} min". Update 1Hz invizibil la SR — DAR button aria-label static "Reia sesiunea curenta" suficient. NU vrei spam SR la fiecare secunda.
Effort: skip (would be aria-spam).

**LOW-3 — Toast dismiss acknowledgement**
Toast.tsx dismiss button anunta close — currently OK prin toast removal de la DOM. Aria-live ulterior toast dismiss = redundant.
Effort: skip.

**LOW-4 — PostRpe rating selection acknowledgement**
PostRpe.tsx submit auto-navigates la post-summary. Selection NU acknowledge vizual decat navigation. Pe screen reader, navigation transition = page change announce (router-handled).
Effort: skip (router transition + page heading h1 already announces).

**LOW-5 — BottomNav active tab announce**
NU verificat direct dar standard React Router approach (NavLink aria-current="page") suficient. Verify in Bottomnav doar daca aria-current lipseste.
Effort: skip (out of scope).

## Top 3 priority recommendations

1. **HIGH-1 Workout phase transitions sr-only announcer** (~30-60 min)
   - Adauga `<div aria-live="polite" aria-atomic="true" className="sr-only" data-testid="workout-phase-announce">` la `Workout.tsx` care reactioneaza la `phase` change. Conent dynamic: "Pauza activa - {restCountdown} secunde", "Setul logat", "Urmatorul exercitiu: {nextExercise.name}".
   - Impact: workflow-critical SR coverage gap fixed. Maria 65 / Gigel user cu screen reader (cazuri rare dar D-LEGACY accessibility pre-Beta gate).

2. **HIGH-2 SetLogInput submit acknowledgement** (~20-30 min)
   - Adauga `<div aria-live="polite" className="sr-only">` care anunta post-logSet `"Set logat: {kg}kg x {reps} repetari, {rating}"`. Pozitionat in Workout.tsx (parent state owner).
   - Impact: critical workflow feedback. Set submit = primary user action in workout.

3. **MED-3 + MED-1 + MED-5 batch aria-live attribute additions** (~15 min total)
   - WorkoutPreview intensity banner (line 149) + InstallPrompt (line 64) + UpdatePrompt (line 58) — adauga `aria-live="polite"` attribute explicit.
   - Impact: cross-browser SR consistency (Safari iOS implicit role/live gap istoric). Single-attribute edit per fisier.

## Decizii proprii (Co-CTO autonomous per CLAUDE.md)

- **NU recomand HIGH-3 ca P1.** NutritionInline calorii update = MED-impact pentru target Gigel/Maria; toast acknowledgement (MED-4 pattern) suficient daca wired via save handler. Aria-live separate redundant. Re-clasifica HIGH-3 → MED-3.5.
- **NU recomand LOW-2 SessionPill.** 1Hz aria-live update = SR spam, contraproductive.
- **Recomand toast.success() wire la saveBoth() NutritionInline + saveWeekly() Calendar7Day** ca quick-win (10-15 min total). Reuse existing Toast aria-live infrastructure in loc de duplicate aria-live regions.

## Daniel CEO decisions

- **Threshold aria-live polish pre-Beta target?**
  - Option A (recomandat Co-CTO): HIGH-1 + HIGH-2 mandatory pre-Beta. MED candidates opt-in batch. ~75-90 min total work.
  - Option B (minimal Beta gate): doar HIGH-1 phase transitions, restul defer post-Beta. ~30-60 min.
  - Option C (defer all): aria-live coverage adequat per W4-AUDIT-DEEPER chat 5 baseline (implicit role coverage cross-browser acceptable). Skip pre-Beta.
- **Gigel/Maria SR usage assumption?** Daca real Gigel = non-tech mediu NU foloseste screen reader, HIGH severity reduce la MED. Daniel decide priority axis (SR usage vs visual feedback only).

## Raport lean

```
ARIA-LIVE-REGIONS-AUDIT: /📤_outbox/ARIA_LIVE_REGIONS_AUDIT_chat5.md
LOC: ~180
Current coverage: 12 explicit aria-live + 21 role=status/alert implicit
Uncovered HIGH gaps: 3 (phase transitions / set submit / kcal save)
Top 3: HIGH-1 phase announcer 30-60min | HIGH-2 set submit ack 20-30min | MED batch attribute fix 15min
```

## Blockers / final

- ZERO src/ touched (READ-ONLY respect).
- ZERO git commit.
- File written `📤_outbox/ARIA_LIVE_REGIONS_AUDIT_chat5.md`.
- Daniel CEO threshold decision pending (A / B / C above).
