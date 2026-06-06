// ══ AEROBIC STORE — Aerobic-class training mode (Daniel spec 2026-05-30) ═══
//
// Many women train ONLY aerobic classes (aerobics/step/zumba/spinning), no gym
// weights. The app supports that via onboardingStore.trainingType ('gym' |
// 'aerobic' | 'both'). This store owns the logged aerobic CLASSES: each session
// {date, type, minutes, kcal}, plus the last-used duration (editable WITH
// MEMORY — pre-filled next time) and the weekly class count.
//
// kcal model — the standard MET equation (Compendium of Physical Activities):
//   kcal = MET × weightKg × (minutes / 60)
// Each class TYPE carries a baked-in MET (conservative mid-band values). This is
// an ESTIMATE (population MET, not per-user calorimetry) — same honesty posture
// as userTdee PER_SESSION_NET_KCAL.
//
// The logged aerobic kcal feeds the nutrition energy balance (TDEEStrip): on a
// class day the displayed daily target eases by today's logged aerobic kcal so
// the user can eat a bit more. It does NOT touch the Bayesian weight-trend TDEE
// estimate (no double-count) — it is an explicit, labeled activity add-on.
//
// Pure helpers (MET table, computeAerobicKcal, classesThisWeek, today total)
// are exported standalone for the UI + unit tests; the store is the persisted
// I/O boundary.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Class TYPES with baked-in MET (Compendium of Physical Activities mid-band,
// conservative). 'alta' = a generic "other class" fallback.
export type AerobicClassType = 'aerobic' | 'step' | 'zumba' | 'spinning' | 'alta';

/**
 * MET per class type. Real-world calibrated CONSERVATIVE values (down from the
 * old Compendium mid-band 6.5/7.5/6.5/8.5/6.0). Anchor: a hard 1h incline
 * treadmill walk at 108kg burns ~600 kcal, so a casual general aerobic CLASS
 * must land LOWER per-kg than that. We err low — an honest under-estimate beats
 * an inflated kcal the user eats back.
 */
export const AEROBIC_MET: Record<AerobicClassType, number> = {
  aerobic: 5.0,
  step: 6.0,
  zumba: 5.5,
  spinning: 7.0,
  alta: 4.5,
};

/** Ordered list of class types for the UI picker (stable order). */
export const AEROBIC_CLASS_TYPES: readonly AerobicClassType[] = [
  'aerobic',
  'step',
  'zumba',
  'spinning',
  'alta',
];

/** Default class duration (min) — pre-filled the very first time. */
export const DEFAULT_AEROBIC_MINUTES = 50;

// Duration bounds (defensive). A class under 5 min or over 4h is a data-entry
// error — engine math (kcal) must never receive garbage.
export const AEROBIC_MINUTES_MIN = 5;
export const AEROBIC_MINUTES_MAX = 240;

// BACKWARD / retroactive logging (Daniel decision #45) — a user can log a class
// for a PAST day ("I forgot to log yesterday's cardio, today I log it dated
// yesterday"). The window is bounded: far enough back to cover a missed week or
// two, never the future (you cannot log a class that has not happened).
export const AEROBIC_BACKLOG_DAYS = 30;

/** Local ISO date YYYY-MM-DD for a Date (mirror progresStore/LogWeight). */
export function aerobicTodayIso(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Earliest loggable date (today − AEROBIC_BACKLOG_DAYS) as local ISO. Pure —
 * powers the date picker's `min`. Mirrors aerobicTodayIso's local-midnight math.
 */
export function aerobicMinDateIso(now: Date = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - AEROBIC_BACKLOG_DAYS);
  return aerobicTodayIso(d);
}

/**
 * Clamp a chosen ISO date for the date PICKER (UI). Pure. The future is BLOCKED
 * (a class cannot be logged ahead) → anything past today clamps to today; a date
 * older than the backlog window clamps to the floor. Garbage / unparseable input
 * falls back to today. Used by the picker's onChange; the store's logClass only
 * hard-blocks the future (a past literal stays as-is — see logClass).
 */
