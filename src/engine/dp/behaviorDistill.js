// ══ #59 D107 — behavioral-log distillation → per-user engine tuning ══════════
// The D107 behavior log is COLLECTED (durable per-UID IDB `behavior_tier1`,
// src/react/lib/debugLog.ts) but DARK — NO engine reads it (utilization audit:
// collection-only). This closes the loop: the DETERMINISTIC, on-device (NO LLM)
// distillation that turns the log into a per-user signal the engine consumes. It
// is the deterministic, pure-stats version of #40 (Claude-as-oracle, parked on
// cost): same goal, zero runtime model.
//
// THE FIRST DISTILLED SIGNAL — per-user rating semantic (#36). The behavior log
// uniquely carries TWO rows the durable `logs` do not pair: the `rec` the engine
// SHOWED (prescribedKg) and the `log` the user then COMMITTED (enteredKg, reps,
// rating). So we can ask a question `dp.logs` alone cannot: when THIS user rates
// `greu`, did they actually enter MORE than prescribed and still hit the top of
// the rep range? That is a person whose "greu" still has reserve (the engine
// should keep climbing); the inverse — rating `usor` while UNDER-loading or
// missing reps — is a person whose "usor" is over-claimed. We distill that
// rating↔behavior mismatch into a single RIR OFFSET that nudges RATING_TO_RIR
// toward what THIS user's ratings actually mean.
//
// DEBUG-NOISE vs ENGINE-SIGNAL (D107 §3, the hard separation): ONLY the semantic
// events (`rec`, `log`) feed the distillation. The founder's universal `tap`
// capture (FLAG_KEY debug verbosity) is NOISE and is EXCLUDED — see SEMANTIC_KINDS.
//
// DETERMINISM: PURE distillation (no Date.now / Math.random in the math). The only
// time used is the event `t` already stamped on each row (a time-window from the
// event ts is fine + deterministic given the same log). distillBehavior(events)
// → the SAME tuning for the SAME input, always.
//
// DISCIPLINE (mirror the calibration-factor + temperament design 1:1): a SLOW EMA
// so coarse-rating noise barely moves the offset, a CLAMP band so one weird
// session can never flip it, and a MIN-events floor so a sparse log stays NEUTRAL
// (no tuning until the trait is established → byte-identical to the global map).
//
// CONSUMER: dp._rirFromRpe reads behaviorRirOffset() ADDITIVELY on top of the base
// RATING_TO_RIR (and on top of any temperament bias), behind dp_behavior_distill_v1
// (default OFF). Flag-OFF → the distillation never runs AND the consumer reads no
// offset → byte-identical legacy. The offset is recomputable from the log; the
// persisted `dp-behavior-tuning` copy is a continuity optimization (synced per-UID).

import { DB } from '../../db.js';

export const BEHAVIOR_TUNING_KEY = 'dp-behavior-tuning';

// Only these durable-log kinds carry engine signal. `tap` (founder debug verbosity)
// is NOISE and never reaches the distillation. `adjust`/`swap`/`skip` are real
// semantic events but are not part of THIS first signal (the rating↔behavior
// mismatch needs the rec→log pair) — listed-but-unused keeps the boundary explicit.
export const SEMANTIC_KINDS = Object.freeze(['rec', 'log']);

// ── Tuning — mirrors the temperament/cal-factor discipline ──────────────────
// The clamp band on the learned RIR offset (in reps-in-reserve). Conservative so
// it NUDGES the rating semantic, never overrides it — the ceiling + PR-floor + the
// per-rating clamp in _rirFromRpe remain the hard guards.
export const OFFSET_CLAMP = 1.5;
// Slow EMA weight on each new (rec,log) pair's residual (mirrors temperament's 0.2
// + the cal-factor smoothing) — one pair moves the offset by at most ~0.2·residual.
export const OFFSET_ALPHA = 0.2;
// Minimum qualifying (rec→log) pairs before the offset is trusted. Below this the
// distillation returns null (neutral) → byte-identical to the global RATING_TO_RIR.
export const MIN_PAIRS = 6;

