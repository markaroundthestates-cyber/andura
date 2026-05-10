import { describe, it, expect } from 'vitest';
import { evaluate, ENGINE_ID } from '../index.js';
import {
  DELOAD_STATE,
  TRIGGER_SOURCE,
  NOTIFICATION_TIER,
  WORDING_RO,
  SCHEMA_CONSTANTS,
} from '../constants.js';

const buildPeriodConstraint = (phase = 'LOAD', deloadWindow = null) => Object.freeze({
  intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
  volume_per_muscle: {},
  phase,
  deload_window: deloadWindow,
  immutable_snapshot: true,
});

const buildCtx = ({
  profileTier = 'T0',
  goalPhase,
  energyDirection,
  periodizationConstraint = null,
  performanceDropPct,
  restTimeMultiplier,
  rirMismatch,
  aaDetectionActive,
  recentSessionsForEnergy = [],
  flaggedStillActive,
  weekActiveCount,
  specializationActive,
  affectedMuscleGroupsMrvExceeded,
  mrvExceededAlone,
  sigmaHighFlag,
  painAwareSessionsCountFlag,
  behavioralModifiersInputPct,
  aaMarkerDirectActive,
  extensionEvaluating,
} = {}) => ({
  profileTier,
  meta: {
    ...(goalPhase ? { goalPhase } : {}),
    ...(energyDirection ? { energyDirection } : {}),
    ...(periodizationConstraint ? { periodizationConstraint } : {}),
    ...(performanceDropPct != null ? { performanceDropPct } : {}),
    ...(restTimeMultiplier != null ? { restTimeMultiplier } : {}),
    ...(rirMismatch != null ? { rirMismatch } : {}),
    ...(aaDetectionActive != null ? { aaDetectionActive } : {}),
    recentSessionsForEnergy,
    ...(flaggedStillActive != null ? { flaggedStillActive } : {}),
    ...(weekActiveCount != null ? { weekActiveCount } : {}),
    ...(specializationActive != null ? { specializationActive } : {}),
    ...(affectedMuscleGroupsMrvExceeded ? { affectedMuscleGroupsMrvExceeded } : {}),
    ...(mrvExceededAlone != null ? { mrvExceededAlone } : {}),
    ...(sigmaHighFlag != null ? { sigmaHighFlag } : {}),
    ...(painAwareSessionsCountFlag != null ? { painAwareSessionsCountFlag } : {}),
    ...(behavioralModifiersInputPct != null ? { behavioralModifiersInputPct } : {}),
    ...(aaMarkerDirectActive != null ? { aaMarkerDirectActive } : {}),
    ...(extensionEvaluating != null ? { extensionEvaluating } : {}),
  },
});

describe('evaluate — public API contract per ADR 018 §2', () => {
  it('ENGINE_ID === "deload"', () => {
    expect(ENGINE_ID).toBe('deload');
  });

  it('evaluate(undefined) → tier "none" valid result (insufficient ctx)', async () => {
    const r = await evaluate(undefined);
    expect(r.id).toBe(ENGINE_ID);
    expect(r.tier).toBe('none');
    expect(r.confidence).toBe('low');
    expect(Array.isArray(r.signals)).toBe(true);
    expect(Array.isArray(r.recommendations)).toBe(true);
    expect(r.meta).toBeDefined();
  });

  it('evaluate({}) → tier "none" graceful', async () => {
    const r = await evaluate({});
    expect(r.tier).toBe('none');
  });

  it('evaluate(null) → tier "none" defensive', async () => {
    const r = await evaluate(null);
    expect(r.tier).toBe('none');
  });

  it('blueprint contains all 9 Cluster A1+C1 fields', async () => {
    const r = await evaluate(buildCtx({}));
    expect(r.meta).toHaveProperty('deload_state');
    expect(r.meta).toHaveProperty('depth_pct');
    expect(r.meta).toHaveProperty('duration_weeks');
    expect(r.meta).toHaveProperty('intensity_modifier');
    expect(r.meta).toHaveProperty('partial_scope');
    expect(r.meta).toHaveProperty('notification_tier');
    expect(r.meta).toHaveProperty('wording');
    expect(r.meta).toHaveProperty('ui_label');
    expect(r.meta).toHaveProperty('signals');
  });

  it('total function — never throws', async () => {
    await expect(evaluate()).resolves.toBeDefined();
    await expect(evaluate(null)).resolves.toBeDefined();
    await expect(evaluate({})).resolves.toBeDefined();
    await expect(evaluate({ user: null })).resolves.toBeDefined();
  });

  it('deterministic — identical ctx → identical output (10 invocations)', async () => {
    const ctx = buildCtx({
      profileTier:           'T1',
      goalPhase:             'BULK',
      periodizationConstraint: buildPeriodConstraint('DELOAD', { trigger: 'CALENDAR', days: 7 }),
    });
    const results = [];
    for (let i = 0; i < 10; i += 1) {
      results.push(await evaluate(ctx));
    }
    const json = results.map((r) => JSON.stringify(r));
    expect(new Set(json).size).toBe(1);
  });
});

