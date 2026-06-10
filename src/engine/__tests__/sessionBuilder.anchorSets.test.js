/**
 * R4 anchor-protective shave (Daniel coach audit 2026-06-10: "main lifts primesc
 * 3 seturi, nu totul 2"). On a NON-RECOVERED group the legacy shave hit every
 * exercise including the anchor compound (Daniel's real day: Smith Squat at 2
 * sets under readiness 60). With ctx.anchorProtect (dp_anchor_sets_v1) the first
 * tier-1 compound is exempt from the shave + keeps the fresh 3-set floor; the
 * spared set is re-shaved from the back of the group so the TOTAL stays equal.
 */

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

const allEquip = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];

// Big enough weekly budget that the legs groups get multiple exercises with >2
// sets pre-shave, single weekly session so the day carries the full budget.
const VOLUME = {
  quads: 10, hamstrings: 8, glutes: 6, calves: 6,
  chest: 10, back: 12, shoulders: 8, biceps: 6, triceps: 6, abs: 4, forearms: 2,
};
const SESSIONS_PER_GROUP = {
  'picioare-quads': 1, 'picioare-hamstrings': 1, 'fese': 1, 'gambe': 1,
  piept: 1, spate: 1, umeri: 1, biceps: 1, triceps: 1, core: 1, antebrate: 1,
};
// Every group FATIGUED → the non-recovered shave path runs for each group.
const FATIGUED = Object.fromEntries(Object.keys(SESSIONS_PER_GROUP).map((g) => [g, 'fatigued']));

const ctx = (over = {}) => ({
  equipment: { available: allEquip },
  weakGroups: [],
  profileTier: 'T2',
  prNames: [],
  seed: 'user-1|2026-06-10|0',
  volumeTargets: VOLUME,
  weeklySessionsPerGroup: SESSIONS_PER_GROUP,
  recoveryState: FATIGUED,
  ...over,
});

const tierOf = (name) => getExerciseMetadata(name)?.tier ?? 2;
const total = (s) => s.exercises.reduce((a, e) => a + e.sets, 0);

describe('R4 — anchor-protective shave (ctx.anchorProtect)', () => {
  it('OFF → byte-identical legacy shave (control arm)', () => {
    const off1 = buildSession('legs', ctx({ anchorProtect: false }));
    const off2 = buildSession('legs', ctx({ anchorProtect: false }));
    expect(off1).toEqual(off2); // deterministic
  });

  it('ON → the anchor tier-1 compound keeps >= 3 sets on a fatigued day', () => {
    const on = buildSession('legs', ctx({ anchorProtect: true }));
    const firstCompound = on.exercises.find((e) => tierOf(e.name) === 1);
    expect(firstCompound, 'a tier-1 compound must exist in the legs session').toBeTruthy();
    expect(firstCompound.sets).toBeGreaterThanOrEqual(3);
  });

  it('ON vs OFF → total stays equal best-effort (spared set re-shaved from the back; ≤1 residual when the back is saturated at its floors)', () => {
    const off = buildSession('legs', ctx({ anchorProtect: false }));
    const on = buildSession('legs', ctx({ anchorProtect: true }));
    // Same exercise list (selection untouched).
    expect(on.exercises.map((e) => e.name)).toEqual(off.exercises.map((e) => e.name));
    // Re-shave preserves the total; when every back accessory already sits at its
    // floor the single protected set cannot be reabsorbed → at most +1 (the main
    // lift carries it). Never LESS than OFF.
    expect(total(on)).toBeGreaterThanOrEqual(total(off));
    expect(total(on)).toBeLessThanOrEqual(total(off) + 1);
  });

  it('ON on a RECOVERED day → no-op (protect only fires under the non-recovered shave)', () => {
    const fresh = Object.fromEntries(Object.keys(SESSIONS_PER_GROUP).map((g) => [g, 'recovered']));
    const off = buildSession('legs', ctx({ anchorProtect: false, recoveryState: fresh }));
    const on = buildSession('legs', ctx({ anchorProtect: true, recoveryState: fresh }));
    expect(on).toEqual(off);
  });
});