// The reps-in-reserve the GLOBAL map assumes per rating (mirror of dp.RATING_TO_RIR;
// kept local so this module is pure over its own inputs — no dp.js import cycle).
const ASSUMED_RIR = { usor: 3, potrivit: 1, greu: 0 };

const clampOffset = (o) => Math.max(-OFFSET_CLAMP, Math.min(OFFSET_CLAMP, o));

/**
 * Behavioral estimate of the TRUE reps-in-reserve a (rec→log) pair revealed,
 * independent of the rating the user gave. Two cheap signals from the log row, the
 * SAME shape temperament uses but sourced from the BEHAVIOR log (rec shown vs log
 * committed), averaged:
 *   • load headroom: the user ENTERED more than was PRESCRIBED ⇒ they had reserve
 *     the rec under-estimated; entered less ⇒ near their limit. (prescribedKg is
 *     UNIQUE to the behavior log — `dp.logs` never store the rec that was shown.)
 *   • reps headroom: reps ABOVE the target imply unused reserve; reps BELOW imply
 *     near-failure.
 * Returns a non-negative RIR estimate (reserve is never negative). null when the
 * inputs are unusable.
 * @param {{prescribedKg?:number, enteredKg?:number, reps?:number|string, repTarget?:number}} p
 * @returns {number|null}
 */
export function behavioralRir({ prescribedKg, enteredKg, reps, repTarget }) {
  const R = typeof reps === 'string' ? parseInt(reps, 10) : Number(reps);
  if (!Number.isFinite(R) || R <= 0) return null;
  // reps headroom: surplus reps over target ≈ reserve (saturated at ~4 RIR).
  const rt = Number(repTarget);
  const repReserve = Number.isFinite(rt) && rt > 0 ? Math.max(0, Math.min(4, R - rt)) : 0;
  // load headroom: how far ABOVE the prescribed load the user actually went. A user
  // who entered 10% over the rec demonstrated reserve the rec missed; at/below the
  // rec → no extra reserve from the load axis (0).
  const presc = Number(prescribedKg);
  const entered = Number(enteredKg);
  let loadReserve = 0;
  if (Number.isFinite(presc) && presc > 0 && Number.isFinite(entered) && entered > 0) {
    const surplus = (entered - presc) / presc; // +0.10 = 10% over the rec
    loadReserve = Math.max(0, Math.min(4, surplus * 12)); // 8% over ≈ ~1 RIR
  }
  return (repReserve + loadReserve) / 2;
}

/**
 * Fold a chronological list of distilled (rec→log) pairs into a per-user rating RIR
 * offset. PURE — no DB, no clock (the caller resolves each pair from the log). For
 * each pair, compares the BEHAVIORAL true-RIR estimate to the RIR the user's RATING
 * assumed; the signed residual (behavioral − assumed) is the rating-semantic signal:
 *   • residual > 0 → the user has MORE reserve than the rating claims (their rating
 *     UNDER-reports effort headroom → lift the RIR so the climb resumes)
 *   • residual < 0 → LESS reserve than claimed (their rating OVER-reports → discount)
 * EMA-folded into a single offset, clamped to ±OFFSET_CLAMP. Returns null (neutral)
 * until MIN_PAIRS qualifying pairs exist.
 *
 * @param {ReadonlyArray<{rating?:string, prescribedKg?:number, enteredKg?:number, reps?:number|string, repTarget?:number}>} pairs
 *   chronological (oldest-first) distilled pairs
 * @param {{offset:number, n:number}|null} [prior] continue an existing posterior
 * @returns {{offset:number, n:number}|null}
 */
