# Vault Audit Total — 2026-05-07 (Bugatti standard)

**Date:** 2026-05-07
**Scope:** Full vault audit pre Capacity A extension cleanup major
**Goal:** Raport singular self-sufficient — next-Claude (or eu post-BW) comandă cleanup batch direct ZERO lookup
**Safety tag:** `pre-vault-audit-2026-05-07-2108` (pushed origin)
**Anti-recurrence:** ZERO claims din memorie. TOATE = filesystem grep verbatim cu evidence `path:line`. UNCERTAIN flag explicit "ESCALATE Daniel review", NU forțezi categorizare.

---

## Phase E — Aggregate KPI summary

### KPI baseline pre-cleanup

- **Total `.md` files:** 336
- **Total LOC vault:** 85,986
- **Active vault files (excl `_archive/`):** 93
- **Archive files (`📤_outbox/_archive/`):** 243 (28 in 2026-04, 215 in 2026-05)
- **Top 30 largest files:** see Appendix A
- **Total wikilinks in vault:** 701
- **Orphan wikilink targets:** 44 (Appendix B)
- **Files cu deprecated/legacy markers:** 163 total (41 active, 122 archive)
- **Active files cu code refs din `src/`:** 26 (BLOCKING_ARCHIVE — full list Appendix D)
- **Inbound→Archive from active vault:** 0 (clean wikilink discipline)
- **Active files cu `_archive` basename collision:** 0 exact match
- **Folder breakdown active:** 03-decisions/(42), 01-vision/(9), 06-sessions-log/(9), 04-architecture/(8), 08-workflows/(5), 05-findings-tracker/(3), tests/(3), 00-index/(2), scripts/(2), 02-audit/(1), 07-meta/(1), simulations/(1), root(7)

### De-facto SSOT signal (top 10 inbound)

| Rank | Inbound | File | Type |
|---|---|---|---|
| 1 | 91 | `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` | DEEP_ARCHIVE_SSOT |
| 2 | 78 | `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` | ADR_SSOT_CANONICAL |
| 3 | 62 | `03-decisions/018-engine-extensibility-architecture.md` | ADR_FOUNDATION |
| 4 | 54 | `03-decisions/009-calibration-tiers.md` | ADR_FOUNDATION |
| 5 | 34 | `03-decisions/DECISION_LOG.md` | LOG_MASTER |
| 6 | 29 | `03-decisions/022-bayesian-nutrition-inference.md` | ADR_SSOT |
| 7 | 28 | `04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md` | ARCH_SSOT |
| 8 | 28 | `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md` | ADR_SSOT |
| 9 | 28 | `03-decisions/011-coach-decision-log-architecture.md` | ADR_SSOT |
| 10 | 27 | `03-decisions/025-andura-gandeste-pentru-user.md` | ADR_SSOT |

### Recommendation distribution (preliminary, refined per Phase B)

- **ACTIVE_SSOT_PRESERVE:** ~80 active files (foundation + ADRs + handover SSOTs)
- **ARCHIVE_FULL** (Capacity A LOCKED candidates): 2 active files — `HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md`, `HANDOVER_MISC_2026-04-30_evening.md`
- **REDIRECT_INBOUND:** wikilinks pointing to soon-archived files require update before archive
- **PRESERVE_AS_IS** (already archived): 243 archive files — preserve audit trail per VAULT_RULES §3.5
- **UNCERTAIN_ESCALATE:** Several large HANDOVER_*.md files post-pipeline §42.10 closure (covered §9.X canonical), strategic decision Daniel needed
- **Total potential LOC reduction (active):** ~3,000-4,000 LOC if Capacity A executes (~5% of vault)

---

(remaining phases populated below)

---

## Phase A — Baseline metrics global (raw)

```
Total .md files:          336
Total LOC:             85,986
Active vault files:        93
Archive files:            243 (2026-04: 28, 2026-05: 215)
Total wikilinks:          701
Orphan wikilinks:          44
Deprecated marker files:  163
Active+code-ref files:     26 (BLOCKING_ARCHIVE)
```

**Folder breakdown (file count):**

| Folder | Count |
|---|---|
| 📤_outbox/ (mostly archive) | 244 |
| 03-decisions/ | 42 |
| 06-sessions-log/ | 9 |
| 01-vision/ | 9 |
| 04-architecture/ | 8 |
| 08-workflows/ | 5 |
| tests/ | 3 |
| 05-findings-tracker/ | 3 |
| scripts/ | 2 |
| 00-index/ | 2 |
| 02-audit/ | 1 |
| 07-meta/ | 1 |
| simulations/ | 1 |
| root | 7 (CLAUDE.md, DIFF_FLAGS.md, PROMPT_CC_HYGIENE.md, PROMPT_CC_INGEST_HANDOVER.md, README.md, VAULT_RULES.md, + 📤_outbox/LATEST.md) |

---

## Phase B — Per-file deep audit

### Group: 00-index/ (2 active files)

#### `00-index/CURRENT_STATE.md`

**LOC:** 1829 | **First commit:** 2026-05-04 | **Last commit:** 2026-05-07 | **Folder:** `00-index/` ON_PATTERN
**Naming:** ON_PATTERN (00-index navigation hub)
**Inbound wikilinks:** 11 (sources: INDEX_MASTER:4, INDEX_MASTER:40, ADR_MULTI_TENANT_AUTH §AMENDMENT 2026-05-04 evening, DECISION_LOG 2026-05-04 evening entry, multiple HANDOVER_GLOBAL pointers — verified `/tmp/vault-audit/inbound-detail-active.txt`)
**Outbound wikilinks:** 6 (VAULT_RULES, HANDOVER_GLOBAL_2026-04-30_evening, ONBOARDING_SSOT_V1, etc.)
**Status markers:** Updated 2026-05-07 chat NEW startup §CC.5 fast handover ingest chat-NEW3, "🚨 CRITICAL SUPERSEDE chat-NEW1 naming", LOCKED V1 cumulative ~688
**Code refs from src/:** 0
**Sections:** `## NOW` (current chat-NEW3 + ~3 precedent compressed strata) / `## JUST DECIDED` (cumulative descending chronologic) / `## NEXT` / `## ACTIVE_REFS` / `## ACTIVE_ADRS` / `## ACTIVE_FLAGS` / `## RECENT` / `## POINTERS`

**Conținut summary:** Live SSOT chat-state per VAULT_RULES §CHAT_CONTINUITY_PROTOCOL §CC.6 append-only architecture. Stack `## NOW` precedent-compressed: chat-NEW3 (active) → chat-NEW2 → chat-NEW1 → chat-9 → chat-8 → chat-5 → chat-4 → chat-3. Cumulative LOCKED V1 ~688 (post chat-NEW3 birou React direction LOCK + CD V2 mockup canonical + Capacity A early trigger LOCK). Self-reflective scribe permanent: Slip-uri Claude consolidated (markdown vs artefact, §45.x stale, npm lint absent, CLAUDE.md grep recidivă, ground truth git verify pre-distructive recommendation). Daniel-isms preserved verbatim. ZERO src code; vault hygiene meta-tooling.

**Verbatim duplicate detection:** Spans verbatim in HANDOVER_GLOBAL §JUST_DECIDED (chat-NEW3 mirror in DECISION_LOG.md descending chronologic). PARAPHRASE_SIMILAR cu HANDOVER_GLOBAL_2026-04-30_evening §47/§50/§56/§62-§73 (CURRENT_STATE points back via `## ACTIVE_REFS`, NU duplicate verbatim). Chat-NEW3 ingest content (~3 LOCKED entries) mirror în DECISION_LOG (per §HANDOVER_PROTOCOL STEP 16 amendment).

**SSOT relationship:** SSOT_ITSELF (canonical live chat-state). Older entries point via `## POINTERS` → `03-decisions/DECISION_LOG.md` + `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`.

**Currentness:** ACTIVE_HOT (own header timestamp 2026-05-07; DECISION_LOG last entry expected within 24h)
**Could regenerate?** NO — this is canonical live state. Append-only architecture preserves history.
**Authority:** META (operational SSOT). NU AUTHORITATIVE_LOCK (those live in ADR-uri).
**Empty/TBD:** None significant. Active narrative file.
**Outbox archive duplicate:** Appears in archive as `139_LATEST_PREVIOUS_CURRENT_STATE_REFRESH.md` + `155_LATEST_PREVIOUS_CURRENT_STATE_HANDOVER_NARRATIVE.md` — those are LATEST cycles (preserve audit trail), NOT accidental duplicates of CURRENT_STATE.md itself.

**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE — hard preserve. Truncate `## RECENT` content older than 7 days at HANDOVER_GLOBAL deep when section >50 LOC (per VAULT_RULES §CC.6 mechanic). Phase B+ drill-down below applies.

**Risk flags:** ZERO archive risk. ## NOW stack 8 precedent strata may exceed 7 days threshold for some — STEP 16 amendment compliance check below.
**Dependencies pre-archive:** N/A (preserve)

---

#### `00-index/INDEX_MASTER.md`

**LOC:** 261 | **First commit:** 2026-04-24 | **Last commit:** 2026-05-07 | **Folder:** `00-index/` ON_PATTERN
**Naming:** ON_PATTERN
**Inbound wikilinks:** 0 (root navigation hub — referenced by README.md, CLAUDE.md memory, NOT by `[[INDEX_MASTER]]` wikilinks; expected pattern)
**Outbound wikilinks:** ~80+ (master navigation table — every active SSOT)
**Status markers:** Last updated 2026-05-04 evening (§CHAT_CONTINUITY_PROTOCOL LOCKED V1)
**Code refs from src/:** 0
**Sections:** STRUCTURĂ POST-CLEANUP / NAVIGARE RAPIDĂ table / ADR-URI ACTIVE table / Named ADRs (8) / SSOT PRINCIPLE LOCKS / VAULT CLEANUP HISTORY (2026-04-30 + 2026-05-03 + 2026-05-04 multiple)

**Conținut summary:** Master navigation hub vault. Stats line 6: "92 fișiere active vault... 42 ADR-uri active total — 33 numbered 001-032 + 9 named ADR_*". Cleanup history dated entries 2026-04-30 → 2026-05-04 night. **DRIFT DETECTED:** "92 fișiere" stale — actual count 93 active per `/tmp/vault-audit/files-active.txt`. ADR count 33 numbered actual = `001-032` (32 files numbered + ADR_MULTI_TENANT_AUTH). **DRIFT DETECTED:** "33 numbered 001-032" assertion has off-by-one (32 files numbered).

**Verbatim duplicate detection:** Section "VAULT CLEANUP HISTORY 2026-05-04 evening (handover ingest §62-§73)" overlaps SOFT_SIMILAR cu HANDOVER_GLOBAL §41 + DECISION_LOG entries (paraphrase, NOT verbatim). NU verbatim duplicates strict.

**SSOT relationship:** SSOT_ITSELF (master index — canonical navigation table). Cross-refs `[[VAULT_RULES]]`, `[[CURRENT_STATE]]`, `[[HANDOVER_GLOBAL_2026-04-30_evening]]`, all 33 ADR-uri.

**Currentness:** ACTIVE_HOT (Last updated 2026-05-04 — but pointers reference §62-§73 LOCK 2026-05-04 evening; last commit 2026-05-07 vault hygiene cumulative refresh chat-9 commit `724636a`)
**Could regenerate?** NO — canonical map. Auto-detected stats CAN be re-derived but human-curated NAVIGARE table cannot.
**Authority:** META (navigation operational)
**Empty/TBD:** None
**Outbox archive duplicate:** None

**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE + UPDATE_STATS (mecanic refresh task):
- Update line 6 stats "92 fișiere → 93 active" + "33 numbered 001-032" → "32 numbered 001-032 + ADR_MULTI_TENANT_AUTH" + "8 named ADR_*" (verify count) — minor numeric drift only
- Pointers TO `HANDOVER_VAULT_HYGIENE_2026-04-30_evening` + `HANDOVER_MISC_2026-04-30_evening` need REDIRECT once Capacity A executes (lines 41 + 56-58 — see Phase D Batch 2)

