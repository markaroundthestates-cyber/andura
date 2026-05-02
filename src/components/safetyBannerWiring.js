// ══ SAFETY BANNER WIRING — 3 consumers (Batch B Tasks 7-9) ══════════════
// Per HANDOVER §22 F-NEW-4 + §29.2.5 F-NEW-2 + §27 plateau interventions.
//
// This module returns data-only SafetyBanner payloads (severity + message
// + dismissId + optional action). Consumers call createSafetyBanner from
// src/components/safetyBanner.js with these payloads to render. Decoupling
// data from DOM keeps the wiring testable in isolation.
//
// LOCKED wording — DO NOT paraphrase:
//   - F-NEW-4 plan-ajustat: "Plan ajustat astăzi pentru recovery." +
//     "Folosesc varianta mea" action
//   - F-NEW-2 deload-skip: getDeloadSkipWarning() (verbatim from
//     progressionMatrix)
//   - Plateau §27 two-layer:
//       Layer 1 (info, suggestion): "Greutatea s-a oprit. Sesiunea de azi
//         încearcă o variantă diferită."
//       Layer 2 (warning, intervention): "Săptămâna a {N}-a fără progres.
//         Încercăm {tehnică} astăzi."

import { getDeloadSkipWarning } from '../engine/progressionMatrix.js';

// ── Wiring 1: F-NEW-4 plan-ajustat banner ───────────────────────────────

const PLAN_ADJUSTED_MESSAGE = 'Plan ajustat astăzi pentru recovery.';
const PLAN_ADJUSTED_ACTION_LABEL = 'Folosesc varianta mea';

/**
 * Build the F-NEW-4 plan-ajustat banner payload. Render with severity=info.
 *
 * @param {{ onUseOriginal: Function }} opts - callback when user chooses
 *        their own plan instead of the adjusted one.
 * @returns {{ severity: 'info', message: string, action: { label: string, onClick: Function }, dismissId: string }}
 */
export function buildPlanAdjustedBanner(opts) {
  const onClick = (opts && typeof opts.onUseOriginal === 'function')
    ? opts.onUseOriginal
    : () => {};
  return {
    severity: 'info',
    message: PLAN_ADJUSTED_MESSAGE,
    action: { label: PLAN_ADJUSTED_ACTION_LABEL, onClick },
    dismissId: 'fnew4-plan-adjusted',
  };
}

// ── Wiring 2: F-NEW-2 deload-skip banner ────────────────────────────────

/**
 * Build the F-NEW-2 deload-skip banner payload. Wording comes verbatim
 * from progressionMatrix.getDeloadSkipWarning() (LOCKED). Render with
 * severity=warning. Dismiss is per-session (re-fires next session if user
 * continues skipping).
 *
 * @returns {{ severity: 'warning', message: string, dismissId: string }}
 */
export function buildDeloadSkipBanner() {
  return {
    severity: 'warning',
    message: getDeloadSkipWarning(),
    dismissId: 'fnew2-deload-skip',
  };
}

// ── Wiring 3: Plateau §27 two-layer ─────────────────────────────────────

const PLATEAU_LAYER1_MESSAGE = 'Greutatea s-a oprit. Sesiunea de azi încearcă o variantă diferită.';

/**
 * Build the plateau intervention banner. Two layers:
 *   - Layer 1 (info): suggestion — exercise variant or technique nudge
 *   - Layer 2 (warning): intervention — explicit technique applied
 *
 * @param {{ layer: 1|2, weeks?: number, technique?: string }} opts
 * @returns {{ severity: 'info'|'warning', message: string, dismissId: string }|null}
 */
export function buildPlateauBanner(opts) {
  if (!opts || (opts.layer !== 1 && opts.layer !== 2)) return null;
  if (opts.layer === 1) {
    return {
      severity: 'info',
      message: PLATEAU_LAYER1_MESSAGE,
      dismissId: 'plateau-layer1',
    };
  }
  // Layer 2 — intervention applied. Wording stays general (no leaked
  // numerical thresholds, no efficacy %); week count + technique label are
  // user-facing context that makes the message actionable.
  const weeks = Number(opts.weeks);
  const tech = (typeof opts.technique === 'string' && opts.technique.trim())
    ? opts.technique.trim()
    : 'o variantă tehnică';
  const weeksPart = (Number.isFinite(weeks) && weeks >= 3)
    ? `Săptămâna a ${weeks}-a fără progres. `
    : '';
  return {
    severity: 'warning',
    message: `${weeksPart}Încercăm ${tech} astăzi.`,
    dismissId: 'plateau-layer2',
  };
}

// ── Helpers exposed for tests ───────────────────────────────────────────

export const SAFETY_WIRING_COPY = Object.freeze({
  planAdjusted: { message: PLAN_ADJUSTED_MESSAGE, actionLabel: PLAN_ADJUSTED_ACTION_LABEL },
  plateauLayer1: PLATEAU_LAYER1_MESSAGE,
});