export function clampAerobicDateIso(dateISO: string, now: Date = new Date()): string {
  const today = aerobicTodayIso(now);
  const floor = aerobicMinDateIso(now);
  if (typeof dateISO !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return today;
  if (dateISO > today) return today; // future blocked
  if (dateISO < floor) return floor; // older than the backlog window
  return dateISO;
}

export interface AerobicSession {
  /** Local ISO date YYYY-MM-DD (mirror progresStore/LogWeight todayIso). */
  date: string;
  type: AerobicClassType;
  minutes: number;
  kcal: number;
  /** Date.now() at log — for stable ordering / dedupe headroom. */
  ts: number;
}

/**
 * Simplified SUBJECTIVE readiness (Daniel spec 2026-05-30) — pure self-report
 * for the aerobic Coach: "Cum te simti azi?" → rested / normal / tired. NO
 * engine computation (no sets-based orb). Persisted per local-ISO date so it
 * resets each day. 'tired' may lightly inform nutrition (reuse fatigue-deficit-
 * ease spirit) but stays minimal.
 */
export type SubjectiveReadiness = 'rested' | 'normal' | 'tired';

/**
 * kcal for one aerobic class — standard MET equation:
 *   kcal = MET × weightKg × (minutes / 60)
 * Pure. Returns null when inputs are missing/invalid (caller hides the number
 * rather than show a fabricated 0). MET resolved from the baked-in table.
 */
export function computeAerobicKcal(
  type: AerobicClassType,
  weightKg: number | null,
  minutes: number,
): number | null {
  if (weightKg === null || !Number.isFinite(weightKg) || weightKg <= 0) return null;
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  const met = AEROBIC_MET[type];
  if (met === undefined) return null;
  return Math.round(met * weightKg * (minutes / 60));
}

/**
 * Every class logged on a given local-ISO date, newest-first (stable by ts).
 * Pure. Powers the "today's classes" list with per-entry delete + the
 * double-log-per-day confirm (a non-empty result for today means one is logged).
 */
export function aerobicSessionsForDate(
  sessions: ReadonlyArray<AerobicSession>,
  dateISO: string,
): AerobicSession[] {
  if (!Array.isArray(sessions) || sessions.length === 0) return [];
  return sessions
    .filter((s) => s != null && s.date === dateISO)
    .sort((a, b) => (b?.ts ?? 0) - (a?.ts ?? 0));
}

/** ISO week-start (Monday) YYYY-MM-DD for a date. Mirror userTdee.weekStartIso. */
function weekStartIso(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const jsDow = date.getDay(); // duminica=0 ... sambata=6
  const mondayIdx = jsDow === 0 ? 6 : jsDow - 1;
  const monday = new Date(date);
  monday.setDate(monday.getDate() - mondayIdx);
  return monday.toLocaleDateString('sv'); // YYYY-MM-DD local tz
}

/**
 * Count classes logged in the CURRENT ISO week (Mon-Sun). Pure — sessions +
 * now passed in (NO Date.now intern / NO store read). Compares each session's
 * `date` week-start to the current week-start.
 */
export function countClassesThisWeek(
  sessions: ReadonlyArray<AerobicSession>,
  now: Date = new Date(),
): number {
  if (!Array.isArray(sessions) || sessions.length === 0) return 0;
  const currentWeek = weekStartIso(now);
  if (!currentWeek) return 0;
  let count = 0;
  for (const s of sessions) {
    if (s == null || typeof s.date !== 'string') continue;
    // s.date is YYYY-MM-DD local — parse as local midnight for week-start match.
    const d = new Date(`${s.date}T00:00:00`);
    if (isNaN(d.getTime())) continue;
    if (weekStartIso(d) === currentWeek) count += 1;
  }
  return count;
}

/**
 * Total aerobic kcal logged for a given local-ISO date (sum of every class that
 * day). Pure. This is the number that eases the nutrition target on a class day.
 */
export function aerobicKcalForDate(
  sessions: ReadonlyArray<AerobicSession>,
  dateISO: string,
): number {
  if (!Array.isArray(sessions) || sessions.length === 0) return 0;
  let total = 0;
  for (const s of sessions) {
    if (s != null && s.date === dateISO && Number.isFinite(s.kcal)) total += s.kcal;
  }
  return total;
}

interface AerobicState {
  sessions: AerobicSession[];
  /** Last-used class duration (min) — pre-fills the logger next time. */
  lastDuration: number;
  /**
   * Simplified subjective readiness keyed by local-ISO date (self-report only).
   * A map so it naturally resets per day — today's read returns undefined until
   * the user taps a chip.
   */
  subjectiveByDate: Record<string, SubjectiveReadiness>;
  /**
   * Tombstones — the `ts` of every session the user explicitly DELETED. A logged
   * class can be mislogged (Daniel's wife: 2 aerobic classes by accident, no way
   * to remove). Plain local removal was not enough: the cloud sync merges by
   * UNION (mergeArrayUnion never drops a remote entry), so a deleted class would
   * RESURRECT on the next hydrate. The tombstone is the positive record of the
   * deletion — it is synced too and re-applied on merge so the class stays gone
   * on every device (ANDURA never-delete-without-record: we don't silently drop,
   * we keep proof of the user's intent).
   */
  deletedTs: number[];
}

interface AerobicActions {
  /**
   * Log a class. Computes kcal from the type MET + weight + minutes, persists
   * the session, and REMEMBERS the duration (pre-fills next time). Rejects an
   * out-of-bounds duration silently (defensive — UI clamps too). weightKg null
   * → kcal stored 0 (still counts as a class; nutrition ease just adds nothing).
   */
  logClass: (input: { date: string; type: AerobicClassType; minutes: number; weightKg: number | null }) => void;
  /**
   * Delete a logged class by its `ts`. Removes it from `sessions` AND records a
   * tombstone (`deletedTs`) so the cloud sync cannot resurrect it on the next
   * hydrate (the union merge re-applies tombstones — see storeSync aerobic.apply).
   * Idempotent: deleting an absent/already-deleted ts is a safe no-op. Derived
   * counters (weekly count, today's nutrition kcal) recompute from `sessions`, so
   * dropping the entry decrements them automatically — nothing else to clear.
   */
  removeSession: (ts: number) => void;
  /** Persist the last-used duration without logging (live edit memory). */
  setLastDuration: (minutes: number) => void;
  /** Record the self-reported readiness for a date (pure self-report). */
  setSubjectiveReadiness: (date: string, value: SubjectiveReadiness) => void;
  reset: () => void;
}

const DEFAULTS: AerobicState = {
  sessions: [],
  lastDuration: DEFAULT_AEROBIC_MINUTES,
  subjectiveByDate: {},
  deletedTs: [],
};

export const useAerobicStore = create<AerobicState & AerobicActions>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      logClass: ({ date, type, minutes, weightKg }) => {
        if (!Number.isFinite(minutes) || minutes < AEROBIC_MINUTES_MIN || minutes > AEROBIC_MINUTES_MAX) {
          return;
        }
        if (AEROBIC_MET[type] === undefined) return;
        // Backward logging is allowed (Daniel decision #45). The store only HARD-
        // BLOCKS the FUTURE — a class that has not happened can never be logged —
        // by snapping a future date to today. Past dates pass through as-is; the
        // UI date picker bounds the backlog window (min/max) so the user can't
        // reach past it, but a backdated literal is legitimate data.
        const today = aerobicTodayIso();
        const safeDate = typeof date === 'string' && date > today ? today : date;
        const kcal = computeAerobicKcal(type, weightKg, minutes) ?? 0;
        const session: AerobicSession = { date: safeDate, type, minutes, kcal, ts: Date.now() };
        set((s) => ({
          sessions: [...s.sessions, session],
          // Remember the duration the user just used (editable memory).
          lastDuration: minutes,
        }));
      },
      removeSession: (ts) => {
        if (!Number.isFinite(ts)) return;
        set((s) => {
          if (!s.sessions.some((sess) => sess.ts === ts)) return {};
          return {
            sessions: s.sessions.filter((sess) => sess.ts !== ts),
            // Record the deletion so a cloud hydrate can't resurrect it (union
            // merge re-applies tombstones). Dedupe defensively.
            deletedTs: s.deletedTs.includes(ts) ? s.deletedTs : [...s.deletedTs, ts],
          };
        });
      },
      setLastDuration: (minutes) => {
        if (!Number.isFinite(minutes) || minutes < AEROBIC_MINUTES_MIN || minutes > AEROBIC_MINUTES_MAX) {
          return;
        }
        set({ lastDuration: minutes });
      },
      setSubjectiveReadiness: (date, value) => {
        if (value !== 'rested' && value !== 'normal' && value !== 'tired') return;
        set((s) => ({ subjectiveByDate: { ...s.subjectiveByDate, [date]: value } }));
      },
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'wv2-aerobic-store',
      storage: createJSONStorage(() => localStorage),
      // v2 (delete a logged class 2026-06-01): adds `deletedTs` tombstones so a
      // mislogged class can be removed AND stay removed across cloud sync.
      version: 2,
      // Blueprint consistency — partialize only data fields (NOT actions).
      partialize: (state) => ({
        sessions: state.sessions,
        lastDuration: state.lastDuration,
        subjectiveByDate: state.subjectiveByDate,
        deletedTs: state.deletedTs,
      }) as Partial<AerobicState & AerobicActions>,
      // Migration hook (mirror the wv2 store pattern). v0/v1 → v2 is a safe
      // backfill: keep every persisted data field, default `deletedTs` to [] for
      // pre-v2 snapshots (zero local wipe).
      migrate: (persistedState: unknown, _version: number): AerobicState => {
        const s = (persistedState ?? {}) as Partial<AerobicState>;
        return {
          sessions: Array.isArray(s.sessions) ? s.sessions : DEFAULTS.sessions,
          lastDuration: typeof s.lastDuration === 'number' ? s.lastDuration : DEFAULTS.lastDuration,
          subjectiveByDate:
            s.subjectiveByDate && typeof s.subjectiveByDate === 'object'
              ? s.subjectiveByDate
              : DEFAULTS.subjectiveByDate,
          deletedTs: Array.isArray(s.deletedTs) ? s.deletedTs : DEFAULTS.deletedTs,
        };
      },
    },
  ),
);
