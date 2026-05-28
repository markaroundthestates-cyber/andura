// ══ TARGET SAFETY TESTS — Smoke 2026-05-28 #16 ══════════════════════════════
// Daniel CEO smoke 2026-05-28: 110→62kg cu deadline 4 iunie 2026 (4 zile)
// acceptat tacit. Aceste teste asigura ca:
//  (a) ritmul cerut > 1.5kg/sapt = `unsafe` verdict cu deadline sugerat realist
//  (b) kcal-ul tinta e cap-uit la max 25% TDEE deficit / 15% TDEE surplus
//  (c) input-uri incomplete returneaza null fara crash

import { describe, it, expect } from 'vitest';
import {
  daysUntilTarget,
  evaluateTargetRate,
  computeTargetKcalOverride,
  MAX_SAFE_KG_PER_WEEK,
  MAX_DAILY_DEFICIT_TDEE_FRACTION,
  MAX_DAILY_SURPLUS_TDEE_FRACTION,
  KCAL_PER_KG_BODYFAT,
} from '../../lib/targetSafety';

describe('daysUntilTarget', () => {
  it('YYYY-MM-DD direct', () => {
    const now = new Date('2026-05-28T12:00:00Z');
    expect(daysUntilTarget('2026-06-04', now)).toBe(7);
  });

  it('YYYY-MM treats as last day of month', () => {
    const now = new Date('2026-05-28T12:00:00Z');
    // mai 2026 has 31 zile → ultima zi 2026-05-31, 3 zile diferenta
    expect(daysUntilTarget('2026-05', now)).toBe(3);
  });

  it('null pentru data invalida', () => {
    const now = new Date('2026-05-28T12:00:00Z');
    expect(daysUntilTarget('garbage', now)).toBe(null);
    expect(daysUntilTarget('', now)).toBe(null);
  });

  it('zile negative pentru data trecuta', () => {
    const now = new Date('2026-05-28T12:00:00Z');
    expect(daysUntilTarget('2026-05-01', now)).toBeLessThan(0);
  });
});

