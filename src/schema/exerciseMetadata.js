// ══ EXERCISE METADATA SCHEMA — §36.36 Schema Extension + Bundle 6.0.1 Chest Library Extension ════════════════════════
// LOCKED V1 per Chat C SELF-CORRECTION EXTENSION (HANDOVER_GLOBAL §36.36) — preserved invariant.
// EXTENDED Bundle 6.0.1 2026-05-13h: ~90 NEW chest exerciții + fallback_cascade[] NEW optional field per ADR v2 LOCK V2 §2.1.
//
// Foundation pentru Smart-Routing v1 (§36.37 ranking-based) + Smart-Routing v2 (cascade ordered list per ADR v2 LOCK V2)
// + Cascade Defense + Outlier Filter.
//
// Schema fields (per §36.36):
//   - equipment_type: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'band'
//   - equipment_alternatives: string[] (exercise names cu acelasi muscle target, equipment diferit)
//   - force_demand: 'low' | 'medium' | 'high' (Tier 1 forta detection)
//   - tier: 1 | 2 | 3 (forta / hipertrofie / accesoriu)
//   - muscle_target_primary: string
//   - muscle_target_secondary: string[]
//
// V2 schema additions (Bundle 6.0.1 LANDED 2026-05-13h):
//   - fallback_cascade?: CascadeStep[] — optional cascade ordered list per exercise (5 step types canonical: easier_machine,
//     assisted_variant, muscle_group_compose, bodyweight, light_variant). Engine algorithm v2 (ADR v2 §3) traverses cascade;
//     if undefined → fallback v1 findAlternatives ranking-based graceful degradation per ADR 025 principle.
//
// Source of truth: EXERCISE_METADATA map below. Defaults conservatoare per spec.
// Cross-ref: ADR_SMART_ROUTING_EQUIPMENT_v2.md LOCK V2 2026-05-13f (cascade ordered list per exercise authority).
// Cross-ref: ADR_SMART_ROUTING_EQUIPMENT_v1 LOCKED V1 (BATCH_01 cluster 10-batch 2026-05-02) — ranking-based filtering preserved fallback path.
//
// AUDIT 2026-05-02 (BATCH_05): all 26 entries reviewed per ADR_SMART_ROUTING_v1
// criteria (force_demand calibration + tier coherence + muscle_target accuracy +
// equipment_type singular). Conservative defaults validated. Per-entry audit:
// inline comments below. NU complexity field — out of scope existing schema.
//
// Existing V1 library 26 entries: preserved UNCHANGED Bundle 6.0.1 invariant (Bundle 6.1 cascade populate downstream).
// Bundle 6.0.1 chest extension: 90 NEW chest entries + fallback_cascade[] populated per ADR v2 §2.1.

/**
 * @typedef {Object} CascadeStep
 * @property {'easier_machine'|'assisted_variant'|'muscle_group_compose'|'bodyweight'|'light_variant'} type
 * @property {string} [exercise_id] - single exercise reference (easier_machine, assisted_variant, bodyweight, light_variant)
 * @property {string[]} [exercise_ids] - 1-2 exercises compose (muscle_group_compose only per Daniel LOCK "fie 1 exercitiu sau 2")
 */

