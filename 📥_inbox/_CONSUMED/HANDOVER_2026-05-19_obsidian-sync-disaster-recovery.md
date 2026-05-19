# HANDOVER — Obsidian Sync Disaster Recovery + MCP Config Update Birou

**Date:** 2026-05-19
**Topic:** obsidian-sync-disaster-recovery
**Chat session:** §CC.2 ACASĂ trigger (birou physical, vault acasă via `claude rc`) → escalated saga ~3h
**Status:** Recovery 100% COMPLETE. Decizii noi pentru LOCK: D030 + D031. Pre-disaster decision (Wave 1 vs 6th audit) UNRESOLVED carry-forward.

---

## §1 Context — cum a pornit

Sesiunea a început ca routine ACASĂ trigger §CC.2: read ANDURA_PRIMER + DECISIONS.md + LATEST.md. State pre-disaster: Phase 6 BATCH 24-task LANDED (D026), React entry swap production LANDED (D028, `caaae99` deploy-react-production-2026-05-19), audit nuclear 5 passes COMPLETE (698 findings, score 56.5%, Beta BLOCKED ~10-12 working days). Decizie întrebată Daniel: **Wave 1 Beta blockers (auth chain + Sentry + index.html + deploy.yml, ~2 zile)** sau **6th pass audit deep-dive (engine math §38 / mockup visual regression / live E2E)**.

Răspuns NU primit — disaster a izbucnit înainte de continuare.

---

## §2 Disaster chain (10:39-11:03)

