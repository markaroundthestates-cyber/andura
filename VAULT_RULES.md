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

**Trigger:** Bandwidth ~25-30% remaining SAU Daniel decide explicit "vreau handover complet seamless" / "facem handover" cu scope ingest substantial.

**DISAMBIGUATION trigger (AMENDMENT 2026-05-04 evening late post §CHAT_CONTINUITY_PROTOCOL LOCK):**

| Condition | Path |
|-----------|------|
| Bandwidth ~25-30% remaining + scope ingest substantial (LOCKED noi multiple, ADR drafts, SSOT amendments) | **§HANDOVER_PROTOCOL deep** (this section, ~1h CC, full HANDOVER_GLOBAL rewrite, DIFF Protocol §7 + ALIGNMENT_QUESTIONS §9 ≥12/15) |
| Bandwidth healthy + Daniel zice "fă handover" voluntary chat-to-chat checkpoint | **§CHAT_CONTINUITY_PROTOCOL §CC.5 fast** (~5-10 min CC, single-file CURRENT_STATE update, NU touch HANDOVER_GLOBAL) |
| Ambiguous | Default §CC.5 fast (lower blast radius); upgrade deep dacă Daniel clarifies "complet seamless" |

Daniel decision-driven, NU automated. Cross-ref `08-workflows/CHAT_MIGRATION_PROTOCOL.md` §9.1 trigger disambiguation table.

**Steps:**

1. **Claude chat strategic** scrie handover comprehensive ca artefact descărcabil (`HANDOVER_INPUT_<topic>.md`)
2. **Daniel** drag în `📥_inbox/`
3. **Daniel** rulează prompt CC scurt pentru ingest (vezi §INGEST_PROMPT)
4. **CC Opus** citește input + active SSOT din `06-sessions-log/HANDOVER_GLOBAL_<date>_<period>.md`
5. **CC Opus** merge ambele în 1 versiune unique (zero info loss)
6. **CC Opus** overwrite SSOT same name cu merged version
7. **CC Opus** archive input la `📤_outbox/_archive/<YYYY-MM>/NN_HANDOVER_INPUT_CONSUMED.md` (NICIODATĂ DELETE)
8. **CC Opus** scrie raport execution în `📤_outbox/LATEST.md`
9. **CC Opus** generează alignment questions pentru chat nou (în `📤_outbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md`) — **AMENDMENT 2026-05-04 night (per HANDOVER_GLOBAL §47 LOCKED V1):** format SEARCH-DRIVEN mandatory STRICT (Q + search keywords + citation expected + PASS criteria, NU pre-fed verbatim răspuns). Forma pre-fed verbatim DEPRECATED. Vezi `PROMPT_CC_HYGIENE.md` §9 + HANDOVER_GLOBAL §47.
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
- **§CHAT_CONTINUITY_PROTOCOL §CC.1-§CC.8** (post LOCK 2026-05-04 evening) — fast chat-to-chat alternative when bandwidth healthy + voluntary checkpoint + CURRENT_STATE update sufficient (NU full HANDOVER_GLOBAL rewrite). Trigger disambiguation table above.
- **§HANDOVER_PROTOCOL STEP 16 amendment** (post §CHAT_CONTINUITY_PROTOCOL section below) — CURRENT_STATE.md update post-ingest atomic per append-only canonical.

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

- Sprint 4.x cluster pilot: `📤_outbox/_archive/2026-05/116_SPRINT_4X_FINAL_REPORT.md` (commit `c283a81`)
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

---

## §VAULT_HYGIENE_PASS — Auto-Hygiene Post-Ingest Standard

**Status:** LOCKED V1 (codified 2026-05-04 Vault Hygiene Sprint Faza 4 per §36.97)
**Authority:** SSOT pentru auto-hygiene execution post oricărui handover ingest. Trigger: mandatory post-ingest, NU optional.

### Why this rule exists

Audit Vault Hygiene Faza 1 (2026-05-03) a detectat drift cumulativ silent peste sesiuni: 22 orphan wikilinks + 4 ADR drift + DECISION_LOG UTF-8 corruption + INDEX_MASTER stale + HANDOVER_GLOBAL bloat + SSOT fragmentation 5 topics. Cauza: ingest handover NU avea hygiene step → drift acumulat.

**Anti-recurrence:** STEP 10-15 mandatory append la "Ingest handover from inbox" command — auto-execute hygiene pass post-ingest, zero manual oversight needed.

### Trigger conditions

**MANDATORY trigger:** orice execuție comandă `Ingest handover from inbox per VAULT_RULES §HANDOVER_PROTOCOL`. STEP 10-15 sunt steps adiționali parte integrantă din ingest flow.

**OPTIONAL trigger** (manual invocation): Daniel comanda `Run Vault Hygiene Pass per VAULT_RULES §VAULT_HYGIENE_PASS` standalone — execute STEP 10-15 fără ingest precedent.

### STEP 10-15 spec (auto-execute post STEP 1-9 §HANDOVER_PROTOCOL)

**STEP 10 — Detect new SSOT fragmentation**
- Scan toate fișiere modificate în această sesiune: dacă >1 file pe same topic introdus → FLAG fragmentation
- Heuristic: căutare keywords semantically related în fișiere distincte (Goal Taxonomy / Onboarding / Pricing / Mode Detection / RPE/RIR / Calibration / etc.)
- Output: lista candidat consolidate în `📤_outbox/LATEST.md` § Issues / Ambiguities

**STEP 11 — Detect new orphans**
- Scan wikilinks `[[X]]` în toate fișiere modificate: verifică file `X.md` sau `X[*].md` exists fizic
- MISSING wikilinks → FLAG list în raport
- UNREFERENCED files (existing dar zero wikilinks pointing to them) → FLAG candidate move/delete (preserve audit trail)
- Severity: HIGH dacă missing ADR file (ex: ORPHAN-1 ADR 022 finding) / MEDIUM dacă concept obsolete cross-ref (ex: EXEC_QUEUE) / LOW dacă historical doc closed

**STEP 12 — Detect ADR drift**
- Scan `03-decisions/`: verifică INDEX_MASTER reflectă ADR count + status accurate
- Check `ADR-URI ACTIVE` table coverage vs file count fizic
- §AMENDMENT inline detection (NU separate AMENDMENT files per §6 anti-pattern)
- Output: list ADR drift în raport

