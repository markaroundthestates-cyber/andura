// ══ APARATE LIPSA TESTS — task_07 §B missing equipment Set + persist stub ══
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AparateLipsa } from '../../../routes/screens/antrenor/AparateLipsa';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  const s = (loc.state ?? null) as Record<string, unknown> | null;
  return (
    <div data-testid="probe" data-pathname={loc.pathname}>
      {s ? JSON.stringify(s) : 'no-state'}
    </div>
  );
}

function renderLipsa() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/aparate-lipsa']}>
      <Routes>
        <Route path="/app/antrenor/aparate-lipsa" element={<AparateLipsa />} />
        <Route path="/app/antrenor/workout-preview" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AparateLipsa — render', () => {
  it('renders heading "Ce aparate lipsesc?"', () => {
    renderLipsa();
    expect(
      screen.getByRole('heading', { name: /Ce aparate lipsesc/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders 3 categories', () => {
    renderLipsa();
    expect(screen.getByText('Greutati libere')).toBeInTheDocument();
    expect(screen.getByText('Aparate')).toBeInTheDocument();
    expect(screen.getByText('Cardio')).toBeInTheDocument();
  });

  it('renders 12 total items (4 + 5 + 3)', () => {
    renderLipsa();
    const itemButtons = screen.getAllByRole('button').filter((b) =>
      b.hasAttribute('data-item')
    );
    expect(itemButtons.length).toBe(12);
  });

  it('renders Save button', () => {
    renderLipsa();
    expect(screen.getByTestId('aparate-save')).toBeInTheDocument();
  });

  it('default toate items NU sunt selected', () => {
    renderLipsa();
    const itemButtons = screen.getAllByRole('button').filter((b) =>
      b.hasAttribute('data-item')
    );
    itemButtons.forEach((b) => {
      expect(b).toHaveAttribute('aria-pressed', 'false');
    });
  });
});

describe('AparateLipsa — toggle Set behavior', () => {
  it('click adauga item la missing set', () => {
    renderLipsa();
    const smith = screen.getByRole('button', { name: /^Smith$/i });
    fireEvent.click(smith);
    expect(smith).toHaveAttribute('aria-pressed', 'true');
  });

  it('click second time scoate din set (round-trip)', () => {
    renderLipsa();
    const bicicleta = screen.getByRole('button', { name: /Bicicleta/i });
    fireEvent.click(bicicleta);
    expect(bicicleta).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(bicicleta);
    expect(bicicleta).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggling items across categories independent', () => {
    renderLipsa();
    const haltere = screen.getByRole('button', { name: /Haltere mari/i });
    const legPress = screen.getByRole('button', { name: /Leg press/i });
    fireEvent.click(haltere);
    fireEvent.click(legPress);
    expect(haltere).toHaveAttribute('aria-pressed', 'true');
    expect(legPress).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('AparateLipsa — navigation flow', () => {
  it('Save cu zero selections propagates empty array', () => {
    renderLipsa();
    fireEvent.click(screen.getByTestId('aparate-save'));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    expect(probe.textContent).toContain('"missingEquipment":[]');
  });

  it('Save cu 2 items propagates names', () => {
    renderLipsa();
    fireEvent.click(screen.getByRole('button', { name: /Bara olimpica/i }));
    fireEvent.click(screen.getByRole('button', { name: /Hack squat/i }));
    fireEvent.click(screen.getByTestId('aparate-save'));
    const probe = screen.getByTestId('probe');
    expect(probe.textContent).toContain('Bara olimpica');
    expect(probe.textContent).toContain('Hack squat');
  });
});

describe('AparateLipsa — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderLipsa();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
