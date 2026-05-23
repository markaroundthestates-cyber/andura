// ══ SCHEDULE STORE TESTS — Phase 4 task_19 + SUBSTRATE-ZETA shape bridge ═
// Verifies scheduleStore saveWeekly() dispatches commitCalendarEdit cu shape
// correct {day, active}[] (NU DayKind[] strings). Pre-fix chat 5 2026-05-23
// passed strings, downstream engine misread → rest day overrides silently
// no-op. Integration test prinde shape regressions future.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useScheduleStore, weekStartIso, type WeekDays } from '../../stores/scheduleStore';
import {
  CALENDAR_OVERRIDE_KEY,
  getDailyWorkout,
  getCalendarOverride,
} from '../../../engine/schedule/scheduleAdapter.js';

const MONDAY_2026_05_18 = new Date(2026, 4, 18); // dayIdx 0 (L)
const TUESDAY_2026_05_19 = new Date(2026, 4, 19); // dayIdx 1 (M)

function buildUserState(): Record<string, unknown> {
  return {
    user: { gender: 'M', age: 30, level: 'intermediate', goal: 'hypertrophy' },
    recentSessions: [],
    weights: {},
    profileTier: 'T1',
    flags: {},
    meta: { weeksElapsed: 0 },
  };
}

function resetStore(): void {
  useScheduleStore.setState({
    weekStartISO: weekStartIso(MONDAY_2026_05_18),
    days: ['training', 'rest', 'training', 'rest', 'training', 'training', 'rest'] as const satisfies WeekDays,
    editMode: false,
  });
}

// Flush microtask queue pana dynamic import + .then() callback completeaza
// scheduleStore.saveWeekly() uses import('../../engine/schedule/scheduleAdapter.js')
// asincronos. Polling pe localStorage write pentru deterministic test sync.
async function waitForLocalStorageWrite(key: string, timeoutMs = 1000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (localStorage.getItem(key) !== null) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error(`Timeout waiting for localStorage[${key}] write`);
}

beforeEach(() => {
  localStorage.clear();
  resetStore();
});

afterEach(() => {
  localStorage.clear();
});

describe('scheduleStore — initial state + actions', () => {
  it('default days = 4 training + 3 rest pattern', () => {
    resetStore();
    const days = useScheduleStore.getState().days;
    expect(days).toHaveLength(7);
    expect(days[0]).toBe('training');
    expect(days[1]).toBe('rest');
  });

  it('setEditMode flips editMode boolean', () => {
    useScheduleStore.getState().setEditMode(true);
    expect(useScheduleStore.getState().editMode).toBe(true);
    useScheduleStore.getState().setEditMode(false);
    expect(useScheduleStore.getState().editMode).toBe(false);
  });

  it('toggleDay flips kind training <-> rest in editMode', () => {
    useScheduleStore.getState().setEditMode(true);
    useScheduleStore.getState().toggleDay(1); // rest -> training
    expect(useScheduleStore.getState().days[1]).toBe('training');
    useScheduleStore.getState().toggleDay(1); // back
    expect(useScheduleStore.getState().days[1]).toBe('rest');
  });

  it('toggleDay no-op cand editMode false', () => {
    useScheduleStore.getState().toggleDay(1);
    expect(useScheduleStore.getState().days[1]).toBe('rest');
  });
});

