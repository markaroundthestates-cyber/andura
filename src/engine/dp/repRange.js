// ══ REP-RANGE RESOLVER (metadata-derived) ═══════════════════════════════════
//
// Root-cause fix for the "izolari la 8-10 in loc de 12-20" report (Daniel
// 2026-06-10 coach audit). The curated DP.REP_RANGES map is keyed on the OLD
// ~143-name vocabulary ('Lateral Raises', 'Pec Deck / Cable Fly', 'Overhead
// Triceps'). The live app now selects from the Wave-2 library (657, exercises.json)
// whose canonical names differ ('Cable Lateral Raise', 'Cable Fly', 'Cable
// Overhead Triceps Extension Rope', 'Y Raise', ...). None of the new names hit
// the curated keys, so every new-library exercise fell through to a flat [8,12]
// default — the carefully-built per-exercise ranges were DARK for exactly the
// exercises users train. Same name-seam class as the prior DP name-key bug
// (b32abac3); the #6 alias map resolves legacy→canonical, which is the reverse
// direction of this lookup (REP_RANGES keys ARE the legacy names).
//
// Instead of a brittle alias table, derive a class-aware base range from each
// exercise's OWN metadata (muscle_target_primary + tier + force_demand), which
// scales to all 657 automatically. Curated REP_RANGES still wins when present
// (precedence: explicit > derived), so the ~40 hand-tuned ranges are unchanged.
//
// Hybrid policy (Daniel spec 2026-06-10): exercise class defines the base; goal
// shifts the center (handled downstream — forta unclamp, masa default); phase
// (CUT) reduces VOLUME (sets) NOT reps, so we no longer crush isolations to 10
// in a cut — "class wins when the goal/phase cap would create a bad prescription".
//
// Pure functions — no I/O, no clock. Caller passes the metadata record.

/** @typedef {{ tier?: number, force_demand?: string, muscle_target_primary?: string }} ExMeta */

// muscle_target_primary tokens that are isolation/high-rep regardless of how the
// library tagged tier/force_demand. The library mistags some movements as heavy
// compounds — e.g. Standing Calf Raise Machine is tier=1/force=high (7 of 33
// calf entries are t1/high), forearms + core are tagged inconsistently. These
// are single-joint, high-rep by physiology, so muscle overrides the (mis)tier.
const ISO_OVERRIDE_MUSCLES = new Set(['gambe', 'antebrate', 'core']);

// Arm isolations: essentially always tier-2 single-joint (biceps 46/47 t2,
// triceps 34/42 t2). Moderate-rep isolation band.
const ARM_MUSCLES = new Set(['biceps', 'triceps']);

/**
 * True when an exercise is a high-fatigue compound — the only class CUT should
 * keep on the lower rep band. Calves/forearms/core are excluded even at a
 * mistagged tier=1/force=high (they are not systemically fatiguing).
 *
 * @param {ExMeta | null | undefined} meta
 * @returns {boolean}
 */
export function isHighFatigueCompound(meta) {
  if (!meta) return false;
  const m = meta.muscle_target_primary || '';
  if (ISO_OVERRIDE_MUSCLES.has(m) || ARM_MUSCLES.has(m)) return false;
  return meta.tier === 1 || meta.force_demand === 'high';
}

/**
 * Class label for an exercise from its metadata. Used for the CUT rep policy
 * and for decision-trace transparency.
 *
 * @param {ExMeta | null | undefined} meta
 * @returns {'compound' | 'isolation'}
 */
export function deriveExerciseClass(meta) {
  return isHighFatigueCompound(meta) ? 'compound' : 'isolation';
}

/**
 * Derive a hypertrophy-default base rep range from exercise metadata. Big movers
 * split by tier (heavy compound vs accessory/isolation work on the same muscle);
 * small muscles use a fixed isolation band that ignores tier mistags.
 *
 * @param {ExMeta | null | undefined} meta
 * @returns {[number, number]}
 */
