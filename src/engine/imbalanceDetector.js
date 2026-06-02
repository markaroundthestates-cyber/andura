// ══ IMBALANCE DETECTOR — antagonist / pattern volume imbalance (M3) ═══════
// The moat (ADR 025): Andura builds the smart workout, the user does not think.
// From training HISTORY alone, detect the injury-relevant antagonist/pattern
// imbalances and bias the plan to close them — more volume to the UNDER-trained
// side, ZERO user input.
//
// Pure-function discipline (ADR 026 §9): no DB / DOM, no wall-clock read inside
// the math — `now` is injected at the I/O boundary for deterministic testing
// (mirrors getLaggingMuscles / muscleRecovery.js). No Math.random.
//
// NOT a medical signal. This is VOLUME BIASING, not a diagnosis: no "you're
// injured / at risk" semantics anywhere — the output is engine-internal sets/week.
//
// ── Imbalance pairs (V1 — the injury-relevant classics) ───────────────────
//   • Push vs Pull (shoulder-health antagonist balance). Ideal ≈ 1:1.
//       push = chest + shoulders + triceps   (Big-11 RO: piept + umeri + triceps)
//       pull = back  + biceps                (Big-11 RO: spate + biceps)
//     A chronically push-dominant program under-trains the upper back / external
//     rotators relative to the anterior chain — the classic "all bench, no row"
//     pattern. We bias volume toward the PULL side to restore ≈1:1.
//   • Quad vs Hamstring (anterior vs posterior knee). Quad-dominant beyond a
//     healthy ratio under-trains the posterior chain.
//       quad = picioare-quads        ham = picioare-hamstrings
//     We bias volume toward the HAMSTRING side.
//   Left/right (per-side unilateral) is SKIPPED — no per-side data is tracked.
//
// ── Per-group volume aggregation ──────────────────────────────────────────
// Identical approach to getLaggingMuscles: one "set" is counted per logged set
// row whose exercise's PRIMARY muscle heads (EXERCISE_MUSCLES) fall into a Big-11
// RO group (GROUP_HEAD_MAP_BIG11). The exercise→group mapping is NOT reinvented —
// it is the same muscleMap source of truth the recovery + lagging engines use.
// A side's volume is the SUM of its constituent groups' sets over the lookback.
//
// ── Threshold + correction ────────────────────────────────────────────────
// A pair is flagged when dominantVolume / laggingVolume exceeds the pair's
// threshold. Correction RAISES the lagging side's group budgets toward parity
// with the dominant side, proportional to severity, HARD-capped at each group's
// Israetel MRV. It NEVER lowers the dominant side (additive only). Insufficient
// data (a side with ~zero volume → ratio undefined, or too few sessions) and a
// balanced ratio both yield NO correction (graceful degradation, ADR 025).

import { EXERCISE_MUSCLES } from './muscleMap.js';
import { GROUP_HEAD_MAP_BIG11 } from './muscleRecoveryConstants.js';
import { MS_PER_DAY } from '../constants.js';
import { ISRAETEL_BASELINES, BIG11_RO_TO_EN_MAP } from './periodization/constants.js';

// ── Pair definitions (Big-11 RO group rollups) ────────────────────────────
// Each side is the list of Big-11 RO groups whose set volume sums to the side
// total. Push/pull = antagonist shoulder-health balance; quad/ham = posterior
// chain balance. The "lagging" side is the one we ADD volume to when flagged.
const PUSH_PULL = Object.freeze({
  id: 'push_pull',
  dominantThreshold: 1.3, // push/pull > 1.3 → bias toward pull
  sideA: Object.freeze(['piept', 'umeri', 'triceps']), // push
  sideB: Object.freeze(['spate', 'biceps']),           // pull
});
const QUAD_HAM = Object.freeze({
  id: 'quad_ham',
  dominantThreshold: 1.5, // quad/ham > 1.5 → bias toward hamstrings
  sideA: Object.freeze(['picioare-quads']),       // quad
  sideB: Object.freeze(['picioare-hamstrings']),  // ham
});
const PAIRS = Object.freeze([PUSH_PULL, QUAD_HAM]);

// ── Tunable constants (two named knobs, not a zoo) ────────────────────────
// Minimum logged sets on a SIDE for that side to count as "real" data. Below
// this on either side the pair's ratio is treated as undefined → NO correction
// (a single stray set must not trigger a phantom imbalance). Evidence: a side
// trained at all in a 2-week block clears a handful of sets easily; <3 is noise.
export const MIN_SIDE_SETS = 3;

