import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockReadAllActive } = vi.hoisted(() => ({
  mockReadAllActive: vi.fn(() => []),
}));

const mockStorage = {};

vi.mock('../../util/coachDecisionLog.js', () => ({
  readAllActive: mockReadAllActive,
}));

vi.mock('../../db.js', () => ({
  DB: {
    get: vi.fn(key => mockStorage[key] ?? null),
    set: vi.fn((key, val) => { mockStorage[key] = val; }),
  },
  todDate: vi.fn(d => d.toLocaleDateString('sv')),
}));

import { analyzeFromCDL, analyzeAndApplyPatterns, CDL_PATTERNS_KEY } from '../patternLearning.js';
import { DB } from '../../db.js';

function makeCDLEntry({
  ts = Date.now(),
  synthetic = false,
  executed = true,
  deviation = false,
  earlyStop = false,
} = {}) {
  return {
    ts,
    synthetic,
    superseded: false,
    outcome: { executed, deviation, earlyStop, matchScore: deviation ? null : 1.0 },
    proposed: { sessionType: 'PUSH', exercises: ['Bench Press'] },
  };
}

// Enough session-burns to pass _analyze guards (8+ recent, 4+ in last 4 weeks)
const now = Date.now();
function makeBurns(count = 8) {
  return Array.from({ length: count }, (_, i) => ({
    date: new Date(now - i * 3 * 86400000).toLocaleDateString('sv'),
  }));
}

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  vi.clearAllMocks();
  mockReadAllActive.mockReturnValue([]);
});

afterEach(() => {
  vi.useRealTimers();
});

// ── 1. analyzeFromCDL — empty CDL ───────────────────────────────────────────