export function deriveBaseRepRange(meta) {
  if (!meta) return [8, 12]; // no metadata → legacy neutral default
  const m = meta.muscle_target_primary || '';

  // Small / single-joint muscles — high-rep isolation regardless of (mis)tier.
  if (m === 'gambe') return [12, 20];       // calves (lib mistags as t1/high)
  if (m === 'antebrate') return [12, 20];   // forearms
  if (m === 'core') return [12, 20];        // abs
  if (ARM_MUSCLES.has(m)) return [10, 15];  // biceps / triceps

  // Big movers: a heavy compound (tier 1 / high force) is the low-rep band.
  if (meta.tier === 1 || meta.force_demand === 'high') return [6, 10];

  // tier 2/3 accessory-isolation work on a big muscle — high-rep by muscle.
  switch (m) {
    case 'umeri': return [12, 20];               // lateral / rear-delt / Y raise
    case 'piept': return [12, 15];               // fly
    case 'spate': return [12, 15];               // pullover / straight-arm
    case 'picioare-quads': return [15, 20];      // leg extension
    case 'picioare-hamstrings': return [15, 20]; // leg curl
    case 'fese': return [12, 20];                // hip abduction / kickback
    default: return [10, 15];
  }
}

/**
 * Resolve the effective rep range for an exercise under the hybrid policy.
 *
 *   precedence: curated REP_RANGES override → metadata-derived base
 *   CUT: leaves isolation ranges intact (volume, not reps, carries the deficit);
 *        only a high-fatigue compound stays on its already-low base band.
 *
 * Goal shifts (forta 3-6, etc.) are applied DOWNSTREAM by the existing DP
 * progression logic — this resolver supplies the hypertrophy-default base.
 *
 * @param {Object} input
 * @param {[number, number] | undefined} input.curated curated REP_RANGES[ex] or undefined
 * @param {ExMeta | null | undefined} input.meta getExerciseMetadata(ex)
 * @param {boolean} [input.isInCut]
 * @returns {[number, number]}
 */
export function resolveRepRange({ curated, meta, isInCut: _isInCut }) {
  // Curated hand-tuned range wins when present (the ~40 known exercises).
  const base = (Array.isArray(curated) && curated.length === 2)
    ? /** @type {[number, number]} */ (curated)
    : deriveBaseRepRange(meta);
  // CUT no longer crushes isolation reps to 10 (the old getPhaseAwareRepRange
  // cut-cap). The deficit is carried by volume (sets) per the volume engine, so
  // an isolation keeps its high-rep stimulus and a compound keeps its low base.
  return base;
}

/**
 * Byte-identical pre-feature rep range: curated-or-[8,12], CUT caps 11-15-max
 * non-compound isolations at 10.
 *
 * @param {[number, number] | undefined} curated
 * @param {boolean} isInCut
 * @param {boolean} isLegacyCompound COMPOUND_EX.includes(ex)
 * @returns {number[]}
 */
function legacyRepRange(curated, isInCut, isLegacyCompound) {
  const range = curated || [8, 12];
  if (!isInCut) return range;
  const [rMin, rMax] = range;
  if (rMax != null && rMax > 10 && rMax <= 15 && !isLegacyCompound) return [Math.min(rMin ?? 8, 10), 10];
  return range;
}

/**
 * Full phase-aware dispatch — BOTH flag arms — extracted here so the dp.js
 * moratorium holds (DP.getPhaseAwareRepRange stays a thin shim).
 *
 * SURGICAL SCOPE (Daniel coach audit 2026-06-10): the flag touches ONLY
 * ISOLATIONS — the complaint was isolations shown at 8-10 instead of 12-20.
 * Compounds keep their EXACT legacy range (byte-identical ON vs OFF) so there is
 * no cross-flag interaction with the forta clamp (which floors to rMin) and no
 * compound rep shift. An isolation gets its class-aware band (curated > derived)
 * and is NOT cut-capped — the deficit is carried by volume, not by crushing the
 * isolation rep stimulus (Daniel point #5: "CUT reduces sets, not reps").
 *
 * @param {Object} input
 * @param {[number, number] | undefined} input.curated curated REP_RANGES[ex]
 * @param {ExMeta | null | undefined} input.meta getExerciseMetadata(ex)
 * @param {boolean} input.isInCut
 * @param {boolean} input.flagOn isEnabled('dp_rep_class_v1')
 * @param {boolean} input.isLegacyCompound COMPOUND_EX.includes(ex)
 * @returns {number[]}
 */
export function phaseAwareRepRange({ curated, meta, isInCut, flagOn, isLegacyCompound }) {
  if (!flagOn) return legacyRepRange(curated, isInCut, isLegacyCompound);
  // FLAG ON — compounds + meta-less names stay on the exact legacy path; only an
  // isolation with metadata gets the uncapped class-aware band.
  if (!meta || isHighFatigueCompound(meta)) return legacyRepRange(curated, isInCut, isLegacyCompound);
  return resolveRepRange({ curated, meta, isInCut });
}
