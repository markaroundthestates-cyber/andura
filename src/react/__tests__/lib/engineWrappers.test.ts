// ══ ENGINE WRAPPERS TESTS — Pure-Function Adapters ═══════════════════════
// Per spec task_03 §4 A — vi.mock engine modules + verify wrapper interface.

import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import {
  getReadiness,
  getFatigue,
  getPRDelta,
  getTodayWorkout,
} from '../../lib/engineWrappers';
import { getComputedReadinessScore, getReadinessVerdict } from '../../../engine/readiness.js';
import { calculateFatigueScore } from '../../../engine/fatigue.js';
import { detectPR } from '../../../engine/prEngine.js';

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

  it('passes isInCut opts la verdict', () => {
    vi.mocked(getComputedReadinessScore).mockReturnValue(75);
    vi.mocked(getReadinessVerdict).mockReturnValue({
      label: 'Sesiune normala',
      color: 'var(--accent)',
      volumeMultiplier: 1.0,
      canPR: false,
    });
    getReadiness({ isInCut: true });
    expect(getReadinessVerdict).toHaveBeenCalledWith(75, { isInCut: true });
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

  it('returns weight PR daca engine detects', () => {
    vi.mocked(detectPR).mockReturnValue({
      type: 'weight',
      kg: 100,
      reps: 5,
      prevBest: { ex: 'Bench', w: 95, reps: 5 },
    });
    const r = getPRDelta('Bench', { w: 100, reps: 5 }, []);
    expect(r?.type).toBe('weight');
    expect(r?.kg).toBe(100);
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
});

describe('engineWrappers — getTodayWorkout (Phase 4 task_10 wire)', () => {
  it('returns planned workout aggregate (Phase 4 demo Push session)', () => {
    const w = getTodayWorkout();
    expect(w).not.toBeNull();
    expect(w?.workoutTitle).toBe('Push (piept si umeri)');
    expect(w?.exerciseCount).toBe(5);
    expect(w?.estimatedDuration).toBe(50);
    expect(w?.intensityMod).toBe('normal');
    expect(w?.volumeKg).toBe(12450);
  });

  it('returns exercises array cu PlannedExercise shape (5 items)', () => {
    const w = getTodayWorkout();
    expect(w?.exercises).toHaveLength(5);
    expect(w?.exercises[0]).toEqual({
      id: 'bench-press',
      name: 'Bench Press',
      sets: 4,
      targetReps: 10,
      targetKg: 22.5,
      restSec: 90,
    });
  });

  it('exerciseCount matches exercises.length', () => {
    const w = getTodayWorkout();
    expect(w?.exerciseCount).toBe(w?.exercises.length);
  });

  it('all exercises have required PlannedExercise fields', () => {
    const w = getTodayWorkout();
    w?.exercises.forEach((ex) => {
      expect(typeof ex.id).toBe('string');
      expect(typeof ex.name).toBe('string');
      expect(typeof ex.sets).toBe('number');
      expect(typeof ex.targetReps).toBe('number');
      expect(typeof ex.targetKg).toBe('number');
      expect(typeof ex.restSec).toBe('number');
    });
  });

  it('volumeKg is sum of approximation sets * reps * kg (Phase 4 estimate)', () => {
    const w = getTodayWorkout();
    expect(w?.volumeKg).toBeGreaterThan(0);
    expect(typeof w?.volumeKg).toBe('number');
  });
});
