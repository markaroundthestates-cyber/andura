// ══ BUILD F6a #20 — per-set fatigue curve (F6a spec §2) ══════════════════════
// Models how reps fall across sets at a FIXED load per user: some MAINTAIN (flat
// curve, drop-off late/never), some CRASH (steep curve, early drop-off). Drives a
// per-user sets-before-dropoff personalization (a maintainer earns +1 working set,
// a crasher loses 1) via the SAME `setsAdjust` channel _returnDeload already uses
// (dp.js:2037) — no new schedule plumbing.
//
// PURE learner (learnFatigueCurve / dropIndexForSession) + a SYNCED durable cache
// (dp-fatigue-curve, cal-factor pattern, name-keyed, quota-guarded). Slow EMA on
// the drop-off index (alpha 0.3, mirrors dp.js CAL_ALPHA) so one crash session
// barely moves it. Recomputable from logs (like the Kalman posterior) — the
// persisted copy is a continuity/perf optimization.
//
// Flag dp_fatigue_curve_v1 (default OFF) → learnFatigueCurve is never invoked and
// fatigueSetsAdjust returns 0 → byte-identical to today's distributeGroupSets.

import { DB } from '../../db.js';

export const FATIGUE_CURVE_KEY = 'dp-fatigue-curve';

// ── Daniel-tunable (F6a §2f / §7 — DESIGN PROPOSAL, needs a sim sweep + sanity
//    check before the flag flips ON, like the DROP_THRESHOLD caveat) ───────────
export const FATIGUE_EMA_ALPHA = 0.3;      // slow EMA (mirrors dp.js CAL_ALPHA)
export const DROP_THRESHOLD = 0.85;        // reps below set-1 x this → dropped off
export const FATIGUE_MIN_SESSIONS = 3;     // need >=3 fixed-load sessions to trust
export const FATIGUE_MIN_SETS = 3;         // a session needs >=3 sets to score a curve
// A maintainer's drop-off index sits at/after this many sets → +1 set; a crasher's
// at/before the crasher cut → -1 set. Between → no adjust (today's defaults).
export const MAINTAINER_DROP_INDEX = 4;    // dropped off at set 4+ (or never) → maintainer
export const CRASHER_DROP_INDEX = 2;       // dropped off by set 2 → crasher

/** @returns {Record<string, {dropIndex:number, n:number}>} */
function _getAll() {
  const raw = /** @type {any} */ (DB.get(FATIGUE_CURVE_KEY));
  return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
}

/**
 * The drop-off index for ONE session's set sequence at a fixed load = the 1-based
 * set at which reps first fall below set-1 reps × DROP_THRESHOLD. If reps never
 * fall below, the drop-off index is the set count + 1 (a true maintainer this
 * session). PURE. Returns null when the session is too short / unusable.
 *
 * @param {ReadonlyArray<{reps?:number|string}>} setRows ordered set-1..set-N
 * @returns {number|null}
 */
export function dropIndexForSession(setRows) {
  const reps = (Array.isArray(setRows) ? setRows : [])
    .map((s) => (typeof s.reps === 'string' ? parseInt(s.reps, 10) : Number(s.reps)))
    .filter((r) => Number.isFinite(r) && r > 0);
  if (reps.length < FATIGUE_MIN_SETS) return null;
  const first = reps[0];
  if (!(first > 0)) return null;
  const floor = first * DROP_THRESHOLD;
  for (let i = 1; i < reps.length; i++) {
    if (reps[i] < floor) return i + 1; // 1-based set index where it dropped off
  }
  return reps.length + 1; // never dropped off → maintainer this session
}

/**
 * Group a flat log list into per-exercise sessions at a fixed (modal) load and
 * compute the per-session drop-off index, then EMA-blend into a learned dropIndex
 * per exercise. PURE — no DB. Continues from `prior` (the persisted cache) so the
 * value never saw-tooths as the window slides. Exercises with < FATIGUE_MIN_SESSIONS
 * usable sessions are left out (the caller keeps the population default).
 *
 * @param {ReadonlyArray<{ex?:string, w?:number, reps?:number|string, ts?:number}>} logs
 * @param {Record<string, {dropIndex:number, n:number}>} [prior]
 * @returns {Record<string, {dropIndex:number, n:number}>}
 */
