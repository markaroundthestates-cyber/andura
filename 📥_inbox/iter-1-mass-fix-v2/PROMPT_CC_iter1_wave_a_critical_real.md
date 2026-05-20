# PROMPT_CC iter 1 V2 — Wave A — Critical real + Coach + ConfirmModal

**Model:** Opus 4.7 EXCLUSIVELY (Sonnet concediat permanent — D029 invariant). Verify `claude --version` shows Opus 4.7 or 4.6 only.
**Stop trigger UNIQUE:** Daniel manual STOP. NU stop la individual task fail (per-task fail-stop = skip + continue, see §6).
**Authority:** Daniel CEO directive 2026-05-20 evening — V2 design LANDED 4 mega-Waves. This is Wave A.
**Vault:** `C:\Users\Daniel\Documents\salafull\` (Windows ACASĂ).
**Branch:** main (post `165a3d1f` Track 7 + iter 9.5 LANDED).

---

## §0 Context summary

You are executing **Wave A** of Iter 1 Mass Fix V2 — Critical real OPEN findings + Coach engine wire + ConfirmModal shared + 7 use sites + Auth gaps + Bundle code-split + Security hygiene + a11y critical + GDPR critical + PWA + Prod ops + Backup/DR + DB tier + Engine math + Beta entry checklist.

**Source-of-truth backlog:** `📥_inbox/iter-1-mass-fix-v2/_MASTER_BACKLOG.md §A` (40 tasks A001-A040).

**Strategic plan:** `📥_inbox/iter-1-mass-fix-v2/ORCHESTRATOR.md`.

**Tasks count:** ~40 atomic (mix S/M/L). ETA Opus continuous: ~12-16h.

---

## §1 Pre-flight Wave A (execute ONCE at start)

```bash
# Verify Opus model
claude --version

# Verify vault state
cd C:/Users/Daniel/Documents/salafull
git status                          # expect clean
git log --oneline -5                # confirm HEAD post-iter-9.5 LANDED
git branch --show-current           # expect main

# Baseline tests
npm run test:run 2>&1 | tail -10    # expect 4290+ PASS, 0 fail

# Backup tag pre-Wave
git tag pre-wave-a-iter1-v2-2026-05-20-evening
git push origin pre-wave-a-iter1-v2-2026-05-20-evening

# Read SoT
cat 📥_inbox/iter-1-mass-fix-v2/ORCHESTRATOR.md | head -120
cat 📥_inbox/iter-1-mass-fix-v2/_MASTER_BACKLOG.md | head -250  # §A Wave A tasks

# GitNexus baseline (per CLAUDE.md mandatory)
npx gitnexus@latest analyze --quiet --output 📤_outbox/gitnexus-wave-a-pre.json
```

---

## §2 Per-task execution loop (40 iterations A001 → A040)

For each task in `_MASTER_BACKLOG.md §A` row by row:

```
STEP 1 — Read source-finding (D008 verbatim mandatory)
  Read the Source column file → grep finding ID → read 30 lines context
  Example A001 source MP-pass2-coachtoday-01..03:
    Read 📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-pass2-antrenor-components.md
    Find F-pass2-coachtoday-01 / 02 / 03 sections

STEP 2 — Read prod file primary location head 50 lines
  Example A001 file: src/react/routes/screens/antrenor/cards/CoachTodayCard.tsx
    Read first 50 lines (imports + initial component definition)

STEP 3 — Grep audit-fix pattern (anti-stale-baseline mandatory)
  grep -E "§<finding-id> audit fix" <prod file>
  Examples:
    grep -E "§7-C1 audit fix" src/react/routes/screens/Auth.tsx   # MATCH → already LANDED Phase 7
    grep -E "§5-C1 audit fix" src/react/routes/router.tsx          # NO MATCH → execute fix
  IF MATCH → mark task NO-OP LANDED in _progress.md → SKIP to next task. NU duplicate fix.
  IF NO MATCH → continue STEP 4

STEP 4 — gitnexus impact check (IF non-trivial scope, M or L effort)
  npx gitnexus@latest impact --target "<symbol or file>" --quiet
  Review impact: callers, dependents, test coverage

STEP 5 — Edit prod file per Title spec
  Use Edit/MultiEdit tool surgical changes
  Karpathy attribution per task explicit in commit message (SC/SF/TBC/GD)
  NU refactor-while-fixing
  NU speculative features
  NU "improve adjacent" temptation
  Match existing style even if you'd do differently

STEP 6 — gitnexus detect changes (verify only expected symbols touched)
  npx gitnexus@latest detect-changes --quiet
  Confirm scope minimal per task spec

