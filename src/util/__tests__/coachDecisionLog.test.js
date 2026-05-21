import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockStorage = {};
vi.mock('../../db.js', () => ({
  DB: {
    get: vi.fn(key => mockStorage[key] ?? null),
    set: vi.fn((key, val) => { mockStorage[key] = val; }),
  },
}));

import {
  writeProposed,
  populateOutcome,
  readActiveForDate,
  readSupersedeChain,
  computeMatchScore,
  demoteToTier2,
  demoteToTier3,
  STORAGE_KEYS,
} from '../coachDecisionLog.js';

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

function makeEntry(overrides = {}) {
  const base = {
    date: '2026-04-25',
    context: {
      calibrationLevel: 'PERSONALIZING',
      readinessScore: 75,
      fatigueIndex: 0.3,
      daysSinceLastSession: 2,
      lastSessionType: 'PULL',
      isInCut: true,
      weakGroups: [],
      stagnationWeeks: 0,
      predictionToday: { isHighRisk: false, probability: 0.1 },
      partial: false,
    },
    proposed: {
      sessionType: 'PUSH',
      rationale: { winnerId: 'CUT_CONSERVATIVE', winnerPriority: 85, overridden: [] },
      exercises: ['Incline DB Press', 'Pec Deck'],
      proposedSets: 18,
      volumeMultiplier: 0.9,
      notes: '',
    },
  };
  return {
    ...base,
    ...overrides,
    context: { ...base.context, ...(overrides.context ?? {}) },
    proposed: { ...base.proposed, ...(overrides.proposed ?? {}) },
  };
}

// ── Test 1 ─────────────────────────────────────────────────────────────────
describe('writeProposed', () => {
  it('creates entry with valid schema', () => {
    const e = writeProposed(makeEntry());

    expect(typeof e.id).toBe('string');
    expect(e.id).toMatch(/^cd_/);
    expect(typeof e.ts).toBe('number');
    expect(e.synthetic).toBe(false);
    expect(e.superseded).toBe(false);
    expect(e.supersedes).toBeNull();
    expect(e.outcome).toBeNull();
    const stored = mockStorage[STORAGE_KEYS.TIER_1];
    expect(stored).toHaveLength(1);
  });

  // ── Test 2 ───────────────────────────────────────────────────────────────
  it('within 4h + same context returns existing (idempotent)', () => {
    vi.useFakeTimers();
    const t0 = Date.now();
    vi.setSystemTime(t0);
    const e1 = writeProposed(makeEntry());

    vi.setSystemTime(t0 + 3 * 60 * 60 * 1000); // +3h
    const e2 = writeProposed(makeEntry());

    expect(e2.id).toBe(e1.id);
    expect(mockStorage[STORAGE_KEYS.TIER_1]).toHaveLength(1);
  });

  // ── Test 3 ───────────────────────────────────────────────────────────────
  it('after 4h+ returns new entry (window expired)', () => {
    vi.useFakeTimers();
    const t0 = Date.now();
    vi.setSystemTime(t0);
    const e1 = writeProposed(makeEntry());

    vi.setSystemTime(t0 + 5 * 60 * 60 * 1000); // +5h
    const e2 = writeProposed(makeEntry());

    expect(e2.id).not.toBe(e1.id);
    const stored = mockStorage[STORAGE_KEYS.TIER_1];
    const old = stored.find(e => e.id === e1.id);
    expect(old.superseded).toBe(true);
    expect(e2.supersedes).toBe(e1.id);
  });

  // ── Test 4 ───────────────────────────────────────────────────────────────
  it('after readinessScore delta > 20 supersedes within 4h window', () => {
    vi.useFakeTimers();
    const t0 = Date.now();
    vi.setSystemTime(t0);
    const e1 = writeProposed(makeEntry({ context: { readinessScore: 75 } }));

    vi.setSystemTime(t0 + 60 * 60 * 1000); // +1h (within window)
    const e2 = writeProposed(makeEntry({ context: { readinessScore: 50 } }));

    const stored = mockStorage[STORAGE_KEYS.TIER_1];
    const old = stored.find(e => e.id === e1.id);
    expect(old.superseded).toBe(true);
    expect(e2.supersedes).toBe(e1.id);
    expect(stored).toHaveLength(2);
  });

  // ── Test 5 ───────────────────────────────────────────────────────────────
  it('after weakGroups change supersedes', () => {
    vi.useFakeTimers();
    const t0 = Date.now();
    vi.setSystemTime(t0);
    const e1 = writeProposed(makeEntry({ context: { weakGroups: [] } }));

    vi.setSystemTime(t0 + 30 * 60 * 1000); // +30min
    const e2 = writeProposed(makeEntry({ context: { weakGroups: ['shoulders'] } }));

    expect(mockStorage[STORAGE_KEYS.TIER_1].find(e => e.id === e1.id).superseded).toBe(true);
    expect(e2.supersedes).toBe(e1.id);
  });

  // ── Test 6 ───────────────────────────────────────────────────────────────
  it('after calibrationLevel transition supersedes', () => {
    vi.useFakeTimers();
    const t0 = Date.now();
    vi.setSystemTime(t0);
    const e1 = writeProposed(makeEntry({ context: { calibrationLevel: 'PERSONALIZING' } }));

    vi.setSystemTime(t0 + 60 * 60 * 1000);
    const e2 = writeProposed(makeEntry({ context: { calibrationLevel: 'PERSONALIZED' } }));

    expect(mockStorage[STORAGE_KEYS.TIER_1].find(e => e.id === e1.id).superseded).toBe(true);
    expect(e2.supersedes).toBe(e1.id);
  });
});

