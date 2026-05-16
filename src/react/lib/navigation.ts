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
  if (
    screen === 'onb-1' || screen === 'onb-2' || screen === 'onb-3' ||
    screen === 'onb-4' || screen === 'onb-5' || screen === 'onb-6' ||
    screen === 'onb-7'
  ) {
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
