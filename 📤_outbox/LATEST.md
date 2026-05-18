# Phase 6 ORCHESTRATOR — Fail-Stop §5 Issue Report

**Date:** 2026-05-18 chat batch 24-task autonomous run
**Branch:** `feature/v3-react-clasic`
**HEAD:** `c64e692` (Phase 6 task_01 LANDED clean)
**Tests:** 4318 PASS / TS 0 errors (baseline post task_01 preserved)
**Status:** STOPPED mid-task_02 per ORCHESTRATOR §5 protocol — `git restore` reverted all task_02 mutations, working tree clean

---

## §0 Tasks landed

| # | Task | SHA | Tests delta | Backup tag |
|---|------|-----|-------------|------------|
| 01 | `scheduleAdapter.getDailyWorkout` consumer runPipeline 8 adapters | `c64e692` | +15 (4303→4318) | `pre-phase6-task-01-2026-05-18` |

§1.A precedent (`810c783` deloadAdapter 8/8 ULTIM) + Phase 6 task_01 = engine pipeline TOTAL real wire backend-side §42.10 COMPLETE. Consumer `scheduleAdapter.getDailyWorkout` invokes `runPipeline` 8 adapters + delegates sessionBuilder. Tests 15/15 PASS (rest day, training day, hard halt, blueprint aggregate, sessionBuilder delegate, equipment filter, defensive null/undefined/empty userState).

## §1 Task_02 fail diagnosis (Bugatti craft strict halt)

Sketch acceptance criteria #3 + #4:
- `getTodayWorkout()` async signature propagated
- Workout + WorkoutPreview + Antrenor home consumers updated cu loading state

Scope substantially exceeds sketch coverage. Direct + transitive consumers of `getTodayWorkout`:
- `src/react/components/SessionPill.tsx:62` (sync render-time call)
- `src/react/routes/screens/antrenor/Workout.tsx:75` (`useMemo` sync call)
- `src/react/routes/screens/antrenor/WorkoutPreview.tsx:86` (sync render-time call)
- `src/react/routes/screens/antrenor/PostRpe.tsx:68` (mid-handler sync call)
- `src/react/lib/coachDirectorAggregate.ts:38` (`getCoachToday` composer, sync)

**Tests directly affected (sketch undercount):**

| Test file | Failure cause | Tests broken |
|-----------|---------------|--------------|
| `src/react/__tests__/lib/engineWrappers.test.ts` | 5 tests hardcode Phase 5 baseline shape (`'Bench Press'`, `exerciseCount=5`, `volumeKg=12450`) — real pipeline returns `'Lat Pulldown'`/`'Cable Row'` per day-of-week mapping with `volumeKg=0` V1 default | 5/5 of getTodayWorkout describe |
| `src/react/__tests__/lib/coachDirectorAggregate.test.ts` | Mock `vi.fn(() => {...})` sync; needs `Promise.resolve(...)`; all `it` async + await | 5/6 |
| `src/react/__tests__/screens/antrenor/Workout.test.tsx` | 53 tests hardcode `'Bench Press'`, `'Ex 1/5'`, `'Set 1/4'`, `kg-input=22.5`, `reps-input=10` — real PUSH template emits 6 different exercises sets=3 not 4, default targetKg=20 not 22.5; PLUS 50+ tests need `await waitFor` post-loading-state | 46/53 verified failing in dry-run |
| `src/react/__tests__/screens/antrenor/WorkoutPreview.test.tsx` | Mock pattern sync→async; 1 mock line | minimal cascades |
| `src/react/__tests__/screens/antrenor/Antrenor.test.tsx` | Mock pattern sync→async | minimal |
| `src/react/__tests__/screens/antrenor/PostSummary.test.tsx` (39 tests) | Indirect via session breakdown using `planned.exercises` | not verified yet |
| `src/react/__tests__/components/SessionPill.test.tsx` | Mock pattern sync→async | minimal |

**Total impact estimate:** ~80-120 test assertions to rewrite — many asserting hardcoded Phase 5 baseline values that diverge from real pipeline output. Plus 5 consumer components require sync→async refactor (useEffect+useState) plus loading state copy + tests.

Materially beyond §B sketch scope ("Phase 5 task_05 PHASE_5_BASELINE_PUSH stub replaced cu getDailyWorkout"). Sketch §C noted "Verify actual signature; adjust call shape" for sessionBuilder — but the cascading async signature impact on React consumers + test surface was NOT scoped.

## §2 What was attempted (since reverted)

