// Cluster 4 — Training Modifiers per Template × Phase per ADR 026 §9.2.4 verbatim.
//
// Tabel base training modifiers per template × phase tuple (Source 1 line 46):
//   Forța & Dezvoltare:   RIR 1-3, rep 3-8
//   Tonifiere & Definire: RIR 0-2, rep 8-12
//   Slăbire:              RIR 1-2, rep 10-15
//   Longevitate:          RIR 2-3, rep 8-12
//   Sănătate Generală:    RIR 2-3, rep 8-12
//
// Mode overlay Estetică / Forță post-template × phase multiplicativ (NU
// duplicate templates) per §9.2.4 verbatim.
//
// Mode + Phase combined ceiling rule per §9.2.6 Reconsideration Trigger 4:
//   Max −20% volume / +20% intensity (anti-degenerate cumulative reduction
//   violating Invariant 1 V ≤ MRV / +20% ceiling).
//
// Pure functions — no side effects.

import {
  TEMPLATE_BASE_MODIFIERS,
  TEMPLATE_REST_SECONDS,
  PHASE_TRAINING_MODIFIERS,
  MODE_OVERLAY,
  MODE_PHASE_CEILING,
} from './constants.js';

/**
 * Resolve mode overlay id from ctx (case-insensitive).
 *
 * @param {{mode?: string}} [user]
 * @returns {'estetica'|'forta'|'none'}
 */
export function resolveModeOverlay(user) {
  if (!user || typeof user.mode !== 'string') return 'none';
  const m = user.mode.toLowerCase();
  if (m === 'estetica' || m === 'estetică') return 'estetica';
  if (m === 'forta' || m === 'forță' || m === 'forta_dezvoltare') return 'forta';
  return 'none';
}

/**
 * Compute rep range modifier per (template, phase) × mode overlay.
 *
 * Apply order: base table → phase modifier (rep ceiling shift) → mode overlay
 * (rep range shift) → final integer pair [min, max] cu min ≥ 1.
 *
 * @param {Object} input
 * @param {string} input.templateId
 * @param {import('./types.js').NutritionPhase} input.phase
 * @param {'estetica'|'forta'|'none'} input.mode
 * @returns {[number, number]}
 */
export function computeRepRangeModifier({ templateId, phase, mode }) {
  const base = TEMPLATE_BASE_MODIFIERS[templateId];
  if (!base) return [8, 12]; // defensive default Tonifiere band
  const baseRep = base.rep;

  const phaseMod = PHASE_TRAINING_MODIFIERS[phase] ?? PHASE_TRAINING_MODIFIERS.MAINTAIN;
  const modeMod = MODE_OVERLAY[mode] ?? MODE_OVERLAY.none;

  // Apply phase rep ceiling shift + mode rep range shift
  const min = Math.max(1, baseRep[0]);
  const max = Math.max(min, baseRep[1] + phaseMod.repShift + modeMod.repRangeShift);

  return [min, max];
}

/**
 * Compute RIR target modifier per (template, phase) × mode overlay.
 *
 * RIR floor preserved (NU push closer to failure pe DELOAD). Apply mode
 * rirShift integer additive.
 *
 * @param {Object} input
 * @param {string} input.templateId
 * @param {import('./types.js').NutritionPhase} input.phase
 * @param {'estetica'|'forta'|'none'} input.mode
 * @returns {[number, number]}
 */
export function computeRirTargetModifier({ templateId, phase, mode }) {
  const base = TEMPLATE_BASE_MODIFIERS[templateId];
  if (!base) return [1, 2]; // defensive default
  const baseRir = base.rir;

  const modeMod = MODE_OVERLAY[mode] ?? MODE_OVERLAY.none;

  const floor = Math.max(0, baseRir[0] + modeMod.rirShift);
  const ceiling = Math.max(floor, baseRir[1] + modeMod.rirShift);

  return [floor, ceiling];
}

/**
 * Compute rest time modifier per template × phase × mode.
 *
 * Apply order: base table per template → phase rest shift → mode overlay
 * (intensity multiplier proxy). Floor at 30s defensive.
 *
 * @param {Object} input
 * @param {string} input.templateId
 * @param {import('./types.js').NutritionPhase} input.phase
 * @param {'estetica'|'forta'|'none'} input.mode
 * @returns {[number, number]}
 */
export function computeRestTimeModifier({ templateId, phase, mode }) {
  const baseRest = TEMPLATE_REST_SECONDS[templateId];
  if (!baseRest) return [60, 120]; // defensive default

  const phaseMod = PHASE_TRAINING_MODIFIERS[phase] ?? PHASE_TRAINING_MODIFIERS.MAINTAIN;
  const modeMod = MODE_OVERLAY[mode] ?? MODE_OVERLAY.none;

  // Mode intensity emphasis → longer rest; volume emphasis → shorter rest
  // intensityMul > 1 → +rest seconds proportional
  const modeRestShift = Math.round((modeMod.intensityMul - 1) * 60);

  const min = Math.max(30, baseRest[0] + phaseMod.restShift + modeRestShift);
  const max = Math.max(min, baseRest[1] + phaseMod.restShift + modeRestShift);

  return [min, max];
}

/**
 * Compute combined volume + intensity multipliers per Mode × Phase (capped per
 * §9.2.6 Reconsideration Trigger 4 ceiling rule: max −20% volume / +20% intensity).
 *
 * Used by crossEngineHooks to redistribute volume INTERIOR Periodization
 * Constraint Object Floor/Ceiling per §1.10 Pipeline Order LOCKED V1.
 *
 * @param {Object} input
 * @param {import('./types.js').NutritionPhase} input.phase
 * @param {'estetica'|'forta'|'none'} input.mode
 * @returns {{volumeMul: number, intensityMul: number, ceilingApplied: string[]}}
 */
export function computeModePhaseMultipliers({ phase, mode }) {
  const modeMod = MODE_OVERLAY[mode] ?? MODE_OVERLAY.none;
  const ceilingApplied = [];

  // Phase already affects volume/intensity via Periodization Hook 1 — Goal
  // Adaptation only redistributes within corridor. NU stack vol/int phase
  // multiplier here (that's Periodization scope).
  let volumeMul = modeMod.volumeMul;
  let intensityMul = modeMod.intensityMul;

  // Mode + Phase ceiling rule §9.2.6 Trigger 4 candidate
  if (volumeMul < MODE_PHASE_CEILING.volumeFloor) {
    volumeMul = MODE_PHASE_CEILING.volumeFloor;
    ceilingApplied.push('volume_floor_clamped');
  } else if (volumeMul > MODE_PHASE_CEILING.volumeCeiling) {
    volumeMul = MODE_PHASE_CEILING.volumeCeiling;
    ceilingApplied.push('volume_ceiling_clamped');
  }
  if (intensityMul < MODE_PHASE_CEILING.intensityFloor) {
    intensityMul = MODE_PHASE_CEILING.intensityFloor;
    ceilingApplied.push('intensity_floor_clamped');
  } else if (intensityMul > MODE_PHASE_CEILING.intensityCeiling) {
    intensityMul = MODE_PHASE_CEILING.intensityCeiling;
    ceilingApplied.push('intensity_ceiling_clamped');
  }

  return { volumeMul, intensityMul, ceilingApplied };
}