// How aggressively we close the volume gap on the lagging side. The lagging side
// is raised toward (laggingVolume + severity-scaled fraction of the deficit),
// where severity = how far past threshold the ratio sits. 0.50 = close HALF the
// (parity − current) gap at the threshold edge, scaling up with severity toward
// full parity — a decisive, felt correction that still respects the per-group
// MRV ceiling. Single tunable, NOT a per-pair multiplier zoo.
export const CORRECTION_STRENGTH = 0.50;

/**
 * Push/Pull and Quad/Ham ratio thresholds, rationale:
 *   - Push/Pull 1.3: shoulder-health literature (Cools/Page rotator-cuff balance,
 *     RP push:pull programming) targets ≈1:1 push:pull volume for healthy
 *     anterior/posterior shoulder balance. A steady 30% push surplus is the point
 *     where the "bench-heavy, row-light" pattern becomes a posterior-chain
 *     under-load worth correcting — below that is normal session-to-session noise.
 *   - Quad/Ham 1.5: knee-health work (H:Q strength ratio ≈0.6, i.e. quad:ham ≈1.5
 *     as the upper edge of healthy) — a quad surplus beyond ~1.5× hamstring volume
 *     is the dominance worth biasing posterior. Quads carry more squat/leg-press
 *     primary load naturally, so the bar is higher than push/pull.
 * These are VOLUME-balance heuristics for biasing the plan — NOT a clinical
 * strength-ratio diagnosis.
 */

/**
 * Aggregate per-group working-set volume over the lookback. One set is counted
 * per logged set row whose exercise's PRIMARY heads fall into a Big-11 RO group
 * — the SAME aggregation getLaggingMuscles uses (exercise→group mapping is the
 * muscleMap source of truth, not reinvented). Pure.
 *
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs
 * @param {number} cutoff - earliest ts (ms) to include
 * @returns {Record<string, number>} Big-11 RO group → sets in window
 */
function setsPerGroup(logs, cutoff) {
  const headMap = /** @type {Record<string, string[]>} */ (GROUP_HEAD_MAP_BIG11);
  const exMap = /** @type {Record<string, {primary?: string[], secondary?: string[]}>} */ (EXERCISE_MUSCLES);
  /** @type {Record<string, number>} */
  const counts = {};
  for (const g of Object.keys(headMap)) counts[g] = 0;
  for (const log of logs || []) {
    if (!log || log.baseline || !log.ex) continue;
    const ts = log.ts || (log.date ? new Date(log.date).getTime() : 0);
    if (ts < cutoff) continue;
    const muscles = exMap[log.ex];
    if (!muscles) continue;
    /** @type {Set<string>} */
    const touched = new Set();
    for (const head of muscles.primary || []) {
      for (const [g, heads] of Object.entries(headMap)) {
        if (heads.includes(head)) touched.add(g);
      }
    }
    touched.forEach((g) => { counts[g] = (counts[g] ?? 0) + 1; });
  }
  return counts;
}

/**
 * Sum a side's constituent Big-11 RO groups' set counts.
 * @param {Record<string, number>} counts
 * @param {ReadonlyArray<string>} side - Big-11 RO group ids
 * @returns {number}
 */
function sideVolume(counts, side) {
  let total = 0;
  for (const g of side) total += counts[g] ?? 0;
  return total;
}

/**
 * Detect antagonist/pattern volume imbalances from training history. Pure +
 * deterministic (inject `now`). Returns one entry per FLAGGED pair (a pair with
 * insufficient data or a balanced ratio is OMITTED — empty array = balanced /
 * no-data, the graceful path).
 *
 * The returned `laggingGroups` are the Big-11 RO groups whose budgets the
 * adapter should raise toward parity; `severity` (≥0) scales the correction
 * (0 at the threshold edge, growing as the ratio worsens, capped at 1 = full
 * parity).
 *
 * @param {{ logs?: Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>, lookbackDays?: number, now?: number } | null | undefined} profile
 *   logs = flattened recovery LogEntry rows; lookbackDays default 14; now default Date.now (inject for tests)
 * @returns {Array<{
 *   pair: string,
 *   dominantSide: ReadonlyArray<string>,
 *   laggingSide: ReadonlyArray<string>,
 *   laggingGroups: ReadonlyArray<string>,
 *   ratio: number,
 *   dominantVolume: number,
 *   laggingVolume: number,
 *   severity: number,
 * }>}
 */
