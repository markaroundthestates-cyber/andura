// PARITY-MISSING-SCREENS Wave 2e — SettingsThemes (PAR-002) tests.
// Per mockup andura-clasic.html L2003-2037 contract verify.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsThemes } from '../../../routes/screens/cont/SettingsThemes';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-themes']}>
      <Routes>
        <Route path="/app/cont/settings-themes" element={<SettingsThemes />} />
        <Route path="/app/cont/settings-appearance" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('SettingsThemes — Teme picker screen', () => {
  it('renders heading "Teme"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: 'Teme', level: 1 })).toBeInTheDocument();
  });

  it('renders 4 theme palette options', () => {
    renderScreen();
    expect(screen.getByTestId('theme-palette-clasic')).toBeInTheDocument();
    expect(screen.getByTestId('theme-palette-living-body')).toBeInTheDocument();
    expect(screen.getByTestId('theme-palette-luxury')).toBeInTheDocument();
    expect(screen.getByTestId('theme-palette-brain-coach')).toBeInTheDocument();
  });

  it('default selection is "clasic" cand localStorage gol', () => {
    renderScreen();
    expect(screen.getByTestId('theme-palette-clasic')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('theme-palette-luxury')).toHaveAttribute('aria-pressed', 'false');
  });

  it('reads persisted selection din localStorage', () => {
    localStorage.setItem('wv2-palette-theme', 'luxury');
    renderScreen();
    expect(screen.getByTestId('theme-palette-luxury')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('theme-palette-clasic')).toHaveAttribute('aria-pressed', 'false');
  });

  it('click theme card updates selection si scrie localStorage', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('theme-palette-brain-coach'));
    expect(screen.getByTestId('theme-palette-brain-coach')).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('wv2-palette-theme')).toBe('brain-coach');
  });

  it('honest copy: paletele se aplica la lansare, NU "se aplica instant"', () => {
    const { container } = renderScreen();
    expect(screen.getByText(/se va aplica la lansare/i)).toBeInTheDocument();
    expect(/se aplica instant/i.test(container.textContent ?? '')).toBe(false);
  });

  it('back navigates la /app/cont/settings-appearance', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/settings-appearance');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
