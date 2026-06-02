// FOCUS SELECTOR (D-focus 2026-06-02) — the user picks an aesthetic LOOK and
// Andura shapes volume + split around it.
//
// ADR 025 "override optional": Andura decides by default (focusPreset='balanced'
// → byte-identical to pre-feature). A preset biases the weekly volume budget
// (emphasized→MRV, de-emphasized→MEV maintenance floor) AND reshapes the split
// (a de-emphasized lower body frees a leg day for the focus region).
//
// Hard invariants under test:
//   - balanced → IDENTICAL to pre-feature (deep equal; the whole feature opt-in).
//   - v-taper → umeri/spate weekly volume UP, legs DOWN toward MEV (NEVER below),
//     one fewer leg day in the split (the freed day → push/pull).
//   - arms/chest/lower → their emphasized groups up; rest neutral.
//   - de-emphasized legs are NOT re-amplified by weakness (M2) / imbalance (M3).
//   - recovery (M1) still cuts a fried focused muscle; the time cap still applies.
//   - determinism: same now + state + preset → identical plan.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDailyWorkout,
  frequencyToSplit,
  FOCUS_PRESETS,
  FOCUS_PRESET_IDS,
} from '../scheduleAdapter.js';
import { ISRAETEL_BASELINES, BIG11_RO_TO_EN_MAP } from '../../periodization/constants.js';

const DAY_MS = 24 * 60 * 60 * 1000;
// Marius @ 4 days/week (frequency '4' → upper/lower/upper/lower template). Monday
// is the FIRST cluster of the 4-day week. High persona keeps budgets off the
// clamp so a bias is observable.
const MONDAY_2026_05_18 = new Date(2026, 4, 18); // dayIdx 0 (L)

function buildUserState(overrides = {}) {
  const { user, ...rest } = overrides;
  return {
    user: { age: 30, goal: 'hipertrofie', persona: 'marius', frequency: '4', ...(user || {}) },
    recentSessions: [],
    weights: {},
    profileTier: 'T2',
    flags: {},
    meta: { weeksElapsed: 0 },
    ...rest,
  };
}

// Weekly budget entry (sets/week) for a Big-11 RO group from a plan's volumeTargets
// (EN-keyed). Returns the number or undefined.
function weeklyVol(plan, roGroup) {
  const enKey = BIG11_RO_TO_EN_MAP[roGroup];
  return plan.volumeTargets ? plan.volumeTargets[enKey] : undefined;
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ── Preset data map ───────────────────────────────────────────────────────
describe('FOCUS_PRESETS — goal/look → per-group emphasis map', () => {
  it('exposes the five presets, balanced = empty no-op', () => {
    expect(FOCUS_PRESET_IDS).toEqual(['balanced', 'v-taper', 'arms', 'chest', 'lower']);
    expect(FOCUS_PRESETS.balanced).toEqual({ emphasize: [], deEmphasize: [] });
  });

  it('v-taper emphasizes width (umeri+spate), de-emphasizes lower body', () => {
    expect(FOCUS_PRESETS['v-taper'].emphasize).toEqual(['umeri', 'spate']);
    expect(FOCUS_PRESETS['v-taper'].deEmphasize).toEqual([
      'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe',
    ]);
  });

  it('arms/chest/lower emphasize, none de-emphasize', () => {
    expect(FOCUS_PRESETS.arms.deEmphasize).toEqual([]);
    expect(FOCUS_PRESETS.chest.emphasize).toContain('piept');
    expect(FOCUS_PRESETS.lower.emphasize).toContain('fese');
  });

  it('every preset map is frozen (immutable)', () => {
    for (const id of FOCUS_PRESET_IDS) expect(Object.isFrozen(FOCUS_PRESETS[id])).toBe(true);
  });
});

// ── Focus-aware split reshaping ─────────────────────────────────────────────
describe('frequencyToSplit — focus-aware split reshaping', () => {
  it('balanced → templates UNCHANGED (byte-identical to no-arg)', () => {
    for (let n = 1; n <= 7; n++) {
      expect(frequencyToSplit(n, 'balanced')).toEqual(frequencyToSplit(n));
    }
  });

  it('v-taper @ 4 days: Upper/Lower/Upper/Lower → Push/Pull/Upper/Lower (spaced, one leg day)', () => {
    const balanced = frequencyToSplit(4, 'balanced');
    expect(balanced).toEqual(['upper', 'lower', 'upper', 'lower']);
    const vtaper = frequencyToSplit(4, 'v-taper');
    // Recovery-SPACED template: the push muscles (chest/shoulders/triceps) must
    // NOT land on consecutive training days. push(Mon)→pull(Tue)→upper(Thu, 72h
    // after push)→lower(Fri). The old slot-swap gave ['upper','push',...] = UPPER
    // then PUSH back-to-back → fried second session (the 27-min thin-session bug).
    expect(vtaper).toEqual(['push', 'pull', 'upper', 'lower']);
    const legDays = vtaper.filter((c) => c === 'lower' || c === 'legs').length;
    expect(legDays).toBe(1);
    expect(legDays).toBeLessThan(balanced.filter((c) => c === 'lower' || c === 'legs').length);
    // No two ADJACENT days both train the push muscles (push + upper overlap on
    // chest/shoulders/triceps; consecutive = fried). Guards against regression.
    const HITS_PUSH = new Set(['push', 'upper', 'full']);
    for (let i = 1; i < vtaper.length; i++) {
      expect(HITS_PUSH.has(vtaper[i]) && HITS_PUSH.has(vtaper[i - 1])).toBe(false);
    }
  });

  it('v-taper @ 5 days reshapes a lower slot, always retains ≥1 leg day', () => {
    const vtaper = frequencyToSplit(5, 'v-taper');
    const legDays = vtaper.filter((c) => c === 'lower' || c === 'legs').length;
    expect(legDays).toBeGreaterThanOrEqual(1);
    const balancedLegDays = frequencyToSplit(5).filter((c) => c === 'lower' || c === 'legs').length;
    expect(legDays).toBeLessThan(balancedLegDays);
  });

  it('emphasis-only presets (arms/chest/lower) leave the split UNCHANGED', () => {
    for (const id of ['arms', 'chest', 'lower']) {
      for (let n = 1; n <= 7; n++) {
        expect(frequencyToSplit(n, id)).toEqual(frequencyToSplit(n));
      }
    }
  });

  it('unknown preset → balanced template (graceful)', () => {
    expect(frequencyToSplit(4, 'nonsense')).toEqual(frequencyToSplit(4));
  });
});

// ── balanced = byte-identical to pre-feature ────────────────────────────────
describe('balanced focus = zero behavior change (opt-in)', () => {
  it("plan with focusPreset 'balanced' deep-equals plan with NO focusPreset", async () => {
    const noFocus = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const balanced = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'balanced' } }),
      MONDAY_2026_05_18,
    );
    expect(balanced).toEqual(noFocus);
  });

  it('unknown/garbage focusPreset → treated as balanced (deep equal)', async () => {
    const noFocus = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const garbage = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'not-a-preset' } }),
      MONDAY_2026_05_18,
    );
    expect(garbage).toEqual(noFocus);
  });
});

