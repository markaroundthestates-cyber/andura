// ══ #42 progression signal — unit tests ══════════════════════════════════════
// Proves the CONDITIONAL bonus precondition: a real upward trend → progressing;
// a flat / regressing series → NOT progressing (the historical-refusal guard, so a
// stagnant logged lift never earns the boost); one bad day does not break a climb.
// test-real-values: the anchor series are the founder's real Cable Row numbers.

import { describe, it, expect } from 'vitest';
import {
  isProgressing,
  progressingNames,
  e1rmSeries,
  TREND_WINDOW,
  MIN_EXPOSURES,
} from '../progressionSignal.js';

// dp.js's exact e1RM shape (RIR-corrected, saturated Epley) so the test measures the
// SAME currency production does. Newest-first rows (DP.getLogs order).
const e1 = (w, reps, rpe) => {
  if (!(w > 0) || !(reps > 0)) return null;
  const rir = rpe >= 8.5 ? 0 : rpe >= 7.5 ? 1 : 3;
  return w * (1 + Math.min(12, reps + rir) / 30);
};
// Build newest-first rows from a chronological (oldest→newest) weight series at a
// fixed rep/rpe — the realistic "same reps, climbing load" progression shape.
const rowsFromWeights = (weights, reps = 10, rpe = 7.5) =>
  weights
    .map((w, i) => ({ w, reps, rpe, ts: (i + 1) * 86400000 }))
    .reverse(); // newest-first

describe('isProgressing — real upward trend → true', () => {
  it('Cable Row 64→68→73→77 (the anchor) is progressing', () => {
    expect(isProgressing(rowsFromWeights([64, 68, 73, 77]), e1)).toBe(true);
  });

  it('works with the inline Epley fallback (no closure injected)', () => {
    expect(isProgressing(rowsFromWeights([64, 68, 73, 77]))).toBe(true);
  });

  it('a climb via REPS at a fixed load (e1RM rising) is progressing', () => {
    // 60kg × 8 → 10 → 12 → 13: load flat, e1RM climbs through the rep gains.
    const rows = [
      { w: 60, reps: 13, rpe: 7.5, ts: 4 * 86400000 },
      { w: 60, reps: 12, rpe: 7.5, ts: 3 * 86400000 },
      { w: 60, reps: 10, rpe: 7.5, ts: 2 * 86400000 },
      { w: 60, reps: 8, rpe: 7.5, ts: 1 * 86400000 },
    ];
    expect(isProgressing(rows, e1)).toBe(true);
  });
});

describe('isProgressing — flat / regression → false (historical-refusal guard)', () => {
  it('a flat series (same load, same reps) is NOT progressing', () => {
    expect(isProgressing(rowsFromWeights([60, 60, 60, 60]), e1)).toBe(false);
  });

  it('a regressing series is NOT progressing', () => {
    expect(isProgressing(rowsFromWeights([77, 73, 68, 64]), e1)).toBe(false);
  });

  it('thin history (< MIN_EXPOSURES distinct sets) is NOT progressing', () => {
    expect(MIN_EXPOSURES).toBeGreaterThanOrEqual(3);
    expect(isProgressing(rowsFromWeights([64, 70]), e1)).toBe(false);
    expect(isProgressing([], e1)).toBe(false);
  });
});

describe('isProgressing — 1-day noise does not break a trend', () => {
  it('a single down day at the END does not erase a climb', () => {
    // 64→68→73→77 then one bad day 74 (slightly off). Still progressing — the
    // recent-half MAX (77) clears the oldest (64) by > threshold.
    expect(isProgressing(rowsFromWeights([64, 68, 73, 77, 74]), e1)).toBe(true);
  });

  it('a single dip in the MIDDLE of a climb does not break it', () => {
    expect(isProgressing(rowsFromWeights([64, 68, 65, 73, 77]), e1)).toBe(true);
  });

  it('caps the window to the most-recent TREND_WINDOW exposures', () => {
    // An ancient strong run followed by a long flat run: only the recent window is
    // judged, so the ancient strength does NOT keep it "progressing" forever.
    const flatTail = Array.from({ length: TREND_WINDOW }, () => 60);
    const rows = rowsFromWeights([90, 90, ...flatTail]);
    expect(isProgressing(rows, e1)).toBe(false);
  });
});

describe('e1rmSeries — chronological, capped, skips unusable rows', () => {
  it('returns oldest→newest and drops rows with no usable load/reps', () => {
    const rows = [
      { w: 77, reps: 10, rpe: 7.5, ts: 4 * 86400000 }, // newest
      { w: 0, reps: 10, rpe: 7.5, ts: 3 * 86400000 },  // unusable → dropped
      { w: 64, reps: 10, rpe: 7.5, ts: 1 * 86400000 }, // oldest
    ];
    const s = e1rmSeries(rows, e1, 5);
    expect(s).toHaveLength(2);
    expect(s[0]).toBeLessThan(s[1]); // oldest (64) before newest (77)
  });
});

describe('progressingNames — only progressing lifts are included', () => {
  it('includes the climbing lift, excludes the flat one', () => {
    const byName = {
      'Cable Row': rowsFromWeights([64, 68, 73, 77]),
      'Lat Pulldown': rowsFromWeights([60, 60, 60, 60]),
    };
    const set = progressingNames(Object.keys(byName), (n) => byName[n], e1);
    expect(set.has('Cable Row')).toBe(true);
    expect(set.has('Lat Pulldown')).toBe(false);
  });

  it('defensive: bad inputs → empty set', () => {
    expect(progressingNames(null, () => [], e1).size).toBe(0);
    expect(progressingNames(['X'], null, e1).size).toBe(0);
  });
});
