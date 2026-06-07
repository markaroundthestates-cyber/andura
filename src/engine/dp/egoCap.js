// ══ BUILD #6/B — ego-jump cap (F4 spec §B) ═══════════════════════════════════
// The find-your-weight climb caps a COACH-driven jump (demoW/ceiling, dp.js:1233),
// but there is no guard against a USER-DRIVEN ego jump: a user who manually logs a
// load far above the prescription, then rates greu / misses reps, has the next
// session's calibration + demoW chase the inflated number. SCALE-BACK / EASE-BACK
// are the only brakes and both are reactive.
//
// This is PURE + deterministic. It detects the ego jump and returns the capped
// load; the caller (dp.checkInSessionAdjust) applies it behind dp_ego_cap_v1
// (default OFF → byte-identical legacy). Distinct from #5/A: #5 is an implausible
// TYPO (quarantine + confirm); #6 is a PLAUSIBLE-but-too-aggressive REAL load
// (cap + down-weight + coach warning, no confirm).

// Daniel-tunable: how far above the recommendation a logged load may go before it
// is treated as an ego jump (a +25% leap). Surfaced for a sim sweep / sanity check.
export const EGO_JUMP_RATIO = 1.25;

/**
 * Detect a user-driven ego jump that was then too hard / short on reps.
 * @param {object} args
 * @param {number} args.recKg     the load RECOMMENDED for the set just logged
 * @param {number} args.loggedKg  the load the user ACTUALLY logged
 * @param {number} args.loggedReps reps achieved on that set
 * @param {number} args.rMin      the active phase minimum rep target
 * @param {boolean} args.wasHard  the set was rated greu (near-failure)
 * @returns {boolean}
 */
export function isEgoJump({ recKg, loggedKg, loggedReps, rMin, wasHard }) {
  const rec = Number(recKg);
  const logged = Number(loggedKg);
  if (!Number.isFinite(rec) || rec <= 0) return false;
  if (!Number.isFinite(logged) || logged <= 0) return false;
  if (logged <= rec * EGO_JUMP_RATIO) return false; // not an aggressive jump
  const missedReps = Number.isFinite(loggedReps) && Number.isFinite(rMin) && loggedReps < rMin;
  return Boolean(wasHard) || missedReps;
}

/**
 * The capped next prescription for an ego jump: never follow the ego load up —
 * hold at rec × EGO_JUMP_RATIO (the most we let a single jump pull the rec). The
 * caller snaps it to a real equipment step and the PR-floor bounds it below, so it
 * can only ever LOWER a too-aggressive load toward the proven working weight.
 * @param {number} recKg
 * @returns {number}
 */
export function egoCappedKg(recKg) {
  return Number(recKg) * EGO_JUMP_RATIO;
}
