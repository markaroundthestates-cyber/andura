// ══ PR HISTORY AGGREGATE — React-side PR Wall + Streak Stats ═════════════
// Phase 5 task_11 — extract PR markers din sessionsHistory pentru Istoric
// PR Wall + Progres streak stats. ZERO src/engine/* mutation. Composes
// workoutStore.sessionsHistory (per task_03 sessionsHistory schema) into
// flat PR list + streak metrics.

import { useWorkoutStore } from '../stores/workoutStore';

export interface PRRecord {
  exerciseId: string;
  exerciseName: string;
  kg: number;
  reps: number;
  // MED-CODE-19 fix 2026-05-23: per-set Epley estimate (kg * (1 + reps/30)),
  // NU ex.peakOneRM (exercise-level max across ALL sets in session). Display
  // surface "{kg} kg x {reps} (~{X} kg 1RM)" reads as THIS set's 1RM →
  // semantic must match value. Prior bug = data integrity user-facing
  // (multi-set exercises showed inflated peak instead of actual set 1RM).
  oneRMEstimate: number;
  sessionTs: number;
  sessionTitle: string;
}

export interface StreakStats {
  currentStreak: number;
  totalSessions: number;
  prCount: number;
  thisWeekSessions: number;
}

const MS_PER_DAY = 86_400_000;

/** Epley 1RM estimate: kg * (1 + reps/30), 1 decimal precision. */
function setOneRMEstimate(kg: number, reps: number): number {
  if (kg <= 0 || reps <= 0) return 0;
  return Math.round(kg * (1 + reps / 30) * 10) / 10;
}

/** Extract all PR records din sessionsHistory cu exercises breakdown. */
export function getPRHistoryAll(): PRRecord[] {
  const sessions = useWorkoutStore.getState().sessionsHistory;
  const result: PRRecord[] = [];
  for (const session of sessions) {
    if (!session.exercises) continue;
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (set.isPR) {
          result.push({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            kg: set.kg,
            reps: set.reps,
            oneRMEstimate: setOneRMEstimate(set.kg, set.reps),
            sessionTs: session.ts,
            sessionTitle: session.title,
          });
        }
      }
    }
  }
  // Reverse chrono (newest first).
  return result.sort((a, b) => b.sessionTs - a.sessionTs);
}

/** Compose streak stats from current state + sessionsHistory. */
export function getStreakStats(): StreakStats {
  const state = useWorkoutStore.getState();
  const sessions = state.sessionsHistory;
  const now = Date.now();
  const weekAgo = now - 7 * MS_PER_DAY;
  const thisWeekSessions = sessions.filter((s) => s.ts >= weekAgo).length;
  const prCount = sessions.reduce(
    (acc, s) =>
      acc +
      (s.exercises?.reduce(
        (acc2, ex) => acc2 + ex.sets.filter((set) => set.isPR).length,
        0,
      ) ?? 0),
    0,
  );
  return {
    currentStreak: state.streak,
    totalSessions: sessions.length,
    prCount,
    thisWeekSessions,
  };
}
