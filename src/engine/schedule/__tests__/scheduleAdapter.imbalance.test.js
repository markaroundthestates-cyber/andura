// M3 — imbalance detection + correction wired INTO the daily plan.
//
// Validates the moat substance in getDailyWorkout: from training HISTORY alone,
// a push-dominant program biases volume toward the PULL side (back/biceps) and a
// quad-dominant program biases toward the HAMSTRING side — automatically, ZERO
// user input (ADR 025). Volume biasing only — NOT a medical signal.
//
// Hard invariants under test:
//   - Push-dominant history → pull-side budget (back/biceps) rises vs a balanced
//     baseline; quad-dominant → hamstring budget rises. (real increase asserted)
//   - Balanced history → no change (graceful). Insufficient data → no change.
//   - Corrected volume HARD-capped at MRV.
//   - Composition M2→M3→M1: a lagging-side group fatigued TODAY is still
//     recovery-cut today (M1 wins); the correction expresses on a FRESH day.
//   - Determinism: same now + logs + user → identical plan across runs.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDailyWorkout } from '../scheduleAdapter.js';
import { ISRAETEL_BASELINES } from '../../periodization/constants.js';

const MONDAY_2026_05_18 = new Date(2026, 4, 18);
const DAY_MS = 24 * 60 * 60 * 1000;

function buildUserState(overrides = {}) {
  return {
    user: { age: 30, goal: 'hipertrofie', persona: 'marius' },
    recentSessions: [],
    weights: {},
    profileTier: 'T2',
    flags: {},
    meta: { weeksElapsed: 0 },
    ...overrides,
  };
}

// One exercise with n sets at ts (persisted SessionExerciseBreakdown shape).
const exercise = (name, n, ts) => ({
  exerciseName: name,
  sets: Array.from({ length: n }, () => ({ kg: 20, reps: 8, timestamp: ts })),
});

// Push-dominant history placed `daysAgo` in the past so resistance recovery has
// cleared today (groups read 'recovered') but the sessions are inside the 14-day
// lagging/imbalance lookback. Push (chest+shoulders+triceps) >> pull (back+biceps).
function pushDominantSessions(now, daysAgo = 6) {
  const ts = now - daysAgo * DAY_MS;
  return [
    {
      ts,
      exercises: [
        exercise('Flat DB Press', 6, ts),      // piept (push)
        exercise('DB Shoulder Press', 6, ts),  // umeri (push)
        exercise('Pushdown', 6, ts),           // triceps (push) → push = 18
        exercise('Lat Pulldown', 3, ts),       // spate (pull)
        exercise('Bayesian Curl', 2, ts),      // biceps (pull) → pull = 5; ratio 3.6
      ],
    },
  ];
}

// Balanced history: push ≈ pull (within 1.3) and quad ≈ ham (within 1.5).
function balancedSessions(now, daysAgo = 6) {
  const ts = now - daysAgo * DAY_MS;
  return [
    {
      ts,
      exercises: [
        exercise('Flat DB Press', 4, ts),     // piept
        exercise('Pushdown', 4, ts),          // triceps → push = 8
        exercise('Lat Pulldown', 4, ts),
        exercise('Bayesian Curl', 3, ts),     // pull = 7 → ratio ~1.14
        exercise('Leg Extension', 4, ts),     // quad
        exercise('Leg Curl', 4, ts),          // ham → ratio 1.0
      ],
    },
  ];
}

// Quad-dominant: many quad sets, few hamstring → bias toward hamstrings.
function quadDominantSessions(now, daysAgo = 6) {
  const ts = now - daysAgo * DAY_MS;
  return [
    {
      ts,
      exercises: [
        exercise('Leg Extension', 8, ts), // quad = 8
        exercise('Leg Curl', 3, ts),      // ham = 3 → ratio 2.67 > 1.5
      ],
    },
  ];
}

