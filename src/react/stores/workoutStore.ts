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
import { DB, todTs } from '../../db.js';

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

// Phase 5 task_03: per-exercise breakdown saved cu sessionsHistory pentru
// IstoricDetail granular render. Optional field — backward compat pentru
// sesiuni persisted Phase 4 fără breakdown.
export interface SessionExerciseBreakdown {
  exerciseId: string;
  exerciseName: string;
  sets: Array<{
    kg: number;
    reps: number;
    rating: 'usor' | 'potrivit' | 'greu';
    timestamp: number;
    isPR?: boolean;
  }>;
  totalVolume: number; // sum(kg*reps)
  peakOneRM: number; // max Epley estimate across sets, 1 decimal
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
  // Phase 5 task_03: per-exercise breakdown pentru IstoricDetail.
  exercises?: SessionExerciseBreakdown[];
}

// ── Logs writeback shim (CRIT #2 shape-check audit chat 5) ─────────────────
// Post-D028 vanilla retire → React-side workoutStore.finishSession never
// persists logs to DB. Engine adapters (readiness/fatigue/adherence/MMI/
// stagnationDetector) consume DB.get('logs') → permanent input-starved.
//
// Per-set flat schema matches legacy src/pages/coach/logging.js:195 engine
// consumer contract (NOT session-aggregate — engines filter by l.session +
// l.ex + l.w). Cap 5000 entries matches legacy logging.js:198 convention.
// Newest-first (unshift) preserves dp.getLogs slice(0, n) recency assumption.
//
// Cross-refs:
//   - src/engine/fatigue.js#calculateFatigueScore reads l.session + l.ts
//   - src/engine/dp.js#getLogs reads l.ex + l.w slice top N recent
//   - src/engine/prEngine.js#detectPR reads l.ex + l.w + l.reps
export interface LogEntry {
  date: string;
  ex: string;
  w: number;
  kg: number;
  set: number;
  sets: number;
  reps: string;
  ts: number;
  session: number;
  isPR?: boolean;
}

export const LOGS_MAX = 5000;

export function buildLogEntriesFromSummary(
  summary: LastSessionSummary,
  sessionStart: number
): LogEntry[] {
  const entries: LogEntry[] = [];
  const exercises = summary.exercises ?? [];
  for (const ex of exercises) {
    let setIdx = 0;
    for (const s of ex.sets) {
      setIdx += 1;
      const ts = s.timestamp;
      entries.push({
        date: todTs(ts),
        ex: ex.exerciseName,
        w: s.kg,
        kg: s.kg,
        set: setIdx,
        sets: 1,
        reps: String(s.reps),
        ts,
        session: sessionStart,
        ...(s.isPR ? { isPR: true } : {}),
      });
    }
  }
  return entries;
}

export function persistSessionLogs(
  summary: LastSessionSummary,
  sessionStart: number | null
): void {
  if (sessionStart == null) return;
  try {
    const newEntries = buildLogEntriesFromSummary(summary, sessionStart);
    if (newEntries.length === 0) return;
    const existing = DB.get<LogEntry[]>('logs') ?? [];
    // Newest-first: prepend new entries reversed so chronologically-latest set
    // ends up at index 0 (matches legacy unshift loop order). New entries
    // already iterated exIdx ascending + setIdx ascending; reverse to get
    // latest-set-first within session.
    const merged = [...newEntries.slice().reverse(), ...existing].slice(0, LOGS_MAX);
    DB.set('logs', merged);
  } catch {
    // Soft-fail — storage quota / SSR jsdom edge. Engine adapters tolerate
    // missing logs (return 'DATE INSUFICIENTE' baseline). Preserves zero-
    // throw render contract Zustand action boundary.
  }
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

// ── §44-C1 Discriminated Union — WorkoutMode FSM tag ────────────────────────
// Pure-function selector `getCurrentMode(state)` derives a tagged variant out
// of the existing WorkoutState shape (zero breaking change to consumers care
// still field-access direct). 5 mutually exclusive modes per audit §44:
//   idle      → no active session + no paused snapshot + no lastSession
//   active    → sessionStart set (phase logging|rating|transition)
//   resting   → sessionStart set + phase=rest
//   paused    → pausedSnapshot present, sessionStart null
//   finished  → lastSession present + idle + no paused (postSession surface)
// Exhaustiveness compiler check via `switch` on .kind cu `default: never`.
export type WorkoutMode = 'idle' | 'active' | 'resting' | 'paused' | 'finished';

export type WorkoutModeView =
  | { kind: 'idle' }
  | { kind: 'active'; sessionStart: number; exIdx: number; phase: WorkoutPhase }
  | { kind: 'resting'; sessionStart: number; exIdx: number }
  | { kind: 'paused'; snapshot: PausedSession }
  | { kind: 'finished'; lastSession: LastSessionSummary };

// Minimum-fields shape accepted de getCurrentMode (avoid over-binding la
// WorkoutState complet). Consumers pot pass-in literal subscriptions individual
// din primitive selectors — stable refs, NU object-identity churn per render.
export interface WorkoutModeInputs {
  phase: WorkoutPhase;
  sessionStart: number | null;
  pausedSnapshot: PausedSession | null;
  lastSession: LastSessionSummary | null;
  exIdx: number;
}

// Derive current mode from minimum WorkoutState slice. Priority order:
//   1. active session (sessionStart !== null) → resting if phase=rest else active
//   2. paused snapshot (no live session)
//   3. finished (lastSession present, no live, no paused)
//   4. idle (default)
export function getCurrentMode(state: WorkoutModeInputs): WorkoutModeView {
  if (state.sessionStart !== null) {
    if (state.phase === 'rest') {
      return { kind: 'resting', sessionStart: state.sessionStart, exIdx: state.exIdx };
    }
    return {
      kind: 'active',
      sessionStart: state.sessionStart,
      exIdx: state.exIdx,
      phase: state.phase,
    };
  }
  if (state.pausedSnapshot !== null) {
    return { kind: 'paused', snapshot: state.pausedSnapshot };
  }
  if (state.lastSession !== null) {
    return { kind: 'finished', lastSession: state.lastSession };
  }
  return { kind: 'idle' };
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
        set((s) => {
          // CRIT #2 shape-check audit chat 5 — persist per-set logs to DB so
          // engine adapters (readiness/fatigue/adherence/MMI/stagnationDetector)
          // receive real session history from React production path. Pure
          // side-effect at action boundary per ADR 026 §9 (engines read DB
          // synchronously; localStorage write is sync). Soft-fail inside
          // persistSessionLogs preserves zero-throw render contract.
          persistSessionLogs(summary, s.sessionStart);
          return {
            phase: 'idle' as WorkoutPhase,
            sessionStart: null,
            lastSession: summary,
            // Phase 4 task_21: append la sessionsHistory cumulative list
            // pentru Istoric tab. Newest tail (reverse-chrono UI iter pe display).
            sessionsHistory: [...s.sessionsHistory, summary],
            exIdx: 0,
            setIdx: 0,
            history: {},
          };
        }),

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
