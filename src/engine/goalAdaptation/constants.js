// Engine #2 Goal Adaptation V1 constants per ADR 026 §9.2 Cluster 1-5 verbatim.
//
// Source: 03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.2
// (Cluster 2 5 templates + Mode overlay) +
// §9.2.3 (Cluster 3 Phase auto-detection thresholds verbatim TDEE multipliers) +
// §9.2.4 (Cluster 4 Training modifiers per template × phase tabel verbatim) +
// §9.2.5 (Cluster 5 Push-back proportional 3 tiers + Re-prompt anti-spam logic).
//
// ZERO fabrication beyond §9.2 spec. ZERO Date.now / Math.random — all values
// static per ADR 018 §2 deterministic contract.

/**
 * 5 templates V1 enumerare verbatim §9.2 Cluster 2 (NU 8 — misnumber legacy
 * §26 rezolvat in favor enumerare ADR 024 §2.1 Q1 LOCKED).
 *
 * @type {Readonly<{
 *   forta_dezvoltare: 'forta_dezvoltare',
 *   tonifiere_definire: 'tonifiere_definire',
 *   slabire: 'slabire',
 *   longevitate: 'longevitate',
 *   sanatate_generala: 'sanatate_generala',
 * }>}
 */
export const TEMPLATE_IDS = Object.freeze({
  forta_dezvoltare:    'forta_dezvoltare',
  tonifiere_definire:  'tonifiere_definire',
  slabire:             'slabire',
  longevitate:         'longevitate',
  sanatate_generala:   'sanatate_generala',
});

/**
 * Goal id → template id mapping (Goal Adaptation derives template from goal
 * choice). Per ADR 024 §1.2 Q1 LOCKED enumerare verbatim.
 *
 * @type {Readonly<Object<string, string>>}
 */
export const GOAL_TO_TEMPLATE = Object.freeze({
  forta:        TEMPLATE_IDS.forta_dezvoltare,
  hipertrofie:  TEMPLATE_IDS.tonifiere_definire,
  recompozitie: TEMPLATE_IDS.tonifiere_definire,
  longevitate:  TEMPLATE_IDS.longevitate,
  sanatate:     TEMPLATE_IDS.sanatate_generala,
});

/**
 * 4 nutrition phases auto-derived per Cluster 3 §9.2.3 (NU user pick
 * §2.4 Q4 LOCKED).
 *
 * @type {Readonly<{CUT: 'CUT', BULK: 'BULK', MAINTAIN: 'MAINTAIN', RECOMP: 'RECOMP'}>}
 */
export const PHASES = Object.freeze({
  CUT:      'CUT',
  BULK:     'BULK',
  MAINTAIN: 'MAINTAIN',
  RECOMP:   'RECOMP',
});

/**
 * Phase auto-detection TDEE multipliers verbatim §9.2.3 Cluster 3 (Source 1
 * line 45 verbatim aggregation).
 *
 * Conservative defaults default; aggressive variants triggered persona-specific:
 * - CUT_AGGRESSIVE 0.75: Marius advanced 4-6 sapt max (anti-burnout cap)
 * - BULK_AGGRESSIVE 1.15: newbie + Forta template combo
 *
 * @type {Readonly<{
 *   CUT_CONSERVATIVE: number,
 *   CUT_AGGRESSIVE: number,
 *   MAINTAIN: number,
 *   BULK_CONSERVATIVE: number,
 *   BULK_AGGRESSIVE: number,
 *   RECOMP_DELTA: number,
 * }>}
 */
export const TDEE_MULTIPLIERS = Object.freeze({
  CUT_CONSERVATIVE:  0.82,
  CUT_AGGRESSIVE:    0.75,
  MAINTAIN:          1.00,
  BULK_CONSERVATIVE: 1.08,
  BULK_AGGRESSIVE:   1.15,
  RECOMP_DELTA:      0.02, // ±2% baseline
});

/**
 * DELOAD week kcal override per §9.2.3 Cluster 3 verbatim:
 * "kcal +3-5% chiar daca phase=CUT (recovery imperative)".
 *
 * V1 conservative pick LOW (1.03) default; HIGH (1.05) reserved Vitality Layer
 * maturity calibration future. Cross-engine constraint Hook Engine #4 Deload.
 *
 * @type {Readonly<{LOW: number, HIGH: number}>}
 */
export const DELOAD_KCAL_BONUS = Object.freeze({ LOW: 1.03, HIGH: 1.05 });

/**
 * Macro split bands verbatim §9.2.3 Cluster 3 (Source 1 line 45):
 * - Protein: 1.6-2.2 g/kg LBM (lean body mass, NU body weight gross)
 * - Fat:     0.8-1.0 g/kg floor hormonal (testosterone preserve)
 * - Carb:    remainder template-variable (computed post protein + fat + kcal)
 *
 * @type {Readonly<{
 *   proteinMinPerKgLbm: number, proteinMaxPerKgLbm: number,
 *   fatMinPerKg: number, fatMaxPerKg: number,
 *   kcalPerGramProtein: number, kcalPerGramFat: number, kcalPerGramCarb: number,
 * }>}
 */
