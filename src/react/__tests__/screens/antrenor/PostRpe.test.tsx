// ══ POST-RPE TESTS — task_09 §A submit RPE pipeline ══════════════════════
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// Phase 6 task_02 Option C — mock async getTodayWorkout returns Phase 5
// fixture (title 'Push (piept si umeri)' + Bench Press exIdx 0 / Overhead
// Press exIdx 1 pentru exercises breakdown name lookup). Per DECISIONS.md
// §D027. Without mock, real pipeline emits 'Antrenament azi' default title.
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

vi.mock('../../../lib/engineWrappers', () => ({
  getTodayWorkout: vi.fn(async () => PHASE_5_FIXTURE),
}));

import { PostRpe } from '../../../routes/screens/antrenor/PostRpe';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { getTodayWorkout } from '../../../lib/engineWrappers';
import { toast } from '../../../lib/toast';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderPostRpe() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/post-rpe']}>
      <Routes>
        <Route path="/app/antrenor/post-rpe" element={<PostRpe />} />
        <Route path="/app/antrenor/post-summary" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

// Finish-early entry — FinishEarlyConfirm navigates to PostRpe carrying
// state.finishEarly:true. Reproduces the real path so the test proves the wire,
// not a hand-set flag.
function renderPostRpeFinishEarly() {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: '/app/antrenor/post-rpe', state: { finishEarly: true } },
      ]}
    >
      <Routes>
        <Route path="/app/antrenor/post-rpe" element={<PostRpe />} />
        <Route path="/app/antrenor/post-summary" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

// Pulse select-then-Save (2026-05-29): a rating tap only SELECTS; the finalize
// pipeline fires on Save. submit(name) reproduces a full user flow — pick the
// rating, then confirm with Save.
function submit(name: RegExp): void {
  fireEvent.click(screen.getByRole('button', { name }));
  fireEvent.click(screen.getByTestId('post-rpe-save'));
}

function seedSession(): void {
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'logging',
    prHit: false,
    history: {
      0: [
        { kg: 22.5, reps: 10, rating: 'potrivit' },
        { kg: 22.5, reps: 10, rating: 'potrivit' },
        { kg: 22.5, reps: 8, rating: 'greu' },
      ],
      1: [
        { kg: 17.5, reps: 8, rating: 'potrivit' },
        { kg: 17.5, reps: 8, rating: 'greu' },
      ],
    },
    sessionStart: Date.now() - 30 * 60000, // 30 min ago
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    streak: 5,
    // Fresh history per test — otherwise a prior test's finishSession leaves a
    // same-day entry that trips the double-workout-per-day confirm gate.
    sessionsHistory: [],
    deletedSessionTs: [],
  });
  localStorage.clear();
}

