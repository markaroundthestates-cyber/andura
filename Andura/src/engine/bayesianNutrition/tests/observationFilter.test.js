/**
 * Kcal Floor 1200 Observation Filter — invariant tests LOCK 8 LOCK V1.
 *
 * Authority: wiki/concepts/kcal-floor-1200-engine-filter LOCK V1 2026-05-14 +
 * wiki/concepts/pre-beta-full-scope-lock-v2 LOCK 8 cumulative.
 *
 * Daniel CEO directive verbatim chat birou 2026-05-14:
 *   "Daca user vrea sa puna sub 1200 kcal logate, mesaj ca minimul recomandat
 *    de institutil bla bla bla este de 1200 si ca andura nu o sa includa
 *    loguri mai mici pentru calculul obiectivelor si preconizari viitoare"
 *
 * Tests verify: defensive empty/null, boundary semantics (=floor allowed,
 * <floor excluded), forward-compatibility (no-kcalDaily pass-through),
 * mixed obs filtering, constant value exact, no-diacritics rule LOCK V1,
 * wording exact match, pure function determinism + immutability invariant.
 */

import { describe, it, expect } from 'vitest';

import {
  filterKcalFloorObservations,
  getKcalFloorInformativeMessage,
  getKcalFloorImportInformativeMessage,
} from '../observationFilter.js';
import {
  KCAL_FLOOR_DAILY_MIN,
  KCAL_FLOOR_CITATION_SOURCE,
} from '../constants.js';

describe('filterKcalFloorObservations — defensive input handling', () => {
  it('empty array → returns filtered=[] excludedCount=0', () => {
    const result = filterKcalFloorObservations([]);
    expect(result.filtered).toEqual([]);
    expect(result.excludedCount).toBe(0);
    expect(result.citationSource).toBe(KCAL_FLOOR_CITATION_SOURCE);
    expect(result.floorMin).toBe(KCAL_FLOOR_DAILY_MIN);
  });

  it('null input → defensive empty return NU throw', () => {
    expect(() => filterKcalFloorObservations(null)).not.toThrow();
    const result = filterKcalFloorObservations(null);
    expect(result.filtered).toEqual([]);
    expect(result.excludedCount).toBe(0);
  });

  it('undefined input → defensive empty return', () => {
    const result = filterKcalFloorObservations(undefined);
    expect(result.filtered).toEqual([]);
    expect(result.excludedCount).toBe(0);
  });

  it('non-array input → defensive empty return', () => {
    const result = filterKcalFloorObservations({ kcalDaily: 1500 });
    expect(result.filtered).toEqual([]);
    expect(result.excludedCount).toBe(0);
  });
});

describe('filterKcalFloorObservations — kcal floor threshold semantics', () => {
  it('kcalDaily 800 (sub floor) → excluded', () => {
    const obs = [{ kcalDaily: 800, weightDelta: -0.2 }];
    const result = filterKcalFloorObservations(obs);
    expect(result.filtered).toEqual([]);
    expect(result.excludedCount).toBe(1);
  });

  it('kcalDaily 1200 (exact floor) → included edge boundary >=floor', () => {
    const obs = [{ kcalDaily: 1200, weightDelta: -0.1 }];
    const result = filterKcalFloorObservations(obs);
    expect(result.filtered).toEqual(obs);
    expect(result.excludedCount).toBe(0);
  });

  it('kcalDaily 1199 (boundary -1) → excluded (strict <floor)', () => {
    const obs = [{ kcalDaily: 1199, weightDelta: -0.1 }];
    const result = filterKcalFloorObservations(obs);
    expect(result.filtered).toEqual([]);
    expect(result.excludedCount).toBe(1);
  });

  it('kcalDaily 1500 (above floor) → included', () => {
    const obs = [{ kcalDaily: 1500, weightDelta: 0.05 }];
    const result = filterKcalFloorObservations(obs);
    expect(result.filtered).toEqual(obs);
    expect(result.excludedCount).toBe(0);
  });
});

