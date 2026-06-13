/**
 * #R6a-T2 split-day (UPPER/LOWER) triceps guarantee (triceps-orphan eval ceiling
 * 2026-06-13). On a pure UPPER/LOWER 4-day split (upper/lower/upper/lower) there is
 * NO separate Push day, so the deliberate #2 upper-day triceps de-dup — justified by
 * "triceps is already hit by the day's presses + the Push day" — ORPHANS direct
 * triceps to 0 sets/week (the eval flagged 48 such configs). The full-body triceps
 * guarantee (#R6a-T) only fires on `cluster === 'full'`, and the biceps guarantee
 * (#R6a) has no triceps mirror — so on U/L weeks triceps falls through every net.
 *
 * dp_triceps_split_guarantee_v1 (default ON) closes the gap: ctx.tricepsSplitGuarantee
 * is true ONLY on an `upper` day of a week with NO push day. When true, the #2 de-dup
 * STILL RUNS (it frees the redundant-arm slot for a weak/emphasized group) and a direct-
 * triceps lift is then restored ORPHAN-SAFELY + SURFACE-SAFELY: swap an over-slotted,
 * non-surfaced isolation (never claw back a weak/focus group's slot), add if room, else
 * accept the gap. When false (flag OFF, or a push-day week, or a non-upper day) the
 * de-dup runs unchanged and the guarantee never fires → byte-identical legacy behaviour.
 */

import { describe, it, expect } from 'vitest';
import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../../../tests/engine/full-path-sim/fp-config.js';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { DEV_FLAGS_KEY } from '../../util/featureFlags.js';

// Pure-buildSession harness (mirrors the #R6a-T fullbody-triceps test ctx). The
// biceps guarantee is ON in the baseline (the de-dup's `hasBiceps` precondition),
// matching the real upper-day environment.
const allEquip = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];
const VOLUME = {
  chest: 12, back: 14, shoulders: 12, biceps: 10, triceps: 4,
  quads: 10, hamstrings: 8, glutes: 6, calves: 6, abs: 4, forearms: 2,
};
const SESSIONS_PER_GROUP = {
  piept: 1, spate: 1, umeri: 1, biceps: 1, triceps: 1,
  'picioare-quads': 1, 'picioare-hamstrings': 1, fese: 1, gambe: 1, core: 1, antebrate: 1,
};
const ctx = (over = {}) => ({
  equipment: { available: allEquip },
  weakGroups: [],
  profileTier: 'T2',
  prNames: [],
  seed: 'user-1|2026-06-13|0',
  volumeTargets: VOLUME,
  weeklySessionsPerGroup: SESSIONS_PER_GROUP,
  ...over,
});

const directTriceps = (session) =>
  (session?.exercises || []).filter(
    (e) => getExerciseMetadata(e.name)?.muscle_target_primary === 'triceps',
  ).length;
const exCount = (session) => (session?.exercises || []).length;

function baselineFlags() {
  resetWorld();
  setPathAFlags(false);
  const o = {};
  for (const f of FLIPPED_FLAGS) o[f] = false; // everything OFF baseline
  o.dp_biceps_guarantee_v1 = true; // the de-dup runs in its real (biceps-guarded) env
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

describe('R6a-T2 — split-day triceps guarantee (pure buildSession)', () => {
  it('upper day + ctx.tricepsSplitGuarantee:true + triceps target → session has >=1 direct triceps', () => {
    baselineFlags();
    const on = buildSession('upper', ctx({ tricepsSplitGuarantee: true }));
    expect(directTriceps(on)).toBeGreaterThanOrEqual(1);
  });

  it('flag-derived ctx false (legacy) → the #2 de-dup still removes triceps (0 on upper)', () => {
    baselineFlags();
    const off = buildSession('upper', ctx({ tricepsSplitGuarantee: false }));
    expect(directTriceps(off)).toBe(0);
  });

  it('ON ⊇ OFF on the upper day → the guarantee only ADDS direct triceps, never removes it', () => {
    baselineFlags();
    const off = buildSession('upper', ctx({ tricepsSplitGuarantee: false }));
    const on = buildSession('upper', ctx({ tricepsSplitGuarantee: true }));
    expect(directTriceps(on)).toBeGreaterThanOrEqual(directTriceps(off));
    expect(directTriceps(on)).toBeGreaterThanOrEqual(1);
  });

  it('ON is length-stable or +1 only (safe swap / add — never a runaway add)', () => {
    baselineFlags();
    const off = buildSession('upper', ctx({ tricepsSplitGuarantee: false }));
    const on = buildSession('upper', ctx({ tricepsSplitGuarantee: true }));
    // The de-dup runs in both; the guarantee restores triceps via a swap (+0) or, if
    // no over-slotted non-surfaced victim exists, an add (+1). Never more than +1.
    expect(exCount(on) - exCount(off)).toBeGreaterThanOrEqual(0);
    expect(exCount(on) - exCount(off)).toBeLessThanOrEqual(1);
  });

  it('default-false ctx (no field) behaves as legacy → byte-identical to explicit false', () => {
    baselineFlags();
    const a = buildSession('upper', ctx());
    baselineFlags();
    const b = buildSession('upper', ctx({ tricepsSplitGuarantee: false }));
    expect(a).toEqual(b);
  });
});
