# AUDIT-2 — React Presentation Layer (Nuclear, line-by-line)

**Date:** 2026-05-26
**Scope:** `src/react/routes/**` (all screens + sub-screens), `src/react/components/**`, `src/styles/` (global.css + theme tokens).
**Method:** Every file read in full, line by line. No sampling.
**Note:** No `src/react/styles/` dir exists; CSS lives in `src/styles/` (audited `global.css`; `main.css`/`theme-*.css` are vanilla-legacy, out of React slice).

---

## (1) Coverage — every file read

### Routing shell (4)
- `routes/router.tsx`, `routes/Layout.tsx`, `routes/ProtectedRoute.tsx`, `components/BottomNav.tsx`

### Top-level screens (4)
- `routes/screens/Splash.tsx`, `Auth.tsx`, `AuthCallback.tsx`, `Onboarding.tsx`

### Antrenor flow (15)
- `Antrenor.tsx`, `EnergyCheck.tsx`, `EnergyCause.tsx`, `WorkoutPreview.tsx`, `Workout.tsx`, `CevaNuMerge.tsx`, `PainButton.tsx`, `EquipmentSwap.tsx`, `AparateLipsa.tsx`, `ScheduleOverride.tsx`, `PostRpe.tsx`, `PostSummary.tsx`, `FinishEarlyConfirm.tsx`, `ProgramChangeConfirm.tsx`

### Progres (5)
- `Progres.tsx`, `LogWeight.tsx`, `BodyData.tsx`, `WeightLogList.tsx`, `WeightTimeline.tsx`

### Istoric (3)
- `Istoric.tsx`, `IstoricDetail.tsx`, `PrWall.tsx`

### Cont (21)
- `Cont.tsx`, `userProfile.ts`, `SettingsProfile.tsx`, `SettingsNotifications.tsx`, `SettingsSubscription.tsx`, `SettingsAppearance.tsx`, `SettingsPrefs.tsx`, `SettingsPrivacy.tsx`, `SettingsTerms.tsx`, `SettingsExport.tsx`, `SettingsDanger.tsx`, `SettingsAbout.tsx`, `SettingsSupport.tsx`, `SettingsFaq.tsx`, `SettingsThemes.tsx`, `LogoutConfirm.tsx`, `DeleteAccountConfirm.tsx`, `ResetDataConfirm.tsx`, `RedoOnboardingConfirm.tsx`, `SchimbaFazaConfirm.tsx`, `ResetCoachConfirm.tsx`

### Components — shared/modals (10)
- `SubHeader.tsx`, `MedicalDisclaimerModal.tsx`, `AaFrictionModal.tsx`, `Toast.tsx`, `Toggle.tsx`, `ErrorBoundary.tsx`, `OfflineBanner.tsx`, `InstallPrompt.tsx`, `UpdatePrompt.tsx`, `LoadingSkeleton.tsx`, `SessionPill.tsx`

### Components — Workout (7)
- `ExitConfirmSheet.tsx`, `RestOverlay.tsx`, `SetLogInput.tsx`, `SetRatingButtons.tsx`, `SessionTimer.tsx`, `SessionElapsed.tsx`, `SVGCountdownRing.tsx`, `InactivityPrompt.tsx`

### Components — Antrenor (11)
- `CoachTodayCard.tsx`, `CoachRestCard.tsx`, `ResumeSessionCard.tsx`, `ReactivateCard.tsx`, `ReadinessVerdict.tsx`, `StatsGrid.tsx`, `PRNotificationBanner.tsx`, `PatternsBanner.tsx`, `AlertsBanner.tsx`, `PRWallRecent.tsx`, `ObiectivSelector.tsx`

### Components — Progres/Istoric/misc (8)
- `Calendar7Day.tsx`, `NutritionInline.tsx`, `Progres/TDEEStrip.tsx`, `Progres/FatigueStrip.tsx`, `Progres/BMRStrip.tsx`, `Progres/HeatMapWeekly.tsx`, `Istoric/CalendarHeatmap.tsx`, `Istoric/RatingsStrip90Day.tsx`, `Istoric/VirtualSessionList.tsx`

