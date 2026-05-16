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
 * for downstream model expansion. Same pattern as existing `core`.
 */
export const GROUP_HEAD_MAP_BIG11 = {
  piept:                  ['chest_upper', 'chest_mid', 'chest_lower'],
  spate:                  ['lat', 'mid_trap', 'lower_back'],
  umeri:                  ['delt_front', 'delt_mid', 'delt_rear', 'rear_delt_trap'],
  biceps:                 ['bi_long', 'bi_short'],
  triceps:                ['tri_long', 'tri_lateral', 'tri_medial'],
  antebrate:              [],
  core:                   [],
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

/**
 * DECAY_RATE_HOURS_BIG11 — Differential decay rates per cluster (hours)
 * Per ADR_ENGINE_REFACTOR §3.2 research-backed:
 *   - Schoenfeld et al. 2016 MPS meta-analysis (MPS elevated 24-48h post-training)
 *   - Helms et al. 2018 Renaissance Periodization MEV/MAV/MRV framework
 *   - Schoenfeld 2017 (large compound ~48-72h DOMS + neural fatigue)
 *
 * Published reference table — consumed downstream for cross-engine reference
 * + future enhancement. Existing recovery algorithm (threshold on
 * getMuscleState aggregate) preserved invariant per §4.1 ZERO mutation.
 */
export const DECAY_RATE_HOURS_BIG11 = {
  piept:                  48,
  spate:                  60,
  umeri:                  36,
  biceps:                 24,
  triceps:                24,
  antebrate:              12,
  core:                   24,
  'picioare-quads':       60,
  'picioare-hamstrings':  60,
  fese:                   48,
  gambe:                  24,
};

/**
 * BIG11_GROUPS — Ordered canonical V1 list for iteration + cascade routing
 */
export const BIG11_GROUPS = Object.keys(GROUP_HEAD_MAP_BIG11);
