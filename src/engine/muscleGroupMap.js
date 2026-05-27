// ══ MUSCLE GROUP MAP — Big-11 RO ↔ engine head bidirectional (WP-3 MOAT) ════
// Pure data + pure helpers: zero I/O, zero app-state import.
//
// THREE muscle vocabularies coexist in the codebase; this module reconciles two
// of them that today CANNOT connect because their names mismatch:
//
//   A. Big-11 RO canonical (library SoT, ADR_ANATOMICAL_CLASSIFICATION_V1 §2):
//        piept | spate | umeri | biceps | triceps | antebrate | core |
//        picioare-quads | picioare-hamstrings | fese | gambe
//      Used by: exerciseLibrary.muscle_target_primary, weaknessDetector output,
//      specialization target_muscle_group (the value that becomes ctx.weakGroups).
//
//   B. Engine HEAD groups (fine anatomical heads, muscleMap.MUSCLE_HEADS +
//      sessionBuilder.MUSCLE_GROUP_EXERCISES keys):
//        chest_upper/chest_mid/chest_lower, delt_front/delt_mid/delt_rear,
//        tri_long/tri_lateral/tri_medial, bi_long/bi_short, lat/mid_trap/
//        rear_delt_trap/lower_back, quad, hamstring, glute, calf.
//      Used by: sessionBuilder.prioritizeWeakGroups, muscle recovery, set-count.
//
// THE BUG THIS UNBLOCKS (deferred P1): the live pipeline feeds
// sessionBuilder.buildSession a ctx.weakGroups derived from the Specialization
// engine's target_muscle_group — which is a Big-11 RO value (e.g. 'umeri',
// 'spate'). But prioritizeWeakGroups keys MUSCLE_GROUP_EXERCISES on HEAD groups
// (delt_front/delt_mid/delt_rear, ...). 'umeri' never matches a head key, so
// weakness-prioritized ordering silently no-ops. A bidirectional canonical map
// lets weakness-selection + set-count logic translate across the two vocabs.
//
// DIRECTIONALITY NOTE: head→RO is many-to-one (3 delts → 'umeri'); RO→head is
// one-to-many ('umeri' → [delt_front, delt_mid, delt_rear, rear_delt_trap]).
// Round-trip coherence: every head maps to exactly one RO group, and that RO
// group's head list contains the head back (head ∈ RO_TO_HEADS[HEAD_TO_RO[head]]).
//
// Cross-refs:
//   - 📥_inbox/wiring-audit-2026-05-26/P3-MOAT-DESIGN.md §4 (design)
//   - src/engine/weaknessDetector.js _headToGroup (head→RO regex, mirrored here)
//   - src/engine/muscleMap.js MUSCLE_HEADS (head vocabulary source)

/**
 * The 11 canonical RO muscle groups (Big-11). Library SoT vocabulary.
 * @type {readonly string[]}
 */
export const BIG11_GROUPS = Object.freeze([
  'piept',
  'spate',
  'umeri',
  'biceps',
  'triceps',
  'antebrate',
  'core',
  'picioare-quads',
  'picioare-hamstrings',
  'fese',
  'gambe',
]);

/**
 * Engine HEAD group → Big-11 RO group. Many-to-one. Covers every key in
 * muscleMap.MUSCLE_HEADS (superset of sessionBuilder.MUSCLE_GROUP_EXERCISES
 * keys), so both consumers are covered. Mirrors weaknessDetector._headToGroup.
 * @type {Readonly<Record<string, string>>}
 */
export const HEAD_TO_BIG11 = Object.freeze({
  // piept
  chest_upper:    'piept',
  chest_mid:      'piept',
  chest_lower:    'piept',
  // umeri (3 delts + rear-delt/trap blend tag)
  delt_front:     'umeri',
  delt_mid:       'umeri',
  delt_rear:      'umeri',
  rear_delt_trap: 'umeri',
  // triceps
  tri_long:       'triceps',
  tri_lateral:    'triceps',
  tri_medial:     'triceps',
  // biceps
  bi_long:        'biceps',
  bi_short:       'biceps',
  // spate (lats + traps + lower back)
  lat:            'spate',
  mid_trap:       'spate',
  lower_back:     'spate',
  // picioare
  quad:           'picioare-quads',
  hamstring:      'picioare-hamstrings',
  fese:           'fese',
  glute:          'fese',
  calf:           'gambe',
});

/**
 * Big-11 RO group → engine HEAD groups. One-to-many. Reverse of HEAD_TO_BIG11,
 * derived so the two stay in sync by construction. Groups with no engine head
 * yet modelled (antebrate, core) map to an empty list — honest: the engine has
 * no anatomical head sub-division for them today.
 * @type {Readonly<Record<string, readonly string[]>>}
 */
export const BIG11_TO_HEADS = Object.freeze(
  BIG11_GROUPS.reduce((acc, group) => {
    const heads = Object.keys(HEAD_TO_BIG11).filter((h) => HEAD_TO_BIG11[h] === group);
    acc[group] = Object.freeze(heads);
    return acc;
  }, /** @type {Record<string, readonly string[]>} */ ({})),
);

/**
 * Map an engine HEAD group to its Big-11 RO group. Returns null for unknown
 * input (NOT 'unknown' — null is the explicit not-found sentinel here).
 * @param {string} head
 * @returns {string|null}
 */
export function headToBig11(head) {
  if (typeof head !== 'string') return null;
  return HEAD_TO_BIG11[head] ?? null;
}

/**
 * Map a Big-11 RO group to the engine HEAD groups that compose it. Returns []
 * for unknown groups OR groups with no engine head modelled (antebrate, core).
 * @param {string} group
 * @returns {readonly string[]}
 */
export function big11ToHeads(group) {
  if (typeof group !== 'string') return [];
  return BIG11_TO_HEADS[group] ?? [];
}
