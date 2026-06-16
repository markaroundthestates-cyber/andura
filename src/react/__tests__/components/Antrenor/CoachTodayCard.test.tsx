// ══ COACH TODAY CARD TESTS — MED-CODE-20 useMemo deps fresh refresh ════════
// MED-FIX chat5 (2026-05-23) sibling to MED-CODE-20 useMemo dep fix.
//
// Locks in: coachQuote useMemo re-runs cand sessionsHistory schimba (user
// finishes workout mid-day) sau todayDate rollover (next day boundary).
// Prior `[]` empty deps locked engine result la mount → user trains la
// 09:00, returns 14:00 post-workout → recovery state changed dar quote
// stayed stale.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CoachTodayCard } from '../../../components/Antrenor/CoachTodayCard';
import { useWorkoutStore } from '../../../stores/workoutStore';
import * as engineWrappers from '../../../lib/engineWrappers';
import type {
  PlannedWorkoutOutput,
  CoachAdaptation,
  DecisionTraceEntry,
} from '../../../lib/engineWrappers';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

function renderCard(onStart: () => void = () => {}) {
  return render(
    <MemoryRouter>
      <CoachTodayCard onStart={onStart} workout={null} />
    </MemoryRouter>,
  );
}

// Minimal PlannedWorkoutOutput carrying a coachAdaptations log (only the fields
// the card reads matter; the rest take defaults via the card's ?? fallbacks).
function workoutWith(coachAdaptations: CoachAdaptation[]): PlannedWorkoutOutput {
  return {
    workoutTitle: '__engine_workout_title_fallback__',
    sessionType: 'PUSH',
    exerciseCount: 5,
    estimatedDuration: 48,
    intensityMod: 'normal',
    exercises: [],
    volumeKg: 0,
    coachAdaptations,
  };
}

function renderCardWithWorkout(
  coachAdaptations: CoachAdaptation[],
  onStart: () => void = () => {},
) {
  return render(
    <MemoryRouter>
      <CoachTodayCard onStart={onStart} workout={workoutWith(coachAdaptations)} />
    </MemoryRouter>,
  );
}

// A logged-today session fixture (ts = now → todTs matches today's local key).
function todaySessionFixture(ts: number = Date.now()) {
  return {
    title: 'Push',
    meta: '5 seturi · 52 min · 12 450 kg',
    ts,
    exercises: [],
  };
}

