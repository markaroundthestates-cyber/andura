// ══ ROUTING TESTS — Phase 2 Skeleton Verify ═══════════════════════════════
// Uses legacy MemoryRouter + Routes/Route pattern (NU createMemoryRouter data
// router) pentru izolare fără Node 25 undici AbortSignal mismatch în data
// router fetch lifecycle. Prod în router.tsx folosește createBrowserRouter.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Phase 6 task_02 Option C: mock async getTodayWorkout returns Phase 5
// fixture pentru Workout sub-screen heading /Bench Press/i assertion.
// WorkoutPreview heading /Push/i served via workoutTitle fallback (uses
// hardcoded fallback "Push (piept si umeri)" when workout is null until
// useEffect resolves). Per DECISIONS.md §D027.
vi.mock('../lib/engineWrappers', async () => {
  const actual = await vi.importActual<typeof import('../lib/engineWrappers')>(
    '../lib/engineWrappers'
  );
  return {
    ...actual,
    getTodayWorkout: vi.fn(async () => ({
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
    })),
  };
});

import { ProtectedRoute } from '../routes/ProtectedRoute';
import { Layout } from '../routes/Layout';
import { Splash } from '../routes/screens/Splash';
import { Auth } from '../routes/screens/Auth';
import { Onboarding } from '../routes/screens/Onboarding';
import { Antrenor } from '../routes/screens/antrenor/Antrenor';
import { EnergyCheck } from '../routes/screens/antrenor/EnergyCheck';
import { EnergyCause } from '../routes/screens/antrenor/EnergyCause';
import { WorkoutPreview } from '../routes/screens/antrenor/WorkoutPreview';
import { Workout } from '../routes/screens/antrenor/Workout';
import { CevaNuMerge } from '../routes/screens/antrenor/CevaNuMerge';
import { PainButton } from '../routes/screens/antrenor/PainButton';
import { EquipmentSwap } from '../routes/screens/antrenor/EquipmentSwap';
import { AparateLipsa } from '../routes/screens/antrenor/AparateLipsa';
import { ScheduleOverride } from '../routes/screens/antrenor/ScheduleOverride';
import { PostRpe } from '../routes/screens/antrenor/PostRpe';
import { PostSummary } from '../routes/screens/antrenor/PostSummary';
import { Progres } from '../routes/screens/progres/Progres';
import { Istoric } from '../routes/screens/istoric/Istoric';
import { Cont } from '../routes/screens/cont/Cont';
import { useAppStore } from '../stores/appStore';
import { useOnboardingStore } from '../stores/onboardingStore';

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding/:step" element={<Onboarding />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Antrenor />} />
          <Route path="antrenor" element={<Antrenor />} />
          <Route path="progres" element={<Progres />} />
          <Route path="istoric" element={<Istoric />} />
          <Route path="cont" element={<Cont />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('Routing — top-level screens', () => {
  beforeEach(() => {
    useAppStore.getState().setAuthenticated(false);
  });

  it('renders Splash la /', () => {
    renderAt('/');
    expect(screen.getByText(/Andura/i)).toBeInTheDocument();
  });

  it('renders Auth la /auth', () => {
    renderAt('/auth');
    expect(screen.getByText('Intra in cont')).toBeInTheDocument();
  });

  it('renders Onboarding step la /onboarding/3', () => {
    renderAt('/onboarding/3');
    // Phase 5 task_14: Onboarding refactored with Big 6 hard typing — step 3
    // renders goal selection cu "Ce vrei sa obtii?" heading.
    expect(screen.getByText(/Pasul 3 din 7/i)).toBeInTheDocument();
  });
});

describe('Routing — ProtectedRoute redirect', () => {
  beforeEach(() => {
    useAppStore.getState().setAuthenticated(false);
    useOnboardingStore.setState({ completed: true, completedAt: Date.now() });
  });

  it('redirects la /auth daca !isAuthenticated', () => {
    renderAt('/app/antrenor');
    expect(screen.getByText('Intra in cont')).toBeInTheDocument();
  });

  it('renders Antrenor daca isAuthenticated + onboarding completed', () => {
    useAppStore.getState().setAuthenticated(true);
    renderAt('/app/antrenor');
    expect(screen.getByRole('heading', { name: 'Antrenor', level: 1 })).toBeInTheDocument();
    useAppStore.getState().setAuthenticated(false);
  });

  it('§A015 redirects la /onboarding/1 daca authenticated dar !onboarding completed', () => {
    useAppStore.getState().setAuthenticated(true);
    useOnboardingStore.setState({ completed: false, completedAt: null });
    renderAt('/app/antrenor');
    expect(screen.getByText(/Pasul 1 din 7/i)).toBeInTheDocument();
    useAppStore.getState().setAuthenticated(false);
  });
});

describe('Routing — BottomNav active tab', () => {
  beforeEach(() => {
    useAppStore.getState().setAuthenticated(true);
    useOnboardingStore.setState({ completed: true, completedAt: Date.now() });
  });

  it('Antrenor tab activ la /app/antrenor', () => {
    renderAt('/app/antrenor');
    const antrenorButton = screen.getByRole('button', { name: /Antrenor/i });
    expect(antrenorButton).toHaveAttribute('aria-current', 'page');
  });

  it('Progres tab activ la /app/progres', () => {
    renderAt('/app/progres');
    const progresButton = screen.getByRole('button', { name: /Progres/i });
    expect(progresButton).toHaveAttribute('aria-current', 'page');
  });

  it('Istoric tab activ la /app/istoric', () => {
    renderAt('/app/istoric');
    const istoricButton = screen.getByRole('button', { name: /Istoric/i });
    expect(istoricButton).toHaveAttribute('aria-current', 'page');
  });

  it('Cont tab activ la /app/cont', () => {
    renderAt('/app/cont');
    const contButton = screen.getByRole('button', { name: /Cont/i });
    expect(contButton).toHaveAttribute('aria-current', 'page');
  });
});

describe('Routing — Auth flow stub', () => {
  beforeEach(() => {
    useAppStore.getState().setAuthenticated(false);
  });

  it('Mock login button seteaza isAuthenticated true', async () => {
    const user = userEvent.setup();
    renderAt('/auth');
    const loginButton = screen.getByRole('button', { name: /Mock login/i });
    await user.click(loginButton);
    expect(useAppStore.getState().isAuthenticated).toBe(true);
    useAppStore.getState().setAuthenticated(false);
  });
});

describe('Routing — Phase 3 Antrenor sub-screen stubs render', () => {
  const stubs = [
    // task_05 rewrite: EnergyCheck real heading; EnergyCause + WorkoutPreview
    // still placeholder until subsequent task_05 commits.
    { path: '/app/antrenor/energy-check', Component: EnergyCheck, heading: /^Cum te simti\?$/i },
    { path: '/app/antrenor/energy-cause', Component: EnergyCause, heading: /De ce te simti asa/i },
    { path: '/app/antrenor/workout-preview', Component: WorkoutPreview, heading: /Push/i },
    { path: '/app/antrenor/workout', Component: Workout, heading: /Bench Press/i },
    { path: '/app/antrenor/ceva-nu-merge', Component: CevaNuMerge, heading: /Ce nu merge/i },
    { path: '/app/antrenor/pain-button', Component: PainButton, heading: /Ma doare ceva/i },
    { path: '/app/antrenor/equipment-swap', Component: EquipmentSwap, heading: /Schimba echipament/i },
    { path: '/app/antrenor/aparate-lipsa', Component: AparateLipsa, heading: /^Aparate lipsa$/i },
    { path: '/app/antrenor/schedule-override', Component: ScheduleOverride, heading: /Schimbi planul de azi/i },
    { path: '/app/antrenor/post-rpe', Component: PostRpe, heading: /Cum a fost sesiunea/i },
    { path: '/app/antrenor/post-summary', Component: PostSummary, heading: /Sesiune/i },
  ];

  it.each(stubs)('renders $heading stub la $path', async ({ path, Component, heading }) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={<Component />} />
        </Routes>
      </MemoryRouter>
    );
    // Phase 6 task_02 Option C: Workout + WorkoutPreview async pipeline —
    // wait for loading state resolve. Per DECISIONS.md §D027.
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: heading, level: 1 })).toBeInTheDocument();
    });
  });
});

