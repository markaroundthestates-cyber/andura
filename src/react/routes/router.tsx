// ══ ROUTER CONFIG — Phase 2 Skeleton C Hybrid + Phase 3 Antrenor Sub-Routes ═
// Top-level NU bottom nav: /, /auth, /auth/reactivate, /onboarding/:step
// Nested per-tab cu bottom nav: /app/{antrenor,progres,istoric,cont}
// Phase 3 Antrenor sub-screens nested sub /app/antrenor/<screen>.

import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from './Layout';
import { Splash } from './screens/Splash';
import { Auth } from './screens/Auth';
import { Onboarding } from './screens/Onboarding';
import { Antrenor } from './screens/antrenor/Antrenor';
import { EnergyCheck } from './screens/antrenor/EnergyCheck';
import { EnergyCause } from './screens/antrenor/EnergyCause';
import { WorkoutPreview } from './screens/antrenor/WorkoutPreview';
import { Workout } from './screens/antrenor/Workout';
import { CevaNuMerge } from './screens/antrenor/CevaNuMerge';
import { PainButton } from './screens/antrenor/PainButton';
import { EquipmentSwap } from './screens/antrenor/EquipmentSwap';
import { AparateLipsa } from './screens/antrenor/AparateLipsa';
import { ScheduleOverride } from './screens/antrenor/ScheduleOverride';
import { PostRpe } from './screens/antrenor/PostRpe';
import { PostSummary } from './screens/antrenor/PostSummary';
import { Progres } from './screens/progres/Progres';
import { LogWeight } from './screens/progres/LogWeight';
import { BodyData } from './screens/progres/BodyData';
import { Istoric } from './screens/istoric/Istoric';
import { IstoricDetail } from './screens/istoric/IstoricDetail';
import { Cont } from './screens/cont/Cont';
import { SettingsProfile } from './screens/cont/SettingsProfile';
import { SettingsNotifications } from './screens/cont/SettingsNotifications';
import { SettingsSubscription } from './screens/cont/SettingsSubscription';

export const router = createBrowserRouter([
  { path: '/', element: <Splash /> },
  { path: '/auth', element: <Auth /> },
  { path: '/auth/reactivate', element: <Auth /> },
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
          { path: 'energy-check', element: <EnergyCheck /> },
          { path: 'energy-cause', element: <EnergyCause /> },
          { path: 'workout-preview', element: <WorkoutPreview /> },
          { path: 'workout', element: <Workout /> },
          { path: 'ceva-nu-merge', element: <CevaNuMerge /> },
          { path: 'pain-button', element: <PainButton /> },
          { path: 'equipment-swap', element: <EquipmentSwap /> },
          { path: 'aparate-lipsa', element: <AparateLipsa /> },
          { path: 'schedule-override', element: <ScheduleOverride /> },
          { path: 'post-rpe', element: <PostRpe /> },
          { path: 'post-summary', element: <PostSummary /> },
        ],
      },
      {
        path: 'progres',
        children: [
          { index: true, element: <Progres /> },
          { path: 'log-weight', element: <LogWeight /> },
          { path: 'body-data', element: <BodyData /> },
        ],
      },
      {
        path: 'istoric',
        children: [
          { index: true, element: <Istoric /> },
          { path: ':sessionId', element: <IstoricDetail /> },
        ],
      },
      {
        path: 'cont',
        children: [
          { index: true, element: <Cont /> },
          { path: 'settings-profile', element: <SettingsProfile /> },
          { path: 'settings-notifications', element: <SettingsNotifications /> },
          { path: 'settings-subscription', element: <SettingsSubscription /> },
        ],
      },
    ],
  },
]);
