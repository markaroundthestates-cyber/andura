// ══ GOAL / PHASE / NUTRITION COHERENCE MODEL ════════════════════════════════
//
// Daniel repro 2026-05-30: goal="masa" (muscle mass) + target weight 90kg (below
// current 110kg) recommended ~2200 kcal (a DEFICIT) and the PHASE badge stayed
// stuck on AUTO. Two incoherent root causes:
//   A) committing a goal never set `phase-override` → badge stale on AUTO.
//   B) the target-weight kcal override (a 90<110 DEFICIT) outranked + discarded
//      the goal's BULK surplus → "masa" produced a deficit.
//
// This module is the SINGLE pure source of truth that makes goal + target weight
// + phase + kcal coherent. No I/O — callers read the stores and pass values in.
//
//   1. Target weight = master intent. direction = sign(target − current), with a
//      small dead-band treated as MAINTAIN.
//   2. Phase GATING: a target direction makes contradicting phases unselectable
//      (the goal card grays them out). gatingForDirection() returns the set.
//   3. AUTO derives the real phase: target-driven when a clear direction exists,
//      else BF-driven (sex-aware) from the body-fat estimate.
//   4. phaseForGoal maps the committed goal → the phase-override token (so the
//      badge reflects the active phase, never stale).
//   5. Rate-capped kcal: maintenance TDEE + a directional shift sized to reach
//      the target by the deadline, CAPPED at 1.5 kg/wk loss / 0.5 kg/wk gain,
//      floored sex-aware. The phase direction sets the sign — a BULK goal is
//      ALWAYS a surplus above maintenance (bug B can no longer happen).

import type { Goal } from '../stores/onboardingStore';

// ── Phase token vocabulary (matches phase-override localStorage + PHASE_KEY_MAP)
export type PhaseToken = 'AUTO' | 'CUT' | 'BULK' | 'MAINTENANCE' | 'STRENGTH';

// ── Target intent direction ──────────────────────────────────────────────────
export type TargetDirection = 'LOSE' | 'MAINTAIN' | 'GAIN';

// |Δ| within this band (kg) reads as MAINTAIN — a 110.4kg target from 110kg is
// not a real cut, and sign() noise on a near-equal target should not gate phases.
export const MAINTAIN_BAND_KG = 1.5;

/**
 * Master intent from target weight vs current weight. Returns null when either
 * input is missing/invalid (no target set → no gating, all phases enabled).
 * Pure.
 */
export function targetDirection(
  currentKg: number | null | undefined,
  targetKg: number | null | undefined,
): TargetDirection | null {
  const cur = Number(currentKg);
  const tgt = Number(targetKg);
  if (!Number.isFinite(cur) || cur <= 0) return null;
  if (!Number.isFinite(tgt) || tgt <= 0) return null;
  const delta = tgt - cur;
  if (Math.abs(delta) < MAINTAIN_BAND_KG) return 'MAINTAIN';
  return delta < 0 ? 'LOSE' : 'GAIN';
}

// ── Goal ↔ phase mapping ─────────────────────────────────────────────────────
/**
 * Pure goal → phase-override token. Committing a goal persists THIS token so the
 * badge reflects the active phase. 'auto' clears the override (→ AUTO). Reuse
 * everywhere a goal must map to a phase (badge, kcal, gating). Pure.
 *   masa→BULK, slabire→CUT, forta→STRENGTH, mentenanta→MAINTENANCE, auto→AUTO.
 */
export function phaseForGoal(goal: Goal | null | undefined): PhaseToken {
  switch (goal) {
    case 'masa':
      return 'BULK';
    case 'slabire':
      return 'CUT';
    case 'forta':
      return 'STRENGTH';
    case 'mentenanta':
      return 'MAINTENANCE';
    case 'auto':
    default:
      return 'AUTO';
  }
}

// ── Phase gating by target direction ─────────────────────────────────────────
/**
 * Which goals are SELECTABLE given the target direction. Auto is always allowed.
 * The contradicting goals are disabled (grayed out, not tappable) in the card:
 *   LOSE     → enabled: auto, slabire.            disabled: masa, mentenanta, forta.
 *   MAINTAIN → enabled: auto, mentenanta, forta.  disabled: slabire, masa.
 *   GAIN     → enabled: auto, masa, forta.        disabled: slabire, mentenanta.
 *   null (no target) → all enabled.
 * Pure — returns the set of ENABLED goal ids.
 */
