// ══ LOAD MODEL (metadata-derived caps + steps) ══════════════════════════════
//
// R5 (Daniel coach audit 2026-06-10, "Y Raise 25 kg pare suspect / ego-load").
// The curated load surfaces in dp.js (MAX_KG, WEIGHT_STEPS) were re-keyed to
// canonical names at audit F-1, but they only enumerate ~60 staples. Every
// OTHER exercise (Y Raise, Hip Abduction Machine, Smith Machine Shrug, Machine
// Pullover, Hammer Curl, 45° Hyperextension, ...) has NO defensive cap → the
// double-progression climbs it without the "switch to reps at the plafon"
// brake (dp.js:1606 keys the brake solely on a present maxKg), and NO equipment
// step → the generic 2.5 increment even on 5kg machine stacks.
//
// Derive both from the exercise's OWN metadata (muscle_target_primary ×
// equipment_type × class), so all 657 get a brake + a realistic step. Same
// derivation philosophy as dp/repRange.js. Curated entries always WIN; the
// derived value only fills the gaps. Caps are DEFENSIVE — set above realistic
// strong-lifter loads so they clip only absurd values (founder F-1 convention),
// while isolation caps mirror the founder's curated neighbours (DB lateral 18,
// cable lateral 25-30) so an unlisted shoulder raise stops ego-loading.
//
// NOTE (honest): dp.js WEIGHT_CAP_STRATEGY is read into an unused `_capStrategy`
// — the at-cap behavior is driven ONLY by MAX_KG presence. We therefore derive
// the CAP, not the dead strategy field.
//
// Pure functions — caller passes metadata; no I/O.

import { isHighFatigueCompound } from './repRange.js';

/** @typedef {{ tier?: number, force_demand?: string, muscle_target_primary?: string, equipment_type?: string }} ExMeta */

// Defensive ISOLATION caps per muscle × equipment (kg on the implement: per-hand
// for dumbbells, stack pin for cables/machines). Mirror the curated neighbours.
const ISO_CAPS = /** @type {Record<string, Record<string, number>>} */ ({
  //            dumbbell cable machine barbell default
  'umeri':               { dumbbell: 18, cable: 30, machine: 40, barbell: 30, default: 25 },
  'biceps':              { dumbbell: 25, cable: 40, machine: 60, barbell: 50, default: 40 },
  'triceps':             { dumbbell: 45, cable: 70, machine: 120, barbell: 60, default: 60 },
  'piept':               { dumbbell: 30, cable: 60, machine: 100, barbell: 60, default: 60 },
  // spate isolations span pullovers (moderate) to shrugs (legitimately heavy).
  'spate':               { dumbbell: 60, cable: 90, machine: 180, barbell: 180, default: 100 },
  'fese':                { dumbbell: 60, cable: 40, machine: 150, barbell: 120, default: 120 },
  'picioare-quads':      { machine: 180, default: 160 },
  'picioare-hamstrings': { machine: 180, default: 160 },
  'gambe':               { dumbbell: 50, cable: 100, machine: 250, barbell: 250, default: 200 },
  'core':                { dumbbell: 40, cable: 80, machine: 100, default: 60 },
  'antebrate':           { dumbbell: 30, cable: 50, machine: 60, barbell: 80, default: 60 },
});

// Defensive COMPOUND ceilings per muscle (above world-class training loads —
// clip only absurd; the dp_ceiling_v1 derived e1RM ceiling stays the smart cap,
// this is the flat floor-of-last-resort the F-1 convention gives mapped lifts).
const COMPOUND_CAPS = /** @type {Record<string, number>} */ ({
  'picioare-quads': 400,
  'picioare-hamstrings': 360,
  'fese': 360,
  'spate': 250,
  'piept': 220,
  'umeri': 150,
  'gambe': 250,
  'core': 100,
  'biceps': 80,
  'triceps': 120,
  'antebrate': 80,
});

// Dumbbell loads are PER HAND → a compound pressed with dumbbells carries a far
// smaller implement number than the barbell ceiling; cables similar but less so.
const COMPOUND_EQUIP_FACTOR = /** @type {Record<string, number>} */ ({
  dumbbell: 0.35,
  cable: 0.60,
});

/**
 * Metadata-derived defensive MAX-KG for an exercise with no curated MAX_KG.
 * Isolation → the muscle×equipment table; compound → the muscle ceiling damped
 * by equipment. No metadata → null (legacy unbounded — never guess blind).
 *
 * @param {ExMeta | null | undefined} meta
 * @returns {number | null}
 */
export function deriveMaxKg(meta) {
  if (!meta || !meta.muscle_target_primary) return null;
  const m = meta.muscle_target_primary;
  const eq = meta.equipment_type || 'default';
  if (!isHighFatigueCompound(meta)) {
    const row = ISO_CAPS[m];
    if (!row) return null;
    return row[eq] ?? row.default ?? null;
  }
  const base = COMPOUND_CAPS[m];
  if (base == null) return null;
  const f = COMPOUND_EQUIP_FACTOR[eq];
  return f ? Math.round(base * f) : base;
}

// Equipment-derived weight step (one real increment on that implement).
const EQUIP_STEPS = /** @type {Record<string, number>} */ ({
  machine: 5,
  cable: 2.5,
  dumbbell: 2,
  barbell: 2.5,
  band: 2.5,
  bodyweight: 2.5, // added-load (vest/belt) steps
});

/**
 * Resolve the effective flat MAX_KG: curated wins; flag-ON fills the gap from
 * metadata; OFF → curated-or-null (byte-identical legacy).
 *
 * @param {Object} input
 * @param {number | undefined} input.curated MAX_KG[ex]
 * @param {ExMeta | null | undefined} input.meta
 * @param {boolean} input.flagOn isEnabled('dp_load_model_v1')
 * @returns {number | null}
 */
export function resolveMaxKg({ curated, meta, flagOn }) {
  if (curated != null) return curated;
  if (!flagOn) return null;
  return deriveMaxKg(meta);
}

/**
 * Resolve the per-step increment: curated WEIGHT_STEPS wins; flag-ON derives
 * from equipment_type; OFF → legacy flat 2.5.
 *
 * @param {Object} input
 * @param {number | undefined} input.curated WEIGHT_STEPS[ex]
 * @param {ExMeta | null | undefined} input.meta
 * @param {boolean} input.flagOn
 * @returns {number}
 */
export function resolveStep({ curated, meta, flagOn }) {
  if (curated != null) return curated;
  if (!flagOn || !meta) return 2.5;
  return EQUIP_STEPS[meta.equipment_type || ''] ?? 2.5;
}
