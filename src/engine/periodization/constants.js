// Periodization Engine #1 V1 constants per ADR 026 §9.1 Cluster 3-5 verbatim.
//
// Source: 03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.4
// (Cluster 3 Volume Landmarks Israetel × Persona × Goal Modifiers) +
// §9.5 (Cluster 4 Macrocycle Linear Block V1) + §9.6 (Cluster 5 Cross-Engine
// Hooks anti-cascade safeguards).
//
// ZERO fabrication beyond §9.1 spec. ZERO Date.now / Math.random — all values
// static per ADR 018 §2 deterministic contract.

/**
 * Israetel 11 grupuri musculare baseline MEV/MAV/MRV (sets/week).
 *
 * Reference: Israetel 2017 Renaissance Periodization (canonical hypertrophy
 * landmarks). Per §9.4 Cluster 3 verbatim.
 *
 * @type {Readonly<Object<string, {MEV: number, MAV: number, MRV: number}>>}
 */
export const ISRAETEL_BASELINES = Object.freeze({
  chest:      { MEV: 8,  MAV: 14, MRV: 22 },
  back:       { MEV: 10, MAV: 18, MRV: 25 },
  quads:      { MEV: 8,  MAV: 14, MRV: 20 },
  hamstrings: { MEV: 6,  MAV: 12, MRV: 20 },
  glutes:     { MEV: 6,  MAV: 12, MRV: 16 },
  shoulders:  { MEV: 8,  MAV: 16, MRV: 26 },
  biceps:     { MEV: 8,  MAV: 14, MRV: 26 },
  triceps:    { MEV: 6,  MAV: 12, MRV: 22 },
  calves:     { MEV: 8,  MAV: 14, MRV: 20 },
  abs:        { MEV: 0,  MAV: 14, MRV: 25 },
  forearms:   { MEV: 0,  MAV: 10, MRV: 20 },
});

/**
 * Persona volume modifiers (multiplicative scalar to Israetel baseline).
 * Per §9.4 Cluster 3 verbatim.
 *
 * @type {Readonly<Object<string, number>>}
 */
export const PERSONA_MODIFIERS = Object.freeze({
  maria:  0.50, // 65, recovery capacity reduced post-menopausal physiology
  gigica: 0.70, // 35, intermediate recovery capacity working professional
  marius: 1.00, // 25, full Israetel target advanced trainee young recovery
});

/**
 * Recovery green bonus range — applied multiplicatively post-persona modifier
 * dacă Vitality Layer signal aggregate (ADR 016) = green. Per §9.4 verbatim
 * "+10-15% dacă recovery green". V1 conservative pick lower bound +10% default,
 * upper bound +15% reserved future Vitality Layer maturity calibration.
 *
 * @type {Readonly<{LOW: number, HIGH: number}>}
 */
export const RECOVERY_GREEN_BONUS = Object.freeze({ LOW: 1.10, HIGH: 1.15 });

/**
 * Goal modifiers (multiplicative scalar applied to persona-adjusted baseline).
 * Per §9.4 Cluster 3 verbatim.
 *
 * @type {Readonly<Object<string, number>>}
 */
export const GOAL_MODIFIERS = Object.freeze({
  hipertrofie:  1.00, // Israetel canonical hypertrophy MEV-MAV target
  forta:        0.70, // lower volume / higher intensity per Forță template ADR 024 §1.2
  recompozitie: 0.85, // intermediate volume CUT-aware
  longevitate:  0.60, // sustainable load mobility emphasis ADR 024 §1.2
  sanatate:     0.50, // lifestyle integration controlled intensity ADR 024 §1.2
});

/**
 * Maria 65 Dual-Layer functional → Israetel mapping. Per §9.4 + §45.3 Q19
 * LOCKED: 6 movement patterns map to Israetel muscle groups.
 *
 * @type {Readonly<Object<string, ReadonlyArray<string>>>}
 */
export const MARIA_FUNCTIONAL_MAPPING = Object.freeze({
  push:   Object.freeze(['chest', 'shoulders', 'triceps']),
  pull:   Object.freeze(['back', 'biceps']),
  squat:  Object.freeze(['quads', 'glutes', 'calves']),
  hinge:  Object.freeze(['hamstrings', 'glutes', 'back']),
  carry:  Object.freeze(['forearms', 'abs', 'shoulders']),
  rotate: Object.freeze(['abs', 'back']),
});

