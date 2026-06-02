// ══ GOAL FORECAST — pure-math tests (weight ETA + strength trajectory) ════════
//
// Honest, hedged forecasts. Weight ETA computes a plausible DATE for a real
// downtrend, and refuses a fake date for a flat / wrong-direction / too-slow
// pace ("not on track"). Strength trajectory projects a near-term 1RM ONLY for
// lifts with enough recent history, never on 1-2 points, never on a flat/decline.
// Determinism: now injected, same inputs → same output.

import { describe, it, expect } from 'vitest';
import {
  projectWeightEta,
  projectLiftStrength,
  STRENGTH_MIN_SESSIONS,
  STRENGTH_FORECAST_WEEKS,
  MAX_ETA_DAYS,
} from '../../lib/goalForecast';
import { KCAL_PER_KG } from '../../lib/nutritionProjection';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 5, 2); // 2026-06-02

describe('goalForecast — projectWeightEta (date-anchored weight ETA)', () => {
  it('real downtrend toward a lower goal → a plausible future date', () => {
    // Goal 70 from 80 (need -10kg). ~500 kcal/day deficit → ~0.065 kg/day →
    // ~154 days. ETA must be a future date, correct-direction.
    const r = projectWeightEta({
      currentWeightKg: 80,
      goalWeightKg: 70,
      avgIntakeKcal: 2000,
      tdeeEstimateKcal: 2500,
      nowMs: NOW,
    });
    expect(r?.kind).toBe('eta');
    if (r?.kind !== 'eta') throw new Error('expected eta');
    expect(r.etaMs).toBeGreaterThan(NOW);
    expect(r.direction).toBe('loss');
    expect(r.goalKg).toBe(70);
    // Sanity: ~10kg / (500/7700 kg/day) ≈ 154 days.
    const expectedDays = Math.ceil(10 / (500 / KCAL_PER_KG));
    expect(r.days).toBe(expectedDays);
  });

  it('flat trend (balance below the maintenance band) → off-track, not a fake date', () => {
    const r = projectWeightEta({
      currentWeightKg: 80,
      goalWeightKg: 70,
      avgIntakeKcal: 2480, // only -20 vs TDEE → flat
      tdeeEstimateKcal: 2500,
      nowMs: NOW,
    });
    expect(r?.kind).toBe('off-track');
  });

  it('wrong direction (gaining while goal is lower) → off-track honestly', () => {
    const r = projectWeightEta({
      currentWeightKg: 80,
      goalWeightKg: 70, // wants to lose
      avgIntakeKcal: 3000, // but eating in a surplus → gaining
      tdeeEstimateKcal: 2500,
      nowMs: NOW,
    });
    expect(r?.kind).toBe('off-track');
  });

  it('correct direction but absurdly slow pace → off-track (no decades-out date)', () => {
    // Goal far (lose 20kg) at a tiny ~80 kcal/day deficit → > MAX_ETA_DAYS.
    const r = projectWeightEta({
      currentWeightKg: 100,
      goalWeightKg: 80,
      avgIntakeKcal: 2420,
      tdeeEstimateKcal: 2500,
      nowMs: NOW,
    });
    // 20kg / (80/7700) ≈ 1925 days > MAX_ETA_DAYS → off-track.
    expect(r?.kind).toBe('off-track');
    expect(20 / (80 / KCAL_PER_KG)).toBeGreaterThan(MAX_ETA_DAYS);
  });

  it('already at goal (within band) → reached', () => {
    const r = projectWeightEta({
      currentWeightKg: 70.2,
      goalWeightKg: 70,
      avgIntakeKcal: 2000,
      tdeeEstimateKcal: 2500,
      nowMs: NOW,
    });
    expect(r?.kind).toBe('reached');
  });

  it('missing inputs → null (no projection)', () => {
    expect(projectWeightEta({ currentWeightKg: null, goalWeightKg: 70, avgIntakeKcal: 2000, tdeeEstimateKcal: 2500, nowMs: NOW })).toBeNull();
    expect(projectWeightEta({ currentWeightKg: 80, goalWeightKg: null, avgIntakeKcal: 2000, tdeeEstimateKcal: 2500, nowMs: NOW })).toBeNull();
    expect(projectWeightEta({ currentWeightKg: 80, goalWeightKg: 70, avgIntakeKcal: null, tdeeEstimateKcal: 2500, nowMs: NOW })).toBeNull();
    expect(projectWeightEta({ currentWeightKg: 80, goalWeightKg: 70, avgIntakeKcal: 2000, tdeeEstimateKcal: null, nowMs: NOW })).toBeNull();
  });

  it('deterministic — same inputs + injected now → same result', () => {
    const input = { currentWeightKg: 80, goalWeightKg: 70, avgIntakeKcal: 2000, tdeeEstimateKcal: 2500, nowMs: NOW };
    expect(projectWeightEta(input)).toEqual(projectWeightEta(input));
  });
});

