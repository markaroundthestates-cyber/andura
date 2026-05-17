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
    getTodayWorkout: vi.fn(() => actual.getTodayWorkout()), // default real demo
  };
});

import { Workout } from '../../../routes/screens/antrenor/Workout';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { getPRDelta, getTodayWorkout } from '../../../lib/engineWrappers';

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
    // Phase 4 task_14: timestamp auto-stamped by logSet — match partial
    // pentru backward compat assertion intent (kg/reps/rating).
    expect(hist[0]).toMatchObject({ kg: 25, reps: 8, rating: 'greu' });
    expect(typeof hist[0].timestamp).toBe('number');
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

  // Phase 4 task_14 LOCK 9: advance fake timers > 30s between sets to bypass
  // aaFrictionDetect fast_sets pattern trigger (insufficient recovery).
  const advanceBeyondFastSetsWindow = (): void => {
    act(() => {
      vi.advanceTimersByTime(31000);
    });
  };

  it('logging last set of exercise (4 of 4 Bench Press) → transition phase', () => {
    renderWorkout();
    // Log 4 sets: rest skips between + > 30s gap pentru aaFriction bypass.
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
      if (i < 3) {
        fireEvent.click(screen.getByTestId('rest-skip'));
        advanceBeyondFastSetsWindow();
      }
    }
    expect(useWorkoutStore.getState().phase).toBe('transition');
    expect(screen.getByTestId('transition-screen')).toBeInTheDocument();
  });

  it('transition phase shows next exercise name', () => {
    renderWorkout();
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
      if (i < 3) {
        fireEvent.click(screen.getByTestId('rest-skip'));
        advanceBeyondFastSetsWindow();
      }
    }
    expect(screen.getByTestId('transition-next-name')).toHaveTextContent('Overhead Press');
  });

  it('transition advances exIdx after 1.5s', () => {
    renderWorkout();
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
      if (i < 3) {
        fireEvent.click(screen.getByTestId('rest-skip'));
        advanceBeyondFastSetsWindow();
      }
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

describe('Workout — empty state (task_17 §B WV2_FALLBACK retired)', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders empty state cand getTodayWorkout returns null', () => {
    vi.mocked(getTodayWorkout).mockReturnValueOnce(null);
    renderWorkout();
    expect(screen.getByTestId('workout')).toHaveAttribute('data-phase', 'empty');
    expect(
      screen.getByRole('heading', { name: /Nu ai antrenament programat azi/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByTestId('workout-empty-back')).toBeInTheDocument();
  });

  it('empty back button navigates antrenor', () => {
    vi.mocked(getTodayWorkout).mockReturnValueOnce(null);
    renderWorkout();
    fireEvent.click(screen.getByTestId('workout-empty-back'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
  });

  it('NU renders log zone / header / rating cand empty state', () => {
    vi.mocked(getTodayWorkout).mockReturnValueOnce(null);
    renderWorkout();
    expect(screen.queryByTestId('log-zone')).not.toBeInTheDocument();
    expect(screen.queryByTestId('workout-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('workout-exit-trigger')).not.toBeInTheDocument();
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
      // task_18 enriched fields propagated direct (NU re-derive în handleLogSet)
      deltaKg: 2.5,
      deltaPct: 11.1,
      oneRMEstimate: 33.3,
    });
    renderWorkout();
    const kgInput = screen.getByTestId('kg-input');
    fireEvent.change(kgInput, { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /^Greu$/i }));
    const state = useWorkoutStore.getState();
    expect(state.prHit).toBe(true);
    expect(state.prData).toMatchObject({
      exercise: 'Bench Press',
      deltaKg: 2.5,
      type: 'weight',
      deltaPct: 11.1,
      oneRMEstimate: 33.3,
    });
  });

  it('markPRHit deltaKg propagated din delta payload (NU re-derive)', () => {
    vi.mocked(getPRDelta).mockReturnValue({
      type: 'weight',
      kg: 22.5,
      reps: 10,
      prevBest: null,
      // task_18 first ever set: deltaKg = kg full baseline 0, deltaPct = 0
      deltaKg: 22.5,
      deltaPct: 0,
      oneRMEstimate: 30,
    });
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    expect(useWorkoutStore.getState().prData?.deltaKg).toBe(22.5);
    expect(useWorkoutStore.getState().prData?.oneRMEstimate).toBe(30);
  });

  it('volume PR type propagated correctly', () => {
    vi.mocked(getPRDelta).mockReturnValue({
      type: 'volume',
      kg: 22.5,
      reps: 12,
      prevBest: { ex: 'Bench Press', w: 22.5, reps: 10 },
      deltaKg: 0,
      deltaPct: 0,
      oneRMEstimate: 31.5,
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
      deltaKg: 0,
      deltaPct: 0,
      oneRMEstimate: 31.5,
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
    // Phase 4 task_14 LOCK 9: rapid set click triggers aaFriction fast_sets
    // (consecutive < 30s real time). Dismiss via "Continui oricum" override
    // → performLogSet proceeds → getPRDelta invocat cu accumulated history.
    const continueBtn = screen.queryByTestId('aa-friction-continue');
    if (continueBtn) fireEvent.click(continueBtn);
    expect(getPRDelta).toHaveBeenCalledWith(
      'Bench Press',
      { w: 22.5, reps: 10 },
      [{ ex: 'Bench Press', w: 22.5, reps: 10 }] // 1st set in history
    );
  });
});

describe('Workout — inactivity watch (task_15 §A)', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('NU prompt initial (mount fresh activity)', () => {
    renderWorkout();
    expect(screen.queryByTestId('inactivity-prompt')).not.toBeInTheDocument();
  });

  it('prompt apare cand idle > 7 min', () => {
    renderWorkout();
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000); // 8 min > 7 threshold
    });
    expect(screen.getByTestId('inactivity-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('inactivity-prompt-title')).toHaveTextContent('Esti acolo?');
  });

  it('Continui click bumps activity + hides prompt', () => {
    renderWorkout();
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000);
    });
    expect(screen.getByTestId('inactivity-prompt')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('inactivity-continue'));
    expect(screen.queryByTestId('inactivity-prompt')).not.toBeInTheDocument();
  });

  it('Salveaza si iesi click pauses session + navigates antrenor', () => {
    renderWorkout();
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000);
    });
    fireEvent.click(screen.getByTestId('inactivity-save-exit'));
    expect(useWorkoutStore.getState().pausedSnapshot).not.toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor'
    );
  });

  it('rating click resets activity (prompt dismissed)', () => {
    renderWorkout();
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000);
    });
    expect(screen.getByTestId('inactivity-prompt')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    expect(screen.queryByTestId('inactivity-prompt')).not.toBeInTheDocument();
  });

  it('mockup verbatim body copy preserved (no diacritics)', () => {
    renderWorkout();
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000);
    });
    const body = screen.getByTestId('inactivity-prompt-body');
    expect(body.textContent).toMatch(/N-am vazut activitate de 7 min/);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(body.textContent ?? '')).toBe(false);
  });
});

