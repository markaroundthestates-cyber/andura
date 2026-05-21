// B004/D047 Stage 3 — FinishEarlyConfirm drill-down tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { FinishEarlyConfirm } from '../../../routes/screens/antrenor/FinishEarlyConfirm';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/finish-early-confirm']}>
      <Routes>
        <Route path="/app/antrenor/finish-early-confirm" element={<FinishEarlyConfirm />} />
        <Route path="/app/antrenor/workout" element={<LocationProbe />} />
        <Route path="/app/antrenor/post-rpe" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('FinishEarlyConfirm — B004 drill-down', () => {
  it('renders heading "Termina mai devreme"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Termina mai devreme/i, level: 1 })).toBeInTheDocument();
  });

  it('renders confirm question + body lines', () => {
    renderScreen();
    expect(screen.getByText(/Termini sesiunea acum/i)).toBeInTheDocument();
    expect(screen.getByText(/Sesiunea partiala se salveaza/i)).toBeInTheDocument();
    expect(screen.getByText(/NU pierzi progresul/i)).toBeInTheDocument();
  });

  it('confirm navigates la /app/antrenor/post-rpe (partial summary natural)', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('finish-early-confirm-accept'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor/post-rpe');
  });

  it('cancel navigates back la /app/antrenor/workout', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('finish-early-confirm-cancel'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor/workout');
  });

  it('back arrow navigates workout', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor/workout');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
