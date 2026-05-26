// Tests for src/auth.js — Firebase Auth REST helpers (Batch B Task 1).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  sendMagicLink,
  verifyMagicLink,
  parseMagicLinkUrl,
  buildGoogleSignInUrl,
  signInWithGoogleIdToken,
  getAuthState,
  getIdToken,
  refreshIdToken,
  signOut,
  isAuthenticated,
  isAuthFresh,
  restoreSession,
  AUTH_FRESHNESS_WINDOW_MS,
  AUTH_STORAGE_KEYS,
} from '../auth.js';

function _resetStorage() {
  Object.values(AUTH_STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}

describe('auth — magic link flow', () => {
  beforeEach(() => { _resetStorage(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('rejects invalid email', async () => {
    const res = await sendMagicLink('not-an-email');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('invalid_email');
  });

  it('persists pending email on send success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    const res = await sendMagicLink('test@example.com');
    expect(res.ok).toBe(true);
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.pendingEmail)).toBe('test@example.com');
  });

  it('returns error on send failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'INVALID_EMAIL' } }),
    });
    const res = await sendMagicLink('test@example.com');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('INVALID_EMAIL');
  });

  it('verifies magic link and persists tokens', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        idToken: 'IDT',
        refreshToken: 'RT',
        localId: 'uid-123',
        expiresIn: '3600',
      }),
    });
    const res = await verifyMagicLink('test@example.com', 'OOB');
    expect(res.ok).toBe(true);
    expect(res.uid).toBe('uid-123');
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.idToken)).toBe('IDT');
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.uid)).toBe('uid-123');
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)).toBe('RT');
    const exp = Number(localStorage.getItem(AUTH_STORAGE_KEYS.expiry));
    expect(exp).toBeGreaterThan(Date.now());
  });

  it('verifyMagicLink fails on missing input', async () => {
    const r1 = await verifyMagicLink('', 'OOB');
    expect(r1.ok).toBe(false);
    const r2 = await verifyMagicLink('test@example.com', '');
    expect(r2.ok).toBe(false);
  });

  it('parseMagicLinkUrl extracts oobCode + email', () => {
    expect(parseMagicLinkUrl('?oobCode=ABC&email=foo%40bar.com'))
      .toEqual({ oobCode: 'ABC', email: 'foo@bar.com' });
    expect(parseMagicLinkUrl('')).toEqual({ oobCode: null, email: null });
  });
});

describe('auth — Google OAuth (signInWithIdp)', () => {
  beforeEach(() => { _resetStorage(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('builds a Google OAuth URL with required params', () => {
    const url = buildGoogleSignInUrl('CLIENT.apps.googleusercontent.com');
    expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url).toContain('client_id=CLIENT.apps.googleusercontent.com');
    expect(url).toContain('response_type=id_token');
    expect(url).toContain('scope=openid+email+profile');
  });

  it('throws if no client id', () => {
    expect(() => buildGoogleSignInUrl('')).toThrow();
  });

  it('exchanges Google id_token for Firebase tokens', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        idToken: 'IDT',
        refreshToken: 'RT',
        localId: 'uid-google',
        expiresIn: '3600',
      }),
    });
    const res = await signInWithGoogleIdToken('GOOGLE_ID');
    expect(res.ok).toBe(true);
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.uid)).toBe('uid-google');
  });

  it('errors on missing id_token', async () => {
    const res = await signInWithGoogleIdToken('');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('missing_id_token');
  });
});

