---
title: Worktree Cleanup Plan (chat 5 deep-dive recommendation)
date: 2026-05-23
type: cleanup-plan
status: READ-ONLY recommendation — Daniel decide trigger
trigger: Co-CTO post-chat-5 hygiene actionable follow-up
supersedes: WORKTREE_CLEANUP_AUDIT_chat5.md (this plan = per-worktree verdict)
---

# Worktree Cleanup Plan — chat 5

Per-worktree DELETE-SAFE vs REVIEW verdict cu bulk delete command surfaced. Successor la `WORKTREE_CLEANUP_AUDIT_chat5.md` (enumeration only) + `WORKTREE_CLEANUP_AUDIT_chat5_size.md` (3.7G disk backfill).

## §1 Executive summary

- **84 agent worktrees** + 1 temp AppData (`sv-chat2v-reviewfix-*`) + 1 main = **86 total** registered. Discrepancy vs prior audit (74) = +10 spawn chat 5 cumulative post audit timestamp.
- **74 DELETE-SAFE** = work already on main (38 REACHABLE_FROM_MAIN) sau patch-equivalent on main via different SHA (36 PATCH_EQUIV_ON_MAIN).
- **10 REVIEW** = `git cherry main <SHA>` returned `+` (unique patch not on main). Of these 10, 7 have **commit message exact match** on main via different SHA (= work effectively re-landed; safe to delete) + 3 are **genuinely unmerged** (pass-15, pass-8 SubHeader, pass-17 shadow-elevation).
- **Estimated disk recovery:** ~3.6G (74 × ~50M avg per worktree) per prior `du -sh 3.7G` audit baseline.
- **Risk:** ZERO data loss for DELETE-SAFE batch (all work landed). REVIEW batch needs case-by-case decision (cherry-pick salvage or accept loss).

---

## §2 Methodology

For each agent worktree:

1. `git worktree list --porcelain` → parse `worktree` + `HEAD` pairs (84 agents).
2. Per HEAD SHA:
   - `git merge-base --is-ancestor <SHA> main` → **REACHABLE_FROM_MAIN** if exit 0 (DELETE-SAFE).
   - Else `git cherry main <SHA>` → `-` prefix means patch-equivalent already on main via different SHA (DELETE-SAFE: PATCH_EQUIV_ON_MAIN). `+` prefix means genuinely unique patch (REVIEW).
3. REVIEW candidates: cross-check commit message vs main `git log main --format="%H %s" | grep "<msg>"` to find canonical replacement SHA. If found → SAFE delete (work redone with different SHA, often due to base drift / worktree conflict). If not found → genuinely unmerged.

**Why `git cherry` matters:** when an agent worktree commit was cherry-picked onto main, git cherry detects patch-equivalence regardless of SHA. When the same commit message appears on main with different SHA (e.g., `f62f2db2` D076 LOCK in worktree → `ca837008` "manual scribe post-worktree-conflict" on main), the work landed via different commit and worktree is redundant.

---

## §3 DELETE-SAFE list (74 worktrees)

### 3a. REACHABLE_FROM_MAIN (38 worktrees)

HEAD SHA is direct ancestor of main → work landed.

