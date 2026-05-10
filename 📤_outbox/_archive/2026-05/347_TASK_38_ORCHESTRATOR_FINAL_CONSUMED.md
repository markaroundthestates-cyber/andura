# TASK 38 — Mini Orchestrator FINAL Coordonator (Phase 1+2 Closure)

**Model:** Opus
**Velocity:** ~30-45h CC wall clock autonomous (toate ~37 tasks sequential 1→N + `/compact` insertion + fail-cluster mode)
**Cluster:** Phase 2 closure mini orchestrator FINAL
**Authority:** CURRENT_STATE §POINTERS chat ACASĂ post-noapte vault hygiene closure — orchestrator clusters CC strategy ~30-50 tasks artefacte separate + 1 mini orchestrator coordonator + `/compact` insertion + fail-cluster mode + 1 terminal continuous beginning→end

---

## §0 Pre-execution gate

**Verify toate ~37 tasks artefacte present în `📥_inbox/`:**

```bash
ls -la 📥_inbox/ | grep -E "task_(0[1-9]|[12][0-9]|3[0-7])" | wc -l
# Expected: 37 (task_01 ... task_37)

# Plus acest task_38 mini orchestrator artefact
ls -la 📥_inbox/task_38_orchestrator_final.md
```

Dacă count != 37 + 1 orchestrator → STOP escalate Daniel re-upload missing tasks.

---

## §1 Scope

Mini orchestrator FINAL coordonator citește toate ~37 tasks din `📥_inbox/` sequential 1→N + `/compact` insertion fiecare ~10 tasks + fail-cluster mode + raport `LATEST_CONSOLIDATED.md` aggregate end.

**Strategy CC autonomous 1 terminal continuous beginning→end:**

