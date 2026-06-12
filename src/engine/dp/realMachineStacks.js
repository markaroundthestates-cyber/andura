// ══ REAL MACHINE-STACK REGISTRY — the founder's gym pin-loaded stacks ════════════
// (Gym-log arc follow-up, founder LIVE session 2026-06-12 — _LADDER_SNAP_2026-06-12.md.)
//
// PROBLEM this closes: the recommended weight is snapped by config/weights.js'
// GENERIC hard-coded EQUIPMENT_WEIGHTS table (the cold-start safety net) — NOT the
// gym's REAL pin stack. The DUMBBELL + CABLE ladders in that table already happen to
// carry the founder's real rungs (so DB / cable recs snap fine), but the PIN-MACHINE
// stations route to placeholder grids whose rungs DO NOT EXIST on his machines:
//   - Cable Row → 'bailib_stack' [5,10,15..80]  → a rec of 73/75/70/77 is "on-grid"
//     there but his real "ramat" stack is 6,12,18..90 → 70/73/75 are NOT real rungs.
//   - Reverse Pec Deck → 'light_iso_cable' (carries 22.5) → his pec-deck is a step-6
//     stack (6,12,18,24..) with NO 22.5 → he hand-corrected 22.5 → 24.
//   - Shoulder Press machine / Smith OHP / Pec Deck / Leg Curl: likewise off his
//     real step-6 stacks.
//
// The equipmentTemplates.js LEARN-then-MATCH layer (snapToLadder's matched-template
// precedence) WOULD eventually find a real ladder from logged loads, but it needs
// >= 2 distinct matching logs first — so the FIRST few sessions (and any station the
// founder hasn't logged enough on) still surface off-grid numbers. This registry is
// the AUTHORITATIVE, zero-learning source for the founder's known machines: it feeds
// snapToLadder's CURATED-steps channel (the explicit-rungs seam, precedence
// curated > matched-template > generic), so the prescribed rec snaps to a REAL rung
// from session ONE.
//
// PURE DATA. Frozen. Zero I/O. Consumed by config/weights.js (roundToEquipmentWeight,
// behind dp_real_ladder_snap_v1) + warmupRamp.js indirectly (same snap). The four
// stacks are step-6 PIN stacks the founder measured on his machines; STACK_BY_NAME
// maps the relevant library exercises (canonical EN name) to them. ONLY the founder's
// CONFIRMED stations snap — every OTHER exercise (dumbbell / cable / barbell /
// bodyweight + any unmapped machine) keeps its existing generic ladder (byte-
// identical). NO blind equipment_type fallback: the library `machine` type can't tell
// a 6kg pin selector from a plate-loaded leg press, so guessing would snap a 200kg
// leg press onto a 6kg grid. Unmapped stations are flagged in the report for the
// founder to confirm next round (then added here explicitly).

// ── The founder's measured machine stacks (kg) — all step-6 pin stacks ──────────
/** Shoulder-press machine — 6..96 by 6 (also serves Smith OHP / machine OHP). */
const SHOULDER_STACK = Object.freeze([6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96]);
/** Pec deck (pec-deck + reverse-pec-deck share the station) — 6..96 by 6. */
const PEC_DECK_STACK = Object.freeze([6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96]);
/** Leg curl — 6..66 by 6 (shorter stack). */
const LEG_CURL_STACK = Object.freeze([6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66]);
/** Row machine ("ramat") — 6..90 by 6. */
const ROW_STACK = Object.freeze([6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90]);

// ── NO generic step-6 fallback (deliberate — see report) ────────────────────────
// An earlier draft fell unmapped pin machines back to a generic 6kg-step grid keyed
// on equipment_type==='machine'. REMOVED: the library's `machine` type lumps SELECTOR-
// PIN stations (leg curl, pec deck — 6kg pins) together with PLATE-LOADED machines
// (Leg Press, Hammer Strength, Smith — olympic plates, no pin stack at all) and heavy
// compounds, so a 6kg grid would WRONGLY snap a 200kg leg press / a 100kg Smith bench
// (and it broke the warmupRamp Leg-Press snap test). There is no reliable
// pin-vs-plate signal in the metadata, so we snap ONLY the founder's CONFIRMED
// stations below; every OTHER machine keeps its existing generic ladder (byte-
// identical). Unmapped stations are flagged in the report for founder confirmation.

// ── Explicit name → stack map (canonical EN names the composer + engine key on) ──
// Only the founder's CONFIRMED stations + their canonical variants. Everything else
// falls through to the equipment_type-keyed generic step-6 grid (resolveRealStack).
const STACK_BY_NAME = Object.freeze({
  // Row machine ("ramat") — his measured 6..90.
  'Cable Row': ROW_STACK,
  // Reverse Pec Deck reads on the PEC-DECK station (he corrected 22.5 → 24).
  'Reverse Pec Deck': PEC_DECK_STACK,
  // Pec deck (chest) — same station family.
  'Pec Deck / Cable Fly': PEC_DECK_STACK,
  // Shoulder-press machine + Smith OHP — his measured 6..96 shoulder stack.
  'Machine Shoulder Press': SHOULDER_STACK,
  'Smith OHP': SHOULDER_STACK,
  // Leg curl (seated/standing/base) — his measured 6..66.
  'Leg Curl': LEG_CURL_STACK,
  'Seated Leg Curl': LEG_CURL_STACK,
  'Standing Leg Curl': LEG_CURL_STACK,
});

/**
 * The real-machine stack rungs for one exercise, or null when none applies.
 * Returns the EXPLICIT founder-measured station mapped by canonical EN name (the four
 * confirmed stacks + their variants); ANY other name → null, so the caller keeps its
 * existing ladder (dumbbell / cable / barbell / bodyweight + every unmapped machine
 * are untouched — byte-identical). PURE + defensive (zero throw): a bad name → null.
 *
 * @param {string} engineName ENGLISH canonical name (the equipment-map key)
 * @returns {ReadonlyArray<number>|null} the real rungs, or null
 */
export function resolveRealStack(engineName) {
  if (typeof engineName !== 'string' || !engineName) return null;
  return STACK_BY_NAME[engineName] || null;
}

// Introspection exports (tests + a future founder-confirm UI). Frozen.
export const REAL_STACKS = Object.freeze({
  SHOULDER_STACK,
  PEC_DECK_STACK,
  LEG_CURL_STACK,
  ROW_STACK,
});
export { STACK_BY_NAME };
