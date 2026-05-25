// Linear Block 4+1 tests — Foundation 2 (Batch B Task 4).
import { describe, it, expect, beforeEach } from 'vitest';
import {
  initCycle,
  getCycleWeek,
  isDeloadWeek,
  getWeekPolicy,
  markDeloadSkipped,
  isDeloadSkipped,
  getDeloadSkipBanner,
  getWeekLabel,
  getState,
  LINEAR_BLOCK_KEY,
  WEEK_POLICY,
} from '../linearBlock.js';
import { getDeloadSkipWarning } from '../progressionMatrix.js';

beforeEach(() => {
  localStorage.clear();
});

describe('initCycle', () => {
  it('writes cycleStartDate today by default', () => {
    initCycle({ now: new Date('2026-05-02').getTime() });
    const s = getState();
    expect(s.cycleStartDate).toBe('2026-05-02');
    expect(s.deloadSkippedAt).toBeNull();
  });

  it('respects explicit cycleStartDate', () => {
    initCycle({ cycleStartDate: '2026-04-01' });
    expect(getState().cycleStartDate).toBe('2026-04-01');
  });
});

describe('getCycleWeek — 35-day rotation', () => {
  it('returns 1 when uninitialized', () => {
    expect(getCycleWeek()).toBe(1);
  });

  it('Day 0 → Week 1', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    expect(getCycleWeek({ today: new Date(2026, 4, 1) })).toBe(1);
  });

  it('Day 6 → Week 1 (last day of week 1)', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    expect(getCycleWeek({ today: new Date(2026, 4, 7) })).toBe(1);
  });

  it('Day 7 → Week 2', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    expect(getCycleWeek({ today: new Date(2026, 4, 8) })).toBe(2);
  });

  it('Day 21 → Week 4', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    expect(getCycleWeek({ today: new Date(2026, 4, 22) })).toBe(4);
  });

  it('Day 28 → Week 5 (deload)', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    expect(getCycleWeek({ today: new Date(2026, 4, 29) })).toBe(5);
  });

  it('Day 34 → Week 5 (still deload)', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    expect(getCycleWeek({ today: new Date(2026, 5, 4) })).toBe(5);
  });

  it('Day 35 → Week 1 (cycle wraps)', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    expect(getCycleWeek({ today: new Date(2026, 5, 5) })).toBe(1);
  });

  it('Day 70 → Week 1 (two cycles in)', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    expect(getCycleWeek({ today: new Date(2026, 6, 10) })).toBe(1);
  });
});

describe('isDeloadWeek + getWeekPolicy', () => {
  it('isDeloadWeek false during weeks 1-4', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    [0, 7, 14, 21].forEach(daysOffset => {
      const today = new Date(2026, 4, 1 + daysOffset);
      expect(isDeloadWeek({ today })).toBe(false);
    });
  });

  it('isDeloadWeek true during week 5', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    expect(isDeloadWeek({ today: new Date(2026, 4, 29) })).toBe(true);
    expect(isDeloadWeek({ today: new Date(2026, 5, 1) })).toBe(true);
  });

  it('week 1-4 policy: full volume + intensity', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    const p = getWeekPolicy({ today: new Date(2026, 4, 1) });
    expect(p.phase).toBe('load');
    expect(p.volumeMul).toBe(1.00);
    expect(p.intensityMul).toBe(1.00);
    expect(p.week).toBe(1);
  });

  it('week 5 policy: deload volume + intensity cuts', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    const p = getWeekPolicy({ today: new Date(2026, 4, 29) });
    expect(p.phase).toBe('deload');
    // Volume cut ~40-50% per spec (we use 0.55 = 45% cut)
    expect(p.volumeMul).toBeGreaterThan(0.4);
    expect(p.volumeMul).toBeLessThan(0.65);
    // Intensity cut 10-15% per spec (we use 0.875 = 12.5% cut)
    expect(p.intensityMul).toBeGreaterThan(0.80);
    expect(p.intensityMul).toBeLessThan(0.95);
    expect(p.week).toBe(5);
  });

  it('week 6 (Day 35) wraps to week 1 policy', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    const p = getWeekPolicy({ today: new Date(2026, 5, 5) });
    expect(p.phase).toBe('load');
    expect(p.week).toBe(1);
  });
});

