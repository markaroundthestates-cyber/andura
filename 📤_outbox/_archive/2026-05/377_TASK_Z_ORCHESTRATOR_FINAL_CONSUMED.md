═══ START PROMPT CC ORCHESTRATOR FINAL PHASE 3.5 ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 INSTRUCȚIUNE GLOBALĂ
Citește sequențial task_L → task_Y din `📥_inbox/`. Pentru fiecare task:
1. Pre-flight grep MANDATORY paths + ADRs din §0 task
2. Apply §1 scope + §2 files + §3 acceptance criteria
3. Backup tag §4 ÎNAINTE de modificare
4. Tests preserved 2731+ PASS verify post-task
5. Build clean ~4s verify
6. Commit §5 + push origin feature/phase-3-orchestrator-final
7. Raport §6 în `📤_outbox/_archive/2026-05/NN_TASK_X_*.md`
8. Update `📤_outbox/LATEST.md` cu raport task curent

§1 ORDINE TASKS (sequential, fail-cluster mode)
1. task_L_onboarding_default_render_REAL_FIX.md (RETRY Task A FAIL)
2. task_M_workflow_set_advance_gate.md (CRITICAL workflow fix)
3. task_N_pause_timer_real_countdown.md (CRITICAL workflow fix)
4. task_O_engine_kg_increments_manual_input.md (CRITICAL UX fix)
5. task_P_kcal_proteine_save_handler.md
6. task_Q_greutate_sync_profil.md
7. task_R_notif_handlers_refa_onboarding.md
8. task_S_chart_range_filter.md
9. task_T_chart_interactive_points.md
10. task_U_loguri_recente_drill_down.md
11. task_V_pain_altceva_ux_feedback.md
12. task_W_faq_suport_placeholder.md
13. task_X_lux_storyboard_refactor_1to1.md (LARGEST — Theme Parity strict)
14. task_Y_bc_paradigm_refactor_1to1.md (Theme Parity strict)

§2 FAIL-CLUSTER MODE (Bugatti reset definition)
- Erori în execuție OK dacă fixed la final → end product perfect, NU process zero-error
- Per task fail: log în raport + continue la task urmatoare
- La final: aggregate failed tasks în LATEST_CONSOLIDATED.md cu detail + retry suggestion

§3 /COMPACT INSERTION (memory hygiene)
Insert `/compact` între phases heavy:
- După Task O (workflow critical complete)
- După Task T (charts complete)
- După Task X (Lux refactor heavy)

§4 RAPORT FINAL — LATEST_CONSOLIDATED.md
La sfârșit, aggregate în `📤_outbox/LATEST_CONSOLIDATED.md` (move precedent → archive cu next NN):

```
# PHASE 3.5 ORCHESTRATOR FINAL — EXECUTION REPORT

## Summary
- Total tasks: 14 (Task L → Y)
- LANDED: X
- AUDIT: Y
- FAILED: Z
- Backup tags: list
- Commits pushed: list hashes
- Tests preserved: 2731+ PASS / actual count
- Build status: ✓ / ✗

## Per-Task Status
[Task L → Y detail format invariant]

## Cross-skin × 4 Theme Parity Invariant V1 Final Status
- ACHIEVED 4/4 ALL Tasks L-Y (post-Lux + BC refactor 1:1 strict)
- Sole exception preserved: omuleț Living Body Progres unique visualization

## Smoke Validation Priority List for Daniel (DEPTH cap-coadă FINAL)
- P0 critic: open mockup × 4 themes → onboarding default render → cap-coadă navigation
- P0 critic: workflow V1 antrenament (set gate sequential + pause timer real countdown + manual kg input + engine increments multipli)
- P0 critic: charts greutate (range filter + interactive points/tooltip)
- P0 critic: handlers logging (kcal+proteine save + greutate sync profil + notif + Refă onboarding redirect)
- P1: Loguri recente drill-down + pain Altceva UX feedback + FAQ placeholder
- P1: Theme Parity Invariant V1 strict cross-skin × 4 verify (palette divergent OK, structure + flow + butoane IDENTIC)

## NEED_CONTEXT_DANIEL flags
- Task W FAQ content writing scope decision (Phase 4+ backlog)
- Task I muscleMap 19→7 mapping (deferred from Phase 3 — Phase 4+ dedicate session)
- Task T chart library upgrade dacă necesar (Chart.js vs SVG custom)

## Next action
Daniel smoke DEPTH cap-coadă 4 themes (Clasic + LB + BC + Lux) per priority list — finished real (NU "fugitiv").
```

§5 BACKUP TAG GLOBAL
git tag pre-orchestrator-final-3-5-$(date +%Y%m%d_%H%M)
git tag post-orchestrator-final-3-5-$(date +%Y%m%d_%H%M)

§6 PUSH FINAL
git push origin feature/phase-3-orchestrator-final --tags

═══ END PROMPT CC ORCHESTRATOR FINAL PHASE 3.5 ═══
