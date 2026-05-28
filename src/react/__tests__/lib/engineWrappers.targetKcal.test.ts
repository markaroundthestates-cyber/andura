// ══ ENGINE WRAPPERS — targetWeight/targetDate ↔ kcal coupling (smoke #16) ═══
// Daniel CEO smoke 2026-05-28 #16: greutatea-tinta + deadline trebuie sa
// influenteze tinta de kcal a coach-ului (nu doar "notita in profil"). Aceste
// teste verifica wire-ul: cand user-ul a setat targetObiectiv (weightKg+month)
// in progresStore (via Progres > ObiectivCard post integration #8 + #16),
// getNutritionTargetsToday produce kcal-ul tinta derivat din deficit/surplus
// zilnic necesar, capped la -25%/+15% TDEE.

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../engine/bayesianNutrition/index.js', () => ({
  evaluate: vi.fn(),
  ENGINE_ID: 'bayesianNutrition',
}));

import { getNutritionTargetsToday } from '../../lib/engineWrappers';
import { evaluate as evaluateBN } from '../../../engine/bayesianNutrition/index.js';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';
import { createMockBNResult } from '../../../test-utils/createMockContext';

beforeEach(() => {
  vi.clearAllMocks();
  useOnboardingStore.getState().reset();
  useProgresStore.getState().reset();
});

function setUserStats(overrides: { weight?: number; targetWeight?: number | null; targetDate?: string | null } = {}) {
  const s = useOnboardingStore.getState();
  s.setField('age', 36);
  s.setField('sex', 'm');
  s.setField('goal', 'slabire'); // CUT goal
  s.setField('frequency', '4');
  s.setField('experience', 'intermediar');
  s.setField('weight', overrides.weight ?? 110);
  s.setField('height', 182);
  // §obiectiv-tinta integration — tinta personala (weightKg + month) sta in
  // progresStore.targetObiectiv (SSOT post #8 + #16), NU in onboardingStore.
  const setTarget = useProgresStore.getState().setTargetObiectiv;
  if (overrides.targetWeight !== undefined) setTarget({ weightKg: overrides.targetWeight });
  if (overrides.targetDate !== undefined) setTarget({ month: overrides.targetDate });
}

describe('engineWrappers — smoke #16 target ↔ kcal coupling', () => {
  it('fara tinta setata → goalMult-ul de onboarding aplicat ca pana acum (NU regresie)', async () => {
    setUserStats();
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'medium',
        meta: { nutrition_inference_metadata: { posterior: { mu: 2800 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    // slabire goal → 2800 × 0.82 = 2296
    expect(r.kcalTarget).toBeCloseTo(2296, 0);
    expect(r.source).toBe('engine');
  });

  it('Daniel smoke 110→62kg in 4 zile + TDEE 2800 → cap automat la -25% (kcal 2100)', async () => {
    // Set deadline ~4 zile in viitor de la "azi"
    const future = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    const futureIso = future.toISOString().slice(0, 10);
    setUserStats({ weight: 110, targetWeight: 62, targetDate: futureIso });
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'medium',
        meta: { nutrition_inference_metadata: { posterior: { mu: 2800 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    // cap la -25% × 2800 = -700, kcalTarget = 2800 - 700 = 2100
    expect(r.kcalTarget).toBeCloseTo(2100, 0);
    // tinta personala ia precedenta peste goal-multiplier (slabire 0.82 = 2296)
    expect(r.kcalTarget).not.toBeCloseTo(2296, 0);
  });

  it('tinta sustenabila 110→105kg in 10 sapt + TDEE 2800 → deficit ~550 kcal/zi (NU capped)', async () => {
    const future = new Date(Date.now() + 70 * 24 * 60 * 60 * 1000);
    const futureIso = future.toISOString().slice(0, 10);
    setUserStats({ weight: 110, targetWeight: 105, targetDate: futureIso });
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'medium',
        meta: { nutrition_inference_metadata: { posterior: { mu: 2800 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    // 5kg × 7700 / 70 zile = 550 kcal/zi deficit → 2800 - 550 = 2250
    expect(r.kcalTarget).toBeCloseTo(2250, 0);
  });

  it('tinta de masa (gain) + deadline corect → surplus aplicat, NU goalMult slabire', async () => {
    // sex/age/etc identice (slabire goal in onboarding); tinta = masa
    setUserStats({ weight: 70 });
    const future = new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000);
    const futureIso = future.toISOString().slice(0, 10);
    useProgresStore.getState().setTargetObiectiv({ weightKg: 74, month: futureIso });
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'medium',
        meta: { nutrition_inference_metadata: { posterior: { mu: 2400 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    // 4kg × 7700 / 112 zile = 275 kcal/zi surplus → 2400 + 275 = 2675
    expect(r.kcalTarget).toBeCloseTo(2675, 0);
    // NU goalMult slabire (2400 × 0.82 = 1968)
    expect(r.kcalTarget).toBeGreaterThan(2400);
  });

  it('floor sex-aware se aplica suplimentar peste cap-ul tinta (femei 1000 / barbati 1200)', async () => {
    // Tinta agresiva masculin care ar duce sub 1200 dupa cap... improbabil, dar
    // verificam ca floor-ul ramane invariant LOCK8.
    setUserStats({ weight: 50 });
    useProgresStore.getState().setTargetObiectiv({ weightKg: 40, month: '2026-06-04' });
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'medium',
        meta: { nutrition_inference_metadata: { posterior: { mu: 1500 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    // Indiferent de target, floor-ul 1200 e respectat (clampKcalToHealthyFloor
    // poate ridica suplimentar daca user subponderal, dar minim absolut 1200).
    expect(r.kcalTarget).toBeGreaterThanOrEqual(1200);
  });
});
