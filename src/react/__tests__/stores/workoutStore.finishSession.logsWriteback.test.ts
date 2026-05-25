// ══ WORKOUT STORE — finishSession Logs Writeback (CRIT #2 shape-check chat 5) ══
// Post-D028 vanilla retire → React-side workoutStore.finishSession never
// persists logs to DB. Engine adapters (readiness/fatigue/adherence/MMI/
// stagnationDetector) consume DB.get('logs') → permanent input-starved.
//
// Tests verify per-set flat schema writeback + cap + newest-first ordering.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  useWorkoutStore,
  buildLogEntriesFromSummary,
  persistSessionLogs,
  LOGS_MAX,
} from '../../stores/workoutStore';
import type { LastSessionSummary, LogEntry } from '../../stores/workoutStore';
import { DB } from '../../../db.js';
import { DP } from '../../../engine/dp.js';
import { calculateFatigueScore } from '../../../engine/fatigue.js';

const T0 = new Date('2026-05-23T10:00:00').getTime();

function makeSummary(): LastSessionSummary {
  return {
    title: 'Push',
    meta: '5 seturi · 30 min · 910 kg',
    ts: T0 + 30 * 60000,
    sets: 5,
    durationMin: 30,
    volumeKg: 910,
    exercises: [
      {
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        sets: [
          { kg: 22.5, reps: 10, rating: 'potrivit', timestamp: T0 + 1000 },
          { kg: 22.5, reps: 10, rating: 'potrivit', timestamp: T0 + 2000 },
          { kg: 22.5, reps: 8, rating: 'greu', timestamp: T0 + 3000 },
        ],
        totalVolume: 630,
        peakOneRM: 30,
      },
      {
        exerciseId: 'overhead-press',
        exerciseName: 'Overhead Press',
        sets: [
          { kg: 17.5, reps: 8, rating: 'potrivit', timestamp: T0 + 4000 },
          { kg: 17.5, reps: 8, rating: 'greu', timestamp: T0 + 5000, isPR: true },
        ],
        totalVolume: 280,
        peakOneRM: 21.2,
      },
    ],
  };
}

function resetStore(): void {
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
  localStorage.clear();
}

