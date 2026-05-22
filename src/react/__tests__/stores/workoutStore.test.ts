// ══ WORKOUT STORE TESTS — Zustand State Machine V2 ════════════════════════
// Per spec task_02 §4 A — pure-function actions + persist middleware.

import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkoutStore, getCurrentMode } from '../../stores/workoutStore';
import type { WorkoutMode } from '../../stores/workoutStore';

function resetStore(): void {
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    prHit: false,
    history: {},
    sessionStart: null,
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    streak: 0,
  });
  localStorage.clear();
}

describe('workoutStore — initial state', () => {
  beforeEach(resetStore);

  it('default phase idle', () => {
    expect(useWorkoutStore.getState().phase).toBe('idle');
  });

  it('default history empty', () => {
    expect(useWorkoutStore.getState().history).toEqual({});
  });

  it('default streak 0', () => {
    expect(useWorkoutStore.getState().streak).toBe(0);
  });
});

describe('workoutStore — lifecycle actions', () => {
  beforeEach(resetStore);

  it('startSession transitions idle → logging', () => {
    useWorkoutStore.getState().startSession(Date.now());
    expect(useWorkoutStore.getState().phase).toBe('logging');
  });

  it('startSession sets sessionStart timestamp', () => {
    const ts = Date.now();
    useWorkoutStore.getState().startSession(ts);
    expect(useWorkoutStore.getState().sessionStart).toBe(ts);
  });

  it('startSession resets exIdx + setIdx la 0', () => {
    useWorkoutStore.setState({ exIdx: 5, setIdx: 3 });
    useWorkoutStore.getState().startSession(Date.now());
    expect(useWorkoutStore.getState().exIdx).toBe(0);
    expect(useWorkoutStore.getState().setIdx).toBe(0);
  });

  it('pauseSession captures snapshot cu sessionStart prezent', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().pauseSession();
    const snap = useWorkoutStore.getState().pausedSnapshot;
    expect(snap).not.toBeNull();
    expect(snap?.history[0]).toHaveLength(1);
  });

  it('pauseSession transitions phase la idle + clears sessionStart', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession();
    expect(useWorkoutStore.getState().phase).toBe('idle');
    expect(useWorkoutStore.getState().sessionStart).toBeNull();
  });

  it('pauseSession no-op snapshot daca sessionStart null', () => {
    useWorkoutStore.getState().pauseSession();
    expect(useWorkoutStore.getState().pausedSnapshot).toBeNull();
  });

  it('resumeSession restores from pausedSnapshot', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().pauseSession();
    useWorkoutStore.getState().resumeSession();
    expect(useWorkoutStore.getState().pausedSnapshot).toBeNull();
    expect(useWorkoutStore.getState().history[0]).toHaveLength(1);
    expect(useWorkoutStore.getState().sessionStart).not.toBeNull();
  });

  it('resumeSession no-op daca pausedSnapshot null', () => {
    const before = useWorkoutStore.getState();
    useWorkoutStore.getState().resumeSession();
    const after = useWorkoutStore.getState();
    expect(after.phase).toBe(before.phase);
    expect(after.history).toEqual(before.history);
  });

  it('discardSession clears history + transitions idle', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().discardSession();
    expect(useWorkoutStore.getState().history).toEqual({});
    expect(useWorkoutStore.getState().phase).toBe('idle');
    expect(useWorkoutStore.getState().sessionStart).toBeNull();
  });

  it('finishSession saves lastSession summary', () => {
    useWorkoutStore.getState().finishSession({
      title: 'Push',
      meta: '5 seturi · 52 min · 12 450 kg',
      ts: 123,
    });
    expect(useWorkoutStore.getState().lastSession?.title).toBe('Push');
    expect(useWorkoutStore.getState().lastSession?.ts).toBe(123);
  });

  it('finishSession resets exIdx + history + phase idle', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().finishSession({ title: 'Pull', meta: '4 seturi', ts: 1 });
    expect(useWorkoutStore.getState().exIdx).toBe(0);
    expect(useWorkoutStore.getState().history).toEqual({});
    expect(useWorkoutStore.getState().phase).toBe('idle');
  });
});

