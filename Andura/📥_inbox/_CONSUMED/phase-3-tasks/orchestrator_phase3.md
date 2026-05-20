# ORCHESTRATOR — Phase 3 Antrenor Tab Full Build

**Date:** 2026-05-16
**Branch:** `feature/v3-react-clasic`
**Baseline:** 3769 PASS @ `f2cf636` post handover ingest + `48b0b37` CLAUDE.md gut
**Goal:** Phase 3 Antrenor tab full screens — workout state machine + 8 sub-screens + post-rpe/summary + F2/F4/F6/F8/F10/F11 features parity mockup + backend `src/engine/*` integration
**Scope authority:** `ANDURA_PRIMER.md §6 Track 4 Phase 3` + `DECISIONS.md §D015 §D016 §D017 §D018 §D019 §D020`
**Model:** Opus EXCLUSIVELY (hardcode în fiecare task PROMPT)

---

## §0 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8 complete
2. `DECISIONS.md` head 50 + §D015 §D016 §D017 §D018 §D019 §D020 detail
3. `07-meta/karpathy-skills-ref/CLAUDE.md` §1-§4 (Think Before Coding + Simplicity First + Surgical Changes + Goal-Driven Execution)
4. `08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md` §0-§11
5. `04-architecture/mockups/andura-clasic.html` (DESIGN MASTER, grep per task)
6. Current React state: `src/react/routes/router.tsx` + `src/react/routes/Layout.tsx` + `src/react/routes/screens/antrenor/Antrenor.tsx` + `src/react/stores/appStore.ts` + `src/react/lib/navigation.ts`

---

## §1 Dependency graph

```
Phase A (solo, blocks all):
  task_01_routing_extend

Phase B (2 paralel, blocks Phase C):
  task_02_stores  ─┐
  task_03_adapters ┘

Phase C (6 paralel, all sub-screens + home):
  task_04_antrenor_home
  task_05_energy_flow      (EnergyCheck + EnergyCause + WorkoutPreview)
  task_06_problem_flow     (CevaNuMerge + PainButton)
  task_07_constraint_flow  (EquipmentSwap + AparateLipsa + ScheduleOverride)
  task_08_workout_state_machine
  task_09_post_rpe_summary
```

---

## §2 Run order recomandat

**Single terminal sequential (safe default):**
```
task_01 → task_02 → task_03 → task_04 → task_05 → task_06 → task_07 → task_08 → task_09
```

**Multi-terminal paralel (max throughput, Daniel concurrent capacity 2-3):**
```
Phase A: terminal_1 → task_01 (wait complete)

Phase B (open 2 terminale după task_01 LANDED):
  terminal_1 → task_02
  terminal_2 → task_03
  (wait both complete)

Phase C (open 3-6 terminale după task_02+03 LANDED, grupabili 2-3 batches):
  Batch 1 (3 paralel):
    terminal_1 → task_04
    terminal_2 → task_05
    terminal_3 → task_06
  (wait all 3 complete)

  Batch 2 (3 paralel):
    terminal_1 → task_07
    terminal_2 → task_08
    terminal_3 → task_09
  (wait all 3 complete)
```

**ZERO concurrent writes la same files** între tasks — fiecare task scope disjunct (verifică Spec section per task pentru file list).

---

## §3 Standard task envelope (fiecare task PROMPT respectă)

Fiecare `task_NN_*.md` conține:
- §0 Bugatti checklist pre-flight verde (vitest 3769+ PASS baseline confirm)
- §1 Backup tag mandatory: `pre-phase3-task-NN-2026-05-16` push origin ÎNAINTE write
- §2 Read order CC autonomous (PRIMER + DECISIONS + relevant mockup grep)
- §3 Spec exact (file paths + types + functions + persistence keys)
- §4 Implementation hints (mockup references grep landmarks)
- §5 Tests vitest + RTL (MemoryRouter jsdom per D020, NU createBrowserRouter în tests)
- §6 Acceptance criteria (verificable: tests PASS count delta + manual)
- §7 Commit strategy (atomic single-concern, conventional message)
- §8 Report format: scrie `📤_outbox/LATEST.md` §0-§N standard envelope

---

## §4 Cross-task invariants

