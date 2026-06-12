// Cluster B2 + B3 + D18 Form Cue Library + Persona-Aware Notation per ADR 026
// §9.5.2 + §9.5.4 verbatim.
//
// B2 Pattern base library + top-30 compound overrides Bugatti depth (Q2=C):
//    - Pattern base library = generic cues per movement category (compound /
//      isolation taxonomy)
//    - Top-30 compound overrides = movement-specific cues craft Bugatti depth
//    - Q2=C Hibrid: base library covers majority; top-30 compound craft signature
//
// B3 Q33 §45.5 elaboration persona-aware notation (Q3 Daniel push-back fundamental
//    Maria zero notation strict):
//    - Maria verbal: "coboara lent, doua secunde" (NU "2-X-2-X" — zero numeric
//      strict, anti-friction Maria 65 cognitive load SUFLET F2 alignment)
//    - Gigica hibrid: "tempo 2-X-2-X (coboara 2s)" (verbal + notation)
//    - Marius numeric pure: "Tempo 2-1-2-0" (notation strict)
//
// D18 Persona-aware tone Q18=D verbatim:
//    - Maria rationale-first: "De ce coboara lent? Pentru a controla incarcarea articulara."
//    - Gigica suggestion: "Sugerez tempo 2-1-2-0 pentru hipertrofie."
//    - Marius imperative: "Tempo 2-1-2-0. Execute."
//
// Pure functions — no side effects.

import {
  PERSONA,
  MOVEMENT_CATEGORY,
  TOP_COMPOUND_MOVEMENTS,
  CUE_DEPTH_BY_TIER,
} from './constants.js';

/**
 * Pattern base library per Cluster B2 verbatim — generic cues per movement
 * category (compound / isolation taxonomy). Covers majority sessions; top-30
 * overrides surface Bugatti depth where applicable.
 *
 * V1 conservative coverage: base cues per category. §9.5.6 Reconsideration
 * Trigger 7 candidate ML cue ranker per Profile Typing tier T2+ post-Beta.
 *
 * @type {Readonly<{compound: string, isolation: string}>}
 */
const BASE_LIBRARY_RO = Object.freeze({
  compound:  'controleaza coborarea, pastreaza tensiunea',
  isolation: 'concentreaza-te pe muschiul tinta, miscare lenta',
});

/**
 * Top-12 compound movement overrides per Cluster B2 verbatim — V1 conservative
 * pick covers majority sessions. Full top-30 expansion candidate post-Beta ML
 * cue selection §9.5.6 Reconsideration Trigger 7.
 *
 * Cues in RO native per Q3 + D18 persona-aware tone resolved at compose time.
 *
 * @type {Readonly<Object<string, string>>}
 */
const TOP_COMPOUND_OVERRIDES_RO = Object.freeze({
  back_squat:              'piept sus, genunchii peste varfurile picioarelor, coboara controlat sub paralel',
  front_squat:             'coate sus, vertical torso, coboara controlat',
  deadlift:                'spate neutru, impinge prin podea, solduri si genunchi simultan',
  romanian_deadlift:       'solduri inapoi, spate neutru, simte hamstring-ii',
  bench_press:             'omoplati stransi, coatele 45°, atinge controlat pieptul',
  incline_bench_press:     'omoplati stransi, coatele moderate, controleaza coborarea',
  overhead_press:          'fund strans, coate sub bara, impinge vertical',
  barbell_row:             'spate neutru, trage cu coatele, atinge abdomenul',
  pull_up:                 'omoplati activi, trage cu spatele NU cu bratele',
  hip_thrust:              'barbie in piept, contracta fesieri in varf, controleaza coborarea',
  lunge:                   'genunchi peste varful piciorului, torso vertical, controleaza revenirea',
  bulgarian_split_squat:   'piciorul din spate sus, coboara vertical, controleaza echilibrul',
});

/**
 * Lookup base cue per movement category (compound/isolation).
 *
 * @param {string} category
 * @returns {string}
 */
export function getBaseCue(category) {
  if (category === MOVEMENT_CATEGORY.COMPOUND) return BASE_LIBRARY_RO.compound;
  if (category === MOVEMENT_CATEGORY.ISOLATION) return BASE_LIBRARY_RO.isolation;
  return BASE_LIBRARY_RO.compound; // safe default
}

/**
 * Lookup top-30 compound override (V1 = top-12 covers majority).
 *
 * @param {string} movementId
 * @returns {string|null} Override cue or null daca movement NU in top-30 list
 */
export function getTopCompoundOverride(movementId) {
  if (typeof movementId !== 'string' || movementId.length === 0) return null;
  const id = movementId.toLowerCase();
  if (!TOP_COMPOUND_MOVEMENTS.includes(id)) return null;
  return TOP_COMPOUND_OVERRIDES_RO[id] ?? null;
}

/**
 * Resolve cue text per Cluster B2 base library + top-30 compound override.
 *
 * Priority: top-30 compound override > base library category fallback.
 *
 * @param {Object} input
 * @param {string} [input.movementId]
 * @param {string} [input.movementCategory]   - 'compound' | 'isolation'
 * @returns {string} Cue text RO native
 */
export function resolveCueText({ movementId, movementCategory }) {
  const override = getTopCompoundOverride(movementId ?? '');
  if (override) return override;
  return getBaseCue(movementCategory ?? '');
}

