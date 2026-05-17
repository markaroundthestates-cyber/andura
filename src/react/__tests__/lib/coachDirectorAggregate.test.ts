// Phase 5 task_06 — coachDirectorAggregate thin composer tests.
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../lib/engineWrappers', () => ({
  getReadiness: vi.fn(() => null),
  getFatigue: vi.fn(() => null),
  getTodayWorkout: vi.fn(() => ({
    workoutTitle: 'Push (piept si umeri)',
    exerciseCount: 5,
    estimatedDuration: 50,
    intensityMod: 'normal',
    volumeKg: 12450,
    exercises: [],
  })),
}));

import { getCoachToday } from '../../lib/coachDirectorAggregate';
import { getReadiness, getFatigue, getTodayWorkout } from '../../lib/engineWrappers';

describe('getCoachToday — aggregate composer', () => {
  it('bundles readiness + fatigue + plannedWorkout în single output', () => {
    const out = getCoachToday();
    expect(out).toHaveProperty('readiness');
    expect(out).toHaveProperty('fatigue');
    expect(out).toHaveProperty('plannedWorkout');
    expect(out).toHaveProperty('isRestDay');
  });

  it('isRestDay=true cand plannedWorkout null', () => {
    vi.mocked(getTodayWorkout).mockReturnValueOnce(null);
    const out = getCoachToday();
    expect(out.isRestDay).toBe(true);
    expect(out.plannedWorkout).toBeNull();
  });

  it('isRestDay=false cand plannedWorkout prezent', () => {
    const out = getCoachToday();
    expect(out.isRestDay).toBe(false);
    expect(out.plannedWorkout?.workoutTitle).toBe('Push (piept si umeri)');
  });

  it('passes isInCut opts la getReadiness', () => {
    getCoachToday({ isInCut: true });
    expect(getReadiness).toHaveBeenCalledWith({ isInCut: true });
  });

  it('readiness null când engine returns null', () => {
    vi.mocked(getReadiness).mockReturnValueOnce(null);
    const out = getCoachToday();
    expect(out.readiness).toBeNull();
  });

  it('fatigue null când engine returns null', () => {
    vi.mocked(getFatigue).mockReturnValueOnce(null);
    const out = getCoachToday();
    expect(out.fatigue).toBeNull();
  });
});
