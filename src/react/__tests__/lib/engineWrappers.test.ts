// ══ ENGINE WRAPPERS TESTS — Pure-Function Adapters ═══════════════════════
// Per spec task_03 §4 A — vi.mock engine modules + verify wrapper interface.

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../engine/readiness.js', () => ({
  getComputedReadinessScore: vi.fn(),
  getReadinessVerdict: vi.fn(),
  // §F-workout-05 — whyEngine.js (consumed by getWhyExerciseSummary) imports
  // READINESS_MED from readiness.js for its recovery-verdict gate; the mock must
  // expose it (real value 55) or whySummary throws on the undefined import.
  READINESS_MED: 55,
}));

vi.mock('../../../engine/fatigue.js', () => ({
  calculateFatigueScore: vi.fn(),
}));

vi.mock('../../../engine/prEngine.js', () => ({
  detectPR: vi.fn(),
}));

import {
  getReadiness,
  getFatigue,
  getPRDelta,
  getTodayWorkout,
  getWhyExerciseSummary,
  getCoachTodayQuote,
} from '../../lib/engineWrappers';
import { getComputedReadinessScore, getReadinessVerdict } from '../../../engine/readiness.js';
import { calculateFatigueScore } from '../../../engine/fatigue.js';
import { detectPR } from '../../../engine/prEngine.js';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useAerobicStore } from '../../stores/aerobicStore';

describe('engineWrappers — getReadiness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null daca score null (readiness NU logged azi)', () => {
    vi.mocked(getComputedReadinessScore).mockReturnValue(null);
    expect(getReadiness()).toBeNull();
  });

  it('maps score + verdict la simplified output shape', () => {
    vi.mocked(getComputedReadinessScore).mockReturnValue(85);
    vi.mocked(getReadinessVerdict).mockReturnValue({
      label: 'Zi de PR',
      color: 'var(--green)',
      volumeMultiplier: 1.1,
      canPR: true,
    });
    const r = getReadiness();
    expect(r).not.toBeNull();
    expect(r?.score).toBe(85);
    expect(r?.label).toBe('Zi de PR');
    expect(r?.canPR).toBe(true);
  });

  it('passes isInCut + hasHistory opts la verdict', () => {
    vi.mocked(getComputedReadinessScore).mockReturnValue(75);
    vi.mocked(getReadinessVerdict).mockReturnValue({
      label: 'Sesiune normala',
      color: 'var(--accent)',
      volumeMultiplier: 1.0,
      canPR: false,
    });
    getReadiness({ isInCut: true });
    // Cold-start honesty: wrapper deriva hasHistory din sessionsHistory.length.
    // Test env store default = [] → hasHistory false.
    expect(getReadinessVerdict).toHaveBeenCalledWith(75, { isInCut: true, hasHistory: false });
  });

  it('returns null daca verdict label null', () => {
    vi.mocked(getComputedReadinessScore).mockReturnValue(50);
    vi.mocked(getReadinessVerdict).mockReturnValue({
      label: null,
      color: 'var(--text3)',
      volumeMultiplier: 1.0,
      canPR: false,
    });
    expect(getReadiness()).toBeNull();
  });

  it('returns null + warn daca engine throws', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(getComputedReadinessScore).mockImplementation(() => {
      throw new Error('DB unavailable');
    });
    expect(getReadiness()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('engineWrappers — getFatigue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps raw fatigue output la simplified shape', () => {
    vi.mocked(calculateFatigueScore).mockReturnValue({
      score: 45,
      key: 'MODERATE_FATIGUE',
      label: 'Pas mai conservator',
      icon: '🟡',
      color: 'var(--accent2)',
      recommend: 'reduce',
      detail: 'Astazi mentinem greutatile.',
    });
    const r = getFatigue();
    expect(r?.score).toBe(45);
    expect(r?.key).toBe('MODERATE_FATIGUE');
    expect(r?.recommend).toBe('reduce');
  });

  it('returns null daca engine returns falsy', () => {
    vi.mocked(calculateFatigueScore).mockReturnValue(null);
    expect(getFatigue()).toBeNull();
  });

  it('returns null daca engine throws', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(calculateFatigueScore).mockImplementation(() => {
      throw new Error('DB error');
    });
    expect(getFatigue()).toBeNull();
    warnSpy.mockRestore();
  });

  it('handles DATE INSUFICIENTE edge case (score 0)', () => {
    vi.mocked(calculateFatigueScore).mockReturnValue({
      score: 0,
      key: 'NORMAL',
      label: 'DATE INSUFICIENTE',
      icon: '',
      color: 'var(--text3)',
      recommend: 'none',
      detail: 'Completeaza 2+ sesiuni',
    });
    const r = getFatigue();
    expect(r?.score).toBe(0);
    expect(r?.label).toBe('DATE INSUFICIENTE');
  });
});

