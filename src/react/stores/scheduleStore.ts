// ══ SCHEDULE STORE — Weekly Calendar V1 (Phase 4 task_19) ════════════════
// Weekly training/rest day schedule. State auto-resets next Monday (ephemeral
// per Calendar V1 spec memory). Silent save dispatches Engine #2 wire
// (Phase 4 stub — Phase 5+ wires real Adherence/Schedule engine).
//
// Persisted via zustand persist middleware pentru cross-session memory în
// current week.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type DayKind = 'training' | 'rest';

// L Ma Mi J V S D
export type WeekDays = readonly [
  DayKind, DayKind, DayKind, DayKind, DayKind, DayKind, DayKind,
];

/** Returns Monday-anchored ISO date (YYYY-MM-DD) for given Date. */
export function weekStartIso(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift la Monday
  date.setDate(date.getDate() + diff);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// Phase 4 default schedule: 4 training + 3 rest (L=training, Ma=rest, Mi=training,
// J=rest, V=training, S=training, D=rest) — common pattern (3-4 sessions/week).
// `satisfies WeekDays` validates 7-tuple shape while preserving literal types
// (TS 4.9+ idiom — supersedes redundant `: WeekDays` + `as const` pairing).
const DEFAULT_WEEK = [
  'training', 'rest', 'training', 'rest', 'training', 'training', 'rest',
] as const satisfies WeekDays;

export interface ScheduleState {
  weekStartISO: string;
  days: WeekDays;
  editMode: boolean;
}

export interface ScheduleActions {
  setEditMode: (mode: boolean) => void;
  toggleDay: (idx: number) => void;
  saveWeekly: () => void; // Phase 4 stub silent dispatch
  resetWeekly: (newWeekStartISO?: string) => void;
}

export const useScheduleStore = create<ScheduleState & ScheduleActions>()(
  persist(
    (set, get) => ({
      weekStartISO: weekStartIso(),
      days: DEFAULT_WEEK,
      editMode: false,
      setEditMode: (mode) => set({ editMode: mode }),
      toggleDay: (idx) =>
        set((s) => {
          if (idx < 0 || idx > 6) return s;
          if (!s.editMode) return s; // locked default
          const next = [...s.days] as DayKind[];
          next[idx] = next[idx] === 'training' ? 'rest' : 'training';
          return { days: next as unknown as WeekDays };
        }),
      saveWeekly: () => {
        // Phase 5 task_08: dispatch Engine #2 Goal Adaptation via real
        // scheduleAdapter.commitCalendarEdit pentru localStorage persist
        // (Tier 1 storage) — engine pick up override on next pipeline run.
        // ZERO src/engine/* mutation per orchestrator §7; uses existing
        // scheduleAdapter.commitCalendarEdit export.
        //
        // §B024 audit fix (REVIEW-A036-A038 M-§A036-04) — replace triple
        // silent fail with Sentry breadcrumb capture pe fiecare nivel. UX
        // sticks with optimistic editMode:false (NU regress to error UI
        // Phase 4 stub paradigm) DAR forensic visibility surfaces in prod.
        //
        // SUBSTRATE-ZETA fix chat 5 (2026-05-23): shape bridge la boundary
        // resolves Phase 6 task_02 semantic mismatch. scheduleStore native
        // shape = DayKind[] strings ('training'|'rest'), scheduleAdapter
        // expects {day, active}[] objects per scheduleAdapter.d.ts §11-13.
        // Pre-fix passing DayKind[] caused `dayConfig.active` evaluation
        // pe string 'training' = undefined, never === false → rest day
        // calendar overrides silently no-op via React UI path (Calendar7Day
        // toggle → saveWeekly → engine misread). Transform shape here NU
        // bend adapter inward (Bugatti audit recommendation).
        const state = get();
        const captureSafely = (err: unknown, op: string): void => {
          try {
            void import('../../util/sentry.js').then((mod) => {
              const fn = (mod as { captureException?: (e: unknown, ctx?: unknown) => void }).captureException;
              if (typeof fn === 'function') {
                fn(err instanceof Error ? err : new Error(String(err)), {
                  tags: { component: 'scheduleStore', op },
                  extra: { dayCount: state.days.length },
                });
              }
            }).catch(() => { /* sentry import fail = swallow (defense-in-depth limit) */ });
          } catch { /* sync swallow */ }
        };
        // Day key canon match scheduleAdapter.js:37 DAY_LABELS + .d.ts:11
        // CalendarOverrideDay['day'] union — NU UI display labels (L/Ma/Mi/J)
        // diverge intentional: storage canon stable cross-store/engine.
        const DAY_KEYS = ['L', 'M', 'M2', 'J', 'V', 'S', 'D'] as const;
        const dayConfigs = state.days.map((kind, idx) => ({
          day: DAY_KEYS[idx] ?? 'L', // idx bounded 0..6 (WeekDays tuple len 7), fallback defensive only
          active: kind === 'training',
        }));
        try {
          // Dynamic import sync via require pattern to avoid circular
          // dep risk + keep adapter module-level lazy.
          import('../../engine/schedule/scheduleAdapter.js').then((mod) => {
            const commitFn = (mod as unknown as {
              commitCalendarEdit?: (
                days: ReadonlyArray<{ day: string; active: boolean }>,
              ) => unknown;
            }).commitCalendarEdit;
            if (typeof commitFn === 'function') {
              try {
                commitFn(dayConfigs);
              } catch (err) {
                captureSafely(err, 'commitCalendarEdit_throw');
              }
            } else {
              captureSafely(new Error('commitCalendarEdit missing on scheduleAdapter module'), 'commit_fn_missing');
            }
          }).catch((err) => { captureSafely(err, 'dynamic_import_fail'); });
        } catch (err) {
          captureSafely(err, 'sync_wrapper_throw');
        }
        set({ editMode: false });
      },
      resetWeekly: (newWeekStartISO) =>
        set({
          weekStartISO: newWeekStartISO ?? weekStartIso(),
          days: DEFAULT_WEEK,
          editMode: false,
        }),
    }),
    {
      name: 'wv2-schedule-store',
      storage: createJSONStorage(() => localStorage),
      // editMode is session-scope only — never persist so user returns out of
      // edit mode after navigating away mid-edit (avoid stale-edit-state ghost
      // on next visit). Days + weekStart still persist for offline coach use.
      partialize: (state) => ({
        weekStartISO: state.weekStartISO,
        days: state.days,
      }),
    }
  )
);
