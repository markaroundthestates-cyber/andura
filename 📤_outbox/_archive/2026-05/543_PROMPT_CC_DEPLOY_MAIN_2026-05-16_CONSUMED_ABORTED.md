# PROMPT_CC — DEPLOY MAIN 2026-05-16 — Pre-Beta LOCK 1 100% complete

**Model:** Opus EXCLUSIVELY (zero excepții).
**Branch:** feature/v2-vanilla-port → main.
**Authority:** Daniel CEO directive chat 2026-05-16 "Poti face tu deploy pri cc MCP si dupa batch cu tests si tot sa vedem ca pass".
**Context:** Pre-Beta LOCK 1 100% complete verified chat ACASĂ — library 657 ✅ + Big 11 engine 8/8 ✅ + Calendar engine-side ✅ (scheduleAdapter.js Calendar V1 S2) + cap-coadă ✅ (Track 2 fix 1+2+3 all LANDED verified).

---

## Pre-flight (mandatory, fail-stop)

1. Verify cwd `C:\Users\Daniel\Documents\salafull`.
2. Verify branch `feature/v2-vanilla-port` cu `git branch --show-current`. Fail → abort.
3. Verify working tree clean: `git status --short`. Excepție acceptabilă: `.smart-env/` auto-tracked Smart Connections cache. Orice ALT file modified/untracked → abort + raportează LATEST.md §Issues.
4. Verify origin sync: `git fetch origin && git status -uno`. `feature/v2-vanilla-port` trebuie să fie up-to-date sau ahead vs origin. Behind → abort + raportează.
5. Run `npm run typecheck`. Fail → abort + raportează.
6. Run `npm run test:run`. **Must show ≥3743 PASS.** Sub baseline → abort + raportează.
7. Run `npm run build`. Must succeed, `dist/` produs clean. Fail → abort + raportează.

---

## TASK A — Backup safety (atomic)

```bash
git tag pre-deploy-main-2026-05-16 HEAD
git push origin pre-deploy-main-2026-05-16
```

Verify `git ls-remote --tags origin | grep pre-deploy-main-2026-05-16` → tag prezent pe remote.

---

## TASK B — Merge + Deploy main (atomic, Bugatti)

```bash
git checkout main
git pull origin main --ff-only
git merge feature/v2-vanilla-port --no-ff -m "merge(deploy): feature/v2-vanilla-port → main 2026-05-16 — pre-Beta LOCK 1 100% complete

Library 657 ex ✅ + Big 11 engine 8/8 ✅ + Calendar engine-side ✅
(scheduleAdapter.js Calendar V1 S2 production wiring) + cap-coadă ✅
(Track 2 fix 1 button wired + fix 2 banner periodic 3 zile + fix 3
LOCK 8 KCAL_FLOOR informative toast on import).

Tests baseline 3743+ PASS preserved invariant cross-merge.
Backup tag: pre-deploy-main-2026-05-16.
Authority: Daniel CEO directive chat 2026-05-16 ACASĂ + DECISIONS.md §D012."
git push origin main
```

Verify post-push: `git log main --oneline -5` (merge commit prezent + feature commits absorbed).

---

## TASK C — Wait deploy.yml + verify live (≤8 min)

1. Note merge commit SHA via `git rev-parse HEAD`.
2. Poll GitHub Actions run pentru `deploy.yml` cu `gh run list --workflow=deploy.yml --limit=3` (sau echivalent dacă `gh` CLI nedisponibil → wait fixed 5 min apoi verify).
3. Wait until deploy.yml status = `completed conclusion: success` (typical 2-4 min).
4. Verify `gh-pages` branch updated: `git ls-remote origin gh-pages` → hash schimbat post-deploy.
5. Curl `https://andura.app` (sau echivalent) → HTTP 200. Fail HTTP non-200 → raportează LATEST.md §Issues, NU rollback automat (Daniel decide).

---

## TASK D — Post-deploy verification (on main)

1. `git checkout main` (stay on main).
2. Re-run `npm run test:run` pentru sanity. **Must show ≥3743 PASS** preserved invariant.
3. `git log --oneline -5` snapshot post-deploy state.

---

## TASK E — Housekeeping PRIMER §6 cleanup (separate atomic commit, single concern)

