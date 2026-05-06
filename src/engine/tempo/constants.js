// Engine Tempo V1 constants per ADR 026 §9.5 Cluster A-E verbatim.
//
// Pipeline §42.10 position 5th canonical: Periodization → Goal Adaptation →
// Energy → Bayesian → Tempo → Specialization → Warm-up → Deload.
// (NU position 6 "Engine #6" legacy ADR 028 chat strategic spec session ordering).
//
// Source: 03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.5
// (commit a9b7cbd LANDED 2026-05-06 afternoon chat-6 acasă, 28-30 decisions
// Cluster A-E verbatim).
//
// ZERO fabrication beyond §9.5 spec. ZERO Date.now / Math.random — all values
// static per ADR 018 §2 deterministic contract.

/**
 * Persona id enum — cross-ref ADR 017 demographic prior + Profile Typing tier.
 *
 * @type {Readonly<{MARIA: 'maria', GIGICA: 'gigica', MARIUS: 'marius'}>}
 */
export const PERSONA = Object.freeze({
  MARIA:  'maria',
  GIGICA: 'gigica',
  MARIUS: 'marius',
});

/**
 * Calibration tier ids per Cluster C5 + ADR 009.
 *
 * T0 cold start: mind-muscle cues OFF (calibration noise high)
 * T1+ established: profile-typing-aware activation
 *
 * @type {Readonly<{T0: 'T0', T1: 'T1', T2: 'T2'}>}
 */
export const CALIBRATION_TIERS = Object.freeze({
  T0: 'T0',
  T1: 'T1',
  T2: 'T2',
});

/**
 * Cue delivery timing enum per Cluster B8 verbatim:
 *   PRE_SET (intro before set) + POST_SET (RIR feedback / form check)
 *   NU INTRA_SET — preserve user concentration during execution Q8=D
 *   MID_REST = user-initiated reactive elaboration via 💡 tap (B1 Q1=C consistent)
 *
 * @type {Readonly<{PRE_SET: 'PRE_SET', POST_SET: 'POST_SET', MID_REST: 'MID_REST'}>}
 */
export const CUE_DELIVERY_TIMING = Object.freeze({
  PRE_SET:   'PRE_SET',
  POST_SET:  'POST_SET',
  MID_REST:  'MID_REST',
});

/**
 * Persona notation style per Cluster B3 Q3 verbatim (Daniel push-back Maria
 * zero notation strict):
 *   Maria verbal:        "coboară lent, două secunde" (zero numeric strict)
 *   Gigica hibrid:       "tempo 2-X-2-X (coboară 2s)" (verbal + notation)
 *   Marius numeric pure: "Tempo 2-1-2-0" (notation strict)
 *
 * @type {Readonly<{VERBAL: 'verbal', HIBRID: 'hibrid', NUMERIC: 'numeric'}>}
 */
export const NOTATION_STYLE = Object.freeze({
  VERBAL:  'verbal',
  HIBRID:  'hibrid',
  NUMERIC: 'numeric',
});

/**
 * Persona → notation style mapping per Cluster B3 Q3 verbatim.
 *
 * Maria zero notation strict invariant — Daniel push-back fundamental
 * anti-friction Maria 65 cognitive load (consistent SUFLET F2 alignment).
 *
 * @type {Readonly<Object<string, string>>}
 */
export const PERSONA_NOTATION = Object.freeze({
  maria:  NOTATION_STYLE.VERBAL,
  gigica: NOTATION_STYLE.HIBRID,
  marius: NOTATION_STYLE.NUMERIC,
});

/**
 * Persona → tone style per Cluster D18 Q18=D verbatim:
 *   Maria rationale-first  ("De ce coboară lent? Pentru a controla încărcarea articulară.")
 *   Gigica suggestion      ("Sugerez tempo 2-1-2-0 pentru hipertrofie.")
 *   Marius imperative      ("Tempo 2-1-2-0. Execute.")
 *
 * @type {Readonly<{RATIONALE_FIRST: 'rationale_first', SUGGESTION: 'suggestion', IMPERATIVE: 'imperative'}>}
 */
export const TONE_STYLE = Object.freeze({
  RATIONALE_FIRST: 'rationale_first',
  SUGGESTION:      'suggestion',
  IMPERATIVE:      'imperative',
});

/**
 * Persona → tone mapping per Cluster D18 Q18=D verbatim.
 *
 * @type {Readonly<Object<string, string>>}
 */
export const PERSONA_TONE = Object.freeze({
  maria:  TONE_STYLE.RATIONALE_FIRST,
  gigica: TONE_STYLE.SUGGESTION,
  marius: TONE_STYLE.IMPERATIVE,
});

/**
 * Movement category enum per Cluster B2 base library taxonomy.
 *
 * @type {Readonly<{COMPOUND: 'compound', ISOLATION: 'isolation'}>}
 */
export const MOVEMENT_CATEGORY = Object.freeze({
  COMPOUND:  'compound',
  ISOLATION: 'isolation',
});