/**
 * Mesocycle 4-week phase map per §9.3 Cluster 2 + §65.5 4 săpt clasic Option A.
 *
 * @type {Readonly<Object<number, 'LOAD'|'LOAD+'|'PEAK'|'DELOAD'>>}
 */
export const WEEK_PHASES = Object.freeze({
  1: 'LOAD',
  2: 'LOAD+',
  3: 'PEAK',
  4: 'DELOAD',
});

/**
 * DELOAD week multipliers per §9.3 Cluster 2: volume −45% / intensity −12.5%.
 *
 * @type {Readonly<{volumeMul: number, intensityMul: number}>}
 */
export const DELOAD_MULTIPLIERS = Object.freeze({
  volumeMul:    0.55,    // 1 - 0.45 = 0.55 (45% volume cut)
  intensityMul: 0.875,   // 1 - 0.125 = 0.875 (12.5% intensity cut)
});

/**
 * Block scaling intra-block per §9.5 Cluster 4 (Linear Block V1, 3 mesocycles).
 *
 * @type {Readonly<Object<number, number>>}
 */
export const BLOCK_SCALING = Object.freeze({
  1: 1.00, // M1 baseline
  2: 1.10, // M2 +10% volume accumulate
  3: 1.15, // M3 +15% volume peak
});

/**
 * Block length variants per goal (săptămâni). Per §9.5 Cluster 4 verbatim.
 *
 * @type {Readonly<{DEFAULT: number, FORTA: number}>}
 */
export const BLOCK_LENGTH_WEEKS = Object.freeze({
  DEFAULT: 12, // BUILD-only majoritar templates
  FORTA:   21, // BUILD + PEAK + TRANSITION pentru Forță
});

/**
 * Marius 5:1 dual-signal thresholds per §9.3 + §45.4 Q21 §36.82.
 * - RIR stable [1, 2] inclusive ALL 4 weeks
 * - Energy ZERO red last N sessions (default 3)
 *
 * @type {Readonly<{rirMin: number, rirMax: number, energyRedWindow: number}>}
 */
export const MARIUS_5_1_THRESHOLDS = Object.freeze({
  rirMin: 1,
  rirMax: 2,
  energyRedWindow: 3,
});

/**
 * Anti-abuse safeguards per §9.3 Cluster 2.
 * - Max 2 consecutive extensions (prevent indefinite extension exploitation)
 * - Injury block window 6 săpt (Invariant 5 Medical Safety)
 *
 * @type {Readonly<{maxConsecutiveExtensions: number, injuryBlockWindowDays: number}>}
 */
export const ANTI_ABUSE = Object.freeze({
  maxConsecutiveExtensions: 2,
  injuryBlockWindowDays:    6 * 7, // 6 săpt = 42 zile
});

/**
 * Maria adaptive override per §9.5 Cluster 4: NU advance la M2/M3 fără
 * calibration tier ≥ DEVELOPING + zero injury 6 săpt window.
 *
 * Calibration tier ordering per ADR 009 (lower → higher maturity).
 *
 * @type {Readonly<{minCalibrationTier: string, requiredTiers: ReadonlyArray<string>, injuryWindowDays: number}>}
 */
export const MARIA_ADVANCE_GATE = Object.freeze({
  minCalibrationTier: 'DEVELOPING',
  requiredTiers:      Object.freeze(['DEVELOPING', 'STABLE', 'OPTIMIZED']),
  injuryWindowDays:   6 * 7,
});

/**
 * Hard cap Layer C sanity bound per §9.6 Cluster 5 Anti-cascade safeguards:
 * intensity NU trece peste 90% 1RM regardless engine adjustments downstream.
 *
 * Cross-ref: ADR_CASCADE_DEFENSE_v1 Anti-Cascade Silent precedent.
 *
 * @type {number}
 */
export const HARD_CAP_INTENSITY_PCT_1RM = 0.90;

/**
 * Persona age boundaries V1 (resolve persona id from user.age fallback când
 * user.persona missing). Per ADR 017 demographic prior database personas.
 *
 * @type {Readonly<{mariaMinAge: number, gigicaMinAge: number}>}
 */
export const PERSONA_AGE_BOUNDARIES = Object.freeze({
  mariaMinAge:  55, // 55+ → Maria-tier (post-menopausal physiology start)
  gigicaMinAge: 30, // 30-54 → Gigica-tier; <30 → Marius-tier
});

/**
 * Energy red flag value per CDL convention. Sessions cu energy=='red' count
 * toward Marius 5:1 anti-extension trigger.
 *
 * @type {string}
 */
export const ENERGY_RED_FLAG = 'red';
