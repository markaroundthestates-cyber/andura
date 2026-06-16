// ══ BUILD F6c #34 — N-of-1 self-experiment tests (F6c spec §5) ═══════════════
// Pure measurement + eligibility + winner decision + reversible bias + persistence
// round-trip, plus the DP consumer integration (flag-OFF byte-identical; a NULL
// preference is byte-identical even ON; a decided preference biases setsAdjust ±1).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadPreference,
  savePreference,
  loadExperiment,
  saveExperiment,
  isEligibleForExperiment,
  decideWinner,
  nof1SetBias,
  advanceExperiment,
  NOF1_BLOCK_SESSIONS,
  NOF1_SIGNIFICANCE_Z,
  NOF1_MIN_TRAINING_AGE,
  NOF1_SET_BIAS,
  NOF1_ARMS,
} from '../dp/nof1.js';
import { DP } from '../dp.js';

const EX = 'Leg Extension';
const DAY = 86400000;
const BASE = 1_717_000_000_000;

const ON = () => localStorage.setItem('_devFlags', JSON.stringify({ dp_nof1_v1: true }));

describe('decideWinner — noise-aware A/B', () => {
  it('picks the higher-slope arm when the difference clears Z·sigma', () => {
    // diff = 5, band = 1.0 * 2 = 2 → significant.
    expect(decideWinner(8, 3, 2)).toBe('volume');     // arm A (volume) wins
    expect(decideWinner(3, 8, 2)).toBe('intensity');  // arm B (intensity) wins
  });

  it('keeps NULL (no winner) when the difference is within the noise band', () => {
    // diff = 1, band = 1.0 * 2 = 2 → inconclusive.
    expect(decideWinner(5, 4, 2)).toBeNull();
    expect(decideWinner(4, 5, 2)).toBeNull();
  });

  it('a NaN / missing slope → NULL (no spurious personalization)', () => {
    expect(decideWinner(NaN, 3, 1)).toBeNull();
    expect(decideWinner(3, undefined, 1)).toBeNull();
  });

  it('Z scales the required separation', () => {
    expect(NOF1_SIGNIFICANCE_Z).toBeGreaterThan(0);
  });
});

describe('isEligibleForExperiment — ALL guardrails', () => {
  const ok = {
    engineName: EX,
    trainingAge: NOF1_MIN_TRAINING_AGE + 2,
    confidentTrend: true,
    isBeginner: false,
    energyPhase: 'MAINTENANCE',
    experimentRunning: false,
    hasPreference: false,
  };

  it('an established, non-cut, non-beginner lift with a confident trend is eligible', () => {
    expect(isEligibleForExperiment(ok)).toBe(true);
  });

  it('NOT eligible in a CUT (a deficit confounds the result)', () => {
    expect(isEligibleForExperiment({ ...ok, energyPhase: 'CUT' })).toBe(false);
  });

  it('NOT eligible for a beginner (no stable baseline)', () => {
    expect(isEligibleForExperiment({ ...ok, isBeginner: true })).toBe(false);
  });

  it('NOT eligible while another experiment runs (one lift at a time)', () => {
    expect(isEligibleForExperiment({ ...ok, experimentRunning: true })).toBe(false);
  });

  it('NOT eligible when a preference is already decided for this lift', () => {
    expect(isEligibleForExperiment({ ...ok, hasPreference: true })).toBe(false);
  });

  it('NOT eligible for a non-established lift (trainingAge below the threshold)', () => {
    expect(isEligibleForExperiment({ ...ok, trainingAge: NOF1_MIN_TRAINING_AGE - 1 })).toBe(false);
  });

  it('NOT eligible without a confident trend (no clean signal to perturb)', () => {
    expect(isEligibleForExperiment({ ...ok, confidentTrend: false })).toBe(false);
  });
});

describe('nof1SetBias — bounded ±1 reversible nudge', () => {
  it('volume → +bias, intensity → −bias, null → 0', () => {
    expect(nof1SetBias({ arm: 'volume' })).toBe(NOF1_SET_BIAS);
    expect(nof1SetBias({ arm: 'intensity' })).toBe(-NOF1_SET_BIAS);
    expect(nof1SetBias(null)).toBe(0);
    expect(nof1SetBias({ arm: 'bogus' })).toBe(0);
  });
});