describe('scheduleStore — saveWeekly shape bridge (SUBSTRATE-ZETA)', () => {
  it('persists {day, active}[] shape la localStorage (NU DayKind[] strings)', async () => {
    useScheduleStore.setState({
      days: ['training', 'rest', 'training', 'training', 'rest', 'rest', 'training'] as const satisfies WeekDays,
      editMode: true,
    });
    useScheduleStore.getState().saveWeekly();
    await waitForLocalStorageWrite(CALENDAR_OVERRIDE_KEY);

    const raw = localStorage.getItem(CALENDAR_OVERRIDE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveProperty('selectedDays');
    expect(Array.isArray(parsed.selectedDays)).toBe(true);
    expect(parsed.selectedDays).toHaveLength(7);

    // Each entry must be {day: string, active: boolean} — NOT DayKind string
    for (const entry of parsed.selectedDays) {
      expect(typeof entry).toBe('object');
      expect(entry).toHaveProperty('day');
      expect(entry).toHaveProperty('active');
      expect(typeof entry.day).toBe('string');
      expect(typeof entry.active).toBe('boolean');
    }
  });

  it('day keys match canonical scheduleAdapter DAY_LABELS (L/M/M2/J/V/S/D)', async () => {
    useScheduleStore.setState({ editMode: true });
    useScheduleStore.getState().saveWeekly();
    await waitForLocalStorageWrite(CALENDAR_OVERRIDE_KEY);

    const raw = localStorage.getItem(CALENDAR_OVERRIDE_KEY);
    const parsed = JSON.parse(raw!);
    const keys = parsed.selectedDays.map((e: { day: string }) => e.day);
    expect(keys).toEqual(['L', 'M', 'M2', 'J', 'V', 'S', 'D']);
  });

  it('active boolean reflects training/rest mapping correct', async () => {
    useScheduleStore.setState({
      days: ['training', 'rest', 'training', 'rest', 'training', 'training', 'rest'] as const satisfies WeekDays,
      editMode: true,
    });
    useScheduleStore.getState().saveWeekly();
    await waitForLocalStorageWrite(CALENDAR_OVERRIDE_KEY);

    const raw = localStorage.getItem(CALENDAR_OVERRIDE_KEY);
    const parsed = JSON.parse(raw!);
    const actives = parsed.selectedDays.map((e: { active: boolean }) => e.active);
    expect(actives).toEqual([true, false, true, false, true, true, false]);
  });

  it('saveWeekly exits editMode optimistic post-commit', async () => {
    useScheduleStore.setState({ editMode: true });
    useScheduleStore.getState().saveWeekly();
    // editMode flip is sync (set() called after dynamic import setup)
    expect(useScheduleStore.getState().editMode).toBe(false);
    // wait for async write before test cleanup
    await waitForLocalStorageWrite(CALENDAR_OVERRIDE_KEY);
  });
});

describe('scheduleStore — saveWeekly end-to-end engine integration', () => {
  it('rest day override via saveWeekly → getDailyWorkout returns null pe rest day', async () => {
    // Setup: mark Monday rest, restul training
    useScheduleStore.setState({
      weekStartISO: weekStartIso(MONDAY_2026_05_18),
      days: ['rest', 'training', 'training', 'training', 'training', 'training', 'rest'] as const satisfies WeekDays,
      editMode: true,
    });
    useScheduleStore.getState().saveWeekly();
    await waitForLocalStorageWrite(CALENDAR_OVERRIDE_KEY);

    // Sanity: override persisted cu shape correct
    const override = getCalendarOverride(MONDAY_2026_05_18);
    expect(override).not.toBeNull();
    expect(override!.selectedDays[0]).toEqual({ day: 'L', active: false });

    // End-to-end: getDailyWorkout pe Monday respecta rest day override
    const plan = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    expect(plan).toBeNull();
  });

  it('training day override via saveWeekly → getDailyWorkout returns plan pe training day', async () => {
    useScheduleStore.setState({
      weekStartISO: weekStartIso(MONDAY_2026_05_18),
      days: ['rest', 'training', 'training', 'training', 'training', 'training', 'rest'] as const satisfies WeekDays,
      editMode: true,
    });
    useScheduleStore.getState().saveWeekly();
    await waitForLocalStorageWrite(CALENDAR_OVERRIDE_KEY);

    // Tuesday = active training in override
    const override = getCalendarOverride(TUESDAY_2026_05_19);
    expect(override).not.toBeNull();
    expect(override!.selectedDays[1]).toEqual({ day: 'M', active: true });

    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    expect(plan!.type).toBe('training');
  });
});
