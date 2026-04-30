// ══ TIERED READ — Tier 0 + Tier 1 unified read API (ADR 020) ════════════════
// Engines that need DEEP HISTORY (>30d) call `getTieredArrayAsync(key)` to
// merge Tier 0 (localStorage hot, last 30d) + Tier 1 (IndexedDB warm, 30-180d).
//
// Engines on UI HOT PATH (synchronous render) keep using `DB.get(key)` — that
// returns Tier 0 only and is fast. Tier 1 query takes ~ms async, fine pentru
// background calculation but NU pentru render.
//
// ── When to use which ───────────────────────────────────────────────────────
//
//  Sync `DB.get(key)`:                       ASYNC `getTieredArrayAsync(key)`:
//   • UI render path                          • Calibration `days_since_first`
//   • Recent decision lookups (today, week)   • Pattern detection retrospective
//   • Cache warmup                            • Audit / debug views
//   • Synchronous engines pure functions      • Adherence rate over months
//
// ── Phase status ────────────────────────────────────────────────────────────
//
// **Phase 1 (current):** Helper exists + tested. CALLERS: none yet —
// Phase 1 rotation = CDL + applied-patterns only, hot-path engines (calibration,
// adherence) work on `logs` which stays Tier 0 (NOT rotated). Helper ready for
// Phase 2 callers when `logs` rotation enabled.
//
// **Phase 2 (Sprint 4.x):** Update `coachContext.js::buildContext` to await
// `getTieredArrayAsync('logs')` for `ctx.allLogs`. Async propagation through
// engine entry points (predictionEngine, weaknessDetector, calibration).

import { DB } from '../db.js';
import { ROTATABLE_KEYS } from './tieringEngine.js';
import { tier1All } from './db.js';

/**
 * Read merged Tier 0 + Tier 1 entries for a rotatable key.
 *
 * Behavior:
 *   - Tier 0 entries (sync localStorage) prepended (newer/recent).
 *   - Tier 1 entries (async Dexie) appended (older/archived).
 *   - Order preserved within each tier; caller should sort if total ordering
 *     needed.
 *   - Non-rotatable keys: returns Tier 0 only (no Tier 1 lookup).
 *
 * @param {string} key - localStorage key
 * @returns {Promise<Array<object>>}
 */
export async function getTieredArrayAsync(key) {
  const tier0 = _safeArray(DB.get(key));
  const storeName = ROTATABLE_KEYS[key];
  if (!storeName) return tier0;

  let tier1 = [];
  try {
    tier1 = await tier1All(storeName);
  } catch {
    tier1 = []; // Defensive — Tier 1 read failure NU break engine
  }
  return [...tier0, ...tier1];
}

/**
 * Synchronous Tier 0 read — same as `DB.get(key)` returning [] fallback.
 * Provided for symmetry with `getTieredArrayAsync` when callers want sync
 * behavior explicitly + array-typed return (vs DB.get's union).
 *
 * @param {string} key
 * @returns {Array<object>}
 */
export function getTier0Array(key) {
  return _safeArray(DB.get(key));
}

function _safeArray(v) {
  return Array.isArray(v) ? v : [];
}
