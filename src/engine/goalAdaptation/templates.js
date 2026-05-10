// Cluster 2 — 5 Templates Primary + Mode Overlay + RECOMP Sub-Phase per
// ADR 026 §9.2.2 verbatim.
//
// 5 templates V1 (NU 8 — misnumber legacy §26 rezolvat ADR 024 §2.1 Q1 LOCKED).
// Algorithmic generation runtime ~25 base config × persona modifiers ×
// goal modifiers — NU 180 hardcoded combinations per ADR 024 §2.2 Q2 LOCKED.
//
// Pure functions — no side effects, no state reads.

import {
  TEMPLATE_IDS,
  GOAL_TO_TEMPLATE,
  RECOMP_THRESHOLDS,
  SEX,
} from './constants.js';

/**
 * Resolve template id from goal id per §9.2.2 + ADR 024 §1.2 enumerare verbatim.
 *
 * @param {string} goalId - 'forta' | 'hipertrofie' | 'recompozitie' | 'longevitate' | 'sanatate'
 * @returns {string}
 */
export function resolveTemplateId(goalId) {
  return GOAL_TO_TEMPLATE[goalId] ?? TEMPLATE_IDS.tonifiere_definire;
}

/**
 * Detect newbie effect — first 12 weeks training per RECOMP_THRESHOLDS §9.2.2.
 *
 * @param {{trainingWeeks?: number}} [user]
 * @returns {boolean}
 */
export function isNewbieEffect(user) {
  if (!user) return false;
  const weeks = Number(user.trainingWeeks);
  if (!Number.isFinite(weeks)) return false;
  return weeks <= RECOMP_THRESHOLDS.newbieMaxWeeks;
}

/**
 * Detect detrained return — gap >6 weeks since last session per §9.2.2.
 *
 * @param {ReadonlyArray<{daysAgo?: number}>} [recentSessions]
 * @returns {boolean}
 */
export function isDetrainedReturn(recentSessions) {
  if (!Array.isArray(recentSessions) || recentSessions.length === 0) return true;
  // Detrained = no session in trailing detrainedGapDays window
  const recentInWindow = recentSessions.some((s) => {
    if (!s) return false;
    const days = Number(s.daysAgo);
    return Number.isFinite(days) && days <= RECOMP_THRESHOLDS.detrainedGapDays;
  });
  return !recentInWindow;
}

/**
 * Detect fat-rich profile — BF% high baseline persona-specific per §9.2.2.
 *
 * @param {{bfPct?: number, sex?: string}} [user]
 * @returns {boolean}
 */
export function isFatRichProfile(user) {
  if (!user) return false;
  const bf = Number(user.bfPct);
  if (!Number.isFinite(bf)) return false;
  const sex = typeof user.sex === 'string' ? user.sex.toLowerCase() : SEX.MALE;
  const threshold = sex === SEX.FEMALE
    ? RECOMP_THRESHOLDS.bfPctHighFemale
    : RECOMP_THRESHOLDS.bfPctHighMale;
  return bf >= threshold;
}

/**
 * Detect RECOMP sub-phase auto-detection per §9.2.2 + ADR 024 §2.5 Q5 LOCKED:
 * RECOMP detectat in Tonifiere/Slabire pentru:
 *   - Newbie effect (first 12 weeks training)
 *   - Detrained return (>6 weeks gap)
 *   - Fat-rich profile (BF% high baseline)
 *
 * NU template separate — sub-phase auto-detected. UI shows MAINTAIN, distinction
 * CDL only (engine logs phase: 'RECOMP' in trace audit trail).
 *
 * @param {Object} input
 * @param {string} input.templateId
 * @param {{trainingWeeks?: number, bfPct?: number, sex?: string}} [input.user]
 * @param {ReadonlyArray<Object>} [input.recentSessions]
 * @returns {{isRecomp: boolean, reasons: string[]}}
 */
export function detectRecompSubPhase({ templateId, user, recentSessions }) {
  const reasons = [];
  // RECOMP only detectable in Tonifiere/Slabire per §9.2.2 verbatim
  const eligibleTemplates = [TEMPLATE_IDS.tonifiere_definire, TEMPLATE_IDS.slabire];
  if (!eligibleTemplates.includes(templateId)) {
    return { isRecomp: false, reasons };
  }

  if (isNewbieEffect(user)) reasons.push('newbie_effect_first_12_weeks');
  if (isDetrainedReturn(recentSessions)) reasons.push('detrained_return_gap_6w');
  if (isFatRichProfile(user)) reasons.push('fat_rich_profile_bf_high');

  return { isRecomp: reasons.length > 0, reasons };
}