describe('evaluateTargetRate — verdict siguranta', () => {
  const now = new Date('2026-05-28T12:00:00Z');

  it('Daniel smoke 110→62kg in 4 zile → unsafe + deadline realist sugerat', () => {
    const r = evaluateTargetRate(110, 62, '2026-06-01', now);
    expect(r?.kind).toBe('unsafe');
    if (r?.kind === 'unsafe') {
      // 48kg / (4/7) sapt = 84 kg/sapt (extrem)
      expect(r.requiredKgPerWeek).toBeGreaterThan(MAX_SAFE_KG_PER_WEEK);
      // 48kg / 1.5 = 32 sapt = ~224 zile → ~7-8 luni
      expect(r.safeDeadlineDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(r.direction).toBe('loss');
      // Verificam ca deadline-ul sugerat e mult mai departe
      const safeMs = new Date(r.safeDeadlineDate).getTime();
      const nowMs = now.getTime();
      const safeDays = (safeMs - nowMs) / (24 * 60 * 60 * 1000);
      expect(safeDays).toBeGreaterThan(200);
    }
  });

  it('ritm sustenabil 0.5kg/sapt → safe', () => {
    // 110 → 100kg cu 20 saptamani = 0.5 kg/sapt (sustenabil)
    const deadline = new Date(now.getTime() + 20 * 7 * 24 * 60 * 60 * 1000);
    const dateIso = deadline.toISOString().slice(0, 10);
    const r = evaluateTargetRate(110, 100, dateIso, now);
    expect(r?.kind).toBe('safe');
  });

  it('castig 0.25kg/sapt → safe (lean gain)', () => {
    const deadline = new Date(now.getTime() + 16 * 7 * 24 * 60 * 60 * 1000);
    const dateIso = deadline.toISOString().slice(0, 10);
    const r = evaluateTargetRate(70, 74, dateIso, now);
    expect(r?.kind).toBe('safe');
    expect(r?.kind === 'safe' && r.direction).toBe('gain');
  });

  it('castig 5kg in 2 sapt = 2.5kg/sapt → unsafe', () => {
    const deadline = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const dateIso = deadline.toISOString().slice(0, 10);
    const r = evaluateTargetRate(70, 75, dateIso, now);
    expect(r?.kind).toBe('unsafe');
    expect(r?.kind === 'unsafe' && r.direction).toBe('gain');
  });

  it('deja la tinta (delta < 0.5kg) → reached', () => {
    const r = evaluateTargetRate(70, 70.2, '2026-12-01', now);
    expect(r?.kind).toBe('reached');
  });

  it('input incomplete → null', () => {
    expect(evaluateTargetRate(null, 62, '2026-06-04', now)).toBe(null);
    expect(evaluateTargetRate(110, null, '2026-06-04', now)).toBe(null);
    expect(evaluateTargetRate(110, 62, null, now)).toBe(null);
    expect(evaluateTargetRate(110, 62, '', now)).toBe(null);
  });

  it('deadline trecut → null (nu putem proiecta in trecut)', () => {
    const r = evaluateTargetRate(110, 100, '2026-01-01', now);
    expect(r).toBe(null);
  });
});

describe('computeTargetKcalOverride — cuplare tinta ↔ kcal', () => {
  const now = new Date('2026-05-28T12:00:00Z');

  it('Daniel smoke 110→62kg in 4 zile + TDEE 2800 → cap la 25% deficit', () => {
    const r = computeTargetKcalOverride(110, 62, '2026-06-01', 2800, now);
    expect(r).not.toBeNull();
    if (r) {
      // 48kg × 7700 / 4 zile = 92,400 kcal/zi (absurd)
      // cap la -25% × 2800 = -700 kcal/zi
      expect(r.capped).toBe(true);
      expect(r.dailyShift).toBeCloseTo(-700, 0);
      expect(r.kcalTarget).toBeCloseTo(2100, 0); // 2800 - 700
      expect(r.direction).toBe('loss');
    }
  });

  it('ritm sustenabil → NU se aplica cap-ul', () => {
    // 110 → 105kg in 10 sapt (0.5kg/sapt) cu TDEE 2800
    const deadline = new Date(now.getTime() + 10 * 7 * 24 * 60 * 60 * 1000);
    const dateIso = deadline.toISOString().slice(0, 10);
    const r = computeTargetKcalOverride(110, 105, dateIso, 2800, now);
    expect(r).not.toBeNull();
    if (r) {
      // 5kg × 7700 / 70 zile = 550 kcal/zi deficit
      expect(r.capped).toBe(false);
      expect(r.dailyShift).toBeCloseTo(-550, 0);
      expect(r.kcalTarget).toBeCloseTo(2250, 0);
    }
  });

  it('cap-ul surplus = 15% TDEE (asimetric vs deficit 25%)', () => {
    // 70 → 80kg in 4 zile (absurd surplus) cu TDEE 2400
    const r = computeTargetKcalOverride(70, 80, '2026-06-01', 2400, now);
    expect(r?.capped).toBe(true);
    if (r) {
      // cap la +15% × 2400 = +360 kcal/zi
      expect(r.dailyShift).toBeCloseTo(360, 0);
      expect(r.kcalTarget).toBeCloseTo(2760, 0);
      expect(r.direction).toBe('gain');
    }
  });

  it('deja la tinta → kcalTarget = TDEE (maintain)', () => {
    const r = computeTargetKcalOverride(70, 70, '2026-12-01', 2400, now);
    expect(r?.direction).toBe('maintain');
    expect(r?.dailyShift).toBe(0);
    expect(r?.kcalTarget).toBe(2400);
  });

  it('input incomplete → null', () => {
    expect(computeTargetKcalOverride(null, 62, '2026-06-04', 2800, now)).toBe(null);
    expect(computeTargetKcalOverride(110, null, '2026-06-04', 2800, now)).toBe(null);
    expect(computeTargetKcalOverride(110, 62, null, 2800, now)).toBe(null);
    expect(computeTargetKcalOverride(110, 62, '2026-06-04', null, now)).toBe(null);
    expect(computeTargetKcalOverride(110, 62, '2026-06-04', 0, now)).toBe(null);
  });

  it('constantele expuse pentru transparenta', () => {
    expect(MAX_SAFE_KG_PER_WEEK).toBe(1.5);
    expect(MAX_DAILY_DEFICIT_TDEE_FRACTION).toBe(0.25);
    expect(MAX_DAILY_SURPLUS_TDEE_FRACTION).toBe(0.15);
    expect(KCAL_PER_KG_BODYFAT).toBe(7700);
  });

  it('deadline trecut → null', () => {
    expect(computeTargetKcalOverride(110, 100, '2026-01-01', 2800, now)).toBe(null);
  });

  it('pur — same input same output', () => {
    const a = computeTargetKcalOverride(110, 95, '2026-08-01', 2800, now);
    const b = computeTargetKcalOverride(110, 95, '2026-08-01', 2800, now);
    expect(a).toEqual(b);
  });
});
