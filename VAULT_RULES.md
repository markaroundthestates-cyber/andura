# VAULT RULES — SalaFull

**Owner:** Daniel (CEO + Product). Claude chat = generator. Opus = igienizator.
**Scop:** vault clean permanent. ZERO duplicate. ZERO info veche. Un singur fișier activ per topic.

---

## 1. STRUCTURĂ VAULT

```
salafull/
├── 📥_inbox/             ← Daniel uploadează aici (artefacte chat, prompts CC, drafturi)
├── 📤_outbox/            ← Opus pune rapoarte numerotate 01, 02, 03... (ultimele 5 keep)
├── 00-index/             ← INDEX_MASTER.md (navigare master)
├── 01-vision/            ← Product vision + strategy + Daniel profile
├── 02-audit/             ← Research reference (NU sprint reports)
├── 03-decisions/         ← ADR-uri active (un fișier per topic, amendments inline)
├── 04-architecture/      ← Specs arhitecturale (Cognitive, Multi-tenant, Tombstone, Data Registry)
├── 05-findings-tracker/  ← FINDINGS_MASTER + INSIGHTS_BACKLOG + AUDIT_30_9_BLOCKED_STATE
├── 06-sessions-log/      ← HANDOVER_GLOBAL.md (1 SSOT activ, NU multiple)
├── 07-meta/              ← CLAUDE_CODE_RULES + meta workflow docs
├── 08-workflows/         ← CHAT_MIGRATION_PROTOCOL + infrastructură + templates
├── cc-reports/           ← Sprint execution reports + AUDIT_5000Q
├── src/                  ← Cod (NU se atinge la cleanup)
├── tests/                ← Tests (NU se atinge)
├── scripts/              ← Build scripts (NU se atinge)
├── VAULT_RULES.md        ← Acest fișier (root)
├── PROMPT_CC_HYGIENE.md  ← Prompt reutilizabil Opus (root)
└── README.md             ← Repo intro
```

---

## 2. SSOT FILES (NU șterge, NU duplica)

### Vision + Strategy
- `01-vision/PROJECT_VISION.md`
- `01-vision/MOAT_STRATEGY.md`
- `01-vision/DANIEL_COMPLETE_PROFILE.md`
- `01-vision/PRODUCT_STRATEGY_SPEC_v1.md`
- `01-vision/PARAMETRIC_PROGRAMS_DESIGN.md`

### Architecture specs
- `04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md`
- `04-architecture/MULTI_TENANT_AUTH_MIGRATION_SPEC.md`
- `04-architecture/TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC.md`
- `04-architecture/DATA_REGISTRY_SPEC.md`

### ADR-uri (toate active)
- `03-decisions/001-*.md` → `019-*.md`
- `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md`
- `03-decisions/DECISION_LOG.md`

### Sessions
- `06-sessions-log/HANDOVER_GLOBAL_*.md` ← UNUL singur, current state

### Findings + Insights
- `05-findings-tracker/FINDINGS_MASTER.md`
- `05-findings-tracker/INSIGHTS_BACKLOG.md`
- `05-findings-tracker/AUDIT_30_9_BLOCKED_STATE.md`

### Workflows
- `08-workflows/CHAT_MIGRATION_PROTOCOL.md`
- `08-workflows/CLAUDE_CHAT_INFRASTRUCTURE.md`
- `08-workflows/FORWARD_COMPAT_PRINCIPLES.md`
- `08-workflows/HANDOVER_TEMPLATE.md`
- `08-workflows/MODEL_UPGRADE_AUDIT_PROTOCOL.md`

### Meta
- `07-meta/CLAUDE_CODE_RULES.md`

### Reports
- `cc-reports/SPRINT*_EXECUTION_REPORT.md`
- `cc-reports/AUDIT_5000Q*.md`
- `cc-reports/VAULT_CLEANUP_*.md`

### Cod (NU atinge, NU șterge)
- `src/`, `tests/`, `scripts/`
- `.claude/`, `.github/`, `.husky/`, `.obsidian/`
- `package.json`, `tsconfig*.json`, `vite.config.js`, `vitest.config.js`, `playwright.config.js`
- `index.html`, `gate-*.bat`, `gate-*.js`

---

## 3. REGULI PERMANENTE

### 3.1 Update-in-place > create-new
- Decizia se schimbă → EDITEAZĂ fișierul existent, adaugă `**AMENDMENT YYYY-MM-DD:**` inline
- NU crea `ADR_X_AMENDMENT_v2.md` separat
- Excepție: ADR complet nou pe topic complet nou → fișier nou

