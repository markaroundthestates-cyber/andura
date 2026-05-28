# PROMPT_CC ORCHESTRATOR — Bundle FULL ORDER 2026-05-16 (3 Tasks Sequential)

**Model:** Opus exclusively
**Scope:** Orchestrate TASK 1 → TASK 2 → TASK 3 sequential fail-stop discipline
**Daniel CEO directive 2026-05-16:** "REPARAM TOT, fără slips, halucinații, presupuneri, shortcuts. FULL ORDER."

---

## §1 Read sequence + execute

Read sequential, execute fully fiecare task înainte trecere la next. Fail-stop discipline:

1. **TASK 1:** Read `📥_inbox/PROMPT_CC_TASK_1_ADD_PRIMER.md` → execute fully §0-§6 → verify §5 LATEST.md raport written → if any §HARD CONSTRAINTS fail OR §0 pre-flight HALT triggered → **STOP execution, write LATEST.md cu §Status: PARTIAL/FAILED + reason + revertable backup tag**. NU proceed to TASK 2.

2. **TASK 2:** Read `📥_inbox/PROMPT_CC_TASK_2_ARCHIVE_WIKI.md` → execute fully §0-§6 → verify §5 LATEST.md raport written → fail-stop same rule.

3. **TASK 3:** Read `📥_inbox/PROMPT_CC_TASK_3_CROSSREFS_SWEEP.md` → execute fully §0-§6 → verify §5 LATEST.md raport written (FINAL bundle summary cumulative 3 tasks).

---

## §2 Per-task discipline

Pentru fiecare task:
- Read task spec from inbox VERBATIM
- Pre-flight §0 grep evidence inline mandatory (§AR.20 + §AR.21)
- Execute §1-§N exact verbatim cum scrie task
- Backup tag pre-execute pushed origin mandatory
- Atomic single-concern commit pushed origin
- Tests 3734 PASS preserved EXACT verified post-execute
- LATEST.md raport intermediar updated per task (cumulative final pe TASK 3)

---

## §3 Fail recovery

Dacă orice task fail:
- ROLLBACK la backup tag pre-task (NU partial commit)
- Write LATEST.md cu §Status: FAILED + §Issues detailed + §Recovery action specific
- STOP execution
- DO NOT proceed to next task
- Daniel review → fix task spec → repaste task → re-execute

---

## §4 Post-bundle final raport

After TASK 3 §5 LATEST.md FINAL cumulative raport written cu §Status: ALL COMPLETE:
- Verify 3 atomic commits pushed origin ✓
- Verify 3 backup tags pushed origin ✓
- Verify tests 3734 PASS preserved cross-task ✓
- Verify ZERO src/ touched cross-task ✓
- Verify ANDURA_PRIMER.md vault root + 99-archive/wiki-pre-2026-05-15/ exists + cross-refs aligned ✓

Final raport include §Next action Daniel cu:
1. Daniel manual UI paste PROJECT_INSTRUCTIONS V6 update (pending separate compose chat-side)
2. Fresh chat startup test "Salut Acasă"
3. P1 candidates pending CEO call (§AR.30/§AR.31 codify + D007 retroactive + P4 reformulated)

---

## §5 Archive cleanup intermediate task spec files

After TASK 3 LANDED success, move task spec files from `📥_inbox/` to `📤_outbox/_archive/2026-05/` cu auto-incrementing NN:

```bash
cd /c/Users/Daniel/Documents/salafull/📥_inbox/

# Get next archive NN
LAST_NN=$(ls ../📤_outbox/_archive/2026-05/ | grep -E '^[0-9]+_' | sort -n | tail -1 | grep -oE '^[0-9]+')
NN=$((LAST_NN + 1))

mv PROMPT_CC_TASK_1_ADD_PRIMER.md ../📤_outbox/_archive/2026-05/${NN}_PROMPT_CC_TASK_1_ADD_PRIMER_CONSUMED.md
mv PROMPT_CC_TASK_2_ARCHIVE_WIKI.md ../📤_outbox/_archive/2026-05/$((NN+1))_PROMPT_CC_TASK_2_ARCHIVE_WIKI_CONSUMED.md
mv PROMPT_CC_TASK_3_CROSSREFS_SWEEP.md ../📤_outbox/_archive/2026-05/$((NN+2))_PROMPT_CC_TASK_3_CROSSREFS_SWEEP_CONSUMED.md
mv PROMPT_CC_ORCHESTRATOR_BUNDLE_FULL_ORDER.md ../📤_outbox/_archive/2026-05/$((NN+3))_PROMPT_CC_ORCHESTRATOR_BUNDLE_FULL_ORDER_CONSUMED.md

cd /c/Users/Daniel/Documents/salafull
git add 📥_inbox 📤_outbox/_archive
git commit -m "chore(vault): archive Bundle FULL ORDER 4 PROMPT_CC artefacte CONSUMED 2026-05-16

🦫 Bugatti craft. Discrete artefacte preserved audit trail."
git push origin feature/v2-vanilla-port
```

---

## §6 HARD CONSTRAINTS cross-task

- ✅ ZERO src/ touched cross-task (toate vault meta-tooling)
- ✅ Atomic single-concern commits Bugatti (3 separate, NU monolith)
- ✅ Tests 3734 PASS preserved EXACT cross-task (zero regression invariant)
- ✅ Backup tags pushed origin per task (3 total + 1 archive cleanup commit if needed)
- ✅ Fail-stop discipline (NU partial bundle, ROLLBACK on any fail)

---

🦫 **Orchestrator Bundle FULL ORDER 2026-05-16. Sequential fail-stop. Granular recovery per task. Bugatti craft. Co-CTO autonomy MAXIMUM 15th consecutive cross-chat trust delegation.**
