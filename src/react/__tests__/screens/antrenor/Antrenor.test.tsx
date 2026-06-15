// ══ ANTRENOR HOME TESTS — F2/F4/F6/F8/F10/F11 Parity Verify ══════════════
// Per task_04 spec §4 A.
// MemoryRouter jsdom paradigm per D020 (NU createBrowserRouter).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
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
  resolveSessionTitle: vi.fn((sessionType?: string | null) =>
    sessionType === 'PULL' ? 'Pull (spate si biceps)' : 'Your workout',
  ),
}));

import { Antrenor } from '../../../routes/screens/antrenor/Antrenor';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useCoachStore } from '../../../stores/coachStore';
import { useScheduleStore, type WeekDays } from '../../../stores/scheduleStore';
import { getCoachToday } from '../../../lib/coachDirectorAggregate';
import { getReadiness, getFatigue } from '../../../lib/engineWrappers';
import { saveReadiness } from '../../../../engine/readiness.js';

// Monday-first today index (JS Sun=0 → Mon=0..Sun=6) — matches Antrenor /
// Calendar7Day. The card swap is driven by the LIVE calendar (scheduleDays
// [todayIdx]), so tests that assert a specific card must set TODAY's slot
// deterministically regardless of the real weekday the suite runs on.
const TODAY_IDX = (new Date().getDay() + 6) % 7;

/** A 7-day schedule with TODAY forced to `kind` (the rest of the week 'rest'). */
function weekWithToday(kind: 'training' | 'rest'): WeekDays {
  const base: ('training' | 'rest')[] = ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'];
  base[TODAY_IDX] = kind;
  return base as unknown as WeekDays;
}

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
    sessionsHistory: [],
    streak: 0,
  });
  useCoachStore.setState({
    schedContext: 'workout',
    persona: 'gigica',
    reactivateDismissed: false,
  });
  // Default: TODAY is a training day so the base render shows CoachTodayCard
  // (the prior fixed ['training','rest',...] week was date-dependent once the
  // card swap began reading the live calendar). Tests asserting a rest day set
  // weekWithToday('rest') explicitly.
  useScheduleStore.setState({
    days: weekWithToday('training'),
    editMode: false,
  });
  localStorage.clear();
}

function renderAntrenor() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor']}>
      <Routes>
        <Route path="/app/antrenor" element={<Antrenor />} />
        <Route path="/app/antrenor/energy-check" element={<div>EnergyCheckStub</div>} />
        <Route path="/app/antrenor/time-budget" element={<div>TimeBudgetStub</div>} />
        <Route path="/app/antrenor/workout-preview" element={<div>WorkoutPreviewStub</div>} />
      </Routes>
    </MemoryRouter>
  );
}

