// ══ WORKOUT IN-SESSION SWAP TESTS — WP-5 moat ════════════════════════════════
// The "Aparat ocupat" + "Nu vreau" buttons must produce an IN-PLACE NAMED swap
// (the current exercise changes + a toast names the alternative), NOT navigate
// away. Uses a fixture with REAL engineName library keys so the substitution
// resolves a concrete alternative (anti "verde pe gol").

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Fixture carries engineName (the EN canonical library key) so the in-session
// swap can resolve a real alternative. Incline Barbell Bench (barbell) has a
// fallback cascade; Incline DB Press (dumbbell) has ranked alternatives.
const SWAP_FIXTURE = {
  workoutTitle: 'Push',
  exerciseCount: 2,
  estimatedDuration: 50,
  intensityMod: 'normal' as const,
  volumeKg: 5000,
  exercises: [
    {
      id: 'incline-barbell-bench-0',
      name: 'inclinat cu bara',
      engineName: 'Incline Barbell Bench',
      sets: 3,
      targetReps: 8,
      targetKg: 60,
      restSec: 90,
    },
    {
      id: 'incline-db-press-1',
      name: 'Impins inclinat',
      engineName: 'Incline DB Press',
      sets: 3,
      targetReps: 10,
      targetKg: 22,
      restSec: 90,
    },
  ],
};

vi.mock('../../../lib/engineWrappers', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/engineWrappers')>(
    '../../../lib/engineWrappers'
  );
  return {
    ...actual,
    getPRDelta: vi.fn(() => null),
    getTodayWorkout: vi.fn(async () => SWAP_FIXTURE),
    getWhyExerciseSummary: vi.fn(() => 'x'),
  };
});

import { Workout } from '../../../routes/screens/antrenor/Workout';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { toast } from '../../../lib/toast';

function renderWorkout() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/workout']}>
      <Routes>
        <Route path="/app/antrenor/workout" element={<Workout />} />
        <Route path="/app/antrenor/equipment-swap" element={<div data-testid="probe-eq" />} />
        <Route path="/app/antrenor/ceva-nu-merge" element={<div data-testid="probe-cnm" />} />
      </Routes>
    </MemoryRouter>
  );
}

async function renderAndWait() {
  const r = renderWorkout();
  await waitFor(() => {
    expect(screen.queryByTestId('workout-loading')).not.toBeInTheDocument();
  });
  return r;
}

beforeEach(() => {
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    history: {},
    sessionStart: null,
    pausedSnapshot: null,
    lastSession: null,
  });
  localStorage.clear();
  toast.clear();
});

afterEach(() => {
  toast.clear();
});

describe('Workout in-session swap — "Aparat ocupat"', () => {
  it('swaps the current exercise in-place + toasts the NAMED alternative (no navigate)', async () => {
    await renderAndWait();
    // Current exercise = the barbell movement.
    const exname = screen.getByTestId('wv2-exname');
    expect(exname.textContent).toContain('inclinat cu bara');

    fireEvent.click(screen.getByTestId('wv2-ex-action-ocupat'));

    await waitFor(() => {
      const toasts = toast.getSnapshot();
      expect(toasts.length).toBeGreaterThan(0);
    });
    const msg = toast.getSnapshot()[0]!.message;
    // NAMED swap toast — the moat surfacing.
    expect(msg).toContain('Inlocuit');
    expect(msg).toContain('inclinat cu bara'); // original named
    // The current exercise name changed (in-place swap), did NOT navigate away.
    expect(screen.queryByTestId('probe-eq')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('wv2-exname').textContent).not.toContain('inclinat cu bara');
    });
  });
});

describe('Workout in-session swap — "Nu vreau"', () => {
  it('swaps via preference ranking + increments refusal counter', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByTestId('wv2-ex-action-nuvreau'));

    await waitFor(() => {
      expect(toast.getSnapshot().length).toBeGreaterThan(0);
    });
    expect(toast.getSnapshot()[0]!.message).toContain('Inlocuit');
    // Refusal counter persisted for the original engine name.
    const counter = JSON.parse(localStorage.getItem('wv2-refusal-counter') ?? '{}');
    expect(counter['Incline Barbell Bench']).toBe(1);
    // Did NOT navigate to the picker.
    expect(screen.queryByTestId('probe-cnm')).not.toBeInTheDocument();
  });
});
