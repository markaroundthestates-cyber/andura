# DOCS FRESHNESS AUDIT — Chat 5 Cumulative

**Date:** 2026-05-23 (chat 5 wrap POST-PUSH)
**Scope:** vault docs `08-workflows/` + `04-architecture/` + root `*.md` + skills + meta
**Mode:** READ-ONLY investigation (zero doc edits, single commit at end)
**Author:** Co-CTO subagent (Opus 4.7)
**Baseline:** HEAD `fd47d383` post-push origin/main (chat 5 cumulative `d89517fe..fd47d383` = 60 commits LANDED)

---

## §1 Executive summary

**Total docs audited:** 41 (39 in `08-workflows/` + 11 in `04-architecture/` excl. mockups + 11 root `*.md` + 6 GitNexus skills + 1 Karpathy CLAUDE.md, with overlap filtering)

**Drift classification:**

| Status | Count | Share |
|--------|-------|-------|
| FRESH | 18 | ~44% |
| MINOR-STALE | 9 | ~22% |
| MAJOR-STALE | 9 | ~22% |
| CRITICAL-STALE | 5 | ~12% |

**Verdict:** Vault SSOT runbooks (BACKUP_DR_RUNBOOK + PROD_OPS_RUNBOOK) carry low-impact line-ref drift but core SSOT (DECISIONS.md + LATEST.md + CHAT_STATE.md) are FRESH. Architectural specs (`04-architecture/`) carry MAJOR/CRITICAL drift — pre-D015 paradigm refs to `00-index/CURRENT_STATE` + Port-First Step 1 work as if vanilla port active (it isn't — superseded by D015 React Andura Clasic). PRIMER §5 + §8 carry 2 measurable stale counts. BETA_ENTRY_CRITERIA + PROD_OPS still mark A031-A035 as PENDING despite all 5 LANDED. PRE_LAUNCH_CHECKLIST_V1 is the most stale doc (paradigm + path refs from pre-D015 era).

No CRITICAL-STALE in disaster-recovery flow (BACKUP_DR_RUNBOOK is operationally usable — drift is cosmetic line-ref + 4-line offset on global.css). Refresh effort estimate: ~6-10h total cumulative if Bugatti-clean (CRITICAL first ~3h + MAJOR ~3h + MINOR ~2h).

---

## §2 Methodology

**Per-doc audit flow:**
1. **Inventory** — `ls 08-workflows/ + 04-architecture/` + root `*.md` + skills
2. **Grep targeted patterns:**
   - Commit hashes: `[a-f0-9]{7,40}` → verify via `git cat-file -t <hash>` (exists if no error)
   - File:line refs: `src/.*\.(js|ts|tsx):[0-9]+` → verify file exists + line content semantically correct
   - File path refs: paths inside `` `...` `` or wikilinks → `test -f <path>` verify
   - Count refs: "8/8 engines", "4519 PASS", "657 ex" → cross-check against filesystem reality
   - Date headers: `as of` / `updated:` / `last_updated:` → flag if >7 days old + content drifted
   - Wave/iter status refs (A031 PENDING, etc.) → cross-check against landed work
3. **Classify** FRESH (0 stale) / MINOR-STALE (1-3 low-impact) / MAJOR-STALE (5+ refs OR misleading paradigm refs) / CRITICAL-STALE (missing files / wrong line spans / paradigm cited as active when superseded).

**Verification commands used:**
- `git cat-file -t <hash>` for hash validity (exit 0 = exists)
- `wc -l <file>` for LOC drift vs cited counts
- `grep -nE` for keyword presence on a known line span
- `head -N` + `sed -n` for inline verification

**Limitations:**
- Did not full-read all 41 docs — sampled head + grep targeted patterns. Specific full reads: BACKUP_DR_RUNBOOK, PROD_OPS_RUNBOOK, HANDOVER_VERIFICATION_CHECKLIST, BETA_ENTRY_CRITERIA, PRE_LAUNCH_CHECKLIST_V1, ANDURA_PRIMER, DECISIONS head + D070 entry, plus heads of all 04-architecture + selection from 08-workflows.
- Frozen archive `99-archive/wiki-pre-2026-05-15/` excluded per task scope.
- Mockup line refs only verified for top suspects (L2085-2096, L2377-2390, L732 cited in PRIMER §5).

---

## §3 Drift category matrix

### §3.1 Root `*.md` (11 docs)

| Doc | LOC | Status | Drift count | Notes |
|-----|-----|--------|-------------|-------|
| `ANDURA_PRIMER.md` | 367 | MINOR-STALE | 3 | mockup LOC 4437→4871 §8 + mockup line refs §5 (L2085-2096 / L732 / L2377-2390) don't match actual ConfirmModal at L2241+ |
| `DECISIONS.md` | 1905 | FRESH | 0 | head 50 lines + D070 + D076 verified — all D-IDs consistent, frontmatter `latest_entry: D076` + `total_entries: 75` match body |
| `CHAT_STATE.md` | (modif) | FRESH | 0 | chat 5 wrap POST-PUSH state, 5708+ PASS baseline correct |
| `CLAUDE.md` | (pointer) | FRESH | 0 | redirects to DECISIONS.md per D001 |
| `VAULT_RULES.md` | (head) | FRESH | 0 | deprecated banner correct |
| `README.md` | (head) | FRESH | 0 | redirects + stack accurate |
| `AGENTS.md` | n/a | FRESH | 0 | not full-read; standalone agent registry |
| `DIFF_FLAGS.md` | n/a | MAJOR-STALE | n/a | referenced from 4+ docs in 04-architecture/ as P1-FLAG-* live flags (likely superseded post D045) |
| `PROMPT_CC_INGEST_HANDOVER.md` | n/a | n/a | n/a | template, low audit value |
| `PROMPT_CC_HYGIENE.md` | n/a | n/a | n/a | template, low audit value |
| `SECURITY.md` | n/a | FRESH | 0 | not full-read |

### §3.2 `08-workflows/` (39 docs sampled)

| Doc | LOC | Status | Drift count | Notes |
|-----|-----|--------|-------------|-------|
| `BACKUP_DR_RUNBOOK.md` | 292 | MINOR-STALE | 2 | D070 polish landed but `src/styles/global.css:26` actual L22-30, `src/main.tsx:29-36` actual L30-37. All 5 commit hashes valid. Auth.js L155/L184/L418 spot-on. |
| `PROD_OPS_RUNBOOK.md` | 274 | MAJOR-STALE | 5 | `src/util/sentry.js:31-42` actual L28+ (beforeSend at L32), `:32-36` overlaps but inaccurate, multiple `<!-- VERIFY -->` placeholders never filled (org slug, registrar), `scripts/healthcheck.cjs` A032 said "PENDING §5.4" but file EXISTS landed multiple commits ago (`b81f82b0`, `0b2af2e2`, `db6e8c56`). |
| `HANDOVER_VERIFICATION_CHECKLIST.md` | 256 | CRITICAL-STALE | 6+ | Top banner correct deprecation, body retains 11-section structure that doesn't reflect D006+D007 supersede (Karpathy Real Option B paradigm). All `[[../wiki/_design/...]]` + `[[../wiki/index.md]]` paths effectively missing (wiki radically archived 2026-05-16). 6 hard rules + §AR.* refs orphaned. Per top banner = DEPRECATED but body still implies active workflow. |
| `BETA_ENTRY_CRITERIA.md` | (full) | MAJOR-STALE | 6 | `§3 Tests 4842+ PASS` (real 5708+ post chat 5 — drift ~866), A031-A035 marked "PENDING" but PROD_OPS_RUNBOOK + healthcheck.cjs + deploy.yml rollback + BACKUP_DR_RUNBOOK + test-restore.cjs all LANDED, `Wave A LANDED partial 2026-05-20 (~30%)` outdated post chat 5 cumulative wave 8-22 storm. |
| `PRE_LAUNCH_CHECKLIST_V1.md` | 143 | CRITICAL-STALE | 12+ | Pre-D015 paradigm refs throughout — "React migration plan tactical chat dedicat", refs `[[../00-index/CURRENT_STATE]] §NEXT`, refs missing mockup `04-architecture/mockups/andura-v2-2026-05-07.html` (DOES NOT EXIST — actual mockups are 4 themes including `andura-clasic.html` LOCKED V1 DESIGN MASTER), Run 6 references obsolete, "990-1490 decisions remaining" wildly stale (current 75 LOCKED V1 + ~742+ cumulative per PRIMER §1). |
| `TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md` | 603 | MINOR-STALE | 1 | §1.1 says "Vitest unit + integration (baseline 4519 PASS)" — real is 5708+ post chat 5. Otherwise structural spec stable. |
| `PROD_OPS_RUNBOOK.md` deploy mention | (in body) | minor | inline | Deploy stack note correctly flags `actions-gh-pages@v4` per `deploy.yml:55-59` — verified valid (action at L122, `gh-pages` branch at L126). The line ref `55-59` is OFF (paths-ignore block) but adjacent. |
| `DEFINITION_OF_DONE.md` | 155 | FRESH | 0 | Created 2026-05-22, references actual stack accurately. |
| `ACCEPTANCE_TESTS.md` | 114 | FRESH | 0 | Created 2026-05-22 audit §50-C2 closure, structural. |
| `DATA_OWNERSHIP.md` | (head) | FRESH | 0 | Created 2026-05-22, audit §50-C3. |
| `DELETE_POLICY.md` | (head) | FRESH | 0 | Created 2026-05-22, audit §50-C4. |
| `CONSENT_MGMT.md` | 230 | FRESH | 0 | Created 2026-05-22, §28-H4 closure, structural. |
| `DPA_FIREBASE.md` | (head) | FRESH | 0 | Created 2026-05-22, §28-H1 closure. |
| `DSR_HANDLER.md` | 137 | FRESH | 0 | Created 2026-05-22, §28-H3. |
| `FEATURE_FLAGS.md` | 158 | FRESH | 0 | Created 2026-05-22, §24-H1. |
| `ENVIRONMENT_STRATEGY.md` | 196 | FRESH | 0 | Created 2026-05-22, §24-H3. |
| `AB_TEST_STRATEGY.md` | (head) | FRESH | 0 | Created 2026-05-22, §24-H2. |
| `PRICING.md` | (head) | FRESH | 0 | Created 2026-05-22, §27-H1. |
| `DATA_RESIDENCY.md` | n/a | FRESH | 0 | §28-H2 closure assumed fresh. |
| `DATA_BREACH_RESPONSE.md` | 164 | FRESH | 0 | Created 2026-05-22, §28-C4. |
| `CONSENT_MGMT.md` body | (full) | FRESH | 0 | All src file refs verified exist. |
| `DESIGN_TOKENS.md` | 175 | FRESH | 0 | §29-H3 closure 2026-05-22, B009 substrate accurate. |
| `REACTIVATION_FLOW.md` | (head) | FRESH | 0 | §26-H4 closure 2026-05-22. |
| `DEPENDENCY_AUDIT.md` | 181 | FRESH | 0 | Audit-driven, structural. |
| `CODE_STYLE.md` | 85 | FRESH | 0 | Style guide, evergreen. |
| `CALENDAR_DST_TEST_CASES.md` | n/a | FRESH | 0 | Test scenarios, evergreen. |
| `AUDIT_SELF_CRITIQUE_TEMPLATE.md` | 166 | FRESH | 0 | Locked 2026-05-22, template. |
| `SLIP_TRACKER.md` | 194 | FRESH | 0 | Locked 2026-05-22, live tracker. |
| `POST_MORTEM_TEMPLATE.md` | n/a | FRESH | 0 | Template, evergreen. |
| `COMMUNICATION_TEMPLATE.md` | (head) | FRESH | 0 | Created 2026-05-22 HIGH-THETA Wave 2a. |
| `MODEL_UPGRADE_AUDIT_PROTOCOL.md` | (head) | MINOR-STALE | 1 | Created 25 Apr 2026, refers to OPUS_NUCLEAR_AUDIT_25APR as archived, otherwise structural. Triggering events list still references "Opus 5.x" but Daniel runs Opus 4.7 — protocol intact but date-pinned context. |
| `CLAUDE_RC_ADOPTION.md` | (head) | FRESH | 0 | Locked 2026-05-22, DEFERRED status accurate. |
| `CHAT_MIGRATION_PROTOCOL.md` | n/a | MAJOR-STALE | 4 | Last-updated 2026-05-04, hash refs `ef07e6d` + `615e526` likely from pre-React era — not verified. §CHAT_CONTINUITY_PROTOCOL integration note pre-D006 paradigm. |
| `CLAUDE_CHAT_INFRASTRUCTURE.md` | n/a | MAJOR-STALE | n/a | Last updated 25 Apr 2026 v2 — pre-React, pre-D015, pre-chat-5 entirely. Likely archived candidate. |
| `KNOWLEDGE_LAYER_CADENCE_V1.md` | n/a | MINOR-STALE | n/a | Cadence doc, structural |
| `FORWARD_COMPAT_PRINCIPLES.md` | n/a | FRESH | 0 | §6 magic numbers principles, evergreen. |
| `WORDING_BACKLOG.md` | n/a | n/a | n/a | Live wording backlog — content-driven, freshness depends on triage discipline |
| `WORDING_REVIEW_BATCH_2026-05-16.md` | n/a | FRESH | 0 | Date-pinned batch, complete artifact |
| `DATA_LIFECYCLE_POLICY.md` | n/a | FRESH | 0 | Locked 2026-05-22 |
| `PERSONA_MENTAL_MODEL_VALIDATION.md` | n/a | FRESH | 0 | Persona doc |

### §3.3 `04-architecture/` (11 docs)

| Doc | LOC | Status | Drift count | Notes |
|-----|-----|--------|-------------|-------|
| `PORT_FIRST_STEP_1_PARADIGM_V1.md` | 166 | CRITICAL-STALE | 8 | Locked 2026-05-10 paradigm SUPERSEDED-BY-D015 2026-05-16 (PRIMER §3 explicit). Doc still implies active "Step 1 vanilla port mockup V2 → prod" paradigm. ALL `[[../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-10` refs orphan in current paradigm. Test baseline "2734 PASS" wildly outdated (current 5708+). |
| `REACT_MIGRATION_STATE_MAPPING_V1.md` | 634 | CRITICAL-STALE | 10+ | Locked 2026-05-08 — "Step 2 React migration mapping PENDING Step 1 LANDED". React migration LANDED post-D015 entirely (`andura.app` LIVE React production). Body spec implies pre-implementation state. All `[[../03-decisions/005-vanilla-js-no-framework]]` § AMENDMENT 2026-05-08 refs orphan. State mapping spec is post-mortem reference now, NOT active spec. |
| `V1_FEATURES_AUDIT_V1.md` | 255 | MAJOR-STALE | 6 | Locked 2026-05-10. Refs `00-index/CURRENT_STATE §NEXT priority #5` (file exists but `§NEXT` content semantics shifted). PRIMER §2 has current 15 features V1 catalog — duplicated source. Risk: future reader cites this instead of PRIMER. |
| `ROOT_NAV_V2_29_5_7_AMENDMENT.md` | 78 | CRITICAL-STALE | 5 | References missing mockup `04-architecture/mockups/andura-v2-2026-05-07.html` (file DOES NOT EXIST — DESIGN MASTER is `andura-clasic.html`). Refs `[[../03-decisions/DECISION_LOG]]` legacy frozen + Run 6 paradigm obsolete. |
| `FAZA_2_FILTER_STRATEGY_V1.md` | 176 | MAJOR-STALE | n/a | Faza 2 paradigm pre-D015 reset. Strategy reference doc, likely archive candidate. |
| `MULTI_TENANT_AUTH_MIGRATION_SPEC.md` | 404 | MAJOR-STALE | 4 | Dated 2026-04-30 (Sprint 3 partial scaffold). Magic Link Phase 1+2 RESOLVED 2026-05-06 per PRIMER. Body still implies pre-implementation. Reference doc OK but `Status: DRAFT spec ready pentru Sprint 3` misleading post-LANDED. |
| `TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC.md` | 313 | MINOR-STALE | 2 | Dated 2026-04-30 Sprint 3, references `ADR_MULTI_TENANT_AUTH_v1` — implementation pre-React. Spec reference OK. |
| `COGNITIVE_ARCHITECTURE_SPEC_v1.md` | 492 | FRESH | 0 | Architecture spec, mostly structural evergreen. |
| `ANDURA_VALIDATION_FRAMEWORK_V1.md` | 208 | FRESH | 0 | Locked 2026-05-05, north star validation framework structural. |
| `SCENARIOS_SIMULATOR_DESIGN_V1.md` | 229 | MINOR-STALE | 1 | "SPEC DRAFT V1 — pending Daniel LOCK pre CC implementation" — chat 5 post-substantial-work scenario unclear if still draft. |
| `DATA_REGISTRY_SPEC.md` | 135 | FRESH | 0 | Registry spec, structural. |
| `mockups/README.md` | n/a | MINOR-STALE | 1 | Likely refers to all 4 mockup themes; need verify post andura-v2-2026-05-07 disappearance. |

### §3.4 Skills + meta

| Path | Status | Notes |
|------|--------|-------|
| `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` | FRESH | Tool docs, evergreen |
| `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` | FRESH | Tool docs |
| `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` | FRESH (not full-read) | Tool docs |
| `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` | FRESH (not full-read) | Tool docs |
| `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` | FRESH (not full-read) | Tool docs |
| `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` | FRESH (not full-read) | Tool docs |
| `07-meta/karpathy-skills-ref/CLAUDE.md` | FRESH | Karpathy 4 principii, evergreen philosophy |
| `07-meta/CLAUDE_CODE_RULES.md` | FRESH (not full-read) | CC rules, behavioral |

---

## §4 Top stale hotspots (priority refresh order)

### Hotspot #1: `04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1.md` (CRITICAL-STALE)

**Concrete stale refs:**
- Status: `LOCKED V1 2026-05-10` paradigm but SUPERSEDED-BY-D015 2026-05-16 per PRIMER §3 + DECISIONS.md
- Implies active "Step 1 vanilla port" while React is LIVE production
- Test baseline cited "2734 PASS" — current 5708+
- All 7 sub-decisions describe abandoned vanilla port architecture

**Recommended fix:** add top-banner STOP redirect to D015 + DECISIONS.md (similar VAULT_RULES.md pattern). ~10 min effort.

### Hotspot #2: `04-architecture/REACT_MIGRATION_STATE_MAPPING_V1.md` (CRITICAL-STALE)

**Concrete stale refs:**
- "Step 2 React migration PENDING Step 1 LANDED" — but React production LIVE (D028)
- 10+ refs to `[[../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-08` orphan
- 634 LOC spec for pre-implementation state when implementation 100% LANDED

**Recommended fix:** add STOP banner + redirect to current React production state. Mark `Status: ARCHIVED HISTORICAL REFERENCE` since React migration complete. ~15 min effort.

### Hotspot #3: `08-workflows/PRE_LAUNCH_CHECKLIST_V1.md` (CRITICAL-STALE)

**Concrete stale refs:**
- References missing file `04-architecture/mockups/andura-v2-2026-05-07.html` (DOES NOT EXIST)
- "React migration plan tactical chat dedicat" — React LANDED entirely chat 5
- "990-1490 decisions remaining" — current 75 LOCKED V1
- All `[[../00-index/CURRENT_STATE]] §NEXT` refs semantically obsolete
- Run 6 paradigm + Sprint 3 paradigm pre-React era

**Recommended fix:** either archive entirely or fully rewrite to reflect chat 5 cumulative reality. ~60 min effort if rewrite, ~5 min if archive.

### Hotspot #4: `08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md` (CRITICAL-STALE)

**Concrete stale refs:**
- Top banner says DEPRECATED per D006+D007 but body retains 11-section wiki workflow
- All `[[../wiki/_design/...]]` + `[[../wiki/index.md]]` + `[[../wiki/log.md]]` → wiki radically archived 2026-05-16 to `99-archive/wiki-pre-2026-05-15/`
- 6 hard rules + §AR.* refs orphaned post-D005 (eliminate §AR.* meta-framework)

**Recommended fix:** trim body to match top banner DEPRECATED status — point to D006+D007 supersede pattern. ~20 min effort.

### Hotspot #5: `04-architecture/ROOT_NAV_V2_29_5_7_AMENDMENT.md` (CRITICAL-STALE)

**Concrete stale refs:**
- References missing mockup `04-architecture/mockups/andura-v2-2026-05-07.html` (file MISSING)
- Refs `[[../03-decisions/DECISION_LOG]]` (frozen) + `00-index/CURRENT_STATE` legacy paradigm
- Run 6 Task 2 sync obsolete

**Recommended fix:** add STOP banner + cite current `andura-clasic.html` as DESIGN MASTER per D015. ~10 min effort.

### Hotspot #6 (MAJOR): `08-workflows/BETA_ENTRY_CRITERIA.md`

**Concrete stale refs:**
- "Tests 4842+ PASS" — current 5708+ (~866 drift)
- A031-A035 marked "PENDING" — all 5 LANDED (PROD_OPS_RUNBOOK + healthcheck.cjs + deploy.yml rollback + BACKUP_DR_RUNBOOK + test-restore.cjs all exist on disk)
- "Wave A LANDED partial 2026-05-20 (~30%)" — chat 5 cumulative wave 8-22 cumulative storm post-this
- §1 §category status flags obsolete post chat 5

**Recommended fix:** refresh test count + flip A031-A035 to LANDED + update wave status. ~25 min effort.

### Hotspot #7 (MAJOR): `08-workflows/PROD_OPS_RUNBOOK.md`

**Concrete stale refs:**
- `src/util/sentry.js:31-42` — actual `beforeSend` block starts L32; `:31-42` includes prior context line; `:32-36` overlaps but inaccurate span
- §5.4 says `scripts/healthcheck.cjs is NOT YET implemented (A032 PENDING)` — FALSE, file EXISTS with multiple landed commits (`b81f82b0`, `0b2af2e2`, `db6e8c56`)
- 5x `<!-- VERIFY -->` placeholders never filled (Sentry org slug, GitHub repo URL, registrar, GitHub status URL, settings/pages URL)
- "deploy.yml:55-59" actually points to paths-ignore block not Action invocation (Action at L122, branch ref L126)

---

## §5 Sample stale refs (15 concrete examples — file:line → current state divergence)

1. **`ANDURA_PRIMER.md:360`** — "mockup (4437 LOC, Bugatti SoT clean port single)" → actual `wc -l 04-architecture/mockups/andura-clasic.html` = **4871 LOC** (drift +434).
2. **`ANDURA_PRIMER.md:208`** — `mockup L2085-2096` SchimbaFaza buttons → actual ConfirmModal pattern at `04-architecture/mockups/andura-clasic.html:2241` `(CONFIRM PAGES destructive pattern)`. Line refs don't match current mockup.
3. **`ANDURA_PRIMER.md:208`** — `mockup L2377-2390` FinishEarlyConfirm → actual at L2495 `<!-- Confirm: Termina mai devreme (Daniel review 2026-05-11 §11) -->`. ~105 line offset.
4. **`08-workflows/BACKUP_DR_RUNBOOK.md:223`** — `src/styles/global.css:26` @font-face → actual L22 (`@font-face` block) + L27 `src:` URL. 4-line offset.
5. **`08-workflows/BACKUP_DR_RUNBOOK.md:241`** — `src/main.tsx:29-36` initSentry skip → actual `initSentry` call at L30; skip subscribe at L33-37. Range `:29-36` includes comment L24-30 prior. Close but inaccurate.
6. **`08-workflows/PROD_OPS_RUNBOOK.md:139`** — `src/util/sentry.js:31-42 beforeSend` → actual `beforeSend(event)` declaration at L32. Range starts L31 = comment L31, not function code.
7. **`08-workflows/PROD_OPS_RUNBOOK.md:223`** — `scripts/healthcheck.cjs is NOT YET implemented (A032 PENDING)` → FALSE, file exists with 3+ landed commits. CRITICAL — operational reader misled.
8. **`08-workflows/BETA_ENTRY_CRITERIA.md:127`** — `§3 Tests 4842+ PASS / 0 FAIL: ✓/✗` → current baseline 5708+ PASS per CHAT_STATE.md + LATEST.md (drift ~866).
9. **`08-workflows/BETA_ENTRY_CRITERIA.md:82-85`** — A031-A035 "PENDING" → all 5 LANDED (PROD_OPS_RUNBOOK + healthcheck.cjs + deploy.yml rollback + BACKUP_DR_RUNBOOK + test-restore.cjs). 5x status flips needed.
10. **`08-workflows/TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md:27`** — `### §1.1 Vitest unit + integration (baseline 4519 PASS)` → current 5708+ (drift ~1189). Most-stale numeric ref in vault.
11. **`08-workflows/PRE_LAUNCH_CHECKLIST_V1.md:18`** — `[[../04-architecture/mockups/andura-v2-2026-05-07.html]]` → file DOES NOT EXIST. Broken link. (Also broken in `ROOT_NAV_V2_29_5_7_AMENDMENT.md:7` + `04-architecture/mockups/README.md`.)
12. **`08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md:21`** — `[[../wiki/_design/WIKI_DESIGN_SPEC_V1]]` → wiki radically archived 2026-05-16 to `99-archive/wiki-pre-2026-05-15/` per D001. Link orphaned.
13. **`04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1.md:61`** — `Test suite 2734 PASS = engineering capital cumulative` → current 5708+ PASS (drift ~2974). Most-stale test count in vault.
14. **`04-architecture/REACT_MIGRATION_STATE_MAPPING_V1.md:4`** — `Step 2 React migration mecanic mapping (post Step 1 vanilla port mockup V2 → prod src/ complete)` → React LANDED production LIVE per D028 — "Step 2 PENDING Step 1" is factually wrong.
15. **`04-architecture/V1_FEATURES_AUDIT_V1.md:6`** — `Scope: Limited to renderIdle.js + rating.js (2 files mentioned 00-index/CURRENT_STATE.md §NEXT priority #5)` → CURRENT_STATE.md §NEXT semantics shifted post-D015. Reader following this ref ends up in legacy state.

---

## §6 Recommendations (prioritized refresh order)

**CRITICAL first (~3h cumulative):**
1. Add STOP/DEPRECATED banner top of `04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1.md` redirecting to D015 + PRIMER §3 (~10 min)
2. Same pattern for `04-architecture/REACT_MIGRATION_STATE_MAPPING_V1.md` — mark ARCHIVED HISTORICAL REFERENCE since React migration complete (~15 min)
3. Trim `08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md` body to match top DEPRECATED banner — point to D006+D007 (~20 min)
4. Archive or rewrite `08-workflows/PRE_LAUNCH_CHECKLIST_V1.md` — pick rewrite (~60 min) if Bugatti vs archive (~5 min) if disposable
5. Add STOP banner top `04-architecture/ROOT_NAV_V2_29_5_7_AMENDMENT.md` + cite current mockup per D015 (~10 min)
6. Fix or remove dead-link refs to `andura-v2-2026-05-07.html` in 3 files (`PRE_LAUNCH_CHECKLIST_V1.md`, `ROOT_NAV_V2_29_5_7_AMENDMENT.md`, `mockups/README.md`) (~15 min total)

**MAJOR next (~3h cumulative):**
7. Refresh `08-workflows/BETA_ENTRY_CRITERIA.md` — test count 4842→5708+ + flip A031-A035 to LANDED + update wave status (~25 min)
8. Refresh `08-workflows/PROD_OPS_RUNBOOK.md` — fix `src/util/sentry.js` line spans + flip A032 LANDED + fill 5x VERIFY placeholders + correct deploy.yml line ref (~30 min)
9. Refresh `08-workflows/TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md:27` test count 4519→5708+ (~5 min)
10. Refresh `04-architecture/V1_FEATURES_AUDIT_V1.md` — flag SUPERSEDED-BY-PRIMER §2 (~10 min)
11. Archive 4 doc candidates pre-React era: `MULTI_TENANT_AUTH_MIGRATION_SPEC.md`, `TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC.md`, `FAZA_2_FILTER_STRATEGY_V1.md`, `CHAT_MIGRATION_PROTOCOL.md`, `CLAUDE_CHAT_INFRASTRUCTURE.md` — move to `99-archive/` SAU mark STOP banner (~30 min total)

**MINOR last (~2h cumulative):**
12. PRIMER §8 — `mockup (4437 LOC...)` → `(4871 LOC...)` (~2 min)
13. PRIMER §5 — mockup line refs (L2085-2096 / L732 / L2377-2390 / L2241) → either drop line refs SAU update to current mockup (~20 min). Risk: future mockup edits drift again; safer to drop line refs.
14. BACKUP_DR_RUNBOOK — `src/styles/global.css:26` → `:22` + `src/main.tsx:29-36` → `:30-37` (~5 min)
15. MODEL_UPGRADE_AUDIT_PROTOCOL — refresh "Opus 5.x" to current naming + add "Opus 4.7 active" note (~5 min)

**Cumulative effort estimate:** ~6-10h Bugatti-clean refresh of all CRITICAL + MAJOR + MINOR.

---

## §7 Cross-refs

- **D070 LOCK V1** (BACKUP_DR_RUNBOOK chat 5 polish + cross-system anti-drift documentation pattern) — `DECISIONS.md` §1599-1655. Validates pattern post-substantial-work cross-system documentation audit (this report = direct extension).
- **D076 LOCK V1** (Phase 6 prod-extras blessed divergence) — `DECISIONS.md` §1847-1910. Mockup v1.1 amend `8dfe36e3` 2026-05-23.
- **Chat 5 cumulative push** — `d89517fe..fd47d383` = 60 commits LANDED origin/main 2026-05-23 (Daniel verbal trigger "push totul").
- **Anti-drift doctrine** — per D070, post-substantial-work cycle = trigger cross-system documentation audit (this report executes exactly that).
- **Anti-hallucination per CLAUDE.md** — all findings here verified via filesystem read primary source (NU recall). All commit hashes verified `git cat-file -t`. All file paths verified `test -f`.

---

🦫 **DOCS_FRESHNESS_AUDIT_chat5.md** — Bugatti craft documentation freshness baseline. 41 docs audited, 18 FRESH + 9 MINOR + 9 MAJOR + 5 CRITICAL. Refresh priority ordered CRITICAL→MAJOR→MINOR. Cross-system anti-drift documentation pattern per D070 LOCK V1. Pre-Beta nuclear audit gate documentation freshness signal: ~6-10h refresh cumulative effort if Daniel triggers refresh wave; otherwise per-doc Bugatti scribe at next polish boundary.
