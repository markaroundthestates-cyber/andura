import { describe, it, expect } from 'vitest';
import {
  MMI_LOOKUP_TABLE,
  getMmiBucketForPauseMonths,
  computeMmiStartingWeight,
  computeMmiBoostMultiplier,
  shouldShowMmiPrompt,
} from '../muscleMemoryIndex.js';

describe('MMI_LOOKUP_TABLE — frozen + spec verbatim', () => {
  it('buckets array is frozen + each bucket frozen', () => {
    expect(Object.isFrozen(MMI_LOOKUP_TABLE)).toBe(true);
    expect(Object.isFrozen(MMI_LOOKUP_TABLE.buckets)).toBe(true);
    expect(Object.isFrozen(MMI_LOOKUP_TABLE.buckets[0])).toBe(true);
  });

  it('bucket 1: 6-12 luni → 0.80× start, 1.25× boost', () => {
    const b = MMI_LOOKUP_TABLE.buckets[0];
    expect(b.minMonths).toBe(6);
    expect(b.maxMonths).toBe(12);
    expect(b.startMultiplier).toBe(0.80);
    expect(b.boostMultiplier).toBe(1.25);
    expect(b.boostWeeksDuration).toBe(3);
  });

  it('bucket 2: 12-24 luni → 0.70× start, 1.10× boost', () => {
    const b = MMI_LOOKUP_TABLE.buckets[1];
    expect(b.minMonths).toBe(12);
    expect(b.maxMonths).toBe(24);
    expect(b.startMultiplier).toBe(0.70);
    expect(b.boostMultiplier).toBe(1.10);
  });

  it('bucket 3: 24+ luni → 0.60× start, 1.00× boost (no boost — start proaspat)', () => {
    const b = MMI_LOOKUP_TABLE.buckets[2];
    expect(b.minMonths).toBe(24);
    expect(b.maxMonths).toBe(Infinity);
    expect(b.startMultiplier).toBe(0.60);
    expect(b.boostMultiplier).toBe(1.00);
  });

  it('thresholdMonthsMin = 6 per spec §32.2', () => {
    expect(MMI_LOOKUP_TABLE.thresholdMonthsMin).toBe(6);
  });
});

describe('getMmiBucketForPauseMonths() — boundary mapping', () => {
  it('5.99 months → null (under threshold)', () => {
    expect(getMmiBucketForPauseMonths(5.99)).toBeNull();
  });

  it('6 months → bucket 1 (6-12)', () => {
    expect(getMmiBucketForPauseMonths(6).startMultiplier).toBe(0.80);
  });

  it('11.99 months → bucket 1 (still 6-12)', () => {
    expect(getMmiBucketForPauseMonths(11.99).startMultiplier).toBe(0.80);
  });

  it('12 months → bucket 2 (12-24)', () => {
    expect(getMmiBucketForPauseMonths(12).startMultiplier).toBe(0.70);
  });

  it('23.99 months → bucket 2 (still 12-24)', () => {
    expect(getMmiBucketForPauseMonths(23.99).startMultiplier).toBe(0.70);
  });

  it('24 months → bucket 3 (24+)', () => {
    expect(getMmiBucketForPauseMonths(24).startMultiplier).toBe(0.60);
  });

  it('120 months (10 years) → bucket 3', () => {
    expect(getMmiBucketForPauseMonths(120).startMultiplier).toBe(0.60);
  });

  it('non-numeric / NaN / negative → null', () => {
    expect(getMmiBucketForPauseMonths(undefined)).toBeNull();
    expect(getMmiBucketForPauseMonths(null)).toBeNull();
    expect(getMmiBucketForPauseMonths(NaN)).toBeNull();
    expect(getMmiBucketForPauseMonths(-1)).toBeNull();
    expect(getMmiBucketForPauseMonths('6')).toBeNull();
  });
});

