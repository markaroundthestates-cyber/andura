---
title: PHASE2_TASK_2_SCREENS_LAYOUT_ROUTER.md
type: cc-autonomous-task
model: Opus EXCLUSIVELY
phase: Phase 2 Routing Skeleton
task: 2 of 3
depends-on: TASK 1 complete (Zustand auth + ProtectedRoute + BottomNav + navigation helper, typecheck clean)
---

# PHASE 2 TASK 2 — Layout + Placeholder Tab Screens + Top-Level Stubs + Router Config + Wire main.tsx

## Goal
Create Layout `<Outlet />` shell cu BottomNav persistent, 4 placeholder tab screens, top-level Splash/Auth/Onboarding stubs, Router config `createBrowserRouter`, wire în `src/main.tsx` (replace App direct render cu RouterProvider).

## Steps

### 2.1 — Create `src/react/routes/Layout.tsx`

```typescript
// ══ LAYOUT SHELL — 4-Tab App Container (Outlet + BottomNav Persistent) ════
// Per Co-CTO LOCK Phase 2 routing C hybrid. /app/* parent route. Bottom nav
// vizibil exclusiv în acest layout. Top-level screens (splash/auth/onb) NU.

import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';

export function Layout(): JSX.Element {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
```

### 2.2 — Create 4 placeholder tab screens

`src/react/routes/screens/antrenor/Antrenor.tsx`:
```typescript
export function Antrenor(): JSX.Element {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold text-ink mb-3">Antrenor</h1>
      <p className="text-sm text-ink2">Phase 2 placeholder — Phase 3+ workout state machine + 8 sub-screens.</p>
    </section>
  );
}
```

`src/react/routes/screens/progres/Progres.tsx`:
```typescript
export function Progres(): JSX.Element {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold text-ink mb-3">Progres</h1>
      <p className="text-sm text-ink2">Phase 2 placeholder — Phase 4 dashboard + log-weight.</p>
    </section>
  );
}
```

`src/react/routes/screens/istoric/Istoric.tsx`:
```typescript
export function Istoric(): JSX.Element {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold text-ink mb-3">Istoric</h1>
      <p className="text-sm text-ink2">Phase 2 placeholder — Phase 5 timeline + PR wall + drill-downs.</p>
    </section>
  );
}
```

`src/react/routes/screens/cont/Cont.tsx`:
```typescript
export function Cont(): JSX.Element {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold text-ink mb-3">Cont</h1>
      <p className="text-sm text-ink2">Phase 2 placeholder — Phase 6 settings + 8 sub-screens.</p>
    </section>
  );
}
```

### 2.3 — Create top-level Splash/Auth/Onboarding stubs

`src/react/routes/screens/Splash.tsx`:
```typescript
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';

export function Splash(): JSX.Element {
  const navigate = useNavigate();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return (
    <section className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-semibold text-brick mb-4">🦫 Andura</h1>
      <p className="text-sm text-ink2 mb-6">Coach AI pentru sala.</p>
      <button
        type="button"
        onClick={() => navigate(isAuthenticated ? '/app/antrenor' : '/auth')}
        className="px-6 py-3 bg-brick text-white rounded-lg font-semibold"
      >
        {isAuthenticated ? 'Continua' : 'Intra in cont'}
      </button>
      <p className="text-xs text-ink2 mt-4 opacity-60">Phase 2 placeholder splash.</p>
    </section>
  );
}
```

`src/react/routes/screens/Auth.tsx`:
```typescript
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';

export function Auth(): JSX.Element {
  const navigate = useNavigate();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);

  // Phase 2 stub: button mock authenticate. Phase 3+ wire Firebase Magic Link.
  const handleMockLogin = (): void => {
    setAuthenticated(true);
    navigate('/onboarding/1');
  };

  return (
    <section className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold text-ink mb-4">Autentificare</h1>
      <p className="text-sm text-ink2 mb-6">Phase 2 stub — Phase 3+ Firebase Magic Link wire.</p>
      <button
        type="button"
        onClick={handleMockLogin}
        className="px-6 py-3 bg-brick text-white rounded-lg font-semibold"
      >
        Mock login (Phase 2 stub)
      </button>
    </section>
  );
}
```

`src/react/routes/screens/Onboarding.tsx`:
```typescript
import { useParams, useNavigate } from 'react-router-dom';

export function Onboarding(): JSX.Element {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const stepNum = parseInt(step ?? '1', 10);
  const isLast = stepNum >= 7;

  return (
    <section className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold text-ink mb-3">Onboarding pasul {stepNum}/7</h1>
      <p className="text-sm text-ink2 mb-6">Phase 2 placeholder — Phase 3+ Big 6 hard typing wire.</p>
      <button
        type="button"
        onClick={() => navigate(isLast ? '/app/antrenor' : `/onboarding/${stepNum + 1}`)}
        className="px-6 py-3 bg-brick text-white rounded-lg font-semibold"
      >
        {isLast ? 'Termina' : 'Continua'}
      </button>
    </section>
  );
}
```

### 2.4 — Create `src/react/routes/router.tsx` Router config

```typescript
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
  { path: '/auth/reactivate', element: <Auth /> },  // Phase 2 stub same screen
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
```

### 2.5 — Wire `src/main.tsx` cu RouterProvider

Read curent `src/main.tsx`. Replace App render direct cu RouterProvider:

```typescript
// ══ REACT ENTRY POINT — Andura Clasic Build Phase 2 Routing Wire ══════════
// Per DECISIONS.md §D015 + §D016 + Co-CTO LOCK Phase 2 routing C hybrid.
// Phase 1 App.tsx placeholder = preserved (used as splash content reuse
// option future). Router config în src/react/routes/router.tsx.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './react/routes/router';
import './styles/global.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in react-test.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

### 2.6 — `src/App.tsx` preserve (Phase 1 placeholder NU touched)

App.tsx rămâne intact ca Phase 1 baseline reference. NU folosit în Phase 2 router (replaced cu Splash). Phase 3+ poate fi deleted dacă confirm NU used.

### 2.7 — Verify build + typecheck

```bash
npm run typecheck                                 # expect: 0 errors
npm run build                                     # expect: 0 errors, dist/ generated
```

## Success criteria

- `src/react/routes/Layout.tsx` Outlet + BottomNav shell ✓
- 4 tab placeholder screens created în `src/react/routes/screens/{antrenor,progres,istoric,cont}/` ✓
- 3 top-level stub screens (Splash + Auth + Onboarding) ✓
- `src/react/routes/router.tsx` createBrowserRouter config ✓
- `src/main.tsx` wire RouterProvider (App import replaced) ✓
- `src/App.tsx` preserved invariant Phase 1 baseline ✓
- `npm run typecheck` 0 errors ✓
- `npm run build` 0 errors ✓

## Fail conditions

- TypeScript errors (router types, useParams generic, JSX) → STOP, raport literal
- Build error (import path resolution, lucide-react) → STOP

## Output

"Task 2 DONE. Layout + 4 tab placeholder + 3 top-level stubs + Router config + main.tsx wire. Build + typecheck clean. Continue Task 3."

---

🦫 **C hybrid routing wired end-to-end. Phase 3+ extends sub-screens per tab natural pe această structură.**
