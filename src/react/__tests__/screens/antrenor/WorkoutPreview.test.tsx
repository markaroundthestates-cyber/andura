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

  it('hides hero metric chips once engine settles with no plan (honest state)', async () => {
    // A3 honest-fallback — old behavior showed a fabricated "5 exercises" chip
    // on null. Now, after the engine settles empty, the chips disappear (no
    // fake metrics) and the honest empty state surfaces instead.
    mockedGetTodayWorkout.mockResolvedValue(null);
    renderPreview();
    await waitFor(() => {
      expect(screen.getByTestId('preview-empty-plan')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('preview-exercise-count')).not.toBeInTheDocument();
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

describe('WorkoutPreview — tempo cue row (F2 #3)', () => {
  beforeEach(() => {
    mockedGetTodayWorkout.mockResolvedValue(null);
  });

  it('tempo row NOT rendered cand workout.tempoCue absent (default fixture)', async () => {
    mockedGetTodayWorkout.mockResolvedValue(makeWorkout());
    renderPreview();
    await waitFor(() => {
      expect(screen.getByTestId('preview-hero')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('preview-tempo-row')).not.toBeInTheDocument();
  });

  it('tempo row NOT rendered cand workout.tempoCue is null', async () => {
    mockedGetTodayWorkout.mockResolvedValue(makeWorkout({ tempoCue: null }));
    renderPreview();
    await waitFor(() => {
      expect(screen.getByTestId('preview-hero')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('preview-tempo-row')).not.toBeInTheDocument();
  });

  it('tempo row localizes the engine cue under EN (cueId → EN prose, no RO leak)', async () => {
    // The engine emits a stable cueId + persona + notation (locale-neutral); the
    // render boundary resolves the cue prose via i18n. Under EN the row must NOT
    // surface the RO `line` — that was the live leak ("Sugerez: controleaza
    // coborarea..."). The notation passes through (locale-neutral digits).
    mockedGetTodayWorkout.mockResolvedValue(makeWorkout({
      tempoCue: {
        line: 'Tempo 2-1-2-0, Sugerez: controleaza coborarea, pastreaza tensiunea.',
        notation: '2-1-2-0',
        cueId: 'compound',
        persona: 'gigica',
      },
    }));
    renderPreview();
    await waitFor(() => {
      const row = screen.getByTestId('preview-tempo-row');
      expect(row).toBeInTheDocument();
      const text = row.textContent ?? '';
      expect(text).toMatch(/2-1-2-0/);
      // EN prose surfaces; RO leak words do NOT.
      expect(text).toMatch(/control the descent/i);
      expect(text).toMatch(/Suggestion:/i);
      expect(text).not.toMatch(/controleaza|pastreaza|Sugerez/i);
    });
  });

  it('tempo row falls back to the raw line when cueId is absent (old/partial shape)', async () => {
    // Defensive path: a persisted/partial shape with no cueId → the boundary
    // renders the engine `line` verbatim (better than nothing). Guards the
    // fallback branch of localizeTempoCue.
    mockedGetTodayWorkout.mockResolvedValue(makeWorkout({
      tempoCue: { line: 'Tempo 3-1-1-0, slow eccentric', notation: '3-1-1-0', cueId: null, persona: null },
    }));
    renderPreview();
    await waitFor(() => {
      const row = screen.getByTestId('preview-tempo-row');
      expect(row.textContent).toMatch(/slow eccentric/i);
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
    // A3 honest-fallback — no fabricated demo plan: the honest empty state shows
    // instead of fake exercise rows + a Start CTA that would start nothing real.
    expect(screen.getByTestId('preview-empty-plan')).toBeInTheDocument();
    expect(screen.queryAllByTestId('preview-exercise-row')).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: /Confirm, let's start/i }),
    ).toBeNull();
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

  it('shows honest empty state (NU fabricated demo rows) cand engine settles empty', async () => {
    // A3 honest-fallback — the old hardcoded 5-exercise "Push" demo list is
    // gone. On no plan, the UI shows an honest message + actions, not fake rows.
    renderPreview();
    await waitFor(() => {
      expect(screen.getByTestId('preview-empty-plan')).toBeInTheDocument();
    });
    expect(screen.queryAllByTestId('preview-exercise-row')).toHaveLength(0);
    expect(screen.getByTestId('preview-empty-plan').textContent).toMatch(/Can't build the full plan right now/i);
  });

  it('honest empty state offers [Try again] + [Light manual session]', async () => {
    renderPreview();
    await waitFor(() => {
      expect(screen.getByTestId('preview-empty-plan')).toBeInTheDocument();
    });
    expect(screen.getByTestId('preview-empty-retry')).toBeInTheDocument();
    expect(screen.getByTestId('preview-empty-manual')).toBeInTheDocument();
  });

  it('[Try again] re-runs the pipeline (re-calls getTodayWorkout)', async () => {
    mockedGetTodayWorkout.mockResolvedValue(null);
    renderPreview();
    await waitFor(() => {
      expect(screen.getByTestId('preview-empty-retry')).toBeInTheDocument();
    });
    const callsBefore = mockedGetTodayWorkout.mock.calls.length;
    fireEvent.click(screen.getByTestId('preview-empty-retry'));
    await waitFor(() => {
      expect(mockedGetTodayWorkout.mock.calls.length).toBeGreaterThan(callsBefore);
    });
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

  // Audit 2026-06-12 — dumbbell loads are per hand engine-wide; the row detail
  // must label them. Real library metadata drives the branch (Hammer Curl =
  // dumbbell -> "kg/hand"; the cable row stays plain "kg").
  it('labels dumbbell rows kg/hand via engineName metadata, others stay plain', async () => {
    mockedGetTodayWorkout.mockResolvedValue(makeWorkout({
      exercises: [
        { id: 'ex-1', name: 'Curl ciocan', engineName: 'Hammer Curl', sets: 2, targetReps: 10, targetKg: 12.5, restSec: 60 },
        { id: 'ex-2', name: 'Trageri verticale', engineName: 'Lat Pulldown', sets: 3, targetReps: 8, targetKg: 60, restSec: 120 },
      ],
      exerciseCount: 2,
    }));
    renderPreview();
    await waitFor(() => {
      const list = screen.getByTestId('preview-exercise-list');
      expect(list.textContent).toMatch(/12\.5\s*kg\/hand/i);
      expect(list.textContent).toMatch(/60\s*kg(?!\/)/i);
    });
  });
});
