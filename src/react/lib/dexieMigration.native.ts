// ══ DEXIE MIGRATION — NATIVE NO-OP SIBLING (RN port) ════════════════════════
// Metro (iOS/Android) resolves THIS file over `dexieMigration.ts` for the native
// platform; Vite/Vitest + Metro-web keep the real `dexieMigration.ts` (Dexie /
// IndexedDB) UNCHANGED. Callers import this extensionless (`../lib/dexieMigration`
// in workoutStore.logic.ts, `../../../lib/dexieMigration` dynamic import in
// SettingsExport) so each bundler picks its own variant.
//
// WHY no-op: `dexieMigration.ts` is the web-only Tier-2 COLD archive — a SEPARATE
// IndexedDB database (`AnduraArchive`) holding sessions the workout store dropped
// past its in-store cap. Native Tier-1 runs on op-sqlite (`db.native.js`), which
// has no `sessions` archive table, and pulling `dexie` (web IndexedDB) into the
// RN graph is exactly what this port avoids. So on native the archive layer is a
// no-op: `archiveSession` drops the overflow silently and `getArchivedSessions`
// returns `[]` — BYTE-IDENTICAL to the real layer's fail-silent contract in any
// env where IndexedDB is unavailable (the jsdom path the web tests already pin).
//
// `dexie` is NOT imported here (not even transitively): the pure aggregation math
// + its type are INLINED below rather than re-exported from `dexieMigration.ts`,
// because re-exporting would re-introduce that module's top-level `import Dexie`
// into the native graph — defeating the whole point. The inlined copy is the SSOT
// for native; the web copy stays in `dexieMigration.ts`. Both must stay in sync
// (small, stable, pure ISO-week aggregation — last touched §35-H1).

import type { LastSessionSummary } from '../stores/workoutStore';

/** Native no-op archive — overflow session dropped (no cold-storage tier). */
export async function archiveSession(_session: LastSessionSummary): Promise<void> {
  /* native: no IndexedDB cold archive — fail-silent, mirrors web no-IDB path */
}

/** Native no-op — no archive store, returns empty (web no-IDB contract). */
export async function getArchivedSessions(): Promise<
  Array<LastSessionSummary & { archivedAt: number }>
> {
  return [];
}

/** Native no-op — nothing to clear. */
export async function clearArchive(): Promise<void> {
  /* native: no archive store */
}

// ── Pure aggregation (mirror of dexieMigration.ts §35-H1 — keep in sync) ──────

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
 * Aggregate detailed sessions → per-week summary. Pure function (mirror of the
 * web copy in dexieMigration.ts §35-H1).
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
