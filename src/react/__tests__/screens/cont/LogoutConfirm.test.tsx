// D047 RIP-OUT — LogoutConfirm drill-down tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LogoutConfirm } from '../../../routes/screens/cont/LogoutConfirm';
import { useAppStore } from '../../../stores/appStore';
import { useAerobicStore } from '../../../stores/aerobicStore';
import { useCoachStore } from '../../../stores/coachStore';

// Wave E4 i18n locale pin — these specs were written against RO copy;
// force RO locale so existing assertions keep their semantics. EN coverage
// is verified separately by src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { beforeEach as __i18nBeforeEach } from 'vitest';
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../../i18n/index.js';
__i18nBeforeEach(() => { try { localStorage.removeItem('sf.locale'); } catch {} __resetI18n(); __setLocale('ro'); });


vi.mock('../../../../auth.js', () => ({
  signOut: vi.fn(() => {
    localStorage.removeItem('firebase-id-token');
    localStorage.removeItem('firebase-uid');
    localStorage.removeItem('firebase-refresh-token');
  }),
}));

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/logout-confirm']}>
      <Routes>
        <Route path="/app/cont/logout-confirm" element={<LogoutConfirm />} />
        <Route path="/app/cont/settings-danger" element={<LocationProbe />} />
        <Route path="/auth" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear(); __resetI18n(); __setLocale("ro");
  useAppStore.setState({ isSkipAuth: false, isAuthenticated: false });
});

describe('LogoutConfirm — D047 drill-down', () => {
  it('renders heading "Iesi din cont"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Iesi din cont/i, level: 1 })).toBeInTheDocument();
  });

  it('renders confirm question + honest cloud-vs-local body', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Iesi din cont\?/i })).toBeInTheDocument();
    // Cloud-safe reassurance: account + logged workouts + PRs come back.
    expect(screen.getByText(/antrenamentele logate.*raman/i)).toBeInTheDocument();
    // Honest local-wipe disclosure: visible history + weight chart + streak
    // clear on this device (shared-device privacy, NOT recoverable on re-login).
    expect(screen.getByText(/istoricul.*se sterg de pe acest/i)).toBeInTheDocument();
  });

  it('confirm clears firebase tokens + navigates /auth (signOut path A007 preserved)', () => {
    localStorage.setItem('firebase-id-token', 'test-token');
    localStorage.setItem('firebase-uid', 'test-uid');
    renderScreen();
    fireEvent.click(screen.getByTestId('logout-confirm-accept'));
    expect(localStorage.getItem('firebase-id-token')).toBeNull();
    expect(localStorage.getItem('firebase-uid')).toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
  });

  it('H1 — confirm wipes local user data (not just tokens) so next user starts clean', () => {
    // Seed user A's local data + the data-owner marker.
    localStorage.setItem('logs', JSON.stringify([{ ts: 1, ex: 'Squat', w: 100 }]));
    localStorage.setItem('weights', JSON.stringify({ '2026-05-01': 80 }));
    localStorage.setItem('wv2-workout-store', 'a-state');
    localStorage.setItem('data-owner-uid', 'uid-A');
    renderScreen();
    fireEvent.click(screen.getByTestId('logout-confirm-accept'));
    // Shared-device leak vector closed: A's data gone after logout.
    expect(localStorage.getItem('logs')).toBeNull();
    expect(localStorage.getItem('weights')).toBeNull();
    expect(localStorage.getItem('wv2-workout-store')).toBeNull();
    expect(localStorage.getItem('data-owner-uid')).toBeNull();
  });

  it('XCUT-2 confirm resets aerobicStore + coachStore in memory (shared-device leak)', () => {
    useAerobicStore.setState({ sessions: [{ date: '2026-05-30', type: 'zumba', minutes: 40, kcal: 260, ts: 7 }], lastDuration: 40 });
    useCoachStore.setState({ reactivateDismissed: true, persona: 'marius' });
    renderScreen();
    fireEvent.click(screen.getByTestId('logout-confirm-accept'));
    expect(useAerobicStore.getState().sessions).toEqual([]);
    expect(useCoachStore.getState().reactivateDismissed).toBe(false);
    expect(useCoachStore.getState().persona).toBe('gigica');
  });

  it('U-14 confirm resets isSkipAuth so skip-auth user truly exits', () => {
    useAppStore.setState({ isSkipAuth: true, isAuthenticated: false });
    renderScreen();
    fireEvent.click(screen.getByTestId('logout-confirm-accept'));
    expect(useAppStore.getState().isSkipAuth).toBe(false);
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
  });

  it('cancel navigates back settings-danger', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('logout-confirm-cancel'));
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