describe('CoachTodayCard — MED-CODE-20 coachQuote refresh deps', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useWorkoutStore.setState({ sessionsHistory: [] });
  });

  it('renders generic fallback cand sessionsHistory=[] (T0 fresh)', () => {
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue(null);
    renderCard();
    const quote = screen.getByTestId('coach-today-quote');
    // Generic fallback — non-claim, NU hardcoded muscle-group line.
    expect(quote.textContent).not.toMatch(/Pectoralii recupereaza/i);
    expect(quote.textContent).toBeTruthy();
  });

  it('renders engine-driven recovered group cand getCoachTodayQuote returns data — EN default', () => {
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue({
      recoveredLabel: 'Pectoralii',
      daysSince: 3,
      elapsedHours: 72, // >=24h => day bucket rendering ("3 days")
    });
    renderCard();
    // Wave C2 i18n: EN default → "{group} has recovered since 3 days — let's nail it."
    expect(
      screen.getByText(/Pectoralii has recovered since 3 days/i),
    ).toBeInTheDocument();
  });

  it('renders an HOUR-accurate "{when}" for a sub-day gap (13h, not "yesterday")', () => {
    // A recovered group last trained ~13h ago (e.g. light session 18:00 -> 07:00):
    // daysSince floors to 0, but elapsedHours=13 must surface as "13h ago", NOT
    // the misleading "yesterday"/day-bucket copy.
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue({
      recoveredLabel: 'Pectoralii',
      daysSince: 0,
      elapsedHours: 13,
    });
    renderCard();
    expect(
      screen.getByText(/Pectoralii has recovered since 13h ago/i),
    ).toBeInTheDocument();
  });

  it('MED-CODE-20: coachQuote re-runs cand sessionsHistory schimba', () => {
    const spy = vi
      .spyOn(engineWrappers, 'getCoachTodayQuote')
      .mockReturnValue(null);
    renderCard();
    // Initial render = 1 engine call (sessionsHistory=[] at mount).
    const initialCalls = spy.mock.calls.length;
    expect(initialCalls).toBeGreaterThanOrEqual(1);

    // Simulate user finishing workout mid-day → sessionsHistory append.
    // Bug pre-fix: useMemo([]) locked result, ZERO re-run. Post-fix: deps
    // include sessionsHistory → recompute triggers.
    act(() => {
      useWorkoutStore.setState({
        sessionsHistory: [
          {
            title: 'Push',
            meta: '5 seturi · 52 min · 12 450 kg',
            ts: Date.now(),
            exercises: [
              {
                exerciseId: 'bench-press',
                exerciseName: 'Bench Press',
                sets: [
                  {
                    kg: 100,
                    reps: 5,
                    rating: 'potrivit',
                    timestamp: Date.now(),
                  },
                ],
                totalVolume: 500,
                peakOneRM: 116.7,
              },
            ],
          },
        ],
      });
    });

    // Post-fix: at least 1 additional engine call after sessionsHistory append.
    expect(spy.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  it('MED-CODE-20: quote text updates dupa sessionsHistory change', () => {
    // Mock returns sequentially: first null (T0), then recovered group.
    const spy = vi
      .spyOn(engineWrappers, 'getCoachTodayQuote')
      .mockReturnValueOnce(null)
      .mockReturnValue({ recoveredLabel: 'Spatele', daysSince: 2, elapsedHours: 48 });

    renderCard();
    // Initial: fallback generic, NO "Spatele recovered".
    expect(screen.queryByText(/Spatele has recovered/i)).not.toBeInTheDocument();

    // Trigger sessionsHistory change → useMemo re-runs → engine returns
    // dynamic group → render text updates.
    act(() => {
      useWorkoutStore.setState({
        sessionsHistory: [
          {
            title: 'Pull',
            meta: '5 seturi · 48 min · 10 200 kg',
            ts: Date.now(),
            exercises: [],
          },
        ],
      });
    });

    // Wave C2 i18n: EN default → "Spatele has recovered since 2 days".
    expect(
      screen.getByText(/Spatele has recovered since 2 days/i),
    ).toBeInTheDocument();
    // Verify spy called at least twice (mount + post-setState).
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});

// Coach Voice — the daily "why" line renders ABOVE the Start CTA when the
// adaptive brain adapted today's plan, and is HIDDEN entirely when nothing
// adapted (graceful, no filler). The line text is composed from the engine's
// coachAdaptations log carried by the workout prop.
describe('CoachTodayCard — Coach Voice daily why line', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue(null);
    vi.spyOn(engineWrappers, 'getLaggingSignal').mockReturnValue(null);
    useWorkoutStore.setState({ sessionsHistory: [] });
  });

  it('renders the why line when an adaptation happened today', () => {
    renderCardWithWorkout([
      { kind: 'recovery-cut', group: 'piept', cause: 'resistance' },
    ]);
    const line = screen.getByTestId('coach-why-line');
    expect(line).toBeInTheDocument();
    // EN default — the composed sentence names the group + its reason.
    expect(line.textContent).toMatch(/chest/i);
    expect(line.textContent).toMatch(/recovering/i);
  });

  it('renders NOTHING when no adaptation happened (empty log)', () => {
    renderCardWithWorkout([]);
    expect(screen.queryByTestId('coach-why-line')).not.toBeInTheDocument();
  });

  it('renders NOTHING when the workout prop is null (cold start / loading)', () => {
    renderCard();
    expect(screen.queryByTestId('coach-why-line')).not.toBeInTheDocument();
  });

  it('the why line sits ABOVE the Start CTA in DOM order', () => {
    const { container } = renderCardWithWorkout([{ kind: 'deload' }]);
    const line = screen.getByTestId('coach-why-line');
    const cta = screen.getByText('Start session');
    // compareDocumentPosition: FOLLOWING (4) means cta comes after the line.
    expect(line.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    void container;
  });
});

// Calibration honesty — the "still learning you" line. Renders an HONEST
// "still calibrating" indicator while the model is immature (early tier), and
// is HIDDEN once the model is dialed in (the engine returns null at
// PERSONALIZED+). Truth-only: a real "sessions remaining" count is shown when
// the engine exposes one; otherwise the copy carries no number.
describe('CoachTodayCard — calibration honesty line', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue(null);
    vi.spyOn(engineWrappers, 'getLaggingSignal').mockReturnValue(null);
    useWorkoutStore.setState({ sessionsHistory: [] });
  });

  it('renders an encouraging calibration line (no scary countdown) while the model is immature', () => {
    vi.spyOn(engineWrappers, 'getCalibrationMaturity').mockReturnValue({
      tierId: 0,
      tierName: 'cold_start',
      sessionsCount: 0,
      sessionsToNext: 3,
    });
    renderCard();
    const line = screen.getByTestId('coach-calibration-line');
    expect(line).toBeInTheDocument();
    // Founder 2026-06-12: the old "about N more sessions to dial this in" scared
    // new users (N can be ~26). Reframed warm + forward — never a daunting count.
    expect(line.textContent).toMatch(/Already adapting to you/i);
    expect(line.textContent).not.toMatch(/\d+ more sessions/i);
  });

  it('phrases WITHOUT a number when the engine exposes no count (no fabrication)', () => {
    vi.spyOn(engineWrappers, 'getCalibrationMaturity').mockReturnValue({
      tierId: 1,
      tierName: 'initial',
      sessionsCount: 5,
      sessionsToNext: null,
    });
    renderCard();
    const line = screen.getByTestId('coach-calibration-line');
    expect(line.textContent).toMatch(/Getting to know you/i);
    // No fabricated session count when none is available.
    expect(line.textContent).not.toMatch(/\d+ more sessions/i);
  });

  it('renders NOTHING once the model is dialed in (engine returns null)', () => {
    vi.spyOn(engineWrappers, 'getCalibrationMaturity').mockReturnValue(null);
    renderCard();
    expect(screen.queryByTestId('coach-calibration-line')).not.toBeInTheDocument();
  });

  it('cold start (empty history) does not crash and shows an honest early-state line', () => {
    // No mock — exercise the REAL engine wrapper with zero sessions (cold start).
    renderCard();
    const line = screen.getByTestId('coach-calibration-line');
    expect(line).toBeInTheDocument();
    expect(line.textContent).toBeTruthy();
  });
});

