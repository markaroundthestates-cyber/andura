// Engine Tempo V1 types per ADR 026 §9.5 + ADR 018 §2 Standardized Dimension
// Contract.
//
// TempoResult extends DimensionResult per ADR 018 §2 — adds Cluster A1 output
// blueprint emit fields (tempo_prescription, form_cue, mind_muscle_active,
// cue_delivery_timing) in `meta` per §9.5.1 verbatim.
//
// Pipeline §42.10 position 5th canonical (NU "Engine #6" naming legacy).
//
// Per ADR 005 Vanilla JS: types pinned via JSDoc typedefs (NU TypeScript).

/**
 * Calibration tier per Cluster C5 + ADR 009.
 *
 * @typedef {'T0'|'T1'|'T2'} CalibrationTier
 */

/**
 * Persona archetype per ADR 017 demographic prior + Cluster D18 verbatim.
 *
 * @typedef {'maria'|'gigica'|'marius'} Persona
 */

/**
 * Movement category per Cluster B2 base library taxonomy.
 *
 * @typedef {'compound'|'isolation'} MovementCategory
 */

/**
 * Cue delivery timing per Cluster B8 verbatim — pre-set + post-set + mid-rest
 * tap-to-expand ONLY (NU intra-set distraction).
 *
 * @typedef {'PRE_SET'|'POST_SET'|'MID_REST'} CueDeliveryTiming
 */

/**
 * Cue depth tier-aware per Cluster C15 verbatim.
 *
 * @typedef {'minimal'|'rich'|'adaptive'} CueDepth
 */

/**
 * Suppression mode per Cluster C17 verbatim.
 *
 * @typedef {'hard'|'soft_auto_retire'} SuppressionMode
 */

/**
 * Energy direction signal per §9.3 cross-engine Hook D13.
 *
 * @typedef {'UP'|'DOWN'|'NONE'} EnergyDirection
 */

/**
 * Tempo prescription emit per Cluster A1 + Cluster B1 + B6 + B8 verbatim.
 *
 * @typedef {Object} TempoPrescription
 * @property {string} notation                 - Tempo notation eg "2-1-2-0" (eccentric-pauseBottom-concentric-pauseTop)
 * @property {string} preSetIntro              - Pre-set surface text (engine emite INAINTE of set, Q1=C Hibrid)
 * @property {string} reactiveExpanded         - Mid-rest tap-to-expand 💡 elaboration (Q6=D Bugatti minimal-friction)
 * @property {CueDeliveryTiming} timing        - Pre-set sau post-set ONLY (NU intra-set Q8=D)
 * @property {string} rationale                - Why this tempo (transparency CDL audit trail)
 */

/**
 * Form cue emit per Cluster A1 + Cluster B2 + B3 + D18 verbatim.
 *
 * @typedef {Object} FormCue
 * @property {string} cueText                  - Native RO text per persona-aware tone Q18=D
 * @property {string} category                 - Movement category (compound/isolation)
 * @property {string} movementId               - Movement ID (squat / bench / etc.)
 * @property {Persona} persona                 - Resolved persona Maria/Gigica/Marius
 * @property {CueDepth} depth                  - Tier-aware depth Q15=B
 */

/**
 * Mind-muscle activation state per Cluster A1 + Cluster C5 + C7 + C17 verbatim.
 *
 * @typedef {Object} MindMuscleState
 * @property {boolean} active                  - Tier-aware T0 OFF / T1+ profile-typing Q5=C
 * @property {SuppressionMode} suppressionMode - Hard T0/T1 / soft auto-retire T2+ Q17=C
 * @property {boolean} acquiredExplicit        - User toggle "stiu" Q9 explicit
 * @property {boolean} acquiredImplicit        - N=10 sessions consecutive form breakdown < threshold Q9 implicit
 * @property {boolean} suppressedForMovement   - Result: cue NU surface for movement
 * @property {string} rationale                - Why active/suppressed (transparency)
 */

/**
 * Tempo-specific blueprint emit (lives in DimensionResult.meta per §9.5.1
 * Cluster A1 + ADR 018 §2).
 *
 * @typedef {Object} TempoBlueprint
 * @property {TempoPrescription} tempo_prescription   - Cluster A1 emit 1
 * @property {FormCue} form_cue                       - Cluster A1 emit 2
 * @property {boolean} mind_muscle_active             - Cluster A1 emit 3 (boolean tier-aware)
 * @property {CueDeliveryTiming} cue_delivery_timing  - Cluster A1 emit 4
 * @property {string[]} signals                       - Cluster A1 emit 5 (mirror DimensionResult.signals)
 * @property {MindMuscleState} mind_muscle_state      - Detailed state (suppression, acquisition)
 */

/**
 * TempoResult — extends DimensionResult per ADR 018 §2.
 *
 * @typedef {Object} TempoResult
 * @property {string}                       id              - Always 'tempo'
 * @property {'none'|'LOW'|'MED'|'HIGH'}    tier            - V1 default 'MED' when computed; 'none' insufficient ctx
 * @property {'low'|'medium'|'high'}        confidence      - Based on ctx data completeness
 * @property {string[]}                     signals         - Human-readable signal IDs
 * @property {Array<Object>}                recommendations - V1 empty (orchestrator-level concern per ADR 030 D2 thin scope)
 * @property {Object}                       trace           - Free-form debug info (cluster computations transparency)
 * @property {TempoBlueprint}               meta            - Tempo-specific blueprint
 */

/**
 * Cross-engine D11 Periodization high intensity → form-conservative amplification
 * signal per Cluster D verbatim Q11=B.
 *
 * @typedef {Object} HighIntensityAmplificationSignal
 * @property {boolean} amplified
 * @property {string} phase                     - From Periodization §9.1 Constraint Object
 * @property {string} rationale
 */

/**
 * Cross-engine D12 Deload week mind-muscle unlock signal per Cluster D verbatim
 * Q12=D.
 *
 * @typedef {Object} DeloadMindMuscleUnlockSignal
 * @property {boolean} unlocked
 * @property {boolean} overridesTierDefault
 * @property {string} rationale
 */

/**
 * Cross-engine D13 Energy DOWN → slow eccentric universal signal per Cluster D
 * verbatim Q13=B (Gemini self-flagged ROM partial REJECT corect).
 *
 * @typedef {Object} EnergyDownSlowEccentricSignal
 * @property {boolean} applied
 * @property {EnergyDirection} energyDirection
 * @property {string} rationale
 */

/**
 * Cross-engine D14 RIR Matrix form breakdown user toggle signal per Cluster D
 * verbatim Q14=B — Tempo emite signal, orchestrator layer applies +1 auto-bump
 * RIR target next set (anti-cascade ADR 030 D2 thin scope).
 *
 * @typedef {Object} FormBreakdownAutoBumpSignal
 * @property {boolean} emit
 * @property {number} rirIncrement              - +1 next set per Q14=B
 * @property {string} rationale
 */

/**
 * Cross-engine D Q4=A V1 RIR mismatch silent telemetry signal per Cluster B4
 * verbatim — silent telemetry only CDL audit trail, NU active trigger V1.
 *
 * @typedef {Object} RirMismatchSilentTelemetrySignal
 * @property {boolean} flagged                  - Mismatch detected (form_breakdown vs RIR Matrix expected)
 * @property {string} behavior                  - Always 'silent_telemetry_only' V1
 * @property {string} rationale
 */

export {};
