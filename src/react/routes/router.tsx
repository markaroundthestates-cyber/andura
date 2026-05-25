// ══ ROUTER CONFIG — Phase 2 Skeleton C Hybrid + Phase 3 Antrenor Sub-Routes ═
// Top-level NU bottom nav: /, /auth, /auth/reactivate, /onboarding/:step
// Nested per-tab cu bottom nav: /app/{antrenor,progres,istoric,cont}
// Phase 3 Antrenor sub-screens nested sub /app/antrenor/<screen>.
//
// §B007/D-3 audit fix (D046 §3.3) — Bundle code-split via React.lazy() pentru
// non-critical sub-routes. Sub-screens (Antrenor 11 + Cont 9 + Progres 2 +
// Istoric detail 1 = 23 total) load on-demand via dynamic import. Maria 65 3G
// LCP improved.
//
// BUNDLE-CI-RED perf-infra — 4 tab home (Antrenor/Progres/Istoric/Cont) flipped
// eager → lazy. Eager-importing them shipped tab code in the main chunk at
// first paint, pushing main-*.js +5.5KB over the 135KB gzip budget. They sit
// behind ProtectedRoute (anon redirect → /auth) so they never render before
// the Splash/Auth lazy chunks anyway. Lazy split returns main under budget.
//
// ROUTE_LAZY_LOAD_INVESTIGATION chat 5 HIGH ROI #1 — Splash + Auth +
// AuthCallback + Onboarding lazy (one-time-entry flow per session, NU primary
// daily tab). Main bundle shrink ~15-25 KB raw / ~6-10 KB gzip estimated.

import { lazy, Suspense } from 'react';
import type { JSX, ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from './Layout';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorBoundary } from '../components/ErrorBoundary';

// 4 tab home lazy (bottom-nav primary entry — daily-use Antrenor/Progres/
// Istoric/Cont). ProtectedRoute wraps, redirect anon → /auth lazy chunk.
// BUNDLE-CI-RED perf-infra — split out of main chunk (was eager, +5.5KB over budget).
const Antrenor = lazy(() => import('./screens/antrenor/Antrenor').then((m) => ({ default: m.Antrenor })));
const Progres = lazy(() => import('./screens/progres/Progres').then((m) => ({ default: m.Progres })));
const Istoric = lazy(() => import('./screens/istoric/Istoric').then((m) => ({ default: m.Istoric })));
const Cont = lazy(() => import('./screens/cont/Cont').then((m) => ({ default: m.Cont })));

// LOCK V1 D060 — PWA quadruple optimization §2 AuthCluster lazy (DECISIONS.md §D060)
// ROUTE_LAZY_LOAD_INVESTIGATION chat 5 HIGH ROI #1 — one-time-entry flow lazy
const Splash = lazy(() => import('./screens/Splash').then((m) => ({ default: m.Splash })));
const Auth = lazy(() => import('./screens/Auth').then((m) => ({ default: m.Auth })));
const AuthCallback = lazy(() => import('./screens/AuthCallback').then((m) => ({ default: m.AuthCallback })));
const Onboarding = lazy(() => import('./screens/Onboarding').then((m) => ({ default: m.Onboarding })));

