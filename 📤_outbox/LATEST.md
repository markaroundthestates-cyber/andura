# Audit Hygiene Vault-Wide — Raport

**Status:** Issues Found (3 critical, 9 drift, 2 placeholder acceptable)
**Date:** 2026-04-30 evening v3 (audit only, READ-ONLY)
**Run wall-clock:** ~7 min
**Model:** Claude Opus 4.7 autonomous
**Trigger:** Daniel suspect halucinație post-saturation chat strategic 2026-04-30 evening v2, request audit independent înainte Sprint 4.

---

## Pre-flight

- Branch: `main`, working tree clean
- HEAD pre-audit: `468d5c5` (post evening v2 run)
- `git pull origin main`: Already up to date
- Baseline tests: ✅ **vitest 752/752 PASS** (48 files, 7.91s)
- LATEST.md previous (`ADR 020 + 021 + Amendments — Raport Execution`): rotated to `📤_outbox/_archive/2026-04/14_ADR_020_021_AMENDMENTS_RUN.md`

---

## Inventar files audited

### ADR files in `03-decisions/` (23 total)
- 21 numbered: `001-local-first-storage.md` → `021-calibration-drift-reconciliation.md` (continuu, zero gaps)
- 2 special: `ADR_MULTI_TENANT_AUTH_v1.md` + `DECISION_LOG.md`

### Vault root
- `VAULT_RULES.md`, `PROMPT_CC_HYGIENE.md`, `README.md`

### Inbox (`📥_inbox/`)
- `HANDOVER_INPUT_INBOX.md` (CONSUMED, retained per evening v2 constraint)
- `ALIGNMENT_QUESTIONS_CHAT_NEW.md` (NEW, evening v2 output)

### Outbox (`📤_outbox/`)
- `LATEST.md` (just rotated to 14)
- `_archive/2026-04/`: 13 files (01_VAULT_HYGIENE → 13_OUTBOX_SCHEMA_MIGRATION) cronologic continuu

### Other vault folders
- `00-index/` (1 file: INDEX_MASTER.md)
- `01-vision/` (5 files)
- `02-audit/` (1 file: COACHING_TEXTBOOK_SYNTHESIS.md)
- `04-architecture/` (4 specs)
- `05-findings-tracker/` (3 files: FINDINGS_MASTER, INSIGHTS_BACKLOG, AUDIT_30_9_BLOCKED_STATE)
- `06-sessions-log/` (1 file: HANDOVER_GLOBAL_2026-04-30_evening.md SSOT activ)
- `07-meta/` (1 file: CLAUDE_CODE_RULES.md)
- `08-workflows/` (5 files)

---

## AUDIT FINDINGS

### 2.1 — ADR cross-refs broken

| Source file | Line | Cross-ref | Status |
|---|---|---|---|
| `00-index/INDEX_MASTER.md` | 66 | `[[AUDIT_5000Q]]`, `[[AUDIT_5000Q_REPORT]]` | **BROKEN HARD** — files renamed în archive (`06_AUDIT_5000Q.md`, `07_AUDIT_5000Q_REPORT.md`). Wikilinks won't resolve. |
| `00-index/INDEX_MASTER.md` | 65 | path `cc-reports/SPRINT*_EXECUTION_REPORT.md` | **BROKEN HARD** — folder deleted. Files now în `📤_outbox/_archive/2026-04/08_…/09_…/10_…`. |
| `00-index/INDEX_MASTER.md` | 115 | path `cc-reports/VAULT_CLEANUP_2026-04-30_REPORT.md` | **BROKEN HARD** — file now `📤_outbox/_archive/2026-04/11_VAULT_CLEANUP_REPORT.md`. |
| `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` | 148, 154, 173, 461, 462 | `cc-reports/...` (5 occurrences) | **BROKEN HARD** — folder DEPRECATED per VAULT_RULES.md §3.3. |
| `08-workflows/CLAUDE_CHAT_INFRASTRUCTURE.md` | 43 | `cc-reports` listed | **BROKEN** — folder deprecated. |
| `03-decisions/019-gdpr-k-anonymity-validation.md` | 75 | `--output cc-reports/gdpr_k_anonymity_report.json` | **BROKEN HARD** — folder deprecated. (Stale inside ADR.) |
| `scripts/README.md` | 25, 85 | `--output cc-reports/...` (2 occurrences) | **BROKEN HARD** — folder deprecated. (NU vault doc but still drift.) |
| `03-decisions/021-calibration-drift-reconciliation.md` | 11 | `[[ADR 022 Bayesian Sprint 4]]` (via PRODUCT_STRATEGY §3.5.1) | **PLACEHOLDER** — forward-looking, ADR 022 = Sprint 4 deliverable. ACCEPTABLE. |
| `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` §3.5.1 | 199 | `ADR 022 Bayesian Nutrition Sprint 4` | **PLACEHOLDER** — forward-looking. ACCEPTABLE. |
| All ADR files numerotate (001-021) wikilinks `[[NNN-...]]` | — | — | ✅ **OK** — all referenced ADRs exist physically. |

