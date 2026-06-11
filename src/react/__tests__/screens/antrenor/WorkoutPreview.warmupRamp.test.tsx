// ══ WORKOUT PREVIEW — WARM-UP RAMP display (dp_warmup_ramp_v1) ═══════════════
// The composer attaches the per-set ramp on workout.warmup.warmupSets when the flag
// is on + a qualifying tier-1 opener exists. The component renders it discreetly under
// the OPENING exercise row (idx 0) ONLY when the field is present. These tests drive
// the COMPONENT contract: present → testid `warmup-ramp` renders the snapped steps;
// absent (flag-off shape) → nothing renders. MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import type { PlannedWorkoutOutput } from '../../../lib/engineWrappers';

vi.mock('../../../lib/engineWrappers', () => ({
  getReadiness: vi.fn(() => null),
  getFatigue: vi.fn(() => null),
  getPRDelta: vi.fn(() => null),
  getTodayWorkout: vi.fn(async () => null),
  resolveSessionTitle: vi.fn((sessionType?: string | null) => sessionType ?? 'Antrenamentul tau'),
}));

import * as engineWrappers from '../../../lib/engineWrappers';
import { WorkoutPreview } from '../../../routes/screens/antrenor/WorkoutPreview';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderPreview() {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/app/antrenor/workout-preview', state: {} }]}>
      <Routes>
        <Route path="/app/antrenor/workout-preview" element={<WorkoutPreview />} />
        <Route path="/app/antrenor/workout" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

// Two exercises so we can prove the ramp shows under the OPENING row only.
const EXERCISES = [
  {
    id: 'flat-barbell-bench-0',
    name: 'Impins la piept cu bara',
    engineName: 'Flat Barbell Bench',
    sets: 3,
    targetReps: 6,
    targetKg: 100,
  },
  {
    id: 'cable-fly-1',
    name: 'Fluturari la cablu',
    engineName: 'Cable Fly',
    sets: 3,
    targetReps: 12,
    targetKg: 20,
  },
] as unknown as PlannedWorkoutOutput['exercises'];

function workoutWith(warmupSets?: Array<{ kg: number; reps: number; pct: number }>): PlannedWorkoutOutput {
  return {
    workoutTitle: '__engine_workout_title_fallback__',
    sessionType: 'PUSH',
    exerciseCount: 2,
    estimatedDuration: 45,
    intensityMod: 'normal',
    exercises: EXERCISES,
    volumeKg: 1800,
    warmup:
      warmupSets !== undefined
        ? { line: 'Incalzire ~6 min', durationMin: 6, warmupSets }
        : { line: 'Incalzire ~6 min', durationMin: 6 },
  } as PlannedWorkoutOutput;
}

describe('WorkoutPreview — warm-up ramp (gated on warmup.warmupSets presence)', () => {
  it('renders the ramp steps under the opening row when warmupSets is present', async () => {
    vi.mocked(engineWrappers.getTodayWorkout).mockResolvedValue(
      workoutWith([
        { kg: 50, reps: 10, pct: 50 },
        { kg: 70, reps: 6, pct: 70 },
        { kg: 90, reps: 3, pct: 90 },
      ])
    );
    renderPreview();
    const ramp = await screen.findByTestId('warmup-ramp');
    expect(ramp).toBeInTheDocument();
    // Snapped weights + reps surfaced (arrow-joined).
    expect(ramp.textContent).toMatch(/50 kg x 10/);
    expect(ramp.textContent).toMatch(/70 kg x 6/);
    expect(ramp.textContent).toMatch(/90 kg x 3/);
  });

  it('does NOT render the ramp when warmupSets is absent (flag-off shape)', async () => {
    vi.mocked(engineWrappers.getTodayWorkout).mockResolvedValue(workoutWith(undefined));
    renderPreview();
    // Wait for the plan to settle (exercise rows present) then assert no ramp.
    await screen.findByTestId('preview-exercise-list');
    expect(screen.queryByTestId('warmup-ramp')).toBeNull();
  });

  it('renders the ramp exactly once (opening row only, not per exercise)', async () => {
    vi.mocked(engineWrappers.getTodayWorkout).mockResolvedValue(
      workoutWith([{ kg: 50, reps: 10, pct: 50 }])
    );
    renderPreview();
    await screen.findByTestId('warmup-ramp');
    await waitFor(() => {
      expect(screen.getAllByTestId('warmup-ramp')).toHaveLength(1);
    });
  });
});
