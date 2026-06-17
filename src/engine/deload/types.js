// Engine Deload V1 types per ADR 026 §9.8 + ADR 018 §2 Standardized Dimension
// Contract.
//
// DeloadResult extends DimensionResult per ADR 018 §2 — adds blueprint fields
// in `meta` per §9.8.1 Cluster A1 + §9.8.3 Cluster C1 verbatim.
//
// Pipeline §42.10 position 8th canonical FINAL prescriptive engine.
//
// Per ADR 005 Vanilla JS: types pinned via JSDoc typedefs (NU TypeScript).

/**
 * Calibration tier per Cluster C2 + ADR 009.
 *
 * @typedef {'T0'|'T1'|'T2'} CalibrationTier
 */

/**
 * Deload activation state per Cluster A1 output blueprint emit.
 *
 * @typedef {'IDLE'|'SCHEDULED_LINEAR'|'REACTIVE_COMPOSITE'|'REACTIVE_AA'|'EXTENSION_FLAGGED'|'RESOLVING'} DeloadState
 */

/**
 * Trigger source per Cluster B1+B2 multi-trigger orchestrator unification.
 *
 * @typedef {'composite'|'aa'|'linear'|'extension'|'energy'|'none'} TriggerSource
 */

/**
 * Periodization phase per §9.1 Hook 1 cross-ref.
 *
 * @typedef {'LOAD'|'LOAD+'|'PEAK'|'DELOAD'} PeriodizationPhase
 */

/**
 * Periodization deload_window trigger per §9.1 emit field 5.
 *
 * @typedef {'EARLY_SAFETY'|'EXTENSION_MARIUS'|'CALENDAR'} DeloadWindowTrigger
 */

/**
 * Goal Adaptation phase per §9.2 Cluster D2 cross-ref.
 *
 * @typedef {'CUT'|'BULK'|'MAINTAIN'|'RECOMP'} GoalPhase
 */

/**
 * Energy adjustment direction per §9.3 Hook D3 cross-ref.
 *
 * @typedef {'UP'|'DOWN'|'NONE'} EnergyDirection
 */

/**
 * Notification tier per Cluster C2 verbatim.
 *
 * @typedef {'silent'|'banner_detailed'} NotificationTier
 */

/**
 * Skip penalty marker per Cluster C4 Hibrid.
 *
 * @typedef {'aa_marker_direct'|'composite_tighten'|'none'} SkipPenalty
 */

/**
 * Trigger decision per Cluster B1+B2 verbatim.
 *
 * @typedef {Object} TriggerDecision
 * @property {TriggerSource} primarySource           - Composite > AA > Linear priority order winner
 * @property {ReadonlyArray<TriggerSource>} sourcesActive  - All trigger sources active (multi-signal additive)
 * @property {DeloadState} resolvedState
 * @property {string} rationale
 */

/**
 * Depth decision per Cluster B5 Final_Depth formula verbatim.
 *
 * @typedef {Object} DepthDecision
 * @property {number} finalDepthPct                  - MAX(45/60/30) + Behavioral_Modifiers additive
 * @property {number} scheduledPct                   - 45% baseline
 * @property {number} reactivePct                    - 60% override
 * @property {number} behavioralPct                  - 30% additive baseline
 * @property {number} behavioralModifiersAppliedPct  - Capped per SCHEMA_CONSTANTS.behavioralModifiersCapPct
 * @property {boolean} extensionDepthClamped         - True daca Week 2 extension preserve 60% atrophy limit
 * @property {string} rationale
 */

/**
 * Duration decision per Cluster B6+B7+B8 verbatim.
 *
 * @typedef {Object} DurationDecision
 * @property {number} durationWeeks                  - 1 scheduled fix / 1-2 reactive adaptive
 * @property {boolean} extensionEvaluated            - True daca extension Week 2 evaluated end-of-Week-1
 * @property {boolean} extensionGranted              - True daca Flagged state still active
 * @property {boolean} hardResetLinearApplied        - True daca reactive triggered → Week 1 NEW post-deload (B7)
 * @property {string} rationale
 */

/**
 * Partial scope decision per Cluster B10 Hibrid verbatim.
 *
 * @typedef {Object} PartialScopeDecision
 * @property {ReadonlyArray<string>|null} affectedMuscleGroups  - null = full-body sistemic / list = per-muscle MRV
 * @property {boolean} fullBodySystemic                          - true daca cross-muscular signal
 * @property {boolean} perMuscleMrvAlone                         - true daca single muscle MRV exceeded
 * @property {string} rationale
 */

/**
 * Intensity modifier emit per Cluster B4 verbatim AA-driven mechanic.
 *
 * @typedef {Object} IntensityModifier
 * @property {number} rir_increment                  - +1 obligatoriu
 * @property {number} intensity_pct_decrement        - -12.5% obligatoriu
 */

/**
 * Cross-engine signal — Periodization frozen Constraint Object Hook D1.
 *
 * @typedef {Object} FrozenConstraintConsume
 * @property {boolean} frozen                        - Always true (immutable_snapshot consumed)
 * @property {PeriodizationPhase|null} phase
 * @property {DeloadWindowTrigger|null} deloadWindowTrigger
 * @property {string} rationale
 */

