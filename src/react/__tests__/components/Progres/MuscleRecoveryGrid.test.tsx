// MUSCLE RECOVERY GRID TESTS — Pulse net-new Progres zone (Big-11 ring grid).
// Verifies the engine recovery STATE (recovered/partial/fatigued) drives the
// per-group cell, that the grid renders one cell per Big-11 group, and that the
// data-honesty contract holds: no fabricated per-muscle percentage is printed —
// only the engine state surfaces (via data-recovery-state + the state label).

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MuscleRecoveryGrid } from '../../../components/Progres/MuscleRecoveryGrid';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { BIG11_GROUPS } from '../../../../engine/muscleRecovery.js';

const NOW = Date.now();
const HOUR = 3_600_000;

function setSessions(sessions: unknown): void {
  // sessionsHistory is the only field the grid reads.
  useWorkoutStore.setState({ sessionsHistory: sessions as never });
}

beforeEach(() => {
  setSessions([]);
  localStorage.clear();
});

describe('MuscleRecoveryGrid', () => {
  it('renders one ring cell per Big-11 group when sessions empty (all recovered)', () => {
    render(<MuscleRecoveryGrid />);
    expect(screen.getByTestId('muscle-recovery-grid')).toBeInTheDocument();
    // Empty logs → every group is 'recovered' (engine baseline).
    for (const group of BIG11_GROUPS) {
      const cell = screen.getByTestId(`recovery-cell-${group}`);
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveAttribute('data-recovery-state', 'recovered');
    }
  });

  it('marks piept stressed (partial/fatigued) after a recent heavy chest session', () => {
    // Recent Incline/Flat DB Press load the chest → engine moves piept out of
    // 'recovered' into a stressed state (partial or fatigued depending on the
    // accumulated set-stress; mirrors the engine's own umeri assertion style).
    setSessions([
      {
        title: 'Piept',
        meta: '',
        ts: NOW,
        exercises: [
          {
            exerciseId: 'incline-db-press',
            exerciseName: 'Incline DB Press',
            totalVolume: 0,
            peakOneRM: 0,
            sets: [
              { kg: 30, reps: 8, rating: 'greu', timestamp: NOW - 2 * HOUR },
              { kg: 30, reps: 8, rating: 'greu', timestamp: NOW - 2 * HOUR },
            ],
          },
          {
            exerciseId: 'flat-db-press',
            exerciseName: 'Flat DB Press',
            totalVolume: 0,
            peakOneRM: 0,
            sets: [{ kg: 32, reps: 8, rating: 'greu', timestamp: NOW - 2 * HOUR }],
          },
        ],
      },
    ]);
    render(<MuscleRecoveryGrid />);
    const state = screen
      .getByTestId('recovery-cell-piept')
      .getAttribute('data-recovery-state');
    expect(['partial', 'fatigued']).toContain(state);
  });

  it('does NOT print a fabricated per-muscle percentage (data honesty)', () => {
    // The engine returns a discrete state, not a %. The cell must not surface a
    // numeric "NN%" measurement — only the state label + color encode recovery.
    const { container } = render(<MuscleRecoveryGrid />);
    expect(container.textContent ?? '').not.toMatch(/\d+%/);
  });

  it('no diacritics in UI (D-LEGACY-064)', () => {
    const { container } = render(<MuscleRecoveryGrid />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
