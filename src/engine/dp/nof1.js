// ══ BUILD F6c #34 — N-of-1 SELF-EXPERIMENT (F6c spec §5) ═════════════════════
// The MEASUREMENT half is fully REUSED from #31: trendDirection's noise-aware Kalman
// `slope` is a per-exercise progress rate. #34 adds a deliberately SMALL, infrequent,
// opt-in controlled comparison on ONE well-established lift: run arm A (more volume /
// lower intensity) for a short micro-block, then arm B (less volume / higher
// intensity) for an equal block, compare the two arms' slopes (noise-aware — only
// acts when the difference clears the posterior's sigma), and KEEP the winner as a
// per-exercise preference that biases that lift's future corridor / set choice. This
// is "personalization beyond the population" — the user's OWN response, not the cohort
// default.
//
// RISK HIGH — it deliberately perturbs prescription to learn. The guardrails are the
// safety envelope and are MANDATORY:
//   • never in a CUT (a deficit confounds the result — require MAINTENANCE/BULK)
//   • never on a beginner (no stable baseline)
//   • never on more than ONE lift at a time (confounding)
//   • always REVERSIBLE — a null preference == today's behavior (the OFF-equivalent
//     even when the flag is ON), so a flip is never one-way
//   • the bias is bounded to ±1 set (a small, reversible corridor nudge) so an
//     experiment arm can never produce an unsafe load (ego/anomaly caps still apply
//     downstream in dp.js — the bias only shifts SET COUNT, path A, never the kg).
//
// CONFOUNDING CONTROLS (one lift / non-cut / non-beginner / reversible / the
// micro-block length + the slope-significance Z) are a DESIGN PROPOSAL (spec §9 +
// §5d) — they need a sim sweep + Daniel review before dp_nof1_v1 flips ON. This module
// ships the pure measurement + eligibility + winner-decision + reversible-bias core,
// fully tested; the LIVE auto-scheduling of arms across sessions (advancing the
// in-flight counter during a real session) is the fragile, confounding-sensitive part
// — it is provided as a pure orchestrator (advanceExperiment) whose live-session
// wiring is DEFERRED for Daniel's review (mirrors F6a's deferred deload-timing).

import { DB } from '../../db.js';

export const NOF1_PREFERENCE_KEY = 'dp-nof1-preference';   // EN-name-keyed, synced
export const NOF1_EXPERIMENT_KEY = 'dp-nof1-experiment';   // single in-flight state, synced

// ── Tunables (DESIGN PROPOSALS — spec §9, Daniel sanity-check before flip) ─────
export const NOF1_BLOCK_SESSIONS = 3;   // sessions per arm (arm A then arm B)
export const NOF1_SIGNIFICANCE_Z = 1.0; // slope diff must clear Z·sigma to pick a winner
export const NOF1_MIN_TRAINING_AGE = 8; // distinct-day sessions on the lift = "established"
export const NOF1_SET_BIAS = 1;         // ±1 set nudge for the winning arm (bounded, reversible)

/** The two arms. 'volume' = +sets / lower intensity; 'intensity' = −sets / higher. */
export const NOF1_ARMS = Object.freeze(['volume', 'intensity']);

// ── Preference store (EN-name-keyed, quota-guarded, sync) ─────────────────────

/** @returns {Record<string, {arm:string, decidedTs:number, slopeA:number, slopeB:number}>} */
function _getAllPrefs() {
  const raw = /** @type {any} */ (DB.get(NOF1_PREFERENCE_KEY));
  return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
}

/**
 * The kept N-of-1 preference for one lift, or null when none decided (→ today's
 * behavior). A null preference is the reversible default.
 * @param {string} engineName EN canonical name
 * @returns {{arm:string, decidedTs:number, slopeA:number, slopeB:number}|null}
 */
export function loadPreference(engineName) {
  const p = _getAllPrefs()[engineName];
  if (!p || typeof p !== 'object') return null;
  if (p.arm !== 'volume' && p.arm !== 'intensity') return null;
  return p;
}

/**
 * Persist a decided preference. QUOTA-GUARDED (DB.set → {ok:false} on quota; never
 * throws / corrupts). A null `arm` CLEARS the preference (reversible by design).
 * @param {string} engineName EN canonical name
 * @param {{arm:string|null, decidedTs:number, slopeA:number, slopeB:number}} pref
 * @returns {{ok:boolean, error?:string}}
 */
