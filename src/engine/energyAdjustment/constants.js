// Engine Energy Adjustment V1 constants per ADR 026 §9.3 Cluster 1-5 verbatim.
//
// Pipeline §42.10 position 3rd canonical: Periodization → Goal Adaptation →
// Energy Adjustment → Bayesian → Tempo → Specialization → Warm-up → Deload.
// (NU position 5 legacy ADR 027 "Engine #5" naming — eclipsed by §9.3 SSOT).
//
// Source: 03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md §9.3
// (Cluster 2 input strategy + Cluster 3 bidirectional ±15% asymmetric +
//  Cluster 4 invariants + Cluster 5 safety/compliance verbatim).
//
// ZERO fabrication beyond §9.3 spec. ZERO Date.now / Math.random — all values
// static per ADR 018 §2 deterministic contract.

/**
 * Emoji 3-state holistic input (Cluster 2 §9.3.2 Q1=C hibrid + Q15=C):
 * - 🟢 GREEN  = ready to push (UP eligible cumulative N≥3)
 * - 🟡 YELLOW = caution (NU drill-down anti-Maria-65-friction)
 * - 🔴 RED    = distressed (drill-down strict required)
 *
 * @type {Readonly<{GREEN: 'green', YELLOW: 'yellow', RED: 'red'}>}
 */
export const EMOJI_STATE = Object.freeze({
  GREEN:  'green',
  YELLOW: 'yellow',
  RED:    'red',
});

/**
 * Drill-down causes — strict 🔴 RED only per Q15=C anti-Maria-65-friction.
 * 4-cauze fixed labels (NU continuous Likert NU free-text V1).
 *
 * @type {Readonly<{STRES: 'stres', SOMN: 'somn', DURERE: 'durere', ALTUL: 'altul'}>}
 */
export const DRILL_DOWN_CAUSES = Object.freeze({
  STRES:  'stres',
  SOMN:   'somn',
  DURERE: 'durere',
  ALTUL:  'altul',
});

/**
 * Adjustment direction enum per Cluster 3 §9.3.3 bidirectional asymmetric:
 * - UP   = +Δ% requires N≥3 conditions cumulative + Periodization phase gate
 * - DOWN = -Δ% single trigger immediate (anti-burnout protect prima)
 * - NONE = no adjustment session-level
 *
 * @type {Readonly<{UP: 'UP', DOWN: 'DOWN', NONE: 'NONE'}>}
 */
export const ADJUSTMENT_DIRECTION = Object.freeze({
  UP:   'UP',
  DOWN: 'DOWN',
  NONE: 'NONE',
});

/**
 * Bidirectional ±15% conservative range per Cluster 3 §9.3.3 Q6=D verbatim.
 * Range maxim adjustment session-level — bidirectional symmetric (UP +15%
 * / DOWN -15% ceiling identical, direction asymmetric trigger logic per Q7).
 *
 * @type {Readonly<{magnitudeT1Plus: number, magnitudeT0: number}>}
 */
export const ADJUSTMENT_MAGNITUDE = Object.freeze({
  magnitudeT1Plus: 0.15, // T1+ established tier ±15% full range Q13=B
  magnitudeT0:     0.10, // T0 cold start tier ±10% conservative Q13=B anti-overfit
});

/**
 * UP +15% strict gating cumulative conditions per Cluster 3 §9.3.3 Q7=B asymmetric.
 *
 * UP +15% requires ALL conditions cumulative (NU OR — strict AND):
 * - N≥3 sessions consecutive cu emoji GREEN stable
 * - no recovery red flags (energy 'red' window absent recent)
 * - no stagnation markers
 * - Periodization phase gate "high_intensity != true" (NU PEAK NU LOAD+)
 *
 * Anti "Sarcastic UP" Marius 5:1 sapt 4-5 scenario unde cascade aggressive
 * compound (5:1 dual-signal green PLUS Energy UP +15% PLUS PEAK phase) =
 * Invariant 1 (V ≤ MRV) + Invariant 5 Medical Safety violation.
 *
 * @type {Readonly<{
 *   minConsecutiveGreenSessions: number,
 *   recoveryRedWindow: number,
 *   forbiddenPhases: ReadonlyArray<string>,
 * }>}
 */
export const UP_GATING_CONDITIONS = Object.freeze({
  minConsecutiveGreenSessions: 3,
  recoveryRedWindow:           3, // last 3 sessions zero 'red'
  forbiddenPhases:             Object.freeze(['PEAK', 'LOAD+']), // high_intensity == true gates
});

/**
 * Yo-yo anti-flap 3-session window V1 only per Cluster 4 §9.3.4 Q14=D verbatim.
 *
 * Anti-flap rolling window: daca adjustment direction flipped UP→DOWN→UP in 3
 * sesiuni consecutive → engine SUPPRESSES 3rd flip, holds current direction,
 * logs signal 'yoyo_anti_flap_suppressed'.
 *
 * Sprinter/Marathon profile-typing modulators DEFERRED v1.5+ post-Beta data
 * real signal validation (Q14 deferred).
 *
 * @type {Readonly<{
 *   windowSize: number,
 *   sprinterMarathonModulatorsActive: boolean,
 * }>}
 */
