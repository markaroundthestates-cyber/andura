# PROMPT CC — Vault Hygiene Next Pass Cleanup (Post BATCH 2 Closure + Karpathy Phase 1-5 LANDED)

**Owner:** Daniel CEO directive 2026-05-12 chat ACASĂ — "Updatezi si vault hygiene si ce e in vault pt curatate"
**Authority:** [[../VAULT_RULES]] §VAULT_HYGIENE_PASS + §F3.12 hard constraints freeze raw layer + §F3.13 metoda hibridă + Daniel directive verbatim
**Model:** Opus EXCLUSIVELY
**Working folder:** `C:\Users\Daniel\Documents\salafull`
**Branch:** `feature/v2-vanilla-port`
**Launch:** `claude --dangerously-skip-permissions`
**Skills inline:** gstack `/qa` post-cleanup full vitest verde + Sequential Thinking decizii ambigue cleanup vs preserve + Impeccable `/critique` final raport voice tone preserve

---

## §0 — Pre-Conditions

- [ ] `git status` clean pe `feature/v2-vanilla-port`
- [ ] `git log origin/feature/v2-vanilla-port -3 --oneline` last commits BATCH 2 + vault cleanup `b79a277 + 5d97429` landed
- [ ] Backup tag `pre-vault-hygiene-next-pass-2026-05-12-<HHMM>` pushed origin pre-execute rollback safety
- [ ] Tests baseline 2914 PASS preserved verify quick sanity (~30s)
- [ ] HANDOVER_VERIFICATION_CHECKLIST.md LANDED 2026-05-12 verify exist (Bugatti gate workflow rule co-evolved §F3.13)

---

## §1 — Inbox Cleanup Final Sweep

**Scope:** `📥_inbox/` should contain ONLY `.gitkeep` post-cleanup (per BATCH 2 closure milestone cleanup 2026-05-12 commit `5d97429`).

Verify expected state:

```bash
ls -la 📥_inbox/
# expected: .gitkeep + .obsidian-related (dacă applicable) + NEW prompts noi (e.g. PROMPT_CC_KARPATHY_WIKI_SUB_BATCH_3.md + PROMPT_CC_VAULT_HYGIENE_NEXT_PASS.md acest fișier)
```

**Action 1.1:** Verify currently `📥_inbox/`:
- `PROMPT_CC_KARPATHY_WIKI_SUB_BATCH_3.md` — preserve (P1 next chat post hygiene cleanup)
- `PROMPT_CC_VAULT_HYGIENE_NEXT_PASS.md` — preserve (this file, post-execute will be archived)
- Orice alte fișiere stale → flag în raport + Daniel review

**Action 1.2 post-execute acest prompt:** Archive `PROMPT_CC_VAULT_HYGIENE_NEXT_PASS.md` → `📤_outbox/_archive/<YYYY-MM>/<NN>_PROMPT_CC_VAULT_HYGIENE_NEXT_PASS_CONSUMED.md` (NN next chronological continuous, NU FIFO).

---

## §2 — 📤_outbox Cleanup + LATEST.md Cycle

**Action 2.1:** Verify current LATEST.md timestamp + content fresh (BATCH 2 closure milestone raport).

**Action 2.2:** Cycle current LATEST.md → `📤_outbox/_archive/<YYYY-MM>/<NN+1>_LATEST_BATCH_2_CLOSURE_MILESTONE_PLUS_METODA_HIBRIDA_CONSUMED.md`.

**Action 2.3:** Write new LATEST.md cu raport vault hygiene next pass cleanup §0-§N (post-execute).

**Action 2.4:** Cleanup `📤_outbox/_archive/` orphan files dacă any (per §AR.5 audit count methodology verify).

---

## §3 — wiki/ Layer Audit + Sync (Karpathy Real Phase 1-5 LANDED)

**Per [[../CLAUDE]] §4.3 /wiki-lint + [[../wiki/index.md]] catalog cumulative state:**

### §3.1 — wiki/index.md Cumulative Count Verify

