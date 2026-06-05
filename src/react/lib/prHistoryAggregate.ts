// ══ PR HISTORY AGGREGATE — React-side PR Wall + Streak Stats ═════════════
// SSOT FIX (Daniel audit 2026-06-05): every PR-display surface (Coach "Recent
// PRs", Istoric "Records (N)" + PR Wall) now reads the SAME curated store —
// `pr-records` (DB key, written by prRecordsWriteback.refreshPRRecordsFromLogs).
//
// Prior bug = a DIVERGENT second PR system: this aggregate walked
// workoutStore.sessionsHistory `set.isPR` markers, surfacing EVERY flagged set
// (so one exercise appeared multiple times — e.g. "DB Shoulder Press" twice),
// with values that diverged from `pr-records` (phantom "Cable Row 73 kg",
// "Bayesian Curl 18kg") and a count that never matched the curated store. The
// PR ENGINE / writeback (detection) is unchanged — only the DISPLAY source is
// unified onto `pr-records` so the user sees one consistent set of records.
//
// `pr-records` is already curated: one entry per exercise (max score = kg*reps),
// keyed on the ENGLISH canonical engineName (`ex`). We map `ex` -> the locale
// display name at the React boundary via toExerciseDisplay (the same resolver
// the workout flow uses), so the user-facing name matches the rest of the app.

import { DB } from '../../db.js';
import { useWorkoutStore } from '../stores/workoutStore';
import { toExerciseDisplay } from './exerciseDisplay';
import type { PRRecordEntry } from './prRecordsWriteback';

export interface PRRecord {
  exerciseId: string;
  exerciseName: string;
  kg: number;
  reps: number;
  // Per-set Epley estimate (kg * (1 + reps/30)) of the curated record set.
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

/** Read the curated `pr-records` store (SSOT). Soft-fail to [] on any DB error. */
function readPrRecords(): PRRecordEntry[] {
  try {
    const raw = DB.get<PRRecordEntry[]>('pr-records');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

/**
 * Extract all PR records from the curated `pr-records` SSOT (NOT a second
 * derivation off sessionsHistory). One entry per exercise (the store keeps the
 * max-score record), the correct `.kg`, no phantoms, no duplicates — the count
 * matches `pr-records` exactly. The English canonical `ex` key resolves to the
 * locale display name; `exerciseId` keeps the canonical key (stable React key).
 */
export function getPRHistoryAll(): PRRecord[] {
  const records = readPrRecords();
  return records
    .filter((r) => r && typeof r.ex === 'string' && r.ex.length > 0)
    .map((r) => ({
      exerciseId: r.ex,
      exerciseName: toExerciseDisplay(r.ex).name,
      kg: r.kg,
      reps: r.reps,
      oneRMEstimate: setOneRMEstimate(r.kg, r.reps),
      sessionTs: r.ts,
      sessionTitle: '',
    }))
    // Reverse chrono (newest first) — pr-records persists this order, re-sort
    // defensively (ts may be 0/absent on legacy entries → keep stable).
    .sort((a, b) => (b.sessionTs || 0) - (a.sessionTs || 0));
}

/** Compose streak stats. prCount reads the curated pr-records SSOT (same source
 * as the PR widgets) so the "Records" tile matches the PR Wall count exactly. */
export function getStreakStats(): StreakStats {
  const state = useWorkoutStore.getState();
  const sessions = state.sessionsHistory;
  const now = Date.now();
  const weekAgo = now - 7 * MS_PER_DAY;
  const thisWeekSessions = sessions.filter((s) => s.ts >= weekAgo).length;
  const prCount = readPrRecords().filter(
    (r) => r && typeof r.ex === 'string' && r.ex.length > 0,
  ).length;
  return {
    currentStreak: state.streak,
    totalSessions: sessions.length,
    prCount,
    thisWeekSessions,
  };
}
