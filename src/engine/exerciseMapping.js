// ══ EXERCISE MAPPING — Estimare greutate initiala din exercitii similare ══════
//
// Legacy hand table (16 entries). Several KEYS are pre-F-1 display names
// (`Pushdown`, `Lateral Raises`) that are no longer the engineNames the library
// emits (the live CORE_AUTO names are `Cable Triceps Pushdown …`, `DB Lateral
// Raise`, …). Build #4 (F3 transfer cold-start) re-keys to the LIVE names below
// AND, as the primary source, reads the richer 657-entry `equipment_alternatives`
// library graph (getTransferSources). The legacy table stays as a curated
// fallback layer (a few cross-equipment ratios the library graph does not encode).
//
// #6 (chains-as-data) makes the EXPLICIT substitution chains the PRIMARY source in
// getTransferSources (read BEFORE equipment_alternatives); SIMILAR_EXERCISES is now
// the documented FALLBACK layer only.

import { getChainSubstitutes } from './exerciseChains.js';

export const SIMILAR_EXERCISES = {
  'Cable Curl': ['Bayesian Curl', 'Incline DB Curl'],
  'Preacher Curl': ['Bayesian Curl', 'Incline DB Curl', 'Cable Curl'],
  'Hammer Curl': ['Incline DB Curl', 'Bayesian Curl'],
  'Overhead Triceps': ['Pushdown'],
  'Pushdown': ['Overhead Triceps'],
  'Rear Delt Fly': ['Face Pulls'],
  'Face Pulls': ['Rear Delt Fly'],
  'Lateral Raises (cable)': ['Lateral Raises'],
  'Lateral Raises': ['Lateral Raises (cable)'],
  'Cable Fly': ['Pec Deck / Cable Fly', 'Pec Deck'],
  'Pec Deck': ['Pec Deck / Cable Fly', 'Cable Fly'],
  'Pec Deck / Cable Fly': ['Cable Fly', 'Pec Deck'],
  'DB Shoulder Press': ['Seated DB Press', 'Standing DB Press', 'Incline DB Press'],
  'Incline DB Press': ['DB Shoulder Press'],
  'Cable Row': ['Lat Pulldown'],
  'Lat Pulldown': ['Cable Row'],

  // ── F3 #4 RE-KEY to live CORE_AUTO engineNames (the names the engine emits) ──
  'DB Hammer Curl Standing': ['DB Curl Standing', 'Incline DB Curl', 'Bayesian Curl'],
  'DB Curl Standing': ['Incline DB Curl', 'Cable Curl', 'Bayesian Curl'],
  'Cable Triceps Pushdown Straight Bar': ['Cable Triceps Pushdown V-bar', 'Cable Triceps Pushdown Rope'],
  'Cable Triceps Pushdown Rope': ['Cable Triceps Pushdown Straight Bar', 'Cable Triceps Pushdown V-bar'],
  'Cable Triceps Pushdown V-bar': ['Cable Triceps Pushdown Straight Bar', 'Cable Triceps Pushdown Rope'],
  'DB Lateral Raise': ['Cable Lateral Raise', 'Machine Lateral Raise'],
  'Cable Lateral Raise': ['DB Lateral Raise', 'Machine Lateral Raise'],
  'Machine Lateral Raise': ['DB Lateral Raise', 'Cable Lateral Raise'],
  'Cable Rear Delt Fly': ['DB Rear Delt Fly', 'Reverse Pec Deck', 'Face Pull'],
  'DB Rear Delt Fly': ['Cable Rear Delt Fly', 'Reverse Pec Deck', 'Face Pull'],
  'Face Pull': ['Cable Rear Delt Fly', 'DB Rear Delt Fly'],

  // ── #9 swap-transfer gaps (gym-log 2026-06-11): pairs the live swap path landed
  // on but had NO transfer mapping → cold-started from scratch. Shoulder-press
  // family (DB Shoulder Press history 22.5 → Seated DB Press cold-started 30),
  // rear-delt cable↔machine, and the shrug bar↔smith pair. The library
  // equipment_alternatives already links some of these; listing them here makes the
  // FALLBACK explicit and carries the curated ratios below.
  'Seated DB Press': ['DB Shoulder Press', 'Standing DB Press', 'Incline DB Press'],
  'Standing DB Press': ['DB Shoulder Press', 'Seated DB Press', 'OHP'],
  'Reverse Pec Deck': ['Cable Rear Delt Fly', 'DB Rear Delt Fly', 'Face Pull'],
  'BB Shrug': ['Smith Machine Shrug', 'DB Shrug'],
  'Smith Machine Shrug': ['BB Shrug', 'DB Shrug'],
  'Straight-Arm Lat Pulldown': ['Lat Pulldown', 'Cable Row'],
};