describe('engineWrappers — getPRDelta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns weight PR daca engine detects + enriched fields', () => {
    vi.mocked(detectPR).mockReturnValue({
      type: 'weight',
      kg: 100,
      reps: 5,
      prevBest: { ex: 'Bench', w: 95, reps: 5 },
    });
    const r = getPRDelta('Bench', { w: 100, reps: 5 }, []);
    expect(r?.type).toBe('weight');
    expect(r?.kg).toBe(100);
    // task_18 §A enriched fields
    expect(r?.deltaKg).toBe(5);
    expect(r?.deltaPct).toBeCloseTo(5.3, 0); // 5/95 * 100 ≈ 5.26
    expect(r?.oneRMEstimate).toBeCloseTo(116.7, 0); // 100 * (1 + 5/30) = 116.67
  });

  it('returns null daca engine returns null (no PR)', () => {
    vi.mocked(detectPR).mockReturnValue(null);
    expect(getPRDelta('Bench', { w: 50, reps: 10 }, [])).toBeNull();
  });

  it('returns null daca engine throws', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(detectPR).mockImplementation(() => {
      throw new Error('Invalid input');
    });
    expect(getPRDelta('Bench', { w: 0, reps: 0 }, [])).toBeNull();
    warnSpy.mockRestore();
  });

  it('passes through exercise + set + history la engine', () => {
    vi.mocked(detectPR).mockReturnValue(null);
    const hist = [{ ex: 'Squat', w: 100, reps: 5 }];
    getPRDelta('Squat', { w: 105, reps: 5 }, hist);
    expect(detectPR).toHaveBeenCalledWith('Squat', { w: 105, reps: 5 }, hist);
  });

  it('task_18: oneRMEstimate Epley formula correct', () => {
    vi.mocked(detectPR).mockReturnValue({
      type: 'weight',
      kg: 60,
      reps: 10,
      prevBest: null,
    });
    const r = getPRDelta('Bench', { w: 60, reps: 10 }, []);
    // Epley: 60 * (1 + 10/30) = 60 * 1.333 = 80
    expect(r?.oneRMEstimate).toBe(80);
  });

  it('task_18: deltaKg + deltaPct = 0 cand prevBest null (first ever PR)', () => {
    vi.mocked(detectPR).mockReturnValue({
      type: 'weight',
      kg: 60,
      reps: 10,
      prevBest: null,
    });
    const r = getPRDelta('Bench', { w: 60, reps: 10 }, []);
    expect(r?.deltaKg).toBe(60); // 60 - 0 = 60 (first ever, baseline 0)
    expect(r?.deltaPct).toBe(0); // 0 cand prevKg=0 (avoid divide by zero)
  });

  it('task_18: oneRMEstimate=0 cand kg sau reps zero', () => {
    vi.mocked(detectPR).mockReturnValue({
      type: 'volume',
      kg: 0,
      reps: 10,
      prevBest: null,
    });
    const r = getPRDelta('Bench', { w: 0, reps: 10 }, []);
    expect(r?.oneRMEstimate).toBe(0);
  });

  it('task_18: volume PR cu enriched fields', () => {
    vi.mocked(detectPR).mockReturnValue({
      type: 'volume',
      kg: 50,
      reps: 15,
      prevBest: { ex: 'Squat', w: 50, reps: 10 },
    });
    const r = getPRDelta('Squat', { w: 50, reps: 15 }, []);
    expect(r?.type).toBe('volume');
    expect(r?.deltaKg).toBe(0); // same weight, NU kg increase
    expect(r?.oneRMEstimate).toBe(75); // 50 * (1 + 15/30) = 75
  });
});

