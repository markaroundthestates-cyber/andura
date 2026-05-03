# VAULT AUDIT INVENTORY — Phase 1 Read-Only

**Task:** VAULT_HYGIENE_PHASE_1_AUDIT_STRUCTURAL
**Date:** 2026-05-03
**Mode:** READ-ONLY (zero modifications outside `📤_outbox/`)
**Scope:** Audit structural complet vault SSOT pentru Faza 2 Daniel validare scurtă + Faza 3 execution.

---

## §1 — INVENTORY COMPLET

### Total

- **Total `.md` files vault (incl. archive):** **200**
- **Total `.md` files vault (excl. archive):** **62** (200 − 138 archive)
- **Total LOC vault:** **60,815**
- **Total LOC active (excl. archive):** ~21,500
- **Total LOC archive:** ~38,500 (~63% din total)

### Per folder breakdown

| Folder | Files | LOC | Notes |
|--------|-------|-----|-------|
| `00-index/` | 1 | 120 | INDEX_MASTER (stale, last update 2026-04-30 evening) |
| `01-vision/` | 6 | 3,767 | PROJECT_VISION + MOAT + DANIEL + PRODUCT_STRATEGY + PARAMETRIC + SUFLET_ANDURA |
| `02-audit/` | 1 | 293 | COACHING_TEXTBOOK_SYNTHESIS only |
| `03-decisions/` | 32 | 7,526 | 21 numbered ADR (001-021) + 1 NEW (023) + 9 named ADR drafts + DECISION_LOG |
| `04-architecture/` | 4 | 1,344 | COGNITIVE + MULTI_TENANT_AUTH + TOMBSTONE + DATA_REGISTRY |
| `05-findings-tracker/` | 3 | 764 | FINDINGS_MASTER + INSIGHTS_BACKLOG + AUDIT_30_9_BLOCKED |
| `06-sessions-log/` | 1 | 5,443 | HANDOVER_GLOBAL_2026-04-30_evening (mega-fișier §1-§36.92) |
| `07-meta/` | 1 | 70 | CLAUDE_CODE_RULES (just appended self-discipline rules acest sesiune) |
| `08-workflows/` | 5 | 1,168 | CHAT_MIGRATION + CLAUDE_CHAT_INFRA + FORWARD_COMPAT + HANDOVER_TEMPLATE + MODEL_UPGRADE_AUDIT |
| Root | 5 | 966 | DIFF_FLAGS + PROMPT_CC_HYGIENE + PROMPT_CC_INGEST_HANDOVER + README + VAULT_RULES |
| `📥_inbox/` | 0 | 0 | empty (.gitkeep only) |
| `📤_outbox/` top-level | 3 | (current) | LATEST.md + ALIGNMENT_QUESTIONS_CHAT_NEW.md + SPRINT_4X_FINAL_REPORT.md |
| `📤_outbox/_archive/2026-04/` | 28 | ~13,000 | April archive |
| `📤_outbox/_archive/2026-05/` | 107 | ~26,000 | May archive (post audit total ingest = 110+ entries) |

### Top 15 largest files (.md)

| Rank | LOC | Path | Notes |
|------|-----|------|-------|
| 1 | 9,995 | `📤_outbox/_archive/2026-04/06_AUDIT_5000Q.md` | Historical AUDIT 5000Q corpus, archived |
| 2 | 5,443 | `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` | **MEGA-FIȘIER ACTIV — split candidate** |
| 3 | 2,266 | `01-vision/SUFLET_ANDURA.md` | Filozofie 12k cuvinte ingested |
| 4 | 2,127 | `📤_outbox/_archive/2026-05/55_PROCESUL_DE_GANDIRE_CONSUMED_2026-05-02.md` | Source document SUFLET_ANDURA, archived |
| 5 | 1,011 | `03-decisions/017-demographic-prior-database.md` | Most-detailed ADR |
| 6 | 869 | `03-decisions/014-onboarding-profile-typing.md` | |
| 7 | 817 | `📤_outbox/_archive/2026-05/106_AUDIT_IDEATION_REPORT_CONSUMED.md` | Ingested today |
| 8 | 779 | `03-decisions/016-vitality-layer.md` | |
| 9 | 631 | `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` | |
| 10 | 575 | `03-decisions/DECISION_LOG.md` | UTF-8 encoding broken (`â€™`, `Ã¢` etc.) |
| 11 | 568 | `📤_outbox/_archive/2026-05/61_HANDOVER_INPUT_CONSUMED_2026-05-02_chat_C_self_correction_extension.md` | |
| 12 | 557 | `03-decisions/018-engine-extensibility-architecture.md` | |
| 13 | 542 | `📤_outbox/_archive/2026-05/43_HANDOVER_INPUT_CONSUMED_2026-05-01_EVENING_RESUBMIT.md` | |
| 14 | 535 | `📤_outbox/_archive/2026-05/HANDOVER_INPUT_2026-05-02.md` | **UNNUMBERED archive entry — vault hygiene anomaly** |
| 15 | 535 | `📤_outbox/_archive/2026-05/37_HANDOVER_INPUT_CONSUMED_2026-05-02.md` | |

### Folder tree (active, excl. node_modules / dist / coverage / test-results / .git / archive)

