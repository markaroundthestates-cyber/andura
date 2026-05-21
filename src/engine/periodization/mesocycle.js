// Cluster 2 — Mesocycle Phase Transitions per ADR 026 §9.3 verbatim.
//
// 2.1 Double progression rep-first → weight sapt (W1 LOAD baseline →
//     W2 LOAD+ → W3 PEAK → W4 DELOAD −45%/−12.5%) per §45.3 Q18 LOCKED + §65.5
// 2.2 Trigger hierarchy: EARLY DELOAD safety > EXTENSION Marius only > CALENDAR
// 2.3 Marius 5:1 dual-signal pure function per §45.4 Q21 §36.82
//     (RIR stable [1,2] ALL 4 weeks AND Energy ZERO red last 3 sessions)
// Anti-abuse: max 2 consecutive extensions + injury history block Invariant 5
//
// All functions PURE — no Date.now, no Math.random, no side effects.

import {
  DELOAD_MULTIPLIERS,
  MARIUS_5_1_THRESHOLDS,
  ANTI_ABUSE,
  ENERGY_RED_FLAG,
} from './constants.js';

/**
 * Compute phase for a given week-in-mesocycle (1..4). Out-of-range coerces
 * to W1 (defensive — engine total function never throws per ADR 018 §2).
 *
 * @param {number} weekInMesocycle - 1..4
 * @returns {import('./types.js').MesocyclePhase}
 */
export function computePhase(weekInMesocycle) {
  const w = Number(weekInMesocycle);
  if (w === 2) return 'LOAD+';
  if (w === 3) return 'PEAK';
  if (w === 4) return 'DELOAD';
  return 'LOAD';
}

/**
 * Returns volume multiplier for a phase (DELOAD = 0.55, others = 1.00).
 * Per §9.3 2.1: DELOAD volume −45%, LOAD/LOAD+/PEAK 1.00× baseline (RIR
 * descending across LOAD→LOAD+→PEAK is the progression dimension, not volume).
 *
 * @param {import('./types.js').MesocyclePhase} phase
 * @returns {number}
 */
export function volumeMultiplierForPhase(phase) {
  return phase === 'DELOAD' ? DELOAD_MULTIPLIERS.volumeMul : 1.0;
}

/**
 * Returns intensity multiplier for a phase (DELOAD = 0.875, others = 1.00).
 *
 * @param {import('./types.js').MesocyclePhase} phase
 * @returns {number}
 */
export function intensityMultiplierForPhase(phase) {
  return phase === 'DELOAD' ? DELOAD_MULTIPLIERS.intensityMul : 1.0;
}

/**
 * RIR target adjustment per phase per §9.3 2.1 verbatim.
 * - LOAD:  RIR target normal (offset 0)
 * - LOAD+: RIR target ↓ 1 step
 * - PEAK:  RIR target ↓ 2 steps
 * - DELOAD: RIR target normal (recovery — NU push closer to failure)
 *
 * Caller passes baseline RIR target (from ADR 003 progression matrix or
 * goal modifier); function returns adjusted RIR target floor.
 *
 * @param {import('./types.js').MesocyclePhase} phase
 * @param {number} baselineRir
 * @returns {number}
 */
export function rirTargetForPhase(phase, baselineRir) {
  if (baselineRir === null || baselineRir === undefined) return 2; // defensive default
  const base = Number(baselineRir);
  if (!Number.isFinite(base)) return 2; // defensive default
  if (phase === 'LOAD+') return Math.max(0, base - 1);
  if (phase === 'PEAK')  return Math.max(0, base - 2);
  return base; // LOAD + DELOAD
}

/**
 * Marius 5:1 dual-signal evaluation per §9.3 2.3 verbatim.
 *
 * Signal 1: RIR stable [1, 2] ALL 4 weeks (zero RIR drift week-over-week)
 * Signal 2: Energy ZERO red last 3 sessions (no recovery red flag in trailing
 *           3-session window)
 *
 * Both signals required — boolean AND. Insufficient data (NU 4 weeks RIR
 * trail OR NU 3 sessions energy trail) returns false (conservative — no
 * extension granted).
 *
 * @param {ReadonlyArray<{rir?: number, energy?: string, weekIdx?: number}>} recentSessions
 * @returns {boolean}
 */
