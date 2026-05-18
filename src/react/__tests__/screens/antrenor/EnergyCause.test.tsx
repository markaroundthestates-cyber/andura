// ══ ENERGY CAUSE TESTS — task_05 §B cause grid + skip + state propagation ══
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { EnergyCause } from '../../../routes/screens/antrenor/EnergyCause';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  const s = (loc.state ?? null) as Record<string, unknown> | null;
  return (
    <div data-testid="probe" data-pathname={loc.pathname}>
      {s ? JSON.stringify(s) : 'no-state'}
    </div>
  );
}

function renderEnergyCause(
  initialState: { energyLevel?: string; intensityMod?: string } = {
    energyLevel: 'slabit',
    intensityMod: 'minus',
  }
) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: '/app/antrenor/energy-cause', state: initialState },
      ]}
    >
      <Routes>
        <Route path="/app/antrenor/energy-cause" element={<EnergyCause />} />
        <Route path="/app/antrenor/workout-preview" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EnergyCause — render', () => {
  it('renders heading "De ce te simti asa?"', () => {
    renderEnergyCause();
    expect(
      screen.getByRole('heading', { name: /De ce te simti asa/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders 6 cause options', () => {
    renderEnergyCause();
    expect(screen.getByRole('button', { name: /Dormit putin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mancat putin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Stres mental/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Antrenament greu ieri/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Boala sau racit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Altceva/i })).toBeInTheDocument();
  });

  it('renders Skip button vizibil (anti-force-typing)', () => {
    renderEnergyCause();
    const skip = screen.getByTestId('energy-cause-skip');
    expect(skip).toBeInTheDocument();
    expect(skip).toHaveTextContent(/Sari peste/i);
  });

  it('renders helper copy "Optional. Coach ajusteaza"', () => {
    renderEnergyCause();
    expect(screen.getByText(/Optional/i)).toBeInTheDocument();
    expect(screen.getByText(/Coach ajusteaza/i)).toBeInTheDocument();
  });
});

describe('EnergyCause — navigation flow', () => {
  it('selecting cause navigates la workout-preview cu cause + intensityMod + energyLevel', () => {
    renderEnergyCause();
    fireEvent.click(screen.getByRole('button', { name: /Stres mental/i }));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    expect(probe.textContent).toContain('"cause":"Stres mental"');
    expect(probe.textContent).toContain('"intensityMod":"minus"');
    expect(probe.textContent).toContain('"energyLevel":"slabit"');
  });

  it('Skip navigates la workout-preview fara cause', () => {
    renderEnergyCause();
    fireEvent.click(screen.getByTestId('energy-cause-skip'));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    expect(probe.textContent).not.toContain('cause');
    expect(probe.textContent).toContain('"intensityMod":"minus"');
  });

  it('preserves intensityMod cand state present', () => {
    renderEnergyCause({ energyLevel: 'obosit', intensityMod: 'minus' });
    fireEvent.click(screen.getByRole('button', { name: /Altceva/i }));
    const probe = screen.getByTestId('probe');
    expect(probe.textContent).toContain('"energyLevel":"obosit"');
    expect(probe.textContent).toContain('"cause":"Altceva"');
  });

  it('handles missing state gracefully (no crash)', () => {
    render(
      <MemoryRouter initialEntries={['/app/antrenor/energy-cause']}>
        <Routes>
          <Route path="/app/antrenor/energy-cause" element={<EnergyCause />} />
          <Route path="/app/antrenor/workout-preview" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Dormit putin/i }));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    expect(probe.textContent).toContain('"cause":"Dormit putin"');
  });
});

describe('EnergyCause — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderEnergyCause();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
