// ══ ENGINES PIPELINE ORCHESTRATOR (skeleton — LOCK V1 wiring stage) ════════
// Per `04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1.md` §2.2 pipeline order
// LOCKED §42.10 + §9 Engine #2 STUB caveat workaround.
//
// IMPORTANT — DEFERRED engine wiring:
// Existing engines în `src/engine/` are coupled cu app context (CDL,
// localStorage, Firebase). Pure-function refactor for simulator usage is OUT
// OF SCOPE per A3 prompt §STEP 5 push-back productive rule (spec gap critical
// detected mid-implementation → flag, NU forța implementation).
//
// This skeleton:
// 1. Provides deterministic placeholder outputs per engine (sufficient for
//    smoke tests + invariants validator + flagging engine wiring)
// 2. Engine #2 stub fallback per §9 (240 templates fallback flag)
// 3. Real engine integration deferred to follow-up task post Engine #2 ADR 024
//    full spec + Engines #4-#8 ADR stubs canonical (ADR 027/028/029) + adapter
//    design (existing engine signature → pure function adapter).

/** @typedef {import('./types.js').ConstraintObject} ConstraintObject */
/** @typedef {import('./types.js').EnginesPipelineOutput} EnginesPipelineOutput */

/**
 * Engine #1 Periodization placeholder — Linear Block V1 deterministic.
 * @param {ConstraintObject} c
 */
function runPeriodization(c) {
  // Linear Block V1 per HANDOVER §45 LOCKED — Week 1 LOAD baseline / 2 LOAD+ / 3 PEAK / 4 DELOAD.
  // Persona modifier per Israetel volume landmarks.
  const modifier = c.persona.age >= 60 ? 0.50 : c.persona.age >= 40 ? 0.70 : 1.00;
  const baselineVolume = 12 * modifier; // working sets / muscle / week baseline
  return {
    linear_block_week: 1,
    volume_floor: Math.round(baselineVolume * 0.7),
    volume_ceiling: Math.round(baselineVolume * 1.15),
    phase: c.goal.phase.toLowerCase(),
  };
}

/**
 * Engine #2 Goal Adaptation — STUB workaround §9 (240 templates fallback).
 * @param {ConstraintObject} c
 */
function runGoalAdaptation(c) {
  const phaseDelta = c.goal.phase === 'CUT' ? -300
    : c.goal.phase === 'BULK' ? +250
    : c.goal.phase === 'RECOMP' ? -100
    : 0;
  return {
    template: c.goal.template,
    phase: c.goal.phase,
    kcal_target_delta: phaseDelta,
    kcal_target: 2000 + phaseDelta, // placeholder — real impl uses Mifflin-St Jeor + activity
    macro_split: { P: 1.8, C: 2.0, F: 0.9 },
    fallback_template_240: true, // §9 STUB workaround flag — Engine #2 spec gap
  };
}

/**
 * Engine #5 Energy Adjustment placeholder.
 * @param {ConstraintObject} c
 */
function runEnergyAdjustment(c) {
  const factor = c.recovery.pre_session_readiness === 'GREEN' ? 1.00
    : c.recovery.pre_session_readiness === 'YELLOW' ? 0.92
    : 0.75;
  return {
    modulation_factor: factor,
    yo_yo_stabilizer: false,
  };
}

/**
 * Exercise Selection placeholder — fallback templates per persona × goal.
 * @param {ConstraintObject} c
 */
function runExerciseSelection(c) {
  // Trivial template selection for smoke testing.
  /** @type {string[]} */
  let exercises;
  if (c.equipment.includes('barbell')) {
    exercises = ['squat', 'bench', 'row', 'overhead_press'];
  } else if (c.equipment.includes('dumbbell')) {
    exercises = ['db_squat', 'db_bench', 'db_row', 'db_press'];
  } else {
    exercises = ['bodyweight_squat', 'pushup', 'inverted_row', 'pike_pushup'];
  }
  return {
    exercises,
    substitutions_applied: [],
    fallback_used: false,
  };
}

/**
 * Engine #8 Warm-up & Mobility placeholder.
 * @param {ConstraintObject} c
 */
function runWarmUp(c) {
  return {
    protocol: c.persona.age >= 60 ? 'joint_mobility_extended' : 'dynamic_warmup',
    duration_min: c.persona.age >= 60 ? 8 : 5,
  };
}

/**
 * Execution placeholder — sets/reps/RIR matrix per template + experience.
 * @param {ConstraintObject} c
 * @param {ReturnType<typeof runExerciseSelection>} selection
 */
function runExecution(c, selection) {
  const baseline = c.experience === 'beginner' ? { sets: 3, reps: 10, rir: 3 }
    : c.experience === 'intermediate' ? { sets: 4, reps: 8, rir: 2 }
    : { sets: 5, reps: 6, rir: 1 };
  return {
    sets_reps_rir: selection.exercises.map((ex) => ({ exercise: ex, ...baseline })),
    rest_periods: { compound: 180, isolation: 90 },
    tempo_overlay: 'controlled',
  };
}

/**
 * Engine #7 Specialization placeholder — eligibility gate.
 * @param {ConstraintObject} c
 */
function runSpecialization(c) {
  // Per HANDOVER §45 Engine #7 LOCKED V1: Marius Advanced + Bulk/Recomp ONLY.
  const eligible = c.experience === 'advanced'
    && (c.goal.phase === 'BULK' || c.goal.phase === 'RECOMP');
  return {
    eligible,
    reason: eligible ? 'advanced_bulk_eligible' : 'gate_blocked_per_engine_7_LOCK_V1',
  };
}

/**
 * Engine #4 Deload placeholder — last gate.
 * @param {ConstraintObject} c
 * @param {ReturnType<typeof runPeriodization>} periodization
 */
function runDeload(c, periodization) {
  // Mesocycle week 4 = deload. Placeholder triggers nothing intrasession.
  return {
    triggered: periodization.linear_block_week === 4,
    depth: periodization.linear_block_week === 4 ? 0.45 : null,
  };
}

/**
 * Run full pipeline for a single ConstraintObject.
 *
 * @param {ConstraintObject} c
 * @returns {Promise<EnginesPipelineOutput>}
 */
export async function runEnginesPipeline(c) {
  const periodization = runPeriodization(c);
  const goal_adaptation = runGoalAdaptation(c);
  const energy_adjustment = runEnergyAdjustment(c);
  const exercise_selection = runExerciseSelection(c);
  const warm_up = runWarmUp(c);
  const execution = runExecution(c, exercise_selection);
  const specialization = runSpecialization(c);
  const deload = runDeload(c, periodization);

  return {
    periodization,
    goal_adaptation,
    energy_adjustment,
    exercise_selection,
    warm_up,
    execution,
    specialization,
    deload,
    final_session_blueprint: {
      summary: 'placeholder — real aggregator deferred post Engines #1-#8 ADR canonical',
      exercises_count: exercise_selection.exercises.length,
    },
  };
}
