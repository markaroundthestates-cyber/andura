// ══ ROUTER CONFIG — Phase 2 Skeleton C Hybrid + Phase 3 Antrenor Sub-Routes ═
// Top-level NU bottom nav: /, /auth, /auth/reactivate, /onboarding/:step
// Nested per-tab cu bottom nav: /app/{antrenor,progres,istoric,cont}
// Phase 3 Antrenor sub-screens nested sub /app/antrenor/<screen>.
//
// §B007/D-3 audit fix (D046 §3.3) — Bundle code-split via React.lazy() pentru
// non-critical sub-routes. Critical path stays eager (Splash, Auth, Onboarding,
// 4 tab home Antrenor/Progres/Istoric/Cont, Layout/ProtectedRoute wrap).
// Sub-screens (Antrenor 11 + Cont 9 + Progres 2 + Istoric detail 1 = 23
// total) load on-demand via dynamic import. Maria 65 3G LCP improved.

import { lazy, Suspense } from 'react';
import type { JSX, ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from './Layout';

// Critical path — eager (always loaded — splash + auth + onboarding mandatory
// pre-protected; 4 tab home page is bottom-nav primary entry).
import { Splash } from './screens/Splash';
import { Auth } from './screens/Auth';
import { AuthCallback } from './screens/AuthCallback';
import { Onboarding } from './screens/Onboarding';
import { Antrenor } from './screens/antrenor/Antrenor';
import { Progres } from './screens/progres/Progres';
import { Istoric } from './screens/istoric/Istoric';
import { Cont } from './screens/cont/Cont';

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

// §B007 lazy — Progres sub-screens (2 routes)
const LogWeight = lazy(() => import('./screens/progres/LogWeight').then((m) => ({ default: m.LogWeight })));
const BodyData = lazy(() => import('./screens/progres/BodyData').then((m) => ({ default: m.BodyData })));

// §B007 lazy — Istoric detail (1 route, sessionId)
const IstoricDetail = lazy(() => import('./screens/istoric/IstoricDetail').then((m) => ({ default: m.IstoricDetail })));

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
// §D047 RIP-OUT drill-down screens — A003 ConfirmModal replacement (Stage 1 NEW screens)
const LogoutConfirm = lazy(() => import('./screens/cont/LogoutConfirm').then((m) => ({ default: m.LogoutConfirm })));
const DeleteAccountConfirm = lazy(() => import('./screens/cont/DeleteAccountConfirm').then((m) => ({ default: m.DeleteAccountConfirm })));
const ResetDataConfirm = lazy(() => import('./screens/cont/ResetDataConfirm').then((m) => ({ default: m.ResetDataConfirm })));
// §B002 D047 Stage 3 — Avansat section drill-downs
const RedoOnboardingConfirm = lazy(() => import('./screens/cont/RedoOnboardingConfirm').then((m) => ({ default: m.RedoOnboardingConfirm })));
const SchimbaFazaConfirm = lazy(() => import('./screens/cont/SchimbaFazaConfirm').then((m) => ({ default: m.SchimbaFazaConfirm })));
const ResetCoachConfirm = lazy(() => import('./screens/cont/ResetCoachConfirm').then((m) => ({ default: m.ResetCoachConfirm })));

/**
 * §B007 — Suspense wrapper pentru lazy sub-screens. Fallback minimal spinner
 * cu paper background match (NU layout shift, NU flash white). Maria 65
 * friction-low: ~50-100ms typical chunk load 3G median.
 */
function LazyRoute({ children }: { children: ReactNode }): JSX.Element {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-paper text-ink2 flex items-center justify-center"
          data-testid="lazy-route-fallback"
          aria-live="polite"
          role="status"
        >
          <div className="w-8 h-8 rounded-full border-4 border-line border-t-brick animate-spin" aria-hidden="true" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <Splash /> },
  { path: '/auth', element: <Auth /> },
  { path: '/auth/reactivate', element: <Auth /> },
  { path: '/auth-callback', element: <AuthCallback /> },
  { path: '/onboarding/:step', element: <Onboarding /> },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Antrenor /> },
      {
        path: 'antrenor',
        children: [
          { index: true, element: <Antrenor /> },
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
        ],
      },
      {
        path: 'progres',
        children: [
          { index: true, element: <Progres /> },
          { path: 'log-weight', element: <LazyRoute><LogWeight /></LazyRoute> },
          { path: 'body-data', element: <LazyRoute><BodyData /></LazyRoute> },
        ],
      },
      {
        path: 'istoric',
        children: [
          { index: true, element: <Istoric /> },
          { path: ':sessionId', element: <LazyRoute><IstoricDetail /></LazyRoute> },
        ],
      },
      {
        path: 'cont',
        children: [
          { index: true, element: <Cont /> },
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
