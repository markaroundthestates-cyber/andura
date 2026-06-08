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
// seam (default OFF in production). Each maps to the journey trait that fires it.
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
 *   - `false` → write nothing → registry default (all OFF) → the BASELINE arm.
 *   - `true`  → ALL path-A flags ON → the stacked ON arm.
 *   - `{ only: 'flag_id' }` → exactly that ONE flag ON (the rest OFF) → per-flag
 *     isolation, so each path-A flag's effect can be attributed end-to-end.
 */
export function setPathAFlags(mode) {
  if (mode === false || mode == null) {
    try { localStorage.removeItem(DEV_FLAGS_KEY); } catch { /* ignore */ }
    return;
  }
  const obj = {};
  if (mode === true) {
    for (const f of PATH_A_FLAGS) obj[f] = true;
  } else if (typeof mode === 'object' && typeof mode.only === 'string') {
    obj[mode.only] = true;
  }
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
