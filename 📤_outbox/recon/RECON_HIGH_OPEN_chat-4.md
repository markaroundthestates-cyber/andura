# RECON HIGH OPEN — Chat 4 dispatch prep

**Generated:** 2026-05-22T17:27:38Z
**Source:** findings-ledger.json @ 2026-05-22T14:28:44+00:00
**Total HIGH open:** 97
**Total findings ledger:** 941 (470 open / 468 fixed / 49.7% Beta gate)

**Ledger HIGH breakdown:** 250 total HIGH, 97 open (39%), 153 fixed (61%).
**Source split:** 56 HIGH from audit-nuclear §30-§50, 41 HIGH from mockup-vs-prod-parity Wave A-F + Pass 2.

---

## Cluster HIGH-ALFA — Entry surfaces text+layout parity (10 findings)

**Theme:** Splash + Auth + Onboarding wording/components parity to mockup DESIGN MASTER. Surgical text swaps + missing components (back button, terms footer). Daniel anti-paternalism brand tagline restored.
**File ownership EXCLUSIVE:**
- `src/react/routes/screens/Splash.tsx`
- `src/react/routes/screens/Auth.tsx`
- `src/react/routes/screens/Onboarding.tsx`
- `src/react/components/SubHeader.tsx` (new shared component)
**Estimate cluster:** ~3-4h (mostly S+M surgical)
**Spawn isolation:** worktree mandatory (D049)
**Dependencies:** none — entry surfaces independent of engine wires

### §F-splash-01 — Subtitle TEXT divergence
- **File:** `src/react/routes/screens/Splash.tsx:25`
- **Problem:** Prod shows `Antrenament cu cap. Facut in Romania.` but mockup tagline is `Antrenorul tau personal,\nfara zgomot.` (anti-paternalism brand positioning).
- **Fix:** Surgical text swap to 2-line mockup tagline.
- **Effort:** S

### §F-splash-02 — Title font-size dropped 42→30px
- **File:** `src/react/routes/screens/Splash.tsx:22`
- **Problem:** Mockup `font-size:42px font-weight:700` reduced to Tailwind `text-3xl` (30px) — 28% smaller wordmark.
- **Fix:** Use arbitrary Tailwind value `text-[42px]` to match mockup spec.
- **Effort:** S

### §F-splash-04 — Footer line MISSING ("Facut in Romania · Datele tale raman ale tale")
- **File:** `src/react/routes/screens/Splash.tsx:23-26`
- **Problem:** Mockup footer trust line `Facut in Romania · Datele tale raman ale tale` (privacy positioning) absent in prod — moved into subtitle and lost data ownership half.
- **Fix:** Add `<p>` footer 11px ink-3 with full mockup verbatim copy below CTAs.
- **Effort:** S

### §F-auth-01 — Title TEXT divergence
- **File:** `src/react/routes/screens/Auth.tsx:53-55`
- **Problem:** Prod `Autentificare` formal vs mockup warm `Intra in cont` Daniel-direct tone.
- **Fix:** Surgical text swap.
- **Effort:** S

### §F-auth-02 — Subtitle TEXT divergence
- **File:** `src/react/routes/screens/Auth.tsx:56-58`
- **Problem:** Prod `Iti trimitem un link pe email...` vs mockup `Un tap cu Google. Fara parola, fara link pe email.` Mockup positions Google primary; prod assumes Magic Link only.
- **Fix:** Adopt mockup subtitle wording (paired with Google OAuth CRIT cluster in future wave).
- **Effort:** S

### §F-auth-05 — Back button MISSING
- **File:** `src/react/routes/screens/Auth.tsx:48-52`
- **Problem:** Mockup has back arrow at top to splash; prod has no back navigation — UX dead-end.
- **Fix:** Add `<button onClick={() => navigate(-1)}>` with arrow-left Lucide icon.
- **Effort:** S

### §F-auth-07 — Terms acceptance footer MISSING
- **File:** `src/react/routes/screens/Auth.tsx`
- **Problem:** Legal compliance footer `Continuand accepti Termenii si Confidentialitatea. Nu folosim datele tale pentru reclame.` absent.
- **Fix:** Add `<p>` footer with links to `/app/cont/settings-terms` + `/app/cont/settings-privacy`.
- **Effort:** S

### §F-ceva-nu-merge-03 — Sub-header back-btn MISSING (cross-pattern)
- **File:** `src/react/components/SubHeader.tsx` (new) + `src/react/routes/screens/antrenor/CevaNuMerge.tsx`
- **Problem:** Cross-cutting pattern violated — Auth + EnergyCause + CevaNuMerge all missing back button. Single SubHeader component would unify.
- **Fix:** Create shared `<SubHeader backTo title />` component; consume here.
- **Effort:** M

### §F-onboarding-02 — Step 1 (Obiectiv) verbatim copy
- **File:** `src/react/routes/screens/Onboarding.tsx`
- **Problem:** Step 1 Obiectiv intent + medical disclaimer integrated copy verify verbatim vs mockup.
- **Fix:** Read mockup §486-728 Step 1 + ensure prod Step 1 copy verbatim.
- **Effort:** S

### §30-H2 — Onboarding completion celebration UX (Step 7 summary)
- **File:** `src/react/routes/screens/Onboarding.tsx` (Step 7 render)
- **Problem:** §30.8 Step 7 summary tone — verify warm "Daniel-direct" vs corporate "Felicitări!" wording.
- **Fix:** Sample Step7 implementation + adjust tone per D024 autonomous wording compose.
- **Effort:** S

---

## Cluster HIGH-BETA — Cont tab + profile + sub-screen wiring (11 findings)

**Theme:** Cont avatar/name/email wired to real user, "Aparate lipsa" navigation fix, missing sub-screens (Warning banner, notification toggles, privacy paradigm).
**File ownership EXCLUSIVE:**
- `src/react/routes/screens/cont/Cont.tsx`
- `src/react/routes/screens/cont/SettingsProfile.tsx`
- `src/react/routes/screens/cont/SettingsNotifications.tsx`
- `src/react/routes/screens/cont/SettingsPrivacy.tsx`
- `src/react/routes/screens/cont/SettingsDanger.tsx`
- `src/react/routes/screens/cont/SettingsAppearance.tsx`
- `src/react/stores/authStore.ts` (read for user name) [READ-ONLY]
**Estimate cluster:** ~5-6h
**Spawn isolation:** worktree mandatory (D049)
**Dependencies:** none — cont surfaces functional even without engine wires

### §F-cont-01 — Account avatar initial wrong ("A" generic vs "D" user initial)
- **File:** `src/react/routes/screens/cont/Cont.tsx:99-101`
- **Problem:** Hardcoded `A` literal — broken trust signal first time user sees own profile.
- **Fix:** Read user name from authStore/profileStore, take `[0]` uppercase.
- **Effort:** S

### §F-cont-02 — Account name "Utilizator" generic vs real user name
- **File:** `src/react/routes/screens/cont/Cont.tsx:103`
- **Problem:** Generic Romanian placeholder instead of authenticated user name.
- **Fix:** Read from authStore/profileStore.
- **Effort:** S

### §F-cont-03 — Account email placeholder "Profilul tau Andura" vs real email
- **File:** `src/react/routes/screens/cont/Cont.tsx:104`
- **Problem:** Descriptive placeholder instead of authenticated email (truncate ellipsis if long).
- **Fix:** Read from authStore email field.
- **Effort:** S

