# SALAFULL VAULT — INDEX MASTER

**Ultima actualizare:** 24 apr 2026
**Status:** FAZA 1 — Engine Bulletproof (1.1 DONE, 1.2+ pending)

---

## NAVIGARE RAPIDĂ

### 🎯 Vision & Strategy
- [[PROJECT_VISION]] — Viziunea SalaFull
- [[USER_PROFILE_DANIEL]] — Profil owner
- [[MOAT_STRATEGY]] — De ce SalaFull vs ChatGPT

### 🔍 Audits
- [[AUDIT_SUMMARY_EXECUTIVE]] — Rezumat executiv (AICI pentru overview)
- [[AUDIT_GENERAL_23APR]] — Audit general 1774 linii (gitignored, vezi Codespaces)
- [[AUDIT_COACH_JS_24APR]] — Audit coach.js 2120 linii (gitignored, vezi Codespaces)

### 🧠 Decisions
- [[DECISION_LOG]] — Cronologic — de ce X nu Y

### 🏗️ Architecture
- [[STACK_CURRENT]] — Vanilla JS + Firebase + PWA
- [[ENGINE_ARCHITECTURE]] — Coach Brain v3
- [[STATE_MACHINES]] — Session/Timer/Draft/Drop Set (din audit coach.js)

### 📝 Prompts
- [[PROMPT_FAZA_1_0_SPLIT_PLANNING]] — Split planning (DONE 24 apr 2026)
- [[PROMPT_FAZA_1_1_SPLIT_EXECUTION]] — Split execution (DONE 24 apr 2026)
- [[PROMPT_TEMPLATE]] — Template generic Claude Code

### 📊 Findings Tracker
- [[FINDINGS_MASTER]] — 125 findings triate, status progress

### 📓 Sessions Log
- [[GYM_SESSIONS]] — Sesiuni reale sală + observații produs

### 🔗 References
- [[RESOURCES]] — Resurse externe, tools, inspirație

### ⚙️ Workflows
- [[CHAT_MIGRATION_PROTOCOL]] — Handoff între chat-uri
- [[ASYNC_EXECUTION_PROTOCOL]] — Queue-based async workflow (LIVE 24 apr 2026)

### 📋 Execution Queue
- [[EXEC_QUEUE]] — Task-uri pending pentru Claude Code
- [[EXEC_RESULTS]] — Log rezultate task-uri

---

## FAZE CURENTE

### ✅ FAZA 0 — Audit (COMPLETE — 24 apr 2026)
- Audit general (23 apr): 9 CRITICAL, 31 HIGH, 27 MEDIUM, 16 LOW
- Audit coach.js (24 apr): 5 CRITICAL, 11 HIGH, 15 MEDIUM, 11 LOW
- Total: 125 findings unique (~15 overlap eliminate)

### ✅ FAZA 0.5 — Vault Setup (COMPLETE)
- Obsidian + Git sync PC work → GitHub privat
- Pending: PC acasă setup, phone later (decidem Obsidian Sync $8/mo sau rămân Git)

### 🔜 FAZA 1 — ENGINE BULLETPROOF (IN PROGRESS)
Sub-faze:
- ✅ 1.0 Split coach.js planning (Opus) — DONE 24 apr 2026, COACH_SPLIT_PLAN.md 714 linii, confidence 82%
- ✅ 1.1 Split coach.js execuție (Sonnet) — DONE 24 apr 2026, 9 module + orchestrator live, zero regresii, merged main commit 9875755
- 🔜 1.2 Multi-tenancy decouple (hardcoded Daniel values)
- ⏳ 1.3 Log schema fix + migration one-shot
- ⏳ 1.4 cleanDuplicateLogs fix
- ⏳ 1.5 ctx.allLogs real (calibration live)
- ⏳ 1.6 sessionBuilder implementation
- ⏳ 1.7 AA engine decizie (activate sau delete)
- ⏳ 1.8 Firebase security + sync cap

### ⏳ FAZA 2 — BUG FIXES + RELIABILITY
### ⏳ FAZA 3 — INFRASTRUCTURE + OBSERVABILITY
### ⏳ FAZA 4 — FEATURES NOI (144 programe, injury, health export)

---

## CONCEPT PRODUS

**Claude AI Opus 4.7 Coach** — Coach personal AI bazat pe Opus 4.7
Context persistent pe ani + reasoning semantic + personalitate coherentă + memorie continuă + decizii contextuale (nu calculator).

---

## INFRASTRUCTURĂ LIVE (24 apr 2026)

- **Repo:** `markaroundthestates-cyber/salafull` (vault + cod în același repo)
- **Deploy:** GitHub Pages → https://markaroundthestates-cyber.github.io/salafull/
- **Sync Vault ↔ Obsidian:** Git auto-commit 10 min
- **Claude Code auto-push:** hook Stop în `.claude/settings.json`
- **Async execution:** queue-based, trigger "check queue"
- **Claude Project:** GitHub connector sync → eu citesc direct din repo

---

## CUM FOLOSESC VAULT-UL

- **Începutul zilei:** deschid INDEX MASTER → văd where I left off
- **Conversație cu Claude:** linkuiesc fișierele relevante (ex: "Citește [[PROJECT_VISION]] și [[FINDINGS_MASTER]]")
- **Task nou pentru Claude Code:** adaug în [[EXEC_QUEUE]], zic "check queue"
- **Sesiune sală:** update [[GYM_SESSIONS]] cu observații
- **Decizie nouă:** add în [[DECISION_LOG]] cu data + motivație
- **Bug fix:** update [[FINDINGS_MASTER]] cu status

---

## CONTACT AI

- **Opus (strategy + planning)** → claude.ai chat
- **Sonnet (execuție cod)** → Claude Code CLI în Codespaces
- **Workflow async** → queue-based prin [[EXEC_QUEUE]]

---

## GIT SYNC STATUS

- **Vault + cod:** GitHub `markaroundthestates-cyber/salafull` (privat)
- **Auto commit-and-sync Obsidian:** 10 min
- **Auto pull on startup:** ON
- **Claude Code auto-push:** activ (hook Stop)
