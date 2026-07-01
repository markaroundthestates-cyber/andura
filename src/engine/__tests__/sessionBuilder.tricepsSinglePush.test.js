// ══ C21-FREQ-01 — ARM IMBALANCE AT FREQ 5/6/7 (single-push-day), LEAN REDO ════════════════
// dp_triceps_split_guarantee_v1 (default ON) — TRIGGER WIDENED + LEAN INTRA-ARM SWAP
// (cycle-21 rebalance redo 2026-06-17; the prior widening a256e086 was reverted for adding a slot).
//
// At freq 5/6/7 the split has EXACTLY ONE push day (5d: upper/lower/push/pull/legs; 6d/7d:
// push/pull/legs/upper/lower/full[/full]). The #2 upper-day triceps de-dup (sessionBuilder
// ~2207) strips the standalone direct-triceps isolation on the `upper` day — justified by
// "triceps is hit by the presses + the Push day". The restore guarantee that should re-seat it
// was gated `!weekHasPushDay` (ZERO push days only) — so with exactly ONE push day it never
// fired → direct triceps landed at 1x / ~2-3 sets/wk (below its direct MEV 6) while biceps got
// 3-4x / 9-13 (an ARM IMBALANCE: biceps over-served, triceps under).
//
// THE LEAN FIX (this test's contract): the gate widens to pushDayCount <= 1, and the restore for
// the single-push-day case is an INTRA-ARM SWAP — displace ONE over-served BICEPS slot (the
// imbalance source) and seat direct triceps in its place. NET SLOTS UNCHANGED (the LEAN
// invariant — the prior attempt fell to an ADD branch at freq-6 → +1 slot → reverted). GUARDED
// so biceps stays >= its MEV (8) — BOTH the weekly TARGET and a DELIVERED estimate (remaining
// exposures × the freed dose) must still cover MEV after the yield. When biceps is NOT
// over-served enough to give a slot without dropping below MEV, the restore DOES NOT fire — it
// accepts the orphan rather than break biceps or add a slot. (The generic over-slotted-iso swap
// of the original no-push U/L guarantee is SKIPPED for the single-push-day case — a non-arm
// victim there can be eaten by a downstream floor and net a -1 slot.)
//
// REAL-VALUE OUTCOMES (full composer, balanced, these exact personas):
//   p3 masa/avansat — f7: tri 2(1x) → 4(2x), biceps 13 → 10 (>= MEV 8), SLOTS unchanged (FIRES).
//                     f5/f6: biceps cannot yield a slot staying >= MEV → ACCEPT THE ORPHAN.
//   p2 forta/intermediar — f5/f6/f7: biceps not over-served → ACCEPT THE ORPHAN (never broken).
//   In EVERY persona × freq 5/6/7 the total weekly SLOT count is identical ON vs OFF.
//
// METHODOLOGY ("test real values"): composes the REAL planned week through
// world.composePlannedWorkoutToday (the SAME mechanic the eval-grid exporter uses). The
// flag-under-test is toggled per arm via localStorage._devFlags; the rest sit at their registry
// brain-on defaults. READ-ONLY on src/.

import { describe, it, expect, vi } from 'vitest';
import { world, resetWorld } from '../../../tests/engine/full-path-sim/fp-config.js';

// DE-FLAKE 2026-06-29: each `it` composes up to 12 full weeks through the real
// 8-engine pipeline (world.composePlannedWorkoutToday) — the LEAN GLOBAL case ran
// ~9s even LIGHT, right at the 10s default. Under full-suite parallel load it tips
// past 10s -> a TIMEOUT (not an assertion: composition is deterministic, so it fails
// a DIFFERENT `it` each run depending on which is slowest, and passes isolated). The
// logic is sound; the heavy composer just needs headroom. File-scoped 45s timeout.
vi.setConfig({ testTimeout: 45000, hookTimeout: 45000 });
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { DEV_FLAGS_KEY, FLAGS } from '../../util/featureFlags.js';
import { SCHEDULE_STORE_KEY } from '../schedule/scheduleAdapter/constants.js';
import { frequencyToSplit } from '../schedule/scheduleAdapter/frequencySplit.js';
import { ISRAETEL_BASELINES } from '../periodization/constants.js';

