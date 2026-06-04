// ── Coach Voice: structured adaptations log (the moat made felt) ──────────
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.
//
// The adaptive brain (M1 recovery cut, M2 weakness amp, M3 imbalance fix,
// deload) silently shapes the plan; the user sees only the result. This derives
// a STRUCTURED, machine-readable log of what ACTUALLY changed this session —
// NO copy strings (the React composer turns tokens → a localized sentence;
// engines never emit Romanian copy, i18n leak harness forbids it). Truth-only:
// every entry maps to a real budget delta this run (compare the SAME maps the
// plan was built from), zero fabrication. Empty array when nothing adapted →
// the React side renders no line (graceful).
//
// Each entry: { kind, group?, cause? } where group is a Big-11 RO key (the
// vocabulary getLaggingMuscles / weakGroups use), cause is the recovery-cut
// origin ('aerobic' | 'resistance'). Tolerance guards float noise so a 0.0001
// rounding drift is never reported as a change.

import { BIG11_EN_TO_RO_MAP } from '../../periodization/constants.js';

const ADAPT_EPSILON = 0.01;

/**
 * Derive the structured coach-adaptations log from the SAME maps the plan was
 * built from. Pure — no recompute of the math, only a diff of what changed.
 *
 * @param {object} args
 * @param {Object<string, number>|null} args.baseTargets - pre-adaptation EN budget (periodization)
 * @param {Object<string, number>|null} args.amplifiedTargets - post weakness-amp (M2) EN budget
 * @param {Object<string, number>|null} args.balancedTargets - post imbalance-fix (M3) EN budget
 * @param {Object<string, number>|null} [args.preCutTargets] - budget the recovery cut ran ON (post intra-week makeup); defaults to balancedTargets
 * @param {Object<string, number>|null} args.recoveredTargets - post recovery-cut (M1) EN budget (final)
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} args.resistanceState - RO recovery state (resistance only)
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} args.mergedState - RO recovery state (resistance + aerobic)
 * @param {boolean} args.deloadActive - true when an ACTIVE deload modifier is in play
 * @returns {Array<{kind: 'recovery-cut'|'weakness-amp'|'imbalance-fix'|'deload', group?: string, cause?: 'aerobic'|'resistance'}>}
 */
export function deriveCoachAdaptations({
  baseTargets,
  amplifiedTargets,
  balancedTargets,
  preCutTargets,
  recoveredTargets,
  resistanceState,
  mergedState,
  deloadActive,
}) {
  // The recovery cut runs on the post-makeup budget (intra-week deficit recovery
  // adds volume BEFORE the cut). Compare the FINAL budget against the budget the
  // cut actually ran on, so a made-up group that recovery then trims is still
  // attributed correctly. Defaults to balancedTargets (pre-makeup callers / no
  // makeup → identical to before).
  const cutFromTargets = preCutTargets ?? balancedTargets;
  /** @type {Array<{kind: string, group?: string, cause?: string}>} */
  const out = [];

  // Deload — the highest-salience signal (whole-week lighter on purpose).
  if (deloadActive) out.push({ kind: 'deload' });

  // Recovery cut (M1) — groups whose FINAL budget dropped below the balanced
  // budget. Cause = aerobic when the resistance-only state for that group was
  // 'recovered' but the merged state (with recent cardio) raised it (so the cut
  // is owed to a class, e.g. spinning), else resistance.
  if (cutFromTargets && recoveredTargets) {
    // recoveredTargets is EN-keyed (toCanonicalEN output) — read by EN key.
    for (const [enKey, balanced] of Object.entries(cutFromTargets)) {
      const cut = recoveredTargets[enKey];
      if (typeof balanced !== 'number' || typeof cut !== 'number') continue;
      if (cut < balanced - ADAPT_EPSILON) {
        const roGroup = BIG11_EN_TO_RO_MAP[enKey] ?? enKey;
        const resistance = resistanceState[roGroup] ?? 'recovered';
        const merged = mergedState[roGroup] ?? 'recovered';
        const cause = resistance === 'recovered' && merged !== 'recovered'
          ? 'aerobic'
          : 'resistance';
        out.push({ kind: 'recovery-cut', group: roGroup, cause });
      }
    }
  }

  // Weakness amplification (M2) — groups whose budget was raised above the
  // base periodization budget toward MRV.
  if (baseTargets && amplifiedTargets) {
    for (const [enKey, amp] of Object.entries(amplifiedTargets)) {
      const base = baseTargets[enKey];
      if (typeof base !== 'number' || typeof amp !== 'number') continue;
      if (amp > base + ADAPT_EPSILON) {
        out.push({ kind: 'weakness-amp', group: BIG11_EN_TO_RO_MAP[enKey] ?? enKey });
      }
    }
  }

  // Imbalance correction (M3) — groups raised above the amplified budget to
  // close an antagonist/pattern imbalance.
  if (amplifiedTargets && balancedTargets) {
    for (const [enKey, balanced] of Object.entries(balancedTargets)) {
      const amp = amplifiedTargets[enKey];
      if (typeof amp !== 'number' || typeof balanced !== 'number') continue;
      if (balanced > amp + ADAPT_EPSILON) {
        out.push({ kind: 'imbalance-fix', group: BIG11_EN_TO_RO_MAP[enKey] ?? enKey });
      }
    }
  }

  return out;
}
