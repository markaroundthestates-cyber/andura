// Cluster B Tempo Prescription Logic + Cue Delivery Strategy per ADR 026 §9.5.2
// verbatim.
//
// B1 Hibrid pre-set intro + reactive user-initiated cue (Q1=C):
//    - Pre-set intro = engine surfaces tempo notation + form cue INAINTE of set
//    - Reactive user-initiated cue = user taps 💡 indicator mid-rest pentru
//      elaboration (NU intra-set distraction Q8=D)
//    - Hibrid Q1=C: combine both — engine emite pre-set; user opt-in reactive
//
// B6 Tap-to-expand 💡 indicator Bugatti minimal-friction (Q6=D):
//    - 💡 indicator = engine surfaces minimal pre-set; tap expand for full
//    - Q6=D: anti-cognitive-overload pattern (consistent ADR 025 graceful
//      degradation — engine pre-fills default cu opt-in detail).
//
// B8 Pre-set + post-set timing NU intra-set distraction (Q8=D):
//    - Cue delivery timing = pre-set (intro) + post-set (RIR feedback)
//    - NU intra-set distraction Q8=D — preserve user concentration
//    - Mid-rest tap-to-expand = user-initiated reactive elaboration (consistent
//      B1 Hibrid Q1=C)
//
// Pure functions — no side effects.

import {
  CUE_DELIVERY_TIMING,
  TEMPO_NOTATION,
  HIGH_INTENSITY_PHASES,
  ENERGY_DIRECTION,
  DELOAD_PHASE,
} from './constants.js';

/**
 * Resolve tempo notation prescription per cross-engine modulation Cluster D
 * verbatim:
 *   - Energy DOWN → slow eccentric universal Q13=B (3-1-1-0)
 *   - High intensity (PEAK/LOAD) → form-conservative amplification Q11=B (3-2-2-0)
 *   - Deload phase → controlled tempo Q12=D (2-2-2-1)
 *   - Default → standard hipertrofie (2-1-2-0)
 *
 * Priority order: Energy DOWN > Deload > High intensity > Default. Energy DOWN
 * dominates anti-cascade per Invariant 1 immutable §9.3 Q8=A (NU sub-Floor
 * sub-MEV but slow eccentric universal compatible MRV invariant 1).
 *
 * @param {Object} input
 * @param {string} [input.periodizationPhase]      - LOAD/PEAK/DELOAD/etc.
 * @param {string} [input.energyDirection]         - 'UP' | 'DOWN' | 'NONE'
 * @returns {{
 *   notation: string,
 *   modulation: 'energy_down_slow_eccentric'|'deload_controlled'|'high_intensity_form_conservative'|'standard',
 *   rationale: string,
 * }}
 */
export function resolveTempoNotation({ periodizationPhase, energyDirection }) {
  const phase = typeof periodizationPhase === 'string' ? periodizationPhase.toUpperCase() : null;
  const energy = typeof energyDirection === 'string' ? energyDirection.toUpperCase() : null;

  // Priority 1: Energy DOWN → slow eccentric universal Q13=B (Gemini self-flagged
  // ROM partial REJECT corect — slow eccentric universal compatible MRV invariant 1).
  if (energy === ENERGY_DIRECTION.DOWN) {
    return {
      notation:   TEMPO_NOTATION.SLOW_ECCENTRIC_UNIVERSAL,
      modulation: 'energy_down_slow_eccentric',
      rationale:  'energy_down_slow_eccentric_universal_q13_b_compatible_mrv_invariant_1',
    };
  }

  // Priority 2: Deload phase → mind-muscle unlock controlled tempo Q12=D
  if (phase === DELOAD_PHASE) {
    return {
      notation:   TEMPO_NOTATION.DELOAD_CONTROLLED,
      modulation: 'deload_controlled',
      rationale:  'deload_phase_w4_controlled_tempo_q12_d_mind_muscle_unlock_window',
    };
  }

  // Priority 3: High intensity (PEAK or LOAD) → form-conservative amplification Q11=B
  if (phase === HIGH_INTENSITY_PHASES.PEAK || phase === HIGH_INTENSITY_PHASES.LOAD) {
    return {
      notation:   TEMPO_NOTATION.FORM_CONSERVATIVE_AMPLIFIED,
      modulation: 'high_intensity_form_conservative',
      rationale:  'high_intensity_phase_form_conservative_amplification_q11_b_safety_emphasis',
    };
  }

  // Priority 4 default: standard hypertrophy 2-1-2-0
  return {
    notation:   TEMPO_NOTATION.STANDARD,
    modulation: 'standard',
    rationale:  'standard_hypertrophy_default_no_cross_engine_modulation',
  };
}

