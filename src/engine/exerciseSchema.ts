// ══ EXERCISE METADATA SCHEMA — types + lightweight validator ════════════════════════
// Extracted from exerciseLibrary.js (HYGIENE split 2026-05-30) — schema/types layer.
// Source-of-truth invariants preserved verbatim from the original inline JSDoc:
//   - equipment_type: coarse SoT per D081 LOCKED V1 — NU adauga fine-grained aici.
//   - fallback_cascade: optional ordered list, 5 canonical step types per ADR v2 LOCK V2 §2.1.
//   - muscle_target_primary canonical set per ADR_ANATOMICAL_CLASSIFICATION_V1 LOCK V1;
//     'unknown' is a runtime fallback sentinel (loader, not data) for "not found".
//
// Validation is hand-rolled (NO new dependency) and runs once at module load via the
// loader (exerciseLibrary.js). Dev-mode throws on malformed data; prod fails safe (logs,
// continues) so a single bad entry never bricks boot. Zod is available in the repo but a
// hand-rolled check keeps the boot path cheap across 657 entries.

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'band';

export type ForceDemand = 'low' | 'medium' | 'high';

export type Tier = 1 | 2 | 3;

export type CascadeStepType =
  | 'easier_machine'
  | 'assisted_variant'
  | 'muscle_group_compose'
  | 'bodyweight'
  | 'light_variant';

export interface CascadeStep {
  type: CascadeStepType;
  /** single exercise reference (easier_machine, assisted_variant, bodyweight, light_variant) */
  exercise_id?: string;
  /** 1-2 exercises compose (muscle_group_compose only per Daniel LOCK "fie 1 exercitiu sau 2") */
  exercise_ids?: string[];
}

export interface ExerciseMetadata {
  /** Romanian display name, no diacritics (D-LEGACY-064). */
  nameRo?: string;
  /** canonical English key echoed as a field (identity). */
  nameEn?: string;
  equipment_type: EquipmentType;
  equipment_alternatives: string[];
  force_demand: ForceDemand;
  tier: Tier;
  muscle_target_primary: string;
  muscle_target_secondary: string[];
  /** optional cascade ordered list per ADR v2 LOCK V2 §2.1 (undefined → engine fallback v1) */
  fallback_cascade?: CascadeStep[];
}

export type ExerciseLibrary = Record<string, ExerciseMetadata>;

const EQUIPMENT_TYPES: ReadonlySet<string> = new Set([
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'band',
]);

const FORCE_DEMANDS: ReadonlySet<string> = new Set(['low', 'medium', 'high']);

const TIERS: ReadonlySet<number> = new Set([1, 2, 3]);

const CASCADE_STEP_TYPES: ReadonlySet<string> = new Set([
  'easier_machine',
  'assisted_variant',
  'muscle_group_compose',
  'bodyweight',
  'light_variant',
]);

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

/**
 * Validate a single exercise entry. Returns the list of problems found ([] = valid).
 * @param name entry key (for diagnostics)
 * @param entry candidate metadata object
 */
export function validateExercise(name: string, entry: unknown): string[] {
  const errors: string[] = [];
  if (typeof entry !== 'object' || entry === null) {
    return [`"${name}": entry is not an object`];
  }
  const e = entry as Record<string, unknown>;

  if (!EQUIPMENT_TYPES.has(e.equipment_type as string)) {
    errors.push(`"${name}": invalid equipment_type "${String(e.equipment_type)}"`);
  }
  if (!isStringArray(e.equipment_alternatives)) {
    errors.push(`"${name}": equipment_alternatives must be string[]`);
  }
  if (!FORCE_DEMANDS.has(e.force_demand as string)) {
    errors.push(`"${name}": invalid force_demand "${String(e.force_demand)}"`);
  }
  if (!TIERS.has(e.tier as number)) {
    errors.push(`"${name}": invalid tier "${String(e.tier)}"`);
  }
  if (typeof e.muscle_target_primary !== 'string' || e.muscle_target_primary.length === 0) {
    errors.push(`"${name}": muscle_target_primary must be a non-empty string`);
  }
  if (!isStringArray(e.muscle_target_secondary)) {
    errors.push(`"${name}": muscle_target_secondary must be string[]`);
  }
  if (e.nameRo !== undefined && typeof e.nameRo !== 'string') {
    errors.push(`"${name}": nameRo must be a string when present`);
  }
  if (e.nameEn !== undefined && typeof e.nameEn !== 'string') {
    errors.push(`"${name}": nameEn must be a string when present`);
  }
  if (e.fallback_cascade !== undefined) {
    if (!Array.isArray(e.fallback_cascade)) {
      errors.push(`"${name}": fallback_cascade must be an array when present`);
    } else {
      e.fallback_cascade.forEach((step, i) => {
        if (typeof step !== 'object' || step === null) {
          errors.push(`"${name}": fallback_cascade[${i}] is not an object`);
          return;
        }
        const s = step as Record<string, unknown>;
        if (!CASCADE_STEP_TYPES.has(s.type as string)) {
          errors.push(`"${name}": fallback_cascade[${i}] invalid type "${String(s.type)}"`);
        }
        if (s.exercise_id !== undefined && typeof s.exercise_id !== 'string') {
          errors.push(`"${name}": fallback_cascade[${i}].exercise_id must be a string`);
        }
        if (s.exercise_ids !== undefined && !isStringArray(s.exercise_ids)) {
          errors.push(`"${name}": fallback_cascade[${i}].exercise_ids must be string[]`);
        }
      });
    }
  }
  return errors;
}

/**
 * Validate the whole library map. Returns all problems found across entries ([] = valid).
 * @param library candidate Record<string, ExerciseMetadata>
 */
export function validateLibrary(library: unknown): string[] {
  if (typeof library !== 'object' || library === null) {
    return ['exercise library is not an object'];
  }
  const errors: string[] = [];
  for (const [name, entry] of Object.entries(library as Record<string, unknown>)) {
    errors.push(...validateExercise(name, entry));
  }
  return errors;
}
