// Tests for src/pages/idle.js — V2 vanilla port per V1_FEATURES_AUDIT verdict.
// Covers: F1 simplified patterns (LOW_ADHERENCE + STAGNATION only),
// F3 fatigue single-number, F8 streak, F9 BMR line, F10 stats grid,
// mockup FIX 4 lagging WHY, FIX 6 mini-player conditional, FIX 1/2 banners.

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.js', () => ({
  DB:  { get: vi.fn(() => null), set: vi.fn() },
  tod: vi.fn(() => '2026-05-11'),
  todDate: vi.fn(d => d.toISOString().slice(0, 10)),
}));
vi.mock('../constants.js', () => ({
  KCAL_TARGET: 2400,
  PROT_TARGET: 180,
  MS_PER_DAY: 86400000,
  MS_PER_HOUR: 3600000,
}));
vi.mock('../engine/fatigue.js', () => ({
  calculateFatigueScore: vi.fn(() => ({
    score: 67, label: 'MODERAT', color: 'var(--accent2)', icon: '🟡', detail: 'ok',
  })),
}));
vi.mock('../engine/readiness.js', () => ({
  getTodayReadiness: vi.fn(() => 4),
  getReadinessVerdict: vi.fn(() => ({ label: 'Sesiune normala', color: 'var(--accent)', volumeMultiplier: 1, canPR: false })),
  getReadinessScore: vi.fn(() => 78),
}));
vi.mock('../engine/coachDirector.js', () => ({
  coachDirector: {
    buildSession: vi.fn(async () => ({
      type: 'PUSH',
      exercises: [{ name: 'Incline DB Press', sets: 3 }],
      context: { patterns: [], patternsSuppressed: false, proactiveAlerts: [] },
    })),
  },
}));
vi.mock('../engine/sys.js', () => ({
  SYS: {
    getKcalTarget: vi.fn(() => 2350),
    getCurrentKg:  vi.fn(() => 80),
  },
}));

import {
  shouldShowPatternBanner,
  formatPatternMessage,
  getSimplifiedFatigue,
  computeStreak,
  getBmrLine,
  computeStatsGrid,
  getLaggingWhyLine,
  shouldShowMiniPlayer,
  getWarmupContextLine,
  getDeloadBanner,
  buildIdleSession,
  buildIdleViewModel,
} from '../pages/idle.js';
import { DB } from '../db.js';

beforeEach(() => {
  vi.clearAllMocks();
  DB.get.mockReturnValue(null);
});

describe('F1 verdict: simplified patterns (2 of 5)', () => {
  it('shouldShowPatternBanner true for LOW_ADHERENCE pattern', () => {
    const ctx = { patterns: [{ type: 'LOW_ADHERENCE', adherenceRate: 60 }], patternsSuppressed: false };
    expect(shouldShowPatternBanner(ctx)).toBe(true);
  });

  it('shouldShowPatternBanner false for dropped pattern types (HIGH_DEVIATION/EARLY_END/PEAK_HOURS)', () => {
    expect(shouldShowPatternBanner({ patterns: [{ type: 'HIGH_DEVIATION' }] })).toBe(false);
    expect(shouldShowPatternBanner({ patterns: [{ type: 'EARLY_END' }] })).toBe(false);
    expect(shouldShowPatternBanner({ patterns: [{ type: 'PEAK_HOURS' }] })).toBe(false);
  });

  it('formatPatternMessage returns string for kept types, null for dropped', () => {
    expect(formatPatternMessage({ type: 'LOW_ADHERENCE', adherenceRate: 55 }))
      .toMatch(/55%/);
    expect(formatPatternMessage({ type: 'STAGNATION', exercises: [1, 2, 3] }))
      .toMatch(/3 exercitii/);
    expect(formatPatternMessage({ type: 'EARLY_END', earlyEndRate: 80 })).toBeNull();
    expect(formatPatternMessage({ type: 'PEAK_HOURS', hours: '22h' })).toBeNull();
    expect(formatPatternMessage({ type: 'HIGH_DEVIATION' })).toBeNull();
  });

  it('shouldShowPatternBanner respects patternsSuppressed flag', () => {
    expect(shouldShowPatternBanner({
      patterns: [{ type: 'LOW_ADHERENCE', adherenceRate: 50 }],
      patternsSuppressed: true,
    })).toBe(false);
  });
});

describe('F3 verdict: simplified fatigue (single number + color, NU bar)', () => {
  it('returns flat object with score, label, color, icon', () => {
    const f = getSimplifiedFatigue();
    expect(f.score).toBe(67);
    expect(f.label).toBe('MODERAT');
    expect(f.color).toBe('var(--accent2)');
    expect(f.icon).toBe('🟡');
  });
});

