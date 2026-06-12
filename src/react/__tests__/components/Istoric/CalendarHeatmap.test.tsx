// ══ CALENDAR HEATMAP TESTS — F-istoric-01 ════════════════════════════════
// Wave E3 i18n: month labels + day-letters + cell semantics flipped to EN
// default. RO labels covered via dedicated RO-locale block below.
// 7 cases per spec §9.1.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarHeatmap } from '../../../components/Istoric/CalendarHeatmap';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useAerobicStore } from '../../../stores/aerobicStore';
import type { AerobicSession } from '../../../stores/aerobicStore';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

function aerobicOn(date: string): AerobicSession {
  return { date, type: 'aerobic', minutes: 50, kcal: 300, ts: Date.now() };
}

const CAL_MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

beforeEach(() => {
  useWorkoutStore.setState({ sessionsHistory: [] });
  useAerobicStore.setState({ sessions: [] });
  setLocale('en');
  _resetI18nCache();
  setLocale('en');
});

afterEach(() => {
  vi.useRealTimers();
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
});

describe('CalendarHeatmap — render basics', () => {
  it('renders heading with current month/year (EN default)', () => {
    const now = new Date();
    render(<CalendarHeatmap />);
    const label = screen.getByTestId('cal-month-label');
    expect(label.textContent).toContain(CAL_MONTHS_EN[now.getMonth()]);
    expect(label.textContent).toContain(String(now.getFullYear()));
  });

  it('renders 7 day-label headers (Monday-first single-letter EN)', () => {
    const { container } = render(<CalendarHeatmap />);
    // EN day-letters: M T W T F S S (Monday-first). RO would be L Ma Mi J V S D.
    const headerGrid = container.querySelector('.grid.grid-cols-7.gap-1.mb-1\\.5');
    expect(headerGrid).not.toBeNull();
    const cells = headerGrid?.querySelectorAll('div') ?? [];
    const text = Array.from(cells).map((el) => el.textContent ?? '');
    expect(text).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
  });

  it('container data-testid present', () => {
    render(<CalendarHeatmap />);
    expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
  });
});

describe('CalendarHeatmap — month navigation (EN default)', () => {
  it('clicks chevron-right advances month label', () => {
    // Use fake current date so behavior deterministic.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15)); // May 2026
    render(<CalendarHeatmap />);
    expect(screen.getByTestId('cal-month-label').textContent).toBe('May 2026');
    fireEvent.click(screen.getByTestId('cal-next'));
    expect(screen.getByTestId('cal-month-label').textContent).toBe('June 2026');
  });

  it('clicks chevron-left from January wraps December prev year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15)); // January 2026
    render(<CalendarHeatmap />);
    expect(screen.getByTestId('cal-month-label').textContent).toBe('January 2026');
    fireEvent.click(screen.getByTestId('cal-prev'));
    expect(screen.getByTestId('cal-month-label').textContent).toBe('December 2025');
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

  it('seeds 1 session ts=today rating=greu → cell has l3 tier + hard-session aria-label (EN)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15, 10)); // May 15 2026 10am
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
    expect(cell.getAttribute('aria-label')).toContain('hard session');
  });
});

describe('CalendarHeatmap — RO locale opt-in', () => {
  beforeEach(() => {
    setLocale('ro');
    _resetI18nCache();
    setLocale('ro');
  });

  it('renders RO month label under RO locale', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15));
    render(<CalendarHeatmap />);
    expect(screen.getByTestId('cal-month-label').textContent).toBe('Mai 2026');
  });

  it('RO cell aria-label uses "antrenament greu" for hard sessions', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15, 10));
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
              sets: [{ kg: 100, reps: 5, rating: 'greu', timestamp: 0 }],
              totalVolume: 500,
              peakOneRM: 100,
            },
          ],
        },
      ],
    });
    render(<CalendarHeatmap />);
    const cell = screen.getByTestId('cal-cell-15');
    expect(cell.getAttribute('aria-label')).toContain('antrenament greu');
  });
});

