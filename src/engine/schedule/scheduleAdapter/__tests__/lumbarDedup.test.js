// R6d — cross-week lumbar redundancy dedup (Daniel coach audit 2026-06-10).
// The FIRST leg/posterior day of the week keeps its heavy hinge; a SUBSEQUENT
// one demotes the lumbar-hinge family so a non-hinge sibling leads. OFF → null.

import { describe, it, expect } from 'vitest';
import { lumbarDedupPenalties, mergePenalties, LUMBAR_HINGES } from '../lumbarDedup.js';
import { clusterForDay } from '../frequencySplit.js';

const HINGE = new Set(['legs', 'lower', 'full']);
// A 5-active-day week (Mon-Fri) — enough frequency to schedule 2+ leg/posterior days.
const week5 = [true, true, true, true, true, false, false];

const call = (dayIdx, over = {}) =>
  lumbarDedupPenalties({
    flagOn: true,
    activeWeek: week5,
    dayIdx,
    todayCluster: clusterForDay(week5, dayIdx, 'balanced', false),
    focusPreset: 'balanced',
    splitRebalance: false,
    ...over,
  });

describe('R6d — lumbarDedupPenalties', () => {
  it('OFF → null (byte-identical, never demotes)', () => {
    expect(call(0, { flagOn: false })).toBeNull();
  });

  it('logic holds across the week: demote IFF today is a hinge cluster AND a prior hinge day exists', () => {
    let priorHinge = 0;
    for (let d = 0; d < 7; d++) {
      if (!week5[d]) continue;
      const cluster = clusterForDay(week5, d, 'balanced', false);
      const res = call(d);
      const isHinge = HINGE.has(cluster);
      const shouldDemote = isHinge && priorHinge >= 1;
      if (shouldDemote) {
        expect(res, `day ${d} (${cluster}) should demote`).not.toBeNull();
        // The demote map covers the curated lumbar-hinge family.
        expect(res['Romanian Deadlift']).toBe(1);
        expect(Object.keys(res).sort()).toEqual([...LUMBAR_HINGES].sort());
      } else {
        expect(res, `day ${d} (${cluster}) should be a no-op`).toBeNull();
      }
      if (isHinge) priorHinge += 1;
    }
    // Sanity: the chosen week actually exercises BOTH branches (>=2 hinge days).
    expect(priorHinge).toBeGreaterThanOrEqual(2);
  });

  it('a non-hinge cluster today → null even with prior hinge days', () => {
    expect(lumbarDedupPenalties({
      flagOn: true, activeWeek: week5, dayIdx: 4, todayCluster: 'push',
      focusPreset: 'balanced', splitRebalance: false,
    })).toBeNull();
  });

  it('the FIRST hinge day (no prior) keeps its hinge → null', () => {
    expect(lumbarDedupPenalties({
      flagOn: true, activeWeek: [true, false, false, false, false, false, false],
      dayIdx: 0, todayCluster: 'legs', focusPreset: 'balanced', splitRebalance: false,
    })).toBeNull();
  });
});

describe('R6d — mergePenalties', () => {
  it('null-safe both directions', () => {
    expect(mergePenalties(null, null)).toBeNull();
    expect(mergePenalties({ A: 1 }, null)).toEqual({ A: 1 });
    expect(mergePenalties(null, { B: 1 })).toEqual({ B: 1 });
  });

  it('MAX-merges overlapping keys (a pain-flagged hinge stays demoted)', () => {
    expect(mergePenalties({ 'Romanian Deadlift': 0.5, X: 0.3 }, { 'Romanian Deadlift': 1, Y: 0.6 }))
      .toEqual({ 'Romanian Deadlift': 1, X: 0.3, Y: 0.6 });
  });
});
