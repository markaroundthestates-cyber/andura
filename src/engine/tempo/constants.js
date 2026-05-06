// Engine Tempo V1 constants per ADR 026 §9.5 Cluster A-E verbatim.
//
// Pipeline §42.10 position 5th canonical: Periodization → Goal Adaptation →
// Energy → Bayesian Nutrition → Tempo → Specialization → Warm-up → Deload.
// Engine numbering "Engine #6" în ADR 028 file naming = legacy chat strategic
// spec session ordering NU pipeline canonical position (§9.5 clarifying header).
//
// Source: 03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.5
// (commit a9b7cbd LANDED 2026-05-06 afternoon chat-6 acasă, 28-30 decisions
// Cluster A-E verbatim aggregation chat strategic 2026-05-05 birou late sources).
//
// Source 3 NU disponibil: ADR 028 = STUB legacy precedent §9.3 Energy ADR 027
// stub pattern (NU §9.4 Bayesian ADR 022 SPEC READY V1 case). 2-way parity only
// Source 1 ↔ Source 2.
//
// ZERO fabrication beyond §9.5 spec. ZERO Date.now / Math.random — all values
// static per ADR 018 §2 deterministic contract.

/**
 * Calibration tier ids per ADR 009 + Cluster C5 mind-muscle gating.
 *
 * @type {Readonly<{T0: 'T0', T1: 'T1', T2: 'T2'}>}
 */
export const CALIBRATION_TIERS = Object.freeze({
  T0: 'T0',
  T1: 'T1',
  T2: 'T2',
});

/**
 * Persona archetype per ADR 017 demographic prior + Cluster B3/D18 verbatim:
 *   Maria = anti-friction, verbal-only, zero notation strict (Daniel push-back
 *           fundamental — anti cognitive load Maria 65 SUFLET F2 alignment).
 *   Gigica = hibrid verbal + notation (verbal explanation cu notation).
 *   Marius = numeric pure notation strict (technical literacy advanced).
 *
 * @type {Readonly<{MARIA: 'maria', GIGICA: 'gigica', MARIUS: 'marius'}>}
 */
export const PERSONA = Object.freeze({
  MARIA:  'maria',
  GIGICA: 'gigica',
  MARIUS: 'marius',
});

/**
 * Cue delivery timing enum per Cluster B8 verbatim — Q8=D pre-set + post-set
 * ONLY (NU intra-set distraction, preserves user concentration during execution).
 *
 *   PRE_SET  = engine surfaces tempo notation + form cue ÎNAINTE of set (intro)
 *   POST_SET = engine surfaces RIR feedback / form check post-set
 *   MID_REST = user-initiated reactive elaboration (tap-to-expand 💡 Q6=D)
 *
 * NU INTRA_SET — Q8=D explicit constraint preserve user concentration.
 *
 * @type {Readonly<{PRE_SET: 'PRE_SET', POST_SET: 'POST_SET', MID_REST: 'MID_REST'}>}
 */
export const CUE_DELIVERY_TIMING = Object.freeze({
  PRE_SET:  'PRE_SET',
  POST_SET: 'POST_SET',
  MID_REST: 'MID_REST',
});

/**
 * Movement category taxonomy per Cluster B2 verbatim — base library covers
 * generic compound/isolation; top-30 compound overrides craft Bugatti depth.
 *
 * @type {Readonly<{COMPOUND: 'compound', ISOLATION: 'isolation'}>}
 */
export const MOVEMENT_CATEGORY = Object.freeze({
  COMPOUND:  'compound',
  ISOLATION: 'isolation',
});

/**
 * Top-30 compound exercise IDs per Cluster B2 — movement-specific cues craft
 * Bugatti depth (squat / deadlift / bench / OHP / row / hip thrust / etc.).
 *
 * V1 conservative pick: 12 canonical movements covering majority sessions; full
 * 30 expansion candidate post-Beta data signal §9.5.6 Reconsideration Trigger 7
 * ML cue selection per user response history.
 *
 * @type {ReadonlyArray<string>}
 */
