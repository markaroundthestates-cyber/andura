---
title: PHASE2_TASK_1_ROUTER_PROTECTED_NAV.md
type: cc-autonomous-task
model: Opus EXCLUSIVELY
phase: Phase 2 Routing Skeleton
task: 1 of 3
depends-on: pre-flight verde (Phase 1 LANDED 3750 PASS, branch feature/v3-react-clasic, backup tag pre-phase-2 pushed)
---

# PHASE 2 TASK 1 — Zustand Auth Slice + ProtectedRoute + BottomNav + Navigation Helper

## Goal
Extend Zustand `appStore` cu auth slice stub (`isAuthenticated`), create `<ProtectedRoute>` wrapper, `<BottomNav>` component cu 4 taburi LOCKED V1 (Antrenor/Progres/Istoric/Cont) + active tab derivat path prefix, navigation helper `src/react/lib/navigation.ts` mockup `goto()` convention LOCK.

## Steps

### 1.1 — Extend `src/react/stores/appStore.ts` cu auth slice stub

Read curent content (Phase 1: persona + initialized + setters). Append auth slice:

```typescript
import { create } from 'zustand';

export type Persona = 'maria' | 'gigica' | 'marius';

export interface AppState {
  /** Persona variant per mockup .persona-* CSS classes */
  persona: Persona;
  /** Phase 1 placeholder — Phase 2 replaced cu onboarding step state */
  initialized: boolean;
  /** Phase 2 auth slice stub — Phase 3+ wire real Firebase Magic Link */
  isAuthenticated: boolean;
  /** Mutators */
  setPersona: (p: Persona) => void;
  setInitialized: (v: boolean) => void;
  setAuthenticated: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  persona: 'gigica',
  initialized: false,
  isAuthenticated: false,
  setPersona: (persona) => set({ persona }),
  setInitialized: (initialized) => set({ initialized }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));
```

### 1.2 — Create `src/react/routes/ProtectedRoute.tsx`

```typescript
// ══ PROTECTED ROUTE — Auth Gate Phase 2 Stub ══════════════════════════════
// Phase 2 stub: redirect la /auth dacă !isAuthenticated. Phase 3+ wire real
// Firebase Magic Link state + onboarding gate (T0 Big 6 hard typing).
//
// Cross-refs:
//   - DECISIONS.md §D015 + §D016 + Co-CTO LOCK Phase 2 routing C hybrid

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';

interface Props {
  children: ReactNode;
}

export function ProtectedRoute({ children }: Props): JSX.Element {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}
```

### 1.3 — Create `src/react/lib/navigation.ts`

```typescript
// ══ NAVIGATION HELPER — Mockup goto() Convention LOCK Phase 2 ═════════════
// Per Co-CTO LOCK 2026-05-16 chat ACASĂ: mockup goto('X') maps la React
// Router navigate(path) cu C hybrid strategy.
//
// Top-level (NU bottom nav):
//   - goto('splash')     → navigate('/')
//   - goto('auth')       → navigate('/auth')
//   - goto('auth-reactivate') → navigate('/auth/reactivate')
//   - goto('onb-N')      → navigate('/onboarding/N')
//   - goto('confirm-X')  → navigate('/confirm/X')
//
// Nested per-tab (bottom nav persistent):
//   - goto('antrenor')        → navigate('/app/antrenor')
//   - goto('energy-check')    → navigate('/app/antrenor/energy-check')
//   - goto('workout-preview') → navigate('/app/antrenor/workout-preview')
//   - goto('progres')         → navigate('/app/progres')
//   - goto('log-weight')      → navigate('/app/progres/log-weight')
//   - goto('istoric')         → navigate('/app/istoric')
//   - goto('pr-wall')         → navigate('/app/istoric/pr-wall')
//   - goto('cont')            → navigate('/app/cont')
//   - goto('settings-X')      → navigate('/app/cont/settings/X')
//
// Phase 3+ extends mapping cu full 50+ screens per tab.

export type GotoScreen =
  // Top-level
  | 'splash' | 'auth' | 'auth-reactivate'
  | 'onb-1' | 'onb-2' | 'onb-3' | 'onb-4' | 'onb-5' | 'onb-6' | 'onb-7'
  // Tab roots Phase 2 placeholder
  | 'antrenor' | 'progres' | 'istoric' | 'cont';
// Phase 3+ extends union cu sub-screens

/**
 * Map mockup screen name la React Router path.
 * Phase 2 supports tab roots + top-level screens only.
 * Phase 3+ extends cu sub-screens per tab.
 */
export function gotoPath(screen: GotoScreen): string {
  // Top-level (NU bottom nav)
  if (screen === 'splash') return '/';
  if (screen === 'auth') return '/auth';
  if (screen === 'auth-reactivate') return '/auth/reactivate';
  if (screen.startsWith('onb-')) {
    const step = screen.slice(4);
    return `/onboarding/${step}`;
  }

  // Nested per-tab roots (bottom nav vizibil)
  if (screen === 'antrenor') return '/app/antrenor';
  if (screen === 'progres') return '/app/progres';
  if (screen === 'istoric') return '/app/istoric';
  if (screen === 'cont') return '/app/cont';

  // Exhaustive fallback (TS catches missing cases at compile)
  const _exhaustive: never = screen;
  throw new Error(`Unknown screen: ${_exhaustive as string}`);
}
```