describe('evaluate — state determination priority (Composite > AA > Linear)', () => {
  it('No triggers → IDLE state, tier LOW', async () => {
    const r = await evaluate(buildCtx({ profileTier: 'T1' }));
    expect(r.meta.deload_state).toBe(DELOAD_STATE.IDLE);
    expect(r.tier).toBe('LOW');
    expect(r.meta.depth_pct).toBe(0);
    expect(r.meta.duration_weeks).toBe(0);
  });

  it('Composite 3/3 simultaneous → REACTIVE_COMPOSITE state, tier HIGH', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      performanceDropPct:  20,    // >15%
      restTimeMultiplier:  1.6,   // >1.5×
      rirMismatch:         3,     // ≥2
    }));
    expect(r.meta.deload_state).toBe(DELOAD_STATE.REACTIVE_COMPOSITE);
    expect(r.tier).toBe('HIGH');
  });

  it('AA Detection direct → REACTIVE_AA state, tier HIGH', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      aaDetectionActive: true,
    }));
    expect(r.meta.deload_state).toBe(DELOAD_STATE.REACTIVE_AA);
    expect(r.tier).toBe('HIGH');
  });

  it('Linear Block calendar → SCHEDULED_LINEAR state, tier MED', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      periodizationConstraint: buildPeriodConstraint('DELOAD', { trigger: 'CALENDAR', days: 7 }),
    }));
    expect(r.meta.deload_state).toBe(DELOAD_STATE.SCHEDULED_LINEAR);
    expect(r.tier).toBe('MED');
  });

  it('Composite > AA priority — both active → COMPOSITE wins', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      performanceDropPct:  20,
      restTimeMultiplier:  1.6,
      rirMismatch:         3,
      aaDetectionActive:   true,
    }));
    expect(r.meta.deload_state).toBe(DELOAD_STATE.REACTIVE_COMPOSITE);
  });

  it('AA > Linear priority — both active → AA wins', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      aaDetectionActive: true,
      periodizationConstraint: buildPeriodConstraint('DELOAD', { trigger: 'CALENDAR', days: 7 }),
    }));
    expect(r.meta.deload_state).toBe(DELOAD_STATE.REACTIVE_AA);
  });

  it('EARLY_SAFETY → REACTIVE_AA state escalate (Invariant 5 Medical Safety)', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      periodizationConstraint: buildPeriodConstraint('LOAD', { trigger: 'EARLY_SAFETY', days: 7 }),
    }));
    expect(r.meta.deload_state).toBe(DELOAD_STATE.REACTIVE_AA);
    expect(r.tier).toBe('HIGH');
  });
});

