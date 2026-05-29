// ══ ANTRENOR HOME TESTS — F2/F4/F6/F8/F10/F11 Parity Verify ══════════════
// Per task_04 spec §4 A.
// MemoryRouter jsdom paradigm per D020 (NU createBrowserRouter).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Phase 6 task_06 Option B: Antrenor now consumes coachDirectorAggregate
// async (8-field aggregate). Mock the aggregate directly — return CoachToday
// shape preserving existing test assertions (readiness/fatigue null defaults).
vi.mock('../../../lib/coachDirectorAggregate', () => ({
  getCoachToday: vi.fn(async () => ({
    readiness: null,
    fatigue: null,
    plannedWorkout: null,
    isRestDay: true,
    patternsBanner: [],
    prWallRecent: [],
    alerts: [],
    source: 'baseline' as const,
  })),
}));

// engineWrappers mock kept for legacy direct imports (other tests may rely).
vi.mock('../../../lib/engineWrappers', () => ({
  getReadiness: vi.fn(),
  getFatigue: vi.fn(),
  getPRDelta: vi.fn(() => null),
  getTodayWorkout: vi.fn(async () => null),
}));

import { Antrenor } from '../../../routes/screens/antrenor/Antrenor';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useCoachStore } from '../../../stores/coachStore';
import { getCoachToday } from '../../../lib/coachDirectorAggregate';
import { getReadiness, getFatigue } from '../../../lib/engineWrappers';

function resetStores(): void {
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    prHit: false,
    history: {},
    sessionStart: null,
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    streak: 0,
  });
  useCoachStore.setState({
    schedContext: 'workout',
    persona: 'gigica',
    reactivateDismissed: false,
  });
  localStorage.clear();
}

