// ══ PAIN BUTTON §36.38 — Pain/Discomfort Reporting ════════════════════════════
// LOCKED V1 per §36.38 Chat C — anti-paternalism + Gigel test risk.
// NU "self-diagnostic medical" — opțiuni neutre observabile.

/** @type {{ key: string, label: string, level: 'general'|'specific'|'technical' }[]} */
export const PAIN_OPTIONS = [
  { key: 'discomfort_general',  label: 'Mișcarea mă deranjează',     level: 'general' },
  { key: 'discomfort_specific', label: 'Simt o tensiune ciudată',    level: 'specific' },
  { key: 'doms_severe',         label: 'DOMS sever',                  level: 'technical' },
];

/**
 * Translate a pain input into engine adjustment recommendation.
 * Output: skip / reduce / suggest alternative — FĂRĂ medical claim.
 *
 * @param {string} key one of PAIN_OPTIONS keys
 * @returns {{ action: 'skip'|'reduce_volume'|'suggest_alternative', rationale: string }}
 */
export function processPainInput(key) {
  switch (key) {
    case 'discomfort_general':
      return { action: 'suggest_alternative', rationale: 'user_reported_general_discomfort' };
    case 'discomfort_specific':
      return { action: 'reduce_volume', rationale: 'user_reported_specific_tension' };
    case 'doms_severe':
      return { action: 'skip', rationale: 'user_reported_doms_severe' };
    default:
      return { action: 'skip', rationale: 'unknown_pain_key' };
  }
}
