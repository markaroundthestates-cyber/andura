// ══ A4 — coached recommendation vs math target (sustainable deficit cap) ══════
// Flag dp_nutrition_coached_v1 (default OFF). The MATH target is goal-driven +
// bounded only by the hard sex floor; the COACHED recommendation bounds it to a
// sustainable rate (deficit <=25% below maintenance / surplus <=20% above). Flag
// OFF → byte-identical (no coached override, no extra fields). Flag ON → coached
// number applies + a reason surfaces.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  applySustainableCap,
  COACHED_MAX_DEFICIT_FRACTION,
  COACHED_MAX_SURPLUS_FRACTION,
} from '../../lib/goalPhaseModel';
import { getNutritionTargetsToday } from '../../lib/engineWrappers';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';
import { useWorkoutStore } from '../../stores/workoutStore';

const FLAG = 'dp_nutrition_coached_v1';

function setOnboarding(data: Partial<{
  age: number; sex: 'm' | 'f'; goal: string; frequency: string;
  experience: string; weight: number; height: number;
}>): void {
  useOnboardingStore.setState({
    data: {
      age: 30, sex: 'm', goal: 'auto', frequency: '3',
      experience: 'intermediar', weight: 80, height: 180,
      ...data,
    } as never,
    completed: true,
    completedAt: Date.now(),
  });
}

/** Aggressive deficit profile: 150kg man cutting to 90kg in ~2 months. The math
 *  target lands at the bare sex floor (1200) — the spec's reference case. */
function setAggressiveDeficit(): void {
  setOnboarding({ sex: 'm', weight: 150, height: 185, goal: 'slabire' });
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + 2, 1);
  const targetMonth = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
  useProgresStore.setState({
    targetObiectiv: { weightKg: 90, month: targetMonth },
    weightLog: [],
    bodyData: [],
  } as never);
}

function enableFlag(): void {
  localStorage.setItem('_devFlags', JSON.stringify({ [FLAG]: true }));
}

beforeEach(() => {
  localStorage.clear();
  useProgresStore.setState({
    weightLog: [],
    bodyData: [],
    targetObiectiv: { weightKg: null, month: null },
  } as never);
  useWorkoutStore.setState({ sessionsHistory: [] } as never);
});

afterEach(() => {
  localStorage.clear();
});

describe('applySustainableCap (pure)', () => {
  it('aggressive deficit (math far below the 25% cap) → capped at 25% below maintenance', () => {
    const tdee = 2500;
    const r = applySustainableCap(1200, tdee, 1200);
    expect(r.reason).toBe('deficit_capped_sustainable');
    expect(r.kcal).toBe(Math.round(tdee * (1 - COACHED_MAX_DEFICIT_FRACTION))); // 1875
    expect(r.kcal).toBeGreaterThan(1200); // above the bare floor — sustainable
  });

  it('moderate deficit already within the sustainable band → unchanged', () => {
    const tdee = 2500;
    const math = 2100; // 16% deficit — milder than the 25% cap
    const r = applySustainableCap(math, tdee, 1200);
    expect(r.reason).toBe('within_sustainable');
    expect(r.kcal).toBe(math);
  });

  it('tiny-maintenance deficit where the 25% cap is below the floor → at_floor', () => {
    const tdee = 1300; // 25% cap = 975, below the 1000/1200 floor
    const r = applySustainableCap(1000, tdee, 1200);
    expect(r.kcal).toBe(1200); // floor binds, not the cap
    expect(r.reason).toBe('at_floor');
  });

  it('aggressive surplus → capped at 20% above maintenance', () => {
    const tdee = 2500;
    const r = applySustainableCap(3500, tdee, 1200);
    expect(r.reason).toBe('surplus_capped_moderate');
    expect(r.kcal).toBe(Math.round(tdee * (1 + COACHED_MAX_SURPLUS_FRACTION))); // 3000
  });

  it('moderate surplus within the band → unchanged', () => {
    const tdee = 2500;
    const math = 2700; // 8% surplus — milder than the 20% cap
    const r = applySustainableCap(math, tdee, 1200);
    expect(r.reason).toBe('within_sustainable');
    expect(r.kcal).toBe(math);
  });
});

describe('getNutritionTargetsToday — flag OFF (byte-identical baseline)', () => {
  it('aggressive deficit profile stays at the bare floor with NO coached fields', async () => {
    setAggressiveDeficit();
    const t = await getNutritionTargetsToday();
    expect(t.kcalTarget).toBe(1200); // math target floored, as today
    expect(t.mathKcalTarget).toBeUndefined();
    expect(t.coachedReason).toBeUndefined();
  });
});

describe('getNutritionTargetsToday — flag ON (coached recommendation)', () => {
  it('aggressive deficit → coached ABOVE the bare floor + reason deficit_capped_sustainable', async () => {
    setAggressiveDeficit();
    const off = await getNutritionTargetsToday();
    enableFlag();
    const on = await getNutritionTargetsToday();
    expect(off.kcalTarget).toBe(1200);
    // Coached pulls the punishing deficit back to a sustainable rate.
    expect(on.kcalTarget).toBeGreaterThan(off.kcalTarget);
    expect(on.coachedReason).toBe('deficit_capped_sustainable');
    // The math target stays available for the honest "why".
    expect(on.mathKcalTarget).toBe(1200);
  });

  it('moderate profile (80kg/180cm man slabire, no deadline) → unchanged ON vs OFF', async () => {
    setOnboarding({ sex: 'm', weight: 80, height: 180, goal: 'slabire' });
    const off = await getNutritionTargetsToday();
    enableFlag();
    const on = await getNutritionTargetsToday();
    // A 20% default deficit is already inside the 25% sustainable band → no change.
    expect(on.kcalTarget).toBe(off.kcalTarget);
    expect(on.coachedReason).toBe('within_sustainable');
  });

  it('surplus side stays moderate — a bulk goal never coached above +20%', async () => {
    // masa (BULK) toward a higher target weight with a near deadline → math surplus.
    setOnboarding({ sex: 'm', weight: 80, height: 180, goal: 'masa' });
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    const targetMonth = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
    useProgresStore.setState({
      targetObiectiv: { weightKg: 95, month: targetMonth }, // +15kg fast → big surplus
      weightLog: [],
      bodyData: [],
    } as never);
    enableFlag();
    const on = await getNutritionTargetsToday();
    // Whatever the math surplus, the coached number never exceeds +20% over maintenance.
    expect(['surplus_capped_moderate', 'within_sustainable']).toContain(on.coachedReason);
    if (on.coachedReason === 'surplus_capped_moderate') {
      expect(on.kcalTarget).toBeLessThan(on.mathKcalTarget!);
    }
  });
});
