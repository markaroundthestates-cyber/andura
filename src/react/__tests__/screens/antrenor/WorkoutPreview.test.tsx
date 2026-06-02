// ══ WORKOUT PREVIEW TESTS — task_05 §C banner + duration/volume + start ═══
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import * as engineWrappers from '../../../lib/engineWrappers';
import type { PlannedWorkoutOutput } from '../../../lib/engineWrappers';

// Phase 6 task_02 Option C: async getTodayWorkout returns Promise<null>.
// WorkoutPreview useEffect awaits — initial render shows fallback values
// (workout state initialized null pre-resolve). Per DECISIONS.md §D027.
vi.mock('../../../lib/engineWrappers', () => ({
  getReadiness: vi.fn(() => null),
  getFatigue: vi.fn(() => null),
  getPRDelta: vi.fn(() => null),
  getTodayWorkout: vi.fn(async () => null),
  // Session-type → localized title (real semantics): known types map to their
  // label, unknown/absent → generic fallback (NU un "Push" fabricat).
  resolveSessionTitle: vi.fn((sessionType?: string | null) => {
    const map: Record<string, string> = {
      PUSH: 'Push (piept si umeri)',
      PULL: 'Pull (spate si biceps)',
      UPPER_PICIOARE: 'Picioare',
      UMERI_BRATE: 'Umeri si brate',
      FULL_UPPER: 'Trunchi complet',
    };
    return (sessionType && map[sessionType]) || 'Antrenamentul tau';
  }),
}));