export const TOP_COMPOUND_MOVEMENTS = Object.freeze([
  'back_squat',
  'front_squat',
  'deadlift',
  'romanian_deadlift',
  'bench_press',
  'incline_bench_press',
  'overhead_press',
  'barbell_row',
  'pull_up',
  'hip_thrust',
  'lunge',
  'bulgarian_split_squat',
]);

/**
 * Frequency thresholds per Cluster C7 verbatim Q7=D + Q9=D dual signal:
 *   explicit "știu" user toggle (acquired) + implicit N=10 sessions consecutive
 *   cu form breakdown < threshold.
 *
 * V1 default conservative: N=10 acquisition window. §9.5.6 Reconsideration
 * Trigger 4 candidate tier-aware (Beginner N=15 / Intermediate N=10 / Advanced
 * N=5) pending post-Beta useri reali signal.
 *
 * @type {Readonly<{
 *   acquisitionSessionsImplicitDefault: number,
 *   formBreakdownRateThreshold: number,
 * }>}
 */
export const FREQUENCY_THRESHOLDS = Object.freeze({
  acquisitionSessionsImplicitDefault: 10,
  formBreakdownRateThreshold:         0.20, // <20% form breakdown rate signals acquisition
});

/**
 * Tier-aware mind-muscle activation per Cluster C5 verbatim Q5=C:
 *   T0 cold start = mind-muscle cues OFF (calibration window noise high,
 *                   anti-overfit early signals)
 *   T1 established = profile-typing-aware activation (Profile Typing data
 *                    sufficient personalize cue style per user response history)
 *   T2 high confidence = adaptive depth (cue + persona-aware tone + ML cue
 *                        selection v1.5+ deferred §9.5.6 Trigger 7)
 *
 * Cross-ref ADR 009 §AMENDMENT 2026-05-05 birou after Convergence Guard
 * "T2 Unlock" — tier transitions cross-cutting ALL engines NU Tempo specific.
 *
 * @type {Readonly<Object<string, boolean>>}
 */
export const MIND_MUSCLE_ACTIVATION_BY_TIER = Object.freeze({
  T0: false,  // OFF cold start (calibration noise)
  T1: true,   // profile-typing-aware
  T2: true,   // adaptive depth
});

/**
 * Cue depth tier-aware per Cluster C15 verbatim Q15=B:
 *   T0 minimal (cue text-only basic)
 *   T1+ richer (cue + rationale + suggested fix)
 *   T2+ adaptive (cue + persona-aware tone + ML cue selection v1.5+ deferred)
 *
 * @type {Readonly<{T0: 'minimal', T1: 'rich', T2: 'adaptive'}>}
 */
export const CUE_DEPTH_BY_TIER = Object.freeze({
  T0: 'minimal',
  T1: 'rich',
  T2: 'adaptive',
});

/**
 * Suppression modes per Cluster C17 verbatim Q17=C:
 *   T0/T1 hard suppression = user toggle "știu" Q9 explicit → cue NU surface
 *                            for movement (binary on/off).
 *   T2+ soft auto-retire = N=10 sessions implicit (Q9 dual signal) → cue
 *                          auto-retire pentru movement (user can re-activate
 *                          manual via Settings UI).
 *
 * @type {Readonly<{HARD: 'hard', SOFT_AUTO_RETIRE: 'soft_auto_retire'}>}
 */
export const SUPPRESSION_MODE = Object.freeze({
  HARD:             'hard',
  SOFT_AUTO_RETIRE: 'soft_auto_retire',
});

/**
 * Suppression mode resolution by tier per Cluster C17:
 *   T0/T1 = HARD suppression (user toggle binary)
 *   T2+   = SOFT_AUTO_RETIRE (N=10 implicit acquisition + user re-activate)
 *
 * @type {Readonly<Object<string, string>>}
 */
