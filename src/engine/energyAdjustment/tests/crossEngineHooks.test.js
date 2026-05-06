import { describe, it, expect } from 'vitest';
import {
  readPeriodizationCorridor,
  applyIntensityAdjustmentInterior,
  applyVolumeAdjustmentInterior,
  countConsecutiveSubFloorSessions,
  emitDeloadTrigger,
  emitBayesianVarianceModifier,
  forwardConstraintObject,
} from '../crossEngineHooks.js';
import {
  HARD_CAP_INTENSITY_PCT_1RM,
  SUB_FLOOR_MAX_CONSECUTIVE,
  BAYESIAN_VARIANCE_MODIFIER,
} from '../constants.js';

describe('readPeriodizationCorridor — Hook 1 frozen read-only consume', () => {
  it('valid constraint → unpacks corridors + phase + deload window', () => {
    const constraint = Object.freeze({
      intensity_pct_1rm: { floor: 0.65, ceiling: 0.85 },
      volume_per_muscle: { chest: { floor: 8, ceiling: 14 } },
      phase: 'LOAD',
      deload_window: null,
      immutable_snapshot: true,
    });
    const r = readPeriodizationCorridor(constraint);
    expect(r.intensityCorridor).toEqual({ floor: 0.65, ceiling: 0.85 });
    expect(r.volumeCorridor.chest).toEqual({ floor: 8, ceiling: 14 });
    expect(r.phase).toBe('LOAD');
    expect(r.deloadWindow).toBe(null);
  });
  it('null constraint → defensive defaults', () => {
    const r = readPeriodizationCorridor(null);
    expect(r.intensityCorridor.floor).toBe(0.70);
    expect(r.intensityCorridor.ceiling).toBe(0.85);
    expect(r.volumeCorridor).toEqual({});
    expect(r.phase).toBe(null);
  });
  it('partial constraint missing fields → preserves valid + defaults missing', () => {
    const r = readPeriodizationCorridor({ phase: 'PEAK' });
    expect(r.phase).toBe('PEAK');
    expect(r.volumeCorridor).toEqual({});
  });
});

describe('applyIntensityAdjustmentInterior — anti-cascade clamp Periodization corridor', () => {
  const baseCorridor = { floor: 0.70, ceiling: 0.85 };

  it('zero adjustment → corridor unchanged', () => {
    const r = applyIntensityAdjustmentInterior({
      intensityCorridor: baseCorridor,
      adjustmentMagnitudePct: 0,
    });
    expect(r.floor).toBe(0.70);
    expect(r.ceiling).toBe(0.85);
  });
  it('UP +15% → floor shifts up but ceiling preserved (anti-cascade)', () => {
    const r = applyIntensityAdjustmentInterior({
      intensityCorridor: baseCorridor,
      adjustmentMagnitudePct: 0.15,
    });
    expect(r.floor).toBeGreaterThan(0.70); // shifted up
    expect(r.ceiling).toBe(0.85); // preserved
  });
  it('DOWN -15% → ceiling shifts down but floor preserved (anti-cascade)', () => {
    const r = applyIntensityAdjustmentInterior({
      intensityCorridor: baseCorridor,
      adjustmentMagnitudePct: -0.15,
    });
    expect(r.ceiling).toBeLessThan(0.85);
    expect(r.floor).toBe(0.70);
  });
  it('hard cap 90% 1RM Layer C sanity bound enforced', () => {
    const r = applyIntensityAdjustmentInterior({
      intensityCorridor: { floor: 0.85, ceiling: 0.95 }, // already over hard cap
      adjustmentMagnitudePct: 0.15,
    });
    expect(r.ceiling).toBeLessThanOrEqual(HARD_CAP_INTENSITY_PCT_1RM);
  });
  it('null corridor → defensive defaults', () => {
    const r = applyIntensityAdjustmentInterior({
      intensityCorridor: null,
      adjustmentMagnitudePct: 0.15,
    });
    expect(r.floor).toBe(0.70);
    expect(r.ceiling).toBe(0.85);
  });
});

describe('applyVolumeAdjustmentInterior — MRV invariant 1 immutable Q8=A', () => {
  const baseCorridor = {
    chest: { floor: 8, ceiling: 14 },
    back:  { floor: 10, ceiling: 18 },
  };

  it('zero adjustment → corridors unchanged', () => {
    const r = applyVolumeAdjustmentInterior({
      volumeCorridor: baseCorridor,
      adjustmentMagnitudePct: 0,
    });
    expect(r.chest.floor).toBe(8);
    expect(r.chest.ceiling).toBe(14);
  });
  it('UP +15% → MRV ceiling NU exceeded (invariant Q8=A)', () => {
    const r = applyVolumeAdjustmentInterior({
      volumeCorridor: baseCorridor,
      adjustmentMagnitudePct: 0.15,
    });
    expect(r.chest.ceiling).toBeLessThanOrEqual(14);
    expect(r.back.ceiling).toBeLessThanOrEqual(18);
  });
  it('DOWN -15% → floor NU below MEV', () => {
    const r = applyVolumeAdjustmentInterior({
      volumeCorridor: baseCorridor,
      adjustmentMagnitudePct: -0.15,
    });
    expect(r.chest.floor).toBeGreaterThanOrEqual(8);
  });
  it('empty corridor → empty result defensive', () => {
    expect(applyVolumeAdjustmentInterior({ volumeCorridor: {}, adjustmentMagnitudePct: 0.15 })).toEqual({});
    expect(applyVolumeAdjustmentInterior({ volumeCorridor: null, adjustmentMagnitudePct: 0.15 })).toEqual({});
  });
});

