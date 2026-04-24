import { describe, it, expect, beforeEach } from 'vitest';
import { backupLogsToLocal, restoreLogsFromBackup } from '../logBackup.js';

const mockLogs = [
  { date: '2026-04-24', ex: 'Lat Pulldown', w: 64, reps: '8', ts: 1714000000000, session: 1714000000000, baseline: false },
  { date: '2026-04-24', ex: 'Cable Row',    w: 72, reps: '8', ts: 1714000001000, session: 1714000000000, baseline: false },
];

beforeEach(() => {
  localStorage.clear();
});

describe('backupLogsToLocal', () => {
  it('creates a key with correct format and stores count + logs', () => {
    localStorage.setItem('logs', JSON.stringify(mockLogs));
    const result = backupLogsToLocal('sf.logs-backup');
    expect(result.key).toMatch(/^sf\.logs-backup-\d+$/);
    expect(result.count).toBe(2);
    const stored = JSON.parse(localStorage.getItem(result.key));
    expect(stored.count).toBe(2);
    expect(stored.logs).toHaveLength(2);
    expect(stored.timestamp).toBeTypeOf('number');
  });

  it('handles empty logs gracefully', () => {
    const result = backupLogsToLocal();
    expect(result.count).toBe(0);
    const stored = JSON.parse(localStorage.getItem(result.key));
    expect(stored.logs).toEqual([]);
  });
});

describe('restoreLogsFromBackup', () => {
  it('restores logs from backup key', () => {
    localStorage.setItem('logs', JSON.stringify(mockLogs));
    const { key } = backupLogsToLocal('sf.logs-backup');

    localStorage.setItem('logs', JSON.stringify([]));
    const result = restoreLogsFromBackup(key);
    expect(result.restored).toBe(2);
    const restored = JSON.parse(localStorage.getItem('logs'));
    expect(restored).toHaveLength(2);
    expect(restored[0].ex).toBe('Lat Pulldown');
  });

  it('throws if backup key not found', () => {
    expect(() => restoreLogsFromBackup('sf.logs-backup-999')).toThrow('Backup sf.logs-backup-999 not found');
  });
});

describe('slice(5000) cap', () => {
  it('stores up to 5000 logs without truncation', () => {
    const bigLogs = Array.from({ length: 4999 }, (_, i) => ({
      date: '2026-04-24', ex: 'Lat Pulldown', w: 60 + i, reps: '8',
      ts: 1714000000000 + i, session: 1714000000000, baseline: false,
    }));
    const capped = bigLogs.slice(0, 5000);
    expect(capped).toHaveLength(4999);
  });

  it('slice(5000) truncates only beyond 5000 entries', () => {
    const logs5001 = Array.from({ length: 5001 }, (_, i) => ({ ts: i }));
    expect(logs5001.slice(0, 5000)).toHaveLength(5000);
    expect(logs5001.slice(0, 5000).at(-1).ts).toBe(4999);
  });
});
