import { describe, it, expect } from 'vitest';
import {
  emitParallelModifier,
  emitDeloadPreserved,
  emitCutDisable,
  emitInjuryAutoDisable,
  emitLightCoupling,
  getConvergenceGuardReference,
  forwardConstraintObject,
} from '../crossEngineHooks.js';

describe('emitParallelModifier — Cluster D1 Q11=B PARALLEL NU REPLACE', () => {
  it('active + ACCUMULATION → applied parallel mode', () => {
    const r = emitParallelModifier({
      periodizationPhase:    'ACCUMULATION',
      specializationActive:  true,
    });
    expect(r.applied).toBe(true);
    expect(r.mode).toBe('parallel');
    expect(r.eligiblePhase).toBe('ACCUMULATION');
    expect(r.rationale).toContain('q11_b');
    expect(r.rationale).toContain('nu_replace');
  });

  it('active + LOAD → applied parallel mode', () => {
    const r = emitParallelModifier({
      periodizationPhase:    'LOAD',
      specializationActive:  true,
    });
    expect(r.applied).toBe(true);
  });

  it('active + PEAK → NOT applied (phase suspended)', () => {
    const r = emitParallelModifier({
      periodizationPhase:    'PEAK',
      specializationActive:  true,
    });
    expect(r.applied).toBe(false);
    expect(r.eligiblePhase).toBeNull();
  });

  it('active + DELOAD → NOT applied (Engine #4 owns)', () => {
    const r = emitParallelModifier({
      periodizationPhase:    'DELOAD',
      specializationActive:  true,
    });
    expect(r.applied).toBe(false);
  });

  it('NOT active → NOT applied (no parallel modifier emit)', () => {
    const r = emitParallelModifier({
      periodizationPhase:    'LOAD',
      specializationActive:  false,
    });
    expect(r.applied).toBe(false);
  });

  it('mode always "parallel" V1 invariant — NU REPLACE Engine #1', () => {
    const cases = [
      { periodizationPhase: 'LOAD', specializationActive: true },
      { periodizationPhase: 'PEAK', specializationActive: true },
      { periodizationPhase: 'DELOAD', specializationActive: false },
    ];
    for (const c of cases) {
      expect(emitParallelModifier(c).mode).toBe('parallel');
    }
  });

  it('rationale documents anti-cascade §1.10 preservation', () => {
    const r = emitParallelModifier({
      periodizationPhase:    'ACCUMULATION',
      specializationActive:  true,
    });
    expect(r.rationale).toContain('anti_cascade');
  });
});

describe('emitDeloadPreserved — Cluster D2 Q12=A non-negotiable', () => {
  it('DELOAD phase → suspended', () => {
    const r = emitDeloadPreserved({ periodizationPhase: 'DELOAD' });
    expect(r.suspended).toBe(true);
    expect(r.rationale).toContain('q12_a');
    expect(r.rationale).toContain('engine_4_owns');
  });

  it('non-DELOAD phase → NOT suspended', () => {
    expect(emitDeloadPreserved({ periodizationPhase: 'ACCUMULATION' }).suspended).toBe(false);
    expect(emitDeloadPreserved({ periodizationPhase: 'LOAD' }).suspended).toBe(false);
    expect(emitDeloadPreserved({ periodizationPhase: 'PEAK' }).suspended).toBe(false);
  });

  it('case-insensitive normalized', () => {
    expect(emitDeloadPreserved({ periodizationPhase: 'deload' }).suspended).toBe(true);
  });

  it('null input → safe defaults', () => {
    expect(emitDeloadPreserved({}).suspended).toBe(false);
  });
});

describe('emitCutDisable — Cluster D3 Q5=D + Q13=A dual safety gate', () => {
  it('CUT phase → blocked', () => {
    const r = emitCutDisable({ goalPhase: 'CUT' });
    expect(r.blocked).toBe(true);
    expect(r.phase).toBe('CUT');
    expect(r.rationale).toContain('q5_d');
    expect(r.rationale).toContain('q13_a');
    expect(r.rationale).toContain('invariant_5');
  });

  it('BULK → NOT blocked', () => {
    expect(emitCutDisable({ goalPhase: 'BULK' }).blocked).toBe(false);
  });

  it('RECOMP → NOT blocked', () => {
    expect(emitCutDisable({ goalPhase: 'RECOMP' }).blocked).toBe(false);
  });

  it('MAINTAIN → NOT blocked (separate gating eligibility)', () => {
    expect(emitCutDisable({ goalPhase: 'MAINTAIN' }).blocked).toBe(false);
  });

  it('case-insensitive normalized', () => {
    expect(emitCutDisable({ goalPhase: 'cut' }).blocked).toBe(true);
  });

  it('rationale documents recovery risk universal anti-pattern', () => {
    const r = emitCutDisable({ goalPhase: 'CUT' });
    expect(r.rationale).toContain('recovery_risk_universal');
  });
});

