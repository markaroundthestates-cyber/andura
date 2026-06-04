// ══ ENGINE WRAPPERS — Session title + weekday-index helpers ═══════════════
// Hygiene split (barrel re-export, zero behavior change): the pure session-type
// → localized title resolver + the Monday-first weekday-index Date helper,
// extracted verbatim from engineWrappers.ts. Pure (no engine deps beyond i18n,
// NO captureException) so they live outside the instrumented adapter file.
// Re-exported by engineWrappers.ts; public API (resolveSessionTitle /
// dateForWeekdayIndex) unchanged.
import { t as __t } from '../../i18n/index.js';

// ── Whitelisted engine session-type tags (DAY_TO_SESSION_TYPE) ───────────
// Each maps to a workout.sessionTitle.* i18n key; anything else → generic
// fallback. Keeps the title HONEST per-day instead of the old hardcoded "Push".
const SESSION_TYPE_KEYS = new Set([
  'PUSH',
  'PULL',
  // Volume-driven frequency split (2026-06-02) cluster tags:
  'LEGS',
  'LOWER',
  'UPPER',
  'FULL',
  // Legacy absolute-weekday tags (kept for back-compat resolution):
  'UPPER_PICIOARE',
  'UMERI_BRATE',
  'FULL_UPPER',
]);

/**
 * Localized per-day workout title from the engine session-type tag.
 *
 * Bugatti truth fix — the engine never emitted a real per-day workoutTitle
 * (always the fallback sentinel), so every render boundary fell to a HARDCODED
 * "Push (piept si umeri)" copy → a PULL day still showed "Push". Now the engine
 * threads its real sessionType (PUSH/PULL/...); this resolves it to the matching
 * localized title. Unknown/absent sessionType → generic localized fallback (NU
 * a fabricated Push label).
 */
export function resolveSessionTitle(sessionType: string | null | undefined): string {
  if (typeof sessionType === 'string' && SESSION_TYPE_KEYS.has(sessionType)) {
    return __t(`workout.sessionTitle.${sessionType}`);
  }
  return __t('workout.sessionTitle.fallback');
}

/**
 * Build a Date anchored to a given Monday-first weekday index (0=Mon … 6=Sun)
 * within the CURRENT week. `dayIdx === todayIdx` returns `now` unchanged so the
 * preview for today uses the live clock (identical to getTodayWorkout). Other
 * indices shift the date to the matching day of this week — the same week the
 * calendar override is committed for, so a rest/training override resolves
 * correctly (getCalendarOverride matches on weekStartIso). Pure.
 */
export function dateForWeekdayIndex(dayIdx: number, now: Date = new Date()): Date {
  const todayIdx = (now.getDay() + 6) % 7; // JS Sun=0 → Monday-first Mon=0
  const target = new Date(now);
  target.setDate(target.getDate() + (dayIdx - todayIdx));
  return target;
}
