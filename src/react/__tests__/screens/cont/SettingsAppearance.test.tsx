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
