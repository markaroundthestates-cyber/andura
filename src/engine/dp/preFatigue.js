// ══ RELATIVE PRE-FATIGUE — dp_prefatigue_relative_v1 ═══════════════════════════════
// Founder 2026-11-17: "dupa Cable row, lat pulldown, incline curls, hammer curls,
// straight arm pulldown... [Andura crede ca] mai pot sa fac reverse pec deck cu
// greutatea maxima... nu cred ca ia in calcul fatigue".
//
// The rec for a lift progresses from its LAST session. That session had its own
// context: his Reverse Pec Deck 50x8, 50x9 came at the end of a PUSH day (rear delts
// barely touched), so the engine asked 50x10 at the end of a PULL day, after four sets
// of rows had already worked his rear delts → 50x8, rated hard.
//
// The legacy synergist discount (dp.js accumulateSynergistLoad) never reached this:
//   - it reads Big-11 groups, and rows list only biceps as a synergist (a row works
//     the rear delt; 'umeri' as a whole would also count a bench press, which loads
//     the FRONT delt);
//   - it counts today's prior work in ABSOLUTE terms, so the PR floor ("never below
//     what you demonstrated") has to cancel it, or a curl that always follows rows
//     would be discounted every session and ratchet down. With the floor it almost
//     never fires.
//
// This compares the work that preceded the lift TODAY with the work that preceded it
// in the session its rec comes from, and acts only on the difference. A lift that
// keeps its place in the session is untouched (its history already carries that
// fatigue). On a coarse machine, where the next rung down is a far bigger cut than the
// fatigue asks for, the reps come down instead (50x10 → 50x8 on a 41/50/59 stack).
//
// PURE given the rows + the DP helpers passed in (no dp.js import → no cycle).

import { getExerciseMetadata } from '../exerciseLibrary.js';
import { musclesForExercise } from '../muscleMap.js';
import { loggedRowMatcher } from './logIdentity.js';

/** Load shaved per unit of extra prior work on the lift's muscle (the legacy synergist
 *  constant: four sets of rows ≈ 5 %, his measured RPD drop 50x9@7.5 → 50x8@8.5). */
export const PREFATIGUE_PER_UNIT = 0.012;
/** Never more than this, whatever piled up before. */
export const PREFATIGUE_CAP = 0.12;
/** Per set: a synergist set by the prior lift's force demand, a direct set counts whole. */
const FORCE = /** @type {Record<string, number>} */ ({ high: 1, medium: 0.6, low: 0.3 });
const DELTS = new Set(['delt_front', 'delt_mid', 'delt_rear']);

/** The delt heads a lift works (delts are the one group whose heads do opposite jobs).
 *  @param {string} name @returns {string[]} */
export function deltHeadsOf(name) {
  const meta = getExerciseMetadata(name);
  const group = meta && meta.muscle_target_primary;
  const n = String(name).toLowerCase();
  if (group === 'umeri') return (musclesForExercise(name)?.primary ?? []).filter((h) => DELTS.has(h));
  const out = [];
  const sec = Array.isArray(meta && meta.muscle_target_secondary) ? meta.muscle_target_secondary : [];
  if (sec.includes('umeri')) out.push(group === 'piept' || /press|dip|push/.test(n) ? 'delt_front' : 'delt_mid');
  // A horizontal pull drives the arm back past the torso: the rear delt's job.
  if (group === 'spate' && /row/.test(n) && !/upright/.test(n)) out.push('delt_rear');
  return out;
}

/**
 * Weighted prior work on the target's muscle: a set whose lift trains that muscle
 * directly counts 1, a set where it is a synergist counts the lift's force factor.
 * @param {string} target
 * @param {ReadonlyArray<{name?: string, sets?: number}>} prior
 * @returns {number}
 */
export function priorWorkOn(target, prior) {
  const tMeta = getExerciseMetadata(target);
  const group = tMeta && tMeta.muscle_target_primary;
  if (!group || group === 'unknown' || !Array.isArray(prior)) return 0;
  const tDelts = group === 'umeri' ? deltHeadsOf(target) : null;
  let load = 0;
  for (const p of prior) {
    if (!p || typeof p.name !== 'string' || p.name === target) continue;
    const sets = Number(p.sets);
    if (!(sets > 0)) continue;
    const meta = getExerciseMetadata(p.name);
    const pg = meta && meta.muscle_target_primary;
    const force = FORCE[(meta && meta.force_demand) || 'medium'] ?? 0.6;
    if (tDelts) {
      const heads = deltHeadsOf(p.name);
      if (!heads.some((h) => tDelts.includes(h))) continue;
      load += sets * (pg === 'umeri' ? 1 : force);
    } else if (pg === group) {
      load += sets;
    } else if (Array.isArray(meta && meta.muscle_target_secondary) && meta.muscle_target_secondary.includes(group)) {
      load += sets * force;
    }
  }
  return load;
}