// No-shame return — the warm "welcome back, the week rebalanced around the
// miss" line. Renders when the engine reports a same-week return-after-miss, and
// is HIDDEN entirely when there is no miss / the user hasn't returned this week
// (engine returns null). Communication of the rebalance the brain already did.
describe('CoachTodayCard — no-shame return line', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue(null);
    vi.spyOn(engineWrappers, 'getLaggingSignal').mockReturnValue(null);
    vi.spyOn(engineWrappers, 'getCalibrationMaturity').mockReturnValue(null);
    useWorkoutStore.setState({ sessionsHistory: [] });
  });

  it('renders the welcome-back line when the user returned after a same-week miss', () => {
    vi.spyOn(engineWrappers, 'getReturnAfterMissSignal').mockReturnValue({ missedDays: 2 });
    renderCard();
    const line = screen.getByTestId('coach-return-line');
    expect(line).toBeInTheDocument();
    // EN default — warm, no-guilt, confirms the week rebalanced.
    expect(line.textContent).toMatch(/Welcome back/i);
    expect(line.textContent).toMatch(/rebalanced/i);
  });

  it('uses the singular copy for exactly one missed day', () => {
    vi.spyOn(engineWrappers, 'getReturnAfterMissSignal').mockReturnValue({ missedDays: 1 });
    renderCard();
    const line = screen.getByTestId('coach-return-line');
    expect(line.textContent).toMatch(/missed session\b/i);
    expect(line.textContent).not.toMatch(/\d+ missed sessions/i);
  });

  it('renders NOTHING when there is no miss (engine returns null)', () => {
    vi.spyOn(engineWrappers, 'getReturnAfterMissSignal').mockReturnValue(null);
    renderCard();
    expect(screen.queryByTestId('coach-return-line')).not.toBeInTheDocument();
  });

  it('cold start (no return) → no line, no crash (real engine, empty history)', () => {
    // No mock — exercise the REAL wrapper with zero sessions (cold start → null).
    renderCard();
    expect(screen.queryByTestId('coach-return-line')).not.toBeInTheDocument();
  });
});

