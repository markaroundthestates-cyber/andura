# Task 4 — §AR.14 + §AR.15 add VAULT_RULES §ANTI_RECURRENCE_RULES section

**Model:** Opus
**Velocity:** ~10 min
**Scope:** Vault meta-tooling rule additions. Cumulative LOCKED V1 ~688 PRESERVED unchanged.

## Pre-flight MANDATORY

```bash
git status                                      # clean tree post Task 3 commit
grep -n "§AR.13\|§AR.14\|§AR.15" VAULT_RULES.md | head -10  # verify §AR.13 last existing + §AR.14/15 NU exist yet
```

## Context

`VAULT_RULES.md §ANTI_RECURRENCE_RULES` section existing rules §AR.1-§AR.13 (per DECISION_LOG.md 2026-05-07 §AR.13 PK Growth Control Per Sesiune amendment LOCK V1). 

Run 6 add 2 NEW anti-recurrence rules §AR.14 + §AR.15 after §AR.13:

- **§AR.14** — NU invalida info PK search pe user denial without verify (origin slip 2026-05-08 chat-NEW3 birou per CURRENT_STATE narrative)
- **§AR.15** — Anti-overthink launch CC `claude --dangerously-skip-permissions` standalone (origin slip Co-CTO 2026-05-08 chat NEW birou: "ba fiti-ar overthink de ras")

## Steps

### Step 4.1 — Locate §AR.13 in VAULT_RULES.md

```bash
grep -n "^### §AR.13\|^## §AR.13" VAULT_RULES.md
# Expected: 1 match line N — anchor for §AR.14 insertion
```

### Step 4.2 — APPEND §AR.14 + §AR.15 after §AR.13 section end

Insertion anchor: after §AR.13 section content end, before §AR.PRE_FLIGHT_CHECKLIST_INVARIANT (or whatever follows §AR.13).

```markdown
### §AR.14 PK Search Denial Verify Mandatory (LOCK V1 2026-05-08 chat NEW birou)

**Origin slip:** Claude chat 2026-05-08 chat NEW birou — surface info from search/memory presented to Daniel, Daniel responded with denial ("nu deja am stabilit astea?" / "daca nu ma insel..."), Claude initially treated denial as authoritative + invalidated search result without verify. Pattern recidiv: AI consensus deference vs vault SSOT verify discipline.

**Rule:** When user denies / questions information surfaced from project_knowledge_search OR memory:
1. **PAUSE** — NU invalidate search result silently
2. **VERIFY** with second search OR explicit citation `path:§` from vault SSOT
3. **Reconcile** explicit: if vault confirms search result → present citation evidence + clarify ambiguity inline (don't blindly accept user denial); if vault confirms user denial → mea culpa rapid + correct
4. **NU pretend** uncertainty doesn't exist — explicit "verific cu search" if ambiguous

**Anti-pattern:** "Ai dreptate, [retract search result]" without verify = silent agreement-theater violation §CC.4 citation enforcement. User instinct often correct DAR vault SSOT > deference inarticulat.

**Cross-refs:** §CC.4 Citation Enforcement Anti-Hallucination | DECISION_LOG 2026-05-08 chat NEW birou Run 6 elevated entry | Slip origin chat-NEW3 birou (preserved precedent narrative CURRENT_STATE §JUST_DECIDED).

---

### §AR.15 Anti-Overthink Launch CC `claude --dangerously-skip-permissions` Standalone (LOCK V1 2026-05-08 chat NEW birou)

**Origin slip:** Claude chat 2026-05-08 chat NEW birou Co-CTO — livrat command `cd /workspaces/salafull && claude --dangerously-skip-permissions` în prompt CC artefact. Daniel push-back productive: *"ba fiti-ar overthink de ras"*. Reasoning slip: redundant `cd` injection assumption Daniel NU în repo dir. Realitate: Daniel terminal Codespaces deschis în `/workspaces/salafull` default — ALWAYS already în repo dir.

**Rule:** Launch CC commands în prompts/artefacte/instructions = `claude --dangerously-skip-permissions` standalone ONLY. NU `cd <path> &&` redundant prefix.

**Rationale:**
- BIROU setup (per memory): GitHub Codespaces browser web jubilant-chainsaw URL pattern github.dev — terminal integrat default opens în `/workspaces/salafull` (repo root)
- ACASĂ setup (per memory): Windows VS Code Desktop + PowerShell terminal opens în `C:\Users\Daniel\Documents\salafull` (repo root)
- Daniel ALWAYS already în repo dir când lansează CC — `cd` injection = noise pure
- Anti-overthink discipline: command precision > defensive padding

**Exception:** dacă explicit need cd la subfolder (e.g., `functions/` Cloud Functions deployment) → cd justified inline cu rationale; default standalone.

**Cross-refs:** memory rule "Daniel always starts Claude Code with `claude --dangerously-skip-permissions` flag" preserved | DECISION_LOG 2026-05-08 chat NEW birou Run 6 elevated entry | Slip origin chat-current Co-CTO artefact prompt CC delivery.

---
```

