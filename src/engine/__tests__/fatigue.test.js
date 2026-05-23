// ══ FATIGUE SCORE ENGINE — branch coverage close gap ════════════════
//
// Per TEST_COVERAGE_GAP_INVESTIGATION chat 5 Top 5 priority gap #4:
// src/engine/fatigue.js 83 LOC = 44.57% line / 9.09% branch catastrophic.
//
// Cover all 4 verdict branches (HIGH_FATIGUE / MODERATE_FATIGUE / PEAK_FORM
// / NORMAL) + early-return DATE INSUFICIENTE + signal multipliers (sleepBad
// / fatigue / formBad / strong notes) + RPE rising detection + sleep
// wellbeing thresholds + score clamp + edge cases (empty logs, missing rpe,
// missing wellbeing, baseline-only logs, single session).
//
// Engine reads localStorage via DB.get('logs') + DB.get('wellbeing'); tests
// seed via localStorage.setItem direct.

import { describe, it, expect, beforeEach } from 'vitest';
import { calculateFatigueScore } from '../fatigue.js';

const NOW = Date.now();
const DAY = 86400000;

/**
 * Build a session entry array. count = nr de seturi în sesiune.
 * notes attached on first set (engine flatMaps all notes anyway).
 * rpe defaults applied uniform.
 */
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
  const flat = sessions.flat();
  localStorage.setItem('logs', JSON.stringify(flat));
}

function seedWellbeing(map) {
  localStorage.setItem('wellbeing', JSON.stringify(map));
}

describe('calculateFatigueScore — early return DATE INSUFICIENTE', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns DATE INSUFICIENTE when zero logs', () => {
    const r = calculateFatigueScore();
    expect(r.score).toBe(0);
    expect(r.label).toBe('DATE INSUFICIENTE');
    expect(r.recommend).toBe('none');
    expect(r.color).toBe('var(--text3)');
    expect(r.detail).toMatch(/Completeaza 2\+ sesiuni/);
  });

  it('returns DATE INSUFICIENTE when only 1 session logged', () => {
    seedLogs([session({ id: 1, dayOffset: 0 })]);
    const r = calculateFatigueScore();
    expect(r.label).toBe('DATE INSUFICIENTE');
  });

  it('ignores baseline logs and triggers DATE INSUFICIENTE if remaining < 2 sessions', () => {
    const baseline = [{
      ex: 'Squat', w: 100, baseline: true, session: 'b1', ts: NOW, notes: [], rpe: 7,
    }];
    const real = session({ id: 1, dayOffset: 0 });
    localStorage.setItem('logs', JSON.stringify([...baseline, ...real]));
    const r = calculateFatigueScore();
    expect(r.label).toBe('DATE INSUFICIENTE');
  });

  it('ignores logs missing session field (filtered out)', () => {
    const orphan = [{ ex: 'Row', w: 60, baseline: false, ts: NOW, notes: [], rpe: 7 }];
    const real = session({ id: 1, dayOffset: 0 });
    localStorage.setItem('logs', JSON.stringify([...orphan, ...real]));
    const r = calculateFatigueScore();
    expect(r.label).toBe('DATE INSUFICIENTE');
  });
});

describe('calculateFatigueScore — NORMAL verdict (baseline branch)', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns NORMAL when 2 clean sessions, no notes, mid RPE', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    const r = calculateFatigueScore();
    expect(r.key).toBe('NORMAL');
    expect(r.label).toBe('Pe drum bun');
    expect(r.color).toBe('var(--green)');
    expect(r.icon).toBe('🟢');
    expect(r.recommend).toBe('normal');
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThan(40);
  });

  it('returns NORMAL when score 16-39 (above PEAK_FORM threshold)', () => {
    // Mild fatigue accumulating but not enough to flip MODERATE
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['fatigue'], rpe: 7 }),
      session({ id: 2, dayOffset: 2, notes: ['form'], rpe: 7 }),
      session({ id: 3, dayOffset: 4, rpe: 7 }),
    ]);
    const r = calculateFatigueScore();
    expect(r.key).toBe('NORMAL');
    expect(r.score).toBeGreaterThan(15);
    expect(r.score).toBeLessThan(40);
  });
});

