// D047 RIP-OUT — LogoutConfirm drill-down tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LogoutConfirm } from '../../../routes/screens/cont/LogoutConfirm';
import { useAppStore } from '../../../stores/appStore';

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
  localStorage.clear();
  useAppStore.setState({ isSkipAuth: false, isAuthenticated: false });
});

describe('LogoutConfirm — D047 drill-down', () => {
  it('renders heading "Iesi din cont"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Iesi din cont/i, level: 1 })).toBeInTheDocument();
  });

  it('renders confirm question + reassurance body', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Iesi din cont\?/i })).toBeInTheDocument();
    expect(screen.getByText(/Datele tale raman salvate pe email/i)).toBeInTheDocument();
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
