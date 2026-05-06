// Engine Tempo V1 types per ADR 026 §9.5 + ADR 018 §2 Standardized Dimension
// Contract.
//
// TempoResult extends DimensionResult per ADR 018 §2 — adds blueprint fields
// în `meta` per §9.5.1 Cluster A verbatim.
//
// Pipeline §42.10 position 5th canonical.
//
// Per ADR 005 Vanilla JS: types pinned via JSDoc typedefs (NU TypeScript).

/**
 * Persona id per Cluster B3 + ADR 017.
 *
 * @typedef {'maria'|'gigica'|'marius'} Persona
 */

/**
 * Calibration tier per Cluster C5 + ADR 009.
 *
 * @typedef {'T0'|'T1'|'T2'} CalibrationTier
 */

/**
 * Movement category per Cluster B2 base library taxonomy.
 *
 * @typedef {'compound'|'isolation'} MovementCategory
 */

/**
 * Notation style per Cluster B3 Q3 verbatim (Maria zero notation strict).
 *
 * @typedef {'verbal'|'hibrid'|'numeric'} NotationStyle
 */

/**
 * Tone style per Cluster D18 Q18=D verbatim.
 *
 * @typedef {'rationale_first'|'suggestion'|'imperative'} ToneStyle
 */

/**
 * Cue delivery timing per Cluster B8 Q8=D verbatim (NU INTRA_SET).
 *
 * @typedef {'PRE_SET'|'POST_SET'|'MID_REST'} CueDeliveryTiming
 */

/**
 * Suppression mode per Cluster C17 Q17=C verbatim.
 *
 * @typedef {'HARD'|'SOFT_AUTO_RETIRE'} SuppressionMode
 */

/**
 * Tempo notation per Cluster B verbatim (X-Y-Z-W eccentric/pause/concentric/pause).
 *
 * V1 simplified format: object cu eccentric (s) + pause_bottom (s) + concentric (s|'X') + pause_top (s).
 * 'X' string = explosive (concentric ASAP).
 *
 * @typedef {Object} TempoNotation
 * @property {number} eccentric_s
 * @property {number} pause_bottom_s
 * @property {number|string} concentric_s   - number sau 'X' explosive
 * @property {number} pause_top_s
 */

/**
 * Form cue per movement category cu RO native + persona-aware tone Cluster D Q18=D.
 *
 * @typedef {Object} FormCue
 * @property {string} text                  - RO native cue text (verbal sau hibrid sau numeric per persona)
 * @property {NotationStyle} notation_style - Maria verbal / Gigica hibrid / Marius numeric pure
 * @property {ToneStyle} tone               - Maria rationale-first / Gigica suggestion / Marius imperative
 * @property {string} [rationale]           - Optional richer-depth field (T1+ tier)
 * @property {string} [suggested_fix]       - Optional richer-depth field (T1+ tier)
 */

/**
 * Tempo prescription emit per Cluster B verbatim.
 *
 * @typedef {Object} TempoPrescription
 * @property {TempoNotation} notation         - Tempo X-Y-Z-W per movement category
 * @property {string} display_text            - Persona-aware rendered text (verbal/hibrid/numeric)
 * @property {boolean} reactive_expand_available - User opt-in expand via 💡 indicator (Q1=C + Q6=D)
 */

/**
 * Cross-engine signal — Periodization high intensity form-conservative amplification.
 *
 * @typedef {Object} FormConservativeSignal
 * @property {boolean} amplified
 * @property {number} amplificationFactor   - 1.0 baseline / 1.5× when high_intensity
 * @property {string} reason
 */

/**
 * Cross-engine signal — Energy DOWN slow eccentric universal Cluster D13 Q13=B.
 *
 * @typedef {Object} SlowEccentricSignal
 * @property {boolean} active
 * @property {string} reason                - Reason e.g. 'energy_down_slow_eccentric_universal'
 */

/**
 * Cross-engine signal — RIR Matrix form breakdown +1 auto-bump Cluster D14 Q14=B.
 *
 * @typedef {Object} RirAutoBumpSignal
 * @property {boolean} bump_next_set
 * @property {number} bump_amount
 * @property {string} trigger_source        - 'user_toggle_form_breakdown'
 */

/**
 * Tempo-specific blueprint emit (lives în DimensionResult.meta per §9.5.1 Cluster A).
 *
 * @typedef {Object} TempoBlueprint
 * @property {TempoPrescription} tempo_prescription   - Cluster B
 * @property {FormCue} form_cue                       - Cluster B + D (persona-aware tone)
 * @property {boolean} mind_muscle_active             - Cluster C5 tier-aware (T0 OFF / T1+ active)
 * @property {CueDeliveryTiming} cue_delivery_timing  - Cluster B8 PRE_SET / POST_SET only (NU INTRA_SET)
 * @property {string[]} signals                       - Mirror DimensionResult.signals
 */

/**
 * TempoResult — extends DimensionResult per ADR 018 §2.
 *
 * @typedef {Object} TempoResult
 * @property {string}                       id              - Always 'tempo'
 * @property {'none'|'LOW'|'MED'|'HIGH'}    tier            - V1 default 'MED' when computed; 'none' când insufficient ctx
 * @property {'low'|'medium'|'high'}        confidence      - Based on ctx data completeness
 * @property {string[]}                     signals         - Human-readable signal IDs
 * @property {Array<Object>}                recommendations - V1 empty (orchestrator-level concern); future Stage 3 emission
 * @property {Object}                       trace           - Free-form debug info (cluster computations transparency)
 * @property {TempoBlueprint}               meta            - Tempo-specific blueprint
 */

export {};
