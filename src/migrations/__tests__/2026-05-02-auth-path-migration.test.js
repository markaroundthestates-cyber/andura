// Tests for src/migrations/2026-05-02-auth-path-migration.js (Batch B Task 1).
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  runAuthPathMigration,
  isMigrated,
  markMigrated,
  resetMigrationFlag,
} from '../2026-05-02-auth-path-migration.js';
import { AUTH_STORAGE_KEYS } from '../../auth.js';

function _setAuth(uid) {
  localStorage.setItem(AUTH_STORAGE_KEYS.uid, uid);
  localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'TOK_' + uid);
  localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 3_600_000));
}

function _clearAuth() {
  Object.values(AUTH_STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}

beforeEach(() => {
  localStorage.clear();
});

describe('auth-path-migration — gating', () => {
  it('returns no-auth when nothing set', async () => {
    const fetcher = vi.fn();
    const res = await runAuthPathMigration({ fetch: fetcher });
    expect(res.status).toBe('no-auth');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('returns skipped when already migrated for current uid', async () => {
    _setAuth('abc');
    markMigrated('abc', { reason: 'test' });
    const fetcher = vi.fn();
    const res = await runAuthPathMigration({ fetch: fetcher });
    expect(res.status).toBe('skipped');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('runs again when uid changes', async () => {
    _setAuth('abc');
    markMigrated('abc');
    _clearAuth();
    _setAuth('xyz');
    expect(isMigrated()).toBe(false);
  });
});

describe('auth-path-migration — happy path', () => {
  it('migrates source → dest when dest empty', async () => {
    _setAuth('abc');
    const fetcher = vi.fn()
      // dest GET — empty
      .mockResolvedValueOnce({ ok: true, json: async () => null })
      // source GET — has data
      .mockResolvedValueOnce({ ok: true, json: async () => ({ logs: [{ ts: 1 }], weights: { '2026-04-29': 75 } }) })
      // dest PUT — write
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      // dest GET (verify)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ logs: [{ ts: 1 }], weights: { '2026-04-29': 75 } }) });
    const res = await runAuthPathMigration({ fetch: fetcher });
    expect(res.status).toBe('migrated');
    expect(res.uid).toBe('abc');
    expect(res.sourceKeys).toBe(2);
    expect(res.destKeys).toBe(2);
    expect(isMigrated()).toBe(true);
  });

  it('idempotent — second call returns skipped', async () => {
    _setAuth('abc');
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => null })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ x: 1 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ x: 1 }) });
    await runAuthPathMigration({ fetch: fetcher });
    expect(fetcher).toHaveBeenCalledTimes(4);

    fetcher.mockClear();
    const res2 = await runAuthPathMigration({ fetch: fetcher });
    expect(res2.status).toBe('skipped');
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe('auth-path-migration — edge cases', () => {
  it('returns already-populated when dest has data', async () => {
    _setAuth('abc');
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ existing: 'data' }) });
    const res = await runAuthPathMigration({ fetch: fetcher });
    expect(res.status).toBe('already-populated');
    expect(res.destKeys).toBe(1);
    expect(isMigrated()).toBe(true); // marked done so we don't retry
  });

  it('returns no-source when legacy path empty', async () => {
    _setAuth('abc');
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => null })
      .mockResolvedValueOnce({ ok: true, json: async () => null });
    const res = await runAuthPathMigration({ fetch: fetcher });
    expect(res.status).toBe('no-source');
    expect(isMigrated()).toBe(true);
  });

  it('returns failed on source HTTP error', async () => {
    _setAuth('abc');
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => null })
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });
    const res = await runAuthPathMigration({ fetch: fetcher });
    expect(res.status).toBe('failed');
    expect(res.error).toContain('source_http_503');
    expect(isMigrated()).toBe(false); // NOT marked — caller can retry
  });

  it('returns failed on write error', async () => {
    _setAuth('abc');
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => null })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ x: 1 }) })
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
    const res = await runAuthPathMigration({ fetch: fetcher });
    expect(res.status).toBe('failed');
    expect(res.error).toContain('write_http_500');
  });

  it('returns failed on verify mismatch', async () => {
    _setAuth('abc');
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => null })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ a: 1, b: 2, c: 3 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ a: 1 }) }); // partial write
    const res = await runAuthPathMigration({ fetch: fetcher });
    expect(res.status).toBe('failed');
    expect(res.error).toContain('verify_count_mismatch');
  });

  it('preserves data — verify deep equal source vs dest', async () => {
    _setAuth('abc');
    const sourcePayload = {
      logs: [
        { ts: 1, ex: 'Squat', w: 100 },
        { ts: 2, ex: 'Bench', w: 80 },
      ],
      weights: { '2026-04-29': 75 },
      'pr-records': [{ ex: 'Squat', kg: 100, reps: 5 }],
    };
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => null })
      .mockResolvedValueOnce({ ok: true, json: async () => sourcePayload })
      .mockImplementationOnce(async (_url, init) => {
        // Verify the body that gets PUT matches source exactly.
        expect(JSON.parse(init.body)).toEqual(sourcePayload);
        return { ok: true, json: async () => ({}) };
      })
      .mockResolvedValueOnce({ ok: true, json: async () => sourcePayload });
    const res = await runAuthPathMigration({ fetch: fetcher });
    expect(res.status).toBe('migrated');
  });

  it('resetMigrationFlag forces re-run', async () => {
    _setAuth('abc');
    markMigrated('abc');
    expect(isMigrated()).toBe(true);
    resetMigrationFlag();
    expect(isMigrated()).toBe(false);
  });
});
