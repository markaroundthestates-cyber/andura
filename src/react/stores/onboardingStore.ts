// ══ ONBOARDING STORE — Big 6 Hard Typing Phase 5 task_14 ═════════════════
//
// §B003/D-1b audit fix (D046 §3.1 + mockup andura-clasic.html L863-869) —
// Goal type extended 4→6 mockup parity: auto + forta + masa + slabire +
// mentenanta + longevitate. Legacy values 'definire' + 'sanatate' migrated
// pe load via persist `migrate` function (slabire ← definire, longevitate
// ← sanatate). 'masa' + 'forta' stable cross-version.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Sex = 'm' | 'f';
export type Goal = 'auto' | 'forta' | 'masa' | 'slabire' | 'mentenanta' | 'longevitate';
/** Legacy goal values pre-D-1b (zustand persist migrate handles). */
export type LegacyGoal = 'definire' | 'sanatate';
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

/**
 * §B003/D-1b — migrate legacy Goal values to new 6-value mockup parity.
 * 'definire' → 'slabire' (cut goal renamed)
 * 'sanatate' → 'longevitate' (consolidated cu Sanatate generala umbrella)
 * 'masa' + 'forta' stable.
 */
function migrateLegacyGoal(legacyValue: unknown): Goal | null {
  if (legacyValue === 'definire') return 'slabire';
  if (legacyValue === 'sanatate') return 'longevitate';
  if (
    legacyValue === 'auto' || legacyValue === 'forta' || legacyValue === 'masa' ||
    legacyValue === 'slabire' || legacyValue === 'mentenanta' || legacyValue === 'longevitate'
  ) {
    return legacyValue;
  }
  return null;
}

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
      version: 2,
      migrate: (persistedState: unknown, version: number): OnboardingState => {
        // §B003 migration v1 → v2: Goal 4→6 expansion legacy aliases.
        const state = persistedState as Partial<OnboardingState> & { data?: { goal?: unknown } };
        if (version < 2 && state?.data?.goal !== undefined) {
          const migrated = migrateLegacyGoal(state.data.goal);
          return {
            data: {
              ...EMPTY,
              ...(state.data as Partial<OnboardingData>),
              goal: migrated,
            },
            completed: state.completed ?? false,
            completedAt: state.completedAt ?? null,
          };
        }
        return {
          data: { ...EMPTY, ...(state?.data as Partial<OnboardingData> | undefined) },
          completed: state?.completed ?? false,
          completedAt: state?.completedAt ?? null,
        };
      },
    },
  ),
);