// ── v-taper volume bias ─────────────────────────────────────────────────────
describe('v-taper — emphasized width UP, de-emphasized legs toward MEV', () => {
  it('umeri + spate weekly volume UP vs balanced', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const vtaper = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' } }),
      MONDAY_2026_05_18,
    );
    expect(weeklyVol(vtaper, 'umeri')).toBeGreaterThan(weeklyVol(balanced, 'umeri'));
    expect(weeklyVol(vtaper, 'spate')).toBeGreaterThan(weeklyVol(balanced, 'spate'));
    // Emphasized never exceeds MRV.
    expect(weeklyVol(vtaper, 'umeri')).toBeLessThanOrEqual(ISRAETEL_BASELINES.shoulders.MRV);
    expect(weeklyVol(vtaper, 'spate')).toBeLessThanOrEqual(ISRAETEL_BASELINES.back.MRV);
  });

  it('legs (quads/hams/glutes/calves) DOWN toward MEV, NEVER below MEV', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const vtaper = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' } }),
      MONDAY_2026_05_18,
    );
    const legGroups = [
      ['picioare-quads', 'quads'],
      ['picioare-hamstrings', 'hamstrings'],
      ['fese', 'glutes'],
      ['gambe', 'calves'],
    ];
    for (const [ro, en] of legGroups) {
      const before = weeklyVol(balanced, ro);
      const after = weeklyVol(vtaper, ro);
      expect(after).toBeLessThan(before); // relaxed toward maintenance
      expect(after).toBeGreaterThanOrEqual(ISRAETEL_BASELINES[en].MEV); // floor, never abandoned
    }
  });

  it('piept/core/biceps/triceps stay NEUTRAL (unchanged vs balanced)', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const vtaper = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' } }),
      MONDAY_2026_05_18,
    );
    for (const ro of ['piept', 'biceps', 'triceps', 'core']) {
      expect(weeklyVol(vtaper, ro)).toBeCloseTo(weeklyVol(balanced, ro), 6);
    }
  });
});

// ── arms / chest / lower analogous ──────────────────────────────────────────
describe('arms / chest / lower — emphasized groups up, rest neutral', () => {
  it('arms → biceps + triceps UP', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const arms = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'arms' } }),
      MONDAY_2026_05_18,
    );
    expect(weeklyVol(arms, 'biceps')).toBeGreaterThan(weeklyVol(balanced, 'biceps'));
    expect(weeklyVol(arms, 'triceps')).toBeGreaterThan(weeklyVol(balanced, 'triceps'));
  });

  it('chest → piept UP, legs unchanged (no de-emphasis)', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const chest = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'chest' } }),
      MONDAY_2026_05_18,
    );
    expect(weeklyVol(chest, 'piept')).toBeGreaterThan(weeklyVol(balanced, 'piept'));
    expect(weeklyVol(chest, 'picioare-quads')).toBeCloseTo(weeklyVol(balanced, 'picioare-quads'), 6);
  });

  it('lower → fese + quads + hams UP', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const lower = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'lower' } }),
      MONDAY_2026_05_18,
    );
    expect(weeklyVol(lower, 'fese')).toBeGreaterThan(weeklyVol(balanced, 'fese'));
    expect(weeklyVol(lower, 'picioare-quads')).toBeGreaterThan(weeklyVol(balanced, 'picioare-quads'));
  });
});