```
salafull/
├── 00-index/             1 file
├── 01-vision/            6 files
├── 02-audit/             1 file
├── 03-decisions/        32 files (21 numbered 001-021 + 023 + 9 ADR drafts + DECISION_LOG)
├── 04-architecture/      4 files
├── 05-findings-tracker/  3 files
├── 06-sessions-log/      1 file (HANDOVER_GLOBAL — mega)
├── 07-meta/              1 file
├── 08-workflows/         5 files
├── 📥_inbox/             0 files
├── 📤_outbox/
│   ├── LATEST.md (active)
│   ├── ALIGNMENT_QUESTIONS_CHAT_NEW.md (active)
│   ├── SPRINT_4X_FINAL_REPORT.md (anomaly — should be in archive)
│   └── _archive/
│       ├── 2026-04/      28 files
│       └── 2026-05/     107 files
├── DIFF_FLAGS.md         (root, NEW 2026-05-03)
├── PROMPT_CC_HYGIENE.md  (root)
├── PROMPT_CC_INGEST_HANDOVER.md (root)
├── README.md             (root)
└── VAULT_RULES.md        (root)
```

**ANOMALIES:**
- `📤_outbox/SPRINT_4X_FINAL_REPORT.md` exists at outbox top-level (NOT in archive) — should be archived per VAULT_RULES §3.3 (only LATEST.md visible).
- `📤_outbox/_archive/2026-05/HANDOVER_INPUT_2026-05-02.md` — unnumbered (lacks NN prefix), violates §3.3 cronologic continuu rule.
- `DIFF_FLAGS.md` at root (created acest sesiune) — could move to `05-findings-tracker/` (prompt referenced it there).

---

## §2 — ORPHANS

### MISSING (referenced but absent fizic)

| # | Wikilink target | Sursa(s) referencing | Status | Impact | Recomandare |
|---|-----------------|----------------------|--------|--------|-------------|
| 1 | `[[ASYNC_EXECUTION_PROTOCOL]]` | DECISION_LOG line 365 | MISSING | LOW | DELETE wikilink (workflow obsolete post-cleanup 2026-04-30) |
| 2 | `[[AUTONOMOUS_RUN_2026-04-26]]` | DECISION_LOG | MISSING | LOW | DELETE wikilink (sesiune raport, content în git history) |
| 3 | `[[CTX_ALLLOGS_AUDIT_1_5]]` | DECISION_LOG | MISSING | LOW | DELETE (audit closed) |
| 4 | `[[ENGINE_ARCHITECTURE]]` | ADR 003 | MISSING | MEDIUM | Replace cu cross-ref `[[COGNITIVE_ARCHITECTURE_SPEC_v1]]` |
| 5 | `[[EXEC_QUEUE]]` | ADR 011 (×4 mențiuni) + ADR 013 (×3) + ADR 014 (×1) | MISSING | MEDIUM | Concept obsolete post-cleanup. UPDATE refs to use `📤_outbox/` flow |
| 6 | `[[EXEC_RESULTS]]` | ADR 011 | MISSING | LOW | Same — replace cu git history reference |
| 7 | `[[FAZA_1_FINAL_REPORT]]` | DECISION_LOG + ADR 008 | MISSING | LOW | DELETE wikilink (FAZA 1 closed, history în git) |
| 8 | `[[FAZA_2_FINAL_REPORT]]` | DECISION_LOG | MISSING | LOW | DELETE |
| 9 | `[[FAZA_2_ROADMAP]]` | DECISION_LOG | MISSING | LOW | DELETE |
| 10 | `[[FAZA_3_ROADMAP]]` | DECISION_LOG | MISSING | LOW | DELETE |
| 11 | `[[FIREBASE_AUDIT_1_8]]` | ADR 001 + ADR 007 + DECISION_LOG | MISSING | LOW | DELETE wikilinks (audit closed, content absorbed în ADRs) |
| 12 | `[[GETBF_DEAD_CODE_FINDING_2026-04-27]]` | DECISION_LOG | MISSING | LOW | DELETE |
| 13 | `[[HANDOVER]]` | various | MISSING (ambiguous) | MEDIUM | REPLACE cu `[[HANDOVER_GLOBAL_2026-04-30_evening]]` |
| 14 | `[[HARDCODED_AUDIT_1_2]]` | DECISION_LOG | MISSING | LOW | DELETE |
| 15 | `[[LOG_SCHEMA_AUDIT_1_3]]` | DECISION_LOG | MISSING | LOW | DELETE |
| 16 | `[[OBSIDIAN_SETUP_GUIDE]]` | various | MISSING | LOW | DELETE (Obsidian dropped per HANDOVER §7.6) |
| 17 | `[[OPUS_NUCLEAR_AUDIT_25APR]]` | DECISION_LOG | MISSING | MEDIUM | DELETE wikilink (audit closed, content absorbed) |
| 18 | `[[QA_MANUAL_24APR_2230]]` | various | MISSING | LOW | DELETE (QA closed) |
| 19 | `[[QA_MANUAL_25APR_POSTFIX]]` | FINDINGS_MASTER + others | MISSING | LOW | DELETE |
| 20 | `[[VAULT_CONSOLIDATION_GUIDE]]` | various | MISSING | LOW | DELETE |
| 21 | `[[VAULT_SYNC_DIAGNOSTIC]]` | various | MISSING | LOW | DELETE |
| 22 | **ADR 022** (file `022-*.md`) | PRODUCT_STRATEGY_SPEC §3.5.1 + DECISION_LOG + HANDOVER §29.7 + §28.6 + §29 + ADR_MULTI_TENANT_AUTH (manual-022-*.json fixture name only) + MULTI_TENANT_AUTH_MIGRATION_SPEC §334 | **MISSING** | **HIGH** | **CREATE** ADR 022 stub. Naming collision: 2 scopes propuse (Bayesian Nutrition + Goal-Driven Templates) → split în ADR 022 + ADR 024. Cross-ref ORPHAN-1 finding. |

### UNREFERENCED (present but no file refers to them)