// §B007 lazy — Antrenor sub-screens (workout flow, 11 routes)
const EnergyCheck = lazy(() => import('./screens/antrenor/EnergyCheck').then((m) => ({ default: m.EnergyCheck })));
const EnergyCause = lazy(() => import('./screens/antrenor/EnergyCause').then((m) => ({ default: m.EnergyCause })));
const WorkoutPreview = lazy(() => import('./screens/antrenor/WorkoutPreview').then((m) => ({ default: m.WorkoutPreview })));
const Workout = lazy(() => import('./screens/antrenor/Workout').then((m) => ({ default: m.Workout })));
const CevaNuMerge = lazy(() => import('./screens/antrenor/CevaNuMerge').then((m) => ({ default: m.CevaNuMerge })));
const PainButton = lazy(() => import('./screens/antrenor/PainButton').then((m) => ({ default: m.PainButton })));
const EquipmentSwap = lazy(() => import('./screens/antrenor/EquipmentSwap').then((m) => ({ default: m.EquipmentSwap })));
const AparateLipsa = lazy(() => import('./screens/antrenor/AparateLipsa').then((m) => ({ default: m.AparateLipsa })));
const ScheduleOverride = lazy(() => import('./screens/antrenor/ScheduleOverride').then((m) => ({ default: m.ScheduleOverride })));
const PostRpe = lazy(() => import('./screens/antrenor/PostRpe').then((m) => ({ default: m.PostRpe })));
const PostSummary = lazy(() => import('./screens/antrenor/PostSummary').then((m) => ({ default: m.PostSummary })));
// §B004 D047 Stage 3 — Workout exit drill-down
const FinishEarlyConfirm = lazy(() => import('./screens/antrenor/FinishEarlyConfirm').then((m) => ({ default: m.FinishEarlyConfirm })));
// PARITY-CONFIRM-MODALS Wave 2f — program change drill-down (PAR-003)
const ProgramChangeConfirm = lazy(() => import('./screens/antrenor/ProgramChangeConfirm').then((m) => ({ default: m.ProgramChangeConfirm })));

// §B007 lazy — Progres sub-screens (2 routes)
const LogWeight = lazy(() => import('./screens/progres/LogWeight').then((m) => ({ default: m.LogWeight })));
const BodyData = lazy(() => import('./screens/progres/BodyData').then((m) => ({ default: m.BodyData })));
const WeightLogList = lazy(() => import('./screens/progres/WeightLogList').then((m) => ({ default: m.WeightLogList })));

// PARITY-MISSING-SCREENS Wave 2e — Weight Timeline (PAR-004)
const WeightTimeline = lazy(() => import('./screens/progres/WeightTimeline').then((m) => ({ default: m.WeightTimeline })));

// §B007 lazy — Istoric detail (1 route, sessionId)
const IstoricDetail = lazy(() => import('./screens/istoric/IstoricDetail').then((m) => ({ default: m.IstoricDetail })));

// PARITY-MISSING-SCREENS Wave 2e — PR Wall full-screen (PAR-001)
const PrWall = lazy(() => import('./screens/istoric/PrWall').then((m) => ({ default: m.PrWall })));

// §B007 lazy — Cont sub-screens (9 settings routes)
const SettingsProfile = lazy(() => import('./screens/cont/SettingsProfile').then((m) => ({ default: m.SettingsProfile })));
const SettingsNotifications = lazy(() => import('./screens/cont/SettingsNotifications').then((m) => ({ default: m.SettingsNotifications })));
const SettingsSubscription = lazy(() => import('./screens/cont/SettingsSubscription').then((m) => ({ default: m.SettingsSubscription })));
const SettingsAppearance = lazy(() => import('./screens/cont/SettingsAppearance').then((m) => ({ default: m.SettingsAppearance })));
const SettingsPrefs = lazy(() => import('./screens/cont/SettingsPrefs').then((m) => ({ default: m.SettingsPrefs })));
const SettingsPrivacy = lazy(() => import('./screens/cont/SettingsPrivacy').then((m) => ({ default: m.SettingsPrivacy })));
const SettingsTerms = lazy(() => import('./screens/cont/SettingsTerms').then((m) => ({ default: m.SettingsTerms })));
const SettingsExport = lazy(() => import('./screens/cont/SettingsExport').then((m) => ({ default: m.SettingsExport })));
const SettingsDanger = lazy(() => import('./screens/cont/SettingsDanger').then((m) => ({ default: m.SettingsDanger })));
const SettingsAbout = lazy(() => import('./screens/cont/SettingsAbout').then((m) => ({ default: m.SettingsAbout })));
const SettingsSupport = lazy(() => import('./screens/cont/SettingsSupport').then((m) => ({ default: m.SettingsSupport })));
const SettingsFaq = lazy(() => import('./screens/cont/SettingsFaq').then((m) => ({ default: m.SettingsFaq })));
// PARITY-MISSING-SCREENS Wave 2e — Themes palette picker (PAR-002)
const SettingsThemes = lazy(() => import('./screens/cont/SettingsThemes').then((m) => ({ default: m.SettingsThemes })));
// §D047 RIP-OUT drill-down screens — A003 ConfirmModal replacement (Stage 1 NEW screens)
const LogoutConfirm = lazy(() => import('./screens/cont/LogoutConfirm').then((m) => ({ default: m.LogoutConfirm })));
const DeleteAccountConfirm = lazy(() => import('./screens/cont/DeleteAccountConfirm').then((m) => ({ default: m.DeleteAccountConfirm })));
const ResetDataConfirm = lazy(() => import('./screens/cont/ResetDataConfirm').then((m) => ({ default: m.ResetDataConfirm })));
// §B002 D047 Stage 3 — Avansat section drill-downs
const RedoOnboardingConfirm = lazy(() => import('./screens/cont/RedoOnboardingConfirm').then((m) => ({ default: m.RedoOnboardingConfirm })));
const SchimbaFazaConfirm = lazy(() => import('./screens/cont/SchimbaFazaConfirm').then((m) => ({ default: m.SchimbaFazaConfirm })));
const ResetCoachConfirm = lazy(() => import('./screens/cont/ResetCoachConfirm').then((m) => ({ default: m.ResetCoachConfirm })));

