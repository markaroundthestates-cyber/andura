// ══ RTDB key sanitizer — `sf.userConfig` dot fix (reset DELETE 400) ══════════
//
// EVIDENCE (live console on Reset): `DELETE .../users/{uid}/sf.userConfig.json
// 400 (Bad Request)`. Firebase RTDB forbids `. $ # [ ] /` in node keys, so the
// localStorage key `sf.userConfig` (carries a dot) 400'd on EVERY remote op —
// the visible reset DELETE plus every silent PATCH write, meaning its
// bio/targetKg/equipment config NEVER reached the cloud.
//
// FIX: fbKey(localKey) maps the dotted key → a valid remote node name
// (`sf_userConfig`) CONSISTENTLY at push (PATCH body key), pull (GET read key),
// and delete (DELETE path). The localStorage key stays `sf.userConfig`. This
// suite pins: (1) fbKey sanitizes forbidden chars, (2) push uses it, (3) delete
// uses it, (4) pull round-trips a remote `sf_userConfig` back to local state.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fbKey, syncToFirebase, syncFromFirebase, clearFirebaseKeys } from '../firebase.js';
import { DB } from '../db.js';
import { AUTH_STORAGE_KEYS } from '../auth.js';

function _seedAuth() {
  localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-fbkey-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'tok-fbkey-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 3_600_000));
}

function _resetAuth() {
  Object.values(AUTH_STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}

describe('firebase — fbKey RTDB key sanitizer (sf.userConfig dot fix)', () => {
  /** @type {ReturnType<typeof vi.fn>} */
  let fetchMock;

  beforeEach(() => {
    localStorage.clear();
    _seedAuth();
    fetchMock = vi.fn().mockResolvedValue(new Response('null', { status: 200 }));
    globalThis.fetch = fetchMock;
    delete window._suppressFirebaseSync;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    _resetAuth();
    delete window._suppressFirebaseSync;
  });

  it('replaces every forbidden RTDB char (. $ # [ ] /) with _', () => {
    expect(fbKey('sf.userConfig')).toBe('sf_userConfig');
    expect(fbKey('a.b$c#d[e]f/g')).toBe('a_b_c_d_e_f_g');
  });

  it('leaves a clean kebab-case key unchanged', () => {
    expect(fbKey('pr-records')).toBe('pr-records');
    expect(fbKey('phase-change-date')).toBe('phase-change-date');
  });

  it('push (PATCH body) uses the sanitized node name, never the dotted key', async () => {
    DB.set('sf.userConfig', { bio: { targetKg: 99 } });
    await syncToFirebase();
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    const payload = JSON.parse(init.body);
    expect(payload).toHaveProperty('sf_userConfig');
    expect(payload).not.toHaveProperty('sf.userConfig');
    expect(payload.sf_userConfig).toEqual({ bio: { targetKg: 99 } });
  });

  it('delete (DELETE path) targets the sanitized node — no dotted-path 400', async () => {
    await clearFirebaseKeys(['sf.userConfig']);
    const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    expect(init?.method).toBe('DELETE');
    expect(String(url)).toContain('/sf_userConfig.json');
    expect(String(url)).not.toContain('/sf.userConfig.json');
  });

  it('delete preserves `/` separators in wv2 child paths (segment-wise sanitize)', async () => {
    await clearFirebaseKeys(['wv2/workout']);
    const [url] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    expect(String(url)).toContain('/wv2/workout.json');
  });

  it('pull round-trips a remote `sf_userConfig` back into the `sf.userConfig` local key', async () => {
    const remoteDoc = { sf_userConfig: { bio: { targetKg: 88 } }, _ts: Date.now() };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(remoteDoc), { status: 200 }));
    await syncFromFirebase();
    expect(DB.get('sf.userConfig')).toEqual({ bio: { targetKg: 88 } });
  });
});
