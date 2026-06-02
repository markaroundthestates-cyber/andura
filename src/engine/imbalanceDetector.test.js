// M3 detector unit tests — pure ratios, threshold edges, undefined-ratio guard,
// MRV cap on the correction. Companion integration tests (push-dominant → pull
// budget rises, quad-dominant → hamstring rises, composition with M2/M1,
// determinism) live in schedule/__tests__/scheduleAdapter.imbalance.test.js.

import { describe, it, expect } from 'vitest';
import {
  detectImbalances,
  applyImbalanceCorrection,
  MIN_SIDE_SETS,
  CORRECTION_STRENGTH,
} from './imbalanceDetector.js';
import { ISRAETEL_BASELINES } from './periodization/constants.js';

const NOW = new Date(2026, 4, 18).getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

// One logged set row touching `ex` at `ts` (detector reads ex + ts; weight is
// irrelevant to the volume aggregation — it counts set rows on a primary group).
const set = (ex, ts = NOW) => ({ ex, ts });

// Repeat a set row n times (n working sets on one exercise).
const sets = (ex, n, ts = NOW) => Array.from({ length: n }, () => set(ex, ts));

// Push exercises (primary heads → piept / umeri / triceps):
//   'Flat DB Press' → chest_mid (piept), 'DB Shoulder Press' → delt_front/mid (umeri),
//   'Pushdown' → tri_lateral/medial (triceps).
// Pull exercises (primary heads → spate / biceps):
//   'Lat Pulldown' → lat (spate), 'Bayesian Curl' → bi_long (biceps).
// Legs:
//   'Leg Extension' → quad (picioare-quads), 'Leg Curl' → hamstring (picioare-hamstrings).

describe('imbalanceDetector — detectImbalances (pure)', () => {
  it('flags push/pull when push volume exceeds pull by > 1.3x', () => {
    const logs = [
      ...sets('Flat DB Press', 6),
      ...sets('DB Shoulder Press', 6),
      ...sets('Pushdown', 6),       // push = 18
      ...sets('Lat Pulldown', 4),
      ...sets('Bayesian Curl', 4),  // pull = 8  → ratio 2.25 > 1.3
    ];
    const found = detectImbalances({ logs, now: NOW });
    const pp = found.find((f) => f.pair === 'push_pull');
    expect(pp).toBeDefined();
    expect(pp.dominantVolume).toBe(18);
    expect(pp.laggingVolume).toBe(8);
    expect(pp.ratio).toBeCloseTo(2.25, 3);
    // lagging side = pull (spate + biceps) — the groups we ADD volume to.
    expect(pp.laggingGroups).toContain('spate');
    expect(pp.laggingGroups).toContain('biceps');
    expect(pp.severity).toBeGreaterThan(0);
  });

  it('flags quad/ham when quad volume exceeds hamstring by > 1.5x', () => {
    const logs = [
      ...sets('Leg Extension', 8), // quad = 8
      ...sets('Leg Curl', 4),      // ham = 4 → ratio 2.0 > 1.5
    ];
    const found = detectImbalances({ logs, now: NOW });
    const qh = found.find((f) => f.pair === 'quad_ham');
    expect(qh).toBeDefined();
    expect(qh.laggingGroups).toEqual(['picioare-hamstrings']);
    expect(qh.ratio).toBeCloseTo(2.0, 3);
  });

  it('does NOT flag a balanced ratio (within threshold)', () => {
    const logs = [
      ...sets('Flat DB Press', 5),
      ...sets('Pushdown', 5),       // push = 10
      ...sets('Lat Pulldown', 5),
      ...sets('Bayesian Curl', 4),  // pull = 9 → ratio ~1.11 < 1.3
    ];
    const found = detectImbalances({ logs, now: NOW });
    expect(found.find((f) => f.pair === 'push_pull')).toBeUndefined();
  });

  it('threshold edge: ratio exactly at threshold does NOT flag (strict >)', () => {
    // push = 13, pull = 10 → ratio 1.3 exactly → NOT flagged (balanced edge).
    const logs = [
      ...sets('Flat DB Press', 13),
      ...sets('Lat Pulldown', 10),
    ];
    const found = detectImbalances({ logs, now: NOW });
    expect(found.find((f) => f.pair === 'push_pull')).toBeUndefined();

    // push = 14, pull = 10 → ratio 1.4 > 1.3 → flagged (just past edge).
    const logs2 = [
      ...sets('Flat DB Press', 14),
      ...sets('Lat Pulldown', 10),
    ];
    const found2 = detectImbalances({ logs: logs2, now: NOW });
    expect(found2.find((f) => f.pair === 'push_pull')).toBeDefined();
  });

  it('undefined-ratio guard: a side with ~zero volume → NO finding', () => {
    // All push, ZERO pull → pull < MIN_SIDE_SETS → ratio undefined → no finding.
    const logs = sets('Flat DB Press', 12);
    const found = detectImbalances({ logs, now: NOW });
    expect(found.find((f) => f.pair === 'push_pull')).toBeUndefined();
  });

  it('insufficient data: both sides below MIN_SIDE_SETS → NO finding', () => {
    const logs = [
      ...sets('Flat DB Press', MIN_SIDE_SETS - 1),
      ...sets('Lat Pulldown', 1),
    ];
    const found = detectImbalances({ logs, now: NOW });
    expect(found.length).toBe(0);
  });

  it('respects the lookback window (old sets excluded → no finding)', () => {
    const old = NOW - 30 * DAY_MS;
    const logs = [
      ...sets('Flat DB Press', 12, old),
      ...sets('Lat Pulldown', 2, old),
    ];
    const found = detectImbalances({ logs, lookbackDays: 14, now: NOW });
    expect(found.length).toBe(0);
  });

  it('empty / null profile → no findings (graceful)', () => {
    expect(detectImbalances(null)).toEqual([]);
    expect(detectImbalances({ logs: [] })).toEqual([]);
    expect(detectImbalances({})).toEqual([]);
  });

  it('determinism: same logs + now → identical findings', () => {
    const logs = [...sets('Flat DB Press', 10), ...sets('Lat Pulldown', 3)];
    const a = detectImbalances({ logs, now: NOW });
    const b = detectImbalances({ logs, now: NOW });
    expect(a).toEqual(b);
  });
});