describe('emitInjuryAutoDisable — Cluster D4 Q14=A Safety Override invariant 5', () => {
  it('PainButton inactive → NOT disabled', () => {
    const r = emitInjuryAutoDisable({ painButtonActive: false });
    expect(r.disabled).toBe(false);
  });

  it('PainButton active + target affected → disabled', () => {
    const r = emitInjuryAutoDisable({
      painButtonActive: true,
      affectedGroups:   ['legs'],
      targetGroup:      'legs',
    });
    expect(r.disabled).toBe(true);
    expect(r.affectedGroup).toBe('legs');
    expect(r.rationale).toContain('q14_a');
    expect(r.rationale).toContain('invariant_5');
    expect(r.rationale).toContain('layer_5_medical_safety');
  });

  it('PainButton active + any group affected (NOT target) → conservative disable', () => {
    const r = emitInjuryAutoDisable({
      painButtonActive: true,
      affectedGroups:   ['back'],
      targetGroup:      'biceps',
    });
    expect(r.disabled).toBe(true);
    expect(r.rationale).toContain('conservative');
  });

  it('PainButton active + no affected groups → NOT disabled (no actionable signal)', () => {
    const r = emitInjuryAutoDisable({
      painButtonActive: true,
      affectedGroups:   [],
    });
    expect(r.disabled).toBe(false);
  });

  it('case-insensitive group matching', () => {
    const r = emitInjuryAutoDisable({
      painButtonActive: true,
      affectedGroups:   ['LEGS'],
      targetGroup:      'legs',
    });
    expect(r.disabled).toBe(true);
  });
});

describe('emitLightCoupling — Cluster D5 Engine #5 + #6 light coupling Q18=C', () => {
  it('Energy DOWN + recurrent → conservative scaling', () => {
    const r = emitLightCoupling({
      energyDirection:        'DOWN',
      energyDownRecurrent:    true,
    });
    expect(r.energyConservativeScaling).toBe(true);
    expect(r.rationale).toContain('anti_cascade_compounding');
  });

  it('Energy DOWN isolated (NOT recurrent) → NO conservative scaling', () => {
    const r = emitLightCoupling({
      energyDirection:        'DOWN',
      energyDownRecurrent:    false,
    });
    expect(r.energyConservativeScaling).toBe(false);
  });

  it('Energy UP → NO conservative scaling', () => {
    const r = emitLightCoupling({
      energyDirection:        'UP',
      energyDownRecurrent:    false,
    });
    expect(r.energyConservativeScaling).toBe(false);
  });

  it('tempoPreserved always true V1 invariant — Specialization NU mutates Engine #6', () => {
    const cases = [
      { energyDirection: 'DOWN', energyDownRecurrent: true },
      { energyDirection: 'UP', energyDownRecurrent: false },
      { energyDirection: null, energyDownRecurrent: false },
      {},
    ];
    for (const c of cases) {
      expect(emitLightCoupling(c).tempoPreserved).toBe(true);
    }
  });

  it('null energyDirection → safe defaults (no scaling)', () => {
    const r = emitLightCoupling({});
    expect(r.energyConservativeScaling).toBe(false);
    expect(r.tempoPreserved).toBe(true);
  });
});

describe('getConvergenceGuardReference — NU duplicate logic in Specialization', () => {
  it('returns frozen metadata describing Convergence Guard SSOT', () => {
    const r = getConvergenceGuardReference();
    expect(Object.isFrozen(r)).toBe(true);
    expect(r.ownerSpec).toBe('ADR 009 §AMENDMENT 2026-05-05 birou after');
    expect(r.crossCutting).toBe(true);
    expect(Object.isFrozen(r.appliesToTierTransitions)).toBe(true);
    expect(r.appliesToTierTransitions).toContain('T0->T1');
    expect(r.appliesToTierTransitions).toContain('T1->T2');
    expect(r.note).toContain('NU Engine Specialization specific');
    expect(r.note).toContain('orchestrator/utilities/convergenceGuard.js');
  });

  it('mirrors §9.4 Bayesian + §9.5 Tempo precedent pattern', () => {
    const r = getConvergenceGuardReference();
    expect(r.note).toContain('Bayesian Nutrition');
    expect(r.note).toContain('Tempo');
    expect(r.note).toContain('5a16550');
  });

  it('reference deterministic (same call = same metadata)', () => {
    const r1 = getConvergenceGuardReference();
    const r2 = getConvergenceGuardReference();
    expect(r1.ownerSpec).toBe(r2.ownerSpec);
  });
});

describe('forwardConstraintObject — anti-cascade §1.10 immutable Hook 1', () => {
  it('frozen constraint forwarded as-is (same reference)', () => {
    const constraint = Object.freeze({ phase: 'LOAD', floor: 0.7 });
    const r = forwardConstraintObject(constraint);
    expect(r).toBe(constraint);
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

  it('non-object → null', () => {
    expect(forwardConstraintObject('string')).toBeNull();
    expect(forwardConstraintObject(42)).toBeNull();
  });

  it('Specialization NU mutate input — anti-cascade safeguard preserved', () => {
    const constraint = Object.freeze({ phase: 'PEAK' });
    forwardConstraintObject(constraint);
    expect(constraint.phase).toBe('PEAK');
    expect(Object.isFrozen(constraint)).toBe(true);
  });
});
