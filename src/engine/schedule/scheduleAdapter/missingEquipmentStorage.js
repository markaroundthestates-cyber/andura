// ── Missing equipment list storage (edges) ────────────────────────────────
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.

import { MISSING_EQUIPMENT_KEY, VALID_EQUIPMENT_IDS } from './constants.js';

/**
 * Read missing-equipment list from localStorage, filter to known valid IDs.
 * Strips legacy single-string format from S1.5 era (exercise names pushed
 * before list-based normalization 2026-05-12) — parity mockup S1.7 demo JS
 * hydrateAparateLipsa() filter validIds.
 *
 * @returns {string[]} list of valid equipment IDs (subset of VALID_EQUIPMENT_IDS)
 */
export function getMissingEquipment() {
  let raw = null;
  try { raw = localStorage.getItem(MISSING_EQUIPMENT_KEY); } catch { return []; }
  if (!raw) return [];
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(e => typeof e === 'string' && VALID_EQUIPMENT_IDS.includes(e));
}

/**
 * Persist missing-equipment list. Filters to valid IDs before write so storage
 * never contains junk — defense-in-depth against caller bugs.
 *
 * @param {string[]} list
 */
export function setMissingEquipment(list) {
  const safe = Array.isArray(list)
    ? list.filter(e => typeof e === 'string' && VALID_EQUIPMENT_IDS.includes(e))
    : [];
  try {
    localStorage.setItem(MISSING_EQUIPMENT_KEY, JSON.stringify(safe));
  } catch { /* noop */ }
}

/**
 * Toggle a single equipment ID in the missing list. Returns the new list.
 * Unknown IDs (not in VALID_EQUIPMENT_IDS) are silently rejected — return
 * unchanged list.
 *
 * @param {string} equipmentId
 * @returns {string[]} new list post-toggle
 */
export function toggleMissingEquipment(equipmentId) {
  if (typeof equipmentId !== 'string' || !VALID_EQUIPMENT_IDS.includes(equipmentId)) {
    return getMissingEquipment();
  }
  const current = getMissingEquipment();
  const next = current.includes(equipmentId)
    ? current.filter(e => e !== equipmentId)
    : [...current, equipmentId];
  setMissingEquipment(next);
  return next;
}
