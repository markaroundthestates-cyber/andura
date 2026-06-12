// ══ WARM-UP RAMP — per-set ascending primer for the day's opening compound ═════
// Daniel coach audit (design pass 2026-06-10): the engine emits only a session-level
// warm-up LINE ({line, durationMin} — "Incalzire ~X min"). A real coach ramps the
// FIRST heavy compound with ascending primer sets (50% × 10 → 70% × 6 → 90% × 3) so
// the working set isn't the first time the bar moves under real load. This module is
// the single, pure, deterministic source for that ramp.
//
// SCOPE (a coach's judgement, encoded as thresholds):
//   - Ramp ONLY the OPENING compound (the session's lead tier-1 lift). Accessories /
//     isolations / anything after the first lift don't get a per-set ramp — they
//     inherit warmth from the compound + their own first working set.
//   - Ramp ONLY when the WORKING load justifies the ceremony. A 12kg lateral raise or
//     a 20kg empty-bar movement needs no 50/70/90 ladder — the working set itself is
//     the warm-up. Three bands:
//       * workingKg <  NO_RAMP_KG (25)  → [] (no ramp: load ~= empty bar / light iso;
//                                          the first working set IS the primer).
//       * NO_RAMP_KG ≤ workingKg < MIN_RAMP_KG (40) → ONE primer set (50% × 10): a
//                                          single movement-pattern rehearsal, no
//                                          3-step ladder for a light load.
//       * MIN_RAMP_KG ≤ workingKg < HEAVY_KG (60) → TWO steps (50% × 10, 70% × 6):
//                                          a moderate load doesn't need a near-working
//                                          triple as "warm-up" (drop the 90% step).
//       * workingKg ≥ HEAVY_KG (60)     → THREE steps (50% × 10, 70% × 6, 90% × 3):
//                                          a heavy lift earns the full neurological
//                                          ramp incl. a near-max primer single-ish set.
//
// THRESHOLD RATIONALE (verifiable against config/weights.js ladders):
//   - Empty olympic bar = 20kg (EQUIPMENT_WEIGHTS.barbell_heavy[0] / barbell_plates[0]).
//     NO_RAMP_KG = 25 sits just above it: at/below ~one increment over the empty bar
//     there is nothing to ramp toward.
//   - MIN_RAMP_KG = 40 ≈ 2× empty bar (~one plate/side). Below this a full ladder is
//     noise; a single 50% primer keeps the movement rehearsal honestly.
//   - HEAVY_KG = 60 is where a 90% primer becomes a genuine CNS prep rather than a
//     near-working triple disguised as warm-up.
//
// SNAPPING: every primer weight is snapped to the SAME equipment ladder the working
// set uses (roundToEquipmentWeight(kg, name) — the 2-arg legacy/generic path, byte-
// identical, flag-independent), so a primer is a weight that actually exists on the
// rack/stack (no "42.5kg" on a 5kg pin). Dedup-after-snap: if two %-steps snap to the
// same physical weight (common at low loads on coarse stacks), keep one.
//
// PURE + DETERMINISTIC + ZERO THROW: same workingKg + name → identical array. A bad
// input (non-finite / ≤ 0 workingKg, non-string name) → [] (no ramp), never throws.
// INERT BY DEFAULT: this module computes a ramp but the COMPOSER attaches it behind a
// flag (dp_warmup_ramp_v1, default OFF), so wiring it changes no current output.

import { roundToEquipmentWeight } from '../config/weights.js';
import { getExerciseMetadata } from './exerciseLibrary.js';

// ── Thresholds (kg of WORKING load) — see header rationale ──────────────────────
/** At/below this the working set is itself the primer → no ramp. */
export const NO_RAMP_KG = 25;
/** Below this → a single 50% primer set (no full ladder). */
export const MIN_RAMP_KG = 40;
/** At/above this → the 90% step is included (full 3-step ramp). */
export const HEAVY_KG = 60;

// ── SHOULDER / OVERHEAD gentler ramp (founder live 2026-06-12, _LADDER_SNAP) ────
// The 25/40/60 bands + 50/70/90 % are calibrated against the BARBELL bench/squat
// (empty bar 20kg). Overhead pressing is a SMALL movement with lighter working loads
// and a vulnerable shoulder/cuff entry, so the bench ladder rides too steep: the
// founder's Smith OHP (he works ~25-30) got a 50%×10 → 70%×6 primer toward an
// inflated coldstart, felt brutal. For an overhead/shoulder LEAD lift:
//   - NO_RAMP floor raised to OHP_NO_RAMP_KG (40): an overhead working set ≤40kg IS
//     its own warm-up (no separate ramp), so a sane ~25-30 OHP gets none at all.
//   - the first primer drops to OHP_FIRST_PCT (40%) — a gentler movement rehearsal
//     than 50% for the small muscles.
//   - depth caps at 2 (no near-max 90% triple on a press the rotator cuff guards).
/** Overhead/shoulder lead: at/below this the working set is itself the primer. */
export const OHP_NO_RAMP_KG = 40;
/** Overhead/shoulder lead: gentler first-primer percentage (vs 50% for a barbell). */
const OHP_FIRST_PCT = 40;
/** Overhead/shoulder lead: max ramp depth (drop the 90% near-max step). */
const OHP_MAX_DEPTH = 2;

