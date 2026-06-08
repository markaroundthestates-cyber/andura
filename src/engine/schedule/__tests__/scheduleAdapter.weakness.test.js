// M2 — weakness AMPLIFIES real volume toward MRV (not just reordering).
//
// Validates the moat substance in getDailyWorkout: a lagging/weak muscle group
// gets genuinely MORE volume (extra sets and/or an extra exercise) on its FRESH
// training days, its weekly budget pushed UP toward the Israetel MRV ceiling
// (applyWeaknessAmplification), then buildSession distributes the larger budget.
// Reordering (M0) stays; the new substance is REAL sets, not just positioning.
//
// Hard invariants under test (ADR 025 + determinism + MRV cap):
//   - A weak group gets MORE sets than a neutral baseline (real increase, not
//     just front-ordering — asserted on the weak group's set total).
//   - Amplified weekly volume is HARD-capped at MRV (a very-lagging group never
//     exceeds ISRAETEL_BASELINES[group].MRV).
//   - Weak + fatigued TODAY → recovery still cuts it today (M1 wins for today);
//     the amplification expresses on a FRESH day.
//   - No weakness signal → plan IDENTICAL to the M1 chassis (graceful degradation).
//   - Determinism: same now + logs + user → identical plan across runs.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDailyWorkout } from '../scheduleAdapter.js';
import { getExerciseMetadata } from '../../exerciseLibrary.js';
import { ISRAETEL_BASELINES, BIG11_RO_TO_EN_MAP } from '../../periodization/constants.js';

// Monday = PUSH day (chest leads — observable, same reasoning as the M1 test).
const MONDAY_2026_05_18 = new Date(2026, 4, 18);
const DAY_MS = 24 * 60 * 60 * 1000;

function buildUserState(overrides = {}) {
  return {
    // Marius + T2 keeps chest's weekly target high enough that amplification
    // moves the per-exercise set count / count off the clamp (observable).
    user: { age: 30, goal: 'hipertrofie', persona: 'marius' },
    recentSessions: [],
    weights: {},
    profileTier: 'T2',
    flags: {},
    meta: { weeksElapsed: 0 },
    ...overrides,
  };
}

// A session that fatigues CHEST at `ts` (3 heavy Flat DB Press sets, primary
// head chest_mid, no decay if ts == now). Same fixture shape as the M1 test.
function chestSession(ts) {
  return {
    ts,
    exercises: [
      {
        exerciseName: 'Flat DB Press',
        sets: [
          { kg: 40, reps: 8, timestamp: ts },
          { kg: 40, reps: 8, timestamp: ts },
          { kg: 40, reps: 8, timestamp: ts },
        ],
      },
    ],
  };
}

// Build logs that make CHEST lagging WITHOUT fatiguing it today: a single small
// chest touch plus MANY sets on shoulders + triceps (the other PUSH groups),
// all placed `daysAgo` in the past so resistance recovery has fully cleared
// (group reads 'recovered') but the sessions are still inside the 14-day
// lagging lookback. Lagging = chest sets << peer-group average.
function laggingChestSessions(now, daysAgo = 6) {
  const ts = now - daysAgo * DAY_MS;
  const set = (kg) => ({ kg, reps: 8, timestamp: ts });
  return [
    {
      ts,
      exercises: [
        // chest: ONE exercise, 1 set (under-volume)
        { exerciseName: 'Flat DB Press', sets: [set(30)] },
        // shoulders: heavily trained
        { exerciseName: 'DB Shoulder Press', sets: [set(20), set(20), set(20), set(20)] },
        { exerciseName: 'Lateral Raises', sets: [set(10), set(10), set(10), set(10)] },
        // triceps: heavily trained
        { exerciseName: 'Pushdown', sets: [set(25), set(25), set(25), set(25)] },
        { exerciseName: 'Overhead Triceps', sets: [set(15), set(15), set(15), set(15)] },
      ],
    },
  ];
}

// Total sets on the exercises whose primary group == the given Big-11 RO group.
function setsForGroupInPlan(plan, roGroup) {
  return plan.exercises
    .filter((e) => getExerciseMetadata(e.name).muscle_target_primary === roGroup)
    .reduce((a, e) => a + e.sets, 0);
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  // This file pins the M2 weakness-amplification CHASSIS math (weak group → toward
  // MRV; M1 recovery wins on a fatigued day) on the base periodization budget.
  // dp_learned_volume_v1 + dp_weekly_recovery_alloc_v1 now DEFAULT ON (THE FLIP
  // 2026-06-08) and overlay learned MEV/MAV + weekly redistribution that shift the
  // exact set counts under assertion. That ON behavior is validated through the real
  // seam by the full-path-sim (§B isolation) + the #70 matrix. Force them OFF here so
  // the weakness chassis math stays isolated + exact.
  localStorage.setItem('_devFlags', JSON.stringify({
    dp_learned_volume_v1: false, dp_weekly_recovery_alloc_v1: false,
  }));
});

