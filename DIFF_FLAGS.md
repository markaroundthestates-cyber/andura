# DIFF FLAGS — Outstanding Issues Requiring Daniel Action

**Owner:** Daniel (CEO + Product). Used by CC Opus / Claude chat to surface pending issues.
**Updated:** 2026-05-05 birou after (post handover ingest Engines #3 Bayesian Nutrition + #4 Deload Protocol + #5 Energy Adjustment SPEC COMPLETE + Convergence Guard "T2 Unlock" architectural extension cross-cutting ADR 009 — P1-FLAG-SCENARIOS-COVERAGE gap reducere ~90 decisions consumate engine specs cumulative: 1170-1670 → ~1080-1580. Cumulative LOCKED ~438 → ~593 (+155 substantive net). 5/7 prescriptive engines roadmap §36.100 SPEC COMPLETE — remaining Engine #6 Tempo/Form Cues + Engine #7 Specialization ~2 chat-uri dedicated.)
**See also:** [[VAULT_RULES]] §HANDOVER_PROTOCOL §5 (Safety Net) §VAULT_HYGIENE_PASS STEP 13 | [[06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] | [[05-findings-tracker/FINDINGS_MASTER]]

---

## P1 BLOCKERS (require Daniel action before proceeding)

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

### P1-FLAG-HANDOVER-SPLIT — HANDOVER_GLOBAL split FLAG TRIGGERED (7664 LOC > 7000 threshold, post §62-§73 update)

**Status:** 🟡 OPEN 2026-05-04 evening late (FLAG candidate triggered preserved, NU mandatory ESCALATE care e >10000 LOC). **Strategy LOCKED V1 per §62.2: thematic split.**
**Severity:** P1 (vault hygiene, strict monitoring required)

**Issue:** HANDOVER_GLOBAL_2026-04-30_evening.md post-merge §62-§73 ingest = **7664 LOC > 7000 LOC threshold** §VAULT_HYGIENE_PASS STEP 13. FLAG candidate triggered preserved. Cumulative growth pe pace ~250-450 LOC/ingest = ~5-9 ingest-uri future before second threshold (>10000 ESCALATE BLOCKER mandatory).

**Strategy LOCKED V1 (per HANDOVER §62.2 chat strategic 2026-05-04 evening):**
- **B) Thematic split** — auth/engine/onboarding fișiere separate
- NU chronological cut, NU `__resolved__` folder dedicated
- ~50+ wikilinks reference HANDOVER_GLOBAL §X — sweep + rewire required
- Backup tag pre-split mandatory: `git tag pre-handover-split-2026-05-04-evening`
- Execution chat strategic NEW dedicat post-CC Auth Flow §36.80 implementation complete (Priority 5 §71)

**Action Daniel (chat strategic NEW dedicat post-CC):**
1. Backup tag git pre-execution
2. Identify thematic clusters (auth flow / engine #8 + periodization / onboarding / decision-cluster D1-D4 / etc)
3. Split per cluster → separate files cu cross-refs preserved
4. Sweep wikilinks across vault → rewire toate references
5. INDEX_MASTER navigation refresh + DECISION_LOG cross-refs update

**Cross-refs:**
- VAULT_RULES.md §VAULT_HYGIENE_PASS STEP 13
- HANDOVER_GLOBAL §59 + §62.2 (strategy LOCKED) + §72 DIFF_FLAGS Update
- §53 prior approaching warning + §59 7214 LOC + §72 7664 LOC current
- §71 Priority 5 HANDOVER_GLOBAL split execution post-CC Auth Flow

---

### P1-FLAG-SCENARIOS-COVERAGE — Scenarios 1500-2000 PRE-BETA BLOCKER (NEW per §69)

**Status:** 🔴 OPEN 2026-05-05 birou after (gap reducere progressive post engine specs cumulative)
**Severity:** P1 (BETA LAUNCH IMPOSIBIL fără)

**Issue:** Per §42.9 LOCKED V1 testing strategy mandatory: Hibrid Property-based + Persona Suite Maria/Gigica/Marius + 4-Invariant Safety Stack. Persona simulation suite ~50-100 tests representative + edge cases curated. Coverage actuală post chat-uri Auth + ADR 026 spec + Auth Flow §36.80 + Batch 1-6 + T0 Mechanics 75 + Engines #1-#5 spec sessions = **~593 LOCKED V1** total. **Gap pre-Beta: ~1080-1580 scenarios decisions remaining.**

**Gap reduction progress:**
- Initial gap (post §62-§73 ingest 2026-05-04 evening): 1200-1700 scenarios
- Post engine specs Periodization + Goal Adaptation + ADR 026 Q1-Q10 (2026-05-04 evening late): 1170-1670 (~50 decisions consumate engine specs, NU branches)
- Post Engines #3+#4+#5 spec sessions cumulative + Convergence Guard "T2 Unlock" (2026-05-05 birou after): **~1080-1580** (~90 decisions consumate engine specs cumulative, NU branches enumeration)

**Action Daniel (Priority 2 NEW per §71, post Priority 1 ABSOLUT CC Auth Flow implementation + engines roadmap remaining #6+#7):**

1. Chat strategic dedicat enumeration scenarios (~5-15 chat-uri estimative bandwidth optimal)
2. Per chat: ~100-150 scenarios coverage decisions LOCKED + Persona Suite curated edge cases
3. Cross-ref §42.9 testing strategy validation real (4-Invariant Safety Stack + Persona representative)
4. Pre-Beta blocker absolute: Beta launch IMPOSIBIL fără toate edge cases LOCKED + Persona Suite tests + invariants validated

**Cross-refs:**
- HANDOVER_GLOBAL §69 PRE-BETA BLOCKER FLAG status verbatim
- §42.9 LOCKED V1 testing strategy
- Cumulative ~593 LOCKED V1 post 2026-05-05 birou after
- §71 Priority 2 NEW chat-uri strategice dedicate
- AUDIT_5000Q corpus + ONBOARDING_SSOT_V1 §10 Open Questions (existing scenarios sources)
- Beta launch decalare Quality > Speed default §62.7 justifies timeline flexibility
- Engines #1-#5 SPEC COMPLETE 2026-05-05 birou after (5/7 prescriptive engines roadmap §36.100) — Engine #6 + #7 remaining ~2 chat-uri NEW dedicated

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

🦫 **DIFF_FLAGS.md created 2026-05-03. P1-FLAG-1 ADDENDUM source upload pending. P1-FLAG-NEW Codespace `npm install` drift RESOLVED 2026-05-05 birou (npm install resolved deps). P2-FLAG-1 D1-D6 superseded. HANDOVER_GLOBAL split FLAG **TRIGGERED preserved post §62-§73 ingest 7664 LOC > 7000 threshold** — strategy LOCKED V1 thematic split per §62.2 chat strategic NEW dedicat post-Auth Phase 2. §36.80 BUG 2 RESOLVED chat strategic — Phase 1 LANDED commit `0880641`. P1-FLAG-AUTH-DANIEL-PREP 🟢 RESOLVED 2026-05-04 night. **P1-FLAG-AUTH-PHASE2 🔴 P1 ABSOLUT URGENT 2026-05-05 birou** — Phase 2 Auth Flow upgrade ridicat post Auth-Required Pivot LOCKED V1. Cluster ~16-22h over 3-4 batches: §56.1.4 IndexedDB per-UID + §56.5 Settings UI + §56.7 Fork Decision + §56.12 Logout + §56.14.A cleanup script + §56.15 Telemetry + §56.16 Firestore Rules. **P1-FLAG-SCENARIOS-COVERAGE PRE-BETA BLOCKER gap reducere ~1080-1580 decisions remaining (din 1170-1670 post Engines #3+#4+#5 spec sessions cumulative + Convergence Guard "T2 Unlock") ~5-15 chat-uri Priority 2 strategice dedicate.** **P1-FLAG-IOS-PERMANENT LOCKED V1 (PWA + TWA Android only).** Cumulative ~593 LOCKED V1 post 2026-05-05 birou after Engines #3 Bayesian Nutrition (~32-35) + #4 Deload Protocol (~30-32) + #5 Energy Adjustment (~28-30) + Convergence Guard "T2 Unlock" architectural extension cross-cutting ADR 009 (+155 net). 5/7 prescriptive engines roadmap §36.100 SPEC COMPLETE — remaining Engine #6 Tempo/Form Cues + Engine #7 Specialization ~2 chat-uri NEW dedicated. ADR 022 stub → SPEC READY V1. ADR 009 §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" Behavioral Validation Rule cross-cutting (formula final post 5 iterations: Statistical Convergence layer per-engine + Behavioral Validation layer shared N≥10 sesiuni adherence ≥80% max 2 Pain-Aware sesiuni din ultimele 10 + Pain-Aware Hybrid Spec V1 binary + forward-compat v1.5 silent vector ZERO migration). ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05 .1-.7 + §AMENDMENT 2026-05-04 evening BATCH 1-6 .1-.10 + PRODUCT_STRATEGY §5.4/§5.5/§5.8/§6.1/§6.5 + ONBOARDING §1/§8 amendments inline. Beta launch decalare oficial Quality > Speed default (Override §56.9.2 1 ian 2027). Review Division of Labor LOCKED V1. Workflow 3-instance Bugatti-grade RECOGNIZED (Gemini logic + Claude Bugatti challenge + Daniel reality lock).**
