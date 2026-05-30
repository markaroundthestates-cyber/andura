// ══ WORKOUT TESTS — task_08 state machine UI + timers + exit flows ═══════
// MemoryRouter jsdom paradigm per D020. vi.useFakeTimers pentru session +
// rest countdown advance.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// Phase 6 task_02 Option C — fixture matches Phase 5 baseline shape (preserve
// existing test assertions). Async mock returns Promise; tests await loading
// state clear via waitFor. Per DECISIONS.md §D027.
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

// Mock engineWrappers BEFORE Workout import (hoisted vi.mock).
vi.mock('../../../lib/engineWrappers', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/engineWrappers')>(
    '../../../lib/engineWrappers'
  );
  return {
    ...actual,
    getPRDelta: vi.fn(() => null), // default no PR; per-test override
    // Phase 6 task_02 Option C async signature — default Phase 5 fixture preserve
    // assertions; per-test override via mockResolvedValueOnce(null) pentru empty
    // state tests.
    getTodayWorkout: vi.fn(async () => PHASE_5_FIXTURE),
    // §F-workout-05 — why-exercise explainer; default categorical summary,
    // per-test override (e.g. null → why.unavailable fallback copy).
    getWhyExerciseSummary: vi.fn(() => 'Pastram greutatea azi. Esti intr-o zona de consolidare.'),
  };
});

import { Workout } from '../../../routes/screens/antrenor/Workout';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { getPRDelta, getTodayWorkout, getWhyExerciseSummary } from '../../../lib/engineWrappers';
import { DB } from '../../../../db.js';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderWorkout() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/workout']}>
      <Routes>
        <Route path="/app/antrenor/workout" element={<Workout />} />
        <Route path="/app/antrenor/post-rpe" element={<LocationProbe />} />
        {/* §F-workout-03 — in-workout substitution row targets. */}
        <Route path="/app/antrenor/equipment-swap" element={<LocationProbe />} />
        <Route path="/app/antrenor/ceva-nu-merge" element={<LocationProbe />} />
        {/* P-05 — ⋯ menu action targets. */}
        <Route path="/app/antrenor/pain-button" element={<LocationProbe />} />
        <Route path="/app/antrenor/finish-early-confirm" element={<LocationProbe />} />
        <Route path="/app/antrenor" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

// Phase 6 task_02 Option C: render + await loading state clear. Workout
// component fires getTodayWorkout() în useEffect → setExercises async resolve
// → loading section unmount → log-zone/empty branch renders. Test code awaits
// loading state to clear before asserting on session UI.
async function renderWorkoutAndWait(): Promise<ReturnType<typeof renderWorkout>> {
  const result = renderWorkout();
  // Wait for loading state to clear (exercises async resolve)
  await waitFor(() => {
    expect(screen.queryByTestId('workout-loading')).not.toBeInTheDocument();
  });
  // Phase 6 task_02 Option C + §F-pass2-setloginput-02: wait for input-sync
  // useEffect to propagate kg/reps from currentExercise. Logging phase now
  // opens at pre-log `tinta` (target display, NO kg-input) per mockup wv2 two-
  // step — assert on the tinta target value instead. Empty-state skips both.
  await waitFor(() => {
    const tintaKg = screen.queryByTestId('setlog-tinta-kg');
    const emptyBack = screen.queryByTestId('workout-empty-back');
    expect(emptyBack !== null || (tintaKg !== null && (tintaKg.textContent ?? '') !== '0 kg')).toBe(true);
  });
  return result;
}

// §F-pass2-setloginput-02 — mockup wv2 two-step helper: pre-log `tinta` →
// tap "Logheaza setul" → post-log reveals the rating row → tap a rating.
// Replaces the old direct rating tap (rating was always visible pre-fix).
//
// Wave E1 — under EN default the rating button labels surface as
// Easy/Just right/Hard. The helper maps the test-facing RO alias to the
// EN label so call sites stay stable; if/when tests are re-keyed to EN
// directly this map can go away.
const EN_RATING_LABEL: Record<'Usor' | 'Potrivit' | 'Greu', RegExp> = {
  Usor: /^Easy$/i,
  Potrivit: /^Just right$/i,
  Greu: /^Hard$/i,
};
function logSet(rating: 'Usor' | 'Potrivit' | 'Greu'): void {
  fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'));
  fireEvent.click(screen.getByRole('button', { name: EN_RATING_LABEL[rating] }));
}

// Optional kg/reps revise before rating: tap Logheaza → pencil edit → change
// inputs → rate. Mirrors mockup post-log pencil affordance.
function logSetWithEdit(
  rating: 'Usor' | 'Potrivit' | 'Greu',
  changes: { kg?: string; reps?: string } = {},
): void {
  fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'));
  fireEvent.click(screen.getByTestId('setlog-postlog-edit'));
  if (changes.kg !== undefined) {
    fireEvent.change(screen.getByTestId('kg-input'), { target: { value: changes.kg } });
  }
  if (changes.reps !== undefined) {
    fireEvent.change(screen.getByTestId('reps-input'), { target: { value: changes.reps } });
  }
  fireEvent.click(screen.getByRole('button', { name: EN_RATING_LABEL[rating] }));
}

function resetStore(): void {
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    prHit: false,
    prData: null,
    history: {},
    sessionStart: null,
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    streak: 0,
    sessionContext: null,
  });
  localStorage.clear();
  vi.mocked(getPRDelta).mockReturnValue(null);
}

