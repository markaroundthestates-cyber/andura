// Cluster C Application Strategy + Volume/Frequency + Exit per ADR 026 §9.6.3
// verbatim.
//
// C1 Hibrid Volume + Frequency under MRV §42.9 invariant 1 immutable (Q7=C):
//    Volume modifier = +30% V1 default sub MRV cap absolute respect.
//    Frequency modifier = +1 weekly session.
//    Both layered concurrent (NU exclusive choice — combinatorial recovery
//    stimulus signal).
// C2 Partial -25% reduction other groups maintenance (Q8=B):
//    Other groups (non-target) volume reduced -25% maintenance dose only.
//    Redirect recovery bandwidth toward weakness target (zero-sum recovery
//    budget biological constraint).
// C3 Fixed 4 weeks exit (Q9=A simplicity V1):
//    4-week mesocycle window deterministic exit. Adaptive early exit non-
//    responders defer v1.5 (§9.6.6 Reconsideration Trigger 3).
// C4 "Bloc focus [Grupa]" Bugatti craft RO terminology (Q17=C):
//    UI label RO native NU Englez calque (anti-friction Maria/Gigica
//    accessibility, Marius RO native preferred).
// C5 Volume/Frequency modifier targeting accumulation phases ONLY:
//    Q11=B PARALLEL modifier preserve §1.10 anti-cascade. PEAK + DELOAD phases
//    incompatible (high intensity / recovery conflict).
//
// Pure functions — no side effects.

import {
  ELIGIBLE_PERIODIZATION_PHASES,
  VOLUME_REDUCTION_OTHER_GROUPS_PCT,
  VOLUME_MODIFIER_TARGET_PCT,
  FREQUENCY_MODIFIER_TARGET_SESSIONS,
  APPLICATION_MODE,
  MESOCYCLE_DURATION_WEEKS,
  SPECIALIZATION_LABEL_RO_PREFIX,
} from './constants.js';

/**
 * Capitalize first letter of muscle group RO label per Cluster C4 Q17=C
 * verbatim. "Bloc focus [Grupa]" UI label format.
 *
 * @param {string|null|undefined} group
 * @returns {string} Capitalized group label or empty
 */
function capitalizeGroup(group) {
  if (typeof group !== 'string' || group.length === 0) return '';
  return group.charAt(0).toUpperCase() + group.slice(1).toLowerCase();
}

/**
 * Translate muscle group ID to RO native label per Cluster C4 Bugatti craft.
 *
 * V1 expanded post-C4.4: Big 11 RO canonical V1 input (post C4.2 Weakness
 * Detector `a35d362` _headToGroup() output — piept/spate/umeri/biceps/triceps/
 * antebrate/core/picioare-quads/picioare-hamstrings/fese/gambe). RO native
 * labels per Cluster C4 Q17=C anti-friction.
 *
 * Backwards-compat Big 6 EN fallback preserved cap-coadă cleanup C4.5 Coach
 * Director (downstream consumers migration window).
 *
 * @param {string|null|undefined} group
 * @returns {string} RO native group label
 */
export function translateGroupToRO(group) {
  if (typeof group !== 'string') return '';
  const map = {
    // Big 11 RO canonical V1 (C4.2 Weakness Detector output post-`a35d362`)
    piept:                 'Piept',
    spate:                 'Spate',
    umeri:                 'Umeri',
    biceps:                'Biceps',
    triceps:               'Triceps',
    antebrate:             'Antebrate',
    core:                  'Core',
    'picioare-quads':      'Cvadriceps',
    'picioare-hamstrings': 'Ischiogambieri',
    fese:                  'Fese',
    gambe:                 'Gambe',

    // Backwards-compat Big 6 EN fallback (cap-coadă cleanup C4.5 Coach Director
    // downstream consumers migration window)
    chest:     'Piept',
    back:      'Spate',
    shoulders: 'Umeri',
    legs:      'Picioare',
  };
  const lower = group.toLowerCase();
  return map[lower] ?? capitalizeGroup(group);
}

/**
 * Build UI label per Cluster C4 Q17=C verbatim — "Bloc focus [Grupa]" RO
 * native terminology Bugatti craft signature.
 *
 * @param {string|null|undefined} group
 * @returns {string}
 */
export function buildUiLabel(group) {
  const ro = translateGroupToRO(group);
  if (!ro) return SPECIALIZATION_LABEL_RO_PREFIX;
  return `${SPECIALIZATION_LABEL_RO_PREFIX} ${ro}`;
}

/**
 * Check if Periodization phase eligible for specialization modifier
 * application per Cluster C5 Q11=B PARALLEL modifier verbatim.
 *
 * Eligible phases: ACCUMULATION + LOAD (extra volume/frequency target weakness).
 * NU eligible: PEAK (high intensity emphasis) + DELOAD (Engine #4 standard
 * deload week 4 preserved non-negotiable Q12=A — Cluster D D2 cross-ref).
 *
 * @param {string|null|undefined} periodizationPhase
 * @returns {boolean}
 */