describe('imbalanceDetector — applyImbalanceCorrection (pure)', () => {
  // A flagged push/pull finding: pull is lagging, raise back + biceps.
  const ppFinding = {
    pair: 'push_pull',
    dominantSide: ['piept', 'umeri', 'triceps'],
    laggingSide: ['spate', 'biceps'],
    laggingGroups: ['spate', 'biceps'],
    ratio: 2.25,
    dominantVolume: 18,
    laggingVolume: 8,
    severity: 0.5,
  };

  it('RAISES the lagging side budget (back + biceps), leaves dominant side untouched', () => {
    const budget = { chest: 14, back: 12, biceps: 12, triceps: 12, shoulders: 12 };
    const out = applyImbalanceCorrection(budget, [ppFinding]);
    expect(out.back).toBeGreaterThan(budget.back);
    expect(out.biceps).toBeGreaterThan(budget.biceps);
    // dominant side groups NEVER lowered (additive only).
    expect(out.chest).toBe(budget.chest);
    expect(out.triceps).toBe(budget.triceps);
    expect(out.shoulders).toBe(budget.shoulders);
  });

  it('HARD-caps every corrected group at its Israetel MRV', () => {
    // back already near MRV; a strong correction must clamp at MRV (25), never above.
    const budget = { back: ISRAETEL_BASELINES.back.MRV - 1, biceps: 10 };
    const strong = { ...ppFinding, dominantVolume: 100, laggingVolume: 5, severity: 1 };
    const out = applyImbalanceCorrection(budget, [strong]);
    expect(out.back).toBeLessThanOrEqual(ISRAETEL_BASELINES.back.MRV);
    expect(out.biceps).toBeLessThanOrEqual(ISRAETEL_BASELINES.biceps.MRV);
  });

  it('no findings → budget unchanged (graceful)', () => {
    const budget = { chest: 14, back: 12 };
    expect(applyImbalanceCorrection(budget, [])).toEqual(budget);
    expect(applyImbalanceCorrection(budget, [])).not.toBe(budget); // new map
  });

  it('null budget passes through', () => {
    expect(applyImbalanceCorrection(null, [ppFinding])).toBeNull();
    expect(applyImbalanceCorrection(undefined, [ppFinding])).toBeNull();
  });

  it('never lowers a group already at/above MRV', () => {
    const budget = { back: ISRAETEL_BASELINES.back.MRV, biceps: 12 };
    const out = applyImbalanceCorrection(budget, [ppFinding]);
    expect(out.back).toBe(ISRAETEL_BASELINES.back.MRV);
  });

  it('correction magnitude scales with severity (severity 1 raises more than 0.2)', () => {
    const budget = { back: 12, biceps: 12 };
    const mild = applyImbalanceCorrection(budget, [{ ...ppFinding, severity: 0.2 }]);
    const hard = applyImbalanceCorrection(budget, [{ ...ppFinding, severity: 1 }]);
    expect(hard.back).toBeGreaterThan(mild.back);
  });

  it('CORRECTION_STRENGTH + MIN_SIDE_SETS are sane named constants', () => {
    expect(CORRECTION_STRENGTH).toBeGreaterThan(0);
    expect(CORRECTION_STRENGTH).toBeLessThanOrEqual(1);
    expect(MIN_SIDE_SETS).toBeGreaterThanOrEqual(1);
  });
});
