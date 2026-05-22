// D047 RIP-OUT — ResetDataConfirm drill-down tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ResetDataConfirm } from '../../../routes/screens/cont/ResetDataConfirm';

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
  localStorage.clear();
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
    localStorage.setItem('keep-this', 'survives'); // non-wv2 key preserved
    renderScreen();
    fireEvent.click(screen.getByTestId('reset-confirm-accept'));
    expect(localStorage.getItem('wv2-workout-store')).toBeNull();
    expect(localStorage.getItem('wv2-onboarding-store')).toBeNull();
    expect(localStorage.getItem('wv2-nutrition-store')).toBeNull();
    // Tier 0 only — non-wv2 key (e.g. firebase-* auth tokens) NOT touched.
    expect(localStorage.getItem('keep-this')).toBe('survives');
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/');
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
