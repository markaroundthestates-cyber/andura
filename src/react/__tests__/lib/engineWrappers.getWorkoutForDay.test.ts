// ══ getWorkoutForDay / dateForWeekdayIndex TESTS ════════════════════════════
// The schedule day-preview reuses the SAME pipeline as getTodayWorkout, but for
// a SPECIFIC weekday of the current week. The load-bearing piece is the injected
// Date: dateForWeekdayIndex shifts `now` to the Monday-first index so the engine
// (scheduleAdapter.getDailyWorkout) derives that day's session type + rest-day
// override + selection seed. These tests lock the date math + the wiring.

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the composer seam — getWorkoutForDay must thread the day's Date into it,
// then pass the result through the MMI cap (parity with getTodayWorkout).
const composeMock = vi.fn();
vi.mock('../../lib/scheduleAdapterAggregate', () => ({
  composePlannedWorkoutToday: (now: Date) => composeMock(now),
  ENGINE_WORKOUT_TITLE_FALLBACK: '__engine_workout_title_fallback__',
}));
vi.mock('../../lib/engineWrappers.mmi', () => ({
  applyMmiCapToWorkout: vi.fn((w: unknown) => w),
}));

import {
  dateForWeekdayIndex,
  getWorkoutForDay,
} from '../../lib/engineWrappers';
import { applyMmiCapToWorkout } from '../../lib/engineWrappers.mmi';

// Monday-first index of a given Date (Mon=0 … Sun=6) — same convention the
// helper uses internally; recomputed here independently to assert the shift.
function mondayFirstIdx(d: Date): number {
  return (d.getDay() + 6) % 7;
}

beforeEach(() => {
  composeMock.mockReset();
  composeMock.mockResolvedValue({ exercises: [], exerciseCount: 0 });
  (applyMmiCapToWorkout as ReturnType<typeof vi.fn>).mockClear();
});

describe('dateForWeekdayIndex', () => {
  it('returns a Date whose Monday-first weekday index equals the requested idx', () => {
    const now = new Date('2026-06-03T10:00:00'); // a Wednesday (idx 2)
    for (let idx = 0; idx < 7; idx++) {
      expect(mondayFirstIdx(dateForWeekdayIndex(idx, now))).toBe(idx);
    }
  });

  it('keeps "today" unchanged when idx === todayIdx (preview today == live)', () => {
    const now = new Date('2026-06-03T10:00:00'); // Wednesday → idx 2
    const todayIdx = mondayFirstIdx(now);
    const d = dateForWeekdayIndex(todayIdx, now);
    expect(d.getTime()).toBe(now.getTime());
  });

  it('stays inside the same ISO week (override matches) for every index', () => {
    const now = new Date('2026-06-03T10:00:00'); // Wednesday
    // Monday of this week.
    const monday = new Date(now);
    monday.setDate(monday.getDate() - mondayFirstIdx(now));
    for (let idx = 0; idx < 7; idx++) {
      const d = dateForWeekdayIndex(idx, now);
      const diffDays = Math.round((d.getTime() - monday.getTime()) / 86400000);
      expect(diffDays).toBe(idx); // 0..6 within the same week
    }
  });
});

describe('getWorkoutForDay', () => {
  it('threads the day-specific Date into the composer', async () => {
    await getWorkoutForDay(4); // Friday
    expect(composeMock).toHaveBeenCalledTimes(1);
    const passedDate = composeMock.mock.calls[0]?.[0] as Date;
    expect(passedDate).toBeInstanceOf(Date);
    expect(mondayFirstIdx(passedDate)).toBe(4);
  });

  it('passes the composed plan through the MMI cap (parity with getTodayWorkout)', async () => {
    const plan = { exercises: [{ id: 'x' }], exerciseCount: 1 };
    composeMock.mockResolvedValue(plan);
    const out = await getWorkoutForDay(0);
    expect(applyMmiCapToWorkout).toHaveBeenCalledWith(plan);
    expect(out).toBe(plan);
  });

  it('returns null when the composer returns null (rest day / halt) — no fabrication', async () => {
    composeMock.mockResolvedValue(null);
    const out = await getWorkoutForDay(0);
    expect(out).toBeNull();
    expect(applyMmiCapToWorkout).not.toHaveBeenCalled();
  });

  it('returns null + swallows when the composer throws (fail-silent)', async () => {
    composeMock.mockRejectedValue(new Error('pipeline boom'));
    const out = await getWorkoutForDay(0);
    expect(out).toBeNull();
  });
});
