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

describe('buildNutritionObservations — energy balance', () => {
  it('returns [] cand < 2 cantariri (nu putem forma fereastra)', () => {
    expect(buildNutritionObservations([], [])).toEqual([]);
    expect(buildNutritionObservations([w('2026-05-01', 100)], [])).toEqual([]);
  });

  it('returns [] cand fereastra fara intake logat (nu inventam intake)', () => {
    const wl = [w('2026-05-01', 100), w('2026-05-11', 99)];
    expect(buildNutritionObservations(wl, [])).toEqual([]);
  });

  it('weight stable + intake 2000 → TDEE estimat ~= intake (Δkg=0)', () => {
    const wl = [w('2026-05-01', 100), w('2026-05-11', 100)];
    const dl = [d('2026-05-03', 2000), d('2026-05-07', 2000)];
    const obs = buildNutritionObservations(wl, dl);
    expect(obs).toHaveLength(1);
    // Δkg=0 → TDEE = intake mediu = 2000.
    expect(obs[0]!.weightDelta).toBeCloseTo(2000, 0);
    expect(obs[0]!.kcalDaily).toBe(2000);
  });

  it('a slabit logand 2000 → TDEE estimat PESTE 2000 (a cheltuit mai mult)', () => {
    // 10 zile, -1kg logand 2000/zi. TDEE = 2000 - (-1×7700)/10 = 2000 + 770 = 2770.
    const wl = [w('2026-05-01', 100), w('2026-05-11', 99)];
    const dl = [d('2026-05-03', 2000), d('2026-05-09', 2000)];
    const obs = buildNutritionObservations(wl, dl);
    expect(obs).toHaveLength(1);
    expect(obs[0]!.weightDelta).toBeCloseTo(2000 + KCAL_PER_KG / 10, 0);
    expect(obs[0]!.weightDelta).toBeGreaterThan(2000);
  });

  it('GRAIN OF SALT — s-a ingrasat logand "deficit" → TDEE SUB log (sub-raportat)', () => {
    // 10 zile, +1kg dar logheaza doar 1800/zi (pretins deficit). Cantarul spune
    // ca a mancat de fapt mai mult: TDEE = 1800 - (1×7700)/10 = 1800 - 770 = 1030.
    // Estimarea coboara catre intake-ul REAL implicat de castig → log corectat.
    const wl = [w('2026-05-01', 100), w('2026-05-11', 101)];
    const dl = [d('2026-05-03', 1800), d('2026-05-09', 1800)];
    const obs = buildNutritionObservations(wl, dl);
    expect(obs).toHaveLength(1);
    expect(obs[0]!.weightDelta).toBeCloseTo(1800 - KCAL_PER_KG / 10, 0);
    expect(obs[0]!.weightDelta).toBeLessThan(1800);
  });

  it('pure — input arrays NU mutate', () => {
    const wl = [w('2026-05-01', 100), w('2026-05-11', 99)];
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

describe('tierFromObservationCount', () => {
  it('0-1 → T0, 2-4 → T1, 5+ → T2', () => {
    expect(tierFromObservationCount(0)).toBe('T0');
    expect(tierFromObservationCount(1)).toBe('T0');
    expect(tierFromObservationCount(2)).toBe('T1');
    expect(tierFromObservationCount(4)).toBe('T1');
    expect(tierFromObservationCount(5)).toBe('T2');
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

  it('user cu istoric greutate+kcal → posterior se rafineaza spre TDEE energy-balance', async () => {
    // Maintenance prior 2640 (gresit-flat), dar trend real arata TDEE ~2770.
    // Cu T1 (input-dominat) posterior se muta semnificativ spre observatii.
    const wl = [w('2026-05-01', 100), w('2026-05-11', 99), w('2026-05-21', 98)];
    const dl = [d('2026-05-05', 2000), d('2026-05-15', 2000)];
    const obs = buildNutritionObservations(wl, dl);
    const ctx = buildBayesianNutritionContext({
      weightLog: wl, dailyLog: dl, maintenanceTDEE: 2640, sex: 'm',
      profileTier: tierFromObservationCount(obs.length),
    });
    const r = await evaluateBN(ctx);
    expect(r.tier).not.toBe('none');
    const mu = r.meta?.nutrition_inference_metadata?.posterior?.mu;
    // Observatii ~2770 trag posterior-ul sub prior-ul gresit 2640? Nu — 2770>2640,
    // deci posterior intre 2640 si 2770, peste prior, sub observatii. Cheia:
    // posterior s-a MUTAT de la baseline-ul flat catre estimarea per-user reala.
    expect(mu).toBeGreaterThan(2640);
    expect(mu as number).toBeLessThanOrEqual(2770 + 1);
  });
});
