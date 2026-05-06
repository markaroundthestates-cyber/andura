// Engine Warm-up V1 types per ADR 026 §9.7 + ADR 018 §2 Standardized Dimension
// Contract.
//
// WarmupResult extends DimensionResult per ADR 018 §2 — adds blueprint fields
// în `meta` per §9.7.1 Cluster A1 verbatim.
//
// Pipeline §42.10 position 7th canonical (NU "Engine #8" naming legacy).
//
// Per ADR 005 Vanilla JS: types pinned via JSDoc typedefs (NU TypeScript).

/**
 * Calibration tier per Cluster E1 + ADR 009.
 *
 * @typedef {'T0'|'T1'|'T2'} CalibrationTier
 */

/**
 * Persona archetype per Cluster B3 + ADR 017.
 *
 * @typedef {'maria'|'gigica'|'marius'} Persona
 */

/**
 * Warm-up activation state per Cluster A1 output blueprint emit.
 *
 * @typedef {'ACTIVE'|'SKIPPED'|'DELOAD_LIGHTER'|'INJURY_DISABLED'} WarmupState
 */

/**
 * Routine type per Cluster B2 Hybrid V1 LOCKED Q65.2 Option C.
 *
 * @typedef {'hybrid'|'general'|'specific'} RoutineType
 */

/**
 * Goal phase per §9.2 Goal Adaptation Cluster D2 cross-ref.
 *
 * @typedef {'CUT'|'BULK'|'MAINTAIN'|'RECOMP'} GoalPhase
 */

/**
 * Periodization phase per §9.1 Periodization Hook 1 cross-ref.
 *
 * @typedef {'LOAD'|'LOAD+'|'PEAK'|'DELOAD'} PeriodizationPhase
 */

/**
 * Energy adjustment direction per §9.3 Engine Energy Adjustment Cluster D3 Hook.
 *
 * @typedef {'UP'|'DOWN'|'NONE'} EnergyDirection
 */

/**
 * Duration decision per Cluster B1+B2 verbatim.
 *
 * @typedef {Object} DurationDecision
 * @property {number} durationMin                 - Final adaptive duration 5-10 (or 5-7 cu Energy DOWN)
 * @property {number} lowerBound                  - 5 min default safety floor
 * @property {number} upperBound                  - 10 default | 7 cu Energy DOWN | 0 SKIPPED
 * @property {boolean} energyDownAutoShortened    - True dacă Energy DOWN auto-shorten applied
 * @property {boolean} deloadLighter              - True dacă Periodization DELOAD week → lighter
 * @property {string} rationale                   - Human-readable rationale signal ID
 */

/**
 * Routine decision per Cluster B2+B3 Hybrid composition.
 *
 * @typedef {Object} RoutineDecision
 * @property {RoutineType} routineType                       - 'hybrid' V1 default
 * @property {number} generalSetsCount                       - 1-2 general dynamic mobility
 * @property {ReadonlyArray<string>} generalSets             - RO native exercise labels
 * @property {number} specificSetsCount                      - 2-3 specific muscle group prep
 * @property {ReadonlyArray<string>} specificSets            - RO native exercise labels per target group
 * @property {ReadonlyArray<string>} targetMuscleGroups      - Target muscle groups for the day
 * @property {string|null} weakGroupPrioritized              - From §9.6 Specialization Hook D4 (if active)
 * @property {string} rationale
 */

/**
 * Skip decision per Cluster E1 Source 2 §45.6.5 + Cluster B4 Source 1 §65.3.
 *
 * @typedef {Object} SkipDecision
 * @property {boolean} skipAvailable                         - Always true V1 (Source 1 §65.3 buton vizibil session 1)
 * @property {boolean} userOptedSkip                         - Caller passes from session ctx (in-session toggle)
 * @property {boolean} t0InstantSkipDefault                  - True dacă tier T0 → ramp-up integrated în first exercise
 * @property {boolean} t1PlusOptInExpanded                   - True dacă T1+ user opt-in expanded routine
 * @property {string} rationale
 */

/**
 * Cooldown state per Cluster C verbatim Source 1 §65.4 OVERRIDE Q4 reconciled.
 *
 * @typedef {Object} CooldownState
 * @property {boolean} offered                               - True dacă optional cooldown offered post-session
 * @property {number} durationMin                            - 2 min text-only Source 1 §65.4
 * @property {string} content                                - 'text-only' V1 (NU GIF NU video Bugatti consistency)
 * @property {ReadonlyArray<string>} stretches               - RO native static stretches list
 * @property {string} rationale
 */

