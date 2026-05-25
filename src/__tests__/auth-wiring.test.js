// ══ Auth wiring §AMENDMENT 2026-05-04 + §56 LOCKED V1 tests ════════════════
//
// Coverage:
//   - sendMagicLink 3x auto-retry on transient failure (§56.13.1)
//   - sendMagicLink NU retry pe 4xx (deterministic failure)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sendMagicLink, AUTH_STORAGE_KEYS } from '../auth.js';

function _resetAuthStorage() {
  Object.values(AUTH_STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}

describe('sendMagicLink — §56.13.1 auto-retry 3x', () => {
  beforeEach(() => { _resetAuthStorage(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('succeeds on first attempt without retry', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    const res = await sendMagicLink('test@example.com');
    expect(res.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('retries up to 3x on network error then surfaces failure', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error('network_error')
    );
    const res = await sendMagicLink('test@example.com');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('network_error');
    // Per §56.13.1: 1 initial + 2 retries = 3 total attempts.
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it('retries on HTTP 5xx then surfaces last error', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: { message: 'SERVICE_UNAVAILABLE' } }),
    });
    const res = await sendMagicLink('test@example.com');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('SERVICE_UNAVAILABLE');
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it('does NOT retry on HTTP 4xx (deterministic failure)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'INVALID_EMAIL' } }),
    });
    const res = await sendMagicLink('test@example.com');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('INVALID_EMAIL');
    // Per §56.13: 4xx = deterministic, NO retry.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('eventually succeeds on retry attempt 3 after transient failures', async () => {
    let callCount = 0;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      callCount += 1;
      if (callCount < 3) throw new Error('transient_network');
      return { ok: true, json: async () => ({}) };
    });
    const res = await sendMagicLink('test@example.com');
    expect(res.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
});