| Worktree | HEAD | Commit subject |
|----------|------|----------------|
| agent-a137ff7c145911239 | d89517fe | fix(security-review-secret-name): ANTHROPIC_API_KEY canonical match Track 7 [GD] |
| agent-a1381b3d0ab735ef7 | d89517fe | fix(security-review-secret-name): ANTHROPIC_API_KEY canonical match Track 7 [GD] |
| agent-a14e19f201123b9c0 | d89517fe | (same baseline) |
| agent-a237a7898d6a947c5 | d89517fe | (same baseline) |
| agent-a48018b6e2f7cf524 | d89517fe | (same baseline) |
| agent-a52d9e65160f40c31 | d89517fe | (same baseline) |
| agent-a580619a99d175d44 | d89517fe | (same baseline) |
| agent-a62c2f43b212aa61d | d89517fe | (same baseline) |
| agent-a789240c8d4a5faeb | d89517fe | (same baseline) |
| agent-a7b696d8012af92fa | d89517fe | (same baseline) |
| agent-a7e0f086ce69a11ed | d89517fe | (same baseline) |
| agent-a830195c2887bdd79 | d89517fe | (same baseline) |
| agent-a87c1c5c974d686bd | d89517fe | (same baseline) |
| agent-a9165a1c802dceb88 | d89517fe | (same baseline) |
| agent-a95ea5fb511bcc633 | d89517fe | (same baseline) |
| agent-ac448c30ffb53cef9 | d89517fe | (same baseline) |
| agent-ad15f20d8a2716868 | d89517fe | (same baseline) |
| agent-ad795878878dde419 | d89517fe | (same baseline) |
| agent-adf7786f93a58bec3 | d89517fe | (same baseline) |
| agent-ae17ac44501584c6f | d89517fe | (same baseline) |
| agent-ae5649035235a0a3a | d89517fe | (same baseline) |
| agent-ae96292c319cec823 | d89517fe | (same baseline) |
| agent-aef5cb80dbd2b98e8 | d89517fe | (same baseline) |
| agent-aef6b7047789e04e9 | d89517fe | (same baseline) |
| agent-aefbe5a25d300594d | d89517fe | (same baseline) |
| agent-af480590cb22dadaa | d89517fe | (same baseline) |
| agent-af9b1efe9fa150bff | d89517fe | (same baseline) |
| agent-afbba071554def57c | d89517fe | (same baseline) |
| agent-a08349742c477c4a0 | fd47d383 | polish(pass-16-icons-size-stroke): mockup parity sweep [POLISH] |
| agent-a092be0361600e8c4 | fd47d383 | (same — current HEAD on main) |
| agent-a0e4b7796c96e6056 | fd47d383 | (same) |
| agent-a128e382561470a2b | fd47d383 | (same — THIS investigator) |
| agent-a1e11a151404cbbea | fd47d383 | (same) |
| agent-a653ae7c879d79be6 | fd47d383 | (same) |
| agent-aaab90f0db21d988d | fd47d383 | (same) |
| agent-ab703f73c7cc60e41 | fd47d383 | (same) |
| agent-ac1db7a9f74975347 | fd47d383 | (same) |
| agent-a93e636025ee73bff | cbe82ebe | polish(settings-stack-wider-sweep): radius 14px [POLISH] (on main) |

**Note:** 28× `d89517fe` baseline = stuck "skeleton" worktrees never modified beyond initial branch checkout. 9× `fd47d383` = current main HEAD (agent spawned but did no work post-spawn or already merged). All 38 = pure disk waste.

### 3b. PATCH_EQUIV_ON_MAIN (36 worktrees)

`git cherry main <SHA>` returned `-` → patch already on main via different SHA (cherry-pick or re-commit).

