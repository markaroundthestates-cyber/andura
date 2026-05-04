# ANDURA VAULT — INDEX MASTER

**Last updated:** 2026-05-04 night (post handover ingest §45-§49 — ADR 026 SPEC SESSION COMPLETE 75 decisions LOCKED V1 + Engine #8 Warm-up & Mobility NEW + §47 Alignment Questions Rule LOCKED V1 + cumulative 100 → 175)
**SSOT activ:** [[HANDOVER_GLOBAL_2026-04-30_evening]] — citește primul pentru context curent (175 LOCKED V1 + §36.99-§36.107 offline coaching tree + 8 prescriptive engines (META 7→8 amendment) + D2/D3 NEW + §41-§44 Vault Hygiene COMPLETE + §45 ADR 026 spec 75 decisions + §47 Alignment Questions Rule LOCKED V1)
**Stats:** 66 fișiere active vault (post-stubs G + UNREFERENCED moves F)
**Tooling:** VS Code only (Obsidian dropped per HANDOVER §7.6). Markdown preview built-in `Ctrl+K V`.

---

## STRUCTURĂ POST-CLEANUP (Vault Hygiene Sprint Faza 3 — 2026-05-04)

```
andura/
├── 00-index/        INDEX_MASTER (acest fișier)
├── 01-vision/       Vision + Strategy + Daniel profile + parametric programs (5 files)
├── 02-audit/        COACHING_TEXTBOOK_SYNTHESIS (research reference, 1 file)
├── 03-decisions/    26 ADR-uri active (001-021 + 022/024/025/026 stubs + 023 + ADR_MULTI_TENANT_AUTH + 8 named) + DECISION_LOG (28 files)
├── 04-architecture/ Cognitive + Multi-tenant + Tombstone + Data registry specs (4 files)
├── 05-findings-tracker/  FINDINGS_MASTER + INSIGHTS_BACKLOG + AUDIT_30_9_BLOCKED (3 files)
├── 06-sessions-log/      HANDOVER_GLOBAL_2026-04-30_evening SSOT activ (1 file, 6058 LOC — split candidate Faza 5 dacă > 7000)
├── 07-meta/         CLAUDE_CODE_RULES (1 file)
├── 08-workflows/    Chat migration + Forward compat + Handover template + Model upgrade audit + Claude chat infra (5 files)
├── 📥_inbox/        Daniel uploadează aici (artefacte chat, prompts CC, drafturi)
├── 📤_outbox/       Output CC (LATEST.md activ + ALIGNMENT_QUESTIONS_CHAT_NEW.md + _archive/<YYYY-MM>/NN_*.md istoric continuu)
├── DIFF_FLAGS.md    P1/P2 outstanding issues requiring Daniel action (root level)
├── VAULT_RULES.md   Authoritative rules + §HANDOVER_PROTOCOL + §VAULT_HYGIENE_PASS + §BATCH_PROTOCOL (root level)
├── PROMPT_CC_HYGIENE.md  Reusable Opus prompt (root level)
└── README.md        Repo intro
```

**Folders REMOVED post-cleanup 30 apr:** `05-prompts/` (executed), `10-exec-queue/` (DONE), `docs/` (orphan, migrated), **`cc-reports/` (DEPRECATED 30 apr, content migrated to `📤_outbox/_archive/2026-04/`)**.

---

## NAVIGARE RAPIDĂ

| Cauți | Citește |
|-------|---------|
| **Context curent + decizii pending Daniel review** | [[HANDOVER_GLOBAL_2026-04-30_evening]] |
| **Sprint 4 / Wave 6 backlog complet** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §6 |
| **Pricing locked Founding €39 + Standard €59 + Elite €79 (V1.1)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §36.50 (post Chat D 2026-05-02) + [[PRODUCT_STRATEGY_SPEC_v1]] §1.3 (DEPRECATED, see §AMENDMENT) |
| **"SensAI for Android" positioning** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §2.1 |
| **5 axe differentiation (vs AI = comoditate)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §10 + [[MOAT_STRATEGY]] §Competitor Comparison Matrix |
| **7 features distinctive (MOAT real)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §2.2 |
| **Chalkboard educational layer V1.1** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §11 |
| **Feedback system in-app (Sprint 4)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §12 |
| **Andura Offline Coaching Decision Tree (PRE-BETA blocker)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §36.99 + [[026-offline-coaching-decision-tree-exhaustive]] (stub) |
| **7 Engines Prescriptive NEW roadmap** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §36.100 (Periodization / Goal Adaptation / Bayesian Nutrition / Deload / Energy / Tempo+Form / Specialization) |
| **5 voices Cognitive Architecture CONFIRMED** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §36.101 + [[COGNITIVE_ARCHITECTURE_SPEC_v1]] |
| **Goal lifecycle change first-class** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §36.102 + §26 (8 templates V1) + §36.35 (Shift Event Handler) |
| **Knowledge layer cadence quarterly/bi-annual/annual** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §36.103 |
| **D2 NEW Injury/Contraindication Mapping (OPENED FOR DISCUSSION)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §36.106 |
| **D3 NEW Don't Like + Home + Calistenice + Sport-Oriented (OPENED FOR DISCUSSION)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §36.107 |
| **Vault Hygiene Sprint Faza 3+4 ✅ COMPLETE (8 recomandări A-H + Faza 4 codified)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §41 |
| **ADR 026 Spec Decisions 1-10 LOCKED V1 (chat strategic 2026-05-04 morning)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §42 (§42.1-§42.10) + [[DECISION_LOG]] (2026-05-04 evening entry) |
| **ADR 026 SPEC SESSION COMPLETE 75 decisions LOCKED V1 (chat strategic 2026-05-04 night) — Q1-Q40 + 17 refinements + Engine #8 + cooldown defer + light flags** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §45 (§45.1-§45.8) + [[DECISION_LOG]] (2026-05-04 night entry) |
| **Engine #8 Warm-up & Mobility LOCKED V1 NEW (META §36.100 amendment 7→8 prescriptive engines, pre-Beta MANDATORY)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §45.6 |
| **§47 Alignment Questions Generation Rule LOCKED V1 — search-driven format mandatory + DEPRECATED pre-fed verbatim** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §47 + `VAULT_RULES.md` §HANDOVER_PROTOCOL step 9 amendment + `PROMPT_CC_HYGIENE.md` §9 amendment |
| **Next actions priority order post 2026-05-04 night ingest (Priority 0/1/2/3/4)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §46 |
| **Cumulative LOCKED count 175 + vault state post §45-§49 ingest** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §45.8 |
| **Decizii arhitecturale cronologic** | [[DECISION_LOG]] |
| **ADR-uri active 001-021 + 022/024/025/026 stubs + 023 + ADR_MULTI_TENANT_AUTH + 8 named** | `03-decisions/` |
| **Storage Tiering Strategy (Tier 0/1/2 + Dexie)** | [[020-storage-tiering-strategy]] |
| **Calibration Drift Reconciliation (Version Vector)** | [[021-calibration-drift-reconciliation]] |
| **LLM Intent Interpretation (Pain + Equipment scope strict)** | [[023-llm-intent-interpretation]] (LOCKED V1 partial) |
| **Bayesian Nutrition Inference (stub PENDING spec)** | [[022-bayesian-nutrition-inference]] |
| **Goal-Driven Program Templates (stub PENDING spec)** | [[024-goal-driven-program-templates]] |
| **Andura Gândește pentru User / Graceful Degradation Universal (candidate)** | [[025-andura-gandeste-pentru-user]] |
| **Offline Coaching Decision Tree Exhaustive (candidate, PRE-BETA blocker)** | [[026-offline-coaching-decision-tree-exhaustive]] |
| **Cognitive architecture engine** | [[COGNITIVE_ARCHITECTURE_SPEC_v1]] |
| **Multi-tenant auth migration plan** | [[MULTI_TENANT_AUTH_MIGRATION_SPEC]] |
| **T&B implementation (LWW deprecated)** | [[TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC]] |
| **Data registry SSOT** | [[DATA_REGISTRY_SPEC]] |
| **Product strategy 80 decizii + 8 push-backs** | [[PRODUCT_STRATEGY_SPEC_v1]] |
| **Project vision + brand** | [[PROJECT_VISION]] |
| **MOAT strategy** | [[MOAT_STRATEGY]] |
| **Daniel profile + cognitive mode** | [[DANIEL_COMPLETE_PROFILE]] |
| **Parametric programs (FAZA 4+ design)** | [[PARAMETRIC_PROGRAMS_DESIGN]] |
| **Findings tracker (135+ unique post Sprint 4.x)** | [[FINDINGS_MASTER]] |
| **Insights backlog (deferred + future)** | [[INSIGHTS_BACKLOG]] |
| **Coaching textbook synthesis (research)** | [[COACHING_TEXTBOOK_SYNTHESIS]] |
| **Chat migration protocol** | [[CHAT_MIGRATION_PROTOCOL]] |
| **Claude chat infrastructure** | [[CLAUDE_CHAT_INFRASTRUCTURE]] |
| **Forward-compat principles** | [[FORWARD_COMPAT_PRINCIPLES]] |
| **Handover template (next session)** | [[HANDOVER_TEMPLATE]] |
| **Model upgrade audit protocol** | [[MODEL_UPGRADE_AUDIT_PROTOCOL]] |
| **CC autonomous run rules** | [[CLAUDE_CODE_RULES]] |
| **Outstanding issues (P1/P2 flags)** | `DIFF_FLAGS.md` (root) |
| **Vault rules + §HANDOVER_PROTOCOL + §VAULT_HYGIENE_PASS + §BATCH_PROTOCOL** | `VAULT_RULES.md` (root) |
| **Reusable Opus prompt for handover ingest** | `PROMPT_CC_HYGIENE.md` (root) |
| **Sprint 1+2+3 partial reports** | `📤_outbox/_archive/2026-04/08_SPRINT1_EXECUTION_REPORT.md` + `09_SPRINT2_EXECUTION_REPORT.md` + `10_SPRINT3_PARTIAL_EXECUTION_REPORT.md` |
| **Sprint 4.x Final Report (centralized cluster)** | `📤_outbox/_archive/2026-05/116_SPRINT_4X_FINAL_REPORT.md` |
| **AUDIT 5000Q corpus + report** | `📤_outbox/_archive/2026-04/06_AUDIT_5000Q.md` + `07_AUDIT_5000Q_REPORT.md` |
| **VAULT_HYGIENE_PHASE_1_AUDIT (read-only inventory)** | `📤_outbox/_archive/2026-05/110_VAULT_AUDIT_INVENTORY.md` |
| **AUDIT 30.9 blocked state (Daniel sign-off needed)** | [[AUDIT_30_9_BLOCKED_STATE]] |

---

## ADR-URI ACTIVE (cronologic, în ordinea acceptării)

| # | ADR | Status |
|---|-----|--------|
| 001 | [[001-local-first-storage]] | Accepted |
| 002 | [[002-firebase-rest-not-sdk]] | Accepted |
| 003 | [[003-double-progression-engine]] | Accepted |
| 004 | [[004-rule-engine-numeric-priorities]] | Accepted |
| 005 | [[005-vanilla-js-no-framework]] | Accepted |
| 006 | [[006-tier-storage-for-logs]] | Accepted |
| 007 | [[007-firebase-open-rules]] | Accepted (deferred posture per memory) |
| 008 | [[008-vitest-playwright-testing]] | Accepted |
| 009 | [[009-calibration-tiers]] | Accepted (amended 2026-04-30 inline — see §AMENDMENT 2026-04-30 in ADR) |
| 010 | [[010-no-anthropic-trademark-public]] | Accepted |
| 011 | [[011-coach-decision-log-architecture]] | Accepted (schema extended 2026-04-26 + LWW→T&B amendment 2026-04-30) |
| 012 | [[012-tier-decay-on-inactivity]] | Accepted |
| 013 | [[013-auto-aggression-detection]] | Accepted (impl COMPLETĂ post TASK #7) |
| 014 | [[014-onboarding-profile-typing]] | Accepted (wording update 2026-04-27 data-injected) |
| 015 | [[015-getbf-calibration-only]] | Accepted (closes getBF dead code) |
| 016 | [[016-vitality-layer]] | Accepted (depends ADR 018) |
| 017 | [[017-demographic-prior-database]] | Accepted (depends ADR 018) |
| 018 | [[018-engine-extensibility-architecture]] | Accepted (foundation NEXT) |
| 019 | [[019-gdpr-k-anonymity-validation]] | Accepted (k=5 quasi-identifiers — promoted from amendment 2026-04-30) |
| 020 | [[020-storage-tiering-strategy]] | Accepted (Tier 0/1/2 + Dexie.js + rotation — Gemini Q10 BLIND SPOT #1, pre-launch CRITICAL) |
| 021 | [[021-calibration-drift-reconciliation]] | Accepted (Version Vector + max-merge — Gemini Q10 BLIND SPOT #2, pre-Faza-2 T&B) |
| 022 | [[022-bayesian-nutrition-inference]] | 🟡 **STUB / PENDING SPEC** (created Faza 3 2026-05-04 — split per §36.95 ADR Numbering Additive) |
| 023 | [[023-llm-intent-interpretation]] | LOCKED V1 partial spec (full sub-sections A-M PENDING addendum upload — see DIFF_FLAGS P1-FLAG-1) |
| 024 | [[024-goal-driven-program-templates]] | 🟡 **STUB / PENDING SPEC** (created Faza 3 2026-05-04 — Engine #2 §36.100) |
| 025 | [[025-andura-gandeste-pentru-user]] | 🟡 **CANDIDATE / STUB** (created Faza 3 2026-05-04 — Graceful Degradation Universal §36.94) |
| 026 | [[026-offline-coaching-decision-tree-exhaustive]] | 🟡 **CANDIDATE / STUB** (created Faza 3 2026-05-04 — PRE-BETA blocker §36.99) |
| New | [[ADR_MULTI_TENANT_AUTH_v1]] | Accepted (UUID Anonymous → Firebase Auth real) |

### Named ADRs (8 — non-numbered, locked V1)

| Name | Status |
|------|--------|
| [[ADR_BIAS_DETECTION_OBSERVABLE_v1]] | LOCKED V1 |
| [[ADR_CASCADE_DEFENSE_v1]] | LOCKED V1 |
| [[ADR_COMPOSITE_SIGNAL_LAYER_v1]] | LOCKED V1 |
| [[ADR_MODE_DETECTION_UI_v1]] | LOCKED V1 |
| [[ADR_OUTLIER_FILTER_v1]] | LOCKED V1 |
| [[ADR_PAIN_DISCOMFORT_BUTTON_v1]] | LOCKED V1 |
| [[ADR_RIR_MATRIX_ADAPTIVE_v1]] | LOCKED V1 |
| [[ADR_SMART_ROUTING_EQUIPMENT_v1]] | LOCKED V1 |

---

## SSOT PRINCIPLE LOCKS

1. **Un document activ per topic.** Update-in-place > create-new-with-corrections.
2. **HANDOVER_GLOBAL_2026-04-30_evening** = SSOT activ pentru context curent. Înlocuiește toate handover-urile anterioare (mutate în git history).
3. **DECISION_LOG** = master cronologic. Toate deciziile arhitecturale + amendments aici.
4. **FINDINGS_MASTER + INSIGHTS_BACKLOG** = single source pentru bugs tracking + deferred design.
5. **`src/`, `tests/`, `scripts/`, `.claude/`, `.github/`, `.husky/` = NU vault**, nu se atinge la cleanup vault.
6. **Git history = backup absolut.** Recuperare oricând cu `git log --all --full-history -- "path/to/deleted/file"`.

---

## VAULT CLEANUP HISTORY

### 2026-04-30 (initial cleanup)
73 fișiere șterse (sprint-uri închise + handover-uri consolidate + audits absorbite + prompts executate + ADR patches merged inline). Reducere -61% (125 → 49 vault docs).
Detalii complete: `📤_outbox/_archive/2026-04/11_VAULT_CLEANUP_REPORT.md`.

### 2026-05-03 (Vault Hygiene Sprint Faza 1 — read-only audit)
110_VAULT_AUDIT_INVENTORY.md ~600 LOC §1-§9: 200 .md files (62 active + 138 archive), 60815 LOC total, 22 MISSING + 3 UNREFERENCED orphans, 4 ADR drift findings, ORPHAN-1 ADR 022 finding HIGH (split decision §36.95).

### 2026-05-04 (Vault Hygiene Sprint Faza 3 + Faza 4 — execution)
- **G:** ADR 022/024/025/026 stubs created (split ORPHAN-1 + candidates 025+026)
- **H:** DECISION_LOG.md UTF-8 normalize (422 mojibake substitutions: â€" → —, Äƒ → ă, È› → ț, È™ → ș, Ã® → î, Â§ → §, etc.)
- **F:** 21 orphan wikilinks resolved (ADR 022 created, 18 LOW stripped to plain text, 4 MEDIUM rewired EXEC_QUEUE/EXEC_RESULTS/HANDOVER/ENGINE_ARCHITECTURE) + 3 UNREFERENCED resolved (SPRINT_4X moved 116, HANDOVER_INPUT_2026-05-02 deleted as duplicate of 37)
- **C:** INDEX_MASTER refreshed (this update — stats 51 → 66, ADRs 22 → 26)
- **B:** Onboarding SSOT V1 consolidation (`01-vision/ONBOARDING_SSOT_V1.md` placeholder per §36.96 + §36.92 D4 hybrid C)
- **A:** HANDOVER_GLOBAL split candidate flagged (file 6058 LOC < 7000 threshold default; defer split till threshold breach)
- **D:** Archive policy zero change (preserve audit trail per recomandare)
- **E:** Folder restructuring zero change (root-level VAULT_RULES + DIFF_FLAGS + PROMPT_CC_HYGIENE preserved per audit)
- **Faza 4:** §VAULT_HYGIENE_PASS rule codified in VAULT_RULES.md (steps 10-15 + auto-trigger spec post-ingest)

### 2026-05-04 evening (handover ingest §41-§44)
- **Stale handover archive** (zero info loss): `📥_inbox/HANDOVER_CHAT_OFFLINE_COACHING_TREE_2026-05-04.md` already ingested earlier today (§36.99 + §36.106 verified present in HANDOVER_GLOBAL via grep) → archived `📤_outbox/_archive/2026-05/118_HANDOVER_CHAT_OFFLINE_COACHING_TREE_CONSUMED_2026-05-04.md`
- **New handover ingest:** §41 Vault Hygiene Sprint Faza 3+4 COMPLETE (meta self-reference) + §42 ADR 026 spec decisions 1-10 LOCKED V1 + §43 next actions priority + §44 cumulative 90 → 100. Source archived `📤_outbox/_archive/2026-05/119_HANDOVER_2026-05-04_evening_CONSUMED.md`
- **DECISION_LOG +10 entries** ADR 026 §42.1-§42.10 LOCKED V1 (top of file, cronologic descending)
- **HANDOVER_GLOBAL split FLAG check:** post-merge ~6200-6300 LOC (pre-merge 6058 + ~150-200 added §41-§44). Sub 7000 LOC threshold §VAULT_HYGIENE_PASS STEP 13 — flag NU triggered

### 2026-05-04 night (handover ingest §45-§49 — ADR 026 SPEC SESSION COMPLETE)
- **New handover:** `HANDOVER_2026-05-04_NIGHT_ADR_026_SPEC_COMPLETE.md` archived `📤_outbox/_archive/2026-05/122_HANDOVER_2026-05-04_NIGHT_ADR_026_SPEC_COMPLETE_CONSUMED.md`
- **§45 ADR 026 SPEC SESSION COMPLETE — 75 decisions LOCKED V1** Q1-Q40 (4 batches × 10) + 17 refinements + Engine #8 NEW + cooldown defer post-Beta v1.5 + light flags Maria deload + Q16 JSON output spec
- **§45.6 Engine #8 Warm-up & Mobility LOCKED V1 NEW** — META §36.100 amendment 7→8 prescriptive engines (22 total = 14 reactive + 8 prescriptive), pre-Beta MANDATORY, Instant Skip principle ADR 025 reuse
- **§47 Alignment Questions Generation Rule LOCKED V1 NEW** — search-driven format mandatory STRICT (deprecate pre-fed verbatim post 2026-05-04 night). Cross-refs: VAULT_RULES.md §HANDOVER_PROTOCOL step 9 amendment + PROMPT_CC_HYGIENE.md §9 amendment + memory rule #22 Daniel chat side
- **Cumulative LOCKED count:** 100 → **175** (+75 substantive ADR 026 spec decisions)
- **DECISION_LOG +1 condensed entry** referencing HANDOVER_GLOBAL §45.2-§45.7 verbatim (top of file, cronologic descending)
- **HANDOVER_GLOBAL split FLAG approaching threshold:** post-merge §45-§49 ~6700-6900 LOC (pre-merge 6243 + §45-§49 added). Sub 7000 LOC threshold §VAULT_HYGIENE_PASS STEP 13 — flag NU triggered yet but recommend monitor next handover

---

🦫 **Building it like we'll own it forever. SSOT only. Single tool, single doc per topic. Vault clean post Faza 3+4 + 175 LOCKED post §45-§49 ingest. Andura needs to be the best. ✊**
