// D047 RIP-OUT — ResetDataConfirm drill-down tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ResetDataConfirm } from '../../../routes/screens/cont/ResetDataConfirm';

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
    <MemoryRouter initialEntries={['/app/cont/reset-data-confirm']}>
      <Routes>
        <Route path="/app/cont/reset-data-confirm" element={<ResetDataConfirm />} />
        <Route path="/app/cont/settings-danger" element={<LocationProbe />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear(); __resetI18n(); __setLocale("ro");
});

describe('ResetDataConfirm — D047 drill-down', () => {
  it('renders heading "Reseteaza datele"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Reseteaza datele/i, level: 1 })).toBeInTheDocument();
  });

  it('renders confirm question + ireversible warning', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Resetezi toate datele\?/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/Toate antrenamentele.+masuratorile locale vor fi sterse/i)).toBeInTheDocument();
    expect(screen.getByText(/nu poate fi anulata/i)).toBeInTheDocument();
    expect(screen.getByText(/Contul ramane activ/i)).toBeInTheDocument();
  });

  it('confirm wipes wv2-* localStorage + navigates /', () => {
    localStorage.setItem('wv2-workout-store', 'data');
    localStorage.setItem('wv2-onboarding-store', 'data');
    localStorage.setItem('wv2-nutrition-store', 'data');
    renderScreen();
    fireEvent.click(screen.getByTestId('reset-confirm-accept'));
    expect(localStorage.getItem('wv2-workout-store')).toBeNull();
    expect(localStorage.getItem('wv2-onboarding-store')).toBeNull();
    expect(localStorage.getItem('wv2-nutrition-store')).toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/');
  });

  // A2 H-1 audit fix — the "Toate ... vor fi sterse ... nu poate fi anulata"
  // copy MUST be true: unprefixed engine data (logs / pr-records / pain-cdl /
  // coach-decisions / weights) written via src/db.js MUST be gone after reset.
  it('confirm wipes UNPREFIXED engine data (logs / pr-records / pain-cdl / coach)', () => {
    localStorage.setItem('logs', JSON.stringify([{ ex: 'bench', kg: 100 }]));
    localStorage.setItem('pr-records', JSON.stringify({ bench: 120 }));
    localStorage.setItem('pain-cdl', JSON.stringify([{ region: 'knee' }]));
    localStorage.setItem('coach-decisions', JSON.stringify([{ kind: 'deload' }]));
    localStorage.setItem('weights', JSON.stringify([{ kg: 80 }]));
    localStorage.setItem('readiness', JSON.stringify({ score: 7 }));
    localStorage.setItem('aa-cooldown-bench', '1'); // dynamic-prefix runtime key
    renderScreen();
    fireEvent.click(screen.getByTestId('reset-confirm-accept'));
    expect(localStorage.getItem('logs')).toBeNull();
    expect(localStorage.getItem('pr-records')).toBeNull();
    expect(localStorage.getItem('pain-cdl')).toBeNull();
    expect(localStorage.getItem('coach-decisions')).toBeNull();
    expect(localStorage.getItem('weights')).toBeNull();
    expect(localStorage.getItem('readiness')).toBeNull();
    expect(localStorage.getItem('aa-cooldown-bench')).toBeNull();
  });

  // Reset = fresh start, stays logged in. Account session + device identity +
  // UI theme MUST survive (distinct from account delete which signs out).
  it('confirm PRESERVES account session + device-id + theme (stays logged in)', () => {
    localStorage.setItem('firebase-id-token', 'tok');
    localStorage.setItem('firebase-uid', 'uid-123');
    localStorage.setItem('firebase-refresh-token', 'rtok');
    localStorage.setItem('device-id', 'dev-abc');
    localStorage.setItem('active-theme', 'dark');
    localStorage.setItem('logs', JSON.stringify([{ ex: 'squat' }]));
    renderScreen();
    fireEvent.click(screen.getByTestId('reset-confirm-accept'));
    // Session + device + theme survive...
    expect(localStorage.getItem('firebase-id-token')).toBe('tok');
    expect(localStorage.getItem('firebase-uid')).toBe('uid-123');
    expect(localStorage.getItem('firebase-refresh-token')).toBe('rtok');
    expect(localStorage.getItem('device-id')).toBe('dev-abc');
    expect(localStorage.getItem('active-theme')).toBe('dark');
    // ...but training data is gone.
    expect(localStorage.getItem('logs')).toBeNull();
  });

  it('cancel navigates back settings-danger', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('reset-confirm-cancel'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/settings-danger');
  });

  it('back arrow navigates settings-danger', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/settings-danger');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
