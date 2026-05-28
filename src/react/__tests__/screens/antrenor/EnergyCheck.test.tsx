// ══ ENERGY CHECK TESTS — task_05 §A 5-option flow ════════════════════════
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { EnergyCheck } from '../../../routes/screens/antrenor/EnergyCheck';
import {
  getComputedReadinessScore,
  getTodayReadiness,
} from '../../../../engine/readiness.js';

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
});

describe('EnergyCheck — navigation flow (EN labels, RO semantic ids)', () => {
  it('Excellent → workout-preview cu intensityMod=plus', () => {
    renderEnergyCheck();
    fireEvent.click(screen.getByRole('button', { name: /Excellent/i }));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    expect(probe.textContent).toContain('"intensityMod":"plus"');
    expect(probe.textContent).toContain('"energyLevel":"excelent"');
  });

  it('Good → workout-preview cu intensityMod=normal', () => {
    renderEnergyCheck();
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
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

  it('Drained → energy-cause cu intensityMod=minus', () => {
    renderEnergyCheck();
    fireEvent.click(screen.getByRole('button', { name: /Drained/i }));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/energy-cause');
    expect(probe.textContent).toContain('"intensityMod":"minus"');
    expect(probe.textContent).toContain('"energyLevel":"slabit"');
  });

  it('Exhausted → energy-cause cu intensityMod=minus', () => {
    renderEnergyCheck();
    fireEvent.click(screen.getByRole('button', { name: /Exhausted/i }));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/energy-cause');
    expect(probe.textContent).toContain('"intensityMod":"minus"');
    expect(probe.textContent).toContain('"energyLevel":"obosit"');
  });
});

describe('EnergyCheck — readiness write (C2 engine wire)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getComputedReadinessScore is null BEFORE any selection (starved baseline)', () => {
    expect(getComputedReadinessScore()).toBeNull();
  });

  it('selecting an option makes getComputedReadinessScore non-null', () => {
    renderEnergyCheck();
    expect(getComputedReadinessScore()).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(getComputedReadinessScore()).not.toBeNull();
    expect(typeof getComputedReadinessScore()).toBe('number');
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
      fireEvent.click(screen.getByRole('button', { name }));
      expect(getTodayReadiness()).toBe(expected);
      unmount();
    }
  });

  it('higher readiness yields a higher computed score (monotonic wire)', () => {
    localStorage.clear();
    const a = renderEnergyCheck();
    fireEvent.click(screen.getByRole('button', { name: /Exhausted/i }));
    const lowScore = getComputedReadinessScore();
    a.unmount();

    localStorage.clear();
    const b = renderEnergyCheck();
    fireEvent.click(screen.getByRole('button', { name: /Excellent/i }));
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
