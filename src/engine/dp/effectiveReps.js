// ══ BUILD F6b V3 #19 — effective-reps / stimulus model (F6b spec §2) ═════════
// Today "volume" everywhere = raw sets × reps × weight (prEngine volume, the M2
// weakness amplify, the Israetel set-counts) — none weights a set by its
// PROXIMITY TO FAILURE, so a 15-rep set left deep in the tank counts the same as
// a grinding set taken to the bone. That hidden gap is "junk volume": logged
// tonnage that delivers little hypertrophic stimulus.
//
// The signal is ALREADY in the logs: the 3-bucket rating reverse-maps to RIR via
// the F3 RATING_TO_RIR = {usor:3, potrivit:1, greu:0} (dp.js:563) — RIR is exactly
// "reps in reserve", the inverse of proximity-to-failure. So the stimulus model is
// a PURE FUNCTION of data the engine already has — no new user input, no new
// persistence, no DB, no clock.
//
// Sports-science convention (Hertzog/Beardsley "effective reps"): only the reps
// within ~EFFECTIVE_WINDOW of failure carry the hypertrophic stimulus. A set taken
// to failure ≈ full stimulus; a left-in-the-tank set ≈ a fraction.
//
// This build ships the PURE estimator + a narration aggregate (Progres "real
// stimulus this week"). The DOSE path (feed stimulusSets into the V1 learned
// landmark / session budget so a to-failure trainee needs FEWER raw sets) is
// DEFERRED (spec §2c.2 — needs V1 + a trim-only clamp). Flag-OFF the consumer
// never calls this → byte-identical.

import { DP } from '../dp.js';

// ── Daniel-tunable (F6b §7 — DESIGN PROPOSAL, needs a sim sweep + sanity check
//    before the flag flips ON, exactly like the RATING_TO_RIR / R_CAP caveat) ──
export const EFFECTIVE_WINDOW = 5;          // last ~5 reps before failure carry stimulus
export const TARGET_EFFECTIVE_PER_SET = 5;  // a to-failure working set ≈ one full stimulus-set

// RIR map lives on the dp singleton (dp.js:563). Read it there so V3 stays in
// lock-step with F3 (and any temperament adjustment) rather than re-declaring it.
const RATING_TO_RIR = DP.RATING_TO_RIR;

/**
 * Reps-in-reserve for a logged set, from its coarse rating. Falls back to the
 * neutral `potrivit` reserve when the rating is absent/legacy (matching the
 * engine's neutral-7 convention). PURE.
 * @param {{ rating?: string }} set
 * @returns {number}
 */
function rirOf(set) {
  const r = set && set.rating;
  if (r === 'usor' || r === 'potrivit' || r === 'greu') return RATING_TO_RIR[r];
  return RATING_TO_RIR.potrivit;
}

/**
 * Effective (stimulus-carrying) reps for one logged set: only the reps within
 * EFFECTIVE_WINDOW of failure count. A set with RIR 0 (greu, at failure) counts up
 * to EFFECTIVE_WINDOW; a set with RIR 3 (usor) counts only the last ~2 reps; a set
 * with fewer total reps than the window counts all of them. PURE, deterministic,
 * never NaN. Clamped to [0, reps].
 *
 * @param {{ reps?: number|string, rating?: string }} set
 * @returns {number} effective reps in [0, reps]
 */
export function effectiveReps(set) {
  if (!set) return 0;
  const reps = Number(set.reps);
  if (!Number.isFinite(reps) || reps <= 0) return 0;
  const rir = rirOf(set);
  // reps near failure only: the window minus the reserve, floored at 0, capped at
  // the reps actually performed.
  return Math.min(reps, Math.max(0, EFFECTIVE_WINDOW - rir));
}

/**
 * Aggregate a list of logged sets into a "stimulus set count" — the equivalent
 * number of full to-failure working sets the delivered effective reps represent.
 * This is what the narration compares against the RAW set count: a user logging
 * many sets but leaving everything in reserve shows stimulusSets << rawSets (junk
 * volume); a user grinding every set to failure shows stimulusSets ≈ rawSets.
 *
 * PURE — a read of the existing logs rows (w/reps/rating). No DB, no clock, no new
 * persistence. Returns { rawSets, effectiveReps, stimulusSets } with stimulusSets
 * rounded to 1 decimal for display stability.
 *
 * @param {Array<{ reps?: number|string, rating?: string }>} sets
 * @returns {{ rawSets: number, effectiveReps: number, stimulusSets: number }}
 */
export function summarizeStimulus(sets) {
  if (!Array.isArray(sets) || sets.length === 0) {
    return { rawSets: 0, effectiveReps: 0, stimulusSets: 0 };
  }
  let totalEff = 0;
  let rawSets = 0;
  for (const s of sets) {
    if (!s) continue;
    const reps = Number(s.reps);
    if (!Number.isFinite(reps) || reps <= 0) continue;
    rawSets += 1;
    totalEff += effectiveReps(s);
  }
  const stimulusSets = totalEff / TARGET_EFFECTIVE_PER_SET;
  return {
    rawSets,
    effectiveReps: totalEff,
    stimulusSets: Math.round(stimulusSets * 10) / 10,
  };
}
