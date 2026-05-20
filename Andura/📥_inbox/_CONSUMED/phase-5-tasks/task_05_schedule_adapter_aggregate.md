# task_05 — scheduleAdapter Aggregate `getDailyWorkout` Engine Export

**Phase:** 5 (engine pipeline real wire)
**Type:** Feature — engine API expand
**Deps:** task_04 (post TS strict pass-2)
**Backup tag:** `pre-phase5-task-05-2026-05-17`
**Est commits:** 2 atomic (engine export + React consumer wire)
**Est tests delta:** +12-18

---

## §1 Scope

Current `src/engine/scheduleAdapter.js` (LANDED S2.A `7c2f520` Calendar V1) expune ONLY:
- override (Calendar mid-week edit ephemeral)
- missing equipment filter
- skip handler

PHASE_4_DEMO_PUSH stub în React `engineWrappers.ts` rămâne hardcoded Push session matching mockup wv2. Phase 5 task_05: expose aggregate `getDailyWorkout(date, ctx)` care întoarce planned-workout complete bazat pe:
- Current goal template (PPL / Upper-Lower / Full body / etc.)
- Mesocycle phase (Periodization Engine #1)
- Calendar override + missing equipment
- Energy adjustment (Engine #3) volume multiplier
- Specialization (Engine #6) muscle priorities
- Warm-up & Mobility (Engine #7) prefix
- Deload state (Engine #8) — week 4 micro-deload trigger

NU mutate `src/engine/*` per ADR 026 §9 — `scheduleAdapter.js` aggregate API e UI-side pure-function adapter pattern.

## §2 Changes

### A. `src/engine/scheduleAdapter.js` (extend)

NEW function `getDailyWorkout(date, ctx)`:
```js
/**
 * Aggregate daily planned workout from full Coach pipeline. Pure-function
 * adapter — composes existing engines without side-effects. NU mutate any
 * engine state.
 *
 * @param {string} date ISO date YYYY-MM-DD
 * @param {object} ctx coach context (buildCoachContext output)
 * @returns {PlannedWorkout|null} null daca rest day per calendar
 */
export function getDailyWorkout(date, ctx) {
  // Step 1: check calendar — rest day?
  const dayIdx = getDayIndex(date); // 0=L, 6=D
  const calendarOverride = ctx.meta?.calendarOverride;
  const days = calendarOverride ?? ctx.profile?.defaultWeek ?? DEFAULT_WEEK;
  if (days[dayIdx] === 'rest') return null;

  // Step 2: get template per goal + mesocycle phase
  const template = getTemplate(ctx.profile.goal); // ADR 024
  const phase = getCurrentMesocyclePhase(ctx); // Periodization Engine #1
  const baseExercises = template.getExercisesForPhase(phase, dayIdx);

  // Step 3: missing equipment filter
  const missingEq = ctx.meta?.missingEquipment ?? [];
  const filtered = filterByEquipment(baseExercises, missingEq);

  // Step 4: energy adjustment volume multiplier
  const volumeMod = ctx.readiness?.volumeMultiplier ?? 1.0;
  const adjusted = applyVolumeMultiplier(filtered, volumeMod);

  // Step 5: specialization priorities (Engine #6)
  const prioritized = applySpecialization(adjusted, ctx.profile.specialization);

  // Step 6: deload check (Engine #8)
  const inDeload = isDeloadWeek(ctx);
  const final = inDeload ? applyDeload(prioritized) : prioritized;

  // Step 7: warmup prefix (Engine #7)
  const withWarmup = addWarmupBlock(final, ctx);

  return {
    date,
    workoutTitle: deriveTitle(template, phase, dayIdx),
    exercises: withWarmup,
    estimatedDuration: estimateDuration(withWarmup),
    intensityMod: deriveIntensityMod(volumeMod, inDeload),
    volumeKg: sumPlannedVolume(withWarmup),
  };
}
```

Helpers small private functions (NU export):
- `getDayIndex(date)` — date → 0-6 Monday-first
- `getTemplate(goal)` — lookup template registry
- `getCurrentMesocyclePhase(ctx)` — Periodization Engine
- `filterByEquipment(exercises, missing)` — exclude exercises requiring missing equipment
- `applyVolumeMultiplier(exercises, mod)` — sets/targetReps scale
- `applySpecialization(exercises, spec)` — reorder + add accessory
- `isDeloadWeek(ctx)` — week 4 mesocycle check
- `applyDeload(exercises)` — sets ×0.5, intensity ×0.85
- `addWarmupBlock(exercises, ctx)` — prefix warmup exercises
- `deriveTitle(template, phase, dayIdx)` — e.g. "Push A — Mesocycle 1 W3"
- `estimateDuration(exercises)` — sum sets × restSec + transitions
- `deriveIntensityMod(mod, deload)` — 'plus' | 'normal' | 'minus'
- `sumPlannedVolume(exercises)` — sum sets × targetReps × targetKg

### B. `src/react/lib/engineWrappers.ts` (consumer wire)

Replace PHASE_4_DEMO_PUSH stub:
```tsx
import { getDailyWorkout } from '../../engine/scheduleAdapter.js';
import { buildCoachContext } from '../../engine/coachContext.js';

export function getPlannedWorkoutToday(): PlannedWorkoutOutput | null {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const ctx = buildCoachContext();
    const raw = getDailyWorkout(today, ctx);
    if (!raw) return null;
    return {
      workoutTitle: raw.workoutTitle,
      exerciseCount: raw.exercises.length,
      estimatedDuration: raw.estimatedDuration,
      intensityMod: raw.intensityMod,
      exercises: raw.exercises.map(mapEngineExerciseToPlanned),
      volumeKg: raw.volumeKg,
    };
  } catch (e) {
    console.warn('[engineWrappers] getPlannedWorkoutToday failed:', e);
    return null;
  }
}

function mapEngineExerciseToPlanned(ex): PlannedExercise {
  return {
    id: ex.id,
    name: ex.name,
    sets: ex.sets,
    targetReps: ex.targetReps,
    targetKg: ex.targetKg,
    restSec: ex.restSec ?? 120,
  };
}
```

### C. `src/react/components/Workout/Workout.tsx` (consumer update)

Replace inline PHASE_4_DEMO_PUSH reference cu `getPlannedWorkoutToday()` import. Empty state preserved (task_17) când returns null (rest day).

## §3 Acceptance criteria

- [ ] `scheduleAdapter.js` exports `getDailyWorkout` pure-function aggregate
- [ ] ZERO mutation `src/engine/{readiness,fatigue,prEngine,bayesianNutrition,...}.js` per ADR 026 §9
- [ ] React `engineWrappers.getPlannedWorkoutToday()` wires real engine
- [ ] Workout.tsx renders real exercise list pe weekday training (rest day → empty state)
- [ ] Tests +12-18 PASS (engine adapter + React wire integration)
- [ ] TS strict 0 errors

## §4 Tests

Engine-side (vitest):
```bash
src/engine/__tests__/scheduleAdapter.aggregate.test.js
- getDailyWorkout returns null pe rest day per calendar
- getDailyWorkout applies missing equipment filter
- getDailyWorkout applies volume multiplier readiness
- getDailyWorkout applies deload week 4 mesocycle
- getDailyWorkout prefixes warmup block
```

React-side (vitest + jsdom):
```bash
src/react/__tests__/engineWrappers.getPlannedWorkoutToday.test.tsx
- returns null gracefully când engine throws
- maps engine output → PlannedWorkoutOutput shape correct
- consumes buildCoachContext silently (mock)
```

## §5 Commits (atomic 2)

```
feat(engine/schedule): scheduleAdapter aggregate getDailyWorkout pure-function

Composes Periodization + Goal Template + Energy + Specialization + Deload +
Warmup pipeline UI-side adapter pattern (ADR 030 D2 thin scope). ZERO
engine mutation per ADR 026 §9. Calendar override + missing equipment +
volume multiplier readiness wired SSOT context.

feat(react/lib): engineWrappers getPlannedWorkoutToday wire real adapter

Replaces PHASE_4_DEMO_PUSH stub cu real scheduleAdapter.getDailyWorkout
aggregate via buildCoachContext. Workout.tsx consumes via wrapper —
empty state task_17 preserved cand returns null (rest day).
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_05_schedule_adapter_aggregate.md`:
- API signature getDailyWorkout
- Helper functions list private
- Engine compose pipeline order (Periodization → Goal → Energy → Spec → Deload → Warmup)
- Tests delta
