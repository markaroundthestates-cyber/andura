// ══ ENGINE SIGNAL-BUS — pure computed-vs-applied trace builder ════════════
// Observation-only instrument: for each pipeline engine it records what the
// engine COMPUTED (the blueprint keys it emitted via output.meta) vs what
// getDailyWorkout ACTUALLY READ (applied) vs what was DROPPED (computed but
// unread). This makes Faza 1/2 wiring provable and catches "computed-but-
// dropped" regressions in a unit test. It changes NO prescription.
//
// PURE — no React/DOM/localStorage import (engine layer). The dev-gated SINK
// lives React-side in src/react/lib/signalBus.ts; this module only builds the
// record from the `results` array getDailyWorkout already has in hand.

/**
 * APPLIED-MAP — the single SSOT of which blueprint fields getDailyWorkout
 * actually consumes, keyed by engine id. A future wiring PR edits this map as
 * it lights up a field, and the test (signalBus.core.test.js) asserts against
 * it. `'*'` = the whole blueprint is consumed (applied === computed).
 *
 * Verified against getDailyWorkout.js reads:
 *   periodization   → volume_target_pct (volumeTargets)
 *   specialization  → target_muscle_group (specializationTarget)
 *   warmup          → whole blueprint (returned as `warmup`)
 *   goalAdaptation  → rest_time_modifier (restTimeRange) + rep_range_modifier
 *                     (DP rep band) + rir_target_modifier (intensity label).
 *                     kcal_target_delta_pct/macro_split stay DROPPED here — they
 *                     drive the separate nutrition aggregate, NOT the workout.
 *   deload          → intensity_modifier, deload_state
 *   energyAdjustment/bayesianNutrition → none read in the workout pipeline
 *   tempo → tempo_prescription + form_cue (uniform session-level cue, F2 #3)
 */
export const APPLIED_MAP = {
  periodization: new Set(['volume_target_pct']),
  specialization: new Set(['target_muscle_group']),
  warmup: '*',
  goalAdaptation: new Set(['rest_time_modifier', 'rep_range_modifier', 'rir_target_modifier']),
  deload: new Set(['intensity_modifier', 'deload_state']),
  energyAdjustment: new Set(),
  bayesianNutrition: new Set(),
  // F2 #3 — tempo_prescription (preSetIntro → session cue) + form_cue surfaced
  // as a UNIFORM session-level narration (per-exercise movementId is a Faza-3
  // input dep — not faked). Display only; no weight/sets/reps.
  tempo: new Set(['tempo_prescription', 'form_cue']),
};

/**
 * Build the per-session signal trace from the pipeline `results` array.
 * Pure + deterministic — same inputs → identical trace (modulo the `t`
 * timestamp injected by the caller; default Date.now at the I/O boundary).
 *
 * @param {Array} results pipeline adapter results ({ ok, output:{id,meta}, error:{code,severity} })
 * @param {Record<string, Set<string>|'*'>} appliedMap which fields getDailyWorkout reads per engine
 * @param {object|null} hardError the first hard-error result, or null
 * @param {number} now epoch ms (injected for determinism; defaults to Date.now())
 * @returns {{v:1, t:number, hardHalt:(string|null), engines:Array}}
 */
export function buildSessionSignalTrace(results, appliedMap, hardError = null, now = Date.now()) {
  const list = Array.isArray(results) ? results : [];
  const engines = list
    .filter((r) => r && r.output && typeof r.output.id === 'string')
    .map((r) => {
      const engineId = r.output.id;
      const ran = r.ok === true;
      const computed = ran ? Object.keys(r.output.meta || {}) : [];
      const map = appliedMap ? appliedMap[engineId] : undefined;
      const applied =
        map === '*'
          ? computed.slice()
          : computed.filter((k) => map && map.has(k));
      const dropped = computed.filter((k) => !applied.includes(k));
      const sig = { engineId, ran, computed, applied, dropped };
      const errorCode = r.error && r.error.code;
      if (errorCode) sig.errorCode = errorCode;
      return sig;
    });

  const hardHalt = hardError
    ? (hardError.error && hardError.error.adapterId) ||
      (hardError.output && hardError.output.id) ||
      null
    : null;

  return { v: 1, t: now, hardHalt, engines };
}