describe('PostRpe — render', () => {
  beforeEach(() => {
    seedSession();
  });

  it('renders heading "How was your session?" (EN default)', () => {
    renderPostRpe();
    expect(
      screen.getByRole('heading', { name: /How was your session/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders coach quote intro mockup verbatim (EN default)', () => {
    // §F-post-rpe-01 — coach quote Lora italic mockup verbatim
    // andura-clasic.html#L1596 (engine-transparent framing).
    renderPostRpe();
    expect(screen.getByTestId('post-rpe-intro')).toHaveTextContent(/calibrates tomorrow's session/i);
  });

  it('renders 3 rating options cu data-rating (EN default labels)', () => {
    renderPostRpe();
    expect(screen.getByRole('button', { name: /^Easy/i })).toHaveAttribute(
      'data-rating',
      'usoara'
    );
    expect(screen.getByRole('button', { name: /Just right/i })).toHaveAttribute(
      'data-rating',
      'normala'
    );
    expect(screen.getByRole('button', { name: /^Hard/i })).toHaveAttribute(
      'data-rating',
      'grea'
    );
  });

  it('renders descriptor copy per rating (EN default)', () => {
    renderPostRpe();
    expect(screen.getByText(/I had more in the tank/i)).toBeInTheDocument();
    expect(screen.getByText(/Solid, balanced/i)).toBeInTheDocument();
    expect(screen.getByText(/I pushed to the limit/i)).toBeInTheDocument();
  });

  it('renders footer gratitude mockup verbatim (EN default)', () => {
    // §F-post-rpe-04 — footer gratitude + explainer mockup verbatim
    // andura-clasic.html#L1624 (Andura Suflet recognition warmth).
    renderPostRpe();
    expect(screen.getByTestId('post-rpe-footer')).toHaveTextContent(
      /the only input we can't infer/i
    );
  });

  it('Save CTA lives in a sticky bottom footer (reachable without scrolling)', () => {
    renderPostRpe();
    const footer = screen.getByTestId('post-rpe-footer-actions');
    expect(footer).toBeInTheDocument();
    // Sticky-to-the-scroll-surface bottom so the primary Save stays in view
    // above the scrolling rating cards (no nav on in-session routes to overlap).
    expect(footer.className).toMatch(/\bsticky\b/);
    expect(footer.className).toMatch(/\bbottom-0\b/);
    // The primary Save button is rendered INSIDE the sticky footer container.
    expect(footer.querySelector('[data-testid="post-rpe-save"]')).not.toBeNull();
  });
});

describe('PostRpe — submit pipeline', () => {
  beforeEach(() => {
    seedSession();
  });

  // Phase 6 task_02 Option C: handleSubmit async (awaits getTodayWorkout).
  // setLastRating runs sync pre-await; other state updates (finishSession +
  // incrementStreak + navigate) post-await. Use waitFor pentru post-await
  // assertions. Per DECISIONS.md §D027.

  it('Usoara select + Save → setLastRating="usoara"', () => {
    renderPostRpe();
    submit(/Easy/i);
    expect(useWorkoutStore.getState().lastRating).toBe('usoara');
  });

  it('Normala select + Save → setLastRating="normala"', () => {
    renderPostRpe();
    submit(/Just right/i);
    expect(useWorkoutStore.getState().lastRating).toBe('normala');
  });

  it('Grea select + Save → setLastRating="grea"', () => {
    renderPostRpe();
    submit(/^Hard/i);
    expect(useWorkoutStore.getState().lastRating).toBe('grea');
  });

  // Select-then-Save guard: a rating tap alone does NOT finalize the session
  // (only Save fires the pipeline). Click the rating WITHOUT pressing Save.
  it('selecting a rating does NOT submit until Save is pressed', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Just right/i }));
    // Nothing finalized yet — lastRating still null, history intact.
    expect(useWorkoutStore.getState().lastRating).toBeNull();
    expect(Object.keys(useWorkoutStore.getState().history).length).toBeGreaterThan(0);
  });

  it('submit clears history via finishSession', async () => {
    renderPostRpe();
    expect(Object.keys(useWorkoutStore.getState().history).length).toBeGreaterThan(0);
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().history).toEqual({});
    });
  });

  it('submit increments streak (5 → 6)', async () => {
    // U-05 — day-boundary streak: streak creste DOAR daca ultima zi = ieri
    // (consecutiva). Seed lastStreakDate = ieri ca submit-ul de azi sa fie +1.
    const yesterdayIso = new Date(Date.now() - 86_400_000).toLocaleDateString('sv');
    useWorkoutStore.setState({ streak: 5, lastStreakDate: yesterdayIso });
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().streak).toBe(6);
    });
  });

  // U-05 (HIGH) — 2 sesiuni in aceeasi zi NU dubleaza streak (no-op same day).
  it('submit aceeasi zi = streak no-op (NU dubleaza)', async () => {
    const todayIso = new Date().toLocaleDateString('sv');
    useWorkoutStore.setState({ streak: 5, lastStreakDate: todayIso });
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession).not.toBeNull();
    });
    expect(useWorkoutStore.getState().streak).toBe(5);
  });

  // [15.022] In-flight submit latch — handleSubmit is async (awaits
  // getTodayWorkout). A fast double-tap on Save must NOT run the finalize
  // pipeline twice (else: duplicate sessionsHistory entry + double streak).
  it('double-tap Save increments streak only ONCE (in-flight latch)', async () => {
    const yesterdayIso = new Date(Date.now() - 86_400_000).toLocaleDateString('sv');
    useWorkoutStore.setState({ streak: 5, lastStreakDate: yesterdayIso });
    renderPostRpe();
    // Pick a feel, then hammer Save twice before the async pipeline resolves.
    fireEvent.click(screen.getByRole('button', { name: /Just right/i }));
    const save = screen.getByTestId('post-rpe-save');
    fireEvent.click(save);
    fireEvent.click(save);
    await waitFor(() => {
      expect(useWorkoutStore.getState().streak).toBe(6);
    });
    // Settle any second-tap microtask; streak must remain 6 (not 7).
    await Promise.resolve();
    expect(useWorkoutStore.getState().streak).toBe(6);
  });

  it('double-tap Save runs the finalize pipeline ONCE (getTodayWorkout called 1x)', async () => {
    vi.mocked(getTodayWorkout).mockClear();
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Just right/i }));
    const save = screen.getByTestId('post-rpe-save');
    fireEvent.click(save);
    fireEvent.click(save);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession).not.toBeNull();
    });
    await Promise.resolve();
    // The async pipeline (which awaits getTodayWorkout) ran exactly once — the
    // second tap was dropped by the in-flight latch. Without the latch the
    // second tap would re-enter before navigate and call it twice.
    expect(vi.mocked(getTodayWorkout)).toHaveBeenCalledTimes(1);
  });

  it('submit sets lastSession cu title + meta + ts', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession).not.toBeNull();
    });
    const ls = useWorkoutStore.getState().lastSession;
    expect(ls?.title).toBe('Push (piept si umeri)');
    // EN default — sets phrase surfaces as "5 sets"; RO opt-in branch tested elsewhere.
    expect(ls?.meta).toMatch(/5 sets/);
    expect(ls?.meta).toMatch(/min/);
    expect(ls?.meta).toMatch(/kg/);
    expect(typeof ls?.ts).toBe('number');
  });

  it('summary meta volume computed correctly (3*22.5*10 + 22.5*8 + 17.5*8 + 17.5*8 = 1135)', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      const meta = useWorkoutStore.getState().lastSession?.meta ?? '';
      expect(meta).toMatch(/910 kg/);
    });
  });

  it('summary meta duration ~30 min', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      const meta = useWorkoutStore.getState().lastSession?.meta ?? '';
      expect(meta).toMatch(/30 min/);
    });
  });

  it('finishSession payload populates numeric sets field (task_10 §D)', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession?.sets).toBe(5);
    });
  });

  it('finishSession payload populates numeric durationMin field', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession?.durationMin).toBe(30);
    });
  });

  // Regression (Daniel audit): a real 12-set session showed "0 min" in History
  // because sessionStart was null (start lost on an older lifecycle path) and
  // duration fell to a bogus 0. With sessionStart null, the real elapsed must be
  // recovered from the earliest logged set timestamp — never 0 for a logged
  // session.
  it('durationMin recovers from earliest set timestamp when sessionStart is null', async () => {
    const start = Date.now() - 25 * 60000; // earliest set ~25 min ago
    useWorkoutStore.setState({
      exIdx: 0,
      setIdx: 0,
      phase: 'logging',
      prHit: false,
      history: {
        0: [
          { kg: 100, reps: 5, rating: 'potrivit', timestamp: start },
          { kg: 100, reps: 5, rating: 'potrivit', timestamp: start + 5 * 60000 },
          { kg: 100, reps: 5, rating: 'greu', timestamp: start + 10 * 60000 },
        ],
      },
      sessionStart: null, // start lost — the bug condition
      lastRating: null,
      pausedSnapshot: null,
      lastSession: null,
      streak: 5,
      sessionsHistory: [],
      deletedSessionTs: [],
    });
    localStorage.clear();
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession?.durationMin).toBe(25);
    });
  });

  it('finishSession payload populates numeric volumeKg field', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession?.volumeKg).toBe(910);
    });
  });

  it('task_03: finishSession payload populates exercises breakdown', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession?.exercises?.length).toBe(2);
    });
  });

  it('task_03: exercises breakdown computes totalVolume per exercise', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      const exercises = useWorkoutStore.getState().lastSession?.exercises;
      // exIdx 0: 22.5*10 + 22.5*10 + 22.5*8 = 450 + 180 = 630
      expect(exercises?.[0]!.totalVolume).toBe(630);
      // exIdx 1: 17.5*8 + 17.5*8 = 280
      expect(exercises?.[1]!.totalVolume).toBe(280);
    });
  });

  it('task_03: peakOneRM uses Epley max across sets', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      const exercises = useWorkoutStore.getState().lastSession?.exercises;
      // Bench Press peak: 22.5kg × 10 reps = 22.5 * (1+10/30) = 30 kg 1RM
      expect(exercises?.[0]!.peakOneRM).toBe(30);
    });
  });

  it('navigates la /app/antrenor/post-summary after submit', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute(
        'data-pathname',
        '/app/antrenor/post-summary'
      );
    });
  });

  it('phase resets la idle (via finishSession)', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().phase).toBe('idle');
    });
    expect(useWorkoutStore.getState().sessionStart).toBeNull();
  });
});

