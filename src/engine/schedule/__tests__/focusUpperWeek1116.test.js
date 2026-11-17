// Founder 2026-11-16, focus "Partea de sus" @4d (push/pull/upper/lower), cut: "spate as
// vrea o idee mai mult volum... o sa ramana in urma". Two seams kept back at MEV 10:
//   1. with the emphasis-specialization trade on, chest (the preset's first group) is the
//      spec target and applyFocusBias skipped the emphasize loop for EVERY group, so back
//      + shoulders sat at their raw cut budget (dp_focus_up_beside_spec_v1);
//   2. the upper contract deflated the back cap ×1.5 for 4-7d over-delivery, but at 4 days
//      back lands on two days only (dp_upper_back_cap_4d_v1).
import { describe, it, expect, beforeEach } from 'vitest';
import { applyFocusBias } from '../scheduleAdapter/focus.js';
import { applyFocusVolumeContracts } from '../scheduleAdapter/focusVolumeContracts.js';
import { getDailyWorkout } from '../scheduleAdapter.js';
import { getExerciseMetadata } from '../../exerciseLibrary.js';

// His raw periodization budget on 11-16 (persona + cut scaling, before the focus).
const RAW = { back: 8, shoulders: 7, chest: 5, triceps: 6, biceps: 5, quads: 5, hamstrings: 4, glutes: 4, calves: 5 };

beforeEach(() => { localStorage.clear(); });

describe('applyFocusBias — the spec target skips the up-bias, the other emphasized groups keep it', () => {
  it('upper + chest spec target: back and shoulders lerp toward MRV, chest stays for the amplifier', () => {
    const out = applyFocusBias(RAW, 'upper', true, undefined, 'piept');
    expect(out.chest).toBe(5);
    expect(out.back).toBeCloseTo(8 + (25 - 8) * 0.5);
    expect(out.shoulders).toBeCloseTo(7 + (26 - 7) * 0.5);
    expect(out.quads).toBe(8); // de-emphasized → MEV, unchanged
  });

  it('no spec target passed → the whole emphasize loop is skipped (legacy)', () => {
    const out = applyFocusBias(RAW, 'upper', true);
    expect(out.back).toBe(8);
    expect(out.shoulders).toBe(7);
  });
});

describe('upper contract — back cap without the over-delivery deflate at 4 days', () => {
  const budget = { back: 16.5, shoulders: 16.5, chest: 13.5, triceps: 12, biceps: 9.4 };
  it('4 days: back capped at 1.5 × min(0.6 × shoulders, chest) ≈ 14.85, not deflated to ~9.9', () => {
    expect(applyFocusVolumeContracts(budget, 'upper', 4).back).toBeCloseTo(14.85);
  });
  it('5 days keeps the deflate; flag off restores it at 4 days', () => {
    expect(applyFocusVolumeContracts(budget, 'upper', 5).back).toBeCloseTo(10); // MEV floor
    localStorage.setItem('_devFlags', JSON.stringify({ dp_upper_back_cap_4d_v1: false }));
    expect(applyFocusVolumeContracts(budget, 'upper', 4).back).toBeCloseTo(10);
  });
});

// Lone leg day + rear delts, through the real pipeline (cold-start user, 4d L/Ma/J/V →
// upper week push/pull/legs/upper — dp_split_layout_spacing_v1 puts the legs on Thursday).

const user = (focusPreset, goal = 'hipertrofie') => ({
  user: { age: 36, goal, frequency: '4', focusPreset },
  recentSessions: [],
  weights: {},
  profileTier: 'T2',
  flags: {},
  meta: { weeksElapsed: 0 },
});
const setsOf = (plan, group) => (plan.exercises || [])
  .filter((e) => getExerciseMetadata(e.name).muscle_target_primary === group)
  .reduce((n, e) => n + e.sets, 0);
const REAR = /rear delt|reverse pec deck|face pull|pull-apart/i;

describe('upper week — the lone leg day carries the weekly MEV (dp_lone_day_mev_v1)', () => {
  const LEGS = new Date(2026, 4, 21);
  it('quads + hamstrings on the single leg day rise to their MEV band; off = the old half', async () => {
    // A cut user like him: the de-emphasized legs sit at their MEV weekly budget.
    const on = await getDailyWorkout(user('upper', 'slabire'), LEGS);
    expect(on.sessionType).toBe('LOWER');
    localStorage.setItem('_devFlags', JSON.stringify({ dp_lone_day_mev_v1: false }));
    const off = await getDailyWorkout(user('upper', 'slabire'), LEGS);
    expect(setsOf(on, 'picioare-quads')).toBeGreaterThan(setsOf(off, 'picioare-quads'));
    expect(setsOf(on, 'picioare-quads')).toBeGreaterThanOrEqual(6);
    expect(setsOf(on, 'picioare-hamstrings')).toBeGreaterThanOrEqual(setsOf(off, 'picioare-hamstrings'));
  });
});

describe('upper week — the rear-delt isolation rides the pull day (dp_rear_delt_pull_day_v1)', () => {
  it('Monday push has none, Tuesday pull has one', async () => {
    const mon = await getDailyWorkout(user('upper'), new Date(2026, 4, 18));
    const tue = await getDailyWorkout(user('upper'), new Date(2026, 4, 19));
    expect(mon.sessionType).toBe('PUSH');
    expect(tue.sessionType).toBe('PULL');
    expect(mon.exercises.some((e) => REAR.test(e.name))).toBe(false);
    expect(tue.exercises.filter((e) => REAR.test(e.name))).toHaveLength(1);
  });
});

// Founder 2026-11-16: his friend's L5-S1 rules out every hinge (refused squat / deadlift /
// hip-thrust), so one Leg Curl is his whole hamstring day — "de ce nu marim volumul pe leg
// curl simplu?". dp_lone_mev_four_sets_v1.
describe('a lone isolation whose day budget is over 3 sets may carry 4', () => {
  const LEGS = new Date(2026, 4, 21);
  const noHinge = () => ({
    // On a cut the de-emphasized legs sit at MEV → the lone leg day asks hamstrings 6 sets.
    ...user('v-taper', 'slabire'),
    user: { ...user('v-taper', 'slabire').user, refusedPatterns: ['squat', 'deadlift', 'hip-thrust'] },
  });
  const curlSets = (plan) => (plan.exercises || [])
    .filter((e) => getExerciseMetadata(e.name).muscle_target_primary === 'picioare-hamstrings')
    .map((e) => e.sets);
  it('no-hinge leg day: the single hamstring exercise goes past the 3-set isolation band', async () => {
    // His lumbar exclusions (Reverse Hyper / Glute-Ham Raise / Hyperextension) → one curl left.
    localStorage.setItem('wv2-equipment-missing-exercises', JSON.stringify(['Reverse Hyper', 'Glute-Ham Raise', 'Hyperextension Bodyweight']));
    const on = await getDailyWorkout(noHinge(), LEGS);
    localStorage.setItem('_devFlags', JSON.stringify({ dp_lone_mev_four_sets_v1: false }));
    const off = await getDailyWorkout(noHinge(), LEGS);
    expect(curlSets(off)).toHaveLength(1);
    expect(curlSets(off)[0]).toBeLessThanOrEqual(3);
    expect(curlSets(on)).toEqual([4]);
  });
});
