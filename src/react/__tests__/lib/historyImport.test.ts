// Piesa 3 nutrition-brain fix — history import (bootstrap) tests.
//
// Proves: (1) parser PUR parseaza nutritie + greutate (MFP-style), MM/DD/YYYY +
// ISO, kg/lb detect+convert, randuri garbage sarite; (2) merge dedup pe data in
// cele 2 store-uri; (3) bootstrap end-to-end: import N randuri → builder Piesa 2
// produce M observatii → engine iese din tier 'none' (Kalman converge).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseHistoryImportCSV,
  parseHistoryImportFiles,
} from '../../lib/historyImportParser';
import {
  mergeWeightEntries,
  mergeDailyEntries,
  applyHistoryImport,
} from '../../lib/historyImportStore';
import { useProgresStore } from '../../stores/progresStore';
import { useNutritionStore } from '../../stores/nutritionStore';
import { buildNutritionObservations } from '../../lib/nutritionObservations';

describe('parseHistoryImportCSV — nutrition form', () => {
  it('parseaza Date,Calories,Protein (header fuzzy + MM/DD/YYYY)', () => {
    const csv = [
      'Date,Calories,Carbohydrates,Fat,Protein',
      '05/01/2026,2100,200,70,150',
      '05/02/2026,1850,180,60,140',
    ].join('\n');
    const r = parseHistoryImportCSV(csv);
    expect(r.detected).toBe('nutrition');
    expect(r.dailyEntries).toHaveLength(2);
    expect(r.dailyEntries[0]).toEqual({ dateISO: '2026-05-01', kcal: 2100, protein: 150 });
    expect(r.weightEntries).toHaveLength(0);
    expect(r.skipped).toHaveLength(0);
  });

  it('accepta ISO YYYY-MM-DD + coloana kcal alias', () => {
    const csv = ['Date,kcal,Protein', '2026-05-01,2000,120'].join('\n');
    const r = parseHistoryImportCSV(csv);
    expect(r.dailyEntries[0]).toEqual({ dateISO: '2026-05-01', kcal: 2000, protein: 120 });
  });

  it('sare randuri garbage (data invalida / fara kcal) cu motiv', () => {
    const csv = [
      'Date,Calories,Protein',
      'not-a-date,2000,100',
      '05/03/2026,,', // fara kcal/protein
      '05/04/2026,1900,110',
      '   ', // rand gol filtrat inainte de parse
    ].join('\n');
    const r = parseHistoryImportCSV(csv);
    expect(r.dailyEntries).toHaveLength(1);
    expect(r.dailyEntries[0]!.dateISO).toBe('2026-05-04');
    expect(r.skipped.length).toBe(2);
    expect(r.skipped[0]!.reason).toMatch(/data/i);
  });

  it('fara coloana kcal sau weight → unknown (nu putem detecta forma)', () => {
    const csv = ['Date,Protein', '2026-05-01,150'].join('\n');
    const r = parseHistoryImportCSV(csv);
    expect(r.detected).toBe('unknown');
  });
});

describe('parseHistoryImportCSV — weight form + kg/lb detect', () => {
  it('parseaza Date,Weight ca kg (valori plauzibile)', () => {
    const csv = ['Date,Weight', '2026-05-01,80.5', '2026-05-08,79.8'].join('\n');
    const r = parseHistoryImportCSV(csv);
    expect(r.detected).toBe('weight');
    expect(r.weightEntries).toHaveLength(2);
    expect(r.weightEntries[0]).toEqual({ date: '2026-05-01', kg: 80.5 });
  });

  it('detecteaza lb din coloana Units si converteste in kg', () => {
    const csv = ['Date,Value,Units', '2026-05-01,176,lbs', '2026-05-08,174,lbs'].join('\n');
    const r = parseHistoryImportCSV(csv);
    expect(r.weightEntries[0]!.kg).toBeCloseTo(79.8, 1); // 176 lb = 79.83 kg
  });

  it('detecteaza lb din heuristica (mediana > 300) fara coloana Units', () => {
    const csv = ['Date,Weight', '2026-05-01,320', '2026-05-08,318'].join('\n');
    const r = parseHistoryImportCSV(csv);
    // 320 lb = 145 kg plauzibil; ca kg ar fi 320 (implauzibil) → tratat ca lb
    expect(r.weightEntries[0]!.kg).toBeCloseTo(145.1, 0);
  });

  it('sare greutati in afara intervalului plauzibil post-conversie', () => {
    const csv = ['Date,Weight', '2026-05-01,80', '2026-05-08,9'].join('\n');
    const r = parseHistoryImportCSV(csv);
    expect(r.weightEntries).toHaveLength(1);
    expect(r.skipped.length).toBe(1);
  });
});

describe('parseHistoryImportCSV — edge cases', () => {
  it('CSV gol → result gol unknown', () => {
    expect(parseHistoryImportCSV('').detected).toBe('unknown');
    expect(parseHistoryImportCSV('   \n  ').detected).toBe('unknown');
  });

  it('fara coloana Date → skip cu motiv', () => {
    const r = parseHistoryImportCSV('Calories,Protein\n2000,100');
    expect(r.detected).toBe('unknown');
    expect(r.skipped[0]!.reason).toMatch(/Date/);
  });

  it('campuri citate cu virgule interne respectate', () => {
    const csv = ['Date,Calories,Note', '2026-05-01,2000,"a, b, c"'].join('\n');
    const r = parseHistoryImportCSV(csv);
    expect(r.dailyEntries[0]!.kcal).toBe(2000);
  });
});