// ── Test 7 ─────────────────────────────────────────────────────────────────
describe('populateOutcome', () => {
  it('targets most recent non-superseded entry', () => {
    vi.useFakeTimers();
    const t0 = Date.now();
    vi.setSystemTime(t0);
    const e1 = writeProposed(makeEntry());

    // Supersede via context change within 4h window
    vi.setSystemTime(t0 + 30 * 60 * 1000);
    const e2 = writeProposed(makeEntry({ context: { calibrationLevel: 'PERSONALIZED' } }));

    const outcome = { executed: true, deviation: false, actualSessionType: 'PUSH', matchScore: 0.9, actualSets: 16, proposedSets: 18 };
    const result = populateOutcome('2026-04-25', outcome);

    expect(result.id).toBe(e2.id);
    const stored = mockStorage[STORAGE_KEYS.TIER_1];
    const first = stored.find(e => e.id === e1.id);
    expect(first.outcome).toBeNull();
    expect(result.outcome.executed).toBe(true);
  });

  // ── Test 8 ───────────────────────────────────────────────────────────────
  it('throws if outcome already set (immutability)', () => {
    writeProposed(makeEntry());
    const outcome = { executed: true, deviation: false };
    populateOutcome('2026-04-25', outcome);
    expect(() => populateOutcome('2026-04-25', { executed: false }))
      .toThrow(/immutability|already populated/i);
  });

  // ── Test 9 ───────────────────────────────────────────────────────────────
  it('throws when no active entry for date', () => {
    expect(() => populateOutcome('2026-04-30', { executed: true }))
      .toThrow(/No active CDL entry/);
  });
});

// ── Test 10 ────────────────────────────────────────────────────────────────
describe('computeMatchScore', () => {
  it('returns null + deviation when sessionType differs', () => {
    const result = computeMatchScore(
      { sessionType: 'PUSH', exercises: ['A'], proposedSets: 10 },
      { actualSessionType: 'PULL', actualExercises: ['B'], actualSets: 10 },
    );
    expect(result.matchScore).toBeNull();
    expect(result.deviation).toBe(true);
  });

  // ── Test 11 ──────────────────────────────────────────────────────────────
  it('returns weighted result when sessionType matches', () => {
    const result = computeMatchScore(
      { sessionType: 'PUSH', exercises: ['A', 'B', 'C', 'D'], proposedSets: 18 },
      { actualSessionType: 'PUSH', actualExercises: ['A', 'B', 'C'], actualSets: 16 },
    );
    // volumeRatio = 16/18 ≈ 0.8889, exerciseOverlap = jaccard([A,B,C,D],[A,B,C]) = 3/4 = 0.75
    // score = 0.6 * (16/18) + 0.4 * 0.75
    const expected = 0.6 * (16 / 18) + 0.4 * 0.75;
    expect(result.deviation).toBe(false);
    expect(Math.abs(result.matchScore - expected)).toBeLessThan(0.01);
  });
});

