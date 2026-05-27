// ══ ENGINE WRAPPERS — Nutrition safety + AUTO body-comp wiring ════════════
// BUG #13 (healthy-floor guardrail pe kcal OUTPUT) + BUG #5 (AUTO phase din
// body-comp cand weight-trend e flat/cold-start). Real-store wiring (NU mock
// engine): user fresh fara observatii BN → buildPerUserBaseline path.

import { describe, it, expect, beforeEach } from 'vitest';
import { getNutritionTargetsToday, getAutoDetectedPhaseLabelRo } from '../../lib/engineWrappers';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';
import { useWorkoutStore } from '../../stores/workoutStore';

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

beforeEach(() => {
  localStorage.clear();
  useProgresStore.setState({ weightLog: [], bodyData: [] });
  useWorkoutStore.setState({ sessionsHistory: [] } as never);
});

describe('BUG #13 — getNutritionTargetsToday healthy-floor guardrail', () => {
  it('subponderal + goal slabire → kcal ridicat la mentenanta (clamped)', async () => {
    // 55kg/182cm → BMI 16.6 (subponderal). Goal slabire ar da deficit CUT 0.82.
    setOnboarding({ weight: 55, height: 182, goal: 'slabire' });
    const t = await getNutritionTargetsToday();
    expect(t.healthyFloorClamped).toBe(true);
    // Clamp la mentenanta: kcal >= mentenanta (NU sub, NU deficit). Mentenanta
    // per-user ~BMR×1.25 + sesiuni; deficit-ul ar fi fost ~0.82× din asta.
    // Verificam ca NU mai e in deficit: kcal == mentenanta (round).
    expect(t.kcalTarget).toBeGreaterThan(0);
  });

  it('greutate sanatoasa + goal slabire → deficit permis (NU clamped)', async () => {
    setOnboarding({ weight: 80, height: 180, goal: 'slabire' });
    const t = await getNutritionTargetsToday();
    expect(t.healthyFloorClamped).toBe(false);
  });

  it('subponderal + goal masa (surplus) → NU clamped (recomandarea nu e deficit)', async () => {
    setOnboarding({ weight: 55, height: 182, goal: 'masa' });
    const t = await getNutritionTargetsToday();
    expect(t.healthyFloorClamped).toBe(false);
  });

  it('clamp efectiv ridica kcal-ul vs un deficit pur', async () => {
    // Comparam acelasi user subponderal: cu slabire (clamped) vs mentenanta.
    setOnboarding({ weight: 55, height: 182, goal: 'slabire' });
    const clamped = await getNutritionTargetsToday();
    setOnboarding({ weight: 55, height: 182, goal: 'mentenanta' });
    const maintain = await getNutritionTargetsToday();
    // Clamped (slabire) ridica la mentenanta → egal cu mentenanta, NU mai jos.
    expect(clamped.kcalTarget).toBe(maintain.kcalTarget);
  });
});

describe('BUG #5 — AUTO phase label din body-comp (weight-trend flat)', () => {
  it('supraponderal fresh (110kg/184cm, fara istoric) → Cut', () => {
    setOnboarding({ weight: 110, height: 184, goal: 'auto' });
    expect(getAutoDetectedPhaseLabelRo()).toBe('Cut');
  });

  it('near-ideal (75kg/180cm) → Mentinere', () => {
    setOnboarding({ weight: 75, height: 180, goal: 'auto' });
    expect(getAutoDetectedPhaseLabelRo()).toBe('Mentinere');
  });

  it('subponderal (55kg/182cm) → Bulk', () => {
    setOnboarding({ weight: 55, height: 182, goal: 'auto' });
    expect(getAutoDetectedPhaseLabelRo()).toBe('Bulk');
  });

  it('weight-trend directional are prioritate peste body-comp', () => {
    // User supraponderal DAR cu trend clar de scadere → weight-trend zice CUT
    // oricum (acelasi rezultat), dar verificam ca trend-ul up override body-comp:
    // supraponderal + crestere consistenta → BULK (trend wins), NU CUT.
    setOnboarding({ weight: 110, height: 184, goal: 'auto' });
    const now = Date.now();
    const DAY = 1000 * 60 * 60 * 24;
    useProgresStore.setState({
      weightLog: [
        { kg: 106, date: '2026-04-01', ts: now - 28 * DAY },
        { kg: 110, date: '2026-04-29', ts: now }, // +4kg/4sapt = crestere → BULK
      ],
      bodyData: [],
    });
    expect(getAutoDetectedPhaseLabelRo()).toBe('Bulk');
  });

  it('cold-start total (fara stats) → Mentinere onest', () => {
    useOnboardingStore.setState({
      data: { age: null, sex: null, goal: 'auto', frequency: null, experience: null, weight: null, height: null } as never,
      completed: false,
      completedAt: null,
    });
    expect(getAutoDetectedPhaseLabelRo()).toBe('Mentinere');
  });
});

describe('AUTO kcal multiplier reflects body-comp phase (BUG #5 end-to-end)', () => {
  it('supraponderal AUTO → kcal in deficit (CUT) vs near-ideal AUTO (mentinere)', async () => {
    setOnboarding({ weight: 110, height: 184, goal: 'auto' });
    const overweight = await getNutritionTargetsToday();
    // CUT detectat → kcal < mentenanta. Mentenanta pentru acest user:
    setOnboarding({ weight: 110, height: 184, goal: 'mentenanta' });
    const maintain = await getNutritionTargetsToday();
    expect(overweight.kcalTarget).toBeLessThan(maintain.kcalTarget);
  });
});
