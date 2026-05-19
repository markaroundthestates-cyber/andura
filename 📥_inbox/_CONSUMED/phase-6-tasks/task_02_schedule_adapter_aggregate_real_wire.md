# task_02 — scheduleAdapterAggregate Real Wire (Option C big-bang async)

**Phase:** 6 (engine pipeline real wire)
**Type:** Refactor — React-side replace baseline cu engine pipeline real ASYNC + propagate 5 consumers + test rewrite
**Deps:** task_01 `scheduleAdapter.getDailyWorkout` exported clean `c64e692`
**Backup tag:** `pre-phase6-task-02-2026-05-18` (= `c64e692` clean post-revert)
**Est commits:** 4-7 atomic per consumer-cluster (invoca ORCHESTRATOR §2 clauza "multiple atomic single-concern IF spec §B explicit multi-block")
**Est tests delta:** rewrite ~100-130 assertions Phase 5 baseline → real engine output OR `await waitFor` post-loading; net delta +0..+15 (rewrite, NU pure add)
**Est durată CC:** 3-5h autonomous Opus
**Authority:** `DECISIONS.md §D027` STRATEGY LOCKED V1 (post Daniel Option C explicit "da facem C")

---

## §1 Context — De ce Option C

D027 §3 rationale verbatim:
- Engine pipeline ESTE async (~100-300ms calculate per `runPipeline` 8-adapter sequential strict). React consumers trebuie reflecte adevăr arhitectural, NU să-l ascundă cache facade.
- Cache facade Option B = datorie tehnică (invalidare bugs viitoare: date change midnight, log update, settings change).
- Bugatti audit nuclear Phase 8 pre-Launch = workaround-uri = red flags strict.
- Loading state "se incarca..." explicit = UX onest Maria 65 perceptibil cold flash phone slab Romania 3G.
- Orizont 2-3 ani = datorie crește exponențial dacă lași.

Anti-recurrence D027 §5: sketch §A folosește GREP PRIMARY-SOURCE evidence, NU memorie internă store shape. Slip D027 §5 codified: previous draft inventat `userProfile/exerciseWeights/profileTier/weeksElapsed` fields care **NU EXISTĂ** în `useWorkoutStore`.

---

## §2 Primary-source evidence verified

**`useWorkoutStore` actual slice fields** (grep `src/react/stores/workoutStore.ts` lines 78-91):
```
exIdx, setIdx, phase, prHit, prData, history, sessionStart, lastRating,
pausedSnapshot, lastSession, sessionsHistory, streak
```
NU EXISTĂ: `userProfile`, `exerciseWeights`, `profileTier`, `weeksElapsed`.

**`useOnboardingStore` actual slice fields** (grep `src/react/stores/onboardingStore.ts`):
```
data: { age, sex, goal, frequency, experience, weight }  // all nullable Big 6
completed, completedAt
```
USER PROFILE trăiește în `useOnboardingStore.data`, **NU** în `workoutStore`.

**`useNutritionStore` actual slice fields** (grep `src/react/stores/nutritionStore.ts`):
```
dailyLog: NutritionDailyEntry[]  // {dateISO, kcal, protein, ts}
```
NU EXISTĂ: `lastKnownTdee`.

**`getDailyWorkout(userState, now)` expects shape** (grep `src/coach/orchestrator/contextBuilder.js:42-58`):
```js
{
  user: object,                                  // V1 minimum required
  recentSessions: array,                         // defensive [] default
  weights: object,                               // defensive {} default
  profileTier: 'T0'|'T1'|'T2'|null,              // defensive null default
  flags: object,                                 // defensive {} default
  meta: object,                                  // defensive {} default
}
```
`buildEngineContext` defensive on missing — `Object.freeze`-d shallow per ADR 030 D3.

---

## §3 Scope changes

### A. `src/react/lib/scheduleAdapterAggregate.ts` (rewrite full)

