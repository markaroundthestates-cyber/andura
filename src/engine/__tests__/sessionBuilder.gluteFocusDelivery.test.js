/**
 * GLUTE-FOCUS DELIVERY (cycle-21b north-star audit 2026-06-17). On a LOWER focus, fese (glutes)
 * is the PRIMARY emphasized group (FOCUS_PRESETS.lower.emphasize[0]) and applyFocusBias correctly
 * RAISES the glute weekly BUDGET (12 → 14). But DELIVERY inverts it: glutes get ~6 sets / 2 slots
 * (~43% of the 14 budget — the LOWEST of the lower region) while hamstrings OVER-deliver at ~14 /
 * 5 slots and quads ~12 / 4 — the focus CUTS its own #1 muscle. Root: the hamstring floor's
 * SURPLUS_LEG_PREFERENCE walks fese FIRST as the slot donor, and the leg-day allocation never
 * lifts glutes to lead.
 *
 * dp_glute_focus_delivery_v1 (default ON, fese-as-emphasis[0] only): (1) REMOVES fese from the
 * hamstring floor's SURPLUS_LEG_PREFERENCE (a glute slot is never robbed — donate from quads
 * only); (2) on a leg day where glutes does NOT lead the lower region, SWAPS a redundant
 * over-slotted hams/quad isolation for a glute so glutes LEADS (the volume leader of the lower
 * region, >= its raised budget). Count-neutral.
 *
 * PRODUCTION-SHAPED: drives the REAL compose path with the LIVE registry-default flags, toggling
 * ONLY dp_glute_focus_delivery_v1 for the A/B. The OFF arm is the defect (glutes halved, not the
 * leader). LEAN: weekly total slot count byte-identical ON vs OFF. balanced byte-identical.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { world, resetWorld } from '../../../tests/engine/full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { activeWeekForFrequency } from '../schedule/scheduleAdapter/frequencySplit.js';
import { DEV_FLAGS_KEY } from '../../util/featureFlags.js';

const MS_DAY = 86400000;
const START = Date.UTC(2026, 0, 5); // Monday
const GLUTES = 'fese';
const QUAD = 'picioare-quads';
const HAMS = 'picioare-hamstrings';
const GLUTES_RAISED_BUDGET = 14; // applyFocusBias raises glutes 12 → 14 on a lower focus

function activeOffsets(freq) {
  const week = activeWeekForFrequency(freq);
  const out = [];
  for (let i = 0; i < week.length; i++) if (week[i]) out.push(i);
  return out;
}

// floorOff=true forces ONLY dp_glute_focus_delivery_v1 OFF (rest live default).
async function composeWeek(data, floorOff) {
  resetWorld();
  try {
    if (floorOff) localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ dp_glute_focus_delivery_v1: false }));
    else localStorage.removeItem(DEV_FLAGS_KEY);
  } catch { /* jsdom always has localStorage */ }
  world.useOnboardingStore.setState({
    data: { ...data, focusPresetPickedAt: data.focusPreset !== 'balanced' ? START - 7 * MS_DAY : null },
    completed: true,
    completedAt: START,
  });
  const sets = {};
  const slots = {};
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
      slots[g] = (slots[g] || 0) + 1;
    }
  }
  return { sets, slots, total };
}

const lower = (over) => ({
  age: 30, sex: 'f', goal: 'masa', experience: 'avansat', weight: 70, height: 168,
  focusPreset: 'lower', frequency: '4', ...over,
});

describe('glute focus delivery — LOWER focus must RAISE glutes (was halved, the region tail)', () => {
  beforeEach(() => { resetWorld(); });

  for (const exp of ['intermediar', 'avansat']) {
    it(`${exp} lower focus 4d ON → glutes LEAD the lower region (>= balanced, >= raised budget); not halved; total slots unchanged`, async () => {
      const off = await composeWeek(lower({ experience: exp }), true);
      const on = await composeWeek(lower({ experience: exp }), false);
      const bal = await composeWeek(lower({ experience: exp, focusPreset: 'balanced' }), false);

      // ON: glutes are RAISED — at least the balanced glute dose AND >= their raised budget.
      expect(on.sets[GLUTES] || 0, `ON glutes=${on.sets[GLUTES] || 0} bal=${bal.sets[GLUTES] || 0}`)
        .toBeGreaterThanOrEqual(bal.sets[GLUTES] || 0);
      expect(on.sets[GLUTES] || 0, `ON glutes=${on.sets[GLUTES] || 0} raisedBudget=${GLUTES_RAISED_BUDGET}`)
        .toBeGreaterThanOrEqual(GLUTES_RAISED_BUDGET);

      // ON: glutes LEAD the lower region on SLOTS (the focus muscle is the leader, not the tail).
      expect(on.slots[GLUTES] || 0, `glute slots=${on.slots[GLUTES] || 0} quad=${on.slots[QUAD] || 0} hams=${on.slots[HAMS] || 0}`)
        .toBeGreaterThan(on.slots[QUAD] || 0);
      expect(on.slots[GLUTES] || 0).toBeGreaterThan(on.slots[HAMS] || 0);

      // The fix RAISES glutes vs the OFF (halved) baseline.
      expect(on.sets[GLUTES] || 0, `ON=${on.sets[GLUTES] || 0} OFF=${off.sets[GLUTES] || 0}`)
        .toBeGreaterThan(off.sets[GLUTES] || 0);

      // LEAN: a SWAP, never an add — weekly total slot count unchanged.
      expect(on.total, `total ON=${on.total} OFF=${off.total}`).toBe(off.total);
    });
  }
});

describe('glute focus delivery — balanced + non-glute-focus UNCHANGED', () => {
  beforeEach(() => { resetWorld(); });

  it('balanced 4d → glutes/quads/hams/total byte-identical ON vs OFF', async () => {
    const off = await composeWeek(lower({ focusPreset: 'balanced' }), true);
    const on = await composeWeek(lower({ focusPreset: 'balanced' }), false);
    expect(on.sets[GLUTES] || 0, `glutes ON=${on.sets[GLUTES] || 0} OFF=${off.sets[GLUTES] || 0}`).toBe(off.sets[GLUTES] || 0);
    expect(on.sets[QUAD] || 0).toBe(off.sets[QUAD] || 0);
    expect(on.sets[HAMS] || 0).toBe(off.sets[HAMS] || 0);
    expect(on.total).toBe(off.total);
  });

  it('v-taper focus (fese NOT emphasis[0]) → byte-identical ON vs OFF', async () => {
    const off = await composeWeek(lower({ focusPreset: 'v-taper' }), true);
    const on = await composeWeek(lower({ focusPreset: 'v-taper' }), false);
    expect(on.sets[GLUTES] || 0, `v-taper glutes ON=${on.sets[GLUTES] || 0} OFF=${off.sets[GLUTES] || 0}`).toBe(off.sets[GLUTES] || 0);
    expect(on.total).toBe(off.total);
  });
});