### §F-cont-05 — "Aparate lipsa" row în General section DISABLED (no target)
- **File:** `src/react/routes/screens/cont/Cont.tsx:57`
- **Problem:** Mockup says `goto('aparate-lipsa')`; prod has `target: undefined` so row disabled.
- **Fix:** Set `target: 'aparate-lipsa'` (route exists at `/app/antrenor/aparate-lipsa`).
- **Effort:** S

### §F-pass2-settings-profile-05 — "Antrenament" section is PROD EXTRA NOT în mockup
- **File:** `src/react/routes/screens/cont/SettingsProfile.tsx`
- **Problem:** Prod adds Antrenament section (Obiectiv + Frecventa) not in mockup.
- **Fix:** Daniel decision via Co-CTO: keep onboarding fields surface in profile edit (logical) OR remove for mockup tightness. Recommend KEEP per onboarding surfacing value.
- **Effort:** S (decision documentation only) or L (remove section)

### §F-pass2-settings-notif-02 — Specific toggles ABSENT in prod
- **File:** `src/react/routes/screens/cont/SettingsNotifications.tsx:52-122`
- **Problem:** Mockup has per-event toggles (Reamintire sesiune, Pauza intre seturi, Sarit sedinta, Mesaj zilnic 07:30, Sumar saptamanal duminica) grouped by DOMAIN. Prod is ATTRIBUTE-grouped master toggle + frequency picker.
- **Fix:** Restructure prod to mockup domain grouping with per-event toggles.
- **Effort:** L (paradigm restructure)

### §F-pass2-settings-privacy-01 — Prod is engine-wired settings, mockup is text-only policy
- **File:** `src/react/routes/screens/cont/SettingsPrivacy.tsx`
- **Problem:** Mockup likely T&C-style static text; prod has functional GDPR consent toggles. Both serve different purposes.
- **Fix:** Daniel decision via Co-CTO: keep prod functional toggles (GDPR mandate) + amend mockup. Recommend KEEP + add static policy text below toggles.
- **Effort:** M (additive)

### §F-pass2-settings-danger-01 — Warning banner MISSING
- **File:** `src/react/routes/screens/cont/SettingsDanger.tsx`
- **Problem:** Mockup has cream warning banner with alert-triangle icon + safety messaging `Actiunile de mai jos afecteaza contul tau. Citeste cu atentie...`. Prod absent.
- **Fix:** Add WarningBanner component at top of SettingsDanger.
- **Effort:** S

### §F-pass2-settings-appearance-02 — "Bara de jos" section is PROD EXTRA
- **File:** `src/react/routes/screens/cont/SettingsAppearance.tsx`
- **Problem:** Prod adds nav-style (Spatios/Compact) section not in mockup — drift.
- **Fix:** Co-CTO decision: keep useful UX option, document drift via DECISIONS.md entry.
- **Effort:** S (documentation only)

### §45-H4 — Phase 6 task_17 SettingsDanger account deletion full wipe verify
- **File:** `src/react/routes/screens/cont/SettingsDanger.tsx` + `src/auth.js` (read-only verify)
- **Problem:** Per D026 task_17 LANDED — verify "Sterge contul" deletes ALL tiers (Tier 0 localStorage wv2-*, Tier 1 Dexie, Tier 2 Firebase archive, Firebase Auth user).
- **Fix:** E2E test deletion flow; ensure no orphan data in any tier.
- **Effort:** M

### §31-H3 — Multi-device auth simultaneous handling
- **File:** `src/react/routes/screens/cont/SettingsDanger.tsx` (logout handler)
- **Problem:** §31.7+§7.18 cross-device requires real Firebase Auth listener; logout needs proper session invalidation per device.
- **Fix:** Implement Firebase ID token refresh listener + clear Zustand stores + IndexedDB + Firebase Auth + redirect splash.
- **Effort:** M (depends on §7-C3 auth listener — flag as soft dependency)

---

## Cluster HIGH-GAMMA — Antrenor sub-screens parity (Pain/Energy/Equipment/PostSummary) (8 findings)

**Theme:** Antrenor secondary screens with paradigm divergences and missing components — pain button copy, energy cause icons, equipment list naming, post-session closure.
**File ownership EXCLUSIVE:**
- `src/react/routes/screens/antrenor/EnergyCause.tsx`
- `src/react/routes/screens/antrenor/PainButton.tsx`
- `src/react/routes/screens/antrenor/AparateLipsa.tsx`
- `src/react/routes/screens/antrenor/PostSummary.tsx`
- `src/react/routes/screens/antrenor/Workout.tsx`
**Estimate cluster:** ~4-5h
**Spawn isolation:** worktree mandatory (D049)
**Dependencies:** none

### §F-energy-cause-01 — Cause options DIVERGENT (count 4 → 6 + text divergent)
- **File:** `src/react/routes/screens/antrenor/EnergyCause.tsx:20-27`
- **Problem:** Mockup has 4 causes (Stres / Somn slab / Durere musculara · articulatie / Altul); prod has 6 (Dormit putin / Mancat putin / Stres mental / Antrenament greu ieri / Boala sau racit / Altceva).
- **Fix:** Co-CTO decision (Gigel filter): converge to mockup 4 simple OR keep prod 6 granular. Recommend prod 6 (finer signal for engine).
- **Effort:** S (decision + amend mockup) or M (prune prod to 4)

### §F-energy-cause-02 — Icons MISSING per cause
- **File:** `src/react/routes/screens/antrenor/EnergyCause.tsx:60-69`
- **Problem:** Mockup has Lucide icons per cause (wind/moon/alert-circle/more-horizontal); prod text-only.
- **Fix:** Add icon mapping per cause object + render `<Icon className="w-4 h-4" />` before label.
- **Effort:** S

### §F-energy-cause-07 — Sub-header back button MISSING (same pattern Auth + EnergyCheck)
- **File:** `src/react/routes/screens/antrenor/EnergyCause.tsx:53-57`
- **Problem:** Cross-cutting back button pattern — same as HIGH-ALFA SubHeader (resolved upstream).
- **Fix:** Consume `<SubHeader />` from HIGH-ALFA cluster.
- **Effort:** S (depends on HIGH-ALFA SubHeader)

### §F-pain-button-02 — Coach reassurance toast/copy MISSING
- **File:** `src/react/routes/screens/antrenor/PainButton.tsx:24-60`
- **Problem:** Mockup has per-button toast `Siguranta e pe primul loc. Am ajustat restul sesiunii.` + closing italic `Daca nu se potriveste niciuna, opreste sesiunea si consulta un medic.` — safety messaging mandatory.
- **Fix:** Add toast on pain confirm + closing italic at bottom of screen.
- **Effort:** S

### §F-aparate-lipsa-01 — Equipment list divergence (10 flat specific vs 3 categories grouped)
- **File:** `src/react/routes/screens/antrenor/AparateLipsa.tsx:25-41`
- **Problem:** Mockup flat 10-checkbox list (Banca inclinata, Banca plana, Bara halterelor, etc.); prod 3 categories grouped (Greutati libere/Aparate/Cardio). Daniel Slice 1.7 reglaj LOCKED naming convention.
- **Fix:** Flatten to mockup naming + 10 specific equipment checkboxes.
- **Effort:** M

