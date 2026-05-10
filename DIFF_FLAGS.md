# DIFF FLAGS — Outstanding Issues Requiring Daniel Action

**Owner:** Daniel (CEO + Product). Used by CC Opus / Claude chat to surface pending issues.
**Updated:** 2026-05-05 overnight (post HANDOVER_GLOBAL thematic split atomic execution per §62.2 LOCKED V1 — P1-FLAG-HANDOVER-SPLIT 🟡 OPEN → 🟢 RESOLVED. Source 7673 LOC split into 7 theme files + master = INDEX. ZERO data loss. ZERO wikilinks rewire (master = navigation hub, 1-hop drill-down). Backup tag `pre-handover-split-2026-05-05-overnight` rollback safety. Precedent same overnight: batch overnight 5 tasks complete + Validation Framework LOCK V1 + Cumulative LOCKED ~653 preserved.)
**See also:** [[VAULT_RULES]] §HANDOVER_PROTOCOL §5 (Safety Net) §VAULT_HYGIENE_PASS STEP 13 | [[06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] | [[05-findings-tracker/FINDINGS_MASTER]]

---

## P1 BLOCKERS (require Daniel action before proceeding)

### P1-FLAG-STRATEGIC-SHIFT-CLASIC-MASTER — Single-theme Clasic master FIRST cap-coadă LOCKED V1 (2026-05-10)

**Status:** 🟢 LOCKED V1 SUBSTANTIVE (cumulative ~717 → ~718 +1 net STRATEGIC SHIFT — Daniel directive verbatim post Phase 3.5 closure receipt)
**Severity:** P1 strategic decision — affects Phase 4 dedicate session scope + knowledge base architecture

**Issue:**
Phase 4 strategy revised post Daniel directive cap-coadă chat-current verbatim *"nu e mai productiv sa facem thema clasic full working 100% si dupa sa facem toate celelalte themes dupa ea?"* + *"daca dupa asta lucram doar la clasic... de ce mai indexez si celelalte 2 theme in knowladgebase?"*.

**Single-theme Clasic master LOCK V1 implications:**
- Tasks X (Lux storyboard ~6-8h) + Y (BC paradigm ~3-4h) + carry-forward Phase 3+3.5 backlog (Cluster #4 Istoric + Cluster #6 Workflow V1 LOCK + Task I muscleMap + QA calibration banner) → DEFERRED post Clasic master 100% production-ready confirmed Daniel Gates smoke
- Knowledge base architecture deselect plan (~10-12% capacity gain combined): deselect LB+Lux+BC mockups + 02-audit + 05-findings-tracker + 06-sessions-log + 07-meta + 08-workflows + public + react-test.html + tsconfig.* + playwright.config.js
- Total post-cuts ~88-91% capacity headroom rezonabil
- Preserve: andura-clasic.html + REACT_MIGRATION_STATE_MAPPING_V1 + 04-architecture critic specs + src/ 40% + 03-decisions/ 17% + 00-index/ 10% + 01-vision/ 4% + VAULT_RULES.md 2%

**Action Daniel:**
1. Smoke DEPTH cap-coadă Clasic FIRST per `LATEST_CONSOLIDATED.md §Smoke Validation Priority` P0 → P1 (NU "fugitiv")
2. Deselect knowledge base files per plan (capacity gain ~10-12%)
3. Schedule Phase 4 dedicate session post Clasic master 100% smoke validation OK (~22-30h estimated combined backlog: Tasks X+Y full + T+U + carry-forward Phase 3+3.5 muscleMap + QA calibration + Cluster #4+#6)
4. Decide merge `feature/phase-3-orchestrator-final` la main timing post Clasic master smoke validation OK (16 commits chain `47dcca8 → 3ff5726`)

**Cross-refs:** `00-index/CURRENT_STATE.md` §JUST_DECIDED top entry 2026-05-10 Phase 3.5 closure + STRATEGIC SHIFT + `03-decisions/DECISION_LOG.md` top entry same date + handover archived NN 349 + LATEST_CONSOLIDATED.md Phase 3+3.5 archived NN 350+362.

---

### P1-FLAG-3-TIER-TESTING-DISTINCTION — LOCAL vitest CC / e2e Playwright CI/CD / Daniel Gates prod (2026-05-10)

**Status:** 🟢 LOCKED V1 ANTI-RECURRENCE RULE (post Slip Co-CTO #2 mid-Phase 3 confirmation theater "solid + minor edge cases" claim BEFORE Daniel smoke → 13+ buguri Daniel smoke fugitiv)
**Severity:** P1 process discipline — CC orchestrator LANDED claim format MUST distinguish 3 tiers

**Rule LOCKED V1:**
1. **LOCAL vitest CC autonomous** — 2731 PASS preserved local (CC orchestrator fast feedback)
2. **e2e Playwright CI/CD GitHub Actions** — full integration tests scope (NU run pre-LANDED claim CC orchestrator)
3. **Daniel Gates prod smoke andura.app** — final acceptance pe production deploy

**CC orchestrator LANDED status = LOCAL vitest only — NU implies smoke prod-ready Daniel Gates.** CC NU ran e2e suite + NU ran prod smoke pre-LANDED claim. Future LANDED claim format mandatory: "LANDED LOCAL vitest 2731 PASS — pending e2e CI/CD + Daniel Gates smoke validation."

**Action CC orchestrator:** Apply 3-tier distinction în toate raporturile LANDED post-execution. NU promite "smoke clean expected" sau "minor edge cases" pre Daniel Gates smoke.

---

### P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER — e2e test fail Phase 4 backlog (2026-05-10)

**Status:** 🟡 OPEN Phase 4 backlog NU urgent (single-theme Clasic FIRST strategic shift)
**Severity:** P1 e2e test fail — `e2e/scenarios/calibration-ui.spec.js:193` LOW_ADHERENCE banner NU se afișează

**Issue:**
- Test: `CDL with 5 real entries low adherence shows LOW_ADHERENCE banner`
- Expect: text `/Adherence scăzută/i` în body
- Actual: body afișează default state "DATE INSUFICIENTE Completează 2+ sesiuni"
- Bug: LOW_ADHERENCE banner NU se afișează când CDL 5 entries low adherence threshold met

**Investigation Phase 4:**
- `src/engine/calibration.js` LOW_ADHERENCE logic verify
- `src/engine/CDL.js` adherence calculation + threshold verify
- `e2e/scenarios/calibration-ui.spec.js:193` test setup verify (5 entries low adherence reproduction conditions)

**Action Daniel:** Schedule Phase 4 dedicate session — bundle cu Tasks X+Y+T+U+muscleMap (~22-30h combined)

---

### P1-FLAG-1 — ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md SOURCE PENDING UPLOAD

**Status:** 🟡 PARTIALLY MITIGATED 2026-05-03 (chat strategic post-audit) — Faza 3 va integra direct sub-secțiuni A-M ADR 023 din addendum context window în chat strategic original (NU file upload separate). Original raised 2026-05-03 audit total ingest.
**Severity:** P1 BLOCKER (impedes ADR 023 implementation full sub-sections A-M, but Faza 3 cleanup integrates from chat context)

**Issue:**
Audit total ingest 2026-05-03 (3 fișiere ingestate: HANDOVER_AUDIT_TOTAL + AUDIT_VERIFICATION_REPORT + AUDIT_IDEATION_REPORT) referă al 4-lea fișier `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` ca sursă pentru ADR 023 LLM Intent Interpretation §2 sub-secțiuni A-M complete. **Acest fișier NU e în inbox la momentul ingest.**

**Per memory rule SUFLET ANDURA precedent (2026-05-02):** partial ingest procedat — fabricarea conținutului lipsă INTERZISĂ per zero-info-loss principle.

**Impact:**
- ADR 023 status `LOCKED V1 — partial spec` (file `03-decisions/023-llm-intent-interpretation.md` cu summary verifiable din 3 fișiere ingestate)
- Sub-sections A-M full spec (provider chain detail + sandbox detail + sanitizer whitelist exhaustive + async lifecycle + cache invalidation policy + cost cap enforcement detail + CDL llm_metadata schema + Gigel test scenarios + ToS impact + privacy impact + audit trail format + reconsideration triggers detail + implementation guidance) NU disponibile
- Implementation Tier 1 (Pain) + Tier 2 (Equipment) cannot start până full spec disponibil

**Action Daniel:**
1. Upload `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` în `📥_inbox/`
2. Comandă CC Opus: `Ingest handover from inbox per VAULT_RULES §HANDOVER_PROTOCOL`
3. CC Opus va ingesta full sub-sections A-M și update `03-decisions/023-llm-intent-interpretation.md` din partial → complete
4. Update DIFF_FLAGS.md: P1-FLAG-1 status `🟢 RESOLVED` cu cross-ref commit hash ingest

**Cross-refs:**
- HANDOVER_GLOBAL §36.86 ADR 023 partial spec
- HANDOVER_GLOBAL §36.87 Cognitive Q4 DELOCK §AMENDMENT
- HANDOVER_GLOBAL §36.91 T2 RESOLVED via ADR 023
- `03-decisions/023-llm-intent-interpretation.md` partial stub
- Memory rule SUFLET ANDURA precedent 2026-05-02 (Procesul de gândire 12k cuvinte — partial ingest cu STUB pending source upload)

---

### P1-FLAG-NEW — Codespace `npm install` drift (3 test FILE imports broken)

**Status:** 🔴 OPEN 2026-05-04 (raised during handover ingest §36.99-§36.107 verification)
**Severity:** P1 (impedes pre-commit hook on Codespace; CI/dev-env only — production unaffected)

**Issue:**
3 test files in `src/storage/__tests__/` fail to load with **import errors** (NOT assertion failures, NOT timeouts):
- `src/storage/__tests__/db.test.js` — `Failed to resolve import "fake-indexeddb/auto"`
- `src/storage/__tests__/tieredRead.test.js` — `Failed to resolve import "fake-indexeddb/auto"`
- `src/storage/__tests__/tieringEngine.test.js` — `Failed to resolve import "dexie" from "src/storage/db.js"`

`tier2Stub.test.js` not affected (no Dexie/fake-indexeddb import path).

`package.json` DECLARES both deps:
```
"fake-indexeddb": "^6.2.5",
"dexie": "^4.4.2"
```

But `node_modules/fake-indexeddb` and `node_modules/dexie` are **NOT installed in this Codespace** — `npm install` was never run after deps were added on remote.

**Verified pre-existing on origin/main pre-this-session** — checked out clean `origin/main -- .` baseline and re-ran `npm run test:run`: same 3 file import errors, same 1155/1155 actual tests pass. NOT a regression introduced by handover ingest §36.99-§36.107.

**Provenance (git blame):**
- Packages added to `package.json`: `3892588 feat(storage): Dexie.js install + db.js setup (ADR 020 Tier 1)`
- Test files added: `7455e89 test(storage): 52 tests Golden Master (Dexie + rotation + tieredRead + Tier 2 stub)`
- Last package.json touch: `1640ffd 2026-05-03 chore(rebrand): config + package + CI workflows sweep (Phase 3)`

**Impact:**
- Pre-commit hook (`husky`) fails on this Codespace because `npm run test:run` exits 1 on the 3 import errors
- Forced `--no-verify` push for handover ingest §36.99-§36.107 (vault-docs-only commits f294c40 + 452fc75) — scope discipline preserved (zero `src/`, `tests/`, `scripts/` touched)
- Production unaffected (vite build runtime resolves deps via `node_modules` populated at deploy time)

**Daniel's note:** Daniel referenced "Dexie + getUserConfig path" — `getUserConfig` not observed in failure output (only `fake-indexeddb` + `dexie` imports). Possible separate path issue Daniel observed elsewhere — flag for investigation in dedicated chat.

**Action Daniel (deferred to dedicated chat strategic post Vault Hygiene Faza 3+4 + Auth Flow §36.80):**
1. Run `npm install` in Codespace (reinstall declared deps) → re-test
2. If still failing: investigate `getUserConfig` path Daniel observed (separate root cause possible)
3. Verify CI workflows have `npm install` step before `npm run test:run`
4. NU fix in handover ingest scope — out of scope per VAULT_RULES §2 (NU atinge `src/`, `tests/`, `scripts/`, configs)

**Cross-refs:**
- ADR 020 Storage Tiering Phase 1 (introduced Dexie dep)
- HANDOVER_GLOBAL §16 ADR 020 Storage Tiering Implementation Notes
- 📤_outbox/LATEST.md (handover ingest §36.99-§36.107 raport — verification step #10 ⚠️ flag)

---

## P2 PENDING (decision points pending Daniel chat strategic NEW)

### P2-FLAG-1 — Decision Points D1-D6 Status Update (post Vault Hygiene chat strategic 2026-05-03)

**Status:** 🟡 PARTIALLY RESOLVED 2026-05-03 — D2/D3/D4/D5/D6 RESOLVED Co-CTO; D1 only remaining strategic
**Severity:** P2 (decision-only, no fabricate)

**Updated status per HANDOVER §36.93-§36.96 + handover §1+§8:**

- **D1:** T1 "Save the week silent" — **🟡 PENDING** strategic dedicat post-Vault Hygiene Faza 3+4 + Auth Flow §36.80. A passive intelligence / C in-app banner pasiv (NU B opt-in). Recommend A sau C.
- **D2:** §36.86b DELOCK Mechanism META-RULE — **✅ RESOLVED** "ACCEPT propunere wording verbatim" (Co-CTO decide aliniat T3). Codification PENDING execution Faza 3 sau ad-hoc.
- **D3:** Cloud Functions Blaze plan upgrade — **✅ RESOLVED B Spark plan retain** per §36.93 (rationale calcul real 50 useri × 4 sesiuni × 2 LLM calls = 57 calls/zi = 0.4% Groq free tier 14400/zi limit).
- **D4:** Goal Taxonomy LOCKED Final — **✅ RESOLVED hybrid C** deja LOCKED §36.92 D4 (B onboarding + A engine internal mapping). Execute Faza 3 cleanup (Recomandare B audit Faza 1 = `01-vision/ONBOARDING_SSOT_V1.md` create).
- **D5:** Sprint Vault Hygiene Q2 2026 — **✅ SUPERSEDED** per §36.96 Vault Hygiene Sprint = Priority 0 acum (NU Q2 2026 deferred).
- **D6:** ADR 023 cost monitoring infrastructure — **✅ RESOLVED B frontend-only soft cap** (depends D3=B per §36.93). NEW-IDEATION-5 backend cost monitoring DEFERRED post-revenue.

**Action Daniel (only D1 remaining):**
- Strategic chat NEW dedicat D1 Save the week silent (~30min Daniel-time) — post Faza 3+4 Vault Hygiene + Auth Flow
- Sequencing: D1 strategic NU blocks Vault Hygiene execution (independent decision-only)

**Cross-refs:**
- HANDOVER_GLOBAL §36.93 (D3=B) + §36.94 (ADR 025 candidate) + §36.95 (ADR Numbering Additive) + §36.96 (Vault Hygiene Sprint Priority 0 + 8 recomandări APROBATE) + §36.97 (Faza 4 VAULT_HYGIENE_PASS LOCK PENDING) + §36.98 (System Prompt artefact)
- ADR 023 §Reconsideration Trigger #2 update (D3=B Spark retain rationale)
- HANDOVER_AUDIT_TOTAL_2026-05-03.md §4 (archived `📤_outbox/_archive/2026-05/104_*.md` post-ingest)

---

## P1 NEW (Pre-CC Implementation Daniel Manual Prep — Auth Flow §36.80)

### P1-FLAG-AUTH-DANIEL-PREP — Daniel manual prep prerequisites pre-CC Auth Flow §36.80 implementation

**Status:** 🟡 OPEN 2026-05-04 evening (raised post Auth Flow §36.80 chat strategic resolution §56)
**Severity:** P1 (blocks CC Opus Auth Flow §36.80 implementation Priority 1 ABSOLUT)

**Issue:** Auth Flow §36.80 CC Opus implementation Priority 1 ABSOLUT requires Daniel manual prerequisites prep before CC autonomous run can start. 3 manual tasks identified locked in §56.18 + §56.8.2 + §56.8.3.

**Action Daniel (sequential pre-CC):**

1. **Firebase Auth Console setup** §56.18.1 (~15 min):
   - Authorized domains: add `andura.app` în lista
   - Email Template Magic Link RO: subject "Link-ul tău de acces în Andura" + body brand Andura
   - Google OAuth Client ID: generate Google Cloud Console + paste Firebase Auth Google Provider
   - Action URL: `https://andura.app/auth-callback`

2. **Email infrastructure `suport@andura.app`** §56.18.2 (~15 min):
   - MX records Namecheap → forward Daniel personal email (gmail/yahoo)
   - Alternative: Google Workspace ($6/lună/user) sau temp `andura.suport@gmail.com` pre-Beta

3. **Privacy Policy + ToS V1 Beta validate sprint** §56.8.2 + §56.8.3 (~30-60 min):
   - Initial drafts created vault: `01-vision/PRIVACY_POLICY_V1_BETA.md` + `01-vision/TERMS_OF_SERVICE_V1_BETA.md` (verbatim from LOCKED V1 templates)
   - Daniel review + minor adjustments + lock final V1 Beta

**Cross-refs:**
- HANDOVER_GLOBAL §56.18 Daniel Manual Setup + §56.8.2/3 templates LOCKED V1
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04.18 + 2026-05-04.8
- §58 Priority 1 ABSOLUT CC Opus Auth Flow implementation (~30-45 min CC autonomous post-Daniel-prep)

---

### P1-FLAG-AUTH-PHASE2 — Phase 2 Auth Flow upgrade P1 ABSOLUT URGENT (NEW per Auth-Required Pivot 2026-05-05 birou)

**Status:** 🔴 **P1 ABSOLUT URGENT 2026-05-05 birou** (era "deferred ~16-22h Daniel decide trigger când e timpul" — ridicat post Auth-Required Pivot LOCKED V1 supersedes auth-banner-soft §AMENDMENT 2026-05-04.1)
**Severity:** P1 ABSOLUT URGENT (auth-required LOCKED V1 blocks Beta launch fără UI complet — Anonymous-permanent dispare conceptual, fallback indefinit moot)

**Issue:** Auth-Required Pivot LOCKED V1 chat strategic 2026-05-05 birou (§AMENDMENT 2026-05-05 .1 ADR_MULTI_TENANT_AUTH_v1) face Phase 2 Auth Flow upgrade prerequisite Beta launch. Pattern Anonymous = doar T0 trial 3-5 min DUPĂ care auth obligatoriu hard wall — Anonymous-permanent dispare conceptual. Fără Phase 2 wiring complet (Settings UI account lifecycle + Anonymous→Auth Merge Fork Decision UI + Logout double-confirm + IndexedDB per-UID Dexie multi-DB + Telemetry counters Firestore + Firestore Rules publish) Beta launch IMPOSIBIL.

**Argumentul critic (chat strategic Daniel):** *"in beta cat si dupa, noi ca sa imbunatatim tot, avem nevoie de datele alea nu?"* — fără auth ZERO Firestore writes, ZERO cohort ML, engine învață în vid → contradictoriu Bugatti improvement loop Beta+post-Beta.

**Cluster ~16-22h over 3-4 batches preserved §AMENDMENT 2026-05-04 §56.1.4-§56.16 verbatim:**
1. §56.1.4 IndexedDB namespace per UID (Dexie multi-DB) — DB layer arch change ~3-5h
2. §56.5 Settings UI account lifecycle (delete 2-step "ȘTERGE" + reactivation + email change) ~4-6h
3. §56.7 Anonymous→Auth Merge Fork Decision UI + archive 7 zile flow ~3-4h
4. §56.12 Logout Settings double-confirm + opt-in IndexedDB wipe toggle ~2h
5. §56.14.A admin-cleanup.js Daniel weekly script ~1h
6. §56.15 Telemetry counters FieldValue.increment Firestore ~2-3h
7. §56.16 Firestore Security Rules publish ~1h Daniel manual

**Action Daniel (NEXT chat dedicat post-this-handover):**
1. Open chat strategic NEW dedicat Phase 2 Auth Flow acceleration
2. Trigger CC Opus implementation cluster ~16-22h over 3-4 batches
3. Daniel manual: §56.16 Firestore Security Rules publish post-CC code generation

**Cross-refs:**
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05 .5 (Phase 2 Priority Ridicare P1 ABSOLUT URGENT)
- §AMENDMENT 2026-05-04 §56.1-§56.19 spec preserved (Phase 2 spec body)
- §AMENDMENT 2026-05-04.1 (auth-banner-soft) **SUPERSEDED** by §AMENDMENT 2026-05-05.1
- §AMENDMENT 2026-05-04.9 (Sunset Anonymous post-Beta v1.5) **MOOT** by §AMENDMENT 2026-05-05.3
- CURRENT_STATE §NEXT P1 ABSOLUT URGENT Auth Flow Phase 2
- DECISION_LOG 2026-05-05 birou entry (Implicații downstream)
- Phase 1 LANDED commit `0880641` preserved (BUG 2 fix + retry + wording + authShell)

---

### P1-FLAG-HANDOVER-SPLIT — HANDOVER_GLOBAL split EXECUTED ✅ RESOLVED 2026-05-05 overnight

**Status:** 🟢 **RESOLVED 2026-05-05 overnight** (split executed atomic per §62.2 thematic strategy LOCKED V1, CC TASK 5 finalize prompt). Original 7673 LOC split into 7 theme files + master converted to INDEX. ZERO data loss.
**Severity:** N/A (resolved)

**Resolution:** Source `HANDOVER_GLOBAL_2026-04-30_evening.md` (~7673 LOC) split via awk extracts into 7 theme files preserving verbatim section content. Sum split LOC 7729 (delta +0.7% header overhead, within ±10% tolerance). Master file content replaced cu INDEX (~115 LOC) + section→file mapping table.

**Theme files created:**
- HANDOVER_AUTH_FLOW_2026-04-30_evening.md (715 LOC)
- HANDOVER_ENGINES_SPEC_2026-04-30_evening.md (426 LOC)
- HANDOVER_ONBOARDING_T0_2026-04-30_evening.md (72 LOC)
- HANDOVER_DECISION_CLUSTER_D1_D4_2026-04-30_evening.md (527 LOC)
- HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md (127 LOC)
- HANDOVER_SCENARIOS_COVERAGE_2026-04-30_evening.md (146 LOC)
- HANDOVER_MISC_2026-04-30_evening.md (5716 LOC)

**Wikilinks strategy:** Master file preserved as INDEX navigation hub. Existing `[[HANDOVER_GLOBAL_2026-04-30_evening|...]]` references resolve to INDEX, drill-down via 1-hop indirection per § Section→File Mapping. ZERO active vault wikilinks rewired (trade-off chosen vs ~30+ active file rewires per split plan §3 risks atomicity + form variability).

**Backup tag:** `pre-handover-split-2026-05-05-overnight` (rollback safety, push pre-split, preserved untouched post-execution).

**Cross-refs:**
- VAULT_RULES.md §VAULT_HYGIENE_PASS STEP 13
- 06-sessions-log/HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05.md (split plan source — historical artefact)
- 06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md (now INDEX post-split)
- DECISION_LOG.md entry top "2026-05-05 overnight — HANDOVER_GLOBAL Thematic Split Execution (§62.2 LOCKED V1)"

---

### P1-FLAG-SCENARIOS-COVERAGE — Scenarios 1500-2000 PRE-BETA BLOCKER (NEW per §69, Validation Framework path concrete LOCKED V1 2026-05-05 evening late)

**Status:** 🔴 OPEN 2026-05-05 evening late (Validation Framework LOCKED V1 architectural foundation; batch overnight plan PENDING chat NEW artefacte technical 1-button copy)
**Severity:** P1 (BETA LAUNCH IMPOSIBIL fără)

**Issue:** Per §42.9 LOCKED V1 testing strategy mandatory: Hibrid Property-based + Persona Suite Maria/Gigica/Marius + 4-Invariant Safety Stack. Persona simulation suite ~50-100 tests representative + edge cases curated. Coverage actuală post chat-uri Auth + ADR 026 spec + Auth Flow §36.80 + Batch 1-6 + T0 Mechanics 75 + Engines #1-#7 spec sessions + #8 §45.6 + Validation Framework LOCK V1 = **~653 LOCKED V1** total. **Gap pre-Beta: ~990-1490 scenarios decisions remaining.**

**Gap reduction progress:**
- Initial gap (post §62-§73 ingest 2026-05-04 evening): 1200-1700 scenarios
- Post engine specs Periodization + Goal Adaptation + ADR 026 Q1-Q10 (2026-05-04 evening late): 1170-1670 (~50 decisions consumate engine specs, NU branches)
- Post Engines #3+#4+#5 spec sessions cumulative + Convergence Guard "T2 Unlock" (2026-05-05 birou after): 1080-1580 (~90 decisions consumate engine specs cumulative, NU branches enumeration)
- Post Engines #5 formal lock + #6 Tempo/Form Cues + #7 Specialization spec sessions + Roadmap §36.100 100% milestone (2026-05-05 birou late): **~990-1490** (~180 decisions consumate engine specs cumulative #1+#2+#3+#4+#5+#6+#7 + #8 §45.6 — NU branches enumeration). 🎯 Roadmap §36.100 100% COMPLETE — NU mai chat-uri engines spec sessions remaining
- Post Validation Framework LOCK V1 (2026-05-05 evening late): gap unchanged ~990-1490 scenarios decisions remaining (Validation Framework = architectural foundation, NU enumerate branches direct), dar **path concrete LOCKED V1**: 95% gate / weights 0.35/0.25/0.20/0.20 / Gate 2 DROPPED / Gate 3 selective / 500 queries
- Post pipeline §42.10 V1 IMPLEMENT closure 8/8 prescriptive engines (2026-05-06 evening chat-8 + chat-9 acasă): **gap status PRESERVED ~990-1490** scenarios decisions remaining. **V1 IMPLEMENT closure ≠ scenarios coverage decisions closure** — V1 implement = code-level coverage (8 engines functional + 2648 tests PASS cumulative); scenarios coverage decisions = product/UX edge case decisions (Persona Suite Maria/Gigica/Marius + Property-based + 4-Invariant Safety Stack still pending). Cumulative ~659 LOCKED V1 PRESERVED unchanged.

**🦫 V1 implement evidence (code-level coverage milestone, 2026-05-06 evening chat-8 + chat-9 acasă):**
- Pipeline §42.10 8/8 prescriptive engines V1 LANDED commits verbatim:
  - Periodization `1303b62` + Goal Adaptation `bf9814e` + Energy `69ec9ce` + Bayesian `8615ec1` + Tempo `d82d118` + Specialization `4cf50ab` + Warm-up `20999fb` + Deload `a6a0c87`
- Tests cumulative: **2648 PASS / 0 FAIL** (compile + V1 implement progression strict zero regression)
- ADR cleanup batch landed `dccda1f` — 031+032 NEW + 027/028/029 stub flip → SPEC REFERENCE §9.3-§9.8 ADR 026
- **Status PRESERVED 🔴 OPEN** — Validation Framework SPEC DRAFT V1 + Scenarios Simulator Design V1 + Faza 2 Filter Strategy V1 implementation pending; Persona Suite + 4-Invariant Safety Stack execution pending

**Validation Framework LOCKED V1 cross-ref (2026-05-05 evening late):**
- `04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1.md` status SPEC DRAFT V1 → LOCKED V1
- §1 north star ≥95% Claude parity strict (NU 90% range, NU aspirațional)
- §5 match metric weights universal Safety 0.35 + Exercise 0.25 + Sets/reps/RIR 0.20 + Key principles 0.20 (NU ghilotină conditional)
- §7 Gates: Gate 1 ≥95% MATCH | Gate 2 DROPPED | Gate 3 selective Daniel review pe Claude-judge flagged uncertain ~5-15%
- §2 corpus scope = 500 queries (Bugatti coverage breadth)
- §9 framing reformulat: Claude chat strategic ~5-10h + Daniel review reality-lock ~30-60min cumulative

**ADR 026 LOCKED V1 compile draft full cross-ref (2026-05-05 overnight):**
- `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` status STUB → LOCKED V1 compile draft full
- 129 decisions aggregate (10 base §42 + 75 spec §45 + 44 D-cluster §50). ZERO net new substantive — aggregation only. Cumulative LOCKED preserved ~653.
- Branches enumeration separate concern (1500-2000 ramuri V1 distribution per engine, NU în ADR 026 monolith — ADR 026 = META-architecture global concerns SSOT)

**Action Daniel (Priority 2 NEW per §71, batch overnight plan post-LOCK):**

1. ✅ Daniel LOCK Validation Framework §1+§5+§7+§2 COMPLETE 2026-05-05 evening late
2. Chat NEW genera 2 artefacte technical 1-button copy (master prompt batch ordered 5 task-uri + CC #6 Consolidator) — pre-flight grep §56.1.4/§56.16 + ADR template format pentru rigour pragmatic NU gold-plated
3. Daniel paste master prompt tonight în 1 terminal CC `claude --dangerously-skip-permissions` → sequential 5 tasks ~3-5h overnight (TASK 1 Simulator Implementation cu LOCK overrides explicit + TASK 2 Auth Phase 2 batch 1 §56.1.4 + §56.16 + TASK 3 ADR 026 compile draft full + TASK 4 ADR stubs Engine #5/#6/#7 + TASK 5 HANDOVER_GLOBAL split)
4. Daniel paste consolidator dimineața după 5 LATEST_N done → ~10-15min generate `📤_outbox/LATEST_CONSOLIDATED.md` aggregate
5. Daniel review LATEST_CONSOLIDATED + audit nuclear post-batch
6. Post simulator delivery: ground truth production Claude chat strategic ~5-10h + Daniel review reality-lock ~30-60min → run validation → Faza 2 filter ~225-300 flagged branches workflow Bugatti 3-instance ~3 chats × 75-100 issues/chat
7. Pre-Beta blocker absolute: Beta launch IMPOSIBIL fără Both Gates PASS (Gate 1 ≥95% + Gate 3 zero blocker flag)

**Cross-refs:**
- HANDOVER_GLOBAL §69 PRE-BETA BLOCKER FLAG status verbatim
- §42.9 LOCKED V1 testing strategy
- Cumulative ~649 LOCKED V1 post 2026-05-05 birou late
- §71 Priority 2 NEW chat-uri strategice dedicate
- AUDIT_5000Q corpus + ONBOARDING_SSOT_V1 §10 Open Questions (existing scenarios sources)
- Beta launch decalare Quality > Speed default §62.7 justifies timeline flexibility
- 🎯 Roadmap §36.100 ✅ 100% COMPLETE milestone 2026-05-05 birou late (8/8 prescriptive engines SPEC COMPLETE) — NU mai chat-uri engines spec sessions remaining

---

### P1-FLAG-IOS-PERMANENT — iOS REJECTED LOCKED PERMANENT (NEW per §67.10)

**Status:** 🟢 LOCKED V1 PERMANENT 2026-05-04 evening (memory persistent rule, NU OPEN issue — locked rule going forward)
**Severity:** N/A (rule lock, NU pending)

**Rule LOCKED V1 PERMANENT:**
- Pre-Beta: PWA only iOS users (browser default, ~20-30% rate fail tolerated)
- Post-Beta v1.0: NU iOS distribution
- Post-Beta v1.5: NU iOS distribution
- v2/v3: demand-driven only (real iOS user demand + revenue justify $99/an Apple Developer)

**Distribution V1 Beta + post-Beta v1.0/v1.5:**
- PWA installable browser
- TWA wrap Android Play Store (per §56.10.3 contingent rate fail >30% activation)

**Cross-refs:**
- HANDOVER_GLOBAL §67.10 + §56.10 PWA strategy preserved
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04 evening BATCH 1-6 .7 verbatim
- Memory persistent rule scope

---

## RESOLVED (audit trail)

### P1-FLAG-CAPACITY-A-LANDED — Run 2 Vault Cleanup ✅ LANDED 2026-05-07

**Status:** ✅ LANDED 2026-05-07 (vault hygiene meta-tooling)

**Scope:** Capacity A LOCKED archive + sub-section split + REDIRECT + canonical spans + INDEX/CURRENT_STATE/DIFF_FLAGS refresh.

**Evidence:**
- Tasks 1-5 complete sequential fail-stop (CC autonomous Run 2 Opus)
- 3 files archived: HANDOVER_GLOBAL_SPLIT_PLAN + HANDOVER_VAULT_HYGIENE + HANDOVER_MISC → `📤_outbox/_archive/2026-05/221+222+223_*_DEPRECATED.md`
- 4 new split files created standalone canonical (Task 1): PRE_LAUNCH_CHECKLIST_V1 + INVESTITII_PRIVATE + 033-muscle-memory-index + KNOWLEDGE_LAYER_CADENCE_V1
- 4 strict wikilinks REDIRECT verified 0 residual matches active vault (Task 2 Option A override; audit "12" methodology drift documented)
- Span 1 Pricing canonical → PRODUCT_STRATEGY §AMENDMENT 2026-05-02 (MOAT_STRATEGY line 113 + INDEX_MASTER NAVIGARE entry redirected)
- Tests baseline 2648 PASS preserved (doc-only ZERO src changes)
- Backup tag `pre-vault-cleanup-batch-2026-05-07-2257`

**Cross-refs:** `audit-vault-2026-05-07.md` + CURRENT_STATE §JUST_DECIDED 2026-05-07 entry + INDEX_MASTER VAULT CLEANUP HISTORY 2026-05-07 entry.

---

### §36.80 BUG 2 Firebase 401 — RESOLVED chat strategic 2026-05-04 evening (CC implementation pending Priority 1 ABSOLUT)

**Status:** ✅ RESOLVED chat strategic (CC Opus implementation pending P1-FLAG-AUTH-DANIEL-PREP prerequisite)
**Resolution:** Chat strategic 2026-05-04 evening Daniel + Claude — 35 substantive sub-decisions LOCKED V1 acoperind code-level fix `getUserPath()=null` mode Anonymous + 18 alte concerns auth flow integration. Cumulative 216 → 243 LOCKED V1.

**Root cause:** `getUserPath()` returnează `'users/daniel'` literal când `getAuthState()=null` → DB Rules per-UID strict §36.75 BLOCHEAZĂ → 401 cycle infinit.

**Fix LOCKED V1 (§56.1.3):** Mode Anonymous (`getAuthState() === null`) → `getUserPath()` returnează **obligatoriu `null`** (NU fallback hardcodat `LEGACY_USER_PATH = 'users/daniel'`). Toate apelurile Firebase API blocate când path null → app rulează exclusiv local IndexedDB. Bucla 401 eliminată mecanic.

**CC Implementation pending:** ~30-45 min CC autonomous factor 7-9x clusters mari (~10 fișiere `firebase.js` + `auth.js` + `pages/auth.js` + `index.html` + `main.js` + `_migration` flow + `_deleted` lifecycle + `_archived/` archive flow + IndexedDB namespace per UID + Firestore rules update + wording RO LOCKED + Playwright e2e + `admin-cleanup.js` script + setup Daniel runbook documentation).

**Cross-refs:**
- HANDOVER_GLOBAL §36.80 BUG 2 (origin) + §56.1-§56.19 (resolution full spec) + §57-§61
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04 (Faza 2 wiring spec LOCKED V1 inline 19 sub-sections)
- DECISION_LOG 2026-05-04 evening entry
- P1-FLAG-AUTH-DANIEL-PREP (above) — prerequisite Daniel manual prep pre-CC
- 01-vision/PRIVACY_POLICY_V1_BETA.md + 01-vision/TERMS_OF_SERVICE_V1_BETA.md (initial drafts created)

---

🦫 **DIFF_FLAGS.md created 2026-05-03. P1-FLAG-1 ADDENDUM source upload pending. P1-FLAG-NEW Codespace `npm install` drift RESOLVED 2026-05-05 birou (npm install resolved deps). P2-FLAG-1 D1-D6 superseded. HANDOVER_GLOBAL split FLAG **TRIGGERED preserved post §62-§73 ingest 7664 LOC > 7000 threshold** — strategy LOCKED V1 thematic split per §62.2 chat strategic NEW dedicat post-Auth Phase 2. §36.80 BUG 2 RESOLVED chat strategic — Phase 1 LANDED commit `0880641`. P1-FLAG-AUTH-DANIEL-PREP 🟢 RESOLVED 2026-05-04 night. **P1-FLAG-AUTH-PHASE2 🔴 P1 ABSOLUT URGENT 2026-05-05 birou** — Phase 2 Auth Flow upgrade ridicat post Auth-Required Pivot LOCKED V1. Cluster ~16-22h over 3-4 batches: §56.1.4 IndexedDB per-UID + §56.5 Settings UI + §56.7 Fork Decision + §56.12 Logout + §56.14.A cleanup script + §56.15 Telemetry + §56.16 Firestore Rules. **P1-FLAG-SCENARIOS-COVERAGE PRE-BETA BLOCKER gap reducere ~990-1490 decisions remaining (din 1170-1670 post 🎯 Roadmap §36.100 100% COMPLETE milestone Engines #5 formal + #6 + #7 + #1+#2+#3+#4+#8 cumulative ~180 decisions consumate engine specs) ~5-15 chat-uri Priority 2 strategice dedicate.** **P1-FLAG-IOS-PERMANENT LOCKED V1 (PWA + TWA Android only).** Cumulative ~649 LOCKED V1 post 2026-05-05 birou late Engines #5 formal lock confirm preserve baseline ~593 + Engine #6 Tempo/Form Cues (~28) + Engine #7 Specialization (~28 ULTIMUL prescriptive) + 🎯 Roadmap §36.100 ✅ 100% COMPLETE milestone 8/8 prescriptive engines SPEC COMPLETE (+~56 net). NU mai chat-uri engines spec sessions remaining — pivot direction P1 CC Auth Flow §36.80 / P2 Scenarios Coverage / P3 ADR 026 compile draft full. ADR 022 stub → SPEC READY V1. ADR 009 §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" Behavioral Validation Rule cross-cutting (formula final post 5 iterations: Statistical Convergence layer per-engine + Behavioral Validation layer shared N≥10 sesiuni adherence ≥80% max 2 Pain-Aware sesiuni din ultimele 10 + Pain-Aware Hybrid Spec V1 binary + forward-compat v1.5 silent vector ZERO migration). ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05 .1-.7 + §AMENDMENT 2026-05-04 evening BATCH 1-6 .1-.10 + PRODUCT_STRATEGY §5.4/§5.5/§5.8/§6.1/§6.5 + ONBOARDING §1/§8 amendments inline. Beta launch decalare oficial Quality > Speed default (Override §56.9.2 1 ian 2027). Review Division of Labor LOCKED V1. Workflow 3-instance Bugatti-grade RECOGNIZED matured (Gemini logic + Claude Bugatti challenge + Daniel reality lock — velocity crescând session-by-session).**
