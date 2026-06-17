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

import { DB, todTs } from '../../db.js';
import { useWorkoutStore } from '../stores/workoutStore';
import {
  diffCalendarDays,
  scheduledTrainingDaysMissed,
  resolveStreakActiveWeek,
} from '../stores/workoutStore.logic';
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

/**
 * Collapse pr-records to ONE entry per exercise, keeping the higher Epley e1RM.
 * Cross-device sync can merge two `pr-records` entries for the SAME `ex` (each
 * device pushed its own PR at a distinct `ts`, so the ts-uniqueness array merge
 * in firebase.js keeps both). Without this dedup the PR Wall shows the exercise
 * twice and the Records count is inflated. Robust at the DISPLAY boundary so the
 * Wall + count are always deduped regardless of how the store got two entries.
 */
function dedupByExerciseMaxE1RM(records: PRRecordEntry[]): PRRecordEntry[] {
  const byEx = new Map<string, PRRecordEntry>();
  for (const r of records) {
    if (!r || typeof r.ex !== 'string' || r.ex.length === 0) continue;
    const prev = byEx.get(r.ex);
    if (!prev) {
      byEx.set(r.ex, r);
      continue;
    }
    // Keep the higher e1RM; tie → keep the newer ts (stable, recency-preferring).
    const a = setOneRMEstimate(r.kg, r.reps);
    const b = setOneRMEstimate(prev.kg, prev.reps);
    if (a > b || (a === b && (r.ts || 0) > (prev.ts || 0))) byEx.set(r.ex, r);
  }
  return [...byEx.values()];
}

/** Read the curated `pr-records` store (SSOT), deduped by exercise (higher e1RM
 * wins) so a cross-device sync that duplicated a record never double-shows.
 * Soft-fail to [] on any DB error. */
function readPrRecords(): PRRecordEntry[] {
  try {
    const raw = DB.get<PRRecordEntry[]>('pr-records');
    return Array.isArray(raw) ? dedupByExerciseMaxE1RM(raw) : [];
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
  // VIEW-TIME DECAY: streak is only mutated at finishSession, so a user who took a
  // rest gap still reads the OLD count as an ACTIVE streak until their next session.
  // Compute the DISPLAYED streak at view time the same way the next finishSession
  // would — SCHEDULE-AWARE (in sync with nextStreak): a calendar gap that only
  // crossed SCHEDULED REST days (e.g. freq3 Mon/Wed/Fri) keeps the streak ALIVE;
  // it is only broken when a scheduled training day was MISSED. Persisted state is
  // left untouched (display-only).
  let currentStreak = state.streak;
  if (state.lastStreakDate) {
    const todayIso = todTs(now);
    const delta = diffCalendarDays(state.lastStreakDate, todayIso);
    if (!Number.isFinite(delta) || delta < 0) {
      currentStreak = 0; // corrupt/future date
    } else if (delta > 1) {
      const missed = scheduledTrainingDaysMissed(resolveStreakActiveWeek(), state.lastStreakDate, todayIso);
      // missed === 0 → only rest days crossed → streak still alive (show persisted).
      // missed === -1 → no schedule available → legacy calendar-consecutive break.
      if (missed !== 0) currentStreak = 0;
    }
  }
  return {
    currentStreak,
    totalSessions: sessions.length,
    prCount,
    thisWeekSessions,
  };
}