/**
 * Is this lead lift an overhead/shoulder press (gentler ramp)? By the library's
 * primary muscle group (umeri) — robust across the many OHP/press variants. Defensive:
 * bad name / missing metadata → false (the standard barbell ramp). @param {string} name
 */
function isOverheadLead(name) {
  if (typeof name !== 'string' || !name) return false;
  let m;
  try { m = getExerciseMetadata(name); } catch { return false; }
  return !!m && m.muscle_target_primary === 'umeri';
}

// ── Standard ramp steps (percent of working load + a target rep count) ──────────
// Ordered light→heavy. `tier` marks how heavy the working load must be for the step
// to apply: 1 = always (once any ramp fires), 2 = moderate+, 3 = heavy only.
const RAMP_STEPS = [
  { pct: 50, reps: 10, minTier: 1 },
  { pct: 70, reps: 6, minTier: 2 },
  { pct: 90, reps: 3, minTier: 3 },
];

/**
 * How many ramp steps the working load earns (0 / 1 / 2 / 3).
 * @param {number} workingKg
 * @param {boolean} [overhead] overhead/shoulder lead → gentler (no-ramp ≤40, cap 2)
 * @returns {0|1|2|3}
 */
function rampDepth(workingKg, overhead) {
  if (overhead) {
    // Overhead/shoulder: a ≤40kg press IS its own warm-up; otherwise cap at 2 steps
    // (never the 90% near-max triple on a cuff-guarded press).
    if (workingKg < OHP_NO_RAMP_KG) return 0;
    if (workingKg < HEAVY_KG) return 1; // single gentle primer (40-60kg overhead)
    return /** @type {2} */ (OHP_MAX_DEPTH); // 60kg+ overhead → two steps, no 90%
  }
  if (workingKg < NO_RAMP_KG) return 0;
  if (workingKg < MIN_RAMP_KG) return 1; // single 50% primer
  if (workingKg < HEAVY_KG) return 2; // 50% + 70%
  return 3; // full 50/70/90
}

/**
 * Build the per-set warm-up ramp for the day's OPENING compound.
 *
 * @param {number} workingKg the prescribed WORKING load (already equipment-snapped)
 * @param {object} [opts]
 * @param {string} [opts.exerciseName] ENGLISH canonical name — used to snap each
 *   primer to the exercise's equipment ladder. Omitted/blank → primers are still
 *   returned but rounded to the nearest 0.5kg (generic), since no ladder is known.
 * @returns {Array<{kg:number, reps:number, pct:number}>} light→heavy primer sets, or
 *   [] when the working load doesn't justify a ramp / input is invalid. Never throws.
 */
export function warmupRampFor(workingKg, opts) {
  // Strict: only an actual finite positive number ramps. A numeric string ('100')
  // or any non-number is a caller bug → [] (never coerce, never throw).
  if (typeof workingKg !== 'number' || !Number.isFinite(workingKg) || workingKg <= 0) return [];
  const kg = workingKg;

  const name = opts && typeof opts.exerciseName === 'string' ? opts.exerciseName : '';
  // Overhead/shoulder presses get a gentler ramp (higher no-ramp floor, gentler first
  // %, depth cap 2). Resolved from the lead's primary muscle group; no name → standard.
  const overhead = isOverheadLead(name);

  const depth = rampDepth(kg, overhead);
  if (depth === 0) return [];
  // Snap each primer to the SAME ladder the working set uses (so the primer is a real
  // rack/stack weight). No name → nearest 0.5kg (a sane generic for a barbell add).
  const snap = (w) => {
    if (name) {
      const snapped = roundToEquipmentWeight(w, name);
      if (Number.isFinite(snapped) && snapped > 0) return snapped;
    }
    return Math.round(w * 2) / 2;
  };

  /** @type {Array<{kg:number, reps:number, pct:number}>} */
  const out = [];
  let lastKg = null;
  for (const step of RAMP_STEPS) {
    if (depth < step.minTier) continue;
    // Overhead/shoulder: gentler first primer (40% vs 50%) — a lighter movement
    // rehearsal for the small, cuff-guarded muscles. Later steps keep their %.
    const pct = overhead && step.minTier === 1 ? OHP_FIRST_PCT : step.pct;
    const primerKg = snap((kg * pct) / 100);
    // Guard: a primer must be a real load (> 0) and strictly below the working set —
    // on a coarse stack a high % can snap up to the working weight (then it isn't a
    // warm-up). Also dedup when two %-steps snap to the same physical weight.
    if (!(primerKg > 0) || primerKg >= kg) continue;
    if (lastKg !== null && primerKg === lastKg) continue;
    out.push({ kg: primerKg, reps: step.reps, pct });
    lastKg = primerKg;
  }
  return out;
}
