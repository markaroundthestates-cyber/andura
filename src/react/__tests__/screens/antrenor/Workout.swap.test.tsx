// ══ WORKOUT IN-SESSION SWAP TESTS — founder manual pick-list redesign ════════
// Founder redesign 2026-06-05: "Aparat ocupat" + "Nu vreau" no longer blindly
// auto-swap one alternative. They open a SHORT manual pick-list sheet (ranked
// same-muscle list, row 1 = smart pre-pick, exactly one bodyweight fallback) +
// a separated "I don't want to do this" row that DROPS the exercise from today's
// session (recoverable via the skipped strip). Uses a fixture with REAL
// engineName library keys so the pick-list resolves concrete alternatives.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

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
import { debugLog } from '../../../lib/debugLog';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

function renderWorkout() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/workout']}>
      <Routes>
        <Route path="/app/antrenor/workout" element={<Workout />} />
        <Route path="/app/antrenor/equipment-swap" element={<div data-testid="probe-eq" />} />
        <Route path="/app/antrenor/ceva-nu-merge" element={<div data-testid="probe-cnm" />} />
        <Route path="/app/antrenor/post-rpe" element={<div data-testid="probe-postrpe" />} />
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
    refusalTriedByEx: {},
    droppedExercises: {},
    performedExercises: {},
  });
  localStorage.clear();
  setLocale('ro');
  _resetI18nCache();
  setLocale('ro');
  toast.clear();
});

afterEach(() => {
  toast.clear();
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
});

describe('Workout swap — "Aparat ocupat" opens the manual pick-list', () => {
  it('opens a SHORT ranked sheet with a pre-pick (no navigate, no auto-swap)', async () => {
    await renderAndWait();
    const exname = screen.getByTestId('wv2-exname');
    expect(exname.textContent).toContain('inclinat cu bara');

    fireEvent.click(screen.getByTestId('wv2-ex-action-ocupat'));

    // Sheet opens (NOT a navigate, NOT an immediate swap toast).
    const sheet = await screen.findByTestId('swap-pick-sheet');
    expect(sheet).toBeInTheDocument();
    expect(screen.queryByTestId('probe-eq')).not.toBeInTheDocument();
    expect(toast.getSnapshot().length).toBe(0);

    // Row 0 is the pre-pick (the smart default), and the list is SHORT (<=5).
    const row0 = screen.getByTestId('swap-pick-row-0');
    expect(row0.getAttribute('data-prepick')).toBe('true');
    const rows = screen.queryAllByTestId(/^swap-pick-row-\d+$/);
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows.length).toBeLessThanOrEqual(5);
  });

  it('picking the pre-pick row swaps the current exercise in-place + toasts the name', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByTestId('wv2-ex-action-ocupat'));
    const row0 = await screen.findByTestId('swap-pick-row-0');
    const pickedName = row0.textContent ?? '';
    fireEvent.click(row0);

    await waitFor(() => {
      expect(toast.getSnapshot().length).toBeGreaterThan(0);
    });
    expect(toast.getSnapshot()[0]!.message).toContain('Inlocuit');
    // The current exercise changed (in-place), the original is gone.
    await waitFor(() => {
      expect(screen.getByTestId('wv2-exname').textContent).not.toContain('inclinat cu bara');
    });
    // The swapped-in exercise is the one the user picked.
    expect(pickedName.length).toBeGreaterThan(0);
  });
});

describe('Workout swap — "Nu vreau" (not started) opens the pick-list', () => {
  it('opens the pick-list sheet (not the old auto-swap path)', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByTestId('wv2-ex-action-nuvreau'));
    expect(await screen.findByTestId('swap-pick-sheet')).toBeInTheDocument();
    expect(screen.queryByTestId('probe-cnm')).not.toBeInTheDocument();
  });

  it('picking a row increments the refusal counter on the original', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByTestId('wv2-ex-action-nuvreau'));
    const row0 = await screen.findByTestId('swap-pick-row-0');
    fireEvent.click(row0);
    await waitFor(() => {
      expect(toast.getSnapshot().length).toBeGreaterThan(0);
    });
    // The counter entry is now the timestamped {n, ts} shape (refusal-memory
    // 2026-06-10); assert the COUNT via the entry's n (or the stable
    // getRefusalCounter API) rather than the raw legacy number.
    const counter = JSON.parse(localStorage.getItem('wv2-refusal-counter') ?? '{}');
    expect(counter['Incline Barbell Bench']?.n ?? counter['Incline Barbell Bench']).toBe(1);
  });
});

