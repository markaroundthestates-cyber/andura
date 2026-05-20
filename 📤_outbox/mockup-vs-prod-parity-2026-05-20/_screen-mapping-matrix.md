# Mockup → Prod screen mapping matrix

**Source:** Cross-reference `_mockup-screens-registry.md` (50 mockup screens) × `_prod-routes-registry.md` (31 React routes)
**Generated:** 2026-05-20 (Pass 1 §1.3 pre-flight audit Mockup vs Prod Parity)

## Legend

- **LANDED** = React route exists + component file present (depth-coverage assessed în §2)
- **PARTIAL** = React route exists but component is incomplete OR collapsed multi-purpose
- **MISSING** = NO React component OR route
- **RENAMED** = exists under different path (mismatch că needs verification)
- **MODAL** = mockup screen NU intended as full route în prod (overlay/modal expected)

## Matrix

### Pre-app guest flow (10 mockup)

| Mockup screen | Prod route | Component | Status |
|--------------|------------|-----------|--------|
| `screen-splash` | `/` | `Splash.tsx` | **LANDED** |
| `screen-auth` | `/auth` | `Auth.tsx` | **LANDED** |
| `screen-auth-reactivate` | `/auth/reactivate` | `Auth.tsx` (shared) | **PARTIAL** (same component, separate intent NOT honored) |
| `screen-onboard` | `/onboarding/0` (presumed) | `Onboarding.tsx` (multi-step) | **PARTIAL** (collapsed into step machine, verify step 0 UI) |
| `screen-onb-varsta` | `/onboarding/1` | `Onboarding.tsx` (step) | **PARTIAL** (collapsed) |
| `screen-onb-sex` | `/onboarding/2` | `Onboarding.tsx` (step) | **PARTIAL** (collapsed) |
| `screen-onb-inaltime` | `/onboarding/3` | `Onboarding.tsx` (step) | **PARTIAL** (collapsed) |
| `screen-onb-greutate` | `/onboarding/4` | `Onboarding.tsx` (step) | **PARTIAL** (collapsed) |
| `screen-onb-medical` | `/onboarding/5` | `Onboarding.tsx` (step) | **PARTIAL** (collapsed) |
| `screen-onb-frecventa` | `/onboarding/6` | `Onboarding.tsx` (step) | **PARTIAL** (collapsed) |

Pre-app verdict: 1 LANDED + 1 LANDED (auth) + 1 PARTIAL (auth-reactivate) + 7 PARTIAL collapsed (onboarding).

### Bottom nav 4 taburi main entries

| Mockup screen | Prod route | Component | Status |
|--------------|------------|-----------|--------|
| `screen-antrenor` | `/app/antrenor` (index) | `antrenor/Antrenor.tsx` | **LANDED** |
| `screen-progres` | `/app/progres` (index) | `progres/Progres.tsx` | **LANDED** |
| `screen-istoric` | `/app/istoric` (index) | `istoric/Istoric.tsx` | **LANDED** |
| `screen-settings` | `/app/cont` (index) | `cont/Cont.tsx` | **LANDED** (mockup `settings` data-tab ↔ prod `cont` path = RENAMED label) |

### Antrenor sub-screens (12)

| Mockup screen | Prod route | Component | Status |
|--------------|------------|-----------|--------|
| `screen-energy-check` | `/app/antrenor/energy-check` | `antrenor/EnergyCheck.tsx` | **LANDED** |
| `screen-energy-cause` | `/app/antrenor/energy-cause` | `antrenor/EnergyCause.tsx` | **LANDED** |
| `screen-workout-preview` | `/app/antrenor/workout-preview` | `antrenor/WorkoutPreview.tsx` | **LANDED** |
| `screen-workout` | `/app/antrenor/workout` | `antrenor/Workout.tsx` | **LANDED** |
| `screen-ceva-nu-merge` | `/app/antrenor/ceva-nu-merge` | `antrenor/CevaNuMerge.tsx` | **LANDED** |
| `screen-pain-button` | `/app/antrenor/pain-button` | `antrenor/PainButton.tsx` | **LANDED** |
| `screen-equipment-swap` | `/app/antrenor/equipment-swap` | `antrenor/EquipmentSwap.tsx` | **LANDED** |
| `screen-aparate-lipsa` | `/app/antrenor/aparate-lipsa` | `antrenor/AparateLipsa.tsx` | **LANDED** |
| `screen-schedule-override` | `/app/antrenor/schedule-override` | `antrenor/ScheduleOverride.tsx` | **LANDED** |
| `screen-post-rpe` | `/app/antrenor/post-rpe` | `antrenor/PostRpe.tsx` | **LANDED** |
| `screen-post-summary` | `/app/antrenor/post-summary` | `antrenor/PostSummary.tsx` | **LANDED** |
| `screen-log-weight` | `/app/progres/log-weight` | `progres/LogWeight.tsx` | **RENAMED** (in mockup linked from Antrenor flow + Progres; in prod under Progres only) |

Antrenor verdict: **12 LANDED** (incl 1 RENAMED to /progres path).

### Istoric sub-screens (4)

| Mockup screen | Prod route | Component | Status |
|--------------|------------|-----------|--------|
| `screen-pr-wall` | — | — | **MISSING** (no React component PR wall) |
| `screen-sesiuni-recente` | — | — | **MISSING** (Istoric.tsx index but no full list sub-route) |
| `screen-loguri-greutate` | — | — | **MISSING** (no weight logs list component) |
| `screen-weight-timeline` | — | — | **MISSING** (no weight & BF timeline chart) |

