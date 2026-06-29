// Exercise Library — Cont › General drill-down sub-screen tests (CORE_AUTO by
// muscle group). Mirrors the SettingsAppearance test scaffold: RO locale pin so
// assertions read the RO copy; MemoryRouter with a LocationProbe for the back-to-
// Cont navigation at the top level.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ExerciseLibrary } from '../../../routes/screens/cont/ExerciseLibrary';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';
import { isEquipmentMissingExercise } from '../../../../engine/schedule/scheduleAdapter.js';

beforeEach(() => {
  try {
    localStorage.removeItem('sf.locale');
    localStorage.removeItem('wv2-equipment-missing-exercises');
  } catch { /* jsdom */ }
  _resetI18nCache();
  setLocale('ro');
});

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/exercise-library']}>
      <Routes>
        <Route path="/app/cont/exercise-library" element={<ExerciseLibrary />} />
        <Route path="/app/cont" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ExerciseLibrary — group list (level 1)', () => {
  it('renders the library title heading', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: 'Biblioteca de exercitii', level: 1 })).toBeInTheDocument();
  });

  it('shows muscle-group rows with a count (piept group present)', () => {
    renderScreen();
    const piept = screen.getByTestId('exercise-library-group-piept');
    expect(piept).toBeInTheDocument();
    expect(piept.textContent).toMatch(/Piept/);
    expect(piept.textContent).toMatch(/exercit/i); // "{n} exercitii"
  });

  it('renders multiple muscle groups (spate, biceps, triceps, fese, core)', () => {
    renderScreen();
    for (const g of ['spate', 'biceps', 'triceps', 'fese', 'core']) {
      expect(screen.getByTestId(`exercise-library-group-${g}`)).toBeInTheDocument();
    }
  });

  it('back at the group list navigates to /app/cont', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('exercise-library-back'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont');
  });
});

describe('ExerciseLibrary — drill into a group (level 2)', () => {
  it('tapping "piept" shows its CORE_AUTO exercises (Flat Barbell Bench RO name)', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('exercise-library-group-piept'));
    const list = screen.getByTestId('exercise-library-list-piept');
    expect(list).toBeInTheDocument();
    // Flat Barbell Bench is CORE_AUTO under piept; RO display "Impins din piept".
    const item = screen.getByTestId('exercise-library-item-Flat Barbell Bench');
    expect(within(item).getByText(/Impins din piept/)).toBeInTheDocument();
  });

  it('does NOT list a non-CORE_AUTO exercise (Single-Arm DB Press)', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('exercise-library-group-umeri'));
    expect(screen.queryByTestId('exercise-library-item-Single-Arm DB Press')).not.toBeInTheDocument();
  });

  it('back from a group returns to the group list (in-screen drill-up, NOT /app/cont)', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('exercise-library-group-piept'));
    expect(screen.getByTestId('exercise-library-list-piept')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('exercise-library-back'));
    // Back to level 1 group list; still no navigation away.
    expect(screen.getByTestId('exercise-library-group-piept')).toBeInTheDocument();
    expect(screen.queryByTestId('probe')).not.toBeInTheDocument();
  });

  it('tapping an exercise reveals the inline detail (secondary / equipment / tier)', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('exercise-library-group-piept'));
    fireEvent.click(screen.getByTestId('exercise-library-item-Flat Barbell Bench'));
    const detail = screen.getByTestId('exercise-library-detail-Flat Barbell Bench');
    expect(detail).toBeInTheDocument();
    expect(detail.textContent).toMatch(/Echipament/);
    expect(detail.textContent).toMatch(/Nivel/);
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    fireEvent.click(screen.getByTestId('exercise-library-group-piept'));
    fireEvent.click(screen.getByTestId('exercise-library-item-Flat Barbell Bench'));
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});

describe('ExerciseLibrary — "Nu pot face asta" per-exercise exclude', () => {
  function openBenchDetail(): void {
    renderScreen();
    fireEvent.click(screen.getByTestId('exercise-library-group-piept'));
    fireEvent.click(screen.getByTestId('exercise-library-item-Flat Barbell Bench'));
  }

  it('the inline detail offers a "Nu pot face asta" action', () => {
    openBenchDetail();
    const btn = screen.getByTestId('exercise-library-cantdo-Flat Barbell Bench');
    expect(btn.textContent).toMatch(/Nu pot face asta/);
  });

  it('tapping it hard-excludes the exercise (store written + UI flips to "Il pun la loc" + row tagged)', () => {
    openBenchDetail();
    fireEvent.click(screen.getByTestId('exercise-library-cantdo-Flat Barbell Bench'));
    expect(isEquipmentMissingExercise('Flat Barbell Bench')).toBe(true);
    expect(screen.getByTestId('exercise-library-cantdo-Flat Barbell Bench').textContent).toMatch(/pun la loc/);
    const item = screen.getByTestId('exercise-library-item-Flat Barbell Bench');
    expect(within(item).getByText(/Exclus din recomandari/)).toBeInTheDocument();
  });

  it('tapping again puts it back (removed from the store)', () => {
    openBenchDetail();
    fireEvent.click(screen.getByTestId('exercise-library-cantdo-Flat Barbell Bench'));
    expect(isEquipmentMissingExercise('Flat Barbell Bench')).toBe(true);
    fireEvent.click(screen.getByTestId('exercise-library-cantdo-Flat Barbell Bench'));
    expect(isEquipmentMissingExercise('Flat Barbell Bench')).toBe(false);
  });
});
