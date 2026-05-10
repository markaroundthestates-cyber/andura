// Engine Specialization V1 types per ADR 026 §9.6 + ADR 018 §2 Standardized
// Dimension Contract.
//
// SpecializationResult extends DimensionResult per ADR 018 §2 — adds Cluster
// A1 6-field output blueprint emit fields (activation_state, target_muscle_group,
// mesocycle_progress, volume_modifier_target, volume_modifier_other_groups,
// cooldown_state) in `meta` per §9.6.1 verbatim.
//
// Pipeline §42.10 position 6th canonical (NU "Engine #7" naming legacy).
//
// Per ADR 005 Vanilla JS: types pinned via JSDoc typedefs (NU TypeScript).

/**
 * Calibration tier per Cluster A activation gating + ADR 009.
 *
 * @typedef {'T0'|'T1'|'T2'} CalibrationTier
 */

/**
 * Persona archetype per ADR 017 demographic prior + Cluster A Q12 verbatim.
 *
 * @typedef {'maria'|'gigica'|'marius'} Persona
 */

/**
 * Goal Adaptation phase per §9.2 cross-ref + Cluster A Q5 dual safety gate.
 *
 * @typedef {'BULK'|'CUT'|'RECOMP'|'MAINTAIN'} GoalPhase
 */

/**
 * Periodization phase per §9.1 cross-ref + Cluster C5 modifier targeting.
 *
 * @typedef {'ACCUMULATION'|'LOAD'|'PEAK'|'DELOAD'} PeriodizationPhase
 */

/**
 * Application mode per Cluster C1 Q7=C verbatim.
 *
 * @typedef {'hybrid'|'volume_only'|'frequency_only'} ApplicationMode
 */

/**
 * Activation state per Cluster A1 emit + 6-field blueprint verbatim.
 *
 * @typedef {string} ActivationState
 */

/**
 * Eligibility check result per activationGating module — total function never
 * throws, returns reason string for transparency CDL audit trail.
 *
 * @typedef {Object} EligibilityResult
 * @property {boolean} eligible
 * @property {string} state                       - ACTIVATION_STATE value
 * @property {string} reason                      - Human-readable rationale
 */

/**
 * Weakness detection consumer signal per Cluster B1 + B2 + B3 verbatim — top-1
 * discipline V1 (Q3=A simplicity) consensus last-12-sessions + lifetime aggregate
 * convergent (Q2=C anti-noise volatil).
 *
 * @typedef {Object} WeaknessSignal
 * @property {string|null} targetGroup            - Top-1 weakest muscle group (null daca insufficient signal)
 * @property {number|null} ratio                  - 1RM ratio<0.8 vs group avg (Q1=C)
 * @property {boolean} consensusAligned           - Recent + lifetime aligned (Q2=C anti-flap)
 * @property {string} rationale
 */

/**
 * Reconciliation outcome per Cluster B4 Q4=C verbatim — engine objective vs
 * user adjustment hibrid (both stored CDL Bugatti craft transparency, user
 * agency F4 wins on conflict).
 *
 * @typedef {Object} ReconciliationResult
 * @property {string|null} resolvedGroup          - Final target post-reconciliation (user override > engine)
 * @property {string|null} engineObjective        - Engine signal (preserved CDL)
 * @property {string|null} userAdjustment         - User override (if any)
 * @property {string} source                      - 'engine' | 'user_override' | 'aligned'
 */

/**
 * Cooldown state per Cluster B5 Q10=B + B6 Q16=A verbatim — N=12 weeks
 * tracking per muscle group + hard reject.
 *
 * @typedef {Object} CooldownState
 * @property {boolean} blocked                    - True daca within N=12 weeks cooldown for target group
 * @property {string|null} group                  - Group in cooldown (null daca none)
 * @property {number|null} weeksRemaining         - Remaining cooldown duration
 * @property {string|null} reason                 - 'completed_exit' | 'hard_reject' | 'no_cooldown'
 * @property {string} rationale
 */

/**
 * Volume modifier emit per Cluster C1 Q7=C + C2 Q8=B verbatim — bundle target
 * weak group volume + frequency increase + other groups -25% maintenance.
 *
 * @typedef {Object} VolumeModifier
 * @property {string|null} targetGroup
 * @property {number} volumeIncreasePct           - +30% V1 default sub MRV §42.9 invariant 1 cap
 * @property {number} frequencyIncreaseSessions   - +1 session/week V1 default
 * @property {number} otherGroupsReductionPct     - -25% maintenance dose Q8=B
 * @property {string} mode                        - 'hybrid' | 'volume_only' | 'frequency_only' Q7=C
 * @property {boolean} mrvCapRespected            - True daca target volume sub MRV (always true V1 invariant 1)
 * @property {string} rationale
 */