### 3.2 Un HANDOVER_GLOBAL activ, mereu
- `06-sessions-log/HANDOVER_GLOBAL_<DATE>.md` = SSOT current
- La sesiune nouă: EDITEZI fișierul existent (overwrite secțiuni stale), opțional rename cu data nouă
- NU creezi `HANDOVER_2026-MM-DD_TOPIC.md` la fiecare sesiune
- Git history păstrează versiunile vechi

### 3.3 Sprint/audit reports → cc-reports/
- Orice raport CC autonomous, audit, execution log → `cc-reports/`
- NU în `02-audit/` sau `06-sessions-log/`
- `cc-reports/` = "ephemeral, valoros săptămâni"

### 3.4 1 topic = 1 fișier activ
- ZERO duplicate
- Cross-references prin link, NU duplicare conținut
- Dacă info se repetă în 2 fișiere → consolidate în SSOT, șterge restul

### 3.5 Dropzone protocol (📥_inbox / 📤_outbox)

**📥_inbox:**
- Daniel uploadează aici fișiere noi (handovers, ADR drafturi, prompts CC, orice)
- Opus consumă: integrează în vault SSOT existent, ȘTERGE fișierele după procesare
- Folder rămâne gol post-fiecare run
- `.gitkeep` păstrează folder-ul în git

**📤_outbox:**
- Opus pune rapoarte numerotate cronologic: `01_TASK_NAME.md`, `02_NEXT_TASK.md`, etc.
- Păstrează **ultimele 5** rapoarte
- Când adaugă `06_*`, ȘTERGE `01_*` (FIFO)
- `.gitkeep` păstrează folder-ul în git

---

## 4. WORKFLOW DANIEL ↔ CLAUDE ↔ OPUS

```
1. Claude chat (eu) → generez artefact (handover, ADR, spec, prompt CC)
2. Daniel → uploadează artefact în 📥_inbox/, commit + push
3. Daniel → /model opus în CC, paste content PROMPT_CC_HYGIENE.md
4. Opus → citește VAULT_RULES.md + 📥_inbox/, integrează în vault SSOT
5. Opus → ȘTERGE 📥_inbox/* (consumat)
6. Opus → scrie 📤_outbox/NN_TASK_NAME.md (raport numerotat)
7. Opus → cleanup 📤_outbox/ (păstrează ultimele 5)
8. Opus → commit + push, raport în chat
9. Daniel → review, decide next action
```

**Daniel NU memorează reguli.** Toate sunt aici.
**Claude NU ține tracker mental.** Citește VAULT_RULES.md la pre-flight oricărui chat nou.
**Opus aplică reguli mecanic.** Nu inventează, nu interpretează — execută per spec.

---

## 5. SAFETY NET — ZERO INFORMATION LOSS

Înainte de orice DELETE:
1. Citește fișierul integral
2. Grep cross-reference în SSOT-uri active
3. Dacă info unică + valoroasă → MERGE în target SSOT, apoi DELETE
4. Dacă info ambiguă → FLAG în 📤_outbox raport, NU DELETE unilateral

Git history = backup absolut. Recuperare oricând:
```bash
git log --all --full-history -- "path/to/deleted/file"
```

---

## 6. ANTI-PATTERN INTERZISE

- ❌ Crearea de `HANDOVER_2026-MM-DD_TOPIC.md` la fiecare sesiune
- ❌ ADR amendments ca fișiere separate
- ❌ Sprint reports în `02-audit/` sau `06-sessions-log/`
- ❌ Daniel uploadează direct în vault (NU în `📥_inbox/`)
- ❌ Opus creează fișiere noi când există SSOT pe topic
- ❌ Path references hardcoded (folosește wikilinks `[[FILE_NAME]]`)
- ❌ DELETE fără safety net §5
- ❌ Atingerea `src/`, `tests/`, `scripts/`, configs

---

## 7. WHEN VAULT_RULES UPDATES

Acest fișier se actualizează **rar** și **inline**:
- Adăugare regulă nouă → secțiune nouă în §3 sau §6
- Schimbare structură → update §1 + §2
- Schimbare workflow → update §4

Update direct (NU creez `VAULT_RULES_v2.md`).

---

🦫 **Vault clean permanent. SSOT only. Zero duplicate. Zero memory load pe Daniel.**
