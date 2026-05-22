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
  it('renders heading "Aparate lipsa" verbatim mockup', () => {
    renderLipsa();
    expect(
      screen.getByRole('heading', { name: /^Aparate lipsa$/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders SubHeader back button (PAR-009)', () => {
    renderLipsa();
    expect(screen.getByTestId('aparate-lipsa-back')).toBeInTheDocument();
  });

  it('renders flat 10 checkbox list per Slice 1.7 mockup naming', () => {
    renderLipsa();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(10);
  });

  it('renders Save button', () => {
    renderLipsa();
    expect(screen.getByTestId('aparate-save')).toBeInTheDocument();
  });

  it('default toate items NU sunt checked', () => {
    renderLipsa();
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((cb) => {
      expect(cb).not.toBeChecked();
    });
  });

  it('renders verbatim mockup item labels (Slice 1.7)', () => {
    renderLipsa();
    expect(screen.getByLabelText('Banca inclinata')).toBeInTheDocument();
    expect(screen.getByLabelText('Banca plana')).toBeInTheDocument();
    expect(screen.getByLabelText('Bara halterelor')).toBeInTheDocument();
    expect(screen.getByLabelText('Gantere')).toBeInTheDocument();
    expect(screen.getByLabelText('Power rack / Smith machine')).toBeInTheDocument();
    expect(screen.getByLabelText('Banda elastica')).toBeInTheDocument();
  });
});

describe('AparateLipsa — toggle Set behavior', () => {
  it('check adauga item la missing set', () => {
    renderLipsa();
    const gantere = screen.getByLabelText('Gantere');
    fireEvent.click(gantere);
    expect(gantere).toBeChecked();
  });

  it('check second time scoate din set (round-trip)', () => {
    renderLipsa();
    const banda = screen.getByLabelText('Banda elastica');
    fireEvent.click(banda);
    expect(banda).toBeChecked();
    fireEvent.click(banda);
    expect(banda).not.toBeChecked();
  });

  it('toggling multiple items independent', () => {
    renderLipsa();
    const banca = screen.getByLabelText('Banca inclinata');
    const legPress = screen.getByLabelText('Leg press');
    fireEvent.click(banca);
    fireEvent.click(legPress);
    expect(banca).toBeChecked();
    expect(legPress).toBeChecked();
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

  it('Save cu 2 items propagates ids', () => {
    renderLipsa();
    fireEvent.click(screen.getByLabelText('Bara halterelor'));
    fireEvent.click(screen.getByLabelText('Leg press'));
    fireEvent.click(screen.getByTestId('aparate-save'));
    const probe = screen.getByTestId('probe');
    expect(probe.textContent).toContain('bara-halterelor');
    expect(probe.textContent).toContain('leg-press');
  });
});

describe('AparateLipsa — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderLipsa();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
