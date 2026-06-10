/**
 * Tests for sessionBuilder pure function + weakness ordering.
 *
 * WP-4 (P3 moat) rewrite: selection now pulls from the 657-entry exerciseLibrary
 * by muscle group, filters on COARSE equipment_type + tier, and is deterministic
 * (seeded). Tests below cover the new contract: determinism, PR-anchoring, tier
 * filtering, equipment-constrained pools, plus weakness ordering on Big-11 groups.
 *
 * Volume-driven program (2026-06-02): buildSession's first param is now a Big-6
 * CLUSTER id (push/pull/legs/upper/lower/full) whose target groups + slot bias
 * come from CLUSTER_BIG6_TO_BIG11_WEIGHT — replacing the old uppercase session-
 * type tags. The exercise count now falls out of the weekly volume budget
 * (volumeTargets + weeklySessionsPerGroup), clamped [4,8], so without a volume
 * signal it keeps the legacy ~6-exercise default.
 */

import { describe, it, expect } from 'vitest';
import { buildSession, prioritizeWeakGroups, movementKey } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { roundToEquipmentWeight } from '../../config/weights.js';

// Coarse equipment types (library equipment_type vocabulary).
const allEquip = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];
const ctx = (over = {}) => ({
  equipment: { available: over.available ?? allEquip },
  weakGroups: over.weakGroups ?? [],
  // Preserve an EXPLICIT null (the "conservative / no profile" case) — `??` would
  // coerce null → 'T2' and silently mask the null-tier skill gate. Only default
  // to T2 when the key is entirely absent.
  profileTier: 'profileTier' in over ? over.profileTier : 'T2',
  prNames: over.prNames ?? [],
  seed: over.seed ?? 'user-1|2026-05-25|0',
});

// ── buildSession — pure function, 657-pool selection ─────────────────────

