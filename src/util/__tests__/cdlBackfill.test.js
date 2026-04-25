import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockStorage = {};
vi.mock('../../db.js', () => ({
  DB: {
    get: vi.fn(key => mockStorage[key] ?? null),
    set: vi.fn((key, val) => { mockStorage[key] = val; }),
  },
}));

import {
  runBackfill,
  inferSessionType,
  reconstructContext,
  synthesizeOutcome,
  getValidationSamples,
} from '../cdlBackfill.js';

const CDL_KEY = 'coach-decisions';

// Session timestamps 2 days apart to avoid date collisions
const TS1 = 1700000000000; // session 1
const TS2 = 1700000000000 + 86400000; // session 2 (+1 day)
const TS3 = TS2 + 86400000; // session 3 (+1 day)

function makeLogs(sessionTs, exercises, setsEach = 3) {
  const logs = [];
  exercises.forEach((ex, ei) => {
    for (let s = 0; s < setsEach; s++) {
      logs.push({ session: sessionTs, ex, w: 80, reps: 10, ts: sessionTs + ei * 100 + s });
    }
  });
  return logs;
}

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

// ── 1. inferSessionType ──────────────────────────────────────────────────────

describe('inferSessionType', () => {
  it('returns PUSH for chest/shoulders/triceps exercises', () => {
    // All in EXERCISE_MUSCLES, all map to PUSH muscles
    const result = inferSessionType([
      'Incline DB Press', 'DB Shoulder Press', 'Lateral Raises', 'Pushdown',
    ]);
    expect(result).toBe('PUSH');
  });

  it('returns PULL for back/biceps exercises', () => {
    const result = inferSessionType([
      'Lat Pulldown', 'Cable Row', 'Bayesian Curl',
    ]);
    expect(result).toBe('PULL');
  });

  it('returns LEGS for quads/hamstrings/glutes exercises', () => {
    const result = inferSessionType([
      'Leg Press', 'Leg Extension', 'Leg Curl',
    ]);
    expect(result).toBe('LEGS');
  });

  it('returns MIXED for cross-cutting upper + lower exercises', () => {
    // 1 PUSH + 1 PULL + 1 LEGS — no category dominates (each = 33%)
    const result = inferSessionType([
      'Incline DB Press', 'Lat Pulldown', 'Leg Press',
    ]);
    expect(result).toBe('MIXED');
  });

  it('returns UNKNOWN when all exercises have no known muscle groups', () => {
    const result = inferSessionType(['Random Exercise XYZ']);
    expect(result).toBe('UNKNOWN');
  });
});

// ── 2. reconstructContext ────────────────────────────────────────────────────

describe('reconstructContext', () => {
  it('sets calibrationLevel to PERSONALIZING with 5 prior sessions', () => {
    // 5 distinct session timestamps before sessionTs → sessionsCount = 5
    const priorSessions = [1000, 2000, 3000, 4000, 5000];
    const allLogs = [];
    priorSessions.forEach(ts => {
      allLogs.push({ session: ts, ex: 'Incline DB Press', w: 80, reps: 10, ts: ts + 1 });
    });
    const sessionTs = 6000;

    const ctx = reconstructContext(sessionTs, allLogs);
    expect(ctx.calibrationLevel).toBe('PERSONALIZING');
  });

  it('always sets context.partial = true', () => {
    const ctx = reconstructContext(999999, []);
    expect(ctx.partial).toBe(true);
  });

  it('sets calibrationLevel COLD_START with 0 prior sessions', () => {
    const ctx = reconstructContext(1000, []);
    expect(ctx.calibrationLevel).toBe('COLD_START');
  });

  it('sets calibrationLevel INITIAL with 2 prior sessions', () => {
    const allLogs = [
      { session: 100, ex: 'Incline DB Press', w: 80, reps: 10, ts: 101 },
      { session: 200, ex: 'Incline DB Press', w: 80, reps: 10, ts: 201 },
    ];
    const ctx = reconstructContext(300, allLogs);
    expect(ctx.calibrationLevel).toBe('INITIAL');
  });

  it('sets calibrationLevel PERSONALIZED with 10+ prior sessions', () => {
    const allLogs = Array.from({ length: 10 }, (_, i) => ({
      session: (i + 1) * 1000,
      ex: 'Incline DB Press',
      w: 80,
      reps: 10,
      ts: (i + 1) * 1000 + 1,
    }));
    const ctx = reconstructContext(11000, allLogs);
    expect(ctx.calibrationLevel).toBe('PERSONALIZED');
  });

  it('sets non-reconstructible fields to null/empty', () => {
    const ctx = reconstructContext(9999, []);
    expect(ctx.readinessScore).toBeNull();
    expect(ctx.fatigueIndex).toBeNull();
    expect(ctx.isInCut).toBeNull();
    expect(ctx.predictionToday).toBeNull();
    expect(ctx.weakGroups).toEqual([]);
    expect(ctx.stagnationWeeks).toBe(0);
  });
});