export function isApplicationPhaseEligible(periodizationPhase) {
  if (typeof periodizationPhase !== 'string') return false;
  return ELIGIBLE_PERIODIZATION_PHASES.includes(periodizationPhase.toUpperCase());
}

/**
 * Compute volume modifier emit per Cluster C1 Q7=C + C2 Q8=B + C5 Q11=B
 * verbatim — bundle target group volume increase + frequency increase + other
 * groups -25% maintenance + MRV §42.9 invariant 1 cap respect.
 *
 * V1 conservative: modifier applied ONLY if Periodization phase eligible
 * (ACCUMULATION/LOAD). PEAK/DELOAD phases → modifier suspended (return zeros).
 *
 * @param {Object} input
 * @param {string|null} [input.targetGroup]
 * @param {string} [input.periodizationPhase]      - ACCUMULATION/LOAD/PEAK/DELOAD
 * @param {boolean} [input.specializationActive]   - True daca proposal accepted Q15=B
 * @returns {import('./types.js').VolumeModifier}
 */
export function computeVolumeModifier({
  targetGroup,
  periodizationPhase,
  specializationActive,
}) {
  const safeTarget = typeof targetGroup === 'string' ? targetGroup.toLowerCase() : null;
  const eligible = isApplicationPhaseEligible(periodizationPhase);
  const active = specializationActive === true && safeTarget !== null && eligible;

  if (!active) {
    return {
      targetGroup:                safeTarget,
      volumeIncreasePct:          0,
      frequencyIncreaseSessions:  0,
      otherGroupsReductionPct:    0,
      mode:                       APPLICATION_MODE.HYBRID,
      mrvCapRespected:            true, // zero modifier always respects cap
      rationale: !active && !specializationActive
        ? 'specialization_not_active_no_modifier_emit'
        : (!active && !eligible
            ? `periodization_phase_${periodizationPhase}_not_accumulation_or_load_modifier_suspended_q11_b_q12_a_d2_cross_ref`
            : `target_${safeTarget ?? 'null'}_modifier_zero`),
    };
  }

  // Active eligible → emit hybrid modifier per Cluster C1 + C2
  return {
    targetGroup:                safeTarget,
    volumeIncreasePct:          VOLUME_MODIFIER_TARGET_PCT,
    frequencyIncreaseSessions:  FREQUENCY_MODIFIER_TARGET_SESSIONS,
    otherGroupsReductionPct:    VOLUME_REDUCTION_OTHER_GROUPS_PCT,
    mode:                       APPLICATION_MODE.HYBRID,
    // V1 invariant 1 always respected by construction — caller (orchestrator)
    // applies modifier sub MRV cap absolute (anti-injury risk universal). Q7=C
    // Hibrid Volume + Frequency under MRV §42.9 invariant 1 immutable.
    mrvCapRespected:            true,
    rationale: `hybrid_volume_${VOLUME_MODIFIER_TARGET_PCT}_frequency_+${FREQUENCY_MODIFIER_TARGET_SESSIONS}_other_groups_${VOLUME_REDUCTION_OTHER_GROUPS_PCT}_target_${safeTarget}_phase_${periodizationPhase}_q7_c_q8_b_q11_b_mrv_cap_respect`,
  };
}

/**
 * Compute mesocycle progress emit per Cluster A1 6-field blueprint + Cluster
 * C3 Q9=A fixed 4 weeks exit verbatim.
 *
 * @param {Object} input
 * @param {number} [input.weeksElapsed]            - Weeks since specialization activation start
 * @param {boolean} [input.specializationActive]
 * @returns {import('./types.js').MesocycleProgress}
 */
export function computeMesocycleProgress({ weeksElapsed, specializationActive }) {
  if (specializationActive !== true) {
    return {
      currentWeek: 0,
      totalWeeks:  MESOCYCLE_DURATION_WEEKS,
      exiting:     false,
      rationale:   'specialization_not_active_no_mesocycle_progress',
    };
  }

  const elapsed = Number.isFinite(weeksElapsed) && weeksElapsed >= 0 ? weeksElapsed : 0;
  const currentWeek = Math.min(Math.floor(elapsed) + 1, MESOCYCLE_DURATION_WEEKS);
  const exiting = elapsed >= MESOCYCLE_DURATION_WEEKS;

  return {
    currentWeek,
    totalWeeks:  MESOCYCLE_DURATION_WEEKS,
    exiting,
    rationale: exiting
      ? `mesocycle_completed_exit_week_${currentWeek}_of_${MESOCYCLE_DURATION_WEEKS}_q9_a_fixed_exit_entering_cooldown_q10_b`
      : `mesocycle_in_progress_week_${currentWeek}_of_${MESOCYCLE_DURATION_WEEKS}_q9_a`,
  };
}
