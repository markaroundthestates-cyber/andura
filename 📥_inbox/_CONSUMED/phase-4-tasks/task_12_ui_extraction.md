# TASK 12 — UI Extraction Workout 5 Sub-Components (pure refactor)

**Model:** Opus EXCLUSIVELY
**Phase:** 4 (third task post Phase 3 closure)
**Depends on:** task_10 + task_11 LANDED (Phase 4 sketches 2/2 consumed)
**Estimated touched files:** 1 modify Workout.tsx + 5 NEW component files + optional 5 NEW component test files
**Estimated new tests:** 0 minimum (existing 31 Workout tests preserve) — optional +5-15 light component-focused unit tests

---

## §0 Bugatti checklist pre-flight

- [ ] Phase 3 milestone tag verified `phase-3-antrenor-landed-2026-05-17`
- [ ] Branch HEAD verde 4072 PASS (post task_11 closure baseline)
- [ ] Backup tag `pre-phase4-task-12-2026-05-XX` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `DECISIONS.md` §D021 Phase 3 closure + §D020 test paradigm split MemoryRouter
3. `src/react/routes/screens/antrenor/Workout.tsx` — current monolitic ~350 LOC source
4. `src/react/__tests__/screens/antrenor/Workout.test.tsx` — 31 existing tests (must preserve green post-refactor)
5. `📥_inbox/_CONSUMED/phase-3-tasks/task_08_workout_state_machine.md` §B — sub-components list verbatim spec
6. `📤_outbox/LATEST.md` (task_11 closure envelope §6 carry-forward backlog)

---

## §2 Spec exact

**Pure refactor — ZERO behavior change.** Extract 5 sub-zones din `Workout.tsx` în `src/react/components/Workout/` ca standalone components. SessionPill (6th per spec §B) deferred task_13 = feature add separate concern (NU mix refactor + feature Karpathy §3).

### A) 5 sub-components extract

1. **`SessionTimer.tsx`** — header zone (current Workout.tsx ~lines 196-222)
   - Props: `{ exerciseName: string, exIdx: number, totalExercises: number, elapsedSec: number, onExit: () => void }`
   - Renders sticky header cu workout title + Ex N/M + elapsed MM:SS + X close button
   - Pure presentational — `formatMMSS` helper inline sau extract la `src/react/lib/format.ts` shared

2. **`RestOverlay.tsx`** — phase=rest fixed overlay (current ~lines 244-265)
   - Props: `{ countdownSec: number, onSkip: () => void }`
   - Renders countdown timer + Sari pauza button
   - Pure presentational — `formatMMSS` reuse

3. **`SetLogInput.tsx`** — kg/reps inputs zone (current ~lines 178-205)
   - Props: `{ kg: number, reps: number, onKgChange: (n: number) => void, onRepsChange: (n: number) => void }`
   - Renders 2 controlled number inputs cu labels
   - Pure presentational

4. **`SetRatingButtons.tsx`** — 3-button rating (current ~lines 213-237)
   - Props: `{ onRate: (rating: 'usor' | 'potrivit' | 'greu') => void }`
   - Renders 3 buttons Usor/Potrivit/Greu cu data-rating attribute preserved
   - Pure presentational
   - Import `SetRating` type din `workoutStore` SAU define local `'usor' | 'potrivit' | 'greu'` literal union

5. **`ExitConfirmSheet.tsx`** — bottom sheet 3-option (current ~lines 290-330)
   - Props: `{ open: boolean, exIdx: number, totalExercises: number, onChoose: (action: 'continue' | 'pause' | 'discard') => void }`
   - Renders fixed backdrop + bottom sheet cu 3 buttons + dynamic progress copy
   - Pure presentational — `open` flag conditional render (NU `if (!open) return null` outside JSX, păstrăm pattern current Workout.tsx)

### B) Workout.tsx refactor consume

- Replace inline JSX cu component imports + props passing
- State machine logic (handleLogSet / handleSkipRest / handleExit) preserved în parent
- All useEffects preserved în parent
- All workoutStore selectors preserved în parent
- ~350 LOC → expected ~150-180 LOC parent + 5 small components

### C) Test paradigm

**Existing 31 Workout.test.tsx tests MUST stay green post-refactor.** Asta e contract = empirical proof zero behavior change.

Optional light component-focused unit tests (1-3 per component, ~5-15 total):
- SessionTimer: renders title + progress + elapsed format
- RestOverlay: renders countdown MM:SS + skip click → onSkip called
- SetLogInput: kg/reps controlled inputs onChange dispatches
- SetRatingButtons: 3 buttons cu data-rating + click dispatches correct rating
- ExitConfirmSheet: `open=false` renders null OR backdrop absent + 3 button clicks dispatch correct action

