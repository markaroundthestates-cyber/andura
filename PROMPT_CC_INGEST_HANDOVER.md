# PROMPT CC — INGEST HANDOVER

**Use:** Daniel rulează când a pus handover NEW în `📥_inbox/`. CC Opus ingest per VAULT_RULES §HANDOVER_PROTOCOL automat.

**Model:** 🔴 OPUS (vault-wide merge SSOT = Opus zone)

**Tu tastezi în CC:**

```
/model opus
```

**Apoi paste integral între markeri:**

═══════════════════════════════════════════════════════════════════
                  START PROMPT — INGEST HANDOVER
═══════════════════════════════════════════════════════════════════

# TASK: Ingest handover from inbox per VAULT_RULES §HANDOVER_PROTOCOL

**Action:**
1. Pre-flight: git pull, status clean, baseline tests PASS, backup tag pre-merge.
2. Identify input file în `📥_inbox/HANDOVER_INPUT_*.md` (sau similar).
3. Read input + active SSOT `06-sessions-log/HANDOVER_GLOBAL_<latest>.md`.
4. Merge ambele în 1 versiune unique zero info loss → overwrite SSOT same name.
5. Archive input la `📤_outbox/_archive/<YYYY-MM>/NN_HANDOVER_INPUT_CONSUMED.md` (next NN).
6. Generate alignment questions (10-15 adversarial cu citation §X expected) → `📤_outbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md`.
7. Rotate previous LATEST.md → archive cu next NN.
8. Write raport execution în `📤_outbox/LATEST.md` per PROMPT_CC_HYGIENE §3.2.
9. Commits granulare (merge SSOT + archive input + alignment + raport) + push origin/main.

**Constraints:** per VAULT_RULES §HANDOVER_PROTOCOL — zero info loss, NO delete, backup tag obligatoriu, baseline tests unchanged.

**Output expected:** raport `📤_outbox/LATEST.md` cu summary modificări + commits SHA + push confirm + next action Daniel (sync + chat nou + alignment questions).

═══════════════════════════════════════════════════════════════════
                  END PROMPT — INGEST HANDOVER
═══════════════════════════════════════════════════════════════════