export const MACRO_BANDS = Object.freeze({
  proteinMinPerKgLbm: 1.6,
  proteinMaxPerKgLbm: 2.2,
  fatMinPerKg:        0.8,
  fatMaxPerKg:        1.0,
  kcalPerGramProtein: 4,
  kcalPerGramFat:     9,
  kcalPerGramCarb:    4,
});

/**
 * Recompozitie sub-phase auto-detection thresholds per §9.2.2 Cluster 2 + ADR
 * 024 §2.5 Q5 LOCKED:
 * - Newbie effect: first 12 weeks training (trainingWeeks <= 12)
 * - Detrained return: gap >6 weeks since last session
 * - Fat-rich profile: BF% high baseline (>= bfPctHighThreshold)
 *
 * @type {Readonly<{
 *   newbieMaxWeeks: number,
 *   detrainedGapDays: number,
 *   bfPctHighMale: number,
 *   bfPctHighFemale: number,
 * }>}
 */
export const RECOMP_THRESHOLDS = Object.freeze({
  newbieMaxWeeks:   12,
  detrainedGapDays: 6 * 7, // 6 sapt = 42 zile
  bfPctHighMale:    0.25,  // 25% BF male
  bfPctHighFemale:  0.32,  // 32% BF female
});

/**
 * Tabel base training modifiers per template × phase verbatim §9.2.4 Cluster 4:
 * RIR + rep range integer pairs per template (5 templates × phase context).
 *
 * Phase modifiers applied multiplicative post-base table (Mode overlay separate).
 *
 * Rep range bands verbatim §9.2.4:
 * - Forta & Dezvoltare:   RIR 1-3, rep 3-8
 * - Tonifiere & Definire: RIR 0-2, rep 8-12
 * - Slabire:              RIR 1-2, rep 10-15
 * - Longevitate:          RIR 2-3, rep 8-12
 * - Sanatate Generala:    RIR 2-3, rep 8-12
 *
 * @type {Readonly<Object<string, {rir: [number, number], rep: [number, number]}>>}
 */
export const TEMPLATE_BASE_MODIFIERS = Object.freeze({
  forta_dezvoltare:    Object.freeze({ rir: Object.freeze([1, 3]), rep: Object.freeze([3, 8])  }),
  tonifiere_definire:  Object.freeze({ rir: Object.freeze([0, 2]), rep: Object.freeze([8, 12]) }),
  slabire:             Object.freeze({ rir: Object.freeze([1, 2]), rep: Object.freeze([10, 15]) }),
  longevitate:         Object.freeze({ rir: Object.freeze([2, 3]), rep: Object.freeze([8, 12]) }),
  sanatate_generala:   Object.freeze({ rir: Object.freeze([2, 3]), rep: Object.freeze([8, 12]) }),
});

/**
 * Rest time seconds per template (compound-heavy = longer rest, hibrid =
 * shorter). Verbatim §1.2 enumerare ADR 024 + Cluster 4 §9.2.4 inferred per-template.
 *
 * @type {Readonly<Object<string, [number, number]>>}
 */
export const TEMPLATE_REST_SECONDS = Object.freeze({
  forta_dezvoltare:    Object.freeze([120, 240]), // 2-4 min compound focus
  tonifiere_definire:  Object.freeze([60, 120]),  // 1-2 min hibrid
  slabire:             Object.freeze([45, 90]),   // 0.75-1.5 min cut-focus + conditioning
  longevitate:         Object.freeze([60, 120]),  // 1-2 min sustainable
  sanatate_generala:   Object.freeze([60, 120]),  // 1-2 min lifestyle
});

/**
 * Mode overlay multiplicative post-template × phase per §9.2.2 + §9.2.4.
 * - Estetica: emphasizes hipertrofie volume + rep range moderate
 * - Forta:    emphasizes intensity + rep range low + RIR low
 *
 * NU duplicate templates — overlay multiplicativ aplicat dupa base table.
 *
 * @type {Readonly<Object<string, {volumeMul: number, intensityMul: number, repRangeShift: number, rirShift: number}>>}
 */
export const MODE_OVERLAY = Object.freeze({
  estetica: Object.freeze({
    volumeMul:     1.05,  // +5% volume hipertrofie emphasis
    intensityMul:  0.97,  // −3% intensity (rep range moderate)
    repRangeShift: 1,     // +1 rep ceiling shift higher
    rirShift:      0,     // RIR baseline preserved
  }),
  forta: Object.freeze({
    volumeMul:     0.95,  // −5% volume forta emphasis
    intensityMul:  1.05,  // +5% intensity emphasis
    repRangeShift: -1,    // −1 rep ceiling shift lower
    rirShift:      0,     // RIR baseline preserved
  }),
  none: Object.freeze({
    volumeMul:     1.00,
    intensityMul:  1.00,
    repRangeShift: 0,
    rirShift:      0,
  }),
});

/**
 * Phase modifiers applied post-base table per (template, phase) tuple §9.2.4.
 * - CUT:    rep ceiling +2 (higher reps preserve volume despite kcal deficit) + rest −15s
 * - BULK:   rep floor +1 + RIR floor −0 (push closer to growth volume)
 * - MAINT:  baseline preserved
 * - RECOMP: baseline preserved (auto-detected sub-phase, NU explicit Vol/Int shift)
 *
 * @type {Readonly<Object<string, {repShift: number, restShift: number}>>}
 */
