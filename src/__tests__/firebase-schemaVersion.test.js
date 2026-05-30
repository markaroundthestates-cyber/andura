// ══ §25-M2 audit fix — user-doc _schemaVersion forward-compat ══════════════
//
// Verifies syncToFirebase stamps _schemaVersion on the user-doc whole-tree
// PUT, and syncFromFirebase tolerates an absent _schemaVersion (legacy docs
// predating the field → treated as v1, merge proceeds, no throw).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncToFirebase, syncFromFirebase, USER_DOC_SCHEMA_VERSION } from '../firebase.js';
import { AUTH_STORAGE_KEYS } from '../auth.js';

function _seedAuth() {
  localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-schema-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'tok-schema-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 3_600_000));
}

function _resetAuth() {
  Object.values(AUTH_STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}

describe('firebase — §25-M2 user-doc schema version', () => {
  /** @type {ReturnType<typeof vi.fn>} */
  let fetchMock;

  beforeEach(() => {
    _resetAuth();
    _seedAuth();
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    _resetAuth();
  });

  it('exports USER_DOC_SCHEMA_VERSION = 1', () => {
    expect(USER_DOC_SCHEMA_VERSION).toBe(1);
  });

  it('syncToFirebase PUT body carries _schemaVersion', async () => {
    fetchMock.mockResolvedValue(new Response('null', { status: 200 }));
    await syncToFirebase();
    expect(fetchMock).toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    // FCM-sync audit fix — PATCH (not PUT) so the sync does not clobber sibling
    // nodes (fcmTokens / notificationPrefs). Payload still stamps _schemaVersion.
    expect(init?.method).toBe('PATCH');
    const payload = JSON.parse(init.body);
    expect(payload._schemaVersion).toBe(USER_DOC_SCHEMA_VERSION);
  });

  it('syncFromFirebase tolerates absent _schemaVersion (legacy doc → v1)', async () => {
    // Remote doc predates the field — must NOT throw, merge proceeds.
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ weights: { '2026-05-01': 80 } }), { status: 200 }));
    const ok = await syncFromFirebase();
    expect(ok).toBe(true);
  });

  it('syncFromFirebase accepts a doc with matching _schemaVersion', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ _schemaVersion: 1, weights: {} }), { status: 200 }));
    const ok = await syncFromFirebase();
    expect(ok).toBe(true);
  });

  // L-4 defensive parse — a corrupted/hostile remote scalar or array must NOT
  // reach the merge path (Object.keys / remote[k] on a string poisons local
  // state). Guard rejects non-plain-object payloads and bails cleanly.
  it('syncFromFirebase rejects a malformed scalar remote doc (string)', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify('not-an-object'), { status: 200 }));
    const ok = await syncFromFirebase();
    expect(ok).toBe(false);
  });

  it('syncFromFirebase rejects a malformed array remote doc', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify([1, 2, 3]), { status: 200 }));
    const ok = await syncFromFirebase();
    expect(ok).toBe(false);
  });
});