describe('workoutStore — buildLogEntriesFromSummary', () => {
  beforeEach(resetStore);

  it('returns empty array when summary has no exercises', () => {
    const summary: LastSessionSummary = { title: 'X', meta: 'y', ts: T0 };
    expect(buildLogEntriesFromSummary(summary, T0)).toEqual([]);
  });

  it('flattens exercises into per-set log entries', () => {
    const summary = makeSummary();
    const entries = buildLogEntriesFromSummary(summary, T0);
    expect(entries).toHaveLength(5);
  });

  it('maps SessionExerciseBreakdown sets to engine-compatible schema', () => {
    const summary = makeSummary();
    const entries = buildLogEntriesFromSummary(summary, T0);
    const first = entries[0]!;
    expect(first.ex).toBe('Bench Press');
    expect(first.w).toBe(22.5);
    expect(first.kg).toBe(22.5);
    expect(first.reps).toBe('10');
    expect(first.set).toBe(1);
    expect(first.sets).toBe(1);
    expect(first.session).toBe(T0);
    expect(first.ts).toBe(T0 + 1000);
    expect(typeof first.date).toBe('string');
    expect(first.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('increments setIdx per exercise independent', () => {
    const summary = makeSummary();
    const entries = buildLogEntriesFromSummary(summary, T0);
    // Bench Press: 3 sets (1, 2, 3)
    expect(entries[0]!.set).toBe(1);
    expect(entries[1]!.set).toBe(2);
    expect(entries[2]!.set).toBe(3);
    // Overhead Press: 2 sets (1, 2) — restarts per exercise
    expect(entries[3]!.set).toBe(1);
    expect(entries[4]!.set).toBe(2);
  });

  it('preserves isPR flag when set marked PR', () => {
    const summary = makeSummary();
    const entries = buildLogEntriesFromSummary(summary, T0);
    const prEntry = entries.find((e) => e.ex === 'Overhead Press' && e.set === 2);
    expect(prEntry?.isPR).toBe(true);
  });

  it('omits isPR field when set NOT marked PR', () => {
    const summary = makeSummary();
    const entries = buildLogEntriesFromSummary(summary, T0);
    const nonPr = entries.find((e) => e.ex === 'Bench Press' && e.set === 1);
    expect('isPR' in (nonPr ?? {})).toBe(false);
  });
});

describe('workoutStore — per-set RPE derivation (GAP #1: dp + fatigue signal)', () => {
  beforeEach(resetStore);

  it('stamps rpe per set from each set OWN coarse rating (6.5/7.5/8.5)', () => {
    const summary: LastSessionSummary = {
      title: 'Push',
      meta: 'x',
      ts: T0,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          sets: [
            { kg: 30, reps: 10, rating: 'usor', timestamp: T0 + 1000 },
            { kg: 30, reps: 10, rating: 'potrivit', timestamp: T0 + 2000 },
            { kg: 30, reps: 8, rating: 'greu', timestamp: T0 + 3000 },
          ],
          totalVolume: 840,
          peakOneRM: 38,
        },
      ],
    };
    const entries = buildLogEntriesFromSummary(summary, T0);
    expect(entries.map((e) => e.rpe)).toEqual([6.5, 7.5, 8.5]);
  });

  it('omits rpe when a breakdown set carries no rating (legacy shape)', () => {
    const summary = {
      title: 'X',
      meta: 'y',
      ts: T0,
      exercises: [
        {
          exerciseId: 'x',
          exerciseName: 'X',
          // rating intentionally absent (pre-rating legacy breakdown set).
          sets: [{ kg: 30, reps: 10, timestamp: T0 + 1000 }],
          totalVolume: 300,
          peakOneRM: 40,
        },
      ],
    } as unknown as LastSessionSummary;
    const entries = buildLogEntriesFromSummary(summary, T0);
    expect('rpe' in (entries[0] ?? {})).toBe(false);
  });

  // Real-path proof (not theater): the stamped rpe reaches dp.getState.lastRPE
  // (was the hardcoded 7 default), so the progression brain reads real intensity.
  it('all-greu session → DP.getState(ex).lastRPE === 8.5 (not the 7 default)', () => {
    const summary: LastSessionSummary = {
      title: 'Push',
      meta: 'x',
      ts: T0,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          sets: [
            { kg: 40, reps: 8, rating: 'greu', timestamp: T0 + 1000 },
            { kg: 40, reps: 8, rating: 'greu', timestamp: T0 + 2000 },
          ],
          totalVolume: 640,
          peakOneRM: 50,
        },
      ],
    };
    persistSessionLogs(summary, T0);
    expect(DP.getState('Bench Press').lastRPE).toBe(8.5);
  });

  it('all-usor session → DP.getState(ex).lastRPE === 6.5 (control, < neutral)', () => {
    const summary: LastSessionSummary = {
      title: 'Push',
      meta: 'x',
      ts: T0,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          sets: [
            { kg: 40, reps: 12, rating: 'usor', timestamp: T0 + 1000 },
            { kg: 40, reps: 12, rating: 'usor', timestamp: T0 + 2000 },
          ],
          totalVolume: 960,
          peakOneRM: 56,
        },
      ],
    };
    persistSessionLogs(summary, T0);
    expect(DP.getState('Bench Press').lastRPE).toBe(6.5);
  });

  // fatigue.js reads l.rpe (top-2 avg/session); needs >=2 sessions. Mostly-greu
  // raises avgRPE above the all-potrivit (7.5 neutral) control → signal is live.
  it('mostly-greu sessions → fatigue avgRPE > 7.5 vs all-potrivit neutral control', () => {
    const session = (start: number, rating: 'potrivit' | 'greu'): LastSessionSummary => ({
      title: 'Push',
      meta: 'x',
      ts: start + 60000,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          sets: [
            { kg: 40, reps: 8, rating, timestamp: start + 1000 },
            { kg: 40, reps: 8, rating, timestamp: start + 2000 },
          ],
          totalVolume: 640,
          peakOneRM: 50,
        },
      ],
    });

    // Control: 3 all-potrivit sessions → every set rpe 7.5 → avgRPE neutral 7.5.
    persistSessionLogs(session(T0, 'potrivit'), T0);
    persistSessionLogs(session(T0 + 2 * 86400000, 'potrivit'), T0 + 2 * 86400000);
    persistSessionLogs(session(T0 + 4 * 86400000, 'potrivit'), T0 + 4 * 86400000);
    const controlAvg = calculateFatigueScore()?.avgRPE;
    expect(controlAvg).toBeCloseTo(7.5, 5);

    // Treatment: 3 all-greu sessions → every set rpe 8.5 → avgRPE rises.
    localStorage.clear();
    persistSessionLogs(session(T0, 'greu'), T0);
    persistSessionLogs(session(T0 + 2 * 86400000, 'greu'), T0 + 2 * 86400000);
    persistSessionLogs(session(T0 + 4 * 86400000, 'greu'), T0 + 4 * 86400000);
    const treatmentAvg = calculateFatigueScore()?.avgRPE;
    expect(treatmentAvg).toBeGreaterThan(7.5);
    expect(treatmentAvg).toBeGreaterThan(controlAvg ?? 0);
  });
});