// Intra-week make-up note — the supportive, forward-looking line that makes the
// engine's intra-week deficit recovery visible (not silent). Renders ONLY when
// weekMakeup.added has a positive group; names the group(s) in a NO-BLAME line;
// hidden entirely when weekMakeup is empty/absent. Pure derivation from the prop.
describe('CoachTodayCard — intra-week make-up note', () => {
  type WeekMakeup = NonNullable<PlannedWorkoutOutput['weekMakeup']>;

  // The make-up note is now plan-gated (LLM-judge Pattern B): it only names a
  // group TODAY's plan actually trains. Default the plan to one that trains
  // chest + shoulders + back so the EXISTING note-shows assertions (which name
  // those groups) remain valid; the suppression case is covered separately below.
  const PLAN_CHEST_SHOULDERS_BACK: PlannedWorkoutOutput['exercises'] = [
    { id: 'a', name: 'Flat DB Press', engineName: 'Flat DB Press', sets: 4, targetReps: 8, targetKg: 30, restSec: 90 },
    { id: 'b', name: 'DB Shoulder Press', engineName: 'DB Shoulder Press', sets: 3, targetReps: 8, targetKg: 20, restSec: 90 },
    { id: 'c', name: 'Cable Row', engineName: 'Cable Row', sets: 4, targetReps: 10, targetKg: 60, restSec: 90 },
  ];

  function renderCardWithMakeup(
    weekMakeup: WeekMakeup | undefined,
    onStart: () => void = () => {},
    exercises: PlannedWorkoutOutput['exercises'] = PLAN_CHEST_SHOULDERS_BACK,
  ) {
    const workout: PlannedWorkoutOutput = {
      workoutTitle: '__engine_workout_title_fallback__',
      sessionType: 'PUSH',
      exerciseCount: 5,
      estimatedDuration: 48,
      intensityMod: 'normal',
      exercises,
      volumeKg: 0,
      coachAdaptations: [],
      ...(weekMakeup ? { weekMakeup } : {}),
    };
    return render(
      <MemoryRouter>
        <CoachTodayCard onStart={onStart} workout={workout} />
      </MemoryRouter>,
    );
  }

  // Blame words that must NEVER appear in the supportive copy (RO no-diacritics).
  const BLAME = /ratat|sarit|in urma/i;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue(null);
    vi.spyOn(engineWrappers, 'getLaggingSignal').mockReturnValue(null);
    vi.spyOn(engineWrappers, 'getCalibrationMaturity').mockReturnValue(null);
    vi.spyOn(engineWrappers, 'getReturnAfterMissSignal').mockReturnValue(null);
    useWorkoutStore.setState({ sessionsHistory: [] });
    // The note copy is RO-first (Daniel's locked tone) — force RO so the
    // assertions read the real shipped strings ("piept", no blame words).
    _resetI18nCache();
    setLocale('ro');
  });

  afterEach(() => {
    setLocale('en');
    _resetI18nCache();
  });

  it('renders the note naming "piept" when one group was added, with NO blame words', () => {
    renderCardWithMakeup({ added: { chest: 2 }, behind: {} });
    const note = screen.getByTestId('coach-week-makeup-note');
    expect(note).toBeInTheDocument();
    expect(note.textContent).toMatch(/piept/);
    // Forward/supportive framing — never blame the user.
    expect(note.textContent).not.toMatch(BLAME);
  });

  it('reads two added groups naturally with "si"', () => {
    renderCardWithMakeup({ added: { chest: 2, shoulders: 1 }, behind: {} });
    const note = screen.getByTestId('coach-week-makeup-note');
    expect(note.textContent).toMatch(/piept si umeri/);
    expect(note.textContent).not.toMatch(BLAME);
  });

  it('summarizes 3+ added groups generically (cateva grupe)', () => {
    renderCardWithMakeup({
      added: { chest: 2, shoulders: 1, back: 3 },
      behind: {},
    });
    const note = screen.getByTestId('coach-week-makeup-note');
    expect(note.textContent).toMatch(/cateva grupe/);
    expect(note.textContent).not.toMatch(/piept/);
    expect(note.textContent).not.toMatch(BLAME);
  });

  it('renders NOTHING when weekMakeup is empty (both maps empty)', () => {
    renderCardWithMakeup({ added: {}, behind: {} });
    expect(screen.queryByTestId('coach-week-makeup-note')).not.toBeInTheDocument();
  });

  it('renders NOTHING when weekMakeup is absent on the plan', () => {
    renderCardWithMakeup(undefined);
    expect(screen.queryByTestId('coach-week-makeup-note')).not.toBeInTheDocument();
  });

  it('renders NOTHING when only non-positive added values are present', () => {
    renderCardWithMakeup({ added: { chest: 0 }, behind: {} });
    expect(screen.queryByTestId('coach-week-makeup-note')).not.toBeInTheDocument();
  });

  it('behind-only → gentle forward note (no blame), names the group', () => {
    renderCardWithMakeup({ added: {}, behind: { back: 2 } });
    const note = screen.getByTestId('coach-week-makeup-note');
    expect(note.textContent).toMatch(/spate/);
    expect(note.textContent).not.toMatch(BLAME);
  });

  // Plan-allocation gate (LLM-judge Pattern B, makeup-added-but-plan-omits): the
  // founder bug — "Am adaugat putin piept azi" when TODAY's plan trains ZERO
  // chest. The note must only name a group the plan actually allocates.
  const PLAN_BACK_BICEPS_ONLY: PlannedWorkoutOutput['exercises'] = [
    { id: 'a', name: 'Cable Row', engineName: 'Cable Row', sets: 4, targetReps: 10, targetKg: 60, restSec: 90 },
    { id: 'b', name: 'Lat Pulldown', engineName: 'Lat Pulldown', sets: 4, targetReps: 10, targetKg: 50, restSec: 90 },
    { id: 'c', name: 'Cable Curl', engineName: 'Cable Curl', sets: 3, targetReps: 12, targetKg: 20, restSec: 60 },
  ];

  it('SUPPRESSES "added piept azi" when today plan trains zero chest', () => {
    // weekMakeup says chest was added, but the plan is back+biceps only → a lie.
    renderCardWithMakeup({ added: { chest: 2 }, behind: {} }, () => {}, PLAN_BACK_BICEPS_ONLY);
    expect(screen.queryByTestId('coach-week-makeup-note')).not.toBeInTheDocument();
  });

  it('drops the unallocated group but keeps an allocated one from the same makeup', () => {
    // chest is not trained today (dropped); back IS → the note names only back.
    renderCardWithMakeup({ added: { chest: 2, back: 3 }, behind: {} }, () => {}, PLAN_BACK_BICEPS_ONLY);
    const note = screen.getByTestId('coach-week-makeup-note');
    expect(note.textContent).toMatch(/spate/);
    expect(note.textContent).not.toMatch(/piept/);
  });

  it('SHOWS the note when the makeup group IS allocated today (supporting plan)', () => {
    // Default plan trains chest → "added chest" is honest.
    renderCardWithMakeup({ added: { chest: 2 }, behind: {} });
    const note = screen.getByTestId('coach-week-makeup-note');
    expect(note.textContent).toMatch(/piept/);
  });

  // Cross-line contradiction gate (cycle-7 HIGH): a group both behind-on-week
  // (makeup +X) AND fatigued (recovery cut) must not get "Added a little {group}"
  // AND "Lighter on your {group}...recovering" across the two lines. The recovery
  // cut wins → the makeup note omits that group.
  function renderCardWithMakeupAndAdaptations(
    weekMakeup: WeekMakeup,
    coachAdaptations: CoachAdaptation[],
    exercises: PlannedWorkoutOutput['exercises'] = PLAN_CHEST_SHOULDERS_BACK,
  ) {
    const workout: PlannedWorkoutOutput = {
      workoutTitle: '__engine_workout_title_fallback__',
      sessionType: 'PUSH',
      exerciseCount: 5,
      estimatedDuration: 48,
      intensityMod: 'normal',
      exercises,
      volumeKg: 0,
      coachAdaptations,
      weekMakeup,
    };
    return render(
      <MemoryRouter>
        <CoachTodayCard onStart={() => {}} workout={workout} />
      </MemoryRouter>,
    );
  }

  it('OMITS a makeup group that the why-line already flags as a recovery cut', () => {
    // chest is behind-on-week (makeup +2) AND fatigued (recovery cut). The
    // why-line says "lighter on chest"; the makeup note must NOT also say "added
    // chest" for the same muscle → chest dropped, only back survives.
    renderCardWithMakeupAndAdaptations(
      { added: { chest: 2, back: 3 }, behind: {} },
      [{ kind: 'recovery-cut', group: 'piept', cause: 'resistance' }],
    );
    const note = screen.getByTestId('coach-week-makeup-note');
    expect(note.textContent).toMatch(/spate/);
    expect(note.textContent).not.toMatch(/piept/);
  });

  it('SUPPRESSES the makeup note entirely when its only group is a recovery cut', () => {
    // chest is the lone makeup group AND it has a recovery cut → nothing left to
    // say in the makeup note (the why-line carries the chest message instead).
    renderCardWithMakeupAndAdaptations(
      { added: { chest: 2 }, behind: {} },
      [{ kind: 'recovery-cut', group: 'piept', cause: 'resistance' }],
    );
    expect(screen.queryByTestId('coach-week-makeup-note')).not.toBeInTheDocument();
  });
});

