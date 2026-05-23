import { describe, it, expect, beforeEach } from 'vitest';
import { getPRHistoryAll, getStreakStats } from '../../lib/prHistoryAggregate';
import { useWorkoutStore } from '../../stores/workoutStore';

function reset(): void {
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

beforeEach(reset);

describe('getPRHistoryAll', () => {
  it('returns empty cand no sessions', () => {
    expect(getPRHistoryAll()).toEqual([]);
  });

  it('extracts PR sets across sessions reverse chrono', () => {
    const now = Date.now();
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push',
          meta: 'x',
          ts: now - 86400000,
          exercises: [
            {
              exerciseId: 'bench',
              exerciseName: 'Bench Press',
              sets: [
                { kg: 25, reps: 10, rating: 'greu', timestamp: now - 86400000, isPR: true },
                { kg: 25, reps: 8, rating: 'greu', timestamp: now - 86400000 },
              ],
              totalVolume: 450,
              peakOneRM: 33.3,
            },
          ],
        },
        {
          title: 'Pull',
          meta: 'x',
          ts: now,
          exercises: [
            {
              exerciseId: 'row',
              exerciseName: 'Cable Row',
              sets: [{ kg: 35, reps: 10, rating: 'potrivit', timestamp: now, isPR: true }],
              totalVolume: 350,
              peakOneRM: 46.7,
            },
          ],
        },
      ],
    });
    const prs = getPRHistoryAll();
    expect(prs).toHaveLength(2);
    expect(prs[0]!.exerciseId).toBe('row'); // newest first
    expect(prs[1]!.exerciseId).toBe('bench');
  });

  it('MED-CODE-19: oneRMEstimate is per-set Epley NU exercise-level peak', () => {
    // Multi-set scenario unde PR set este NU peak set — exercise has 2 PR
    // sets, dar peakOneRM = max across all sets (different from each set's
    // own 1RM). Bug pre-fix: ALL PR records got ex.peakOneRM (wrong).
    // Post-fix: each PR record reflects its OWN set's Epley 1RM.
    const now = Date.now();
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push',
          meta: 'x',
          ts: now,
          exercises: [
            {
              exerciseId: 'bench',
              exerciseName: 'Bench Press',
              sets: [
                // 50 kg x 5 → Epley = 50 * (1 + 5/30) = 58.3
                { kg: 50, reps: 5, rating: 'greu', timestamp: now, isPR: true },
                // 60 kg x 3 → Epley = 60 * (1 + 3/30) = 66.0 (peak)
                { kg: 60, reps: 3, rating: 'greu', timestamp: now, isPR: true },
              ],
              totalVolume: 430,
              peakOneRM: 66.0, // exercise-level peak = max set (60x3)
            },
          ],
        },
      ],
    });
    const prs = getPRHistoryAll();
    expect(prs).toHaveLength(2);
    // PR record for 50x5 set must reflect its OWN 1RM (58.3), NU peakOneRM (66.0).
    const pr50 = prs.find((p) => p.kg === 50 && p.reps === 5);
    expect(pr50).toBeDefined();
    expect(pr50!.oneRMEstimate).toBeCloseTo(58.3, 1);
    // PR record for 60x3 happens to match peak (degenerate). Verify per-set value.
    const pr60 = prs.find((p) => p.kg === 60 && p.reps === 3);
    expect(pr60).toBeDefined();
    expect(pr60!.oneRMEstimate).toBeCloseTo(66.0, 1);
  });

  it('skips non-PR sets', () => {
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push',
          meta: 'x',
          ts: Date.now(),
          exercises: [
            {
              exerciseId: 'bench',
              exerciseName: 'Bench Press',
              sets: [{ kg: 22.5, reps: 10, rating: 'usor', timestamp: Date.now() }],
              totalVolume: 225,
              peakOneRM: 30,
            },
          ],
        },
      ],
    });
    expect(getPRHistoryAll()).toEqual([]);
  });

  it('skips sessions without exercises field (legacy)', () => {
    useWorkoutStore.setState({
      sessionsHistory: [{ title: 'Push', meta: 'x', ts: Date.now() }],
    });
    expect(getPRHistoryAll()).toEqual([]);
  });
});

describe('getStreakStats', () => {
  it('returns baseline zeros cand empty', () => {
    const s = getStreakStats();
    expect(s).toEqual({
      currentStreak: 0,
      totalSessions: 0,
      prCount: 0,
      thisWeekSessions: 0,
    });
  });

  it('counts total sessions + this week + prs', () => {
    const now = Date.now();
    useWorkoutStore.setState({
      streak: 5,
      sessionsHistory: [
        { title: 'a', meta: '', ts: now - 8 * 86400000 }, // older than 1 week
        {
          title: 'b',
          meta: '',
          ts: now - 2 * 86400000,
          exercises: [
            {
              exerciseId: 'ex',
              exerciseName: 'Ex',
              sets: [{ kg: 20, reps: 10, rating: 'greu', timestamp: now, isPR: true }],
              totalVolume: 200,
              peakOneRM: 26.7,
            },
          ],
        },
        { title: 'c', meta: '', ts: now }, // today
      ],
    });
    const s = getStreakStats();
    expect(s.currentStreak).toBe(5);
    expect(s.totalSessions).toBe(3);
    expect(s.thisWeekSessions).toBe(2);
    expect(s.prCount).toBe(1);
  });
});
