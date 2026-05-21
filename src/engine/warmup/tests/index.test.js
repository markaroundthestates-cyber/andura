import { describe, it, expect } from 'vitest';
import { evaluate, ENGINE_ID } from '../index.js';
import {
  WARMUP_STATE,
  SCHEMA_CONSTANTS,
} from '../constants.js';

const buildPeriodConstraint = (phase = 'LOAD') => Object.freeze({
  intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
  volume_per_muscle: {},
  phase,
  deload_window: null,
  immutable_snapshot: true,
});

const buildCtx = ({
  persona,
  profileTier = 'T0',
  goalPhase,
  periodizationPhase,
  periodizationConstraint = null,
  energyDirection,
  specializationWeakGroup,
  targetMuscleGroups = [],
  generalSetsCount,
  specificSetsCount,
  userOptedSkip,
  painButtonActive,
  painAffectedGroups,
} = {}) => ({
  profileTier,
  meta: {
    ...(persona ? { persona } : {}),
    ...(goalPhase ? { goalPhase } : {}),
    ...(periodizationPhase ? { periodizationPhase } : {}),
    ...(periodizationConstraint ? { periodizationConstraint } : {}),
    ...(energyDirection ? { energyDirection } : {}),
    ...(specializationWeakGroup ? { specializationWeakGroup } : {}),
    targetMuscleGroups,
    ...(generalSetsCount != null ? { generalSetsCount } : {}),
    ...(specificSetsCount != null ? { specificSetsCount } : {}),
    ...(userOptedSkip != null ? { userOptedSkip } : {}),
    ...(painButtonActive != null ? { painButtonActive } : {}),
    ...(painAffectedGroups ? { painAffectedGroups } : {}),
  },
});

