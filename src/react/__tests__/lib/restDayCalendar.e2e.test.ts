// Founder 2026-11-08 08:51 ("Can't build the full plan right now"): Home offered
// Sunday's workout (the synced week said training) while the engine's own committed
// calendar copy — written on another day / device — still said Sunday was a rest
// day, so every compose returned nothing. The engine copy now follows the week, and
// a session started on a real rest day composes anyway.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { composePlannedWorkoutToday } from '../../lib/scheduleAdapterAggregate';
import { invalidatePlanCache } from '../../lib/planCache';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useScheduleStore, weekStartIso } from '../../stores/scheduleStore';
import { commitCalendarEdit, getCalendarOverride } from '../../../engine/schedule/scheduleAdapter.js';

const SUNDAY = new Date(2026, 10, 8, 8, 51);
const KEYS = ['L', 'M', 'M2', 'J', 'V', 'S', 'D'] as const;
const week = (sunday: boolean) => KEYS.map((day, i) => ({ day, active: i === 0 || i === 3 || i === 4 || (i === 6 && sunday) }));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(SUNDAY);
  localStorage.clear();
  invalidatePlanCache();
  useOnboardingStore.setState({
    data: { age: 30, sex: 'm', goal: 'slabire', frequency: '4', experience: 'avansat', weight: 90, height: 181, trainingType: 'gym', focusPreset: 'balanced', focusPresetPickedAt: null },
    completed: true,
    completedAt: SUNDAY.getTime(),
  });
});
afterEach(() => { vi.useRealTimers(); });

describe('the engine calendar follows the synced week', () => {
  it('a week arriving from the other device (Sunday now training) rewrites the stale engine copy', async () => {
    commitCalendarEdit(week(false), SUNDAY); // the old commit: Sunday rest
    expect(getCalendarOverride(SUNDAY)!.selectedDays[6]!.active).toBe(false);
    expect(await composePlannedWorkoutToday(SUNDAY)).toBeNull(); // the screenshot
    useScheduleStore.setState({ weekStartISO: weekStartIso(SUNDAY), days: ['training', 'rest', 'rest', 'training', 'training', 'rest', 'training'] });
    await vi.waitFor(() => expect(getCalendarOverride(SUNDAY)!.selectedDays[6]!.active).toBe(true));
    invalidatePlanCache();
    expect((await composePlannedWorkoutToday(SUNDAY))?.exercises.length).toBeGreaterThan(0);
  });

  it("an old week's days never overwrite this week's engine copy", async () => {
    commitCalendarEdit(week(true), SUNDAY);
    useScheduleStore.setState({ weekStartISO: '2026-10-26', days: ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'] });
    await Promise.resolve();
    expect(getCalendarOverride(SUNDAY)!.selectedDays[6]!.active).toBe(true);
  });
});

describe('dp_rest_day_train_anyway_v1 — a session started on a rest day', () => {
  it('composes when the user chose to train; the week preview still reads it as rest', async () => {
    commitCalendarEdit(week(false), SUNDAY);
    expect(await composePlannedWorkoutToday(SUNDAY)).toBeNull();
    expect((await composePlannedWorkoutToday(SUNDAY, { trainOnRestDay: true }))?.exercises.length).toBeGreaterThan(0);
    localStorage.setItem('_devFlags', JSON.stringify({ dp_rest_day_train_anyway_v1: false }));
    invalidatePlanCache();
    expect(await composePlannedWorkoutToday(SUNDAY, { trainOnRestDay: true })).toBeNull();
    localStorage.removeItem('_devFlags');
  });
});
