# PROMPT_CC — Handover Ingest 2026-05-20 birou + Vault Cleanup

**Model:** Opus 4.7 EXCLUSIVELY
**CC startup:** `claude --dangerously-skip-permissions`
**Procedure:** §F3.8 handover ingest + DECISIONS.md delta append + ANDURA_PRIMER refresh + vault hygiene cleanup
**Source narrative:** `📥_inbox/HANDOVER_2026-05-20_birou_track_7_iter_8_9_9.5_landed.md`
**Stop trigger UNIC:** Daniel STOP explicit

---

## Task 1 — Ingest handover narrative

Read `📥_inbox/HANDOVER_2026-05-20_birou_track_7_iter_8_9_9.5_landed.md` complet (10 sections). Înțelege contextul:
- Sesiune ACASĂ → birou cu setup mirror
- Track 7 9.5/10 → 9.99/10 cu iter 8 (false reports learning) + iter 9 (ground truth) LANDED
- f1c79dd chore-auto disaster + revert chain (`2f3b17a` + `7f6a507`)
- Obsidian Sync vault config Documents/ parent fix (Selective Sync 7 excluderi)
- Magic Link blocker discovered + iter 9.5 fix deploy.yml env vars injection LANDED
- Production readiness % inflație concern (real ~75-85%, NU 95-96% Co-CTO compound estimate)
- 4 decizii noi propuse D038-D041

---

## Task 2 — Append DECISIONS.md delta D038-D041

Edit `DECISIONS.md` cu Edit tool (NU create_file). Update header `latest_entry: D037` → `D041`, `total_entries: 37` → `41`. Append `## CURRENT DECISIONS` section:

```
D038 | 2026-05-20 | PROC | Co-CTO chat ZERO create_file pe paths cross-device (acasa vs birou MCP server config diferit) — filesystem:write_file + verify listing immediate post-write mandatory anti-halucinare false-positive | LOCKED V1 | DECISIONS.md §D038
D039 | 2026-05-20 | PROC | chore-auto Stop hook DISABLED PERMANENT in .claude/settings.json (disableAllHooks: true) + Andura/ gitignore belt+suspenders anti-f1c79dd recurrence | LOCKED V1 | DECISIONS.md §D039
D040 | 2026-05-20 | TECH | .github/workflows/deploy.yml build step env vars injection mandatory VITE_FIREBASE_* (Magic Link blocker regression iter 9.5 fix) — GitHub Secrets VITE_FIREBASE_API_KEY + VITE_FIREBASE_RTDB_URL Daniel-action | LOCKED V1 | DECISIONS.md §D040
D041 | 2026-05-20 | REGLAJ | Production readiness % rapoarte Co-CTO = estimat compound NU re-audit verifiable. Real measurement = re-run audit nuclear pe HEAD curent (Phase 8 Bugatti pre-Launch gate). Anti-inflatie: format raport include "Estimate (not measured): X%, Last measured: Y% @ <audit_date>" | LOCKED V1 | DECISIONS.md §D041
```

**Supersede check (D007 enforcement):** scan CURRENT DECISIONS section pentru:
- D023 vault writes — D038 EXTENDS (cross-device false-positive write specific), NU supersede (D023 generic vault writes filesystem mandatory rămâne LOCKED V1)
- D030 Obsidian Git anti-recurrence — D039 EXTENDS (chore-auto Stop hook disable specific), NU supersede (D030 autoCommitOnlyStaged etc rămâne)
- D036 Track 7 §7.6 deploy.yml — D040 EXTENDS (env vars Firebase specific iter 9.5), NU supersede (D036 generic §7.6 wire rămâne)
- D029 Audit Nuclear 56.5% — D041 NU supersede, only adds anti-inflation reporting discipline

ZERO supersede needed. All 4 D038-D041 = new orthogonal locks.

---

## Task 3 — ANDURA_PRIMER.md refresh §5 + §6

**§5 append paragraph (sub paragrafele existente 2026-05-19/20):**

> **2026-05-20 birou Track 7 iter 8/9/9.5 LANDED + f1c79dd disaster recovery + Magic Link blocker fix (chat ACASĂ → birou mirror setup):**
> - Iter 8 lessons learned: Co-CTO CC raport halucinare commits (SHA-uri inventate, raport pur fără cod) — strict anti-recurrence enforced iter 9+
> - Iter 9 LANDED 3 commits real verified reflog: `a2f4f8e` depcheck fix + `5818949` madge concession + `157d1a1` 10 unused-vars cleanup (per `DECISIONS.md §D026` extension)
> - f1c79dd chore-auto Stop hook disaster (953 files / 276,832 deletions recursive Andura/ vault clone) + revert chain LANDED `2f3b17a` (hook off + Andura/ gitignore) + `7f6a507` (Revert f1c79dd) per `DECISIONS.md §D039`
> - Magic Link blocker iter 9.5: `src/auth.js:25` FIREBASE_API_KEY fallback PLACEHOLDER_WEB_API_KEY → bundle production broken Magic Link 400 errors. Fix `deploy.yml` env injection LANDED per `DECISIONS.md §D040`
> - CI iter 9 verdict GREEN: ci.yml run #594 + deploy.yml run #636 SUCCESS
> - Production readiness Co-CTO estimate 95-96% — Daniel push-back acknowledged inflation. Real ~75-85% per `DECISIONS.md §D041`. Phase 8 Bugatti audit nuclear pre-Launch gate measure real
> - Setup birou: `C:\Users\DanielMazilu\Documents\salafull\` mirror acasă (clone Andura + vault Obsidian combined) + Obsidian Sync Selective excluderi 7 foldere (`node_modules`, `dist`, `coverage`, `test-results`, `__checks__`, `.git`, `reports`) anti-D030 recurrence + 2 vault Documents/ parent removed

**§6 update Track 7 entry:**

> - ✅ §7.6 iter 8 LANDED + iter 9 LANDED + iter 9.5 deploy.yml env injection LANDED (all CI green, 0 errors, cosmetic warnings only)
> - ⏳ §7.10 Daniel mobile manual smoke awaiting Firebase secrets upload (`VITE_FIREBASE_API_KEY` + `VITE_FIREBASE_RTDB_URL` GitHub Secrets) + redeploy
> - Production readiness real ~75-85% estimate, target measure via Phase 8 Bugatti audit nuclear post-smoke

---

## Task 4 — Vault hygiene cleanup

Move la `📥_inbox/_CONSUMED/`:
- `PROMPT_CC_track_7_implementation_v1.md` (Track 7 master spec LANDED)
- `SETUP_DANIEL_TRACK_7.md` (Daniel manual setup LANDED verify GREEN iter 4)

Move la `📤_outbox/_archive/2026-05/`:
- `SETUP_VERIFICATION.md` (verify workflow iter 1-6 verdict LANDED GREEN, prefix numar continuous next NN per convention)

**KEEP în place (in-use):**
- `📤_outbox/TRACK_7_FINAL_SMOKE_CHECKLIST.md` — Daniel-active pentru smoke
- `📤_outbox/audit-nuclear-2026-05-19/` directory — referință permanentă

---

## Task 5 — Rewrite `📤_outbox/LATEST.md`

REWRITE complet (NU append) cu fresh state Track 7 iter 9.5 + handover digest:

```markdown
# Track 7 iter 9.5 LANDED — Magic Link Blocker Fix + Pre-Smoke State