1. Birou: Daniel a șters local `C:\Users\DanielMazilu\Documents\salafull` + reconnected la Obsidian Sync ID "Andura" → vault popped at sub-folder `salafull\Andura\` (path mismatch vs ACASĂ unde vault = `salafull\` root).
2. Obsidian Sync interpreted "local birou empty" → DELETE propagate la toți clients → ACASĂ Obsidian Sync activ a primit DELETE events → **1169 fișiere șterse fizic** pe disk acasă.
3. Obsidian Git plugin acasă (config `autoCommitOnlyStaged:false`, `autoSaveInterval:15min`, `autoPullInterval:15`, `autoPullOnBoot:true`) detect 760 vault deletions → auto-commit `b1bd099` "chore(auto)" → push origin/main → **DELETE propagat la GitHub**.
4. Daniel hit PAUSE sync birou mid-disaster.

---

## §3 Recovery sequence COMPLETE

Via `claude rc` la birou comandat CC autonomous acasă (vault path acasă `C:\Users\Daniel\Documents\salafull\`):

1. **`22942ed`** audit-nuclear restore — 58 audit-nuclear files + PROMPT_CC prompt din clean SHA `778016c`. Push origin.
2. **`786dcbb`** full surgical restore — `git diff --name-only --diff-filter=D b1bd099^..b1bd099 -z | xargs -0 git checkout 778016c --` → 700 fișiere restored (760 minus 58 audit deja restored minus 2 .obsidian configs modificate). Math verified: post-checkout `git diff --name-only --diff-filter=D b1bd099^..HEAD` = 0. Push origin.
3. **Plugin fix Obsidian Git** (`.obsidian/plugins/obsidian-git/data.json`) ambele vaults acasă (main + OLD-BACKUP): `autoCommitOnlyStaged: true`, `autoSaveInterval: 0`, `autoPullInterval: 0`, `autoPullOnBoot: false`. Backups `data.json.backup-pre-fix-2026-05-19`. NOTE: `.obsidian/plugins/` gitignored → fix per-machine. Birou are 0 Obsidian Git plugin (safe by absence).
4. **`Stop-Process -Name Obsidian -Force` acasă** → 4 Obsidian instances (PIDs 2524, 11524, 13288, 14552) killed.
5. **Auto-commits CONTINUED 11:44, 11:56, 12:02 AFTER Obsidian killed.** CC investigated → găsit în `.claude/settings.json` Stop hook care rula `git add -A && git commit -m "chore(auto): $FILES" && git push origin $BRANCH` post fiecare task Claude. ASTA = adevăratul mechanism propagation la GitHub, NU Obsidian Git plugin solo.
6. **`f40ebbc`** Stop hook fix (Option 3) — removed `git push origin "$BRANCH"` + unused `BRANCH` var. Kept `git add -A && git commit` (audit trail local). Pushed manually — ultimul auto-push al sesiunii. Post-fix: orice viitor mass-delete-race rămâne local, NU propagă la origin fără explicit manual push.

**Final git state acasă:** HEAD `f40ebbc` — restored 100% + Stop hook fixed + plugin safe defaults locked.

---

## §4 Birou Obsidian Sync connect + MCP config update

1. Git pull birou `220c95f..43cffa5` (957 files changed, +226324/-4239 lines) — full audit-nuclear + 700 restored + plugin fix landed la `C:\Users\DanielMazilu\Documents\salafull\`.
2. **Robocopy `/MIR` side-effect** mirror salafull root → salafull\Andura\ sub-folder = PURGED 41 vault-only files non-git (DANIEL_COMPLETE_PROFILE, SUFLET_ANDURA, MOAT_STRATEGY, PRODUCT_STRATEGY_SPEC, PROJECT_VISION, PRIVACY_POLICY_V1_BETA, ONBOARDING_SSOT_V1, TERMS_OF_SERVICE_V1_BETA, COACHING_TEXTBOOK_SYNTHESIS, 10 specs în 04-architecture, FINDINGS_MASTER, etc). Pivot abordare: NU "Reset Vault on Server" (s-ar fi pierdut vault-only files); Daniel connect direct Obsidian birou la remote vault Andura existent.
3. **Vault Andura cloud → birou local** la path nou `C:\Users\DanielMazilu\Documents\Andura\` (separate de `salafull\` git repo, SUB Documents direct). 1,919 files / 2,697 folders confirmed. Vault-only files verified prezenți (SUFLET_ANDURA + DANIEL_COMPLETE_PROFILE + MOAT_STRATEGY + PROJECT_VISION read via MCP).
4. **MCP filesystem config update Claude Desktop birou** la `C:\Users\DanielMazilu\AppData\Local\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json` (Microsoft Store version path). Added second allowed path `C:\\Users\\DanielMazilu\\Documents\\Andura` la filesystem MCP args. Post restart Claude Desktop, **`filesystem:` (lowercase)** exposed ambele paths. NOTE: capital-F `Filesystem:` rămâne server separat hardcoded la salafull only — `filesystem:` lowercase = primary tool pentru Andura access. Backup config `claude_desktop_config.json.backup-pre-fix-2026-05-19`.

---

## §5 Decizii noi pentru LOCK (D030 + D031)

### D030 — PROC — Obsidian Sync disaster recovery + Stop hook anti-recurrence

LOCKED V1. Source: saga 2026-05-19 disaster `b1bd099` mass-delete propagation. Anti-recurrence triplu-strat:
- Obsidian Git plugin acasă (both vaults): `autoCommitOnlyStaged: true` + `autoSaveInterval: 0` + `autoPullInterval: 0` + `autoPullOnBoot: false`.
- Claude Code Stop hook `.claude/settings.json`: removed `git push origin "$BRANCH"`. Kept commit local pentru audit trail. Push origin = manual conscious decision only.
- Workflow rule: NEVER delete local vault on another device without disconnecting Obsidian Sync first.
Cross-refs: `📥_inbox/HANDOVER_2026-05-19_obsidian-sync-disaster-recovery.md §2-§3`.

### D031 — PROC — Birou MCP filesystem dual-path + Obsidian vault Andura separate path

LOCKED V1. Source: post-disaster recovery 2026-05-19. Birou setup post recovery:
- `salafull\` = git repo only (chat↔CC workflow path, sync via git push/pull).
- `Andura\` (sub Documents direct) = Obsidian Sync vault path, SEPARATE de git repo.
- MCP filesystem `filesystem:` lowercase config: ambele paths allowed; `Filesystem:` capital = server hardcoded salafull (legacy, ignoră config nou).
- Workflow: vault editing birou via Obsidian la `Andura\` → sync cloud → eventually visible acasă post Obsidian deschis fizic. Git operations chat↔CC = pe `salafull\` exclusiv.
Cross-refs: `📥_inbox/HANDOVER_2026-05-19_obsidian-sync-disaster-recovery.md §4`.

---

## §6 Pending carry-forward (UNRESOLVED pre-disaster)

Decizia originală **NU rezolvată** în sesiune azi (disaster intervened):

**A. Wave 1 Beta blockers (~2 zile):**
- Auth chain wire (audit findings §4-C1/C2/C3)
- Sentry init main.tsx (§7-C1/C2/C3)
- index.html rewrite (§33-C1)
- deploy.yml test gate (§5-C1)
- (referent §1-C1 cross-cutting)

**B. 6th pass audit deep-dive:**
- Engine math §38 verification line-by-line
- External tools coverage
- Mockup visual regression pixel parity
- Live E2E Playwright vs `andura.app/` post-React swap

Daniel decide next chat care abordare. Saga consumed ~3h chat azi, bandwidth ~30% remaining = handover preventive aici.

---

## §7 SHAs reference

- `778016c` last clean pre-disaster
- `b1bd099` delete-bomb 760 files (Obsidian Git plugin auto-commit acasă)
- `22942ed` audit-nuclear restore (58 files)
- `786dcbb` 700 files surgical restore
- `f40ebbc` Stop hook fix (no auto-push)
- `43cffa5` birou pull HEAD
- Repo: `https://github.com/markaroundthestates-cyber/andura` branch `main`

---

🦫 **Recovery 100%. Disk acasă + GitHub + birou Obsidian = consistent. Anti-recurrence locked D030 + D031. Next chat: Wave 1 vs 6th audit decision.**
