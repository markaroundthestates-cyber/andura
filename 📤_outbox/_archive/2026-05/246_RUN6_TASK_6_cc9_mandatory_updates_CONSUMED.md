# Task 6 — §CC.9 Mandatory File Updates Per Handover (INDEX_MASTER + ACTIVE_* sync + pre-flight grep wikilinks)

**Model:** Opus
**Velocity:** ~10-15 min
**Scope:** Vault meta-tooling §CC.9 enforcement final step Run 6 elevated. Cumulative LOCKED V1 ~688 PRESERVED unchanged.

## Pre-flight MANDATORY

```bash
git status                                      # clean tree post Task 5 commit
```

## Context

VAULT_RULES §CC.9 LOCKED V1 (5-step mandatory checklist post-handover):
1. ✅ CURRENT_STATE.md §JUST_DECIDED + §NOW move-then-replace (Task 1)
2. ✅ DECISION_LOG.md entries append top (Tasks 1+2+4)
3. ⏳ INDEX_MASTER.md stats refresh (this Task 6 §10.9.1)
4. ⏳ CURRENT_STATE §ACTIVE_REFS / §ACTIVE_ADRS / §ACTIVE_FLAGS sync (this Task 6 §10.9.2)
5. ⏳ Pre-flight grep wikilinks orphane (this Task 6 §10.9.3)

## Steps

### Step 6.1 — INDEX_MASTER.md stats line refresh

```bash
ls 03-decisions/*.md | wc -l                    # numbered + named ADR count
ls 00-index/*.md 01-vision/*.md 02-research/*.md 03-decisions/*.md 04-architecture/*.md 05-implementation-tasks/*.md 06-sessions-log/*.md 08-workflows/*.md *.md 2>/dev/null | grep -v "_archive\|node_modules" | wc -l   # active vault count
```

Edit `00-index/INDEX_MASTER.md` stats line:
- Update active vault file count (post Task 3 if §29.5.7 file new + post Task 5 if PRE_LAUNCH_CHECKLIST_V1 already counted)
- Update ADR breakdown numbered/named/total if changes from Task 3 (rare scenario new ADR)
- Update timestamp `Updated: 2026-05-08 (Run 6 elevated complete)`

Format reference (per existing pattern):
```
**Stats refresh (Run 6 elevated 2026-05-08):** <X> fișiere active vault | <Y> numbered ADRs | <Z> named ADRs | total <Y+Z> ADRs.
```

### Step 6.2 — CURRENT_STATE §ACTIVE_REFS / §ACTIVE_ADRS / §ACTIVE_FLAGS sync

Edit `00-index/CURRENT_STATE.md` 3 sections (overwrite OK per §CC.6 — pointers/references NU content):

**§ACTIVE_REFS** — review and update:
- REMOVE archived/deprecated references no longer relevant
- ADD new SSOT references created Tasks 1-5 (§29.5.7 V2 amendment final location if file new + PRE_LAUNCH_CHECKLIST_V1 verified updated)
- REDIRECT canonical pointers if any file moved/renamed

**§ACTIVE_ADRS** — review top 3 ADRs context Task 1 reconciliation:
- Confirm ADR 026 (offline coaching decision tree exhaustive) still top
- Confirm ADR 030 (orchestrator/strangler) still active for Faza 3
- Third slot Daniel decide priority — consider ADR 005 (vanilla JS) pending amendment SUPERSEDE post React migration plan tactical chat dedicat

**§ACTIVE_FLAGS** — review DIFF_FLAGS P1 active:
- P1-FLAG-AUTH-PHASE2 — verify status (per Phase 2 LANDED state, may be 🟢 RESOLVED — verify DIFF_FLAGS.md current status)
- P1-FLAG-SCENARIOS-COVERAGE — preserved 🔴 OPEN gap reduction ~990-1490 decisions
- P1-FLAG-IOS-PERMANENT — LOCKED V1 PWA + TWA Android only
- HANDOVER_GLOBAL split FLAG — verify status (may need split chat strategic NEW dedicat post-Faza 3)

### Step 6.3 — Pre-flight grep wikilinks orphane MANDATORY

Per VAULT_RULES §CC.9.5:

```bash
# Generic orphan detection — all archived files patterns
grep -rEn '\[\[' --include="*.md" --exclude-dir=_archive --exclude-dir=node_modules --exclude-dir=.git . > /tmp/all_wikilinks.txt
wc -l /tmp/all_wikilinks.txt

# If §29.5.7 file new from Task 3:
grep -rEn '\[\[.*29.5.7' --include="*.md" --exclude-dir=_archive --exclude-dir=node_modules --exclude-dir=.git . | head -20
# Expect: 0 (all references resolved canonical destination Task 3)

# Generic orphan check archived files patterns
grep -rEn '\[\[(HANDOVER_MISC|HANDOVER_VAULT_HYGIENE|HANDOVER_GLOBAL_SPLIT_PLAN)' --include="*.md" --exclude-dir=_archive --exclude-dir=node_modules --exclude-dir=.git . | wc -l
# Expect: 0 (Run 2 archived files all REDIRECT applied per audit-vault-2026-05-07.md)
```

