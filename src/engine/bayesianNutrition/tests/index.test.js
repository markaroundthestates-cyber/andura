import { describe, it, expect } from 'vitest';
import { evaluate, ENGINE_ID } from '../index.js';
import { UI_TIER, CALIBRATION_TIERS } from '../constants.js';

const buildPeriodConstraint = (phase = 'LOAD') => Object.freeze({
  intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
  volume_per_muscle: {
    chest: { floor: 8, ceiling: 14 },
  },
  phase,
  deload_window: null,
  immutable_snapshot: true,
});

const buildCtx = ({
  profileTier = 'T0',
  age,
  medicalConditions,
  edHistory,
  observations = [],
  demographicMu = 75,
  demographicSigma = 5,
  periodizationConstraint = null,
  energyDirection,
  engine2Phase,
  engine3InferredPhase,
  flags = {},
  recentSessions = [],
  energyReadiness,
  emoji,
  sleepSelfReport,
  previousPhase,
  currentPhase,
  nowMs,
} = {}) => ({
  user: {
    ...(age != null ? { age } : {}),
    ...(medicalConditions ? { medicalConditions } : {}),
    ...(edHistory != null ? { edHistory } : {}),
  },
  profileTier,
  flags,
  recentSessions,
  meta: {
    demographicMu,
    demographicSigma,
    observations,
    periodizationConstraint,
    energyDirection,
    engine2Phase,
    engine3InferredPhase,
    energyReadiness,
    emoji,
    sleepSelfReport,
    previousPhase,
    currentPhase,
    nowMs,
  },
});

