/**
 * MED-CODE-22 (code review v2 chat 5) — DB.set QuotaExceededError resilience.
 *
 * Prior version: `localStorage.setItem` un-guarded — `QuotaExceededError`
 * (Safari/iOS PWA 5MB cap, Maria 65 long-session edge) silently crashed the
 * React tree by surfacing through every caller (firebase sync, onboarding,
 * dashboard, weight, session, plan, ...).
 *
 * New contract:
 *   - Success → `{ok: true}`
 *   - QuotaExceededError → `{ok: false, error: 'quota_exceeded', key}` +
 *     Sentry capture tagged `component: 'DB.set'`. No throw.
 *   - Unknown errors bubble (existing contract preserved).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mock src/util/sentry.js so we can assert captureException invocation ─────
const captureExceptionMock = vi.fn();
vi.mock('../util/sentry.js', () => ({
  captureException: (/** @type {unknown} */ err, /** @type {unknown} */ ctx) => captureExceptionMock(err, ctx),
  initSentry: vi.fn(),
}));

import { DB } from '../db.js';

describe('DB.set — QuotaExceededError resilience (MED-CODE-22)', () => {
  beforeEach(() => {
    localStorage.clear();
    captureExceptionMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns {ok: true} on successful write', () => {
    const result = DB.set('k', { a: 1 });
    expect(result).toEqual({ ok: true });
    expect(localStorage.getItem('k')).toBe('{"a":1}');
  });

  it('returns {ok: false, error: "quota_exceeded", key} on QuotaExceededError — does NOT throw', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    const result = DB.set('logs', [{ id: 1 }]);
    expect(result).toEqual({ ok: false, error: 'quota_exceeded', key: 'logs' });
  });

  it('captures QuotaExceededError to Sentry with component + key tags', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    DB.set('photos', ['big-base64-payload']);
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    const [err, ctx] = captureExceptionMock.mock.calls[0];
    expect(/** @type {DOMException} */ (err).name).toBe('QuotaExceededError');
    expect(ctx).toEqual({ tags: { component: 'DB.set', key: 'photos' } });
  });

  it('rethrows unknown errors (preserves existing contract)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new TypeError('unexpected serialization failure');
    });
    expect(() => DB.set('k', { a: 1 })).toThrow(TypeError);
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });

  it('swallows Sentry capture failure — still returns quota_exceeded result', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    captureExceptionMock.mockImplementation(() => { throw new Error('Sentry transport down'); });
    expect(() => {
      const result = DB.set('weights', { '2026-05-22': 80 });
      expect(result).toEqual({ ok: false, error: 'quota_exceeded', key: 'weights' });
    }).not.toThrow();
  });

  it('does NOT capture to Sentry for non-quota errors', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('something else');
    });
    expect(() => DB.set('k', { a: 1 })).toThrow();
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });
});