describe('Workout — base render (phase=idle init → logging)', async () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders Workout section cu data-phase attribute', async () => {
    await renderWorkoutAndWait();
    expect(screen.getByTestId('workout')).toBeInTheDocument();
  });

  it('renders header cu first exercise title "Bench Press"', async () => {
    await renderWorkoutAndWait();
    expect(screen.getByTestId('workout-title')).toHaveTextContent('Bench Press');
  });

  it('renders progress "Ex 1/5"', async () => {
    await renderWorkoutAndWait();
    expect(screen.getByTestId('workout-progress')).toHaveTextContent('Ex 1/5');
  });

  it('startSession kicks off auto (phase becomes logging post-mount)', async () => {
    await renderWorkoutAndWait();
    expect(useWorkoutStore.getState().phase).toBe('logging');
    expect(useWorkoutStore.getState().sessionStart).not.toBeNull();
  });

  it('renders log zone cu set counter "Set 1/4"', async () => {
    await renderWorkoutAndWait();
    expect(screen.getByTestId('log-zone')).toBeInTheDocument();
    expect(screen.getByTestId('log-zone')).toHaveTextContent('Set 1/4');
  });

  it('opens pre-log tinta cu default target values (22.5 kg / 10 repetari)', async () => {
    // §F-pass2-setloginput-02 — logging phase now opens at `tinta` (target
    // display + Logheaza CTA), inputs hidden until pencil edit. Mockup wv2.
    await renderWorkoutAndWait();
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('22.5 kg');
    expect(screen.getByTestId('setlog-tinta-reps')).toHaveTextContent('10');
    expect(screen.queryByTestId('kg-input')).not.toBeInTheDocument();
  });

  it('renders kg + reps inputs after pencil edit (revise flow)', async () => {
    // §F-pass2-setloginput-02 — Logheaza → post-log → pencil reveals editable
    // inputs synced to target values.
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'));
    fireEvent.click(screen.getByTestId('setlog-postlog-edit'));
    expect(screen.getByTestId('kg-input')).toHaveValue(22.5);
    expect(screen.getByTestId('reps-input')).toHaveValue(10);
  });

  it('renders 3 rating buttons (Easy / Just right / Hard under EN default) after Logheaza', async () => {
    // §F-pass2-setloginput-02 — rating row hidden pre-log, revealed post-log.
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'));
    expect(screen.getByRole('button', { name: /^Easy$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Just right$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Hard$/i })).toBeInTheDocument();
  });

  it('renders exit X button cu accessible name', async () => {
    await renderWorkoutAndWait();
    expect(screen.getByTestId('workout-exit-trigger')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Iesi din sesiune|Leave the session/i })
    ).toBeInTheDocument();
  });
});

// C3 — target kg modulated by the ENGINE intensityMod baseline (deload output),
// NOT the EnergyCheck self-report. Once readiness is persisted (C2) the
// self-report already shapes the prescription via the readiness read-side;
// stacking a second self-report multiplier here double-counted. Bench Press
// DP target 22.5 kg. Magnitudes (-20% / +15%) unchanged (deferred Daniel UX).
describe('Workout — engine intensity applied to target (C3)', async () => {
  beforeEach(() => {
    resetStore();
  });

  it('engine intensityMod minus reduce target kg -20% (22.5 → 18)', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce({ ...PHASE_5_FIXTURE, intensityMod: 'minus' });
    await renderWorkoutAndWait();
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('18 kg');
  });

  it('engine intensityMod plus creste target kg +15% (22.5 → 26)', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce({ ...PHASE_5_FIXTURE, intensityMod: 'plus' });
    await renderWorkoutAndWait();
    // 22.5 * 1.15 = 25.875 → round 0.5 = 26
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('26 kg');
  });

  it('engine intensityMod normal pastreaza target kg neschimbat (22.5)', async () => {
    await renderWorkoutAndWait();
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('22.5 kg');
  });

  it('self-report sessionContext NU mai multiplica weight (anti double-count)', async () => {
    // Self-report minus, engine normal → weight stays baseline (no stacking).
    // The self-report now feeds the engine VIA readiness (C2), not a direct
    // weight multiplier here.
    useWorkoutStore.getState().setSessionContext({ intensityMod: 'minus', painContext: null });
    await renderWorkoutAndWait();
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('22.5 kg');
  });
});

describe('Workout — state machine logging → rest', async () => {
  beforeEach(() => {
    resetStore();
  });

  it('rating set 1 of 4 advances phase la rest', async () => {
    await renderWorkoutAndWait();
    logSet('Potrivit');
    expect(useWorkoutStore.getState().phase).toBe('rest');
  });

  it('rest overlay rendered cu countdown', async () => {
    await renderWorkoutAndWait();
    logSet('Usor');
    expect(screen.getByTestId('rest-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('rest-countdown')).toBeInTheDocument();
  });

  it('rest countdown starts at exercise restSec (Bench Press = 90s = 1:30)', async () => {
    await renderWorkoutAndWait();
    logSet('Usor');
    expect(screen.getByTestId('rest-countdown')).toHaveTextContent('1:30');
  });

  it('logSet persists kg + reps + rating la history', async () => {
    await renderWorkoutAndWait();
    // §F-pass2-setloginput-02 — revise kg/reps via pencil edit then rate.
    logSetWithEdit('Greu', { kg: '25', reps: '8' });
    const hist = useWorkoutStore.getState().history[0];
    expect(hist).toHaveLength(1);
    // Phase 4 task_14: timestamp auto-stamped by logSet — match partial
    // pentru backward compat assertion intent (kg/reps/rating).
    expect(hist![0]).toMatchObject({ kg: 25, reps: 8, rating: 'greu' });
    expect(typeof hist![0]!.timestamp).toBe('number');
  });

  it('skip rest button transitions phase back la logging', async () => {
    await renderWorkoutAndWait();
    logSet('Usor');
    expect(useWorkoutStore.getState().phase).toBe('rest');
    fireEvent.click(screen.getByTestId('rest-skip'));
    expect(useWorkoutStore.getState().phase).toBe('logging');
  });

  it('set history renders previous sets as done set-chips (kg/reps/rating preserved in accessible label)', async () => {
    await renderWorkoutAndWait();
    logSet('Usor');
    fireEvent.click(screen.getByTestId('rest-skip'));
    // [11.324] re-skin: the logged set is a glowing .set-chip-done (check icon),
    // the kg x reps x rating detail moved to aria-label/title so the data is
    // not lost. testid set-history-0 still marks the logged chip.
    const chip = screen.getByTestId('set-history-0');
    expect(chip.className).toContain('set-chip-done');
    expect(chip).toHaveAttribute('aria-label', expect.stringMatching(/22.5 kg x 10 reps - usor/));
  });

  it('set counter advances "Set 2/4" after first set logged', async () => {
    await renderWorkoutAndWait();
    logSet('Potrivit');
    fireEvent.click(screen.getByTestId('rest-skip'));
    expect(screen.getByTestId('log-zone')).toHaveTextContent('Set 2/4');
  });
});

describe('Workout — rest countdown timer (fake timers)', async () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rest countdown decrements each second', async () => {
    await renderWorkoutAndWait();
    logSet('Usor');
    expect(screen.getByTestId('rest-countdown')).toHaveTextContent('1:30');
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId('rest-countdown')).toHaveTextContent('1:27');
  });

  it('rest countdown reaching 0 auto-advances phase la logging', async () => {
    await renderWorkoutAndWait();
    logSet('Usor');
    act(() => {
      vi.advanceTimersByTime(91000);
    });
    expect(useWorkoutStore.getState().phase).toBe('logging');
  });
});