### §F-post-summary-01 — Sub-header "Sesiune terminata" MISSING (workout title used instead)
- **File:** `src/react/routes/screens/antrenor/PostSummary.tsx:109-111`
- **Problem:** Prod h1 = workout title (looks like preview screen); mockup h1 = "Sesiune terminata" (clear closure framing).
- **Fix:** Surgical h1 swap; move workout title to subtitle.
- **Effort:** S

### §F-post-summary-03 — Grupe musculare pills MISSING
- **File:** `src/react/routes/screens/antrenor/PostSummary.tsx`
- **Problem:** Mockup has "Grupe musculare" section with pill rows (Piept/Umeri/Triceps/Abs) + color dots (brick = primary, ink-3 = secondary). Prod absent.
- **Fix:** Add MuscleGroupsTouchedPills component reading from sessionExercisesBreakdown muscle mapping.
- **Effort:** M

### §F-workout-03 — Exercise actions "Aparat ocupat" + "Nu vreau" verify Pass 2
- **File:** `src/react/routes/screens/antrenor/Workout.tsx`
- **Problem:** Daniel 2026-05-12 Slice 1.7 reglaj: 2-button row top of exercise (users icon "Aparat ocupat" + hand icon "Nu vreau") — substitution affordances. Verify present in prod.
- **Fix:** Inspect Workout.tsx; add buttons if missing.
- **Effort:** S-M

---

## Cluster HIGH-DELTA — Workout session components + FSM coverage (8 findings)

**Theme:** Workout session UX completeness — SessionTimer chrome bar, SetLogInput Tinta paradigm, FSM transition tests, menu modal options.
**File ownership EXCLUSIVE:**
- `src/react/components/Workout/SessionTimer.tsx`
- `src/react/components/Workout/SetLogInput.tsx`
- `src/react/stores/workoutStore.ts`
- `src/react/stores/__tests__/workoutStore.test.ts` (new tests)
- `tests/e2e/scenarios/workout-fsm.spec.ts` (new tests)
- `src/react/components/Workout/WorkoutMenu.tsx` (new component)
**Estimate cluster:** ~5-6h
**Spawn isolation:** worktree mandatory (D049)
**Dependencies:** §44-H2 depends on §14-C1 (FSM discriminated union — CRIT wave). Flag as soft.

### §F-pass2-sessiontimer-02 — Title shows EXERCISE name not WORKOUT name
- **File:** `src/react/components/Workout/SessionTimer.tsx:35-37`
- **Problem:** Center label = current exerciseName (changes per exercise); mockup center = workout name `Push · piept & umeri` (fixed session context).
- **Fix:** Pass workoutTitle prop from PlannedWorkout; render that instead of exerciseName.
- **Effort:** S

### §F-pass2-sessiontimer-04 — Global progress bar MISSING from SessionTimer
- **File:** `src/react/components/Workout/SessionTimer.tsx:38-40`
- **Problem:** Mockup has separate `wv2-progress` block below chrome with sets/exercise counters + progress fill bar 29%. Prod only "Ex N/M" inline.
- **Fix:** Add ProgressBar sub-component with sets counter (5/17) + exercise counter (2/5) + visual fill bar.
- **Effort:** M

### §F-pass2-setloginput-01 — Paradigm divergence (Tinta state vs always-editable inputs)
- **File:** `src/react/components/Workout/SetLogInput.tsx:27-55`
- **Problem:** Mockup pre-log state shows ONLY `Tinta 10 repetari 22.5 kg` large display + "Logheaza setul" CTA. Inputs hidden until log. Daniel 2026-05-12 explicit `doar tinta inainte de Logheaza`.
- **Fix:** Add state machine `pre-log` (display tinta) → `post-log` (readonly + pencil). Hide inputs in pre-log.
- **Effort:** L

### §F-pass2-setloginput-02 — "Tu ai facut X repetari cu Y kg" post-log readonly display MISSING
- **File:** `src/react/components/Workout/SetLogInput.tsx`
- **Problem:** Mockup post-log state shows readonly `Tu ai facut 10 repetari cu 22.5 kg` + pencil edit affordance. Prod single state (no post-log).
- **Fix:** Cumulative with §F-pass2-setloginput-01 (single state machine task).
- **Effort:** Combined L

### §F-workout-08 — Workout menu modal options verify Pass 2
- **File:** `src/react/components/Workout/WorkoutMenu.tsx` (new)
- **Problem:** Mockup `⋯ menu` opens modal with pain-button + confirm-finish-early options. Prod chrome bar lacks menu button entirely.
- **Fix:** Build WorkoutMenu component + wire to SessionTimer chrome.
- **Effort:** M

### §44-H1 — Transitions FSM valid Idle→Active→Paused→Completed→Post-session→Idle invariant test absent
- **File:** `src/react/stores/__tests__/workoutStore.test.ts`
- **Problem:** §44.6 — implementation in workoutStore actions; specific transition matrix test absent.
- **Fix:** Add invariant test: each transition has source + target + action; invalid transitions throw.
- **Effort:** M

### §44-H2 — Dead states unreachable (Active→Idle direct disabled)
- **File:** `src/react/stores/workoutStore.ts`
- **Problem:** §44.7 — depends FSM type safety §14-C1 (discriminated union). Soft dep on CRIT wave.
- **Fix:** After §14-C1 lands discriminated union, add invariant unreachable transitions.
- **Effort:** S (post §14-C1)

### §44-H3 — 5 moduri test coverage each transition vitest + Playwright
- **File:** `tests/e2e/scenarios/workout-fsm.spec.ts` + workoutStore.test.ts
- **Problem:** §44.12 — partial coverage tests/e2e/scenarios/; per-transition unit test verify needed.
- **Fix:** Add Vitest unit tests for each transition + Playwright E2E for 5-moduri user journey.
- **Effort:** M

---

## Cluster HIGH-EPSILON — Antrenor home + Progres widgets (8 findings)

**Theme:** Antrenor home card wires + Progres widget parity — CoachToday lagging signal, override link, Calendar title, Fatigue/TDEE/HeatMap layouts.
**File ownership EXCLUSIVE:**
- `src/react/components/Antrenor/CoachTodayCard.tsx`
- `src/react/components/Antrenor/CoachRestCard.tsx`
- `src/react/components/Calendar7Day.tsx`
- `src/react/components/Progres/FatigueStrip.tsx`
- `src/react/components/Progres/TDEEStrip.tsx`
- `src/react/components/Progres/HeatMapWeekly.tsx`
- `src/react/components/Progres/BMRStrip.tsx` (new)
**Estimate cluster:** ~5h
**Spawn isolation:** worktree mandatory (D049)
**Dependencies:** §F-pass2-coachtoday-04 (lagging) depends on weaknessDetector engine read — flag

### §F-pass2-coachtoday-04 — Lagging signal extension (FIX 4 2026-05-11) MISSING
- **File:** `src/react/components/Antrenor/CoachTodayCard.tsx`
- **Problem:** Mockup hidden `coach-today-lagging` block extends WHY with weakness signal (e.g., `spatele sub-volum 2 sapt — focus azi pe randuri`). Prod absent.
- **Fix:** Add LaggingSignalExtension conditional read from weaknessDetector engine (read coachDirectorAggregate enrich field).
- **Effort:** M

