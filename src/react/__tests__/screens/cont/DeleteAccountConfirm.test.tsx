// D047 RIP-OUT — DeleteAccountConfirm drill-down tests.
// §56.5.2 soft-delete (30-day grace) — the confirm screen now writes a cloud
// deletion MARKER + wipes LOCAL (Tier 0 + Tier 1) + signs out. The cloud node
// is RETAINED for the 30-day restore window (the immediate full purge moved to
// RestoreAccount's "Delete now"). These specs assert: local wipe, marker write
// fired with a still-valid token (before sign-out), sync suppression, copy.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DeleteAccountConfirm } from '../../../routes/screens/cont/DeleteAccountConfirm';
import { wipeUserDB } from '../../../../storage/db.js';
import { markAccountForDeletion } from '../../../lib/accountDeletion';
import { useAerobicStore } from '../../../stores/aerobicStore';
import { useCoachStore } from '../../../stores/coachStore';
import { useProgresStore } from '../../../stores/progresStore';

// Wave E4 i18n locale pin — these specs were written against RO copy;
// force RO locale so existing assertions keep their semantics. EN coverage
// is verified separately by src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { beforeEach as __i18nBeforeEach } from 'vitest';
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../../i18n/index.js';
__i18nBeforeEach(() => { try { localStorage.removeItem('sf.locale'); } catch {} __resetI18n(); __setLocale('ro'); });


const isFreshSpy = vi.fn(() => true);

// The auth mocks are backed by REAL localStorage so the sync-vs-async
// token-clear ordering is genuinely exercised. `signOut` removes the real auth
// keys, `getAuthState` reads them — so a test can prove the marker write fired
// BEFORE the tokens were cleared.
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

// §56.5.2 — the marker write is the cloud-side op now (was the RTDB DELETE).
// Mock it as an ordering probe: it runs inside the awaited block before sign-out.
vi.mock('../../../lib/accountDeletion', () => ({
  markAccountForDeletion: vi.fn(async () => true),
}));

// wipeUserDB — Tier 1 IDB wipe (LOCAL device data). Still wiped on soft-delete.
// Doubles as an ordering probe: it runs inside the awaited block before signOut.
vi.mock('../../../../storage/db.js', () => ({
  wipeUserDB: vi.fn(async () => {}),
}));

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
  localStorage.clear(); __resetI18n(); __setLocale("ro");
  isFreshSpy.mockReturnValue(true);
  vi.mocked(markAccountForDeletion).mockReset();
  vi.mocked(markAccountForDeletion).mockResolvedValue(true);
  vi.mocked(wipeUserDB).mockReset();
  vi.mocked(wipeUserDB).mockResolvedValue({ deleted: true, dbName: 'andura_user_test' });
  // RE-S-02 — clear the cross-test Firebase-sync suppression window flag.
  delete (window as { _suppressFirebaseSync?: boolean })._suppressFirebaseSync;
});

describe('DeleteAccountConfirm — D047 drill-down', () => {
  it('renders heading "Sterge contul"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Sterge contul/i, level: 1 })).toBeInTheDocument();
  });

  it('renders Atentie + 30-day grace recoverable copy', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Atentie/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/sterse imediat si esti deconectat/i)).toBeInTheDocument();
    expect(screen.getByText(/30 de zile/i)).toBeInTheDocument();
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

  it('S-01 — confirm wipes unprefixed legacy keys (zero PII residue on device)', async () => {
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
    legacyKeys.forEach((k) => expect(localStorage.getItem(k)).toBeNull());
    expect(localStorage.getItem('wv2-settings-store')).toBeNull();
    expect(localStorage.getItem('wv2-workout-store')).toBeNull();
    const residual = Object.keys(localStorage).filter(
      (k) => k !== 'wv2-app-store' && k !== '__suppressFirebaseSyncUntil'
    );
    expect(residual).toEqual([]);
  });

  it('XCUT-2 — confirm resets aerobicStore + coachStore in memory', async () => {
    useAerobicStore.setState({ sessions: [{ date: '2026-05-30', type: 'step', minutes: 35, kcal: 240, ts: 9 }], lastDuration: 35 });
    useCoachStore.setState({ reactivateDismissed: true, persona: 'marius' });
    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-accept'));
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
    });
    expect(useAerobicStore.getState().sessions).toEqual([]);
    expect(useCoachStore.getState().reactivateDismissed).toBe(false);
    expect(useCoachStore.getState().persona).toBe('gigica');
  });

  // GDPR (cycle-7) — the inline wipe used to OMIT useProgresStore, so deleted
  // weight/body history survived in memory and resurrected on a same-uid SPA
  // re-login (mergeArrayUnion → PATCH back). The wipe now routes through the
  // shared resetInMemoryStores() which includes progres.
  it('GDPR — confirm wipes useProgresStore (weightLog/bodyData/targetObiectiv) in memory', async () => {
    useProgresStore.setState({
      weightLog: [{ kg: 82, date: '2026-06-01', ts: 1 }],
      bodyData: [{ waist: 90, ts: 2 } as never],
      targetObiectiv: { weightKg: 78, month: '2026-09' },
    });
    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-accept'));
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
    });
    expect(useProgresStore.getState().weightLog).toEqual([]);
    expect(useProgresStore.getState().bodyData).toEqual([]);
    expect(useProgresStore.getState().targetObiectiv).toEqual({ weightKg: null, month: null });
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

