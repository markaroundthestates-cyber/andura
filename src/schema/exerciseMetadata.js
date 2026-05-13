// ══ EXERCISE METADATA SCHEMA — §36.36 Schema Extension + Bundle 6.0.1 Chest + Bundle 6.0.2 Back + Bundle 6.0.3 Shoulders Library Extension ════════════════════════
// LOCKED V1 per Chat C SELF-CORRECTION EXTENSION (HANDOVER_GLOBAL §36.36) — preserved invariant.
// EXTENDED Bundle 6.0.1 2026-05-13h: ~90 NEW chest exerciții + fallback_cascade[] NEW optional field per ADR v2 LOCK V2 §2.1.
// EXTENDED Bundle 6.0.2 2026-05-13h: ~98 NEW back exerciții + fallback_cascade[] per ADR v2 LOCK V2 §2.1 + 'band' equipment_type introduced (Band Face Pull, Band-Assisted Pull-up, Banded Good Morning).
// EXTENDED Bundle 6.0.3 2026-05-13i: ~80 NEW shoulder exerciții + fallback_cascade[] per ADR v2 LOCK V2 §2.1 (OHP/Push Press/Smith/Hammer/Landmine/Lateral/Front/Rear delt isolation variants).
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

  // ══ Bundle 6.0.2 Back Library Extension — 98 NEW back exerciții 2026-05-13h ══

  // ── Phase A — Tier 1 Pull-up Bodyweight Vertical Pull Compound Variants (12 NEW) ────────
  'Pull-up':                       { equipment_type: 'bodyweight', equipment_alternatives: ['Chin-up', 'Lat Pulldown'],            force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Wide-Grip Pull-up':             { equipment_type: 'bodyweight', equipment_alternatives: ['Pull-up', 'Wide-Grip Lat Pulldown'],  force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Wide-Grip Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine Wide' },
    { type: 'muscle_group_compose', exercise_ids: ['Wide-Grip Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Wide' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Close-Grip Pull-up':            { equipment_type: 'bodyweight', equipment_alternatives: ['Pull-up', 'Close-Grip Lat Pulldown'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Close-Grip Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Close-Grip Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Close' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Neutral-Grip Pull-up':          { equipment_type: 'bodyweight', equipment_alternatives: ['Pull-up', 'Neutral-Grip Lat Pulldown'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Neutral-Grip Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine Neutral' },
    { type: 'muscle_group_compose', exercise_ids: ['Neutral-Grip Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Neutral' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Weighted Pull-up':              { equipment_type: 'bodyweight', equipment_alternatives: ['Pull-up', 'Lat Pulldown Heavy'],      force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Pull-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row Heavy', 'DB Row Heavy'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Plyometric Pull-up':            { equipment_type: 'bodyweight', equipment_alternatives: ['Pull-up', 'Weighted Pull-up'],        force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Pull-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'DB Row'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Archer Pull-up':                { equipment_type: 'bodyweight', equipment_alternatives: ['Pull-up', 'Weighted Pull-up'],        force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Pull-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm Cable Row', 'DB Row'] },
    { type: 'bodyweight', exercise_id: 'Pull-up' },
    { type: 'light_variant', exercise_id: 'Inverted Row Bar' },
  ] },
  'One-Arm Pull-up Progression':   { equipment_type: 'bodyweight', equipment_alternatives: ['Archer Pull-up', 'Weighted Pull-up'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Archer Pull-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm Cable Row', 'DB Row Heavy'] },
    { type: 'bodyweight', exercise_id: 'Pull-up' },
    { type: 'light_variant', exercise_id: 'Inverted Row Bar' },
  ] },
  'Chest-to-Bar Pull-up':          { equipment_type: 'bodyweight', equipment_alternatives: ['Pull-up', 'Weighted Pull-up'],        force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Pull-up' },
    { type: 'muscle_group_compose', exercise_ids: ['High Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Sternum Pull-up':               { equipment_type: 'bodyweight', equipment_alternatives: ['Chest-to-Bar Pull-up', 'Pull-up'],    force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Pull-up' },
    { type: 'muscle_group_compose', exercise_ids: ['High Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Dead-Hang Pull-up':             { equipment_type: 'bodyweight', equipment_alternatives: ['Pull-up', 'Strict Pull-up'],          force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Band-Assisted Pull-up':         { equipment_type: 'band', equipment_alternatives: ['Assisted Pullup Machine', 'Pull-up'],       force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },

  // ── Phase B — Tier 1 Chin-up Bodyweight Underhand Variants (7 NEW) ────────
  'Chin-up':                       { equipment_type: 'bodyweight', equipment_alternatives: ['Pull-up', 'Lat Pulldown Underhand'],  force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown Underhand' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine Underhand' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Row Underhand', 'Cable Curl'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Underhand' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Weighted Chin-up':              { equipment_type: 'bodyweight', equipment_alternatives: ['Chin-up', 'Lat Pulldown Heavy'],      force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown Underhand' },
    { type: 'assisted_variant', exercise_id: 'Chin-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row Heavy', 'Cable Curl Heavy'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Underhand' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Paused Chin-up':                { equipment_type: 'bodyweight', equipment_alternatives: ['Chin-up', 'Strict Chin-up'],          force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown Underhand' },
    { type: 'assisted_variant', exercise_id: 'Chin-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row Slow', 'Cable Curl Slow'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Underhand' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Close-Grip Chin-up':            { equipment_type: 'bodyweight', equipment_alternatives: ['Chin-up', 'Close-Grip Lat Pulldown Underhand'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Close-Grip Lat Pulldown Underhand' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine Close' },
    { type: 'muscle_group_compose', exercise_ids: ['Close-Grip Cable Row Underhand', 'Cable Curl'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Close Underhand' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Archer Chin-up':                { equipment_type: 'bodyweight', equipment_alternatives: ['Chin-up', 'Weighted Chin-up'],        force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Lat Pulldown Underhand' },
    { type: 'assisted_variant', exercise_id: 'Chin-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm Cable Row', 'DB Row Underhand'] },
    { type: 'bodyweight', exercise_id: 'Chin-up' },
    { type: 'light_variant', exercise_id: 'Inverted Row Bar Underhand' },
  ] },
  'One-Arm Chin-up Progression':   { equipment_type: 'bodyweight', equipment_alternatives: ['Archer Chin-up', 'Weighted Chin-up'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Lat Pulldown Underhand' },
    { type: 'assisted_variant', exercise_id: 'Archer Chin-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm Cable Row', 'DB Row Heavy'] },
    { type: 'bodyweight', exercise_id: 'Chin-up' },
    { type: 'light_variant', exercise_id: 'Inverted Row Bar Underhand' },
  ] },
  'L-Sit Chin-up':                 { equipment_type: 'bodyweight', equipment_alternatives: ['Chin-up', 'Weighted Chin-up'],        force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown Underhand' },
    { type: 'assisted_variant', exercise_id: 'Chin-up' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row Underhand', 'Cable Curl'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Underhand' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },

  // ── Phase C — Tier 1-2 Lat Pulldown Cable Vertical Pull Machine Variants (10 NEW) ────────
  'Wide-Grip Lat Pulldown':        { equipment_type: 'cable', equipment_alternatives: ['Lat Pulldown', 'Wide-Grip Pull-up'],       force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine Wide' },
    { type: 'muscle_group_compose', exercise_ids: ['Wide-Grip Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Wide' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Close-Grip Lat Pulldown':       { equipment_type: 'cable', equipment_alternatives: ['Lat Pulldown', 'Close-Grip Pull-up'],      force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Close-Grip Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Close' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Neutral-Grip Lat Pulldown':     { equipment_type: 'cable', equipment_alternatives: ['Lat Pulldown', 'Neutral-Grip Pull-up'],    force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine Neutral' },
    { type: 'muscle_group_compose', exercise_ids: ['Neutral-Grip Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Neutral' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'V-Bar Lat Pulldown':            { equipment_type: 'cable', equipment_alternatives: ['Neutral-Grip Lat Pulldown', 'Lat Pulldown'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine Neutral' },
    { type: 'muscle_group_compose', exercise_ids: ['V-Bar Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Neutral' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Lat Pulldown Underhand':        { equipment_type: 'cable', equipment_alternatives: ['Lat Pulldown', 'Chin-up'],                 force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine Underhand' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row Underhand', 'Cable Curl'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Underhand' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Close-Grip Lat Pulldown Underhand': { equipment_type: 'cable', equipment_alternatives: ['Lat Pulldown Underhand', 'Close-Grip Chin-up'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown Underhand' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine Close' },
    { type: 'muscle_group_compose', exercise_ids: ['Close-Grip Cable Row Underhand', 'Cable Curl'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Close Underhand' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Single-Arm Lat Pulldown':       { equipment_type: 'cable', equipment_alternatives: ['Lat Pulldown', 'Single-Arm Cable Row'],    force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Single-Arm Cable Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm Cable Row', 'DB Row'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Single-Arm Lat Pulldown Underhand': { equipment_type: 'cable', equipment_alternatives: ['Single-Arm Lat Pulldown', 'Single-Arm Cable Row'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown Underhand' },
    { type: 'assisted_variant', exercise_id: 'Single-Arm Cable Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm Cable Row', 'DB Row Underhand'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Underhand' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Hammer Strength Lat Pulldown':  { equipment_type: 'machine', equipment_alternatives: ['Lat Pulldown', 'V-Bar Lat Pulldown'],    force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Assisted Pullup Machine' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Straight-Arm Lat Pulldown':     { equipment_type: 'cable', equipment_alternatives: ['Cable Pullover', 'DB Pullover'],           force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Pullover' },
    { type: 'assisted_variant', exercise_id: 'Lat Pulldown' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Pullover', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Superman' },
    { type: 'light_variant', exercise_id: 'Prone Y Raise' },
  ] },

  // ── Phase D — Tier 1 Barbell Row Horizontal Pull Compound Variants (8 NEW) ────────
  'Barbell Row':                   { equipment_type: 'barbell', equipment_alternatives: ['Cable Row', 'Chest-Supported Row', 'DB Row'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'T-Bar Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Yates Row':                     { equipment_type: 'barbell', equipment_alternatives: ['Barbell Row', 'T-Bar Row'],              force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'T-Bar Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Row Underhand', 'Cable Row Underhand'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Underhand' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'T-Bar Row':                     { equipment_type: 'machine', equipment_alternatives: ['Barbell Row', 'Chest-Supported Row'],    force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Chest-Supported Row' },
    { type: 'assisted_variant', exercise_id: 'Hammer Strength Row' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Pendlay Row':                   { equipment_type: 'barbell', equipment_alternatives: ['Barbell Row', 'T-Bar Row'],              force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'T-Bar Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Row Heavy', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Paused Barbell Row':            { equipment_type: 'barbell', equipment_alternatives: ['Barbell Row', 'Pendlay Row'],            force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'T-Bar Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Row Slow', 'Cable Row Slow'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Slow' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Snatch-Grip Barbell Row':       { equipment_type: 'barbell', equipment_alternatives: ['Barbell Row', 'Wide-Grip Cable Row'],    force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Wide-Grip Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row Wide' },
    { type: 'muscle_group_compose', exercise_ids: ['Wide-Grip Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Wide' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Meadows Row':                   { equipment_type: 'barbell', equipment_alternatives: ['T-Bar Row', 'DB Row Heavy'],             force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'T-Bar Row' },
    { type: 'assisted_variant', exercise_id: 'Single-Arm Cable Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm Cable Row', 'DB Row'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Landmine T-Bar Row':            { equipment_type: 'barbell', equipment_alternatives: ['T-Bar Row', 'Meadows Row'],              force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'T-Bar Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Row', 'Cable Row'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },

  // ── Phase E — Tier 1-2 DB Row Horizontal Pull Unilateral Variants (6 NEW) ────────
  'DB Row':                        { equipment_type: 'dumbbell', equipment_alternatives: ['Cable Row', 'Chest-Supported Row'],     force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Chest-Supported Row' },
    { type: 'assisted_variant', exercise_id: 'Single-Arm Cable Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Chest-Supported DB Row':        { equipment_type: 'dumbbell', equipment_alternatives: ['Chest-Supported Row', 'DB Row'],        force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Chest-Supported Row' },
    { type: 'assisted_variant', exercise_id: 'Hammer Strength Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'DB Row Underhand':              { equipment_type: 'dumbbell', equipment_alternatives: ['DB Row', 'Cable Row Underhand'],        force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row Underhand' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row Underhand' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row Underhand', 'Cable Curl'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Underhand' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Kroc Row':                      { equipment_type: 'dumbbell', equipment_alternatives: ['DB Row Heavy', 'Single-Arm Cable Row'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Cable Row' },
    { type: 'assisted_variant', exercise_id: 'DB Row' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Row Heavy', 'Cable Row Heavy'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'DB Row Heavy':                  { equipment_type: 'dumbbell', equipment_alternatives: ['DB Row', 'Kroc Row'],                   force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Chest-Supported Row' },
    { type: 'assisted_variant', exercise_id: 'Single-Arm Cable Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row Heavy', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Cable Row Slow':                { equipment_type: 'cable', equipment_alternatives: ['Cable Row', 'Cable Row Underhand'],        force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Slow' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },

  // ── Phase F — Tier 2 Cable Row Horizontal Pull Cable Variants (8 NEW) ────────
  'Wide-Grip Cable Row':           { equipment_type: 'cable', equipment_alternatives: ['Cable Row', 'Wide-Grip Lat Pulldown'],     force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row Wide' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Wide' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Close-Grip Cable Row':          { equipment_type: 'cable', equipment_alternatives: ['Cable Row', 'V-Bar Cable Row'],            force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'DB Row'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Close' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'V-Bar Cable Row':               { equipment_type: 'cable', equipment_alternatives: ['Close-Grip Cable Row', 'Cable Row'],       force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'DB Row'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Neutral' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Cable Row Underhand':           { equipment_type: 'cable', equipment_alternatives: ['Cable Row', 'DB Row Underhand'],           force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row Underhand' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Row Underhand', 'Cable Curl'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Underhand' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Close-Grip Cable Row Underhand': { equipment_type: 'cable', equipment_alternatives: ['Cable Row Underhand', 'Close-Grip Chin-up'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row Underhand' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row Underhand' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row Underhand', 'Cable Curl'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Close Underhand' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Single-Arm Cable Row':          { equipment_type: 'cable', equipment_alternatives: ['Cable Row', 'DB Row'],                     force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Row', 'Cable Row'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'High Cable Row':                { equipment_type: 'cable', equipment_alternatives: ['Cable Row', 'Lat Pulldown'],               force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Lat Pulldown', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Kneeling Cable Row':            { equipment_type: 'cable', equipment_alternatives: ['Cable Row', 'Single-Arm Cable Row'],       force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'DB Row'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },

  // ── Phase G — Tier 1-2 Hammer Strength + Machine Row Variants (8 NEW) ────────
  'Hammer Strength Row':           { equipment_type: 'machine', equipment_alternatives: ['Chest-Supported Row', 'T-Bar Row'],      force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Chest-Supported Row' },
    { type: 'assisted_variant', exercise_id: 'Cable Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'DB Row'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Hammer Strength Iso-Lateral High Row': { equipment_type: 'machine', equipment_alternatives: ['Hammer Strength Lat Pulldown', 'High Cable Row'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'High Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Lat Pulldown' },
    { type: 'muscle_group_compose', exercise_ids: ['Lat Pulldown', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Hammer Strength Iso-Lateral Low Row': { equipment_type: 'machine', equipment_alternatives: ['Hammer Strength Row', 'Cable Row'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'DB Row'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Hammer Strength Iso-Lateral Mid Row': { equipment_type: 'machine', equipment_alternatives: ['Hammer Strength Row', 'Chest-Supported Row'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Chest-Supported Row' },
    { type: 'assisted_variant', exercise_id: 'Cable Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'DB Row'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Hammer Strength Chest-Supported Row': { equipment_type: 'machine', equipment_alternatives: ['Chest-Supported Row', 'Hammer Strength Row'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Chest-Supported Row' },
    { type: 'assisted_variant', exercise_id: 'Cable Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Chest-Supported Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'T-Bar Row Machine':             { equipment_type: 'machine', equipment_alternatives: ['T-Bar Row', 'Chest-Supported Row'],      force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Chest-Supported Row' },
    { type: 'assisted_variant', exercise_id: 'Cable Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'DB Row'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Smith Machine Row':             { equipment_type: 'machine', equipment_alternatives: ['Barbell Row', 'T-Bar Row'],              force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Chest-Supported Row' },
    { type: 'assisted_variant', exercise_id: 'Cable Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'DB Row'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },
  'Chest-Supported Row Wide':      { equipment_type: 'machine', equipment_alternatives: ['Chest-Supported Row', 'Wide-Grip Cable Row'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Wide-Grip Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Cable Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Wide-Grip Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar Wide' },
    { type: 'light_variant', exercise_id: 'Inverted Row Table Low' },
  ] },

  // ── Phase H — Tier 2-3 Face Pull + Pullover + Shrug Accessory Variants (15 NEW) ────────
  'Face Pull Bench':               { equipment_type: 'cable', equipment_alternatives: ['Face Pulls', 'Rear Delt Cable'],           force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Rear Delt Fly' },
    { type: 'assisted_variant', exercise_id: 'Face Pulls' },
    { type: 'muscle_group_compose', exercise_ids: ['Face Pulls', 'Rear Delt Cable'] },
    { type: 'bodyweight', exercise_id: 'Prone Y Raise' },
    { type: 'light_variant', exercise_id: 'Band Face Pull' },
  ] },
  'Kneeling Face Pull':            { equipment_type: 'cable', equipment_alternatives: ['Face Pulls', 'Face Pull Bench'],           force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Rear Delt Fly' },
    { type: 'assisted_variant', exercise_id: 'Face Pulls' },
    { type: 'muscle_group_compose', exercise_ids: ['Face Pulls', 'Rear Delt Cable'] },
    { type: 'bodyweight', exercise_id: 'Prone Y Raise' },
    { type: 'light_variant', exercise_id: 'Band Face Pull' },
  ] },
  'Band Face Pull':                { equipment_type: 'band', equipment_alternatives: ['Face Pulls', 'Rear Delt Cable'],            force_demand: 'low', tier: 3, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Rear Delt Fly' },
    { type: 'assisted_variant', exercise_id: 'Face Pulls' },
    { type: 'muscle_group_compose', exercise_ids: ['Face Pulls'] },
    { type: 'bodyweight', exercise_id: 'Prone Y Raise' },
    { type: 'light_variant', exercise_id: 'Prone Y Raise' },
  ] },
  'Rope Face Pull':                { equipment_type: 'cable', equipment_alternatives: ['Face Pulls', 'Face Pull Bench'],           force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Rear Delt Fly' },
    { type: 'assisted_variant', exercise_id: 'Face Pulls' },
    { type: 'muscle_group_compose', exercise_ids: ['Face Pulls', 'Rear Delt Cable'] },
    { type: 'bodyweight', exercise_id: 'Prone Y Raise' },
    { type: 'light_variant', exercise_id: 'Band Face Pull' },
  ] },
  'Single-Arm Face Pull':          { equipment_type: 'cable', equipment_alternatives: ['Face Pulls', 'Rear Delt Cable'],           force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Rear Delt Fly' },
    { type: 'assisted_variant', exercise_id: 'Face Pulls' },
    { type: 'muscle_group_compose', exercise_ids: ['Face Pulls', 'Rear Delt Cable'] },
    { type: 'bodyweight', exercise_id: 'Prone T Raise' },
    { type: 'light_variant', exercise_id: 'Band Face Pull' },
  ] },
  'EZ Bar Pullover':               { equipment_type: 'barbell', equipment_alternatives: ['DB Pullover', 'Cable Pullover'],         force_demand: 'medium', tier: 2, muscle_target_primary: 'piept', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Pec Deck / Cable Fly' },
    { type: 'assisted_variant', exercise_id: 'Cable Pullover' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Pullover', 'Lat Pulldown'] },
    { type: 'bodyweight', exercise_id: 'Push-up' },
    { type: 'light_variant', exercise_id: 'Knee Push-up' },
  ] },
  'Machine Pullover':              { equipment_type: 'machine', equipment_alternatives: ['Cable Pullover', 'DB Pullover'],         force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['piept'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Pullover' },
    { type: 'assisted_variant', exercise_id: 'Straight-Arm Lat Pulldown' },
    { type: 'muscle_group_compose', exercise_ids: ['Straight-Arm Lat Pulldown', 'Lat Pulldown'] },
    { type: 'bodyweight', exercise_id: 'Superman' },
    { type: 'light_variant', exercise_id: 'Prone Y Raise' },
  ] },
  'BB Shrug':                      { equipment_type: 'barbell', equipment_alternatives: ['DB Shrug', 'Trap Bar Shrug'],            force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shrug' },
    { type: 'assisted_variant', exercise_id: 'DB Shrug' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shrug', 'Face Pulls'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Band Face Pull' },
  ] },
  'DB Shrug':                      { equipment_type: 'dumbbell', equipment_alternatives: ['BB Shrug', 'Cable Shrug'],              force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shrug' },
    { type: 'assisted_variant', exercise_id: 'Cable Shrug' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Shrug', 'Face Pulls'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Band Face Pull' },
  ] },
  'Trap Bar Shrug':                { equipment_type: 'barbell', equipment_alternatives: ['BB Shrug', 'DB Shrug'],                  force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shrug' },
    { type: 'assisted_variant', exercise_id: 'DB Shrug' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shrug', 'Face Pulls'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Band Face Pull' },
  ] },
  'Cable Shrug':                   { equipment_type: 'cable', equipment_alternatives: ['DB Shrug', 'Machine Shrug'],               force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shrug' },
    { type: 'assisted_variant', exercise_id: 'DB Shrug' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shrug', 'Face Pulls'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Band Face Pull' },
  ] },
  'Machine Shrug':                 { equipment_type: 'machine', equipment_alternatives: ['DB Shrug', 'Cable Shrug'],               force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Shrug' },
    { type: 'assisted_variant', exercise_id: 'DB Shrug' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shrug', 'Face Pulls'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Band Face Pull' },
  ] },
  'Smith Machine Shrug':           { equipment_type: 'machine', equipment_alternatives: ['BB Shrug', 'Machine Shrug'],             force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shrug' },
    { type: 'assisted_variant', exercise_id: 'DB Shrug' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shrug', 'Face Pulls'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Band Face Pull' },
  ] },
  'Behind-Back BB Shrug':          { equipment_type: 'barbell', equipment_alternatives: ['BB Shrug', 'DB Shrug'],                  force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shrug' },
    { type: 'assisted_variant', exercise_id: 'BB Shrug' },
    { type: 'muscle_group_compose', exercise_ids: ['BB Shrug', 'Face Pulls'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Band Face Pull' },
  ] },
  'Plate Shrug':                   { equipment_type: 'barbell', equipment_alternatives: ['DB Shrug', 'BB Shrug'],                  force_demand: 'low', tier: 3, muscle_target_primary: 'spate', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shrug' },
    { type: 'assisted_variant', exercise_id: 'DB Shrug' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shrug'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Band Face Pull' },
  ] },

  // ── Phase I — Tier 1-3 Back Extension + Good Morning + Reverse Hyper Posterior Chain Variants (10 NEW) ────────
  'Roman Chair Back Extension':    { equipment_type: 'machine', equipment_alternatives: ['45° Hyperextension', 'GHD Back Extension'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: '45° Hyperextension' },
    { type: 'assisted_variant', exercise_id: 'GHD Back Extension' },
    { type: 'muscle_group_compose', exercise_ids: ['Romanian Deadlift', 'Leg Curl'] },
    { type: 'bodyweight', exercise_id: 'Superman' },
    { type: 'light_variant', exercise_id: 'Bird Dog' },
  ] },
  '45° Hyperextension':            { equipment_type: 'machine', equipment_alternatives: ['Roman Chair Back Extension', 'GHD Back Extension'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Roman Chair Back Extension' },
    { type: 'assisted_variant', exercise_id: 'GHD Back Extension' },
    { type: 'muscle_group_compose', exercise_ids: ['Romanian Deadlift', 'Leg Curl'] },
    { type: 'bodyweight', exercise_id: 'Superman' },
    { type: 'light_variant', exercise_id: 'Bird Dog' },
  ] },
  'GHD Back Extension':            { equipment_type: 'machine', equipment_alternatives: ['45° Hyperextension', 'Roman Chair Back Extension'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: '45° Hyperextension' },
    { type: 'assisted_variant', exercise_id: 'Roman Chair Back Extension' },
    { type: 'muscle_group_compose', exercise_ids: ['Romanian Deadlift', 'Leg Curl'] },
    { type: 'bodyweight', exercise_id: 'Superman' },
    { type: 'light_variant', exercise_id: 'Bird Dog' },
  ] },
  'Weighted Hyperextension':       { equipment_type: 'machine', equipment_alternatives: ['45° Hyperextension', 'GHD Back Extension'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: '45° Hyperextension' },
    { type: 'assisted_variant', exercise_id: 'GHD Back Extension' },
    { type: 'muscle_group_compose', exercise_ids: ['Romanian Deadlift', 'Leg Curl'] },
    { type: 'bodyweight', exercise_id: 'Superman' },
    { type: 'light_variant', exercise_id: 'Bird Dog' },
  ] },
  'Reverse Hyperextension':        { equipment_type: 'machine', equipment_alternatives: ['45° Hyperextension', 'GHD Back Extension'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: '45° Hyperextension' },
    { type: 'assisted_variant', exercise_id: 'GHD Back Extension' },
    { type: 'muscle_group_compose', exercise_ids: ['Glute Bridge', 'Leg Curl'] },
    { type: 'bodyweight', exercise_id: 'Glute Bridge' },
    { type: 'light_variant', exercise_id: 'Bird Dog' },
  ] },
  'BB Good Morning':               { equipment_type: 'barbell', equipment_alternatives: ['Romanian Deadlift', 'Roman Chair Back Extension'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Roman Chair Back Extension' },
    { type: 'assisted_variant', exercise_id: '45° Hyperextension' },
    { type: 'muscle_group_compose', exercise_ids: ['Romanian Deadlift', 'Leg Curl'] },
    { type: 'bodyweight', exercise_id: 'Superman' },
    { type: 'light_variant', exercise_id: 'Bird Dog' },
  ] },
  'Banded Good Morning':           { equipment_type: 'band', equipment_alternatives: ['BB Good Morning', 'Roman Chair Back Extension'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Roman Chair Back Extension' },
    { type: 'assisted_variant', exercise_id: '45° Hyperextension' },
    { type: 'muscle_group_compose', exercise_ids: ['Romanian Deadlift', 'Leg Curl'] },
    { type: 'bodyweight', exercise_id: 'Superman' },
    { type: 'light_variant', exercise_id: 'Bird Dog' },
  ] },
  'Seated Good Morning':           { equipment_type: 'barbell', equipment_alternatives: ['BB Good Morning', 'Roman Chair Back Extension'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Roman Chair Back Extension' },
    { type: 'assisted_variant', exercise_id: '45° Hyperextension' },
    { type: 'muscle_group_compose', exercise_ids: ['Romanian Deadlift', 'Leg Curl'] },
    { type: 'bodyweight', exercise_id: 'Superman' },
    { type: 'light_variant', exercise_id: 'Bird Dog' },
  ] },
  'Single-Leg RDL':                { equipment_type: 'dumbbell', equipment_alternatives: ['Romanian Deadlift', '45° Hyperextension'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: '45° Hyperextension' },
    { type: 'assisted_variant', exercise_id: 'Romanian Deadlift' },
    { type: 'muscle_group_compose', exercise_ids: ['Romanian Deadlift', 'Glute Bridge'] },
    { type: 'bodyweight', exercise_id: 'Single-Leg RDL Bodyweight' },
    { type: 'light_variant', exercise_id: 'Bird Dog' },
  ] },
  'Single-Leg RDL Bodyweight':     { equipment_type: 'bodyweight', equipment_alternatives: ['Single-Leg RDL', 'Romanian Deadlift'], force_demand: 'low', tier: 3, muscle_target_primary: 'spate', muscle_target_secondary: ['picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: '45° Hyperextension' },
    { type: 'assisted_variant', exercise_id: 'Single-Leg RDL' },
    { type: 'muscle_group_compose', exercise_ids: ['Glute Bridge', 'Bird Dog'] },
    { type: 'bodyweight', exercise_id: 'Glute Bridge' },
    { type: 'light_variant', exercise_id: 'Bird Dog' },
  ] },

  // ── Phase J — Tier 1-3 Bodyweight Back + Specialty Compound Variants (14 NEW) ────────
  'Inverted Row Bar':              { equipment_type: 'bodyweight', equipment_alternatives: ['Cable Row', 'DB Row'],                force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Chest-Supported Row' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Table Low' },
    { type: 'light_variant', exercise_id: 'Prone Y Raise' },
  ] },
  'Inverted Row Bar Wide':         { equipment_type: 'bodyweight', equipment_alternatives: ['Inverted Row Bar', 'Wide-Grip Cable Row'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Wide-Grip Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Inverted Row Bar' },
    { type: 'muscle_group_compose', exercise_ids: ['Wide-Grip Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Table Low' },
    { type: 'light_variant', exercise_id: 'Prone Y Raise' },
  ] },
  'Inverted Row Bar Close':        { equipment_type: 'bodyweight', equipment_alternatives: ['Inverted Row Bar', 'Close-Grip Cable Row'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Close-Grip Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Inverted Row Bar' },
    { type: 'muscle_group_compose', exercise_ids: ['Close-Grip Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Table Low' },
    { type: 'light_variant', exercise_id: 'Prone Y Raise' },
  ] },
  'Inverted Row Bar Neutral':      { equipment_type: 'bodyweight', equipment_alternatives: ['Inverted Row Bar', 'V-Bar Cable Row'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'V-Bar Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Inverted Row Bar' },
    { type: 'muscle_group_compose', exercise_ids: ['V-Bar Cable Row', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Table Low' },
    { type: 'light_variant', exercise_id: 'Prone Y Raise' },
  ] },
  'Inverted Row Bar Underhand':    { equipment_type: 'bodyweight', equipment_alternatives: ['Inverted Row Bar', 'Cable Row Underhand'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row Underhand' },
    { type: 'assisted_variant', exercise_id: 'Inverted Row Bar' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row Underhand', 'Cable Curl'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Table Low' },
    { type: 'light_variant', exercise_id: 'Prone Y Raise' },
  ] },
  'Inverted Row Bar Close Underhand': { equipment_type: 'bodyweight', equipment_alternatives: ['Inverted Row Bar Underhand', 'Close-Grip Cable Row Underhand'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Close-Grip Cable Row Underhand' },
    { type: 'assisted_variant', exercise_id: 'Inverted Row Bar Underhand' },
    { type: 'muscle_group_compose', exercise_ids: ['Close-Grip Cable Row Underhand', 'Cable Curl'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Table Low' },
    { type: 'light_variant', exercise_id: 'Prone Y Raise' },
  ] },
  'Inverted Row Bar Slow':         { equipment_type: 'bodyweight', equipment_alternatives: ['Inverted Row Bar', 'Cable Row Slow'], force_demand: 'medium', tier: 2, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row Slow' },
    { type: 'assisted_variant', exercise_id: 'Inverted Row Bar' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Row Slow', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Table Low' },
    { type: 'light_variant', exercise_id: 'Prone Y Raise' },
  ] },
  'Inverted Row Table Low':        { equipment_type: 'bodyweight', equipment_alternatives: ['Inverted Row Bar', 'Superman'],       force_demand: 'low', tier: 3, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Cable Row' },
    { type: 'assisted_variant', exercise_id: 'Inverted Row Bar' },
    { type: 'muscle_group_compose', exercise_ids: ['Superman', 'Bird Dog'] },
    { type: 'bodyweight', exercise_id: 'Superman' },
    { type: 'light_variant', exercise_id: 'Prone Y Raise' },
  ] },
  'Superman':                      { equipment_type: 'bodyweight', equipment_alternatives: ['Inverted Row Table Low', 'Prone Y Raise'], force_demand: 'low', tier: 3, muscle_target_primary: 'spate', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Roman Chair Back Extension' },
    { type: 'assisted_variant', exercise_id: 'Inverted Row Table Low' },
    { type: 'muscle_group_compose', exercise_ids: ['Bird Dog'] },
    { type: 'bodyweight', exercise_id: 'Bird Dog' },
    { type: 'light_variant', exercise_id: 'Prone Y Raise' },
  ] },
  'Prone Y Raise':                 { equipment_type: 'bodyweight', equipment_alternatives: ['Superman', 'Prone T Raise'],          force_demand: 'low', tier: 3, muscle_target_primary: 'spate', muscle_target_secondary: ['umeri'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Rear Delt Fly' },
    { type: 'assisted_variant', exercise_id: 'Band Face Pull' },
    { type: 'muscle_group_compose', exercise_ids: ['Rear Delt Cable'] },
    { type: 'bodyweight', exercise_id: 'Bird Dog' },
    { type: 'light_variant', exercise_id: 'Bird Dog' },
  ] },
  'Prone T Raise':                 { equipment_type: 'bodyweight', equipment_alternatives: ['Prone Y Raise', 'Superman'],          force_demand: 'low', tier: 3, muscle_target_primary: 'spate', muscle_target_secondary: ['umeri'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Rear Delt Fly' },
    { type: 'assisted_variant', exercise_id: 'Band Face Pull' },
    { type: 'muscle_group_compose', exercise_ids: ['Rear Delt Cable'] },
    { type: 'bodyweight', exercise_id: 'Bird Dog' },
    { type: 'light_variant', exercise_id: 'Bird Dog' },
  ] },
  'Scapular Pull-up':              { equipment_type: 'bodyweight', equipment_alternatives: ['Pull-up', 'Lat Pulldown'],            force_demand: 'low', tier: 3, muscle_target_primary: 'spate', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Lat Pulldown' },
    { type: 'assisted_variant', exercise_id: 'Inverted Row Bar' },
    { type: 'muscle_group_compose', exercise_ids: ['Face Pulls', 'Lat Pulldown'] },
    { type: 'bodyweight', exercise_id: 'Inverted Row Bar' },
    { type: 'light_variant', exercise_id: 'Prone Y Raise' },
  ] },
  'Rack Pull':                     { equipment_type: 'barbell', equipment_alternatives: ['Conventional Deadlift', 'Romanian Deadlift'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Trap Bar Deadlift' },
    { type: 'assisted_variant', exercise_id: 'Romanian Deadlift' },
    { type: 'muscle_group_compose', exercise_ids: ['Romanian Deadlift', '45° Hyperextension'] },
    { type: 'bodyweight', exercise_id: 'Superman' },
    { type: 'light_variant', exercise_id: 'Single-Leg RDL Bodyweight' },
  ] },
  'Conventional Deadlift':         { equipment_type: 'barbell', equipment_alternatives: ['Romanian Deadlift', 'Trap Bar Deadlift'], force_demand: 'high', tier: 1, muscle_target_primary: 'picioare', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Trap Bar Deadlift' },
    { type: 'assisted_variant', exercise_id: 'Rack Pull' },
    { type: 'muscle_group_compose', exercise_ids: ['Romanian Deadlift', '45° Hyperextension'] },
    { type: 'bodyweight', exercise_id: 'Single-Leg RDL Bodyweight' },
    { type: 'light_variant', exercise_id: 'Glute Bridge' },
  ] },

  // ══ Bundle 6.0.3 Shoulders Library Extension — 80 NEW shoulder exerciții 2026-05-13i ══

  // ── Phase A — Tier 1 OHP Barbell Compound Shoulder Variants (8 NEW + OHP foundational micro-fix) ────────
  // AUDIT 2026-05-13i: OHP canonical foundational standing strict overhead press — micro-fix post Bundle 6.0.3 §13 inline observation (referenced 11× cross-refs in Bundle 6.0.3 cascades, ZERO entry definition existed pre-fix).
  'OHP':                           { equipment_type: 'barbell', equipment_alternatives: ['Smith OHP', 'DB Shoulder Press', 'Push Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith OHP' },
    { type: 'assisted_variant', exercise_id: 'Machine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Push Press':                    { equipment_type: 'barbell', equipment_alternatives: ['OHP', 'Smith OHP'],                       force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps', 'picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith OHP' },
    { type: 'assisted_variant', exercise_id: 'Machine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Behind-the-Neck Press':         { equipment_type: 'barbell', equipment_alternatives: ['OHP', 'Smith Behind-Neck Press'],         force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Behind-Neck Press' },
    { type: 'assisted_variant', exercise_id: 'Machine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Pin OHP':                       { equipment_type: 'barbell', equipment_alternatives: ['OHP', 'Paused OHP'],                      force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith OHP' },
    { type: 'assisted_variant', exercise_id: 'Machine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Pushdown', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Paused OHP':                    { equipment_type: 'barbell', equipment_alternatives: ['OHP', 'Pin OHP'],                         force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith OHP' },
    { type: 'assisted_variant', exercise_id: 'Machine Shoulder Press Slow' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Slow Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Z Press':                       { equipment_type: 'barbell', equipment_alternatives: ['OHP', 'Z Press DB'],                      force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith OHP Seated' },
    { type: 'assisted_variant', exercise_id: 'Machine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Seated DB Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Bradford Press':                { equipment_type: 'barbell', equipment_alternatives: ['OHP', 'Behind-the-Neck Press'],           force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith OHP' },
    { type: 'assisted_variant', exercise_id: 'Machine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Klokov Press':                  { equipment_type: 'barbell', equipment_alternatives: ['Behind-the-Neck Press', 'Snatch-Grip Push Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Behind-Neck Press' },
    { type: 'assisted_variant', exercise_id: 'Machine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Behind-the-Neck Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Snatch-Grip Push Press':        { equipment_type: 'barbell', equipment_alternatives: ['Push Press', 'Klokov Press'],             force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps', 'picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith OHP' },
    { type: 'assisted_variant', exercise_id: 'Push Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Push Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },

  // ── Phase B — Tier 1 DB Shoulder Press Compound Variants (10 NEW) ────────
  'Seated DB Press':               { equipment_type: 'dumbbell', equipment_alternatives: ['DB Shoulder Press', 'Machine Shoulder Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Smith OHP Seated' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'DB Front Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Standing DB Press':             { equipment_type: 'dumbbell', equipment_alternatives: ['DB Shoulder Press', 'OHP'],              force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Smith OHP' },
    { type: 'muscle_group_compose', exercise_ids: ['Seated DB Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Single-Arm DB Press Shoulder':  { equipment_type: 'dumbbell', equipment_alternatives: ['DB Shoulder Press', 'Half-Kneeling DB Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Machine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Arnold Press':                  { equipment_type: 'dumbbell', equipment_alternatives: ['DB Shoulder Press', 'Seated DB Press'],  force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Seated DB Press' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Neutral Grip DB Shoulder Press': { equipment_type: 'dumbbell', equipment_alternatives: ['DB Shoulder Press', 'Hammer Strength OHP'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Hammer Strength OHP' },
    { type: 'assisted_variant', exercise_id: 'Machine Shoulder Press Neutral' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Cuban Press':                   { equipment_type: 'dumbbell', equipment_alternatives: ['DB Shoulder Press', 'Arnold Press'],     force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Arnold Press' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Rear Delt Fly'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Bradford Press DB':             { equipment_type: 'dumbbell', equipment_alternatives: ['Bradford Press', 'Seated DB Press'],     force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Seated DB Press' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Z Press DB':                    { equipment_type: 'dumbbell', equipment_alternatives: ['Z Press', 'Seated DB Press'],            force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith OHP Seated' },
    { type: 'assisted_variant', exercise_id: 'Seated DB Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Seated DB Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Half-Kneeling DB Press':        { equipment_type: 'dumbbell', equipment_alternatives: ['Single-Arm DB Press Shoulder', 'Standing DB Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Machine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Alternating DB Press Shoulder': { equipment_type: 'dumbbell', equipment_alternatives: ['DB Shoulder Press', 'Single-Arm DB Press Shoulder'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Single-Arm Machine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },

  // ── Phase C — Tier 1 Smith + Hammer Strength + Machine OHP Shoulder Variants (10 NEW) ────────
  'Smith OHP':                     { equipment_type: 'machine', equipment_alternatives: ['OHP', 'Smith OHP Seated'],                force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Hammer Strength OHP' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Smith OHP Seated':              { equipment_type: 'machine', equipment_alternatives: ['Smith OHP', 'Seated DB Press'],           force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Smith OHP' },
    { type: 'muscle_group_compose', exercise_ids: ['Seated DB Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Smith Behind-Neck Press':       { equipment_type: 'machine', equipment_alternatives: ['Behind-the-Neck Press', 'Smith OHP'],     force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Smith OHP' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Hammer Strength OHP':           { equipment_type: 'machine', equipment_alternatives: ['Machine Shoulder Press', 'Smith OHP'],    force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Smith OHP Seated' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Hammer Strength Lateral':       { equipment_type: 'machine', equipment_alternatives: ['Machine Lateral Raise', 'DB Lateral Raise'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Lateral Raise' },
    { type: 'assisted_variant', exercise_id: 'Cable Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'Cable Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Machine Shoulder Press':        { equipment_type: 'machine', equipment_alternatives: ['Hammer Strength OHP', 'Smith OHP Seated'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Hammer Strength OHP' },
    { type: 'assisted_variant', exercise_id: 'Smith OHP Seated' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Machine Shoulder Press Neutral': { equipment_type: 'machine', equipment_alternatives: ['Machine Shoulder Press', 'Hammer Strength OHP'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Hammer Strength OHP' },
    { type: 'assisted_variant', exercise_id: 'Machine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Neutral Grip DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Machine Shoulder Press Slow':   { equipment_type: 'machine', equipment_alternatives: ['Machine Shoulder Press', 'Paused OHP'],   force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Hammer Strength OHP' },
    { type: 'assisted_variant', exercise_id: 'Smith OHP Seated' },
    { type: 'muscle_group_compose', exercise_ids: ['Seated DB Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Slow Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Single-Arm Machine Shoulder Press': { equipment_type: 'machine', equipment_alternatives: ['Single-Arm DB Press Shoulder', 'Machine Shoulder Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Hammer Strength OHP' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm DB Press Shoulder', 'Cable Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Converging Shoulder Press':     { equipment_type: 'machine', equipment_alternatives: ['Machine Shoulder Press', 'Hammer Strength OHP'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Smith OHP Seated' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },

  // ── Phase D — Tier 2 Lateral Raise Shoulder Isolation Variants (12 NEW) ────────
  'DB Lateral Raise':              { equipment_type: 'dumbbell', equipment_alternatives: ['Cable Lateral Raise', 'Machine Lateral Raise'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Lateral Raise' },
    { type: 'assisted_variant', exercise_id: 'Cable Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Lateral Raise', 'DB Front Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Cable Lateral Raise':           { equipment_type: 'cable', equipment_alternatives: ['DB Lateral Raise', 'Machine Lateral Raise'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Lateral Raise' },
    { type: 'assisted_variant', exercise_id: 'DB Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'Hammer Strength Lateral'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Machine Lateral Raise':         { equipment_type: 'machine', equipment_alternatives: ['DB Lateral Raise', 'Cable Lateral Raise'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Hammer Strength Lateral' },
    { type: 'assisted_variant', exercise_id: 'Cable Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'Cable Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Seated DB Lateral':             { equipment_type: 'dumbbell', equipment_alternatives: ['DB Lateral Raise', 'Machine Lateral Raise'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Lateral Raise' },
    { type: 'assisted_variant', exercise_id: 'Cable Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'Cable Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Leaning Lateral Raise':         { equipment_type: 'dumbbell', equipment_alternatives: ['DB Lateral Raise', 'Cable Lateral Raise'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Lateral Raise' },
    { type: 'assisted_variant', exercise_id: 'DB Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'Cable Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  '21s Lateral':                   { equipment_type: 'dumbbell', equipment_alternatives: ['DB Lateral Raise', 'Lateral Raise Drop Set'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Lateral Raise' },
    { type: 'assisted_variant', exercise_id: 'DB Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'Cable Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Y Raise':                       { equipment_type: 'dumbbell', equipment_alternatives: ['DB Lateral Raise', 'Scaption'],          force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Lateral Raise' },
    { type: 'assisted_variant', exercise_id: 'Cable Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'DB Front Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Iron Cross':                    { equipment_type: 'cable', equipment_alternatives: ['Cable Lateral Raise', 'DB Lateral Raise'],  force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Lateral Raise' },
    { type: 'assisted_variant', exercise_id: 'Cable Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Lateral Raise', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Lu Raise':                      { equipment_type: 'dumbbell', equipment_alternatives: ['DB Lateral Raise', 'Cuban Press'],       force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Lateral Raise' },
    { type: 'assisted_variant', exercise_id: 'DB Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'Cable Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Partial Lateral':               { equipment_type: 'dumbbell', equipment_alternatives: ['DB Lateral Raise', '21s Lateral'],       force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Lateral Raise' },
    { type: 'assisted_variant', exercise_id: 'DB Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'Cable Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Behind-the-Back Cable Lateral': { equipment_type: 'cable', equipment_alternatives: ['Cable Lateral Raise', 'DB Lateral Raise'],  force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Lateral Raise' },
    { type: 'assisted_variant', exercise_id: 'Cable Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Lateral Raise', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Lateral Raise Drop Set':        { equipment_type: 'dumbbell', equipment_alternatives: ['DB Lateral Raise', '21s Lateral'],       force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Lateral Raise' },
    { type: 'assisted_variant', exercise_id: 'Cable Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'Cable Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },

  // ── Phase E — Tier 2 Front Raise Anterior Delt Isolation Variants (10 NEW) ────────
  'DB Front Raise':                { equipment_type: 'dumbbell', equipment_alternatives: ['Cable Front Raise', 'Plate Front Raise'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Front Raise' },
    { type: 'assisted_variant', exercise_id: 'Cable Front Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'Cable Front Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Cable Front Raise':             { equipment_type: 'cable', equipment_alternatives: ['DB Front Raise', 'Barbell Front Raise'],    force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Front Raise' },
    { type: 'assisted_variant', exercise_id: 'DB Front Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Front Raise', 'Cable Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Barbell Front Raise':           { equipment_type: 'barbell', equipment_alternatives: ['DB Front Raise', 'Plate Front Raise'],    force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Front Raise' },
    { type: 'assisted_variant', exercise_id: 'DB Front Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Front Raise', 'Cable Front Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Plate Front Raise':             { equipment_type: 'dumbbell', equipment_alternatives: ['DB Front Raise', 'Barbell Front Raise'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['brate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Front Raise' },
    { type: 'assisted_variant', exercise_id: 'DB Front Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Front Raise', 'Cable Front Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Machine Front Raise':           { equipment_type: 'machine', equipment_alternatives: ['DB Front Raise', 'Cable Front Raise'],    force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Hammer Strength OHP' },
    { type: 'assisted_variant', exercise_id: 'Cable Front Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Front Raise', 'Cable Front Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Single-Arm Front Raise':        { equipment_type: 'dumbbell', equipment_alternatives: ['DB Front Raise', 'Cable Front Raise'],   force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Front Raise' },
    { type: 'assisted_variant', exercise_id: 'DB Front Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Front Raise', 'Cable Front Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Alternating Front Raise':       { equipment_type: 'dumbbell', equipment_alternatives: ['DB Front Raise', 'Single-Arm Front Raise'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Front Raise' },
    { type: 'assisted_variant', exercise_id: 'Single-Arm Front Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Front Raise', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Incline Front Raise':           { equipment_type: 'dumbbell', equipment_alternatives: ['DB Front Raise', 'Cable Front Raise'],   force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Front Raise' },
    { type: 'assisted_variant', exercise_id: 'DB Front Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Front Raise', 'Cable Front Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Lying Front Raise':             { equipment_type: 'dumbbell', equipment_alternatives: ['DB Front Raise', 'Incline Front Raise'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Front Raise' },
    { type: 'assisted_variant', exercise_id: 'Incline Front Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Front Raise', 'Cable Front Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Hammer Curl Front Raise':       { equipment_type: 'dumbbell', equipment_alternatives: ['DB Front Raise', 'Hammer Curl'],         force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['brate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Front Raise' },
    { type: 'assisted_variant', exercise_id: 'DB Front Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Front Raise', 'Hammer Curl'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },

  // ── Phase F — Tier 2-3 Rear Delt Isolation Variants (12 NEW) ────────
  'Reverse Pec Deck':              { equipment_type: 'machine', equipment_alternatives: ['Cable Rear Delt Fly', 'Bent-Over DB Lateral'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Rear Delt' },
    { type: 'assisted_variant', exercise_id: 'Cable Rear Delt Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Cable Rear Delt Fly', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Bent-Over DB Lateral':          { equipment_type: 'dumbbell', equipment_alternatives: ['Reverse Pec Deck', 'Cable Rear Delt Fly'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Machine Rear Delt' },
    { type: 'muscle_group_compose', exercise_ids: ['Reverse Pec Deck', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Cable Rear Delt Fly':           { equipment_type: 'cable', equipment_alternatives: ['Reverse Pec Deck', 'Bent-Over DB Lateral'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Machine Rear Delt' },
    { type: 'muscle_group_compose', exercise_ids: ['Reverse Pec Deck', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Face Pull':                     { equipment_type: 'cable', equipment_alternatives: ['Cable Rear Delt Fly', 'Band Pull-Apart'],    force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Cable Rear Delt Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Reverse Pec Deck', 'Band Pull-Apart'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Single-Arm Rear Delt':          { equipment_type: 'cable', equipment_alternatives: ['Cable Rear Delt Fly', 'Reverse Pec Deck'],   force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Cable Rear Delt Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Reverse Pec Deck', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Seated Rear Delt':              { equipment_type: 'dumbbell', equipment_alternatives: ['Bent-Over DB Lateral', 'Reverse Pec Deck'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Machine Rear Delt' },
    { type: 'muscle_group_compose', exercise_ids: ['Reverse Pec Deck', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Lying Rear Delt':               { equipment_type: 'dumbbell', equipment_alternatives: ['Seated Rear Delt', 'Bent-Over DB Lateral'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Machine Rear Delt' },
    { type: 'muscle_group_compose', exercise_ids: ['Reverse Pec Deck', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Standing Cable Rear Delt':      { equipment_type: 'cable', equipment_alternatives: ['Cable Rear Delt Fly', 'Face Pull'],          force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Cable Rear Delt Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Reverse Pec Deck', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Machine Rear Delt':             { equipment_type: 'machine', equipment_alternatives: ['Reverse Pec Deck', 'Cable Rear Delt Fly'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Cable Rear Delt Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Reverse Pec Deck', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Band Pull-Apart':               { equipment_type: 'band', equipment_alternatives: ['Face Pull', 'Reverse Pec Deck'],              force_demand: 'low', tier: 3, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Cable Rear Delt Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Wall Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Reverse Cable Crossover':       { equipment_type: 'cable', equipment_alternatives: ['Cable Rear Delt Fly', 'Reverse Pec Deck'],   force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Cable Rear Delt Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Reverse Pec Deck', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'DB Rear Delt Fly':              { equipment_type: 'dumbbell', equipment_alternatives: ['Bent-Over DB Lateral', 'Reverse Pec Deck'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Cable Rear Delt Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Reverse Pec Deck', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },

  // ── Phase G — Tier 1-3 Scapular + Functional + Landmine Shoulder Variants (10 NEW) ────────
  'Scapular Shrug Overhead':       { equipment_type: 'dumbbell', equipment_alternatives: ['Y Raise', 'Scaption'],                   force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'DB Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'Face Pull'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Y-T-W Raise':                   { equipment_type: 'dumbbell', equipment_alternatives: ['Y Raise', 'Face Pull'],                  force_demand: 'low', tier: 3, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Band Pull-Apart' },
    { type: 'muscle_group_compose', exercise_ids: ['Face Pull', 'Band Pull-Apart'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Scaption':                      { equipment_type: 'dumbbell', equipment_alternatives: ['Y Raise', 'DB Lateral Raise'],           force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Lateral Raise' },
    { type: 'assisted_variant', exercise_id: 'Cable Lateral Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Lateral Raise', 'DB Front Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Landmine Shoulder Press':       { equipment_type: 'barbell', equipment_alternatives: ['DB Shoulder Press', 'Standing DB Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Smith OHP' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Landmine 180':                  { equipment_type: 'barbell', equipment_alternatives: ['Landmine Shoulder Press', 'Push Press'],  force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith OHP' },
    { type: 'assisted_variant', exercise_id: 'Landmine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Push Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Single-Arm Landmine Press':     { equipment_type: 'barbell', equipment_alternatives: ['Landmine Shoulder Press', 'Single-Arm DB Press Shoulder'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Landmine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm DB Press Shoulder', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Half-Kneeling Landmine Press':  { equipment_type: 'barbell', equipment_alternatives: ['Single-Arm Landmine Press', 'Half-Kneeling DB Press'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Landmine Shoulder Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm DB Press Shoulder', 'Cable Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Bottoms-Up Press KB':           { equipment_type: 'dumbbell', equipment_alternatives: ['Half-Kneeling DB Press', 'Single-Arm DB Press Shoulder'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Single-Arm DB Press Shoulder' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm DB Press Shoulder', 'Cable Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Handstand Push-up':             { equipment_type: 'bodyweight', equipment_alternatives: ['Pike Push-up', 'Wall-Supported Handstand Push-up'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Wall-Supported Handstand Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'Pike Push-up'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Wall-Supported Handstand Push-up': { equipment_type: 'bodyweight', equipment_alternatives: ['Handstand Push-up', 'Pike Push-up'], force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Pike Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'Pike Push-up'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },

  // ── Phase H — Tier 1-3 Specialty Olympic + Power + Slow Shoulder Variants (8 NEW) ────────
  'Behind-the-Neck Push Press':    { equipment_type: 'barbell', equipment_alternatives: ['Push Press', 'Behind-the-Neck Press'],    force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps', 'picioare'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith Behind-Neck Press' },
    { type: 'assisted_variant', exercise_id: 'Push Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Push Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Slow Pike Push-up':             { equipment_type: 'bodyweight', equipment_alternatives: ['Pike Push-up', 'Wall Pike Push-up'],   force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Pike Push-up' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'Pike Push-up'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Half-Press':                    { equipment_type: 'barbell', equipment_alternatives: ['OHP', 'Pin OHP'],                         force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith OHP' },
    { type: 'assisted_variant', exercise_id: 'Pin OHP' },
    { type: 'muscle_group_compose', exercise_ids: ['DB Shoulder Press', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Single-Arm OHP':                { equipment_type: 'barbell', equipment_alternatives: ['Single-Arm Landmine Press', 'Single-Arm DB Press Shoulder'], force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Single-Arm Machine Shoulder Press' },
    { type: 'assisted_variant', exercise_id: 'Single-Arm Landmine Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Single-Arm DB Press Shoulder', 'DB Lateral Raise'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
  ] },
  'Y Raise Prone':                 { equipment_type: 'dumbbell', equipment_alternatives: ['Y Raise', 'Y-T-W Raise'],                force_demand: 'low', tier: 3, muscle_target_primary: 'umeri', muscle_target_secondary: ['spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Y Raise' },
    { type: 'muscle_group_compose', exercise_ids: ['Face Pull', 'Band Pull-Apart'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'External Rotation Cable':       { equipment_type: 'cable', equipment_alternatives: ['Cuban Press', 'Face Pull'],                 force_demand: 'low', tier: 3, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'Cable Rear Delt Fly' },
    { type: 'muscle_group_compose', exercise_ids: ['Face Pull', 'Band Pull-Apart'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Internal Rotation Cable':       { equipment_type: 'cable', equipment_alternatives: ['External Rotation Cable', 'Cable Rear Delt Fly'], force_demand: 'low', tier: 3, muscle_target_primary: 'umeri', muscle_target_secondary: [], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Reverse Pec Deck' },
    { type: 'assisted_variant', exercise_id: 'External Rotation Cable' },
    { type: 'muscle_group_compose', exercise_ids: ['Face Pull', 'Band Pull-Apart'] },
    { type: 'bodyweight', exercise_id: 'Band Pull-Apart' },
    { type: 'light_variant', exercise_id: 'Wall Push-up' },
  ] },
  'Clean and Press':               { equipment_type: 'barbell', equipment_alternatives: ['Push Press', 'OHP'],                      force_demand: 'high', tier: 1, muscle_target_primary: 'umeri', muscle_target_secondary: ['triceps', 'picioare', 'spate'], fallback_cascade: [
    { type: 'easier_machine', exercise_id: 'Smith OHP' },
    { type: 'assisted_variant', exercise_id: 'Push Press' },
    { type: 'muscle_group_compose', exercise_ids: ['Push Press', 'Barbell Row'] },
    { type: 'bodyweight', exercise_id: 'Pike Push-up' },
    { type: 'light_variant', exercise_id: 'Wall Pike Push-up' },
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
