// ══ PHASE OVERRIDE — B001 manual phase switch ═════════════════════════════
// Pattern parity src/pages/plan.js setPhaseOverride legacy: persists user
// manual phase pick + phase-change-date + appends phase-log entry. Used by
// `SchimbaFazaConfirm.tsx` per mockup §11 drill-down.
//
// Legacy plan.js setPhaseOverride couples to renderPlan/renderDash/
// renderUnifiedHistory DOM mutations. This util is presentation-agnostic.

import { DB, tod } from '../db.js';

/** @typedef {'AUTO' | 'CUT' | 'MAINTENANCE' | 'BULK' | 'STRENGTH'} PhaseOverride */

/**
 * TDEE-based kcal target lookup per phase (matches plan.js legacy mapping).
 * @param {number} tdee
 * @returns {Record<string, number>}
 */
function kcalMapForTdee(tdee) {
  return {
    CUT: Math.round(tdee * 0.82),
    BULK: Math.round(tdee * 1.08),
    MAINTENANCE: tdee,
    STRENGTH: Math.round(tdee * 1.05),
  };
}

/**
 * Persist manual phase override.
 * @param {PhaseOverride} phase
 * @param {number} tdee - Current TDEE estimate (from SYS.estimateTDEE())
 * @returns {{ phase: PhaseOverride, kcalTarget: number, date: string }}
 */
export function setPhaseOverride(phase, tdee) {
  const today = tod();
  if (phase === 'AUTO') {
    DB.set('phase-change-date', today);
    DB.set('phase-override', null);
    const phaseLogs = /** @type {Array<{date: string, phase: string, kcalTarget: number}>} */ (
      DB.get('phase-log') || []
    );
    const filtered = phaseLogs.filter((e) => e.date !== today);
    filtered.push({ date: today, phase: 'AUTO', kcalTarget: Math.round(tdee) });
    DB.set('phase-log', filtered);
    return { phase: 'AUTO', kcalTarget: Math.round(tdee), date: today };
  }

  DB.set('phase-change-date', today);
  DB.set('phase-override', phase);
  const kcalMap = kcalMapForTdee(tdee);
  const kcalTarget = kcalMap[phase] ?? Math.round(tdee);
  const phaseLogs = /** @type {Array<{date: string, phase: string, kcalTarget: number}>} */ (
    DB.get('phase-log') || []
  );
  const filtered = phaseLogs.filter((e) => e.date !== today);
  filtered.push({ date: today, phase, kcalTarget });
  DB.set('phase-log', filtered);
  return { phase, kcalTarget, date: today };
}

/**
 * Get current phase override (null = auto).
 * @returns {PhaseOverride | null}
 */
export function getPhaseOverride() {
  const v = /** @type {string | null} */ (DB.get('phase-override'));
  if (v === null || v === undefined) return null;
  if (v === 'CUT' || v === 'MAINTENANCE' || v === 'BULK' || v === 'STRENGTH') return v;
  return null;
}
