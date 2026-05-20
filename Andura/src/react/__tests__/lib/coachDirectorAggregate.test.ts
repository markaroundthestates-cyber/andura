// Phase 5 task_06 → Phase 6 task_06 — Option B enrich 8-field aggregate.
// Per DECISIONS.md §D027 cascade + Daniel "quality over speed" 2026-05-18.
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/engineWrappers', () => ({
  getReadiness: vi.fn(() => null),
  getFatigue: vi.fn(() => null),
  getTodayWorkout: vi.fn(async () => ({
    workoutTitle: 'Push (piept si umeri)',
    exerciseCount: 5,
    estimatedDuration: 50,
    intensityMod: 'normal' as const,
    volumeKg: 12450,
    exercises: [],
  })),
  getPatternsBanner: vi.fn(() => []),
  getProactiveAlerts: vi.fn(() => []),
}));

vi.mock('../../lib/prHistoryAggregate', () => ({
  getPRHistoryAll: vi.fn(() => []),
}));

import { getCoachToday } from '../../lib/coachDirectorAggregate';
import {
  getReadiness,
  getFatigue,
  getTodayWorkout,
  getPatternsBanner,
  getProactiveAlerts,
} from '../../lib/engineWrappers';
import { getPRHistoryAll } from '../../lib/prHistoryAggregate';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getReadiness).mockReturnValue(null);
  vi.mocked(getFatigue).mockReturnValue(null);
  vi.mocked(getTodayWorkout).mockResolvedValue({
    workoutTitle: 'Push (piept si umeri)',
    exerciseCount: 5,
    estimatedDuration: 50,
    intensityMod: 'normal' as const,
    volumeKg: 12450,
    exercises: [],
  });
  vi.mocked(getPatternsBanner).mockReturnValue([]);
  vi.mocked(getProactiveAlerts).mockReturnValue([]);
  vi.mocked(getPRHistoryAll).mockReturnValue([]);
});

describe('getCoachToday — Option B enrich 8-field aggregate', () => {
  it('returns 8 fields shape complete (readiness/fatigue/plannedWorkout/isRestDay/patternsBanner/prWallRecent/alerts/source)', async () => {
    const out = await getCoachToday();
    expect(out).toHaveProperty('readiness');
    expect(out).toHaveProperty('fatigue');
    expect(out).toHaveProperty('plannedWorkout');
    expect(out).toHaveProperty('isRestDay');
    expect(out).toHaveProperty('patternsBanner');
    expect(out).toHaveProperty('prWallRecent');
    expect(out).toHaveProperty('alerts');
    expect(out).toHaveProperty('source');
  });

  it('isRestDay=true cand plannedWorkout null', async () => {
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(null);
    const out = await getCoachToday();
    expect(out.isRestDay).toBe(true);
    expect(out.plannedWorkout).toBeNull();
  });

  it('isRestDay=false cand plannedWorkout prezent', async () => {
    const out = await getCoachToday();
    expect(out.isRestDay).toBe(false);
    expect(out.plannedWorkout?.workoutTitle).toBe('Push (piept si umeri)');
  });

  it('passes isInCut opts la getReadiness', async () => {
    await getCoachToday({ isInCut: true });
    expect(getReadiness).toHaveBeenCalledWith({ isInCut: true });
  });

  it('patternsBanner propagates din getPatternsBanner', async () => {
    vi.mocked(getPatternsBanner).mockReturnValueOnce([
      { id: 'STAGNATION', severity: 'warn', text: 'Stagnare 3 saptamani.' },
    ]);
    const out = await getCoachToday();
    expect(out.patternsBanner).toHaveLength(1);
    expect(out.patternsBanner[0]!.id).toBe('STAGNATION');
  });

  it('alerts propagates din getProactiveAlerts cu severity mapping', async () => {
    vi.mocked(getProactiveAlerts).mockReturnValueOnce([
      { id: 'protein_0', text: 'Proteine sub target', severity: 'warn' },
    ]);
    const out = await getCoachToday();
    expect(out.alerts).toHaveLength(1);
    expect(out.alerts[0]!.severity).toBe('warn');
  });

  it('prWallRecent slice top 3 sorted desc by sessionTs', async () => {
    vi.mocked(getPRHistoryAll).mockReturnValueOnce([
      { exerciseId: 'a', exerciseName: 'A', kg: 100, reps: 5, oneRMEstimate: 116, sessionTs: 1000, sessionTitle: 'S1' },
      { exerciseId: 'b', exerciseName: 'B', kg: 80,  reps: 8, oneRMEstimate: 101, sessionTs: 3000, sessionTitle: 'S3' },
      { exerciseId: 'c', exerciseName: 'C', kg: 60,  reps: 10, oneRMEstimate: 80, sessionTs: 2000, sessionTitle: 'S2' },
      { exerciseId: 'd', exerciseName: 'D', kg: 40,  reps: 12, oneRMEstimate: 56, sessionTs: 500,  sessionTitle: 'S0' },
    ]);
    const out = await getCoachToday();
    expect(out.prWallRecent).toHaveLength(3);
    expect(out.prWallRecent[0]!.sessionTs).toBe(3000);
    expect(out.prWallRecent[1]!.sessionTs).toBe(2000);
    expect(out.prWallRecent[2]!.sessionTs).toBe(1000);
  });

  it('prWallRecent empty cand getPRHistoryAll returns []', async () => {
    vi.mocked(getPRHistoryAll).mockReturnValueOnce([]);
    const out = await getCoachToday();
    expect(out.prWallRecent).toEqual([]);
  });

  it('source="engine" cand plannedWorkout prezent', async () => {
    const out = await getCoachToday();
    expect(out.source).toBe('engine');
  });

  it('source="baseline" cand all composers empty (T0 fresh)', async () => {
    vi.mocked(getReadiness).mockReturnValueOnce(null);
    vi.mocked(getFatigue).mockReturnValueOnce(null);
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(null);
    vi.mocked(getPatternsBanner).mockReturnValueOnce([]);
    vi.mocked(getProactiveAlerts).mockReturnValueOnce([]);
    vi.mocked(getPRHistoryAll).mockReturnValueOnce([]);
    const out = await getCoachToday();
    expect(out.source).toBe('baseline');
  });

  it('source="engine" cand patternsBanner non-empty (alone enough)', async () => {
    vi.mocked(getReadiness).mockReturnValueOnce(null);
    vi.mocked(getFatigue).mockReturnValueOnce(null);
    vi.mocked(getTodayWorkout).mockResolvedValueOnce(null);
    vi.mocked(getPatternsBanner).mockReturnValueOnce([
      { id: 'LOW_ADHERENCE', severity: 'info', text: 'Adherenta scazuta.' },
    ]);
    vi.mocked(getPRHistoryAll).mockReturnValueOnce([]);
    vi.mocked(getProactiveAlerts).mockReturnValueOnce([]);
    const out = await getCoachToday();
    expect(out.source).toBe('engine');
  });

  it('async signature: returns Promise<CoachTodayOutput>', () => {
    const result = getCoachToday();
    expect(result).toBeInstanceOf(Promise);
  });

  it('readiness/fatigue null când engines return null', async () => {
    vi.mocked(getReadiness).mockReturnValueOnce(null);
    vi.mocked(getFatigue).mockReturnValueOnce(null);
    const out = await getCoachToday();
    expect(out.readiness).toBeNull();
    expect(out.fatigue).toBeNull();
  });
});
