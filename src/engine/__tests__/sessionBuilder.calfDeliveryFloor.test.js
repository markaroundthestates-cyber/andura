/**
 * CALF DELIVERY FLOOR (cycle-21b north-star audit 2026-06-17). The calf weekly BUDGET is
 * already MEV-floored upstream (applyMaintenanceFloor lists gambe in MAJOR_MUSCLES_RO), but
 * DELIVERY ignored it for a TRAINED lifter: on a balanced FORTA freq-4/5 U/L or PPL week NO
 * calf slot lands at all (calves 0 sets/wk — the 0.70 goal modifier + the low 0.15 leg-cluster
 * calf weight round calves out → gambe never wins a slot, and what the floor seats was dropped
 * by the tight-time tail-first trim), and on a balanced MASS freq-4/5 week each leg day seats
 * only ONE calf iso (clamped to 3 sets) so 2 leg days deliver ~6 — BELOW MEV 8 AND non-monotonic
 * vs the freq-3 full-body week's 9. Calves have ~no indirect coverage (no exercise tags gambe as
 * a secondary), so a missed slot is a TRUE orphan.
 *
 * dp_calf_delivery_floor_v1 (default ON) honors the floored budget at DELIVERY on a leg-training
 * cluster (full/lower/legs): >=1 calf slot whenever the floored calf budget > 0, AND a 2nd calf
 * slot when the single-slot weekly projection (calfFreq x the isolation set ceiling) is below MEV
 * — each via a LENGTH-STABLE SWAP of a redundant 2nd/3rd quad/glute/ham ISOLATION (total slots
 * unchanged), and a compose-seam drop-guard holds the calf through the time-trim.
 *
 * PRODUCTION-SHAPED: drives the REAL compose path (world.composePlannedWorkoutToday) over a
 * persona's training week with the LIVE registry-default flags, toggling ONLY this flag for the
 * A/B. The OFF arm forces dp_calf_delivery_floor_v1:false (rest live default) so the OFF baseline
 * is the true defect (forta calves 0 / mass calves 6). LEAN is asserted: the weekly total slot
 * count is byte-identical ON vs OFF. CONTROL: a persona already meeting calf MEV (mass freq-3
 * full-body, 9) is byte-identical ON vs OFF.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { world, resetWorld } from '../../../tests/engine/full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { activeWeekForFrequency } from '../schedule/scheduleAdapter/frequencySplit.js';
import { DEV_FLAGS_KEY } from '../../util/featureFlags.js';

const MS_DAY = 86400000;
const START = Date.UTC(2026, 0, 5); // Monday
const CALF = 'gambe';
const CALF_MEV = 8; // ISRAETEL_BASELINES.calves.MEV

function activeOffsets(freq) {
  const week = activeWeekForFrequency(freq);
  const out = [];
  for (let i = 0; i < week.length; i++) if (week[i]) out.push(i);
  return out;
}

// Compose a persona's real week. floorOff=true forces ONLY dp_calf_delivery_floor_v1 OFF (the
// rest live default); floorOff=false clears the override (live default = flag ON). Returns the
// weekly calf SET total + the TOTAL slot count across the week.
async function composeWeek(data, floorOff) {
  resetWorld();
  try {
    if (floorOff) localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ dp_calf_delivery_floor_v1: false }));
    else localStorage.removeItem(DEV_FLAGS_KEY);
  } catch { /* jsdom always has localStorage */ }
  world.useOnboardingStore.setState({
    data: { ...data, focusPresetPickedAt: null },
    completed: true,
    completedAt: START,
  });
  let total = 0;
  let calf = 0;
  for (const off of activeOffsets(data.frequency)) {
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(new Date(START + off * MS_DAY)); }
    catch { plan = null; }
    if (!plan || plan.error) continue;
    for (const e of plan.exercises || []) {
      const g = getExerciseMetadata(e.engineName || e.name)?.muscle_target_primary;
      if (!g) continue;
      total += 1;
      if (g === CALF) calf += e.sets || 0;
    }
  }
  return { calf, total };
}

const persona = (over) => ({
  age: 28, sex: 'm', goal: 'masa', experience: 'avansat', weight: 80, height: 180,
  focusPreset: 'balanced', frequency: '4', ...over,
});

