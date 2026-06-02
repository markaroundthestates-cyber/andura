// Recovery REDISTRIBUTION — the freed volume from a recovery-cut group must flow
// to the FRESH (recovered) groups TODAY's SAME session trains, so a fatigued
// chest on a push day becomes "lighter chest, HEAVIER shoulders/triceps" and the
// session stays substantial (~6-7 ex), instead of collapsing to a thin 4-ex day
// whose freed volume simply vanished.
//
// ROOT CAUSE pinned: computeSessionExerciseCount + sessionSetBudget size each
// group INDEPENDENTLY, so cutting chest used to also drop the FRESH shoulders/
// triceps budget (the freed volume vanished). These tests assert the TRANSFER:
// the cut group's freed weekly volume lands on the cluster's fresh groups,
// proportional to cluster weight, each HARD-capped at its Israetel MRV.
//
// Hard invariants:
//   - fresh same-session groups GAIN sets/exercises vs an all-recovered baseline
//     (the transfer is real, not a no-op);
//   - the whole session stays substantial (NOT collapsed);
//   - fresh groups NEVER exceed their MRV;
//   - an all-recovered / balanced day → BYTE-IDENTICAL to pre-feature (no transfer
//     when nothing is cut);
//   - determinism: same now + logs + user → identical plan.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDailyWorkout } from '../scheduleAdapter.js';
import { ISRAETEL_BASELINES } from '../../periodization/constants.js';

// Wed 2026-05-20 resolves to a PUSH day for marius / freq 5 (piept + umeri +
// triceps) — the exact split the diagnosis used (fresh = 7 ex / 19 sets).
const PUSH_DAY = new Date(2026, 4, 20);

function buildUserState(overrides = {}) {
  return {
    user: { age: 30, goal: 'hipertrofie', persona: 'marius', frequency: 5 },
    recentSessions: [],
    weights: {},
    profileTier: 'T2',
    flags: {},
    meta: { weeksElapsed: 0 },
    ...overrides,
  };
}

// A chest-only session N days ago. 2 days back decays the synergists (shoulders/
// triceps) back to FRESH while chest still reads non-recovered — so the push day
// has a CUT chest + FRESH shoulders/triceps to receive the freed volume.
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

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('scheduleAdapter — recovery redistributes freed volume to fresh same-session muscles', () => {
  it('fatigued chest on a push day → shoulders/triceps GAIN the freed volume (transfer is real)', async () => {
    const fresh = await getDailyWorkout(buildUserState(), PUSH_DAY);
    const fatigued = await getDailyWorkout(
      buildUserState({ recentSessions: [chestSession(PUSH_DAY.getTime() - TWO_DAYS)] }),
      PUSH_DAY,
    );
    expect(fresh).not.toBeNull();
    expect(fatigued).not.toBeNull();

    // Chest is the CUT group → its budget drops.
    expect(fatigued.volumeTargets.chest).toBeLessThan(fresh.volumeTargets.chest);

    // The freed chest volume flows to the FRESH same-session groups: shoulders +
    // triceps now carry MORE budget than the fresh-day baseline (they did NOT get
    // dragged down with chest — that was the vanishing-volume bug).
    const shouldersGained = fatigued.volumeTargets.shoulders > fresh.volumeTargets.shoulders;
    const tricepsGained = fatigued.volumeTargets.triceps > fresh.volumeTargets.triceps;
    expect(shouldersGained || tricepsGained).toBe(true);
    // Each fresh recipient is at least NOT below its fresh baseline (no collateral
    // shrink of a fresh same-session group — the vanishing-volume regression).
    expect(fatigued.volumeTargets.shoulders).toBeGreaterThanOrEqual(fresh.volumeTargets.shoulders);
    expect(fatigued.volumeTargets.triceps).toBeGreaterThanOrEqual(fresh.volumeTargets.triceps);
  });

  it('session stays SUBSTANTIAL on a fatigued-chest push day (does NOT collapse to a thin 4-ex day)', async () => {
    const fatigued = await getDailyWorkout(
      buildUserState({ recentSessions: [chestSession(PUSH_DAY.getTime() - TWO_DAYS)] }),
      PUSH_DAY,
    );
    expect(fatigued).not.toBeNull();
    // The diagnosis collapse was 4 ex / 12 sets. With redistribution the session
    // stays ~6-7 exercises (the freed volume keeps the fresh groups full).
    expect(fatigued.exercises.length).toBeGreaterThanOrEqual(6);
  });

  it('fresh recipients NEVER exceed their Israetel MRV', async () => {
    const fatigued = await getDailyWorkout(
      buildUserState({ recentSessions: [chestSession(PUSH_DAY.getTime() - TWO_DAYS)] }),
      PUSH_DAY,
    );
    expect(fatigued).not.toBeNull();
    for (const [enKey, sets] of Object.entries(fatigued.volumeTargets)) {
      const mrv = ISRAETEL_BASELINES[enKey]?.MRV;
      if (typeof mrv === 'number') {
        expect(sets).toBeLessThanOrEqual(mrv + 1e-9);
      }
    }
  });

  it('all-recovered / no-logs day → volumeTargets BYTE-IDENTICAL to baseline (no transfer when nothing is cut)', async () => {
    const a = await getDailyWorkout(buildUserState({ recentSessions: [] }), PUSH_DAY);
    const b = await getDailyWorkout(buildUserState({ recentSessions: [] }), PUSH_DAY);
    expect(a).not.toBeNull();
    expect(a.volumeTargets).toEqual(b.volumeTargets);
    expect(a.exercises).toEqual(b.exercises);
    // Fully-decayed old logs (all-recovered) likewise leave the budget untouched.
    const longAgo = PUSH_DAY.getTime() - 30 * 24 * 60 * 60 * 1000;
    const oldLogs = await getDailyWorkout(
      buildUserState({ recentSessions: [chestSession(longAgo)] }),
      PUSH_DAY,
    );
    expect(oldLogs.volumeTargets).toEqual(a.volumeTargets);
    expect(oldLogs.exercises).toEqual(a.exercises);
  });

  it('determinism: same now + logs + user → identical plan across runs', async () => {
    const state = () =>
      buildUserState({ recentSessions: [chestSession(PUSH_DAY.getTime() - TWO_DAYS)] });
    const a = await getDailyWorkout(state(), PUSH_DAY);
    const b = await getDailyWorkout(state(), PUSH_DAY);
    expect(a).not.toBeNull();
    expect(a.volumeTargets).toEqual(b.volumeTargets);
    expect(a.exercises).toEqual(b.exercises);
  });

  it('a fatigued-chest push day stays HEAVIER on shoulders/triceps than a hypothetical "cut chest, no transfer" run', async () => {
    // Proof of the transfer term: the SUM of the fresh recipients (shoulders +
    // triceps) on the redistributed plan EXCEEDS their fresh-baseline sum — i.e.
    // they absorbed chest's freed volume rather than it vanishing.
    const fresh = await getDailyWorkout(buildUserState(), PUSH_DAY);
    const fatigued = await getDailyWorkout(
      buildUserState({ recentSessions: [chestSession(PUSH_DAY.getTime() - TWO_DAYS)] }),
      PUSH_DAY,
    );
    const freshFreshSum = fresh.volumeTargets.shoulders + fresh.volumeTargets.triceps;
    const fatFreshSum = fatigued.volumeTargets.shoulders + fatigued.volumeTargets.triceps;
    expect(fatFreshSum).toBeGreaterThan(freshFreshSum);
  });
});