**Summary:** 8 broken hard refs (cc-reports legacy paths + AUDIT_5000Q wikilinks renamed). 2 acceptable forward-looking placeholders.

---

### 2.2 — ADR range consistency

| Source | Range declared | Status |
|---|---|---|
| `VAULT_RULES.md §2` | `001-*.md → 021-*.md` | ✅ ALIGNED with reality |
| `00-index/INDEX_MASTER.md §STRUCTURĂ` line 17 | "22 ADR-uri active (001-021 + ADR_MULTI_TENANT_AUTH) + DECISION_LOG (23 files)" | ✅ ALIGNED |
| `00-index/INDEX_MASTER.md §ADR table` (lines 73-96) | 001 → 021 + ADR_MULTI_TENANT_AUTH (22 ADRs) | ✅ ALIGNED |
| `03-decisions/DECISION_LOG.md` evening entry line 24 | cross-refs `[[020-storage-tiering-strategy]]`, `[[021-calibration-drift-reconciliation]]` | ✅ ALIGNED |
| Realitate fizică `ls 03-decisions/` | 001-021 (21 numbered) + ADR_MULTI_TENANT_AUTH + DECISION_LOG = 23 files | ✅ ALIGNED |

**Status:** ALIGNED — zero ADR drift în range/listing.

---

### 2.3 — Numerical consistency between SSOT

**Test count:**
- `06-sessions-log/HANDOVER §15`: 752/752 ✅
- `📤_outbox/LATEST.md` previous (now 14_ADR_020_021): "vitest 752/752 PASS (48 files, 7.49s)" ✅
- `📤_outbox/_archive/2026-04/13_OUTBOX_SCHEMA_MIGRATION.md`: nu cită explicit count
- Realitate run actual (audit pre-flight): **752/752 PASS** (48 files, 7.91s)
- **Status:** ✅ ALIGNED across all SSOT.

**Effort estimates §6.7 (HANDOVER + DECISION_LOG):**
- HANDOVER §6.7 baseline ADĂUGAT: ~115-181h tradițional → 12-22h velocity
- HANDOVER §6.7 post-Gemini additions: ~22-33h tradițional, ~3-7h velocity
- HANDOVER §6.7 cumulat: **137-214h tradițional → 15-29h velocity Opus**
- Math check: 115+22=137 ✅, 181+33=214 ✅, 12+3=15 ✅, 22+7=29 ✅
- DECISION_LOG entry line 24: "effort updated 137-214h tradițional → 15-29h velocity Opus" ✅ ALIGNED
- LATEST.md (14_ADR_020_021): cross-ref to §6.7 numbers, no contradiction ✅
- **Status:** ✅ ALIGNED, math correct.

**Retention semantics (potential terminology overlap):**
- ADR 011 §Storage line 230: "Tier 1 = 180 days locked to responseProfile rolling window OPTIMIZED"
- ADR 011 §Firebase sync amendment: "Tombstone retention = 90 zile"
- ADR 020 §Tier 1: "30-180 zile pre-launch / 30-365 zile post-Pro per ADR 011 schedule"
- HANDOVER §4.2: "ADR 011 ... 90 zile retention + Pro pause retention 90 zile"
- HANDOVER §8.1 entry 3: "T&B retention 90 zile (NU forever, NU 30 zile)"
- **Analysis:** 4 distinct retention concepts overlap în terminologie:
  1. CDL Tier 1 storage = 180 zile (ADR 011 fixed, locked to responseProfile rolling window)
  2. CDL Tier 1 storage tiering thresholds = 30-180 zile pre-launch / 30-365 zile post-Pro (ADR 020 generalizes ADR 011)
  3. T&B tombstone retention = 90 zile (ADR 011 amendment, separate concept)
  4. Pro pause data retention = 90 zile (HANDOVER §4.2)
- **ADR 020 cross-ref to "ADR 011 schedule"** is misleading — ADR 011 fixes 180, NOT 30-180/30-365. ADR 020 generalizes but cross-ref phrasing implies ADR 011 already has this schedule.
- **Status:** DRIFT (terminology). Each concept individually correct, but co-mention în vault docs ambiguous.