describe('buildSession — pure function', () => {
  it('returns correct type field for the push cluster', () => {
    expect(buildSession('push', ctx()).type).toBe('push');
  });

  it('push cluster targets chest/shoulder/triceps groups', () => {
    const session = buildSession('push', ctx());
    const groups = session.exercises.map(
      (e) => getExerciseMetadata(e.name).muscle_target_primary,
    );
    for (const g of groups) {
      expect(['piept', 'umeri', 'triceps']).toContain(g);
    }
    expect(session.exercises.length).toBeGreaterThan(0);
  });

  it('pull cluster targets back/biceps/forearm groups only', () => {
    const session = buildSession('pull', ctx());
    const groups = session.exercises.map(
      (e) => getExerciseMetadata(e.name).muscle_target_primary,
    );
    for (const g of groups) {
      // pull cluster = spate (0.50) / biceps (0.30) / antebrate (0.20).
      expect(['spate', 'biceps', 'antebrate']).toContain(g);
    }
  });

  it('unknown cluster falls back to the full-body cluster targets', () => {
    const session = buildSession('UNKNOWN_TYPE', ctx());
    expect(session.type).toBe('UNKNOWN_TYPE');
    expect(session.exercises.length).toBeGreaterThan(0);
  });

  it('selects ~6 exercises with no volume signal (legacy default)', () => {
    // No volumeTargets in ctx → DEFAULT_SESSION_SIZE (6) preserved.
    expect(buildSession('push', ctx()).exercises.length).toBe(6);
    expect(buildSession('pull', ctx()).exercises.length).toBe(6);
  });

  it('each exercise has sets defaulting to 3', () => {
    for (const ex of buildSession('pull', ctx()).exercises) {
      expect(ex.sets).toBe(3);
    }
  });

  it('includes at least one T1 compound on the primary group', () => {
    const session = buildSession('push', ctx());
    const tiers = session.exercises.map((e) => getExerciseMetadata(e.name).tier);
    expect(tiers).toContain(1);
  });

  it('orders primary compounds before isolation (tier non-decreasing — bug #6)', () => {
    // Compounds lead, isolation follows: no tier-1 anchor appears after a higher
    // tier. (No weak group in ctx() -> prioritizeWeakGroups is a no-op, so the
    // tier ordering is the final order.)
    const tiers = buildSession('pull', ctx()).exercises.map(
      (e) => getExerciseMetadata(e.name).tier,
    );
    for (let i = 1; i < tiers.length; i++) {
      expect(tiers[i]).toBeGreaterThanOrEqual(tiers[i - 1]);
    }
  });

  // SQUAT primacy (D-squat-lead 2026-06-06) — the squat is the most systemic quad
  // pattern and must LEAD the leg day when fresh. Founder live 2026-06-06: the leg
  // day emitted Leg Press → RDL → squat (the squat landed 3rd, behind a machine
  // press). Both are tier-1 so D104's tier-sort can't order them; Leg Press won the
  // quad anchor only because it sits in the legacy ANCHOR_NAMES band while squats
  // sit in COMMON. Now a quads squat pattern outranks the machine Leg Press for the
  // anchor slot → leads the session — UNLESS the user has a Leg Press PR (continuity
  // wins, asserted below).
  it('a squat pattern LEADS the leg day over the machine Leg Press (no PR)', () => {
    // Full gym, no PR history → the quad anchor must be a squat pattern, not the
    // Leg Press, and it must be at position 0 (compounds lead, squat is the anchor).
    const s = buildSession('lower', {
      ...ctx({ available: ['machine', 'barbell', 'dumbbell', 'cable'] }),
      volumeTargets: { quads: 14, hamstrings: 12, glutes: 12, calves: 14, core: 8 },
      weeklySessionsPerGroup: {
        'picioare-quads': 2, 'picioare-hamstrings': 2, fese: 2, gambe: 2, core: 2,
      },
    });
    const names = s.exercises.map((e) => e.name);
    const first = s.exercises[0];
    const firstMeta = getExerciseMetadata(first.name);
    // The session leads with a quads squat pattern (movementKey ...::squat).
    expect(firstMeta.muscle_target_primary).toBe('picioare-quads');
    expect(movementKey(first.name, firstMeta)).toBe('picioare-quads::squat');
    // The squat appears strictly BEFORE the Leg Press when both are present.
    const squatIdx = s.exercises.findIndex(
      (e) => movementKey(e.name, getExerciseMetadata(e.name)) === 'picioare-quads::squat',
    );
    const legPressIdx = names.indexOf('Leg Press');
    if (legPressIdx !== -1) expect(squatIdx).toBeLessThan(legPressIdx);
  });

  it('Leg Press PR continuity still wins (squat primacy never breaks a logged lift)', () => {
    // A user who has logged Leg Press keeps it as their quad anchor (band-0 PR
    // continuity is absolute — squat primacy only reorders NON-PR candidates).
    const s = buildSession('lower', {
      ...ctx({ available: ['machine', 'barbell', 'dumbbell', 'cable'] }),
      prNames: ['Leg Press'],
      volumeTargets: { quads: 14, hamstrings: 12, glutes: 12, calves: 14, core: 8 },
      weeklySessionsPerGroup: {
        'picioare-quads': 2, 'picioare-hamstrings': 2, fese: 2, gambe: 2, core: 2,
      },
    });
    expect(s.exercises[0].name).toBe('Leg Press');
  });

  // F7 (Daniel live 2026-06-10) — a LEG-PRESS VARIANT must not slip in as an
  // accessory once 2 big lower lifts are present. His live Legs day composed
  // Squat + RDL and THEN a tier-2 "Wide-Stance Leg Press" as a 3rd big lift,
  // cold-started at ~80kg (vs his ~220 Leg Press history) — because isBigLower
  // keyed on tier===1 only and the stance variant is library tier 2. After F7 the
  // classification is movement-pattern based (leg-press token counts), so the cap
  // blocks the 3rd big lift. PR history on Squat + RDL pins the 2 big lifts.
  it('no leg-press-family VARIANT appears as a 3rd big lift after Squat + RDL', () => {
    const s = buildSession('legs', {
      ...ctx({
        available: ['machine', 'barbell', 'dumbbell', 'cable'],
        prNames: ['Barbell Back Squat (High Bar)', 'Romanian Deadlift'],
      }),
      danielTierSelect: true,
      volumeTargets: { quads: 14, hamstrings: 12, glutes: 12, calves: 14, core: 8 },
      weeklySessionsPerGroup: {
        'picioare-quads': 2, 'picioare-hamstrings': 2, fese: 2, gambe: 2, core: 2,
      },
      daysPerWeek: 4,
    });
    // At most 2 big lower lifts in the whole session (the cap).
    const LOWER_BIG = new Set(['picioare-quads', 'picioare-hamstrings']);
    const BIG_TOKENS = new Set(['squat', 'leg-press', 'lunge', 'deadlift', 'hip-thrust', 'good-morning']);
    const isBig = (name) => {
      const m = getExerciseMetadata(name);
      if (!LOWER_BIG.has(m?.muscle_target_primary)) return false;
      if (m?.tier === 1) return true;
      return BIG_TOKENS.has(movementKey(name, m).split('::')[1] ?? '');
    };
    const bigCount = s.exercises.filter((e) => isBig(e.name)).length;
    expect(bigCount).toBeLessThanOrEqual(2);
    // And specifically: NO leg-press movement appears (Squat + RDL already fill the
    // 2 big slots, so a leg-press variant — base OR stance — must be capped out).
    const legPressFamily = s.exercises.filter(
      (e) => (movementKey(e.name, getExerciseMetadata(e.name)).split('::')[1] ?? '') === 'leg-press',
    );
    expect(legPressFamily).toEqual([]);
  });

  // WP-4: missing equipment no longer DROPs to an empty session — bodyweight
  // is always available, so a session is still produced (clean seam for WP-5
  // substitution rather than a crash / empty list).
  it('missing ctx.equipment yields a bodyweight-only session (not empty)', () => {
    const session = buildSession('push', {});
    expect(session.type).toBe('push');
    expect(session.exercises.length).toBeGreaterThan(0);
    for (const ex of session.exercises) {
      expect(getExerciseMetadata(ex.name).equipment_type).toBe('bodyweight');
    }
  });

  // ── Volume-driven count (replaces the old fixed SESSION_SIZE=6) ──────────
  it('exercise count is volume-driven (varies with the weekly budget, not always 6)', () => {
    // A high weekly volume on every group of the cluster → count climbs above 6
    // (up to the [4,8] clamp). A low budget shrinks it below 6. Same seed →
    // selection identity stable; only the count moves with the budget.
    const high = buildSession('push', ctx({}));
    // attach a generous volume signal so the budget drives more slots.
    const ctxVol = (vt, freq) => ({ ...ctx(), volumeTargets: vt, weeklySessionsPerGroup: freq });
    const big = buildSession('push', ctxVol(
      { chest: 18, shoulders: 18, triceps: 18 }, { piept: 1, umeri: 1, triceps: 1 },
    ));
    const small = buildSession('push', ctxVol(
      { chest: 6, shoulders: 6, triceps: 6 }, { piept: 2, umeri: 2, triceps: 2 },
    ));
    expect(big.exercises.length).toBeGreaterThan(small.exercises.length);
    // Both within the sane [4,8] clamp.
    for (const s of [high, big, small]) {
      expect(s.exercises.length).toBeGreaterThanOrEqual(4);
      expect(s.exercises.length).toBeLessThanOrEqual(8);
    }
  });
});

