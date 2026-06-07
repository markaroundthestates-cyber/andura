// ══ BUILD #8/D — pain / injury per-exercise deprioritize (F4 spec §D) ════════
// Pain is handled at the MUSCLE-GROUP level today (pain-cdl → deriveInjurySignal →
// muscleRecovery applyPainEscalation deprioritizes the whole group). But nothing
// tracks REPEATED skip/pain on a SPECIFIC exercise — a user who skips "Barbell
// Back Squat" every session (knee twinge) keeps getting it re-prescribed.
//
// This adds a per-EXERCISE penalty:
//   - a durable, SYNCED `dp-exercise-pain` counter (cal-factor pattern, EN-keyed,
//     quota-guarded) incremented at the existing skip site (recordExerciseSkip);
//   - PLUS a recent pain-cdl report whose region maps to the exercise's
//     muscle_target_primary (NO new capture — reuses the existing pain channel).
// `exercisePenalty(...) → 0..1` is consumed by sessionBuilder.poolForGroup behind
// dp_pain_deprioritize_v1 (default OFF) to DEMOTE the exercise in the pool — NOT a
// hard ban (anti-paternalism: the user can still get it if it's the only option;
// the caller guards "never the last exercise for a muscle"). The skip count DECAYS
// over time so a one-week tweak doesn't deprioritize for months.

import { DB } from '../../db.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { PAIN_REGION_GROUP_MAP } from '../muscleRecoveryConstants.js';

export const EXERCISE_PAIN_KEY = 'dp-exercise-pain';
const PAIN_CDL_KEY = 'pain-cdl';

// ── Daniel-tunable (F4 §D · flag-for-Daniel §4) ──────────────────────────────
// SKIP_THRESHOLD recent skips → full skip-side penalty (linear ramp below it).
export const SKIP_THRESHOLD = 3;
// Half-life of a skip's weight (days) — a skip's contribution decays by 50% every
// this many days, so an old skip fades and a fresh tweak doesn't linger for months.
export const SKIP_HALF_LIFE_DAYS = 21;
// A pain report on the exercise's primary muscle within this window adds penalty.
export const PAIN_LOOKBACK_DAYS = 42;
// Severe pain (intensity 3) → full pain-side penalty; mild (1) → a third.
const PAIN_INTENSITY_WEIGHT = { 1: 0.34, 2: 0.67, 3: 1 };
const MS_DAY = 86400000;

/** @returns {Record<string, {skips:number, lastSkipTs:number}>} */
function _getAll() {
  const raw = /** @type {any} */ (DB.get(EXERCISE_PAIN_KEY));
  return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
}

/**
 * Record a skip for one exercise. Additive + QUOTA-GUARDED (mirrors
 * strengthKalman.savePosterior): DB.set returns {ok:false} on quota — we surface
 * it and never throw, so a full store degrades to "no new skip recorded" rather
 * than corrupting the key. Synced per-UID (dp-exercise-pain in SYNC_KEYS).
 * @param {string} engineName EN canonical name
 * @param {number} [nowMs]
 * @returns {{ok:boolean, error?:string}}
 */
export function recordExerciseSkip(engineName, nowMs) {
  if (typeof engineName !== 'string' || !engineName) return { ok: false, error: 'bad_key' };
  const all = _getAll();
  const prev = all[engineName];
  const skips = prev && Number.isFinite(prev.skips) ? prev.skips : 0;
  all[engineName] = { skips: skips + 1, lastSkipTs: Number(nowMs) || Date.now() };
  const res = DB.set(EXERCISE_PAIN_KEY, all);
  return res && res.ok === false ? res : { ok: true };
}

/**
 * Time-decayed skip count for one exercise: each skip's weight halves every
 * SKIP_HALF_LIFE_DAYS. We only persist a count + the LAST skip ts (not every ts),
 * so this decays the WHOLE count from the last skip — a conservative under-estimate
 * (older skips inside the count decay no faster than the newest), which is the safe
 * direction (never OVER-penalizes). PURE.
 * @param {{skips:number, lastSkipTs:number}|undefined} rec
 * @param {number} now
 * @returns {number}
 */
