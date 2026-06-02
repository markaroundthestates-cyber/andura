// ══ COACH TODAY CARD TESTS — MED-CODE-20 useMemo deps fresh refresh ════════
// MED-FIX chat5 (2026-05-23) sibling to MED-CODE-20 useMemo dep fix.
//
// Locks in: coachQuote useMemo re-runs cand sessionsHistory schimba (user
// finishes workout mid-day) sau todayDate rollover (next day boundary).
// Prior `[]` empty deps locked engine result la mount → user trains la
// 09:00, returns 14:00 post-workout → recovery state changed dar quote
// stayed stale.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CoachTodayCard } from '../../../components/Antrenor/CoachTodayCard';
import { useWorkoutStore } from '../../../stores/workoutStore';
import * as engineWrappers from '../../../lib/engineWrappers';
import type { PlannedWorkoutOutput, CoachAdaptation } from '../../../lib/engineWrappers';

function renderCard(onStart: () => void = () => {}) {
  return render(
    <MemoryRouter>
      <CoachTodayCard onStart={onStart} workout={null} />
    </MemoryRouter>,
  );
}

// Minimal PlannedWorkoutOutput carrying a coachAdaptations log (only the fields
// the card reads matter; the rest take defaults via the card's ?? fallbacks).
function workoutWith(coachAdaptations: CoachAdaptation[]): PlannedWorkoutOutput {
  return {
    workoutTitle: '__engine_workout_title_fallback__',
    sessionType: 'PUSH',
    exerciseCount: 5,
    estimatedDuration: 48,
    intensityMod: 'normal',
    exercises: [],
    volumeKg: 0,
    coachAdaptations,
  };
}

function renderCardWithWorkout(
  coachAdaptations: CoachAdaptation[],
  onStart: () => void = () => {},
) {
  return render(
    <MemoryRouter>
      <CoachTodayCard onStart={onStart} workout={workoutWith(coachAdaptations)} />
    </MemoryRouter>,
  );
}

// A logged-today session fixture (ts = now → todTs matches today's local key).
function todaySessionFixture(ts: number = Date.now()) {
  return {
    title: 'Push',
    meta: '5 seturi · 52 min · 12 450 kg',
    ts,
    exercises: [],
  };
}

