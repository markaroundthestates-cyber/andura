// ══ WORKOUT STORE — finishSession logs BRIDGE (Daniel P0 2026-06-06) ══════════
// THE HEADLINE BUG: the engine never learned from the founder's REAL (manually-
// entered) workouts. His live DB('logs') held ONLY 2 stale entries while his
// sessionsHistory held 4 FULL sessions (Leg Extension up to 96 kg, entered by
// hand because the recs were off). The coach recommended Leg Extension 40 kg, he
// did 96, and next session it STILL recommended ~40 (a cold-start value — no
// `logs` entry for that exercise under the engine name).
//
// ROOT CAUSE (the persistence BRIDGE, NOT the DP math): the live in-session
// `history` carries only kg/reps/rating — NO exercise identity. PostRpe re-derived
// the engineName from a FRESH getTodayWorkout() at finish, indexed by exIdx. When
// that re-derivation drifted (midnight roll → null plan, an unseen swap, reordered
// slots) the logs were keyed under the RO DISPLAY name → DP.getLogs(engineName)
// found nothing → cold-start forever.
//
// THE FIX: stamp the authoritative engine identity into each `history` entry AT
// LOG TIME (from the live Workout screen), and have the summary build prefer the
// SET's own recorded identity over any finish-time plan re-derivation. These tests
// drive the REAL store (logSet → summary-from-history → finishSession) — NOT a
// pre-seeded summary that already carries the right engineName (the wrong layer).
//
// Uses the founder's REAL values: Leg Extension 96 kg (range 10-15, step 5).

import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkoutStore } from '../../stores/workoutStore';
import type {
  LastSessionSummary,
  SessionExerciseBreakdown,
} from '../../stores/workoutStore';
import { DB } from '../../../db.js';
import { DP } from '../../../engine/dp.js';

const T0 = new Date('2026-06-06T10:00:00').getTime();

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
    performedExercises: {},
  });
  localStorage.clear();
}

// Build the session summary EXACTLY as PostRpe.handleSubmit does — from the
// store's in-memory `history`, reading the engine identity from the SET's own
// recorded engineName/exerciseName (the new live-stamped fields). Deliberately
// passes NO re-derived plan, so the test proves the logs key is correct WITHOUT
// any finish-time getTodayWorkout() — the exact independence the fix gives.
function buildSummaryFromHistory(): LastSessionSummary {
  const { history } = useWorkoutStore.getState();
  const exercises: SessionExerciseBreakdown[] = Object.entries(history)
    .map(([exIdxStr, sets]) => {
      const exIdx = Number(exIdxStr);
      // Mirror PostRpe: prefer the set's own recorded identity (live-stamped).
      const loggedEngineName = sets.find((s) => s.engineName)?.engineName;
      const loggedExerciseName = sets.find((s) => s.exerciseName)?.exerciseName;
      const exerciseName = loggedExerciseName ?? `Exercitiu ${exIdx + 1}`;
      const engineName = loggedEngineName ?? exerciseName;
      let totalVolume = 0;
      let peakOneRM = 0;
      const breakdownSets = sets.map((s) => {
        totalVolume += s.kg * s.reps;
        const oneRM = s.kg * (1 + s.reps / 30);
        if (oneRM > peakOneRM) peakOneRM = oneRM;
        return { kg: s.kg, reps: s.reps, rating: s.rating, timestamp: s.timestamp ?? Date.now() };
      });
      return {
        exerciseId: `ex-${exIdx}`,
        exerciseName,
        engineName,
        sets: breakdownSets,
        totalVolume,
        peakOneRM: Math.round(peakOneRM * 10) / 10,
      };
    })
    .filter((bd) => bd.sets.length > 0);
  const sets = exercises.reduce((acc, e) => acc + e.sets.length, 0);
  const volumeKg = exercises.reduce((acc, e) => acc + e.totalVolume, 0);
  return { title: 'Picioare', meta: 'x', ts: T0 + 30 * 60000, sets, durationMin: 30, volumeKg, exercises };
}

describe('workoutStore — logs bridge: every completed set reaches DB(logs) under engineName', () => {
  beforeEach(resetStore);

  it('NORMAL finish: a manually-entered Leg Extension 96 set lands in DB(logs) under the ENGINE name', () => {
    const store = useWorkoutStore.getState();
    store.startSession(T0);
    // The founder enters his own load (96), overriding whatever the rec was. The
    // screen stamps the engine identity onto the set at log time. RO display name
    // "Extensii picioare" ≠ engine name "Leg Extension" (the live break).
    store.logSet(0, {
      kg: 96, reps: 12, rating: 'potrivit', timestamp: T0 + 1000,
      engineName: 'Leg Extension', exerciseName: 'Extensii picioare',
    });

    useWorkoutStore.getState().finishSession(buildSummaryFromHistory());

    const logs = DB.get('logs') as Array<{ ex: string; w: number }>;
    // Keyed on the EN canonical DP reads — NOT stranded under the RO display name.
    expect(logs.find((l) => l.ex === 'Leg Extension')?.w).toBe(96);
    expect(logs.find((l) => l.ex === 'Extensii picioare')).toBeUndefined();
  });

  it('after a NORMAL finish, DP.getLogs(engineName) returns the entered weight (not cold-start)', () => {
    const store = useWorkoutStore.getState();
    store.startSession(T0);
    store.logSet(0, {
      kg: 96, reps: 12, rating: 'potrivit', timestamp: T0 + 1000,
      engineName: 'Leg Extension', exerciseName: 'Extensii picioare',
    });
    useWorkoutStore.getState().finishSession(buildSummaryFromHistory());

    const found = DP.getLogs('Leg Extension');
    expect(found.length).toBeGreaterThan(0);
    expect(found[0]!.w).toBe(96);
  });

  it('the NEXT recommendation reflects the entered 96 kg — NOT the cold-start 40', () => {
    // Cold start with NO logs → INIT default (well below 40, the rec the founder saw).
    const cold = DP.recommend('Leg Extension', Date.now());
    expect(cold.status).toBe('INIT');
    expect(cold.kg).toBeLessThan(40);

    const store = useWorkoutStore.getState();
    store.startSession(T0);
    store.logSet(0, {
      kg: 96, reps: 12, rating: 'potrivit', timestamp: T0 + 1000,
      engineName: 'Leg Extension', exerciseName: 'Extensii picioare',
    });
    useWorkoutStore.getState().finishSession(buildSummaryFromHistory());

    const rec = DP.recommend('Leg Extension', Date.now());
    // The coach now ADAPTS off the real entry: the recommendation is anchored at
    // the ~96 the founder actually lifted (held — potrivit fills reps; 96 snaps to
    // the real 5 kg leg-machine stack → 100), light-years from the cold-start 40
    // it used to re-serve forever.
    expect(rec.status).not.toBe('INIT');
    expect(rec.kg).toBeGreaterThanOrEqual(95);
  });
});

