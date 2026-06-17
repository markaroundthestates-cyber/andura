/**
 * FORTA full-body POSTERIOR BALANCE / HINGE (cycle-21b north-star audit 2026-06-17).
 * A balanced full-body STRENGTH (forta) freq-3 program under-doses the posterior chain: quads land
 * 3 SQUAT slots (~12 weekly) while hamstrings get ONE machine LEG CURL iso (~2 weekly) and there is
 * NO hip-HINGE compound (RDL/deadlift/GHR) anywhere — only quad-dominant machine squats + a lone
 * curl + glute machines. The posterior + hamstring floors only fire when a group is at ZERO, so a
 * below-MEV hams with a single iso slips through. An elite strength coach never builds a leg day on
 * quad-dominant squats with no hinge.
 *
 * dp_forta_posterior_balance_v1 (default ON, FORTA goal only) closes the GAP an elite coach would:
 * when no hams HINGE is present on a forta leg-training day, it SWAPS in an RDL/GHR hinge (hams
 * primary) by displacing — in priority — a redundant 2nd quad SQUAT, else the lone hams LEG-CURL iso
 * (upgrade iso→compound), else a glute slot the hinge's secondary keeps covered. Count-neutral
 * (total slots unchanged); quads keep >= MEV.
 *
 * LEAN LIMIT (documented, honest): on a 3-day full-body forta week there are only ~2 posterior slots
 * and HAMSTRINGS and GLUTES compete for them (the library's RDL credits BACK secondary, not glutes;
 * the squats credit nothing) — so hamstrings PRIMARY cannot reach a full MEV 6 without dropping
 * glutes below MEV or ADDING a slot (both non-LEAN, refused). The fix therefore guarantees the
 * missing HINGE + improves the quad:posterior ratio + lifts hams above its OFF baseline WITHOUT
 * regressing glutes, the LEAN-achievable elite-coach improvement. At freq 4-5 (a dedicated LOWER/
 * LEGS day already carries an RDL) the program is byte-identical.
 *
 * PRODUCTION-SHAPED: drives the REAL compose path with the LIVE registry-default flags, toggling
 * ONLY dp_forta_posterior_balance_v1 for the A/B.
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
const GLUTES_MEV = 6; // ISRAETEL_BASELINES.glutes.MEV
const HINGE_RE = /romanian|rdl|deadlift|good[- ]?morning|glute[- ]?ham|nordic/i;

function activeOffsets(freq) {
  const week = activeWeekForFrequency(freq);
  const out = [];
  for (let i = 0; i < week.length; i++) if (week[i]) out.push(i);
  return out;
}

// floorOff=true forces ONLY dp_forta_posterior_balance_v1 OFF (rest live default).
async function composeWeek(data, floorOff) {
  resetWorld();
  try {
    if (floorOff) localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ dp_forta_posterior_balance_v1: false }));
    else localStorage.removeItem(DEV_FLAGS_KEY);
  } catch { /* jsdom always has localStorage */ }
  world.useOnboardingStore.setState({
    data: { ...data, focusPresetPickedAt: null },
    completed: true,
    completedAt: START,
  });
  const sets = {};
  let total = 0;
  let hinge = false;
  for (const off of activeOffsets(data.frequency)) {
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(new Date(START + off * MS_DAY)); }
    catch { plan = null; }
    if (!plan || plan.error) continue;
    for (const e of plan.exercises || []) {
      const name = e.engineName || e.name;
      const g = getExerciseMetadata(name)?.muscle_target_primary;
      if (!g) continue;
      total += 1;
      sets[g] = (sets[g] || 0) + (e.sets || 0);
      if (HINGE_RE.test(name)) hinge = true;
    }
  }
  return { sets, total, hinge };
}

const forta = (over) => ({
  age: 28, sex: 'm', goal: 'forta', experience: 'avansat', weight: 80, height: 180,
  focusPreset: 'balanced', frequency: '3', ...over,
});