describe('deload skip', () => {
  it('isDeloadSkipped false when never skipped', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    expect(isDeloadSkipped({ today: new Date(2026, 4, 29) })).toBe(false);
  });

  it('isDeloadSkipped true after markDeloadSkipped within deload week', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    const now = new Date(2026, 4, 29).getTime();
    markDeloadSkipped({ now });
    expect(isDeloadSkipped({ today: new Date(2026, 4, 29) })).toBe(true);
  });

  it('isDeloadSkipped false when not in deload week', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    const now = new Date(2026, 4, 29).getTime();
    markDeloadSkipped({ now });
    // Same skip persists in storage but UI/banner only fires during deload week.
    expect(isDeloadSkipped({ today: new Date(2026, 4, 1) })).toBe(false);
  });

  it('skip resets across cycles (cycleStartDate boundary)', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    markDeloadSkipped({ now: new Date(2026, 4, 29).getTime() });
    expect(isDeloadSkipped({ today: new Date(2026, 4, 29) })).toBe(true);

    // New cycle starts.
    initCycle({ cycleStartDate: '2026-06-01' });
    // Old skip predates new cycle → not honored.
    expect(isDeloadSkipped({ today: new Date(2026, 5, 29) })).toBe(false);
  });
});

describe('deload skip banner', () => {
  it('returns null when not skipped', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    expect(getDeloadSkipBanner({ today: new Date(2026, 4, 29) })).toBeNull();
  });

  it('returns banner with LOCKED wording when skipped', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    markDeloadSkipped({ now: new Date(2026, 4, 29).getTime() });
    const banner = getDeloadSkipBanner({ today: new Date(2026, 4, 29) });
    expect(banner).not.toBeNull();
    expect(banner.severity).toBe('warning');
    // Wording must match LOCKED progressionMatrix helper VERBATIM.
    expect(banner.message).toBe(getDeloadSkipWarning());
    expect(banner.dismissId).toBe('linearBlock-deload-skip');
  });

  it('banner wording does not leak raw numerics', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    markDeloadSkipped({ now: new Date(2026, 4, 29).getTime() });
    const banner = getDeloadSkipBanner({ today: new Date(2026, 4, 29) });
    // Anti-RE: no percentage leaks, no "deviation", no "deload" rules-of-thumb numerics.
    expect(banner.message).not.toMatch(/\d+%/);
    expect(banner.message.toLowerCase()).not.toMatch(/deviation/);
    expect(banner.message.toLowerCase()).not.toMatch(/volume_mul|intensity_mul/);
  });
});

describe('getWeekLabel', () => {
  it('formats current week label', () => {
    initCycle({ cycleStartDate: '2026-05-01' });
    expect(getWeekLabel({ today: new Date(2026, 4, 1) })).toBe('Saptamana 1/5');
    expect(getWeekLabel({ today: new Date(2026, 4, 29) })).toBe('Saptamana 5/5');
  });
});

describe('WEEK_POLICY exposure', () => {
  it('exposes weeks 1-5', () => {
    expect(Object.keys(WEEK_POLICY).sort()).toEqual(['1', '2', '3', '4', '5']);
  });

  it('weeks 1-4 are load, week 5 is deload', () => {
    [1, 2, 3, 4].forEach(w => expect(WEEK_POLICY[w].phase).toBe('load'));
    expect(WEEK_POLICY[5].phase).toBe('deload');
  });
});

// ── getState defensive branches (uncovered catch + non-object parse) ─────────

describe('getState — defensive parsing', () => {
  it('returns null when nothing stored', () => {
    expect(getState()).toBeNull();
  });

  it('returns null on malformed JSON (catch branch)', () => {
    localStorage.setItem(LINEAR_BLOCK_KEY, '{not valid json');
    expect(getState()).toBeNull();
  });

  it('returns null when parsed value is not an object', () => {
    localStorage.setItem(LINEAR_BLOCK_KEY, '5');
    expect(getState()).toBeNull();
    localStorage.setItem(LINEAR_BLOCK_KEY, 'null');
    expect(getState()).toBeNull();
  });
});

describe('markDeloadSkipped — no prior state', () => {
  it('creates a fresh state when none exists', () => {
    expect(getState()).toBeNull();
    const now = new Date('2026-05-29').getTime();
    markDeloadSkipped({ now });
    const s = getState();
    expect(s).not.toBeNull();
    expect(s.deloadSkippedAt).toBe(now);
    expect(typeof s.cycleStartDate).toBe('string');
  });
});

describe('getCycleWeek / getWeekPolicy — uninitialized fallback', () => {
  it('getWeekPolicy defaults to week 1 load when uninitialized', () => {
    const p = getWeekPolicy();
    expect(p.week).toBe(1);
    expect(p.phase).toBe('load');
    expect(p.volumeMul).toBe(1.0);
  });

  it('getCycleWeek ignores malformed cycleStartDate (non-ISO → week 1)', () => {
    localStorage.setItem(LINEAR_BLOCK_KEY, JSON.stringify({ cycleStartDate: '05/29/2026', deloadSkippedAt: null }));
    expect(getCycleWeek({ today: new Date(2026, 4, 29) })).toBe(1);
  });
});