export function enabledGoalsForDirection(
  direction: TargetDirection | null,
): ReadonlySet<Goal> {
  switch (direction) {
    case 'LOSE':
      return new Set<Goal>(['auto', 'slabire']);
    case 'MAINTAIN':
      return new Set<Goal>(['auto', 'mentenanta', 'forta']);
    case 'GAIN':
      return new Set<Goal>(['auto', 'masa', 'forta']);
    default:
      // No target set → no contradictions possible, everything enabled.
      return new Set<Goal>(['auto', 'forta', 'masa', 'slabire', 'mentenanta']);
  }
}

/** True when `goal` is selectable under the given target direction. Pure. */
export function isGoalEnabled(
  goal: Goal,
  direction: TargetDirection | null,
): boolean {
  return enabledGoalsForDirection(direction).has(goal);
}

// ── AUTO phase derivation ────────────────────────────────────────────────────
// Sex-aware BF thresholds for the BF-driven branch (spec 2026-05-30):
//   men   BF > 15% → CUT, BF < 12% → BUILD(=BULK), else MAINTENANCE.
//   women BF > 25% → CUT, BF < 22% → BUILD(=BULK), else MAINTENANCE.
export const BF_AUTO_THRESHOLDS = {
  male: { cutAbove: 0.15, buildBelow: 0.12 },
  female: { cutAbove: 0.25, buildBelow: 0.22 },
} as const;

export interface AutoPhaseInputs {
  /** Direction from target weight (master signal when present + not MAINTAIN). */
  direction: TargetDirection | null;
  /** Body-fat as a FRACTION (0-1), sex-aware threshold fallback. */
  bfFraction: number | null | undefined;
  sex: 'm' | 'f' | null | undefined;
}

/**
 * The real phase AUTO resolves to. Target direction wins when it is a clear
 * LOSE/GAIN (the user told us where they're going). MAINTAIN target or no target
 * → derive from the BF estimate (sex-aware). No BF signal → MAINTENANCE. Pure.
 */
export function deriveAutoPhase({ direction, bfFraction, sex }: AutoPhaseInputs): PhaseToken {
  if (direction === 'LOSE') return 'CUT';
  if (direction === 'GAIN') return 'BULK';
  // MAINTAIN target or no target → BF-driven, sex-aware.
  const bf = Number(bfFraction);
  if (!Number.isFinite(bf) || bf <= 0 || bf >= 1) return 'MAINTENANCE';
  const th = sex === 'f' ? BF_AUTO_THRESHOLDS.female : BF_AUTO_THRESHOLDS.male;
  if (bf > th.cutAbove) return 'CUT';
  if (bf < th.buildBelow) return 'BULK';
  return 'MAINTENANCE';
}

// ── Rate-capped kcal sizing ──────────────────────────────────────────────────
// Body-fat caloric density (kcal/kg) — classic 1kg fat ≈ 7700 kcal. Re-exported
// here so the sizing math is self-contained (targetSafety holds the same const).
export const KCAL_PER_KG = 7700;
// Direction-asymmetric weekly rate caps (kg/week). Loss can be faster than gain:
// a faster gain is just fat, a faster loss erodes muscle but the body tolerates
// a larger deficit than it can use a surplus.
export const MAX_LOSS_KG_PER_WEEK = 1.5;
export const MAX_GAIN_KG_PER_WEEK = 0.5;

export interface KcalSizingResult {
  kcalTarget: number;
  /** Daily shift vs maintenance (negative = deficit, positive = surplus). */
  dailyShift: number;
  /** True when the weekly-rate cap reduced the shift (deadline too aggressive). */
  rateCapped: boolean;
  /** True when the sex-aware kcal floor clamped the result. */
  floored: boolean;
}

export interface KcalSizingInputs {
  /** Active phase (sets the SIGN; AUTO must be resolved by the caller first). */
  phase: PhaseToken;
  maintenanceTdee: number;
  currentKg: number | null;
  targetKg: number | null;
  /** Days remaining to the deadline (caller derives via daysUntilTarget). */
  daysRemaining: number | null;
  /** Sex-aware kcal floor (men 1200 / women 1000). */
  kcalFloor: number;
}

