// PARITY-MISSING-SCREENS Wave 2e — SettingsThemes (PAR-002) tests.
// Per mockup andura-clasic.html L2003-2037 contract verify.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsThemes } from '../../../routes/screens/cont/SettingsThemes';

// Wave E4 i18n locale pin — these specs were written against RO copy;
// force RO locale so existing assertions keep their semantics. EN coverage
// is verified separately by src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { beforeEach as __i18nBeforeEach } from 'vitest';
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../../i18n/index.js';
__i18nBeforeEach(() => { try { localStorage.removeItem('sf.locale'); } catch {} __resetI18n(); __setLocale('ro'); });


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
  localStorage.clear(); __resetI18n(); __setLocale("ro"); // Wave E4 RO pin
  delete document.documentElement.dataset.palette;
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

  // THEME-INVERSION fix (2026-05-27): default real = brain-coach (tema mov),
  // aliniat la settingsStore DEFAULTS.theme='dark'. Inainte 'clasic'.
  it('default selection is "brain-coach" cand localStorage gol', () => {
    renderScreen();
    expect(screen.getByTestId('theme-palette-brain-coach')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('theme-palette-clasic')).toHaveAttribute('aria-pressed', 'false');
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

  // LIVE-PALETTE (2026-05-28): paletele se aplica INSTANT, NU deferred la lansare.
  it('honest copy: paletele se aplica pe loc, NU deferred la lansare', () => {
    const { container } = renderScreen();
    expect(screen.getByText(/se aplica pe loc/i)).toBeInTheDocument();
    expect(screen.getByText(/se schimba instant/i)).toBeInTheDocument();
    expect(/se (va )?aplic\w* la lansare/i.test(container.textContent ?? '')).toBe(false);
  });

  // ANDURA PULSE (2026-05-29) — override palettes retired. Clicking ANY option
  // no longer sets <html data-palette> (one design system; the base theme owns
  // the look). Persisted selection still writes localStorage for parity.
  it('click Luxury NU mai seteaza data-palette (override retras → tema de baza)', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('theme-palette-luxury'));
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });

  it('click Living Body NU mai seteaza data-palette (override retras → tema de baza)', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('theme-palette-living-body'));
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });

  // Clasic + Brain Coach NU seteaza data-palette (base theme light/dark le detine).
  it('click Brain Coach sterge data-palette (base theme owns it)', () => {
    document.documentElement.dataset.palette = 'luxury';
    renderScreen();
    fireEvent.click(screen.getByTestId('theme-palette-brain-coach'));
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });

  it('click Clasic sterge data-palette (base theme owns it)', () => {
    document.documentElement.dataset.palette = 'living-body';
    renderScreen();
    fireEvent.click(screen.getByTestId('theme-palette-clasic'));
    expect(document.documentElement.dataset.palette).toBeUndefined();
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

  // PREVIEW-SCOPE fix (Daniel "preview la themes e buguit" 2026-05-28).
  // Each preview swatch must carry data-preview-palette=<id> so the scoped
  // CSS tokens in global.css resolve to that palette regardless of which
  // palette is currently ACTIVE on documentElement. Without this attribute
  // the swatch leaks the live palette into the preview (clasic-on-mov bug).
  it('each preview swatch carries data-preview-palette=<id> (TRUE mini-snapshot)', () => {
    renderScreen();
    expect(screen.getByTestId('theme-palette-clasic-preview'))
      .toHaveAttribute('data-preview-palette', 'clasic');
    expect(screen.getByTestId('theme-palette-living-body-preview'))
      .toHaveAttribute('data-preview-palette', 'living-body');
    expect(screen.getByTestId('theme-palette-luxury-preview'))
      .toHaveAttribute('data-preview-palette', 'luxury');
    expect(screen.getByTestId('theme-palette-brain-coach-preview'))
      .toHaveAttribute('data-preview-palette', 'brain-coach');
  });

  // The scoped attribute must be present even when the ACTIVE palette is
  // different — proves the preview is independent of the live theme (the
  // original bug was the Clasic preview rendering mov on a Brain Coach user).
  it('Clasic preview keeps clasic scope even when active palette is brain-coach (mov)', () => {
    // Simulate active mov default
    delete document.documentElement.dataset.palette;
    renderScreen();
    const clasicPreview = screen.getByTestId('theme-palette-clasic-preview');
    expect(clasicPreview).toHaveAttribute('data-preview-palette', 'clasic');
    // Sanity: surrounding active palette is NOT clasic
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });

  it('Clasic preview keeps clasic scope even when active palette is luxury', () => {
    document.documentElement.dataset.palette = 'luxury';
    renderScreen();
    expect(screen.getByTestId('theme-palette-clasic-preview'))
      .toHaveAttribute('data-preview-palette', 'clasic');
    expect(document.documentElement.dataset.palette).toBe('luxury');
  });
});