// ── Focus BEATS auto-balance (M2/M3 suppression on de-emphasized) ───────────
describe('focus suppresses auto-signals on de-emphasized groups', () => {
  // Sessions in the past that make QUADS lagging (heavy hams/glutes, tiny quads)
  // and quad/ham + push/pull data — placed `daysAgo` so recovery has cleared but
  // still inside the 14-day lagging/imbalance lookback.
  function laggingLegSessions(now, daysAgo = 6) {
    const ts = now - daysAgo * DAY_MS;
    const set = (kg) => ({ kg, reps: 8, timestamp: ts });
    return [
      {
        ts,
        exercises: [
          // quads: tiny (1 set) → lagging vs peers
          { exerciseName: 'Leg Extension', sets: [set(40)] },
          // hamstrings + glutes: heavy → quad/ham imbalance toward quads? no —
          // these make hams DOMINANT, so the imbalance would push quads up.
          { exerciseName: 'Romanian Deadlift', sets: [set(60), set(60), set(60), set(60)] },
          { exerciseName: 'Hip Thrust', sets: [set(80), set(80), set(80), set(80)] },
        ],
      },
    ];
  }

  it('v-taper: a lagging de-emphasized leg group is NOT amplified above its balanced budget', async () => {
    const logs = laggingLegSessions(MONDAY_2026_05_18.getTime());
    // Without focus: weakness/imbalance may raise the leg group.
    const balanced = await getDailyWorkout(
      buildUserState({ recentSessions: logs }),
      MONDAY_2026_05_18,
    );
    const vtaper = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' }, recentSessions: logs }),
      MONDAY_2026_05_18,
    );
    // The de-emphasized quad budget under v-taper must be at or below its balanced
    // counterpart — the auto-signals did NOT re-inflate the minimized region.
    for (const ro of ['picioare-quads', 'picioare-hamstrings']) {
      expect(weeklyVol(vtaper, ro)).toBeLessThanOrEqual(weeklyVol(balanced, ro) + 1e-6);
      // Still floored at MEV (maintained, not abandoned).
      const en = BIG11_RO_TO_EN_MAP[ro];
      expect(weeklyVol(vtaper, ro)).toBeGreaterThanOrEqual(ISRAETEL_BASELINES[en].MEV);
    }
  });
});

// ── Recovery + time guards still apply ──────────────────────────────────────
describe('recovery (M1) + time cap remain guards under focus', () => {
  // A heavy shoulder session TODAY fries umeri (the v-taper EMPHASIZED group).
  function friedShouldersToday(now) {
    return [
      {
        ts: now,
        exercises: [
          {
            exerciseName: 'DB Shoulder Press',
            sets: [
              { kg: 30, reps: 8, timestamp: now },
              { kg: 30, reps: 8, timestamp: now },
              { kg: 30, reps: 8, timestamp: now },
              { kg: 30, reps: 8, timestamp: now },
            ],
          },
        ],
      },
    ];
  }

  it('a fried EMPHASIZED muscle is still cut by recovery today (focus shapes intent, not safety)', async () => {
    const fried = friedShouldersToday(MONDAY_2026_05_18.getTime());
    // v-taper emphasizes umeri → high weekly budget; but fried today → M1 cuts it.
    const noRecovery = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' } }),
      MONDAY_2026_05_18,
    );
    const withRecovery = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' }, recentSessions: fried }),
      MONDAY_2026_05_18,
    );
    // The fresh-day emphasized umeri budget is cut once umeri is fried today.
    expect(weeklyVol(withRecovery, 'umeri')).toBeLessThan(weeklyVol(noRecovery, 'umeri'));
  });

  it('estimatedDurationMin (time cap surface) is present + finite under a preset', async () => {
    const plan = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' } }),
      MONDAY_2026_05_18,
    );
    expect(Number.isFinite(plan.estimatedDurationMin)).toBe(true);
  });
});

// ── Determinism ─────────────────────────────────────────────────────────────
describe('focus determinism', () => {
  it('same now + state + preset → identical plan across runs', async () => {
    const state = () => buildUserState({ user: { focusPreset: 'v-taper' } });
    const a = await getDailyWorkout(state(), MONDAY_2026_05_18);
    const b = await getDailyWorkout(state(), MONDAY_2026_05_18);
    expect(a).toEqual(b);
  });
});