describe('Routing — Phase 3 Antrenor nested routes integration', () => {
  beforeEach(() => {
    useAppStore.getState().setAuthenticated(true);
    useOnboardingStore.setState({ completed: true, completedAt: Date.now() });
  });

  function renderNested(initialPath: string) {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Antrenor />} />
            <Route path="antrenor">
              <Route index element={<Antrenor />} />
              <Route path="energy-check" element={<EnergyCheck />} />
              <Route path="workout-preview" element={<WorkoutPreview />} />
              <Route path="post-summary" element={<PostSummary />} />
            </Route>
            <Route path="progres" element={<Progres />} />
            <Route path="istoric" element={<Istoric />} />
            <Route path="cont" element={<Cont />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders EnergyCheck cu Layout (bottom nav) la /app/antrenor/energy-check', () => {
    renderNested('/app/antrenor/energy-check');
    // PAR-009: single h1 = SubHeader title 'Cum te simti?' verbatim mockup L879.
    // Body sub-heading 'Cum te simti azi?' regresat la h2.
    expect(screen.getByRole('heading', { name: /^Cum te simti\?$/i, level: 1 })).toBeInTheDocument();
    const antrenorButton = screen.getByRole('button', { name: /Antrenor/i });
    expect(antrenorButton).toHaveAttribute('aria-current', 'page');
  });

  it('Antrenor index render la /app/antrenor preserved post-nested', () => {
    renderNested('/app/antrenor');
    expect(screen.getByRole('heading', { name: 'Antrenor', level: 1 })).toBeInTheDocument();
    useAppStore.getState().setAuthenticated(false);
  });
});
