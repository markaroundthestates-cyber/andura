// ══ WORKOUT TESTS — task_08 state machine UI + timers + exit flows ═══════
// MemoryRouter jsdom paradigm per D020. vi.useFakeTimers pentru session +
// rest countdown advance.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// Mock engineWrappers BEFORE Workout import (hoisted vi.mock).
vi.mock('../../../lib/engineWrappers', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/engineWrappers')>(
    '../../../lib/engineWrappers'
  );
  return {
    ...actual,
    getPRDelta: vi.fn(() => null), // default no PR; per-test override
  };
});

import { Workout } from '../../../routes/screens/antrenor/Workout';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { getPRDelta } from '../../../lib/engineWrappers';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderWorkout() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/workout']}>
      <Routes>
        <Route path="/app/antrenor/workout" element={<Workout />} />
        <Route path="/app/antrenor/post-rpe" element={<LocationProbe />} />
        <Route path="/app/antrenor" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

function resetStore(): void {
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    prHit: false,
    prData: null,
    history: {},
    sessionStart: null,
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    streak: 0,
  });
  localStorage.clear();
  vi.mocked(getPRDelta).mockReturnValue(null);
}

describe('Workout — base render (phase=idle init → logging)', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders Workout section cu data-phase attribute', () => {
    renderWorkout();
    expect(screen.getByTestId('workout')).toBeInTheDocument();
  });

  it('renders header cu first exercise title "Bench Press"', () => {
    renderWorkout();
    expect(screen.getByTestId('workout-title')).toHaveTextContent('Bench Press');
  });

  it('renders progress "Ex 1/5"', () => {
    renderWorkout();
    expect(screen.getByTestId('workout-progress')).toHaveTextContent('Ex 1/5');
  });

  it('startSession kicks off auto (phase becomes logging post-mount)', () => {
    renderWorkout();
    expect(useWorkoutStore.getState().phase).toBe('logging');
    expect(useWorkoutStore.getState().sessionStart).not.toBeNull();
  });

  it('renders log zone cu set counter "Set 1/4"', () => {
    renderWorkout();
    expect(screen.getByTestId('log-zone')).toBeInTheDocument();
    expect(screen.getByTestId('log-zone')).toHaveTextContent('Set 1/4');
  });

  it('renders kg + reps inputs cu default target values', () => {
    renderWorkout();
    expect(screen.getByTestId('kg-input')).toHaveValue(22.5);
    expect(screen.getByTestId('reps-input')).toHaveValue(10);
  });

  it('renders 3 rating buttons (Usor / Potrivit / Greu)', () => {
    renderWorkout();
    expect(screen.getByRole('button', { name: /^Usor$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Potrivit$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Greu$/i })).toBeInTheDocument();
  });

  it('renders exit X button cu accessible name', () => {
    renderWorkout();
    expect(screen.getByTestId('workout-exit-trigger')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Iesi din sesiune/i })
    ).toBeInTheDocument();
  });
});

describe('Workout — state machine logging → rest', () => {
  beforeEach(() => {
    resetStore();
  });

  it('rating set 1 of 4 advances phase la rest', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    expect(useWorkoutStore.getState().phase).toBe('rest');
  });

  it('rest overlay rendered cu countdown', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    expect(screen.getByTestId('rest-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('rest-countdown')).toBeInTheDocument();
  });

  it('rest countdown starts at exercise restSec (Bench Press = 90s = 1:30)', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    expect(screen.getByTestId('rest-countdown')).toHaveTextContent('1:30');
  });

  it('logSet persists kg + reps + rating la history', () => {
    renderWorkout();
    const kgInput = screen.getByTestId('kg-input');
    const repsInput = screen.getByTestId('reps-input');
    fireEvent.change(kgInput, { target: { value: '25' } });
    fireEvent.change(repsInput, { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: /^Greu$/i }));
    const hist = useWorkoutStore.getState().history[0];
    expect(hist).toHaveLength(1);
    expect(hist[0]).toEqual({ kg: 25, reps: 8, rating: 'greu' });
  });

  it('skip rest button transitions phase back la logging', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    expect(useWorkoutStore.getState().phase).toBe('rest');
    fireEvent.click(screen.getByTestId('rest-skip'));
    expect(useWorkoutStore.getState().phase).toBe('logging');
  });

  it('set history renders previous sets în log zone', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    fireEvent.click(screen.getByTestId('rest-skip'));
    expect(screen.getByTestId('set-history-0')).toHaveTextContent(/22.5 kg x 10 reps - usor/);
  });

  it('set counter advances "Set 2/4" after first set logged', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    fireEvent.click(screen.getByTestId('rest-skip'));
    expect(screen.getByTestId('log-zone')).toHaveTextContent('Set 2/4');
  });
});

