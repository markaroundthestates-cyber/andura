// ══ ENERGY CHECK TESTS — #69 pre-workout reframe (select + Continue → hub) ══
// Flow change (Daniel UX LOCK 2026-06-08): EnergyCheck shows ONLY the 5 energy
// levels (time-budget chips moved to the dedicated TimeBudget step). Tapping a
// level SELECTS it (highlight, no auto-navigate); the explicit Continue CTA
// commits the self-report into the workoutStore sessionEnergy slice + the engine
// readiness store, then routes: minus → energy-cause, otherwise → MAIN (Antrenor).
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { EnergyCheck } from '../../../routes/screens/antrenor/EnergyCheck';
import { useWorkoutStore } from '../../../stores/workoutStore';
import {
  getComputedReadinessScore,
  getTodayReadiness,
} from '../../../../engine/readiness.js';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderEnergyCheck() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/energy-check']}>
      <Routes>
        <Route path="/app/antrenor/energy-check" element={<EnergyCheck />} />
        <Route path="/app/antrenor/energy-cause" element={<LocationProbe />} />
        <Route path="/app/antrenor" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

function selectThenContinue(name: RegExp) {
  fireEvent.click(screen.getByRole('button', { name }));
  fireEvent.click(screen.getByTestId('energy-check-continue'));
}

beforeEach(() => {
  localStorage.clear();
  useWorkoutStore.setState({ sessionEnergy: null });
});

