// ══ SCHEDULE DAY PREVIEW SHEET TESTS ════════════════════════════════════
// Non-edit tap on a training day opens the read-only preview with the engine's
// proposed exercises; edit-mode tap still toggles the day (UNCHANGED); rest +
// empty states render honestly. The engine wrapper (getWorkoutForDay) is mocked
// so the preview wiring is verified without the full pipeline.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock engineWrappers — getWorkoutForDay is the seam the sheet calls. Keep the
// real resolveSessionTitle + ENGINE_WORKOUT_TITLE_FALLBACK behavior simple.
// dateForWeekdayIndex is REAL pure logic (Monday-first weekday → current-week
// Date) — the sheet uses it for PAST/TODAY/FUTURE classification, so the mock
// reproduces it exactly (matches engineWrappers.session.ts).
const getWorkoutForDayMock = vi.fn();
vi.mock('../../../lib/engineWrappers', () => ({
  getWorkoutForDay: (idx: number) => getWorkoutForDayMock(idx),
  resolveSessionTitle: (sessionType?: string | null) =>
    sessionType === 'PUSH' ? 'Push (chest and shoulders)' : 'Your workout',
  dateForWeekdayIndex: (dayIdx: number, now: Date = new Date()): Date => {
    const todayIdx = (now.getDay() + 6) % 7;
    const target = new Date(now);
    target.setDate(target.getDate() + (dayIdx - todayIdx));
    return target;
  },
}));

// ExerciseMedia pulls the media lib; stub to a marker so the row presentation
// is the thing under test (not the media pipeline).
vi.mock('../../../components/ExerciseMedia', () => ({
  ExerciseMedia: ({ testId }: { testId?: string }) => (
    <div data-testid={testId ?? 'exercise-media'} />
  ),
}));

import { Calendar7Day } from '../../../components/Calendar7Day';
import { useScheduleStore, weekStartIso } from '../../../stores/scheduleStore';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

// Deterministic "today" so PAST / TODAY / FUTURE classification is stable. Pin
// to MONDAY 2026-06-01 (Monday-first idx 0). With this clock the shared fixture
// below resolves: day 0 (Mon) = TODAY, day 1 (Tue) = FUTURE, day 2 (Wed) =
// FUTURE — so every legacy test taps a today/future day and keeps the live
// proposal behavior. The temporal-awareness suite overrides the system time
// per-test (vi.setSystemTime) to exercise PAST days.
const PINNED_TODAY = new Date(2026, 5, 1, 12, 0, 0); // Mon Jun 1 2026, local noon

const SESSION = {
  workoutTitle: '__engine_workout_title_fallback__',
  sessionType: 'PUSH',
  exerciseCount: 2,
  estimatedDuration: 48,
  intensityMod: 'normal' as const,
  volumeKg: 5200,
  warmup: null,
  exercises: [
    {
      id: 'flat-db-press-0',
      name: 'Impins cu gantere',
      engineName: 'Flat DB Press',
      sub: 'Cu gantere - banc plan',
      sets: 4,
      targetReps: 10,
      targetKg: 22.5,
      restSec: 120,
    },
    {
      id: 'plank-1',
      name: 'Plank',
      engineName: 'Plank',
      sets: 3,
      targetReps: 0,
      targetKg: 0,
      restSec: 60,
      isBodyweight: true,
      bwFraction: 0,
    },
  ],
};

beforeEach(() => {
  // Pin the clock (Date.now / new Date) so day classification is deterministic.
  // setSystemTime alone (no useFakeTimers) keeps real timers → async RTL still
  // works. Today = Mon → fixture day 0 = today, day 1/2 = future (live proposal).
  vi.setSystemTime(PINNED_TODAY);
  // Day 0 (Mon) = training, day 1 (Tue) = rest in this fixture.
  useScheduleStore.setState({
    weekStartISO: weekStartIso(),
    days: ['training', 'rest', 'training', 'rest', 'training', 'training', 'rest'],
    editMode: false,
  });
  // No logged history by default — the temporal-awareness suite seeds it.
  useWorkoutStore.setState({ sessionsHistory: [] });
  localStorage.clear();
  getWorkoutForDayMock.mockReset();
  getWorkoutForDayMock.mockResolvedValue(SESSION);
  setLocale('en');
  _resetI18nCache();
  setLocale('en');
});

afterEach(() => {
  vi.useRealTimers();
  useWorkoutStore.setState({ sessionsHistory: [] });
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
});

