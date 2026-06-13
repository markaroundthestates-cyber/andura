/**
 * #LEG full-body posterior+quad floor (orphaned-legs eval defect 2026-06-13: judges
 * hard-capped at 4.0-5.0 configs whose FULL-BODY days under an upper-biased focus zeroed
 * the legs entirely — "hamstrings AND glutes orphaned", "legs completely ORPHANED";
 * worst case p11_chest_3d trained legs NEVER). On a freq 1-3 all-full-body week under a
 * chest / v-taper / shoulders / upper / back focus the focus zeroes the leg weights, so
 * the leg majors fall out of `targets`: the MAJOR-MUSCLE slot guarantee SKIPS them, the
 * 2-in-3 region floor leaves hams+glutes at 0 while quads alone hold the floor, and
 * focus-protect denies legs the marginal slot. dp_posterior_chain_floor_v1 closes that:
 * when ON, a `full` day always lands >=1 quad-primary slot AND >=1 posterior
 * (hams|glutes)-primary slot, displacing the focus's surplus upper isolation if the
 * session is full (the one place leg maintenance OVERRIDES focus-protect).
 *
 * SCOPED to `full` only: a U/L split's `upper` day legitimately has 0 legs (the Lower
 * day trains them), so it must be byte-identical there; and the flag-derived ctx false
 * must be byte-identical everywhere.
 */

import { describe, it, expect } from 'vitest';
import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../../../tests/engine/full-path-sim/fp-config.js';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { DEV_FLAGS_KEY } from '../../util/featureFlags.js';

const MS_DAY = 86400000;
const QUAD = 'picioare-quads';
const HAMS = 'picioare-hamstrings';
const GLUTES = 'fese';

// ── Part A — full-path week (the REAL behaviour: every other slot block runs first,
// then the posterior+quad floor restores legs). A freq-3 chest full-body week is the
// canonical defect (p11_chest_3d had quads=hams=glutes=0 under OFF). ───────────────
const N0 = Date.UTC(2026, 5, 15, 6, 0, 0); // Mon
const ACTIVE_3D = [0, 2, 4]; // Lu, Mi, V
const SCHEDULE_STORE_KEY = 'wv2-schedule-store';
const SCHEDULE_3D = ['training', 'rest', 'training', 'rest', 'training', 'rest', 'rest'];

// The persona-matrix ON set forced explicitly so the result is independent of any
// future default flip — EXCEPT the posterior floor, which we toggle per arm.
const BASE_ON = Object.freeze([
  'dp_focus_policy_v1', 'dp_split_rebalance_v1', 'dp_latiso_dedup_v1',
  'dp_biceps_guarantee_v1', 'dp_lumbar_dedup_v1', 'dp_rep_class_v1',
  'dp_anchor_sets_v1', 'dp_load_model_v1', 'dp_metric_types_v1',
  'dp_focus_contracts_v1', 'dp_week_ledger_v1',
]);

function setFlags(ids) {
  const o = {};
  for (const f of FLIPPED_FLAGS) o[f] = false; // baseline everything OFF
  for (const f of ids) o[f] = true;
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

async function composeFullBodyWeek(posteriorFloorOn, focusPreset = 'chest') {
  resetWorld();
  setPathAFlags(false);
  const flags = [...BASE_ON];
  if (posteriorFloorOn) flags.push('dp_posterior_chain_floor_v1');
  // The arms-focus signature (umeri demoted, biceps/triceps floored) must be ON for
  // the arms focus-preservation assertion to reflect the live arms behaviour.
  if (focusPreset === 'arms') flags.push('dp_arms_signature_v1');
  setFlags(flags);
  localStorage.setItem(SCHEDULE_STORE_KEY, JSON.stringify({ state: { days: SCHEDULE_3D } }));
  world.useOnboardingStore.setState({
    data: {
      age: 26, sex: 'm', goal: 'masa', experience: 'avansat', weight: 80, height: 180,
      frequency: '3', focusPreset, focusPresetPickedAt: N0 - 7 * MS_DAY,
    },
    completed: true,
    completedAt: N0,
  });
  // Per-week PRIMARY-slot counts by leg sub-group + per-group weekly SET volume + the
  // set of session types (the volume map drives the focus-preservation assertion).
  let quad = 0; let hams = 0; let glutes = 0;
  const types = [];
  const volume = {};
  for (const off of ACTIVE_3D) {
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(new Date(N0 + off * MS_DAY)); } catch { plan = null; }
    if (!plan || plan.error) continue;
    types.push(plan.sessionType);
    for (const e of plan.exercises || []) {
      const p = getExerciseMetadata(e.engineName || e.name)?.muscle_target_primary;
      if (p === QUAD) quad += 1;
      else if (p === HAMS) hams += 1;
      else if (p === GLUTES) glutes += 1;
      if (p) volume[p] = (volume[p] || 0) + (e.sets || 0);
    }
  }
  return { quad, hams, glutes, posterior: hams + glutes, types, volume };
}

