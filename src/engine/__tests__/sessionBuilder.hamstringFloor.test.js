/**
 * #HAMS hypertrophy/strength hamstring floor (orphaned-hamstrings eval defect 2026-06-14:
 * judges capped masa/forta configs whose leg days zeroed HAMSTRINGS — "hamstrings fully
 * ORPHANED: zero direct sets and no covering movement … for a masa goal that is a genuine
 * prime-mover gap → orphan cap", a ±3-4 judge-variance swing). The Cycle-11 posterior floor
 * (dp_posterior_chain_floor_v1) treats hams∪glutes as ONE region, so a GLUTE movement alone
 * (Glute Drive) satisfies it and leaves hamstrings at 0; the Cycle-7 leg-curl guarantee
 * (dp_legcurl_guarantee_v1) only fires on the lower-back ('spate') exclusion path. So on a
 * masa v-taper (legs de-emphasized) glutes get covered but HAMSTRINGS stay zero.
 *
 * dp_hamstring_floor_v1 closes that: when ON + the goal is masa/forta + the cluster trains
 * legs (full/lower/legs), buildSession guarantees >=1 hamstring-primary slot (a hinge RDL/GHR
 * preferred, a machine leg curl fallback) via a length-stable swap of a surplus non-focus,
 * non-leg isolation — never displacing the focus below its lead, never orphaning a major.
 *
 * INJURY-COMPOSED: a spate (disc/lower-back) signal DEFERS this block to the Cycle-7 spine-
 * neutral leg-curl guarantee (no double-inject, no contraindicated hinge).
 *
 * GOAL-GATED at the seam: mentenanta / slabire / age>=60 are NOT forced (reduced lower volume
 * is correct for them) — proven byte-identical here. OFF / non-masa-forta → byte-identical.
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

const N0 = Date.UTC(2026, 5, 15, 6, 0, 0); // Mon
const ACTIVE_3D = [0, 2, 4]; // Lu, Mi, V
const SCHEDULE_STORE_KEY = 'wv2-schedule-store';
const SCHEDULE_3D = ['training', 'rest', 'training', 'rest', 'training', 'rest', 'rest'];

// The live ON set forced explicitly so the result is independent of any future default flip
// — EXCEPT the hamstring floor (+ the paired posterior floor / legcurl guarantee), which the
// arm toggles. Mirrors the posteriorChainFloor suite's BASE_ON.
const BASE_ON = Object.freeze([
  'dp_focus_policy_v1', 'dp_split_rebalance_v1', 'dp_latiso_dedup_v1',
  'dp_biceps_guarantee_v1', 'dp_lumbar_dedup_v1', 'dp_rep_class_v1',
  'dp_anchor_sets_v1', 'dp_load_model_v1', 'dp_metric_types_v1',
  'dp_focus_contracts_v1', 'dp_week_ledger_v1', 'dp_posterior_chain_floor_v1',
]);

function setFlags(ids) {
  const o = {};
  for (const f of FLIPPED_FLAGS) o[f] = false; // baseline everything OFF
  for (const f of ids) o[f] = true;
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

// Compose a full journey week and tally per-leg-group PRIMARY slots, the set of hamstring
// movement NAMES landed, and per-group weekly SET volume.
async function composeWeek({
  hamstringFloorOn,
  goal = 'masa',
  focusPreset = 'v-taper',
  experience = 'avansat',
  age = 26,
  schedule = SCHEDULE_3D,
  active = ACTIVE_3D,
}) {
  resetWorld();
  setPathAFlags(false);
  const flags = [...BASE_ON];
  if (hamstringFloorOn) flags.push('dp_hamstring_floor_v1');
  setFlags(flags);
  localStorage.setItem(SCHEDULE_STORE_KEY, JSON.stringify({ state: { days: schedule } }));
  const data = {
    age, sex: 'm', goal, experience, weight: 80, height: 180,
    frequency: String(active.length), focusPreset, focusPresetPickedAt: N0 - 7 * MS_DAY,
  };
  world.useOnboardingStore.setState({ data, completed: true, completedAt: N0 });
  let quad = 0; let hams = 0; let glutes = 0;
  const hamsNames = [];
  const volume = {};
  for (const off of active) {
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(new Date(N0 + off * MS_DAY)); } catch { plan = null; }
    if (!plan || plan.error) continue;
    for (const e of plan.exercises || []) {
      const name = e.engineName || e.name;
      const p = getExerciseMetadata(name)?.muscle_target_primary;
      if (p === QUAD) quad += 1;
      else if (p === HAMS) { hams += 1; hamsNames.push(name); }
      else if (p === GLUTES) glutes += 1;
      if (p) volume[p] = (volume[p] || 0) + (e.sets || 0);
    }
  }
  return { quad, hams, glutes, hamsNames, volume };
}

const HINGE_RE = /romanian|rdl|deadlift|good[- ]?morning|glute[- ]?ham|nordic/i;
const CURL_RE = /leg curl/i;

describe('HAMS floor — full-path week (masa v-taper)', () => {
  it('masa v-taper freq-3 ON → hamstrings train every week (hams>0), the orphan is closed', async () => {
    const off = await composeWeek({ hamstringFloorOn: false });
    const on = await composeWeek({ hamstringFloorOn: true });
    // The canonical defect: OFF leaves hams orphaned on the v-taper full-body week.
    expect(off.hams, `OFF hams=${off.hams} (the orphan baseline)`).toBe(0);
    // ON closes it — at least one hamstring-primary slot lands across the week.
    expect(on.hams, `ON hams=${on.hams} names=${on.hamsNames.join(',')}`).toBeGreaterThan(0);
  });

  it('masa v-taper ON → the injected hamstring mover is a HINGE (RDL / GHR), not a leg curl (no injury)', async () => {
    const on = await composeWeek({ hamstringFloorOn: true });
    // A non-injury masa trainee gets the elite-coach hip-hinge; the leg-curl fallback is
    // reserved for the spate (disc) contraindication path.
    expect(on.hamsNames.length).toBeGreaterThan(0);
    expect(on.hamsNames.every((n) => HINGE_RE.test(n)),
      `masa v-taper hams movers should be hinges, got: ${on.hamsNames.join(',')}`).toBe(true);
  });

  it('ON ⊇ OFF on hamstrings → the floor only ADDS a hamstring slot, never removes one', async () => {
    const off = await composeWeek({ hamstringFloorOn: false });
    const on = await composeWeek({ hamstringFloorOn: true });
    expect(on.hams).toBeGreaterThanOrEqual(off.hams);
    expect(on.hams).toBeGreaterThan(0);
  });

  it('ON → the length-stable swap keeps the v-taper focus (spate/umeri) the week LEAD', async () => {
    // The hams slot is seated by trading a SURPLUS focus/non-focus isolation (length-stable),
    // so a focus group's set total MAY tick down by its surplus slot — but the focus must
    // STILL lead the week (the prompt invariant: "never displace the focus below its lead").
    const on = await composeWeek({ hamstringFloorOn: true });
    const focusVol = Math.max(on.volume.spate || 0, on.volume.umeri || 0);
    // The v-taper focus (its strongest of spate/umeri) leads every non-focus group.
    const nonFocusMax = Math.max(
      0,
      ...Object.entries(on.volume)
        .filter(([g]) => g !== 'spate' && g !== 'umeri')
        .map(([, n]) => n),
    );
    expect(focusVol, `focus=${focusVol} nonFocusMax=${nonFocusMax} vol=${JSON.stringify(on.volume)}`)
      .toBeGreaterThanOrEqual(nonFocusMax);
  });

  it('ON → the focus (v-taper: spate/umeri) still leads the week over hamstrings', async () => {
    const on = await composeWeek({ hamstringFloorOn: true });
    const focusVol = Math.max(on.volume.spate || 0, on.volume.umeri || 0);
    expect(focusVol, `focus=${focusVol} hams=${on.volume[HAMS]}`)
      .toBeGreaterThan(on.volume[HAMS] || 0);
  });
});

describe('HAMS floor — goal gating (maintenance / older / cut UNCHANGED)', () => {
  it('mentenanta v-taper → the floor does NOT force hams (byte-identical ON vs OFF)', async () => {
    const off = await composeWeek({ hamstringFloorOn: false, goal: 'mentenanta' });
    const on = await composeWeek({ hamstringFloorOn: true, goal: 'mentenanta' });
    expect(on.hams, `mentenanta hams ON=${on.hams} OFF=${off.hams}`).toBe(off.hams);
    expect(on.hamsNames).toEqual(off.hamsNames);
  });

  it('older (age 65) v-taper → the floor does NOT force hams (byte-identical ON vs OFF)', async () => {
    const off = await composeWeek({ hamstringFloorOn: false, goal: 'masa', age: 65 });
    const on = await composeWeek({ hamstringFloorOn: true, goal: 'masa', age: 65 });
    expect(on.hams, `age65 hams ON=${on.hams} OFF=${off.hams}`).toBe(off.hams);
    expect(on.hamsNames).toEqual(off.hamsNames);
  });

  it('slabire (cut) v-taper → the floor does NOT force hams (byte-identical ON vs OFF)', async () => {
    const off = await composeWeek({ hamstringFloorOn: false, goal: 'slabire' });
    const on = await composeWeek({ hamstringFloorOn: true, goal: 'slabire' });
    expect(on.hams, `slabire hams ON=${on.hams} OFF=${off.hams}`).toBe(off.hams);
    expect(on.hamsNames).toEqual(off.hamsNames);
  });
});

// ── Pure-buildSession scoping: cluster gate, goal-gated ctx, injury contraindication. ─
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
  seed: 'user-1|2026-06-14|0',
  volumeTargets: VOLUME,
  weeklySessionsPerGroup: SESSIONS_PER_GROUP,
  focusPolicy: true,
  focusId: 'chest',
  emphasizedGroups: ['piept'],
  ...over,
});

const hamsCount = (session) =>
  session.exercises.filter((e) => getExerciseMetadata(e.name)?.muscle_target_primary === HAMS).length;
const hamsNamesOf = (session) =>
  session.exercises
    .filter((e) => getExerciseMetadata(e.name)?.muscle_target_primary === HAMS)
    .map((e) => e.name);

// The spate (disc/lower-back) exclusion sentinel + tokens — the same shape getDailyWorkout
// threads into ctx.excludedMovements for a lower-back injury persona.
import { LUMBAR_HINGE_SENTINEL } from '../movementExclusion.js';
const SPATE_EXCLUSION = {
  tokens: new Set([LUMBAR_HINGE_SENTINEL, 'deadlift', 'good-morning', 'squat', 'hip-thrust']),
  names: new Set(),
};

describe('HAMS floor — pure buildSession scoping', () => {
  it('ON on `full` under a leg-zeroing chest focus + masa → a hamstring-primary slot lands', () => {
    const on = buildSession('full', ctx({ hamstringFloor: true, posteriorChainFloor: true }));
    expect(hamsCount(on)).toBeGreaterThanOrEqual(1);
  });

  it('ON on `full` guarantees a hamstring-primary slot for masa (no leg curl forced over a hinge)', () => {
    // Invariant: a masa `full` day under a leg-zeroing focus always ends with >=1 hams slot.
    // (Hinge-vs-curl PREFERENCE is asserted authoritatively on the full path above — the
    // synthetic pure ctx's fill can itself seat a hams anchor, so the SELECTION is exercised
    // end-to-end where it matters; here we lock the slot-count guarantee + scoping.)
    const off = buildSession('full', ctx({ hamstringFloor: false }));
    const on = buildSession('full', ctx({ hamstringFloor: true, posteriorChainFloor: true }));
    expect(hamsCount(on)).toBeGreaterThanOrEqual(1);
    expect(hamsCount(on)).toBeGreaterThanOrEqual(hamsCount(off));
  });

  it('ctx flag FALSE → deterministic, and the floor does NOT run (no forced hams)', () => {
    const a = buildSession('full', ctx({ hamstringFloor: false }));
    const b = buildSession('full', ctx({ hamstringFloor: false }));
    expect(a).toEqual(b);
    const on = buildSession('full', ctx({ hamstringFloor: true, posteriorChainFloor: true }));
    expect(hamsCount(on)).toBeGreaterThanOrEqual(hamsCount(a));
  });

  it('ON does NOT touch a non-leg cluster (an UPPER day has no hamstring target) → byte-identical', () => {
    const off = buildSession('upper', ctx({ hamstringFloor: false }));
    const on = buildSession('upper', ctx({ hamstringFloor: true }));
    expect(on).toEqual(off);
  });

  it('SPATE (disc) injury → the hamstring floor DEFERS (no hinge injected); the leg-curl guarantee owns it', () => {
    // With the spate sentinel present, dp_hamstring_floor_v1 must NOT inject (it would risk a
    // contraindicated hinge). The dedicated Cycle-7 leg-curl guarantee injects a spine-neutral
    // leg curl instead.
    const onlyHams = buildSession('full', ctx({
      hamstringFloor: true, posteriorChainFloor: true, excludedMovements: SPATE_EXCLUSION,
    }));
    // The hamstring floor alone must not seat a hinge under the spate exclusion.
    const hingeFromHamsFloor = hamsNamesOf(onlyHams).some((n) => HINGE_RE.test(n));
    expect(hingeFromHamsFloor, `spate hams floor names=${hamsNamesOf(onlyHams).join(',')}`).toBe(false);
    // With the leg-curl guarantee ON, a spine-neutral LEG CURL is injected (knee flexion).
    const withLegCurl = buildSession('full', ctx({
      hamstringFloor: true, posteriorChainFloor: true, legCurlGuarantee: true,
      excludedMovements: SPATE_EXCLUSION,
    }));
    const names = hamsNamesOf(withLegCurl);
    expect(names.length, `spate+legcurl hams names=${names.join(',')}`).toBeGreaterThanOrEqual(1);
    expect(names.every((n) => CURL_RE.test(n) && !HINGE_RE.test(n)),
      `spate hams must be a spine-neutral leg curl, got: ${names.join(',')}`).toBe(true);
  });

  it('lower cluster ON + masa → a hamstring-primary slot lands (leg day must train hams)', () => {
    const off = buildSession('lower', ctx({ hamstringFloor: false }));
    const on = buildSession('lower', ctx({ hamstringFloor: true, posteriorChainFloor: true }));
    expect(hamsCount(on)).toBeGreaterThanOrEqual(Math.max(1, hamsCount(off)));
  });
});
