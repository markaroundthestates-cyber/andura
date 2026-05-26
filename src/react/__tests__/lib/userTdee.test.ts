// Piesa 1 nutrition-brain fix — per-user maintenance TDEE base tests.
//
// Proves the nutrition base is REAL per-user TDEE (omoara baza flat 2640):
// Maria 40kg mentenanta primeste mult mai putin decat Marius 110kg/2m bulk,
// si NICIUNUL nu primeste 2640. Acopera userTdee pure helpers + integrarea
// in engineWrappers.getNutritionTargetsToday via onboardingStore + phase
// override.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../engine/bayesianNutrition/index.js', () => ({
  evaluate: vi.fn(),
  ENGINE_ID: 'bayesianNutrition',
}));

import {
  computeMifflinStJeorBMR,
  computeMaintenanceTDEE,
  computeProteinTargetG,
  ACTIVITY_FACTOR,
  PROTEIN_G_PER_KG_BODYWEIGHT,
} from '../../lib/userTdee';
import { getNutritionTargetsToday } from '../../lib/engineWrappers';
import { evaluate as evaluateBN } from '../../../engine/bayesianNutrition/index.js';
import { createMockBNResult } from '../../../test-utils/createMockContext';
import { useOnboardingStore } from '../../stores/onboardingStore';

// Maria: femeie 65 ani, 40kg, 155cm. Marius: barbat 30 ani, 110kg, 200cm.
const MARIA = { sex: 'f' as const, weightKg: 40, ageYears: 65, heightCm: 155 };
const MARIUS = { sex: 'm' as const, weightKg: 110, ageYears: 30, heightCm: 200 };

function setOnboarding(stats: { sex: 'm' | 'f'; weightKg: number; ageYears: number; heightCm: number }): void {
  const s = useOnboardingStore.getState();
  s.setField('sex', stats.sex);
  s.setField('weight', stats.weightKg);
  s.setField('age', stats.ageYears);
  s.setField('height', stats.heightCm);
}

beforeEach(() => {
  vi.clearAllMocks();
  useOnboardingStore.getState().reset();
  localStorage.clear();
});

afterEach(() => {
  useOnboardingStore.getState().reset();
  localStorage.clear();
});

describe('userTdee — pure helpers', () => {
  it('Mifflin-St Jeor BMR matches formula for female + male', () => {
    // F: 10·40 + 6.25·155 - 5·65 - 161 = 400 + 968.75 - 325 - 161 = 882.75 → 883
    expect(computeMifflinStJeorBMR(MARIA)).toBe(883);
    // M: 10·110 + 6.25·200 - 5·30 + 5 = 1100 + 1250 - 150 + 5 = 2205
    expect(computeMifflinStJeorBMR(MARIUS)).toBe(2205);
  });

  it('returns null cand inputs incomplete', () => {
    expect(computeMifflinStJeorBMR({ sex: null, weightKg: 40, ageYears: 65, heightCm: 155 })).toBeNull();
    expect(computeMifflinStJeorBMR({ sex: 'f', weightKg: null, ageYears: 65, heightCm: 155 })).toBeNull();
  });

  it('maintenance TDEE = BMR × activity factor', () => {
    expect(computeMaintenanceTDEE(MARIA)).toBe(Math.round(883 * ACTIVITY_FACTOR));
    expect(computeMaintenanceTDEE(MARIUS)).toBe(Math.round(2205 * ACTIVITY_FACTOR));
  });

  it('protein target = g/kg × bodyweight per-user', () => {
    expect(computeProteinTargetG(40)).toBe(Math.round(40 * PROTEIN_G_PER_KG_BODYWEIGHT));
    expect(computeProteinTargetG(110)).toBe(Math.round(110 * PROTEIN_G_PER_KG_BODYWEIGHT));
    expect(computeProteinTargetG(null)).toBeNull();
  });
});

describe('engineWrappers — per-user nutrition base (Piesa 1)', () => {
  it('tier none: light 40kg woman gets MUCH lower kcal than heavy 110kg man, NEITHER is 2640', async () => {
    // Maria mentenanta (no phase override = AUTO).
    setOnboarding(MARIA);
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const maria = await getNutritionTargetsToday({});

    useOnboardingStore.getState().reset();
    setOnboarding(MARIUS);
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const marius = await getNutritionTargetsToday({});

    expect(maria.kcalTarget).not.toBe(2640);
    expect(marius.kcalTarget).not.toBe(2640);
    expect(maria.kcalTarget).toBeLessThan(marius.kcalTarget);
    // Maria mentenanta ~ 883×1.55 ≈ 1369 (range 1300-1500 per spec).
    expect(maria.kcalTarget).toBeGreaterThanOrEqual(1300);
    expect(maria.kcalTarget).toBeLessThanOrEqual(1500);
    // Marius mentenanta ~ 2205×1.55 ≈ 3418.
    expect(marius.kcalTarget).toBeGreaterThan(3000);
    // Protein per-user, NOT flat 180.
    expect(maria.proteinTargetG).toBe(Math.round(40 * PROTEIN_G_PER_KG_BODYWEIGHT));
    expect(marius.proteinTargetG).toBe(Math.round(110 * PROTEIN_G_PER_KG_BODYWEIGHT));
    expect(maria.source).toBe('engine');
  });

  it('phase override BULK applies multiplier to REAL per-user TDEE (Marius bulk 3500-4000)', async () => {
    setOnboarding(MARIUS);
    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    // 2205 BMR × 1.55 = 3418 TDEE × 1.08 BULK ≈ 3691.
    expect(r.kcalTarget).toBeGreaterThanOrEqual(3500);
    expect(r.kcalTarget).toBeLessThanOrEqual(4000);
    expect(r.kcalTarget).not.toBe(2640);
  });

  it('phase override CUT reduces target below maintenance (per-user)', async () => {
    setOnboarding(MARIUS);
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const maintenance = await getNutritionTargetsToday({});

    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const cut = await getNutritionTargetsToday({});

    expect(cut.kcalTarget).toBeLessThan(maintenance.kcalTarget);
  });

  it('cold start (no onboarding stats) falls back to flat 2640 baseline', async () => {
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(2640);
    expect(r.proteinTargetG).toBe(180);
    expect(r.source).toBe('baseline');
  });

  it('engine posterior present: kcal from Kalman mu, protein still per-user', async () => {
    setOnboarding(MARIA);
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 1400 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(1400);
    expect(r.proteinTargetG).toBe(Math.round(40 * PROTEIN_G_PER_KG_BODYWEIGHT));
  });
});
