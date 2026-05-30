// ══ src/firebase.js — VITE_FIREBASE_RTDB_URL fail-fast guard tests ═══════════
//
// Data-separation hardening: the prior hardcoded PROD RTDB fallback meant ANY
// build without VITE_FIREBASE_RTDB_URL silently hit production user data (no
// dev/prod split). The fallback was removed and replaced with a B011-style
// fail-fast: PROD build missing the var THROWS at module load; DEV build warns
// loud and leaves FIREBASE_URL empty (Firebase ops then no-op gracefully via the
// existing try/catch in fbGet/fbSet/fbRemove).
//
// These tests re-import the module under controlled import.meta.env via
// vi.stubEnv + vi.resetModules to exercise all three branches.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('firebase — VITE_FIREBASE_RTDB_URL fail-fast guard', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('FIREBASE_URL uses the env var verbatim when set', async () => {
    vi.stubEnv('VITE_FIREBASE_RTDB_URL', 'https://my-staging-rtdb.example.firebasedatabase.app');
    const mod = await import('../firebase.js');
    expect(mod.FIREBASE_URL).toBe('https://my-staging-rtdb.example.firebasedatabase.app');
  });

  it('does NOT fall back to a hardcoded PROD url when the env var is absent', async () => {
    vi.stubEnv('VITE_FIREBASE_RTDB_URL', '');
    const mod = await import('../firebase.js');
    // No silent prod fallback — empty string, NOT the old fittracker-c34e8 url.
    expect(mod.FIREBASE_URL).toBe('');
    expect(mod.FIREBASE_URL).not.toContain('fittracker-c34e8');
  });

  it('DEV build missing the var warns loud (no throw) and leaves FIREBASE_URL empty', async () => {
    vi.stubEnv('VITE_FIREBASE_RTDB_URL', '');
    vi.stubEnv('PROD', false);
    vi.stubEnv('DEV', true);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mod = await import('../firebase.js');
    expect(mod.FIREBASE_URL).toBe('');
    expect(warn).toHaveBeenCalled();
    const warned = warn.mock.calls.some(args =>
      String(args[0]).includes('VITE_FIREBASE_RTDB_URL'));
    expect(warned).toBe(true);
  });

  it('PROD build missing the var throws at module load (fail fast, no silent prod hit)', async () => {
    // auth.js (imported by firebase.js) has its own B011 PROD throw when the API
    // key is the placeholder — stub a real key so the RTDB guard is the one that
    // fires, isolating THIS guard's behavior.
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-real-api-key');
    vi.stubEnv('VITE_FIREBASE_RTDB_URL', '');
    vi.stubEnv('PROD', true);
    await expect(import('../firebase.js')).rejects.toThrow(/VITE_FIREBASE_RTDB_URL/);
  });
});