### §F-pass2-coachtoday-06 — "Vrei altceva azi?" override link MISSING
- **File:** `src/react/components/Antrenor/CoachTodayCard.tsx:36-42`
- **Problem:** Mockup below CTA: `<a>Vrei altceva azi? →</a>` opens scheduleOverride. Prod absent.
- **Fix:** Add override link below "Incepe sesiunea" CTA navigating to `/app/antrenor/schedule-override`.
- **Effort:** S

### §F-pass2-coachrest-02 — Duration "~ 15 min mobilitate" HARDCODED
- **File:** `src/react/components/Antrenor/CoachRestCard.tsx:34`
- **Problem:** Hardcoded `~ 15 min mobilitate` instead of dynamic duration from rest session plan.
- **Fix:** Wire from rest session plan prop.
- **Effort:** S

### §F-pass2-calendar-01 — Title divergence "Saptamana" vs "Program de antrenament"
- **File:** `src/react/components/Calendar7Day.tsx:59-61`
- **Problem:** Prod title `Saptamana` (uppercase tracking-wide ink2, NOT centered); mockup + Daniel 2026-05-12 explicit reglaj `Program de antrenament` CENTRAT.
- **Fix:** Surgical text swap + center text + text-base font-semibold.
- **Effort:** S

### §F-pass2-fatiguestrip-01 — Score scale divergence (0-100 vs 0-10)
- **File:** `src/react/components/Progres/FatigueStrip.tsx:25-29`
- **Problem:** Mockup `Oboseala azi 6/10` (intuitive); prod `{score}/100` (technical).
- **Fix:** Co-CTO decision: convert score/10 OR keep 100-scale + amend mockup. Recommend convert (Gigel test wins).
- **Effort:** S

### §F-pass2-fatiguestrip-02 — Calorii baza BMR side-by-side MISSING
- **File:** `src/react/components/Progres/FatigueStrip.tsx` + new `BMRStrip.tsx`
- **Problem:** Mockup 2-col strip — Oboseala + Calorii baza BMR `1 850 kcal/zi` side-by-side. Prod FatigueStrip standalone.
- **Fix:** Create BMRStrip OR merge BMR into FatigueStrip 2-col layout. Daniel LOCKED V1 `single number NU visual bar`.
- **Effort:** M

### §F-pass2-tdeestrip-01 — Faza badge + mesocycle week MISSING
- **File:** `src/react/components/Progres/TDEEStrip.tsx:41-43`
- **Problem:** Mockup top row badge `Faza: Auto` colored dot + `Sapt. 3 / mesociclu` periodization context. Prod only "Target azi" label.
- **Fix:** Add Faza pill + sapt counter read from periodization engine.
- **Effort:** M

### §F-pass2-heatmap-02 — Weight delta + drill link MISSING
- **File:** `src/react/components/Progres/HeatMapWeekly.tsx`
- **Problem:** Mockup has green delta `↓ 0.4 kg / 7z` + drill link `Pentru analiza profunda → vezi Istoric › Greutate & BF`. Prod absent.
- **Fix:** Add weight delta computation + drill link below heatmap. (Paradigm mockup vs prod still TBD Daniel — this finding additive.)
- **Effort:** M

---

## Cluster HIGH-ZETA — Confirm modals + Auth/Engine wire verify (8 findings)

**Theme:** Missing confirm modals (7 destructive flows), Phase 6 engine real-wire verification (CoachDirector, Adherence, Adapter integrity), Onboarding resume.
**File ownership EXCLUSIVE:**
- `src/react/routes/screens/cont/ConfirmResetCoach.tsx` (new)
- `src/react/routes/screens/cont/ConfirmSchimbaFaza.tsx` (new)
- `src/react/routes/screens/cont/ConfirmRedoOnboarding.tsx` (new)
- `src/react/routes/screens/cont/ConfirmProgramChange.tsx` (new)
- `src/react/routes/screens/antrenor/ConfirmFinishEarly.tsx` (already exists — verify) [READ verify only]
- `src/react/lib/coachDirectorAggregate.ts` [READ verify only]
- `src/react/lib/engineSignalsAggregate.ts` [READ verify only]
- `src/react/lib/engineWrappers.ts` [READ verify only]
- `src/react/stores/onboardingStore.ts` [READ verify only]
**Estimate cluster:** ~5-6h (mostly L modal builds + M verify scripts)
**Spawn isolation:** worktree mandatory (D049)
**Dependencies:** verify steps independent; confirm modal builds need existing LogoutConfirm/DeleteAccountConfirm/ResetDataConfirm patterns as reference (READ-ONLY)

### §F-missing-confirms-all-7 — Confirm modals MISSING (4 net new + 3 verify existing)
- **File:** New confirm files in `src/react/routes/screens/cont/`
- **Problem:** Mockup pattern full-screen confirm with warning copy + Confirma/Anuleaza CTAs. Existing: LogoutConfirm + DeleteAccountConfirm + ResetDataConfirm + ResetCoachConfirm + RedoOnboardingConfirm + SchimbaFazaConfirm + FinishEarlyConfirm. Verify all 7 wired + functional.
- **Fix:** READ each Confirm*.tsx; ensure routes registered + warning text + destructive CTA + cancel.
- **Effort:** M (verify all 7) — likely most exist per `ls cont/` output

### §30-H3 — Resume incomplete onboarding post-close mid-flow
- **File:** `src/react/stores/onboardingStore.ts` + `src/react/routes/screens/Onboarding.tsx`
- **Problem:** §30.11 — onboardingStore persist middleware likely retains data; on reopen, does Onboarding.tsx read `data` field and navigate to last step OR restart?
- **Fix:** Verify resume policy; document or implement step-resume logic.
- **Effort:** M

### §45-H2 — Phase 6 task_06 Coach Director 8-field enrich functional E2E
- **File:** `src/react/lib/coachDirectorAggregate.ts` + Antrenor consumer verification
- **Problem:** §45.2.4+§8.28 — coachDirectorAggregate.ts wraps engine pipeline. UI consumes (Antrenor PatternsBanner, AlertsBanner, PRWallRecent). Verify real pipeline returns all 8 fields end-to-end when authenticated.
- **Fix:** E2E test with authenticated user + Big 6 data set; assert 8 fields populated.
- **Effort:** M

### §45-H3 — Phase 6 task_08 Adherence Engine baseline elimination
- **File:** `src/react/lib/engineSignalsAggregate.ts`
- **Problem:** §45.2.6+§8.27 — comment claims real wire; verify adapter calls real engine, not baseline fallback.
- **Fix:** Audit code path; add log + Sentry alert when fallback triggers (post Sentry wire §13-C1).
- **Effort:** S verify + M instrumentation

### §45-H1 — Phase 6 task_02 Option C async migration consumers verified
- **File:** `src/react/routes/screens/antrenor/Antrenor.tsx` + other consumers
- **Problem:** §45.2.2 — Antrenor.tsx uses async useState+useEffect for coachDirectorAggregate. Verify NutritionInline + ReadinessVerdict + other consumers all migrated to async pattern per D027 LOCKED V1.
- **Fix:** Grep `coachDirectorAggregate|engineSignalsAggregate` consumers; ensure all async.
- **Effort:** S