describe('Workout — state machine transition + advance exercise', async () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // Phase 4 task_14 LOCK 9: advance fake timers > 30s between sets to bypass
  // aaFrictionDetect fast_sets pattern trigger (insufficient recovery).
  const advanceBeyondFastSetsWindow = (): void => {
    act(() => {
      vi.advanceTimersByTime(31000);
    });
  };

  it('logging last set of exercise (4 of 4 Bench Press) → transition phase', async () => {
    await renderWorkoutAndWait();
    // Log 4 sets: rest skips between + > 30s gap pentru aaFriction bypass.
    // §F-pass2-setloginput-02 — each set: Logheaza → rate (logSet helper).
    for (let i = 0; i < 4; i++) {
      logSet('Potrivit');
      if (i < 3) {
        fireEvent.click(screen.getByTestId('rest-skip'));
        advanceBeyondFastSetsWindow();
      }
    }
    expect(useWorkoutStore.getState().phase).toBe('transition');
    expect(screen.getByTestId('transition-screen')).toBeInTheDocument();
  });

  it('transition phase shows next exercise name', async () => {
    await renderWorkoutAndWait();
    for (let i = 0; i < 4; i++) {
      logSet('Usor');
      if (i < 3) {
        fireEvent.click(screen.getByTestId('rest-skip'));
        advanceBeyondFastSetsWindow();
      }
    }
    expect(screen.getByTestId('transition-next-name')).toHaveTextContent('Overhead Press');
  });

  it('transition advances exIdx after 1.5s', async () => {
    await renderWorkoutAndWait();
    for (let i = 0; i < 4; i++) {
      logSet('Usor');
      if (i < 3) {
        fireEvent.click(screen.getByTestId('rest-skip'));
        advanceBeyondFastSetsWindow();
      }
    }
    expect(useWorkoutStore.getState().exIdx).toBe(0);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(useWorkoutStore.getState().exIdx).toBe(1);
    expect(useWorkoutStore.getState().phase).toBe('logging');
  });
});

describe('Workout — finish last set of last exercise navigates post-rpe', async () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('logging last set of last exercise (Tricep Pushdown set 3/3) navigates post-rpe', async () => {
    // Seed store directly la exIdx=4 (Tricep Pushdown, last exercise) cu 2 sets logged.
    useWorkoutStore.setState({
      exIdx: 4,
      phase: 'logging',
      history: {
        4: [
          { kg: 25, reps: 12, rating: 'potrivit' },
          { kg: 25, reps: 12, rating: 'potrivit' },
        ],
      },
      sessionStart: Date.now() - 1000,
    });
    await renderWorkoutAndWait();
    logSet('Potrivit');
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/post-rpe'
    );
  });
});

describe('Workout — exit confirm 3-option sheet', async () => {
  beforeEach(() => {
    resetStore();
  });

  it('exit X opens sheet', async () => {
    await renderWorkoutAndWait();
    expect(screen.queryByTestId('exit-sheet')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('workout-exit-trigger'));
    expect(screen.getByTestId('exit-sheet')).toBeInTheDocument();
  });

  it('sheet shows 3 options Continui / Salveaza / Renunt', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('workout-exit-trigger'));
    expect(screen.getByTestId('exit-continue')).toBeInTheDocument();
    expect(screen.getByTestId('exit-pause')).toBeInTheDocument();
    expect(screen.getByTestId('exit-discard')).toBeInTheDocument();
  });

  it('Continui closes sheet, no navigation', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('workout-exit-trigger'));
    fireEvent.click(screen.getByTestId('exit-continue'));
    expect(screen.queryByTestId('exit-sheet')).not.toBeInTheDocument();
    expect(screen.queryByTestId('probe')).not.toBeInTheDocument();
  });

  it('Salveaza pause stores pausedSnapshot + navigates antrenor', async () => {
    await renderWorkoutAndWait();
    // Log one set so we have content în history pre-pause.
    logSet('Usor');
    fireEvent.click(screen.getByTestId('rest-skip'));
    fireEvent.click(screen.getByTestId('workout-exit-trigger'));
    fireEvent.click(screen.getByTestId('exit-pause'));
    expect(useWorkoutStore.getState().pausedSnapshot).not.toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor'
    );
  });

  it('Renunt discards state + navigates antrenor', async () => {
    await renderWorkoutAndWait();
    logSet('Greu');
    fireEvent.click(screen.getByTestId('rest-skip'));
    fireEvent.click(screen.getByTestId('workout-exit-trigger'));
    fireEvent.click(screen.getByTestId('exit-discard'));
    expect(useWorkoutStore.getState().history).toEqual({});
    expect(useWorkoutStore.getState().sessionStart).toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor'
    );
  });
});

describe('Workout — session elapsed timer (fake timers)', async () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('elapsed text increments per second', async () => {
    await renderWorkoutAndWait();
    expect(screen.getByTestId('workout-elapsed')).toHaveTextContent('0:00');
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId('workout-elapsed')).toHaveTextContent('0:05');
  });

  it('elapsed crosses minute boundary correctly (1:01 at 61s)', async () => {
    await renderWorkoutAndWait();
    act(() => {
      vi.advanceTimersByTime(61000);
    });
    expect(screen.getByTestId('workout-elapsed')).toHaveTextContent('1:01');
  });
});

describe('Workout — empty state (task_17 §B WV2_FALLBACK retired)', async () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders empty state cand getTodayWorkout returns null — EN default', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(null);
    await renderWorkoutAndWait();
    expect(screen.getByTestId('workout')).toHaveAttribute('data-phase', 'empty');
    // Wave C2 i18n: EN default → "Today is a rest day".
    expect(
      screen.getByRole('heading', { name: /Today is a rest day/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByTestId('workout-empty-back')).toBeInTheDocument();
  });

  it('empty back button navigates antrenor', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(null);
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('workout-empty-back'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
  });

  it('NU renders log zone / header / rating cand empty state', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(null);
    await renderWorkoutAndWait();
    expect(screen.queryByTestId('log-zone')).not.toBeInTheDocument();
    expect(screen.queryByTestId('workout-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('workout-exit-trigger')).not.toBeInTheDocument();
  });
});