describe('CalendarHeatmap — aerobic-class overlay (2026-05-30)', () => {
  it('aerobic-only day shows aerobic marker + aria-label, no gym tier', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15, 10));
    // Aerobic-only user: empty gym history, one aerobic class on the 12th.
    useWorkoutStore.setState({ sessionsHistory: [] });
    useAerobicStore.setState({ sessions: [aerobicOn('2026-05-12')] });
    render(<CalendarHeatmap />);
    const cell = screen.getByTestId('cal-cell-12');
    expect(cell.getAttribute('data-aerobic')).toBe('true');
    // No gym session that day → zi-libera tier (no gym dot).
    expect(cell.getAttribute('data-tier')).toBe('zi-libera');
    expect(screen.getByTestId('cal-aerobic-12')).toBeInTheDocument();
    expect(screen.queryByTestId('cal-dot-12')).not.toBeInTheDocument();
    expect(cell.getAttribute('aria-label')).toContain('aerobic class');
  });

  it('both day (gym + aerobic) shows BOTH the gym dot and the aerobic marker', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15, 10));
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push',
          meta: '',
          ts: new Date(2026, 4, 12, 10).getTime(),
          exercises: [
            {
              exerciseId: 'bench',
              exerciseName: 'Bench',
              sets: [{ kg: 100, reps: 5, rating: 'greu', timestamp: 0 }],
              totalVolume: 500,
              peakOneRM: 100,
            },
          ],
        },
      ],
    });
    useAerobicStore.setState({ sessions: [aerobicOn('2026-05-12')] });
    render(<CalendarHeatmap />);
    const cell = screen.getByTestId('cal-cell-12');
    expect(cell.getAttribute('data-aerobic')).toBe('true');
    expect(cell.getAttribute('data-tier')).toBe('l3'); // gym hard preserved
    expect(screen.getByTestId('cal-dot-12')).toBeInTheDocument();
    expect(screen.getByTestId('cal-aerobic-12')).toBeInTheDocument();
  });

  it('gym-only user is unaffected — no aerobic marker, no data-aerobic', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15, 10));
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push',
          meta: '',
          ts: new Date(2026, 4, 12, 10).getTime(),
          exercises: [
            {
              exerciseId: 'bench',
              exerciseName: 'Bench',
              sets: [{ kg: 100, reps: 5, rating: 'greu', timestamp: 0 }],
              totalVolume: 500,
              peakOneRM: 100,
            },
          ],
        },
      ],
    });
    useAerobicStore.setState({ sessions: [] });
    render(<CalendarHeatmap />);
    const cell = screen.getByTestId('cal-cell-12');
    expect(cell.getAttribute('data-aerobic')).toBeNull();
    expect(screen.queryByTestId('cal-aerobic-12')).not.toBeInTheDocument();
    expect(screen.getByTestId('cal-dot-12')).toBeInTheDocument();
  });

  it('legend has NO gym entry (founder 2026-06-12) and keeps the violet aerobic ring', () => {
    setLocale('ro');
    _resetI18nCache();
    setLocale('ro');
    render(<CalendarHeatmap />);
    // "gym - scos": the intensity dots ARE the gym days; the synonym swatch
    // duplicated easy's volt and made the legend unreadable.
    expect(screen.queryByTestId('cal-legend-gym')).not.toBeInTheDocument();
    const aerobic = screen.getByTestId('cal-legend-aerobic');
    expect(aerobic.textContent).toContain('Aerobic');
    // Aerobic moved aqua → violet so it can never read as "normal".
    expect(aerobic.innerHTML).toContain('--violet');
  });
});

describe('CalendarHeatmap — rest-day glyph (2026-06-04)', () => {
  it('past day with no session + no aerobic shows the rest glyph', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15, 10));
    // Empty history → every past day is a rest day. The 12th (< the 15th) must
    // carry the rest glyph matching the legend swatch.
    render(<CalendarHeatmap />);
    expect(screen.getByTestId('cal-rest-12')).toBeInTheDocument();
    // No session/aerobic mark on that day.
    expect(screen.queryByTestId('cal-dot-12')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cal-aerobic-12')).not.toBeInTheDocument();
  });

  it('today gets no rest glyph', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15, 10));
    render(<CalendarHeatmap />);
    expect(screen.queryByTestId('cal-rest-15')).not.toBeInTheDocument();
  });

  it('future day gets no rest glyph', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15, 10));
    render(<CalendarHeatmap />);
    expect(screen.queryByTestId('cal-rest-20')).not.toBeInTheDocument();
  });

  it('past day with a logged session gets no rest glyph', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15, 10));
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push',
          meta: '',
          ts: new Date(2026, 4, 12, 10).getTime(),
          exercises: [
            {
              exerciseId: 'bench',
              exerciseName: 'Bench',
              sets: [{ kg: 100, reps: 5, rating: 'greu', timestamp: 0 }],
              totalVolume: 500,
              peakOneRM: 100,
            },
          ],
        },
      ],
    });
    render(<CalendarHeatmap />);
    expect(screen.queryByTestId('cal-rest-12')).not.toBeInTheDocument();
    expect(screen.getByTestId('cal-dot-12')).toBeInTheDocument();
  });

  it('past aerobic-only day gets no rest glyph', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15, 10));
    useAerobicStore.setState({ sessions: [aerobicOn('2026-05-12')] });
    render(<CalendarHeatmap />);
    expect(screen.queryByTestId('cal-rest-12')).not.toBeInTheDocument();
    expect(screen.getByTestId('cal-aerobic-12')).toBeInTheDocument();
  });
});

describe('CalendarHeatmap — accessibility invariants', () => {
  it('no diacritics in textContent', () => {
    const { container } = render(<CalendarHeatmap />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
