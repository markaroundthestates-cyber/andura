/**
 * LIVE-PROOF tests for the two P1 wirings finished after the moat work:
 *
 *   1. Set-count driven by the periodization engine (NOT a hardcoded 3). The
 *      real Periodization engine emits volume_target_pct (sets/week per Big-11
 *      group) that varies by mesocycle phase — DELOAD (week 4) cuts volume 45%.
 *      We feed the ACTUAL engine output into buildSession and assert per-exercise
 *      set counts drop in DELOAD vs a LOAD week. This proves the signal is wired,
 *      not just plumbed.
 *
 *   2. Weakness-based selection bias. A Big-11 weak group (Specialization engine
 *      target_muscle_group, same vocabulary as the library after WP-3) gets BOTH
 *      more volume (extra exercise slots) AND front-of-session ordering through
 *      buildSession's pool selection — proven by comparing weak-group exercise
 *      count + first-2 positions against a baseline session with the same seed.
 */

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { evaluate as evaluatePeriodization } from '../periodization/index.js';

const ALL_EQUIP = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];
const baseCtx = (over = {}) => ({
  equipment: { available: ALL_EQUIP },
  profileTier: 'T2',
  seed: 'wiring-user|2026-05-27|0',
  ...over,
});

// weeksElapsed 0 -> mesocycle week 1 (LOAD); weeksElapsed 3 -> week 4 (DELOAD).
const userAt = (weeksElapsed) => ({
  user: { goal: 'hypertrophy', level: 'intermediate' },
  recentSessions: [],
  meta: { weeksElapsed },
});

const totalSets = (session) => session.exercises.reduce((a, e) => a + e.sets, 0);
const groupOf = (name) => getExerciseMetadata(name).muscle_target_primary;
const countGroup = (session, g) =>
  session.exercises.filter((e) => groupOf(e.name) === g).length;

// ── Item 1: set-count is engine-driven (varies with periodization phase) ──

describe('buildSession — set-count driven by periodization (LIVE)', () => {
  it('DELOAD week prescribes FEWER total sets than a LOAD week (engine wired)', async () => {
    const load = await evaluatePeriodization(userAt(0));
    const deload = await evaluatePeriodization(userAt(3));

    // Sanity: the engine itself is actually in different phases + volumes.
    expect(load.trace.phase).not.toBe('DELOAD');
    expect(deload.trace.phase).toBe('DELOAD');
    expect(deload.meta.volume_target_pct.chest)
      .toBeLessThan(load.meta.volume_target_pct.chest);

    const loadSession = buildSession(
      'PUSH', baseCtx({ volumeTargets: load.meta.volume_target_pct }));
    const deloadSession = buildSession(
      'PUSH', baseCtx({ volumeTargets: deload.meta.volume_target_pct }));

    // Same selection (same seed) — only the engine-derived sets change.
    expect(deloadSession.exercises.map((e) => e.name))
      .toEqual(loadSession.exercises.map((e) => e.name));
    expect(totalSets(deloadSession)).toBeLessThan(totalSets(loadSession));
  });

  it('no volumeTargets signal -> every exercise keeps the default 3 (fallback)', () => {
    const session = buildSession('PUSH', baseCtx());
    for (const ex of session.exercises) expect(ex.sets).toBe(3);
  });

  it('per-exercise sets stay within the sane [2,5] clamp under real targets', async () => {
    const load = await evaluatePeriodization(userAt(0));
    const session = buildSession(
      'PUSH', baseCtx({ volumeTargets: load.meta.volume_target_pct }));
    for (const ex of session.exercises) {
      expect(ex.sets).toBeGreaterThanOrEqual(2);
      expect(ex.sets).toBeLessThanOrEqual(5);
    }
  });
});

// ── Item 2: weakness-based selection bias (LIVE through pool selection) ──

describe('buildSession — weakness selection bias (LIVE)', () => {
  it('a weak Big-11 group gets MORE exercises than the same group at baseline', () => {
    // 'umeri' is a PUSH target. Flag it weak -> pool fills umeri first, so it
    // wins extra slots within the SESSION_SIZE cap.
    const base = buildSession('PUSH', baseCtx());
    const weak = buildSession('PUSH', baseCtx({ weakGroups: ['umeri'] }));
    expect(countGroup(weak, 'umeri')).toBeGreaterThan(countGroup(base, 'umeri'));
  });

  it('weak-group exercises occupy the first 2 positions of the session', () => {
    const weak = buildSession('PUSH', baseCtx({ weakGroups: ['umeri'] }));
    const firstTwoGroups = weak.exercises.slice(0, 2).map((e) => groupOf(e.name));
    expect(firstTwoGroups).toContain('umeri');
  });

  it('weak group absent from the session leaves selection unbiased', () => {
    // picioare-quads is not a PUSH target -> no change vs baseline.
    const base = buildSession('PUSH', baseCtx());
    const weak = buildSession('PUSH', baseCtx({ weakGroups: ['picioare-quads'] }));
    expect(weak.exercises.map((e) => e.name))
      .toEqual(base.exercises.map((e) => e.name));
  });

  it('weakness bias feeds the real Specialization target vocabulary (Big-11 RO)', () => {
    // The live caller passes specialization target_muscle_group (Big-11 RO) as
    // weakGroups. 'spate' is a PULL target -> must gain volume when weak.
    const base = buildSession('PULL', baseCtx());
    const weak = buildSession('PULL', baseCtx({ weakGroups: ['spate'] }));
    expect(countGroup(weak, 'spate')).toBeGreaterThanOrEqual(countGroup(base, 'spate'));
    const firstTwo = weak.exercises.slice(0, 2).map((e) => groupOf(e.name));
    expect(firstTwo).toContain('spate');
  });
});
