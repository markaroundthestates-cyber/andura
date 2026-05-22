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
 * DECAY_RATE_HOURS_BIG11 — REFERENCE TABLE ONLY, NU runtime SoT.
 *
 * Published cluster-level recovery rates (Schoenfeld et al. 2016 MPS
 * meta-analysis, Helms et al. 2018 Renaissance Periodization MEV/MAV/MRV,
 * Schoenfeld 2017 DOMS + neural fatigue) per ADR_ENGINE_REFACTOR §3.2.
 *
 * Runtime decay algorithm (getMuscleState in muscleMap.js) uses
 * MUSCLE_HEADS[head].recoveryHours (head-level granularity, intentionally
 * different values). Examples of intentional divergence:
 *   - picioare-quads cluster=60h here vs MUSCLE_HEADS.quad=96h (runtime)
 *   - gambe cluster=24h here vs MUSCLE_HEADS.calf=48h (runtime)
 *   - biceps cluster=24h here vs MUSCLE_HEADS.bi_long=48h (runtime)
 *
 * DO NOT modify this constant expecting runtime impact — has ZERO effect on
 * actual recovery calculations. For runtime decay changes edit MUSCLE_HEADS
 * in muscleMap.js. Kept here for: future-enhancement reference, audit
 * citation traceability, cross-engine cluster-level documentation.
 *
 * Per ENGINE-DEEPER-AUDIT chat 5 MED dual-SoT finding (2026-05-23).
 * §4.1 ZERO mutation invariant preserved — existing recovery algorithm
 * (threshold on getMuscleState aggregate) untouched.
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
