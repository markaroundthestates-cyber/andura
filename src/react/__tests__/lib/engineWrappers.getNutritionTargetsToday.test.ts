// Phase 6 task_03 — getNutritionTargetsToday async BN engine wrapper tests.
//
// Verifies Kalman posterior.mu mapping to kcalTarget + LOCK 8 floor 1200
// invariant + baseline fallback on engine throw / tier 'none' / missing
// posterior. Macros (protein/fat/carbs) preserved baseline V1 — engine
// domain NU emit macro split (anti-recurrence note: sketch §B fabricated
// protein_target_g/fat_g/carbs_g fields not in engine output).

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../engine/bayesianNutrition/index.js', () => ({
  evaluate: vi.fn(),
  ENGINE_ID: 'bayesianNutrition',
}));

import { getNutritionTargetsToday } from '../../lib/engineWrappers';
import { evaluate as evaluateBN } from '../../../engine/bayesianNutrition/index.js';
// NIT-CODE-06 — typed mock builder. See CODE_STYLE.md §"Test mock typing".
import { createMockBNResult } from '../../../test-utils/createMockContext';

const BASELINE = {
  kcalTarget: 2640,
  proteinTargetG: 180,
  fatG: 70,
  carbsG: 280,
  source: 'baseline' as const,
  confidence: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('engineWrappers — getNutritionTargetsToday', () => {
  it('returns engine kcalTarget cand evaluate succeeds + tier MED + confidence high', async () => {
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: {
          nutrition_inference_metadata: {
            posterior: { mu: 2850, sigma: 100, observations_count: 5, ci_lower: 2700, ci_upper: 3000 },
          },
          likelihood_probabilities: {},
          profile_typing: {},
          ui_tier: 'MED',
          passive_mode_active: false,
          signals: [],
        },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.source).toBe('engine');
    expect(r.kcalTarget).toBe(2850);
    expect(r.confidence).toBe(1); // high → 1
    expect(r.proteinTargetG).toBe(180); // baseline preserved (engine NU emit macros)
    expect(r.fatG).toBe(70);
    expect(r.carbsG).toBe(280);
  });

  it('falls back to baseline cand engine throws', async () => {
    vi.mocked(evaluateBN).mockRejectedValueOnce(new Error('engine boom'));
    const r = await getNutritionTargetsToday({});
    expect(r).toEqual(BASELINE);
  });

  it('enforces LOCK 8 floor 1200 cand posterior.mu < 1200', async () => {
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        meta: { nutrition_inference_metadata: { posterior: { mu: 800 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(1200);
    expect(r.source).toBe('engine');
  });

  it('tier "none" → baseline fallback (T0 fresh user pre-observation)', async () => {
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({ tier: 'none', confidence: 'low', meta: {} }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r).toEqual(BASELINE);
  });

  it('engine result null → baseline fallback', async () => {
    vi.mocked(evaluateBN).mockResolvedValueOnce(null as unknown as Awaited<ReturnType<typeof evaluateBN>>);
    const r = await getNutritionTargetsToday({});
    expect(r).toEqual(BASELINE);
  });

  it('engine result missing meta → baseline fallback', async () => {
    // Negative-path: omit meta entirely — raw cast preserves shape since
    // builder injects default `meta` (defeating the missing-meta test).
    vi.mocked(evaluateBN).mockResolvedValueOnce({
      id: 'bayesianNutrition',
      tier: 'MED',
      confidence: 'low',
      signals: [],
      recommendations: [],
      trace: {},
    } as unknown as Awaited<ReturnType<typeof evaluateBN>>);
    const r = await getNutritionTargetsToday({});
    expect(r).toEqual(BASELINE);
  });

  it('engine result missing posterior.mu → baseline fallback', async () => {
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        meta: { nutrition_inference_metadata: { posterior: {} } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r).toEqual(BASELINE);
  });

  it('confidence mapping: high → 1, medium → 0.5, low → 0.2', async () => {
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ confidence: 'high' }));
    expect((await getNutritionTargetsToday({})).confidence).toBe(1);

    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ confidence: 'medium' }));
    expect((await getNutritionTargetsToday({})).confidence).toBe(0.5);

    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ confidence: 'low' }));
    expect((await getNutritionTargetsToday({})).confidence).toBe(0.2);
  });

  it('undefined userState → defensive defaults, returns baseline OR engine', async () => {
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({ tier: 'none', confidence: 'low', meta: {} }),
    );
    const r = await getNutritionTargetsToday();
    expect(r).toEqual(BASELINE);
  });

  it('macros (protein/fat/carbs) preserved baseline cand engine emit kcal (engine NU emit macros)', async () => {
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    // Engine wires kcal but NU emit macros — baseline macros preserved V1.
    expect(r.proteinTargetG).toBe(180);
    expect(r.fatG).toBe(70);
    expect(r.carbsG).toBe(280);
  });

  it('kcalTarget rounded to integer', async () => {
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        meta: { nutrition_inference_metadata: { posterior: { mu: 2847.7 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(2848);
    expect(Number.isInteger(r.kcalTarget)).toBe(true);
  });
});
