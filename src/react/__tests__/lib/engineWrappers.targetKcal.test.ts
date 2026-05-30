// ══ ENGINE WRAPPERS — coherent goal/phase/target ↔ kcal sizing ═══════════════
// Coherence model 2026-05-30 (supersedes smoke #16 -25%/+15% cap model). The
// goal/phase DIRECTION is authoritative — it forces the kcal SIGN (CUT=deficit,
// BULK=surplus). The target weight + deadline only size the MAGNITUDE within
// that direction, as a %-of-TDEE (default 20% cut / 12% bulk; capped 25% / 15%)
// ADDITIONALLY clamped by the kg/wk caps (1.5 loss / 0.5 gain), sex-floored.
// (Daniel LOCK 2026-05-30 — supersedes the interim fixed kg/wk rate model.)
//
// This fixes the Daniel repro: masa (BULK) + a below-current target weight used
// to surface a 2200 DEFICIT (the target-weight override outranked + discarded
// the BULK surplus). Now a BULK goal ALWAYS yields a surplus above maintenance.

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
import type { Goal } from '../../stores/onboardingStore';

beforeEach(() => {
  vi.clearAllMocks();
  useOnboardingStore.getState().reset();
  useProgresStore.getState().reset();
  localStorage.clear();
});

function mockTdee(mu: number) {
  vi.mocked(evaluateBN).mockResolvedValueOnce(
    createMockBNResult({
      confidence: 'medium',
      meta: { nutrition_inference_metadata: { posterior: { mu } } },
    }),
  );
}

function setUserStats(
  overrides: {
    goal?: Goal;
    weight?: number;
    targetWeight?: number | null;
    targetDate?: string | null;
  } = {},
) {
  const s = useOnboardingStore.getState();
  s.setField('age', 36);
  s.setField('sex', 'm');
  s.setField('goal', overrides.goal ?? 'slabire');
  s.setField('frequency', '4');
  s.setField('experience', 'intermediar');
  s.setField('weight', overrides.weight ?? 110);
  s.setField('height', 182);
  const setTarget = useProgresStore.getState().setTargetObiectiv;
  if (overrides.targetWeight !== undefined) setTarget({ weightKg: overrides.targetWeight });
  if (overrides.targetDate !== undefined) setTarget({ month: overrides.targetDate });
}

function isoInDays(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

describe('engineWrappers — coherent goal/phase ↔ kcal sizing', () => {
  it('slabire (CUT) fara tinta → deficit la 20% din TDEE (2800 → 2240)', async () => {
    setUserStats({ goal: 'slabire' });
    mockTdee(2800);
    const r = await getNutritionTargetsToday({});
    // CUT default 20% din TDEE → 0.20*2800 = 560/zi deficit → 2800 - 560 = 2240
    expect(r.kcalTarget).toBeCloseTo(2240, 0);
    expect(r.source).toBe('engine');
  });

  it('Daniel smoke 110→62kg in 4 zile (slabire) → cap 25% din TDEE (2800 → 2100)', async () => {
    setUserStats({ goal: 'slabire', weight: 110, targetWeight: 62, targetDate: isoInDays(4) });
    mockTdee(2800);
    const r = await getNutritionTargetsToday({});
    // 48kg/4zile cere deficit imposibil → cap min(25%*2800=700, 1.5kg/wk=1650)=700
    // → 2800 - 700 = 2100 (peste floor). % bindeaza inaintea kg/sapt. Sustenabil.
    expect(r.kcalTarget).toBe(2100);
  });

  it('tinta sustenabila 110→105 in 10 sapt (slabire) → deficit ~550 kcal/zi (NU capped)', async () => {
    setUserStats({ goal: 'slabire', weight: 110, targetWeight: 105, targetDate: isoInDays(70) });
    mockTdee(2800);
    const r = await getNutritionTargetsToday({});
    // 5kg × 7700 / 70 = 550/zi < cap 700 → NU capped → 2800 - 550 = 2250
    expect(r.kcalTarget).toBeCloseTo(2250, 0);
  });

  it('REPRO masa (BULK) + target sub greutatea curenta → SURPLUS, NU deficit 2200', async () => {
    // Daniel repro: goal masa, current 110, target 90 (<110), TDEE ~2400.
    // Vechiul model: target-override (90<110 deficit) ar fi dat ~2200. Acum BULK
    // forteaza semnul → surplus. Tinta de masa NU mai produce niciodata deficit.
    setUserStats({ goal: 'masa', weight: 110, targetWeight: 90, targetDate: isoInDays(112) });
    mockTdee(2400);
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBeGreaterThan(2400); // surplus, nu deficit (era ~2200)
    // BULK forteaza semnul +; 20kg/112 zile cere ~1375/zi (>cap) → cap min(15%*2400=
    // 360, 0.5kg/wk=550)=360 → +360/zi → 2400 + 360 = 2760. NICIODATA un deficit.
    expect(r.kcalTarget).toBeCloseTo(2760, 0);
  });

  it('masa (BULK) cu tinta de crestere coerenta + deadline → surplus % capped', async () => {
    // 70→74 in 16 sapt → 4kg*7700/112 = 275/zi < cap 360 → +275/zi → 2400+275 = 2675
    setUserStats({ goal: 'masa', weight: 70, targetWeight: 74, targetDate: isoInDays(16 * 7) });
    mockTdee(2400);
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBeCloseTo(2675, 0);
    expect(r.kcalTarget).toBeGreaterThan(2400);
  });

  it('floor sex-aware ramane invariant LOCK8 (barbati 1200)', async () => {
    setUserStats({ goal: 'slabire', weight: 50, targetWeight: 40, targetDate: isoInDays(5) });
    mockTdee(1500);
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBeGreaterThanOrEqual(1200);
  });
});
