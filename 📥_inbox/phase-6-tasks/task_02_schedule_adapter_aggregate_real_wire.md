# task_02 — scheduleAdapterAggregate Real Wire

**Phase:** 6 (engine pipeline real wire)
**Type:** Refactor — React-side replace baseline cu engine pipeline real
**Deps:** task_01 `scheduleAdapter.getDailyWorkout` exported
**Backup tag:** `pre-phase6-task-02-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +6-10

---

## §1 Scope

`src/react/lib/scheduleAdapterAggregate.ts` Phase 5 task_05 stub `PHASE_5_BASELINE_PUSH` (5 hardcoded exercises) + baseline duration 50min / volume 12450kg. Phase 6 replaces cu real `scheduleAdapter.getDailyWorkout(userState, now)` invocation.

## §2 Changes

### A. `src/react/lib/scheduleAdapterAggregate.ts` (rewrite)

```tsx
import { getDailyWorkout } from '../../engine/schedule/scheduleAdapter.js';
import { useWorkoutStore } from '../stores/workoutStore';
import { useNutritionStore } from '../stores/nutritionStore';
import type { PlannedExercise, PlannedWorkoutOutput } from './engineWrappers';

/**
 * Build minimal userState aggregate consumed de getDailyWorkout pipeline.
 * Tier-aware: T0 fresh → minimal user; T1+ → enriched cu recentSessions.
 */
function buildUserStateForPipeline() {
  const workoutStore = useWorkoutStore.getState();
  const nutritionStore = useNutritionStore.getState();
  return {
    user: workoutStore.userProfile || {},
    recentSessions: workoutStore.sessionsHistory || [],
    weights: workoutStore.exerciseWeights || {},
    profileTier: workoutStore.profileTier || 'T0',
    flags: {},
    meta: {
      weeksElapsed: workoutStore.weeksElapsed || 0,
      tdeeKcal: nutritionStore.lastKnownTdee || 0,
    },
  };
}

/**
 * Phase 6 task_02 real wire. Async consumer Phase 5 sync wrapped via
 * Promise — caller (Antrenor home) handles loading state. Returns null
 * pe rest day OR pipeline hard halt.
 */
export async function composePlannedWorkoutToday(
  now: Date = new Date(),
): Promise<PlannedWorkoutOutput | null> {
  try {
    const userState = buildUserStateForPipeline();
    const plan = await getDailyWorkout(userState, now);
    if (plan === null) return null; // rest day OR pipeline halt
    return {
      workoutTitle: plan.workoutTitle || 'Antrenament azi',
      exerciseCount: plan.exercises?.length || 0,
      estimatedDuration: plan.estimatedDurationMin || 50,
      intensityMod: plan.intensityModifier ? 'minus' : 'normal',
      exercises: plan.exercises || [],
      volumeKg: plan.volumeKg || 0,
    };
  } catch (e) {
    console.warn('[scheduleAdapterAggregate] composePlannedWorkoutToday failed:', e);
    return null;
  }
}
```

### B. `src/react/lib/engineWrappers.ts` (update consumer)

`getTodayWorkout()` Phase 5 sync wrapper devine async:

```tsx
export async function getTodayWorkout(): Promise<PlannedWorkoutOutput | null> {
  try {
    return await composePlannedWorkoutToday();
  } catch (e) {
    console.warn('[engineWrappers] getTodayWorkout failed:', e);
    return null;
  }
}
```

### C. Consumers update — Workout / WorkoutPreview / Antrenor home

Caller component pattern (e.g. `Workout.tsx`):
```tsx
const [plannedWorkout, setPlannedWorkout] = useState<PlannedWorkoutOutput | null>(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
  getTodayWorkout().then(plan => { setPlannedWorkout(plan); setLoading(false); });
}, []);
```

Loading state UI: `<LoadingSkeleton />` placeholder (Phase 5 task_19 component exists).

### D. Tests `src/react/__tests__/scheduleAdapterAggregate.realwire.test.tsx`

```js
- real wire invokes getDailyWorkout pipeline
- rest day → returns null
- pipeline hard halt → returns null
- training day → returns PlannedWorkoutOutput shape
- volumeKg propagates from engine output
- estimatedDuration propagates
- intensityMod 'minus' când deload intensityModifier active
- empty userState defensive → does not throw
```

## §3 Acceptance criteria

- [ ] `composePlannedWorkoutToday()` async signature LANDED
- [ ] ZERO `PHASE_5_BASELINE_PUSH` constant (deleted)
- [ ] `getTodayWorkout()` async signature propagated
- [ ] Workout + WorkoutPreview + Antrenor home consumers updated cu loading state
- [ ] Tests +6 minim PASS
- [ ] TS strict 0 errors

## §4 Tests delta target +6-10

## §5 Commit

```
refactor(react/lib): scheduleAdapterAggregate real wire getDailyWorkout

Replaces Phase 5 task_05 PHASE_5_BASELINE_PUSH stub (5 hardcoded exercises +
baseline duration 50min) cu real getDailyWorkout() async pipeline invocation.
Async signature propagated via engineWrappers.getTodayWorkout + consumers
updated cu useEffect loading state pattern.

Closes Phase 6 engine pipeline real wire end-to-end (#1.A → #1.B → #1.C).
```

## §6 Next

task_03 engineWrappers BN async wrapper real wire `bayesianNutrition.evaluate(ctx)`.
