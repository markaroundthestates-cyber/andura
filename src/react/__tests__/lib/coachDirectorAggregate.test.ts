// Phase 5 task_06 — coachDirectorAggregate thin composer tests.
// Phase 6 task_02 Option C — async getCoachToday signature per
// DECISIONS.md §D027 (await getTodayWorkout pipeline).
import { describe, it, expect, vi } from 'vitest';

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
}));

import { getCoachToday } from '../../lib/coachDirectorAggregate';
import { getReadiness, getFatigue, getTodayWorkout } from '../../lib/engineWrappers';

describe('getCoachToday — aggregate composer', () => {
  it('bundles readiness + fatigue + plannedWorkout în single output', async () => {
    const out = await getCoachToday();
    expect(out).toHaveProperty('readiness');
    expect(out).toHaveProperty('fatigue');
    expect(out).toHaveProperty('plannedWorkout');
    expect(out).toHaveProperty('isRestDay');
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

  it('readiness null când engine returns null', async () => {
    vi.mocked(getReadiness).mockReturnValueOnce(null);
    const out = await getCoachToday();
    expect(out.readiness).toBeNull();
  });

  it('fatigue null când engine returns null', async () => {
    vi.mocked(getFatigue).mockReturnValueOnce(null);
    const out = await getCoachToday();
    expect(out.fatigue).toBeNull();
  });
});
