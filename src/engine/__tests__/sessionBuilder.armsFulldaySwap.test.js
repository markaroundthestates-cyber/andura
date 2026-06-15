// ══ #ARMS FULL-DAY CHEST→ARM SWAP (arms full-day signature fix 2026-06-16) ════════════════
// dp_arms_fullday_swap_v1 (default ON). The focus-lead arm-slot guarantee (dp_focus_lead_
// splits_v1) only fires on a U/L `upper` day and ctx.focusLeadSplits is null for full-body
// splits, so an ARMS focus whose week runs FULL-body days (an advanced/injured arms split →
// all-full week) never converts its redundant chest work to arms. FOCUS_RULES.arms has NO
// maxChestPressPatterns cap, so 2 chest PRESSES stack on the SAME full day and chest OUT-
// VOLUMES the focus arms (eval grid p7_arms_3d/4d/5d: chest 15 from 2 presses/day vs biceps 8 /
// triceps 9; p2_arms_3d a milder chest 12 > arms) → arms are not the signature → the /10 judge
// applies the "focus muscle NOT emphasized" cap (~4.5, ISRAETEL chest MEV 8 / arms MAV 12-14).
//
// When ON + the focus is `arms` on a `full` day with a REMOVABLE surplus chest press (>=2 chest
// PRESS patterns), buildSession SWAPS one surplus chest press for an under-served direct-arm
// movement (length-stable at the slot level). COLLATERAL-FREE: the day keeps its OTHER chest
// press → weekly chest stays >= MEV; a single-press full day is left untouched (never breaks
// chest). The net effect through the full compose path (the time-budget trim re-settles an
// isolation-for-compound swap) is: the redundant chest PRESS is removed so chest no longer out-
// volumes the focus arms, the freed budget re-doses the direct-arm work, and chest holds >= MEV.
//
// METHODOLOGY ("test real values"): the chest stacking + the trim re-settle are FULL-PIPELINE
// delivery facts (pure buildSession has neither the disc-injury full-day reshape nor the time
// trim), so this gate composes the REAL planned week through world.composePlannedWorkoutToday
// (the SAME mechanic the eval-grid exporter + persona-matrix gates use) for the genuinely-
// stacked personas (p7 lower-back disc → all-full week; p2 intermediar/strength full-body @3d),
// then asserts the delivered weekly chest/arms sets. READ-ONLY on src/ — flags forced via
// localStorage._devFlags exactly like fp-config.

import { describe, it, expect } from 'vitest';
import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../../../tests/engine/full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { DEV_FLAGS_KEY } from '../../util/featureFlags.js';
import { SCHEDULE_STORE_KEY } from '../schedule/scheduleAdapter/constants.js';
import { ISRAETEL_BASELINES } from '../periodization/constants.js';
import { DB } from '../../db.js';

const MS_DAY = 86400000;
const COHORT_START = Date.UTC(2026, 0, 5); // Monday
const FREQ3_OFFSETS = [0, 3, 6];            // 3 evenly-spaced active days → the full-body week

// REAL Israetel landmarks (periodization/constants.js — not round numbers).
const CHEST_MEV = ISRAETEL_BASELINES.chest.MEV;   // 8
const BICEPS_MAV = ISRAETEL_BASELINES.biceps.MAV; // 14
const TRICEPS_MAV = ISRAETEL_BASELINES.triceps.MAV; // 12

// The grid personas (verbatim from the eval-grid exporter) whose arms week is all FULL-body:
//  - p7 lower-back disc injury → the hinge family is excluded → full-body days, chest stacks
//    2 presses/day (chest 15 in the brain-on grid).
//  - p2 intermediar/strength → full-body @3d, a milder chest 12 > arms.
const PERSONAS = {
  p7: { age: 58, sex: 'm', goal: 'forta', experience: 'intermediar', weight: 92, height: 179, pain: 'lowerBack' },
  p2: { age: 38, sex: 'm', goal: 'forta', experience: 'intermediar', weight: 78, height: 175 },
};

// The full focus-ON flag env (mirrors the focusSignature gate + the eval-grid brain-on path) so
// the swap runs in its real composition context. dp_arms_fullday_swap_v1 is toggled per arm.
const FOCUS_ON_FLAGS = [
  'dp_focus_policy_v1', 'dp_focus_contracts_v1', 'dp_week_ledger_v1', 'dp_split_rebalance_v1',
  'dp_latiso_dedup_v1', 'dp_biceps_guarantee_v1', 'dp_triceps_fullbody_guarantee_v1',
  'dp_lumbar_dedup_v1', 'dp_load_model_v1', 'dp_posterior_chain_floor_v1', 'dp_hamstring_floor_v1',
  'dp_arms_signature_v1', 'dp_arms_protect_majors_v1', 'dp_focus_lead_splits_v1',
  'dp_focus_lead_arms_nonul_v1', 'dp_lowcap_effective_freq_v1', 'dp_legcurl_guarantee_v1',
];

