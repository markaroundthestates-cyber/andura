// ══ SELF-CORRECTION §36.35 — Goal Shift Event Handler ════════════════════════
// LOCKED V1 per §36.35 + ADR_OUTLIER_FILTER EXT-2 + §36.58 GOAL_SHIFT_CALIBRATION_PLACEHOLDER.
// User schimba obiectiv (CUT→BULK / Forta→Tonifiere) → RESET streak counter +
// primele 2 sesiuni = calibration window (NU outlier active, NU bias adjustments).

import { onGoalShift } from '../suflet-andura/outlier-filter.js';

/**
 * @typedef {Object} GoalShiftState
 * @property {string} previousGoal
 * @property {string} newGoal
 * @property {number} sessionsSinceShift 0 = same session as shift, 1 = first post-shift, 2 = second post-shift
 * @property {boolean} calibrationActive true in primele 2 sesiuni post-shift
 */

/**
 * Initialize state when a goal shift event occurs.
 * @param {string} previousGoal
 * @param {string} newGoal
 * @returns {GoalShiftState}
 */
export function initiateGoalShift(previousGoal, newGoal) {
  const reset = onGoalShift();
  return {
    previousGoal,
    newGoal,
    sessionsSinceShift: 0,
    calibrationActive: true,
    streak: reset.streak,
    calibrationSessionsRemaining: reset.calibrationSessionsRemaining,
  };
}

/**
 * Advance the post-shift session counter; deactivate calibration after 2 sessions.
 * @param {GoalShiftState} state
 * @returns {GoalShiftState}
 */
export function advancePostShiftSession(state) {
  const next = { ...state, sessionsSinceShift: state.sessionsSinceShift + 1 };
  next.calibrationActive = next.sessionsSinceShift < 2;
  next.calibrationSessionsRemaining = Math.max(0, 2 - next.sessionsSinceShift);
  return next;
}

/**
 * Build placeholder data for GOAL_SHIFT_CALIBRATION_PLACEHOLDER (§36.58 LOCKED V1).
 * minKg/maxKg/reps = legitimate user-data per §6 evening anti-RE rule.
 * @param {{ minKg: number, maxKg: number, reps: number, current: number }} ctx
 */
export function buildCalibrationPlaceholderData(ctx) {
  return {
    id: 'goal_shift_calibration_notice',
    title: 'Recalibram pe noul obiectiv',
    body: `Primele 2 sesiuni sunt de calibrare · Estimam ${ctx.minKg}-${ctx.maxKg} kg × ${ctx.reps} reps, ajustam dupa ce avem date`,
    subText: `Sesiunea ${ctx.current}/2`,
  };
}