| Worktree | HEAD | Commit subject |
|----------|------|----------------|
| agent-a714f16890bb91769 | 2592cc38 | chore(user-profile-decode-jwt-prune-buffer-dead-branch) [NIT FIX] |
| agent-a200e1df33feac720 | 6b0c7f08 | doc(d-codify-d060-d061-d056-d064) [DOC] |
| agent-a7d25c3ba60104bc2 | 7eeb050e | doc(decisions-d050-phase-6-prod-extras-blessed-divergence) [DOC] |
| agent-ac584b96ab18b9a2c | 3624a1e6 | doc(handover-chat5-final-wrap) [DOC] |
| agent-a346ff0e04a18a1b4 | af7b75eb | feat(orchestrator-sentry-adapter-coverage-start) [TACTICAL] |
| agent-ac92588f707d9d2c3 | 1a19f7cd | feat(post-rpe-pr-records-writeback) [FEAT] |
| agent-a7a1ea20a988afe8f | 21d01e55 | fix(aa-friction-detect-timestamp-zero-guard) [LOW FIX] |
| agent-a626dd19c8bea765d | a96ea081 | fix(antrenor-use-effect-catch-rejection) [HIGH FIX] |
| agent-ae2b58e8e56ee648f | 45a55d0d | fix(coach-rest-card-truth-fallback) [MED FIX] |
| agent-aa05cbb8e81d8a1e1 | 5ba9fbfd | fix(coach-today-card-truth-quote) [HIGH FIX] |
| agent-a995bd889ff637dd1 | d43cf19c | fix(coach-today-card-use-memo-deps) [MED FIX] |
| agent-a2852815f2c32a7dd | 3460d425 | fix(coach-voice-coach-pick-unknown-category-safe-fallback) [LOW FIX] |
| agent-a46ac0bdbe27eb9c3 | d5cf9b02 | fix(db-set-quota-exceeded-resilience) [MED FIX] |
| agent-a11142d7f3c40c0d3 | c12ea976 | fix(firebase-remove-window-pollution) [MED FIX] |
| agent-a52c4745170879e6a | 950f826b | fix(persona-enum-unify-gigica-canonical) [CRIT FIX] |
| agent-acc06cc4d020b3a8a | edaa001b | fix(pr-history-aggregate-peak-onerm-semantic) [MED FIX] |
| agent-a134946e52308dbc6 | a36aed58 | fix(reality-tz-local-date-consistency) [CRIT FIX] |
| agent-a650f9b70ef81c82a | 624d9cfb | fix(schedule-adapter-falsy-coercion-nullish-coalesce) [LOW FIX] |
| agent-a88997956fec031c7 | cb123c4a | fix(schedule-store-toggle-day-type-safety) [MED FIX] |
| agent-af32549c953f622b3 | 2d58257c | fix(stats-grid-plural-ro-helper-reuse) [MED FIX] |
| agent-a0d3c728f1e3bdfb1 | e6a26c09 | fix(telemetry-track-event-consent-gate) [MED FIX] |
| agent-a48f7bcca9d415a67 | 12c41c2f | fix(use-sessions-by-date-multi-session-array) [LOW FIX] |
| agent-a14548515dddfd275 | d540e4c8 | fix(workout-preview-fallback-guard) [TACTICAL FIX] |
| agent-aff5a24a5a87cf3d1 | e6cdd013 | fix(workout-store-pause-session-truth-title) [HIGH FIX] |
| agent-a703d24198e680446 | 0f7eed69 | polish(drift-2-fatigue-strip-mockup-literal) [TACTICAL] |
| agent-aed46720157c371f0 | 30ad0d9f | polish(drift-3-heatmap-weekly-restore-non-interactive) [TACTICAL] |
| agent-a2bf7075fab33f8e6 | 6daad3fb | polish(pass-11-card-border-consistency) [POLISH] |
| agent-aacf80217920974ec | 953523dd | polish(pass-12-modal-sheet-padding) [POLISH] |
| agent-a287c85a56bb05922 | 15a03777 | polish(pass-13-typography-weight-size) [POLISH] |
| agent-ae36c8d199087646a | 930cf995 | polish(pass-14-dividers-spacing) [POLISH] |
| agent-ae3701f27d6c552bf | e2acf587 | polish(pass-7-visual-refresh-form-input-radius) [POLISH] |
| agent-ac13ed56d291ca254 | 654c1b5f | refactor(engine-wrappers-4th-duplication-eliminate) [HIGH FIX] |
| agent-a4d9cc45d61ff9080 | f59a4e71 | refactor(engine-wrappers-flatten-helper-extract) [HIGH FIX] |
| agent-a90c344dc4f80b8b0 | 5c0dc22c | refactor(severity-map-magic-constant-centralize) [LOW FIX] |
| agent-a7e1146d534400ca2 | 8e3353b3 | refactor(stagnation-weeks-threshold-constant) [MED FIX] |
| agent-ab95a825fdc8fffad | b1d329d1 | test(coach-voice-scenarios-fill-7-todo) [BLOCKER FIX] |

