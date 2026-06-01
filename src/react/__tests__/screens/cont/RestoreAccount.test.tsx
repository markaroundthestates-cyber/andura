// §56.5.2 soft-delete — RestoreAccount choice screen. Restore clears the marker
// + hydrates + resumes; Delete-now hard-purges cloud + local + signs out. When
// the 30-day window has elapsed (expired) only Delete-now is offered.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { RestoreAccount } from '../../../routes/screens/cont/RestoreAccount';
import { useAppStore } from '../../../stores/appStore';
import { clearDeletionMarker, hardDeleteCloudUser } from '../../../lib/accountDeletion';
import { hydrateStoresFromCloud } from '../../../lib/storeSync';
import { initFirebaseSync } from '../../../../firebase.js';
import { signOut as authSignOut } from '../../../../auth.js';
import { wipeUserDB } from '../../../../storage/db.js';

import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../../i18n/index.js';

const AUTH_KEYS = { uid: 'firebase-uid', idToken: 'firebase-id-token' } as const;

vi.mock('../../../lib/accountDeletion', () => ({
  clearDeletionMarker: vi.fn(async () => true),
  hardDeleteCloudUser: vi.fn(async () => true),
}));
vi.mock('../../../lib/storeSync', () => ({
  hydrateStoresFromCloud: vi.fn(async () => {}),
}));
vi.mock('../../../../firebase.js', () => ({
  initFirebaseSync: vi.fn(async () => {}),
}));
vi.mock('../../../../auth.js', () => ({
  signOut: vi.fn(() => {
    localStorage.removeItem(AUTH_KEYS.idToken);
    localStorage.removeItem(AUTH_KEYS.uid);
  }),
  getAuthState: vi.fn(() => {
    const uid = localStorage.getItem(AUTH_KEYS.uid);
    const idToken = localStorage.getItem(AUTH_KEYS.idToken);
    if (!uid || !idToken) return null;
    return { uid, idToken, expiry: Date.now() + 3_600_000 };
  }),
}));
vi.mock('../../../../storage/db.js', () => ({
  wipeUserDB: vi.fn(async () => {}),
}));

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/restore-account']}>
      <Routes>
        <Route path="/app/cont/restore-account" element={<RestoreAccount />} />
        <Route path="/app/antrenor" element={<LocationProbe />} />
        <Route path="/auth" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear(); __resetI18n(); __setLocale('ro');
  vi.clearAllMocks();
  vi.mocked(clearDeletionMarker).mockResolvedValue(true);
  vi.mocked(hardDeleteCloudUser).mockResolvedValue(true);
  vi.mocked(initFirebaseSync).mockResolvedValue(undefined);
  vi.mocked(hydrateStoresFromCloud).mockResolvedValue(undefined);
  vi.mocked(wipeUserDB).mockResolvedValue({ deleted: true, dbName: 'andura_user_test' });
  delete (window as { _suppressFirebaseSync?: boolean })._suppressFirebaseSync;
  useAppStore.setState({ pendingDeletionRestore: { requestedAt: Date.now(), expired: false } });
});

describe('RestoreAccount — soft-delete grace choice', () => {
  it('shows both Restore + Delete-now within the 30-day window', () => {
    renderScreen();
    expect(screen.getByTestId('restore-account-restore')).toBeInTheDocument();
    expect(screen.getByTestId('restore-account-delete-now')).toBeInTheDocument();
    expect(screen.getByText(/Datele tale sunt inca aici/i)).toBeInTheDocument();
  });

  it('hides Restore when the 30-day window has expired', () => {
    useAppStore.setState({ pendingDeletionRestore: { requestedAt: 1, expired: true } });
    renderScreen();
    expect(screen.queryByTestId('restore-account-restore')).toBeNull();
    expect(screen.getByTestId('restore-account-delete-now')).toBeInTheDocument();
    expect(screen.getByText(/Perioada de 30 de zile/i)).toBeInTheDocument();
  });

  it('Restore clears the marker, hydrates, clears the flag + navigates to app', async () => {
    localStorage.setItem(AUTH_KEYS.uid, 'u1');
    localStorage.setItem(AUTH_KEYS.idToken, 'tok');
    renderScreen();
    fireEvent.click(screen.getByTestId('restore-account-restore'));
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
    });
    expect(clearDeletionMarker).toHaveBeenCalled();
    expect(initFirebaseSync).toHaveBeenCalled();
    expect(hydrateStoresFromCloud).toHaveBeenCalled();
    expect(useAppStore.getState().pendingDeletionRestore).toBeNull();
    // Session NOT cleared on restore.
    expect(localStorage.getItem(AUTH_KEYS.idToken)).toBe('tok');
    expect(authSignOut).not.toHaveBeenCalled();
  });

  it('Delete-now hard-purges cloud + local + signs out + navigates /auth', async () => {
    localStorage.setItem(AUTH_KEYS.uid, 'u1');
    localStorage.setItem(AUTH_KEYS.idToken, 'tok');
    localStorage.setItem('wv2-workout-store', 'data');
    renderScreen();
    fireEvent.click(screen.getByTestId('restore-account-delete-now'));
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
    });
    expect(hardDeleteCloudUser).toHaveBeenCalled();
    expect(wipeUserDB).toHaveBeenCalledWith('u1');
    expect(authSignOut).toHaveBeenCalled();
    expect(useAppStore.getState().pendingDeletionRestore).toBeNull();
    expect(localStorage.getItem('wv2-workout-store')).toBeNull();
    expect((window as { _suppressFirebaseSync?: boolean })._suppressFirebaseSync).toBe(true);
  });

  it('Delete-now issues the cloud DELETE while the session token is still valid', async () => {
    localStorage.setItem(AUTH_KEYS.uid, 'u1');
    localStorage.setItem(AUTH_KEYS.idToken, 'tok');
    let tokenAtDelete: string | null = null;
    vi.mocked(hardDeleteCloudUser).mockImplementation(async () => {
      tokenAtDelete = localStorage.getItem(AUTH_KEYS.idToken);
      return true;
    });
    renderScreen();
    fireEvent.click(screen.getByTestId('restore-account-delete-now'));
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
    });
    expect(tokenAtDelete).toBe('tok');
    expect(localStorage.getItem(AUTH_KEYS.idToken)).toBeNull();
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
