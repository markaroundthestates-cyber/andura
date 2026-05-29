// ══ PROGRES STORE TESTS — latestBodyMeasurements aggregator (smoke #15) ══
// Smoke 2026-05-28: SettingsProfile (Cont) si BodyData (Progres) scriu in
// acelasi bodyData[] cu seturi diferite de campuri. Pana acum BF% citea doar
// `bodyData[length-1]` → cand ultima intrare (Progres) n-avea gat, BF% cadea
// pe Deurenberg desi gat-ul exista in istoric. Helper-ul agrega per camp
// peste TOATE intrarile pentru SSOT.

import { describe, it, expect } from 'vitest';
import { latestBodyMeasurements, type BodyDataEntry } from '../../stores/progresStore';

describe('latestBodyMeasurements — agregare per camp', () => {
  it('returneaza obiect gol pentru istoric vid', () => {
    expect(latestBodyMeasurements([])).toEqual({});
  });

  it('returneaza obiect gol cand intrari null/undefined defensiv', () => {
    // @ts-expect-error testam comportament defensiv
    expect(latestBodyMeasurements(undefined)).toEqual({});
  });

  it('pastreaza toate campurile dintr-o singura intrare', () => {
    const entries: BodyDataEntry[] = [
      { date: '2026-05-01', ts: 1, waistCm: 85, neckCm: 38, hipsCm: 95 },
    ];
    const r = latestBodyMeasurements(entries);
    expect(r.waistCm).toBe(85);
    expect(r.neckCm).toBe(38);
    expect(r.hipsCm).toBe(95);
  });

  it('cea mai recenta valoare castiga (sortat pe date)', () => {
    const entries: BodyDataEntry[] = [
      { date: '2026-05-01', ts: 1, waistCm: 90 },
      { date: '2026-05-10', ts: 2, waistCm: 85 },
    ];
    expect(latestBodyMeasurements(entries).waistCm).toBe(85);
  });

  it('campuri lipsa dintr-o intrare nu suprascriu valoarea anterioara (sync #15)', () => {
    // Scenariul Daniel: gat introdus 1 mai, sold introdus 10 mai (fara gat).
    // Gat-ul tot trebuie sa fie disponibil pentru BF%.
    const entries: BodyDataEntry[] = [
      { date: '2026-05-01', ts: 1, waistCm: 85, neckCm: 38 },
      { date: '2026-05-10', ts: 2, hipsCm: 95 },
    ];
    const r = latestBodyMeasurements(entries);
    expect(r.waistCm).toBe(85);
    expect(r.neckCm).toBe(38); // pastrat din intrarea mai veche
    expect(r.hipsCm).toBe(95);
  });

  // §progress-v2 — campurile CIRCUMFERINTA sterse (chest/biceps/thigh) raman
  // in JSON-ul vechi dar NU mai sunt citite (migration-safe, zero crash).
  it('ignora gratios campurile vechi de circumferinta (chest/biceps/thigh) din date legacy', () => {
    const entries = [
      // @ts-expect-error campuri legacy eliminate din schema
      { date: '2026-05-01', ts: 1, waistCm: 85, chestCm: 102, bicepsCm: 35, thighCm: 58 },
    ] as BodyDataEntry[];
    const r = latestBodyMeasurements(entries);
    expect(r.waistCm).toBe(85);
    expect((r as Record<string, unknown>).chestCm).toBeUndefined();
    expect((r as Record<string, unknown>).bicepsCm).toBeUndefined();
    expect((r as Record<string, unknown>).thighCm).toBeUndefined();
  });

  // §progress-v2 — skinfold caliper sites (mm) agregate ca orice camp.
  it('agrega skinfold sites (mm) per camp peste istoric', () => {
    const entries: BodyDataEntry[] = [
      { date: '2026-05-01', ts: 1, chestSkinfoldMm: 12, abdomenSkinfoldMm: 20 },
      { date: '2026-05-10', ts: 2, thighSkinfoldMm: 14 },
    ];
    const r = latestBodyMeasurements(entries);
    expect(r.chestSkinfoldMm).toBe(12);
    expect(r.abdomenSkinfoldMm).toBe(20);
    expect(r.thighSkinfoldMm).toBe(14);
  });

  it('cand un camp e completat in DOUA intrari, castiga cea mai recenta', () => {
    const entries: BodyDataEntry[] = [
      { date: '2026-05-01', ts: 1, waistCm: 90, neckCm: 38 },
      { date: '2026-05-10', ts: 2, waistCm: 85 }, // nou waist, gat omis
    ];
    const r = latestBodyMeasurements(entries);
    expect(r.waistCm).toBe(85); // mai recent
    expect(r.neckCm).toBe(38); // pastrat (nu re-completat)
  });

  it('ignora valori invalide (0 / NaN / negative) — defense in depth', () => {
    const entries: BodyDataEntry[] = [
      { date: '2026-05-01', ts: 1, waistCm: 85 },
      { date: '2026-05-10', ts: 2, waistCm: 0 }, // invalid
    ];
    expect(latestBodyMeasurements(entries).waistCm).toBe(85);
  });

  it('order in array NU conteaza — sortare pe data', () => {
    const entries: BodyDataEntry[] = [
      { date: '2026-05-10', ts: 2, waistCm: 85 },
      { date: '2026-05-01', ts: 1, waistCm: 90 },
    ];
    expect(latestBodyMeasurements(entries).waistCm).toBe(85);
  });

  it('cand date e gol, fallback pe ts pentru tie-break', () => {
    const entries: BodyDataEntry[] = [
      { date: '', ts: 1, waistCm: 90 },
      { date: '', ts: 2, waistCm: 85 },
    ];
    expect(latestBodyMeasurements(entries).waistCm).toBe(85);
  });

  it('expune cea mai recenta data pentru UI label', () => {
    const entries: BodyDataEntry[] = [
      { date: '2026-05-01', ts: 1, waistCm: 85 },
      { date: '2026-05-10', ts: 2, hipsCm: 95 },
    ];
    expect(latestBodyMeasurements(entries).date).toBe('2026-05-10');
  });
});
