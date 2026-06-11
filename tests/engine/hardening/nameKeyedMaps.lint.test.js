// ══ HARDENING — name-keyed curated maps LINT (audit-hardening arc 2026-06-11) ══
// The NAME-KEY bug class (3rd live sighting 2026-06-10: recovery blind on
// ~630/657 exercises) lives wherever engine intelligence is keyed by EXERCISE
// NAME: a rename, a typo, or a curated entry added under a non-canonical name
// silently disconnects it — no error, the exercise just falls back to defaults
// and the gap is discovered at the gym. This lint turns the whole class into a
// CI failure: EVERY key of every curated name-keyed surface must resolve through
// the canonical identity resolver (name/id/alias) to a live library entry.
//
// Surfaces covered (engine-side, name-keyed):
//   - DP.REP_RANGES                  curated rep bands (dp.js)
//   - EXERCISE_MUSCLES               curated recovery muscle map (muscleMap.js)
//   - LUMBAR_HINGES / BACK_EXTENSION_FAMILY  lumbar dedup families
//   - EXERCISE_TIER_RANK / TIER_SELECTABLE_SA  Daniel tier-select surfaces
// Group- or equipment-keyed maps (ISO_CAPS, COMPOUND_CAPS, weight steps) are NOT
// name-keyed and are out of scope. React-side pick-lists (substitution) are
// covered by their own component tests, not this engine lint.
//
// Two strictness tiers per surface:
//   (1) NO DEAD KEYS (hard): resolveExerciseName(key) !== null.
//   (2) CANONICAL KEYS (hard): the key IS the canonical name (not an alias) —
//       alias-resolved keys still work at runtime ONLY where the consumer
//       resolves before lookup; most consumers do `MAP[name]` directly, so a
//       non-canonical key is latent-dead. Keep keys canonical.
import { describe, it, expect } from 'vitest';
import { resolveExerciseName } from '../../../src/engine/exerciseLibrary.js';
import { DP } from '../../../src/engine/dp.js';
import { EXERCISE_MUSCLES } from '../../../src/engine/muscleMap.js';
import {
  LUMBAR_HINGES,
  BACK_EXTENSION_FAMILY,
} from '../../../src/engine/schedule/scheduleAdapter/lumbarDedup.js';
import {
  EXERCISE_TIER_RANK,
  TIER_SELECTABLE_SA,
} from '../../../src/engine/exerciseTierRank.js';

/** Keys that do not resolve to ANY library entry (name, id, or alias). */
const deadKeys = (keys) => [...keys].filter((k) => resolveExerciseName(k) === null);
/** Keys that resolve but are NOT the canonical name (alias-keyed = latent-dead). */
const nonCanonicalKeys = (keys) =>
  [...keys].filter((k) => {
    const canon = resolveExerciseName(k);
    return canon !== null && canon !== k;
  });

const SURFACES = [
  ['DP.REP_RANGES', () => Object.keys(DP.REP_RANGES)],
  ['EXERCISE_MUSCLES', () => Object.keys(EXERCISE_MUSCLES)],
  ['LUMBAR_HINGES', () => LUMBAR_HINGES],
  ['BACK_EXTENSION_FAMILY', () => BACK_EXTENSION_FAMILY],
  ['EXERCISE_TIER_RANK', () => Object.keys(EXERCISE_TIER_RANK)],
  ['TIER_SELECTABLE_SA', () => [...TIER_SELECTABLE_SA]],
];

describe('hardening LINT — name-keyed curated maps cover the live library', () => {
  it.each(SURFACES)('%s has no dead keys', (_label, getKeys) => {
    expect(deadKeys(getKeys())).toEqual([]);
  });

  it.each(SURFACES)('%s keys are canonical (not alias-riding)', (_label, getKeys) => {
    expect(nonCanonicalKeys(getKeys())).toEqual([]);
  });

  it('every surface is non-empty (import drift guard)', () => {
    for (const [label, getKeys] of SURFACES) {
      expect(getKeys().length, label).toBeGreaterThan(0);
    }
  });
});
