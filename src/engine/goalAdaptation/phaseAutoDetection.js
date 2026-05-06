// Cluster 3 — Phase Auto-Detection Nutrition per ADR 026 §9.2.3 verbatim.
//
// Phase auto-detection NU user pick (per ADR 024 §2.4 Q4 LOCKED).
// Engine derives phase runtime din persona signals + goal + sezon.
//
// TDEE multipliers verbatim §9.2.3 Cluster 3:
//   CUT conservative 0.82 / aggressive 0.75 (Marius advanced 4-6 săpt max)
//   BULK conservative 1.08 / aggressive 1.15 (newbie + Forță combo)
//   MAINTAIN 1.00 / RECOMP ±2%
//   DELOAD week kcal +3-5% override (chiar dacă phase=CUT — recovery imperative)
//
// Macro split: protein 1.6-2.2 g/kg LBM, fat 0.8-1.0 g/kg floor hormonal,
// carb remainder template-variable (calculate post protein + fat + kcal target).
//
// Pure functions — no side effects, no Date.now / Math.random.

import {
  PHASES,
  TDEE_MULTIPLIERS,
  DELOAD_KCAL_BONUS,
  MACRO_BANDS,
  TEMPLATE_IDS,
  SEX,
} from './constants.js';
import { detectRecompSubPhase } from './templates.js';

/**
 * Goal-id → primary phase mapping per ADR 024 §1.2 + §9.2.3 verbatim:
 *   - forta:        BULK (volume support strength gain)
 *   - hipertrofie:  BULK conservative (volume support muscle gain)
 *   - recompozitie: MAINTAIN sub-phase RECOMP candidate
 *   - longevitate:  MAINTAIN (sustainable load)
 *   - sanatate:     MAINTAIN (lifestyle integration)
 *   - slabire:      CUT (kcal deficit primary)
 *
 * Special: 'slabire' goal is implicit when goalId='hipertrofie' but template
 * resolves to 'slabire' direct. Per template-id override mapping below.
 *
 * @param {string} goalId
 * @returns {import('./types.js').NutritionPhase}
 */
export function basePhaseForGoal(goalId) {
  switch (goalId) {
    case 'forta':        return PHASES.BULK;
    case 'hipertrofie':  return PHASES.BULK;
    case 'recompozitie': return PHASES.MAINTAIN;
    case 'longevitate':  return PHASES.MAINTAIN;
    case 'sanatate':     return PHASES.MAINTAIN;
    default:             return PHASES.MAINTAIN;
  }
}

/**
 * Template-id direct phase override per ADR 024 enumerare:
 *   - slabire template:        CUT (cut-focused)
 *   - forta_dezvoltare:        BULK
 *   - tonifiere_definire:      MAINTAIN sub-phase candidate
 *   - longevitate:             MAINTAIN
 *   - sanatate_generala:       MAINTAIN
 *
 * @param {string} templateId
 * @returns {import('./types.js').NutritionPhase}
 */
export function basePhaseForTemplate(templateId) {
  switch (templateId) {
    case TEMPLATE_IDS.slabire:            return PHASES.CUT;
    case TEMPLATE_IDS.forta_dezvoltare:   return PHASES.BULK;
    case TEMPLATE_IDS.tonifiere_definire: return PHASES.MAINTAIN;
    case TEMPLATE_IDS.longevitate:        return PHASES.MAINTAIN;
    case TEMPLATE_IDS.sanatate_generala:  return PHASES.MAINTAIN;
    default:                              return PHASES.MAINTAIN;
  }
}

/**
 * Compute TDEE multiplier per phase + persona × goal context.
 *
 * Aggressive variants triggered persona-specific:
 *   - CUT_AGGRESSIVE 0.75: Marius advanced 4-6 săpt max (anti-burnout cap)
 *   - BULK_AGGRESSIVE 1.15: newbie + Forță template combo
 *
 * V1 conservative defaults; aggressive variants opt-in via flags.
 *
 * @param {Object} input
 * @param {import('./types.js').NutritionPhase} input.phase
 * @param {string} [input.personaId]
 * @param {string} [input.templateId]
 * @param {boolean} [input.isNewbie]
 * @param {boolean} [input.isAggressiveOptIn] - User explicit opt-in aggressive variant (Tier 3 confirmed)
 * @returns {number}
 */
export function tdeeMultiplierForPhase({
  phase,
  personaId,
  templateId,
  isNewbie,
  isAggressiveOptIn,
}) {
  if (phase === PHASES.CUT) {
    // Aggressive cut: Marius advanced opt-in
    if (isAggressiveOptIn === true && personaId === 'marius') {
      return TDEE_MULTIPLIERS.CUT_AGGRESSIVE;
    }
    return TDEE_MULTIPLIERS.CUT_CONSERVATIVE;
  }
  if (phase === PHASES.BULK) {
    // Aggressive bulk: newbie + Forță combo
    if (isNewbie === true && templateId === TEMPLATE_IDS.forta_dezvoltare) {
      return TDEE_MULTIPLIERS.BULK_AGGRESSIVE;
    }
    return TDEE_MULTIPLIERS.BULK_CONSERVATIVE;
  }
  if (phase === PHASES.RECOMP) {
    // RECOMP ±2% — V1 conservative pick maintain (engine reads ctx for slight ±)
    return TDEE_MULTIPLIERS.MAINTAIN;
  }
  return TDEE_MULTIPLIERS.MAINTAIN;
}

