# TASK 10 — Engine Wire-Through (unblock Phase 3 stubs)

**Model:** Opus EXCLUSIVELY
**Phase:** 4 (first task post Phase 3 closure)
**Depends on:** Phase 3 LANDED milestone `phase-3-antrenor-landed-2026-05-17`
**Estimated touched files:** 3-5 (engineWrappers + consumers Workout/WorkoutPreview/PostRpe/PostSummary)
**Estimated new tests:** +15-30

---

## §0 Bugatti checklist pre-flight

- [ ] Phase 3 milestone tag verified `phase-3-antrenor-landed-2026-05-17`
- [ ] Branch HEAD verde 4048 PASS
- [ ] Backup tag `pre-phase4-task-10-2026-05-XX` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `DECISIONS.md` §D021 Phase 3 closure + §D-LEGACY-094 scheduleAdapter + §D-LEGACY-095 PR detection
3. `📥_inbox/_CONSUMED/phase-3-tasks/task_03_adapters.md` — engineWrappers contract reference
4. `📥_inbox/_CONSUMED/phase-3-tasks/task_04_antrenor_home.md` §4 issues — `getTodayWorkout` stub static documented
5. `📥_inbox/_CONSUMED/phase-3-tasks/task_09_post_rpe_summary.md` §4 issues — F11 PR banner stub + parseMeta regex
6. `📤_outbox/LATEST.md` (task_09 closure envelope §6 Phase 4 carry-forward backlog)

---

## §2 Spec exact

### A) `engineWrappers.getTodayWorkout()` wire real

Currently returns `PlannedWorkoutOutput | null` (null stub). Expose aggregate via scheduleAdapter (when ready) sau seed Phase 4 demo cu fixed Push session matching Workout.tsx WV2_EXERCISES.

Consumers refactor să consume rezultatul:
- `Workout.tsx` WV2_EXERCISES hardcoded → derive din `getTodayWorkout()`, fallback hardcoded cand null
- `WorkoutPreview.tsx` title + duration/volume estimates → derive din workout planned data
- `PostRpe.tsx` `lastSession.title` hardcoded "Push (piept si umeri)" → derive din planned
- `PostSummary.tsx` title display → derive din `lastSession.title` (already consumes, but ensures upstream wire correct)

### B) `engineWrappers.getPRDelta(exercise, set, history)` wire pe `Workout.logSet`

Currently consumer = `Antrenor` PRNotificationBanner stub conditional pe `workoutStore.prHit` (default false).

Wire-through:
- `Workout.tsx` `handleLogSet` apel `getPRDelta(exerciseId, currentSet, history)` post logSet, daca delta detected (>0 sau type='1RM-est'|'volume-PR') → invoke `workoutStore.markPRHit()`
- `markPRHit()` setter în workoutStore Phase 4+ (NEW action, sets `prHit: true` + optional `prData: {exercise, deltaKg, type}`)
- `PostSummary.tsx` F11 banner consumes `workoutStore.prHit` (deja conectat); banner copy expand cu prData details (Phase 4+ icon stays Trophy lucide)

### C) coachVoice `'transition'` rename evaluation

Currently `Workout.tsx` foloseşte `coachPick('endExercise', undefined, 0)` ca alias semantic pentru transition phase între exerciții (task_08 deviation spec §2 A).

Eval Phase 4:
- **Opțiune 1:** Rename `endExercise` → `transition` în `coachVoice.ts` union + lines + consumers
- **Opțiune 2:** Add `transition` category NEW (3 lines additive, similar `preview` task_05 pattern)
- **Opțiune 3:** Keep alias (no change)

Decizie tactical CC: pick opțiunea cu cel mai mic blast radius. Probable Opțiune 2 (additive) dacă `endExercise` are alți consumeri legit.

### D) `LastSessionSummary` interface refactor (carry-forward task_09 §4)

Currently `PostSummary.tsx` parseMeta regex stub (`/(\d+)\s+set/i` etc.) extract sets/dur/volume din display meta string. Brittle.

Refactor:
- Extend `LastSessionSummary` interface în `workoutStore.ts`: `{ title, meta, ts, sets, durationMin, volumeKg, prHit?, prData? }` (sets/duration/volume preserved separat de display string)
- `PostRpe.tsx` `finishSession` payload sets explicit numeric fields
- `PostSummary.tsx` consume numeric fields direct (eliminate parseMeta regex)
- Backward compat: parseMeta kept for transitional période (Phase 4 task complete migration)

---

## §3 Implementation hints

- Engine wire-through respect contract task_03 adapters; NU modify adapters fără justify
- coachVoice rename = scope amplu, evaluare blast radius primul
- Tests: cover delta cases — PR detected vs no PR + planned workout disponibil vs null fallback + meta numeric fields parsing migration
- Romanian no-diacritics + anti-paternalism preserved per Phase 3 invariants

---

## §4 Tests vitest + RTL (D020 paradigm)

Coverage delta:
- `engineWrappers.test.ts`: getTodayWorkout returns planned + null fallback (~5 tests)
- `Workout.test.tsx`: getPRDelta integration + markPRHit on PR detected (~8 tests)
- `PostSummary.test.tsx`: numeric fields direct consumption (~5 tests parseMeta migration)
- `coachVoice.test.ts`: transition category render (depending rename decizie) (~3 tests)

---

## §5 Acceptance criteria

- [ ] engineWrappers.getTodayWorkout wired la 4 consumers (Workout/WorkoutPreview/PostRpe/PostSummary)
- [ ] getPRDelta wired pe Workout.logSet → markPRHit → PostSummary F11 banner
- [ ] coachVoice 'transition' decision LOCKED (rename / additive / alias preserve)
- [ ] LastSessionSummary numeric fields refactor (parseMeta regex eliminated)
- [ ] vitest count +15-30 new tests within range
- [ ] TS strict compile delta zero (8 pre-existing preserved or fixed concurrent task_11)

---

## §6 Commit strategy

3-4 commits atomic:
1. `feat(react/lib): engineWrappers getTodayWorkout planned + null fallback wire`
2. `feat(react/lib): engineWrappers getPRDelta + workoutStore markPRHit on detection`
3. `refactor(react/store): LastSessionSummary numeric fields + PostSummary parse migration`
4. `feat(react/lib): coachVoice transition decision <rename|additive|preserve>`

---

## §7 Backup tag

```bash
git tag pre-phase4-task-10-2026-05-XX
git push origin pre-phase4-task-10-2026-05-XX
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope.

---

🦫 **task_10 Phase 4 engine wire-through. Unblock Phase 3 stubs (getTodayWorkout + getPRDelta + coachVoice transition + LastSessionSummary). Pure-function paradigm + Karpathy §3 surgical. Foundation pentru Phase 4 task_11+ tech debt + UI extraction + LOCK 9 safety.**