describe('workoutStore — state machine transitions', () => {
  beforeEach(resetStore);

  it('setPhase transitions explicit', () => {
    useWorkoutStore.getState().setPhase('rest');
    expect(useWorkoutStore.getState().phase).toBe('rest');
  });

  it('logSet appends entry la history per exIdx', () => {
    useWorkoutStore.getState().logSet(0, { kg: 22.5, reps: 10, rating: 'potrivit' });
    expect(useWorkoutStore.getState().history[0]).toHaveLength(1);
    expect(useWorkoutStore.getState().history[0]![0]!.kg).toBe(22.5);
  });

  it('logSet multiple appends preserva order', () => {
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().logSet(0, { kg: 22.5, reps: 8, rating: 'potrivit' });
    useWorkoutStore.getState().logSet(0, { kg: 25, reps: 6, rating: 'greu' });
    expect(useWorkoutStore.getState().history[0]).toHaveLength(3);
    expect(useWorkoutStore.getState().history[0]![2]!.rating).toBe('greu');
  });

  it('logSet izolat per exIdx (multi-exercise flow)', () => {
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().logSet(1, { kg: 50, reps: 8, rating: 'potrivit' });
    expect(useWorkoutStore.getState().history[0]).toHaveLength(1);
    expect(useWorkoutStore.getState().history[1]).toHaveLength(1);
  });

  it('advanceExercise increments exIdx + resets setIdx + phase logging', () => {
    useWorkoutStore.setState({ exIdx: 0, setIdx: 3, phase: 'rest' });
    useWorkoutStore.getState().advanceExercise();
    expect(useWorkoutStore.getState().exIdx).toBe(1);
    expect(useWorkoutStore.getState().setIdx).toBe(0);
    expect(useWorkoutStore.getState().phase).toBe('logging');
  });

  it('markPRHit sets flag true', () => {
    useWorkoutStore.getState().markPRHit();
    expect(useWorkoutStore.getState().prHit).toBe(true);
  });

  it('setLastRating writes value', () => {
    useWorkoutStore.getState().setLastRating('grea');
    expect(useWorkoutStore.getState().lastRating).toBe('grea');
  });
});

describe('workoutStore — streak', () => {
  beforeEach(resetStore);

  it('incrementStreak +1', () => {
    useWorkoutStore.getState().incrementStreak();
    expect(useWorkoutStore.getState().streak).toBe(1);
  });

  it('incrementStreak cumulativ', () => {
    useWorkoutStore.getState().incrementStreak();
    useWorkoutStore.getState().incrementStreak();
    useWorkoutStore.getState().incrementStreak();
    expect(useWorkoutStore.getState().streak).toBe(3);
  });

  it('resetStreak zero', () => {
    useWorkoutStore.getState().incrementStreak();
    useWorkoutStore.getState().incrementStreak();
    useWorkoutStore.getState().resetStreak();
    expect(useWorkoutStore.getState().streak).toBe(0);
  });
});

describe('workoutStore — reset', () => {
  beforeEach(resetStore);

  it('reset clears toate sessions runtime state', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().markPRHit();
    useWorkoutStore.getState().setLastRating('normala');
    useWorkoutStore.getState().reset();
    expect(useWorkoutStore.getState().phase).toBe('idle');
    expect(useWorkoutStore.getState().history).toEqual({});
    expect(useWorkoutStore.getState().prHit).toBe(false);
    expect(useWorkoutStore.getState().lastRating).toBeNull();
    expect(useWorkoutStore.getState().sessionStart).toBeNull();
  });
});