/**
 * Resolve a STABLE cue id (i18n key suffix) mirroring resolveCueText's
 * priority: top-30 compound override movementId > base library category.
 *
 * The render boundary localizes the prose via `workout.tempoCue.cues.<id>`
 * (en.json + ro.json) instead of surfacing the engine's RO `cueText` raw —
 * the cue text stays RO-native here only as a back-compat fallback. Returned
 * ids are stable contract keys ('compound' | 'isolation' | a TOP_COMPOUND id
 * like 'back_squat'), not localized copy.
 *
 * @param {Object} input
 * @param {string} [input.movementId]
 * @param {string} [input.movementCategory]   - 'compound' | 'isolation'
 * @returns {string} Stable cue id ('compound' | 'isolation' | top-compound movementId)
 */
export function resolveCueId({ movementId, movementCategory }) {
  if (getTopCompoundOverride(movementId ?? '') !== null) {
    return /** @type {string} */ (movementId).toLowerCase();
  }
  return movementCategory === MOVEMENT_CATEGORY.ISOLATION
    ? MOVEMENT_CATEGORY.ISOLATION
    : MOVEMENT_CATEGORY.COMPOUND;
}

/**
 * Apply persona-aware tone per Cluster D18 Q18=D verbatim:
 *   Maria rationale-first: "De ce X? Pentru a Y."
 *   Gigica suggestion: "Sugerez X."
 *   Marius imperative: "X. Execute."
 *
 * Cluster B3 Q3 Daniel push-back fundamental Maria zero notation strict —
 * persona resolution drives notation inclusion/exclusion at compose time
 * (tempoPrescription.composePreSetIntro handles notation vs verbal).
 *
 * @param {Object} input
 * @param {string} input.cueText                   - Raw cue text from base library / override
 * @param {string} input.persona                   - 'maria' | 'gigica' | 'marius'
 * @returns {string} Persona-toned cue text RO native
 */
export function applyPersonaTone({ cueText, persona }) {
  const safeCue = typeof cueText === 'string' ? cueText : '';
  if (!safeCue) return '';

  switch (persona) {
    case PERSONA.MARIA:
      return `De ce asa? Pentru control: ${safeCue}.`;
    case PERSONA.GIGICA:
      return `Sugerez: ${safeCue}.`;
    case PERSONA.MARIUS:
      return `${safeCue}. Execute.`;
    default:
      // Default fallback: neutral suggestion tone (Gigica-style middle ground)
      return safeCue;
  }
}

/**
 * Resolve persona from ctx demographic prior fallback chain. ADR 017 sets
 * authoritative persona; if absent, default to Gigica (middle ground hibrid
 * verbal + notation) anti-overfit cold start.
 *
 * @param {Object} [ctx]
 * @returns {string} 'maria' | 'gigica' | 'marius'
 */
export function resolvePersona(ctx) {
  const safeCtx = /** @type {{ meta?: { persona?: string } }} */ (ctx && typeof ctx === 'object' ? ctx : {});
  const meta = safeCtx.meta && typeof safeCtx.meta === 'object' ? safeCtx.meta : {};
  const declared = typeof meta.persona === 'string' ? meta.persona.toLowerCase() : null;
  if (declared === PERSONA.MARIA) return PERSONA.MARIA;
  if (declared === PERSONA.MARIUS) return PERSONA.MARIUS;
  if (declared === PERSONA.GIGICA) return PERSONA.GIGICA;
  return PERSONA.GIGICA; // safe default middle-ground hibrid
}

/**
 * Resolve cue depth per Cluster C15 Q15=B verbatim tier-aware:
 *   T0 minimal (cue text-only basic)
 *   T1+ richer (cue + rationale + suggested fix — applied via persona tone)
 *   T2+ adaptive (cue + persona-aware tone + ML cue selection v1.5+ deferred)
 *
 * @param {string} tier
 * @returns {string} 'minimal' | 'rich' | 'adaptive'
 */
export function resolveCueDepth(tier) {
  const map = /** @type {Record<string, string>} */ (CUE_DEPTH_BY_TIER);
  return map[tier] ?? CUE_DEPTH_BY_TIER.T0;
}

/**
 * Compose form cue emit per Cluster A1 verbatim — bundles cueText + category +
 * movementId + persona + depth.
 *
 * @param {Object} input
 * @param {string} [input.movementId]
 * @param {string} [input.movementCategory]
 * @param {string} [input.persona]
 * @param {string} [input.tier]
 * @returns {import('./types.js').FormCue}
 */
export function composeFormCue({ movementId, movementCategory, persona, tier }) {
  const rawCue = resolveCueText({ movementId, movementCategory });
  const tonedCue = applyPersonaTone({ cueText: rawCue, persona: persona ?? 'gigica' });
  const depth = resolveCueDepth(tier ?? 'T0');

  return {
    cueText:    tonedCue,
    // Stable i18n key suffix (NOT localized prose) — the render boundary maps
    // it to `workout.tempoCue.cues.<cueId>` so the cue surfaces in the active
    // locale instead of leaking the RO `cueText`. See resolveCueId.
    cueId:      resolveCueId({ movementId, movementCategory }),
    category:   movementCategory === MOVEMENT_CATEGORY.ISOLATION
                  ? MOVEMENT_CATEGORY.ISOLATION
                  : MOVEMENT_CATEGORY.COMPOUND,
    movementId: typeof movementId === 'string' ? movementId : '',
    persona:    /** @type {import('./types.js').Persona} */ (persona ?? 'gigica'),
    depth:      /** @type {import('./types.js').CueDepth} */ (depth),
  };
}
