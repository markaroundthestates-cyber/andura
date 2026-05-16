// ══ ROUTER CONFIG — Phase 2 Skeleton C Hybrid ═════════════════════════════
// Top-level NU bottom nav: /, /auth, /auth/reactivate, /onboarding/:step
// Nested per-tab cu bottom nav: /app/{antrenor,progres,istoric,cont}
// Phase 3+ extends cu sub-screens per tab.

import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from './Layout';
import { Splash } from './screens/Splash';
import { Auth } from './screens/Auth';
import { Onboarding } from './screens/Onboarding';
import { Antrenor } from './screens/antrenor/Antrenor';
import { Progres } from './screens/progres/Progres';
import { Istoric } from './screens/istoric/Istoric';
import { Cont } from './screens/cont/Cont';

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
      { path: 'antrenor', element: <Antrenor /> },
      { path: 'progres', element: <Progres /> },
      { path: 'istoric', element: <Istoric /> },
      { path: 'cont', element: <Cont /> },
    ],
  },
]);
