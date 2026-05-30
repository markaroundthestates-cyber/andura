// ══ GOAL / PHASE / NUTRITION COHERENCE MODEL — pure unit tests ══════════════
// Covers the model that makes goal + target weight + phase + kcal coherent
// (2026-05-30, Daniel repro masa+target90 → 2200 deficit). All pure — no I/O.

import { describe, it, expect } from 'vitest';
import {
  targetDirection,
  phaseForGoal,
  enabledGoalsForDirection,
  isGoalEnabled,
  deriveAutoPhase,
  sizeKcalForPhase,
  MAINTAIN_BAND_KG,
  KCAL_PER_KG,
  MAX_LOSS_KG_PER_WEEK,
  MAX_GAIN_KG_PER_WEEK,
} from '../../lib/goalPhaseModel';

describe('targetDirection — master intent from target vs current weight', () => {
  it('target below current (beyond band) → LOSE', () => {
    expect(targetDirection(110, 90)).toBe('LOSE');
  });
  it('target above current (beyond band) → GAIN', () => {
    expect(targetDirection(70, 80)).toBe('GAIN');
  });
  it('target within MAINTAIN band → MAINTAIN', () => {
    expect(targetDirection(110, 110 - (MAINTAIN_BAND_KG - 0.1))).toBe('MAINTAIN');
    expect(targetDirection(110, 110)).toBe('MAINTAIN');
  });
  it('exactly at band edge counts as the direction (>= band)', () => {
    expect(targetDirection(110, 110 - MAINTAIN_BAND_KG)).toBe('LOSE');
  });
  it('missing / invalid inputs → null (no gating)', () => {
    expect(targetDirection(null, 90)).toBeNull();
    expect(targetDirection(110, null)).toBeNull();
    expect(targetDirection(0, 90)).toBeNull();
    expect(targetDirection(110, -5)).toBeNull();
  });
});

describe('phaseForGoal — goal → phase-override token', () => {
  it('maps each goal to its phase', () => {
    expect(phaseForGoal('masa')).toBe('BULK');
    expect(phaseForGoal('slabire')).toBe('CUT');
    expect(phaseForGoal('forta')).toBe('STRENGTH');
    expect(phaseForGoal('mentenanta')).toBe('MAINTENANCE');
    expect(phaseForGoal('auto')).toBe('AUTO');
  });
  it('null / undefined → AUTO', () => {
    expect(phaseForGoal(null)).toBe('AUTO');
    expect(phaseForGoal(undefined)).toBe('AUTO');
  });
});

describe('gating — enabled/disabled goals per target direction', () => {
  it('LOSE → enabled auto+slabire; disabled masa/mentenanta/forta', () => {
    expect(isGoalEnabled('auto', 'LOSE')).toBe(true);
    expect(isGoalEnabled('slabire', 'LOSE')).toBe(true);
    expect(isGoalEnabled('masa', 'LOSE')).toBe(false);
    expect(isGoalEnabled('mentenanta', 'LOSE')).toBe(false);
    expect(isGoalEnabled('forta', 'LOSE')).toBe(false);
  });
  it('MAINTAIN → enabled auto+mentenanta+forta; disabled slabire/masa', () => {
    expect(isGoalEnabled('auto', 'MAINTAIN')).toBe(true);
    expect(isGoalEnabled('mentenanta', 'MAINTAIN')).toBe(true);
    expect(isGoalEnabled('forta', 'MAINTAIN')).toBe(true);
    expect(isGoalEnabled('slabire', 'MAINTAIN')).toBe(false);
    expect(isGoalEnabled('masa', 'MAINTAIN')).toBe(false);
  });
  it('GAIN → enabled auto+masa+forta; disabled slabire/mentenanta', () => {
    expect(isGoalEnabled('auto', 'GAIN')).toBe(true);
    expect(isGoalEnabled('masa', 'GAIN')).toBe(true);
    expect(isGoalEnabled('forta', 'GAIN')).toBe(true);
    expect(isGoalEnabled('slabire', 'GAIN')).toBe(false);
    expect(isGoalEnabled('mentenanta', 'GAIN')).toBe(false);
  });
  it('no target (null) → all enabled', () => {
    const all = enabledGoalsForDirection(null);
    for (const g of ['auto', 'forta', 'masa', 'slabire', 'mentenanta'] as const) {
      expect(all.has(g)).toBe(true);
    }
  });
  it('auto is never disabled', () => {
    for (const dir of ['LOSE', 'MAINTAIN', 'GAIN', null] as const) {
      expect(isGoalEnabled('auto', dir)).toBe(true);
    }
  });
});

