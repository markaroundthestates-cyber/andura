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
const DEFAULT_WEEK: WeekDays = [
  'training', 'rest', 'training', 'rest', 'training', 'training', 'rest',
] as const;

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
        // Phase 4 task_19 §A: silent dispatch Engine #2 stub. Real wire
        // Phase 5+ — Adherence/Schedule engine consume scheduleStore.days.
        // NU show toast (silent per memory spec).
        const _state = get();
        // Side-effect placeholder: engine.dispatchSchedule(_state.days);
        void _state;
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
    }
  )
);
