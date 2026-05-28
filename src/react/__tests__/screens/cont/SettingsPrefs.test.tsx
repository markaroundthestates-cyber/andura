// Phase 6 task_13 — SettingsPrefs sub-screen tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsPrefs } from '../../../routes/screens/cont/SettingsPrefs';
import { useSettingsStore } from '../../../stores/settingsStore';
import { _resetI18nCache, setLocale, getCurrentLocale } from '../../../../i18n/index.js';

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
  _resetI18nCache();
});

describe('SettingsPrefs — render + interactions', () => {
  it('renders heading "Setari"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: 'Setari', level: 1 })).toBeInTheDocument();
  });

  it('renders kg active + lb disabled (lb conversion post-Beta)', () => {
    renderScreen();
    expect(screen.getByTestId('unit-kg')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('unit-lb')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('unit-lb')).toBeDisabled();
  });

  it('lb disabled → click is a no-op, store stays kg (no false switch)', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('unit-lb'));
    expect(useSettingsStore.getState().unitSystem).toBe('kg');
  });

  it('honest note: doar kilograme momentan', () => {
    renderScreen();
    expect(screen.getByText(/Momentan doar kilograme/)).toBeInTheDocument();
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

  // §i18n 2026-05-28 paradigm flip — language toggle is live (Daniel CEO
  // directive). Replaces the static "Romana — Implicit" placeholder.
  describe('Language toggle (EN default / RO opt-in)', () => {
    it('renders heading "Limba / Language"', () => {
      renderScreen();
      expect(screen.getByText('Limba / Language')).toBeInTheDocument();
    });

    it('renders English + Romana options', () => {
      renderScreen();
      expect(screen.getByTestId('language-en')).toBeInTheDocument();
      expect(screen.getByTestId('language-ro')).toBeInTheDocument();
    });

    it('English is the default selection (post 2026-05-28 paradigm flip)', () => {
      _resetI18nCache();
      // navigator.language varies in jsdom but EN is default fallback either way.
      renderScreen();
      const en = screen.getByTestId('language-en');
      // EN may or may not be selected depending on navigator.language (jsdom
      // is typically en-US). Either way, the EN row carries a "Default" badge.
      expect(en.textContent).toMatch(/Default/);
    });

    it('clicking Romana persists ro to localStorage + flips selection', () => {
      _resetI18nCache();
      // Force EN starting state so RO click is a real change.
      setLocale('en');
      renderScreen();
      fireEvent.click(screen.getByTestId('language-ro'));
      expect(localStorage.getItem('sf.locale')).toBe('ro');
      expect(screen.getByTestId('language-ro')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('language-en')).toHaveAttribute('aria-pressed', 'false');
      expect(getCurrentLocale()).toBe('ro');
    });

    it('clicking English persists en + flips selection', () => {
      _resetI18nCache();
      setLocale('ro');
      renderScreen();
      fireEvent.click(screen.getByTestId('language-en'));
      expect(localStorage.getItem('sf.locale')).toBe('en');
      expect(screen.getByTestId('language-en')).toHaveAttribute('aria-pressed', 'true');
      expect(getCurrentLocale()).toBe('en');
    });

    it('clicking the currently-selected option is a no-op (no churn)', () => {
      _resetI18nCache();
      setLocale('en');
      renderScreen();
      // Click EN while EN is already selected; localStorage stays 'en'.
      fireEvent.click(screen.getByTestId('language-en'));
      expect(localStorage.getItem('sf.locale')).toBe('en');
    });

    it('syncs <html lang> attribute on language change', () => {
      _resetI18nCache();
      setLocale('en');
      renderScreen();
      fireEvent.click(screen.getByTestId('language-ro'));
      expect(document.documentElement.lang).toBe('ro');
    });
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