export function savePreference(engineName, pref) {
  if (typeof engineName !== 'string' || !engineName) return { ok: false, error: 'bad_key' };
  const all = _getAllPrefs();
  if (!pref || pref.arm == null) {
    delete all[engineName]; // reversible: clearing returns the lift to today's behavior
  } else {
    if (pref.arm !== 'volume' && pref.arm !== 'intensity') return { ok: false, error: 'bad_arm' };
    all[engineName] = {
      arm: pref.arm,
      decidedTs: Number(pref.decidedTs) || 0,
      slopeA: Number(pref.slopeA) || 0,
      slopeB: Number(pref.slopeB) || 0,
    };
  }
  const res = DB.set(NOF1_PREFERENCE_KEY, all);
  return res && res.ok === false ? res : { ok: true };
}

// ── In-flight experiment state (single object — only ONE lift at a time) ──────

/**
 * The currently-running experiment, or null when none is in flight (the
 * one-at-a-time guard reads this).
 * @returns {{exercise:string, arm:string, sessionsInArm:number, slopeArmA:number|null}|null}
 */
export function loadExperiment() {
  const raw = /** @type {any} */ (DB.get(NOF1_EXPERIMENT_KEY));
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (typeof raw.exercise !== 'string' || !raw.exercise) return null;
  return raw;
}

/**
 * Persist (or CLEAR with null) the in-flight experiment. QUOTA-GUARDED.
 * @param {{exercise:string, arm:string, sessionsInArm:number, slopeArmA:number|null}|null} state
 * @returns {{ok:boolean, error?:string}}
 */
export function saveExperiment(state) {
  if (state == null) {
    const res = DB.set(NOF1_EXPERIMENT_KEY, null);
    return res && res.ok === false ? res : { ok: true };
  }
  if (typeof state.exercise !== 'string' || !state.exercise) return { ok: false, error: 'bad_state' };
  const res = DB.set(NOF1_EXPERIMENT_KEY, {
    exercise: state.exercise,
    arm: state.arm,
    sessionsInArm: Number(state.sessionsInArm) || 0,
    slopeArmA: state.slopeArmA == null ? null : Number(state.slopeArmA),
  });
  return res && res.ok === false ? res : { ok: true };
}

// ── Pure decision logic ───────────────────────────────────────────────────────

/**
 * Is a lift ELIGIBLE to START a new experiment? ALL guardrails must hold:
 *   • the lift is ESTABLISHED (trainingAge >= NOF1_MIN_TRAINING_AGE) with a
 *     confident trend (#31 — a stable baseline to perturb)
 *   • NOT a beginner (experience tier above the calibration window)
 *   • NOT in a CUT (a deficit confounds the result — require MAINTENANCE/BULK/etc.)
 *   • no experiment already running (one lift at a time)
 *   • no preference already decided for THIS lift (don't re-experiment a settled one)
 * PURE — no DB; the caller supplies the already-read context.
 * @param {object} ctx
 * @param {string} ctx.engineName
 * @param {number} ctx.trainingAge distinct-day sessions for the lift
 * @param {boolean} ctx.confidentTrend #31 trendDirection().confident
 * @param {boolean} ctx.isBeginner experience tier == beginner / calibration window
 * @param {string|null|undefined} ctx.energyPhase resolveActivePhase token
 * @param {boolean} ctx.experimentRunning an experiment is already in flight (any lift)
 * @param {boolean} ctx.hasPreference a preference is already decided for THIS lift
 * @returns {boolean}
 */
export function isEligibleForExperiment(ctx) {
  if (!ctx || typeof ctx.engineName !== 'string' || !ctx.engineName) return false;
  if (ctx.experimentRunning) return false;                 // one lift at a time
  if (ctx.hasPreference) return false;                     // already settled
  if (ctx.isBeginner) return false;                        // no stable baseline
  if (ctx.energyPhase === 'CUT') return false;             // deficit confounds
  if (!(Number(ctx.trainingAge) >= NOF1_MIN_TRAINING_AGE)) return false; // not established
  if (!ctx.confidentTrend) return false;                   // no clean signal to perturb
  return true;
}

