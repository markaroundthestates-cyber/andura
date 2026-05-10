import { describe, it, expect } from 'vitest';
import { evaluate, ENGINE_ID } from '../index.js';
import { CUE_DELIVERY_TIMING, TEMPO_NOTATION } from '../constants.js';
import { assertValidDimensionResult } from '../../dimensionContract.js';

const buildPeriodConstraint = (phase = 'LOAD') => Object.freeze({
  intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
  phase,
  deload_window: null,
  immutable_snapshot: true,
});

const buildCtx = ({
  profileTier = 'T0',
  periodizationConstraint = null,
  periodizationPhase,
  energyDirection,
  persona,
  movementId,
  movementCategory,
  formBreakdownToggled,
  userInitiatedTapToExpand,
  postSetFeedbackContext,
  userReportedFormBreakdown,
  rirMatrixExpected,
  rirActual,
  userKnowToggleMovements,
  recentSessions = [],
} = {}) => ({
  profileTier,
  recentSessions,
  meta: {
    periodizationConstraint,
    periodizationPhase,
    energyDirection,
    persona,
    movementId,
    movementCategory,
    formBreakdownToggled,
    userInitiatedTapToExpand,
    postSetFeedbackContext,
    userReportedFormBreakdown,
    rirMatrixExpected,
    rirActual,
    userKnowToggleMovements,
  },
});

