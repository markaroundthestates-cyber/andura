// ══ WORKOUT COACH SURFACE — #63 confidence + #56 moat "why?" (flags OFF/ON) ══
// Proves the two subtle coach surfaces:
//   A. dp_coach_confidence_v1 — a quiet role="status" confidence line per exercise.
//   B. dp_moat_why_v1 — the "why?" modal reads the engine's REAL recReason status.
// Both flags default OFF → the surfaces are ABSENT (byte-identical Workout). Flipped
// ON via _devFlags → the minimal surface appears, jargon-free, sourced from the
// carried F5-W0 fields (confidence.sigma / recReason.status), never a re-guess.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Fixture exercise carries the F5-W0 fields (recReason + confidence) the surfaces read.
// Bench Press: narrow sigma + enough observations → DIALED_IN; EASE BACK reason.
const FIXTURE = {
  workoutTitle: 'Push',
  exerciseCount: 1,
  estimatedDuration: 30,
  intensityMod: 'normal' as const,
  volumeKg: 4000,
  exercises: [
    {
      id: 'bench-press',
      name: 'Bench Press',
      engineName: 'Bench Press',
      sets: 3,
      targetReps: 8,
      targetKg: 60,
      restSec: 120,
      recReason: { status: 'EASE BACK', note: 'A fost greu.' },
      confidence: { sigma: 3, n: 5 },
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
    getTodayWorkout: vi.fn(async () => FIXTURE),
    // The OFF-path categorical re-guess; distinct copy so we can assert the ON
    // path replaces it with the real-reason sentence.
    getWhyExerciseSummary: vi.fn(() => 'CATEGORICAL_FALLBACK_REGUESS'),
  };
});

import { Workout } from '../../../routes/screens/antrenor/Workout';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

function renderWorkout() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/workout']}>
      <Routes>
        <Route path="/app/antrenor/workout" element={<Workout />} />
        <Route path="*" element={<div data-testid="nav-probe" />} />
      </Routes>
    </MemoryRouter>
  );
}

async function renderAndStart() {
  const r = renderWorkout();
  await waitFor(() => {
    expect(screen.queryByTestId('workout-loading')).not.toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.queryByTestId('wv2-exname')).toBeInTheDocument();
  });
  return r;
}

beforeEach(() => {
  try { localStorage.clear(); } catch { /* swallow */ }
  _resetI18nCache();
  setLocale('en');
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    prHit: false,
    prData: null,
    history: {},
    sessionStart: null,
    lastRating: null,
  });
});

afterEach(() => {
  try { localStorage.removeItem('_devFlags'); } catch { /* swallow */ }
  _resetI18nCache();
});

describe('#63 coach confidence — flag dp_coach_confidence_v1', () => {
  it('OFF: NO confidence line in the DOM (byte-identical)', async () => {
    // default flipped ON 2026-06-14 → pin OFF via _devFlags to keep the OFF path covered
    localStorage.setItem('_devFlags', JSON.stringify({ dp_coach_confidence_v1: false }));
    await renderAndStart();
    expect(screen.queryByTestId('coach-confidence-note')).not.toBeInTheDocument();
  });

  it('ON: renders ONE quiet confidence line (role=status), jargon-free, dialed-in copy', async () => {
    localStorage.setItem('_devFlags', JSON.stringify({ dp_coach_confidence_v1: true }));
    await renderAndStart();
    const note = await screen.findByTestId('coach-confidence-note');
    expect(note).toBeInTheDocument();
    expect(note).toHaveAttribute('role', 'status');
    // sigma 3 + n 5 → DIALED_IN → "Dialed in on Bench Press." (EN)
    expect(note.textContent).toContain('Dialed in on Bench Press.');
    // GIGEL: no number / jargon in the rendered line.
    expect(/\d|RPE|RIR|e1RM|1RM|sigma|MEV|kg/i.test(note.textContent ?? '')).toBe(false);
  });
});

describe('#56 moat "why?" — flag dp_moat_why_v1', () => {
  it('OFF: the "why?" modal shows the categorical re-guess, NOT the real reason', async () => {
    // default flipped ON 2026-06-14 → pin OFF via _devFlags to keep the OFF path covered
    localStorage.setItem('_devFlags', JSON.stringify({ dp_moat_why_v1: false }));
    await renderAndStart();
    fireEvent.click(screen.getByTestId('wv2-why-trigger'));
    const text = await screen.findByTestId('why-modal-text');
    expect(text.textContent).toContain('CATEGORICAL_FALLBACK_REGUESS');
  });

  it('ON: the "why?" modal shows the engine REAL reason (EASE BACK), not the re-guess', async () => {
    localStorage.setItem('_devFlags', JSON.stringify({ dp_moat_why_v1: true }));
    await renderAndStart();
    fireEvent.click(screen.getByTestId('wv2-why-trigger'));
    const text = await screen.findByTestId('why-modal-text');
    // EASE BACK → why.reason.easeBack (EN) — the real ease-back framing.
    expect(text.textContent).toContain('easing off');
    expect(text.textContent).not.toContain('CATEGORICAL_FALLBACK_REGUESS');
  });
});
