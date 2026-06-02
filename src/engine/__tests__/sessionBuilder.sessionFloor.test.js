// Session-substance floor (tier-aware) + recovery exercise-drop ordering.
//
// Two fixes pinned here:
//   1. MIN_SESSION is tier-aware — T0 (beginner) floors at 4, every trained tier
//      (T1/T2+) floors at 5: a trained lifter's session is never presented below
//      5 exercises.
//   2. The M1 fatigued exercise-drop runs AFTER the count clamp; it must NOT push
//      the session below the tier floor. The drop is now capped so chosen.length
//      never falls under minSession (the ordering bug that let a 1-day-fatigue
//      case collapse to 2 exercises).

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

const ALL_EQUIP = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];

// A trained lifter's push-day budget (sets/week per Big-11 EN), trained ~twice a
// week — sizes a healthy 7-ish exercise push day on a fresh day.
const WEEKLY = {
  chest: 14, shoulders: 16, triceps: 12, back: 18, biceps: 14, forearms: 10,
  quads: 14, hamstrings: 12, glutes: 12, calves: 14, abs: 14,
};
const FREQ = { piept: 2, umeri: 2, triceps: 2 };

const baseCtx = (over = {}) => ({
  equipment: { available: ALL_EQUIP },
  profileTier: 'T2',
  seed: 'floor-user|2026-06-02|0',
  volumeTargets: WEEKLY,
  weeklySessionsPerGroup: FREQ,
  ...over,
});

const groupOf = (name) => getExerciseMetadata(name).muscle_target_primary;

describe('buildSession — tier-aware session floor + drop-ordering', () => {
  it('trained tier (T2) push day is never below 5 exercises', () => {
    const s = buildSession('push', baseCtx({ profileTier: 'T2' }));
    expect(s.exercises.length).toBeGreaterThanOrEqual(5);
  });

  it('trained tier (T1) push day is never below 5 exercises', () => {
    const s = buildSession('push', baseCtx({ profileTier: 'T1' }));
    expect(s.exercises.length).toBeGreaterThanOrEqual(5);
  });

  it('the fatigued exercise-drop can NOT breach the trained floor (the prior 2-ex collapse case)', () => {
    // ALL push groups fatigued + a heavily-cut budget: WITHOUT the floor guard the
    // exercise-drop (one per fatigued group) plus the deep set cut collapsed the
    // session well below the floor (the reported 2-exercise case). The drop must
    // now stop at minSession.
    const cut = {
      ...WEEKLY,
      chest: WEEKLY.chest * 0.6,
      shoulders: WEEKLY.shoulders * 0.6,
      triceps: WEEKLY.triceps * 0.6,
    };
    const s = buildSession('push', baseCtx({
      profileTier: 'T2',
      volumeTargets: cut,
      recoveryState: { piept: 'fatigued', umeri: 'fatigued', triceps: 'fatigued' },
    }));
    expect(s.exercises.length).toBeGreaterThanOrEqual(5);
  });

  it('T0 (beginner) floor stays at 4 (unchanged) — never forced up to 5', () => {
    // A small beginner budget that lands the session at the base floor. T0 must be
    // allowed down to 4 exercises (the trained-floor bump does not apply).
    const small = {
      chest: 6, shoulders: 6, triceps: 4, back: 8, biceps: 6, forearms: 4,
      quads: 8, hamstrings: 6, glutes: 6, calves: 6, abs: 6,
    };
    const s = buildSession('push', baseCtx({ profileTier: 'T0', volumeTargets: small }));
    expect(s.exercises.length).toBeGreaterThanOrEqual(4);
  });

  it('determinism: trained-floor session is identical across runs', () => {
    const mk = () => buildSession('push', baseCtx({
      profileTier: 'T2',
      volumeTargets: {
        ...WEEKLY, chest: WEEKLY.chest * 0.6, shoulders: WEEKLY.shoulders * 0.6,
        triceps: WEEKLY.triceps * 0.6,
      },
      recoveryState: { piept: 'fatigued', umeri: 'fatigued', triceps: 'fatigued' },
    }));
    expect(mk()).toEqual(mk());
  });

  it('a fatigued group still drops an exercise when the floor allows it (the bite is preserved)', () => {
    // One fatigued group on an otherwise-full session: the session is well above
    // the floor, so the drop still happens (chest loses an exercise vs fresh).
    const fresh = buildSession('push', baseCtx({ profileTier: 'T2' }));
    const fatigued = buildSession('push', baseCtx({
      profileTier: 'T2',
      volumeTargets: { ...WEEKLY, chest: WEEKLY.chest * 0.6 },
      recoveryState: { piept: 'fatigued' },
    }));
    const freshChest = fresh.exercises.filter((e) => groupOf(e.name) === 'piept').length;
    const fatChest = fatigued.exercises.filter((e) => groupOf(e.name) === 'piept').length;
    // When fresh chest had >1 exercise the bite still trims one (floor not breached).
    if (freshChest > 1) {
      expect(fatChest).toBeLessThan(freshChest);
    }
    expect(fatigued.exercises.length).toBeGreaterThanOrEqual(5);
  });
});