// H2 audit fix (midnight data loss) + HIGH-CODE-06 truth preserved.
//
// HIGH-CODE-06 (original) rejected the ENTIRE save when getTodayWorkout()
// returned null, to avoid persisting the fabricated 'Push (piept si umeri)'
// muscle-group title. But re-deriving the plan at finish is exactly the H2 bug:
// when the day rolls over into a rest day (or pipeline halt) the plan is null
// and the COMPLETED session the user logged was silently dropped — data loss.
//
// Corrected behavior: a session WITH logged sets is ALWAYS saved, even when the
// plan is null — under the honest neutral title 'Antrenament' (NOT the old
// muscle-group lie). Exercise names degrade to the honest 'Exercitiu N'
// fallback. Only a session with ZERO logged sets is rejected (nothing to save).
describe('PostRpe — H2 midnight data loss + HIGH-CODE-06 truth', () => {
  beforeEach(() => {
    seedSession();
    // Reset sessionsHistory (NU touched de seedSession, persisted via zustand)
    // pentru assertion clean baseline pe test cu mock null.
    useWorkoutStore.setState({ sessionsHistory: [] });
    toast.clear();
    // Reset to default Phase 5 fixture so other describe blocks unaffected.
    vi.mocked(getTodayWorkout).mockResolvedValue(PHASE_5_FIXTURE);
  });

  it('SAVES the logged session even when getTodayWorkout returns null (H2 — no data loss)', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(null);
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession).not.toBeNull();
    });
    const ls = useWorkoutStore.getState().lastSession!;
    // The real logged work is preserved (5 sets across 2 exercises, 910 kg).
    expect(ls.sets).toBe(5);
    expect(ls.volumeKg).toBe(910);
    expect(ls.exercises?.length).toBe(2);
    // Persisted to the cumulative history too (Istoric tab).
    expect(useWorkoutStore.getState().sessionsHistory.length).toBe(1);
  });

  it('uses honest neutral fallback title — never the fabricated muscle-group lie (EN default "Workout")', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(null);
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession).not.toBeNull();
    });
    // Locale-aware fallback: EN default surfaces "Workout"; RO opt-in branch
    // would persist "Antrenament" via the same key.
    expect(useWorkoutStore.getState().lastSession!.title).toBe('Workout');
    // Critical HIGH-CODE-06 invariant preserved: NO muscle-group lie persisted.
    const titles = useWorkoutStore.getState().sessionsHistory.map((s) => s.title);
    expect(titles).not.toContain('Push (piept si umeri)');
  });

  it('degrades exercise names to honest "Exercise N" when plan is null (EN default, no fabrication)', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(null);
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession).not.toBeNull();
    });
    const ex = useWorkoutStore.getState().lastSession!.exercises ?? [];
    expect(ex[0]?.exerciseName).toBe('Exercise 1');
    expect(ex[1]?.exerciseName).toBe('Exercise 2');
  });

  it('navigates to post-summary after saving a null-plan session', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(null);
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute(
        'data-pathname',
        '/app/antrenor/post-summary'
      );
    });
  });

  it('REJECTS only an empty session (zero sets logged) — toast + back, no save', async () => {
    // Empty in-memory history → nothing to save (legitimate empty case).
    useWorkoutStore.setState({ history: {} });
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(PHASE_5_FIXTURE);
    render(
      <MemoryRouter initialEntries={['/app/antrenor/post-rpe']}>
        <Routes>
          <Route path="/app/antrenor/post-rpe" element={<PostRpe />} />
          <Route path="/app/antrenor/post-summary" element={<LocationProbe />} />
          <Route path="/app/antrenor" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    );
    submit(/Just right/i);
    await waitFor(() => {
      const items = toast.getSnapshot();
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]!.variant).toBe('error');
    });
    expect(useWorkoutStore.getState().lastSession).toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
  });
});