describe('ScheduleDayPreviewSheet — non-edit tap opens preview', () => {
  it('tapping a training day (non-edit) opens the sheet with engine exercises', async () => {
    render(<Calendar7Day />);
    // Sheet is closed initially.
    expect(screen.queryByTestId('schedule-day-preview-sheet')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('calendar-day-0')); // Mon = training

    expect(getWorkoutForDayMock).toHaveBeenCalledWith(0);
    const sheet = await screen.findByTestId('schedule-day-preview-sheet');
    expect(sheet).toBeInTheDocument();

    // Engine's two exercises render as read-only rows.
    await waitFor(() => {
      expect(screen.getAllByTestId('schedule-day-preview-exercise')).toHaveLength(2);
    });
    expect(screen.getByText('Impins cu gantere')).toBeInTheDocument();
    expect(screen.getByText('Plank')).toBeInTheDocument();
    // Localized session title (PUSH → fallback sentinel resolved via sessionType).
    expect(screen.getByTestId('schedule-day-preview-title')).toHaveTextContent(
      'Push (chest and shoulders)',
    );
  });

  it('preview is READ-ONLY — no start/confirm CTA, only a close button', async () => {
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-day-0'));
    await screen.findByTestId('schedule-day-preview-sheet');
    // The WorkoutPreview "start session" CTA must NOT appear here.
    expect(screen.queryByTestId('preview-start-cta')).not.toBeInTheDocument();
    expect(screen.getByTestId('schedule-day-preview-close')).toBeInTheDocument();
  });

  it('recomputes from the live engine each open (re-fetches on re-open)', async () => {
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-day-0'));
    await screen.findByTestId('schedule-day-preview-sheet');
    fireEvent.click(screen.getByTestId('schedule-day-preview-close'));
    await waitFor(() => {
      expect(screen.queryByTestId('schedule-day-preview-sheet')).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('calendar-day-2')); // another training day
    await screen.findByTestId('schedule-day-preview-sheet');
    // Two distinct opens → two engine fetches (live recompute, not cached).
    expect(getWorkoutForDayMock).toHaveBeenCalledTimes(2);
    expect(getWorkoutForDayMock).toHaveBeenLastCalledWith(2);
  });
});

describe('ScheduleDayPreviewSheet — rest + empty states', () => {
  it('tapping a REST day shows the rest state, never invokes the engine', async () => {
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-day-1')); // Tue = rest
    await screen.findByTestId('schedule-day-preview-sheet');
    expect(screen.getByTestId('schedule-day-preview-rest')).toBeInTheDocument();
    expect(screen.queryByTestId('schedule-day-preview-list')).not.toBeInTheDocument();
    // Engine NOT called for a rest day (the day is rest per the live schedule).
    expect(getWorkoutForDayMock).not.toHaveBeenCalled();
  });

  it('training day with no engine session shows the honest empty state', async () => {
    getWorkoutForDayMock.mockResolvedValue(null);
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-day-0')); // training
    await screen.findByTestId('schedule-day-preview-sheet');
    await screen.findByTestId('schedule-day-preview-empty');
    expect(screen.queryByTestId('schedule-day-preview-list')).not.toBeInTheDocument();
  });
});

describe('ScheduleDayPreviewSheet — edit-mode behavior UNCHANGED', () => {
  it('tapping a day in EDIT mode toggles it (does NOT open the preview)', async () => {
    useScheduleStore.setState({ editMode: true });
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-day-1')); // rest → training
    expect(useScheduleStore.getState().days[1]).toBe('training');
    expect(screen.queryByTestId('schedule-day-preview-sheet')).not.toBeInTheDocument();
    expect(getWorkoutForDayMock).not.toHaveBeenCalled();
    // Toggle back — still no preview.
    fireEvent.click(screen.getByTestId('calendar-day-1'));
    expect(useScheduleStore.getState().days[1]).toBe('rest');
    expect(screen.queryByTestId('schedule-day-preview-sheet')).not.toBeInTheDocument();
  });
});

// ── Temporal awareness: PAST shows logged history, TODAY/FUTURE shows proposal ──
// The app has a clock. The previewed weekday's DATE comes from dayIdx via the
// engine's own dateForWeekdayIndex (current week), compared at LOCAL midnight to
// "today". These tests pin today to THURSDAY Jun 4 2026 (Monday-first idx 3) so
// day 2 (Wed) is PAST, day 3 (Thu) is TODAY, day 5 (Sat) is FUTURE — all marked
// training in the per-test schedule so the routing reaches the engine/history.
describe('ScheduleDayPreviewSheet — temporal awareness (clock)', () => {
  const THURSDAY = new Date(2026, 5, 4, 12, 0, 0); // Thu Jun 4 2026, local noon
  // A logged session finished on WEDNESDAY Jun 3 (local) — the PAST day under
  // test. Real performed sets (kg × reps); the shape matches sessionsHistory[i].
  const WED_SESSION = {
    title: 'Leg day (what actually happened)',
    meta: '6 sets - 50 min - 9 200 kg',
    ts: new Date(2026, 5, 3, 18, 30, 0).getTime(), // Wed Jun 3 18:30 local
    sets: 6,
    durationMin: 50,
    volumeKg: 9200,
    exercises: [
      {
        exerciseId: 'back-squat',
        exerciseName: 'Back Squat',
        sets: [
          { kg: 80, reps: 8, rating: 'potrivit' as const, timestamp: 1 },
          { kg: 85, reps: 6, rating: 'greu' as const, timestamp: 2 },
        ],
        totalVolume: 1150,
        peakOneRM: 101,
      },
      {
        exerciseId: 'leg-press',
        exerciseName: 'Leg Press',
        sets: [{ kg: 160, reps: 12, rating: 'potrivit' as const, timestamp: 3 }],
        totalVolume: 1920,
        peakOneRM: 224,
      },
    ],
  };

  beforeEach(() => {
    vi.setSystemTime(THURSDAY);
    // All-training week so day 2/3/5 routing reaches the engine/history branch.
    useScheduleStore.setState({
      weekStartISO: weekStartIso(),
      days: ['training', 'training', 'training', 'training', 'training', 'training', 'training'],
      editMode: false,
    });
  });

  it('(a) PAST day with a logged session shows the actual performed sets, NOT the live note', async () => {
    useWorkoutStore.setState({ sessionsHistory: [WED_SESSION] });
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-day-2')); // Wed = PAST

    await screen.findByTestId('schedule-day-preview-sheet');
    // The engine proposal is NEVER fetched for a past day.
    expect(getWorkoutForDayMock).not.toHaveBeenCalled();

    // Real logged exercises render (read-only), with the "what you did" title.
    expect(screen.getByTestId('schedule-day-preview-done-title')).toHaveTextContent(
      'Leg day (what actually happened)',
    );
    expect(screen.getByText('Back Squat')).toBeInTheDocument();
    expect(screen.getByText('Leg Press')).toBeInTheDocument();
    expect(screen.getAllByTestId('schedule-day-preview-logged-exercise')).toHaveLength(2);

    // Actual performed numbers (kg × reps per set), not prescription.
    expect(screen.getByText('80 kg x 8')).toBeInTheDocument();
    expect(screen.getByText('85 kg x 6')).toBeInTheDocument();
    expect(screen.getByText('160 kg x 12')).toBeInTheDocument();

    // NOT the live-recompute note and NOT a proposed list.
    expect(screen.queryByTestId('schedule-day-preview-live-note')).not.toBeInTheDocument();
    expect(screen.queryByTestId('schedule-day-preview-list')).not.toBeInTheDocument();
  });

  it('(b) PAST day with no logged session shows the honest missed empty state', async () => {
    useWorkoutStore.setState({ sessionsHistory: [] });
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-day-2')); // Wed = PAST, no session

    await screen.findByTestId('schedule-day-preview-sheet');
    expect(screen.getByTestId('schedule-day-preview-missed')).toBeInTheDocument();
    // No proposal, no logged list, engine never called.
    expect(getWorkoutForDayMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId('schedule-day-preview-logged-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('schedule-day-preview-list')).not.toBeInTheDocument();
  });

  it('(c) FUTURE day still shows the live proposed workout (unchanged behavior)', async () => {
    // Seed history on Wed too — a FUTURE day must IGNORE it and use the engine.
    useWorkoutStore.setState({ sessionsHistory: [WED_SESSION] });
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-day-5')); // Sat = FUTURE

    await screen.findByTestId('schedule-day-preview-sheet');
    expect(getWorkoutForDayMock).toHaveBeenCalledWith(5);
    await waitFor(() => {
      expect(screen.getAllByTestId('schedule-day-preview-exercise')).toHaveLength(2);
    });
    // Proposed list + live note present; logged-history surfaces absent.
    expect(screen.getByTestId('schedule-day-preview-live-note')).toBeInTheDocument();
    expect(screen.queryByTestId('schedule-day-preview-logged-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('schedule-day-preview-missed')).not.toBeInTheDocument();
  });

  it('TODAY shows the live proposal even if a session is already logged today', async () => {
    // A session finished earlier TODAY (Thu) — today still shows the proposal
    // (the running plan), not the read-only history view.
    const todaySession = { ...WED_SESSION, ts: new Date(2026, 5, 4, 9, 0, 0).getTime() };
    useWorkoutStore.setState({ sessionsHistory: [todaySession] });
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-day-3')); // Thu = TODAY

    await screen.findByTestId('schedule-day-preview-sheet');
    expect(getWorkoutForDayMock).toHaveBeenCalledWith(3);
    await waitFor(() => {
      expect(screen.getAllByTestId('schedule-day-preview-exercise')).toHaveLength(2);
    });
    expect(screen.queryByTestId('schedule-day-preview-logged-list')).not.toBeInTheDocument();
  });
});
