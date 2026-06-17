// ══ GOAL FORECAST — readGoalForecast I/O boundary (canonical goal store) ══════
//
// Regression for C24-GOALFORECAST-WRONGSTORE-01: the weight ETA used to read the
// goal weight from the DEAD onboardingStore.data.targetWeight — which is NEVER
// written when the user sets a goal in-app (§obiectiv-tinta relocated the goal to
// progresStore.targetObiectiv, the canonical store the kcal-target engine +
// ObiectivCard read). So the pace-aware ETA was empty for every in-app goal.
//
// These tests exercise the I/O boundary (real stores + a mocked BN engine for a
// deterministic TDEE) and assert the ETA is sourced from the canonical store:
// onboarding goal ABSENT + progresStore goal SET → a real 'eta'.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../engine/bayesianNutrition/index.js', () => ({
  evaluate: vi.fn(),
  ENGINE_ID: 'bayesianNutrition',
}));

import { readGoalForecast } from '../../lib/goalForecast';
import { evaluate as evaluateBN } from '../../../engine/bayesianNutrition/index.js';
import { createMockBNResult } from '../../../test-utils/createMockContext';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';
import { useNutritionStore } from '../../stores/nutritionStore';

const NOW = Date.UTC(2026, 5, 2); // 2026-06-02
// Mocked Bayesian TDEE estimate (posterior.mu, tier non-none → readTdeeEstimateKcal
// returns it). 2500 expenditure vs 2000 intake = -500 kcal/day → real downtrend.
const TDEE = 2500;

function isoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10); // YYYY-MM-DD (matches dateISOToMs)
}

function mockTdee(mu: number): void {
  vi.mocked(evaluateBN).mockResolvedValue(
    createMockBNResult({
      tier: 'medium',
      meta: { nutrition_inference_metadata: { posterior: { mu } } },
    }),
  );
}

// Current weight (kg) via the latest progresStore.weightLog entry (getCurrentWeightKg).
function setCurrentWeight(kg: number): void {
  useProgresStore.setState((s) => ({
    weightLog: [...s.weightLog, { kg, date: isoDay(NOW), ts: NOW }],
  }));
}

// Recent logged intake (kcal/day) — one entry today is inside the 14-day window.
function setIntake(kcal: number): void {
  useNutritionStore.getState().setDailyKcal(isoDay(NOW), kcal);
}

beforeEach(() => {
  vi.clearAllMocks();
  useOnboardingStore.getState().reset();
  useProgresStore.getState().reset();
  useNutritionStore.getState().reset();
  localStorage.clear();
  mockTdee(TDEE);
});

afterEach(() => {
  useOnboardingStore.getState().reset();
  useProgresStore.getState().reset();
  useNutritionStore.getState().reset();
  localStorage.clear();
});

describe('readGoalForecast — weight ETA sources the canonical goal store', () => {
  it('no onboarding targetWeight but a progresStore goal set → a real pace-aware ETA', async () => {
    // The onboarding goal is left null (the dead store) — the goal lives ONLY in
    // the canonical progresStore (what an in-app goal-set actually writes).
    expect(useOnboardingStore.getState().data.targetWeight ?? null).toBeNull();
    setCurrentWeight(80);
    setIntake(2000); // -500 kcal/day deficit toward a lower goal
    useProgresStore.getState().setTargetObiectiv({ weightKg: 70 });

    const { weightEta } = await readGoalForecast(NOW);

    // Before the fix this was null/empty (read the dead onboarding store). Now it
    // is a real correct-direction ETA from the canonical goal.
    expect(weightEta).not.toBeNull();
    expect(weightEta?.kind).toBe('eta');
    if (weightEta?.kind === 'eta') {
      expect(weightEta.goalKg).toBe(70);
      expect(weightEta.direction).toBe('loss');
      expect(weightEta.etaMs).toBeGreaterThan(NOW);
    }
  });

  it('changing the goal in the canonical store recomputes a different ETA', async () => {
    setCurrentWeight(80);
    setIntake(2000);

    useProgresStore.getState().setTargetObiectiv({ weightKg: 75 });
    const first = await readGoalForecast(NOW);
    useProgresStore.getState().setTargetObiectiv({ weightKg: 70 });
    const second = await readGoalForecast(NOW);

    expect(first.weightEta?.kind).toBe('eta');
    expect(second.weightEta?.kind).toBe('eta');
    if (first.weightEta?.kind === 'eta' && second.weightEta?.kind === 'eta') {
      // A farther goal (70 vs 75 from 80) → a later ETA. Proves the read is live.
      expect(second.weightEta.goalKg).toBe(70);
      expect(second.weightEta.etaMs).toBeGreaterThan(first.weightEta.etaMs);
    }
  });

  it('no goal in either store → graceful empty (null), never a crash', async () => {
    setCurrentWeight(80);
    setIntake(2000);
    // No targetObiectiv set, no onboarding targetWeight.
    const { weightEta } = await readGoalForecast(NOW);
    expect(weightEta).toBeNull();
  });
});
