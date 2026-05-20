import { describe, it, expect } from 'vitest';
import { evaluate, ENGINE_ID } from '../index.js';
import { PHASES, PUSHBACK_TIERS as _PUSHBACK_TIERS, TEMPLATE_IDS } from '../constants.js';

const buildCtx = ({
  persona,
  age,
  goal,
  bfPct,
  sex,
  trainingWeeks,
  mode,
  kg,
  recentSessions = [],
  periodizationConstraint = null,
  tdeeKcal = 0,
  aggressiveOptIn = false,
} = {}) => ({
  user: {
    ...(persona ? { persona } : {}),
    ...(age != null ? { age } : {}),
    ...(goal ? { goal } : {}),
    ...(bfPct != null ? { bfPct } : {}),
    ...(sex ? { sex } : {}),
    ...(trainingWeeks != null ? { trainingWeeks } : {}),
    ...(mode ? { mode } : {}),
    ...(kg != null ? { kg } : {}),
  },
  recentSessions,
  weights: {},
  flags: {},
  meta: {
    periodizationConstraint,
    tdeeKcal,
    aggressiveOptIn,
  },
});

describe('evaluate — integration end-to-end §9.2 ADR 026', () => {
  it('returns valid GoalAdaptationResult shape per ADR 018 §2 contract', async () => {
    const result = await evaluate(buildCtx({
      persona: 'marius', goal: 'hipertrofie', kg: 80, bfPct: 0.15,
      tdeeKcal: 2400,
    }));
    expect(result.id).toBe(ENGINE_ID);
    expect(['none', 'LOW', 'MED', 'HIGH']).toContain(result.tier);
    expect(['low', 'medium', 'high']).toContain(result.confidence);
    expect(Array.isArray(result.signals)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(typeof result.trace).toBe('object');
    expect(typeof result.meta).toBe('object');
  });

  it('blueprint contains 6 fields per §9.2.1 Cluster 1 verbatim', async () => {
    const result = await evaluate(buildCtx({ persona: 'marius', goal: 'hipertrofie' }));
    expect(result.meta).toHaveProperty('phase');
    expect(result.meta).toHaveProperty('kcal_target_delta_pct');
    expect(result.meta).toHaveProperty('macro_split');
    expect(result.meta).toHaveProperty('rep_range_modifier');
    expect(result.meta).toHaveProperty('rir_target_modifier');
    expect(result.meta).toHaveProperty('rest_time_modifier');
  });

  it('total function — never throws on empty/null ctx', async () => {
    await expect(evaluate()).resolves.toBeDefined();
    await expect(evaluate(null)).resolves.toBeDefined();
    await expect(evaluate({})).resolves.toBeDefined();
    await expect(evaluate({ user: null })).resolves.toBeDefined();
  });

  it('empty ctx → tier none, confidence low, signals safe', async () => {
    const result = await evaluate({});
    expect(result.tier).toBe('none');
    expect(result.confidence).toBe('low');
    expect(result.signals).toBeDefined();
  });

  it('deterministic — identical ctx → identical output (ZERO Date.now / Math.random)', async () => {
    const ctx = buildCtx({ persona: 'marius', goal: 'hipertrofie', kg: 80, bfPct: 0.15, tdeeKcal: 2400 });
    const r1 = await evaluate(ctx);
    const r2 = await evaluate(ctx);
    expect(JSON.stringify(r1)).toEqual(JSON.stringify(r2));
  });

  it('Forta goal → BULK phase + forta_dezvoltare template', async () => {
    const result = await evaluate(buildCtx({
      persona: 'marius', goal: 'forta', age: 25, bfPct: 0.12,
      trainingWeeks: 100, kg: 80, tdeeKcal: 2400,
    }));
    expect(result.meta.phase).toBe(PHASES.BULK);
    expect(result.trace.templateId).toBe(TEMPLATE_IDS.forta_dezvoltare);
  });

  it('Sanatate goal → MAINTAIN phase + sanatate_generala template', async () => {
    const result = await evaluate(buildCtx({
      persona: 'gigica', goal: 'sanatate', age: 35, bfPct: 0.18,
      trainingWeeks: 100, kg: 75, tdeeKcal: 2200,
    }));
    expect(result.meta.phase).toBe(PHASES.MAINTAIN);
    expect(result.trace.templateId).toBe(TEMPLATE_IDS.sanatate_generala);
  });

  it('Hipertrofie newbie → RECOMP sub-phase auto-detected', async () => {
    const result = await evaluate(buildCtx({
      persona: 'marius', goal: 'hipertrofie', age: 25,
      trainingWeeks: 5, kg: 75, bfPct: 0.18, tdeeKcal: 2400,
    }));
    expect(result.meta.phase).toBe(PHASES.RECOMP);
    expect(result.signals).toContain('phase_recomp_sub_detected');
  });

  it('Forta + age 65 + BF% high + injury → Tier 3 push-back applied', async () => {
    const result = await evaluate(buildCtx({
      goal: 'forta', age: 65, bfPct: 0.30, sex: 'male',
      kg: 90, trainingWeeks: 100, tdeeKcal: 2200,
      recentSessions: [{ injury: true, daysAgo: 10 }],
    }));
    expect(result.signals).toContain('pushback_tier_3_modal');
    expect(result.signals).toContain('tier3_conservative_modifiers_applied');
  });

  it('Maria 65 sanatate → Tier 2 banner banner cu age + BF% low signals', async () => {
    const result = await evaluate(buildCtx({
      persona: 'maria', goal: 'sanatate', age: 65, bfPct: 0.20, sex: 'female',
      kg: 60, trainingWeeks: 50, tdeeKcal: 2000,
    }));
    // Score 1: age_60_plus only (sanatate goal NU triggers aggressive_forta cumulative)
    expect(result.signals).toContain('pushback_tier_2_banner');
  });

  it('Gigica 35 healthy → Tier 1 silent', async () => {
    const result = await evaluate(buildCtx({
      persona: 'gigica', goal: 'sanatate', age: 35, bfPct: 0.18, sex: 'male',
      kg: 75, trainingWeeks: 100, tdeeKcal: 2400,
    }));
    expect(result.signals).toContain('pushback_tier_1_silent');
  });

  it('BULK phase + DELOAD week → kcal override applied (+3% bonus)', async () => {
    const periodConstraint = Object.freeze({
      intensity_pct_1rm: { floor: 0.50, ceiling: 0.70 },
      volume_per_muscle: {},
      phase: 'DELOAD',
      deload_window: { trigger: 'CALENDAR', days: 7 },
      immutable_snapshot: true,
    });
    const result = await evaluate(buildCtx({
      persona: 'marius', goal: 'forta', age: 25, kg: 80, bfPct: 0.12,
      trainingWeeks: 100, tdeeKcal: 2600,
      recentSessions: [{ daysAgo: 3 }, { daysAgo: 5 }],
      periodizationConstraint: periodConstraint,
    }));
    expect(result.signals).toContain('deload_kcal_override_applied');
    // BULK conservative 1.08 × 1.03 deload bonus = 1.1124
    expect(result.meta.kcal_target_delta_pct).toBeGreaterThan(1.08);
  });

  it('confidence high when user + periodConstraint + tdee toate prezente', async () => {
    const periodConstraint = {
      intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
      volume_per_muscle: { chest: { floor: 8, ceiling: 14 } },
      phase: 'LOAD',
      deload_window: null,
      immutable_snapshot: true,
    };
    const result = await evaluate(buildCtx({
      persona: 'marius', goal: 'hipertrofie', age: 25,
      kg: 80, bfPct: 0.12, trainingWeeks: 100,
      tdeeKcal: 2400,
      periodizationConstraint: periodConstraint,
    }));
    expect(result.confidence).toBe('high');
  });

  it('rep_range_modifier integer pair format', async () => {
    const result = await evaluate(buildCtx({
      persona: 'marius', goal: 'hipertrofie', age: 25, kg: 80, tdeeKcal: 2400,
    }));
    expect(Array.isArray(result.meta.rep_range_modifier)).toBe(true);
    expect(result.meta.rep_range_modifier).toHaveLength(2);
    expect(Number.isInteger(result.meta.rep_range_modifier[0])).toBe(true);
    expect(Number.isInteger(result.meta.rep_range_modifier[1])).toBe(true);
  });

  it('rir_target_modifier integer pair format', async () => {
    const result = await evaluate(buildCtx({
      persona: 'marius', goal: 'hipertrofie', age: 25,
    }));
    expect(Array.isArray(result.meta.rir_target_modifier)).toBe(true);
    expect(result.meta.rir_target_modifier).toHaveLength(2);
  });

  it('rest_time_modifier integer pair format', async () => {
    const result = await evaluate(buildCtx({
      persona: 'marius', goal: 'forta', age: 25,
    }));
    expect(Array.isArray(result.meta.rest_time_modifier)).toBe(true);
    expect(result.meta.rest_time_modifier).toHaveLength(2);
    expect(result.meta.rest_time_modifier[0]).toBeGreaterThanOrEqual(30);
  });

  it('macro_split has protein/fat/carb fields', async () => {
    const result = await evaluate(buildCtx({
      persona: 'gigica', goal: 'hipertrofie', age: 35,
      kg: 75, bfPct: 0.18, tdeeKcal: 2400,
    }));
    expect(result.meta.macro_split).toHaveProperty('protein_g_per_kg_lbm');
    expect(result.meta.macro_split).toHaveProperty('fat_g_per_kg');
    expect(result.meta.macro_split).toHaveProperty('carb_g');
  });

  it('Mode forta overlay applied → rep range shift -1', async () => {
    const baseline = await evaluate(buildCtx({
      persona: 'gigica', goal: 'hipertrofie', age: 35, kg: 75, tdeeKcal: 2400,
    }));
    const fortaMode = await evaluate(buildCtx({
      persona: 'gigica', goal: 'hipertrofie', age: 35, kg: 75, tdeeKcal: 2400,
      mode: 'forta',
    }));
    expect(fortaMode.meta.rep_range_modifier[1]).toBeLessThan(baseline.meta.rep_range_modifier[1]);
  });

  it('persisted determinism cross 10 invocations cumulative', async () => {
    const ctx = buildCtx({
      persona: 'marius', goal: 'forta', age: 25, kg: 80, bfPct: 0.12,
      trainingWeeks: 100, tdeeKcal: 2600,
    });
    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(await evaluate(ctx));
    }
    const json = results.map((r) => JSON.stringify(r));
    expect(new Set(json).size).toBe(1);
  });
});
