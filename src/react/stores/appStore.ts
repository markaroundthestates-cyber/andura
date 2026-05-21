// ══ APP STORE — Zustand Skeleton (Phase 2 Routing Skeleton extend) ════════
// Per DECISIONS.md §D015 + §D016 + Co-CTO LOCK Phase 2 routing C hybrid.
// Phase 2 adds auth slice stub (Phase 3+ wires real Firebase Magic Link).
// Phase 3+ expands workout state machine, calendar, history, settings slices.
//
// §B006/D-2 audit fix (D046 §3.2 Cluster E020 Slice 1.x) — Skip-auth state
// pentru Maria 65 "test drive" paradigm. User can try app fără Magic Link
// cont; data stays Tier 0 local; future "Iesi din modul test" → /auth real.
//
// Cross-refs:
//   - DECISIONS.md §D015 STRAT PIVOT React Andura Clasic
//   - DECISIONS.md §D016 PROC nav 6→4 + screens 50+ în React build only
//   - DECISIONS.md §D046 §3.2 OAuth Cluster E REVERSE include Beta scope iter 2

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Persona = 'maria' | 'gigica' | 'marius';

export interface AppState {
  /** Persona variant per mockup .persona-* CSS classes */
  persona: Persona;
  /** Phase 1 placeholder — Phase 3+ replaced cu onboarding step state */
  initialized: boolean;
  /** Phase 2 auth slice stub — Phase 3+ wire real Firebase Magic Link */
  isAuthenticated: boolean;
  /** §B006/D-2 Slice 1.x — Skip-auth "test drive" mode (Maria 65 friction-low) */
  isSkipAuth: boolean;
  /** Mutators */
  setPersona: (p: Persona) => void;
  setInitialized: (v: boolean) => void;
  setAuthenticated: (v: boolean) => void;
  setSkipAuth: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      persona: 'gigica',
      initialized: false,
      isAuthenticated: false,
      isSkipAuth: false,
      setPersona: (persona) => set({ persona }),
      setInitialized: (initialized) => set({ initialized }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setSkipAuth: (isSkipAuth) => set({ isSkipAuth }),
    }),
    {
      name: 'wv2-app-store',
      storage: createJSONStorage(() => localStorage),
      // Partialize — only persist isSkipAuth across reloads (Maria 65 test drive
      // continuity). isAuthenticated remains derived from firebase-* tokens via
      // ProtectedRoute sync. persona + initialized are session-scope.
      partialize: (state) => ({ isSkipAuth: state.isSkipAuth }) as Partial<AppState>,
    },
  ),
);