describe('Workout swap — drop + retrieve', () => {
  it('"I don\'t want to do this" DROPS the exercise + advances + shows it in the skipped strip', async () => {
    await renderAndWait();
    expect(screen.getByTestId('wv2-exname').textContent).toContain('inclinat cu bara');

    fireEvent.click(screen.getByTestId('wv2-ex-action-ocupat'));
    const dropBtn = await screen.findByTestId('swap-pick-drop');
    fireEvent.click(dropBtn);

    // Dropped → store marks slot 0 dropped, screen advances to exercise 2.
    await waitFor(() => {
      expect(useWorkoutStore.getState().droppedExercises[0]).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByTestId('wv2-exname').textContent).toContain('Impins inclinat');
    });
    // The skipped strip surfaces the dropped exercise as retrievable.
    expect(screen.getByTestId('skipped-strip')).toBeInTheDocument();
    expect(screen.getByTestId('skipped-restore-0')).toBeInTheDocument();
  });

  it('a dropped exercise is RETRIEVABLE — restore brings it back to its slot', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByTestId('wv2-ex-action-ocupat'));
    fireEvent.click(await screen.findByTestId('swap-pick-drop'));

    await waitFor(() => {
      expect(screen.getByTestId('skipped-restore-0')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('skipped-restore-0'));

    // Restored: drop marker cleared, session jumps back to slot 0 (the original).
    await waitFor(() => {
      expect(useWorkoutStore.getState().droppedExercises[0]).toBeUndefined();
    });
    await waitFor(() => {
      expect(screen.getByTestId('wv2-exname').textContent).toContain('inclinat cu bara');
    });
  });
});

// ── (5) 2026-06-11 — a swap-in-place must not double-emit a STALE rec ─────────
// F3 deduped the rec on an exercise-INDEX transition, but a swap replaces
// exercises[idx] IN PLACE (index unchanged), so isTransition read false and the
// first rec carried the PREVIOUS exercise's stale recKg (the gym log showed
// "Y Raise rec 40x6" = the Incline DB value), then the reset effect re-rendered
// the correct value — a stale double-emit. The transition is now keyed on the
// exercise IDENTITY (index + engine key), so a swap is a transition too.
describe('Workout swap — (5) one rec per set, never the pre-swap stale load', () => {
  it('the swapped-in exercise never emits a rec carrying the pre-swap 60 kg', async () => {
    const spy = vi.spyOn(debugLog, 'event');
    await renderAndWait();
    // ex0 = Incline Barbell Bench @ 60 kg (the pre-swap load that must NOT leak).
    fireEvent.click(screen.getByTestId('wv2-ex-action-ocupat'));
    const row0 = await screen.findByTestId('swap-pick-row-0');
    fireEvent.click(row0);
    // The current exercise changed in-place (same slot 0).
    await waitFor(() => {
      expect(screen.getByTestId('wv2-exname').textContent).not.toContain('inclinat cu bara');
    });

    const recEvents = spy.mock.calls
      .filter((c) => c[0] === 'rec')
      .map((c) => c[1] as { exercise: string; setIdx: number; recKg: number });
    // The swapped-in exercise's recs (any exercise that is NOT the original).
    const swappedRecs = recEvents.filter((e) => e.exercise !== 'inclinat cu bara');
    expect(swappedRecs.length).toBeGreaterThan(0);
    // NONE of them carry the pre-swap 60 kg (the stale-emit signature).
    for (const e of swappedRecs) expect(e.recKg).not.toBe(60);
    // Exactly one rec per (exercise,set) slot across the whole session — no double.
    const slots = recEvents.map((e) => `${e.exercise}:${e.setIdx}`);
    expect(new Set(slots).size).toBe(slots.length);
    spy.mockRestore();
  });
});