describe('F8 streak counter (verbatim)', () => {
  it('counts consecutive days back from today', () => {
    const today = '2026-05-11';
    const logs = [
      { date: today, baseline: false },
      { date: '2026-05-10', baseline: false },
      { date: '2026-05-09', baseline: false },
      { date: '2026-05-07', baseline: false }, // gap
    ];
    expect(computeStreak(logs)).toBe(3);
  });

  it('returns 0 when no logs', () => {
    expect(computeStreak([])).toBe(0);
  });

  it('skips baseline logs', () => {
    const logs = [{ date: '2026-05-11', baseline: true }];
    expect(computeStreak(logs)).toBe(0);
  });
});

describe('F9 verdict: BMR single line', () => {
  it('returns "kcal · protein g" single-line string', () => {
    const line = getBmrLine();
    expect(line).toMatch(/2350 kcal/);
    expect(line).toMatch(/180g protein/);
    expect(line).not.toMatch(/\n/);
  });
});

describe('F10: stats grid', () => {
  it('returns streak + lastWeekSets + kcalBurn', () => {
    const logs = [
      { date: '2026-05-11', baseline: false },
      { date: '2026-05-10', baseline: false },
    ];
    const grid = computeStatsGrid(logs);
    expect(grid.streak).toBeGreaterThanOrEqual(0);
    expect(grid.lastWeekSets).toBe(2);
    expect(grid.kcalBurn).toBeGreaterThan(0);
  });
});

describe('FIX 4 weaknessDetector lagging WHY line', () => {
  it('returns null when no lagging muscles', () => {
    expect(getLaggingWhyLine([])).toBeNull();
  });

  it('returns descriptive line referencing sub-volume group', () => {
    const logs = [];
    const oneDay = 86400000;
    const now = Date.now();
    // Heavy chest+back, scarce shoulders
    for (let i = 0; i < 12; i++) {
      logs.push({ ex: 'Incline DB Press', w: 30, reps: 8, ts: now - i * oneDay });
      logs.push({ ex: 'Lat Pulldown',     w: 50, reps: 8, ts: now - i * oneDay });
    }
    logs.push({ ex: 'Lateral Raises', w: 10, reps: 12, ts: now - 2 * oneDay });
    const line = getLaggingWhyLine(logs);
    expect(line).toBeTruthy();
    expect(line.toLowerCase()).toMatch(/sub-volum|sapt/i);
  });
});

describe('FIX 6 Mini-player conditional render', () => {
  it('returns false when no active session', () => {
    expect(shouldShowMiniPlayer(null)).toBe(false);
    expect(shouldShowMiniPlayer({})).toBe(false);
    expect(shouldShowMiniPlayer({ active: false })).toBe(false);
  });

  it('returns true only when dirSession.active === true', () => {
    expect(shouldShowMiniPlayer({ active: true })).toBe(true);
  });
});

describe('FIX 1 Warmup adaptive ctx + FIX 2 Deload banner', () => {
  it('getWarmupContextLine: null when no warmup, formatted line when present', () => {
    expect(getWarmupContextLine(null)).toBeNull();
    expect(getWarmupContextLine({})).toBeNull();
    const line = getWarmupContextLine({ warmup: { durationMin: 7, routine: 'cardiacă + scapular' } });
    expect(line).toMatch(/7 min/);
    expect(line).toMatch(/scapular/);
  });

  it('getDeloadBanner: null when no _deload, banner string when _deload flagged', () => {
    expect(getDeloadBanner({})).toBeNull();
    const banner = getDeloadBanner({ _deload: true });
    expect(banner).toMatch(/[Dd]eload/);
    expect(banner).toMatch(/volum|intensitate/);
  });
});

describe('buildIdleViewModel: top-level orchestration', () => {
  it('returns view-model with all required keys', async () => {
    const vm = await buildIdleViewModel({ sessionType: 'PUSH' });
    expect(vm).toHaveProperty('session');
    expect(vm).toHaveProperty('readiness');
    expect(vm).toHaveProperty('stats');
    expect(vm).toHaveProperty('fatigue');
    expect(vm).toHaveProperty('bmrLine');
    expect(vm).toHaveProperty('laggingWhy');
    expect(vm).toHaveProperty('warmupCtx');
    expect(vm).toHaveProperty('deloadBanner');
    expect(vm).toHaveProperty('miniPlayer');
    expect(vm).toHaveProperty('patternsBanner');
    expect(vm.session.type).toBe('PUSH');
  });

  it('buildIdleSession degrades gracefully on coach throw → returns null', async () => {
    const { coachDirector } = await import('../engine/coachDirector.js');
    coachDirector.buildSession.mockRejectedValueOnce(new Error('boom'));
    const session = await buildIdleSession('PUSH');
    expect(session).toBeNull();
  });
});
