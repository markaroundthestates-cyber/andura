// ══ WORKOUT — fresh start supersedes a lingering pause (BLOCKER 2026-06-13) ══
// Regression: a user who paused a session and did NOT resume/discard it, then
// tapped Start for a fresh workout, arrived at the Workout screen in
// mode='paused' (sessionStart null + pausedSnapshot set). The OLD mount gate
// only started a session on 'idle'|'finished' → startSession never fired →
// the log zone never rendered → the user could not train. Fix: startSession
// also clears pausedSnapshot, and the mount gate also starts on 'paused'.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

const PHASE_5_FIXTURE = {
  workoutTitle: 'Push (piept si umeri)',
  exerciseCount: 5,
  estimatedDuration: 50,
  intensityMod: 'normal' as const,
  volumeKg: 12450,
  exercises: [
    { id: 'bench-press', name: 'Bench Press', sets: 4, targetReps: 10, targetKg: 22.5, restSec: 90 },
    { id: 'overhead-press', name: 'Overhead Press', sets: 4, targetReps: 8, targetKg: 17.5, restSec: 120 },
    { id: 'incline-db', name: 'Incline DB', sets: 3, targetReps: 12, targetKg: 14, restSec: 75 },
    { id: 'lateral-raise', name: 'Lateral Raise', sets: 3, targetReps: 15, targetKg: 6, restSec: 60 },
    { id: 'tricep-pushdown', name: 'Tricep Pushdown', sets: 3, targetReps: 12, targetKg: 25, restSec: 60 },
  ],
};

vi.mock('../../../lib/engineWrappers', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/engineWrappers')>(
    '../../../lib/engineWrappers'
  );
  return {
    ...actual,
    getPRDelta: vi.fn(() => null),
    getTodayWorkout: vi.fn(async () => PHASE_5_FIXTURE),
    getWhyExerciseSummary: vi.fn(() => 'x'),
  };
});

import { Workout } from '../../../routes/screens/antrenor/Workout';
import { useWorkoutStore } from '../../../stores/workoutStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderWorkout() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/workout']}>
      <Routes>
        <Route path="/app/antrenor/workout" element={<Workout />} />
        <Route path="/app/antrenor" element={<LocationProbe />} />
        <Route path="/app/antrenor/post-rpe" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Workout — fresh start supersedes a lingering pause', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('_devFlags', JSON.stringify({ dp_rep_class_v1: false, dp_load_model_v1: false }));
    // Exact lingering-paused state: the user paused once (pausedSnapshot set,
    // sessionStart null, phase idle), returned to Antrenor WITHOUT resuming,
    // then tapped Start for a fresh workout → navigates to /workout. There is
    // also a prior lastSession (a returning user always has one), so without the
    // fix getCurrentMode would report 'paused' (which precedes 'finished').
    useWorkoutStore.setState({
      exIdx: 0,
      setIdx: 0,
      phase: 'idle',
      prHit: false,
      prData: null,
      history: {},
      sessionStart: null,
      lastRating: null,
      pausedSnapshot: {
        title: 'Pull',
        meta: 'ex 2',
        exIdx: 1,
        setIdx: 0,
        phase: 'logging',
        history: {},
        sessionStart: Date.now() - 600_000,
      },
      lastSession: { title: 'Pull', meta: '5 seturi', ts: Date.now() - 86_400_000 },
      streak: 0,
      sessionContext: null,
    });
  });

  it('starts a session on mount and renders the log zone (was a dead paused mount)', async () => {
    // Sanity: the pre-condition is genuinely a lingering pause.
    expect(useWorkoutStore.getState().pausedSnapshot).not.toBeNull();
    expect(useWorkoutStore.getState().sessionStart).toBeNull();

    renderWorkout();

    await waitFor(() => {
      expect(screen.queryByTestId('workout-loading')).not.toBeInTheDocument();
    });

    const st = useWorkoutStore.getState();
    // A fresh session was started...
    expect(st.sessionStart).not.toBeNull();
    expect(st.phase).toBe('logging');
    // ...the abandoned pause was superseded (cleared)...
    expect(st.pausedSnapshot).toBeNull();
    // ...and the interactive log zone renders so the user can train.
    expect(screen.queryByTestId('log-zone')).not.toBeNull();
  });
});