Istoric verdict: **4 MISSING**. Note: `IstoricDetail.tsx` exists for `/app/istoric/:sessionId` dynamic but NU mapează la oricare mockup screen direct (session detail = drill-down NU în mockup as standalone screen).

### Cont/Settings sub-screens (13)

| Mockup screen | Prod route | Component | Status |
|--------------|------------|-----------|--------|
| `screen-settings-profile` | `/app/cont/settings-profile` | `cont/SettingsProfile.tsx` | **LANDED** |
| `screen-settings-notifications` | `/app/cont/settings-notifications` | `cont/SettingsNotifications.tsx` | **LANDED** |
| `screen-settings-subscription` | `/app/cont/settings-subscription` | `cont/SettingsSubscription.tsx` | **LANDED** |
| `screen-settings-appearance` | `/app/cont/settings-appearance` | `cont/SettingsAppearance.tsx` | **LANDED** |
| `screen-settings-themes` | — | — | **MISSING** (themes picker absent) |
| `screen-settings-prefs` | `/app/cont/settings-prefs` | `cont/SettingsPrefs.tsx` | **LANDED** |
| `screen-settings-privacy` | `/app/cont/settings-privacy` | `cont/SettingsPrivacy.tsx` | **LANDED** |
| `screen-settings-terms` | `/app/cont/settings-terms` | `cont/SettingsTerms.tsx` | **LANDED** |
| `screen-settings-danger` | `/app/cont/settings-danger` | `cont/SettingsDanger.tsx` | **LANDED** |
| `screen-settings-export` | `/app/cont/settings-export` | `cont/SettingsExport.tsx` | **LANDED** |
| `screen-settings-support` | — | — | **MISSING** |
| `screen-settings-about` | — | — | **MISSING** |
| `screen-settings-faq` | — | — | **MISSING** |

Cont verdict: **9 LANDED + 4 MISSING** (themes / support / about / faq).

### Confirm modals (7)

| Mockup screen | Prod route | Component | Status |
|--------------|------------|-----------|--------|
| `screen-confirm-reset-coach` | — | — | **MODAL** (mockup full-screen; prod expected overlay — verify) |
| `screen-confirm-schimba-faza` | — | — | **MODAL** |
| `screen-confirm-redo-onboarding` | — | — | **MODAL** |
| `screen-confirm-logout` | — | — | **MODAL** |
| `screen-confirm-delete` | — | — | **MODAL** |
| `screen-confirm-program-change` | — | — | **MODAL** |
| `screen-confirm-finish-early` | — | — | **MODAL** |

Confirm verdict: **7 MODAL** (none have React component yet — likely intended as overlay modals via `components/modalManager.js` system, NOT separate routes; status TBD §2 verify if inline modals exist în target routes).

### Bonus prod routes NOT în mockup

| Prod route | Component | Notes |
|-----------|-----------|-------|
| `/auth-callback` | `AuthCallback.tsx` | NEW iter 9.6 — Magic Link verify handler |
| `/app/progres/body-data` | `BodyData.tsx` | NU în mockup; intent unclear (body metrics edit?) |
| `/app/istoric/:sessionId` | `IstoricDetail.tsx` | Dynamic route session drill-down; NU în mockup as standalone |

## Status summary

| Status | Count | % |
|--------|-------|---|
| LANDED | 27 | 54% (27/50 mockup) |
| PARTIAL | 8 | 16% (1 auth-reactivate + 7 onboarding collapsed) |
| RENAMED | 1 | 2% (log-weight under /progres not /antrenor) |
| MISSING | 8 | 16% (4 Istoric + 4 Cont) |
| MODAL | 7 | 14% (confirms — overlay expected, NOT route) |

**Route-level summary: 27 LANDED + 8 PARTIAL + 1 RENAMED = 36/50 = 72% present as ANY surface** (excluding 7 MODAL pending verify).

**Strict route-only coverage: 27 LANDED / 50 mockup = 54% confirmed LANDED routes.**

(Final parity % requires §2 per-screen depth comparison — even LANDED routes may be skeleton-only with missing components/text/tokens vs mockup.)

## Screens to audit în §2 Pass 1 (priority order)

**Wave A (high-traffic main entries — Beta blocker priority):**
1. `splash` — first-load landing
2. `auth` — login entry
3. `antrenor` (index) — main tab default
4. `progres` (index)
5. `istoric` (index)
6. `cont` (index)

**Wave B (Antrenor flow critical path):**
7. `energy-check`
8. `energy-cause`
9. `workout-preview`
10. `workout`
11. `post-rpe`
12. `post-summary`

**Wave C (Antrenor secondary):**
13. `ceva-nu-merge`
14. `pain-button`
15. `equipment-swap`
16. `aparate-lipsa`
17. `schedule-override`
18. `log-weight`

**Wave D (Cont sub-screens drill-downs):**
19-27. `settings-profile/notifications/subscription/appearance/prefs/privacy/terms/danger/export` (9)

**Wave E (PARTIAL onboarding deep-dive):**
28-34. `onboard + onb-varsta/sex/inaltime/greutate/medical/frecventa` (7 — verify all step UIs present în multi-step Onboarding.tsx)

**Wave F (MISSING surfaces — confirm absent + estimate impact):**
35-42. Istoric (4) + Cont (4) — log absence + recommend Beta blocker yes/no

**Wave G (MODAL confirms — verify implementation):**
43-49. 7 confirm modals — check if `modalManager` triggers exist

Total Pass 1 scope: ~50 surfaces (matches mockup screen count).
