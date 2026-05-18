# task_01 — scheduleAdapter.getDailyWorkout Backend Consumer

**Phase:** 6 (engine pipeline real wire)
**Type:** Feature — backend NEW export consumer `runPipeline` 8 adapters
**Deps:** Phase 6 task #1.A deloadAdapter batch 8 ULTIM LANDED `810c783`
**Backup tag:** `pre-phase6-task-01-2026-05-18`
**Est commits:** 1-2 atomic (export + tests)
**Est tests delta:** +12-18

---

## §1 Scope

Pipeline §42.10 COMPLETE 8/8 V1 prescriptive engines wired post task #1.A. Lipsește consumer top-level care invoke `runPipeline(ctx, [8 adapters])` + sessionBuilder integration + aggregate 8 engine blueprints → unified `WorkoutPlan` consumed React-side.

scheduleAdapter.js = adapter UI-side per ADR 030 D2 (localStorage edges, NU engine pure-function — primary-source verified). Mutație acceptată per ORCHESTRATOR §7 exception explicit.

## §2 Changes

### A. Grep verify primary-source

```bash
grep -n "export" src/engine/schedule/scheduleAdapter.js
grep -n "export" src/coach/orchestrator/index.js
grep -n "export" src/coach/orchestrator/contextBuilder.js
grep -n "export" src/coach/orchestrator/adapters/index.js
cat src/engine/sessionBuilder.js | head -100
```

### B. `src/engine/schedule/scheduleAdapter.js` (extend NEW export)

Append NEW export `getDailyWorkout(userState, dateOrIdx)`:

```js
import { buildEngineContext } from '../../coach/orchestrator/contextBuilder.js';
import { runPipeline } from '../../coach/orchestrator/index.js';
import {
  periodizationAdapter,
  goalAdaptationAdapter,
  energyAdjustmentAdapter,
  bayesianNutritionAdapter,
  tempoAdapter,
  specializationAdapter,
  warmupAdapter,
  deloadAdapter,
} from '../../coach/orchestrator/adapters/index.js';
import { buildSession } from '../sessionBuilder.js';

/**
 * Compose today's workout plan — invoke 8-engine pipeline §42.10 sequential
 * strict + aggregate blueprints + delegate exercise selection la sessionBuilder.
 *
 * Returns null când:
 *   - Calendar override rest day (selectedDays[dayIdx].active === false)
 *   - Pipeline hard halt (Periodization fails — cannot proceed)
 *
 * Returns WorkoutPlan structure când training day + pipeline complete.
 *
 * @param {object} userState — { user, recentSessions, weights, profileTier, flags, meta }
 * @param {Date} [now=new Date()]
 * @returns {Promise<WorkoutPlan|null>}
 */
export async function getDailyWorkout(userState, now = new Date()) {
  const dayIdx = mapDateToIndex(now);
  const override = getCalendarOverride(now);

  // Rest day check
  if (override && Array.isArray(override.selectedDays)) {
    const dayConfig = override.selectedDays[dayIdx];
    if (dayConfig && dayConfig.active === false) {
      return null; // rest day
    }
  }

  // Build EngineContext + invoke pipeline
  const ctx = buildEngineContext(userState);
  const adapters = [
    periodizationAdapter, goalAdaptationAdapter, energyAdjustmentAdapter,
    bayesianNutritionAdapter, tempoAdapter, specializationAdapter,
    warmupAdapter, deloadAdapter,
  ];

  const results = await runPipeline(ctx, adapters);

  // Detect hard halt (first hard error)
  const hardError = results.find(r => !r.ok && r.error?.severity === 'hard');
  if (hardError) return null;

  // Aggregate 8 blueprints by engine ID
  const blueprints = {};
  for (const r of results) {
    if (r.ok && r.output?.id) {
      blueprints[r.output.id] = r.output.meta || {};
    }
  }

  // Delegate exercise selection la sessionBuilder (legacy)
  const session = buildSession({
    userState,
    periodization: blueprints.periodization,
    goalAdaptation: blueprints.goalAdaptation,
    specialization: blueprints.specialization,
    missingEquipment: getMissingEquipment(),
  });

  // Compose WorkoutPlan unified
  return {
    type: 'training',
    warmup: blueprints.warmup || null,
    exercises: session.exercises || [],
    intensityModifier: blueprints.deload?.intensity_modifier || null,
    volumeTargets: blueprints.periodization?.volume_target_pct || null,
    specializationTarget: blueprints.specialization?.target_muscle_group || null,
    deloadState: blueprints.deload?.deload_state || 'IDLE',
    estimatedDurationMin: session.estimatedDurationMin || 50,
    volumeKg: session.volumeKg || 0,
    workoutTitle: session.workoutTitle || 'Antrenament azi',
  };
}
```

### C. Pre-flight grep `sessionBuilder.buildSession` signature

Verify actual signature; adjust call shape conform existing export.

### D. Tests `src/engine/schedule/__tests__/scheduleAdapter.getDailyWorkout.test.js`

```js
- rest day calendar override → returns null
- training day + pipeline ok → returns WorkoutPlan complete
- Periodization fails hard → returns null
- aggregate blueprints by engine ID correct
- sessionBuilder delegate exercises wired
- volumeKg + estimatedDurationMin propagated
- deload state propagates intensityModifier
- specialization target_muscle_group propagates
- workoutTitle fallback "Antrenament azi" when sessionBuilder absent
- Periodization Constraint Object propagates downstream via orchestrator
- empty userState → defensive defaults
- missingEquipment filter applied via sessionBuilder
```

## §3 Acceptance criteria

- [ ] `scheduleAdapter.getDailyWorkout()` NEW export LANDED
- [ ] Invoke `runPipeline(ctx, [8 adapters])` complete chain
- [ ] sessionBuilder integration via blueprint params
- [ ] Tests +12 minim PASS
- [ ] TS strict 0 errors (JSDoc types parseable)
- [ ] ZERO `src/engine/*` mutation EXCEPȚIE acceptată scheduleAdapter (adapter UI-side per ADR 030 D2)

## §4 Tests delta target +12-18

## §5 Commit

```
feat(engine/schedule): scheduleAdapter.getDailyWorkout consumer runPipeline 8 adapters

NEW export invokes pipeline §42.10 sequential strict + aggregates 8 engine
blueprints (Periodization + GoalAdaptation + EnergyAdjustment + BN + Tempo +
Specialization + Warmup + Deload) + delegates exercise selection la
sessionBuilder. Returns unified WorkoutPlan consumed React-side task_02.

Rest day handling via calendar override + hard halt graceful null return.
Adapter UI-side per ADR 030 D2 — NU engine pure (localStorage edges).
```

## §6 Next

task_02 React `scheduleAdapterAggregate.ts` consume `getDailyWorkout()` direct (replace `PHASE_5_BASELINE_PUSH` stub).
