/**
 * #72 dp_emphasis_specialization_v1 per-exercise sets-boost — an EMPHASIZED group
 * with weekly headroom below MAV raises its anchor compound's set floor (4 vs 3) +
 * ceiling (6 vs 5) so the focus lift VISIBLY carries more sets than balanced (DIAG
 * 2026-06-08 #2); a group already at/above MAV is left alone (no band over-shoot —
 * the policy §3 coupling). Default OFF → byte-identical to today.
 */

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

const ALL = ['barbell', 'dumbbell', 'machine', 'cable', 'band', 'bodyweight', 'smith', 'ez-bar', 'trap-bar'];
const groupOf = (n) => getExerciseMetadata(n).muscle_target_primary;
const sig = (s) => s.exercises.map((e) => `${e.name}:${e.sets}`).join('|');

describe('#72 emphasis raises per-exercise sets (dp_emphasis_specialization_v1)', () => {
  // PULL, back EMPHASIZED, weekly back 14 < MAV 18 → headroom → the anchor compound
  // floors higher (visible +sets). biceps tiny keeps the session small.
  const emphCtx = (over = {}) => ({
    equipment: { available: ALL }, profileTier: 'T1', seed: 'emph|2026-W02|7',
    volumeTargets: { back: 14, biceps: 4 },
    weeklySessionsPerGroup: { spate: 1, biceps: 1 },
    emphasizedGroups: ['spate'],
    ...over,
  });

  it('OFF → byte-identical; ON → the emphasized anchor compound carries MORE sets', () => {
    const off = buildSession('pull', emphCtx());
    const on = buildSession('pull', emphCtx({ emphasisSetsBoost: true }));
    // same selection; the FIRST back compound (anchor) gains sets ON.
    expect(on.exercises.map((e) => e.name)).toEqual(off.exercises.map((e) => e.name));
    const backOff = off.exercises.filter((e) => groupOf(e.name) === 'spate');
    const backOn = on.exercises.filter((e) => groupOf(e.name) === 'spate');
    const anchorOff = backOff[0];
    const anchorOn = backOn.find((e) => e.name === anchorOff.name);
    expect(anchorOn.sets).toBeGreaterThan(anchorOff.sets); // visible +sets on the focus anchor
    expect(anchorOn.sets).toBeLessThanOrEqual(6);          // bounded by the emphasized ceiling
  });

  it('a group already AT/ABOVE its MAV is NOT lifted (no band over-shoot, policy §3)', () => {
    // back weekly 20 >= MAV 18 → no headroom → the emphasis floor lift must NOT fire,
    // so an already-saturated group keeps the normal band (byte-identical sets).
    const ctx = (over = {}) => ({
      equipment: { available: ALL }, profileTier: 'T1', seed: 'emph|2026-W02|7',
      volumeTargets: { back: 20, biceps: 4 },
      weeklySessionsPerGroup: { spate: 1, biceps: 1 },
      emphasizedGroups: ['spate'],
      ...over,
    });
    const off = buildSession('pull', ctx());
    const on = buildSession('pull', ctx({ emphasisSetsBoost: true }));
    expect(sig(on)).toBe(sig(off)); // at/above MAV → emphasis sets-boost is inert
  });
});
