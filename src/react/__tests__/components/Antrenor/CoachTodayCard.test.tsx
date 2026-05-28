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

function renderCard() {
  return render(
    <MemoryRouter>
      <CoachTodayCard onStart={() => {}} workout={null} />
    </MemoryRouter>,
  );
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