describe('Workout — in-workout substitution row (F-workout-03)', async () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders three action buttons in logging phase (Busy + Missing + Skip) — EN default', async () => {
    // Daniel smoke 2026-05-28 #17 — third button "Aparat lipsa" added. Labels
    // compressed for the 3-column row (full names live in aria-label / sheet
    // titles). Mockup parity preserved at the testid level. Wave C2 i18n: EN
    // default → Busy / Missing / Skip (was RO Ocupat / Lipsa / Nu vreau).
    await renderWorkoutAndWait();
    expect(screen.getByTestId('wv2-ex-actions')).toBeInTheDocument();
    expect(screen.getByTestId('wv2-ex-action-ocupat')).toHaveTextContent('Busy');
    expect(screen.getByTestId('wv2-ex-action-lipsa')).toHaveTextContent('Missing');
    expect(screen.getByTestId('wv2-ex-action-nuvreau')).toHaveTextContent('Skip');
  });

  it('"Ocupat" navigates la equipment-swap when no engineName (defensive fallback)', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('wv2-ex-action-ocupat'));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/equipment-swap'
    );
  });

  it('"Nu vreau" navigates la ceva-nu-merge when no engineName (defensive fallback)', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('wv2-ex-action-nuvreau'));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/ceva-nu-merge'
    );
  });

  it('"Lipsa" opens the in-session AparatLipsaSheet (no navigation away)', async () => {
    // Daniel smoke 2026-05-28 #17 — Aparat lipsa stays IN-SESSION (sheet over
    // the log zone). Persists wv2-missing-equipment so Cont -> AparateLipsa
    // hydrates the new state on next mount.
    await renderWorkoutAndWait();
    expect(screen.queryByTestId('aparat-lipsa-sheet')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('wv2-ex-action-lipsa'));
    expect(screen.getByTestId('aparat-lipsa-sheet')).toBeInTheDocument();
    // No navigation — workout testid still mounted (would unmount on navigate
    // because the test routes target the other paths via LocationProbe).
    expect(screen.getByTestId('workout')).toBeInTheDocument();
  });

  it('saving the sheet persists wv2-missing-equipment + closes the sheet', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('wv2-ex-action-lipsa'));
    // Mark gantere as missing
    fireEvent.click(screen.getByTestId('aparat-lipsa-sheet-item-gantere'));
    fireEvent.click(screen.getByTestId('aparat-lipsa-sheet-save'));
    expect(screen.queryByTestId('aparat-lipsa-sheet')).not.toBeInTheDocument();
    const raw = localStorage.getItem('wv2-missing-equipment');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toContain('gantere');
  });
});

describe('Workout — why-exercise help button (F-workout-05)', async () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders help-circle trigger next to exercise name — EN default', async () => {
    await renderWorkoutAndWait();
    expect(screen.getByTestId('wv2-exname')).toHaveTextContent('Bench Press');
    // Wave C2 i18n: EN default → "Why this exercise?" (was RO "De ce acest exercitiu?").
    expect(screen.getByTestId('wv2-why-trigger')).toHaveAttribute(
      'aria-label',
      'Why this exercise?'
    );
  });

  it('why modal closed by default', async () => {
    await renderWorkoutAndWait();
    expect(screen.queryByTestId('why-modal')).not.toBeInTheDocument();
  });

  it('tap help-circle opens modal cu whyEngine summary', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('wv2-why-trigger'));
    expect(getWhyExerciseSummary).toHaveBeenCalledWith({
      name: 'Bench Press',
      recommendationKg: 22.5,
      lastWeightKg: null,
    });
    expect(screen.getByTestId('why-modal')).toBeInTheDocument();
    expect(screen.getByTestId('why-modal-text')).toHaveTextContent(
      'zona de consolidare'
    );
    // Wave C2 i18n: EN default → "Why Bench Press?" (was RO "De ce Bench Press?").
    expect(screen.getByTestId('why-modal')).toHaveTextContent('Why Bench Press?');
  });

  it('"Am inteles" closes modal', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('wv2-why-trigger'));
    expect(screen.getByTestId('why-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('why-modal-dismiss'));
    expect(screen.queryByTestId('why-modal')).not.toBeInTheDocument();
  });

  // RE-C3 — why-modal recommendationKg = targetKg ADAPTAT pe engine intensityMod
  // (deload), NU baseline. Pe deload minus, Bench Press 22.5 → 18 (-20%) —
  // explainerul consistent cu tinta din SetLogInput (kgInput).
  it('why-modal primeste targetKg adaptat pe engine deload minus (22.5 → 18)', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce({ ...PHASE_5_FIXTURE, intensityMod: 'minus' });
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('wv2-why-trigger'));
    expect(getWhyExerciseSummary).toHaveBeenCalledWith({
      name: 'Bench Press',
      recommendationKg: 18,
      lastWeightKg: null,
    });
  });

  // U-04 (MED) — focus management paritate ExitConfirmSheet (WCAG 2.1.1/2.4.3).
  it('why modal are aria-modal true', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('wv2-why-trigger'));
    expect(screen.getByTestId('why-modal')).toHaveAttribute('aria-modal', 'true');
  });

  it('why modal auto-focuses "Am inteles" la open', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('wv2-why-trigger'));
    expect(screen.getByTestId('why-modal-dismiss')).toHaveFocus();
  });

  it('Escape inchide why modal', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('wv2-why-trigger'));
    expect(screen.getByTestId('why-modal')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('why-modal')).not.toBeInTheDocument();
  });

  it('engine null → why.unavailable fallback copy — EN default', async () => {
    vi.mocked(getWhyExerciseSummary).mockReturnValueOnce(null);
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('wv2-why-trigger'));
    // Wave C2 i18n: EN default → "The explanation is temporarily unavailable".
    expect(screen.getByTestId('why-modal-text')).toHaveTextContent(
      /The explanation is temporarily unavailable/
    );
  });

  it('no diacritics in why modal', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('wv2-why-trigger'));
    const modal = screen.getByTestId('why-modal');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(modal.textContent ?? '')).toBe(false);
  });
});

// P-05 (MED) — ⋯ menu actions wired din Workout (SessionTimer construit dar
// necablat anterior). pain/skip/finish-early/cancel au target real.
describe('Workout — session menu actions wired (P-05)', async () => {
  beforeEach(() => {
    resetStore();
  });

  it('menu "Ma doare ceva" navigheaza la pain-button', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    fireEvent.click(screen.getByTestId('workout-menu-pain'));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/pain-button'
    );
  });

  it('menu "Sari exercitiul" advanseaza la urmatorul (exIdx 0 → 1)', async () => {
    await renderWorkoutAndWait();
    expect(useWorkoutStore.getState().exIdx).toBe(0);
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    fireEvent.click(screen.getByTestId('workout-menu-skip'));
    expect(useWorkoutStore.getState().exIdx).toBe(1);
  });

  it('menu "Termina mai devreme" navigheaza la finish-early-confirm', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    fireEvent.click(screen.getByTestId('workout-menu-finish-early'));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/finish-early-confirm'
    );
  });

  it('menu "Anuleaza sesiunea" discard + navigheaza Antrenor', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    fireEvent.click(screen.getByTestId('workout-menu-cancel'));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor'
    );
    expect(useWorkoutStore.getState().sessionStart).toBeNull();
  });
});