```ts
// ══ SCHEDULE ADAPTER AGGREGATE — Phase 6 task_02 Real Wire Async ═════════
// Per DECISIONS.md §D027 Option C big-bang async migration. Phase 5 task_05
// PHASE_5_BASELINE_PUSH stub eliminated. Real pipeline invocation via
// scheduleAdapter.getDailyWorkout(userState, now) async. Returns null pe
// rest day OR pipeline hard halt OR thrown exception (D4 contract surface).

import { getDailyWorkout } from '../../engine/schedule/scheduleAdapter.js';
import { useWorkoutStore } from '../stores/workoutStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import type { PlannedExercise, PlannedWorkoutOutput } from './engineWrappers';

/**
 * Build minimal userState aggregate consumed de getDailyWorkout pipeline.
 * V1 conservative scope: user profile din onboardingStore.data (Big 6),
 * recentSessions din workoutStore.sessionsHistory. Restul fields defensive
 * empty — buildEngineContext defaults handle (per contextBuilder.js:42-58).
 *
 * Tier resolution Phase 6+ deferred — profileTier:null = engine downstream
 * fallback baseline T0 logic (defensive contract preserved).
 */
function buildUserStateForPipeline(): {
  user: object;
  recentSessions: ReadonlyArray<unknown>;
  weights: object;
  profileTier: null;
  flags: object;
  meta: object;
} {
  const onboardingData = useOnboardingStore.getState().data;
  const sessionsHistory = useWorkoutStore.getState().sessionsHistory;
  return {
    user: {
      age: onboardingData.age,
      sex: onboardingData.sex,
      goal: onboardingData.goal,
      frequency: onboardingData.frequency,
      experience: onboardingData.experience,
      weight: onboardingData.weight,
    },
    recentSessions: sessionsHistory ?? [],
    weights: {},
    profileTier: null,
    flags: {},
    meta: {},
  };
}

/**
 * Phase 6 task_02 real wire. Async pipeline consumer — caller (5 consumers
 * React) handles loading state via useState + useEffect pattern. Returns
 * null pe rest day OR pipeline hard halt OR thrown exception.
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
      exercises: (plan.exercises ?? []) as unknown as PlannedExercise[],
      volumeKg: plan.volumeKg || 0,
    };
  } catch (e) {
    console.warn('[scheduleAdapterAggregate] composePlannedWorkoutToday failed:', e);
    return null;
  }
}
```

**Eliminate complet:** `PHASE_5_BASELINE_PUSH` constant + `exerciseUsesEquipment` helper + `BASELINE_DURATION_MIN` + `BASELINE_VOLUME_KG` + `mapDateToIndex/getCalendarOverride/getMissingEquipment` imports (toate aceste responsabilități acum delegate la `getDailyWorkout` backend).

### B. `src/react/lib/engineWrappers.ts` — getTodayWorkout async signature

```ts
export async function getTodayWorkout(): Promise<PlannedWorkoutOutput | null> {
  try {
    return await composePlannedWorkoutToday();
  } catch (e) {
    console.warn('[engineWrappers] getTodayWorkout failed:', e);
    return null;
  }
}
```

### C. 5 Consumers propagare async — patterns explicit per file

**C.1 `src/react/components/SessionPill.tsx`** (sync call line ~62 în render body)

Before:
```tsx
const planned = getTodayWorkout();
const currentExerciseName = planned?.exercises[Math.min(exIdx, ...)]?.name ?? 'Sesiune';
```

After:
```tsx
const [planned, setPlanned] = useState<PlannedWorkoutOutput | null>(null);
useEffect(() => {
  let cancelled = false;
  getTodayWorkout().then((p) => { if (!cancelled) setPlanned(p); });
  return () => { cancelled = true; };
}, []);
const currentExerciseName =
  planned?.exercises[Math.min(exIdx, (planned?.exercises.length ?? 1) - 1)]?.name ?? 'Sesiune';
```

Pill behavior: durante loading `planned===null`, currentExerciseName='Sesiune' fallback OK (pill still renders cu fallback label). Empty state pill = NU bloochează critical UI (pill conditional `if (!active && !paused) return null` rămâne identic).