### §48-H1 — Adapter integrity NU silently divergent from real engine output
- **File:** `src/react/lib/engineWrappers.ts`
- **Problem:** §48.5 — engineWrappers.ts wraps engines with try/catch fallback to baseline. Risk: silent divergence (engine returns malformed shape, adapter returns baseline → UI shows stale defaults forever).
- **Fix:** Add log + Sentry alert when adapter fallback triggers in production (depends on §13-C1 Sentry wire).
- **Effort:** S (instrumentation)

### §48-H2 — Phase 6 task_06 + task_08 real wire — verify adapter NO LONGER fallback
- **File:** `src/react/lib/coachDirectorAggregate.ts` + `engineSignalsAggregate.ts`
- **Problem:** §48.4+§45-H2+§45-H3 — verify adapter path real engine (not baseline). Auth broken §7-C2 blocks live-data testing.
- **Fix:** Cumulative with §45-H2 + §45-H3. Single verification audit.
- **Effort:** Combined S

### §47-H2 — Engine output → UI consume wiring verified per F2/F4/F6/F7/F8
- **File:** `src/react/components/Antrenor/*` (read-only audit) + `src/react/lib/*Aggregate.ts`
- **Problem:** §47.10 — sample shows engines emit `{label, color, ...}`, UI passive consume. Spot-checks pending across F-features.
- **Fix:** Sample audit each F-feature wiring; ensure UI doesn't hardcode duplicate engine message.
- **Effort:** M (audit-only, no code change unless drift found)

---

## Cluster HIGH-ETA — Engine math ADR documentation + Library schema (10 findings)

**Theme:** Engine math doc-only ADR appends (Brzycki choice, RIR/RPE table, MEV/MAV/MRV values, Energy asymmetric thresholds, FP drift) + Library 657 schema test.
**File ownership EXCLUSIVE:**
- `03-decisions/ADR-XXX-engine-math-locked-values.md` (new ADR)
- `src/engine/prEngine.js` [READ verify only]
- `src/engine/constants.js` (or per-engine — read first)
- `src/engine/periodization/volumeLandmarks.js` [READ verify only]
- `src/engine/energyAdjustment/` [READ verify only]
- `src/engine/bayesianNutrition/kalmanFilter.js` [READ verify only]
- `src/schema/__tests__/exerciseMetadata.test.js`
- `src/schema/exerciseMetadata.js` [READ verify + entry-count audit only]
**Estimate cluster:** ~4h (mostly verification + ADR doc; one new test file)
**Spawn isolation:** worktree mandatory (D049)
**Dependencies:** none — engine math values already in code; doc-only catalog

### §38-H1 — Brzycki vs Epley decision documented per ADR
- **File:** new ADR + verify `src/engine/prEngine.js`
- **Problem:** §38.2 — single 1RM formula used app-wide; documented choice missing.
- **Fix:** Read prEngine.js Brzycki implementation; write ADR documenting choice + edge case (reps=37 div-zero).
- **Effort:** S

### §38-H2 — RIR/RPE conversion table consistent
- **File:** `src/engine/constants.js` (verify) + new ADR
- **Problem:** §38.5 — RIR 0 = RPE 10, RIR 1 = RPE 9.5, etc. Single source of truth verify.
- **Fix:** Sample audit central RIR↔RPE table; document in ADR.
- **Effort:** S

### §38-H3 — MEV/MAV/MRV per muscle group values documented Israetel framework
- **File:** `src/engine/periodization/volumeLandmarks.js` + new ADR
- **Problem:** §38.9 — verify numeric MEV (8-10 sets/wk) → MAV (12-16) → MRV (18-22) per muscle group.
- **Fix:** Read volumeLandmarks.js; document Israetel constants in ADR.
- **Effort:** S

### §38-H4 — Energy Adjustment ±15% asymmetric T1+ vs ±10% T0 documented exact
- **File:** `src/engine/energyAdjustment/` + new ADR
- **Problem:** §38.10 — specific thresholds + asymmetric direction (upward vs downward) verify.
- **Fix:** Read energyAdjustment engine; document thresholds in ADR.
- **Effort:** S

### §38-H5 — Floating point accumulation drift prevention
- **File:** `src/engine/bayesianNutrition/kalmanFilter.js` + new test
- **Problem:** §38.19 — Kalman filter posterior.mu over 90 days = 90 multiplications-additions of floats. Drift verify.
- **Fix:** Verify posterior update returns rounded value at each step OR add test: convergence over 1000 days acceptable drift.
- **Effort:** M (test addition)

### §39-H1 — Schema invariant preserved across deploys NOT VERIFIED automated test
- **File:** `src/schema/__tests__/exerciseMetadata.test.js`
- **Problem:** §39.12 — no test asserting exact count + schema field shape. Refactor could silently lose entries.
- **Fix:** Add test verify entry count (target 657, current 650 per §39-C1) + each entry has required fields.
- **Effort:** M

### §39-H2 — Equipment-lipsa fallback chain priority order
- **File:** `src/schema/exerciseMetadata.js` (audit 10 missing entries)
- **Problem:** §39.14 — `fallback_cascade[]` documented in 640/650 entries. 10 entries lack fallback_cascade.
- **Fix:** Audit 10 missing entries; either populate or document why exempt.
- **Effort:** S

### §43-H1 — Pain Button behavior ACUT/USOARA/NICIO
- **File:** verify `src/react/routes/screens/antrenor/PainButton.tsx` [READ-only]
- **Problem:** §43.3 — Pain Button branching: ACUT → workout adapt+modify, USOARA → continue with warning, NICIO → normal. Verify flow.
- **Fix:** Sample PainButton.tsx logic; document branching in ADR or comment.
- **Effort:** S (verify-only)

### §43-H2 — Injury reporting flow CDL + Recovery Engine adapt
- **File:** `src/react/routes/screens/antrenor/PainButton.tsx` + `src/engine/muscleRecovery.js` [READ verify]
- **Problem:** §43.4 — Post-pain ACUT → log in CDL → muscleRecovery.js engine adapt next session. Wire-through verify.
- **Fix:** Read PainButton handler + verify CDL write + next session adapted.
- **Effort:** S verify, M E2E if missing

### §43-H3 — "Consult doctor" cues placement
- **File:** `src/react/components/MedicalDisclaimerModal.tsx` [READ verify] + `src/react/routes/screens/antrenor/PainButton.tsx` [READ verify]
- **Problem:** §43.5 — MedicalDisclaimerModal mentions doctor consult. Pain Button ACUT path also? Verify NOT paternalistic over-cautious.
- **Fix:** Audit cues placement; ensure not over-paternalistic per Daniel anti-paternalism LOCK.
- **Effort:** S (verify-only)

---

## Cluster HIGH-THETA — CI/CD + Ops + DR docs (10 findings)

**Theme:** Workflow file hardening (SHA-pin actions, rollback workflow_dispatch, post-deploy smoke, Slack notify) + runbook docs (RTO/RPO, hot-fix path, DR drill).
**File ownership EXCLUSIVE:**
- `.github/workflows/deploy.yml`
- `08-workflows/post-mortem-template.md` (new)
- `08-workflows/communication-template.md` (new)
- `08-workflows/incident-runbook.md` (new)
- `08-workflows/disaster-recovery-runbook.md` (new)
- `08-workflows/definition-of-done.md` (new)
- `08-workflows/slip-tracker.md` (new)
- `08-workflows/wording-backlog.md` (new — deferred per D024)
**Estimate cluster:** ~3-4h (mostly doc writing + small yaml edits)
**Spawn isolation:** worktree mandatory (D049)
**Dependencies:** Some yaml hardening depends on §33-C1 (test gate before deploy — CRIT wave). Flag soft.

