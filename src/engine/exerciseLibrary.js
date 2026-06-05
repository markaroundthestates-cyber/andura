// ══ EXERCISE LIBRARY — loader (data + schema split, HYGIENE 2026-05-30) ════════════════════════
// LOCKED V1 per Chat C SELF-CORRECTION EXTENSION (HANDOVER_GLOBAL §36.36) — preserved invariant.
//
// This file used to inline the entire EXERCISE_METADATA map (~657 entries, 485KB). It is now a
// thin LOADER that keeps the EXACT SAME public API (3 exports) so the 7 prod consumers + tests
// need ZERO changes. Layers after the split:
//   - exercises.json       → pure DATA, all 657 entries, byte-faithful extract (no logic/comments).
//   - exerciseSchema.ts    → types (ExerciseMetadata / CascadeStep) + validateLibrary().
//   - exerciseLibrary.js   → this loader: import JSON, validate once at load, re-export the API.
//
// Source of truth: exercises.json. Schema invariants (see exerciseSchema.ts):
//   - equipment_type: 'barbell'|'dumbbell'|'machine'|'cable'|'bodyweight'|'band' — coarse SoT
//     per D081 LOCKED V1 (NU adauga fine-grained aici).
//   - force_demand: 'low'|'medium'|'high' (Tier 1 forta detection); tier: 1|2|3.
//   - muscle_target_primary canonical per ADR_ANATOMICAL_CLASSIFICATION_V1 LOCK V1;
//     'unknown' below is a runtime fallback sentinel (NOT canonical) for "not found".
//   - fallback_cascade?: CascadeStep[] — optional ordered list per ADR v2 LOCK V2 §2.1
//     (undefined → engine fallback v1 findAlternatives ranking-based, ADR v2 §3 graceful degradation).
// Cross-ref: ADR_SMART_ROUTING_EQUIPMENT_v2.md LOCK V2 + v1 LOCKED V1 (ranking-based fallback).

import { logger } from '../util/logger.js';
import exercisesData from './exercises.json';
import { validateLibrary } from './exerciseSchema';

/** @typedef {import('./exerciseSchema').ExerciseMetadata} ExerciseMetadata */
/** @typedef {import('./exerciseSchema').CascadeStep} CascadeStep */

/** @type {Record<string, ExerciseMetadata>} */
export const EXERCISE_METADATA = exercisesData;

// ── ACTIVE VISIBILITY GATE (Daniel SSOT 2026-06-05) ─────────────────────────
// Founder decision: ONLY the curated CORE_AUTO staples are ACTIVE — selectable
// or offered anywhere the engine picks an exercise. The other ~514 entries
// (MANUAL_ADVANCED, FALLBACK, and the untagged long-tail) stay in exercises.json
// (data preserved, fully reversible) but must NEVER surface in daily-plan
// selection (sessionBuilder.poolForGroup) or the skip/swap alternative pool
// (alternativeFinder.findRefusalPool / findAlternatives / getFallbackCascade /
// findBroadAlternatives). This kills the "junk alternative" problem the swap
// audit proved: the broad pool reached all 657 and never read `status`, so
// untagged/exotic/contraindicated variants surfaced as top swap picks.
//
// SINGLE source of truth: widen ACTIVE_STATUSES here (one place) to re-enable a
// status band later. The FALLBACK band was investigated (2026-06-05) and is NOT
// load-bearing — its only entry (Nordic Hamstring Curl Assisted) is referenced
// only as a cascade step of OTHER hidden exercises, and hamstrings carries 11
// CORE_AUTO options, so hiding it never starves a swap. MANUAL_ADVANCED hidden
// (skill/risk). Both excluded from the active set.
//
// PR continuity is layered ON TOP of this gate by the consumers (a lift the user
// has actually logged stays offered regardless of status) — that is a per-call
// allow-list, not a widening of the active set, so it is handled at the call
// site (poolForGroup prNames), not here.

/** @type {ReadonlySet<string>} ONLY these statuses are auto-active. */
export const ACTIVE_STATUSES = new Set(['CORE_AUTO']);

/**
 * Is an exercise ACTIVE (auto-selectable / offerable) under the visibility gate?
 * True only for entries whose `status` is in ACTIVE_STATUSES (today: CORE_AUTO).
 * Untagged long-tail, MANUAL_ADVANCED, FALLBACK, DEPRECATED, ALIAS, MODIFIER →
 * false. Unknown name → false (cannot offer what we have no metadata for).
 * @param {string} exerciseName canonical English engine name
 * @returns {boolean}
 */
export function isActiveExercise(exerciseName) {
  const meta = EXERCISE_METADATA[exerciseName];
  return !!meta && ACTIVE_STATUSES.has(/** @type {string} */ (meta.status));
}

/**
 * Is a metadata object ACTIVE? Sibling of isActiveExercise for the hot loops
 * that already hold the entry (avoids a second map lookup over 657 entries).
 * @param {{status?: string}|null|undefined} meta
 * @returns {boolean}
 */
export function isActiveMeta(meta) {
  return !!meta && ACTIVE_STATUSES.has(/** @type {string} */ (meta.status));
}

// Validate once at module load. Dev: throw on malformed data (fail-loud so a bad entry is caught
// in tests/dev). Prod: fail-safe (log + continue) so one bad entry never bricks boot.
{
  const errors = validateLibrary(EXERCISE_METADATA);
  if (errors.length > 0) {
    const summary = `exerciseLibrary: ${errors.length} validation error(s):\n` +
      errors.slice(0, 20).join('\n');
    if (import.meta.env && import.meta.env.DEV) {
      throw new Error(summary);
    } else {
      logger.error(summary);
    }
  }
}

/**
 * Lookup metadata for an exercise by canonical name. Returns a conservative 'machine'/tier-2
 * fallback with muscle_target_primary='unknown' (NOT canonical V1 — sentinel for "not found"
 * per ADR_ANATOMICAL_CLASSIFICATION_V1 LOCK V1). Caller should treat 'unknown' as "not found".
 * @param {string} exerciseName
 * @returns {ExerciseMetadata}
 */
export function getExerciseMetadata(exerciseName) {
  return EXERCISE_METADATA[exerciseName] || {
    equipment_type: 'machine',
    equipment_alternatives: [],
    force_demand: 'medium',
    tier: 2,
    muscle_target_primary: 'unknown', // NOT canonical V1 — fallback sentinel for "not found"
    muscle_target_secondary: [],
  };
}

/**
 * Filter alternatives by tier-aware constraints (per §36.37 Smart-Routing).
 * Tier 1 forta: alternatives DOAR cu force_demand: 'high' (strict).
 * Tier 2/3: flexibility ridicata (toate alternatives cu acelasi muscle_target_primary).
 * @param {string} exerciseName
 * @returns {string[]} filtered alternative exercise names
 */
export function getValidAlternatives(exerciseName) {
  const meta = getExerciseMetadata(exerciseName);
  if (!meta.equipment_alternatives.length) return [];

  if (meta.tier === 1) {
    return meta.equipment_alternatives.filter(altName => {
      const altMeta = EXERCISE_METADATA[altName];
      return altMeta && altMeta.force_demand === 'high';
    });
  }
  return meta.equipment_alternatives.filter(altName => {
    const altMeta = EXERCISE_METADATA[altName];
    return altMeta && altMeta.muscle_target_primary === meta.muscle_target_primary;
  });
}
