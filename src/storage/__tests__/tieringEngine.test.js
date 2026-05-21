// ══ src/storage/tieringEngine.js — rotation logic tests (ADR 020) ══════════
// Tests classifyByAge + rotateOnce + ensureTier0Capacity + initAutoBackup.
// Uses mocked DB sink + mocked bulkWriter (no real Dexie needed for most cases).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  classifyByAge,
  rotateOnce,
  ensureTier0Capacity,
  estimateTier0Bytes,
  initAutoBackup,
  stopAutoBackup,
  TIER0_AGE_LIMIT_MS,
  TIER0_SIZE_LIMIT_BYTES,
  ROTATION_CHECK_INTERVAL_MS,
  RETRY_BACKOFF_MS,
  ROTATABLE_KEYS,
} from '../tieringEngine.js';
import { STORES } from '../db.js';

// ── Test doubles ────────────────────────────────────────────────────────────

const makeDb = (initial = {}) => {
  const store = { ...initial };
  return {
    get: vi.fn(k => (k in store ? structuredClone(store[k]) : null)),
    set: vi.fn((k, v) => { store[k] = structuredClone(v); }),
    _store: store,
  };
};
const makeSentry = () => ({ captureException: vi.fn() });

beforeEach(() => {
  try { localStorage.clear(); } catch { /* swallow */ }
});

afterEach(() => {
  stopAutoBackup();
  vi.useRealTimers();
});

// ── classifyByAge ──────────────────────────────────────────────────────────

describe('classifyByAge', () => {
  const NOW = 1_700_000_000_000; // arbitrary fixed epoch (Nov 2023)
  const OLD_TS = NOW - (40 * 24 * 60 * 60 * 1000); // 40d ago
  const RECENT_TS = NOW - (5 * 24 * 60 * 60 * 1000); // 5d ago

  it('classifies entries with ts field by age', () => {
    const entries = [
      { id: 'a', ts: OLD_TS },
      { id: 'b', ts: RECENT_TS },
      { id: 'c', ts: OLD_TS - 1000 },
    ];
    const { hot, cold } = classifyByAge(entries, NOW);
    expect(hot.map(e => e.id)).toEqual(['b']);
    expect(cold.map(e => e.id)).toEqual(['a', 'c']);
  });

  it('treats entries without ts as hot (defensive)', () => {
    const entries = [
      { id: 'a' }, // no ts
      { id: 'b', ts: OLD_TS },
    ];
    const { hot, cold } = classifyByAge(entries, NOW);
    expect(hot.map(e => e.id)).toEqual(['a']);
    expect(cold.map(e => e.id)).toEqual(['b']);
  });

  it('parses date field as fallback when ts missing', () => {
    const oldDate = new Date(OLD_TS).toISOString().slice(0, 10);
    const recentDate = new Date(RECENT_TS).toISOString().slice(0, 10);
    const entries = [
      { id: 'a', date: oldDate },
      { id: 'b', date: recentDate },
    ];
    const { hot, cold } = classifyByAge(entries, NOW);
    // Date parsing is YYYY-MM-DD midnight UTC — ages may vary by ~1d due to TZ,
    // but >30d should still be cold and <10d should still be hot.
    expect(hot.map(e => e.id)).toContain('b');
    expect(cold.map(e => e.id)).toContain('a');
  });

  it('returns empty hot/cold for non-array input', () => {
    // §B022 audit fix — shape now includes stuckHotEntries telemetry counter.
    expect(classifyByAge(null)).toEqual({ hot: [], cold: [], stuckHotEntries: 0 });
    expect(classifyByAge(undefined)).toEqual({ hot: [], cold: [], stuckHotEntries: 0 });
    expect(classifyByAge('string')).toEqual({ hot: [], cold: [], stuckHotEntries: 0 });
  });

  it('respects custom ageLimitMs param', () => {
    const entries = [{ id: 'a', ts: NOW - 5000 }, { id: 'b', ts: NOW - 1000 }];
    // Age limit = 2000ms, so anything >2s old is cold
    const { hot, cold } = classifyByAge(entries, NOW, 2000);
    expect(hot.map(e => e.id)).toEqual(['b']);
    expect(cold.map(e => e.id)).toEqual(['a']);
  });
});

// ── rotateOnce ─────────────────────────────────────────────────────────────