describe('Workout — rest countdown timer (fake timers)', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rest countdown decrements each second', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    expect(screen.getByTestId('rest-countdown')).toHaveTextContent('1:30');
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId('rest-countdown')).toHaveTextContent('1:27');
  });

  it('rest countdown reaching 0 auto-advances phase la logging', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    act(() => {
      vi.advanceTimersByTime(91000);
    });
    expect(useWorkoutStore.getState().phase).toBe('logging');
  });
});

describe('Workout — state machine transition + advance exercise', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('logging last set of exercise (4 of 4 Bench Press) → transition phase', () => {
    renderWorkout();
    // Log 4 sets: rest skips between
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
      if (i < 3) fireEvent.click(screen.getByTestId('rest-skip'));
    }
    expect(useWorkoutStore.getState().phase).toBe('transition');
    expect(screen.getByTestId('transition-screen')).toBeInTheDocument();
  });

  it('transition phase shows next exercise name', () => {
    renderWorkout();
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
      if (i < 3) fireEvent.click(screen.getByTestId('rest-skip'));
    }
    expect(screen.getByTestId('transition-next-name')).toHaveTextContent('Overhead Press');
  });

  it('transition advances exIdx after 1.5s', () => {
    renderWorkout();
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
      if (i < 3) fireEvent.click(screen.getByTestId('rest-skip'));
    }
    expect(useWorkoutStore.getState().exIdx).toBe(0);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(useWorkoutStore.getState().exIdx).toBe(1);
    expect(useWorkoutStore.getState().phase).toBe('logging');
  });
});

describe('Workout — finish last set of last exercise navigates post-rpe', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('logging last set of last exercise (Tricep Pushdown set 3/3) navigates post-rpe', () => {
    // Seed store directly la exIdx=4 (Tricep Pushdown, last exercise) cu 2 sets logged.
    useWorkoutStore.setState({
      exIdx: 4,
      phase: 'logging',
      history: {
        4: [
          { kg: 25, reps: 12, rating: 'potrivit' },
          { kg: 25, reps: 12, rating: 'potrivit' },
        ],
      },
      sessionStart: Date.now() - 1000,
    });
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/post-rpe'
    );
  });
});

describe('Workout — exit confirm 3-option sheet', () => {
  beforeEach(() => {
    resetStore();
  });

  it('exit X opens sheet', () => {
    renderWorkout();
    expect(screen.queryByTestId('exit-sheet')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('workout-exit-trigger'));
    expect(screen.getByTestId('exit-sheet')).toBeInTheDocument();
  });

  it('sheet shows 3 options Continui / Salveaza / Renunt', () => {
    renderWorkout();
    fireEvent.click(screen.getByTestId('workout-exit-trigger'));
    expect(screen.getByTestId('exit-continue')).toBeInTheDocument();
    expect(screen.getByTestId('exit-pause')).toBeInTheDocument();
    expect(screen.getByTestId('exit-discard')).toBeInTheDocument();
  });

  it('Continui closes sheet, no navigation', () => {
    renderWorkout();
    fireEvent.click(screen.getByTestId('workout-exit-trigger'));
    fireEvent.click(screen.getByTestId('exit-continue'));
    expect(screen.queryByTestId('exit-sheet')).not.toBeInTheDocument();
    expect(screen.queryByTestId('probe')).not.toBeInTheDocument();
  });

  it('Salveaza pause stores pausedSnapshot + navigates antrenor', () => {
    renderWorkout();
    // Log one set so we have content în history pre-pause.
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    fireEvent.click(screen.getByTestId('rest-skip'));
    fireEvent.click(screen.getByTestId('workout-exit-trigger'));
    fireEvent.click(screen.getByTestId('exit-pause'));
    expect(useWorkoutStore.getState().pausedSnapshot).not.toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor'
    );
  });

  it('Renunt discards state + navigates antrenor', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Greu$/i }));
    fireEvent.click(screen.getByTestId('rest-skip'));
    fireEvent.click(screen.getByTestId('workout-exit-trigger'));
    fireEvent.click(screen.getByTestId('exit-discard'));
    expect(useWorkoutStore.getState().history).toEqual({});
    expect(useWorkoutStore.getState().sessionStart).toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor'
    );
  });
});

