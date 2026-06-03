// Periodization Engine #1 V1 constants per ADR 026 §9.1 Cluster 3-5 verbatim.
//
// Source: 03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md §9.4
// (Cluster 3 Volume Landmarks Israetel × Persona × Goal Modifiers) +
// §9.5 (Cluster 4 Macrocycle Linear Block V1) + §9.6 (Cluster 5 Cross-Engine
// Hooks anti-cascade safeguards).
//
// ZERO fabrication beyond §9.1 spec. ZERO Date.now / Math.random — all values
// static per ADR 018 §2 deterministic contract.
//
// Cross-ref: ADR-ENGINE-MATH-LOCKED-VALUES §3 — Israetel MEV/MAV/MRV citation
// catalog + persona/goal/recovery multiplier rationale.

/**
 * Israetel 11 grupuri musculare baseline MEV/MAV/MRV (sets/week).
 *
 * Reference: Israetel 2017 Renaissance Periodization (canonical hypertrophy
 * landmarks). Per §9.4 Cluster 3 verbatim.
 *
 * §B032 audit fix (REVIEW-A036-A038 L-§A038-01) — primary source citation
 * pentru cross-check audit:
 *   - Israetel et al. (2017). "Scientific Principles of Hypertrophy Training" +
 *     "Renaissance Periodization Volume Landmarks" blog series.
 *   - URL: https://renaissanceperiodization.com/training-volume-landmarks-muscle-growth
 *   - Numbers reflect intermediate-to-advanced trainee target zones (MEV =
 *     Minimum Effective Volume, MAV = Maximum Adaptive Volume, MRV = Maximum
 *     Recoverable Volume).
 *
 * Audit observation L-§A038-01: glutes MRV=16 conservative vs RP published
 * 16-22+; deliberate Andura V1 choice (Maria 65 + Gigel base safer cap; can
 * uplift post-Beta via PERSONA_MODIFIERS amplification). Reviewer caveat
 * preserved: numbers plausible vs literature general knowledge dar verbatim
 * cross-reference cu publicat source pending Daniel external review.
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
 * daca Vitality Layer signal aggregate (ADR 016) = green. Per §9.4 verbatim
 * "+10-15% daca recovery green". V1 conservative pick lower bound +10% default,
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
  forta:        0.70, // lower volume / higher intensity per Forta template ADR 024 §1.2
  recompozitie: 0.85, // intermediate volume CUT-aware
  slabire:      0.90, // volume-preserving deficit (retain muscle in cut, slight recovery cut)
  // §obiectiv-drop-longevitate 2026-05-28 — longevitate DROPPED (semantic dup
  // sanatate; ambele MAINTENANCE phase identic). Legacy goal-strings → fallback
  // hipertrofie default (resolveGoalId).
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
 * Mesocycle 4-week phase map per §9.3 Cluster 2 + §65.5 4 sapt clasic Option A.
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
 * Block length variants per goal (saptamani). Per §9.5 Cluster 4 verbatim.
 *
 * @type {Readonly<{DEFAULT: number, FORTA: number}>}
 */
