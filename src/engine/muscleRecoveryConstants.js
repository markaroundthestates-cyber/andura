// ══ MUSCLE RECOVERY CONSTANTS — Big 11 canonical V1 anatomical taxonomy ═══
// Per ADR_ENGINE_REFACTOR_BIG8_TO_BIG11_V1 §2 + §3.2 + §4.1 LOCK V1 2026-05-14
// Pure-function discipline ADR-026 §9 invariant preserved
// Cross-ref ADR_ANATOMICAL_CLASSIFICATION_V1 §2 muscle_target_primary 11 categorii canonical
//
// Big 6 (chest/back/shoulders/legs/arms/core) → Big 11 (piept/spate/umeri/biceps/
// triceps/antebrate/core/picioare-quads/picioare-hamstrings/fese/gambe) split:
//   arms  → biceps + triceps + antebrate
//   legs  → picioare-quads + picioare-hamstrings + fese + gambe
//
// Internal engine routing semantic NU UX user-facing per Daniel verbatim
// 2026-05-13j Gigel-test correction: "sunt invizibile pt utilizator... doar
// andura le stie".

/**
 * GROUP_HEAD_MAP_BIG11 — Big 11 canonical V1 → muscle head IDs from muscleMap.js
 * Note: `antebrate` empty (no forearm heads in muscleMap.js V1) — placeholder
 * for downstream model expansion.
 *
 * `core` maps to the synthetic `core` head. There is no dedicated bench in
 * MUSCLE_HEADS for it (the head decays via getMuscleState's default 48h rate);
 * the head is fed by the `core` SECONDARY token on the loaded compounds in
 * muscleMap.EXERCISE_MUSCLES (squat/hinge/OHP/row patterns where the trunk
 * braces isometrically). Before this, `core` was [] so the Recovery body map's
 * Core group read 'recovered' forever even after a heavy compound day —
 * misleading. NOT mirrored into muscleGroupMap.BIG11_TO_HEADS: that module
 * reconciles the LIBRARY vocabulary (no `core` head modelled there) and is a
 * separate concern from the recovery aggregation here.
 */
export const GROUP_HEAD_MAP_BIG11 = {
  piept:                  ['chest_upper', 'chest_mid', 'chest_lower'],
  spate:                  ['lat', 'mid_trap', 'lower_back'],
  umeri:                  ['delt_front', 'delt_mid', 'delt_rear', 'rear_delt_trap'],
  biceps:                 ['bi_long', 'bi_short'],
  triceps:                ['tri_long', 'tri_lateral', 'tri_medial'],
  antebrate:              [],
  core:                   ['core'],
  'picioare-quads':       ['quad'],
  'picioare-hamstrings':  ['hamstring'],
  fese:                   ['glute'],
  gambe:                  ['calf'],
};

/**
 * GROUP_LABELS_RO_BIG11 — Romanian-first display labels per canonical V1 group
 * Per ADR_ENGINE_REFACTOR §4.1 acceptance criteria wording
 */
export const GROUP_LABELS_RO_BIG11 = {
  piept:                  'Pieptul',
  spate:                  'Spatele',
  umeri:                  'Umerii',
  biceps:                 'Bicepsul',
  triceps:                'Tricepsul',
  antebrate:              'Antebratele',
  core:                   'Core-ul',
  'picioare-quads':       'Quadricepsul',
  'picioare-hamstrings':  'Hamstringii',
  fese:                   'Fesele',
  gambe:                  'Gambele',
};

// Runtime recovery-hours SoT lives in MUSCLE_HEADS[head].recoveryHours
// (muscleMap.js); the prior inert DECAY_RATE_HOURS_BIG11 cluster-level
// reference table (zero runtime readers) was removed to collapse the dual
// source of truth — see F0 dedup. For recovery-decay changes edit MUSCLE_HEADS.

/**
 * BIG11_GROUPS — Ordered canonical V1 list for iteration + cascade routing
 */
export const BIG11_GROUPS = Object.keys(GROUP_HEAD_MAP_BIG11);

/**
 * PAIN_REGION_GROUP_MAP — PainButton BodyRegion -> Big 11 canonical group(s).
 * Wires ADR-ENGINE-MATH-LOCKED-VALUES section 9 Pain CDL -> Recovery
 * consumption: a reported pain region escalates the recovery state of the
 * muscle group(s) anatomically loaded by movement of that region (NU the joint
 * itself — the Big 11 taxonomy is muscle-based, joints map to prime movers).
 *
 * Region IDs verbatim from PainButton.tsx BodyRegion union (15 regions).
 * Multi-group entries (cot/genunchi) reflect joints crossed by two groups:
 *   - cot (elbow): biceps (flexor) + triceps (extensor)
 *   - genunchi (knee): picioare-quads (extensor) + picioare-hamstrings (flexor)
 * gat (neck) -> umeri: umeri group includes rear_delt_trap (upper-trap head).
 * incheietura (wrist) -> antebrate (forearm placeholder group, antebrate=[]).
 * sold (hip) -> fese (gluteal prime mover).  glezna (ankle) -> gambe (calf).
 */
export const PAIN_REGION_GROUP_MAP = {
  'gat':                   ['umeri'],
  'umar-stang':            ['umeri'],
  'umar-drept':            ['umeri'],
  'piept':                 ['piept'],
  'spate':                 ['spate'],
  'lombar':                ['spate'],
  'cot-stang':             ['biceps', 'triceps'],
  'cot-drept':             ['biceps', 'triceps'],
  'incheietura-stanga':    ['antebrate'],
  'incheietura-dreapta':   ['antebrate'],
  'sold':                  ['fese'],
  'genunchi-stang':        ['picioare-quads', 'picioare-hamstrings'],
  'genunchi-drept':        ['picioare-quads', 'picioare-hamstrings'],
  'glezna-stanga':         ['gambe'],
  'glezna-dreapta':        ['gambe'],
};
