// ══ BUILD F6b V1 #10 — Learned MEV/MAV/MRV (F6b spec §3) ═════════════════════
// Static landmarks today: ISRAETEL_BASELINES (constants.js) → computeMuscleVolumeTarget
// (volumeLandmarks.js:159-201). EVERY user of the same persona/goal/experience gets
// the IDENTICAL MEV/MAV/MRV — the modifiers personalize the dose WITHIN the table,
// but the landmarks themselves never move with the user's actual RESPONSE. There is
// no per-user volume learning anywhere (grep learnedVolume|productiveVolume|junk →
// none). That is the V1 hole.
//
// This learns the user's PERSONAL productive band per muscle from their own
// (volume-week → progress) history, mirroring the F3 learned-recovery design 1:1
// (muscleMap.js:62-178 — same slow-EMA-toward-prior + clamp-band + MIN-obs guard +
// muscle-keyed synced map, NOT name-keyed because muscle tokens are Firebase-safe):
//   - personalMAV = the weekly set count above which progress STALLS (more sets stop
//     raising the muscle's lifts' 1RM) — sets beyond this = junk volume.
//   - personalMEV = the weekly set count below which the muscle REGRESSES / fails to
//     maintain (lifts trend down) — detects under-dosing.
// Blend toward the Israetel prior via a slow EMA (alpha 0.3) and clamp to a sane band
// of the prior ([0.6×, 1.6×]) so a noisy few weeks cannot invent an absurd landmark.
//
// Consumed in computeMuscleVolumeTarget: learned[muscle].mav ?? baseline.MAV (target
// driver) + learned[muscle].mev ?? baseline.MEV (floor). With no learned data → the
// `?? baseline` fallback = BYTE-IDENTICAL to today, even with the flag ON.
//
// Pairs with V3-dose: when dp_effective_reps_v1 is ON, learn on EFFECTIVE (stimulus)
// volume rather than raw set count (degrades to raw count when the flag is off).

import { DB } from '../../db.js';
import { isEnabled } from '../../util/featureFlags.js';
import { brzycki1RM } from '../weaknessDetector.js';
import { groupForExerciseBig11 } from '../muscleRecovery.js';
import { effectiveReps } from '../dp/effectiveReps.js';
import { isoWeek } from '../../util/isoWeek.js';
import { ISRAETEL_BASELINES, BIG11_RO_TO_EN_MAP } from './constants.js';

export const LEARNED_VOLUME_KEY = 'dp-learned-volume';

// ── Daniel-tunable (F6b §7 — DESIGN PROPOSAL, needs a sim sweep + sanity check
//    before the flag flips ON, exactly like the F3 learned-recovery clamp + alpha) ──
export const LEARNED_VOLUME_EMA_ALPHA = 0.3;  // slow EMA (mirrors dp.js calibration + recovery)
export const LEARNED_VOLUME_CLAMP_LO = 0.6;   // learned landmark floored at 0.6× the prior
export const LEARNED_VOLUME_CLAMP_HI = 1.6;   // ceiled at 1.6× the prior
const LEARNED_VOLUME_MIN_WEEKS = 4;           // need ≥4 observed (week→nextWeek 1RM) deltas to learn
const STALL_EPS = 0.005;                      // ±0.5% weekly 1RM delta = "flat" (response saturated)

/**
 * Sum the weekly set count a muscle group received in one ISO-week's logs. When
 * `useEffective` is true (dp_effective_reps_v1 ON), each set contributes its
 * stimulus weight (effectiveReps / EFFECTIVE_WINDOW) instead of a flat 1 — so a
 * to-failure trainee's week reads FEWER (real) sets than a left-in-the-tank one,
 * and the learned landmark reflects delivered stimulus, not log padding.
 * @param {Array<{ reps?: number|string, rating?: string }>} sets
 * @param {boolean} useEffective
 * @returns {number}
 */
function weeklySetWeight(sets, useEffective) {
  if (!useEffective) return sets.length;
  let w = 0;
  for (const s of sets) w += effectiveReps(s) / 5; // EFFECTIVE_WINDOW = 5 (effectiveReps.js)
  return w;
}