// P-11 (LOW) — global progress bar wired din Workout. Fixture = 5 exercitii,
// seturi 4+4+3+3+3 = 17 total. La start 0 seturi logate, exercitiu 1/5.
describe('Workout — global progress bar wired (P-11)', async () => {
  beforeEach(() => {
    resetStore();
  });

  it('progress bar randat (setsTotal>0)', async () => {
    await renderWorkoutAndWait();
    expect(screen.getByTestId('workout-progress-bar')).toBeInTheDocument();
  });

  it('seturi cumulate 1/17 la start (ordinal: pe set 1)', async () => {
    // Daniel smoke 2026-05-28: counter is the 1-indexed CURRENT-set ordinal
    // (mockup wv2 setIdx semantic), not a "logged" tally — so first frame
    // already reads "1/17" ("you are on set 1 of 17"), not "0/17".
    await renderWorkoutAndWait();
    expect(screen.getByTestId('workout-progress-sets')).toHaveTextContent('1/17 sets');
  });

  it('exercitiu curent 1/5 la start', async () => {
    await renderWorkoutAndWait();
    expect(screen.getByTestId('workout-progress-ex')).toHaveTextContent('1/5 exercises');
  });

  it('setsDone stays 1/17 in rest after rating set 1 (set just done)', async () => {
    // Ordinal semantic: rating set 1 enters rest -> ordinal=1 (set 1 done).
    // The bump to 2 happens on skip-pause / auto-advance (start of set 2).
    await renderWorkoutAndWait();
    logSet('Potrivit');
    expect(screen.getByTestId('workout-progress-sets')).toHaveTextContent('1/17 sets');
  });

  it('setsDone bumps 1 -> 2 after sari pauza (skip-rest moves to set 2)', async () => {
    // Daniel smoke 2026-05-28 verbatim "logheaza setul + sar pauza, counter sta
    // la 1/17 in loc sa avanseze" — sari pauza is the transition that advances
    // the ordinal because the user has visibly moved to the next set.
    await renderWorkoutAndWait();
    logSet('Potrivit');
    fireEvent.click(screen.getByTestId('rest-skip'));
    expect(screen.getByTestId('workout-progress-sets')).toHaveTextContent('2/17 sets');
  });
});

describe('Workout — Romanian no-diacritics rule (D-LEGACY-064)', async () => {
  beforeEach(() => {
    resetStore();
  });

  it('no diacritics in UI rendered text (logging phase)', async () => {
    const { container } = await renderWorkoutAndWait();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });

  it('no diacritics in exit sheet', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('workout-exit-trigger'));
    const sheet = screen.getByTestId('exit-sheet');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(sheet.textContent ?? '')).toBe(false);
  });

  it('no diacritics in rest overlay', async () => {
    await renderWorkoutAndWait();
    logSet('Usor');
    const overlay = screen.getByTestId('rest-overlay');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(overlay.textContent ?? '')).toBe(false);
  });

  it('no diacritics in post-log confirmation (Tu ai facut...)', async () => {
    // §F-pass2-setloginput-02 — verify the newly-surfaced post-log copy.
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'));
    const postlog = screen.getByTestId('setlog-postlog');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(postlog.textContent ?? '')).toBe(false);
  });
});

describe('Workout — PR detection pipeline (task_10 §B getPRDelta wire)', async () => {
  beforeEach(() => {
    resetStore();
  });

  it('logSet calls getPRDelta cu exercise + set + history', async () => {
    await renderWorkoutAndWait();
    logSet('Potrivit');
    expect(getPRDelta).toHaveBeenCalledWith(
      'Bench Press',
      { w: 22.5, reps: 10 },
      [] // initial history empty
    );
  });

  it('NU markPRHit cand getPRDelta returns null (no PR)', async () => {
    vi.mocked(getPRDelta).mockReturnValue(null);
    await renderWorkoutAndWait();
    logSet('Usor');
    expect(useWorkoutStore.getState().prHit).toBe(false);
    expect(useWorkoutStore.getState().prData).toBeNull();
  });

  it('markPRHit cu prData cand getPRDelta returns weight PR', async () => {
    vi.mocked(getPRDelta).mockReturnValue({
      type: 'weight',
      kg: 25,
      reps: 10,
      prevBest: { ex: 'Bench Press', w: 22.5, reps: 10 },
      // task_18 enriched fields propagated direct (NU re-derive în handleLogSet)
      deltaKg: 2.5,
      deltaPct: 11.1,
      oneRMEstimate: 33.3,
    });
    await renderWorkoutAndWait();
    // §F-pass2-setloginput-02 — revise kg via pencil edit then rate.
    logSetWithEdit('Greu', { kg: '25' });
    const state = useWorkoutStore.getState();
    expect(state.prHit).toBe(true);
    expect(state.prData).toMatchObject({
      exercise: 'Bench Press',
      deltaKg: 2.5,
      type: 'weight',
      deltaPct: 11.1,
      oneRMEstimate: 33.3,
    });
  });

  it('markPRHit deltaKg propagated din delta payload (NU re-derive)', async () => {
    vi.mocked(getPRDelta).mockReturnValue({
      type: 'weight',
      kg: 22.5,
      reps: 10,
      prevBest: null,
      // task_18 first ever set: deltaKg = kg full baseline 0, deltaPct = 0
      deltaKg: 22.5,
      deltaPct: 0,
      oneRMEstimate: 30,
    });
    await renderWorkoutAndWait();
    logSet('Potrivit');
    expect(useWorkoutStore.getState().prData?.deltaKg).toBe(22.5);
    expect(useWorkoutStore.getState().prData?.oneRMEstimate).toBe(30);
  });

  it('volume PR type propagated correctly', async () => {
    vi.mocked(getPRDelta).mockReturnValue({
      type: 'volume',
      kg: 22.5,
      reps: 12,
      prevBest: { ex: 'Bench Press', w: 22.5, reps: 10 },
      deltaKg: 0,
      deltaPct: 0,
      oneRMEstimate: 31.5,
    });
    await renderWorkoutAndWait();
    logSet('Potrivit');
    expect(useWorkoutStore.getState().prData?.type).toBe('volume');
  });

  it('reps PR type propagated correctly', async () => {
    vi.mocked(getPRDelta).mockReturnValue({
      type: 'reps',
      kg: 22.5,
      reps: 12,
      prevBest: { ex: 'Bench Press', w: 22.5, reps: 10 },
      deltaKg: 0,
      deltaPct: 0,
      oneRMEstimate: 31.5,
    });
    await renderWorkoutAndWait();
    logSet('Potrivit');
    expect(useWorkoutStore.getState().prData?.type).toBe('reps');
  });

  it('history passed la getPRDelta accumulates set 2+ correctly', async () => {
    await renderWorkoutAndWait();
    logSet('Usor');
    fireEvent.click(screen.getByTestId('rest-skip'));
    vi.mocked(getPRDelta).mockClear();
    logSet('Potrivit');
    // Phase 4 task_14 LOCK 9: rapid set click triggers aaFriction fast_sets
    // (consecutive < 30s real time). Dismiss via "Continui oricum" override
    // → performLogSet proceeds → getPRDelta invocat cu accumulated history.
    const continueBtn = screen.queryByTestId('aa-friction-continue');
    if (continueBtn) fireEvent.click(continueBtn);
    expect(getPRDelta).toHaveBeenCalledWith(
      'Bench Press',
      { w: 22.5, reps: 10 },
      [{ ex: 'Bench Press', w: 22.5, reps: 10 }] // 1st set in history
    );
  });
});

