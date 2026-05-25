// ══ DIMENSION CONTRACT (ADR 018 §2) ═══════════════════════════════════════
// Standardized interface for engine dimensions. Every dimension exports an
// `analyze(input) → DimensionResult` function with the shape pinned here.
//
// Contract guarantees per ADR 018 §2:
//   - PURE FUNCTION: no side effects, no localStorage writes, no Firebase
//     calls. (Side effects belong to Decision Cluster post-aggregation.)
//   - DETERMINISTIC: same input → same output. No Date.now() / Math.random()
//     inside analyze; pass via ctx.
//   - TOTAL FUNCTION: never throws. Insufficient data = tier 'none',
//     confidence 'low', empty arrays.
//   - ASYNC-CAPABLE (DP-2): may return a Promise; cluster awaits.
//
// Per ADR 005 (vanilla JS), types pinned via JSDoc typedefs — no TypeScript.

/**
 * @typedef {Object} CoachContextSnapshot
 * @property {string|object} [calibrationLevel] - ADR 009 tier
 * @property {object} [readiness]
 * @property {Array<any>} [allLogs]
 * @property {Array<any>} [recentLogs]
 * @property {Array<any>} [patterns]
 * @property {object} [autoAggression]
 * // ...other ctx fields per coachContext.js (open-ended)
 *
 * @typedef {Object} CDLEntry
 *   - Active (non-superseded) Coach Decision Log entry per ADR 011.
 *
 * @typedef {Object} UserProfile
 * @property {number} [age]
 * @property {string} [sex]
 * @property {number} [kg]
 * @property {number} [height]
 * @property {string} [phase]
 * @property {object} [profileTyping]
 * // ...other profile fields (open-ended)
 *
 * @typedef {Object<string, boolean>} FeatureFlags
 *   - Resolved per-user flag map (ADR 018 §5)
 *
 * @typedef {Object} DimensionInput
 * @property {CoachContextSnapshot} ctx
 * @property {Array<CDLEntry>} cdl
 * @property {UserProfile} userProfile
 * @property {FeatureFlags} flags
 *
 * @typedef {Object} Recommendation
 * @property {string} action
 *   - Standardized verb: 'gate_session' | 'reduce_volume' | 'inject_warning' |
 *                        'inject_banner' | 'shorten_session' |
 *                        'set_baseline_volume' | 'set_baseline_frequency' |
 *                        'calibrate_aa_threshold' | etc.
 * @property {number} priority - 0-100 numeric (ADR 004)
 * @property {object} payload - Action-specific data (multiplier, message, etc.)
 * @property {string} rationale - Human-readable why
 *
 * @typedef {'none'|'LOW'|'MED'|'HIGH'|string} DimensionTier
 *
 * @typedef {'low'|'medium'|'high'} DimensionConfidence
 *
 * @typedef {Object} DimensionResult
 * @property {string} id - Dimension id from registry (matches DimensionRegistryEntry.id)
 * @property {DimensionTier} tier
 * @property {DimensionConfidence} confidence
 * @property {Array<string>} signals - Human-readable signal IDs
 * @property {Array<Recommendation>} recommendations
 * @property {object} trace - Free-form debug info, NOT consumed by engine
 * @property {object} meta - Dimension-specific data (open shape)
 */

/**
 * Pipeline stages (ADR 018 §3). Use these constants instead of magic strings.
 *
 * @readonly
 * @enum {string}
 */
export const STAGES = Object.freeze({
  GATE: 'GATE',
  ADJUSTMENT: 'ADJUSTMENT',
  ENHANCEMENT: 'ENHANCEMENT',
});

/**
 * Confidence levels (ADR 018 §2).
 *
 * @readonly
 * @enum {string}
 */
export const CONFIDENCE = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
});

/**
 * Tier semantic labels (ADR 018 §2). Dimensions may use these or
 * dimension-specific strings (the type allows any string), but these
 * are the canonical severity levels.
 *
 * @readonly
 * @enum {string}
 */
export const TIERS = Object.freeze({
  NONE: 'none',
  LOW: 'LOW',
  MED: 'MED',
  HIGH: 'HIGH',
});

/**
 * Standardized recommendation action verbs. Dimensions SHOULD use these
 * when applicable; new actions added here as engine evolves. The cluster
 * routes by action verb in Stage 2/3 logic.
 *
 * @readonly
 * @enum {string}
 */
export const ACTIONS = Object.freeze({
  // GATE stage actions
  GATE_SESSION: 'gate_session',           // short-circuit pipeline → rest/blocker
  // ADJUSTMENT stage actions
  REDUCE_VOLUME: 'reduce_volume',         // multiplicative volume cap (payload.multiplier)
  REDUCE_SETS: 'reduce_sets',             // additive sets cap (payload.cap)
  CALIBRATE_AA_THRESHOLD: 'calibrate_aa_threshold',
  SET_BASELINE_VOLUME: 'set_baseline_volume',
  SET_BASELINE_FREQUENCY: 'set_baseline_frequency',
  // ENHANCEMENT stage actions
  INJECT_WARNING: 'inject_warning',
  INJECT_BANNER: 'inject_banner',
  SHORTEN_SESSION: 'shorten_session',
});

/**
 * Action → recommended stage mapping. Used by stage validation in
 * Decision Cluster — a recommendation whose action does not match the
 * dimension's declared stage triggers a warning (or throw in test mode).
 *
 * Some actions are universal (no stage constraint) — represented as null.
 *
 * @type {Object<string, string|null>}
 */
