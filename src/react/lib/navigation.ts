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
  | 'onb-1' | 'onb-2' | 'onb-3' | 'onb-4' | 'onb-5' | 'onb-6' | 'onb-7' | 'onb-8' | 'onb-9'
  // Tab roots
  | 'antrenor' | 'progres' | 'istoric' | 'cont'
  // Phase 3 Antrenor sub-screens
  | 'energy-check' | 'energy-cause'
  | 'time-budget'
  | 'workout-preview' | 'workout'
  | 'ceva-nu-merge' | 'pain-button'
  | 'equipment-swap' | 'aparate-lipsa'
  | 'schedule-override'
  | 'post-rpe' | 'post-summary'
  // Phase 4 Progres sub-screens (task_16)
  | 'log-weight' | 'weight-log-list'
  // Phase 6 Cont sub-screens (task_09-17)
  | 'settings-profile' | 'settings-notifications' | 'settings-subscription'
  | 'settings-appearance' | 'settings-prefs' | 'settings-exercise-library' | 'settings-privacy'
  | 'settings-terms' | 'settings-export' | 'settings-import' | 'settings-danger'
  | 'settings-about' | 'settings-support' | 'settings-faq'
  // Account regroup 2026-06-12 — grouped hubs (fewer rows, logical grouping).
  // Each hub merges 2-3 former rows behind one screen + segmented control.
  | 'cont-exercitii-echipament' | 'cont-datele-mele'
  | 'cont-confidentialitate-termeni' | 'cont-ajutor-despre'
  // §D047 RIP-OUT drill-down confirm screens (A003 ConfirmModal replacement)
  | 'logout-confirm' | 'delete-account-confirm' | 'reset-data-confirm'
  // §B002 D047 Stage 3 — Avansat section drill-downs
  | 'redo-onboarding-confirm' | 'schimba-faza-confirm' | 'reset-coach-confirm'
  // §B004 D047 Stage 3 — Workout exit drill-down
  | 'finish-early-confirm'
  // PARITY-CONFIRM-MODALS Wave 2f — program change drill-down (PAR-003)
  | 'program-change-confirm'
  // PARITY-MISSING-SCREENS Wave 2e — NEW screens (PAR-001/004)
  | 'pr-wall' | 'weight-timeline';

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
    screen === 'onb-7' || screen === 'onb-8' || screen === 'onb-9'
  ) {
    const step = screen.slice(4);
    return `/onboarding/${step}`;
  }

  // Nested per-tab roots (bottom nav vizibil)
  if (screen === 'antrenor') return '/app/antrenor';
  if (screen === 'progres') return '/app/progres';
  if (screen === 'istoric') return '/app/istoric';
  if (screen === 'cont') return '/app/cont';

  // Phase 3 Antrenor sub-screens (bottom nav vizibil, nested sub /app/antrenor)
  if (
    screen === 'energy-check' || screen === 'energy-cause' ||
    screen === 'time-budget' ||
    screen === 'workout-preview' || screen === 'workout' ||
    screen === 'ceva-nu-merge' || screen === 'pain-button' ||
    screen === 'equipment-swap' || screen === 'aparate-lipsa' ||
    screen === 'schedule-override' ||
    screen === 'post-rpe' || screen === 'post-summary' ||
    screen === 'finish-early-confirm' ||
    screen === 'program-change-confirm'
  ) {
    return `/app/antrenor/${screen}`;
  }

  // Phase 4 Progres sub-screens (task_16, nested sub /app/progres)
  if (screen === 'log-weight' || screen === 'weight-log-list') {
    return `/app/progres/${screen}`;
  }

  // PARITY-MISSING-SCREENS Wave 2e — Progres + Istoric standalone sub-screens
  if (screen === 'weight-timeline') return '/app/progres/weight-timeline';
  if (screen === 'pr-wall') return '/app/istoric/pr-wall';

  // Exercise Library — Cont › General drill-down (CORE_AUTO by muscle group).
  // Explicit path (NOT the settings-* convention) per spec: /app/cont/exercise-library.
  if (screen === 'settings-exercise-library') return '/app/cont/exercise-library';

  // Account regroup 2026-06-12 — grouped hubs (explicit dashed paths). Each
  // hosts 2-3 former settings screens behind one segmented/stacked screen.
  if (screen === 'cont-exercitii-echipament') return '/app/cont/exercitii-echipament';
  if (screen === 'cont-datele-mele') return '/app/cont/datele-mele';
  if (screen === 'cont-confidentialitate-termeni') return '/app/cont/confidentialitate-termeni';
  if (screen === 'cont-ajutor-despre') return '/app/cont/ajutor-despre';

  // Phase 6 Cont sub-screens (task_09-17, nested sub /app/cont)
  if (
    screen === 'settings-profile' || screen === 'settings-notifications' ||
    screen === 'settings-subscription' || screen === 'settings-appearance' ||
    screen === 'settings-prefs' || screen === 'settings-privacy' ||
    screen === 'settings-terms' || screen === 'settings-export' ||
    screen === 'settings-import' ||
    screen === 'settings-danger' || screen === 'settings-about' ||
    screen === 'settings-support' || screen === 'settings-faq'
  ) {
    return `/app/cont/${screen}`;
  }

  // §D047 RIP-OUT drill-down confirm screens (nested sub /app/cont)
  if (
    screen === 'logout-confirm' || screen === 'delete-account-confirm' ||
    screen === 'reset-data-confirm' || screen === 'redo-onboarding-confirm' ||
    screen === 'schimba-faza-confirm' || screen === 'reset-coach-confirm'
  ) {
    return `/app/cont/${screen}`;
  }

  // Exhaustive fallback (TS catches missing cases at compile)
  const _exhaustive: never = screen;
  throw new Error(`Unknown screen: ${_exhaustive as string}`);
}
