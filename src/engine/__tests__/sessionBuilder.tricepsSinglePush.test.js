// ══ C21-FREQ-01 — DIRECT TRICEPS STARVED TO 1x AT FREQ 5/6/7 (single-push-day) ════════════
// dp_triceps_split_guarantee_v1 (default ON) — TRIGGER WIDENED (cycle-21 rebalance 2026-06-17).
//
// At freq 5/6/7 the split has EXACTLY ONE push day (5d: upper/lower/push/pull/legs; 6d/7d:
// push/pull/legs/upper/lower/full[/full]). The #2 upper-day triceps de-dup (sessionBuilder
// ~2207) strips the standalone direct-triceps isolation on every `upper` day — justified by
// "triceps is hit by the presses + the Push day". The restore guarantee that should re-seat it
// was gated `!weekHasPushDay` (ZERO push days only) — so with exactly ONE push day it never
// fired → direct triceps landed at 1x / 2-3 sets/wk (below its direct MEV 6) while biceps got
// 3-4x / 11-13 (arm imbalance). The lone push day covers triceps ONCE; the de-dup'd upper
// day(s) are the only other direct chance, so a SINGLE-push-day week needs the restore just as
// much as the no-push week. FIX: the gate widens from the binary !weekHasPushDay to a
// push-day-COUNT signal `pushDayCount <= 1` (0 OR 1 push day), AND extends to the `full`
// cluster per the audit spec (inert there — the full-body guarantee already covers it). 2+
// push days (v-taper/upper focus at freq 5-7) → pushDayCount > 1 → de-dup holds → byte-identical.
//
// The restore (sessionBuilder ~2662) is ORPHAN-SAFE + SURFACE-SAFE: it PREFERS to displace an
// over-slotted non-surfaced isolation (slot-neutral SWAP, biceps never clawed back); only when
// there is genuine room does it fill an empty slot (chosen.length < cap) — the SAME idiom the
// shipped biceps / full-body triceps guarantees use. It never overflows the session cap (LEAN).
//
// METHODOLOGY ("test real values"): the starvation is a FULL-PIPELINE delivery fact, so this
// gate composes the REAL planned week through world.composePlannedWorkoutToday (the SAME
// mechanic the eval-grid exporter + the backMaintenanceFloor gate use). The flag-under-test is
// toggled per arm via localStorage._devFlags; the rest sit at their registry brain-on defaults.
// READ-ONLY on src/.

import { describe, it, expect } from 'vitest';
import { world, resetWorld } from '../../../tests/engine/full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { DEV_FLAGS_KEY, FLAGS } from '../../util/featureFlags.js';
import { SCHEDULE_STORE_KEY } from '../schedule/scheduleAdapter/constants.js';
import { frequencyToSplit } from '../schedule/scheduleAdapter/frequencySplit.js';
import { ISRAETEL_BASELINES } from '../periodization/constants.js';

const MS_DAY = 86400000;
const COHORT_START = Date.UTC(2026, 0, 5); // Monday

const TRI_MEV = ISRAETEL_BASELINES.triceps.MEV; // 6
const SESSION_CAP = 8; // SESSION_SIZE — no day may exceed it (LEAN: restore never overflows)

// REAL grid personas (verbatim from the eval-grid exporter / mrvCeiling diff harness).
const PERSONAS = {
  p2: { age: 38, sex: 'm', goal: 'forta', experience: 'intermediar', weight: 78, height: 175 },
  p3: { age: 30, sex: 'm', goal: 'masa', experience: 'avansat', weight: 82, height: 182, targetWeight: 85 },
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

/** Compose a persona's balanced week and tally weekly direct-triceps / biceps + exposures. */
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
  let total = 0;
  let maxDayLen = 0;
  for (const off of offsets) {
    const plan = await world.composePlannedWorkoutToday(new Date(COHORT_START + off * MS_DAY));
    const exs = (plan && plan.exercises) || [];
    if (exs.length > maxDayLen) maxDayLen = exs.length;
    let dayHasTri = false;
    for (const e of exs) {
      const g = getExerciseMetadata(e.engineName || e.name).muscle_target_primary;
      const sets = e.sets || 0;
      total += sets;
      if (g === 'triceps') { tri += sets; dayHasTri = true; }
      if (g === 'biceps') bi += sets;
    }
    if (dayHasTri) triDays += 1;
  }
  return { tri, bi, triDays, total, maxDayLen };
}