describe('engineWrappers — getWhyExerciseSummary (§F-workout-05)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns progression_up categorical string cand rec.kg > lastWeight', () => {
    vi.mocked(getComputedReadinessScore).mockReturnValue(80); // above recovery gate
    const s = getWhyExerciseSummary({ name: 'Bench Press', recommendationKg: 25, lastWeightKg: 22.5 });
    expect(typeof s).toBe('string');
    expect(s).toContain('Bench Press'); // exercise interpolated
    expect((s ?? '').length).toBeGreaterThan(0);
  });

  it('returns recovery categorical string cand readiness sub gate (override)', () => {
    vi.mocked(getComputedReadinessScore).mockReturnValue(20); // below READINESS_MED
    const s = getWhyExerciseSummary({ name: 'Squat', recommendationKg: 60, lastWeightKg: 60 });
    expect(s).toContain('Squat');
  });

  it('handles null lastWeight (first set — hold/default verdict)', () => {
    vi.mocked(getComputedReadinessScore).mockReturnValue(70);
    const s = getWhyExerciseSummary({ name: 'Deadlift', recommendationKg: 100, lastWeightKg: null });
    expect(typeof s).toBe('string');
    expect(s).toContain('Deadlift');
  });

  it('returns null + warn daca engine throws', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(getComputedReadinessScore).mockImplementation(() => {
      throw new Error('DB unavailable');
    });
    expect(getWhyExerciseSummary({ name: 'Bench', recommendationKg: 50 })).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('engineWrappers — getTodayWorkout (Phase 6 task_02 Option C real wire async)', () => {
  it('returns planned workout aggregate (real pipeline) — async signature', async () => {
    const w = await getTodayWorkout();
    // Real pipeline → null on rest day / hard halt, shape on training day.
    if (w !== null) {
      expect(typeof w.workoutTitle).toBe('string');
      expect(typeof w.exerciseCount).toBe('number');
      expect(typeof w.estimatedDuration).toBe('number');
      expect(['plus', 'normal', 'minus']).toContain(w.intensityMod);
      expect(typeof w.volumeKg).toBe('number');
    }
  });

  it('returns exercises array cu PlannedExercise shape (real engine output)', async () => {
    const w = await getTodayWorkout();
    if (w !== null) {
      expect(Array.isArray(w.exercises)).toBe(true);
      if (w.exercises.length > 0) {
        const ex = w.exercises[0]!;
        expect(typeof ex.id).toBe('string');
        expect(typeof ex.name).toBe('string');
        expect(typeof ex.sets).toBe('number');
        expect(typeof ex.targetReps).toBe('number');
        expect(typeof ex.targetKg).toBe('number');
        expect(typeof ex.restSec).toBe('number');
      }
    }
  });

  it('exerciseCount matches exercises.length', async () => {
    const w = await getTodayWorkout();
    if (w !== null) {
      expect(w.exerciseCount).toBe(w.exercises.length);
    }
  });

  it('all exercises have required PlannedExercise fields', async () => {
    const w = await getTodayWorkout();
    if (w !== null) {
      w.exercises.forEach((ex) => {
        expect(typeof ex.id).toBe('string');
        expect(typeof ex.name).toBe('string');
        expect(typeof ex.sets).toBe('number');
        expect(typeof ex.targetReps).toBe('number');
        expect(typeof ex.targetKg).toBe('number');
        expect(typeof ex.restSec).toBe('number');
      });
    }
  });

  it('volumeKg is numeric non-negative (engine V1 default 0 — Phase 7+ live estimate)', async () => {
    const w = await getTodayWorkout();
    if (w !== null) {
      expect(typeof w.volumeKg).toBe('number');
      expect(w.volumeKg).toBeGreaterThanOrEqual(0);
    }
  });
});

// ── C18-AEROBIC-QUOTE-BLIND — getCoachTodayQuote folds aerobic recovery ───────
// The body-map (useMuscleRecoveryGroups) + the composer's volume cut fold aerobic
// via mergeAerobicRecovery, but getCoachTodayQuote read getRecoveryByGroup WITHOUT
// it — so it could narrate a cardio-EASED group as recovered/fresh while the body-map
// shows that same group as 'partial'. The quote now folds aerobic the SAME way.
describe('engineWrappers — getCoachTodayQuote folds aerobic recovery', () => {
  const NOW = Date.now();
  const HOUR = 3_600_000;

  beforeEach(() => {
    useWorkoutStore.setState({ sessionsHistory: [] as never });
    useAerobicStore.setState({ sessions: [] });
  });

  // A core session ~3 days ago → core reads 'recovered' (decayed). Production-shaped
  // session breakdown (the shape sessionsHistory carries).
  function seedCoreSession(): void {
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Core',
          meta: '',
          ts: NOW - 72 * HOUR,
          exercises: [
            {
              exerciseId: 'cable-crunch',
              exerciseName: 'Cable Crunch Kneeling',
              engineName: 'Cable Crunch Kneeling',
              totalVolume: 0,
              peakOneRM: 0,
              sets: [
                { kg: 30, reps: 12, rating: 'potrivit', timestamp: NOW - 72 * HOUR },
                { kg: 30, reps: 12, rating: 'potrivit', timestamp: NOW - 72 * HOUR },
              ],
            },
          ],
        },
      ] as never,
    });
  }

  it('without cardio, the recovered core group IS picked (baseline)', () => {
    seedCoreSession();
    const quote = getCoachTodayQuote();
    expect(quote).not.toBeNull();
    // The only recently-trained recovered group is core → it is the pick.
    expect(quote?.recoveredLabel).toBeTruthy();
  });

  it('a cardio class that eased core → core is NOT narrated as fresh (agrees with body-map)', () => {
    seedCoreSession();
    // A today aerobic class eases core (gradient 1.0) to 'partial' via
    // mergeAerobicRecovery — the SAME fold the body-map applies.
    useAerobicStore.setState({
      sessions: [{ date: '2026-06-17', type: 'aerobic', minutes: 45, kcal: 300, ts: NOW - 2 * HOUR }],
    });
    const quote = getCoachTodayQuote();
    // Core was the only trained group and it is now eased (partial), so the quote
    // does NOT fabricate a fresh/recovered core pick — it returns null (no other
    // recovered+recently-trained group exists).
    expect(quote).toBeNull();
  });
});