export function distillRatingOffset(pairs, prior = null) {
  let offset = prior && Number.isFinite(prior.offset) ? prior.offset : 0;
  let n = prior && Number.isFinite(prior.n) ? Number(prior.n) : 0;
  if (Array.isArray(pairs)) {
    for (const p of pairs) {
      const assumed = ASSUMED_RIR[p && p.rating];
      if (!Number.isFinite(assumed)) continue; // not a 3-bucket rating → skip
      const trueRir = behavioralRir(p);
      if (trueRir == null) continue;
      const residual = trueRir - assumed; // + = under-reported, - = over-reported
      offset = clampOffset(offset * (1 - OFFSET_ALPHA) + residual * OFFSET_ALPHA);
      n += 1;
    }
  }
  if (n < MIN_PAIRS) return null;
  return { offset: clampOffset(offset), n };
}

/**
 * Pair the durable behavior-log rows into the (rec→log) observations the distiller
 * folds. PURE over its input. DEBUG-NOISE SEPARATION: only `rec` + `log` rows
 * (SEMANTIC_KINDS) are considered — `tap` (founder debug) never enters.
 *
 * The `log` row is SELF-CONTAINED — the live screen stamps it with the active
 * prescription (Workout.tsx:561 payload: prescribedKg, prescribedReps, enteredKg,
 * rating, reps). So `prescribedKg`/`repTarget` come from the log row itself; the
 * preceding `rec` (which stores the load as `recKg`) is a FALLBACK when an older
 * `log` row lacks the self-contained prescription. A log pairs with the most recent
 * preceding `rec` for the SAME exercise within the SAME session. Rows are read
 * oldest→newest (debugLog.snapshot already sorts by `t`).
 *
 * @param {ReadonlyArray<import('../../react/lib/debugLog').BehaviorEvent>} events
 * @returns {Array<{rating:string, prescribedKg?:number, enteredKg:number, reps:number|string, repTarget?:number, exEngine?:string}>}
 */
export function pairRecToLog(events) {
  /** @type {Array<{rating:string, prescribedKg?:number, enteredKg:number, reps:number|string, repTarget?:number, exEngine?:string}>} */
  const out = [];
  if (!Array.isArray(events)) return out;
  // last `rec` seen, keyed by session+exEngine — the FALLBACK prescription for an
  // older log row that lacks its own. {kg, reps} from the rec the engine showed.
  /** @type {Map<string, {kg?:number, reps?:number}>} */
  const lastRec = new Map();
  for (const e of events) {
    if (!e || !SEMANTIC_KINDS.includes(e.kind)) continue; // tap/etc. = noise → out
    const key = `${e.session ?? ''}|${e.exEngine ?? ''}`;
    const pl = (e.payload || {});
    if (e.kind === 'rec') {
      // The `rec` event stores the shown load as `recKg` / reps as `recReps`.
      const kg = Number(pl.recKg ?? pl.prescribedKg);
      const reps = Number(pl.recReps ?? pl.prescribedReps);
      lastRec.set(key, {
        ...(Number.isFinite(kg) && kg > 0 ? { kg } : {}),
        ...(Number.isFinite(reps) && reps > 0 ? { reps } : {}),
      });
      continue;
    }
    // kind === 'log'
    const rating = typeof pl.rating === 'string' ? pl.rating : undefined;
    const entered = Number(pl.enteredKg);
    const reps = pl.reps;
    if (!rating || !Number.isFinite(entered) || entered <= 0) continue;
    const repsN = typeof reps === 'string' ? parseInt(reps, 10) : Number(reps);
    if (!Number.isFinite(repsN) || repsN <= 0) continue;
    const rec = lastRec.get(key) || {};
    // prescribedKg: prefer the self-contained log field, else the paired rec.
    const presc = Number(pl.prescribedKg);
    const prescKg = Number.isFinite(presc) && presc > 0 ? presc : rec.kg;
    // repTarget: prefer the self-contained prescribedReps/recReps, else the paired rec.
    const prescReps = Number(pl.prescribedReps ?? pl.recReps);
    const repTarget = Number.isFinite(prescReps) && prescReps > 0 ? prescReps : rec.reps;
    const pair = {
      rating,
      enteredKg: entered,
      reps,
      ...(Number.isFinite(Number(prescKg)) && Number(prescKg) > 0 ? { prescribedKg: Number(prescKg) } : {}),
      ...(Number.isFinite(Number(repTarget)) && Number(repTarget) > 0 ? { repTarget: Number(repTarget) } : {}),
      ...(typeof e.exEngine === 'string' && e.exEngine ? { exEngine: e.exEngine } : {}),
    };
    out.push(pair);
  }
  return out;
}