**Decision tactical CC:** add light tests if straightforward, skip dacă duplicate cu Workout.test.tsx existing coverage. Spec §4 framing optional.

---

## §3 Implementation hints

- **Surgical refactor (Karpathy §3):** zero adjacent improvements, zero "while we're here" cleanups. Doar copy JSX → component + props wire.
- **Pure-function paradigm:** all 5 components stateless presentational, ZERO hooks (no useState/useEffect/useStore selectors). State + side effects rămân în parent Workout.tsx.
- **Type imports:** `SetRating` reuse via `import type { ExerciseHistoryEntry } from '../../stores/workoutStore'` then `type SetRating = ExerciseHistoryEntry['rating']` SAU define local — CC pick smallest blast radius.
- **`formatMMSS` helper:** currently inline Workout.tsx. Option A extract `src/react/lib/format.ts` shared (used SessionTimer + RestOverlay) + Phase 5+ reusable. Option B duplicate inline both components (ugly). LOCK Option A — single source pure helper.
- **data-testid preserved:** all existing test selectors (workout-title / kg-input / rating buttons / rest-countdown / exit-sheet etc.) MUST render unchanged post-extract. Asta = baseline 31 tests preserve.
- **Romanian no-diacritics rule preserved** (Phase 3 invariant).
- **NU touch `getPRDelta` / `markPRHit` wire** — Phase 4 task_10 LANDED logic stays în parent handleLogSet untouched.
- **NU add `SessionPill`** — defer task_13 (feature add, NU refactor; Karpathy §3 single-concern).

---

## §4 Tests vitest + RTL (D020 paradigm)

### Baseline preserve

- `src/react/__tests__/screens/antrenor/Workout.test.tsx` 31 tests = MUST PASS unchanged post-refactor
- 4072 PASS aggregate = MUST PASS unchanged

### Optional light component tests (CC decide)

```typescript
// src/react/__tests__/components/Workout/SessionTimer.test.tsx (~3 tests)
describe('SessionTimer', () => {
  it('renders exercise name + progress + elapsed MM:SS', () => { /* ... */ });
  it('X button click dispatches onExit', () => { /* ... */ });
  it('elapsed 65 sec formats 1:05', () => { /* ... */ });
});

// Similar pattern restul 4 components — straightforward props + render assertions
```

Test paradigm: MemoryRouter NU needed (components NU consume useNavigate / useLocation). Plain `render(<Component {...props} />)` sufficient.

---

## §5 Acceptance criteria

- [ ] 5 NEW component files created în `src/react/components/Workout/`
- [ ] Workout.tsx refactored consume 5 components (parent thin, ~150-180 LOC expected)
- [ ] All 31 existing Workout.test.tsx tests PASS unchanged (zero regression)
- [ ] 4072 PASS aggregate preserved (sau +5-15 if light component tests added)
- [ ] TS strict compile delta zero (zero new errors)
- [ ] Romanian no-diacritics rule preserved
- [ ] `formatMMSS` extracted `src/react/lib/format.ts` shared (used 2+ components)
- [ ] SessionPill (6th spec §B item) NOT included = deferred task_13 explicit

---

## §6 Commit strategy

5-7 commits atomic:
1. `refactor(react/lib): extract formatMMSS helper la src/react/lib/format.ts`
2. `refactor(react/antrenor): extract SessionTimer sub-component`
3. `refactor(react/antrenor): extract RestOverlay sub-component`
4. `refactor(react/antrenor): extract SetLogInput sub-component`
5. `refactor(react/antrenor): extract SetRatingButtons sub-component`
6. `refactor(react/antrenor): extract ExitConfirmSheet sub-component`
7. (optional) `test(react/components/Workout): light component-focused unit tests`

Per-commit invariant: vitest 4072+ PASS post-commit (incremental safety net).

---

## §7 Backup tag

```bash
git tag pre-phase4-task-12-2026-05-XX
git push origin pre-phase4-task-12-2026-05-XX
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope.

---

🦫 **task_12 UI Extraction Workout 5 sub-components pure refactor. Karpathy §3 surgical (ZERO behavior change empirical proof = 31 baseline tests preserve green). Defer SessionPill task_13 = feature add separate concern. Foundation pentru Phase 4+ LOCK 9 aaFrictionModal safety wire pe arhitectură curată (small components easier wire than monolith). Pure-function paradigm + presentational components stateless. `formatMMSS` shared helper Phase 5+ reusable.**
