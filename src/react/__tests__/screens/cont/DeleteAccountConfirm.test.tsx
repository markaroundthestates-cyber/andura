// D047 RIP-OUT — DeleteAccountConfirm drill-down tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DeleteAccountConfirm } from '../../../routes/screens/cont/DeleteAccountConfirm';
import { wipeUserDB } from '../../../../storage/db.js';

const isFreshSpy = vi.fn(() => true);

// RE-S-01 regression: the auth mocks are backed by REAL localStorage so the
// sync-vs-async token-clear ordering is genuinely exercised. `getIdToken` reads
// the real token (returns null once signOut removed it) and `signOut` removes
// the real auth keys — so a test can prove the cloud DELETE fired BEFORE the
// tokens were cleared, instead of the prior orb-always-success mock that hid
// the bug (getIdToken hardcoded to 'test-id-token', signOut clearing 2 keys).
const AUTH_KEYS = {
  uid: 'firebase-uid',
  idToken: 'firebase-id-token',
  refreshToken: 'firebase-refresh-token',
  expiry: 'firebase-id-token-expiry',
} as const;

vi.mock('../../../../auth.js', () => ({
  isAuthFresh: () => isFreshSpy(),
  signOut: vi.fn(() => {
    localStorage.removeItem(AUTH_KEYS.idToken);
    localStorage.removeItem(AUTH_KEYS.uid);
    localStorage.removeItem(AUTH_KEYS.refreshToken);
    localStorage.removeItem(AUTH_KEYS.expiry);
  }),
  getAuthState: vi.fn(() => {
    const uid = localStorage.getItem(AUTH_KEYS.uid);
    const idToken = localStorage.getItem(AUTH_KEYS.idToken);
    if (!uid || !idToken) return null;
    return { uid, idToken, expiry: Number(localStorage.getItem(AUTH_KEYS.expiry)) || 0 };
  }),
  getIdToken: vi.fn(async () => localStorage.getItem(AUTH_KEYS.idToken)),
}));

// §B039 wipeUserDB — defer import noop pentru jsdom test env. RE-S-01 uses it
// as an ordering probe: it runs INSIDE the awaited wipeRemoteData (before the
// Tier 2 RTDB DELETE), so capturing the token state at its call time proves the
// remote wipe runs while the session is still valid — i.e. BEFORE signOut.
vi.mock('../../../../storage/db.js', () => ({
  wipeUserDB: vi.fn(async () => {}),
}));

// jsdom fetch may be undefined — stub for Tier 2 RTDB DELETE call path.
const fetchSpy = vi.fn(async () => new Response(null, { status: 200 }));
globalThis.fetch = fetchSpy as unknown as typeof fetch;

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/delete-account-confirm']}>
      <Routes>
        <Route path="/app/cont/delete-account-confirm" element={<DeleteAccountConfirm />} />
        <Route path="/app/cont/settings-danger" element={<LocationProbe />} />
        <Route path="/auth" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  isFreshSpy.mockReturnValue(true);
  fetchSpy.mockClear();
  fetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
  // Reset the wipeUserDB ordering-probe back to a plain async noop between
  // tests (RE-S-01 tests install per-case implementations).
  vi.mocked(wipeUserDB).mockReset();
  vi.mocked(wipeUserDB).mockResolvedValue({ deleted: true, dbName: 'andura_user_test' });
});

