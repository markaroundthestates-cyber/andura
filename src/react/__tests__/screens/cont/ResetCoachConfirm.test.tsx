// B011/D047 Stage 3 — ResetCoachConfirm drill-down tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ResetCoachConfirm } from '../../../routes/screens/cont/ResetCoachConfirm';

// Wave E4 i18n locale pin — these specs were written against RO copy;
// force RO locale so existing assertions keep their semantics. EN coverage
// is verified separately by src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { beforeEach as __i18nBeforeEach } from 'vitest';
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../../i18n/index.js';
__i18nBeforeEach(() => { try { localStorage.removeItem('sf.locale'); } catch {} __resetI18n(); __setLocale('ro'); });


beforeEach(() => {
  localStorage.clear(); __resetI18n(); __setLocale("ro");
});

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/reset-coach-confirm']}>
      <Routes>
        <Route path="/app/cont/reset-coach-confirm" element={<ResetCoachConfirm />} />
        <Route path="/app/cont/settings-prefs" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ResetCoachConfirm — B011 drill-down', () => {
  it('renders heading "Reseteaza coach"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Reseteaza coach/i, level: 1 })).toBeInTheDocument();
  });

  it('confirm wipes coach state + navigates back settings-prefs', () => {
    localStorage.setItem('coach-decisions', JSON.stringify([{ id: 'cd_x' }]));
    localStorage.setItem('applied-patterns', JSON.stringify([{ p: 'x' }]));
    localStorage.setItem('aggressive-loading-log', JSON.stringify([{ ts: 1 }]));
    localStorage.setItem('aa-cooldown-Bench Press', String(Date.now()));
    // Preserve assertions: workout logs + weights survive
    localStorage.setItem('logs', JSON.stringify([{ ex: 'Bench' }]));
    localStorage.setItem('weights', JSON.stringify({ '2026-05-21': 80 }));

    renderScreen();
    fireEvent.click(screen.getByTestId('reset-coach-confirm-accept'));

    expect(localStorage.getItem('coach-decisions')).toBeNull();
    expect(localStorage.getItem('applied-patterns')).toBeNull();
    expect(localStorage.getItem('aggressive-loading-log')).toBeNull();
    expect(localStorage.getItem('aa-cooldown-Bench Press')).toBeNull();
    // User data preserved
    expect(JSON.parse(localStorage.getItem('logs') || 'null')).toEqual([{ ex: 'Bench' }]);
    expect(JSON.parse(localStorage.getItem('weights') || 'null')).toEqual({ '2026-05-21': 80 });
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/settings-prefs');
  });

  it('cancel navigates back settings-prefs', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('reset-coach-confirm-cancel'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/settings-prefs');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