### §33-H1 — `actions/checkout@v4` and `peaceiris/actions-gh-pages@v3` not SHA-pinned
- **File:** `.github/workflows/deploy.yml`
- **Problem:** Tag-based actions = supply chain risk. peaceiris/actions-gh-pages@v3 older than v4.
- **Fix:** SHA-pin each action via `@<full-sha-hash>` OR upgrade to `@v4`.
- **Effort:** S

### §33-H2 — Rollback capability tested via tag-revert workflow_dispatch path
- **File:** `.github/workflows/deploy.yml`
- **Problem:** §33.6 — D028 PROC LOCKED V1 PERMANENT manual file-swap; no automated workflow_dispatch rollback.
- **Fix:** Add `workflow_dispatch` trigger with input tag/sha → checkout + deploy.
- **Effort:** M

### §33-H4 — Pre-deploy smoke (post-deploy curl andura.app) ABSENT
- **File:** `.github/workflows/deploy.yml`
- **Problem:** §33.15 — deploy completes; no health check.
- **Fix:** Add post-deploy step `curl -fsS https://andura.app/ > /dev/null` + Slack notify on fail.
- **Effort:** S

### §33-H5 — Deploy notification absent
- **File:** `.github/workflows/deploy.yml`
- **Problem:** §33.16 — no Slack/email/discord notification on success/fail. Daniel manually checks andura.app.
- **Fix:** Add Slack incoming webhook OR email-on-failure step.
- **Effort:** S

### §34-H1 — Rollback procedure tested live D028
- **File:** `08-workflows/disaster-recovery-runbook.md` (new)
- **Problem:** §34.2 — D028 PROC LOCKED V1 PERMANENT rollback documented in DECISIONS.md. Acceptable manual procedure pre-Beta; automate post-Beta (§33-H2).
- **Fix:** Document procedure + manual file-swap commands in runbook.
- **Effort:** S

### §34-H2 — Hot-fix deployment process documented
- **File:** `08-workflows/incident-runbook.md` (new)
- **Problem:** §34.3 — no documented hot-fix path. Currently same path = push to main → deploy.
- **Fix:** Document `Hot-fix = same as normal commit; tests still mandatory; for true emergency = manual rollback via §33-H2`.
- **Effort:** S

### §34-H3 — Recovery objectives RTO < 1h + RPO < 24h documented
- **File:** `08-workflows/disaster-recovery-runbook.md` (new)
- **Problem:** §34.8+§34.9 — document targets + how achieved (Firebase backup, GH Pages deploy time).
- **Fix:** Add RTO/RPO section to DR runbook.
- **Effort:** S

### §34-H4 — DR drill periodic simulate
- **File:** `08-workflows/disaster-recovery-runbook.md` (new)
- **Problem:** §34.14 — schedule quarterly simulated outage.
- **Fix:** Add drill schedule + verification checklist.
- **Effort:** S

### §50-H1 — Definition of Done per feature documented
- **File:** `08-workflows/definition-of-done.md` (new)
- **Problem:** §50.1 — no formal DoD checklist. Implicit from code review pattern.
- **Fix:** Document: code + tests + types + docs + Daniel manual review pre-Beta.
- **Effort:** S

### §33-H3 — Environment promotion strategy single env prod only
- **File:** `08-workflows/environment-promotion-strategy.md` (new)
- **Problem:** §33.7 covered §24-H3 — single env prod only, no staging/preview.
- **Fix:** Document pre-Beta acceptable single-env strategy + post-Beta staging consideration.
- **Effort:** S

---

## Cluster HIGH-IOTA — Storage tiers + Network/Offline (8 findings)

**Theme:** Tier 0/1/2 storage operations (aggregation, restore, size estimation, Firestore limits) + offline reconnect/captive portal/long offline.
**File ownership EXCLUSIVE:**
- `src/react/lib/dexieMigration.ts`
- `src/react/lib/archiveLayer.ts` (or similar Tier 2 archive)
- `src/react/lib/storageEstimate.ts` (new)
- `src/react/lib/firebase.js` [READ verify only]
- `src/react/lib/networkStatus.ts` (new — useNetworkStatus hook)
- `src/react/components/CaptivePortalBanner.tsx` (new)
- `vite.config.js` (Workbox BackgroundSync registration)
- `src/sw.js` (or workbox runtime config)
**Estimate cluster:** ~5-6h
**Spawn isolation:** worktree mandatory (D049)
**Dependencies:** §36-H1 depends on §36-C1 (sync conflict resolution — CRIT wave). Flag soft.

### §35-H1 — Aggregation pre-archive compress detailed → summary
- **File:** `src/react/lib/dexieMigration.ts`
- **Problem:** §35.5 — archives sessions raw (entire summary object). No aggregation step (e.g., per-month volume totals). Tier 2 storage scales linearly.
- **Fix:** Add pre-archive aggregation: compress detailed session → per-week or per-month summary.
- **Effort:** M

### §35-H2 — Storage size per tier monitored (`navigator.storage.estimate()` NOT USED)
- **File:** `src/react/lib/storageEstimate.ts` (new)
- **Problem:** §35.7+§12-C2 — quota handling absent.
- **Fix:** Wrap `navigator.storage.estimate()` + surface to user when approaching limit.
- **Effort:** S

### §35-H3 — Restore from Tier 2 logic user requests historical data
- **File:** `src/react/lib/archiveLayer.ts` + Istoric consumer
- **Problem:** §35.6 — Tier 2 = Firebase archive. Restore via `fbGet('users/{uid}/archived/*')`. Verify Istoric tab can navigate to old sessions.
- **Fix:** E2E test: user with 100+ day-old sessions opens Istoric → archive load → display.
- **Effort:** M

### §35-H4 — Firebase Firestore document size limit 1MB per doc
- **File:** `src/react/lib/firebase.js` [READ verify]
- **Problem:** §35.15 — Andura uses Firebase RTDB (256MB max per node), NOT Firestore. Verify which path used for Tier 2 archive.
- **Fix:** Audit firebase.js paths; document limit reality in comment.
- **Effort:** S verify

### §36-H1 — Queued operations replay on reconnect
- **File:** `vite.config.js` (Workbox BackgroundSync) + reconnect handler
- **Problem:** §36.12+§36-C1+§16-H3 — local writes during offline → on reconnect, no automatic sync trigger.
- **Fix:** Add Workbox BackgroundSync registration OR app-level reconnect handler.
- **Effort:** M (depends on §36-C1 CRIT — soft dep)

### §36-H2 — Long offline duration (days/weeks) graceful reconnect
- **File:** `src/react/lib/firebase.js` + reconnect handler
- **Problem:** §36.13 — local Dexie writes accumulate; bulk sync needed on reconnect with timeout risk.
- **Fix:** Implement bulk sync with chunking + partial fail recovery.
- **Effort:** M