| # | File | Status | Impact | Recomandare |
|---|------|--------|--------|-------------|
| 1 | `📤_outbox/SPRINT_4X_FINAL_REPORT.md` | UNREFERENCED at outbox top-level (487 LOC) | MEDIUM | MOVE to `📤_outbox/_archive/2026-05/` cu numerotare cronologică (e.g., 0_SPRINT_4X_FINAL_REPORT.md before 28+) |
| 2 | `📤_outbox/_archive/2026-05/HANDOVER_INPUT_2026-05-02.md` | UNREFERENCED unnumbered archive | LOW | RENAME cu NN prefix (e.g., 36.5_*) sau DELETE if duplicate cu 37_HANDOVER_INPUT_CONSUMED_2026-05-02.md |
| 3 | `02-audit/COACHING_TEXTBOOK_SYNTHESIS.md` | Referenced INDEX_MASTER + INSIGHTS_BACKLOG indirect | LOW | OK (legitim research reference) |

**Total orphans: 22 MISSING + 3 UNREFERENCED = 25 items.**

---

## §3 — FRAGMENTĂRI SSOT

### TOPIC 1: Goal Taxonomy

**SURSE (5 SSOT inconsistente):**
- `01-vision/PARAMETRIC_PROGRAMS_DESIGN.md` — referenced ca containing parametric definition, NOT verified verbatim acest audit (file present, content scope deferred)
- `04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md` Q15 — onboarding 5 câmpuri EN cu Goal 3 valori
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §29.5.14 — 4 ecrane RO, Goal generic placeholder
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.44 — 4 câmpuri RO, ZERO Goal field
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §26.3 — 5 RO categorii (forta_dezvoltare/tonifiere_definire/slabire/longevitate/sanatate_generala) cu sub-routing 8 templates
- `03-decisions/017-demographic-prior-database.md` — 6 valori EN goal taxonomy

**INCONSISTENȚE:**
- Numeric: 3 vs 4 vs 5 vs 6 valori
- Limbă: EN (Cognitive + ADR 017) vs RO (HANDOVER §29.5.14 + §36.44 + §26.3)
- Wording: `forta_dezvoltare` vs `strength_development` vs generic placeholder
- Sub-routing: 8 templates V1 (HANDOVER §26.3) vs none (Cognitive + ADR 017)

**RECOMANDARE CONSOLIDARE:**
- Single SSOT `01-vision/ONBOARDING_SSOT_V1.md` NEW (TRIPLE-1 + QUADRUPLE-1 finding §36.92)
- Decision recommend per HANDOVER §36.92 D4: **Hybrid C** (RO onboarding 5 categorii + EN engine internal map cu 6 valori cross-ref)
- 5 surse existente marcate `[CONSOLIDATED into ONBOARDING_SSOT_V1]` cross-ref doar

**EFFORT:** ~3h Daniel chat strategic + ~1h CC consolidate doc.

---

### TOPIC 2: Onboarding Fields/Screens

**SURSE (5 SSOT inconsistente, overlap cu Goal Taxonomy):**
- `04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md` Q15 — 5 câmpuri EN
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §29.5.14 — 4 ecrane RO post-amendment 2026-05-02 (5→4 disclaimer integrat)
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.44 — T0 Hard Minimum 4 câmpuri RO (Sex/Vârstă/Înălțime/Greutate)
- `03-decisions/014-onboarding-profile-typing.md` — Q1-Q5 sequence different format
- `03-decisions/017-demographic-prior-database.md` — 11 dimensiuni profile schema

**INCONSISTENȚE:**
- Câmpuri count: 4 vs 5 vs 11
- Skip semantics: §29.5.14 "skip permis ecran 3" vs §36.44 "T0 Hard Minimum mandatory"
- Resume path: ZERO spec (NEW-8 finding audit ideation)

**RECOMANDARE:** Same `01-vision/ONBOARDING_SSOT_V1.md` consolidate exhaustiv cu Goal Taxonomy + ordine ecrane + skip semantics + resume path.

**EFFORT:** Combined cu Topic 1.

---

### TOPIC 3: Pricing Chain

**SURSE (4 SSOT cu drift cronologic):**
- `00-index/INDEX_MASTER.md` linia 38 — "**Pricing locked €60 lifetime / €65/an**" — **STALE 2026-04-30 evening**
- `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` §1.3 — referenced (verify pending)
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §3 — "Q-0507 UPDATED €100→€65" — DEPRECATED 2026-05-02 Chat D
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.50-§36.52 — Founding €39/an + Standard €59/an + Elite €79/an V1.1 + cap 50 + 34% perpetual — **CURRENT LOCKED**

**INCONSISTENȚE:**
- INDEX_MASTER zice €60/€65 vs HANDOVER §36.50 €39/€59/€79 V1.1 — **drift CRITIC** (entry point doc misleading)
- §3 zice DEPRECATED vs §36.50 CURRENT — needs explicit DEPRECATED marker în §3

**RECOMANDARE:** Single SSOT `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` §Pricing (reference §36.50 LOCKED) + INDEX_MASTER refresh + HANDOVER §3 explicit DEPRECATED marker.

**EFFORT:** ~30min CC mecanic.

---

### TOPIC 4: Mode Detection

**SURSE (3 SSOT cu axe confuze):**
- `03-decisions/ADR_MODE_DETECTION_UI_v1.md` — 5 moduri DETECTED behavioral cu hierarchy (Executor/Curios+Strategic/Frustrat Tehnic/Frustrat Viață/Validation-Seeking) + EXT-1 → EXT-7 amendments
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.45 — T2 cold-start 2 opțiuni binary (Executor/Strategic) la onboarding
- `src/engine/suflet-andura/modes-ui.js` — cod 4 moduri DECLARED (STRATEGIC/EXECUTOR/HYBRID/AUTO) per AUDIT_VERIFICATION §2