describe('countConsecutiveSubFloorSessions — Q9 anti-drift sub-Floor count', () => {
  it('zero sessions → 0', () => {
    expect(countConsecutiveSubFloorSessions([])).toBe(0);
    expect(countConsecutiveSubFloorSessions(null)).toBe(0);
  });
  it('3 consecutive subFloor → 3', () => {
    const sessions = [
      { subFloor: true },
      { subFloor: true },
      { subFloor: true },
    ];
    expect(countConsecutiveSubFloorSessions(sessions)).toBe(3);
  });
  it('first non-subFloor breaks streak', () => {
    const sessions = [
      { subFloor: true },
      { subFloor: false },
      { subFloor: true },
    ];
    expect(countConsecutiveSubFloorSessions(sessions)).toBe(1);
  });
});

describe('emitDeloadTrigger — Q9 anti-drift escalation 3rd session', () => {
  it('no sub-floor → no escalation', () => {
    const r = emitDeloadTrigger({ recentSessions: [], currentSessionSubFloor: false });
    expect(r.escalationTriggered).toBe(false);
    expect(r.consecutiveSubFloorSessions).toBe(0);
  });
  it('1 prior + current sub-Floor → 2 consecutive within max', () => {
    const r = emitDeloadTrigger({
      recentSessions: [{ subFloor: true }],
      currentSessionSubFloor: true,
    });
    expect(r.consecutiveSubFloorSessions).toBe(2);
    expect(r.escalationTriggered).toBe(false); // max 2 allowed soft override
  });
  it('2 prior + current sub-Floor → 3rd session escalation triggered', () => {
    const r = emitDeloadTrigger({
      recentSessions: [{ subFloor: true }, { subFloor: true }],
      currentSessionSubFloor: true,
    });
    expect(r.consecutiveSubFloorSessions).toBe(3);
    expect(r.escalationTriggered).toBe(true);
    expect(r.reason).toContain('escalate_deload');
  });
  it('SUB_FLOOR_MAX_CONSECUTIVE = 2 verbatim Q9', () => {
    expect(SUB_FLOOR_MAX_CONSECUTIVE).toBe(2);
  });
});

describe('emitBayesianVarianceModifier — Q12=C sophisticated formula', () => {
  it('low σ → NU dampening, magnitude preserved', () => {
    const r = emitBayesianVarianceModifier({
      adjustmentMagnitudePct: 0.15,
      bayesianSigma: 0.10,
    });
    expect(r.dampeningApplied).toBe(false);
    expect(r.adjustmentMagnitudePostDampening).toBe(0.15);
  });
  it('high σ > threshold → dampening × 0.7', () => {
    const r = emitBayesianVarianceModifier({
      adjustmentMagnitudePct: 0.15,
      bayesianSigma: 0.30,
    });
    expect(r.dampeningApplied).toBe(true);
    expect(r.adjustmentMagnitudePostDampening).toBeCloseTo(0.15 * BAYESIAN_VARIANCE_MODIFIER.dampeningFactor, 5);
    expect(r.adjustmentMagnitudePostDampening).toBeCloseTo(0.105, 5);
  });
  it('threshold edge σ = 0.20 → NOT dampening (strict > comparison)', () => {
    const r = emitBayesianVarianceModifier({
      adjustmentMagnitudePct: 0.15,
      bayesianSigma: BAYESIAN_VARIANCE_MODIFIER.sigmaThresholdHigh,
    });
    expect(r.dampeningApplied).toBe(false);
  });
  it('missing σ → defensive 0 → no dampening', () => {
    const r = emitBayesianVarianceModifier({ adjustmentMagnitudePct: 0.15 });
    expect(r.dampeningApplied).toBe(false);
    expect(r.adjustmentMagnitudePostDampening).toBe(0.15);
  });
});

describe('forwardConstraintObject — Hook 4 pass-through immutable §1.10', () => {
  it('frozen constraint → returned ref unchanged', () => {
    const constraint = Object.freeze({
      intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
      volume_per_muscle: {},
      phase: 'LOAD',
      deload_window: null,
      immutable_snapshot: true,
    });
    const r = forwardConstraintObject(constraint);
    expect(r).toBe(constraint); // reference identity preserved
    expect(Object.isFrozen(r)).toBe(true);
  });
  it('non-frozen object → freezes copy defensive', () => {
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