describe('Workout — inactivity watch (task_15 §A)', async () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('NU prompt initial (mount fresh activity)', async () => {
    await renderWorkoutAndWait();
    expect(screen.queryByTestId('inactivity-prompt')).not.toBeInTheDocument();
  });

  it('prompt apare cand idle > 7 min', async () => {
    await renderWorkoutAndWait();
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000); // 8 min > 7 threshold
    });
    expect(screen.getByTestId('inactivity-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('inactivity-prompt-title')).toHaveTextContent('Still there?');
  });

  it('Continui click bumps activity + hides prompt', async () => {
    await renderWorkoutAndWait();
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000);
    });
    expect(screen.getByTestId('inactivity-prompt')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('inactivity-continue'));
    expect(screen.queryByTestId('inactivity-prompt')).not.toBeInTheDocument();
  });

  it('Salveaza si iesi click pauses session + navigates antrenor', async () => {
    await renderWorkoutAndWait();
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000);
    });
    fireEvent.click(screen.getByTestId('inactivity-save-exit'));
    expect(useWorkoutStore.getState().pausedSnapshot).not.toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor'
    );
  });

  it('log interaction resets activity (prompt dismissed)', async () => {
    // §F-pass2-setloginput-02 — Logheaza tap is the first log interaction +
    // bumps activity (onLog → bumpActivity), dismissing the inactivity prompt.
    await renderWorkoutAndWait();
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000);
    });
    expect(screen.getByTestId('inactivity-prompt')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'));
    expect(screen.queryByTestId('inactivity-prompt')).not.toBeInTheDocument();
  });

  it('body copy localized under EN default (no diacritics)', async () => {
    await renderWorkoutAndWait();
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000);
    });
    const body = screen.getByTestId('inactivity-prompt-body');
    expect(body.textContent).toMatch(/haven't seen activity/i);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(body.textContent ?? '')).toBe(false);
  });
});

