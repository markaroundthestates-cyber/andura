/**
 * Tests for sessionBuilder pure function + weakness ordering.
 *
 * WP-4 (P3 moat) rewrite: selection now pulls from the 657-entry exerciseLibrary
 * by muscle group, filters on COARSE equipment_type + tier, and is deterministic
 * (seeded). Tests below cover the new contract: determinism, PR-anchoring, tier
 * filtering, equipment-constrained pools, plus weakness ordering on Big-11 groups.
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
  profileTier: over.profileTier ?? 'T2',
  prNames: over.prNames ?? [],
  seed: over.seed ?? 'user-1|2026-05-25|0',
});

// ── buildSession — pure function, 657-pool selection ─────────────────────

describe('buildSession — pure function', () => {
  it('returns correct type field for PUSH', () => {
    expect(buildSession('PUSH', ctx()).type).toBe('PUSH');
  });

  it('PUSH session targets chest/shoulder/triceps groups', () => {
    const session = buildSession('PUSH', ctx());
    const groups = session.exercises.map(
      (e) => getExerciseMetadata(e.name).muscle_target_primary,
    );
    for (const g of groups) {
      expect(['piept', 'umeri', 'triceps']).toContain(g);
    }
    expect(session.exercises.length).toBeGreaterThan(0);
  });

  it('PULL session targets back/biceps groups only', () => {
    const session = buildSession('PULL', ctx());
    const groups = session.exercises.map(
      (e) => getExerciseMetadata(e.name).muscle_target_primary,
    );
    for (const g of groups) {
      expect(['spate', 'biceps']).toContain(g);
    }
  });

  it('unknown type falls back to FULL_UPPER targets', () => {
    const session = buildSession('UNKNOWN_TYPE', ctx());
    expect(session.type).toBe('UNKNOWN_TYPE');
    expect(session.exercises.length).toBeGreaterThan(0);
  });

  it('selects ~6 exercises per session', () => {
    expect(buildSession('PUSH', ctx()).exercises.length).toBe(6);
    expect(buildSession('PULL', ctx()).exercises.length).toBe(6);
  });

  it('each exercise has sets defaulting to 3', () => {
    for (const ex of buildSession('PULL', ctx()).exercises) {
      expect(ex.sets).toBe(3);
    }
  });

  it('includes at least one T1 compound on the primary group', () => {
    const session = buildSession('PUSH', ctx());
    const tiers = session.exercises.map((e) => getExerciseMetadata(e.name).tier);
    expect(tiers).toContain(1);
  });

  // WP-4: missing equipment no longer DROPs to an empty session — bodyweight
  // is always available, so a session is still produced (clean seam for WP-5
  // substitution rather than a crash / empty list).
  it('missing ctx.equipment yields a bodyweight-only session (not empty)', () => {
    const session = buildSession('PUSH', {});
    expect(session.type).toBe('PUSH');
    expect(session.exercises.length).toBeGreaterThan(0);
    for (const ex of session.exercises) {
      expect(getExerciseMetadata(ex.name).equipment_type).toBe('bodyweight');
    }
  });
});

// ── Determinism — same user+day → same selection ─────────────────────────

describe('buildSession — determinism (PR identity)', () => {
  it('same seed → identical selection across calls', () => {
    const a = buildSession('PUSH', ctx({ seed: 'u|d|0' }));
    const b = buildSession('PUSH', ctx({ seed: 'u|d|0' }));
    expect(a.exercises).toEqual(b.exercises);
  });

  it('different seed → may differ but stays within target groups', () => {
    const a = buildSession('PUSH', ctx({ seed: 'u|d|0' }));
    const b = buildSession('PUSH', ctx({ seed: 'u|d|1' }));
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
    const names = buildSession('PUSH', ctx()).exercises.map((e) => e.name);
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
      'PULL',
      ctx({ prNames: ['Cable Curl'] }),
    ).exercises.map((e) => e.name);
    expect(names).toContain('Cable Curl');
  });

  it('Leg Press (anchor) selected for a quad-targeting session', () => {
    const names = buildSession('LEGS', ctx()).exercises.map((e) => e.name);
    expect(names).toContain('Leg Press');
  });
});

// ── Tier filtering — persona / experience ────────────────────────────────

describe('buildSession — tier filtering', () => {
  it('T0 beginner never selects T3 accessories', () => {
    const session = buildSession('PUSH', ctx({ profileTier: 'T0' }));
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
      'PUSH', ctx({ ...constrained, profileTier: 'T2' }),
    ).exercises.map((e) => getExerciseMetadata(e.name).tier);
    const begTiers = buildSession(
      'PUSH', ctx({ ...constrained, profileTier: 'T0' }),
    ).exercises.map((e) => getExerciseMetadata(e.name).tier);
    expect(advTiers).toContain(3);
    expect(Math.max(...begTiers)).toBeLessThanOrEqual(2);
  });

  it('null tier is conservative (no T3)', () => {
    const session = buildSession('PUSH', ctx({ profileTier: null }));
    for (const ex of session.exercises) {
      expect(getExerciseMetadata(ex.name).tier).toBeLessThanOrEqual(2);
    }
  });
});

// ── Equipment-constrained pool ───────────────────────────────────────────

describe('buildSession — equipment-constrained pool', () => {
  it('dumbbell-only → every non-bodyweight pick is a dumbbell exercise', () => {
    const session = buildSession('PUSH', ctx({ available: ['dumbbell'] }));
    for (const ex of session.exercises) {
      const type = getExerciseMetadata(ex.name).equipment_type;
      expect(['dumbbell', 'bodyweight']).toContain(type);
    }
  });

  it('cable removed → no cable exercise selected', () => {
    const avail = ['barbell', 'dumbbell', 'machine', 'band'];
    const session = buildSession('PULL', ctx({ available: avail }));
    for (const ex of session.exercises) {
      expect(getExerciseMetadata(ex.name).equipment_type).not.toBe('cable');
    }
  });

  it('bodyweight is always allowed even when no equipment available', () => {
    const session = buildSession('PUSH', ctx({ available: [] }));
    expect(session.exercises.length).toBeGreaterThan(0);
    for (const ex of session.exercises) {
      expect(getExerciseMetadata(ex.name).equipment_type).toBe('bodyweight');
    }
  });
});

// ── prioritizeWeakGroups — weakness ordering (Big-11 groups) ─────────────

describe('prioritizeWeakGroups — weakness ordering', () => {
  it('weak biceps → a biceps exercise moves to the first 2 positions', () => {
    const exercises = [
      { name: 'Lat Pulldown', sets: 3 },   // spate
      { name: 'Cable Row', sets: 3 },       // spate
      { name: 'Cable Curl', sets: 3 },      // biceps
      { name: 'Hammer Curl', sets: 3 },     // biceps
    ];
    const result = prioritizeWeakGroups(exercises, ['biceps']);
    const names = result.map((e) => e.name);
    const firstTwo = names.slice(0, 2);
    expect(
      firstTwo.some(
        (n) => getExerciseMetadata(n).muscle_target_primary === 'biceps',
      ),
    ).toBe(true);
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
  const TYPES = ['PUSH', 'PULL', 'LEGS', 'UMERI_BRATE', 'UPPER_PICIOARE', 'FULL_UPPER'];

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
    const hammerCurl = movementKey('Hammer Curl', { muscle_target_primary: 'biceps' });
    expect(inclineCurl).toContain('curl');
    expect(inclineCurl).not.toContain('press');
    expect(inclineCurl).toBe(hammerCurl);
  });

  it('iso-lateral ROW keys as a row, not a lateral-raise (audit MD-01)', () => {
    const key = movementKey('Hammer Strength Iso-Lateral High Row', { muscle_target_primary: 'spate' });
    expect(key).toBe('spate::row');
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
  const TYPES = ['PUSH', 'PULL', 'LEGS', 'UMERI_BRATE', 'UPPER_PICIOARE', 'FULL_UPPER'];

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
      const session = buildSession('PUSH', ctx({ seed: `bug5-fly|${s}` }));
      const chestFlyes = session.exercises.filter(
        (e) =>
          /fly/i.test(e.name) &&
          getExerciseMetadata(e.name).muscle_target_primary === 'piept',
      );
      expect(chestFlyes.length).toBeLessThanOrEqual(1);
    }
  });
});