describe('preference + experiment persistence (round-trip + reversible)', () => {
  beforeEach(() => { localStorage.clear(); });

  it('saves + loads a preference by EN name', () => {
    savePreference(EX, { arm: 'volume', decidedTs: 123, slopeA: 8, slopeB: 3 });
    const p = loadPreference(EX);
    expect(p?.arm).toBe('volume');
    expect(p?.slopeA).toBe(8);
  });

  it('a null-arm save CLEARS the preference (reversible → today\'s behavior)', () => {
    savePreference(EX, { arm: 'intensity', decidedTs: 1, slopeA: 1, slopeB: 9 });
    expect(loadPreference(EX)).not.toBeNull();
    savePreference(EX, { arm: null, decidedTs: 0, slopeA: 0, slopeB: 0 });
    expect(loadPreference(EX)).toBeNull();
  });

  it('a corrupt / bad-arm preference loads as null', () => {
    expect(savePreference(EX, { arm: 'bogus', decidedTs: 0, slopeA: 0, slopeB: 0 }).ok).toBe(false);
    expect(loadPreference(EX)).toBeNull();
  });

  it('saves + loads + clears the single in-flight experiment', () => {
    saveExperiment({ exercise: EX, arm: NOF1_ARMS[0], sessionsInArm: 1, slopeArmA: null });
    expect(loadExperiment()?.exercise).toBe(EX);
    saveExperiment(null);
    expect(loadExperiment()).toBeNull();
  });
});

describe('advanceExperiment — pure arm stepper', () => {
  it('advances the counter inside arm A', () => {
    const { next, decided } = advanceExperiment(
      { exercise: EX, arm: NOF1_ARMS[0], sessionsInArm: 0, slopeArmA: null }, 5, 2,
    );
    expect(next?.sessionsInArm).toBe(1);
    expect(decided).toBeNull();
  });

  it('switches to arm B + records arm-A slope when arm A completes', () => {
    const { next, decided } = advanceExperiment(
      { exercise: EX, arm: NOF1_ARMS[0], sessionsInArm: NOF1_BLOCK_SESSIONS - 1, slopeArmA: null }, 7, 2,
    );
    expect(next?.arm).toBe(NOF1_ARMS[1]);
    expect(next?.slopeArmA).toBe(7);
    expect(next?.sessionsInArm).toBe(0);
    expect(decided).toBeNull();
  });

  it('decides the winner + ENDS the experiment when arm B completes (significant)', () => {
    const { next, decided } = advanceExperiment(
      { exercise: EX, arm: NOF1_ARMS[1], sessionsInArm: NOF1_BLOCK_SESSIONS - 1, slopeArmA: 9 }, 2, 2,
    );
    expect(next).toBeNull();           // experiment cleared (one at a time)
    expect(decided?.arm).toBe('volume'); // slopeA 9 > slopeB 2, diff 7 > band 2
  });

  it('an inconclusive arm B keeps the NULL preference', () => {
    const { decided } = advanceExperiment(
      { exercise: EX, arm: NOF1_ARMS[1], sessionsInArm: NOF1_BLOCK_SESSIONS - 1, slopeArmA: 5 }, 4, 2,
    );
    expect(decided?.arm).toBeNull(); // diff 1 < band 2 → no winner
  });
});

// ── DP consumer integration ──────────────────────────────────────────────────
describe('dp_nof1_v1 — consumer setsAdjust bias', () => {
  // A simple history so getSmartRecommendation returns a normal result.
  function seed() {
    const logs = [];
    for (let i = 0; i < 4; i++) {
      logs.push({ ex: EX, w: 40, reps: 12, rpe: 7.5, ts: BASE + i * DAY });
    }
    localStorage.setItem('logs', JSON.stringify(logs));
  }
  const smart = () => DP.getSmartRecommendation(EX, null, null, BASE + 10 * DAY, null, []);

  beforeEach(() => { localStorage.clear(); seed(); });

  it('flag OFF: a decided preference is NEVER read → byte-identical', () => {
    // dp_nof1_v1 flipped default-ON (Wave 2026-06-14); pin it OFF to assert the
    // legacy (preference-never-read) path explicitly.
    localStorage.setItem('_devFlags', JSON.stringify({ dp_nof1_v1: false }));
    savePreference(EX, { arm: 'volume', decidedTs: 1, slopeA: 9, slopeB: 1 });
    const r = smart();
    expect(r.nof1Bias).toBeUndefined();
    localStorage.removeItem('_devFlags');
  });

  it('flag ON + NULL preference: byte-identical (no bias applied)', () => {
    ON();
    const r = smart();
    expect(r.nof1Bias).toBeUndefined();
    localStorage.removeItem('_devFlags');
  });

  it('flag ON + a volume preference: +1 setsAdjust bias', () => {
    savePreference(EX, { arm: 'volume', decidedTs: 1, slopeA: 9, slopeB: 1 });
    ON();
    const r = smart();
    expect(r.nof1Bias).toBe(NOF1_SET_BIAS);
    expect(Number(r.setsAdjust)).toBe(NOF1_SET_BIAS);
    localStorage.removeItem('_devFlags');
  });

  it('flag ON + an intensity preference: −1 setsAdjust bias', () => {
    savePreference(EX, { arm: 'intensity', decidedTs: 1, slopeA: 1, slopeB: 9 });
    ON();
    const r = smart();
    expect(r.nof1Bias).toBe(-NOF1_SET_BIAS);
    localStorage.removeItem('_devFlags');
  });
});

