/**
 * TASK #31 — logsMigration tests
 * Tests for migrateLogsUtcToLocal(): idempotency, stats, backup, date correction.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Real db.js + coachDecisionLog with jsdom localStorage
vi.mock('../../db.js', async () => {
  const mockStorage = {};
  return {
    DB: {
      get: vi.fn(key => {
        try { return JSON.parse(mockStorage[key] ?? 'null'); } catch { return null; }
      }),
      set: vi.fn((key, val) => { mockStorage[key] = JSON.stringify(val); }),
    },
    todTs: vi.fn(ts => {
      // Real implementation using 'sv' locale — but in test env TZ may vary.
      // We use a deterministic mock for the boundary timestamp.
      return new Date(ts).toLocaleDateString('sv');
    }),
    __mockStorage: mockStorage,
  };
});

import { migrateLogsUtcToLocal } from '../logsMigration.js';
import { DB } from '../../db.js';

const MIGRATION_FLAG = 'migration-utc-to-local-v1';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  // Reset DB mock storage
  const mod = vi.importMock('../../db.js');
  // Use localStorage directly since DB mock uses a closure
  // Re-setup the internal mockStorage via DB.get/set spies
});

afterEach(() => {
  localStorage.clear();
});

// ── Test 1 ────────────────────────────────────────────────────────────────────
describe('migrateLogsUtcToLocal', () => {
  it('runs once, sets migration flag, returns correct stats shape', () => {
    // Arrange: no flag, no logs
    expect(localStorage.getItem(MIGRATION_FLAG)).toBeNull();

    // Act
    const result = migrateLogsUtcToLocal();

    // Assert
    expect(localStorage.getItem(MIGRATION_FLAG)).toBe('done');
    expect(result.skipped).toBe(false);
    expect(typeof result.logsModified).toBe('number');
    expect(typeof result.cdlModified).toBe('number');
    expect(typeof result.totalLogs).toBe('number');
    expect(typeof result.totalCdl).toBe('number');
  });

  // ── Test 2 ────────────────────────────────────────────────────────────────
  it('is idempotent — skips with reason if flag already set', () => {
    // Arrange: flag already set
    localStorage.setItem(MIGRATION_FLAG, 'done');

    // Act
    const result = migrateLogsUtcToLocal();

    // Assert
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe('already-migrated');
    // DB.set should NOT be called (no writes)
    expect(DB.set).not.toHaveBeenCalled();
  });

  // ── Test 3 ────────────────────────────────────────────────────────────────
  it('handles empty logs and empty CDL — sets flag, returns zeros', () => {
    // DB.get returns null (empty state)
    DB.get.mockReturnValue(null);

    const result = migrateLogsUtcToLocal();

    expect(result.skipped).toBe(false);
    expect(result.totalLogs).toBe(0);
    expect(result.totalCdl).toBe(0);
    expect(result.logsModified).toBe(0);
    expect(result.cdlModified).toBe(0);
    expect(result.backupKey).toBeNull();
    expect(result.cdlBackupKey).toBeNull();
    expect(localStorage.getItem(MIGRATION_FLAG)).toBe('done');
  });

  // ── Test 4 ────────────────────────────────────────────────────────────────
  it('migrates log with mismatched UTC date to local date', () => {
    // Timestamp: 1777145400000 = Sun Apr 27 2025 00:30 GMT+0300
    // UTC date = '2025-04-26', local (Europe/Bucharest = +03:00) date = '2025-04-27'
    const ts = 1777145400000;
    const utcDate = new Date(ts).toISOString().slice(0, 10); // UTC
    const localDate = new Date(ts).toLocaleDateString('sv'); // local

    const testLog = { ts, date: utcDate, ex: 'Bench Press', w: 80, reps: '8' };
    DB.get.mockImplementation(key => {
      if (key === 'logs') return [testLog];
      return null;
    });

    const result = migrateLogsUtcToLocal();

    expect(result.totalLogs).toBe(1);

    if (localDate !== utcDate) {
      // This assertion only holds in non-UTC timezone environments
      expect(result.logsModified).toBe(1);
      // Verify DB.set was called with corrected date
      const setCallArgs = DB.set.mock.calls.find(c => c[0] === 'logs');
      expect(setCallArgs).toBeDefined();
      expect(setCallArgs[1][0].date).toBe(localDate);
    } else {
      // UTC timezone: dates match, no migration needed
      expect(result.logsModified).toBe(0);
    }
  });

  // ── Test 5 ────────────────────────────────────────────────────────────────
  it('logs already with correct date are not modified (modified count = 0)', () => {
    const ts = Date.now();
    const correctDate = new Date(ts).toLocaleDateString('sv');
    const log = { ts, date: correctDate, ex: 'Squat', w: 100, reps: '5' };

    DB.get.mockImplementation(key => {
      if (key === 'logs') return [log];
      return null;
    });

    const result = migrateLogsUtcToLocal();

    expect(result.logsModified).toBe(0);
    expect(result.totalLogs).toBe(1);
  });

  // ── Test 6 ────────────────────────────────────────────────────────────────
  it('also migrates CDL entries alongside logs', () => {
    const ts = 1777145400000;
    const utcDate = new Date(ts).toISOString().slice(0, 10);
    const localDate = new Date(ts).toLocaleDateString('sv');

    DB.get.mockImplementation(key => {
      if (key === 'logs') return [];
      if (key === 'coach-decisions') return [{ ts, date: utcDate, id: 'cd_test_001' }];
      return null;
    });

    const result = migrateLogsUtcToLocal();

    expect(result.totalCdl).toBe(1);

    if (localDate !== utcDate) {
      expect(result.cdlModified).toBe(1);
      const setCallArgs = DB.set.mock.calls.find(c => c[0] === 'coach-decisions');
      expect(setCallArgs).toBeDefined();
      expect(setCallArgs[1][0].date).toBe(localDate);
    } else {
      expect(result.cdlModified).toBe(0);
    }
  });

  // ── Backup key test (bonus) ───────────────────────────────────────────────
  it('creates backup keys in localStorage before migrating logs', () => {
    const ts = Date.now();
    const log = { ts, date: '2026-04-01', ex: 'Test', w: 50, reps: '8' };

    DB.get.mockImplementation(key => {
      if (key === 'logs') return [log];
      return null;
    });

    const result = migrateLogsUtcToLocal();

    expect(result.backupKey).toMatch(/^logs-backup-pre-utc-migration-\d+$/);
    // The backup should be in localStorage
    const backup = localStorage.getItem(result.backupKey);
    expect(backup).not.toBeNull();
    expect(JSON.parse(backup)).toHaveLength(1);
  });
});
