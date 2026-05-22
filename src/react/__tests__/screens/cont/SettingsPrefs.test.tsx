// Phase 6 task_13 — SettingsPrefs sub-screen tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsPrefs } from '../../../routes/screens/cont/SettingsPrefs';
import { useSettingsStore } from '../../../stores/settingsStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-prefs']}>
      <Routes>
        <Route path="/app/cont/settings-prefs" element={<SettingsPrefs />} />
        <Route path="/app/cont" element={<LocationProbe />} />
        <Route path="/app/cont/redo-onboarding-confirm" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useSettingsStore.getState().reset();
  localStorage.clear();
});

describe('SettingsPrefs — render + interactions', () => {
  it('renders heading "Setari"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: 'Setari', level: 1 })).toBeInTheDocument();
  });

  it('renders kg/lb radios + default kg', () => {
    renderScreen();
    expect(screen.getByTestId('unit-kg')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('unit-lb')).toHaveAttribute('aria-pressed', 'false');
  });

  it('unit lb click → store updated', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('unit-lb'));
    expect(useSettingsStore.getState().unitSystem).toBe('lb');
  });

  it('renders week start L/D + default L', () => {
    renderScreen();
    expect(screen.getByTestId('week-start-L')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('week-start-D')).toHaveAttribute('aria-pressed', 'false');
  });

  it('week start D click → store updated', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('week-start-D'));
    expect(useSettingsStore.getState().weekStart).toBe('D');
  });

  it('locale section ro-RO display + post-Beta hint', () => {
    renderScreen();
    expect(screen.getByText(/Romana \(ro-RO\)/)).toBeInTheDocument();
    expect(screen.getByText(/post-Beta/)).toBeInTheDocument();
  });

  it('back navigates la /app/cont', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont');
  });

  // §B002 D047 Stage 3 — Avansat section drill-down
  it('Avansat section renders Refa onboarding button', () => {
    renderScreen();
    expect(screen.getByTestId('advanced-redo-onboarding')).toBeInTheDocument();
  });

  it('Refa onboarding navigates la /app/cont/redo-onboarding-confirm', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('advanced-redo-onboarding'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/redo-onboarding-confirm');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
