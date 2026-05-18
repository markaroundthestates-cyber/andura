# task_07 — aaFriction Real Vitality/Adherence Signals Wire

**Phase:** 6 (engine pipeline real wire)
**Type:** Refactor — wire `getEngineSignals` la `deriveThresholds` în Workout.handleLogSet + replace hardcoded 50/50 baseline
**Deps:** task_06 LANDED
**Backup tag:** `pre-phase6-task-07-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +6-10

---

## §1 Slip codificat anti-recurrence

Sketch V1 inventat `useWorkoutStore.streakDays` + `useWorkoutStore.sessionsLast30Days`. Primary-source grep `src/react/stores/workoutStore.ts`:
- Actual slice field = **`streak`** (NU `streakDays`)
- **NU EXISTĂ** `sessionsLast30Days` — există doar `sessionsHistory` (cumulative all-time, NOT 30-day windowed)
- Last 30 days derived inline: `sessionsHistory.filter(s => s.ts > Date.now() - 30 * 86_400_000)`

Plus task_08 wires real `getAdherenceScore()` engine (sync DB-backed) direct. Task_07 simplificat: WIRE-ONLY (NU adaugă proxy helper temporar care va fi șters next task).

---

## §2 Primary-source evidence verified

**`useWorkoutStore` slice fields** (grep `src/react/stores/workoutStore.ts:78-91`): `streak`, `sessionsHistory`, etc. (full list în task_02 §2). **NU EXISTĂ** `streakDays`/`sessionsLast30Days`.

**`src/react/lib/aaFrictionDetect.ts` Phase 5 task_09 LANDED:**
- Exports `deriveThresholds({vitalityScore, adherenceScore})` → returns adjusted threshold object
- Exports `detectAggressiveLoad(history, newSet, thresholds)` → returns `{trigger, reason}`

**`src/react/lib/engineSignalsAggregate.ts` Phase 5 task_10 LANDED:**
- Exports `getEngineSignals()` → returns `EngineSignals` cu `{vitalityScore, adherenceScore, energyDirection, source}`
- Phase 5 baseline: `BASELINE_VITALITY=50` + `BASELINE_ADHERENCE=50`
- `vitalityScore` already wired din fatigue inverse Phase 5 (NU baseline)
- `adherenceScore` Phase 5 = hardcoded BASELINE_ADHERENCE proxy

**Task_08 will wire** `adherenceScore` din real `getAdherenceScore()` engine (DB-backed sync) — eliminating Phase 5 baseline proxy. Task_07 scope: doar wire-ul la call-site (Workout.tsx).

---

## §3 Scope changes

### A. Workout.tsx existing handleLogSet review

Verify Workout.tsx Phase 4 task_14 §C already imports `detectAggressiveLoad` (grep line 30-33 `src/react/routes/screens/antrenor/Workout.tsx`):

```tsx
import { detectAggressiveLoad } from '../../../lib/aaFrictionDetect';
import type { AggressiveReason } from '../../../lib/aaFrictionDetect';
```

Phase 4 call site (line ~283):
```tsx
const check = detectAggressiveLoad(samples, {
  kg: kgInput,
  reps: repsInput,
  timestamp: Date.now(),
});
```

**Notă:** Current `detectAggressiveLoad(samples, newSet)` Phase 4 uses internal DEFAULT thresholds (NU pass-through cu `deriveThresholds(signals)` derived). Phase 6 task_07 = wire signals → thresholds → pass to call.

### B. Workout.tsx update — wire engine signals la call

```tsx
import { detectAggressiveLoad, deriveThresholds } from '../../../lib/aaFrictionDetect';
import { getEngineSignals } from '../../../lib/engineSignalsAggregate';

// În handleLogSet (line ~270):
function handleLogSet(rating: SetRating): void {
  bumpActivity();
  const samples = (history[safeExIdx] ?? []).map((h) => ({
    kg: h.kg, reps: h.reps, timestamp: h.timestamp ?? 0,
  }));
  const signals = getEngineSignals();
  const thresholds = deriveThresholds({
    vitalityScore: signals.vitalityScore,
    adherenceScore: signals.adherenceScore,
  });
  const check = detectAggressiveLoad(samples, {
    kg: kgInput,
    reps: repsInput,
    timestamp: Date.now(),
  }, thresholds);
  if (check.trigger && check.reason) {
    setAaReason(check.reason);
    setAaPendingRating(rating);
    setAaModalOpen(true);
    return;
  }
  performLogSet(rating);
}
```

### C. `src/react/lib/aaFrictionDetect.ts` signature update

Need verify Phase 5 `detectAggressiveLoad` signature accepts `thresholds` param. Dacă nu:
- Add optional 3rd arg `thresholds?: AggressiveThresholds = DEFAULT_THRESHOLDS`
- Backward compat preserved (existing callers pass 2 args still work cu DEFAULT)

### D. Tests `src/react/__tests__/lib/aaFrictionDetect.realsignals.test.ts`

```ts
- high vitality+adherence signals → laxer thresholds derived → trigger fewer cases
- low vitality+adherence signals → stricter thresholds derived → trigger more cases
- mid signals → DEFAULT thresholds (parity Phase 5 behavior)
- empty signals (T0 baseline 50/50) → DEFAULT thresholds preserved
- Workout.handleLogSet pass signals-derived thresholds end-to-end smoke
- detectAggressiveLoad 3rd arg accepted backward compat 2-arg call default
```

---

## §4 Acceptance criteria

- [ ] Workout.tsx `handleLogSet` wires `getEngineSignals()` → `deriveThresholds()` → 3rd arg `detectAggressiveLoad`
- [ ] `detectAggressiveLoad` accepts optional thresholds 3rd arg backward compat
- [ ] ZERO `deriveAdherenceFromStreak` helper (NU adăugat — task_08 wires real engine direct)
- [ ] ZERO referințe la inventate store fields `streakDays` / `sessionsLast30Days`
- [ ] Tests +6 minim PASS
- [ ] TS strict 0 errors

---

## §5 Commit message

```
refactor(react/screens): Workout.tsx wire engine signals to aaFriction thresholds

Phase 5 task_09 deriveThresholds + task_10 getEngineSignals wired end-to-end
în Workout.handleLogSet. detectAggressiveLoad accepts optional 3rd arg
thresholds (backward compat DEFAULT). Replaces implicit 50/50 baseline
pass-through cu real vitality/adherence-derived thresholds per-set.

NO new helper deriveAdherenceFromStreak (task_08 wires real getAdherenceScore
engine direct, eliminating Phase 5 baseline proxy în engineSignalsAggregate).
```

---

## §6 Next

task_08 Adherence Engine real wire în `engineSignalsAggregate.adherenceScore` field — replace Phase 5 BASELINE_ADHERENCE 50 proxy cu `getAdherenceScore()` engine output.
