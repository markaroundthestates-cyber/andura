// ══ FULL-PATH-SIM — config + engine bridge ════════════════════════════════
// The KEYSTONE the calibration-sim could NOT reach. calibration-sim drives
// dp.js getSmartRecommendation DIRECTLY (readiness=null), so it BYPASSES the
// path-A composition chain. This harness drives the WHOLE seam:
//
//   composePlannedWorkoutToday   (scheduleAdapterAggregate.compose.ts)
//     → buildUserStateForPipeline (scheduleAdapterAggregate.builder.ts)
//     → getDailyWorkout           (engine/schedule/scheduleAdapter/getDailyWorkout.js)
//        → runPipeline            (coach/orchestrator — 8-engine pipeline, ADR 030)
//        → buildSession           (engine/sessionBuilder.js)
//     → toPlannedExercise per ex  → DP.getSmartRecommendation (path B fills load)
//     → scaleSetsByReadiness + trimSessionToTimeBudget (compose seam)
//
// so the path-A engines wired behind flags are EXERCISED end-to-end. It mirrors
// the calibration-sim structure (config / profiles / run / analyze / hash) so the
// two are comparable, and it is deterministic (mulberry32 seeded) → a CI gate.
//
// The A/B mechanism is the SAME `localStorage._devFlags` override featureFlags.js
// reads first (resolution order step 1) — NO src change, NO real flag flip.

import { composePlannedWorkoutToday } from '../../../src/react/lib/scheduleAdapterAggregate.ts';
import { persistSessionLogs } from '../../../src/react/stores/workoutStore.logic.ts';
import { useOnboardingStore } from '../../../src/react/stores/onboardingStore.ts';
import { useWorkoutStore } from '../../../src/react/stores/workoutStore.ts';
import { useAerobicStore } from '../../../src/react/stores/aerobicStore.ts';
import { DB } from '../../../src/db.js';
import { getExerciseMetadata } from '../../../src/engine/exerciseLibrary.js';
import { DEV_FLAGS_KEY } from '../../../src/util/featureFlags.js';

export const N_PROFILES = 24;       // CI tier (determinism + deltas hold at any N)
export const N_WEEKS = 16;          // weeks of sessions per user journey
export const SEED = 0xf01ce7;       // distinct from calibration-sim SEED

// The path-A flags this harness PROVES are observable + safe through the real
// seam. Each maps to the journey trait that fires it.
export const PATH_A_FLAGS = Object.freeze([
  'dp_acwr_readiness_v1',          // ACWR spike → readiness penalty → set/weight hold
  'dp_weekly_recovery_alloc_v1',   // fatigued week → weekly volume redistributed
  'dp_emphasis_specialization_v1', // user emphasis pick → spec target + trade + #72 per-exercise sets-boost
  'dp_coherent_weekly_alloc_v1',   // #71 same-lift no longer swings across days (stable per-exercise dose)
  'dp_learned_volume_v1',          // multi-week response → personal MEV/MAV landmarks
  'dp_stimulus_per_min_v1',        // tight time budget → densest-first trim
  // dp_dip_classifier_v1 + dp_auto_pivot_v1 have NO live caller in the compose
  // path (dark primitives) — exercised at their reachable seam in fp-darkprimitives,
  // NOT here, and flagged honestly in the report. Including them here would be
  // faking full-path coverage they do not have.
]);

