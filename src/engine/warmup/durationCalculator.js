// Cluster B1+B2 — Duration adaptive 5-10 min per persona threshold per ADR 026
// §9.7.2 verbatim.
//
// B1 Source 1 §65.1 Override Q1 reconsider: 5-10 min adaptive (compressed upper
//    bound from initial Q1 8-12 academic complete). RO pragmatism cultural +
//    Bugatti F4 "warm-up just enough".
// B3 Source 2 §45.6.3 persona thresholds:
//    Maria 65: 5-10 min mobility flow + bands light
//    Gigica 35: 5 min dynamic + ramp first exercise (compressed)
//    Marius 25: ramp protocol heavy compounds (50/70/90% × 3-5 sets) + general minimal
//
// Cluster D1 Periodization phase = DELOAD week → lighter routine
// Cluster D2 Goal Adaptation phase modulation (CUT preserve / BULK Marius full)
// Cluster D3 Energy DOWN signal → auto-shorten upper bound 5-10 → 5-7 min
//    (anti-cascade preserve §1.10 Pipeline Order LOCKED V1 — consistent §9.5
//    Tempo D13 precedent: Energy DOWN modulates duration NU intensity directly)
//
// Pure functions — no side effects.

import {
  PERSONA,
  PERSONA_DURATION,
  GOAL_PHASE,
  PERIODIZATION_PHASE,
  ENERGY_DIRECTION,
  SCHEMA_CONSTANTS,
} from './constants.js';

/**
 * Resolve persona duration thresholds per Cluster B3 verbatim mapping.
 *
 * Defensive default → Maria 5-10 min mobility flow (NU restrictive) cand
 * persona unresolved (caller should pass valid persona; defensive ensures
 * total function semantics).
 *
 * @param {string|null|undefined} persona
 * @returns {{min: number, max: number, rationale: string}}
 */
export function resolvePersonaDuration(persona) {
  if (typeof persona !== 'string') {
    return PERSONA_DURATION.maria; // safe default fallback
  }
  return PERSONA_DURATION[persona.toLowerCase()] ?? PERSONA_DURATION.maria;
}

/**
 * Resolve Goal Adaptation phase modulation per Cluster D2 cross-ref.
 *
 * V1 light coupling — phase context informs duration upper bound:
 *   CUT     preserve full (Maria 65 retention crescut — anti-friction)
 *   BULK    Marius full ramp protocol upper bound preserved
 *   MAINTAIN baseline preserved
 *   RECOMP  baseline preserved (sub-phase MAINTAIN treatment Cluster D2)
 *
 * @param {string|null|undefined} goalPhase
 * @returns {{modifier: number, rationale: string}}
 */
export function resolveGoalPhaseModifier(goalPhase) {
  const phase = typeof goalPhase === 'string' ? goalPhase.toUpperCase() : null;
  if (phase === GOAL_PHASE.CUT) {
    return {
      modifier:  1.0,
      rationale: 'goal_phase_cut_preserve_full_maria_65_retention',
    };
  }
  if (phase === GOAL_PHASE.BULK) {
    return {
      modifier:  1.0,
      rationale: 'goal_phase_bulk_marius_full_ramp_upper_bound_preserved',
    };
  }
  return {
    modifier:  1.0,
    rationale: 'goal_phase_maintain_recomp_baseline_preserved',
  };
}

/**
 * Detect Periodization DELOAD week per Cluster D1 cross-ref §9.1 Hook 1.
 *
 * Periodization phase = DELOAD (W4) → Warm-up routine lighter (recovery week,
 * NU full ramp protocol Marius 50/70/90%).
 *
 * @param {string|null|undefined} periodizationPhase
 * @returns {boolean}
 */
export function isDeloadWeek(periodizationPhase) {
  return periodizationPhase === PERIODIZATION_PHASE.DELOAD;
}

/**
 * Detect Energy DOWN auto-shorten condition per Cluster D3 verbatim.
 *
 * Energy DOWN signal → auto-shorten upper bound 5-10 → 5-7 min anti-cascade
 * preserve §1.10 Pipeline Order LOCKED V1 (consistent §9.5 Tempo D13 precedent
 * — Energy DOWN modulates form/tempo, NU mutate phase).
 *
 * @param {string|null|undefined} energyDirection
 * @returns {boolean}
 */
export function isEnergyDownAutoShorten(energyDirection) {
  return energyDirection === ENERGY_DIRECTION.DOWN;
}

/**
 * Compute final adaptive duration per Cluster B1+B2+B3+D verbatim integration.
 *
 * Algorithm:
 *   1. Start cu persona threshold {min, max} (Cluster B3)
 *   2. Apply Goal phase modifier (Cluster D2 light coupling — V1 modifier 1.0)
 *   3. Apply DELOAD lighter (Cluster D1 — capped to lower-tier upper bound)
 *   4. Apply Energy DOWN auto-shorten (Cluster D3 — upper bound clamped to 7)
 *   5. Final duration = midpoint(min, adjusted upper bound) rounded
 *
 * @param {Object} input
 * @param {string|null|undefined} [input.persona]                 - Cluster B3
 * @param {string|null|undefined} [input.goalPhase]               - Cluster D2
 * @param {string|null|undefined} [input.periodizationPhase]      - Cluster D1
 * @param {string|null|undefined} [input.energyDirection]         - Cluster D3
 * @returns {import('./types.js').DurationDecision}
 */
export function computeDuration({ persona, goalPhase, periodizationPhase, energyDirection }) {
  const personaThreshold = resolvePersonaDuration(persona);
  const goalModifier = resolveGoalPhaseModifier(goalPhase);
  const deloadLighter = isDeloadWeek(periodizationPhase);
  const energyDownAutoShortened = isEnergyDownAutoShorten(energyDirection);

  let lowerBound = personaThreshold.min;
  let upperBound = personaThreshold.max;

  // Apply Goal phase modifier (V1 = 1.0 baseline; future v1.5 candidate)
  upperBound = Math.round(upperBound * goalModifier.modifier);

  // DELOAD lighter — clamp to lower threshold (recovery week)
  if (deloadLighter) {
    upperBound = Math.min(upperBound, SCHEMA_CONSTANTS.durationMaxEnergyDown);
  }

  // Energy DOWN auto-shorten — clamp upper bound to 7 min anti-cascade
  if (energyDownAutoShortened) {
    upperBound = Math.min(upperBound, SCHEMA_CONSTANTS.durationMaxEnergyDown);
  }

  // Defensive: ensure lowerBound <= upperBound (preserve safety floor)
  if (lowerBound > upperBound) {
    lowerBound = upperBound;
  }

  // Final duration = midpoint rounded to nearest int
  const durationMin = Math.round((lowerBound + upperBound) / 2);

  let rationale = personaThreshold.rationale;
  if (energyDownAutoShortened) {
    rationale = `energy_down_auto_shorten_d3_anti_cascade_${rationale}`;
  } else if (deloadLighter) {
    rationale = `deload_lighter_d1_periodization_recovery_${rationale}`;
  }

  return {
    durationMin,
    lowerBound,
    upperBound,
    energyDownAutoShortened,
    deloadLighter,
    rationale,
  };
}
