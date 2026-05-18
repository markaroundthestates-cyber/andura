# task_07 — aaFriction Real Signals Derive

**Phase:** 6 (engine pipeline real wire)
**Type:** Refactor — replace baseline 50/50 thresholds cu real engine signals
**Deps:** task_06 LANDED
**Backup tag:** `pre-phase6-task-07-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +6-10

---

## §1 Scope

`src/react/lib/aaFrictionDetect.ts` Phase 5 task_09 `deriveThresholds()` accepts `vitalityScore` + `adherenceScore` 0-100 dar consumer (Workout.handleLogSet pre-logSet check) inca pass implicit 50/50 baseline. Phase 6 wire real Vitality + Adherence din `engineSignalsAggregate.getEngineSignals()` direct la `deriveThresholds()` call site.

## §2 Changes

### A. `src/react/components/Workout.tsx` (or current logSet handler) update

```tsx
import { detectAggressiveLoad, deriveThresholds } from '../lib/aaFrictionDetect';
import { getEngineSignals } from '../lib/engineSignalsAggregate';

function handleLogSet(newSet: SetSample, history: SetSample[]) {
  const signals = getEngineSignals();
  const thresholds = deriveThresholds({
    vitalityScore: signals.vitalityScore,
    adherenceScore: signals.adherenceScore,
  });
  const check = detectAggressiveLoad(history, newSet, thresholds);
  if (check.trigger) {
    // open aaFrictionModal cu reason check.reason
  } else {
    // proceed logSet
  }
}
```

### B. `src/react/lib/engineSignalsAggregate.ts` enrich

Phase 5 task_10 baseline `BASELINE_VITALITY=50` + `BASELINE_ADHERENCE=50`. Phase 6 enrich `vitalityScore` din readiness/fatigue compose (already partial Phase 5 task_10) + `adherenceScore` proxy din streak completion ratio.

```tsx
import { getReadiness, getFatigue } from './engineWrappers';
import { useWorkoutStore } from '../stores/workoutStore';

const BASELINE_VITALITY = 50;
const BASELINE_ADHERENCE = 50;

function deriveAdherenceFromStreak(): number {
  const state = useWorkoutStore.getState();
  const streakDays = state.streakDays || 0;
  const last30Days = state.sessionsLast30Days?.length || 0;
  // Simple proxy: streak weight 60% + last 30 completion ratio 40%
  const streakWeight = Math.min(100, streakDays * 10);
  const last30Ratio = Math.min(100, (last30Days / 30) * 100);
  return Math.round(streakWeight * 0.6 + last30Ratio * 0.4);
}

export function getEngineSignals(): EngineSignals {
  const readiness = getReadiness();
  const fatigue = getFatigue();
  let energyDirection: EngineSignals['energyDirection'] = 'flat';
  if (readiness !== null) {
    if (readiness.score >= 80) energyDirection = 'up';
    else if (readiness.score < 50) energyDirection = 'down';
  }
  const vitalityScore = fatigue !== null && typeof fatigue.score === 'number'
    ? Math.max(0, Math.min(100, 100 - fatigue.score))
    : BASELINE_VITALITY;
  // Phase 6: real adherence din workoutStore streak + last 30 ratio
  const adherenceScore = deriveAdherenceFromStreak();
  return {
    vitalityScore,
    adherenceScore,
    energyDirection,
    source: readiness !== null || fatigue !== null ? 'engine' : 'baseline',
  };
}
```

### C. Tests `src/react/__tests__/aaFrictionDetect.realsignals.test.tsx`

```js
- high vitality + high adherence → laxer thresholds (kgJump 0.25)
- low vitality + low adherence → stricter thresholds (kgJump 0.15)
- mid signals → DEFAULT thresholds (kgJump 0.20)
- empty workout history → BASELINE_ADHERENCE fallback
- engine signals propagate to deriveThresholds correctly
```

## §3 Acceptance criteria

- [ ] Workout.handleLogSet wire real `getEngineSignals()` → `deriveThresholds()`
- [ ] `engineSignalsAggregate.deriveAdherenceFromStreak` NEW helper
- [ ] BASELINE_ADHERENCE proxy preserved doar pe T0 fresh (no streak yet)
- [ ] Tests +6 minim PASS
- [ ] TS strict 0 errors

## §4 Tests delta target +6-10

## §5 Commit

```
refactor(react/lib): aaFriction real Vitality/Adherence signals wire

Replaces Phase 5 task_09 implicit 50/50 baseline thresholds derivation cu
real getEngineSignals() input — vitalityScore via fatigue inverse,
adherenceScore via streakDays + last30 completion ratio proxy.

Workout.handleLogSet consumer updated explicit pass thresholds via
deriveThresholds(signals). High vitality + adherence → laxer kgJump 0.25,
low signals → stricter 0.15.

Closes Phase 6 aaFriction dynamic thresholds engine-driven real wire (#4).
```

## §6 Next

task_08 Adherence Engine real wire (full Adherence Engine #4 ADR 022 reference).
