// Phase 6 task_15 — SettingsTerms sub-screen tests.

import type { JSX } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsTerms } from '../../../routes/screens/cont/SettingsTerms';

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
    <MemoryRouter initialEntries={['/app/cont/settings-terms']}>
      <Routes>
        <Route path="/app/cont/settings-terms" element={<SettingsTerms />} />
        <Route path="/app/cont" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SettingsTerms — render + tabs', () => {
  it('renders heading "Termeni si conditii"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Termeni si conditii/i, level: 1 })).toBeInTheDocument();
  });

  it('default tab T&C selected', () => {
    renderScreen();
    expect(screen.getByTestId('terms-tab-tc')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('terms-tab-medical')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByTestId('terms-tc-content')).toBeInTheDocument();
  });

  it('Medical tab click switches content', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('terms-tab-medical'));
    expect(screen.getByTestId('terms-tab-medical')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('terms-medical-content')).toBeInTheDocument();
    expect(screen.queryByTestId('terms-tc-content')).not.toBeInTheDocument();
  });

  it('T&C content has key bullets', () => {
    renderScreen();
    expect(screen.getByText(/Andura ofera recomandari/)).toBeInTheDocument();
    expect(screen.getByText(/Raportarea de erori .* este opt-in/i)).toBeInTheDocument();
  });

  it('Medical content has safety guidance', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('terms-tab-medical'));
    expect(screen.getByText(/Andura este o aplicatie de fitness/)).toBeInTheDocument();
    expect(screen.getByText(/asculta-ti corpul/i)).toBeInTheDocument();
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