/**
 * Decide the winning arm from the two arms' measured slopes, noise-aware: a winner
 * is returned ONLY when the slope DIFFERENCE clears NOF1_SIGNIFICANCE_Z · sigma
 * (the posterior's own noise band). An inconclusive experiment (diff < band, or a
 * missing/invalid slope) returns null → the NULL preference is KEPT (no spurious
 * personalization). PURE.
 * @param {number} slopeA arm-A (volume) Kalman mu-slope
 * @param {number} slopeB arm-B (intensity) Kalman mu-slope
 * @param {number} sigma posterior uncertainty (noise band scale)
 * @returns {'volume'|'intensity'|null}
 */
export function decideWinner(slopeA, slopeB, sigma) {
  const a = Number(slopeA);
  const b = Number(slopeB);
  const s = Number(sigma);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const band = NOF1_SIGNIFICANCE_Z * (Number.isFinite(s) && s > 0 ? s : 0);
  if (Math.abs(a - b) <= band) return null; // inconclusive — keep NULL (reversible)
  return a > b ? 'volume' : 'intensity';
}

/**
 * The reversible SET-COUNT bias for a lift's kept preference: +NOF1_SET_BIAS for the
 * 'volume' winner, −NOF1_SET_BIAS for the 'intensity' winner, 0 when no preference
 * (today's behavior). Bounded to ±1 set — a small, reversible corridor nudge that can
 * never produce an unsafe load (the kg is untouched; ego/anomaly caps still apply
 * downstream). PURE — the caller supplies the loaded preference.
 * @param {{arm:string}|null} preference loadPreference() output
 * @returns {number} -NOF1_SET_BIAS | 0 | +NOF1_SET_BIAS
 */
export function nof1SetBias(preference) {
  if (!preference) return 0;
  if (preference.arm === 'volume') return NOF1_SET_BIAS;
  if (preference.arm === 'intensity') return -NOF1_SET_BIAS;
  return 0;
}

/**
 * Pure orchestrator for advancing an in-flight experiment by ONE completed session.
 * Returns the NEXT experiment state + (when the experiment completes) the decided
 * preference. Arm A runs NOF1_BLOCK_SESSIONS sessions, then arm B the same, then the
 * winner is decided. NO DB — the caller persists the returned state/preference.
 *
 * NOTE: the LIVE wiring of this into the real session loop (calling it on each
 * session completion, sourcing the per-arm slopes) is the fragile, confounding-
 * sensitive part DEFERRED for Daniel's review (spec §5d / §9). This pure stepper is
 * shipped + tested so that wiring is a thin, reviewable boundary, not new logic.
 *
 * @param {{exercise:string, arm:string, sessionsInArm:number, slopeArmA:number|null}} state
 * @param {number} currentSlope the lift's slope measured over the CURRENT arm's block
 * @param {number} sigma posterior uncertainty for the winner decision
 * @returns {{ next: object|null, decided: {arm:string|null, decidedTs:number, slopeA:number, slopeB:number}|null }}
 */
export function advanceExperiment(state, currentSlope, sigma) {
  if (!state || typeof state.exercise !== 'string') return { next: null, decided: null };
  const inArm = (Number(state.sessionsInArm) || 0) + 1;
  // Still inside the current arm's block → just advance the counter.
  if (inArm < NOF1_BLOCK_SESSIONS) {
    return { next: { ...state, sessionsInArm: inArm }, decided: null };
  }
  // The current arm's block just completed.
  if (state.arm === NOF1_ARMS[0]) {
    // Arm A done → record its slope, switch to arm B, reset the counter.
    return {
      next: {
        exercise: state.exercise,
        arm: NOF1_ARMS[1],
        sessionsInArm: 0,
        slopeArmA: Number(currentSlope) || 0,
      },
      decided: null,
    };
  }
  // Arm B done → both arms measured → decide the winner + END the experiment.
  const slopeA = Number(state.slopeArmA) || 0;
  const slopeB = Number(currentSlope) || 0;
  const arm = decideWinner(slopeA, slopeB, sigma);
  return {
    next: null, // experiment ends (cleared) — only one lift at a time
    decided: { arm, decidedTs: Date.now(), slopeA, slopeB },
  };
}