// ── BUG 1 — compound-anchored set distribution ───────────────────────────
// Root cause: sets were split EVENLY across a group's exercises and the divisor
// was a hardcoded WEEKLY_FREQUENCY=2 (ignoring the real sessions/week). So a
// many-exercise compound group starved each lift to 2 while a single-exercise
// accessory group (one calf / one ab) collected the whole budget and clamped to
// 5 — accessories out-volumed compounds. Fix: distribute the group budget with
// the PRIMARY COMPOUND weighted higher, tier-scoped clamps, real frequency.
describe('buildSession — compound-anchored set distribution (BUG 1)', () => {
  // A realistic leg day with a periodization volume signal + real frequency.
  const legVolume = { quads: 12, hamstrings: 10, glutes: 10, calves: 8, abs: 6 };
  const legFreq = {
    'picioare-quads': 2, 'picioare-hamstrings': 2, 'fese': 2, 'gambe': 2, 'core': 2,
  };
  const legCtx = (over = {}) => ({
    ...ctx(over),
    volumeTargets: legVolume,
    weeklySessionsPerGroup: legFreq,
    prNames: over.prNames ?? ['Leg Press', 'Leg Extension', 'Leg Curl', 'Romanian Deadlift'],
  });
  const setsOf = (session, name) => session.exercises.find((e) => e.name === name)?.sets;
  const tierOf = (name) => getExerciseMetadata(name).tier;

  it('the primary compound out-volumes an isolation of the SAME group', () => {
    const s = buildSession('legs', legCtx());
    const legPress = setsOf(s, 'Leg Press'); // tier 1 quad compound
    const legExt = setsOf(s, 'Leg Extension'); // tier 2 quad isolation
    expect(legPress).toBeDefined();
    expect(legExt).toBeDefined();
    expect(legPress).toBeGreaterThan(legExt);
  });

  it('within EVERY group, no isolation carries more sets than a compound of that group', () => {
    for (let seed = 0; seed < 20; seed++) {
      const s = buildSession('legs', legCtx({ seed: `dist|${seed}` }));
      // bucket by group
      const byGroup = {};
      for (const e of s.exercises) {
        const g = getExerciseMetadata(e.name).muscle_target_primary;
        (byGroup[g] ||= []).push(e);
      }
      for (const exs of Object.values(byGroup)) {
        const compoundMax = Math.max(
          0, ...exs.filter((e) => tierOf(e.name) === 1).map((e) => e.sets),
        );
        const isoMax = Math.max(
          0, ...exs.filter((e) => tierOf(e.name) !== 1).map((e) => e.sets),
        );
        if (compoundMax > 0 && isoMax > 0) {
          expect(compoundMax).toBeGreaterThanOrEqual(isoMax);
        }
      }
    }
  });

  it('no single accessory exercise exceeds 4 sets (no 5-set tibialis/garhammer)', () => {
    for (let seed = 0; seed < 20; seed++) {
      const s = buildSession('legs', legCtx({ seed: `acc|${seed}` }));
      for (const e of s.exercises) {
        // isolation (tier 2/3) is the accessory band — capped at the isolation
        // ceiling; only a true tier-1 compound may go higher.
        if (tierOf(e.name) !== 1) {
          expect(e.sets).toBeLessThanOrEqual(3);
        }
      }
    }
  });

  it('a multi-exercise compound group is no longer starved to 2 sets each', () => {
    const s = buildSession('legs', legCtx());
    expect(setsOf(s, 'Leg Press')).toBeGreaterThanOrEqual(3);
  });

  it('uses the REAL per-group frequency, not a blind 2 (more sessions → fewer sets/session)', () => {
    // Same weekly volume, but trained 3x/week vs 1x/week → the 3x session must
    // carry fewer sets on the compound than the 1x session (budget / freq).
    const once = buildSession('legs', legCtx({ seed: 'freq' }));
    // override frequency: quads trained 1x vs 3x
    const oneX = buildSession('legs', {
      ...legCtx({ seed: 'freq' }),
      weeklySessionsPerGroup: { ...legFreq, 'picioare-quads': 1 },
    });
    const threeX = buildSession('legs', {
      ...legCtx({ seed: 'freq' }),
      weeklySessionsPerGroup: { ...legFreq, 'picioare-quads': 3 },
    });
    // 1x → bigger per-session budget → Leg Press at/above the 3x case.
    expect(setsOf(oneX, 'Leg Press')).toBeGreaterThanOrEqual(setsOf(threeX, 'Leg Press'));
    expect(setsOf(once, 'Leg Press')).toBeGreaterThan(0);
  });

  it('no volume signal → every exercise keeps the stable default of 3', () => {
    // (ctx has no volumeTargets) — the no-op fallback path is preserved.
    for (const ex of buildSession('legs', ctx()).exercises) {
      expect(ex.sets).toBe(3);
    }
  });
});