- [ ] `filesystem:list_directory wiki/entities/adrs/` count vs index claim 26 LANDED Phase 3 SUB-BATCH 1+2
- [ ] `filesystem:list_directory wiki/concepts/` count vs index claim 15 LANDED Phase 3 SUB-BATCH 1
- [ ] `filesystem:list_directory wiki/summaries/` count (probabil 0 TBD)
- [ ] `filesystem:list_directory wiki/sources/` count (probabil 0 TBD)
- [ ] `filesystem:list_directory wiki/entities/engines/` count (probabil 0 TBD)
- [ ] `filesystem:list_directory wiki/entities/features/` count (probabil 0 TBD)
- [ ] `filesystem:list_directory wiki/entities/specs/` count (probabil 0 TBD)

Cumulative expected: 41 pages LANDED (26 ADRs + 15 concepts). Discrepancy = index drift, flag în raport.

### §3.2 — wiki/log.md Chronological Append Sync

- [ ] Verify last entry timestamp 2026-05-12 BATCH 2 closure post Phase 5 LANDED
- [ ] Append entry `## [2026-05-12] hygiene | vault hygiene next pass cleanup post BATCH 2 + Karpathy Phase 1-5 LANDED`

### §3.3 — /wiki-lint Initial Pass Comprehensive

Run /wiki-lint 5 scan types per [[../CLAUDE]] §4.3 + §F3.9 voice fidelity:

1. **Broken wikilinks scan** — `grep -rEn '\[\[' wiki/ --include='*.md'` + cross-verify each. Expected ~42 broken (forward refs Cluster B/C/D/F/G SUB-BATCH 3 TBD pages acceptable per CLAUDE.md §5.2). Flag în raport delta vs Phase 4 initial 42 baseline.
2. **Orphan pages scan** — each markdown in `wiki/` no inbound + no `wiki/index.md` entry. Expected 0 (post-Phase 5 cleanup LANDED).
3. **Stale claims scan** — `last_updated:` >60 days old. Expected 0 fresh.
4. **Contradictions scan** — cross-check dated entries. Expected 0.
5. **Voice fidelity scan** — for each page Verbatim quotes Daniel section: quotes EXACT + Synthesis NU dominant + cross-refs min 2-3 + Bugatti framing prezent. Expected 0 issues (Phase 4 Daniel sample 9 PASS verdict per LATEST raport 402).

**Output raport:** `📤_outbox/_archive/<YYYY-MM>/<NN+2>_WIKI_LINT_RAPORT_VAULT_HYGIENE_NEXT_PASS_<DATE>.md` §1-§6 sections.

---

## §4 — Raw Layer Orphan Detection (READ-ONLY Verify)

**HARD CONSTRAINT §F3.12:** Vault existing FREEZE raw layer immutable post-Faza 3 LANDED. NU modify. **READ-ONLY audit only.**

### §4.1 — Stale `Updated:` Timestamps Detection

Cross-check raw layer files cu `Updated:` headers:

- `00-index/CURRENT_STATE.md` — last `Updated:` should be 2026-05-12 BATCH 2 closure
- `00-index/INDEX_MASTER.md` — last `Updated:` 2026-05-12 (per Phase 5 cleanup)
- `03-decisions/DECISION_LOG.md` — top entry 2026-05-12 BATCH 2 closure
- `DIFF_FLAGS.md` — last `Updated:` recent

Flag stale candidates >7 days în raport pentru Daniel awareness (NU modify per §F3.12 freeze).

### §4.2 — 📤_outbox/_archive Cumulative Count Verify

`ls -la 📤_outbox/_archive/2026-05/ | wc -l` (excluding `_archive/<YYYY-MM>/.` + `..`)
Expected: ~420+ entries (per CURRENT_STATE state references NN 418 + 419 + 420 etc).

Spot-check last 5 entries chronological NN cycle continuous (NU FIFO, NU reset). Flag discontinuity dacă any.

### §4.3 — Raw Layer Wikilinks Orphan Scan (§AR.PRE_FLIGHT item 13 cross-ref)

`grep -rEn '\[\[' --include='*.md' --exclude-dir=node_modules --exclude-dir=_archive --exclude-dir=.git --exclude-dir=dist --exclude-dir=coverage --exclude-dir=wiki .` + cross-verify each target exist filesystem-side.

Expected: 0 broken raw layer wikilinks (per FAZA 2C + FAZA 2D wikilink fix sweep LANDED 2026-05-11). Flag any în raport.

---

## §5 — Skills CC Ecosystem Inventory Verify (Install Pack 12 LANDED 2026-05-12)

