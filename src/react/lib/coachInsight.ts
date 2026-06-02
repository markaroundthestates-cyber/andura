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
import type { CoachAdaptation, CoachAdaptationKind } from './engineWrappers.types';

// Salience rank — lower = more salient (shown first / wins as the primary clause).
const SALIENCE: Record<CoachAdaptationKind, number> = {
  deload: 0,
  'recovery-cut': 1,
  'weakness-amp': 2,
  'imbalance-fix': 3,
};

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
 * Pick the salient adaptations to voice: the single most-salient per KIND
 * (de-dupe multiple cuts/amps into one clause so the line stays short), ordered
 * by salience, capped to the top TWO. Pure + deterministic (stable sort on the
 * salience rank; ties keep input order).
 */
function selectSalient(adaptations: readonly CoachAdaptation[]): CoachAdaptation[] {
  const firstPerKind = new Map<CoachAdaptationKind, CoachAdaptation>();
  for (const a of adaptations) {
    if (!a || !(a.kind in SALIENCE)) continue;
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
 * @returns localized sentence, or null when nothing to say
 */
export function composeCoachInsight(
  adaptations: readonly CoachAdaptation[] | null | undefined,
): string | null {
  if (!Array.isArray(adaptations) || adaptations.length === 0) return null;
  const salient = selectSalient(adaptations);
  if (salient.length === 0) return null;

  const primary = clauseFor(salient[0]!);
  if (!primary) return null;
  if (salient.length === 1) return primary;
  const secondary = clauseFor(salient[1]!);
  if (!secondary) return primary;
  return t('coachInsight.combine', { primary, secondary });
}
