// ══ EQUIPMENT MAP — Coarse equipment_type canonical SoT (WP-3 MOAT revive) ══
// Pure data + pure helpers: zero I/O, zero app-state import.
//
// D081 LOCKED V1: the library's coarse `equipment_type` (exerciseLibrary.js) is
// the single source of truth for equipment. The fine-grained sala-pilot IDs
// (matrix_cable / bailib_stack / pec_deck / leg_machine / leg_press_plates) are
// abandoned as the selection vocabulary — they were a single-gym assumption and
// do not generalize to "se adapteaza la sala TA". This module reconciles the
// three equipment vocabularies that coexist in the codebase:
//
//   1. COARSE (library SoT): barbell | dumbbell | machine | cable | bodyweight | band
//   2. USER-FACING (AparateLipsa picker): 10 IDs (gantere, bara-halterelor, ...)
//   3. LEGACY FINE (engine, scheduleAdapter ENGINE_EQUIPMENT_DOMAIN): matrix_cable,
//      bailib_stack, pec_deck, leg_machine, leg_press_plates, dumbbell
//
// WP-3 SCOPE (this file + the sessionBuilder coarse-filter swap): the vocabulary
// + mapping layer only. The full selection pool rewrite (pool-from-657, tier
// filtering, deterministic N) is WP-4 — a later agent consumes the exports here.
//
// Cross-refs:
//   - 📥_inbox/wiring-audit-2026-05-26/P3-MOAT-DESIGN.md §3.2, §4 (design)
//   - DECISIONS.md §D081 (coarse equipment_type = SoT, abandon fine-grained)

/**
 * The 6 coarse equipment types — library `equipment_type` domain. This is the
 * selection/substitution source of truth per D081.
 * @type {readonly string[]}
 */
export const COARSE_EQUIPMENT_TYPES = Object.freeze([
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'band',
]);

/**
 * The 10 user-facing AparateLipsa picker IDs → coarse equipment_type(s).
 * Every one of the 10 resolves to >= 1 coarse type, so no picker item is a
 * dead no-op (the audit's "5/10 map to [] = dead" gap — fixed here).
 *
 * Mapping rationale:
 *   - gantere            → dumbbell
 *   - bara-halterelor    → barbell
 *   - aparat-cablu       → cable (cabluri / scripete)
 *   - power-rack         → barbell + machine (rack/Smith enable barbell + guided
 *                          machine lifts; missing it blocks both)
 *   - banda-elastica     → band
 *   - leg-press          → machine
 *   - aparat-extensii    → machine (leg extension / leg curl stations)
 *   - aparat-tractiuni   → machine + cable (pulldown stack / pull-up assist tower)
 *   - banca-inclinata    → SETUP, not a coarse equipment_type. A bench is a
 *     surface, not an `equipment_type` value in the library. Modelling it as a
 *     coarse type would be wrong (no library entry has equipment_type:'bench').
 *     Missing-bench is a setup constraint handled at selection level (WP-4 can
 *     treat incline/flat-bench-dependent exercises specially); here it maps to
 *     [] deliberately and is recorded in SETUP_ONLY_USER_IDS so callers can
 *     distinguish "intentionally not a coarse type" from "unmapped bug".
 *   - banca-plana        → SETUP (same as banca-inclinata).
 *
 * @type {Readonly<Record<string, readonly string[]>>}
 */
export const USER_EQUIPMENT_TO_COARSE = Object.freeze({
  'gantere':           Object.freeze(['dumbbell']),
  'bara-halterelor':   Object.freeze(['barbell']),
  'aparat-cablu':      Object.freeze(['cable']),
  'power-rack':        Object.freeze(['barbell', 'machine']),
  'banda-elastica':    Object.freeze(['band']),
  'leg-press':         Object.freeze(['machine']),
  'aparat-extensii':   Object.freeze(['machine']),
  'aparat-tractiuni':  Object.freeze(['machine', 'cable']),
  'banca-inclinata':   Object.freeze([]),
  'banca-plana':       Object.freeze([]),
});

/**
 * User-facing IDs that describe a SETUP (a bench surface), NOT a coarse
 * equipment_type. They map to [] in USER_EQUIPMENT_TO_COARSE on purpose — this
 * set lets callers tell "intentional setup constraint" apart from a mapping bug.
 * @type {readonly string[]}
 */
export const SETUP_ONLY_USER_IDS = Object.freeze(['banca-inclinata', 'banca-plana']);

/**
 * Legacy fine engine equipment IDs → coarse equipment_type. Bridge so that
 * existing callers passing the old fine-grained vocabulary (e.g. the current
 * sessionBuilder tests + scheduleAdapter ENGINE_EQUIPMENT_DOMAIN) still resolve
 * to the coarse SoT during the WP-3→WP-4 transition. Once WP-4 derives
 * availability from coarse types directly, this bridge can be retired.
 * @type {Readonly<Record<string, string>>}
 */
export const FINE_TO_COARSE = Object.freeze({
  matrix_cable:     'cable',
  bailib_stack:     'cable',
  pec_deck:         'machine',
  leg_machine:      'machine',
  leg_press_plates: 'machine',
  dumbbell:         'dumbbell',
});

/**
 * Normalize a mixed list of equipment identifiers (coarse types AND/OR legacy
 * fine engine IDs) to a deduplicated set of coarse equipment_type values.
 * Unknown identifiers are dropped. Bodyweight is always implicitly available
 * (callers that filter should treat bodyweight as always-performable) — it is
 * only included here if explicitly present in the input.
 *
 * @param {string[]} ids - coarse types and/or legacy fine engine IDs
 * @returns {string[]} deduplicated coarse equipment_type values
 */
export function normalizeToCoarseTypes(ids) {
  if (!Array.isArray(ids)) return [];
  const out = new Set();
  for (const id of ids) {
    if (typeof id !== 'string') continue;
    if (COARSE_EQUIPMENT_TYPES.includes(id)) {
      out.add(id);
    } else if (FINE_TO_COARSE[id]) {
      out.add(FINE_TO_COARSE[id]);
    }
  }
  return [...out];
}

/**
 * Translate user-facing missing-equipment IDs to the coarse equipment_type(s)
 * they make unavailable. Multi-mapping: one user ID may block multiple coarse
 * types (e.g. 'power-rack' blocks both 'barbell' and 'machine'). Setup-only IDs
 * (banca-*) contribute nothing here (they are a selection-level setup
 * constraint, not a coarse type).
 *
 * @param {string[]} userIds
 * @returns {string[]} deduplicated coarse equipment_type values to mark unavailable
 */
export function translateMissingToCoarse(userIds) {
  if (!Array.isArray(userIds)) return [];
  const out = new Set();
  for (const id of userIds) {
    const mapped = USER_EQUIPMENT_TO_COARSE[id] || [];
    for (const coarse of mapped) out.add(coarse);
  }
  return [...out];
}

/**
 * Derive the coarse equipment_type set AVAILABLE to a user, given their
 * missing-equipment picker selections. Starts from all 6 coarse types and
 * subtracts every coarse type fully blocked by a missing user ID.
 *
 * Bodyweight is never removable (no equipment needed) and is always retained.
 *
 * @param {string[]} missingUserIds - subset of the 10 AparateLipsa IDs
 * @returns {string[]} available coarse equipment_type values
 */
export function availableCoarseTypes(missingUserIds) {
  const blocked = new Set(translateMissingToCoarse(missingUserIds));
  blocked.delete('bodyweight'); // bodyweight is never unavailable
  return COARSE_EQUIPMENT_TYPES.filter((t) => !blocked.has(t));
}
