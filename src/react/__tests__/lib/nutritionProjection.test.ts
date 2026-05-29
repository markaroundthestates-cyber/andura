// Piesa 4 nutrition-brain fix — "Preconizare" forward projection tests.
//
// Proves: (1) deficit → loss; (2) surplus → gain; (3) maintenance → flat;
// (4) bf% recompute din split FM:LBM; (5) no-data guard returns null;
// (6) avgRecentLoggedIntake window + injectable now.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  projectTrajectory,
  avgRecentLoggedIntake,
  deriveCurrentBfPct,
  KCAL_PER_KG,
  FM_RATIO_LOSS,
  FM_RATIO_GAIN,
  MAINTENANCE_BALANCE_KCAL,
  MAX_ABS_DELTA_KG,
} from '../../lib/nutritionProjection';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';
import { estimateBF_USNavy } from '../../../engine/usNavyBF.js';
import { estimateBF_skinfold3 } from '../../../engine/skinfoldBF.js';
import { estimateBF_Deurenberg } from '../../../engine/bodyComposition.js';

describe('projectTrajectory — deficit → loss', () => {
  it('eats 2000, TDEE 2500 → -500/day → ~-1.8kg in 28d', () => {
    const r = projectTrajectory({
      tdeeEstimateKcal: 2500,
      avgIntakeKcal: 2000,
      currentWeightKg: 80,
      currentBfPct: null,
      horizonDays: 28,
    });
    expect(r).not.toBeNull();
    // delta = (-500 * 28) / 7700 = -1.818... → round1 -1.8
    const expected = Math.round(((-500 * 28) / KCAL_PER_KG) * 10) / 10;
    expect(r!.deltaWeightKg).toBe(expected);
    expect(r!.deltaWeightKg).toBe(-1.8);
    expect(r!.projectedWeightKg).toBe(Math.round((80 + expected) * 10) / 10);
    expect(r!.direction).toBe('loss');
    expect(r!.horizonDays).toBe(28);
    expect(r!.projectedBfPct).toBeNull();
  });
});

describe('projectTrajectory — surplus → gain', () => {
  it('eats 3000, TDEE 2500 → +500/day → ~+1.8kg in 28d', () => {
    const r = projectTrajectory({
      tdeeEstimateKcal: 2500,
      avgIntakeKcal: 3000,
      currentWeightKg: 80,
      currentBfPct: null,
      horizonDays: 28,
    });
    expect(r).not.toBeNull();
    expect(r!.deltaWeightKg).toBe(1.8);
    expect(r!.direction).toBe('gain');
  });
});

describe('projectTrajectory — maintenance → flat', () => {
  it('balance under floor → maintain, delta 0, weight unchanged', () => {
    const r = projectTrajectory({
      tdeeEstimateKcal: 2500,
      avgIntakeKcal: 2500 + (MAINTENANCE_BALANCE_KCAL - 10),
      currentWeightKg: 80,
      currentBfPct: 20,
      horizonDays: 28,
    });
    expect(r).not.toBeNull();
    expect(r!.direction).toBe('maintain');
    expect(r!.deltaWeightKg).toBe(0);
    expect(r!.projectedWeightKg).toBe(80);
    expect(r!.projectedBfPct).toBe(20); // unchanged
  });

  it('exactly at floor boundary counts as projecting (not maintain)', () => {
    const r = projectTrajectory({
      tdeeEstimateKcal: 2500,
      avgIntakeKcal: 2500 - MAINTENANCE_BALANCE_KCAL,
      currentWeightKg: 80,
      currentBfPct: null,
      horizonDays: 28,
    });
    expect(r!.direction).toBe('loss');
  });
});