// Plan-allocation truth reconciliation (chest-heavy-plan bug, 2026-06-05). The
// founder caught the card claiming what the generated plan did NOT do: "lighter
// on your back" while back was at standard load, "focus on biceps" while the plan
// was chest-heavy, and a "2 wks trend" line while still admitting "still learning
// you". These tests pin every contradiction shut at the render layer.
describe('CoachTodayCard — narrative reconciled with the proposed plan', () => {
  // A chest-heavy plan matching the founder's example: 8 chest sets dominate, 1
  // back set is an afterthought. engineName values are real EXERCISE_MUSCLES keys.
  function chestHeavyPlan(
    coachAdaptations: CoachAdaptation[],
  ): PlannedWorkoutOutput {
    return {
      workoutTitle: '__engine_workout_title_fallback__',
      sessionType: 'PUSH',
      exerciseCount: 3,
      estimatedDuration: 48,
      intensityMod: 'normal',
      exercises: [
        { id: 'a', name: 'Incline DB Press', engineName: 'Incline DB Press', sets: 4, targetReps: 8, targetKg: 30, restSec: 90 },
        { id: 'b', name: 'Flat DB Press', engineName: 'Flat DB Press', sets: 4, targetReps: 8, targetKg: 30, restSec: 90 },
        { id: 'c', name: 'Cable Row', engineName: 'Cable Row', sets: 1, targetReps: 10, targetKg: 65, restSec: 90 },
      ],
      volumeKg: 0,
      coachAdaptations,
    };
  }

  function renderPlan(workout: PlannedWorkoutOutput) {
    return render(
      <MemoryRouter>
        <CoachTodayCard onStart={() => {}} workout={workout} />
      </MemoryRouter>,
    );
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue(null);
    vi.spyOn(engineWrappers, 'getLaggingSignal').mockReturnValue(null);
    vi.spyOn(engineWrappers, 'getReturnAfterMissSignal').mockReturnValue(null);
    useWorkoutStore.setState({ sessionsHistory: [] });
    setLocale('en');
    _resetI18nCache();
    setLocale('en');
  });

  afterEach(() => {
    setLocale('en');
    _resetI18nCache();
  });

  it('ALLOWS "lighter on back" when the plan genuinely goes light on back', () => {
    // Mature model (no calibration gate). The chest-heavy plan trains back with a
    // single afterthought set → back is truly lighter → the recovery-cut clause is
    // allowed to fire (proves the gate keeps TRUE claims). The false case is next.
    vi.spyOn(engineWrappers, 'getCalibrationMaturity').mockReturnValue(null);
    renderPlan(
      chestHeavyPlan([{ kind: 'recovery-cut', group: 'spate', cause: 'resistance' }]),
    );
    const line = screen.queryByTestId('coach-why-line');
    expect(line?.textContent ?? '').toMatch(/back/i);
  });

  it('SUPPRESSES "lighter on back" when the plan trains back as a focus group', () => {
    vi.spyOn(engineWrappers, 'getCalibrationMaturity').mockReturnValue(null);
    const backHeavy: PlannedWorkoutOutput = {
      workoutTitle: '__engine_workout_title_fallback__',
      sessionType: 'PULL',
      exerciseCount: 2,
      estimatedDuration: 48,
      intensityMod: 'normal',
      exercises: [
        { id: 'a', name: 'Cable Row', engineName: 'Cable Row', sets: 4, targetReps: 8, targetKg: 65, restSec: 90 },
        { id: 'b', name: 'Lat Pulldown', engineName: 'Lat Pulldown', sets: 4, targetReps: 10, targetKg: 55, restSec: 90 },
      ],
      volumeKg: 0,
      coachAdaptations: [{ kind: 'recovery-cut', group: 'spate', cause: 'resistance' }],
    };
    renderPlan(backHeavy);
    // Back is the focus of the plan → "lighter on back" is a lie → no why-line.
    expect(screen.queryByTestId('coach-why-line')).not.toBeInTheDocument();
  });

  it('SUPPRESSES the weakness-amp "focus" clause while the model is still learning', () => {
    // Founder's third lie: "biceps undervolume 2 wks — focus on it" co-existing
    // with "still learning you". The trend claim must vanish while immature.
    vi.spyOn(engineWrappers, 'getCalibrationMaturity').mockReturnValue({
      tierId: 0,
      tierName: 'cold_start',
      sessionsCount: 1,
      sessionsToNext: 1,
    });
    renderPlan(chestHeavyPlan([{ kind: 'weakness-amp', group: 'spate' }]));
    // The "still learning" line IS shown; the trend why-line is NOT.
    expect(screen.getByTestId('coach-calibration-line')).toBeInTheDocument();
    expect(screen.queryByTestId('coach-why-line')).not.toBeInTheDocument();
  });

  it('does NOT push a weakness-amp clause for a group the plan barely trains', () => {
    // Mature model (no calibration gate) — biceps flagged weak, but the chest-
    // heavy plan allocates ZERO biceps → cannot claim to push biceps today.
    vi.spyOn(engineWrappers, 'getCalibrationMaturity').mockReturnValue(null);
    renderPlan(chestHeavyPlan([{ kind: 'weakness-amp', group: 'biceps' }]));
    expect(screen.queryByTestId('coach-why-line')).not.toBeInTheDocument();
  });
});

