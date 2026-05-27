// Piesa 2 nutrition-brain fix — observations builder + context tests.
//
// Proves: (1) energy-balance builder produce estimari TDEE corecte din trend
// greutate + intake logat; (2) demographic prior scapa engine-ul din tier
// 'none' chiar cu 0 observatii (fresh user → estimare per-user, NU 2640);
// (3) cantarul invinge log-ul sub-raportat (grain of salt); (4) floor
// sex-diferentiat ajunge in ctx.

import { describe, it, expect } from 'vitest';
import {
  buildNutritionObservations,
  buildBayesianNutritionContext,
  tierFromObservationCount,
  tierFromWeighInCount,
  KCAL_PER_KG,
} from '../../lib/nutritionObservations';
import type { WeightEntry } from '../../stores/progresStore';
import type { NutritionDailyEntry } from '../../stores/nutritionStore';
import { evaluate as evaluateBN } from '../../../engine/bayesianNutrition/index.js';

function w(date: string, kg: number): WeightEntry {
  return { date, kg, ts: Date.UTC(...(date.split('-').map(Number) as [number, number, number])) };
}
function d(dateISO: string, kcal: number | null): NutritionDailyEntry {
  return { dateISO, kcal, protein: null, ts: 0 };
}

// Forward-model redesign (2026-05-27): observatiile vin acum din TREND-ul de
// regresie liniara peste >=3 cantariri ce acopera >=7 zile (scale = calibrator
// lent). TDEE = avgIntake − panta(kg/zi) × 7700. Ferestrele scurte/zgomotoase
// nu mai produc observatii (anti fals-pozitiv).
describe('buildNutritionObservations — energy balance (trend, slow calibrator)', () => {
  it('returns [] cand < 3 cantariri (trend insuficient)', () => {
    expect(buildNutritionObservations([], [])).toEqual([]);
    expect(buildNutritionObservations([w('2026-05-01', 100)], [])).toEqual([]);
    // 2 cantariri = sub pragul de trend (cerem 3).
    expect(buildNutritionObservations([w('2026-05-01', 100), w('2026-05-11', 99)], [])).toEqual([]);
  });

  it('returns [] cand fereastra fara intake logat (nu inventam intake)', () => {
    const wl = [w('2026-05-01', 100), w('2026-05-08', 99.5), w('2026-05-15', 99)];
    expect(buildNutritionObservations(wl, [])).toEqual([]);
  });

  it('weight stable + intake 2000 → TDEE estimat ~= intake (panta ~0)', () => {
    const wl = [w('2026-05-01', 100), w('2026-05-08', 100), w('2026-05-15', 100)];
    const dl = [d('2026-05-03', 2000), d('2026-05-10', 2000)];
    const obs = buildNutritionObservations(wl, dl);
    expect(obs).toHaveLength(1);
    // panta=0 → TDEE = intake mediu = 2000.
    expect(obs[0]!.weightDelta).toBeCloseTo(2000, 0);
    expect(obs[0]!.kcalDaily).toBe(2000);
  });

  it('a slabit (trend descrescator) logand 2000 → TDEE PESTE 2000', () => {
    // 100→99→98 pe 20 zile = panta -0.1 kg/zi. TDEE = 2000 - (-0.1)×7700 = 2770.
    const wl = [w('2026-05-01', 100), w('2026-05-11', 99), w('2026-05-21', 98)];
    const dl = [d('2026-05-05', 2000), d('2026-05-15', 2000)];
    const obs = buildNutritionObservations(wl, dl);
    expect(obs).toHaveLength(1);
    expect(obs[0]!.weightDelta).toBeCloseTo(2000 + 0.1 * KCAL_PER_KG, 0);
    expect(obs[0]!.weightDelta).toBeGreaterThan(2000);
  });

  it('GRAIN OF SALT — trend crescator logand "deficit" → TDEE SUB log (sub-raportat)', () => {
    // 100→100.5→101 pe 20 zile = panta +0.05 kg/zi, logheaza 1800 (pretins deficit).
    // Cantarul spune ca a mancat mai mult: TDEE = 1800 - 0.05×7700 = 1800 - 385 = 1415.
    const wl = [w('2026-05-01', 100), w('2026-05-11', 100.5), w('2026-05-21', 101)];
    const dl = [d('2026-05-05', 1800), d('2026-05-15', 1800)];
    const obs = buildNutritionObservations(wl, dl);
    expect(obs).toHaveLength(1);
    expect(obs[0]!.weightDelta).toBeCloseTo(1800 - 0.05 * KCAL_PER_KG, 0);
    expect(obs[0]!.weightDelta).toBeLessThan(1800);
  });

  // SCALE FLAW FIXED — short/noisy windows produce NO observation.
  it('SCALE FLAW — fereastra de 2 zile cu swing de 4kg → ZERO observatie', () => {
    // Doua cantariri la 2 zile distanta, swing apa/glicogen 4kg. Vechiul model
    // point-to-point ar fi produs TDEE garbage (4×7700/2 = 15400 kcal). Acum:
    // span < 7 zile + < 3 cantariri → respins.
    const wl = [w('2026-05-01', 100), w('2026-05-03', 96)];
    const dl = [d('2026-05-01', 2000), d('2026-05-03', 2000)];
    expect(buildNutritionObservations(wl, dl)).toEqual([]);
  });

  it('SCALE FLAW — 3 cantariri pe span scurt (< 7 zile) → ZERO observatie', () => {
    // Span 4 zile (< MIN_WINDOW_DAYS 7) chiar cu 3 puncte → respins (zgomot zilnic).
    const wl = [w('2026-05-01', 100), w('2026-05-03', 104), w('2026-05-05', 99)];
    const dl = [d('2026-05-01', 2000), d('2026-05-03', 2000), d('2026-05-05', 2000)];
    expect(buildNutritionObservations(wl, dl)).toEqual([]);
  });

  it('SCALE FLAW — o singura zi cu swing 4kg in mijloc NU defineste trend-ul', () => {
    // Trend real plat (100→100), dar o citire aberanta de 104 la mijloc. Regresia
    // liniara o trateaza ca outlier (panta ~0), NU ca delta de 4kg. Estimarea
    // ramane langa intake (NU garbage). Vechiul point-to-point ar fi luat capetele.
    const wl = [
      w('2026-05-01', 100), w('2026-05-06', 104), w('2026-05-11', 100),
      w('2026-05-16', 100), w('2026-05-21', 100),
    ];
    const dl = [d('2026-05-05', 2000), d('2026-05-15', 2000)];
    const obs = buildNutritionObservations(wl, dl);
    expect(obs).toHaveLength(1);
    // Regresia trateaza 104 ca outlier (panta mica) → TDEE in banda rezonabila
    // langa intake (~2616), NU o estimare absurda. Vechiul point-to-point pe o
    // fereastra de o zi cu acest swing ar fi dat zeci de mii de kcal (garbage).
    expect(obs[0]!.weightDelta).toBeGreaterThan(1700);
    expect(obs[0]!.weightDelta).toBeLessThan(3500);
  });

  it('pure — input arrays NU mutate', () => {
    const wl = [w('2026-05-01', 100), w('2026-05-08', 99.5), w('2026-05-15', 99)];
    const dl = [d('2026-05-05', 2100)];
    const snapW = JSON.parse(JSON.stringify(wl));
    const snapD = JSON.parse(JSON.stringify(dl));
    buildNutritionObservations(wl, dl);
    expect(wl).toEqual(snapW);
    expect(dl).toEqual(snapD);
  });

  it('deterministic — acelasi input → acelasi output', () => {
    const wl = [w('2026-05-01', 100), w('2026-05-11', 99), w('2026-05-21', 98)];
    const dl = [d('2026-05-05', 2000), d('2026-05-15', 2000)];
    expect(buildNutritionObservations(wl, dl)).toEqual(buildNutritionObservations(wl, dl));
  });
});