/**
 * Apply DELOAD week kcal bonus override per §9.2.3 Cluster 3 verbatim:
 * "kcal +3-5% chiar dacă phase=CUT (recovery imperative)".
 *
 * V1 conservative pick LOW (1.03) default green; HIGH (1.05) reserved.
 *
 * @param {number} baseMultiplier      - Output of tdeeMultiplierForPhase
 * @param {boolean} isDeloadWeek       - True dacă mesocycle phase = DELOAD (Engine #1 §9.3 W4)
 * @returns {number}
 */
export function applyDeloadKcalOverride(baseMultiplier, isDeloadWeek) {
  if (isDeloadWeek !== true) return baseMultiplier;
  return baseMultiplier * DELOAD_KCAL_BONUS.LOW;
}

/**
 * Detect phase auto-detection runtime per §9.2.3 Cluster 3 + RECOMP sub-phase
 * §9.2.2 + ADR 024 §2.4 Q4 LOCKED.
 *
 * Engine derives phase din persona signals + goal + template + RECOMP detection.
 *
 * @param {Object} input
 * @param {string} input.goalId
 * @param {string} input.templateId
 * @param {{trainingWeeks?: number, bfPct?: number, sex?: string}} [input.user]
 * @param {ReadonlyArray<Object>} [input.recentSessions]
 * @returns {{phase: import('./types.js').NutritionPhase, signals: string[]}}
 */
export function detectPhase({ goalId, templateId, user, recentSessions }) {
  const signals = [];

  // 1. RECOMP sub-phase detection prima (Tonifiere/Slăbire context)
  const recomp = detectRecompSubPhase({ templateId, user, recentSessions });
  if (recomp.isRecomp) {
    signals.push('phase_recomp_sub_detected');
    for (const reason of recomp.reasons) signals.push(reason);
    return { phase: PHASES.RECOMP, signals };
  }

  // 2. Template-id direct override (slabire = CUT, forta_dezvoltare = BULK)
  const templatePhase = basePhaseForTemplate(templateId);
  signals.push(`phase_${templatePhase.toLowerCase()}_template_${templateId}`);
  return { phase: templatePhase, signals };
}

/**
 * Compute LBM (lean body mass) from weight + BF%. Defensive fallback când
 * BF% missing → LBM = weight × 0.85 (V1 conservative anchor).
 *
 * @param {{kg?: number, bfPct?: number}} [user]
 * @returns {number}
 */
export function computeLbm(user) {
  if (!user) return 0;
  const kg = Number(user.kg);
  if (!Number.isFinite(kg) || kg <= 0) return 0;
  const bf = Number(user.bfPct);
  if (Number.isFinite(bf) && bf > 0 && bf < 1) {
    return kg * (1 - bf);
  }
  // Defensive fallback when BF% missing
  return kg * 0.85;
}

/**
 * Compute macro split per §9.2.3 Cluster 3 verbatim:
 *   - Protein: 1.6-2.2 g/kg LBM (V1 pick midpoint 1.9)
 *   - Fat:     0.8-1.0 g/kg floor hormonal (V1 pick midpoint 0.9)
 *   - Carb:    remainder = (kcal_target − protein_kcal − fat_kcal) / 4
 *
 * @param {Object} input
 * @param {{kg?: number, bfPct?: number}} [input.user]
 * @param {number} input.tdeeKcal       - Total daily energy expenditure (kcal)
 * @param {number} input.kcalDeltaPct   - Multiplier from tdeeMultiplierForPhase
 * @returns {import('./types.js').MacroSplit}
 */
export function computeMacroSplit({ user, tdeeKcal, kcalDeltaPct }) {
  const lbm = computeLbm(user);
  const kg = (user && Number(user.kg)) || 0;
  const tdee = Number.isFinite(tdeeKcal) && tdeeKcal > 0 ? tdeeKcal : 0;
  const delta = Number.isFinite(kcalDeltaPct) && kcalDeltaPct > 0 ? kcalDeltaPct : 1.0;
  const kcalTarget = tdee * delta;

  // V1 conservative midpoint pick
  const proteinPerKgLbm = (MACRO_BANDS.proteinMinPerKgLbm + MACRO_BANDS.proteinMaxPerKgLbm) / 2;
  const fatPerKg = (MACRO_BANDS.fatMinPerKg + MACRO_BANDS.fatMaxPerKg) / 2;

  const proteinG = Math.max(0, Math.round(lbm * proteinPerKgLbm));
  const fatG = Math.max(0, Math.round(kg * fatPerKg));

  const proteinKcal = proteinG * MACRO_BANDS.kcalPerGramProtein;
  const fatKcal = fatG * MACRO_BANDS.kcalPerGramFat;
  const carbKcal = Math.max(0, kcalTarget - proteinKcal - fatKcal);
  const carbG = Math.max(0, Math.round(carbKcal / MACRO_BANDS.kcalPerGramCarb));

  return {
    protein_g_per_kg_lbm: proteinG,
    fat_g_per_kg:         fatG,
    carb_g:               carbG,
  };
}
