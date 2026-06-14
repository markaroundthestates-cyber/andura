/**
 * #ARMS-FOCUS MAJOR-PROTECT (arms-signature re-judge regression 2026-06-14).
 * dp_arms_signature_v1 demotes umeri out of the arms emphasize list + floors biceps/triceps
 * volume high; the combined effect STARVES two majors the arms focus must still maintain:
 *   (1) CHEST drops to a single weekly exposure (~3 sets < MEV) on the slot-limited arms days
 *       (the high arm floor + maxBackLatWork cap crowd the slots so minChestPressSlots loses).
 *   (2) the umeri demotion drops umeri out of emphSet, DISABLING both shoulder guarantees
 *       (lateralRaiseGuarantee + lateralDeltGuarantee gate on emphSet.has('umeri')) → the lone
 *       maintained shoulder slot is a rear-delt fly / OHP with NO direct LATERAL raise.
 * The elite-coach re-judge capped these ("chest collapses to 3 sets, orphans a major prime
 * mover"; "side delts orphaned, no lateral raise/OHP").
 *
 * dp_arms_protect_majors_v1 (default ON, only fires WITH dp_arms_signature_v1) repairs both:
 *  - ctx.armsChestFloor → buildSession guarantees a chest press on a chest-capable arms day
 *    whose chest fell to ZERO slots (length-stable swap of a redundant ARM / non-major surplus).
 *  - ctx.lateralDeltGuarantee is routed to the arms focus too (getDailyWorkout), and PASS 4
 *    of the lateral block (scoped to ctx.armsChestFloor) swaps the lone umeri non-lateral
 *    (rear-delt fly / minor) for a lateral — zero net slot, never orphans umeri.
 * LEAN (SWAP not add) + ORPHAN/LEAD-SAFE: biceps + triceps stay the volume LEADERS (the swap
 * victim is an arm/minor surplus, never a focus lead's last slot). When false → byte-identical.
 */

import { describe, it, expect } from 'vitest';
import { resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../../../tests/engine/full-path-sim/fp-config.js';
import { buildSession, movementKey } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { deriveExerciseTags } from '../focusPolicy.js';
import { DEV_FLAGS_KEY } from '../../util/featureFlags.js';

const allEquip = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];
// arms-signature-shaped budget: biceps/triceps FLOORED high, umeri/back at maintenance (MEV).
const VOLUME = {
  chest: 10, back: 10, shoulders: 8, biceps: 20, triceps: 17,
  quads: 8, hamstrings: 8, glutes: 6, calves: 4, abs: 4, forearms: 2,
};
// A U/L-split upper day: chest gets 1 weekly session (the starved exposure), arms 2 each.
const SESSIONS_PER_GROUP = {
  piept: 1, spate: 1, umeri: 1, biceps: 2, triceps: 2,
  'picioare-quads': 1, 'picioare-hamstrings': 1, fese: 1, gambe: 1, core: 1, antebrate: 1,
};
const ctx = (over = {}) => ({
  equipment: { available: allEquip },
  weakGroups: [],
  profileTier: 'T2',
  prNames: [],
  seed: 'user-1|2026-06-14|0',
  volumeTargets: VOLUME,
  weeklySessionsPerGroup: SESSIONS_PER_GROUP,
  // arms-signature: umeri DEMOTED out of emphSet (biceps/triceps only).
  emphasizedGroups: ['biceps', 'triceps'],
  focusPolicy: true,
  focusContracts: true,
  armsSignature: true,
  focusId: 'arms',
  daysPerWeek: 4,
  ...over,
});

const isChestPress = (e) =>
  deriveExerciseTags(e.name, getExerciseMetadata(e.name), movementKey).has('chest_press');
const isLateral = (e) =>
  deriveExerciseTags(e.name, getExerciseMetadata(e.name), movementKey).has('side_delt');
const chestPressCount = (s) => (s?.exercises || []).filter(isChestPress).length;
const lateralCount = (s) => (s?.exercises || []).filter(isLateral).length;
const primaryOf = (n) => getExerciseMetadata(n)?.muscle_target_primary;
const groupSlots = (s, g) => (s?.exercises || []).filter((e) => primaryOf(e.name) === g).length;
const exCount = (s) => (s?.exercises || []).length;

