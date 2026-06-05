// ══ COACH INSIGHT — the daily "why" line (Coach Voice) ════════════════════
// The adaptive brain (getDailyWorkout: M1 recovery cut, M2 weakness amp, M3
// imbalance fix, deload) silently shapes today's plan. The user sees only the
// result. A real coach SAYS it. This composer turns the engine's STRUCTURED
// adaptations log (CoachAdaptation[] — machine tokens, no copy) into ONE
// plain-language coach sentence via t() (RO no-diacritics + EN), surfaced on
// CoachTodayCard above the Start CTA.
//
// Truth-only: every clause maps to a real adaptation the engine reported this
// session. NO fabrication. Nothing adapted (empty log) → returns null → the card
// renders NO line (graceful, no filler).
//
// Salience (most → least): deload > recovery-cut > weakness-amp > imbalance-fix.
// At most TWO signals are merged into one natural sentence; the rest are dropped
// (one line, not a list). The line is composed entirely from t() keys — this
// module never carries a Romanian/English copy string (i18n leak harness).

import { t } from '../../i18n/index.js';
import { groupForExerciseBig11 } from '../../engine/muscleRecovery.js';
import type {
  CoachAdaptation,
  CoachAdaptationKind,
  PlannedExercise,
} from './engineWrappers.types';

// Salience rank — lower = more salient (shown first / wins as the primary clause).
const SALIENCE: Record<CoachAdaptationKind, number> = {
  deload: 0,
  'recovery-cut': 1,
  'weakness-amp': 2,
  'imbalance-fix': 3,
};

// ── Plan-allocation reconciliation (truth gate) ───────────────────────────
// The coach narrative must never claim what the GENERATED PLAN does not do.
// These helpers read the ACTUAL proposed exercise list (the same plan the user
// is about to run) and expose, per Big-11 group, how much volume the plan really
// allocates — so a "focus on X" / "lighter on X" clause can be checked against
// reality before it is voiced.

export interface PlanAllocation {
  // Sets the plan allocates per Big-11 RO group (only groups the plan touches).
  setsByGroup: Record<string, number>;
  // The single group the plan allocates the MOST sets to (the real focus). Null
  // when the plan trains nothing / is unavailable.
  topGroup: string | null;
  // Groups carrying a MEANINGFUL share of the plan (>= a threshold of the top
  // group's sets) — the groups the plan can honestly claim to "focus" on. A
  // 1-exercise afterthought group is NOT in here.
  focusGroups: Set<string>;
  // Every group the plan allocates ANY sets to (presence check).
  allocatedGroups: Set<string>;
}

// A group counts as a real "focus" only when it carries at least this fraction
// of the top group's set volume. The founder's bug: chest = 8 sets, biceps = 3
// sets (0.375 of chest) — biceps is NOT a co-focus, it's an afterthought.
const FOCUS_SHARE_THRESHOLD = 0.6;

/**
 * Per-Big-11-group set allocation of TODAY's PROPOSED plan. A multi-group
 * exercise (e.g. Leg Press → quads + glutes) contributes its sets to each of
 * its primary groups (same attribution the recovery/lagging engines use). Pure;
 * returns an empty allocation when there are no exercises.
 */
export function getPlanAllocationByGroup(
  exercises: readonly PlannedExercise[] | null | undefined,
): PlanAllocation {
  const setsByGroup: Record<string, number> = {};
  if (Array.isArray(exercises)) {
    for (const ex of exercises) {
      const sets = typeof ex?.sets === 'number' && ex.sets > 0 ? ex.sets : 0;
      if (sets === 0) continue;
      const groups = groupForExerciseBig11(ex.engineName ?? ex.name);
      for (const g of groups) {
        setsByGroup[g] = (setsByGroup[g] ?? 0) + sets;
      }
    }
  }
  const allocatedGroups = new Set(Object.keys(setsByGroup));
  let topGroup: string | null = null;
  let topSets = 0;
  for (const [g, s] of Object.entries(setsByGroup)) {
    if (s > topSets) {
      topSets = s;
      topGroup = g;
    }
  }
  const focusGroups = new Set<string>();
  if (topGroup !== null && topSets > 0) {
    for (const [g, s] of Object.entries(setsByGroup)) {
      if (s >= topSets * FOCUS_SHARE_THRESHOLD) focusGroups.add(g);
    }
  }
  return { setsByGroup, topGroup, focusGroups, allocatedGroups };
}

// Reconciliation context passed to the composer so every clause can be checked
// against the live plan + the model's maturity before it is voiced. All fields
// optional → with no context the composer behaves exactly as before (back-compat
// for callers/tests that only assert the token→sentence mapping).
export interface CoachInsightContext {
  // The plan's real per-group allocation (getPlanAllocationByGroup). Used to drop
  // a "lighter on X" claim when the plan in fact allocates X heavily.
  allocation?: PlanAllocation;
  // True while the calibration model is still immature (the "still learning you"
  // line is showing). Confident TREND claims (weakness-amp "it's been lagging
  // behind") are mutually exclusive with "still learning" → suppressed here.
  calibrationImmature?: boolean;
}