// ── LIVE arm-scheduler (DP.stepNof1Experiment) — the DEFERRED half now wired ──
// Synthetic multi-session data: an ESTABLISHED, climbing lift runs arm A (N
// sessions) → arm B (N) → a winner is kept that biases future set count. The
// guardrails (CUT / beginner / one-at-a-time) each veto a start; an inconclusive
// pair keeps the NULL preference; flag-OFF is byte-identical (nothing scheduled).
describe('DP.stepNof1Experiment — live arm-scheduling', () => {
  // An ESTABLISHED, confidently-CLIMBING lift: >= NOF1_MIN_TRAINING_AGE distinct
  // days of rising e1RM so _trainingAge clears the bar AND _trendDir is confident.
  function seedEstablished() {
    const logs = [];
    const n = NOF1_MIN_TRAINING_AGE + 4;
    for (let i = 0; i < n; i++) {
      logs.push({ ex: EX, w: 40 + i * 2.5, reps: 10, rpe: 7.5, ts: BASE + i * DAY });
    }
    localStorage.setItem('logs', JSON.stringify(logs));
  }
  const MAINT = { phaseToken: 'MAINTENANCE', isBeginner: false };

  beforeEach(() => { localStorage.clear(); seedEstablished(); });

  it('STARTS an experiment (arm A) on the first eligible logged lift', () => {
    const r = DP.stepNof1Experiment([EX], MAINT);
    expect(r.action).toBe('start');
    expect(r.arm).toBe(NOF1_ARMS[0]);
    expect(loadExperiment()?.exercise).toBe(EX);
    expect(loadExperiment()?.arm).toBe(NOF1_ARMS[0]);
  });

  it('advances the arm-A counter only when the lift is trained that session', () => {
    DP.stepNof1Experiment([EX], MAINT);                 // start (counter 0)
    const skipped = DP.stepNof1Experiment(['Other Lift'], MAINT); // not trained
    expect(skipped.action).toBe('none');
    expect(loadExperiment()?.sessionsInArm).toBe(0);    // unchanged
    const adv = DP.stepNof1Experiment([EX], MAINT);     // trained → advance
    expect(adv.action).toBe('advance');
    expect(loadExperiment()?.sessionsInArm).toBe(1);
  });

  it('runs arm A → switches to arm B → decides a winner that biases future sets', () => {
    DP.stepNof1Experiment([EX], MAINT); // start, counter 0
    // Finish arm A's block: NOF1_BLOCK_SESSIONS advances (counter 0→1→2, then the
    // 3rd call's inArm clears the block → switch to arm B).
    for (let i = 0; i < NOF1_BLOCK_SESSIONS; i++) DP.stepNof1Experiment([EX], MAINT);
    expect(loadExperiment()?.arm).toBe(NOF1_ARMS[1]); // switched to arm B
    expect(loadExperiment()?.slopeArmA).not.toBeNull(); // arm-A slope recorded
    // Make arm B's measured window FLAT (a plateau) so it differs from the
    // climbing arm A → a confident, conclusive winner ('volume').
    const flat = [];
    for (let i = 0; i < 6; i++) flat.push({ ex: EX, w: 60, reps: 10, rpe: 7.5, ts: BASE + (100 + i) * DAY });
    localStorage.setItem('logs', JSON.stringify(flat));
    let last;
    for (let i = 0; i < NOF1_BLOCK_SESSIONS; i++) last = DP.stepNof1Experiment([EX], MAINT);
    expect(last.action).toBe('decide');
    expect(loadExperiment()).toBeNull();               // slot freed (one at a time)
    const pref = loadPreference(EX);
    // A decided preference (volume, since climbing arm A out-sloped flat arm B)
    // now biases the lift via the existing consumer (+1 set).
    expect(pref?.arm).toBe('volume');
    expect(nof1SetBias(pref)).toBe(NOF1_SET_BIAS);
  });

  it('does NOT re-decide / re-narrate when the slot-clear FAILS (quota edge)', () => {
    // Drive to the deciding session (climbing arm A vs flat arm B → conclusive).
    DP.stepNof1Experiment([EX], MAINT); // start
    for (let i = 0; i < NOF1_BLOCK_SESSIONS; i++) DP.stepNof1Experiment([EX], MAINT); // → arm B
    const flat = [];
    for (let i = 0; i < 6; i++) flat.push({ ex: EX, w: 60, reps: 10, rpe: 7.5, ts: BASE + (100 + i) * DAY });
    localStorage.setItem('logs', JSON.stringify(flat));
    for (let i = 0; i < NOF1_BLOCK_SESSIONS - 1; i++) DP.stepNof1Experiment([EX], MAINT);

    // On THIS (deciding) session, make the slot-clear (`setItem('dp-nof1-experiment',
    // 'null')`) hit quota → DB.set returns {ok:false} → the experiment stays in flight.
    const realSet = Storage.prototype.setItem;
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (k, v) {
      if (k === 'dp-nof1-experiment' && v === 'null') {
        const err = new Error('quota'); err.name = 'QuotaExceededError'; throw err;
      }
      return realSet.call(this, k, v);
    });

    const last = DP.stepNof1Experiment([EX], MAINT);
    spy.mockRestore();

    // The clear failed → report 'none' (NOT 'decide') so the one-shot winner
    // narration is not re-emitted, and the experiment is NOT lost — it stays in
    // flight for the next session to retry the clear.
    expect(last.action).toBe('none');
    expect(loadExperiment()?.exercise).toBe(EX); // still in flight (clear failed)
    // The winner preference was still (idempotently) persisted before the clear.
    expect(loadPreference(EX)?.arm).toBe('volume');
  });

  it('NEVER experiments in a CUT (a deficit confounds)', () => {
    const r = DP.stepNof1Experiment([EX], { phaseToken: 'CUT', isBeginner: false });
    expect(r.action).toBe('none');
    expect(loadExperiment()).toBeNull();
  });

  it('NEVER experiments for a beginner (no stable baseline)', () => {
    const r = DP.stepNof1Experiment([EX], { phaseToken: 'MAINTENANCE', isBeginner: true });
    expect(r.action).toBe('none');
    expect(loadExperiment()).toBeNull();
  });

  it('only ONE lift at a time — a second eligible lift cannot start while one runs', () => {
    DP.stepNof1Experiment([EX], MAINT); // EX experiment now in flight
    // Even a fully-eligible OTHER lift logged the same session cannot start one.
    const other = 'Leg Press';
    const r = DP.stepNof1Experiment([other], MAINT);
    expect(r.action).toBe('none');     // the in-flight EX is not trained here
    expect(loadExperiment()?.exercise).toBe(EX); // still EX, untouched
  });

  it('an inconclusive A/B keeps the NULL preference (reversible default)', () => {
    DP.stepNof1Experiment([EX], MAINT); // start
    for (let i = 0; i < NOF1_BLOCK_SESSIONS; i++) DP.stepNof1Experiment([EX], MAINT); // → arm B
    // Leave the SAME climbing logs → arm B measures ~the same slope as arm A →
    // the diff is within the noise band → decideWinner returns null.
    let last;
    for (let i = 0; i < NOF1_BLOCK_SESSIONS; i++) last = DP.stepNof1Experiment([EX], MAINT);
    expect(last.action).toBe('decide');
    expect(last.arm).toBeNull();         // inconclusive
    expect(loadPreference(EX)).toBeNull(); // NULL preference kept → today's behavior
  });

  it('does nothing on an empty session', () => {
    expect(DP.stepNof1Experiment([], MAINT).action).toBe('none');
    expect(loadExperiment()).toBeNull();
  });

  it('a non-established lift never starts an experiment', () => {
    // Only 2 distinct days → trainingAge below NOF1_MIN_TRAINING_AGE.
    localStorage.setItem('logs', JSON.stringify([
      { ex: EX, w: 40, reps: 10, rpe: 7.5, ts: BASE },
      { ex: EX, w: 42.5, reps: 10, rpe: 7.5, ts: BASE + DAY },
    ]));
    const r = DP.stepNof1Experiment([EX], MAINT);
    expect(r.action).toBe('none');
    expect(loadExperiment()).toBeNull();
  });
});