describe('tierFromObservationCount (compat — builder emite acum <=1 obs)', () => {
  it('0-1 → T0, 2-4 → T1, 5+ → T2', () => {
    expect(tierFromObservationCount(0)).toBe('T0');
    expect(tierFromObservationCount(1)).toBe('T0');
    expect(tierFromObservationCount(2)).toBe('T1');
    expect(tierFromObservationCount(4)).toBe('T1');
    expect(tierFromObservationCount(5)).toBe('T2');
  });
});

describe('tierFromWeighInCount — scale = calibrator lent (cap T1)', () => {
  it('< 4 cantariri → T0 (prior-dominat, modelul forward conduce)', () => {
    expect(tierFromWeighInCount(0)).toBe('T0');
    expect(tierFromWeighInCount(3)).toBe('T0');
  });
  it('>= 4 cantariri → T1 (trend calibreaza lent) si NICIODATA T2 (scale nu domina)', () => {
    expect(tierFromWeighInCount(4)).toBe('T1');
    expect(tierFromWeighInCount(50)).toBe('T1'); // cap T1 — NU urca la T2 din scale
  });
});

describe('buildBayesianNutritionContext — demographic prior + floor', () => {
  it('maintenanceTDEE present → demographicMu set + floor feminin 1000', () => {
    const ctx = buildBayesianNutritionContext({
      weightLog: [],
      dailyLog: [],
      maintenanceTDEE: 1369,
      sex: 'f',
    });
    expect(ctx.meta?.demographicMu).toBe(1369);
    expect(ctx.meta?.kcalFloorMin).toBe(1000);
    expect(ctx.meta?.observations).toEqual([]);
  });

  it('floor masculin 1200', () => {
    const ctx = buildBayesianNutritionContext({
      weightLog: [], dailyLog: [], maintenanceTDEE: 2800, sex: 'm',
    });
    expect(ctx.meta?.kcalFloorMin).toBe(1200);
  });

  it('maintenanceTDEE null → demographicMu absent (cold start → engine tier none)', () => {
    const ctx = buildBayesianNutritionContext({
      weightLog: [], dailyLog: [], maintenanceTDEE: null, sex: null,
    });
    expect(ctx.meta?.demographicMu).toBeUndefined();
  });
});

