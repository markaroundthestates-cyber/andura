import { describe, it, expect } from 'vitest';
import {
  basePhaseForGoal,
  basePhaseForTemplate,
  tdeeMultiplierForPhase,
  applyDeloadKcalOverride,
  detectPhase,
  computeLbm,
  computeMacroSplit,
} from '../phaseAutoDetection.js';
import {
  PHASES,
  TDEE_MULTIPLIERS,
  DELOAD_KCAL_BONUS,
  TEMPLATE_IDS,
} from '../constants.js';

describe('basePhaseForGoal — §9.2.3 Cluster 3 phase mapping', () => {
  it('forta → BULK', () => {
    expect(basePhaseForGoal('forta')).toBe(PHASES.BULK);
  });
  it('hipertrofie → BULK conservative', () => {
    expect(basePhaseForGoal('hipertrofie')).toBe(PHASES.BULK);
  });
  it('recompozitie → MAINTAIN baseline (RECOMP sub-phase auto)', () => {
    expect(basePhaseForGoal('recompozitie')).toBe(PHASES.MAINTAIN);
  });
  it('longevitate / sanatate → MAINTAIN', () => {
    expect(basePhaseForGoal('longevitate')).toBe(PHASES.MAINTAIN);
    expect(basePhaseForGoal('sanatate')).toBe(PHASES.MAINTAIN);
  });
  it('unknown → MAINTAIN defensive default', () => {
    expect(basePhaseForGoal('foo')).toBe(PHASES.MAINTAIN);
  });
});

describe('basePhaseForTemplate — direct override per ADR 024 §1.2', () => {
  it('slabire template → CUT', () => {
    expect(basePhaseForTemplate(TEMPLATE_IDS.slabire)).toBe(PHASES.CUT);
  });
  it('forta_dezvoltare → BULK', () => {
    expect(basePhaseForTemplate(TEMPLATE_IDS.forta_dezvoltare)).toBe(PHASES.BULK);
  });
  it('tonifiere_definire → MAINTAIN baseline', () => {
    expect(basePhaseForTemplate(TEMPLATE_IDS.tonifiere_definire)).toBe(PHASES.MAINTAIN);
  });
});

describe('tdeeMultiplierForPhase — §9.2.3 Cluster 3 TDEE thresholds verbatim', () => {
  it('CUT conservative default → 0.82', () => {
    expect(tdeeMultiplierForPhase({ phase: PHASES.CUT })).toBe(TDEE_MULTIPLIERS.CUT_CONSERVATIVE);
    expect(tdeeMultiplierForPhase({ phase: PHASES.CUT })).toBeCloseTo(0.82, 5);
  });
  it('CUT aggressive Marius opt-in → 0.75', () => {
    const r = tdeeMultiplierForPhase({
      phase: PHASES.CUT,
      personaId: 'marius',
      isAggressiveOptIn: true,
    });
    expect(r).toBe(TDEE_MULTIPLIERS.CUT_AGGRESSIVE);
    expect(r).toBeCloseTo(0.75, 5);
  });
  it('CUT aggressive NU Marius → conservative fallback', () => {
    const r = tdeeMultiplierForPhase({
      phase: PHASES.CUT,
      personaId: 'maria',
      isAggressiveOptIn: true,
    });
    expect(r).toBe(TDEE_MULTIPLIERS.CUT_CONSERVATIVE);
  });
  it('BULK conservative default → 1.08', () => {
    expect(tdeeMultiplierForPhase({ phase: PHASES.BULK })).toBeCloseTo(1.08, 5);
  });
  it('BULK aggressive newbie + Forță combo → 1.15', () => {
    const r = tdeeMultiplierForPhase({
      phase: PHASES.BULK,
      isNewbie: true,
      templateId: TEMPLATE_IDS.forta_dezvoltare,
    });
    expect(r).toBe(TDEE_MULTIPLIERS.BULK_AGGRESSIVE);
    expect(r).toBeCloseTo(1.15, 5);
  });
  it('BULK newbie BUT NU Forță → conservative', () => {
    const r = tdeeMultiplierForPhase({
      phase: PHASES.BULK,
      isNewbie: true,
      templateId: TEMPLATE_IDS.tonifiere_definire,
    });
    expect(r).toBeCloseTo(1.08, 5);
  });
  it('MAINTAIN → 1.00 baseline', () => {
    expect(tdeeMultiplierForPhase({ phase: PHASES.MAINTAIN })).toBe(1.0);
  });
  it('RECOMP → 1.00 baseline (±2% engine reads ctx)', () => {
    expect(tdeeMultiplierForPhase({ phase: PHASES.RECOMP })).toBe(1.0);
  });
});

describe('applyDeloadKcalOverride — §9.2.3 verbatim "+3-5% even CUT"', () => {
  it('NU deload → multiplier passthrough', () => {
    expect(applyDeloadKcalOverride(0.82, false)).toBe(0.82);
    expect(applyDeloadKcalOverride(0.82, undefined)).toBe(0.82);
  });
  it('DELOAD week → multiplier × 1.03 (LOW pick V1 conservative)', () => {
    const r = applyDeloadKcalOverride(0.82, true);
    expect(r).toBeCloseTo(0.82 * DELOAD_KCAL_BONUS.LOW, 5);
    expect(r).toBeGreaterThan(0.82);
  });
  it('DELOAD raises CUT towards MAINTAIN (recovery imperative)', () => {
    const cut = applyDeloadKcalOverride(0.82, true);
    expect(cut).toBeGreaterThan(0.82);
    expect(cut).toBeLessThan(1.00);
  });
});

