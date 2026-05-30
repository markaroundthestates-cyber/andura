// ══ ONBOARDING STORE — Big 6 Hard Typing Phase 5 task_14 ═════════════════
//
// §B003/D-1b audit fix (D046 §3.1 + mockup andura-clasic.html L863-869) —
// Goal type extended 4→6 mockup parity: auto + forta + masa + slabire +
// mentenanta + longevitate. Legacy values 'definire' + 'sanatate' migrated
// pe load via persist `migrate` function (slabire ← definire, longevitate
// ← sanatate). 'masa' + 'forta' stable cross-version.
//
// §obiectiv-drop-longevitate 2026-05-28 Daniel verbatim "drop longevitate".
// Goal value 'longevitate' RIP — semantic duplicate cu 'mentenanta' (ambele
// → MAINTENANCE phase, identice engine template parameters). Goal type
// shrinks 6 → 5. Migration v4 → v5 maps persisted goal='longevitate' la
// 'mentenanta' on load (zero data loss, semantic continuity).

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Sex = 'm' | 'f';
export type Goal = 'auto' | 'forta' | 'masa' | 'slabire' | 'mentenanta';
/** Legacy goal values pre-D-1b + pre-D080 (zustand persist migrate handles). */
export type LegacyGoal = 'definire' | 'sanatate' | 'longevitate';
export type Frequency = '2' | '3' | '4' | '5';
export type Experience = 'incepator' | 'intermediar' | 'avansat';
/**
 * Training type (Daniel spec 2026-05-30) — gates the whole experience. Many
 * women train ONLY aerobic classes (no gym/weights); some do both. 'gym' is the
 * legacy default (migration-safe: every pre-v6 user gets 'gym', the original
 * gym-only experience). 'aerobic' = class-only (simplified Coach + class logger);
 * 'both' = gym workouts PLUS aerobic class logging.
 */
export type TrainingType = 'gym' | 'aerobic' | 'both';

export interface OnboardingData {
  age: number | null;
  sex: Sex | null;
  goal: Goal | null;
  frequency: Frequency | null;
  experience: Experience | null;
  weight: number | null;
  height: number | null;
  /**
   * Training type (Daniel spec 2026-05-30) — gates gym vs aerobic-class vs both
   * experience. Default 'gym' (legacy/migration-safe — pre-v6 users keep the
   * original gym-only flow). Set in onboarding (early step, after sex) +
   * editable later in Cont > Profil.
   *
   * OPTIONAL on the interface (mirror targetWeight/targetDate): existing
   * `{ age,...,height }` literal setState calls in tests + v3/v4/v5 migrate
   * stay valid without an explicit `trainingType`. EMPTY seeds 'gym' at runtime
   * and the v6 migrate spreads `...EMPTY` first, so every real read resolves to
   * a concrete value; consumers still defensively read with `?? 'gym'`.
   */
  trainingType?: TrainingType;
  /**
   * Greutate tinta (kg) — smoke 2026-05-28 #16. Persistat aici ca sa influenteze
   * tinta de kcal (vezi engineWrappers.getNutritionTargetsToday: cand
   * `targetWeight` + `targetDate` setate, kcal-ul tinta = TDEE − deficit/surplus
   * necesar pentru atingerea tintei pana la deadline, capped la 25% TDEE).
   * Editabil in Cont → Profil. Era doar form-state local V1 pana acum.
   *
   * OPTIONAL pe interfata pentru backward-compat: literal { age,...,height } in
   * test setState calls + migrate de la v3 ramane valide fara explicit
   * `targetWeight: null`. Default null aplicat la runtime via EMPTY + migrate
   * spread `...EMPTY`.
   */
  targetWeight?: number | null;
  /**
   * Deadline tinta (YYYY-MM format month picker, sau YYYY-MM-DD). Cuplat cu
   * `targetWeight` pentru calculul ETA realist + tinta de kcal. Null cand
   * user nu a ales o tinta (mod default = goal onboarding multiplicator).
   * OPTIONAL — vezi nota la `targetWeight`.
   */
  targetDate?: string | null;
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
 *  - age 18-99   → CEO 2026-05-27 adults-only 18+ (supersedes D046 §28-H5 GDPR-16 parental-consent default)
 *                  (overrides audit §30.6 lower 13). Mockup andura-clasic.html
 *                  L563 `min="16" max="99"` consistent.
 *  - weight 30-250 kg → audit §30.6 spec. Mockup L645 shows max=300 but audit
 *                       nuclear authoritative pre-Beta (Bugatti: tighter band
 *                       protects engine math; 250kg already extreme outlier).
 *  - height 120-230 cm → P-02 fitness metric (Mifflin-St Jeor BMR + US Navy
 *                       BF%). Band matches SettingsProfile composition input
 *                       (min=120 max=230) for cross-screen consistency. Mockup
 *                       onb step shows 100-250 but tighter band protects engine
 *                       math (sub-120cm/over-230cm = data-entry error, not real
 *                       adult). NU medical — pure fitness math input (D-height).
 *  - frequency '2'-'5' → type-narrow literal union, no numeric out-of-range
 *                       possible (TS compiler enforces).
 *  - sex/goal/experience → type-narrow literal unions, safe by construction.
 *
 * Source: 📤_outbox/audit-nuclear-2026-05-19/findings-§30.md §30-C1 +
 *         findings-§07.md §7-C4 + findings-§13.md §13-H1 + findings-§28.md
 *         §28-H5 + DECISIONS.md D046 §28-H5 GDPR LOCKED V1.
 */
export const ONBOARDING_BOUNDS = {
  age: { min: 18, max: 99 },
  weight: { min: 30, max: 250 },
  height: { min: 120, max: 230 },
  // Smoke 2026-05-28 #16 — targetWeight foloseste aceeasi banda ca weight
  // (Big6 fitness metric). Validare suplimentara separat: deadline + ritm
  // sanatos (vezi targetSafety.ts).
  targetWeight: { min: 30, max: 250 },
} as const satisfies Record<'age' | 'weight' | 'height' | 'targetWeight', { min: number; max: number }>;

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
  if (key === 'age' || key === 'weight' || key === 'height' || key === 'targetWeight') {
    const n = value as number;
    // Reject NaN/Infinity/negative/zero — never typed naturally; indicates
    // paste of "abc" → NaN, or programmatic abuse. Engines NaN-propagate.
    if (!Number.isFinite(n) || n <= 0) return false;
  }
  if (key === 'targetDate') {
    // YYYY-MM (month picker) sau YYYY-MM-DD acceptat. Defensive reject pe
    // forme aiurea — empty string e tratat ca null la setField (caller).
    const s = value as string;
    if (typeof s !== 'string' || s.length === 0) return false;
    if (!/^\d{4}-\d{2}(-\d{2})?$/.test(s)) return false;
  }
  return true;
}

