// ══ BUILD #75 — load-transition-window + reason-derivation (dp_load_transition_v1)
// _ENGINE_progression_rir_rest_count_policy_2026-06-08.md §1 `load_transition_window`.
//
// A FORCED load change (≥10% up or down) breaks how the engine should read the
// next exposures' RAW reps:
//   UP   (e.g. 8kg×20 → 10kg×12, +25%): the rep DROP is the COST of the load step,
//        NOT "got weaker" — e1RM(8×20) ≈ e1RM(10×12) is continuity. Reading the
//        drop as distress would fire a FALSE ease-back/regression (DIAG #31 + the
//        DP rating-read). → SUPPRESS the regression/ease-back for the window.
//   DOWN (e.g. 10kg → 8kg, −20%): the rep SPIKE (3×12 → 3×20+) is NOT "too easy →
//        big jump up" — the stimulus changed, the user is not stronger. Reading it
//        as headroom would OVERSHOOT on the rebound. → CAP the upward correction to
//        the minimum increment until 2 clean exposures.
//
// The reason for a DOWN move governs the response (pain vs deload vs equipment vs
// manual vs fatigue …). Reasons are DERIVED from signals Andura already has, by a
// fixed PRIORITY, defaulting CONSERVATIVE when unknown (a weight that dropped with
// no flagged reason is assumed fatigue/pain → do NOT auto-climb). The PAIN reason
// window is OPEN-ENDED: it stays active until the pain memory clears (2 consecutive
// pain-free exposures), reopening on a re-report — never a mechanical N-session
// expiry while pain is still flagged.
//
// PURE + DETERMINISTIC: a single function of the exercise's own log history + the
// already-derived reason signals (passed in by the caller — this module never reads
// the DB or the clock). Returns a descriptor the dp.js recommend path consumes
// behind dp_load_transition_v1 (default OFF → never invoked → byte-identical).

// ── Daniel-tunable (spec §1 — DESIGN PROPOSALS, sim sweep + sanity before flip) ──
// Magnitude that opens a window. Spec: |load_change_pct| ≥ 0.10.
export const TRANSITION_THRESHOLD = 0.10;
// UP-jump + the generic (unknown/conservative/equipment) window length in exposures.
export const WINDOW_EXPOSURES = 3;
// DOWN move: how many CLEAN (rated non-hard, reps-held) exposures clear the rebound
// cap so normal upward correction can resume.
export const CLEAN_EXPOSURES_TO_CLEAR = 2;
// Pain window: how many consecutive PAIN-FREE exposures clear an open-ended pain
// window (spec §1 — "2 consecutive pain-free exposures; REOPENS if re-reported").
export const PAIN_FREE_EXPOSURES_TO_CLEAR = 2;
// e1RM-continuity tolerance for an UP-jump: if the post-jump e1RM is within this
// fraction of (or above) the pre-jump e1RM, the rep drop is CONTINUITY, not
// regression → suppress the ease-back. A drop further than this = genuinely too
// heavy (form/capacity), the ease-back is allowed to fire as normal.
export const E1RM_CONTINUITY_TOLERANCE = 0.07;

// Reason tokens (spec §1 `load_decrease_reason`). Priority order top→bottom.
/** @typedef {'pain'|'deload'|'equipment'|'manual'|'failed_reps'|'form'|'fatigue'|'unknown'} TransitionReason */

// Priority-ordered reason derivation (spec §1 reason-derivation priority):
//   1 pain · 2 deload · 3 equipment · 4 manual · 5 failed_reps/too-hard/form ·
//   6 fatigue/recovery · 7 unknown → conservative.
// `failed_reps` and `form` share priority 5; `failed_reps` is the harder signal so
// it wins when both are present.
const REASON_PRIORITY = {
  pain: 1, deload: 2, equipment: 3, manual: 4,
  failed_reps: 5, form: 6, fatigue: 7, unknown: 8,
};

/**
 * Derive the load-DECREASE reason from the signals Andura already has, by fixed
 * priority. Defaults CONSERVATIVE (`unknown`) when nothing is flagged — a weight
 * that dropped with no reason is assumed fatigue/pain, so the caller does NOT
 * auto-climb. PURE: every signal is passed in (the caller reads the DB keys).
 *
 * @param {object} signals
 * @param {boolean} [signals.painFlag]       active pain on this exercise (#64 / exercisePain)
 * @param {boolean} [signals.deloadActive]   a deload/return-deload state is active
 * @param {boolean} [signals.equipmentSwap]  the load dropped because equipment changed
 * @param {string}  [signals.manualReason]   an explicit user pick ('durere'/'oboseala'/…)
 * @param {boolean} [signals.failedReps]     last set was hard AND reps fell below the floor
 * @param {boolean} [signals.formBreakdown]  form broke down on the last set
 * @param {boolean} [signals.fatigue]        recovery/fatigue signal present
 * @returns {{ reason: TransitionReason, priority: number, asked: boolean }}
 */