**C.2 `src/react/routes/screens/antrenor/Workout.tsx`** (useMemo line ~75 în render)

Before:
```tsx
const exercises = useMemo<readonly PlannedExercise[]>(() => {
  const planned = getTodayWorkout();
  return planned?.exercises ?? [];
}, []);
```

After:
```tsx
const [exercises, setExercises] = useState<readonly PlannedExercise[] | null>(null);
useEffect(() => {
  let cancelled = false;
  getTodayWorkout().then((p) => {
    if (!cancelled) setExercises(p?.exercises ?? []);
  });
  return () => { cancelled = true; };
}, []);
```

Loading state UI:
```tsx
if (exercises === null) {
  return <LoadingSkeleton testId="workout-loading" />; // Phase 5 task_19 component
}
const hasWorkout = exercises.length > 0;
// ...rest unchanged (empty state branch + main session UI)
```

3-state render: `null` → loading | `[]` → empty state (existing) | `[...]` → session UI (existing).

**C.3 `src/react/routes/screens/antrenor/WorkoutPreview.tsx`** (sync call line ~86 în render)

Before:
```tsx
const workout = getTodayWorkout();
const title = workout?.workoutTitle ?? 'Push (piept si umeri)';
const baseDuration = workout?.estimatedDuration ?? durationFor('normal');
const baseVolume = workout?.volumeKg ?? volumeFor('normal');
```

After:
```tsx
const [workout, setWorkout] = useState<PlannedWorkoutOutput | null | undefined>(undefined);
// undefined=loading | null=rest day | PlannedWorkoutOutput=loaded
useEffect(() => {
  let cancelled = false;
  getTodayWorkout().then((w) => { if (!cancelled) setWorkout(w); });
  return () => { cancelled = true; };
}, []);

if (workout === undefined) {
  return <LoadingSkeleton testId="workout-preview-loading" />;
}
// workout===null treated as fallback (preview still renders cu hardcoded
// fallback values — preview is reachable doar din energy-check, NU rest day path)
const title = workout?.workoutTitle ?? 'Push (piept si umeri)';
const baseDuration = workout?.estimatedDuration ?? durationFor('normal');
const baseVolume = workout?.volumeKg ?? volumeFor('normal');
// ...rest unchanged (intensityMod scaling)
```

**C.4 `src/react/routes/screens/antrenor/PostRpe.tsx`** (sync call line ~68 în event handler `handleSubmit`)

Before:
```tsx
function handleSubmit(rating: SessionRating): void {
  // ...
  const planned = getTodayWorkout();
  const title = planned?.workoutTitle ?? 'Push (piept si umeri)';
  // ...build exercises breakdown din planned.exercises[exIdx] name lookup
  finishSession({ title, meta, ts, sets, durationMin, volumeKg, exercises });
}
```

After:
```tsx
async function handleSubmit(rating: SessionRating): Promise<void> {
  // ...
  const planned = await getTodayWorkout();
  const title = planned?.workoutTitle ?? 'Push (piept si umeri)';
  // ...same breakdown logic, NO state migration needed (event handler)
  finishSession({ title, meta, ts, sets, durationMin, volumeKg, exercises });
  incrementStreak();
  navigate(gotoPath('post-summary'));
}
```

Button onClick wraps: `onClick={() => { void handleSubmit(opt.rating); }}` (void floating promise — onClick signature sync `() => void`). Simpler subset, NO React state.

**C.5 `src/react/lib/coachDirectorAggregate.ts:getCoachToday`** (sync call line ~38)

Before:
```ts
export function getCoachToday(opts: { isInCut?: boolean } = {}): CoachTodayOutput {
  const readiness = getReadiness(opts);
  const fatigue = getFatigue();
  const plannedWorkout = getTodayWorkout();
  const isRestDay = plannedWorkout === null;
  return { readiness, fatigue, plannedWorkout, isRestDay };
}
```

