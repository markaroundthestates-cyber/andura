// ══ INVARIANTS VALIDATOR (4-Invariant Safety Stack + 5th Medical Safety) ═══
// Per `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §42.9 LOCKED V1
// + §50.3.10 (Medical Safety 5th invariant).
//
// Per `04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1.md` §5: each branch
// produces an `invariants_check` object (PASS/FAIL/SKIP per invariant).

/**
 * @typedef {import('./types.js').EnginesPipelineOutput} EnginesPipelineOutput
 * @typedef {import('./types.js').ConstraintObject} ConstraintObject
 * @typedef {import('./types.js').InvariantsCheck} InvariantsCheck
 */

const PASS = 'PASS';
const FAIL = 'FAIL';
const SKIP = 'SKIP';

/**
 * I1 — Volume under MRV (Maximum Recoverable Volume).
 * Volume = sum sets × reps across exercises. MRV per persona × goal context.
 * Fallback MRV: persona-aware ballpark (Maria 0.50× / Gigica 0.70× / Marius 1.00×
 * × Israetel 11-grup baseline ~12-20 working sets per muscle / week).
 *
 * @param {EnginesPipelineOutput} out
 * @param {ConstraintObject} c
 * @returns {'PASS'|'FAIL'|'SKIP'}
 */
function checkI1(out, c) {
  const exec = out.execution;
  if (!exec || !Array.isArray(/** @type {any} */(exec).sets_reps_rir)) return SKIP;
  const total = /** @type {any} */(exec).sets_reps_rir
    .reduce((sum, e) => sum + Number(e?.sets || 0) * Number(e?.reps || 0), 0);
  // Heuristic MRV ceiling per session: ~80 reps total Maria / ~120 Gigica / ~180 Marius
  const persona = c.persona.age >= 60 ? 'maria' : c.persona.age >= 40 ? 'gigica' : 'marius';
  const mrvCeiling = persona === 'maria' ? 80 : persona === 'gigica' ? 120 : 180;
  return total > mrvCeiling ? FAIL : PASS;
}

/**
 * I2 — RIR > 0 (NU failure cu zero in reserve, except prescribed).
 * @param {EnginesPipelineOutput} out
 * @returns {'PASS'|'FAIL'|'SKIP'}
 */
function checkI2(out) {
  const exec = out.execution;
  if (!exec || !Array.isArray(/** @type {any} */(exec).sets_reps_rir)) return SKIP;
  const sets = /** @type {any} */(exec).sets_reps_rir;
  for (const s of sets) {
    if (Number(s?.rir) < 0) return FAIL; // negative RIR = nonsense
    if (Number(s?.rir) === 0 && !s?.intentional_failure) return FAIL;
  }
  return PASS;
}

/**
 * I3 — Frequency under 6/sapt cap (recovery floor per persona).
 * Most personas <=5x. Advanced may go 6x but never 7x autoresolved.
 * @param {ConstraintObject} c
 * @returns {'PASS'|'FAIL'|'SKIP'}
 */
function checkI3(c) {
  return c.schedule.frequency >= 6 ? FAIL : PASS;
}

/**
 * I4 — Deload mandatory (week 4 in mesocycle, NU optional).
 * Pipeline must produce a `deload` block even if `triggered=false` (signal-only).
 * @param {EnginesPipelineOutput} out
 * @returns {'PASS'|'FAIL'|'SKIP'}
 */
function checkI4(out) {
  if (!('deload' in out)) return FAIL; // engine #4 didn't run → spec gap
  return PASS;
}

/**
 * I5 — Medical Safety (§50.3.10).
 * Injury/contraindication flags must be respected by exercise selection
 * (no contraindicated exercises in selected set).
 *
 * @param {EnginesPipelineOutput} out
 * @param {ConstraintObject} c
 * @returns {'PASS'|'FAIL'|'SKIP'}
 */
function checkI5(out, c) {
  const flags = c.recovery.injury_flags;
  if (!flags.length) return PASS;
  const exec = out.execution;
  if (!exec || !Array.isArray(/** @type {any} */(exec).sets_reps_rir)) return SKIP;
  const exercises = /** @type {any} */(exec).sets_reps_rir.map((e) => String(e?.exercise || '').toLowerCase());

  // Heuristic contraindication map (subset; real impl reads from curated DB
  // §50.3 D2 + clinical guidelines NSCA + ACSM).
  const contraindicated = {
    'knee_arthrosis': ['squat_deep', 'jump', 'lunge_jump'],
    'shoulder_impingement': ['overhead_press', 'snatch', 'clean_jerk'],
    'lower_back_acute': ['deadlift', 'good_morning', 'bent_row'],
    'pregnant': ['supine_bench', 'plank_long', 'crunch'],
  };
  for (const flag of flags) {
    const banned = contraindicated[String(flag).toLowerCase()];
    if (!banned) continue;
    for (const ex of exercises) {
      if (banned.some((b) => ex.includes(b))) return FAIL;
    }
  }
  return PASS;
}

/**
 * Validate full branch — runs all 5 invariants.
 * @param {EnginesPipelineOutput} out
 * @param {ConstraintObject} c
 * @returns {InvariantsCheck}
 */
export function validateBranch(out, c) {
  return {
    I1_volume_under_mrv: checkI1(out, c),
    I2_rir_above_zero: checkI2(out),
    I3_frequency_under_6: checkI3(c),
    I4_deload_mandatory: checkI4(out),
    I5_medical_safety: checkI5(out, c),
  };
}

/**
 * Returns true if any invariant FAILED. Per §6 flagging — invariant_violation
 * = bug spec gap, escalate Daniel.
 * @param {InvariantsCheck} check
 */
export function hasViolation(check) {
  return Object.values(check).some((v) => v === FAIL);
}
