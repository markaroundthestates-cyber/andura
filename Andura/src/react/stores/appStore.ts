// ══ APP STORE — Zustand Skeleton (Phase 2 Routing Skeleton extend) ════════
// Per DECISIONS.md §D015 + §D016 + Co-CTO LOCK Phase 2 routing C hybrid.
// Phase 2 adds auth slice stub (Phase 3+ wires real Firebase Magic Link).
// Phase 3+ expands workout state machine, calendar, history, settings slices.
//
// Cross-refs:
//   - DECISIONS.md §D015 STRAT PIVOT React Andura Clasic
//   - DECISIONS.md §D016 PROC nav 6→4 + screens 50+ în React build only

import { create } from 'zustand';

export type Persona = 'maria' | 'gigica' | 'marius';

export interface AppState {
  /** Persona variant per mockup .persona-* CSS classes */
  persona: Persona;
  /** Phase 1 placeholder — Phase 3+ replaced cu onboarding step state */
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