// ── Determinism — same user+day → same selection ─────────────────────────

describe('buildSession — determinism (PR identity)', () => {
  it('same seed → identical selection across calls', () => {
    const a = buildSession('push', ctx({ seed: 'u|d|0' }));
    const b = buildSession('push', ctx({ seed: 'u|d|0' }));
    expect(a.exercises).toEqual(b.exercises);
  });

  it('different seed → may differ but stays within target groups', () => {
    const a = buildSession('push', ctx({ seed: 'u|d|0' }));
    const b = buildSession('push', ctx({ seed: 'u|d|1' }));
    // Both valid PUSH sessions; identity stable per seed regardless of equality.
    for (const session of [a, b]) {
      for (const e of session.exercises) {
        expect(['piept', 'umeri', 'triceps']).toContain(
          getExerciseMetadata(e.name).muscle_target_primary,
        );
      }
    }
    expect(a.exercises.length).toBe(b.exercises.length);
  });
});

// ── PR-anchoring — known/logged names preferred when valid ───────────────

describe('buildSession — PR anchoring', () => {
  it('prefers known engine anchor names over arbitrary 657 names', () => {
    // With full equipment + advanced tier, the chest/shoulder/triceps anchors
    // (Incline DB Press, DB Shoulder Press, Lateral Raises, etc.) should win.
    const names = buildSession('push', ctx()).exercises.map((e) => e.name);
    const anchors = [
      'Incline DB Press', 'Flat DB Press', 'DB Shoulder Press',
      'Lateral Raises', 'Pushdown', 'Overhead Triceps',
    ];
    expect(names.some((n) => anchors.includes(n))).toBe(true);
  });

  it('a logged name (prNames) is preferred over equal-rank candidates', () => {
    // Cable Curl carries PR history → must appear in a PULL session that has a
    // biceps slot, ahead of other biceps isolation candidates.
    const names = buildSession(
      'pull',
      ctx({ prNames: ['Cable Curl'] }),
    ).exercises.map((e) => e.name);
    expect(names).toContain('Cable Curl');
  });

  it('a quad compound anchor leads a quad-targeting session', () => {
    // The legs session anchors on a tier-1 quad compound. Since the squat-primacy
    // fix (D-squat-lead 2026-06-06) the SQUAT pattern is the quad anchor (a more
    // systemic lift than the machine Leg Press), so it leads the session; the Leg
    // Press is an accessory that only fits in larger (volume-driven) sessions.
    const first = buildSession('legs', ctx()).exercises[0];
    const meta = getExerciseMetadata(first.name);
    expect(meta.muscle_target_primary).toBe('picioare-quads');
    expect(meta.tier).toBe(1);
    expect(movementKey(first.name, meta)).toBe('picioare-quads::squat');
  });
});