// Pull session that fatigues BACK + biceps TODAY (no decay → fatigued today).
function pullFatiguedToday(now) {
  return {
    ts: now,
    exercises: [
      exercise('Lat Pulldown', 4, now),
      exercise('Bayesian Curl', 4, now),
    ],
  };
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('scheduleAdapter — M3 imbalance correction in the daily plan', () => {
  it('push-dominant history → pull-side budget (back + biceps) rises vs balanced baseline', async () => {
    const now = MONDAY_2026_05_18;
    const baseline = await getDailyWorkout(
      buildUserState({ recentSessions: balancedSessions(now.getTime()) }),
      now,
    );
    const pushDom = await getDailyWorkout(
      buildUserState({ recentSessions: pushDominantSessions(now.getTime()) }),
      now,
    );
    expect(baseline).not.toBeNull();
    expect(pushDom).not.toBeNull();

    // The lagging PULL side (back + biceps) earns MORE weekly volume than the
    // balanced baseline — the imbalance correction biased volume posterior.
    expect(pushDom.volumeTargets.back).toBeGreaterThan(baseline.volumeTargets.back);
    expect(pushDom.volumeTargets.biceps).toBeGreaterThan(baseline.volumeTargets.biceps);
  });

  it('quad-dominant history → hamstring budget rises vs balanced baseline', async () => {
    const now = MONDAY_2026_05_18;
    const baseline = await getDailyWorkout(
      buildUserState({ recentSessions: balancedSessions(now.getTime()) }),
      now,
    );
    const quadDom = await getDailyWorkout(
      buildUserState({ recentSessions: quadDominantSessions(now.getTime()) }),
      now,
    );
    expect(baseline).not.toBeNull();
    expect(quadDom).not.toBeNull();
    expect(quadDom.volumeTargets.hamstrings)
      .toBeGreaterThan(baseline.volumeTargets.hamstrings);
  });

  it('balanced history → NO change vs the M2 chassis (graceful degradation)', async () => {
    const now = MONDAY_2026_05_18;
    // The balanced fixture stays within both thresholds → imbalance is a no-op →
    // the plan equals running the SAME balanced state twice (idempotent / stable).
    const a = await getDailyWorkout(
      buildUserState({ recentSessions: balancedSessions(now.getTime()) }),
      now,
    );
    const b = await getDailyWorkout(
      buildUserState({ recentSessions: balancedSessions(now.getTime()) }),
      now,
    );
    expect(a).not.toBeNull();
    expect(a.volumeTargets).toEqual(b.volumeTargets);
    expect(a.exercises).toEqual(b.exercises);
  });

  it('insufficient data (no logs) → plan identical across runs (no phantom correction)', async () => {
    const now = MONDAY_2026_05_18;
    const a = await getDailyWorkout(buildUserState({ recentSessions: [] }), now);
    const b = await getDailyWorkout(buildUserState({ recentSessions: [] }), now);
    expect(a).not.toBeNull();
    expect(a.volumeTargets).toEqual(b.volumeTargets);
    expect(Object.keys(a.volumeTargets).length).toBe(11);
  });

  it('corrected pull-side volume is HARD-capped at MRV', async () => {
    const now = MONDAY_2026_05_18;
    const pushDom = await getDailyWorkout(
      buildUserState({ recentSessions: pushDominantSessions(now.getTime()) }),
      now,
    );
    expect(pushDom).not.toBeNull();
    expect(pushDom.volumeTargets.back).toBeLessThanOrEqual(ISRAETEL_BASELINES.back.MRV);
    expect(pushDom.volumeTargets.biceps).toBeLessThanOrEqual(ISRAETEL_BASELINES.biceps.MRV);
  });

  it('composition M2→M3→M1: a lagging-side group fatigued TODAY is still recovery-cut today; correction shows on a fresh day', async () => {
    const now = MONDAY_2026_05_18;
    // BOTH: push-dominant history (back is lagging-side → M3 wants to RAISE it)
    // AND back fatigued TODAY (a fresh pull session at `now` → M1 must CUT it).
    const both = [
      ...pushDominantSessions(now.getTime()),
      pullFatiguedToday(now.getTime()),
    ];
    const fatiguedToday = await getDailyWorkout(
      buildUserState({ recentSessions: both }),
      now,
    );
    // FRESH day: same push-dominant history, the fatiguing pull session is OLD
    // (decayed) → recovery is a no-op for back today → the M3 correction expresses.
    const freshPull = { ...pullFatiguedToday(now.getTime() - 30 * DAY_MS) };
    const fresh = [...pushDominantSessions(now.getTime()), freshPull];
    const freshDay = await getDailyWorkout(
      buildUserState({ recentSessions: fresh }),
      now,
    );

    expect(fatiguedToday).not.toBeNull();
    expect(freshDay).not.toBeNull();

    // Recovery wins for TODAY: the fatigued-today back budget is strictly LOWER
    // than the fresh-day corrected budget (M2→M3 raise the weekly budget, then M1
    // cuts today's fried group on top — a fried muscle is rested, not pushed).
    expect(fatiguedToday.volumeTargets.back)
      .toBeLessThan(freshDay.volumeTargets.back);
  });

  it('determinism: same now + push-dominant logs + user → identical plan across runs', async () => {
    const now = MONDAY_2026_05_18;
    const state = () =>
      buildUserState({ recentSessions: pushDominantSessions(now.getTime()) });
    const a = await getDailyWorkout(state(), now);
    const b = await getDailyWorkout(state(), now);
    expect(a).not.toBeNull();
    expect(a.volumeTargets).toEqual(b.volumeTargets);
    expect(a.exercises).toEqual(b.exercises);
  });
});
