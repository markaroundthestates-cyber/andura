// ══ Refusal-memory soft demote (dp_refusal_memory_v1, Daniel 2026-06-10) ═════
// "fa-l cumva reversibil sau sa apara totusi recomandarile refuzate la refusal"
// → a refusal DEMOTES in composition (poolForGroup penalty channel, >=0.5 cutoff)
// with a 28-day half-life so it RETURNS on its own; pick-lists are untouched.
// Timing assertions use the real cutoff (0.5) + the real curve — hand-traced.
import { describe, it, expect, beforeEach } from 'vitest';
import {
  incrementRefusal,
  getRefusalCounter,
  getRefusalPenalties,
  resetRefusalCounter,
  REFUSAL_COUNTER_KEY,
} from '../scheduleAdapter/refusalFlowStorage.js';
import { mergePenalties } from '../scheduleAdapter/lumbarDedup.js';

const DAY = 86400000;
const T0 = 1781100000000;

beforeEach(() => { localStorage.clear(); });

describe('getRefusalPenalties — decay + stacking (real demote cutoff = 0.5)', () => {
  it('1 refusal → 0.6 today (demoted), under the 0.5 cutoff in ~10 days (returns by itself)', () => {
    incrementRefusal('Smith OHP', T0);
    expect(getRefusalPenalties(T0)['Smith OHP']).toBeCloseTo(0.6, 5);
    // day 9: 0.6*2^(-9/28)=0.6*0.800=0.480 < 0.5 → back in normal rotation
    expect(getRefusalPenalties(T0 + 9 * DAY)['Smith OHP']).toBeLessThan(0.5);
    // day 7: 0.6*2^(-7/28)=0.6*0.841=0.504 — still (barely) demoted
    expect(getRefusalPenalties(T0 + 7 * DAY)['Smith OHP']).toBeGreaterThanOrEqual(0.5);
  });

  it('2 refusals → 0.9 today, still demoted at 3 weeks, back under 0.5 by ~24 days', () => {
    incrementRefusal('Y Raise', T0 - DAY);
    incrementRefusal('Y Raise', T0);
    expect(getRefusalPenalties(T0)['Y Raise']).toBeCloseTo(0.9, 5);
    // day 21: 0.9*2^(-21/28)=0.9*0.5946=0.535 → still demoted
    expect(getRefusalPenalties(T0 + 21 * DAY)['Y Raise']).toBeGreaterThanOrEqual(0.5);
    // day 24: 0.9*2^(-24/28)=0.9*0.5520=0.497 → returned
    expect(getRefusalPenalties(T0 + 24 * DAY)['Y Raise']).toBeLessThan(0.5);
  });

  it('penalty caps at 0.9 (3+ refusals — the threshold modal owns permanence)', () => {
    incrementRefusal('Cable Lateral Raise', T0);
    incrementRefusal('Cable Lateral Raise', T0);
    incrementRefusal('Cable Lateral Raise', T0);
    incrementRefusal('Cable Lateral Raise', T0);
    expect(getRefusalPenalties(T0)['Cable Lateral Raise']).toBeCloseTo(0.9, 5);
  });

  it('fully-decayed entries are dropped from the map (never a lingering ghost)', () => {
    incrementRefusal('Smith OHP', T0);
    // 0.6*2^(-150/28) ≈ 0.0146 < 0.05 floor → omitted entirely
    expect(getRefusalPenalties(T0 + 150 * DAY)).toEqual({});
  });

  it('LEGACY plain-number entries (pre-upgrade) carry counts but ZERO soft penalty', () => {
    localStorage.setItem(REFUSAL_COUNTER_KEY, JSON.stringify({ 'Leg Press': 2 }));
    expect(getRefusalCounter()).toEqual({ 'Leg Press': 2 }); // modal contract intact
    expect(getRefusalPenalties(T0)).toEqual({}); // conservative fresh start
    // next refusal upgrades the entry in place: count continues, ts stamps now
    expect(incrementRefusal('Leg Press', T0)).toBe(3);
    expect(getRefusalPenalties(T0)['Leg Press']).toBeCloseTo(0.9, 5);
  });

  it('resetRefusalCounter clears both the count and the soft penalty', () => {
    incrementRefusal('Smith OHP', T0);
    resetRefusalCounter('Smith OHP');
    expect(getRefusalCounter()).toEqual({});
    expect(getRefusalPenalties(T0)).toEqual({});
  });
});

describe('mergePenalties — variadic max-merge (pain + refusal + lumbar share one channel)', () => {
  it('merges three maps with max-wins; null sources skipped', () => {
    expect(mergePenalties({ A: 0.3 }, { A: 0.6, B: 1 }, null, { B: 0.2, C: 0.9 }))
      .toEqual({ A: 0.6, B: 1, C: 0.9 });
  });
  it('all-null → null (byte-identical no-op contract)', () => {
    expect(mergePenalties(null, null, null)).toBeNull();
  });
  it('two-arg call behaves exactly as the old signature', () => {
    expect(mergePenalties({ A: 1 }, null)).toEqual({ A: 1 });
    expect(mergePenalties(null, { B: 0.5 })).toEqual({ B: 0.5 });
  });
});
