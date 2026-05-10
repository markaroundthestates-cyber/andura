// ══ MASTERY MILESTONE — Foundation 4B (§29.5 + §29.2.7) ═════════════════
// Track adherence-based progression milestones per exercise. Maria 65
// audience: NOT max-weight measurement — count completed sessions per
// exercise. Discrete badges at 10/30/60/120 thresholds.
//
// Storage (localStorage):
//   masteryCounters = { '<exercise>': { count: N, lastSessionTs: ms } }
//
// Cross-refs:
//   - HANDOVER §29.5 Mastery Milestone
//   - §29.2.7 Longevitate (Maria 65 consistency-based progression)

const STORAGE_KEY = 'masteryCounters';

export const MASTERY_MILESTONES = Object.freeze([
  { count: 10,  name: 'Inceput' },
  { count: 30,  name: 'Constanta' },
  { count: 60,  name: 'Stapanire' },
  { count: 120, name: 'Maestru' },
]);

/**
 * Read counters from storage. Returns `{}` when missing/malformed.
 *
 * @param {Storage} [storage]
 * @returns {Object<string, { count: number, lastSessionTs: number }>}
 */
export function getCounters(storage) {
  const s = _resolve(storage);
  if (!s) return {};
  try {
    const raw = s.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Increment the session counter for `exercise`. Returns the milestone
 * crossed by this increment, or null when no threshold was crossed.
 *
 * @param {string} exercise
 * @param {{ storage?: Storage, now?: number }} [opts]
 * @returns {{ count: number, name: string }|null}
 */
export function incrementCounter(exercise, opts = {}) {
  const s = _resolve(opts.storage);
  if (!s || !exercise) return null;
  const counters = getCounters(s);
  const now = typeof opts.now === 'number' ? opts.now : Date.now();
  const before = counters[exercise]?.count || 0;
  const after = before + 1;
  counters[exercise] = { count: after, lastSessionTs: now };
  try { s.setItem(STORAGE_KEY, JSON.stringify(counters)); } catch {}

  // Did this increment cross a threshold exactly?
  const milestone = MASTERY_MILESTONES.find(m => m.count === after);
  return milestone || null;
}

/**
 * Find the highest milestone reached for `exercise` so far. Null when
 * count < 10.
 *
 * @param {string} exercise
 * @param {Storage} [storage]
 * @returns {{ count: number, name: string }|null}
 */
export function getCurrentMilestone(exercise, storage) {
  const counters = getCounters(storage);
  const count = counters[exercise]?.count || 0;
  let current = null;
  for (const m of MASTERY_MILESTONES) {
    if (count >= m.count) current = m;
  }
  return current;
}

/**
 * Returns the next milestone above the current count (for "X sessions
 * pana la <tier>" style display).
 *
 * @param {string} exercise
 * @param {Storage} [storage]
 * @returns {{ count: number, name: string, sessionsToGo: number }|null}
 */
export function getNextMilestone(exercise, storage) {
  const counters = getCounters(storage);
  const count = counters[exercise]?.count || 0;
  const next = MASTERY_MILESTONES.find(m => m.count > count);
  if (!next) return null;
  return { ...next, sessionsToGo: next.count - count };
}

/**
 * Bugatti-tone celebration message for a milestone crossing.
 *
 * @param {{ count: number, name: string }} milestone
 * @param {string} exercise
 * @returns {string}
 */
export function formatMilestoneMessage(milestone, exercise) {
  if (!milestone || !exercise) return '';
  return `Ai atins ${milestone.name}: ${milestone.count} sesiuni complete la ${exercise}.`;
}

/**
 * Convenience for consumers — record a completed session and return any
 * milestone crossed plus the formatted message.
 *
 * @param {string} exercise
 * @param {{ storage?: Storage, now?: number }} [opts]
 * @returns {{ crossed: boolean, milestone?: object, message?: string }}
 */
export function recordSessionComplete(exercise, opts = {}) {
  const milestone = incrementCounter(exercise, opts);
  if (!milestone) return { crossed: false };
  return {
    crossed: true,
    milestone,
    message: formatMilestoneMessage(milestone, exercise),
  };
}

/**
 * Reset counters (Daniel manual / test helper).
 *
 * @param {Storage} [storage]
 */
export function resetCounters(storage) {
  const s = _resolve(storage);
  if (!s) return;
  try { s.removeItem(STORAGE_KEY); } catch {}
}

function _resolve(override) {
  if (override) return override;
  try { return typeof localStorage !== 'undefined' ? localStorage : null; }
  catch { return null; }
}
