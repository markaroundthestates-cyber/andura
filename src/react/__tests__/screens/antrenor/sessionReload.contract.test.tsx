// ══ SESSION RELOAD CONTRACT — an app kill mid-workout resumes the SAME session ══
// A phone OS-kills a backgrounded PWA routinely. On reopen, Workout re-derives the
// plan; logged sets are index-aligned to it, so every input that shaped the plan or
// its loads must survive the kill (founder 2026-10-14: the "Alta grupa" pick, the
// time budget and a pain report did not). Each case drives the REAL Workout, kills
// the app (in-memory store back to its initial state, persisted storage kept),
// reopens, and asserts the same exercise, loads and logged sets. The engine double's
// plan depends on the options it is asked with AND on the time budget, which — like
// the real trim — drops a MIDDLE exercise.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const PLANS = {
  upper: ['Machine Shoulder Press', 'Lat Pulldown', 'Cable Row'],
  legs: ['Leg Press', 'Leg Extension', 'Leg Curl'],
};
// Legs = one set per exercise, so a test walks to exercise 2 without tripping the
// fast-logging check (two sets seconds apart opens its "were these real?" modal).
const ex = (sets: number) => (name: string) => ({ id: name, name, engineName: name, sets, targetReps: 8, targetKg: 22.5, restSec: 90 });

vi.mock('../../../lib/engineWrappers', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/engineWrappers')>(
    '../../../lib/engineWrappers'
  );
  return {
    ...actual,
    getPRDelta: vi.fn(() => null),
    getWhyExerciseSummary: vi.fn(() => null),
    getTodayWorkout: vi.fn(async (opts: { differentMuscleCluster?: string } = {}) => {
      const { useWorkoutStore: store } = await import('../../../stores/workoutStore');
      const legs = opts.differentMuscleCluster === 'legs';
      const names = PLANS[legs ? 'legs' : 'upper'];
      const kept = store.getState().sessionTimeBudgetMin !== null ? [names[0]!, names[2]!] : names;
      return {
        workoutTitle: 'T', sessionType: 'X', exerciseCount: kept.length, estimatedDuration: 40,
        intensityMod: 'normal' as const, volumeKg: 1000, exercises: kept.map(ex(legs ? 1 : 2)),
      };
    }),
  };
});

import { WorkoutPreview } from '../../../routes/screens/antrenor/WorkoutPreview';
import { Workout } from '../../../routes/screens/antrenor/Workout';
import { useWorkoutStore } from '../../../stores/workoutStore';

const PERSIST_KEY = 'wv2-workout-store';

function App({ at, state }: { at: string; state?: Record<string, unknown> }): JSX.Element {
  return (
    <MemoryRouter initialEntries={[{ pathname: at, state: state ?? {} }]}>
      <Routes>
        <Route path="/app/antrenor/workout-preview" element={<WorkoutPreview />} />
        <Route path="/app/antrenor/workout" element={<Workout />} />
      </Routes>
    </MemoryRouter>
  );
}

async function waitForExercise(): Promise<void> {
  await waitFor(() => expect(screen.getByTestId('wv2-exname')).toBeInTheDocument());
  await waitFor(() => expect(screen.getByTestId('setlog-tinta-kg')).not.toHaveTextContent(/^0 kg$/));
}

async function startFromPreview(state: Record<string, unknown>): Promise<void> {
  render(<App at="/app/antrenor/workout-preview" state={state} />);
  await waitFor(() => expect(screen.getByTestId('preview-exercise-list')).toBeInTheDocument());
  fireEvent.click(screen.getByTestId('preview-start-cta'));
  await waitForExercise();
}

function logSet(): void {
  fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'));
  fireEvent.click(screen.getByRole('button', { name: /^Just right$/i }));
}