describe('detectPhase — §9.2.3 + RECOMP §9.2.2 + ADR 024 §2.4 Q4 auto-detect', () => {
  it('Slăbire template → CUT', () => {
    const r = detectPhase({
      goalId: 'sanatate',
      templateId: TEMPLATE_IDS.slabire,
      user: { trainingWeeks: 100, bfPct: 0.15 },
      recentSessions: [{ daysAgo: 5 }],
    });
    expect(r.phase).toBe(PHASES.CUT);
  });
  it('Forța template → BULK', () => {
    const r = detectPhase({
      goalId: 'forta',
      templateId: TEMPLATE_IDS.forta_dezvoltare,
      user: { trainingWeeks: 100, bfPct: 0.15 },
      recentSessions: [{ daysAgo: 5 }],
    });
    expect(r.phase).toBe(PHASES.BULK);
  });
  it('Tonifiere + newbie → RECOMP detected (sub-phase override)', () => {
    const r = detectPhase({
      goalId: 'hipertrofie',
      templateId: TEMPLATE_IDS.tonifiere_definire,
      user: { trainingWeeks: 5 },
    });
    expect(r.phase).toBe(PHASES.RECOMP);
    expect(r.signals).toContain('phase_recomp_sub_detected');
  });
  it('Sănătate experienced lean trained → MAINTAIN', () => {
    const r = detectPhase({
      goalId: 'sanatate',
      templateId: TEMPLATE_IDS.sanatate_generala,
      user: { trainingWeeks: 100, bfPct: 0.15 },
      recentSessions: [{ daysAgo: 3 }],
    });
    expect(r.phase).toBe(PHASES.MAINTAIN);
  });
});

describe('computeLbm — Lean Body Mass derivation', () => {
  it('explicit BF% → kg × (1 - bfPct)', () => {
    expect(computeLbm({ kg: 80, bfPct: 0.20 })).toBe(64); // 80 × 0.80
  });
  it('missing BF% → defensive 85% fallback', () => {
    expect(computeLbm({ kg: 80 })).toBe(80 * 0.85);
  });
  it('missing kg → 0', () => {
    expect(computeLbm({})).toBe(0);
    expect(computeLbm(null)).toBe(0);
    expect(computeLbm(undefined)).toBe(0);
  });
  it('invalid bfPct → defensive 85%', () => {
    expect(computeLbm({ kg: 100, bfPct: 'foo' })).toBe(85);
    expect(computeLbm({ kg: 100, bfPct: -0.5 })).toBe(85);
    expect(computeLbm({ kg: 100, bfPct: 1.5 })).toBe(85);
  });
});

describe('computeMacroSplit — §9.2.3 Cluster 3 verbatim bands', () => {
  it('protein within 1.6-2.2 g/kg LBM band (V1 midpoint pick)', () => {
    const m = computeMacroSplit({
      user: { kg: 80, bfPct: 0.20 },
      tdeeKcal: 2400,
      kcalDeltaPct: 1.0,
    });
    // LBM = 64; midpoint protein = 1.9 → 64 × 1.9 = 121.6 → round 122
    expect(m.protein_g_per_kg_lbm).toBeGreaterThanOrEqual(64 * 1.6);
    expect(m.protein_g_per_kg_lbm).toBeLessThanOrEqual(64 * 2.2);
  });
  it('fat within 0.8-1.0 g/kg band hormonal floor', () => {
    const m = computeMacroSplit({
      user: { kg: 80, bfPct: 0.20 },
      tdeeKcal: 2400,
      kcalDeltaPct: 1.0,
    });
    expect(m.fat_g_per_kg).toBeGreaterThanOrEqual(80 * 0.8);
    expect(m.fat_g_per_kg).toBeLessThanOrEqual(80 * 1.0);
  });
  it('carb remainder calculated (kcal_target − protein_kcal − fat_kcal) / 4', () => {
    const m = computeMacroSplit({
      user: { kg: 80, bfPct: 0.20 },
      tdeeKcal: 2400,
      kcalDeltaPct: 1.0,
    });
    expect(m.carb_g).toBeGreaterThan(0);
  });
  it('CUT phase reduces carb (carb is the swing macro)', () => {
    const maintain = computeMacroSplit({
      user: { kg: 80, bfPct: 0.20 },
      tdeeKcal: 2400,
      kcalDeltaPct: 1.0,
    });
    const cut = computeMacroSplit({
      user: { kg: 80, bfPct: 0.20 },
      tdeeKcal: 2400,
      kcalDeltaPct: 0.82,
    });
    expect(cut.carb_g).toBeLessThan(maintain.carb_g);
    // Protein + fat preserved (bands NOT phase-dependent în V1)
    expect(cut.protein_g_per_kg_lbm).toBe(maintain.protein_g_per_kg_lbm);
    expect(cut.fat_g_per_kg).toBe(maintain.fat_g_per_kg);
  });
  it('missing tdee → carb 0 floor (defensive)', () => {
    const m = computeMacroSplit({
      user: { kg: 80, bfPct: 0.20 },
      tdeeKcal: 0,
      kcalDeltaPct: 1.0,
    });
    expect(m.carb_g).toBe(0);
  });
});