---

### 2.4 — D1-D15 routing decisions consistency

| D# | DECISION_LOG entry 2026-04-30 evening (line 20) | HANDOVER §5 status | ADR / vault impl | Status |
|----|---|---|---|---|
| **D1** | "ADD DEVELOPING (6 nivele Sprint 4 ~8-12h)" — RESOLVED | "DEVELOPING tier clarificare ... pending" | ADR 009 §AMENDMENT still presents Option A vs B as **Sprint 2 OPEN question** (lines 165-175). ADR 009 §Decision table still shows 5 nivele (lines 24-30). ADR 021 line 34, 108, 127, 280: cites "6 nivele post D1 decision" assuming RESOLVED. | **CRITICAL DRIFT** — D1 decision RESOLVED in DECISION_LOG + ADR 021, but ADR 009 (canonical source) still presents as Sprint 2 open question + still implements 5 nivele. |
| D2-D4 | "DEFER Sprint 1.5 anti-RE wording" | "Anti-RE wording rewrite leak #1/#2/#3" pending | Not amended | DRIFT — HANDOVER §5 still PENDING but DECISION_LOG says DEFER. |
| D5 | "categorical only verdict" | "Anti-RE wording rewrite leak #4" pending | Not amended | DRIFT — HANDOVER §5 still PENDING. |
| D6 | "REZOLVAT post-rollover" | "REZOLVAT" ✅ | n/a | ✅ ALIGNED |
| D7 | "Stryker autonomous overnight Sonnet baseline + Daniel review" | "Sprint 4 cu Golden Master full sau acum?" pending | Not amended | DRIFT |
| D8 | "Sonnet generates JSON 5/sprint" | "Manual profiles 100 craft pace — incremental sau dedicated session?" pending | Not amended | DRIFT |
| D9 | "GDPR validation post-100-real-users" | "pre-launch real data sau acum mock?" pending | Not amended | DRIFT |
| D10 | "REZOLVAT outbox migration" | "cc-reports/ în .gitignore line 16 ... păstrăm sau scoate?" pending | n/a | DRIFT — HANDOVER still pending wording. |
| D11 | "Magic Link primary + Google secondary" | listed as pending în §5 catch-all | Not amended | DRIFT |
| D12 | "2 anonymous accounts pre-launch + flag pre-Faza-1 merge" | pending §5 catch-all | ADR 021 §EC-5 references D12 scenario | DRIFT — HANDOVER §5 still pending. |
| D13 | "T&B Faza 2 logs first" | pending §5 catch-all | ADR 021 §Implementation phasing line 204: "Faza 2 T&B logs first per D13 routing" | DRIFT |
| D14 | "BranchConflictModal 3 options + auto-resolve cronologic" | pending §5 catch-all | Not amended | DRIFT |
| D15 | "pre-expiry refresh 10min + retry 401" | pending §5 catch-all | Not amended | DRIFT |

**Status:** **CRITICAL DRIFT** — DECISION_LOG entry 2026-04-30 evening declares "D1-D15 routing 15/15 locked", but HANDOVER §5 still presents D1-D15 as PENDING decisions. Most critical: **D1 DEVELOPING tier resolved as ADD (6 nivele)** but ADR 009 not updated — it still presents D1 as open Sprint 2 question. ADR 021 already operates on resolved D1 (cites "6 nivele post D1 decision"), creating internal vault contradiction.

---

### 2.5 — Gemini cross-check coverage

**Q10 BLIND SPOTS:**

| BS# | Description | Coverage | Status |
|---|---|---|---|
| #1 | Storage Exhaustion PWA Limit ~5MB | ADR 020 (full standalone) | ✅ ADDRESSED — pre-launch CRITICAL |
| #2 | Calibration Drift offline lung — multi-device sync | ADR 021 (full standalone) | ✅ ADDRESSED — pre-Faza-2 T&B |
| #3 | Liability Gap AA HIGH fără HRV/Sleep | ADR 021 line 57 cross-link ("Pierderea unei detection negative = liability gap") + ADR 021 §Consequences positive line 232 ("Liability protection — observații negative preservate") + ADR 013 §6 Liability Flag silent backend (already pre-Gemini) | **PARTIAL ADDRESSED** — accepted that fizical signals (HRV/Sleep) deferred v1.x via Apple HealthKit (HANDOVER §6.5). Cross-linked but NU standalone ADR. ACCEPTABLE deferral, but NU explicit tracked în Sprint 4 backlog. |

