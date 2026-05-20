# Task D001 — Bundle code-split route-based React.lazy + Suspense

**Cluster:** D (Goal-Driven multi-file refactor)
**Karpathy:** Goal-Driven (Maria 65 3G LCP <5s + §5.23 budget compliance)
**Effort:** L (~4-5h multi-file)
**Beta blocker:** YES Wave 2 (performance gate Beta entry criteria)
**Source finding(s):**
- `📤_outbox/audit-nuclear-2026-05-19/findings-§05.md` (§5-C1 + §5-C2 + §5-C3 read verbatim)
- `📤_outbox/audit-nuclear-2026-05-19/SUMMARY.md:106-107` (Top 10 blockers — main bundle 432KB)

**File(s) touched:**
- `src/react/routes/router.tsx` (route definitions)
- All route components in `src/react/routes/screens/**`
- Possibly `vite.config.js` (manualChunks config)
- `tests/playwright/` smoke tests (verify route lazy-load works)
- `.size-limit.json` (Track 7 ratchet update post-measured)

**Dependencies:** D003 (ESLint install) preferred but not blocking. NO hard dep.

---

## §A Pre-flight

```
Read 📤_outbox/audit-nuclear-2026-05-19/findings-§05.md complete (§5-C1 + C2 + C3 + § sub-checklist)
Read src/react/routes/router.tsx complete
Read vite.config.js complete
Run `npm run build` baseline → measure dist/ size per chunk
```

GitNexus:
```
gitnexus_impact({target: "router", direction: "upstream"})
gitnexus_query({query: "React.lazy Suspense"})
```

Verify Suspense fallback UX pattern — likely none exists yet (Phase 6 not landed). Need to design loading skeleton at route level.

---

## §B Implementation

### Step 1 — Loading skeleton component

`src/react/components/RouteSkeleton.tsx`:

```tsx
import type { JSX } from 'react';

export function RouteSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper" role="status" aria-live="polite">
      <div className="w-12 h-12 rounded-full border-2 border-line border-t-brick animate-spin" />
      <span className="sr-only">Se incarca...</span>
    </div>
  );
}
```

### Step 2 — Convert routes to React.lazy

`src/react/routes/router.tsx`:

```tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { RouteSkeleton } from '../components/RouteSkeleton';

// Public routes — eagerly loaded (small)
import { Splash } from './screens/Splash';
import { Auth } from './screens/Auth';
import { AuthCallback } from './screens/AuthCallback';

// Protected route lazy chunks
const Antrenor = lazy(() => import('./screens/antrenor/Antrenor').then(m => ({ default: m.Antrenor })));
const Progres = lazy(() => import('./screens/progres/Progres').then(m => ({ default: m.Progres })));
const Istoric = lazy(() => import('./screens/istoric/Istoric').then(m => ({ default: m.Istoric })));
const Cont = lazy(() => import('./screens/cont/Cont').then(m => ({ default: m.Cont })));

// Sub-screens lazy (per-route chunk)
const WorkoutPreview = lazy(() => import('./screens/workout/WorkoutPreview').then(m => ({ default: m.WorkoutPreview })));
const Workout = lazy(() => import('./screens/workout/Workout').then(m => ({ default: m.Workout })));
// ... continue for all 30+ sub-screens

const withSuspense = (El: React.ComponentType) => (
  <Suspense fallback={<RouteSkeleton />}>
    <El />
  </Suspense>
);

export const router = createBrowserRouter([
  { path: '/', element: <Splash /> },
  { path: '/auth', element: <Auth /> },
  { path: '/auth-callback', element: <AuthCallback /> },
  {
    path: '/app',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { path: 'antrenor', element: withSuspense(Antrenor) },
      { path: 'progres', element: withSuspense(Progres) },
      { path: 'istoric', element: withSuspense(Istoric) },
      { path: 'cont', element: withSuspense(Cont) },
      { path: 'workout-preview', element: withSuspense(WorkoutPreview) },
      { path: 'workout', element: withSuspense(Workout) },
      // ... continue
    ],
  },
  { path: '*', element: <Splash /> },  // SPA 404 fallback per iter-9.6
]);
```

### Step 3 — Vite manualChunks (vendor split)

`vite.config.js`:

```js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-firebase': ['@sentry/browser'],  // small standalone
        'vendor-icons': ['lucide-react'],
        // ... per measured analysis
      },
    },
  },
}
```

