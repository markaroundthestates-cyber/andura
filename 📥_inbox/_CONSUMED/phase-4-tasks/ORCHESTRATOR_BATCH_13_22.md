# ORCHESTRATOR BATCH — Phase 4 task_13 → task_22 (10 tasks sequential)

**Model:** Opus EXCLUSIVELY
**Phase:** 4 batch sequential autonomous
**Tasks:** 10 (task_13 SessionPill + task_14 LOCK 9 + task_15 Inactivity/WakeLock + task_16 Progres Tab + task_17 scheduleAdapter + task_18 getPRDelta engine + task_19 Calendar V1 + task_20 Nutrition LOCK 11 + task_21 Istoric Tab + task_22 PostSummary banner)
**Date seed:** 2026-05-17

---

## §0 Orchestrator policy

**Sequential execution cu fail-stop granular.** CC execute fiecare task standalone, atomic commits per task. Dacă orice task FAIL la acceptance criteria sau pre-commit hook → STOP imediat + raport partial state + Daniel review.

**Recovery granular:** fiecare task = independent backup tag pre-execute + atomic commits push origin per task. Rollback safe la orice nivel batch.

**Aggregate raport:** la final batch (toate 10 LANDED) → write `📤_outbox/LATEST.md` cu §1-§8 envelope agregat 10 task-uri. Per-task incremental archive `📤_outbox/_archive/2026-05/NN_<TASK>.md` per V6 protocol.

**Long-run autonomous:** Daniel plecat acasă, CC run continuu fără intermediate Daniel review. Wording discipline strict (CEO scope LOCK V1): mockup verbatim sau placeholder + raport §6 backlog.

---

## §1 Pre-batch baseline

- [ ] Branch HEAD verde 4072+ PASS (post task_12 closure baseline sau later if commits between)
- [ ] TS strict delta zero
- [ ] No uncommitted changes (`git status` clean)
- [ ] All 10 sketches present în `📥_inbox/phase-4-tasks/`:
  - [ ] task_13_sessionpill.md
  - [ ] task_14_lock9_aafriction.md
  - [ ] task_15_inactivity_wakelock.md
  - [ ] task_16_progres_tab.md
  - [ ] task_17_schedule_adapter.md
  - [ ] task_18_getpr_engine_signal.md
  - [ ] task_19_calendar_v1.md
  - [ ] task_20_nutrition_logging.md
  - [ ] task_21_istoric_tab.md
  - [ ] task_22_postsummary_banner.md

---

## §2 Sequence execution

Execute în ordine strict:

### Step 1: task_13 SessionPill global Layout portal

1. Read `📥_inbox/phase-4-tasks/task_13_sessionpill.md` complet
2. Execute §0-§8 spec autonomous
3. Verify §5 acceptance criteria ALL ✓
4. Verify 4072+ PASS post-commit
5. Move sketch la `📥_inbox/_CONSUMED/phase-4-tasks/task_13_sessionpill.md`
6. Continue Step 2

### Step 2: task_14 LOCK 9 aaFrictionModal safety wire

1. Read sketch complet
2. Execute §0-§8 spec autonomous
3. **WORDING DISCIPLINE:** mockup verbatim sau placeholder + raport §6 flag
4. Verify §5 acceptance criteria ALL ✓
5. Verify 4072+ PASS post-commit
6. Move sketch la `_CONSUMED/`
7. Continue Step 3

### Step 3: task_15 Inactivity watch + Wake lock visibility

1. Read sketch complet
2. Execute §0-§8 spec autonomous
3. Verify acceptance + tests
4. Move sketch + continue Step 4

### Step 4: task_16 Progres Tab Phase 4-5

1. Read sketch complet
2. Execute §0-§8 spec autonomous
3. **WORDING DISCIPLINE:** mockup verbatim sau placeholder + raport §6 flag
4. Verify acceptance + tests
5. Move sketch + continue Step 5

### Step 5: task_17 scheduleAdapter aggregate replace

1. Read sketch complet
2. Execute §0-§8 spec autonomous
3. Verify acceptance + tests (WV2_FALLBACK retired + empty state)
4. Move sketch + continue Step 6

### Step 6: task_18 getPRDelta engine signal improvements

1. Read sketch complet
2. Execute §0-§8 spec autonomous
3. Verify acceptance + tests
4. Move sketch + continue Step 7

### Step 7: task_19 Calendar V1 7-day strip Antrenor