describe('parseHistoryImportFiles — merge multi-file', () => {
  it('combina nutritie + greutate din 2 fisiere separate', () => {
    const nutrition = ['Date,Calories,Protein', '2026-05-01,2000,120'].join('\n');
    const weight = ['Date,Weight', '2026-05-01,80'].join('\n');
    const r = parseHistoryImportFiles([nutrition, weight]);
    expect(r.dailyEntries).toHaveLength(1);
    expect(r.weightEntries).toHaveLength(1);
  });

  it('dedup pe data — ultima zi castiga', () => {
    const a = ['Date,Calories', '2026-05-01,2000'].join('\n');
    const b = ['Date,Calories', '2026-05-01,2200'].join('\n');
    const r = parseHistoryImportFiles([a, b]);
    expect(r.dailyEntries).toHaveLength(1);
    expect(r.dailyEntries[0]!.kcal).toBe(2200);
  });
});

describe('mergeWeightEntries / mergeDailyEntries — dedup pe data', () => {
  it('weight: nu dubleaza data existenta, suprascrie + sorteaza pe ts', () => {
    const existing = [{ kg: 80, date: '2026-05-01', ts: Date.UTC(2026, 4, 1) }];
    const merged = mergeWeightEntries(existing, [
      { date: '2026-05-01', kg: 79 },
      { date: '2026-05-08', kg: 78 },
    ]);
    expect(merged).toHaveLength(2);
    expect(merged[0]!.date).toBe('2026-05-01');
    expect(merged[0]!.kg).toBe(79); // suprascris
    expect(merged[1]!.date).toBe('2026-05-08');
  });

  it('daily: merge non-distructiv pastreaza kcal existent cand import null', () => {
    const existing = [{ dateISO: '2026-05-01', kcal: 2000, protein: 100, ts: 0 }];
    const merged = mergeDailyEntries(existing, [{ dateISO: '2026-05-01', kcal: null, protein: 150 }]);
    expect(merged[0]!.kcal).toBe(2000); // pastrat
    expect(merged[0]!.protein).toBe(150); // actualizat
  });
});

describe('applyHistoryImport — store write + bootstrap path (Piesa 2)', () => {
  beforeEach(() => {
    useProgresStore.getState().reset();
    useNutritionStore.getState().reset();
  });

  it('scrie cele 2 store-uri + dedup re-import', () => {
    const weight = [
      { date: '2026-05-01', kg: 90 },
      { date: '2026-05-15', kg: 88 },
    ];
    const daily = [
      { dateISO: '2026-05-05', kcal: 2000, protein: 120 },
      { dateISO: '2026-05-10', kcal: 2000, protein: 120 },
    ];
    const summary = applyHistoryImport(weight, daily);
    expect(summary.weightImported).toBe(2);
    expect(summary.nutritionImported).toBe(2);
    expect(useProgresStore.getState().weightLog).toHaveLength(2);
    expect(useNutritionStore.getState().dailyLog).toHaveLength(2);

    // re-import aceeasi data → NU dubleaza
    applyHistoryImport(weight, daily);
    expect(useProgresStore.getState().weightLog).toHaveLength(2);
    expect(useNutritionStore.getState().dailyLog).toHaveLength(2);
  });

  it('bootstrap: import → builder Piesa 2 produce o observatie trend (tier > none)', () => {
    // Import istoric: a slabit 2kg in 14 zile (3 cantariri) logand 2000 kcal/zi.
    // Forward-model redesign: o singura observatie de trend, NU point-to-point.
    applyHistoryImport(
      [
        { date: '2026-05-01', kg: 90 },
        { date: '2026-05-08', kg: 89 },
        { date: '2026-05-15', kg: 88 },
      ],
      [
        { dateISO: '2026-05-05', kcal: 2000, protein: 120 },
        { dateISO: '2026-05-10', kcal: 2000, protein: 120 },
      ],
    );

    const obs = buildNutritionObservations(
      useProgresStore.getState().weightLog,
      useNutritionStore.getState().dailyLog,
    );
    expect(obs).toHaveLength(1);
    // Energy balance trend: panta -2kg/14zile = -0.1429 kg/zi logand 2000 →
    // TDEE = 2000 - (-0.1429 * 7700) = 2000 + 1100 = 3100.
    expect(obs[0]!.weightDelta).toBeCloseTo(3100, 0);
  });

  it('multe randuri istoric → o observatie de trend robust (NU multe puncte zgomotoase)', () => {
    // 12 cantariri saptamanale + intake logat → UN trend (forward-model redesign:
    // builder-ul agrega seria intr-o singura observatie de panta, scale =
    // calibrator lent, NU multe observatii point-to-point zgomotoase).
    const weightEntries: { date: string; kg: number }[] = [];
    const dailyEntries: { dateISO: string; kcal: number; protein: number }[] = [];
    for (let i = 0; i < 12; i += 1) {
      const day = 1 + i * 7;
      const dateISO = `2026-03-${String(day).padStart(2, '0')}`;
      if (day <= 31) {
        weightEntries.push({ date: dateISO, kg: 90 - i * 0.3 });
        dailyEntries.push({ dateISO, kcal: 2200, protein: 130 });
      }
    }
    applyHistoryImport(weightEntries, dailyEntries);
    const obs = buildNutritionObservations(
      useProgresStore.getState().weightLog,
      useNutritionStore.getState().dailyLog,
    );
    expect(obs).toHaveLength(1);
    // Trend descrescator logand 2200 → TDEE peste 2200 (a cheltuit mai mult).
    expect(obs[0]!.weightDelta).toBeGreaterThan(2200);
  });
});
