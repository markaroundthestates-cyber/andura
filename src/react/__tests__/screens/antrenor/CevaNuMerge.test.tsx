// ══ CEVA NU MERGE TESTS — task_06 §A problem picker + 5-route navigation ══
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CevaNuMerge } from '../../../routes/screens/antrenor/CevaNuMerge';
// i18n locale pin — these specs assert RO copy (Ce nu merge / Spune-mi ce e /
// Ma doare ceva / Aparate ocupate / etc). Force RO so the i18n indirection
// resolves to the RO assertion targets. EN coverage is locked separately by
// i18nNoRoLeak.test.tsx.
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';
beforeEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
  setLocale('ro');
});

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  const s = (loc.state ?? null) as { from?: string } | null;
  return (
    <div data-testid="probe" data-pathname={loc.pathname} data-from={s?.from ?? ''} />
  );
}

function renderCevaNuMerge() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/ceva-nu-merge']}>
      <Routes>
        <Route path="/app/antrenor/ceva-nu-merge" element={<CevaNuMerge />} />
        <Route path="/app/antrenor/pain-button" element={<LocationProbe />} />
        <Route path="/app/antrenor/equipment-swap" element={<LocationProbe />} />
        <Route path="/app/antrenor/aparate-lipsa" element={<LocationProbe />} />
        <Route path="/app/antrenor/schedule-override" element={<LocationProbe />} />
        <Route path="/app/antrenor" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CevaNuMerge — render', () => {
  it('renders heading "Ce nu merge?"', () => {
    // §F-ceva-nu-merge-02 (MED chat5 Wave 12) — title mockup verbatim L1001.
    renderCevaNuMerge();
    expect(
      screen.getByRole('heading', { name: /Ce nu merge/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders helper copy', () => {
    renderCevaNuMerge();
    expect(screen.getByText(/Spune-mi ce e/i)).toBeInTheDocument();
  });

  it('renders all 5 problem options cu data-problem-kind', () => {
    renderCevaNuMerge();
    expect(screen.getByRole('button', { name: /Ma doare ceva/i })).toHaveAttribute(
      'data-problem-kind',
      'pain'
    );
    expect(screen.getByRole('button', { name: /Aparate ocupate/i })).toHaveAttribute(
      'data-problem-kind',
      'equipment-busy'
    );
    expect(screen.getByRole('button', { name: /Aparat lipsa/i })).toHaveAttribute(
      'data-problem-kind',
      'equipment-missing'
    );
    expect(screen.getByRole('button', { name: /Vreau alt antrenament/i })).toHaveAttribute(
      'data-problem-kind',
      'override'
    );
    expect(screen.getByRole('button', { name: /Renunt azi/i })).toHaveAttribute(
      'data-problem-kind',
      'cancel'
    );
  });
});

describe('CevaNuMerge — navigation flow', () => {
  it('Ma doare ceva → /app/antrenor/pain-button', () => {
    renderCevaNuMerge();
    fireEvent.click(screen.getByRole('button', { name: /Ma doare ceva/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/pain-button'
    );
  });

  it('Aparate ocupate → /app/antrenor/equipment-swap', () => {
    renderCevaNuMerge();
    fireEvent.click(screen.getByRole('button', { name: /Aparate ocupate/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/equipment-swap'
    );
  });

  it('Aparat lipsa → /app/antrenor/aparate-lipsa cu from: workout (A2 H-4)', () => {
    renderCevaNuMerge();
    fireEvent.click(screen.getByRole('button', { name: /Aparat lipsa/i }));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/aparate-lipsa');
    expect(probe).toHaveAttribute('data-from', 'workout');
  });

  it('Vreau alt antrenament → /app/antrenor/schedule-override', () => {
    renderCevaNuMerge();
    fireEvent.click(screen.getByRole('button', { name: /Vreau alt antrenament/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/schedule-override'
    );
  });

  it('Renunt azi → /app/antrenor (Phase 4 wires confirm-finish-early)', () => {
    renderCevaNuMerge();
    fireEvent.click(screen.getByRole('button', { name: /Renunt azi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor'
    );
  });
});

describe('CevaNuMerge — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderCevaNuMerge();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