describe('filterKcalFloorObservations — forward compatibility', () => {
  it('observations fara kcalDaily field → pass-through unchanged (V1 weightDelta-only schema)', () => {
    const obs = [
      { weightDelta: -0.2 },
      { weightDelta: 0.1 },
      { weightDelta: -0.15 },
    ];
    const result = filterKcalFloorObservations(obs);
    expect(result.filtered).toEqual(obs);
    expect(result.excludedCount).toBe(0);
  });

  it('observations cu kcalDaily NaN → pass-through (defensive non-numeric)', () => {
    const obs = [{ kcalDaily: NaN, weightDelta: -0.2 }];
    const result = filterKcalFloorObservations(obs);
    expect(result.filtered).toEqual(obs);
    expect(result.excludedCount).toBe(0);
  });

  it('mixed observations: kcalDaily sub floor excluded, weightDelta-only pass-through preserved', () => {
    const obs = [
      { kcalDaily: 1500, weightDelta: -0.1 }, // included
      { kcalDaily: 900,  weightDelta: -0.3 }, // EXCLUDED (sub floor)
      { weightDelta: 0.05 },                  // pass-through (no kcalDaily)
      { kcalDaily: 1200, weightDelta: -0.2 }, // included (exact floor)
      { kcalDaily: 1199, weightDelta: -0.25 },// EXCLUDED (sub floor strict)
    ];
    const result = filterKcalFloorObservations(obs);
    expect(result.filtered.length).toBe(3);
    expect(result.excludedCount).toBe(2);
    // Excluded entries NOT present în filtered
    expect(result.filtered.some(o => o.kcalDaily === 900)).toBe(false);
    expect(result.filtered.some(o => o.kcalDaily === 1199)).toBe(false);
    // Pass-through obs fara kcalDaily preserved
    expect(result.filtered.some(o => o.weightDelta === 0.05 && o.kcalDaily == null)).toBe(true);
  });

  it('null entries within array → filtered out gracefully (defensive)', () => {
    const obs = [
      { kcalDaily: 1500, weightDelta: -0.1 },
      null,
      { weightDelta: 0.05 },
    ];
    const result = filterKcalFloorObservations(obs);
    expect(result.filtered.length).toBe(2);
    expect(result.filtered.includes(null)).toBe(false);
  });
});

describe('KCAL_FLOOR_DAILY_MIN + KCAL_FLOOR_CITATION_SOURCE constants', () => {
  it('KCAL_FLOOR_DAILY_MIN = 1200 exact value LOCK V1', () => {
    expect(KCAL_FLOOR_DAILY_MIN).toBe(1200);
  });

  it('KCAL_FLOOR_CITATION_SOURCE no-diacritics rule LOCK V1 PERMANENT 2026-05-10', () => {
    expect(KCAL_FLOOR_CITATION_SOURCE).not.toMatch(/[șțăâîȘȚĂÂÎ]/);
  });

  it('KCAL_FLOOR_CITATION_SOURCE non-empty string referencing scientific anchored source', () => {
    expect(typeof KCAL_FLOOR_CITATION_SOURCE).toBe('string');
    expect(KCAL_FLOOR_CITATION_SOURCE.length).toBeGreaterThan(5);
    expect(KCAL_FLOOR_CITATION_SOURCE).toMatch(/WHO/);
  });
});

describe('getKcalFloorInformativeMessage — forward-going UI consumer wording', () => {
  it('returns Romanian-first no-diacritics scientific anchored wording', () => {
    const msg = getKcalFloorInformativeMessage();
    expect(msg).not.toMatch(/[șțăâîȘȚĂÂÎ]/);
    expect(msg).toMatch(/Minimul recomandat/);
    expect(msg).toMatch(/1200 kcal\/zi/);
    expect(msg).toMatch(/Andura NU include loguri sub acest prag/);
  });

  it('embeds citation source + floor value exact', () => {
    const msg = getKcalFloorInformativeMessage();
    expect(msg.includes(KCAL_FLOOR_CITATION_SOURCE)).toBe(true);
    expect(msg.includes(String(KCAL_FLOOR_DAILY_MIN))).toBe(true);
  });

  it('pure function determinism: same call → identical output', () => {
    const a = getKcalFloorInformativeMessage();
    const b = getKcalFloorInformativeMessage();
    expect(a).toBe(b);
  });
});