// ── Test 12 ────────────────────────────────────────────────────────────────
describe('readActiveForDate', () => {
  it('filters out superseded entries', () => {
    vi.useFakeTimers();
    const t0 = Date.now();
    vi.setSystemTime(t0);
    writeProposed(makeEntry({ context: { calibrationLevel: 'INITIAL' } }));

    vi.setSystemTime(t0 + 30 * 60 * 1000);
    writeProposed(makeEntry({ context: { calibrationLevel: 'PERSONALIZING' } }));

    vi.setSystemTime(t0 + 60 * 60 * 1000);
    const e3 = writeProposed(makeEntry({ context: { calibrationLevel: 'PERSONALIZED' } }));

    const active = readActiveForDate('2026-04-25');
    expect(active.id).toBe(e3.id);
  });
});

// ── Test 13 ────────────────────────────────────────────────────────────────
describe('readSupersedeChain', () => {
  it('returns full chain in chronological order', () => {
    vi.useFakeTimers();
    const t0 = Date.now();
    vi.setSystemTime(t0);
    const e1 = writeProposed(makeEntry({ context: { calibrationLevel: 'INITIAL' } }));

    vi.setSystemTime(t0 + 30 * 60 * 1000);
    const e2 = writeProposed(makeEntry({ context: { calibrationLevel: 'PERSONALIZING' } }));

    vi.setSystemTime(t0 + 60 * 60 * 1000);
    const e3 = writeProposed(makeEntry({ context: { calibrationLevel: 'PERSONALIZED' } }));

    const chain = readSupersedeChain(e3.id);
    expect(chain).toHaveLength(3);
    expect(chain[0].id).toBe(e1.id);
    expect(chain[1].id).toBe(e2.id);
    expect(chain[2].id).toBe(e3.id);
    // chronological (ascending ts)
    expect(chain[0].ts).toBeLessThan(chain[1].ts);
    expect(chain[1].ts).toBeLessThan(chain[2].ts);
  });
});

// ── Test 14 ────────────────────────────────────────────────────────────────
describe('demoteToTier2', () => {
  it('moves entries older than 180 days and drops fields', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    const old200 = {
      id: 'cd_old_200',
      ts: now - 200 * 86400000,
      date: '2025-10-08',
      synthetic: false,
      superseded: false,
      supersedes: null,
      context: { calibrationLevel: 'PERSONALIZING', isInCut: true, readinessScore: 80 },
      proposed: {
        sessionType: 'PUSH',
        rationale: { winnerId: 'CUT_CONSERVATIVE', winnerPriority: 85, overridden: [] },
        exercises: ['Bench', 'Pec Deck'],
        proposedSets: 18,
        notes: 'some notes',
      },
      outcome: { executed: true, deviation: false, matchScore: 0.85, actualSets: 16 },
    };

    const fresh50 = {
      id: 'cd_fresh_50',
      ts: now - 50 * 86400000,
      date: '2026-03-06',
      synthetic: false,
      superseded: false,
      supersedes: null,
      context: { calibrationLevel: 'PERSONALIZED', isInCut: false, readinessScore: 90 },
      proposed: {
        sessionType: 'PULL',
        rationale: { winnerId: 'VOLUME_COMPENSATION', winnerPriority: 60, overridden: [] },
        exercises: ['Pull-up'],
        proposedSets: 12,
        notes: '',
      },
      outcome: { executed: true, deviation: false, matchScore: 0.95, actualSets: 12 },
    };

    mockStorage[STORAGE_KEYS.TIER_1] = [old200, fresh50];

    const result = demoteToTier2();

    expect(result.demoted).toBe(1);
    expect(result.errors).toHaveLength(0);

    const tier1 = mockStorage[STORAGE_KEYS.TIER_1];
    expect(tier1).toHaveLength(1);
    expect(tier1[0].id).toBe('cd_fresh_50');

    const tier2 = mockStorage[STORAGE_KEYS.TIER_2];
    expect(tier2).toHaveLength(1);
    const agg = tier2[0];
    expect(agg.id).toBe('cd_old_200');
    expect(agg.sessionType).toBe('PUSH');
    expect(agg.calibrationLevel).toBe('PERSONALIZING');
    expect(agg.winnerId).toBe('CUT_CONSERVATIVE');
    expect(agg.executed).toBe(true);
    expect(agg.matchScore).toBe(0.85);
    // Dropped fields
    expect(agg.readinessScore).toBeUndefined();
    expect(agg.exercises).toBeUndefined();
    expect(agg.notes).toBeUndefined();
    expect(agg.overridden).toBeUndefined();
  });
});

