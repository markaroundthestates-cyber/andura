// ══ src/firebase.js — getUserPath() BUG 2 fix tests ════════════════════════
//
// Per §AMENDMENT 2026-05-04 evening + §56.1.3 LOCKED V1 (HANDOVER_GLOBAL):
// Mode Anonymous (`getAuthState() === null`) → `getUserPath()` returnează
// **null** (NU fallback hardcodat `LEGACY_USER_PATH = 'users/daniel'`).
// Eliminates 401 cycle infinit per §36.80 BUG 2 RESOLUTION.

import { describe, it, expect, beforeEach } from 'vitest';
import { getUserPath, LEGACY_USER_PATH, USER_PATH } from '../firebase.js';
import { AUTH_STORAGE_KEYS } from '../auth.js';

function _resetAuthStorage() {
  Object.values(AUTH_STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}

describe('firebase — getUserPath() §56.1.3 BUG 2 fix', () => {
  beforeEach(() => { _resetAuthStorage(); });

  it('returns null in Anonymous mode (no auth state)', () => {
    // Per §56.1.3: BUG 2 root cause was returning LEGACY_USER_PATH hardcoded.
    // Spec LOCKED V1: Anonymous → null → app exclusiv local IndexedDB.
    expect(getUserPath()).toBeNull();
  });

  it('returns null when only partial auth state present', () => {
    // Defensive: missing uid alone shouldn't resolve to LEGACY fallback.
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'partial-token-no-uid');
    expect(getUserPath()).toBeNull();
  });

  it('returns users/<uid> when authenticated', () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'firebase-uid-abc123');
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'token-xyz');
    expect(getUserPath()).toBe('users/firebase-uid-abc123');
  });

  it('preserves LEGACY_USER_PATH export as migration source constant', () => {
    // Per §56.4.1: legacy literal preserved pentru one-time Daniel migration
    // source (`users/daniel` → `users/{uid}` via 2026-05-02 runner).
    // Constant rămâne exported, NU returned by getUserPath() Anonymous.
    expect(LEGACY_USER_PATH).toBe('users/daniel');
    expect(USER_PATH).toBe('users/daniel'); // back-compat alias
  });

  it('does NOT fall back to legacy literal when auth state present but uid empty string', () => {
    // Edge case: garbage uid value ('') should NOT resolve to users/.
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, '');
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'token-xyz');
    expect(getUserPath()).toBeNull();
  });
});
