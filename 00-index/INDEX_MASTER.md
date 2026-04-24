# SALAFULL VAULT — INDEX MASTER

**Ultima actualizare:** 24 apr 2026 (seară)
**Status:** FAZA 2 ✅ COMPLETE — 35 bugs + refactors, 271 teste, zero regresii

---

## NAVIGARE RAPIDĂ

### 🎯 Vision & Strategy
- [[PROJECT_VISION]] — Viziunea SalaFull
- [[USER_PROFILE_DANIEL]] — Profil owner
- [[MOAT_STRATEGY]] — De ce SalaFull vs ChatGPT

### 🗺️ Roadmaps
- [[FAZA_3_ROADMAP]] — MCP Integrations + Observability + CI/CD hardening
- [[FAZA_2_ROADMAP]] — Bug Fixes + Reliability (✅ COMPLETE)
- [[FAZA_2_FINAL_REPORT]] — Raport final FAZA 2 (10 bugs, +35 teste)

### 🔍 Audits
- [[AUDIT_SUMMARY_EXECUTIVE]] — Rezumat executiv (AICI pentru overview)
- [[OPUS_NUCLEAR_AUDIT_25APR]] — 🔴 Nuclear Opus Audit v3, adversarial (13 secțiuni, 24 tasks queued, 7 probleme NOI)
- [[AUDIT_GENERAL_23APR]] — Audit general 1774 linii (gitignored, vezi Codespaces)
- [[AUDIT_COACH_JS_24APR]] — Audit coach.js 2120 linii (gitignored, vezi Codespaces)

### 🧠 Decisions
- [[DECISION_LOG]] — Cronologic — de ce X nu Y
- [[001-local-first-storage]] — ADR: localStorage + Firebase sync
- [[002-firebase-rest-not-sdk]] — ADR: Firebase REST not SDK
- [[003-double-progression-engine]] — ADR: Double Progression engine
- [[004-rule-engine-numeric-priorities]] — ADR: Rule Engine priorities
- [[005-vanilla-js-no-framework]] — ADR: Vanilla JS + Vite
- [[006-tier-storage-for-logs]] — ADR: Three-Tier Log Storage
- [[007-firebase-open-rules]] — ADR: Firebase open rules
- [[008-vitest-playwright-testing]] — ADR: Vitest + Playwright
- [[009-calibration-tiers]] — ADR: Calibration Tiers

### 🏗️ Architecture
- [[STACK_CURRENT]] — Vanilla JS + Firebase + PWA
- [[ENGINE_ARCHITECTURE]] — Coach Brain v3
- [[STATE_MACHINES]] — Session/Timer/Draft/Drop Set (din audit coach.js)

### 📝 Prompts
- [[PROMPT_FAZA_1_0_SPLIT_PLANNING]] — Split planning (DONE 24 apr 2026)
- [[PROMPT_FAZA_1_1_SPLIT_EXECUTION]] — Split execution (DONE 24 apr 2026)
- [[PROMPT_TEMPLATE]] — Template generic Claude Code

### 📊 Findings Tracker
- [[FINDINGS_MASTER]] — 125 findings triate, status progress (3 OPEN: C10c, H30c, H31c)

### 📓 Sessions Log
- [[GYM_SESSIONS]] — Sesiuni reale sală + observații produs
- [[QA_MANUAL_24APR_2230]] — QA live 24 apr 22:30 — 3 bug-uri noi + observații

### 🔗 References
- [[RESOURCES]] — Resurse externe, tools, inspirație

### ⚙️ Workflows
- [[CHAT_MIGRATION_PROTOCOL]] — Handoff între chat-uri
- [[ASYNC_EXECUTION_PROTOCOL]] — Queue-based async workflow (LIVE 24 apr 2026)

### 🗂️ Vault Setup
- [[OBSIDIAN_SETUP_GUIDE]] — Graph View settings, plugins, shortcuts
- [[VAULT_SYNC_DIAGNOSTIC]] — Lista completă 33 fișiere + instrucțiuni pull
- [[VAULT_CONSOLIDATION_GUIDE]] — Clone fresh salafull ca vault Obsidian (Windows)

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

### ✅ FAZA 1 — ENGINE BULLETPROOF (COMPLETE — 24 apr 2026)
Raport: [[FAZA_1_FINAL_REPORT]]
Sub-faze:
- ✅ 1.0 Split coach.js planning (Opus) — DONE, [[COACH_SPLIT_PLAN]] 714 linii, confidence 82%
- ✅ 1.1 Split coach.js execuție (Sonnet) — DONE, 9 module + orchestrator live, zero regresii, commit 9875755
- ✅ 1.2 Multi-tenancy decouple — DONE, config/user.js + 14 fișiere decoupled → [[HARDCODED_AUDIT_1_2]]
- ✅ 1.3 Log schema cleanup — DONE, 7 mismatches rezolvate + logNormalize.js → [[LOG_SCHEMA_AUDIT_1_3]]
- ✅ 1.4 cleanDuplicateLogs fix — DONE, dedupe strict pe ts
- ✅ 1.5 ctx.allLogs real — DONE, calibration funcționează pentru 80+ sesiuni → [[CTX_ALLLOGS_AUDIT_1_5]]
- ✅ 1.6 sessionBuilder cleanup OPT B — DONE (OPT A = FAZA 2 Priority 1) → [[SESSIONBUILDER_AUDIT_1_6]]
- ✅ 1.7 AA engine activate notes-only — DONE, RPE logic eliminat, safety net defensiv
- ✅ 1.8 Firebase: audit + data loss fix 500→5000 + rules v1 plan — DONE → [[FIREBASE_AUDIT_1_8]]

### ✅ FAZA 2 — BUG FIXES + RELIABILITY (COMPLETE — 24 apr 2026)
Details: [[FAZA_2_ROADMAP]] | Raport: [[FAZA_2_FINAL_REPORT]] | Plan execuție: [[FAZA_2_EXECUTION_PLAN]] | Review Opus: [[FAZA_2_OPUS_REVIEW]]
- ✅ Tier 0: C4c log schema + C5c endSession auto-delete (commit 489480e)
- ✅ P2 batch: H11c cache keys + C3c idempotency + H6c inflight guard (commit 2da734d)
- ✅ Session: C2c cancelWorkout + H4c resume completedExercises (commit 03c5d8f)
- ✅ Engines: isoWeek ISO 8601 + H14g checkRecoveryGroups (commit b7e662f)
- ✅ sessionBuilder OPT C pure function (commit d8f17f0)
- ✅ sessionBuilder OPT A weakness ordering + contextSelectionEnabled (commit 7c86288)
- Metrici: 236 → 271 teste, 25 test files, zero regresii

### ⏳ FAZA 3 — INFRASTRUCTURE + OBSERVABILITY
Details: [[FAZA_3_ROADMAP]] | [[OBSIDIAN_SETUP_GUIDE]]

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
