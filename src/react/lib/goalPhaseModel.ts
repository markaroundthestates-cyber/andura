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
//   5. kcal sizing: a target+deadline drives the deficit/surplus DIRECTLY (as
//      aggressive as the goal demands — CEO LOCK 2026-05-31); no target → a
//      default %-of-maintenance shift so the phase still bites. The result is then
//      floored sex-aware (women 1000 / men 1200) — the SOLE safety limit (the
//      intermediate 25% / 1.5kg-wk rate caps were removed). The phase direction
//      sets the sign — a BULK goal is ALWAYS a surplus above maintenance (bug B
//      can no longer happen).

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

// Default deficit/surplus as a FRACTION of the user's own maintenance TDEE, used
// ONLY when there is NO target+deadline (a phase still needs a sane rate to bite
// without a goal). This scales with the person — a 110kg male (TDEE ~2500) cutting
// at 20% loses 500 kcal/day → ~2000 kcal, while a 1500-TDEE user cutting at 20%
// loses 300 → 1200 (at the floor, ok).
//
// CEO DECISION 2026-05-31 (LOCKED) — when a target+deadline IS set, the deficit/
// surplus is GOAL-DRIVEN and as aggressive as the goal demands: the deadline
// `requiredAbs` shift drives the target DIRECTLY. The old intermediate caps (25%
// deficit + 1.5kg/wk loss / 15% surplus + 0.5kg/wk gain) are REMOVED — they capped
// aggressiveness above the safe minimum and made the app useless for users with
// ambitious goals. The ONLY remaining safety limit is the sex kcal floor (women
// 1000 / men 1200), applied LAST in finalize — never go below it, never cap above
// it. The defaults below survive only as the no-target fallback rate.
//   CUT  default 20% deficit (no-target only).
//   BULK default 12% surplus (no-target only).
//   STRENGTH ~maintenance: very slight +5% surplus.
export const CUT_DEFICIT_FRACTION_DEFAULT = 0.20;
export const BULK_SURPLUS_FRACTION_DEFAULT = 0.12;
export const STRENGTH_SURPLUS_FRACTION = 0.05;

export interface KcalSizingResult {
  kcalTarget: number;
  /** Daily shift vs maintenance (negative = deficit, positive = surplus). */
  dailyShift: number;
  /**
   * Retained for the display-signal contract (resolveSafetyLimited). The
   * intermediate rate caps were removed (CEO LOCK 2026-05-31) — an aggressive
   * goal+deadline now drives the deficit/surplus directly, so this is always
   * false. The sex kcal floor (see `floored`) is the sole safety limit.
   */
  rateCapped: boolean;
  /** True when the sex-aware kcal floor clamped the result UP. The SOLE limit. */
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
 * kcal = maintenance + a directional shift, then floored sex-aware. The PHASE
 * direction sets the sign — so a BULK goal is ALWAYS a surplus above maintenance
 * and a CUT is ALWAYS a deficit, regardless of how the raw target-math would land
 * (bug B).
 *
 * CEO DECISION 2026-05-31 (LOCKED) — the recommendation is goal+deadline-driven
 * and as aggressive as the goal demands. The SOLE safety limit is the sex kcal
 * floor (women 1000 / men 1200), applied LAST in finalize. The old intermediate
 * rate caps (25% deficit / 1.5kg-wk loss, 15% surplus / 0.5kg-wk gain) are
 * REMOVED — above the floor we do NOT cap aggressiveness.
 *
 * Sizing logic:
 *   - CUT / BULK with a real target + deadline → the shift required to hit the
 *     target by the date drives the deficit/surplus DIRECTLY (no rate cap). The
 *     floor in finalize catches anything that would land below the safe minimum.
 *     Sign forced by phase (a CUT can never surface a surplus even if
 *     target>current, and vice-versa).
 *   - CUT / BULK without a target/deadline → DEFAULT % shift (20% deficit /
 *     12% surplus) so the chosen phase still bites at a sane adaptive rate.
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

  const cur = Number(currentKg);
  const tgt = Number(targetKg);
  const days = Number(daysRemaining);
  const haveTarget =
    Number.isFinite(cur) && cur > 0 && Number.isFinite(tgt) && tgt > 0 &&
    Number.isFinite(days) && days > 0;

  let absShift: number;
  if (haveTarget) {
    // CEO LOCK 2026-05-31 — the deficit/surplus required to hit the target by the
    // deadline drives the shift DIRECTLY, as aggressive as the goal demands. No
    // rate cap above the floor (the sex floor in finalize is the sole limit). The
    // phase sign drives direction — a CUT toward a HIGHER target still cuts at the
    // default %, never flips to a surplus.
    const requiredAbs = (Math.abs(tgt - cur) * KCAL_PER_KG) / days;
    // Target equals current under a directional phase → default % nudge.
    absShift = requiredAbs > 0 ? requiredAbs : tdee * fractionDefault;
  } else {
    // No target/deadline → default % shift so the chosen phase still bites.
    absShift = tdee * fractionDefault;
  }

  // rateCapped is always false now (rate caps removed) — kept for the display
  // signal contract; the sex floor (floored, in finalize) is the only limit.
  return finalize(tdee, sign * absShift, false, kcalFloor);
}

