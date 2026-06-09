// W-Split GAP 4 — MAJOR-MUSCLE MAINTENANCE GUARANTEE through the REAL compose
// path (dp_split_rebalance_v1). Regression lock for the clean-re-audit finding:
// Gigel (2 days/week, focus=UPPER) composes a full/full split (correct minimal-
// freq full-body), but the UPPER focus de-emphasized the lower body so hard that
// the full-body day slot-starved the posterior chain to ZERO (hams+glutes+calves
// = 0, legs total 14→4). The weekly maintenance floor (applyMaintenanceFloor)
// guarantees ≥ MEV in the BUDGET, but the session is slot-limited, so a major
// muscle could be dropped entirely from the day before the floored budget ever
// became an exercise. The slot-side guarantee (ctx.maintenanceFloorGuarantee)
// closes that: every MAJOR muscle the cluster trains keeps ≥ 1 slot → ≥ its
// MEV-derived set band. A de-emphasized region is MAINTAINED, never zeroed.

import { describe, it, expect } from 'vitest';
import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../../../src/engine/exerciseLibrary.js';
import { DEV_FLAGS_KEY } from '../../../src/util/featureFlags.js';
import { ACTIVE_DAYS } from './pm-run.js';
import { PERSONAS, ANDURA_ON_FLAGS, MS_DAY, COHORT_START } from './pm-personas.js';

function setFlags(ids) {
  const o = {};
  for (const f of FLIPPED_FLAGS) o[f] = false;
  for (const f of ids) o[f] = true;
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

// Run a persona's active week through the real compose path; return per-group
// WEEKLY sets (Big-11 RO keyed) aggregated across the trained days.
async function weeklyVolume(persona, flags) {
  resetWorld();
  setPathAFlags(false);
  setFlags(flags);
  const n0 = COHORT_START;
  world.useOnboardingStore.setState({
    data: {
      ...persona.data,
      focusPresetPickedAt:
        persona.data.focusPreset && persona.data.focusPreset !== 'balanced' ? n0 - 7 * MS_DAY : null,
    },
    completed: true,
    completedAt: n0,
  });
  const offsets = ACTIVE_DAYS[persona.data.frequency] || ACTIVE_DAYS['4'];
  const weekly = {};
  for (const off of offsets) {
    const now = new Date(n0 + off * MS_DAY);
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(now); } catch { plan = null; }
    if (!plan || plan.error) continue;
    for (const e of plan.exercises || []) {
      const g = getExerciseMetadata(e.engineName || e.name).muscle_target_primary;
      weekly[g] = (weekly[g] || 0) + (e.sets || 0);
    }
  }
  return weekly;
}

describe('W-Split maintenance floor — Gigel (2d, UPPER focus) posterior chain ≥ MEV', () => {
  const gigel = PERSONAS.find((p) => p.id === 7);

  it('flag ON: hams, glutes, calves are all NON-ZERO (de-emphasis = maintenance, not zero)', async () => {
    const on = await weeklyVolume(gigel, [...ANDURA_ON_FLAGS, 'dp_split_rebalance_v1']);
    // The regression was hams/glutes/calves = 0. Each major posterior-chain muscle
    // must now carry at least one maintenance dose on the full-body day.
    expect(on['picioare-hamstrings'] || 0, `hams (weekly=${JSON.stringify(on)})`).toBeGreaterThan(0);
    expect(on.fese || 0, `glutes (weekly=${JSON.stringify(on)})`).toBeGreaterThan(0);
    expect(on.gambe || 0, `calves (weekly=${JSON.stringify(on)})`).toBeGreaterThan(0);
    // legs no longer collapse to ~4 — the whole lower body is maintained.
    const legs = (on['picioare-quads'] || 0) + (on['picioare-hamstrings'] || 0) + (on.fese || 0);
    expect(legs, `legs total (weekly=${JSON.stringify(on)})`).toBeGreaterThanOrEqual(12);
  }, 120000);
});
