// ══ WORKOUT STORE — Zustand State Machine V2 ══════════════════════════════
// Per DECISIONS.md §D015 §D016 + mockup wv2 object port React.
// Pure-function actions per ADR 026 §9, side-effects la I/O boundary
// (persist middleware Zustand pentru localStorage sync).
//
// Cross-refs:
//   - DECISIONS.md §D015 STRAT PIVOT React Andura Clasic
//   - DECISIONS.md §D-LEGACY-013 Auto-Aggression Detection (force-typing ELIMINATED)
//   - mockup andura-clasic.html wv2 object reference

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type WorkoutPhase = 'logging' | 'rating' | 'rest' | 'transition' | 'idle';

export interface ExerciseHistoryEntry {
  kg: number;
  reps: number;
  rating: 'usor' | 'potrivit' | 'greu';
  // Phase 4 task_14: timestamp pentru aaFrictionDetect fast_sets pattern.
  // Optional pentru backward compat — logSet action auto-set Date.now()
  // dacă call site nu provides.
  timestamp?: number;
}

// Phase 4 task_10/18: PR detection payload (engineWrappers.getPRDelta result).
export interface PRData {
  exercise: string;
  deltaKg: number;
  type: 'weight' | 'reps' | 'volume';
  // Phase 4 task_18: enriched fields optional pentru backward compat (zero
  // legacy default cand absent). PostSummary banner Phase 5+ task_22
  // visual extension uses these.
  deltaPct?: number;
  oneRMEstimate?: number;
}

export interface PausedSession {
  title: string;
  meta: string;
  exIdx: number;
  setIdx: number;
  phase: WorkoutPhase;
  history: Record<number, ExerciseHistoryEntry[]>;
  sessionStart: number;
}

export interface LastSessionSummary {
  title: string;
  meta: string; // "5 seturi · 52 min · 12 450 kg" — display string (legacy + UI)
  ts: number; // Date.now() la finish
  // Phase 4 task_10: numeric fields preserved separat de display string
  // pentru clean consumption (eliminate PostSummary parseMeta regex stub).
  // Optional pentru backward compat cand persisted pre-migration.
  sets?: number;
  durationMin?: number;
  volumeKg?: number;
}

export interface WorkoutState {
  exIdx: number;
  setIdx: number;
  phase: WorkoutPhase;
  prHit: boolean;
  prData: PRData | null; // Phase 4 task_10: details despre PR detected (NU just flag)
  history: Record<number, ExerciseHistoryEntry[]>;
  sessionStart: number | null;
  lastRating: 'usoara' | 'normala' | 'grea' | null;
  pausedSnapshot: PausedSession | null;
  lastSession: LastSessionSummary | null;
  // Phase 4 task_21: persisted past sessions cumulative list pentru Istoric
  // tab list view + detail navigation. Reverse-chrono append (newest tail).
  sessionsHistory: LastSessionSummary[];
  streak: number;
}

export interface WorkoutActions {
  startSession: (sessionStart: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  discardSession: () => void;
  finishSession: (summary: LastSessionSummary) => void;
  setPhase: (phase: WorkoutPhase) => void;
  logSet: (exIdx: number, entry: ExerciseHistoryEntry) => void;
  advanceExercise: () => void;
  markPRHit: (data?: PRData) => void;
  setLastRating: (rating: 'usoara' | 'normala' | 'grea') => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutState & WorkoutActions>()(
  persist(
    (set) => ({
      exIdx: 0,
      setIdx: 0,
      phase: 'idle',
      prHit: false,
      prData: null,
      history: {},
      sessionStart: null,
      lastRating: null,
      pausedSnapshot: null,
      lastSession: null,
      sessionsHistory: [],
      streak: 0,

      startSession: (sessionStart) =>
        set({
          sessionStart,
          phase: 'logging',
          exIdx: 0,
          setIdx: 0,
          prHit: false,
          prData: null,
          history: {},
        }),

      pauseSession: () =>
        set((s) => ({
          pausedSnapshot: s.sessionStart
            ? {
                title: 'Push',
                meta: `ex ${s.exIdx + 1}`,
                exIdx: s.exIdx,
                setIdx: s.setIdx,
                phase: s.phase,
                history: s.history,
                sessionStart: s.sessionStart,
              }
            : null,
          phase: 'idle',
          sessionStart: null,
        })),

      resumeSession: () =>
        set((s) =>
          s.pausedSnapshot
            ? {
                exIdx: s.pausedSnapshot.exIdx,
                setIdx: s.pausedSnapshot.setIdx,
                phase: s.pausedSnapshot.phase,
                history: s.pausedSnapshot.history,
                sessionStart: s.pausedSnapshot.sessionStart,
                pausedSnapshot: null,
              }
            : {}
        ),

      discardSession: () =>
        set({
          phase: 'idle',
          exIdx: 0,
          setIdx: 0,
          history: {},
          sessionStart: null,
          prHit: false,
          prData: null,
          pausedSnapshot: null,
        }),

      finishSession: (summary) =>
        set((s) => ({
          phase: 'idle',
          sessionStart: null,
          lastSession: summary,
          // Phase 4 task_21: append la sessionsHistory cumulative list
          // pentru Istoric tab. Newest tail (reverse-chrono UI iter pe display).
          sessionsHistory: [...s.sessionsHistory, summary],
          exIdx: 0,
          setIdx: 0,
          history: {},
        })),

      setPhase: (phase) => set({ phase }),

      logSet: (exIdx, entry) =>
        set((s) => ({
          history: {
            ...s.history,
            // Phase 4 task_14: auto-stamp timestamp dacă nu provided pentru
            // aaFrictionDetect fast_sets interval calculation. Backward compat
            // existing test call sites care nu specifica timestamp.
            [exIdx]: [
              ...(s.history[exIdx] || []),
              { ...entry, timestamp: entry.timestamp ?? Date.now() },
            ],
          },
        })),

      advanceExercise: () =>
        set((s) => ({ exIdx: s.exIdx + 1, setIdx: 0, phase: 'logging' })),

      markPRHit: (data) => set({ prHit: true, prData: data ?? null }),

      setLastRating: (rating) => set({ lastRating: rating }),

      incrementStreak: () => set((s) => ({ streak: s.streak + 1 })),

      resetStreak: () => set({ streak: 0 }),

      reset: () =>
        set({
          exIdx: 0,
          setIdx: 0,
          phase: 'idle',
          prHit: false,
          prData: null,
          history: {},
          sessionStart: null,
          lastRating: null,
          pausedSnapshot: null,
        }),
    }),
    {
      name: 'wv2-workout-store',
      storage: createJSONStorage(() => localStorage),
      // Persist selective: pausedSnapshot + lastSession + sessionsHistory +
      // streak (NU sessionStart runtime-only). Phase 4 task_21 adds history
      // pentru Istoric tab persistent browse.
      partialize: (state) => ({
        pausedSnapshot: state.pausedSnapshot,
        lastSession: state.lastSession,
        sessionsHistory: state.sessionsHistory,
        streak: state.streak,
      }) as Partial<WorkoutState & WorkoutActions>,
    }
  )
);
