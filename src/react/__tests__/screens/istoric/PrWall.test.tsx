// PARITY-MISSING-SCREENS Wave 2e — PR Wall (PAR-001) tests.
// Per mockup andura-clasic.html L1241-1335 contract verify.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { PrWall } from '../../../routes/screens/istoric/PrWall';
import { useWorkoutStore } from '../../../stores/workoutStore';
import type { LastSessionSummary } from '../../../stores/workoutStore';

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
});

describe('PrWall — Recorduri Personale screen', () => {
  it('renders heading "Recorduri Personale"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Recorduri Personale/i, level: 1 })).toBeInTheDocument();
  });

  it('empty state when no PR records', () => {
    renderScreen();
    expect(screen.getByTestId('pr-wall-empty')).toBeInTheDocument();
    expect(screen.getByText(/Nu ai recorduri inca/i)).toBeInTheDocument();
  });

  it('renders 3-stat grid (Total PR / Luna asta / Exercitii) at zero', () => {
    renderScreen();
    expect(screen.getByTestId('pr-wall-stat-total')).toHaveTextContent('0');
    expect(screen.getByTestId('pr-wall-stat-month')).toHaveTextContent('0');
    expect(screen.getByTestId('pr-wall-stat-exercises')).toHaveTextContent('0');
  });

  it('aggregates Total PR + distinct exercises from sessionsHistory', () => {
    const t = Date.now();
    useWorkoutStore.setState({
      sessionsHistory: [
        makeSessionWithPR(t - 86400000 * 5, 'ex-1', 'Impins inclinat', 25, 10),
        makeSessionWithPR(t - 86400000 * 10, 'ex-2', 'Genuflexiuni', 80, 8),
        makeSessionWithPR(t - 86400000 * 15, 'ex-1', 'Impins inclinat', 22.5, 10),
      ],
    });
    renderScreen();
    expect(screen.getByTestId('pr-wall-stat-total')).toHaveTextContent('3');
    expect(screen.getByTestId('pr-wall-stat-exercises')).toHaveTextContent('2');
  });

  it('renders PR rows reverse-chrono (newest first)', () => {
    const t = Date.now();
    useWorkoutStore.setState({
      sessionsHistory: [
        makeSessionWithPR(t - 86400000 * 30, 'ex-old', 'Vechi', 50, 5),
        makeSessionWithPR(t - 86400000 * 1, 'ex-new', 'Nou', 60, 6),
      ],
    });
    renderScreen();
    const rows = screen.getAllByTestId(/^pr-wall-row-/);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Nou');
    expect(rows[1]).toHaveTextContent('Vechi');
  });

  it('back navigates la /app/istoric', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/istoric');
  });

  it('no diacritics in UI text', () => {
    const t = Date.now();
    useWorkoutStore.setState({
      sessionsHistory: [
        makeSessionWithPR(t - 1000, 'ex-1', 'Genuflexiuni', 80, 8),
      ],
    });
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
