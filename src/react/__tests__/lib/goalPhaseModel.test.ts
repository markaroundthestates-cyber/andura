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
  CUT_DEFICIT_FRACTION_DEFAULT,
  CUT_DEFICIT_FRACTION_MAX,
  BULK_SURPLUS_FRACTION_DEFAULT,
  STRENGTH_SURPLUS_FRACTION,
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

describe('sizeKcalForPhase — %-of-TDEE adaptive, sign forced by phase', () => {
  const FLOOR = 1200;
  const base = { maintenanceTdee: 2800, kcalFloor: FLOOR };

  it('MAINTENANCE → maintenance (no shift)', () => {
    const r = sizeKcalForPhase({ ...base, phase: 'MAINTENANCE', currentKg: 100, targetKg: 100, daysRemaining: 90 });
    expect(r.kcalTarget).toBe(2800);
    expect(r.dailyShift).toBe(0);
  });

  it('STRENGTH → slight surplus (+5%)', () => {
    const r = sizeKcalForPhase({ ...base, phase: 'STRENGTH', currentKg: 100, targetKg: null, daysRemaining: null });
    expect(r.kcalTarget).toBe(Math.round(2800 * (1 + STRENGTH_SURPLUS_FRACTION)));
  });

  it('CUT no target → default 20% of TDEE deficit', () => {
    const r = sizeKcalForPhase({ ...base, phase: 'CUT', currentKg: null, targetKg: null, daysRemaining: null });
    expect(r.kcalTarget).toBe(Math.round(2800 * (1 - CUT_DEFICIT_FRACTION_DEFAULT)));
    expect(r.rateCapped).toBe(false);
  });

  it('BULK no target → default 12% of TDEE surplus', () => {
    const r = sizeKcalForPhase({ ...base, phase: 'BULK', currentKg: null, targetKg: null, daysRemaining: null });
    expect(r.kcalTarget).toBe(Math.round(2800 * (1 + BULK_SURPLUS_FRACTION_DEFAULT)));
  });

  // ── Daniel worked checks 2026-05-30 (the bug + the new contract) ────────────
  it('WORKED — 110kg male, TDEE ~2500, LOSE, no date → ~2000 (NOT 1200)', () => {
    // 20% of 2500 = 500 deficit → 2000. The whole point: never floored here.
    const r = sizeKcalForPhase({ maintenanceTdee: 2500, kcalFloor: FLOOR, phase: 'CUT', currentKg: 110, targetKg: 90, daysRemaining: null });
    expect(r.kcalTarget).toBe(2000);
    expect(r.dailyShift).toBe(-500);
    expect(r.floored).toBe(false);
  });

  it('WORKED — small user TDEE 1500, LOSE, no date → 1200 (at floor, ok)', () => {
    // 20% of 1500 = 300 → 1200 == floor.
    const r = sizeKcalForPhase({ maintenanceTdee: 1500, kcalFloor: FLOOR, phase: 'CUT', currentKg: 60, targetKg: 50, daysRemaining: null });
    expect(r.kcalTarget).toBe(1200);
    expect(r.dailyShift).toBe(-300);
    // 1500-300 = 1200 == floor exactly: lands ON the floor, not clamped below it.
  });

  it('WORKED — BULK 110kg, TDEE 2500, no date → 12% surplus → ~2800', () => {
    const r = sizeKcalForPhase({ maintenanceTdee: 2500, kcalFloor: FLOOR, phase: 'BULK', currentKg: 110, targetKg: 120, daysRemaining: null });
    expect(r.kcalTarget).toBe(Math.round(2500 * 1.12)); // 2800
    expect(r.dailyShift).toBe(300);
  });

  it('aggressive loss date clamps to the 25% / 1.5kg-week caps', () => {
    // 110→62 in 4 days → required ~92,000/day → clamped to min(25%TDEE, 1.5kg/wk).
    const r = sizeKcalForPhase({ ...base, phase: 'CUT', currentKg: 110, targetKg: 62, daysRemaining: 4 });
    expect(r.rateCapped).toBe(true);
    // Binding cap = min(2800*0.25=700, 1.5*7700/7=1650) = 700 (% binds here).
    expect(Math.abs(r.dailyShift)).toBe(Math.round(2800 * CUT_DEFICIT_FRACTION_MAX));
    expect(r.kcalTarget).toBe(2800 - Math.round(2800 * CUT_DEFICIT_FRACTION_MAX));
  });

  it('kg/week cap binds for a very-high-TDEE user (absolute-rate guard)', () => {
    // TDEE 8000: 25% = 2000/day, but 1.5kg/wk = 1650/day → kg/week cap binds.
    const r = sizeKcalForPhase({ maintenanceTdee: 8000, kcalFloor: FLOOR, phase: 'CUT', currentKg: 200, targetKg: 100, daysRemaining: 7 });
    expect(r.rateCapped).toBe(true);
    expect(Math.abs(r.dailyShift)).toBe(Math.round((MAX_LOSS_KG_PER_WEEK * KCAL_PER_KG) / 7));
  });

  it('aggressive gain date clamps (15% / 0.5kg-week caps)', () => {
    // 70→90 in 4 weeks = 5 kg/wk → cap. min(2800*0.15=420, 0.5kg/wk=550)=420.
    const r = sizeKcalForPhase({ ...base, phase: 'BULK', currentKg: 70, targetKg: 90, daysRemaining: 28 });
    expect(r.rateCapped).toBe(true);
    expect(r.dailyShift).toBe(Math.round(2800 * 0.15));
    expect(r.kcalTarget).toBeGreaterThan(2800);
  });

  it('REPRO — BULK with a BELOW-current target never flips to a deficit', () => {
    // masa + target 90 from 110 over 16wk → BULK forces SURPLUS (default %).
    const r = sizeKcalForPhase({ maintenanceTdee: 2400, kcalFloor: FLOOR, phase: 'BULK', currentKg: 110, targetKg: 90, daysRemaining: 112 });
    expect(r.dailyShift).toBeGreaterThan(0);
    expect(r.kcalTarget).toBeGreaterThan(2400);
  });

  it('gentle loss date under both caps uses the date-required rate', () => {
    // 5 kg over 10 weeks → required ≈ 550/day < min(25%*2800=700, 1650) → not capped.
    const r = sizeKcalForPhase({ ...base, phase: 'CUT', currentKg: 110, targetKg: 105, daysRemaining: 70 });
    expect(r.rateCapped).toBe(false);
    expect(r.kcalTarget).toBe(2800 - Math.round((5 * KCAL_PER_KG) / 70));
  });

  it('floor holds — never below the sex-aware floor', () => {
    const r = sizeKcalForPhase({ maintenanceTdee: 1500, kcalFloor: 1000, phase: 'CUT', currentKg: 60, targetKg: 50, daysRemaining: 7 });
    expect(r.kcalTarget).toBeGreaterThanOrEqual(1000);
  });
});