/**
 * Cross-engine signal — Goal Adaptation phase Hook D2.
 *
 * @typedef {Object} GoalPhaseConsume
 * @property {GoalPhase|null} goalPhase
 * @property {string} depthAdjustmentRationale       - 'cut_preserve_60' / 'bulk_marius_45_classical' / 'maintain_baseline' / 'recomp_baseline'
 */

/**
 * Cross-engine signal — Energy DOWN sustained Hook D3.
 *
 * @typedef {Object} EnergyReadinessConsume
 * @property {EnergyDirection} energyDirection
 * @property {boolean} sustainedThresholdMet         - True daca sustained 3+ consecutive (AA Detection candidate)
 * @property {string} rationale
 */

/**
 * Cross-engine signal — Bayesian σ + Pain-Aware Hook D4 reference-only.
 *
 * @typedef {Object} BayesianPainAwareReference
 * @property {boolean} sigmaHighFlag                 - True daca σ variance high (informational)
 * @property {boolean} painAwareSessionsCountFlag    - True daca Pain-Aware sessions ≥2 last 10 (informational)
 * @property {string} convergenceGuardOwnerSpec      - 'ADR 009 §AMENDMENT 2026-05-05 birou after'
 * @property {string} rationale
 */

/**
 * Cross-engine signal — Specialization suspended Hook D5.
 *
 * @typedef {Object} SpecializationSuspendSignal
 * @property {boolean} suspended                     - True daca Specialization ACTIVE + REACTIVE deload triggered
 * @property {string|null} mesoProgressFreezeContext - Specialization mesocycle progress freeze info
 * @property {string} rationale
 */

/**
 * Cross-engine signal — Warm-up DELOAD_LIGHTER Hook D6 forward (light coupling).
 *
 * @typedef {Object} WarmupLighterForwardSignal
 * @property {boolean} emit                          - True daca Engine Deload active → emit DELOAD_LIGHTER signal
 * @property {string} rationale
 */

/**
 * Convergence Guard reference metadata per §9.4.6 reference-only pattern.
 *
 * NU duplicate eval logic — owner ADR 009 §AMENDMENT 2026-05-05 birou after.
 *
 * @typedef {Object} ConvergenceGuardReference
 * @property {string} ownerSpec
 * @property {boolean} crossCutting
 * @property {ReadonlyArray<string>} appliesToTierTransitions
 * @property {string} note
 */

/**
 * Skip penalty signal per Cluster C4 Hibrid.
 *
 * @typedef {Object} SkipPenaltySignal
 * @property {SkipPenalty} marker                    - Skip penalty marker triggered
 * @property {boolean} active                        - True daca skip penalty applied
 * @property {string} rationale
 */

/**
 * Deload-specific blueprint emit (lives in DimensionResult.meta per §9.8.1
 * Cluster A1 + §9.8.3 Cluster C1 verbatim — 9 fields).
 *
 * @typedef {Object} DeloadBlueprint
 * @property {DeloadState} deload_state                       - IDLE / SCHEDULED_LINEAR / REACTIVE_COMPOSITE / REACTIVE_AA / EXTENSION_FLAGGED / RESOLVING
 * @property {number} depth_pct                               - Final_Depth SEVERITY composite MAX(45/60/30) B5 — NU volume cut
 * @property {number} volume_cut_pct                          - Spec FIXED reactive volume cut (30% B4 "Volume CUT 30% obligatoriu"); 0 for scheduled/idle
 * @property {number} duration_weeks                          - 1 scheduled / 1-2 reactive adaptive
 * @property {IntensityModifier} intensity_modifier           - { rir_increment, intensity_pct_decrement } obligatoriu B4
 * @property {ReadonlyArray<string>|null} partial_scope       - null full-body / muscle group list per-muscle MRV
 * @property {NotificationTier} notification_tier             - silent T0 / banner_detailed T1+ Cluster C2
 * @property {string} wording                                 - RO native per trigger source Cluster C5
 * @property {string} ui_label                                - Synthesized RO native ("Saptamana de recuperare X sapt")
 * @property {string[]} signals                               - Mirror DimensionResult.signals
 */

/**
 * DeloadResult — extends DimensionResult per ADR 018 §2.
 *
 * Tier semantic:
 *   'HIGH' = REACTIVE_COMPOSITE | REACTIVE_AA | EXTENSION_FLAGGED (active reactive intervention)
 *   'MED'  = SCHEDULED_LINEAR | RESOLVING (scheduled OR transition phase)
 *   'LOW'  = IDLE (no deload active)
 *   'none' = insufficient ctx default fallback
 *
 * @typedef {Object} DeloadResult
 * @property {string}                       id              - Always 'deload'
 * @property {'none'|'LOW'|'MED'|'HIGH'}    tier            - per state mapping above
 * @property {'low'|'medium'|'high'}        confidence      - Based on ctx data completeness
 * @property {string[]}                     signals         - Human-readable signal IDs
 * @property {Array<Object>}                recommendations - V1 empty (orchestrator-level concern per ADR 030 D2 thin scope)
 * @property {Object}                       trace           - Free-form debug info (cluster computations transparency)
 * @property {DeloadBlueprint}              meta            - Deload-specific blueprint (Cluster A1+C1 emit)
 */

export {};