describe('computeMmiStartingWeight() — formula §32.1', () => {
  it('peak=100 + pauseMonths=8 → 80 kg (×0.80)', () => {
    const r = computeMmiStartingWeight(100, 8);
    expect(r.startKg).toBeCloseTo(80, 5);
    expect(r.multiplier).toBe(0.80);
  });

  it('peak=100 + pauseMonths=18 → 70 kg (×0.70)', () => {
    const r = computeMmiStartingWeight(100, 18);
    expect(r.startKg).toBeCloseTo(70, 5);
  });

  it('peak=100 + pauseMonths=36 → 60 kg (×0.60)', () => {
    const r = computeMmiStartingWeight(100, 36);
    expect(r.startKg).toBeCloseTo(60, 5);
  });

  it('peak=0 or negative → null', () => {
    expect(computeMmiStartingWeight(0, 8)).toBeNull();
    expect(computeMmiStartingWeight(-10, 8)).toBeNull();
  });

  it('peak undefined/NaN → null', () => {
    expect(computeMmiStartingWeight(undefined, 8)).toBeNull();
    expect(computeMmiStartingWeight(NaN, 8)).toBeNull();
  });

  it('pauseMonths < 6 → null (under threshold)', () => {
    expect(computeMmiStartingWeight(100, 3)).toBeNull();
  });

  it('returns bucket reference for downstream consumers', () => {
    const r = computeMmiStartingWeight(100, 8);
    expect(r.bucket.boostMultiplier).toBe(1.25);
  });
});

describe('computeMmiBoostMultiplier() — boost duration', () => {
  it('week 0 + pauseMonths=8 → 1.25× boost', () => {
    expect(computeMmiBoostMultiplier(0, 8)).toBe(1.25);
  });

  it('week 1 + pauseMonths=8 → 1.25× boost (still in window)', () => {
    expect(computeMmiBoostMultiplier(1, 8)).toBe(1.25);
  });

  it('week 2 + pauseMonths=8 → 1.25× boost (last boosted week)', () => {
    expect(computeMmiBoostMultiplier(2, 8)).toBe(1.25);
  });

  it('week 3 + pauseMonths=8 → 1.0 (boost ended)', () => {
    expect(computeMmiBoostMultiplier(3, 8)).toBe(1.0);
  });

  it('week 100 + any → 1.0', () => {
    expect(computeMmiBoostMultiplier(100, 8)).toBe(1.0);
  });

  it('pauseMonths=36 (24+) → 1.00 boost even week 0 (start proaspat)', () => {
    expect(computeMmiBoostMultiplier(0, 36)).toBe(1.00);
  });

  it('pauseMonths < 6 → 1.0 (no bucket)', () => {
    expect(computeMmiBoostMultiplier(0, 3)).toBe(1.0);
  });

  it('negative week → 1.0', () => {
    expect(computeMmiBoostMultiplier(-1, 8)).toBe(1.0);
  });
});

describe('shouldShowMmiPrompt() — decision matrix', () => {
  it('not yet prompted + pauseMonths>=6 + no choice → true', () => {
    expect(shouldShowMmiPrompt(8, false, null)).toBe(true);
  });

  it('already prompted this session → false', () => {
    expect(shouldShowMmiPrompt(8, true, null)).toBe(false);
  });

  it('userChoice="accepted" → false', () => {
    expect(shouldShowMmiPrompt(8, false, 'accepted')).toBe(false);
  });

  it('userChoice="refused" → false (respects user decision)', () => {
    expect(shouldShowMmiPrompt(8, false, 'refused')).toBe(false);
  });

  it('pauseMonths < 6 → false (under threshold)', () => {
    expect(shouldShowMmiPrompt(3, false, null)).toBe(false);
  });

  it('invalid pauseMonths → false (safe default)', () => {
    expect(shouldShowMmiPrompt(NaN, false, null)).toBe(false);
    expect(shouldShowMmiPrompt(undefined, false, null)).toBe(false);
  });
});

describe('Purity invariants', () => {
  it('same input → same output (ADR 018 §2)', () => {
    expect(computeMmiStartingWeight(100, 8)).toEqual(computeMmiStartingWeight(100, 8));
    expect(computeMmiBoostMultiplier(1, 8)).toBe(computeMmiBoostMultiplier(1, 8));
    expect(shouldShowMmiPrompt(8, false, null)).toBe(shouldShowMmiPrompt(8, false, null));
  });

  it('lookup table mutation attempt fails silently (frozen)', () => {
    expect(() => { 'use strict'; MMI_LOOKUP_TABLE.thresholdMonthsMin = 1; }).toThrow();
  });
});