// CURATED per-PAIR ratios (target_source → multiplier on the SOURCE's e1RM to get
// the TARGET's). These win over the equipment-type layer below — a hand-tuned pair
// is more specific than a generic equipment conversion. All pairs here are
// INTRA-equipment (or already unit-correct) so they do not need the layer.
export const SIMILARITY_RATIO = {
  'Cable Curl_Bayesian Curl': 0.85,
  'Preacher Curl_Bayesian Curl': 0.80,
  'Hammer Curl_Incline DB Curl': 1.1,
  'Overhead Triceps_Pushdown': 1.0,
  'Pushdown_Overhead Triceps': 1.0,
  'Cable Fly_Pec Deck / Cable Fly': 0.85,
  'Cable Fly_Pec Deck': 0.85,
  'Pec Deck_Cable Fly': 1.0,
  'DB Shoulder Press_Incline DB Press': 0.75,
  'Incline DB Press_DB Shoulder Press': 1.25,
  'Cable Row_Lat Pulldown': 1.1,
  'Lat Pulldown_Cable Row': 0.9,
  // #9 shoulder-press family — all dumbbell, same per-hand scale → ~1.0.
  'Seated DB Press_DB Shoulder Press': 1.0,
  'DB Shoulder Press_Seated DB Press': 1.0,
  'Standing DB Press_DB Shoulder Press': 1.0,
  'DB Shoulder Press_Standing DB Press': 1.0,
  'Seated DB Press_Standing DB Press': 1.0,
  'Standing DB Press_Seated DB Press': 1.0,
  // #9 rear-delt cable↔machine isolation — same external load scale → ~1.0.
  'Cable Rear Delt Fly_Reverse Pec Deck': 1.0,
  'Reverse Pec Deck_Cable Rear Delt Fly': 1.0,
  'default': 0.9,
};

// ══ #11 EQUIPMENT-TYPE CONVERSION LAYER (unit-aware cross-equipment transfer) ══
// The library equipment_alternatives graph links lifts ACROSS equipment directly
// (Flat Barbell Bench → Flat DB Press). But dumbbell loads are logged PER HAND
// while barbell/machine loads are TOTAL, so transferring the raw e1RM with the 0.9
// default seeded nonsense (gym-log 2026-06-11, verified at Daniel's request: a
// BB-bench-60 → DB seed ~54/hand, which his rack does not even carry; a DB-30/hand
// → BB seed 27, which he "whistles through"). Each cross-equipment edge needs an
// explicit per-pair ratio. Daniel's calibration anchor = the classic rule that a
// total-dumbbell load is ~75-85% of the barbell load on the same press:
//   DB bench 30/hand (= 60 total dumbbells) GREU  ↔  BB bench 60 total UȘOR
//   → his real BB bench cap ~70-75. So total-dumbbells ≈ 0.8 × barbell, and since
//     a dumbbell value is logged PER HAND (= total/2), per-hand ≈ 0.8/2 = 0.4 ×
//     barbell. Inverse: barbell ≈ 2.5 × per-hand dumbbell.
//
// Coefficients (multiplier on the SOURCE e1RM to get the TARGET). Keys are
// `targetType_sourceType` — read "seed a TARGET-type lift FROM a SOURCE-type
// e1RM" (same convention as SIMILARITY_RATIO's `Target_Source`):
//   dumbbell_barbell  0.40  — seed a per-hand DB lift FROM a barbell total: DB
//                             per-hand is 40% of the barbell total (75-85% rule
//                             /2). Anchored on Daniel's DB30 ↔ BB60-75 bench.
//   barbell_dumbbell  2.50  — seed a barbell total FROM a per-hand DB (1/0.40).
//   dumbbell_cable    0.45  — seed a per-hand DB lift FROM a CABLE STACK load. A
//   cable_dumbbell    2.20    two-arm cable stack pulls ~BOTH hands at once, so its
//                             pin load ≈ a DB TOTAL (both hands), not a per-hand DB.
//                             Anchor (gym-log 2026-06-11, Daniel's real data): Cable
//                             Curl 32 kg stack ↔ Hammer Curl 12.5-15 kg/hand (15×10
//                             Hard, 12.5×10 Just-right) → per-hand ≈ 0.45 × stack
//                             (12.5-15 / 32 ≈ 0.39-0.47, mid 0.45). Inverse stack ≈
//                             2.20 × per-hand DB. (The pre-fix 1.00 equated a both-
//                             hands stack with a per-hand DB → Hammer Curl 27.5/hand
//                             off a 32 stack — absurd.) NB this models the common
//                             TWO-ARM cable; a rare single-arm cable↔DB pair sits
//                             nearer 1.0 and would need a per-pair SIMILARITY_RATIO.
//   machine↔barbell   1.00  — conservative: a plate-loaded machine's pin/plate load
//                             ≈ a barbell total for the same pattern (no unit skew).
//                             NB: SMITH lifts carry equipment_type 'machine' in the
//                             library (no 'smith' type exists), so smith↔barbell
//                             resolves here to 1.0 — the ~8% free-bar gap is NOT
//                             modelled (would need a Smith signal the metadata does
//                             not expose; a per-pair SIMILARITY_RATIO can override
//                             a specific Smith↔barbell pair if ever needed).
//   machine_dumbbell  2.50  — seed a machine total FROM a per-hand DB (mirrors
//   dumbbell_machine  0.40    barbell↔DB).
// Same-type or unlisted-cross → 1.0 here (the caller's `default` 0.9 still applies
// only when NO equipment info is supplied — intra-equipment behavior is unchanged).
//
// CAUGHT AT THE VALIDATION BURST (static review 2026-06-11): the barbell↔dumbbell
// pair shipped INVERTED (barbell_dumbbell 0.40 / dumbbell_barbell 2.50) — under
// the target_source convention that seeded a per-hand DB at 2.5× the barbell
// total (BB60 → DB150/hand) and a barbell at 0.4× the per-hand DB. The machine↔
// dumbbell rows were correct, which exposed the contradiction. Swapped to match
// the convention + the machine rows + Daniel's real anchor.
const EQUIP_CONVERSION = /** @type {Record<string, number>} */ ({
  'dumbbell_barbell': 0.40, 'barbell_dumbbell': 2.50,
  'cable_dumbbell': 2.20, 'dumbbell_cable': 0.45,
  'machine_barbell': 1.00, 'barbell_machine': 1.00,
  'machine_dumbbell': 2.50, 'dumbbell_machine': 0.40,
});

