# Prod React routes registry — `src/react/routes/`

**Source:** `src/react/routes/router.tsx` + `src/react/routes/screens/`
**Generated:** 2026-05-20 (Pass 1 §1.2 pre-flight audit Mockup vs Prod Parity)

## Route definitions (router.tsx)

Top-level (no `/app` prefix, no bottom nav):

| Path | Component | File | Line |
|------|-----------|------|------|
| `/` | `<Splash />` | `screens/Splash.tsx` | router.tsx:41 |
| `/auth` | `<Auth />` | `screens/Auth.tsx` | router.tsx:42 |
| `/auth/reactivate` | `<Auth />` | `screens/Auth.tsx` (same) | router.tsx:43 |
| `/auth-callback` | `<AuthCallback />` | `screens/AuthCallback.tsx` | router.tsx:44 (iter 9.6 LANDED `07685c6`) |
| `/onboarding/:step` | `<Onboarding />` | `screens/Onboarding.tsx` | router.tsx:45 (single component multi-step) |

Nested under `/app` (Layout wrapper + bottom nav 4 taburi + ProtectedRoute):

### Antrenor tab (`/app/antrenor/*` — 12 routes)

| Path | Component | File |
|------|-----------|------|
| `/app/antrenor` (index) | `<Antrenor />` | `screens/antrenor/Antrenor.tsx` |
| `/app/antrenor/energy-check` | `<EnergyCheck />` | `antrenor/EnergyCheck.tsx` |
| `/app/antrenor/energy-cause` | `<EnergyCause />` | `antrenor/EnergyCause.tsx` |
| `/app/antrenor/workout-preview` | `<WorkoutPreview />` | `antrenor/WorkoutPreview.tsx` |
| `/app/antrenor/workout` | `<Workout />` | `antrenor/Workout.tsx` |
| `/app/antrenor/ceva-nu-merge` | `<CevaNuMerge />` | `antrenor/CevaNuMerge.tsx` |
| `/app/antrenor/pain-button` | `<PainButton />` | `antrenor/PainButton.tsx` |
| `/app/antrenor/equipment-swap` | `<EquipmentSwap />` | `antrenor/EquipmentSwap.tsx` |
| `/app/antrenor/aparate-lipsa` | `<AparateLipsa />` | `antrenor/AparateLipsa.tsx` |
| `/app/antrenor/schedule-override` | `<ScheduleOverride />` | `antrenor/ScheduleOverride.tsx` |
| `/app/antrenor/post-rpe` | `<PostRpe />` | `antrenor/PostRpe.tsx` |
| `/app/antrenor/post-summary` | `<PostSummary />` | `antrenor/PostSummary.tsx` |

### Progres tab (`/app/progres/*` — 3 routes)

| Path | Component | File |
|------|-----------|------|
| `/app/progres` (index) | `<Progres />` | `progres/Progres.tsx` |
| `/app/progres/log-weight` | `<LogWeight />` | `progres/LogWeight.tsx` |
| `/app/progres/body-data` | `<BodyData />` | `progres/BodyData.tsx` (NOTE: NOT in mockup as own screen) |

### Istoric tab (`/app/istoric/*` — 2 routes)

| Path | Component | File |
|------|-----------|------|
| `/app/istoric` (index) | `<Istoric />` | `istoric/Istoric.tsx` |
| `/app/istoric/:sessionId` | `<IstoricDetail />` | `istoric/IstoricDetail.tsx` (NOTE: dynamic param, not in mockup as own screen) |

### Cont tab (`/app/cont/*` — 10 routes)

| Path | Component | File |
|------|-----------|------|
| `/app/cont` (index) | `<Cont />` | `cont/Cont.tsx` |
| `/app/cont/settings-profile` | `<SettingsProfile />` | `cont/SettingsProfile.tsx` |
| `/app/cont/settings-notifications` | `<SettingsNotifications />` | `cont/SettingsNotifications.tsx` |
| `/app/cont/settings-subscription` | `<SettingsSubscription />` | `cont/SettingsSubscription.tsx` |
| `/app/cont/settings-appearance` | `<SettingsAppearance />` | `cont/SettingsAppearance.tsx` |
| `/app/cont/settings-prefs` | `<SettingsPrefs />` | `cont/SettingsPrefs.tsx` |
| `/app/cont/settings-privacy` | `<SettingsPrivacy />` | `cont/SettingsPrivacy.tsx` |
| `/app/cont/settings-terms` | `<SettingsTerms />` | `cont/SettingsTerms.tsx` |
| `/app/cont/settings-export` | `<SettingsExport />` | `cont/SettingsExport.tsx` |
| `/app/cont/settings-danger` | `<SettingsDanger />` | `cont/SettingsDanger.tsx` |