function renderAntrenor() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor']}>
      <Routes>
        <Route path="/app/antrenor" element={<Antrenor />} />
        <Route path="/app/antrenor/energy-check" element={<div>EnergyCheckStub</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Antrenor home — base render', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('renders Antrenor heading (EN default post 2026-05-28 paradigm flip — "Coach")', () => {
    renderAntrenor();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Coach');
  });

  it('renders Start session CTA inside CoachTodayCard (no paused session) — EN default', () => {
    // Daniel smoke 2026-05-28: bottom "Incepe antrenament" duplicate CTA removed
    // — CoachTodayCard's own start CTA is the single workout-day entry point.
    // Wave C2 i18n: EN default → "Start session" (was RO "Incepe sesiunea").
    renderAntrenor();
    expect(screen.getByRole('button', { name: /Start session/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Incepe antrenament$/i })).not.toBeInTheDocument();
  });

  it('renders CoachTodayCard cand schedContext=workout — EN fallback title', () => {
    renderAntrenor();
    // Wave C2 i18n: EN default → "Today's workout" fallback (was RO
    // "Antrenamentul de azi"). MED-CODE-21 generic non-claim guard preserved.
    expect(screen.getByText(/Today's workout/i)).toBeInTheDocument();
    expect(screen.queryByText(/Pull \(spate/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/&/)).not.toBeInTheDocument();
  });

  it('§A001 wire CoachTodayCard dynamic din plannedWorkout aggregate', async () => {
    vi.mocked(getCoachToday).mockResolvedValueOnce({
      readiness: null,
      fatigue: null,
      plannedWorkout: {
        workoutTitle: 'Push (piept si umeri)',
        exerciseCount: 6,
        estimatedDuration: 52,
        intensityMod: 'normal',
        exercises: [],
        volumeKg: 0,
      },
      isRestDay: false,
      patternsBanner: [],
      prWallRecent: [],
      alerts: [],
      restReason: null,
      source: 'engine',
    });
    renderAntrenor();
    // workoutTitle comes from engine verbatim (still RO in mock fixture).
    expect(await screen.findByText(/Push \(piept si umeri\)/i)).toBeInTheDocument();
    expect(screen.getByText(/~ 52 min/i)).toBeInTheDocument();
    // Wave C2: under EN default, "6 exercises" (was "6 exercitii").
    expect(screen.getByText(/6 exercises/i)).toBeInTheDocument();
  });

  it('§A002 engine-driven isRestDay wins over schedContext fallback', async () => {
    // schedContext='workout' default, but engine signals isRestDay=true →
    // CoachRestCard wins (engine-driven primary, store fallback only).
    vi.mocked(getCoachToday).mockResolvedValueOnce({
      readiness: null,
      fatigue: null,
      plannedWorkout: null,
      isRestDay: true,
      patternsBanner: [],
      prWallRecent: [],
      alerts: [],
      restReason: null,
      source: 'engine',
    });
    renderAntrenor();
    // Wave C2 i18n: EN default → "Active recovery day" (was "Zi de recuperare activa").
    expect(await screen.findByText(/Active recovery day/i)).toBeInTheDocument();
  });

  it('renders CoachRestCard cand schedContext=rest — EN default', () => {
    useCoachStore.getState().setSchedContext('rest');
    renderAntrenor();
    expect(screen.getByText(/Active recovery day/i)).toBeInTheDocument();
  });

  it('renders StatsGrid cu streak count', () => {
    useWorkoutStore.setState({ streak: 12 });
    renderAntrenor();
    expect(screen.getByTestId('stats-streak')).toHaveTextContent('12');
  });

  it('StatsGrid placeholder cand fatigue null (compact strip — readiness in orb hero)', () => {
    // Pulse Coach-home (2026-05-29): readiness is promoted to the ReadinessOrb
    // hero, so the compact strip drops the readiness tile (stats-readiness no
    // longer rendered on this screen). Fatigue stays in the strip. The orb hero
    // is now ALWAYS present (Daniel CEO LOCKED) — with readiness null it shows
    // the honest placeholder (asserted in the readiness-hero describe block).
    renderAntrenor();
    expect(screen.getByTestId('stats-fatigue')).toHaveTextContent('-');
    expect(screen.queryByTestId('stats-readiness')).not.toBeInTheDocument();
    expect(screen.getByTestId('readiness-hero')).toBeInTheDocument();
  });
});

describe('Antrenor home — resume session card', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('renders ResumeSessionCard cand pausedSnapshot exists', () => {
    useWorkoutStore.setState({
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 2',
        exIdx: 1,
        setIdx: 0,
        phase: 'logging',
        history: {},
        sessionStart: Date.now() - 18 * 60000,
      },
    });
    renderAntrenor();
    // Wave 2c i18n: ResumeSessionCard strings now via t() → EN default.
    expect(screen.getByRole('region', { name: /Resume session/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Resume$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discard/i })).toBeInTheDocument();
  });

  it('hides workout-start CTAs cand pausedSnapshot exists (Resume takes over)', () => {
    useWorkoutStore.setState({
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 2',
        exIdx: 1,
        setIdx: 0,
        phase: 'logging',
        history: {},
        sessionStart: Date.now(),
      },
    });
    renderAntrenor();
    // Daniel smoke 2026-05-28: bottom "Incepe antrenament" duplicate removed
    // post-D088. Resume card takes over and CoachTodayCard "Incepe sesiunea"
    // is still rendered above — the dedup target is the orphan bottom CTA.
    expect(screen.queryByRole('button', { name: /^Incepe antrenament$/i })).not.toBeInTheDocument();
  });

  it('clicks Reia → restores pausedSnapshot via store', () => {
    useWorkoutStore.setState({
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 2',
        exIdx: 2,
        setIdx: 1,
        phase: 'logging',
        history: { 0: [{ kg: 20, reps: 10, rating: 'usor' }] },
        sessionStart: Date.now(),
      },
    });
    renderAntrenor();
    fireEvent.click(screen.getByRole('button', { name: /^Resume$/i }));
    expect(useWorkoutStore.getState().pausedSnapshot).toBeNull();
    expect(useWorkoutStore.getState().exIdx).toBe(2);
  });

  it('clicks Renunta → discards session', () => {
    useWorkoutStore.setState({
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 2',
        exIdx: 2,
        setIdx: 1,
        phase: 'logging',
        history: { 0: [{ kg: 20, reps: 10, rating: 'usor' }] },
        sessionStart: Date.now(),
      },
    });
    renderAntrenor();
    fireEvent.click(screen.getByRole('button', { name: /Discard/i }));
    expect(useWorkoutStore.getState().pausedSnapshot).toBeNull();
    expect(useWorkoutStore.getState().history).toEqual({});
  });
});

describe('Antrenor home — reactivate card win-back', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('renders ReactivateCard cand lastSession > 14 zile + NOT dismissed', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '5 ex', ts: Date.now() - 17 * 86400000 },
    });
    renderAntrenor();
    expect(screen.getByRole('region', { name: /Welcome back/i })).toBeInTheDocument();
    expect(screen.getByText(/17 days/i)).toBeInTheDocument();
  });

  it('hides ReactivateCard cand dismissed', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '5 ex', ts: Date.now() - 17 * 86400000 },
    });
    useCoachStore.getState().dismissReactivate();
    renderAntrenor();
    expect(screen.queryByRole('region', { name: /Welcome back/i })).not.toBeInTheDocument();
  });

  it('hides ReactivateCard cand lastSession < 14 zile', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '5 ex', ts: Date.now() - 5 * 86400000 },
    });
    renderAntrenor();
    expect(screen.queryByRole('region', { name: /Welcome back/i })).not.toBeInTheDocument();
  });

  it('clicks Mai tarziu → dismisses + hides card', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '5 ex', ts: Date.now() - 17 * 86400000 },
    });
    renderAntrenor();
    fireEvent.click(screen.getByRole('button', { name: /Later/i }));
    expect(useCoachStore.getState().reactivateDismissed).toBe(true);
  });

  it('hides ReactivateCard cand pausedSnapshot present (precedence)', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '5 ex', ts: Date.now() - 17 * 86400000 },
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 1',
        exIdx: 0,
        setIdx: 0,
        phase: 'logging',
        history: {},
        sessionStart: Date.now(),
      },
    });
    renderAntrenor();
    expect(screen.queryByRole('region', { name: /Welcome back/i })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Resume session/i })).toBeInTheDocument();
  });
});

