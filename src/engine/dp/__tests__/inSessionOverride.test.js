// ══ F1 — manual-override recalibration (DOWN anchor + UP on e1RM capacity) ════
// REPLAY-style unit tests built straight from the two real Daniel sessions
// (_GYMLOG_FINDINGS_2026-06-11.md constatarea 3 + adaosurile 10/11). PURE module,
// driven with the REAL gym ladders (config/weights.js) and the REAL e1RM machinery
// (DP.e1RMForSet) so a green test means the live path recalibrates — not round
// fixture numbers. The sticky bug was: the engine HELD the rec across huge manual
// overrides (Seated DB 30 held while he did 20-25; BB Shrug 50 held while he
// climbed 50→60→70; Bayesian 9 held on a 14kg "usor" set).

import { describe, it, expect, beforeEach } from 'vitest';
import { manualOverrideTarget, manualOverrideDownTarget } from '../inSessionOverride.js';
import { getPrevWeight, getNextWeight, roundToEquipmentWeight } from '../../../config/weights.js';
import { DP } from '../../dp.js';

// Pin flags to defaults so DP.e1RMForSet uses the pure 3/1/0 RIR map (the learned
// temperament/behavior offsets are flag-gated OFF) — deterministic across tests.
beforeEach(() => {
  try { localStorage.setItem('_devFlags', JSON.stringify({ dp_temperament_v1: false, dp_behavior_distill_v1: false, dp_learned_ladder_v1: false, dp_equipment_ladder_v1: false })); } catch { /* jsdom */ }
});

// Real in-session RPE mapping (workoutStore.logic INSESSION_RATING_TO_RPE).
const RPE = { usor: 6.5, potrivit: 7.5, greu: 10 };

// The injected helper bundle the live dp.js call-site passes (real ladders + e1RM).
const H = {
  getPrevWeight,
  getNextWeight,
  roundToStep: (kg, ex) => roundToEquipmentWeight(kg, ex),
  e1RMForSet: (w, reps, rpe, ex) => DP.e1RMForSet(w, reps, rpe, ex),
  t: (_key, vars) => `msg:${vars.kg}`,
};

const call = (args) => manualOverrideTarget({ wasManualOverride: true, haveRec: true, ...args }, H);

describe('manualOverrideTarget — LOWER override anchors the next set (Seated DB Press)', () => {
  // Live: rec 30×6, he entered 20×8 potrivit / 25×6 greu / 22.5×6 greu — engine HELD 30 every set.
  it('rec 30 → 20 "potrivit" anchors DOWN to 20 (was a held 30)', () => {
    const r = call({ ex: 'Seated DB Press', recKg: 30, recReps: 6, loggedKg: 20, loggedReps: 8, lastRPE: RPE.potrivit });
    expect(r).toMatchObject({ adjust: true, dir: 'down', newKg: 20 });
  });

  it('rec 30 → 25 "greu" eases one DB rung under (= 22.5)', () => {
    const r = call({ ex: 'Seated DB Press', recKg: 30, recReps: 6, loggedKg: 25, loggedReps: 6, lastRPE: RPE.greu });
    expect(r).toMatchObject({ adjust: true, dir: 'down', newKg: 22.5 });
  });

  it('rec 30 → 22.5 "greu" eases one DB rung under (= 20)', () => {
    const r = call({ ex: 'Seated DB Press', recKg: 30, recReps: 6, loggedKg: 22.5, loggedReps: 6, lastRPE: RPE.greu });
    expect(r).toMatchObject({ adjust: true, dir: 'down', newKg: 20 });
  });

  it('a lower load rated "usor" holds the rec (no chase-down)', () => {
    const r = call({ ex: 'Seated DB Press', recKg: 30, recReps: 6, loggedKg: 20, loggedReps: 10, lastRPE: RPE.usor });
    expect(r).toEqual({ adjust: false });
  });
});

