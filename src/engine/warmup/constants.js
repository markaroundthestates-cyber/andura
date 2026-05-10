// Engine Warm-up V1 constants per ADR 026 §9.7 Cluster A-E verbatim.
//
// Pipeline §42.10 position 7th canonical: Periodization → Goal Adaptation →
// Energy → Bayesian → Tempo → Specialization → Warm-up → Deload.
// (NU position 8 "Engine #8" naming legacy META §36.100 amendment 7→8
// prescriptive engines chat strategic 2026-04-30 evening — pipeline §42.10
// canonical position 7th penultimate prescriptive engine).
//
// Source: 03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.7
// (commit c15ad0f LANDED 2026-05-06 evening chat-5 acasa, 21 decisions
// Cluster A-E verbatim aggregation chat strategic 2026-04-30 evening §45.6 +
// 2026-05-04 evening BATCH 4 §65.1-§65.4).
//
// Source 4 NU disponibil: ADR Warm-up file ABSENT (NO 023-engine-warmup* sau
// *warmup* sau *warm-up*). Recommend NEW ADR `031-engine-warmup-mobility.md`
// SPEC REFERENCE direct (reverse pattern vs ADR 027/028/029 stub flip — NU
// intermediate STUB stage). Separate task post-CC low priority.
//
// ZERO fabrication beyond §9.7 spec. ZERO Date.now / Math.random — all values
// static per ADR 018 §2 deterministic contract.

/**
 * Calibration tier ids per ADR 009 + Cluster E1 Instant Skip principle
 * tier-aware (T0 default skip ramp-up integrated / T1+ Profile Typing opt-in
 * expanded / in-session toggle universal).
 *
 * @type {Readonly<{T0: 'T0', T1: 'T1', T2: 'T2'}>}
 */
export const CALIBRATION_TIERS = Object.freeze({
  T0: 'T0',
  T1: 'T1',
  T2: 'T2',
});

/**
 * Persona archetype per ADR 017 demographic prior + Cluster B3 persona
 * thresholds verbatim:
 *   Maria 65: rutina blanda activare articulara 5-10 min (mobility flow + bands light)
 *   Gigica 35: warm-up general dynamic 5 min + 1 set usor ramp pe primul exercitiu
 *   Marius 25: ramp protocol heavy compounds (50%/70%/90% × 3-5 sets) + general warm-up minimal
 *
 * @type {Readonly<{MARIA: 'maria', GIGICA: 'gigica', MARIUS: 'marius'}>}
 */
export const PERSONA = Object.freeze({
  MARIA:  'maria',
  GIGICA: 'gigica',
  MARIUS: 'marius',
});

/**
 * Warm-up activation state enum per Cluster A1 output blueprint emit.
 *
 * ACTIVE             = full routine emitted (default healthy session)
 * SKIPPED            = user toggle skip (T0 default ramp-up integrated)
 * DELOAD_LIGHTER     = Periodization phase = DELOAD → reduced routine (Cluster D1)
 * INJURY_DISABLED    = Pain-Aware reference §9.4.6 Convergence Guard
 *                      (Tempo NU proactive trigger Clean Signal rule consistent
 *                      §9.5+§9.6 precedent — Warm-up references but NU acts
 *                      proactively; user-triggered Pain Button only)
 *
 * @type {Readonly<{
 *   ACTIVE:             'ACTIVE',
 *   SKIPPED:            'SKIPPED',
 *   DELOAD_LIGHTER:     'DELOAD_LIGHTER',
 *   INJURY_DISABLED:    'INJURY_DISABLED',
 * }>}
 */
export const WARMUP_STATE = Object.freeze({
  ACTIVE:             'ACTIVE',
  SKIPPED:            'SKIPPED',
  DELOAD_LIGHTER:     'DELOAD_LIGHTER',
  INJURY_DISABLED:    'INJURY_DISABLED',
});

/**
 * Routine type per Cluster B2 verbatim Q65.2 Option C Hybrid:
 *   1-2 general full-body mobility + 2-3 specific muscle group prep
 *   NU general only (insufficient prep) | NU muscle-specific only (cold start problematic)
 *
 * V1 LOCKED 'hybrid' default. Future v1.5+ candidate: tier-aware adaptive
 * (T0 hybrid default / T1+ user choice general-only / specific-only opt-in)
 * per §9.7.6 Reconsideration Trigger 2.
 *
 * @type {Readonly<{HYBRID: 'hybrid', GENERAL: 'general', SPECIFIC: 'specific'}>}
 */