describe('PostRpe — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  beforeEach(() => {
    seedSession();
  });

  it('no diacritics in UI rendered text', () => {
    const { container } = renderPostRpe();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});

describe('PostRpe — energy signal persistence (GAP #2: energyEmoji + energy)', () => {
  beforeEach(() => {
    seedSession();
  });

  it('persists energyEmoji+energy=red on the finished session for a minus intensityMod', async () => {
    useWorkoutStore.setState({
      sessionContext: { intensityMod: 'minus', painContext: null },
    });
    renderPostRpe();
    submit(/^Hard/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession).not.toBeNull();
    });
    const saved = useWorkoutStore.getState().lastSession!;
    expect(saved.energyEmoji).toBe('red');
    expect(saved.energy).toBe('red');
  });

  it('persists energyEmoji+energy=green for a plus intensityMod', async () => {
    useWorkoutStore.setState({
      sessionContext: { intensityMod: 'plus', painContext: null },
    });
    renderPostRpe();
    submit(/Easy/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession).not.toBeNull();
    });
    const saved = useWorkoutStore.getState().lastSession!;
    expect(saved.energyEmoji).toBe('green');
    expect(saved.energy).toBe('green');
  });

  it('omits energy fields when no energy-check (sessionContext null, direct Antrenor entry)', async () => {
    useWorkoutStore.setState({ sessionContext: null });
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession).not.toBeNull();
    });
    const saved = useWorkoutStore.getState().lastSession!;
    // NU fabricate green when absent — engines see no-signal baseline.
    expect('energyEmoji' in saved).toBe(false);
    expect('energy' in saved).toBe(false);
  });
});