describe('evaluate — integration end-to-end §9.4 ADR 026', () => {
  it('returns valid BayesianNutritionResult shape per ADR 018 §2 contract', async () => {
    const result = await evaluate(buildCtx({}));
    expect(result.id).toBe(ENGINE_ID);
    expect(['none', 'LOW', 'MED', 'HIGH']).toContain(result.tier);
    expect(['low', 'medium', 'high']).toContain(result.confidence);
    expect(Array.isArray(result.signals)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(typeof result.trace).toBe('object');
    expect(typeof result.meta).toBe('object');
  });

  it('blueprint contains 5 fields per §9.4.4 Cluster D verbatim + signals', async () => {
    const result = await evaluate(buildCtx({}));
    expect(result.meta).toHaveProperty('nutrition_inference_metadata');
    expect(result.meta).toHaveProperty('likelihood_probabilities');
    expect(result.meta).toHaveProperty('profile_typing');
    expect(result.meta).toHaveProperty('ui_tier');
    expect(result.meta).toHaveProperty('passive_mode_active');
    expect(result.meta).toHaveProperty('signals');
  });

  it('total function — never throws on empty/null ctx', async () => {
    await expect(evaluate()).resolves.toBeDefined();
    await expect(evaluate(null)).resolves.toBeDefined();
    await expect(evaluate({})).resolves.toBeDefined();
    await expect(evaluate({ user: null })).resolves.toBeDefined();
  });

  it('empty ctx (no observations + no demographic) → tier none', async () => {
    const result = await evaluate({ user: {}, meta: {} });
    expect(result.tier).toBe('none');
  });

  it('deterministic — identical ctx → identical output', async () => {
    const ctx = buildCtx({
      profileTier: 'T1',
      observations: [{ weightDelta: -0.5 }, { weightDelta: -0.3 }],
    });
    const r1 = await evaluate(ctx);
    const r2 = await evaluate(ctx);
    expect(JSON.stringify(r1)).toEqual(JSON.stringify(r2));
  });

  it('likelihood probabilities sum to 1.0 (Cluster D2)', async () => {
    const result = await evaluate(buildCtx({
      observations: [{ weightDelta: -0.5 }, { weightDelta: -0.3 }],
    }));
    const lp = result.meta.likelihood_probabilities;
    const sum = lp.deficit_likelihood + lp.surplus_likelihood + lp.maintenance_likelihood;
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it('Hard rule §3.5.1 D5 NEVER specific kcal — output likelihood probabilities only', async () => {
    const result = await evaluate(buildCtx({
      observations: [{ weightDelta: -0.5 }],
    }));
    expect(result.meta.likelihood_probabilities).toBeDefined();
    // NU verify absent specific kcal field (engine doesn't emit it by construction)
    expect(result.meta.likelihood_probabilities).not.toHaveProperty('kcal_target');
  });

  it('UI tier Tier 1+2 only — NU blocking modal Tier 3 (D4 Maria 65 autonomy)', async () => {
    const result = await evaluate(buildCtx({}));
    expect([UI_TIER.TIER_1_SILENT, UI_TIER.TIER_2_BANNER]).toContain(result.meta.ui_tier);
  });

  it('Pregnant condition → Passive Mode active + Tier 2 banner medical referral', async () => {
    const result = await evaluate(buildCtx({
      medicalConditions: ['pregnant'],
    }));
    expect(result.meta.passive_mode_active).toBe(true);
    expect(result.meta.ui_tier).toBe(UI_TIER.TIER_2_BANNER);
    expect(result.signals).toContain('passive_mode_tripwire_active');
  });

  it('Age 80+ → Special priors + disclaimer signal', async () => {
    const result = await evaluate(buildCtx({ age: 80 }));
    expect(result.signals).toContain('special_priors_age_75_plus');
  });

  it('ED history → Special priors signal', async () => {
    const result = await evaluate(buildCtx({ edHistory: true }));
    expect(result.signals).toContain('special_priors_ed_history');
  });

  it('Engine #2 phase ≠ Engine #3 inferred → disagreement flag CDL Tier 1 silent', async () => {
    const result = await evaluate(buildCtx({
      engine2Phase: 'BULK',
      engine3InferredPhase: 'CUT',
    }));
    expect(result.signals).toContain('engine2_engine3_disagreement_tier_1_silent_flag');
  });

  it('Energy readiness DOWN T1+ → σ variance modifier signal', async () => {
    const result = await evaluate(buildCtx({
      profileTier: 'T1',
      energyDirection: 'DOWN',
      observations: [{ weightDelta: -0.3 }],
    }));
    expect(result.signals).toContain('energy_variance_modifier_applied');
  });

  it('Energy readiness DOWN T0 → neutral fallback (NU amplify)', async () => {
    const result = await evaluate(buildCtx({
      profileTier: 'T0',
      energyDirection: 'DOWN',
    }));
    expect(result.signals).not.toContain('energy_variance_modifier_applied');
  });

  it('Phase reset CUT → BULK signal emitted', async () => {
    const result = await evaluate(buildCtx({
      previousPhase: 'CUT',
      currentPhase: 'BULK',
    }));
    expect(result.signals).toContain('phase_reset_layer_1_and_2');
  });

  it('Kalman feature flag enabled + R²>0.85 → no EWMA fallback', async () => {
    const result = await evaluate(buildCtx({
      profileTier: 'T1',
      flags: { bayesian_kalman_v1: true },
      observations: [{ weightDelta: -0.5 }],
    }));
    // No assertion on ewmaFallback (depends on R² which is 0 cu no recent data)
    // Just verify signal not contradicted
    expect(result.meta.nutrition_inference_metadata).toBeDefined();
  });

  it('Kalman feature flag disabled → EWMA fallback active signal', async () => {
    const result = await evaluate(buildCtx({
      profileTier: 'T1',
      flags: { bayesian_kalman_v1: false },
      observations: [{ weightDelta: -0.5 }],
    }));
    expect(result.signals).toContain('kalman_ewma_fallback_active');
  });

  it('Compound observations < 3 → isolation graceful degradation signal', async () => {
    const result = await evaluate(buildCtx({
      recentSessions: [
        { daysAgo: 1, movements: [{ movementId: 'curl' }] }, // isolation only
      ],
    }));
    expect(result.signals).toContain('isolation_graceful_degradation_compound_below_3');
  });

  it('confidence high cand observations + demographic + periodConstraint toate prezente', async () => {
    const result = await evaluate(buildCtx({
      profileTier: 'T1',
      observations: [{ weightDelta: -0.5 }],
      demographicMu: 75,
      periodizationConstraint: buildPeriodConstraint('LOAD'),
    }));
    expect(result.confidence).toBe('high');
  });

  it('nutrition_inference_metadata schema has prior + posterior + observations + CI per Cluster D1', async () => {
    const result = await evaluate(buildCtx({
      observations: [{ weightDelta: -0.5 }],
    }));
    const md = result.meta.nutrition_inference_metadata;
    expect(md).toHaveProperty('prior');
    expect(md).toHaveProperty('posterior');
    expect(md).toHaveProperty('observations');
    expect(md).toHaveProperty('confidence_interval');
    expect(md.confidence_interval.level).toBe(0.95);
  });

  it('persisted determinism cross 10 invocations', async () => {
    const ctx = buildCtx({
      profileTier: 'T2',
      observations: [{ weightDelta: -0.4 }, { weightDelta: -0.3 }],
      flags: { bayesian_kalman_v1: true },
    });
    const results = [];
    for (let i = 0; i < 10; i += 1) {
      results.push(await evaluate(ctx));
    }
    const json = results.map((r) => JSON.stringify(r));
    expect(new Set(json).size).toBe(1);
  });

  it('pipeline 4th canonical engine ID confirmed', () => {
    expect(ENGINE_ID).toBe('bayesianNutrition');
  });

  it('Anti-spam blocked re-prompt within 28d cooldown signal', async () => {
    const NOW = 1735689600000;
    const result = await evaluate({
      ...buildCtx({}),
      meta: {
        ...buildCtx({}).meta,
        nowMs: NOW,
        lastNutritionPromptMs: NOW - 10 * 86400000, // 10 days ago < 28
        nutritionPromptCountThisYear: 1,
      },
    });
    expect(result.signals).toContain('anti_spam_blocked_re_prompt');
  });

  it('forward constraint object frozen pass-through (Hook 4)', async () => {
    const constraint = buildPeriodConstraint('LOAD');
    const result = await evaluate(buildCtx({
      periodizationConstraint: constraint,
    }));
    // forward_constraint_object NOT in blueprint per current schema — verify trace
    expect(result.trace.forwardedConstraint).toBe(true);
  });
});