// The set of dp_*_v1 intelligence flags FLIPPED to registry-default ON (the clean
// partial flip 2026-06-08 — the subset proven 100% on the #70 persona-matrix AND
// green on the full suite; the e1rm/kalman/ceiling/population_prior/acwr/learned-
// volume/weekly-recovery/stimulus cluster stayed OFF because their ON behavior
// breaks pinned per-exercise unit contracts — reported as needs-fix). The frozen
// A/B baselines (hashOff = all-off world, hashOn = PATH_A-on / rest-off) were
// generated when these defaulted OFF — so once the registry defaults to ON, this
// harness can no longer rely on "no _devFlags ⇒ off". setPathAFlags now writes an
// EXPLICIT _devFlags map over this set so the OFF arm forces them all OFF and the
// ON arm forces exactly PATH_A_FLAGS ON (the rest OFF), making the A/B independent
// of the registry default — the SAME _devFlags-override mechanism, no engine
// change, baselines preserved byte-for-byte.
export const FLIPPED_FLAGS = Object.freeze([
  'dp_emphasis_specialization_v1', 'dp_coherent_weekly_alloc_v1',
  'dp_pain_deprioritize_v1', 'dp_pain_memory_v1', 'dp_effective_reps_v1',
  'dp_tendon_cap_v1', 'dp_deficit_throttle_v1', 'dp_energy_volume_v1',
  // THE FLIP 2026-06-08 — per-exercise intelligence brain + path-A dependents now
  // default ON. Added here so the A/B OFF baseline forces them explicitly OFF
  // (the harness can no longer rely on "no _devFlags ⇒ off"), keeping hashOff a
  // true all-off baseline byte-for-byte.
  'dp_e1rm_v1', 'dp_strength_kalman_v1', 'dp_ceiling_v1',
  'dp_population_prior_v1', 'dp_acwr_readiness_v1', 'dp_learned_volume_v1',
  'dp_weekly_recovery_alloc_v1', 'dp_stimulus_per_min_v1',
  // THE FLIP 2026-06-09 — #7 metric-types now defaults ON (the seconds INPUT UI
  // landed W2). Added here so the A/B arms force it explicitly OFF: the prescription
  // stream pins weight×reps for EVERY exercise; honoring metric-types would suppress
  // reps→targetSec for time/carry holds and move the frozen hashes. The honoring is
  // a CORRECTNESS fix (a Plank in seconds, not phantom reps) verified on the live
  // compose path + the #70 matrix, NOT in this determinism stream.
  'dp_metric_types_v1',
  // THE FLIP 2026-06-09 — Wave 1.3-D focus-policy now defaults ON (caps +
  // per-session requirements + weekly-as-session, verified 25/25 on the #70
  // persona matrix). Added here so the A/B arms force it explicitly OFF: the
  // frozen prescription stream pins a fixed per-focus composition for every
  // profile; honoring the focus-policy caps/requirements would prune/inject
  // exercises and move the frozen hashes. The ON behavior is proven correct on
  // the #70 matrix + the persona-acceptance suite, NOT in this determinism stream.
  'dp_focus_policy_v1',
]);

/** Reset every store + DB the compose path reads, between profiles. Mirrors the
 *  calibration-sim resetStore but covers the full-path store surface. */
export function resetWorld() {
  try { localStorage.clear(); } catch { /* jsdom always has localStorage */ }
  useWorkoutStore.setState({
    exIdx: 0, setIdx: 0, phase: 'idle', prHit: false, prData: null, history: {},
    sessionStart: null, lastRating: null, pausedSnapshot: null, lastSession: null,
    sessionsHistory: [], streak: 0, sessionTimeBudgetMin: null,
  });
  useAerobicStore.setState({ sessions: [] });
}

/**
 * Set the dev-flag override that the real featureFlags.isEnabled honors first.
 * Writes an EXPLICIT map over FLIPPED_FLAGS (registry default is now ON, post
 * 2026-06-08 flip) so the A/B is independent of the registry default:
 *   - `false` → ALL flipped flags forced OFF → the BASELINE (all-off) arm.
 *   - `true`  → exactly PATH_A_FLAGS ON, the rest of the flipped set OFF → the
 *               stacked path-A ON arm (matches the frozen hashOn semantics).
 *   - `{ only: 'flag_id' }` → exactly that ONE flag ON, the rest OFF → per-flag
 *               isolation, so each path-A flag's effect can be attributed end-to-end.
 */
export function setPathAFlags(mode) {
  const obj = {};
  for (const f of FLIPPED_FLAGS) obj[f] = false; // explicit OFF over the flipped set
  if (mode === true) {
    for (const f of PATH_A_FLAGS) obj[f] = true;
  } else if (mode && typeof mode === 'object' && typeof mode.only === 'string') {
    obj[mode.only] = true;
  }
  // mode === false / null → the all-off map above (the baseline arm).
  try { localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(obj)); } catch { /* ignore */ }
}

// ── deterministic RNG (mulberry32) — identical to the calibration-sim harness ──
export function rng(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
export const gauss = (r, mean, sd) => {
  const u = Math.max(1e-9, r());
  const v = r();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
export const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

/** Engine + store surface the run logic drives — the REAL prod modules. */
export const world = {
  composePlannedWorkoutToday,
  persistSessionLogs,
  useOnboardingStore,
  useWorkoutStore,
  useAerobicStore,
  DB,
  getExerciseMetadata,
};