describe('rotateOnce', () => {
  const NOW = 1_700_000_000_000;
  const OLD_TS = NOW - 40 * 24 * 60 * 60 * 1000;
  const HOT_TS = NOW - 5 * 24 * 60 * 60 * 1000;

  it('returns zero rotation when all entries hot', async () => {
    const db = makeDb({
      'coach-decisions': [{ id: 'a', ts: HOT_TS }, { id: 'b', ts: HOT_TS }],
    });
    const bulkWriter = vi.fn().mockResolvedValue({ written: 0 });
    const eventLogger = vi.fn().mockResolvedValue(1);
    const result = await rotateOnce({
      db, bulkWriter, eventLogger, sentry: makeSentry(), now: NOW,
    });
    expect(result.rotated).toBe(0);
    expect(bulkWriter).not.toHaveBeenCalled();
    expect(db.set).not.toHaveBeenCalled();
  });

  it('moves cold entries to Tier 1 + prunes Tier 0', async () => {
    const cold = [{ id: 'old1', ts: OLD_TS }, { id: 'old2', ts: OLD_TS - 1000 }];
    const hot = [{ id: 'new1', ts: HOT_TS }];
    const db = makeDb({
      'coach-decisions': [...cold, ...hot],
    });
    const bulkWriter = vi.fn().mockResolvedValue({ written: 2 });
    const eventLogger = vi.fn().mockResolvedValue(1);
    const result = await rotateOnce({
      db, bulkWriter, eventLogger, sentry: makeSentry(), now: NOW,
    });
    expect(result.rotated).toBe(2);
    expect(bulkWriter).toHaveBeenCalledWith(STORES.CDL_TIER1, expect.arrayContaining(cold));
    expect(db.set).toHaveBeenCalledWith('coach-decisions', expect.arrayContaining(hot));
    // Tier 0 should NOT contain cold entries anymore
    expect(db._store['coach-decisions']).toHaveLength(1);
    expect(db._store['coach-decisions'][0].id).toBe('new1');
  });

  it('does NOT prune Tier 0 if Tier 1 write fails (zero info loss)', async () => {
    const entries = [{ id: 'old', ts: OLD_TS }];
    const db = makeDb({ 'coach-decisions': entries });
    const bulkWriter = vi.fn().mockRejectedValue(new Error('IDB quota'));
    const eventLogger = vi.fn();
    const sentry = makeSentry();
    const result = await rotateOnce({
      db, bulkWriter, eventLogger, sentry, now: NOW,
      retryBackoffMs: [1, 1, 1], // fast retry pentru test
    });
    expect(result.rotated).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].op).toBe('tier1_write');
    // Tier 0 untouched — entry preserved for retry
    expect(db._store['coach-decisions']).toEqual(entries);
    expect(sentry.captureException).toHaveBeenCalled();
  });

  it('continues with other keys when one fails', async () => {
    const cold1 = [{ id: 'cdl_old', ts: OLD_TS }];
    const cold2 = [{ id: 'pat_old', ts: OLD_TS }];
    const db = makeDb({
      'coach-decisions': cold1,
      'applied-patterns': cold2,
    });
    const bulkWriter = vi.fn().mockImplementation(async (storeName) => {
      if (storeName === STORES.CDL_TIER1) throw new Error('cdl fail');
      return { written: 1 };
    });
    const result = await rotateOnce({
      db, bulkWriter, eventLogger: vi.fn(), sentry: makeSentry(), now: NOW,
      retryBackoffMs: [1, 1, 1], // fast retry pentru test
    });
    // CDL fails, applied-patterns succeeds
    expect(result.rotated).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(db._store['coach-decisions']).toEqual(cold1); // retained
    expect(db._store['applied-patterns']).toEqual([]); // pruned
  });

  it('idempotent: re-run with no cold = no-op', async () => {
    const db = makeDb({
      'coach-decisions': [{ id: 'a', ts: HOT_TS }],
    });
    const bulkWriter = vi.fn();
    const result1 = await rotateOnce({ db, bulkWriter, eventLogger: vi.fn(), sentry: makeSentry(), now: NOW });
    const result2 = await rotateOnce({ db, bulkWriter, eventLogger: vi.fn(), sentry: makeSentry(), now: NOW });
    expect(result1.rotated).toBe(0);
    expect(result2.rotated).toBe(0);
    expect(bulkWriter).not.toHaveBeenCalled();
  });

  it('skips keys with non-array values (defensive)', async () => {
    const db = makeDb({
      'coach-decisions': { not: 'an array' },
    });
    const result = await rotateOnce({
      db, bulkWriter: vi.fn(), eventLogger: vi.fn(), sentry: makeSentry(), now: NOW,
    });
    expect(result.rotated).toBe(0);
  });

  it('audit logs success events (kind: rotation)', async () => {
    const db = makeDb({
      'coach-decisions': [{ id: 'old', ts: OLD_TS }],
    });
    const eventLogger = vi.fn().mockResolvedValue(1);
    await rotateOnce({
      db,
      bulkWriter: vi.fn().mockResolvedValue({ written: 1 }),
      eventLogger,
      sentry: makeSentry(),
      now: NOW,
    });
    expect(eventLogger).toHaveBeenCalledWith(expect.objectContaining({
      kind: 'rotation',
      tier0Key: 'coach-decisions',
      count: 1,
    }));
  });
});