**File:** `ANDURA_PRIMER.md` §6 "Ce e de făcut (Backlog Ordered)" complete rewrite section.

**Replace existing Track 1 + Track 2 + End-state subsections cu următoarea structură:**

```markdown
## §6 Ce e de făcut (Backlog Ordered)

**Pre-Beta LOCK 1 100% complete ✅ (verified chat 2026-05-16 ACASĂ + deploy main same day):**
- library 657 ex ✅ LANDED
- Big 11 engine 8/8 phases ✅ LANDED FINAL
- Calendar engine-side ✅ LANDED (`src/engine/schedule/scheduleAdapter.js` Calendar V1 S2 production wiring per ADR 030 D2 thin scope)
- Cap-coadă pre-Beta tactical ✅ ALL LANDED:
  - Track 2 fix 1 button "Import Nutritie (JSON)" wired prod (`index.html:509` + `dashboard.js:149` → `triggerMFPImport()`) — commit `e82edb5`
  - Track 2 fix 2 dashboard banner periodic 3 zile reminder (`dashboard.js:128-145` threshold `3*86400000` + slot `index.html:392` + wording GENERIC V3 compliant "Importa nutritie din CSV")
  - Track 2 fix 3 LOCK 8 KCAL_FLOOR informative toast on MFP CSV import (`weight.js:6-7` imports + `importMFPNutritionCSV` body counts `v < KCAL_FLOOR_DAILY_MIN` + setTimeout 2.8s post-success toast, engine SoT wording, anti-paternalism preserved ZERO block save)

**Track 3 — Wording backlog post-smoke CEO review (wait-Daniel, D009 boundary, NU autonomous compose):**
- LOCK 10 MMI buttons "Reincep treptat (recomandat)" / "De la zero"
- LOCK 10 MMI refuse banner wording
- LOCK 10 diacritics strip decision
- LOCK 9 aaFrictionModal wording potential review

**End-state final gate sequencing (Daniel CEO directive verbatim):**
1. ✅ Pre-Beta LOCK 1 100% complete (achieved 2026-05-16)
2. ✅ Deploy `feature/v2-vanilla-port` → `main` (achieved 2026-05-16 via CC autonomous batch — backup tag `pre-deploy-main-2026-05-16`)
3. Daniel Gates smoke production manual (Firebase + PWA + telefon, single comprehensive gate a-z) — pending Daniel timing
4. Bugatti Full Audit pre-Launch nuclear gate (fiecare linie cod + fiecare virgulă pe latest commit LANDED) — CC autonomous candidate post smoke
5. Fix ALL issues surfaced (combined smoke + Bugatti audit backlog)
6. Beta launch
```

Commit message: `docs(primer): §6 cleanup post Track 1+2 audit close + LOCK 1 100% complete + deploy main 2026-05-16`

---

## TASK F — DECISIONS.md append D013 REGLAJ (separate atomic commit)

**File:** `DECISIONS.md` — append la final `## CURRENT DECISIONS` section, înainte `---` separator.

**Entry:**

```
D013 | 2026-05-16 | REGLAJ | Pre-Beta LOCK 1 100% complete + deploy main 2026-05-16 + PRIMER §6 cleanup post Track 1+2 audit close | LOCKED V1 | DECISIONS.md §D013
```

**Frontmatter update same commit:**
- `latest_entry: D012` → `latest_entry: D013`
- `total_entries: 12` → `total_entries: 13`
- `last_updated: 2026-05-16` (preserve)

**Supersede scan post-append:** Verify NU există entry CURRENT cu titlu keyword overlap ≥50% ("pre-beta lock" / "deploy main" / "primer cleanup") cu D013. Expectație: none. Confirm în LATEST.md §"Supersede scan: 0 matches".

Commit message: `docs(decisions): D013 REGLAJ codify pre-Beta LOCK 1 100% complete + deploy main 2026-05-16`

---

## TASK G — Archive consumed PROMPT_CC + LATEST raport (final commit)

1. Move `📥_inbox/PROMPT_CC_DEPLOY_MAIN_2026-05-16.md` → `📤_outbox/_archive/2026-05/<NN>_PROMPT_CC_DEPLOY_MAIN_2026-05-16_CONSUMED.md` (NN sequential next available).
2. Scrie `📤_outbox/LATEST.md` cu format standard (overwrite predecessor LATEST).
3. Inbox final state: doar `.gitkeep`.