describe('Antrenor home — F4 readiness verdict', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  // Phase 6 task_06: readiness vine via getCoachToday aggregate, NU direct
  // getReadiness call. Mock the aggregate cu readiness field set.

  it('renders verdict label + score cand readiness present', async () => {
    vi.mocked(getCoachToday).mockResolvedValueOnce({
      readiness: {
        score: 85,
        label: 'Zi de PR',
        color: 'var(--green)',
        volumeMultiplier: 1.1,
        canPR: true,
      },
      fatigue: null,
      plannedWorkout: null,
      isRestDay: true,
      patternsBanner: [],
      prWallRecent: [],
      alerts: [],
      restReason: null,
      source: 'engine',
    });
    renderAntrenor();
    const verdict = await screen.findByRole('status', { name: /Verdict readiness|Readiness verdict/i });
    expect(verdict).toBeInTheDocument();
    expect(verdict).toHaveTextContent('Zi de PR');
    expect(verdict).toHaveTextContent('85/100');
  });

  it('hides verdict cand readiness null', async () => {
    renderAntrenor();
    // Default mock returns readiness=null; loading state renders empty stats
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(screen.queryByRole('status', { name: /Verdict readiness|Readiness verdict/i })).not.toBeInTheDocument();
  });

  it('no-data → readiness orb present in placeholder mode (em-dash, microcopy, no PR pill)', async () => {
    // Honesty invariant (Daniel CEO LOCKED 2026-05-29): the breathing orb is the
    // ALWAYS-present hero, but with no readiness history the engine refuses a
    // verdict, so the orb shows an em-dash "—" (NOT 0, NOT a fabricated number)
    // + a microcopy line inviting the first log, and NO "primed for a PR" pill.
    renderAntrenor();
    // Default mock returns readiness=null; flush the async aggregate microtask.
    await new Promise((resolve) => setTimeout(resolve, 0));
    const hero = screen.getByTestId('readiness-hero');
    expect(hero).toBeInTheDocument();
    const orb = screen.getByTestId('readiness-orb');
    expect(orb).toHaveAttribute('data-empty', 'true');
    expect(orb).toHaveAttribute('data-can-pr', 'false');
    expect(screen.getByTestId('readiness-orb-score')).toHaveTextContent('—');
    expect(screen.getByTestId('readiness-empty-microcopy')).toBeInTheDocument();
    // No fabricated readiness verdict + no PR pill in the empty state.
    expect(screen.queryByRole('status', { name: /Verdict readiness|Readiness verdict/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/poti incerca PR|you can try a PR|Primed for a PR|Pregatit de PR/i)).not.toBeInTheDocument();
  });

  it('with-data → orb shows real score + verdict (no placeholder)', async () => {
    vi.mocked(getCoachToday).mockResolvedValueOnce({
      readiness: {
        score: 85,
        label: 'Zi de PR',
        color: 'var(--green)',
        volumeMultiplier: 1.1,
        canPR: true,
      },
      fatigue: null,
      plannedWorkout: null,
      isRestDay: true,
      patternsBanner: [],
      prWallRecent: [],
      alerts: [],
      restReason: null,
      source: 'engine',
    });
    renderAntrenor();
    const verdict = await screen.findByRole('status', { name: /Verdict readiness|Readiness verdict/i });
    expect(verdict).toHaveTextContent('85/100');
    const orb = screen.getByTestId('readiness-orb');
    // Real-score mode: not empty, no em-dash, no placeholder microcopy. (The orb
    // count-up digits tween 0→85 via rAF in a live browser; jsdom never flushes
    // rAF on the post-async value change, so we assert the orb is in score-mode
    // via data-empty + the absence of the "—" placeholder rather than digits.)
    expect(orb).toHaveAttribute('data-empty', 'false');
    expect(orb).toHaveAttribute('data-can-pr', 'true');
    expect(screen.getByTestId('readiness-orb-score')).not.toHaveTextContent('—');
    expect(screen.queryByTestId('readiness-empty-microcopy')).not.toBeInTheDocument();
  });

  it('shows poti incerca PR hint cand canPR=true', async () => {
    vi.mocked(getCoachToday).mockResolvedValueOnce({
      readiness: {
        score: 90,
        label: 'Zi de PR',
        color: 'var(--green)',
        volumeMultiplier: 1.1,
        canPR: true,
      },
      fatigue: null,
      plannedWorkout: null,
      isRestDay: true,
      patternsBanner: [],
      prWallRecent: [],
      alerts: [],
      restReason: null,
      source: 'engine',
    });
    renderAntrenor();
    // Wave E4 — suffix is locale-aware ("poti incerca PR" RO / "you can try a PR" EN).
    expect(await screen.findByText(/poti incerca PR|you can try a PR/i)).toBeInTheDocument();
  });
});

