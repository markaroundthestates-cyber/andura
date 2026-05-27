// ══ FATIGUE SCORE ENGINE — boundary + arithmetic hardening (anti-facade) ═════
//
// fatigue.test.js covers the 4 verdicts + signal multipliers but leaves the
// exact score arithmetic, the top-2-RPE-per-session selection, the
// per-day sleep fallback inside the average, and several comparison boundaries
// under-asserted (a mutated operator/coefficient can survive). These tests pin
// EXACT computed scores so coefficient/operator mutants fail.

import { describe, it, expect, beforeEach } from 'vitest';
import { calculateFatigueScore } from '../fatigue.js';

const NOW = Date.now();
const DAY = 86400000;

function session({ id, dayOffset, notes = [], rpe = 7, count = 3 }) {
  const ts = NOW - dayOffset * DAY;
  return Array.from({ length: count }, (_, i) => ({
    ex: 'Bench Press', w: 80, reps: '8', baseline: false,
    session: `s-${id}`, ts: ts + i,
    notes: i === 0 ? notes : [],
    rpe,
  }));
}
function seedLogs(sessions) {
  localStorage.setItem('logs', JSON.stringify(sessions.flat()));
}
function seedWellbeing(map) {
  localStorage.setItem('wellbeing', JSON.stringify(map));
}

// High sleep wellbeing to neutralize the +7 default-sleep contribution, so
// score reflects only the signal under test.
const NEUTRAL_SLEEP = { '2026-05-23': { sleep: 5 }, '2026-05-22': { sleep: 5 } };

describe('fatigue — exact score arithmetic per signal coefficient', () => {
  beforeEach(() => { localStorage.clear(); });

  it('one sleep note contributes exactly +13', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['sleep'], rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    seedWellbeing(NEUTRAL_SLEEP);
    expect(calculateFatigueScore().score).toBe(13);
  });

  it('one fatigue note contributes exactly +11', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['fatigue'], rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    seedWellbeing(NEUTRAL_SLEEP);
    expect(calculateFatigueScore().score).toBe(11);
  });

  it('one form note contributes exactly +7', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['form'], rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    seedWellbeing(NEUTRAL_SLEEP);
    expect(calculateFatigueScore().score).toBe(7);
  });

  it('one strong note SUBTRACTS 9 (clamped to 0 floor)', () => {
    // 1 sleep (+13) - 1 strong (-9) = 4
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['sleep', 'strong'], rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    seedWellbeing(NEUTRAL_SLEEP);
    expect(calculateFatigueScore().score).toBe(4);
  });

  it('avgRPE penalty is (avgRPE - 7.5) * 11 above the 7.5 threshold', () => {
    // avgRPE 8.5 → (8.5 - 7.5) * 11 = 11
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 8.5 }),
      session({ id: 2, dayOffset: 2, rpe: 8.5 }),
    ]);
    seedWellbeing(NEUTRAL_SLEEP);
    expect(calculateFatigueScore().score).toBe(11);
  });

  it('avgRPE exactly 7.5 yields zero RPE penalty (boundary)', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 7.5 }),
      session({ id: 2, dayOffset: 2, rpe: 7.5 }),
    ]);
    seedWellbeing(NEUTRAL_SLEEP);
    expect(calculateFatigueScore().score).toBe(0);
  });

  it('rpeRising adds exactly +12 on top of the avgRPE penalty', () => {
    // sessions rpe 9 / 8 / 7 → avg 8 → penalty (0.5*11)=5.5; rising +12
    // total = round(5.5 + 12) = round(17.5) = 18
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 9 }),
      session({ id: 2, dayOffset: 2, rpe: 8 }),
      session({ id: 3, dayOffset: 4, rpe: 7 }),
    ]);
    seedWellbeing(NEUTRAL_SLEEP);
    expect(calculateFatigueScore().score).toBe(18);
  });
});

