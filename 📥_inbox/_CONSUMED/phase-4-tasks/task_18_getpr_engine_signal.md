# TASK 18 — getPRDelta Engine Signal Improvements

**Model:** Opus EXCLUSIVELY
**Phase:** 5 prepwork (engine deepen)
**Depends on:** task_10 LANDED (getPRDelta wired client + markPRHit propagation)
**Estimated touched files:** engineWrappers.ts getPRDelta enhance + tests
**Estimated new tests:** +8-15

---

## §0 Bugatti checklist pre-flight

- [ ] Phase 4 prior tasks LANDED
- [ ] Branch HEAD verde 4072+ PASS
- [ ] Backup tag `pre-phase4-task-18-2026-05-XX` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `src/react/lib/engineWrappers.ts` — current `getPRDelta` impl
3. `src/lib/engines/` SAU equivalent — existing PR detection logic (CC grep `prDetect` / `personalRecord` / `1RM`)
4. `DECISIONS.md` §D-LEGACY-076 Pipeline composition
5. `04-architecture/mockups/andura-clasic.html` grep `markPRHit` + PR detection logic verbatim

---

## §2 Spec exact

### A) getPRDelta engine signal real

Current task_10 impl: client-side max comparison (w * reps simple). Enhance:
- **1RM estimate:** use Epley/Brzycki formula pentru cross-rep comparison
- **PR types:** 'weight' (heaviest single set), 'volume' (total kg*reps in exercise across session), 'reps' (most reps at given weight)
- Return enriched delta object: `{ type, kg, reps, deltaKg, deltaPct, prevBest }`

### B) markPRHit propagation enhance

workoutStore markPRHit current accepts `{ exercise, deltaKg, type }`. Expand:
- Add `deltaPct: number` field
- Add `oneRMEstimate: number` field
- Backward compat default values (zero) pentru existing test calls

### C) PostSummary banner display data ready

Banner consumes prData from markPRHit. Phase 4 minimum: Trophy + exercise + deltaKg. Enrich data structure pentru Phase 5+ visual extension (task_22 banner enhance dependency).

---

## §3 Implementation hints

- **1RM formula:** Epley `weight * (1 + reps/30)` SAU Brzycki `weight * 36 / (37 - reps)`. CC pick + document choice in commit message.
- **Karpathy §3 surgical:** ZERO change Workout.tsx handleLogSet call site signature. markPRHit backward compat via optional new fields.
- **Pure function:** getPRDelta zero side effects (already).
- **Test edge cases:** zero history, single set, multi-rep PR, weight PR vs volume PR.

---

## §4 Tests vitest + RTL

- getPRDelta unit tests: weight PR detect, volume PR detect, 1RM cross-rep compare
- workoutStore markPRHit backward compat existing 38 Workout.test.tsx tests preserve
- New fields optional (deltaPct, oneRMEstimate) test coverage

---

## §5 Acceptance criteria

- [ ] getPRDelta returns enriched delta object
- [ ] 1RM estimate via Epley/Brzycki documented commit message
- [ ] PR types weight/volume/reps detected
- [ ] markPRHit deltaPct + oneRMEstimate optional fields
- [ ] +8-15 tests PASS
- [ ] 4072+ PASS aggregate preserved
- [ ] TS strict delta zero
- [ ] Backward compat existing call sites

---

## §6 Commit strategy

2-3 commits atomic:
1. `feat(react/lib): getPRDelta 1RM estimate + multi-PR-type detection`
2. `feat(react/store): markPRHit deltaPct + oneRMEstimate optional fields`
3. (optional) `test(react/lib): getPRDelta edge cases + 1RM cross-rep coverage`

---

## §7 Backup tag

```bash
git tag pre-phase4-task-18-2026-05-XX
git push origin pre-phase4-task-18-2026-05-XX
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope.

---

🦫 **task_18 getPRDelta engine signal improvements. 1RM estimate Epley/Brzycki. Multi-PR-type detect (weight/volume/reps). markPRHit enrichment Phase 5+ visual extension foundation. Pure function preserved. Backward compat 38 Workout.test.tsx baseline.**
