// ══ BUILD #2 — per-exercise Kalman strength latent (F3 spec §2) ══════════════
// REUSES the existing pure 1-D Kalman from bayesianNutrition (kalmanUpdate1D +
// validateKalmanState) — NO filter rebuild (Daniel hard rule). Re-targets it to a
// STRENGTH latent: the user's true working e1RM per exercise (kg-scale).
//
//   latent mu     = posterior mean e1RM, sigma = uncertainty
//   observation   = each logged set's RIR-corrected e1RM (#1 substrate)
//   Q (process)   = TIME-SCALED: Q_base * sqrt(daysSinceLastObs). True e1RM drifts
//                   with training adaptation / detraining, so the predict-step
//                   variance GROWS with the gap since the last set — a long layoff
//                   widens the posterior (the engine becomes less certain).
//   R (measure)   = deliberately HIGH (the 3-bucket rating is coarse) so a single
//                   noisy set barely moves mu. A failed-AND-short `greu` set gets an
//                   even higher R (down-weighted, mirroring _demonstratedWorkingW's
//                   exclusion of that set).
//
// Persistence (#2): `dp-strength-posterior` = { [engineName]: {mu,sigma,lastObsTs,n} },
// keyed on the EN canonical engineName (the engine-read convention) and synced
// per-UID. The write is QUOTA-GUARDED (DB.set returns {ok:false} on quota — we
// never throw and never corrupt the key). validateKalmanState guards a corrupt
// hydrate. The posterior here is ALSO recomputable from logs (deterministic), so
// the persisted copy is an optimization/continuity layer, not a source of drift.
//
// Pure-ish: the fold (computePosteriorFromLogs) is a pure function of its inputs;
// only loadPosterior/savePosterior touch DB. The consumer (dp.js _demoWorkingW)
// reads mu only behind dp_strength_kalman_v1 (default OFF) -> byte-identical legacy.

import { DB } from '../../db.js';
import { kalmanUpdate1D, validateKalmanState } from '../bayesianNutrition/kalmanFilter.js';

export const STRENGTH_POSTERIOR_KEY = 'dp-strength-posterior';

// Tuning — conservative, slow-moving (mirrors the calibration-factor philosophy:
// only a stable signal survives the coarse-rating noise).
export const Q_BASE = 0.5;        // kg/sqrt(day) e1RM drift per unit time
export const R_BASE = 12;         // measurement noise on a normal set's e1RM (HIGH — coarse rating)
export const R_FAILED = 36;       // a failed-AND-short greu set: heavily down-weighted
export const SIGMA_PRIOR = 8;     // moderate prior — seed near the first set, smooth (not explore)
const MS_DAY = 86400000;

/** @returns {Record<string, {mu:number, sigma:number, lastObsTs:number, n:number}>} */
function _getAll() {
  const raw = /** @type {any} */ (DB.get(STRENGTH_POSTERIOR_KEY));
  return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
}

/**
 * Load a validated posterior for one exercise, or null when absent/corrupt.
 * @param {string} engineName EN canonical name
 * @returns {{mu:number, sigma:number, lastObsTs:number, n:number}|null}
 */
export function loadPosterior(engineName) {
  const s = _getAll()[engineName];
  if (!s) return null;
  return validateKalmanState(s).valid ? s : null;
}

/**
 * Persist a posterior for one exercise. QUOTA-GUARDED: DB.set returns
 * {ok:false,error:'quota_exceeded'} on quota — we surface that and never throw,
 * so a full store degrades to "no persisted posterior" (recompute-from-logs path)
 * rather than corrupting the key.
 * @param {string} engineName EN canonical name
 * @param {{mu:number, sigma:number, lastObsTs:number, n:number}} state
 * @returns {{ok:boolean, error?:string}}
 */
export function savePosterior(engineName, state) {
  if (typeof engineName !== 'string' || !engineName) return { ok: false, error: 'bad_key' };
  if (!validateKalmanState(state).valid) return { ok: false, error: 'invalid_state' };
  const all = _getAll();
  all[engineName] = {
    mu: state.mu, sigma: state.sigma, lastObsTs: state.lastObsTs, n: state.n,
  };
  const res = DB.set(STRENGTH_POSTERIOR_KEY, all);
  return res && res.ok === false ? res : { ok: true };
}

/**
 * Time-scaled process noise: variance grows with the gap since the last set
 * (random-walk variance ∝ time). Same-session / no-gap -> Q_BASE floor.
 * @param {number} daysSinceLast
 * @returns {number}
 */
export function processNoiseForGap(daysSinceLast) {
  const d = Number.isFinite(daysSinceLast) && daysSinceLast > 0 ? daysSinceLast : 0;
  return Q_BASE * Math.sqrt(1 + d);
}

/**
 * Fold a chronological list of per-set e1RM observations through the reused 1-D
 * Kalman into a strength posterior. PURE — no DB. The first observation seeds the
 * latent at its own value with the wide SIGMA_PRIOR (an honest "we just met this
 * lift" uncertainty); each later set updates with a time-scaled Q and a
 * rating-aware R. Returns null when there are no usable observations.
 *
 * @param {ReadonlyArray<{e1rm:number, ts:number, failedShort?:boolean}>} obs
 *   chronological (oldest-first) per-set e1RM observations
 * @returns {{mu:number, sigma:number, lastObsTs:number, n:number}|null}
 */
export function computePosteriorFromLogs(obs) {
  return updatePosterior(null, obs);
}

