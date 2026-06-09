/**
 * dp_tier_compound_floor_v1 — TIER-AWARE FRESH COMPOUND SET FLOOR.
 *
 * Today a FRESH (recovered) compound floors at COMPOUND_MIN_SETS (3) universally.
 * When the flag is on (ctx.tierCompoundFloor true) a T0 NOVICE's fresh compound may
 * floor at 2 (MEV, manageable beginner recovery), while a TRAINED lifter (T1/T2)
 * keeps 3 (compounds never stranded at 2 when the muscle is fresh). Default OFF / a
 * trained tier → byte-identical (the universal 3-set fresh floor).
 */

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

const ALL = ['barbell', 'dumbbell', 'machine', 'cable', 'band', 'bodyweight', 'smith', 'ez-bar', 'trap-bar'];
const groupOf = (n) => getExerciseMetadata(n).muscle_target_primary;

// A LOW weekly leg budget over a 2x/week frequency → a small per-session share so
// the COMPOUND FLOOR (not the share) decides the compound's set count.
const legCtx = (over = {}) => ({
  equipment: { available: ALL },
  seed: 'tcf|2026-W02|0',
  volumeTargets: { quads: 6, hamstrings: 6, glutes: 6, calves: 4 },
  weeklySessionsPerGroup: { 'picioare-quads': 2, 'picioare-hamstrings': 2, fese: 2, gambe: 2 },
  ...over,
});

// Lowest compound (tier-1) set count in the session — what the floor governs.
function minCompoundSets(session) {
  const comps = session.exercises.filter((e) => getExerciseMetadata(e.name).tier === 1);
  return comps.length ? Math.min(...comps.map((e) => e.sets)) : null;
}

describe('dp_tier_compound_floor_v1 — fresh compound floor by tier', () => {
  it('flag OFF → fresh compound floors at 3 for a T0 novice (byte-identical)', () => {
    const off = buildSession('legs', legCtx({ profileTier: 'T0' }));
    expect(minCompoundSets(off)).toBeGreaterThanOrEqual(3);
  });

  it('flag ON + T0 novice → fresh compound floor drops to 2 (MEV) vs OFF 3', () => {
    const off = buildSession('legs', legCtx({ profileTier: 'T0' }));
    const on = buildSession('legs', legCtx({ profileTier: 'T0', tierCompoundFloor: true }));
    const offMin = minCompoundSets(off);
    const onMin = minCompoundSets(on);
    expect(offMin).toBe(3);    // the universal fresh floor (low budget → floored)
    expect(onMin).toBe(2);     // the novice floor opens 2 (MEV) for the same budget
  });

  it('flag ON + TRAINED (T1/T2) → fresh compound stays floored at 3 (never stranded at 2)', () => {
    const t1 = buildSession('legs', legCtx({ profileTier: 'T1', tierCompoundFloor: true }));
    const t2 = buildSession('legs', legCtx({ profileTier: 'T2', tierCompoundFloor: true }));
    expect(minCompoundSets(t1)).toBeGreaterThanOrEqual(3);
    expect(minCompoundSets(t2)).toBeGreaterThanOrEqual(3);
  });

  it('a T0 novice ON vs OFF selects the SAME exercises (only set counts move)', () => {
    const off = buildSession('legs', legCtx({ profileTier: 'T0' }));
    const on = buildSession('legs', legCtx({ profileTier: 'T0', tierCompoundFloor: true }));
    expect(on.exercises.map((e) => e.name)).toEqual(off.exercises.map((e) => e.name));
  });
});
