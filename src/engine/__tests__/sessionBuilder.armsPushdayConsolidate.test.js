// ══ C21-SEL-02 — ARMS-FOCUS PUSH DAY STACKS CHEST PRESSES (cycle-21 rebalance 2026-06-17) ═════
// dp_arms_pushday_consolidate_v1 (default ON). On a 5-day arms split (['upper','lower','push',
// 'pull','legs']) the dedicated PUSH day is cluster 'push', so the existing chest→arm consolidation
// (dp_arms_fullday_swap_v1, fires only cluster === 'full') NEVER trims the chest SLOT count there.
// focusLeadSplits caps chest weekly SETS toward MEV, but the engine spreads that capped chest
// volume across THREE tier-1 chest-press SUB-FAMILIES (flat / incline / dip — distinct movementKeys,
// so the in-session dedup keeps all three) at 2-3 sets each → the arms push day allocates 3 chest-
// press SLOTS (a non-focus maintenance muscle) while the focus arms could use that slot (live probe
// p3 arms 5d push day: 3 presses + a fly).
//
// FIX (LEAN slot-level consolidation): when ctx.focusLeadSplits.focus === 'arms' on a chest-pressing
// cluster (push/upper) AND a single session selected >= 2 tier-1 chest presses (the over-stack),
// KEEP the best chest press and SWAP each surplus (3rd+) chest-press slot for the highest-band
// under-served direct-arm movement. Net slots unchanged (pure SWAP); chest held at MEV. COLLATERAL-
// FREE GUARD: only fires when chest is genuinely OVER-budgeted (weekly budget >= MEV + a minimum
// press), so a thin-chest persona (chest budget ~MEV, already trailing the focus arms) is a NO-OP
// (byte-identical, no net-negative trim) — only a genuinely over-budgeted chest (advanced/masa)
// yields the redundant press.
//
// METHODOLOGY ("test real values"): the over-stack is a FULL-PIPELINE delivery fact, so this gate
// composes the REAL planned week through world.composePlannedWorkoutToday (the SAME mechanic the
// eval-grid + backMaintenanceFloor gates use). The flag-under-test is toggled per arm via
// localStorage._devFlags; the rest sit at registry brain-on defaults. READ-ONLY on src/.

import { describe, it, expect } from 'vitest';
import { world, resetWorld } from '../../../tests/engine/full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { DEV_FLAGS_KEY, FLAGS } from '../../util/featureFlags.js';
import { SCHEDULE_STORE_KEY } from '../schedule/scheduleAdapter/constants.js';
import { frequencyToSplit } from '../schedule/scheduleAdapter/frequencySplit.js';
import { ISRAETEL_BASELINES } from '../periodization/constants.js';

const MS_DAY = 86400000;
const COHORT_START = Date.UTC(2026, 0, 5); // Monday
const COMPOUND_TIER = 1;
const CHEST_MEV = ISRAETEL_BASELINES.chest.MEV; // 8

// REAL grid personas (verbatim from the eval-grid / mrvCeiling diff harness).
const PERSONAS = {
  // genuinely OVER-budgeted chest (advanced/masa → chest budget 13, delivers 14 → over-served):
  p3: { age: 30, sex: 'm', goal: 'masa', experience: 'avansat', weight: 82, height: 182, targetWeight: 85 },
  // THIN chest (intermediate/forta → chest budget ~10 ≈ MEV → NOT surplus → no-op):
  p2: { age: 38, sex: 'm', goal: 'forta', experience: 'intermediar', weight: 78, height: 175 },
  p7: { age: 58, sex: 'm', goal: 'forta', experience: 'intermediar', weight: 92, height: 179 },
};

