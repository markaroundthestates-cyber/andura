// Cluster C — Cool-down strategy per ADR 026 §9.7.3 verbatim.
//
// C1 Source 1 §65.4 OVERRIDE Q4 reconsider RECONCILED supersedes Source 2 §45.6
//    Q-Cooldown defer (per Daniel's later decision authority pattern — same
//    precedent as Q1 duration §65.1 Override 8-12 → 5-10):
//      OVERRIDE Q4 initial choice "defer v1.5" → reconsider Option B
//      "optional 2 min stretch buton text-only"
//      Industry research Schoenfeld/Helms = stretching 2-3 min post-session
//      REDUCE DOMS perceput → Maria 65 retention crescut
//      Cost dev ~30 min vs valoare retention = ROI justifies V1 inclusion
//
// C2 Implementation MINIMAL text-only:
//      2-3 stretch static text-only ZERO UI complex
//      NU GIF embedded (consistent §9.5 Tempo E16 Q16 GIF REJECTED pre-Beta)
//      NU video / audio (scope creep)
//
// V1.5+ candidate: extended cooldown routines (Schoenfeld stretching 5-10 min,
// foam rolling, parasympathetic activation breathing) post-Beta useri reali
// signal per §9.7.6 Reconsideration Trigger 4.
//
// Pure functions — no side effects.

import {
  COOLDOWN_STRETCHES,
  SCHEMA_CONSTANTS,
} from './constants.js';

/**
 * Compose cooldown state emit per Cluster C verbatim.
 *
 * V1 default: optional cooldown offered post-session cu 2 min text-only stretch
 * routine (NU mandatory — consistent skip availability principle Cluster B4).
 *
 * Stretches list = canonical pool 2-3 RO native static stretches ~30 sec each.
 *
 * @param {Object} input
 * @param {boolean} [input.suppressForInjuryDisabled]    - True dacă WARMUP_STATE = INJURY_DISABLED
 *                                                         (Pain-Aware reference §9.4.6 Convergence Guard)
 * @returns {import('./types.js').CooldownState}
 */
export function composeCooldown({ suppressForInjuryDisabled }) {
  if (suppressForInjuryDisabled === true) {
    // Pain-Aware reference §9.4.6 Convergence Guard "T2 Unlock" preserved
    // (Tempo NU proactive Pain-Aware trigger Clean Signal rule consistent
    // §9.5+§9.6 precedent — Warm-up references but NU acts proactively)
    return {
      offered:       false,
      durationMin:   0,
      content:       'text-only',
      stretches:     Object.freeze([]),
      rationale:     'cooldown_suppressed_injury_disabled_pain_aware_reference_94_6_clean_signal_rule',
    };
  }

  return {
    offered:       true,
    durationMin:   SCHEMA_CONSTANTS.cooldownDurationMin,
    content:       'text-only',
    stretches:     COOLDOWN_STRETCHES,
    rationale:     'cooldown_optional_2_min_stretch_text_only_c1_override_q4_supersedes_source_2_defer',
  };
}