/**
 * Localized Big-11 group label (RO/EN) from a group token. Resolves the i18n
 * bucket (coachEngine.muscleGroups.${group}); falls back to the raw token when
 * the bundle lacks the key (defensive — engine emits Big-11 RO keys). Lowercased
 * so it reads naturally MID-sentence ("...your hamstrings...").
 */
function groupLabel(group: string | undefined): string {
  if (!group) return '';
  const key = `coachEngine.muscleGroups.${group}`;
  const localized = t(key);
  const label = localized && localized !== key ? localized : group;
  return label.toLowerCase();
}

/**
 * One CLAUSE fragment for a single adaptation (e.g. "lighter on your quads — they
 * are still recovering"). The deload clause needs no group. recovery-cut splits
 * on cause (a recent aerobic class vs a heavy session). weakness-amp /
 * imbalance-fix interpolate the localized group label. Pure.
 */
function clauseFor(adapt: CoachAdaptation): string {
  const group = groupLabel(adapt.group);
  switch (adapt.kind) {
    case 'deload':
      return t('coachInsight.clause.deload');
    case 'recovery-cut':
      return adapt.cause === 'aerobic'
        ? t('coachInsight.clause.recoveryCutAerobic', { group })
        : t('coachInsight.clause.recoveryCut', { group });
    case 'weakness-amp':
      return t('coachInsight.clause.weaknessAmp', { group });
    case 'imbalance-fix':
      return t('coachInsight.clause.imbalanceFix', { group });
    default:
      return '';
  }
}

/**
 * Truth gate — drop an adaptation whose clause the live state does NOT support,
 * so the coach never claims what the plan does not do. Returns true to KEEP.
 *
 *  - recovery-cut ("lighter on your {group}"): kept only when the plan does NOT
 *    treat that group as a focus. If the plan allocates {group} heavily (it is a
 *    focusGroup), the cut never reached the bar → no "lighter on back" while back
 *    is at standard/heavy load. (No group, e.g. on a malformed entry → kept; the
 *    deload clause carries no group and is unaffected.)
 *  - weakness-amp ("pushing your {group} harder — it's been lagging behind"): a
 *    confident multi-session TREND claim. Suppressed entirely while the model is
 *    still immature (mutually exclusive with the "still learning" line), and
 *    suppressed when the plan does not actually allocate that group (can't claim
 *    to push a group the plan barely touches).
 *  - deload / imbalance-fix: unaffected by allocation reconciliation.
 */
function clauseSupportedBy(adapt: CoachAdaptation, ctx: CoachInsightContext): boolean {
  const alloc = ctx.allocation;
  if (adapt.kind === 'recovery-cut') {
    if (alloc && adapt.group && alloc.focusGroups.has(adapt.group)) return false;
    return true;
  }
  if (adapt.kind === 'weakness-amp') {
    if (ctx.calibrationImmature) return false;
    if (alloc && adapt.group && !alloc.allocatedGroups.has(adapt.group)) return false;
    return true;
  }
  return true;
}

/**
 * Pick the salient adaptations to voice: the single most-salient per KIND
 * (de-dupe multiple cuts/amps into one clause so the line stays short), ordered
 * by salience, capped to the top TWO. Pure + deterministic (stable sort on the
 * salience rank; ties keep input order). Truth-gated by `ctx`: an adaptation the
 * live plan/maturity does not support is dropped BEFORE selection (so it never
 * consumes a slot).
 */
function selectSalient(
  adaptations: readonly CoachAdaptation[],
  ctx: CoachInsightContext,
): CoachAdaptation[] {
  const firstPerKind = new Map<CoachAdaptationKind, CoachAdaptation>();
  for (const a of adaptations) {
    if (!a || !(a.kind in SALIENCE)) continue;
    if (!clauseSupportedBy(a, ctx)) continue;
    if (!firstPerKind.has(a.kind)) firstPerKind.set(a.kind, a);
  }
  return [...firstPerKind.values()]
    .sort((a, b) => SALIENCE[a.kind] - SALIENCE[b.kind])
    .slice(0, 2);
}

/**
 * Compose ONE plain-language coach line from today's adaptations log. Returns
 * null when nothing adapted (empty / no recognized kinds) so the card renders
 * no line. Single signal → its clause as a full sentence; two signals → one
 * combined sentence (primary + secondary clause) via the combine template.
 *
 * @param adaptations engine CoachAdaptation[] (tokens, not copy)
 * @param ctx optional reconciliation context (plan allocation + calibration
 *   maturity) — every clause is truth-gated against it before being voiced. With
 *   no context the composer maps tokens→sentence exactly as before.
 * @returns localized sentence, or null when nothing to say
 */
export function composeCoachInsight(
  adaptations: readonly CoachAdaptation[] | null | undefined,
  ctx: CoachInsightContext = {},
): string | null {
  if (!Array.isArray(adaptations) || adaptations.length === 0) return null;
  const salient = selectSalient(adaptations, ctx);
  if (salient.length === 0) return null;

  const primary = clauseFor(salient[0]!);
  if (!primary) return null;
  if (salient.length === 1) return primary;
  const secondary = clauseFor(salient[1]!);
  if (!secondary) return primary;
  return t('coachInsight.combine', { primary, secondary });
}
