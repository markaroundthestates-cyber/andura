// D047 RIP-OUT — DeleteAccountConfirm drill-down tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DeleteAccountConfirm } from '../../../routes/screens/cont/DeleteAccountConfirm';

const isFreshSpy = vi.fn(() => true);

vi.mock('../../../../auth.js', () => ({
  isAuthFresh: () => isFreshSpy(),
  signOut: vi.fn(() => {
    localStorage.removeItem('firebase-id-token');
    localStorage.removeItem('firebase-uid');
  }),
  getAuthState: vi.fn(() => ({ uid: 'test-uid-123' })),
  getIdToken: vi.fn(async () => 'test-id-token'),
}));

// §B039 wipeUserDB — defer import noop pentru jsdom test env.
vi.mock('../../../../storage/db.js', () => ({
  wipeUserDB: vi.fn(async () => {}),
}));

// jsdom fetch may be undefined — stub for Tier 2 RTDB DELETE call path.
globalThis.fetch = vi.fn(async () => new Response(null, { status: 200 }));

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

  it('confirm cu auth fresh wipes Tier 0 wv2-* + navigates /auth', () => {
    localStorage.setItem('wv2-workout-store', 'data');
    localStorage.setItem('wv2-onboarding-store', 'data');
    renderScreen();
    fireEvent.click(screen.getByTestId('delete-confirm-accept'));
    expect(localStorage.getItem('wv2-workout-store')).toBeNull();
    expect(localStorage.getItem('wv2-onboarding-store')).toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
  });

  it('S-01 — confirm wipes unprefixed legacy keys (GDPR Art. 17, zero PII residue)', () => {
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
    // All user-data keys (legacy + wv2 store snapshots) erased.
    legacyKeys.forEach((k) => expect(localStorage.getItem(k)).toBeNull());
    expect(localStorage.getItem('wv2-settings-store')).toBeNull();
    expect(localStorage.getItem('wv2-workout-store')).toBeNull();
    // Only allowed residual = wv2-app-store, re-persisted by the logged-out
    // auth transition (setAuthenticated(false)). It holds NO PII — partialize
    // persists only { isSkipAuth: boolean } (see appStore.ts:54).
    const residual = Object.keys(localStorage).filter((k) => k !== 'wv2-app-store');
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