/**
 * Top-30 compound exercise IDs per Cluster B2 Q2=C Bugatti depth verbatim.
 * Pattern base library covers majority; top-30 compound overrides craft signature.
 *
 * @type {ReadonlyArray<string>}
 */
export const TOP_30_COMPOUND_IDS = Object.freeze([
  // Lower body compound (Periodization §9.1 Cluster B3 weighted ×3)
  'squat', 'front_squat', 'deadlift', 'sumo_deadlift', 'romanian_deadlift',
  'hip_thrust', 'bulgarian_split_squat', 'leg_press', 'lunge', 'good_morning',
  // Upper body compound push (×2)
  'bench_press', 'incline_bench_press', 'overhead_press', 'dip', 'push_up',
  // Upper body compound pull (×2)
  'row', 'pendlay_row', 'pull_up', 'chin_up', 'lat_pulldown',
  'face_pull', 'cable_row',
  // Cross-pattern compound
  'clean', 'snatch', 'clean_and_press', 'thruster', 'kettlebell_swing',
  'turkish_get_up', 'farmer_carry', 'sled_push',
]);

/**
 * Mesocycle phase enum per §9.1 Periodization (Cluster D11+D12 cross-ref).
 *
 * High-intensity phases trigger Cluster D11 form-conservative amplification.
 * DELOAD week triggers Cluster D12 mind-muscle unlock.
 *
 * @type {Readonly<{LOAD: 'LOAD', LOAD_PLUS: 'LOAD+', PEAK: 'PEAK', DELOAD: 'DELOAD'}>}
 */
export const MESOCYCLE_PHASE = Object.freeze({
  LOAD:      'LOAD',
  LOAD_PLUS: 'LOAD+',
  PEAK:      'PEAK',
  DELOAD:    'DELOAD',
});

/**
 * High-intensity phases per Cluster D11 Q11=B verbatim.
 * Tempo emite form-conservative amplification când Periodization phase = high_intensity.
 *
 * @type {ReadonlyArray<string>}
 */
export const HIGH_INTENSITY_PHASES = Object.freeze([
  MESOCYCLE_PHASE.PEAK,
  MESOCYCLE_PHASE.LOAD_PLUS,
]);

/**
 * Energy adjustment direction enum per §9.3 Engine Energy Adjustment cross-ref.
 *
 * Cluster D13 Q13=B: Energy DOWN → Tempo emite slow eccentric universal cue
 * (NU ROM partial — Daniel push-back Gemini self-flagged ROM partial REJECT).
 *
 * @type {Readonly<{UP: 'UP', DOWN: 'DOWN', NONE: 'NONE'}>}
 */
export const ENERGY_DIRECTION = Object.freeze({
  UP:   'UP',
  DOWN: 'DOWN',
  NONE: 'NONE',
});

/**
 * Suppression mode per Cluster C17 Q17=C verbatim:
 *   T0/T1 hard suppression = user toggle "știu" Q9 explicit → cue NU surface
 *   T2+ soft auto-retire   = N=10 sessions implicit → cue auto-retire (user can re-activate)
 *
 * @type {Readonly<{HARD: 'HARD', SOFT_AUTO_RETIRE: 'SOFT_AUTO_RETIRE'}>}
 */
export const SUPPRESSION_MODE = Object.freeze({
  HARD:             'HARD',
  SOFT_AUTO_RETIRE: 'SOFT_AUTO_RETIRE',
});

/**
 * Adaptive frequency dual signal per Cluster C7 Q7=D + Q9=D verbatim:
 *   Explicit "știu" user toggle (acquired)
 *   Implicit N=10 sessions consecutive cu form breakdown < threshold
 *
 * @type {Readonly<{
 *   acquisitionImplicitN: number,
 *   formBreakdownThreshold: number,
 * }>}
 */
export const ADAPTIVE_FREQUENCY = Object.freeze({
  acquisitionImplicitN:    10,
  formBreakdownThreshold:  0,
});

/**
 * Tier-aware depth per Cluster C15 Q15=B verbatim:
 *   T0 minimal (cue text-only basic)
 *   T1+ richer (cue + rationale + suggested fix)
 *   T2+ adaptive (cue + persona-aware tone + ML cue selection v1.5+ deferred)
 *
 * @type {Readonly<{T0: 'minimal', T1: 'richer', T2: 'adaptive'}>}
 */
export const CUE_DEPTH = Object.freeze({
  T0: 'minimal',
  T1: 'richer',
  T2: 'adaptive',
});

/**
 * Form-conservative amplification factor per Cluster D11 Q11=B verbatim.
 * Applied when Periodization phase = high_intensity — slower eccentric +
 * controlled concentric + safety emphasis.
 *
 * V1 conservative pick: amplification = 1.5× normal cue depth/specificity.
 *
 * @type {number}
 */
export const FORM_CONSERVATIVE_AMPLIFICATION = 1.5;

/**
 * RIR Matrix auto-bump constant per Cluster D14 Q14=B verbatim.
 * User toggles "form breakdown" mid-set → Tempo signals downstream auto-bump
 * RIR target +1 next set.
 *
 * @type {number}
 */
export const RIR_AUTO_BUMP = 1;