// ── BUG 2 — commonness bias (no esoteric picks for a normal user) ─────────
// Root cause: after PR (rank 0) + anchor (rank 1), the remaining 657 candidates
// were ordered by a SEEDED HASH = effectively random, so obscure variants
// (Garhammer Raise, "Stability Ball Stir the Pot", Cable Tibialis Raise, Cossack
// Squat, Fire Hydrant, Windshield Wiper) got picked over recognizable lifts. Fix:
// a curated COMMON band (rank 2) before the long tail (rank 3) — fills favor
// movements a normal gym-goer knows; obscure only when nothing common is left.
describe('buildSession — commonness bias (BUG 2)', () => {
  const TYPES = ['push', 'pull', 'legs', 'upper', 'lower', 'full'];
  // A clearly-esoteric subset present in the library (the reported offenders).
  const OBSCURE = new Set([
    'Garhammer Raise', 'Stability Ball Stir the Pot', 'Cable Tibialis Raise',
    'Cossack Squat', 'Fire Hydrant', 'Windshield Wiper', 'Body Saw Plank',
    'Wall Sit Static', 'Curtsy Lunge', 'Reverse Lunge Glute-Focus',
    'Single-Arm Cable Glute Kickback', 'Med Ball Slam',
  ]);

  it('a normal-tier user with no PR history never receives an obscure variant', () => {
    // Full equipment + advanced tier (the most permissive pool) — common
    // alternatives always exist for every group, so obscure must never surface.
    for (const type of TYPES) {
      for (let s = 0; s < 40; s++) {
        const session = buildSession(type, ctx({ prNames: [], seed: `common|${type}|${s}` }));
        for (const ex of session.exercises) {
          expect(OBSCURE.has(ex.name)).toBe(false);
        }
      }
    }
  });

  it('a normal session is composed of recognizable movements', () => {
    // The session should be dominated by anchor/common names, not long-tail.
    const session = buildSession('legs', ctx({ prNames: [], seed: 'recognizable' }));
    const recognizable = [
      'Leg Press', 'Barbell Back Squat (High Bar)', 'Barbell Back Squat (Low Bar)',
      'Front Squat', 'Hack Squat Machine', 'Goblet Squat', 'DB Squat',
      'Bulgarian Split Squat', 'Walking Lunge', 'Reverse Lunge', 'Leg Extension',
      'Leg Curl', 'Romanian Deadlift', 'Conventional Deadlift', 'Hip Thrust',
      'Barbell Glute Bridge', 'Hip Abduction Machine', 'Glute Kickback Machine',
      'Standing Calf Raise Machine', 'Seated Calf Raise Machine', 'Standing DB Calf Raise',
      'Standing Barbell Calf Raise', 'Reverse Crunch', 'Cable Crunch Kneeling',
      'Cable Crunch Standing', 'Hanging Leg Raise', 'Plank with Shoulder Tap',
      'Smith Machine Squat', '45-Degree Leg Press', '5x',
    ];
    const known = session.exercises.filter((e) => recognizable.includes(e.name));
    // At least the majority of the session is recognizable.
    expect(known.length).toBeGreaterThanOrEqual(
      Math.ceil(session.exercises.length * 0.6),
    );
  });

  it('an obscure variant only appears when no common alternative is available', () => {
    // Equipment pool reduced to band-only thins the common pool; even then a
    // common pick (where one survives the equipment gate) is preferred over the
    // long-tail hash order. Sanity: obscure picks remain rare under full equipment.
    let obscureCount = 0;
    let total = 0;
    for (const type of TYPES) {
      for (let s = 0; s < 20; s++) {
        const session = buildSession(type, ctx({ prNames: [], seed: `rare|${type}|${s}` }));
        for (const ex of session.exercises) {
          total += 1;
          if (OBSCURE.has(ex.name)) obscureCount += 1;
        }
      }
    }
    expect(total).toBeGreaterThan(0);
    expect(obscureCount).toBe(0);
  });

  it('PR continuity still wins over commonness (a logged obscure lift stays)', () => {
    // If a user has logged an unusual lift, continuity (rank 0) must still keep it
    // — the commonness band (rank 2) does NOT override PR history.
    const names = buildSession(
      'legs', ctx({ prNames: ['Cossack Squat'], seed: 'pr-obscure' }),
    ).exercises.map((e) => e.name);
    expect(names).toContain('Cossack Squat');
  });
});

// ── Tier filtering — persona / experience ────────────────────────────────

describe('buildSession — tier filtering', () => {
  it('T0 beginner never selects T3 accessories', () => {
    const session = buildSession('push', ctx({ profileTier: 'T0' }));
    for (const ex of session.exercises) {
      expect(getExerciseMetadata(ex.name).tier).toBeLessThanOrEqual(2);
    }
  });

  it('T2 advanced may include T3 isolation/accessory (T0 may not)', () => {
    // Under a constrained equipment pool (band-only) anchors thin out, so the
    // tier ceiling becomes observable: advanced reaches a T3 where beginner
    // stays capped at T2. Same seed → deterministic, comparable.
    const constrained = { available: ['band'], seed: 'tier-probe' };
    const advTiers = buildSession(
      'push', ctx({ ...constrained, profileTier: 'T2' }),
    ).exercises.map((e) => getExerciseMetadata(e.name).tier);
    const begTiers = buildSession(
      'push', ctx({ ...constrained, profileTier: 'T0' }),
    ).exercises.map((e) => getExerciseMetadata(e.name).tier);
    expect(advTiers).toContain(3);
    expect(Math.max(...begTiers)).toBeLessThanOrEqual(2);
  });

  it('null tier is conservative (no T3)', () => {
    const session = buildSession('push', ctx({ profileTier: null }));
    for (const ex of session.exercises) {
      expect(getExerciseMetadata(ex.name).tier).toBeLessThanOrEqual(2);
    }
  });
});