describe('projectTrajectory — bf% recompute (FM:LBM split)', () => {
  it('loss: 0.75 of delta is fat mass, LBM preserved', () => {
    // 80kg @ 20% bf → FM 16kg, LBM 64kg. delta -1.8kg.
    const r = projectTrajectory({
      tdeeEstimateKcal: 2500,
      avgIntakeKcal: 2000,
      currentWeightKg: 80,
      currentBfPct: 20,
      horizonDays: 28,
    });
    const delta = r!.deltaWeightKg; // -1.8
    const fmNew = 80 * 0.2 + FM_RATIO_LOSS * delta;
    const wNew = 80 + delta;
    const expectedBf = Math.round((fmNew / wNew) * 100 * 10) / 10;
    expect(r!.projectedBfPct).toBe(expectedBf);
    // bf% should drop on a cut
    expect(r!.projectedBfPct!).toBeLessThan(20);
  });

  it('gain: 0.60 of delta is fat mass', () => {
    const r = projectTrajectory({
      tdeeEstimateKcal: 2500,
      avgIntakeKcal: 3000,
      currentWeightKg: 80,
      currentBfPct: 20,
      horizonDays: 28,
    });
    const delta = r!.deltaWeightKg; // +1.8
    const fmNew = 80 * 0.2 + FM_RATIO_GAIN * delta;
    const wNew = 80 + delta;
    const expectedBf = Math.round((fmNew / wNew) * 100 * 10) / 10;
    expect(r!.projectedBfPct).toBe(expectedBf);
    // bf% rises on a bulk but slower than weight (LBM partial gain)
    expect(r!.projectedBfPct!).toBeGreaterThan(20);
  });

  it('omits bf when currentBfPct null', () => {
    const r = projectTrajectory({
      tdeeEstimateKcal: 2500,
      avgIntakeKcal: 2000,
      currentWeightKg: 80,
      currentBfPct: null,
      horizonDays: 28,
    });
    expect(r!.projectedBfPct).toBeNull();
  });
});

describe('projectTrajectory — no-data guards', () => {
  it('null TDEE → null', () => {
    expect(
      projectTrajectory({
        tdeeEstimateKcal: null,
        avgIntakeKcal: 2000,
        currentWeightKg: 80,
        currentBfPct: null,
        horizonDays: 28,
      }),
    ).toBeNull();
  });

  it('null intake → null', () => {
    expect(
      projectTrajectory({
        tdeeEstimateKcal: 2500,
        avgIntakeKcal: null,
        currentWeightKg: 80,
        currentBfPct: null,
        horizonDays: 28,
      }),
    ).toBeNull();
  });

  it('null/zero weight → null', () => {
    expect(
      projectTrajectory({
        tdeeEstimateKcal: 2500,
        avgIntakeKcal: 2000,
        currentWeightKg: null,
        currentBfPct: null,
        horizonDays: 28,
      }),
    ).toBeNull();
    expect(
      projectTrajectory({
        tdeeEstimateKcal: 2500,
        avgIntakeKcal: 2000,
        currentWeightKg: 0,
        currentBfPct: null,
        horizonDays: 28,
      }),
    ).toBeNull();
  });

  it('non-positive horizon → null', () => {
    expect(
      projectTrajectory({
        tdeeEstimateKcal: 2500,
        avgIntakeKcal: 2000,
        currentWeightKg: 80,
        currentBfPct: null,
        horizonDays: 0,
      }),
    ).toBeNull();
  });
});

describe('projectTrajectory — absurd delta clamp', () => {
  it('insane deficit clamped to MAX_ABS_DELTA_KG', () => {
    const r = projectTrajectory({
      tdeeEstimateKcal: 6000,
      avgIntakeKcal: 0,
      currentWeightKg: 100,
      currentBfPct: null,
      horizonDays: 28,
    });
    // raw delta = (-6000*28)/7700 ≈ -21.8 → clamp -8
    expect(r!.deltaWeightKg).toBe(-MAX_ABS_DELTA_KG);
    expect(r!.projectedWeightKg).toBe(92);
  });
});