### §36-H3 — Partial connectivity slow 3G timeout vs retry
- **File:** `src/react/lib/firebase.js` (AbortController)
- **Problem:** §36.14+§25-H2 — AbortController fix for 3G timeout.
- **Fix:** Audit firebase.js fetch calls; ensure AbortController timeout configured.
- **Effort:** S

### §36-H4 — Captive portal hotel/airport WiFi
- **File:** `src/react/lib/networkStatus.ts` + `src/react/components/CaptivePortalBanner.tsx`
- **Problem:** §36.15 — captive portal blocks until ToS accept. User sees stale data without indicator.
- **Fix:** Detect via fetch known-good endpoint; if 200 unexpected (HTML login portal), surface banner.
- **Effort:** M

---

## Cluster HIGH-KAPPA — Compliance + Personas + Dependencies docs (10 findings)

**Theme:** Persona Mental Model validation docs, data retention/dormant policy, anti-recurrence rules state, dependency version audit, calendar DST, wording backlog deferral, claude rc workflow doc, self-critique pass note.
**File ownership EXCLUSIVE:**
- `08-workflows/persona-mental-model-validation.md` (new)
- `08-workflows/data-lifecycle-policy.md` (new)
- `03-decisions/ADR-AR-anti-recurrence-state.md` (new)
- `package.json` (version pin TypeScript)
- `08-workflows/dependency-audit.md` (new)
- `08-workflows/calendar-dst-test-cases.md` (new)
- `08-workflows/audit-self-critique-template.md` (new)
**Estimate cluster:** ~3-4h (almost all doc writing + 1 package.json edit)
**Spawn isolation:** worktree mandatory (D049)
**Dependencies:** none — pure documentation cluster

### §50-H2 — Persona Gigel cognitive Mental Model validation
- **File:** `08-workflows/persona-mental-model-validation.md` (new)
- **Problem:** §50.6 — Gigel non-tech → each screen <5s comprehension, language B1, NU jargon. Sample Auth screen "Mock login" jargon FAILS Gigel test.
- **Fix:** Document per-screen Gigel comprehension check; flag jargon violations.
- **Effort:** S

### §50-H3 — Persona Marius cognitive Mental Model validation
- **File:** `08-workflows/persona-mental-model-validation.md` (cumulative)
- **Problem:** §50.6 — Marius perf → numerical precision present + advanced features accessible + NU dumbed-down.
- **Fix:** Document per-screen Marius check.
- **Effort:** S

### §50-H4 — Persona Maria 65 cognitive Mental Model validation
- **File:** `08-workflows/persona-mental-model-validation.md` (cumulative)
- **Problem:** §50.6 — Maria 65 → large tap targets + plain language + low cognitive overhead + gracefully forgiving.
- **Fix:** Document per-screen Maria check; cross-ref §6-H5 persona-class only Antrenor.
- **Effort:** S

### §50-H5 — Data retention policy per data type
- **File:** `08-workflows/data-lifecycle-policy.md` (new)
- **Problem:** §50.10 — Tier 0 24h + Tier 1 90d + Tier 2 indefinite + erasure opt-out.
- **Fix:** Document policy per data type (sessions, weight logs, body composition, profile data).
- **Effort:** S

### §50-H6 — Account dormant >1 year + reactivation flow
- **File:** `08-workflows/data-lifecycle-policy.md` (cumulative)
- **Problem:** §50.10 — no dormant detection logic. Post-Beta consideration.
- **Fix:** Document dormant policy + reactivation prompt restore data.
- **Effort:** S

### §42-H1 — §AR.* anti-recurrence rules state UNVERIFIED
- **File:** `03-decisions/ADR-AR-anti-recurrence-state.md` (new)
- **Problem:** §42.13 — D005 LOCKED V1 says `Eliminate §AR.* meta-framework future`. §AR.26+§AR.30+§AR.31 codified D008/D009.
- **Fix:** Sample 03-decisions/_FROZEN/ folder; verify §AR.* state per ADR. Cross-ref DECISIONS.md.
- **Effort:** S

### §42-H2 — Slip flags monitored last 30 days root cause
- **File:** `08-workflows/slip-tracker.md` (new — already listed in HIGH-THETA but document is meta-ops; put in HIGH-KAPPA since no overlap with .github/workflows)
- **Problem:** §42.14 — slip pattern observed. Document recent slips + cross-link to D-NNN supersede chain.
- **Fix:** Running list — last 30 days slips + root cause analysis.
- **Effort:** S
- **⚠️ NOTE:** Same file claimed in HIGH-THETA — RESOLVE: keep file ownership here in HIGH-KAPPA (meta-ops doc); remove from HIGH-THETA description.

### §41-H1 — date-fns ABSENT (§41.12 + §11-H2)
- **File:** `package.json` + `08-workflows/dependency-audit.md` (new)
- **Problem:** §41.12+§11-H2 — date-fns not in deps; DST + week boundary need.
- **Fix:** Add date-fns dep (or document alternative). Per §11-H2 covered.
- **Effort:** S

### §41-H3 — Major version upgrades scheduled
- **File:** `package.json` + `08-workflows/dependency-audit.md` (cumulative)
- **Problem:** §41.16 — vite v5→v8 fix (§4-H1). Lucide-react `^1.16.0` is OLD npm release pre-2023 — possible version mismatch.
- **Fix:** Verify lucide-react actual installed version + naming. Pin to actual installed.
- **Effort:** S

### §41-H4 — Bundle size impact per dependency (top 10 weight contributors)
- **File:** `08-workflows/dependency-audit.md` (cumulative)
- **Problem:** §41.19 — main 432KB (engines + adapters bundled). React 72KB, Lucide 21KB, Zustand 0.6KB, Dexie chunked empty (§5-C2).
- **Fix:** Document top 10 weight contributors + bundle-analyzer report.
- **Effort:** S (doc) — depends on §5-C1 vendor split CRIT for actual fix

### §41-H2 — Bayesian math library NOT explicit
- **File:** `08-workflows/dependency-audit.md` (cumulative)
- **Problem:** §41.13 — custom Kalman filter in `src/engine/bayesianNutrition/kalmanFilter.js`. NO external math lib. OK for closed-form Conjugate Prior.
- **Fix:** Document rationale (custom OK for closed-form).
- **Effort:** S

### §40-H1 — DST week boundary handling
- **File:** `08-workflows/calendar-dst-test-cases.md` (new) + `src/react/stores/scheduleStore.ts` [verify]
- **Problem:** §40.8+§11-C1 — DST transition Oct/March at start of week — date math precision verify.
- **Fix:** Document test cases + verify scheduleStore.weekStartIso() across DST.
- **Effort:** S

### §40-H2 — Mid-week edits forward-only vs full-week clarification
- **File:** `08-workflows/calendar-dst-test-cases.md` (cumulative)
- **Problem:** §40.9 — Calendar7Day MVP default "full-week edits allowed". Spec says PENDING. Settled MVP = full-week.
- **Fix:** Document decision in doc.
- **Effort:** S

### §31-H2 — OAuth Phase 3 PENDING — verify NU partial wired
- **File:** `src/react/routes/screens/Auth.tsx` [READ verify only] + ADR note
- **Problem:** §31.9 — OAuth Phase 3 PENDING per PRIMER §3. Verify NO partial wired surface exposing.
- **Fix:** Audit Auth.tsx; confirm OK (no Google button visible currently).
- **Effort:** S (verify-only)

