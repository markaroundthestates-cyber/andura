# ORCHESTRATOR — Overnight Batch 2026-05-06 evening

═══════════════════════════════════════════════════════════════════
**Model:** Opus
**Mode:** Single CC instance chained, fail-continue inter-task, fail-stop intra-task
**Hardware target:** i7-8700K 6c/12t @ 3.70GHz + 64 GB RAM @ 3600 MHz (Windows 10 Pro, PowerShell)
═══════════════════════════════════════════════════════════════════

## Pre-flight (mandatory ABSOLUT, before any task)

```powershell
cd C:\Users\Daniel\Documents\salafull
git status                                          # verify clean tree (acceptable: untracked outside scope)
git branch --show-current                           # verify on `main`
$ts = Get-Date -Format "yyyy-MM-dd-HHmm"
git tag "pre-overnight-batch-$ts"                   # MANDATORY backup tag
git push origin "pre-overnight-batch-$ts"
```

Verify Node + npm available before proceeding. Abort dacă tree dirty în scope (untracked files outside acceptable, modified scope files = STOP).

═══════════════════════════════════════════════════════════════════

## TASK 1 — Auth Phase 2 Batch 2 (Settings UI + Anonymous→Auth Merge)

1. Read `📥_inbox/TASK_1_AUTH_PHASE2_BATCH2.md` integral
2. Execute spec verbatim (wording UI LOCKED V1 — ZERO drift even minor punctuation)
3. **Pre-commit gate STRICT:**
   - `npm run test:run` ALL pass (zero regression existing + tests new pentru flows added)
   - `npm run build` clean (zero warnings escalated to errors)
   - **FAIL gate** = ABORT TASK 1, mark **FAILED** în raport, **SKIP TASK 2** (logical dep — batch 3 build pe batch 2), proceed direct TASK 3
4. **PASS gate** → commit + post-task tag:
   ```powershell
   git add -A
   git commit -m "feat(auth-phase2-batch2): Settings UI lifecycle + Anonymous→Auth Merge Fork Decision UI"
   $ts = Get-Date -Format "yyyy-MM-dd-HHmm"
   git tag "post-task-1-auth-phase2-batch2-$ts"
   git push origin main "post-task-1-auth-phase2-batch2-$ts"
   ```
5. Append progressive `📤_outbox/LATEST.md` cu Status PASS/FAIL + diff summary + tests + build status

═══════════════════════════════════════════════════════════════════

## TASK 2 — Auth Phase 2 Batch 3 (Logout + cleanup + Telemetry + Firestore Rules)

**CONDITIONAL:** Run only if TASK 1 PASS. Else mark **SKIPPED** în raport, proceed TASK 3.

1. Read `📥_inbox/TASK_2_AUTH_PHASE2_BATCH3.md` integral
2. Execute spec verbatim
3. Pre-commit gate identic TASK 1 (test + build strict)
4. PASS → commit + post-task tag:
   ```powershell
   git commit -m "feat(auth-phase2-batch3): Logout double-confirm + admin-cleanup + Telemetry + Firestore Rules"
   git tag "post-task-2-auth-phase2-batch3-$(Get-Date -Format yyyy-MM-dd-HHmm)"
   git push origin main "post-task-2-*"
   ```
5. Append `📤_outbox/LATEST.md` cu Status

═══════════════════════════════════════════════════════════════════

## TASK 3 — Stryker Baseline Mutation Testing

**ALWAYS RUN** (independent de TASK 1/2 status — captures actual codebase state post-Auth-attempt, baseline legit indif). CPU-bound long ~6-12h real pe i7-8700K.

1. Read `📥_inbox/TASK_3_STRYKER_BASELINE.md` integral
2. Install deps + extend stryker.conf.js scope `src/**/*.js` complet per Daniel directive Bugatti
3. Run `npx stryker run --configFile tests/golden-master/mutation/stryker.conf.js`
4. Generate audit raport `tests/golden-master/mutation/baseline_<timestamp>.md` cu mutation score per cluster + top 20 survived mutants prioritized (safety paths first)
5. Commit raport-only (NU touch `src/**`):
   ```powershell
   git add tests/golden-master/mutation/
   git commit -m "feat(mutation): Stryker baseline audit pre-Beta"
   git push origin main
   ```

═══════════════════════════════════════════════════════════════════

## Final report `📤_outbox/LATEST.md`

Single comprehensive raport cu:

- **Pre-flight status:** backup tag created + clean tree verify
- **Task 1 status:** PASS/FAIL/SKIPPED + commits SHA + tags + diff summary + tests pass count + build status
- **Task 2 status:** PASS/FAIL/SKIPPED (note dependency on Task 1 PASS) + commits + tags + diff summary
- **Task 3 status:** PASS/FAIL + raport path + mutation score summary per cluster
- **Issues encountered:** any warnings, edge cases, OOM, timeouts
- **Next action recommendation pentru Daniel:** prioritized list

═══════════════════════════════════════════════════════════════════

## Failure recovery cheat sheet (Daniel dimineața)

- **Total revert nuclear:** `git reset --hard pre-overnight-batch-<ts>` + `git push --force-with-lease origin main`
- **Granular revert TASK 1 only:** `git reset --hard post-task-1-<ts>` (preserves Task 1, drops Task 2+3 commits)
- **Granular revert TASK 2 only:** `git reset --hard post-task-2-<ts>` (preserves Task 1+2, drops Task 3)
- **Stryker raport orphan only (Task 1+2 OK):** identify Stryker commit SHA + `git revert <sha>` (preserves Auth)

═══════════════════════════════════════════════════════════════════

## Edge cases handling

- **Tree NOT clean pre-flight:** STOP, append `LATEST.md` cu reason, NU executa task-uri
- **Backup tag fail push:** STOP, append `LATEST.md` cu reason
- **TASK 1 FAIL pre-commit gate:** rollback work-in-progress (`git restore .` + `git clean -fd` doar în scope), SKIP TASK 2, proceed TASK 3
- **TASK 2 FAIL pre-commit gate:** rollback work-in-progress, mark FAILED, proceed TASK 3
- **TASK 3 Stryker timeout/OOM:** capture partial results, append `LATEST.md` cu warning, NU mark FAILED critic
- **Network/git push fail:** retry 3x exponential backoff (5s, 30s, 2min), append `LATEST.md` warning if still fail

═══════════════════════════════════════════════════════════════════
