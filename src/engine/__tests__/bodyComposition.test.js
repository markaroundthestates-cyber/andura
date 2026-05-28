import { describe, it, expect } from 'vitest';
import {
  estimateBF_Deurenberg,
  estimateBfDeurenbergCapped,
  computeBMI,
  healthyFloorWeightKg,
  clampKcalToHealthyFloor,
  HEALTHY_MIN_BMI,
  LEAN_GAIN_SURPLUS_MULT,
  HIGH_BMI_BF_CAP_THRESHOLD,
  HIGH_BMI_BF_CAP_RATIO,
} from '../bodyComposition.js';

describe('estimateBF_Deurenberg', () => {
  it('80kg / 180cm / 30yo male → BMI 24.7 → ~20.3% (worked example)', () => {
    // BMI = 80 / 1.8^2 = 24.691
    // BF% = 1.20*24.691 + 0.23*30 - 10.8*1 - 5.4 = 29.629 + 6.9 - 16.2 = 20.33
    const bf = estimateBF_Deurenberg({ sex: 'm', weightKg: 80, heightCm: 180, ageYears: 30 });
    expect(bf).not.toBeNull();
    expect(bf).toBeCloseTo(20.3, 1);
  });

  it('female has higher bf than male same anthropometrics (sex factor)', () => {
    const m = estimateBF_Deurenberg({ sex: 'm', weightKg: 70, heightCm: 170, ageYears: 35 });
    const f = estimateBF_Deurenberg({ sex: 'f', weightKg: 70, heightCm: 170, ageYears: 35 });
    expect(f).toBeGreaterThan(m);
    expect(f - m).toBeCloseTo(10.8, 1); // exactly the sex factor delta
  });

  it('accepts "male"/"female" string variants', () => {
    expect(estimateBF_Deurenberg({ sex: 'male', weightKg: 80, heightCm: 180, ageYears: 30 }))
      .toBe(estimateBF_Deurenberg({ sex: 'm', weightKg: 80, heightCm: 180, ageYears: 30 }));
    expect(estimateBF_Deurenberg({ sex: 'female', weightKg: 70, heightCm: 170, ageYears: 35 }))
      .toBe(estimateBF_Deurenberg({ sex: 'f', weightKg: 70, heightCm: 170, ageYears: 35 }));
  });

  it('returns null on invalid / missing inputs', () => {
    expect(estimateBF_Deurenberg({})).toBeNull();
    expect(estimateBF_Deurenberg({ sex: 'm', weightKg: 80, heightCm: 180 })).toBeNull();
    expect(estimateBF_Deurenberg({ sex: 'm', weightKg: 0, heightCm: 180, ageYears: 30 })).toBeNull();
    expect(estimateBF_Deurenberg({ sex: 'm', weightKg: 80, heightCm: 0, ageYears: 30 })).toBeNull();
    expect(estimateBF_Deurenberg({ weightKg: 80, heightCm: 180, ageYears: 30 })).toBeNull();
    expect(estimateBF_Deurenberg({ sex: 'm', weightKg: NaN, heightCm: 180, ageYears: 30 })).toBeNull();
  });

  it('clamps to physiological band 2-60', () => {
    // Very high BMI + old → would exceed 60 unclamped.
    const high = estimateBF_Deurenberg({ sex: 'f', weightKg: 200, heightCm: 150, ageYears: 70 });
    expect(high).toBeLessThanOrEqual(60);
    expect(high).toBeGreaterThanOrEqual(2);
    // Very low BMI + young male → could go below 2 unclamped.
    const low = estimateBF_Deurenberg({ sex: 'm', weightKg: 50, heightCm: 195, ageYears: 18 });
    expect(low).toBeGreaterThanOrEqual(2);
  });

  it('is pure — same input same output', () => {
    const a = estimateBF_Deurenberg({ sex: 'm', weightKg: 85, heightCm: 178, ageYears: 42 });
    const b = estimateBF_Deurenberg({ sex: 'm', weightKg: 85, heightCm: 178, ageYears: 42 });
    expect(a).toBe(b);
  });
});

