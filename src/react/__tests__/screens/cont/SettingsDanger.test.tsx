// Phase 6 task_17 — SettingsDanger sub-screen tests.
// §D047 RIP-OUT Stage 2 — ConfirmModal deleted; SettingsDanger acum =
// navigation list to drill-down screens. Detailed action logic tested
// in dedicated LogoutConfirm + DeleteAccountConfirm + ResetDataConfirm tests
// (deferred Stage 3 next session per D047 phased migration).

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsDanger } from '../../../routes/screens/cont/SettingsDanger';
import { useAppStore } from '../../../stores/appStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-danger']}>
      <Routes>
        <Route path="/app/cont/settings-danger" element={<SettingsDanger />} />
        <Route path="/app/cont" element={<LocationProbe />} />
        <Route path="/app/cont/logout-confirm" element={<LocationProbe />} />
        <Route path="/app/cont/delete-account-confirm" element={<LocationProbe />} />
        <Route path="/app/cont/reset-data-confirm" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useAppStore.getState().setAuthenticated(true);
  useOnboardingStore.setState({
    data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 80 },
    completed: true,
    completedAt: Date.now(),
  });
  localStorage.clear();
});

describe('SettingsDanger — D047 RIP-OUT navigation list', () => {
  it('renders heading "Deconectare si stergere"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Deconectare/i, level: 1 })).toBeInTheDocument();
  });

  it('renders 3 actions (logout/reset/delete)', () => {
    renderScreen();
    expect(screen.getByTestId('danger-logout')).toBeInTheDocument();
    expect(screen.getByTestId('danger-reset')).toBeInTheDocument();
    expect(screen.getByTestId('danger-delete')).toBeInTheDocument();
  });

  it('§F-pass2-settings-danger-01 cream warning banner present cu alert-triangle + safety copy', () => {
    renderScreen();
    const banner = screen.getByTestId('danger-warning-banner');
    expect(banner).toBeInTheDocument();
    expect(banner.textContent).toMatch(/Actiunile de mai jos afecteaza contul tau/i);
    expect(banner.textContent).toMatch(/Citeste cu atentie pe pagina de confirmare/i);
  });

  it('logout button navigates la /app/cont/logout-confirm drill-down', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('danger-logout'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/logout-confirm');
  });

  it('reset button navigates la /app/cont/reset-data-confirm drill-down', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('danger-reset'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/reset-data-confirm');
  });

  it('delete button navigates la /app/cont/delete-account-confirm drill-down', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('danger-delete'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/delete-account-confirm');
  });

  it('back navigates la /app/cont', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  it('U-06 "Sterge contul" copy reflects immediate deletion, NU 30-zile grace (false promise removed)', () => {
    const { container } = renderScreen();
    // Grace promise removed — React flow does immediate hard delete.
    expect(screen.queryByTestId('danger-delete-grace')).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/30 zile gratie/);
    // Truthful copy present.
    const del = screen.getByTestId('danger-delete');
    expect(del.textContent).toMatch(/sterse permanent, imediat/);
  });

  it('U-07 no internal decision ID leak in user-facing GDPR copy (§B039/D-6 removed)', () => {
    const { container } = renderScreen();
    // Internal decision ID prefix must not appear to Gigel.
    expect(container.textContent).not.toMatch(/§B039/);
    expect(container.textContent).not.toMatch(/D-6/);
    // Human GDPR explanation still present.
    expect(container.textContent).toMatch(/GDPR Art\. 17/);
  });
});