describe('workoutStore — persistSessionLogs', () => {
  beforeEach(resetStore);

  it('writes entries to DB.logs key', () => {
    const summary = makeSummary();
    persistSessionLogs(summary, T0);
    const logs = DB.get<LogEntry[]>('logs');
    expect(logs).not.toBeNull();
    expect(logs).toHaveLength(5);
  });

  it('newest-first ordering — last logged set at index 0', () => {
    const summary = makeSummary();
    persistSessionLogs(summary, T0);
    const logs = DB.get<LogEntry[]>('logs')!;
    // Last set in summary = Overhead Press set 2 (ts T0+5000), should be top.
    expect(logs[0]!.ex).toBe('Overhead Press');
    expect(logs[0]!.set).toBe(2);
    expect(logs[0]!.ts).toBe(T0 + 5000);
  });

  it('prepends new entries to existing logs (preserves history)', () => {
    const olderEntry: LogEntry = {
      date: '2026-05-22',
      ex: 'Squat',
      w: 60,
      kg: 60,
      set: 1,
      sets: 1,
      reps: '5',
      ts: T0 - 86400000,
      session: T0 - 86400000,
    };
    DB.set('logs', [olderEntry]);
    const summary = makeSummary();
    persistSessionLogs(summary, T0);
    const logs = DB.get<LogEntry[]>('logs')!;
    expect(logs).toHaveLength(6);
    // Older squat entry should be at the tail (preserved).
    expect(logs[logs.length - 1]!.ex).toBe('Squat');
  });

  it('no-op when sessionStart is null', () => {
    const summary = makeSummary();
    persistSessionLogs(summary, null);
    expect(DB.get('logs')).toBeNull();
  });

  it('no-op when summary exercises empty', () => {
    const summary: LastSessionSummary = { title: 'X', meta: 'y', ts: T0 };
    persistSessionLogs(summary, T0);
    expect(DB.get('logs')).toBeNull();
  });

  it('caps total logs at LOGS_MAX (5000) when exceeded', () => {
    const existing: LogEntry[] = Array.from({ length: LOGS_MAX - 2 }, (_, i) => ({
      date: '2026-05-01',
      ex: 'Squat',
      w: 60,
      kg: 60,
      set: 1,
      sets: 1,
      reps: '5',
      ts: T0 - 86400000 * (i + 1),
      session: T0 - 86400000 * (i + 1),
    }));
    DB.set('logs', existing);
    const summary = makeSummary();
    persistSessionLogs(summary, T0);
    const logs = DB.get<LogEntry[]>('logs')!;
    expect(logs.length).toBe(LOGS_MAX);
    // New entries are newest-first → first 5 are the new session entries.
    expect(logs[0]!.ex).toBe('Overhead Press');
  });

  it('soft-fails gracefully when DB write throws', () => {
    const origSet = DB.set;
    (DB as { set: (k: string, v: unknown) => void }).set = () => {
      throw new Error('quota exceeded');
    };
    const summary = makeSummary();
    expect(() => persistSessionLogs(summary, T0)).not.toThrow();
    (DB as { set: typeof origSet }).set = origSet;
  });
});

describe('workoutStore — finishSession integration writeback', () => {
  beforeEach(resetStore);

  it('finishSession writes session logs to DB on persist', () => {
    useWorkoutStore.setState({ sessionStart: T0 });
    const summary = makeSummary();
    useWorkoutStore.getState().finishSession(summary);
    const logs = DB.get<LogEntry[]>('logs');
    expect(logs).not.toBeNull();
    expect(logs).toHaveLength(5);
  });

  it('finishSession entries carry session = sessionStart timestamp', () => {
    useWorkoutStore.setState({ sessionStart: T0 });
    const summary = makeSummary();
    useWorkoutStore.getState().finishSession(summary);
    const logs = DB.get<LogEntry[]>('logs')!;
    for (const log of logs) {
      expect(log.session).toBe(T0);
    }
  });

  it('finishSession still clears history + sets idle (existing contract intact)', () => {
    useWorkoutStore.setState({
      sessionStart: T0,
      history: {
        0: [{ kg: 22.5, reps: 10, rating: 'potrivit', timestamp: T0 + 1000 }],
      },
    });
    const summary = makeSummary();
    useWorkoutStore.getState().finishSession(summary);
    expect(useWorkoutStore.getState().history).toEqual({});
    expect(useWorkoutStore.getState().phase).toBe('idle');
    expect(useWorkoutStore.getState().sessionStart).toBeNull();
  });

  it('finishSession does NOT write logs when sessionStart null', () => {
    // Edge case: finishSession called without active session (defensive).
    useWorkoutStore.setState({ sessionStart: null });
    const summary = makeSummary();
    useWorkoutStore.getState().finishSession(summary);
    expect(DB.get('logs')).toBeNull();
  });
});
