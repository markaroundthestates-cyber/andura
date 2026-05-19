# TASK 17 — scheduleAdapter Aggregate Replace PHASE_4_DEMO_PUSH (engine wire real)

**Model:** Opus EXCLUSIVELY
**Phase:** 4 → 5 boundary (engine wire-through)
**Depends on:** task_10 LANDED (engineWrappers.getTodayWorkout wire client + WV2_FALLBACK Workout.tsx)
**Estimated touched files:** engineWrappers.ts modify + Workout.tsx WV2_FALLBACK remove + scheduleAdapter lib NEW sau modify + tests
**Estimated new tests:** +10-20

---

## §0 Bugatti checklist pre-flight

- [ ] Phase 4 prior tasks LANDED
- [ ] Branch HEAD verde 4072+ PASS
- [ ] Backup tag `pre-phase4-task-17-2026-05-XX` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `src/react/lib/engineWrappers.ts` — current `getTodayWorkout` stub/impl
3. `src/lib/engines/scheduleAdapter.ts` SAU `src/engines/` — existing schedule infrastructure (CC grep)
4. `src/react/routes/screens/antrenor/Workout.tsx` — WV2_FALLBACK current usage
5. `DECISIONS.md` §D-LEGACY-027 Energy + §D-LEGACY-029 Adherence (compose pipeline reference)
6. `04-architecture/mockups/andura-clasic.html` grep `PHASE_4_DEMO_PUSH` references

---

## §2 Spec exact

### A) `engineWrappers.getTodayWorkout` real wire

Replace stub/demo with real engine pipeline call:
- Call `scheduleAdapter.getDailyWorkout(userId, dateISO)` SAU equivalent engine
- Compose Energy Adjustment + Adherence Engine (per D-LEGACY-027 + 029)
- Return `{ exercises: PlannedExercise[] }` cu real engine output
- Fallback null dacă engine throw / DB unavailable (preserve task_10 pattern)

### B) Workout.tsx WV2_FALLBACK retire

Remove WV2_FALLBACK demo constant. `getTodayWorkout()` returns null → Workout.tsx renders empty state "Nu ai antrenament programat azi" (mockup verbatim sau placeholder).

CC verify mockup empty state copy — placeholder + flag §6 dacă absent.

### C) scheduleAdapter lib improvements (if needed)

Verify scheduleAdapter aggregate function exists + matches PlannedExercise interface. Adjust signatures dacă mismatch.

---

## §3 Implementation hints

- **Karpathy §3 surgical:** ZERO refactor engines existing logic. Wire-through only.
- **Backward compat:** existing tests using getTodayWorkout stub may need mock setup adjust.
- **Empty state UX:** CEO wording scope — placeholder text dacă mockup absent.
- **Engine pipeline:** scheduleAdapter is composite (Adherence + Energy + Vitality signals). NU re-implement engines — call existing.
- **Romanian no-diacritics** any new UI copy.

---

## §4 Tests vitest + RTL

- engineWrappers.getTodayWorkout mock real return + null + throw scenarios
- Workout.tsx renders empty state cand getTodayWorkout returns null
- Workout.tsx renders real exercises cand engine returns workout
- Existing 38 Workout.test.tsx baseline preserve

---

## §5 Acceptance criteria

- [ ] WV2_FALLBACK removed Workout.tsx
- [ ] getTodayWorkout calls real scheduleAdapter pipeline
- [ ] Empty state rendered cand null result
- [ ] +10-20 tests PASS
- [ ] 4072+ PASS aggregate preserved
- [ ] TS strict delta zero
- [ ] Romanian no-diacritics

---

## §6 Commit strategy

2-3 commits atomic:
1. `feat(react/lib): engineWrappers.getTodayWorkout real scheduleAdapter wire`
2. `refactor(react/antrenor): Workout retire WV2_FALLBACK + render empty state`
3. (optional) `test(react/antrenor): Workout empty state + engine wire coverage`

---

## §7 Backup tag

```bash
git tag pre-phase4-task-17-2026-05-XX
git push origin pre-phase4-task-17-2026-05-XX
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope + §6 WORDING BACKLOG dacă empty state placeholder.

---

🦫 **task_17 scheduleAdapter aggregate wire real. Retire WV2_FALLBACK Phase 4 demo constant. Engine pipeline live (Adherence + Energy + Vitality compose). Empty state Workout NEW UX. Phase 4→5 boundary milestone — Antrenor primary tab moves from demo seed la engine-driven real workout schedule.**