describe('Antrenor home — F11 PR banner', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('hides PR banner cand prHit=false', () => {
    renderAntrenor();
    expect(screen.queryByRole('status', { name: /PR detected/i })).not.toBeInTheDocument();
  });

  it('renders PR banner cand prHit=true', () => {
    useWorkoutStore.setState({ prHit: true });
    renderAntrenor();
    expect(screen.getByRole('status', { name: /PR detected/i })).toBeInTheDocument();
    expect(screen.getByText(/PR last session/i)).toBeInTheDocument();
  });
});

describe('Antrenor home — persona variant', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('persona-gigica CSS class applied default', () => {
    renderAntrenor();
    expect(screen.getByTestId('antrenor-home')).toHaveClass('persona-gigica');
  });

  it('persona-maria CSS class applied cand persona=maria', () => {
    useCoachStore.getState().setPersona('maria');
    renderAntrenor();
    expect(screen.getByTestId('antrenor-home')).toHaveClass('persona-maria');
  });

  it('persona-marius CSS class applied cand persona=marius', () => {
    useCoachStore.getState().setPersona('marius');
    renderAntrenor();
    expect(screen.getByTestId('antrenor-home')).toHaveClass('persona-marius');
  });
});

describe('Antrenor home — navigation', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('clicks CoachTodayCard Start session → navigates la /app/antrenor/energy-check — EN default', () => {
    // Post-D088 bottom "Incepe antrenament" dedup: CoachTodayCard's own button
    // is the workout-day entry. Single navigation contract — energy-check.
    // Wave C2 i18n: EN default → "Start session" (was RO "Incepe sesiunea").
    renderAntrenor();
    fireEvent.click(screen.getByRole('button', { name: /Start session/i }));
    expect(screen.getByText('EnergyCheckStub')).toBeInTheDocument();
  });
});

describe('Antrenor home — HIGH-CODE-07 defense-in-depth promise catch', () => {
  // HIGH-CODE-07 (code-review v2 chat 5 post-Wave 10): getCoachToday().then
  // chain lacked .catch — engine throw past wrapper would silently swallow
  // rejection (React unhandled rejection → console error + stale baseline).
  // Fix mirror WorkoutPreview Wave 11 fallback guard (f81e2716):
  // visible error banner role=alert + baseline fallback still renders.
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('renders error banner cand getCoachToday promise rejects', async () => {
    vi.mocked(getCoachToday).mockRejectedValueOnce(new Error('engine pipeline boom'));
    renderAntrenor();
    const banner = await screen.findByTestId('antrenor-error-banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveAttribute('role', 'alert');
    // Wave C2 i18n: EN default → "Couldn't load coach recommendations".
    expect(banner.textContent).toMatch(/Couldn't load coach recommendations/i);
  });

  it('fallback baseline content still renders pe promise reject (Gigel proceed)', async () => {
    vi.mocked(getCoachToday).mockRejectedValueOnce(new Error('engine pipeline boom'));
    renderAntrenor();
    await screen.findByTestId('antrenor-error-banner');
    // Heading "Coach" sub EN default (A3 i18n). Orphan "Incepe antrenament" CTA
    // a fost eliminat (A1 #12 dedup); CoachTodayCard fallback la coach=null
    // surface "Start session" sub EN default (Wave C2 i18n).
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Coach');
    expect(screen.getByRole('button', { name: /Start session/i })).toBeInTheDocument();
  });

  it('no error banner on happy path (engine resolves)', async () => {
    renderAntrenor();
    // Wait one microtask for default resolved mock to flush.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByTestId('antrenor-error-banner')).not.toBeInTheDocument();
  });
});

describe('Antrenor home — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('no diacritics in UI rendered text', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '5 ex', ts: Date.now() - 17 * 86400000 },
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 2',
        exIdx: 1,
        setIdx: 0,
        phase: 'logging',
        history: {},
        sessionStart: Date.now() - 18 * 60000,
      },
      prHit: true,
    });
    const { container } = renderAntrenor();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
