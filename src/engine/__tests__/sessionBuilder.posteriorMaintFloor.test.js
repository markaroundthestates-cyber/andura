/**
 * POSTERIOR MAINTENANCE FLOOR on masa/forta (cycle-21b north-star audit 2026-06-17).
 * On a masa/forta UPPER-biased (focus=upper → piept/spate/umeri emphasized) full-body week the
 * leg weights are zeroed, so the only session surplus is a 2nd FOCUS COMPOUND (a 2nd chest press).
 * dp_hamstring_floor_v1 + dp_posterior_chain_floor_v1 both seat a missing leg slot by displacing a
 * SURPLUS NON-focus / NON-leg isolation — which does NOT exist here — and both REFUSE to displace a
 * focus group's slot (it would lose its strict lead), so they ACCEPT THE GAP and BOTH hamstrings
 * AND glutes land at ZERO weekly (verified: masa/forta upper f3 hams=0 glutes=0, vs balanced
 * hams 2-3 / glutes 6-9). De-emphasis must mean MAINTENANCE (>= MEV), never zero, for a GROWTH goal.
 *
 * dp_posterior_maint_floor_v1 (default ON, masa/forta only) closes it: (1) the posterior floor
 * requires a GLUTE slot AND a HAMSTRING slot SEPARATELY (not hams∪glutes as one region); (2) BOTH
 * the posterior floor's seatLeg and the hamstring floor add a FINAL pass that — when no non-focus/
 * non-leg surplus exists at cap — displaces a REDUNDANT same-group COMPOUND occurrence (a 2nd chest
 * press, keeping that group >=1 slot so no major is orphaned, the upper REGION still leads) to seat
 * the leg maintenance slot. Net slots unchanged.
 *
 * PRODUCTION-SHAPED: drives the REAL compose path with the LIVE registry-default flags, toggling
 * ONLY dp_posterior_maint_floor_v1 for the A/B. The OFF arm forces it false (rest live default) so
 * the OFF baseline is the true orphan (hams 0). LEAN: weekly total slot count byte-identical ON vs
 * OFF. The upper REGION still leads legs. balanced is byte-identical ON vs OFF.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { world, resetWorld } from '../../../tests/engine/full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { activeWeekForFrequency } from '../schedule/scheduleAdapter/frequencySplit.js';
import { DEV_FLAGS_KEY } from '../../util/featureFlags.js';

const MS_DAY = 86400000;
const START = Date.UTC(2026, 0, 5); // Monday
const HAMS = 'picioare-hamstrings';
const GLUTES = 'fese';
const QUAD = 'picioare-quads';
const CHEST = 'piept';
const BACK = 'spate';
const SH = 'umeri';
const HAMS_MEV = 6; // ISRAETEL_BASELINES.hamstrings.MEV

function activeOffsets(freq) {
  const week = activeWeekForFrequency(freq);
  const out = [];
  for (let i = 0; i < week.length; i++) if (week[i]) out.push(i);
  return out;
}

// floorOff=true forces ONLY dp_posterior_maint_floor_v1 OFF (rest live default).
async function composeWeek(data, floorOff) {
  resetWorld();
  try {
    if (floorOff) localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ dp_posterior_maint_floor_v1: false }));
    else localStorage.removeItem(DEV_FLAGS_KEY);
  } catch { /* jsdom always has localStorage */ }
  world.useOnboardingStore.setState({
    data: { ...data, focusPresetPickedAt: data.focusPreset !== 'balanced' ? START - 7 * MS_DAY : null },
    completed: true,
    completedAt: START,
  });
  const sets = {};
  let total = 0;
  for (const off of activeOffsets(data.frequency)) {
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(new Date(START + off * MS_DAY)); }
    catch { plan = null; }
    if (!plan || plan.error) continue;
    for (const e of plan.exercises || []) {
      const g = getExerciseMetadata(e.engineName || e.name)?.muscle_target_primary;
      if (!g) continue;
      total += 1;
      sets[g] = (sets[g] || 0) + (e.sets || 0);
    }
  }
  return { sets, total };
}

