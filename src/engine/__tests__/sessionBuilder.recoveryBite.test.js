/**
 * M1 "make it bite" — the recovery STATE must VISIBLY reduce the session for a
 * non-recovered group, not just on the weekly budget.
 *
 * The weekly-budget cut (partial ×0.80, fatigued ×0.60) already lands upstream in
 * applyRecoveryToVolumeBudget; but buildSession's normal floors (compound 3,
 * isolation 2) absorbed that cut on a high-frequency day, so a fatigued quad day
 * could look identical to a fresh one. These tests pin the intended visible
 * behavior threaded via ctx.recoveryState (Big-11 RO → state):
 *
 *   recovered → UNCHANGED (most days, zero regression — byte-identical plan)
 *   partial   → that group's exercises take ~1 fewer set (floor 2)
 *   fatigued  → compound allowed down to 2 AND one exercise dropped (>1 in group),
 *               never to zero (≥2 sets, ≥1 exercise — a light touch, not skipped)
 *
 * This is NOT a stacked penalty: ctx.volumeTargets passed here ALREADY reflects
 * the upstream cut (fresh = uncut, partial = ×0.80, fatigued = ×0.60), exactly as
 * the adapter feeds it. The state only lets that same cut REACH the session.
 */

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

const ALL_EQUIP = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];

// Realistic leg-day weekly budget (sets/week per Big-11 EN) trained twice/week —
// quads land ~8 sets/session across 3 quad lifts on a fresh day (matches the
// "fresh ~8 sets / 3 ex" sanity anchor).
const WEEKLY = {
  quads: 16, hamstrings: 10, glutes: 10, calves: 8, chest: 14, back: 16,
  shoulders: 12, biceps: 9, triceps: 9, abs: 7, forearms: 5,
};
const FREQ = {
  'picioare-quads': 2, 'picioare-hamstrings': 2, fese: 2, gambe: 2,
};

const baseCtx = (over = {}) => ({
  equipment: { available: ALL_EQUIP },
  profileTier: 'T2',
  seed: 'recoveryBite-user|2026-06-02|0',
  volumeTargets: WEEKLY,
  weeklySessionsPerGroup: FREQ,
  ...over,
});

const groupOf = (name) => getExerciseMetadata(name).muscle_target_primary;
const totalSets = (s) => s.exercises.reduce((a, e) => a + e.sets, 0);
const groupExercises = (s, g) => s.exercises.filter((e) => groupOf(e.name) === g);
const groupSets = (s, g) => groupExercises(s, g).reduce((a, e) => a + e.sets, 0);

// The adapter cuts the WEEKLY budget upstream (×0.80 / ×0.60) BEFORE buildSession.
const cutQuads = (mult) => ({ ...WEEKLY, quads: WEEKLY.quads * mult });

const QUAD = 'picioare-quads';

describe('buildSession — recovery state bites the visible session (M1)', () => {
  it('fatigued quad day shows fewer SETS and fewer EXERCISES than the same fresh day', () => {
    const fresh = buildSession('legs', baseCtx());
    const fatigued = buildSession('legs', baseCtx({
      volumeTargets: cutQuads(0.6),
      recoveryState: { [QUAD]: 'fatigued' },
    }));

    // The quad group itself is visibly lighter: fewer sets AND fewer movements.
    expect(groupSets(fatigued, QUAD)).toBeLessThan(groupSets(fresh, QUAD));
    expect(groupExercises(fatigued, QUAD).length)
      .toBeLessThan(groupExercises(fresh, QUAD).length);
    // Whole session total is lower too (the cut reaches the plan).
    expect(totalSets(fatigued)).toBeLessThan(totalSets(fresh));
  });

  it('partial < fresh, fatigued < partial (monotonic by recovery state)', () => {
    const fresh = buildSession('legs', baseCtx());
    const partial = buildSession('legs', baseCtx({
      volumeTargets: cutQuads(0.8),
      recoveryState: { [QUAD]: 'partial' },
    }));
    const fatigued = buildSession('legs', baseCtx({
      volumeTargets: cutQuads(0.6),
      recoveryState: { [QUAD]: 'fatigued' },
    }));

    expect(groupSets(partial, QUAD)).toBeLessThan(groupSets(fresh, QUAD));
    expect(groupSets(fatigued, QUAD)).toBeLessThan(groupSets(partial, QUAD));
  });

  it('a fatigued group is never reduced to zero — still trains light (>=2 sets, >=1 exercise)', () => {
    const fatigued = buildSession('legs', baseCtx({
      volumeTargets: cutQuads(0.6),
      recoveryState: { [QUAD]: 'fatigued' },
    }));
    const quadEx = groupExercises(fatigued, QUAD);
    expect(quadEx.length).toBeGreaterThanOrEqual(1);
    for (const e of quadEx) expect(e.sets).toBeGreaterThanOrEqual(2);
  });

  it('all-recovered (recoveryState all "recovered") is byte-identical to no recoveryState', () => {
    const noState = buildSession('legs', baseCtx());
    const allRecovered = buildSession('legs', baseCtx({
      recoveryState: {
        [QUAD]: 'recovered', 'picioare-hamstrings': 'recovered',
        fese: 'recovered', gambe: 'recovered',
      },
    }));
    expect(allRecovered).toEqual(noState);
  });

  it('no recoveryState supplied → unchanged plan (pure-fn callers, graceful default)', () => {
    // Two runs with identical ctx and NO recoveryState must match — the new
    // field defaults to a no-op (most days / pure callers without M1 context).
    const a = buildSession('legs', baseCtx());
    const b = buildSession('legs', baseCtx());
    expect(a).toEqual(b);
    // And the recovered-only run above already proved adding all-'recovered'
    // changes nothing; here we also confirm sets stay in the normal [2,5] band.
    for (const e of a.exercises) {
      expect(e.sets).toBeGreaterThanOrEqual(2);
      expect(e.sets).toBeLessThanOrEqual(5);
    }
  });

  it('determinism: same state + seed → identical plan across runs', () => {
    const mk = () => buildSession('legs', baseCtx({
      volumeTargets: cutQuads(0.6),
      recoveryState: { [QUAD]: 'fatigued' },
    }));
    expect(mk()).toEqual(mk());
  });

  it('only the non-recovered group is touched — other groups keep their sets', () => {
    const fresh = buildSession('legs', baseCtx());
    const fatigued = buildSession('legs', baseCtx({
      volumeTargets: cutQuads(0.6),
      recoveryState: { [QUAD]: 'fatigued' },
    }));
    // hamstrings is recovered in both → its set count is unchanged.
    expect(groupSets(fatigued, 'picioare-hamstrings'))
      .toBe(groupSets(fresh, 'picioare-hamstrings'));
  });
});
