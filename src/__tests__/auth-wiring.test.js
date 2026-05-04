// ══ Auth wiring §AMENDMENT 2026-05-04 + §56 LOCKED V1 tests ════════════════
//
// Coverage:
//   - sendMagicLink 3x auto-retry on transient failure (§56.13.1)
//   - sendMagicLink NU retry pe 4xx (deterministic failure)
//   - handleAuthCallbackRoute /auth-callback URL detection (§56.10.1)
//   - handleAuthCallbackRoute returns null for non-auth-callback paths

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sendMagicLink, AUTH_STORAGE_KEYS } from '../auth.js';
import { handleAuthCallbackRoute } from '../pages/authShell.js';

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

describe('handleAuthCallbackRoute — §56.10.1 callback detection', () => {
  let originalLocation;

  beforeEach(() => {
    _resetAuthStorage();
    originalLocation = window.location;
    // jsdom location is read-only via prototype, so use defineProperty stub.
    delete window.location;
    window.location = { pathname: '/', search: '', hash: '' };
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.restoreAllMocks();
  });

  it('returns null when path is NOT /auth-callback', async () => {
    window.location = { pathname: '/', search: '', hash: '' };
    const res = await handleAuthCallbackRoute();
    expect(res).toBeNull();
  });

  it('returns null when path is /coach (other route)', async () => {
    window.location = { pathname: '/coach', search: '?foo=bar', hash: '' };
    const res = await handleAuthCallbackRoute();
    expect(res).toBeNull();
  });

  it('returns missing_email error when /auth-callback hit without email', async () => {
    window.location = {
      pathname: '/auth-callback',
      search: '?oobCode=valid-code-123',
      hash: '',
    };
    const res = await handleAuthCallbackRoute();
    expect(res).not.toBeNull();
    expect(res.ok).toBe(false);
    expect(res.provider).toBe('magic-link');
    expect(res.error).toBe('missing_email');
  });

  it('processes Magic Link callback with email + oobCode in URL', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        idToken: 'mock-id-token',
        refreshToken: 'mock-refresh',
        localId: 'uid-test-123',
        expiresIn: '3600',
      }),
    });
    // history.replaceState is called post-success — stub to avoid jsdom error.
    const replaceSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    window.location = {
      pathname: '/auth-callback',
      search: '?oobCode=valid-code&email=user%40example.com',
      hash: '',
    };
    const res = await handleAuthCallbackRoute();
    expect(res).not.toBeNull();
    expect(res.ok).toBe(true);
    expect(res.provider).toBe('magic-link');
    expect(res.uid).toBe('uid-test-123');
    expect(replaceSpy).toHaveBeenCalled();
  });

  it('processes Google id_token from URL fragment', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        idToken: 'firebase-token',
        refreshToken: 'firebase-refresh',
        localId: 'google-uid-456',
        expiresIn: '3600',
      }),
    });
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    window.location = {
      pathname: '/auth-callback',
      search: '',
      hash: '#id_token=google-id-token-xyz&access_token=ignored',
    };
    const res = await handleAuthCallbackRoute();
    expect(res).not.toBeNull();
    expect(res.ok).toBe(true);
    expect(res.provider).toBe('google');
    expect(res.uid).toBe('google-uid-456');
  });
});
