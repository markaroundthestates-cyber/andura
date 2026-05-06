// Cluster 4 — Macrocycle Structure Linear Block V1 per ADR 026 §9.5 verbatim.
//
// Linear Block Periodization V1 (NU DUP NU Conjugate). 3 mesocycles/block.
//   - 12 săpt BUILD-only (default majoritar templates)
//   - 21 săpt BUILD + PEAK + TRANSITION pentru Forță
// Volume scaling intra-block M1 1.00× → M2 1.10× → M3 1.15× cap MRV absolut.
// Maria adaptive override: NU advance la M2/M3 fără calibration ≥DEVELOPING +
//   zero injury 6 săpt (both AND).
//
// Pure functions — no Date.now / Math.random / state reads.

import {
  BLOCK_LENGTH_WEEKS,
  BLOCK_SCALING,
  MARIA_ADVANCE_GATE,
} from './constants.js';

/**
 * Resolve block length în weeks for goal id.
 *
 * @param {string} goalId
 * @returns {number}
 */
export function getBlockLengthWeeks(goalId) {
  return goalId === 'forta' ? BLOCK_LENGTH_WEEKS.FORTA : BLOCK_LENGTH_WEEKS.DEFAULT;
}

/**
 * Resolve current macrocycle block position from elapsed weeks since macrocycle
 * start.
 *
 * @param {number} weeksElapsed - integer >=0; defensive 0 when invalid
 * @param {string} goalId
 * @returns {import('./types.js').MacrocycleBlock}
 */
export function computeMacrocycleBlock(weeksElapsed, goalId) {
  const w = Number(weeksElapsed);
  const safeWeeks = Number.isFinite(w) && w >= 0 ? Math.floor(w) : 0;
  const blockLengthWeeks = getBlockLengthWeeks(goalId);
  const mesocycleLengthWeeks = 4;

  const blockIdx = Math.floor(safeWeeks / blockLengthWeeks) + 1;
  const weeksIntoBlock = safeWeeks % blockLengthWeeks;
  const mesocycleIdxRaw = Math.floor(weeksIntoBlock / mesocycleLengthWeeks) + 1;
  const mesocycleIdx = /** @type {1|2|3} */ (Math.min(3, Math.max(1, mesocycleIdxRaw)));
  const weekInMesocycleRaw = (weeksIntoBlock % mesocycleLengthWeeks) + 1;
  const weekInMesocycle = /** @type {1|2|3|4} */ (Math.min(4, Math.max(1, weekInMesocycleRaw)));

  return {
    blockIdx,
    mesocycleIdx,
    weekInMesocycle,
    blockLengthWeeks,
  };
}

/**
 * Block scaling multiplier for mesocycle index (M1 1.00 / M2 1.10 / M3 1.15).
 * Out-of-range coerces to M1 (defensive).
 *
 * @param {number} mesocycleIdx - 1..3
 * @returns {number}
 */
export function getBlockScaling(mesocycleIdx) {
  return BLOCK_SCALING[mesocycleIdx] ?? BLOCK_SCALING[1];
}

/**
 * Maria adaptive override gate per §9.5 verbatim:
 *   - Calibration tier ≥ DEVELOPING (per ADR 009 — DEVELOPING / STABLE / OPTIMIZED accepted)
 *   - Zero injury în trailing 6 săpt window (AND condition)
 *
 * Returns true dacă Maria CAN advance to M2/M3. False = stay în M1 (engine
 * holds at baseline scaling 1.00× regardless of mesocycleIdx computed).
 *
 * Non-Maria personas always pass through — gate applies only to maria persona
 * per §9.5 "Maria adaptive override" anti-progression-too-fast safeguard
 * specific.
 *
 * @param {Object} input
 * @param {string} input.personaId
 * @param {string} [input.profileTier]            - calibration tier per ADR 009
 * @param {ReadonlyArray<{injury?: boolean, daysAgo?: number}>} [input.recentSessions]
 * @returns {{allowed: boolean, signals: string[]}}
 */
export function evaluateMariaAdvanceGate({ personaId, profileTier, recentSessions }) {
  const signals = [];

  if (personaId !== 'maria') {
    return { allowed: true, signals };
  }

  // Calibration tier check
  const tier = typeof profileTier === 'string' ? profileTier.toUpperCase() : null;
  const tierOk = tier !== null && MARIA_ADVANCE_GATE.requiredTiers.includes(tier);
  if (!tierOk) {
    signals.push('maria_advance_gate_blocked_tier');
  }

  // Injury history check (6 săpt window)
  let injuryOk = true;
  if (Array.isArray(recentSessions)) {
    const recentInjury = recentSessions.some((s) => {
      if (!s || s.injury !== true) return false;
      const daysAgo = Number(s.daysAgo);
      if (!Number.isFinite(daysAgo)) return true; // defensive: injury without timestamp = block
      return daysAgo <= MARIA_ADVANCE_GATE.injuryWindowDays;
    });
    if (recentInjury) {
      injuryOk = false;
      signals.push('maria_advance_gate_blocked_injury');
    }
  }

  const allowed = tierOk && injuryOk;
  if (allowed) {
    signals.push('maria_advance_gate_open');
  }

  return { allowed, signals };
}

/**
 * Effective block scaling factoring Maria adaptive override. When gate
 * blocks advance, scaling clamps at M1 (1.00×) regardless of computed
 * mesocycleIdx.
 *
 * @param {Object} input
 * @param {1|2|3} input.mesocycleIdx
 * @param {string} input.personaId
 * @param {string} [input.profileTier]
 * @param {ReadonlyArray<Object>} [input.recentSessions]
 * @returns {{scaling: number, gateSignals: string[]}}
 */
export function effectiveBlockScaling({ mesocycleIdx, personaId, profileTier, recentSessions }) {
  const gate = evaluateMariaAdvanceGate({ personaId, profileTier, recentSessions });
  if (!gate.allowed && (mesocycleIdx === 2 || mesocycleIdx === 3)) {
    return { scaling: BLOCK_SCALING[1], gateSignals: gate.signals };
  }
  return { scaling: getBlockScaling(mesocycleIdx), gateSignals: gate.signals };
}
