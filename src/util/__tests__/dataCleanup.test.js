import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetTestData, fullReset, USER_DATA_KEYS, TEST_RESIDUE_KEYS, PRESERVE_ON_RESET_KEYS, cleanDuplicateLogs } from '../dataCleanup.js';

describe('DataCleanup — Firebase aware', () => {
  beforeEach(() => {
    localStorage.clear();
    window._suppressFirebaseSync = false;
  });

  it('should set _suppressFirebaseSync flag during reset', async () => {
    localStorage.setItem('auto-recommendations', '[]');
    const promise = resetTestData({ clearFirebase: false, reload: false });
    expect(window._suppressFirebaseSync).toBe(true);
    await promise;
  });

  it('resetTestData should schedule cache invalidation via debounce', async () => {
    vi.useFakeTimers();
    const invalidate = vi.fn();
    window._directorCache = { invalidate };

    await resetTestData({ clearFirebase: false, reload: false });

    expect(invalidate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(250);
    expect(invalidate).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
    window._directorCache = undefined;
  });

  it('should remove test keys from localStorage', async () => {
    localStorage.setItem('auto-recommendations', '[]');
    localStorage.setItem('applied-patterns', '[]');
    localStorage.setItem('equipment-occupied-session', '[]');
    await resetTestData({ clearFirebase: false, reload: false });
    expect(localStorage.getItem('auto-recommendations')).toBeNull();
    expect(localStorage.getItem('applied-patterns')).toBeNull();
    expect(localStorage.getItem('equipment-occupied-session')).toBeNull();
  });

  it('resetTestData should preserve user data', async () => {
    localStorage.setItem('logs', '[{"real":true}]');
    localStorage.setItem('weights', '{"110.4":true}');
    localStorage.setItem('active-theme', 'FORGE');
    await resetTestData({ clearFirebase: false, reload: false });
    expect(localStorage.getItem('logs')).toBe('[{"real":true}]');
    expect(localStorage.getItem('weights')).toBe('{"110.4":true}');
    expect(localStorage.getItem('active-theme')).toBe('FORGE');
  });

  it('USER_DATA_KEYS should include notif-enabled, muted', () => {
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

  it('TEST_RESIDUE_KEYS should include equipment-occupied-session', () => {
    expect(TEST_RESIDUE_KEYS).toContain('equipment-occupied-session');
  });

  it('PRESERVE_ON_RESET_KEYS should include active-theme and device-id', () => {
    expect(PRESERVE_ON_RESET_KEYS).toContain('active-theme');
    expect(PRESERVE_ON_RESET_KEYS).toContain('device-id');
  });

  it('fullReset should remove user data and test keys', async () => {
    localStorage.setItem('logs', '[{"real":true}]');
    localStorage.setItem('auto-recommendations', '[]');
    localStorage.setItem('ex-extra-sets-Bench Press', '1');
    await fullReset({ clearFirebase: false, reload: false });
    expect(localStorage.getItem('logs')).toBeNull();
    expect(localStorage.getItem('auto-recommendations')).toBeNull();
  });

  it('fullReset should clear dynamic keys (ex-extra-sets-*, muscle-extra-*, aa-cooldown-*)', async () => {
    localStorage.setItem('ex-extra-sets-Bench Press', '1');
    localStorage.setItem('muscle-extra-chest', 'true');
    localStorage.setItem('aa-cooldown-Squat', '1714000000000');
    await fullReset({ clearFirebase: false, reload: false });
    expect(localStorage.getItem('ex-extra-sets-Bench Press')).toBeNull();
    expect(localStorage.getItem('muscle-extra-chest')).toBeNull();
    expect(localStorage.getItem('aa-cooldown-Squat')).toBeNull();
  });

  it('fullReset should preserve device-id and active-theme', async () => {
    localStorage.setItem('device-id', 'dev-abc123');
    localStorage.setItem('active-theme', 'forge');
    localStorage.setItem('logs', '[{"real":true}]');
    await fullReset({ clearFirebase: false, reload: false });
    expect(localStorage.getItem('device-id')).toBe('dev-abc123');
    expect(localStorage.getItem('active-theme')).toBe('forge');
    expect(localStorage.getItem('logs')).toBeNull();
  });

  it('fullReset should write __suppressFirebaseSyncUntil for post-reload suppression', async () => {
    const before = Date.now();
    await fullReset({ clearFirebase: false, reload: false });
    const suppressUntil = localStorage.getItem('__suppressFirebaseSyncUntil');
    expect(suppressUntil).not.toBeNull();
    expect(Number(suppressUntil)).toBeGreaterThan(before);
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