describe('Workout — aaFriction LOCK 9 wire (task_14 §C)', async () => {
  beforeEach(() => {
    resetStore();
  });

  it('NU trigger modal cand first set (history empty)', async () => {
    await renderWorkoutAndWait();
    logSet('Potrivit');
    expect(screen.queryByTestId('aa-friction-modal')).not.toBeInTheDocument();
    // logSet did proceed → phase=rest (not last set of 4)
    expect(useWorkoutStore.getState().phase).toBe('rest');
  });

  it('triggers modal pe fast_sets pattern (2nd set rapid)', async () => {
    await renderWorkoutAndWait();
    logSet('Usor');
    fireEvent.click(screen.getByTestId('rest-skip'));
    // 2nd set fires immediately = < 30s gap = fast_sets trigger
    logSet('Potrivit');
    expect(screen.getByTestId('aa-friction-modal')).toBeInTheDocument();
    expect(screen.getByTestId('aa-friction-reason')).toHaveAttribute(
      'data-reason',
      'fast_sets'
    );
  });

  it('suspend state machine — phase NU advance la rest cand modal open', async () => {
    await renderWorkoutAndWait();
    logSet('Usor');
    fireEvent.click(screen.getByTestId('rest-skip'));
    expect(useWorkoutStore.getState().phase).toBe('logging');
    logSet('Potrivit');
    // Modal open — phase still logging, NU advanced la rest yet.
    expect(useWorkoutStore.getState().phase).toBe('logging');
    expect(useWorkoutStore.getState().history[0]?.length ?? 0).toBe(1); // only 1st set logged
  });

  it('Continui oricum → performLogSet proceeds + state machine advance', async () => {
    await renderWorkoutAndWait();
    logSet('Usor');
    fireEvent.click(screen.getByTestId('rest-skip'));
    logSet('Potrivit');
    fireEvent.click(screen.getByTestId('aa-friction-continue'));
    expect(screen.queryByTestId('aa-friction-modal')).not.toBeInTheDocument();
    expect(useWorkoutStore.getState().history[0]?.length).toBe(2);
    expect(useWorkoutStore.getState().phase).toBe('rest');
  });

  it('Pauza 30s → performLogSet + override restCountdown la 30', async () => {
    await renderWorkoutAndWait();
    logSet('Usor');
    fireEvent.click(screen.getByTestId('rest-skip'));
    logSet('Potrivit');
    fireEvent.click(screen.getByTestId('aa-friction-pause'));
    expect(useWorkoutStore.getState().history[0]?.length).toBe(2);
    expect(useWorkoutStore.getState().phase).toBe('rest');
    // Override rest countdown la 30s (vs 90s default Bench Press restSec)
    expect(screen.getByTestId('rest-countdown')).toHaveTextContent('0:30');
  });

  it('triggers modal pe kg_jump pattern (> 20% increase)', async () => {
    await renderWorkoutAndWait();
    // Set 1: 22.5 kg default
    logSet('Usor');
    fireEvent.click(screen.getByTestId('rest-skip'));
    // Wait > 30s simulated via store manipulation — set sample timestamp far past
    useWorkoutStore.setState({
      history: {
        0: [{ kg: 22.5, reps: 10, rating: 'usor', timestamp: Date.now() - 60_000 }],
      },
    });
    // Set 2: bump kg la 30 = +33% kg via pencil edit then rate.
    logSetWithEdit('Potrivit', { kg: '30' });
    expect(screen.getByTestId('aa-friction-modal')).toBeInTheDocument();
    expect(screen.getByTestId('aa-friction-reason')).toHaveAttribute(
      'data-reason',
      'kg_jump'
    );
  });

  // 06.AA.010 INTEGRATION — the live-drive guard Daniel reported missing. The
  // pure detector unit test (aaFrictionDetect.test.ts) was green, but the live
  // path (type a load far above the rec on the FIRST set, no history, pick a
  // rating) had never been driven end-to-end through the rendered screen. This
  // walks the EXACT real-user path: tinta kg input -> type 200 -> Confirma setul
  // -> rating tap -> assert the modal OPENS with over_recommendation AND the set
  // is NOT yet committed (the safety must block logging, not be cosmetic).
  //
  // Fixture: a single-exercise workout whose FIRST exercise rec = 10 kg (the
  // exact target Daniel drove). 200 kg is 20x the rec — well past the 40% ratio.
  const REC_10_FIXTURE = {
    ...PHASE_5_FIXTURE,
    exercises: [
      { id: 'bicep-curl', name: 'Bicep Curl', sets: 4, targetReps: 12, targetKg: 10, restSec: 60 },
    ],
  };

  it('LIVE DRIVE: typed 200 kg on first set (rec 10) opens modal over_recommendation, set NOT committed', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(REC_10_FIXTURE);
    await renderWorkoutAndWait();
    // Sanity: the tinta opened at the 10 kg rec (engine rec reached the input).
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('10 kg');

    // REAL user path — type 200 into the tinta kg input (onChange commits to
    // kgInput immediately, no blur/enter needed), keep reps, Confirma setul.
    fireEvent.change(screen.getByTestId('setlog-tinta-kg-input'), {
      target: { value: '200' },
    });
    fireEvent.change(screen.getByTestId('setlog-tinta-reps-input'), {
      target: { value: '20' },
    });
    fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'));
    // Post-log reveals the rating row — pick one (this is the call that runs
    // handleLogSet -> detectAggressiveLoad).
    fireEvent.click(screen.getByRole('button', { name: EN_RATING_LABEL.Potrivit }));

    // Modal MUST open with the over_recommendation reason.
    expect(screen.getByTestId('aa-friction-modal')).toBeInTheDocument();
    expect(screen.getByTestId('aa-friction-reason')).toHaveAttribute(
      'data-reason',
      'over_recommendation'
    );
    // Set NOT committed — the safety blocks logging until the user chooses.
    expect(useWorkoutStore.getState().history[0]?.length ?? 0).toBe(0);
    expect(useWorkoutStore.getState().phase).toBe('logging');
  });

  it('LIVE DRIVE: modal BLOCKS the set — only logs after the user resolves it', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(REC_10_FIXTURE);
    await renderWorkoutAndWait();
    fireEvent.change(screen.getByTestId('setlog-tinta-kg-input'), {
      target: { value: '200' },
    });
    fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'));
    fireEvent.click(screen.getByRole('button', { name: EN_RATING_LABEL.Potrivit }));
    expect(screen.getByTestId('aa-friction-modal')).toBeInTheDocument();
    // Still blocked.
    expect(useWorkoutStore.getState().history[0]?.length ?? 0).toBe(0);
    // User overrides via "Continui oricum" → NOW the set commits + advances.
    fireEvent.click(screen.getByTestId('aa-friction-continue'));
    expect(screen.queryByTestId('aa-friction-modal')).not.toBeInTheDocument();
    expect(useWorkoutStore.getState().history[0]?.length).toBe(1);
    expect(useWorkoutStore.getState().history[0]?.[0]?.kg).toBe(200);
    expect(useWorkoutStore.getState().phase).toBe('rest');
  });
});

// ── In-session RESPONSIVE autoregulation wire (DP.checkInSessionAdjust) ──────
// Daniel rewrite 2026-05-30: the engine now reacts to EACH set (not 2-consecutive)
// and is phase-aware. The test phase defaults to AUTO (no phase-override set) =
// masa-like → REPS autoregulation: a single Greu eases the NEXT set's rep target
// (10→8 for Bench Press) holding the weight, and surfaces the honest message.
// These tests prove the wire end-to-end against the REAL DP engine (only
// engineWrappers is mocked, NOT dp.js).
describe('Workout — in-session responsive autoregulation wire', () => {
  beforeEach(() => {
    resetStore();
  });

  // Bench Press (fixture exercise 1, 4 sets). Prior persisted history at 60 kg
  // gives DP a lastW to recalibrate from; getPrevWeight(60, bailib_stack) = 55.
  function seedBenchHistory(): void {
    DB.set('logs', [
      { ex: 'Bench Press', w: 60, reps: 8, set: 1, ts: Date.now() - 1000 },
      { ex: 'Bench Press', w: 60, reps: 8, set: 1, ts: Date.now() - 2000 },
    ]);
  }

  // Push set 1 into the past so logging set 2 doesn't trip the separate
  // fast_sets aaFriction guard (<30s between sets) — same technique the kg_jump
  // test uses. This isolates the in-session RPE adjust under test.
  function backdateFirstSet(): void {
    const sets = useWorkoutStore.getState().history[0] ?? [];
    useWorkoutStore.setState({
      history: { 0: sets.map((s) => ({ ...s, timestamp: Date.now() - 60_000 })) },
    });
  }

  it('a single Greu set eases the NEXT set rep target (masa phase) + surfaces the notice', async () => {
    await renderWorkoutAndWait();
    seedBenchHistory();
    // No notice before any rated set.
    expect(screen.queryByTestId('insession-adjust-notice')).not.toBeInTheDocument();

    // Set 1 Greu → AUTO/masa phase → engine drops the NEXT set's rep target
    // 10→8 (modest −2) and HOLDS the weight at the fixture target (22.5 kg).
    logSet('Greu');
    fireEvent.click(screen.getByTestId('rest-skip'));
    const notice = screen.getByTestId('insession-adjust-notice');
    expect(notice).toBeInTheDocument();
    expect(notice.textContent ?? '').toMatch(/8 reps/); // honest "easing reps" wording
    // The next set's rep target reflects the eased value; the weight is unchanged.
    expect(screen.getByTestId('setlog-tinta-reps')).toHaveTextContent('8');
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('22.5 kg');
  });

  it('a single Potrivit set holds the target (no adjust, no notice) early in the exercise', async () => {
    await renderWorkoutAndWait();
    seedBenchHistory();
    logSet('Potrivit');
    fireEvent.click(screen.getByTestId('rest-skip'));
    expect(screen.queryByTestId('insession-adjust-notice')).not.toBeInTheDocument();
    // Target stays at the fixture default — potrivit holds.
    expect(screen.getByTestId('setlog-tinta-reps')).toHaveTextContent('10');
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('22.5 kg');
  });

  it('no adjustment when the user has no prior history (engine returns adjust:false)', async () => {
    await renderWorkoutAndWait();
    // No seedBenchHistory → DP.getState('Bench Press').lastW = 0 → no recalibration.
    logSet('Greu');
    fireEvent.click(screen.getByTestId('rest-skip'));
    backdateFirstSet();
    logSet('Greu');
    fireEvent.click(screen.getByTestId('rest-skip'));
    expect(screen.queryByTestId('insession-adjust-notice')).not.toBeInTheDocument();
  });
});

