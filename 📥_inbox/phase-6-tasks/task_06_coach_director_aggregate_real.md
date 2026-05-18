# task_06 — coachDirectorAggregate Real Wire

**Phase:** 6 (engine pipeline real wire)
**Type:** Refactor — React-side wire patterns banner + PR Wall + alerts
**Deps:** task_05 `getCoachRunOutput` exported
**Backup tag:** `pre-phase6-task-06-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +8-12

---

## §1 Scope

`src/react/lib/coachDirectorAggregate.ts` Phase 5 task_06 = simple data bundle (readiness + fatigue + plannedWorkout + isRestDay). Phase 6 enrich cu real `getCoachRunOutput()` engine output → patterns banner + PR Wall + alerts wired Antrenor home cards.

## §2 Changes

### A. `src/react/lib/coachDirectorAggregate.ts` (rewrite)

```tsx
import type { ReadinessOutput, FatigueOutput, PlannedWorkoutOutput } from './engineWrappers';
import { getReadiness, getFatigue, getTodayWorkout, getCoachRunOutput } from './engineWrappers';
import type { CoachRunOutput } from './engineWrappers';

export interface CoachTodayOutput {
  readiness: ReadinessOutput | null;
  fatigue: FatigueOutput | null;
  plannedWorkout: PlannedWorkoutOutput | null;
  isRestDay: boolean;
  patternsBanner: CoachRunOutput['patternsBanner'];
  prWallRecent: CoachRunOutput['prWallRecent'];
  alerts: CoachRunOutput['alerts'];
  recommendedRecompile: boolean;
  source: 'engine' | 'baseline';
}

/**
 * Phase 6 real wire CoachDirector.run output aggregate. Returns 4 simple
 * bundle (readiness + fatigue + plannedWorkout + isRestDay) + 4 enriched
 * (patternsBanner + prWallRecent + alerts + recompile) from engine pipeline.
 */
export async function getCoachToday(
  opts: { isInCut?: boolean; userState?: object } = {},
): Promise<CoachTodayOutput> {
  const readiness = getReadiness(opts);
  const fatigue = getFatigue();
  const plannedWorkout = await getTodayWorkout();
  const isRestDay = plannedWorkout === null;
  const runOutput = await getCoachRunOutput(opts.userState);
  return {
    readiness,
    fatigue,
    plannedWorkout,
    isRestDay,
    patternsBanner: runOutput.patternsBanner,
    prWallRecent: runOutput.prWallRecent,
    alerts: runOutput.alerts,
    recommendedRecompile: runOutput.recommendedRecompile,
    source: runOutput.source,
  };
}
```

### B. Antrenor home consumer update

Component `Antrenor.tsx` (or current home screen consumer):
```tsx
const [coach, setCoach] = useState<CoachTodayOutput | null>(null);
useEffect(() => {
  getCoachToday({ userState }).then(setCoach);
}, [userState]);
// Render: readiness card + fatigue card + planned workout card + PatternsBanner + PRWallRecent + AlertsBanner
```

### C. NEW components `src/react/components/PatternsBanner.tsx` + `PRWallRecent.tsx` + `AlertsBanner.tsx`

Minimal shells consume props din `getCoachToday()` output. Mockup parity:
- PatternsBanner: pillshow "Adherence scazuta" / "Stagnare 2 saptamani" + dismiss-once
- PRWallRecent: ultimele 3 PRs (weight/reps/volume) cu fade-in 200ms
- AlertsBanner: severity 'urgent' top-pinned + 'warn' inline + 'info' subtle

### D. Tests `src/react/__tests__/coachDirectorAggregate.realwire.test.tsx`

```js
- aggregate 8 fields shape complete
- readiness + fatigue + plannedWorkout + isRestDay preserved
- patternsBanner array propagates
- prWallRecent array propagates
- alerts array propagates
- recompile flag propagates
- source mapping engine/baseline
- async signature awaits getTodayWorkout + getCoachRunOutput
- empty engine output → defaults graceful
- rest day → isRestDay=true
```

## §3 Acceptance criteria

- [ ] `getCoachToday()` async signature LANDED 8-field output
- [ ] 3 NEW components (PatternsBanner + PRWallRecent + AlertsBanner) wired Antrenor home
- [ ] Async consumer pattern useEffect loading state
- [ ] Tests +8 minim PASS
- [ ] TS strict 0 errors

## §4 Tests delta target +8-12

## §5 Commit

```
refactor(react/lib): coachDirectorAggregate real wire patterns + PR Wall + alerts

Replaces Phase 5 task_06 thin bundle (readiness + fatigue + plannedWorkout +
isRestDay) cu enriched output 8 fields via getCoachRunOutput() engine real
wire — adds patternsBanner (LOW_ADHERENCE + STAGNATION) + prWallRecent +
alerts + recompile flag.

3 NEW components Antrenor home consume: PatternsBanner + PRWallRecent +
AlertsBanner. Mockup parity verbatim styling. Async useEffect pattern.

Closes Phase 6 CoachDirector engine real wire end-to-end (#3.A → #3.B).
```

## §6 Next

task_07 aaFriction real Vitality/Adherence signals derive.