export function isMariusDualSignalGreen(recentSessions) {
  if (!Array.isArray(recentSessions)) return false;

  // Signal 2: Energy ZERO red last N energy-bearing sessions (window = 3).
  // Filter for entries cu energy field; need ≥N in trailing window.
  const energyBearing = recentSessions.filter((s) => s && typeof s.energy === 'string');
  const energyWindow = energyBearing.slice(0, MARIUS_5_1_THRESHOLDS.energyRedWindow);
  if (energyWindow.length < MARIUS_5_1_THRESHOLDS.energyRedWindow) return false;
  const anyRedRecent = energyWindow.some((s) => s.energy === ENERGY_RED_FLAG);
  if (anyRedRecent) return false;

  // Signal 1: RIR stable [1, 2] ALL 4 weeks. Sessions must include weekIdx
  // 1, 2, 3, 4 of current mesocycle, all RIR-bearing sessions per week with
  // RIR in [1, 2]. Sessions that don't carry a rir field are skipped (e.g.
  // energy-only signal sessions sharing weekIdx).
  const weeksRequired = [1, 2, 3, 4];
  for (const w of weeksRequired) {
    const weekRirSessions = recentSessions.filter((s) => {
      if (!s || s.weekIdx !== w) return false;
      const r = Number(s.rir);
      return Number.isFinite(r);
    });
    if (weekRirSessions.length === 0) return false;
    const allInRange = weekRirSessions.every((s) => {
      const r = Number(s.rir);
      return r >= MARIUS_5_1_THRESHOLDS.rirMin && r <= MARIUS_5_1_THRESHOLDS.rirMax;
    });
    if (!allInRange) return false;
  }
  return true;
}

/**
 * Detect injury block per §9.3 anti-abuse + Invariant 5 Medical Safety.
 * Looks for any CDL/session entry tagged injury within trailing 6 sapt window.
 *
 * @param {ReadonlyArray<{injury?: boolean, daysAgo?: number}>} recentSessions
 * @returns {boolean}
 */
export function hasInjuryBlock(recentSessions) {
  if (!Array.isArray(recentSessions)) return false;
  return recentSessions.some((s) => {
    if (!s || s.injury !== true) return false;
    const daysAgo = Number(s.daysAgo);
    if (!Number.isFinite(daysAgo)) return true; // defensive: injury without timestamp = block
    return daysAgo <= ANTI_ABUSE.injuryBlockWindowDays;
  });
}

/**
 * Anti-abuse extension cap check per §9.3: max 2 consecutive extensions.
 *
 * @param {number} consecutiveExtensions
 * @returns {boolean}
 */
export function isExtensionAllowedByCap(consecutiveExtensions) {
  const n = Number(consecutiveExtensions);
  if (!Number.isFinite(n)) return true; // defensive: unknown count assumes allowed
  return n < ANTI_ABUSE.maxConsecutiveExtensions;
}

/**
 * Resolve trigger source per §9.3 Cluster 2.2 hierarchy:
 *   EARLY_SAFETY > EXTENSION_MARIUS > CALENDAR
 *
 * @param {Object} input
 * @param {boolean} input.earlySafetyTriggered    - composite trigger from Engine #4 Deload Protocol signal
 * @param {string}  input.personaId               - 'maria' | 'gigica' | 'marius'
 * @param {ReadonlyArray<Object>} input.recentSessions
 * @param {number}  input.consecutiveExtensions
 * @returns {{trigger: import('./types.js').TriggerSource, signals: string[]}}
 */
export function resolveTrigger({ earlySafetyTriggered, personaId, recentSessions, consecutiveExtensions }) {
  const signals = [];

  if (earlySafetyTriggered === true) {
    signals.push('early_safety_deload');
    return { trigger: 'EARLY_SAFETY', signals };
  }

  // EXTENSION available only for Marius persona, gated by dual-signal +
  // anti-abuse cap + injury block.
  if (personaId === 'marius') {
    if (hasInjuryBlock(recentSessions)) {
      signals.push('extension_blocked_injury_history');
      return { trigger: 'CALENDAR', signals };
    }
    if (!isExtensionAllowedByCap(consecutiveExtensions)) {
      signals.push('extension_blocked_consecutive_cap');
      return { trigger: 'CALENDAR', signals };
    }
    if (isMariusDualSignalGreen(recentSessions)) {
      signals.push('marius_dual_signal_green');
      return { trigger: 'EXTENSION_MARIUS', signals };
    }
    signals.push('marius_dual_signal_not_green');
  }

  return { trigger: 'CALENDAR', signals };
}
