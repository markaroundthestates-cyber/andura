// ══ MOAT PIPELINE E2E GATE — WP-8 anti-facade ════════════════════════════════
// WHY THIS FILE EXISTS: 5 prior green audits MISSED that the moat was a facade —
// "engine tested in isolation" got confused with "works for the user". This gate
// drives the REAL getDailyWorkout pipeline (runPipeline 8-adapter chain + real
// 657-entry exerciseLibrary + real sessionBuilder) and the REAL alternativeFinder
// (getFallbackCascade + findAlternatives) end-to-end, asserting the USER-VISIBLE
// moat behaviour. Each test is written to FAIL if the wiring rots back to facade
// (e.g. selection drops a blocked exercise to a hole, or substitution silently
// returns the original / a blank / an unperformable movement).
//
// Scope (engine layer): behaviours 1 (equipment-filtered pool stays REAL +
// performable, no drops), 5 (noAlt honesty — never a forced inferior / crash /
// blank), plus the engine half of 2/3 (a blocked/refused exercise resolves a
// concrete NAMED same-muscle alternative). RO-name end-to-end (behaviour 6) +
// the React store/display swap path (behaviours 2/3/4) live in
// src/react/__tests__/lib/moatSubstitution.e2e.test.ts (they need React layers).
//
// Cross-refs:
//   - 📥_inbox/wiring-audit-2026-05-26/VERDICT-CONSOLIDATED.md (Cluster 2 = moat facade)
//   - 📥_inbox/wiring-audit-2026-05-26/P3-MOAT-DESIGN.md §5, §8.7
//   - src/engine/schedule/scheduleAdapter.js (getDailyWorkout — real pipeline)
//   - src/engine/sessionBuilder.js (pool-from-657 selection)
//   - src/engine/alternativeFinder.js (getFallbackCascade / findAlternatives)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDailyWorkout,
  setMissingEquipment,
} from '../schedule/scheduleAdapter.js';
import {
  getFallbackCascade,
  findAlternatives,
} from '../alternativeFinder.js';
import {
  getExerciseMetadata,
  EXERCISE_METADATA,
} from '../exerciseLibrary.js';
import { availableCoarseTypes } from '../equipmentMap.js';

// PULL day so the pipeline composes a real training session (not a rest day).
const TUESDAY_2026_05_19 = new Date(2026, 4, 19); // dayIdx 1 (M, PULL)
const MONDAY_2026_05_18 = new Date(2026, 4, 18); // dayIdx 0 (L, PUSH)

function buildUserState(overrides = {}) {
  return {
    user: { gender: 'M', age: 30, level: 'intermediate', goal: 'hypertrophy' },
    recentSessions: [],
    weights: {},
    profileTier: 'T1',
    flags: {},
    meta: { weeksElapsed: 0 },
    ...overrides,
  };
}

/**
 * Is a selected exercise actually performable with the given coarse equipment
 * set? bodyweight is always performable; unknown metadata = NOT performable
 * (we must never prescribe a movement we have no data for).
 */
