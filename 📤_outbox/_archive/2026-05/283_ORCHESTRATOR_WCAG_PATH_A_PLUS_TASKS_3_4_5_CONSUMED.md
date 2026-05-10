ORCHESTRATOR — WCAG Path A Hotfix + Tasks 3+4+5 Sequential Fail-Stop

Model: Opus 4.7 (--dangerously-skip-permissions standard) — toate 4 tasks Opus.
Setup: ACASĂ Windows VS Code Desktop + PowerShell, C:\Users\Daniel\Documents\salafull.

EXECUTION ORDER (strict sequential fail-stop, NU paralel — fiecare Task se commit-ează + push-uiește înainte de next, baseline downstream stabil):

═══════════════════════════════════════════════════════════════════════
TASK 0 — Path A hotfix Clasic :root circular refs (PREREQUISITE blocker downstream)
═══════════════════════════════════════════════════════════════════════
- Read `📥_inbox/PROMPT_CC_TASK_0_HOTFIX_CLASIC_CIRCULAR_REFS.md`
- Execute Phase 1 pre-flight + Phase 2 land 5 surgical str_replace + Phase 3 post-fix verification
- Generate `📤_outbox/LATEST.md` raport intermediate (Task 0 isolated)
- Archive precedent LATEST (HALT report) → outbox archive next NN
- Backup tag + commit + push origin
- Status check:
  - LANDED → continue Task 3
  - HALTED → STOP. Final `📤_outbox/LATEST.md` notes Task 0 halt + zero downstream execution.

═══════════════════════════════════════════════════════════════════════
TASK 3 — Cross-skin --line architectural split (Luxury 27 + Clasic 49)
═══════════════════════════════════════════════════════════════════════
- Read `📥_inbox/PROMPT_CC_TASK_3_LINE_SPLIT_CROSS_SKIN.md`
- Prerequisite "Tasks 1+2 LANDED" satisfied: b439530 (v3 Luxury line-strong) + dfa3bbd (v2 Path 2a Clasic :root) both on main; v2 dfa3bbd healed via Task 0 hotfix LANDED prior step. Implicit OK.
- Execute Phase 1 pre-flight grep + Phase 2 token design (Clasic --line-strong dacă needed) + Phase 3 land
- Generate `📤_outbox/LATEST.md` raport intermediate (cycle precedent → archive)
- Backup tag + commit + push origin
- Status check:
  - LANDED → continue Task 4
  - HALTED → STOP. Final report partial completion (Task 0 LANDED + Task 3 HALTED + Tasks 4+5 NU executed).

═══════════════════════════════════════════════════════════════════════
TASK 4 — Brain Coach --ink-4 9px text + --line audit closure
═══════════════════════════════════════════════════════════════════════
- Read `📥_inbox/PROMPT_CC_TASK_4_BC_INK4_LINE.md`
- Prerequisite "Tasks 1+2+3 LANDED" satisfied via prior steps in chain. Implicit OK.
- Execute Phase 1 pre-flight + Phase 2 design decision (Option A1 per-element override Co-CTO recommended OR A2 token split per HALT condition) + Phase 3 land
- Generate `📤_outbox/LATEST.md` raport intermediate (cycle precedent → archive)
- Backup tag + commit + push origin
- Status check:
  - LANDED → continue Task 5
  - HALTED → STOP. Final report partial completion.

═══════════════════════════════════════════════════════════════════════
TASK 5 — Living Body :root lift architectural (parallel Path 2a pattern, ~394 hex→tokens)
═══════════════════════════════════════════════════════════════════════
- Read `📥_inbox/PROMPT_CC_TASK_5_LB_ROOT_LIFT.md`
- Prerequisite "Tasks 1+2+3+4 LANDED" satisfied via prior steps in chain. Implicit OK.
- CRITICAL: surgical bulk replace per token, NU bulk replace_all over entire file (anti-recurrence Task 0 root cause). Per-token str_replace with explicit context if needed to avoid :root self-match. Phase 3 mandatory post-fix grep self-ref detection identical Task 0 pattern.
- Execute Phase 1 pre-flight + Phase 2 token design + Phase 3 land + post-bulk verification
- Generate `📤_outbox/LATEST.md` raport intermediate (cycle precedent → archive)
- Backup tag + commit + push origin
- Status check:
  - LANDED → execute POST-COMPLETION step below
  - HALTED → STOP. Final report partial completion.