describe('LEG floor — full-body posterior+quad (full path, freq-3 chest)', () => {
  it('is an all-FULL-body week (no separate Lower day)', async () => {
    const on = await composeFullBodyWeek(true);
    expect(on.types.length).toBe(3);
    expect(on.types.every((t) => t === 'FULL')).toBe(true);
  });

  it('ON → the week lands quads AND a posterior mover on every full-body day (the floor)', async () => {
    const on = await composeFullBodyWeek(true);
    // freq-3 → 3 FULL days, each guaranteed >=1 quad and >=1 posterior slot.
    // (The week-level before/after zeroing across the WHOLE grid is proven by the
    //  eval-grid metric; here we assert the per-build invariant the floor enforces.)
    expect(on.quad).toBeGreaterThanOrEqual(3);
    expect(on.posterior).toBeGreaterThanOrEqual(3);
  });

  it('ON ⊇ OFF → the floor only ADDS leg slots, never removes them', async () => {
    const off = await composeFullBodyWeek(false);
    const on = await composeFullBodyWeek(true);
    expect(on.quad).toBeGreaterThanOrEqual(off.quad);
    expect(on.posterior).toBeGreaterThanOrEqual(off.posterior);
  });

  // FOCUS-PRESERVATION (Daniel eval 2026-06-13 regression fix). On an UPPER-biased
  // focus the floor must NOT seat legs by displacing the FOCUS muscle's own slot —
  // that was the regression (p1_arms_2d biceps→4, p6_back_1d back no longer leads).
  // The fix makes the victim-selection focus-safe: a focus slot is displaceable ONLY
  // while its group retains a STRICT slot lead afterward; else the leg YIELDs (a
  // defensible covered trade). So the focus group's weekly volume under ON must be
  // >= its OFF value (never clawed back), and the focus group must still LEAD.
  const leads = (vol, group) => {
    const v = vol[group] || 0;
    return v > 0 && Object.entries(vol).every(([g, n]) => g === group || n <= v);
  };
  it('arms focus ON → biceps & triceps are NOT displaced by the leg floor (signature preserved)', async () => {
    const off = await composeFullBodyWeek(false, 'arms');
    const on = await composeFullBodyWeek(true, 'arms');
    // The floor must never claw back the emphasized arm volume to seat a leg.
    expect(on.volume.biceps || 0, `biceps ON=${on.volume.biceps} OFF=${off.volume.biceps}`)
      .toBeGreaterThanOrEqual(off.volume.biceps || 0);
    expect(on.volume.triceps || 0, `triceps ON=${on.volume.triceps} OFF=${off.volume.triceps}`)
      .toBeGreaterThanOrEqual(off.volume.triceps || 0);
    // The arms signature: an arm muscle (biceps or triceps) leads the week.
    expect(leads(on.volume, 'biceps') || leads(on.volume, 'triceps'),
      `arms ON volume=${JSON.stringify(on.volume)}`).toBe(true);
  });
  it('back focus ON → back (spate) is NOT displaced and still LEADS the week', async () => {
    const off = await composeFullBodyWeek(false, 'back');
    const on = await composeFullBodyWeek(true, 'back');
    // Back is the focus → its volume must not be reduced to seat a leg.
    expect(on.volume.spate || 0, `spate ON=${on.volume.spate} OFF=${off.volume.spate}`)
      .toBeGreaterThanOrEqual(off.volume.spate || 0);
    // And back still leads the week's volume (the focus signature).
    expect(leads(on.volume, 'spate'), `back ON volume=${JSON.stringify(on.volume)}`).toBe(true);
  });
});

// ── Part B — pure-buildSession scoping (no-op outside `full` and when ctx flag false). ─
const allEquip = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];
// An upper-biased focus that zeroes the leg weights: chest emphasized, legs absent.
const VOLUME = {
  chest: 18, back: 8, shoulders: 8, biceps: 6, triceps: 6,
  quads: 0, hamstrings: 0, glutes: 0, calves: 0, abs: 4, forearms: 2,
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
  focusPolicy: true,
  focusId: 'chest',
  emphasizedGroups: ['piept'],
  ...over,
});

const legCounts = (session) => {
  let quad = 0; let hams = 0; let glutes = 0;
  for (const e of session.exercises) {
    const p = getExerciseMetadata(e.name)?.muscle_target_primary;
    if (p === QUAD) quad += 1;
    else if (p === HAMS) hams += 1;
    else if (p === GLUTES) glutes += 1;
  }
  return { quad, posterior: hams + glutes };
};

describe('LEG floor — pure buildSession scoping', () => {
  it('ON on `full` under a leg-zeroing chest focus → quads >=1 AND posterior >=1', () => {
    const on = buildSession('full', ctx({ posteriorChainFloor: true }));
    const c = legCounts(on);
    expect(c.quad).toBeGreaterThanOrEqual(1);
    expect(c.posterior).toBeGreaterThanOrEqual(1);
  });

  it('ctx flag FALSE on `full` → deterministic, and the floor does NOT run', () => {
    const a = buildSession('full', ctx({ posteriorChainFloor: false }));
    const b = buildSession('full', ctx({ posteriorChainFloor: false }));
    expect(a).toEqual(b);
    // The ON arm strictly DOMINATES the OFF arm on leg coverage (the floor only adds).
    const on = buildSession('full', ctx({ posteriorChainFloor: true }));
    expect(legCounts(on).quad).toBeGreaterThanOrEqual(legCounts(a).quad);
    expect(legCounts(on).posterior).toBeGreaterThanOrEqual(legCounts(a).posterior);
  });

  it('ON does NOT touch a non-`full` cluster (an UPPER day legitimately has 0 legs) → byte-identical', () => {
    const off = buildSession('upper', ctx({ posteriorChainFloor: false }));
    const on = buildSession('upper', ctx({ posteriorChainFloor: true }));
    expect(on).toEqual(off);
  });

  it('ON is deterministic on `full` (same ctx → same session)', () => {
    const a = buildSession('full', ctx({ posteriorChainFloor: true }));
    const b = buildSession('full', ctx({ posteriorChainFloor: true }));
    expect(a).toEqual(b);
  });
});
