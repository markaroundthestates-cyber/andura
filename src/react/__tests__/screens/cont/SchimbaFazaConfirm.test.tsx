// B001/D047 Stage 3 — SchimbaFazaConfirm drill-down tests (placeholder action).

import type { JSX } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SchimbaFazaConfirm } from '../../../routes/screens/cont/SchimbaFazaConfirm';

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

  it('confirm navigates back settings-prefs (placeholder iter 3)', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('schimba-faza-confirm-accept'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/settings-prefs');
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
