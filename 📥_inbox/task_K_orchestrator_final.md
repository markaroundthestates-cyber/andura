═══ START PROMPT CC ORCHESTRATOR FINAL ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 INSTRUCȚIUNE GLOBALĂ
Citește sequențial task_A → task_J din `📥_inbox/`. Pentru fiecare task:
1. Pre-flight grep MANDATORY paths + ADRs din §0 task
2. Apply §1 scope + §2 files + §3 acceptance criteria
3. Backup tag §4 ÎNAINTE de modificare
4. Tests preserved 2731+ PASS verify post-task
5. Build clean ~4s verify
6. Commit §5 + push origin feature/phase-3-orchestrator-final
7. Raport §6 în `📤_outbox/_archive/2026-05/NN_TASK_X_*.md` (NN = next chronological number, append-only NU FIFO NU monthly reset)
8. Update `📤_outbox/LATEST.md` cu raport task curent (move precedent LATEST → archive cu next NN)

§1 ORDINE TASKS (sequential, fail-cluster mode)
1. task_A_onboarding_default_render.md (Phase 1 escapat)
2. task_B_templates_active_state.md (Phase 1 escapat)
3. task_C_pain_button_merge.md (Phase 1 escapat)
4. task_D_nutrition_tab_remove.md (Phase 1 escapat)
5. task_E_free_text_universal_remove.md (NEW LOCK V1 SUPERSEDE Cluster #9)
6. task_F_workflow_antrenament_v1_capture.md (CRITICAL — workflow V1 cap-coadă cross-skin × 4)
7. task_G_history_calendar_clickable.md (Cluster #4 deferred)
8. task_H_progress_auto_button_unlocked.md (Cluster #6 deferred)
9. task_I_muscleMap_19_to_7_refactor.md (Q1 engine refactor)
10. task_J_luxury_change_phase_entry.md (Cluster #5 deferred)

§2 FAIL-CLUSTER MODE (Bugatti reset definition)
- Erori în execuție OK dacă fixed la final → end product perfect, NU process zero-error
- Per task fail: log în raport + continue la task urmatoare (NU oprire global)
- La final: aggregate failed tasks în LATEST_CONSOLIDATED.md cu detail + retry suggestion
- Daniel decide post-final raport ce retry

§3 /COMPACT INSERTION (memory hygiene)
Insert `/compact` între phases heavy:
- După Task C (Phase 1 escapate complete)
- După Task F (workflow V1 cel mai mare)
- După Task I (Q1 refactor heavy)

§4 RAPORT FINAL — LATEST_CONSOLIDATED.md
La sfârșit, aggregate în `📤_outbox/LATEST_CONSOLIDATED.md` (move precedent LATEST_CONSOLIDATED → archive cu NN):

```
# PHASE 3 ORCHESTRATOR FINAL — EXECUTION REPORT

## Summary
- Total tasks: 10
- LANDED: X
- AUDIT (no-op needed): Y
- FAILED: Z
- Backup tags created: list
- Commits pushed: list hashes
- Tests preserved: 2731+ PASS / count actual
- Build status: ✓ / ✗

## Per-Task Status
[Task A → J detail per format invariant]

## NEED_CONTEXT_DANIEL flags
[list inline flags per task care necesită Daniel input]

## Cumulative LOCKED V1
~717 (+1 net descriere liberă scope cut universal Task E)

## Smoke Validation Priority List for Daniel
- P0 critic: workflow V1 cap-coadă cross-skin × 4 (Task F)
- P0 critic: 4 Phase 1 escapate (Task A-D)
- P0 critic: descriere liberă universal scoasă (Task E)
- P1: Phase 3 deferred fixes (Task G-H)
- P1: Q1 muscleMap refactor (Task I — verify mapping)
- P2: Luxury parity (Task J)

## Next action
Daniel smoke validation 4 themes cap-coadă (open mockup files browser).
```

§5 BACKUP TAG GLOBAL
git tag pre-orchestrator-final-$(date +%Y%m%d_%H%M)
git tag post-orchestrator-final-$(date +%Y%m%d_%H%M) (post-execution)

§6 PUSH FINAL
git push origin feature/phase-3-orchestrator-final --tags

═══ END PROMPT CC ORCHESTRATOR FINAL ═══