export const PHASE_TRAINING_MODIFIERS = Object.freeze({
  CUT:      Object.freeze({ repShift:  2, restShift: -15 }),
  BULK:     Object.freeze({ repShift:  0, restShift:  15 }),
  MAINTAIN: Object.freeze({ repShift:  0, restShift:   0 }),
  RECOMP:   Object.freeze({ repShift:  0, restShift:   0 }),
});

/**
 * Mode overlay ceiling rule per §9.2.6 Reconsideration Trigger 4 candidate:
 * Mode + Phase combined max −20% volume / +20% intensity (anti-degenerate
 * cumulative reduction violating Invariant 1 V ≤ MRV / +20% ceiling).
 *
 * Sub-trigger §9.7 Cluster 5 cross-hook ceiling rule precedent Engine #1
 * Periodization adopted V1 conservative pre-emptive.
 *
 * @type {Readonly<{volumeFloor: number, volumeCeiling: number, intensityFloor: number, intensityCeiling: number}>}
 */
export const MODE_PHASE_CEILING = Object.freeze({
  volumeFloor:     0.80, // −20% combined floor
  volumeCeiling:   1.20, // +20% combined ceiling
  intensityFloor:  0.80, // −20% combined floor
  intensityCeiling: 1.20, // +20% combined ceiling
});

/**
 * Push-back tier id verbatim §9.2.5 Cluster 5 + ADR 024 §2.7 Q7 LOCKED.
 *
 * @type {Readonly<{TIER_1_SILENT: 'TIER_1_SILENT', TIER_2_BANNER: 'TIER_2_BANNER', TIER_3_MODAL: 'TIER_3_MODAL'}>}
 */
export const PUSHBACK_TIERS = Object.freeze({
  TIER_1_SILENT: 'TIER_1_SILENT',
  TIER_2_BANNER: 'TIER_2_BANNER',
  TIER_3_MODAL:  'TIER_3_MODAL',
});

/**
 * Push-back risk-tier mapping thresholds per §9.2.5 Cluster 5 example
 * verbatim: "Forta + BF% high + age 60+ + recent injury → Tier 3 modal cu
 * volume cap MEV-50% + intensity cap 75% 1RM Layer C sanity bound".
 *
 * Risk score V1 conservative additive:
 *   +1: BF% high (>= bfPctHighThreshold persona-specific)
 *   +1: age >= 60 (Maria-tier physiology floor)
 *   +1: recent injury (within injuryWindowDays)
 *   +1: aggressive intensity goal (forta) cu age >= 60
 *
 * Tier mapping:
 *   score 0 → Tier 1 silent
 *   score 1 → Tier 2 banner
 *   score >= 2 → Tier 3 modal
 *
 * @type {Readonly<{
 *   bfPctHighMale: number, bfPctHighFemale: number,
 *   ageOlder: number, ageOlderRiskAge: number,
 *   injuryWindowDays: number,
 *   tier2Threshold: number, tier3Threshold: number,
 *   tier3MaxConservativeVolMul: number, tier3MaxConservativeIntensityCap: number,
 * }>}
 */
export const PUSHBACK_RISK_THRESHOLDS = Object.freeze({
  bfPctHighMale:        0.25,
  bfPctHighFemale:      0.32,
  ageOlder:             60,
  ageOlderRiskAge:      55,
  injuryWindowDays:     6 * 7, // 6 sapt
  tier2Threshold:       1,
  tier3Threshold:       2,
  tier3MaxConservativeVolMul:        0.50, // MEV − 50% volume cap (verbatim spec example)
  tier3MaxConservativeIntensityCap:  0.75, // 75% 1RM cap Layer C sanity bound
});

/**
 * Re-prompt anti-spam logic verbatim §9.2.5 Cluster 5 + ADR 024 §2.8 Q8 LOCKED:
 *
 * - Trigger 28 zile rolling (rolling window din ultima interactiune)
 * - Cooldown 21 zile post-confirm (user "Da, inca X" → 21 zile NU re-prompt)
 * - Cooldown 60 zile post Goal Shift (preserve calibration window §36.35)
 * - Cap absolut max 4 re-prompts/an (anti-spam hardcap)
 *
 * @type {Readonly<{
 *   triggerRollingDays: number,
 *   cooldownPostConfirmDays: number,
 *   cooldownPostGoalShiftDays: number,
 *   capPerYear: number,
 * }>}
 */
export const REPROMPT_LIMITS = Object.freeze({
  triggerRollingDays:        28,
  cooldownPostConfirmDays:   21,
  cooldownPostGoalShiftDays: 60,
  capPerYear:                4,
});

/**
 * Sex enum (lowercase) — used pentru BF% threshold persona-specific.
 *
 * @type {Readonly<{MALE: 'male', FEMALE: 'female'}>}
 */
export const SEX = Object.freeze({ MALE: 'male', FEMALE: 'female' });
