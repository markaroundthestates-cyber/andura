// ══ PROGRES STORE — Weight Log + Body Data Entries ═══════════════════════
// Phase 4 task_16 — persist weight + measurements locally cu zustand
// persist middleware (localStorage). Phase 5+ replaces cu cloud sync sau
// Firestore wire conform Pre-Beta backend strategy.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WeightEntry {
  kg: number;
  date: string; // YYYY-MM-DD format (date-only, NU full timestamp)
  ts: number; // Date.now() la save (for ordering + edit detection)
}

export interface BodyDataEntry {
  date: string;
  ts: number;
  // Optional measurement fields (cm) — partial entries supported.
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  bicepsCm?: number;
  thighCm?: number;
}

export interface ProgresState {
  weightLog: WeightEntry[];
  bodyData: BodyDataEntry[];
}

export interface ProgresActions {
  addWeightEntry: (entry: Omit<WeightEntry, 'ts'>) => void;
  addBodyDataEntry: (entry: Omit<BodyDataEntry, 'ts'>) => void;
  reset: () => void;
}

export const useProgresStore = create<ProgresState & ProgresActions>()(
  persist(
    (set) => ({
      weightLog: [],
      bodyData: [],
      addWeightEntry: (entry) =>
        set((s) => ({
          weightLog: [...s.weightLog, { ...entry, ts: Date.now() }],
        })),
      addBodyDataEntry: (entry) =>
        set((s) => ({
          bodyData: [...s.bodyData, { ...entry, ts: Date.now() }],
        })),
      reset: () => set({ weightLog: [], bodyData: [] }),
    }),
    {
      name: 'wv2-progres-store',
      storage: createJSONStorage(() => localStorage),
      // SUB-CHAT5-004 blueprint consistency — explicit partialize doar data
      // fields (NU actions). Match appStore + scheduleStore + workoutStore
      // existing pattern. weightLog + bodyData persisted; actions excluded
      // from serialization pentru defense-in-depth.
      partialize: (state) => ({
        weightLog: state.weightLog,
        bodyData: state.bodyData,
      }) as Partial<ProgresState & ProgresActions>,
    }
  )
);