/**
 * §i18n leak fix (audit 09 store-evading) — the validation outcome is NOT
 * Romanian prose. The store emits a semantic i18n key (`messageKey`) + numeric
 * `params` ({min,max}); the React boundary resolves it via `t()` so EN/RO both
 * render localized copy. Mirrors the engine-emits-key pattern (proactiveEngine
 * `messageKey`/`messageParams`, engineWrappers banner keys). Keys live in
 * en.json + ro.json under `onboarding.validation.*`.
 */
export type FieldValidation =
  | { ok: true }
  | { ok: false; messageKey: string; params?: Record<string, number> };

export function validateOnboardingField<K extends keyof OnboardingData>(
  key: K,
  value: OnboardingData[K],
): FieldValidation {
  if (value === null) return { ok: true };

  if (key === 'age') {
    const n = value as number;
    if (!Number.isFinite(n)) return { ok: false, messageKey: 'onboarding.validation.ageInvalid' };
    const { min, max } = ONBOARDING_BOUNDS.age;
    if (n < min || n > max) {
      return { ok: false, messageKey: 'onboarding.validation.ageRange', params: { min, max } };
    }
  }

  if (key === 'weight') {
    const n = value as number;
    if (!Number.isFinite(n)) return { ok: false, messageKey: 'onboarding.validation.weightInvalid' };
    const { min, max } = ONBOARDING_BOUNDS.weight;
    if (n < min || n > max) {
      return { ok: false, messageKey: 'onboarding.validation.weightRange', params: { min, max } };
    }
  }

  if (key === 'height') {
    const n = value as number;
    if (!Number.isFinite(n)) return { ok: false, messageKey: 'onboarding.validation.heightInvalid' };
    const { min, max } = ONBOARDING_BOUNDS.height;
    if (n < min || n > max) {
      return { ok: false, messageKey: 'onboarding.validation.heightRange', params: { min, max } };
    }
  }

  if (key === 'targetWeight') {
    const n = value as number;
    if (!Number.isFinite(n)) return { ok: false, messageKey: 'onboarding.validation.targetWeightInvalid' };
    const { min, max } = ONBOARDING_BOUNDS.targetWeight;
    if (n < min || n > max) {
      return { ok: false, messageKey: 'onboarding.validation.targetWeightRange', params: { min, max } };
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
  height: null,
  // Daniel spec 2026-05-30 — training type gates the experience. Default 'gym'
  // (the original gym-only flow) so legacy + migrated users are unchanged.
  trainingType: 'gym',
  // Smoke 2026-05-28 #16 — tinta personala persistata (era doar form-state V1).
  targetWeight: null,
  targetDate: null,
};

/**
 * §B003/D-1b + §obiectiv-drop-longevitate — migrate legacy Goal values:
 * 'definire'    → 'slabire'     (D-1b: cut goal renamed)
 * 'sanatate'    → 'mentenanta'  (D-1b consolidated → longevitate; D080 drops
 *                                longevitate → mentenanta, so chain through)
 * 'longevitate' → 'mentenanta'  (D080: longevitate dropped, semantic dup of
 *                                mentenanta — ambele MAINTENANCE phase)
 * 'masa' + 'forta' + 'slabire' + 'mentenanta' + 'auto' stable.
 *
 * Exported pentru unit tests (migration logic verifiable izolat de persist
 * pipeline). Pure function — no store reads.
 */
export function migrateLegacyGoal(legacyValue: unknown): Goal | null {
  if (legacyValue === 'definire') return 'slabire';
  if (legacyValue === 'sanatate') return 'mentenanta';
  if (legacyValue === 'longevitate') return 'mentenanta';
  if (
    legacyValue === 'auto' || legacyValue === 'forta' || legacyValue === 'masa' ||
    legacyValue === 'slabire' || legacyValue === 'mentenanta'
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
        // §30-C1 finalize gate — verify all Big 7 fields present + within
        // bounds before marking onboarding complete. Refuses silently dacă any
        // field out-of-range (UI Continua gate already shown toast); engines
        // downstream see only valid `completed: true` snapshots.
        //
        // U-02 (CRIT) — click-through gol guard: validateOnboardingField trece
        // `null` (short-circuit linia 90) → all-null Big 7 ar fi completat
        // onboarding fals (engines primesc demografice null → NaN). Respinge
        // explicit orice field null INAINTE de range-check.
        //
        // BUG-onboarding-step8-gata 2026-05-28 (Daniel smoke): A2 #16 a adaugat
        // `targetWeight` + `targetDate` ca OPTIONAL pe interfata (user le
        // seteaza in Progres > ObiectivCard post-onboarding, NU in wizard).
        // Iterarea Object.keys(data) le includea + null-check silently
        // respingea finalize → butonul "Gata" pe Step 8 nu-l ducea pe user
        // mai departe. Fix: enumerate explicit Big 7 required (skip optional
        // targetWeight/targetDate).
        const REQUIRED_FIELDS: Array<keyof OnboardingData> = [
          'age', 'sex', 'goal', 'frequency', 'experience', 'weight', 'height',
        ];
        const { data } = useOnboardingStore.getState();
        for (const key of REQUIRED_FIELDS) {
          if (data[key] === null) return;
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
      // v3 (P-02 height): height added to OnboardingData. Backward-compat —
      // both migrate branches spread `...EMPTY` first, so v0/v1/v2 persisted
      // users get `height: null` default without corrupting existing Big 6.
      // Existing user re-prompted for height doar daca redo onboarding; pana
      // atunci BMR foloseste fallback sex-avg (BMRStrip) → zero regresie.
      // v4 (smoke #16 targetWeight + targetDate): tinta personala persistata
      // pentru cuplare cu kcal recommendation. Migration spread `...EMPTY` →
      // existing users get both fields null implicit (no breaking change).
      // v5 (§obiectiv-drop-longevitate 2026-05-28): Goal type shrinks 6 → 5
      // (longevitate dropped — semantic duplicate of mentenanta). Existing
      // persisted goal='longevitate' migrated → 'mentenanta' via migrateLegacy-
      // Goal in v5 branch. Zero data loss, semantic continuity (ambele
      // MAINTENANCE phase deja).
      // v6 (training-type 2026-05-30): trainingType added. Both migrate branches
      // spread `...EMPTY` first → every pre-v6 user gets trainingType: 'gym'
      // (the original gym-only experience), zero behavior change for them.
      version: 6,
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
        // §obiectiv-drop-longevitate v4 → v5: Goal 6 → 5 (longevitate dropped).
        // Both branches funnel through migrateLegacyGoal — which chain-handles
        // 'definire'→'slabire', 'sanatate'→'mentenanta', 'longevitate'→'mentenanta'.
        const state = persistedState as Partial<OnboardingState> & { data?: { goal?: unknown } };
        if (version < 5 && state?.data?.goal !== undefined) {
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