describe('auth — token state + refresh', () => {
  beforeEach(() => { _resetStorage(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('getAuthState returns null when nothing set', () => {
    expect(getAuthState()).toBeNull();
  });

  it('getAuthState returns uid + token when present', () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-1');
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'TOK');
    const s = getAuthState();
    expect(s).toEqual({ uid: 'uid-1', idToken: 'TOK', expiry: 0 });
  });

  it('getIdToken returns current token when fresh', async () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-1');
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'FRESH');
    localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 600_000));
    const t = await getIdToken();
    expect(t).toBe('FRESH');
  });

  it('getIdToken triggers refresh when stale', async () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-1');
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'STALE');
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, 'RT');
    localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() - 1000)); // expired
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        id_token: 'NEW',
        refresh_token: 'RT2',
        user_id: 'uid-1',
        expires_in: '3600',
      }),
    });
    const t = await getIdToken();
    expect(t).toBe('NEW');
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.idToken)).toBe('NEW');
  });

  it('refreshIdToken errors when no refresh token', async () => {
    const res = await refreshIdToken();
    expect(res.ok).toBe(false);
    expect(res.error).toBe('no_refresh_token');
  });

  it('§S-09 dedups concurrent refreshes into a single network call', async () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-1');
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, 'RT');
    // Defer fetch resolution so all three callers overlap while in-flight.
    let resolveFetch;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise((resolve) => { resolveFetch = resolve; })
    );
    const p1 = refreshIdToken();
    const p2 = refreshIdToken();
    const p3 = refreshIdToken();
    resolveFetch({
      ok: true,
      json: async () => ({ id_token: 'NEW', refresh_token: 'RT2', user_id: 'uid-1', expires_in: '3600' }),
    });
    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
    // Single POST despite three concurrent callers (burst collapse).
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(r1).toEqual({ ok: true, idToken: 'NEW' });
    expect(r2).toEqual({ ok: true, idToken: 'NEW' });
    expect(r3).toEqual({ ok: true, idToken: 'NEW' });
  });

  it('§S-09 in-flight promise clears so a later refresh fetches again', async () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-1');
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, 'RT');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ id_token: 'NEW', refresh_token: 'RT2', user_id: 'uid-1', expires_in: '3600' }),
    });
    await refreshIdToken();
    await refreshIdToken();
    // Sequential (non-overlapping) refreshes each fetch — cache only dedups
    // while pending, never permanently.
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('signOut clears all auth state', () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-1');
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'IDT');
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, 'RT');
    localStorage.setItem(AUTH_STORAGE_KEYS.expiry, '999');
    expect(isAuthenticated()).toBe(true);
    signOut();
    expect(isAuthenticated()).toBe(false);
    Object.values(AUTH_STORAGE_KEYS).forEach(k => {
      expect(localStorage.getItem(k)).toBeNull();
    });
  });
});

describe('auth — restoreSession (stay-logged-in on boot)', () => {
  beforeEach(() => { _resetStorage(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('returns false + no network when no refresh token (anonymous / skip-auth)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const ok = await restoreSession();
    expect(ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns true WITHOUT a refresh when idToken still comfortably fresh', async () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-1');
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'FRESH');
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, 'RT');
    localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 30 * 60 * 1000));
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const ok = await restoreSession();
    expect(ok).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('refreshes the idToken when expired and a refresh token exists (returning user reload)', async () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-1');
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'STALE');
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, 'RT');
    localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() - 1000));
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ id_token: 'NEW', refresh_token: 'RT2', user_id: 'uid-1', expires_in: '3600' }),
    });
    const ok = await restoreSession();
    expect(ok).toBe(true);
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.idToken)).toBe('NEW');
    expect(isAuthenticated()).toBe(true);
  });

  it('keeps the session on a TRANSIENT refresh failure (offline returning user not booted out)', async () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-1');
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'STALE');
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, 'RT');
    localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() - 1000));
    // Network error (offline) — fetch rejects.
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Failed to fetch'));
    const ok = await restoreSession();
    expect(ok).toBe(false);
    // Tokens preserved — lazy getIdToken refresh retries later; NOT signed out.
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)).toBe('RT');
    expect(isAuthenticated()).toBe(true);
  });

  it('signs out cleanly on a DEFINITIVE auth failure (dead/revoked refresh token)', async () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-1');
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'STALE');
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, 'RT');
    localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() - 1000));
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'TOKEN_EXPIRED' } }),
    });
    const ok = await restoreSession();
    expect(ok).toBe(false);
    // Dead refresh token → full sign-out so routing shows clean logged-out state.
    expect(isAuthenticated()).toBe(false);
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)).toBeNull();
  });
});

describe('auth — §A016 freshness gate for destructive actions', () => {
  beforeEach(() => { _resetStorage(); });

  it('isAuthFresh returns false cand lastAuthAt missing', () => {
    expect(isAuthFresh()).toBe(false);
  });

  it('isAuthFresh returns true imediat dupa lastAuthAt set', () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.lastAuthAt, String(Date.now()));
    expect(isAuthFresh()).toBe(true);
  });

  it('isAuthFresh returns false cand lastAuthAt > window ago', () => {
    localStorage.setItem(
      AUTH_STORAGE_KEYS.lastAuthAt,
      String(Date.now() - AUTH_FRESHNESS_WINDOW_MS - 1000),
    );
    expect(isAuthFresh()).toBe(false);
  });

  it('isAuthFresh returns true cand lastAuthAt exact la marginea window', () => {
    localStorage.setItem(
      AUTH_STORAGE_KEYS.lastAuthAt,
      String(Date.now() - AUTH_FRESHNESS_WINDOW_MS + 100),
    );
    expect(isAuthFresh()).toBe(true);
  });

  it('signOut clears lastAuthAt', () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.lastAuthAt, String(Date.now()));
    signOut();
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.lastAuthAt)).toBeNull();
  });
});