// ── Equipment-constrained pool ───────────────────────────────────────────

describe('buildSession — equipment-constrained pool', () => {
  it('dumbbell-only → every non-bodyweight pick is a dumbbell exercise', () => {
    const session = buildSession('push', ctx({ available: ['dumbbell'] }));
    for (const ex of session.exercises) {
      const type = getExerciseMetadata(ex.name).equipment_type;
      expect(['dumbbell', 'bodyweight']).toContain(type);
    }
  });

  it('cable removed → no cable exercise selected', () => {
    const avail = ['barbell', 'dumbbell', 'machine', 'band'];
    const session = buildSession('pull', ctx({ available: avail }));
    for (const ex of session.exercises) {
      expect(getExerciseMetadata(ex.name).equipment_type).not.toBe('cable');
    }
  });

  it('bodyweight is always allowed even when no equipment available', () => {
    const session = buildSession('push', ctx({ available: [] }));
    expect(session.exercises.length).toBeGreaterThan(0);
    for (const ex of session.exercises) {
      expect(getExerciseMetadata(ex.name).equipment_type).toBe('bodyweight');
    }
  });
});

// ── prioritizeWeakGroups — weakness ordering (Big-11 groups) ─────────────

describe('prioritizeWeakGroups — weakness ordering', () => {
  it('weak biceps → curls lead the isolation band but stay behind back compounds (compound-first)', () => {
    const exercises = [
      { name: 'Lat Pulldown', sets: 3 },   // spate  t1 compound
      { name: 'Cable Row', sets: 3 },       // spate  t1 compound
      { name: 'Rear Delt Fly', sets: 3 },   // umeri  t2 isolation (non-weak)
      { name: 'Cable Curl', sets: 3 },      // biceps t2 isolation (weak)
    ];
    const result = prioritizeWeakGroups(exercises, ['biceps']);
    const names = result.map((e) => e.name);
    // Compounds always first — a weak ISOLATION never pre-fatigues ahead of a
    // back compound (BUG #6 grip-fatigue rule).
    expect(names.slice(0, 2)).toEqual(['Lat Pulldown', 'Cable Row']);
    // The weak group still surfaces: its curl leads the accessory block, ahead
    // of the non-weak rear-delt isolation.
    expect(names.indexOf('Cable Curl')).toBeLessThan(names.indexOf('Rear Delt Fly'));
  });

  it('emphasized back keeps Chin-up/Pull-up (compounds) ahead of biceps isolations', () => {
    // The live 2026-06-09 Pull bug: a 4-compound back group dumped Chin-up +
    // Pull-up to the back, behind the curls. Compound-first must hold for ALL
    // of the emphasized group's compounds, not just its first two.
    const exercises = [
      { name: 'Lat Pulldown', sets: 3 }, // spate t1
      { name: 'Cable Row', sets: 3 },    // spate t1
      { name: 'Chin-up', sets: 3 },      // spate t1
      { name: 'Pull-up', sets: 3 },      // spate t1
      { name: 'Cable Curl', sets: 3 },   // biceps t2
      { name: 'Hammer Curl', sets: 3 },  // biceps t2
    ];
    const names = prioritizeWeakGroups(exercises, ['spate']).map((e) => e.name);
    expect(names.indexOf('Chin-up')).toBeLessThan(names.indexOf('Cable Curl'));
    expect(names.indexOf('Pull-up')).toBeLessThan(names.indexOf('Cable Curl'));
  });

  it('does NOT add exercises not in the original list', () => {
    const exercises = [
      { name: 'Lat Pulldown', sets: 3 },
      { name: 'Cable Row', sets: 3 },
    ];
    const result = prioritizeWeakGroups(exercises, ['biceps']);
    expect(result).toHaveLength(2);
    const names = result.map((e) => e.name);
    expect(names).toEqual(expect.arrayContaining(['Lat Pulldown', 'Cable Row']));
  });

  it('preserves original ordering when weak group not in session', () => {
    const exercises = [
      { name: 'Lat Pulldown', sets: 3 },
      { name: 'Cable Curl', sets: 3 },
      { name: 'Cable Row', sets: 3 },
    ];
    // picioare-quads not present in this PULL session
    const result = prioritizeWeakGroups(exercises, ['picioare-quads']);
    const names = result.map((e) => e.name);
    expect(names).toEqual(['Lat Pulldown', 'Cable Curl', 'Cable Row']);
  });

  it('total exercise count does not change after reordering', () => {
    const exercises = [
      { name: 'Lat Pulldown', sets: 3 },
      { name: 'Cable Row', sets: 3 },
      { name: 'Cable Curl', sets: 3 },
      { name: 'Hammer Curl', sets: 3 },
      { name: 'Incline DB Curl', sets: 3 },
    ];
    const result = prioritizeWeakGroups(exercises, ['biceps']);
    expect(result).toHaveLength(exercises.length);
  });
});