export function detectImbalances(profile) {
  const logs = profile?.logs || [];
  const lookbackDays = profile?.lookbackDays ?? 14;
  const injectedNow = profile?.now;
  const now = Number.isFinite(injectedNow) ? /** @type {number} */ (injectedNow) : Date.now();
  const cutoff = now - lookbackDays * MS_PER_DAY;

  const counts = setsPerGroup(logs, cutoff);
  const out = [];

  for (const pair of PAIRS) {
    const volA = sideVolume(counts, pair.sideA);
    const volB = sideVolume(counts, pair.sideB);

    // Insufficient data on EITHER side → ratio undefined → NO correction.
    if (volA < MIN_SIDE_SETS || volB < MIN_SIDE_SETS) continue;

    // Dominant = larger-volume side; lagging = the side we add volume to.
    const aDominant = volA >= volB;
    const dominantVolume = aDominant ? volA : volB;
    const laggingVolume = aDominant ? volB : volA;
    const dominantSide = aDominant ? pair.sideA : pair.sideB;
    const laggingSide = aDominant ? pair.sideB : pair.sideA;

    const ratio = dominantVolume / laggingVolume;
    if (ratio <= pair.dominantThreshold) continue; // balanced → NO change

    // Severity ∈ (0, 1]: 0 at the threshold edge, →1 as the ratio worsens.
    // Normalized by the head-room from threshold to a 2× imbalance (a clear
    // upper bound on how far we bias in one shot), clamped to 1 (full parity).
    const severity = Math.min(
      1,
      (ratio - pair.dominantThreshold) / (2 - pair.dominantThreshold + 1e-9),
    );

    out.push({
      pair: pair.id,
      dominantSide,
      laggingSide,
      laggingGroups: laggingSide,
      ratio: parseFloat(ratio.toFixed(3)),
      dominantVolume,
      laggingVolume,
      severity: parseFloat(severity.toFixed(3)),
    });
  }

  return out;
}

/**
 * Apply imbalance correction to an EN-keyed weekly volume budget. For each
 * flagged pair, the lagging side's group budgets are raised toward parity with
 * the dominant side, proportional to severity, HARD-capped at each group's
 * Israetel MRV. The dominant side is NEVER lowered (additive correction only).
 *
 * The budget is EN-keyed (chest/back/...); the detector's lagging groups are
 * Big-11 RO — each is bridged to EN (BIG11_RO_TO_EN_MAP) to look up its budget
 * entry + MRV (ISRAETEL_BASELINES, EN-keyed). Returns a NEW map. No flagged
 * imbalances → the map is returned unchanged (graceful degradation, ADR 025).
 * Pure.
 *
 * Parity target per group: the lagging side, summed, should reach
 *   targetLaggingTotal = laggingVolume + (dominantVolume − laggingVolume) × severity
 * Each lagging group is scaled by the SAME ratio (targetLaggingTotal /
 * laggingVolume) so the side closes the gap proportionally, then clamped to MRV.
 * "Volume" here is the historical set count that defined the imbalance; the
 * budget entries are sets/week — we apply the same proportional uplift to the
 * budget so the correction is unit-consistent (a side trained X% under target
 * gets its budget raised by the parity factor).
 *
 * @param {Object<string, number>|null|undefined} volumeMapEN - Big-11 EN budget
 * @param {ReturnType<typeof detectImbalances>} imbalances - flagged pairs
 * @returns {Object<string, number>|null} corrected EN-keyed budget (null passes through)
 */
export function applyImbalanceCorrection(volumeMapEN, imbalances) {
  if (!volumeMapEN || typeof volumeMapEN !== 'object') return volumeMapEN ?? null;
  if (!Array.isArray(imbalances) || imbalances.length === 0) return { ...volumeMapEN };

  const out = { ...volumeMapEN };

  for (const imb of imbalances) {
    const { laggingGroups, dominantVolume, laggingVolume, severity } = imb;
    if (!Array.isArray(laggingGroups) || laggingGroups.length === 0) continue;
    if (!(laggingVolume > 0) || !(dominantVolume > laggingVolume)) continue;

    // Parity factor: how much to scale the lagging side UP. severity scales how
    // far toward full parity (dominant volume) we move. Always ≥ 1 (never lowers).
    const targetLaggingTotal =
      laggingVolume + (dominantVolume - laggingVolume) * CORRECTION_STRENGTH * severity;
    const parityFactor = targetLaggingTotal / laggingVolume;
    if (!(parityFactor > 1)) continue;

    for (const roGroup of laggingGroups) {
      const enKey = BIG11_RO_TO_EN_MAP[roGroup] ?? roGroup;
      const current = out[enKey];
      const mrv = ISRAETEL_BASELINES[enKey]?.MRV;
      if (typeof current !== 'number' || !Number.isFinite(current) || current <= 0) continue;
      if (typeof mrv !== 'number' || !Number.isFinite(mrv)) continue;
      if (current >= mrv) continue; // already at/above ceiling — never lower it
      const raised = current * parityFactor;
      out[enKey] = Math.min(mrv, raised); // HARD MRV cap — never exceed
    }
  }

  return out;
}
