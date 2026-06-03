// ══ SESSION AGGREGATE — pure per-week rollup (dependency-free SSOT) ══════════
// §35-H1 pre-archive aggregation, extracted (LO-03) so BOTH the web Dexie layer
// (dexieMigration.ts) and the native no-op sibling (dexieMigration.native.ts)
// import the SAME implementation instead of keeping two hand-synced copies that
// could silently drift. ZERO runtime deps (no Dexie) — safe in the native graph.
//
// Per ADR 020 §Rotation: Tier 2 cold storage scales linearly with the raw
// archive, so detailed sessions are compressed to per-week summaries BEFORE
// rotation. Format: YYYY-Www ISO-week key (Mon-Sun, aligned with scheduleStore).

import type { LastSessionSummary } from '../stores/workoutStore';

export interface WeeklySessionAggregate {
  /** ISO week key e.g. "2026-W21". */
  weekKey: string;
  /** Count of sessions in interval. */
  sessionCount: number;
  /** Sum of sets across sessions (undefined sums skipped). */
  totalSets: number;
  /** Total duration minutes. */
  totalDurationMin: number;
  /** Total volume kg (sum across sessions). */
  totalVolumeKg: number;
  /** Earliest session ts in interval. */
  firstTs: number;
  /** Latest session ts in interval. */
  lastTs: number;
}

/** ISO 8601 week key (Thursday-anchored) for a ms timestamp. */
function isoWeekKey(ts: number): string {
  const d = new Date(ts);
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNr = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${new Date(firstThursday).getUTCFullYear()}-W${String(weekNr).padStart(2, '0')}`;
}

/**
 * Aggregate detailed sessions → per-week summary. Pure function: input array,
 * output map. Caller decides when to call it (pre-archive rotation per ADR 020).
 *
 * @param sessions detailed sessions list
 * @returns map weekKey → aggregate
 */
export function aggregateSessionsByWeek(
  sessions: ReadonlyArray<LastSessionSummary>
): Record<string, WeeklySessionAggregate> {
  const result: Record<string, WeeklySessionAggregate> = {};
  for (const s of sessions) {
    if (typeof s.ts !== 'number') continue;
    const key = isoWeekKey(s.ts);
    const prev = result[key];
    if (prev === undefined) {
      result[key] = {
        weekKey: key,
        sessionCount: 1,
        totalSets: s.sets ?? 0,
        totalDurationMin: s.durationMin ?? 0,
        totalVolumeKg: s.volumeKg ?? 0,
        firstTs: s.ts,
        lastTs: s.ts,
      };
    } else {
      prev.sessionCount += 1;
      prev.totalSets += s.sets ?? 0;
      prev.totalDurationMin += s.durationMin ?? 0;
      prev.totalVolumeKg += s.volumeKg ?? 0;
      if (s.ts < prev.firstTs) prev.firstTs = s.ts;
      if (s.ts > prev.lastTs) prev.lastTs = s.ts;
    }
  }
  return result;
}
