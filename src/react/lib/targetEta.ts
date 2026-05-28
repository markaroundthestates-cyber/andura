// ══ TARGET ETA — Pure ETA computation (Obiectiv tinta) ════════════════════
// §obiectiv-tinta 2026-05-28 Daniel relocate from Cont → Progres. Extracted
// from SettingsProfile.tsx (BUG #8 originally) so ObiectivCard (Progres tab)
// can compute the same realistic ETA from current+target weight + height.
//
// BUG #8 safety preserved:
//   1. If target < BMI-18.5 floor for current height → 'subhealthy' verdict
//      (warning, NO projection — we don't ETA towards dangerous weights).
//   2. Otherwise project at safe rate: 0.5 kg/week loss, 0.25 kg/week gain
//      (engine convention aliniat cu sys.js weeksToKg).
//
// Pure function — no side effects, no I/O. Caller passes plain numbers.

import { healthyFloorWeightKg } from '../../engine/bodyComposition.js';

/** Safe rate of change at which the ETA assumes the user progresses. */
const SAFE_LOSS_KG_PER_WEEK = 0.5;
const SAFE_GAIN_KG_PER_WEEK = 0.25;

/**
 * Discriminated result:
 *  - 'subhealthy' → target below BMI 18.5 floor → warning, no ETA
 *  - 'at-target'  → already within 0.5 kg of target → "esti deja la tinta"
 *  - 'eta'        → realistic horizon at safe rate
 *  - null         → missing inputs (target/current/height) or invalid
 */
export type TargetEta =
  | { kind: 'subhealthy'; minKg: number }
  | { kind: 'at-target' }
  | { kind: 'eta'; weeks: number; label: string };

export function computeTargetEta(
  targetWeightKg: number | null,
  currentWeightKg: number | null,
  heightCm: number | null,
): TargetEta | null {
  if (targetWeightKg === null || !Number.isFinite(targetWeightKg) || targetWeightKg <= 0) {
    return null;
  }

  // Guard subponderal — target below BMI 18.5 floor at current height.
  // Takes precedence over any ETA (never project towards dangerous weight).
  const minKg = healthyFloorWeightKg(heightCm ?? NaN);
  if (minKg !== null && targetWeightKg < minKg) {
    return { kind: 'subhealthy', minKg };
  }

  // Realistic ETA needs current weight as starting point.
  if (currentWeightKg === null || !Number.isFinite(currentWeightKg) || currentWeightKg <= 0) {
    return null;
  }
  const deltaKg = targetWeightKg - currentWeightKg;
  if (Math.abs(deltaKg) < 0.5) return { kind: 'at-target' };

  const ratePerWeek = deltaKg < 0 ? SAFE_LOSS_KG_PER_WEEK : SAFE_GAIN_KG_PER_WEEK;
  const weeks = Math.ceil(Math.abs(deltaKg) / ratePerWeek);
  return { kind: 'eta', weeks, label: etaHorizonLabel(weeks) };
}

/** Human-friendly horizon: <8 weeks → "~N saptamani", else "~N luni". */
export function etaHorizonLabel(weeks: number): string {
  if (weeks < 8) return `~${weeks} ${weeks === 1 ? 'saptamana' : 'saptamani'}`;
  const months = Math.round(weeks / 4.345);
  return `~${months} ${months === 1 ? 'luna' : 'luni'}`;
}

/** Format kg with 1 decimal place (round-trip). */
export function fmtKg(n: number): string {
  return String(Math.round(n * 10) / 10);
}
