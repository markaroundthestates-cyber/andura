# task_20 — ErrorBoundary Layout Root + Suspense Lazy

**Phase:** 6 (polish pre-Beta)
**Type:** Feature — ErrorBoundary wire + lazy code-split routes
**Deps:** task_19 LANDED
**Backup tag:** `pre-phase6-task-20-2026-05-18`
**Est commits:** 1-2 atomic (Layout wire + lazy routes)
**Est tests delta:** +8-12

---

## §1 Scope

Phase 5 task_19 `ErrorBoundary.tsx` + `LoadingSkeleton.tsx` LANDED component files. NU wired la Layout root (`createBrowserRouter` configuration). NU Suspense lazy code-split routes.

Phase 6 wire ErrorBoundary la Layout `<Outlet />` root + Suspense lazy code-split per route. Reduces initial bundle size + isolates route failures.

## §2 Changes

### A. `src/react/routes/index.tsx` (rewrite cu lazy)

```tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Layout } from '../components/Layout';

// Lazy load route screens — code-split per route
const Antrenor = lazy(() => import('../screens/Antrenor'));
const Progres = lazy(() => import('../screens/Progres'));
const Istoric = lazy(() => import('../screens/Istoric'));
const Cont = lazy(() => import('../screens/Cont'));
const SettingsProfile = lazy(() => import('../screens/SettingsProfile'));
// ... 8 more settings sub-screens (tasks 09-17)
const Workout = lazy(() => import('../screens/Workout'));
const PostRpe = lazy(() => import('../screens/PostRpe'));
// ... rest existing screens

export const router = createBrowserRouter([
  {
    element: (
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<LoadingSkeleton />}>
            <Outlet />
          </Suspense>
        </Layout>
      </ErrorBoundary>
    ),
    children: [
      { path: '/', element: <Splash /> },
      { path: '/antrenor', element: <Antrenor /> },
      { path: '/progres', element: <Progres /> },
      { path: '/istoric', element: <Istoric /> },
      { path: '/cont', element: <Cont /> },
      { path: '/cont/settings-profile', element: <SettingsProfile /> },
      // ... 8 more sub-screens routes
      { path: '/workout', element: <Workout /> },
      { path: '/post-rpe', element: <PostRpe /> },
      // ... rest
    ],
  },
]);
```

### B. `ErrorBoundary.tsx` enrich error reporting (optional Phase 6+)

Phase 6 minimal: ZERO Sentry wire (Phase 7+). Just `console.error` + fallback UI Phase 5 task_19 preserved invariant.

### C. Tests `src/react/__tests__/routerLazy.test.tsx`

```js
- Suspense fallback renders LoadingSkeleton in transition
- ErrorBoundary catches downstream component throw
- ErrorBoundary fallback UI renders error message + reload button
- Lazy route loads only on navigation (verify dynamic import)
- 4 main tabs (antrenor/progres/istoric/cont) lazy-split
- 9 settings sub-screens lazy-split
- ZERO regression existing routing tests Phase 2 baseline
```

### D. Performance baseline

```bash
npm run build 2>&1 | grep -E "chunk|asset" | head -20
# Verify code-split chunks generated per route (NU single mega-bundle)
```

## §3 Acceptance criteria

- [ ] `createBrowserRouter` cu `ErrorBoundary` + `Suspense` wrap Outlet
- [ ] Toate route screens `lazy(() => import(...))` wrapped
- [ ] Bundle size split into per-route chunks
- [ ] Tests +8 minim PASS
- [ ] TS strict 0 errors
- [ ] ZERO regression existing routing baseline

## §4 Tests delta target +8-12

## §5 Commit

```
feat(react/routes): ErrorBoundary + Suspense lazy code-split per route

Wires Phase 5 task_19 ErrorBoundary + LoadingSkeleton la Layout root prin
createBrowserRouter element wrap. Toate route screens lazy() dynamic import
wrapped — bundle size split per-route chunks (4 main tabs + 9 settings
sub-screens + workout + post-rpe + 5 main routes).

Suspense fallback LoadingSkeleton during transition. ErrorBoundary catches
downstream throws cu fallback UI + reload button. ZERO Sentry wire V1
(Phase 7+ when Sentry SDK + project setup).
```

## §6 Next

task_21 vite-plugin-pwa service worker offline mode.