describe('fatigue — top-2 RPE per session selection', () => {
  beforeEach(() => { localStorage.clear(); });

  it('averages only the 2 highest RPE sets within a session', () => {
    // Session 1 sets: rpe 10, 10, 2, 2 → top2 = [10,10] → 10
    // Session 2 sets: rpe 4, 4 → avg 4
    // sessionRPEs = [10, 4] → avgRPE 7
    const ts1 = NOW;
    const ts2 = NOW - 2 * DAY;
    const logs = [
      { ex: 'B', w: 80, baseline: false, session: 's1', ts: ts1, notes: [], rpe: 10 },
      { ex: 'B', w: 80, baseline: false, session: 's1', ts: ts1 + 1, notes: [], rpe: 10 },
      { ex: 'B', w: 80, baseline: false, session: 's1', ts: ts1 + 2, notes: [], rpe: 2 },
      { ex: 'B', w: 80, baseline: false, session: 's1', ts: ts1 + 3, notes: [], rpe: 2 },
      { ex: 'B', w: 80, baseline: false, session: 's2', ts: ts2, notes: [], rpe: 4 },
      { ex: 'B', w: 80, baseline: false, session: 's2', ts: ts2 + 1, notes: [], rpe: 4 },
    ];
    localStorage.setItem('logs', JSON.stringify(logs));
    seedWellbeing(NEUTRAL_SLEEP);
    const r = calculateFatigueScore();
    expect(r.avgRPE).toBeCloseTo(7, 5);
  });

  it('defaults a session with no rpe sets to 7', () => {
    const ts1 = NOW;
    const ts2 = NOW - 2 * DAY;
    const logs = [
      { ex: 'B', w: 80, baseline: false, session: 's1', ts: ts1, notes: [] }, // no rpe
      { ex: 'B', w: 80, baseline: false, session: 's2', ts: ts2, notes: [], rpe: 7 },
    ];
    localStorage.setItem('logs', JSON.stringify(logs));
    seedWellbeing(NEUTRAL_SLEEP);
    expect(calculateFatigueScore().avgRPE).toBe(7);
  });
});

describe('fatigue — sleep average uses per-day fallback', () => {
  beforeEach(() => { localStorage.clear(); });

  it('averages over only the most recent 4 dated entries (sorted desc)', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    // 5 days; newest 4 are sleep=5 → avg 5 → no penalty. Oldest sleep=1 ignored.
    seedWellbeing({
      '2026-05-25': { sleep: 5 },
      '2026-05-24': { sleep: 5 },
      '2026-05-23': { sleep: 5 },
      '2026-05-22': { sleep: 5 },
      '2026-05-21': { sleep: 1 },
    });
    expect(calculateFatigueScore().score).toBe(0);
  });

  it('avgSleep boundary exactly 2.5 takes the +18 tier (<= 2.5)', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    seedWellbeing({ '2026-05-23': { sleep: 2.5 }, '2026-05-22': { sleep: 2.5 } });
    expect(calculateFatigueScore().score).toBe(18);
  });

  it('avgSleep boundary exactly 3.5 takes the +7 tier (<= 3.5)', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    seedWellbeing({ '2026-05-23': { sleep: 3.5 }, '2026-05-22': { sleep: 3.5 } });
    expect(calculateFatigueScore().score).toBe(7);
  });
});

describe('fatigue — verdict OR-trigger precedence', () => {
  beforeEach(() => { localStorage.clear(); });

  it('HIGH_FATIGUE fatigue>=4 OR-branch fires even when score below 65', () => {
    // 4 fatigue notes = 44 score (< 65) but fatigue>=4 → HIGH_FATIGUE
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['fatigue', 'fatigue'], rpe: 7 }),
      session({ id: 2, dayOffset: 2, notes: ['fatigue', 'fatigue'], rpe: 7 }),
    ]);
    seedWellbeing(NEUTRAL_SLEEP);
    const r = calculateFatigueScore();
    expect(r.score).toBeLessThan(65);
    expect(r.fatigue).toBe(4);
    expect(r.key).toBe('HIGH_FATIGUE');
  });

  it('PEAK_FORM requires BOTH score<=15 AND strong>=2 (strong=1 falls to NORMAL)', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['strong'], rpe: 6 }),
      session({ id: 2, dayOffset: 2, rpe: 6 }),
    ]);
    seedWellbeing(NEUTRAL_SLEEP);
    const r = calculateFatigueScore();
    expect(r.strong).toBe(1);
    expect(r.key).toBe('NORMAL');
  });

  it('MODERATE secondary trigger needs avgRPE>=8.7 AND rpeRising together', () => {
    // avgRPE high + rising but raw score < 40
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 9.5 }),
      session({ id: 2, dayOffset: 2, rpe: 9 }),
      session({ id: 3, dayOffset: 4, rpe: 8 }),
    ]);
    seedWellbeing(NEUTRAL_SLEEP);
    const r = calculateFatigueScore();
    expect(r.avgRPE).toBeGreaterThanOrEqual(8.7);
    expect(r.key).toBe('MODERATE_FATIGUE');
  });
});
