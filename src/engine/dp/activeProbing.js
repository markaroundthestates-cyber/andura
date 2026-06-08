// ══ BUILD #1/H — active probing when uncertain (F4 spec §H) ══════════════════
// The Kalman posterior (F3 #2) exposes `sigma` (the engine's uncertainty about the
// user's true working e1RM for a lift). F3 §2c named this "the structural hook for
// active probing — the variance makes it a one-line policy later." This is that
// policy: when the posterior is WIDE (new exercise / long layoff), the user is
// FRESH (high readiness), and the last set was NOT hard, OFFER a single deliberate
// test set — a slightly-heavier top set whose clean, high-information result feeds
// straight back into updatePosterior → sigma narrows → the engine can exploit next
// session instead of crawling under a wide posterior.
//
// PURE policy: shouldProbe() decides + probeSet() sizes the single heavier set,
// BOUNDED by the realistic ceiling (#3) and the ego-cap ratio (#6) so the probe can
// never push above a physical/proven-safe load. It is a DESCRIPTOR only — it does
// NOT change the main prescribed load (the consumer offers it as an explicit,
// opt-in "set de calibrare"), so flag-OFF AND flag-ON leave result.kg byte-identical
// (the probe is purely additive info). Gated to ONE set, never a whole session.
//
// Why FRESH-gated: a probe taken fatigued yields a noisy LOW observation that
// mis-narrows the posterior downward. Freshness is the precondition for a
// trustworthy probe.

import { READINESS_HIGH } from '../readiness.js';
import { EGO_JUMP_RATIO } from './egoCap.js';

// Daniel knob: the posterior sigma above which the engine is "uncertain enough" to
// spend a probe set. Tuned to the strengthKalman SIGMA_PRIOR (8): a fresh / long-
// layoff lift sits near the prior width; a well-observed lift narrows well below it.
export const SIGMA_PROBE_THRESHOLD = 6;
// How much heavier the probe set is vs the working load — a deliberate but bounded
// reach (5%), always re-bounded by the ceiling + ego-cap below.
export const PROBE_OVERLOAD = 1.05;

/**
 * Whether to offer an active probe this session. ALL must hold:
 *   • the posterior is WIDE (sigma > SIGMA_PROBE_THRESHOLD) — real uncertainty;
 *   • the user is FRESH (readinessScore >= READINESS_HIGH) — trustworthy probe;
 *   • the last set was NOT hard (lastRpe < 8.5) — not already near failure.
 * Any missing/unusable input → false (no probe → byte-identical).
 * @param {object} args
 * @param {number|null} args.sigma posterior uncertainty (null when no Kalman posterior)
 * @param {number|null} args.readinessScore today's computed readiness (null → no probe)
 * @param {number|null} args.lastRpe the 3-bucket rpe of the most recent set (null → treat as not-hard)
 * @returns {boolean}
 */
export function shouldProbe({ sigma, readinessScore, lastRpe }) {
  const s = Number(sigma);
  if (!Number.isFinite(s) || s <= SIGMA_PROBE_THRESHOLD) return false;
  const r = Number(readinessScore);
  if (!Number.isFinite(r) || r < READINESS_HIGH) return false;
  const rpe = Number(lastRpe);
  if (Number.isFinite(rpe) && rpe >= 8.5) return false; // last set was hard → no probe
  return true;
}

/**
 * Size the single probe set: a slightly-heavier load than the working prescription.
 * The reach is at least the proportional overload AND at least one real equipment
 * step (`nextStepKg`, so a coarse stack does not round the probe back onto the
 * working rung and silently no-op), then bounded so it can never exceed the ego-cap
 * reach over the working load NOR the realistic ceiling. Returns 0 when no usable
 * working load (→ no probe).
 * @param {number} workingKg the load the engine would otherwise prescribe
 * @param {number} ceilingKg the realistic ceiling kg at the rep target (0 = none)
 * @param {number} [nextStepKg] the next equipment rung above workingKg (0/absent → proportional only)
 * @returns {number} the probe load kg (0 = skip)
 */
export function probeSet(workingKg, ceilingKg, nextStepKg) {
  const w = Number(workingKg);
  if (!Number.isFinite(w) || w <= 0) return 0;
  let kg = w * PROBE_OVERLOAD;
  // At least one real equipment step heavier (clears coarse-stack rounding).
  const next = Number(nextStepKg);
  if (Number.isFinite(next) && next > w) kg = Math.max(kg, next);
  // Never reach past the ego-cap ratio over the working load (the same bound a
  // user-driven jump is capped at — a probe is a controlled, single-set reach).
  kg = Math.min(kg, w * EGO_JUMP_RATIO);
  // Never exceed the realistic ceiling (when one is available).
  const ceil = Number(ceilingKg);
  if (Number.isFinite(ceil) && ceil > 0) kg = Math.min(kg, ceil);
  return kg;
}