**Risk flags:** REDIRECT_REQUIRED if Capacity A archives those handovers (NU break-when-archive — preserve ## POINTERS section pointing to deep history).
**Dependencies pre-archive:** N/A (preserve). Stats refresh: trivial Edit task.

---

### Group: 01-vision/ (9 active files)

#### `01-vision/DANIEL_COMPLETE_PROFILE.md`

**LOC:** 268 | **First commit:** 2026-04-25 | **Last commit:** 2026-05-03 | **Folder:** `01-vision/` ON_PATTERN | **Inbound:** 5 | **Outbound:** ~3 | **Code refs:** 0
**Status markers:** "Single source of truth"; Last updated 25 Apr 2026 (header static, last commit 2026-05-03 likely minor refresh)
**Sections:** PRIMARY IDENTITY / COGNITIVE PROFILE (Mensa 139, ADHD 2e) / PHYSICAL DATA (110.6kg, 1.83m, 36, ~24% BF) / GOALS / NUTRITION (CUT 1800kcal AUTO until 20 July) / GYM PROGRAM (4-day upper focus) / Tempo & RIR / Anti-pattern flag (1200 kcal × 3 luni)
**Conținut:** Owner profile canonical — Daniel ER/BP at Allyis, solo founder, Mensa IQ 139 + ADHD 2e high functioning, 110.6kg→target 100-103kg by 20 July 2026. Anti-pattern: 1200 kcal × 3 luni → under-recovered, baselines may rebound. Bus factor 1. Day 0 of CC ~5 days ago, Day 5 mega-prompts running.
**Verbatim duplicate:** Some persona content overlaps SOFT_SIMILAR with SUFLET_ANDURA §1 + HANDOVER_GLOBAL persona references — paraphrase only.
**SSOT:** SSOT_ITSELF (canonical user-as-product profile)
**Currentness:** ACTIVE_WARM (header date 2026-04-25 static, but referenced by ONBOARDING_SSOT/PRODUCT_STRATEGY/COGNITIVE_ARCHITECTURE specs)
**Could regenerate?** NO (unique personal data + cognitive profile articulated by Daniel)
**Authority:** AUTHORITATIVE_LOCK (vision/persona reference)
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. Update sentence "Day 0 of CC ~5 days ago" stale (now 2026-05-07 = ~12 days+). Rationale: §3.1 update-in-place > create-new. Risk flags: 0.

---

#### `01-vision/MOAT_STRATEGY.md`

**LOC:** 169 | **First commit:** 2026-04-25 | **Last commit:** 2026-05-03 | **Folder:** ON_PATTERN | **Inbound:** 4 | **Outbound:** ~5 | **Code refs:** 0
**Status markers:** "Ultima actualizare: 24 apr 2026"; sections AMENDMENT 2026-04-30 explicit; SalaFull→Andura strikethrough rebrand
**Sections:** ÎNTREBAREA FUNDAMENTALĂ / 5 PILONI MOAT (Context persistent stratificat 90z+1y+forever / Decizie <100ms / Decizii verificabile / Acționare automată / Învață din TINE) / ADAPTIVE INTELLIGENCE scenarii / DIFERENȚIERE PE TIER / Competitor Comparison Matrix 5 axe (post 2026-04-29) / MOAT NE-COPIABIL / STRATEGIA DE LAUNCH / RĂSPUNS LA ÎNTREBAREA LUI DANIEL
**Conținut:** Moat justification 5 piloni + 5-axe execution differentiator (vs SensAI/Fitbod/Rizin/Arvo/JuggernautAI). Pricing line 113 strikethrough SalaFull €65/an → "Andura Standard €59/an" cu DEPRECATED 2026-05-02 Chat D ref §36.50.
**Verbatim duplicate:** "5 axe execution" matrix verbatim in HANDOVER_GLOBAL §10 (header markup similar); Moat principle quotes paraphrase in PROJECT_VISION.md §DIFERENȚIATORI. NU strict verbatim spans.
**SSOT:** SSOT_ITSELF for moat narrative + competitor matrix
**Currentness:** ACTIVE_WARM (last commit 2026-05-03 + line 113 amendment §36.50 referenced, current with §62-§73 era LOCKED)
**Could regenerate?** NO (strategic narrative + competitor matrix — Daniel articulated)
**Authority:** AUTHORITATIVE_LOCK (vision)
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. Optional: refresh "Ultima actualizare: 24 apr" → reflect 2026-05-03 last commit cu inline amendment audit trail.

---

#### `01-vision/ONBOARDING_SSOT_V1.md`

**LOC:** 233 | **First commit:** 2026-05-04 | **Last commit:** 2026-05-04 | **Folder:** ON_PATTERN | **Inbound:** 6 | **Outbound:** ~8 (HANDOVER_GLOBAL §26/§29.5/§36/ADR 014/017/025) | **Code refs:** 0
**Status markers:** "🟢 CONSOLIDATED V1" header + AMENDMENT 2026-05-04 evening Batch 2 §63.1 inline
**Sections:** §0 SCOPE (consolidates 5 fragmentări pre-existente) / §1 ONBOARDING FLOW V1 (4→5 ecrane post-amendment) + §AMENDMENT 2026-05-04 evening obiectiv-first reorder / further sections per file
**Conținut:** Single source of truth onboarding consolidating 5 fragmentări (HANDOVER_GLOBAL §26 + §29.5.14 + PRODUCT_STRATEGY §2.1-§2.3 + ADR 014 + ADR 017). Total <45 sec target. Skip path graceful degradation per ADR 025.
**Verbatim duplicate:** Verbatim aggregation of source fragments (by-design — explicit consolidation file replacing 5 sources). Source sections in HANDOVER_GLOBAL/PRODUCT_STRATEGY remain as historical inline amendment context.
**SSOT:** SSOT_ITSELF (recently consolidated 2026-05-04 per Vault Hygiene Sprint Faza 3 recomandare B)
**Currentness:** ACTIVE_HOT (consolidated 3 days ago)
**Could regenerate?** NO (consolidation work specific)
**Authority:** AUTHORITATIVE_LOCK
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. Risk: 0.

---

#### `01-vision/PARAMETRIC_PROGRAMS_DESIGN.md`

**LOC:** 254 | **First commit:** 2026-04-26 | **Last commit:** 2026-05-03 | **Folder:** ON_PATTERN | **Inbound:** 2 | **Outbound:** ~1 | **Code refs:** 0
**Status markers:** "Status: Design only — implementation FAZA 4+"
**Sections:** Why NOT 144 templates / Architecture (PROG_BASE + MODIFIERS) / Modifier specs v1 (ageModifier/genderModifier/frequencyModifier/experienceModifier/focusModifier)
**Conținut:** Design spec parametric programs replacing "144 templates" anti-pattern (PROJECT_VISION). Pure functions composable. FAZA 4+ implementation. Pipeline order: gender → age → frequency → experience → focus.
**Verbatim duplicate:** None detected (unique design spec).
**SSOT:** SSOT_ITSELF (parametric design canonical)
**Currentness:** ACTIVE_WARM (FAZA 4+ defer; not active near-term but referenced)
**Could regenerate?** PARTIAL (architecture concept could be re-derived from PROJECT_VISION; specific modifier spec NOT — design articulated)
**Authority:** AUTHORITATIVE_LOCK
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. Risk: 0.

---

#### `01-vision/PRIVACY_POLICY_V1_BETA.md`

**LOC:** 245 | **First commit:** 2026-05-04 | **Last commit:** 2026-05-04 | **Folder:** ON_PATTERN | **Inbound:** 1 (TERMS_OF_SERVICE_V1_BETA cross-ref) | **Outbound:** 2 | **Code refs:** 0
**Status markers:** "Updated draft v2 post review 2026-05-04 evening late (Daniel + Claude + Gemini cross-review)"; "Daniel action required: validate sprint final + lock V1 Beta"
**Sections:** 1 Cine suntem / 2 Vârsta minimă (18 ani) / 3 Ce date colectăm / 4 Unde sunt ținute datele (Firebase + Sentry + IndexedDB) / further GDPR sections
**Conținut:** Beta-stage privacy policy (Romanian). Operator: Constantin Daniel Mazilu (PF). Daniel validate sprint pending pre-Beta. Audit legal complet defer v1.5 (§46 P4 prerequisite).
**Verbatim duplicate:** Original template verbatim in HANDOVER_GLOBAL §56.8.2 LOCKED V1; review v2 amendments unique to this file.
**SSOT:** SSOT_ITSELF (legal doc operational)
**Currentness:** ACTIVE_HOT (pre-Beta blocker)
**Could regenerate?** NO (legal language curated)
**Authority:** AUTHORITATIVE_LOCK
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. Risk: 0. Daniel validate sprint pending blocks pre-Beta.

---

#### `01-vision/PRODUCT_STRATEGY_SPEC_v1.md`

**LOC:** 641 | **First commit:** 2026-04-29 | **Last commit:** 2026-05-04 | **Folder:** ON_PATTERN | **Inbound:** 17 | **Outbound:** ~6 | **Code refs:** 0
**Status markers:** "DRAFT spec ready"; multiple §AMENDMENT inline (2026-05-02 Chat D + 2026-04-30 + 2026-05-04 evening Batch 2 §65/§66/§67) — DEPRECATED markers explicit pe §1.2-§1.4 (pricing) + §5.4-§5.5/§5.8 + §6.1/§6.5
**Sections:** PARTEA 1 Product Strategy / PARTEA 2 UX & Onboarding / partea 3+...80 product decisions + 5 push-back resolved + 3 follow-up flags
**Conținut:** Product strategy 80 decisions cu chat strategic 2026-04-28 NIGHT articulated. Pricing DEPRECATED §36.50 (Founding €39/an cap 50 + Standard €59/an + Elite €79/an V1.1) — original Free+Pro €65/an superseded. Acquisition organic + word-of-mouth. NU paid ads.
**Verbatim duplicate:** Pricing/positioning content amendments verbatim referenced from HANDOVER_GLOBAL §36.50/§36.52/§36.53/§36.9 (DEPRECATED markers explicit) + §65/§66/§67 amendments inline (per §62-§68 Batch 1-6 ingest).
**SSOT:** SSOT_ITSELF (product strategy canonical) + amendments inline track changes
**Currentness:** ACTIVE_HOT (high inbound 17 + last commit 2026-05-04)
**Could regenerate?** NO (curated strategy)
**Authority:** AUTHORITATIVE_LOCK
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. Phase B+ drill-down below (file >500 LOC). Risk: 0.

---

#### `01-vision/PROJECT_VISION.md`

**LOC:** 177 | **First commit:** 2026-04-25 | **Last commit:** 2026-05-03 | **Folder:** ON_PATTERN | **Inbound:** 4 | **Outbound:** ~3 | **Code refs:** 0
**Status markers:** "Ultima actualizare: 25 apr 2026"; line 60+ "Engine-ul explică logic..."
**Sections:** ÎN 3 RÂNDURI / PRINCIPIUL FUNDAMENTAL / CONCEPT BRAND / VIZIUNEA DECIZIONALĂ / CITATE / QUALITY BAR / DIFERENȚIATORI / ROADMAP CONCEPTUAL / MONETIZARE / VALORI PRODUS / LEGAL & BRAND COMPLIANCE
**Conținut:** Canonical vision narrative — "coach personal AI 15.000€/lună 24/7". MOAT vs ChatGPT/Fitbod/Personal Trainer Uman. Quality > deadline 2-3 ani horizon. Roadmap conceptual FAZA 1-4. Public-facing brand language (Andura).
**Verbatim duplicate:** Some narrative shared with MOAT_STRATEGY (paraphrase, similar piloni) + DANIEL_COMPLETE_PROFILE; NU strict verbatim spans.
**SSOT:** SSOT_ITSELF (vision charter)
**Currentness:** ACTIVE_WARM
**Could regenerate?** NO (curated vision)
**Authority:** AUTHORITATIVE_LOCK
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. Risk: 0.

---

#### `01-vision/SUFLET_ANDURA.md`

**LOC:** 2266 | **First commit:** 2026-05-02 | **Last commit:** 2026-05-03 | **Folder:** ON_PATTERN | **Inbound:** 6 | **Outbound:** ~12 | **Code refs:** 1 (`src/engine/specialization/weaknessConsumer.js`)
**Status markers:** "SSOT new file 2026-05-02 — COMPLETE (translation map V1 LOCKED + filozofia completă 12k cuvinte INGESTED)"
**Sections:** §0 Provenance / §1 Translation Map suflet → V1 codificabil (75% replicabil + 15% better + 10% irreplicable + 30% V2+ defer) / §2 Ce NU se traduce în V1 / §3 11 LOCKED Decizii Noi (cross-ref §36.16-§36.26) / further philosophical sections
**Conținut:** Filozofia permanentă engine. Material original ~12k cuvinte (`Procesul_de_gandire_complet.md` archive `📤_outbox/_archive/2026-05/55_PROCESUL_DE_GANDIRE_CONSUMED_2026-05-02.md`). 15 patterns + 10 funcții pseudocode F1-F10 + linguistic patterns L1-L8. Daniel verdict *"asta e o bucată din sufletul andura"*. Filter Bugatti dual gate.
**Verbatim duplicate:** Aggregation of original file content (intentional ingestion); decizii §36.16-§36.26 mirrored in HANDOVER_GLOBAL.
**SSOT:** SSOT_ITSELF (filozofia engine)
**Currentness:** ACTIVE_WARM (referenced multiple ADRs + cross-cutting concern source)
**Could regenerate?** NO (philosophical content unique)
**Authority:** AUTHORITATIVE_LOCK (mai sus de ADR — filozofie fundament)
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. Phase B+ drill-down below (>500 LOC). Risk: 0.

---

#### `01-vision/TERMS_OF_SERVICE_V1_BETA.md`

**LOC:** 215 | **First commit:** 2026-05-04 | **Last commit:** 2026-05-04 | **Folder:** ON_PATTERN | **Inbound:** 1 (PRIVACY_POLICY_V1_BETA cross-ref) | **Outbound:** 2 | **Code refs:** 0
**Status markers:** "Updated draft post review 2026-05-04 evening late"; Liability waivers absolute REJECTED note
**Sections:** 1 Cine suntem / 2 Vârsta minimă / 3 Acceptarea termenilor / 4 Cont și securitate / 5 Utilizare pe propriul risc / 6 Fără sfat medical / 7 Conținutul tău / further sections
**Conținut:** Beta-stage Terms of Service Romanian. Operator Constantin Daniel Mazilu PF. Liability wording "în măsura permisă de lege" cu RO consumer law OUG 21/1992 + Codul Civil + EU Consumer Rights Directive 2011/83 — NU absolute waivers. Daniel validate sprint pending.
**Verbatim duplicate:** Original template verbatim in HANDOVER_GLOBAL §56.8.3 LOCKED V1; review amendments unique.
**SSOT:** SSOT_ITSELF (legal doc)
**Currentness:** ACTIVE_HOT (pre-Beta blocker)
**Could regenerate?** NO
**Authority:** AUTHORITATIVE_LOCK
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. Risk: 0.

---

### Group: 02-audit/ (1 active file)

#### `02-audit/COACHING_TEXTBOOK_SYNTHESIS.md`

**LOC:** 320 | **First commit:** 2026-04-25 | **Last commit:** 2026-05-03 | **Folder:** `02-audit/` ON_PATTERN (research reference, NU sprint reports per VAULT_RULES §1) | **Inbound:** 1 | **Outbound:** ~3 | **Code refs:** 0
**Status markers:** "Created: 25 Apr 2026"; "research reference"
**Sections:** TL;DR Verdictul / PARTEA 1 UNDE SUNTEM ALINIAȚI / Filosofie de bază / continued
**Conținut:** Research synthesis textbook coaching personalizat (Opus 131KB) vs Andura. 80% existent vision + 20% pattern-uri concrete + LLM-live ideas contrazic deterministic engine architecture. Generalizat NU Daniel-specific.
**Verbatim duplicate:** Some philosophy paraphrase with PROJECT_VISION + MOAT_STRATEGY (different framing).
**SSOT:** SSOT_ITSELF (research reference per §1 folder convention)
**Currentness:** ACTIVE_WARM
**Could regenerate?** PARTIAL
**Authority:** AUTHORITATIVE_LOCK (research reference)
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. Risk: 0. Note: only file in 02-audit/ — folder valid per VAULT_RULES §1.

---

### Group: 03-decisions/ (42 active files)

**Aggregate ADR view:** 33 numbered ADRs (001-032 — 32 numerical files, NOT 33 per INDEX_MASTER drift) + 9 named ADR_*_v1 + DECISION_LOG. All ACCEPTED status (with explicit AMENDMENT inline per VAULT_RULES §3.1).

#### Numbered ADRs 001-008 (foundational, terse)

| File | LOC | Inbound | Last commit | Status | Code refs | Recommendation |
|---|---|---|---|---|---|---|
| `001-local-first-storage.md` | 20 | 9 | 2026-04-25 | Accepted | 1 | PRESERVE |
| `002-firebase-rest-not-sdk.md` | 21 | 8 | 2026-04-25 | Accepted | 1 | PRESERVE |
| `003-double-progression-engine.md` | 27 | 5 | 2026-04-30 | Accepted | 0 | PRESERVE |
| `004-rule-engine-numeric-priorities.md` | 28 | 4 | 2026-04-30 | Accepted | 0 | PRESERVE |
| `005-vanilla-js-no-framework.md` | 21 | 4 | 2026-04-25 | Accepted | 0 | PRESERVE — **ESCALATE Daniel:** chat-NEW3 React migration direction LOCK pending tactical kickoff (1-2 săpt CC continuous). ADR 005 needs §AMENDMENT inline OR new ADR 033 (architectural inversion). Daniel decision required. |
| `006-tier-storage-for-logs.md` | 25 | 3 | 2026-04-25 | Accepted | 0 | PRESERVE |
| `007-firebase-open-rules.md` | 67 | 5 | 2026-05-02 | Accepted (amended 2026-05-02 inline §AMENDMENT) | 0 | PRESERVE |
| `008-vitest-playwright-testing.md` | 24 | 5 | 2026-04-30 | Accepted | 0 | PRESERVE |

**Group rationale:** Foundational ADRs ZERO archive risk. ADR 005 vanilla-js flagged ESCALATE due to chat-NEW3 React migration direction LOCK.

#### Numbered ADRs 009-021 (mature)

| File | LOC | Inbound | Last | Status | Code refs | Recommendation |
|---|---|---|---|---|---|---|
| `009-calibration-tiers.md` | 378 | 54 | 2026-04-30 | Accepted (amended 2026-04-30 inline) | 2 | PRESERVE — high-inbound foundation |
| `010-no-anthropic-trademark-public.md` | 122 | 4 | 2026-04-25 | Active | 0 | PRESERVE |
| `011-coach-decision-log-architecture.md` | 467 | 28 | 2026-04-30 | Accepted (schema extended + LWW→T&B amendment 2026-04-30) | 1 | PRESERVE — high-inbound foundation |
| `012-tier-decay-on-inactivity.md` | 66 | 3 | 2026-04-26 | Accepted | 0 | PRESERVE |
| `013-auto-aggression-detection.md` | 401 | 15 | 2026-04-26 | Accepted (impl COMPLETĂ post TASK #7) | 0 | PRESERVE |
| `014-onboarding-profile-typing.md` | 869 | 18 | 2026-04-27 | Accepted (wording update 2026-04-27) | 0 | PRESERVE; B+ drill-down |
| `015-getbf-calibration-only.md` | 98 | 3 | 2026-04-27 | Accepted (closes getBF dead code) | 0 | PRESERVE |
| `016-vitality-layer.md` | 779 | 8 | 2026-04-27 | Accepted (depends ADR 018) | 0 | PRESERVE; B+ drill-down |
| `017-demographic-prior-database.md` | 1011 | 22 | 2026-04-27 | Accepted (depends ADR 018) | 0 | PRESERVE; B+ drill-down |
| `018-engine-extensibility-architecture.md` | 557 | 62 | 2026-04-27 | Accepted (foundation NEXT) | 0 | PRESERVE — critical foundation; B+ drill-down |
| `019-gdpr-k-anonymity-validation.md` | 141 | 1 | 2026-04-30 | Accepted (k=5 quasi-identifiers) | 0 | PRESERVE |
| `020-storage-tiering-strategy.md` | 182 | 7 | 2026-04-30 | Accepted | 0 | PRESERVE |
| `021-calibration-drift-reconciliation.md` | 295 | 7 | 2026-04-30 | Accepted | 0 | PRESERVE |

**Verbatim duplicate detection (group):** Each ADR self-contained; minor §AMENDMENT cross-refs only. NU strict verbatim spans across ADRs. ADR 011 schema details overlap structurally with COGNITIVE_ARCHITECTURE_SPEC_v1 (linked, NOT duplicate).

#### Numbered ADRs 022-032 (recent spec-flipped or stub/SPEC REFERENCE)

| File | LOC | Inbound | Last | Status | Code refs | Recommendation |
|---|---|---|---|---|---|---|
| `022-bayesian-nutrition-inference.md` | 167 | 29 | 2026-05-04 + 2026-05-05 birou | 🟢 SPEC READY V1 | 1 | PRESERVE — high-inbound complementary detail to ADR 026 §9.4 (NU file flip) |
| `023-llm-intent-interpretation.md` | 164 | 17 | 2026-05-03 | ✅ LOCKED V1 partial spec | 0 | PRESERVE; FULL spec addendum PENDING per DIFF_FLAGS P1-FLAG-1 |
| `024-goal-driven-program-templates.md` | 215 | 19 | 2026-05-06 | 🟢 SPEC READY V1 — COMPILE DRAFT FULL | 0 | PRESERVE (compile complete) |
| `025-andura-gandeste-pentru-user.md` | 95 | 27 | 2026-05-04 | 🟡 CANDIDATE / STUB (full spec deferred dedicated chat) | 0 | PRESERVE — high-inbound stub OK |
| `026-offline-coaching-decision-tree-exhaustive.md` | 1949 | 78 | cross-refs cleanup `6e30bfc` 2026-05-06 | ✅ LOCKED V1 — COMPILE DRAFT FULL (129 decisions aggregate) | 10 | PRESERVE — biggest ADR + 2nd highest inbound + 10 src refs (BLOCKING_ARCHIVE); B+ drill-down |
| `027-engine-energy-adjustment.md` | 47 | 7 | 2026-05-06 chat-8 flip | 🔵 SPEC REFERENCE redirect §9.3 | 1 | PRESERVE (redirect-only post `dccda1f`) |
| `028-engine-tempo-form-cues.md` | 48 | 22 | 2026-05-06 chat-8 flip | 🔵 SPEC REFERENCE redirect §9.5 | 0 | PRESERVE (redirect-only) |
| `029-engine-specialization.md` | 50 | 19 | 2026-05-06 chat-8 flip | 🔵 SPEC REFERENCE redirect §9.6 | 0 | PRESERVE (redirect-only) |
| `030-adapter-design-pattern.md` | 239 | 16 | 2026-05-06 morning | 🟢 SPEC READY V1 partial D1-D5 + Open Q-uri Q-OPEN-1→7 PENDING | 6 | PRESERVE; 6 src refs BLOCKING_ARCHIVE |
| `031-engine-warmup-mobility.md` | 43 | 4 | 2026-05-06 chat-8 create direct | 🔵 SPEC REFERENCE redirect §9.7 | 0 | PRESERVE (redirect-only) |
| `032-engine-deload-protocol.md` | 45 | 4 | 2026-05-06 chat-8 create direct | 🔵 SPEC REFERENCE redirect §9.8 | 0 | PRESERVE (redirect-only) |

**Group conținut:** ADR 026 = META-architecture global concerns SSOT (129 decisions aggregate: 10 base §42 + 75 spec §45 + 44 D-cluster §50). 22 engines = 14 reactive existing + 8 prescriptive NEW per §36.100. Pipeline §42.10 V1 COMPLETE 8/8.

**Verbatim duplicate detection (group):** ADR 026 §9.X = aggregation verbatim from chat strategic sources (intentional consolidation). ADR 022/024 SPEC READY V1 detail complementary, NOT duplicate of §9.4/§9.2. ADR 027-029+031-032 = redirect-only files.

#### Named ADRs (9)

| File | LOC | Inbound | Last | Status | Code refs | Recommendation |
|---|---|---|---|---|---|---|
| `ADR_BIAS_DETECTION_OBSERVABLE_v1.md` | 118 | 4 | 2026-05-02 | ✅ LOCKED V1 (0 amendments) | 1 | PRESERVE |
| `ADR_CASCADE_DEFENSE_v1.md` | 146 | 7 | 2026-05-02 | ✅ LOCKED V1 (0 amendments) | 5 | PRESERVE; 5 src refs BLOCKING_ARCHIVE |
| `ADR_COMPOSITE_SIGNAL_LAYER_v1.md` | 66 | 3 | 2026-05-02 | LOCKED V1 | 1 | PRESERVE |
| `ADR_MODE_DETECTION_UI_v1.md` | 207 | 5 | 2026-05-02 | ✅ LOCKED V1 (3 amendments aplicate per §36.57) | 1 | PRESERVE |
| `ADR_MULTI_TENANT_AUTH_v1.md` | 621 | 28 | AMENDMENT 2026-05-04 | Accepted — Faza 1 LANDED, Faza 2+3 deferred | 6 | PRESERVE; high-inbound + 6 src refs; B+ drill-down |
| `ADR_OUTLIER_FILTER_v1.md` | 186 | 11 | 2026-05-02 | ✅ LOCKED V1 (1 amendment per §36.57) | 2 | PRESERVE |
| `ADR_PAIN_DISCOMFORT_BUTTON_v1.md` | 129 | 14 | 2026-05-02 | LOCKED V1 (with EXT-1) | 1 | PRESERVE |
| `ADR_RIR_MATRIX_ADAPTIVE_v1.md` | 85 | 4 | 2026-05-02 | ✅ LOCKED V1 (clean LOCK; spec gap hybrid Sprint 4.x) | 1 | PRESERVE |
| `ADR_SMART_ROUTING_EQUIPMENT_v1.md` | 83 | 4 | 2026-05-02 | LOCKED V1 | 1 | PRESERVE |

**Group authority:** All AUTHORITATIVE_LOCK. Inbound counts moderate-high (4-28). All single-topic.

#### `03-decisions/DECISION_LOG.md`

**LOC:** 1880 | **First commit:** 2026-04-25 | **Last commit:** 2026-05-07 | **Folder:** `03-decisions/` ON_PATTERN | **Inbound:** 34 | **Outbound:** ~30+ | **Code refs:** 1 (`src/storage/tier2Stub.js`)
**Sections:** Cronologic descending — 2026-05-07 chat-NEW3 + chat-NEW2 + chat-NEW1 + chat-9 closure + chat-8 evening pipeline closure + chat-5 + chat-4 + chat-3 + ADR 026 §9.X compile entries + §62-§73 Auth Flow Batch 1-6 + §50-§55 D-cluster + §45-§49 ADR 026 SPEC SESSION COMPLETE + §41-§44 Vault Hygiene Sprint Faza 3+4 + entries since 2026-04-25
**Conținut:** Master cronologic log per VAULT_RULES §SSOT PRINCIPLE LOCKS #3. Append-only descending. Entries reference HANDOVER_GLOBAL §X verbatim per §HANDOVER_PROTOCOL STEP 16 amendment.
**Verbatim duplicate detection:** Many entries condense + reference HANDOVER_GLOBAL (BY DESIGN — DECISION_LOG = master cronologic). Same decisions appear in CURRENT_STATE §JUST_DECIDED top + DECISION_LOG (mirror per CC.6).
**SSOT:** SSOT_ITSELF (master log)
**Currentness:** ACTIVE_HOT (last commit 2026-05-07)
**Could regenerate?** NO
**Authority:** AUTHORITATIVE_LOCK
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. B+ drill-down below. Risk: 0.

---

### Group: 04-architecture/ (8 active files)

| File | LOC | Inbound | Last commit | Status | Code refs | Recommendation |
|---|---|---|---|---|---|---|
| `ANDURA_VALIDATION_FRAMEWORK_V1.md` | 414 | 5 | 2026-05-05 evening | LOCKED V1 (north star ≥95% strict + match weights Safety-dominant + corpus 500) | 1 (matchMetric.js) | PRESERVE |
| `COGNITIVE_ARCHITECTURE_SPEC_v1.md` | 492 | 28 | 2026-04-28 NIGHT + amendments | DRAFT spec ready ADR formal write (75 architectural points; 5-engine arch + ARBITRATOR central) | 0 | PRESERVE — high-inbound foundation |
| `DATA_REGISTRY_SPEC.md` | 88 | 1 | 2026-04-25 (Task #27) | ACTIVE (fixes C11c+H31c+H32c) | 0 | PRESERVE |
| `FAZA_2_FILTER_STRATEGY_V1.md` | 215 | 5 | recent | SPEC DRAFT V1 — pending Daniel LOCK | 0 | PRESERVE |
| `MULTI_TENANT_AUTH_MIGRATION_SPEC.md` | 280 | 4 | 2026-04-30 | DRAFT spec ready Sprint 3 implementation; cross-ref AUDIT_5000Q Q-0353/1053/1055 | 1 | PRESERVE |
| `mockups/README.md` | 64 | 0 (new folder index) | 2026-05-07 chat-NEW3 | NEW post chat-NEW3 mockup canonical V2 path | 0 | PRESERVE |
| `SCENARIOS_SIMULATOR_DESIGN_V1.md` | 380 | 5 | recent | SPEC DRAFT V1 — pending Daniel LOCK | 6 (BLOCKING_ARCHIVE — simulator/*) | PRESERVE; 6 src refs |
| `TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC.md` | 333 | 3 | 2026-04-30 | DRAFT spec ready Sprint 3 (LWW→T&B replacement) | 1 | PRESERVE |

**Group conținut:** Architecture specs canonical. ANDURA_VALIDATION_FRAMEWORK_V1 = ground truth Andura ≥95% Claude parity north star (Bugatti philosophy + 500 query corpus). COGNITIVE_ARCHITECTURE_SPEC_v1 = canonical 5-engine architecture cu ARBITRATOR central. mockups/README.md NEW path canonical from chat-NEW3 — index for `andura-v2-2026-05-07.html` (2126 LOC HTML mockup, NOT in this audit scope per `*.md` filter).

**Verbatim duplicate detection (group):** SCENARIOS_SIMULATOR + FAZA_2_FILTER companion specs (refs each other, NU duplicate). MULTI_TENANT_AUTH_MIGRATION_SPEC + ADR_MULTI_TENANT_AUTH_v1 = companion (ADR = decision, SPEC = implementation detail). NO strict verbatim spans across.

---

### Group: 05-findings-tracker/ (3 active files)

| File | LOC | Inbound | Last | Status | Code refs | Recommendation |
|---|---|---|---|---|---|---|
| `AUDIT_30_9_BLOCKED_STATE.md` | 65 | 1 | 2026-04-26 | DEFERRED — caller cleanup + Daniel sign-off required | 0 | PRESERVE — Daniel decision pending; preserve audit trail |
| `FINDINGS_MASTER.md` | 462 | 5 | 2026-05-02 | Active tracker, 135 findings unique post Sprint 4.x | 0 | PRESERVE — canonical bug tracker per VAULT_RULES §SSOT PRINCIPLE LOCK #4 |
| `INSIGHTS_BACKLOG.md` | 320 | 2 | recent (post-2026-05-04 evening AUTH-DEFER entries) | Active backlog v1.5+ deferrals | 0 | PRESERVE — canonical insights backlog per §SSOT PRINCIPLE LOCK #4 |

**Group:** All ACTIVE_SSOT_PRESERVE. NO archive risk.

---

### Group: 06-sessions-log/ (9 active files — CRITICAL group)

#### `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`

**LOC:** 143 | **First commit:** 2026-04-30 | **Last commit:** 2026-05-05 (split atomic) | **Folder:** ON_PATTERN | **Inbound:** 91 (HIGHEST in vault) | **Outbound:** 7 theme files | **Code refs:** 1 (`src/simulator/invariants.js`)
**Status markers:** "Split executed atomic 2026-05-05 overnight per §62.2 thematic split strategy LOCKED V1"; "**navigation index post-split**"
**Sections:** Theme Files (post-split) list / Section → File Mapping (full table)
**Conținut:** Master INDEX file post-split. Original ~7673 LOC split into 7 theme files (zero data loss). Wikilinks `[[HANDOVER_GLOBAL_2026-04-30_evening|...]]` resolve to this navigation hub; section→file mapping table provides 1-hop drill-down. Theme files: AUTH_FLOW (715), ENGINES_SPEC (426), ONBOARDING_T0 (72), DECISION_CLUSTER_D1_D4 (527), VAULT_HYGIENE (127), SCENARIOS_COVERAGE (146), MISC (5716).
**Verbatim duplicate detection:** This is the navigation index — content split-pointers, NOT verbatim. Theme files contain split content (no overlap by-design).
**SSOT relationship:** SSOT_ITSELF (master navigation post-split) — referenced 91 times across vault as canonical handle.
**Currentness:** ACTIVE_HOT (highest inbound; navigation hub)
**Could regenerate?** PARTIAL (mapping table can be re-derived from theme files; index narrative cannot)
**Authority:** META (navigation post-split)
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE (CRITICAL). Highest-inbound file in vault — break = catastrophic. Risk: 0 archive.

---

#### `06-sessions-log/HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05.md`

**LOC:** 171 | **First commit:** 2026-05-05 | **Last commit:** 2026-05-05 | **Folder:** ON_PATTERN | **Inbound:** 0 | **Outbound:** 7 (theme files) | **Code refs:** 0
**Status markers:** "📋 PLAN READY — execution DEFERRED to dedicated session" (UPDATE: SPLIT WAS EXECUTED 2026-05-05 overnight per HANDOVER_GLOBAL header). PLAN file is now historical.
**Sections:** §1 Theme File Mapping / §2 Wikilink Inventory / §3 Risk Mitigation / §4 Execution Steps
**Conținut:** Pre-execution thematic split plan. Replaced by execution. Per CURRENT_STATE chat-NEW3 carry-over Capacity A LOCKED candidate, this is "HANDOVER_GLOBAL_SPLIT_PLAN" listed în pre-flight grep wikilinks orphane mandatory.
**Verbatim duplicate:** Plan→execution mapping verbatim in HANDOVER_GLOBAL_2026-04-30_evening (Section → File Mapping table). Once execution complete, plan = redundant historical doc.
**SSOT:** Plan supplanted by INDEX file post-execution.
**Currentness:** DORMANT (plan executed; only historical value as audit trail of decision)
**Could regenerate?** YES (already mirror of executed split)
**Authority:** META (historical plan, outranked by post-execution state)
**RECOMMENDATION:** ARCHIVE_FULL → `📤_outbox/_archive/2026-05/<NN>_HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05_DEPRECATED.md` candidate. **Per Capacity A LOCKED candidates (CURRENT_STATE chat-NEW3 §JUST_DECIDED #3):** scope ext "archive selective HANDOVER_GLOBAL split 7 themes sections superseded SSOT (long-term hygiene post-Faza 3)". This file is redundant historical artifact post-execution. Inbound 0 = zero break risk. ESCALATE_DANIEL: confirm archive plan-only file OR PRESERVE for vault hygiene precedent. Risk flags: BREAK_WIKILINKS_0 (zero inbound). Dependencies: NONE. **Suggested Capacity A scope ext.**

---

#### `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md`

**LOC:** 715 | **First commit:** 2026-05-05 | **Last commit:** 2026-05-05 | **Folder:** ON_PATTERN | **Inbound:** 5 | **Outbound:** ~10 | **Code refs:** 8 (`src/components/deleteAccountModal.js`, `emailChangeForm.js`, `forkDecisionModal.js`, `logoutModal.js`, `recoveryEmailLostModal.js`, `src/pages/settings.js`, `src/util/adminCleanupHelpers.js`, `src/util/telemetry.js`)
**Status markers:** Theme split content per §62.2 LOCKED V1
**Sections:** §56 Auth Flow §36.80 BUG 2 RESOLUTION (35 sub-decisions §56.1-§56.19) + §57-§61 cumulative + §62-§68 BATCH 1-6 + §66 BATCH 5 RPE/RIR + §67 BATCH 6 Safety + §68 CLOSURE
**Conținut:** Theme split — Auth Flow §36.80 BUG 2 RESOLUTION 35 sub-decisions LOCKED V1 + Phase 1 wiring + Phase 2 spec + BATCH 1-6 closure. Phase B+ drill-down below (>500 LOC).
**Verbatim duplicate:** Verbatim split from HANDOVER_GLOBAL_2026-04-30_evening original. ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04 inline contains §56.1-§56.19 verbatim (companion).
**SSOT:** Theme SSOT (per split protocol)
**Currentness:** ACTIVE_HOT (Auth Flow Phase 2 implementation pending Priority 1 ABSOLUT per CURRENT_STATE)
**Could regenerate?** NO (split spec content; aggregate of chat strategic decisions)
**Authority:** AUTHORITATIVE_LOCK (theme content per ADR_MULTI_TENANT_AUTH cross-ref)
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. **8 code refs BLOCKING_ARCHIVE absolutely.** Risk: 0.

---

#### `06-sessions-log/HANDOVER_DECISION_CLUSTER_D1_D4_2026-04-30_evening.md`

**LOC:** 527 | **First commit:** 2026-05-05 | **Last commit:** 2026-05-05 | **Folder:** ON_PATTERN | **Inbound:** 4 | **Outbound:** ~5 | **Code refs:** 0
**Sections:** §50 D-cluster sub-decisions LOCKED V1 (§50.1 D3.1 + §50.2 D4 + §50.3 D2 + §50.4 D1) — 44 substantive net + §51-§55 cumulative + DIFF_FLAGS update
**Conținut:** Theme split — D1+D2+D3.1+D4 sub-decisions LOCKED V1 (44 net post-overlap). Cross-ref ADR 026 §9.X integration. Phase B+ drill-down below.
**Verbatim duplicate:** Split verbatim from HANDOVER_GLOBAL original. Mirror in DECISION_LOG (condensed).
**SSOT:** Theme SSOT
**Currentness:** ACTIVE_WARM (D-cluster decisions LOCKED, ADR 026 §9 covers many)
**Could regenerate?** NO
**Authority:** AUTHORITATIVE_LOCK
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. Risk: 0.

---

#### `06-sessions-log/HANDOVER_ENGINES_SPEC_2026-04-30_evening.md`

**LOC:** 426 | **First commit:** 2026-05-05 | **Last commit:** 2026-05-05 | **Folder:** ON_PATTERN | **Inbound:** 4 | **Outbound:** ~6 | **Code refs:** 0
**Sections:** §42 ADR 026 Spec Decisions 1-10 LOCKED + §43-§44 cumulative + §45 ADR 026 Spec Session COMPLETE 75 decisions + §46 next actions + §65 BATCH 4 Engine #8 + §36.99 ADR 026 candidate + §36.100 7→8 Engines Roadmap + §36.105 Pivot "More Engine Less LLM"
**Conținut:** Theme split — ADR 026 spec sessions cumulative + Engines #1-#8 roadmap. Most content also exists in ADR 026 (§9.X canonical SSOT) post-pipeline closure.
**Verbatim duplicate:** Verbatim split. ADR 026 §9.X compile aggregates §42 + §45 + §50 sources. POTENTIAL CONSOLIDATION: post ADR 026 compile complete + 8/8 V1 LANDED, this theme file = redundant pointer to ADR 026.
**SSOT:** Theme SSOT (split protocol) — but ADR 026 §9.X = canonical post-compile.
**Currentness:** ACTIVE_WARM_TO_DORMANT (post-pipeline closure ADR 026 covers content)
**Could regenerate?** YES (ADR 026 §9.X aggregation already done)
**Authority:** META (theme split, content superseded by ADR 026 §9.X canonical post 8/8 closure)
**RECOMMENDATION:** PRESERVE (immediate) BUT candidate ARCHIVE_FULL post Faza 3 STRANGLER (long-term Capacity A scope ext per CURRENT_STATE chat-NEW3 §JUST_DECIDED #3 *"archive selective HANDOVER_GLOBAL split 7 themes sections superseded SSOT (long-term hygiene post-Faza 3)"*). Inbound 4 — REDIRECT plan: §ACTIVE_REFS pointers + named ADR cross-refs → ADR 026 §9.X. Risk: BREAK_WIKILINKS_4 if archive without REDIRECT. Dependencies pre-archive: REDIRECT 4 inbound + Faza 3 STRANGLER complete (engines wired, ADR 026 §9.X canonical confirmed in production). **ESCALATE_DANIEL — long-term scope.**

---

#### `06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md`

**LOC:** 5716 | **First commit:** 2026-05-05 | **Last commit:** 2026-05-05 | **Folder:** ON_PATTERN | **Inbound:** 6 | **Outbound:** ~30+ | **Code refs:** 0
**Status markers:** "Misc / Historical residual — §1-§35 historical context (pricing/sprint/rebrand/templates v1) + §36.1-§36.98 majority misc (deferred TWA / Faza 4 codification / sprint UI / etc.) + §36.103-§36.104 + §37-§40"
**Sections:** §0 STATUS ACTUAL / §1-§35 historical / §36.1-§36.98 misc / §36.103-§36.104 + §37-§40 — see HANDOVER_GLOBAL Section→File mapping table for complete list
**Conținut:** BULK content of original HANDOVER_GLOBAL pre-split (5716 LOC = 75% of original 7673). Historical context + cross-cutting SSOT items not assigned to specific theme. Many sections superseded:
- §3 PRICING DEPRECATED 2026-05-02 Chat D §36.50/§36.52/§36.53/§36.9
- §29 SAFETY NUTRITION + 4 TEMPLATES → moved to PRODUCT_STRATEGY_SPEC_v1 §AMENDMENT
- §26 GOAL-CA-SETTING + 8 TEMPLATES → ONBOARDING_SSOT_V1 consolidates
- §16 ADR 020 STORAGE TIERING PHASE 1 → ADR 020 final + commit
- §22 FINDINGS NOI 2026-05-01 → FINDINGS_MASTER.md
- §36.x cluster majority covered ADR 026 §9.X canonical post-pipeline closure
**Verbatim duplicate detection:**
- §3 pricing block verbatim outdated by §36.50 (DEPRECATED markers preserved)
- §26 templates V1 verbatim covered ONBOARDING_SSOT_V1 §1
- §29 safety nutrition templates verbatim covered PRODUCT_STRATEGY §AMENDMENT
- §16 ADR 020 narrative duplicates ADR 020 file content
- §22 F-NEW-1 to F-NEW-4 narrative duplicates FINDINGS_MASTER entries
- Many §36.x cluster items duplicated/superseded in ADR 026 §9.X compile (§9.1-§9.8 = aggregation §42 + §45 + §50 sources verbatim)

**SSOT:** Theme SSOT (split protocol) — but content largely superseded post:
1. ADR 026 §9.X compile complete (8/8 commits)
2. ONBOARDING_SSOT_V1 consolidation
3. PRODUCT_STRATEGY_SPEC_v1 inline amendments
4. FINDINGS_MASTER.md
5. Pricing §36.50 LOCKED supersedes §3
**Currentness:** DORMANT (historical narrative, content largely superseded)
**Could regenerate?** PARTIAL (some unique narratives + Daniel-isms; canonical decisions migrated to canonical SSOTs)
**Authority:** META (theme split historical bulk; LOCKED decisions live in canonical files now)
**Outbox archive duplicate:** Multiple `📤_outbox/_archive/2026-05/*HANDOVER_INPUT_CONSUMED*.md` files contain verbatim source content (e.g., `131_HANDOVER_INPUT_2026-05-04_AUTH_FLOW_BATCH_1_6_63_LOCKED_CONSUMED.md`).
**RECOMMENDATION:** **🚨 ARCHIVE_FULL CANDIDATE — Capacity A LOCKED #3 (chat-NEW3)** → `📤_outbox/_archive/2026-05/<NN>_HANDOVER_MISC_2026-04-30_evening_CAPACITY_A_DEPRECATED.md`. Verbatim per CURRENT_STATE §JUST_DECIDED chat-NEW3 entry #3: *"Capacity Opțiunea A LANDED archive `HANDOVER_VAULT_HYGIENE` + `HANDOVER_MISC` + REMOVE/REDIRECT pointers orphane CURRENT_STATE §ACTIVE_REFS (§41-§45 + §36.99-§36.107) — covered acum în ADR 026 §9.X canonical post-pipeline closure"*. Inbound 6 must REDIRECT first (CURRENT_STATE §ACTIVE_REFS pointers + INDEX_MASTER NAVIGARE table). Risk: BREAK_WIKILINKS_6 if archive without REDIRECT. **Dependencies pre-archive (topological):** (1) Pre-flight grep wikilinks orphane mandatory `HANDOVER_MISC|HANDOVER_VAULT_HYGIENE|HANDOVER_ONBOARDING_T0|HANDOVER_GLOBAL_SPLIT_PLAN` (per chat-NEW3 spec); (2) REDIRECT inbound (6) → canonical SSOTs (ADR 026 §9.X / ONBOARDING_SSOT_V1 / PRODUCT_STRATEGY / FINDINGS_MASTER); (3) UPDATE INDEX_MASTER VAULT CLEANUP HISTORY entry. Phase B+ drill-down below (>500 LOC).

---

#### `06-sessions-log/HANDOVER_ONBOARDING_T0_2026-04-30_evening.md`

**LOC:** 72 | **First commit:** 2026-05-05 | **Last commit:** 2026-05-05 | **Folder:** ON_PATTERN | **Inbound:** 4 | **Outbound:** ~3 | **Code refs:** 0
**Sections:** §36.101 5 Voices Cognitive Architecture CONFIRMED / §36.102 Goal Lifecycle Change Reconfirmed First-Class / (T0 Mechanics 75 LOCKED V1 sections — currently dispersed în §36.x cluster — gap noted in split plan)
**Conținut:** Theme split — 5 voices + Goal Lifecycle. Theme is sparse (only 72 LOC) — most T0 content elsewhere.
**Verbatim duplicate:** Content overlaps COGNITIVE_ARCHITECTURE_SPEC_v1 (5 voices) + ONBOARDING_SSOT_V1.
**SSOT:** Theme SSOT (sparse split)
**Currentness:** ACTIVE_WARM (limited content but referenced)
**Could regenerate?** YES (largely covered ONBOARDING_SSOT_V1 + COGNITIVE_ARCHITECTURE_SPEC_v1)
**Authority:** META (theme split)
**RECOMMENDATION:** PRESERVE (immediate, minimal cost). Long-term: candidate ARCHIVE post Faza 3 if Daniel chooses sparse-theme cleanup. ESCALATE_DANIEL low priority.

---

#### `06-sessions-log/HANDOVER_SCENARIOS_COVERAGE_2026-04-30_evening.md`

**LOC:** 146 | **First commit:** 2026-05-05 | **Last commit:** 2026-05-05 | **Folder:** ON_PATTERN | **Inbound:** 4 | **Outbound:** ~3 | **Code refs:** 0
**Sections:** §69 Scenarios Coverage 1500-2000 PRE-BETA BLOCKER + §70 Cumulative LOCKED 243→306 + §71 Priority order updated + §72 DIFF_FLAGS + §73 Cross-refs comprehensive
**Conținut:** Theme split — Scenarios Coverage PRE-BETA BLOCKER NEW + cumulative tracking. Active flag DIFF_FLAGS P1-FLAG-SCENARIOS-COVERAGE preserved 🔴 OPEN.
**Verbatim duplicate:** Mirrored DIFF_FLAGS.md entry + DECISION_LOG condensed.
**SSOT:** Theme SSOT
**Currentness:** ACTIVE_HOT (PRE-BETA blocker active)
**Could regenerate?** NO (active blocker)
**Authority:** AUTHORITATIVE_LOCK (DIFF_FLAGS source)
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. Risk: 0.

---

#### `06-sessions-log/HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md`

**LOC:** 127 | **First commit:** 2026-05-05 | **Last commit:** 2026-05-05 | **Folder:** ON_PATTERN | **Inbound:** 6 | **Outbound:** ~3 | **Code refs:** 0
**Sections:** §41 Vault Hygiene Sprint Faza 3+4 COMPLETE / §47 Alignment Questions Generation Rule LOCKED V1 / §48 DIFF_FLAGS post night / §49 Verification Q topics
**Conținut:** Theme split — Vault Hygiene Sprint Faza 3+4 + Alignment Rule LOCKED V1. 8 recomandări A-H executate per HANDOVER_GLOBAL §41. CC Opus autonomous run ~25min. ZERO src/tests/scripts touched.
**Verbatim duplicate:** §47 Alignment Rule fully copied/paraphrased in `VAULT_RULES.md` §HANDOVER_PROTOCOL step 9 amendment + `PROMPT_CC_HYGIENE.md` §9 amendment (per chat-NEW3 §JUST_DECIDED #3 — covered SSOT canonical). §41 Vault Hygiene Faza 3+4 details mirrored in INDEX_MASTER VAULT CLEANUP HISTORY + DECISION_LOG entries 2026-05-04 evening (verbatim summary).
**SSOT:** Theme SSOT — content fully covered VAULT_RULES + INDEX_MASTER + DECISION_LOG canonical.
**Currentness:** DORMANT (one-time hygiene sprint complete; Faza 4 codified VAULT_RULES.md §VAULT_HYGIENE_PASS already)
**Could regenerate?** YES (content canonical in VAULT_RULES + INDEX_MASTER + DECISION_LOG)
**Authority:** META (theme split historical, content authoritative-superseded by VAULT_RULES §VAULT_HYGIENE_PASS + §47 amendment)
**RECOMMENDATION:** **🚨 ARCHIVE_FULL CANDIDATE — Capacity A LOCKED #3 (chat-NEW3)** → `📤_outbox/_archive/2026-05/<NN>_HANDOVER_VAULT_HYGIENE_2026-04-30_evening_CAPACITY_A_DEPRECATED.md`. Verbatim per CURRENT_STATE §JUST_DECIDED chat-NEW3 entry #3 (Capacity A LOCKED list). Inbound 6 must REDIRECT first → VAULT_RULES §VAULT_HYGIENE_PASS / VAULT_RULES §HANDOVER_PROTOCOL step 9 amendment / INDEX_MASTER VAULT CLEANUP HISTORY. **Dependencies pre-archive:** (1) Pre-flight grep wikilinks orphane mandatory; (2) REDIRECT inbound (6); (3) UPDATE INDEX_MASTER cross-refs.

---

### Group: 07-meta/ (1 active file)

#### `07-meta/CLAUDE_CODE_RULES.md`

**LOC:** 81 | **First commit:** 2026-04-25 | **Last commit:** 2026-05-03 | **Folder:** ON_PATTERN | **Inbound:** 1 | **Outbound:** 0 | **Code refs:** 0
**Sections:** Auto-push / Commit message convention / Working dir rules
**Conținut:** Project rules CC Opus auto-push hook config + commit conventions. Companion to `.claude/settings.json`.
**Verbatim duplicate:** None.
**SSOT:** SSOT_ITSELF (CC operational rules)
**Currentness:** ACTIVE_WARM
**Could regenerate?** NO
**Authority:** AUTHORITATIVE_LOCK (operational)
**RECOMMENDATION:** ACTIVE_SSOT_PRESERVE. Risk: 0.

---

### Group: 08-workflows/ (5 active files)

| File | LOC | Inbound | Last | Status | Code refs | Recommendation |
|---|---|---|---|---|---|---|
| `CHAT_MIGRATION_PROTOCOL.md` | 386 | 1 | 2026-05-04 | v5 — §CHAT_CONTINUITY_PROTOCOL integration | 0 | PRESERVE |
| `CLAUDE_CHAT_INFRASTRUCTURE.md` | 240 | 2 | 2026-04-25 | v2 corrected post live testing | 0 | PRESERVE |
| `FORWARD_COMPAT_PRINCIPLES.md` | 312 | 1 | recent | (FCP doc) | 0 | PRESERVE |
| `HANDOVER_TEMPLATE.md` | 130 | 1 | recent | active template | 0 | PRESERVE |
| `MODEL_UPGRADE_AUDIT_PROTOCOL.md` | 285 | 1 | recent | active protocol | 0 | PRESERVE |

**Group conținut:** Workflow infrastructure SSOT-uri. CHAT_MIGRATION_PROTOCOL v5 = bonding/style rules; VAULT_RULES §CHAT_CONTINUITY_PROTOCOL §CC.2 = layered read order canonical (authority split documented in CHAT_MIGRATION_PROTOCOL header).

**Verbatim duplicate detection:** None significant. CHAT_MIGRATION_PROTOCOL points to VAULT_RULES §CC.2 for layered read (anti-duplicate authority split).

**Group:** All ACTIVE_SSOT_PRESERVE. NO archive risk.

---

### Group: tests/ + scripts/ + simulations/ (6 small README/baseline files)

| File | LOC | Inbound | Last | Status | Recommendation |
|---|---|---|---|---|---|
| `tests/golden-master/mutation/baseline_2026-05-06.md` | ~30 | 0 | 2026-05-06 | active baseline | PRESERVE |
| `tests/golden-master/mutation/README.md` | ~25 | 0 | recent | tests README | PRESERVE |
| `tests/golden-master/profiles/manual/README.md` | ~15 | 0 | recent | manual profile README | PRESERVE |
| `scripts/admin-cleanup.README.md` | ~30 | 0 | recent | scripts README | PRESERVE |
| `scripts/README.md` | ~25 | 0 | recent | scripts README | PRESERVE |
| `simulations/README.md` | ~25 | 0 | recent | simulations README | PRESERVE |

**Note:** These are inside `tests/`, `scripts/`, `simulations/` — per VAULT_RULES §1 + §SSOT PRINCIPLE LOCKS #5 these folders are NU vault. README.md files in them = scoped documentation inline. Audit included them per files.txt scope (`*.md` filter).

**Group:** All PRESERVE (touch zero per VAULT_RULES §SSOT PRINCIPLE LOCK #5).

---

### Group: root (7 active files)

| File | LOC | Inbound | Last | Status | Recommendation |
|---|---|---|---|---|---|
| `CLAUDE.md` | 14 | 0 (memory rule injection) | 2026-05-04 chat-3 PS | NEW project root cu OUTPUT STYLE max 2 linii post-task | PRESERVE |
| `DIFF_FLAGS.md` | 95 | 4 | 2026-05-05 overnight | post HANDOVER split P1-FLAG-HANDOVER-SPLIT 🟢 RESOLVED | PRESERVE — root canonical per VAULT_RULES §1 |
| `PROMPT_CC_HYGIENE.md` | 487 | 4 | recent §47 amendment + §10 fast handover | active reusable Opus prompt | PRESERVE; B+ drill-down |
| `PROMPT_CC_INGEST_HANDOVER.md` | 60 | 0 | recent | small task-specific prompt | PRESERVE |
| `README.md` | 78 | 1 | recent | repo intro | PRESERVE |
| `VAULT_RULES.md` | 630 | 14 | recent (§CHAT_CONTINUITY_PROTOCOL + §HANDOVER_PROTOCOL STEP 16 amendment) | authoritative rules | PRESERVE; B+ drill-down |
| `📤_outbox/LATEST.md` | 207 | 0 | 2026-05-07 (current cycle) | per VAULT_RULES §3.3 SSOT cycle | PRESERVE — current report cycle |

**Group:** All ACTIVE_SSOT_PRESERVE. VAULT_RULES = highest authority root. PROMPT_CC_HYGIENE = reusable Opus runtime prompt.

---

## Phase B+ — Per-section drill-down for files >500 LOC (14 files)

### B+ `00-index/CURRENT_STATE.md` (1829 LOC)

| § | Line range | LOC | Topic | SSOT replacement | Verbatim duplicate? | Recommendation per-section |
|---|---|---|---|---|---|---|
| `## NOW` (chat-NEW3 active) | 17-50 | 34 | Active conversation thread chat-NEW3 birou | SSOT_ITSELF | NO | PRESERVE (active thread) |
| `## NOW (precedent compressed)` ×8 | 51-343 | 293 | chat-NEW2 / chat-NEW1 / chat-9 / chat-8 / chat-5 / chat-4 / chat-3 + earlier strata | SSOT_ITSELF | Some paraphrase to DECISION_LOG | PRESERVE current; LONG-TERM truncate older strata to HANDOVER_GLOBAL deep when DRIFT_CHECK shows >50 LOC violation |
| `## JUST DECIDED` | 344-1471 | 1128 | Cumulative descending chronologic LOCKED entries | SSOT_ITSELF | Mirror DECISION_LOG (per §HANDOVER_PROTOCOL STEP 16) | PRESERVE (master live tracking); DRIFT FLAG: section >>>50 LOC, far exceeds RECENT canonical truncate threshold per §CC.6. **VAULT_RULES §CC.6 says ## RECENT >50 LOC → truncate; ## JUST_DECIDED has no explicit threshold but architecture intent = "last 24-72h". 1128 LOC = 3+ weeks of entries. Daniel review recommended whether to apply truncation similar to ## RECENT.** |
| `## NEXT` | 1472-1736 | 265 | Priority order actionable | SSOT_ITSELF (overwrite OK per §CC.6) | NO | PRESERVE (snapshot, NU history) |
| `## ACTIVE_REFS` | 1737-1752 | 16 | HANDOVER_GLOBAL sections to deep-read | SSOT_ITSELF (snapshot) | NO | PRESERVE — **DRIFT: post Capacity A LOCKED chat-NEW3, REMOVE/REDIRECT pointers `HANDOVER_VAULT_HYGIENE`+`HANDOVER_MISC`+§41-§45+§36.99-§36.107 because covered ADR 026 §9.X canonical** (per chat-NEW3 plan) |
| `## ACTIVE_ADRS` | 1753-1762 | 10 | Top 3 ADRs to deep-read | SSOT_ITSELF (snapshot) | NO | PRESERVE |
| `## ACTIVE_FLAGS` | 1763-1776 | 14 | DIFF_FLAGS.md P1 status mirror | mirror DIFF_FLAGS.md | YES (status mirror, NU canonical) | PRESERVE |
| `## RECENT` | 1777-1809 | 33 | Older context preserved (truncate threshold 50) | SSOT_ITSELF | NO | PRESERVE (within 50 LOC threshold) |
| `## POINTERS` | 1810-1829 | 20 | Deep history drill-down | SSOT_ITSELF | NO | PRESERVE — **REDIRECT plan post Capacity A:** §36.X refs → ADR 026 §9.X / superseded handover refs → archive paths |

**File-level recommendation:** PRESERVE_FILE + UPDATE_§ACTIVE_REFS_§POINTERS_REDIRECT (Capacity A scope). Drift in `## JUST_DECIDED` 1128 LOC noted — escalate Daniel review periodic compaction strategy.

### B+ `01-vision/SUFLET_ANDURA.md` (2266 LOC)

| § | Line range | LOC | Topic | SSOT replacement | Verbatim duplicate? | Recommendation per-section |
|---|---|---|---|---|---|---|
| §0 Provenance | 20-32 | 13 | Source provenance chat strategic 2026-05-02 + original `Procesul_de_gandire_complet.md` | SSOT_ITSELF | Source archive `📤_outbox/_archive/2026-05/55_PROCESUL_DE_GANDIRE_CONSUMED_2026-05-02.md` | PRESERVE |
| §1 Translation Map | 33-69 | 37 | F1-F10 + Patterns + ~75% replicabil V1 | SSOT_ITSELF | Cross-ref ADR_BIAS_DETECTION + ADR_MODE_DETECTION_UI | PRESERVE |
| §2 Ce NU se traduce V1 | 70-80 | 11 | Excluded scope | SSOT_ITSELF | NO | PRESERVE |
| §3 11 LOCKED Decizii Noi | 81-100 | 20 | §36.16-§36.26 cross-ref summary | mirror HANDOVER_GLOBAL §36.16-§36.26 | YES summary | PRESERVE (alias) |
| §4 Filozofia Completă (12k cuvinte) | 101-2244 | 2144 | Full INGESTED 2026-05-02 — original transcript | SOURCE archive `55_PROCESUL_DE_GANDIRE_CONSUMED_2026-05-02.md` | YES VERBATIM (source archive contains identical) | **PARTIAL PRESERVE** — Source archive is canonical preservation per VAULT_RULES §3.5 zero-info-loss; SUFLET_ANDURA file = active reference. ESCALATE_DANIEL: optional split — keep §0-§3+§5 cross-refs (~70 LOC) active; archive §4 transcript bulk to companion file `01-vision/SUFLET_ANDURA_TRANSCRIPT_FULL.md` with cross-ref. Risk: cross-ref impact if Daniel/CC tools assume single file. **Recommendation: PRESERVE current state — split = optional cosmetic optimization** |
| §5 Cross-references | 2245-2266 | 22 | Cross-refs obligatorii | SSOT_ITSELF | NO | PRESERVE |

**File-level recommendation:** PRESERVE_FILE. Optional split candidate (§4 transcript bulk archive). Daniel decide.

### B+ `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` (641 LOC)

| § | Line range | LOC | Topic | SSOT replacement | Verbatim duplicate? | Recommendation |
|---|---|---|---|---|---|---|
| CONTEXT | 13-22 | 10 | Bugatti paradigm context | SSOT_ITSELF | NO | PRESERVE |
| PARTEA 1 — STRATEGY & POSITIONING | 23-119 | 97 | Pricing DEPRECATED §36.50 + positioning + USP | SSOT_ITSELF (with §AMENDMENT inline DEPRECATED markers) | Pricing §1.2-§1.4 DEPRECATED markers; positioning verbatim aligned MOAT_STRATEGY | PRESERVE — DEPRECATED markers preserve audit trail |
| PARTEA 2 — UX & ONBOARDING | 120-156 | 37 | Onboarding form 5-7 fields | SUPERSEDED by `01-vision/ONBOARDING_SSOT_V1.md` consolidation 2026-05-04 | YES (covered) | PRESERVE (existing reference per §3.1 update-in-place — but flag: ONBOARDING_SSOT_V1 = canonical now) |
| PARTEA 3 — DATA MODEL | 157-248 | 92 | localStorage + IndexedDB + Firebase | SSOT_ITSELF | Cross-ref ADR 001 + ADR 020 | PRESERVE |
| PARTEA 4 — ENGINE BEHAVIOR | 249-283 | 35 | Coach personality | SSOT_ITSELF | Some paraphrase COGNITIVE_ARCHITECTURE_SPEC | PRESERVE |
| PARTEA 5 — SAFETY & LIABILITY | 284-338 | 55 | Disclaimers + medical safety §AMENDMENT 2026-05-04 evening Batch 2 | SSOT_ITSELF (amendments inline) | NO | PRESERVE |
| PARTEA 6 — ENGAGEMENT | 339-380 | 42 | Chalkboard + retention | SSOT_ITSELF | Cross-ref §36.6 / §36.5 amendments | PRESERVE |
| PARTEA 7 — TECH STACK | 381-417 | 37 | Stack decisions | SSOT_ITSELF | Cross-ref ADR 005 (vanilla-js) + ADR 008 | PRESERVE — **ESCALATE: ADR 005 React migration LOCK chat-NEW3 will require §AMENDMENT inline here** |
| PARTEA 8 — BUSINESS OPS | 418-458 | 41 | Pricing + payment + revenue | SSOT_ITSELF (DEPRECATED §1.2-§1.4 amendments cover) | NO | PRESERVE |
| PARTEA 9 — EDGE CASES | 459-493 | 35 | User behavior edge | SSOT_ITSELF | NO | PRESERVE |
| PARTEA 10 — FUTURE-PROOFING | 494-528 | 35 | Scale planning | SSOT_ITSELF | Cross-ref FAZA roadmap | PRESERVE |
| PARTEA 11 — GROWTH STRATEGY | 529-565 | 37 | 3 follow-up flags resolved | SSOT_ITSELF | NO | PRESERVE |
| PUSH-BACK INTEGRATIONS | 566-580 | 15 | 8 critical issues resolved | SSOT_ITSELF | NO | PRESERVE |
| DECISIONS LOCKED | 581-607 | 27 | Cross-cutting summary | summary mirror | NO | PRESERVE |
| OPEN ITEMS | 608-622 | 15 | Future sessions queue | snapshot | NO | PRESERVE |
| METADATA SESIUNE | 623-641 | 19 | Session metadata | SSOT_ITSELF | NO | PRESERVE |

**File-level recommendation:** PRESERVE_FILE. ADR 005 React migration trigger §AMENDMENT inline PARTEA 7 candidate task.

### B+ `03-decisions/014-onboarding-profile-typing.md` (869 LOC)

| § | Line range | LOC | Topic | Recommendation |
|---|---|---|---|---|
| Context | 9-33 | 25 | Anti-bias framework rationale | PRESERVE |
| Decision | 34-303 | 270 | Tier T0/T1+/T2+ activation | PRESERVE |
| Alternatives Considered | 304-356 | 53 | ADR audit trail | PRESERVE |
| Trade-offs Accepted | 357-388 | 32 | Trade-offs explicit | PRESERVE |
| Empirical Calibration Parameters | 389-404 | 16 | Params | PRESERVE |
| Reconsideration Triggers | 405-424 | 20 | Triggers | PRESERVE |
| Implementation Notes | 425-456 | 32 | Impl spec | PRESERVE |
| Notes on Production Readiness | 457-469 | 13 | Readiness | PRESERVE |
| Resolved Questions | 470-535 | 66 | Decision log | PRESERVE |
| Tier-Based Personalization Pattern | 536-586 | 51 | Pattern | PRESERVE |
| Plugin Architecture Integration (ADR 018) | 587-700 | 114 | Integration spec | PRESERVE |
| Reconciliation cu Vitality Layer (ADR 016) | 701-769 | 69 | Cross-ref reconciliation | PRESERVE |
| Update 2026-04-27 — Tier-Aware + ADR 018 | 770-797 | 28 | Inline AMENDMENT | PRESERVE |
| Decision Points — Daniel Sign-Off | 798-858 | 61 | Sign-off log | PRESERVE |
| Sign-Off Update — 2026-04-27 | 859-869 | 11 | Sign-off | PRESERVE |

**File-level recommendation:** PRESERVE_FILE. All sections ADR-canonical.

### B+ `03-decisions/016-vitality-layer.md` (779 LOC)

Self-contained ADR. Sections: Context / Decision / 1-8 sub-sections (Scope întrebări / Scoring / Reconciliation ADR 014 / Tier gating / Storage / Plugin ADR 018 / Feature flag / Cross-references) / Consequences / Reconsideration / Implementation / Decision Points / Sign-Off. **PRESERVE_FILE** — all sections ADR-canonical, internal consistency.

### B+ `03-decisions/017-demographic-prior-database.md` (1011 LOC)

Self-contained ADR. Sections: Context / Decision / 1-9 sub-sections (Profile schema / Generator strategy / Behavioral pattern generator / Storage runtime / Plugin ADR 018 / Tier gating T0 / Lookup K-NN / Lifecycle build phase / 6 manually crafted personas) / Cross-refs / Consequences / Reconsideration / Implementation / Decision Points / Sign-Off. **PRESERVE_FILE** — all sections ADR-canonical.

### B+ `03-decisions/018-engine-extensibility-architecture.md` (557 LOC)

Highest inbound foundation ADR (62 inbound). Sections: Context / Decision / 1-5 sub-sections (Dimension Registry / Standardized Dimension Contract / Decision Cluster Engine / Schema Versioning + Migration / Feature Flags) / Migration Path / Consequences / Reconsideration / Implementation / Decision Points / Sign-Off. **PRESERVE_FILE** — critical foundation. Zero refactor risk.

### B+ `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` (1949 LOC)

| § | Line range | LOC | Topic | Recommendation |
|---|---|---|---|---|
| Status Summary | 10-21 | 12 | 129 decisions LOCKED V1 | PRESERVE |
| §1 SCOPE & PRINCIPLES (10 LOCKED V1) | 22-110 | 89 | §42 base decisions 1-10 | PRESERVE |
| §2 SPEC SESSION Q1-Q40 + REFINEMENTS (75 LOCKED V1) | 111-215 | 105 | §45 spec | PRESERVE |
| §3 D-CLUSTER (44 LOCKED V1) | 216-293 | 78 | §50 D1+D2+D3.1+D4 | PRESERVE |
| §4 GLOBAL CONCERNS SSOT | 294-326 | 33 | Meta-architecture | PRESERVE |
| §5 PIPELINE ORDER LOCKED V1 | 327-352 | 26 | §42.10 + §45.6 extension | PRESERVE |
| §6 ALIGNMENT QUESTIONS RULE | 353-360 | 8 | cross-ref §47 | PRESERVE |
| §7 CROSS-REFS | 361-379 | 19 | Bidirectional refs | PRESERVE |
| §8 NEXT (post compile draft full V1) | 380-395 | 16 | Carry-over | PRESERVE |
| §9 ENGINE-LEVEL SPECS Module-Level Compile | 396-1949 | 1554 | §9.1-§9.8 (8/8 prescriptive engines V1 spec compile complete) | **PRESERVE** — canonical SSOT post-pipeline closure 8/8. Highest authority for engines specs. Each §9.X aggregates verbatim chat strategic sources. ZERO archive risk. 10 src refs BLOCKING_ARCHIVE absolute. |

**File-level recommendation:** PRESERVE_FILE absolute. Critical canonical SSOT.

### B+ `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md` (621 LOC)

| § | Line range | LOC | Topic | Recommendation |
|---|---|---|---|---|
| Context | 10-33 | 24 | Auth migration rationale | PRESERVE |
| Decision | 34-207 | 174 | UUID Anonymous → Firebase Auth real | PRESERVE |
| Consequences | 208-234 | 27 | Trade-offs | PRESERVE |
| Reconsideration Triggers | 235-244 | 10 | Triggers | PRESERVE |
| Cross-references | 245-260 | 16 | Refs | PRESERVE |
| §AMENDMENT 2026-05-02 — Sprint 4.x Batch B | 261-310 | 50 | Implementation status | PRESERVE |
| §AMENDMENT 2026-05-04 evening — Faza 2 Wiring Spec LOCKED V1 | 311-450 | 140 | Faza 2 wiring 19 sub-sections | PRESERVE — **8 src refs BLOCKING_ARCHIVE** |
| §AMENDMENT 2026-05-04 evening BATCH 1-6 | 451-527 | 77 | Refinements + edge cases | PRESERVE |
| §AMENDMENT 2026-05-05 — Auth-Required Post-T0 LOCKED V1 + Future Compat v1.5+ | 528-621 | 94 | Auth-Required Post-T0 LOCKED V1 | PRESERVE |

**File-level recommendation:** PRESERVE_FILE. All amendments inline per VAULT_RULES §3.1 update-in-place.

### B+ `03-decisions/DECISION_LOG.md` (1880 LOC)

Master cronologic log descending. Sections per chat (each = 1 ## entry). **All entries PRESERVE — append-only canonical per VAULT_RULES §SSOT PRINCIPLE LOCK #3.** Total 38+ entries from 2026-04-24 to 2026-05-07 chat-NEW3.

**File-level recommendation:** PRESERVE_FILE absolute. Append-only canonical. Optional: strategic compactation distant earlier entries (2026-04-24 to 2026-04-27 ~700 LOC) to a frozen `DECISION_LOG_pre_2026-05.md` companion. ESCALATE_DANIEL low priority post-Faza 3.

### B+ `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` (715 LOC)

| § | Line range | LOC | Topic | Recommendation |
|---|---|---|---|---|
| §56 Auth Flow §36.80 BUG 2 RESOLUTION 35 sub-decisions | 9-164 | 156 | Pre-Beta blocker resolution | PRESERVE — **8 src refs BLOCKING_ARCHIVE** |
| (embedded Privacy Policy + ToS Beta drafts) | 165-348 | 184 | Embedded Privacy + ToS templates | YES VERBATIM duplicate of `01-vision/PRIVACY_POLICY_V1_BETA.md` + `01-vision/TERMS_OF_SERVICE_V1_BETA.md` | **CONSOLIDATE: keep cross-ref pointer here, primary in 01-vision/. POST_AUTH_PHASE_2_LANDED → reduce embedded body to summary + cross-ref.** Risk: minor drift if files diverge. |
| §57-§61 cumulative + DIFF_FLAGS + cross-refs + verification topics | 349-448 | 100 | Status updates | PRESERVE |
| §62 BATCH 1 Architecture & Process | 449-496 | 48 | Architecture decisions | PRESERVE |
| §63 BATCH 2 Onboarding & Conversion | 497-542 | 46 | Onboarding spec | PRESERVE — informs ONBOARDING_SSOT_V1 §AMENDMENT |
| §64 BATCH 3 Auth Edge Cases & Privacy | 543-594 | 52 | Auth edge cases | PRESERVE |
| §66 BATCH 5 RPE/RIR UX + Beta Mechanics | 595-641 | 47 | RPE/RIR + Beta | PRESERVE |
| §67 BATCH 6 Safety, Compliance & Distribution | 642-695 | 54 | Safety + compliance | PRESERVE |
| §68 CLOSURE BATCH UX Refinements | 696-715 | 20 | UX closure | PRESERVE |

**File-level recommendation:** PRESERVE_FILE + reduce embedded Privacy/ToS bodies to summary + cross-ref (post Auth Phase 2 LANDED). 8 src refs BLOCKING_ARCHIVE.

### B+ `06-sessions-log/HANDOVER_DECISION_CLUSTER_D1_D4_2026-04-30_evening.md` (527 LOC)

| § | Line range | LOC | Topic | Recommendation |
|---|---|---|---|---|
| §36.106 D2 NEW OPENED | 9-59 | 51 | Injury/Contraindication discussion (later LOCKED §50.3) | PRESERVE (audit trail) |
| §36.107 D3 NEW OPENED | 60-198 | 139 | Don't Like + Home + Calistenice + Sport (later LOCKED §50.1) | PRESERVE (audit trail) |
| §50 D-cluster sub-decisions LOCKED V1 (44 net) | 199-436 | 238 | §50.1 D3.1 + §50.2 D4 + §50.3 D2 + §50.4 D1 | PRESERVE — cross-cutting ADR 026 §9.X | 
| §51-§55 cumulative + DIFF_FLAGS + cross-refs + verification | 437-527 | 91 | Status updates | PRESERVE |

**File-level recommendation:** PRESERVE_FILE. Active D-cluster reference.

### B+ `06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md` (5716 LOC) — 🚨 CAPACITY A LOCKED CANDIDATE

| § | Line range | LOC | Topic | Verbatim duplicate / SSOT replacement | Recommendation per-section |
|---|---|---|---|---|---|
| §0 STATUS ACTUAL | 17-67 | 51 | Status overview pre-2026-05-02 | DECISION_LOG entries cover | ARCHIVE_SECTION (covered DECISION_LOG) |
| §1 VISION FINAL LOCKED | 68-97 | 30 | Vision summary | PROJECT_VISION.md canonical | ARCHIVE_SECTION (covered) |
| §2 STRATEGIC POSITIONING LOCKED | 98-127 | 30 | Positioning | MOAT_STRATEGY canonical | ARCHIVE_SECTION |
| §3 PRICING LOCKED (DEPRECATED 2026-05-02 §36.50) | 128-147 | 20 | DEPRECATED pricing | PRODUCT_STRATEGY §AMENDMENT 2026-05-02 + §36.50 LOCKED V1 | ARCHIVE_SECTION (DEPRECATED explicit) |
| §4 SPRINT 1+2+3 PARTIAL | 148-197 | 50 | Sprint 1-3 deliverables | Archive `📤_outbox/_archive/2026-04/08+09+10_SPRINT*` | ARCHIVE_SECTION (covered archive) |
| §5 D1-D15 ROUTING DECISIONS | 198-223 | 26 | D1-D15 LOCKED | DECISION_LOG entries | PRESERVE? cross-ref active |
| §6 SCOPE FINAL LOCKED Sprint 4/Wave 6 backlog | 224-399 | 176 | Scope Sprint 4 backlog (LARGE) | Many items DONE in src/ + archive Sprint 4.x | ARCHIVE_PARTIAL (DONE items) — flag pending items only |
| §7 VAULT STATE FINAL | 400-446 | 47 | Vault state pre 2026-05-04 | INDEX_MASTER VAULT CLEANUP HISTORY canonical | ARCHIVE_SECTION |
| §8 MEMORY PERSISTENT FINAL STATE | 447-474 | 28 | Memory consolidation | (memory rules — likely covered other docs) | PRESERVE? minor ESCALATE |
| §9 PRINCIPLE LOCK CC Opus autonomous | 475-493 | 19 | Authority | VAULT_RULES + PROMPT_CC_HYGIENE canonical | ARCHIVE_SECTION |
| §10 DIFFERENTIATION REALITY 2026 | 494-508 | 15 | 5 axe execution | MOAT_STRATEGY canonical | ARCHIVE_SECTION |
| §11 CHALKBOARD educational layer | 509-551 | 43 | LOCKED V1.1 | PRODUCT_STRATEGY §6.5 reference | PRESERVE? (V1.1 future feature) |
| §12 FEEDBACK SYSTEM in-app | 552-566 | 15 | LOCKED Sprint 4 | PRODUCT_STRATEGY §6 + Sprint 4 archive | ARCHIVE_SECTION |
| §13 WORKFLOW DANIEL ↔ CLAUDE ↔ OPUS | 567-629 | 63 | Locked workflow | VAULT_RULES §4 canonical | ARCHIVE_SECTION |
| §14 NEXT STEPS POST HANDOVER | 630-851 | 222 | Long next-steps queue | CURRENT_STATE §NEXT canonical | ARCHIVE_SECTION |
| §15 TESTS & GIT STATE FINAL | 852-872 | 21 | Status pre-2026-05-04 | Stale | ARCHIVE_SECTION |
| §16 ADR 020 STORAGE TIERING PHASE 1 | 873-904 | 32 | Implementation notes | ADR 020 + commit canonical | ARCHIVE_SECTION |
| §17 GOVERNANCE HARDENING | 905-934 | 30 | §HANDOVER_PROTOCOL + §7 + §8 | VAULT_RULES canonical | ARCHIVE_SECTION |
| §18 INBOX STRICT DANIEL | 935-950 | 16 | Bug fix | VAULT_RULES §3.5 + §6 canonical | ARCHIVE_SECTION |
| §19 SPRINT 4 A+B Implementation Notes | 951-983 | 33 | Sprint 4 notes | Sprint 4.x archive | ARCHIVE_SECTION |
| §20 I18N DECISION B LOCKED | 984-1017 | 34 | i18n decision + audit | DECISION_LOG + archive `28_I18N_AUDIT` | ARCHIVE_SECTION |
| §21 WORDING CATEGORICAL LOCKED | 1018-1051 | 34 | Wording lock + Anti-RE | (likely src/ + archive) | ARCHIVE_SECTION |
| §22 FINDINGS NOI 2026-05-01 (F-NEW-1..4) | 1052-1172 | 121 | F-NEW findings | FINDINGS_MASTER canonical | ARCHIVE_SECTION (covered) |
| §23 ENGINE WORDING 12 VARIAȚII | 1173-1253 | 81 | Wording variations | Sprint 4.x archive | ARCHIVE_SECTION |
| §24 PHASE A TOASTS/CONFIRMS | 1254-1290 | 37 | UI strings approved | (src/ canonical) | ARCHIVE_SECTION |
| §25 WORDING REMAINING NEXT SESIUNE | 1291-1344 | 54 | Wording queue | Pending CURRENT_STATE | PRESERVE? minor (active queue) |
| §26 GOAL-CA-SETTING + 8 TEMPLATES PROGRAME V1 | 1345-1444 | 100 | 8 templates V1 | ONBOARDING_SSOT_V1 §1 + ADR 024 | ARCHIVE_SECTION (covered) |
| §27 WORDING REWRITE PHASE B EVENING | 1445-1557 | 113 | 4 batch wording | Sprint 4.x archive | ARCHIVE_SECTION |
| §28 AMENDAMENTE BACKLOG | 1558-1668 | 111 | 5 amendments | Inline §AMENDMENT canonical | ARCHIVE_SECTION |
| §29 SAFETY NUTRITION + 4 TEMPLATES | 1669-2623 | 955 | Full spec safety nutrition + 4 templates 2026-05-02 (HUGE) | PRODUCT_STRATEGY §AMENDMENT + ADR 022 spec | ARCHIVE_SECTION (largely covered) — **ESCALATE Daniel: high LOC, verify ADR 022 + PRODUCT_STRATEGY cover all subdecizii** |
| §29.6 Distribution Strategy V1 | 2624-2742 | 119 | Distribution | PRODUCT_STRATEGY §1.X | ARCHIVE_SECTION |
| §29.7 Pre-Launch Checklist V1 | 2743-2818 | 76 | Pre-Launch | (active checklist) | PRESERVE? minor (pre-Beta active) |
| §30 Rebrand SalaFull → Andura | 2819-2846 | 28 | Rebrand decision | DECISION_LOG canonical | ARCHIVE_SECTION |
| §31 Investiții | 2847-2889 | 43 | Investment LOCKED | (private business) | PRESERVE? minor |
| §32 Muscle Memory Index (MMI) | 2890-2932 | 43 | LOCKED V1 NEW | (engine spec — possible ADR candidate) | PRESERVE? ESCALATE — possibly needs own ADR |
| §33 Storage Full UX Alert | 2933-2979 | 47 | LOCKED V1 NEW | (UX spec — covered ADR 020 + UX) | ARCHIVE_SECTION |
| §34 Blockers Sprint 4.x Identified | 2980-3068 | 89 | 3 blockers | Sprint 4.x archive | ARCHIVE_SECTION |
| §35 Tombstones GC Defer | 3069-3118 | 50 | GC defer 6 luni | TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC + ADR 011 | ARCHIVE_SECTION |
| §36 Decizii LOCKED 2026-05-02 late evening (§36.1-§36.98 majority) | 3119-5588 | 2470 | Massive cluster of LOCKED decisions chat strategic per Gemini cross-check + Beta-launch ASAP iterations | Many sections covered ADR 026 §9.X + PRODUCT_STRATEGY + ONBOARDING_SSOT_V1 + ADR_MULTI_TENANT_AUTH | **ARCHIVE_PARTIAL — case-by-case section** check by Daniel. Many §36.1-§36.98 covered canonical SSOTs post-§9.X compile + post-pipeline closure |
| §36.103 Knowledge Layer Update Cadence | 5589-5621 | 33 | LOCKED V1 | PRESERVE (likely active) |
| §36.104 Effort Estimate Roadmap | 5622-5634 | 13 | Informational | ARCHIVE_SECTION |
| §37 Status Cumulative V1 Update | 5635-5644 | 10 | Snapshot | ARCHIVE_SECTION |
| §38 Decision Points Status Update | 5645-5716 | 72 | D-cluster status updates | DECISION_LOG canonical | ARCHIVE_SECTION |

**File-level recommendation:** **🚨 PARTIAL ARCHIVE_FULL → 🚨 CAPACITY A LOCKED CANDIDATE FULL ARCHIVE per chat-NEW3 §JUST_DECIDED #3 plan.** Per chat-NEW3 *"covered acum în ADR 026 §9.X canonical post-pipeline closure"*. Realistic: **post Faza 3 STRANGLER complete + final SSOT verification of all sections covered, full archive recommended.** Pre-archive dependency: REDIRECT 6 inbound + selective sub-sections preservation if Daniel flags unique value (e.g., §32 MMI, §31 investments, §29.7 pre-launch checklist).

**CRITICAL DEPENDENCIES PRE-ARCHIVE:**
1. Pre-flight grep wikilinks orphane mandatory (per chat-NEW3 plan): `HANDOVER_MISC|HANDOVER_VAULT_HYGIENE|HANDOVER_ONBOARDING_T0|HANDOVER_GLOBAL_SPLIT_PLAN`
2. REDIRECT 6 inbound (CURRENT_STATE §ACTIVE_REFS + §POINTERS + INDEX_MASTER NAVIGARE entries §41-§45 + §36.99-§36.107 → ADR 026 §9.X canonical)
3. UPDATE INDEX_MASTER VAULT CLEANUP HISTORY entry
4. ESCALATE Daniel review §32 MMI + §31 Investiții + §29.7 Pre-Launch Checklist + §36.103 Knowledge Layer Update Cadence — preserve as standalone if unique active value
5. Backup tag pre-archive

### B+ `VAULT_RULES.md` (630 LOC)

| § | Line range | LOC | Topic | Recommendation |
|---|---|---|---|---|
| §1 STRUCTURĂ VAULT | 8-34 | 27 | Folder layout | PRESERVE |
| §2 SSOT FILES | 35-84 | 50 | Canonical SSOT-uri | PRESERVE — **DRIFT: line 56 mentions "06-sessions-log/HANDOVER_GLOBAL_*.md ← UNUL singur, current state" — but post-split there are 8 theme files; refresh wording** |
| §3 REGULI PERMANENTE | 85-130 | 46 | Update-in-place + 1 SSOT etc. | PRESERVE |
| §4 WORKFLOW Daniel↔Claude↔Opus | 131-151 | 21 | Workflow | PRESERVE |
| §5 SAFETY NET — ZERO INFO LOSS | 152-166 | 15 | Pre-DELETE protocol | PRESERVE |
| §6 ANTI-PATTERN INTERZISE | 167-182 | 16 | Anti-patterns | PRESERVE |
| §7 WHEN VAULT_RULES UPDATES | 183-197 | 15 | Update meta | PRESERVE |
| §HANDOVER_PROTOCOL | 198-291 | 94 | Cross-session continuity | PRESERVE |
| §BATCH_PROTOCOL | 292-399 | 108 | Cluster execution standard | PRESERVE |
| §VAULT_HYGIENE_PASS | 400-499 | 100 | Auto-hygiene STEP 10-15 + UTF8 | PRESERVE |
| §CHAT_CONTINUITY_PROTOCOL | 500-608 | 109 | Live SSOT layer §CC.1-§CC.8 | PRESERVE |
| §HANDOVER_PROTOCOL STEP 16 Amendment | 609-630 | 22 | CURRENT_STATE update post-ingest | PRESERVE |

**File-level recommendation:** PRESERVE_FILE. Minor refresh §2 line 56 wording post-split. **NEW SECTION CARRY-FORWARD per CURRENT_STATE §NEXT chat-9 carry-over:** `§ANTI_RECURRENCE_RULES` consolidation NEW chat dedicat strategic — list 11 slip-uri Claude scribe chat-uri 1-9 + anti-recurrence rules extracted invariant pre-flight checklist.

---

## Phase B (archive) — Bulk audit `📤_outbox/_archive/` (243 files)

**Scope:** All 243 archive files are by-design preserved per VAULT_RULES §3.5 zero-info-loss. They live in `📤_outbox/_archive/2026-04/` (28 files) + `📤_outbox/_archive/2026-05/` (215 files). Naming convention: `NN_TASK[_CONSUMED|_DEPRECATED|_PREVIOUS_..].md` per VAULT_RULES §3.3. **All 243 = ARCHIVED_PRESERVE_AS_IS** — no further audit needed for cleanup decisions.

### Aggregate analysis

- **Inbound from active vault to archive:** 0 (verified `/tmp/vault-audit/inbound-to-archive-from-active.txt` empty) — clean wikilink discipline
- **Active vault basename collision:** 0 exact matches (verified comm against active basenames)
- **Deprecated markers:** 122 archive files contain DEPRECATED|SUPERSEDED|legacy markers in body content (per `/tmp/vault-audit/deprecated-markers.txt` minus active 41) — by-design (post-consume archive)

### Top 30 archive files by LOC (Appendix A subset for archive)

| LOC | File |
|---|---|
| 9995 | `📤_outbox/_archive/2026-04/06_AUDIT_5000Q.md` |
| 2127 | `📤_outbox/_archive/2026-05/55_PROCESUL_DE_GANDIRE_CONSUMED_2026-05-02.md` |
| 817 | `📤_outbox/_archive/2026-05/106_AUDIT_IDEATION_REPORT_CONSUMED.md` |
| 700 | `📤_outbox/_archive/2026-05/137_CC_PROMPT_SHADOW_PROTOCOL_V2_PROPOSAL_CRITIQUED_REVISED_CONSUMED.md` |
| 568 | `📤_outbox/_archive/2026-05/61_HANDOVER_INPUT_CONSUMED_2026-05-02_chat_C_self_correction_extension.md` |
| 546 | `📤_outbox/_archive/2026-05/110_VAULT_AUDIT_INVENTORY.md` |
| 542 | `📤_outbox/_archive/2026-05/43_HANDOVER_INPUT_CONSUMED_2026-05-01_EVENING_RESUBMIT.md` |
| 535 | `📤_outbox/_archive/2026-05/37_HANDOVER_INPUT_CONSUMED_2026-05-02.md` |
| 526 | `📤_outbox/_archive/2026-05/105_AUDIT_VERIFICATION_REPORT_CONSUMED.md` |
| 492 | `📤_outbox/_archive/2026-05/59_HANDOVER_INPUT_CONSUMED_2026-05-02_self_correction.md` |
| 487 | `📤_outbox/_archive/2026-05/116_SPRINT_4X_FINAL_REPORT.md` |
| 476 | `📤_outbox/_archive/2026-05/64_HANDOVER_INPUT_CONSUMED_2026-05-02_chat_D_pricing_telegram_adr_lock.md` |
| 465 | `📤_outbox/_archive/2026-05/131_HANDOVER_INPUT_2026-05-04_AUTH_FLOW_BATCH_1_6_63_LOCKED_CONSUMED.md` |
| ... | (~230 more entries — see Appendix A) |

**Aggregate recommendation:** PRESERVE_AS_IS all 243 archive files. ZERO archive risk per VAULT_RULES §3.5 audit trail principle. ZERO orphan inbound from active. NO actions required.

**One small flag:** `📤_outbox/_archive/2026-05/110_VAULT_AUDIT_INVENTORY.md` (546 LOC) referenced in INDEX_MASTER NAVIGARE table line 117 — preserve cross-ref intact.

---

## Phase C — Cross-file analysis

### C.1 Verbatim duplicate spans index global

Pre-flight grep of distinctive phrases across vault detected following spans:

#### Span 1 — Pricing structure §36.50 LOCKED V1 (Founding €39 cap 50 + Standard €59 + Elite €79 V1.1)

- ORIGINAL: `06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md` §36.50 (verbatim spec source)
- DUPLICATE_PARAPHRASE: `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` §1.2-§1.4 (DEPRECATED markers explicit + cross-ref to §36.50)
- DUPLICATE_PARAPHRASE: `01-vision/MOAT_STRATEGY.md` line 113 (strikethrough + reference §36.50)
- DUPLICATE_REFERENCE: `00-index/INDEX_MASTER.md` NAVIGARE table entry "Pricing locked Founding €39..."
- DUPLICATE_CONDENSED: `03-decisions/DECISION_LOG.md` 2026-05-02 entries
- Recommendation: CONSOLIDATE_INTO HANDOVER_MISC §36.50 (canonical source) — already done via DEPRECATED markers + cross-refs. POST-CAPACITY-A archive: PRODUCT_STRATEGY §AMENDMENT 2026-05-02 inline becomes new canonical (when HANDOVER_MISC archives). REDIRECT all references.

#### Span 2 — Onboarding 5 ecrane order obiectiv→vârstă→sex→istoric→frecvență §63.1

- ORIGINAL: `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §63.1 (BATCH 2 Onboarding & Conversion)
- DUPLICATE_VERBATIM: `01-vision/ONBOARDING_SSOT_V1.md` §AMENDMENT 2026-05-04 evening Batch 2 §63.1
- DUPLICATE_REFERENCE: `00-index/CURRENT_STATE.md` chat-NEW2 §JUST_DECIDED entry #5
- DUPLICATE_CONDENSED: `03-decisions/DECISION_LOG.md` 2026-05-04 evening entry
- Recommendation: PRESERVE all (canonical SSOT split per scope: HANDOVER §63.1 = source-of-truth chat strategic, ONBOARDING_SSOT_V1 = consolidated reference, CURRENT_STATE = recent change tracker, DECISION_LOG = master log). NO consolidation needed.

#### Span 3 — Pipeline §42.10 V1 closure 8/8 commits (Periodization `1303b62` → Deload `a6a0c87`)

- ORIGINAL: `00-index/CURRENT_STATE.md` §JUST_DECIDED chat-8 entry verbatim
- DUPLICATE_VERBATIM: `03-decisions/DECISION_LOG.md` 2026-05-06 evening chat-8 entry verbatim
- DUPLICATE_VERBATIM: `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` §9.X compile narrative footers (per cross-refs cleanup `6e30bfc`)
- DUPLICATE_REFERENCE: `DIFF_FLAGS.md` P1-FLAG-SCENARIOS-COVERAGE V1 evidence append
- DUPLICATE_REFERENCE: `06-sessions-log/HANDOVER_ENGINES_SPEC_2026-04-30_evening.md` §42.10 + §65 BATCH 4
- Recommendation: PRESERVE all (chronologic mirror per §HANDOVER_PROTOCOL STEP 16 + DIFF_FLAGS evidence canonical). Pattern healthy.

#### Span 4 — Auth Flow §36.80 BUG 2 RESOLUTION 35 sub-decisions LOCKED V1

- ORIGINAL: `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §56.1-§56.19 (theme split)
- DUPLICATE_VERBATIM: `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md` §AMENDMENT 2026-05-04 evening — Faza 2 Wiring Spec LOCKED V1 (19 sub-sections cross-ref §56.1-§56.19)
- DUPLICATE_CONDENSED: `03-decisions/DECISION_LOG.md` 2026-05-04 evening entry
- DUPLICATE_REFERENCE: CURRENT_STATE §ACTIVE_REFS pointer
- Recommendation: PRESERVE all (canonical split: chat strategic SOURCE = HANDOVER theme, IMPLEMENTATION SSOT = ADR_MULTI_TENANT_AUTH, log = DECISION_LOG). 8 src refs from HANDOVER_AUTH_FLOW + 6 src refs from ADR_MULTI_TENANT_AUTH = high BLOCKING_ARCHIVE both files.

#### Span 5 — VAULT_HYGIENE_PASS Faza 3 + 8 recomandări A-H (2026-05-04)

- ORIGINAL: `06-sessions-log/HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md` §41 (theme split)
- DUPLICATE_PARAPHRASE: `00-index/INDEX_MASTER.md` VAULT CLEANUP HISTORY 2026-05-04 entries
- DUPLICATE_VERBATIM: `VAULT_RULES.md` §VAULT_HYGIENE_PASS (codified Faza 4 rule)
- DUPLICATE_CONDENSED: `03-decisions/DECISION_LOG.md` 2026-05-04 evening entries
- Recommendation: **CONSOLIDATE_INTO VAULT_RULES §VAULT_HYGIENE_PASS (canonical post-codification) + INDEX_MASTER VAULT CLEANUP HISTORY (cleanup audit trail) + DECISION_LOG (master log).** HANDOVER_VAULT_HYGIENE §41 narrative = redundant audit trail. **Capacity A LOCKED scope: HANDOVER_VAULT_HYGIENE archive eligible.** REDIRECT 6 inbound → VAULT_RULES §VAULT_HYGIENE_PASS / INDEX_MASTER VAULT CLEANUP HISTORY.

#### Span 6 — §47 Alignment Questions Generation Rule LOCKED V1

- ORIGINAL: `06-sessions-log/HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md` §47
- DUPLICATE_VERBATIM: `VAULT_RULES.md` §HANDOVER_PROTOCOL step 9 amendment
- DUPLICATE_VERBATIM: `PROMPT_CC_HYGIENE.md` §9 amendment
- Recommendation: VAULT_RULES + PROMPT_CC_HYGIENE = canonical post-codification. HANDOVER_VAULT_HYGIENE §47 = source narrative. POST-CAPACITY-A archive HANDOVER_VAULT_HYGIENE: REDIRECT remaining inbound → VAULT_RULES §HANDOVER_PROTOCOL step 9.

#### Span 7 — 5 voices Cognitive Architecture CONFIRMED §36.101

- ORIGINAL: `06-sessions-log/HANDOVER_ONBOARDING_T0_2026-04-30_evening.md` §36.101
- DUPLICATE_PARAPHRASE: `04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md` (full canonical 5-engine spec)
- DUPLICATE_REFERENCE: ADR 018 + DECISION_LOG
- Recommendation: COGNITIVE_ARCHITECTURE_SPEC_v1 = canonical. HANDOVER_ONBOARDING_T0 §36.101 = brief reference. PRESERVE.

#### Span 8 — Goal-ca-Setting + 8 templates programe V1 §26

- ORIGINAL: `06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md` §26 (verbatim spec)
- DUPLICATE_PARAPHRASE: `01-vision/ONBOARDING_SSOT_V1.md` §1 (consolidated reference)
- DUPLICATE_PARAPHRASE: `03-decisions/024-goal-driven-program-templates.md` (SPEC READY V1 compile draft full)
- DUPLICATE_REFERENCE: PRODUCT_STRATEGY_SPEC_v1 §AMENDMENT
- Recommendation: ADR 024 + ONBOARDING_SSOT_V1 = canonical post-consolidation. HANDOVER_MISC §26 = original chat strategic source. POST-CAPACITY-A archive HANDOVER_MISC: ADR 024 + ONBOARDING_SSOT_V1 inherit canonical authority.

### C.2 Authority conflict detection

NO authority conflicts detected (multiple files claiming LOCKED V1 same scope). Exception:

- **PARTIAL conflict:** `03-decisions/022-bayesian-nutrition-inference.md` 🟢 SPEC READY V1 + `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` §9.4 ✅ LOCKED V1 — both cover Bayesian Nutrition Engine. Per CURRENT_STATE chat-4 §9.4 compile note: "ADR 022 status preserved — distilled detail complementary la §9.4 SSOT, diferit vs ADR 027 stub legacy precedent". RESOLUTION: Complementary by-design (ADR 022 = SPEC, ADR 026 §9.4 = META aggregation). NO conflict. **Recommendation: preserve both, cross-ref maintained.**

- **PARTIAL conflict:** `03-decisions/024-goal-driven-program-templates.md` 🟢 SPEC READY V1 + ADR 026 §9.2 LOCKED V1 (Goal Adaptation Engine) — same pattern as ADR 022/§9.4. RESOLUTION: Complementary (ADR 024 = templates spec, §9.2 = engine spec). NO conflict.

### C.3 Drift indicators consolidated

#### Drift 1 — Cumulative LOCKED count

CURRENT_STATE chat-NEW3 says "~688 LOCKED V1" but multiple older files reference older counts:
- `01-vision/ONBOARDING_SSOT_V1.md` references §63.1 (post-243 batch era)
- `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §57 references "243"
- `06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md` §0 STATUS pre-2026-05-04 era counts ~100-175 cumulative
- `06-sessions-log/HANDOVER_DECISION_CLUSTER_D1_D4_2026-04-30_evening.md` §51 "175 → 216"
- `06-sessions-log/HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md` §41 "Faza 3 era ~90"

**Status:** EXPECTED drift — cumulative counts are point-in-time snapshots within source-of-truth chat strategic at that time. **NU drift bug** but historical lineage. CURRENT_STATE = live count. INDEX_MASTER.md line 6 needs to update from "92 fișiere active" to "93 fișiere active" (mecanic stat refresh).

#### Drift 2 — INDEX_MASTER stats line 6 (mecanic)

- "92 fișiere active vault" — actual 93 per `/tmp/vault-audit/files-active.txt`
- "33 numbered 001-032" — actual 32 numerical (001-032 inclusive = 32 files; INDEX_MASTER off-by-one)

**Recommendation:** Mecanic refresh task. Trivial Edit. Not blocker.

#### Drift 3 — Chat-N references staleness

Some files reference older chat-N states (chat-2 / chat-3 / etc.) without latest concluding. Pattern: HANDOVER theme files reference original chat strategic events; CURRENT_STATE has chat-NEW3 latest. Cross-ref discipline preserved (no temporal staleness blocking).

### C.4 Outbox archive accidental active duplicates

**Verified clean:** ZERO basename matches between active vault and archive (per Phase A baseline). Multiple LATEST cycles in archive (`139_LATEST_PREVIOUS_CURRENT_STATE_REFRESH.md`, etc.) = intentional VAULT_RULES §3.3 cycle preservation, NOT accidental duplicates.

### C.5 De-facto SSOT ranking (top 20 inbound count)

| Rank | Inbound | File | Type |
|---|---|---|---|
| 1 | 91 | `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` | DEEP_ARCHIVE_INDEX |
| 2 | 78 | `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` | ADR_SSOT_CANONICAL |
| 3 | 62 | `03-decisions/018-engine-extensibility-architecture.md` | ADR_FOUNDATION |
| 4 | 54 | `03-decisions/009-calibration-tiers.md` | ADR_FOUNDATION |
| 5 | 34 | `03-decisions/DECISION_LOG.md` | LOG_MASTER |
| 6 | 29 | `03-decisions/022-bayesian-nutrition-inference.md` | ADR_SSOT |
| 7 | 28 | `04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md` | ARCH_SSOT |
| 7 | 28 | `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md` | ADR_SSOT |
| 7 | 28 | `03-decisions/011-coach-decision-log-architecture.md` | ADR_SSOT |
| 10 | 27 | `03-decisions/025-andura-gandeste-pentru-user.md` | ADR_SSOT (stub high-inbound!) |
| 11 | 22 | `03-decisions/028-engine-tempo-form-cues.md` | ADR_SPEC_REFERENCE |
| 11 | 22 | `03-decisions/017-demographic-prior-database.md` | ADR_SSOT |
| 13 | 19 | `03-decisions/029-engine-specialization.md` | ADR_SPEC_REFERENCE |
| 13 | 19 | `03-decisions/027-engine-energy-adjustment.md` | ADR_SPEC_REFERENCE (legacy "Engine #5" pre-pipeline) |
| 13 | 19 | `03-decisions/024-goal-driven-program-templates.md` | ADR_SSOT |
| 16 | 18 | `03-decisions/014-onboarding-profile-typing.md` | ADR_FOUNDATION |
| 17 | 17 | `03-decisions/023-llm-intent-interpretation.md` | ADR_SSOT (LLM scope strict) |
| 17 | 17 | `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` | VISION_SSOT |
| 19 | 16 | `03-decisions/030-adapter-design-pattern.md` | ADR_SSOT (D1-D5 LOCKED) |
| 20 | 15 | `03-decisions/013-auto-aggression-detection.md` | ADR |

**Insight:** Top 5 = critical. Top 10 = high inbound foundation. Bottom 10 of top 20 = moderate. ALL 20 = preserve hard.

---

## Phase D — Recommended cleanup batches (topological order safe execute)

### Pre-flight mandatory before ANY batch

```bash
# Tag pre-cleanup
git tag pre-vault-cleanup-batch-2026-05-07
git push origin pre-vault-cleanup-batch-2026-05-07

# Pre-flight grep wikilinks orphane mandatory (per chat-NEW3 spec)
grep -rEn '\[\[(HANDOVER_MISC|HANDOVER_VAULT_HYGIENE|HANDOVER_ONBOARDING_T0|HANDOVER_GLOBAL_SPLIT_PLAN)' \
  --include="*.md" --exclude-dir=_archive --exclude-dir=node_modules \
  > /tmp/redirect-targets.txt
```

### Batch 1 — Zero-dependency archives (safe execute first, ZERO inbound, ZERO src refs)

**Scope:** Only candidate from active vault is `HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05.md` (171 LOC, 0 inbound, 0 src refs).

**Action:**
- ARCHIVE_FULL `06-sessions-log/HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05.md` → `📤_outbox/_archive/2026-05/<NEXT_NN>_HANDOVER_GLOBAL_SPLIT_PLAN_DEPRECATED.md`
- Rationale: plan executed 2026-05-05 overnight (split LANDED, INDEX_MASTER reflects post-split state, master HANDOVER_GLOBAL = navigation post-split). Plan = redundant historical artifact post-execution. ZERO inbound, ZERO break risk.
- Risk: 0
- Estimate: ~5 min CC

**ESCALATE_DANIEL alternative:** Daniel may prefer PRESERVE for vault hygiene precedent / decision audit. Optional batch.

### Batch 2 — Pre-archive REDIRECT (BLOCKING for Capacity A)

**Goal:** REDIRECT all inbound wikilinks to soon-archived files in Capacity A LOCKED scope before archive.

**Targets:**
1. `HANDOVER_VAULT_HYGIENE_2026-04-30_evening` — 6 inbound to redirect
2. `HANDOVER_MISC_2026-04-30_evening` — 6 inbound to redirect

**REDIRECT mapping per chat-NEW3 plan:**

| Inbound source | Current ref | Target replacement |
|---|---|---|
| `00-index/CURRENT_STATE.md` `## ACTIVE_REFS` line 1737-1752 | `[[HANDOVER_GLOBAL_2026-04-30_evening]] §41-§45 + §36.99-§36.107` | `[[026-offline-coaching-decision-tree-exhaustive]] §9.X canonical` + `[[VAULT_RULES]] §VAULT_HYGIENE_PASS` |
| `00-index/INDEX_MASTER.md` NAVIGARE table | Various §41 / §42 / §45 / §50 / §56 / §62-§73 entries | Per-row review: keep references to HANDOVER_AUTH_FLOW + HANDOVER_DECISION_CLUSTER_D1_D4 + HANDOVER_ENGINES_SPEC + HANDOVER_SCENARIOS_COVERAGE intact (those PRESERVE); redirect §41 + §47 → VAULT_RULES; §36.99-§36.107 → ADR 026 §9.X |
| Active vault other files (DECISION_LOG entries, ADR cross-refs, etc.) | Various §X refs | Per-row review |

**Action steps (sequential):**
1. Execute pre-flight grep above to get full inbound list verbatim per file/line
2. Per inbound: edit file, replace wikilink with REDIRECT target
3. Verify: re-run grep, expect 0 matches `[[HANDOVER_VAULT_HYGIENE` and `[[HANDOVER_MISC` in active vault
4. Estimate: ~30-60 min CC (per file edit + verify)

**Risk:** REDIRECT errors silent → broken information flow. Mitigation: incremental commit per file + re-grep verification + push origin.

### Batch 3 — Capacity A LOCKED archive (post Batch 2 REDIRECT verified)

**Targets (per CURRENT_STATE chat-NEW3 §JUST_DECIDED #3 plan):**
1. `06-sessions-log/HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md` (127 LOC, 6 inbound REDIRECTED in Batch 2, 0 src refs) → `📤_outbox/_archive/2026-05/<NEXT+1_NN>_HANDOVER_VAULT_HYGIENE_CAPACITY_A_DEPRECATED.md`
2. `06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md` (5716 LOC, 6 inbound REDIRECTED in Batch 2, 0 src refs) → `📤_outbox/_archive/2026-05/<NEXT+2_NN>_HANDOVER_MISC_CAPACITY_A_DEPRECATED.md`

**Pre-archive verification:**
- Re-run grep `[[HANDOVER_MISC` and `[[HANDOVER_VAULT_HYGIENE` active vault → expect 0 matches
- Verify content covered: ADR 026 §9.X canonical post-pipeline closure (§36.99-§36.107) + VAULT_RULES §VAULT_HYGIENE_PASS (§41+§47) + canonical SSOTs (PRODUCT_STRATEGY/ONBOARDING_SSOT_V1 etc.)
- ESCALATE Daniel: HANDOVER_MISC §32 MMI + §31 Investiții + §29.7 Pre-Launch Checklist + §36.103 Knowledge Layer Update Cadence — preserve as standalone if unique active value (NOT covered elsewhere)

**Action:**
- `git mv` each target → archive with NN-prefix per VAULT_RULES §3.3 chronological numbering
- UPDATE INDEX_MASTER.md VAULT CLEANUP HISTORY entry (add 2026-05-07 Capacity A entry)
- Estimate: ~15-20 min CC

**Risk:** info loss if §32/§31/§29.7/§36.103 actually unique. Mitigation: ESCALATE DANIEL pre-archive review.

### Batch 4 — Long-term sections-level archive (post Batch 3 + Faza 3 STRANGLER complete)

**Scope per CURRENT_STATE chat-NEW3 *"archive selective HANDOVER_GLOBAL split 7 themes sections superseded SSOT (long-term hygiene post-Faza 3)"*:**

1. `06-sessions-log/HANDOVER_ENGINES_SPEC_2026-04-30_evening.md` (426 LOC, 4 inbound) — POST Faza 3 STRANGLER complete (engines wired, ADR 026 §9.X canonical confirmed in production), candidate ARCHIVE_FULL with REDIRECT 4 inbound → ADR 026 §9.X
2. `06-sessions-log/HANDOVER_ONBOARDING_T0_2026-04-30_evening.md` (72 LOC, 4 inbound) — sparse theme, content covered ONBOARDING_SSOT_V1 + COGNITIVE_ARCHITECTURE_SPEC_v1, candidate ARCHIVE_FULL post Faza 3
3. SUFLET_ANDURA.md §4 transcript bulk (2144 LOC) — optional split to `01-vision/SUFLET_ANDURA_TRANSCRIPT_FULL.md` companion + reference cross-ref. PRESERVE original `55_PROCESUL_DE_GANDIRE_CONSUMED_2026-05-02.md` archive as backup canonical.

**ESCALATE_DANIEL:** All Batch 4 actions optional / depends-on-Faza-3-complete.

### Batch 5 — Verbatim consolidate spans (Phase C.1 outputs)

Post Batch 3:

1. **Span 1 Pricing:** PRODUCT_STRATEGY §AMENDMENT 2026-05-02 inline becomes new canonical post HANDOVER_MISC §36.50 archive. REDIRECT MOAT_STRATEGY line 113 + INDEX_MASTER NAVIGARE entry.
2. **Span 5+6 VAULT_HYGIENE+§47:** VAULT_RULES §VAULT_HYGIENE_PASS + §HANDOVER_PROTOCOL step 9 amendment = canonical. (Already done — HANDOVER_VAULT_HYGIENE archive completes.)
3. **Span 8 §26 Goal-ca-Setting:** ADR 024 + ONBOARDING_SSOT_V1 inherit canonical post HANDOVER_MISC §26 archive.

**Action:** mainly REDIRECT verifications post-archive. ~15 min CC.

### Batch 6 — INDEX_MASTER + CURRENT_STATE refresh post-cleanup

1. **UPDATE INDEX_MASTER.md:**
   - Line 6 stats: "92 fișiere active vault" → "91 fișiere active vault" (post Capacity A archive 2 files) — verify count
   - Line 6 ADR breakdown: "33 numbered 001-032" → "32 numbered 001-032 + ADR_MULTI_TENANT_AUTH" + "8 named ADR_*"
   - VAULT CLEANUP HISTORY: add 2026-05-07 entry "Capacity A LOCKED — archive HANDOVER_VAULT_HYGIENE + HANDOVER_MISC + REDIRECT 12 inbound + INDEX_MASTER refresh"
   - NAVIGARE table rows referencing archived: REDIRECT to canonical SSOTs

2. **UPDATE CURRENT_STATE.md:**
   - `## ACTIVE_REFS`: REMOVE `[[HANDOVER_VAULT_HYGIENE]]` + `[[HANDOVER_MISC]]` references; ADD redirected canonical pointers per Batch 2 mapping
   - Header `Updated:` timestamp refresh

3. **UPDATE DIFF_FLAGS.md:** P1-FLAG-NEW Capacity A LANDED entry with completion evidence (commits + tests baseline preserved + cross-refs verified)

4. **CURRENT_STATE §JUST_DECIDED**: append entry for Capacity A LOCKED execution complete

**Estimate:** ~10-15 min CC

### Batch 7 — Daniel-escalate review (UNCERTAIN files / sections)

Items requiring Daniel decision before action:

1. **ADR 005 Vanilla JS** — chat-NEW3 React migration LOCK: §AMENDMENT inline OR new ADR 033? Daniel decision (architectural inversion).
2. **HANDOVER_MISC §32 Muscle Memory Index** — possibly needs own ADR (engine spec), preserve standalone?
3. **HANDOVER_MISC §31 Investiții** — private business data, preserve standalone candidate file?
4. **HANDOVER_MISC §29.7 Pre-Launch Checklist V1 LOCKED** — pre-Beta active checklist, preserve standalone candidate?
5. **HANDOVER_MISC §36.103 Knowledge Layer Update Cadence** — LOCKED V1, preserve standalone candidate?
6. **CURRENT_STATE `## JUST_DECIDED`** 1128 LOC vs §CC.6 implied "last 24-72h" intent — Daniel decide periodic compaction strategy.
7. **DECISION_LOG distant entries** (2026-04-24 to 2026-04-27 ~700 LOC) — optional strategic compactation post-Faza 3.
8. **HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05.md** — Batch 1 candidate (171 LOC, 0 inbound) but possible PRESERVE for vault hygiene precedent.
9. **Tests NOT index în PK** — quick win Daniel side Project Knowledge config (separate inclusion list).

### Risk consolidation cross-batches

- **Total inbound wikilinks to break in batches 1-3:** 12 (6+6 from HANDOVER_VAULT_HYGIENE + HANDOVER_MISC) → ALL REDIRECT plan included Batch 2 BEFORE archive Batch 3
- **Total code refs `src/` blocking active vault:** 26 files (per Phase A baseline) — ALL preserve list (active SSOT, NU archive). Capacity A files have 0 code refs both. ZERO src impact.
- **Total unique info loss risk:** 4 sections in HANDOVER_MISC flagged ESCALATE_DANIEL (§32/§31/§29.7/§36.103) → preserve as standalone candidates if unique active value
- **Tests baseline preservation:** 2648 PASS / 0 FAIL preserved across all batches (doc-only operations ZERO src changes)
- **Backup tags mandatory:** `pre-vault-cleanup-batch-2026-05-07-<HHMM>` per VAULT_RULES §CC.7 Layer 5 + §5 SAFETY NET

### Estimated total cleanup effort

- Batch 1: ~5 min CC
- Batch 2 (REDIRECT): ~30-60 min CC
- Batch 3 (Capacity A archive): ~15-20 min CC
- Batch 4 (long-term post-Faza 3): deferred
- Batch 5 (Spans verify): ~15 min CC
- Batch 6 (INDEX + CURRENT_STATE refresh): ~10-15 min CC
- Batch 7 (Daniel ESCALATE review): pending Daniel sync

**Total Capacity A scope (Batches 1-3+5+6):** ~75-115 min CC autonomous + 1 Daniel decision sync (Batch 7).

---

## Appendix A — Top 30 largest files (LOC desc)

```
9995 ./📤_outbox/_archive/2026-04/06_AUDIT_5000Q.md
5716 ./06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md          [ACTIVE — Capacity A LOCKED candidate]
2266 ./01-vision/SUFLET_ANDURA.md                                    [ACTIVE — preserve §0+§1+§2+§3+§5; §4 split optional]
2127 ./📤_outbox/_archive/2026-05/55_PROCESUL_DE_GANDIRE_CONSUMED_2026-05-02.md
1949 ./03-decisions/026-offline-coaching-decision-tree-exhaustive.md [ACTIVE — preserve canonical SSOT]
1880 ./03-decisions/DECISION_LOG.md                                  [ACTIVE — preserve canonical log]
1829 ./00-index/CURRENT_STATE.md                                     [ACTIVE — preserve live SSOT]
1011 ./03-decisions/017-demographic-prior-database.md                [ACTIVE — preserve ADR]
869  ./03-decisions/014-onboarding-profile-typing.md                 [ACTIVE — preserve ADR]
817  ./📤_outbox/_archive/2026-05/106_AUDIT_IDEATION_REPORT_CONSUMED.md
779  ./03-decisions/016-vitality-layer.md                            [ACTIVE — preserve ADR]
715  ./06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md      [ACTIVE — preserve theme + 8 src refs BLOCKING]
700  ./📤_outbox/_archive/2026-05/137_CC_PROMPT_SHADOW_PROTOCOL_V2_PROPOSAL_CRITIQUED_REVISED_CONSUMED.md
641  ./01-vision/PRODUCT_STRATEGY_SPEC_v1.md                         [ACTIVE — preserve vision]
630  ./VAULT_RULES.md                                                [ACTIVE — preserve authority]
621  ./03-decisions/ADR_MULTI_TENANT_AUTH_v1.md                      [ACTIVE — preserve ADR + 6 src refs BLOCKING]
568  ./📤_outbox/_archive/2026-05/61_HANDOVER_INPUT_CONSUMED_2026-05-02_chat_C_self_correction_extension.md
557  ./03-decisions/018-engine-extensibility-architecture.md         [ACTIVE — preserve foundation ADR]
546  ./📤_outbox/_archive/2026-05/110_VAULT_AUDIT_INVENTORY.md
542  ./📤_outbox/_archive/2026-05/43_HANDOVER_INPUT_CONSUMED_2026-05-01_EVENING_RESUBMIT.md
535  ./📤_outbox/_archive/2026-05/37_HANDOVER_INPUT_CONSUMED_2026-05-02.md
527  ./06-sessions-log/HANDOVER_DECISION_CLUSTER_D1_D4_2026-04-30_evening.md [ACTIVE — preserve theme]
526  ./📤_outbox/_archive/2026-05/105_AUDIT_VERIFICATION_REPORT_CONSUMED.md
492  ./📤_outbox/_archive/2026-05/59_HANDOVER_INPUT_CONSUMED_2026-05-02_self_correction.md
492  ./04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md             [ACTIVE — preserve arch SSOT]
487  ./📤_outbox/_archive/2026-05/116_SPRINT_4X_FINAL_REPORT.md
487  ./PROMPT_CC_HYGIENE.md                                          [ACTIVE — preserve runtime prompt]
476  ./📤_outbox/_archive/2026-05/64_HANDOVER_INPUT_CONSUMED_2026-05-02_chat_D_pricing_telegram_adr_lock.md
467  ./03-decisions/011-coach-decision-log-architecture.md           [ACTIVE — preserve ADR foundation]
465  ./📤_outbox/_archive/2026-05/131_HANDOVER_INPUT_2026-05-04_AUTH_FLOW_BATCH_1_6_63_LOCKED_CONSUMED.md
```

---

## Appendix B — Orphan wikilinks list complet (44)

Wikilink targets that have NO matching `.md` file basename in vault:

```
.
013-ADR-aa-detection (slip prompt fabricated; actual = 013-auto-aggression-detection.md — anti-recurrence rule consolidated permanent CURRENT_STATE chat-8)
022-bayesian-nutrition-inference\
024-goal-driven-program-templates\
027-engine-deload (broken — actual ADR 027 is energy-adjustment; deload = ADR 032)
ADR 022 Bayesian Sprint 4
ADR_009_AMENDMENT_TIER_SYSTEM_SSOT (covered inline §AMENDMENT 2026-04-30 in ADR 009)
ADR_GDPR_AMENDMENT_K_ANONYMITY_v1 (promoted to ADR 019 from amendment 2026-04-30)
ASYNC_EXECUTION_PROTOCOL (workflow obsolete post-cleanup 2026-04-30 per CHAT_MIGRATION_PROTOCOL)
AUDIT_5000Q (in archive 06_AUDIT_5000Q.md — wikilink missing prefix)
AUDIT_5000Q_REPORT (in archive 07_AUDIT_5000Q_REPORT.md)
AUDIT_COACH_JS_24APR (removed in vault cleanup 2026-04-30; recoverable git history)
AUDIT_GENERAL_23APR (removed in vault cleanup 2026-04-30; recoverable git history)
AUTONOMOUS_RUN_2026-04-26 (deprecated workflow doc)
CTX_ALLLOGS_AUDIT_1_5 (deprecated audit ref)
ENGINE_ARCHITECTURE (rewired to COGNITIVE_ARCHITECTURE_SPEC_v1 per VAULT_HYGIENE F)
EXEC_QUEUE (rewired to outbox workflow per VAULT_HYGIENE F)
EXEC_RESULTS (deprecated)
FAZA_1_FINAL_REPORT (sprint report — archived archive)
FAZA_2_FINAL_REPORT (sprint report)
FAZA_2_ROADMAP (deprecated)
FAZA_3_ROADMAP (deprecated)
FILE_NAME (placeholder — VAULT_RULES doc example)
FIREBASE_AUDIT_1_8 (audit closed, content absorbed into ADRs per ADR 001/002 see also)
GETBF_DEAD_CODE_FINDING_2026-04-27 (closed by ADR 015)
HANDOVER (generic placeholder)
HANDOVER_ACTIVE (generic — deprecated)
HANDOVER_GLOBAL_2026-04-30 (early date variant; actual = HANDOVER_GLOBAL_2026-04-30_evening)
HARDCODED_AUDIT_1_2 (deprecated audit)
LATEST_1_SIMULATOR (archive cycle)
LATEST_2_AUTH_PHASE2_BATCH1 (archive cycle)
LATEST_3_ADR_026_COMPILE (archive cycle)
LATEST_4_ADR_STUBS_ENGINES (archive cycle)
LATEST_5_HANDOVER_SPLIT (archive cycle)
LOG_SCHEMA_AUDIT_1_3 (deprecated)
name (placeholder)
NNN-... (placeholder — VAULT_RULES doc example)
OBSIDIAN_SETUP_GUIDE (Obsidian dropped per HANDOVER §7.6)
OPUS_NUCLEAR_AUDIT_25APR (removed in vault cleanup 2026-04-30; recoverable git history)
QA_MANUAL_24APR_2230 (removed)
QA_MANUAL_25APR_POSTFIX (removed)
VAULT_CONSOLIDATION_GUIDE (deprecated)
VAULT_SYNC_DIAGNOSTIC (deprecated)
X (placeholder)
```

**Severity classification:**
- LOW (placeholder/example): `.`, `name`, `FILE_NAME`, `NNN-...`, `X`, `HANDOVER`, `HANDOVER_ACTIVE`, generic = ignore
- MEDIUM (deprecated/archived but content preserved git history): `AUDIT_GENERAL_23APR`, `AUDIT_COACH_JS_24APR`, `OPUS_NUCLEAR_AUDIT_25APR`, `QA_MANUAL_*`, `OBSIDIAN_SETUP_GUIDE`, `ASYNC_EXECUTION_PROTOCOL`, `EXEC_RESULTS`, `LOG_SCHEMA_AUDIT_*`, `HARDCODED_AUDIT_*`, `CTX_ALLLOGS_AUDIT_*`, `FIREBASE_AUDIT_1_8`, `VAULT_CONSOLIDATION_GUIDE`, `VAULT_SYNC_DIAGNOSTIC`, `FAZA_*_FINAL_REPORT`, `FAZA_*_ROADMAP`, `LATEST_*` cycle entries — preserved per VAULT_RULES §SAFETY NET (recoverable)
- HIGH (active drift — real spec issue): `013-ADR-aa-detection` (Cluster D §9.8 documented mea culpa in ADR 026 + CURRENT_STATE; preserve as audit trail anti-recurrence rule), `027-engine-deload` (broken cross-ref — needs verify Daniel)
- TRAILING SLASH/MISC: `022-bayesian-nutrition-inference\` and `024-goal-driven-program-templates\` (trailing escape from grep parsing — actual files exist, false positives)

**Recommendation:** Most orphans are intentional historical references preserved per zero-info-loss + recoverable git history. NO bulk cleanup needed. Only `027-engine-deload` flag → verify Daniel.

---

## Appendix C — Active vault deprecated markers index (41 active files)

```
00-index/CURRENT_STATE.md             — DEPRECATED markers in §JUST_DECIDED entries (cross-refs to archive cycles), expected
00-index/INDEX_MASTER.md              — DEPRECATED markers (Pricing DEPRECATED §36.50 reference, expected)
01-vision/DANIEL_COMPLETE_PROFILE.md  — Anti-pattern flag (1200 kcal × 3 luni)
01-vision/MOAT_STRATEGY.md            — DEPRECATED line 113 SalaFull→Andura strikethrough rebrand
01-vision/PRODUCT_STRATEGY_SPEC_v1.md — Multiple §1.2-§1.4 DEPRECATED §36.50 + §5.4-§5.5/§5.8 + §6.1/§6.5 amendments inline
01-vision/PROJECT_VISION.md           — "post-launch" note minor
03-decisions/009-calibration-tiers.md — §AMENDMENT 2026-04-30 inline expected
03-decisions/010-no-anthropic-trademark-public.md — DEPRECATED references (legal/branding language)
03-decisions/011-coach-decision-log-architecture.md — schema extended + LWW→T&B amendment 2026-04-30 inline
03-decisions/014-onboarding-profile-typing.md — Update 2026-04-27 + Daniel sign-off log expected
03-decisions/016-vitality-layer.md    — depends ADR 018 marker
03-decisions/018-engine-extensibility-architecture.md — Sign-Off Update inline
03-decisions/022-bayesian-nutrition-inference.md — STUB→SPEC READY V1 transition
03-decisions/024-goal-driven-program-templates.md — STUB→SPEC READY V1 transition + COMPILE DRAFT FULL
03-decisions/025-andura-gandeste-pentru-user.md — STUB CANDIDATE pending dedicated chat
03-decisions/026-offline-coaching-decision-tree-exhaustive.md — LOCKED V1 + cross-refs cleanup updates
03-decisions/027-engine-energy-adjustment.md — STUB→SPEC REFERENCE flip 2026-05-06 chat-8
03-decisions/028-engine-tempo-form-cues.md — STUB→SPEC REFERENCE flip
03-decisions/029-engine-specialization.md — STUB→SPEC REFERENCE flip
03-decisions/031-engine-warmup-mobility.md — SPEC REFERENCE direct
03-decisions/032-engine-deload-protocol.md — SPEC REFERENCE direct
03-decisions/ADR_MULTI_TENANT_AUTH_v1.md — Faza 1 LANDED + Faza 2+3 deferred multiple §AMENDMENTS
03-decisions/DECISION_LOG.md          — Cronologic descending entries with status changes
04-architecture/MULTI_TENANT_AUTH_MIGRATION_SPEC.md — DRAFT spec ready Sprint 3
04-architecture/TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC.md — DRAFT spec ready Sprint 3
05-findings-tracker/AUDIT_30_9_BLOCKED_STATE.md — DEFERRED status
05-findings-tracker/FINDINGS_MASTER.md — many 🟡 DEFERRED + ⚪ WONTFIX entries (canonical bug states)
05-findings-tracker/INSIGHTS_BACKLOG.md — many "Deferred post-Beta v1.5" entries (canonical backlog state)
06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md — DEPRECATED references inline (cross-ref AMENDMENT)
06-sessions-log/HANDOVER_DECISION_CLUSTER_D1_D4_2026-04-30_evening.md — D-cluster status updates
06-sessions-log/HANDOVER_ENGINES_SPEC_2026-04-30_evening.md — engines status post-§9.X compile
06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md — INDEX file post-split
06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md — many DEPRECATED markers (§3 pricing, etc.)
06-sessions-log/HANDOVER_SCENARIOS_COVERAGE_2026-04-30_evening.md — PRE-BETA blocker active
06-sessions-log/HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md — Faza 3+4 historical
08-workflows/CHAT_MIGRATION_PROTOCOL.md — v5 amendments + ASYNC_EXECUTION_PROTOCOL obsolete reference
08-workflows/FORWARD_COMPAT_PRINCIPLES.md — versioning principles
08-workflows/MODEL_UPGRADE_AUDIT_PROTOCOL.md — model upgrade rules
DIFF_FLAGS.md                          — P1/P2 status entries (canonical operational)
PROMPT_CC_HYGIENE.md                   — §AMENDMENT inline §47 + §10 fast handover
VAULT_RULES.md                         — §AMENDMENTS + §HANDOVER_PROTOCOL DISAMBIGUATION expected
```

**Most markers are LEGITIMATE inline AMENDMENT/STATUS markers per VAULT_RULES §3.1 update-in-place principle.** ZERO file requires action specifically due to these markers.

---

## Appendix D — Code refs from `src/` per active vault file (BLOCKING_ARCHIVE)

Active files with src/ code references (26 files, total ~50+ src/ paths):

```
01-vision/SUFLET_ANDURA.md → src/engine/specialization/weaknessConsumer.js
03-decisions/009-calibration-tiers.md → src/coach/orchestrator/utilities/convergenceGuard.js + src/engine/energyAdjustment/constants.js
03-decisions/011-coach-decision-log-architecture.md → src/util/coachDecisionLog.js
03-decisions/022-bayesian-nutrition-inference.md → src/engine/bayesianNutrition/constants.js
03-decisions/026-offline-coaching-decision-tree-exhaustive.md → 10 src refs (bayesianNutrition/deload/energyAdjustment/goalAdaptation/periodization × constants+index)
03-decisions/027-engine-energy-adjustment.md → src/engine/energyAdjustment/index.js
03-decisions/030-adapter-design-pattern.md → 6 src refs (coach/orchestrator/contextBuilder + index + result + types + utilities/budget + utilities/convergenceGuard)
03-decisions/031-engine-warmup-mobility.md → 2 src refs (warmup/constants + warmup/index)
03-decisions/032-engine-deload-protocol.md → src/engine/deload/constants.js
03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1.md → src/engine/suflet-andura/bias-detection.js
03-decisions/ADR_CASCADE_DEFENSE_v1.md → 5 src refs (orchestrator/result + types + utilities/budget + engine/periodization/constants + engine/suflet-andura/cascade-defense)
03-decisions/ADR_COMPOSITE_SIGNAL_LAYER_v1.md → src/engine/deload/constants.js
03-decisions/ADR_MODE_DETECTION_UI_v1.md → src/engine/suflet-andura/modes-ui.js
03-decisions/ADR_MULTI_TENANT_AUTH_v1.md → 6 src refs (auth + firebase + migrations/2026-05-02-auth-path-migration + storage/db + storage/migrateAnonymousToAuth + storage/tier2Stub)
03-decisions/ADR_OUTLIER_FILTER_v1.md → 2 src refs (engine/energyAdjustment/yoyoAntiFlap + suflet-andura/outlier-filter)
03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1.md → src/engine/deload/crossEngineHooks.js
03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1.md → src/engine/suflet-andura/rir-matrix.js
03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1.md → src/schema/exerciseMetadata.js
03-decisions/DECISION_LOG.md → src/storage/tier2Stub.js
04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1.md → src/validation/matchMetric.js
04-architecture/MULTI_TENANT_AUTH_MIGRATION_SPEC.md → src/migrations/2026-05-02-auth-path-migration.js
04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1.md → 6 src refs (simulator/flagging + invariants + pipeline + pruning + runner + types)
04-architecture/TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC.md → src/util/tombstones.js
06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md → 8 src refs (components/deleteAccountModal + emailChangeForm + forkDecisionModal + logoutModal + recoveryEmailLostModal + pages/settings + util/adminCleanupHelpers + util/telemetry)
06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md → src/simulator/invariants.js
VAULT_RULES.md → src/__tests__/golden-master/setup.js
```

**Total active files with src/ refs:** 26
**Total src/ paths referenced:** ~70+
**ALL 26 files = preserve hard (BLOCKING_ARCHIVE).**

**Capacity A LOCKED targets verification:**
- HANDOVER_VAULT_HYGIENE: 0 src refs ✅ safe to archive (post REDIRECT)
- HANDOVER_MISC: 0 src refs ✅ safe to archive (post REDIRECT)
- HANDOVER_GLOBAL_SPLIT_PLAN: 0 src refs ✅ safe to archive (zero inbound)

---

## Appendix E — Inbound count ranking (de-facto SSOT, top 30)

```
91 ./06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md   [INDEX post-split — CRITICAL preserve]
78 ./03-decisions/026-offline-coaching-decision-tree-exhaustive.md [META-architecture global SSOT]
62 ./03-decisions/018-engine-extensibility-architecture.md   [Foundation NEXT]
54 ./03-decisions/009-calibration-tiers.md                   [Foundation tier system]
34 ./03-decisions/DECISION_LOG.md                            [Master cronologic log]
29 ./03-decisions/022-bayesian-nutrition-inference.md        [SPEC READY V1 complementary §9.4]
28 ./04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md       [Architecture canonical]
28 ./03-decisions/ADR_MULTI_TENANT_AUTH_v1.md                [Auth migration ADR]
28 ./03-decisions/011-coach-decision-log-architecture.md     [CDL foundation]
27 ./03-decisions/025-andura-gandeste-pentru-user.md         [Graceful Degradation Universal stub]
22 ./03-decisions/028-engine-tempo-form-cues.md              [SPEC REFERENCE §9.5]
22 ./03-decisions/017-demographic-prior-database.md          [T0 fallback]
19 ./03-decisions/029-engine-specialization.md               [SPEC REFERENCE §9.6]
19 ./03-decisions/027-engine-energy-adjustment.md            [SPEC REFERENCE §9.3]
19 ./03-decisions/024-goal-driven-program-templates.md       [SPEC READY V1 complementary §9.2]
18 ./03-decisions/014-onboarding-profile-typing.md           [Onboarding tier system]
17 ./03-decisions/023-llm-intent-interpretation.md           [LLM scope strict]
17 ./01-vision/PRODUCT_STRATEGY_SPEC_v1.md                   [Product strategy 80 decisions]
16 ./03-decisions/030-adapter-design-pattern.md              [Adapter Design D1-D5 LOCKED]
15 ./03-decisions/013-auto-aggression-detection.md           [AA Detection]
14 ./VAULT_RULES.md                                          [Authoritative rules]
14 ./03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1.md           [Pain button]
11 ./03-decisions/ADR_OUTLIER_FILTER_v1.md                   [Outlier filter]
11 ./00-index/CURRENT_STATE.md                               [Live SSOT chat-state]
9  ./03-decisions/001-local-first-storage.md                 [Local-first foundation]
8  ./03-decisions/016-vitality-layer.md                      [Vitality layer T2+]
8  ./03-decisions/002-firebase-rest-not-sdk.md               [Firebase REST]
7  ./03-decisions/ADR_CASCADE_DEFENSE_v1.md                  [Cascade defense 4 layers]
7  ./03-decisions/021-calibration-drift-reconciliation.md    [Drift reconciliation]
7  ./03-decisions/020-storage-tiering-strategy.md            [Storage tiering Tier 0/1/2]
```

**ALL top 30 = ACTIVE_SSOT_PRESERVE hard.** ZERO archive risk.

---

## Phase E — Final aggregate KPI (re-confirmed post-Phase B+C+D analysis)

### Active vault recommendation distribution

- **ACTIVE_SSOT_PRESERVE:** 90 active files (all foundation + ADRs + canonical SSOTs + theme files preserved)
- **ARCHIVE_FULL CANDIDATE (Capacity A LOCKED chat-NEW3):** 2 files (`HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md` 127 LOC + `HANDOVER_MISC_2026-04-30_evening.md` 5716 LOC) = ~5843 LOC reduction (~6.8% of vault)
- **ARCHIVE_FULL OPTIONAL (Daniel decision):** 1 file (`HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05.md` 171 LOC, 0 inbound)
- **PRESERVE_AS_IS (archive):** 243 archive files (all preserve audit trail per VAULT_RULES §3.5)
- **UNCERTAIN_ESCALATE:** 7 items per Phase D Batch 7 (ADR 005 React + HANDOVER_MISC §32/§31/§29.7/§36.103 + CURRENT_STATE §JUST_DECIDED compaction + DECISION_LOG distant entries + Optional split plan archive)

### Total potential LOC reduction (active vault)

- **Capacity A scope (Batch 1+3):** 5843 + (171 if Daniel approves Batch 1) = ~6014 LOC = **~7% of total vault** (after Capacity A archives, vault active LOC ~80,000 from current ~85,986)
- **Long-term Faza 3+ scope (Batch 4):** Additional 426 (ENGINES_SPEC) + 72 (ONBOARDING_T0) + ~2144 (SUFLET_ANDURA §4 transcript optional split) = ~2642 LOC potential

### Estimated post-cleanup vault state

- **Files (active):** 93 → 91 (Capacity A) → 90 (Batch 1) → 88 (Batch 4 long-term post-Faza 3) — ~5% file count reduction
- **LOC (active):** ~9,500 (active subset, excluding archive 243 files / ~76,000 LOC) → reduce ~6,000 (~63% of active reduction). Total vault: 85,986 → ~80,000 LOC (~7% global)

### Key insights for next-Claude

1. **Capacity A LOCKED is well-prepared** per chat-NEW3 §JUST_DECIDED #3 — execute Batch 1+2+3+5+6 sequential per Phase D, total ~75-115 min CC autonomous post-Daniel-sync on Batch 7 ESCALATE items.
2. **REDIRECT discipline mandatory** — pre-flight grep + Batch 2 REDIRECT BEFORE archive Batch 3 = critical anti-broken-wikilink.
3. **8 src refs in HANDOVER_AUTH_FLOW + 6 in ADR_MULTI_TENANT_AUTH** = absolute BLOCKING_ARCHIVE — ZERO touch on those theme files.
4. **CURRENT_STATE `## JUST_DECIDED` 1128 LOC** = drift signal for periodic compaction strategy review — ESCALATE_DANIEL.
5. **Top 5 inbound files (HANDOVER_GLOBAL_INDEX 91 / ADR 026 78 / ADR 018 62 / ADR 009 54 / DECISION_LOG 34)** = highest gravity, ZERO touch beyond cosmetic stat refresh.
6. **Long-term Faza 3+ Batch 4** depends on Faza 3 STRANGLER complete (engines wired + ADR 026 §9.X canonical confirmed in production) — defer until post-Faza 3.
7. **SUFLET_ANDURA §4 transcript split** = optional cosmetic optimization; canonical preservation already exists in archive `55_PROCESUL_DE_GANDIRE_CONSUMED_2026-05-02.md`.

🦫 **Bugatti audit complete. Vault hygiene state-aware. Ready for next-Claude (or post-BW eu) to comand cleanup batches direct ZERO lookup ulterior.**
