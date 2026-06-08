// ══ TIME BUDGET TESTS — #69 pre-workout reframe time step ════════════════
// The time-budget chips moved OFF EnergyCheck onto this dedicated step. Verifies
// chip selection writes sessionTimeBudgetMin (the engine read-side) + Continue
// proceeds to workout-preview. MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TimeBudget } from '../../../routes/screens/antrenor/TimeBudget';
import { useWorkoutStore } from '../../../stores/workoutStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderTimeBudget() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/time-budget']}>
      <Routes>
        <Route path="/app/antrenor/time-budget" element={<TimeBudget />} />
        <Route path="/app/antrenor/workout-preview" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('TimeBudget — render', () => {
  beforeEach(() => {
    useWorkoutStore.setState({ sessionTimeBudgetMin: null });
  });

  it('renders the four time chips + No limit + Continue (EN default)', () => {
    renderTimeBudget();
    expect(screen.getByTestId('time-chip-30')).toBeInTheDocument();
    expect(screen.getByTestId('time-chip-45')).toBeInTheDocument();
    expect(screen.getByTestId('time-chip-60')).toBeInTheDocument();
    expect(screen.getByTestId('time-chip-90')).toBeInTheDocument();
    expect(screen.getByTestId('time-chip-nolimit')).toBeInTheDocument();
    expect(screen.getByTestId('time-budget-continue')).toBeInTheDocument();
  });

  it('renders the SubHeader back button', () => {
    renderTimeBudget();
    expect(screen.getByTestId('time-budget-back')).toBeInTheDocument();
  });

  it('No limit is selected by default (sessionTimeBudgetMin null)', () => {
    renderTimeBudget();
    expect(screen.getByTestId('time-chip-nolimit')).toHaveAttribute('data-selected', 'true');
  });
});

describe('TimeBudget — sessionTimeBudgetMin write (engine read-side)', () => {
  beforeEach(() => {
    useWorkoutStore.setState({ sessionTimeBudgetMin: null });
  });

  it('picking a chip sets sessionTimeBudgetMin BEFORE composition', () => {
    renderTimeBudget();
    expect(useWorkoutStore.getState().sessionTimeBudgetMin).toBeNull();
    fireEvent.click(screen.getByTestId('time-chip-45'));
    expect(useWorkoutStore.getState().sessionTimeBudgetMin).toBe(45);
  });

  it('tapping the same chip again toggles back to no-limit (null)', () => {
    renderTimeBudget();
    fireEvent.click(screen.getByTestId('time-chip-60'));
    expect(useWorkoutStore.getState().sessionTimeBudgetMin).toBe(60);
    fireEvent.click(screen.getByTestId('time-chip-60'));
    expect(useWorkoutStore.getState().sessionTimeBudgetMin).toBeNull();
  });

  it('No limit clears any prior pick', () => {
    renderTimeBudget();
    fireEvent.click(screen.getByTestId('time-chip-90'));
    expect(useWorkoutStore.getState().sessionTimeBudgetMin).toBe(90);
    fireEvent.click(screen.getByTestId('time-chip-nolimit'));
    expect(useWorkoutStore.getState().sessionTimeBudgetMin).toBeNull();
  });
});

describe('TimeBudget — navigation', () => {
  beforeEach(() => {
    useWorkoutStore.setState({ sessionTimeBudgetMin: null });
  });

  it('Continue → workout-preview (the pick already committed to the store)', () => {
    renderTimeBudget();
    fireEvent.click(screen.getByTestId('time-chip-30'));
    fireEvent.click(screen.getByTestId('time-budget-continue'));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    // The chosen budget survives to where composePlannedWorkoutToday reads it.
    expect(useWorkoutStore.getState().sessionTimeBudgetMin).toBe(30);
  });
});

describe('TimeBudget — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    useWorkoutStore.setState({ sessionTimeBudgetMin: null });
    const { container } = renderTimeBudget();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
