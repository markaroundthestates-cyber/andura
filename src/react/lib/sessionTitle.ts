// ══ SESSION DISPLAY TITLE — "Workout - <group>" for a generic saved title ════
// Founder 2026-10-23 ("vreau in history sa apara Workout - denumirea grupei... nu
// doar Workout"): the plan's title is the engine sentinel most days, so PostRpe
// saves the generic fallback — 66 of his 67 sessions read just "Workout". A
// generic title gains the group the session ACTUALLY trained, derived from its
// logged exercises at display time: truthful for "Alta grupa" overrides, rogue
// days and admin-logged sessions alike, and it covers the whole existing history
// with no migration. A real title (e.g. "Brate (Rogue)") passes through untouched.

import { groupForExerciseBig11 } from '../../engine/muscleRecovery.js';
import { t, _getBundle } from '../../i18n/index.js';

// Structural — the history list's narrow row type and the full summary both fit.
interface TitledSession {
  title?: string;
  exercises?: ReadonlyArray<{ engineName?: string; exerciseName?: string; sets?: ReadonlyArray<unknown> }>;
}

export type SessionGroupType = 'PUSH' | 'PULL' | 'LEGS' | 'UPPER' | 'FULL';

const CATEGORY: Readonly<Record<string, 'push' | 'pull' | 'legs'>> = {
  piept: 'push', umeri: 'push', triceps: 'push',
  spate: 'pull', biceps: 'pull',
  'picioare-quads': 'legs', 'picioare-hamstrings': 'legs', fese: 'legs', gambe: 'legs',
};

// Every generic title a session was ever saved under, in either locale (both
// bundles are bundled statically, so this reads them — no copy hardcoded here).
const GENERIC_TITLE_KEYS = ['postRpe.fallbackTitle', 'workout.sessionTitle.fallback', 'coachToday.fallbackTitle', 'postSummary.fallbackTitle'];
let genericTitles: Set<string> | null = null;
function isGenericTitle(title: string): boolean {
  if (genericTitles === null) {
    genericTitles = new Set();
    for (const locale of ['en', 'ro'] as const) {
      const bundle = _getBundle(locale) as Record<string, unknown> | null;
      for (const key of GENERIC_TITLE_KEYS) {
        const v = key.split('.').reduce<unknown>((o, p) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[p] : undefined), bundle);
        if (typeof v === 'string') genericTitles.add(v);
      }
    }
  }
  return genericTitles.has(title);
}

/** The session's group from its logged sets (each exercise split across the categories it trains). */
export function sessionGroupType(session: TitledSession): SessionGroupType | null {
  const sets = { push: 0, pull: 0, legs: 0 };
  for (const e of session.exercises ?? []) {
    const n = e.sets?.length ?? 0;
    if (n === 0) continue;
    const cats = [...new Set(groupForExerciseBig11(e.engineName ?? e.exerciseName ?? '').map((g: string) => CATEGORY[g]).filter(Boolean))];
    for (const c of cats) sets[c as keyof typeof sets] += n / cats.length;
  }
  const total = sets.push + sets.pull + sets.legs;
  if (total === 0) return null;
  const legsShare = sets.legs / total;
  if (legsShare >= 0.6) return 'LEGS';
  if (legsShare >= 0.25) return 'FULL';
  if (sets.push >= 2 * sets.pull) return 'PUSH';
  if (sets.pull >= 2 * sets.push) return 'PULL';
  return 'UPPER';
}

export function sessionDisplayTitle(session: TitledSession): string {
  const title = typeof session.title === 'string' ? session.title.trim() : '';
  if (title !== '' && !isGenericTitle(title)) return title;
  const type = sessionGroupType(session);
  const base = title !== '' ? title : t('postRpe.fallbackTitle');
  return type ? `${base} - ${t(`workout.sessionTitle.${type}`)}` : base;
}
