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

/**
 * Movement SKILL/difficulty — distinct from `tier` (force/compound level) and
 * `force_demand` (load demand). Gates whether a user is capable of the movement
 * pattern itself: a beginner can squat heavy (high force, T1) but cannot do a
 * one-arm push-up (advanced skill). Optional: absent entries default to
 * 'beginner' (safest — offer rather than wrongly exclude a basic move).
 */
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Per-exercise PRESCRIPTION METRIC (Wave 2 #7, Daniel SSOT 2026-06-08). What the
 * coach prescribes + the user logs for ONE set — distinct from `equipment_type`
 * (how it's loaded) and `force_demand`:
 *   - 'reps':     weight × repetitions (the default — every loaded/bodyweight
 *                 strength movement). Absent → treated as 'reps' (safe default).
 *   - 'time':     an isometric HOLD prescribed in seconds (Plank, Side Plank,
 *                 Dead Hang, Pallof, Dead Bug, Wrist Roller). A load may still
 *                 ride (a weighted plank) but the working axis is SECONDS, NOT
 *                 reps — so it must never get an "8 × 60kg reps" prescription.
 *   - 'distance': prescribed in meters (none in the curated 143 today; reserved
 *                 for sled/prowler-type future entries).
 *   - 'carry':    a loaded carry — load (kg) over time/distance (Farmer's Walk).
 *                 Both a load AND a duration/distance axis; NEVER reps.
 * Optional/absent → 'reps' (the consumer default), so every untagged entry +
 * the golden master stay byte-identical.
 */
export type MetricType = 'reps' | 'time' | 'distance' | 'carry';

export type CascadeStepType =
  | 'easier_machine'
  | 'assisted_variant'
  | 'muscle_group_compose'
  | 'bodyweight'
  | 'light_variant';

/**
 * Recommendation status (Wave 2 CORE library, Daniel SSOT 2026-06-03). Gates
 * whether an exercise enters AUTOMATIC selection:
 *   - CORE_AUTO:       the curated ~146 staples — the ONLY pool auto-selection
 *                      draws from (kills esoteric variants reaching a normal user).
 *   - FALLBACK:        used only when equipment forces it (no CORE_AUTO fits).
 *   - MANUAL_ADVANCED: in the library, never auto-recommended (skill/risk).
 *   - ALIAS:           alternative name for the same movement.
 *   - MODIFIER:        a technique over an exercise, not a separate exercise.
 *   - DEPRECATED:      removed from selection entirely.
 * Optional/absent → treated as non-CORE (not auto-selected) by the consumer.
 */
export type ExerciseStatus =
  | 'CORE_AUTO'
  | 'FALLBACK'
  | 'MANUAL_ADVANCED'
  | 'ALIAS'
  | 'MODIFIER'
  | 'DEPRECATED';

export interface CascadeStep {
  type: CascadeStepType;
  /** single exercise reference (easier_machine, assisted_variant, bodyweight, light_variant) */
  exercise_id?: string;
  /** 1-2 exercises compose (muscle_group_compose only per Daniel LOCK "fie 1 exercitiu sau 2") */
  exercise_ids?: string[];
}

export interface ExerciseMetadata {
  /**
   * STABLE identity (ID-MIGRATION Phase 1, 2026-06-11): kebab slug snapshot of
   * the canonical EN name at assignment. NEVER changes after — renames touch
   * only display names. Resolver: exerciseLibrary.resolveExerciseName/exerciseIdOf.
   */
  id?: string;
  /** Historical names this entry was known by (resolve to this entry). */
  aliases?: string[];
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
  /**
   * Movement skill ceiling for capability gating (sessionBuilder skillCeiling).
   * Optional: undefined → treated as 'beginner' by the consumer (safe default).
   */
  skill_level?: SkillLevel;
  /**
   * Prescription metric (Wave 2 #7). Optional: absent → 'reps' (the consumer
   * default — every loaded/bodyweight strength lift). Set ONLY on the curated
   * non-reps CORE_AUTO entries (isometric holds → 'time', loaded carries →
   * 'carry') so they never receive a weight × reps prescription.
   */
  metric_type?: MetricType;
  /** optional cascade ordered list per ADR v2 LOCK V2 §2.1 (undefined → engine fallback v1) */
  fallback_cascade?: CascadeStep[];
  /**
   * Recommendation status (Wave 2 CORE library). Optional: absent → non-CORE
   * (auto-selection skips it; still reachable via substitution/fallback).
   */
  status?: ExerciseStatus;
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

const SKILL_LEVELS: ReadonlySet<string> = new Set(['beginner', 'intermediate', 'advanced']);

const METRIC_TYPES: ReadonlySet<string> = new Set(['reps', 'time', 'distance', 'carry']);

const CASCADE_STEP_TYPES: ReadonlySet<string> = new Set([
  'easier_machine',
  'assisted_variant',
  'muscle_group_compose',
  'bodyweight',
  'light_variant',
]);

const EXERCISE_STATUSES: ReadonlySet<string> = new Set([
  'CORE_AUTO',
  'FALLBACK',
  'MANUAL_ADVANCED',
  'ALIAS',
  'MODIFIER',
  'DEPRECATED',
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
  if (e.skill_level !== undefined && !SKILL_LEVELS.has(e.skill_level as string)) {
    errors.push(`"${name}": invalid skill_level "${String(e.skill_level)}"`);
  }
  if (e.status !== undefined && !EXERCISE_STATUSES.has(e.status as string)) {
    errors.push(`"${name}": invalid status "${String(e.status)}"`);
  }
  if (e.metric_type !== undefined && !METRIC_TYPES.has(e.metric_type as string)) {
    errors.push(`"${name}": invalid metric_type "${String(e.metric_type)}"`);
  }
  // ID-MIGRATION Phase 1 (2026-06-11): stable identity fields. `id` = kebab slug
  // snapshot of the canonical EN name at assignment time (NEVER changes after);
  // `aliases` = historical names this entry was known by. Optional while the
  // generator rolls out; uniqueness/collision is enforced by the identity lint
  // test (cross-entry checks don't belong in a per-entry validator).
  if (e.id !== undefined && (typeof e.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id))) {
    errors.push(`"${name}": id must be a kebab-case slug when present`);
  }
  if (e.aliases !== undefined && !isStringArray(e.aliases)) {
    errors.push(`"${name}": aliases must be string[] when present`);
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