describe('calf delivery floor — FORTA (was 0 sets/wk on freq 4-5)', () => {
  beforeEach(() => { resetWorld(); });

  for (const f of ['2', '3', '4', '5']) {
    it(`forta balanced freq-${f} ON → calves train every week (>=1 slot, ~MEV); total slots unchanged`, async () => {
      const off = await composeWeek(persona({ goal: 'forta', frequency: f }), true);
      const on = await composeWeek(persona({ goal: 'forta', frequency: f }), false);
      // ON puts calves on the week (the orphan is closed at every frequency).
      expect(on.calf, `forta f${f} calf ON=${on.calf} OFF=${off.calf}`).toBeGreaterThan(0);
      // The floor never REMOVES calf volume.
      expect(on.calf).toBeGreaterThanOrEqual(off.calf);
      // LEAN: a SWAP, never an add — the weekly total slot count is unchanged.
      expect(on.total, `forta f${f} total ON=${on.total} OFF=${off.total}`).toBe(off.total);
    });
  }

  it('forta freq-4/5 is the canonical orphan baseline (OFF calves 0)', async () => {
    const off4 = await composeWeek(persona({ goal: 'forta', frequency: '4' }), true);
    const off5 = await composeWeek(persona({ goal: 'forta', frequency: '5' }), true);
    expect(off4.calf, `OFF forta f4 calf=${off4.calf}`).toBe(0);
    expect(off5.calf, `OFF forta f5 calf=${off5.calf}`).toBe(0);
  });
});

describe('calf delivery floor — MASS (was below MEV + non-monotonic on freq 4-5)', () => {
  beforeEach(() => { resetWorld(); });

  it('mass balanced freq-4 ON → calves >= MEV 8 and >= the freq-3 value (monotonic); total unchanged', async () => {
    const f3 = await composeWeek(persona({ goal: 'masa', frequency: '3' }), false);
    const off = await composeWeek(persona({ goal: 'masa', frequency: '4' }), true);
    const on = await composeWeek(persona({ goal: 'masa', frequency: '4' }), false);
    expect(off.calf, `OFF mass f4 calf=${off.calf} (the below-MEV baseline)`).toBeLessThan(CALF_MEV);
    expect(on.calf, `ON mass f4 calf=${on.calf}`).toBeGreaterThanOrEqual(CALF_MEV);
    expect(on.calf, `ON mass f4 ${on.calf} must be >= f3 ${f3.calf} (monotonic)`).toBeGreaterThanOrEqual(f3.calf);
    expect(on.total, `total ON=${on.total} OFF=${off.total}`).toBe(off.total);
  });

  it('mass balanced freq-5 ON → calves >= MEV 8 and >= the freq-3 value (monotonic); total unchanged', async () => {
    const f3 = await composeWeek(persona({ goal: 'masa', frequency: '3' }), false);
    const off = await composeWeek(persona({ goal: 'masa', frequency: '5' }), true);
    const on = await composeWeek(persona({ goal: 'masa', frequency: '5' }), false);
    expect(on.calf, `ON mass f5 calf=${on.calf}`).toBeGreaterThanOrEqual(CALF_MEV);
    expect(on.calf, `ON mass f5 ${on.calf} must be >= f3 ${f3.calf} (monotonic)`).toBeGreaterThanOrEqual(f3.calf);
    expect(on.total, `total ON=${on.total} OFF=${off.total}`).toBe(off.total);
  });
});

describe('calf delivery floor — CONTROL (a persona already meeting calf MEV is unchanged)', () => {
  beforeEach(() => { resetWorld(); });

  it('mass freq-3 full-body (calves already 9 >= MEV) → byte-identical ON vs OFF', async () => {
    const off = await composeWeek(persona({ goal: 'masa', frequency: '3' }), true);
    const on = await composeWeek(persona({ goal: 'masa', frequency: '3' }), false);
    // Already at/above MEV → the floor adds nothing: calf + total identical.
    expect(off.calf, `mass f3 OFF calf=${off.calf} should already be >= MEV`).toBeGreaterThanOrEqual(CALF_MEV);
    expect(on.calf, `mass f3 ON=${on.calf} OFF=${off.calf}`).toBe(off.calf);
    expect(on.total, `mass f3 total ON=${on.total} OFF=${off.total}`).toBe(off.total);
  });
});