function setFlags(swapOn) {
  resetWorld();
  const o = {};
  for (const f of Object.keys(FLAGS)) o[f] = FLAGS[f].default;
  o.dp_arms_pushday_consolidate_v1 = swapOn;
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

/** Compose a persona's week; tally total slots, weekly chest/bi/tri, + the PUSH day chest-press slots. */
async function composeWeek(personaId, swapOn, freq, focus) {
  setFlags(swapOn);
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
  const split = frequencyToSplit(freq, focus, true, []);
  let totalSlots = 0;
  let chest = 0;
  let bi = 0;
  let tri = 0;
  let pushChestPressSlots = -1;
  for (let di = 0; di < offsets.length; di++) {
    const plan = await world.composePlannedWorkoutToday(new Date(COHORT_START + offsets[di] * MS_DAY));
    const exs = (plan && plan.exercises) || [];
    let dayChestPress = 0;
    for (const e of exs) {
      const m = getExerciseMetadata(e.engineName || e.name);
      const g = m.muscle_target_primary;
      const sets = e.sets || 0;
      totalSlots += 1;
      if (g === 'piept') { chest += sets; if ((m.tier ?? 2) <= COMPOUND_TIER) dayChestPress += 1; }
      if (g === 'biceps') bi += sets;
      if (g === 'triceps') tri += sets;
    }
    if (split[di] === 'push') pushChestPressSlots = dayChestPress;
  }
  return { totalSlots, chest, bi, tri, pushChestPressSlots };
}

describe('#C21-SEL-02 — arms push-day chest→arm consolidate (full-path)', () => {
  it('the 5d arms split has a dedicated PUSH day (cluster the full-day swap never reaches)', () => {
    const split = frequencyToSplit(5, 'arms', true, []);
    expect(split).toContain('push');
    expect(split).not.toContain('full'); // full-body days would route to armsFulldaySwap instead
  });

  it('p3 arms5d: ON trims the push day to <= 2 chest-press slots, chest >= MEV, arms rise, slots unchanged', async () => {
    const off = await composeWeek('p3', false, 5, 'arms');
    const on = await composeWeek('p3', true, 5, 'arms');
    // OFF reproduces the over-stack: 3 chest-press slots on the push day.
    expect(off.pushChestPressSlots).toBeGreaterThanOrEqual(3);
    // ON consolidates the push day to <= 2 chest-press slots.
    expect(on.pushChestPressSlots).toBeLessThanOrEqual(2);
    // chest stays >= MEV (collateral-free — the surplus is the redundant SLOT, not the volume).
    expect(on.chest).toBeGreaterThanOrEqual(CHEST_MEV);
    // the freed slot went to a direct-arm (focus) movement → an arm group rose.
    expect(on.tri + on.bi).toBeGreaterThan(off.tri + off.bi);
    // a SWAP, not an add — total weekly slot count unchanged (LEAN).
    expect(on.totalSlots).toBe(off.totalSlots);
    // chest came DOWN (the surplus press yielded) but never below MEV.
    expect(on.chest).toBeLessThan(off.chest);
  });

  it('THIN-chest personas (p2, p7) are a NO-OP — byte-identical ON vs OFF (collateral-free guard)', async () => {
    for (const id of ['p2', 'p7']) {
      const off = await composeWeek(id, false, 5, 'arms');
      const on = await composeWeek(id, true, 5, 'arms');
      // chest budget ~MEV → not surplus → the swap never fires → chest/arms/slots identical.
      expect(on.chest).toBe(off.chest);
      expect(on.tri).toBe(off.tri);
      expect(on.bi).toBe(off.bi);
      expect(on.totalSlots).toBe(off.totalSlots);
      // and chest was never driven below MEV (it was untouched).
      expect(on.chest).toBeGreaterThanOrEqual(CHEST_MEV);
    }
  });

  it('a NON-arms focus (balanced 5d) is untouched — byte-identical ON vs OFF', async () => {
    const off = await composeWeek('p3', false, 5, 'balanced');
    const on = await composeWeek('p3', true, 5, 'balanced');
    expect(on.chest).toBe(off.chest);
    expect(on.tri).toBe(off.tri);
    expect(on.totalSlots).toBe(off.totalSlots);
  });

  it('an all-full-body arms week (3d) is unchanged by THIS flag — the full-day swap owns it', async () => {
    // freq 3 arms → full/full/full (no push/upper cluster) → ctx.armsPushdaySwap never set →
    // dp_arms_fullday_swap_v1 handles the full days. Toggling THIS flag changes nothing.
    const split = frequencyToSplit(3, 'arms', true, []);
    expect(split.every((c) => c === 'full')).toBe(true);
    const off = await composeWeek('p3', false, 3, 'arms');
    const on = await composeWeek('p3', true, 3, 'arms');
    expect(on.chest).toBe(off.chest);
    expect(on.tri).toBe(off.tri);
    expect(on.totalSlots).toBe(off.totalSlots);
  });
});
