import { describe, it, expect } from 'vitest';
import {
  detectHighIntensityAmplification,
  detectDeloadMindMuscleUnlock,
  detectEnergyDownSlowEccentric,
  emitFormBreakdownAutoBump,
  detectRirMismatchSilentTelemetry,
  getConvergenceGuardReference,
  forwardConstraintObject,
} from '../crossEngineHooks.js';
import { ENERGY_DIRECTION, RIR_MISMATCH_BEHAVIOR_V1 } from '../constants.js';

describe('detectHighIntensityAmplification — Cluster D11 Q11=B', () => {
  it('PEAK phase → amplified true', () => {
    const r = detectHighIntensityAmplification({ periodizationPhase: 'PEAK' });
    expect(r.amplified).toBe(true);
    expect(r.rationale).toContain('q11_b');
  });

  it('LOAD phase → amplified true', () => {
    const r = detectHighIntensityAmplification({ periodizationPhase: 'LOAD' });
    expect(r.amplified).toBe(true);
  });

  it('ACCUMULATION phase → not amplified', () => {
    const r = detectHighIntensityAmplification({ periodizationPhase: 'ACCUMULATION' });
    expect(r.amplified).toBe(false);
  });

  it('DELOAD phase → not amplified (separate Cluster D12 Hook)', () => {
    const r = detectHighIntensityAmplification({ periodizationPhase: 'DELOAD' });
    expect(r.amplified).toBe(false);
  });

  it('null/undefined input → safe defaults', () => {
    expect(detectHighIntensityAmplification({}).amplified).toBe(false);
  });

  it('lowercase normalized via toUpperCase', () => {
    expect(detectHighIntensityAmplification({ periodizationPhase: 'peak' }).amplified).toBe(true);
  });
});

describe('detectDeloadMindMuscleUnlock — Cluster D12 Q12=D', () => {
  it('DELOAD phase → unlocked + overridesTierDefault', () => {
    const r = detectDeloadMindMuscleUnlock({ periodizationPhase: 'DELOAD' });
    expect(r.unlocked).toBe(true);
    expect(r.overridesTierDefault).toBe(true);
    expect(r.rationale).toContain('q12_d');
  });

  it('non-DELOAD phase → not unlocked', () => {
    expect(detectDeloadMindMuscleUnlock({ periodizationPhase: 'PEAK' }).unlocked).toBe(false);
    expect(detectDeloadMindMuscleUnlock({ periodizationPhase: 'LOAD' }).unlocked).toBe(false);
    expect(detectDeloadMindMuscleUnlock({ periodizationPhase: 'ACCUMULATION' }).unlocked).toBe(false);
  });

  it('case-insensitive normalized', () => {
    expect(detectDeloadMindMuscleUnlock({ periodizationPhase: 'deload' }).unlocked).toBe(true);
  });

  it('null input → safe defaults', () => {
    expect(detectDeloadMindMuscleUnlock({}).unlocked).toBe(false);
  });
});

describe('detectEnergyDownSlowEccentric — Cluster D13 Q13=B (NU ROM partial)', () => {
  it('Energy DOWN → slow eccentric applied', () => {
    const r = detectEnergyDownSlowEccentric({ energyDirection: 'DOWN' });
    expect(r.applied).toBe(true);
    expect(r.energyDirection).toBe(ENERGY_DIRECTION.DOWN);
    expect(r.rationale).toContain('q13_b');
    expect(r.rationale).toContain('no_rom_partial_reject');
  });

  it('Energy UP → not applied', () => {
    expect(detectEnergyDownSlowEccentric({ energyDirection: 'UP' }).applied).toBe(false);
  });

  it('Energy NONE → not applied', () => {
    expect(detectEnergyDownSlowEccentric({ energyDirection: 'NONE' }).applied).toBe(false);
  });

  it('case-insensitive normalized', () => {
    expect(detectEnergyDownSlowEccentric({ energyDirection: 'down' }).applied).toBe(true);
  });

  it('invalid string → normalized to NONE', () => {
    const r = detectEnergyDownSlowEccentric({ energyDirection: 'random_xyz' });
    expect(r.applied).toBe(false);
    expect(r.energyDirection).toBe(ENERGY_DIRECTION.NONE);
  });

  it('rationale documents Gemini self-flagged ROM partial REJECT corect', () => {
    const r = detectEnergyDownSlowEccentric({ energyDirection: 'DOWN' });
    expect(r.rationale).toContain('mrv_invariant_1');
  });
});

describe('emitFormBreakdownAutoBump — Cluster D14 Q14=B (anti-cascade ADR 030 D2)', () => {
  it('formBreakdownToggled true → emit signal +1 RIR increment', () => {
    const r = emitFormBreakdownAutoBump({ formBreakdownToggled: true });
    expect(r.emit).toBe(true);
    expect(r.rirIncrement).toBe(1);
    expect(r.rationale).toContain('q14_b');
    expect(r.rationale).toContain('orchestrator_layer_applies');
  });

  it('formBreakdownToggled false → no emit, 0 increment', () => {
    const r = emitFormBreakdownAutoBump({ formBreakdownToggled: false });
    expect(r.emit).toBe(false);
    expect(r.rirIncrement).toBe(0);
  });

  it('missing input → safe defaults (no emit)', () => {
    expect(emitFormBreakdownAutoBump({}).emit).toBe(false);
  });

  it('Tempo emite signal — orchestrator applies (NU direct mutation per ADR 030 D2)', () => {
    // Verify rationale documents anti-cascade architectural rule
    const r = emitFormBreakdownAutoBump({ formBreakdownToggled: true });
    expect(r.rationale).toContain('anti_cascade');
  });
});

