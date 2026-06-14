/**
 * #WIDTH lateral-delt guarantee (v-taper/shoulders OHP-only eval ceiling 2026-06-14).
 * The SIDE DELT is the #1 v-taper WIDTH driver, but at low frequency (2-3 days = all
 * full-body, 2-3 umeri slots) the session fills those slots with overhead PRESSES (and
 * at most a rear-delt) — so 28/114 v-taper+shoulders grid configs were OHP-only (zero
 * direct lateral). The /10 judge caps those ("shoulders 100% pressing — half the v-taper
 * signature under-built"); configs WITH a lateral score 8.5-9.0.
 *
 * dp_lateral_delt_guarantee_v1 (default ON) closes the gap: ctx.lateralDeltGuarantee is
 * true ONLY on a v-taper/shoulders focus (emphSet has umeri). When true + the session
 * TRAINS umeri but has NO direct lateral, a lateral is injected — PREFER displacing a
 * redundant 2nd overhead press, else an over-slotted non-surfaced non-leg isolation, else
 * an incidental minor (arm) isolation, else add if room. ORPHAN-SAFE (never a major),
 * LEAD-SAFE (focus still leads), LENGTH-STABLE (swap, or +1 only). When false (flag OFF /
 * non-width focus) the block never fires → byte-identical legacy behaviour.
 */

import { describe, it, expect } from 'vitest';
import { resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../../../tests/engine/full-path-sim/fp-config.js';
import { buildSession, movementKey } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { deriveExerciseTags } from '../focusPolicy.js';
import { DEV_FLAGS_KEY } from '../../util/featureFlags.js';

const allEquip = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];
// v-taper-shaped budget: umeri + back UP (the V), legs de-emphasized (maintenance).
const VOLUME = {
  chest: 10, back: 22, shoulders: 11, biceps: 4, triceps: 6,
  quads: 8, hamstrings: 8, glutes: 6, calves: 4, abs: 4, forearms: 2,
};
const SESSIONS_PER_GROUP = {
  piept: 1, spate: 2, umeri: 2, biceps: 1, triceps: 1,
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
  emphasizedGroups: ['umeri', 'spate'],
  focusPolicy: true,
  focusContracts: true,
  focusId: 'v-taper',
  daysPerWeek: 3,
  posteriorChainFloor: true, // FULL-day leg floor active (the real env that robs the lateral)
  ...over,
});

const isLateral = (e) =>
  deriveExerciseTags(e.name, getExerciseMetadata(e.name), movementKey).has('side_delt');
const lateralCount = (s) => (s?.exercises || []).filter(isLateral).length;
const primaryOf = (n) => getExerciseMetadata(n)?.muscle_target_primary;
const groupSlots = (s, g) => (s?.exercises || []).filter((e) => primaryOf(e.name) === g).length;
const exCount = (s) => (s?.exercises || []).length;

function baselineFlags() {
  resetWorld();
  setPathAFlags(false);
  const o = {};
  for (const f of FLIPPED_FLAGS) o[f] = false; // all FLIPPED off → clean baseline
  // The real env the guarantee runs in: focus policy + the leg floors that compete for
  // the umeri surplus slot, + the arm guarantees that seat the incidental minor it swaps.
  o.dp_focus_policy_v1 = true;
  o.dp_focus_contracts_v1 = true;
  o.dp_posterior_chain_floor_v1 = true;
  o.dp_biceps_guarantee_v1 = true;
  o.dp_triceps_fullbody_guarantee_v1 = true;
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

describe('#WIDTH — v-taper/shoulders lateral-delt guarantee (pure buildSession)', () => {
  it('v-taper full day + ctx.lateralDeltGuarantee:true → session has >=1 direct lateral raise', () => {
    baselineFlags();
    const on = buildSession('full', ctx({ lateralDeltGuarantee: true }));
    expect(lateralCount(on)).toBeGreaterThanOrEqual(1);
  });

  it('ON keeps a press anchor (umeri still has an overhead press — never lateral-only)', () => {
    baselineFlags();
    const on = buildSession('full', ctx({ lateralDeltGuarantee: true }));
    const presses = (on.exercises || []).filter(
      (e) => primaryOf(e.name) === 'umeri' && movementKey(e.name, getExerciseMetadata(e.name)) === 'umeri::press',
    ).length;
    expect(presses).toBeGreaterThanOrEqual(1);
  });

  it('ON ⊇ OFF on the lateral count → the guarantee only ADDS a lateral, never removes one', () => {
    baselineFlags();
    const off = buildSession('full', ctx({ lateralDeltGuarantee: false }));
    const on = buildSession('full', ctx({ lateralDeltGuarantee: true }));
    expect(lateralCount(on)).toBeGreaterThanOrEqual(lateralCount(off));
    expect(lateralCount(on)).toBeGreaterThanOrEqual(1);
  });

  it('ON is length-stable or +1 only (safe swap / add — never a runaway add)', () => {
    baselineFlags();
    const off = buildSession('full', ctx({ lateralDeltGuarantee: false }));
    const on = buildSession('full', ctx({ lateralDeltGuarantee: true }));
    expect(exCount(on) - exCount(off)).toBeGreaterThanOrEqual(0);
    expect(exCount(on) - exCount(off)).toBeLessThanOrEqual(1);
  });

  it('ON never orphans a MAJOR — every major present OFF is still present ON', () => {
    baselineFlags();
    const off = buildSession('full', ctx({ lateralDeltGuarantee: false }));
    const on = buildSession('full', ctx({ lateralDeltGuarantee: true }));
    for (const g of ['piept', 'spate', 'umeri', 'picioare-quads', 'picioare-hamstrings', 'fese']) {
      if (groupSlots(off, g) >= 1) expect(groupSlots(on, g)).toBeGreaterThanOrEqual(1);
    }
  });

  it('ON keeps the focus leading — umeri stays >= the largest non-focus group', () => {
    baselineFlags();
    const on = buildSession('full', ctx({ lateralDeltGuarantee: true }));
    const counts = {};
    for (const e of on.exercises || []) {
      const g = primaryOf(e.name);
      if (g) counts[g] = (counts[g] || 0) + 1;
    }
    const focus = new Set(['umeri', 'spate']);
    let maxNonFocus = 0;
    for (const [g, n] of Object.entries(counts)) if (!focus.has(g) && n > maxNonFocus) maxNonFocus = n;
    expect(counts.umeri ?? 0).toBeGreaterThanOrEqual(maxNonFocus);
  });

  it('default-false ctx (no field) behaves as legacy → byte-identical to explicit false', () => {
    baselineFlags();
    const a = buildSession('full', ctx());
    baselineFlags();
    const b = buildSession('full', ctx({ lateralDeltGuarantee: false }));
    expect(a).toEqual(b);
  });

  it('OTHER focus (chest) is untouched even with the flag-derived ctx absent → byte-identical', () => {
    baselineFlags();
    const a = buildSession('full', ctx({ focusId: 'chest', emphasizedGroups: ['piept'] }));
    baselineFlags();
    const b = buildSession('full', ctx({ focusId: 'chest', emphasizedGroups: ['piept'], lateralDeltGuarantee: false }));
    expect(a).toEqual(b);
  });
});