describe('workoutStore — §44-C1 getCurrentMode discriminated union', () => {
  beforeEach(resetStore);

  // Helper to derive mode from current store snapshot.
  function modeNow(): ReturnType<typeof getCurrentMode> {
    const s = useWorkoutStore.getState();
    return getCurrentMode({
      phase: s.phase,
      sessionStart: s.sessionStart,
      pausedSnapshot: s.pausedSnapshot,
      lastSession: s.lastSession,
      exIdx: s.exIdx,
    });
  }

  it('idle mode default — no session + no paused + no lastSession', () => {
    expect(modeNow().kind).toBe('idle');
  });

  it('active mode after startSession (phase=logging)', () => {
    useWorkoutStore.getState().startSession(Date.now());
    const mode = modeNow();
    expect(mode.kind).toBe('active');
    if (mode.kind === 'active') {
      expect(mode.phase).toBe('logging');
      expect(typeof mode.sessionStart).toBe('number');
    }
  });

  it('resting mode when phase=rest cu sessionStart live', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().setPhase('rest');
    expect(modeNow().kind).toBe('resting');
  });

  it('active mode for rating phase (intermediate FSM state)', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().setPhase('rating');
    expect(modeNow().kind).toBe('active');
  });

  it('active mode for transition phase (between exercises)', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().setPhase('transition');
    expect(modeNow().kind).toBe('active');
  });

  it('paused mode after pauseSession captures snapshot', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession();
    const mode = modeNow();
    expect(mode.kind).toBe('paused');
    if (mode.kind === 'paused') {
      expect(mode.snapshot).not.toBeNull();
    }
  });

  it('finished mode after finishSession + idle + no paused', () => {
    useWorkoutStore.getState().finishSession({
      title: 'Push',
      meta: '5 seturi · 52 min · 12 450 kg',
      ts: Date.now(),
    });
    const mode = modeNow();
    expect(mode.kind).toBe('finished');
    if (mode.kind === 'finished') {
      expect(mode.lastSession.title).toBe('Push');
    }
  });

  it('active takes priority over paused snapshot (resumeSession flow)', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession();
    useWorkoutStore.getState().resumeSession();
    expect(modeNow().kind).toBe('active');
  });

  it('paused takes priority over lastSession', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Pull', meta: '4 seturi', ts: 100 },
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 2',
        exIdx: 1,
        setIdx: 0,
        phase: 'logging',
        history: {},
        sessionStart: Date.now() - 60000,
      },
      sessionStart: null,
      phase: 'idle',
    });
    expect(modeNow().kind).toBe('paused');
  });

  // Transition matrix invariants — every (fromMode, action) → toMode pair
  // enforced. Failed transitions = invalid state machine (audit §14.3 dead
  // states defense).
  it('transition matrix — idle → startSession → active', () => {
    expect(modeNow().kind).toBe('idle');
    useWorkoutStore.getState().startSession(Date.now());
    expect(modeNow().kind).toBe('active');
  });

  it('transition matrix — active → setPhase(rest) → resting', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().setPhase('rest');
    expect(modeNow().kind).toBe('resting');
  });

  it('transition matrix — resting → setPhase(logging) → active', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().setPhase('rest');
    useWorkoutStore.getState().setPhase('logging');
    expect(modeNow().kind).toBe('active');
  });

  it('transition matrix — active → pauseSession → paused', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession();
    expect(modeNow().kind).toBe('paused');
  });

  it('transition matrix — paused → resumeSession → active', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession();
    useWorkoutStore.getState().resumeSession();
    expect(modeNow().kind).toBe('active');
  });

  it('transition matrix — active → finishSession → finished', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().finishSession({
      title: 'Pull',
      meta: '4 seturi',
      ts: Date.now(),
    });
    expect(modeNow().kind).toBe('finished');
  });

  it('transition matrix — active → discardSession → idle', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().discardSession();
    expect(modeNow().kind).toBe('idle');
  });

  it('transition matrix — paused → discardSession → idle', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession();
    useWorkoutStore.getState().discardSession();
    expect(modeNow().kind).toBe('idle');
  });

  it('exhaustive switch compiles cu default: never (compile-time guarantee)', () => {
    // Pure-function exhaustiveness probe — switch on kind covers all 5
    // variants; default: never branch unreachable. Failing TS strict typecheck
    // = added new variant fără update consumers.
    const probe = (m: ReturnType<typeof getCurrentMode>): WorkoutMode => {
      switch (m.kind) {
        case 'idle': return 'idle';
        case 'active': return 'active';
        case 'resting': return 'resting';
        case 'paused': return 'paused';
        case 'finished': return 'finished';
        default: {
          const _never: never = m;
          return _never;
        }
      }
    };
    expect(probe({ kind: 'idle' })).toBe('idle');
  });
});

describe('workoutStore — persist middleware partialize', () => {
  beforeEach(resetStore);

  it('persist write contains streak after incrementStreak', async () => {
    useWorkoutStore.getState().incrementStreak();
    await new Promise((r) => setTimeout(r, 20));
    const raw = localStorage.getItem('wv2-workout-store');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.streak).toBe(1);
  });

  it('persist write OMITS sessionStart (runtime-only)', async () => {
    useWorkoutStore.getState().startSession(Date.now());
    await new Promise((r) => setTimeout(r, 20));
    const raw = localStorage.getItem('wv2-workout-store');
    const parsed = JSON.parse(raw!);
    expect(parsed.state.sessionStart).toBeUndefined();
  });

  it('persist write contains lastSession dupa finishSession', async () => {
    useWorkoutStore.getState().finishSession({ title: 'Push', meta: '4 seturi', ts: 999 });
    await new Promise((r) => setTimeout(r, 20));
    const raw = localStorage.getItem('wv2-workout-store');
    const parsed = JSON.parse(raw!);
    expect(parsed.state.lastSession.title).toBe('Push');
    expect(parsed.state.lastSession.ts).toBe(999);
  });

  it('persist write contains pausedSnapshot dupa pauseSession', async () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().pauseSession();
    await new Promise((r) => setTimeout(r, 20));
    const raw = localStorage.getItem('wv2-workout-store');
    const parsed = JSON.parse(raw!);
    expect(parsed.state.pausedSnapshot).not.toBeNull();
    expect(parsed.state.pausedSnapshot.history[0]).toHaveLength(1);
  });
});