═══════════════════════════════════════════════════════════════════════
POST-COMPLETION (Task 5 LANDED only) — LATEST_CONSOLIDATED.md FINAL
═══════════════════════════════════════════════════════════════════════
- Generate `📤_outbox/LATEST_CONSOLIDATED.md` per Task 5 prompt POST-COMPLETION instruction:
  - Per-skin closure status table 4 themes (Luxury / Clasic / Brain Coach / Living Body)
  - Cumulative WCAG batches executed: v1 cc98b46 + v3 b439530 + v2 dfa3bbd + v2-hotfix Task 0 + v4 Task 3 + v5 Task 4 + v6 Task 5 (7 commits chain chat-current — Task 0 hotfix counted)
  - Cumulative tokens introduced cross-skin (Clasic --line-strong nou dacă Task 3, BC override OR token split Task 4, LB :root lift Task 5)
  - Tests preserved 2731 PASS gate verified each task
  - Backup tags chronologic chat-current 4 task branches
  - Mid-flight unresolved (none expected dacă all clean LANDED)
  - Daniel smoke validation checklist consolidated 4 themes browser (cross-skin token resolution + WCAG visual verify Path 2a Clasic + LB lift parity)
- LATEST_CONSOLIDATED commit + push origin (final commit chain).

═══════════════════════════════════════════════════════════════════════
GLOBAL CONSTRAINTS (apply all 4 tasks invariant)
═══════════════════════════════════════════════════════════════════════
- ZERO src changes (mockups-only ACROSS all 4 tasks — `04-architecture/mockups/` glob exclusively).
- Tests `npm run test:run` preserved 2731 PASS each task gate (vs baseline pre-task — verify post-each commit).
- Vault flow strict: 📥_inbox NEVER write, 📤_outbox/_archive precedent rotation NN sequential cronologic continuous (NU FIFO, NU monthly reset).
- Per-task backup tags pushed origin rollback safety (4 tags total chat-current).
- Per-task LATEST.md raport intermediate §10.4 format + FINAL LATEST_CONSOLIDATED.md post Task 5 only.
- Bulk replace operations: surgical str_replace cu exact context strings, NU bulk replace_all over entire file (anti-recurrence Task 0 root cause `dfa3bbd` slip).
- Post-bulk-replace verification mandatory: self-ref grep `grep -nE ':[[:space:]]*var\(--SAME\)'` zero matches expected (POST_BULK_REPLACE_VERIFICATION V1 anti-recurrence rule).

═══════════════════════════════════════════════════════════════════════
FAIL-STOP RULE (CRITICAL — NU continue past HALT)
═══════════════════════════════════════════════════════════════════════
- ANY task HALT → STOP execution chain immediately, NU continue downstream.
- 📤_outbox/LATEST.md final reflects partial state: tasks LANDED enumerate + task HALTED reason + downstream tasks NOT executed listed explicit.
- NU continue past HALT regardless of severity (anti-cascade silent default per ADR 030 §3.6 mirror principle aplicat orchestrator-level).
- Halt report includes recovery path recommendation (e.g., "Daniel decide A/B/C remediation path" similar precedent HALT report style).

═══════════════════════════════════════════════════════════════════════
ARCHIVE NN SEQUENCE (cronologic continuous, NU FIFO):
═══════════════════════════════════════════════════════════════════════
Current outbox archive sequence post-chat-precedent (per CURRENT_STATE archive 275 last) — verify pre-flight `ls 📤_outbox/_archive/2026-05/ | tail -5` to determine next NN starting number. Apply NN+1, NN+2, NN+3, NN+4 per Tasks 0+3+4+5 (or NN+1...NN+5 dacă Task 5 LANDED + LATEST_CONSOLIDATED separate archive cycle final).
