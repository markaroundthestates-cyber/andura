// Cluster B + D persona-aware tone — form cues library per ADR 026 §9.5.2 + §9.5.4 verbatim.
//
// B2 Pattern base library + top-30 compound overrides Bugatti depth (Q2=C)
// B3 Q33 §45.5 persona-aware notation Maria verbal/Gigica hibrid/Marius numeric (Q3 Daniel push-back)
// D18 Persona-aware tone Maria rationale-first / Gigica suggestion / Marius imperative (Q18=D)
//
// V1 = text-only cues (E16 Q16 GIF embedded REJECTED pre-Beta — storage PWA +
// copyright + Gigel test mid-set distraction). Defer link extern v1.5+.
//
// Pure functions — no side effects.

import {
  PERSONA,
  TONE_STYLE,
  PERSONA_TONE,
  MOVEMENT_CATEGORY,
  CUE_DEPTH,
  CALIBRATION_TIERS,
} from './constants.js';
import { resolveMovementCategory } from './tempoPrescription.js';

/**
 * Pattern base library — generic cues per movement category per Cluster B2 Q2=C.
 *
 * Compound base cues focus pe pattern-level safety + technique core.
 * Isolation base cues focus pe muscle-engagement + ROM control.
 *
 * @type {Readonly<Object<string, Readonly<{core: string, rationale: string, suggested_fix: string}>>>}
 */
const BASE_LIBRARY = Object.freeze({
  compound: Object.freeze({
    core:           'Menține coloana neutră și controlează coborârea',
    rationale:      'Pentru a controla încărcarea articulară și recruta întreaga lanț cinematic',
    suggested_fix:  'Reduce încărcarea cu 5-10% dacă forma se rupe',
  }),
  isolation: Object.freeze({
    core:           'Concentrează-te pe contracția mușchiului țintă',
    rationale:      'Pentru a maximiza tensiunea mecanică pe mușchiul izolat',
    suggested_fix:  'Reduce ROM-ul dacă pierzi conexiunea musculară',
  }),
});

/**
 * Top-30 compound overrides per Cluster B2 Q2=C Bugatti depth verbatim.
 * Movement-specific cues craft Bugatti depth (NU generic pattern fallback).
 *
 * @type {Readonly<Object<string, Readonly<{core: string, rationale: string, suggested_fix: string}>>>}
 */
const TOP_30_OVERRIDES = Object.freeze({
  squat: Object.freeze({
    core:           'Genunchii urmăresc direcția labelor; coboară până coapsele paralele',
    rationale:      'Pentru a recruta cvadricepșii și fesierii prin ROM complet',
    suggested_fix:  'Lărgește puțin stance-ul dacă mobilitatea gleznelor te limitează',
  }),
  deadlift: Object.freeze({
    core:           'Bara aproape de tibie; piept sus, șold împinge înainte la final',
    rationale:      'Pentru a transmite forța prin lanțul posterior fără tensiune lombară',
    suggested_fix:  'Setează umerii deasupra barei la start, NU în spatele ei',
  }),
  bench_press: Object.freeze({
    core:           'Omoplați strânși și deprimați; bara coboară controlat la stern',
    rationale:      'Pentru a stabiliza umărul și a maximiza contribuția pieptului',
    suggested_fix:  'Mărește arc-ul lombar puțin dacă bara te ajunge prea sus',
  }),
  overhead_press: Object.freeze({
    core:           'Strânge fesierii și abdomenul; bara urcă în linie verticală',
    rationale:      'Pentru a evita extensia lombară și a maximiza forța deltoidiană',
    suggested_fix:  'Pornește cu bara puțin sub bărbie, NU prea jos',
  }),
  row: Object.freeze({
    core:           'Trage cu coatele aproape de corp; strânge omoplații la final',
    rationale:      'Pentru a recruta dorsalii și romboizii eficient',
    suggested_fix:  'Menține trunchiul stabil, NU folosi impuls lombar',
  }),
  hip_thrust: Object.freeze({
    core:           'Bărbia strânsă în piept; șoldul urcă până paralel cu solul',
    rationale:      'Pentru a izola fesierii cu hiperextensie minimă',
    suggested_fix:  'Sprijinește scapula pe bancă, NU mai sus',
  }),
  pull_up: Object.freeze({
    core:           'Pornește cu omoplații deprimați; trage pieptul la bară',
    rationale:      'Pentru a iniția mișcarea cu dorsalii, nu cu bicepșii',
    suggested_fix:  'Pune un picior pe o bandă elastică dacă ai nevoie de asistență',
  }),
});