describe('deriveCurrentBfPct — two-tier (US-Navy / Deurenberg / null)', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
    useProgresStore.getState().reset();
  });

  it('cold start (no onboarding stats) → null', () => {
    expect(deriveCurrentBfPct()).toBeNull();
  });

  it('onboarding stats only (no measurements) → Deurenberg estimate', () => {
    const { setField } = useOnboardingStore.getState();
    setField('sex', 'm');
    setField('weight', 80);
    setField('height', 180);
    setField('age', 30);
    const bf = deriveCurrentBfPct();
    expect(bf).not.toBeNull();
    expect(bf).toBe(estimateBF_Deurenberg({ sex: 'm', weightKg: 80, heightCm: 180, ageYears: 30 }));
    // Deurenberg worked example ≈ 20.3
    expect(bf).toBeCloseTo(20.3, 1);
  });

  it('neck + waist measured → US-Navy (accurate tier, overrides Deurenberg)', () => {
    const { setField } = useOnboardingStore.getState();
    setField('sex', 'm');
    setField('weight', 80);
    setField('height', 180);
    setField('age', 30);
    useProgresStore.getState().addBodyDataEntry({ date: '2026-05-26', neckCm: 38, waistCm: 85 });
    const bf = deriveCurrentBfPct();
    const navy = estimateBF_USNavy({ sex: 'm', height_cm: 180, neck_cm: 38, waist_cm: 85 });
    expect(bf).toBe(navy);
    // US-Navy differs from Deurenberg → confirms tier selection chose the measured one.
    expect(bf).not.toBe(estimateBF_Deurenberg({ sex: 'm', weightKg: 80, heightCm: 180, ageYears: 30 }));
  });

  it('waist measured but neck missing → falls back to Deurenberg (US-Navy needs both)', () => {
    const { setField } = useOnboardingStore.getState();
    setField('sex', 'm');
    setField('weight', 80);
    setField('height', 180);
    setField('age', 30);
    useProgresStore.getState().addBodyDataEntry({ date: '2026-05-26', waistCm: 85 });
    const bf = deriveCurrentBfPct();
    expect(bf).toBe(estimateBF_Deurenberg({ sex: 'm', weightKg: 80, heightCm: 180, ageYears: 30 }));
  });

  // §progress-v2 — skinfold J-P (most accurate) overrides US-Navy.
  it('skinfold sites present → J-P tier (overrides US-Navy)', () => {
    const { setField } = useOnboardingStore.getState();
    setField('sex', 'm');
    setField('weight', 80);
    setField('height', 180);
    setField('age', 30);
    useProgresStore.getState().addBodyDataEntry({
      date: '2026-05-26',
      neckCm: 38,
      waistCm: 85, // US-Navy complete too
      chestSkinfoldMm: 12,
      abdomenSkinfoldMm: 20,
      thighSkinfoldMm: 14,
    });
    const bf = deriveCurrentBfPct();
    const jp = estimateBF_skinfold3({ sex: 'm', age: 30, chest_mm: 12, abdomen_mm: 20, thigh_mm: 14 });
    expect(bf).toBe(jp);
    // J-P differs from US-Navy → confirms skinfold tier chosen over Navy.
    expect(bf).not.toBe(estimateBF_USNavy({ sex: 'm', height_cm: 180, neck_cm: 38, waist_cm: 85 }));
  });
});

describe('neck persistence round-trip (progresStore.bodyData)', () => {
  beforeEach(() => useProgresStore.getState().reset());

  it('addBodyDataEntry persists neckCm + reads back', () => {
    useProgresStore.getState().addBodyDataEntry({ date: '2026-05-26', neckCm: 39, waistCm: 90 });
    const last = useProgresStore.getState().bodyData.at(-1);
    expect(last?.neckCm).toBe(39);
    expect(last?.waistCm).toBe(90);
  });
});

describe('avgRecentLoggedIntake — recent window + injectable now', () => {
  const nowMs = Date.UTC(2026, 4, 26); // 2026-05-26

  it('averages only logged kcal within window', () => {
    const log = [
      { dateISO: '2026-05-20', kcal: 2000 },
      { dateISO: '2026-05-24', kcal: 2400 },
      { dateISO: '2026-05-25', kcal: null }, // not logged → skip
    ];
    expect(avgRecentLoggedIntake(log, nowMs)).toBe(2200);
  });

  it('excludes days older than window', () => {
    const log = [
      { dateISO: '2026-04-01', kcal: 9000 }, // > 14d ago → excluded
      { dateISO: '2026-05-25', kcal: 2000 },
    ];
    expect(avgRecentLoggedIntake(log, nowMs)).toBe(2000);
  });

  it('returns null when no logged days in window', () => {
    expect(avgRecentLoggedIntake([], nowMs)).toBeNull();
    expect(
      avgRecentLoggedIntake([{ dateISO: '2026-05-25', kcal: null }], nowMs),
    ).toBeNull();
  });
});
