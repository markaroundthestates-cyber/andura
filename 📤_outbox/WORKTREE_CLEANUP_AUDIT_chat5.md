---
title: Worktree Cleanup Audit (chat 5)
date: 2026-05-23
type: audit-report
status: READ-ONLY (Daniel decide cleanup later)
trigger: Co-CTO autonomous hygiene chat 5 cleanup pass
---

# Worktree Cleanup Audit — chat 5

## Summary

| Metric | Count |
|--------|-------|
| Total worktrees | 76 |
| `worktree-agent-*` (Claude agent spawns) | 74 |
| Main repo (`salafull` @ main) | 1 |
| External (`sv-chat2v-reviewfix-*` în %TEMP%) | 1 |
| Locked (claude agent pid 5412) | 74 |
| Unique HEAD SHAs across worktrees | 47 |

**Outcome:** ZERO deletions. Pure read-only enumeration per directive. Daniel decide cleanup strategy ulterior.

---

## HEAD distribution

Most agent worktrees concentrated pe puține commits (multi spawn-uri share aceeași baseline → posibil never-modified, prime candidate cleanup).

| HEAD SHA | Worktree count | Commit subject |
|----------|----------------|----------------|
| `d89517fe` | 30 | `fix(security-review-secret-name): ANTHROPIC_API_KEY canonical match Track 7 [GD]` |
| `fe130b9d` | 1 (main) | `polish(pass-14-dividers-spacing): mockup parity sweep [POLISH]` |
| `ecdd1938` | 1 (sv-chat2v-reviewfix) | external gsd-reviewfix branch |
| (44 others) | 1 each | varied — actual work commits |

**Interpretation:** 30/74 agent worktrees stuck pe d89517fe = likely spawned + immediately abandoned (no commits made post-spawn). Eligible cleanup pass.

---

## Sample listing (first 10 + last 5)

```
.claude/worktrees/agent-a0d3c728f1e3bdfb1   e6a26c09  [worktree-agent-a0d3c728f1e3bdfb1] locked
.claude/worktrees/agent-a11142d7f3c40c0d3   c12ea976  [worktree-agent-a11142d7f3c40c0d3] locked
.claude/worktrees/agent-a134946e52308dbc6   a36aed58  [worktree-agent-a134946e52308dbc6] locked
.claude/worktrees/agent-a137ff7c145911239   d89517fe  [worktree-agent-a137ff7c145911239] locked
.claude/worktrees/agent-a1381b3d0ab735ef7   d89517fe  [worktree-agent-a1381b3d0ab735ef7] locked
.claude/worktrees/agent-a14548515dddfd275   d540e4c8  [worktree-agent-a14548515dddfd275] locked
.claude/worktrees/agent-a14e19f201123b9c0   d89517fe  [worktree-agent-a14e19f201123b9c0] locked
.claude/worktrees/agent-a200e1df33feac720   6b0c7f08  [worktree-agent-a200e1df33feac720] locked
.claude/worktrees/agent-a237a7898d6a947c5   d89517fe  [worktree-agent-a237a7898d6a947c5] locked
.claude/worktrees/agent-a2852815f2c32a7dd  3460d425  [worktree-agent-a2852815f2c32a7dd] locked
...
.claude/worktrees/agent-aff5a24a5a87cf3d1   e6cdd013  [worktree-agent-aff5a24a5a87cf3d1] locked
.claude/worktrees/agent-afbba071554def57c   d89517fe  [worktree-agent-afbba071554def57c] locked
.claude/worktrees/agent-af9b1efe9fa150bff   d89517fe  [worktree-agent-af9b1efe9fa150bff] locked
.claude/worktrees/agent-af480590cb22dadaa   d89517fe  [worktree-agent-af480590cb22dadaa] locked
.claude/worktrees/agent-af32549c953f622b3   2d58257c  [worktree-agent-af32549c953f622b3] locked
```

Full list via `git worktree list` la repo root.

---

## Lock state

All 74 agent worktrees `locked claude agent agent-<id> (pid 5412)`. pid 5412 = Claude Code daemon. Lock prevents accidental `git worktree prune` clobber.

**Lock implication:** `git worktree remove` va fail fără `--force` SAU explicit unlock + prune sequence. Daniel decide ulterior.

---

## Recommendations (NU action — read-only audit)

1. **High-confidence cleanup target:** 30 worktrees stuck pe d89517fe (Track 7 secret-name fix commit). Many likely spawned + abandoned without commits. Safe to prune after verify clean working tree per worktree.
2. **Medium-confidence:** ~44 worktrees pe diverse HEADs — verify each for uncommitted changes BEFORE prune.
3. **Skip cleanup:** main + sv-chat2v-reviewfix (active gsd-reviewfix branch).
4. **Cleanup sequence când Daniel approves:**
   - `git worktree unlock <path>` per worktree
   - `git worktree remove <path>` (sau `--force` if uncommitted noise tolerable)
   - `git worktree prune` final sweep
   - `git branch -D worktree-agent-*` cleanup branches (if needed)

**Disk size:** `du -sh .claude/worktrees/` background scan running — likely multi-GB given 74 worktree count × Andura src/.

---

## tmp scripts cleanup (parallel task)

6 untracked PowerShell debug helpers removed la repo root:
- `tmp_w17_actionable.ps1` (32 lines)
- `tmp_w17_lock_check.ps1` (10 lines)
- `tmp_w17_path_entries.ps1` (28 lines)
- `tmp_w17_struct.ps1` (9 lines)
- `tmp_w19_low_open.ps1` (11 lines)
- `tmp_w19_low_parity.ps1` (16 lines)

Total: 106 lines, 6 files. ZERO `tmp_w22_*.ps1` found (directive mentioned but absent from filesystem). ZERO git history affected (untracked).

---

## Constraints honored

- ZERO worktree deletions (Daniel decides)
- ZERO `--no-verify` git ops
- ZERO push (D031 invariant)
- ZERO tracked-file edits
- Read-only enumeration only

**Status:** AUDIT COMPLETE — awaiting Daniel cleanup directive.
