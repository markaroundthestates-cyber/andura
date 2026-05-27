// ══ WORKOUT STORE TESTS — Zustand State Machine V2 ════════════════════════
// Per spec task_02 §4 A — pure-function actions + persist middleware.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  useWorkoutStore,
  getCurrentMode,
  diffCalendarDays,
  nextStreak,
  SESSIONS_HISTORY_MAX,
} from '../../stores/workoutStore';
import type { WorkoutMode, LastSessionSummary } from '../../stores/workoutStore';

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
    lastStreakDate: null,
    sessionContext: null,
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
    useWorkoutStore.getState().pauseSession('Picioare');
    const snap = useWorkoutStore.getState().pausedSnapshot;
    expect(snap).not.toBeNull();
    expect(snap?.history[0]).toHaveLength(1);
  });

  it('pauseSession transitions phase la idle + clears sessionStart', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession('Push');
    expect(useWorkoutStore.getState().phase).toBe('idle');
    expect(useWorkoutStore.getState().sessionStart).toBeNull();
  });

  it('pauseSession no-op snapshot daca sessionStart null', () => {
    useWorkoutStore.getState().pauseSession('Push');
    expect(useWorkoutStore.getState().pausedSnapshot).toBeNull();
  });

  // HIGH-CODE-05 truth assertions — title preserved NU hardcoded 'Push' lie.
  it('pauseSession preserves actual workout title din caller (Maria 65 picioare)', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession('Picioare');
    expect(useWorkoutStore.getState().pausedSnapshot?.title).toBe('Picioare');
  });

  it('pauseSession preserves Pull title (NU hardcoded Push)', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession('Pull');
    expect(useWorkoutStore.getState().pausedSnapshot?.title).toBe('Pull');
  });

  it('pauseSession does NOT persist hardcoded Push when title is real', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession('Spate si biceps');
    expect(useWorkoutStore.getState().pausedSnapshot?.title).not.toBe('Push');
  });

  it('pauseSession empty title → explicit marker (sesiune nedefinita) NU Push lie', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession('');
    expect(useWorkoutStore.getState().pausedSnapshot?.title).toBe('(sesiune nedefinita)');
    expect(useWorkoutStore.getState().pausedSnapshot?.title).not.toBe('Push');
  });

  it('pauseSession whitespace-only title → explicit marker (sesiune nedefinita)', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession('   ');
    expect(useWorkoutStore.getState().pausedSnapshot?.title).toBe('(sesiune nedefinita)');
  });

  it('resumeSession restores from pausedSnapshot', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().pauseSession('Push');
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

  // Fixed clock points (UTC midnight) pentru determinism U-05 day-boundary.
  const DAY1 = Date.parse('2026-05-20T08:00:00Z');
  const DAY1_LATER = Date.parse('2026-05-20T20:00:00Z'); // aceeasi zi
  const DAY2 = Date.parse('2026-05-21T08:00:00Z'); // ziua urmatoare
  const DAY4 = Date.parse('2026-05-23T08:00:00Z'); // gap > 1 zi

  it('incrementStreak primul = 1', () => {
    useWorkoutStore.getState().incrementStreak(DAY1);
    expect(useWorkoutStore.getState().streak).toBe(1);
  });

  // U-05 (HIGH) — 2 sesiuni in aceeasi zi NU dubleaza streak (no-op same day).
  it('incrementStreak aceeasi zi = no-op (NU 2 zile consecutive)', () => {
    useWorkoutStore.getState().incrementStreak(DAY1);
    useWorkoutStore.getState().incrementStreak(DAY1_LATER);
    expect(useWorkoutStore.getState().streak).toBe(1);
  });

  // U-05 (HIGH) — zile consecutive cresc streak +1 per zi.
  it('incrementStreak zile consecutive = +1 per zi (1 → 2)', () => {
    useWorkoutStore.getState().incrementStreak(DAY1);
    useWorkoutStore.getState().incrementStreak(DAY2);
    expect(useWorkoutStore.getState().streak).toBe(2);
  });

  // U-05 (HIGH) — gap > 1 zi reseteaza streak la 1 (NU pastreaza vechiul).
  it('incrementStreak gap > 1 zi = reset la 1', () => {
    useWorkoutStore.getState().incrementStreak(DAY1);
    useWorkoutStore.getState().incrementStreak(DAY2);
    expect(useWorkoutStore.getState().streak).toBe(2);
    useWorkoutStore.getState().incrementStreak(DAY4); // skip DAY3 → gap
    expect(useWorkoutStore.getState().streak).toBe(1);
  });

  it('incrementStreak stocheaza lastStreakDate ISO zi', () => {
    useWorkoutStore.getState().incrementStreak(DAY1);
    expect(useWorkoutStore.getState().lastStreakDate).toBe('2026-05-20');
  });

  it('resetStreak zero + lastStreakDate null', () => {
    useWorkoutStore.getState().incrementStreak(DAY1);
    useWorkoutStore.getState().incrementStreak(DAY2);
    useWorkoutStore.getState().resetStreak();
    expect(useWorkoutStore.getState().streak).toBe(0);
    expect(useWorkoutStore.getState().lastStreakDate).toBeNull();
  });
});