/**
 * Compose pre-set intro text (Q1=C Hibrid + Q6=D Bugatti minimal-friction).
 *
 * Engine surfaces minimal pre-set; user can tap 💡 for expanded elaboration
 * mid-rest (B1 + B6 + B8 consistent — NU intra-set distraction Q8=D).
 *
 * @param {Object} input
 * @param {string} input.notation                  - Tempo notation eg "2-1-2-0"
 * @param {string} input.cueText                   - Form cue text from formCues module
 * @param {string} input.persona                   - 'maria' | 'gigica' | 'marius'
 * @returns {{preSetIntro: string, reactiveExpanded: string}}
 */
export function composePreSetIntro({ notation, cueText, persona }) {
  const safeNotation = typeof notation === 'string' ? notation : '';
  const safeCue = typeof cueText === 'string' ? cueText : '';

  // Maria persona: zero notation strict (Daniel push-back Q3) — verbal-only intro.
  // Gigica + Marius: notation surfaced pre-set per Q3 hibrid + numeric pure.
  const isMaria = persona === 'maria';

  const preSetIntro = isMaria
    ? safeCue
    : (safeNotation ? `Tempo ${safeNotation}, ${safeCue}` : safeCue);

  // Reactive expanded = full elaboration on user tap-to-expand 💡 (Q6=D).
  // V1 minimal: same cue + rationale hint. V1.5+ candidate ML cue selection.
  const reactiveExpanded = isMaria
    ? `${safeCue} (coboara lent pentru control articular)`
    : `${safeCue} — tempo ${safeNotation} pentru hipertrofie controlata`;

  return { preSetIntro, reactiveExpanded };
}

/**
 * Resolve cue delivery timing per Cluster B8 Q8=D verbatim.
 *
 * V1 default: PRE_SET (engine surfaces INAINTE of set, intro). POST_SET emit
 * pentru RIR feedback / form check post-set. MID_REST = user-initiated tap-to-
 * expand reactive elaboration (consistent B1 Hibrid Q1=C).
 *
 * NU INTRA_SET — Q8=D explicit constraint preserve user concentration during
 * execution (anti-distraction).
 *
 * @param {Object} input
 * @param {boolean} [input.userInitiatedTapToExpand]   - True daca user tapped 💡 mid-rest
 * @param {boolean} [input.postSetFeedbackContext]     - True daca context = post-set RIR feedback
 * @returns {string} CUE_DELIVERY_TIMING value (NEVER intra-set)
 */
export function resolveCueDeliveryTiming({ userInitiatedTapToExpand, postSetFeedbackContext }) {
  if (userInitiatedTapToExpand === true) return CUE_DELIVERY_TIMING.MID_REST;
  if (postSetFeedbackContext === true) return CUE_DELIVERY_TIMING.POST_SET;
  return CUE_DELIVERY_TIMING.PRE_SET;
}

/**
 * Compose tempo prescription emit per Cluster A1 verbatim — bundles notation +
 * pre-set intro + reactive expanded + timing + rationale.
 *
 * @param {Object} input
 * @param {string} [input.periodizationPhase]
 * @param {string} [input.energyDirection]
 * @param {string} [input.cueText]
 * @param {string} [input.persona]
 * @param {boolean} [input.userInitiatedTapToExpand]
 * @param {boolean} [input.postSetFeedbackContext]
 * @returns {import('./types.js').TempoPrescription}
 */
export function composeTempoPrescription({
  periodizationPhase,
  energyDirection,
  cueText,
  persona,
  userInitiatedTapToExpand,
  postSetFeedbackContext,
}) {
  const notationResult = resolveTempoNotation({ periodizationPhase, energyDirection });
  const introBundle = composePreSetIntro({
    notation: notationResult.notation,
    cueText: cueText ?? '',
    persona: persona ?? 'gigica',
  });
  const timing = resolveCueDeliveryTiming({
    userInitiatedTapToExpand,
    postSetFeedbackContext,
  });

  return {
    notation:         notationResult.notation,
    preSetIntro:      introBundle.preSetIntro,
    reactiveExpanded: introBundle.reactiveExpanded,
    timing:           /** @type {import('./types.js').CueDeliveryTiming} */ (timing),
    rationale:        notationResult.rationale,
  };
}