// ══ §23-H3 BOOST DECAY RE-RESUME CAP STABILITY ══════════════════════════════
// ADR 033 §32.1 invariant: boost active weeks 0..2 then decays to 1.0 forever.
// Sweeps the full trajectory + asserts the cap holds stable across all buckets.
describe('§23-H3 boost decay trajectory + re-resume cap stability', () => {
  it('bucket 1 (6-12 mo): boost 1.25× sustained weeks 0-2, decays to 1.0 from week 3 onward', () => {
    const trajectory = [];
    for (let w = 0; w <= 10; w += 1) {
      trajectory.push(computeMmiBoostMultiplier(w, 8));
    }
    // Weeks 0,1,2 boosted 1.25; weeks 3-10 decayed to 1.0
    expect(trajectory.slice(0, 3)).toEqual([1.25, 1.25, 1.25]);
    expect(trajectory.slice(3)).toEqual([1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
  });

  it('bucket 2 (12-24 mo): boost 1.10× sustained weeks 0-2, decays to 1.0 from week 3', () => {
    const trajectory = [];
    for (let w = 0; w <= 5; w += 1) {
      trajectory.push(computeMmiBoostMultiplier(w, 18));
    }
    expect(trajectory).toEqual([1.10, 1.10, 1.10, 1.0, 1.0, 1.0]);
  });

  it('bucket 3 (24+ mo): no boost — multiplier 1.0 stable across entire trajectory', () => {
    const trajectory = [];
    for (let w = 0; w <= 10; w += 1) {
      trajectory.push(computeMmiBoostMultiplier(w, 36));
    }
    expect(trajectory.every(m => m === 1.0)).toBe(true);
  });

  it('starting weight cap stable — peak × startMultiplier independent of week (decay only affects boost)', () => {
    // The "cap" = peak × startMultiplier (ceiling pe re-resume), boost multiplies on top
    // temporary. After boost decays, returned kg = peak × startMultiplier (stable forever).
    const peak = 100;
    const pauseMonths = 8;  // bucket 1, startMultiplier 0.80, boost 1.25 weeks 0-2

    // Effective weight = startKg × boostMultiplier; cap (post-boost) = 80
    const startKg = computeMmiStartingWeight(peak, pauseMonths).startKg;
    expect(startKg).toBeCloseTo(80, 5);  // cap

    // Trajectory: weeks 0-2 boosted = 100; weeks 3+ = 80 stable forever (cap)
    const effectiveWeights = [];
    for (let w = 0; w <= 8; w += 1) {
      effectiveWeights.push(startKg * computeMmiBoostMultiplier(w, pauseMonths));
    }
    expect(effectiveWeights[0]).toBeCloseTo(100, 5);  // 80 × 1.25
    expect(effectiveWeights[2]).toBeCloseTo(100, 5);  // last boost week
    // Weeks 3+ all equal to cap (80) — stable, no drift
    for (let w = 3; w <= 8; w += 1) {
      expect(effectiveWeights[w]).toBeCloseTo(80, 5);
    }
  });

  it('boost decay is idempotent — repeated calls same week return same multiplier (no internal state)', () => {
    // §23-H3 stability invariant: multiplier is pure, NU drift across invocations
    for (let w = 0; w <= 10; w += 1) {
      const a = computeMmiBoostMultiplier(w, 8);
      const b = computeMmiBoostMultiplier(w, 8);
      const c = computeMmiBoostMultiplier(w, 8);
      expect(a).toBe(b);
      expect(b).toBe(c);
    }
  });

  it('post-boost cap immune to peak edge cases (very high peak does NOT unlock unbounded growth)', () => {
    // Even peak=500 → cap=400 (500×0.80), boost peak=500 (500×0.80×1.25), then back to 400
    const peak = 500;
    const startKg = computeMmiStartingWeight(peak, 8).startKg;
    expect(startKg).toBeCloseTo(400, 5);
    expect(startKg * computeMmiBoostMultiplier(0, 8)).toBeCloseTo(500, 5);  // boost week, NU exceed peak
    expect(startKg * computeMmiBoostMultiplier(3, 8)).toBeCloseTo(400, 5);  // post-decay cap
    expect(startKg * computeMmiBoostMultiplier(100, 8)).toBeCloseTo(400, 5);  // far future, still cap
  });
});
