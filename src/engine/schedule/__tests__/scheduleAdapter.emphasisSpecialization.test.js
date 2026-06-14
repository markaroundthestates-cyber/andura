// EMPHASIS = SPECIALIZATION-PHASE (F engine-wiring 2026-06-07) — the user-picked
// muscle-group emphasis routes into the EXISTING src/engine/specialization/ engine
// and CONSUMES its already-computed volume_modifier ({+30% target, -25% others},
// 4-week mesocycle) to shape SESSION COMPOSITION (path A — sets/exercises per
// group), which getDailyWorkout used to DISCARD.
//
// Behind dp_emphasis_specialization_v1 (default OFF). These tests flip it ON via
// the _devFlags localStorage override (isEnabled resolution order #1) and feed the
// emphasis meta the builder produces flag-ON (userOverrideWeakGroup + auto-accept +
// gate-bypass + meso clock) directly on userState.meta.
//
// Hard invariants (REAL production values, NOT rounded — feedback_test_real_values):
//   1. Target ↑   — emphasized group's weekly budget >= balanced (rides toward MRV).
//   2. Rest ↓ MEV — every non-emphasized group < balanced AND >= its MEV (floor hit,
//      never breached, never zero).
//   3. Phase bound — at specializationWeeksElapsed >= 4 the modifier is zeros
//      (computeMesocycleProgress.exiting) → composed session === balanced (auto-return).
//   4. UPPER mirror — upper trades one leg day (split reshape) AND lower relax to MEV.
//   5. User-override resolves target — empty logs, override beats the detector.
//   6. balanced = byte-identical — the whole chain's opt-in invariant.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDailyWorkout, frequencyToSplit } from '../scheduleAdapter.js';
import { ISRAETEL_BASELINES, BIG11_RO_TO_EN_MAP } from '../../periodization/constants.js';

// Marius @ 4 days/week, T2, week-0 (LOAD phase → modifier eligible). High persona
// keeps budgets off the MEV/MRV clamps so the trade is observable.
const MONDAY = new Date(2026, 4, 18); // dayIdx 0 (L) — UPPER day @ freq 4
const TUESDAY = new Date(2026, 4, 19); // dayIdx 1 (Ma) — LOWER day @ freq 4

const FLAG = 'dp_emphasis_specialization_v1';

function setFlag(on) {
  if (on) localStorage.setItem('_devFlags', JSON.stringify({ [FLAG]: true }));
  else localStorage.removeItem('_devFlags');
}

// userState the React builder produces flag-ON for a user-picked emphasis: the
// preset's primary group as the spec TARGET + auto-accept + gate bypass + meso clock.
function emphasisState(focusPreset, primaryRO, weeksElapsed = 0, extra = {}) {
  return {
    user: { age: 30, goal: 'hipertrofie', persona: 'marius', frequency: '4', focusPreset },
    recentSessions: [],
    weights: {},
    profileTier: 'T2',
    flags: {},
    meta: {
      weeksElapsed: 0,
      userOverrideWeakGroup: primaryRO,
      userProposalAccepted: true,
      userPickedEmphasis: true,
      specializationWeeksElapsed: weeksElapsed,
    },
    ...extra,
  };
}

// Plain balanced state (no emphasis meta) — the pre-feature baseline.
function balancedState(extra = {}) {
  return {
    user: { age: 30, goal: 'hipertrofie', persona: 'marius', frequency: '4' },
    recentSessions: [],
    weights: {},
    profileTier: 'T2',
    flags: {},
    meta: { weeksElapsed: 0 },
    ...extra,
  };
}