describe('calculateFatigueScore — PEAK_FORM verdict', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns PEAK_FORM when score ≤15 AND strong ≥2', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['strong'], rpe: 6 }),
      session({ id: 2, dayOffset: 2, notes: ['strong'], rpe: 6 }),
    ]);
    const r = calculateFatigueScore();
    expect(r.key).toBe('PEAK_FORM');
    expect(r.label).toBe('Suntem in forma buna');
    expect(r.color).toBe('var(--green)');
    expect(r.icon).toBe('🟢');
    expect(r.recommend).toBe('push');
    expect(r.detail).toMatch(/Recuperarea/);
    expect(r.score).toBeLessThanOrEqual(15);
    expect(r.strong).toBeGreaterThanOrEqual(2);
  });

  it('does NOT return PEAK_FORM when score ≤15 but strong = 1 (falls to NORMAL)', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['strong'], rpe: 6 }),
      session({ id: 2, dayOffset: 2, rpe: 6 }),
    ]);
    const r = calculateFatigueScore();
    expect(r.key).toBe('NORMAL');
    expect(r.strong).toBe(1);
  });

  it('clamps strong subtraction (score floor 0) — score stays ≥0', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['strong', 'strong', 'strong'], rpe: 5 }),
      session({ id: 2, dayOffset: 2, notes: ['strong', 'strong', 'strong'], rpe: 5 }),
    ]);
    const r = calculateFatigueScore();
    expect(r.score).toBe(0);
    expect(r.key).toBe('PEAK_FORM');
  });
});

describe('calculateFatigueScore — MODERATE_FATIGUE verdict', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns MODERATE_FATIGUE when score 40-64', () => {
    // 1 sleep (13) + 2 fatigue (22) + 1 form (7) = 42
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['sleep'], rpe: 7 }),
      session({ id: 2, dayOffset: 2, notes: ['fatigue'], rpe: 7 }),
      session({ id: 3, dayOffset: 4, notes: ['fatigue', 'form'], rpe: 7 }),
    ]);
    const r = calculateFatigueScore();
    expect(r.key).toBe('MODERATE_FATIGUE');
    expect(r.label).toBe('Pas mai conservator');
    expect(r.color).toBe('var(--accent2)');
    expect(r.icon).toBe('🟡');
    expect(r.recommend).toBe('reduce');
    expect(r.detail).toMatch(/tehnica/);
    expect(r.score).toBeGreaterThanOrEqual(40);
    expect(r.score).toBeLessThan(65);
  });

  it('returns MODERATE_FATIGUE via secondary trigger avgRPE ≥8.7 AND rpeRising', () => {
    // avgRPE high + rising; minimal note signals so score stays <40 but
    // secondary branch fires
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 9.5 }),  // most recent (sorted by ts desc)
      session({ id: 2, dayOffset: 2, rpe: 9 }),
      session({ id: 3, dayOffset: 4, rpe: 8 }),    // oldest; diff = 1.5 > 0.6 → rising
    ]);
    const r = calculateFatigueScore();
    expect(r.avgRPE).toBeGreaterThanOrEqual(8.7);
    expect(r.key).toBe('MODERATE_FATIGUE');
  });
});

describe('calculateFatigueScore — HIGH_FATIGUE verdict', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns HIGH_FATIGUE when score ≥65', () => {
    // 3 sleep (39) + 2 fatigue (22) + 1 form (7) = 68
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['sleep', 'sleep'], rpe: 7 }),
      session({ id: 2, dayOffset: 2, notes: ['sleep', 'fatigue'], rpe: 7 }),
      session({ id: 3, dayOffset: 4, notes: ['fatigue', 'form'], rpe: 7 }),
    ]);
    const r = calculateFatigueScore();
    expect(r.key).toBe('HIGH_FATIGUE');
    expect(r.label).toBe('Azi mergem mai bland');
    expect(r.color).toBe('var(--red)');
    expect(r.icon).toBe('🔴');
    expect(r.recommend).toBe('deload');
    expect(r.detail).toMatch(/sesiuni grele/);
    expect(r.score).toBeGreaterThanOrEqual(65);
  });

  it('returns HIGH_FATIGUE via fatigue notes ≥4 trigger even if score <65', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['fatigue', 'fatigue'], rpe: 7 }),
      session({ id: 2, dayOffset: 2, notes: ['fatigue', 'fatigue'], rpe: 7 }),
    ]);
    const r = calculateFatigueScore();
    expect(r.fatigue).toBeGreaterThanOrEqual(4);
    expect(r.key).toBe('HIGH_FATIGUE');
  });

  it('returns HIGH_FATIGUE via sleepBad ≥3 trigger', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['sleep'], rpe: 7 }),
      session({ id: 2, dayOffset: 2, notes: ['sleep'], rpe: 7 }),
      session({ id: 3, dayOffset: 4, notes: ['sleep'], rpe: 7 }),
    ]);
    const r = calculateFatigueScore();
    expect(r.sleepBad).toBeGreaterThanOrEqual(3);
    expect(r.key).toBe('HIGH_FATIGUE');
  });

  it('clamps score at 100 (upper bound)', () => {
    // Massive signals: 5 sleep (65) + 5 fatigue (55) + 5 form (35) → >100
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['sleep', 'sleep', 'fatigue', 'fatigue', 'form'], rpe: 9 }),
      session({ id: 2, dayOffset: 2, notes: ['sleep', 'sleep', 'fatigue', 'fatigue', 'form'], rpe: 9 }),
      session({ id: 3, dayOffset: 4, notes: ['sleep', 'fatigue', 'form', 'form', 'form'], rpe: 9 }),
    ]);
    const r = calculateFatigueScore();
    expect(r.score).toBe(100);
    expect(r.key).toBe('HIGH_FATIGUE');
  });
});

