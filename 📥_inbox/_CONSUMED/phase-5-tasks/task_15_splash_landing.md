# task_15 — Splash + Landing React Port

**Phase:** 6 (foundations)
**Type:** Feature — first-launch UX
**Deps:** task_14 (Onboarding wizard exists)
**Backup tag:** `pre-phase5-task-15-2026-05-17`
**Est commits:** 1-2 atomic
**Est tests delta:** +5-10

---

## §1 Scope

Mockup `andura-clasic.html` `#screen-splash` = first-launch splash screen cu logo + tagline + 3 CTA opțiuni (Continua + Login + Demo). Currently `src/react/routes/screens/Splash.tsx` placeholder.

Task 15: full port splash + landing flow + auth gate routing.

## §2 Changes

### A. `src/react/routes/screens/Splash.tsx` (refactor)

```tsx
export function Splash(): JSX.Element {
  const profileLoaded = useProfileStore((s) => s.onboardedAt != null);
  const authState = useAuthState(); // task_16 dependency
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect dacă deja autentificat + onboarded
    if (profileLoaded && authState === 'authenticated') {
      navigate('/antrenor');
    }
  }, [profileLoaded, authState, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-paper">
      <div className="flex-1 flex flex-col items-center justify-center">
        <Logo className="w-24 h-24 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Andura</h1>
        <p className="text-ink2 text-center">Antrenorul tau personal AI.</p>
      </div>
      <div className="w-full max-w-sm space-y-3">
        <button onClick={() => navigate('/onboarding')} className="w-full py-3 bg-brick text-paper rounded-xl font-semibold">
          Incepe
        </button>
        <button onClick={() => navigate('/auth')} className="w-full py-3 border border-line rounded-xl text-ink">
          Am deja cont
        </button>
      </div>
      <p className="text-xs text-ink2 mt-4">v{APP_VERSION}</p>
    </div>
  );
}
```

### B. `src/react/components/Logo.tsx` (NEW)

SVG logo inline (NU PNG dependency until task_20 PWA icons):
```tsx
export function Logo({ className }: { className?: string }): JSX.Element {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-label="Andura logo">
      <circle cx="50" cy="50" r="48" fill="var(--brick)" />
      <text x="50" y="62" textAnchor="middle" fill="var(--paper)" fontSize="40" fontWeight="bold">A</text>
    </svg>
  );
}
```

Placeholder until task_20 design final logo. Bugatti craft pre-Beta — replace cu real branded logo final.

### C. `src/react/routes/router.tsx` (route order)

```tsx
{
  path: '/',
  element: <Splash />, // root path = splash if not auth+onboarded
},
{
  path: '/onboarding',
  element: <Onboarding />,
},
{
  path: '/auth',
  element: <Auth />,
},
{
  path: '/',
  element: <Layout />,
  children: [
    { path: 'antrenor', element: <Antrenor /> },
    // ... rest existing
  ],
},
```

Restructure routing: splash gate at root + onboarding + auth standalone + Layout `<Outlet>` cu BottomNav inside protected scope.

### D. `App.tsx` startup hooks

```tsx
useEffect(() => {
  migrateFromLocalStorage(); // task_12 dependency
  rotateTiers(); // task_12 dependency
}, []);
```

NU show splash daca already authenticated + onboarded (auto-redirect via Splash useEffect).

## §3 Acceptance criteria

- [ ] Splash renders logo + tagline + 2 CTAs (Incepe + Am deja cont)
- [ ] Auto-redirect /antrenor când authenticated + onboarded
- [ ] Logo SVG placeholder (task_20 PWA icons replace final)
- [ ] App startup invokes Dexie migration + tier rotation
- [ ] Routing order splash gate at root path
- [ ] Mockup parity preserved (#screen-splash visual)
- [ ] Tests +5-10 PASS
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/Splash.test.tsx
- renders logo + tagline + 2 CTAs
- auto-redirects when authenticated + onboarded
- "Incepe" CTA navigates /onboarding
- "Am deja cont" CTA navigates /auth

src/react/__tests__/Logo.test.tsx
- renders SVG with aria-label
- accepts className prop

src/react/__tests__/App.startup.test.tsx
- invokes migrateFromLocalStorage on mount
- invokes rotateTiers on mount
```

## §5 Commits (atomic 1-2)

```
feat(react/screens): Splash first-launch screen + Logo SVG placeholder

Mockup #screen-splash parity. 2 CTAs Incepe + Am deja cont. Auto-redirect
/antrenor când authenticated + onboarded. Logo SVG inline placeholder
pre-task_20 PWA icons replace final.

feat(react/App): startup hooks migrateFromLocalStorage + rotateTiers

App.tsx useEffect on mount invokes Dexie migration helper one-time +
tier rotation lazy startup invariant. Routing restructure splash gate
at root path / + auth + onboarding + Layout Outlet protected scope.
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_15_splash_landing.md`:
- Routing order refactor
- Auto-redirect logic gates
- Logo SVG placeholder spec (replace task_20)
- App.tsx startup hooks invocation
