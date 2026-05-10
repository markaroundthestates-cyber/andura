// Engine Deload V1 constants per ADR 026 §9.8 Cluster A-E verbatim.
//
// Pipeline §42.10 position 8th canonical FINAL: Periodization → Goal Adaptation
// → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload.
// (NU position 4 "Engine #4" naming legacy chat strategic spec session ordering
// 2026-05-05 birou after 3-engine cluster #3+#4+#5 spec session — pipeline
// §42.10 canonical position 8th FINAL prescriptive engine pipeline closure).
//
// Source: 03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.8
// (commit d7594e7 LANDED 2026-05-06 evening chat-8 acasa, 32 decisions
// Cluster A-E verbatim aggregation 4-way parity check ✅).
//
// Source 4 NU disponibil: ADR Deload file ABSENT. Recommend NEW ADR
// `032-engine-deload-protocol.md` SPEC REFERENCE direct (reverse pattern vs
// ADR 027/028/029 stub flip). Separate task post-CC low priority post §9.8 V1.
//
// ZERO fabrication beyond §9.8 spec. ZERO Date.now / Math.random — all values
// static per ADR 018 §2 deterministic contract.

/**
 * Calibration tier ids per ADR 009 + Cluster C2 notification tier-aware
 * (T0 silent / T1+ banner detaliat rationale).
 *
 * @type {Readonly<{T0: 'T0', T1: 'T1', T2: 'T2'}>}
 */
export const CALIBRATION_TIERS = Object.freeze({
  T0: 'T0',
  T1: 'T1',
  T2: 'T2',
});

/**
 * Deload state enum per Cluster A1 output blueprint emit verbatim.
 *
 * IDLE                = no deload active (default baseline, no trigger fired)
 * SCHEDULED_LINEAR    = calendar Week 4 Linear Block per §9.1 Cluster 2.1 mesocycle classic
 * REACTIVE_COMPOSITE  = Composite Signal §36.41 3/3 simultaneous threshold trigger
 * REACTIVE_AA         = AA Detection ADR 013 sustained pattern trigger (priority: AA > Linear, Composite > AA)
 * EXTENSION_FLAGGED   = Week 2 Reactive deload Flagged-state still active end-of-Week-1
 * RESOLVING           = transition phase post-deload back to baseline
 *
 * @type {Readonly<{
 *   IDLE: 'IDLE',
 *   SCHEDULED_LINEAR: 'SCHEDULED_LINEAR',
 *   REACTIVE_COMPOSITE: 'REACTIVE_COMPOSITE',
 *   REACTIVE_AA: 'REACTIVE_AA',
 *   EXTENSION_FLAGGED: 'EXTENSION_FLAGGED',
 *   RESOLVING: 'RESOLVING',
 * }>}
 */
export const DELOAD_STATE = Object.freeze({
  IDLE:                'IDLE',
  SCHEDULED_LINEAR:    'SCHEDULED_LINEAR',
  REACTIVE_COMPOSITE:  'REACTIVE_COMPOSITE',
  REACTIVE_AA:         'REACTIVE_AA',
  EXTENSION_FLAGGED:   'EXTENSION_FLAGGED',
  RESOLVING:           'RESOLVING',
});

/**
 * Trigger source enum per Cluster B1+B2 multi-trigger orchestrator unification.
 *
 * @type {Readonly<{
 *   COMPOSITE: 'composite',
 *   AA: 'aa',
 *   LINEAR: 'linear',
 *   EXTENSION: 'extension',
 *   ENERGY: 'energy',
 *   NONE: 'none',
 * }>}
 */
export const TRIGGER_SOURCE = Object.freeze({
  COMPOSITE: 'composite',
  AA:        'aa',
  LINEAR:    'linear',
  EXTENSION: 'extension',
  ENERGY:    'energy',
  NONE:      'none',
});

/**
 * Periodization phase enum per §9.1 Hook 1 cross-ref.
 *
 * @type {Readonly<{LOAD: 'LOAD', LOAD_PLUS: 'LOAD+', PEAK: 'PEAK', DELOAD: 'DELOAD'}>}
 */
export const PERIODIZATION_PHASE = Object.freeze({
  LOAD:      'LOAD',
  LOAD_PLUS: 'LOAD+',
  PEAK:      'PEAK',
  DELOAD:    'DELOAD',
});