// ── A4 coached recommendation (sustainable cap, flag dp_nutrition_coached_v1) ──
// The MATH target (sizeKcalForPhase above) is goal-driven + as aggressive as the
// deadline demands, bounded only by the hard sex floor (CEO LOCK 2026-05-31). A
// bare floor stops "dangerous" but not "too aggressive / unsustainable": a 150kg
// man told to cut to 90kg in 8 weeks math-targets ~−7700/day → floored to 1200,
// a punishing deficit that wastes muscle. A good coach prescribes a SUSTAINABLE
// deficit, not the mathematical extreme.
//
// Evidence (documented): an aggressive-but-sustainable cut sits around a 20-25%
// deficit below maintenance (~0.5-1%/wk bodyweight — Helms et al. 2014 "Evidence-
// based recommendations for natural bodybuilding contest preparation"; ISSN/
// Aragon-Schoenfeld). The existing no-target default already uses a 20% deficit
// (CUT_DEFICIT_FRACTION_DEFAULT). We cap the COACHED deficit at the upper-
// sustainable 25% below maintenance, and the COACHED surplus at a moderate 20%
// above (lean-gain bias — a leaner surplus minimizes fat gain). The cap only ever
// pulls the math target back TOWARD maintenance (a milder shift); a math target
// already milder than the cap is returned unchanged. The hard sex floor still
// applies underneath (the coached deficit can never sit below it).
export const COACHED_MAX_DEFICIT_FRACTION = 0.25; // ≤25% below maintenance
export const COACHED_MAX_SURPLUS_FRACTION = 0.20;  // ≤20% above maintenance

export type CoachedReason =
  | 'deficit_capped_sustainable'
  | 'surplus_capped_moderate'
  | 'at_floor'
  | 'within_sustainable';

export interface CoachedKcalResult {
  /** The coached (sustainable-bounded) recommendation — what the user follows. */
  kcal: number;
  /** Short reason token explaining the coached number vs the math target. */
  reason: CoachedReason;
}

/**
 * Bound a MATH kcal target to a sustainable rate, given the user's maintenance.
 * Pure. Deterministic. The phase sign is inferred from math-vs-maintenance:
 *   - math < maintenance (a deficit) → never deeper than 25% below maintenance,
 *     never below the sex floor (floor wins → reason 'at_floor').
 *   - math > maintenance (a surplus) → never richer than 20% above maintenance.
 *   - math already within the sustainable band → returned unchanged
 *     ('within_sustainable').
 * When the math target is ALREADY the floor (a tiny-maintenance user whose 25%
 * cap would itself land below the floor), the floor is the coached number too and
 * the reason is 'at_floor' (the floor, not the cap, is the binding limit).
 */
export function applySustainableCap(
  mathKcal: number,
  maintenanceTdee: number,
  kcalFloor: number,
): CoachedKcalResult {
  const tdee = Number(maintenanceTdee);
  const floor =
    Number.isFinite(kcalFloor) && kcalFloor > 0 ? kcalFloor : SAFE_FALLBACK_FLOOR;
  // No usable maintenance → cannot reason about a sustainable rate; pass through
  // (still floor-guarded) and report the floor binding if it bit.
  if (!Number.isFinite(tdee) || tdee <= 0) {
    const k = Math.max(Math.round(mathKcal), floor);
    return { kcal: k, reason: k > Math.round(mathKcal) ? 'at_floor' : 'within_sustainable' };
  }

  if (mathKcal < tdee) {
    // Deficit. The deepest SUSTAINABLE coached number, but never below the floor.
    const sustainableDeficitKcal = Math.round(tdee * (1 - COACHED_MAX_DEFICIT_FRACTION));
    const coached = Math.max(mathKcal, sustainableDeficitKcal, floor);
    if (coached <= mathKcal) return { kcal: mathKcal, reason: 'within_sustainable' };
    // The cap raised the target. If it landed at the floor (the floor is higher
    // than the 25% cap for this small-maintenance user), the floor is the binding
    // limit; otherwise the sustainable-deficit cap bound it.
    return {
      kcal: coached,
      reason: coached === floor && floor > sustainableDeficitKcal ? 'at_floor' : 'deficit_capped_sustainable',
    };
  }

  if (mathKcal > tdee) {
    // Surplus. The richest moderate coached number; floor is irrelevant above tdee.
    const moderateSurplusKcal = Math.round(tdee * (1 + COACHED_MAX_SURPLUS_FRACTION));
    const coached = Math.max(Math.min(mathKcal, moderateSurplusKcal), floor);
    return {
      kcal: coached,
      reason: coached < mathKcal ? 'surplus_capped_moderate' : 'within_sustainable',
    };
  }

  // math == maintenance (MAINTENANCE / STRENGTH near-neutral) — nothing to bound.
  return { kcal: Math.max(mathKcal, floor), reason: 'within_sustainable' };
}

// Conservative fallback floor when the caller passes an invalid one (NaN/<=0) —
// the higher male minimum, so a missing-sex edge can never drop below the safe
// band. The sex-aware caller (readUserKcalFloor) supplies 1000/1200 normally.
const SAFE_FALLBACK_FLOOR = 1200;

function finalize(
  tdee: number,
  dailyShift: number,
  rateCapped: boolean,
  kcalFloor: number,
): KcalSizingResult {
  // CEO LOCK 2026-05-31 — the sex kcal floor is the SOLE safety limit and must be
  // bulletproof: it is mathematically impossible to output below it for ANY input.
  // A non-finite/non-positive shift or floor degrades to the safe band, never below.
  const floor =
    Number.isFinite(kcalFloor) && kcalFloor > 0 ? kcalFloor : SAFE_FALLBACK_FLOOR;
  const shift = Number.isFinite(dailyShift) ? dailyShift : 0;
  const raw = Math.round((Number.isFinite(tdee) ? tdee : 0) + shift);
  const kcalTarget = Math.max(raw, floor);
  return {
    kcalTarget,
    dailyShift: Math.round(shift),
    rateCapped,
    floored: kcalTarget !== raw,
  };
}