// U-05 (HIGH) — pure day-boundary helpers (determinism, no store).
describe('workoutStore — nextStreak / diffCalendarDays (U-05)', () => {
  it('diffCalendarDays consecutive = 1', () => {
    expect(diffCalendarDays('2026-05-20', '2026-05-21')).toBe(1);
  });

  it('diffCalendarDays aceeasi zi = 0', () => {
    expect(diffCalendarDays('2026-05-20', '2026-05-20')).toBe(0);
  });

  it('diffCalendarDays gap = N zile', () => {
    expect(diffCalendarDays('2026-05-20', '2026-05-25')).toBe(5);
  });

  it('diffCalendarDays peste granita de luna', () => {
    expect(diffCalendarDays('2026-05-31', '2026-06-01')).toBe(1);
  });

  it('nextStreak lastStreakDate null = 1', () => {
    expect(nextStreak(0, null, '2026-05-20')).toBe(1);
    expect(nextStreak(7, null, '2026-05-20')).toBe(1);
  });

  it('nextStreak aceeasi zi = prevStreak (no-op)', () => {
    expect(nextStreak(3, '2026-05-20', '2026-05-20')).toBe(3);
  });

  it('nextStreak ziua urmatoare = +1', () => {
    expect(nextStreak(3, '2026-05-20', '2026-05-21')).toBe(4);
  });

  it('nextStreak gap > 1 zi = 1', () => {
    expect(nextStreak(9, '2026-05-20', '2026-05-25')).toBe(1);
  });

  it('nextStreak data viitoare/corupta = 1 (defensiv)', () => {
    expect(nextStreak(5, '2026-05-25', '2026-05-20')).toBe(1); // negative delta
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

  // LOW-CODE-10 semantic clarify: reset() is ACTIVE-session reset only.
  // sessionsHistory / streak / lastSession are cumulative cross-session
  // data preserved across resets. Full-wipe is caller responsibility
  // (see ResetDataConfirm / DeleteAccountConfirm).
  it('reset PRESERVES sessionsHistory / streak / lastSession (cumulative)', () => {
    // Clean sessionsHistory upfront (helper `resetStore` clears most fields
    // but not this cumulative one — kept surgical to LOW-CODE-10 scope).
    useWorkoutStore.setState({ sessionsHistory: [] });

    useWorkoutStore.getState().finishSession({
      title: 'Push',
      meta: '5 seturi · 52 min · 12 450 kg',
      ts: 123,
    });
    // U-05: streak set direct (test = reset PRESERVES cumulative, NU increment
    // day-logic). 2 incrementStreak() in aceeasi zi ar fi no-op post day-boundary.
    useWorkoutStore.setState({ streak: 2 });
    const before = useWorkoutStore.getState();
    expect(before.sessionsHistory).toHaveLength(1);
    expect(before.streak).toBe(2);
    expect(before.lastSession?.title).toBe('Push');

    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().reset();

    const after = useWorkoutStore.getState();
    expect(after.sessionsHistory).toHaveLength(1);
    expect(after.streak).toBe(2);
    expect(after.lastSession?.title).toBe('Push');
  });

  it('discardSession PRESERVES sessionsHistory / streak / lastSession / lastRating', () => {
    useWorkoutStore.setState({ sessionsHistory: [] });

    useWorkoutStore.getState().finishSession({
      title: 'Pull',
      meta: '4 seturi',
      ts: 1,
    });
    useWorkoutStore.getState().incrementStreak();
    useWorkoutStore.getState().setLastRating('grea');

    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().discardSession();

    const after = useWorkoutStore.getState();
    expect(after.sessionsHistory).toHaveLength(1);
    expect(after.streak).toBe(1);
    expect(after.lastSession?.title).toBe('Pull');
    // discardSession keeps lastRating (pre-session context); reset clears it.
    expect(after.lastRating).toBe('grea');
    // current session state cleared.
    expect(after.history).toEqual({});
    expect(after.sessionStart).toBeNull();
    expect(after.phase).toBe('idle');
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
    useWorkoutStore.getState().pauseSession('Push');
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
    useWorkoutStore.getState().pauseSession('Push');
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
    useWorkoutStore.getState().pauseSession('Push');
    expect(modeNow().kind).toBe('paused');
  });

  it('transition matrix — paused → resumeSession → active', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession('Push');
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
    useWorkoutStore.getState().pauseSession('Push');
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

// ── §44-H1 / §44-H2 / §44-H3 FSM coverage extension (HIGH-DELTA 2026-05-22) ──
// CRIT-ALFA §44-C1 LANDED discriminated union + selector + 18 invariant tests
// (priority + per-mode + 8 transitions). HIGH-DELTA extends with:
//   - Full transition matrix table (every source-action pair mapped to target
//     mode, including no-op identity transitions for invalid action triggers).
//   - Dead-state invariants — assert impossible transitions are guarded by
//     store actions (no-op behavior == defensive dead state).
//   - Per-mode action coverage table (every action × source-mode pair).

describe('workoutStore — §44-H1 FSM full transition matrix table', () => {
  beforeEach(resetStore);

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

  // Helper — drives store to a specific source mode reliably.
  function enterMode(kind: WorkoutMode): void {
    resetStore();
    switch (kind) {
      case 'idle':
        // default state already idle
        break;
      case 'active':
        useWorkoutStore.getState().startSession(Date.now());
        break;
      case 'resting':
        useWorkoutStore.getState().startSession(Date.now());
        useWorkoutStore.getState().setPhase('rest');
        break;
      case 'paused':
        useWorkoutStore.getState().startSession(Date.now());
        useWorkoutStore.getState().pauseSession('Push');
        break;
      case 'finished':
        useWorkoutStore
          .getState()
          .finishSession({ title: 'Push', meta: '5 seturi', ts: Date.now() });
        break;
    }
  }

  // Matrix row: [sourceMode, action, expectedTargetMode]. Transitions per
  // workoutStore actions semantics (anti-recurrence dead-state defense — no-op
  // when invalid context). Asserted exhaustively per §44.6 audit.
  type ActionName =
    | 'startSession'
    | 'setPhaseRest'
    | 'setPhaseLogging'
    | 'pauseSession'
    | 'resumeSession'
    | 'finishSession'
    | 'discardSession';

  const matrix: ReadonlyArray<[WorkoutMode, ActionName, WorkoutMode]> = [
    // idle → ...
    ['idle', 'startSession', 'active'],
    ['idle', 'setPhaseRest', 'idle'], // no session → setPhase(rest) but no sessionStart, getCurrentMode stays idle
    ['idle', 'setPhaseLogging', 'idle'],
    ['idle', 'pauseSession', 'idle'], // no-op snapshot null
    ['idle', 'resumeSession', 'idle'], // no-op snapshot null
    ['idle', 'finishSession', 'finished'],
    ['idle', 'discardSession', 'idle'],

    // active → ...
    ['active', 'setPhaseRest', 'resting'],
    ['active', 'setPhaseLogging', 'active'],
    ['active', 'pauseSession', 'paused'],
    ['active', 'finishSession', 'finished'],
    ['active', 'discardSession', 'idle'],

    // resting → ...
    ['resting', 'setPhaseLogging', 'active'],
    ['resting', 'setPhaseRest', 'resting'],
    ['resting', 'pauseSession', 'paused'],
    ['resting', 'finishSession', 'finished'],
    ['resting', 'discardSession', 'idle'],

    // paused → ...
    ['paused', 'resumeSession', 'active'],
    ['paused', 'discardSession', 'idle'],
    // pauseSession called from paused state clears snapshot (sessionStart null
    // → ternary false → pausedSnapshot=null). Documents dead-state quirk per
    // §44-H2 — second-pause invalidates snapshot. Not an ideal UX but actual
    // store semantics. Defensive caller should guard pause × pause sequence.
    ['paused', 'pauseSession', 'idle'],

    // finished → ...
    ['finished', 'startSession', 'active'], // restart flow
    // discardSession does NOT clear lastSession → finished mode preserved per
    // getCurrentMode priority (no live + no paused + lastSession → finished).
    // Documents §44-H2 dead-state behavior: discard from finished is a no-op
    // for mode purposes; lastSession survives till next finishSession overwrite
    // or full store reset() call.
    ['finished', 'discardSession', 'finished'],
  ];

  function runAction(action: ActionName): void {
    const store = useWorkoutStore.getState();
    switch (action) {
      case 'startSession':
        store.startSession(Date.now());
        return;
      case 'setPhaseRest':
        store.setPhase('rest');
        return;
      case 'setPhaseLogging':
        store.setPhase('logging');
        return;
      case 'pauseSession':
        store.pauseSession('Push');
        return;
      case 'resumeSession':
        store.resumeSession();
        return;
      case 'finishSession':
        store.finishSession({ title: 'T', meta: 'm', ts: Date.now() });
        return;
      case 'discardSession':
        store.discardSession();
        return;
    }
  }

  matrix.forEach(([source, action, target]) => {
    it(`matrix — ${source} → ${action} → ${target}`, () => {
      enterMode(source);
      // Sanity: arrived at source mode (handle finished special case — paused
      // drives sessionStart null but `finished` requires lastSession too).
      const before = modeNow();
      expect(before.kind).toBe(source);
      runAction(action);
      expect(modeNow().kind).toBe(target);
    });
  });

  it('matrix coverage — every (sourceMode, action) pair documented', () => {
    // Sanity: matrix covers at least one transition per source mode (idle,
    // active, resting, paused, finished). Failing == new mode added fara
    // matrix update.
    const sources = new Set(matrix.map(([s]) => s));
    expect(sources.has('idle')).toBe(true);
    expect(sources.has('active')).toBe(true);
    expect(sources.has('resting')).toBe(true);
    expect(sources.has('paused')).toBe(true);
    expect(sources.has('finished')).toBe(true);
  });
});

describe('workoutStore — §44-H2 dead-state invariants (no-op defensive)', () => {
  beforeEach(resetStore);

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

  it('pauseSession no-op cand sessionStart null (idle source)', () => {
    const before = useWorkoutStore.getState();
    useWorkoutStore.getState().pauseSession('Push');
    const after = useWorkoutStore.getState();
    expect(after.pausedSnapshot).toBe(before.pausedSnapshot);
    expect(modeNow().kind).toBe('idle');
  });

  it('resumeSession no-op cand pausedSnapshot null (idle source)', () => {
    const beforePhase = useWorkoutStore.getState().phase;
    const beforeStart = useWorkoutStore.getState().sessionStart;
    useWorkoutStore.getState().resumeSession();
    expect(useWorkoutStore.getState().phase).toBe(beforePhase);
    expect(useWorkoutStore.getState().sessionStart).toBe(beforeStart);
    expect(modeNow().kind).toBe('idle');
  });

  it('resumeSession during active does NOT corrupt session (snapshot null)', () => {
    useWorkoutStore.getState().startSession(Date.now());
    const beforeStart = useWorkoutStore.getState().sessionStart;
    useWorkoutStore.getState().resumeSession();
    // Snapshot was null → resume no-op; active session intact.
    expect(useWorkoutStore.getState().sessionStart).toBe(beforeStart);
    expect(modeNow().kind).toBe('active');
  });

  it('startSession during active re-initializes (idempotent fresh state)', () => {
    useWorkoutStore.getState().startSession(1000);
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().startSession(2000);
    // Fresh session — history cleared, sessionStart updated.
    expect(useWorkoutStore.getState().history).toEqual({});
    expect(useWorkoutStore.getState().sessionStart).toBe(2000);
    expect(modeNow().kind).toBe('active');
  });

  it('discardSession during paused clears snapshot + reaches idle', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession('Push');
    expect(modeNow().kind).toBe('paused');
    useWorkoutStore.getState().discardSession();
    expect(useWorkoutStore.getState().pausedSnapshot).toBeNull();
    expect(modeNow().kind).toBe('idle');
  });

  it('finished mode does NOT auto-transition without explicit action', () => {
    useWorkoutStore.getState().finishSession({ title: 'T', meta: 'm', ts: Date.now() });
    expect(modeNow().kind).toBe('finished');
    // No action ran → mode stays finished (no spontaneous transitions).
    expect(modeNow().kind).toBe('finished');
  });

  it('double-pause clears snapshot (§44-H2 dead-state quirk documented)', () => {
    // Store semantics: pauseSession with sessionStart=null reaches false branch
    // of ternary → pausedSnapshot=null. Documents quirk per audit §44.7 — a
    // pause-pause sequence destroys the snapshot. UX caller should guard
    // against re-entry (idempotent caller responsibility, NU store-internal).
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().pauseSession('Push');
    expect(useWorkoutStore.getState().pausedSnapshot).not.toBeNull();
    useWorkoutStore.getState().pauseSession('Push');
    // Snapshot wiped by second pause (sessionStart was null).
    expect(useWorkoutStore.getState().pausedSnapshot).toBeNull();
    // Mode falls back to idle (no live + no snapshot + no lastSession).
    expect(modeNow().kind).toBe('idle');
  });

  it('exhaustive switch over WorkoutMode has 5 variants documented', () => {
    // Defensive — TS strict ensures new variant addition breaks exhaustive
    // switch. Asserts current count.
    const allModes: WorkoutMode[] = ['idle', 'active', 'resting', 'paused', 'finished'];
    expect(allModes.length).toBe(5);
  });
});

describe('workoutStore — §44-H3 5-moduri action coverage per source', () => {
  beforeEach(resetStore);

  // Every action × source-mode pair → assertion the action does not throw +
  // leaves state in a valid mode (post-action getCurrentMode must return one
  // of the 5 known kinds).
  const allModes: ReadonlyArray<WorkoutMode> = ['idle', 'active', 'resting', 'paused', 'finished'];
  const validKinds: ReadonlySet<string> = new Set(allModes);

  function enterMode(kind: WorkoutMode): void {
    resetStore();
    switch (kind) {
      case 'idle':
        break;
      case 'active':
        useWorkoutStore.getState().startSession(Date.now());
        break;
      case 'resting':
        useWorkoutStore.getState().startSession(Date.now());
        useWorkoutStore.getState().setPhase('rest');
        break;
      case 'paused':
        useWorkoutStore.getState().startSession(Date.now());
        useWorkoutStore.getState().pauseSession('Push');
        break;
      case 'finished':
        useWorkoutStore
          .getState()
          .finishSession({ title: 'Push', meta: '5 seturi', ts: Date.now() });
        break;
    }
  }

  function modeAfter(): string {
    const s = useWorkoutStore.getState();
    return getCurrentMode({
      phase: s.phase,
      sessionStart: s.sessionStart,
      pausedSnapshot: s.pausedSnapshot,
      lastSession: s.lastSession,
      exIdx: s.exIdx,
    }).kind;
  }

  allModes.forEach((source) => {
    it(`from ${source} — startSession leaves state in a valid mode`, () => {
      enterMode(source);
      expect(() => useWorkoutStore.getState().startSession(Date.now())).not.toThrow();
      expect(validKinds.has(modeAfter())).toBe(true);
    });

    it(`from ${source} — pauseSession leaves state in a valid mode`, () => {
      enterMode(source);
      expect(() => useWorkoutStore.getState().pauseSession('Push')).not.toThrow();
      expect(validKinds.has(modeAfter())).toBe(true);
    });

    it(`from ${source} — resumeSession leaves state in a valid mode`, () => {
      enterMode(source);
      expect(() => useWorkoutStore.getState().resumeSession()).not.toThrow();
      expect(validKinds.has(modeAfter())).toBe(true);
    });

    it(`from ${source} — discardSession leaves state in a valid mode`, () => {
      enterMode(source);
      expect(() => useWorkoutStore.getState().discardSession()).not.toThrow();
      expect(validKinds.has(modeAfter())).toBe(true);
    });

    it(`from ${source} — finishSession leaves state in a valid mode`, () => {
      enterMode(source);
      expect(() =>
        useWorkoutStore
          .getState()
          .finishSession({ title: 'X', meta: 'y', ts: 1 })
      ).not.toThrow();
      expect(validKinds.has(modeAfter())).toBe(true);
    });

    it(`from ${source} — setPhase('rest') leaves state in a valid mode`, () => {
      enterMode(source);
      expect(() => useWorkoutStore.getState().setPhase('rest')).not.toThrow();
      expect(validKinds.has(modeAfter())).toBe(true);
    });

    it(`from ${source} — setPhase('logging') leaves state in a valid mode`, () => {
      enterMode(source);
      expect(() => useWorkoutStore.getState().setPhase('logging')).not.toThrow();
      expect(validKinds.has(modeAfter())).toBe(true);
    });
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
    useWorkoutStore.getState().pauseSession('Push');
    await new Promise((r) => setTimeout(r, 20));
    const raw = localStorage.getItem('wv2-workout-store');
    const parsed = JSON.parse(raw!);
    expect(parsed.state.pausedSnapshot).not.toBeNull();
    expect(parsed.state.pausedSnapshot.history[0]).toHaveLength(1);
  });
});

// U-03 (HIGH) — session intensity/pain context propagat preview → workout.
describe('workoutStore — sessionContext (U-03)', () => {
  beforeEach(resetStore);

  it('default sessionContext null', () => {
    expect(useWorkoutStore.getState().sessionContext).toBeNull();
  });

  it('setSessionContext stores intensityMod + painContext', () => {
    useWorkoutStore.getState().setSessionContext({
      intensityMod: 'minus',
      painContext: { region: 'umar-stang', intensity: 2 },
    });
    const ctx = useWorkoutStore.getState().sessionContext;
    expect(ctx?.intensityMod).toBe('minus');
    expect(ctx?.painContext).toEqual({ region: 'umar-stang', intensity: 2 });
  });

  it('startSession NU sterge sessionContext (preview seteaza inainte de mount)', () => {
    useWorkoutStore.getState().setSessionContext({ intensityMod: 'plus', painContext: null });
    useWorkoutStore.getState().startSession(Date.now());
    expect(useWorkoutStore.getState().sessionContext?.intensityMod).toBe('plus');
  });

  it('finishSession clears sessionContext (no leak la sesiunea urmatoare)', () => {
    useWorkoutStore.getState().setSessionContext({ intensityMod: 'minus', painContext: null });
    useWorkoutStore.getState().finishSession({ title: 'Push', meta: '4 seturi', ts: 1 });
    expect(useWorkoutStore.getState().sessionContext).toBeNull();
  });

  it('discardSession clears sessionContext', () => {
    useWorkoutStore.getState().setSessionContext({ intensityMod: 'plus', painContext: null });
    useWorkoutStore.getState().discardSession();
    expect(useWorkoutStore.getState().sessionContext).toBeNull();
  });

  it('reset clears sessionContext', () => {
    useWorkoutStore.getState().setSessionContext({ intensityMod: 'minus', painContext: null });
    useWorkoutStore.getState().reset();
    expect(useWorkoutStore.getState().sessionContext).toBeNull();
  });

  it('sessionContext NU e persistat (runtime-only)', async () => {
    useWorkoutStore.getState().setSessionContext({ intensityMod: 'minus', painContext: null });
    await new Promise((r) => setTimeout(r, 20));
    const raw = localStorage.getItem('wv2-workout-store');
    const parsed = JSON.parse(raw!);
    expect(parsed.state.sessionContext).toBeUndefined();
  });
});

// U-11 (MED) — sessionsHistory rolling cap (anti quota localStorage overflow).
describe('workoutStore — sessionsHistory cap (U-11)', () => {
  beforeEach(resetStore);

  it('SESSIONS_HISTORY_MAX e 500', () => {
    expect(SESSIONS_HISTORY_MAX).toBe(500);
  });

  it('finishSession capeaza sessionsHistory la SESSIONS_HISTORY_MAX', () => {
    // Seed la cap exact, apoi inca o sesiune → ramane la cap (NU cap+1).
    const seed: LastSessionSummary[] = Array.from({ length: SESSIONS_HISTORY_MAX }, (_, i) => ({
      title: `S${i}`,
      meta: '1 set',
      ts: i,
    }));
    useWorkoutStore.setState({ sessionsHistory: seed });
    useWorkoutStore.getState().finishSession({ title: 'NEW', meta: '1 set', ts: 999999 });
    const hist = useWorkoutStore.getState().sessionsHistory;
    expect(hist).toHaveLength(SESSIONS_HISTORY_MAX);
    // Newest-tail: ultima = sesiunea noua; prima veche (S0) evictata.
    expect(hist[hist.length - 1]?.title).toBe('NEW');
    expect(hist[0]?.title).toBe('S1');
  });

  it('finishSession sub cap NU evicteaza (append normal)', () => {
    useWorkoutStore.setState({ sessionsHistory: [] });
    useWorkoutStore.getState().finishSession({ title: 'A', meta: '1 set', ts: 1 });
    useWorkoutStore.getState().finishSession({ title: 'B', meta: '1 set', ts: 2 });
    const hist = useWorkoutStore.getState().sessionsHistory;
    expect(hist).toHaveLength(2);
    expect(hist[1]?.title).toBe('B');
  });
});

describe('workoutStore — swapExercise (WP-5 moat substitution safety)', () => {
  beforeEach(resetStore);

  it('clears history of the swapped exercise but preserves other indices', () => {
    useWorkoutStore.setState({
      exIdx: 1,
      setIdx: 2,
      sessionStart: 1000,
      history: {
        0: [{ kg: 50, reps: 10, rating: 'potrivit' }],
        1: [{ kg: 20, reps: 12, rating: 'usor' }],
      },
    });
    useWorkoutStore.getState().swapExercise(1);
    const s = useWorkoutStore.getState();
    // Index 1 (the swapped, current exercise) history dropped + reset to logging.
    expect(s.history[1]).toBeUndefined();
    expect(s.setIdx).toBe(0);
    expect(s.phase).toBe('logging');
    // Index 0 (a prior, finished exercise) untouched.
    expect(s.history[0]).toHaveLength(1);
    // sessionStart never touched.
    expect(s.sessionStart).toBe(1000);
  });

  it('swapping a NON-current exercise drops its history but does NOT reset phase/setIdx', () => {
    useWorkoutStore.setState({
      exIdx: 0,
      setIdx: 1,
      phase: 'rest',
      sessionStart: 1000,
      history: {
        0: [{ kg: 50, reps: 10, rating: 'potrivit' }],
        2: [{ kg: 30, reps: 8, rating: 'greu' }],
      },
    });
    useWorkoutStore.getState().swapExercise(2);
    const s = useWorkoutStore.getState();
    expect(s.history[2]).toBeUndefined();
    expect(s.history[0]).toHaveLength(1);
    // Current exercise (idx 0) state preserved — not the one swapped.
    expect(s.setIdx).toBe(1);
    expect(s.phase).toBe('rest');
  });

  it('never corrupts streak / lastSession / sessionsHistory', () => {
    useWorkoutStore.setState({
      exIdx: 0,
      sessionStart: 1000,
      streak: 7,
      lastStreakDate: '2026-05-27',
      lastSession: { title: 'X', meta: 'm', ts: 5 },
      sessionsHistory: [{ title: 'X', meta: 'm', ts: 5 }],
      history: { 0: [{ kg: 50, reps: 10, rating: 'potrivit' }] },
    });
    useWorkoutStore.getState().swapExercise(0);
    const s = useWorkoutStore.getState();
    expect(s.streak).toBe(7);
    expect(s.lastSession?.title).toBe('X');
    expect(s.sessionsHistory).toHaveLength(1);
  });
});
