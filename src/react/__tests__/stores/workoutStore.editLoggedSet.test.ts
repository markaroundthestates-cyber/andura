// ══ EDIT-LOG — mis-log correction (founder request 2026-07-15) ══════════════════
// "as vrea sa existe optiunea si in training la fiecare exercitiu pe masura ce
// loghezi, si la history sa editezi greutatea si reps, in cazul in care loghezi
// gresit". Two store actions + two pure halves:
//   editSessionSet  — a set logged earlier in the LIVE session (history[exIdx]).
//   editHistorySet  — a set in a FINISHED session: summary (sessionsHistory +
//                     lastSession) with recomputed aggregates AND the durable
//                     DB('logs') row (matched by the set's own timestamp; ts kept
//                     → the firebase array merge stays local-wins → sync-safe).

import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkoutStore } from '../../stores/workoutStore';
import type { LastSessionSummary } from '../../stores/workoutStore';
import {
  applySetEditToSummary,
  applySetEditToLogs,
} from '../../stores/workoutStore.logic';
import { DB } from '../../../db.js';

const SESSION_TS = 1784000000000;
const SET1_TS = SESSION_TS + 1000;
const SET2_TS = SESSION_TS + 2000;

function summaryFixture(): LastSessionSummary {
  return {
    title: 'Push',
    meta: '2 seturi · 20 min',
    ts: SESSION_TS,
    exercises: [
      {
        exerciseId: 'machine-shoulder-press',
        exerciseName: 'Presa umeri aparat',
        engineName: 'Machine Shoulder Press',
        sets: [
          { kg: 60, reps: 10, rating: 'potrivit', timestamp: SET1_TS, isPR: true, prType: 'weight' },
          { kg: 60, reps: 8, rating: 'greu', timestamp: SET2_TS },
        ],
        totalVolume: 60 * 10 + 60 * 8,
        peakOneRM: 80,
      },
    ],
  } as LastSessionSummary;
}

beforeEach(() => {
  localStorage.clear();
  useWorkoutStore.setState({
    exIdx: 0, setIdx: 0, phase: 'logging', prHit: false, history: {},
    sessionStart: null, lastRating: null, pausedSnapshot: null,
    lastSession: null, streak: 0, sessionsHistory: [], deletedSessionTs: [],
  });
});

describe('applySetEditToSummary (pure)', () => {
  it('rewrites the set + recomputes totalVolume/peakOneRM + drops isPR', () => {
    const out = applySetEditToSummary(summaryFixture(), 'machine-shoulder-press', 0, { kg: 50, reps: 10 });
    expect(out).not.toBeNull();
    const ex = out!.exercises![0]!;
    expect(ex.sets[0]).toMatchObject({ kg: 50, reps: 10, rating: 'potrivit', timestamp: SET1_TS });
    expect((ex.sets[0] as { isPR?: boolean }).isPR).toBeUndefined();
    expect(ex.totalVolume).toBe(50 * 10 + 60 * 8);
    // Epley peak across the corrected sets: max(50*(1+10/30)=66.7, 60*(1+8/30)=76)
    expect(ex.peakOneRM).toBeCloseTo(76, 1);
  });

  it('unknown exercise / bad set idx / invalid edit → null (safe no-op)', () => {
    const s = summaryFixture();
    expect(applySetEditToSummary(s, 'nope', 0, { kg: 50, reps: 10 })).toBeNull();
    expect(applySetEditToSummary(s, 'machine-shoulder-press', 9, { kg: 50, reps: 10 })).toBeNull();
    expect(applySetEditToSummary(s, 'machine-shoulder-press', 0, { kg: NaN, reps: 10 })).toBeNull();
    expect(applySetEditToSummary(s, 'machine-shoulder-press', 0, { kg: 50, reps: 0 })).toBeNull();
  });

  it('identical values → the SAME summary reference (no churn)', () => {
    const s = summaryFixture();
    expect(applySetEditToSummary(s, 'machine-shoulder-press', 0, { kg: 60, reps: 10 })).toBe(s);
  });
});

describe('applySetEditToLogs (pure)', () => {
  const rows = [
    { date: '2026-07-14', ex: 'Machine Shoulder Press', w: 60, kg: 60, set: 1, sets: 1, reps: '10', ts: SET1_TS, session: SESSION_TS, isPR: true },
    { date: '2026-07-14', ex: 'Machine Shoulder Press', w: 60, kg: 60, set: 2, sets: 1, reps: '8', ts: SET2_TS, session: SESSION_TS },
  ];

  it('rewrites w + kg + reps (string) on the ts-matched row, keeps ts, drops isPR', () => {
    const out = applySetEditToLogs(rows as never, SET1_TS, { kg: 50, reps: 10 });
    expect(out).not.toBeNull();
    expect(out![0]).toMatchObject({ w: 50, kg: 50, reps: '10', ts: SET1_TS });
    expect((out![0] as { isPR?: boolean }).isPR).toBeUndefined();
    expect(out![1]).toBe(rows[1]); // untouched row: same reference
  });

  it('no ts match → null (nothing to persist)', () => {
    expect(applySetEditToLogs(rows as never, 123, { kg: 50, reps: 10 })).toBeNull();
  });
});

describe('editSessionSet (live session)', () => {
  it('rewrites kg/reps on the logged set, keeps rating/timestamp', () => {
    useWorkoutStore.getState().logSet(0, { kg: 40, reps: 10, rating: 'usor', timestamp: SET1_TS });
    useWorkoutStore.getState().editSessionSet(0, 0, { kg: 50, reps: 8 });
    const h = useWorkoutStore.getState().history[0]!;
    expect(h[0]).toMatchObject({ kg: 50, reps: 8, rating: 'usor', timestamp: SET1_TS });
  });

  it('invalid target / invalid edit → no-op', () => {
    useWorkoutStore.getState().logSet(0, { kg: 40, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().editSessionSet(0, 5, { kg: 50, reps: 8 });
    useWorkoutStore.getState().editSessionSet(0, 0, { kg: 50, reps: 0 });
    expect(useWorkoutStore.getState().history[0]![0]).toMatchObject({ kg: 40, reps: 10 });
  });
});

describe('editHistorySet (finished session)', () => {
  it('rewrites the summary + lastSession + the durable DB logs row', () => {
    const summary = summaryFixture();
    DB.set('logs', [
      { date: '2026-07-14', ex: 'Machine Shoulder Press', w: 60, kg: 60, set: 1, sets: 1, reps: '10', ts: SET1_TS, session: SESSION_TS },
    ]);
    useWorkoutStore.setState({ sessionsHistory: [summary], lastSession: summary });

    useWorkoutStore.getState().editHistorySet(SESSION_TS, 'machine-shoulder-press', 0, { kg: 50, reps: 12 });

    const st = useWorkoutStore.getState();
    expect(st.sessionsHistory[0]!.exercises![0]!.sets[0]).toMatchObject({ kg: 50, reps: 12 });
    expect(st.lastSession!.exercises![0]!.sets[0]).toMatchObject({ kg: 50, reps: 12 });
    const logs = DB.get('logs') as Array<{ w: number; reps: string; ts: number }>;
    expect(logs[0]).toMatchObject({ w: 50, reps: '12', ts: SET1_TS });
  });

  it('unknown session ts → no-op everywhere', () => {
    const summary = summaryFixture();
    useWorkoutStore.setState({ sessionsHistory: [summary] });
    useWorkoutStore.getState().editHistorySet(999, 'machine-shoulder-press', 0, { kg: 50, reps: 12 });
    expect(useWorkoutStore.getState().sessionsHistory[0]).toBe(summary);
  });
});