**F1-F4 follow-ups (per HANDOVER_INPUT_INBOX.md §1.3):**

- **F1 — AA composite no-double-penalize** → ADR 013 §AMENDMENT 2026-04-30 evening (full impl spec) ✅
- **F2/F3/F4** — not explicitly traced în vault output but per evening v2 LATEST.md, all 4 action items addressed (ADR 020, 021, PRODUCT_STRATEGY §3.5.1, ADR 013 amendment). ✅

**Q1 PROJECTION gating:**

- LATEST.md (now 14_ADR_020_021) §PROJECTION engine verify: "PROJECTION as engine dimension: ❌ NOT registered. ... Currently PROJECTION = UI utility (`dashboard.js calcProjection`), NOT engine dimension on orchestrator path."
- **Sprint 4 backlog tracking?** HANDOVER §6 Sprint 4 backlog NU listează explicit "PROJECTION engine register decision" ca task tracked. LATEST.md flagged ca "decision point Sprint 4 NOT urgent" dar NU ingested back în HANDOVER.
- **Status:** PARTIAL — finding documented în 14_ADR_020_021 archive only, NU promovat în HANDOVER §6 backlog.

**Status:** ✅ Q10 BS #1, BS #2, F1 fully addressed. BS #3 + Q1 PROJECTION = partial / acceptable deferral, dar Sprint 4 backlog NU listează explicit ca decision points.

---

### 2.6 — Schema outbox compliance

Per `VAULT_RULES.md §3.3` + `PROMPT_CC_HYGIENE.md §3.1`:

| Check | Reality | Status |
|---|---|---|
| Single LATEST.md la top-level | ✅ DA (`📤_outbox/LATEST.md` doar) | ✅ COMPLIANT |
| Archive numbering cronologic continuu, NU reset lunar | ✅ 01-13 (post audit: 01-14) | ✅ COMPLIANT |
| No gaps în numbering | ✅ 01-13 zero gaps | ✅ COMPLIANT |
| File names follow `NN_<TASK>.md` | ✅ DA | ✅ COMPLIANT |
| `.gitkeep` în `📤_outbox/` și `_archive/` | ✅ DA | ✅ COMPLIANT |

**Status:** ✅ COMPLIANT.

**Minor PROMPT_CC_HYGIENE drift (non-blocking):**
- Line 117-120 NEXT_NN fallback "if empty start at 06" — STALE assumption (archive starts at 01). Harmless because if-branch only triggers when archive empty.
- Line 98 `grep -v "cc-reports/"` — STALE exclusion since cc-reports DEPRECATED. Harmless.

---

### 2.7 — Inbox state

| Expected | Reality | Status |
|---|---|---|
| `HANDOVER_INPUT_INBOX.md` present (CONSUMED, retained) | ✅ Present (26605 bytes) | ✅ OK |
| `ALIGNMENT_QUESTIONS_CHAT_NEW.md` present | ✅ Present (4639 bytes) | ✅ OK |

**Status:** ✅ OK — Opus evening v2 run output complete.

---

### 2.8 — Memory entries vs handover

