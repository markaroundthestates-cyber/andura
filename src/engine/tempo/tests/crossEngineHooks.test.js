import { describe, it, expect } from 'vitest';
import {
  readPeriodizationCorridor,
  evaluateFormConservativeAmplification,
  isDeloadWeekUnlock,
  evaluateSlowEccentricSignal,
  evaluateRirAutoBumpSignal,
  evaluateRirMismatchTelemetry,
  forwardConstraintObject,
} from '../crossEngineHooks.js';
import {
  FORM_CONSERVATIVE_AMPLIFICATION,
  RIR_AUTO_BUMP,
  ENERGY_DIRECTION,
} from '../constants.js';

describe('readPeriodizationCorridor — Hook 1 frozen read-only consume', () => {
  it('valid constraint → unpacks phase + deload window', () => {
    const constraint = Object.freeze({
      intensity_pct_1rm: { floor: 0.65, ceiling: 0.85 },
      volume_per_muscle: {},
      phase: 'LOAD',
      deload_window: null,
      immutable_snapshot: true,
    });
    const r = readPeriodizationCorridor(constraint);
    expect(r.phase).toBe('LOAD');
    expect(r.deloadWindow).toBe(null);
  });
  it('null constraint → defensive defaults', () => {
    const r = readPeriodizationCorridor(null);
    expect(r.phase).toBe(null);
    expect(r.deloadWindow).toBe(null);
  });
});

describe('evaluateFormConservativeAmplification — Cluster D11 Q11=B', () => {
  it('PEAK phase → amplified 1.5×', () => {
    const r = evaluateFormConservativeAmplification('PEAK');
    expect(r.amplified).toBe(true);
    expect(r.amplificationFactor).toBe(FORM_CONSERVATIVE_AMPLIFICATION);
    expect(r.amplificationFactor).toBeCloseTo(1.5, 5);
    expect(r.reason).toContain('PEAK_high_intensity');
  });
  it('LOAD+ phase → amplified', () => {
    const r = evaluateFormConservativeAmplification('LOAD+');
    expect(r.amplified).toBe(true);
  });
  it('LOAD baseline → NU amplified', () => {
    const r = evaluateFormConservativeAmplification('LOAD');
    expect(r.amplified).toBe(false);
    expect(r.amplificationFactor).toBe(1.0);
  });
  it('DELOAD → NU amplified (recovery week)', () => {
    const r = evaluateFormConservativeAmplification('DELOAD');
    expect(r.amplified).toBe(false);
  });
  it('null / unknown → NU amplified defensive', () => {
    expect(evaluateFormConservativeAmplification(null).amplified).toBe(false);
    expect(evaluateFormConservativeAmplification('foo').amplified).toBe(false);
  });
});

describe('isDeloadWeekUnlock — Cluster D12 Q12=D', () => {
  it('DELOAD phase → true (mind-muscle unlock recovery week)', () => {
    expect(isDeloadWeekUnlock('DELOAD')).toBe(true);
  });
  it('LOAD / LOAD+ / PEAK → false', () => {
    expect(isDeloadWeekUnlock('LOAD')).toBe(false);
    expect(isDeloadWeekUnlock('LOAD+')).toBe(false);
    expect(isDeloadWeekUnlock('PEAK')).toBe(false);
  });
});

describe('evaluateSlowEccentricSignal — Cluster D13 Q13=B', () => {
  it('Energy DOWN → slow eccentric universal active', () => {
    const r = evaluateSlowEccentricSignal(ENERGY_DIRECTION.DOWN);
    expect(r.active).toBe(true);
    expect(r.reason).toContain('rom_partial_rejected');
  });
  it('Energy UP → NU slow eccentric override', () => {
    const r = evaluateSlowEccentricSignal(ENERGY_DIRECTION.UP);
    expect(r.active).toBe(false);
  });
  it('Energy NONE → NU override', () => {
    const r = evaluateSlowEccentricSignal(ENERGY_DIRECTION.NONE);
    expect(r.active).toBe(false);
  });
  it('null / undefined → NU override defensive', () => {
    expect(evaluateSlowEccentricSignal(null).active).toBe(false);
    expect(evaluateSlowEccentricSignal(undefined).active).toBe(false);
  });
  it('reason explicitly references ROM partial REJECT (Q13=B Daniel push-back)', () => {
    const r = evaluateSlowEccentricSignal(ENERGY_DIRECTION.DOWN);
    expect(r.reason).toMatch(/rom_partial_rejected/);
  });
});

describe('evaluateRirAutoBumpSignal — Cluster D14 Q14=B', () => {
  it('form breakdown reported → bump_next_set true cu +1', () => {
    const r = evaluateRirAutoBumpSignal({ formBreakdownReported: true });
    expect(r.bump_next_set).toBe(true);
    expect(r.bump_amount).toBe(RIR_AUTO_BUMP);
    expect(r.bump_amount).toBe(1);
    expect(r.trigger_source).toBe('user_toggle_form_breakdown');
  });
  it('NU form breakdown → bump_next_set false', () => {
    const r = evaluateRirAutoBumpSignal({ formBreakdownReported: false });
    expect(r.bump_next_set).toBe(false);
    expect(r.bump_amount).toBe(0);
  });
});

describe('evaluateRirMismatchTelemetry — Cluster B4 Q4=A V1 silent telemetry only', () => {
  it('mismatch detected → telemetryOnly true, NU activeTrigger (V1 LOCKED)', () => {
    const r = evaluateRirMismatchTelemetry({ rirActual: 0, rirExpected: 2 });
    expect(r.mismatchDetected).toBe(true);
    expect(r.telemetryOnly).toBe(true);
    expect(r.activeTrigger).toBe(false); // V1 NU active trigger
    expect(r.delta).toBe(-2);
  });
  it('NU mismatch (within ±1 RIR) → mismatchDetected false', () => {
    const r = evaluateRirMismatchTelemetry({ rirActual: 2, rirExpected: 3 });
    expect(r.mismatchDetected).toBe(false);
  });
  it('exact match → NU mismatch', () => {
    const r = evaluateRirMismatchTelemetry({ rirActual: 2, rirExpected: 2 });
    expect(r.mismatchDetected).toBe(false);
    expect(r.delta).toBe(0);
  });
  it('invalid inputs → telemetryOnly true defensive', () => {
    const r = evaluateRirMismatchTelemetry({});
    expect(r.mismatchDetected).toBe(false);
    expect(r.telemetryOnly).toBe(true);
    expect(r.delta).toBe(null);
  });
  it('Q4=A invariant — activeTrigger ALWAYS false V1 (NU active trigger)', () => {
    // Iterate scenarios: V1 contract must NEVER set activeTrigger=true
    const scenarios = [
      { rirActual: 0, rirExpected: 5 },
      { rirActual: 5, rirExpected: 0 },
      { rirActual: 3, rirExpected: 3 },
      { rirActual: 'foo', rirExpected: 2 },
    ];
    for (const s of scenarios) {
      expect(evaluateRirMismatchTelemetry(s).activeTrigger).toBe(false);
    }
  });
});

describe('forwardConstraintObject — Hook pass-through immutable', () => {
  it('frozen constraint → returned ref unchanged', () => {
    const constraint = Object.freeze({
      intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
      volume_per_muscle: {},
      phase: 'LOAD',
      deload_window: null,
      immutable_snapshot: true,
    });
    const r = forwardConstraintObject(constraint);
    expect(r).toBe(constraint); // reference identity
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