// Pre-workout reframe (Option A 2026-06-07) — "done today" is a today-dated
// self-report in the engine readiness store (saveReadiness keys by tod()).
// Seed it directly so handleStart skips the re-route through energy-check.
function seedEnergyCheckToday(value = 3): void {
  saveReadiness(value);
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
    // Timer realism: the estimate renders as an honest +/-10 min band (52 → 42-62).
    expect(screen.getByText(/42-62 min/i)).toBeInTheDocument();
    // Wave C2: under EN default, "6 exercises" (was "6 exercitii").
    expect(screen.getByText(/6 exercises/i)).toBeInTheDocument();
  });

  it('§A002 live calendar rest day wins over schedContext fallback', async () => {
    // schedContext='workout' default, but the LIVE weekly calendar marks today
    // as rest → CoachRestCard wins (the calendar is the single control for
    // "training today", 2026-06-13; the store schedContext is only a defensive
    // fallback when the live schedule is unavailable).
    useScheduleStore.setState({ days: weekWithToday('rest') });
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

  it('renders CoachRestCard cand today is a calendar rest day — EN default', () => {
    useScheduleStore.setState({ days: weekWithToday('rest') });
    renderAntrenor();
    expect(screen.getByText(/Active recovery day/i)).toBeInTheDocument();
  });

  it('no longer renders the streak/fatigue strip (Daniel 2026-05-31 removal); readiness stays in the orb hero', () => {
    // Daniel verbatim "scoate ala de streak de acolo si de fatigue" — the compact
    // StatsGrid strip (streak + fatigue tiles) was removed from the Coach home.
    // Readiness remains promoted to the always-present ReadinessOrb hero.
    useWorkoutStore.setState({ streak: 12 });
    renderAntrenor();
    expect(screen.queryByTestId('stats-streak')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stats-fatigue')).not.toBeInTheDocument();
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
    // C1: qualitative label is primary; the raw NN/100 is no longer surfaced.
    expect(verdict).not.toHaveTextContent('85/100');
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

  // FIX 2 (Daniel audit 2026-06-05) — a RETURNING user whose readiness is merely
  // unknown today (no energy-check) must NOT see the "log your FIRST session"
  // copy. "Has trained before" derives from sessionsHistory, NOT lastSession
  // (which is null after deletes / certain flows).
  it('returning user (sessionsHistory entries, lastSession null) → NO "first session" readiness copy', async () => {
    useWorkoutStore.setState({
      lastSession: null,
      sessionsHistory: [{ title: 'Earlier', meta: '', ts: Date.now() - 86_400_000 }],
    });
    // Default mock readiness=null → the empty microcopy renders, but the
    // returning variant (not the first-session line).
    renderAntrenor();
    await new Promise((resolve) => setTimeout(resolve, 0));
    const micro = screen.getByTestId('readiness-empty-microcopy');
    expect(micro).toBeInTheDocument();
    expect(micro.textContent ?? '').not.toMatch(/first session/i);
    expect(micro.textContent ?? '').toMatch(/energy check/i);
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
    // C1: verdict widget shows the qualitative band, not raw NN/100. The raw
    // score still lives in the orb (readiness-orb-score), asserted below.
    expect(verdict).toHaveTextContent('Zi de PR');
    expect(verdict).not.toHaveTextContent('85/100');
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

  it('no energy-check today → Start routes to energy-check first (assess step)', () => {
    // Pre-workout reframe (Option A): with no self-report today, Start still
    // routes through energy-check — the deliberate "step 1: assess" precedes
    // the session. Post-D088 dedup: CoachTodayCard's own button is the entry.
    renderAntrenor();
    fireEvent.click(screen.getByRole('button', { name: /Start session/i }));
    expect(screen.getByText('EnergyCheckStub')).toBeInTheDocument();
  });

  it('no energy-check today → hub leads with the energy-check CTA (step 1: assess)', () => {
    // The hero surfaces a prominent "Check your energy today" action when the
    // self-report is unknown — the visible pre-workout step on the hub.
    renderAntrenor();
    const cta = screen.getByTestId('readiness-energy-check-cta');
    expect(cta).toBeInTheDocument();
    fireEvent.click(cta);
    expect(screen.getByText('EnergyCheckStub')).toBeInTheDocument();
  });

  it('energy-check DONE today → Start goes to the time-budget step (#69), not re-prompting energy', () => {
    // Readiness is already known → re-routing through energy-check would
    // double-prompt. #69: Start opens the "how much time today" step (→ preview),
    // never the energy-check again.
    seedEnergyCheckToday();
    renderAntrenor();
    fireEvent.click(screen.getByRole('button', { name: /Start session/i }));
    expect(screen.getByText('TimeBudgetStub')).toBeInTheDocument();
    expect(screen.queryByText('EnergyCheckStub')).not.toBeInTheDocument();
  });

  it('energy-check DONE today → the energy-check CTA is hidden on the hub', () => {
    seedEnergyCheckToday();
    renderAntrenor();
    expect(screen.queryByTestId('readiness-energy-check-cta')).not.toBeInTheDocument();
  });

  it('energy-check DONE today → tapping the readiness orb still re-opens the check (re-run)', () => {
    // "Done today" must NOT lock the user out of redoing the check — tapping the
    // orb re-opens energy-check on demand even when already recorded.
    seedEnergyCheckToday();
    renderAntrenor();
    fireEvent.click(screen.getByTestId('readiness-orb-rerun'));
    expect(screen.getByText('EnergyCheckStub')).toBeInTheDocument();
  });
});

describe('Antrenor home — rest-day override routes to calendar (2026-06-13)', () => {
  // CoachRestCard renders because TODAY is a calendar rest day (the live schedule
  // drives the card swap). The override link no longer force-starts a session; it
  // enables the weekly calendar edit mode + scrolls the calendar into view so the
  // user SELECTS today.
  beforeEach(() => {
    resetStores();
    // Today = rest in the live calendar → CoachRestCard surfaces.
    useScheduleStore.setState({ days: weekWithToday('rest') });
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
    // scrollIntoView is undefined in jsdom — stub so the handler runs cleanly.
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('light-session CTA still routes to a session start (active recovery preserved)', async () => {
    seedEnergyCheckToday();
    renderAntrenor();
    // Wait for the rest card to surface (async aggregate).
    const lightBtn = await screen.findByRole('button', { name: /Light mobility session/i });
    fireEvent.click(lightBtn);
    // Energy-check done → start goes to the time-budget step.
    expect(screen.getByText('TimeBudgetStub')).toBeInTheDocument();
  });

  it('override CTA enables schedule edit mode + does NOT navigate to a session start', async () => {
    seedEnergyCheckToday();
    renderAntrenor();
    const overrideBtn = await screen.findByRole('button', { name: /pick the day in the calendar/i });
    expect(useScheduleStore.getState().editMode).toBe(false);
    fireEvent.click(overrideBtn);
    // Edit mode now ON (calendar becomes tappable so the user selects today).
    expect(useScheduleStore.getState().editMode).toBe(true);
    // No force-start: neither energy-check nor time-budget route was entered.
    expect(screen.queryByText('EnergyCheckStub')).not.toBeInTheDocument();
    expect(screen.queryByText('TimeBudgetStub')).not.toBeInTheDocument();
  });

  it('override CTA scrolls the calendar anchor into view', async () => {
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;
    seedEnergyCheckToday();
    renderAntrenor();
    const overrideBtn = await screen.findByRole('button', { name: /pick the day in the calendar/i });
    fireEvent.click(overrideBtn);
    expect(scrollSpy).toHaveBeenCalled();
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

describe('Antrenor home — Smoke #6 schedule reactivity', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  // Repro: schedule has today as a training day → coach recommends "Start
  // session". The user edits the week and removes today's workout. The Coach
  // screen must drop the Start session card reactively (no tab switch). Pre-fix
  // the aggregate was fetched once on mount (useEffect []), so it stayed stale
  // until a remount. The fix re-runs getCoachToday when scheduleStore changes.
  it('removing today\'s workout drops the Start session card without a remount', async () => {
    // 1st aggregate fetch (mount): today IS a training day → workout card.
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
    // 2nd aggregate fetch (after schedule edit): today removed → rest day.
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
    // Start session CTA present while today is a training day.
    expect(await screen.findByRole('button', { name: /Start session/i })).toBeInTheDocument();

    // Edit the week: flip every day to rest (removes today's workout) + save.
    // This mutates the SAME scheduleStore the on-screen Calendar7Day editor
    // drives, with no navigation / remount of the Antrenor screen.
    act(() => {
      useScheduleStore.setState({
        days: ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'] as const satisfies WeekDays,
        editMode: false,
      });
    });

    // Reactive: Start session card gone, rest card surfaced — no tab switch.
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Start session/i })).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Active recovery day/i)).toBeInTheDocument();
    // Confirm the aggregate was re-derived (mount + post-edit).
    expect(vi.mocked(getCoachToday).mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  // REAL-TIME card swap (owner P0, 2026-06-13) — the card-swap decision is driven
  // by the LIVE weekly calendar (scheduleDays[todayIdx]), NOT only by the async
  // coach aggregate (which reads the COMMITTED override, stale until save). This is
  // the production bug: a bare edit-mode toggle (toggleDay) updates the live store
  // but NOT the committed override, so coach.isRestDay stayed unchanged and the
  // Start card did not swap until save/remount. Here the aggregate is PINNED to a
  // single stale value (isRestDay:false, the committed state) for the WHOLE test —
  // so a fix that relied on the aggregate would never swap. The toggle drives the
  // swap purely through the live store, BOTH directions, with no remount/no save.
  it('toggling today via the store swaps the card in real time BOTH directions (aggregate pinned stale)', async () => {
    // Pin the aggregate to the COMMITTED state for every fetch: today is a
    // training day with a real plan. A correct fix must NOT depend on this value
    // changing — the live calendar toggle is what flips the card.
    vi.mocked(getCoachToday).mockResolvedValue({
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

    // Start on a TRAINING today → CoachTodayCard + Start visible.
    useScheduleStore.setState({ days: weekWithToday('training'), editMode: false });
    renderAntrenor();
    expect(await screen.findByRole('button', { name: /Start session/i })).toBeInTheDocument();
    expect(screen.queryByText(/Active recovery day/i)).not.toBeInTheDocument();

    // Enter edit mode and toggle TODAY to rest via the store action (exactly what
    // tapping today in Calendar7Day does) — no save, no remount.
    act(() => {
      useScheduleStore.getState().setEditMode(true);
      useScheduleStore.getState().toggleDay(TODAY_IDX);
    });

    // Instant swap: Start gone, CoachRestCard surfaced.
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Start session/i })).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Active recovery day/i)).toBeInTheDocument();
    // Sanity: today really flipped to rest in the live store.
    expect(useScheduleStore.getState().days[TODAY_IDX]).toBe('rest');

    // Toggle TODAY back to training — CoachTodayCard + Start return instantly.
    act(() => {
      useScheduleStore.getState().toggleDay(TODAY_IDX);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start session/i })).toBeInTheDocument();
    });
    expect(screen.queryByText(/Active recovery day/i)).not.toBeInTheDocument();
    expect(useScheduleStore.getState().days[TODAY_IDX]).toBe('training');
  });
});