### Styles (1)
- `styles/global.css` (+ `db.js` cross-check for storage-key prefixes)

**Total: ~89 React files + global.css read in full.**

---

## (2) Findings

### CRITICAL
*(none — no crash-on-load, no data-loss-on-happy-path, no broken auth gate)*

### HIGH

| # | Finding | path:line |
|---|---------|-----------|
| H-1 | **"Reseteaza toate datele" is an incomplete wipe — false promise.** `wipeAllLocalData()` only removes store state + `localStorage` keys with the `wv2-` prefix. Engine data is written via `db.js` with **unprefixed** keys (`logs`, `pr-records`, `pain-cdl`, `coach-decisions`). Screen tells the user "Toate antrenamentele, evaluarile + masuratorile locale vor fi sterse" + "nu poate fi anulata", but PR history, raw logs and pain CDL survive. PR Wall + engine signals still read stale data after a "full" reset. | `routes/screens/cont/ResetDataConfirm.tsx:25-30` (vs `db.js:16-30` raw keys; cf. honest `SettingsExport.tsx:25-29` LEGACY_DATA_KEYS list) |
| H-2 | **`SettingsThemes` lies: "Se aplica instant" but nothing applies.** 3 of 4 palettes (Living Body / Luxury / Brain Coach) only write `wv2-palette-theme` to localStorage; comment confirms "Actual CSS theme runtime swap = deferred post-Beta". Gigel picks "Luxury", sees a green check, but the UI is unchanged. Shipped placeholder presented as functional. | `routes/screens/cont/SettingsThemes.tsx:1-10, 79-95` |
| H-3 | **`SettingsNotifications` is a fully non-functional control panel.** Master toggle, frequency, day-picker, time, 5 per-event toggles, quiet-hours all render and persist, but header admits "ZERO actual notification dispatch (Phase 7+)". No notification will ever fire from any of these. Quiet hours "22:00 — 07:00" is hardcoded static text, not a setting. Large surface of dead controls for a "FULL strict pre-Beta" gate. | `routes/screens/cont/SettingsNotifications.tsx:1-6, 295-306` |
| H-4 | **"Aparate lipsa" reached from Cont dumps the user into the workout flow.** Cont › General › "Aparate lipsa" routes to the same `aparate-lipsa` screen used mid-workout. Its Save handler always `navigate('workout-preview')` and propagates `missingEquipment` via `location.state` — which **no consumer reads** and which is never persisted. From the settings context this is a wrong-flow dead-end: user lands on a workout preview unexpectedly and nothing was saved, despite copy "Coach-ul ... nu le va propune in viitor". | `routes/screens/cont/Cont.tsx:58` + `routes/screens/antrenor/AparateLipsa.tsx:64-69, 84-86` |

### MEDIUM