export const YOYO_ANTI_FLAP = Object.freeze({
  windowSize:                       3,
  sprinterMarathonModulatorsActive: false, // V1 deferred — v1.5+ activation post-Beta
});

/**
 * Soft override sub-Floor max consecutive sessions per Cluster 4 §9.3.4 Q9
 * anti-drift verbatim. 3rd session sub-Floor → trigger Engine Deload Protocol
 * escalation cross-ref §9.8.
 *
 * @type {number}
 */
export const SUB_FLOOR_MAX_CONSECUTIVE = 2;

/**
 * Bayesian σ variance modifier Engine #3 cross-engine hook per Cluster 4
 * §9.3.4 Q12=C sophisticated formula post-Beta calibration target.
 *
 * V1 conservative pick: σ > σ_threshold → adjustment × 0.7 dampening factor.
 *
 * Cross-ref ADR 022 Bayesian Nutrition §3.X "Pre-processing modulator
 * readiness cu Neutral fallback T0 cold start".
 *
 * @type {Readonly<{
 *   sigmaThresholdHigh: number,
 *   dampeningFactor: number,
 * }>}
 */
export const BAYESIAN_VARIANCE_MODIFIER = Object.freeze({
  sigmaThresholdHigh: 0.20, // V1 conservative pick — calibration target post-Beta
  dampeningFactor:    0.70, // adjustment × 0.7 cand σ > threshold
});

/**
 * Tier ids per Cluster 4 §9.3.4 Q13=B tier-aware:
 * - T0 cold start: ±10% conservative range maxim adjustment
 * - T1, T2+ established: ±15% full range
 *
 * Cross-ref [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou
 * after T2 Unlock Convergence Guard formula.
 *
 * @type {Readonly<{T0: 'T0', T1: 'T1', T2: 'T2'}>}
 */
export const CALIBRATION_TIERS = Object.freeze({
  T0: 'T0',
  T1: 'T1',
  T2: 'T2',
});

/**
 * MRV invariant 1 immutable Q8=A — Hard cap MRV absolute preserved Layer C
 * sanity bound per Periodization §9.1 Cluster 5 + ADR 026 §9.3.4 verbatim.
 *
 * Energy Adjustment NU peste MRV ceiling regardless adjustment magnitude.
 * Anti-drift safeguard Bugatti craft.
 *
 * @type {boolean}
 */
export const MRV_INVARIANT_IMMUTABLE = true;

/**
 * Hard cap intensity 90% 1RM Layer C sanity bound per Periodization §9.1
 * Cluster 5 — Energy Adjustment NU peste 90% 1RM regardless UP +15%.
 *
 * @type {number}
 */
export const HARD_CAP_INTENSITY_PCT_1RM = 0.90;

/**
 * Medical referral copy verbatim Gigel test PASS per Cluster 5 §9.3.5 Q18=D.
 *
 * Generic "specialist" REJECTED (Daniel push-back mid-flight): ambiguous user
 * could interpret as "antrenor specializat" sau "nutritionist" → dilueaza
 * Invariant 5 Medical Safety message. Specific pathway = unambiguous.
 *
 * @type {string}
 */
export const MEDICAL_REFERRAL_COPY = 'Consulta medicul de familie sau un specialist in medicina sportiva';

/**
 * Categorical aggregation rules table per Cluster 2 §9.3.2 Q3=C auditable.
 *
 * Map: emoji state → adjustment direction signal.
 * Direction triggered: GREEN → UP eligible (cumulative N≥3) | YELLOW → NONE
 * (caution preserve baseline) | RED → DOWN immediate (anti-burnout).
 *
 * Bugatti craft `<engine>.tree.ts` data file reusable testing + Beta cohort
 * validation V1.
 *
 * @type {Readonly<Object<string, 'UP_ELIGIBLE'|'DOWN_IMMEDIATE'|'NONE'>>}
 */
export const AGGREGATION_RULES_TABLE = Object.freeze({
  green:  'UP_ELIGIBLE',
  yellow: 'NONE',
  red:    'DOWN_IMMEDIATE',
});

/**
 * Anti-spam drill-down cooldown rolling cross-session anti-fatigue per
 * Cluster 2 §9.3.2 verbatim "anti-spam invariant aliniat Engine #2".
 *
 * Cross-ref ADR 024 §2.8 Q8 LOCKED re-prompt anti-spam logic precedent.
 *
 * @type {Readonly<{drillDownCooldownDays: number}>}
 */
export const ANTI_SPAM = Object.freeze({
  drillDownCooldownDays: 1, // 1 session per drill-down 🔴 prompt (NU spam multi-prompt sesiune)
});

/**
 * Recovery red flag value per CDL convention (cross-ref Periodization
 * constants.js ENERGY_RED_FLAG). Sessions cu energy=='red' count toward UP
 * gating recovery red flag check.
 *
 * @type {string}
 */
export const RECOVERY_RED_FLAG = 'red';
