// ══ ENERGY CHECK TESTS — task_05 §A 5-option flow ════════════════════════
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { EnergyCheck } from '../../../routes/screens/antrenor/EnergyCheck';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  const s = (loc.state ?? null) as Record<string, unknown> | null;
  return (
    <div data-testid="probe" data-pathname={loc.pathname}>
      {s ? JSON.stringify(s) : 'no-state'}
    </div>
  );
}

function renderEnergyCheck() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/energy-check']}>
      <Routes>
        <Route path="/app/antrenor/energy-check" element={<EnergyCheck />} />
        <Route path="/app/antrenor/energy-cause" element={<LocationProbe />} />
        <Route path="/app/antrenor/workout-preview" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EnergyCheck — render', () => {
  it('renders heading "Cum te simti azi?"', () => {
    renderEnergyCheck();
    expect(
      screen.getByRole('heading', { name: /Cum te simti azi/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders 5 energy options', () => {
    renderEnergyCheck();
    expect(screen.getByRole('button', { name: /Excelent/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bine/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Normal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Slabit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Obosit/i })).toBeInTheDocument();
  });

  it('each option has data-energy-level + data-intensity', () => {
    renderEnergyCheck();
    const excelent = screen.getByRole('button', { name: /Excelent/i });
    expect(excelent).toHaveAttribute('data-energy-level', 'excelent');
    expect(excelent).toHaveAttribute('data-intensity', 'plus');

    const obosit = screen.getByRole('button', { name: /Obosit/i });
    expect(obosit).toHaveAttribute('data-energy-level', 'obosit');
    expect(obosit).toHaveAttribute('data-intensity', 'minus');
  });
});

describe('EnergyCheck — navigation flow', () => {
  it('Excelent → workout-preview cu intensityMod=plus', () => {
    renderEnergyCheck();
    fireEvent.click(screen.getByRole('button', { name: /Excelent/i }));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    expect(probe.textContent).toContain('"intensityMod":"plus"');
    expect(probe.textContent).toContain('"energyLevel":"excelent"');
  });

  it('Bine → workout-preview cu intensityMod=normal', () => {
    renderEnergyCheck();
    fireEvent.click(screen.getByRole('button', { name: /Bine/i }));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    expect(probe.textContent).toContain('"intensityMod":"normal"');
    expect(probe.textContent).toContain('"energyLevel":"bine"');
  });

  it('Normal → workout-preview cu intensityMod=normal', () => {
    renderEnergyCheck();
    fireEvent.click(screen.getByRole('button', { name: /Normal/i }));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    expect(probe.textContent).toContain('"intensityMod":"normal"');
  });

  it('Slabit → energy-cause cu intensityMod=minus', () => {
    renderEnergyCheck();
    fireEvent.click(screen.getByRole('button', { name: /Slabit/i }));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/energy-cause');
    expect(probe.textContent).toContain('"intensityMod":"minus"');
    expect(probe.textContent).toContain('"energyLevel":"slabit"');
  });

  it('Obosit → energy-cause cu intensityMod=minus', () => {
    renderEnergyCheck();
    fireEvent.click(screen.getByRole('button', { name: /Obosit/i }));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/energy-cause');
    expect(probe.textContent).toContain('"intensityMod":"minus"');
    expect(probe.textContent).toContain('"energyLevel":"obosit"');
  });
});

describe('EnergyCheck — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderEnergyCheck();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
