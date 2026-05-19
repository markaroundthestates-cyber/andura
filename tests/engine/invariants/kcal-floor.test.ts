// Track 7 §7.1 — LOCK 8 Kcal Floor 1200 invariants per ADR 018 +
// wiki/concepts/kcal-floor-1200-engine-filter LOCK V1 2026-05-14.
// Pure function — fast-check verifies invariants over arbitrary observations.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { filterKcalFloorObservations } from '../../../src/engine/bayesianNutrition/observationFilter.js';
import {
  KCAL_FLOOR_DAILY_MIN,
  KCAL_FLOOR_CITATION_SOURCE,
} from '../../../src/engine/bayesianNutrition/constants.js';

// Arbitrary observation generators — covers schema variants.
const obsWithKcal = fc.record({
  weightDelta: fc.double({ min: -2, max: 2, noNaN: true, noDefaultInfinity: true }),
  kcalDaily: fc.double({ min: 0, max: 4000, noNaN: true, noDefaultInfinity: true }),
});
const obsWithoutKcal = fc.record({
  weightDelta: fc.double({ min: -2, max: 2, noNaN: true, noDefaultInfinity: true }),
});
const obsArbitrary = fc.oneof(obsWithKcal, obsWithoutKcal);

describe('filterKcalFloorObservations — LOCK 8 invariants', () => {
  it('always returns citationSource === WHO + floorMin === 1200', () => {
    fc.assert(
      fc.property(fc.array(obsArbitrary, { maxLength: 100 }), (obs) => {
        const r = filterKcalFloorObservations(obs);
        return (
          r.citationSource === KCAL_FLOOR_CITATION_SOURCE &&
          r.floorMin === KCAL_FLOOR_DAILY_MIN &&
          r.floorMin === 1200
        );
      }),
      { numRuns: 500 },
    );
  });

  it('all filtered obs with finite kcalDaily have kcalDaily >= 1200', () => {
    fc.assert(
      fc.property(fc.array(obsArbitrary, { maxLength: 200 }), (obs) => {
        const r = filterKcalFloorObservations(obs);
        return r.filtered.every((o: { kcalDaily?: number }) => {
          if (o.kcalDaily == null) return true;
          if (!Number.isFinite(o.kcalDaily)) return true;
          return o.kcalDaily >= KCAL_FLOOR_DAILY_MIN;
        });
      }),
      { numRuns: 500 },
    );
  });

  it('observations without kcalDaily field always pass through', () => {
    fc.assert(
      fc.property(
        fc.array(obsWithoutKcal, { minLength: 1, maxLength: 100 }),
        (obs) => {
          const r = filterKcalFloorObservations(obs);
          return r.filtered.length === obs.length && r.excludedCount === 0;
        },
      ),
      { numRuns: 200 },
    );
  });

  it('excludedCount equals count of obs with kcalDaily strict-less-than 1200', () => {
    fc.assert(
      fc.property(fc.array(obsWithKcal, { maxLength: 200 }), (obs) => {
        const r = filterKcalFloorObservations(obs);
        const expectedExcluded = obs.filter(
          (o: { kcalDaily?: number }) => Number.isFinite(o.kcalDaily) && (o.kcalDaily as number) < KCAL_FLOOR_DAILY_MIN,
        ).length;
        return r.excludedCount === expectedExcluded;
      }),
      { numRuns: 500 },
    );
  });

  it('pure function — same input yields identical output (referential transparency)', () => {
    fc.assert(
      fc.property(fc.array(obsArbitrary, { maxLength: 50 }), (obs) => {
        const r1 = filterKcalFloorObservations(obs);
        const r2 = filterKcalFloorObservations(obs);
        return (
          r1.filtered.length === r2.filtered.length &&
          r1.excludedCount === r2.excludedCount &&
          r1.citationSource === r2.citationSource &&
          r1.floorMin === r2.floorMin
        );
      }),
      { numRuns: 200 },
    );
  });

  it('does NOT mutate input array', () => {
    fc.assert(
      fc.property(fc.array(obsWithKcal, { minLength: 1, maxLength: 50 }), (obs) => {
        const before = JSON.stringify(obs);
        filterKcalFloorObservations(obs);
        const after = JSON.stringify(obs);
        return before === after;
      }),
      { numRuns: 200 },
    );
  });

  it('handles non-array input gracefully (null/undefined/string/number)', () => {
    for (const bad of [null, undefined, 'string', 42, {}, true]) {
      const r = filterKcalFloorObservations(bad as never);
      expect(r.filtered).toEqual([]);
      expect(r.excludedCount).toBe(0);
      expect(r.floorMin).toBe(KCAL_FLOOR_DAILY_MIN);
    }
  });

  it('handles obs with null/undefined entries (filtered out, not counted)', () => {
    const obs = [
      { weightDelta: 0.1, kcalDaily: 2000 },
      null,
      undefined,
      { weightDelta: 0.2, kcalDaily: 800 },
    ];
    const r = filterKcalFloorObservations(obs as never);
    expect(r.filtered.length).toBe(1);
    expect(r.filtered[0]).toEqual({ weightDelta: 0.1, kcalDaily: 2000 });
    expect(r.excludedCount).toBe(1);
  });

  it('floor at exactly 1200 is included (>= boundary)', () => {
    const r = filterKcalFloorObservations([
      { weightDelta: 0.1, kcalDaily: 1200 },
      { weightDelta: 0.2, kcalDaily: 1199 },
      { weightDelta: 0.3, kcalDaily: 1201 },
    ]);
    expect(r.filtered.length).toBe(2);
    expect(r.excludedCount).toBe(1);
    expect(r.filtered.map((o: any) => o.kcalDaily)).toEqual([1200, 1201]);
  });
});