describe('detectRirMismatchSilentTelemetry — Q4=A V1 silent only', () => {
  it('form breakdown + RIR divergence >= 1 → flagged silent telemetry', () => {
    const r = detectRirMismatchSilentTelemetry({
      userReportedFormBreakdown: true,
      rirMatrixExpected:         2,
      rirActual:                 0,
    });
    expect(r.flagged).toBe(true);
    expect(r.behavior).toBe(RIR_MISMATCH_BEHAVIOR_V1);
    expect(r.rationale).toContain('q4_a_v1_no_active_trigger');
  });

  it('form breakdown but small divergence (<1) → NOT flagged', () => {
    const r = detectRirMismatchSilentTelemetry({
      userReportedFormBreakdown: true,
      rirMatrixExpected:         2,
      rirActual:                 2,
    });
    expect(r.flagged).toBe(false);
  });

  it('NO form breakdown but RIR divergence → NOT flagged (form_breakdown gate)', () => {
    const r = detectRirMismatchSilentTelemetry({
      userReportedFormBreakdown: false,
      rirMatrixExpected:         2,
      rirActual:                 0,
    });
    expect(r.flagged).toBe(false);
  });

  it('missing RIR data → not flagged (insufficient signal)', () => {
    const r = detectRirMismatchSilentTelemetry({
      userReportedFormBreakdown: true,
    });
    expect(r.flagged).toBe(false);
  });

  it('behavior ALWAYS = silent_telemetry_only (V1 invariant Q4=A)', () => {
    // V1 explicit constraint — engine NU active trigger; V1.5+ candidate per
    // §9.5.6 Reconsideration Trigger 2.
    const cases = [
      { userReportedFormBreakdown: true, rirMatrixExpected: 2, rirActual: 0 },
      { userReportedFormBreakdown: false },
      {},
    ];
    for (const c of cases) {
      const r = detectRirMismatchSilentTelemetry(c);
      expect(r.behavior).toBe('silent_telemetry_only');
    }
  });
});

describe('getConvergenceGuardReference — NU duplicate logic în Tempo', () => {
  it('returns frozen metadata describing where Convergence Guard lives', () => {
    const r = getConvergenceGuardReference();
    expect(Object.isFrozen(r)).toBe(true);
    expect(r.ownerSpec).toBe('ADR 009 §AMENDMENT 2026-05-05 birou after');
    expect(r.crossCutting).toBe(true);
    expect(Object.isFrozen(r.appliesToTierTransitions)).toBe(true);
    expect(r.appliesToTierTransitions).toContain('T0->T1');
    expect(r.appliesToTierTransitions).toContain('T1->T2');
    expect(r.note).toContain('NU Engine Tempo specific');
    expect(r.note).toContain('orchestrator/utilities/convergenceGuard.js');
  });

  it('mirrors §9.4 Bayesian pattern (commit 8615ec1 precedent reference)', () => {
    const r = getConvergenceGuardReference();
    expect(r.note).toContain('Bayesian Nutrition');
    expect(r.note).toContain('5a16550');
  });

  it('reference is deterministic (same call = same metadata)', () => {
    const r1 = getConvergenceGuardReference();
    const r2 = getConvergenceGuardReference();
    expect(r1.ownerSpec).toBe(r2.ownerSpec);
    expect(r1.crossCutting).toBe(r2.crossCutting);
  });
});

describe('forwardConstraintObject — anti-cascade §1.10 immutable Hook 1', () => {
  it('frozen constraint forwarded as-is (NU re-frozen)', () => {
    const constraint = Object.freeze({ phase: 'LOAD', floor: 0.7 });
    const r = forwardConstraintObject(constraint);
    expect(r).toBe(constraint); // same reference
  });

  it('non-frozen object → frozen copy returned', () => {
    const constraint = { phase: 'LOAD' };
    const r = forwardConstraintObject(constraint);
    expect(Object.isFrozen(r)).toBe(true);
    expect(r.phase).toBe('LOAD');
  });

  it('null → null', () => {
    expect(forwardConstraintObject(null)).toBeNull();
  });

  it('undefined → null', () => {
    expect(forwardConstraintObject(undefined)).toBeNull();
  });

  it('non-object input → null', () => {
    expect(forwardConstraintObject('string')).toBeNull();
    expect(forwardConstraintObject(42)).toBeNull();
  });

  it('Tempo NU mutate input — anti-cascade safeguard preserved', () => {
    const constraint = Object.freeze({ phase: 'PEAK', readonly: true });
    const r = forwardConstraintObject(constraint);
    expect(r.phase).toBe('PEAK');
    expect(Object.isFrozen(r)).toBe(true);
  });
});