/**
 * @typedef {Object} ExerciseMetadata
 * @property {'barbell'|'dumbbell'|'machine'|'cable'|'bodyweight'|'band'} equipment_type
 * @property {string[]} equipment_alternatives
 * @property {'low'|'medium'|'high'} force_demand
 * @property {1|2|3} tier
 * @property {string} muscle_target_primary
 * @property {string[]} muscle_target_secondary
 * @property {CascadeStep[]} [fallback_cascade] - NEW Bundle 6.0.1 per ADR v2 LOCK V2 §2.1 — optional cascade ordered list 5 step types canonical (undefined → engine fallback v1 findAlternatives ranking-based per ADR v2 §3 graceful degradation)
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

  // ══════════════════════════════════════════════════════════════════════════════
  // ══ Bundle 6.0.1 Chest Library Extension — 90 NEW chest exerciții 2026-05-13h ══
  // ══ Per ADR_SMART_ROUTING_EQUIPMENT_v2.md LOCK V2 §2.1 cascade ordered list ══
  // ══════════════════════════════════════════════════════════════════════════════

  // ── Phase A — Tier 1 Compound Bench Press Barbell Variants (8 NEW) ────────
  // AUDIT 2026-05-13h: NEW Tier 1 compound barbell — primary bench press alt (Flat Barbell Bench existing preserved invariant)
  'Incline Barbell Bench':   { equipment_type: 'barbell',  equipment_alternatives: ['Incline DB Press', 'Smith Incline Bench'],   force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri', 'triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Incline Bench' },
    { type: 'assisted_variant', exercise_id: 'Incline Chest Press Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Incline DB Press', 'Incline DB Fly'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up Incline' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound barbell — decline bench primary lower chest
  'Decline Barbell Bench':   { equipment_type: 'barbell',  equipment_alternatives: ['Decline DB Press', 'Smith Decline Bench'],   force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Decline Bench' },
    { type: 'assisted_variant', exercise_id: 'Decline Chest Press Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Decline DB Press', 'Dip'] },
    { type: 'bodyweight', exercise_id: 'Dip Bodyweight' },
    { type: 'light_variant', exercise_id: 'Bench Dip' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound barbell — close-grip primarily triceps cu chest secondary
  'Close-Grip Bench Press':  { equipment_type: 'barbell',  equipment_alternatives: ['Diamond Push-up', 'Pushdown'],                force_demand: 'high', tier: 1, muscle_target_primary: 'triceps', muscle_target_secondary: ['piept'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Close-Grip Bench' },
    { type: 'assisted_variant', exercise_id: 'Triceps Press Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Pushdown', 'Overhead Triceps'] },
    { type: 'bodyweight', exercise_id: 'Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound barbell — wide-grip bench accent outer chest
  'Wide-Grip Bench Press':   { equipment_type: 'barbell',  equipment_alternatives: ['Flat Barbell Bench', 'Wide-Grip DB Press'],  force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Wide-Grip Bench' },
    { type: 'assisted_variant', exercise_id: 'Chest Press Machine Wide' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Wide Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Wide Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound barbell — paused bench accent strength tempo
  'Paused Bench Press':      { equipment_type: 'barbell',  equipment_alternatives: ['Flat Barbell Bench', 'Spoto Press'],          force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri', 'triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Machine Bench Paused' },
    { type: 'assisted_variant', exercise_id: 'Chest Press Machine Slow' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Slow Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound barbell — board press partial ROM lockout work
  'Board Press':             { equipment_type: 'barbell',  equipment_alternatives: ['Floor Press Barbell', 'Pin Press'],           force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Pin Press' },
    { type: 'assisted_variant', exercise_id: 'Chest Press Machine Lockout' },
    { type: 'muscle_group_compose', exercise_ids: ['Pushdown', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound barbell — floor press shoulder-friendly partial ROM
  'Floor Press Barbell':     { equipment_type: 'barbell',  equipment_alternatives: ['Board Press', 'Pin Press'],                   force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Floor Press' },
    { type: 'assisted_variant', exercise_id: 'Chest Press Machine Partial' },
    { type: 'muscle_group_compose', exercise_ids: ['Floor Press DB', 'Diamond Push-up'] },
    { type: 'bodyweight', exercise_id: 'Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound barbell — reverse-grip bench accent upper chest
  'Reverse-Grip Bench Press': { equipment_type: 'barbell', equipment_alternatives: ['Incline Barbell Bench', 'Incline DB Press'],  force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Reverse-Grip Bench' },
    { type: 'assisted_variant', exercise_id: 'Incline Chest Press Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Incline DB Press', 'Cable Fly Low-to-High'] },
    { type: 'bodyweight', exercise_id: 'Decline Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Decline Push-up' },
  ] },

  // ── Phase B — Tier 1 Compound Dumbbell Press Chest Variants (10 NEW) ────────
  // AUDIT 2026-05-13h: NEW Tier 1 compound DB — decline DB press lower chest emphasis
  'Decline DB Press':        { equipment_type: 'dumbbell', equipment_alternatives: ['Decline Barbell Bench', 'Dip'],              force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Decline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Smith Decline Bench' },
    { type: 'muscle_group_compose', exercise_ids: ['Decline DB Fly', 'Dip'] },
    { type: 'bodyweight', exercise_id: 'Dip Bodyweight' },
    { type: 'light_variant', exercise_id: 'Bench Dip' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound DB — neutral grip DB press shoulder-friendly
  'Neutral Grip DB Press':   { equipment_type: 'dumbbell', equipment_alternatives: ['Flat DB Press', 'Hammer Press Machine'],     force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Hammer Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Flat Chest Press Machine Neutral' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound DB — single-arm flat DB press unilateral
  'Single-Arm DB Press':     { equipment_type: 'dumbbell', equipment_alternatives: ['Flat DB Press', 'Single-Arm Chest Press Machine'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Flat Chest Press Machine Bilateral' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'DB Fly'] },
    { type: 'bodyweight', exercise_id: 'Single-Arm Push-up Assisted' },
    { type: 'light_variant', exercise_id: 'Knee Single-Arm Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound DB — incline DB press 30° lower-incline variant
  'Low-Incline DB Press':    { equipment_type: 'dumbbell', equipment_alternatives: ['Incline DB Press', 'Flat DB Press'],          force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri', 'triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Low-Incline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Smith Low-Incline Bench' },
    { type: 'muscle_group_compose', exercise_ids: ['Incline DB Press', 'Cable Fly Low-to-High'] },
    { type: 'bodyweight', exercise_id: 'Decline Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Decline Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound DB — high-incline DB press 60° upper-chest emphasis
  'High-Incline DB Press':   { equipment_type: 'dumbbell', equipment_alternatives: ['Incline DB Press', 'DB Shoulder Press'],     force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri', 'triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'High-Incline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Smith High-Incline Bench' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'Incline DB Press'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound DB — floor press DB shoulder-friendly partial ROM
  'Floor Press DB':          { equipment_type: 'dumbbell', equipment_alternatives: ['Floor Press Barbell', 'Flat DB Press'],       force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Floor Press' },
    { type: 'assisted_variant', exercise_id: 'Chest Press Machine Partial' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press Partial', 'Diamond Push-up'] },
    { type: 'bodyweight', exercise_id: 'Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound DB — DB squeeze press chest-focused crush
  'DB Squeeze Press':        { equipment_type: 'dumbbell', equipment_alternatives: ['Flat DB Press', 'Diamond Push-up'],          force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound DB — incline DB press alt 45° standard
  'Incline DB Press 45':     { equipment_type: 'dumbbell', equipment_alternatives: ['Incline DB Press', 'Low-Incline DB Press'],  force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri', 'triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Incline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Smith Incline Bench' },
    { type: 'muscle_group_compose', exercise_ids: ['Incline DB Press', 'Cable Fly Low-to-High'] },
    { type: 'bodyweight', exercise_id: 'Decline Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Decline Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound DB — alternating DB press rotational core engagement
  'Alternating DB Press':    { equipment_type: 'dumbbell', equipment_alternatives: ['Flat DB Press', 'Single-Arm DB Press'],      force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Flat Chest Press Machine Bilateral' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'DB Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 compound DB — Larsen press feet-up DB chest isolation focus
  'Larsen Press DB':         { equipment_type: 'dumbbell', equipment_alternatives: ['Flat DB Press', 'Floor Press DB'],            force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Smith Bench Feet-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up Feet-Elevated' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },

  // ── Phase C — Tier 1-2 Smith Machine + Chest Press Machine Variants (15 NEW) ────────
  // AUDIT 2026-05-13h: NEW Tier 1 machine — Smith flat bench compound easier_machine cascade primary
  'Smith Machine Bench':         { equipment_type: 'machine', equipment_alternatives: ['Flat Barbell Bench', 'Flat DB Press'],     force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri', 'triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Hammer Press Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 machine — Smith incline bench compound
  'Smith Incline Bench':         { equipment_type: 'machine', equipment_alternatives: ['Incline Barbell Bench', 'Incline DB Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri', 'triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Incline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Hammer Incline Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Incline DB Press', 'Cable Fly Low-to-High'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 machine — Smith decline bench compound
  'Smith Decline Bench':         { equipment_type: 'machine', equipment_alternatives: ['Decline Barbell Bench', 'Decline DB Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Decline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Hammer Decline Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Decline DB Press', 'Dip'] },
    { type: 'bodyweight', exercise_id: 'Dip Bodyweight' },
    { type: 'light_variant', exercise_id: 'Bench Dip' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 machine — chest press machine selectorized flat
  'Flat Chest Press Machine':    { equipment_type: 'machine', equipment_alternatives: ['Smith Machine Bench', 'Flat DB Press'],     force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Hammer Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Cable Chest Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 machine — chest press incline machine selectorized
  'Incline Chest Press Machine': { equipment_type: 'machine', equipment_alternatives: ['Smith Incline Bench', 'Incline DB Press'],  force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri', 'triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Hammer Incline Press' },
    { type: 'assisted_variant', exercise_id: 'Cable Incline Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Incline DB Press', 'Cable Fly Low-to-High'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 machine — chest press decline machine selectorized
  'Decline Chest Press Machine': { equipment_type: 'machine', equipment_alternatives: ['Smith Decline Bench', 'Decline DB Press'],  force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Hammer Decline Press' },
    { type: 'assisted_variant', exercise_id: 'Cable Decline Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Decline DB Press', 'Dip'] },
    { type: 'bodyweight', exercise_id: 'Dip Bodyweight' },
    { type: 'light_variant', exercise_id: 'Bench Dip' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 machine — Hammer Strength plate-loaded flat chest press
  'Hammer Press Machine':        { equipment_type: 'machine', equipment_alternatives: ['Flat Chest Press Machine', 'Flat DB Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Smith Machine Bench' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 machine — Hammer Strength plate-loaded incline chest press
  'Hammer Incline Press':        { equipment_type: 'machine', equipment_alternatives: ['Incline Chest Press Machine', 'Incline DB Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri', 'triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Incline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Smith Incline Bench' },
    { type: 'muscle_group_compose', exercise_ids: ['Incline DB Press', 'Cable Fly Low-to-High'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 machine — Hammer Strength plate-loaded decline chest press
  'Hammer Decline Press':        { equipment_type: 'machine', equipment_alternatives: ['Decline Chest Press Machine', 'Decline DB Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Decline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Smith Decline Bench' },
    { type: 'muscle_group_compose', exercise_ids: ['Decline DB Press', 'Dip'] },
    { type: 'bodyweight', exercise_id: 'Dip Bodyweight' },
    { type: 'light_variant', exercise_id: 'Bench Dip' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 machine — single-arm chest press machine selectorized unilateral
  'Single-Arm Chest Press Machine': { equipment_type: 'machine', equipment_alternatives: ['Flat Chest Press Machine', 'Single-Arm DB Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Smith Machine Bench' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Single-Arm Push-up Assisted' },
    { type: 'light_variant', exercise_id: 'Knee Single-Arm Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 machine — converging chest press machine arc-path biomechanic
  'Converging Chest Press':      { equipment_type: 'machine', equipment_alternatives: ['Flat Chest Press Machine', 'Hammer Press Machine'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Smith Machine Bench' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 machine — pec deck rear-arm variant
  'Pec Deck Rear':               { equipment_type: 'machine', equipment_alternatives: ['Pec Deck / Cable Fly', 'Cable Fly'],       force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'DB Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Fly', 'DB Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 machine — pec deck plate-loaded variant
  'Pec Deck Plate-Loaded':       { equipment_type: 'machine', equipment_alternatives: ['Pec Deck / Cable Fly', 'DB Fly'],          force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Fly', 'DB Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 machine — cable chest press standing functional
  'Cable Chest Press':           { equipment_type: 'cable',   equipment_alternatives: ['Flat Chest Press Machine', 'Cable Fly'],   force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Hammer Press Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Fly', 'Flat DB Press'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 machine — cable incline press standing functional incline angle
  'Cable Incline Press':         { equipment_type: 'cable',   equipment_alternatives: ['Incline Chest Press Machine', 'Cable Fly Low-to-High'], force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri', 'triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Incline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Smith Incline Bench' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Fly Low-to-High', 'Incline DB Press'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },

  // ── Phase D — Tier 2 Cable Crossover + Cable Fly Chest Isolation Variants (10 NEW) ────────
  // AUDIT 2026-05-13h: NEW Tier 2 cable — high-to-low cable crossover decline chest emphasis
  'Cable Crossover High-to-Low': { equipment_type: 'cable', equipment_alternatives: ['Cable Fly', 'Pec Deck / Cable Fly'],          force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Fly', 'DB Fly'] },
    { type: 'bodyweight', exercise_id: 'Decline Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Decline Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 cable — low-to-high cable crossover incline chest emphasis
  'Cable Fly Low-to-High':       { equipment_type: 'cable', equipment_alternatives: ['Cable Crossover High-to-Low', 'Cable Fly'],   force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Fly', 'Incline DB Fly'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 cable — mid-line cable fly flat chest isolation horizontal pulley
  'Cable Fly Mid':               { equipment_type: 'cable', equipment_alternatives: ['Cable Fly', 'Pec Deck / Cable Fly'],          force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'DB Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Fly', 'DB Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 cable — single-arm cable crossover unilateral peak contraction
  'Single-Arm Cable Fly':        { equipment_type: 'cable', equipment_alternatives: ['Cable Fly', 'Cable Crossover High-to-Low'],  force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Fly', 'DB Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 cable — incline cable fly seated bench cable peak stretch
  'Incline Cable Fly':           { equipment_type: 'cable', equipment_alternatives: ['Cable Fly Low-to-High', 'Incline DB Fly'],   force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly Low-to-High' },
    { type: 'muscle_group_compose', exercise_ids: ['Incline DB Fly', 'Cable Fly Low-to-High'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 cable — decline cable fly seated bench cable lower chest
  'Decline Cable Fly':           { equipment_type: 'cable', equipment_alternatives: ['Cable Crossover High-to-Low', 'Decline DB Fly'], force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Crossover High-to-Low' },
    { type: 'muscle_group_compose', exercise_ids: ['Decline DB Fly', 'Dip'] },
    { type: 'bodyweight', exercise_id: 'Dip Bodyweight' },
    { type: 'light_variant', exercise_id: 'Bench Dip' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 cable — kneeling cable crossover stabilized core engaged
  'Kneeling Cable Crossover':    { equipment_type: 'cable', equipment_alternatives: ['Cable Crossover High-to-Low', 'Cable Fly Mid'], force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Fly Mid', 'DB Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 cable — standing crossover overhead anchored anchor down-pull
  'Cable Crossover Standing':    { equipment_type: 'cable', equipment_alternatives: ['Cable Crossover High-to-Low', 'Cable Fly'],   force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Fly', 'DB Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 cable — cable pec deck functional substitute pec deck machine
  'Cable Pec Deck':              { equipment_type: 'cable', equipment_alternatives: ['Pec Deck / Cable Fly', 'Cable Fly'],          force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Fly', 'DB Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 cable — cable squeeze press crush-grip horizontal
  'Cable Squeeze Press':         { equipment_type: 'cable', equipment_alternatives: ['DB Squeeze Press', 'Cable Fly'],              force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Fly', 'DB Squeeze Press'] },
    { type: 'bodyweight', exercise_id: 'Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },

  // ── Phase E — Tier 2 DB Fly Chest Isolation Variants (6 NEW) ────────
  // AUDIT 2026-05-13h: NEW Tier 2 DB — flat DB fly chest isolation stretch primary
  'DB Fly':                  { equipment_type: 'dumbbell', equipment_alternatives: ['Cable Fly', 'Pec Deck / Cable Fly'],            force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Fly', 'Flat DB Press'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 DB — incline DB fly upper chest stretch
  'Incline DB Fly':          { equipment_type: 'dumbbell', equipment_alternatives: ['Cable Fly Low-to-High', 'DB Fly'],              force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly Low-to-High' },
    { type: 'muscle_group_compose', exercise_ids: ['Incline DB Press', 'Cable Fly Low-to-High'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 DB — decline DB fly lower chest stretch
  'Decline DB Fly':          { equipment_type: 'dumbbell', equipment_alternatives: ['Cable Crossover High-to-Low', 'DB Fly'],        force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Crossover High-to-Low' },
    { type: 'muscle_group_compose', exercise_ids: ['Decline DB Press', 'Dip'] },
    { type: 'bodyweight', exercise_id: 'Dip Bodyweight' },
    { type: 'light_variant', exercise_id: 'Bench Dip' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 DB — floor DB fly partial ROM shoulder-friendly
  'Floor DB Fly':            { equipment_type: 'dumbbell', equipment_alternatives: ['DB Fly', 'Cable Fly'],                          force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Fly', 'Push-up'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 DB — single-arm DB fly unilateral peak contraction
  'Single-Arm DB Fly':       { equipment_type: 'dumbbell', equipment_alternatives: ['DB Fly', 'Single-Arm Cable Fly'],               force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Fly', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 DB — DB pullover chest+lat compound stretch
  'DB Pullover':             { equipment_type: 'dumbbell', equipment_alternatives: ['Cable Pullover', 'Pec Deck / Cable Fly'],       force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Pullover' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Fly', 'Lat Pulldown'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },

  // ── Phase F — Tier 1-2 Dip Compound Chest Variants (8 NEW) ────────
  // AUDIT 2026-05-13h: NEW Tier 1 bodyweight — parallel bar dip compound chest+triceps
  'Dip':                     { equipment_type: 'bodyweight', equipment_alternatives: ['Dip Bodyweight', 'Decline Barbell Bench'],   force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Assisted Dip Machine' },
    { type: 'assisted_variant', exercise_id: 'Dip Bodyweight' },
    { type: 'muscle_group_compose', exercise_ids: ['Decline DB Press', 'Pushdown'] },
    { type: 'bodyweight', exercise_id: 'Bench Dip' },
    { type: 'light_variant', exercise_id: 'Bench Dip Feet-on-Floor' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 bodyweight — pure bodyweight dip alt naming convention
  'Dip Bodyweight':          { equipment_type: 'bodyweight', equipment_alternatives: ['Dip', 'Bench Dip'],                          force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Assisted Dip Machine' },
    { type: 'assisted_variant', exercise_id: 'Band-Assisted Dip' },
    { type: 'muscle_group_compose', exercise_ids: ['Decline DB Press', 'Pushdown'] },
    { type: 'bodyweight', exercise_id: 'Bench Dip' },
    { type: 'light_variant', exercise_id: 'Bench Dip Feet-on-Floor' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 machine — assisted dip machine controlled-load primary
  'Assisted Dip Machine':    { equipment_type: 'machine', equipment_alternatives: ['Dip', 'Band-Assisted Dip'],                     force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Decline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Band-Assisted Dip' },
    { type: 'muscle_group_compose', exercise_ids: ['Decline DB Press', 'Pushdown'] },
    { type: 'bodyweight', exercise_id: 'Bench Dip' },
    { type: 'light_variant', exercise_id: 'Bench Dip Feet-on-Floor' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 bodyweight — bench dip lower-load triceps emphasis
  'Bench Dip':               { equipment_type: 'bodyweight', equipment_alternatives: ['Dip', 'Pushdown'],                            force_demand: 'medium', tier: 2, muscle_target_primary: 'triceps', muscle_target_secondary: ['piept'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pushdown' },
    { type: 'assisted_variant', exercise_id: 'Bench Dip Feet-on-Floor' },
    { type: 'muscle_group_compose', exercise_ids: ['Pushdown', 'Overhead Triceps'] },
    { type: 'bodyweight', exercise_id: 'Bench Dip Feet-on-Floor' },
    { type: 'light_variant', exercise_id: 'Bench Dip Knees-Bent' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 bodyweight — weighted dip overload variant rings/belt
  'Weighted Dip':            { equipment_type: 'bodyweight', equipment_alternatives: ['Dip', 'Dip Bodyweight'],                     force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Assisted Dip Machine' },
    { type: 'assisted_variant', exercise_id: 'Dip Bodyweight' },
    { type: 'muscle_group_compose', exercise_ids: ['Decline DB Press', 'Pushdown'] },
    { type: 'bodyweight', exercise_id: 'Bench Dip' },
    { type: 'light_variant', exercise_id: 'Bench Dip Feet-on-Floor' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 1 bodyweight — band-assisted dip lower-load build-up
  'Band-Assisted Dip':       { equipment_type: 'bodyweight', equipment_alternatives: ['Assisted Dip Machine', 'Dip Bodyweight'],   force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Assisted Dip Machine' },
    { type: 'assisted_variant', exercise_id: 'Bench Dip' },
    { type: 'muscle_group_compose', exercise_ids: ['Decline DB Press', 'Pushdown'] },
    { type: 'bodyweight', exercise_id: 'Bench Dip' },
    { type: 'light_variant', exercise_id: 'Bench Dip Feet-on-Floor' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 2 bodyweight — bench dip feet-on-floor entry-level
  'Bench Dip Feet-on-Floor': { equipment_type: 'bodyweight', equipment_alternatives: ['Bench Dip', 'Push-up'],                      force_demand: 'medium', tier: 2, muscle_target_primary: 'triceps', muscle_target_secondary: ['piept'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pushdown' },
    { type: 'assisted_variant', exercise_id: 'Bench Dip Knees-Bent' },
    { type: 'muscle_group_compose', exercise_ids: ['Pushdown', 'Overhead Triceps'] },
    { type: 'bodyweight', exercise_id: 'Bench Dip Knees-Bent' },
    { type: 'light_variant', exercise_id: 'Bench Dip Knees-Bent' },
  ] },
  // AUDIT 2026-05-13h: NEW Tier 3 bodyweight — bench dip knees-bent lowest entry-level
  'Bench Dip Knees-Bent':    { equipment_type: 'bodyweight', equipment_alternatives: ['Bench Dip Feet-on-Floor', 'Push-up'],        force_demand: 'low', tier: 3, muscle_target_primary: 'triceps', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pushdown' },
    { type: 'assisted_variant', exercise_id: 'Pushdown' },
    { type: 'muscle_group_compose', exercise_ids: ['Pushdown'] },
    { type: 'bodyweight', exercise_id: 'Wall Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },

  // ── Phase G push-up — Tier 1-3 Push-up Bodyweight Chest Variants (18 NEW) ────────
  // AUDIT 2026-05-13h: NEW Tier 2 bodyweight — standard push-up baseline chest compound
  'Push-up':                 { equipment_type: 'bodyweight', equipment_alternatives: ['Knee Push-up', 'Flat DB Press'],            force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps', 'umeri'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Knee Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Knee Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Knee Push-up':            { equipment_type: 'bodyweight', equipment_alternatives: ['Push-up', 'Wall Push-up'],                  force_demand: 'low',    tier: 3, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Wall Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Push-up'] },
    { type: 'bodyweight', exercise_id: 'Wall Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Wall Push-up':            { equipment_type: 'bodyweight', equipment_alternatives: ['Knee Push-up', 'Push-up'],                  force_demand: 'low',    tier: 3, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Pec Deck / Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Wall Push-up Incline' },
    { type: 'light_variant', exercise_id: 'Wall Push-up Incline' },
  ] },
  'Wall Push-up Incline':    { equipment_type: 'bodyweight', equipment_alternatives: ['Wall Push-up', 'Knee Push-up'],             force_demand: 'low',    tier: 3, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Pec Deck / Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Wall Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Diamond Push-up':         { equipment_type: 'bodyweight', equipment_alternatives: ['Close-Grip Bench Press', 'Pushdown'],       force_demand: 'medium', tier: 2, muscle_target_primary: 'triceps', muscle_target_secondary: ['piept'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pushdown' },
    { type: 'assisted_variant', exercise_id: 'Close-Grip Bench Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Pushdown', 'Overhead Triceps'] },
    { type: 'bodyweight', exercise_id: 'Knee Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },
  'Knee Diamond Push-up':    { equipment_type: 'bodyweight', equipment_alternatives: ['Diamond Push-up', 'Knee Push-up'],          force_demand: 'low',    tier: 3, muscle_target_primary: 'triceps', muscle_target_secondary: ['piept'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pushdown' },
    { type: 'assisted_variant', exercise_id: 'Knee Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Pushdown'] },
    { type: 'bodyweight', exercise_id: 'Knee Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Wide Push-up':            { equipment_type: 'bodyweight', equipment_alternatives: ['Push-up', 'Wide-Grip Bench Press'],         force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Knee Wide Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Knee Wide Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Knee Wide Push-up':       { equipment_type: 'bodyweight', equipment_alternatives: ['Wide Push-up', 'Knee Push-up'],             force_demand: 'low',    tier: 3, muscle_target_primary: 'piept', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Wall Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press'] },
    { type: 'bodyweight', exercise_id: 'Wall Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Decline Push-up':         { equipment_type: 'bodyweight', equipment_alternatives: ['Incline DB Press', 'Pike Push-up'],          force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri', 'triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Incline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Knee Decline Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Incline DB Press', 'Pike Push-up'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Knee Decline Push-up':    { equipment_type: 'bodyweight', equipment_alternatives: ['Decline Push-up', 'Knee Push-up'],          force_demand: 'low',    tier: 3, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Incline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Wall Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Incline DB Press'] },
    { type: 'bodyweight', exercise_id: 'Wall Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Incline Push-up':         { equipment_type: 'bodyweight', equipment_alternatives: ['Push-up', 'Wall Push-up'],                  force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Decline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Knee Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Decline DB Press', 'Dip'] },
    { type: 'bodyweight', exercise_id: 'Knee Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Pike Push-up':            { equipment_type: 'bodyweight', equipment_alternatives: ['DB Shoulder Press', 'OHP'],                 force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['piept', 'triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'High-Incline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Wall Pike Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'Incline DB Press'] },
    { type: 'bodyweight', exercise_id: 'Wall Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Wall Pike Push-up':       { equipment_type: 'bodyweight', equipment_alternatives: ['Pike Push-up', 'Wall Push-up'],             force_demand: 'low',    tier: 3, muscle_target_primary: 'umeri', muscle_target_secondary: ['piept'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'High-Incline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Wall Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press'] },
    { type: 'bodyweight', exercise_id: 'Wall Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Plyometric Push-up':      { equipment_type: 'bodyweight', equipment_alternatives: ['Push-up', 'Clap Push-up'],                   force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps', 'umeri'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  'Clap Push-up':            { equipment_type: 'bodyweight', equipment_alternatives: ['Plyometric Push-up', 'Push-up'],            force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps', 'umeri'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Plyometric Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  'Archer Push-up':          { equipment_type: 'bodyweight', equipment_alternatives: ['Push-up', 'Single-Arm Push-up Assisted'],   force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Single-Arm Push-up Assisted' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  'Single-Arm Push-up Assisted': { equipment_type: 'bodyweight', equipment_alternatives: ['Archer Push-up', 'Push-up'],            force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Single-Arm Push-up' },
  ] },
  'Knee Single-Arm Push-up': { equipment_type: 'bodyweight', equipment_alternatives: ['Single-Arm Push-up Assisted', 'Knee Push-up'], force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Knee Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm DB Press'] },
    { type: 'bodyweight', exercise_id: 'Knee Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },

  // ── Phase G misc — Tier 1-2 Misc Specialty Chest Variants (15 NEW) ────────
  'Spoto Press':             { equipment_type: 'barbell', equipment_alternatives: ['Paused Bench Press', 'Flat Barbell Bench'],     force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Machine Bench' },
    { type: 'assisted_variant', exercise_id: 'Flat Chest Press Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Slow Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  'Slow Push-up':            { equipment_type: 'bodyweight', equipment_alternatives: ['Push-up', 'Paused Bench Press'],            force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Knee Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Pin Press':               { equipment_type: 'barbell', equipment_alternatives: ['Board Press', 'Floor Press Barbell'],          force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Pin Press' },
    { type: 'assisted_variant', exercise_id: 'Chest Press Machine Partial' },
    { type: 'muscle_group_compose', exercise_ids: ['Pushdown', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },
  'Smith Pin Press':         { equipment_type: 'machine', equipment_alternatives: ['Pin Press', 'Smith Machine Bench'],            force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Hammer Press Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },
  'Smith Floor Press':       { equipment_type: 'machine', equipment_alternatives: ['Floor Press Barbell', 'Floor Press DB'],       force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Chest Press Machine Partial' },
    { type: 'assisted_variant', exercise_id: 'Flat Chest Press Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Floor Press DB', 'Diamond Push-up'] },
    { type: 'bodyweight', exercise_id: 'Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },
  'Chest Press Machine Partial': { equipment_type: 'machine', equipment_alternatives: ['Flat Chest Press Machine', 'Floor Press Barbell'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Hammer Press Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Floor Press DB', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },
  'Chest Press Machine Lockout': { equipment_type: 'machine', equipment_alternatives: ['Chest Press Machine Partial', 'Pin Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Pushdown' },
    { type: 'muscle_group_compose', exercise_ids: ['Pushdown', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },
  'Smith Machine Bench Paused': { equipment_type: 'machine', equipment_alternatives: ['Paused Bench Press', 'Smith Machine Bench'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri', 'triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Hammer Press Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Slow Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  'Chest Press Machine Slow':{ equipment_type: 'machine', equipment_alternatives: ['Flat Chest Press Machine', 'Paused Bench Press'], force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Hammer Press Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Slow Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  'Smith Wide-Grip Bench':   { equipment_type: 'machine', equipment_alternatives: ['Wide-Grip Bench Press', 'Smith Machine Bench'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Chest Press Machine Wide' },
    { type: 'assisted_variant', exercise_id: 'Flat Chest Press Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Wide Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Wide Push-up' },
  ] },
  'Chest Press Machine Wide':{ equipment_type: 'machine', equipment_alternatives: ['Flat Chest Press Machine', 'Wide-Grip Bench Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['umeri'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Flat Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Smith Wide-Grip Bench' },
    { type: 'muscle_group_compose', exercise_ids: ['Flat DB Press', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Wide Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Wide Push-up' },
  ] },
  'Smith Close-Grip Bench':  { equipment_type: 'machine', equipment_alternatives: ['Close-Grip Bench Press', 'Smith Machine Bench'], force_demand: 'high', tier: 1, muscle_target_primary: 'triceps', muscle_target_secondary: ['piept'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Triceps Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Pushdown' },
    { type: 'muscle_group_compose', exercise_ids: ['Pushdown', 'Overhead Triceps'] },
    { type: 'bodyweight', exercise_id: 'Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },
  'Triceps Press Machine':   { equipment_type: 'machine', equipment_alternatives: ['Close-Grip Bench Press', 'Pushdown'],          force_demand: 'high', tier: 1, muscle_target_primary: 'triceps', muscle_target_secondary: ['piept'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pushdown' },
    { type: 'assisted_variant', exercise_id: 'Smith Close-Grip Bench' },
    { type: 'muscle_group_compose', exercise_ids: ['Pushdown', 'Overhead Triceps'] },
    { type: 'bodyweight', exercise_id: 'Diamond Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Diamond Push-up' },
  ] },
  'Smith Reverse-Grip Bench':{ equipment_type: 'machine', equipment_alternatives: ['Reverse-Grip Bench Press', 'Smith Incline Bench'], force_demand: 'high', tier: 1, muscle_target_primary: 'piept', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Incline Chest Press Machine' },
    { type: 'assisted_variant', exercise_id: 'Hammer Incline Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Incline DB Press', 'Cable Fly Low-to-High'] },
    { type: 'bodyweight', exercise_id: 'Decline Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Decline Push-up' },
  ] },
  'Cable Pullover':          { equipment_type: 'cable', equipment_alternatives: ['DB Pullover', 'Cable Fly'],                      force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Pullover', 'Cable Fly'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
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
