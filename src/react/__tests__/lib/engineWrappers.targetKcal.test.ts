// ══ ENGINE WRAPPERS — coherent goal/phase/target ↔ kcal sizing ═══════════════
// Coherence model 2026-05-30 — the goal/phase DIRECTION is authoritative: it
// forces the kcal SIGN (CUT=deficit, BULK=surplus). The target weight + deadline
// size the MAGNITUDE within that direction.
//
// CEO LOCK 2026-05-31 — the recommendation is goal+deadline-driven and as
// aggressive as the goal demands. The intermediate rate caps (25% deficit / 1.5kg
// -wk loss, 15% surplus / 0.5kg-wk gain) are REMOVED — the deadline `requiredAbs`
// shift drives the target DIRECTLY. The SOLE safety limit is the sex kcal floor
// (women 1000 / men 1200), applied last. So an aggressive deadline now floors at
// the safe minimum instead of capping at a sustainable rate.
//
// This still fixes the Daniel repro: masa (BULK) + a below-current target weight
// used to surface a 2200 DEFICIT. A BULK goal ALWAYS yields a surplus above
// maintenance (the phase forces the sign).

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

  it('Daniel smoke 110→62kg in 4 zile (slabire) → floored la minimul sigur (CEO LOCK 2026-05-31, fara cap de ritm)', async () => {
    setUserStats({ goal: 'slabire', weight: 110, targetWeight: 62, targetDate: isoInDays(4) });
    mockTdee(2800);
    const r = await getNutritionTargetsToday({});
    // 48kg/4zile cere un deficit enorm (~92.000/zi). CEO LOCK 2026-05-31: capurile
    // de ritm sunt scoase — deficitul conduce direct, singura limita e floor-ul pe
    // sex (barbati 1200). Deci tinta coboara la 1200 (NU plafonata la 2100).
    expect(r.kcalTarget).toBe(1200);
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
    // BULK forteaza semnul +; 20kg/112 zile cere ~1375/zi surplus. CEO LOCK
    // 2026-05-31: capurile de ritm scoase → surplus-ul conduce direct → 2400 +
    // round(20*7700/112) = 2400 + 1375 = 3775. NICIODATA un deficit.
    expect(r.kcalTarget).toBe(2400 + Math.round((20 * 7700) / 112));
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