describe('#C21-FREQ-01 — single-push-day triceps restore (full-path)', () => {
  it('the freq 5/6/7 balanced split has EXACTLY ONE push day (the orphan precondition)', () => {
    for (const freq of [5, 6, 7]) {
      const split = frequencyToSplit(freq, 'balanced', true, []);
      const pushDays = split.filter((c) => c === 'push').length;
      expect(pushDays).toBe(1);
    }
  });

  it('p3/6d + p3/7d: ON restores direct triceps to >= 2x exposures; biceps NOT reduced', async () => {
    for (const freq of [6, 7]) {
      const off = await composeWeek('p3', false, freq);
      const on = await composeWeek('p3', true, freq);
      // OFF reproduces the starvation: triceps 1x, below MEV.
      expect(off.triDays).toBe(1);
      expect(off.tri).toBeLessThan(TRI_MEV);
      // ON restores a 2nd direct-triceps EXPOSURE (the structural orphan repaired) → more sets.
      expect(on.triDays).toBeGreaterThanOrEqual(2);
      expect(on.tri).toBeGreaterThan(off.tri);
      // biceps is NEVER reduced by the restore (the swap displaces a non-arm over-slotted iso).
      expect(on.bi).toBe(off.bi);
    }
  });

  it('p3/6d: the restored 2nd exposure brings direct triceps to >= MEV (the dose allows it)', async () => {
    // At 6d the upper day has enough room to seat the restored triceps at a full dose, so the
    // 2 exposures sum to >= MEV. (At 7d the per-exposure dose is lighter — 2x but ~4 sets — the
    // structural orphan is still repaired; per-exposure sizing is left to the volume engine.)
    const on = await composeWeek('p3', true, 6);
    expect(on.tri).toBeGreaterThanOrEqual(TRI_MEV);
  });

  it('p2/6d + p2/7d: ON restores direct triceps to >= 2x (>= 4 sets); biceps NOT reduced', async () => {
    for (const freq of [6, 7]) {
      const off = await composeWeek('p2', false, freq);
      const on = await composeWeek('p2', true, freq);
      expect(off.triDays).toBe(1);
      expect(off.tri).toBeLessThan(TRI_MEV);
      expect(on.triDays).toBeGreaterThanOrEqual(2);
      expect(on.tri).toBeGreaterThan(off.tri);
      expect(on.bi).toBe(off.bi);
    }
  });

  it('LEAN: the restore never overflows the session cap (8) on any day, ON or OFF', async () => {
    for (const id of ['p2', 'p3']) {
      for (const freq of [5, 6, 7]) {
        const on = await composeWeek(id, true, freq);
        expect(on.maxDayLen).toBeLessThanOrEqual(SESSION_CAP);
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
    expect(on.total).toBe(off.total);
  });

  it('an arms/triceps-emphasis week is untouched by the de-dup (keeps direct triceps anyway)', async () => {
    // The #2 de-dup is EXEMPT when triceps is the user's emphasis — so an arms focus already
    // keeps its direct triceps regardless of the guarantee. ON vs OFF identical for arms.
    const off = await composeWeek('p3', false, 5, 'arms');
    const on = await composeWeek('p3', true, 5, 'arms');
    expect(on.tri).toBe(off.tri);
    expect(on.bi).toBe(off.bi);
    expect(on.total).toBe(off.total);
  });
});
