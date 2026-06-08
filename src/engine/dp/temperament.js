// ══ BUILD #3/F — temperament: sandbagger vs grinder (F4 spec §F) ═════════════
// Nothing detected user temperament before. The substrate is lit: `logs` carry
// {w, reps, rpe, ts} and F3's RATING_TO_RIR (dp.js:560 usor:3/potrivit:1/greu:0)
// encodes the reserve assumption per set. The known failure: the sim's `timid`
// archetype rates everything `greu` even at light sub-max loads → the engine
// believes the user is always near failure (RIR 0) → never climbs → never
// converges (F3 §6.3 timid/oscillation case).
//
// This learns a per-user RIR BIAS from the mismatch between the rating-implied RIR
// and a STRUCTURAL estimate of true RIR (from reps-vs-target and load-vs-
// demonstrated). A SANDBAGGER rates greu while still hitting top reps at a sub-max
// load (real reserve left) → bias > 0 (lift their greu off RIR 0 so the climb does
// not stall). A GRINDER rates usor while reps collapse near the demonstrated max
// (grinds to failure, under-reports effort) → bias < 0 (discount their usor so the
// engine does not over-climb into injury). The bias is ADDITIVE on top of the
// global RATING_TO_RIR (a correction, not a replacement) and ADJUSTS the e1RM lever
// (#1) — hence the dp_e1rm_v1 dependency.
//
// Slow EMA convergence (calibration-factor philosophy: only a stable signal
// survives the coarse-rating noise) and CLAMPED to a sane band so one session can
// never flip the temperament and a mis-detection can never crater (the ceiling +
// PR-floor still bound the realized load).
//
// PURE inference (temperamentBiasFromLogs) + a SYNCED durable cache
// (dp-temperament, cal-factor pattern, name-keyed with a reserved 'global' key,
// quota-guarded). Consumer (dp._rirFromRpe) reads the bias only behind
// dp_temperament_v1 (default OFF) → byte-identical legacy.

import { DB } from '../../db.js';

export const TEMPERAMENT_KEY = 'dp-temperament';

// Reserved key for the user's GLOBAL temperament (across all lifts) — the primary
// signal for the `timid`/sandbagger fix, since a chronic-greu rater shows the trait
// everywhere. Per-exercise entries (EN-keyed) refine it where a lift has enough
// of its own history.
export const GLOBAL_KEY = 'global';

// ── Tuning — Daniel knob: PUSH-STYLE STRENGTH (how far a rating may be discounted).
// The clamp band on the learned RIR bias. A sandbagger's greu (RIR 0) may be lifted
// at most +BIAS_CLAMP toward "has reserve"; a grinder's usor (RIR 3) may be pulled
// at most -BIAS_CLAMP toward "near failure". Conservative (≤1.5 RIR) so the bias
// nudges, never overrides — the ceiling + PR-floor remain the hard guards.
export const BIAS_CLAMP = 1.5;
// Slow EMA weight on each new session's structural residual (mirrors the cal-factor
// 0.2 smoothing) — one session moves the bias by at most ~0.2·residual.
export const BIAS_ALPHA = 0.2;
// Minimum qualifying sets before the bias is trusted (a thin history stays neutral
// → byte-identical to the global RATING_TO_RIR until the trait is established).
export const MIN_SETS = 6;

// Rating → the reps-in-reserve the GLOBAL map assumes (mirror of dp.RATING_TO_RIR;
// kept local so this module is pure over its own inputs, no dp.js import cycle).
const ASSUMED_RIR = { usor: 3, potrivit: 1, greu: 0 };
// Map a stored 3-bucket rpe back to the rating label (the 6.5/7.5/8.5 horizon).
function _ratingFromRpe(rpe) {
  const r = Number(rpe);
  if (!Number.isFinite(r)) return 'potrivit';
  if (r <= 6.5) return 'usor';
  if (r >= 8.5) return 'greu';
  return 'potrivit';
}

/** @returns {Record<string, {bias:number, n:number}>} */
function _getAll() {
  const raw = /** @type {any} */ (DB.get(TEMPERAMENT_KEY));
  return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
}

const clampBias = (b) => Math.max(-BIAS_CLAMP, Math.min(BIAS_CLAMP, b));

/**
 * Structural estimate of the TRUE reps-in-reserve for one logged set, independent
 * of the user's rating. Two cheap signals, averaged:
 *   • reps headroom: reps ABOVE the rep target imply unused reserve (hit 12 when 8
 *     was asked → ~ the surplus is reserve); reps BELOW target imply near-failure.
 *   • load headroom: a load well BELOW the demonstrated working kg implies reserve;
 *     at/above it implies near-failure.
 * Returns a non-negative RIR estimate (reserve is never negative — a missed set is
 * 0 RIR, not "negative reserve"). null when inputs are unusable.
 * @param {{w:number, reps:number, repTarget:number, demoKg:number}} set
 * @returns {number|null}
 */
