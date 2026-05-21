// B001/D047 Stage 3 — SchimbaFazaConfirm drill-down tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SchimbaFazaConfirm } from '../../../routes/screens/cont/SchimbaFazaConfirm';

beforeEach(() => {
  localStorage.clear();
});

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/schimba-faza-confirm']}>
      <Routes>
        <Route path="/app/cont/schimba-faza-confirm" element={<SchimbaFazaConfirm />} />
        <Route path="/app/cont/settings-prefs" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SchimbaFazaConfirm — B001 drill-down', () => {
  it('renders heading "Schimba faza manual"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Schimba faza manual/i, level: 1 })).toBeInTheDocument();
  });

  it('shows 5 phase options (radio selector)', () => {
    renderScreen();
    expect(screen.getByTestId('phase-auto')).toBeInTheDocument();
    expect(screen.getByTestId('phase-cut')).toBeInTheDocument();
    expect(screen.getByTestId('phase-maintenance')).toBeInTheDocument();
    expect(screen.getByTestId('phase-bulk')).toBeInTheDocument();
    expect(screen.getByTestId('phase-strength')).toBeInTheDocument();
  });

  it('confirm with CUT selected persists phase-override + navigates back', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('phase-cut'));
    fireEvent.click(screen.getByTestId('schimba-faza-confirm-accept'));

    expect(JSON.parse(localStorage.getItem('phase-override') || 'null')).toBe('CUT');
    expect(localStorage.getItem('phase-change-date')).not.toBeNull();
    const log = JSON.parse(localStorage.getItem('phase-log') || '[]');
    expect(log.length).toBeGreaterThanOrEqual(1);
    expect(log[log.length - 1].phase).toBe('CUT');
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/settings-prefs');
  });

  it('confirm with AUTO clears existing override', () => {
    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    renderScreen();
    fireEvent.click(screen.getByTestId('phase-auto'));
    fireEvent.click(screen.getByTestId('schimba-faza-confirm-accept'));

    expect(JSON.parse(localStorage.getItem('phase-override') || 'undefined')).toBeNull();
  });

  it('cancel navigates back settings-prefs', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('schimba-faza-confirm-cancel'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/settings-prefs');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