/**
 * Learn the user's personal productive volume band per Israetel muscle from their
 * own (weekly-sets → next-week-1RM-delta) history. PURE — a read of the passed
 * `logs` rows; no DB, no clock, no mutation.
 *
 * For each muscle: bucket the logs into (ISO-week) → { sets received, best 1RM }.
 * Walking consecutive weeks, the next-week 1RM delta vs this week's set count gives
 * the response curve. personalMAV = the smallest weekly-set count at which the
 * forward 1RM delta crosses ~0 (response saturates → more sets are junk);
 * personalMEV = the largest weekly-set count at which the forward delta is still
 * negative (under-dosing → the muscle regressed). Each is EMA-blended toward the
 * Israetel prior (MAV/MEV from the table) and clamped to [0.6×, 1.6×] of the prior.
 *
 * Muscles with fewer than LEARNED_VOLUME_MIN_WEEKS week-deltas are left to the prior
 * (absent from the returned map) → the `?? baseline` consumer keeps today's value.
 *
 * @param {Array<{ ex?: string, w?: number, reps?: number|string, rating?: string, ts?: number, date?: string }>} logs
 * @param {Record<string, {mev:number, mav:number, n:number}>} [prior] existing learned
 *   landmarks to EMA-continue (the persisted `dp-learned-volume`); absent → seed
 *   from the Israetel prior.
 * @param {{ effective?: boolean }} [opts] effective: learn on stimulus volume (V3 dose link)
 * @returns {Record<string, {mev:number, mav:number, n:number}>} keyed on ISRAETEL EN muscle
 */
export function learnVolumeLandmarks(logs, prior, opts) {
  /** @type {Record<string, {mev:number, mav:number, n:number}>} */
  const out = {};
  const rows = Array.isArray(logs) ? logs.filter((l) => l && l.ex && Number(l.w) > 0) : [];
  if (rows.length === 0) return out;
  const useEffective = !!(opts && opts.effective);

  // Bucket per (EN muscle, ISO-week) → { sets[], best1RM }.
  /** @type {Record<string, Map<string, { sets: any[], best: number }>>} */
  const perMuscle = {};
  for (const l of rows) {
    const ts = Number(l.ts) || new Date(l.date ?? '').getTime();
    if (!Number.isFinite(ts) || ts <= 0) continue;
    const week = isoWeek(ts);
    const reps = typeof l.reps === 'string' ? parseInt(l.reps, 10) : Number(l.reps);
    const orm = brzycki1RM(Number(l.w), reps);
    // The muscle(s) this exercise primarily loads (Big-11 RO) → ISRAETEL EN key.
    for (const roGroup of groupForExerciseBig11(l.ex)) {
      const enMuscle = /** @type {Record<string,string>} */ (BIG11_RO_TO_EN_MAP)[roGroup];
      if (!enMuscle || !ISRAETEL_BASELINES[enMuscle]) continue;
      const byWeek = perMuscle[enMuscle] || (perMuscle[enMuscle] = new Map());
      const cell = byWeek.get(week) || { sets: [], best: 0 };
      cell.sets.push(l);
      if (typeof orm === 'number' && orm > cell.best) cell.best = orm;
      byWeek.set(week, cell);
    }
  }

  for (const enMuscle of Object.keys(perMuscle)) {
    const baseline = ISRAETEL_BASELINES[enMuscle];
    const weeks = [...perMuscle[enMuscle].entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, cell]) => ({ sets: weeklySetWeight(cell.sets, useEffective), best: cell.best }))
      .filter((w) => w.best > 0);
    if (weeks.length < LEARNED_VOLUME_MIN_WEEKS + 1) continue;

    // Response curve: each week's set count vs the FORWARD 1RM delta (next week).
    /** @type {Array<{ sets:number, delta:number }>} */
    const pts = [];
    for (let i = 1; i < weeks.length; i++) {
      const prevBest = weeks[i - 1].best;
      if (prevBest <= 0) continue;
      pts.push({ sets: weeks[i - 1].sets, delta: (weeks[i].best - prevBest) / prevBest });
    }
    if (pts.length < LEARNED_VOLUME_MIN_WEEKS) continue;

    // personalMAV = smallest weekly-set count whose forward delta has saturated
    // (≤ STALL_EPS) — past here, more sets stop paying off (junk volume).
    const stalled = pts.filter((p) => p.delta <= STALL_EPS).map((p) => p.sets);
    // personalMEV = largest weekly-set count that still REGRESSED (delta < 0) —
    // below/at this dose the muscle failed to even maintain (under-dosing).
    const regressed = pts.filter((p) => p.delta < -STALL_EPS).map((p) => p.sets);

    const start = prior && prior[enMuscle] ? prior[enMuscle] : { mev: baseline.MEV, mav: baseline.MAV };
    let mav = Number.isFinite(start.mav) ? start.mav : baseline.MAV;
    let mev = Number.isFinite(start.mev) ? start.mev : baseline.MEV;

    if (stalled.length) {
      const observedMav = Math.min(...stalled);
      mav = mav + LEARNED_VOLUME_EMA_ALPHA * (observedMav - mav);
    }
    if (regressed.length) {
      const observedMev = Math.max(...regressed);
      mev = mev + LEARNED_VOLUME_EMA_ALPHA * (observedMev - mev);
    }
    // Only emit when at least one signal moved the band this learn (else leave to prior).
    if (!stalled.length && !regressed.length) continue;

    mav = Math.max(baseline.MAV * LEARNED_VOLUME_CLAMP_LO, Math.min(baseline.MAV * LEARNED_VOLUME_CLAMP_HI, mav));
    mev = Math.max(baseline.MEV * LEARNED_VOLUME_CLAMP_LO, Math.min(baseline.MEV * LEARNED_VOLUME_CLAMP_HI, mev));
    // MEV can never exceed MAV (sane band ordering).
    if (mev > mav) mev = mav;

    const n = (prior && prior[enMuscle] && Number.isFinite(prior[enMuscle].n) ? prior[enMuscle].n : 0) + 1;
    out[enMuscle] = { mev: Math.round(mev * 10) / 10, mav: Math.round(mav * 10) / 10, n };
  }
  return out;
}

