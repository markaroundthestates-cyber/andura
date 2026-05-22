// ══ SESSION PILL TESTS — task_13 conditional render + tap navigate ═══════
// MemoryRouter jsdom paradigm per D020. workoutStore reset beforeEach.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// Phase 6 task_02 Option C — mock async getTodayWorkout returns Phase 5
// fixture preserve existing exercise-name assertions. Per DECISIONS.md §D027.
const PHASE_5_FIXTURE = {
  workoutTitle: 'Push (piept si umeri)',
  exerciseCount: 5,
  estimatedDuration: 50,
  intensityMod: 'normal' as const,
  volumeKg: 12450,
  exercises: [
    { id: 'bench-press', name: 'Bench Press', sets: 4, targetReps: 10, targetKg: 22.5, restSec: 90 },
    { id: 'overhead-press', name: 'Overhead Press', sets: 4, targetReps: 8, targetKg: 17.5, restSec: 120 },
    { id: 'incline-db', name: 'Incline DB', sets: 3, targetReps: 12, targetKg: 14, restSec: 75 },
    { id: 'lateral-raise', name: 'Lateral Raise', sets: 3, targetReps: 15, targetKg: 6, restSec: 60 },
    { id: 'tricep-pushdown', name: 'Tricep Pushdown', sets: 3, targetReps: 12, targetKg: 25, restSec: 60 },
  ],
};

vi.mock('../../lib/engineWrappers', () => ({
  getTodayWorkout: vi.fn(async () => PHASE_5_FIXTURE),
}));

import { SessionPill } from '../../components/SessionPill';
import { useWorkoutStore } from '../../stores/workoutStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderPill(initialPath: string = '/app/antrenor') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<><SessionPill /><LocationProbe /></>} />
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
}

describe('SessionPill — conditional render', () => {
  beforeEach(() => {
    resetStore();
  });

  it('NU render cand phase=idle + NU paused snapshot', () => {
    renderPill();
    expect(screen.queryByTestId('session-pill')).not.toBeInTheDocument();
  });

  it('renders cand phase=logging + sessionStart set + route NU workout', () => {
    useWorkoutStore.setState({ phase: 'logging', sessionStart: Date.now() });
    renderPill('/app/antrenor');
    expect(screen.getByTestId('session-pill')).toBeInTheDocument();
  });

  it('NU render cand route=workout (anti-duplicate)', () => {
    useWorkoutStore.setState({ phase: 'logging', sessionStart: Date.now() });
    renderPill('/app/antrenor/workout');
    expect(screen.queryByTestId('session-pill')).not.toBeInTheDocument();
  });

  it('renders pe alt tab (progres / istoric / cont) cand active session', () => {
    useWorkoutStore.setState({ phase: 'logging', sessionStart: Date.now() });
    renderPill('/app/progres');
    expect(screen.getByTestId('session-pill')).toBeInTheDocument();
  });

  it('renders paused state cand pausedSnapshot present + phase=idle', () => {
    useWorkoutStore.setState({
      phase: 'idle',
      sessionStart: null,
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 2',
        exIdx: 1,
        setIdx: 0,
        phase: 'logging',
        history: {},
        sessionStart: Date.now() - 60000,
      },
    });
    renderPill('/app/antrenor');
    const pill = screen.getByTestId('session-pill');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveAttribute('data-state', 'paused');
    expect(pill.textContent).toMatch(/Reia sesiunea/i);
  });

  it('data-state=active cand sessionStart set', () => {
    useWorkoutStore.setState({ phase: 'logging', sessionStart: Date.now() });
    renderPill('/app/cont');
    expect(screen.getByTestId('session-pill')).toHaveAttribute('data-state', 'active');
  });
});

describe('SessionPill — content render', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders exercise name + elapsed min for active session', async () => {
    useWorkoutStore.setState({
      phase: 'logging',
      sessionStart: Date.now() - 5 * 60 * 1000, // 5 min ago
      exIdx: 0,
    });
    renderPill('/app/antrenor');
    // Phase 6 task_02 Option C async: await getTodayWorkout resolve
    await waitFor(() => {
      const pill = screen.getByTestId('session-pill');
      expect(pill.textContent).toMatch(/Bench Press/i);
    });
    expect(screen.getByTestId('session-pill').textContent).toMatch(/5 min/);
  });

  it('exIdx advance reflects in pill exercise name', async () => {
    useWorkoutStore.setState({
      phase: 'logging',
      sessionStart: Date.now(),
      exIdx: 1, // Overhead Press
    });
    renderPill('/app/antrenor');
    await waitFor(() => {
      expect(screen.getByTestId('session-pill').textContent).toMatch(/Overhead Press/i);
    });
  });

  it('aria-label="Reia sesiunea curenta" preserved (mockup verbatim)', () => {
    useWorkoutStore.setState({ phase: 'logging', sessionStart: Date.now() });
    renderPill('/app/antrenor');
    expect(
      screen.getByRole('button', { name: /Reia sesiunea curenta/i })
    ).toBeInTheDocument();
  });
});

describe('SessionPill — tap navigation', () => {
  beforeEach(() => {
    resetStore();
  });

  it('tap navigates la /app/antrenor/workout', () => {
    useWorkoutStore.setState({ phase: 'logging', sessionStart: Date.now() });
    renderPill('/app/antrenor');
    fireEvent.click(screen.getByTestId('session-pill'));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/workout'
    );
  });

  it('tap din paused state navigates workout', () => {
    useWorkoutStore.setState({
      phase: 'idle',
      sessionStart: null,
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 1',
        exIdx: 0,
        setIdx: 0,
        phase: 'logging',
        history: {},
        sessionStart: Date.now() - 60000,
      },
    });
    renderPill('/app/cont');
    fireEvent.click(screen.getByTestId('session-pill'));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/workout'
    );
  });
});

describe('SessionPill — live elapsed update (fake timers)', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('elapsed updates per second visible la min crossover (60s → 1 min)', () => {
    useWorkoutStore.setState({
      phase: 'logging',
      sessionStart: Date.now(),
    });
    renderPill('/app/antrenor');
    expect(screen.getByTestId('session-pill').textContent).toMatch(/0 min/);
    act(() => {
      vi.advanceTimersByTime(61000);
    });
    expect(screen.getByTestId('session-pill').textContent).toMatch(/1 min/);
  });
});

describe('SessionPill — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  beforeEach(() => {
    resetStore();
  });

  it('no diacritics in active label', () => {
    useWorkoutStore.setState({ phase: 'logging', sessionStart: Date.now() });
    const { container } = renderPill('/app/antrenor');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  it('no diacritics in paused label', () => {
    useWorkoutStore.setState({
      phase: 'idle',
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 1',
        exIdx: 0,
        setIdx: 0,
        phase: 'logging',
        history: {},
        sessionStart: Date.now() - 60000,
      },
    });
    const { container } = renderPill('/app/antrenor');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