/**
 * Resolve tone style per persona per Cluster D18 Q18=D verbatim.
 *
 * @param {import('./types.js').Persona|null|undefined} persona
 * @returns {import('./types.js').ToneStyle}
 */
export function toneStyleForPersona(persona) {
  if (typeof persona !== 'string') return TONE_STYLE.SUGGESTION;
  return PERSONA_TONE[persona.toLowerCase()] ?? TONE_STYLE.SUGGESTION;
}

/**
 * Look up form cue base text per movement (top-30 override fallback to category base).
 *
 * @param {string} movementId
 * @returns {Readonly<{core: string, rationale: string, suggested_fix: string}>}
 */
export function lookupCueBase(movementId) {
  if (typeof movementId !== 'string') {
    return BASE_LIBRARY.isolation;
  }
  const m = movementId.toLowerCase().replace(/[\s-]/g, '_');
  if (TOP_30_OVERRIDES[m]) return TOP_30_OVERRIDES[m];
  const category = resolveMovementCategory(movementId);
  return BASE_LIBRARY[category] ?? BASE_LIBRARY.isolation;
}

/**
 * Resolve cue depth per Cluster C15 Q15=B tier-aware verbatim:
 *   T0 minimal (cue text-only basic)
 *   T1+ richer (cue + rationale + suggested fix)
 *   T2+ adaptive (+ persona-aware tone richer)
 *
 * @param {import('./types.js').CalibrationTier} tier
 * @returns {string}
 */
export function cueDepthForTier(tier) {
  if (tier === CALIBRATION_TIERS.T0) return CUE_DEPTH.T0;
  if (tier === CALIBRATION_TIERS.T2) return CUE_DEPTH.T2;
  return CUE_DEPTH.T1;
}

/**
 * Apply persona-aware tone wrapper per Cluster D18 Q18=D verbatim.
 *
 * Maria rationale-first  ("De ce X? Pentru Y.")
 * Gigica suggestion      ("Sugerez X pentru Y.")
 * Marius imperative      ("X. Execute.")
 *
 * @param {Object} input
 * @param {string} input.coreText
 * @param {string} input.rationaleText
 * @param {import('./types.js').ToneStyle} input.tone
 * @returns {string}
 */
export function applyPersonaTone({ coreText, rationaleText, tone }) {
  const core = typeof coreText === 'string' ? coreText : '';
  const rat = typeof rationaleText === 'string' ? rationaleText : '';

  if (tone === TONE_STYLE.RATIONALE_FIRST) {
    // Maria: rationale-first format "De ce X? Pentru Y."
    if (!rat) return core;
    return `${rat}. ${core}.`;
  }

  if (tone === TONE_STYLE.IMPERATIVE) {
    // Marius: imperative "X. Execute."
    return `${core}. Execute.`;
  }

  // Gigica suggestion: "Sugerez X."
  return `Sugerez: ${core}.`;
}

/**
 * Compute full form cue per Cluster B + D verbatim.
 *
 * V1 text-only (Q16 GIF embedded REJECTED pre-Beta — Cluster E E16).
 *
 * @param {Object} input
 * @param {string} input.movementId
 * @param {import('./types.js').Persona|null|undefined} input.persona
 * @param {import('./types.js').CalibrationTier} input.tier
 * @param {import('./types.js').NotationStyle} input.notationStyle
 * @returns {import('./types.js').FormCue}
 */
export function computeFormCue({ movementId, persona, tier, notationStyle }) {
  const base = lookupCueBase(movementId);
  const tone = toneStyleForPersona(persona);
  const depth = cueDepthForTier(tier);

  // T0 minimal: core only, no rationale or suggested_fix
  // T1+ richer: include rationale + suggested_fix
  // T2+ adaptive: persona-aware tone wrapper applied
  const text = depth === CUE_DEPTH.T2
    ? applyPersonaTone({ coreText: base.core, rationaleText: base.rationale, tone })
    : base.core;

  /** @type {import('./types.js').FormCue} */
  const cue = {
    text,
    notation_style: notationStyle,
    tone,
  };

  if (depth !== CUE_DEPTH.T0) {
    cue.rationale = base.rationale;
    cue.suggested_fix = base.suggested_fix;
  }

  return cue;
}