### §46-H1 — Self-critique pass: "did I miss something?"
- **File:** `08-workflows/audit-self-critique-template.md` (new)
- **Problem:** §46.7 — quaternary/quinary passes scheduled per §52. Document template for future audits.
- **Fix:** Capture self-critique pattern; document as audit-procedure addendum.
- **Effort:** S

### §47-H1 — Pending wording backlog 10 MMI button labels + Refuse banner + Diacritics strip
- **File:** `08-workflows/wording-backlog.md` (new — deferred per D024)
- **Problem:** §47.5 — D024 LOCKED V1 PERMANENT pre-Beta autonomous compose. Document pending items.
- **Fix:** Capture backlog list + reference D024 + defer post-Beta a-z review.
- **Effort:** S

### §49-H1 — claude rc Remote Control workflow upgrade
- **File:** `08-workflows/claude-rc-adoption.md` (new — optional)
- **Problem:** §49.8+§49.9 — claude rc Max plan LANDED Feb 2026. Adoption status UNVERIFIED.
- **Fix:** Document Daniel choice (hybrid §F3.13 vs claude rc). Optional given workflow choice.
- **Effort:** S (or N/A if Daniel decides not to document)

---

## Dispatch summary table

| Cluster | Findings | Files | Est | Theme | Dependencies |
|---------|---------|-------|-----|-------|--------------|
| HIGH-ALFA | 10 | 4 src + cross-pattern | 3-4h | Entry surfaces text+layout | none |
| HIGH-BETA | 11 | 6 cont/*.tsx + authStore RO | 5-6h | Cont tab user wiring + sub-screens | soft on §7-C3 auth listener (CRIT) |
| HIGH-GAMMA | 8 | 5 antrenor/*.tsx | 4-5h | Antrenor sub-screens parity | soft on HIGH-ALFA SubHeader |
| HIGH-DELTA | 8 | 4 Workout/* + 2 tests + 1 new component | 5-6h | Workout session + FSM coverage | soft on §14-C1 FSM (CRIT) |
| HIGH-EPSILON | 8 | 7 Antrenor+Progres components | ~5h | Antrenor home + Progres widgets | soft on weaknessDetector engine read |
| HIGH-ZETA | 8 | 4 new Confirm*.tsx + 4 lib RO | 5-6h | Confirm modals + engine wire verify | soft on §13-C1 Sentry (CRIT) |
| HIGH-ETA | 10 | 1 ADR + 5 engine RO + 1 test + 1 schema + MedicalDisclaimer RO | ~4h | Engine math ADR + Library schema + safety cues | none |
| HIGH-THETA | 10 | 1 .github/workflows + 7 new 08-workflows/*.md | 3-4h | CI/CD + Ops + DR docs | soft on §33-C1 test gate (CRIT) |
| HIGH-IOTA | 8 | 3 new lib + 1 new component + 2 lib RO + workbox config | 5-6h | Storage tiers + Network/Offline | soft on §36-C1 sync conflict (CRIT) |
| HIGH-KAPPA | 17 | 7 new 08-workflows/*.md + 1 package.json + ADR | 3-4h | Compliance + Personas + Deps docs | none |

**Total findings clustered:** 97 (all HIGH open covered)
**Wave-2 estimate parallel total:** ~42-50h cumulative if serial; 5-6h wall-clock if parallel across 10 agents

**Parallel safe wave-2 (no file overlap):**
[HIGH-ALFA, HIGH-BETA, HIGH-GAMMA, HIGH-DELTA, HIGH-EPSILON, HIGH-ZETA, HIGH-ETA, HIGH-THETA, HIGH-IOTA, HIGH-KAPPA]

All 10 clusters can spawn in parallel — file ownership exclusive verified.

**Cross-CRIT dependencies (soft — flag but spawn anyway):**
- HIGH-BETA → §7-C3 auth listener (Firebase Auth wire). Workaround: code defensively check listener present, no-op if absent.
- HIGH-DELTA §44-H2 → §14-C1 FSM discriminated union. Workaround: skip §44-H2 task, complete §44-H1+§44-H3 in cluster.
- HIGH-ZETA engine wire verify → §13-C1 Sentry. Workaround: defer instrumentation step, complete verify audit only.
- HIGH-THETA yaml hardening → §33-C1 test gate. Workaround: hardening yaml is additive — no conflict.
- HIGH-IOTA §36-H1 → §36-C1 sync conflict. Workaround: scaffold structure, mark "see §36-C1" comment.

**Ambiguities flagged:**

- **§42-H2 (slip tracker)** appears semantically in HIGH-THETA (ops/workflows) BUT file `08-workflows/slip-tracker.md` is also meta-doc for HIGH-KAPPA. **RESOLVED:** Owned by HIGH-KAPPA (meta-ops/audit doc theme). Removed from HIGH-THETA scope.

- **§F-onboarding-02 (Step 1 Obiectiv verbatim copy)** in HIGH-ALFA — actual verification depth requires Pass 2 Onboarding step-by-step audit beyond cluster scope. **FLAGGED 🚩:** Spawn agent should do best-effort step 1 verbatim verify within cluster time budget; deeper Pass 2 multi-step audit deferred to subsequent wave.

- **§50-H1 (Definition of Done)** listed in HIGH-THETA — semantically meta-ops doc, fits both HIGH-THETA (ops) and HIGH-KAPPA (compliance docs). **RESOLVED:** Kept in HIGH-THETA since DoD is operational gate close to CI/CD context.

- **§F-pass2-settings-profile-05 + §F-pass2-settings-appearance-02** are PROD-EXTRA drift findings (not strict mockup parity). Recommendation: KEEP with Co-CTO documentation rather than remove. Marked S effort (doc only).

- **§31-H2 (OAuth Phase 3 PENDING)** in HIGH-KAPPA — file is Auth.tsx [READ verify only] in HIGH-ALFA cluster. **RESOLVED:** verify-only, no edit; safe to keep in HIGH-KAPPA (documentation outcome).

- **§F-energy-cause-07 / §F-ceva-nu-merge-03 / §F-auth-05** all need shared `SubHeader.tsx` component. **RESOLVED:** SubHeader created in HIGH-ALFA; consumed in HIGH-GAMMA. Light cross-cluster sequencing — HIGH-ALFA first OR HIGH-GAMMA agent reads existing SubHeader if HIGH-ALFA lands first. Both can run parallel: HIGH-GAMMA creates own back button inline as fallback if SubHeader not yet landed.

- **§F-missing-confirms-all-7** likely covered by existing files in `src/react/routes/screens/cont/` (LogoutConfirm, DeleteAccountConfirm, ResetCoachConfirm, RedoOnboardingConfirm, SchimbaFazaConfirm + FinishEarlyConfirm) per directory listing. **FLAGGED 🚩:** Verify-only agent — likely most exist; just confirm routes registered + copy correct.

- **§31-H3 (Multi-device auth)** in HIGH-BETA but file is `src/react/routes/screens/cont/SettingsDanger.tsx` (logout handler). Blocked by §7-C3 (Firebase Auth listener missing). **FLAGGED 🚩:** Soft-dependency on CRIT wave. Agent should scope logout handler comprehensive cleanup only; defer cross-device until §7-C3 lands.