describe('CoachTodayCard — MED-CODE-20 coachQuote refresh deps', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useWorkoutStore.setState({ sessionsHistory: [] });
  });

  it('renders generic fallback cand sessionsHistory=[] (T0 fresh)', () => {
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue(null);
    renderCard();
    const quote = screen.getByTestId('coach-today-quote');
    // Generic fallback — non-claim, NU hardcoded muscle-group line.
    expect(quote.textContent).not.toMatch(/Pectoralii recupereaza/i);
    expect(quote.textContent).toBeTruthy();
  });

  it('renders engine-driven recovered group cand getCoachTodayQuote returns data — EN default', () => {
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue({
      recoveredLabel: 'Pectoralii',
      daysSince: 3,
    });
    renderCard();
    // Wave C2 i18n: EN default → "{group} has recovered since 3 days — let's nail it."
    expect(
      screen.getByText(/Pectoralii has recovered since 3 days/i),
    ).toBeInTheDocument();
  });

  it('MED-CODE-20: coachQuote re-runs cand sessionsHistory schimba', () => {
    const spy = vi
      .spyOn(engineWrappers, 'getCoachTodayQuote')
      .mockReturnValue(null);
    renderCard();
    // Initial render = 1 engine call (sessionsHistory=[] at mount).
    const initialCalls = spy.mock.calls.length;
    expect(initialCalls).toBeGreaterThanOrEqual(1);

    // Simulate user finishing workout mid-day → sessionsHistory append.
    // Bug pre-fix: useMemo([]) locked result, ZERO re-run. Post-fix: deps
    // include sessionsHistory → recompute triggers.
    act(() => {
      useWorkoutStore.setState({
        sessionsHistory: [
          {
            title: 'Push',
            meta: '5 seturi · 52 min · 12 450 kg',
            ts: Date.now(),
            exercises: [
              {
                exerciseId: 'bench-press',
                exerciseName: 'Bench Press',
                sets: [
                  {
                    kg: 100,
                    reps: 5,
                    rating: 'potrivit',
                    timestamp: Date.now(),
                  },
                ],
                totalVolume: 500,
                peakOneRM: 116.7,
              },
            ],
          },
        ],
      });
    });

    // Post-fix: at least 1 additional engine call after sessionsHistory append.
    expect(spy.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  it('MED-CODE-20: quote text updates dupa sessionsHistory change', () => {
    // Mock returns sequentially: first null (T0), then recovered group.
    const spy = vi
      .spyOn(engineWrappers, 'getCoachTodayQuote')
      .mockReturnValueOnce(null)
      .mockReturnValue({ recoveredLabel: 'Spatele', daysSince: 2 });

    renderCard();
    // Initial: fallback generic, NO "Spatele recovered".
    expect(screen.queryByText(/Spatele has recovered/i)).not.toBeInTheDocument();

    // Trigger sessionsHistory change → useMemo re-runs → engine returns
    // dynamic group → render text updates.
    act(() => {
      useWorkoutStore.setState({
        sessionsHistory: [
          {
            title: 'Pull',
            meta: '5 seturi · 48 min · 10 200 kg',
            ts: Date.now(),
            exercises: [],
          },
        ],
      });
    });

    // Wave C2 i18n: EN default → "Spatele has recovered since 2 days".
    expect(
      screen.getByText(/Spatele has recovered since 2 days/i),
    ).toBeInTheDocument();
    // Verify spy called at least twice (mount + post-setState).
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});

// Coach Voice — the daily "why" line renders ABOVE the Start CTA when the
// adaptive brain adapted today's plan, and is HIDDEN entirely when nothing
// adapted (graceful, no filler). The line text is composed from the engine's
// coachAdaptations log carried by the workout prop.
describe('CoachTodayCard — Coach Voice daily why line', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue(null);
    vi.spyOn(engineWrappers, 'getLaggingSignal').mockReturnValue(null);
    useWorkoutStore.setState({ sessionsHistory: [] });
  });

  it('renders the why line when an adaptation happened today', () => {
    renderCardWithWorkout([
      { kind: 'recovery-cut', group: 'piept', cause: 'resistance' },
    ]);
    const line = screen.getByTestId('coach-why-line');
    expect(line).toBeInTheDocument();
    // EN default — the composed sentence names the group + its reason.
    expect(line.textContent).toMatch(/chest/i);
    expect(line.textContent).toMatch(/recovering/i);
  });

  it('renders NOTHING when no adaptation happened (empty log)', () => {
    renderCardWithWorkout([]);
    expect(screen.queryByTestId('coach-why-line')).not.toBeInTheDocument();
  });

  it('renders NOTHING when the workout prop is null (cold start / loading)', () => {
    renderCard();
    expect(screen.queryByTestId('coach-why-line')).not.toBeInTheDocument();
  });

  it('the why line sits ABOVE the Start CTA in DOM order', () => {
    const { container } = renderCardWithWorkout([{ kind: 'deload' }]);
    const line = screen.getByTestId('coach-why-line');
    const cta = screen.getByText('Start session');
    // compareDocumentPosition: FOLLOWING (4) means cta comes after the line.
    expect(line.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    void container;
  });
});

// Calibration honesty — the "still learning you" line. Renders an HONEST
// "still calibrating" indicator while the model is immature (early tier), and
// is HIDDEN once the model is dialed in (the engine returns null at
// PERSONALIZED+). Truth-only: a real "sessions remaining" count is shown when
// the engine exposes one; otherwise the copy carries no number.
describe('CoachTodayCard — calibration honesty line', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue(null);
    vi.spyOn(engineWrappers, 'getLaggingSignal').mockReturnValue(null);
    useWorkoutStore.setState({ sessionsHistory: [] });
  });

  it('renders the honest count copy while the model is still immature', () => {
    vi.spyOn(engineWrappers, 'getCalibrationMaturity').mockReturnValue({
      tierId: 0,
      tierName: 'cold_start',
      sessionsCount: 0,
      sessionsToNext: 3,
    });
    renderCard();
    const line = screen.getByTestId('coach-calibration-line');
    expect(line).toBeInTheDocument();
    // EN default — names the real "sessions remaining" count, never a fake one.
    expect(line.textContent).toMatch(/Still learning you/i);
    expect(line.textContent).toMatch(/3 more sessions/i);
  });

  it('phrases WITHOUT a number when the engine exposes no count (no fabrication)', () => {
    vi.spyOn(engineWrappers, 'getCalibrationMaturity').mockReturnValue({
      tierId: 1,
      tierName: 'initial',
      sessionsCount: 5,
      sessionsToNext: null,
    });
    renderCard();
    const line = screen.getByTestId('coach-calibration-line');
    expect(line.textContent).toMatch(/Still getting to know you/i);
    // No fabricated session count when none is available.
    expect(line.textContent).not.toMatch(/\d+ more sessions/i);
  });

  it('renders NOTHING once the model is dialed in (engine returns null)', () => {
    vi.spyOn(engineWrappers, 'getCalibrationMaturity').mockReturnValue(null);
    renderCard();
    expect(screen.queryByTestId('coach-calibration-line')).not.toBeInTheDocument();
  });

  it('cold start (empty history) does not crash and shows an honest early-state line', () => {
    // No mock — exercise the REAL engine wrapper with zero sessions (cold start).
    renderCard();
    const line = screen.getByTestId('coach-calibration-line');
    expect(line).toBeInTheDocument();
    expect(line.textContent).toBeTruthy();
  });
});

