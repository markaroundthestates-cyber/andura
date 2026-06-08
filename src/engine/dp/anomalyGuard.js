// ══ BUILD #5/A — Anomaly / fat-finger guard (F4 spec §A) ═════════════════════
// A LIVE FIX, not a flagged experiment. NumberField sanitizes input FORMAT but has
// NO upper bound, so a fat-finger (the live "aveam 90, vreau 95, se face 9590.0"
// bug, NumberField.tsx:5-8) — a 950-for-95 or a 9590 — reaches the log unfiltered.
// That single outlier then poisons calibration (dev=loggedKg/recKg, dp.js:459),
// the demonstrated-working PR-floor (dp.js:523 takes the MAX → an outlier ratchets
// the floor up permanently), and (flag-on) e1RM/Kalman.
//
// This is a PURE, deterministic sanity check — no DB, no state. It does NOT reject
// or silently drop input (anti-paternalism): it flags an implausible value so the
// UI can ask "sigur?" with a suggested correction. A user who CONFIRMs a real
// outlier still logs it as-is. Distinct from #6 (ego-jump): #5 is an implausible
// TYPO (×10 / digit-doubling); #6 is a plausible-but-too-aggressive REAL load.
//
// Engine belt-and-suspenders: the caller passes the same check to skip an
// UNCONFIRMED outlier from calibration (dp._recordCalibration) so the factor never
// learns from a fat-finger even if it somehow lands in logs.

import { ceilingE1RM } from './ceiling.js';

// ── Daniel-tunable bounds (F4 §A · flag-for-Daniel §4) ───────────────────────
// Conservative — they clip ONLY physically-absurd entries, never a strong-but-real
// lift. Surfaced as named constants so a sim-sweep / Daniel sanity-check can tune.
export const ANOMALY_BOUNDS = Object.freeze({
  // A logged load > lastLoggedW × this ⇒ suspect a ×10 / digit-doubling typo
  // (a 95→950 is ×10; a 95→959 is ~×10.1). 4× leaves real PR jumps (a +50% climb)
  // comfortably inside.
  JUMP_RATIO: 4,
  // A load beyond the physical ceiling × this is almost certainly a typo. Reuses
  // the dp/ceiling.js realistic ceiling (pure fn, flag-independent here) when
  // bodyweight is known; the ceiling is already generous (elite tier).
  CEILING_RATIO: 1.3,
  // No-ceiling fallback: a load beyond the exercise MAX_KG × this is suspect.
  MAXKG_RATIO: 1.5,
  // Reps outside [REPS_MIN, REPS_MAX] are implausible for a logged working set.
  REPS_MAX: 50,
  REPS_MIN: 1,
});

/**
 * @typedef {object} SanityResult
 * @property {boolean} ok        true ⇒ value is in-range (no confirm needed)
 * @property {('weight_jump'|'weight_ceiling'|'reps_high'|'reps_low'|null)} suspectKind
 *   which bound tripped (null when ok)
 * @property {('weight'|'reps'|null)} field   which field is suspect
 * @property {number|null} suggested  a plausible corrected value to offer (e.g. the
 *   last logged load for a ×10 typo), or null when no obvious correction exists
 * @property {number|null} plausible  the reference the suspicion is measured against
 *   (last load / ceiling / max) — for the UI's "data ta arata ~X" line
 */

/**
 * Sanity-check ONE logged set. PURE — deterministic, no side effects, no DB.
 * Returns {ok:true} for any in-range value (the common path). Flags an implausible
 * weight or reps so the caller (UI) can ask the user to confirm.
 *
 * @param {object} args
 * @param {string} args.ex            canonical engineName
 * @param {number} args.w             entered load (kg)
 * @param {number} args.reps          entered reps
 * @param {number|null} [args.lastLoggedW]  the user's previous logged load for this
 *   exercise (kg), if any — the relative-jump reference
 * @param {number|null} [args.maxKg]  the exercise's flat MAX_KG cap, if mapped
 * @param {number|null} [args.bwKg]   bodyweight (kg) for the realistic ceiling
 * @param {string} [args.sex]         'm' | 'f' for the ceiling
 * @returns {SanityResult}
 */