function isPerformable(engineName, availableCoarse) {
  const meta = getExerciseMetadata(engineName);
  if (!meta || meta.muscle_target_primary === 'unknown') return false;
  if (meta.equipment_type === 'bodyweight') return true;
  return availableCoarse.includes(meta.equipment_type);
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ── Behaviour 1 — equipment-filtered pool stays REAL ──────────────────────────
describe('MOAT B1 — equipment-filtered session is fully performable (no facade drop)', () => {
  // Multiple equipment combos: the moat claim is "se adapteaza la sala TA",
  // so EVERY combo must yield a real, non-empty, fully-performable session.
  const COMBOS = [
    { label: 'only dumbbells (no barbell/cable/machine/band)', missing: ['bara-halterelor', 'aparat-cablu', 'power-rack', 'leg-press', 'aparat-extensii', 'aparat-tractiuni', 'banda-elastica'] },
    { label: 'no machines/cable (free weights only)', missing: ['aparat-cablu', 'leg-press', 'aparat-extensii', 'aparat-tractiuni', 'power-rack'] },
    { label: 'no dumbbells', missing: ['gantere'] },
    { label: 'no barbell (no power-rack)', missing: ['power-rack'] },
    { label: 'nothing missing (full gym)', missing: [] },
  ];

  for (const combo of COMBOS) {
    it(`[${combo.label}] every selected exercise is performable + session non-empty`, async () => {
      setMissingEquipment(combo.missing);
      const availableCoarse = availableCoarseTypes(combo.missing);

      // PULL day and PUSH day — different muscle targets, both must hold.
      for (const day of [TUESDAY_2026_05_19, MONDAY_2026_05_18]) {
        const plan = await getDailyWorkout(buildUserState(), day);
        expect(plan).not.toBeNull();
        expect(plan.type).toBe('training');

        // FACADE GUARD #1: the session is NOT empty. A blocked exercise must be
        // substituted into the pool, never dropped to a hole.
        expect(plan.exercises.length).toBeGreaterThan(0);

        // FACADE GUARD #2: EVERY surfaced exercise is performable with the coarse
        // equipment the user actually has. If selection regressed to picking an
        // unperformable movement (or surfacing 'unknown' metadata), this fails.
        for (const ex of plan.exercises) {
          expect(
            isPerformable(ex.name, availableCoarse),
            `"${ex.name}" surfaced in [${combo.label}] but is NOT performable with ${JSON.stringify(availableCoarse)} (equipment_type=${getExerciseMetadata(ex.name).equipment_type})`,
          ).toBe(true);
          // No blank / non-string row.
          expect(typeof ex.name).toBe('string');
          expect(ex.name.length).toBeGreaterThan(0);
          // Real metadata (not the 'unknown' not-found sentinel).
          expect(getExerciseMetadata(ex.name).muscle_target_primary).not.toBe('unknown');
        }
      }
    });
  }

  it('removing equipment changes the session content (selection actually reacts)', async () => {
    // Baseline full gym.
    const baseline = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(baseline).not.toBeNull();
    const baselineTypes = baseline.exercises.map((e) => getExerciseMetadata(e.name).equipment_type);

    // Drop dumbbells — no dumbbell exercise may survive, proving the filter is
    // real (a facade would surface the same list regardless of equipment).
    setMissingEquipment(['gantere']);
    const adapted = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(adapted).not.toBeNull();
    const adaptedTypes = adapted.exercises.map((e) => getExerciseMetadata(e.name).equipment_type);
    expect(adaptedTypes).not.toContain('dumbbell');
    expect(adapted.exercises.length).toBeGreaterThan(0);
    // Sanity: when the baseline included a dumbbell exercise (the constraint
    // bites), the adapted composition must differ.
    if (baselineTypes.includes('dumbbell')) {
      const baselineNames = baseline.exercises.map((e) => e.name).join('|');
      const adaptedNames = adapted.exercises.map((e) => e.name).join('|');
      expect(adaptedNames).not.toBe(baselineNames);
    }
  });
});

// ── Behaviour 5 — noAlt honesty (engine substitution layer) ───────────────────
describe('MOAT B5 — substitution is honest when no valid alternative exists', () => {
  it('getFallbackCascade returns honest noAlt (never a forced inferior) — Leg Press, only bands', () => {
    // Leg Press (machine, picioare-quads, tier-1 high force) with ONLY bands left:
    // the whole library has no band-performable, high-force quads movement, so the
    // tier-1-strict broad search finds nothing and the engine must say so honestly
    // (anti-paternalism: NU degrade a heavy compound to a light band substitute).
    const res = getFallbackCascade('Leg Press', ['band']);
    expect(res.noAlt).toBe(true);
    expect(res.isAlternative).toBe(false);
    // It does NOT silently return the original as if performable.
    expect(res.exercise).toBeUndefined();
  });

  it('getFallbackCascade never returns an UNPERFORMABLE alternative (sweep across library)', () => {
    // For every cascade/ranking result, the substitute must itself be performable
    // with the available types — the whole point of the cascade. A regression
    // that returns an unperformable alternative would fail here.
    const available = ['dumbbell', 'bodyweight'];
    let checked = 0;
    for (const [name, meta] of Object.entries(EXERCISE_METADATA)) {
      if (meta.muscle_target_primary === 'unknown') continue;
      const res = getFallbackCascade(name, available);
      if (res.isAlternative && !res.noAlt) {
        const ids = res.exercise ? [res.exercise] : (res.exercises || []);
        for (const id of ids) {
          expect(
            isPerformable(id, available),
            `getFallbackCascade("${name}") returned unperformable alternative "${id}"`,
          ).toBe(true);
        }
        checked++;
      }
    }
    // Guard the guard: this loop must actually exercise alternatives, not 0.
    expect(checked).toBeGreaterThan(50);
  });

  it('findAlternatives shouldSkip honestly for an unknown exercise (no fabricated alternative)', () => {
    const res = findAlternatives('Totally Not A Real Exercise Name');
    expect(res.shouldSkip).toBe(true);
    expect(res.alternatives).toEqual([]);
  });

  it('getFallbackCascade is a no-op when the original is already performable', () => {
    // Cable Row (cable) with cable available → returned as-is, NOT swapped.
    const res = getFallbackCascade('Cable Row', ['cable', 'bodyweight']);
    expect(res.isAlternative).toBe(false);
    expect(res.exercise).toBe('Cable Row');
    expect(res.noAlt).toBeFalsy();
  });
});

// ── Behaviour 2/3 (engine half) — a blocked exercise resolves a NAMED alt ─────
describe('MOAT B2/B3 — blocked exercise resolves a concrete NAMED alternative', () => {
  it('barbell movement, only dumbbells → a real named dumbbell/bodyweight alternative', () => {
    // Flat Barbell Bench (barbell) → must yield a concrete alternative name that
    // is itself performable. NOT the original, NOT blank.
    const res = getFallbackCascade('Flat Barbell Bench', ['dumbbell', 'bodyweight']);
    expect(res.isAlternative).toBe(true);
    expect(res.noAlt).toBeFalsy();
    const altName = res.exercise ?? (res.exercises && res.exercises[0]);
    expect(typeof altName).toBe('string');
    expect(altName.length).toBeGreaterThan(0);
    expect(altName).not.toBe('Flat Barbell Bench'); // not the original
    expect(isPerformable(altName, ['dumbbell', 'bodyweight'])).toBe(true);
    // The alternative trains the SAME primary muscle (same-muscle swap is the moat).
    expect(getExerciseMetadata(altName).muscle_target_primary).toBe(
      getExerciseMetadata('Flat Barbell Bench').muscle_target_primary,
    );
  });

  it('refusal path (findAlternatives) yields a same-muscle alternative ignoring equipment', () => {
    const res = findAlternatives('Incline DB Press');
    expect(res.shouldSkip).toBe(false);
    expect(res.alternatives.length).toBeGreaterThan(0);
    const first = res.alternatives[0];
    expect(typeof first.name).toBe('string');
    expect(first.name).not.toBe('Incline DB Press');
    expect(getExerciseMetadata(first.name).muscle_target_primary).toBe(
      getExerciseMetadata('Incline DB Press').muscle_target_primary,
    );
  });
});

// ── Anchor lifts on missing equipment — the gate gap the audit flagged ────────
// The ~22 ORIGINAL anchor lifts carry NO fallback_cascade and only a thin (1-2)
// curated equipment_alternatives list. When that thin list is not performable the
// engine USED to dead-end at noAlt for a marquee lift (verified audit probe). The
// broad-library degradation (findBroadAlternatives) must now resolve a NAMED
// same-muscle alternative. These cases were NOT covered before (gate gap).
describe('MOAT anchor-on-missing-equipment — broad-library degradation (was noAlt)', () => {
  it('Leg Press (machine) with the machine missing → NAMED same-muscle alternative, NOT noAlt', () => {
    // Leg Press: equipment_type machine, no fallback_cascade, thin alts (Leg
    // Extension only). machine gone → the thin path dead-ends; broad search over
    // picioare-quads must land a real high-force named alternative.
    const res = getFallbackCascade('Leg Press', ['barbell', 'dumbbell', 'cable', 'bodyweight']);
    expect(res.noAlt).toBeFalsy();
    expect(res.isAlternative).toBe(true);
    expect(res.cascadeStep).toBe('broad_library');
    const altName = res.exercise ?? (res.exercises && res.exercises[0]);
    expect(typeof altName).toBe('string');
    expect(altName).not.toBe('Leg Press');
    expect(isPerformable(altName, ['barbell', 'dumbbell', 'cable', 'bodyweight'])).toBe(true);
    // Same primary muscle (real same-muscle swap, never cross-muscle).
    expect(getExerciseMetadata(altName).muscle_target_primary).toBe('picioare-quads');
    // tier-1 strength stays high-force (NU degrade a heavy compound to isolation).
    expect(getExerciseMetadata(altName).force_demand).toBe('high');
  });

  it('Incline DB Press (dumbbell) with dumbbells missing → NAMED machine/barbell same-muscle alternative', () => {
    // Incline DB Press: dumbbell, no cascade, thin alts (Flat DB Press +
    // Pec Deck). dumbbells gone → broad search over piept must land a real named
    // alternative performable on the remaining equipment.
    const res = getFallbackCascade('Incline DB Press', ['barbell', 'machine', 'cable', 'bodyweight']);
    expect(res.noAlt).toBeFalsy();
    expect(res.isAlternative).toBe(true);
    const altName = res.exercise ?? (res.exercises && res.exercises[0]);
    expect(typeof altName).toBe('string');
    expect(altName).not.toBe('Incline DB Press');
    expect(getExerciseMetadata(altName).muscle_target_primary).toBe('piept');
    expect(getExerciseMetadata(altName).equipment_type).not.toBe('dumbbell');
    expect(isPerformable(altName, ['barbell', 'machine', 'cable', 'bodyweight'])).toBe(true);
  });

  it('genuinely-impossible anchor case still returns honest noAlt (Leg Press, only bands)', () => {
    // No band-performable, high-force quads movement exists in the library, so the
    // tier-1-strict broad search finds nothing → honest noAlt (anti-paternalism).
    const res = getFallbackCascade('Leg Press', ['band']);
    expect(res.noAlt).toBe(true);
    expect(res.isAlternative).toBe(false);
  });
});