describe('getKcalFloorImportInformativeMessage — count-aware import context wording', () => {
  it('returns Romanian-first no-diacritics wording (NO_DIACRITICS_RULE)', () => {
    const msg = getKcalFloorImportInformativeMessage(3);
    expect(msg).not.toMatch(/[șțăâîȘȚĂÂÎ]/);
  });

  it('embeds count param in wording (single day)', () => {
    const msg = getKcalFloorImportInformativeMessage(1);
    expect(msg).toMatch(/Am detectat 1 zile/);
  });

  it('embeds count param in wording (multiple days)', () => {
    const msg = getKcalFloorImportInformativeMessage(7);
    expect(msg).toMatch(/Am detectat 7 zile/);
  });

  it('references KCAL_FLOOR_DAILY_MIN threshold value exact', () => {
    const msg = getKcalFloorImportInformativeMessage(2);
    expect(msg.includes(String(KCAL_FLOOR_DAILY_MIN))).toBe(true);
    expect(msg).toMatch(/sub 1200 kcal/);
  });

  it('anti-paternalism preserved: wording confirms "Datele raman salvate"', () => {
    const msg = getKcalFloorImportInformativeMessage(5);
    expect(msg).toMatch(/Datele raman salvate/);
  });

  it('mentions calibration exclusion semantic for engine transparency', () => {
    const msg = getKcalFloorImportInformativeMessage(2);
    expect(msg).toMatch(/exclude/);
    expect(msg).toMatch(/calibrare/);
  });

  it('flags underreport possibility for user transparency (anti-paternalism)', () => {
    const msg = getKcalFloorImportInformativeMessage(4);
    expect(msg).toMatch(/underreport/);
  });

  it('pure function determinism: same count → identical output', () => {
    const a = getKcalFloorImportInformativeMessage(3);
    const b = getKcalFloorImportInformativeMessage(3);
    expect(a).toBe(b);
  });

  it('count = 0 edge case still produces valid wording (defensive)', () => {
    const msg = getKcalFloorImportInformativeMessage(0);
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
    expect(msg).toMatch(/Am detectat 0 zile/);
  });
});

describe('Pure function discipline ADR 026 §9 invariant', () => {
  it('filterKcalFloorObservations: same input → same output (deterministic)', () => {
    const obs = [
      { kcalDaily: 1500, weightDelta: -0.1 },
      { kcalDaily: 900,  weightDelta: -0.3 },
    ];
    const a = filterKcalFloorObservations(obs);
    const b = filterKcalFloorObservations(obs);
    expect(a.filtered).toEqual(b.filtered);
    expect(a.excludedCount).toBe(b.excludedCount);
  });

  it('filterKcalFloorObservations: input array NOT mutated (immutable invariant)', () => {
    const obs = [
      { kcalDaily: 1500, weightDelta: -0.1 },
      { kcalDaily: 900,  weightDelta: -0.3 },
      { weightDelta: 0.05 },
    ];
    const snapshot = JSON.parse(JSON.stringify(obs));
    filterKcalFloorObservations(obs);
    expect(obs).toEqual(snapshot);
    expect(obs.length).toBe(3);
  });

  it('filterKcalFloorObservations: result.filtered is NEW array reference (NU same as input)', () => {
    const obs = [{ kcalDaily: 1500, weightDelta: -0.1 }];
    const result = filterKcalFloorObservations(obs);
    expect(result.filtered).not.toBe(obs);
  });
});