/**
 * §B007 — Suspense wrapper pentru lazy sub-screens. Fallback = canonical
 * LoadingSkeleton (single source cross-app, unified pulse-bar pattern). Maria
 * 65 friction-low: ~50-100ms typical chunk load 3G median, no layout shift.
 */
function LazyRoute({ children }: { children: ReactNode }): JSX.Element {
  return (
    <Suspense fallback={<LoadingSkeleton testId="lazy-route-fallback" />}>
      {children}
    </Suspense>
  );
}

/**
 * ERRORBOUNDARY-COVERAGE perf-infra — top-level routes (Splash / Auth /
 * AuthCallback / Onboarding) render OUTSIDE Layout, so they were not covered by
 * Layout's ErrorBoundary (which only wraps the /app Outlet). A render crash at
 * first contact (pre-auth / onboarding) showed a white screen. Wrapping each in
 * the same ErrorBoundary gives them the fallback UI too. /app sub-routes keep
 * Layout's single boundary (no double-wrap) — only the unprotected entry routes
 * gain coverage here.
 */
function TopLevelRoute({ children }: { children: ReactNode }): JSX.Element {
  return (
    <ErrorBoundary>
      <LazyRoute>{children}</LazyRoute>
    </ErrorBoundary>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <TopLevelRoute><Splash /></TopLevelRoute> },
  { path: '/auth', element: <TopLevelRoute><Auth /></TopLevelRoute> },
  { path: '/auth/reactivate', element: <TopLevelRoute><Auth /></TopLevelRoute> },
  { path: '/auth-callback', element: <TopLevelRoute><AuthCallback /></TopLevelRoute> },
  { path: '/onboarding/:step', element: <TopLevelRoute><Onboarding /></TopLevelRoute> },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <LazyRoute><Antrenor /></LazyRoute> },
      {
        path: 'antrenor',
        children: [
          { index: true, element: <LazyRoute><Antrenor /></LazyRoute> },
          { path: 'energy-check', element: <LazyRoute><EnergyCheck /></LazyRoute> },
          { path: 'energy-cause', element: <LazyRoute><EnergyCause /></LazyRoute> },
          { path: 'workout-preview', element: <LazyRoute><WorkoutPreview /></LazyRoute> },
          { path: 'workout', element: <LazyRoute><Workout /></LazyRoute> },
          { path: 'ceva-nu-merge', element: <LazyRoute><CevaNuMerge /></LazyRoute> },
          { path: 'pain-button', element: <LazyRoute><PainButton /></LazyRoute> },
          { path: 'equipment-swap', element: <LazyRoute><EquipmentSwap /></LazyRoute> },
          { path: 'aparate-lipsa', element: <LazyRoute><AparateLipsa /></LazyRoute> },
          { path: 'schedule-override', element: <LazyRoute><ScheduleOverride /></LazyRoute> },
          { path: 'post-rpe', element: <LazyRoute><PostRpe /></LazyRoute> },
          { path: 'post-summary', element: <LazyRoute><PostSummary /></LazyRoute> },
          // §B004 D047 Stage 3 — Workout exit drill-down
          { path: 'finish-early-confirm', element: <LazyRoute><FinishEarlyConfirm /></LazyRoute> },
          // PARITY-CONFIRM-MODALS Wave 2f — program change drill-down (PAR-003)
          { path: 'program-change-confirm', element: <LazyRoute><ProgramChangeConfirm /></LazyRoute> },
        ],
      },
      {
        path: 'progres',
        children: [
          { index: true, element: <LazyRoute><Progres /></LazyRoute> },
          { path: 'log-weight', element: <LazyRoute><LogWeight /></LazyRoute> },
          { path: 'body-data', element: <LazyRoute><BodyData /></LazyRoute> },
          { path: 'weight-log-list', element: <LazyRoute><WeightLogList /></LazyRoute> },
          // PARITY-MISSING-SCREENS Wave 2e — Weight Timeline (PAR-004)
          { path: 'weight-timeline', element: <LazyRoute><WeightTimeline /></LazyRoute> },
        ],
      },
      {
        path: 'istoric',
        children: [
          { index: true, element: <LazyRoute><Istoric /></LazyRoute> },
          // PARITY-MISSING-SCREENS Wave 2e — static path BEFORE :sessionId
          // so 'pr-wall' nu match-uieste param (Karpathy SC ordering).
          { path: 'pr-wall', element: <LazyRoute><PrWall /></LazyRoute> },
          { path: ':sessionId', element: <LazyRoute><IstoricDetail /></LazyRoute> },
        ],
      },
      {
        path: 'cont',
        children: [
          { index: true, element: <LazyRoute><Cont /></LazyRoute> },
          { path: 'settings-profile', element: <LazyRoute><SettingsProfile /></LazyRoute> },
          { path: 'settings-notifications', element: <LazyRoute><SettingsNotifications /></LazyRoute> },
          { path: 'settings-subscription', element: <LazyRoute><SettingsSubscription /></LazyRoute> },
          { path: 'settings-appearance', element: <LazyRoute><SettingsAppearance /></LazyRoute> },
          { path: 'settings-prefs', element: <LazyRoute><SettingsPrefs /></LazyRoute> },
          { path: 'settings-privacy', element: <LazyRoute><SettingsPrivacy /></LazyRoute> },
          { path: 'settings-terms', element: <LazyRoute><SettingsTerms /></LazyRoute> },
          { path: 'settings-export', element: <LazyRoute><SettingsExport /></LazyRoute> },
          { path: 'settings-danger', element: <LazyRoute><SettingsDanger /></LazyRoute> },
          { path: 'settings-about', element: <LazyRoute><SettingsAbout /></LazyRoute> },
          { path: 'settings-support', element: <LazyRoute><SettingsSupport /></LazyRoute> },
          { path: 'settings-faq', element: <LazyRoute><SettingsFaq /></LazyRoute> },
          // PARITY-MISSING-SCREENS Wave 2e — Themes palette picker (PAR-002)
          { path: 'settings-themes', element: <LazyRoute><SettingsThemes /></LazyRoute> },
          // §D047 RIP-OUT drill-down screens — A003 ConfirmModal migrate Stage 1
          { path: 'logout-confirm', element: <LazyRoute><LogoutConfirm /></LazyRoute> },
          { path: 'delete-account-confirm', element: <LazyRoute><DeleteAccountConfirm /></LazyRoute> },
          { path: 'reset-data-confirm', element: <LazyRoute><ResetDataConfirm /></LazyRoute> },
          // §B002 D047 Stage 3 — Avansat section drill-downs
          { path: 'redo-onboarding-confirm', element: <LazyRoute><RedoOnboardingConfirm /></LazyRoute> },
          { path: 'schimba-faza-confirm', element: <LazyRoute><SchimbaFazaConfirm /></LazyRoute> },
          { path: 'reset-coach-confirm', element: <LazyRoute><ResetCoachConfirm /></LazyRoute> },
        ],
      },
    ],
  },
]);
