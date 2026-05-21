import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DB to avoid real localStorage
const mockStorage = {};
vi.mock('../../db.js', () => ({
  DB: {
    get: vi.fn(key => mockStorage[key] ?? null),
    set: vi.fn((key, val) => { mockStorage[key] = val; }),
  },
  tod: () => new Date().toLocaleDateString('sv'),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(k => store[k] ?? null),
    setItem: vi.fn((k, v) => { store[k] = v; }),
    removeItem: vi.fn(k => { delete store[k]; }),
    clear: vi.fn(() => { store = {}; }),
    _getStore: () => store,
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

import {
  shouldCreateDailyBackup,
  createDailyBackup,
  listBackups,
  restoreFromBackup,
} from '../autoBackup.js';

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe('shouldCreateDailyBackup', () => {
  it('returns true when no backups exist', () => {
    expect(shouldCreateDailyBackup()).toBe(true);
  });

  it('returns false when backup already done today', () => {
    const today = new Date().toLocaleDateString('sv');
    mockStorage['backup-index'] = [{ key: 'backup-123', date: today, timestamp: Date.now() }];
    expect(shouldCreateDailyBackup()).toBe(false);
  });

  it('returns true when last backup was yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv');
    mockStorage['backup-index'] = [{ key: 'backup-123', date: yesterday, timestamp: Date.now() - 86400000 }];
    expect(shouldCreateDailyBackup()).toBe(true);
  });
});

describe('createDailyBackup', () => {
  it('creates a backup with correct structure', () => {
    const result = createDailyBackup();
    expect(result).not.toBeNull();
    expect(result.key).toBeTruthy();
    expect(result.date).toBe(new Date().toLocaleDateString('sv'));
    expect(typeof result.size).toBe('number');
  });

  it('adds entry to backup index', () => {
    createDailyBackup();
    const index = mockStorage['backup-index'];
    expect(index).toHaveLength(1);
    expect(index[0].date).toBe(new Date().toLocaleDateString('sv'));
  });

  it('stores backup in localStorage', () => {
    const result = createDailyBackup();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(result.key, expect.any(String));
  });
});

describe('listBackups', () => {
  it('returns empty array when no backups', () => {
    expect(listBackups()).toHaveLength(0);
  });

  it('returns backups sorted newest first', () => {
    mockStorage['backup-index'] = [
      { key: 'k1', date: '2026-04-20', timestamp: 100 },
      { key: 'k2', date: '2026-04-22', timestamp: 300 },
      { key: 'k3', date: '2026-04-21', timestamp: 200 },
    ];
    const list = listBackups();
    expect(list[0].timestamp).toBeGreaterThan(list[1].timestamp);
    expect(list[1].timestamp).toBeGreaterThan(list[2].timestamp);
  });
});

describe('restoreFromBackup', () => {
  it('returns not_found for missing key', () => {
    const result = restoreFromBackup('nonexistent-key');
    expect(result.restored).toBe(false);
    expect(result.reason).toBe('not_found');
  });

  it('returns no_backups when restoring by days and none exist', () => {
    const result = restoreFromBackup(1);
    expect(result.restored).toBe(false);
    expect(result.reason).toBe('no_backups');
  });

  it('restores data from valid backup', () => {
    const key = 'backup-test-123';
    const backup = JSON.stringify({
      key, date: '2026-04-20', timestamp: Date.now() - 86400000,
      version: 'daily-v1',
      data: { logs: [{ ex: 'Bench' }], weights: {} },
    });
    localStorageMock._getStore()[key] = backup;
    localStorageMock.getItem.mockImplementation(k => localStorageMock._getStore()[k] ?? null);

    const result = restoreFromBackup(key);
    expect(result.restored).toBe(true);
    expect(result.keysRestored).toBeGreaterThan(0);
  });

  it('handles invalid JSON gracefully', () => {
    const key = 'backup-bad';
    localStorageMock._getStore()[key] = 'not valid json{{{';
    localStorageMock.getItem.mockImplementation(k => localStorageMock._getStore()[k] ?? null);
    const result = restoreFromBackup(key);
    expect(result.restored).toBe(false);
  });
});