describe('workoutStore — logs bridge: finish-EARLY path still writes logs', () => {
  beforeEach(resetStore);

  it('finish-early (sessionStart null) STILL writes the completed sets to DB(logs)', () => {
    // The finish-early flow routes through PostRpe, which calls finishSession with
    // the in-memory history summary. A returning user whose sessionStart was lost
    // on a stale lifecycle path used to early-return in persistSessionLogs → logs
    // never written. finishSession now falls back to summary.ts, so the partial
    // session's completed sets reach DB(logs) regardless.
    const store = useWorkoutStore.getState();
    store.startSession(T0); // sets up history below
    store.logSet(0, {
      kg: 96, reps: 12, rating: 'potrivit', timestamp: T0 + 1000,
      engineName: 'Leg Extension', exerciseName: 'Extensii picioare',
    });
    // Simulate the lost-start lifecycle (returning user / reload) AT FINISH.
    useWorkoutStore.setState({ sessionStart: null });

    useWorkoutStore.getState().finishSession(buildSummaryFromHistory());

    const logs = DB.get('logs') as Array<{ ex: string; w: number }>;
    expect(logs.find((l) => l.ex === 'Leg Extension')?.w).toBe(96);
  });

  it('finish-early does NOT drop the completed sets of the in-progress exercise', () => {
    // The founder "finished early + skipped" mid-leg-day. Every set he had already
    // RATED (committed to history) must survive the cut — including the current
    // exercise's logged sets, not just the fully-completed earlier ones.
    const store = useWorkoutStore.getState();
    store.startSession(T0);
    // Earlier exercise — fully done.
    store.logSet(0, {
      kg: 70, reps: 10, rating: 'potrivit', timestamp: T0 + 1000,
      engineName: 'Romanian Deadlift', exerciseName: 'Indreptari romanesti',
    });
    // CURRENT exercise — one set logged, then he finishes early.
    store.logSet(1, {
      kg: 96, reps: 12, rating: 'potrivit', timestamp: T0 + 2000,
      engineName: 'Leg Extension', exerciseName: 'Extensii picioare',
    });
    useWorkoutStore.setState({ sessionStart: null }); // finish-early lifecycle

    useWorkoutStore.getState().finishSession(buildSummaryFromHistory());

    const logs = DB.get('logs') as Array<{ ex: string; w: number }>;
    // BOTH the earlier exercise AND the in-progress exercise's logged set persist.
    expect(logs.find((l) => l.ex === 'Romanian Deadlift')?.w).toBe(70);
    expect(logs.find((l) => l.ex === 'Leg Extension')?.w).toBe(96);
    // And the engine adapts on the in-progress exercise's real load next session.
    expect(DP.getLogs('Leg Extension')[0]!.w).toBe(96);
  });

  it('after a finish-EARLY save, the NEXT Leg Extension recommendation reflects 96', () => {
    const store = useWorkoutStore.getState();
    store.startSession(T0);
    store.logSet(0, {
      kg: 96, reps: 12, rating: 'potrivit', timestamp: T0 + 1000,
      engineName: 'Leg Extension', exerciseName: 'Extensii picioare',
    });
    useWorkoutStore.setState({ sessionStart: null });
    useWorkoutStore.getState().finishSession(buildSummaryFromHistory());

    const rec = DP.recommend('Leg Extension', Date.now());
    expect(rec.status).not.toBe('INIT');
    expect(rec.kg).toBeGreaterThanOrEqual(95); // ~96 snapped to the 5 kg stack (100)
  });
});

describe('workoutStore — logs bridge: identity comes from the SET, not a re-derived plan', () => {
  beforeEach(resetStore);

  it('writes the correct engineName even when NO plan is available at finish (midnight-roll case)', () => {
    // The killer drift: getTodayWorkout() returns null at finish (the day rolled
    // into a rest day, or the pipeline halted). The OLD build had no plan to read
    // engineName from → it fell back to the RO display name → DP never saw it. The
    // set-stamped identity makes the log key correct with NO plan whatsoever.
    const store = useWorkoutStore.getState();
    store.startSession(T0);
    store.logSet(0, {
      kg: 96, reps: 12, rating: 'potrivit', timestamp: T0 + 1000,
      engineName: 'Leg Extension', exerciseName: 'Extensii picioare',
    });
    // buildSummaryFromHistory passes NO plan — pure set-recorded identity.
    useWorkoutStore.getState().finishSession(buildSummaryFromHistory());

    expect(DP.getLogs('Leg Extension')[0]!.w).toBe(96);
  });
});