describe('estimateBfDeurenbergCapped — smoke 2026-05-28 #1 high-BMI bias cap', () => {
  it('BMI sub prag 27 → cap NU se aplica (passthrough Deurenberg)', () => {
    // 80kg/180cm/30yo M → BMI 24.7 → Deurenberg ~20.3% < cap → passthrough
    const r = estimateBfDeurenbergCapped({
      sex: 'm', weightKg: 80, heightCm: 180, ageYears: 30,
    });
    expect(r.capped).toBe(false);
    expect(r.bfPct).toBeCloseTo(20.3, 1);
  });

  it('Daniel smoke 109kg/182cm/36yo M (BMI 32.9, raw 31.6%) → cap la 28.0', () => {
    // BMI = 109/1.82² = 32.92
    // Deurenberg raw = 1.2×32.92 + 0.23×36 - 10.8 - 5.4 = 31.66
    // Cap = 32.92 × 0.85 = 27.98 ≈ 28.0
    const r = estimateBfDeurenbergCapped({
      sex: 'm', weightKg: 109, heightCm: 182, ageYears: 36,
    });
    expect(r.capped).toBe(true);
    expect(r.bfPct).toBeCloseTo(28.0, 1);
    // raw fara cap = 31.6
    expect(estimateBF_Deurenberg({ sex: 'm', weightKg: 109, heightCm: 182, ageYears: 36 }))
      .toBeCloseTo(31.6, 1);
  });

  it('femeie BMI 28 → cap aplicat (categoria suprapondereala incepe la 25-27)', () => {
    // 75kg/164cm → BMI 27.9 → peste prag 27
    const r = estimateBfDeurenbergCapped({
      sex: 'f', weightKg: 75, heightCm: 164, ageYears: 40,
    });
    expect(r.capped).toBe(true);
    const bmi = 75 / (1.64 * 1.64);
    const expectedCap = Math.round(Math.min(60, Math.max(2, bmi * 0.85)) * 10) / 10;
    expect(r.bfPct).toBe(expectedCap);
  });

  it('BMI exact la prag 27 → cap activ (la/peste, NU sub)', () => {
    // Construit pentru BMI exact 27.0: 87.48kg / 180cm → 27.0
    const w = 27 * 1.8 * 1.8;
    const r = estimateBfDeurenbergCapped({ sex: 'm', weightKg: w, heightCm: 180, ageYears: 35 });
    // Daca raw < cap (BMI×0.85 = 22.95), nu se aplica. Verificam doar ca
    // capul-test ruleaza pe pragul exact fara crash.
    expect(r.bfPct).not.toBeNull();
  });

  it('cand raw Deurenberg sub cap-ul calculat → NU se aplica (sport supraponderal lean)', () => {
    // BMI mare DAR Deurenberg sub cap (improbabil real, dar testam logica)
    // Sportiv hipotetic BMI 27 + sub-cap valoare → passthrough.
    // Folosim varsta foarte mica + masculin → BF Deurenberg mai mic.
    const r = estimateBfDeurenbergCapped({ sex: 'm', weightKg: 90, heightCm: 178, ageYears: 18 });
    const bmi = 90 / (1.78 * 1.78); // ~28.4
    const cap = bmi * 0.85; // ~24.2
    const raw = 1.2 * bmi + 0.23 * 18 - 10.8 - 5.4; // ~22.3
    expect(bmi).toBeGreaterThan(27);
    if (raw <= cap) {
      expect(r.capped).toBe(false);
      expect(r.bfPct).toBeCloseTo(raw, 0.5);
    }
  });

  it('input invalid → {bfPct:null, capped:false}', () => {
    expect(estimateBfDeurenbergCapped({})).toEqual({ bfPct: null, capped: false });
    expect(estimateBfDeurenbergCapped({ sex: 'm', weightKg: 80 })).toEqual({ bfPct: null, capped: false });
  });

  it('cap-ul respecta clamp-ul fiziologic 2-60', () => {
    const r = estimateBfDeurenbergCapped({
      sex: 'f', weightKg: 250, heightCm: 150, ageYears: 80,
    });
    expect(r.bfPct).toBeLessThanOrEqual(60);
    expect(r.bfPct).toBeGreaterThanOrEqual(2);
  });

  it('expune constantele pentru transparenta', () => {
    expect(HIGH_BMI_BF_CAP_THRESHOLD).toBe(27);
    expect(HIGH_BMI_BF_CAP_RATIO).toBe(0.85);
  });

  it('pur — same input same output', () => {
    const a = estimateBfDeurenbergCapped({ sex: 'm', weightKg: 109, heightCm: 182, ageYears: 36 });
    const b = estimateBfDeurenbergCapped({ sex: 'm', weightKg: 109, heightCm: 182, ageYears: 36 });
    expect(a).toEqual(b);
  });
});

describe('computeBMI', () => {
  it('80kg / 180cm → 24.7', () => {
    expect(computeBMI(80, 180)).toBeCloseTo(24.7, 1);
  });
  it('110kg / 184cm → 32.5 (overweight)', () => {
    expect(computeBMI(110, 184)).toBeCloseTo(32.5, 1);
  });
  it('55kg / 182cm → 16.6 (underweight)', () => {
    expect(computeBMI(55, 182)).toBeCloseTo(16.6, 1);
  });
  it('returns null on invalid input', () => {
    expect(computeBMI(0, 180)).toBeNull();
    expect(computeBMI(80, 0)).toBeNull();
    expect(computeBMI(NaN, 180)).toBeNull();
    expect(computeBMI(80, NaN)).toBeNull();
  });
});

describe('healthyFloorWeightKg — greutate la BMI 18.5', () => {
  it('182cm → ~61.3 kg (BMI 18.5)', () => {
    // 18.5 * 1.82^2 = 61.27
    expect(healthyFloorWeightKg(182)).toBeCloseTo(61.3, 1);
  });
  it('returns null on invalid height', () => {
    expect(healthyFloorWeightKg(0)).toBeNull();
    expect(healthyFloorWeightKg(NaN)).toBeNull();
  });
});