/**
 * Periodization deload_window trigger source per §9.1 emit field 5 verbatim.
 *
 * @type {Readonly<{EARLY_SAFETY: 'EARLY_SAFETY', EXTENSION_MARIUS: 'EXTENSION_MARIUS', CALENDAR: 'CALENDAR'}>}
 */
export const DELOAD_WINDOW_TRIGGER = Object.freeze({
  EARLY_SAFETY:     'EARLY_SAFETY',
  EXTENSION_MARIUS: 'EXTENSION_MARIUS',
  CALENDAR:         'CALENDAR',
});

/**
 * Goal Adaptation phase enum per §9.2 Cluster D2 cross-ref.
 *
 * @type {Readonly<{CUT: 'CUT', BULK: 'BULK', MAINTAIN: 'MAINTAIN', RECOMP: 'RECOMP'}>}
 */
export const GOAL_PHASE = Object.freeze({
  CUT:      'CUT',
  BULK:     'BULK',
  MAINTAIN: 'MAINTAIN',
  RECOMP:   'RECOMP',
});

/**
 * Energy adjustment direction enum per §9.3 Hook D3 cross-ref.
 *
 * Energy DOWN sustained 3+ consecutive → AA Detection trigger candidate
 * (Source 2 ADR 013 cross-ref + B13 verbatim Source 1).
 *
 * @type {Readonly<{UP: 'UP', DOWN: 'DOWN', NONE: 'NONE'}>}
 */
export const ENERGY_DIRECTION = Object.freeze({
  UP:   'UP',
  DOWN: 'DOWN',
  NONE: 'NONE',
});

/**
 * Notification tier per Cluster C2 verbatim:
 *   SILENT          = T0 cold start (CDL log only, NU UI banner anti-friction)
 *   BANNER_DETAILED = T1+ established (UX explainer per trigger source)
 *
 * @type {Readonly<{SILENT: 'silent', BANNER_DETAILED: 'banner_detailed'}>}
 */
export const NOTIFICATION_TIER = Object.freeze({
  SILENT:           'silent',
  BANNER_DETAILED:  'banner_detailed',
});

/**
 * Schema constants per Cluster B5+B6+B9 + Cluster A1 verbatim:
 *   Final_Depth formula MAX(Scheduled 45%, Reactive 60%, Behavioral 30%) + Behavioral_Modifiers additive
 *   Extension depth preserve 60% atrophy literature limit Schoenfeld/Helms
 *   Behavioral_Modifiers cap max threshold (additive, NU multiplicative anti-cascade)
 *   Duration scheduled 1 sapt fix / reactive 1-2 sapt adaptive
 *   Marius 5:1 dual-signal extension max 2 consecutive (anti-abuse §9.1 Cluster 2.3)
 *   Energy DOWN sustained 3+ consecutive AA Detection candidate
 *   Passive Mode trigger 12-week rolling 2 reactive consecutive
 *
 * @type {Readonly<{
 *   depthScheduledPct: number,
 *   depthReactivePct: number,
 *   depthBehavioralPct: number,
 *   depthExtensionPreservePct: number,
 *   behavioralModifiersCapPct: number,
 *   rirIncrement: number,
 *   intensityPctDecrement: number,
 *   durationScheduledWeeks: number,
 *   durationReactiveMinWeeks: number,
 *   durationReactiveMaxWeeks: number,
 *   maxConsecutiveExtensions: number,
 *   energyDownConsecutiveThreshold: number,
 *   passiveModeRollingWindowWeeks: number,
 *   passiveModeReactiveCount: number,
 *   confidenceMediumFloor: number,
 * }>}
 */