function setFlags(swapOn) {
  resetWorld();
  setPathAFlags(false);
  const o = {};
  for (const f of FLIPPED_FLAGS) o[f] = false;     // clean baseline (all FLIPPED off)
  for (const f of FOCUS_ON_FLAGS) o[f] = true;     // the real focus composition env
  o.dp_arms_fullday_swap_v1 = swapOn;              // the flag under test
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

function seedSchedule(offsets) {
  const days = ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'];
  for (const o of offsets) days[o] = 'training';
  localStorage.setItem(SCHEDULE_STORE_KEY, JSON.stringify({ state: { days }, version: 0 }));
}

/** Count chest-press PATTERNS (piept-primary tier-1 compounds) delivered weekly. */
function isChestPress(name) {
  const meta = getExerciseMetadata(name);
  return meta?.muscle_target_primary === 'piept' && (meta?.tier ?? 2) <= 1;
}

/** Compose a persona's arms full-body week and tally weekly delivered sets per group. */
async function composeWeek(personaId, swapOn, focus = 'arms') {
  setFlags(swapOn);
  seedSchedule(FREQ3_OFFSETS);
  const p = PERSONAS[personaId];
  if (p.pain) {
    DB.set('pain-cdl', [{ type: 'pain', region: 'lombar', intensity: 3, ts: COHORT_START - 2 * MS_DAY }]);
  }
  world.useOnboardingStore.setState({
    data: {
      ...p,
      frequency: '3',
      focusPreset: focus,
      focusPresetPickedAt: focus !== 'balanced' ? COHORT_START - 7 * MS_DAY : null,
    },
    completed: true,
    completedAt: COHORT_START,
  });
  let chest = 0;
  let biceps = 0;
  let triceps = 0;
  let total = 0;
  let chestPressSlots = 0;
  const clusters = [];
  for (const off of FREQ3_OFFSETS) {
    const plan = await world.composePlannedWorkoutToday(new Date(COHORT_START + off * MS_DAY));
    clusters.push(plan && plan.sessionType);
    for (const e of (plan && plan.exercises) || []) {
      const name = e.engineName || e.name;
      const g = getExerciseMetadata(name).muscle_target_primary;
      const sets = e.sets || 0;
      total += sets;
      if (g === 'piept') chest += sets;
      if (g === 'biceps') biceps += sets;
      if (g === 'triceps') triceps += sets;
      if (isChestPress(name)) chestPressSlots += 1;
    }
  }
  return { chest, biceps, triceps, arms: biceps + triceps, total, chestPressSlots, clusters };
}

describe('#ARMS FULL-DAY CHEST→ARM SWAP — full-body arms signature repair (full-path)', () => {
  it('p7 (lower-back disc) arms all-full week: OFF reproduces chest out-voluming the arms', async () => {
    const off = await composeWeek('p7', false);
    // The week is genuinely all-full-body (the disc injury reshapes to full days).
    expect(off.clusters.every((c) => c === 'FULL')).toBe(true);
    // OFF defect: chest stacks (>= 2 weekly chest-press slots) and OUT-VOLUMES each focus arm.
    expect(off.chestPressSlots).toBeGreaterThanOrEqual(2);
    expect(off.chest).toBeGreaterThan(off.biceps);
    expect(off.chest).toBeGreaterThan(off.triceps);
  });

  it('p7 arms: ON removes a redundant chest press, chest stays >= MEV, an arm now leads chest', async () => {
    const off = await composeWeek('p7', false);
    const on = await composeWeek('p7', true);
    // The swap removed at least one redundant weekly chest-press slot.
    expect(on.chestPressSlots).toBeLessThan(off.chestPressSlots);
    // Chest dropped (no longer out-volumes the arms) but stays AT/ABOVE its MEV (collateral-free).
    expect(on.chest).toBeLessThan(off.chest);
    expect(on.chest).toBeGreaterThanOrEqual(CHEST_MEV);
    // Arms are now the signature: at least one direct-arm group leads chest, and the direct-arm
    // weekly volume rose toward MAV (vs OFF where chest led both arms). triceps moves toward its
    // real MAV band (ISRAETEL triceps MAV 12) — at least at maintenance and rising.
    expect(on.triceps).toBeGreaterThanOrEqual(on.chest);
    expect(on.triceps).toBeGreaterThan(off.triceps);
    expect(on.triceps).toBeLessThanOrEqual(TRICEPS_MAV + 4); // toward MAV, not a runaway over-shoot
    // Sanity: the focus arms now lead chest (the inverted defect is repaired).
    expect(Math.max(on.biceps, on.triceps)).toBeGreaterThan(on.chest);
  });

  it('p2 (intermediar/strength) arms full-body @3d: ON reduces chest below the arms, chest >= MEV', async () => {
    const off = await composeWeek('p2', false);
    const on = await composeWeek('p2', true);
    expect(off.clusters.every((c) => c === 'FULL')).toBe(true);
    expect(off.chestPressSlots).toBeGreaterThanOrEqual(2);
    expect(off.chest).toBeGreaterThan(off.triceps); // OFF: chest out-volumes arms
    // ON: a redundant chest press removed, chest no longer out-volumes the arms, chest >= MEV.
    expect(on.chestPressSlots).toBeLessThan(off.chestPressSlots);
    expect(on.chest).toBeLessThan(off.chest);
    expect(on.chest).toBeGreaterThanOrEqual(CHEST_MEV);
    expect(Math.max(on.biceps, on.triceps)).toBeGreaterThanOrEqual(on.chest);
    // direct-arm volume stays within a sane band (no runaway over the real biceps MAV 14).
    expect(on.biceps).toBeLessThanOrEqual(BICEPS_MAV + 4);
  });

  it('the swap NEVER takes chest below its MEV (collateral-free donor guard)', async () => {
    for (const id of ['p7', 'p2']) {
      const on = await composeWeek(id, true);
      expect(on.chest, `${id} chest(${on.chest}) >= MEV(${CHEST_MEV})`).toBeGreaterThanOrEqual(CHEST_MEV);
    }
  });

  it('arms-focus UPPER-day (U/L split) path is UNTOUCHED — no double-firing with the focus-lead guarantee', async () => {
    // p2 arms @4d resolves to a pure UPPER/LOWER split (the focus-lead arm-slot guarantee owns the
    // upper day). The full-day swap is scoped cluster === 'full', so the U/L upper day is byte-
    // identical ON vs OFF.
    const off = await composeWeek4d('p2', false);
    const on = await composeWeek4d('p2', true);
    expect(off.clusters.some((c) => c === 'UPPER')).toBe(true);
    expect(on.chest).toBe(off.chest);
    expect(on.biceps).toBe(off.biceps);
    expect(on.triceps).toBe(off.triceps);
    expect(on.total).toBe(off.total);
  });

  it('NON-arms focus (balanced) is untouched — byte-identical ON vs OFF', async () => {
    const off = await composeWeek('p7', false, 'balanced');
    const on = await composeWeek('p7', true, 'balanced');
    expect(on.chest).toBe(off.chest);
    expect(on.biceps).toBe(off.biceps);
    expect(on.triceps).toBe(off.triceps);
    expect(on.total).toBe(off.total);
  });

  it('chest with only a single press/day (no removable surplus) is NOT swapped — chest unbroken', async () => {
    // p7 day 1 in the brain-on grid carries a SINGLE chest press (the other full days stack two).
    // The per-day >=2 gate means a single-press day is left untouched: across the week chest never
    // drops below MEV and at least one chest press always remains (the focus-policy minChestPress
    // requirement is preserved).
    const on = await composeWeek('p7', true);
    expect(on.chestPressSlots).toBeGreaterThanOrEqual(1); // never zeroes the chest press
    expect(on.chest).toBeGreaterThanOrEqual(CHEST_MEV);
  });
});

// p2 arms @4d → a pure UPPER/LOWER split (the existing focus-lead path), used to prove the
// full-day swap does NOT fire on the upper day (no double-firing).
const FREQ4_OFFSETS = [0, 2, 4, 6];
async function composeWeek4d(personaId, swapOn) {
  setFlags(swapOn);
  seedSchedule(FREQ4_OFFSETS);
  const p = PERSONAS[personaId];
  world.useOnboardingStore.setState({
    data: {
      ...p, frequency: '4', focusPreset: 'arms', focusPresetPickedAt: COHORT_START - 7 * MS_DAY,
    },
    completed: true, completedAt: COHORT_START,
  });
  let chest = 0; let biceps = 0; let triceps = 0; let total = 0; const clusters = [];
  for (const off of FREQ4_OFFSETS) {
    const plan = await world.composePlannedWorkoutToday(new Date(COHORT_START + off * MS_DAY));
    clusters.push(plan && plan.sessionType);
    for (const e of (plan && plan.exercises) || []) {
      const g = getExerciseMetadata(e.engineName || e.name).muscle_target_primary;
      const sets = e.sets || 0; total += sets;
      if (g === 'piept') chest += sets;
      if (g === 'biceps') biceps += sets;
      if (g === 'triceps') triceps += sets;
    }
  }
  return { chest, biceps, triceps, total, clusters };
}
