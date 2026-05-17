// ══ ONBOARDING STORE — Big 6 Hard Typing Phase 5 task_14 ═════════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Sex = 'm' | 'f';
export type Goal = 'masa' | 'forta' | 'definire' | 'sanatate';
export type Frequency = '2' | '3' | '4' | '5';
export type Experience = 'incepator' | 'intermediar' | 'avansat';

export interface OnboardingData {
  age: number | null;
  sex: Sex | null;
  goal: Goal | null;
  frequency: Frequency | null;
  experience: Experience | null;
  weight: number | null;
}

interface OnboardingState {
  data: OnboardingData;
  completed: boolean;
  completedAt: number | null;
}

interface OnboardingActions {
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  finalize: () => void;
  reset: () => void;
}

const EMPTY: OnboardingData = {
  age: null,
  sex: null,
  goal: null,
  frequency: null,
  experience: null,
  weight: null,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set) => ({
      data: { ...EMPTY },
      completed: false,
      completedAt: null,
      setField: (key, value) =>
        set((s) => ({ data: { ...s.data, [key]: value } })),
      finalize: () => set({ completed: true, completedAt: Date.now() }),
      reset: () => set({ data: { ...EMPTY }, completed: false, completedAt: null }),
    }),
    {
      name: 'wv2-onboarding-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
