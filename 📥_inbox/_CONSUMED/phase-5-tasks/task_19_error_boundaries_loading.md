# task_19 — Error Boundaries Per Route + Loading Skeletons + Suspense Lazy

**Phase:** 6 (polish)
**Type:** Refactor — resilience + perf
**Deps:** task_15 (Splash + Layout routing)
**Backup tag:** `pre-phase5-task-19-2026-05-17`
**Est commits:** 2 atomic
**Est tests delta:** +10-15

---

## §1 Scope

Production-ready resilience layer + perf optimizations:
- React Error Boundaries per route (NU app-wide single — granular per-tab)
- Loading skeletons for screens cu data fetch async
- Suspense + React.lazy code splitting per route major (smaller initial bundle)

## §2 Changes

### A. `src/react/components/ErrorBoundary.tsx` (NEW)

```tsx
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<{ children: ReactNode; fallback?: ReactNode }, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-6 text-center">
          <h2 className="text-lg font-bold mb-2">Ceva nu a mers bine</h2>
          <p className="text-sm text-ink2 mb-4">Reincarca pagina ca sa continui.</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-brick text-paper rounded-lg">
            Reincarca
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### B. Wrap each route element în `router.tsx`

```tsx
{
  path: 'antrenor',
  element: <ErrorBoundary><Antrenor /></ErrorBoundary>,
},
// ... rest tabs each wrapped
```

### C. `src/react/components/Skeleton.tsx` (NEW)

```tsx
export function Skeleton({ className }: { className?: string }): JSX.Element {
  return <div className={`bg-paper-2 animate-pulse rounded ${className ?? ''}`} />;
}

export function CardSkeleton(): JSX.Element {
  return (
    <div className="p-4 border border-line rounded-xl mb-3">
      <Skeleton className="h-4 w-1/3 mb-2" />
      <Skeleton className="h-3 w-2/3 mb-1" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }): JSX.Element {
  return <>{Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}</>;
}
```

### D. Suspense lazy per route

```tsx
const Antrenor = lazy(() => import('./screens/antrenor/Antrenor'));
const Progres = lazy(() => import('./screens/progres/Progres'));
const Istoric = lazy(() => import('./screens/istoric/Istoric'));
const Cont = lazy(() => import('./screens/cont/Cont'));

// Wrap în Suspense:
<Suspense fallback={<ListSkeleton count={3} />}>
  <ErrorBoundary>{element}</ErrorBoundary>
</Suspense>
```

### E. Async data fetch skeletons

Wrap screens cu data-fetching states:
```tsx
const [coachToday, setCoachToday] = useState<CoachTodayOutput | null>(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
  buildCoachToday().then((data) => { setCoachToday(data); setLoading(false); });
}, []);

if (loading) return <ListSkeleton count={4} />;
```

## §3 Acceptance criteria

- [ ] Error Boundary catches errors per route
- [ ] Fallback UI cu Reincarca button RO copy
- [ ] Skeleton components shared utility
- [ ] Suspense lazy 4 main tabs (Antrenor/Progres/Istoric/Cont)
- [ ] Initial bundle smaller (verify dist size)
- [ ] Tests +10-15 PASS
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/ErrorBoundary.test.tsx
- catches child error
- renders fallback UI
- onReload invokes location.reload

src/react/__tests__/Skeleton.test.tsx
- renders animate-pulse class
- ListSkeleton renders count items

src/react/__tests__/router.lazy.test.tsx
- Suspense shows fallback during chunk load
- ErrorBoundary wraps each tab route
```

## §5 Commits (atomic 2)

```
feat(react/components): ErrorBoundary + Skeleton utilities

Error Boundary per-route granular (NU app-wide). Fallback UI cu RO copy
Reincarca CTA. Skeleton + CardSkeleton + ListSkeleton shared utilities
animate-pulse pattern.

refactor(react/router): Suspense lazy code splitting 4 main tabs

Antrenor + Progres + Istoric + Cont React.lazy chunks. ErrorBoundary
wraps each route. Initial bundle smaller. Skeleton fallback during chunk
load + screen data fetch states.
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_19_error_boundaries_loading.md`:
- ErrorBoundary granularity decision
- Skeleton patterns
- Bundle size comparison before/after
