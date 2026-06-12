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
import { getTodayWorkout } from '../../../lib/engineWrappers';
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

// Founder Busy/Missing redesign 2026-06-12 — "Aparat ocupat" no longer opens the
// pick-list: it DEFERS the exercise to a later slot (the machine may free up) and
// advances to the next pending exercise immediately. It falls back to the pick-list
// ONLY on the last pending exercise (deferring is meaningless there).
describe('Workout swap — "Aparat ocupat" DEFERS in-session', () => {
  it('moves the busy exercise later + makes the next one current (no sheet, no navigate)', async () => {
    await renderAndWait();
    const exname = screen.getByTestId('wv2-exname');
    expect(exname.textContent).toContain('inclinat cu bara');

    fireEvent.click(screen.getByTestId('wv2-ex-action-ocupat'));

    // NO pick-list sheet, NO navigate.
    expect(screen.queryByTestId('swap-pick-sheet')).not.toBeInTheDocument();
    expect(screen.queryByTestId('probe-eq')).not.toBeInTheDocument();
    // The next pending exercise (Incline DB) is now current.
    await waitFor(() => {
      expect(screen.getByTestId('wv2-exname').textContent).toContain('Impins inclinat');
    });
    // Not dropped (it returns later) — no skipped strip.
    expect(screen.queryByTestId('skipped-strip')).not.toBeInTheDocument();
  });

  it('on the LAST pending exercise it falls back to the pick-list (defer is meaningless)', async () => {
    // Single-exercise session → nothing pending behind → defer is meaningless → sheet.
    vi.mocked(getTodayWorkout).mockResolvedValueOnce({
      ...SWAP_FIXTURE,
      exerciseCount: 1,
      exercises: [SWAP_FIXTURE.exercises[0]!],
    });
    await renderAndWait();
    fireEvent.click(screen.getByTestId('wv2-ex-action-ocupat'));
    expect(await screen.findByTestId('swap-pick-sheet')).toBeInTheDocument();
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

    // "Nu vreau" opens the pick-list (busy now defers); the drop row lives there.
    fireEvent.click(screen.getByTestId('wv2-ex-action-nuvreau'));
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
    fireEvent.click(screen.getByTestId('wv2-ex-action-nuvreau'));
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
    // "Nu vreau" opens the pick-list (busy now defers) — the in-place swap path.
    fireEvent.click(screen.getByTestId('wv2-ex-action-nuvreau'));
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

// ══ MUSCLE-AWARE "Aparat ocupat" defer placement (founder 2026-06-12) ════════
// The defer placement used to be equipment-ONLY: it landed the busy lift just
// after the first following exercise on a DIFFERENT machine — BLIND to muscle,
// so it could drop a chest press right behind intense triceps work (pre-fatigued
// synergists). Founder: "sa nu mute piept dupa ce am lucrat triceps intensiv".
// The rule is now BOTH different-equipment AND muscle-safe (the busy lift must
// not land immediately after an exercise that pre-fatigued its prime movers /
// synergists), earliest such slot = minimum sensible defer.
//
// We assert the RESULTING ORDER of the session after one defer by walking it via
// the ⋯ menu "skip current exercise" (advanceExercise → exIdx+1, no set logging),
// reading wv2-exname at each linear step. REAL library engine names so
// musclesForExercise resolves concrete heads (chest press → chest + front-delt +
// triceps synergists; pulldown → lat + biceps; leg press → quads/glutes/hams).
function ex(id: string, name: string, engineName: string) {
  return { id, name, engineName, sets: 3, targetReps: 8, targetKg: 40, restSec: 90 };
}

// Walk the session linearly from the current cursor, collecting each exercise's
// display name as it becomes current (skip = advanceExercise, raw exIdx+1). The
// first entry is the already-current exercise; we then skip exerciseCount-1 times.
async function walkOrder(count: number): Promise<string[]> {
  const seen: string[] = [];
  for (let step = 0; step < count; step++) {
    await waitFor(() => {
      expect(screen.queryByTestId('workout-loading')).not.toBeInTheDocument();
    });
    seen.push(screen.getByTestId('wv2-exname').textContent ?? '');
    if (step < count - 1) {
      fireEvent.click(screen.getByTestId('workout-menu-trigger'));
      fireEvent.click(await screen.findByTestId('workout-menu-skip'));
    }
  }
  return seen;
}

describe('Workout swap — "Aparat ocupat" defer is MUSCLE-AWARE', () => {
  it('a chest press SKIPS PAST triceps work and lands after a leg exercise', async () => {
    // [chest press (busy, barbell) , triceps pushdown (cable) , leg press (machine)].
    // Equipment-only would land it after the pushdown (different machine) — but the
    // pushdown pre-fatigues the press's triceps synergists, so it must skip to the
    // leg press (different machine AND muscle-safe).
    vi.mocked(getTodayWorkout).mockResolvedValueOnce({
      ...SWAP_FIXTURE,
      exerciseCount: 3,
      exercises: [
        ex('inc-bb-0', 'inclinat cu bara', 'Incline Barbell Bench'),
        ex('pushdown-1', 'extensii triceps', 'Pushdown'),
        ex('legpress-2', 'presa picioare', 'Leg Press'),
      ],
    });
    await renderAndWait();
    expect(screen.getByTestId('wv2-exname').textContent).toContain('inclinat cu bara');

    fireEvent.click(screen.getByTestId('wv2-ex-action-ocupat'));

    // No sheet, no navigate — it deferred in-session.
    expect(screen.queryByTestId('swap-pick-sheet')).not.toBeInTheDocument();
    // Resulting order: triceps + leg press leapfrog, chest press lands LAST (after
    // the leg press), NOT in slot 1 right behind the triceps pushdown.
    const order = await walkOrder(3);
    expect(order[0]).toContain('extensii triceps'); // pushdown is current now
    expect(order[1]).toContain('presa picioare'); // leg press next
    expect(order[2]).toContain('inclinat cu bara'); // chest press landed after legs
  });

  it('a back lift (pulldown) SKIPS PAST a biceps curl and lands after legs', async () => {
    // [lat pulldown (busy, cable) , cable curl (cable) , leg extension (machine)].
    // The curl pre-fatigues the pulldown's biceps synergist → skip past it; the leg
    // extension is muscle-safe + different equipment → land there.
    vi.mocked(getTodayWorkout).mockResolvedValueOnce({
      ...SWAP_FIXTURE,
      exerciseCount: 3,
      exercises: [
        ex('pulldown-0', 'tractiuni la helcometru', 'Lat Pulldown'),
        ex('curl-1', 'flexii cu cablu', 'Cable Curl'),
        ex('legext-2', 'extensii cvadriceps', 'Leg Extension'),
      ],
    });
    await renderAndWait();
    fireEvent.click(screen.getByTestId('wv2-ex-action-ocupat'));

    const order = await walkOrder(3);
    expect(order[0]).toContain('flexii cu cablu'); // curl current
    expect(order[1]).toContain('extensii cvadriceps'); // leg ext next
    expect(order[2]).toContain('tractiuni la helcometru'); // pulldown landed after legs
  });

  it('a pure isolation behind an UNRELATED isolation lands minimally (no conflict)', async () => {
    // [calf raises (busy, machine) , cable curl (cable) , leg extension (machine)].
    // Calf vs biceps = no muscle overlap → the first different-equipment slot is
    // already safe → minimum defer (land right behind the cable curl).
    vi.mocked(getTodayWorkout).mockResolvedValueOnce({
      ...SWAP_FIXTURE,
      exerciseCount: 3,
      exercises: [
        ex('calf-0', 'ridicari pe varfuri', 'Calf Raises'),
        ex('curl-1', 'flexii cu cablu', 'Cable Curl'),
        ex('legext-2', 'extensii cvadriceps', 'Leg Extension'),
      ],
    });
    await renderAndWait();
    fireEvent.click(screen.getByTestId('wv2-ex-action-ocupat'));

    const order = await walkOrder(3);
    expect(order[0]).toContain('flexii cu cablu'); // curl current
    expect(order[1]).toContain('ridicari pe varfuri'); // calf landed right behind it (minimum)
    expect(order[2]).toContain('extensii cvadriceps'); // leg ext untouched at the tail
  });

  it('NO-conflict case is the minimum defer after different equipment (unchanged)', async () => {
    // [leg extension (busy, machine) , cable curl (cable)]. Quad vs biceps = no
    // overlap, cable != machine → land right after the curl (slot 1), exactly the
    // pre-change behaviour.
    vi.mocked(getTodayWorkout).mockResolvedValueOnce({
      ...SWAP_FIXTURE,
      exerciseCount: 2,
      exercises: [
        ex('legext-0', 'extensii cvadriceps', 'Leg Extension'),
        ex('curl-1', 'flexii cu cablu', 'Cable Curl'),
      ],
    });
    await renderAndWait();
    fireEvent.click(screen.getByTestId('wv2-ex-action-ocupat'));

    const order = await walkOrder(2);
    expect(order[0]).toContain('flexii cu cablu'); // curl current
    expect(order[1]).toContain('extensii cvadriceps'); // leg ext landed right behind it
  });
});
