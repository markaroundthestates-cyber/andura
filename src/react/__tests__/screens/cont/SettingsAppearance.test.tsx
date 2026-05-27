// Phase 6 task_12 — SettingsAppearance sub-screen tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsAppearance } from '../../../routes/screens/cont/SettingsAppearance';
import { useSettingsStore } from '../../../stores/settingsStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-appearance']}>
      <Routes>
        <Route path="/app/cont/settings-appearance" element={<SettingsAppearance />} />
        <Route path="/app/cont" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useSettingsStore.getState().reset();
  localStorage.clear();
});

describe('SettingsAppearance — render + interactions', () => {
  it('renders heading "Aspect"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: 'Aspect', level: 1 })).toBeInTheDocument();
  });

  it('renders 3 theme options + default dark selected', () => {
    renderScreen();
    expect(screen.getByTestId('theme-dark')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('theme-light')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('theme-auto')).toHaveAttribute('aria-pressed', 'false');
  });

  it('theme click → store updated', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('theme-light'));
    expect(useSettingsStore.getState().theme).toBe('light');
  });

  it('renders 2 nav style options + default comfortable selected', () => {
    renderScreen();
    expect(screen.getByTestId('nav-style-comfortable')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('nav-style-compact')).toHaveAttribute('aria-pressed', 'false');
  });

  it('nav style click → store updated', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('nav-style-compact'));
    expect(useSettingsStore.getState().bottomNavStyle).toBe('compact');
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
});
