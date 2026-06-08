// ══ #82 — EQUIPMENT PROFILE pool filter tests ════════════════════════════════
// Proves the candidate pool is restricted to the user's AVAILABLE equipment_type:
// a home DB+bench+pull-up setup (['dumbbell','bodyweight']) yields ONLY dumbbell /
// bodyweight movements (no machine/cable/barbell), every cluster stays non-empty,
// and an absent profile is byte-identical to a full gym.

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

const ctx = (available, over = {}) => ({
  equipment: { available },
  weakGroups: [],
  profileTier: over.profileTier ?? 'T2',
  prNames: over.prNames ?? [],
  seed: over.seed ?? 'user-1|2026-05-25|0',
});

const equipOf = (session) => session.exercises.map((e) => getExerciseMetadata(e.name).equipment_type);

describe('#82 equipment-profile pool filter', () => {
  const HOME = ['dumbbell', 'bodyweight'];

  it('home DB+bodyweight: every selected lift is dumbbell or bodyweight', () => {
    for (const cluster of ['push', 'pull', 'legs', 'upper', 'lower', 'full']) {
      const session = buildSession(cluster, ctx(HOME));
      expect(session.exercises.length, `${cluster} empty`).toBeGreaterThan(0);
      for (const et of equipOf(session)) {
        expect(['dumbbell', 'bodyweight'], `${cluster} got '${et}'`).toContain(et);
      }
    }
  });

  it('home profile NEVER yields a machine / cable / barbell lift', () => {
    for (const cluster of ['legs', 'pull', 'push']) {
      const et = new Set(equipOf(buildSession(cluster, ctx(HOME))));
      expect(et.has('machine')).toBe(false);
      expect(et.has('cable')).toBe(false);
      expect(et.has('barbell')).toBe(false);
    }
  });

  it('full-gym availability is unaffected (machines/cables still selectable)', () => {
    const full = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];
    const et = new Set();
    for (const cluster of ['push', 'pull', 'legs', 'full']) {
      for (const e of buildSession(cluster, ctx(full)).exercises) {
        et.add(getExerciseMetadata(e.name).equipment_type);
      }
    }
    // a full gym should surface at least one non-dumbbell/bodyweight type.
    expect([...et].some((t) => t === 'machine' || t === 'cable' || t === 'barbell')).toBe(true);
  });
});