const MS_DAY = 86400000;
const COHORT_START = Date.UTC(2026, 0, 5); // Monday

const TRI_MEV = ISRAETEL_BASELINES.triceps.MEV; // 6
const BI_MEV = ISRAETEL_BASELINES.biceps.MEV; // 8

// REAL grid personas (verbatim from the eval-grid exporter).
const PERSONAS = {
  // p3 masa/avansat: biceps weekly target 13/11.7 — over-served at freq-7 (the firing case).
  p3: { age: 30, sex: 'm', goal: 'masa', experience: 'avansat', weight: 82, height: 182, targetWeight: 85 },
  // p2 forta/intermediar: biceps target 10.4/9.3 — NOT over-served enough to yield a slot
  // (the accept-the-orphan persona).
  p2: { age: 38, sex: 'm', goal: 'forta', experience: 'intermediar', weight: 78, height: 175 },
};

// Brain-on env (every flag at its registry default); dp_triceps_split_guarantee_v1 toggled per arm.
function setFlags(guaranteeOn) {
  resetWorld();
  const o = {};
  for (const f of Object.keys(FLAGS)) o[f] = FLAGS[f].default;
  o.dp_triceps_split_guarantee_v1 = guaranteeOn;
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

function seedSchedule(offsets) {
  const days = ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'];
  for (const o of offsets) days[o] = 'training';
  localStorage.setItem(SCHEDULE_STORE_KEY, JSON.stringify({ state: { days }, version: 0 }));
}

function evenSpacedDays(freq) {
  if (freq <= 1) return [0];
  const out = [];
  for (let i = 0; i < freq; i++) out.push(Math.min(6, Math.round((i * 6) / (freq - 1))));
  return [...new Set(out)];
}

/** Compose a persona's week; tally weekly direct-triceps/biceps sets, triceps days, TOTAL slots. */
async function composeWeek(personaId, guaranteeOn, freq, focus = 'balanced') {
  setFlags(guaranteeOn);
  const offsets = evenSpacedDays(freq);
  seedSchedule(offsets);
  const p = PERSONAS[personaId];
  world.useOnboardingStore.setState({
    data: {
      ...p, frequency: String(freq), focusPreset: focus,
      focusPresetPickedAt: focus !== 'balanced' ? COHORT_START - 7 * MS_DAY : null,
    },
    completed: true, completedAt: COHORT_START,
  });
  let tri = 0;
  let bi = 0;
  let triDays = 0;
  let slots = 0; // TOTAL exercise slots across the week (the LEAN-invariant quantity)
  for (const off of offsets) {
    const plan = await world.composePlannedWorkoutToday(new Date(COHORT_START + off * MS_DAY));
    const exs = (plan && plan.exercises) || [];
    slots += exs.length;
    let dayHasTri = false;
    for (const e of exs) {
      const g = getExerciseMetadata(e.engineName || e.name).muscle_target_primary;
      const sets = e.sets || 0;
      if (g === 'triceps') { tri += sets; dayHasTri = true; }
      if (g === 'biceps') bi += sets;
    }
    if (dayHasTri) triDays += 1;
  }
  return { tri, bi, triDays, slots };
}

describe('#C21-FREQ-01 — single-push-day arm-balance LEAN swap (full-path)', () => {
  it('the freq 5/6/7 balanced split has EXACTLY ONE push day (the orphan precondition)', () => {
    for (const freq of [5, 6, 7]) {
      const split = frequencyToSplit(freq, 'balanced', true, []);
      expect(split.filter((c) => c === 'push').length).toBe(1);
    }
  });

  it('p3/7d (common persona): ON rebalances the arms — direct triceps 1x→2x while biceps yields ONE slot and stays >= MEV; SLOTS UNCHANGED', async () => {
    const off = await composeWeek('p3', false, 7);
    const on = await composeWeek('p3', true, 7);
    // OFF reproduces the imbalance: triceps 1x (below MEV), biceps over-served.
    expect(off.triDays).toBe(1);
    expect(off.tri).toBeLessThan(TRI_MEV);
    expect(off.bi).toBeGreaterThan(off.tri); // arm imbalance
    // ON restores a 2nd direct-triceps exposure (the LEAN intra-arm swap).
    expect(on.triDays).toBe(2);
    expect(on.tri).toBeGreaterThan(off.tri);
    // biceps yields exactly ONE slot (the swap victim) but stays >= its MEV — never broken.
    expect(on.bi).toBeLessThan(off.bi); // gave up a slot
    expect(on.bi).toBeGreaterThanOrEqual(BI_MEV);
    // THE LEAN INVARIANT — total weekly slots identical to flag-OFF (a SWAP, never an add).
    expect(on.slots).toBe(off.slots);
  });

  it('p3/5d + p3/6d: biceps cannot yield a slot staying >= MEV → ACCEPT THE ORPHAN (LEAN: no add, no biceps-break)', async () => {
    // At freq-5/6 biceps has only ~3 weekly exposures delivering ~9-10 sets; a 3-set yield
    // would drop delivered biceps below MEV 8, so the guard refuses. The spec-sanctioned
    // partial outcome: triceps stays single rather than break biceps or add a slot.
    for (const freq of [5, 6]) {
      const off = await composeWeek('p3', false, freq);
      const on = await composeWeek('p3', true, freq);
      expect(on.triDays).toBe(off.triDays); // no restore
      expect(on.bi).toBe(off.bi); // biceps untouched
      expect(on.bi).toBeGreaterThanOrEqual(BI_MEV);
      expect(on.slots).toBe(off.slots); // LEAN: no add
    }
  });

  it('p2 (biceps NOT over-served): the restore never breaks biceps or adds a slot at freq 5/6/7', async () => {
    for (const freq of [5, 6, 7]) {
      const off = await composeWeek('p2', false, freq);
      const on = await composeWeek('p2', true, freq);
      expect(on.bi).toBe(off.bi); // biceps never reduced (it was already at/under MEV)
      expect(on.slots).toBe(off.slots); // LEAN invariant
      expect(on.tri).toBeGreaterThanOrEqual(off.tri); // triceps never decreases
    }
  });

  it('LEAN GLOBAL: total weekly slots are UNCHANGED ON vs OFF for every persona × freq 5/6/7', async () => {
    for (const id of ['p2', 'p3']) {
      for (const freq of [5, 6, 7]) {
        const off = await composeWeek(id, false, freq);
        const on = await composeWeek(id, true, freq);
        expect(on.slots).toBe(off.slots);
      }
    }
  });

  it('a 2+-push-day week (v-taper 5d) is UNTOUCHED — byte-identical ON vs OFF', async () => {
    // v-taper 5d split is push/pull/legs/push/pull (2 push days) → pushDayCount > 1 → the
    // gate stays false → the de-dup holds → no restore → the delivered week is identical.
    const split = frequencyToSplit(5, 'v-taper', true, []);
    expect(split.filter((c) => c === 'push').length).toBeGreaterThanOrEqual(2);
    const off = await composeWeek('p3', false, 5, 'v-taper');
    const on = await composeWeek('p3', true, 5, 'v-taper');
    expect(on.tri).toBe(off.tri);
    expect(on.bi).toBe(off.bi);
    expect(on.slots).toBe(off.slots);
  });

  it('an arms-emphasis week is untouched by the de-dup (keeps direct triceps anyway)', async () => {
    // The #2 de-dup is EXEMPT when triceps is the user's emphasis — so an arms focus already
    // keeps its direct triceps regardless of the guarantee. ON vs OFF identical for arms.
    const off = await composeWeek('p3', false, 5, 'arms');
    const on = await composeWeek('p3', true, 5, 'arms');
    expect(on.tri).toBe(off.tri);
    expect(on.bi).toBe(off.bi);
    expect(on.slots).toBe(off.slots);
  });
});
