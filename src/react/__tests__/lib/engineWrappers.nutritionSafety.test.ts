// ══ ENGINE WRAPPERS — Nutrition safety + AUTO body-comp wiring ════════════
// BUG #4 (subponderal → surplus de crestere, NU mentenanta/deficit) + BUG #5
// (AUTO phase din body-comp cand weight-trend e flat/cold-start). Real-store
// wiring (NU mock engine): user fresh fara observatii BN → buildPerUserBaseline.

import { describe, it, expect, beforeEach } from 'vitest';
import { getNutritionTargetsToday, getAutoDetectedPhaseLabelRo } from '../../lib/engineWrappers';
import { readUserMaintenanceTDEE } from '../../lib/userTdee';
import { LEAN_GAIN_SURPLUS_MULT } from '../../../engine/bodyComposition.js';
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
  useProgresStore.setState({
    weightLog: [],
    bodyData: [],
    targetObiectiv: { weightKg: null, month: null },
  } as never);
  useWorkoutStore.setState({ sessionsHistory: [] } as never);
});

describe('BUG #4 — getNutritionTargetsToday underweight-must-gain guardrail', () => {
  it('subponderal + goal slabire → kcal ridicat la surplus de crestere (clamped)', async () => {
    // 55kg/182cm → BMI 16.6 (subponderal). Goal slabire ar da deficit CUT 0.82.
    setOnboarding({ weight: 55, height: 182, goal: 'slabire' });
    const maintenanceTdee = readUserMaintenanceTDEE() as number;
    const t = await getNutritionTargetsToday();
    expect(t.healthyFloorClamped).toBe(true);
    // BUG #4: NU mai e deficit nici mentenanta — e surplus de crestere (TDEE×1.08).
    expect(t.kcalTarget).toBe(Math.round(maintenanceTdee * LEAN_GAIN_SURPLUS_MULT));
    expect(t.kcalTarget).toBeGreaterThan(maintenanceTdee);
  });

  it('greutate sanatoasa + goal slabire → deficit permis (NU clamped)', async () => {
    setOnboarding({ weight: 80, height: 180, goal: 'slabire' });
    const t = await getNutritionTargetsToday();
    expect(t.healthyFloorClamped).toBe(false);
  });

  it('subponderal indiferent de goal → tot un surplus de crestere (slabire/mentenanta egal)', async () => {
    // BUG #4 esenta: subponderalul creste, oricare ar fi goal-ul ales. Slabire
    // (deficit) si mentenanta (zero deficit) ajung AMANDOUA la acelasi surplus.
    setOnboarding({ weight: 55, height: 182, goal: 'slabire' });
    const cut = await getNutritionTargetsToday();
    setOnboarding({ weight: 55, height: 182, goal: 'mentenanta' });
    const maintain = await getNutritionTargetsToday();
    expect(cut.healthyFloorClamped).toBe(true);
    expect(maintain.healthyFloorClamped).toBe(true);
    expect(cut.kcalTarget).toBe(maintain.kcalTarget); // ambele la surplus
  });

  it('subponderal + goal masa (BULK 1.08) → tot surplus + mesaj de sustinere (clamped, audit HIGH)', async () => {
    // Goal masa = BULK 1.08 = exact tinta de crestere → recomandarea egaleaza
    // surplus-ul (kcal neschimbat via max). Audit HIGH: mesajul de sustinere se
    // afiseaza pentru ORICE subponderal (clamped derivat din BMI direct, NU din
    // leanGain-vs-rec) — "esti sub greutatea sanatoasa, tinta are un mic surplus"
    // e adevarat + util si cand kcal-ul e deja la surplus.
    setOnboarding({ weight: 55, height: 182, goal: 'masa' });
    const maintenanceTdee = readUserMaintenanceTDEE() as number;
    const masa = await getNutritionTargetsToday();
    expect(masa.healthyFloorClamped).toBe(true);
    expect(masa.kcalTarget).toBeGreaterThan(maintenanceTdee); // surplus, nu deficit
  });
});

describe('L7 — safetyLimited surfacing (base target rate-capped / floored)', () => {
  it('femeie mica + cut → tinta clampata la floor → safetyLimited floored', async () => {
    // 48kg/158cm femeie 70 ani (BMI 19.2, NU subponderal) + slabire (CUT).
    // Mentenanta mica (~1239) → deficitul de 20% coboara sub floor-ul de 1000 →
    // clampat la floor. NU subponderal → guardrail-ul de crestere NU se aplica,
    // deci semnalul floored ajunge la UI (NU contradice mesajul de sustinere).
    setOnboarding({
      sex: 'f', weight: 48, height: 158, age: 70,
      frequency: '1', experience: 'incepator', goal: 'slabire',
    });
    const t = await getNutritionTargetsToday();
    expect(t.healthyFloorClamped).toBe(false); // NU subponderal — fara override de crestere
    expect(t.safetyLimited).toBe('floored');
  });

  it('barbat greu + tinta agresiva cu deadline scurt → ritm plafonat → safetyLimited capped', async () => {
    // 150kg barbat (mentenanta mare → cut ramane mult peste 1200, NU floored) cu
    // tinta 90kg (60kg) in ~2 luni → ritmul cerut depaseste capul → capped.
    // Deadline = ~2 luni in viitor (NU luna curenta): determinist independent
    // de data rularii. Un deadline ~0 zile (rulare la sfarsit de luna) ar da
    // un cap neactionabil (undefined), deci fixam o fereastra viitoare stabila.
    setOnboarding({ sex: 'm', weight: 150, height: 185, goal: 'slabire' });
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    const targetMonth = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
    useProgresStore.setState({
      targetObiectiv: { weightKg: 90, month: targetMonth },
      weightLog: [],
      bodyData: [],
    } as never);
    const t = await getNutritionTargetsToday();
    expect(t.healthyFloorClamped).toBe(false);
    expect(t.safetyLimited).toBe('capped');
  });

  it('profil normal (80kg/180cm barbat slabire, fara deadline) → NICIUN semnal de siguranta', async () => {
    // 20% deficit pe o mentenanta normala ramane peste floor + fara deadline =
    // ritmul default (NU capat). Nici floored, nici capped.
    setOnboarding({ sex: 'm', weight: 80, height: 180, goal: 'slabire' });
    const t = await getNutritionTargetsToday();
    expect(t.safetyLimited).toBeUndefined();
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