function _decayedSkips(rec, now) {
  if (!rec || !Number.isFinite(rec.skips) || rec.skips <= 0) return 0;
  const days = Number.isFinite(rec.lastSkipTs) ? Math.max(0, (now - rec.lastSkipTs) / MS_DAY) : 0;
  const decay = Math.pow(0.5, days / SKIP_HALF_LIFE_DAYS);
  return rec.skips * decay;
}

/**
 * Per-exercise deprioritize penalty in [0,1]. The MAX of:
 *   - skip side: decayed skip count / SKIP_THRESHOLD (clamped 1);
 *   - pain side: the heaviest recent pain report (within PAIN_LOOKBACK_DAYS) whose
 *     region maps to this exercise's primary muscle, weighted by intensity.
 * PURE — `painCdl` + `regionGroupMap` are passed in (the caller reads the sync DB
 * keys), `now` injectable for deterministic tests. 0 when no signal (the common
 * path → the pool order is unchanged, byte-identical with the flag off anyway).
 *
 * @param {string} engineName EN canonical name
 * @param {string} primaryMuscle exercise muscle_target_primary (Big-11 group)
 * @param {ReadonlyArray<{type?:string, region?:string, intensity?:number, ts?:number}>} painCdl
 * @param {Record<string, string[]|undefined>} regionGroupMap PAIN_REGION_GROUP_MAP
 * @param {number} now epoch ms
 * @returns {number} in [0,1]
 */
export function exercisePenalty(engineName, primaryMuscle, painCdl, regionGroupMap, now) {
  // Skip side (durable counter).
  const all = _getAll();
  const skipPenalty = Math.min(1, _decayedSkips(all[engineName], now) / SKIP_THRESHOLD);

  // Pain side (reuse the existing pain-cdl channel — no new capture).
  let painPenalty = 0;
  const cutoff = now - PAIN_LOOKBACK_DAYS * MS_DAY;
  const entries = Array.isArray(painCdl) ? painCdl : [];
  for (const e of entries) {
    if (!e || e.type !== 'pain' || typeof e.region !== 'string') continue;
    const ts = Number(e.ts);
    if (!Number.isFinite(ts) || ts < cutoff) continue;
    const groups = regionGroupMap[e.region];
    if (!Array.isArray(groups) || !groups.includes(primaryMuscle)) continue;
    const w = PAIN_INTENSITY_WEIGHT[/** @type {1|2|3} */ (e.intensity)] ?? PAIN_INTENSITY_WEIGHT[1];
    if (w > painPenalty) painPenalty = w;
  }

  return Math.max(skipPenalty, painPenalty);
}

/**
 * Build the penalty map { [engineName]: 0..1 } for every exercise that currently
 * carries a pain/skip signal. Reads the SYNC DB keys (`dp-exercise-pain`,
 * `pain-cdl`) here so sessionBuilder/poolForGroup stay PURE (they receive the map).
 * Only NON-ZERO entries are included → an empty map (the common case) means the
 * pool order is byte-identical. The caller gates this behind dp_pain_deprioritize_v1.
 * @param {number} [nowMs]
 * @returns {Record<string, number>}
 */
export function exercisePenaltyMap(nowMs) {
  const now = Number(nowMs) || Date.now();
  const painCdl = /** @type {any} */ (DB.get(PAIN_CDL_KEY)) || [];
  const map = /** @type {Record<string, number>} */ ({});
  // Exercises with a durable skip counter — the per-exercise discriminating signal.
  for (const engineName of Object.keys(_getAll())) {
    const meta = getExerciseMetadata(engineName);
    const muscle = meta ? meta.muscle_target_primary : 'unknown';
    const p = exercisePenalty(engineName, muscle, painCdl, PAIN_REGION_GROUP_MAP, now);
    if (p > 0) map[engineName] = p;
  }
  return map;
}