// START-side double-session guard (counterpart to the PostRpe finish-side
// confirm shipped dc9400d6). A session logged TODAY replaces the start CTA
// with a "Session logged" control; the only way to a 2nd session today is the
// explicit "Add a second session" opt-in.
describe('CoachTodayCard — session-logged-today start guard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(engineWrappers, 'getCoachTodayQuote').mockReturnValue(null);
    useWorkoutStore.setState({ sessionsHistory: [], deletedSessionTs: [] });
  });

  it('no session today → normal Start CTA shows, no logged state', () => {
    renderCard();
    expect(screen.getByText('Start session')).toBeInTheDocument();
    expect(screen.queryByTestId('coach-session-logged')).not.toBeInTheDocument();
  });

  it('session logged today → start CTA replaced by "Session logged"', () => {
    useWorkoutStore.setState({ sessionsHistory: [todaySessionFixture()] });
    renderCard();
    expect(screen.getByTestId('coach-session-logged')).toBeInTheDocument();
    // Normal start button + override link are gone.
    expect(screen.queryByText('Start session')).not.toBeInTheDocument();
    expect(screen.queryByTestId('coach-today-override')).not.toBeInTheDocument();
  });

  it('tapping "Session logged" reveals delete + add-second options', () => {
    useWorkoutStore.setState({ sessionsHistory: [todaySessionFixture()] });
    renderCard();
    // Options hidden until the logged state is tapped.
    expect(screen.queryByTestId('coach-session-delete')).not.toBeInTheDocument();
    act(() => {
      screen.getByTestId('coach-session-logged').click();
    });
    expect(screen.getByTestId('coach-session-delete')).toBeInTheDocument();
    expect(screen.getByTestId('coach-session-add-second')).toBeInTheDocument();
  });

  it('delete removes today\'s session and reverts to the normal Start CTA', () => {
    const ts = Date.now();
    useWorkoutStore.setState({ sessionsHistory: [todaySessionFixture(ts)] });
    renderCard();
    act(() => {
      screen.getByTestId('coach-session-logged').click();
    });
    act(() => {
      screen.getByTestId('coach-session-delete').click();
    });
    // Store no longer has the session; CTA reverts.
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(0);
    expect(screen.getByText('Start session')).toBeInTheDocument();
    expect(screen.queryByTestId('coach-session-logged')).not.toBeInTheDocument();
  });

  it('add-second calls onStart (enters the normal start flow)', () => {
    useWorkoutStore.setState({ sessionsHistory: [todaySessionFixture()] });
    const onStart = vi.fn();
    renderCard(onStart);
    act(() => {
      screen.getByTestId('coach-session-logged').click();
    });
    act(() => {
      screen.getByTestId('coach-session-add-second').click();
    });
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});

