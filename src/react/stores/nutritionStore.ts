// ══ NUTRITION STORE — LOCK 11 Daily Kcal + Protein (task_20) ═════════════
// Mockup wv2 verbatim pattern (andura-clasic.html#L1800-1834 Nutritie · azi):
// Auto target din engine + manual log optional per chip (kcal + protein).
// State persists localStorage cross-session pentru daily entry.
//
// Phase 4 MVP scope (LOCK 11 pre-Beta sensitive):
//   - Single daily kcal value + single daily protein value
//   - manualKcal / manualProtein flags pentru override din engine auto
//   - NU meal-types breakfast/lunch/dinner/snack (mockup absent — spec §B
//     LogMeal screen flagged §6 WORDING BACKLOG Daniel CEO review pre-Beta)
//   - NU food database / macro auto-calc / photo recognition (Phase 5+)
//
// Cross-refs: DECISIONS.md LOCK 11 UI nutrition logging port + §D-LEGACY-017
// Bayesian Nutrition Inference (engine auto target compute).

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { kv } from '../../storage/kv';

export interface NutritionDailyEntry {
  dateISO: string; // YYYY-MM-DD
  kcal: number | null; // null = NU logged manual (auto target din engine)
  protein: number | null; // grams; null = NU logged manual
  ts: number; // last edit timestamp
}

export interface NutritionState {
  dailyLog: NutritionDailyEntry[];
}

export interface NutritionActions {
  setDailyKcal: (dateISO: string, kcal: number) => void;
  setDailyProtein: (dateISO: string, protein: number) => void;
  getDaily: (dateISO: string) => NutritionDailyEntry | undefined;
  reset: () => void;
}

function upsertEntry(
  log: NutritionDailyEntry[],
  dateISO: string,
  patch: Partial<NutritionDailyEntry>
): NutritionDailyEntry[] {
  const idx = log.findIndex((e) => e.dateISO === dateISO);
  const baseTs = Date.now();
  if (idx === -1) {
    return [
      ...log,
      { dateISO, kcal: null, protein: null, ts: baseTs, ...patch },
    ];
  }
  const next = [...log];
  const existing = next[idx];
  if (existing) {
    next[idx] = { ...existing, ...patch, ts: baseTs };
  }
  return next;
}

export const useNutritionStore = create<NutritionState & NutritionActions>()(
  persist(
    (set, get) => ({
      dailyLog: [],
      setDailyKcal: (dateISO, kcal) =>
        set((s) => ({ dailyLog: upsertEntry(s.dailyLog, dateISO, { kcal }) })),
      setDailyProtein: (dateISO, protein) =>
        set((s) => ({ dailyLog: upsertEntry(s.dailyLog, dateISO, { protein }) })),
      getDaily: (dateISO) => get().dailyLog.find((e) => e.dateISO === dateISO),
      reset: () => set({ dailyLog: [] }),
    }),
    {
      name: 'wv2-nutrition-store',
      storage: createJSONStorage(() => kv),
      // SUB-CHAT5-004 blueprint consistency — explicit partialize doar data
      // fields (NU actions). Match appStore + scheduleStore + workoutStore
      // existing pattern. dailyLog single data slice; actions excluded from
      // serialization pentru defense-in-depth.
      partialize: (state) => ({
        dailyLog: state.dailyLog,
      }) as Partial<NutritionState & NutritionActions>,
    }
  )
);
