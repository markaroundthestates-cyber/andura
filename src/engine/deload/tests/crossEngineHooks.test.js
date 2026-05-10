import { describe, it, expect } from 'vitest';
import {
  consumeFrozenConstraint,
  consumeGoalPhase,
  consumeEnergyReadiness,
  consumeBayesianPainAware,
  consumeSpecializationActive,
  forwardWarmupLighterSignal,
  forwardConstraintObject,
  getConvergenceGuardReference,
  isPainAwareProactiveTrigger,
} from '../crossEngineHooks.js';
import {
  DELOAD_STATE,
} from '../constants.js';

describe('consumeFrozenConstraint — Hook D1 read-only anti-cascade §1.10', () => {
  it('Valid frozen constraint cu CALENDAR trigger → linear scheduled rationale', () => {
    const constraint = Object.freeze({
      phase: 'DELOAD',
      deload_window: { trigger: 'CALENDAR', days: 7 },
      immutable_snapshot: true,
    });
    const r = consumeFrozenConstraint(constraint);
    expect(r.frozen).toBe(true);
    expect(r.phase).toBe('DELOAD');
    expect(r.deloadWindowTrigger).toBe('CALENDAR');
    expect(r.rationale).toContain('calendar_scheduled_linear');
  });

  it('EARLY_SAFETY trigger → escalate reactive_aa rationale', () => {
    const constraint = Object.freeze({
      phase: 'LOAD',
      deload_window: { trigger: 'EARLY_SAFETY', days: 7 },
    });
    const r = consumeFrozenConstraint(constraint);
    expect(r.deloadWindowTrigger).toBe('EARLY_SAFETY');
    expect(r.rationale).toContain('escalate_reactive_aa');
  });

  it('EXTENSION_MARIUS trigger → anti-abuse rationale', () => {
    const constraint = Object.freeze({
      phase: 'LOAD',
      deload_window: { trigger: 'EXTENSION_MARIUS', days: 7 },
    });
    const r = consumeFrozenConstraint(constraint);
    expect(r.deloadWindowTrigger).toBe('EXTENSION_MARIUS');
    expect(r.rationale).toContain('anti_abuse');
  });

  it('null constraint → defensive defaults', () => {
    const r = consumeFrozenConstraint(null);
    expect(r.phase).toBe(null);
    expect(r.deloadWindowTrigger).toBe(null);
  });

  it('Anti-cascade — input frozen object NU mutated', () => {
    const constraint = Object.freeze({ phase: 'LOAD', deload_window: null });
    consumeFrozenConstraint(constraint);
    expect(Object.isFrozen(constraint)).toBe(true);
    expect(constraint.phase).toBe('LOAD');
  });
});

describe('consumeGoalPhase — Hook D2 light coupling', () => {
  it('CUT → preserve 60% Marius retention', () => {
    const r = consumeGoalPhase('CUT');
    expect(r.goalPhase).toBe('CUT');
    expect(r.depthAdjustmentRationale).toContain('cut_preserve_60_marius_retention');
  });

  it('BULK → 45% classical recovery week', () => {
    const r = consumeGoalPhase('BULK');
    expect(r.depthAdjustmentRationale).toContain('bulk_marius_45_classical');
  });

  it('MAINTAIN → baseline preserved', () => {
    const r = consumeGoalPhase('MAINTAIN');
    expect(r.depthAdjustmentRationale).toContain('maintain_baseline');
  });

  it('null → unresolved baseline default', () => {
    const r = consumeGoalPhase(null);
    expect(r.goalPhase).toBe(null);
    expect(r.depthAdjustmentRationale).toContain('unresolved');
  });
});

describe('consumeEnergyReadiness — Hook D3 sustained 3+ consecutive B13', () => {
  it('3 consecutive DOWN → sustainedThresholdMet true', () => {
    const r = consumeEnergyReadiness({
      energyDirection: 'DOWN',
      recentSessionsForEnergy: [
        { energyDirection: 'DOWN' },
        { energyDirection: 'DOWN' },
        { energyDirection: 'DOWN' },
      ],
    });
    expect(r.sustainedThresholdMet).toBe(true);
    expect(r.rationale).toContain('aa_detection_candidate');
  });

  it('2 consecutive DOWN (insufficient) → sustainedThresholdMet false', () => {
    const r = consumeEnergyReadiness({
      energyDirection: 'DOWN',
      recentSessionsForEnergy: [
        { energyDirection: 'DOWN' },
        { energyDirection: 'DOWN' },
      ],
    });
    expect(r.sustainedThresholdMet).toBe(false);
  });

  it('Mixed (DOWN + UP in window) → sustainedThresholdMet false', () => {
    const r = consumeEnergyReadiness({
      energyDirection: 'DOWN',
      recentSessionsForEnergy: [
        { energyDirection: 'DOWN' },
        { energyDirection: 'UP' },
        { energyDirection: 'DOWN' },
      ],
    });
    expect(r.sustainedThresholdMet).toBe(false);
  });

  it('Empty sessions → sustainedThresholdMet false defensive', () => {
    const r = consumeEnergyReadiness({
      energyDirection: 'DOWN',
      recentSessionsForEnergy: [],
    });
    expect(r.sustainedThresholdMet).toBe(false);
  });
});

