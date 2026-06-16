// MRV-ceiling weekly recompose must NOT leak the today-only 'Alta grupa' override
// (options.differentMuscle) into the sibling days.
//
// dp_mrv_ceiling_v1 re-composes EVERY active day of the week through the SAME
// compose seam (composePlannedWorkoutToday with _mrvRecompute:true) to read the
// TRUE weekly delivered volume that sets today's MRV ceiling. The bug: it spread
// `{ ...options }` into each sibling, propagating the TODAY-ONLY differentMuscle
// override into ALL siblings — so the weekly-delivered baseline was computed from a
// PHANTOM week where every day is the overridden cluster. The fix strips
// differentMuscle from the sibling compose options; today's own day still keeps the
// swap (it reuses the already-built trimmedExercises).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { composePlannedWorkoutToday } from '../../lib/scheduleAdapterAggregate';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { DEV_FLAGS_KEY } from '../../../util/featureFlags';

// A Tuesday on a 4-day week → an active week with sibling days the recompose visits.
const TUESDAY_2026_05_19 = new Date(2026, 4, 19);

function resetStores(): void {
  useOnboardingStore.setState({
    data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 75, height: 175 },
    completed: true,
    completedAt: Date.now(),
  });
  useWorkoutStore.setState({
    exIdx: 0, setIdx: 0, phase: 'idle', prHit: false, prData: null, history: {},
    sessionStart: null, lastRating: null, pausedSnapshot: null, lastSession: null,
    sessionsHistory: [], streak: 0,
  });
}

beforeEach(() => {
  localStorage.clear();
  resetStores();
  vi.restoreAllMocks();
  // dp_mrv_ceiling_v1 ON so the weekly recompose runs.
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ dp_mrv_ceiling_v1: true }));
});

describe('MRV recompose ignores the today-only differentMuscle override', () => {
  it('siblings recompose WITHOUT differentMuscle (no phantom-week ceiling); today keeps it', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    const real = mod.getDailyWorkout;
    // Spy that DELEGATES to the real impl (so __activeWeek/__dayIdx are real) but
    // records the options each call received + whether it was a sibling recompose.
    const calls: Array<{ differentMuscle: boolean; mrvRecompute: boolean }> = [];
    vi.spyOn(mod, 'getDailyWorkout').mockImplementation(async (userState, now, options) => {
      const o = (options ?? {}) as { differentMuscle?: boolean; _mrvRecompute?: boolean };
      calls.push({ differentMuscle: o.differentMuscle === true, mrvRecompute: o._mrvRecompute === true });
      return real(userState, now, options);
    });

    await composePlannedWorkoutToday(TUESDAY_2026_05_19, { differentMuscle: true });

    // The recompose fired → at least one sibling (_mrvRecompute) call happened.
    const siblingCalls = calls.filter((c) => c.mrvRecompute);
    expect(siblingCalls.length).toBeGreaterThan(0);
    // No sibling recompose carried the today-only override (would be a phantom week).
    expect(siblingCalls.every((c) => c.differentMuscle === false)).toBe(true);
    // The TOP-LEVEL (non-recompute) call DID carry the override — today keeps the swap.
    const topCall = calls.find((c) => !c.mrvRecompute);
    expect(topCall?.differentMuscle).toBe(true);
  });
});