// ── 3. synthesizeOutcome ─────────────────────────────────────────────────────

describe('synthesizeOutcome', () => {
  it('derives counts correctly from session logs', () => {
    // 3 unique exercises × 3 sets = 9 logs
    const sessionLogs = makeLogs(TS1, ['Incline DB Press', 'DB Shoulder Press', 'Pushdown'], 3);
    expect(sessionLogs).toHaveLength(9);

    const outcome = synthesizeOutcome(sessionLogs);
    expect(outcome.actualSets).toBe(9);
    expect(outcome.completedExercises).toBe(3);
    expect(outcome.totalProposedExercises).toBe(3);
    expect(outcome.deviation).toBe(false);
    expect(outcome.executed).toBe(true);
    expect(outcome.matchScore).toBe(1.0);
    expect(outcome.earlyStop).toBeNull();
    expect(outcome.rating).toBeNull();
  });

  it('infers actualSessionType from exercise list', () => {
    const sessionLogs = makeLogs(TS1, ['Lat Pulldown', 'Cable Row', 'Bayesian Curl'], 2);
    const outcome = synthesizeOutcome(sessionLogs);
    expect(outcome.actualSessionType).toBe('PULL');
  });

  it('sets completedAt to max ts in sessionLogs', () => {
    const logs = [
      { session: TS1, ex: 'Pushdown', w: 50, reps: 12, ts: 1000 },
      { session: TS1, ex: 'Pushdown', w: 50, reps: 10, ts: 3000 },
      { session: TS1, ex: 'Pushdown', w: 50, reps: 8,  ts: 2000 },
    ];
    const outcome = synthesizeOutcome(logs);
    expect(outcome.completedAt).toBe(3000);
  });
});

// ── 4. runBackfill ───────────────────────────────────────────────────────────

describe('runBackfill', () => {
  it('creates synthetic entries from 2 valid sessions (18 logs total)', () => {
    const session1Logs = makeLogs(TS1, ['Incline DB Press', 'DB Shoulder Press', 'Pushdown'], 3);
    const session2Logs = makeLogs(TS2, ['Lat Pulldown', 'Cable Row', 'Bayesian Curl'], 3);
    mockStorage['logs'] = [...session1Logs, ...session2Logs];

    const result = runBackfill();

    expect(result.entriesCreated).toBe(2);
    expect(result.errors).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);

    const entries = mockStorage[CDL_KEY];
    expect(entries).toHaveLength(2);
    expect(entries.every(e => e.synthetic === true)).toBe(true);
    expect(entries.every(e => e.superseded === false)).toBe(true);
    expect(entries[0].proposed.rationale.winnerId).toBe('SYNTHETIC_BACKFILL');
  });

  it('throws on second call without force (idempotency)', () => {
    const logs = makeLogs(TS1, ['Incline DB Press', 'DB Shoulder Press', 'Pushdown'], 3);
    mockStorage['logs'] = logs;

    runBackfill();
    expect(() => runBackfill()).toThrow('Backfill already executed. Use { force: true } to re-run');
  });

  it('succeeds with force: true after previous run, replacing synthetic entries', () => {
    const logs = makeLogs(TS1, ['Incline DB Press', 'DB Shoulder Press', 'Pushdown'], 3);
    mockStorage['logs'] = logs;

    const first = runBackfill();
    expect(first.entriesCreated).toBe(1);

    const firstIds = mockStorage[CDL_KEY].map(e => e.id);
    const second = runBackfill({ force: true });
    expect(second.entriesCreated).toBe(1);

    const secondIds = mockStorage[CDL_KEY].map(e => e.id);
    // IDs differ because rand4() generates new suffix
    expect(secondIds).not.toEqual(firstIds);
    expect(mockStorage[CDL_KEY]).toHaveLength(1);
    expect(mockStorage[CDL_KEY][0].synthetic).toBe(true);
  });

  it('handles all 4 skipped reasons correctly', () => {
    mockStorage['logs'] = [
      // 1. Missing session ts → 'missing ts'
      { ex: 'Incline DB Press', w: 80, reps: 10, ts: 100 },
      // 2. Corrupt log (no ex field) → 'invalid format'
      { session: 2000, w: 80, reps: 10, ts: 2001 },
      // 3. Unknown muscle group → 'unknown muscle group'
      { session: 3000, ex: 'Unknown Exercise XYZ', w: 80, reps: 10, ts: 3001 },
      // 4. Valid session → creates entry
      { session: 4000, ex: 'Incline DB Press', w: 80, reps: 10, ts: 4001 },
      { session: 4000, ex: 'DB Shoulder Press', w: 60, reps: 10, ts: 4002 },
      { session: 4000, ex: 'Pushdown', w: 50, reps: 12, ts: 4003 },
    ];

    const result = runBackfill();

    expect(result.entriesCreated).toBe(1);
    expect(result.errors).toHaveLength(0);
    expect(result.skipped).toHaveLength(3);

    const reasons = result.skipped.map(s => s.reason);
    expect(reasons).toContain('missing ts');
    expect(reasons).toContain('invalid format');
    expect(reasons).toContain('unknown muscle group');
  });

  it('dryRun mode returns counts but does not write to storage', () => {
    const logs = makeLogs(TS1, ['Lat Pulldown', 'Cable Row', 'Bayesian Curl'], 3);
    mockStorage['logs'] = logs;

    const result = runBackfill({ dryRun: true });

    expect(result.entriesCreated).toBe(1);
    expect(result.errors).toHaveLength(0);
    // DB.set should NOT have been called for CDL_KEY
    expect(mockStorage[CDL_KEY]).toBeUndefined();
  });

  it('real entries are NEVER removed by force backfill', () => {
    const realEntry = {
      id: 'cd_2026-01-01_1200_real',
      ts: TS1 - 100000,
      date: '2026-01-01',
      synthetic: false,
      superseded: false,
    };
    const syntheticEntry = {
      id: 'cdl_synth_old_xxxx',
      ts: TS1 - 50000,
      date: '2026-01-02',
      synthetic: true,
      superseded: false,
    };
    mockStorage[CDL_KEY] = [realEntry, syntheticEntry];

    const logs = makeLogs(TS2, ['Incline DB Press', 'DB Shoulder Press', 'Pushdown'], 3);
    mockStorage['logs'] = logs;

    runBackfill({ force: true });

    const stored = mockStorage[CDL_KEY];
    const ids = stored.map(e => e.id);
    // Real entry preserved, old synthetic removed, new synthetic added
    expect(ids).toContain(realEntry.id);
    expect(ids).not.toContain(syntheticEntry.id);
    expect(stored.filter(e => e.synthetic === true)).toHaveLength(1);
  });

  it('assigns correct sessionType to each session', () => {
    const logs = [
      ...makeLogs(TS1, ['Incline DB Press', 'DB Shoulder Press', 'Pushdown']),
      ...makeLogs(TS2, ['Lat Pulldown', 'Cable Row', 'Bayesian Curl']),
      ...makeLogs(TS3, ['Leg Press', 'Leg Extension', 'Leg Curl']),
    ];
    mockStorage['logs'] = logs;

    runBackfill();

    const entries = mockStorage[CDL_KEY];
    entries.sort((a, b) => a.ts - b.ts);
    expect(entries[0].proposed.sessionType).toBe('PUSH');
    expect(entries[1].proposed.sessionType).toBe('PULL');
    expect(entries[2].proposed.sessionType).toBe('LEGS');
  });
});

