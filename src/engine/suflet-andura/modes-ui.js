// ══ MODES UI — 4 Moduri (Strategic / Executor / Hybrid / Auto) ═══════════════
// LOCKED V1 per ADR_MODE_DETECTION_UI_v1 + §36.58 wording.
// Self-declared in onboarding + behavior-tracked in background pentru drift detection.

/** @type {{ key: string, label: string }[]} */
export const MODES = [
  { key: 'STRATEGIC', label: 'Strategic' },
  { key: 'EXECUTOR',  label: 'Executor' },
  { key: 'HYBRID',    label: 'Hybrid' },
  { key: 'AUTO',      label: 'Auto' },
];

/**
 * Validate a declared mode key.
 * @param {string} mode
 * @returns {boolean}
 */
export function isValidMode(mode) {
  return MODES.some(m => m.key === mode);
}

/**
 * Get default mode (used when user skips onboarding step or mode unset).
 * AUTO = engine decides per session context.
 * @returns {string}
 */
export function getDefaultMode() {
  return 'AUTO';
}