// ── Test 15 ────────────────────────────────────────────────────────────────
describe('demoteToTier3', () => {
  it('aggregates entries older than 1 year into monthly archive', () => {
    // Fixed mid-month to prevent month-boundary flakiness on tsBase+3d
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
    const now = Date.now();

    // 4 entries from ~14 months ago, 2 PUSH and 2 PULL
    const tsBase = now - 425 * 86400000; // ~14 months ago
    const month = new Date(tsBase).toISOString().slice(0, 7);

    mockStorage[STORAGE_KEYS.TIER_2] = [
      { id: 'a1', ts: tsBase, date: `${month}-05`, sessionType: 'PUSH', synthetic: false, superseded: false, executed: true, deviation: false, matchScore: 0.9, calibrationLevel: 'PERSONALIZING', isInCut: true, winnerId: 'CUT_CONSERVATIVE' },
      { id: 'a2', ts: tsBase + 86400000, date: `${month}-06`, sessionType: 'PUSH', synthetic: false, superseded: false, executed: true, deviation: false, matchScore: 0.8, calibrationLevel: 'PERSONALIZING', isInCut: true, winnerId: 'CUT_CONSERVATIVE' },
      { id: 'a3', ts: tsBase + 2 * 86400000, date: `${month}-07`, sessionType: 'PULL', synthetic: false, superseded: false, executed: false, deviation: true, matchScore: null, calibrationLevel: 'PERSONALIZING', isInCut: true, winnerId: 'REST_DAY' },
      { id: 'a4', ts: tsBase + 3 * 86400000, date: `${month}-08`, sessionType: 'PULL', synthetic: false, superseded: false, executed: true, deviation: false, matchScore: 0.7, calibrationLevel: 'PERSONALIZING', isInCut: true, winnerId: 'VOLUME_COMPENSATION' },
    ];

    const result = demoteToTier3();

    expect(result.demoted).toBe(4);
    expect(result.errors).toHaveLength(0);

    const tier2 = mockStorage[STORAGE_KEYS.TIER_2];
    expect(tier2).toHaveLength(0);

    const tier3 = mockStorage[STORAGE_KEYS.TIER_3];
    const pushKey = `${month}_PUSH`;
    const pullKey = `${month}_PULL`;
    expect(tier3[pushKey]).toBeDefined();
    expect(tier3[pullKey]).toBeDefined();

    expect(tier3[pushKey].count).toBe(2);
    expect(tier3[pushKey].executedRate).toBe(1);
    expect(tier3[pushKey].deviationRate).toBe(0);

    expect(tier3[pullKey].count).toBe(2);
    expect(tier3[pullKey].executedRate).toBe(0.5);
    expect(tier3[pullKey].deviationRate).toBe(0.5);
  });
});

// ── Test 16 ────────────────────────────────────────────────────────────────
describe('idempotency in quick succession', () => {
  it('two immediate calls produce one active entry', () => {
    const e1 = writeProposed(makeEntry());
    const e2 = writeProposed(makeEntry());

    expect(e1.id).toBe(e2.id);
    const tier1 = mockStorage[STORAGE_KEYS.TIER_1];
    expect(tier1.filter(e => e.superseded !== true)).toHaveLength(1);
  });
});

// ── Test 17 ────────────────────────────────────────────────────────────────
describe('supersede chain 3 entries within a day', () => {
  it('readActiveForDate returns 4th, readSupersedeChain returns 4 entries ascending', () => {
    vi.useFakeTimers();
    const t0 = Date.now();

    vi.setSystemTime(t0);
    writeProposed(makeEntry({ context: { calibrationLevel: 'INITIAL' } }));

    vi.setSystemTime(t0 + 30 * 60 * 1000);
    writeProposed(makeEntry({ context: { calibrationLevel: 'PERSONALIZING' } }));

    vi.setSystemTime(t0 + 60 * 60 * 1000);
    writeProposed(makeEntry({ context: { calibrationLevel: 'PERSONALIZED' } }));

    vi.setSystemTime(t0 + 90 * 60 * 1000);
    const e4 = writeProposed(makeEntry({ context: { calibrationLevel: 'OPTIMIZED' } }));

    const active = readActiveForDate('2026-04-25');
    expect(active.id).toBe(e4.id);

    const chain = readSupersedeChain(e4.id);
    expect(chain).toHaveLength(4);
    for (let i = 0; i < chain.length - 1; i++) {
      expect(chain[i].ts).toBeLessThan(chain[i + 1].ts);
    }
  });
});
