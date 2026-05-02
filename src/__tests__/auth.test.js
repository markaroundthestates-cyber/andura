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
