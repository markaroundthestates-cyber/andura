// Periodization Engine #1 V1 types per ADR 026 §9.1 Cluster 1 + ADR 018 §2
// Standardized Dimension Contract.
//
// PeriodizationResult extends DimensionResult per ADR 018 §2 — adds 5 blueprint
// fields în `meta` per §9.2 Cluster 1 verbatim.
//
// Per ADR 005 Vanilla JS: types pinned via JSDoc typedefs (NU TypeScript).

/**
 * Mesocycle phase enum per §9.3 Cluster 2.
 *
 * @typedef {'LOAD'|'LOAD+'|'PEAK'|'DELOAD'} MesocyclePhase
 */

/**
 * Trigger source identifying which path în the 3-level hierarchy fired.
 * Per §9.3 Cluster 2.2:
 * - EARLY_SAFETY = Invariant 5 Medical Safety override (highest priority)
 * - EXTENSION_MARIUS = Marius 5:1 dual-signal recovery green extension
 * - CALENDAR = 4-week mesocycle clasic Option A default
 *
 * @typedef {'EARLY_SAFETY'|'EXTENSION_MARIUS'|'CALENDAR'} TriggerSource
 */

/**
 * Deload window emit signal per §9.2 Cluster 1 output blueprint field.
 * `null` = no deload due. Object = deload due cu trigger source + duration.
 *
 * @typedef {null | { trigger: TriggerSource, days: number }} DeloadWindow
 */

/**
 * Volume target per muscle group (cap MRV absolut per §9.5 Cluster 4 Hard
 * limit invariant safety preservation).
 *
 * @typedef {Object} MuscleVolumeTarget
 * @property {number} sets       - Target sets/week post all modifiers + scaling
 * @property {number} mev        - Israetel MEV baseline reference
 * @property {number} mav        - Israetel MAV baseline reference
 * @property {number} mrv        - Israetel MRV baseline reference (hard cap)
 */

/**
 * Macrocycle block position per §9.5 Cluster 4. Block = 3 mesocycles (M1/M2/M3).
 *
 * @typedef {Object} MacrocycleBlock
 * @property {number} blockIdx   - Block index (1-based, increments after each 3-mesocycle complete cycle)
 * @property {1|2|3} mesocycleIdx - Current mesocycle within block (M1/M2/M3)
 * @property {1|2|3|4} weekInMesocycle - Current week within mesocycle (1..4)
 * @property {number} blockLengthWeeks - Total block length în weeks (12 default sau 21 Forță)
 */

/**
 * Periodization-specific blueprint emit (lives în DimensionResult.meta per
 * §9.2 Cluster 1 + ADR 018 §2 dimension-specific meta convention).
 *
 * @typedef {Object} PeriodizationBlueprint
 * @property {MesocyclePhase}  mesocycle_phase
 * @property {Object<string, number>} volume_target_pct  - % MEV/MAV/MRV per muscle group (sets/week post modifiers)
 * @property {{floor: number, ceiling: number}} intensity_target_pct - % 1RM range (capped HARD_CAP_INTENSITY_PCT_1RM 90%)
 * @property {MacrocycleBlock} macrocycle_block
 * @property {DeloadWindow}    deload_window
 */

/**
 * PeriodizationResult — extends DimensionResult per ADR 018 §2.
 *
 * @typedef {Object} PeriodizationResult
 * @property {string}                  id          - Always 'periodization'
 * @property {'none'|'LOW'|'MED'|'HIGH'} tier      - V1 default 'MED' when computed; 'none' when insufficient ctx
 * @property {'low'|'medium'|'high'}   confidence  - Based on ctx data completeness
 * @property {string[]}                signals     - Human-readable signal IDs (e.g. 'maria_advance_gate_blocked', 'marius_dual_signal_green')
 * @property {Array<Object>}           recommendations - V1 empty (orchestrator-level concern); future Hook 1-4 emission
 * @property {Object}                  trace       - Free-form debug info (cluster computations transparency)
 * @property {PeriodizationBlueprint}  meta        - Periodization-specific blueprint (5 fields §9.2 Cluster 1)
 */

/**
 * Constraint Object emitted via Cluster 5 cross-engine hooks per §9.6 +
 * §1.10 Pipeline Order. Frozen, propagated immutable engine-la-engine.
 *
 * @typedef {Object} ConstraintObject
 * @property {{floor: number, ceiling: number}}    intensity_pct_1rm     - Intensity corridor (0..1)
 * @property {Object<string, {floor: number, ceiling: number}>} volume_per_muscle - Volume corridor per muscle (sets/week)
 * @property {MesocyclePhase}                       phase
 * @property {DeloadWindow}                         deload_window
 * @property {boolean}                              immutable_snapshot   - Always true (anti-cascade safeguard §9.6)
 */

export {};