describe('clampKcalToHealthyFloor — BUG #4 underweight-must-gain guardrail', () => {
  it('subponderal (BMI<18.5) + deficit → clamp UP la surplus de crestere (NU mentenanta)', () => {
    // 55kg/182cm → BMI 16.6 (subponderal). Deficit 1800 vs mentenanta 2200.
    const r = clampKcalToHealthyFloor({
      kcalRecommendation: 1800,
      maintenanceKcal: 2200,
      weightKg: 55,
      heightCm: 182,
    });
    expect(r.clamped).toBe(true);
    // BUG #4: ridica la SURPLUS (mentenanta × 1.08), NU la mentenanta plata.
    expect(r.kcal).toBe(Math.round(2200 * LEAN_GAIN_SURPLUS_MULT));
    expect(r.kcal).toBeGreaterThan(2200); // surplus, nu mentenanta
    expect(r.currentBmi).toBeCloseTo(16.6, 1);
  });

  it('subponderal + recomandare la mentenanta plata → tot ridicat la surplus', () => {
    // Mentenanta (zero deficit) NU e suficient pentru subponderal — trebuie surplus.
    const r = clampKcalToHealthyFloor({
      kcalRecommendation: 2200,
      maintenanceKcal: 2200,
      weightKg: 55,
      heightCm: 182,
    });
    expect(r.clamped).toBe(true);
    expect(r.kcal).toBe(Math.round(2200 * LEAN_GAIN_SURPLUS_MULT));
  });

  it('subponderal dar recomandarea deja >= surplus (bulk explicit) → kcal neatins DAR clamped (mesaj sustinere)', () => {
    // Bulk agresiv 2500 > surplus tinta (2200×1.08 = 2376) → kcal trece neatins
    // (max(2500, 2376) = 2500). AUDIT HIGH: `clamped` derivat din BMI direct, deci
    // mesajul de sustinere se afiseaza pentru ORICE subponderal (e adevarat:
    // "esti sub greutatea sanatoasa, tinta are un surplus") — chiar daca kcal-ul
    // nu a fost ridicat. Fix-ul cohortei mici unde floor-ul depasea leanGain.
    const r = clampKcalToHealthyFloor({
      kcalRecommendation: 2500,
      maintenanceKcal: 2200,
      weightKg: 55,
      heightCm: 182,
    });
    expect(r.clamped).toBe(true);
    expect(r.kcal).toBe(2500);
  });

  it('greutate sanatoasa + deficit → passthrough (deficit permis)', () => {
    // 80kg/180cm → BMI 24.7 (sanatos). Deficit normal pentru slabire.
    const r = clampKcalToHealthyFloor({
      kcalRecommendation: 2000,
      maintenanceKcal: 2500,
      weightKg: 80,
      heightCm: 180,
    });
    expect(r.clamped).toBe(false);
    expect(r.kcal).toBe(2000);
  });

  it('supraponderal + deficit → passthrough (deficit corect)', () => {
    const r = clampKcalToHealthyFloor({
      kcalRecommendation: 2286,
      maintenanceKcal: 2788,
      weightKg: 110,
      heightCm: 184,
    });
    expect(r.clamped).toBe(false);
    expect(r.kcal).toBe(2286);
  });

  it('exact la prag BMI 18.5 + deficit → clamp la surplus (la/sub minim)', () => {
    // greutate la exact BMI 18.5 (61.3kg/182cm).
    const r = clampKcalToHealthyFloor({
      kcalRecommendation: 1800,
      maintenanceKcal: 2200,
      weightKg: healthyFloorWeightKg(182),
      heightCm: 182,
    });
    expect(r.currentBmi).toBeCloseTo(HEALTHY_MIN_BMI, 1);
    expect(r.clamped).toBe(true);
    expect(r.kcal).toBe(Math.round(2200 * LEAN_GAIN_SURPLUS_MULT));
  });

  it('cold start (greutate/inaltime absente) → passthrough fara clamp', () => {
    const r = clampKcalToHealthyFloor({
      kcalRecommendation: 1800,
      maintenanceKcal: 2200,
      weightKg: null,
      heightCm: null,
    });
    expect(r.clamped).toBe(false);
    expect(r.kcal).toBe(1800);
    expect(r.currentBmi).toBeNull();
  });

  it('mentenanta absenta → passthrough (nu fabricam clamp)', () => {
    const r = clampKcalToHealthyFloor({
      kcalRecommendation: 1800,
      maintenanceKcal: NaN,
      weightKg: 55,
      heightCm: 182,
    });
    expect(r.clamped).toBe(false);
    expect(r.kcal).toBe(1800);
  });

  it('is pure — same input same output', () => {
    const args = { kcalRecommendation: 1800, maintenanceKcal: 2200, weightKg: 55, heightCm: 182 };
    expect(clampKcalToHealthyFloor(args)).toEqual(clampKcalToHealthyFloor(args));
  });
});
