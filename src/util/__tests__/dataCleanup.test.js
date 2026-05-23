import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mock firebase.js (getUserPath / buildAuthUrl / scheduleInvalidation) ─────
// Default: anonymous (getUserPath -> null). Tests can override per-case.
const firebaseMockState = {
  userPath: /** @type {string|null} */ (null),
  scheduleInvalidationCalls: 0,
};

vi.mock('../../firebase.js', () => ({
  getUserPath: vi.fn(() => firebaseMockState.userPath),
  buildAuthUrl: vi.fn(async (/** @type {string} */ path) => `https://test.firebaseio.com/${path}.json?auth=tok`),
  scheduleInvalidation: vi.fn(() => { firebaseMockState.scheduleInvalidationCalls++; }),
}));

import {
  resetTestData,
  fullReset,
  resetButKeepRealLogs,
  createAutoBackup,
  restoreFromBackup,
  restoreLastBackup,
  inspectStorage,
  restoreRealLogs,
  USER_DATA_KEYS,
  TEST_RESIDUE_KEYS,
  PRESERVE_ON_RESET_KEYS,
  cleanDuplicateLogs,
} from '../dataCleanup.js';

beforeEach(() => {
  localStorage.clear();
  try { sessionStorage.clear(); } catch { /* ignore */ }
  window._suppressFirebaseSync = false;
  firebaseMockState.userPath = null;
  firebaseMockState.scheduleInvalidationCalls = 0;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ──────────────────────────────────────────────────────────────────────────
// Existing baseline tests (preserved verbatim where possible)
// ──────────────────────────────────────────────────────────────────────────

describe('DataCleanup — Firebase aware', () => {
  it('should set _suppressFirebaseSync flag during reset', async () => {
    localStorage.setItem('auto-recommendations', '[]');
    const promise = resetTestData({ clearFirebase: false, reload: false });
    expect(window._suppressFirebaseSync).toBe(true);
    await promise;
  });

  it('resetTestData should schedule cache invalidation via debounce', async () => {
    await resetTestData({ clearFirebase: false, reload: false });
    expect(firebaseMockState.scheduleInvalidationCalls).toBeGreaterThan(0);
  });

  it('should remove test keys from localStorage', async () => {
    localStorage.setItem('auto-recommendations', '[]');
    localStorage.setItem('equipment-occupied-session', '[]');
    await resetTestData({ clearFirebase: false, reload: false });
    expect(localStorage.getItem('auto-recommendations')).toBeNull();
    expect(localStorage.getItem('equipment-occupied-session')).toBeNull();
  });

  it('resetTestData preserves CDL_KEYS (behavioral history survives test cleanup)', async () => {
    localStorage.setItem('coach-decisions', '[{"id":"cd_test"}]');
    localStorage.setItem('applied-patterns', '[{"type":"EARLY_END"}]');
    localStorage.setItem('auto-recommendations', '[]');
    await resetTestData({ clearFirebase: false, reload: false });
    expect(localStorage.getItem('coach-decisions')).toBe('[{"id":"cd_test"}]');
    expect(localStorage.getItem('applied-patterns')).toBe('[{"type":"EARLY_END"}]');
    expect(localStorage.getItem('auto-recommendations')).toBeNull();
  });

  it('fullReset wipes CDL_KEYS (fresh history for clean coaching)', async () => {
    localStorage.setItem('coach-decisions', '[{"id":"cd_test"}]');
    localStorage.setItem('applied-patterns', '[{"type":"EARLY_END"}]');
    await fullReset({ clearFirebase: false, reload: false });
    expect(localStorage.getItem('coach-decisions')).toBeNull();
    expect(localStorage.getItem('applied-patterns')).toBeNull();
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

// ──────────────────────────────────────────────────────────────────────────
// cleanDuplicateLogs
// ──────────────────────────────────────────────────────────────────────────

describe('cleanDuplicateLogs', () => {
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

  it('returns silently when logs JSON is malformed', () => {
    localStorage.setItem('logs', '{not-valid-json');
    expect(() => cleanDuplicateLogs()).not.toThrow();
    // Malformed input should remain untouched (early return)
    expect(localStorage.getItem('logs')).toBe('{not-valid-json');
  });

  it('handles empty/null storage gracefully (defaults to [])', () => {
    cleanDuplicateLogs();
    // Nothing to do, no throw, no write
    expect(localStorage.getItem('logs')).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────
// createAutoBackup
// ──────────────────────────────────────────────────────────────────────────

describe('createAutoBackup', () => {
  it('returns a backup object with timestamp, version, data', () => {
    localStorage.setItem('logs', '[{"x":1}]');
    localStorage.setItem('weights', '{"100":true}');
    const backup = createAutoBackup();
    expect(backup).toHaveProperty('timestamp');
    expect(backup).toHaveProperty('version', 'auto-full-reset');
    expect(backup).toHaveProperty('data');
    expect(backup.data.logs).toBe('[{"x":1}]');
    expect(backup.data.weights).toBe('{"100":true}');
  });

  it('writes last-backup to localStorage on success', () => {
    localStorage.setItem('foo', 'bar');
    createAutoBackup();
    const raw = localStorage.getItem('last-backup');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(/** @type {string} */ (raw));
    expect(parsed.data.foo).toBe('bar');
  });

  it('logs warning and continues when localStorage quota fails on last-backup save', () => {
    localStorage.setItem('foo', 'bar');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    // Allow all writes, fail only the last-backup write
    setItemSpy.mockImplementation((/** @type {string} */ key, /** @type {string} */ val) => {
      if (key === 'last-backup') throw new DOMException('quota', 'QuotaExceededError');
      // Manually emulate write for other keys via originally-installed mock
      Object.defineProperty(localStorage, key, { value: val, configurable: true, writable: true });
    });
    const backup = createAutoBackup();
    expect(backup).toHaveProperty('timestamp');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('triggers download via blob URL and anchor click', () => {
    localStorage.setItem('foo', 'bar');
    const clickSpy = vi.fn();
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    const createElSpy = vi.spyOn(document, 'createElement').mockImplementation(() => /** @type {any} */ ({
      click: clickSpy,
      set href(_) {},
      set download(_) {},
    }));
    if (!URL.createObjectURL) URL.createObjectURL = vi.fn(() => 'blob:mock');
    if (!URL.revokeObjectURL) URL.revokeObjectURL = vi.fn();
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    createAutoBackup();

    expect(createElSpy).toHaveBeenCalledWith('a');
    expect(clickSpy).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
    expect(createUrlSpy).toHaveBeenCalled();

    // cleanup runs via setTimeout — exercise it
    vi.useFakeTimers();
    vi.advanceTimersByTime(1500);
    vi.useRealTimers();
  });

  it('handles download failure gracefully (Blob throws)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const origBlob = global.Blob;
    // @ts-ignore — intentional substitution for failure path
    global.Blob = function () { throw new Error('Blob unsupported'); };
    try {
      const backup = createAutoBackup();
      expect(backup).toHaveProperty('data');
      expect(warnSpy).toHaveBeenCalled();
    } finally {
      global.Blob = origBlob;
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────
// restoreFromBackup
// ──────────────────────────────────────────────────────────────────────────

describe('restoreFromBackup', () => {
  it('returns false and alerts on invalid JSON', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const result = restoreFromBackup('{not-json');
    expect(result).toBe(false);
    expect(alertSpy).toHaveBeenCalled();
  });

  it('returns false and alerts when "data" field is missing', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const result = restoreFromBackup('{"version":"x"}');
    expect(result).toBe(false);
    expect(alertSpy).toHaveBeenCalled();
  });

  it('returns false when backup.data is not an object (null)', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const result = restoreFromBackup('{"data":null}');
    expect(result).toBe(false);
    expect(alertSpy).toHaveBeenCalled();
  });

  it('returns true and writes keys when backup structure is valid', () => {
    // Suppress reload — jsdom reload would noop but spy to be safe
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadSpy, href: 'http://localhost/' },
    });
    const payload = JSON.stringify({
      timestamp: '2026-01-01',
      data: { 'logs': '[{"a":1}]', 'weights': '{"100":true}' },
    });
    const result = restoreFromBackup(payload);
    expect(result).toBe(true);
    expect(localStorage.getItem('logs')).toBe('[{"a":1}]');
    expect(localStorage.getItem('weights')).toBe('{"100":true}');
    expect(window._suppressFirebaseSync).toBe(true);
  });

  it('warns when a key write throws during restore but continues', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Force one specific key to throw on setItem
    const setItemOrig = Storage.prototype.setItem;
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (/** @type {string} */ k, /** @type {string} */ v) {
      if (k === 'will-throw') throw new Error('write fail');
      return setItemOrig.call(this, k, v);
    });
    const payload = JSON.stringify({
      data: { 'safe-key': 'ok', 'will-throw': 'boom' },
    });
    const result = restoreFromBackup(payload);
    expect(result).toBe(true);
    expect(warnSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
  });
});

// ──────────────────────────────────────────────────────────────────────────
// restoreLastBackup
// ──────────────────────────────────────────────────────────────────────────

describe('restoreLastBackup', () => {
  it('alerts and returns null when no last-backup exists', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const result = restoreLastBackup();
    expect(result).toBeNull();
    expect(alertSpy).toHaveBeenCalled();
  });

  it('restores from existing last-backup successfully', () => {
    const payload = JSON.stringify({
      timestamp: '2026-01-01',
      data: { 'foo': 'bar' },
    });
    localStorage.setItem('last-backup', payload);
    const result = restoreLastBackup();
    expect(result).toBe(true);
    expect(localStorage.getItem('foo')).toBe('bar');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// resetTestData — Firebase paths
// ──────────────────────────────────────────────────────────────────────────

describe('resetTestData — Firebase paths', () => {
  it('skips Firebase cleanup gracefully when userPath is null', async () => {
    firebaseMockState.userPath = null;
    const fetchSpy = vi.fn();
    global.fetch = /** @type {any} */ (fetchSpy);
    await resetTestData({ clearFirebase: true, reload: false });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('removes TEST_RESIDUE_KEYS from Firebase remote payload (PUT after GET)', async () => {
    firebaseMockState.userPath = 'users/uid-test';
    const fetchSpy = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          'auto-recommendations': '[]',
          'equipment-occupied-session': '[]',
          'logs': '[{"real":true}]',
        }),
      })
      .mockResolvedValueOnce({ ok: true });
    global.fetch = /** @type {any} */ (fetchSpy);

    await resetTestData({ clearFirebase: true, reload: false });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const putCall = fetchSpy.mock.calls[1];
    expect(putCall[1].method).toBe('PUT');
    const body = JSON.parse(putCall[1].body);
    expect(body['auto-recommendations']).toBeUndefined();
    expect(body['logs']).toBe('[{"real":true}]');
  });

  it('handles Firebase GET fail (response not ok) with local-only fallback', async () => {
    firebaseMockState.userPath = 'users/uid-test';
    const fetchSpy = vi.fn().mockResolvedValueOnce({ ok: false });
    global.fetch = /** @type {any} */ (fetchSpy);
    await resetTestData({ clearFirebase: true, reload: false });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('warns when Firebase fetch throws (network error) but completes locally', async () => {
    firebaseMockState.userPath = 'users/uid-test';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    global.fetch = /** @type {any} */ (vi.fn().mockRejectedValue(new Error('network down')));
    localStorage.setItem('auto-recommendations', '[]');
    await resetTestData({ clearFirebase: true, reload: false });
    expect(warnSpy).toHaveBeenCalled();
    expect(localStorage.getItem('auto-recommendations')).toBeNull();
  });

  it('skips Firebase PUT when remote returns null payload', async () => {
    firebaseMockState.userPath = 'users/uid-test';
    const fetchSpy = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => null });
    global.fetch = /** @type {any} */ (fetchSpy);
    await resetTestData({ clearFirebase: true, reload: false });
    // Only the GET — no PUT because remote is null
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('writes __suppressFirebaseSyncUntil sentinel when reload=true', async () => {
    vi.useFakeTimers();
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadSpy },
    });
    const before = Date.now();
    const promise = resetTestData({ clearFirebase: false, reload: true });
    // Don't actually trigger reload — advance timers minimally
    vi.advanceTimersByTime(0);
    await promise;
    const sentinel = localStorage.getItem('__suppressFirebaseSyncUntil');
    expect(sentinel).not.toBeNull();
    expect(Number(sentinel)).toBeGreaterThanOrEqual(before);
    vi.advanceTimersByTime(4000);
    vi.useRealTimers();
  });

  it('returns summary object with cleared count and firebase flag', async () => {
    const result = await resetTestData({ clearFirebase: false, reload: false });
    expect(result).toEqual({ cleared: TEST_RESIDUE_KEYS.length, firebase: false });
  });
});

// ──────────────────────────────────────────────────────────────────────────
// fullReset — Firebase + serviceWorker + Cache + IndexedDB paths
// ──────────────────────────────────────────────────────────────────────────

describe('fullReset — full wipe paths', () => {
  it('PUTs null to Firebase when clearFirebase=true and userPath resolves', async () => {
    firebaseMockState.userPath = 'users/uid-test';
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = /** @type {any} */ (fetchSpy);
    await fullReset({ clearFirebase: true, reload: false });
    expect(fetchSpy).toHaveBeenCalled();
    const call = fetchSpy.mock.calls[0];
    expect(call[1].method).toBe('PUT');
    expect(call[1].body).toBe('null');
  });

  it('skips Firebase wipe when userPath is null', async () => {
    firebaseMockState.userPath = null;
    const fetchSpy = vi.fn();
    global.fetch = /** @type {any} */ (fetchSpy);
    await fullReset({ clearFirebase: true, reload: false });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('warns when Firebase wipe rejects (network fail)', async () => {
    firebaseMockState.userPath = 'users/uid-test';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    global.fetch = /** @type {any} */ (vi.fn().mockRejectedValue(new Error('boom')));
    await fullReset({ clearFirebase: true, reload: false });
    expect(warnSpy).toHaveBeenCalled();
  });

  it('unregisters service workers when navigator.serviceWorker is available', async () => {
    const unregSpy = vi.fn().mockResolvedValue(true);
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistrations: vi.fn().mockResolvedValue([
          { unregister: unregSpy },
          { unregister: unregSpy },
        ]),
      },
    });
    await fullReset({ clearFirebase: false, reload: false });
    expect(unregSpy).toHaveBeenCalledTimes(2);
    // cleanup
    Reflect.deleteProperty(navigator, 'serviceWorker');
  });

  it('warns when serviceWorker.getRegistrations throws', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistrations: vi.fn().mockRejectedValue(new Error('sw broken')) },
    });
    await fullReset({ clearFirebase: false, reload: false });
    expect(warnSpy).toHaveBeenCalled();
    Reflect.deleteProperty(navigator, 'serviceWorker');
  });

  it('clears Cache API when caches global is available', async () => {
    const deleteSpy = vi.fn().mockResolvedValue(true);
    Object.defineProperty(window, 'caches', {
      configurable: true,
      value: {
        keys: vi.fn().mockResolvedValue(['c1', 'c2']),
        delete: deleteSpy,
      },
    });
    await fullReset({ clearFirebase: false, reload: false });
    expect(deleteSpy).toHaveBeenCalledTimes(2);
    Reflect.deleteProperty(window, 'caches');
  });

  it('warns when Cache API throws', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    Object.defineProperty(window, 'caches', {
      configurable: true,
      value: { keys: vi.fn().mockRejectedValue(new Error('cache fail')) },
    });
    await fullReset({ clearFirebase: false, reload: false });
    expect(warnSpy).toHaveBeenCalled();
    Reflect.deleteProperty(window, 'caches');
  });

  it('deletes IndexedDB databases via indexedDB.databases()', async () => {
    const deleteDbSpy = vi.fn((/** @type {string} */ _name) => {
      const req = /** @type {any} */ ({});
      // Fire success in a microtask to allow .onsuccess assignment first
      setTimeout(() => { if (req.onsuccess) req.onsuccess(); }, 0);
      return req;
    });
    const origIDB = global.indexedDB;
    global.indexedDB = /** @type {any} */ ({
      databases: vi.fn().mockResolvedValue([{ name: 'db1' }, { name: 'db2' }, { name: null }]),
      deleteDatabase: deleteDbSpy,
    });
    await fullReset({ clearFirebase: false, reload: false });
    // Two named DBs scheduled — unnamed one short-circuits
    expect(deleteDbSpy).toHaveBeenCalledTimes(2);
    global.indexedDB = origIDB;
  });

  it('warns when IndexedDB.databases() throws', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const origIDB = global.indexedDB;
    global.indexedDB = /** @type {any} */ ({
      databases: vi.fn().mockRejectedValue(new Error('idb broken')),
    });
    await fullReset({ clearFirebase: false, reload: false });
    expect(warnSpy).toHaveBeenCalled();
    global.indexedDB = origIDB;
  });

  it('skips IndexedDB when databases() is not a function (legacy browsers)', async () => {
    const origIDB = global.indexedDB;
    global.indexedDB = /** @type {any} */ ({});
    await expect(fullReset({ clearFirebase: false, reload: false })).resolves.toBeTruthy();
    global.indexedDB = origIDB;
  });

  it('clears sessionStorage', async () => {
    sessionStorage.setItem('temp', '1');
    await fullReset({ clearFirebase: false, reload: false });
    expect(sessionStorage.getItem('temp')).toBeNull();
  });

  it('warns when sessionStorage.clear throws', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // jsdom's sessionStorage is the same Storage prototype as localStorage.
    // We need a stub that ONLY throws when sessionStorage.clear is called.
    // Approach: override the global `sessionStorage` itself with a custom object.
    const sessionOrig = window.sessionStorage;
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: {
        clear: () => { throw new Error('ss fail'); },
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        key: () => null,
        length: 0,
      },
    });
    try {
      await fullReset({ clearFirebase: false, reload: false });
      expect(warnSpy).toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, 'sessionStorage', { configurable: true, value: sessionOrig });
    }
  });

  it('returns summary { cleared: "all", firebase }', async () => {
    const result = await fullReset({ clearFirebase: false, reload: false });
    expect(result).toEqual({ cleared: 'all', firebase: false });
  });

  it('returns undefined when auto-backup fails AND user cancels via confirm', async () => {
    // Force createAutoBackup throw via localStorage mock side effect
    // Simpler: make Object.keys-iteration fail via localStorage.length being -1
    // Cleaner: spy and force throw via document.createElement breaking the download path
    // We instead break by hijacking JSON.stringify temporarily
    const origStringify = JSON.stringify;
    let calls = 0;
    JSON.stringify = /** @type {any} */ ((...args) => {
      calls++;
      if (calls === 1) throw new Error('serialize fail');
      return origStringify.apply(JSON, /** @type {any} */ (args));
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    try {
      const result = await fullReset({ clearFirebase: false, reload: false });
      expect(result).toBeUndefined();
      expect(warnSpy).toHaveBeenCalled();
      expect(confirmSpy).toHaveBeenCalled();
    } finally {
      JSON.stringify = origStringify;
    }
  });

  it('continues when auto-backup fails but user confirms via confirm', async () => {
    const origStringify = JSON.stringify;
    let throwOnce = true;
    JSON.stringify = /** @type {any} */ ((...args) => {
      if (throwOnce) { throwOnce = false; throw new Error('serialize fail'); }
      return origStringify.apply(JSON, /** @type {any} */ (args));
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    try {
      const result = await fullReset({ clearFirebase: false, reload: false });
      expect(result).toEqual({ cleared: 'all', firebase: false });
    } finally {
      JSON.stringify = origStringify;
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────
// resetButKeepRealLogs
// ──────────────────────────────────────────────────────────────────────────

describe('resetButKeepRealLogs', () => {
  it('preserves the configured KEEP_KEYS (logs, weights, kcals, etc.)', async () => {
    localStorage.setItem('logs', '[{"r":1}]');
    localStorage.setItem('weights', '{"100":true}');
    localStorage.setItem('current-kcal', '2500');
    localStorage.setItem('auto-recommendations', '[]');
    const result = await resetButKeepRealLogs({ reload: false });
    expect(localStorage.getItem('logs')).toBe('[{"r":1}]');
    expect(localStorage.getItem('weights')).toBe('{"100":true}');
    expect(localStorage.getItem('current-kcal')).toBe('2500');
    expect(localStorage.getItem('auto-recommendations')).toBeNull();
    expect(result.preserved).toBeGreaterThan(0);
  });

  it('clears sessionStorage', async () => {
    sessionStorage.setItem('foo', 'bar');
    await resetButKeepRealLogs({ reload: false });
    expect(sessionStorage.getItem('foo')).toBeNull();
  });

  it('handles sessionStorage.clear throwing silently', async () => {
    const sessionOrig = window.sessionStorage;
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: {
        clear: () => { throw new Error('ss fail'); },
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        key: () => null,
        length: 0,
      },
    });
    try {
      await expect(resetButKeepRealLogs({ reload: false })).resolves.toBeTruthy();
    } finally {
      Object.defineProperty(window, 'sessionStorage', { configurable: true, value: sessionOrig });
    }
  });

  it('writes __suppressFirebaseSyncUntil when reload=true', async () => {
    vi.useFakeTimers();
    const before = Date.now();
    const promise = resetButKeepRealLogs({ reload: true });
    await promise;
    const sentinel = localStorage.getItem('__suppressFirebaseSyncUntil');
    expect(sentinel).not.toBeNull();
    expect(Number(sentinel)).toBeGreaterThanOrEqual(before);
    vi.useRealTimers();
  });

  it('returns summary { preserved, cleared }', async () => {
    localStorage.setItem('logs', '[]');
    const result = await resetButKeepRealLogs({ reload: false });
    expect(result).toHaveProperty('preserved');
    expect(result).toHaveProperty('cleared');
    expect(result.cleared).toBe(TEST_RESIDUE_KEYS.length);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// inspectStorage
// ──────────────────────────────────────────────────────────────────────────

describe('inspectStorage', () => {
  it('categorizes keys into userData / testResidue / unknown buckets', () => {
    localStorage.setItem('logs', '[]');                  // userData
    localStorage.setItem('auto-recommendations', '[]');  // testResidue
    localStorage.setItem('random-key', 'x');             // unknown
    const tableSpy = vi.spyOn(console, 'table').mockImplementation(() => {});
    const report = inspectStorage();
    expect(report.userData).toHaveProperty('logs');
    expect(report.testResidue).toHaveProperty('auto-recommendations');
    expect(report.unknown).toHaveProperty('random-key');
    expect(tableSpy).toHaveBeenCalledTimes(3);
  });

  it('reports byte sizes for each key', () => {
    localStorage.setItem('logs', '[123]');
    vi.spyOn(console, 'table').mockImplementation(() => {});
    const report = inspectStorage();
    expect(report.userData.logs).toBe('5 bytes');
  });

  it('handles empty localStorage gracefully', () => {
    vi.spyOn(console, 'table').mockImplementation(() => {});
    const report = inspectStorage();
    expect(report.userData).toEqual({});
    expect(report.testResidue).toEqual({});
    expect(report.unknown).toEqual({});
  });
});

// ──────────────────────────────────────────────────────────────────────────
// restoreRealLogs
// ──────────────────────────────────────────────────────────────────────────

describe('restoreRealLogs', () => {
  it('writes the hardcoded 27-entry training payload when no existing logs', () => {
    const result = restoreRealLogs({ merge: false });
    expect(result).toHaveProperty('restored', 27);
    expect(result.total).toBe(27);
    const stored = JSON.parse(/** @type {string} */ (localStorage.getItem('logs')));
    expect(stored).toHaveLength(27);
  });

  it('merges with existing logs (de-dup by ts) when merge=true', () => {
    const PULL_TS = new Date('2026-04-21T10:00:00').getTime();
    const FAR_FUTURE_TS = 9_999_999_999_999; // year ~2286, well past hardcoded 2026-04-22
    const existing = [
      { ts: PULL_TS + 1000, ex: 'Lat Pulldown', custom: true }, // collision with hardcoded payload
      { ts: FAR_FUTURE_TS, ex: 'Other', custom: true },
    ];
    localStorage.setItem('logs', JSON.stringify(existing));
    const result = restoreRealLogs({ merge: true });
    const stored = JSON.parse(/** @type {string} */ (localStorage.getItem('logs')));
    // restoreRealLogs reports the raw count, but de-dup happens in filter
    expect(result.restored).toBe(27);
    expect(stored.length).toBe(existing.length + 27 - 1); // -1 collision skipped
    // sorted descending by ts — FAR_FUTURE_TS should be at index 0
    expect(stored[0].ts).toBe(FAR_FUTURE_TS);
  });

  it('replaces existing logs entirely when merge=false', () => {
    localStorage.setItem('logs', JSON.stringify([{ ts: 1, custom: true }]));
    restoreRealLogs({ merge: false });
    const stored = JSON.parse(/** @type {string} */ (localStorage.getItem('logs')));
    expect(stored.find((/** @type {any} */ l) => l.custom === true)).toBeUndefined();
    expect(stored).toHaveLength(27);
  });

  it('handles JSON.parse failure on existing logs (returns error summary)', () => {
    localStorage.setItem('logs', '{not-valid');
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = restoreRealLogs({ merge: true });
    expect(result.restored).toBe(0);
    expect(result).toHaveProperty('error');
    expect(errSpy).toHaveBeenCalled();
  });

  it('uses default merge=true when no args passed', () => {
    const result = restoreRealLogs();
    expect(result).toHaveProperty('merge', true);
  });

  it('sorts merged logs descending by ts', () => {
    restoreRealLogs({ merge: false });
    const stored = JSON.parse(/** @type {string} */ (localStorage.getItem('logs')));
    for (let i = 1; i < stored.length; i++) {
      expect(stored[i - 1].ts).toBeGreaterThanOrEqual(stored[i].ts);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────
// window.* surface exposure
// ──────────────────────────────────────────────────────────────────────────

describe('window.* exposure (dev console handles)', () => {
  it('exposes resetTestData, fullReset, inspectStorage on window', () => {
    expect(typeof window.resetTestData).toBe('function');
    expect(typeof window.fullReset).toBe('function');
    expect(typeof window.inspectStorage).toBe('function');
    expect(typeof window.resetButKeepRealLogs).toBe('function');
    expect(typeof window.createAutoBackup).toBe('function');
    expect(typeof window.restoreFromBackup).toBe('function');
    expect(typeof window.restoreLastBackup).toBe('function');
    expect(typeof window.restoreRealLogs).toBe('function');
  });
});