1. Read sketch complet
2. Execute §0-§8 spec autonomous
3. **WORDING DISCIPLINE:** mockup verbatim sau placeholder
4. **PENDING CLARIFICATIONS FLAG §6:** Phase 4 defaults documented (no workout type labels, full-week edits, no validation) + Daniel CEO review needed
5. Verify acceptance + tests
6. Move sketch + continue Step 8

### Step 8: task_20 Nutrition Logging LOCK 11

1. Read sketch complet
2. Execute §0-§8 spec autonomous
3. **WORDING DISCIPLINE STRICT LOCK 11 pre-Beta:** mockup verbatim STRICT sau placeholder + raport §6 flag EXPLICIT
4. Verify acceptance + tests
5. Move sketch + continue Step 9

### Step 9: task_21 Istoric Tab Phase 5

1. Read sketch complet
2. Execute §0-§8 spec autonomous
3. **WORDING DISCIPLINE:** mockup verbatim sau placeholder
4. Verify acceptance + tests
5. Move sketch + continue Step 10

### Step 10: task_22 PostSummary banner extension

1. Read sketch complet
2. Execute §0-§8 spec autonomous
3. **WORDING DISCIPLINE:** mockup verbatim sau placeholder
4. Verify acceptance + tests
5. Move sketch + continue §3 final aggregate raport

---

## §3 Fail-stop policy

Dacă orice Step FAIL:
- **STOP imediat** (NU continue next task)
- **NU rollback automat** (preserve partial commits pentru Daniel inspect)
- **Write `📤_outbox/LATEST.md`** cu:
  - Status: **PARTIAL** (X/10 tasks LANDED, Y FAILED on step Z)
  - Last successful step + commit SHA
  - Failure details: which acceptance criterion failed sau error trace
  - Recovery suggestion: rollback tag SAU fix forward
- Exit batch

---

## §4 Final aggregate raport (toate 10 LANDED)

Write `📤_outbox/LATEST.md` cu standard envelope adaptat batch:

### Header

```
# LATEST CC — BATCH Phase 4 task_13 → task_22 (10 tasks LANDED)

Date: <today>
Tasks: 10
Model: Opus
Branch: feature/v3-react-clasic
Status: Complete | <N> commits total atomic | 4072+ PASS | Phase 4 10/10 batch sketches LANDED
```

### §0-§8 envelope agregat

Per-task ✓ checklists + commits + tests + modificări + issues + acceptance + next action + backup tags consolidated.

### §6 Carry-forward backlog post-batch

- Phase 6 Cont tab Tab 4 of 4
- Pre-Beta full smoke testing
- Daniel CEO wording review pre-Beta (aggregate WORDING BACKLOG din §6 per task)
- Calendar V1 pending clarifications Daniel decision
- Phase 5+ advanced features (charts trends per Istoric/Progres, food DB nutrition)

### §6 WORDING BACKLOG AGGREGATE EXPLICIT

Lista placeholder text-uri folosite + ce mockup section absent per task:
- task_14 LOCK 9: <items dacă any>
- task_16 Progres: <items dacă any>
- task_19 Calendar: pending clarifications 3 items Daniel CEO
- task_20 Nutrition LOCK 11: <items dacă any> — PRE-BETA SENSITIVE
- task_21 Istoric: <items dacă any>
- task_22 PostSummary: <items dacă any>

---

## §5 Anti-paternalism + Karpathy invariants batch-level

- **NU compose user-facing RO copy autonomous** (CEO wording scope LOCK V1)
- **Surgical refactor per task** (Karpathy §3) — ZERO drive-by improvements peste sketch scope
- **Atomic commits per task** — recovery granular
- **Per-commit vitest verde** — incremental safety net 4072+ PASS invariant
- **Romanian no-diacritics rule** all UI text
- **Mockup wv2 verbatim parity** styling + copy + behavior
- **Phase 4 MVP scope** per task — Phase 5+ enhancements explicit defer

---

🦫 **ORCHESTRATOR Phase 4 batch 10-task sequential autonomous. Fail-stop granular. Per-task atomic commits + backup tags. Aggregate raport final 📤_outbox/LATEST.md cu envelope adaptat batch + WORDING BACKLOG aggregate explicit. Long-run Daniel acasă — CC autonomous end-to-end fără intermediate review (LOCK V1 Co-CTO autonomy). Wording CEO scope STRICT pre-Beta sensitive task-uri (14 + 19 + 20). Phase 4 closure milestone: Antrenor Tab 1 ✓ + Progres Tab 2 ✓ + Istoric Tab 3 ✓ + Calendar V1 ✓ + Engine wire ✓ + Safety LOCK 9 ✓ + Nutrition LOCK 11 ✓.**