describe('consumeBayesianPainAware — Hook D4 reference-only NU duplicate', () => {
  it('σ high + Pain-Aware count flag → safety override candidate', () => {
    const r = consumeBayesianPainAware({
      sigmaHighFlag: true,
      painAwareSessionsCountFlag: true,
    });
    expect(r.sigmaHighFlag).toBe(true);
    expect(r.painAwareSessionsCountFlag).toBe(true);
    expect(r.rationale).toContain('safety_override_candidate');
  });

  it('Only σ high → no safety override candidate (both required)', () => {
    const r = consumeBayesianPainAware({ sigmaHighFlag: true });
    expect(r.rationale).toContain('no_override_candidate');
  });

  it('Always returns Convergence Guard owner spec ADR 009 §AMENDMENT', () => {
    const r = consumeBayesianPainAware({});
    expect(r.convergenceGuardOwnerSpec).toContain('ADR 009');
    expect(r.convergenceGuardOwnerSpec).toContain('AMENDMENT');
  });
});

describe('consumeSpecializationActive — Hook D5 Q12=A non-negotiable', () => {
  it('Specialization active + REACTIVE_COMPOSITE → suspended', () => {
    const r = consumeSpecializationActive({
      specializationActive: true,
      deloadState:          DELOAD_STATE.REACTIVE_COMPOSITE,
    });
    expect(r.suspended).toBe(true);
    expect(r.mesoProgressFreezeContext).toContain('freeze_resume_post_deload');
  });

  it('Specialization active + REACTIVE_AA → suspended', () => {
    const r = consumeSpecializationActive({
      specializationActive: true,
      deloadState:          DELOAD_STATE.REACTIVE_AA,
    });
    expect(r.suspended).toBe(true);
  });

  it('Specialization active + EXTENSION_FLAGGED → suspended', () => {
    const r = consumeSpecializationActive({
      specializationActive: true,
      deloadState:          DELOAD_STATE.EXTENSION_FLAGGED,
    });
    expect(r.suspended).toBe(true);
  });

  it('Specialization active + SCHEDULED_LINEAR → NOT suspended (only REACTIVE)', () => {
    const r = consumeSpecializationActive({
      specializationActive: true,
      deloadState:          DELOAD_STATE.SCHEDULED_LINEAR,
    });
    expect(r.suspended).toBe(false);
  });

  it('Specialization NOT active + REACTIVE → NOT suspended', () => {
    const r = consumeSpecializationActive({
      specializationActive: false,
      deloadState:          DELOAD_STATE.REACTIVE_COMPOSITE,
    });
    expect(r.suspended).toBe(false);
  });

  it('Specialization active + IDLE → NOT suspended', () => {
    const r = consumeSpecializationActive({
      specializationActive: true,
      deloadState:          DELOAD_STATE.IDLE,
    });
    expect(r.suspended).toBe(false);
  });
});

describe('forwardWarmupLighterSignal — Hook D6 light coupling', () => {
  it('Active deload state → emit DELOAD_LIGHTER signal', () => {
    expect(forwardWarmupLighterSignal(DELOAD_STATE.SCHEDULED_LINEAR).emit).toBe(true);
    expect(forwardWarmupLighterSignal(DELOAD_STATE.REACTIVE_COMPOSITE).emit).toBe(true);
    expect(forwardWarmupLighterSignal(DELOAD_STATE.REACTIVE_AA).emit).toBe(true);
    expect(forwardWarmupLighterSignal(DELOAD_STATE.EXTENSION_FLAGGED).emit).toBe(true);
  });

  it('IDLE → no emit', () => {
    expect(forwardWarmupLighterSignal(DELOAD_STATE.IDLE).emit).toBe(false);
  });
});

describe('forwardConstraintObject — Hook D7 terminal V1', () => {
  it('Always returns null V1 (Engine Deload terminal pipeline §42.10 8th FINAL)', () => {
    expect(forwardConstraintObject(null)).toBe(null);
    expect(forwardConstraintObject(undefined)).toBe(null);
    expect(forwardConstraintObject(Object.freeze({ phase: 'LOAD' }))).toBe(null);
    expect(forwardConstraintObject({ any: 'object' })).toBe(null);
  });
});

describe('getConvergenceGuardReference — §9.4.6 reference-only NU duplicate', () => {
  it('Returns metadata pointing to ADR 009 §AMENDMENT owner', () => {
    const ref = getConvergenceGuardReference();
    expect(ref.ownerSpec).toContain('ADR 009');
    expect(ref.ownerSpec).toContain('AMENDMENT');
    expect(ref.crossCutting).toBe(true);
    expect(ref.appliesToTierTransitions).toContain('T0->T1');
    expect(ref.appliesToTierTransitions).toContain('T1->T2');
    expect(ref.note).toContain('NU Engine Deload specific');
    expect(ref.note).toContain('orchestrator layer');
  });

  it('Returns frozen object (immutable reference)', () => {
    const ref = getConvergenceGuardReference();
    expect(Object.isFrozen(ref)).toBe(true);
  });
});

describe('isPainAwareProactiveTrigger — Clean Signal rule preserved E1', () => {
  it('Always returns false V1 LOCKED (Engine Deload NU proactive trigger)', () => {
    expect(isPainAwareProactiveTrigger()).toBe(false);
  });
});