describe('calculateFatigueScore — RPE branches', () => {
  beforeEach(() => { localStorage.clear(); });

  it('avgRPE >7.5 adds to score (penalty branch)', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 8.5 }),
      session({ id: 2, dayOffset: 2, rpe: 8.5 }),
    ]);
    const r = calculateFatigueScore();
    expect(r.avgRPE).toBeCloseTo(8.5, 1);
    expect(r.score).toBeGreaterThan(0);
  });

  it('avgRPE ≤7.5 does NOT add RPE penalty (Math.max(0, ...) branch)', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 6.5 }),
      session({ id: 2, dayOffset: 2, rpe: 6.5 }),
    ]);
    seedWellbeing({ '2026-05-23': { sleep: 5 } }); // suppress sleep default +7
    const r = calculateFatigueScore();
    expect(r.avgRPE).toBeCloseTo(6.5, 1);
    expect(r.score).toBe(0);
  });

  it('rpeRising triggers when last4 ≥3 AND first - last > 0.6', () => {
    // Most recent (sorted desc by ts) has highest rpe → rising trend
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 9 }),   // most recent
      session({ id: 2, dayOffset: 2, rpe: 8 }),
      session({ id: 3, dayOffset: 4, rpe: 7 }),   // oldest
    ]);
    const r = calculateFatigueScore();
    // 9 vs 7 → diff 2 > 0.6 → rpeRising true → +12 to score
    expect(r.score).toBeGreaterThanOrEqual(12);
  });

  it('rpeRising does NOT trigger when only 2 sessions (sessionRPEs.length <3)', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 9 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    seedWellbeing({ '2026-05-23': { sleep: 5 } }); // suppress sleep default +7
    const r = calculateFatigueScore();
    // No +12 bonus because length < 3
    // Score = only avgRPE penalty: (8 - 7.5) * 11 = 5.5 → rounded 6
    expect(r.score).toBeLessThan(12);
  });

  it('rpeRising does NOT trigger when diff ≤ 0.6 (stable RPE)', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 7.5 }),
      session({ id: 2, dayOffset: 2, rpe: 7.5 }),
      session({ id: 3, dayOffset: 4, rpe: 7.3 }),
    ]);
    const r = calculateFatigueScore();
    // diff 7.5 - 7.3 = 0.2 → not rising
    // No +12 bonus
    expect(r.score).toBeLessThan(12);
  });

  it('defaults RPE to 7 when set has no rpe field (filter out)', () => {
    // Sets with no rpe field at all → engine defaults to 7
    const ts1 = NOW;
    const ts2 = NOW - 2 * DAY;
    const logs = [
      { ex: 'Bench', w: 80, baseline: false, session: 's1', ts: ts1, notes: [] },
      { ex: 'Bench', w: 80, baseline: false, session: 's2', ts: ts2, notes: [] },
    ];
    localStorage.setItem('logs', JSON.stringify(logs));
    seedWellbeing({ '2026-05-23': { sleep: 5 } }); // suppress sleep default +7
    const r = calculateFatigueScore();
    expect(r.avgRPE).toBe(7);
    expect(r.score).toBe(0);
  });
});

