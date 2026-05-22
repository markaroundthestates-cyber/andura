// ══ CALENDAR HEATMAP TESTS — F-istoric-01 ════════════════════════════════
// 7 cases per spec §9.1.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarHeatmap } from '../../../components/Istoric/CalendarHeatmap';
import { useWorkoutStore } from '../../../stores/workoutStore';

const CAL_MONTHS = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
] as const;

beforeEach(() => {
  useWorkoutStore.setState({ sessionsHistory: [] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CalendarHeatmap — render basics', () => {
  it('renders heading with current month/year', () => {
    const now = new Date();
    render(<CalendarHeatmap />);
    const label = screen.getByTestId('cal-month-label');
    expect(label.textContent).toContain(CAL_MONTHS[now.getMonth()]);
    expect(label.textContent).toContain(String(now.getFullYear()));
  });

  it('renders 7 day-label headers L Ma Mi J V S D', () => {
    const { container } = render(<CalendarHeatmap />);
    const headerLabels = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'];
    headerLabels.forEach((lbl) => {
      // Day labels are direct text nodes in header row
      const matches = Array.from(container.querySelectorAll('div')).filter(
        (el) => el.textContent === lbl
      );
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it('container data-testid present', () => {
    render(<CalendarHeatmap />);
    expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
  });
});

describe('CalendarHeatmap — month navigation', () => {
  it('clicks chevron-right advances month label', () => {
    // Use fake current date so behavior deterministic.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15)); // Mai 2026
    render(<CalendarHeatmap />);
    expect(screen.getByTestId('cal-month-label').textContent).toBe('Mai 2026');
    fireEvent.click(screen.getByTestId('cal-next'));
    expect(screen.getByTestId('cal-month-label').textContent).toBe('Iunie 2026');
  });

  it('clicks chevron-left from Ianuarie wraps Decembrie prev year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15)); // Ianuarie 2026
    render(<CalendarHeatmap />);
    expect(screen.getByTestId('cal-month-label').textContent).toBe('Ianuarie 2026');
    fireEvent.click(screen.getByTestId('cal-prev'));
    expect(screen.getByTestId('cal-month-label').textContent).toBe('Decembrie 2025');
  });
});

describe('CalendarHeatmap — cell paint from sessionsHistory', () => {
  it('empty sessionsHistory → all day cells render zi libera (no l1/l2/l3 tier)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15));
    useWorkoutStore.setState({ sessionsHistory: [] });
    const { container } = render(<CalendarHeatmap />);
    const tierCells = container.querySelectorAll('[data-tier="l1"], [data-tier="l2"], [data-tier="l3"]');
    expect(tierCells.length).toBe(0);
  });

  it('seeds 1 session ts=today rating=greu → cell has l3 tier + greu aria-label', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15, 10)); // Mai 15 2026 10am
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push',
          meta: '',
          ts: new Date(2026, 4, 15, 10).getTime(),
          exercises: [
            {
              exerciseId: 'bench',
              exerciseName: 'Bench',
              sets: [
                { kg: 100, reps: 5, rating: 'greu', timestamp: 0 },
                { kg: 100, reps: 5, rating: 'greu', timestamp: 0 },
              ],
              totalVolume: 1000,
              peakOneRM: 100,
            },
          ],
        },
      ],
    });
    render(<CalendarHeatmap />);
    const cell = screen.getByTestId('cal-cell-15');
    expect(cell.getAttribute('data-tier')).toBe('l3');
    expect(cell.getAttribute('aria-label')).toContain('antrenament greu');
  });
});

describe('CalendarHeatmap — accessibility invariants', () => {
  it('no diacritics in textContent', () => {
    const { container } = render(<CalendarHeatmap />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