/**
 * Mesocycle progress emit per Cluster A1 6-field blueprint + Cluster C3 Q9=A
 * fixed 4 weeks exit verbatim.
 *
 * @typedef {Object} MesocycleProgress
 * @property {number} currentWeek                 - 1-4 progression
 * @property {number} totalWeeks                  - Always 4 V1 (Q9=A simplicity)
 * @property {boolean} exiting                    - True daca week >= 4 (entering completed_exit state)
 * @property {string} rationale
 */

/**
 * Specialization-specific blueprint emit (lives in DimensionResult.meta per
 * §9.6.1 Cluster A1 + ADR 018 §2). 6 fields verbatim spec.
 *
 * @typedef {Object} SpecializationBlueprint
 * @property {ActivationState} activation_state                 - Cluster A1 emit 1
 * @property {string|null} target_muscle_group                  - Cluster A1 emit 2 (top-1 weak group)
 * @property {MesocycleProgress} mesocycle_progress             - Cluster A1 emit 3 (4-week exit Q9=A)
 * @property {VolumeModifier} volume_modifier                   - Cluster A1 emit 4 (target + other groups)
 * @property {string} ui_label                                  - Cluster C4 Q17=C "Bloc focus [Grupa]"
 * @property {CooldownState} cooldown_state                     - Cluster A1 emit 5 (N=12 weeks Q10+Q16)
 * @property {string[]} signals                                 - Cluster A1 emit 6 (mirror DimensionResult.signals)
 */

/**
 * SpecializationResult — extends DimensionResult per ADR 018 §2.
 *
 * @typedef {Object} SpecializationResult
 * @property {string}                       id              - Always 'specialization'
 * @property {'none'|'LOW'|'MED'|'HIGH'}    tier            - 'none' insufficient ctx; 'MED' eligible/proposal; 'HIGH' active
 * @property {'low'|'medium'|'high'}        confidence      - Based on ctx data completeness
 * @property {string[]}                     signals         - Human-readable signal IDs
 * @property {Array<Object>}                recommendations - V1 empty (orchestrator-level concern ADR 030 D2 thin scope)
 * @property {Object}                       trace           - Free-form debug info (cluster computations transparency)
 * @property {SpecializationBlueprint}      meta            - Specialization-specific blueprint
 */

/**
 * Cross-engine D1 PARALLEL modifier Engine #1 Periodization signal per Cluster
 * D verbatim Q11=B (NU REPLACE — skeleton preserved).
 *
 * @typedef {Object} ParallelModifierSignal
 * @property {boolean} applied
 * @property {string} mode                        - 'parallel' (always V1 — NU replace)
 * @property {string|null} eligiblePhase          - ACCUMULATION/LOAD only
 * @property {string} rationale
 */

/**
 * Cross-engine D2 Engine #4 Deload preserved signal per Cluster D verbatim
 * Q12=A non-negotiable.
 *
 * @typedef {Object} DeloadPreservedSignal
 * @property {boolean} suspended                  - True daca specialization layered OFF (deload phase)
 * @property {string} rationale
 */

/**
 * Cross-engine D3 Cut DISABLE dual safety gate per Cluster D verbatim Q5=D + Q13=A.
 *
 * @typedef {Object} CutDisableSignal
 * @property {boolean} blocked
 * @property {string} phase
 * @property {string} rationale
 */

/**
 * Cross-engine D4 Injury PainButton auto-disable per Cluster D verbatim Q14=A
 * (Safety Override §42.9 invariant 5 cross-cutting Layer 5 Medical Safety
 * defense-in-depth).
 *
 * @typedef {Object} InjuryAutoDisableSignal
 * @property {boolean} disabled
 * @property {string|null} affectedGroup
 * @property {string} rationale
 */

/**
 * Cross-engine D5 Light coupling Engine #5 Energy + Engine #6 Tempo signal
 * per Cluster D verbatim — silent telemetry pattern Q18=C consistent #5+#6.
 *
 * @typedef {Object} LightCouplingSignal
 * @property {boolean} energyConservativeScaling  - Energy DOWN signal recurrent → conservative volume modifier scaling
 * @property {boolean} tempoPreserved             - Tempo prescription owned by Engine #6 NU mutated by specialization
 * @property {string} rationale
 */

export {};