describe('Workout — aaFriction LOCK 9 wire (task_14 §C)', () => {
  beforeEach(() => {
    resetStore();
  });

  it('NU trigger modal cand first set (history empty)', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    expect(screen.queryByTestId('aa-friction-modal')).not.toBeInTheDocument();
    // logSet did proceed → phase=rest (not last set of 4)
    expect(useWorkoutStore.getState().phase).toBe('rest');
  });

  it('triggers modal pe fast_sets pattern (2nd set rapid)', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    fireEvent.click(screen.getByTestId('rest-skip'));
    // 2nd set fires immediately = < 30s gap = fast_sets trigger
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    expect(screen.getByTestId('aa-friction-modal')).toBeInTheDocument();
    expect(screen.getByTestId('aa-friction-reason')).toHaveAttribute(
      'data-reason',
      'fast_sets'
    );
  });

  it('suspend state machine — phase NU advance la rest cand modal open', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    fireEvent.click(screen.getByTestId('rest-skip'));
    expect(useWorkoutStore.getState().phase).toBe('logging');
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    // Modal open — phase still logging, NU advanced la rest yet.
    expect(useWorkoutStore.getState().phase).toBe('logging');
    expect(useWorkoutStore.getState().history[0]?.length ?? 0).toBe(1); // only 1st set logged
  });

  it('Continui oricum → performLogSet proceeds + state machine advance', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    fireEvent.click(screen.getByTestId('rest-skip'));
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    fireEvent.click(screen.getByTestId('aa-friction-continue'));
    expect(screen.queryByTestId('aa-friction-modal')).not.toBeInTheDocument();
    expect(useWorkoutStore.getState().history[0]?.length).toBe(2);
    expect(useWorkoutStore.getState().phase).toBe('rest');
  });

  it('Pauza 30s → performLogSet + override restCountdown la 30', () => {
    renderWorkout();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    fireEvent.click(screen.getByTestId('rest-skip'));
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    fireEvent.click(screen.getByTestId('aa-friction-pause'));
    expect(useWorkoutStore.getState().history[0]?.length).toBe(2);
    expect(useWorkoutStore.getState().phase).toBe('rest');
    // Override rest countdown la 30s (vs 90s default Bench Press restSec)
    expect(screen.getByTestId('rest-countdown')).toHaveTextContent('0:30');
  });

  it('triggers modal pe kg_jump pattern (> 20% increase)', () => {
    renderWorkout();
    // Set 1: 22.5 kg default
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    fireEvent.click(screen.getByTestId('rest-skip'));
    // Wait > 30s simulated via store manipulation — set sample timestamp far past
    useWorkoutStore.setState({
      history: {
        0: [{ kg: 22.5, reps: 10, rating: 'usor', timestamp: Date.now() - 60_000 }],
      },
    });
    // Set 2: bump kg la 30 = +33% kg
    const kgInput = screen.getByTestId('kg-input');
    fireEvent.change(kgInput, { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: /^Potrivit$/i }));
    expect(screen.getByTestId('aa-friction-modal')).toBeInTheDocument();
    expect(screen.getByTestId('aa-friction-reason')).toHaveAttribute(
      'data-reason',
      'kg_jump'
    );
  });
});