describe('engine integration — demographic prior escapes tier none', () => {
  it('fresh user (0 obs) + demographicMu → tier MED + posterior.mu ~= maintenance (NU 2640 baseline)', async () => {
    const ctx = buildBayesianNutritionContext({
      weightLog: [], dailyLog: [], maintenanceTDEE: 1369, sex: 'f',
    });
    const r = await evaluateBN(ctx);
    expect(r.tier).not.toBe('none');
    const mu = r.meta?.nutrition_inference_metadata?.posterior?.mu;
    // 0 obs → posterior = prior = demographicMu (estimare per-user imediata).
    expect(mu).toBeCloseTo(1369, 0);
  });

  it('user cu istoric greutate+kcal → trend-ul nudge-uieste posterior-ul (calibrator lent)', async () => {
    // Prior forward-model 2600, trend real de slabire (100→96 pe 28 zile = panta
    // -0.1429 kg/zi @ 2000 intake) → TDEE ~3100 (a cheltuit peste ce a logat).
    // >=4 cantariri → T1 (trend-ul calibreaza, dar lent). Posterior se misca de
    // la prior CATRE observatie, fara sa o atinga (scale = nudge lent, NU driver).
    const wl = [
      w('2026-05-01', 100), w('2026-05-08', 99), w('2026-05-15', 98),
      w('2026-05-22', 97), w('2026-05-29', 96),
    ];
    const dl = [d('2026-05-05', 2000), d('2026-05-15', 2000), d('2026-05-25', 2000)];
    const ctx = buildBayesianNutritionContext({
      weightLog: wl, dailyLog: dl, maintenanceTDEE: 2600, sex: 'm',
      profileTier: tierFromWeighInCount(wl.length),
    });
    expect(ctx.profileTier).toBe('T1');
    const r = await evaluateBN(ctx);
    expect(r.tier).not.toBe('none');
    const mu = r.meta?.nutrition_inference_metadata?.posterior?.mu;
    const obs = buildNutritionObservations(wl, dl);
    const obsTdee = obs[0]!.weightDelta; // ~3100
    expect(obsTdee).toBeGreaterThan(2600);
    // posterior intre prior 2600 si observatia ~3100: s-a MUTAT de la prior-ul
    // forward CATRE estimarea cantar, fara overshoot (calibrator lent T1).
    expect(mu).toBeGreaterThan(2600);
    expect(mu as number).toBeLessThan(obsTdee);
  });
});
