// B011/D047 Stage 3 — ResetCoachConfirm drill-down tests (placeholder action).

import type { JSX } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ResetCoachConfirm } from '../../../routes/screens/cont/ResetCoachConfirm';

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

  it('confirm navigates back settings-prefs (placeholder iter 3)', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('reset-coach-confirm-accept'));
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