/**
 * The lifts (and set counts) that came BEFORE the target in its most recent logged
 * session — the context its rec progresses from. null when it was never logged.
 * @param {string} target
 * @param {ReadonlyArray<any>} rows all log rows
 * @returns {Array<{name: string, sets: number}>|null}
 */
export function referencePrior(target, rows) {
  if (!Array.isArray(rows)) return null;
  const matches = loggedRowMatcher(target);
  let newest = null;
  for (const r of rows) if (r && matches(r) && Number(r.w) > 0 && (!newest || Number(r.ts) > Number(newest.ts))) newest = r;
  if (!newest) return null;
  const key = (r) => (r.session != null ? `s${r.session}` : `d${r.date}`);
  const sk = key(newest);
  const same = rows.filter((r) => r && key(r) === sk);
  let first = Infinity;
  for (const r of same) if (matches(r)) first = Math.min(first, Number(r.ts));
  const counts = new Map();
  for (const r of same) {
    if (matches(r) || !(Number(r.ts) < first) || typeof r.ex !== 'string') continue;
    counts.set(r.ex, (counts.get(r.ex) || 0) + 1);
  }
  return [...counts].map(([name, sets]) => ({ name, sets }));
}

/**
 * The load fraction today's extra prior work takes off the target, in
 * [0, PREFATIGUE_CAP]. 0 when today is no more tiring than its reference session.
 * @param {string} target
 * @param {ReadonlyArray<{name?: string, sets?: number}>} todayPrior
 * @param {ReadonlyArray<any>} rows
 * @returns {number}
 */
export function relativePreFatigue(target, todayPrior, rows) {
  const ref = referencePrior(target, rows);
  if (!ref) return 0;
  const extra = priorWorkOn(target, todayPrior || []) - priorWorkOn(target, ref);
  return extra > 0 ? Math.min(PREFATIGUE_CAP, extra * PREFATIGUE_PER_UNIT) : 0;
}

/**
 * Apply the relative pre-fatigue to a finished DP recommendation (mutates `result`).
 * kg path when a real rung sits close to the lighter target; else the reps come down
 * by the same strength fraction (Epley: R' = R − d·(30 + R)). The demonstrated-capacity
 * floor scales by the same fraction — it was demonstrated in the lighter context.
 * Returns {} so the legacy synergist block downstream stays a no-op. The reps path only
 * marks `preFatigueReps`; dp.js applies fatiguedReps after the goal rep band.
 * @param {{ roundToStep: (kg: number, ex: string) => number, _demoWorkingW: (ex: string, r: number) => number }} dp
 * @param {string} ex
 * @param {any} result
 * @param {ReadonlyArray<{name?: string, sets?: number}>|undefined} prior
 * @param {ReadonlyArray<any>|null} rows
 * @returns {{}}
 */
export function applyRelativePreFatigue(dp, ex, result, prior, rows) {
  if (!result || !(Number(result.kg) > 0)) return {};
  const d = relativePreFatigue(ex, prior || [], rows || []);
  if (!(d > 0)) return {};
  const preKg = Number(result.kg);
  const reps = Number(result.repsTarget);
  const floor = dp._demoWorkingW(ex, Number.isFinite(reps) ? reps : 8) * (1 - d);
  const lighter = dp.roundToStep(Math.max(preKg * (1 - d), floor), ex);
  result.preFatigue = d;
  if (lighter < preKg && (preKg - lighter) / preKg <= 1.5 * d + 0.01) {
    result.preFatigueKgBefore = preKg;
    result.kg = lighter;
    return {};
  }
  // Reps path: applied by dp.js AFTER the goal rep band (fatiguedReps) — the band would
  // otherwise lift a fatigued 8 straight back to its floor of 10.
  result.preFatigueReps = d;
  return {};
}

/**
 * The fatigued rep target for a reps-path pre-fatigue (mutates result's audit field):
 * R' = R − d·(30 + R), at most 4 reps off, never below 4.
 * @param {any} result @param {number} reps @returns {number}
 */
export function fatiguedReps(result, reps) {
  const d = Number(result && result.preFatigueReps);
  if (!(d > 0) || !(reps > 0)) return reps;
  const next = Math.min(reps, Math.max(Math.round(reps - d * (30 + reps)), reps - 4, 4));
  if (next < reps) result.preFatigueRepsBefore = reps;
  return next;
}
