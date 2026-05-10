// Engine Energy Adjustment V1 types per ADR 026 §9.3 Cluster 1 + ADR 018 §2
// Standardized Dimension Contract.
//
// EnergyAdjustmentResult extends DimensionResult per ADR 018 §2 — adds 6
// blueprint fields in `meta` per §9.3.1 Cluster 1 verbatim.
//
// Pipeline §42.10 position 3rd canonical (NU 5th legacy ADR 027 naming).
//
// Per ADR 005 Vanilla JS: types pinned via JSDoc typedefs (NU TypeScript).

/**
 * Emoji holistic state per Cluster 2 §9.3.2.
 *
 * @typedef {'green'|'yellow'|'red'} EmojiState
 */

/**
 * Drill-down cause strict 🔴 RED only per Cluster 2 §9.3.2 Q15=C.
 *
 * @typedef {'stres'|'somn'|'durere'|'altul'} DrillDownCause
 */

/**
 * Adjustment direction per Cluster 3 §9.3.3 bidirectional asymmetric.
 *
 * @typedef {'UP'|'DOWN'|'NONE'} AdjustmentDirection
 */

/**
 * Calibration tier per Cluster 4 §9.3.4 Q13=B + ADR 009 cross-ref.
 *
 * @typedef {'T0'|'T1'|'T2'} CalibrationTier
 */

/**
 * Selective scope volume + intensity per Cluster 3 §9.3.3 Q33 §45.5 reuse.
 *
 * @typedef {Object} VolumeIntensityScope
 * @property {boolean} volume    - True daca engine targets volume_per_muscle corridor
 * @property {boolean} intensity - True daca engine targets intensity_pct_1rm corridor
 */

/**
 * Energy aggregation signal per Cluster 2 §9.3.2 categorical rules table.
 *
 * @typedef {Object} EnergyAggregationSignal
 * @property {EmojiState} state                       - Holistic emoji input
 * @property {DrillDownCause|null} drillDownCause     - Strict 🔴 only (null cand NOT 🔴)
 * @property {'UP_ELIGIBLE'|'DOWN_IMMEDIATE'|'NONE'} categoryRule - Aggregation rule lookup
 */

/**
 * Bidirectional adjustment decision per Cluster 3 §9.3.3 Q7=B asymmetric.
 *
 * @typedef {Object} BidirectionalAdjustmentDecision
 * @property {AdjustmentDirection} direction
 * @property {number} magnitudePct                    - Float in [-0.15, +0.15] tier-aware
 * @property {boolean} upGatingPassed                 - True daca N≥3 + recovery + phase gate
 * @property {string[]} gatingReasons                 - Reasons UP blocked sau passed
 */

/**
 * Yo-yo flap state per Cluster 4 §9.3.4 Q14=D 3-session window.
 *
 * @typedef {Object} YoyoFlapState
 * @property {boolean} flapDetected                   - True daca UP→DOWN→UP in window
 * @property {boolean} suppressed                     - True daca 3rd flip suppressed (V1 only)
 * @property {AdjustmentDirection} heldDirection      - Direction held when suppressed
 */

/**
 * Energy Adjustment-specific blueprint emit (lives in DimensionResult.meta per
 * §9.3.1 Cluster 1 + ADR 018 §2). 6 fields verbatim Cluster 1.
 *
 * @typedef {Object} EnergyAdjustmentBlueprint
 * @property {EmojiState|null} energy_state                          - Holistic emoji aggregate
 * @property {AdjustmentDirection} adjustment_direction              - UP / DOWN / NONE
 * @property {number} adjustment_magnitude_pct                       - Float in [-0.15, +0.15]
 * @property {VolumeIntensityScope} volume_intensity_scope           - Selective scope per Q33
 * @property {Object|null} forward_constraint_object                 - Periodization corridor pass-through frozen
 * @property {string[]} signals                                      - Mirror DimensionResult.signals
 */

/**
 * EnergyAdjustmentResult — extends DimensionResult per ADR 018 §2.
 *
 * @typedef {Object} EnergyAdjustmentResult
 * @property {string}                    id              - Always 'energyAdjustment'
 * @property {'none'|'LOW'|'MED'|'HIGH'} tier            - V1 default 'MED' when computed; 'none' when insufficient ctx
 * @property {'low'|'medium'|'high'}     confidence      - Based on ctx data completeness
 * @property {string[]}                  signals         - Human-readable signal IDs
 * @property {Array<Object>}             recommendations - V1 empty (orchestrator-level concern); future Stage 3 emission
 * @property {Object}                    trace           - Free-form debug info (cluster computations transparency)
 * @property {EnergyAdjustmentBlueprint} meta            - Energy Adjustment-specific blueprint (6 fields §9.3.1 Cluster 1)
 */

/**
 * Bayesian σ variance modifier signal emitted Hook 3 cross-engine Engine #3
 * Bayesian Nutrition (per Cluster 4 §9.3.4 Q12=C sophisticated).
 *
 * @typedef {Object} BayesianVarianceSignal
 * @property {number} sigmaObserved
 * @property {boolean} dampeningApplied              - True daca σ > threshold → adjustment × 0.7
 * @property {number} adjustmentMagnitudePostDampening
 */

/**
 * Deload trigger signal emitted Hook 2 cross-engine Engine Deload Protocol
 * (per Cluster 4 §9.3.4 Q9 anti-drift sub-Floor sustained 3-session escalation).
 *
 * @typedef {Object} DeloadTriggerSignal
 * @property {number} consecutiveSubFloorSessions
 * @property {boolean} escalationTriggered           - True cand 3rd session sub-Floor
 * @property {string} reason                         - Human-readable escalation reason
 */

export {};
