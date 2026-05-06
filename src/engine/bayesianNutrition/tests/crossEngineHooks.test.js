import { describe, it, expect } from 'vitest';
import {
  emitGoalAdaptationDisagreement,
  applyEnergyVarianceModifier,
  applySigmaModifier,
  emitPassiveModeSignal,
  getConvergenceGuardReference,
  forwardConstraintObject,
} from '../crossEngineHooks.js';
import {
  CALIBRATION_TIERS,
  ENERGY_VARIANCE_MODIFIER,
} from '../constants.js';

describe('emitGoalAdaptationDisagreement — Cluster C2 disagreement flag CDL', () => {
  it('engine #2 phase ≠ engine #3 inferred → flagged Tier 1 silent', () => {
    const r = emitGoalAdaptationDisagreement({
      engine2Phase: 'BULK',
      engine3InferredPhase: 'CUT',
    });
    expect(r.flagged).toBe(true);
    expect(r.engine2Phase).toBe('BULK');
    expect(r.engine3InferredPhase).toBe('CUT');
    expect(r.reason).toContain('tier_1_silent_flag_invariant_5_protect');
  });
  it('phases aligned → NU flag', () => {
    const r = emitGoalAdaptationDisagreement({
      engine2Phase: 'BULK',
      engine3InferredPhase: 'BULK',
    });
    expect(r.flagged).toBe(false);
    expect(r.reason).toContain('phases_aligned');
  });
  it('case-insensitive normalize', () => {
    const r = emitGoalAdaptationDisagreement({
      engine2Phase: 'cut',
      engine3InferredPhase: 'CUT',
    });
    expect(r.flagged).toBe(false);
  });
  it('missing engine2 phase → insufficient signal', () => {
    const r = emitGoalAdaptationDisagreement({});
    expect(r.flagged).toBe(false);
    expect(r.reason).toContain('insufficient_signal');
  });
});

describe('applyEnergyVarianceModifier — Cluster C3 σ variance modifier', () => {
  it('T0 cold start → neutral fallback 1.0', () => {
    const r = applyEnergyVarianceModifier({
      energyDirection: 'DOWN',
      tier: CALIBRATION_TIERS.T0,
    });
    expect(r.sigmaModifierApplied).toBe(ENERGY_VARIANCE_MODIFIER.sigmaModifierNeutralT0);
    expect(r.rationale).toContain('neutral_fallback_t0');
  });
  it('T1+ readiness DOWN → σ × 1.30 amplify', () => {
    const r = applyEnergyVarianceModifier({
      energyDirection: 'DOWN',
      tier: CALIBRATION_TIERS.T1,
    });
    expect(r.sigmaModifierApplied).toBe(ENERGY_VARIANCE_MODIFIER.sigmaAmplifyFactorOnReadinessDown);
    expect(r.sigmaModifierApplied).toBeCloseTo(1.30, 5);
    expect(r.rationale).toContain('readiness_down_sigma_amplified');
  });
  it('T2 readiness UP → no amplification (1.0)', () => {
    const r = applyEnergyVarianceModifier({
      energyDirection: 'UP',
      tier: CALIBRATION_TIERS.T2,
    });
    expect(r.sigmaModifierApplied).toBe(1.0);
  });
  it('T1 readiness NONE → no amplification', () => {
    const r = applyEnergyVarianceModifier({
      energyDirection: 'NONE',
      tier: CALIBRATION_TIERS.T1,
    });
    expect(r.sigmaModifierApplied).toBe(1.0);
  });
});

describe('applySigmaModifier — multiplicative σ post-conjugate update', () => {
  it('modifier 1.0 → sigma unchanged', () => {
    expect(applySigmaModifier({ sigma: 2.0, modifier: 1.0 })).toBe(2.0);
  });
  it('modifier 1.30 → sigma × 1.30', () => {
    expect(applySigmaModifier({ sigma: 2.0, modifier: 1.30 })).toBeCloseTo(2.6, 5);
  });
  it('invalid sigma → defensive 1.0 base', () => {
    expect(applySigmaModifier({ sigma: -5, modifier: 1.0 })).toBe(1.0);
  });
  it('invalid modifier → defensive 1.0', () => {
    expect(applySigmaModifier({ sigma: 2.0, modifier: -5 })).toBe(2.0);
  });
});

describe('emitPassiveModeSignal — Cluster E2 tripwire', () => {
  it('passive mode active → medical referral required', () => {
    const r = emitPassiveModeSignal({
      specialPriorsResult: {
        passiveMode: true,
        passiveModeConditions: ['pregnant'],
      },
    });
    expect(r.active).toBe(true);
    expect(r.conditions).toContain('pregnant');
    expect(r.medicalReferralRequired).toBe(true);
  });
  it('NU passive mode → no referral required', () => {
    const r = emitPassiveModeSignal({
      specialPriorsResult: { passiveMode: false, passiveModeConditions: [] },
    });
    expect(r.active).toBe(false);
    expect(r.medicalReferralRequired).toBe(false);
  });
});

describe('getConvergenceGuardReference — §9.4.6 NU duplicate logic', () => {
  it('returns metadata pointing to ADR 009 amendment owner', () => {
    const ref = getConvergenceGuardReference();
    expect(ref.ownerSpec).toContain('ADR 009');
    expect(ref.ownerSpec).toContain('AMENDMENT');
    expect(ref.crossCutting).toBe(true);
    expect(ref.appliesToTierTransitions).toContain('T0->T1');
    expect(ref.appliesToTierTransitions).toContain('T1->T2');
    expect(ref.note).toContain('NU Engine #3 specific');
    expect(ref.note).toContain('orchestrator layer');
  });
  it('returns frozen object (immutable reference)', () => {
    const ref = getConvergenceGuardReference();
    expect(Object.isFrozen(ref)).toBe(true);
  });
});

describe('forwardConstraintObject — Hook pass-through immutable §1.10', () => {
  it('frozen constraint → returned ref unchanged', () => {
    const constraint = Object.freeze({
      intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
      volume_per_muscle: {},
      phase: 'LOAD',
      deload_window: null,
      immutable_snapshot: true,
    });
    const r = forwardConstraintObject(constraint);
    expect(r).toBe(constraint);
    expect(Object.isFrozen(r)).toBe(true);
  });
  it('non-frozen → freezes copy defensive', () => {
    const constraint = {
      intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
      volume_per_muscle: {},
      phase: 'LOAD',
      deload_window: null,
      immutable_snapshot: true,
    };
    const r = forwardConstraintObject(constraint);
    expect(Object.isFrozen(r)).toBe(true);
  });
  it('null → null', () => {
    expect(forwardConstraintObject(null)).toBe(null);
    expect(forwardConstraintObject(undefined)).toBe(null);
  });
});