**STEP 13 — Detect HANDOVER size threshold**
- `wc -l 06-sessions-log/HANDOVER_GLOBAL_*.md`
- Threshold: >7000 LOC → FLAG split candidate (NU auto-split, daniel decision required + careful cross-ref preservation)
- Threshold: >10000 LOC → ESCALATE BLOCKER, manual split mandatory next chat strategic
- Output: line count + threshold status în raport

**STEP 14 — Auto-fix mecanic safe**
- **Cross-refs reciproce:** dacă ADR new în `03-decisions/`, append entry în `00-index/INDEX_MASTER.md` `ADR-URI ACTIVE` table
- **Archive un-numbered:** orice file în `📤_outbox/_archive/<YYYY-MM>/` fără NN prefix → rename cu next NN cronologic continuu
- **UTF-8 normalize** dacă mojibake detectat (â€" / Äƒ / È› / Ã® / Â§ patterns) — apply targeted Python substitution per §VAULT_HYGIENE_PASS.UTF8 sub-section below
- **Stale path references** post-rename — sweep wikilinks + plain text refs

**STEP 15 — Flag DIFF_FLAGS dacă consolidare manuală necesară**
- Dacă STEP 10-13 detectează probleme NU rezolvabile mecanic STEP 14 → append entry în `DIFF_FLAGS.md` ca P1 sau P2 (severity-based)
- Format: `### P1-FLAG-<sequential> — <Title>` cu Status / Severity / Issue / Action Daniel / Cross-refs
- Output: link la DIFF_FLAGS.md în raport `📤_outbox/LATEST.md` § Next action Daniel

### Effort estimate

- ~10-15min CC autonomous per ingest
- ZERO Daniel-time (hygiene = mecanic, NU strategic)

### §VAULT_HYGIENE_PASS.UTF8 — Mojibake fix patterns

Standard cp1252 → UTF-8 double-encoding fix. Apply **exact codepoint sequences** (NOT regex globs — risk false positives):

```python
substitutions = [
    # 3-char sequences (most specific first)
    ('â€"', '—'),  # em dash (codepoints 0xE2 0x20AC 0x201D)
    ('â€"', '–'),  # en dash (codepoints 0xE2 0x20AC 0x201C)
    ('â†’', '→'),  # right arrow (0xE2 0x2020 0x2019)
    ('â‰¤', '≤'), ('â‰¥', '≥'), ('â‰', '≈'),
    # 2-char sequences — Romanian diacritics
    ('Äƒ', 'ă'), ('Ä‚', 'Ă'),  # ă/Ă (a-breve)
    ('Ã®', 'î'), ('ÃŽ', 'Î'),  # î/Î (i-circumflex)
    ('Ã¢', 'â'),  # â (a-circumflex)
    ('È™', 'ș'), ('È›', 'ț'),  # ș/ț (s-comma, t-comma)
    # Other common
    ('Â§', '§'), ('Â°', '°'), ('Ã—', '×'),
]
```

Save with **UTF-8 no BOM, LF line endings** (`newline='\n'` în Python). Validate: `file -i path` should show `charset=utf-8`.

### Stop conditions

- STEP 10-15 NU rulează dacă §HANDOVER_PROTOCOL STEP 1-9 a eșuat (ingest fail-fast preserved)
- STEP 14 auto-fix RESPECTĂ §5 SAFETY NET — zero unilateral DELETE pe info ambiguă
- STEP 13 split candidate detect = FLAG only, NU auto-execute (cross-ref preservation requires manual planning)

### Cross-references

- §HANDOVER_PROTOCOL (parent flow) + §3.5 Dropzone protocol (inbox/outbox state)
- §6 Anti-pattern interzise (NU recreate problems STEP 10-15 detect)
- §5 SAFETY NET zero info loss (STEP 14 must respect)
- `📤_outbox/_archive/2026-05/110_VAULT_AUDIT_INVENTORY.md` §8 (origin spec from Faza 1 audit)
- HANDOVER_GLOBAL §36.97 (Faza 4 LOCK ca Rule decision wording)
- DIFF_FLAGS.md (STEP 15 output target)

🦫 **Vault Hygiene Pass codified 2026-05-04. Zero drift acumulat. Auto-execute mandatory post-ingest. ~10-15min CC per ingest. Daniel-time: zero.**

---

## §CHAT_CONTINUITY_PROTOCOL — Live SSOT Layer Over §HANDOVER_PROTOCOL

**Status:** LOCKED V1 (codified 2026-05-04 evening — extends §HANDOVER_PROTOCOL existing, NU înlocuiește).
**Authority:** SSOT pentru chat NEW startup fast layered read + chat-to-chat fast handover (~5-10 min CC) între deep merges.
**Relation to §HANDOVER_PROTOCOL:** §HANDOVER_PROTOCOL existing rămâne authoritative pentru deep merge (1h CC, weekly/major milestone, DIFF Protocol §7 mandatory, ALIGNMENT_QUESTIONS §9 ≥12/15). §CHAT_CONTINUITY_PROTOCOL adaugă layer light deasupra: live SSOT `00-index/CURRENT_STATE.md` updated chat-to-chat fără full HANDOVER_GLOBAL rewrite.

### §CC.1 Why this layer exists

`HANDOVER_GLOBAL_*.md` deep archive ~5000+ LOC (growing rapid, split candidate per §VAULT_HYGIENE_PASS STEP 13 threshold >7000). Chat NEW startup citind integral = overhead minute + token cost + risc skim/shortcut. Daniel sesiuni multiple/zi → 1h deep handover per saturation cycle = friction nesustenabil. §HANDOVER_PROTOCOL existing rezolvă saturation incident (anti-recurrence halucinare scriere handover bandwidth scăzut) dar NU rezolvă chat-to-chat fast iteration între deep merges.

**Soluția:** layer SSOT live ~200 LOC `CURRENT_STATE.md` actualizat fast (~5-10 min CC) între deep merges săptămânal/major milestone. Chat NEW citește CURRENT_STATE primul; deep HANDOVER doar drill-down când CURRENT_STATE referențiază secțiuni active.

### §CC.2 Chat NEW Startup Layered Read (mandatory)

Sequential read order — NU parallel skip, NU shortcut:

1. **`00-index/CURRENT_STATE.md` (full ~200 LOC)** — live SSOT thread + recent context + pointers
2. **Sections HANDOVER_GLOBAL referenced în CURRENT_STATE `## ACTIVE_REFS`** — drill-down deep doar pentru topice active
3. **Top 3 ADRs din CURRENT_STATE `## ACTIVE_ADRS`** — domain decisions deep relevante
4. **`DIFF_FLAGS.md` P1 active (din CURRENT_STATE `## ACTIVE_FLAGS`)** — outstanding issues blocante

**Skip oricare layer fără cause justificată = drift risk.** Chat NEW recomandare: explicit "READ-ONLY mode până layered read complet" dacă bandwidth insuficient.

**NOTE enforcement:** Acest protocol e enforced pe convention (Daniel paste-uiește prompt context pentru chat NEW + project knowledge include CURRENT_STATE). NU există mecanism filesystem-side care forțează chat NEW să citească. CURRENT_STATE = `## INDEX_MASTER` top entry "READ FIRST" + README pointer servesc ca semnale vizibile.

### §CC.3 Startup Output Format Recommended

```
Aligned X/Y verified (X = layered read complete, Y = total layers).
Last LOCKED: [decision] (path:§)
Mid-flight: [active topic + status] (path:§)
Next P1: [actionable + blocking deps]
Drift: [silent flags if timestamps mismatch în CURRENT_STATE vs DECISION_LOG]
Continuăm?
```

### §CC.4 Citation Enforcement Post-Startup (Anti-Hallucination)

- Every factual claim post-startup = citation `path:§` obligatoriu
- Format: `Per CURRENT_STATE §NOW: ...` sau `Per HANDOVER_GLOBAL §X: ...`
- Memory recall fără citation verifiabilă = re-verify cu read/grep
- Uncertain pe topic = explicit "verific cu search" NU pretinde
- Daniel "halucinezi" → instant pause + "ai dreptate" + verify search NU defend

### §CC.5 Fast Handover Workflow (chat-to-chat)

**Trigger:** Daniel "fă handover" în chat curent (NU saturation forced — voluntary continuity checkpoint).

**Distinct de §HANDOVER_PROTOCOL deep:**
- §HANDOVER_PROTOCOL deep = saturation-driven, full HANDOVER_GLOBAL rewrite, DIFF Protocol §7 + ALIGNMENT_QUESTIONS §9 ≥12/15, ~1h CC, weekly/major milestone
- §CHAT_CONTINUITY_PROTOCOL fast = voluntary, CURRENT_STATE single file update, ~5-10 min CC, chat-to-chat between deep merges

**Steps:**
1. **Claude chat:** generate artefact narrativ ~50-100 LOC format conversațional (NU tabel verbatim) — "Discutam X. Daniel B. Push-back Y. Pivot Z. Mid-decision pe W, opțiuni..."
2. **Daniel:** drag artefact în `📥_inbox/` + 1 comandă: `Update CURRENT_STATE per inbox handover`
3. **CC ~5-10 min** per §CHAT_CONTINUITY_PROTOCOL STEP 16 amendment (vezi mai jos):
   - APPEND new content în CURRENT_STATE secțiunile relevante (NU rewrite distructiv)
   - APPEND entry în DECISION_LOG.md
   - Move artefact din `📥_inbox/` la `📤_outbox/_archive/<YYYY-MM>/NN_<TASK>_CONSUMED.md`
   - Backup tag: `pre-handover-<YYYY-MM-DD-HHMM>`
   - Commit + push origin main (hooks normal, NU `--no-verify` decât justificat)
4. **STOP.** NU touch `HANDOVER_GLOBAL.md` deep, NU sync alte SSOT-uri. §HANDOVER_PROTOCOL existing preserved unchanged.

**§CC.9 extension (LOCKED V1 2026-05-07 Run 2 Task 7):** Fast handover workflow §CC.5 minimum steps 1-2 (CURRENT_STATE + DECISION_LOG). §CC.9 Mandatory File Updates Per Handover extends pentru full vault hygiene completeness — see §CC.9 below for 5-step mandatory checklist (3 INDEX_MASTER stats refresh + 4 §ACTIVE_REFS sync + 5 Pre-flight grep wikilinks orphane). Daniel's command "Update CURRENT_STATE per inbox handover" implicitly invokes §CC.9 (NU optional).

### §CC.6 CURRENT_STATE.md Append-Only Architecture (canonical)

**Sections fixed order:**
- `## NOW` — active conversation thread (1 section visible at top)
- `## JUST DECIDED` — recent LOCKED entries last 24-72h (append-only, descending chronologic)
- `## NEXT` — priority order actionable
- `## ACTIVE_REFS` — HANDOVER_GLOBAL sections to deep-read for current topics
- `## ACTIVE_ADRS` — top ADRs to deep-read
- `## ACTIVE_FLAGS` — DIFF_FLAGS.md P1 status (mirror, NU duplicate canonical state)
- `## RECENT` — **active conversation context (typically last 3-7 days cronologic)**, older `NOW` content moved here. Truncate to HANDOVER_GLOBAL deep când section >50 LOC.
- `## POINTERS` — deep history drill-down pointers

**Scope discipline (AMENDMENT 2026-05-04 evening late post verification audit):**
- ## RECENT = **active context only**, NU full DECISION_LOG mirror. Older entries (foundational decisions, stable historical state pre last ~7 days) pointed via ## POINTERS → `03-decisions/DECISION_LOG.md` full + `06-sessions-log/HANDOVER_GLOBAL_*.md` deep archive.
- Truncate threshold 50 LOC enforces this discipline mechanic — when ## RECENT exceeds 50 LOC, oldest entries migrate to HANDOVER_GLOBAL deep (already archived natural via ingest), NU ## RECENT expansion.
- Cumulative LOCKED count tracking is the boundary signal: entries cu cumulative count active = ## JUST_DECIDED (newest) + ## RECENT (last 3-7 days); entries pre-tracking-system = ## POINTERS only.

**Edit semantics (canonical):**
- New conversation thread → APPEND la `## JUST DECIDED` top + UPDATE `## NOW` în-place cu thread curent + MOVE precedent `## NOW` content la TOP `## RECENT` (NU overwrite, NU delete)
- Truncate `## RECENT` oldest la HANDOVER_GLOBAL deep doar când section >50 LOC (preserve append-only zero-info-loss)
- ZERO destructive rewrite. `## NOW` "în-place update" = move-then-replace (precedent preserved în `## RECENT`).

### §CC.7 Safety Nets

**Layer 1 — Layered read mandatory** (§CC.2)

**Layer 2 — Citation enforcement** (§CC.4)

**Layer 3 — Drift detection silent (timestamps):**
Chat NEW startup compară `CURRENT_STATE.md` header `Updated:` vs `DECISION_LOG.md` last entry timestamp. Mismatch >24h sau gap suspect → flag în output startup: `Drift: CURRENT_STATE older than DECISION_LOG by Xh. Re-sync recommended.` NU întrerupe chat — Daniel decide acționează/ignoră.

**Layer 4 — Append-only architecture** (§CC.6)

**Layer 5 — Backup tag git pre-handover MANDATORY:**
`git tag pre-handover-<YYYY-MM-DD-HHMM>` + `git push origin <tag>`. Worst case = full state recovery. Cross-ref `PROMPT_CC_HYGIENE.md` §8 Destructive Ops Checklist (existing rule, reinforced here).

### §CC.8 Cross-refs

- `00-index/CURRENT_STATE.md` (live SSOT, generated post §CHAT_CONTINUITY_PROTOCOL LOCKED)
- `PROMPT_CC_HYGIENE.md` §10 fast-handover workflow + §11 startup verify format
- `00-index/INDEX_MASTER.md` "READ FIRST" entry top navigation
- §HANDOVER_PROTOCOL existing (deep flow preserved unchanged)
- §HANDOVER_PROTOCOL STEP 16 amendment (below)
- §CC.9 Mandatory File Updates Per Handover (LOCKED V1 2026-05-07 Run 2 Task 7)

### §CC.9 Mandatory File Updates Per Handover (LOCKED V1 2026-05-07)

**Authority:** Run 2 Vault Cleanup Task 7 — codify post-handover required file updates anti-recurrence missed updates discovered audit-vault-2026-05-07.md (CURRENT_STATE §ACTIVE_REFS stale post-Capacity-A + INDEX_MASTER stats drift "92 vs 93 actual" + missed §POINTERS sync).

**Scope:** Applies BOTH §CC.5 fast handover AND §HANDOVER_PROTOCOL deep ingest. Mandatory checklist post-merge SSOT.

**Mandatory updates (5 steps — ALL required, NU partial):**

1. **CURRENT_STATE.md** §JUST_DECIDED top entry append + §NOW move-then-replace (precedent → §RECENT) — existing §CC.5/§CC.6 mecanic.

2. **DECISION_LOG.md** entry append top descending cronologic — existing §CC.5/§HANDOVER_PROTOCOL §10.4.

3. **INDEX_MASTER.md** stats line refresh — NEW §CC.9.3:
   - Active vault files count actual (`find . -name "*.md" -not -path "*/_archive/*"` mecanic recount)
   - ADR breakdown (numbered count + named count + total)
   - NAVIGARE table cross-refs sync if files archived/created/renamed în handover scope

4. **CURRENT_STATE §ACTIVE_REFS / §ACTIVE_ADRS / §ACTIVE_FLAGS** sync — NEW §CC.9.4:
   - REMOVE references la archived files (post-archive merge)
   - ADD references la new SSOT files (post-create merge)
   - REDIRECT references la deprecated sections → canonical SSOT pointers

5. **Pre-flight grep wikilinks orphane** mandatory before commit — existing §CC.5 reinforced §CC.9.5:
   ```bash
   grep -rEn '\[\[<archived_file_basename_pattern>' \
     --include="*.md" --exclude-dir=_archive --exclude-dir=node_modules \
     --exclude-dir=.git . | wc -l
   # Expect: 0 (all REDIRECT applied pre-archive)
   ```

**Failure mode:** any of 5 steps incomplete = handover INCOMPLETE. Next chat startup §CC.2 layered read va detecta drift via §CC.7 Layer 3 timestamp consistency check sau via stale references hit. Re-merge required.

**Goal §CC.9:** next chat startup §CC.2 layered read = TOT accurate; vault navigation fără garbage; PK indexing clarity preserved (NU contaminate top SSOT cu stale refs).

**Cross-refs:**
- §CC.5 Fast Handover Workflow (steps 1-2 mandatory minimum, §CC.9 extends adding 3-5)
- §HANDOVER_PROTOCOL STEP 16 Amendment (CURRENT_STATE update post-ingest, AMENDMENT below adds §CC.9 reference)
- `PROMPT_CC_HYGIENE.md` §10.9 Fast Handover Workflow (operational steps cross-ref §CC.9)

**Anti-recurrence rationale:** audit-vault-2026-05-07.md identified Drift 2 — INDEX_MASTER stats line 6 "92 fișiere active" stale vs actual 93 (off-by-one drift mecanic, undetected pre-audit). §CC.9 codifies stat refresh mandatory step pentru no-future-drift. Plus Drift 1 cumulative LOCKED count + Drift 3 stale chat-N references — toate prevenite via §CC.9 enforcement.

---

## §HANDOVER_PROTOCOL STEP 16 — Amendment (CURRENT_STATE update post-ingest)

**Trigger:** post §HANDOVER_PROTOCOL existing STEP 1-15 complete (deep `Ingest handover from inbox` workflow) SAU §CHAT_CONTINUITY_PROTOCOL §CC.5 fast handover workflow.

**Action — append-only canonical (NU rewrite destructive):**

1. APPEND new entry/entries la `00-index/CURRENT_STATE.md` `## JUST DECIDED` (top, descending chronologic)
2. UPDATE `00-index/CURRENT_STATE.md` `## NOW` în-place cu thread curent — **mecanism:** move precedent `## NOW` content la TOP `## RECENT`, apoi populate `## NOW` cu thread nou. Precedent preserved. ZERO content lost.
3. UPDATE `## NEXT` priority order (overwrite OK — priority list inherent volatile, snapshot curent)
4. UPDATE `## ACTIVE_REFS` + `## ACTIVE_ADRS` + `## ACTIVE_FLAGS` cu sections noi referenced (overwrite OK — references, NU content)
5. Truncate `## RECENT` oldest content la HANDOVER_GLOBAL deep doar când section >50 LOC
6. Update header `Updated:` timestamp
7. Verify timestamp consistency: CURRENT_STATE `Updated:` >= DECISION_LOG last entry timestamp. Mismatch detected → flag în `📤_outbox/LATEST.md` § Issues.

**Rationale append vs replace clarification:**
- `## JUST DECIDED` + `## RECENT` + `## POINTERS` = strict append-only (content history preserved)
- `## NOW` = move-then-replace (precedent preserved în `## RECENT`, NOT lost)
- `## NEXT` + `## ACTIVE_REFS/ADRS/FLAGS` = overwrite OK (these are pointers/snapshots, not content history)

**Failure mode:** STEP 16 fail → ROLLBACK ingest entire (revert backup tag pre-execution). NU partial state.

**§CC.9 Cross-ref (LOCKED V1 2026-05-07 Run 2 Task 7):** STEP 16 ingest action items extended per §CC.9 Mandatory File Updates Per Handover (5 steps total: CURRENT_STATE + DECISION_LOG + INDEX_MASTER stats + ACTIVE_REFS sync + Pre-flight grep). All 5 mandatory NU partial.

---

## §ANTI_RECURRENCE_RULES — Slip Patterns Consolidated (Claude scribe + CC autonomous)

**Status:** LOCKED V1 2026-05-07 (vault meta-tooling, NU product/architecture)
**Authority:** Run 3 consolidation post Run 2 LANDED 2026-05-07 (§NEXT P-CARRY-FORWARD entry chat-9 acasă closure mecanic) — slip patterns extracted din chat-uri 1-9 + Run 2 NEW slips
**Cross-refs:** §CHAT_CONTINUITY_PROTOCOL §CC.4 citation enforcement + §HANDOVER_PROTOCOL DIFF protocol §7 + PROMPT_CC_HYGIENE.md §3 pre-flight grep mandatory + memory rule `feedback_grep_before_prompt_cc.md` + `feedback_verify_remote_state.md`
**Source extraction:** /tmp/anti-recurrence-raw.txt (91 pattern matches grep multi-source 06-sessions-log/HANDOVER_*.md + 03-decisions/DECISION_LOG.md keywords: slip / mea culpa / hallucina / drift / lesson learned / anti-recurrence / repeated mistake / halucinez)

**Goal:** prevent Claude scribe slip-uri + CC autonomous slip-uri prin codified rules invariant. Each §AR.X rule = directive present-tense prescriptive cu verification mechanism + source examples cross-ref.

---

### §AR.1 Pre-Flight Grep Filesystem ÎNAINTE Reference Paths/Files/Tooling

**Trigger pattern:** Claude scribe presupune existence path/filename/script în prompt CC bazat pe pattern presupus (NU verbatim). Recidivă cross-chat: chat-2 (HANDOVER_GLOBAL stale + ADR_CASCADE_DEFENSE_v1 path 04-architecture/ vs 03-decisions/), chat-3 (§45.x stale + CLAUDE.md presupus exist), chat-4 (`npm run lint` script does NOT exist), chat-5 (grep PATHS recidivă), chat-8 (`013-ADR-aa-detection.md` filename fabricated, actual `013-auto-aggression-detection.md`).

**Source examples:**
- DECISION_LOG.md:132 §9.8 compile prompt — `013-ADR-aa-detection.md` fabricated → CC prins via grep filesystem mandatory
- DECISION_LOG.md:300 chat-3 PS — CLAUDE.md project-level presupus exist înainte create
- DECISION_LOG.md:357 Slip 4 — `npm run lint` tooling presupus
- DECISION_LOG.md:408 chat-2 — `04-architecture/ADR_CASCADE_DEFENSE_v1.md` vs realitate `03-decisions/`

**Anti-recurrence rule:** ÎNAINTE referențiez orice paths / function names / files / scripts / npm tooling în prompt CC = MANDATORY pre-flight grep filesystem (`ls <dir> | grep -iE "<pattern>"` SAU `Glob` SAU `Grep`). NU presupun din memorie. Pattern Bugatti CC anti-fabrication = invariant nenegociabil.

**Verification mechanism:** prompt CC pre-flight section MUST contain explicit grep / ls / Glob commands înainte action steps. CC pre-flight STOP if file/path NU found.

**Cross-ref existing:** §CC.4 citation enforcement | PROMPT_CC_HYGIENE §3 | memory rule `feedback_grep_before_prompt_cc.md`

---

### §AR.2 Source-of-Truth HANDOVER_GLOBAL Stale Assumption (split atomic vs consumed archives)

**Trigger pattern:** prompt CC declara source-of-truth = `HANDOVER_GLOBAL_<date>.md §X` dar split atomic 2026-05-05 birou redus stub-ul la INDEX file (~50 LOC navigation purpose). Real source = consumed archives `📤_outbox/_archive/<YYYY-MM>/NN_*_CONSUMED.md` (e.g., `142_*` + `177_*`).

**Source examples:**
- DECISION_LOG.md:355 Slip 2 — §9.1 compile declared §45.2-§45.5 = Cluster 1-5; realitate §45.x = ADR 026 Q1-Q40 architectural batch. Real source `142_HANDOVER_CONSUMED.md`
- DECISION_LOG.md:448 chat-2 morning — HANDOVER_GLOBAL stale assumption ADR 024 compile

**Anti-recurrence rule:** când prompt CC referencește `HANDOVER_GLOBAL §X` post-split → grep mandatory în split archives `📤_outbox/_archive/2026-05/` to confirm verbatim source content. Split file = INDEX navigation only, NU full content. Anti-hallucination grep saved the day each occurrence.

**Verification mechanism:** prompt CC source citations format `<consumed-archive-NN>_*.md §X` (NU `HANDOVER_GLOBAL §X` ambiguous post-split).

**Cross-ref existing:** §HANDOVER_PROTOCOL §7 DIFF protocol | §AR.1 above | PROMPT_CC_HYGIENE §3

---

### §AR.3 Ground Truth Git Verify ÎNAINTE Acuzare CC Hallucination sau Acțiuni Distructive

**Trigger pattern:** Daniel paste 3+ rapoarte LATEST verde consecutive Status=Complete + commits LANDED. Claude accept silent (CTO pivot). La pre-flight CC următor STOP triggered: baseline real ≠ raportat, commits NU în git log local. Claude sare la concluzie "CC halucinat 3 rapoarte fake" + cere acțiuni distructive (ștergere prompts/repaste/reset). Ground truth = local out of sync `<old-SHA>` cache stale fără `git fetch --all`.

**Source examples:**
- DECISION_LOG.md:170-174 chat-5 acasă drift event — Daniel uploadat 3 rapoarte (Tempo V1 + §9.6 compile + §9.6 V1 batch 6) toate valide. Eu acuzat fals "fake". Cerut ștergere 3 prompts (unul §9.7 era VALID integral). Ground truth: GitHub Actions imagine = commits EXISTAU pe origin/main, local out of sync `a99aa83`. Recovery: `git merge --abort` + tag backup + `git reset --hard origin/main`. **CC NU a halucinat NICIODATĂ.**

**Anti-recurrence rule:** ÎNAINTE acuzare CC hallucination sau cerere acțiuni distructive (ștergere/reset/--force-with-lease) → MANDATORY `git fetch --all && git status` + verify origin remote vs local. Local out of sync ≠ hallucination. Pattern: când Daniel pune push-back factual repetitiv pe ceva ce Claude blamează → reverify ground truth, NU defend assumption.

**Verification mechanism:** decision tree: STOP detected → step 1 `git fetch --all` → step 2 compare `git log origin/main..main` vs `git log main..origin/main` → step 3 verify remote SHA matches reports → step 4 ONLY THEN consider hallucination hypothesis.

**Cross-ref existing:** §CC.4 citation enforcement | memory rule `feedback_verify_remote_state.md` (recurring 2x: 2026-05-04 + 2026-05-06 chat-5) | §AR.4 below

---

### §AR.4 Anti-Distructive Recommendation Default

**Trigger pattern:** Claude propose acțiuni distructive (ștergere fișier, `git reset --hard`, `git push --force-with-lease`, `git rebase -i` interactive blocked, etc.) bazat pe assumption NU ground truth. Daniel push-back instinct corect inarticulat → reveal assumption greșit + acțiune distructive ar fi cauzat info loss permanent.

**Source examples:**
- DECISION_LOG.md:170-174 chat-5 — cerut ștergere 3 prompts (1 valid integral) post acuzare halucinare incorectă
- DECISION_LOG.md:172 — ÎNAINTE acțiuni distructive → MANDATORY ground truth git verify

**Anti-recurrence rule:** distructive operations (delete, reset --hard, force-push, --no-verify hooks, git checkout HEAD~ destructive) = LAST RESORT only post ground truth verify. Default = preserve + investigate first. Recovery path = `git tag backup-<context>-<SHA>` BEFORE distructive. Reversible options exhausted before irreversible.

**Verification mechanism:** prompt CC distructive operations section MUST require explicit Daniel approval per-execution + backup tag mandatory. NU autonomous distructive without explicit Daniel sign-off.

**Cross-ref existing:** §AR.3 ground truth verify | memory rule `feedback_verify_remote_state.md` "NEW anti-distructive recommendation rule"

---

### §AR.5 Audit Count Methodology Drift (NEW Run 2 Task 2 STOP)

**Trigger pattern:** Audit Phase B inbound count cited în spec stop-condition (e.g., "12 expected", "X files baseline") used permissive grep (any reference style: wikilinks + filename strings + path mentions). Spec inherits count literal expecting strict `[[wikilink]]` form. Real strict count diverges ≥3 → fail-stop trigger fires.

**Source examples:**
- Run 2 Task 2 STOP `12e0506` — audit "12 expected" inbound HANDOVER_VAULT_HYGIENE + HANDOVER_MISC. Strict wikilink scope = 4 instances. Variance ≥3 → STOP triggered correctly. Methodology mismatch documented + Option A override Daniel-approved (4 wikilinks surgical).

**Anti-recurrence rule:** când spec stop-condition cites audit count baseline → audit grep methodology MUST be documented verbatim (exact pattern + scope filter + exclusion dirs). Strict scope `[[wikilink]]` form ≠ permissive grep methodology counting filename strings + path mentions. Spec MUST clarify which form used pentru count, NU presume implicit. Variance ≥3 → escalate Daniel review (audit may be stale OR grep pattern incomplete OR methodology mismatch).

**Verification mechanism:** spec pre-flight section MUST include exact grep command + tolerance window justification. Stop-condition baseline citation = "audit Phase X count Y using <grep-pattern>" not just "Y expected".

**Cross-ref existing:** §AR.1 pre-flight grep | §HANDOVER_PROTOCOL §7 DIFF protocol | Run 2 LATEST.md (28598a9) Task 2 Option A

---

### §AR.6 §-Prefix Regex Strict Over-Specification (NEW Run 2 Task 1 STOP)

**Trigger pattern:** Audit Phase B+ uses `§` ca shorthand notation pentru section labels (e.g., "§29.7 Pre-Launch Checklist"). Spec inherits literal `^## §X` regex strict over source files cu mixed convention drift — older sections `## N.M` (legacy NO § prefix), newer `## §N.M` (post-2026-05-02 convention). Pre-flight stop-trigger fires correctly when 3 of 4 headers fail strict regex.

**Source examples:**
- Run 2 Task 1 STOP `34f21ba` — HANDOVER_MISC actual headers `## 29.7 / ## 31. / ## 32.` (no §) + `## §36.103` (with §). Spec v1 over-specified `^## §X` literal. Option A relaxation `§?` + `\b` boundary applied (commit `c9dac4e`).

**Anti-recurrence rule:** audit notation ≠ source verbatim. Spec regex MUST relax `§?` optional pe source files cu known mixed convention drift. `\b` word boundary RETAIN pentru drift detection (line shift would still fail). Document în spec when source uses legacy convention vs newer §-prefix.

**Verification mechanism:** spec pre-flight regex `^## §?<N>\.<M>\b` (optional § + word boundary) when source mixed convention. Header diff strict-vs-relaxed documented în spec rationale.

**Cross-ref existing:** §AR.5 audit count methodology | Run 2 STOP raport (12e0506 + 34f21ba) | Run 2 spec patch v2 (c9dac4e)

---

### §AR.7 §ACTIVE_REFS REPLACE/ADD Pre-Verify Target State (NEW Run 2 Task 2 CC craft)

**Trigger pattern:** Spec instructs REPLACE `[[<archived>]]` references în CURRENT_STATE §ACTIVE_REFS. CC verifies pre-edit: §ACTIVE_REFS NU contains direct wikilinks → archived files (pointers reference HANDOVER_GLOBAL INDEX cu internal § anchors instead). REPLACE instruction MOOT, ADD instruction relevant.

**Source examples:**
- Run 2 Task 2 CC raport — spec line 86-87 REPLACE `[[HANDOVER_VAULT_HYGIENE_2026-04-30_evening]] §41-§49` în §ACTIVE_REFS. Pre-verify: §ACTIVE_REFS lines 1737-1752 reference `HANDOVER_GLOBAL_2026-04-30_evening.md §41-§45` (GLOBAL INDEX cu internal anchors NOT archived files directly). REPLACE moot. ADD 4 NEW Task 1 split file pointers relevant (preserved în execution).

**Anti-recurrence rule:** spec REPLACE/ADD/REDIRECT instructions MUST verify pre-edit target state actual exists VERBATIM, NU presume from spec narrative. Bugatti CC craft = surface MOOT vs execute mock-replace producing zero-effect commit.

**Verification mechanism:** prompt CC pre-edit section: `grep -n '<old_pattern>' <file>` to confirm match exists. If 0 matches → flag MOOT în raport, skip edit. NU fabricate edit op cu "find no match" silent.

**Cross-ref existing:** §AR.1 pre-flight grep | §AR.5 + §AR.6 above | §CC.4 citation enforcement

---

### §AR.8 Markdown Chat Block vs Artefact (Memory Rule #2 RECIDIVĂ)

**Trigger pattern:** Claude livrează prompt CC ca code block markdown în chat în loc de artefact 1-click DOWNLOADABLE. Daniel push-back: *"de ce ai dat markdown in loc de artefact... i-am dat eu manual paste"*. Memory rule #2 ("Artefacte mereu pentru prompts CC") violated.

**Source examples:**
- DECISION_LOG.md:354 chat-3 acasă §9.1 compile prompt — markdown chat block forced manual paste
- DECISION_LOG.md:240 chat-3+chat-4 — slip "puppy" recidivă fixed post Daniel push-back

**Anti-recurrence rule:** prompts CC = artefact direct sine excepție (UI affordance: 1-click drag în inbox). NU code block markdown in chat. Pattern Daniel-isms: "*tu esti cto sau puppy?*" = parodie pattern, instinct corect.

**Verification mechanism:** workflow Claude when generating prompt CC for autonomous execution → use artefact tool (single complete prompt artefact) NOT markdown chat block. Daniel acceptable workflow: drag artefact → 📥_inbox/.

**Cross-ref existing:** memory rule #2 (Artefacte mereu pentru prompts CC) | DECISION_LOG.md chat-3 + chat-4 mea culpa scribe

---

### §AR.9 Format Fatigue + 2-Options Theater Anti-Pattern

**Trigger pattern:** Claude verbose responses (300 cuvinte mea culpa + 200 despre palmă) post slip detection, OR 2-options confirmation theater ("vad 2 pathuri... oare sigur?", "tu zici?", "ne certam :))") repetitiv în loc decizie tactică Co-CTO. Daniel parody recidivă subtle în fiecare slip ulterior.

**Source examples:**
- DECISION_LOG.md:436 chat-2 — Daniel parody 4-5 instances ("trebuie sa ma rog de tine sa dam drumul la cc?", "obosesti", "300 cuvinte mea culpa + 200 despre palmă")
- DECISION_LOG.md:450 chat-2 — Format fatigue Claude verbose violations memory rule #10 replaced
- DECISION_LOG.md:502 — push-back meta Daniel "*facem aia? ia zi sigur facem aia? vad 2 pathuri...*" parodie 5-6 răspunsuri pattern recidivă
- memory rule `feedback_format_fatigue.md` — 4+ LOCK consecutiv fără push-back = format fatigue NU convingere; switch instant lean mode

**Anti-recurrence rule:** mea culpa scribe rapid fără auto-flagelare verbose. Decizii tactice Co-CTO = decid singur, NU întreabă confirmation 2-options theater. Format fatigue → switch lean mode 1-2 propoziții decizie. 4+ LOCK consecutiv fără push-back substanțial = signal Daniel epuizat NU convingere.

**Verification mechanism:** post-slip response = 1-2 sentence acknowledgment + immediate action. Pattern "2x agreeable" applied invers Claude verbose → Daniel epuizat = anti-pattern documented.

**Cross-ref existing:** memory rule `feedback_format_fatigue.md` | DECISION_LOG.md chat-2 mea culpa scribe consolidat

---

### §AR.10 PowerShell-in-Bash Tool Slip (CC Bash = POSIX Strict)

**Trigger pattern:** Claude scribe prompt CC referencing PowerShell-specific syntax (`$null`, `$env:VAR`, backtick line continuation) într-un Bash tool script. CC bash tool = POSIX strict — interpreted ca shell error.

**Source examples:**
- DECISION_LOG.md:398 chat-2 morning — `PowerShell-in-bash empty-ts tag` slip flagged. Memory rule NEW.

**Anti-recurrence rule:** prompt CC Bash tool blocks = POSIX shell strict (sh/bash). PowerShell syntax NU permis. Use `/dev/null` not `$null`, `export VAR=` not `$env:VAR=`, `\` line continuation not backtick. CMD `Update Bash tool description Windows-PowerShell-aware` only when Bash tool NOT being used (system_prompt environment hint).

**Verification mechanism:** review prompt CC scripts pentru PowerShell-only syntax. If detected → rewrite POSIX-equivalent or use PowerShell-specific tool (rare).

**Cross-ref existing:** memory note PowerShell-in-bash slip flagged | environment system prompt Windows shell guidance

---

### §AR.11 4-Way Parity Check Sources Anti-Recurrence Proof

**Trigger pattern:** ADR/spec compile from multiple sources scattered cu drift risk silent. Single-source citation = vulnerable to stale assumption (§AR.2). Multi-source parity check = stronger anti-recurrence proof.

**Source examples:**
- DECISION_LOG.md §9.8 Deload Protocol compile — **4-way parity check ✅ ZERO substantive divergence** Sources: 148_HANDOVER + 013-auto-aggression-detection + ADR_COMPOSITE_SIGNAL_LAYER_v1 §36.41 + CURRENT_STATE §RECENT lines 715-737. Stronger than §9.7 2-way parity precedent.

**Anti-recurrence rule:** for compile/aggregation prompts CC, cite ≥3-4 cross-sources verbatim. Document parity check explicit în raport (sources reconciled + zero divergence OR list of differences resolved). Single-source compile = high stale assumption risk.

**Verification mechanism:** prompt CC compile section = "Sources (mandatory ≥3-4): file1 §X + file2 §Y + file3 §Z". CC raport documents parity check pass/fail.

**Cross-ref existing:** §AR.1 + §AR.2 | §HANDOVER_PROTOCOL §7 DIFF protocol

---

### §AR.12 Workflow Matured Pattern (file present_files real DOWNLOADABLE → silent verde → CTO pivot)

**Trigger pattern:** Daniel-approved workflow consistent: file present_files real DOWNLOADABLE in chat artefact + Daniel paste LATEST → Claude direct prompt CC NEXT P1 fără bate-la-cap + CC raport accept silent verde Status=Complete → CTO pivot direct + pre-flight grep filesystem mandatory + 4-way parity ≥3 sources + bandwidth proactive 1-line flag.

**Source examples:**
- DECISION_LOG.md:145 chat-8 workflow matured pattern continuation
- DECISION_LOG.md:182 chat-5 workflow matured AMENDED — preserve workflow + add post 3 verde reports `git fetch --all` periodic check

**Anti-recurrence rule:** preserve mature workflow pattern (file artefact + paste LATEST + silent verde + CTO pivot). EXTEND post 3 verde reports consecutive → recommend Daniel `git fetch --all` periodic trust-but-verify check drift local-vs-remote (per §AR.3).

**Verification mechanism:** Claude scribe convention: prompt CC = artefact (NU markdown chat) + cite source files verbatim + pre-flight grep + raport accept silent verde green-Status pattern + pivot CTO mode direct NEXT P1 fără 2-options theater.

**Cross-ref existing:** §AR.3 + §AR.8 + §AR.9 above | DECISION_LOG.md chat-8 workflow consolidat

---

### §AR.13 PK Growth Control Per Sesiune (Project Knowledge Capacity Hygiene)

**Status:** LOCKED V1 2026-05-07 (vault meta-tooling, anti-recurrence extension Run 5)
**Authority:** Daniel Co-CTO directive 2026-05-07 — hybrid threshold mandatory enforce. Cross-ref §CC.6 Append-Only Architecture + §CC.9 Mandatory File Updates Per Handover + VAULT_RULES §3.3 archive schema.

**Trigger pattern:** Project Knowledge capacity spike >25% per sesiune observed chats 2026-04-25→2026-05-06 — bandwidth saturation pre-Beta + handover overhead growth + §JUST_DECIDED accumulation pre-truncate + active vault file proliferation pre-archive.

**Source examples:**
- Chat 2eff4a33 (2026-05-06) — capacity 81% reach + Capacity A archive proposal originat
- Chat-uri 2026-04-30→2026-05-04 — HANDOVER_GLOBAL split necessity + LOC growth ~5000 LOC singular file
- Pattern repeated: ~25% PK delta per sesiune unchecked = saturation 4-5 sesiuni cycle

**Anti-recurrence rule (hybrid threshold mandatory):**

**Soft monitor target ≤10%:** PK delta proxy (active vault .md LOC, excluding _archive subtrees) per sesiune ≤ 10% baseline. Reported în LATEST.md "Issues / Ambiguities" sau dedicated §PK Growth Delta section. Transparent monitoring, NU forțează acțiune.

**Hard escalation trigger ≥20%:** PK delta ≥20% → MANDATORY force handover §CC.5 LANDED + chat NEW dedicat continuation. Stop trigger before commit dacă pre-emptive measurement disponibil. NU opțional — escalation gate.

**Mandatory mechanism per handover (cross-ref §CC.9):**
1. **Pre-execution baseline capture:** `find . -name "*.md" -not -path "*/_archive/*" -not -path "*/node_modules/*" -exec wc -l {} + | tail -1` → store `/tmp/pk-baseline.txt`
2. **Post-execution delta calculation:** same command, compute `delta_pct = (post - baseline) / baseline * 100`
3. **Soft check ≤10%:** report în LATEST.md (transparent, no action)
4. **Hard check ≥20%:** STOP commit, escalate Daniel raport partial cu rationale + recommend handover §CC.5 NOW + chat NEW continuation
5. **Auto-truncate §JUST_DECIDED >7 days la RECENT_DECIDED_ARCHIVE periodic** (existing §CC.6 reinforced — tracking discipline)
6. **Auto-archive _CONSUMED.md files post-handover** (existing §3.3 reinforced — schema enforce)

**Verification mechanism:** post-Run / post-handover LATEST.md MUST contain "PK Delta" line cu `pre/post/delta_pct/threshold_band` evidence verbatim. Absent line = §AR.13 violation, escalate.

**Cross-ref existing:** §CC.6 (Append-Only Architecture truncate threshold) + §CC.9 (5-step Mandatory File Updates Per Handover) + VAULT_RULES §3.3 (outbox archive schema) + PROMPT_CC_HYGIENE.md §10 (fast handover workflow).

**Failure mode:** delta_pct >20% + commit forced past trigger = §AR.13 violation. Daniel approval explicit override required (post-mortem rationale documented DECISION_LOG).

---

### §AR.PRE_FLIGHT_CHECKLIST_INVARIANT — Mandatory Before Any Vault/Code Execution CC

**Authority:** Consolidat din §AR.1-§AR.13. Mandatory invariant pre-flight checklist orice prompt CC execution autonomous.

1. ☐ Backup tag pre-execution + push origin (rollback safety)
2. ☐ Pre-flight grep filesystem verbatim — paths/files/tooling cited în spec (per §AR.1) NU presume
3. ☐ Source-of-truth verify HANDOVER_GLOBAL split → consumed archives NN_*_CONSUMED.md (per §AR.2)
4. ☐ Verify regex relaxation pe source convention drift (`§?` optional + `\b` boundary, per §AR.6)
5. ☐ Verify target state actual pre-REPLACE/ADD edit (per §AR.7) — surface MOOT vs execute mock-replace
6. ☐ Citation enforcement post-startup §CC.4 — every claim path:line OR §X
7. ☐ Variance check audit count: stop-trigger if ≥3 divergence + escalate Daniel (per §AR.5)
8. ☐ Methodology mismatch check — strict scope filter ≠ permissive count (per §AR.5)
9. ☐ Tests baseline preserved verify pre-commit (doc-only operations) per pre-commit hook
10. ☐ Distructive operations — backup tag mandatory + Daniel approval explicit per-execution (per §AR.4)
11. ☐ Ground truth git verify ÎNAINTE acuzare hallucination — `git fetch --all && git status` (per §AR.3)
12. ☐ Format lean — mea culpa rapid 1-2 sentences + immediate action (per §AR.9)
13. ☐ PK delta check post-execution: ≤10% soft (report LATEST.md) / ≥20% hard escalate force handover §CC.5 (per §AR.13)

**Failure mode any check:** STOP, escalate Daniel raport partial, NU forțezi past spec. Pattern Bugatti = peak craft anti-recurrence invariant nenegociabil.

---
