// ── Recovery log flatten + RO↔EN volume bridge helpers ────────────────────
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.

import { BIG11_RO_TO_EN_MAP } from '../../periodization/constants.js';

/**
 * Flatten engine recentSessions[*] → muscleRecovery LogEntry[] rows. Mirrors the
 * Progress-tab manikin flattener (MuscleRecoveryGrid.flattenSessionsToLogs): the
 * recovery engine's getMuscleState filters out rows without a weight (`l.w`), so
 * each set must emit { ex, ts, w } — emitting only ex+ts would make every group
 * read 'recovered' (silent no-op). recentSessions carries the persisted
 * SessionExerciseBreakdown shape (exercises[*].exerciseName + sets[*].kg/timestamp).
 * Pure read — no mutation of the input sessions.
 *
 * @param {Array<{exercises?: Array<{exerciseName?: string, sets?: Array<{kg?: number, reps?: number, timestamp?: number}>}>}>} sessions
 * @returns {Array<{ex: string, ts: number, w: number, reps: number}>}
 */
export function flattenSessionsToRecoveryLogs(sessions) {
  const logs = [];
  if (!Array.isArray(sessions)) return logs;
  for (const session of sessions) {
    const exercises = session && Array.isArray(session.exercises) ? session.exercises : [];
    for (const ex of exercises) {
      const name = ex && typeof ex.exerciseName === 'string' ? ex.exerciseName : '';
      const sets = ex && Array.isArray(ex.sets) ? ex.sets : [];
      for (const set of sets) {
        if (!set) continue;
        logs.push({
          ex: name,
          ts: typeof set.timestamp === 'number' ? set.timestamp : 0,
          w: typeof set.kg === 'number' ? set.kg : 0,
          reps: typeof set.reps === 'number' ? set.reps : 0,
        });
      }
    }
  }
  return logs;
}

/**
 * Translate a Big-11 RO-keyed volume map back to Big-11 EN keys (inverse of
 * toCanonicalRO) so the recovery-adjusted budget still resolves through
 * setsForGroup, which reads volumeTargets[BIG11_RO_TO_EN_MAP[group]]. Keys absent
 * from the map pass through unchanged (defensive). Pure.
 *
 * @param {Object<string, number>} roMap - Big-11 RO keyed → sets/week
 * @returns {Object<string, number>} - Big-11 EN keyed → sets/week
 */
export function toCanonicalEN(roMap) {
  if (!roMap || typeof roMap !== 'object') return {};
  const out = {};
  for (const [key, value] of Object.entries(roMap)) {
    const enKey = BIG11_RO_TO_EN_MAP[key] ?? key;
    out[enKey] = value;
  }
  return out;
}