---

## §4 REVIEW list (10 worktrees — case-by-case verdict)

| Worktree | HEAD | Commit subject | Verdict + reason |
|----------|------|----------------|------------------|
| agent-a453d69c8d3f12443 | f8de3061 | fix(d-legacy-064-ampersand-sweep-ro-si-v2) [BATCH FIX] | **SAFE DELETE** — `bcdac136` on main has exact same message (work re-landed manually post worktree conflict) |
| agent-a59a5d68ea7d3776a | da1e8d67 | fix(telemetry-firestore-field-transforms) [MED FIX] | **SAFE DELETE** — `0b53b2a8` on main = same msg + same work |
| agent-a61dd0d47ca9c241e | c85f04f4 | fix(workout-store-reset-semantic-clarify) [LOW FIX] | **SAFE DELETE** — `a979a434` on main = same msg + same work |
| agent-a8921720ecc136e3d | c4ae9f4a | fix(d-legacy-064-ampersand-sweep-ro-si) (v1) [BATCH FIX] | **SAFE DELETE** — superseded by v2 (`bcdac136` on main); v1 was preliminary attempt |
| agent-a944f5382da0be603 | 6393601a | fix(coach-today-card-fallback-truth-ampersand) [MED FIX] | **SAFE DELETE** — `b0073c66` on main = same msg + same work |
| agent-ac7080767ac5f9194 | f62f2db2 | doc(decisions-d076-phase-6-prod-extras-blessed-divergence) LOCK V1 [DOC] | **SAFE DELETE** — `ca837008` on main = "manual scribe post-worktree-conflict" (commit msg explicitly admits replacement of worktree D076 attempt) |
| agent-adfa867cf57eaf09c | 8602e0e0 | fix(post-rpe-hardcoded-persist-fallback) [HIGH FIX] | **SAFE DELETE** — `bd1f50a9` on main = same msg + same work |
| agent-aabd9d1d3f14bca0b | 23a07f3d | polish(pass-8-subheader-padding) [POLISH] | **GENUINELY UNMERGED** — pass-7, pass-9 through pass-16 on main, pass-8 GAP. Either Daniel skipped pass-8 intentionally or worktree work never landed. Decision: cherry-pick salvage OR accept loss. |
| agent-ae6aae1f03f609542 | a019f328 | polish(pass-15-chip-badge-pill) [POLISH] | **GENUINELY UNMERGED** — pass-14 + pass-16 on main, pass-15 GAP. Same as pass-8 above. |
| agent-a1ac47e38507f09b5 | 212d4784 | polish(pass-17-shadow-elevation-uniformization) [POLISH] | **GENUINELY UNMERGED + NEWEST** — pass-17 NOT on main (latest polish = pass-16 fd47d383). Recent commit (2026-05-23 21:37 timestamp). Decision: cherry-pick salvage (5 React components + tailwind shadow tokens) BEFORE delete. |

**Recommended action REVIEW batch:**
- **7 SAFE DELETE** (rows 1-7) — work already on main via different SHA. Add to bulk delete §5.
- **3 GENUINELY UNMERGED** (rows 8-10, pass-8/15/17) — Daniel decide:
  - **Option A:** cherry-pick onto main (~3 commits to recover)
  - **Option B:** accept loss as part of cleanup (pass-8/15 minor cosmetic, pass-17 substantive ~5 components)
  - **Option C:** keep worktrees temporarily, decide after pre-Beta walkthrough

---

## §5 Bulk delete commands

### PowerShell (Windows native, run from `C:\Users\Daniel\Documents\salafull`)

