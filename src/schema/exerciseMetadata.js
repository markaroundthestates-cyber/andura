// ══ EXERCISE METADATA SCHEMA — §36.36 Schema Extension ════════════════════════
// LOCKED V1 per Chat C SELF-CORRECTION EXTENSION (HANDOVER_GLOBAL §36.36).
// Foundation pentru Smart-Routing (§36.37) + Cascade Defense + Outlier Filter.
//
// Schema fields (per §36.36):
//   - equipment_type: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'band'
//   - equipment_alternatives: string[] (exercise names cu acelasi muscle target, equipment diferit)
//   - force_demand: 'low' | 'medium' | 'high' (Tier 1 forta detection)
//   - tier: 1 | 2 | 3 (forta / hipertrofie / accesoriu)
//   - muscle_target_primary: string
//   - muscle_target_secondary: string[]
//
// Source of truth: EXERCISE_METADATA map below. Defaults conservatoare per spec.
// Cross-ref: ADR_SMART_ROUTING_EQUIPMENT_v1 LOCKED V1 (BATCH_01 cluster 10-batch 2026-05-02).
//
// AUDIT 2026-05-02 (BATCH_05): all 26 entries reviewed per ADR_SMART_ROUTING_v1
// criteria (force_demand calibration + tier coherence + muscle_target accuracy +
// equipment_type singular). Conservative defaults validated. Per-entry audit:
// inline comments below. NU complexity field — out of scope existing schema.

/**
 * @typedef {Object} ExerciseMetadata
 * @property {'barbell'|'dumbbell'|'machine'|'cable'|'bodyweight'|'band'} equipment_type
 * @property {string[]} equipment_alternatives
 * @property {'low'|'medium'|'high'} force_demand
 * @property {1|2|3} tier
 * @property {string} muscle_target_primary
 * @property {string[]} muscle_target_secondary
 */

