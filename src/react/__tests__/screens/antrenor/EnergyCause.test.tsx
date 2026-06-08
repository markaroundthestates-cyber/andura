// ══ ENERGY CAUSE TESTS — task_05 §B cause grid + skip + state propagation ══
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { EnergyCause } from '../../../routes/screens/antrenor/EnergyCause';
import { useWorkoutStore } from '../../../stores/workoutStore';
import type { SessionEnergy } from '../../../stores/workoutStore';
// i18n locale pin — these specs assert RO copy (Ce e mai greu azi / Sari peste
// / Alege una / etc). Force RO so the i18n indirection resolves to the RO
// assertion targets. EN coverage is locked separately by i18nNoRoLeak.test.tsx.
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';
beforeEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
  setLocale('ro');
  // #69 — the energy self-report is recorded by EnergyCheck into the store before
  // routing here; seed it directly for the isolated EnergyCause render.
  useWorkoutStore.setState({
    sessionEnergy: { energyLevel: 'slabit', intensityMod: 'minus' },
  });
});

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderEnergyCause(
  seed: SessionEnergy = { energyLevel: 'slabit', intensityMod: 'minus' }
) {
  useWorkoutStore.setState({ sessionEnergy: seed });
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/energy-cause']}>
      <Routes>
        <Route path="/app/antrenor/energy-cause" element={<EnergyCause />} />
        <Route path="/app/antrenor" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EnergyCause — render', () => {
  it('renders heading "Ce e mai greu azi?"', () => {
    renderEnergyCause();
    expect(
      screen.getByRole('heading', { name: /Ce e mai greu azi/i, level: 1 })
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

  it('renders helper copy "Alege una. Coach-ul foloseste raspunsul"', () => {
    renderEnergyCause();
    expect(screen.getByText(/Alege una/i)).toBeInTheDocument();
    expect(screen.getByText(/Coach-ul foloseste raspunsul/i)).toBeInTheDocument();
  });
});

describe('EnergyCause — #69 navigation flow (→ MAIN, energy in store)', () => {
  it('selecting cause → MAIN (Antrenor); cause + intensityMod + energyLevel persisted to the store', () => {
    renderEnergyCause();
    fireEvent.click(screen.getByRole('button', { name: /Stres mental/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
    const e = useWorkoutStore.getState().sessionEnergy;
    expect(e?.cause).toBe('Stres mental');
    expect(e?.intensityMod).toBe('minus');
    expect(e?.energyLevel).toBe('slabit');
  });

  it('Skip → MAIN; intensityMod/energyLevel preserved, no cause set', () => {
    renderEnergyCause();
    fireEvent.click(screen.getByTestId('energy-cause-skip'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
    const e = useWorkoutStore.getState().sessionEnergy;
    expect(e?.cause).toBeUndefined();
    expect(e?.intensityMod).toBe('minus');
  });

  it('preserves the energyLevel recorded on EnergyCheck', () => {
    renderEnergyCause({ energyLevel: 'obosit', intensityMod: 'minus' });
    fireEvent.click(screen.getByRole('button', { name: /Altceva/i }));
    const e = useWorkoutStore.getState().sessionEnergy;
    expect(e?.energyLevel).toBe('obosit');
    expect(e?.cause).toBe('Altceva');
  });

  it('handles an empty energy slice gracefully (deep-link defensive fallback)', () => {
    useWorkoutStore.setState({ sessionEnergy: null });
    render(
      <MemoryRouter initialEntries={['/app/antrenor/energy-cause']}>
        <Routes>
          <Route path="/app/antrenor/energy-cause" element={<EnergyCause />} />
          <Route path="/app/antrenor" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Dormit putin/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
    const e = useWorkoutStore.getState().sessionEnergy;
    expect(e?.cause).toBe('Dormit putin');
    // Defensive fallback: a deep-link with no prior self-report defaults to minus.
    expect(e?.intensityMod).toBe('minus');
  });
});

describe('EnergyCause — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderEnergyCause();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