export function deriveDecreaseReason(signals = {}) {
  const s = signals || {};
  // Manual user pick maps onto a canonical reason when it disambiguates.
  const manual = typeof s.manualReason === 'string' ? s.manualReason.toLowerCase() : null;
  const manualMapped =
    manual === 'durere' ? 'pain'
    : manual === 'oboseala' || manual === 'fatigue' ? 'fatigue'
    : manual === 'aparat' || manual === 'equipment' ? 'equipment'
    : manual === 'asa-am-vrut' || manual === 'manual' ? 'manual'
    : manual ? 'manual' : null;

  let reason = /** @type {TransitionReason} */ ('unknown');
  if (s.painFlag) reason = 'pain';
  else if (s.deloadActive) reason = 'deload';
  else if (s.equipmentSwap) reason = 'equipment';
  else if (manualMapped) reason = /** @type {TransitionReason} */ (manualMapped);
  else if (s.failedReps) reason = 'failed_reps';
  else if (s.formBreakdown) reason = 'form';
  else if (s.fatigue) reason = 'fatigue';
  // else → unknown (conservative default)

  return {
    reason,
    priority: REASON_PRIORITY[reason] ?? REASON_PRIORITY.unknown,
    // The caller asks the user ONLY when the decrease is large AND the reason is
    // unknown AND the next prescription depends on it (spec §1). This flag advises
    // that condition is met — the caller owns the one-tap prompt.
    asked: reason === 'unknown',
  };
}

/**
 * Window duration (in exposures) for a reason. Pain is OPEN-ENDED (Infinity) — it
 * never expires mechanically; it clears only when pain-free exposures accumulate.
 * @param {TransitionReason} reason
 * @returns {number} exposures, or Infinity for the open-ended pain window
 */
export function windowDurationFor(reason) {
  switch (reason) {
    case 'pain': return Infinity;          // OPEN-ENDED — clears on pain-free run
    case 'deload': return WINDOW_EXPOSURES; // ~ duration of the deload (caller bounds)
    case 'equipment': return WINDOW_EXPOSURES; // until equipment returns (caller bounds)
    case 'fatigue': return CLEAN_EXPOSURES_TO_CLEAR; // until recovery / 1-2 good sessions
    case 'failed_reps': return CLEAN_EXPOSURES_TO_CLEAR; // 1-2 recalibration sessions
    case 'form': return CLEAN_EXPOSURES_TO_CLEAR;
    case 'manual': return CLEAN_EXPOSURES_TO_CLEAR;
    default: return WINDOW_EXPOSURES;       // unknown → conservative 2-3
  }
}

/**
 * Count exposures (newest-first logs) at-or-near the current load since the load
 * CHANGED — i.e. how deep into the transition window we are. We count the leading
 * run of logs whose weight is within ~3% of the current weight (the post-change
 * load). PURE.
 * @param {Array<{w?:number}>} logs newest-first
 * @param {number} currentW the post-change load (logs[0].w)
 * @returns {number}
 */
function exposuresSinceChange(logs, currentW) {
  if (!Array.isArray(logs) || !(currentW > 0)) return 0;
  let n = 0;
  for (const l of logs) {
    const w = Number(l && l.w);
    if (!Number.isFinite(w) || w <= 0) break;
    if (Math.abs(w - currentW) / currentW <= 0.03) n++;
    else break;
  }
  return n;
}

/**
 * Whether the pain window has cleared: PAIN_FREE_EXPOSURES_TO_CLEAR consecutive
 * most-recent exposures with NO pain flag AND the pain memory is no longer active.
 * Reopens (returns false) the moment pain is re-flagged. PURE.
 * @param {boolean} painStillFlagged the live pain memory (#64) — true = still painful
 * @param {Array<{pain?:boolean}>} logs newest-first; each may carry a per-exposure pain mark
 * @returns {boolean} true = cleared (window may close)
 */
export function painWindowCleared(painStillFlagged, logs) {
  if (painStillFlagged) return false; // re-flagged / still active → stays open
  if (!Array.isArray(logs)) return true;
  let painFree = 0;
  for (const l of logs) {
    if (l && l.pain === true) return false; // a recent painful exposure → not cleared
    painFree++;
    if (painFree >= PAIN_FREE_EXPOSURES_TO_CLEAR) return true;
  }
  // Fewer than the required pain-free exposures logged yet → not cleared.
  return painFree >= PAIN_FREE_EXPOSURES_TO_CLEAR;
}

