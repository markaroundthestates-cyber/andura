// Cluster B — Tempo Prescription Logic + Cue Delivery Strategy per ADR 026
// §9.5.2 verbatim.
//
// B1 Hibrid pre-set intro + reactive user-initiated cue (Q1=C)
// B6 Tap-to-expand 💡 indicator Bugatti minimal-friction (Q6=D)
// B8 Pre-set + post-set timing NU intra-set distraction (Q8=D)
//
// Pure functions — no side effects, no Date.now / Math.random.

import {
  CUE_DELIVERY_TIMING,
  MOVEMENT_CATEGORY,
  TOP_30_COMPOUND_IDS,
  HIGH_INTENSITY_PHASES,
  NOTATION_STYLE,
  PERSONA_NOTATION,
} from './constants.js';

/**
 * Resolve movement category per Cluster B2 base library taxonomy.
 * Compound = top-30 IDs (Cluster B2 Q2=C Bugatti depth) sau pattern matching;
 * Isolation = default fallback (single-joint single-muscle).
 *
 * @param {string} movementId
 * @returns {import('./types.js').MovementCategory}
 */
export function resolveMovementCategory(movementId) {
  if (typeof movementId !== 'string') return MOVEMENT_CATEGORY.ISOLATION;
  const m = movementId.toLowerCase().replace(/[\s-]/g, '_');
  if (TOP_30_COMPOUND_IDS.includes(m)) return MOVEMENT_CATEGORY.COMPOUND;
  // Pattern fallback for variants not în top-30
  const compoundPatterns = ['squat', 'deadlift', 'press', 'row', 'pull_up', 'chin_up', 'dip', 'thrust', 'lunge', 'clean', 'snatch'];
  if (compoundPatterns.some((p) => m.includes(p))) return MOVEMENT_CATEGORY.COMPOUND;
  return MOVEMENT_CATEGORY.ISOLATION;
}

/**
 * Resolve baseline tempo notation per movement category.
 *
 * Conservative defaults:
 *   Compound:   2-1-X-0 (slow eccentric, brief pause, explosive concentric)
 *   Isolation:  2-0-2-0 (controlled both phases for hypertrophy)
 *
 * @param {import('./types.js').MovementCategory} category
 * @returns {import('./types.js').TempoNotation}
 */
export function baselineTempoForCategory(category) {
  if (category === MOVEMENT_CATEGORY.COMPOUND) {
    return Object.freeze({
      eccentric_s:    2,
      pause_bottom_s: 1,
      concentric_s:   'X',
      pause_top_s:    0,
    });
  }
  return Object.freeze({
    eccentric_s:    2,
    pause_bottom_s: 0,
    concentric_s:   2,
    pause_top_s:    0,
  });
}

/**
 * Render tempo notation as persona-aware text per Cluster B3 Q3 Daniel push-back
 * Maria zero notation strict invariant.
 *
 *   Maria verbal:        "coboară lent, două secunde" (zero numeric strict)
 *   Gigica hibrid:       "tempo 2-X-2-X (coboară 2s)" (verbal + notation)
 *   Marius numeric pure: "Tempo 2-1-X-0" (notation strict)
 *
 * @param {Object} input
 * @param {import('./types.js').TempoNotation} input.notation
 * @param {import('./types.js').NotationStyle} input.style
 * @returns {string}
 */
export function renderTempoText({ notation, style }) {
  if (!notation || typeof notation !== 'object') {
    return '';
  }
  const ecc = notation.eccentric_s;
  const pb = notation.pause_bottom_s;
  const con = notation.concentric_s;
  const pt = notation.pause_top_s;

  if (style === NOTATION_STYLE.VERBAL) {
    // Maria zero notation strict — verbal description, NO numeric tempo string
    const eccDesc = ecc >= 3 ? 'foarte lent' : ecc === 2 ? 'lent' : 'controlat';
    const pauseDesc = pb >= 1 ? `, pauză ${pb} secund${pb === 1 ? 'ă' : 'e'} jos` : '';
    const conDesc = con === 'X' ? ', urcă energic' : ', urcă controlat';
    return `coboară ${eccDesc}${pauseDesc}${conDesc}`;
  }

  if (style === NOTATION_STYLE.HIBRID) {
    // Gigica: notation + parenthetical verbal hint
    const tempoStr = `${ecc}-${pb}-${con}-${pt}`;
    const verbalHint = ecc >= 2 ? `coboară ${ecc}s` : 'controlat';
    return `tempo ${tempoStr} (${verbalHint})`;
  }

  // Marius numeric pure
  return `Tempo ${ecc}-${pb}-${con}-${pt}`;
}

/**
 * Resolve persona notation style per Cluster B3 Q3 verbatim Daniel push-back.
 *
 * @param {import('./types.js').Persona|null|undefined} persona
 * @returns {import('./types.js').NotationStyle}
 */
export function notationStyleForPersona(persona) {
  if (typeof persona !== 'string') return NOTATION_STYLE.HIBRID;
  return PERSONA_NOTATION[persona.toLowerCase()] ?? NOTATION_STYLE.HIBRID;
}

/**
 * Compute tempo prescription per Cluster B1 Hibrid pre-set + reactive Q1=C
 * + B6 tap-to-expand Q6=D verbatim.
 *
 * @param {Object} input
 * @param {string} input.movementId
 * @param {import('./types.js').Persona|null|undefined} input.persona
 * @param {string|null} [input.periodizationPhase]   - From upstream §9.1
 * @returns {import('./types.js').TempoPrescription}
 */
export function computeTempoPrescription({ movementId, persona, periodizationPhase }) {
  const category = resolveMovementCategory(movementId);
  let notation = baselineTempoForCategory(category);

  // Cluster D11 cross-ref: Periodization high intensity → form-conservative
  // amplification (slower eccentric) — applied here via tempo notation modulation
  if (HIGH_INTENSITY_PHASES.includes(periodizationPhase)) {
    notation = Object.freeze({
      ...notation,
      eccentric_s: Math.max(notation.eccentric_s, 3), // ensure ≥3s eccentric când high_intensity
    });
  }

  const style = notationStyleForPersona(persona);
  const display_text = renderTempoText({ notation, style });

  return {
    notation,
    display_text,
    // B1 Hibrid Q1=C: pre-set intro + reactive user-initiated expand via 💡 (B6 Q6=D)
    reactive_expand_available: true,
  };
}

/**
 * Resolve cue delivery timing per Cluster B8 Q8=D verbatim:
 *   PRE_SET (intro) sau POST_SET (RIR feedback / form check)
 *   NU INTRA_SET — preserve user concentration during execution
 *
 * V1 default = PRE_SET (intro before set). Caller can request POST_SET context.
 *
 * @param {Object} input
 * @param {boolean} [input.postSetContext]      - True dacă caller invoke for post-set RIR feedback
 * @param {boolean} [input.userInitiatedExpand] - True dacă user tapped 💡 mid-rest
 * @returns {import('./types.js').CueDeliveryTiming}
 */
export function resolveCueDeliveryTiming({ postSetContext, userInitiatedExpand }) {
  if (userInitiatedExpand === true) return CUE_DELIVERY_TIMING.MID_REST;
  if (postSetContext === true) return CUE_DELIVERY_TIMING.POST_SET;
  return CUE_DELIVERY_TIMING.PRE_SET;
}