**LATEST.md format:**

```markdown
# LATEST — Deploy main 2026-05-16 — Pre-Beta LOCK 1 100% complete ✅

## Status: [COMPLETE | FAILED at TASK X]

## Pre-flight (7/7 checks ✓ | log fails)
- ...

## TASK A — Backup tag
- pre-deploy-main-2026-05-16 created at SHA <hash> + pushed origin ✓

## TASK B — Merge + Deploy
- Merge commit SHA: <hash>
- main HEAD SHA: <hash>
- Push origin main: ✓ | timestamp

## TASK C — Deploy.yml + live verification
- deploy.yml run ID: <id> | conclusion: success | duration: <Xm Ys>
- gh-pages branch updated: ✓ (hash <hash>)
- andura.app HTTP status: 200

## TASK D — Post-deploy tests
- npm run test:run: <N> PASS preserved invariant ✓

## TASK E — PRIMER §6 cleanup
- Commit SHA: <hash>

## TASK F — DECISIONS.md D013 append
- Commit SHA: <hash>
- Supersede scan: 0 matches

## TASK G — Archive + LATEST
- PROMPT_CC archived: 📤_outbox/_archive/2026-05/<NN>_PROMPT_CC_DEPLOY_MAIN_2026-05-16_CONSUMED.md
- Inbox final: doar .gitkeep ✓

## Issues / Deviations

[If any — describe. Else: "None — atomic Bugatti."]

## Next action Daniel

1. Daniel Gates smoke production manual (Firebase + PWA + telefon, single comprehensive gate a-z) — când ai timp
2. Bugatti Full Audit pre-Launch nuclear gate — CC autonomous candidate post smoke OR Daniel directive timing
3. Fix ALL issues surfaced (combined smoke + Bugatti audit backlog)
4. Beta launch

---

🦫 **Deploy main 2026-05-16 LANDED atomic Bugatti. Pre-Beta LOCK 1 = 100% complete. LOCK 2 (Daniel Gates smoke) unlocked — pending Daniel timing.**
```

Commit message: `chore(outbox): archive PROMPT_CC consumed + LATEST report deploy main 2026-05-16`

---

## Atomic commit summary (5 commits total this batch)

1. (TASK B) Merge commit `feature/v2-vanilla-port → main` (preserves history via --no-ff)
2. (TASK E) `docs(primer): §6 cleanup post Track 1+2 audit close + LOCK 1 100% complete + deploy main 2026-05-16`
3. (TASK F) `docs(decisions): D013 REGLAJ codify pre-Beta LOCK 1 100% complete + deploy main 2026-05-16`
4. (TASK G) `chore(outbox): archive PROMPT_CC consumed + LATEST report deploy main 2026-05-16`
5. Plus push origin main + push origin pre-deploy-main-2026-05-16 tag

**Note:** TASK E + F + G commits land on `main` directly (post-merge). NU back-port la feature/v2-vanilla-port (branch dies post-merge or stays archived).

ZERO `--no-verify` bypass. Pre-commit hook verde ALL commits. Single concern per commit Bugatti.

---

## Failure modes + rollback

- **Pre-flight fail (typecheck/tests/build):** Abort entire batch. Raportează LATEST.md §Issues. NU touch main.
- **Merge conflict main ↔ feature:** Abort. `git merge --abort` + raportează LATEST.md §Issues. Daniel decide manual resolution sau alt branch strategy.
- **deploy.yml fails:** Raportează LATEST.md §Issues cu run ID + log link. NU rollback auto. Daniel decide (rollback via `git revert <merge-sha>` + push, sau fix-forward).
- **andura.app HTTP non-200:** Raportează + NU rollback. Possible Pages propagation delay — wait 5 min retry. Persists → Daniel directive.

**Rollback procedure (Daniel directive only):**
```bash
git checkout main
git revert <merge-sha> --no-edit
git push origin main
# Sau hard reset (destructive):
# git reset --hard pre-deploy-main-2026-05-16
# git push origin main --force-with-lease
```

---

🦫 **Bugatti craft peak. Atomic single concern per commit. Backup tag mandatory. Tests preserved invariant. Pre-Beta LOCK 1 100% complete → deploy → LOCK 2 unlock smoke gate.**