/**
 * MAIN: derive the load-transition descriptor for the next prescription.
 *
 * Detects a forced load change between the two most-recent DISTINCT exposure loads
 * in the history, classifies the direction, derives the reason (DOWN only), and
 * returns how the recommend path must read the upcoming reps:
 *   - transition_active: is the window open this exposure?
 *   - direction: 'up' | 'down' | null
 *   - reason: the derived reason (DOWN), 'up_jump' (UP), or null
 *   - suppress_regression: UP-jump with e1RM continuity → suppress ease-back/regression
 *   - cap_rebound: DOWN move → cap the upward correction to the min increment
 *   - window / exposuresInWindow: progress through the window
 *
 * PURE — `logs` (newest-first) + the pre-derived `reasonSignals` + an `e1RMForSet`
 * closure are passed in; no DB, no clock. Returns an INERT descriptor (everything
 * false/null) when no qualifying change is present → the caller's behavior is
 * unchanged for the common path.
 *
 * @param {object} args
 * @param {Array<{w?:number, reps?:number|string, rpe?:number, pain?:boolean}>} args.logs newest-first
 * @param {(w:number, reps:number, rpe:number)=>(number|null)} [args.e1RMForSet] e1RM closure (continuity check)
 * @param {object} [args.reasonSignals] signals for deriveDecreaseReason (DOWN move)
 * @param {boolean} [args.painStillFlagged] live pain memory (#64) for the open-ended window
 * @returns {{
 *   transition_active: boolean,
 *   direction: ('up'|'down'|null),
 *   reason: (TransitionReason|'up_jump'|null),
 *   load_change_pct: number,
 *   suppress_regression: boolean,
 *   cap_rebound: boolean,
 *   window: number,
 *   exposuresInWindow: number,
 *   asked: boolean,
 * }}
 */
export function deriveLoadTransition(args = {}) {
  const inert = {
    transition_active: false, direction: null, reason: null,
    load_change_pct: 0, suppress_regression: false, cap_rebound: false,
    window: 0, exposuresInWindow: 0, asked: false,
  };
  const logs = Array.isArray(args.logs) ? args.logs : [];
  if (logs.length < 2) return inert;

  const currentW = Number(logs[0] && logs[0].w);
  if (!Number.isFinite(currentW) || currentW <= 0) return inert;

  // Find the most-recent log whose weight differs materially from the current —
  // the PRE-change load. (Leading near-equal logs are the post-change exposures.)
  let prevW = null;
  let prevIdx = -1;
  for (let i = 1; i < logs.length; i++) {
    const w = Number(logs[i] && logs[i].w);
    if (!Number.isFinite(w) || w <= 0) continue;
    if (Math.abs(w - currentW) / currentW > 0.03) { prevW = w; prevIdx = i; break; }
  }
  if (prevW == null) return inert; // no distinct prior load → no transition

  const load_change_pct = (currentW - prevW) / prevW;
  if (Math.abs(load_change_pct) < TRANSITION_THRESHOLD) return inert;

  const direction = load_change_pct > 0 ? 'up' : 'down';
  const exposuresInWindow = exposuresSinceChange(logs, currentW);

  if (direction === 'up') {
    // UP-jump: judge via e1RM continuity, NOT raw reps. e1RM(pre) vs e1RM(post-jump
    // first exposure). Within tolerance (or higher) = continuity → suppress the
    // false ease-back/regression. A drop FURTHER than tolerance = genuinely too
    // heavy → let the normal ease-back fire (do NOT suppress).
    const window = WINDOW_EXPOSURES;
    const active = exposuresInWindow < window;
    let suppress = active; // default within the window: protect the post-jump drop
    const f = args.e1RMForSet;
    if (typeof f === 'function') {
      const post = logs[0];
      const pre = logs[prevIdx];
      const ePost = f(Number(post.w), Number(post.reps), Number(post.rpe) || 7);
      const ePre = f(Number(pre.w), Number(pre.reps), Number(pre.rpe) || 7);
      if (ePost != null && ePre != null && ePre > 0) {
        // continuity-or-better: post e1RM ≥ pre·(1 - tolerance)
        const continuity = ePost >= ePre * (1 - E1RM_CONTINUITY_TOLERANCE);
        suppress = active && continuity;
      }
    }
    return {
      transition_active: active,
      direction: 'up',
      reason: 'up_jump',
      load_change_pct,
      suppress_regression: suppress,
      cap_rebound: false,
      window,
      exposuresInWindow,
      asked: false,
    };
  }

  // DOWN move: derive the reason, then bound the window. Cap the upward rebound to
  // the min increment until CLEAN_EXPOSURES_TO_CLEAR clean exposures (pain = open-
  // ended until the pain memory clears).
  const { reason, asked } = deriveDecreaseReason(args.reasonSignals);
  let window = windowDurationFor(reason);
  let active;
  if (reason === 'pain') {
    // OPEN-ENDED: active until the pain window clears (pain-free run + memory clear).
    active = !painWindowCleared(!!args.painStillFlagged, logs);
    window = Infinity;
  } else {
    active = exposuresInWindow < window;
  }
  return {
    transition_active: active,
    direction: 'down',
    reason,
    load_change_pct,
    suppress_regression: false,
    cap_rebound: active, // hold upward correction to the min increment while open
    window,
    exposuresInWindow,
    asked,
  };
}
