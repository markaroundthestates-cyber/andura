// ══ ISOLATION-TIER GUARD (#42) — a core/calf isolation must not out-set a compound ══
//
// THE BUG CLASS this guards (_DIAG_session_composition_2026-06-08.md root cause #1):
// the set distributor keys on `tier === 1` for the compound band [3,5] and the
// order sort floats tier-1 first (sessionBuilder.js:186, :277-296, :904-907). Seven
// CORE_AUTO ISOLATIONS (4 core, 3 calf) were mis-tagged `tier:1 / force_demand:high`
// in exercises.json. In a single-exercise group (core/calves each contribute one
// slot to a leg day) the whole per-session budget routed to that one isolation →
// clamped to COMPOUND_MAX_SETS = 5, AND it sorted into the compound block ahead of
// real leg compounds. Repro (seed=2 legs): Hanging Leg Raise = 5 sets @ position 4,
// Leg Press Calf Raise = 5 sets @ position 3 — both ahead of Leg Press (3 sets).
//
// THE FIX (data): re-tier the 7 to `tier:2 / force_demand:medium` so they route
// through the isolation band [2,3] + the order tiebreak. After: 3 sets, ordered
// last on a legs day.
//
// WHAT THIS LOCKS:
//   (a) STATIC — the 7 named isolations are tier:2 / force_demand:medium in
//       exercises.json (a future re-tag back to tier:1 fails loudly).
//   (b) BEHAVIORAL — across a legs-day seed sweep, no core/calf isolation (by its
//       JSON tier:2) ever gets MORE sets than a same-session genuine compound
//       (JSON tier:1) of that day. This is the user-visible invariant ("a crunch
//       must not out-volume the squat/press/hinge").
//
// Deterministic + offline (a JSON read + a pure buildSession run, no API, no
// network). Lives in tests/engine/** → husky pre-commit + CI Unit Tests.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { buildSession } from '../../src/engine/sessionBuilder.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB = JSON.parse(
  readFileSync(resolve(__dirname, '../../src/engine/exercises.json'), 'utf8'),
);

// The 7 re-tiered isolations (4 core flexion/anti-extension, 3 calf raise).
const RETIERED_ISOLATIONS = [
  'Hanging Leg Raise',
  'Captains Chair Leg Raise',
  'Cable Crunch Kneeling',
  'Ab Wheel Rollout',
  'Standing Calf Raise Machine',
  'Smith Standing Calf Raise',
  'Leg Press Calf Raise',
];

describe('isolation-tier guard (#42) — re-tiered isolations stay tier-2', () => {
  // ── (a) STATIC: the data fix is intact ──────────────────────────────────────
  for (const name of RETIERED_ISOLATIONS) {
    it(`${name} is tier:2 / force_demand:medium (not a mis-tagged compound)`, () => {
      const e = LIB[name];
      expect(e, `${name} missing from exercises.json`).toBeTruthy();
      expect(e.tier).toBe(2);
      expect(e.force_demand).toBe('medium');
    });
  }

  // ── (b) BEHAVIORAL: a core/calf isolation never out-sets a same-day compound ──
  it('no core/calf isolation out-sets a same-session leg compound (12-seed legs sweep)', () => {
    // Trained advanced user, full equipment, realistic Israetel-ish weekly budget —
    // the exact ctx the diagnostic used to surface the inflation.
    const baseCtx = {
      equipment: {
        available: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'smith', 'ez-bar', 'trap-bar', 'band'],
      },
      profileTier: 'T2',
      prNames: [],
      weeklySessionsPerGroup: {
        'picioare-quads': 2, 'picioare-hamstrings': 2, fese: 2, gambe: 2, core: 2,
        spate: 2, biceps: 2, piept: 2, umeri: 2, triceps: 2,
      },
      volumeTargets: {
        chest: 16, back: 18, shoulders: 16, biceps: 14, triceps: 14,
        quads: 16, hamstrings: 14, glutes: 14, calves: 12, abs: 10,
      },
    };

    const isCoreCalfIsolation = (name) => {
      const e = LIB[name];
      return e && e.tier === 2 && ['core', 'gambe'].includes(e.muscle_target_primary);
    };
    const isLegCompound = (name) => {
      const e = LIB[name];
      return (
        e && e.tier === 1 &&
        ['picioare-quads', 'picioare-hamstrings', 'fese'].includes(e.muscle_target_primary)
      );
    };

    const violations = [];
    let isolationSeen = 0;
    let compoundSeen = 0;

    for (let i = 0; i < 12; i++) {
      const s = buildSession('legs', { ...baseCtx, seed: `guard42-${i}|2026-W02|0` });
      const exs = s.exercises;
      const isolations = exs.filter((e) => isCoreCalfIsolation(e.name));
      const compounds = exs.filter((e) => isLegCompound(e.name));
      isolationSeen += isolations.length;
      compoundSeen += compounds.length;
      if (compounds.length === 0) continue;
      const maxCompoundSets = Math.max(...compounds.map((c) => c.sets));
      for (const iso of isolations) {
        // An isolation must never exceed the day's heaviest compound's set count.
        if (iso.sets > maxCompoundSets) {
          violations.push(
            `seed=${i}: ${iso.name} ${iso.sets}set > max leg compound ${maxCompoundSets}set`,
          );
        }
      }
    }

    // The sweep must actually exercise both sides of the invariant (guard the guard).
    expect(isolationSeen, 'no core/calf isolation surfaced — sweep is not testing the fix').toBeGreaterThan(0);
    expect(compoundSeen, 'no leg compound surfaced — sweep is degenerate').toBeGreaterThan(0);
    expect(violations, violations.join('\n')).toEqual([]);
  });
});