### Phase A — Tasks 01-10 (Cluster #1 Auth + Cluster #2 Onboarding inputs partial)
1. Read task_01_big6_hard_t0_clasic.md → execute §0-§5 → write raport task_01 LATEST.md → archive
2. Read task_02 → execute → archive
3. ... continuă sequential
4. Task 09 (closure Cluster #2)
5. Task 10 (1800 kcal — open Cluster #3)
6. **`/compact` insertion fresh context post Task 10**

### Phase B — Tasks 11-20 (Cluster #3 closure + Cluster #4 + Cluster #5)
7. Task 11-15 (Cluster #3 closure inclusiv Task 15 audit Phase 1 final)
8. Task 16-18 (Cluster #4 Istoric calendar)
9. Task 19-20 (Cluster #5 Setări BC dead closure)
10. **`/compact` insertion post Task 20**

### Phase C — Tasks 21-30 (Cluster #6 + #7 + #9)
11. Task 21-23 (Cluster #6 State bugs — DEPENDENCY: Task 22 needs Tasks 15+21 raports first)
12. Task 24-28 (Cluster #7 Glossary jargon LOCK V1)
13. Task 29-30 (Cluster #9 Text liber)
14. **`/compact` insertion post Task 30**

### Phase D — Tasks 31-37 (Standalone Q1 + 6 features recovery)
15. Task 31 (Q1 engine aggregator V2 19→7 grupes — engine refactor)
16. Task 32-37 (6 features recovery scope clarify atomic)
17. **`/compact` insertion post Task 37**

### Phase E — Closure raport + Auto-handover + CURRENT_STATE update (chat NEW startup ready)
18. Aggregate raport `📤_outbox/LATEST_CONSOLIDATED.md` — toate task statuses + commits + tests count + issues + NEED_CONTEXT items + Daniel smoke priority list
19. **AUTO-GENERATE handover §CC.5 fast narrativ post-orchestrator** ~50-100 LOC conversational ("prieten-revine-de-la-baie" style) — file `06-sessions-log/HANDOVER_<YYYY-MM-DD>_ORCHESTRATOR_PHASE1_PHASE2_LANDED.md`. Distil din LATEST_CONSOLIDATED → narrativ scurt (NU tabel, NU verbatim aggregate) cu:
    - Chat narrative summary (predecessor + chat-current orchestrator execution)
    - Mid-flight unresolved (NEED_CONTEXT items aggregate Tasks 21/26/27/28/29/31)
    - Daniel mood + dynamics (CC autonomous + commits chain status)
    - Cumulative LOCKED preserved
    - Tests baseline post-orchestrator (2731 → N count update)
    - Next chat priority order post-smoke
20. **AUTO-UPDATE `00-index/CURRENT_STATE.md`** cu state post-orchestrator:
    - §NOW compress precedent → moved-then-replaced
    - §JUST_DECIDED add chat-current orchestrator Phase 1+2 LANDED narrative
    - §POINTERS update mid-flight unresolved + carry-forward backlog
    - §ACTIVE_REFS update cu handover NEW path
21. **Commit chain final:**
    - `docs(orchestrator-closure): LATEST_CONSOLIDATED + handover §CC.5 + CURRENT_STATE update post Phase 1+2 LANDED`
    - Push origin/main
22. Archive task_38 (acest orchestrator) → `📤_outbox/_archive/<YYYY-MM>/<NN>_TASK_38_ORCHESTRATOR_FINAL_CONSUMED.md`

**Output Phase E final state:**
- ✅ `📤_outbox/LATEST_CONSOLIDATED.md` (Daniel review)
- ✅ `06-sessions-log/HANDOVER_<date>_ORCHESTRATOR_PHASE1_PHASE2_LANDED.md` (chat NEW ingest ready)
- ✅ `00-index/CURRENT_STATE.md` updated (chat NEW §CC.2 layered read prinde state post-orchestrator direct)
- ✅ All commits pushed origin/main

**Daniel chat NEW startup zero comenzi extra:** §CC.2 layered read mandatory standard prinde:
1. CURRENT_STATE.md proaspăt updated cu Phase 1+2 LANDED state
2. HANDOVER ACTIVE_REFS = handover NEW orchestrator LANDED path
3. Top 3 ADRs unchanged
4. DIFF_FLAGS P1 update dacă applicable

NU mai trebuie comandă "Update CURRENT_STATE per inbox handover" post-orchestrator — auto-done.

---

## §2 Fail-cluster mode invariant

**NU fail-stop atomic global** per Bugatti reset definition: end product perfect, NU process zero-error.

Per task fail:
1. Log fail în raport task respectiv (issues + reason)
2. **CONTINUE** Task next (NU halt)
3. Cluster fail (e.g. 2+ tasks în acelaș cluster fail) → flag în raport consolidate (Daniel decide post)
4. Critical fail (build break, tests massive regression) → STOP escalate Daniel

**Granular recovery post:** Daniel re-execută individual tasks failed via re-upload artefact specific.

---

## §3 Citation discipline §CC.4 invariant

Per task execution: citation `path:§` mandatory în raport (verify spec authoritative pre-flight grep + cite în commit messages + raport).

Anti-hallucination patterns active:
- Pre-flight grep §AR.1 mandatory per task
- ZERO claims fără citation `path:§`
- Uncertain → explicit "verific cu search" în raport

---

## §4 Output expected

### Per task:
- 1 commit atomic (sau multi-commit pentru engine refactor Task 31)
- Raport individual `📤_outbox/LATEST.md` overwrite per task (apoi archive `📤_outbox/_archive/<YYYY-MM>/<NN>_TASK_<NN>_<slug>_CONSUMED.md`)

### Final aggregate:
- `📤_outbox/LATEST_CONSOLIDATED.md` ~200-300 LOC summary toate ~37 tasks
- Commits chain ~37+ commits cumulative chain pushed origin/main
- Tests count update tracked (2731 → N final post Q1 engine refactor + scope cuts)
- Build PASS final
- Failures enumerated explicit (fail-cluster mode log)
- Daniel smoke test action items list (NEED_CONTEXT items + manual smoke priorities)

---

## §5 Estimated wall clock

- 37 tasks × ~15-25 min avg = **~9-15h CC wall clock active execution**
- Plus `/compact` insertion 4× = ~5-10 min each = **~20-40 min**
- Plus aggregate raport closure + auto-handover + CURRENT_STATE update Phase E = ~45-90 min
- **Total estimate: ~10-17h CC wall clock + 5h Daniel smoke test final = ~15-22h cumulative**

Daniel pattern overnight 8-10h × 2 nopți + 1 zi smoke = ~3 zile calendar realistic.

---

## §6 Raport closure format `📤_outbox/LATEST_CONSOLIDATED.md`

```
# PHASE 1+2 ORCHESTRATOR FINAL — CONSOLIDATED RAPORT

## Execution Summary
- Total tasks: 37
- Status: <Complete N/37 | Failed M/37 fail-cluster>
- Wall clock: <hours total>
- Tests baseline: 2731 → <N final>
- Build: PASS / FAIL
- Commits chain: <count + range SHA>
- Pushed: origin/main

## Per Cluster Summary

### Cluster #1 Auth wiring (Tasks 01-05) — Phase 1
- Status: <X/5 complete>
- Key changes: Big 6 hard T0 wiring cross-skin × 4 + ONBOARDING_SSOT doc sync

### Cluster #2 Onboarding inputs UI (Tasks 06-09) — Phase 1
- Status: <X/4 complete>
- Key changes: 6 templates V2 + Ceva nu merge merge + BF auto US Navy + Loghează kcal+proteine

### Cluster #3 Workflow + scope cuts (Tasks 10-15) — Phase 1
- Status: <X/6 complete>
- Key changes: 1800 kcal removal + Pain Button idle scos + Sport plan DROP + saveStepsQuick DROP + Antrenament liber DROP + Workflow audit

### Cluster #4 Istoric calendar (Tasks 16-18) — Phase 2
- Status: <X/3 complete>
- Key changes: Calendar layout + Range selector + Greutate+BF timeline + Photo progress

### Cluster #5 Setări BC dead (Tasks 19-20) — Phase 2
- Status: <X/2 complete>

### Cluster #6 State bugs (Tasks 21-23) — Phase 2
- Status: <X/3 complete>
- DEPENDENCIES: Task 22 needs Tasks 15+21 raports

### Cluster #7 Glossary jargon LOCK V1 (Tasks 24-28) — Phase 2
- Status: <X/5 complete>
- Replacements: RIR / TONAJ / Pace / Mărime / Comportament Familie

### Cluster #9 Text liber re-fix (Tasks 29-30) — Phase 2

### Standalone Q1 + 6 features recovery (Tasks 31-37) — Phase 2
- Q1 engine aggregator V2 19→7 grupes refactor
- 6 features recovery scope clarify (showWhyForExercise / PR Wall / Photo progress / Inactivity auto-pause / Wake lock / Schimbă fază manual override)

## Failures (fail-cluster mode log)
- <Task X failed: reason>

## NEED_CONTEXT_DANIEL clarification list aggregated
- <Task 21 9-clusters smoke list>
- <Task 27 Mărime disambiguation per instance>
- <Task 28 Comportament Familie functional meaning>
- <Task 29 edge cases Daniel adjust opinion>
- <Task 31 Q1 7 grupes list verify>
- <Other items per task NEED_CONTEXT flags>

## Daniel smoke test priority list
1. <P0 critical smoke 4 themes priority items>
2. <P1 manual UX walk-through>
3. <P2 polish post-Beta backlog>

## Theme Parity Invariant V1 final status
- 4/4 themes parity verified: <YES / partial>
- Omulețul Living Body Progres exception preserved unchanged
- Bugatti craft end product status: <gap analysis cumulative>

## Tests + Build final
- Tests: <2731 → N> (Q1 refactor impact + scope cuts)
- Build: PASS
- Commits: <range SHA cumulative>
- Pushed: origin/main verified

## Next action post-orchestrator

**Daniel chat NEW startup zero comenzi extra needed:**
- ✅ `📤_outbox/LATEST_CONSOLIDATED.md` review smoke priority list
- ✅ `06-sessions-log/HANDOVER_<date>_ORCHESTRATOR_PHASE1_PHASE2_LANDED.md` chat NEW ingest ready (auto-generated Phase E)
- ✅ `00-index/CURRENT_STATE.md` auto-updated post-orchestrator (chat NEW §CC.2 layered read prinde direct)

**Daniel actions post-orchestrator:**
- Daniel smoke test 4 themes per priority list LATEST_CONSOLIDATED
- NEED_CONTEXT items clarify în chat NEW (Daniel reply per task ambiguity)
- Phase 3 chat (dacă needed) follow-up violations + missed scope
```
