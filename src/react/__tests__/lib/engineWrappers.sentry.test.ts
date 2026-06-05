// ══ ENGINE WRAPPERS — §48-H1 Sentry instrumentation test ══════════════════
//
// Verify adapter integrity instrumentation: when engine throws inside any
// wrapper try/catch, captureException is invoked with tags.source =
// 'engine-adapter-fallback' + tags.adapter = <adapterName>.
//
// Rationale (§48.5 audit recon): engineWrappers wraps engines cu try/catch
// fallback to baseline. Risk = silent divergence (engine returns malformed
// shape, adapter returns baseline → UI shows stale defaults forever).
// Sentry alert breaks the silence; this test guards the wire pre-Beta.
//
// Pattern: vi.mock sentry helper module + spy captureException + force
// engine throw → assert helper called with adapter + source tags.
//
// ENGINE-DEEPER-AUDIT chat 5 extension: 6 adapter paths missing witness
// coverage. Extended la 11 adapter labels (12 witnesses — getPatternsBanner
// has 2 catch paths STAGNATION + LOW_ADHERENCE).

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../util/sentry.js', () => ({
  captureException: vi.fn(),
}));

vi.mock('../../../engine/readiness.js', () => ({
  getComputedReadinessScore: vi.fn(),
  getReadinessVerdict: vi.fn(),
}));

vi.mock('../../../engine/fatigue.js', () => ({
  calculateFatigueScore: vi.fn(),
}));

vi.mock('../../../engine/prEngine.js', () => ({
  detectPR: vi.fn(),
}));

vi.mock('../../../engine/adherence.js', () => ({
  getAdherenceScore: vi.fn(),
}));

vi.mock('../../../engine/proactiveEngine.js', () => ({
  runProactiveChecks: vi.fn(),
}));

vi.mock('../../lib/scheduleAdapterAggregate', () => ({
  composePlannedWorkoutToday: vi.fn(),
}));

vi.mock('../../../engine/bayesianNutrition/index.js', () => ({
  evaluate: vi.fn(),
}));

vi.mock('../../../engine/stagnationDetector.js', () => ({
  detectGlobalStagnation: vi.fn(),
}));

vi.mock('../../../engine/muscleRecovery.js', () => ({
  getRecoveryByGroup: vi.fn(),
  daysSinceGroup: vi.fn(),
  hoursSinceGroup: vi.fn(),
  GROUP_LABELS_RO_BIG11: {},
}));

vi.mock('../../../engine/weaknessDetector.js', () => ({
  detectWeakGroups: vi.fn(),
}));

import {
  getReadiness,
  getFatigue,
  getPRDelta,
  getAdherenceOutput,
  getProactiveAlerts,
  getTodayWorkout,
  getNutritionTargetsToday,
  getPatternsBanner,
  getCoachRestReason,
  getLaggingSignal,
  getCoachTodayQuote,
} from '../../lib/engineWrappers';
import { captureException } from '../../../util/sentry.js';
import { getComputedReadinessScore } from '../../../engine/readiness.js';
import { calculateFatigueScore } from '../../../engine/fatigue.js';
import { detectPR } from '../../../engine/prEngine.js';
import { getAdherenceScore } from '../../../engine/adherence.js';
import { runProactiveChecks } from '../../../engine/proactiveEngine.js';
import { composePlannedWorkoutToday } from '../../lib/scheduleAdapterAggregate';
import { evaluate as evaluateBN } from '../../../engine/bayesianNutrition/index.js';
import { detectGlobalStagnation } from '../../../engine/stagnationDetector.js';
import { getRecoveryByGroup, daysSinceGroup, hoursSinceGroup } from '../../../engine/muscleRecovery.js';
import { detectWeakGroups } from '../../../engine/weaknessDetector.js';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useOnboardingStore } from '../../stores/onboardingStore';