export const ROUTINE_TYPE = Object.freeze({
  HYBRID:   'hybrid',
  GENERAL:  'general',
  SPECIFIC: 'specific',
});

/**
 * Goal phase enum per §9.2 Goal Adaptation Cluster D2 cross-ref Hook.
 *
 * @type {Readonly<{CUT: 'CUT', BULK: 'BULK', MAINTAIN: 'MAINTAIN', RECOMP: 'RECOMP'}>}
 */
export const GOAL_PHASE = Object.freeze({
  CUT:      'CUT',
  BULK:     'BULK',
  MAINTAIN: 'MAINTAIN',
  RECOMP:   'RECOMP',
});

/**
 * Periodization phase enum per §9.1 Periodization Cluster 5 Hook 1 cross-ref.
 *
 * @type {Readonly<{LOAD: 'LOAD', LOAD_PLUS: 'LOAD+', PEAK: 'PEAK', DELOAD: 'DELOAD'}>}
 */
export const PERIODIZATION_PHASE = Object.freeze({
  LOAD:      'LOAD',
  LOAD_PLUS: 'LOAD+',
  PEAK:      'PEAK',
  DELOAD:    'DELOAD',
});

/**
 * Energy adjustment direction enum per §9.3 Engine Energy Adjustment Cluster D3
 * Hook cross-ref. Energy DOWN → auto-shorten upper bound 5-10 → 5-7 min
 * (anti-cascade preserve consistent §9.5 Tempo D13 precedent — Energy DOWN
 * modulates duration NU intensity directly in Warm-up).
 *
 * @type {Readonly<{UP: 'UP', DOWN: 'DOWN', NONE: 'NONE'}>}
 */
export const ENERGY_DIRECTION = Object.freeze({
  UP:   'UP',
  DOWN: 'DOWN',
  NONE: 'NONE',
});

/**
 * Schema constants per Cluster B1+B2+B3 + Cluster A1 verbatim:
 *   Duration bounds 5-10 min adaptive (§65.1 Override Q1)
 *   Hybrid routine 1-2 general + 2-3 specific (§65.2 Option C)
 *   Cooldown 2 min text-only (§65.4 OVERRIDE Q4 Source 1 supersedes Source 2 defer)
 *   Energy DOWN auto-shorten upper bound to 7 min (D3 anti-cascade)
 *   Confidence medium floor = score >= 2 (mirror §9.6 Specialization)
 *
 * @type {Readonly<{
 *   durationMinDefault: number,
 *   durationMaxDefault: number,
 *   durationMaxEnergyDown: number,
 *   durationMinMariaLight: number,
 *   durationMaxMariaLight: number,
 *   generalSetsMin: number,
 *   generalSetsMax: number,
 *   specificSetsMin: number,
 *   specificSetsMax: number,
 *   cooldownDurationMin: number,
 *   confidenceMediumFloor: number,
 * }>}
 */
export const SCHEMA_CONSTANTS = Object.freeze({
  durationMinDefault:      5,    // Source 1 §65.1 Override Q1 5-10 min
  durationMaxDefault:      10,   // Source 1 §65.1 Override Q1 upper bound
  durationMaxEnergyDown:   7,    // Cluster D3 anti-cascade auto-shorten
  durationMinMariaLight:   3,    // Source 2 §45.6.3 Maria 65 light 5-10 cu floor 3 min option
  durationMaxMariaLight:   10,   // Source 2 §45.6.3 Maria 65 mobility flow upper
  generalSetsMin:          1,    // Source 1 §65.2 Hybrid lower
  generalSetsMax:          2,    // Source 1 §65.2 Hybrid upper
  specificSetsMin:         2,    // Source 1 §65.2 Hybrid lower
  specificSetsMax:         3,    // Source 1 §65.2 Hybrid upper
  cooldownDurationMin:     2,    // Source 1 §65.4 OVERRIDE Q4 Option B "2 min stretch"
  confidenceMediumFloor:   2,
});

/**
 * Persona duration thresholds per Cluster B3 Source 2 §45.6.3 verbatim.
 *
 * Maria 65: 5-10 min mobility flow + bands light (range full)
 * Gigica 35: 5 min dynamic + ramp first exercise (compressed)
 * Marius 25: ramp protocol 50/70/90% heavy compounds + general minimal (full upper bound)
 *
 * V1 thresholds defensive — Cluster D3 Energy DOWN can auto-shorten upper bound
 * to 7 min for any persona (preserve safety floor 5 min).
 *
 * @type {Readonly<Object<string, {min: number, max: number, rationale: string}>>}
 */
