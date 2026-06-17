// SSOT unification (Daniel audit 2026-06-05): getPRHistoryAll + getStreakStats
// .prCount now read the curated `pr-records` DB store (the same source the PR
// engine writes), NOT a second derivation off sessionsHistory set.isPR markers.
// These tests seed `pr-records` and assert: correct .kg, one entry per record
// (no dupes), count matches the store, English key resolves to a display name.

import { describe, it, expect, beforeEach } from 'vitest';
import { getPRHistoryAll, getStreakStats } from '../../lib/prHistoryAggregate';
import { useWorkoutStore } from '../../stores/workoutStore';
import { DB } from '../../../db.js';
import type { PRRecordEntry } from '../../lib/prRecordsWriteback';

function reset(): void {
  localStorage.clear();
  try {
    DB.set('pr-records', []);
  } catch {
    /* noop */
  }
  useWorkoutStore.setState({
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
  });
}

function seedPrRecords(records: PRRecordEntry[]): void {
  DB.set('pr-records', records);
}

beforeEach(reset);

describe('getPRHistoryAll — reads pr-records SSOT', () => {
  it('returns empty cand pr-records empty', () => {
    expect(getPRHistoryAll()).toEqual([]);
  });

  it('maps each pr-records entry to a PRRecord with the correct kg', () => {
    seedPrRecords([
      { ex: 'Cable Row', kg: 45, reps: 8, date: '2026-06-01', ts: 2000, score: 360 },
      { ex: 'Incline DB Press', kg: 15, reps: 7, date: '2026-06-02', ts: 3000, score: 105 },
      { ex: 'Cable Curl', kg: 14, reps: 10, date: '2026-05-30', ts: 1000, score: 140 },
    ]);
    const prs = getPRHistoryAll();
    // Count matches pr-records exactly — no phantom entries.
    expect(prs).toHaveLength(3);
    // Reverse chrono (newest ts first).
    expect(prs.map((p) => p.exerciseId)).toEqual([
      'Incline DB Press',
      'Cable Row',
      'Cable Curl',
    ]);
    // Correct kg surfaced (not 0, not a divergent value).
    const incline = prs.find((p) => p.exerciseId === 'Incline DB Press')!;
    expect(incline.kg).toBe(15);
    expect(incline.reps).toBe(7);
  });

  it('resolves the English canonical key to a locale display name', () => {
    seedPrRecords([{ ex: 'Cable Row', kg: 45, reps: 8, date: '2026-06-01', ts: 2000, score: 360 }]);
    const prs = getPRHistoryAll();
    // exerciseId keeps the canonical engine key (stable React key).
    expect(prs[0]!.exerciseId).toBe('Cable Row');
    // exerciseName is the resolved display form (EN default echoes the canonical
    // name; never the raw RO-stranded value). Non-empty + matches the resolver.
    expect(prs[0]!.exerciseName.length).toBeGreaterThan(0);
  });

  it('no duplicate entries — one per pr-records row (no double "DB Shoulder Press")', () => {
    // pr-records is curated (one row per exercise = max score). The widget must
    // surface exactly those rows, never one-per-PR-set like the old divergent
    // sessionsHistory walk did.
    seedPrRecords([
      { ex: 'DB Shoulder Press', kg: 20, reps: 8, date: '2026-06-01', ts: 2000, score: 160 },
      { ex: 'Cable Row', kg: 45, reps: 8, date: '2026-06-02', ts: 3000, score: 360 },
    ]);
    const prs = getPRHistoryAll();
    const shoulderRows = prs.filter((p) => p.exerciseId === 'DB Shoulder Press');
    expect(shoulderRows).toHaveLength(1);
    expect(prs).toHaveLength(2);
  });

  it('skips malformed entries lacking ex', () => {
    seedPrRecords([
      { ex: 'Cable Row', kg: 45, reps: 8, date: '2026-06-01', ts: 2000, score: 360 },
      { kg: 99, reps: 1, date: '2026-06-03', ts: 9000, score: 99 } as unknown as PRRecordEntry,
    ]);
    expect(getPRHistoryAll()).toHaveLength(1);
  });

  it('computes per-set Epley 1RM for the curated record', () => {
    seedPrRecords([{ ex: 'Bench Press', kg: 50, reps: 5, date: '2026-06-01', ts: 1000, score: 250 }]);
    const prs = getPRHistoryAll();
    // 50 * (1 + 5/30) = 58.3
    expect(prs[0]!.oneRMEstimate).toBeCloseTo(58.3, 1);
  });
});

describe('getStreakStats — prCount reads pr-records SSOT', () => {
  it('returns baseline zeros cand empty', () => {
    const s = getStreakStats();
    expect(s).toEqual({
      currentStreak: 0,
      totalSessions: 0,
      prCount: 0,
      thisWeekSessions: 0,
    });
  });

  it('prCount = number of pr-records rows (matches the PR Wall count)', () => {
    const now = Date.now();
    seedPrRecords([
      { ex: 'Cable Row', kg: 45, reps: 8, date: '2026-06-01', ts: 2000, score: 360 },
      { ex: 'Incline DB Press', kg: 15, reps: 7, date: '2026-06-02', ts: 3000, score: 105 },
    ]);
    useWorkoutStore.setState({
      streak: 5,
      sessionsHistory: [
        { title: 'a', meta: '', ts: now - 8 * 86400000 }, // older than 1 week
        { title: 'b', meta: '', ts: now - 2 * 86400000 },
        { title: 'c', meta: '', ts: now }, // today
      ],
    });
    const s = getStreakStats();
    expect(s.currentStreak).toBe(5);
    expect(s.totalSessions).toBe(3);
    expect(s.thisWeekSessions).toBe(2);
    // prCount is the curated record count, NOT a count of isPR sets in history.
    expect(s.prCount).toBe(2);
  });
});

describe('getStreakStats — view-time streak decay (rest gap)', () => {
  // The streak is only mutated at finishSession; without view-time decay a user who
  // took a rest gap reads the OLD count as an ACTIVE streak until their next session.
  const dayKey = (offsetDays: number): string =>
    new Date(Date.now() - offsetDays * 86_400_000).toLocaleDateString('sv');

  it('lastStreakDate=today → shown as-is (still active)', () => {
    useWorkoutStore.setState({ streak: 4, lastStreakDate: dayKey(0) });
    expect(getStreakStats().currentStreak).toBe(4);
  });

  it('lastStreakDate=yesterday → still active (gap exactly 1 day)', () => {
    useWorkoutStore.setState({ streak: 4, lastStreakDate: dayKey(1) });
    expect(getStreakStats().currentStreak).toBe(4);
  });

  it('lastStreakDate=2 days ago → shown 0 (streak broken at view time)', () => {
    useWorkoutStore.setState({ streak: 4, lastStreakDate: dayKey(2) });
    expect(getStreakStats().currentStreak).toBe(0);
    // persisted state is untouched (display-only decay)
    expect(useWorkoutStore.getState().streak).toBe(4);
  });

  it('lastStreakDate=null → no decay (falls back to persisted streak)', () => {
    useWorkoutStore.setState({ streak: 3, lastStreakDate: null });
    expect(getStreakStats().currentStreak).toBe(3);
  });
});