// ══ #12 MOVEMENT-PATTERN CONVERSION LAYER (intra-family, mechanics-aware) ══════
// The MOVEMENT_FAMILY gate (dp/ceiling.js) lets a same-family lift seed across
// MOVEMENTS (legs→legs), and the EQUIP_CONVERSION layer above handles the UNIT
// skew (per-hand vs total). Neither captures a within-family MECHANICAL skew: a
// LEG PRESS moves ~2× the absolute load of a back squat (the machine removes the
// trunk/stabilizer demand), so transferring a leg-press e1RM 1:1 (machine_barbell
// 1.00) seeded Barbell Back Squat 220 kg from a 230 kg leg press (gym-log
// 2026-06-12, founder P0 DANGER: "leg press 220 ≠ squat 220 — il omoram pe Gigel").
//
// Keys are `targetPattern_srcPattern` (classifyPattern tokens, same Target_Source
// convention). This layer is MORE specific than the equipment layer (it knows the
// movement, not just the hardware) so it WINS over it; a curated NAME pair is more
// specific still and wins over BOTH. Resolved via an injected `getPattern`
// accessor (classifyPattern), keeping this module free of the ceiling.js import.
//   squat_legpress  0.45  — seed a free/hack SQUAT FROM a leg-press e1RM. Real-world
//                           back squat ≈ 0.40-0.55 × leg press (hack ≈ 0.50-0.65);
//                           0.45 is the conservative Gigel-safe value across the
//                           whole squat family (a 230 leg press → ~100 kg squat at
//                           ~7 reps, a load Gigel survives). NB a hack-squat-specific
//                           pair could justify ~0.55; 0.45 is chosen single-value
//                           because founder P0 is SAFETY (the floor) and both
//                           sentinels (back squat 80-110, hack materially < 200)
//                           pass at 0.45 — the extra precision is not worth a second
//                           constant near a danger surface.
const PATTERN_CONVERSION = /** @type {Record<string, number>} */ ({
  'squat_legpress': 0.45,
});

