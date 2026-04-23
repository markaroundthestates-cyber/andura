// ══ RECALIBRATION — Scheduled cache refresh per calibration tier ═══════════
// Recalibration frequency drops as user matures: per_session → daily →
// weekly → monthly. Trigger events (new PR, injury, long break) force
// immediate recalibration regardless of schedule.

import { shouldRecalibrate } from './calibration.js';
import { detectWeakGroups } from './weaknessDetector.js';
import { computeUserProfile } from './responseProfile.js';

const LAST_RECAL_KEY = 'last-recalibration';

/**
 * Run recalibration if scheduled for this tier.
 * Returns { recalibrated: boolean, reason: string }.
 */
export async function maybeRecalibrate(ctx) {
  const level = ctx.calibrationLevel;
  if (!level) return { recalibrated: false, reason: 'No calibration level in ctx' };

  const last = localStorage.getItem(LAST_RECAL_KEY);

  if (!shouldRecalibrate(level, last)) {
    return { recalibrated: false, reason: 'Not scheduled yet' };
  }

  console.log('[Recalibration] Running for level:', level.name);

  const allLogs = ctx.allLogs ?? [];

  if (level.weakGroupEnabled) {
    try {
      const { weakGroups, ratio } = detectWeakGroups(allLogs);
      localStorage.setItem('weak-group-cache', JSON.stringify({ weakGroups, ratio, ts: Date.now() }));
    } catch { /* non-blocking */ }
  }

  if (level.responseProfileEnabled) {
    try {
      const profile = computeUserProfile(allLogs);
      localStorage.setItem('response-profile', JSON.stringify(profile));
    } catch { /* non-blocking */ }
  }

  localStorage.setItem(LAST_RECAL_KEY, new Date().toISOString());

  return { recalibrated: true, level: level.name, timestamp: new Date().toISOString() };
}

/**
 * Force immediate recalibration on trigger events:
 * new PR, injury flag, return after long break (>14 days), phase change.
 */
export function triggerForceRecalibration(reason) {
  localStorage.removeItem(LAST_RECAL_KEY);
  console.log('[Recalibration] Forced by:', reason);
}