/**
 * Cross-engine signal — Periodization frozen Constraint Object Hook D1.
 *
 * @typedef {Object} PeriodizationFrozenSignal
 * @property {boolean} frozen                                - Always true (immutable_snapshot consumed)
 * @property {PeriodizationPhase|null} phase                 - From frozen Constraint Object
 * @property {Object|null} deloadWindow                      - From frozen Constraint Object
 * @property {string} rationale
 */

/**
 * Cross-engine signal — Goal Adaptation phase Hook D2.
 *
 * @typedef {Object} GoalPhaseSignal
 * @property {GoalPhase|null} goalPhase
 * @property {string} adjustmentRationale                    - 'cut_preserve_full' / 'bulk_marius_full_ramp' / 'maintain_baseline' / 'recomp_baseline'
 */

/**
 * Cross-engine signal — Energy DOWN auto-shorten Hook D3.
 *
 * @typedef {Object} EnergyReadinessSignal
 * @property {EnergyDirection} energyDirection
 * @property {boolean} autoShortenApplied                    - True dacă DOWN → 5-7 min upper bound applied
 * @property {string} rationale
 */

/**
 * Cross-engine signal — Specialization weak group prioritize Hook D4.
 *
 * @typedef {Object} SpecializationWeakGroupSignal
 * @property {string|null} weakGroup
 * @property {boolean} prioritized                           - True dacă weak group included specific sets
 * @property {string} rationale
 */

/**
 * Convergence Guard reference metadata per §9.4.6 reference-only pattern.
 *
 * NU duplicate eval logic — owner ADR 009 §AMENDMENT 2026-05-05 birou after
 * Convergence Guard "T2 Unlock" Behavioral Validation Rule. Engine Warm-up
 * references metadata only; orchestrator layer evaluates actual T2 unlock.
 *
 * @typedef {Object} ConvergenceGuardReference
 * @property {string} ownerSpec                              - 'ADR 009 §AMENDMENT 2026-05-05 birou after'
 * @property {string} ruleName                               - 'Convergence Guard T2 Unlock Behavioral Validation'
 * @property {string} cleanSignalRule                        - 'Tempo NU proactive trigger Pain-Aware preserved §9.5+§9.6'
 */

/**
 * Warm-up-specific blueprint emit (lives în DimensionResult.meta per §9.7.1
 * Cluster A1).
 *
 * @typedef {Object} WarmupBlueprint
 * @property {WarmupState} warmup_state                      - ACTIVE / SKIPPED / DELOAD_LIGHTER / INJURY_DISABLED
 * @property {number} duration_min                           - 5-10 adaptive (5-7 cu Energy DOWN)
 * @property {RoutineType} routine_type                      - 'hybrid' V1 default
 * @property {number} general_sets                           - Count 1-2 general dynamic
 * @property {ReadonlyArray<string>} general_sets_list       - RO native exercise labels
 * @property {number} specific_sets                          - Count 2-3 specific muscle group prep
 * @property {ReadonlyArray<string>} specific_sets_list      - RO native exercise labels
 * @property {ReadonlyArray<string>} target_muscle_groups    - Target muscle groups for the day
 * @property {boolean} skip_available                        - Always true V1 §65.3 buton vizibil session 1
 * @property {CooldownState} cooldown_state                  - Cluster C optional 2 min stretch
 * @property {string} ui_label                               - "Încălzire ~X min" RO native
 * @property {string[]} signals                              - Mirror DimensionResult.signals
 */

/**
 * WarmupResult — extends DimensionResult per ADR 018 §2.
 *
 * @typedef {Object} WarmupResult
 * @property {string}                       id              - Always 'warmup'
 * @property {'none'|'LOW'|'MED'|'HIGH'}    tier            - HIGH=ACTIVE / MED=SKIPPED|DELOAD_LIGHTER / LOW=INJURY_DISABLED / none=insufficient
 * @property {'low'|'medium'|'high'}        confidence      - Based on ctx data completeness
 * @property {string[]}                     signals         - Human-readable signal IDs
 * @property {Array<Object>}                recommendations - V1 empty (orchestrator-level concern per ADR 030 D2 thin scope)
 * @property {Object}                       trace           - Free-form debug info (cluster computations transparency)
 * @property {WarmupBlueprint}              meta            - Warm-up-specific blueprint (Cluster A1 emit)
 */

export {};