/**
 * INCREMENTAL fold: continue an existing posterior (or seed a fresh one when
 * `prior` is null) with NEW chronological e1RM observations. This is the durable
 * path — the persisted posterior is updated one set at a time, never re-derived
 * from a sliding window (which would saw-tooth as the window slides). PURE — no DB.
 *
 * @param {{mu:number, sigma:number, lastObsTs:number, n:number}|null} prior
 * @param {ReadonlyArray<{e1rm:number, ts:number, failedShort?:boolean}>} obs
 * @returns {{mu:number, sigma:number, lastObsTs:number, n:number}|null}
 */
export function updatePosterior(prior, obs) {
  let state = prior && Number.isFinite(prior.mu) && prior.mu > 0
    ? { mu: prior.mu, sigma: Number.isFinite(prior.sigma) && prior.sigma > 0 ? prior.sigma : SIGMA_PRIOR }
    : null;
  let lastTs = prior && Number.isFinite(prior.lastObsTs) ? Number(prior.lastObsTs) : null;
  let n = prior && Number.isFinite(prior.n) ? Number(prior.n) : 0;
  if (Array.isArray(obs)) {
    for (const o of obs) {
      const e = Number(o.e1rm);
      if (!Number.isFinite(e) || e <= 0) continue;
      const ts = Number(o.ts) || 0;
      if (state == null) {
        state = { mu: e, sigma: SIGMA_PRIOR };
      } else {
        const days = lastTs != null && ts > lastTs ? (ts - lastTs) / MS_DAY : 0;
        const Q = processNoiseForGap(days);
        const R = o.failedShort ? R_FAILED : R_BASE;
        state = kalmanUpdate1D({ previousState: state, observation: e, processNoise: Q, measurementNoise: R });
      }
      lastTs = ts;
      n += 1;
    }
  }
  if (state == null) return null;
  return { mu: state.mu, sigma: state.sigma, lastObsTs: lastTs ?? 0, n };
}

// ══ BUILD F6c #31 — TREND-vs-NOISE decomposition (F6c spec §1) ════════════════
// The Kalman posterior already separates trend from noise IMPLICITLY: `mu` is the
// smoothed working e1RM and the HIGH R (R_BASE=12 / R_FAILED=36) means one bad set
// barely moves mu. What is MISSING is the trend made EXPLICIT as a direction. The
// legacy isStagnant (dp.js:1130) only checks raw-kg equality over the last 3 logs —
// it cannot tell a real downtrend from a single bad day and is rep-scheme-blind.
//
// trendDirection folds the recent per-set e1RM observations through the SAME
// posterior (REUSE — no new filter) and returns a direction that is only `DOWN`/`UP`
// when the move is STATISTICALLY larger than the posterior's own noise band
// (|slope| > Z · sigma_now). A one-bad-day-then-recover trace nets to ~0 slope →
// FLAT (the noise is rejected — the whole point). PURE — no DB.
//
// Z is the significance multiple on the posterior sigma: a move must clear Z·sigma
// to count as a confident trend. DESIGN PROPOSAL (spec §9 — UNVERIFIED) — a Daniel/
// sim sanity-check before dp_trend_signal_v1 flips ON; conservative default 1.0
// (one posterior standard deviation), so a noisy lift stays FLAT.
export const TREND_Z = 1.0;

/**
 * Noise-aware trend direction over the recent per-set e1RM observations. Folds them
 * through the existing posterior (continuing `prior` when supplied, else seeding a
 * fresh one) and compares the net mu move to the posterior's own uncertainty band.
 *
 *   slope      = mu_now − mu_before (e1RM kg over the folded window)
 *   confident  = |slope| > TREND_Z · sigma_now (the move clears the noise band)
 *   dir        = confident && slope>0 → 'UP'; confident && slope<0 → 'DOWN'; else 'FLAT'
 *
 * Returns FLAT/unconfident when there are < 2 usable observations or no posterior
 * can be formed (cold start) — so the legacy raw path is always a safe fallback.
 *
 * @param {{mu:number, sigma:number, lastObsTs:number, n:number}|null} prior
 * @param {ReadonlyArray<{e1rm:number, ts:number, failedShort?:boolean}>} recentObs
 *   chronological (oldest-first) per-set e1RM observations
 * @returns {{ dir:'UP'|'FLAT'|'DOWN', slope:number, confident:boolean }}
 */
export function trendDirection(prior, recentObs) {
  const FLAT = { dir: /** @type {'FLAT'} */ ('FLAT'), slope: 0, confident: false };
  const obs = Array.isArray(recentObs)
    ? recentObs.filter((o) => o && Number.isFinite(Number(o.e1rm)) && Number(o.e1rm) > 0)
    : [];
  // The mu the window STARTS from: the prior's mu if continuing one, else the first
  // observation's value (the seed the fold itself uses). Need ≥2 reference points.
  const startMu = prior && Number.isFinite(prior.mu) && prior.mu > 0
    ? prior.mu
    : (obs.length > 0 ? Number(obs[0].e1rm) : NaN);
  if (!Number.isFinite(startMu) || obs.length < 2) return FLAT;
  const post = updatePosterior(prior, obs);
  if (!post || !Number.isFinite(post.mu) || !Number.isFinite(post.sigma)) return FLAT;
  const slope = post.mu - startMu;
  const band = TREND_Z * post.sigma;
  const confident = Math.abs(slope) > band;
  const dir = confident ? (slope > 0 ? 'UP' : 'DOWN') : 'FLAT';
  return { dir, slope, confident };
}