STEP 7 — Run relevant tests IF tests touched
  npm run test:run -- <relevant spec path> 2>&1 | tail -5
  IF FAIL → STEP 9 (fail-stop)

STEP 8 — Atomic commit per task (no --no-verify)
  git add <files modified>
  git commit -m "fix(wave-a-<id>): <title> (<source>)"
  # Example: git commit -m "fix(wave-a-A001): Wire CoachTodayCard from getCoachToday aggregate (MP-pass2-coachtoday-01..03)"

STEP 9 — Update _progress.md (mark task LANDED + commit SHA)
  Edit 📥_inbox/iter-1-mass-fix-v2/_progress.md
  Change task row "PENDING" → "LANDED <commit-sha>"
  IF fail: change to "FAILED <stash-id> <reason>"

STEP 10 — Continue to next task
```

---

## §3 Detailed task list (40 tasks A001-A040)

See `_MASTER_BACKLOG.md §A` for full table. Tasks summary:

**§A.1 Coach engine wire (2 tasks):** A001 CoachTodayCard wire + A002 CoachRestCard wire (closes 5 CRIT MP-pass2-coach*).

**§A.2 ConfirmModal shared + 7 uses (8 tasks):** A003 build ConfirmModal.tsx new + A004-A010 wire 7 use sites in SettingsDanger + SettingsProfile + SettingsPrefs + Workout (closes 7 CRIT MP-missing-confirms-all-7).

**§A.3 Bundle code-split (2 tasks):** A011 router.tsx route-based React.lazy + A012 vite.config.js manualChunks verify (closes 3 CRIT NC§5-C1/C2/C3).

**§A.4 Auth chain remaining (4 tasks):** A013 Google OAuth (paradigm Cluster E020 depend — defer if Daniel undecided), A014 Skip-auth (paradigm E020 defer), A015 Onboarding T0 gate + Step1-6 bounds, A016 re-auth check account-delete.

**§A.5 Security hygiene + TS strict (6 tasks):** A017 Magic Link pendingEmail TTL/sessionStorage, A018 sendMagicLink throttle 30s, A019 Firebase URL env var, A020 remove `as any` engineWrappers, A021 Tailwind ↔ CSS vars migration, A022 TypeScript checkJs engines.

**§A.6 a11y critical (2 tasks):** A023 prefers-reduced-motion CSS + Framer Motion respect, A024 skip-link Layout.tsx.

**§A.7 GDPR critical (4 tasks):** A025 Privacy content live + A026 T&C content live + A027 right-to-erasure functional + A028 portability functional.

**§A.8 PWA + Prod ops remaining CRIT (5 tasks):** A029 UpdatePrompt vite-plugin-pwa, A030 NetworkFirst Firebase verify, A031 Prod ops runbook NEW, A032 healthcheck.cjs NEW, A033 deploy.yml rollback procedure.

**§A.9 Backup/DR (2 tasks):** A034 BACKUP_DR_RUNBOOK.md NEW + A035 test-restore.cjs fresh device.

**§A.10 DB tier + Engine math (3 tasks):** A036 DB Tier 0/1/2 sync audit + A037 Brzycki rounding + A038 Kalman convergence.

**§A.11 Phase 5+6 BATCH verify + Beta entry checklist (2 tasks):** A039 verify-phase-5-6-batch.cjs NEW + A040 BETA_ENTRY_CRITERIA.md NEW.

---

## §4 Fail-stop per task (anti-Wave-abort)

**IF task fails (STEP 7 test fail OR STEP 5 edit error OR STEP 6 unexpected impact):**

```bash
git stash push -m "wave-a-<id>-FAILED-<short-reason>"
# Mark task FAILED in _progress.md with stash ID + reason
# CONTINUE to next task — DO NOT abort Wave A
```

**Rationale:** Fail-stop Wave-level wastes ~12-16h. Per-task fail-stop preserves ~95% Wave value cu surgical retry cost post-Wave Daniel decision deferred OR re-scope.

---

## §5 Cluster E paradigm-dependent tasks (handling)

Tasks A013 Google OAuth + A014 Skip-auth depend on Cluster E020 Daniel paradigm decision. **Handling:**

- IF Daniel has decided E020 pre-Wave A start (check `📥_inbox/iter-1-mass-fix-v2/_progress.md §5 E020 status`):
  - IF E020 LANDED Daniel decision = "Implement Google OAuth Slice 1.0": execute A013
  - IF E020 LANDED Daniel decision = "Skip-auth only Slice 1.0": execute A014
  - IF E020 LANDED Daniel decision = "Magic Link only Slice 1.0": skip both A013 + A014, mark "DEFERRED Cluster E"

- IF E020 NOT decided: **SKIP A013 + A014**, mark "DEFERRED Cluster E pending Daniel E020 decision" in _progress.md. Continue with A015 onwards.

---

## §6 Post-Wave A completion (execute ONCE at end)

```bash
# Final tests
npm run test:run 2>&1 | tail -20
# Expect 4290+ PASS still, OR Wave A modifications added new tests (count delta documented)

