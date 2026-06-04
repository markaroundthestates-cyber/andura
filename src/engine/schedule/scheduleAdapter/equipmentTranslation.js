// ── Translation table USER-FACING → ENGINE EQUIPMENT IDS ─────────────────
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.
//
// Engine equipment domain (sessionBuilder.js EQUIP_MAP + coachContext.js):
//   ['matrix_cable', 'bailib_stack', 'pec_deck', 'leg_machine',
//    'leg_press_plates', 'dumbbell']
// User-facing IDs (10 picker entries) → 0..many engine IDs:

const USER_TO_ENGINE_EQUIPMENT = Object.freeze({
  'gantere':           ['dumbbell'],
  'aparat-cablu':      ['matrix_cable', 'bailib_stack'],
  'leg-press':         ['leg_press_plates'],
  'aparat-extensii':   ['leg_machine'],
  'aparat-tractiuni':  ['bailib_stack'],
  // 5 user IDs without current engine equipment mapping (recorded for future
  // engine domain expansion — bench/barbell/power-rack/banda capabilities
  // not modelled in V1 engine equipment domain):
  'banca-inclinata':   [],
  'banca-plana':       [],
  'bara-halterelor':   [],
  'power-rack':        [],
  'banda-elastica':    [],
});

// ── WP-4 selection seam: coarse equipment vocabulary ─────────────────────
// sessionBuilder selects from the 657 library and filters on the library's
// COARSE equipment_type (barbell|dumbbell|machine|cable|bodyweight|band). The
// canonical user-ID → coarse mapping + availableCoarseTypes() now live in the
// shared WP-3 module ../equipmentMap.js (imported above) — D081 SoT. The local
// bridge that previously lived here was superseded at the WP-3↔WP-4 merge.

/**
 * Translate user-facing missing equipment IDs to engine equipment domain IDs.
 * Multi-mapping: one user ID may block multiple engine IDs (e.g. 'aparat-cablu'
 * blocks both 'matrix_cable' and 'bailib_stack').
 *
 * Returns deduplicated array.
 *
 * @param {string[]} userIds
 * @returns {string[]} engine equipment IDs to mark unavailable
 */
export function translateToEngineEquipment(userIds) {
  if (!Array.isArray(userIds)) return [];
  const out = new Set();
  for (const id of userIds) {
    const mapped = USER_TO_ENGINE_EQUIPMENT[id] || [];
    for (const eng of mapped) out.add(eng);
  }
  return [...out];
}