describe('goalForecast — projectLiftStrength (strength trajectory)', () => {
  // Rising bench over 4 distinct weekly sessions (1RM ~100 → ~106).
  function risingSamples() {
    return [
      { ts: NOW - 21 * DAY_MS, oneRm: 100 },
      { ts: NOW - 14 * DAY_MS, oneRm: 102 },
      { ts: NOW - 7 * DAY_MS, oneRm: 104 },
      { ts: NOW, oneRm: 106 },
    ];
  }

  it('rising lift with enough history → a conservative forward 1RM', () => {
    const f = projectLiftStrength({ name: 'Bench Press', samples: risingSamples() });
    expect(f).not.toBeNull();
    expect(f?.name).toBe('Bench Press');
    expect(f?.weeks).toBe(STRENGTH_FORECAST_WEEKS);
    // Projection is ABOVE the current best (rising) but conservative (capped).
    expect(f!.projectedOneRm).toBeGreaterThan(f!.currentOneRm);
    expect(f!.projectedOneRm).toBeLessThanOrEqual(f!.currentOneRm * 1.08 + 0.05);
  });

  it('too few sessions (below the gate) → null (no fabrication)', () => {
    const samples = risingSamples().slice(0, STRENGTH_MIN_SESSIONS - 1);
    expect(projectLiftStrength({ name: 'Bench Press', samples })).toBeNull();
  });

  it('single data point → null', () => {
    expect(projectLiftStrength({ name: 'Squat', samples: [{ ts: NOW, oneRm: 120 }] })).toBeNull();
  });

  it('flat trend (no progression) → null (no promised gains)', () => {
    const flat = [
      { ts: NOW - 21 * DAY_MS, oneRm: 100 },
      { ts: NOW - 14 * DAY_MS, oneRm: 100 },
      { ts: NOW - 7 * DAY_MS, oneRm: 100 },
      { ts: NOW, oneRm: 100 },
    ];
    expect(projectLiftStrength({ name: 'Bench Press', samples: flat })).toBeNull();
  });

  it('declining trend → null', () => {
    const down = [
      { ts: NOW - 21 * DAY_MS, oneRm: 106 },
      { ts: NOW - 14 * DAY_MS, oneRm: 104 },
      { ts: NOW - 7 * DAY_MS, oneRm: 102 },
      { ts: NOW, oneRm: 100 },
    ];
    expect(projectLiftStrength({ name: 'Bench Press', samples: down })).toBeNull();
  });

  it('caps an aggressive hot streak at the conservative gain ceiling', () => {
    // Steep rise (+5/wk) over 4 sessions → uncapped 4-wk extrapolation would add
    // ~20kg; the 8% cap keeps it sane.
    const steep = [
      { ts: NOW - 21 * DAY_MS, oneRm: 100 },
      { ts: NOW - 14 * DAY_MS, oneRm: 105 },
      { ts: NOW - 7 * DAY_MS, oneRm: 110 },
      { ts: NOW, oneRm: 115 },
    ];
    const f = projectLiftStrength({ name: 'Bench Press', samples: steep });
    expect(f).not.toBeNull();
    // currentOneRm = 115 best; gain capped at 8% → <= 124.2.
    expect(f!.projectedOneRm).toBeLessThanOrEqual(115 * 1.08 + 0.05);
  });

  it('deterministic — same samples → same forecast', () => {
    const a = projectLiftStrength({ name: 'Bench Press', samples: risingSamples() });
    const b = projectLiftStrength({ name: 'Bench Press', samples: risingSamples() });
    expect(a).toEqual(b);
  });
});