**INCONSISTENȚE (per AUDIT_VERIFICATION §2 finding B1 demoted):**
- 2 axe diferite confuse: declared modes (user-selected) vs behavioral overlays (engine-detected)
- Audit consolidat a tratat ca CRITICAL — în realitate MEDIUM doc hygiene
- ADR ar trebui clarificare: "4 declared + 5 behavioral overlays = 9 axes total"

**RECOMANDARE:** ADR_MODE_DETECTION_UI EXT amendment "Declared vs Behavioral Mode Taxonomy Clarification" (~30min).

**EFFORT:** ~30min CC.

---

### TOPIC 5: RPE/RIR

**SURSE (3 SSOT contradictorii):**
- `03-decisions/003-double-progression-engine.md` §Decision — "**Hit all reps with RIR ≤ 2 → INCREASE**" + 5-stage numeric
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.16 — RIR Matrix Adaptiv Profile-Aware (verbal Marius RIR 0 / Maria RPE verbal Ușor/Potrivit/Foarte greu)
- `src/pages/coach/logging.js` — `selectRPE(rpe)` cu `labelMap = { 6.5: 'easy', 8: 'ok', 9: 'hard', 10: 'very-hard' }` numeric per AUDIT_VERIFICATION §1 finding B4 CRITICAL

**INCONSISTENȚE:**
- ADR 003 RIR ≤ 2 numeric INCREASE vs §36.16 verbal Profile-Aware
- §36.16 verbal Ușor/Potrivit/Foarte greu vs cod numeric labelMap
- SUFLET §2 explicit "ELIMINAT logging precis" (RPE numeric eliminat)

**RECOMANDARE:**
- B4 RPE Verbal UI fix CRITICAL pre-Beta (1-2h) — replace numeric cu 3 verbal — per FINDINGS_MASTER §Bucket 1
- ADR 003 §AMENDMENT 2026-05-03 — supersedes RIR ≤ 2 numeric, defer to §36.16 RIR Matrix Adaptiv Profile-Aware (CONTRADICTION-1 finding)
- Cross-ref ADR 003 → §36.16 + ADR_RIR_MATRIX_ADAPTIVE_v1

**EFFORT:** ~30-45min ADR amendment + ~1-2h cod fix B4.

---

### TOPIC 6: Tier System (engine_tier vs calibration_confidence)

**SURSE (potential drift, verificare needed):**
- `03-decisions/009-calibration-tiers.md` §AMENDMENT 2026-04-30 — Two axes orthogonal (`engine_tier` T0/T1/T2 + `calibration_confidence` 5 levels)
- `04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md` referenced
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §28 + §34.3 — D1 DEVELOPING tier add (5→6 tiers refactor)

**INCONSISTENȚE:**
- 5 vs 6 tier nivele (post D1 refactor decision)
- Implementation status: pending Sprint 4.x Blocker 3 (D1 DEVELOPING refactor 5→6 tiers)

**RECOMANDARE:** Verify cu cod migration runner `src/migrations/__tests__/2026-05-02-tier-5-to-6.test.js` (existent) — confirm 6 tiers active vs 5 spec ADR 009. ADR 009 §AMENDMENT update needed dacă 6 tiers shipped.

**EFFORT:** ~15min verify + ~30min ADR amendment dacă needed.

---

## §4 — ADR DRIFT DETECTION

### Numbered ADRs 001-021 + 023 (22 total active)

