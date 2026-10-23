// Founder 2026-10-23 ("de sunt in concediu... light session de bodyweight"): the
// "Fara aparate" pick on the TimeBudget step builds TODAY's session from lifts that
// need nothing (floor, wall, chair, table) — through the real compose path — and
// the in-session swap offers nothing that needs a bar or a machine.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { composePlannedWorkoutToday } from '../../lib/scheduleAdapterAggregate';
import { invalidatePlanCache } from '../../lib/planCache';
import { resolveSwapPickList } from '../../lib/substitution';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { getExerciseMetadata } from '../../../engine/exerciseLibrary.js';
import { needsNoStation } from '../../../engine/sessionBuilder.js';
import { TimeBudget } from '../../routes/screens/antrenor/TimeBudget';

// Monday / Tuesday / Friday of one week (push / pull / legs on a 5-day split).
const DAYS = ['2026-06-01T10:00:00', '2026-06-02T10:00:00', '2026-06-05T10:00:00'].map((d) => new Date(d));

function seedProfile(): void {
  useOnboardingStore.setState({
    data: {
      age: 30, sex: 'm', goal: 'masa', frequency: '5', experience: 'avansat',
      weight: 90, height: 180, trainingType: 'gym', focusPreset: 'balanced', focusPresetPickedAt: null,
    },
    completed: true,
    completedAt: DAYS[0]!.getTime(),
  });
}

const names = async (d: Date): Promise<string[]> => {
  invalidatePlanCache();
  return ((await composePlannedWorkoutToday(d))?.exercises ?? []).map((e) => e.engineName ?? e.name);
};

beforeEach(() => {
  localStorage.clear();
  seedProfile();
  useWorkoutStore.setState({ sessionBodyweightOnly: false, sessionsHistory: [], lastSession: null });
});
afterEach(() => {
  localStorage.removeItem('_devFlags');
  useWorkoutStore.setState({ sessionBodyweightOnly: false });
});

describe('dp_vacation_no_station_v1 — "Fara aparate" day', () => {
  it('every lift needs nothing; legs get squats / bridges, back gets a table row', async () => {
    useWorkoutStore.getState().setSessionBodyweightOnly(true);
    const all: string[] = [];
    for (const d of DAYS) {
      const day = await names(d);
      expect(day.length).toBeGreaterThan(0);
      all.push(...day);
    }
    for (const n of all) expect(needsNoStation(n), n).toBe(true);
    const groups = new Set(all.map((n) => (getExerciseMetadata(n) as { muscle_target_primary?: string }).muscle_target_primary));
    expect(groups.has('spate')).toBe(true);
    expect(groups.has('picioare-quads') || groups.has('fese')).toBe(true);
  });

  it('a gym day is untouched, and the pick changes the cached plan', async () => {
    const gym = await names(DAYS[0]!);
    expect(gym.some((n) => !needsNoStation(n))).toBe(true);
    useWorkoutStore.getState().setSessionBodyweightOnly(true);
    const noGym = await names(DAYS[0]!);
    expect(noGym).not.toEqual(gym);
    useWorkoutStore.getState().setSessionBodyweightOnly(false);
    expect(await names(DAYS[0]!)).toEqual(gym);
  });

  it('flag off → the pick is ignored (byte-identical to a gym day)', async () => {
    const gym = await names(DAYS[0]!);
    localStorage.setItem('_devFlags', JSON.stringify({ dp_vacation_no_station_v1: false }));
    useWorkoutStore.getState().setSessionBodyweightOnly(true);
    expect(await names(DAYS[0]!)).toEqual(gym);
  });

  it('the swap offers only what needs nothing', () => {
    useWorkoutStore.getState().setSessionBodyweightOnly(true);
    const { rows } = resolveSwapPickList('Push-up', 0, [], [], 2);
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) expect(needsNoStation(r.engineName), r.engineName).toBe(true);
  });

  it('station lifts are recognised; floor lifts are not', () => {
    for (const n of ['Pull-up', 'Dip', 'Hanging Leg Raise', 'Hyperextension Bodyweight', 'Inverted Row Bar', 'Nordic Hamstring Curl']) expect(needsNoStation(n), n).toBe(false);
    for (const n of ['Push-up', 'Bench Dip', 'Bodyweight Squat', 'Glute Bridge Bodyweight', 'Inverted Row Table Low', 'Plank']) expect(needsNoStation(n), n).toBe(true);
    expect(needsNoStation('Leg Press')).toBe(false);
  });
});

describe('TimeBudget — "Unde te antrenezi azi?"', () => {
  it('defaults to the gym; "Fara aparate" sets today\'s pick and explains it', () => {
    render(<MemoryRouter><TimeBudget /></MemoryRouter>);
    expect(screen.getByTestId('where-chip-gym').getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByTestId('where-chip-nogym'));
    expect(useWorkoutStore.getState().sessionBodyweightOnly).toBe(true);
    expect(screen.getByTestId('where-nogym-hint')).toBeTruthy();
    fireEvent.click(screen.getByTestId('where-chip-gym'));
    expect(useWorkoutStore.getState().sessionBodyweightOnly).toBe(false);
  });

  it('the pick is cleared when the session ends', () => {
    useWorkoutStore.getState().setSessionBodyweightOnly(true);
    useWorkoutStore.getState().finishSession({ title: 'Workout', meta: '', ts: Date.now(), exercises: [] });
    expect(useWorkoutStore.getState().sessionBodyweightOnly).toBe(false);
  });
});