**Status:** § 9.99 / 10 LANDED — 99% (iter 9.5 deploy.yml env injection fix LANDED 2026-05-20 birou; §7.10 final smoke awaiting Daniel Firebase secrets upload + redeploy + mobile manual)
**Last LANDED commits:** a2f4f8e (depcheck) → 5818949 (madge) → 157d1a1 (unused-vars) → 9c4da5c (iter 9 raport) → <iter 9.5 deploy.yml fix SHA from CC push>
**Procedure:** D031/D032/D040/D041 LOCKED V1 — Track 7 + iter 9.5 critical fix
**Model:** Opus 4.7 EXCLUSIVELY
**Stop trigger UNIC:** Daniel STOP explicit

## Pending Daniel-action pre-smoke

1. Firebase Console → Project Settings → General → Web app → copy apiKey + databaseURL
2. GitHub repo Settings → Secrets and variables → Actions → Add:
   - VITE_FIREBASE_API_KEY = AIzaSy...
   - VITE_FIREBASE_RTDB_URL = https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app
3. Wait ~6-10 min post-push redeploy gh-pages CDN propagation
4. Hard refresh andura.app (Ctrl+Shift+R) sau Incognito sau PWA reinstall
5. Try Magic Link → smoke per TRACK_7_FINAL_SMOKE_CHECKLIST.md §4 (4 taburi × ~50 checkboxes)

## Production readiness honest

Co-CTO estimate compound 95-96% post Track 7 LANDED. Real measurement TBD via Phase 8 Bugatti audit nuclear pe HEAD curent. Probable real ~75-85% (per D041 anti-inflation discipline). Smoke real-world feedback >> % number.

## Next P1 post-smoke

- PASS → Phase 8 Bugatti audit nuclear pre-Launch gate measure real readiness → fix surfaced → Beta launch
- FAIL → backlog issues + iter 10 fix-uri + re-smoke

🦫 Bugatti craft. Iter 8 lessons learned enforced. Iter 9 ground truth pattern preserved. Anti-halucinare commits + anti-inflation rapoarte.
```

---

## Task 6 — Commit handover ingest + cleanup atomic

Atomic Bugatti commit pe toate modificările Task 2-5 într-un SINGUR commit:

```bash
git add DECISIONS.md ANDURA_PRIMER.md 📥_inbox/ 📤_outbox/
git commit -m "chore(handover-2026-05-20): ingest birou handover + DECISIONS D038-D041 + PRIMER refresh + vault cleanup consumed/archived"
git push origin main
```

**ZERO push intermediate** — single conscious push per atomic commit Bugatti.

---

## Task 7 — Verify post-commit + cleanup

1. `git log --oneline -5` — verify commit landed
2. `git status` — verify clean working tree
3. `ls 📥_inbox/` — verify only HANDOVER + new + _CONSUMED/
4. `ls 📤_outbox/` — verify LATEST + TRACK_7_FINAL_SMOKE_CHECKLIST + audit-nuclear + _archive/
5. Report success în chat: "Handover ingest + cleanup LANDED commit `<SHA>`, ready for Daniel next chat startup §CC.2"

---

## Stop conditions

- Continue autonom toate 7 task-uri sequential
- STOP dacă DECISIONS.md supersede check reveal conflict cu existing entry NU obvious → escalate Daniel decision
- STOP dacă ANDURA_PRIMER.md edit conflict cu structure existing (e.g. §5 section truncate) → diff preserve concern, escalate

---

## Anti-recurrence enforce (iter 8 + iter 9 lessons learned)

- D023 + D038 vault writes filesystem only, ZERO create_file, verify listing post-write mandatory
- D030 + D039 chore-auto hook disabled preserved (`.claude/settings.json` `disableAllHooks: true`)
- Per commit message must match actual `git show --stat <SHA>` output (NU SHA inventate)
- ZERO false "LANDED" rapoarte fără verify reflog real
- Pre-action verify: rulează LOCAL comenzi ÎNAINTE de propunere fix patterns

🦫 Bugatti craft. Iter handover ingest + vault hygiene Bugatti single atomic. Opus 4.7 exclusively.
