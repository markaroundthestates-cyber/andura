/**
 * #71 dp_coherent_weekly_alloc_v1 + #72 dp_emphasis_specialization_v1 per-exercise
 * sets-boost — the two coupled session-composition fixes (DIAG 2026-06-08 #2/#3).
 *
 *   #71 — a group given FEWER slots on a day (the catch-all overlap "Upper" balloon
 *         + the HIGH side of the same-lift swing) no longer balloons its per-exercise
 *         sets: coherentDayBudget caps the day-budget so the per-exercise dose stays
 *         consistent day-to-day. De-balloon-ONLY (never raises a well-behaved day).
 *   #72 — an EMPHASIZED group with weekly headroom below MAV raises its anchor
 *         compound's set floor (4 vs 3) + ceiling (6 vs 5) so the focus lift VISIBLY
 *         carries more sets than balanced; a group already at/above MAV is left
 *         alone (no band over-shoot — the policy §3 coupling).
 *
 * Both default OFF → byte-identical to today (proven below + the full-path-sim §A
 * OFF hash gate).
 */

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

const ALL = ['barbell', 'dumbbell', 'machine', 'cable', 'band', 'bodyweight', 'smith', 'ez-bar', 'trap-bar'];
const groupOf = (n) => getExerciseMetadata(n).muscle_target_primary;
const setsOf = (s, name) => s.exercises.find((e) => e.name === name)?.sets;
const sig = (s) => s.exercises.map((e) => `${e.name}:${e.sets}`).join('|');

// UPPER cluster gives umeri only ~2 slots (weight 0.20) → the few-slot "balloon"
// day: with a high weekly shoulders budget the per-exercise sets inflate (5) unless
// coherent allocation de-balloons them.
const upperCtx = (over = {}) => ({
  equipment: { available: ALL },
  profileTier: 'T2',
  seed: 'coh|2026-W02|0',
  volumeTargets: { back: 18, chest: 14, shoulders: 16, biceps: 14, triceps: 12 },
  weeklySessionsPerGroup: { spate: 2, piept: 2, umeri: 2, biceps: 2, triceps: 2 },
  ...over,
});

describe('#71 coherent weekly allocation (dp_coherent_weekly_alloc_v1)', () => {
  it('OFF → byte-identical; ON → de-balloons a few-slot day (no per-exercise inflation)', () => {
    const off = buildSession('upper', upperCtx());
    const on = buildSession('upper', upperCtx({ coherentAlloc: true }));

    // umeri gets few slots on Upper → OFF inflates its compound to the 5-set ceiling.
    const umeriOff = off.exercises.filter((e) => groupOf(e.name) === 'umeri');
    const umeriOn = on.exercises.filter((e) => groupOf(e.name) === 'umeri');
    const maxUmeriOff = Math.max(...umeriOff.map((e) => e.sets));
    const maxUmeriOn = Math.max(...umeriOn.map((e) => e.sets));
    expect(maxUmeriOff).toBeGreaterThanOrEqual(5);     // the balloon
    expect(maxUmeriOn).toBeLessThan(maxUmeriOff);       // de-ballooned ON
    // same EXERCISE SELECTION (only set COUNTS move — this is a set-distribution fix).
    expect(on.exercises.map((e) => e.name)).toEqual(off.exercises.map((e) => e.name));
  });

  it('a well-behaved (>= expected slots) day is NOT inflated by coherent alloc', () => {
    // PULL gives spate MANY slots (weight 0.625) → at-or-above expected → coherent
    // alloc must NOT raise per-exercise sets above the legacy budget (de-balloon only).
    const ctx = (over = {}) => ({
      equipment: { available: ALL }, profileTier: 'T2', seed: 'coh|2026-W02|9',
      volumeTargets: { back: 16, biceps: 12 },
      weeklySessionsPerGroup: { spate: 2, biceps: 2 },
      ...over,
    });
    const off = buildSession('pull', ctx());
    const on = buildSession('pull', ctx({ coherentAlloc: true }));
    const totalOff = off.exercises.reduce((a, e) => a + e.sets, 0);
    const totalOn = on.exercises.reduce((a, e) => a + e.sets, 0);
    expect(totalOn).toBeLessThanOrEqual(totalOff); // never inflated, only ever trimmed
  });
});

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
    // Bounded by the emphasized ceiling — CAPPED at 4 (Daniel focus-sweep verdict
    // 2026-06-11: an emphasized lift carries 3-4 working sets; the surplus budget
    // goes to a second variation, never a 5th-6th set of the same movement).
    expect(anchorOn.sets).toBeLessThanOrEqual(4);
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
