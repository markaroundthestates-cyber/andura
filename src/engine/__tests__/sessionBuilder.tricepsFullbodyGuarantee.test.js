/**
 * #R6a-T full-body triceps guarantee (elite-coach eval ceiling 2026-06-13: the #1
 * "not-a-9" complaint on full-body weeks was "arms under-served — add 3-4 direct
 * triceps sets, there's room"). On an all-full-body week (freq<=3) every day is the
 * `full` cluster — there is NO separate Push day, so direct triceps (triceps 0.10
 * weight) rounds out AND the MAJOR-MUSCLE maintenance floor (arms are not majors)
 * preferentially displaces a naturally-selected triceps to seat a missing major.
 * Biceps was already guarded (dp_biceps_guarantee_v1) — so a full-body day
 * guaranteed biceps but NOT triceps. dp_triceps_fullbody_guarantee_v1 closes that
 * asymmetry: when ON, a full-body day gains a direct triceps lift by swapping an
 * OVER-slotted, non-focus, non-orphaning isolation (length-stable, focus-lead-safe).
 *
 * SCOPED to `full` only: it must NOT touch the deliberate #2 upper-day triceps
 * de-dup (Daniel coach audit 2026-06-10 — upper HAS a Push day so triceps is
 * covered indirectly), and must be a no-op on clusters that do not train triceps.
 */

import { describe, it, expect } from 'vitest';
import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../../../tests/engine/full-path-sim/fp-config.js';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { DEV_FLAGS_KEY } from '../../util/featureFlags.js';

const MS_DAY = 86400000;

// ── Part A — full-path week (the REAL behaviour: maintenance floor runs, then the
// guarantee restores a swapped-out triceps). A freq-3 v-taper full-body week is the
// canonical case the eval grid flagged (direct triceps = 0 under OFF). ──────────
const N0 = Date.UTC(2026, 5, 15, 6, 0, 0); // Mon
const ACTIVE_3D = [0, 2, 4]; // Lu, Mi, V
const SCHEDULE_STORE_KEY = 'wv2-schedule-store';
const SCHEDULE_3D = ['training', 'rest', 'training', 'rest', 'training', 'rest', 'rest'];

// The persona-matrix ON set forced explicitly so the result is independent of any
// future default flip — EXCEPT the triceps guarantee, which we toggle per arm.
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

async function composeFullBodyWeek(tricepsGuaranteeOn) {
  resetWorld();
  setPathAFlags(false);
  const flags = [...BASE_ON];
  if (tricepsGuaranteeOn) flags.push('dp_triceps_fullbody_guarantee_v1');
  setFlags(flags);
  localStorage.setItem(SCHEDULE_STORE_KEY, JSON.stringify({ state: { days: SCHEDULE_3D } }));
  world.useOnboardingStore.setState({
    data: {
      age: 19, sex: 'm', goal: 'masa', experience: 'incepator', weight: 64, height: 180,
      frequency: '3', focusPreset: 'v-taper', focusPresetPickedAt: N0 - 7 * MS_DAY,
    },
    completed: true,
    completedAt: N0,
  });
  let directTriceps = 0;
  const types = [];
  for (const off of ACTIVE_3D) {
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(new Date(N0 + off * MS_DAY)); } catch { plan = null; }
    if (!plan || plan.error) continue;
    types.push(plan.sessionType);
    for (const e of plan.exercises || []) {
      const meta = getExerciseMetadata(e.engineName || e.name);
      if (meta?.muscle_target_primary === 'triceps') directTriceps += 1;
    }
  }
  return { directTriceps, types };
}

describe('R6a-T — full-body triceps guarantee (full path, freq-3 v-taper)', () => {
  it('is an all-FULL-body week (no separate Push day)', async () => {
    const on = await composeFullBodyWeek(true);
    expect(on.types.length).toBe(3);
    expect(on.types.every((t) => t === 'FULL')).toBe(true);
  });

  it('OFF → direct triceps is squeezed to ZERO across the week (the eval gap)', async () => {
    const off = await composeFullBodyWeek(false);
    expect(off.directTriceps).toBe(0);
  });

  it('ON → the week now lands at least one DIRECT triceps lift (gap closed)', async () => {
    const on = await composeFullBodyWeek(true);
    expect(on.directTriceps).toBeGreaterThanOrEqual(1);
  });

  it('ON ⊇ OFF → the guarantee only ADDS direct triceps, never removes it', async () => {
    const off = await composeFullBodyWeek(false);
    const on = await composeFullBodyWeek(true);
    expect(on.directTriceps).toBeGreaterThanOrEqual(off.directTriceps);
  });
});

// ── Part B — pure-buildSession cluster scoping (the guard must be a no-op outside
// `full`, so the deliberate upper-day de-dup + non-triceps clusters are untouched). ─
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

describe('R6a-T — cluster scoping (pure buildSession)', () => {
  it('OFF on `full` → deterministic', () => {
    const a = buildSession('full', ctx({ tricepsFullbodyGuarantee: false }));
    const b = buildSession('full', ctx({ tricepsFullbodyGuarantee: false }));
    expect(a).toEqual(b);
  });

  it('ON does NOT touch the `upper` cluster (deliberate triceps de-dup preserved) → byte-identical', () => {
    const off = buildSession('upper', ctx({ tricepsFullbodyGuarantee: false }));
    const on = buildSession('upper', ctx({ tricepsFullbodyGuarantee: true }));
    expect(on).toEqual(off);
  });

  it('ON on a cluster that does NOT train triceps (legs) → no-op, byte-identical', () => {
    const off = buildSession('legs', ctx({ tricepsFullbodyGuarantee: false }));
    const on = buildSession('legs', ctx({ tricepsFullbodyGuarantee: true }));
    expect(on).toEqual(off);
  });
});
