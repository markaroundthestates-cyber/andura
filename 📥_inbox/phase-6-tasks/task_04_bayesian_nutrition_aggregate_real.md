# task_04 — bayesianNutritionAggregate Real Wire

**Phase:** 6 (engine pipeline real wire)
**Type:** Refactor — React-side replace baselines cu BN engine real
**Deps:** task_03 `getNutritionTargetsToday` exported
**Backup tag:** `pre-phase6-task-04-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +6-8

---

## §1 Scope

`src/react/lib/bayesianNutritionAggregate.ts` Phase 5 task_07 stub `BASELINE_KCAL_TARGET=2640` + `BASELINE_PROTEIN_TARGET=180` consumed în `NutritionInline.tsx` + Antrenor home cards. Phase 6 replaces cu `getNutritionTargetsToday()` engine real wire.

## §2 Changes

### A. `src/react/lib/bayesianNutritionAggregate.ts` (rewrite)

```tsx
import { useNutritionStore } from '../stores/nutritionStore';
import { getNutritionTargetsToday } from './engineWrappers';

export interface NutritionTarget {
  kcalTarget: number;
  proteinTarget: number;
  source: 'manual' | 'engine-bn' | 'baseline';
  confidence: number; // 0-1 Kalman filter state
}

/**
 * Get today's nutrition target. Priority order:
 *   1. Manual log (user override priority preserved)
 *   2. BN engine evaluate output via getNutritionTargetsToday async
 *   3. Baseline fallback graceful
 *
 * Phase 6 real wire — replaces Phase 5 task_07 hardcoded baselines.
 */
export async function getNutritionTargetTodayReal(
  dateISO: string,
  userState?: object,
): Promise<NutritionTarget> {
  // Priority 1: manual log
  const entry = useNutritionStore.getState().getDaily(dateISO);
  if (entry?.kcal != null && entry?.protein != null) {
    return {
      kcalTarget: entry.kcal,
      proteinTarget: entry.protein,
      source: 'manual',
      confidence: 1,
    };
  }
  // Priority 2: engine real wire
  const engineTargets = await getNutritionTargetsToday(userState);
  return {
    kcalTarget: engineTargets.kcalTarget,
    proteinTarget: engineTargets.proteinTargetG,
    source: engineTargets.source === 'engine' ? 'engine-bn' : 'baseline',
    confidence: engineTargets.confidence,
  };
}
```

### B. `NutritionInline.tsx` consumer update

Replace sync Phase 5 call cu async pattern:
```tsx
const [target, setTarget] = useState<NutritionTarget | null>(null);
useEffect(() => {
  getNutritionTargetTodayReal(todayISO, userState).then(setTarget);
}, [todayISO, userState]);
```

Source indicator subtle (anti-paternalism — NU "fallback" jargon Gigel-confusing):
- "Estimare adaptiva" (când source=engine-bn)
- "Estimare initiala" (când source=baseline) — pre-T1+ observation
- "Setat manual" (când source=manual)

### C. Tests `src/react/__tests__/bayesianNutritionAggregate.realwire.test.tsx`

```js
- manual log priority preserved
- engine output consumed cand no manual log
- baseline fallback cand engine returns baseline
- confidence propagated correctly
- source label mapping (manual/engine-bn/baseline)
- async signature awaits properly
```

## §3 Acceptance criteria

- [ ] `getNutritionTargetTodayReal()` async export LANDED
- [ ] ZERO `BASELINE_KCAL_TARGET` + `BASELINE_PROTEIN_TARGET` constants (deleted din module)
- [ ] NutritionInline consumer updated async pattern
- [ ] Manual override priority preserved invariant
- [ ] Tests +6 minim PASS
- [ ] TS strict 0 errors

## §4 Tests delta target +6-8

## §5 Commit

```
refactor(react/lib): bayesianNutritionAggregate real wire engine BN async

Replaces Phase 5 task_07 BASELINE_KCAL_TARGET=2640 / BASELINE_PROTEIN_TARGET=180
stubs cu getNutritionTargetsToday() async engine real wire. Manual log
priority preserved invariant. Source indicator subtle anti-paternalism
preserved (NU "fallback" jargon Gigel-confusing).

Closes Phase 6 BN engine real wire end-to-end (#2.A → #2.B).
```

## §6 Next

task_05 engineWrappers coachDirector.run real wrapper.