// ── 5. getValidationSamples ──────────────────────────────────────────────────

describe('getValidationSamples', () => {
  it('returns requested count from synthetic entries', () => {
    mockStorage[CDL_KEY] = Array.from({ length: 20 }, (_, i) => ({
      id: `cdl_synth_${i}`,
      synthetic: true,
    }));

    const sample = getValidationSamples(10);
    expect(sample).toHaveLength(10);
    expect(sample.every(e => e.synthetic === true)).toBe(true);
  });

  it('returns all entries when count exceeds pool size', () => {
    mockStorage[CDL_KEY] = Array.from({ length: 5 }, (_, i) => ({
      id: `cdl_synth_${i}`,
      synthetic: true,
    }));

    const sample = getValidationSamples(10);
    expect(sample).toHaveLength(5);
  });

  it('only returns synthetic entries, not real ones', () => {
    mockStorage[CDL_KEY] = [
      { id: 'real_1', synthetic: false },
      { id: 'synth_1', synthetic: true },
      { id: 'synth_2', synthetic: true },
    ];

    const sample = getValidationSamples(10);
    expect(sample).toHaveLength(2);
    expect(sample.every(e => e.synthetic === true)).toBe(true);
  });

  it('Fisher-Yates shuffle produces different order across calls', () => {
    const ids = Array.from({ length: 20 }, (_, i) => `cdl_synth_${i}`);
    mockStorage[CDL_KEY] = ids.map(id => ({ id, synthetic: true }));

    // Spy on Math.random to guarantee different shuffle sequences
    const spy = vi.spyOn(Math, 'random');
    spy.mockReturnValue(0.01);
    const sample1 = getValidationSamples(10).map(e => e.id);

    spy.mockReturnValue(0.99);
    const sample2 = getValidationSamples(10).map(e => e.id);

    spy.mockRestore();

    // Different Math.random seeds → different shuffle order
    expect(sample1).not.toEqual(sample2);
    // Both still return 10 valid synthetic entries
    expect(sample1).toHaveLength(10);
    expect(sample2).toHaveLength(10);
  });
});