/**
 * Persist freshly-learned volume landmarks (quota-guarded). Merges over any
 * existing key. Mirrors saveRecoveryConstants (muscleMap.js:187). Reserved for a
 * single authoritative per-session write site (workoutStore.logic.persistSessionLogs).
 * @param {Record<string, {mev:number, mav:number, n:number}>} learned
 * @returns {{ok:boolean, error?:string}}
 */
export function saveLearnedVolume(learned) {
  if (!learned || typeof learned !== 'object') return { ok: false, error: 'bad_input' };
  const existing = /** @type {any} */ (DB.get(LEARNED_VOLUME_KEY)) || {};
  const merged = existing && typeof existing === 'object' && !Array.isArray(existing) ? { ...existing } : {};
  for (const m of Object.keys(learned)) merged[m] = learned[m];
  const res = DB.set(LEARNED_VOLUME_KEY, merged);
  return res && res.ok === false ? res : { ok: true };
}

/**
 * Flag-gated read of the persisted learned landmarks as a {muscle: {mev,mav}} map.
 * OFF or empty → null → computeMuscleVolumeTarget reads the static Israetel table
 * (byte-identical). Mirrors muscleMap._learnedRecoveryHours.
 * @returns {Record<string, {mev:number, mav:number}>|null}
 */
export function readLearnedVolume() {
  if (!isEnabled('dp_learned_volume_v1')) return null;
  const raw = /** @type {any} */ (DB.get(LEARNED_VOLUME_KEY));
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  /** @type {Record<string, {mev:number, mav:number}>} */
  const out = {};
  for (const m of Object.keys(raw)) {
    const mav = Number(raw[m] && raw[m].mav);
    const mev = Number(raw[m] && raw[m].mev);
    if (Number.isFinite(mav) && mav > 0) out[m] = { mav, mev: Number.isFinite(mev) ? mev : 0 };
  }
  return Object.keys(out).length ? out : null;
}