export function structuralRir({ w, reps, repTarget, demoKg }) {
  const R = typeof reps === 'string' ? parseInt(reps, 10) : Number(reps);
  if (!Number.isFinite(R) || R <= 0) return null;
  const rt = Number(repTarget);
  // reps headroom: surplus reps over target ≈ reserve (saturated, a set is rarely
  // > ~4 RIR by reps alone).
  const repReserve = Number.isFinite(rt) && rt > 0 ? Math.max(0, Math.min(4, R - rt)) : 0;
  // load headroom: fraction below the demonstrated working load → scaled to ~RIR.
  // demoKg is the user's heaviest-at-target; a set at 80% of it has clear reserve.
  const W = Number(w);
  const dem = Number(demoKg);
  let loadReserve = 0;
  if (Number.isFinite(W) && W > 0 && Number.isFinite(dem) && dem > 0) {
    const frac = W / dem;            // 1.0 = at demonstrated max, <1 = below it
    loadReserve = Math.max(0, Math.min(4, (1 - frac) * 12)); // 8% below ≈ ~1 RIR
  }
  return (repReserve + loadReserve) / 2;
}

/**
 * Fold a chronological list of per-set observations into a temperament RIR bias.
 * PURE — no DB. For each set, compares the structural true-RIR estimate to the RIR
 * the user's RATING assumed; the signed residual (structural − assumed) is the
 * temperament signal:
 *   • residual > 0  → the user has MORE reserve than the rating claims (sandbagger)
 *   • residual < 0  → the user has LESS reserve than the rating claims (grinder)
 * The residuals are EMA-folded into a single bias, clamped to ±BIAS_CLAMP. Returns
 * null (neutral) until MIN_SETS qualifying observations exist.
 *
 * @param {ReadonlyArray<{w:number, reps:number, rpe:number, repTarget:number, demoKg:number}>} obs
 *   chronological (oldest-first) per-set observations
 * @param {{bias:number, n:number}|null} [prior] continue an existing posterior
 * @returns {{bias:number, n:number}|null}
 */
export function temperamentBiasFromLogs(obs, prior = null) {
  let bias = prior && Number.isFinite(prior.bias) ? prior.bias : 0;
  let n = prior && Number.isFinite(prior.n) ? Number(prior.n) : 0;
  if (Array.isArray(obs)) {
    for (const o of obs) {
      const trueRir = structuralRir(o);
      if (trueRir == null) continue;
      const rating = _ratingFromRpe(o.rpe);
      const assumed = ASSUMED_RIR[rating];
      const residual = trueRir - assumed; // + = reserve under-reported, - = over-reported
      bias = clampBias(bias * (1 - BIAS_ALPHA) + residual * BIAS_ALPHA);
      n += 1;
    }
  }
  if (n < MIN_SETS) return null;
  return { bias: clampBias(bias), n };
}

/**
 * Persist a temperament bias under a key (an EN engineName or GLOBAL_KEY).
 * Additive + QUOTA-GUARDED (mirrors strengthKalman.savePosterior). Synced per-UID
 * (dp-temperament in SYNC_KEYS).
 * @param {string} key engineName or GLOBAL_KEY
 * @param {{bias:number, n:number}} state
 * @returns {{ok:boolean, error?:string}}
 */
export function saveTemperament(key, state) {
  if (typeof key !== 'string' || !key) return { ok: false, error: 'bad_key' };
  if (!state || !Number.isFinite(state.bias)) return { ok: false, error: 'invalid_state' };
  const all = _getAll();
  all[key] = { bias: clampBias(state.bias), n: Number(state.n) || 0 };
  const res = DB.set(TEMPERAMENT_KEY, all);
  return res && res.ok === false ? res : { ok: true };
}

/**
 * The trusted RIR bias for an exercise: the per-exercise entry when it has enough
 * of its own history, else the GLOBAL entry, else 0 (neutral → byte-identical to
 * the global RATING_TO_RIR). Reads the synced cache.
 * @param {string} [engineName] EN canonical name
 * @returns {number} clamped RIR bias, 0 when none trusted
 */
export function temperamentBias(engineName) {
  const all = _getAll();
  const perEx = engineName ? all[engineName] : null;
  if (perEx && Number.isFinite(perEx.bias) && Number(perEx.n) >= MIN_SETS) {
    return clampBias(perEx.bias);
  }
  const g = all[GLOBAL_KEY];
  if (g && Number.isFinite(g.bias) && Number(g.n) >= MIN_SETS) return clampBias(g.bias);
  return 0;
}
