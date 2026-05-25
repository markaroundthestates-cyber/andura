// Coach Brain Eval — normalize 8 AdapterResults → per-dimension decision.
//
// Per COACH_BRAIN_EVAL_DESIGN.md §4.1: anduraOut = normalize(runPipeline(...)).
// The normalized shape is the SSOT for both the invariant checker (§invariants)
// and the Claude-oracle comparator (§comparators). One stable schema, machine-
// comparable, per-dimension (§3.2 table).
//
// Field paths verified against engine return blocks (src/engine/*/index.js):
//   - periodization.meta = { mesocycle_phase, volume_target_pct, intensity_target_pct, deload_window }
//     + adapter surfaces output.constraintObject = { intensity_pct_1rm, volume_per_muscle, phase, deload_window }
//   - goalAdaptation.meta = { phase, kcal_target_delta_pct, ... }
//   - energyAdjustment.meta = { energy_state, adjustment_direction, adjustment_magnitude_pct, ... }
//   - bayesianNutrition.meta = { nutrition_inference_metadata: { posterior: { mu, sigma }, ... }, likelihood_probabilities, ... }
//   - specialization.meta = { activation_state, target_muscle_group, volume_modifier, ... }
//   - deload.meta = { deload_state, depth_pct, duration_weeks, intensity_modifier, ... }

import { ORDERED_ADAPTERS } from '../../src/coach/orchestrator/adapters/index.js';

const ADAPTER_IDS = ORDERED_ADAPTERS.map((a) => a.id);

/**
 * Map raw pipeline results array → keyed-by-adapter-id result map.
 * @param {Array<{ok:boolean, output?:any, error?:any}>} results
 */
function byId(results) {
  const map = {};
  results.forEach((r, i) => {
    map[ADAPTER_IDS[i]] = r;
  });
  return map;
}

/** Safe nested getter. */
function get(obj, path, dflt = undefined) {
  let cur = obj;
  for (const k of path) {
    if (cur == null || typeof cur !== 'object') return dflt;
    cur = cur[k];
  }
  return cur === undefined ? dflt : cur;
}

/**
 * Normalize a pipeline run into a per-dimension AnduraDecision.
 *
 * @param {Array<{ok:boolean, output?:any, error?:any}>} results - runPipeline output
 * @returns {{
 *   ok: boolean,
 *   haltedAt: string|null,
 *   pipelineErrors: Array<{adapter:string, code:string, message:string}>,
 *   raw: object,
 *   dimensions: object
 * }}
 */
export function normalize(results) {
  const map = byId(results);
  const pipelineErrors = [];
  let haltedAt = null;
  for (const id of ADAPTER_IDS) {
    const r = map[id];
    if (r && r.ok === false) {
      pipelineErrors.push({ adapter: id, code: get(r, ['error', 'code'], 'UNKNOWN'), message: get(r, ['error', 'message'], '') });
      if (haltedAt == null) haltedAt = id;
    }
  }

  const per = (id) => (map[id] && map[id].ok ? map[id].output : null);
  const periodization = per('periodization');
  const goal = per('goalAdaptation');
  const energy = per('energyAdjustment');
  const bayes = per('bayesianNutrition');
  const spec = per('specialization');
  const deload = per('deload');

  // Constraint Object — surfaced by periodization adapter output.constraintObject.
  const constraintObject = periodization ? periodization.constraintObject ?? get(periodization, ['trace', 'constraintObject'], null) : null;

  const dimensions = {
    // ── Volume / periodization ──────────────────────────────────────────────
    volume: periodization
      ? {
          phase: get(periodization, ['meta', 'mesocycle_phase'], null),
          volumeTargetPct: get(periodization, ['meta', 'volume_target_pct'], null), // muscle → sets
          intensityCorridor: get(periodization, ['meta', 'intensity_target_pct'], null), // {floor, ceiling}
          constraintObject, // {intensity_pct_1rm:{floor,ceiling}, volume_per_muscle:{m:{floor,ceiling}}, phase, deload_window}
        }
      : null,

    // ── Phase (goal adaptation: CUT/BULK/MAINTAIN/RECOMP) ─────────────────────
    phaseGoal: goal
      ? {
          phase: get(goal, ['meta', 'phase'], null),
          kcalTargetDeltaPct: get(goal, ['meta', 'kcal_target_delta_pct'], null),
        }
      : null,

    // ── Energy / readiness gating + progression direction ─────────────────────
    energy: energy
      ? {
          energyState: get(energy, ['meta', 'energy_state'], null), // 'green'|'yellow'|'red'|null
          adjustmentDirection: get(energy, ['meta', 'adjustment_direction'], null), // up/hold/down
          adjustmentMagnitudePct: get(energy, ['meta', 'adjustment_magnitude_pct'], null),
        }
      : null,

    // ── TDEE adaptation (Bayesian Nutrition) ──────────────────────────────────
    nutrition: bayes
      ? {
          posteriorMu: get(bayes, ['meta', 'nutrition_inference_metadata', 'posterior', 'mu'], null),
          posteriorSigma: get(bayes, ['meta', 'nutrition_inference_metadata', 'posterior', 'sigma'], null),
          likelihood: get(bayes, ['meta', 'likelihood_probabilities'], null), // {deficit/surplus/maintenance}
          kcalFloorExcluded: get(bayes, ['trace', 'kcalFloorFilter', 'excludedCount'], null),
          kcalFloorMin: get(bayes, ['trace', 'kcalFloorFilter', 'floorMin'], null),
        }
      : null,

    // ── Specialization (4-gate) ───────────────────────────────────────────────
    specialization: spec
      ? {
          activationState: get(spec, ['meta', 'activation_state'], null),
          targetMuscleGroup: get(spec, ['meta', 'target_muscle_group'], null),
          volumeModifier: get(spec, ['meta', 'volume_modifier'], null),
        }
      : null,

    // ── Deload ────────────────────────────────────────────────────────────────
    deload: deload
      ? {
          deloadState: get(deload, ['meta', 'deload_state'], null),
          depthPct: get(deload, ['meta', 'depth_pct'], null),
          durationWeeks: get(deload, ['meta', 'duration_weeks'], null),
          intensityModifier: get(deload, ['meta', 'intensity_modifier'], null),
        }
      : null,
  };

  return {
    ok: pipelineErrors.length === 0,
    haltedAt,
    pipelineErrors,
    raw: map,
    dimensions,
  };
}

export { ADAPTER_IDS };