/**
 * Multiplier on the SOURCE exercise's e1RM to seed the TARGET. Precedence:
 *   (1) a CURATED per-pair ratio (SIMILARITY_RATIO[target_source]) — most specific;
 *   (2) the MOVEMENT-PATTERN conversion layer (PATTERN_CONVERSION[targetPat_srcPat])
 *       — only when `getPattern` is supplied AND the patterns DIFFER. Captures a
 *       within-family MECHANICAL skew the equipment layer cannot (leg press ≫ squat);
 *   (3) the EQUIPMENT-TYPE conversion layer — only when `getEquipType` is supplied
 *       AND both equipment types are known AND they DIFFER (cross-equipment). This
 *       is the unit-aware fix (DB per-hand ↔ barbell total, machine ↔ DB, …);
 *   (4) the legacy `default` (0.9) — same as before for any same-type pair or when
 *       no accessor is passed (byte-identical for callers that omit it).
 *
 * PURE — `getEquipType`/`getPattern` are injected `(name)=>…` accessors (library
 * metadata / classifyPattern), keeping this module free of those imports.
 *
 * @param {string} target
 * @param {string} source
 * @param {(name:string)=>(string|null|undefined)} [getEquipType] library equipment_type accessor
 * @param {(name:string)=>(string|null|undefined)} [getPattern] classifyPattern accessor
 * @returns {number}
 */
export function getSimilarityMultiplier(target, source, getEquipType, getPattern) {
  const ratios = /** @type {Record<string, number>} */ (SIMILARITY_RATIO);
  const curated = ratios[target + '_' + source];
  if (typeof curated === 'number') return curated; // (1) curated pair wins
  // (2) movement-pattern conversion layer (intra-family mechanical skew, e.g.
  // leg press ≫ squat) — wins over the equipment layer (knows the movement, not
  // just the hardware). Only fires for a cross-pattern pair with a listed ratio.
  if (typeof getPattern === 'function') {
    const tPat = getPattern(target);
    const sPat = getPattern(source);
    if (tPat && sPat && tPat !== sPat) {
      const pconv = PATTERN_CONVERSION[tPat + '_' + sPat];
      if (typeof pconv === 'number') return pconv;
    }
  }
  // (3) equipment-type conversion layer (cross-equipment only).
  if (typeof getEquipType === 'function') {
    const tEq = getEquipType(target);
    const sEq = getEquipType(source);
    if (tEq && sEq && tEq !== sEq) {
      const conv = EQUIP_CONVERSION[tEq + '_' + sEq];
      if (typeof conv === 'number') return conv;
    }
  }
  return ratios['default'] || 0.9; // (4) legacy default
}

// ══ F3 #4 — ordered transfer-source resolution (cross-exercise cold-start) ════
// Returns the related exercise NAMES to seed a new exercise's e1RM from, ordered
// best-first:
//   (a) the EXPLICIT substitution chains (#6 chains-as-data) — the PRIMARY,
//       deterministic source per ANDURA-CORE-LIBRARY-v2 ("EXPLICIT chains PRIMARY"),
//   (b) the library `equipment_alternatives` graph (657-entry, same movement
//       family, library-maintained),
//   (c) the legacy SIMILAR_EXERCISES hand table (documented FALLBACK layer — a few
//       cross-equipment ratios the chains/library graph do not encode),
//   (d) any CORE_AUTO sharing the same `muscle_target_primary` (last resort).
// De-duplicated, never includes the target itself. PURE — reads only the injected
// metadata accessor + the static chain data.
//
// @param {string} target the new exercise's engineName
// @param {(name:string)=>(object|null|undefined)} getMeta library metadata accessor
// @param {Iterable<string>} [activeNames] candidate pool for the muscle-match
//   last resort (the live CORE_AUTO names); omitted → muscle match skipped.
// @returns {string[]} ordered, de-duplicated related engineNames
export function getTransferSources(target, getMeta, activeNames) {
  const out = [];
  const seen = new Set([target]);
  const push = (n) => {
    if (typeof n === 'string' && n && !seen.has(n)) { seen.add(n); out.push(n); }
  };

  // (a) EXPLICIT substitution chains — PRIMARY, deterministic (#6 chains-as-data).
  for (const n of getChainSubstitutes(target)) push(n);

  // (b) library equipment_alternatives — same movement family.
  const meta = typeof getMeta === 'function' ? getMeta(target) : null;
  const eqAlts = meta && Array.isArray(meta.equipment_alternatives) ? meta.equipment_alternatives : [];
  for (const n of eqAlts) push(n);

  // (c) legacy SIMILAR_EXERCISES — documented FALLBACK (re-keyed to live names).
  const sim = /** @type {Record<string, string[]>} */ (SIMILAR_EXERCISES)[target] || [];
  for (const n of sim) push(n);

  // (c) muscle_target_primary match — last resort, only when a candidate pool
  // is supplied. Keeps the seed in the right muscle when no family link exists.
  const primary = meta && meta.muscle_target_primary;
  if (primary && primary !== 'unknown' && activeNames) {
    for (const n of activeNames) {
      if (seen.has(n)) continue;
      const m = typeof getMeta === 'function' ? getMeta(n) : null;
      if (m && m.muscle_target_primary === primary) push(n);
    }
  }
  return out;
}