describe('forta posterior balance — freq-3 full-body (was no hinge, hams under-dosed)', () => {
  beforeEach(() => { resetWorld(); });

  it('forta balanced freq-3 ON → a HINGE is present (was none); hams up; glutes NOT regressed; quad:posterior ratio improved; slots unchanged', async () => {
    const off = await composeWeek(forta(), true);
    const on = await composeWeek(forta(), false);

    // The canonical defect: OFF has NO hip-hinge anywhere on the forta f3 full-body week.
    expect(off.hinge, 'OFF forta f3 should have NO hinge (the defect baseline)').toBe(false);
    // ON guarantees the elite-coach hinge.
    expect(on.hinge, 'ON forta f3 should land a hip-hinge (RDL/GHR)').toBe(true);

    // Hamstrings rise above the OFF baseline (the lone leg-curl is upgraded to a hinge).
    expect(on.sets[HAMS] || 0, `ON hams=${on.sets[HAMS] || 0} OFF=${off.sets[HAMS] || 0}`)
      .toBeGreaterThan(off.sets[HAMS] || 0);

    // GLUTES are NOT regressed (the LEAN limit — the fix never drops glutes below their OFF
    // value / MEV to chase hams).
    expect(on.sets[GLUTES] || 0, `ON glutes=${on.sets[GLUTES] || 0} OFF=${off.sets[GLUTES] || 0}`)
      .toBeGreaterThanOrEqual(Math.min(off.sets[GLUTES] || 0, GLUTES_MEV));
    expect(on.sets[GLUTES] || 0).toBeGreaterThanOrEqual(GLUTES_MEV);

    // The quad:posterior ratio improves (quads no longer out-deliver the posterior chain as
    // hard) — quads down OR posterior up, ratio strictly better.
    const quadOff = off.sets[QUAD] || 0;
    const postOff = (off.sets[HAMS] || 0) + (off.sets[GLUTES] || 0);
    const quadOn = on.sets[QUAD] || 0;
    const postOn = (on.sets[HAMS] || 0) + (on.sets[GLUTES] || 0);
    expect(quadOn / Math.max(1, postOn), `ratio ON=${(quadOn / postOn).toFixed(2)} OFF=${(quadOff / postOff).toFixed(2)}`)
      .toBeLessThan(quadOff / Math.max(1, postOff));

    // LEAN: a SWAP, never an add — weekly total slot count unchanged.
    expect(on.total, `total ON=${on.total} OFF=${off.total}`).toBe(off.total);

    // Quads stay at/above MEV (the swap never guts quads).
    expect(quadOn, `quads ON=${quadOn}`).toBeGreaterThanOrEqual(8);
  });
});

describe('forta posterior balance — gating (non-forta + freq 4/5 byte-identical)', () => {
  beforeEach(() => { resetWorld(); });

  it('MASA balanced freq-3 → NOT forced (byte-identical ON vs OFF)', async () => {
    const off = await composeWeek(forta({ goal: 'masa' }), true);
    const on = await composeWeek(forta({ goal: 'masa' }), false);
    expect(on.sets[HAMS] || 0, `masa hams ON=${on.sets[HAMS] || 0} OFF=${off.sets[HAMS] || 0}`).toBe(off.sets[HAMS] || 0);
    expect(on.sets[QUAD] || 0).toBe(off.sets[QUAD] || 0);
    expect(on.total).toBe(off.total);
  });

  for (const f of ['4', '5']) {
    it(`forta balanced freq-${f} (a dedicated LOWER/LEGS day already carries a hinge) → byte-identical ON vs OFF`, async () => {
      const off = await composeWeek(forta({ frequency: f }), true);
      const on = await composeWeek(forta({ frequency: f }), false);
      expect(off.hinge, `forta f${f} OFF already has a hinge`).toBe(true);
      expect(on.sets[HAMS] || 0, `forta f${f} hams ON=${on.sets[HAMS] || 0} OFF=${off.sets[HAMS] || 0}`).toBe(off.sets[HAMS] || 0);
      expect(on.total).toBe(off.total);
    });
  }
});
