// ══ PREVIEW → WORKOUT CONTRACT — what the preview shows is what the session runs ══
// Founder 2026-10-14: "am zis ca vreau picioare si a inceput antrenamentul de umeri
// piept". Each screen was tested alone against a mocked plan, so a pick that lived
// only in the preview's location.state passed every test while the workout re-derived
// the scheduled plan. This suite drives the REAL WorkoutPreview → Start → REAL Workout
// with an engine double whose plan depends on the options it is asked with — any
// pick that does not survive the hop fails here.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const plan = (name: string, sessionType: string) => ({
  workoutTitle: sessionType,
  sessionType,
  exerciseCount: 1,
  estimatedDuration: 50,
  intensityMod: 'normal' as const,
  volumeKg: 5000,
  exercises: [{ id: `${name}-0`, name, engineName: name, sets: 3, targetReps: 8, targetKg: 22.5, restSec: 90 }],
});

vi.mock('../../../lib/engineWrappers', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/engineWrappers')>(
    '../../../lib/engineWrappers'
  );
  return {
    ...actual,
    getPRDelta: vi.fn(() => null),
    getWhyExerciseSummary: vi.fn(() => null),
    // Scheduled = upper; an "Alta grupa" pick = that group's plan.
    getTodayWorkout: vi.fn(async (opts: { differentMuscleCluster?: string } = {}) =>
      opts.differentMuscleCluster === 'legs' ? plan('Leg Press', 'LEGS') : plan('Machine Shoulder Press', 'UPPER')),
  };
});

import { WorkoutPreview } from '../../../routes/screens/antrenor/WorkoutPreview';
import { Workout } from '../../../routes/screens/antrenor/Workout';
import { useWorkoutStore } from '../../../stores/workoutStore';

function Flow({ state }: { state: Record<string, unknown> }): JSX.Element {
  return (
    <MemoryRouter initialEntries={[{ pathname: '/app/antrenor/workout-preview', state }]}>
      <Routes>
        <Route path="/app/antrenor/workout-preview" element={<WorkoutPreview />} />
        <Route path="/app/antrenor/workout" element={<Workout />} />
      </Routes>
    </MemoryRouter>
  );
}

async function startFromPreview(state: Record<string, unknown>): Promise<void> {
  render(<Flow state={state} />);
  await waitFor(() => expect(screen.getByTestId('preview-exercise-list')).toBeInTheDocument());
  fireEvent.click(screen.getByTestId('preview-start-cta'));
  await waitFor(() => expect(screen.getByTestId('wv2-exname')).toBeInTheDocument());
}

beforeEach(() => {
  localStorage.clear();
  useWorkoutStore.setState({
    exIdx: 0, setIdx: 0, phase: 'idle', history: {}, sessionStart: null, pausedSnapshot: null,
    sessionContext: null, sessionPlanOptions: null, sessionTimeBudgetMin: null, sessionEnergy: null,
  });
});

describe('preview → workout contract', () => {
  it('"Alta grupa" → Picioare: the workout runs the legs plan the preview showed', async () => {
    await startFromPreview({ overrideKind: 'different-muscle', differentMuscleCluster: 'legs' });
    expect(screen.getByTestId('wv2-exname')).toHaveTextContent('Leg Press');
  });

  it('no pick: the workout runs the scheduled plan', async () => {
    await startFromPreview({});
    expect(screen.getByTestId('wv2-exname')).toHaveTextContent('Machine Shoulder Press');
  });

  it('"Mai usor azi": the workout loads are the lighter ones the preview announced', async () => {
    await startFromPreview({ overrideKind: 'easier', intensityMod: 'minus' });
    // 22.5 × 0.8 = 18 on the machine grid; the old wiring kept the engine's 22.5.
    await waitFor(() => expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('18 kg'));
  });
});