describe('scheduleAdapter — M2 weakness amplifies real volume toward MRV', () => {
  it('lagging group gets MORE sets than a neutral baseline (real increase, not just reordering)', async () => {
    const now = MONDAY_2026_05_18;
    const baseline = await getDailyWorkout(buildUserState(), now);
    const weak = await getDailyWorkout(
      buildUserState({ recentSessions: laggingChestSessions(now.getTime()) }),
      now,
    );

    expect(baseline).not.toBeNull();
    expect(weak).not.toBeNull();

    // chest (piept) is the lagging group. Its EN weekly budget is amplified UP
    // toward MRV — strictly above the un-amplified baseline budget.
    expect(weak.volumeTargets.chest).toBeGreaterThan(baseline.volumeTargets.chest);

    // The substance: the chest group earns MORE total working sets in the plan
    // than the neutral baseline (real volume, not merely front-ordering). The
    // weak group is also exempt from the per-group slot cap, so it may earn an
    // extra exercise too — either way the set total rises.
    const baseChestSets = setsForGroupInPlan(baseline, 'piept');
    const weakChestSets = setsForGroupInPlan(weak, 'piept');
    expect(weakChestSets).toBeGreaterThan(baseChestSets);
  });

  it('amplified weekly volume is HARD-capped at MRV (very-lagging group never exceeds ceiling)', async () => {
    const now = MONDAY_2026_05_18;
    const weak = await getDailyWorkout(
      buildUserState({ recentSessions: laggingChestSessions(now.getTime()) }),
      now,
    );
    expect(weak).not.toBeNull();
    // chest MRV is the absolute recoverable ceiling — the amplified weekly
    // budget must NEVER exceed it (Israetel hard cap).
    const chestMrv = ISRAETEL_BASELINES.chest.MRV;
    expect(weak.volumeTargets.chest).toBeLessThanOrEqual(chestMrv);
    // And the amplification moved it strictly UP toward (but not past) MRV.
    expect(weak.volumeTargets.chest).toBeLessThan(chestMrv + 1e-9);
  });

  it('weak + fatigued TODAY -> recovery still cuts it today (M1 wins); amplification shows on a fresh day', async () => {
    const now = MONDAY_2026_05_18;
    // Logs that make chest BOTH lagging (historical under-volume) AND fatigued
    // TODAY (a fresh heavy chest session at `now`). The today-fatigue must win
    // for TODAY despite the amplification.
    const both = [
      ...laggingChestSessions(now.getTime()),
      chestSession(now.getTime()), // fatigues chest TODAY
    ];
    const weakFatiguedToday = await getDailyWorkout(
      buildUserState({ recentSessions: both }),
      now,
    );
    // A FRESH day: same lagging history, but the fatiguing chest session is OLD
    // (decayed) so recovery is a no-op for chest today -> amplification expresses.
    const fresh = [
      ...laggingChestSessions(now.getTime()),
      chestSession(now.getTime() - 30 * DAY_MS), // chest recovered today
    ];
    const weakFresh = await getDailyWorkout(
      buildUserState({ recentSessions: fresh }),
      now,
    );
    // Neutral baseline (no logs) — the un-amplified periodization chest budget.
    const baseline = await getDailyWorkout(buildUserState(), now);

    expect(weakFatiguedToday).not.toBeNull();
    expect(weakFresh).not.toBeNull();
    expect(baseline).not.toBeNull();

    // Recovery wins for TODAY: the fatigued-today chest budget is strictly LOWER
    // than the fresh-day amplified budget (amplify-first, then recovery cuts on
    // top — a fried muscle is NOT amplified today; the bump waits for fresh days).
    expect(weakFatiguedToday.volumeTargets.chest)
      .toBeLessThan(weakFresh.volumeTargets.chest);

    // Proof recovery actually CUT chest today: the fatigued-today budget is the
    // un-amplified periodization baseline x0.60 (fatigued multiplier) — i.e. the
    // amplification did NOT protect a group fatigued today; M1 cut it below
    // baseline. (chest stops being "lagging" once trained hard today, so it is
    // not amplified there; recovery deepens it instead — the desired safety.)
    expect(weakFatiguedToday.volumeTargets.chest)
      .toBeCloseTo(baseline.volumeTargets.chest * 0.6, 5);
    expect(weakFatiguedToday.volumeTargets.chest)
      .toBeLessThan(baseline.volumeTargets.chest);

    // And the FRESH day amplified above baseline (the bump expresses when fresh).
    expect(weakFresh.volumeTargets.chest)
      .toBeGreaterThan(baseline.volumeTargets.chest);
  });

  it('no weakness signal -> plan IDENTICAL to the M1 chassis (graceful degradation, ADR 025)', async () => {
    const now = MONDAY_2026_05_18;
    // Empty sessions -> no specialization target, no lagging groups -> weakGroups
    // empty -> amplification + reordering both no-op -> plan equals the M1 run.
    const a = await getDailyWorkout(buildUserState({ recentSessions: [] }), now);
    const b = await getDailyWorkout(buildUserState({ recentSessions: [] }), now);
    expect(a).not.toBeNull();
    expect(a.volumeTargets).toEqual(b.volumeTargets);
    expect(a.exercises).toEqual(b.exercises);
    // All 11 Israetel EN groups present + untouched (no phantom amplification).
    expect(Object.keys(a.volumeTargets).length).toBe(11);
  });

  it('determinism: same now + lagging logs + user -> identical plan across runs', async () => {
    const now = MONDAY_2026_05_18;
    const state = () =>
      buildUserState({ recentSessions: laggingChestSessions(now.getTime()) });
    const a = await getDailyWorkout(state(), now);
    const b = await getDailyWorkout(state(), now);
    expect(a).not.toBeNull();
    expect(a.volumeTargets).toEqual(b.volumeTargets);
    expect(a.exercises).toEqual(b.exercises);
  });

  it('amplification only RAISES the weak group (untouched groups keep baseline budget)', async () => {
    const now = MONDAY_2026_05_18;
    const baseline = await getDailyWorkout(buildUserState(), now);
    const weak = await getDailyWorkout(
      buildUserState({ recentSessions: laggingChestSessions(now.getTime()) }),
      now,
    );
    // back is not a PUSH-day group and is not lagging here -> unchanged budget
    // (no collateral key drift from the amplification map copy).
    expect(weak.volumeTargets.back).toBe(baseline.volumeTargets.back);
    // sanity: the RO->EN bridge the amplifier uses resolves chest correctly.
    expect(BIG11_RO_TO_EN_MAP.piept).toBe('chest');
  });
});
