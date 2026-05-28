// Goal Adaptation Engine #2 V1 types per ADR 026 §9.2 Cluster 1 + ADR 018 §2
// Standardized Dimension Contract.
//
// GoalAdaptationResult extends DimensionResult per ADR 018 §2 — adds 6 blueprint
// fields in `meta` per §9.2.1 Cluster 1 verbatim.
//
// Per ADR 005 Vanilla JS: types pinned via JSDoc typedefs (NU TypeScript).

/**
 * 4 nutrition phases auto-derived per Cluster 3 §9.2.3.
 *
 * @typedef {'CUT'|'BULK'|'MAINTAIN'|'RECOMP'} NutritionPhase
 */

/**
 * 4 templates V1 post §obiectiv-drop-longevitate 2026-05-28 (longevitate
 * template dropped, semantic dup of sanatate_generala — ambele MAINTAIN).
 *
 * @typedef {'forta_dezvoltare'|'tonifiere_definire'|'slabire'|'sanatate_generala'} TemplateId
 */

/**
 * Mode overlay binary toggle per §9.2.2 Cluster 2 + ADR 024 §1.3 Big 6
 * lifecycle Editabile category.
 *
 * @typedef {'estetica'|'forta'|'none'} ModeOverlay
 */

/**
 * Push-back tier 3-tier proportional per §9.2.5 Cluster 5.
 *
 * @typedef {'TIER_1_SILENT'|'TIER_2_BANNER'|'TIER_3_MODAL'} PushBackTier
 */

/**
 * Macro split blueprint emit field 3 per §9.2.1 Cluster 1.
 *
 * Carb computed remainder template-variable (post protein + fat + kcal target).
 *
 * @typedef {Object} MacroSplit
 * @property {number} protein_g_per_kg_lbm  - 1.6-2.2 g/kg LBM band
 * @property {number} fat_g_per_kg          - 0.8-1.0 g/kg floor hormonal
 * @property {number} carb_g                - remainder (kcal_target − protein_kcal − fat_kcal) / 4
 */

/**
 * Goal Adaptation-specific blueprint emit (lives in DimensionResult.meta per
 * §9.2.1 Cluster 1 + ADR 018 §2 dimension-specific meta convention). 6 fields
 * verbatim Source 1 line 43.
 *
 * @typedef {Object} GoalAdaptationBlueprint
 * @property {NutritionPhase} phase                         - Auto-derived (NU user pick) per Cluster 3
 * @property {number} kcal_target_delta_pct                 - TDEE multiplier per phase × goal × persona
 * @property {MacroSplit} macro_split                       - Protein + fat + carb split bands
 * @property {[number, number]} rep_range_modifier          - [min, max] integer pair per (template, phase) tabel
 * @property {[number, number]} rir_target_modifier         - [floor, ceiling] integer pair per (template, phase) tabel
 * @property {[number, number]} rest_time_modifier          - [min, max] secunde inter-set per template × phase
 */

/**
 * Push-back signal emitted catre UI layer per §9.2.5 Cluster 5 (consumed by
 * Stage 3 ENHANCEMENT per ADR 018 §3 Decision Cluster).
 *
 * @typedef {Object} PushBackSignal
 * @property {PushBackTier} tier                  - Tier 1/2/3 proportional cu risc
 * @property {number} riskScore                   - Additive risk score 0..N
 * @property {string[]} reasons                   - Human-readable reasons (e.g. 'bf_pct_high', 'age_60_plus')
 * @property {{volumeMul: number, intensityCap: number}} [conservativeModifiers]  - Tier 3 modifiers cap
 */

/**
 * GoalAdaptationResult — extends DimensionResult per ADR 018 §2.
 *
 * @typedef {Object} GoalAdaptationResult
 * @property {string}                    id              - Always 'goalAdaptation'
 * @property {'none'|'LOW'|'MED'|'HIGH'} tier            - V1 default 'MED' when computed; 'none' when insufficient ctx
 * @property {'low'|'medium'|'high'}     confidence      - Based on ctx data completeness
 * @property {string[]}                  signals         - Human-readable signal IDs (e.g. 'phase_recomp_newbie', 'pushback_tier_3_modal')
 * @property {Array<Object>}             recommendations - V1 empty (orchestrator-level concern); future Stage 3 emission
 * @property {Object}                    trace           - Free-form debug info (cluster computations transparency)
 * @property {GoalAdaptationBlueprint}   meta            - Goal Adaptation-specific blueprint (6 fields §9.2.1 Cluster 1)
 */

/**
 * Re-prompt evaluation outcome per §9.2.5 Cluster 5 anti-spam logic + ADR 024
 * §2.8 Q8 LOCKED.
 *
 * @typedef {Object} RepromptDecision
 * @property {boolean} shouldPrompt              - True daca re-prompt due (toate cooldowns + cap respected)
 * @property {string[]} blockedReasons           - Empty when shouldPrompt = true; otherwise reasons (e.g. 'cooldown_post_confirm', 'cap_per_year_reached')
 */

export {};
