// ══ #BACK MAINTENANCE FLOOR (lower-focus 5d back-orphan fix 2026-06-16) ════════════════════
// dp_back_maintenance_floor_v1 (default ON). The LOWER-emphasis 5/6/7d split trades a leg day
// for an upper-region day but keeps the retained upper day as PUSH (not pull):
// FOCUS_LOWER_EMPH_SPLITS[5] = legs/upper/lower/PUSH/legs. chest therefore gets TWO weekly
// exposures (the `upper` day + the `push` day) while back gets ONE (the `upper` day only) —
// and on a SLOT-STARVED upper session (advanced/strength → ~5 lifts → back lands a SINGLE
// pulldown slot) back weekly collapses to ~3 sets while chest sits at 12-14 (eval grid
// p2/p3/p5_lower_5d: back=3, chest=12-14, ISRAETEL back MEV 10, chest MEV 8).
//
// A non-focus MAJOR must stay at MAINTENANCE (~MV 6) on a focus block — sub-MV back slowly
// detrains. When ON + a non-back/non-balanced focus + the week has a PUSH day but NO PULL day
// + back is trained on fewer days than chest, getDailyWorkout sets ctx.backMaintenanceFloor on
// the `upper` day so buildSession, when back ended ORPHANED (a single slot) while chest holds a
// SURPLUS (>=2 chest slots), SWAPS exactly one surplus chest press for a back row — length- and
// set-stable: back rises toward MV, chest keeps a slot on the upper day PLUS its push-day
// exposure → weekly chest stays >= MEV (collateral-free). DONOR-GUARDED: if the upper day has no
// removable surplus chest press it does NOTHING (never breaks chest).
//
// METHODOLOGY ("test real values"): the orphan is a FULL-PIPELINE delivery fact (the per-day
// session-size trim that drops the upper day to ~5 lifts, dropping a back slot, is not present in
// pure buildSession), so this gate composes the REAL planned week through world.composePlanned-
// WorkoutToday (the SAME mechanic the eval-grid exporter + persona-matrix gates use) for the
// genuinely-orphaned personas (p2 intermediar/forta, p3/p5 avansat/masa) and the back-already-OK
// personas (p4/p12 intermediar/masa|slabire), then asserts the delivered weekly back/chest sets.
// READ-ONLY on src/ — flags forced via localStorage._devFlags exactly like fp-config.

import { describe, it, expect } from 'vitest';
import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../../../tests/engine/full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { DEV_FLAGS_KEY } from '../../util/featureFlags.js';
import { SCHEDULE_STORE_KEY } from '../schedule/scheduleAdapter/constants.js';
import { ISRAETEL_BASELINES } from '../periodization/constants.js';

const MS_DAY = 86400000;
const COHORT_START = Date.UTC(2026, 0, 5); // Monday
const FREQ5_OFFSETS = [0, 1, 2, 4, 5];     // the lower-emphasis 5d active days (Lu/Ma/Mi/Vi/Sa)

// REAL Israetel maintenance landmarks (periodization/constants.js — not round numbers).
const BACK_MEV = ISRAETEL_BASELINES.back.MEV;   // 10
const CHEST_MEV = ISRAETEL_BASELINES.chest.MEV; // 8
// Maintenance volume floor a non-focus major needs on a focus block (sub-MV → slow detrain).
const BACK_MV = 6;

// The grid personas (verbatim from the eval-grid exporter) for the lower-focus 5d configs.
const PERSONAS = {
  // genuinely-orphaned (small upper session → back lands 1 slot → ~3 sets):
  p2: { age: 38, sex: 'm', goal: 'forta', experience: 'intermediar', weight: 78, height: 175 },
  p3: { age: 30, sex: 'm', goal: 'masa', experience: 'avansat', weight: 82, height: 182, targetWeight: 85 },
  p5: { age: 42, sex: 'f', goal: 'masa', experience: 'avansat', weight: 60, height: 165 },
  // back-already-OK (bigger upper session → back lands 3 slots → ~8 sets, >= MV):
  p4: { age: 28, sex: 'f', goal: 'masa', experience: 'intermediar', weight: 62, height: 168 },
  p12: { age: 27, sex: 'f', goal: 'slabire', experience: 'intermediar', weight: 75, height: 169, targetWeight: 65 },
};

// The full focus-ON flag env (mirrors the focusSignature gate) so the floor runs in its real
// composition context. dp_back_maintenance_floor_v1 is toggled per arm.
const FOCUS_ON_FLAGS = [
  'dp_focus_policy_v1', 'dp_focus_contracts_v1', 'dp_week_ledger_v1', 'dp_split_rebalance_v1',
  'dp_latiso_dedup_v1', 'dp_biceps_guarantee_v1', 'dp_lumbar_dedup_v1', 'dp_load_model_v1',
  'dp_posterior_chain_floor_v1', 'dp_hamstring_floor_v1',
];