### Step 4 — Re-measure bundle

```powershell
npm run build
ls dist/assets -la                # measure per-chunk size
```

Expected:
- `index.html` <2KB
- `vendor-react.[hash].js` ~25-30KB gzip
- `vendor-icons.[hash].js` ~5-8KB gzip
- `main.[hash].js` <50KB gzip (down from 432KB → ~120KB gzip uncompressed, ~40KB gzip)
- Per-route chunks: 5-15KB gzip each
- CSS: <10KB gzip

Total LCP-critical: <80KB gzip per route landing → Maria 65 3G ~4s achievable.

### Step 5 — Update .size-limit.json Track 7 ratchet

```json
{
  "files": [
    { "path": "dist/assets/index-*.js", "limit": "8 KB" },
    { "path": "dist/assets/main-*.js", "limit": "60 KB" },
    { "path": "dist/assets/vendor-react-*.js", "limit": "35 KB" },
    { "path": "dist/assets/vendor-icons-*.js", "limit": "10 KB" },
    { "path": "dist/assets/*.css", "limit": "8 KB" }
  ]
}
```

Adjust to MEASURED real sizes + 5-10% margin per D036 ratchet methodology.

### Step 6 — Playwright smoke verify lazy works

`tests/playwright/lazy-load.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('initial /app/antrenor load shows skeleton then content', async ({ page }) => {
  await page.goto('http://localhost:5173/app/antrenor');
  // Skeleton flashes
  await expect(page.getByRole('status')).toBeVisible({ timeout: 100 });
  // Then content renders
  await expect(page.getByRole('heading', { name: 'Antrenor' })).toBeVisible({ timeout: 5000 });
});

test('lazy chunks fetched on route navigation', async ({ page }) => {
  await page.goto('http://localhost:5173/app/antrenor');
  await page.waitForLoadState('networkidle');
  const reqs: string[] = [];
  page.on('request', r => reqs.push(r.url()));
  await page.click('text=Progres');
  await page.waitForLoadState('networkidle');
  expect(reqs.some(u => u.includes('Progres') && u.endsWith('.js'))).toBe(true);
});
```

---

## §C Tests

```powershell
npm run test:run                          # expect: 4522 PASS preserved (createBrowserRouter prod / MemoryRouter test split D020 preserved)
npm run build
npm run preview                           # serve dist/
# In separate terminal:
npx playwright test lazy-load.spec.ts
```

Lighthouse manual on `npm run preview`:
- LCP < 2.5s @ Slow 4G (laptop simulated 3G)
- TBT < 200ms
- Bundle main + critical < 150KB gzip transfer

---

## §D Commit

Atomic-ish but multi-file. Single commit acceptable per Karpathy GD large-scope refactor:

```
perf(D001-bundle-code-split): route-based React.lazy + Suspense + Vite manualChunks (NC§5-C1 + §5-C3 + §5-C2)

Closes audit nuclear §5-C1 (main bundle 432KB), §5-C3 (no React.lazy),
§5-C2 (no manualChunks). Maria 65 3G LCP target <5s now achievable.

Changes:
- Routes converted to lazy() for all /app/* + sub-screens (30+ routes)
- Public routes (Splash + Auth + AuthCallback) remain eager (small + auth-critical)
- RouteSkeleton fallback Suspense boundary (aria-live polite)
- Vite manualChunks split vendor-react + vendor-icons + vendor-firebase
- .size-limit.json ratchet updated to measured post-split (main <60KB)
- Playwright lazy-load smoke tests added

Pre-build bundle: main 432KB
Post-build bundle: index <8KB + vendor-react ~30KB + main <60KB + per-route 5-15KB

Source-citation: 📤_outbox/audit-nuclear-2026-05-19/findings-§05.md
```

---

## §E Verify post-edit

```powershell
gitnexus_detect_changes
npm run build
ls dist/assets -la | findstr ".js"
npm run test:run
npx playwright test lazy-load.spec.ts
```

Expected:
- gitnexus: router + 30+ screen files + vite.config + .size-limit.json + RouteSkeleton new
- dist sizes within .size-limit.json budgets
- 4522 PASS preserved
- Playwright lazy-load tests PASS

---

🦫 **Task D001 — Bundle code-split. ~4-5h Opus L. Closes §5-C1 + §5-C2 + §5-C3 Maria 65 LCP gate. Critical for Beta performance entry criteria.**
