// Goal-driven nutrition kcal delta — onboarding goal produce deficit/surplus.
//
// Bug fix: un user care alege "slabire" (cut) la onboarding vedea mereu
// kcal-ul de mentenanta (~3191) fiindca pipeline-ul de nutritie NU citea
// goal-ul. Fix-ul: goal onboarding → multiplicator kcal (reuse
// PHASE_MULTIPLIERS) cand NU exista override manual de faza (SchimbaFaza).
//
// Precedence verificat aici: override manual faza > goal onboarding >
// mentenanta. Acopera atat path-ul tier 'none' (mentenanta per-user) cat si
// path-ul cu posterior.mu (TDEE adaptiv Kalman) — ambele primesc goal-delta.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../engine/bayesianNutrition/index.js', () => ({
  evaluate: vi.fn(),
  ENGINE_ID: 'bayesianNutrition',
}));

import { getNutritionTargetsToday } from '../../lib/engineWrappers';
import { evaluate as evaluateBN } from '../../../engine/bayesianNutrition/index.js';
import { createMockBNResult } from '../../../test-utils/createMockContext';
import { useOnboardingStore } from '../../stores/onboardingStore';
import type { Goal } from '../../stores/onboardingStore';

// User din bug report: barbat, 110kg, 184cm, 35 ani. Mentenanta TDEE ~3191.
const USER = { sex: 'm' as const, weight: 110, height: 184, age: 35 };

function setUser(goal: Goal | null): void {
  const s = useOnboardingStore.getState();
  s.setField('sex', USER.sex);
  s.setField('weight', USER.weight);
  s.setField('height', USER.height);
  s.setField('age', USER.age);
  if (goal !== null) s.setField('goal', goal);
}

// Maintenance TDEE pentru USER (Mifflin-St Jeor × 1.55):
// BMR = 10·110 + 6.25·184 - 5·35 + 5 = 1100 + 1150 - 175 + 5 = 2080
// TDEE = round(2080 × 1.55) = 3224.
const MAINTENANCE = 3224;

beforeEach(() => {
  vi.clearAllMocks();
  useOnboardingStore.getState().reset();
  localStorage.clear();
});

afterEach(() => {
  useOnboardingStore.getState().reset();
  localStorage.clear();
});

describe('engineWrappers — goal-driven kcal delta (tier none / per-user maintenance)', () => {
  it('goal "mentenanta" == maintenance TDEE (no delta)', async () => {
    setUser('mentenanta');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(MAINTENANCE);
  });

  it('goal "auto" == maintenance TDEE (no delta — engine auto-detect)', async () => {
    setUser('auto');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(MAINTENANCE);
  });

  it('goal "slabire" gives target meaningfully BELOW maintenance (~0.82x CUT)', async () => {
    setUser('slabire');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 0.82));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });

  it('goal "masa" gives target ABOVE maintenance (~1.08x BULK)', async () => {
    setUser('masa');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 1.08));
    expect(r.kcalTarget).toBeGreaterThan(MAINTENANCE);
  });

  it('goal "forta" gives slight surplus (~1.05x STRENGTH)', async () => {
    setUser('forta');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 1.05));
    expect(r.kcalTarget).toBeGreaterThan(MAINTENANCE);
  });

  it('goal "longevitate" == maintenance (no delta)', async () => {
    setUser('longevitate');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(MAINTENANCE);
  });
});

describe('engineWrappers — precedence: manual phase override > onboarding goal', () => {
  it('manual phase-override BULK still wins even cand goal = slabire (CUT)', async () => {
    setUser('slabire');
    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    // BULK 1.08 pe TDEE real — SURPLUS, NU deficit, desi goal e slabire.
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 1.08));
    expect(r.kcalTarget).toBeGreaterThan(MAINTENANCE);
  });

  it('manual phase-override CUT wins even cand goal = masa (BULK)', async () => {
    setUser('masa');
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 0.82));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });
});

describe('engineWrappers — goal-delta applies to adaptive Bayesian TDEE (posterior.mu)', () => {
  it('goal "slabire" applies CUT 0.82 to learning user posterior.mu', async () => {
    setUser('slabire');
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(3000 * 0.82));
    expect(r.source).toBe('engine');
  });

  it('goal "masa" applies BULK 1.08 to posterior.mu', async () => {
    setUser('masa');
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(3000 * 1.08));
  });

  it('goal "auto" leaves posterior.mu unchanged (no delta)', async () => {
    setUser('auto');
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(3000);
  });

  it('manual override BULK wins over goal-delta even on posterior.mu path', async () => {
    setUser('slabire');
    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    // Override BULK deriva din TDEE real per-user (NU posterior.mu), via
    // getPhaseOverrideKcalToday → readUserMaintenanceTDEE × 1.08.
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 1.08));
    expect(r.kcalTarget).toBeGreaterThan(MAINTENANCE);
  });

  it('goal "slabire" preserves LOCK 8 floor 1200 when posterior.mu small', async () => {
    setUser('slabire');
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 1400 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    // 1400 × 0.82 = 1148 < 1200 → floored la 1200.
    expect(r.kcalTarget).toBe(1200);
  });
});
