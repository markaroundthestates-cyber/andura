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
  countSessionsInWindow,
  NEAT_BASE,
  PER_SESSION_NET_KCAL,
  SESSIONS_WINDOW_DAYS,
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

  // Forward physical model (2026-05-27 redesign): TDEE = BMR × NEAT_BASE +
  // (sessionsThisWeek × PER_SESSION_NET_KCAL)/7. With 0 sessions → BMR×NEAT only.
  it('maintenance TDEE = forward model (NEAT base, 0 sessions)', () => {
    expect(computeMaintenanceTDEE(MARIA)).toBe(Math.round(883 * NEAT_BASE));
    expect(computeMaintenanceTDEE(MARIUS)).toBe(Math.round(2205 * NEAT_BASE));
  });

  it('maintenance TDEE RISES with more actual sessions this week (4 vs 6)', () => {
    const base = Math.round(2205 * NEAT_BASE);
    const four = computeMaintenanceTDEE({ ...MARIUS, sessionsThisWeek: 4 });
    const six = computeMaintenanceTDEE({ ...MARIUS, sessionsThisWeek: 6 });
    expect(four).toBe(Math.round(2205 * NEAT_BASE + (4 * PER_SESSION_NET_KCAL) / SESSIONS_WINDOW_DAYS));
    expect(six).toBe(Math.round(2205 * NEAT_BASE + (6 * PER_SESSION_NET_KCAL) / SESSIONS_WINDOW_DAYS));
    // The whole point of the redesign: 6 workouts > 4 workouts > sedentary base.
    expect((four as number)).toBeGreaterThan(base);
    expect((six as number)).toBeGreaterThan(four as number);
  });

  it('countSessionsInWindow counts only finishes within the last 7 days', () => {
    const now = Date.UTC(2026, 4, 27);
    const DAY = 24 * 60 * 60 * 1000;
    const sessions = [
      { ts: now - 1 * DAY }, // in window
      { ts: now - 3 * DAY }, // in window
      { ts: now - 6 * DAY }, // in window
      { ts: now - 9 * DAY }, // OUT of window (>7 days)
    ];
    expect(countSessionsInWindow(sessions, now)).toBe(3);
    expect(countSessionsInWindow([], now)).toBe(0);
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
    // Forward model, 0 sessions: Maria 883×1.25 ≈ 1104 → clamped to floor 1200.
    expect(maria.kcalTarget).toBe(1200);
    // Marius mentenanta ~ 2205×1.25 ≈ 2756 (NEAT base, 0 sessions this week).
    expect(marius.kcalTarget).toBe(Math.round(2205 * NEAT_BASE));
    // Protein per-user, NOT flat 180.
    expect(maria.proteinTargetG).toBe(Math.round(40 * PROTEIN_G_PER_KG_BODYWEIGHT));
    expect(marius.proteinTargetG).toBe(Math.round(110 * PROTEIN_G_PER_KG_BODYWEIGHT));
    expect(maria.source).toBe('engine');
  });

  it('phase override BULK applies multiplier to REAL per-user TDEE (forward model)', async () => {
    setOnboarding(MARIUS);
    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    // Forward model, 0 sessions: 2205 BMR × 1.25 NEAT = 2756 TDEE × 1.08 BULK ≈ 2976.
    // BULK is a surplus over the per-user maintenance, NOT the flat 2640.
    const maintenance = Math.round(2205 * NEAT_BASE);
    expect(r.kcalTarget).toBe(Math.round(maintenance * 1.08));
    expect(r.kcalTarget).toBeGreaterThan(maintenance);
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