export const ACTION_STAGE_MAP = Object.freeze({
  [ACTIONS.GATE_SESSION]:           STAGES.GATE,
  [ACTIONS.REDUCE_VOLUME]:          STAGES.ADJUSTMENT,
  [ACTIONS.REDUCE_SETS]:            STAGES.ADJUSTMENT,
  [ACTIONS.CALIBRATE_AA_THRESHOLD]: STAGES.ADJUSTMENT,
  [ACTIONS.SET_BASELINE_VOLUME]:    STAGES.ADJUSTMENT,
  [ACTIONS.SET_BASELINE_FREQUENCY]: STAGES.ADJUSTMENT,
  [ACTIONS.INJECT_WARNING]:         STAGES.ENHANCEMENT,
  [ACTIONS.INJECT_BANNER]:          STAGES.ENHANCEMENT,
  [ACTIONS.SHORTEN_SESSION]:        STAGES.ENHANCEMENT,
});

/**
 * Construct a DimensionResult from a partial object, filling defaults
 * for the "no signal" case. Use this in dimension `analyze()` early-return
 * paths to guarantee total-function compliance.
 *
 * @param {Partial<DimensionResult>} partial - At minimum `{ id }`
 * @returns {DimensionResult}
 */
export function createDimensionResult(partial) {
  if (!partial || typeof partial !== 'object') {
    throw new TypeError('createDimensionResult: partial must be an object');
  }
  if (typeof partial.id !== 'string' || partial.id.length === 0) {
    throw new TypeError('createDimensionResult: partial.id must be a non-empty string');
  }
  return {
    id: partial.id,
    tier: partial.tier ?? TIERS.NONE,
    confidence: partial.confidence ?? CONFIDENCE.LOW,
    signals: Array.isArray(partial.signals) ? partial.signals : [],
    recommendations: Array.isArray(partial.recommendations) ? partial.recommendations : [],
    trace: partial.trace && typeof partial.trace === 'object' ? partial.trace : {},
    meta: partial.meta && typeof partial.meta === 'object' ? partial.meta : {},
  };
}

/**
 * Validate the shape of a DimensionResult. Throws on violation.
 * Used in tests + `assertValidDimensionResult` for runtime sanity check.
 *
 * @param {*} result
 * @returns {void}
 */
export function assertValidDimensionResult(result) {
  if (!result || typeof result !== 'object') {
    throw new TypeError('DimensionResult must be an object');
  }
  if (typeof result.id !== 'string' || result.id.length === 0) {
    throw new TypeError('DimensionResult.id must be a non-empty string');
  }
  if (typeof result.tier !== 'string') {
    throw new TypeError(`DimensionResult[${result.id}].tier must be a string`);
  }
  if (!Object.values(CONFIDENCE).includes(result.confidence)) {
    throw new TypeError(
      `DimensionResult[${result.id}].confidence must be one of [${Object.values(CONFIDENCE).join(', ')}] (got '${result.confidence}')`
    );
  }
  if (!Array.isArray(result.signals)) {
    throw new TypeError(`DimensionResult[${result.id}].signals must be an array`);
  }
  for (const sig of result.signals) {
    if (typeof sig !== 'string') {
      throw new TypeError(`DimensionResult[${result.id}].signals must contain only strings (got ${typeof sig})`);
    }
  }
  if (!Array.isArray(result.recommendations)) {
    throw new TypeError(`DimensionResult[${result.id}].recommendations must be an array`);
  }
  for (const rec of result.recommendations) {
    assertValidRecommendation(rec, result.id);
  }
  if (!result.trace || typeof result.trace !== 'object' || Array.isArray(result.trace)) {
    throw new TypeError(`DimensionResult[${result.id}].trace must be a plain object`);
  }
  if (!result.meta || typeof result.meta !== 'object' || Array.isArray(result.meta)) {
    throw new TypeError(`DimensionResult[${result.id}].meta must be a plain object`);
  }
}

/**
 * Validate a single Recommendation. Throws on violation.
 *
 * @param {*} rec
 * @param {string} [parentId='?'] - For error messages
 * @returns {void}
 */
export function assertValidRecommendation(rec, parentId = '?') {
  if (!rec || typeof rec !== 'object') {
    throw new TypeError(`Recommendation in [${parentId}] must be an object`);
  }
  if (typeof rec.action !== 'string' || rec.action.length === 0) {
    throw new TypeError(`Recommendation in [${parentId}].action must be a non-empty string`);
  }
  if (typeof rec.priority !== 'number' || rec.priority < 0 || rec.priority > 100) {
    throw new TypeError(`Recommendation in [${parentId}].priority must be a number 0..100 (got ${rec.priority})`);
  }
  if (!rec.payload || typeof rec.payload !== 'object' || Array.isArray(rec.payload)) {
    throw new TypeError(`Recommendation in [${parentId}].payload must be a plain object`);
  }
  if (typeof rec.rationale !== 'string') {
    throw new TypeError(`Recommendation in [${parentId}].rationale must be a string`);
  }
}

/**
 * Validate that a recommendation's action verb matches the declared dimension
 * stage. Returns true if compatible, false if mismatched. Unknown actions
 * (not in ACTION_STAGE_MAP) return true — extension hatch for new verbs.
 *
 * @param {string} action
 * @param {string} declaredStage
 * @returns {boolean}
 */
export function isActionStageCompatible(action, declaredStage) {
  const expected = ACTION_STAGE_MAP[action];
  if (expected === undefined) return true; // unknown action: pass-through
  return expected === declaredStage;
}
