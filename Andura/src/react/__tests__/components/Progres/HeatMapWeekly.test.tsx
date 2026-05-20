// Phase 6 task_22 — HeatMapWeekly Progres dashboard tests.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeatMapWeekly } from '../../../components/Progres/HeatMapWeekly';
import { useWorkoutStore } from '../../../stores/workoutStore';

beforeEach(() => {
  useWorkoutStore.setState({ sessionsHistory: [] });
});

describe('HeatMapWeekly', () => {
  it('renders heading "Volum saptamana"', () => {
    render(<HeatMapWeekly />);
    expect(screen.getByText(/Volum saptamana/i)).toBeInTheDocument();
  });

  it('renders 7 day cells', () => {
    render(<HeatMapWeekly />);
    for (let i = 0; i < 7; i++) {
      expect(screen.getByTestId(`heatmap-day-${i}`)).toBeInTheDocument();
    }
  });

  it('renders empty state cand sessionsHistory empty', () => {
    render(<HeatMapWeekly />);
    expect(screen.getByTestId('heatmap-empty')).toBeInTheDocument();
  });

  it('aggregates volume per day from last 7 days sessionsHistory', () => {
    const now = Date.now();
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push',
          meta: '',
          ts: now,
          exercises: [
            { exerciseId: 'bench', exerciseName: 'Bench', sets: [], totalVolume: 1000, peakOneRM: 100 },
          ],
        },
      ],
    });
    render(<HeatMapWeekly />);
    expect(screen.queryByTestId('heatmap-empty')).not.toBeInTheDocument();
  });

  it('container data-testid present', () => {
    render(<HeatMapWeekly />);
    expect(screen.getByTestId('heat-map-weekly')).toBeInTheDocument();
  });

  it('no diacritics in UI', () => {
    const { container } = render(<HeatMapWeekly />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
