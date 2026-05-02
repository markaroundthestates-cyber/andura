# SALAFULL VAULT — INDEX MASTER

**Last updated:** 2026-04-30 evening (post Gemini cross-check + ADR 020-021)
**SSOT activ:** [[HANDOVER_GLOBAL_2026-04-30_evening]] — citește primul pentru context curent
**Stats:** 51 fișiere active vault (49 baseline post-cleanup + 2 ADR new: 020-021)
**Tooling:** VS Code only (Obsidian dropped per HANDOVER §7.6). Markdown preview built-in `Ctrl+K V`.

---

## STRUCTURĂ POST-CLEANUP

```
andura/
├── 00-index/        INDEX_MASTER (acest fișier)
├── 01-vision/       Vision + Strategy + Daniel profile + parametric programs (5 files)
├── 02-audit/        COACHING_TEXTBOOK_SYNTHESIS (research reference, 1 file)
├── 03-decisions/    22 ADR-uri active (001-021 + ADR_MULTI_TENANT_AUTH) + DECISION_LOG (23 files)
├── 04-architecture/ Cognitive + Multi-tenant + Tombstone + Data registry specs (4 files)
├── 05-findings-tracker/  FINDINGS_MASTER + INSIGHTS_BACKLOG + AUDIT_30_9_BLOCKED (3 files)
├── 06-sessions-log/      HANDOVER_GLOBAL_2026-04-30_evening SSOT activ (1 file)
├── 07-meta/         CLAUDE_CODE_RULES (1 file)
├── 08-workflows/    Chat migration + Forward compat + Handover template + Model upgrade audit + Claude chat infra (5 files)
├── 📥_inbox/        Daniel uploadează aici (artefacte chat, prompts CC, drafturi)
├── 📤_outbox/       Output CC (LATEST.md activ + _archive/<YYYY-MM>/NN_*.md istoric continuu)
└── README.md        Repo intro
```

**Folders REMOVED post-cleanup:** `05-prompts/` (executed), `10-exec-queue/` (DONE), `docs/` (orphan, migrated), **`cc-reports/` (DEPRECATED 30 apr, content migrated to `📤_outbox/_archive/2026-04/`)**.

---

## NAVIGARE RAPIDĂ

| Cauți | Citește |
|-------|---------|
| **Context curent + decizii pending Daniel review** | [[HANDOVER_GLOBAL_2026-04-30_evening]] |
| **Sprint 4 / Wave 6 backlog complet** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §6 |
| **Pricing locked €60 lifetime / €65/an** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §3 + [[PRODUCT_STRATEGY_SPEC_v1]] §1.3 |
| **"SensAI for Android" positioning** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §2.1 |
| **5 axe differentiation (vs AI = comoditate)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §10 + [[MOAT_STRATEGY]] §Competitor Comparison Matrix |
| **7 features distinctive (MOAT real)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §2.2 |
| **Chalkboard educational layer (Sprint 4)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §11 |
| **Feedback system in-app (Sprint 4)** | [[HANDOVER_GLOBAL_2026-04-30_evening]] §12 |
| **Decizii arhitecturale cronologic** | [[DECISION_LOG]] |
| **ADR-uri active 001-021 + ADR_MULTI_TENANT_AUTH** | `03-decisions/` |
| **Storage Tiering Strategy (Tier 0/1/2 + Dexie)** | [[020-storage-tiering-strategy]] |
| **Calibration Drift Reconciliation (Version Vector)** | [[021-calibration-drift-reconciliation]] |
| **Cognitive architecture engine** | [[COGNITIVE_ARCHITECTURE_SPEC_v1]] |
| **Multi-tenant auth migration plan** | [[MULTI_TENANT_AUTH_MIGRATION_SPEC]] |
| **T&B implementation (LWW deprecated)** | [[TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC]] |
| **Data registry SSOT** | [[DATA_REGISTRY_SPEC]] |
| **Product strategy 80 decizii + 8 push-backs** | [[PRODUCT_STRATEGY_SPEC_v1]] |
| **Project vision + brand** | [[PROJECT_VISION]] |
| **MOAT strategy** | [[MOAT_STRATEGY]] |
| **Daniel profile + cognitive mode** | [[DANIEL_COMPLETE_PROFILE]] |
| **Parametric programs (FAZA 4+ design)** | [[PARAMETRIC_PROGRAMS_DESIGN]] |
| **Findings tracker (130+ unique)** | [[FINDINGS_MASTER]] |
| **Insights backlog (deferred + future)** | [[INSIGHTS_BACKLOG]] |
| **Coaching textbook synthesis (research)** | [[COACHING_TEXTBOOK_SYNTHESIS]] |
| **Chat migration protocol** | [[CHAT_MIGRATION_PROTOCOL]] |
| **Claude chat infrastructure** | [[CLAUDE_CHAT_INFRASTRUCTURE]] |
| **Forward-compat principles** | [[FORWARD_COMPAT_PRINCIPLES]] |
| **Handover template (next session)** | [[HANDOVER_TEMPLATE]] |
| **Model upgrade audit protocol** | [[MODEL_UPGRADE_AUDIT_PROTOCOL]] |
| **CC autonomous run rules** | [[CLAUDE_CODE_RULES]] |
| **Sprint 1+2+3 partial reports** | `📤_outbox/_archive/2026-04/08_SPRINT1_EXECUTION_REPORT.md` + `09_SPRINT2_EXECUTION_REPORT.md` + `10_SPRINT3_PARTIAL_EXECUTION_REPORT.md` |
| **AUDIT 5000Q corpus + report** | `📤_outbox/_archive/2026-04/06_AUDIT_5000Q.md` + `07_AUDIT_5000Q_REPORT.md` |
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
| New | [[ADR_MULTI_TENANT_AUTH_v1]] | Accepted (UUID Anonymous → Firebase Auth real) |

---

## SSOT PRINCIPLE LOCKS

1. **Un document activ per topic.** Update-in-place > create-new-with-corrections.
2. **HANDOVER_GLOBAL_2026-04-30_evening** = SSOT activ pentru context curent. Înlocuiește toate handover-urile anterioare (mutate în git history).
3. **DECISION_LOG** = master cronologic. Toate deciziile arhitecturale + amendments aici.
4. **FINDINGS_MASTER + INSIGHTS_BACKLOG** = single source pentru bugs tracking + deferred design.
5. **`src/`, `tests/`, `scripts/`, `.claude/`, `.github/`, `.husky/` = NU vault**, nu se atinge la cleanup vault.
6. **Git history = backup absolut.** Recuperare oricând cu `git log --all --full-history -- "path/to/deleted/file"`.

---

## VAULT CLEANUP 2026-04-30

73 fișiere șterse (sprint-uri închise + handover-uri consolidate + audits absorbite + prompts executate + ADR patches merged inline). Reducere -61% (125 → 49 vault docs).

Detalii complete: `📤_outbox/_archive/2026-04/11_VAULT_CLEANUP_REPORT.md`.

---

🦫 **Building it like we'll own it forever. SSOT only. Single tool, single doc per topic.**