import { WorkoutPreview } from '../../../routes/screens/antrenor/WorkoutPreview';
import { useWorkoutStore } from '../../../stores/workoutStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderPreview(
  state?: {
    intensityMod?: 'plus' | 'normal' | 'minus';
    cause?: string;
    painContext?: { region: string; intensity: 1 | 2 | 3 };
    overrideKind?: 'easier' | 'harder' | 'different-muscle';
  }
) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: '/app/antrenor/workout-preview', state: state ?? {} },
      ]}
    >
      <Routes>
        <Route path="/app/antrenor/workout-preview" element={<WorkoutPreview />} />
        <Route path="/app/antrenor/workout" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('WorkoutPreview — base render', () => {
  it('renders the generic fallback heading (NU "Push") cand engine returns null', () => {
    // Honest fix — with no plan there is no sessionType, so the title is the
    // generic localized fallback, NOT a fabricated "Push" label.
    renderPreview();
    expect(
      screen.getByRole('heading', { name: /Antrenamentul tau/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Push/i, level: 1 })).toBeNull();
  });

  it('renders a PULL session title (NU "Push") when the engine plans a PULL day', async () => {
    // Daniel live bug: a PULL day showed "Push" because the engine never emitted
    // a per-day title and the boundary fell to a hardcoded Push copy. Now the
    // sessionType drives the title.
    vi.mocked(engineWrappers.getTodayWorkout).mockResolvedValue({
      workoutTitle: '__engine_workout_title_fallback__',
      sessionType: 'PULL',
      exerciseCount: 4,
      estimatedDuration: 45,
      intensityMod: 'normal',
      exercises: [],
      volumeKg: 1000,
    } as PlannedWorkoutOutput);
    renderPreview();
    expect(
      await screen.findByRole('heading', { name: /Pull/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Push/i, level: 1 })).toBeNull();
  });

  it('renders Start antrenament CTA', () => {
    // §F-workout-preview-05 (HIGH chat5 Wave 15) — CTA mockup verbatim
    // "Confirma, incep" + Check icon (confirmation framing andura-clasic.html#L993).
    // Wave E1 — under EN default locale this surfaces as "Confirm, let's start".
    renderPreview();
    expect(screen.getByRole('button', { name: /Confirm, let's start/i })).toBeInTheDocument();
  });

  it('renders intensity banner cu role=status', () => {
    renderPreview();
    expect(screen.getByRole('status', { name: /Session intensity/i })).toBeInTheDocument();
  });

  it('renders coach quote line', () => {
    renderPreview();
    const quote = screen.getByTestId('preview-coach-line');
    expect(quote).toBeInTheDocument();
    expect(quote.textContent?.length).toBeGreaterThan(0);
  });
});

describe('WorkoutPreview — "Different group" override (ScheduleOverride wiring)', () => {
  beforeEach(() => {
    vi.mocked(engineWrappers.getTodayWorkout).mockClear();
  });

  it('overrideKind=different-muscle → asks the engine for the alternative session', async () => {
    // The dead-button fix: "Alta grupa" must request a REAL alternative cluster.
    // WorkoutPreview threads { differentMuscle: true } into getTodayWorkout.
    renderPreview({ overrideKind: 'different-muscle' });
    await waitFor(() =>
      expect(engineWrappers.getTodayWorkout).toHaveBeenCalledWith({ differentMuscle: true }),
    );
  });

  it('no overrideKind → engine called WITHOUT the override (default session)', async () => {
    renderPreview();
    await waitFor(() =>
      expect(engineWrappers.getTodayWorkout).toHaveBeenCalledWith({}),
    );
  });

  it('easier/harder override → NOT a different-muscle request (rides intensityMod)', async () => {
    renderPreview({ overrideKind: 'easier', intensityMod: 'minus' });
    await waitFor(() =>
      expect(engineWrappers.getTodayWorkout).toHaveBeenCalledWith({}),
    );
  });
});

describe('WorkoutPreview — intensity banner variants', () => {
  it('renders banner +15% cand intensityMod=plus', () => {
    renderPreview({ intensityMod: 'plus' });
    const banner = screen.getByRole('status', { name: /Session intensity/i });
    expect(banner).toHaveAttribute('data-intensity', 'plus');
    expect(banner.textContent).toMatch(/\+15%/);
  });

  it('renders banner -20% cand intensityMod=minus', () => {
    renderPreview({ intensityMod: 'minus' });
    const banner = screen.getByRole('status', { name: /Session intensity/i });
    expect(banner).toHaveAttribute('data-intensity', 'minus');
    expect(banner.textContent).toMatch(/-20%/);
  });

  it('renders banner baseline cand intensityMod=normal', () => {
    renderPreview({ intensityMod: 'normal' });
    const banner = screen.getByRole('status', { name: /Session intensity/i });
    expect(banner).toHaveAttribute('data-intensity', 'normal');
    expect(banner.textContent).toMatch(/baseline/i);
  });

  it('defaults la normal cand state empty', () => {
    renderPreview();
    const banner = screen.getByRole('status', { name: /Session intensity/i });
    expect(banner).toHaveAttribute('data-intensity', 'normal');
  });
});

// C3 — duration/volume prescription tracks the ENGINE intensityMod baseline
// (deload), NOT the EnergyCheck self-report (which now feeds the engine via
// readiness, C2). Engine base 50 min / 12450 kg so the +/- multipliers land on
// the same numbers the old self-report path produced. Async: await the
// getTodayWorkout resolve so workout?.intensityMod is read.
describe('WorkoutPreview — duration + volume estimates (C3 engine baseline)', () => {
  beforeEach(() => {
    vi.mocked(engineWrappers.getTodayWorkout).mockReset();
  });

  it('duration ~35 min cand engine intensityMod=minus', async () => {
    vi.mocked(engineWrappers.getTodayWorkout).mockResolvedValue(
      makeWorkout({ intensityMod: 'minus', estimatedDuration: 50, volumeKg: 12450 }),
    );
    renderPreview();
    await waitFor(() =>
      expect(screen.getByTestId('preview-duration').textContent).toMatch(/35/),
    );
  });

  it('duration ~50 min cand engine intensityMod=normal', async () => {
    vi.mocked(engineWrappers.getTodayWorkout).mockResolvedValue(
      makeWorkout({ intensityMod: 'normal', estimatedDuration: 50, volumeKg: 12450 }),
    );
    renderPreview();
    await waitFor(() =>
      expect(screen.getByTestId('preview-duration').textContent).toMatch(/50/),
    );
  });

  it('duration ~60 min cand engine intensityMod=plus', async () => {
    vi.mocked(engineWrappers.getTodayWorkout).mockResolvedValue(
      makeWorkout({ intensityMod: 'plus', estimatedDuration: 50, volumeKg: 12450 }),
    );
    renderPreview();
    await waitFor(() =>
      expect(screen.getByTestId('preview-duration').textContent).toMatch(/60/),
    );
  });

  it('volume scales cu engine intensityMod (minus < plus)', async () => {
    vi.mocked(engineWrappers.getTodayWorkout).mockResolvedValue(
      makeWorkout({ intensityMod: 'minus', estimatedDuration: 50, volumeKg: 12450 }),
    );
    const minus = renderPreview();
    await waitFor(() => expect(screen.getByTestId('preview-volume')).toBeInTheDocument());
    const minusKg = parseInt(
      screen.getByTestId('preview-volume').textContent?.replace(/\D/g, '') ?? '0',
      10,
    );
    minus.unmount();

    vi.mocked(engineWrappers.getTodayWorkout).mockResolvedValue(
      makeWorkout({ intensityMod: 'plus', estimatedDuration: 50, volumeKg: 12450 }),
    );
    renderPreview();
    await waitFor(() => expect(screen.getByTestId('preview-volume')).toBeInTheDocument());
    const plusKg = parseInt(
      screen.getByTestId('preview-volume').textContent?.replace(/\D/g, '') ?? '0',
      10,
    );

    expect(plusKg).toBeGreaterThan(minusKg);
  });

  it('self-report intensityMod does NOT scale duration (anti double-count)', async () => {
    // Engine normal + self-report minus → duration stays baseline 50 (no -30%
    // stacking from the self-report; it feeds the engine via readiness, C2).
    vi.mocked(engineWrappers.getTodayWorkout).mockResolvedValue(
      makeWorkout({ intensityMod: 'normal', estimatedDuration: 50, volumeKg: 12450 }),
    );
    renderPreview({ intensityMod: 'minus' });
    await waitFor(() =>
      expect(screen.getByTestId('preview-duration').textContent).toMatch(/50/),
    );
  });

  it('volume formatted cu space separator (ro-RO)', async () => {
    vi.mocked(engineWrappers.getTodayWorkout).mockResolvedValue(
      makeWorkout({ intensityMod: 'normal', estimatedDuration: 50, volumeKg: 12450 }),
    );
    renderPreview();
    await waitFor(() => {
      const volumeText = screen.getByTestId('preview-volume').textContent ?? '';
      expect(volumeText).toMatch(/12 ?\.?\s*450\s*kg/);
    });
  });
});

describe('WorkoutPreview — navigation', () => {
  beforeEach(() => {
    useWorkoutStore.getState().setSessionContext(null);
  });

  it('Start antrenament navigates la /app/antrenor/workout', () => {
    // §F-workout-preview-05 — CTA "Confirma, incep" mockup verbatim.
    renderPreview({ intensityMod: 'normal' });
    fireEvent.click(screen.getByRole('button', { name: /Confirm, let's start/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/workout'
    );
  });

  // U-03 (HIGH) — handleStart persista intensityMod in store (location.state
  // se pierde la navigate fara state). Workout.tsx il citeste de acolo.
  it('Start persista intensityMod minus in workoutStore', () => {
    renderPreview({ intensityMod: 'minus' });
    fireEvent.click(screen.getByRole('button', { name: /Confirm, let's start/i }));
    expect(useWorkoutStore.getState().sessionContext?.intensityMod).toBe('minus');
  });

  // U-03 (HIGH) — painContext din PainButton propagat in store la start.
  it('Start persista painContext in workoutStore', () => {
    renderPreview({
      intensityMod: 'minus',
      painContext: { region: 'umar-stang', intensity: 3 },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirm, let's start/i }));
    expect(useWorkoutStore.getState().sessionContext?.painContext).toEqual({
      region: 'umar-stang',
      intensity: 3,
    });
  });
});

describe('WorkoutPreview — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderPreview({ intensityMod: 'minus' });
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});

// ══ F-workout-preview T5 — Rich content (hero / warmup / exercise list) ════
//
// Mock engine output helpers — emulate getTodayWorkout returning either
// engine PlannedWorkoutOutput (rich aggregate) or null (fallback).
const mockedGetTodayWorkout = vi.mocked(engineWrappers.getTodayWorkout);

function makeWorkout(
  overrides: Partial<PlannedWorkoutOutput> = {},
): PlannedWorkoutOutput {
  return {
    workoutTitle: 'Pull (spate si biceps)',
    exerciseCount: 3,
    estimatedDuration: 48,
    intensityMod: 'normal',
    exercises: [
      { id: 'ex-1', name: 'Trageri verticale', sets: 4, targetReps: 8, targetKg: 60, restSec: 120 },
      { id: 'ex-2', name: 'Ramat cu bara',      sets: 3, targetReps: 10, targetKg: 50, restSec: 90 },
      { id: 'ex-3', name: 'Curl haltera',       sets: 3, targetReps: 12, targetKg: 12, restSec: 60 },
    ],
    volumeKg: 8400,
    warmup: { line: 'Incalzire ~7 min', durationMin: 7 },
    ...overrides,
  };
}

describe('WorkoutPreview — hero card (T2)', () => {
  beforeEach(() => {
    mockedGetTodayWorkout.mockResolvedValue(null);
  });

  it('renders hero card with eyebrow "Today\'s session"', () => {
    renderPreview();
    const hero = screen.getByTestId('preview-hero');
    expect(hero).toBeInTheDocument();
    expect(hero.textContent).toMatch(/Today's session/i);
  });

  it('hero exposes role=region with aria-label "Today\'s session"', () => {
    renderPreview();
    expect(
      screen.getByRole('region', { name: /Today's session/i }),
    ).toBeInTheDocument();
  });

  it('hero renders 3 chips: duration + exercise-count + volume', () => {
    renderPreview({ intensityMod: 'normal' });
    expect(screen.getByTestId('preview-duration')).toBeInTheDocument();
    expect(screen.getByTestId('preview-exercise-count')).toBeInTheDocument();
    expect(screen.getByTestId('preview-volume')).toBeInTheDocument();
  });

  it('exercise-count chip renders fallback 5 exercises cand workout null', () => {
    renderPreview();
    expect(screen.getByTestId('preview-exercise-count').textContent).toMatch(/5\s*exercises/i);
  });

  it('exercise-count chip wires engine workout.exerciseCount', async () => {
    mockedGetTodayWorkout.mockResolvedValue(makeWorkout({ exerciseCount: 7 }));
    renderPreview();
    await waitFor(() => {
      expect(screen.getByTestId('preview-exercise-count').textContent).toMatch(/7\s*exercises/i);
    });
  });
});

describe('WorkoutPreview — warmup row (T3)', () => {
  beforeEach(() => {
    mockedGetTodayWorkout.mockResolvedValue(null);
  });

  it('warmup row NOT rendered cand workout null (no engine data)', () => {
    renderPreview();
    expect(screen.queryByTestId('preview-warmup-row')).not.toBeInTheDocument();
  });

  it('warmup row NOT rendered cand workout.warmup is null', async () => {
    mockedGetTodayWorkout.mockResolvedValue(makeWorkout({ warmup: null }));
    renderPreview();
    // Wait for engine settle; row still absent
    await waitFor(() => {
      expect(screen.getByTestId('preview-hero')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('preview-warmup-row')).not.toBeInTheDocument();
  });

  it('warmup row renders engine ui_label cand workout.warmup non-null', async () => {
    mockedGetTodayWorkout.mockResolvedValue(makeWorkout({
      warmup: { line: 'Incalzire ~8 min', durationMin: 8 },
    }));
    renderPreview();
    await waitFor(() => {
      const row = screen.getByTestId('preview-warmup-row');
      expect(row).toBeInTheDocument();
      // Locale-aware — RO bundle: "Incalzire ~8 min" / EN default: "Warm-up ~8 min".
      expect(row.textContent).toMatch(/(Incalzire|Warm-up)\s*~?8\s*min/i);
    });
  });

  it('warmup row exposes role=region with aria-label "Warm-up today"', async () => {
    mockedGetTodayWorkout.mockResolvedValue(makeWorkout());
    renderPreview();
    await waitFor(() => {
      expect(
        screen.getByRole('region', { name: /Warm-up today/i }),
      ).toBeInTheDocument();
    });
  });
});

describe('WorkoutPreview — FALLBACK guard (loading + error + empty)', () => {
  // gsd-ui-auditor chat 5 Wave 8 — FALLBACK guard pentru edge cases:
  // (1) loading state expune aria-busy pana resolve; (2) promise rejection
  // surfaces error banner cu role=alert; (3) engine null (rest day or
  // wrapper safe-catch) renders mockup demo fallback (already covered T4).
  it('section exposes aria-busy=true while getTodayWorkout pending', () => {
    let resolvePromise: (value: PlannedWorkoutOutput | null) => void = () => {};
    mockedGetTodayWorkout.mockImplementation(
      () => new Promise<PlannedWorkoutOutput | null>((res) => { resolvePromise = res; }),
    );
    renderPreview();
    expect(screen.getByTestId('workout-preview')).toHaveAttribute('aria-busy', 'true');
    // No error banner during loading
    expect(screen.queryByTestId('preview-error-banner')).not.toBeInTheDocument();
    // Resolve so cleanup setState fires
    resolvePromise(null);
  });

  it('section flips aria-busy=false after getTodayWorkout resolves null', async () => {
    mockedGetTodayWorkout.mockResolvedValue(null);
    renderPreview();
    await waitFor(() => {
      expect(screen.getByTestId('workout-preview')).toHaveAttribute('aria-busy', 'false');
    });
  });

  it('renders error banner cand getTodayWorkout promise rejects', async () => {
    mockedGetTodayWorkout.mockRejectedValue(new Error('engine pipeline boom'));
    renderPreview();
    await waitFor(() => {
      const banner = screen.getByTestId('preview-error-banner');
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveAttribute('role', 'alert');
      expect(banner.textContent).toMatch(/Couldn't load today's session/i);
    });
    // Fallback content still renders so Gigel can proceed
    expect(screen.getAllByTestId('preview-exercise-row')).toHaveLength(5);
    expect(
      screen.getByRole('button', { name: /Confirm, let's start/i }),
    ).toBeInTheDocument();
  });

  it('no error banner on happy path (engine resolves null)', async () => {
    mockedGetTodayWorkout.mockResolvedValue(null);
    renderPreview();
    await waitFor(() => {
      expect(screen.getByTestId('workout-preview')).toHaveAttribute('aria-busy', 'false');
    });
    expect(screen.queryByTestId('preview-error-banner')).not.toBeInTheDocument();
  });
});

describe('WorkoutPreview — exercise list (T4)', () => {
  beforeEach(() => {
    mockedGetTodayWorkout.mockResolvedValue(null);
  });

  it('renders fallback 5 exercise rows cand workout null', () => {
    renderPreview();
    const rows = screen.getAllByTestId('preview-exercise-row');
    expect(rows).toHaveLength(5);
  });

  it('fallback row 1 shows mockup-parity incline DB press (EN default)', () => {
    renderPreview();
    const list = screen.getByTestId('preview-exercise-list');
    expect(list.textContent).toMatch(/Incline dumbbell press/i);
  });

  it('renders engine exercises cand workout.exercises non-empty (3 rows)', async () => {
    mockedGetTodayWorkout.mockResolvedValue(makeWorkout());
    renderPreview();
    await waitFor(() => {
      const rows = screen.getAllByTestId('preview-exercise-row');
      expect(rows).toHaveLength(3);
    });
  });

  it('engine row renders exercise name + sets/reps/kg detail', async () => {
    mockedGetTodayWorkout.mockResolvedValue(makeWorkout());
    renderPreview();
    await waitFor(() => {
      const list = screen.getByTestId('preview-exercise-list');
      expect(list.textContent).toMatch(/Trageri verticale/i);
      // Wave E1 — detail line surfaces EN "sets" under default locale.
      expect(list.textContent).toMatch(/4\s*sets/i);
      expect(list.textContent).toMatch(/60\s*kg/i);
    });
  });
});