describe('EnergyCheck — render (Wave C2 i18n EN default)', () => {
  it('renders SubHeader title "How do you feel?" (mockup L879 verbatim, EN-default)', () => {
    renderEnergyCheck();
    expect(
      screen.getByRole('heading', { name: /^How do you feel\?$/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders body sub-heading "How do you feel today?" (h2, EN-default)', () => {
    renderEnergyCheck();
    expect(
      screen.getByRole('heading', { name: /How do you feel today/i, level: 2 })
    ).toBeInTheDocument();
  });

  it('renders SubHeader back button (PAR-009)', () => {
    renderEnergyCheck();
    expect(screen.getByTestId('energy-check-back')).toBeInTheDocument();
  });

  it('renders 5 energy options (EN labels)', () => {
    renderEnergyCheck();
    expect(screen.getByRole('button', { name: /Excellent/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Good/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Normal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Drained/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Exhausted/i })).toBeInTheDocument();
  });

  it('each option has data-energy-level + data-intensity (semantic ids unchanged)', () => {
    renderEnergyCheck();
    const excellent = screen.getByRole('button', { name: /Excellent/i });
    expect(excellent).toHaveAttribute('data-energy-level', 'excelent');
    expect(excellent).toHaveAttribute('data-intensity', 'plus');

    const exhausted = screen.getByRole('button', { name: /Exhausted/i });
    expect(exhausted).toHaveAttribute('data-energy-level', 'obosit');
    expect(exhausted).toHaveAttribute('data-intensity', 'minus');
  });

  it('#69 — the time-budget chips are GONE from EnergyCheck (moved to TimeBudget)', () => {
    renderEnergyCheck();
    expect(screen.queryByTestId('energy-time-budget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('time-chip-30')).not.toBeInTheDocument();
    expect(screen.queryByTestId('time-chip-nolimit')).not.toBeInTheDocument();
  });

  it('#69 — Continue is present', () => {
    renderEnergyCheck();
    expect(screen.getByTestId('energy-check-continue')).toBeInTheDocument();
  });
});

describe('EnergyCheck — #69 select-then-Continue (no auto-navigate)', () => {
  it('tapping a level does NOT navigate — it only highlights it (selected)', () => {
    renderEnergyCheck();
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    // Still on the energy-check screen (no probe yet).
    expect(screen.queryByTestId('probe')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Good/i })).toHaveAttribute('data-selected', 'true');
  });

  it('Excellent → Continue → MAIN (Antrenor), sessionEnergy intensityMod=plus', () => {
    renderEnergyCheck();
    selectThenContinue(/Excellent/i);
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
    const e = useWorkoutStore.getState().sessionEnergy;
    expect(e?.intensityMod).toBe('plus');
    expect(e?.energyLevel).toBe('excelent');
  });

  it('Good → Continue → MAIN, sessionEnergy intensityMod=normal', () => {
    renderEnergyCheck();
    selectThenContinue(/Good/i);
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
    expect(useWorkoutStore.getState().sessionEnergy?.intensityMod).toBe('normal');
    expect(useWorkoutStore.getState().sessionEnergy?.energyLevel).toBe('bine');
  });

  it('Normal → Continue → MAIN, sessionEnergy intensityMod=normal', () => {
    renderEnergyCheck();
    selectThenContinue(/Normal/i);
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
    expect(useWorkoutStore.getState().sessionEnergy?.intensityMod).toBe('normal');
  });

  it('Drained → Continue → energy-cause, sessionEnergy intensityMod=minus', () => {
    renderEnergyCheck();
    selectThenContinue(/Drained/i);
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor/energy-cause');
    const e = useWorkoutStore.getState().sessionEnergy;
    expect(e?.intensityMod).toBe('minus');
    expect(e?.energyLevel).toBe('slabit');
  });

  it('Exhausted → Continue → energy-cause, sessionEnergy intensityMod=minus', () => {
    renderEnergyCheck();
    selectThenContinue(/Exhausted/i);
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor/energy-cause');
    const e = useWorkoutStore.getState().sessionEnergy;
    expect(e?.intensityMod).toBe('minus');
    expect(e?.energyLevel).toBe('obosit');
  });

  it('Continue is a no-op until a level is selected (disabled)', () => {
    renderEnergyCheck();
    const cta = screen.getByTestId('energy-check-continue');
    expect(cta).toBeDisabled();
    fireEvent.click(cta);
    expect(screen.queryByTestId('probe')).not.toBeInTheDocument();
  });
});

describe('EnergyCheck — readiness write (C2 engine wire)', () => {
  it('getComputedReadinessScore is null BEFORE any selection (starved baseline)', () => {
    expect(getComputedReadinessScore()).toBeNull();
  });

  it('selecting + Continue makes getComputedReadinessScore non-null', () => {
    renderEnergyCheck();
    expect(getComputedReadinessScore()).toBeNull();
    selectThenContinue(/Good/i);
    expect(getComputedReadinessScore()).not.toBeNull();
    expect(typeof getComputedReadinessScore()).toBe('number');
  });

  it('selecting WITHOUT Continue does NOT write readiness yet (commit on Continue)', () => {
    renderEnergyCheck();
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(getComputedReadinessScore()).toBeNull();
  });

  it('maps the 5 options to readiness 1-5 (Excellent=5 .. Exhausted=1) — EN default labels', () => {
    const cases: ReadonlyArray<[RegExp, number]> = [
      [/Excellent/i, 5],
      [/Good/i, 4],
      [/Normal/i, 3],
      [/Drained/i, 2],
      [/Exhausted/i, 1],
    ];
    for (const [name, expected] of cases) {
      localStorage.clear();
      const { unmount } = renderEnergyCheck();
      selectThenContinue(name);
      expect(getTodayReadiness()).toBe(expected);
      unmount();
    }
  });

  it('higher readiness yields a higher computed score (monotonic wire)', () => {
    localStorage.clear();
    const a = renderEnergyCheck();
    selectThenContinue(/Exhausted/i);
    const lowScore = getComputedReadinessScore();
    a.unmount();

    localStorage.clear();
    const b = renderEnergyCheck();
    selectThenContinue(/Excellent/i);
    const highScore = getComputedReadinessScore();
    b.unmount();

    expect(lowScore).not.toBeNull();
    expect(highScore).not.toBeNull();
    expect(highScore!).toBeGreaterThan(lowScore!);
  });
});

describe('EnergyCheck — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderEnergyCheck();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