export function sanityCheckSet({ ex, w, reps, lastLoggedW, maxKg, bwKg, sex } = {}) {
  const ok = { ok: true, suspectKind: null, field: null, suggested: null, plausible: null };

  // ── REPS bounds (cheapest first) ───────────────────────────────────────────
  const r = typeof reps === 'string' ? parseInt(reps, 10) : Number(reps);
  if (Number.isFinite(r)) {
    if (r > ANOMALY_BOUNDS.REPS_MAX) {
      return { ok: false, suspectKind: 'reps_high', field: 'reps', suggested: null, plausible: ANOMALY_BOUNDS.REPS_MAX };
    }
    if (r > 0 && r < ANOMALY_BOUNDS.REPS_MIN) {
      return { ok: false, suspectKind: 'reps_low', field: 'reps', suggested: null, plausible: ANOMALY_BOUNDS.REPS_MIN };
    }
  }

  // ── WEIGHT bounds ────────────────────────────────────────────────────────
  const W = Number(w);
  if (!Number.isFinite(W) || W <= 0) return ok; // no load / bodyweight → nothing to bound

  // Relative jump: a ×JUMP_RATIO leap over the last logged load is a digit typo.
  const last = Number(lastLoggedW);
  if (Number.isFinite(last) && last > 0 && W > last * ANOMALY_BOUNDS.JUMP_RATIO) {
    return { ok: false, suspectKind: 'weight_jump', field: 'weight', suggested: last, plausible: last };
  }

  // Absolute ceiling: beyond a realistic physical ceiling (or MAX_KG) → typo.
  // The guard's ceiling is deliberately the ELITE-TIER FULLY-MATURE bound (high
  // trainingAge → ageFraction at its ceiling), NOT the user's current attainable
  // fraction — a fat-finger guard must only clip a PHYSICALLY-ABSURD value, never
  // a strong-but-real load. (Using the novice ageFraction floor here false-flagged
  // ordinary working loads — sim verified.)
  const CEILING_MATURE_TRAINING_AGE = 1000;
  let absCap = 0;
  const bw = Number(bwKg);
  if (Number.isFinite(bw) && bw > 0) {
    const ceil = ceilingE1RM(ex, bw, sex, CEILING_MATURE_TRAINING_AGE);
    // The e1RM ceiling IS already an upper-bound on the heaviest single the user
    // could ever realize; any logged WORKING set is necessarily ≤ it. Compare the
    // logged load directly against the e1RM ceiling × CEILING_RATIO headroom (no
    // rep-target back-solve — that would lower the cap below the e1RM and clip real
    // heavy low-rep sets).
    if (ceil > 0) absCap = ceil * ANOMALY_BOUNDS.CEILING_RATIO;
  }
  if (!(absCap > 0)) {
    const mk = Number(maxKg);
    if (Number.isFinite(mk) && mk > 0) absCap = mk * ANOMALY_BOUNDS.MAXKG_RATIO;
  }
  if (absCap > 0 && W > absCap) {
    // Suggest a /10 de-typo when that lands back under the cap (the common 950→95
    // / 9590→959 fat-finger); else no obvious correction.
    const deTyped = W / 10;
    const suggested = deTyped > 0 && deTyped <= absCap ? Math.round(deTyped * 10) / 10 : null;
    return { ok: false, suspectKind: 'weight_ceiling', field: 'weight', suggested, plausible: Math.round(absCap) };
  }

  return ok;
}

// ══ BUILD #65 — log OUTLIER detector vs the user's OWN posterior band ═════════
// _ENGINE_WIRING_2026-06-07/F7_pain_outlier_spec.md §2 (dp_log_outlier_v1, OFF).
//
// Distinct from sanityCheckSet above (a coarse PHYSICAL / ×10 fat-finger check):
// logOutlier is a STATISTICAL test against THIS user's own Kalman posterior band.
// A value can sit inside the elite physical ceiling yet be wildly outside the
// user's established working e1RM — that is the gap this closes. UPPER-tail only
// (an over-log is a mis-log; an under-log is real fatigue, never flagged — same
// protect-the-floor stance the PR-floor takes). Same flag-not-delete philosophy
// as sanityCheckSet (anti-paternalism): the caller keeps the set in `logs` and
// only suppresses its LEARNING contribution; the user can revert ("that was real").

// ── Daniel-tunable (spec §2 — DESIGN PROPOSALS, sim sweep + sanity before flip) ──
// How many posterior std-devs ABOVE mu a single set's e1RM must be to flag as a
// likely mis-log. Deliberately WIDE (4σ) so it only ever catches a gross over-log,
// NEVER a real PR (a PR moves mu a little and stays comfortably inside a few σ; a
// 2× typo blows past 4σ). Surfaced as a named const for a sim sweep / sanity check.
export const OUTLIER_Z = 4;
// The posterior must be MATURE before it can judge an outlier — a cold-start band
// is too wide/unreliable. Below this observation count, never flag (the fat-finger
// guard still protects cold-start).
export const OUTLIER_MIN_N = 5;

/**
 * @typedef {object} OutlierResult
 * @property {boolean} isOutlier  true ⇒ the set's e1RM is an UPPER-tail outlier vs
 *   the user's own mature posterior band (a likely over-log → exclude from learning)
 * @property {number|null} z       the standardized distance (obs−mu)/sigma, or null
 *   when the test could not run (no posterior / immature / invalid sigma)
 */

/**
 * Statistical outlier test against the user's OWN Kalman posterior band. PURE —
 * deterministic, no DB, no clock; the caller passes the set's e1RM + the posterior.
 *
 * Fires ONLY when:
 *   - the posterior is mature (`n >= OUTLIER_MIN_N`) with a finite `sigma > 0`, and
 *   - the observation is `> OUTLIER_Z` std-devs ABOVE `mu` (upper tail only).
 * Returns isOutlier:false (with z:null) for any cold-start / missing-band case so
 * a thin posterior never false-flags — the fat-finger guard remains the protection.
 *
 * @param {number} e1rmObs   the logged set's RIR-corrected e1RM (dp.e1RMForSet)
 * @param {{mu?:number, sigma?:number, n?:number}|null|undefined} posterior the
 *   exercise's loaded Kalman posterior (strengthKalman.loadPosterior)
 * @returns {OutlierResult}
 */
export function logOutlier(e1rmObs, posterior) {
  const obs = Number(e1rmObs);
  if (!posterior || !Number.isFinite(obs) || obs <= 0) return { isOutlier: false, z: null };
  const mu = Number(posterior.mu);
  const sigma = Number(posterior.sigma);
  const n = Number(posterior.n);
  // Mature-band guard: too-few observations or a degenerate sigma → cannot judge.
  if (!Number.isFinite(n) || n < OUTLIER_MIN_N) return { isOutlier: false, z: null };
  if (!Number.isFinite(mu) || mu <= 0) return { isOutlier: false, z: null };
  if (!Number.isFinite(sigma) || sigma <= 0) return { isOutlier: false, z: null };
  const z = (obs - mu) / sigma;
  // UPPER tail only — an under-log is real fatigue (protect the down-side).
  return { isOutlier: z > OUTLIER_Z, z };
}