export const BLOCK_LENGTH_WEEKS = Object.freeze({
  DEFAULT: 12, // BUILD-only majoritar templates
  FORTA:   21, // BUILD + PEAK + TRANSITION pentru Forta
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
 * - Injury block window 6 sapt (Invariant 5 Medical Safety)
 *
 * @type {Readonly<{maxConsecutiveExtensions: number, injuryBlockWindowDays: number}>}
 */
export const ANTI_ABUSE = Object.freeze({
  maxConsecutiveExtensions: 2,
  injuryBlockWindowDays:    6 * 7, // 6 sapt = 42 zile
});

/**
 * Maria adaptive override per §9.5 Cluster 4: NU advance la M2/M3 fara
 * calibration tier ≥ DEVELOPING + zero injury 6 sapt window.
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
 * Persona age boundaries V1 (resolve persona id from user.age fallback cand
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

// ══ ADR_ENGINE_REFACTOR §4.3 LOCK V1 2026-05-14 — Hybrid template Decision §3.3
// Big 6 cluster phase (UX surface backwards-compatible) + Big 11 RO canonical V1
// weight allocation (engine internal routing). ZERO mutation phase cycle
// algorithm semantics — pure additive layer + translator export downstream.

/**
 * Big 6 cluster phase definition per ADR_ENGINE_REFACTOR §4.3 Decision §3.3
 * Hybrid. UX surface backwards-compatible — mockup-prescribed session templates
 * consume push/pull/legs/upper/lower/full unchanged.
 *
 * Internal engine routing maps each cluster → Big 11 RO weight distribution
 * via CLUSTER_BIG6_TO_BIG11_WEIGHT below.
 *
 * @type {Readonly<ReadonlyArray<string>>}
 */
export const PHASE_CLUSTERS_BIG6 = Object.freeze(['push', 'pull', 'legs', 'upper', 'lower', 'full']);

/**
 * Cluster Big 6 → Big 11 RO weight allocation per Decision §3.3 + §3.5
 * (primary-only consume policy Periodization). Default weight distribution
 * per session within cluster (engine internal routing). Values sum ≈1.0 per
 * cluster (floating point tolerance ±0.01).
 *
 * Bias rationale (research-backed):
 *   - push:  piept 0.40 + umeri 0.30 + triceps 0.30 (mid push session)
 *     Schoenfeld 2017 — chest primary stimulus drives session
 *   - pull:  spate 0.50 + biceps 0.30 + antebrate 0.20 (back-focus grip secondary)
 *     Helms RP 2018 — back primary stimulus + grip antebrate secondary
 *   - legs:  quads 0.30 + hamstrings 0.25 + fese 0.25 + gambe 0.15 + core 0.05
 *   - upper: piept 0.20 + spate 0.30 + umeri 0.20 + biceps 0.15 + triceps 0.15
 *     (forearms removed 2026-06-03 — grip is incidental to pulls, not a programmed
 *     slot; an explicit antebrate weight forced Farmer's Walk/reverse-grip onto a
 *     V-taper back day. Same reason `pull` dropped its 0.20 antebrate. Bug #6.)
 *   - lower: alias semantic equivalent legs cluster
 *   - full:  balanced ~9-10% per group (11 groups summing ≈1.0)
 *
 * Cross-ref: ADR_ENGINE_REFACTOR §4.3 LOCK V1 + Decision §3.3 Hybrid.
 *
 * @type {Readonly<Object<string, Readonly<Object<string, number>>>>}
 */
export const CLUSTER_BIG6_TO_BIG11_WEIGHT = Object.freeze({
  push:  Object.freeze({ piept: 0.40, umeri: 0.30, triceps: 0.30 }),
  pull:  Object.freeze({ spate: 0.625, biceps: 0.375 }),
  legs:  Object.freeze({ 'picioare-quads': 0.30, 'picioare-hamstrings': 0.25, fese: 0.25, gambe: 0.15, core: 0.05 }),
  upper: Object.freeze({ piept: 0.20, spate: 0.30, umeri: 0.20, biceps: 0.15, triceps: 0.15 }),
  lower: Object.freeze({ 'picioare-quads': 0.30, 'picioare-hamstrings': 0.25, fese: 0.25, gambe: 0.15, core: 0.05 }),
  full:  Object.freeze({
    piept: 0.10, spate: 0.10, umeri: 0.10, biceps: 0.10, triceps: 0.10,
    antebrate: 0.05, core: 0.05,
    'picioare-quads': 0.10, 'picioare-hamstrings': 0.10, fese: 0.10, gambe: 0.10,
  }),
});

/**
 * Translator Big 11 EN (ISRAETEL_BASELINES literature reference) → Big 11 RO
 * canonical V1 anatomical taxonomy per ADR_ENGINE_REFACTOR §4.1.
 *
 * Internal Periodization engine keeps ISRAETEL_BASELINES EN keys (Schoenfeld/
 * Helms academic literature invariant). Downstream consumers requesting
 * canonical V1 RO keys translate via toCanonicalRO() helper.
 *
 * Mapping per ADR_ENGINE_REFACTOR §2 + §3.2:
 *   chest → piept; back → spate; shoulders → umeri
 *   quads → picioare-quads; hamstrings → picioare-hamstrings
 *   glutes → fese; calves → gambe
 *   biceps → biceps; triceps → triceps; forearms → antebrate
 *   abs → core
 *
 * @type {Readonly<Object<string, string>>}
 */
export const BIG11_EN_TO_RO_MAP = Object.freeze({
  chest:      'piept',
  back:       'spate',
  shoulders:  'umeri',
  quads:      'picioare-quads',
  hamstrings: 'picioare-hamstrings',
  glutes:     'fese',
  calves:     'gambe',
  biceps:     'biceps',
  triceps:    'triceps',
  forearms:   'antebrate',
  abs:        'core',
});

/**
 * Inverse translator Big 11 RO canonical V1 → Big 11 EN (ISRAETEL_BASELINES
 * literature reference) per ADR_ENGINE_REFACTOR §4.8.
 *
 * Used by downstream engines (e.g. Bayesian Nutrition C4.8) that receive Big 11
 * RO canonical V1 keys from Coach Director aggregate (post C4.5 LANDED) but
 * need to lookup ISRAETEL_BASELINES which preserves EN keys per Israetel
 * literature reference invariant (Schoenfeld/Helms academic, ADR 026 §9.4).
 *
 * Co-located with BIG11_EN_TO_RO_MAP cap-coadă single SSOT translator pair.
 *
 * @type {Readonly<Object<string, string>>}
 */
export const BIG11_RO_TO_EN_MAP = Object.freeze({
  piept:                  'chest',
  spate:                  'back',
  umeri:                  'shoulders',
  'picioare-quads':       'quads',
  'picioare-hamstrings':  'hamstrings',
  fese:                   'glutes',
  gambe:                  'calves',
  biceps:                 'biceps',
  triceps:                'triceps',
  antebrate:              'forearms',
  core:                   'abs',
});
