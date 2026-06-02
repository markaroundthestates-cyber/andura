// AEROBIC wired INTO the daily recovery->plan loop.
//
// Validates that recent aerobic CLASSES (aerobicStore: {date,type,minutes,kcal,ts})
// fold into the SAME recovery redistribution resistance sessions drive: a hard
// spin class (legs) eases tomorrow's leg budget (recovered -> partial -> x0.80),
// "the plan accounts for everything" (moat / ADR 025).
//
// Hard invariants under test:
//   - Aerobic-only easing lands: heavy recent spinning cuts the quad budget vs
//     the same profile with no aerobic (guards a silent no-op / key-mismatch).
//   - Graceful: no aerobic -> plan IDENTICAL to the resistance-only output.
//   - Aerobic NEVER deepens: a group already fatigued from weights keeps its
//     resistance result (aerobic can only raise recovered->partial).
//   - Determinism: same now + sessions -> identical plan across runs.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDailyWorkout } from '../scheduleAdapter.js';

// Wednesday 2026-05-20 -> a LEG/lower cluster on the default split, so a quad
// recovery cut is observable in the leg budget. (We assert on volumeTargets keys
// directly, which are always present regardless of the day's selection.)
const WED_2026_05_20 = new Date(2026, 4, 20);

function buildUserState(overrides = {}) {
  return {
    user: { age: 30, goal: 'hipertrofie', persona: 'marius' },
    recentSessions: [],
    aerobicSessions: [],
    weights: {},
    profileTier: 'T2',
    flags: {},
    meta: { weeksElapsed: 0 },
    ...overrides,
  };
}

// A spinning class logged at `now` (no decay). spinning gradient: quads 1.0,
// fese 0.85, hamstrings 0.8 -> all clear AEROBIC_EASE_THRESHOLD -> 'partial'
// (Easing). The aerobicStore shape carries type + ts (mergeAerobicRecovery reads
// either ts or date).
function spinningSession(now) {
  return { date: '2026-05-20', type: 'spinning', minutes: 50, kcal: 350, ts: now };
}

// A resistance session that stresses QUADS today (heavy Leg Extension, primary
// head 'quad' -> picioare-quads). With no decay the quad group reads at least
// 'partial' from weights, so the added aerobic class (also cap 'partial') CANNOT
// lower it further — aerobic only raises a RECOVERED group, never deepens.
function quadStressedSession(now) {
  return {
    ts: now,
    exercises: [
      {
        exerciseName: 'Leg Extension',
        sets: [
          { kg: 100, reps: 12, timestamp: now },
          { kg: 100, reps: 12, timestamp: now },
          { kg: 100, reps: 12, timestamp: now },
          { kg: 100, reps: 12, timestamp: now },
        ],
      },
    ],
  };
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('scheduleAdapter — aerobic wired into the recovery->plan loop', () => {
  it('heavy recent spinning eases the quad budget vs no-aerobic baseline (the cut lands)', async () => {
    const now = WED_2026_05_20;
    const baseline = await getDailyWorkout(buildUserState(), now);
    const spun = await getDailyWorkout(
      buildUserState({ aerobicSessions: [spinningSession(now.getTime())] }),
      now,
    );

    expect(baseline).not.toBeNull();
    expect(spun).not.toBeNull();

    // quads is the spinning-dominant group (gradient 1.0). recovered -> partial
    // -> x0.80. The EN budget key for quads must drop vs the no-aerobic run —
    // proof aerobic reaches the same EN<-RO<-merge path the resistance cut uses.
    expect(spun.volumeTargets.quads).toBeLessThan(baseline.volumeTargets.quads);
    // glutes is also spinning-dominant (0.85 >= 0.35) -> eased too.
    expect(spun.volumeTargets.glutes).toBeLessThan(baseline.volumeTargets.glutes);
    // chest is NOT a spinning group (0.15 < 0.35) -> untouched (no collateral).
    expect(spun.volumeTargets.chest).toBe(baseline.volumeTargets.chest);
  });

  it('no aerobic -> plan IDENTICAL to the resistance-only output (graceful, ADR 025)', async () => {
    const now = WED_2026_05_20;
    const withEmpty = await getDailyWorkout(buildUserState({ aerobicSessions: [] }), now);
    const withUndef = await getDailyWorkout(buildUserState({ aerobicSessions: undefined }), now);
    expect(withEmpty).not.toBeNull();
    expect(withUndef).not.toBeNull();
    expect(withEmpty.volumeTargets).toEqual(withUndef.volumeTargets);
    expect(withEmpty.exercises).toEqual(withUndef.exercises);
  });

  it('aerobic does NOT deepen a group already stressed from weights (cap at partial)', async () => {
    const now = WED_2026_05_20;
    // Weights stress quads (>= partial). Adding a spinning class (cap 'partial')
    // must NOT lower quads further — aerobic can only RAISE a recovered group.
    const weightsOnly = await getDailyWorkout(
      buildUserState({ recentSessions: [quadStressedSession(now.getTime())] }),
      now,
    );
    const weightsPlusSpin = await getDailyWorkout(
      buildUserState({
        recentSessions: [quadStressedSession(now.getTime())],
        aerobicSessions: [spinningSession(now.getTime())],
      }),
      now,
    );
    expect(weightsOnly).not.toBeNull();
    expect(weightsPlusSpin).not.toBeNull();
    // Sanity: weights actually moved quads off baseline (the cut is real, not a
    // no-op fixture) — guards the deepen assertion from passing vacuously.
    const fresh = await getDailyWorkout(buildUserState(), now);
    expect(weightsOnly.volumeTargets.quads).toBeLessThan(fresh.volumeTargets.quads);
    // quads budget unchanged by the added aerobic (already at/below partial).
    expect(weightsPlusSpin.volumeTargets.quads).toBe(weightsOnly.volumeTargets.quads);
  });

  it('determinism: same now + sessions -> identical plan across runs', async () => {
    const now = WED_2026_05_20;
    const state = () =>
      buildUserState({ aerobicSessions: [spinningSession(now.getTime())] });
    const a = await getDailyWorkout(state(), now);
    const b = await getDailyWorkout(state(), now);
    expect(a).not.toBeNull();
    expect(a.volumeTargets).toEqual(b.volumeTargets);
    expect(a.exercises).toEqual(b.exercises);
  });
});
