import { describe, it, expect } from 'vitest';
import {
  consumeFrozenConstraint,
  consumeGoalPhase,
  consumeEnergyReadiness,
  consumeSpecializationWeakGroup,
  forwardConstraintObject,
  getConvergenceGuardReference,
  isPainAwareProactiveTrigger,
  detectInjuryDisabled,
} from '../crossEngineHooks.js';
import {
  SCHEMA_CONSTANTS,
} from '../constants.js';

describe('consumeFrozenConstraint — Hook D1 read-only anti-cascade §1.10', () => {
  it('Valid frozen constraint → unpacks phase + deload window', () => {
    const constraint = Object.freeze({
      intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
      volume_per_muscle: {},
      phase: 'LOAD',
      deload_window: null,
      immutable_snapshot: true,
    });
    const r = consumeFrozenConstraint(constraint);
    expect(r.frozen).toBe(true);
    expect(r.phase).toBe('LOAD');
    expect(r.deloadWindow).toBe(null);
  });

  it('DELOAD phase → rationale flagged for D1 lighter routine', () => {
    const constraint = Object.freeze({
      phase: 'DELOAD',
      deload_window: { trigger: 'CALENDAR', days: 7 },
      immutable_snapshot: true,
    });
    const r = consumeFrozenConstraint(constraint);
    expect(r.phase).toBe('DELOAD');
    expect(r.rationale).toContain('deload_week_d1_lighter_routine');
  });

  it('null constraint → defensive defaults', () => {
    const r = consumeFrozenConstraint(null);
    expect(r.phase).toBe(null);
    expect(r.deloadWindow).toBe(null);
  });

  it('Anti-cascade — input frozen object NU mutated', () => {
    const constraint = Object.freeze({ phase: 'LOAD', deload_window: null });
    consumeFrozenConstraint(constraint);
    expect(Object.isFrozen(constraint)).toBe(true);
    // Returned signal is metadata-only; original constraint unchanged
    expect(constraint.phase).toBe('LOAD');
  });
});

describe('consumeGoalPhase — Hook D2 light coupling', () => {
  it('CUT preserve full Maria 65 retention', () => {
    const r = consumeGoalPhase('CUT');
    expect(r.goalPhase).toBe('CUT');
    expect(r.adjustmentRationale).toContain('cut_preserve_full');
  });

  it('BULK Marius full ramp 50/70/90%', () => {
    const r = consumeGoalPhase('BULK');
    expect(r.goalPhase).toBe('BULK');
    expect(r.adjustmentRationale).toContain('bulk_marius_full_ramp');
  });

  it('MAINTAIN baseline preserved', () => {
    const r = consumeGoalPhase('MAINTAIN');
    expect(r.adjustmentRationale).toContain('maintain_baseline');
  });

  it('RECOMP baseline preserved (sub-phase MAINTAIN treatment)', () => {
    const r = consumeGoalPhase('RECOMP');
    expect(r.adjustmentRationale).toContain('recomp_baseline');
  });

  it('null → unresolved baseline default', () => {
    const r = consumeGoalPhase(null);
    expect(r.goalPhase).toBe(null);
    expect(r.adjustmentRationale).toContain('unresolved');
  });
});

describe('consumeEnergyReadiness — Hook D3 anti-cascade preserve §1.10', () => {
  it('DOWN → autoShortenApplied true (5-10 → 5-7 min)', () => {
    const r = consumeEnergyReadiness('DOWN');
    expect(r.energyDirection).toBe('DOWN');
    expect(r.autoShortenApplied).toBe(true);
    expect(r.rationale).toContain('auto_shorten_upper_bound');
    expect(r.rationale).toContain(`5_${SCHEMA_CONSTANTS.durationMaxEnergyDown}`);
  });

  it('UP → no auto-shorten', () => {
    const r = consumeEnergyReadiness('UP');
    expect(r.autoShortenApplied).toBe(false);
  });

  it('NONE → no modulation', () => {
    const r = consumeEnergyReadiness('NONE');
    expect(r.autoShortenApplied).toBe(false);
  });

  it('null / undefined → defensive NONE no shorten', () => {
    expect(consumeEnergyReadiness(null).autoShortenApplied).toBe(false);
    expect(consumeEnergyReadiness(undefined).autoShortenApplied).toBe(false);
  });
});

describe('consumeSpecializationWeakGroup — Hook D4 PARALLEL modifier §9.6', () => {
  it('Valid weak group → prioritized true', () => {
    const r = consumeSpecializationWeakGroup('back');
    expect(r.weakGroup).toBe('back');
    expect(r.prioritized).toBe(true);
    expect(r.rationale).toContain('weak_group_back_prioritized_d4_q11_b_parallel_modifier');
  });

  it('case-insensitive normalize', () => {
    const r = consumeSpecializationWeakGroup('CHEST');
    expect(r.weakGroup).toBe('chest');
    expect(r.prioritized).toBe(true);
  });

  it('null → no signal', () => {
    const r = consumeSpecializationWeakGroup(null);
    expect(r.weakGroup).toBe(null);
    expect(r.prioritized).toBe(false);
  });

  it('Empty string → no signal', () => {
    const r = consumeSpecializationWeakGroup('');
    expect(r.weakGroup).toBe(null);
    expect(r.prioritized).toBe(false);
  });
});

describe('forwardConstraintObject — Hook D5 pass-through immutable', () => {
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

describe('getConvergenceGuardReference — §9.4.6 reference-only NU duplicate', () => {
  it('Returns metadata pointing to ADR 009 §AMENDMENT owner', () => {
    const ref = getConvergenceGuardReference();
    expect(ref.ownerSpec).toContain('ADR 009');
    expect(ref.ownerSpec).toContain('AMENDMENT');
    expect(ref.ruleName).toContain('Convergence Guard');
    expect(ref.ruleName).toContain('T2 Unlock');
    expect(ref.cleanSignalRule).toContain('NU proactive trigger Pain-Aware');
  });

  it('Returns frozen object (immutable reference)', () => {
    const ref = getConvergenceGuardReference();
    expect(Object.isFrozen(ref)).toBe(true);
  });
});

describe('isPainAwareProactiveTrigger — Clean Signal rule preserved', () => {
  it('Always returns false V1 (Warm-up NU proactive trigger)', () => {
    expect(isPainAwareProactiveTrigger()).toBe(false);
  });
});

describe('detectInjuryDisabled — Pain-Aware §9.4.6 reference', () => {
  it('Pain Button active → disabled true', () => {
    const r = detectInjuryDisabled({
      painButtonActive: true,
      painAffectedGroups: ['chest', 'shoulders'],
    });
    expect(r.disabled).toBe(true);
    expect(r.affectedGroups).toEqual(['chest', 'shoulders']);
    expect(r.rationale).toContain('pain_button_user_triggered');
  });

  it('Pain Button inactive → disabled false', () => {
    const r = detectInjuryDisabled({ painButtonActive: false });
    expect(r.disabled).toBe(false);
  });

  it('No painButtonActive in input → disabled false defensive', () => {
    expect(detectInjuryDisabled({}).disabled).toBe(false);
  });

  it('Affected groups frozen immutable', () => {
    const r = detectInjuryDisabled({
      painButtonActive: true,
      painAffectedGroups: ['legs'],
    });
    expect(Object.isFrozen(r.affectedGroups)).toBe(true);
  });
});
