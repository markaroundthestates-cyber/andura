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
import { IS_DEV } from '../util/env';
import exercisesData from './exercises.json';
import { validateLibrary } from './exerciseSchema';

/** @typedef {import('./exerciseSchema').ExerciseMetadata} ExerciseMetadata */
/** @typedef {import('./exerciseSchema').CascadeStep} CascadeStep */

/** @type {Record<string, ExerciseMetadata>} */
export const EXERCISE_METADATA = exercisesData;

// Validate once at module load. Dev: throw on malformed data (fail-loud so a bad entry is caught
// in tests/dev). Prod: fail-safe (log + continue) so one bad entry never bricks boot.
{
  const errors = validateLibrary(EXERCISE_METADATA);
  if (errors.length > 0) {
    const summary = `exerciseLibrary: ${errors.length} validation error(s):\n` +
      errors.slice(0, 20).join('\n');
    // Dev: fail-loud (throw). Prod: fail-safe (log). IS_DEV comes from the
    // per-bundler env shim (./env) — no literal `import.meta` in the RN graph.
    if (IS_DEV) {
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