// Helper: seed workoutStore cu N sessions (minimal shape, exercises with 1
// set each). Gates getPatternsBanner LOW_ADHERENCE try-block (needs 3+
// sessions) + provides flatten input pentru STAGNATION/CoachRest/Lagging.
function seedSessions(count: number) {
  const sessions = Array.from({ length: count }, (_, i) => ({
    sessionId: `s${i}`,
    date: '2026-05-23',
    exercises: [
      {
        exerciseName: 'Bench Press',
        sets: [{ kg: 100, reps: 5, timestamp: Date.now() }],
      },
    ],
  }));
  // @ts-expect-error — partial session shape suficient pentru flatten loops
  useWorkoutStore.setState({ sessionsHistory: sessions });
}

describe('engineWrappers §48-H1 Sentry instrumentation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWorkoutStore.setState({ sessionsHistory: [] });
  });

  it('getReadiness catch: captureException called cu source + adapter tags', () => {
    vi.mocked(getComputedReadinessScore).mockImplementation(() => {
      throw new Error('engine boom');
    });
    expect(getReadiness()).toBeNull();
    expect(captureException).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { source: 'engine-adapter-fallback', adapter: 'getReadiness' },
      }),
    );
  });

  it('getFatigue catch: captureException called cu adapter tag', () => {
    vi.mocked(calculateFatigueScore).mockImplementation(() => {
      throw new Error('fatigue boom');
    });
    expect(getFatigue()).toBeNull();
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { source: 'engine-adapter-fallback', adapter: 'getFatigue' },
      }),
    );
  });

  it('getPRDelta catch: captureException called cu exercise extra', () => {
    vi.mocked(detectPR).mockImplementation(() => {
      throw new Error('pr boom');
    });
    expect(getPRDelta('Bench Press', { w: 100, reps: 5 }, [])).toBeNull();
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { source: 'engine-adapter-fallback', adapter: 'getPRDelta' },
        extra: { exercise: 'Bench Press' },
      }),
    );
  });

  it('getAdherenceOutput catch: captureException called', () => {
    vi.mocked(getAdherenceScore).mockImplementation(() => {
      throw new Error('adherence boom');
    });
    // Returns BASELINE_ADHERENCE_OUTPUT object — verify call happened.
    getAdherenceOutput();
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { source: 'engine-adapter-fallback', adapter: 'getAdherenceOutput' },
      }),
    );
  });

  it('getProactiveAlerts catch: captureException called', () => {
    vi.mocked(runProactiveChecks).mockImplementation(() => {
      throw new Error('proactive boom');
    });
    expect(getProactiveAlerts({})).toEqual([]);
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { source: 'engine-adapter-fallback', adapter: 'getProactiveAlerts' },
      }),
    );
  });

  // ── ENGINE-DEEPER-AUDIT chat 5 extension (6 missing adapter paths) ─────

  it('getTodayWorkout catch: captureException called cu adapter tag', async () => {
    vi.mocked(composePlannedWorkoutToday).mockImplementation(() => {
      throw new Error('today workout boom');
    });
    expect(await getTodayWorkout()).toBeNull();
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { source: 'engine-adapter-fallback', adapter: 'getTodayWorkout' },
      }),
    );
  });

  it('getNutritionTargetsToday catch: captureException called cu adapter tag', async () => {
    vi.mocked(evaluateBN).mockImplementation(() => {
      throw new Error('bn boom');
    });
    const out = await getNutritionTargetsToday({});
    // Returns BASELINE_NUTRITION fallback — verify capture invoked.
    expect(out.source).toBe('baseline');
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          source: 'engine-adapter-fallback',
          adapter: 'getNutritionTargetsToday',
        },
      }),
    );
  });

  it('getPatternsBanner STAGNATION catch: captureException called cu pattern tag', () => {
    seedSessions(1); // flatten loop input
    vi.mocked(detectGlobalStagnation).mockImplementation(() => {
      throw new Error('stagnation boom');
    });
    // adherence sub-block gated pe 3+ sessions — count=1 short-circuits, only
    // STAGNATION catch fires.
    expect(getPatternsBanner()).toEqual([]);
    expect(captureException).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          source: 'engine-adapter-fallback',
          adapter: 'getPatternsBanner',
          pattern: 'STAGNATION',
        },
      }),
    );
  });

  it('getPatternsBanner LOW_ADHERENCE catch: captureException called cu pattern tag', () => {
    seedSessions(3); // satisface LOW_ADHERENCE_MIN_SESSIONS_GATE
    // STAGNATION sub-block returns benign zero-stagnation → guard < threshold, no banner, no capture
    vi.mocked(detectGlobalStagnation).mockReturnValue({
      maxStagnationWeeks: 0,
      byExercise: {},
    });
    // LOW_ADHERENCE now reads the onboarding frequency target (workout-based
    // adherence, post 2026-06-05) — force that read to throw to exercise the catch.
    const onboardingSpy = vi
      .spyOn(useOnboardingStore, 'getState')
      .mockImplementation(() => {
        throw new Error('adherence sub-engine boom');
      });
    expect(getPatternsBanner()).toEqual([]);
    onboardingSpy.mockRestore();
    expect(captureException).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          source: 'engine-adapter-fallback',
          adapter: 'getPatternsBanner',
          pattern: 'LOW_ADHERENCE',
        },
      }),
    );
  });

  it('getCoachRestReason catch: captureException called cu adapter tag', () => {
    seedSessions(1); // flatten input
    vi.mocked(getRecoveryByGroup).mockImplementation(() => {
      throw new Error('recovery boom');
    });
    expect(getCoachRestReason()).toBeNull();
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          source: 'engine-adapter-fallback',
          adapter: 'getCoachRestReason',
        },
      }),
    );
  });

  it('getLaggingSignal catch: captureException called cu adapter tag', () => {
    seedSessions(1);
    vi.mocked(detectWeakGroups).mockImplementation(() => {
      throw new Error('weakness boom');
    });
    expect(getLaggingSignal()).toBeNull();
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          source: 'engine-adapter-fallback',
          adapter: 'getLaggingSignal',
        },
      }),
    );
  });

  it('getCoachTodayQuote catch: captureException called cu adapter tag', () => {
    seedSessions(1);
    vi.mocked(getRecoveryByGroup).mockImplementation(() => {
      throw new Error('recovery boom');
    });
    expect(getCoachTodayQuote()).toBeNull();
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          source: 'engine-adapter-fallback',
          adapter: 'getCoachTodayQuote',
        },
      }),
    );
  });

  it('getCoachTodayQuote T0 fresh (no logs): returns null without engine call', () => {
    // Clear sessions — no logs flattened → early return null, NU engine call.
    useWorkoutStore.setState({ sessionsHistory: [] });
    expect(getCoachTodayQuote()).toBeNull();
    expect(getRecoveryByGroup).not.toHaveBeenCalled();
  });

  it('F-2: a recovered group trained <24h ago surfaces with sub-day elapsedHours', () => {
    // Regression for the dead <24h branch: the old `days < 1` floor-gate skipped
    // any group trained <24h ago (days floors to 0) BEFORE elapsedHours was read,
    // so the formatter's "{n}h ago" path was unreachable. A recovered group at 13h
    // (e.g. a 24h-recovery small muscle) must now produce a quote carrying the real
    // sub-day elapsedHours so CoachTodayCard can render "13h", not be dropped.
    seedSessions(1);
    vi.mocked(getRecoveryByGroup).mockReturnValue({ biceps: 'recovered' } as never);
    vi.mocked(daysSinceGroup).mockReturnValue(0); // floored — the old gate's trap
    vi.mocked(hoursSinceGroup).mockReturnValue(13);
    const quote = getCoachTodayQuote();
    expect(quote).not.toBeNull();
    expect(quote?.elapsedHours).toBe(13);
    expect(quote?.daysSince).toBe(0);
  });

  it('F-2: a group beyond the max window (>14 days) is still excluded', () => {
    seedSessions(1);
    vi.mocked(getRecoveryByGroup).mockReturnValue({ biceps: 'recovered' } as never);
    vi.mocked(daysSinceGroup).mockReturnValue(20);
    vi.mocked(hoursSinceGroup).mockReturnValue(20 * 24);
    expect(getCoachTodayQuote()).toBeNull();
  });

  it('no engine throw: captureException NOT called (happy path)', () => {
    vi.mocked(getComputedReadinessScore).mockReturnValue(null);
    getReadiness();
    expect(captureException).not.toHaveBeenCalled();
  });
});