// ── Skill-level capability gate (Daniel bug 2026-05-31) ──────────────────────
// A beginner must NEVER be prescribed an advanced movement (one-arm push-up,
// pistol, archer, nordic, weighted calisthenics, single-leg lower body, etc.).
// poolForGroup now rejects entries above skillCeiling(profileTier):
//   T0 -> beginner only · T1 -> up to intermediate · T2+ -> advanced allowed.

describe('buildSession — skill capability gate', () => {
  const TYPES = ['push', 'pull', 'legs', 'upper', 'lower', 'full'];

  it('T0 beginner NEVER receives an advanced movement (all session types, many seeds)', () => {
    for (const type of TYPES) {
      for (let s = 0; s < 12; s++) {
        const session = buildSession(type, ctx({ profileTier: 'T0', seed: `t0|${type}|${s}` }));
        for (const ex of session.exercises) {
          const lvl = getExerciseMetadata(ex.name).skill_level ?? 'beginner';
          expect(lvl).toBe('beginner');
        }
      }
    }
  });

  it('null/unknown tier is conservative (beginner-only, no advanced)', () => {
    for (const type of TYPES) {
      const session = buildSession(type, ctx({ profileTier: null, seed: `null|${type}` }));
      for (const ex of session.exercises) {
        const lvl = getExerciseMetadata(ex.name).skill_level ?? 'beginner';
        expect(lvl).toBe('beginner');
      }
    }
  });

  it('T1 intermediate may reach intermediate but NEVER advanced', () => {
    for (const type of TYPES) {
      for (let s = 0; s < 12; s++) {
        const session = buildSession(type, ctx({ profileTier: 'T1', seed: `t1|${type}|${s}` }));
        for (const ex of session.exercises) {
          const lvl = getExerciseMetadata(ex.name).skill_level ?? 'beginner';
          expect(lvl).not.toBe('advanced');
        }
      }
    }
  });

  it('T2 advanced CAN include an advanced movement that T0 is denied (same seed)', () => {
    // Constrain the pool so advanced entries become observable: bodyweight-only
    // thins anchor/isolation candidates, surfacing advanced calisthenics for T2
    // where T0 stays capped at beginner. Scan types+seeds for one witness.
    let found = false;
    outer: for (const type of TYPES) {
      for (let s = 0; s < 30; s++) {
        const seed = `cap|${type}|${s}`;
        const adv = buildSession(type, ctx({ available: [], profileTier: 'T2', seed }));
        const beg = buildSession(type, ctx({ available: [], profileTier: 'T0', seed }));
        const advHasAdvanced = adv.exercises.some(
          (e) => getExerciseMetadata(e.name).skill_level === 'advanced',
        );
        const begHasAdvanced = beg.exercises.some(
          (e) => getExerciseMetadata(e.name).skill_level === 'advanced',
        );
        expect(begHasAdvanced).toBe(false); // the guarantee: T0 NEVER advanced
        if (advHasAdvanced) { found = true; break outer; }
      }
    }
    expect(found).toBe(true); // T2 demonstrably unlocks at least one advanced pick
  });
});