/**
 * kcal = maintenance + a directional shift sized to reach the target by the
 * deadline, CAPPED to the weekly-rate limit, then floored. The PHASE direction
 * sets the sign — so a BULK goal is ALWAYS a surplus above maintenance and a CUT
 * is ALWAYS a deficit, regardless of how the raw target-math would land (bug B).
 *
 * Sizing logic:
 *   - CUT / BULK with a real target + deadline → shift = Δkg×7700/days, but the
 *     |Δkg|/weeks rate is clamped to the cap, and the sign is forced by phase
 *     (a CUT can never surface a surplus even if target>current, and vice-versa).
 *   - CUT / BULK without a target/deadline → a sane default rate shift toward the
 *     phase direction (0.5kg/wk cut, 0.25kg/wk bulk) so the goal still bites.
 *   - MAINTENANCE → maintenance (shift 0). STRENGTH → slight surplus (+5%).
 *   - AUTO must NOT reach here unresolved — treated as MAINTENANCE defensively.
 * Pure.
 */
export function sizeKcalForPhase(input: KcalSizingInputs): KcalSizingResult {
  const { phase, maintenanceTdee, currentKg, targetKg, daysRemaining, kcalFloor } = input;
  const tdee = Number(maintenanceTdee);
  if (!Number.isFinite(tdee) || tdee <= 0) {
    // No maintenance estimate → nothing to size against; floor-only.
    const floored = Math.max(Math.round(Number.isFinite(tdee) ? tdee : 0), kcalFloor);
    return { kcalTarget: floored, dailyShift: 0, rateCapped: false, floored: floored !== Math.round(tdee || 0) };
  }

  // MAINTENANCE / AUTO(defensive) → maintenance. STRENGTH → slight surplus.
  if (phase === 'MAINTENANCE' || phase === 'AUTO') {
    return finalize(tdee, 0, false, kcalFloor);
  }
  if (phase === 'STRENGTH') {
    return finalize(tdee, tdee * 0.05, false, kcalFloor);
  }

  // CUT or BULK — directional. Sign forced by phase.
  const sign = phase === 'CUT' ? -1 : 1;
  const cap = phase === 'CUT' ? MAX_LOSS_KG_PER_WEEK : MAX_GAIN_KG_PER_WEEK;

  const cur = Number(currentKg);
  const tgt = Number(targetKg);
  const days = Number(daysRemaining);
  const haveTarget =
    Number.isFinite(cur) && cur > 0 && Number.isFinite(tgt) && tgt > 0 &&
    Number.isFinite(days) && days > 0;

  let kgPerWeek: number;
  let rateCapped = false;
  if (haveTarget) {
    // Magnitude required to reach the target by the deadline (always positive;
    // the phase sign drives direction — a CUT toward a HIGHER target still cuts
    // at the default rate, never flips to a surplus).
    const weeks = days / 7;
    const requiredAbs = Math.abs(tgt - cur) / weeks;
    if (requiredAbs > cap) {
      kgPerWeek = cap;
      rateCapped = true;
    } else if (requiredAbs <= 0) {
      // Target equals current under a directional phase → default rate nudge.
      kgPerWeek = defaultRate(phase);
    } else {
      kgPerWeek = requiredAbs;
    }
  } else {
    // No target/deadline → sane default rate so the chosen phase still bites.
    kgPerWeek = defaultRate(phase);
  }

  const dailyShift = sign * (kgPerWeek * KCAL_PER_KG) / 7;
  return finalize(tdee, dailyShift, rateCapped, kcalFloor);
}

/** Default weekly rate when no target/deadline drives the sizing. */
function defaultRate(phase: PhaseToken): number {
  return phase === 'CUT' ? 0.5 : 0.25;
}

function finalize(
  tdee: number,
  dailyShift: number,
  rateCapped: boolean,
  kcalFloor: number,
): KcalSizingResult {
  const raw = Math.round(tdee + dailyShift);
  const kcalTarget = Math.max(raw, kcalFloor);
  return {
    kcalTarget,
    dailyShift: Math.round(dailyShift),
    rateCapped,
    floored: kcalTarget !== raw,
  };
}