describe('DeleteAccountConfirm — D047 drill-down', () => {
  it('renders heading "Sterge contul"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Sterge contul/i, level: 1 })).toBeInTheDocument();
  });

  it('renders Atentie + ireversible warning + max-data-loss copy', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Atentie/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/Toate datele tale.+vor fi sterse imediat/i)).toBeInTheDocument();
    expect(screen.getByText(/nu poate fi anulata/i)).toBeInTheDocument();
  });

  it('confirm cu auth fresh wipes Tier 0 wv2-* + navigates /auth', async () => {
    localStorage.setItem('wv2-workout-store', 'data');
    localStorage.setItem('wv2-onboarding-store', 'data');
    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-accept'));
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
    });
    expect(localStorage.getItem('wv2-workout-store')).toBeNull();
    expect(localStorage.getItem('wv2-onboarding-store')).toBeNull();
  });

  it('S-01 — confirm wipes unprefixed legacy keys (GDPR Art. 17, zero PII residue)', async () => {
    // Legacy keys written by src/db.js + engine wrappers, NOT wv2-* prefixed.
    // Prior wv2-only loop left these on device after "delete account".
    const legacyKeys = [
      'logs', 'weights', 'coach-decisions', 'pr-records', 'pain-cdl',
      'cdl-patterns', 'applied-patterns', 'readiness', 'device-id',
      'onboarding-done', 'tombstones', 'session-burns', 'step-streaks',
    ];
    legacyKeys.forEach((k) => localStorage.setItem(k, 'legacy-value'));
    localStorage.setItem('wv2-settings-store', 'data');
    localStorage.setItem('wv2-workout-store', 'data');
    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-accept'));
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
    });
    // All user-data keys (legacy + wv2 store snapshots) erased.
    legacyKeys.forEach((k) => expect(localStorage.getItem(k)).toBeNull());
    expect(localStorage.getItem('wv2-settings-store')).toBeNull();
    expect(localStorage.getItem('wv2-workout-store')).toBeNull();
    // Only allowed residual = wv2-app-store, re-persisted by the logged-out
    // auth transition (setAuthenticated(false)). It holds NO PII — partialize
    // persists only { isSkipAuth: boolean } (see appStore.ts:54).
    // (__suppressFirebaseSyncUntil RE-S-02 guard set post-clear is also allowed.)
    const residual = Object.keys(localStorage).filter(
      (k) => k !== 'wv2-app-store' && k !== '__suppressFirebaseSyncUntil'
    );
    expect(residual).toEqual([]);
  });

  it('A016 — confirm cu auth NU fresh forces re-auth redirect', () => {
    isFreshSpy.mockReturnValue(false);
    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-accept'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
  });

  it('cancel navigates back settings-danger', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-cancel'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/settings-danger');
  });

  it('back arrow navigates settings-danger', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/settings-danger');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});

// ── RE-S-01 (CRIT, GDPR Art. 17 + S-07 resurrection) regression ──────────────
// The remote wipe (Tier 1 IDB wipe + Tier 2 RTDB DELETE) MUST run while the
// session is still valid — i.e. BEFORE sign-out clears the tokens. Pre-fix,
// `void wipeRemoteData(...)` yielded at its first await and authSignOut() ran
// synchronously first, so by the time the RTDB DELETE reached getIdToken() the
// token was already null → the cloud DELETE never issued (GDPR Art. 17 residue
// + S-07 resurrection-on-login). These tests use the REAL signOut +
// getAuthState (localStorage-backed mock above) and the wipeUserDB mock as an
// ordering probe (it runs inside the awaited wipeRemoteData, ahead of the RTDB
// DELETE) so the sync-vs-async ordering is genuinely exercised — unlike the
// prior orb mock (getIdToken hardcoded) that made the bug invisible.
//
// NOTE: the Tier 2 RTDB fetch itself cannot be asserted under vitest — the
// component reads `import.meta.env.VITE_FIREBASE_RTDB_URL` inline and that is
// statically isolated per-module (neither vi.stubEnv nor a direct write reaches
// the component's module — verified), so `if (!rtdbUrl) return` short-circuits
// before the fetch. Live-reachability of the DELETE is established out-of-band:
// deploy.yml injects VITE_FIREBASE_RTDB_URL in prod (REAUDIT-3 §RE-S-01 L47).
describe('DeleteAccountConfirm — RE-S-01 remote wipe ordering', () => {
  function seedAuth() {
    localStorage.setItem(AUTH_KEYS.uid, 'uid-cloud-99');
    localStorage.setItem(AUTH_KEYS.idToken, 'valid-id-token');
    localStorage.setItem(AUTH_KEYS.refreshToken, 'rt');
    localStorage.setItem(AUTH_KEYS.expiry, String(Date.now() + 3_600_000));
  }

  it('runs the remote wipe while the session token is still valid (before signOut)', async () => {
    seedAuth();
    // wipeUserDB runs inside the awaited wipeRemoteData, before authSignOut().
    // Capture the live auth state at that moment — pre-fix it was already null.
    let uidAtWipe: string | null = null;
    let tokenAtWipe: string | null = null;
    vi.mocked(wipeUserDB).mockImplementation(async (uid: string) => {
      uidAtWipe = localStorage.getItem(AUTH_KEYS.uid);
      tokenAtWipe = localStorage.getItem(AUTH_KEYS.idToken);
      return { deleted: true, dbName: `andura_user_${uid}` };
    });

    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-accept'));

    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
    });

    // CRIT — the remote wipe ran with a live session (token+uid present). This
    // is exactly what feeds getIdToken() for the RTDB DELETE; pre-fix both were
    // null here because authSignOut() had already executed.
    expect(wipeUserDB).toHaveBeenCalledWith('uid-cloud-99');
    expect(uidAtWipe).toBe('uid-cloud-99');
    expect(tokenAtWipe).toBe('valid-id-token');
    // Only AFTER the remote wipe completes are the tokens cleared.
    expect(localStorage.getItem(AUTH_KEYS.idToken)).toBeNull();
    expect(localStorage.getItem(AUTH_KEYS.uid)).toBeNull();
  });

  it('awaits the remote wipe to completion before sign-out (no concurrent clear)', async () => {
    seedAuth();
    // Hold the remote wipe pending; assert tokens are STILL present while it is
    // in flight — proving authSignOut() does not race ahead of it.
    const wipeGate: { resolve: (() => void) | null } = { resolve: null };
    vi.mocked(wipeUserDB).mockImplementation(
      () =>
        new Promise<{ deleted: boolean; dbName: string }>((resolve) => {
          wipeGate.resolve = () => resolve({ deleted: true, dbName: 'andura_user_test' });
        })
    );

    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-accept'));

    // Wait until the remote wipe is actually in flight (dynamic import resolved
    // + wipeUserDB invoked), then assert sign-out has NOT run yet.
    await waitFor(() => { expect(wipeGate.resolve).not.toBeNull(); });
    expect(localStorage.getItem(AUTH_KEYS.idToken)).toBe('valid-id-token');
    expect(screen.queryByTestId('probe')).toBeNull(); // still on delete screen

    // Resolve the wipe → flow proceeds to signOut + navigate.
    wipeGate.resolve?.();
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
    });
    expect(localStorage.getItem(AUTH_KEYS.idToken)).toBeNull();
  });

  it('does not trap the user if the remote wipe hangs (timeout fallback navigates)', async () => {
    seedAuth();
    vi.useFakeTimers();
    // Remote wipe never resolves — simulate a hung network.
    vi.mocked(wipeUserDB).mockImplementation(
      () => new Promise<{ deleted: boolean; dbName: string }>(() => {})
    );

    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-accept'));

    // Advance past the REMOTE_WIPE_TIMEOUT_MS (8s) fallback.
    await vi.advanceTimersByTimeAsync(8001);
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
    });
    // Local erasure + sign-out still completed despite the hung wipe.
    expect(localStorage.getItem(AUTH_KEYS.idToken)).toBeNull();
  });
});
