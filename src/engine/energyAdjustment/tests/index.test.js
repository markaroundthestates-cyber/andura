import { describe, it, expect } from 'vitest';
import { evaluate, ENGINE_ID } from '../index.js';
import { ADJUSTMENT_DIRECTION, EMOJI_STATE, MEDICAL_REFERRAL_COPY } from '../constants.js';

const buildPeriodConstraint = (phase = 'LOAD', deloadWindow = null) => Object.freeze({
  intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
  volume_per_muscle: {
    chest: { floor: 8, ceiling: 14 },
    back:  { floor: 10, ceiling: 18 },
  },
  phase,
  deload_window: deloadWindow,
  immutable_snapshot: true,
});

const buildCtx = ({
  energyEmoji,
  drillDownCause,
  profileTier = 'T1',
  recentSessions = [],
  periodizationConstraint = buildPeriodConstraint(),
  recentAdjustmentDirections = [],
  bayesianSigma = 0,
  stagnationDetected = false,
  currentSessionSubFloor = false,
  compositeLowSignals = false,
} = {}) => ({
  user: {
    ...(energyEmoji ? { energyEmoji } : {}),
    ...(drillDownCause ? { drillDownCause } : {}),
  },
  recentSessions,
  weights: {},
  profileTier,
  flags: {},
  meta: {
    periodizationConstraint,
    recentAdjustmentDirections,
    bayesianSigma,
    stagnationDetected,
    currentSessionSubFloor,
    compositeLowSignals,
  },
});