After:
```ts
export async function getCoachToday(opts: { isInCut?: boolean } = {}): Promise<CoachTodayOutput> {
  const readiness = getReadiness(opts);
  const fatigue = getFatigue();
  const plannedWorkout = await getTodayWorkout();
  const isRestDay = plannedWorkout === null;
  return { readiness, fatigue, plannedWorkout, isRestDay };
}
```

Consumer search needed: `getCoachToday` callers NU consumat de `Antrenor.tsx` (Antrenor folosește `getReadiness` + `getFatigue` direct line 30-31). Verify via grep dacă există alți callers; testat doar în `coachDirectorAggregate.test.ts`. Dacă zero call sites prod → doar test rewrite needed.

### D. Multi-commit budget atomic per consumer-cluster

Invoc ORCHESTRATOR §2 clauza explicit: "multiple atomic single-concern IF spec §B explicit multi-block". Split:

1. **Commit 1** `refactor(react/lib): scheduleAdapterAggregate Option C real wire async`
   - `scheduleAdapterAggregate.ts` rewrite full §3.A + drop PHASE_5_BASELINE_PUSH
   - Tests: `scheduleAdapterAggregate.realwire.test.tsx` NEW (+8-12 tests) — invokes getDailyWorkout via mocked schedule pipeline, rest day null path, pipeline halt null path, training day shape, volumeKg propagate, estimatedDuration propagate, intensityMod minus pe deload, empty userState defensive
   - Pre-commit verde

2. **Commit 2** `refactor(react/lib): engineWrappers.getTodayWorkout async signature propagate`
   - `engineWrappers.ts:getTodayWorkout` async §3.B
   - Tests: `engineWrappers.test.ts:getTodayWorkout` rewrite 5 assertions sync → `await getTodayWorkout()` async
   - Pre-commit verde

3. **Commit 3** `refactor(react/components+screens): SessionPill + PostRpe async migration`
   - `SessionPill.tsx` useState+useEffect §3.C.1
   - `PostRpe.tsx` async handleSubmit §3.C.4
   - Tests: `SessionPill.test.tsx` (verify count actual) `await waitFor` wrap + `PostRpe.test.tsx` `await user.click` plus pending finishSession assertion `await waitFor`
   - Pre-commit verde

4. **Commit 4** `refactor(react/screens): Workout.tsx async loading state + tests rewrite`
   - `Workout.tsx` useState+useEffect+LoadingSkeleton §3.C.2
   - Tests: `Workout.test.tsx` 46/53 rewrite — wrap render assertions cu `await waitFor` post-loading; baseline shape Phase 5 (`Bench Press`, `exerciseCount=5`, `volumeKg=12450`, `kg-input=22.5`, `reps-input=10`, `Set 1/4`) → real engine output divergent per day-of-week (verify actual real output via fixed `now` injection în test setup, e.g. `vi.setSystemTime(new Date('2026-05-18T08:00:00'))` Monday → PUSH session; document exact values discovered)
   - Pre-commit verde

5. **Commit 5** `refactor(react/screens): WorkoutPreview async migration + tests rewrite`
   - `WorkoutPreview.tsx` 3-state useState+useEffect §3.C.3
   - Tests: `WorkoutPreview.test.tsx` rewrite `await waitFor` cu real engine output; intensityMod scaling preserved baseline din real planned
   - Pre-commit verde

6. **Commit 6** `refactor(react/lib): coachDirectorAggregate.getCoachToday async signature`
   - `coachDirectorAggregate.ts:getCoachToday` async §3.C.5
   - Tests: `coachDirectorAggregate.test.ts` 6 async — `await getCoachToday()` wrap toate assertions
   - Pre-commit verde

7. **Commit 7 (conditional)** `refactor(react/screens): PostSummary.test.tsx indirect adapt`
   - PostSummary consumes `lastSession.exercises` care vine din PostRpe finishSession; daca PostRpe test data shape changed (real engine exercises names diferite de hardcoded `Bench Press`), PostSummary 39 assertions need update parallel
   - Doar daca commit 3 PostRpe test rewrite revelează cascade indirect; altfel skip