describe('evaluate — depth + duration + intensity_modifier', () => {
  it('SCHEDULED_LINEAR → depth 45%, duration 1', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      periodizationConstraint: buildPeriodConstraint('DELOAD', { trigger: 'CALENDAR', days: 7 }),
    }));
    expect(r.meta.depth_pct).toBe(45);
    expect(r.meta.duration_weeks).toBe(1);
  });

  it('REACTIVE_COMPOSITE → depth 60%, duration 1 (B5+B6)', async () => {
    const r = await evaluate(buildCtx({
      profileTier:         'T1',
      performanceDropPct:  20,
      restTimeMultiplier:  1.6,
      rirMismatch:         3,
    }));
    expect(r.meta.depth_pct).toBe(60);
    expect(r.meta.duration_weeks).toBe(1);
  });

  it('intensity_modifier obligatoriu RIR +1 + Intensity -12.5% cand active', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      aaDetectionActive: true,
    }));
    expect(r.meta.intensity_modifier.rir_increment).toBe(1);
    expect(r.meta.intensity_modifier.intensity_pct_decrement).toBe(12.5);
  });

  it('intensity_modifier zero cand IDLE', async () => {
    const r = await evaluate(buildCtx({ profileTier: 'T1' }));
    expect(r.meta.intensity_modifier.rir_increment).toBe(0);
    expect(r.meta.intensity_modifier.intensity_pct_decrement).toBe(0);
  });

  it('AA-driven mechanic signal emitted cand active (Daniel push-back B4)', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      aaDetectionActive: true,
    }));
    expect(r.signals).toContain('deload_aa_driven_volume_cut_30_rir_up_intensity_down_b4_obligatoriu');
  });
});

describe('evaluate — wording RO native specific per trigger source (C5)', () => {
  it('Linear → "Sapt 5 — recuperare programata"', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      periodizationConstraint: buildPeriodConstraint('DELOAD', { trigger: 'CALENDAR', days: 7 }),
    }));
    expect(r.meta.wording).toBe(WORDING_RO.linear);
  });

  it('Composite → "Corpul tau cere recovery"', async () => {
    const r = await evaluate(buildCtx({
      profileTier:         'T1',
      performanceDropPct:  20,
      restTimeMultiplier:  1.6,
      rirMismatch:         3,
    }));
    expect(r.meta.wording).toBe(WORDING_RO.composite);
  });

  it('AA → "Reglam intensitatea — volumul a urcat agresiv"', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      aaDetectionActive: true,
    }));
    expect(r.meta.wording).toBe(WORDING_RO.aa);
  });

  it('IDLE → empty wording', async () => {
    const r = await evaluate(buildCtx({ profileTier: 'T1' }));
    expect(r.meta.wording).toBe(WORDING_RO.idle);
  });
});

describe('evaluate — notification tier (Cluster C2)', () => {
  it('T0 → silent', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T0',
      aaDetectionActive: true,
    }));
    expect(r.meta.notification_tier).toBe(NOTIFICATION_TIER.SILENT);
  });

  it('T1 → banner_detailed', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      aaDetectionActive: true,
    }));
    expect(r.meta.notification_tier).toBe(NOTIFICATION_TIER.BANNER_DETAILED);
  });

  it('T2 → banner_detailed', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T2',
      aaDetectionActive: true,
    }));
    expect(r.meta.notification_tier).toBe(NOTIFICATION_TIER.BANNER_DETAILED);
  });
});

describe('evaluate — ui_label RO native', () => {
  it('IDLE → empty label', async () => {
    const r = await evaluate(buildCtx({ profileTier: 'T1' }));
    expect(r.meta.ui_label).toBe('');
  });

  it('1 sapt → "Saptamana de recuperare"', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      periodizationConstraint: buildPeriodConstraint('DELOAD', { trigger: 'CALENDAR', days: 7 }),
    }));
    expect(r.meta.ui_label).toBe('Saptamana de recuperare');
  });
});