/**
 * The full pure distillation: behavior-log rows → the per-user tuning artifact the
 * engine consumes. PURE (no DB, no clock — the time-window is the rows' own `t`).
 * Returns null when the log is too sparse to trust (the consumer then reads no
 * offset → byte-identical). Extensible: today ONE signal (ratingRirOffset); a
 * second clean signal would add a sibling field here without touching the consumer
 * contract for the first.
 *
 * @param {ReadonlyArray<import('../../react/lib/debugLog').BehaviorEvent>} events
 * @param {{ratingRirOffset?:{offset:number, n:number}}|null} [prior] continue the EMA
 * @returns {{ratingRirOffset:{offset:number, n:number}}|null}
 */
export function distillBehavior(events, prior = null) {
  const pairs = pairRecToLog(events);
  const ratingRirOffset = distillRatingOffset(pairs, prior && prior.ratingRirOffset);
  if (!ratingRirOffset) return null;
  return { ratingRirOffset };
}

// ── Persistence — fixed-key object (NOT name-keyed): the rating-semantic offset is
//    a GLOBAL per-user trait, like dp-pivot-prompts. So `dp-behavior-tuning` stays
//    OUT of NAME_KEYED_SYNC_KEYS (no free-text exercise keys → no encode/decode). ──

/** @returns {{ratingRirOffset?:{offset:number, n:number}}|null} */
function _getTuning() {
  const raw = /** @type {any} */ (DB.get(BEHAVIOR_TUNING_KEY));
  return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : null;
}

/**
 * Persist the distilled tuning artifact (synced per-UID via SYNC_KEYS). Quota-guarded
 * (mirrors saveTemperament). No-op on an invalid artifact.
 * @param {{ratingRirOffset?:{offset:number, n:number}}} tuning
 * @returns {{ok:boolean, error?:string}}
 */
export function saveBehaviorTuning(tuning) {
  if (!tuning || typeof tuning !== 'object' || Array.isArray(tuning)) {
    return { ok: false, error: 'invalid_tuning' };
  }
  const res = DB.set(BEHAVIOR_TUNING_KEY, tuning);
  return res && res.ok === false ? res : { ok: true };
}

/**
 * The trusted per-user rating RIR offset from the persisted tuning, or 0 (neutral →
 * byte-identical to the global RATING_TO_RIR) when none is trusted. Reads the synced
 * cache; the consumer (dp._rirFromRpe) adds this to the base RIR behind the flag.
 * @returns {number} clamped RIR offset, 0 when none trusted
 */
export function behaviorRirOffset() {
  const t = _getTuning();
  const r = t && t.ratingRirOffset;
  if (r && Number.isFinite(r.offset) && Number(r.n) >= MIN_PAIRS) {
    return clampOffset(r.offset);
  }
  return 0;
}

/**
 * Async session-end hook: read the durable behavior log, distill, persist. Best-
 * effort + fail-silent (never throws, never blocks render — fired-and-forgotten from
 * persistSessionLogs behind the flag). EMA-continued from the persisted tuning so the
 * offset never saw-tooths. Returns the saved tuning (or null) for test determinism.
 *
 * @param {() => Promise<ReadonlyArray<import('../../react/lib/debugLog').BehaviorEvent>>} readLog
 *   injected log reader (debugLog.snapshot) — keeps this module pure of the IDB import.
 * @returns {Promise<{ratingRirOffset:{offset:number, n:number}}|null>}
 */
export async function distillAndPersistBehaviorTuning(readLog) {
  try {
    const events = await readLog();
    const prior = _getTuning();
    const tuning = distillBehavior(events, prior);
    if (tuning) saveBehaviorTuning(tuning);
    return tuning;
  } catch {
    return null; // distillation must never break the finish path
  }
}