/** OS kill: memory back to initial state, persisted storage kept, rehydrated on boot. */
async function kill(): Promise<void> {
  cleanup();
  const persisted = localStorage.getItem(PERSIST_KEY);
  useWorkoutStore.setState(useWorkoutStore.getInitialState(), true);
  if (persisted !== null) localStorage.setItem(PERSIST_KEY, persisted);
  await useWorkoutStore.persist.rehydrate();
}

async function reopenWorkout(): Promise<void> {
  render(<App at="/app/antrenor/workout" />);
  await waitForExercise();
}

async function killAndReopen(): Promise<void> {
  await kill();
  await reopenWorkout();
}

// After an exercise's last set a 1.5 s "next exercise" splash plays before it.
const snapshot = () => ({
  exercise: screen.getByTestId('wv2-exname').textContent,
  kg: screen.getByTestId('setlog-tinta-kg').textContent,
  history: JSON.stringify(useWorkoutStore.getState().history),
  exIdx: useWorkoutStore.getState().exIdx,
});

beforeEach(() => {
  cleanup();
  localStorage.clear();
  useWorkoutStore.setState(useWorkoutStore.getInitialState(), true);
});

describe('session reload contract', () => {
  it('scheduled plan, killed after a logged set: same exercise, load, sets', async () => {
    await startFromPreview({});
    logSet();
    fireEvent.click(screen.getByTestId('rest-skip'));
    const before = snapshot();
    await killAndReopen();
    expect(snapshot()).toEqual(before);
  });

  it('killed mid-rest: the rest resumes on the same exercise', async () => {
    await startFromPreview({});
    logSet();
    await kill();
    render(<App at="/app/antrenor/workout" />);
    await waitFor(() => expect(screen.getByTestId('rest-overlay')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('rest-skip'));
    await waitFor(() => expect(screen.getByTestId('wv2-exname')).toHaveTextContent('Machine Shoulder Press'));
    expect(useWorkoutStore.getState().history[0]).toHaveLength(1);
  });

  it('"Alta grupa" legs + time budget, killed on exercise 2: still the trimmed legs plan', async () => {
    useWorkoutStore.getState().setSessionTimeBudgetMin(30);
    await startFromPreview({ overrideKind: 'different-muscle', differentMuscleCluster: 'legs' });
    logSet(); fireEvent.click(screen.getByTestId('rest-skip'));
    await waitFor(() => expect(screen.getByTestId('wv2-exname')).toHaveTextContent('Leg Curl'), { timeout: 4000 });
    const before = snapshot();
    await killAndReopen();
    expect(snapshot()).toEqual(before);
  });

  it('pain reported mid-session, then killed: the remaining sets stay lighter', async () => {
    await startFromPreview({});
    logSet(); fireEvent.click(screen.getByTestId('rest-skip'));
    // What PainButton does in-session.
    useWorkoutStore.getState().setSessionContext({ intensityMod: 'minus', painContext: { region: 'umar', intensity: 2 } });
    await waitFor(() => expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('18 kg'));
    await killAndReopen();
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('18 kg');
  });

  it('"Mai usor azi", killed: the loads stay lighter', async () => {
    await startFromPreview({ overrideKind: 'easier', intensityMod: 'minus' });
    await waitFor(() => expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('18 kg'));
    await killAndReopen();
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('18 kg');
  });

  it('paused, killed, resumed: the paused session comes back on its plan', async () => {
    useWorkoutStore.getState().setSessionTimeBudgetMin(30);
    await startFromPreview({ overrideKind: 'different-muscle', differentMuscleCluster: 'legs' });
    logSet(); fireEvent.click(screen.getByTestId('rest-skip'));
    await waitFor(() => expect(screen.getByTestId('wv2-exname')).toHaveTextContent('Leg Curl'), { timeout: 4000 });
    const before = snapshot();
    useWorkoutStore.getState().pauseSession('Picioare');
    await kill();
    useWorkoutStore.getState().resumeSession(); // the Resume card
    await reopenWorkout();
    expect(snapshot()).toEqual(before);
  });
});