**Budget total 6-7 commits atomic single-concern. Backup tag `pre-phase6-task-02-2026-05-18` (= `c64e692`) deja exists. CC creates incremental tags per cluster on-demand sau push HEAD at task close.**

---

## §4 Acceptance criteria

- [ ] `composePlannedWorkoutToday()` async signature LANDED + uses real `getDailyWorkout(userState, now)`
- [ ] ZERO `PHASE_5_BASELINE_PUSH` constant references (deleted)
- [ ] `getTodayWorkout()` async signature propagated through engineWrappers.ts
- [ ] 5 consumers updated: SessionPill + Workout + WorkoutPreview + PostRpe + coachDirectorAggregate
- [ ] LoadingSkeleton fallback wired în Workout.tsx + WorkoutPreview.tsx loading state
- [ ] Tests rewritten cu `await waitFor` patterns + real engine output expected values (NU Phase 5 baseline hardcoded)
- [ ] TS strict 0 errors
- [ ] vitest run verde 4318+ PASS (delta +0..+15 acceptable; rewrite NU pure add)
- [ ] Pre-commit hook verde per fiecare commit atomic — ZERO `--no-verify` bypass

---

## §5 Test expected output baseline discovery

CC primul commit înainte de Workout.tsx test rewrite (commit 4): rulează **`getDailyWorkout` cu fixed now Monday + 8 AM** într-un mic script ad-hoc sau via repl `node -e` pentru a captura **exact** shape output real (workoutTitle, exerciseCount, sets, exercise names, targetReps, targetKg, volumeKg, estimatedDuration). Document discovered values în commit message body §5 comment + injectează în test fixtures noi.

Day-of-week → session type mapping per scheduleAdapter.js:
- L (Monday) → PUSH
- M (Tuesday) → PULL
- M2 (Wednesday) → UPPER_PICIOARE
- J (Thursday) → UMERI_BRATE
- V (Friday) → FULL_UPPER
- S (Saturday) → PUSH
- D (Sunday) → PULL

`sessionBuilder.buildSession(sessionType, sessionCtx)` produces exercises array — exact entries Phase 6 task_01 LANDED a wired pipeline.

---

## §6 Commit message template

```
refactor(react/lib): scheduleAdapterAggregate Option C real wire async

Per DECISIONS.md §D027 STRATEGY LOCKED V1 Option C big-bang async migration.
Replaces Phase 5 task_05 PHASE_5_BASELINE_PUSH stub (5 hardcoded exercises +
baseline duration 50min / volume 12450kg) cu real getDailyWorkout(userState,
now) async pipeline invocation per scheduleAdapter.js Phase 6 task_01.

buildUserStateForPipeline primary-source verified slice fields:
- user din useOnboardingStore.data (Big 6: age/sex/goal/frequency/experience/weight)
- recentSessions din useWorkoutStore.sessionsHistory
- weights/profileTier/flags/meta defensive empty (buildEngineContext defaults)

Drops PHASE_5_BASELINE_PUSH + exerciseUsesEquipment helper + BASELINE_*
constants + mapDateToIndex/getCalendarOverride/getMissingEquipment imports
(toate responsabilități acum delegate getDailyWorkout backend).

Closes commit 1/6 din Option C cluster (task_02). Async signature propagation
+ 4 consumers cluster + coachDirectorAggregate follow în commits 2-6.
```

---

## §7 Next

Post task_02 LANDED → CC verify hallucination risk task_03-24 pre-relansare BATCH (D027 §3 next chat instruction §3):
- high-risk task_06 patterns banner data shape (PatternsBanner store consumption)
- high-risk task_22 + task_23 dashboard data sources (sessionsHistory + nutritionStore aggregate)
- low-risk Cont sub-screens (mockup verbatim parity, no store invention)

Apoi relansare BATCH din task_03 (engineWrappers BN async wrapper real wire).
