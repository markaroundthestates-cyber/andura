# VAULT RULES — Andura

**Owner:** Daniel (CEO + Product). Claude chat = generator. Opus = igienizator.
**Scop:** vault clean permanent. ZERO duplicate. ZERO info veche. Un singur fișier activ per topic.

---

## 1. STRUCTURĂ VAULT

```
andura/
├── 📥_inbox/             ← Daniel uploadează aici (artefacte chat, prompts CC, drafturi)
├── 📤_outbox/            ← Output CC (Opus/Sonnet runs)
│   ├── LATEST.md         ← 1 file activ — Daniel paste-uiește în chat Claude
│   └── _archive/         ← Istoric complet pe luni (YYYY-MM/NN_TASK.md)
├── 00-index/             ← INDEX_MASTER.md (navigare master)
├── 01-vision/            ← Product vision + strategy + Daniel profile
├── 02-audit/             ← Research reference (NU sprint reports)
├── 03-decisions/         ← ADR-uri active (un fișier per topic, amendments inline)
├── 04-architecture/      ← Specs arhitecturale (Cognitive, Multi-tenant, Tombstone, Data Registry)
├── 05-findings-tracker/  ← FINDINGS_MASTER + INSIGHTS_BACKLOG + AUDIT_30_9_BLOCKED_STATE
├── 06-sessions-log/      ← HANDOVER_GLOBAL.md (1 SSOT activ, NU multiple)
├── 07-meta/              ← CLAUDE_CODE_RULES + meta workflow docs
├── 08-workflows/         ← CHAT_MIGRATION_PROTOCOL + infrastructură + templates
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
- `03-decisions/001-*.md` → `021-*.md`
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

### Reports (CC output)
- `📤_outbox/LATEST.md` ← raportul curent (1 file vizibil)
- `📤_outbox/_archive/<YYYY-MM>/NN_*.md` ← istoric complet, numerotare cronologică continuă

### Cod (NU atinge, NU șterge)
- `src/`, `tests/`, `scripts/`
- `.claude/`, `.github/`, `.husky/`
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

### 3.3 Output CC → 📤_outbox/

- Toate output-urile CC (Sprint reports, fix reports, audit reports, hygiene reports)
  merg în `📤_outbox/LATEST.md`
- ANTERIOR existent → MOVE în `📤_outbox/_archive/<YYYY-MM>/NN_<TASK>.md`
  (numerotare cronologică continuă, NU reset lunar)
- NICIODATĂ merge la rapoarte. Move-only. Fiecare raport intact 1:1.
- `cc-reports/` folder DEPRECATED 2026-04-30 — nu mai există.
- NU în `02-audit/` sau `06-sessions-log/`

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
- 1 file activ vizibil: `📤_outbox/LATEST.md` (raport curent CC)
- Daniel paste-uiește `LATEST.md` în chat Claude la handover
- La next CC run: vechiul `LATEST.md` → MOVE în `_archive/<YYYY-MM>/NN_<TASK>.md`
- Numerotare `NN` cronologică continuă (NU reset lunar) — preserve audit trail
- `_archive/` = istoric infinit, intact, zero info loss
- `.gitkeep` păstrează folder-ul în git

---

## 4. WORKFLOW DANIEL ↔ CLAUDE ↔ OPUS

```
1. Claude chat (eu) → generez artefact (handover, ADR, spec, prompt CC)
2. Daniel → uploadează artefact în 📥_inbox/, commit + push
3. Daniel → /model opus în CC, paste content PROMPT_CC_HYGIENE.md
4. Opus → citește VAULT_RULES.md + 📥_inbox/, integrează în vault SSOT
5. Opus → ȘTERGE 📥_inbox/* (consumat)
6. Opus → MOVE existing 📤_outbox/LATEST.md → 📤_outbox/_archive/<YYYY-MM>/NN_<TASK>.md
7. Opus → scrie raport nou ca 📤_outbox/LATEST.md
8. Opus → commit + push, raport în chat
9. Daniel → deschide 📤_outbox/LATEST.md, paste în chat Claude
10. Daniel → review, decide next action
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
- ❌ Multiple rapoarte la top-level outbox (dilute LATEST.md visibility)
- ❌ Merge la rapoarte vechi în archive (info loss)
- ❌ Output CC în alt folder decât `📤_outbox/` (`cc-reports/` deprecated)

---

## 7. WHEN VAULT_RULES UPDATES

Acest fișier se actualizează **rar** și **inline**:
- Adăugare regulă nouă → secțiune nouă în §3 sau §6
- Schimbare structură → update §1 + §2
- Schimbare workflow → update §4

Update direct (NU creez `VAULT_RULES_v2.md`).

---

🦫 **Vault clean permanent. SSOT only. Zero duplicate. Zero memory load pe Daniel.**

---

## §HANDOVER_PROTOCOL — Cross-session continuity & saturation prevention

**Status:** Locked (introdus 2026-04-30, post-saturation incident chat strategic).
**Authority:** SSOT pentru handover flow Daniel ↔ Claude chat ↔ CC Opus.

### Why this protocol exists

Sesiuni Claude chat strategic se saturează după 3-5h conversație complexă. Saturarea = bandwidth degradat → halucinații flow procedural (NU conținut). Pe 30 apr 2026, saturarea a produs 3 iterații consecutive halucinate în scrierea handover-ului → vault contaminat → recovery audit + fix run + 7 commits.

**Anti-recurrence:** acest protocol formalizează când + cum se scrie handover, ca să **NU** mai fie scris cu bandwidth scăzut.

### Principle: Continuous over end-of-session

Handover **NU** e document scris la finalul sesiunii dintr-o singură bucată. Handover = **aggregate al deciziilor marcate progresiv** pe parcursul sesiunii, când Claude e fresh. La handover-time, Claude doar structurează aggregate-ul deja existent în memoria conversațională, NU re-creează tot din memoria saturată.

### Self-monitoring transparent (Claude responsibility)

La fiecare 5-7 mesaje grele SAU când Claude detectează degradare, raportează în răspunsul curent 1 linie scurtă:

```
Bandwidth: ~X% remaining, OK încă Y mesaje grele.
```

SAU când e timpul:

```
Bandwidth: ~25% — recomand handover ACUM, încă-s fresh.
```

NU întrerupe flow. NU întreabă. Doar raportare. Daniel decide acționează sau ignoră.

### Decision logging silent (Claude responsibility)

Când Daniel zice ceva care e **decizie LOCKED cu impact vault** (D-N routing, ADR new, scope changes, pricing, positioning), Claude **mental marchează** și păstrează running log intern progresiv în sesiune. NU generează artefact mic la fiecare decizie (overhead Daniel = anti-pattern).

La handover-time: handover = aggregate al deciziilor marcate mental când fresh.

### Handover flow (când e timpul)

**Trigger:** Bandwidth ~25-30% remaining SAU Daniel decide explicit "scriem handover".

**Steps:**

1. **Claude chat strategic** scrie handover comprehensive ca artefact descărcabil (`HANDOVER_INPUT_<topic>.md`)
2. **Daniel** drag în `📥_inbox/`
3. **Daniel** rulează prompt CC scurt pentru ingest (vezi §INGEST_PROMPT)
4. **CC Opus** citește input + active SSOT din `06-sessions-log/HANDOVER_GLOBAL_<date>_<period>.md`
5. **CC Opus** merge ambele în 1 versiune unique (zero info loss)
6. **CC Opus** overwrite SSOT same name cu merged version
7. **CC Opus** archive input la `📤_outbox/_archive/<YYYY-MM>/NN_HANDOVER_INPUT_CONSUMED.md` (NICIODATĂ DELETE)
8. **CC Opus** scrie raport execution în `📤_outbox/LATEST.md`
9. **CC Opus** generează alignment questions pentru chat nou (în `📤_outbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md`)
10. **CC Opus** commit + push origin/main
11. **Daniel** sync Project Knowledge GitHub
12. **Daniel** open chat Claude nou
13. **Daniel** paste alignment questions primul mesaj
14. **Chat nou** răspunde cu citation `§X file.md / ADR Y` → pass criteria ≥12/15

### Constraints absolute

- **Inbox = strict input Daniel only.** CC Opus NICIODATĂ NU scrie în inbox. ZERO excepții. Toate output-urile CC merg în `📤_outbox/` (raport în `LATEST.md`, alignment questions ca file separat top-level, archive cronologic în `_archive/<YYYY-MM>/`).
- **Zero info loss.** Toate input-urile inbox archive-uite în outbox post-consume, NICIODATĂ delete fizic.
- **Backup tag git** pre-cleanup major obligatoriu (`pre-handover-merge-<date>` sau similar).
- **NU** scrie handover dintr-o bucată la final sesiune saturată. Aggregate progresiv.
- **NU** sări peste alignment questions verify în chat nou — fără verificare = risc continuare cu drift.

### Stop conditions

- Dacă Claude chat e saturat <30% bandwidth dar Daniel cere handover comprehensive → Claude flag explicit "saturat, recomand chat nou pentru scriere handover, NU aici".
- Dacă alignment questions <12/15 în chat nou → INGEST FAIL, retry `project_knowledge_search` în chat sau regenerare questions.
- Dacă merge conflict pre-existent în vault → STOP, Daniel manual resolve, NU CC override automat.

### Cross-references

- §3.3 outbox schema (LATEST.md + _archive/<YYYY-MM>/NN_*.md cronologic continuu)
- §INBOX_FLOW (Daniel input only)
- `PROMPT_CC_HYGIENE.md` §3.2 raport format expected

🦫 **Handover protocol locked. Anti-saturation enforced. Vault hygiene preserved.**

---

## §BATCH_PROTOCOL — Cluster Execution Standard

**Status:** LOCKED V1 (codified 2026-05-02 post Sprint 4.x pilot validation)
**Origin:** Sprint 4.x cluster (5 batches sequential, zero errors, 1110→1174 tests, 5 commits clean) — pattern validated empirically.

### Purpose

Standardize multi-batch sequential execution prin Claude Code Opus pentru clusters mari (>3 batches sau >2h Opus runtime). Prevent shared touch-point conflicts, gate dependencies, manual orchestration overhead.

### Core Rules (8 elements MANDATORY)

#### 1. Naming Convention
Pattern: `PROMPT_CC_BATCH_<NN>_<SCOPE>.md` unde:
- `<NN>` = 2-digit zero-padded sequential number (01, 02, ..., 10, 11)
- `<SCOPE>` = UPPERCASE_SNAKE_CASE descriptive (e.g., `ADR_LOCKS`, `GOLDEN_MASTER_TESTS`)

Alfabetic ordering = natural execution order.

#### 2. Header Obligatoriu
Each batch file MUST contain header:
```
**Model:** Opus | Sonnet
**Order:** N/Total
**Dependencies:** none | BATCH_XX complete
**Scope:** <one-line description>
**Estimate:** ~Xh
```

#### 3. Strict Disjuncte (zero shared touch-points)
Two batches în același cluster CANNOT modify same file or same logical unit. Verification pre-cluster: list all files modified per batch, ensure intersection = ∅.

Exception: HANDOVER_GLOBAL.md per-batch entries OK (append-only, separate sections).

#### 4. Fail-Fast Strict
Pe primul error în orice batch → STOP cluster execution. NU continue cu degraded scope. Daniel review report → manual restart sau amendment.

NU: skip failing batch, continue cu batches subsequent.

#### 5. Zero Gate Principle
Each batch self-contained — NU dependent runtime gate from another batch beyond declared `Dependencies` în header. If batch B needs runtime artifact from batch A → declare explicit în Dependencies.

NU: implicit dependencies (e.g., "BATCH_03 assumes Firebase Auth live without declaring").

#### 6. Sequential Auto-Trigger
Master command: "Execute BATCH_01 → BATCH_NN sequential per VAULT_RULES §BATCH_PROTOCOL. Fail-fast strict."

CC Opus reads each PROMPT_CC_BATCH_*.md în order, executes, generates report în `📤_outbox/_archive/<YYYY-MM>/BATCH_NN_REPORT.md`, triggers next.

#### 7. Final Batch Convention
Last batch în cluster (BATCH_NN) MUST:
- Aggregate all batch reports into single `📤_outbox/LATEST.md` consolidated
- Include: total commits + tests delta + ADR changes + carry-overs + next action recommended
- Append cumulative session-lock entry în HANDOVER_GLOBAL §36

#### 8. Commit Message Format
Each batch commits cu format:
```
feat(batch-NN): <one-line scope>

- bullet 1 detailed change
- bullet 2 detailed change
- bullet 3 cross-refs / verification
```

Example: `feat(batch-01): LOCK V1 cele 3 ADR drafts + EXT-1 DOMS hide`

### Trigger Threshold

§BATCH_PROTOCOL MANDATORY pentru:
- ≥3 batches în cluster
- ≥2h estimated Opus runtime cumulative
- Strategic execution session (NU exploratory)

OPTIONAL pentru:
- 1-2 batches isolated (use single PROMPT_CC standard)
- Exploratory work cu uncertainty pe scope

### Cross-References

- Sprint 4.x cluster pilot: `📤_outbox/SPRINT_4X_FINAL_REPORT.md` (commit `c283a81`)
- ALIGNMENT_QUESTIONS Q5 + Q10 codification scope: `06-sessions-log/HANDOVER_GLOBAL.md` §36.63
- Master orchestration command pattern: see PROMPT_CC_BATCH_*.md naming convention în `📥_inbox/` per cluster.

### §BATCH_PROTOCOL.X — Default Batches + Single Centralized Report (LOCKED V1 §36.74)

**Regula MANDATORY default permanent pentru CC Opus task-uri:**

**Default = BATCHES (NU single prompts):**
- Claude chat strategic generează N artefacte CC prompts copy-ready distincte (oricare N: 2, 3, 5, 6+) când scope-ul permite disjuncte clean
- Daniel drag toate N artefacte în 📥_inbox/
- Daniel comandă unică CC Opus: "Rulează toate batch-urile din inbox sequential per §BATCH_PROTOCOL"
- CC Opus rulează batch după batch fail-fast strict per §BATCH_PROTOCOL
- **CC Opus produce 1 SINGUR raport `📤_outbox/LATEST.md` centralizat la final**, conținând outcomes pentru toate batch-urile rulate
- Per-batch reports detaliate merg în `📤_outbox/_archive/<YYYY-MM>/BATCH_NN_REPORT.md`

**Excepție single prompt:**
- Single prompt CC permis DOAR când scope-ul nu se poate batch (interdependențe forțate, tot scope-ul atinge același module)
- Default = batch. Single = excepție justificată cu rationale explicit în prompt header.

**Rationale:**
- Eficient pentru Daniel (drag-drop multiple, 1 comandă, 1 raport final)
- Empirical validated cluster 10-batch sesiune 2026-05-02 (factor 5-7x optimism Opus, zero errors)
- Reduce chat-back-and-forth pe per-batch progress

**Cross-refs:** §36.63 cluster pattern + §36.71 cluster session lock + §36.74 LOCKED V1 decision.