export const SUPPRESSION_MODE_BY_TIER = Object.freeze({
  T0: SUPPRESSION_MODE.HARD,
  T1: SUPPRESSION_MODE.HARD,
  T2: SUPPRESSION_MODE.SOFT_AUTO_RETIRE,
});

/**
 * Cluster D11 — Periodization high intensity → form-conservative amplification
 * cue style modulation. Phase = PEAK or LOAD+ (high_intensity == true) → Tempo
 * emite slower eccentric, controlled concentric, safety emphasis.
 *
 * @type {Readonly<{PEAK: 'PEAK', LOAD: 'LOAD'}>}
 */
export const HIGH_INTENSITY_PHASES = Object.freeze({
  PEAK: 'PEAK',
  LOAD: 'LOAD',
});

/**
 * Cluster D12 — Periodization phase = DELOAD (W4) → Tempo unlock mind-muscle
 * cues even on T0 tier (recovery week, lower load = bandwidth for technique
 * focus). Q12=D mind-muscle activation override tier-aware default.
 *
 * @type {string}
 */
export const DELOAD_PHASE = 'DELOAD';

/**
 * Energy direction enum per §9.3 Engine Energy Adjustment cross-ref.
 * Cluster D13 Energy DOWN → slow eccentric universal NU ROM partial Q13=B.
 *
 * @type {Readonly<{UP: 'UP', DOWN: 'DOWN', NONE: 'NONE'}>}
 */
export const ENERGY_DIRECTION = Object.freeze({
  UP:   'UP',
  DOWN: 'DOWN',
  NONE: 'NONE',
});

/**
 * V1 default tempo notation prescription per Cluster B verbatim:
 *   Standard hipertrofie 2-1-2-0 (eccentric 2s / pause 1s / concentric 2s / top 0s).
 *   Slow eccentric universal Energy DOWN modulation 3-1-1-0 (Cluster D13 Q13=B).
 *   Form-conservative amplification high intensity 3-2-2-0 (Cluster D11 Q11=B).
 *   Deload week mind-muscle unlock 2-2-2-1 controlled (Cluster D12 Q12=D).
 *
 * Notation format: eccentric-pauseBottom-concentric-pauseTop seconds.
 * Source: Standard hypertrophy literature canonical (Israetel/Helms NU verbatim
 * §9.5 source — accept silent-default precedent §9.1 Periodization V1
 * `intensityCorridorForGoal` Israetel/Helms standard, future review optional
 * post-Beta useri reali signal §9.5.6 Reconsideration Triggers).
 *
 * @type {Readonly<{
 *   STANDARD: string,
 *   SLOW_ECCENTRIC_UNIVERSAL: string,
 *   FORM_CONSERVATIVE_AMPLIFIED: string,
 *   DELOAD_CONTROLLED: string,
 * }>}
 */
export const TEMPO_NOTATION = Object.freeze({
  STANDARD:                     '2-1-2-0',
  SLOW_ECCENTRIC_UNIVERSAL:     '3-1-1-0',
  FORM_CONSERVATIVE_AMPLIFIED:  '3-2-2-0',
  DELOAD_CONTROLLED:            '2-2-2-1',
});

/**
 * Cluster D Q4=A V1 — RIR mismatch (user form breakdown vs RIR Matrix expected)
 * = silent telemetry only CDL audit trail. NU active trigger V1 — engine NU
 * adjusts session current. V1.5+ candidate §9.5.6 Reconsideration Trigger 2:
 * V1.5 active trigger (form breakdown → Energy DOWN escalation Hook §9.3).
 *
 * @type {string}
 */
export const RIR_MISMATCH_BEHAVIOR_V1 = 'silent_telemetry_only';

/**
 * Schema-level constants — anti-magic-number per ADR 005 vanilla JS.
 *
 * @type {Readonly<{
 *   confidenceLowFloor: number,
 *   confidenceMediumFloor: number,
 * }>}
 */
export const SCHEMA_CONSTANTS = Object.freeze({
  confidenceLowFloor:    1,
  confidenceMediumFloor: 2,
});
