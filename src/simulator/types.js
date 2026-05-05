// ══ SIMULATOR TYPES (JSDoc — repo convention NU TypeScript files in src/) ═══
// Per `04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1.md` §2.3 + §5.

/**
 * @typedef {Readonly<{
 *   name: string,
 *   age: number,
 *   sex: 'M' | 'F',
 *   kg: number,
 *   height: number,
 *   bmi: number,
 *   job: string,
 *   lifestyle: string,
 * }>} Persona
 */

/**
 * @typedef {Readonly<{
 *   template: 'Forta' | 'Tonifiere' | 'Slabire' | 'Longevitate' | 'Sanatate',
 *   phase: 'CUT' | 'BULK' | 'MAINTAIN' | 'RECOMP',
 *   mode: 'Estetica' | 'Forta',
 * }>} GoalConfig
 */

/**
 * @typedef {Readonly<{
 *   tier: 'T0' | 'T1' | 'T2' | 'T3',
 *   cdl_window: ReadonlyArray<unknown>,
 * }>} HistoryState
 */

/**
 * @typedef {Readonly<{
 *   vitality_tier: 'HIGH' | 'MED' | 'LOW',
 *   pre_session_readiness: 'GREEN' | 'YELLOW' | 'RED',
 *   injury_flags: ReadonlyArray<string>,
 * }>} RecoveryState
 */

/**
 * @typedef {Readonly<{
 *   persona: Persona,
 *   goal: GoalConfig,
 *   experience: 'beginner' | 'intermediate' | 'advanced',
 *   equipment: ReadonlyArray<string>,
 *   schedule: Readonly<{ frequency: number, session_duration_target: number }>,
 *   history: HistoryState,
 *   recovery: RecoveryState,
 *   profile_typing: Readonly<{ primary: string, secondary: string, confidence: number }>,
 *   demographic_prior: Readonly<{ anchor_personas: ReadonlyArray<string> }>,
 * }>} ConstraintObject
 */

/**
 * @typedef {{
 *   periodization?: object,
 *   goal_adaptation?: object,
 *   energy_adjustment?: object,
 *   exercise_selection?: object,
 *   warm_up?: object,
 *   execution?: object,
 *   specialization?: object,
 *   deload?: object,
 *   final_session_blueprint?: object,
 * }} EnginesPipelineOutput
 */

/**
 * @typedef {{
 *   I1_volume_under_mrv: 'PASS' | 'FAIL' | 'SKIP',
 *   I2_rir_above_zero: 'PASS' | 'FAIL' | 'SKIP',
 *   I3_frequency_under_6: 'PASS' | 'FAIL' | 'SKIP',
 *   I4_deload_mandatory: 'PASS' | 'FAIL' | 'SKIP',
 *   I5_medical_safety: 'PASS' | 'FAIL' | 'SKIP',
 * }} InvariantsCheck
 */

/**
 * @typedef {'AUTO_RESOLVED' | 'FLAGGED' | 'PRUNED'} BranchStatus
 */

/**
 * @typedef {'engines_disagree'
 *   | 'circuit_breaker_fallback'
 *   | 'invariant_violation'
 *   | 'output_non_sane'
 *   | 'coverage_gap'
 *   | 'persona_critical_edge'
 *   | 'engine_2_spec_gap'
 * } FlagCategory
 */

/**
 * @typedef {{
 *   branch_id: string,
 *   input: ConstraintObject,
 *   engines_pipeline_output: EnginesPipelineOutput,
 *   invariants_check: InvariantsCheck,
 *   flags: ReadonlyArray<FlagCategory>,
 *   claude_reasoning_required: boolean,
 *   status: BranchStatus,
 * }} BranchReport
 */

export {}; // ESM stub — types-only file, no runtime exports.
