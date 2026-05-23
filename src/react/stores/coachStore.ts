// ══ COACH STORE — Zustand Coach Context Slice ═════════════════════════════
// Per DECISIONS.md §D-LEGACY-052 Andura Suflet + §D-LEGACY-065 Gigel Test.
// _schedContext + persona variant + win-back dismiss flag.
//
// In prod _schedContext va veni din coachDirector.buildSession() result —
// Phase 3 placeholder hardcoded 'workout' (Tweaks panel mockup override).
//
// Cross-refs:
//   - DECISIONS.md §D015 STRAT PIVOT React Andura Clasic
//   - mockup andura-clasic.html .persona-* CSS classes + tweaks panel

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SchedContext = 'workout' | 'rest';
export type Persona = 'maria' | 'gigica' | 'marius';

export interface CoachState {
  schedContext: SchedContext;
  persona: Persona;
  reactivateDismissed: boolean;
}

export interface CoachActions {
  setSchedContext: (ctx: SchedContext) => void;
  setPersona: (p: Persona) => void;
  dismissReactivate: () => void;
  resetDismissReactivate: () => void;
}

export const useCoachStore = create<CoachState & CoachActions>()(
  persist(
    (set) => ({
      schedContext: 'workout',
      persona: 'gigica',
      reactivateDismissed: false,
      setSchedContext: (schedContext) => set({ schedContext }),
      setPersona: (persona) => set({ persona }),
      dismissReactivate: () => set({ reactivateDismissed: true }),
      resetDismissReactivate: () => set({ reactivateDismissed: false }),
    }),
    {
      name: 'wv2-coach-store',
      storage: createJSONStorage(() => localStorage),
      // SUB-CHAT5-004 blueprint consistency — explicit partialize doar data
      // fields (NU actions). Match appStore + scheduleStore + workoutStore
      // existing pattern. Removes future bug surface unde action functions
      // ar putea accidental serialize via persist default full-state.
      partialize: (state) => ({
        schedContext: state.schedContext,
        persona: state.persona,
        reactivateDismissed: state.reactivateDismissed,
      }) as Partial<CoachState & CoachActions>,
    }
  )
);
