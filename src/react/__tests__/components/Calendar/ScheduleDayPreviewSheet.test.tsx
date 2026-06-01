// ══ SCHEDULE DAY PREVIEW SHEET TESTS ════════════════════════════════════
// Non-edit tap on a training day opens the read-only preview with the engine's
// proposed exercises; edit-mode tap still toggles the day (UNCHANGED); rest +
// empty states render honestly. The engine wrapper (getWorkoutForDay) is mocked
// so the preview wiring is verified without the full pipeline.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock engineWrappers — getWorkoutForDay is the seam the sheet calls. Keep the
// real resolveSessionTitle + ENGINE_WORKOUT_TITLE_FALLBACK behavior simple.
const getWorkoutForDayMock = vi.fn();
vi.mock('../../../lib/engineWrappers', () => ({
  getWorkoutForDay: (idx: number) => getWorkoutForDayMock(idx),
  resolveSessionTitle: (sessionType?: string | null) =>
    sessionType === 'PUSH' ? 'Push (chest and shoulders)' : 'Your workout',
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
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

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
  // Day 0 (Mon) = training, day 1 (Tue) = rest in this fixture.
  useScheduleStore.setState({
    weekStartISO: weekStartIso(),
    days: ['training', 'rest', 'training', 'rest', 'training', 'training', 'rest'],
    editMode: false,
  });
  localStorage.clear();
  getWorkoutForDayMock.mockReset();
  getWorkoutForDayMock.mockResolvedValue(SESSION);
  setLocale('en');
  _resetI18nCache();
  setLocale('en');
});

afterEach(() => {
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