describe('Workout — session elapsed timer (fake timers)', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('elapsed text increments per second', () => {
    renderWorkout();
    expect(screen.getByTestId('workout-elapsed')).toHaveTextContent('0:00');
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId('workout-elapsed')).toHaveTextContent('0:05');
  });

  it('elapsed crosses minute boundary correctly (1:01 at 61s)', () => {
    renderWorkout();
    act(() => {
      vi.advanceTimersByTime(61000);
    });
    expect(screen.getByTestId('workout-elapsed')).toHaveTextContent('1:01');
  });
});

describe('Workout — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  beforeEach(() => {
    resetStore();
  });

  it('no diacritics in UI rendered text (logging phase)', () => {
    const { container } = renderWorkout();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });

  it('no diacritics in exit sheet', () => {
    renderWorkout();
    fireEvent.click(screen.getByTestId('workout-exit-trigger'));
    const sheet = screen.getByTestId('exit-sheet');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(sheet.textContent ?? '')).toBe(false);
  });

  it('no diacritics in rest overlay', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    const overlay = screen.getByTestId('rest-overlay');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(overlay.textContent ?? '')).toBe(false);
  });
});

describe('Workout — PR detection pipeline (task_10 §B getPRDelta wire)', () => {
  beforeEach(() => {
    resetStore();
  });

  it('logSet calls getPRDelta cu exercise + set + history', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    expect(getPRDelta).toHaveBeenCalledWith(
      'Bench Press',
      { w: 22.5, reps: 10 },
      [] // initial history empty
    );
  });

  it('NU markPRHit cand getPRDelta returns null (no PR)', () => {
    vi.mocked(getPRDelta).mockReturnValue(null);
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    expect(useWorkoutStore.getState().prHit).toBe(false);
    expect(useWorkoutStore.getState().prData).toBeNull();
  });

  it('markPRHit cu prData cand getPRDelta returns weight PR', () => {
    vi.mocked(getPRDelta).mockReturnValue({
      type: 'weight',
      kg: 25,
      reps: 10,
      prevBest: { ex: 'Bench Press', w: 22.5, reps: 10 },
    });
    renderWorkout();
    const kgInput = screen.getByTestId('kg-input');
    fireEvent.change(kgInput, { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /^Greu$/i }));
    const state = useWorkoutStore.getState();
    expect(state.prHit).toBe(true);
    expect(state.prData).toEqual({
      exercise: 'Bench Press',
      deltaKg: 2.5, // 25 - 22.5
      type: 'weight',
    });
  });

  it('markPRHit deltaKg = 0 cand prevBest null (first ever set)', () => {
    vi.mocked(getPRDelta).mockReturnValue({
      type: 'weight',
      kg: 22.5,
      reps: 10,
      prevBest: null,
    });
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    expect(useWorkoutStore.getState().prData?.deltaKg).toBe(22.5);
  });

  it('volume PR type propagated correctly', () => {
    vi.mocked(getPRDelta).mockReturnValue({
      type: 'volume',
      kg: 22.5,
      reps: 12,
      prevBest: { ex: 'Bench Press', w: 22.5, reps: 10 },
    });
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    expect(useWorkoutStore.getState().prData?.type).toBe('volume');
  });

  it('reps PR type propagated correctly', () => {
    vi.mocked(getPRDelta).mockReturnValue({
      type: 'reps',
      kg: 22.5,
      reps: 12,
      prevBest: { ex: 'Bench Press', w: 22.5, reps: 10 },
    });
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    expect(useWorkoutStore.getState().prData?.type).toBe('reps');
  });

  it('history passed la getPRDelta accumulates set 2+ correctly', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    fireEvent.click(screen.getByTestId('rest-skip'));
    vi.mocked(getPRDelta).mockClear();
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    expect(getPRDelta).toHaveBeenCalledWith(
      'Bench Press',
      { w: 22.5, reps: 10 },
      [{ ex: 'Bench Press', w: 22.5, reps: 10 }] // 1st set in history
    );
  });
});
