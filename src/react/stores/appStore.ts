// ══ APP STORE — Zustand Skeleton (Phase 1 Foundation) ═════════════════════
// Per DECISIONS.md §D015 + §D016. Phase 2+ expands cu workout state machine,
// calendar, history, settings slices. Phase 1 = skeleton verify Zustand wire.
// Mockup parity: localStorage persistence pattern (Phase 2 add middleware).
//
// Cross-refs:
//   - DECISIONS.md §D015 STRAT PIVOT React Andura Clasic
//   - Mockup andura-clasic.html state patterns (localStorage keys, persona,
//     onboarding flow) — Phase 2 detailed mapping

import { create } from 'zustand';

export interface AppState {
  /** Current persona variant per mockup .persona-* CSS classes */
  persona: 'maria' | 'gigica' | 'marius';
  /** Phase 1 placeholder flag — Phase 2 replaced cu onboarding step state */
  initialized: boolean;
  /** Mutators */
  setPersona: (p: AppState['persona']) => void;
  setInitialized: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  persona: 'gigica',
  initialized: false,
  setPersona: (persona) => set({ persona }),
  setInitialized: (initialized) => set({ initialized }),
}));