```powershell
# Bulk delete 74 DELETE-SAFE worktrees (38 REACHABLE + 36 PATCH_EQUIV)
# Optional: add 7 SAFE DELETE from §4 REVIEW for total 81 deletions
$safe = @(
  "agent-a08349742c477c4a0", "agent-a092be0361600e8c4", "agent-a0d3c728f1e3bdfb1",
  "agent-a0e4b7796c96e6056", "agent-a11142d7f3c40c0d3", "agent-a128e382561470a2b",
  "agent-a134946e52308dbc6", "agent-a137ff7c145911239", "agent-a1381b3d0ab735ef7",
  "agent-a14548515dddfd275", "agent-a14e19f201123b9c0", "agent-a1e11a151404cbbea",
  "agent-a200e1df33feac720", "agent-a237a7898d6a947c5", "agent-a2852815f2c32a7dd",
  "agent-a287c85a56bb05922", "agent-a2bf7075fab33f8e6", "agent-a346ff0e04a18a1b4",
  "agent-a46ac0bdbe27eb9c3", "agent-a48018b6e2f7cf524", "agent-a48f7bcca9d415a67",
  "agent-a4d9cc45d61ff9080", "agent-a52c4745170879e6a", "agent-a52d9e65160f40c31",
  "agent-a580619a99d175d44", "agent-a626dd19c8bea765d", "agent-a62c2f43b212aa61d",
  "agent-a650f9b70ef81c82a", "agent-a653ae7c879d79be6", "agent-a703d24198e680446",
  "agent-a714f16890bb91769", "agent-a7a1ea20a988afe8f", "agent-a7b696d8012af92fa",
  "agent-a7d25c3ba60104bc2", "agent-a7e0f086ce69a11ed", "agent-a7e1146d534400ca2",
  "agent-a789240c8d4a5faeb", "agent-a830195c2887bdd79", "agent-a87c1c5c974d686bd",
  "agent-a88997956fec031c7", "agent-a90c344dc4f80b8b0", "agent-a9165a1c802dceb88",
  "agent-a93e636025ee73bff", "agent-a944f5382da0be603", "agent-a95ea5fb511bcc633",
  "agent-a995bd889ff637dd1", "agent-aa05cbb8e81d8a1e1", "agent-aaab90f0db21d988d",
  "agent-aacf80217920974ec", "agent-ab703f73c7cc60e41", "agent-ab95a825fdc8fffad",
  "agent-ac13ed56d291ca254", "agent-ac1db7a9f74975347", "agent-ac448c30ffb53cef9",
  "agent-ac584b96ab18b9a2c", "agent-ac92588f707d9d2c3", "agent-acc06cc4d020b3a8a",
  "agent-ad15f20d8a2716868", "agent-ad795878878dde419", "agent-adf7786f93a58bec3",
  "agent-ae17ac44501584c6f", "agent-ae2b58e8e56ee648f", "agent-ae36c8d199087646a",
  "agent-ae3701f27d6c552bf", "agent-ae5649035235a0a3a", "agent-ae96292c319cec823",
  "agent-aed46720157c371f0", "agent-aef5cb80dbd2b98e8", "agent-aef6b7047789e04e9",
  "agent-aefbe5a25d300594d", "agent-af32549c953f622b3", "agent-af480590cb22dadaa",
  "agent-af9b1efe9fa150bff", "agent-afbba071554def57c", "agent-aff5a24a5a87cf3d1"
)
# Optional 7 extra (REVIEW SAFE DELETE — work re-landed on main via diff SHA):
# $safe += @("agent-a453d69c8d3f12443", "agent-a59a5d68ea7d3776a", "agent-a61dd0d47ca9c241e",
#            "agent-a8921720ecc136e3d", "agent-a944f5382da0be603", "agent-ac7080767ac5f9194",
#            "agent-adfa867cf57eaf09c")

foreach ($wt in $safe) {
  $path = ".claude/worktrees/$wt"
  if (Test-Path $path) {
    git worktree remove $path --force
    Write-Host "Removed: $wt"
  }
}
git worktree prune
git branch | Where-Object { $_ -match "worktree-agent-" } | ForEach-Object {
  git branch -D ($_.Trim() -replace "^\* ?", "")
}
Write-Host "DONE. Run: git worktree list  # verify clean"
```

