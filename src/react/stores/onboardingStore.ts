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

/**
 * §30-C1 Big 6 bounds enforcement (CRIT-BETA cluster fix 2026-05-22).
 *
 * HTML min/max attributes on numeric inputs are advisory only — browser DOES
 * NOT block setField with out-of-range values (paste, programmatic input,
 * stepper held). Without store-level guard, engines receive `age=8` or
 * `weight=999` → demographic prior fails → engine NaN downstream.
 *
 * Bounds source (LOCKED V1):
 *  - age 16-99   → D046 §28-H5 GDPR Romania parental consent → raise min to 16
 *                  (overrides audit §30.6 lower 13). Mockup andura-clasic.html
 *                  L563 `min="16" max="99"` consistent.
 *  - weight 30-250 kg → audit §30.6 spec. Mockup L645 shows max=300 but audit
 *                       nuclear authoritative pre-Beta (Bugatti: tighter band
 *                       protects engine math; 250kg already extreme outlier).
 *  - frequency '2'-'5' → type-narrow literal union, no numeric out-of-range
 *                       possible (TS compiler enforces).
 *  - sex/goal/experience → type-narrow literal unions, safe by construction.
 *
 * Source: 📤_outbox/audit-nuclear-2026-05-19/findings-§30.md §30-C1 +
 *         findings-§07.md §7-C4 + findings-§13.md §13-H1 + findings-§28.md
 *         §28-H5 + DECISIONS.md D046 §28-H5 GDPR LOCKED V1.
 */
export const ONBOARDING_BOUNDS = {
  age: { min: 16, max: 99 },
  weight: { min: 30, max: 250 },
} as const;

/**
 * Two-tier validation strategy pentru §30-C1 fix:
 *
 *  - `isSafeOnboardingValue(key, value)` = catastrophic-rejection gate. Catches
 *    NaN / Infinity / non-finite numerics + impossible negatives. ALWAYS
 *    rejected by `setField` silently — engine-killer values that never reach
 *    the store. Permits in-progress typing (e.g., "1" while user builds "16")
 *    so input remains responsive.
 *
 *  - `validateOnboardingField(key, value)` = full range gate. Applied at
 *    Continua button + finalize call sites. Surfaces Gigel-friendly toast cu
 *    range hint la user. Pure function — exported pentru UI + tests.
 *
 * Defense-in-depth: store catches catastrophes silently; UI catches range
 * misses with helpful message; engine downstream NEVER receives invalid.
 */
export function isSafeOnboardingValue<K extends keyof OnboardingData>(
  key: K,
  value: OnboardingData[K],
): boolean {
  if (value === null) return true;
  if (key === 'age' || key === 'weight') {
    const n = value as number;
    // Reject NaN/Infinity/negative/zero — never typed naturally; indicates
    // paste of "abc" → NaN, or programmatic abuse. Engines NaN-propagate.
    if (!Number.isFinite(n) || n <= 0) return false;
  }
  return true;
}

export function validateOnboardingField<K extends keyof OnboardingData>(
  key: K,
  value: OnboardingData[K],
): { ok: true } | { ok: false; reason: string } {
  if (value === null) return { ok: true };

  if (key === 'age') {
    const n = value as number;
    if (!Number.isFinite(n)) return { ok: false, reason: 'Varsta invalida.' };
    const { min, max } = ONBOARDING_BOUNDS.age;
    if (n < min || n > max) {
      return { ok: false, reason: `Varsta intre ${min} si ${max} ani.` };
    }
  }

  if (key === 'weight') {
    const n = value as number;
    if (!Number.isFinite(n)) return { ok: false, reason: 'Greutate invalida.' };
    const { min, max } = ONBOARDING_BOUNDS.weight;
    if (n < min || n > max) {
      return { ok: false, reason: `Greutate intre ${min} si ${max} kg.` };
    }
  }

  return { ok: true };
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
      setField: (key, value) => {
        // §30-C1 store-level catastrophe guard. Rejects NaN/Infinity/neg/0
        // silently (engine-killer values). Range bounds enforced UI-layer
        // (Onboarding.tsx Continua button) + finalize gate — preserves
        // in-progress typing UX while protecting engine downstream.
        if (!isSafeOnboardingValue(key, value)) return;
        set((s) => ({ data: { ...s.data, [key]: value } }));
      },
      finalize: () => {
        // §30-C1 finalize gate — verify all Big 6 fields within bounds before
        // marking onboarding complete. Refuses silently dacă any field out-
        // of-range (UI Continua gate already shown toast); engines downstream
        // see only valid `completed: true` snapshots.
        const { data } = useOnboardingStore.getState();
        for (const key of Object.keys(data) as Array<keyof OnboardingData>) {
          const result = validateOnboardingField(key, data[key]);
          if (!result.ok) return;
        }
        set({ completed: true, completedAt: Date.now() });
      },
      reset: () => set({ data: { ...EMPTY }, completed: false, completedAt: null }),
    }),
    {
      name: 'wv2-onboarding-store',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // SUB-CHAT5-004 blueprint consistency — explicit partialize doar data
      // fields (NU actions). Match appStore + scheduleStore + workoutStore
      // existing pattern. data + completed + completedAt persisted; actions
      // (setField/finalize/reset) excluded pentru defense-in-depth.
      partialize: (state) => ({
        data: state.data,
        completed: state.completed,
        completedAt: state.completedAt,
      }) as Partial<OnboardingState & OnboardingActions>,
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
