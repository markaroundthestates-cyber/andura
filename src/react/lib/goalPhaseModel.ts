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
//   5. %-of-TDEE kcal: maintenance TDEE + a directional shift sized as a PERCENT
//      of the user's own maintenance (adaptive — scales with the person), then
//      ADDITIONALLY capped at 1.5 kg/wk loss / 0.5 kg/wk gain, floored sex-aware.
//      The phase direction sets the sign — a BULK goal is ALWAYS a surplus above
//      maintenance (bug B can no longer happen).

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

// ── %-of-TDEE kcal sizing ────────────────────────────────────────────────────
// Body-fat caloric density (kcal/kg) — classic 1kg fat ≈ 7700 kcal. Re-exported
// here so the sizing math is self-contained (targetSafety holds the same const).
export const KCAL_PER_KG = 7700;
// Direction-asymmetric weekly rate caps (kg/week). Loss can be faster than gain:
// a faster gain is just fat, a faster loss erodes muscle but the body tolerates
// a larger deficit than it can use a surplus. These are a SECONDARY cap on top of
// the % model (so a very high-TDEE person doesn't get an absurd absolute rate).
export const MAX_LOSS_KG_PER_WEEK = 1.5;
export const MAX_GAIN_KG_PER_WEEK = 0.5;

// Adaptive deficit/surplus as a FRACTION of the user's own maintenance TDEE
// (Daniel LOCK 2026-05-30). This scales with the person — a 110kg male (TDEE
// ~2500) cutting at 20% loses 500 kcal/day → ~2000 kcal (NOT floored at 1200),
// while a 1500-TDEE user cutting at 20% loses 300 → 1200 (at the floor, ok). A
// FIXED kg/week rate would floor the big person and be impossible for the small.
//   CUT  default 20% deficit, capped 25% max.
//   BULK default 12% surplus, capped 15% max.
//   STRENGTH ~maintenance: very slight +5% surplus (capped 5%).
export const CUT_DEFICIT_FRACTION_DEFAULT = 0.20;
export const CUT_DEFICIT_FRACTION_MAX = 0.25;
export const BULK_SURPLUS_FRACTION_DEFAULT = 0.12;
export const BULK_SURPLUS_FRACTION_MAX = 0.15;
export const STRENGTH_SURPLUS_FRACTION = 0.05;

export interface KcalSizingResult {
  kcalTarget: number;
  /** Daily shift vs maintenance (negative = deficit, positive = surplus). */
  dailyShift: number;
  /** True when a cap (the % cap OR the kg/week cap) reduced the shift. */
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
 * kcal = maintenance + a directional shift sized as a PERCENT of the user's own
 * maintenance TDEE (adaptive — scales with the person), then ADDITIONALLY capped
 * to the weekly-rate limit, then floored. The PHASE direction sets the sign — so
 * a BULK goal is ALWAYS a surplus above maintenance and a CUT is ALWAYS a deficit,
 * regardless of how the raw target-math would land (bug B).
 *
 * Why % not a fixed kg/week rate (Daniel LOCK 2026-05-30): a fixed rate floors a
 * big person (110kg male would get the 1200 hard floor) and is impossible for a
 * small one (a 1500-TDEE user can't take a 1650 deficit). 20% of TDEE keeps the
 * 110kg male at ~2000 and the small user at ~1200 (their floor), both sane.
 *
 * Sizing logic:
 *   - CUT / BULK without a target/deadline → DEFAULT % shift (20% deficit /
 *     12% surplus) so the chosen phase bites at a sustainable, adaptive rate.
 *   - CUT / BULK with a real target + deadline → size the shift to hit the target
 *     by the date, but clamp to BOTH the % cap (25% deficit / 15% surplus) AND
 *     the kg/week cap (1.5 loss / 0.5 gain). If the date is impossible within the
 *     caps, use the binding cap (never exceed). Sign forced by phase (a CUT can
 *     never surface a surplus even if target>current, and vice-versa).
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
    return finalize(tdee, tdee * STRENGTH_SURPLUS_FRACTION, false, kcalFloor);
  }

  // CUT or BULK — directional. Sign forced by phase.
  const sign = phase === 'CUT' ? -1 : 1;
  const fractionDefault =
    phase === 'CUT' ? CUT_DEFICIT_FRACTION_DEFAULT : BULK_SURPLUS_FRACTION_DEFAULT;
  const fractionMax = phase === 'CUT' ? CUT_DEFICIT_FRACTION_MAX : BULK_SURPLUS_FRACTION_MAX;
  const kgPerWeekCap = phase === 'CUT' ? MAX_LOSS_KG_PER_WEEK : MAX_GAIN_KG_PER_WEEK;

  // Absolute kcal/day ceilings from BOTH caps — the binding one is whichever is
  // smaller for THIS user (the % cap usually binds; the kg/week cap protects
  // very-high-TDEE users from an absurd absolute rate).
  const maxAbsShiftPct = tdee * fractionMax;
  const maxAbsShiftRate = (kgPerWeekCap * KCAL_PER_KG) / 7;

  const cur = Number(currentKg);
  const tgt = Number(targetKg);
  const days = Number(daysRemaining);
  const haveTarget =
    Number.isFinite(cur) && cur > 0 && Number.isFinite(tgt) && tgt > 0 &&
    Number.isFinite(days) && days > 0;

  let absShift: number;
  let rateCapped = false;
  if (haveTarget) {
    // Size the deficit/surplus to hit the target by the deadline (kcal/day), then
    // clamp to BOTH caps. The phase sign drives direction — a CUT toward a HIGHER
    // target still cuts at the default %, never flips to a surplus.
    const requiredAbs = (Math.abs(tgt - cur) * KCAL_PER_KG) / days;
    if (requiredAbs <= 0) {
      // Target equals current under a directional phase → default % nudge.
      absShift = tdee * fractionDefault;
    } else {
      absShift = Math.min(requiredAbs, maxAbsShiftPct, maxAbsShiftRate);
      rateCapped = requiredAbs > absShift;
    }
  } else {
    // No target/deadline → default % shift so the chosen phase still bites.
    absShift = tdee * fractionDefault;
  }

  return finalize(tdee, sign * absShift, rateCapped, kcalFloor);
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