describe('evaluate — Specialization suspension Hook D5 (Q12=A)', () => {
  it('Specialization active + REACTIVE → suspended signal', async () => {
    const r = await evaluate(buildCtx({
      profileTier:           'T1',
      aaDetectionActive:     true,
      specializationActive:  true,
    }));
    expect(r.signals).toContain('specialization_suspended_q12_a_non_negotiable_d5_freeze_resume_post_deload');
  });

  it('Specialization active + IDLE → NU suspended (no deload)', async () => {
    const r = await evaluate(buildCtx({
      profileTier:           'T1',
      specializationActive:  true,
    }));
    expect(r.signals).not.toContain('specialization_suspended_q12_a_non_negotiable_d5_freeze_resume_post_deload');
  });
});

describe('evaluate — Hook D6 Warm-up DELOAD_LIGHTER signal forward', () => {
  it('Active deload → warmup_deload_lighter signal emitted', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      aaDetectionActive: true,
    }));
    expect(r.signals).toContain('warmup_deload_lighter_state_signal_d6_next_session_lookahead_light_coupling');
  });

  it('IDLE → NU warmup_deload_lighter signal', async () => {
    const r = await evaluate(buildCtx({ profileTier: 'T1' }));
    expect(r.signals).not.toContain('warmup_deload_lighter_state_signal_d6_next_session_lookahead_light_coupling');
  });
});

describe('evaluate — Composite hard-disabled (B3 anti math collision)', () => {
  it('Composite triggered + active deload → hard-disabled signal', async () => {
    const r = await evaluate(buildCtx({
      profileTier:         'T1',
      performanceDropPct:  20,
      restTimeMultiplier:  1.6,
      rirMismatch:         3,
    }));
    expect(r.signals).toContain('composite_signal_36_41_hard_disabled_engine_deload_active_b3_anti_math_collision');
  });
});

describe('evaluate — pipeline 8th canonical FINAL', () => {
  it('Engine ID confirmed', () => {
    expect(ENGINE_ID).toBe('deload');
  });

  it('forwardConstraintObject returns null (terminal V1)', async () => {
    const r = await evaluate(buildCtx({
      profileTier:             'T1',
      aaDetectionActive:       true, // active deload state to reach forward hook (bypass IDLE early return)
      periodizationConstraint: buildPeriodConstraint('LOAD'),
    }));
    expect(r.trace.forwardedConstraint).toBe(null);
  });
});

describe('evaluate — multi-signal additive escalation', () => {
  it('2+ trigger sources → multi_signal_consolidation signal', async () => {
    const r = await evaluate(buildCtx({
      profileTier:         'T1',
      performanceDropPct:  20,
      restTimeMultiplier:  1.6,
      rirMismatch:         3,
      aaDetectionActive:   true,
    }));
    expect(r.signals).toContain('deload_multi_signal_consolidation_escalates_severity_additive_b2');
  });

  it('Single trigger → NU multi-signal escalation', async () => {
    const r = await evaluate(buildCtx({
      profileTier: 'T1',
      aaDetectionActive: true,
    }));
    expect(r.signals).not.toContain('deload_multi_signal_consolidation_escalates_severity_additive_b2');
  });
});

describe('evaluate — partial scope Hook B10', () => {
  it('Per-muscle MRV alone + groups → partial_scope set, perMuscleMrvAlone signal', async () => {
    const r = await evaluate(buildCtx({
      profileTier:                       'T1',
      aaDetectionActive:                 true,
      affectedMuscleGroupsMrvExceeded:   ['chest'],
      mrvExceededAlone:                  true,
    }));
    expect(r.meta.partial_scope).toEqual(['chest']);
    expect(r.signals).toContain('deload_partial_scope_per_muscle_mrv_alone_b10_9_1_cluster_3_israetel');
  });

  it('Cross-muscular signal → null partial_scope (full-body sistemic)', async () => {
    const r = await evaluate(buildCtx({
      profileTier:         'T1',
      performanceDropPct:  20,
      restTimeMultiplier:  1.6,
      rirMismatch:         3,
    }));
    expect(r.meta.partial_scope).toBe(null);
    expect(r.signals).toContain('deload_full_body_sistemic_cross_muscular_signal_b10');
  });
});