describe('evaluate — integration end-to-end §9.3 ADR 026', () => {
  it('returns valid EnergyAdjustmentResult shape per ADR 018 §2 contract', async () => {
    const result = await evaluate(buildCtx({ energyEmoji: 'green' }));
    expect(result.id).toBe(ENGINE_ID);
    expect(['none', 'LOW', 'MED', 'HIGH']).toContain(result.tier);
    expect(['low', 'medium', 'high']).toContain(result.confidence);
    expect(Array.isArray(result.signals)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(typeof result.trace).toBe('object');
    expect(typeof result.meta).toBe('object');
  });

  it('blueprint contains 6 fields per §9.3.1 Cluster 1 verbatim', async () => {
    const result = await evaluate(buildCtx({ energyEmoji: 'green' }));
    expect(result.meta).toHaveProperty('energy_state');
    expect(result.meta).toHaveProperty('adjustment_direction');
    expect(result.meta).toHaveProperty('adjustment_magnitude_pct');
    expect(result.meta).toHaveProperty('volume_intensity_scope');
    expect(result.meta).toHaveProperty('forward_constraint_object');
    expect(result.meta).toHaveProperty('signals');
  });

  it('total function — never throws on empty/null ctx', async () => {
    await expect(evaluate()).resolves.toBeDefined();
    await expect(evaluate(null)).resolves.toBeDefined();
    await expect(evaluate({})).resolves.toBeDefined();
    await expect(evaluate({ user: null })).resolves.toBeDefined();
  });

  it('empty ctx → tier none, confidence low', async () => {
    const result = await evaluate({});
    expect(result.tier).toBe('none');
    expect(result.confidence).toBe('low');
  });

  it('deterministic — identical ctx → identical output', async () => {
    const ctx = buildCtx({ energyEmoji: 'green' });
    const r1 = await evaluate(ctx);
    const r2 = await evaluate(ctx);
    expect(JSON.stringify(r1)).toEqual(JSON.stringify(r2));
  });

  it('🔴 RED → DOWN immediate single trigger T1 -15%', async () => {
    const result = await evaluate(buildCtx({
      energyEmoji: 'red',
      drillDownCause: 'somn',
      profileTier: 'T1',
    }));
    expect(result.meta.adjustment_direction).toBe(ADJUSTMENT_DIRECTION.DOWN);
    expect(result.meta.adjustment_magnitude_pct).toBe(-0.15);
    expect(result.signals).toContain('drill_down_required_red_distressed');
    expect(result.signals).toContain('drill_down_cause_somn');
  });

  it('🔴 RED T0 → DOWN -10% tier-aware Q13=B', async () => {
    const result = await evaluate(buildCtx({
      energyEmoji: 'red',
      profileTier: 'T0',
    }));
    expect(result.meta.adjustment_magnitude_pct).toBe(-0.10);
  });

  it('🟢 GREEN + 3 consecutive green + LOAD phase + T1 → UP +15% all gates passed', async () => {
    const greenSessions = [
      { energyEmoji: 'green', energy: 'green' },
      { energyEmoji: 'green', energy: 'green' },
      { energyEmoji: 'green', energy: 'green' },
    ];
    const result = await evaluate(buildCtx({
      energyEmoji: 'green',
      profileTier: 'T1',
      recentSessions: greenSessions,
      periodizationConstraint: buildPeriodConstraint('LOAD'),
    }));
    expect(result.meta.adjustment_direction).toBe(ADJUSTMENT_DIRECTION.UP);
    expect(result.meta.adjustment_magnitude_pct).toBe(0.15);
    expect(result.signals).toContain('up_gating_all_conditions_passed');
  });

  it('🟢 GREEN + PEAK phase blocks UP — anti "Sarcastic UP" Marius 5:1 sapt 4-5', async () => {
    const greenSessions = [
      { energyEmoji: 'green', energy: 'green' },
      { energyEmoji: 'green', energy: 'green' },
      { energyEmoji: 'green', energy: 'green' },
    ];
    const result = await evaluate(buildCtx({
      energyEmoji: 'green',
      profileTier: 'T1',
      recentSessions: greenSessions,
      periodizationConstraint: buildPeriodConstraint('PEAK'),
    }));
    expect(result.meta.adjustment_direction).toBe(ADJUSTMENT_DIRECTION.NONE);
    expect(result.meta.adjustment_magnitude_pct).toBe(0);
    expect(result.signals).toContain('up_blocked_periodization_phase_high_intensity');
  });

  it('🟡 YELLOW → NONE caution preserve baseline, NU drill-down (anti-friction)', async () => {
    const result = await evaluate(buildCtx({
      energyEmoji: 'yellow',
    }));
    expect(result.meta.adjustment_direction).toBe(ADJUSTMENT_DIRECTION.NONE);
    expect(result.meta.adjustment_magnitude_pct).toBe(0);
    expect(result.signals).not.toContain('drill_down_required_red_distressed');
  });

  it('Yo-yo flap UP→DOWN→UP detected → suppressed magnitude 0', async () => {
    const greenSessions = [
      { energyEmoji: 'green', energy: 'green' },
      { energyEmoji: 'green', energy: 'green' },
      { energyEmoji: 'green', energy: 'green' },
    ];
    const result = await evaluate(buildCtx({
      energyEmoji: 'green',
      profileTier: 'T1',
      recentSessions: greenSessions,
      periodizationConstraint: buildPeriodConstraint('LOAD'),
      recentAdjustmentDirections: [ADJUSTMENT_DIRECTION.DOWN, ADJUSTMENT_DIRECTION.UP],
    }));
    expect(result.signals).toContain('yoyo_3_session_anti_flap_suppressed');
    expect(result.meta.adjustment_magnitude_pct).toBe(0);
  });

  it('Bayesian σ high > threshold → dampening applied magnitude × 0.7', async () => {
    const greenSessions = [
      { energyEmoji: 'green', energy: 'green' },
      { energyEmoji: 'green', energy: 'green' },
      { energyEmoji: 'green', energy: 'green' },
    ];
    const result = await evaluate(buildCtx({
      energyEmoji: 'green',
      profileTier: 'T1',
      recentSessions: greenSessions,
      periodizationConstraint: buildPeriodConstraint('LOAD'),
      bayesianSigma: 0.30,
    }));
    expect(result.signals).toContain('bayesian_sigma_dampening_applied');
    expect(result.meta.adjustment_magnitude_pct).toBeCloseTo(0.105, 5); // 0.15 × 0.7
  });

  it('Sub-Floor 3rd session → Engine Deload escalation triggered Hook 2', async () => {
    const result = await evaluate(buildCtx({
      energyEmoji: 'red',
      profileTier: 'T1',
      recentSessions: [{ subFloor: true }, { subFloor: true }],
      currentSessionSubFloor: true,
    }));
    expect(result.signals).toContain('deload_escalation_triggered_sub_floor_3rd_session');
  });

  it('Sub-Floor escalation + composite low signals → medical referral banner surfaces verbatim copy', async () => {
    const result = await evaluate(buildCtx({
      energyEmoji: 'red',
      profileTier: 'T1',
      recentSessions: [{ subFloor: true }, { subFloor: true }],
      currentSessionSubFloor: true,
      compositeLowSignals: true,
    }));
    expect(result.signals).toContain('medical_referral_banner_surfaced');
    expect(result.trace.referralBanner.copy).toBe(MEDICAL_REFERRAL_COPY);
    expect(result.trace.referralBanner.copy).toBe('Consulta medicul de familie sau un specialist in medicina sportiva');
  });

  it('Sub-Floor escalation NU composite low → NU banner', async () => {
    const result = await evaluate(buildCtx({
      energyEmoji: 'red',
      profileTier: 'T1',
      recentSessions: [{ subFloor: true }, { subFloor: true }],
      currentSessionSubFloor: true,
      compositeLowSignals: false,
    }));
    expect(result.signals).not.toContain('medical_referral_banner_surfaced');
  });

  it('forward_constraint_object pass-through immutable Hook 4', async () => {
    const constraint = buildPeriodConstraint('LOAD');
    const result = await evaluate(buildCtx({
      energyEmoji: 'green',
      periodizationConstraint: constraint,
    }));
    expect(result.meta.forward_constraint_object).toBe(constraint); // reference identity
    expect(Object.isFrozen(result.meta.forward_constraint_object)).toBe(true);
  });

  it('volume_intensity_scope V1 always {volume: true, intensity: true} per Q33 §45.5', async () => {
    const result = await evaluate(buildCtx({ energyEmoji: 'green' }));
    expect(result.meta.volume_intensity_scope).toEqual({ volume: true, intensity: true });
  });

  it('confidence high when emoji + periodConstraint + recentSessions toate prezente', async () => {
    const result = await evaluate(buildCtx({
      energyEmoji: 'green',
      profileTier: 'T1',
      recentSessions: [
        { energyEmoji: 'green', energy: 'green' },
      ],
      periodizationConstraint: buildPeriodConstraint('LOAD'),
    }));
    expect(result.confidence).toBe('high');
  });

  it('confidence low cand emoji missing + no constraint + no sessions', async () => {
    const result = await evaluate({ user: {}, meta: {} });
    expect(result.confidence).toBe('low');
  });

  it('UP gating — recovery red flag in window blocks UP', async () => {
    const sessionsWithRed = [
      { energyEmoji: 'green', energy: 'red' },
      { energyEmoji: 'green', energy: 'green' },
      { energyEmoji: 'green', energy: 'green' },
    ];
    const result = await evaluate(buildCtx({
      energyEmoji: 'green',
      profileTier: 'T1',
      recentSessions: sessionsWithRed,
      periodizationConstraint: buildPeriodConstraint('LOAD'),
    }));
    expect(result.meta.adjustment_direction).toBe(ADJUSTMENT_DIRECTION.NONE);
    expect(result.signals).toContain('up_blocked_recovery_red_in_window');
  });

  it('persisted determinism cross 10 invocations cumulative', async () => {
    const ctx = buildCtx({
      energyEmoji: 'red',
      drillDownCause: 'durere',
      profileTier: 'T0',
      recentSessions: [
        { energyEmoji: 'green' },
        { energyEmoji: 'red' },
      ],
    });
    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(await evaluate(ctx));
    }
    const json = results.map((r) => JSON.stringify(r));
    expect(new Set(json).size).toBe(1);
  });

  it('pipeline 3rd canonical engine ID confirmed', () => {
    expect(ENGINE_ID).toBe('energyAdjustment');
  });
});