| # | Finding | path:line |
|---|---------|-----------|
| M-1 | **No 404 / catch-all route + no router-level errorElement.** `createBrowserRouter` has no `path: '*'` and no `errorElement`. An unknown/stale URL renders React Router's bare default error page (white screen), not an Andura fallback. (Top-level routes have ErrorBoundary for render crashes, but routing misses are unhandled.) | `routes/router.tsx:129-216` |
| M-2 | **EquipmentSwap dead data flow + placeholder equipment list.** Equipment list is a hardcoded demo (bench/smith/lat-pulldown…) unrelated to the planned session; `equipmentContext.busy` is propagated to workout-preview but **no consumer reads it** (grep: only EquipmentSwap writes it). "Coach gaseste alternative" → nothing changes. | `routes/screens/antrenor/EquipmentSwap.tsx:35-41, 57-62` |
| M-3 | **FatigueStrip + RatingsStrip90Day break in dark theme.** Both use hardcoded `bg-white` (DRIFT-2 "mockup literal") instead of `bg-paper2`. Theme IS applied via `data-theme` (themeSync.ts), so in dark mode these render solid white cards on a dark page — jarring + low-contrast against neighbors. | `components/Progres/FatigueStrip.tsx:34` + `components/Istoric/RatingsStrip90Day.tsx:87` |
| M-4 | **SettingsProfile silently discards composition + target fields.** Talie, Gat, Greutate-tinta, "Pana in" are local-only `useState` (comment: "persistence Phase 7+"). On "Confirma editare" only the onboardingStore Big-6+height save; the rest vanish on navigation, yet the user sees "Profil salvat". False-save perception. | `routes/screens/cont/SettingsProfile.tsx:65-68, 83-84, 92-121` |
| M-5 | **Intensity copy mismatch -20% vs ±15%.** WorkoutPreview "minus" banner hardcodes "-20%", ScheduleOverride "Mai usor" says "-20%", but the Energy Adjustment spec/other copy is ±15% (EnergyCheck "+15%"). Engine math also uses 0.8 (−20%) for kg but 1.15 (+15%) up — asymmetric magnitudes shown to user inconsistently. | `routes/screens/antrenor/WorkoutPreview.tsx:53-58` + `ScheduleOverride.tsx:37-38` + `Workout.tsx:119-124` |
| M-6 | **GDPR backup region copy contradiction.** FAQ says "Firebase eu-central-1"; Privacy says "europe-west1 EU". Two different stated data-residency regions in user-facing GDPR copy. | `routes/screens/cont/SettingsFaq.tsx:50` vs `SettingsPrivacy.tsx:144-148, 159-161` |
| M-7 | **English jargon in core RO UI ("Streak", "Readiness").** Antrenor StatsGrid + ReadinessVerdict surface "Streak" and "Readiness" verbatim. Gigel (non-tech RO persona) likely won't parse these. Persona-fit concern on the primary screen. | `components/Antrenor/StatsGrid.tsx:29, 43` + `ReadinessVerdict.tsx` (label from engine) |
| M-8 | **PrWall rows show a ChevronRight affordance but aren't tappable.** Each PR row renders `ChevronRight` (drill-down affordance) inside a non-interactive `<li>` (no button/onClick); drill-down is "deferred post-Beta". Misleading affordance — Gigel taps, nothing happens. | `routes/screens/istoric/PrWall.tsx:91-107` |
| M-9 | **"Ceva nu merge" reachable from Cont › Ajutor lands in workout-triage.** Cont help row routes to `ceva-nu-merge` (pain/equipment/override triage designed for in-session). Outside a session its options route further into the workout flow — confusing entry point from a Help menu. | `routes/screens/cont/Cont.tsx:79` + `routes/screens/antrenor/CevaNuMerge.tsx:41-48` |

### LOW

| # | Finding | path:line |
|---|---------|-----------|
| L-1 | RatingsStrip90Day "Usor" count is rendered in the **greu** color token (`text-heatGreu`, deep green) while cells use `bg-ratingUsor`. Likely copy-paste; color/semantic mismatch. | `components/Istoric/RatingsStrip90Day.tsx:113` |
| L-2 | CalendarHeatmap legend shows a **"Recuperare"** swatch (`bg-heatRecovery`) but no cell ever paints that tier (`ratingToTierClass` only emits l1/l2/l3/zi-libera). Dead legend entry. | `components/Istoric/CalendarHeatmap.tsx:49-53, 226-232` |
| L-3 | Logout copy contradiction: SettingsDanger sub-text "Datele raman pe telefon." vs LogoutConfirm body "Datele tale raman salvate pe email." Same action, two different claims. | `routes/screens/cont/SettingsDanger.tsx:55-56` vs `LogoutConfirm.tsx:50-53` |
| L-4 | AuthCallback `error` state UI ("Eroare la verificare") never visibly shows — the effect navigates away in the same tick, so the spinner→error transition is unobservable. The branch is effectively dead UI. | `routes/screens/AuthCallback.tsx:51-52, 100-115` |
| L-5 | Onboarding Step 8 summary has no per-field edit links; to fix an early field (e.g. age) the user must press "Inapoi" up to 7 times. Minor friction. | `routes/screens/Onboarding.tsx:543-559` |
| L-6 | FAQ "Cum schimb programul?" references "pencil pe cardul **Saptamana**" but the card title is "Program de antrenament". Copy drift (pencil exists, name wrong). Also FAQ uses "RPE" jargon to Gigel. | `routes/screens/cont/SettingsFaq.tsx:29, 36` vs `components/Calendar7Day.tsx:71` |
| L-7 | InactivityPrompt has `role="dialog"` but no focus management/trap/Escape (unlike sibling modals). It's non-blocking so impact is minor, but inconsistent with the modal a11y pattern used everywhere else. | `components/Workout/InactivityPrompt.tsx:30-72` |
| L-8 | VirtualSessionList resolves drill-down `originalIdx` via `findIndex(s => s.ts === session.ts)`; two sessions with identical `ts` (rapid same-ms finish) would always open the first. Edge case. | `components/Istoric/VirtualSessionList.tsx:147` |