export const PERSONA_DURATION = Object.freeze({
  maria: Object.freeze({
    min:       5,
    max:       10,
    rationale: 'maria_65_mobility_flow_5_10_bands_light_anti_friction_cognitive_load',
  }),
  gigica: Object.freeze({
    min:       5,
    max:       7,
    rationale: 'gigica_35_dynamic_5_7_ramp_first_exercise_intermediate',
  }),
  marius: Object.freeze({
    min:       8,
    max:       10,
    rationale: 'marius_25_ramp_50_70_90_heavy_compounds_general_minimal_advanced',
  }),
});

/**
 * RO native general dynamic warm-up exercises per Cluster B2+B3 Source 1+2.
 *
 * V1 default selection — orchestrator layer post-CC may swap per persona/age
 * factors (Maria mobility flow vs Marius ramp protocol). Engine emits
 * canonical pool, caller selects subset cu count = generalSetsMin..Max.
 *
 * @type {ReadonlyArray<string>}
 */
export const GENERAL_DYNAMIC_EXERCISES = Object.freeze([
  'Cercuri brate controlate (10 reps)',
  'Cercuri solduri usoare (8 reps fiecare directie)',
  'Genuflexiuni cu greutate proprie usoare (10 reps)',
  'Mers controlat pe loc (30 sec)',
  'Mobilitate coloana "pisica-vaca" (8 reps)',
]);

/**
 * RO native specific muscle group warm-up patterns per Cluster B2 Source 1
 * §65.2 verbatim "exercitii specifice grupe musculare vizate ziua respectiva".
 *
 * Map muscle group → specific warm-up exercise (1 per group V1; orchestrator
 * may apply 2-3 sets ramp-up via specificSetsMin..Max).
 *
 * Top compound primary muscle groups consistent §9.6 Specialization
 * weaknessDetector cross-ref Cluster D4.
 *
 * @type {Readonly<Object<string, string>>}
 */
export const SPECIFIC_MUSCLE_EXERCISES = Object.freeze({
  chest:      'Flotari usoare cu controlul (8 reps)',
  back:       'Tractiuni usoare la bara joasa (5 reps)',
  shoulders:  'Mobilitate umeri cu cordelute (10 reps)',
  legs:       'Genuflexiuni cu greutate proprie usoare (10 reps)',
  glutes:     'Hip thrust greutate proprie (12 reps)',
  arms:       'Cercuri coate controlate (10 reps)',
  core:       'Plank usor (20 sec)',
  hamstrings: 'Intinderi dinamice picioare (8 reps)',
  quads:      'Lunges greutate proprie (8 reps fiecare)',
});

/**
 * Marius ramp protocol set percentages per Cluster B3 Source 2 §45.6.3 verbatim.
 *
 * Heavy compound first exercise: 50% × 5 / 70% × 3 / 90% × 1 = ramp pattern
 * advance trainee + general warm-up minimal.
 *
 * @type {ReadonlyArray<{percentOf1RM: number, reps: number}>}
 */
export const MARIUS_RAMP_PROTOCOL = Object.freeze([
  Object.freeze({ percentOf1RM: 0.50, reps: 5 }),
  Object.freeze({ percentOf1RM: 0.70, reps: 3 }),
  Object.freeze({ percentOf1RM: 0.90, reps: 1 }),
]);

/**
 * Cooldown text-only static stretches per Cluster C2 Source 1 §65.4 verbatim.
 *
 * V1 minimal text-only ZERO UI complex (NU GIF NU video — consistent §9.5
 * Tempo E16 Q16 GIF REJECTED pre-Beta storage PWA + copyright + Gigel test).
 * 2-3 stretch static text RO native, ~30 sec each = ~2 min total.
 *
 * @type {ReadonlyArray<string>}
 */
export const COOLDOWN_STRETCHES = Object.freeze([
  'Intindere coapse anterioare (30 sec fiecare picior)',
  'Intindere lombar "copilul" (30 sec)',
  'Intindere pectorali la perete (30 sec fiecare brat)',
]);

/**
 * UI label RO native — Cluster A1 output blueprint emit per persona threshold.
 *
 * Format: "Incalzire ~X min" cu duration adaptive per Cluster B1.
 *
 * @param {number} durationMin
 * @returns {string}
 */
export function buildUiLabel(durationMin) {
  const d = Number.isFinite(durationMin) ? Math.round(durationMin) : SCHEMA_CONSTANTS.durationMinDefault;
  return `Incalzire ~${d} min`;
}
