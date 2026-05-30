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

/** MET per class type. Conservative mid-band Compendium values. */
export const AEROBIC_MET: Record<AerobicClassType, number> = {
  aerobic: 6.5,
  step: 7.5,
  zumba: 6.5,
  spinning: 8.5,
  alta: 6.0,
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
}

interface AerobicActions {
  /**
   * Log a class. Computes kcal from the type MET + weight + minutes, persists
   * the session, and REMEMBERS the duration (pre-fills next time). Rejects an
   * out-of-bounds duration silently (defensive — UI clamps too). weightKg null
   * → kcal stored 0 (still counts as a class; nutrition ease just adds nothing).
   */
  logClass: (input: { date: string; type: AerobicClassType; minutes: number; weightKg: number | null }) => void;
  /** Persist the last-used duration without logging (live edit memory). */
  setLastDuration: (minutes: number) => void;
  reset: () => void;
}

const DEFAULTS: AerobicState = {
  sessions: [],
  lastDuration: DEFAULT_AEROBIC_MINUTES,
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
        const kcal = computeAerobicKcal(type, weightKg, minutes) ?? 0;
        const session: AerobicSession = { date, type, minutes, kcal, ts: Date.now() };
        set((s) => ({
          sessions: [...s.sessions, session],
          // Remember the duration the user just used (editable memory).
          lastDuration: minutes,
        }));
      },
      setLastDuration: (minutes) => {
        if (!Number.isFinite(minutes) || minutes < AEROBIC_MINUTES_MIN || minutes > AEROBIC_MINUTES_MAX) {
          return;
        }
        set({ lastDuration: minutes });
      },
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'wv2-aerobic-store',
      storage: createJSONStorage(() => localStorage),
      version: 0,
      // Blueprint consistency — partialize only data fields (NOT actions).
      partialize: (state) => ({
        sessions: state.sessions,
        lastDuration: state.lastDuration,
      }) as Partial<AerobicState & AerobicActions>,
    },
  ),
);