// ── ensureTier0Capacity ────────────────────────────────────────────────────

describe('ensureTier0Capacity', () => {
  it('returns no-op when localStorage under quota', async () => {
    // Fresh localStorage = ~0 bytes
    const result = await ensureTier0Capacity({
      db: makeDb(),
      bulkWriter: vi.fn(),
      eventLogger: vi.fn(),
      sentry: makeSentry(),
    });
    expect(result.forcedByQuota).toBe(false);
    expect(result.rotated).toBe(0);
  });
});

// ── estimateTier0Bytes ─────────────────────────────────────────────────────

describe('estimateTier0Bytes', () => {
  it('returns 0 for empty localStorage', () => {
    expect(estimateTier0Bytes()).toBe(0);
  });

  it('grows monotonically as localStorage gets data', () => {
    const before = estimateTier0Bytes();
    localStorage.setItem('test-key-large', 'x'.repeat(1000));
    const after = estimateTier0Bytes();
    expect(after).toBeGreaterThan(before);
    expect(after).toBeGreaterThanOrEqual(2000); // UTF-16 *2 multiplier
  });
});

// ── Constants ──────────────────────────────────────────────────────────────

describe('tieringEngine constants (ADR 020 §6 defaults)', () => {
  it('TIER0_SIZE_LIMIT_BYTES = 4MB (sub 5MB browser quota)', () => {
    expect(TIER0_SIZE_LIMIT_BYTES).toBe(4 * 1024 * 1024);
  });

  it('TIER0_AGE_LIMIT_MS = 30d', () => {
    expect(TIER0_AGE_LIMIT_MS).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it('ROTATION_CHECK_INTERVAL_MS = 1h default', () => {
    expect(ROTATION_CHECK_INTERVAL_MS).toBe(60 * 60 * 1000);
  });

  it('RETRY_BACKOFF_MS = [1s, 2s, 4s] exponential', () => {
    expect(RETRY_BACKOFF_MS).toEqual([1000, 2000, 4000]);
  });

  it('ROTATABLE_KEYS Phase 1 scope = CDL + applied-patterns only (NOT logs)', () => {
    const keys = Object.keys(ROTATABLE_KEYS).sort();
    expect(keys).toEqual(['applied-patterns', 'coach-decisions', 'coach-decisions-aggregate']);
    expect(keys).not.toContain('logs');
  });
});

// ── initAutoBackup / stopAutoBackup ────────────────────────────────────────

describe('initAutoBackup', () => {
  it('runs initial pass + registers timer', async () => {
    vi.useFakeTimers();
    const db = makeDb();
    const bulkWriter = vi.fn().mockResolvedValue({ written: 0 });
    const result = await initAutoBackup({
      intervalMs: 100,
      runImmediately: true,
      rotateOpts: { db, bulkWriter, eventLogger: vi.fn(), sentry: makeSentry() },
    });
    expect(result.initial).toBeDefined();
    stopAutoBackup();
  });

  it('skips initial run when runImmediately=false', async () => {
    const db = makeDb();
    const bulkWriter = vi.fn();
    const result = await initAutoBackup({
      intervalMs: 100,
      runImmediately: false,
      rotateOpts: { db, bulkWriter, eventLogger: vi.fn(), sentry: makeSentry() },
    });
    expect(result.initial).toBeNull();
    expect(bulkWriter).not.toHaveBeenCalled();
    stopAutoBackup();
  });

  it('stopAutoBackup is idempotent', () => {
    expect(() => stopAutoBackup()).not.toThrow();
    expect(() => stopAutoBackup()).not.toThrow();
  });
});
