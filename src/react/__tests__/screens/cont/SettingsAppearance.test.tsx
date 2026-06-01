// Phase 6 task_12 — SettingsAppearance sub-screen tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsAppearance } from '../../../routes/screens/cont/SettingsAppearance';
import { useSettingsStore } from '../../../stores/settingsStore';

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
  localStorage.clear(); __resetI18n(); __setLocale("ro"); // Wave E4 RO pin
  document.documentElement.style.removeProperty('--brick');
});

describe('SettingsAppearance — render + interactions', () => {
  it('renders heading "Aspect"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: 'Aspect', level: 1 })).toBeInTheDocument();
  });

  // [05.061] consolidation 2026-05-29 — the theme (light/dark/auto) picker was
  // a stale duplicate of the inline LIVE Appearance card in Cont.tsx (accent +
  // Dark/Light, canonical per D095) and was removed here. SettingsAppearance is
  // now the canonical home for the lone control the inline card lacks: bottom-
  // nav density. Theme coverage lives in Cont.test.tsx (inline card).

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

// ADDENDUM 4 (2026-06-01) — accent picker + Dark/Light mode MOVED here from the
// inline Cont card (the Account home no longer duplicates them). Testids
// preserved verbatim (cont-accent-*, cont-theme-*). Render-move, not behavior
// change: the same settingsStore wires drive the controls.
describe('SettingsAppearance — accent picker (moved from Cont)', () => {
  it('renders 4 accent swatches Volt/Aqua/Ember/Violet', () => {
    renderScreen();
    expect(screen.getByTestId('cont-accent-volt')).toBeInTheDocument();
    expect(screen.getByTestId('cont-accent-aqua')).toBeInTheDocument();
    expect(screen.getByTestId('cont-accent-ember')).toBeInTheDocument();
    expect(screen.getByTestId('cont-accent-violet')).toBeInTheDocument();
  });

  it('default accent = Volt (pressed) when store fresh', () => {
    renderScreen();
    expect(screen.getByTestId('cont-accent-volt')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('cont-accent-aqua')).toHaveAttribute('aria-pressed', 'false');
  });

  it('click swatch updates store + applies --brick override on documentElement', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('cont-accent-aqua'));
    expect(useSettingsStore.getState().accent).toBe('aqua');
    expect(screen.getByTestId('cont-accent-aqua')).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.style.getPropertyValue('--brick')).toBe('#4fd6e8');
  });

  it('picking Volt clears the --brick override (theme default owns it)', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('cont-accent-ember'));
    expect(document.documentElement.style.getPropertyValue('--brick')).toBe('#ff7d52');
    fireEvent.click(screen.getByTestId('cont-accent-volt'));
    expect(useSettingsStore.getState().accent).toBe('volt');
    expect(document.documentElement.style.getPropertyValue('--brick')).toBe('');
  });
});

describe('SettingsAppearance — Dark/Light mode (moved from Cont)', () => {
  it('renders Dark/Light toggle; Dark active by default (auto/dark)', () => {
    renderScreen();
    expect(screen.getByTestId('cont-theme-dark')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('cont-theme-light')).toHaveAttribute('aria-pressed', 'false');
  });

  it('clicking Light updates the theme store', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('cont-theme-light'));
    expect(useSettingsStore.getState().theme).toBe('light');
    expect(screen.getByTestId('cont-theme-light')).toHaveAttribute('aria-pressed', 'true');
  });
});