/** @type {Record<string, ExerciseMetadata>} */
export const EXERCISE_METADATA = {
  // ── Tier 1 — Compound forta (force_demand: high) ────────────────────────────
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — DB compound anchor shoulder
  'DB Shoulder Press':       { equipment_type: 'dumbbell', equipment_alternatives: ['Incline DB Press'],          force_demand: 'high',   tier: 1, muscle_target_primary: 'umeri',     muscle_target_secondary: ['triceps'] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — DB compound chest primary
  'Incline DB Press':        { equipment_type: 'dumbbell', equipment_alternatives: ['Flat DB Press', 'Pec Deck / Cable Fly'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri', 'triceps'] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — DB compound chest
  'Flat DB Press':           { equipment_type: 'dumbbell', equipment_alternatives: ['Incline DB Press', 'Pec Deck / Cable Fly'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — barbell compound chest
  'Flat Barbell Bench':      { equipment_type: 'barbell',  equipment_alternatives: ['Flat DB Press'],             force_demand: 'high',   tier: 1, muscle_target_primary: 'piept',     muscle_target_secondary: ['umeri', 'triceps'] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — cable compound back primary
  'Lat Pulldown':            { equipment_type: 'cable',    equipment_alternatives: ['Cable Row'],                  force_demand: 'high',   tier: 1, muscle_target_primary: 'spate',     muscle_target_secondary: ['biceps'] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — cable compound back primary
  'Cable Row':               { equipment_type: 'cable',    equipment_alternatives: ['Lat Pulldown', 'Chest-Supported Row'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — machine compound back
  'Chest-Supported Row':     { equipment_type: 'machine',  equipment_alternatives: ['Cable Row', 'Lat Pulldown'],  force_demand: 'high',   tier: 1, muscle_target_primary: 'spate',     muscle_target_secondary: ['biceps'] },
  // AUDIT 2026-05-02 (BATCH_05): FLAG alternative — Leg Curl is knee flexion, RDL is hip hinge (different prime mover); preserve OK conservative pentru pilot Beta, full alternative coverage = post-Beta backlog
  'Romanian Deadlift':       { equipment_type: 'barbell',  equipment_alternatives: ['Leg Curl'],                   force_demand: 'high',   tier: 1, muscle_target_primary: 'picioare',  muscle_target_secondary: ['spate'] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — machine compound legs
  'Leg Press':               { equipment_type: 'machine',  equipment_alternatives: ['Leg Extension'],              force_demand: 'high',   tier: 1, muscle_target_primary: 'picioare',  muscle_target_secondary: [] },

  // ── Tier 2 — Isolation hipertrofie (force_demand: medium) ───────────────────
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — DB isolation shoulder primary
  'Lateral Raises':          { equipment_type: 'dumbbell', equipment_alternatives: ['Lateral Raises (cable)'],     force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri',     muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — cable isolation shoulder
  'Lateral Raises (cable)':  { equipment_type: 'cable',    equipment_alternatives: ['Lateral Raises'],             force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri',     muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — machine isolation rear delt
  'Rear Delt Fly':           { equipment_type: 'machine',  equipment_alternatives: ['Face Pulls'],                 force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri',     muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — cable isolation rear delt
  'Rear Delt Cable':         { equipment_type: 'cable',    equipment_alternatives: ['Rear Delt Fly'],              force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri',     muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — machine isolation chest
  'Pec Deck / Cable Fly':    { equipment_type: 'machine',  equipment_alternatives: ['Cable Fly', 'Incline DB Press'], force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — cable isolation chest
  'Cable Fly':               { equipment_type: 'cable',    equipment_alternatives: ['Pec Deck / Cable Fly'],       force_demand: 'medium', tier: 2, muscle_target_primary: 'piept',     muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — DB isolation biceps
  'Incline DB Curl':         { equipment_type: 'dumbbell', equipment_alternatives: ['Bayesian Curl', 'Cable Curl'], force_demand: 'medium', tier: 2, muscle_target_primary: 'brate',    muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — cable isolation biceps
  'Bayesian Curl':           { equipment_type: 'cable',    equipment_alternatives: ['Cable Curl', 'Incline DB Curl'], force_demand: 'medium', tier: 2, muscle_target_primary: 'brate',  muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — cable isolation biceps
  'Cable Curl':              { equipment_type: 'cable',    equipment_alternatives: ['Bayesian Curl', 'Preacher Curl'], force_demand: 'medium', tier: 2, muscle_target_primary: 'brate', muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — machine isolation biceps
  'Preacher Curl':           { equipment_type: 'machine',  equipment_alternatives: ['Cable Curl', 'Incline DB Curl'], force_demand: 'medium', tier: 2, muscle_target_primary: 'brate',  muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): FLAG alternatives — could include Incline DB Curl + Bayesian; preserve OK conservative (Cable Curl primary RO gym lookup), expand post-Beta
  'Hammer Curl':             { equipment_type: 'dumbbell', equipment_alternatives: ['Cable Curl'],                 force_demand: 'medium', tier: 2, muscle_target_primary: 'brate',     muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — cable isolation triceps
  'Overhead Triceps':        { equipment_type: 'cable',    equipment_alternatives: ['Pushdown'],                   force_demand: 'medium', tier: 2, muscle_target_primary: 'triceps',   muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — cable isolation triceps
  'Pushdown':                { equipment_type: 'cable',    equipment_alternatives: ['Overhead Triceps'],           force_demand: 'medium', tier: 2, muscle_target_primary: 'triceps',   muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — machine isolation hamstrings
  'Leg Curl':                { equipment_type: 'machine',  equipment_alternatives: ['Romanian Deadlift'],          force_demand: 'medium', tier: 2, muscle_target_primary: 'picioare',  muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — machine isolation quads
  'Leg Extension':           { equipment_type: 'machine',  equipment_alternatives: ['Leg Press'],                  force_demand: 'medium', tier: 2, muscle_target_primary: 'picioare',  muscle_target_secondary: [] },

  // ── Tier 3 — Accesorii (force_demand: low) ──────────────────────────────────
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — cable accessory rear delt
  'Face Pulls':              { equipment_type: 'cable',    equipment_alternatives: ['Rear Delt Cable'],            force_demand: 'low',    tier: 3, muscle_target_primary: 'umeri',     muscle_target_secondary: [] },
  // AUDIT 2026-05-02 (BATCH_05): OK conservative — machine accessory calves
  'Calf Raises':             { equipment_type: 'machine',  equipment_alternatives: [],                              force_demand: 'low',    tier: 3, muscle_target_primary: 'picioare',  muscle_target_secondary: [] },
};

/**
 * Get metadata for an exercise. Returns conservative default if exercise unknown.
 * @param {string} exerciseName
 * @returns {ExerciseMetadata}
 */
export function getExerciseMetadata(exerciseName) {
  return EXERCISE_METADATA[exerciseName] || {
    equipment_type: 'machine',
    equipment_alternatives: [],
    force_demand: 'medium',
    tier: 2,
    muscle_target_primary: 'unknown',
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