Per [[../VAULT_RULES#FAZA_3_KARPATHY_REAL]] §F3.13.1 + memory rule #24:

### §5.1 — Claude Desktop MCP Servers Active

Verify `claude_desktop_config.json` contains active entries (per `%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json` path canonical MSIX):

- [ ] filesystem
- [ ] claude-code
- [ ] obsidian-mcp-tools
- [ ] context7
- [ ] tavily
- [ ] sequential-thinking
- [ ] 21st-dev-magic

Cumulative 7 mcpServers LANDED 2026-05-12 post-restart. Flag în raport dacă any missing/inactive.

### §5.2 — CC Skills Global Inventory

Verify CC terminal skills available (via `claude /help` sau equivalent ls global skills folder):

- [ ] gstack skills 47/host (post bun+Git fix LANDED)
- [ ] GSD skills 66 `/gsd-*` + agents + SDK
- [ ] Impeccable skills
- [ ] Emil Kowalski skills
- [ ] Taste skills
- [ ] UI/UX Pro Max skills
- [ ] Obsidian skills 5 variants

Flag în raport orice missing/inactive.

### §5.3 — Bun + Git for Windows Verify

- [ ] `bun --version` returns 1.3.13+
- [ ] `bash --version` (Git for Windows) returns 5.2.37+ (post winget install LANDED)

Flag în raport orice missing/wrong version.

---

## §6 — Cleanup Actions Atomic

### §6.1 — Archive Acest Prompt Post-Execute

`mv 📥_inbox/PROMPT_CC_VAULT_HYGIENE_NEXT_PASS.md 📤_outbox/_archive/<YYYY-MM>/<NN>_PROMPT_CC_VAULT_HYGIENE_NEXT_PASS_CONSUMED.md` (NN next chronological continuous).

### §6.2 — Cycle LATEST.md

`mv 📤_outbox/LATEST.md 📤_outbox/_archive/<YYYY-MM>/<NN+1>_LATEST_BATCH_2_CLOSURE_MILESTONE_PLUS_METODA_HIBRIDA_CONSUMED.md`

### §6.3 — Write New LATEST.md

Structure §0-§N per [[../VAULT_RULES]] §10.8 + HANDOVER_VERIFICATION_CHECKLIST §0 invocation:

```markdown
# LATEST — Vault Hygiene Next Pass Cleanup Post BATCH 2 + Karpathy Phase 1-5 LANDED

## §0 — HANDOVER VERIFICATION CHECKLIST (per HANDOVER_VERIFICATION_CHECKLIST.md)
[8 items ✅/❌ — note: acest cleanup NU /wiki-ingest handover, dar similar gate applies §1-§9]

## §1 — Task / Model / Status / Branch / Date
Task: Vault hygiene next pass cleanup
Model: Opus EXCLUSIVELY
Status: Complete
Branch: feature/v2-vanilla-port
Date: 2026-MM-DD HH:MM CET

## §2 — Pre-flight verify
[per §0 above ✅]

## §3 — Cleanup Actions Executed
- Inbox cleanup verified: only .gitkeep + PROMPT_CC_KARPATHY_WIKI_SUB_BATCH_3.md preserved (P1 next chat)
- 📤_outbox cleanup: LATEST.md cycled to _archive/<YYYY-MM>/<NN+1>_*_CONSUMED.md
- wiki/ audit: 41 pages cumulative LANDED verified vs index claim
- /wiki-lint 5 scans run: <broken N> + 0 orphan + 0 stale + 0 contradiction + 0 voice fidelity issues
- Raw layer wikilinks orphan scan: 0 broken (post FAZA 2C+2D fix sweep)
- Skills CC ecosystem 7 MCP servers + GSD 66 + gstack 47/host + Install Pack 12 verified active

## §4 — Build + Tests
vitest: 2914/2914 PASS preserved EXACT (doc-only ZERO src/ touched)
pre-commit hook gate: verde

## §5 — Commits
[1 atomic commit `chore(vault): vault hygiene next pass cleanup post BATCH 2 + Karpathy Phase 1-5 LANDED` + push origin]

## §6 — Issues
[None / list cu severity dacă any flagged §3 above]

## §7 — Next Action
Daniel review raport + decizie P1 next chat:
- Option A: Karpathy SUB-BATCH 3 Cluster A-G overnight execute (preserved 📥_inbox/PROMPT_CC_KARPATHY_WIKI_SUB_BATCH_3.md)
- Option B: Calendar feature implement LOCK V1 STRATEGIC MAJOR
- Option C: Daniel Gates manual smoke prod andura.app post-deploy feature/v2-vanilla-port → main
- Option D: Strategic pauză + planning
```

### §6.4 — Atomic Commit Single-Concern

```bash
git add -A
git commit -m "chore(vault): vault hygiene next pass cleanup post BATCH 2 + Karpathy Phase 1-5 LANDED

- Inbox final sweep verified (PROMPT_CC_VAULT_HYGIENE_NEXT_PASS archived _CONSUMED)
- 📤_outbox LATEST.md cycled to _archive/<YYYY-MM>/<NN+1>_*_CONSUMED.md
- wiki/ audit cumulative 41 pages LANDED verified vs index
- /wiki-lint 5 scans pass clean (broken/orphan/stale/contradiction/voice fidelity)
- Skills CC ecosystem 7 MCP + Install Pack 12 verified active
- Tests 2914 PASS preserved EXACT

Cumulative ~742 LOCKED V1 PRESERVED unchanged (vault meta-tooling).
HANDOVER_VERIFICATION_CHECKLIST §0 invocation atomic.

🦫 Bugatti craft. Vault clean Karpathy Phase 1-5 LANDED foundation pentru SUB-BATCH 3 P1 next chat."

git push origin feature/v2-vanilla-port
```

### §6.5 — Post-Commit Verify (§AR.19 Trust + Verify)

- [ ] `git log origin/feature/v2-vanilla-port -1 --oneline` commit landed remote
- [ ] `📤_outbox/LATEST.md` written cu raport structured §0-§7
- [ ] Tests 2914 PASS preserved verify quick sanity post-commit

---

## §7 — Hard Constraints

🚫 Vault existing FREEZE raw layer immutable §F3.12 — READ-ONLY audit only acest task. NU modify raw layer.

🚫 `src/` + `tests/` zero touch.

🚫 `main` branch (work on `feature/v2-vanilla-port`).

🚫 `.obsidian/` config.

🚫 Memory edits Claude chat + userPreferences UI + system prompt project.

🚫 `--no-verify` git commit (pre-commit hook gate verde mandatory).

🚫 Bulk multi-purpose commit (atomic single-concern `chore(vault):`).

---

## §8 — Acceptance Criteria

- ✅ Inbox cleanup verified state (only .gitkeep + preserved P1 prompts)
- ✅ 📤_outbox LATEST.md cycled archive + new LATEST written structured §0-§7
- ✅ wiki/ audit cumulative 41 pages LANDED verified
- ✅ /wiki-lint 5 scans pass clean
- ✅ Raw layer wikilinks orphan scan 0 broken
- ✅ Skills CC ecosystem verified active 7 MCP + Install Pack 12
- ✅ Tests 2914 PASS preserved EXACT
- ✅ Atomic commit single-concern pushed origin
- ✅ Cumulative ~742 LOCKED V1 PRESERVED unchanged

---

## §9 — Cross-Refs Authority

- [[../VAULT_RULES#FAZA_3_KARPATHY_REAL]] §F3.12 freeze hard constraints + §F3.13 metoda hibridă
- [[../VAULT_RULES]] §VAULT_HYGIENE_PASS workflow canonical
- [[../VAULT_RULES]] §10.8 raport schema canonical
- [[../CLAUDE]] §4.3 /wiki-lint workflow 5 scan types + §F3.9 voice fidelity
- [[../08-workflows/HANDOVER_VERIFICATION_CHECKLIST]] §0 LATEST.md output format
- [[../wiki/index.md]] §Carry-forward TBD Cluster A-G enumerate
- [[../03-decisions/008-vitest-playwright-testing]] tests 2914 PASS baseline
- Memory rules #25 Faza 3 Karpathy + #30 HANDOVER_VERIFICATION_CHECKLIST

---

🦫 **Bugatti craft. Vault hygiene next pass cleanup post BATCH 2 closure milestone + Karpathy Phase 1-5 LANDED. Vault clean Karpathy compliant foundation. HANDOVER_VERIFICATION_CHECKLIST §0 invocation atomic. Tests 2914 PASS preserved EXACT. Cumulative ~742 LOCKED V1 PRESERVED unchanged. Ready P1 next chat fork (SUB-BATCH 3 Cluster A-G / Calendar feature / Daniel Gates prod / Strategic pauză).**
