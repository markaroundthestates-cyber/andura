// ══ FATIGUE → KCAL DEFICIT EASE — recovery-protective nudge (real + minimal) ══
//
// Physiology honesty: fatigue does NOT meaningfully change TDEE (the energy you
// burn). So we do NOT fake a TDEE change. The one realistic, evidence-aligned
// rule is RECOVERY-PROTECTIVE: when a user is in a sustained high-fatigue state
// AND is currently running an active calorie DEFICIT, holding a hard deficit
// while under-recovered worsens fatigue and risk (sleep, performance, injury).
// Easing the deficit toward maintenance for that day is the standard coaching
// move ("eat closer to maintenance on a bad-recovery day").
//
// This helper NEVER lowers a target, NEVER pushes above maintenance, NEVER
// touches the engine's TDEE estimate. It only nudges the DISPLAYED daily kcal
// target up, by a small CAPPED amount, and the UI labels it transparently. It
// is a pure no-op unless BOTH gates hold (high fatigue + active deficit).

// Half the deficit is closed, capped — a gentle ease, not a cheat day.
const EASE_FRACTION = 0.5;
// Absolute cap on how much we add (kcal). Keeps the nudge small + honest even
// on a very large deficit (a 600-kcal deficit eases by at most this, not 300).
const MAX_EASE_KCAL = 150;
// Below this added amount the ease is noise — round it away (no UI churn for a
// +20 kcal "ease" that means nothing).
const MIN_MEANINGFUL_KCAL = 25;

export interface FatigueEaseResult {
  /** The kcal target after the (possible) ease. Equals input when no-op. */
  easedKcal: number;
  /** kcal added by the ease (0 when no-op). */
  addedKcal: number;
  /** True only when the ease actually applied (both gates + meaningful amount). */
  eased: boolean;
}

/**
 * Recovery-protective deficit ease. Pure.
 *
 * @param kcalTarget    current displayed daily kcal target.
 * @param maintenanceKcal user's maintenance TDEE (null when unknown → no-op).
 * @param fatigueKey    fatigue engine semantic key (only 'HIGH_FATIGUE' gates).
 *
 * Returns the original target unchanged unless the user is in HIGH_FATIGUE AND
 * the target is a genuine deficit (target < maintenance). Then it closes half
 * the deficit, capped at MAX_EASE_KCAL, never crossing maintenance, and only if
 * the resulting bump is meaningful (>= MIN_MEANINGFUL_KCAL).
 */
export function easeDeficitForFatigue(
  kcalTarget: number,
  maintenanceKcal: number | null,
  fatigueKey: string | null | undefined,
): FatigueEaseResult {
  const noop: FatigueEaseResult = { easedKcal: kcalTarget, addedKcal: 0, eased: false };

  if (fatigueKey !== 'HIGH_FATIGUE') return noop;
  if (maintenanceKcal == null || !Number.isFinite(maintenanceKcal)) return noop;
  if (!Number.isFinite(kcalTarget)) return noop;

  // Only an ACTIVE deficit qualifies (target meaningfully below maintenance).
  const deficit = maintenanceKcal - kcalTarget;
  if (deficit <= 0) return noop;

  const rawAdd = Math.min(deficit * EASE_FRACTION, MAX_EASE_KCAL);
  // Never cross maintenance.
  const cappedAdd = Math.min(rawAdd, maintenanceKcal - kcalTarget);
  const addedKcal = Math.round(cappedAdd);

  if (addedKcal < MIN_MEANINGFUL_KCAL) return noop;

  return { easedKcal: kcalTarget + addedKcal, addedKcal, eased: true };
}