## Component file inventory

Total React `.tsx` components în `src/react/routes/screens/`: **31**

Breakdown:
- Top-level: 4 (Splash, Auth, AuthCallback, Onboarding)
- antrenor/: 12
- progres/: 3
- istoric/: 2
- cont/: 10

## Layout + ProtectedRoute wrappers

- `Layout.tsx` — bottom nav 4 taburi + `<Outlet />` for nested route content
- `ProtectedRoute.tsx` — auth guard (redirects to `/auth` if not authenticated; §7-C3 additive useEffect)

## Coverage gap preview (vs mockup 50 screens)

**Routes count: 31 React components vs 50 mockup screens = 62% nominal coverage**

(NB: nominal — does NOT account for PARTIAL completeness of each screen.
Real parity per-screen LANDED depth measured în §2 per-screen comparison.)

### Missing entire React routes (mapping pass-1):

**Onboarding sub-screens (6 missing as separate routes):**
- `screen-onb-varsta` — collapsed into `Onboarding.tsx` step machine (NOT separate route)
- `screen-onb-sex` — same (in step machine)
- `screen-onb-inaltime` — same
- `screen-onb-greutate` — same
- `screen-onb-medical` — same
- `screen-onb-frecventa` — same

(Verdict: COLLAPSED — single `<Onboarding />` multi-step component vs 6 individual screens în mockup. Need component check vs mockup to verify all 6 step UIs present.)

**Auth-reactivate (1 missing as separate route):**
- `screen-auth-reactivate` — `/auth/reactivate` routes to same `<Auth />` component, NU separate screen. Likely PARTIAL (Auth doesn't handle reactivate-specific flow).

**Antrenor sub-screens (1 missing):**
- `screen-log-weight` — în mockup linked from Antrenor flow BUT only `/app/progres/log-weight` exists (under Progres). Mockup has it under Antrenor flow via "Logheaza greutate" CTA on `screen-progres`. Verdict: LANDED under different tab.

**Istoric sub-screens (4 MISSING):**
- `screen-pr-wall` — Personal Records wall — MISSING (no React component)
- `screen-sesiuni-recente` — recent sessions list — MISSING (Istoric.tsx is index but no sub-route for full list)
- `screen-loguri-greutate` — weight logs list — MISSING
- `screen-weight-timeline` — weight & BF timeline chart — MISSING

**Cont/Settings sub-screens (4 MISSING):**
- `screen-settings-themes` — themes picker (Andura Clasic / others) — MISSING (no `SettingsThemes.tsx`)
- `screen-settings-support` — support help — MISSING
- `screen-settings-about` — about app — MISSING
- `screen-settings-faq` — FAQ list — MISSING

**Confirm modals (7 MISSING):**
- `screen-confirm-reset-coach` — MISSING (likely inline modal NOT route)
- `screen-confirm-schimba-faza` — MISSING
- `screen-confirm-redo-onboarding` — MISSING
- `screen-confirm-logout` — MISSING
- `screen-confirm-delete` — MISSING
- `screen-confirm-program-change` — MISSING
- `screen-confirm-finish-early` — MISSING

(Verdict pending §2: confirm modals în mockup are full-screen, în React likely intended as overlay modals. Either way 7 distinct UI surfaces to verify.)

## Summary nominal gap

- Mockup: 50 actual screens (+ 1 wrapper)
- Prod React: 31 routed components
- **Missing routes: 4 (Istoric subs) + 4 (Cont subs) + 7 (confirm modals) = 15 absent surfaces**
- **Collapsed: 6 onboarding sub-screens into 1 multi-step component (NEED verify all 6 step UIs present)**
- **Auth-reactivate: 1 PARTIAL (same component, different intent)**
- **Bonus: BodyData prod (NOT în mockup as separate screen)**

**Nominal coverage: 31/50 = 62% route-level. Real depth-coverage TBD via §2 per-screen comparison.**