// ── Shared current-recommended-load: autoreg + AaFriction read ONE source ────
// Audit fix 2026-05-30. Previously autoregulation RAISED the next set's target
// by writing kgInput, but the AaFriction over_recommendation check re-evaluated
// the next set against the STALE per-exercise targetKg (drift). And autoreg
// pre-filled kgInput UNCONDITIONALLY, clobbering a value the user had already
// typed for the next set. These two tests prove the shared rec + the input
// guard end-to-end against the REAL DP engine (STRENGTH phase = WEIGHT autoreg).
describe('Workout — shared current-recommended-load (autoreg + AaFriction)', () => {
  const STRENGTH_REC_50_FIXTURE = {
    ...PHASE_5_FIXTURE,
    exercises: [
      // Single STRENGTH-phase exercise, rec 50 kg. 40% over-rec boundary = 70 kg.
      { id: 'bench-press', name: 'Bench Press', sets: 4, targetReps: 5, targetKg: 50, restSec: 90 },
    ],
  };

  beforeEach(() => {
    resetStore();
    // STRENGTH phase → checkInSessionAdjust autoregulates WEIGHT (newKg).
    DB.set('phase-override', 'STRENGTH');
    // Prior persisted history gives DP a lastW so it recalibrates (else adjust:false).
    DB.set('logs', [
      { ex: 'Bench Press', w: 50, reps: 5, set: 1, ts: Date.now() - 2000 },
    ]);
  });

  afterEach(() => {
    // Do not leak the phase-override into the AUTO-phase suites above/below.
    DB.set('phase-override', 'AUTO');
    DB.set('logs', []);
  });

  // Backdate the logged set so logging the NEXT set doesn't trip the separate
  // fast_sets aaFriction guard (<30s between sets). Isolates over_recommendation.
  function backdateSets(): void {
    const sets = useWorkoutStore.getState().history[0] ?? [];
    useWorkoutStore.setState({
      history: { 0: sets.map((s) => ({ ...s, timestamp: Date.now() - 60_000 })) },
    });
  }

  it('AaFriction evaluates the NEXT set against the autoreg-RAISED rec, not the stale target', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(STRENGTH_REC_50_FIXTURE);
    await renderWorkoutAndWait();
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('50 kg');

    // Set 1: over-perform — log 75 kg (well above the 50 rec) at a non-failure
    // rating so the engine ramps the next set's WEIGHT UP (real DP: rec 50 →
    // newKg 55, a smooth +1 increment-step toward the demonstrated load).
    fireEvent.change(screen.getByTestId('setlog-tinta-kg-input'), { target: { value: '75' } });
    fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'));
    fireEvent.click(screen.getByRole('button', { name: EN_RATING_LABEL.Potrivit }));
    // 75 vs rec 50 = +50% > 40% → the over_recommendation modal fires on set 1.
    // Force-continue (the user insists) so the set commits + autoreg runs.
    expect(screen.getByTestId('aa-friction-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('aa-friction-continue'));
    fireEvent.click(screen.getByTestId('rest-skip'));
    backdateSets();

    // Autoreg raised the SHARED rec from 50 → 55 for set 2 (surfaced in the
    // notice; the tinta target itself is not auto-bumped because the user typed
    // their own set-1 value, but the shared recKg the friction check reads IS
    // raised). New over-rec boundary = 55*1.4 = 77; old (stale) boundary = 70.
    expect((screen.getByTestId('insession-adjust-notice').textContent ?? '')).toMatch(/55 kg/);

    // Set 2: log 76 kg — OVER the OLD 50-rec boundary (70) but UNDER the new
    // raised-rec boundary (77), and ABOVE set 1's 75 kg so the established-at-
    // load suppression does NOT mask the check. With the bug (stale targetKg=50)
    // this trips over_recommendation; with the fix (shared recKg=55) it must NOT.
    fireEvent.change(screen.getByTestId('setlog-tinta-kg-input'), { target: { value: '76' } });
    fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'));
    fireEvent.click(screen.getByRole('button', { name: EN_RATING_LABEL.Potrivit }));

    // No modal — the friction boundary moved WITH the autoreg-raised rec.
    expect(screen.queryByTestId('aa-friction-modal')).not.toBeInTheDocument();
    // The set committed (proof it was not blocked).
    expect(useWorkoutStore.getState().history[0]?.length).toBe(2);
  });

  it('autoreg does NOT clobber a kg the user has manually typed for the next set', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(STRENGTH_REC_50_FIXTURE);
    await renderWorkoutAndWait();

    // Set 1: over-perform so autoreg WOULD raise the next set's kgInput.
    fireEvent.change(screen.getByTestId('setlog-tinta-kg-input'), { target: { value: '75' } });
    fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'));
    // The user manually edits the kg DURING this set (dirty signal). The clobber
    // guard keys off "did the user manually edit this set's input", which the
    // 75 above already set — assert against the chosen value surviving autoreg.
    fireEvent.click(screen.getByRole('button', { name: EN_RATING_LABEL.Potrivit }));
    expect(screen.getByTestId('aa-friction-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('aa-friction-continue'));
    fireEvent.click(screen.getByTestId('rest-skip'));

    // The user manually typed their own load for set 1 (75) → autoreg must NOT
    // overwrite the next set's input. The tinta keeps the user's 75, NOT the
    // engine's raised value. (The shared rec still tracks the engine internally,
    // proven by the sibling test; this asserts the INPUT is not clobbered.)
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('75 kg');
  });
});
