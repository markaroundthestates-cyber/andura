// Cluster 2 — Input Strategy & Aggregation per ADR 026 §9.3.2 verbatim.
//
// Manual input only V1 (Q1=C hibrid + Q4=A + Q5=A defer auto v1.5+).
// Stress folded emoji 🟢🟡🔴 holistic + drill-down strict 🔴 only Q15=C
// (anti-Maria-65-friction zilnic).
// Categorical aggregation rules table Q3=C auditable.
//
// Pure functions — no side effects, no Date.now / Math.random.

import {
  EMOJI_STATE,
  DRILL_DOWN_CAUSES,
  AGGREGATION_RULES_TABLE,
} from './constants.js';

/**
 * Resolve emoji state input from ctx (case-insensitive normalize).
 * Defensive defaults to null when missing/invalid (engine pure total function).
 *
 * @param {{energyEmoji?: string}} [ctx]
 * @returns {import('./types.js').EmojiState|null}
 */
export function resolveEmojiState(ctx) {
  if (!ctx || typeof ctx.energyEmoji !== 'string') return null;
  const e = ctx.energyEmoji.toLowerCase();
  if (e === EMOJI_STATE.GREEN || e === 'g' || e === '🟢') return EMOJI_STATE.GREEN;
  if (e === EMOJI_STATE.YELLOW || e === 'y' || e === '🟡') return EMOJI_STATE.YELLOW;
  if (e === EMOJI_STATE.RED || e === 'r' || e === '🔴') return EMOJI_STATE.RED;
  return null;
}

/**
 * Resolve drill-down cause from ctx — strict 🔴 RED only per Q15=C
 * anti-Maria-65-friction. 4-cauze fixed labels.
 *
 * @param {{drillDownCause?: string}} [ctx]
 * @returns {import('./types.js').DrillDownCause|null}
 */
export function resolveDrillDownCause(ctx) {
  if (!ctx || typeof ctx.drillDownCause !== 'string') return null;
  const c = ctx.drillDownCause.toLowerCase();
  if (c === DRILL_DOWN_CAUSES.STRES) return DRILL_DOWN_CAUSES.STRES;
  if (c === DRILL_DOWN_CAUSES.SOMN) return DRILL_DOWN_CAUSES.SOMN;
  if (c === DRILL_DOWN_CAUSES.DURERE) return DRILL_DOWN_CAUSES.DURERE;
  if (c === DRILL_DOWN_CAUSES.ALTUL) return DRILL_DOWN_CAUSES.ALTUL;
  return null;
}

/**
 * Drill-down required strict 🔴 RED only per Q15=C verbatim.
 * NU 🟡 yellow (anti-Maria-65-friction zilnic anti-Bugatti).
 *
 * @param {import('./types.js').EmojiState|null} emoji
 * @returns {boolean}
 */
export function requiresDrillDown(emoji) {
  return emoji === EMOJI_STATE.RED;
}

/**
 * Apply categorical aggregation rules table per Q3=C auditable verbatim.
 *
 * Map: emoji state → adjustment category rule:
 *   GREEN  → UP_ELIGIBLE   (cumulative N≥3 still required Cluster 3 gating)
 *   YELLOW → NONE          (caution preserve baseline)
 *   RED    → DOWN_IMMEDIATE (anti-burnout protect prima)
 *
 * @param {import('./types.js').EmojiState|null} emoji
 * @returns {'UP_ELIGIBLE'|'DOWN_IMMEDIATE'|'NONE'}
 */
export function applyAggregationRule(emoji) {
  if (!emoji) return 'NONE';
  return AGGREGATION_RULES_TABLE[emoji] ?? 'NONE';
}

/**
 * Aggregate emoji + drill-down inputs into structured signal per Cluster 2.
 *
 * @param {Object} input
 * @param {import('./types.js').EmojiState|null} input.emoji
 * @param {import('./types.js').DrillDownCause|null} input.drillDownCause
 * @returns {import('./types.js').EnergyAggregationSignal}
 */
export function aggregateEmojiInputs({ emoji, drillDownCause }) {
  const safeEmoji = emoji ?? null;
  // Drill-down strict 🔴 only — discard cause cand emoji NOT 🔴 (anti-fabrication)
  const safeDrillDown = safeEmoji === EMOJI_STATE.RED ? (drillDownCause ?? null) : null;
  return {
    state:           safeEmoji,
    drillDownCause:  safeDrillDown,
    categoryRule:    applyAggregationRule(safeEmoji),
  };
}