### 1.4 — Create `src/react/components/BottomNav.tsx`

```typescript
// ══ BOTTOM NAV — 4 Taburi LOCKED V1 (Antrenor/Progres/Istoric/Cont) ═══════
// Per DECISIONS.md §D-LEGACY-066 Root Nav V2 + §D015/§D016. Active tab
// derivat path prefix /app/{tab}/* — Co-CTO LOCK Phase 2 routing C hybrid.
// Tailwind classes parity mockup andura-clasic.html bottom-nav block.
// Persistent în Layout `<Outlet />` parent — NU re-renderează cross-tab.

import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, Clock, User } from 'lucide-react';

type Tab = 'antrenor' | 'progres' | 'istoric' | 'cont';

interface TabConfig {
  id: Tab;
  label: string;
  Icon: typeof Activity;
}

const TABS: TabConfig[] = [
  { id: 'antrenor', label: 'Antrenor', Icon: Activity },
  { id: 'progres', label: 'Progres', Icon: BarChart3 },
  { id: 'istoric', label: 'Istoric', Icon: Clock },
  { id: 'cont', label: 'Cont', Icon: User },
];

export function BottomNav(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (tab: Tab): boolean =>
    location.pathname === `/app/${tab}` ||
    location.pathname.startsWith(`/app/${tab}/`);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-paper border-t border-line flex justify-around items-center h-16 z-50"
      aria-label="Navigare principala"
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = isActive(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => navigate(`/app/${id}`)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full text-xs font-medium transition-colors ${
              active ? 'text-brick' : 'text-ink2'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

**Notă:** Lucide icons deja folosite în mockup (`lucide@latest` CDN). Pentru React build installez `lucide-react` dep dacă NU deja prezent. Verify:

```bash
node -e "const p = require('./package.json'); console.log('lucide-react:', p.dependencies['lucide-react'] || 'NOT INSTALLED')"
```

Dacă NOT INSTALLED:
```bash
npm install --save lucide-react
```

### 1.5 — Verify typecheck clean

```bash
npm run typecheck                                 # expect: 0 errors
```

## Success criteria

- `src/react/stores/appStore.ts` extended cu auth slice (`isAuthenticated` + `setAuthenticated`) ✓
- `src/react/routes/ProtectedRoute.tsx` created cu Navigate redirect logic ✓
- `src/react/lib/navigation.ts` created cu `GotoScreen` union type + `gotoPath()` exhaustive ✓
- `src/react/components/BottomNav.tsx` created cu 4 taburi + active tab derivat path prefix + Tailwind brick/ink2 colors + lucide-react icons ✓
- `lucide-react` installed dacă lipsea ✓
- `npm run typecheck` 0 errors ✓
- NU commits acum (accumulez Task 3) ✓

## Fail conditions

- TypeScript errors (e.g. JSX namespace, Navigate import, lucide-react types missing) → STOP, raport literal
- `lucide-react` install fail → STOP

## Output

"Task 1 DONE. Zustand auth slice extended. ProtectedRoute + BottomNav + navigation helper created. Typecheck clean. Continue Task 2."

---

🦫 **Surgical — ZERO modificări `src/main.tsx` sau `src/App.tsx` Phase 1 baseline (Phase 2 schimbă în Task 2 când wire Router). Vanilla legacy invariant.**