describe('manualOverrideTarget — UP on demonstrated e1RM capacity', () => {
  // Live: BB Shrug rec 50, he climbed 50→60→70 all "potrivit" — engine HELD 50.
  // 60×12 out-e1RMs 50×12 → the next set must rise (anchored at the entered load).
  it('BB Shrug rec 50 → 60×12 "potrivit" rises to >= 60 (was a held 50)', () => {
    const r = call({ ex: 'BB Shrug', recKg: 50, recReps: 12, loggedKg: 60, loggedReps: 12, lastRPE: RPE.potrivit });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('up');
    expect(r.newKg).toBeGreaterThanOrEqual(60);
  });

  it('BB Shrug rec 60 → 70×12 "potrivit" keeps rising (capacity still above rec)', () => {
    const r = call({ ex: 'BB Shrug', recKg: 60, recReps: 12, loggedKg: 70, loggedReps: 12, lastRPE: RPE.potrivit });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('up');
    expect(r.newKg).toBeGreaterThanOrEqual(70);
  });

  // Live: Bayesian Curl rec 9×11, he did 14×9 "usor" — engine HELD 9 (judged
  // 9 reps < 11 target). e1RM(14×9) ≈ 19.6 ≫ e1RM(9×11) ≈ 12.6 → UP.
  it('Bayesian rec 9×11 → 14×9 "usor" rises (e1RM capacity, NOT a rep-count hold)', () => {
    const r = call({ ex: 'Bayesian Curl', recKg: 9, recReps: 11, loggedKg: 14, loggedReps: 9, lastRPE: RPE.usor });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('up');
    expect(r.newKg).toBe(14); // ANCHORED at the demonstrated load (not a speculative jump)
  });

  it('never urcă pe greu — a heavier-AND-hard set falls through (legacy ease owns it)', () => {
    // entered 60 > rec 50 but greu → no UP; null lets the generic greu branch ease it.
    const r = call({ ex: 'BB Shrug', recKg: 50, recReps: 12, loggedKg: 60, loggedReps: 8, lastRPE: RPE.greu });
    expect(r).toBeNull();
  });

  it('a heavier set WITHOUT a real capacity surplus does not yo-yo up (margin gate)', () => {
    // 52.5 vs 50 at the same reps — under the 1.10 e1RM margin → no UP, fall through.
    const r = call({ ex: 'BB Shrug', recKg: 50, recReps: 12, loggedKg: 52.5, loggedReps: 12, lastRPE: RPE.potrivit });
    expect(r).toBeNull();
  });
});

describe('manualOverrideTarget — anti-yo-yo + back-compat', () => {
  it('UP anchors at the demonstrated load even on a huge over-entry (no speculative climb)', () => {
    // rec 9 but he did 41 (matrix_cable) easy → the target moves to 41 (what he
    // proved), NOT 9+one-step and NOT a jump above 41. The next set consolidates 41.
    const r = call({ ex: 'Bayesian Curl', recKg: 9, recReps: 11, loggedKg: 41, loggedReps: 11, lastRPE: RPE.usor });
    expect(r.adjust).toBe(true);
    expect(r.newKg).toBe(roundToEquipmentWeight(41, 'Bayesian Curl')); // anchored at entered
  });

  it('no manual override → inert (byte-identical legacy)', () => {
    const r = manualOverrideTarget({ wasManualOverride: false, haveRec: true, ex: 'BB Shrug', recKg: 50, recReps: 12, loggedKg: 70, loggedReps: 12, lastRPE: RPE.potrivit }, H);
    expect(r).toBeNull();
  });

  it('the legacy DOWN-only export is unchanged (same DOWN result as the unified fn)', () => {
    const argsDown = { wasManualOverride: true, haveRec: true, loggedKg: 20, recKg: 30, lastRPE: RPE.potrivit, ex: 'Seated DB Press' };
    const legacy = manualOverrideDownTarget(argsDown, { getPrevWeight, roundToStep: H.roundToStep, t: H.t });
    expect(legacy).toMatchObject({ adjust: true, dir: 'down', newKg: 20 });
  });
});
