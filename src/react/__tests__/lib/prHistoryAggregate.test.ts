// SSOT unification (Daniel audit 2026-06-05): getPRHistoryAll + getStreakStats
// .prCount now read the curated `pr-records` DB store (the same source the PR
// engine writes), NOT a second derivation off sessionsHistory set.isPR markers.
// These tests seed `pr-records` and assert: correct .kg, one entry per record
// (no dupes), count matches the store, English key resolves to a display name.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

  // cycle26b (MEDIUM, edge) — cross-device sync can merge TWO pr-records entries
  // for the same exercise (each device pushed its PR at a distinct ts, so the
  // firebase ts-uniqueness array merge keeps both). The display read must collapse
  // by `ex` keeping the higher Epley e1RM so the Wall shows it once + the count is
  // not inflated.
  it('dedups two entries for the same exercise → one (higher e1RM)', () => {
    seedPrRecords([
      // Same ex, two distinct ts (the cross-device duplicate). e1RM: 60*(1+5/30)=70
      // vs 65*(1+5/30)=75.83 → the 65kg entry wins.
      { ex: 'Bench Press', kg: 60, reps: 5, date: '2026-06-01', ts: 1000, score: 300 },
      { ex: 'Bench Press', kg: 65, reps: 5, date: '2026-06-03', ts: 3000, score: 325 },
      { ex: 'Cable Row', kg: 45, reps: 8, date: '2026-06-02', ts: 2000, score: 360 },
    ]);
    const prs = getPRHistoryAll();
    const bench = prs.filter((p) => p.exerciseId === 'Bench Press');
    expect(bench).toHaveLength(1);
    expect(bench[0]!.kg).toBe(65); // the higher e1RM record is kept
    // Distinct exercises unaffected.
    expect(prs).toHaveLength(2);
    // Records count counts the deduped exercise once.
    expect(getStreakStats().prCount).toBe(2);
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

describe('getStreakStats — view-time streak decay (SCHEDULE-AWARE, rest gap)', () => {
  // The streak is only mutated at finishSession; without view-time decay a user who
  // took a rest gap reads the OLD count as an ACTIVE streak until their next session.
  // cycle26b: the decay is now SCHEDULE-AWARE (in sync with nextStreak) — a calendar
  // gap that only crossed scheduled REST days stays ALIVE; it breaks only when a
  // scheduled TRAINING day was missed. Tests pin the clock + an explicit freq3
  // (Mon/Wed/Fri) schedule for determinism.
  const FREQ3_STORE = JSON.stringify({
    state: { days: ['training', 'rest', 'training', 'rest', 'training', 'rest', 'rest'] },
    version: 0,
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Anchor "now" to a fixed weekday so the gap math is deterministic.
  function pinNow(iso: string): void {
    localStorage.setItem('wv2-schedule-store', FREQ3_STORE);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${iso}T08:00:00Z`));
  }

  it('lastStreakDate=today → shown as-is (still active)', () => {
    pinNow('2026-06-17'); // Wed
    useWorkoutStore.setState({ streak: 4, lastStreakDate: '2026-06-17' });
    expect(getStreakStats().currentStreak).toBe(4);
  });

  it('gap of exactly 1 calendar day → still active', () => {
    pinNow('2026-06-18'); // Thu
    useWorkoutStore.setState({ streak: 4, lastStreakDate: '2026-06-17' }); // Wed
    expect(getStreakStats().currentStreak).toBe(4);
  });

  it('rest-day gap (Wed→Fri, Thu scheduled rest) → STAYS active (cycle26b)', () => {
    pinNow('2026-06-19'); // Fri (scheduled training)
    useWorkoutStore.setState({ streak: 4, lastStreakDate: '2026-06-17' }); // Wed
    expect(getStreakStats().currentStreak).toBe(4); // Thu was a scheduled rest → unbroken
    expect(useWorkoutStore.getState().streak).toBe(4); // persisted untouched (display-only)
  });

  it('MISSED scheduled day (skip Fri, view Mon) → shown 0 (broken)', () => {
    pinNow('2026-06-22'); // Mon, after skipping scheduled Fri 06-19
    useWorkoutStore.setState({ streak: 4, lastStreakDate: '2026-06-17' }); // Wed
    expect(getStreakStats().currentStreak).toBe(0);
    // persisted state is untouched (display-only decay)
    expect(useWorkoutStore.getState().streak).toBe(4);
  });

  it('lastStreakDate=null → no decay (falls back to persisted streak)', () => {
    useWorkoutStore.setState({ streak: 3, lastStreakDate: null });
    expect(getStreakStats().currentStreak).toBe(3);
  });
});
