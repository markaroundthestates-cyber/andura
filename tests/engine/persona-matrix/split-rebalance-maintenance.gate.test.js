// W-Split GAP 4 — LOWER-BODY MAINTENANCE GUARANTEE through the REAL compose
// path (dp_split_rebalance_v1). Regression lock for the clean-re-audit finding:
// Gigel (2 days/week, focus=UPPER) composes a full/full split (correct minimal-
// freq full-body), but the UPPER focus de-emphasized the lower body so hard that
// the full-body day slot-starved the posterior chain to ZERO (hams+glutes+calves
// = 0, legs total 14→4). The slot-side guarantee (ctx.maintenanceFloorGuarantee)
// closes that: the lower body is MAINTAINED, never abandoned.
//
// CONTRACT UPDATED 2026-06-11 eve (Daniel-approved focus fine-tune, option 1:
// "focus minimums must win over full lower preservation for non-lower focuses",
// + the review's "keep 1-2 lower slots/session" at 2-3d).
// On a 1-3-day full-body FOCUS week the LEG REGION (quads+hams+glutes) yields its
// SURPLUS slots to the focus's HIGH minimums (width/curls), down to a REGION
// floor (1 slot/session at 1 day, 2 at 2-3 days). So the per-GROUP "never zero"
// of 2026-06-10 is consciously relaxed to REGION + COVERAGE for focus users:
//   (a) the leg REGION keeps a real weekly maintenance dose (≥ 8 sets at 2d);
//   (b) ALL THREE leg majors (quads/hams/glutes) stay COVERED — a slot trains the
//       major directly OR a picked exercise lists it as a SECONDARY target. The
//       2-slot floor is filled with COMPOUNDS, not two isolations: a coverage-
//       preserving swap (Leg Curl[hams] -> Glute Drive[fese+hams]) lets two slots
//       cover all three majors, so no leg major is silently abandoned.
//   (c) CALVES (gambe) are the LOWEST-priority lower muscle: the agreed budget is
//       "1-2 LOWER slots/session", spent on the leg REGION, so on the crunch day
//       (1-3d focus, ~8-slot full body) calves may YIELD to the focus — it is NOT
//       a region major. Calves keep their per-group guarantee in balanced / 4+ day
//       weeks (no crunch). Asserted as a known yield here, not a guarantee.
// balanced (no focus) and leg-emphasized focuses never collapse at all.

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
// WEEKLY sets (Big-11 RO keyed) + the picked exercise names (for the coverage check).
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
  const names = [];
  for (const off of offsets) {
    const now = new Date(n0 + off * MS_DAY);
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(now); } catch { plan = null; }
    if (!plan || plan.error) continue;
    for (const e of plan.exercises || []) {
      const name = e.engineName || e.name;
      const g = getExerciseMetadata(name).muscle_target_primary;
      weekly[g] = (weekly[g] || 0) + (e.sets || 0);
      names.push(name);
    }
  }
  return { weekly, names };
}

/** A group is COVERED when some picked exercise trains it as primary or secondary. */
function covered(group, weekly, names) {
  if ((weekly[group] || 0) > 0) return true;
  return names.some((n) => {
    const sec = getExerciseMetadata(n)?.muscle_target_secondary;
    return Array.isArray(sec) && sec.includes(group);
  });
}

describe('W-Split maintenance floor — Gigel (2d, UPPER focus) lower body maintained (region + coverage)', () => {
  const gigel = PERSONAS.find((p) => p.id === 7);

  it('flag ON: leg REGION ≥ 8 weekly sets, all 3 leg majors covered (compound floor)', async () => {
    const { weekly: on, names } = await weeklyVolume(gigel, [...ANDURA_ON_FLAGS, 'dp_split_rebalance_v1']);
    // (a) the REGION carries a real maintenance dose — the 2026-06-10 regression
    // was legs total 14→4 with three groups at ZERO; the region floor (2 slots/
    // session × 2 days) keeps ≥ 8 weekly sets even while the focus wins the
    // marginal slot.
    const legs = (on['picioare-quads'] || 0) + (on['picioare-hamstrings'] || 0) + (on.fese || 0);
    expect(legs, `legs region total (weekly=${JSON.stringify(on)})`).toBeGreaterThanOrEqual(8);
    // (b) NO leg major is silently ABANDONED: each is trained directly OR covered
    // by a picked exercise's secondary. Two isolations can't cover three majors,
    // so the floor is filled with COMPOUNDS (Glute Drive covers fese+hams) — this
    // asserts the coverage-preserving swap actually fires.
    expect(covered('picioare-quads', on, names), `quads covered (weekly=${JSON.stringify(on)})`).toBe(true);
    expect(covered('picioare-hamstrings', on, names), `hams covered (weekly=${JSON.stringify(on)})`).toBe(true);
    expect(covered('fese', on, names), `glutes covered (weekly=${JSON.stringify(on)})`).toBe(true);
    // (c) calves are the lowest-priority lower muscle and are NOT in the region; on
    // the 2-3d focus crunch the agreed 1-2 lower slots go to the region, so calves
    // may yield to the focus (per-group guarantee holds in balanced / 4+ weeks).
    // Documented yield — no assertion that it is non-zero here.
  }, 120000);
});
