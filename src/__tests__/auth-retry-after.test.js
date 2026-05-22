// ══ §25-H1 audit fix — sendMagicLink Retry-After header respect ═══════════
//
// Firebase Identity Toolkit poate returna 429 Too Many Requests cu header
// Retry-After (RFC 7231 §7.1.3). Anterior retry loop folosea backoff default
// 250/500ms ignorand server hint → reqs respinse repetat in cooldown window
// (quota gating). Fix: 429 = retryable cu Retry-After respect, alte 4xx
// raman deterministic-fail.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sendMagicLink, parseRetryAfter, MAX_RETRY_AFTER_MS, AUTH_STORAGE_KEYS } from '../auth.js';

function _resetAuth() {
  Object.values(AUTH_STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}

describe('auth — §25-H1 parseRetryAfter helper', () => {
  it('returns null for empty / null / undefined input', () => {
    expect(parseRetryAfter(null)).toBeNull();
    expect(parseRetryAfter(undefined)).toBeNull();
    expect(parseRetryAfter('')).toBeNull();
    expect(parseRetryAfter('   ')).toBeNull();
  });

  it('parses delta-seconds format (most common)', () => {
    expect(parseRetryAfter('5')).toBe(5_000);
    expect(parseRetryAfter('0')).toBe(0);
    expect(parseRetryAfter('  10  ')).toBe(10_000);
  });

  it('parses HTTP-date format', () => {
    const future = new Date(Date.now() + 3_000).toUTCString();
    const result = parseRetryAfter(future);
    expect(result).not.toBeNull();
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(3_000);
  });

  it('clamps delta-seconds to MAX_RETRY_AFTER_MS (anti-DoS)', () => {
    expect(parseRetryAfter('3600')).toBe(MAX_RETRY_AFTER_MS); // 1h asked → 60s capped
    expect(parseRetryAfter('999999')).toBe(MAX_RETRY_AFTER_MS);
  });

  it('clamps HTTP-date far future to MAX_RETRY_AFTER_MS', () => {
    const farFuture = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
    expect(parseRetryAfter(farFuture)).toBe(MAX_RETRY_AFTER_MS);
  });

  it('returns 0 for HTTP-date in the past', () => {
    const past = new Date(Date.now() - 60_000).toUTCString();
    expect(parseRetryAfter(past)).toBe(0);
  });

  it('returns null for garbage input', () => {
    expect(parseRetryAfter('not a date')).toBeNull();
    expect(parseRetryAfter('-5')).toBeNull(); // negative not allowed per spec
  });
});

describe('auth — §25-H1 sendMagicLink Retry-After respect on 429', () => {
  /** @type {ReturnType<typeof vi.fn>} */
  let fetchMock;

  beforeEach(() => {
    _resetAuth();
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    _resetAuth();
  });

  it('429 with Retry-After: 2 → uses 2000ms backoff (NOT default 250ms)', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('{}', {
        status: 429,
        headers: { 'Retry-After': '2' }
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    const promise = sendMagicLink('user@example.com');
    // First attempt fires immediately.
    await vi.advanceTimersByTimeAsync(0);
    // Retry-After = 2s → second attempt should NOT fire before 2000ms.
    await vi.advanceTimersByTimeAsync(500);
    expect(fetchMock).toHaveBeenCalledTimes(1); // still only first
    await vi.advanceTimersByTimeAsync(1500);    // total 2000ms
    const result = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
  });

  it('429 without Retry-After header → falls back to default backoff', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('{}', { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    const promise = sendMagicLink('user@example.com');
    await vi.advanceTimersByTimeAsync(250); // default first backoff
    const result = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
  });

  it('400 invalid_email → deterministic fail, NU retry (unchanged behavior)', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      error: { message: 'INVALID_EMAIL' }
    }), { status: 400 }));

    const result = await sendMagicLink('user@example.com');
    expect(fetchMock).toHaveBeenCalledTimes(1); // NO retry
    expect(result.ok).toBe(false);
    expect(result.error).toBe('INVALID_EMAIL');
  });

  it('5xx transient → retry cu default backoff (unchanged behavior)', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    const promise = sendMagicLink('user@example.com');
    await vi.advanceTimersByTimeAsync(250);
    const result = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
  });

  it('429 persists 3 attempts → final fail cu http_429 error', async () => {
    fetchMock.mockResolvedValue(new Response('{}', {
      status: 429,
      headers: { 'Retry-After': '1' }
    }));

    const promise = sendMagicLink('user@example.com');
    await vi.advanceTimersByTimeAsync(10_000); // exhaust all backoffs
    const result = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(3); // MAX_ATTEMPTS
    expect(result.ok).toBe(false);
    expect(result.error).toBe('http_429');
  });
});
