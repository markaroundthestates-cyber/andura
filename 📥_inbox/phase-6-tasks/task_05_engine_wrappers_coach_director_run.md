# task_05 — engineWrappers CoachDirector.run Wrapper

**Phase:** 6 (engine pipeline real wire)
**Type:** Feature — async wrapper coachDirector orchestrator
**Deps:** task_04 LANDED
**Backup tag:** `pre-phase6-task-05-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +6-10

---

## §1 Scope

`coachDirectorAggregate.ts` Phase 5 task_06 = thin React-side bundle (readiness + fatigue + plannedWorkout). Real engine `src/engine/coachDirector.js` cu `buildCoachContext` + `realityEngine` + pipeline `runProactiveChecks` + `recompileWeek` + patterns banner detection (LOW_ADHERENCE + STAGNATION) + PR Wall recent + alerts. Phase 6 wraps `coachDirector.run(ctx)` real pipeline output React-friendly.

## §2 Changes

### A. Grep verify primary-source

```bash
grep -n "export" src/engine/coachDirector.js
grep -n "buildCoachContext\|runProactiveChecks\|recompileWeek" src/engine/coachDirector.js | head -20
```

### B. `src/react/lib/engineWrappers.ts` (extend)

```tsx
import { CoachDirector } from '../../engine/coachDirector.js';

export interface CoachRunOutput {
  patternsBanner: Array<{ id: 'LOW_ADHERENCE' | 'STAGNATION'; severity: 'info' | 'warn'; text: string }>;
  prWallRecent: Array<{ exercise: string; type: 'weight' | 'reps' | 'volume'; kg: number; reps: number; date: string }>;
  alerts: Array<{ id: string; text: string; severity: 'info' | 'warn' | 'urgent' }>;
  recommendedRecompile: boolean;
  source: 'engine' | 'baseline';
}

const BASELINE_RUN: CoachRunOutput = {
  patternsBanner: [],
  prWallRecent: [],
  alerts: [],
  recommendedRecompile: false,
  source: 'baseline',
};

/**
 * Real wire CoachDirector orchestrator pipeline. Returns patterns banner
 * + PR Wall recent + alerts + recompile recommendation.
 *
 * Returns baseline fallback dacă engine throws sau ctx insufficient.
 */
export async function getCoachRunOutput(userState?: object): Promise<CoachRunOutput> {
  try {
    const director = new CoachDirector();
    const result = await director.run(userState || {});
    if (!result) return BASELINE_RUN;
    return {
      patternsBanner: Array.isArray(result.patternsBanner) ? result.patternsBanner : [],
      prWallRecent: Array.isArray(result.prWallRecent) ? result.prWallRecent : [],
      alerts: Array.isArray(result.alerts) ? result.alerts : [],
      recommendedRecompile: !!result.recommendedRecompile,
      source: 'engine',
    };
  } catch (e) {
    console.warn('[engineWrappers] getCoachRunOutput failed:', e);
    return BASELINE_RUN;
  }
}
```

### C. Tests `src/react/__tests__/engineWrappers.getCoachRunOutput.test.tsx`

```js
- engine output consumed când succeeds
- baseline fallback când engine throws
- patternsBanner defensive array
- prWallRecent defensive array
- alerts defensive array
- recompile flag propagates
- empty ctx → baseline
- source mapping engine/baseline
```

## §3 Acceptance criteria

- [ ] `getCoachRunOutput()` async export LANDED
- [ ] Defensive parsing 4 fields (patternsBanner + prWallRecent + alerts + recompile)
- [ ] Baseline fallback wired
- [ ] Tests +6 minim PASS
- [ ] TS strict 0 errors

## §4 Tests delta target +6-10

## §5 Commit

```
feat(react/lib): engineWrappers getCoachRunOutput async coachDirector wrapper

NEW async export invokes CoachDirector.run(ctx) orchestrator pipeline output.
Returns patterns banner (LOW_ADHERENCE + STAGNATION) + PR Wall recent +
alerts + recompile flag. Defensive parsing + baseline fallback graceful.

Unlocks task_06 React coachDirectorAggregate real wire consumer.
```

## §6 Next

task_06 React `coachDirectorAggregate.ts` consume `getCoachRunOutput()`.
