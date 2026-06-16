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
import { isEnabled } from '../../util/featureFlags.js';
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
  // cycle16-calib-enrich-strip: detectPR excludes BOTH baseline AND calibration
  // from prevBest (prEngine.js). The enrich path must carry calibration too, or a
  // prior calibration anchor is read as a real prevBest (HIDING a genuine PR).
  calibration?: boolean;
}

interface RawLogEntry {
  ex?: string;
  w?: number;
  reps?: number | string;
  baseline?: boolean;
  calibration?: boolean;
}

function coercePriorHistory(logs: RawLogEntry[]): PriorHistoryEntry[] {
  return logs.map((l) => {
    const reps = typeof l.reps === 'string' ? Number(l.reps) : l.reps;
    const entry: PriorHistoryEntry = {};
    if (l.ex !== undefined) entry.ex = l.ex;
    if (l.w !== undefined) entry.w = l.w;
    if (reps !== undefined) entry.reps = reps;
    if (l.baseline !== undefined) entry.baseline = l.baseline;
    if (l.calibration !== undefined) entry.calibration = l.calibration;
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
  // ── BUILD F6b V2 #14 — carry the PR TYPE forward (spec §1b.1) ─────────────
  // detectPR already emits 'weight'|'reps'|'volume'; today this writeback
  // collapses all three to a flat `isPR: true` so a rep/volume PR is invisible.
  // When dp_rep_volume_pr_v1 is ON we additionally stamp `set.prType` so the
  // badge can render a per-type label. The field is additive + optional — OFF
  // (or any pre-existing isPR reader) ignores it → byte-identical. Flag read
  // once per call (cheap, deterministic per finishSession).
  const typedPR = isEnabled('dp_rep_volume_pr_v1');
  // Accumulator — starts with coerced prior logs, grows as sets are "logged".
  const acc: PriorHistoryEntry[] = coercePriorHistory(priorLogs);
  return exercises.map((ex) => {
    // PR detection compares against the persisted logs (DB('logs')), which are
    // keyed on the ENGLISH canonical engineName. Comparing under the RO display
    // name found no prior history → a false PR every session (Daniel P0
    // 2026-06-05). Use engineName; fall back to exerciseName for legacy breakdowns.
    const prKey = ex.engineName ?? ex.exerciseName;
    return {
    ...ex,
    sets: ex.sets.map((s) => {
      // detectPR contract: { w, reps }. Returns null when no PR.
      const detection = detectPR(prKey, { w: s.kg, reps: s.reps }, acc);
      // Add this set to accumulator AFTER detection (so within-session
      // progressive overload can produce multiple PRs on same exercise). Carry the
      // calibration flag so a within-session calibration set is excluded from later
      // sets' prevBest (matches detectPR's calibration exclusion).
      acc.unshift({ ex: prKey, w: s.kg, reps: s.reps, ...(s.calibration ? { calibration: true } : {}) });
      // A calibration set is a level-set anchor, NOT a contested attempt — never
      // stamp it as a PR (a false PR badge would persist on the user's own anchor).
      if (!detection || s.calibration) return s;
      return typedPR
        ? { ...s, isPR: true, prType: detection.type }
        : { ...s, isPR: true };
    }),
    };
  });
}

/**
 * Refresh pr-records hash from current DB.logs. Scan all non-baseline logs,
 * keep the per-exercise set with the highest DEMONSTRATED e1RM (Epley
 * kg*(1+reps/30)) — the user's best, the same definition IstoricDetail's
 * peakOneRM uses. Persist sorted desc by ts.
 *
 * Was: max SCORE (kg × reps). That curated the max-VOLUME set, so a high-rep
 * back-off (62.5×12, score 750) beat a heavier low-rep set (100×5, score 500)
 * with a HIGHER e1RM — the Istoric landing PR row then rendered Epley of the
 * volume set (~87.5kg) while IstoricDetail showed the session's peak e1RM
 * (~116.7kg) for the very same exercise (two surfaces, one truth, disagreeing).
 * Curating by e1RM makes the recorded set the best-e1RM set, so the landing
 * "~X kg 1RM" == IstoricDetail "1RM est: X kg" == the demonstrated peak, and
 * the displayed kg×reps belong to that same set (no within-row contradiction).
 * Also corrects the MMI peak-weight lookup (engineWrappers.mmi.ts reads
 * pr-records[].kg as peak-pre-pause): the heaviest demonstrated set, not a
 * lighter volume set. `score` stays = kg*reps of the recorded set (truthful).
 *
 * Soft-fail: any DB throw is swallowed. Preserves zero-throw render
 * contract Zustand action boundary downstream.
 *
 * @returns Array of PR records that were persisted (or [] on failure).
 */
function epleyE1RM(kg: number, reps: number): number {
  return kg * (1 + reps / 30);
}

/**
 * @param merge When true (DEFAULT — the finish path), MERGE into the existing
 *   pr-records: per exercise keep the higher-e1RM of {existing record, best in the
 *   current logs window}. logs is capped at LOGS_MAX=5000 (oldest dropped), so a
 *   destructive rebuild REGRESSED an all-time PR the moment its source log row aged
 *   out (120kg → 100kg). pr-records is a tiny one-row-per-exercise store, so
 *   retaining a record whose source log was pruned is correct + cheap.
 *
 *   When false (the deleteSession recompute path, purgeDeletedSessionLogs), FORCE a
 *   full rebuild from the surviving logs only — a genuinely-deleted PR must be
 *   removable (a merge would make deletions impossible). This preserves the legacy
 *   destructive behavior for that path exactly.
 */
export function refreshPRRecordsFromLogs(
  { merge = true }: { merge?: boolean } = {},
): PRRecordEntry[] {
  try {
    const logs = DB.get<LogEntry[]>('logs') ?? [];
    const prMap: Record<string, PRRecordEntry> = {};
    const e1rmMap: Record<string, number> = {};
    // MERGE: seed the map with the existing all-time records so a PR whose source
    // log has been pruned out of the 5000-window survives. The deleteSession path
    // (merge=false) skips this seed → a full rebuild that can drop a deleted PR.
    if (merge) {
      const prior = DB.get<PRRecordEntry[]>('pr-records') ?? [];
      for (const r of prior) {
        if (!r || typeof r.ex !== 'string' || !r.kg) continue;
        prMap[r.ex] = r;
        e1rmMap[r.ex] = epleyE1RM(r.kg, r.reps || 1);
      }
    }
    for (const l of logs) {
      if (!l || !l.w || !l.reps || (l as { baseline?: boolean }).baseline) continue;
      const reps = parseInt(l.reps, 10) || 1;
      const e1rm = epleyE1RM(l.w, reps);
      const existing = prMap[l.ex];
      if (!existing || e1rm > (e1rmMap[l.ex] ?? 0)) {
        e1rmMap[l.ex] = e1rm;
        prMap[l.ex] = {
          ex: l.ex,
          kg: l.w,
          reps,
          date: l.date,
          ts: l.ts,
          score: l.w * reps,
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