describe('calculateFatigueScore — wellbeing sleep branches', () => {
  beforeEach(() => { localStorage.clear(); });

  it('avgSleep ≤2.5 adds +18 to score', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    seedWellbeing({
      '2026-05-23': { sleep: 2 },
      '2026-05-22': { sleep: 2 },
      '2026-05-21': { sleep: 2 },
      '2026-05-20': { sleep: 2 },
    });
    const r = calculateFatigueScore();
    expect(r.score).toBeGreaterThanOrEqual(18);
  });

  it('avgSleep 2.5-3.5 adds +7 to score', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    seedWellbeing({
      '2026-05-23': { sleep: 3 },
      '2026-05-22': { sleep: 3 },
    });
    const r = calculateFatigueScore();
    expect(r.score).toBeGreaterThanOrEqual(7);
    expect(r.score).toBeLessThan(18);
  });

  it('avgSleep >3.5 adds nothing (sleep branch default 0)', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    seedWellbeing({
      '2026-05-23': { sleep: 5 },
      '2026-05-22': { sleep: 5 },
    });
    const r = calculateFatigueScore();
    expect(r.score).toBe(0);
  });

  it('missing wellbeing entirely uses default avgSleep=3 (triggers +7 mid-tier)', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    // No wellbeing seeded → recentDates.length=0 → avgSleep=3 default → +7
    const r = calculateFatigueScore();
    expect(r.score).toBe(7);
  });

  it('wellbeing entry missing sleep field uses fallback 3 per day', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    seedWellbeing({
      '2026-05-23': {},
      '2026-05-22': { sleep: undefined },
    });
    const r = calculateFatigueScore();
    // both fall back to 3 → avgSleep=3 → +7
    expect(r.score).toBe(7);
  });
});

describe('calculateFatigueScore — last4 windowing + signal aggregation', () => {
  beforeEach(() => { localStorage.clear(); });

  it('only counts most recent 4 sessions (older sessions ignored)', () => {
    // 6 sessions, oldest 2 packed with sleep notes — should NOT count
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
      session({ id: 3, dayOffset: 4, rpe: 7 }),
      session({ id: 4, dayOffset: 6, rpe: 7 }),
      session({ id: 5, dayOffset: 8, notes: ['sleep', 'sleep', 'sleep'], rpe: 9 }),
      session({ id: 6, dayOffset: 10, notes: ['sleep', 'sleep', 'sleep'], rpe: 9 }),
    ]);
    seedWellbeing({ '2026-05-23': { sleep: 5 } }); // suppress sleep default +7
    const r = calculateFatigueScore();
    // Most recent 4 (offsets 0,2,4,6) all clean → score 0
    expect(r.sleepBad).toBe(0);
    expect(r.score).toBe(0);
  });

  it('aggregates notes across all sets in last4 sessions', () => {
    // First set in session 1 has 2 sleep notes; engine flatMaps so all count
    seedLogs([
      session({ id: 1, dayOffset: 0, notes: ['sleep', 'sleep'], rpe: 7 }),
      session({ id: 2, dayOffset: 2, notes: ['sleep'], rpe: 7 }),
    ]);
    const r = calculateFatigueScore();
    expect(r.sleepBad).toBe(3);
    // score = 3*13 = 39 → still NORMAL (<40 + sleepBad 3 triggers HIGH_FATIGUE via OR)
    expect(r.key).toBe('HIGH_FATIGUE');
  });

  it('respects ts sort order — newest 4 picked even when log array unsorted', () => {
    // Insert oldest first → engine sorts by ts desc
    seedLogs([
      session({ id: 99, dayOffset: 30, notes: ['sleep', 'sleep', 'sleep'], rpe: 9 }),
      session({ id: 1, dayOffset: 0, rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
      session({ id: 3, dayOffset: 4, rpe: 7 }),
      session({ id: 4, dayOffset: 6, rpe: 7 }),
    ]);
    const r = calculateFatigueScore();
    // Most recent 4 (id 1-4) are clean — old id 99 ignored
    expect(r.sleepBad).toBe(0);
  });
});

describe('calculateFatigueScore — return shape integrity', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns full shape for valid sessions (score/key/label/icon/color/recommend/detail/avgRPE/sleepBad/fatigue/strong)', () => {
    seedLogs([
      session({ id: 1, dayOffset: 0, rpe: 7 }),
      session({ id: 2, dayOffset: 2, rpe: 7 }),
    ]);
    const r = calculateFatigueScore();
    expect(r).toMatchObject({
      score: expect.any(Number),
      key: expect.any(String),
      label: expect.any(String),
      icon: expect.any(String),
      color: expect.any(String),
      recommend: expect.any(String),
      detail: expect.any(String),
      avgRPE: expect.any(Number),
      sleepBad: expect.any(Number),
      fatigue: expect.any(Number),
      strong: expect.any(Number),
    });
  });

  it('DATE INSUFICIENTE shape (no score/key/icon/avgRPE)', () => {
    const r = calculateFatigueScore();
    expect(r.label).toBe('DATE INSUFICIENTE');
    expect(r.recommend).toBe('none');
    expect(r.detail).toBeDefined();
    expect(r.score).toBe(0);
  });
});
