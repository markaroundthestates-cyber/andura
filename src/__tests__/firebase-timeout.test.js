// ══ §25-H2 audit fix — Firebase REST fetch AbortController 15s timeout ══════
//
// Asigura ca fetch wrapper-ele Firebase (fbGet/fbSet/fbRemove via syncTo/From
// + clearFirebaseKeys) atasaza AbortSignal cu timeout. Anterior fetch fara
// signal → mobile / spotty wifi → indefinite hang, UI lock pe sync 3s debounce.
//
// Per Firebase REST architecture (ADR 002), wrapper-ele sunt singura suprafata
// de exit network → un singur helper _fbFetch acopera toate write/read paths.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncToFirebase, syncFromFirebase, clearFirebaseKeys, FIREBASE_FETCH_TIMEOUT_MS } from '../firebase.js';
import { AUTH_STORAGE_KEYS } from '../auth.js';

function _seedAuth() {
  localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-timeout-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'tok-timeout-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 3_600_000));
}

function _resetAuth() {
  Object.values(AUTH_STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}

describe('firebase — §25-H2 AbortController fetch timeout', () => {
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

  it('exposes FIREBASE_FETCH_TIMEOUT_MS = 15s (reasonable mobile window)', () => {
    expect(FIREBASE_FETCH_TIMEOUT_MS).toBe(15_000);
  });

  it('syncToFirebase fetch carries an AbortSignal', async () => {
    fetchMock.mockResolvedValue(new Response('null', { status: 200 }));
    await syncToFirebase();
    expect(fetchMock).toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('syncFromFirebase fetch carries an AbortSignal', async () => {
    fetchMock.mockResolvedValue(new Response('null', { status: 200 }));
    await syncFromFirebase();
    expect(fetchMock).toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('clearFirebaseKeys DELETE fetch carries an AbortSignal', async () => {
    fetchMock.mockResolvedValue(new Response('null', { status: 200 }));
    await clearFirebaseKeys(['weights']);
    expect(fetchMock).toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(init?.method).toBe('DELETE');
  });

  it('aborted fetch (timeout) → syncToFirebase resolves false (graceful, NU throw)', async () => {
    // Simulate AbortError raised post timeout — wrapper catch must swallow.
    fetchMock.mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    const ok = await syncToFirebase();
    expect(ok).toBe(false);
  });

  it('aborted fetch (timeout) → syncFromFirebase resolves false (graceful, NU throw)', async () => {
    fetchMock.mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    const ok = await syncFromFirebase();
    expect(ok).toBe(false);
  });
});