function setFlags(backFloorOn) {
  resetWorld();
  setPathAFlags(false);
  const o = {};
  for (const f of FLIPPED_FLAGS) o[f] = false;       // clean baseline (all FLIPPED off)
  for (const f of FOCUS_ON_FLAGS) o[f] = true;       // the real focus composition env
  o.dp_back_maintenance_floor_v1 = backFloorOn;      // the flag under test
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

function seedSchedule(offsets) {
  const days = ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'];
  for (const o of offsets) days[o] = 'training';
  localStorage.setItem(SCHEDULE_STORE_KEY, JSON.stringify({ state: { days }, version: 0 }));
}

/** Compose a persona's lower-focus 5d week and tally weekly back/chest delivered sets. */
async function composeWeek(personaId, backFloorOn, focus = 'lower') {
  setFlags(backFloorOn);
  seedSchedule(FREQ5_OFFSETS);
  const p = PERSONAS[personaId];
  world.useOnboardingStore.setState({
    data: {
      ...p,
      frequency: '5',
      focusPreset: focus,
      focusPresetPickedAt: focus !== 'balanced' ? COHORT_START - 7 * MS_DAY : null,
    },
    completed: true,
    completedAt: COHORT_START,
  });
  let back = 0;
  let chest = 0;
  let biceps = 0;
  let total = 0;
  for (const off of FREQ5_OFFSETS) {
    const plan = await world.composePlannedWorkoutToday(new Date(COHORT_START + off * MS_DAY));
    for (const e of (plan && plan.exercises) || []) {
      const g = getExerciseMetadata(e.engineName || e.name).muscle_target_primary;
      const sets = e.sets || 0;
      total += sets;
      if (g === 'spate') back += sets;
      if (g === 'piept') chest += sets;
      if (g === 'biceps') biceps += sets;
    }
  }
  return { back, chest, biceps, total };
}

describe('#BACK MAINTENANCE FLOOR — lower-focus 5d back-orphan repair (full-path)', () => {
  it('p2 (intermediar/forta) lower_5d: ON raises back toward MV, chest stays >= MEV, total unchanged', async () => {
    const off = await composeWeek('p2', false);
    const on = await composeWeek('p2', true);
    // OFF reproduces the orphan: back collapsed below MV (and far below its MEV), chest over-served.
    expect(off.back).toBeLessThan(BACK_MV);
    expect(off.back).toBeLessThan(BACK_MEV);
    expect(off.chest).toBeGreaterThan(CHEST_MEV);
    // ON raises back to at least MV and keeps chest at/above MEV (collateral-free donor).
    expect(on.back).toBeGreaterThanOrEqual(BACK_MV);
    expect(on.chest).toBeGreaterThanOrEqual(CHEST_MEV);
    // back went UP, chest came DOWN (the surplus-press → back-row swap).
    expect(on.back).toBeGreaterThan(off.back);
    expect(on.chest).toBeLessThan(off.chest);
    // a SWAP, not an add — total weekly sets unchanged (the maintenance clamp keeps it time-neutral).
    expect(on.total).toBe(off.total);
    // COLLATERAL-FREE: biceps (a tiny non-focus group sharing the slot-starved upper day) is NOT
    // squeezed out by the swap — the time-neutral clamp prevents the time-trim from dropping it.
    expect(on.biceps).toBe(off.biceps);
  });

  it('p3 (avansat/masa) + p5 (avansat/masa, f) lower_5d: ON raises back >= MV, chest stays >= MEV', async () => {
    for (const id of ['p3', 'p5']) {
      const off = await composeWeek(id, false);
      const on = await composeWeek(id, true);
      expect(off.back).toBeLessThan(BACK_MV);
      expect(on.back).toBeGreaterThanOrEqual(BACK_MV);
      expect(on.chest).toBeGreaterThanOrEqual(CHEST_MEV);
      expect(on.total).toBe(off.total);
      expect(on.biceps).toBe(off.biceps); // collateral-free
    }
  });

  it('p4 + p12 (back already well above MV) lower_5d: UNTOUCHED — byte-identical ON vs OFF', async () => {
    for (const id of ['p4', 'p12']) {
      const off = await composeWeek(id, false);
      const on = await composeWeek(id, true);
      // back was never orphaned (3 back slots on a 7-lift upper day → ~13 sets) → the single-
      // back-slot gate never trips → no swap → identical delivery.
      expect(off.back).toBeGreaterThanOrEqual(BACK_MV);
      expect(on.back).toBe(off.back);
      expect(on.chest).toBe(off.chest);
      expect(on.total).toBe(off.total);
    }
  });

  it('BACK focus is untouched (the floor never fires on its own focus) — byte-identical', async () => {
    const off = await composeWeek('p2', false, 'back');
    const on = await composeWeek('p2', true, 'back');
    expect(on.back).toBe(off.back);
    expect(on.chest).toBe(off.chest);
    expect(on.total).toBe(off.total);
  });

  it('BALANCED focus is untouched (no orphan path) — byte-identical', async () => {
    const off = await composeWeek('p2', false, 'balanced');
    const on = await composeWeek('p2', true, 'balanced');
    expect(on.back).toBe(off.back);
    expect(on.chest).toBe(off.chest);
    expect(on.total).toBe(off.total);
  });

  it('the swap NEVER takes chest below its MEV (collateral-free donor guard)', async () => {
    for (const id of ['p2', 'p3', 'p5']) {
      const on = await composeWeek(id, true);
      expect(on.chest).toBeGreaterThanOrEqual(CHEST_MEV);
    }
  });
});