If ANY orphan detected → flag în Task 6 report Issues + STOP commit (manual investigation).
If ZERO orphans → continue Step 6.4.

### Step 6.4 — Verify timestamp consistency CURRENT_STATE vs DECISION_LOG

Per VAULT_RULES §CC.7 Layer 3 drift detection:

```bash
grep "^Updated:" 00-index/CURRENT_STATE.md | head -1
head -5 03-decisions/DECISION_LOG.md | grep "^## 2026"
```

Both should reflect 2026-05-08 chat NEW birou Run 6 elevated. Mismatch >24h → flag Issues.

### Step 6.5 — Final commit + push consolidating Run 6 elevated

```bash
git add 00-index/CURRENT_STATE.md 00-index/INDEX_MASTER.md
git commit -m "feat(vault-hygiene): Run 6 elevated Task 6 §CC.9 mandatory updates (INDEX_MASTER stats + ACTIVE_* sync + wikilinks orphane verified zero)"
git push origin main
```

### Step 6.6 — Generate `📤_outbox/LATEST.md` final consolidated report

Move precedent `LATEST.md` → `📤_outbox/_archive/2026-05/<NN+1>_<previous_task>_CONSUMED.md` per §3.3 archive schema NN chronologic continuous (verify last NN existing + increment).

Create new `📤_outbox/LATEST.md` cu format:

```markdown
# Run 6 Elevated Vault Hygiene COMPLETE — Reconciliation post Claude chat citation slip-uri

**Date:** 2026-05-08 chat NEW birou
**Tasks executed:** 6 sequential (fail-stop, all PASS)
**Cumulative LOCKED V1 ~688 PRESERVED unchanged** (vault meta-tooling NU product/architecture additive)
**Tests baseline:** 2648 PASS / 0 FAIL preserved (doc-only ZERO src ZERO regression)

## Tasks summary

### Task 1 — Reconcile + Compress CURRENT_STATE
[paste Task 1 report section]

### Task 2 — Sync DECISION_LOG entries chat-NEW1+NEW2+NEW3
[paste Task 2 report section]

### Task 3 — §29.5.7 V2 amendment verify + recovery
[paste Task 3 report section]

### Task 4 — §AR.14 + §AR.15 add VAULT_RULES
[paste Task 4 report section]

### Task 5 — Pre-Beta scope SSOT consolidare
[paste Task 5 report section]

### Task 6 — §CC.9 mandatory file updates
[paste Task 6 report section]

## Backup tags audit trail

- pre-run6-elevated-vault-hygiene-2026-05-08-XXXX (Task 1 baseline all tasks)

## Commits cumulative Run 6 elevated

[list all 6 task commit SHAs]

## Issues

[none if all PASS, OR enumerate concrete issues per task]

## Next action

Vault 100% curat. Strategic axis UNBLOCKED. Recommended next chat strategic:
- React migration plan tactical chat dedicat Daniel+Claude (output prompts CC pentru React migration implementation 1-2 săpt continuous)
- OR Scenarios coverage gap reduction strategic chat dedicat (~5-15 chat-uri Priority 2)
- OR Faza 3 STRANGLER pre-flight scope decisions (Co-CTO tactical singular chat)

Daniel decide priority order.
```

## Validation

- ✅ INDEX_MASTER stats refreshed accurate
- ✅ CURRENT_STATE §ACTIVE_REFS/ADRS/FLAGS synced post Run 6 elevated
- ✅ Pre-flight grep wikilinks orphane = 0 confirmed
- ✅ Timestamp consistency CURRENT_STATE + DECISION_LOG aligned
- ✅ LATEST.md final consolidated report generated
- ✅ Precedent LATEST archived per §3.3 NN continuous
- ✅ All 6 tasks commits pushed origin/main

## Report format `📤_outbox/LATEST.md` Task 6 section (final task)

```
### Task 6 — §CC.9 mandatory file updates
- Status: Complete
- Pre-flight: clean tree post Task 5 commit
- Modificări:
  - 00-index/INDEX_MASTER.md: stats refresh + timestamp Updated
  - 00-index/CURRENT_STATE.md: §ACTIVE_REFS + §ACTIVE_ADRS + §ACTIVE_FLAGS sync
- Wikilinks orphane: 0 verified (zero broken references)
- Timestamp consistency: ✅ CURRENT_STATE + DECISION_LOG aligned 2026-05-08
- Commits: <SHA> final consolidating Run 6 elevated
- Pushed: origin/main
- Issues: none
- Next: STOP. Run 6 elevated COMPLETE. Daniel decide priority order chat strategic NEW dedicat.
```

**RUN 6 ELEVATED COMPLETE.** Vault 100% curat. Strategic axis UNBLOCKED.