Dry-run partial implementation (`git restore` reverted all 12 modified files):
1. Rewrote `src/react/lib/scheduleAdapterAggregate.ts` — deleted `PHASE_5_BASELINE_PUSH`, made `composePlannedWorkoutToday` async, wired `getDailyWorkout`, added `buildUserStateForPipeline` reading `useOnboardingStore.data` + `useWorkoutStore.sessionsHistory` (stores `userProfile`/`exerciseWeights`/`profileTier`/`weeksElapsed` referenced în sketch §A do NOT exist — adapted to actual stores)
2. Made `getTodayWorkout()` async in `engineWrappers.ts`
3. Updated 5 consumers (SessionPill / Workout / WorkoutPreview / PostRpe / coachDirectorAggregate) cu `useState<PlannedWorkoutOutput|null>` + `useEffect` async resolve pattern
4. Updated `coachDirectorAggregate.test.ts` (6 tests rewritten async)
5. Updated `engineWrappers.test.ts` getTodayWorkout describe block (5 tests rewritten — shape-only assertions)
6. Updated `Antrenor.test.tsx` + `WorkoutPreview.test.tsx` mocks (sync→async)
7. Started updating `Workout.test.tsx` empty-state cluster (3 tests added `await waitFor`)

Vitest dry run after partial migration:
- `engineWrappers.test.ts`: 0/5 getTodayWorkout tests passing (had not yet been updated — Phase 5 baseline assertions)
- `coachDirectorAggregate.test.ts`: passing after rewrite
- `Workout.test.tsx`: **46/53 tests failing** (loading-state guard + hardcoded baseline assertions)

Per ORCHESTRATOR §5 ("STOP batch — NU continua task urmatorul"): halted before commit; `git restore` reverted all 12 modified files to clean HEAD (`c64e692`). Note: `git reset --hard <backup-tag>` blocked by local permission settings → fallback `git restore` per-file (semantically equivalent for tracked file revert).

## §3 Root cause — sketch under-scope

Sketch treats task_02 as a single-file refactor (`scheduleAdapterAggregate.ts` + 1 commit). In reality it's a **cross-cutting async-signature migration** that ripples through:
- 5 React consumer components (sync render-time → useState/useEffect loading)
- 6+ test files (sync mocks → async mocks + waitFor patterns)
- ~80-120 hardcoded test assertions tied to Phase 5 baseline exercise data (real pipeline returns different exercises/sets/kg values per day-of-week)

§2 Atomic commit discipline ("1 task = 1 commit cumulative SAU multiple atomic single-concern commits IF spec §B explicit multi-block") — sketch §B is a single block, so atomic single commit expected. Yet scope demands multi-block treatment, OR splitting.

## §4 Recommendations Daniel fresh chat

**Option A — Split task_02 into 3-4 sub-tasks:**
- task_02a — scheduleAdapterAggregate async + Workout.tsx consumer + Workout test full rewrite (sets=3 not 4, target* defaults differ from baseline, loading state in 50+ tests)
- task_02b — WorkoutPreview consumer + tests
- task_02c — SessionPill / PostRpe consumers + tests
- task_02d — coachDirectorAggregate + engineWrappers tests rewrite

Update ORCHESTRATOR.md inbox before re-running.

**Option B — Reduce task_02 scope: sync-cached facade pattern.** Implementation:
- Module-level `cache = new Map<dateKey, PlannedWorkoutOutput | null>`
- `composePlannedWorkoutToday(now)` SYNC — returns `cache.get(dateKey)` if present; on miss kicks off background `getDailyWorkout(...)` via fire-and-forget + populates cache; returns last-known cache value (null on cold)
- Expose `prewarmComposeToday(now)` async for app-startup eager warm (Layout root effect)
- ALL existing consumers + tests retain sync contract → ZERO cascade
- `PHASE_5_BASELINE_PUSH` deleted ✅
- Trade-off: first render shows null until cache warm; UX skeleton already exists Phase 5 task_19
- engineWrappers.test.ts getTodayWorkout tests: rewrite 5 tests for new shape (baseline → pipeline output) — bounded ~30min work

**Option C — Accept big-bang async migration as 1 task** but allocate multiple commits within task_02 + budget ~3-5h for test rewrites. Update sketch ACK to enumerate cascade explicitly.

Co-CTO recommendation: **Option B** — sync-cached facade. Achieves "real engine wire" goal without invasive sync→async propagation through React tree + test surface. Aligns Karpathy §3 surgical (minimum mutation surface). Matches sketch §C "Verify actual signature; adjust call shape conform existing export" precedent for buildSession adaptation.

## §5 Backup tags pushed origin

- `pre-phase6-task-01-2026-05-18` (origin)
- `pre-phase6-task-02-2026-05-18` (origin) ← reset target IF Daniel chooses git reset; current HEAD `c64e692` is exactly this tag

## §6 Task 01 intermediate report archived

`📤_outbox/_archive/2026-05/01_TASK_01.md` — Phase 6 task_01 LANDED raport (15 tests +, TS 0 errors, scheduleAdapter.getDailyWorkout consumer 8-adapter pipeline + sessionBuilder delegate, deviation note pe buildSession signature adaptation).

## §7 Phase 7 carry-forward (post-batch resolution)

Once task_02 scope-resolved + remaining 22 tasks landed: Daniel Gates smoke production + Bugatti audit nuclear pre-Launch path per ORCHESTRATOR §8.

---

🦫 **Fail-stop §5 protocol honored: NU partial commits, NU `--no-verify` bypass, NU skip teste. Bugatti craft strict. Daniel intervene fresh chat → analyze + decide §4 options.**