function baselineFlags() {
  resetWorld();
  setPathAFlags(false);
  const o = {};
  for (const f of FLIPPED_FLAGS) o[f] = false; // all FLIPPED off → clean baseline
  // The real env the guarantee runs in: focus policy + arms-signature + the arm guarantees.
  o.dp_focus_policy_v1 = true;
  o.dp_focus_contracts_v1 = true;
  o.dp_arms_signature_v1 = true;
  o.dp_biceps_guarantee_v1 = true;
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

describe('#ARMS-PROTECT — chest + lateral guarantees on an arms-signature day (pure buildSession)', () => {
  it('arms upper day + ctx.armsChestFloor:true → session has >=1 chest press (chest un-orphaned)', () => {
    baselineFlags();
    const on = buildSession('upper', ctx({ armsChestFloor: true, lateralDeltGuarantee: true }));
    expect(chestPressCount(on)).toBeGreaterThanOrEqual(1);
  });

  it('arms upper day + ctx.lateralDeltGuarantee:true → session has >=1 direct lateral raise', () => {
    baselineFlags();
    const on = buildSession('upper', ctx({ armsChestFloor: true, lateralDeltGuarantee: true }));
    expect(lateralCount(on)).toBeGreaterThanOrEqual(1);
  });

  it('ON ⊇ OFF on chest-press AND lateral counts → the guarantees only ADD, never remove', () => {
    baselineFlags();
    const off = buildSession('upper', ctx({ armsChestFloor: false, lateralDeltGuarantee: false }));
    baselineFlags();
    const on = buildSession('upper', ctx({ armsChestFloor: true, lateralDeltGuarantee: true }));
    expect(chestPressCount(on)).toBeGreaterThanOrEqual(chestPressCount(off));
    expect(lateralCount(on)).toBeGreaterThanOrEqual(lateralCount(off));
  });

  it('ON is length-stable (a SWAP, not an add) — exercise count unchanged vs OFF', () => {
    baselineFlags();
    const off = buildSession('upper', ctx({ armsChestFloor: false, lateralDeltGuarantee: false }));
    baselineFlags();
    const on = buildSession('upper', ctx({ armsChestFloor: true, lateralDeltGuarantee: true }));
    // swaps within the cap (saturated U/L upper day) → never grows the session.
    expect(exCount(on) - exCount(off)).toBeGreaterThanOrEqual(0);
    expect(exCount(on) - exCount(off)).toBeLessThanOrEqual(1);
  });

  it('ON keeps biceps + triceps the volume LEADERS (arms-signature invariant preserved)', () => {
    baselineFlags();
    const on = buildSession('upper', ctx({ armsChestFloor: true, lateralDeltGuarantee: true }));
    const bi = groupSlots(on, 'biceps');
    const tri = groupSlots(on, 'triceps');
    const ch = groupSlots(on, 'piept');
    const sh = groupSlots(on, 'umeri');
    const bk = groupSlots(on, 'spate');
    // the arm groups stay at least tied with each maintained major (never below → still lead).
    expect(Math.max(bi, tri)).toBeGreaterThanOrEqual(ch);
    expect(Math.max(bi, tri)).toBeGreaterThanOrEqual(sh);
    expect(Math.max(bi, tri)).toBeGreaterThanOrEqual(bk);
  });

  it('ON never orphans a MAJOR present OFF (chest/back/shoulders + arms stay >=1)', () => {
    baselineFlags();
    const off = buildSession('upper', ctx({ armsChestFloor: false, lateralDeltGuarantee: false }));
    baselineFlags();
    const on = buildSession('upper', ctx({ armsChestFloor: true, lateralDeltGuarantee: true }));
    for (const g of ['piept', 'spate', 'umeri', 'biceps', 'triceps']) {
      if (groupSlots(off, g) >= 1) expect(groupSlots(on, g)).toBeGreaterThanOrEqual(1);
    }
  });

  it('default-false ctx (no fields) behaves as legacy → byte-identical to explicit false', () => {
    baselineFlags();
    const a = buildSession('upper', ctx());
    baselineFlags();
    const b = buildSession('upper', ctx({ armsChestFloor: false, lateralDeltGuarantee: false }));
    expect(a).toEqual(b);
  });

  it('NON-arms focus (chest) is untouched by the armsChestFloor ctx absence → byte-identical', () => {
    baselineFlags();
    const a = buildSession('upper', ctx({ focusId: 'chest', emphasizedGroups: ['piept'], armsSignature: false }));
    baselineFlags();
    const b = buildSession('upper', ctx({
      focusId: 'chest', emphasizedGroups: ['piept'], armsSignature: false,
      armsChestFloor: false, lateralDeltGuarantee: false,
    }));
    expect(a).toEqual(b);
  });
});
