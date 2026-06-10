/**
 * #R6a upper-day biceps guarantee (Daniel coach audit 2026-06-10: "ziua Upper nu
 * are biceps"). The `upper` cluster weights biceps 0.15 — on a small session the
 * slot share rounds biceps out entirely (his real 8-exercise Upper day landed
 * chest+back+shoulders+triceps but NO biceps). With ctx.bicepsGuarantee
 * (dp_biceps_guarantee_v1) a cluster that TRAINS biceps must include >=1 biceps
 * movement; if none landed, one is injected (add if room, else replace the
 * lowest-priority non-anchor isolation). OFF → never injects → byte-identical.
 */

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

const allEquip = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];

// Biceps gets a small weekly budget so its low upper-cluster slot share rounds
// out, exercising the inject path; the other groups carry the session.
const VOLUME = {
  chest: 12, back: 14, shoulders: 12, biceps: 4, triceps: 10,
  quads: 10, hamstrings: 8, glutes: 6, calves: 6, abs: 4, forearms: 2,
};
const SESSIONS_PER_GROUP = {
  piept: 1, spate: 1, umeri: 1, biceps: 1, triceps: 1,
  'picioare-quads': 1, 'picioare-hamstrings': 1, fese: 1, gambe: 1, core: 1, antebrate: 1,
};

const ctx = (over = {}) => ({
  equipment: { available: allEquip },
  weakGroups: [],
  profileTier: 'T2',
  prNames: [],
  seed: 'user-1|2026-06-10|0',
  volumeTargets: VOLUME,
  weeklySessionsPerGroup: SESSIONS_PER_GROUP,
  ...over,
});

const isBiceps = (name) => getExerciseMetadata(name)?.muscle_target_primary === 'biceps';
const bicepsCount = (s) => s.exercises.filter((e) => isBiceps(e.name)).length;

describe('R6a — upper-day biceps guarantee (ctx.bicepsGuarantee)', () => {
  it('OFF → deterministic (control arm)', () => {
    const off1 = buildSession('upper', ctx({ bicepsGuarantee: false }));
    const off2 = buildSession('upper', ctx({ bicepsGuarantee: false }));
    expect(off1).toEqual(off2);
  });

  it('ON → an upper session ALWAYS includes at least one biceps movement', () => {
    const on = buildSession('upper', ctx({ bicepsGuarantee: true }));
    expect(bicepsCount(on)).toBeGreaterThanOrEqual(1);
  });

  it('ON ⊇ OFF → the guarantee never removes biceps, only ensures presence', () => {
    const off = buildSession('upper', ctx({ bicepsGuarantee: false }));
    const on = buildSession('upper', ctx({ bicepsGuarantee: true }));
    expect(bicepsCount(on)).toBeGreaterThanOrEqual(bicepsCount(off));
    expect(bicepsCount(on)).toBeGreaterThanOrEqual(1);
  });

  it('ON on a cluster that does NOT train biceps (legs) → no-op, byte-identical', () => {
    const off = buildSession('legs', ctx({ bicepsGuarantee: false }));
    const on = buildSession('legs', ctx({ bicepsGuarantee: true }));
    expect(on).toEqual(off);
  });
});