describe('PostRpe — double-workout-per-day confirm', () => {
  beforeEach(() => {
    seedSession();
  });

  it('asks before saving a SECOND workout the same day, then saves on confirm', async () => {
    // A workout already logged today (same calendar day as now).
    useWorkoutStore.setState({
      sessionsHistory: [{ title: 'Earlier', meta: '', ts: Date.now() - 60000 }],
    });
    renderPostRpe();
    submit(/Just right/i);
    // Confirm panel appears; the new session is NOT saved yet.
    await waitFor(() => {
      expect(screen.getByTestId('post-rpe-already-logged')).toBeInTheDocument();
    });
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(1);
    // Confirm "log another" → the second session is saved.
    fireEvent.click(screen.getByTestId('post-rpe-already-logged-yes'));
    await waitFor(() => {
      expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(2);
    });
  });

  it('the first workout of the day saves without a confirm', async () => {
    renderPostRpe(); // seedSession set sessionsHistory: []
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession).not.toBeNull();
    });
    expect(screen.queryByTestId('post-rpe-already-logged')).not.toBeInTheDocument();
  });
});

// FIX 1 (Daniel audit 2026-06-05) — finish-early must land the partial session
// in sessionsHistory + bump the streak, parity with the normal Done path. The
// bug: a session already logged today tripped the "log another?" gate which
// bailed BEFORE finishSession, silently dropping the partial finish-early.
// FinishEarlyConfirm now passes state.finishEarly:true so PostRpe skips that
// redundant re-confirm (the user already confirmed the early finish).
describe('PostRpe — finish-early parity (FIX 1)', () => {
  beforeEach(() => {
    seedSession();
    // Single set logged — a genuine early finish (1 set then "finish early").
    useWorkoutStore.setState({
      history: { 0: [{ kg: 22.5, reps: 10, rating: 'potrivit' }] },
      sessionsHistory: [],
    });
  });

  it('finish-early appends the partial to sessionsHistory + increments streak', async () => {
    const yesterdayIso = new Date(Date.now() - 86_400_000).toLocaleDateString('sv');
    useWorkoutStore.setState({ streak: 5, lastStreakDate: yesterdayIso });
    renderPostRpeFinishEarly();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession).not.toBeNull();
    });
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(1);
    expect(useWorkoutStore.getState().streak).toBe(6);
  });

  it('finish-early after a session ALREADY logged today still saves (no silent drop)', async () => {
    // The exact audit scenario: a returning user already has a session today,
    // then cuts a second session short via finish-early. Old behavior bailed at
    // the "log another?" gate; the partial was lost.
    useWorkoutStore.setState({
      sessionsHistory: [{ title: 'Earlier', meta: '', ts: Date.now() - 3_600_000 }],
    });
    renderPostRpeFinishEarly();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(2);
    });
    // No redundant confirm panel on the finish-early path.
    expect(screen.queryByTestId('post-rpe-already-logged')).not.toBeInTheDocument();
  });

  it('a second same-day finish-early does NOT double-count the streak day', async () => {
    // First finish-early today bumps the streak to 6 and stamps today.
    const todayIso = new Date().toLocaleDateString('sv');
    useWorkoutStore.setState({ streak: 6, lastStreakDate: todayIso });
    renderPostRpeFinishEarly();
    submit(/Just right/i);
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession).not.toBeNull();
    });
    // The session lands (history grows) but the streak holds (same-day no-op).
    expect(useWorkoutStore.getState().streak).toBe(6);
  });
});