// START-side double-session guard (counterpart to the PostRpe finish-side
// confirm shipped dc9400d6). A session logged TODAY replaces the start CTA
// with a "Session logged" control; the only way to a 2nd session today is the
// explicit "Add a second session" opt-in.
describe('CoachTodayCard — session-logged-today start guard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue(null);
    useWorkoutStore.setState({ sessionsHistory: [], deletedSessionTs: [] });
  });

  it('no session today → normal Start CTA shows, no logged state', () => {
    renderCard();
    expect(screen.getByText('Start session')).toBeInTheDocument();
    expect(screen.queryByTestId('coach-session-logged')).not.toBeInTheDocument();
  });

  it('session logged today → start CTA replaced by "Session logged"', () => {
    useWorkoutStore.setState({ sessionsHistory: [todaySessionFixture()] });
    renderCard();
    expect(screen.getByTestId('coach-session-logged')).toBeInTheDocument();
    // Normal start button + override link are gone.
    expect(screen.queryByText('Start session')).not.toBeInTheDocument();
    expect(screen.queryByTestId('coach-today-override')).not.toBeInTheDocument();
  });

  it('tapping "Session logged" reveals delete + add-second options', () => {
    useWorkoutStore.setState({ sessionsHistory: [todaySessionFixture()] });
    renderCard();
    // Options hidden until the logged state is tapped.
    expect(screen.queryByTestId('coach-session-delete')).not.toBeInTheDocument();
    act(() => {
      screen.getByTestId('coach-session-logged').click();
    });
    expect(screen.getByTestId('coach-session-delete')).toBeInTheDocument();
    expect(screen.getByTestId('coach-session-add-second')).toBeInTheDocument();
  });

  it('delete removes today\'s session and reverts to the normal Start CTA', () => {
    const ts = Date.now();
    useWorkoutStore.setState({ sessionsHistory: [todaySessionFixture(ts)] });
    renderCard();
    act(() => {
      screen.getByTestId('coach-session-logged').click();
    });
    act(() => {
      screen.getByTestId('coach-session-delete').click();
    });
    // Store no longer has the session; CTA reverts.
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(0);
    expect(screen.getByText('Start session')).toBeInTheDocument();
    expect(screen.queryByTestId('coach-session-logged')).not.toBeInTheDocument();
  });

  it('add-second calls onStart (enters the normal start flow)', () => {
    useWorkoutStore.setState({ sessionsHistory: [todaySessionFixture()] });
    const onStart = vi.fn();
    renderCard(onStart);
    act(() => {
      screen.getByTestId('coach-session-logged').click();
    });
    act(() => {
      screen.getByTestId('coach-session-add-second').click();
    });
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
