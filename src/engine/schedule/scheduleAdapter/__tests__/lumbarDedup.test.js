// R6d — cross-week lumbar redundancy dedup (Daniel coach audit 2026-06-10).
// The FIRST leg/posterior day of the week keeps its heavy hinge; a SUBSEQUENT
// one demotes the lumbar-hinge family so a non-hinge sibling leads. OFF → null.
// 2026-06-11 extension (Daniel live coach-review): the back-extension family is
// ALSO deduped across the week's BACK-capable days (pull/upper/back) — his real
// week stacked 45° Hyperextension Thu (pull) + Fri (upper) with the RDL on Sat.

import { describe, it, expect } from 'vitest';
import {
  lumbarDedupPenalties,
  mergePenalties,
  LUMBAR_HINGES,
  BACK_EXTENSION_FAMILY,
} from '../lumbarDedup.js';
import { clusterForDay } from '../frequencySplit.js';

const HINGE = new Set(['legs', 'lower', 'full']);
const BACK = new Set(['pull', 'upper', 'back']);
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

  it('logic holds across the week: hinge days dedup the hinge family, back days dedup the back-extension family', () => {
    let priorHinge = 0;
    let priorBack = 0;
    for (let d = 0; d < 7; d++) {
      if (!week5[d]) continue;
      const cluster = clusterForDay(week5, d, 'balanced', false);
      const res = call(d);
      const isHinge = HINGE.has(cluster);
      const isBack = BACK.has(cluster);
      if (isHinge && priorHinge >= 1) {
        expect(res, `day ${d} (${cluster}) should demote the hinge family`).not.toBeNull();
        expect(res['Romanian Deadlift']).toBe(1);
        expect(Object.keys(res).sort()).toEqual([...LUMBAR_HINGES].sort());
      } else if (isBack && priorBack >= 1) {
        // 2026-06-11: a SUBSEQUENT back-capable day demotes ONLY the back-extension
        // family (the deadlift family is never offered from the spate pool).
        expect(res, `day ${d} (${cluster}) should demote the back-extension family`).not.toBeNull();
        expect(res['45° Hyperextension']).toBe(1);
        expect(res['Romanian Deadlift']).toBeUndefined();
        expect(Object.keys(res).sort()).toEqual([...BACK_EXTENSION_FAMILY].sort());
      } else {
        expect(res, `day ${d} (${cluster}) should be a no-op`).toBeNull();
      }
      if (isHinge) priorHinge += 1;
      if (isBack) priorBack += 1;
    }
    // Sanity: the chosen week actually exercises BOTH branches (>=2 hinge days).
    expect(priorHinge).toBeGreaterThanOrEqual(2);
  });

  it('a push cluster today → null even with prior hinge/back days', () => {
    expect(lumbarDedupPenalties({
      flagOn: true, activeWeek: week5, dayIdx: 4, todayCluster: 'push',
      focusPreset: 'balanced', splitRebalance: false,
    })).toBeNull();
  });

  it("Daniel's real week (rest,rest + 4 training, v-taper): 1st back day keeps the hyperextension, 2nd demotes it, 1st hinge day keeps the RDL", () => {
    const danielWeek = [false, false, true, true, true, true, false];
    const at = (dayIdx) =>
      lumbarDedupPenalties({
        flagOn: true,
        activeWeek: danielWeek,
        dayIdx,
        todayCluster: clusterForDay(danielWeek, dayIdx, 'v-taper', false),
        focusPreset: 'v-taper',
        splitRebalance: false,
      });
    const clusters = danielWeek.map((on, d) =>
      on ? clusterForDay(danielWeek, d, 'v-taper', false) : null);
    const backDays = clusters.map((c, d) => (c && BACK.has(c) ? d : -1)).filter((d) => d >= 0);
    const hingeDays = clusters.map((c, d) => (c && HINGE.has(c) ? d : -1)).filter((d) => d >= 0);
    // The live bug shape needs >=2 back-capable days + a hinge day in the week.
    expect(backDays.length).toBeGreaterThanOrEqual(2);
    expect(hingeDays.length).toBeGreaterThanOrEqual(1);
    // First back-capable day keeps its (single) back-extension.
    expect(at(backDays[0])).toBeNull();
    // Every subsequent back-capable day demotes the family ("scoate hyperextension
    // de vineri") so a non-lumbar spate accessory leads.
    for (const d of backDays.slice(1)) {
      const res = at(d);
      expect(res).not.toBeNull();
      expect(res['45° Hyperextension']).toBe(1);
    }
    // The week's FIRST hinge day keeps its heavy hinge (RDL on Saturday stays).
    expect(at(hingeDays[0])).toBeNull();
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
