// PARITY-MISSING-SCREENS Wave 2e — PR Wall (PAR-001) tests.
// Per mockup andura-clasic.html L1241-1335 contract verify.
// Wave E3 i18n: heading + empty-state + back aria flipped to EN-default.
// RO opt-in covered in a dedicated block at the bottom.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { PrWall } from '../../../routes/screens/istoric/PrWall';
import { useWorkoutStore } from '../../../stores/workoutStore';
import type { LastSessionSummary } from '../../../stores/workoutStore';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/istoric/pr-wall']}>
      <Routes>
        <Route path="/app/istoric/pr-wall" element={<PrWall />} />
        <Route path="/app/istoric" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

function makeSessionWithPR(
  ts: number,
  exerciseId: string,
  exerciseName: string,
  kg: number,
  reps: number
): LastSessionSummary {
  return {
    ts,
    title: 'Sesiune',
    meta: '5 ex.',
    exercises: [
      {
        exerciseId,
        exerciseName,
        peakOneRM: kg * 1.2,
        totalVolume: kg * reps,
        sets: [
          { kg, reps, isPR: true, rating: 'potrivit', timestamp: ts },
        ],
      },
    ],
  };
}

beforeEach(() => {
  useWorkoutStore.setState({ sessionsHistory: [] });
  setLocale('en');
  _resetI18nCache();
  setLocale('en');
});

afterEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
});

describe('PrWall — Personal Records screen (EN default)', () => {
  it('renders heading "Personal Records"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Personal Records/i, level: 1 })).toBeInTheDocument();
  });

  it('empty state when no PR records (EN copy)', () => {
    renderScreen();
    expect(screen.getByTestId('pr-wall-empty')).toBeInTheDocument();
    expect(screen.getByText(/Your first PR is one session away/i)).toBeInTheDocument();
  });

  it('renders 3-stat grid (Total PR / This month / Exercises) at zero', () => {
    renderScreen();
    expect(screen.getByTestId('pr-wall-stat-total')).toHaveTextContent('0');
    expect(screen.getByTestId('pr-wall-stat-month')).toHaveTextContent('0');
    expect(screen.getByTestId('pr-wall-stat-exercises')).toHaveTextContent('0');
  });

  it('aggregates Total PR + distinct exercises from sessionsHistory', () => {
    const tNow = Date.now();
    useWorkoutStore.setState({
      sessionsHistory: [
        makeSessionWithPR(tNow - 86400000 * 5, 'ex-1', 'Impins inclinat', 25, 10),
        makeSessionWithPR(tNow - 86400000 * 10, 'ex-2', 'Genuflexiuni', 80, 8),
        makeSessionWithPR(tNow - 86400000 * 15, 'ex-1', 'Impins inclinat', 22.5, 10),
      ],
    });
    renderScreen();
    expect(screen.getByTestId('pr-wall-stat-total')).toHaveTextContent('3');
    expect(screen.getByTestId('pr-wall-stat-exercises')).toHaveTextContent('2');
  });

  it('renders PR rows reverse-chrono (newest first)', () => {
    const tNow = Date.now();
    useWorkoutStore.setState({
      sessionsHistory: [
        makeSessionWithPR(tNow - 86400000 * 30, 'ex-old', 'Vechi', 50, 5),
        makeSessionWithPR(tNow - 86400000 * 1, 'ex-new', 'Nou', 60, 6),
      ],
    });
    renderScreen();
    const rows = screen.getAllByTestId(/^pr-wall-row-/);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Nou');
    expect(rows[1]).toHaveTextContent('Vechi');
  });

  it('row date renders a real formatted date, not the i18n key', () => {
    // 2024-03-15 12:00 local — day 15, month index 2 (Mar), year 2024.
    const ts = new Date(2024, 2, 15, 12, 0, 0).getTime();
    useWorkoutStore.setState({
      sessionsHistory: [makeSessionWithPR(ts, 'ex-1', 'Impins', 40, 5)],
    });
    renderScreen();
    const row = screen.getByTestId('pr-wall-row-0');
    // Regression guard: literal key leaked when format lived under wrong namespace.
    expect(row).not.toHaveTextContent('prDate.format');
    expect(row).not.toHaveTextContent('istoric.prDate.format');
    // EN format "{day} {month} {year}" with months.short[2] = "Mar".
    expect(row).toHaveTextContent(/15 Mar 2024/);
  });

  it('back navigates la /app/istoric (uses pr-wall-back testid)', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('pr-wall-back'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/istoric');
  });

  it('no diacritics in UI text', () => {
    const tNow = Date.now();
    useWorkoutStore.setState({
      sessionsHistory: [
        makeSessionWithPR(tNow - 1000, 'ex-1', 'Genuflexiuni', 80, 8),
      ],
    });
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});

describe('PrWall — RO locale opt-in', () => {
  beforeEach(() => {
    setLocale('ro');
    _resetI18nCache();
    setLocale('ro');
  });

  it('renders RO heading "Recorduri Personale" + RO empty copy', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Recorduri Personale/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Primul PR e la o sesiune distanta/i)).toBeInTheDocument();
  });
});