const upperFocus = (over) => ({
  age: 28, sex: 'm', goal: 'masa', experience: 'avansat', weight: 80, height: 180,
  focusPreset: 'upper', frequency: '3', ...over,
});

describe('posterior maintenance floor — masa/forta upper-focus full-body (was hams=0)', () => {
  beforeEach(() => { resetWorld(); });

  for (const goal of ['masa', 'forta']) {
    it(`${goal} upper-focus freq-3 ON → hamstrings >= MEV ${HAMS_MEV} (not 0); total slots unchanged; focus region leads`, async () => {
      const off = await composeWeek(upperFocus({ goal }), true);
      const on = await composeWeek(upperFocus({ goal }), false);
      // The canonical orphan: OFF leaves hams at 0 on the upper-focus masa/forta week.
      expect(off.sets[HAMS] || 0, `${goal} OFF hams=${off.sets[HAMS] || 0} (the orphan baseline)`).toBe(0);
      // ON maintains hamstrings at >= MEV.
      expect(on.sets[HAMS] || 0, `${goal} ON hams=${on.sets[HAMS] || 0}`).toBeGreaterThanOrEqual(HAMS_MEV);
      // Glutes are also maintained (not zero).
      expect(on.sets[GLUTES] || 0, `${goal} ON glutes=${on.sets[GLUTES] || 0}`).toBeGreaterThan(0);
      // LEAN: a SWAP, never an add — weekly total slot count unchanged.
      expect(on.total, `${goal} total ON=${on.total} OFF=${off.total}`).toBe(off.total);
      // The UPPER focus REGION (chest+back+shoulders) still LEADS the leg region — the
      // maintenance floor never inverts the focus.
      const upperRegion = (on.sets[CHEST] || 0) + (on.sets[BACK] || 0) + (on.sets[SH] || 0);
      const legRegion = (on.sets[QUAD] || 0) + (on.sets[HAMS] || 0) + (on.sets[GLUTES] || 0);
      expect(upperRegion, `upperRegion=${upperRegion} legRegion=${legRegion}`).toBeGreaterThan(legRegion);
    });
  }
});

describe('posterior maintenance floor — balanced UNCHANGED (byte-identical ON vs OFF)', () => {
  beforeEach(() => { resetWorld(); });

  for (const f of ['3', '4']) {
    it(`masa balanced freq-${f} → hams/glutes/total byte-identical ON vs OFF`, async () => {
      const off = await composeWeek(upperFocus({ goal: 'masa', focusPreset: 'balanced', frequency: f }), true);
      const on = await composeWeek(upperFocus({ goal: 'masa', focusPreset: 'balanced', frequency: f }), false);
      expect(on.sets[HAMS] || 0, `bal f${f} hams ON=${on.sets[HAMS] || 0} OFF=${off.sets[HAMS] || 0}`).toBe(off.sets[HAMS] || 0);
      expect(on.sets[GLUTES] || 0, `bal f${f} glutes ON=${on.sets[GLUTES] || 0} OFF=${off.sets[GLUTES] || 0}`).toBe(off.sets[GLUTES] || 0);
      expect(on.total, `bal f${f} total ON=${on.total} OFF=${off.total}`).toBe(off.total);
    });
  }

  it('non-growth (mentenanta) upper-focus → NOT forced (byte-identical ON vs OFF)', async () => {
    const off = await composeWeek(upperFocus({ goal: 'mentenanta' }), true);
    const on = await composeWeek(upperFocus({ goal: 'mentenanta' }), false);
    expect(on.sets[HAMS] || 0, `mentenanta hams ON=${on.sets[HAMS] || 0} OFF=${off.sets[HAMS] || 0}`).toBe(off.sets[HAMS] || 0);
    expect(on.total, `mentenanta total ON=${on.total} OFF=${off.total}`).toBe(off.total);
  });
});