export function learnFatigueCurve(logs, prior) {
  /** @type {Record<string, Array<{ts:number, w:number, reps:number}>>} */
  const byEx = {};
  for (const l of Array.isArray(logs) ? logs : []) {
    if (!l || /** @type {any} */ (l).baseline || !l.ex) continue;
    const w = Number(l.w);
    const reps = typeof l.reps === 'string' ? parseInt(l.reps, 10) : Number(l.reps);
    const ts = Number(l.ts) || 0;
    if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(reps) || reps <= 0) continue;
    (byEx[l.ex] = byEx[l.ex] || []).push({ ts, w, reps });
  }

  /** @type {Record<string, {dropIndex:number, n:number}>} */
  const out = {};
  for (const ex of Object.keys(byEx)) {
    // Group into sessions by calendar day; per session, the set sequence is the
    // rows at the session's MODAL load (fixed-load curve), ordered as logged.
    const rows = byEx[ex].sort((a, b) => a.ts - b.ts);
    /** @type {Record<number, Array<{ts:number, w:number, reps:number}>>} */
    const byDay = {};
    for (const r of rows) {
      const day = Math.floor(r.ts / 86400000);
      (byDay[day] = byDay[day] || []).push(r);
    }
    const dropIdxs = [];
    for (const day of Object.keys(byDay)) {
      const sess = byDay[/** @type {any} */ (day)];
      // modal load this session
      const counts = new Map();
      let modal = 0, modalN = 0;
      for (const s of sess) {
        const c = (counts.get(s.w) || 0) + 1;
        counts.set(s.w, c);
        if (c > modalN) { modalN = c; modal = s.w; }
      }
      const atLoad = sess.filter((s) => s.w === modal);
      const di = dropIndexForSession(atLoad);
      if (di != null) dropIdxs.push(di);
    }
    // First learn needs FATIGUE_MIN_SESSIONS to trust the curve; once a prior
    // exists we CONTINUE it with however few new sessions (incremental, mirrors
    // strengthKalman.updatePosterior) so the EMA keeps moving session-to-session.
    const startRec = prior && prior[ex];
    if (!startRec && dropIdxs.length < FATIGUE_MIN_SESSIONS) continue;
    if (dropIdxs.length === 0) continue;

    let blended = startRec && Number.isFinite(startRec.dropIndex) ? startRec.dropIndex : dropIdxs[0];
    for (let i = startRec ? 0 : 1; i < dropIdxs.length; i++) {
      blended = blended + FATIGUE_EMA_ALPHA * (dropIdxs[i] - blended);
    }
    const n = (startRec && Number.isFinite(startRec.n) ? startRec.n : 0) + dropIdxs.length;
    out[ex] = { dropIndex: Math.round(blended * 100) / 100, n };
  }
  return out;
}

/**
 * Persist freshly-learned fatigue curves (quota-guarded, merges over existing).
 * Mirrors saveRecoveryConstants / saveLearnedStep. Keyed on EN canonical engineName.
 * @param {Record<string, {dropIndex:number, n:number}>} learned
 * @returns {{ok:boolean, error?:string}}
 */
export function saveFatigueCurve(learned) {
  if (!learned || typeof learned !== 'object') return { ok: false, error: 'bad_input' };
  const all = _getAll();
  for (const ex of Object.keys(learned)) all[ex] = learned[ex];
  const res = DB.set(FATIGUE_CURVE_KEY, all);
  return res && res.ok === false ? res : { ok: true };
}

/**
 * The learned per-set fatigue adjustment for one exercise's working-set count:
 *   +1 for a MAINTAINER (drop-off late/never), -1 for a CRASHER (early drop-off),
 *    0 otherwise (and 0 when no trusted curve → byte-identical defaults).
 * Reads the synced cache. The caller (schedule set-count step) clamps the result
 * to [tier-floor, 8] and >=1 working set (so -1 never zeroes a group). PURE-read.
 * @param {string} engineName EN canonical name
 * @returns {number} -1 | 0 | +1
 */
export function fatigueSetsAdjust(engineName) {
  const rec = _getAll()[engineName];
  if (!rec || !Number.isFinite(rec.dropIndex)) return 0;
  if (Number(rec.n) < FATIGUE_MIN_SESSIONS) return 0;
  if (rec.dropIndex >= MAINTAINER_DROP_INDEX) return 1;
  if (rec.dropIndex <= CRASHER_DROP_INDEX) return -1;
  return 0;
}
