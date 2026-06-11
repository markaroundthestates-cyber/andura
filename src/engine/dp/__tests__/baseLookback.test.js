// ══ #43 DP lookback — multi-session demonstrated base — unit tests ════════════
// Proves: the base does NOT crater to a single weak session when the recent
// history is clearly stronger (the founder's Lat Pulldown 59-64 case); a fluke-
// heavy old single set does not inflate the base (per-session median); and the
// anti-regression guard keeps it from forcing an old number back after a real
// layoff. test-real-values: the founder's actual Lat Pulldown range.

import { describe, it, expect } from 'vitest';
import {
  lookbackBaseE1RM,
  LOOKBACK_SESSIONS,
  MIN_SESSIONS,
  MAX_LIFT_ABOVE_LATEST,
} from '../baseLookback.js';

// dp.js's exact e1RM shape (so the base is in the engine's currency).
const e1 = (w, reps, rpe) => {
  if (!(w > 0) || !(reps > 0)) return null;
  const rir = rpe >= 8.5 ? 0 : rpe >= 7.5 ? 1 : 3;
  return w * (1 + Math.min(12, reps + rir) / 30);
};
const DAY = 86400000;
// One session = several sets on the SAME calendar day. `day` is the day index
// (bigger = more recent). Returns newest-first rows.
const session = (day, sets) =>
  sets.map((s) => ({ w: s.w, reps: s.reps ?? 10, rpe: s.rpe ?? 7.5, ts: day * DAY }));
const newestFirst = (...sessionsOldToNew) =>
  sessionsOldToNew.flat().sort((a, b) => b.ts - a.ts);

describe('lookbackBaseE1RM — does NOT crater to one weak session', () => {
  it('Lat Pulldown 59-64 recent + one weak last session → base stays near the recent strength', () => {
    // Sessions oldest→newest: 64, 59, then a weak 45 day (an off session / bad day).
    // Last-session-only would anchor ~45; the lookback holds near the recent 59-64.
    const rows = newestFirst(
      session(1, [{ w: 64 }, { w: 64 }, { w: 64 }]),
      session(2, [{ w: 59 }, { w: 59 }, { w: 59 }]),
      session(3, [{ w: 45 }, { w: 45 }]), // weak latest session
    );
    const base = lookbackBaseE1RM(rows, e1);
    // Far above the weak 45 session's e1RM; the recency guard caps it just above 45's
    // level, but that is still well above the bare 45 the single-session path uses.
    const weakLatest = e1(45, 10, 7.5);
    expect(base).toBeGreaterThan(weakLatest); // never craters to the weak session
    // And it is bounded by the guard (NOT forced all the way back to 64's e1RM).
    expect(base).toBeLessThanOrEqual(weakLatest * (1 + MAX_LIFT_ABOVE_LATEST) + 1e-6);
  });

  it('a normal recent series (59→62→64) → base ~ the recent best', () => {
    const rows = newestFirst(
      session(1, [{ w: 59 }, { w: 59 }]),
      session(2, [{ w: 62 }, { w: 62 }]),
      session(3, [{ w: 64 }, { w: 64 }]),
    );
    const base = lookbackBaseE1RM(rows, e1);
    expect(base).toBeGreaterThanOrEqual(e1(62, 10, 7.5)); // not dragged down to 59
    expect(base).toBeCloseTo(e1(64, 10, 7.5), 5); // latest is the strongest → its level
  });
});

describe('lookbackBaseE1RM — anti-inflation (per-session median)', () => {
  it('a single fluke-heavy set in an OLD session does not inflate the base', () => {
    // Old session has one mislogged 120 among 60s; its MEDIAN is 60, not 120.
    const rows = newestFirst(
      session(1, [{ w: 60 }, { w: 120 }, { w: 60 }]), // median 60, fluke 120 ignored
      session(2, [{ w: 60 }, { w: 60 }]),
      session(3, [{ w: 60 }, { w: 60 }]),
    );
    const base = lookbackBaseE1RM(rows, e1);
    // The fluke 120 would have pushed a max-of-top-set base to ~120's e1RM; the
    // median keeps it at 60's level.
    expect(base).toBeLessThan(e1(80, 10, 7.5));
    expect(base).toBeCloseTo(e1(60, 10, 7.5), 5);
  });
});

describe('lookbackBaseE1RM — anti-regression after a layoff', () => {
  it('does NOT force the old strong number back when the user returns much weaker', () => {
    // Old strong sessions (80), then a genuine comeback session well below (50).
    const rows = newestFirst(
      session(1, [{ w: 80 }, { w: 80 }]),
      session(2, [{ w: 80 }, { w: 80 }]),
      session(3, [{ w: 50 }, { w: 50 }]), // comeback — materially weaker
    );
    const base = lookbackBaseE1RM(rows, e1);
    const comeback = e1(50, 10, 7.5);
    // Capped to just above the comeback level — NOT shoved back to 80 on session one.
    expect(base).toBeLessThanOrEqual(comeback * (1 + MAX_LIFT_ABOVE_LATEST) + 1e-6);
    expect(base).toBeLessThan(e1(60, 10, 7.5));
  });

  it('the base is never below the latest session itself (the day is the floor)', () => {
    const rows = newestFirst(
      session(1, [{ w: 40 }, { w: 40 }]),
      session(2, [{ w: 42 }, { w: 42 }]),
      session(3, [{ w: 70 }, { w: 70 }]), // latest is the STRONGEST
    );
    const base = lookbackBaseE1RM(rows, e1);
    expect(base).toBeGreaterThanOrEqual(e1(70, 10, 7.5) - 1e-6);
  });
});

describe('lookbackBaseE1RM — cold / thin history is inert', () => {
  it('returns 0 with fewer than MIN_SESSIONS distinct sessions', () => {
    expect(MIN_SESSIONS).toBeGreaterThanOrEqual(2);
    const oneSession = session(1, [{ w: 60 }, { w: 60 }]);
    expect(lookbackBaseE1RM(oneSession, e1)).toBe(0);
    expect(lookbackBaseE1RM([], e1)).toBe(0);
  });

  it('aggregates only the most-recent LOOKBACK_SESSIONS distinct days', () => {
    expect(LOOKBACK_SESSIONS).toBe(3);
    // 4 sessions; an ancient very strong one (day 1, 100) must be OUT of the window
    // so it cannot lift the base above the recent 60s.
    const rows = newestFirst(
      session(1, [{ w: 100 }, { w: 100 }]), // ancient — outside the 3-session window
      session(2, [{ w: 60 }, { w: 60 }]),
      session(3, [{ w: 60 }, { w: 60 }]),
      session(4, [{ w: 60 }, { w: 60 }]),
    );
    const base = lookbackBaseE1RM(rows, e1);
    expect(base).toBeCloseTo(e1(60, 10, 7.5), 5);
  });
});