| # | ADR | Status INDEX | Effective Status | Drift Notes |
|---|-----|--------------|-----------------|-------------|
| 001 | local-first-storage | Accepted | Accepted with NO §AMENDMENT | **DRIFT-1:** Conținut LWW preserved verbatim. Body says "Last-write-wins with local priority" (§Negative consequences). LWW DEPRECATED în ADR 011 §AMENDMENT 2026-04-30 + ADR 021. ADR 001 NU updated. Recomandare: §AMENDMENT 2026-04-30 cross-ref to ADR 011 + ADR 021 (clarify ADR 001 = local-first storage principle, NU sync semantics). |
| 002 | firebase-rest-not-sdk | Accepted | Accepted | OK |
| 003 | double-progression-engine | Accepted | Accepted with **CONTRADICTION-1** | RIR ≤ 2 numeric INCREASE vs §36.16 RIR Matrix Adaptiv Profile-Aware. Needs §AMENDMENT (vezi §3 Topic 5) |
| 004 | rule-engine-numeric-priorities | Accepted | Accepted | OK |
| 005 | vanilla-js-no-framework | Accepted | Accepted | OK (referenced în §36.77 anti-recurrence rule) |
| 006 | tier-storage-for-logs | Accepted | Accepted, superseded de ADR 020? | Verify if ADR 020 supersedes ADR 006. Cross-ref unclear. |
| 007 | firebase-open-rules | Accepted (deferred) | **AMENDED 2026-05-02** (database.rules.json LOCKED schema landed) | Properly amended inline. References [[FIREBASE_AUDIT_1_8]] orphan. |
| 008 | vitest-playwright-testing | Accepted | Accepted with **DH2-NEW drift** | "GitHub Pages deployment" stale post-rebrand andura.app. Needs §AMENDMENT cross-ref §36.78. References [[FAZA_1_FINAL_REPORT]] orphan. |
| 009 | calibration-tiers | Accepted (amended 2026-04-30) | **AMENDED inline** | OK (5 vs 6 tier check pending — vezi §3 Topic 6) |
| 010 | no-anthropic-trademark-public | Accepted | Accepted | OK |
| 011 | coach-decision-log-architecture | Accepted (amended 2026-04-30) | **AMENDED inline** | OK. References [[EXEC_QUEUE]] orphan (×4). |
| 012 | tier-decay-on-inactivity | Accepted | Accepted | OK |
| 013 | auto-aggression-detection | Accepted (impl COMPLETĂ post TASK #7) | Accepted with §AMENDMENT 2026-04-30 evening | OK. References [[EXEC_QUEUE]] orphan (×3). |
| 014 | onboarding-profile-typing | Accepted (wording update 2026-04-27) | Accepted | References [[EXEC_QUEUE]] orphan (×1). |
| 015 | getbf-calibration-only | Accepted | Accepted | OK |
| 016 | vitality-layer | Accepted (depends ADR 018) | Accepted | OK |
| 017 | demographic-prior-database | Accepted (depends ADR 018) | Accepted | OK. **DEMO-1 finding pending** verify scaffold sufficient pentru 500 profiles synthetic generation. |
| 018 | engine-extensibility-architecture | Accepted (foundation NEXT) | Accepted | OK |
| 019 | gdpr-k-anonymity-validation | Accepted (k=5) | Accepted | OK + §36.59 channel-agnostic sweep applied |
| 020 | storage-tiering-strategy | Accepted | Accepted with **I6 finding FALSE POSITIVE** | Implementation Phase 1 ACTIVE per AUDIT_VERIFICATION §3. Properly LOCKED. |
| 021 | calibration-drift-reconciliation | Accepted | Accepted (algorithm LIVE, no consumers — DEAD-1 pending B2) | **DEAD-1 finding:** ZERO consumers production până T&B Faza 1+2 done. |
| 023 | llm-intent-interpretation | LOCKED V1 — partial spec | **PARTIAL SPEC** | ⚠️ NEW 2026-05-03 ingest. Full sub-sections A-M PENDING addendum source upload (DIFF_FLAGS P1-FLAG-1). NOT in INDEX_MASTER yet (drift). |
| **022** | **MISSING** | **N/A** | **ORPHAN** | **ORPHAN-1 finding HIGH:** referenced 9+ places (PRODUCT_STRATEGY §3.5.1 + DECISION_LOG + HANDOVER §29.7 + §28.6 + §29 + multiple), naming collision (Bayesian Nutrition vs Goal-Driven Templates). Recomandare: SPLIT în ADR 022 + ADR 024. |

### Named ADR drafts (9 total în 03-decisions/)

Per HANDOVER §36.62: "8 ADR drafts ALL LOCKED V1 active (RIR_MATRIX + MODE_DETECTION_UI + BIAS_DETECTION_OBSERVABLE + OUTLIER_FILTER + CASCADE_DEFENSE + COMPOSITE_SIGNAL_LAYER + PAIN_DISCOMFORT_BUTTON cu EXT-1 + SMART_ROUTING_EQUIPMENT)" + ADR_MULTI_TENANT_AUTH = 9.

| # | ADR | INDEX_MASTER status | Effective status |
|---|-----|---------------------|-----------------|
| ND-1 | ADR_BIAS_DETECTION_OBSERVABLE_v1.md | NOT LISTED | LOCKED V1 per §36.62 |
| ND-2 | ADR_CASCADE_DEFENSE_v1.md | NOT LISTED | LOCKED V1 per §36.62 |
| ND-3 | ADR_COMPOSITE_SIGNAL_LAYER_v1.md | NOT LISTED | LOCKED V1 per §36.62 |
| ND-4 | ADR_MODE_DETECTION_UI_v1.md | NOT LISTED | LOCKED V1 cu EXT-1 → EXT-7 amendments |
| ND-5 | ADR_MULTI_TENANT_AUTH_v1.md | LISTED ("New Accepted") | Accepted with §AMENDMENT 2026-05-02 (Faza 1 Batch B landed, Faza 2 NOT wired = §36.80 BUG 2) |
| ND-6 | ADR_OUTLIER_FILTER_v1.md | NOT LISTED | LOCKED V1 cu EXT-1 → EXT-4 (EXT-4 NEW 2026-05-03 §36.81.4) |
| ND-7 | ADR_PAIN_DISCOMFORT_BUTTON_v1.md | NOT LISTED | LOCKED V1 cu EXT-1 + EXT-2 PENDING §36.85 |
| ND-8 | ADR_RIR_MATRIX_ADAPTIVE_v1.md | NOT LISTED | LOCKED V1 per §36.62 |
| ND-9 | ADR_SMART_ROUTING_EQUIPMENT_v1.md | NOT LISTED | LOCKED V1 per §36.62 |

**INDEX_MASTER drift summary:**
- INDEX says "22 ADR-uri active (001-021 + ADR_MULTI_TENANT_AUTH)" → **ACTUAL = 31** (21 numbered + ADR 023 + 9 named drafts).
- INDEX **MISSING** ADR 023 (created today).
- INDEX **MISSING** all 8 named ADR drafts other than ADR_MULTI_TENANT_AUTH.

### Cross-refs reciproce (sample check)

- ADR 001 ↔ ADR 011 LWW deprecation: **NOT bilateral** — ADR 011 references ADR 001, ADR 001 NU references ADR 011 amendment.
- ADR 003 ↔ §36.16 RIR Matrix: **NOT bilateral** — §36.16 doesn't reference ADR 003.
- ADR 008 ↔ ADR 005: bilateral OK.
- ADR 023 → ADR 011 CDL extension (`llm_metadata`): **NOT bilateral** — ADR 011 NU references ADR 023.

---

## §5 — HANDOVER_GLOBAL SPLIT STRATEGY

### Stats

- **LOC:** 5,443
- **Top-level §:** 33 sections (§0 through §36 cu §29.6 + §29.7 + §36.x sub-sections)
- **§36 sub-sections:** 33 unique entries (§36.1 — §36.92, but only ~70+ used due to renumbering)
- **Sesiune-lock paragraphs:** ~12 mega-paragraph entries la final (cronologic 2026-05-02 PRE-LAUNCH FINAL → 2026-05-03 AUDIT TOTAL CONSOLIDAT)

### Topic clusters identificați

| Cluster | Sections | Topic | LOC est |
|---------|----------|-------|---------|
| A. Setup + Vision | §0-§13 | Status + Vision + Strategic positioning + Pricing + Sprint 1+2+3 + D1-D15 + Scope + Vault + Memory + Principle + Differentiation + Chalkboard + Feedback | ~600 |
| B. Workflow + Tests + Governance | §13-§18 | Workflow + Next steps + Tests/git + ADR 020 Phase 1 + Governance + Inbox strict | ~300 |
| C. Sprint 4 + i18n + Wording Phase A | §19-§25 | Sprint 4 A+B + i18n + Wording categorical + F-NEW 2026-05-01 + Engine wording 12 variații + Phase A toasts + Wording remaining | ~700 |
| D. Goal Templates + Wording Phase B | §26-§28 | Goal-ca-Setting + 8 Templates + Wording rewrite Phase B + Amendamente backlog | ~700 |
| E. Safety + Pre-Launch + UX V1 | §29 (multiple sub) | Safety Nutrition + 4 Templates Full Spec + Distribution + Pre-Launch + UX Colateral 16 sub | ~900 |
| F. Rebrand + Investiții + MMI + Storage UX + Blockers + GC | §30-§35 | Rebrand SalaFull→Andura + Investiții + MMI + Storage Full UX + 3 Blockers + Tombstones GC defer | ~500 |
| G. §36 Decizii LOCKED 2026-05-02 → 2026-05-03 | §36.1-§36.92 | Cluster post-launch features (Suflet Andura + Self-Correction + Chat C + Pricing + Telegram + Phase B locked + cluster 10-batch + Sprint UI + Rebrand sweep + Auth flow BUG 2 + Coach Intelligence + Pre-Session Energy + META-RULE Prebeta + Jeff Nippard backlog + Body Region Map pending + Audit consolidat ADR 023 etc.) | ~1700 |
| H. Sesiuni-lock paragraphs | (final) | 12 mega-paragraph cronologic | ~700 |

### Split options

**Option A: Cronologic per quarter (HANDOVER_2026_Q1.md + HANDOVER_2026_Q2.md)**
- Pros: Time-based natural división, audit trail preserved
- Cons: Topics span quarters (e.g., §29 spans April-May), cross-references broken

**Option B: Topic-based (per cluster A-H)**
- Pros: Cohesive topic per file, easy to navigate per concern
- Cons: Sesiune-lock paragraphs assume cronologic flow, requires manual re-categorization

**Option C: Active vs Archive (HANDOVER_ACTIVE.md ultimele 30 zile + HANDOVER_ARCHIVE_<YYYY-MM>.md istoric)** ⭐ **RECOMMENDED**
- Pros: Zero info loss; `HANDOVER_ACTIVE.md` ~1500 LOC navigable, `HANDOVER_ARCHIVE_2026-04.md` + `HANDOVER_ARCHIVE_2026-05.md` audit trail
- Pros: Preserves ingest workflow per VAULT_RULES §3.2 (current SSOT update-in-place)
- Pros: Easy automation maintenance (rolling window)
- Cons: 30-day cutoff arbitrary, requires migration script

**Recomandare CC autonomous:** **Option C** rolling window 30 days. SSOT activ = `HANDOVER_ACTIVE.md` (~1500 LOC); cronologic archive `HANDOVER_ARCHIVE_2026-04.md` + `HANDOVER_ARCHIVE_2026-05.md` = audit trail intact. Wikilinks în vault preserve breaking-NU prin redirect note în top of HANDOVER_ACTIVE: "Older sections moved to `HANDOVER_ARCHIVE_<YYYY-MM>.md`".

**Effort split (Option C):** ~3-4h CC mecanic.
- ~1h analyze 33 sections + 33 §36 sub-sections + 12 sesiune-locks
- ~1h split şi cronologic separation
- ~1h cross-ref preservation + wikilink updates în vault (toate refs `[[HANDOVER_GLOBAL_2026-04-30_evening]]` → `[[HANDOVER_ACTIVE]]`)
- ~30min validation + commit

---

## §6 — ARCHIVE BLOAT

### Stats

- **Total archive files:** 138 (28 in 2026-04 + 107 in 2026-05 + 3 unnumbered/anomalies)
- **Total archive LOC:** ~38,500 (~63% of vault total LOC)
- **Largest single archive file:** 9,995 LOC (`06_AUDIT_5000Q.md`)
- **Average archive entry:** ~280 LOC

### Categories breakdown

| Category | Count | LOC est |
|----------|-------|---------|
| Audit raw passes (5000Q + AUDIT pass-uri 1-9 + verification + ideation) | 12-15 | ~12,000 |
| Handover inputs consumed | 25-30 | ~10,000 |
| Sprint reports + execution reports | 8-10 | ~3,000 |
| LATEST.md previous (rotated) | 30+ | ~6,000 |
| ALIGNMENT_QUESTIONS historical | 10+ | ~2,000 |
| BATCH reports + cluster reports | 15+ | ~3,000 |
| DIFF_FLAGS historical + PROCESUL_DE_GANDIRE | 5+ | ~3,000 |

### Audit pass 1-9 raw (referenced în HANDOVER §36.92 ca surse ~3000+ linii)

**Status:** Audit pass-uri 1-9 raw (`AUDIT_VAULT_CONSOLIDAT_PASS_1-9_2026-05-03.md` referenced) — **NU în vault** (probabil nu fost ingerate ca document standalone). Source files removed în vault cleanup 2026-04-30 per INDEX_MASTER. Referenced doar prin §36.92 reclassification post-summary.

**Recomandare:**
- ✅ **PĂSTREAZĂ archive existing intact** — preserve audit trail Bugatti standard
- ❌ NU consolidate (info loss risk + minimal storage win)
- ❌ NU delete (zero info loss principle per VAULT_RULES §5)

### LATEST.md istoric flow check

Verified cronologic continuu post my own ingest acest sesiune:
- 100 (alignment historical pre-rebrand) → 101-103 (prebeta scope expansion) → 104-108 (audit total) → 109 (audit total LATEST current) → 110 (this audit inventory).

Numerotare cronologică continuă **OK**. Per VAULT_RULES §3.3 compliance.

### Anomalies în archive

1. **`📤_outbox/_archive/2026-05/HANDOVER_INPUT_2026-05-02.md` — UNNUMBERED** (lacks NN prefix). Per VAULT_RULES §3.3 needs cronologic NN. Rename to `36.5_*` (between 36 and 37) sau verify if duplicate of `37_HANDOVER_INPUT_CONSUMED_2026-05-02.md`.
2. **`📤_outbox/SPRINT_4X_FINAL_REPORT.md`** at outbox top-level (487 LOC). Should be archived. Per VAULT_RULES §3.3 only `LATEST.md` visible top-level.

### Recomandare archive policy

**Preservation absolute:** zero deletes per VAULT_RULES §5. Archive existing = 1:1 audit trail intact.
**Cleanup minor:** rename anomaly `HANDOVER_INPUT_2026-05-02.md` cu NN prefix + move `SPRINT_4X_FINAL_REPORT.md` to archive (e.g., `0_SPRINT_4X_FINAL_REPORT_HISTORICAL.md` between 2026-04 and 2026-05 monthly boundaries — sau ca prefix `00_*` în 2026-05).

---

## §7 — RECOMANDĂRI STRUCTURĂ FINALĂ (pentru Faza 2 Daniel validare scurtă)

```
RECOMANDARE A — HANDOVER_GLOBAL split: Option C (Active 30 zile + Archive cronologic per lună)
  Rationale: navigable ~1500 LOC active vs 5443 mega; preserves ingest workflow VAULT_RULES §3.2
  Effort: ~3-4h CC

RECOMANDARE B — SSOT consolidation per topic (5 topics):
  - Goal Taxonomy + Onboarding → 01-vision/ONBOARDING_SSOT_V1.md NEW (~3h Daniel + 1h CC)
  - Pricing chain → INDEX_MASTER refresh + §3 DEPRECATED marker + PRODUCT_STRATEGY single source (~30min CC)
  - Mode Detection → ADR_MODE_DETECTION_UI EXT amendment "declared vs behavioral taxonomy" (~30min CC)
  - RPE/RIR → ADR 003 §AMENDMENT cross-ref §36.16 + ADR_RIR_MATRIX_ADAPTIVE (~30min CC) + B4 RPE Verbal UI fix CRITICAL pre-Beta (~1-2h CC, separate)
  - Tier 5/6 verify → ADR 009 §AMENDMENT post Sprint 4.x Blocker 3 D1 DEVELOPING refactor (~30min CC, when shipped)

RECOMANDARE C — INDEX_MASTER refresh complete:
  - Update stats (51 → 62+ files; pricing €60/€65 → €39/€59/€79)
  - Add ADR 023 + 8 named ADR drafts to ADR-URI ACTIVE table
  - Refresh "Last updated" 2026-04-30 evening → 2026-05-03
  - Add cross-refs to DIFF_FLAGS.md + new ONBOARDING_SSOT_V1.md
  Effort: ~1h CC mecanic

RECOMANDARE D — Archive policy: PRESERVE existing intact; minor cleanup
  - Rename anomaly HANDOVER_INPUT_2026-05-02.md cu NN prefix
  - Move SPRINT_4X_FINAL_REPORT.md to archive
  Effort: ~15min CC

RECOMANDARE E — Folder restructuring: NO (current 0-08 + outbox/inbox solid)
  Exception: move DIFF_FLAGS.md root → 05-findings-tracker/ (alignment cu prompt expectation)
  Effort: ~5min CC

ADIȚIONAL — Orphan wikilinks cleanup (21 references):
  - DELETE 19 references to closed FAZA/AUDIT files (audit trail în git)
  - REPLACE [[HANDOVER]] → [[HANDOVER_ACTIVE]] (post Recomandare A)
  - REPLACE [[ENGINE_ARCHITECTURE]] → [[COGNITIVE_ARCHITECTURE_SPEC_v1]]
  - REPLACE [[EXEC_QUEUE]]/[[EXEC_RESULTS]] → "📤_outbox/ workflow" prose
  Effort: ~1h CC mecanic

ADIȚIONAL — ADR 022 ORPHAN-1 fix:
  - CREATE ADR 022 stub (Goal-Driven Program Templates) + ADR 024 stub (Bayesian Nutrition)
  - Cross-ref split decisions per HANDOVER §36.92 ORPHAN-1
  Effort: ~1-2h CC (per audit total finding §2 D2 cleanup batch)

ADIȚIONAL — DECISION_LOG UTF-8 encoding fix:
  - File contains broken chars (â€™, Ã¢, Â§) — re-save UTF-8 + rewrite headers
  Effort: ~30min CC mecanic
```

Daniel valid scurt (da/nu/altfel) pe fiecare recomandare. NU citește detalii.

---

## §8 — MAINTENANCE PROTOCOL — VAULT_HYGIENE_PASS Spec

**Codification proposed pentru extensia comenzii standard "Ingest handover from inbox":**

```
After standard ingest steps 1-9 (per VAULT_RULES §HANDOVER_PROTOCOL),
extended VAULT_HYGIENE_PASS auto-execute:

STEP 10 — Detect new SSOT fragmentation
  - Grep new sections introduced acest ingest pentru topic clusters known (Goal/Onboarding/Pricing/Mode Detection/RPE/Tier)
  - Flag dacă sesiune-curentă adaugă conținut overlap > 1 file pe same topic
  - Auto-fix: append cross-ref `[CONSOLIDATED into <SSOT>]` la fragmente noi

STEP 11 — Detect new orphans
  - Grep new wikilinks `[[X]]` introduse acest ingest
  - Verify each target file exists fizic
  - Auto-fix: log în DIFF_FLAGS.md P3 (low-priority orphans) sau auto-replace cu existing target dacă obvious

STEP 12 — Detect ADR drift
  - Compare new §AMENDMENT entries în ADRs vs INDEX_MASTER status
  - Auto-fix: append INDEX_MASTER §AMENDMENT row update

STEP 13 — Detect HANDOVER size threshold
  - Check HANDOVER_ACTIVE.md LOC > 2000 → flag pentru roll-over la HANDOVER_ARCHIVE_<current_month>.md
  - Auto-trigger split la threshold (post Recomandare A implementation)

STEP 14 — Auto-fix mecanic safe
  - Cross-refs reciproce missing (ADR X → ADR Y but NU ADR Y → ADR X)
  - INDEX_MASTER append entry pentru new ADR fișiere create
  - Archive cleanup (un-numbered files cronologic NN add)

STEP 15 — Flag în report
  - DIFF_FLAGS.md update cu new findings detected
  - LATEST.md report append section "VAULT_HYGIENE_PASS Findings" (typically <5 minor items / ingest)
  - Daniel prompt next chat dacă consolidare manuală necesară (>5 findings sau HIGH severity)

Trigger: post-ingest mandatory, NU optional, NU prompt separat.
Effort run: ~10-15min CC autonomous per ingest.
Cross-ref: VAULT_RULES.md §HANDOVER_PROTOCOL extension + memory rule self-discipline NEW Claude.
```

---

## §9 — EFFORT ESTIMATE FAZA 3 EXECUTION

Per recomandare din §7 (post-validare Daniel Faza 2):

| Recomandare | Effort CC autonomous (factor 7-9x optimism) | Estimate realist |
|-------------|--------------------------------------------|------------------|
| A. HANDOVER_GLOBAL split Option C | ~3-4h | ~30-45min real |
| B1. Goal Taxonomy + Onboarding SSOT consolidation | ~3h Daniel + 1h CC | ~3h Daniel chat strategic + ~10-15min CC |
| B2. Pricing chain consolidate | ~30min CC | ~5-10min real |
| B3. Mode Detection ADR amendment | ~30min CC | ~5-10min real |
| B4. RPE/RIR ADR 003 §AMENDMENT | ~30-45min CC | ~10min real |
| B5. RPE Verbal UI cod fix CRITICAL pre-Beta | ~1-2h CC | ~15-20min real (cod B4 separate concern) |
| C. INDEX_MASTER refresh complete | ~1h CC | ~10-15min real |
| D. Archive policy cleanup | ~15min CC | ~5min real |
| E. DIFF_FLAGS.md root → 05-findings-tracker/ | ~5min CC | ~2min real |
| Orphan wikilinks cleanup (21 refs) | ~1h CC | ~10-15min real |
| ADR 022 stub + ADR 024 stub create | ~1-2h CC | ~15-20min real |
| DECISION_LOG UTF-8 encoding fix | ~30min CC | ~5-10min real |
| §8 VAULT_HYGIENE_PASS protocol codification în VAULT_RULES.md | ~30-45min CC | ~10min real |

**Total Faza 3 execution effort:**
- **CC autonomous estimate:** ~12-16h (factor 7-9x optimism ADR pattern empirical)
- **Realist actual:** **~2-3h CC autonomous** post Daniel Faza 2 validation
- **Daniel chat strategic:** ~3-4h (Recomandare B1 only — consolidate 5 SSOT manual decision-making)

**Plus:** Recomandare B5 (B4 RPE Verbal UI cod fix) este CRITICAL pre-Beta blocker SEPARATE de vault hygiene scope — counted în Bucket 1 audit consolidat findings (FINDINGS_MASTER §Bucket 1).

---

## EXECUTIVE SUMMARY (top findings)

1. **§3 Fragmentări SSOT: 6 topics cu drift** (Goal Taxonomy 5 surse + Onboarding 5 surse + Pricing 4 surse + Mode Detection 3 surse + RPE/RIR 3 surse + Tier 5/6 verify pending). Total ~25 cross-references inconsistente.
2. **§5 HANDOVER_GLOBAL: 5,443 LOC mega-fișier — split Option C recommended** (Active 30 zile + Archive cronologic per lună). Effort ~3-4h CC.
3. **§4 ADR drift: 4 ADRs cu status drift identificate** (ADR 001 LWW + ADR 003 RIR + ADR 008 GitHub Pages stale + ADR 023 missing din INDEX) + 8 ADR drafts NU în INDEX_MASTER + ADR 022 ORPHAN. INDEX_MASTER stale 2026-04-30 evening (3 zile).
4. **§2 Orphans: 22 wikilinks MISSING + 3 UNREFERENCED** = 25 orphan items. ADR 022 = HIGH severity (referenced 9+ places, NU file). 19 LOW (closed audits).
5. **§8 Maintenance protocol VAULT_HYGIENE_PASS spec ready** pentru codification în VAULT_RULES.md post Faza 3 execution.

---

🦫 **Faza 1 audit structural complete. ZERO modificări vault outside `📤_outbox/`. ~25 SSOT cross-references inconsistente + 25 orphans + 4 ADR drift + 5443 LOC HANDOVER mega-fișier candidate split. Faza 2 Daniel validare scurtă pe 5 recomandări A-E + 3 adiționale → Faza 3 execution ~2-3h CC autonomous realist.**