// ── B4 — decision trace rows ("de ce planul de azi") ───────────────────────
describe('CoachTodayCard — decision trace (de ce azi)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useWorkoutStore.setState({ sessionsHistory: [] });
  });

  function workoutWithTrace(
    decisionTrace: DecisionTraceEntry[],
  ): PlannedWorkoutOutput {
    return {
      workoutTitle: '__engine_workout_title_fallback__',
      sessionType: 'PUSH',
      exerciseCount: 5,
      estimatedDuration: 48,
      intensityMod: 'normal',
      exercises: [],
      volumeKg: 0,
      coachAdaptations: [],
      decisionTrace,
    };
  }

  function renderWithTrace(decisionTrace: DecisionTraceEntry[]) {
    return render(
      <MemoryRouter>
        <CoachTodayCard onStart={() => {}} workout={workoutWithTrace(decisionTrace)} />
      </MemoryRouter>,
    );
  }

  it('renders nothing cand decisionTrace absent', () => {
    render(
      <MemoryRouter>
        <CoachTodayCard onStart={() => {}} workout={workoutWith([])} />
      </MemoryRouter>,
    );
    expect(screen.queryByTestId('coach-today-trace')).not.toBeInTheDocument();
  });

  it('renders a COLLAPSED trace with one row per entry — localized factor + raw value', () => {
    renderWithTrace([
      { factor: 'readiness', value: 85 },
      { factor: 'recovery', value: 'cut chest' },
      { factor: 'finalDecision', value: 'PUSH session, 5 exercises' },
    ]);
    const details = screen.getByTestId('coach-today-trace');
    expect(details).toBeInTheDocument();
    // Collapsed by default — native <details> has no `open` attribute.
    expect(details).not.toHaveAttribute('open');
    expect(screen.getAllByTestId('coach-today-trace-row')).toHaveLength(3);
    // EN default factor labels + the engine's own value tokens.
    expect(screen.getByText('Readiness')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Recovery')).toBeInTheDocument();
    expect(screen.getByText('cut chest')).toBeInTheDocument();
    expect(screen.getByText('Final decision')).toBeInTheDocument();
  });

  it('RO locale localizes the factor labels', () => {
    setLocale('ro');
    try {
      renderWithTrace([{ factor: 'finalDecision', value: 'PUSH session, 5 exercises' }]);
      expect(screen.getByText('Decizia finala')).toBeInTheDocument();
    } finally {
      setLocale('en');
      _resetI18nCache();
    }
  });
});