describe('deriveAutoPhase — target-driven + BF-driven sex-aware', () => {
  it('target LOSE wins → CUT (even with low BF)', () => {
    expect(deriveAutoPhase({ direction: 'LOSE', bfFraction: 0.08, sex: 'm' })).toBe('CUT');
  });
  it('target GAIN wins → BULK (even with high BF)', () => {
    expect(deriveAutoPhase({ direction: 'GAIN', bfFraction: 0.40, sex: 'm' })).toBe('BULK');
  });
  it('men: BF > 15% → CUT, < 12% → BULK, else MAINTENANCE', () => {
    expect(deriveAutoPhase({ direction: 'MAINTAIN', bfFraction: 0.20, sex: 'm' })).toBe('CUT');
    expect(deriveAutoPhase({ direction: null, bfFraction: 0.10, sex: 'm' })).toBe('BULK');
    expect(deriveAutoPhase({ direction: null, bfFraction: 0.135, sex: 'm' })).toBe('MAINTENANCE');
  });
  it('women: BF > 25% → CUT, < 22% → BULK, else MAINTENANCE', () => {
    expect(deriveAutoPhase({ direction: null, bfFraction: 0.30, sex: 'f' })).toBe('CUT');
    expect(deriveAutoPhase({ direction: null, bfFraction: 0.20, sex: 'f' })).toBe('BULK');
    expect(deriveAutoPhase({ direction: null, bfFraction: 0.235, sex: 'f' })).toBe('MAINTENANCE');
  });
  it('no BF signal → MAINTENANCE', () => {
    expect(deriveAutoPhase({ direction: null, bfFraction: null, sex: 'm' })).toBe('MAINTENANCE');
    expect(deriveAutoPhase({ direction: null, bfFraction: 0, sex: 'f' })).toBe('MAINTENANCE');
  });
});

describe('sizeKcalForPhase — rate-capped, sign forced by phase', () => {
  const FLOOR = 1200;
  const base = { maintenanceTdee: 2800, kcalFloor: FLOOR };

  it('MAINTENANCE → maintenance (no shift)', () => {
    const r = sizeKcalForPhase({ ...base, phase: 'MAINTENANCE', currentKg: 100, targetKg: 100, daysRemaining: 90 });
    expect(r.kcalTarget).toBe(2800);
    expect(r.dailyShift).toBe(0);
  });

  it('STRENGTH → slight surplus (+5%)', () => {
    const r = sizeKcalForPhase({ ...base, phase: 'STRENGTH', currentKg: 100, targetKg: null, daysRemaining: null });
    expect(r.kcalTarget).toBe(Math.round(2800 * 1.05));
  });

  it('CUT no target → default 0.5 kg/wk deficit', () => {
    const r = sizeKcalForPhase({ ...base, phase: 'CUT', currentKg: null, targetKg: null, daysRemaining: null });
    expect(r.kcalTarget).toBe(2800 - Math.round((0.5 * KCAL_PER_KG) / 7));
    expect(r.rateCapped).toBe(false);
  });

  it('BULK no target → default 0.25 kg/wk surplus', () => {
    const r = sizeKcalForPhase({ ...base, phase: 'BULK', currentKg: null, targetKg: null, daysRemaining: null });
    expect(r.kcalTarget).toBe(2800 + Math.round((0.25 * KCAL_PER_KG) / 7));
  });

  it('aggressive loss target clamps to 1.5 kg/wk cap', () => {
    // 110→62 in 4 days ≈ 84 kg/wk → cap 1.5 → -1650/day → 2800-1650=1150 < floor.
    const r = sizeKcalForPhase({ ...base, phase: 'CUT', currentKg: 110, targetKg: 62, daysRemaining: 4 });
    expect(r.rateCapped).toBe(true);
    expect(r.floored).toBe(true);
    expect(r.kcalTarget).toBe(FLOOR);
    const expectedCapDailyAbs = (MAX_LOSS_KG_PER_WEEK * KCAL_PER_KG) / 7;
    expect(Math.abs(r.dailyShift)).toBeCloseTo(Math.round(expectedCapDailyAbs), 0);
  });

  it('aggressive gain target clamps to 0.5 kg/wk cap', () => {
    // 70→90 in 4 weeks = 5 kg/wk → cap 0.5 → +550/day surplus.
    const r = sizeKcalForPhase({ ...base, phase: 'BULK', currentKg: 70, targetKg: 90, daysRemaining: 28 });
    expect(r.rateCapped).toBe(true);
    expect(r.dailyShift).toBe(Math.round((MAX_GAIN_KG_PER_WEEK * KCAL_PER_KG) / 7));
    expect(r.kcalTarget).toBeGreaterThan(2800);
  });

  it('REPRO — BULK with a BELOW-current target never flips to a deficit', () => {
    // masa + target 90 from 110 over 16wk → BULK forces SURPLUS, rate-capped.
    const r = sizeKcalForPhase({ maintenanceTdee: 2400, kcalFloor: FLOOR, phase: 'BULK', currentKg: 110, targetKg: 90, daysRemaining: 112 });
    expect(r.dailyShift).toBeGreaterThan(0);
    expect(r.kcalTarget).toBeGreaterThan(2400);
  });

  it('sustainable loss target uses the required rate (not capped)', () => {
    // 5 kg over 10 weeks = 0.5 kg/wk (== cap edge, not over) → -550/day.
    const r = sizeKcalForPhase({ ...base, phase: 'CUT', currentKg: 110, targetKg: 105, daysRemaining: 70 });
    expect(r.rateCapped).toBe(false);
    expect(r.kcalTarget).toBe(2800 - Math.round((5 / 10 * KCAL_PER_KG) / 7));
  });

  it('floor holds — never below the sex-aware floor', () => {
    const r = sizeKcalForPhase({ maintenanceTdee: 1500, kcalFloor: 1000, phase: 'CUT', currentKg: 60, targetKg: 50, daysRemaining: 7 });
    expect(r.kcalTarget).toBeGreaterThanOrEqual(1000);
  });
});