// ── BUG 5 — movement-aware dedup (no two same-movement variants per plan) ──
// Root cause: the builder deduped by EXACT NAME, so two chest-fly variants
// (different names, same movement) could co-exist (user got a chest fly twice).
describe('movementKey — movement-pattern identity', () => {
  it('collapses chest-fly variants onto the same movement key', () => {
    const cable = movementKey('Cable Fly', getExerciseMetadata('Cable Fly'));
    const db = movementKey('DB Fly', getExerciseMetadata('DB Fly'));
    const incline = movementKey('Incline DB Fly', getExerciseMetadata('Incline DB Fly'));
    expect(cable).toBe(db);
    expect(cable).toBe(incline);
  });

  it('keeps DIFFERENT movements on the same muscle distinct (fly vs press)', () => {
    const fly = movementKey('Cable Fly', getExerciseMetadata('Cable Fly'));
    const press = movementKey('Flat DB Press', getExerciseMetadata('Flat DB Press'));
    expect(fly).not.toBe(press);
  });

  it('does NOT collapse Lat Pulldown with a generic Pull (specific token wins)', () => {
    const pulldown = movementKey('Lat Pulldown', getExerciseMetadata('Lat Pulldown'));
    expect(pulldown).toContain('pulldown');
  });

  it('unrecognized name falls back to a name-unique key (no over-dedup)', () => {
    const a = movementKey('Zzz Mystery Move', { muscle_target_primary: 'piept' });
    const b = movementKey('Qqq Mystery Move', { muscle_target_primary: 'piept' });
    expect(a).not.toBe(b);
  });

  it('keeps incline press distinct from flat press (audit HG-01 — flat+incline pairing)', () => {
    const incline = movementKey('Incline DB Press', { muscle_target_primary: 'piept' });
    const flat = movementKey('Flat DB Press', { muscle_target_primary: 'piept' });
    expect(incline).not.toBe(flat);
    expect(incline).toBe('piept::incline-press');
    expect(flat).toBe('piept::press');
  });

  it('incline qualifier is scoped to press only — an incline curl stays a curl', () => {
    const inclineCurl = movementKey('Incline DB Curl', { muscle_target_primary: 'biceps' });
    const plainCurl = movementKey('DB Curl Standing', { muscle_target_primary: 'biceps' });
    expect(inclineCurl).toContain('curl');
    expect(inclineCurl).not.toContain('press');
    // An incline curl is the same straight-curl movement as a standing DB curl.
    expect(inclineCurl).toBe(plainCurl);
  });

  it('hammer curl is a DISTINCT movement from a straight curl (brachialis vs biceps, Wave 2)', () => {
    // Wave 2: the CORE library treats hammer (brachialis_brachioradialis) and
    // straight (elbow_flexion) curls as different patterns, so a session can pair
    // a curl + a hammer (and the CORE biceps pool fills two real movements).
    const hammer = movementKey('DB Hammer Curl Standing', { muscle_target_primary: 'biceps' });
    const straight = movementKey('DB Curl Standing', { muscle_target_primary: 'biceps' });
    expect(hammer).not.toBe(straight);
    expect(hammer).toBe('biceps::hammer-curl');
  });

  it('iso-lateral ROW keys as a row, not a lateral-raise (audit MD-01)', () => {
    const key = movementKey('Hammer Strength Iso-Lateral High Row', { muscle_target_primary: 'spate' });
    expect(key).toBe('spate::row');
  });

  it('OHP variants collapse onto the vertical-press key (dedup vs a shoulder press)', () => {
    // An OHP name without the word "press" (e.g. "Smith OHP") used to fall back to
    // a name-unique key and escape dedup, so a Smith OHP + a Machine Shoulder Press
    // could both land in one session (two vertical presses). They must share key.
    const smithOhp = movementKey('Smith OHP', getExerciseMetadata('Smith OHP'));
    const machinePress = movementKey('Machine Shoulder Press', getExerciseMetadata('Machine Shoulder Press'));
    const ohp = movementKey('OHP', getExerciseMetadata('OHP'));
    expect(smithOhp).toBe('umeri::press');
    expect(smithOhp).toBe(machinePress);
    expect(ohp).toBe(machinePress);
  });
});

describe('equipment snapping — barbell stack (audit CR-01)', () => {
  it('Flat Barbell Bench snaps onto the barbell stack, not capped at 80kg', () => {
    // Pre-fix this fell back to bailib_stack (max 80) and silently capped a
    // 100kg bench at 80. The barbell stack carries 100 exactly.
    expect(roundToEquipmentWeight(100, 'Flat Barbell Bench')).toBe(100);
    expect(roundToEquipmentWeight(95, 'Flat Barbell Bench')).toBe(95);
  });
});

describe('buildSession — BUG 5 movement dedup', () => {
  const TYPES = ['push', 'pull', 'legs', 'upper', 'lower', 'full'];

  it('never selects two exercises of the same movement (all types, many seeds)', () => {
    for (const type of TYPES) {
      for (let s = 0; s < 60; s++) {
        const session = buildSession(type, ctx({ seed: `bug5|${type}|${s}` }));
        const keys = session.exercises.map(
          (e) => movementKey(e.name, getExerciseMetadata(e.name)),
        );
        expect(new Set(keys).size).toBe(keys.length);
      }
    }
  });

  it('never selects two distinct CHEST-fly variants in one PUSH plan', () => {
    // Scoped to the chest (piept) muscle: a chest fly + a rear-delt fly (umeri)
    // are legitimately DIFFERENT movements, so we count only same-muscle flyes.
    for (let s = 0; s < 60; s++) {
      const session = buildSession('push', ctx({ seed: `bug5-fly|${s}` }));
      const chestFlyes = session.exercises.filter(
        (e) =>
          /fly/i.test(e.name) &&
          getExerciseMetadata(e.name).muscle_target_primary === 'piept',
      );
      expect(chestFlyes.length).toBeLessThanOrEqual(1);
    }
  });
});