- **Surgical touch:** ZERO refactor adjacent, ZERO improve-while-editing. Doar liniile care rezolvă request task.
- **Pure-function paradigm (ADR 026 §9 + Karpathy 4):** engines = pure, side-effects la I/O boundary (Zustand actions / route loaders / useEffect).
- **Romanian no-diacritics rule (D-LEGACY-064):** UI strings + tests + commits strip diacritice. Vault docs (acest fișier) păstrează diacritice OK.
- **Anti-paternalism ABSOLUTE (D-LEGACY-061):** engine = generic invariant, NU user-specific hardcoded. ZERO motivational language fabricated.
- **Force-typing ELIMINATED PERMANENT (D-LEGACY-010 §AMENDED):** ZERO forced confirms, ZERO mandatory typing flow.
- **Persona-aware variants (mockup `.persona-*`):** Maria gentle / Gigel default / Marius granular — port CSS classes la React conditional rendering.
- **Bugatti craft Quality > Speed:** refactor later NEVER happens. Peak craft first-pass acceptable cu iteration cheap dev backup+revert+redo.
- **Co-CTO autonomy LOCKED V1 PERMANENT:** ZERO Daniel review pre-Beta. Tactical decide singur via vault search → execute → validate post-LANDED.
- **Test paradigm split (D020):** sub-screen tests = MemoryRouter jsdom local fast. createBrowserRouter doar în prod build.

---

## §5 Failure strategy

- Pre-commit hook RED → STOP task, raport `📤_outbox/LATEST.md` §"Issues", NU `--no-verify` bypass.
- Test count NU crește (or scade) → STOP task, raport.
- TS exhaustive compile error → STOP task, fix surgical apoi continue.
- ZERO partial commit pe fail. ROLLBACK backup tag dacă state contaminat.
- Daniel notified via `📤_outbox/LATEST.md` Issues section.

---

## §6 Test paradigm split (per D020)

**Local jsdom tests (vitest + React Testing Library):**
- Folosesc `MemoryRouter` cu `initialEntries` prop pentru route state simulation.
- Import direct components, render izolat, query DOM, assert behavior.
- Pure-function units (stores, engineWrappers, coachVoice) = vitest pur fără jsdom.

**Production build:**
- `createBrowserRouter` data router prod (`src/react/routes/router.tsx`) — NU se invocă în tests.
- Node 25 AbortSignal mismatch react-router v6.28 data router fetch lifecycle → MemoryRouter jsdom evită mismatch.

---

## §7 Verify post-CC checklist per task

- [ ] Backup tag pushed origin ÎNAINTE write
- [ ] Atomic commits single-concern (1-3 commits per task max)
- [ ] Pre-commit hook verde per commit (vitest 3769+ + lint + typecheck)
- [ ] Test count delta ≥ 0 (preserved + new tests added per task)
- [ ] TS compile clean (exhaustive union check pe GotoScreen)
- [ ] No diacritics în UI strings + tests
- [ ] `📤_outbox/LATEST.md` raport §0-§N complete
- [ ] Push origin DONE
- [ ] Acceptance criteria per task §6 ALL ✓

---

## §8 Phase 3 acceptance gate (full)

Phase 3 closure când TOATE:
- task_01 → task_09 LANDED cu backup tags + atomic commits
- Antrenor home full features F2/F4/F6/F8/F10/F11 parity mockup
- Workout state machine functional cu pause/resume/discard/finish flow
- 8 sub-screens routable + functional (energy/cause/preview/ceva/pain/equip/aparate/schedule)
- Post-RPE + post-summary functional cu PR detection + streak update
- Backend `src/engine/*` integration via engineWrappers (Bayesian, Fatigue, Specialization, Mode Detection, PR, scheduleAdapter, weaknessDetector)
- Tests vitest local PASS count crescut cu +N (estimate +120-180 new tests)
- E2E Playwright NU ruleaza Phase 3 (defer Phase 8 Bugatti audit nuclear)
- `📤_outbox/LATEST.md` final summary Phase 3 complete
- `DECISIONS.md` D021 append (Phase 3 LANDED)
- Backup tag final `phase-3-antrenor-landed-2026-05-16` push origin
- Milestone tag `phase-3-antrenor-landed-2026-05-16` push origin

---

🦫 **Orchestrator Phase 3 Antrenor. Bugatti craft strict. Quality > Speed orizont 2-3 ani. ZERO timing argumente decizie. Sequential safe default + paralel max throughput Daniel choice.**
