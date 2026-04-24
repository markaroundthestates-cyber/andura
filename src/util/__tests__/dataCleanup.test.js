import { describe, it, expect, beforeEach } from 'vitest';
import { resetTestData, fullReset, USER_DATA_KEYS, TEST_RESIDUE_KEYS, cleanDuplicateLogs } from '../dataCleanup.js';

describe('DataCleanup — Firebase aware', () => {
  beforeEach(() => {
    localStorage.clear();
    window._suppressFirebaseSync = false;
    window._cachedDirectorSession = { stale: true };
  });

  it('should set _suppressFirebaseSync flag during reset', async () => {
    localStorage.setItem('auto-recommendations', '[]');
    const promise = resetTestData({ clearFirebase: false, reload: false });
    expect(window._suppressFirebaseSync).toBe(true);
    await promise;
  });

  it('should clear director cache', async () => {
    await resetTestData({ clearFirebase: false, reload: false });
    expect(window._cachedDirectorSession).toBeNull();
  });

  it('should remove test keys from localStorage', async () => {
    localStorage.setItem('auto-recommendations', '[]');
    localStorage.setItem('applied-patterns', '[]');
    await resetTestData({ clearFirebase: false, reload: false });
    expect(localStorage.getItem('auto-recommendations')).toBeNull();
    expect(localStorage.getItem('applied-patterns')).toBeNull();
  });

  it('should preserve user data', async () => {
    localStorage.setItem('logs', '[{"real":true}]');
    localStorage.setItem('weights', '{"110.4":true}');
    localStorage.setItem('active-theme', 'FORGE');
    await resetTestData({ clearFirebase: false, reload: false });
    expect(localStorage.getItem('logs')).toBe('[{"real":true}]');
    expect(localStorage.getItem('weights')).toBe('{"110.4":true}');
    expect(localStorage.getItem('active-theme')).toBe('FORGE');
  });

  it('USER_DATA_KEYS should include active-theme and other UI keys', () => {
    expect(USER_DATA_KEYS).toContain('active-theme');
    expect(USER_DATA_KEYS).toContain('notif-enabled');
    expect(USER_DATA_KEYS).toContain('muted');
  });

  it('USER_DATA_KEYS should include waters, workout-skips, wellbeing, closed-days', () => {
    expect(USER_DATA_KEYS).toContain('waters');
    expect(USER_DATA_KEYS).toContain('workout-skips');
    expect(USER_DATA_KEYS).toContain('wellbeing');
    expect(USER_DATA_KEYS).toContain('closed-days');
  });

  it('TEST_RESIDUE_KEYS should not overlap with USER_DATA_KEYS', () => {
    const overlap = TEST_RESIDUE_KEYS.filter(k => USER_DATA_KEYS.includes(k));
    expect(overlap).toHaveLength(0);
  });

  it('fullReset should remove both user and test keys', async () => {
    localStorage.setItem('logs', '[{"real":true}]');
    localStorage.setItem('auto-recommendations', '[]');
    await fullReset({ clearFirebase: false, reload: false });
    expect(localStorage.getItem('logs')).toBeNull();
    expect(localStorage.getItem('auto-recommendations')).toBeNull();
  });
});

describe('cleanDuplicateLogs', () => {
  beforeEach(() => { localStorage.clear(); });

  it('keeps all logs when timestamps are different (same ex/w/reps)', () => {
    const logs = [
      { ts: 1000, ex: 'Bench', w: 80, reps: 8 },
      { ts: 1060, ex: 'Bench', w: 80, reps: 8 },
      { ts: 1120, ex: 'Bench', w: 80, reps: 8 },
    ];
    localStorage.setItem('logs', JSON.stringify(logs));
    cleanDuplicateLogs();
    const result = JSON.parse(localStorage.getItem('logs'));
    expect(result).toHaveLength(3);
  });

  it('removes duplicate when two logs share the same timestamp', () => {
    const logs = [
      { ts: 1000, ex: 'Bench', w: 80, reps: 8 },
      { ts: 1000, ex: 'Bench', w: 80, reps: 8 },
    ];
    localStorage.setItem('logs', JSON.stringify(logs));
    cleanDuplicateLogs();
    const result = JSON.parse(localStorage.getItem('logs'));
    expect(result).toHaveLength(1);
  });

  it('keeps logs with no ts field intact', () => {
    const logs = [
      { ex: 'Squat', w: 100, reps: 5 },
      { ex: 'Squat', w: 100, reps: 5 },
    ];
    localStorage.setItem('logs', JSON.stringify(logs));
    cleanDuplicateLogs();
    const result = JSON.parse(localStorage.getItem('logs'));
    expect(result).toHaveLength(2);
  });

  it('does not write to localStorage when no duplicates exist', () => {
    const logs = [{ ts: 1, ex: 'A' }, { ts: 2, ex: 'B' }];
    localStorage.setItem('logs', JSON.stringify(logs));
    const before = localStorage.getItem('logs');
    cleanDuplicateLogs();
    expect(localStorage.getItem('logs')).toBe(before);
  });
});