describe('evaluate — public API contract per ADR 018 §2', () => {
  it('ENGINE_ID === "warmup"', () => {
    expect(ENGINE_ID).toBe('warmup');
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

  it('evaluate cu persona+tier+goalPhase resolved → tier !== "none"', async () => {
    const r = await evaluate(buildCtx({
      persona:  'maria',
      profileTier: 'T1',
      goalPhase: 'CUT',
    }));
    expect(r.tier).not.toBe('none');
  });

  it('blueprint contains all 9 Cluster A1 fields', async () => {
    const r = await evaluate(buildCtx({ persona: 'marius', profileTier: 'T1' }));
    expect(r.meta).toHaveProperty('warmup_state');
    expect(r.meta).toHaveProperty('duration_min');
    expect(r.meta).toHaveProperty('routine_type');
    expect(r.meta).toHaveProperty('general_sets');
    expect(r.meta).toHaveProperty('general_sets_list');
    expect(r.meta).toHaveProperty('specific_sets');
    expect(r.meta).toHaveProperty('specific_sets_list');
    expect(r.meta).toHaveProperty('target_muscle_groups');
    expect(r.meta).toHaveProperty('skip_available');
    expect(r.meta).toHaveProperty('cooldown_state');
    expect(r.meta).toHaveProperty('ui_label');
    expect(r.meta).toHaveProperty('signals');
  });

  it('total function — never throws on null/undefined/empty', async () => {
    await expect(evaluate()).resolves.toBeDefined();
    await expect(evaluate(null)).resolves.toBeDefined();
    await expect(evaluate({})).resolves.toBeDefined();
    await expect(evaluate({ user: null })).resolves.toBeDefined();
  });

  it('deterministic — identical ctx → identical output (10 invocations)', async () => {
    const ctx = buildCtx({
      persona:    'maria',
      profileTier: 'T1',
      goalPhase:  'CUT',
      periodizationPhase: 'LOAD',
      energyDirection: 'NONE',
      targetMuscleGroups: ['chest', 'back'],
    });
    const results = [];
    for (let i = 0; i < 10; i += 1) {
      results.push(await evaluate(ctx));
    }
    const json = results.map((r) => JSON.stringify(r));
    expect(new Set(json).size).toBe(1);
  });

  it('ZERO side effects — input ctx NOT mutated', async () => {
    const ctx = buildCtx({ persona: 'marius', profileTier: 'T1' });
    const ctxFrozen = Object.freeze({ ...ctx, meta: Object.freeze({ ...ctx.meta }) });
    const r = await evaluate(ctxFrozen);
    expect(r).toBeDefined();
    // No mutation expected (frozen object would throw on mutation in strict mode)
  });
});

describe('evaluate — warmup_state determination per Cluster A1', () => {
  it('Default ctx → ACTIVE state', async () => {
    const r = await evaluate(buildCtx({
      persona:    'marius',
      profileTier: 'T1',
      goalPhase:  'BULK',
    }));
    expect(r.meta.warmup_state).toBe(WARMUP_STATE.ACTIVE);
    expect(r.tier).toBe('HIGH');
  });

  it('Periodization DELOAD week → DELOAD_LIGHTER state', async () => {
    const r = await evaluate(buildCtx({
      persona:    'marius',
      profileTier: 'T1',
      periodizationConstraint: buildPeriodConstraint('DELOAD'),
    }));
    expect(r.meta.warmup_state).toBe(WARMUP_STATE.DELOAD_LIGHTER);
    expect(r.tier).toBe('MED');
    expect(r.signals).toContain('warmup_deload_lighter_d1_periodization_recovery_week');
  });

  it('userOptedSkip=true → SKIPPED state', async () => {
    const r = await evaluate(buildCtx({
      persona:    'gigica',
      profileTier: 'T1',
      userOptedSkip: true,
    }));
    expect(r.meta.warmup_state).toBe(WARMUP_STATE.SKIPPED);
    expect(r.tier).toBe('MED');
    expect(r.signals).toContain('warmup_skipped_user_toggle_b4_q65_3_buton_vizibil_session_1');
  });

  it('Pain Button active → INJURY_DISABLED state (Pain-Aware §9.4.6 reference)', async () => {
    const r = await evaluate(buildCtx({
      persona:    'maria',
      profileTier: 'T1',
      painButtonActive: true,
      painAffectedGroups: ['chest'],
    }));
    expect(r.meta.warmup_state).toBe(WARMUP_STATE.INJURY_DISABLED);
    expect(r.tier).toBe('LOW');
    expect(r.signals).toContain('warmup_injury_disabled_pain_aware_reference_94_6_clean_signal_rule');
  });

  it('INJURY_DISABLED priority over SKIPPED + DELOAD_LIGHTER', async () => {
    const r = await evaluate(buildCtx({
      persona:    'marius',
      profileTier: 'T1',
      userOptedSkip: true,
      periodizationConstraint: buildPeriodConstraint('DELOAD'),
      painButtonActive: true,
    }));
    expect(r.meta.warmup_state).toBe(WARMUP_STATE.INJURY_DISABLED);
  });
});

describe('evaluate — output blueprint content correctness', () => {
  it('skip_available always true V1 (Source 1 §65.3 buton vizibil session 1)', async () => {
    const r = await evaluate(buildCtx({
      persona:    'maria',
      profileTier: 'T0',
    }));
    expect(r.meta.skip_available).toBe(true);
  });

  it('skip_available true even when 3+ logged warm-ups (anti-paternalism ADR 025)', async () => {
    // V1 LOCKED — engine NU disables skip based on history (anti-paternalism)
    const r = await evaluate(buildCtx({
      persona:    'gigica',
      profileTier: 'T2',
    }));
    expect(r.meta.skip_available).toBe(true);
  });

  it('routine_type = "hybrid" V1 LOCKED Q65.2 Option C', async () => {
    const r = await evaluate(buildCtx({
      persona:    'marius',
      profileTier: 'T1',
      targetMuscleGroups: ['chest', 'shoulders'],
    }));
    expect(r.meta.routine_type).toBe('hybrid');
  });

  it('ui_label RO native "Incalzire ~X min" format', async () => {
    const r = await evaluate(buildCtx({
      persona:    'maria',
      profileTier: 'T1',
    }));
    expect(r.meta.ui_label).toMatch(/^Incalzire ~\d+ min$/);
  });

  it('cooldown_state offered when ACTIVE state + content text-only', async () => {
    const r = await evaluate(buildCtx({
      persona:    'marius',
      profileTier: 'T1',
    }));
    expect(r.meta.cooldown_state.offered).toBe(true);
    expect(r.meta.cooldown_state.content).toBe('text-only');
    expect(r.meta.cooldown_state.durationMin).toBe(SCHEMA_CONSTANTS.cooldownDurationMin);
    expect(Array.isArray(r.meta.cooldown_state.stretches)).toBe(true);
  });

  it('cooldown_state suppressed when INJURY_DISABLED', async () => {
    const r = await evaluate(buildCtx({
      persona:    'maria',
      profileTier: 'T1',
      painButtonActive: true,
    }));
    expect(r.meta.cooldown_state.offered).toBe(false);
  });

  it('confidence high cand persona + tier + periodConstraint toate prezente', async () => {
    const r = await evaluate(buildCtx({
      persona:    'marius',
      profileTier: 'T1',
      periodizationConstraint: buildPeriodConstraint('LOAD'),
    }));
    expect(r.confidence).toBe('high');
  });

  it('persisted determinism cross 10 invocations', async () => {
    const ctx = buildCtx({
      persona:    'maria',
      profileTier: 'T1',
      goalPhase:  'CUT',
      targetMuscleGroups: ['legs', 'glutes'],
    });
    const results = [];
    for (let i = 0; i < 10; i += 1) {
      results.push(await evaluate(ctx));
    }
    const json = results.map((r) => JSON.stringify(r));
    expect(new Set(json).size).toBe(1);
  });

  it('pipeline 7th canonical engine ID confirmed (NU "Engine #8" legacy)', () => {
    expect(ENGINE_ID).toBe('warmup');
  });
});