// ── §56.5.2 soft-delete — marker write + ordering + cloud RETENTION ──────────
// The deletion MARKER write (markAccountForDeletion) + Tier 1 IDB wipe MUST run
// while the session is still valid — i.e. BEFORE sign-out clears the tokens.
// The cloud `users/{uid}` node is NOT deleted here (retained for restore).
describe('DeleteAccountConfirm — soft-delete marker write', () => {
  function seedAuth() {
    localStorage.setItem(AUTH_KEYS.uid, 'uid-cloud-99');
    localStorage.setItem(AUTH_KEYS.idToken, 'valid-id-token');
    localStorage.setItem(AUTH_KEYS.refreshToken, 'rt');
    localStorage.setItem(AUTH_KEYS.expiry, String(Date.now() + 3_600_000));
  }

  it('writes the deletion marker while the session token is still valid (before signOut)', async () => {
    seedAuth();
    let tokenAtMark: string | null = null;
    let uidAtMark: string | null = null;
    vi.mocked(markAccountForDeletion).mockImplementation(async () => {
      tokenAtMark = localStorage.getItem(AUTH_KEYS.idToken);
      uidAtMark = localStorage.getItem(AUTH_KEYS.uid);
      return true;
    });

    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-accept'));

    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
    });

    // CRIT — the marker write ran with a live session (token+uid present). This
    // is exactly what feeds getIdToken() inside fbPatchUserChild for the PATCH.
    expect(markAccountForDeletion).toHaveBeenCalled();
    expect(tokenAtMark).toBe('valid-id-token');
    expect(uidAtMark).toBe('uid-cloud-99');
    // Tier 1 IDB (local device data) also wiped with the live uid.
    expect(wipeUserDB).toHaveBeenCalledWith('uid-cloud-99');
    // Only AFTER the cloud op completes are the tokens cleared.
    expect(localStorage.getItem(AUTH_KEYS.idToken)).toBeNull();
    expect(localStorage.getItem(AUTH_KEYS.uid)).toBeNull();
  });

  it('awaits the marker write to completion before sign-out (no concurrent clear)', async () => {
    seedAuth();
    const markGate: { resolve: (() => void) | null } = { resolve: null };
    vi.mocked(markAccountForDeletion).mockImplementation(
      () => new Promise<boolean>((resolve) => { markGate.resolve = () => resolve(true); })
    );

    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-accept'));

    await waitFor(() => { expect(markGate.resolve).not.toBeNull(); });
    expect(localStorage.getItem(AUTH_KEYS.idToken)).toBe('valid-id-token');
    expect(screen.queryByTestId('probe')).toBeNull(); // still on delete screen

    markGate.resolve?.();
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
    });
    expect(localStorage.getItem(AUTH_KEYS.idToken)).toBeNull();
  });

  it('does not trap the user if the marker write hangs (timeout fallback navigates)', async () => {
    seedAuth();
    vi.useFakeTimers();
    vi.mocked(markAccountForDeletion).mockImplementation(
      () => new Promise<boolean>(() => {})
    );

    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-accept'));

    // Advance past the REMOTE_MARK_TIMEOUT_MS (8s) fallback.
    await vi.advanceTimersByTimeAsync(8001);
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
    });
    expect(localStorage.getItem(AUTH_KEYS.idToken)).toBeNull();
  });
});

// ── RE-S-02 (MED) — delete path sets the Firebase sync-suppression guards ─────
describe('DeleteAccountConfirm — RE-S-02 sync suppression', () => {
  function seedAuth() {
    localStorage.setItem('firebase-uid', 'uid-supp-7');
    localStorage.setItem('firebase-id-token', 'tok');
    localStorage.setItem('firebase-id-token-expiry', String(Date.now() + 3_600_000));
  }

  it('sets _suppressFirebaseSync + __suppressFirebaseSyncUntil (future) on confirm', async () => {
    seedAuth();
    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-accept'));

    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
    });

    expect((window as { _suppressFirebaseSync?: boolean })._suppressFirebaseSync).toBe(true);
    const until = Number(localStorage.getItem('__suppressFirebaseSyncUntil'));
    expect(until).toBeGreaterThan(Date.now());
  });
});