export const SCHEMA_CONSTANTS = Object.freeze({
  depthScheduledPct:               45,    // Source 1 verbatim B5 — calendar Linear Block Week 4
  depthReactivePct:                60,    // Source 1 verbatim B5 — Reactive overrides scheduled (60% > 45%)
  depthBehavioralPct:              30,    // Source 1 verbatim B5 — Behavioral_Modifiers baseline
  depthExtensionPreservePct:       60,    // Source 1 verbatim B9 — atrophy literature limit Schoenfeld/Helms
  behavioralModifiersCapPct:       15,    // V1 conservative cap additive max (Bugatti craft anti-cascade preserve)
  rirIncrement:                    1,     // Source 1 verbatim B4 — RIR ↑ obligatoriu
  intensityPctDecrement:           12.5,  // Source 1 verbatim B4 + §9.1 Cluster 2.1 deload classic Linear
  durationScheduledWeeks:          1,     // Source 1 verbatim B6 — calendar Linear Block Week 4
  durationReactiveMinWeeks:        1,     // Source 1 verbatim B6 — adaptive minimum
  durationReactiveMaxWeeks:        2,     // Source 1 verbatim B6 — Flagged-only state qualifier max
  maxConsecutiveExtensions:        2,     // §9.1 Cluster 2.3 anti-abuse Marius 5:1 cross-ref
  energyDownConsecutiveThreshold:  3,     // Source 1 verbatim B13 — sustained low readiness 3+ consecutive
  passiveModeRollingWindowWeeks:   12,    // Source 1 verbatim E2 — 12-week rolling window inclusive
  passiveModeReactiveCount:        2,     // Source 1 verbatim E2 — 2 reactive consecutive trigger
  confidenceMediumFloor:           2,     // mirror §9.7 + §9.6 precedent
});

/**
 * Composite Signal §36.41 thresholds per Source 3 ADR_COMPOSITE_SIGNAL_LAYER_v1
 * verbatim (3/3 simultaneous threshold for Flagged state).
 *
 * @type {Readonly<{
 *   performanceDropPct: number,
 *   restTimeMultiplier: number,
 *   rirMismatchMin: number,
 * }>}
 */
export const COMPOSITE_THRESHOLDS = Object.freeze({
  performanceDropPct:  15,    // >15% Performance Drop
  restTimeMultiplier:  1.5,   // >1.5× Rest Time Multiplier
  rirMismatchMin:      2,     // ≥2 RIR Mismatch
});

/**
 * Wording RO native specific per trigger source per Cluster C5 verbatim
 * (Source 1 line 16 + Source 4 line 735 verbatim).
 *
 * Anti-paternalism graceful degradation ADR 025 — wording explicit factual NU
 * "trebuie sa te odihnesti" (Bugatti F4 zero forced friction).
 *
 * @type {Readonly<Object<string, string>>}
 */
export const WORDING_RO = Object.freeze({
  linear:    'Sapt 5 — recuperare programata',
  composite: 'Corpul tau cere recovery',
  aa:        'Reglam intensitatea — volumul a urcat agresiv',
  energy:    'Sapt asta lasam motorul sa se odihneasca',
  extension: 'Continuam recuperarea o sapt in plus',
  resolving: 'Revenim treptat la incarcarea normala',
  idle:      '',
});

/**
 * UI label RO native per Cluster A1 output blueprint emit field 8.
 *
 * Format: "Saptamana de recuperare X sapt" cu duration_weeks adaptive.
 *
 * @param {number} durationWeeks
 * @param {string} state
 * @returns {string}
 */
export function buildUiLabel(durationWeeks, state) {
  if (state === DELOAD_STATE.IDLE) return '';
  const d = Number.isFinite(durationWeeks) && durationWeeks > 0
    ? Math.round(durationWeeks)
    : SCHEMA_CONSTANTS.durationScheduledWeeks;
  if (d === 1) return 'Saptamana de recuperare';
  return `Saptamana de recuperare (${d} sapt)`;
}

/**
 * Skip penalty marker enum per Cluster C4 Hibrid verbatim:
 *   AA_MARKER_DIRECT  = 1× reactive urgent skip = AA marker direct ADR 013
 *   COMPOSITE_TIGHTEN = 2× scheduled skip = Composite sensitivity ↑ thresholds lower
 *
 * @type {Readonly<{
 *   AA_MARKER_DIRECT: 'aa_marker_direct',
 *   COMPOSITE_TIGHTEN: 'composite_tighten',
 *   NONE: 'none',
 * }>}
 */
export const SKIP_PENALTY = Object.freeze({
  AA_MARKER_DIRECT:   'aa_marker_direct',
  COMPOSITE_TIGHTEN:  'composite_tighten',
  NONE:               'none',
});