### NIT

| # | Finding | path:line |
|---|---------|-----------|
| N-1 | Multiple `fixed` top-anchored banners can co-exist: OfflineBanner (`top-0`) + UpdatePrompt (`top-2`) → visual overlap if both show. Bottom stack (Toast `bottom-20`, SessionPill `bottom-[80px]`, InstallPrompt `bottom-20`) similarly can overlap when concurrent. | `Layout.tsx:60-62` + `Toast.tsx:114` + `SessionPill.tsx:126` + `InstallPrompt.tsx:66` |
| N-2 | ScheduleOverride propagates `overrideKind` in route state but only `intensityMod` is consumed downstream; `overrideKind` (and EnergyCause `cause`, PainButton fully wired but cause-of-energy not) is cosmetic-only state. | `routes/screens/antrenor/ScheduleOverride.tsx:53-56` |
| N-3 | `Onboarding` `Step` type is `1..8` but file/comment headers still say "Big 6 / 7-step" in places (now 8 steps incl. height + summary). Stale comments only. | `routes/screens/Onboarding.tsx:1-4, 21-23` |

---

## (3) Daniel questions — unreachable / broken / half-built

**Unreachable screens / nav dead-ends:**
- No screen is orphaned — every `router.tsx` route has a reachable entry point (verified each `gotoPath`/`navigate` linkpoint).
- **No 404 handling** (M-1): a wrong/stale URL → React Router default white error page, not an Andura screen.

**Wrong-flow / context-mismatch dead-ends (the real issue):**
- **"Aparate lipsa" from Cont (H-4)** dumps the user into `workout-preview` after "save", and the setting isn't persisted anyway.
- **"Ceva nu merge" from Cont › Ajutor (M-9)** opens the in-session triage outside any session.

**Half-built / placeholder UI shipping as if functional:**
- **SettingsNotifications (H-3)** — entire panel is non-functional (no dispatch).
- **SettingsThemes (H-2)** — "Se aplica instant" but 3/4 palettes do nothing.
- **EquipmentSwap (M-2)** — demo equipment list + dead `equipmentContext`.
- **AparateLipsa (H-4)** — `missingEquipment` never persisted/read; copy promises future behavior that doesn't exist.
- **SettingsProfile composition/targets (M-4)** — Talie/Gat/target-weight/target-month silently discarded.
- **PrWall rows (M-8)** — chevron implies tappable drill-down that doesn't exist.

**Data-integrity:**
- **ResetDataConfirm (H-1)** — "reset all" leaves engine logs/PRs/pain-cdl behind. (DeleteAccount does a full `localStorage.clear()` — correct; only the Reset path is partial.)

---

## (4) Readiness — this slice

**~80%.**

The core flows (splash → auth → onboarding → 4 tabs → full workout state machine → post-session → history) are genuinely Bugatti-grade: thorough loading/empty/error states, proper modal focus traps, WCAG focus-visible, aria-live, persona scaling, honest engine wiring, and dark-theme tokens. What blocks the last ~20% is a cluster of **placeholder UI presented as functional** (Notifications, Themes, EquipmentSwap, AparateLipsa, SettingsProfile composition fields) plus a **false-promise data reset** (H-1) and a **wrong-flow Cont→workout dead-end** (H-4) — each fails the Gigel filter ("I pressed save, why did nothing happen / why am I in a workout?"). None crash the app, but several quietly lie to the user, which is the opposite of the trust this product sells.