# Type check
npm run typecheck 2>&1 | tail -10
# Expect 0 errors

# Build verify
npm run build 2>&1 | tail -20
# Expect Vite build OK + bundle size improved if A011+A012 LANDED

# GitNexus post
npx gitnexus@latest analyze --quiet --output 📤_outbox/gitnexus-wave-a-post.json

# Tag post-Wave
git tag post-wave-a-iter1-v2-2026-05-20-evening
git push origin post-wave-a-iter1-v2-2026-05-20-evening

# Push manual final per D031 invariant
git log --oneline pre-wave-a-iter1-v2-2026-05-20-evening..HEAD | wc -l
# Expect ~40 commits (less if some NO-OP/FAILED)
git push origin main
# Stop hook f40ebbc anti-recurrence D030 — verify push completes 0 violations

# Write Wave A report to outbox
cat > 📤_outbox/LATEST.md << 'EOF'
# Wave A LANDED — Iter 1 Mass Fix V2 — Critical real + Coach + ConfirmModal

## Status
COMPLETE (or PARTIAL if N failed tasks)

## Tasks executed
- A001-A040: <N LANDED> / <M NO-OP> / <K FAILED> / <X DEFERRED Cluster E>
- Findings closed (per source ID): <list>

## Build + Tests
- Tests: <X> PASS / <Y> FAIL
- Typecheck: 0 errors
- Build: OK, bundle main = <Z> KB (was 432KB pre-Wave A — target ≤145KB post A011+A012)

## Commits + Push
- Commits Wave A: <count>
- Tag pre: pre-wave-a-iter1-v2-2026-05-20-evening
- Tag post: post-wave-a-iter1-v2-2026-05-20-evening
- Push: origin main + tags ✓

## Issues
- <enumerate failed tasks with stash IDs + reasons>
- <enumerate deferred tasks Cluster E>

## Next action
- Daniel review Wave A LANDED report
- Daniel decide: trigger Wave B (paste PROMPT_CC_iter1_wave_b_surgical_text_polish.md) OR pause for issue resolution
- Optionally: Daniel can spawn Wave B + Wave C parallel sessions (per _DAG.md §2 analysis — LOW collision risk)
EOF
```

---

## §7 Karpathy 4 principii reminder per task

- **SC (Surgical Changes):** text swaps, token alignment, ONE-LINE fixes. NO refactor.
- **SF (Simplicity First):** delete dead code, archive legacy, NO speculative abstractions.
- **TBC (Think Before Coding):** new components (ConfirmModal + SubHeader), structured features. Verify mockup spec FIRST.
- **GD (Goal-Driven):** multi-file refactors (Bundle code-split + Tailwind CSS vars + GDPR functional + DST). Beta blocker primary lens.

Per task `_MASTER_BACKLOG.md §A` row has Karpathy column — attribution must match commit message.

---

## §8 Anti-recurrence invariants (MANDATORY per task)

- **D008** primary-source verify mandatory — read line cited verbatim NU recall
- **D029 stale baseline lesson** — per-task HEAD grep `§<id> audit fix` mandatory
- **D031** push manual final at end-of-Wave NOT per task — preserve `f40ebbc` Stop hook anti-recurrence D030
- **D041** anti-inflation per-task report explicit closed-count, NU compound
- **D008 + gitnexus** before significant edits
- **Karpathy attribution** explicit in commit message format `fix(wave-a-<id>): <title> (<source>) [<karpathy>]`

---

## §9 If MCP timeout 4min — verify filesystem-side BEFORE assume crash

Per D023 + ANDURA_PRIMER §F3.* MCP timeout pattern:
- IF tool call returns no response after 4min → check vault state directly: `git status`, `git log --oneline -3`
- IF changes present locally + tests pass → tool call succeeded, MCP just lost response. CONTINUE.
- IF NO changes + tests pre-modification state → tool call genuinely failed. RETRY task.

---

🦫 **Wave A — START.** Read `_MASTER_BACKLOG.md §A`. Execute 40 tasks A001-A040 per §2 loop. Fail-stop per task only. Push manual final. Write LATEST.md report. Daniel reviews → trigger Wave B.