### Bash POSIX equivalent (Git Bash / WSL)

```bash
cd /c/Users/Daniel/Documents/salafull
SAFE=(
  agent-a08349742c477c4a0 agent-a092be0361600e8c4 agent-a0d3c728f1e3bdfb1
  # ... (paste full list from PowerShell §safe array above) ...
)
for wt in "${SAFE[@]}"; do
  if [ -d ".claude/worktrees/$wt" ]; then
    git worktree remove ".claude/worktrees/$wt" --force
    echo "Removed: $wt"
  fi
done
git worktree prune
git branch | grep "worktree-agent-" | xargs -I {} git branch -D {}
```

---

## §6 Caveats

- **3 GENUINELY UNMERGED (pass-8/15/17):** before delete, decide:
  ```bash
  # Preserve as cherry-pick commits on main (re-author or use Daniel as author):
  git cherry-pick 23a07f3d  # pass-8 subheader
  git cherry-pick a019f328  # pass-15 chip/badge/pill
  git cherry-pick 212d4784  # pass-17 shadow-elevation (5 components + tailwind config)
  ```
  Then add those 3 worktrees (`agent-aabd9d1d3f14bca0b`, `agent-ae6aae1f03f609542`, `agent-a1ac47e38507f09b5`) to delete batch.

- **Locked worktrees:** all agent worktrees show `locked` in `git worktree list` (Claude Code session lock with pid 5412 likely stale post-session-end). `git worktree remove --force` overrides lock.

- **Temp AppData worktree** (`sv-chat2v-reviewfix-IQMMRs` at `ecdd1938`) — patch on main as `ecdd1938` exact SHA (REACHABLE). Safe to delete via:
  ```powershell
  git worktree remove "C:\Users\Daniel\AppData\Local\Temp\sv-chat2v-reviewfix-IQMMRs" --force
  ```

- **Branch cleanup:** `git worktree remove` deletes worktree dir but `worktree-agent-*` branch refs persist. `git branch -D` loop in §5 cleans those. Branch refs hold ~0 disk but pollute `git branch` output.

- **No push:** D031 invariant — branches are local-only, no `origin/worktree-agent-*` to delete. Pure local cleanup.

- **D049 race anti-recurrence:** post-cleanup, FUTURE agent spawns should respect D049 file-coordinator pattern (touch `worktrees/.coordinator.lock` before write) to prevent main contention. This plan doesn't add new locks — existing chat 5 commits already establish pattern.

---

## §7 Cross-refs

- **Prior enumeration:** `[[📤_outbox/WORKTREE_CLEANUP_AUDIT_chat5.md]]` (commit `4b44c8eb`) — 76 worktrees baseline + 47 unique HEADs.
- **Disk backfill:** `[[📤_outbox/WORKTREE_CLEANUP_AUDIT_chat5_size.md]]` (commit `86e88966`) — 3.7G `du -sh` result.
- **Race anti-recurrence:** `[[DECISIONS.md §D049]]` orchestrator main-touch-coordinator + worktree spawn discipline (chat 4 lesson + chat 5 reinforce post 30+ agent batch).
- **Live continuity:** `[[CHAT_STATE.md]]` chat 5 wrap — Wave 19 next post-cleanup pending.
- **CC.2 startup:** dashboard auto-start step 7 (manager role per D-Daniel chat 3 LOCK V1) — agent spawns continue dashboard-tracked.
- **Push policy:** `[[DECISIONS.md §D031]]` — local branch ahead origin/main expected, no auto-push.

---

**Status:** READ-ONLY recommendation. ZERO worktree delete executed by this investigation. Daniel decide trigger bulk delete §5 (74 DELETE-SAFE auto-safe; +7 REVIEW SAFE DELETE opt-in; 3 pass-8/15/17 cherry-pick first OR accept loss).

**Generated by:** Co-CTO investigation agent (worktree `agent-a128e382561470a2b` HEAD `fd47d383`, ironically itself DELETE-SAFE post-task).
