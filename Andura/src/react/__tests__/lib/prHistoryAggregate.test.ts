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