describe('analyzeFromCDL', () => {
  it('returns [] when CDL is empty', () => {
    mockReadAllActive.mockReturnValue([]);
    const result = analyzeFromCDL();
    expect(result).toEqual([]);
  });

  it('filters out entries with null outcome', () => {
    // 10 entries but all have null outcome → below MIN_CDL_WEIGHT → []
    mockReadAllActive.mockReturnValue(
      Array.from({ length: 10 }, () => ({ ts: now, synthetic: false, outcome: null }))
    );
    expect(analyzeFromCDL()).toEqual([]);
  });

  it('returns [] when weighted total < 4 (below MIN_CDL_WEIGHT)', () => {
    // 3 real entries (weight 3 < 4)
    mockReadAllActive.mockReturnValue([
      makeCDLEntry({ executed: true }),
      makeCDLEntry({ executed: true }),
      makeCDLEntry({ executed: true }),
    ]);
    expect(analyzeFromCDL()).toHaveLength(0);
  });

  // ── 2. LOW_ADHERENCE ──────────────────────────────────────────────────────

  it('fires LOW_ADHERENCE when adherenceRate < 50%', () => {
    // 4 entries: 1 adhered + 3 not adhered → 25% adherence
    mockReadAllActive.mockReturnValue([
      makeCDLEntry({ executed: true, deviation: false }),
      makeCDLEntry({ executed: false }),
      makeCDLEntry({ executed: false }),
      makeCDLEntry({ executed: false }),
    ]);
    const patterns = analyzeFromCDL();
    expect(patterns.some(p => p.type === 'LOW_ADHERENCE')).toBe(true);
    const p = patterns.find(p => p.type === 'LOW_ADHERENCE');
    expect(p.adherenceRate).toBe(25);
  });

  it('does NOT fire LOW_ADHERENCE when adherenceRate >= 50%', () => {
    // 4 entries: all adhered → 100% adherence
    mockReadAllActive.mockReturnValue([
      makeCDLEntry({ executed: true }),
      makeCDLEntry({ executed: true }),
      makeCDLEntry({ executed: true }),
      makeCDLEntry({ executed: true }),
    ]);
    const patterns = analyzeFromCDL();
    expect(patterns.some(p => p.type === 'LOW_ADHERENCE')).toBe(false);
  });

  // ── 3. HIGH_DEVIATION ─────────────────────────────────────────────────────

  it('fires HIGH_DEVIATION when deviationRate > 30%', () => {
    // 4 entries: 2 deviated → 50% deviation
    mockReadAllActive.mockReturnValue([
      makeCDLEntry({ executed: true, deviation: true }),
      makeCDLEntry({ executed: true, deviation: true }),
      makeCDLEntry({ executed: true, deviation: false }),
      makeCDLEntry({ executed: true, deviation: false }),
    ]);
    const patterns = analyzeFromCDL();
    expect(patterns.some(p => p.type === 'HIGH_DEVIATION')).toBe(true);
    const p = patterns.find(p => p.type === 'HIGH_DEVIATION');
    expect(p.deviationRate).toBe(50);
  });

  // ── 4. Synthetic entries weight 0.5× ──────────────────────────────────────

  it('weights synthetic entries at 0.5x in adherence calculation', () => {
    // 2 real adhered (weight 2) + 4 synthetic non-adhered (weight 2) = totalWeight 4
    // adheredWeight = 2, totalWeight = 4 → adherenceRate = 50% (not < 50% → no LOW_ADHERENCE)
    mockReadAllActive.mockReturnValue([
      makeCDLEntry({ executed: true, synthetic: false }),
      makeCDLEntry({ executed: true, synthetic: false }),
      makeCDLEntry({ executed: false, synthetic: true }),
      makeCDLEntry({ executed: false, synthetic: true }),
      makeCDLEntry({ executed: false, synthetic: true }),
      makeCDLEntry({ executed: false, synthetic: true }),
    ]);
    const patterns = analyzeFromCDL();
    // adherence = 2 / 4 = 50% → NOT < 50 → no LOW_ADHERENCE
    expect(patterns.some(p => p.type === 'LOW_ADHERENCE')).toBe(false);
  });

  it('synthetic at 0.5x can tip adherence below threshold', () => {
    // 1 real adhered (weight 1) + 6 synthetic non-adhered (weight 3) = total 4
    // adheredWeight = 1, totalWeight = 4 → 25% adherence → LOW_ADHERENCE fires
    mockReadAllActive.mockReturnValue([
      makeCDLEntry({ executed: true, synthetic: false }),
      makeCDLEntry({ executed: false, synthetic: true }),
      makeCDLEntry({ executed: false, synthetic: true }),
      makeCDLEntry({ executed: false, synthetic: true }),
      makeCDLEntry({ executed: false, synthetic: true }),
      makeCDLEntry({ executed: false, synthetic: true }),
      makeCDLEntry({ executed: false, synthetic: true }),
    ]);
    const patterns = analyzeFromCDL();
    expect(patterns.some(p => p.type === 'LOW_ADHERENCE')).toBe(true);
  });

  // ── 5. SKIP_DAY never produced ────────────────────────────────────────────

  it('never produces SKIP_DAY pattern', () => {
    // Maximum possible scenario to trigger patterns
    mockReadAllActive.mockReturnValue(
      Array.from({ length: 10 }, () => makeCDLEntry({ executed: false }))
    );
    const patterns = analyzeFromCDL();
    expect(patterns.some(p => p.type === 'SKIP_DAY')).toBe(false);
  });

  // ── 6. STAGNATION from logs ───────────────────────────────────────────────

  it('fires STAGNATION from logs when exercise weights stagnate 9+ sessions', () => {
    mockReadAllActive.mockReturnValue([]);
    // 9 logs for same exercise with identical weight (triggers stagnation)
    mockStorage['logs'] = Array.from({ length: 9 }, (_, i) => ({
      ex: 'Bench Press', w: 80, reps: 8, ts: i * 1000, session: i * 1000,
    }));
    // CDL empty → no CDL patterns, but STAGNATION from logs still fires
    const patterns = analyzeFromCDL();
    expect(patterns.some(p => p.type === 'STAGNATION')).toBe(true);
    const p = patterns.find(p => p.type === 'STAGNATION');
    expect(p.exercises).toContain('Bench Press');
  });

  // ── 7. EARLY_END from CDL ─────────────────────────────────────────────────

  it('fires EARLY_END from CDL when earlyStop rate > 40%', () => {
    // 4 entries: 3 earlyStop=true + 1 normal → earlyEndRate = 3/4 = 75%
    mockReadAllActive.mockReturnValue([
      makeCDLEntry({ executed: 'partial', earlyStop: true }),
      makeCDLEntry({ executed: 'partial', earlyStop: true }),
      makeCDLEntry({ executed: 'partial', earlyStop: true }),
      makeCDLEntry({ executed: true }),
    ]);
    const patterns = analyzeFromCDL();
    expect(patterns.some(p => p.type === 'EARLY_END')).toBe(true);
    const p = patterns.find(p => p.type === 'EARLY_END');
    expect(p.earlyEndRate).toBe(75);
  });

  // ── 8. Parallel write — analyzeAndApplyPatterns ───────────────────────────

  it('analyzeAndApplyPatterns writes cdl-patterns key in parallel with applied-patterns', () => {
    vi.useFakeTimers();

    // Burns: 8 burns spanning 3-day intervals → all within 8 weeks, 4+ within 4 weeks
    mockStorage['session-burns'] = makeBurns(8);

    // 9 stagnating logs → triggers STAGNATION → applied-patterns write
    const staleLogs = Array.from({ length: 9 }, (_, i) => ({
      ex: 'Squat', w: 100, reps: 5, ts: i * 1000, session: i * 1000,
    }));
    const padLogs = Array.from({ length: 16 }, (_, i) => ({
      ex: `Filler${i}`, w: 60, reps: 10, ts: 100000 + i, session: 100000 + i,
    }));

    mockReadAllActive.mockReturnValue([]);

    analyzeAndApplyPatterns([...staleLogs, ...padLogs]);
    vi.runAllTimers();

    const setCalls = DB.set.mock.calls.map(([key]) => key);
    expect(setCalls).toContain(CDL_PATTERNS_KEY);
    expect(setCalls).toContain('applied-patterns');
  });

  it('cdl-patterns written even when CDL is empty (empty array persisted)', () => {
    vi.useFakeTimers();
    mockStorage['session-burns'] = makeBurns(8);
    const logs = Array.from({ length: 25 }, (_, i) => ({
      ex: `Ex${i}`, w: 60, reps: 10, ts: i * 1000, session: i * 1000,
    }));
    mockReadAllActive.mockReturnValue([]);

    analyzeAndApplyPatterns(logs);
    vi.runAllTimers();

    const setCalls = DB.set.mock.calls.map(([key]) => key);
    expect(setCalls).toContain(CDL_PATTERNS_KEY);
    expect(mockStorage[CDL_PATTERNS_KEY]).toEqual([]);
  });
});