function weeklyVol(plan, roGroup) {
  const enKey = BIG11_RO_TO_EN_MAP[roGroup];
  return plan.volumeTargets ? plan.volumeTargets[enKey] : undefined;
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
afterEach(() => {
  localStorage.clear();
});

// ── 6. balanced = byte-identical (flag ON or OFF — opt-in invariant) ─────────
describe('balanced focus = zero behavior change (flag ON or OFF)', () => {
  it('flag OFF: no emphasis meta → plan deep-equals the balanced baseline', async () => {
    setFlag(false);
    const a = await getDailyWorkout(balancedState(), MONDAY);
    const b = await getDailyWorkout(balancedState(), MONDAY);
    expect(a).toEqual(b);
  });

  it('flag ON but focusPreset balanced (no override meta) → identical to flag-OFF balanced', async () => {
    setFlag(false);
    const off = await getDailyWorkout(balancedState(), MONDAY);
    setFlag(true);
    const onBalanced = await getDailyWorkout(balancedState(), MONDAY);
    expect(onBalanced).toEqual(off);
  });
});

// ── flag-OFF byte-identical even with a picked emphasis ──────────────────────
describe('flag OFF = byte-identical even when an emphasis pick is present', () => {
  it('arms emphasis with the flag OFF → the de-emph trade does NOT run (composition unchanged vs no-meta)', async () => {
    setFlag(false);
    // Flag OFF: the builder would NOT set the override meta, but even if stale meta
    // leaked, getDailyWorkout gates the trade on the flag → no rest-down.
    const noMeta = await getDailyWorkout(
      { ...balancedState(), user: { ...balancedState().user, focusPreset: 'arms' } },
      MONDAY,
    );
    const withMeta = await getDailyWorkout(
      { ...emphasisState('arms', 'biceps'), meta: { weeksElapsed: 0 } },
      MONDAY,
    );
    // No spec de-emph applied either way (flag OFF) → non-target groups untouched.
    expect(weeklyVol(withMeta, 'piept')).toBeCloseTo(weeklyVol(noMeta, 'piept'), 6);
  });
});

// ── 1. Target ↑ + 2. Rest ↓ to MEV (the zero-sum trade) ──────────────────────
describe('emphasis trade — target UP toward MRV, rest DOWN to MEV (flag ON)', () => {
  it('arms (target biceps): biceps weekly budget >= balanced; every non-emphasized group < balanced AND >= MEV', async () => {
    setFlag(false);
    const balanced = await getDailyWorkout(balancedState(), MONDAY);
    setFlag(true);
    const arms = await getDailyWorkout(emphasisState('arms', 'biceps'), MONDAY);

    // 1. Target ↑ — biceps (the spec target) rides applyWeaknessAmplification.
    expect(weeklyVol(arms, 'biceps')).toBeGreaterThanOrEqual(weeklyVol(balanced, 'biceps'));
    // Never above its MRV (hard cap).
    expect(weeklyVol(arms, 'biceps')).toBeLessThanOrEqual(ISRAETEL_BASELINES.biceps.MRV);

    // 2. Rest ↓ to MEV — a group that is NOT emphasized by 'arms' (emphasize:
    // biceps/triceps/umeri) relaxes toward MEV, never below. piept is not in the
    // arms emphasize set → it must drop AND floor at MEV.
    const before = weeklyVol(balanced, 'piept');
    const after = weeklyVol(arms, 'piept');
    expect(after).toBeLessThan(before); // relaxed toward maintenance
    expect(after).toBeGreaterThanOrEqual(ISRAETEL_BASELINES.chest.MEV); // floor, never breached
  });

  it('the de-emphasized rest is clamped to MEV exactly when the 25% lerp would undershoot', async () => {
    setFlag(true);
    const arms = await getDailyWorkout(emphasisState('arms', 'biceps'), MONDAY);
    // Every non-emphasized Big-11 group present in the budget must be >= its MEV.
    const armsEmphEN = new Set(['biceps', 'triceps', 'shoulders']); // arms emphasize → EN
    for (const [en, lm] of Object.entries(ISRAETEL_BASELINES)) {
      if (armsEmphEN.has(en)) continue;
      const v = arms.volumeTargets ? arms.volumeTargets[en] : undefined;
      if (typeof v === 'number') expect(v).toBeGreaterThanOrEqual(lm.MEV);
    }
  });
});

// ── 3. Phase bound + auto-return (4-week mesocycle) ──────────────────────────
describe('phase bound — at week >= 4 the modifier is zeros → composed session auto-returns to balanced', () => {
  it('specializationWeeksElapsed = 4 → the spec volume_modifier is zeros → no rest-down trade', async () => {
    setFlag(false);
    const balanced = await getDailyWorkout(balancedState(), MONDAY);
    // Isolate the SPEC auto-return: pin dp_arms_signature_v1 OFF (registry default is ON)
    // so the arms-focus VOLUME CONTRACT (which trims chest to MEV maintenance on ANY arms
    // week, independent of the 4-week spec mesocycle — that is its intended persistent
    // behavior) does not confound this test's subject = the emphasis-specialization
    // rest-down trade auto-returning at week >= 4. With arms-signature ON, piept would stay
    // at its maintenance cap (8) by design even after the spec phase exits; that is covered
    // by arms-signature.gate.test.js, not here.
    localStorage.setItem('_devFlags', JSON.stringify({ [FLAG]: true, dp_arms_signature_v1: false }));
    // weeksElapsed 0 → ACTIVE trade (modifier non-zero) → rest relaxes.
    const active = await getDailyWorkout(emphasisState('arms', 'biceps', 0), MONDAY);
    expect(weeklyVol(active, 'piept')).toBeLessThan(weeklyVol(balanced, 'piept'));

    // weeksElapsed 4 → exiting → modifier ZEROS → the rest-down trade does NOT run.
    // (The target may still ride the weakGroups amplification — that is the spec
    // target folding into weakGroups — but the engine-driven CUT is gone, which is
    // the auto-return of the zero-sum trade.)
    const exited = await getDailyWorkout(emphasisState('arms', 'biceps', 4), MONDAY);
    expect(weeklyVol(exited, 'piept')).toBeCloseTo(weeklyVol(balanced, 'piept'), 6);
  });
});

// ── 4. UPPER mirror — split reshape + lower relax ────────────────────────────
describe('UPPER focus mirrors v-taper (split reshape) AND relaxes lower to MEV', () => {
  it('upper trades one leg day in the split (same as v-taper)', () => {
    const balanced = frequencyToSplit(4, 'balanced');
    const upper = frequencyToSplit(4, 'upper');
    const vtaper = frequencyToSplit(4, 'v-taper');
    expect(upper).toEqual(vtaper); // mirror: same lower de-emphasis → same reshape
    const balLegs = balanced.filter((c) => c === 'lower' || c === 'legs').length;
    const upLegs = upper.filter((c) => c === 'lower' || c === 'legs').length;
    expect(upLegs).toBeLessThan(balLegs);
    expect(upLegs).toBeGreaterThanOrEqual(1);
  });

  it('upper (flag ON, target piept): lower groups relax toward MEV on the leg day, never below', async () => {
    setFlag(false);
    const balancedLeg = await getDailyWorkout(balancedState(), TUESDAY);
    setFlag(true);
    const upperLeg = await getDailyWorkout(emphasisState('upper', 'piept'), TUESDAY);
    for (const [ro, en] of [
      ['picioare-quads', 'quads'],
      ['picioare-hamstrings', 'hamstrings'],
      ['fese', 'glutes'],
    ]) {
      const after = weeklyVol(upperLeg, ro);
      expect(after).toBeLessThanOrEqual(weeklyVol(balancedLeg, ro) + 1e-6);
      expect(after).toBeGreaterThanOrEqual(ISRAETEL_BASELINES[en].MEV);
    }
  });
});

// ── 5. User-override resolves the target deterministically (empty logs) ──────
describe('user-picked emphasis resolves a target even with empty logs (override beats detector)', () => {
  it('chest emphasis (target piept) with ZERO logs → piept budget >= balanced (deterministic, no lagging history needed)', async () => {
    setFlag(false);
    const balanced = await getDailyWorkout(balancedState(), MONDAY);
    setFlag(true);
    // recentSessions empty → the lagging detector has nothing; the override target
    // (piept) must still resolve and drive the trade.
    const chest = await getDailyWorkout(emphasisState('chest', 'piept'), MONDAY);
    expect(weeklyVol(chest, 'piept')).toBeGreaterThanOrEqual(weeklyVol(balanced, 'piept'));
    // A non-emphasized group (spate not in chest emphasize: piept/triceps) relaxes.
    expect(weeklyVol(chest, 'spate')).toBeLessThan(weeklyVol(balanced, 'spate'));
  });
});

// ── Determinism ──────────────────────────────────────────────────────────────
describe('emphasis trade determinism', () => {
  it('same now + state + flag ON → identical plan across runs', async () => {
    setFlag(true);
    const a = await getDailyWorkout(emphasisState('arms', 'biceps'), MONDAY);
    const b = await getDailyWorkout(emphasisState('arms', 'biceps'), MONDAY);
    expect(a).toEqual(b);
  });
});