describe('evaluate — ADR 018 §2 Standardized Dimension Contract compliance', () => {
  it('returns valid TempoResult shape per ADR 018 §2 contract', async () => {
    const result = await evaluate(buildCtx({}));
    expect(result.id).toBe(ENGINE_ID);
    expect(['none', 'LOW', 'MED', 'HIGH']).toContain(result.tier);
    expect(['low', 'medium', 'high']).toContain(result.confidence);
    expect(Array.isArray(result.signals)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(typeof result.trace).toBe('object');
    expect(typeof result.meta).toBe('object');
    // Validate via canonical helper from dimensionContract
    expect(() => assertValidDimensionResult(result)).not.toThrow();
  });

  it('id always equals "tempo"', async () => {
    const result = await evaluate(buildCtx({}));
    expect(result.id).toBe('tempo');
    expect(ENGINE_ID).toBe('tempo');
  });

  it('total function — never throws on null ctx', async () => {
    await expect(evaluate(null)).resolves.toBeDefined();
    await expect(evaluate(undefined)).resolves.toBeDefined();
    await expect(evaluate({})).resolves.toBeDefined();
  });

  it('total function — never throws on malformed meta', async () => {
    await expect(evaluate({ meta: 'not_an_object' })).resolves.toBeDefined();
    await expect(evaluate({ meta: null })).resolves.toBeDefined();
    await expect(evaluate({ recentSessions: 'not_array' })).resolves.toBeDefined();
  });

  it('deterministic — identical ctx produces identical output', async () => {
    const ctx = buildCtx({
      profileTier:        'T1',
      periodizationPhase: 'LOAD',
      energyDirection:    'NONE',
      movementId:         'back_squat',
      movementCategory:   'compound',
      persona:            'gigica',
    });
    const r1 = await evaluate(ctx);
    const r2 = await evaluate(ctx);
    expect(r1.tier).toBe(r2.tier);
    expect(r1.confidence).toBe(r2.confidence);
    expect(r1.signals).toEqual(r2.signals);
    expect(r1.meta.tempo_prescription.notation).toBe(r2.meta.tempo_prescription.notation);
  });

  it('insufficient ctx → tier "none" + confidence "low"', async () => {
    const result = await evaluate({});
    expect(result.tier).toBe('none');
    expect(result.confidence).toBe('low');
  });
});

describe('evaluate — Cluster A1 blueprint emit (5 fields verbatim §9.5.1)', () => {
  it('blueprint contains all 5 emit fields per Cluster A1 + signals', async () => {
    const result = await evaluate(buildCtx({
      profileTier:        'T1',
      periodizationPhase: 'LOAD',
      movementId:         'back_squat',
      movementCategory:   'compound',
      persona:            'gigica',
    }));
    expect(result.meta).toHaveProperty('tempo_prescription');
    expect(result.meta).toHaveProperty('form_cue');
    expect(result.meta).toHaveProperty('mind_muscle_active');
    expect(result.meta).toHaveProperty('cue_delivery_timing');
    expect(result.meta).toHaveProperty('signals');
    expect(result.meta).toHaveProperty('mind_muscle_state');
  });

  it('tempo_prescription has notation + preSet + reactiveExpanded + timing + rationale', async () => {
    const result = await evaluate(buildCtx({
      periodizationPhase: 'LOAD',
      energyDirection:    'NONE',
      persona:            'gigica',
    }));
    const p = result.meta.tempo_prescription;
    expect(p).toHaveProperty('notation');
    expect(p).toHaveProperty('preSetIntro');
    expect(p).toHaveProperty('reactiveExpanded');
    expect(p).toHaveProperty('timing');
    expect(p).toHaveProperty('rationale');
  });

  it('form_cue has cueText + category + movementId + persona + depth', async () => {
    const result = await evaluate(buildCtx({
      movementId:       'back_squat',
      movementCategory: 'compound',
      persona:          'maria',
    }));
    const fc = result.meta.form_cue;
    expect(fc).toHaveProperty('cueText');
    expect(fc).toHaveProperty('category');
    expect(fc).toHaveProperty('movementId');
    expect(fc).toHaveProperty('persona');
    expect(fc).toHaveProperty('depth');
  });

  it('mind_muscle_active is boolean', async () => {
    const result = await evaluate(buildCtx({}));
    expect(typeof result.meta.mind_muscle_active).toBe('boolean');
  });

  it('cue_delivery_timing NEVER intra-set (Q8=D constraint invariant)', async () => {
    const cases = [
      buildCtx({}),
      buildCtx({ userInitiatedTapToExpand: true }),
      buildCtx({ postSetFeedbackContext: true }),
    ];
    for (const ctx of cases) {
      const r = await evaluate(ctx);
      expect(r.meta.cue_delivery_timing).not.toBe('INTRA_SET');
      expect(['PRE_SET', 'POST_SET', 'MID_REST']).toContain(r.meta.cue_delivery_timing);
    }
  });
});

describe('evaluate — Cross-engine integration Cluster D verbatim', () => {
  it('Energy DOWN → slow eccentric universal notation + signal emit', async () => {
    const result = await evaluate(buildCtx({
      energyDirection: 'DOWN',
    }));
    expect(result.meta.tempo_prescription.notation).toBe(TEMPO_NOTATION.SLOW_ECCENTRIC_UNIVERSAL);
    expect(result.signals).toContain('energy_down_slow_eccentric_universal_q13_b');
  });

  it('PEAK phase → form-conservative amplification + signal emit', async () => {
    const result = await evaluate(buildCtx({
      periodizationPhase: 'PEAK',
    }));
    expect(result.meta.tempo_prescription.notation).toBe(TEMPO_NOTATION.FORM_CONSERVATIVE_AMPLIFIED);
    expect(result.signals).toContain('tempo_form_conservative_amplification_high_intensity');
  });

  it('DELOAD phase → mind-muscle unlock signal + active even on T0', async () => {
    const result = await evaluate(buildCtx({
      profileTier:        'T0',
      periodizationPhase: 'DELOAD',
    }));
    expect(result.signals).toContain('mind_muscle_unlock_deload_q12_d');
    expect(result.meta.mind_muscle_active).toBe(true);
    expect(result.meta.tempo_prescription.notation).toBe(TEMPO_NOTATION.DELOAD_CONTROLLED);
  });

  it('form breakdown toggled → +1 RIR auto-bump signal Q14=B', async () => {
    const result = await evaluate(buildCtx({
      formBreakdownToggled: true,
    }));
    expect(result.signals).toContain('rir_auto_bump_plus_1_form_breakdown_q14_b');
  });

  it('RIR mismatch silent telemetry Q4=A V1 — signal emitted but NU active trigger', async () => {
    const result = await evaluate(buildCtx({
      userReportedFormBreakdown: true,
      rirMatrixExpected:         3,
      rirActual:                 1,
    }));
    expect(result.signals).toContain('rir_mismatch_silent_telemetry_q4_a_v1_no_active_trigger');
    // V1 invariant: NO recommendations emit (silent telemetry only)
    expect(result.recommendations).toEqual([]);
  });
});

describe('evaluate — Persona-aware tone Cluster B3 + D18 verbatim', () => {
  it('Maria persona → preSetIntro NEVER contains numeric tempo notation (Q3 zero strict)', async () => {
    const result = await evaluate(buildCtx({
      profileTier:        'T1',
      periodizationPhase: 'LOAD',
      persona:            'maria',
      movementId:         'back_squat',
      movementCategory:   'compound',
    }));
    // Daniel push-back fundamental — Maria zero notation strict
    expect(result.meta.tempo_prescription.preSetIntro).not.toMatch(/\d+-\d+-\d+-\d+/);
  });

  it('Gigica persona → preSetIntro contains hibrid notation', async () => {
    const result = await evaluate(buildCtx({
      profileTier:        'T1',
      periodizationPhase: 'LOAD',
      persona:            'gigica',
      movementId:         'back_squat',
      movementCategory:   'compound',
    }));
    expect(result.meta.tempo_prescription.preSetIntro).toContain('Tempo');
  });

  it('Marius persona → form cue contains "Execute" imperative tone', async () => {
    const result = await evaluate(buildCtx({
      persona:            'marius',
      movementId:         'back_squat',
      movementCategory:   'compound',
    }));
    expect(result.meta.form_cue.cueText).toContain('Execute');
  });

  it('Maria persona → form cue contains rationale-first "De ce asa?"', async () => {
    const result = await evaluate(buildCtx({
      persona:            'maria',
      movementId:         'back_squat',
      movementCategory:   'compound',
    }));
    expect(result.meta.form_cue.cueText).toContain('De ce asa?');
  });
});

describe('evaluate — Mind-muscle tier-aware Cluster C5 + C17 verbatim', () => {
  it('T0 default → mind_muscle_active false (calibration noise OFF Q5=C)', async () => {
    const result = await evaluate(buildCtx({
      profileTier:        'T0',
      periodizationPhase: 'LOAD',
      movementId:         'back_squat',
    }));
    expect(result.meta.mind_muscle_active).toBe(false);
  });

  it('T1 → mind_muscle_active true (profile-typing-aware)', async () => {
    const result = await evaluate(buildCtx({
      profileTier:        'T1',
      periodizationPhase: 'LOAD',
      movementId:         'back_squat',
    }));
    expect(result.meta.mind_muscle_active).toBe(true);
  });

  it('T1 + explicit suppression for movement → mind_muscle_active false (suppressed)', async () => {
    const result = await evaluate(buildCtx({
      profileTier:                'T1',
      movementId:                 'back_squat',
      userKnowToggleMovements:    ['back_squat'],
    }));
    expect(result.meta.mind_muscle_active).toBe(false);
    expect(result.signals).toContain('mind_muscle_suppressed_for_movement');
    expect(result.signals).toContain('mind_muscle_acquired_explicit_user_toggle_stiu_q9');
  });

  it('T2 + N=10 implicit acquisition → suppressed soft auto-retire', async () => {
    const sessions = Array.from({ length: 10 }, () => ({ formBreakdown: false }));
    const result = await evaluate(buildCtx({
      profileTier:        'T2',
      movementId:         'deadlift',
      recentSessions:     sessions,
    }));
    expect(result.signals).toContain('mind_muscle_acquired_implicit_n_10_q9_d');
    expect(result.meta.mind_muscle_state.suppressionMode).toBe('soft_auto_retire');
  });
});

describe('evaluate — purity invariant ZERO side effects per ADR 018 §2', () => {
  it('does NOT mutate ctx', async () => {
    const ctx = buildCtx({
      profileTier:        'T1',
      periodizationPhase: 'LOAD',
      movementId:         'back_squat',
    });
    const ctxSnapshot = JSON.stringify(ctx);
    await evaluate(ctx);
    expect(JSON.stringify(ctx)).toBe(ctxSnapshot);
  });

  it('does NOT mutate frozen periodizationConstraint (anti-cascade §1.10)', async () => {
    const constraint = buildPeriodConstraint('LOAD');
    const ctx = buildCtx({
      profileTier:             'T1',
      periodizationPhase:      'LOAD',
      periodizationConstraint: constraint,
      movementId:              'back_squat',
    });
    await evaluate(ctx);
    expect(Object.isFrozen(constraint)).toBe(true);
    expect(constraint.phase).toBe('LOAD'); // unchanged
  });

  it('returns recommendations empty array (orchestrator-level concern ADR 030 D2)', async () => {
    const result = await evaluate(buildCtx({
      profileTier:               'T1',
      periodizationPhase:        'LOAD',
      formBreakdownToggled:      true,
      userReportedFormBreakdown: true,
    }));
    // V1 — engine emite signals, orchestrator applies recommendations downstream.
    expect(result.recommendations).toEqual([]);
  });
});

describe('evaluate — confidence computation per ctx data completeness', () => {
  it('all 3 signals present → high confidence', async () => {
    const result = await evaluate(buildCtx({
      profileTier:             'T1',
      periodizationConstraint: buildPeriodConstraint('LOAD'),
      movementId:              'back_squat',
    }));
    expect(result.confidence).toBe('high');
  });

  it('2/3 signals → medium confidence', async () => {
    const result = await evaluate(buildCtx({
      profileTier:             'T1',
      periodizationConstraint: buildPeriodConstraint('LOAD'),
      // no movementId
    }));
    expect(result.confidence).toBe('medium');
  });

  it('0 signals → low confidence', async () => {
    const result = await evaluate({});
    expect(result.confidence).toBe('low');
  });
});

describe('evaluate — Convergence Guard reference NU duplicate logic', () => {
  it('trace contains Convergence Guard reference metadata (NU evaluation result)', async () => {
    const result = await evaluate(buildCtx({ profileTier: 'T1' }));
    expect(result.trace.convergenceGuardRef).toBeDefined();
    expect(result.trace.convergenceGuardRef.ownerSpec).toContain('ADR 009');
    expect(result.trace.convergenceGuardRef.crossCutting).toBe(true);
  });
});