### Step 4.3 — Update DECISION_LOG.md entry top

APPEND entry top in `03-decisions/DECISION_LOG.md` (above 2026-05-08 vault meta-tooling entries):

```markdown
## 2026-05-08 chat NEW birou — VAULT_RULES §AR.14 + §AR.15 amendment LOCK V1 (vault meta-tooling)

**Status:** Vault meta-tooling decision (NU product/architecture). Cumulative LOCKED V1 ~688 PRESERVED unchanged.

**Authority:** Daniel chat NEW birou Run 6 elevated Task 4 — anti-recurrence rules consolidation post slip-uri identificate same chat (§AR.14 PK search denial verify origin chat-NEW3 + §AR.15 anti-overthink launch CC origin chat-current Co-CTO artefact slip "ba fiti-ar overthink de ras" push-back productive).

**Rules added VAULT_RULES.md §ANTI_RECURRENCE_RULES section:**
- §AR.14 PK Search Denial Verify Mandatory — pause + verify + reconcile explicit (NU silent invalidation user denial)
- §AR.15 Anti-Overthink Launch CC Standalone — `claude --dangerously-skip-permissions` standalone, NU `cd <path> &&` redundant prefix (Daniel always în repo dir default)

**Files modified atomic batch:**
- UPDATED: VAULT_RULES.md (§AR.14 + §AR.15 NEW after §AR.13)
- UPDATED: 03-decisions/DECISION_LOG.md (this entry)

**Backup tag:** pre-run6-elevated-vault-hygiene-2026-05-08-XXXX (Task 1 same backup)

**Cross-refs:** §AR.13 PK Growth Control predecessor | §CC.4 Citation Enforcement | §CC.6 Append-Only Architecture | §CC.9 Mandatory File Updates Per Handover.
```

## Validation

- ✅ §AR.14 + §AR.15 NEW sections appended VAULT_RULES.md after §AR.13
- ✅ DECISION_LOG.md entry append top descending chronologic
- ✅ Wording final pe origin slip-uri concrete (anti-fabrication)
- ✅ Cross-refs valid §CC.4 + §AR.13 + §CC.6 + §CC.9

## Report format `📤_outbox/LATEST.md` Task 4 section

```
### Task 4 — §AR.14 + §AR.15 add VAULT_RULES
- Status: Complete
- Pre-flight: §AR.13 located VAULT_RULES.md line N
- Modificări:
  - VAULT_RULES.md: §AR.14 + §AR.15 appended after §AR.13
  - 03-decisions/DECISION_LOG.md: entry append top
- Commits: <SHA> "feat(vault-hygiene): Run 6 Task 4 §AR.14 + §AR.15 anti-recurrence rules"
- Pushed: origin/main
- Issues: none
- Next: Task 5 Pre-Beta scope SSOT consolidare verify
```

**STOP. Continue Task 5 only after Task 4 success report verified.**