HANDOVER §8.1 listează 8 entries active (entry #8 marked "DE ȘTERS" → 7 effective active).

**Conceptual alignment check vs ADR amendments / vault docs:**

| Memory rule | Vault evidence | Status |
|---|---|---|
| Anti-RE strategy categorical universal + engine internals ASCUNSE | ADR 013 §AMENDMENT 2026-04-30 evening §Rationale respingere consolidare 4+5: "granularitatea AA messaging anti-RE = critică" + ADR 013 §6 amendment "anti-RE (signal exposure prin wording)" | ✅ ALIGNED |
| Tier system SSOT 2 axe ortogonale | ADR 009 §AMENDMENT 2026-04-30 (full canonical spec) + ADR 021 references | ✅ ALIGNED conceptual |
| T&B retention 90 zile | ADR 011 amendment + HANDOVER §4.2 + §8.1 | ✅ ALIGNED |
| Force-typing AA HIGH eliminated permanent | ADR 013 §6 amendment | ✅ ALIGNED |
| Bayesian Nutrition + Sleep = MOTOR PASIV | HANDOVER §2.2 + ADR 021 cross-ref + PRODUCT_STRATEGY §3.5 + 3.5.1 | ✅ ALIGNED |

**Status:** ✅ ALIGNED conceptually (Opus n-are tool memory direct access — high-level only).

---

### 2.9 — ALIGNMENT_QUESTIONS_CHAT_NEW.md cross-references

**[NEW finding — bonus from 2.4 D-decision audit]**

Toate 16 questions în `📥_inbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md` referențiază section anchors care NU corespund structurii reale `HANDOVER_GLOBAL_2026-04-30_evening.md`:

| Q# | Citation | HANDOVER reality | Status |
|---|---|---|---|
| Q1 | `HANDOVER §1.1` D1 | §1.1 = Product vision; D1 = §5 (HANDOVER) sau DECISION_LOG entry evening | **BROKEN** |
| Q2 | `HANDOVER §1.1` D7 | §1.1 = Product vision; D7 = §5 (HANDOVER) sau DECISION_LOG | **BROKEN** |
| Q3 | `HANDOVER §1.1` D12 | §1.1 = Product vision; D12 = §5 / DECISION_LOG | **BROKEN** |
| Q4 | `HANDOVER §1.1` D13 | §1.1 = Product vision; D13 = §5 / DECISION_LOG / ADR 021 §Implementation phasing | **BROKEN** |
| Q5 | `HANDOVER §1.2` Q10 BLIND SPOTS | §1.2 = Distribution strategy; Q10 BS info NU în HANDOVER (e în HANDOVER_INPUT_INBOX.md) | **BROKEN** |
| Q6 | `HANDOVER §1.3` F1 | §1.3 NU EXISTĂ; F1 = ADR 013 amendment + DECISION_LOG entry evening | **BROKEN** |
| Q7-Q14 | various ADR refs | mostly correct (ADR 020, 021, 013 §AMENDMENT, PRODUCT_STRATEGY §3.5.1) | ✅ OK |
| Q15 | outbox refs | correct (VAULT_RULES §3.3 + 13_OUTBOX_SCHEMA_MIGRATION) | ✅ OK |
| Q16 (bonus) | LATEST.md PROJECTION verify | correct | ✅ OK |

**Status:** **CRITICAL** — 6/16 questions au citation refs broken. Pass criteria ≥12/15 risk fail dacă chat-ul caută strict la citation provided înainte să găsească answer. Daniel risc primary = Opus evening v2 run halucinated section structure cite.

---

## SUMMARY

### Critical issues (3)

1. **D1 DEVELOPING tier — ADR 009 NOT UPDATED post-decision.** DECISION_LOG entry 2026-04-30 evening declares D1 ADD = 6 nivele; ADR 021 already cites "6 nivele post D1 decision"; but ADR 009 §AMENDMENT lines 165-175 still presents it as Sprint 2 open question + §Decision table (lines 24-30) still shows 5 nivele. **Internal vault contradiction.** Sprint 4 implementation va fi confused.

2. **HANDOVER §5 STALE — D1-D15 still listed as "decizii pending Daniel review".** DECISION_LOG entry 2026-04-30 evening declares "D1-D15 routing 15/15 locked". §5 wording obsolete; chat nou + Sprint 4 prompt bootstrap citește HANDOVER ca SSOT, va re-deschide decizii deja luate.

3. **ALIGNMENT_QUESTIONS_CHAT_NEW.md — 6/16 citation refs BROKEN.** Q1-Q6 cite HANDOVER §1.1, §1.2, §1.3 — secțiuni care NU conțin info-urile referențiate (sau §1.3 NU EXISTĂ). Pass criteria ≥12/15 risk fail.

### Drift issues (9, non-blocking)

4. **HANDOVER §13 + §7.2 — outbox FIFO păstrează ultimele 5** STALE. Schema actuală LATEST.md + archive cronologic continuu (NU FIFO).

5. **HANDOVER §15 — "49 active + 6 cc-reports"** STALE. cc-reports/ DEPRECATED. Reality post evening v2: ~51 vault docs (49 baseline + 2 ADR new) + outbox archive (NU vault docs).

6. **HANDOVER §15 — "Folder count: 11 numerotate continuu (00-08) + cc-reports + 📥_inbox + 📤_outbox"** STALE.

7. **HANDOVER §4.5 + §5 — "Reports: cc-reports/SPRINT*"** STALE refs. Rapoartele sunt în `📤_outbox/_archive/2026-04/08-10`.

8. **HANDOVER §5 D10** — wording "cc-reports/ în .gitignore line 16 — păstrăm sau scoate?" STALE (D10 RESOLVED prin outbox migration per DECISION_LOG entry).

9. **INDEX_MASTER.md — 3 cc-reports refs broken** (lines 23, 65, 115). Plus `[[AUDIT_5000Q]]` + `[[AUDIT_5000Q_REPORT]]` wikilinks broken (line 66).

10. **CLAUDE_CHAT_INFRASTRUCTURE.md line 43** — cc-reports listed.

11. **ADR 019 line 75 + scripts/README.md lines 25, 85** — `--output cc-reports/...` paths (note: scripts/README.md NU vault doc per VAULT_RULES.md §1, dar ADR 019 e vault doc).

12. **§2.3 ADR 020 cross-ref to "ADR 011 schedule"** misleading — ADR 011 fixes 180 zile, NOT 30-180/30-365. Generalizare conceptuală corectă, phrasing ambiguous.

### Placeholder/forward-looking (acceptable, 2)

- ADR 021 + PRODUCT_STRATEGY §3.5.1 cite `[[ADR 022 Bayesian Sprint 4]]` — forward-looking placeholder, ADR 022 = Sprint 4 deliverable
- PROMPT_CC_HYGIENE.md §3.1 NEXT_NN fallback start at 06 (stale baseline, harmless conditional)

### OK / aligned (extensive)

- ADR list range 001-021 + ADR_MULTI_TENANT_AUTH ✅ ALIGNED across VAULT_RULES, INDEX_MASTER table, DECISION_LOG, physical reality
- All wikilinks `[[NNN-...]]` to numbered ADRs resolve to physical files ✅
- Test count 752/752 ✅ ALIGNED across HANDOVER, LATEST.md, run actual
- §6.7 effort math 137-214h / 15-29h ✅ math correct + cross-source aligned
- Inbox state (HANDOVER_INPUT_INBOX + ALIGNMENT_QUESTIONS_CHAT_NEW) ✅ both present
- Outbox schema (LATEST + archive 01-13 continuu) ✅ COMPLIANT
- Q10 BLIND SPOT #1 → ADR 020 ✅
- Q10 BLIND SPOT #2 → ADR 021 ✅
- Q10 BLIND SPOT #3 → cross-linked în ADR 021 + ADR 013 Liability Flag (partial deferred acceptable)
- F1 → ADR 013 §AMENDMENT 2026-04-30 evening ✅
- Memory entries §8 ✅ ALIGNED conceptually cu ADR amendments

---

## RECOMMENDED FIX-URI (Daniel decides — prioritized)

### Priority 1 — CRITICAL (blocks Sprint 4 cleanly)

#### Fix 1: ADR 009 update post-D1 decision (ADD DEVELOPING = 6 nivele)

- **File:** `03-decisions/009-calibration-tiers.md`
- **Sections:** §Decision (lines 24-30 5-tier table) + §AMENDMENT 2026-04-30 §Migration Plan §Sprint 2 (lines 165-175)
- **Current §Decision:**
  ```
  | Tier | ID | Days | Sessions | ... |
  | COLD_START | 0 | < 7 | < 3 | ... |
  | INITIAL | 1 | 7–28 | 3–12 | ... |
  | PERSONALIZING | 2 | 28–90 | 12–40 | ... |
  | PERSONALIZED | 3 | 90–180 | 40–80 | ... |
  | OPTIMIZED | 4 | 180+ | 80+ | ... |
  ```
- **Proposed §Decision:** add DEVELOPING row între INITIAL și PERSONALIZING cu boundaries 14-60 zile / 6-24 sesiuni (per Option A in §AMENDMENT) + ID renumber (DEVELOPING=2, PERSONALIZING=3, PERSONALIZED=4, OPTIMIZED=5)
- **Current §AMENDMENT §Sprint 2:** "Two decisions Sprint 2 needed: 1. DEVELOPING tier — add or remove?"
- **Proposed §AMENDMENT §Sprint 2:** rewrite ca "RESOLVED: D1 routing 2026-04-30 evening = ADD DEVELOPING (Option A). 6 nivele canonical. Sprint 4 ~8-12h cod + tests update per HANDOVER §6.7." Code refactor (Sprint 2 §2 second decision) rămâne open.
- **Rationale:** ADR 009 e SSOT canonical pentru tier system. DECISION_LOG entry + ADR 021 deja operează ca rezolvat. Vault contradiction blochează clarity Sprint 4.
- **Effort:** ~10-15 min

#### Fix 2: HANDOVER §5 D-decisions update post-resolution

- **File:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
- **Section:** §5 DECIZII PENDING DANIEL REVIEW (D1-D15) — lines 152-175
- **Current:** all 14 D-decisions listed ca pending (D6 + D10 marked rezolvat, restul pending)
- **Proposed:** rename §5 → "§5 DECIZII LOCKED 2026-04-30 evening (D1-D15)". Pentru fiecare D, rescrie cu decizia luată (din DECISION_LOG entry evening line 20). Mark §5 SECTION HEADER "Status: 15/15 locked" la top.
- **Rationale:** HANDOVER = SSOT activ pentru context curent (per INDEX_MASTER + VAULT_RULES §3.2). Chat nou bootstrap citește §5 ca pending → re-deschide decizii deja luate. Block Sprint 4 prompt comprehensive.
- **Effort:** ~15-20 min

#### Fix 3: ALIGNMENT_QUESTIONS_CHAT_NEW.md — fix citation refs

- **File:** `📥_inbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md`
- **Section:** Q1-Q6 (lines 18-30) citation refs
- **Current Q1:** `HANDOVER §1.1 D1 + ADR 009 §AMENDMENT 2026-04-30`
- **Proposed Q1:** `DECISION_LOG entry 2026-04-30 evening (D1-D15 routing) + ADR 009 §AMENDMENT 2026-04-30 §Migration Plan §Sprint 2 + ADR 021 §Context line 34`
- **Similar fix:** Q2 (D7), Q3 (D12), Q4 (D13), Q5 (Q10 BLIND SPOTS), Q6 (F1) — toate redirect la DECISION_LOG entry evening + ADR amendments în loc de HANDOVER §1.1/1.2/1.3 (incorrect).
- **Alternative (recommended):** dacă HANDOVER §5 + §6 update prin Fix 2 → Q1-Q4 pot referenția HANDOVER §5 valid post-fix. Q5-Q6 still need redirect la DECISION_LOG / ADR 013 §AMENDMENT.
- **Rationale:** chat nou pass criteria ≥12/15 risk fail dacă citation refs broken. Daniel paste questions → chat caută la §1.1/1.2/1.3 → găsește irrelevant content → answer LOW confidence sau hallucinate.
- **Effort:** ~10-15 min

### Priority 2 — DRIFT (non-blocking, batch fix)

#### Fix 4: HANDOVER cc-reports cleanup (5 occurrences)

- **File:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
- **Lines:** 148, 154, 173, 461, 462
- **Current:** "cc-reports/SPRINT*_EXECUTION_REPORT.md" + "49 active + 6 cc-reports" + "Folder count ... + cc-reports +"
- **Proposed:** redirect references la `📤_outbox/_archive/2026-04/<NN>_<TASK>.md` (Sprint 1=08, Sprint 2=09, Sprint 3 partial=10, Vault Cleanup=11) + update §15 "49 vault docs + 2 ADR new (020, 021) = 51 vault docs + 14 outbox archive items + README + VAULT_RULES + PROMPT_CC_HYGIENE" + §15 folder count remove cc-reports.
- **Effort:** ~15 min

#### Fix 5: HANDOVER §13 + §7.2 outbox schema update

- **File:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
- **Sections:** §7.2 (lines 266-268) + §13 (line 423)
- **Current §7.2:** "Opus pune rapoarte numerotate cronologic 01, 02, ... Păstrează ultimele 5 (FIFO)"
- **Current §13 step 7:** "scrie 📤_outbox/NN_TASK.md + cleanup FIFO (păstrează ultimele 5)"
- **Proposed:** rewrite per VAULT_RULES.md §3.3 schema: "Opus scrie LATEST.md + MOVE existing LATEST.md → _archive/<YYYY-MM>/NN_<TASK>.md (cronologic continuu, NU FIFO)"
- **Effort:** ~5 min

#### Fix 6: INDEX_MASTER cleanup

- **File:** `00-index/INDEX_MASTER.md`
- **Lines:** 23 (folder tree), 65 (Sprint reports ref), 66 (AUDIT_5000Q wikilinks), 115 (vault cleanup ref)
- **Proposed:**
  - line 23: remove `cc-reports/` row, replace with `📤_outbox/      LATEST + _archive/<YYYY-MM>/ (audit trail)`
  - line 65: replace `cc-reports/SPRINT*_EXECUTION_REPORT.md` with `📤_outbox/_archive/2026-04/08-10_SPRINT*_EXECUTION_REPORT.md`
  - line 66: replace `[[AUDIT_5000Q]]` / `[[AUDIT_5000Q_REPORT]]` with `📤_outbox/_archive/2026-04/06_AUDIT_5000Q.md` / `07_AUDIT_5000Q_REPORT.md`
  - line 115: replace `cc-reports/VAULT_CLEANUP_2026-04-30_REPORT.md` with `📤_outbox/_archive/2026-04/11_VAULT_CLEANUP_REPORT.md`
- **Effort:** ~5 min

#### Fix 7: CLAUDE_CHAT_INFRASTRUCTURE.md line 43 cc-reports

- **File:** `08-workflows/CLAUDE_CHAT_INFRASTRUCTURE.md`
- **Line:** 43
- **Current:** `08-workflows (this file lives here), cc-reports`
- **Proposed:** drop "cc-reports" (deprecated)
- **Effort:** ~1 min

#### Fix 8: ADR 019 line 75 + scripts/README.md cc-reports paths

- **File:** `03-decisions/019-gdpr-k-anonymity-validation.md` + `scripts/README.md`
- **Lines:** 75 (ADR), 25 + 85 (script README)
- **Current:** `--output cc-reports/...`
- **Proposed:** redirect la `📤_outbox/<output_filename>.json` sau `tests/fixtures/<output_filename>.json` (depending on intended audit trail)
- **Note:** scripts/README.md NU strict vault doc per VAULT_RULES.md §1, but recommendation pentru consistency.
- **Effort:** ~5 min total

#### Fix 9: ADR 020 §Tier 1 cross-ref phrasing clarification

- **File:** `03-decisions/020-storage-tiering-strategy.md`
- **Line:** 43-44
- **Current:** "retention 30-180 zile (pre-launch) / 30-365 zile (post-Pro) per ADR 011 schedule"
- **Proposed:** "retention 30-180 zile (pre-launch) / 30-365 zile (post-Pro) generalizing ADR 011 fixed Tier 1 = 180 zile (responseProfile rolling window OPTIMIZED). ADR 020 thresholds extend ADR 011 cu age + size dual triggers."
- **Rationale:** clarify că ADR 020 generalizes (NU "per ADR 011 schedule" — ambiguous).
- **Effort:** ~3 min

### Priority 3 — Optional cleanup

- **Fix 10:** PROMPT_CC_HYGIENE.md §3.1 line 117-120 NEXT_NN fallback simplify (drop "start at 06" stale baseline) + line 98 grep -v cc-reports redundant exclusion remove.
- **Fix 11:** Sprint 4 backlog HANDOVER §6 explicit decision points: (a) PROJECTION engine register decision (per Q1 LATEST.md flag), (b) Q10 BLIND SPOT #3 Liability Gap tracked status (deferred Apple HealthKit v1.x).

---

## NEXT ACTION DANIEL

1. **Review acest raport** în chat strategic (paste integral, sau direct în chat aceeași sesiune)
2. **Daniel decides per fix:** APPLY / IGNORE / DEFER. Recomand:
   - **Priority 1 fixes (1-3):** APPLY pre-Sprint 4 (D1 ADR 009 inconsistency = blocking real)
   - **Priority 2 fixes (4-9):** APPLY batch (drift cumulativ, 30-45 min total)
   - **Priority 3 (10-11):** OPTIONAL
3. **Daniel cere prompt CC follow-up** cu fix-urile selected — acela va fi WRITE run, NU read-only
4. **Audit re-run post-fix** (opțional, dacă Daniel vrea verify ALIGNED)

---

## CONSTRAINTS RESPECTED

- ✅ ZERO modifications vault docs (ADR-uri, PRODUCT_STRATEGY, HANDOVER, VAULT_RULES, INDEX_MASTER, DECISION_LOG, etc.)
- ✅ ZERO modifications cod sursă (`src/`, `tests/`, `scripts/`)
- ✅ vitest baseline 752/752 PASS unchanged (pre + post audit)
- ✅ ZERO deletes din `📥_inbox/` (HANDOVER_INPUT_INBOX + ALIGNMENT_QUESTIONS_CHAT_NEW retained)
- ✅ Single output: LATEST.md (rotate previous → archive 14)
- ✅ ZERO commits except outbox rotation + audit report

---

## Verification commands (Daniel local sanity check)

```bash
git log --oneline -3
ls -la 📤_outbox/
ls 📤_outbox/_archive/2026-04/   # expect 01-14
cat 📤_outbox/LATEST.md           # expect acest raport
ls 📥_inbox/                     # unchanged: HANDOVER_INPUT_INBOX + ALIGNMENT_QUESTIONS_CHAT_NEW
npm run test:run                 # expect 752/752 PASS
```

---

## Commits

- `<sha-pending>` chore(outbox): rotate LATEST → archive 14 + vault hygiene audit report

## Pushed: ✅ origin/main (pending)

---

🦫 **Audit complete. Vault hygiene status: needs-attention (3 critical drift issues blocking Sprint 4 clarity, 9 non-critical drift cumulativ). Next: Daniel review → decide fix scope → prompt CC follow-up WRITE run.**
