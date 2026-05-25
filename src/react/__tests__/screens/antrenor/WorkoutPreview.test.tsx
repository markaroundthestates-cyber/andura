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
  it('renders fallback heading "Push (piept si umeri)" cand engine returns null', () => {
    renderPreview();
    expect(
      screen.getByRole('heading', { name: /Push/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders Start antrenament CTA', () => {
    // §F-workout-preview-05 (HIGH chat5 Wave 15) — CTA mockup verbatim
    // "Confirma, incep" + Check icon (confirmation framing andura-clasic.html#L993).
    renderPreview();
    expect(screen.getByRole('button', { name: /Confirma, incep/i })).toBeInTheDocument();
  });

  it('renders intensity banner cu role=status', () => {
    renderPreview();
    expect(screen.getByRole('status', { name: /Intensitate sesiune/i })).toBeInTheDocument();
  });

  it('renders coach quote line', () => {
    renderPreview();
    const quote = screen.getByTestId('preview-coach-line');
    expect(quote).toBeInTheDocument();
    expect(quote.textContent?.length).toBeGreaterThan(0);
  });
});

describe('WorkoutPreview — intensity banner variants', () => {
  it('renders banner +15% cand intensityMod=plus', () => {
    renderPreview({ intensityMod: 'plus' });
    const banner = screen.getByRole('status', { name: /Intensitate sesiune/i });
    expect(banner).toHaveAttribute('data-intensity', 'plus');
    expect(banner.textContent).toMatch(/\+15%/);
  });

  it('renders banner -20% cand intensityMod=minus', () => {
    renderPreview({ intensityMod: 'minus' });
    const banner = screen.getByRole('status', { name: /Intensitate sesiune/i });
    expect(banner).toHaveAttribute('data-intensity', 'minus');
    expect(banner.textContent).toMatch(/-20%/);
  });

  it('renders banner baseline cand intensityMod=normal', () => {
    renderPreview({ intensityMod: 'normal' });
    const banner = screen.getByRole('status', { name: /Intensitate sesiune/i });
    expect(banner).toHaveAttribute('data-intensity', 'normal');
    expect(banner.textContent).toMatch(/baseline/i);
  });

  it('defaults la normal cand state empty', () => {
    renderPreview();
    const banner = screen.getByRole('status', { name: /Intensitate sesiune/i });
    expect(banner).toHaveAttribute('data-intensity', 'normal');
  });
});

describe('WorkoutPreview — duration + volume estimates', () => {
  it('duration ~35 min cand intensityMod=minus', () => {
    renderPreview({ intensityMod: 'minus' });
    expect(screen.getByTestId('preview-duration').textContent).toMatch(/35/);
  });

  it('duration ~50 min cand intensityMod=normal', () => {
    renderPreview({ intensityMod: 'normal' });
    expect(screen.getByTestId('preview-duration').textContent).toMatch(/50/);
  });

  it('duration ~60 min cand intensityMod=plus', () => {
    renderPreview({ intensityMod: 'plus' });
    expect(screen.getByTestId('preview-duration').textContent).toMatch(/60/);
  });

  it('volume scales cu intensityMod (minus < normal < plus)', () => {
    renderPreview({ intensityMod: 'minus' });
    const minusText = screen.getByTestId('preview-volume').textContent ?? '';
    const minusKg = parseInt(minusText.replace(/\D/g, ''), 10);

    renderPreview({ intensityMod: 'plus' });
    const plusTexts = screen.getAllByTestId('preview-volume');
    const plusKg = parseInt(plusTexts[plusTexts.length - 1]!.textContent?.replace(/\D/g, '') ?? '0', 10);

    expect(plusKg).toBeGreaterThan(minusKg);
  });

  it('volume formatted cu space separator (ro-RO)', () => {
    renderPreview({ intensityMod: 'normal' });
    const volumeText = screen.getByTestId('preview-volume').textContent ?? '';
    expect(volumeText).toMatch(/12 ?\.?\s*450\s*kg/);
  });
});

describe('WorkoutPreview — navigation', () => {
  beforeEach(() => {
    useWorkoutStore.getState().setSessionContext(null);
  });

  it('Start antrenament navigates la /app/antrenor/workout', () => {
    // §F-workout-preview-05 — CTA "Confirma, incep" mockup verbatim.
    renderPreview({ intensityMod: 'normal' });
    fireEvent.click(screen.getByRole('button', { name: /Confirma, incep/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/workout'
    );
  });

  // U-03 (HIGH) — handleStart persista intensityMod in store (location.state
  // se pierde la navigate fara state). Workout.tsx il citeste de acolo.
  it('Start persista intensityMod minus in workoutStore', () => {
    renderPreview({ intensityMod: 'minus' });
    fireEvent.click(screen.getByRole('button', { name: /Confirma, incep/i }));
    expect(useWorkoutStore.getState().sessionContext?.intensityMod).toBe('minus');
  });

  // U-03 (HIGH) — painContext din PainButton propagat in store la start.
  it('Start persista painContext in workoutStore', () => {
    renderPreview({
      intensityMod: 'minus',
      painContext: { region: 'umar-stang', intensity: 3 },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirma, incep/i }));
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

  it('renders hero card with eyebrow "Sesiunea de azi"', () => {
    renderPreview();
    const hero = screen.getByTestId('preview-hero');
    expect(hero).toBeInTheDocument();
    expect(hero.textContent).toMatch(/Sesiunea de azi/i);
  });

  it('hero exposes role=region with aria-label "Sesiunea de azi"', () => {
    renderPreview();
    expect(
      screen.getByRole('region', { name: /Sesiunea de azi/i }),
    ).toBeInTheDocument();
  });

  it('hero renders 3 chips: duration + exercise-count + volume', () => {
    renderPreview({ intensityMod: 'normal' });
    expect(screen.getByTestId('preview-duration')).toBeInTheDocument();
    expect(screen.getByTestId('preview-exercise-count')).toBeInTheDocument();
    expect(screen.getByTestId('preview-volume')).toBeInTheDocument();
  });

  it('exercise-count chip renders fallback 5 exercitii cand workout null', () => {
    renderPreview();
    expect(screen.getByTestId('preview-exercise-count').textContent).toMatch(/5\s*exercitii/i);
  });

  it('exercise-count chip wires engine workout.exerciseCount', async () => {
    mockedGetTodayWorkout.mockResolvedValue(makeWorkout({ exerciseCount: 7 }));
    renderPreview();
    await waitFor(() => {
      expect(screen.getByTestId('preview-exercise-count').textContent).toMatch(/7\s*exercitii/i);
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
      expect(row.textContent).toMatch(/Incalzire\s*~?8\s*min/i);
    });
  });

  it('warmup row exposes role=region with aria-label "Incalzire azi"', async () => {
    mockedGetTodayWorkout.mockResolvedValue(makeWorkout());
    renderPreview();
    await waitFor(() => {
      expect(
        screen.getByRole('region', { name: /Incalzire azi/i }),
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
      expect(banner.textContent).toMatch(/Nu am putut incarca/i);
    });
    // Fallback content still renders so Gigel can proceed
    expect(screen.getAllByTestId('preview-exercise-row')).toHaveLength(5);
    expect(
      screen.getByRole('button', { name: /Confirma, incep/i }),
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

  it('fallback row 1 shows mockup-parity "Impins inclinat cu gantere"', () => {
    renderPreview();
    const list = screen.getByTestId('preview-exercise-list');
    expect(list.textContent).toMatch(/Impins inclinat cu gantere/i);
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
      expect(list.textContent).toMatch(/4\s*seturi/i);
      expect(list.textContent).toMatch(/60\s*kg/i);
    });
  });
});
