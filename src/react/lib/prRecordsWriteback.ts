// ══ PR RECORDS WRITEBACK — CRIT #3 + MED #8 shape-check audit chat 5 ════════
// Post-D028 vanilla retire React-side PostRpe.handleSubmit never persists
// pr-records. MMI Engine #9 silent cap LANDED 53b97dff but
// buildSilentMmiContext returns null when prRecords.length === 0 ->
// returning user 6+mo never receives baseline weight protection.
//
// Shim additive: handleSubmit runs detectPR vs DB.get('logs') prior session
// history, enriches per-set isPR flag in exercises breakdown, then post-
// finishSession refreshes pr-records hash via extractAndSavePRs-equivalent
// pure scan. MMI Engine #9 now activatable in production real.
//
// Cross-refs:
//   - src/pages/coach/pr.js#extractAndSavePRs (legacy semantic reference)
//   - src/engine/prEngine.js#detectPR (PR detection contract)
//   - src/react/lib/prHistoryAggregate.ts#getPRHistoryAll (downstream consumer)
//   - src/react/lib/engineWrappers.ts#buildSilentMmiContext (MMI input)

import { detectPR } from '../../engine/prEngine.js';
import { DB } from '../../db.js';
import type {
  LogEntry,
  SessionExerciseBreakdown,
} from '../stores/workoutStore';

export interface PRRecordEntry {
  ex: string;
  kg: number;
  reps: number;
  date: string;
  ts: number;
  score: number;
}

// Engine prEngine.js#detectPR coerces ex.reps via Number(); both string
// (from src/pages/coach/logging.js:195 logEntry.reps = String(input)) +
// numeric (workoutStore ExerciseHistoryEntry.reps) accepted upstream.
// Local PriorHistoryEntry mirrors prEngine.d.ts#PRHistoryEntry exactly
// (reps: number) — string log reps are coerced via Number() at intake.
interface PriorHistoryEntry {
  ex?: string;
  w?: number;
  reps?: number;
  baseline?: boolean;
}

interface RawLogEntry {
  ex?: string;
  w?: number;
  reps?: number | string;
  baseline?: boolean;
}

function coercePriorHistory(logs: RawLogEntry[]): PriorHistoryEntry[] {
  return logs.map((l) => {
    const reps = typeof l.reps === 'string' ? Number(l.reps) : l.reps;
    const entry: PriorHistoryEntry = {};
    if (l.ex !== undefined) entry.ex = l.ex;
    if (l.w !== undefined) entry.w = l.w;
    if (reps !== undefined) entry.reps = reps;
    if (l.baseline !== undefined) entry.baseline = l.baseline;
    return entry;
  });
}

/**
 * Enrich exercises breakdown cu isPR flag per set. Iterates each set
 * chronologically (exIdx ascending + sets ascending within exercise) and
 * runs detectPR against accumulating prior history. PR detection follows
 * src/engine/prEngine.js semantics — weight / reps / volume PR types.
 *
 * Pure function — no DB writes. Returns new array (immutable input
 * preserved per ADR 026 §9). Used by PostRpe.handleSubmit before
 * finishSession so workoutStore persists isPR flags through summary path.
 *
 * @param exercises Existing breakdown without isPR populated.
 * @param priorLogs Prior session log entries (DB.get('logs') ?? []).
 * @returns New exercises array cu set.isPR populated.
 */
export function enrichExercisesWithPR(
  exercises: SessionExerciseBreakdown[],
  priorLogs: RawLogEntry[],
): SessionExerciseBreakdown[] {
  // Accumulator — starts with coerced prior logs, grows as sets are "logged".
  const acc: PriorHistoryEntry[] = coercePriorHistory(priorLogs);
  return exercises.map((ex) => ({
    ...ex,
    sets: ex.sets.map((s) => {
      // detectPR contract: { w, reps }. Returns null when no PR.
      const detection = detectPR(ex.exerciseName, { w: s.kg, reps: s.reps }, acc);
      // Add this set to accumulator AFTER detection (so within-session
      // progressive overload can produce multiple PRs on same exercise).
      acc.unshift({ ex: ex.exerciseName, w: s.kg, reps: s.reps });
      return detection ? { ...s, isPR: true } : s;
    }),
  }));
}

/**
 * Refresh pr-records hash from current DB.logs. Mirrors legacy
 * src/pages/coach/pr.js#extractAndSavePRs semantics — scan all non-baseline
 * logs, compute max score (kg × reps) per exercise, persist sorted
 * desc by ts.
 *
 * Soft-fail: any DB throw is swallowed. Preserves zero-throw render
 * contract Zustand action boundary downstream.
 *
 * @returns Array of PR records that were persisted (or [] on failure).
 */
export function refreshPRRecordsFromLogs(): PRRecordEntry[] {
  try {
    const logs = DB.get<LogEntry[]>('logs') ?? [];
    const prMap: Record<string, PRRecordEntry> = {};
    for (const l of logs) {
      if (!l || !l.w || !l.reps || (l as { baseline?: boolean }).baseline) continue;
      const reps = parseInt(l.reps, 10) || 1;
      const score = l.w * reps;
      const existing = prMap[l.ex];
      if (!existing || score > existing.score) {
        prMap[l.ex] = {
          ex: l.ex,
          kg: l.w,
          reps,
          date: l.date,
          ts: l.ts,
          score,
        };
      }
    }
    const prs = Object.values(prMap).sort((a, b) => (b.ts || 0) - (a.ts || 0));
    DB.set('pr-records', prs);
    return prs;
  } catch {
    return [];
  }
}
