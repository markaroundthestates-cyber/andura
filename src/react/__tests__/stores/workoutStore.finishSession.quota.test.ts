// ══ WORKOUT STORE — finishSession quota soft-fail (audit 2026-06-07 F1) ═══════
// MED-HIGH: zustand's persist write of `wv2-workout-store` went through
// createJSONStorage(() => localStorage).setItem UNGUARDED. A QuotaExceededError
// on that write propagated out of finishSession → aborted PostRpe.handleSubmit
// before incrementStreak/navigate → the just-completed session was silently
// LOST. The quota-safe storage adapter must swallow the quota error so the
// in-memory state update (lastSession + sessionsHistory) still completes and the
// finish/navigate path is never aborted.
//
// Real values: a normal finished session at the founder's load (Leg Extension
// 96 kg), with localStorage.setItem throwing a genuine QuotaExceededError ONLY
// for the workout-store key (other keys unaffected).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useWorkoutStore } from '../../stores/workoutStore';
import type { LastSessionSummary } from '../../stores/workoutStore';

const T0 = new Date('2026-06-07T10:00:00').getTime();

function resetStore(): void {
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    prHit: false,
    prData: null,
    history: {},
    sessionStart: T0,
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    sessionsHistory: [],
    streak: 0,
    performedExercises: {},
  });
  localStorage.clear();
}

function summary(ts: number): LastSessionSummary {
  return {
    ts,
    title: 'Leg day',
    exercises: [
      {
        exerciseName: 'Leg Extension',
        engineName: 'Leg Extension',
        sets: [{ kg: 96, reps: 12, rating: 'potrivit', timestamp: ts }],
        totalVolume: 96 * 12,
        peakOneRM: 96 * (1 + 12 / 30),
      },
    ],
  } as unknown as LastSessionSummary;
}

describe('finishSession — quota-safe persist (audit F1)', () => {
  let realSetItem: typeof Storage.prototype.setItem;

  beforeEach(() => {
    resetStore();
    realSetItem = Storage.prototype.setItem;
  });

  afterEach(() => {
    Storage.prototype.setItem = realSetItem;
    vi.restoreAllMocks();
  });

  it('completes the in-memory finish + does NOT throw when the store persist write hits quota', () => {
    // Spy: throw a genuine QuotaExceededError ONLY for the workout-store key.
    const spy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(function (this: Storage, key: string, value: string) {
        if (key === 'wv2-workout-store') {
          const err = new Error('quota');
          err.name = 'QuotaExceededError';
          throw err;
        }
        return realSetItem.call(this, key, value);
      });

    const sum = summary(T0);

    // The headline guarantee: finishSession must NOT throw under quota.
    expect(() => useWorkoutStore.getState().finishSession(sum)).not.toThrow();

    // In-memory state still correct — the session is NOT lost.
    const s = useWorkoutStore.getState();
    expect(s.lastSession).toEqual(sum);
    expect(s.sessionsHistory).toHaveLength(1);
    expect(s.sessionsHistory[0]?.ts).toBe(T0);
    expect(s.phase).toBe('idle');
    expect(s.sessionStart).toBeNull();

    // The store DID attempt the (failing) write — proves the adapter swallowed it.
    expect(spy).toHaveBeenCalledWith('wv2-workout-store', expect.any(String));
  });

  it('incrementStreak (next step in PostRpe.handleSubmit) is still reachable after a quota-failed finish', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key: string,
      value: string,
    ) {
      if (key === 'wv2-workout-store') {
        const err = new Error('quota');
        err.name = 'QuotaExceededError';
        throw err;
      }
      return realSetItem.call(this, key, value);
    });

    useWorkoutStore.getState().finishSession(summary(T0));
    // Mirrors the PostRpe.handleSubmit sequence: finish → incrementStreak → navigate.
    expect(() => useWorkoutStore.getState().incrementStreak(T0)).not.toThrow();
    expect(useWorkoutStore.getState().streak).toBe(1);
  });
});
