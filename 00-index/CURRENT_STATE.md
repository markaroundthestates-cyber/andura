# CURRENT STATE — Andura

**Owner:** Daniel + Claude chat (live thread, append-only architecture per [[VAULT_RULES]] §CHAT_CONTINUITY_PROTOCOL §CC.6).
**Purpose:** Single SSOT chat-to-chat continuity. Chat NEW startup MANDATORY full read per §CHAT_CONTINUITY_PROTOCOL §CC.2.
**Updated:** 2026-05-10 chat ACASĂ continuation MCP filesystem — auto-watcher race P3 RESOLVED Stop hook time gate 90s anti-recurrence (4th commit chat-current `.claude/settings.json` time gate fix). Cumulative ~719 PRESERVED unchanged (vault meta-tooling fix corige existing intent NU additive).
**Last LOCKED count (product/architecture):** **~719 LOCKED V1** (chat-current = vault meta-tooling + prod bug fix corige intent existing NU additive — full cumulative narrative preserved în [[../06-sessions-log/RECENT_DECIDED_ARCHIVE]] + [[../03-decisions/DECISION_LOG]]).

> **CHAT NEW STARTUP — READ THIS ENTIRE FILE FIRST.**
> Per [[VAULT_RULES]] §CHAT_CONTINUITY_PROTOCOL §CC.2 layered read mandatory (NU shortcut):
> 1. CURRENT_STATE.md (this file) — full read
> 2. HANDOVER_GLOBAL sections referenced în `## ACTIVE_REFS` below
> 3. Top 3 ADRs în `## ACTIVE_ADRS` below
> 4. DIFF_FLAGS.md P1 active

---

## NOW — Active conversation thread

**Chat ACASĂ MCP filesystem direct paradigm 2026-05-10 — vault hygiene massive cleanup + §AR.19 NEW anti-recurrence + prod bugs fix Bug 1+Bug 2 LANDED triple atomic (3 commits chronologic chat-current pushed origin/main):**

Setup: ACASĂ Windows VS Code Desktop + PowerShell, `C:\Users\Daniel\Documents\salafull`. MCP filesystem + claude_code agent direct paradigm Daniel zero courier (per §CC.5 §AMENDMENT 2026-05-10 LOCK V1 — chat-current LIVE TEST validated end-to-end).

3 commits substantive LANDED:

**1. `cc34ca9` vault hygiene massive cleanup atomic batch** (claude_code agent autonomous): CURRENT_STATE.md 596KB / 3810 LOC → 130 LOC / 14KB §CC.6 spec compliance restored. RECENT_DECIDED_ARCHIVE.md 24 → 3671 LOC scaffold first populate (created 2026-05-07 Run 2 Task 6, body verified empty pre-cleanup). INDEX_MASTER.md header `Last updated:` trim 4+ predecessor stacked entries → 1-line single per spec. DECISION_LOG.md +36 LOC entry top descending cronologic. Backup tag `pre-vault-hygiene-massive-cleanup-2026-05-10-1724` pushed. §AR.13 PK delta +0.01% SOFT band (content migrated NU șters, intentional double safety §CC.7 Layer 5).

**2. `967460d` §AR.19 NEW anti-recurrence rule** (claude_code agent + Daniel directive *"fa cumva sa nu se mai intample"* recovery slip): VAULT_RULES.md +27 LOC §AR.19 NEW + §AR.PRE_FLIGHT_CHECKLIST_INVARIANT item 17 reference. Origin slip: claude_code agent timeout MCP response delivery NU = agent crash. Vault hygiene cleanup atomic batch was complete + pushed origin BEFORE timeout signal returned. Filesystem:get_file_info returned stale data immediately post-timeout (Windows OS metadata cache lag few seconds post-write) reinforced "no work landed" assumption falsely. Verify ordine MANDATORY: (1) `git log origin/main -5` (2) `📤_outbox/LATEST.md` raport (3) filesystem file sizes (cu cache-stale awareness re-check post-delay). Default = trust completion + verify, NU assume failure + recover. Backup tag `pre-ar19-add-2026-05-10-1748` pushed.

**3. `05ba372` prod bugs fix Bug 1 + Bug 2 LANDED** (claude_code agent autonomous, **auto-watcher captured commit msg poor `chore(auto):` instead intended Bugatti narrative — content OK, narrative loss tracked carry-forward**):
- Bug 1 fix: `src/engine/sys.js:125-127` drop pilotActive gate AUTO branch → AUTO returns TDEE×phase multiplier always (NU hardcoded `KCAL_TARGET=2000` pre-TARGET_DATE 2026-07-20). Plus `sys.js:77` getPhase pilotActive removal — phase auto-derives BF + sezon always.
- Bug 2 fix: `src/engine/sys.js:54-67` estimateTDEE Mifflin → Katch-McArdle (`bmr = 370 + 21.6 * lbm`) când `getBF()` finite. Mifflin-St Jeor fallback când BF unknown defensive. `getLBM()` finally consumed (existed since launch dar nu wired la estimateTDEE).
- Propagation: `src/pages/weight.js:78` + `src/pages/dashboard.js:193,533-534` pilotActive gating consistent (UI copy preserved, computation gates removed).
- Tests +3 NEW: T_AUTO_pre_pilot (Bug 1 regression — AUTO pre-TARGET_DATE returns TDEE×phase NOT 2000) + T_BF_edit_recalc (Bug 2 regression — BF 30%→5% same 100kg → kcal delta >300) + T8 phase auto-derive + T4 split T4a Katch / T4b Mifflin.
- 2 prod bug flags 🟢 RESOLVED: P1-FLAG-PROD-AUTO-FAZA-2026-05-10 + P1-FLAG-PROD-BF-EDIT-KCAL-2026-05-10.

Daniel autonomy lock real respected — accept silent verde 3 batches CC fără verify intermediar. Pleacă *"putin de acasa"* + directive autonomy *"nu ma deranjezi cu nimic decat daca e urgent"* + *"fa cumva sa nu se mai intample"* recovery slip — concrete actionable §AR.19 LOCK V1 codificat permanent. Caveat MCP server local Claude Desktop hung intermittent → §AR.19 mitigation trust + verify pattern documented.

🦫 **Bugatti craft. Vault hygiene + §AR.19 + prod bugs fix triple LANDED atomic chat-current MCP filesystem direct paradigm Daniel zero courier validated end-to-end. claude_code agent timeout pattern documented permanent §AR.19 anti-recurrence rule LOCK V1. Tests 2734 PASS preserved. Cumulative LOCKED V1 ~719 PRESERVED unchanged. Auto-watcher race P3 dedicated investigation carry-forward (manifest 3× today escalated). Birou setup paradigm pending mâine cu laptop. Real production bugs Daniel verbalize verified + fixed atomic single session ~3-4h Daniel-time.**

---

## JUST DECIDED

**2026-05-10 chat ACASĂ continuation MCP filesystem — auto-watcher race P3 RESOLVED Stop hook time gate 90s anti-recurrence (cumulative ~719 PRESERVED unchanged):**

Root cause identificat `.claude/settings.json` Stop hook: `git add -A` + commit `chore(auto):` + push fires la FIECARE Stop CC fără filter — capturează agresiv staged work înainte de claude_code agent să comită cu narrative Bugatti. Race window 31s observed. Manifest 4× today commits `a7e951b` + `0b1d781` + `05ba372` + `dc54c2c`.

**Fix tactical Co-CTO LANDED:** Time gate 90s prepend la Stop hook command — `AGE=$(($(date +%s) - $(git log -1 --format=%ct))) && [ "$AGE" -ge 90 ] && ...`. Dacă HEAD commit < 90s vechi → skip auto silent (`|| exit 0`). 90s = 3× safety margin peste race 31s observed. Subsequent Stops post-90s recapturează eventual work-in-progress = safety net intact pentru chestii agent NU comitează singur.

**Risk assessment:** primul Stop după CC commit narrative = skip (good). Subsequent Stops cu work-in-progress = capture eventual after 90s. Zero loss safety net. Validation = next claude_code session natural test, monitor commits.

**Cross-refs:**
- `.claude/settings.json` modified inline (NU separate ADR — config-level fix, vault meta-tooling)
- `00-index/CURRENT_STATE.md` §ACTIVE_FLAGS P1-FLAG-AUTO-WATCHER-RACE-P3-ELEVATED 🟡 → 🟢 RESOLVED PROBATION (next session validates)
- `03-decisions/DECISION_LOG.md` entry top descending cronologic 2026-05-10 chat ACASĂ continuation auto-watcher race P3 fix
- `DIFF_FLAGS.md` 5-day drift cleanup commit `0b783b4` (2 stale flags corrected + 4 new entries: prod bugs RESOLVED `05ba372` + auto-watcher RESOLVED PROBATION `8bd5dbb` + claude_code intermittent P2 monitor)
- `04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1.md` SPEC DRAFT V1 NEW (Co-CTO recommendations 5 tactical sub-decisions + 2 flagged Daniel-decide strategic, pending CEO LOCK V1)
- `04-architecture/V1_FEATURES_AUDIT_V1.md` SPEC DRAFT V1 NEW (Co-CTO per-feature recommendations 10 keep + 4 modify + 1 drop V2-deferred pe renderIdle.js 465 LOC + rating.js 150 LOC, pending CEO LOCK V1 → unblocks BATCH 2 Antrenor port implement)
- Hooks audit clean: `.husky/pre-commit` + `.github/workflows/{ci,deploy,qa-report}.yml` NO race patterns. Minor inconsistency flagged: deploy.yml + qa-report.yml folosesc `npm install` + node 20 vs ci.yml `npm ci` + node 22 — defer dedicated chat (NU blocker)

---

**2026-05-10 chat ACASĂ MCP filesystem direct paradigm — vault hygiene + §AR.19 NEW anti-recurrence + prod bugs fix Bug 1+Bug 2 LANDED triple atomic (3 commits chronologic, cumulative ~719 PRESERVED unchanged):**

3 commits LANDED chronologic chat-current pushed origin/main: `cc34ca9` vault hygiene massive cleanup (CURRENT_STATE 596KB→130LOC §CC.6 + RECENT_DECIDED_ARCHIVE first populate 3671 LOC + INDEX_MASTER header trim) + `967460d` §AR.19 NEW VAULT_RULES (claude_code agent timeout MCP delivery ≠ agent crash anti-recurrence rule + §AR.PRE_FLIGHT_CHECKLIST_INVARIANT item 17 reference) + `05ba372` prod bugs Bug 1+Bug 2 fix (sys.js drop pilotActive gate AUTO branch + Katch-McArdle BF-aware BMR cu Mifflin fallback + propagation weight.js + dashboard.js + 3 regression tests NEW T_AUTO_pre_pilot + T_BF_edit_recalc + T8/T4 split).

Tests 2731 → 2734 PASS (+3 net new regression tests, ZERO regression). Cumulative LOCKED V1 ~719 PRESERVED unchanged (vault meta-tooling + prod fix corige existing intent NU product/architecture additive).

Auto-watcher race P3 manifest 3× today commits `a7e951b` + `0b1d781` + `05ba372` (capturate înainte agent commit msg) — pre-existing flag chat unified 2026-05-08 elevated severity prin recurrence chat-current. Glob filter restrictive needed. Race window narrow 31s observed. Carry-forward DEDICATED investigation mâine.

claude_code intermittent timeout/empty responses today — §AR.19 LOCK V1 reaffirmed via 3 verify cycles successful. Pattern documented permanent.

**Cross-refs:**
- [[../06-sessions-log/RECENT_DECIDED_ARCHIVE]] — pre-cleanup §JUST_DECIDED + §NOW precedent threads + §RECENT older content verbatim (3671 LOC populate 2026-05-10)
- [[../03-decisions/DECISION_LOG]] — entry top descending cronologic 2026-05-10 chat ACASĂ vault hygiene + §AR.19 + prod bugs fix triple atomic LANDED
- [[../VAULT_RULES]] §AR.19 NEW + §AR.PRE_FLIGHT_CHECKLIST_INVARIANT item 17 + §CC.5 §AMENDMENT 2026-05-10 Direct-to-CC paradigm
- Backup tags: `pre-vault-hygiene-massive-cleanup-2026-05-10-1724` + `pre-ar19-add-2026-05-10-1748` + `pre-prod-bugs-fix-2026-05-10-1802` (rollback safety pushed origin)
- Commits 3 LANDED main: `cc34ca9` (vault hygiene) + `967460d` (§AR.19) + `05ba372` (prod bugs Bug 1+Bug 2 fix)

---

## NEXT — Priority order

1. **Daniel CEO LOCK V1 Port-First Step 1 paradigm SPEC DRAFT V1** — review `04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1.md` (Co-CTO recommendations 5 tactical + 2 flagged Daniel-decide #3 UI restructure scope + #4 Phase 3+3.5 selective port + #7 mockup post-port paradigm). ~10-15 min CEO scope. **Blocks Step 1 Port-First execution → BATCH 2 Antrenor → Phase 4 → Beta gate.**
2. **Birou setup MCP filesystem mâine cu laptop birou** (Daniel constraint: NU mai vrea Codespaces, atins limita; are Claude Desktop deja instalat birou). Steps: clone repo local laptop birou + `npm install` + config `claude_desktop_config.json` allowed paths cu local path + restart Claude Desktop + test cu chat NEW *"salut birou"*. Path consistent recomandat: `C:\Users\<userprofile>\Documents\salafull`. Memory rule update post-confirm: paradigm BIROU = Windows Claude Desktop + VS Code Desktop + PowerShell + path local (în loc Codespaces). Caveat legal IP RO scope Daniel HR Senior preserved.
3. **Daniel smoke test prod bugs fix LANDED `05ba372`** — andura.app live validate Bug 1 visual (Auto template auto-faza behavior — phase auto-detect din BF + sezon, kcal NU mai 2000 hardcoded) + Bug 2 visual (BF manual edit pe greutate constantă → kcal phase recalculate Katch-McArdle).
4. **Auto-watcher race P3 validation natural next claude_code session** — monitor commits post time gate 90s fix LANDED `.claude/settings.json` (chat-current continuation). Dacă recurrence → escalate (glob filter narrow, debounce, sau disable hook).
5. **CEO decizie V1 features audit blocking BATCH 2 Antrenor** — review `04-architecture/V1_FEATURES_AUDIT_V1.md` SPEC DRAFT V1 (Co-CTO per-feature recommendations 15 features identified pe renderIdle.js + rating.js: 10 keep verbatim + 4 modify simplified + 1 drop V2-deferred). Strategic UX = CEO scope per-feature keep/drop sign-off. ~10-15 min CEO review.
6. **BATCH 2 Antrenor port implement** post CEO decision — separate prompt CC artefact. Branch `feature/v2-vanilla-port`.
7. **Phase 4 dedicate session** post Clasic 100% smoke validation OK ~22-30h estimated combined backlog (Tasks X+Y full + T+U + carry-forward Phase 3+3.5 muscleMap + QA calibration + Cluster #4+#6).
8. **Workflow antrenament V1 LOCK** ~5 min decizie carry-forward (auto-advance pauză → next set + edit manual kg+reps post-set).
9. **Big 6 conflict resolve** ONBOARDING_SSOT_V1 vs ADR_MULTI_TENANT_AUTH §AMENDMENT 2026-05-05.7 carry-forward.

---

## ACTIVE_REFS — HANDOVER_GLOBAL sections to deep-read

- `04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1.md` §1-§9 — Validation Framework SPEC DRAFT V1 pending Daniel LOCK
- `04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1.md` — Simulator pipeline architecture SPEC DRAFT V1 pending Daniel LOCK
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §62-§73 — Batch 1-6 + Closure most recent (cumulative 306)
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56-§61 — Auth Flow §36.80 35 sub-decisions resolution
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §50 — D-cluster sub-decisions 41 net
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §41-§45 — Vault Hygiene Sprint COMPLETE + ADR 026 spec session 75 decisions
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.99-§36.107 — offline coaching tree + 7→8 prescriptive engines
- [[../06-sessions-log/RECENT_DECIDED_ARCHIVE]] — §JUST_DECIDED rolling archive >7 days (first populate 2026-05-10)
- [[PRE_LAUNCH_CHECKLIST_V1]] (08-workflows/) — pre-launch ops checklist + Run 6 Task 5 APPEND pre-Beta scope SSOT
- [[VAULT_RULES]] §AR.14 + §AR.15 + §AR.16 + §AR.17 + §AR.18 + §AR.19 — anti-recurrence rules NEW

## ACTIVE_ADRS — Top 3 to deep-read

- [[../03-decisions/030-adapter-design-pattern]] — D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1 (Hexagonal foundation Faza 3 STRANGLER 7/8 LANDED)
- [[../03-decisions/026-offline-coaching-decision-tree-exhaustive]] — Compile FULL V1 129 decisions (8 prescriptive engines pipeline §42.10 8/8 LANDED)
- [[../03-decisions/005-vanilla-js-no-framework]] — §AMENDMENT 2026-05-10 vanilla JS preserved active stack pre-React (Port-First-Then-React paradigm LOCK V1 2026-05-10)
- [[../03-decisions/ADR_MULTI_TENANT_AUTH_v1]] — §AMENDMENT 2026-05-04 evening BATCH 1-6 + §AMENDMENT 2026-05-05.7 Big 6 hard T0

**Total ADRs active vault:** 33 numbered (001-021 + 022-032 + 033) + 9 named = 42 ADR files total + DECISION_LOG.

## ACTIVE_FLAGS — DIFF_FLAGS.md P1 status

- 🟢 **P1-FLAG-PROD-AUTO-FAZA-2026-05-10** RESOLVED `05ba372` (drop pilotActive gate AUTO branch sys.js:125-127 + sys.js:77 getPhase pilotActive removal + propagation weight.js + dashboard.js)
- 🟢 **P1-FLAG-PROD-BF-EDIT-KCAL-2026-05-10** RESOLVED `05ba372` (Katch-McArdle BF-aware sys.js:54-67 când getBF() finite, Mifflin fallback defensive — Bug 2 layer A atomic; layer B energy-balance-path BF-awareness deferred dedicated session)
- 🟢 **P1-FLAG-AUTO-WATCHER-RACE-P3-ELEVATED** RESOLVED PROBATION 2026-05-10 chat-current — Stop hook time gate 90s prepend `.claude/settings.json` (3× safety margin peste race 31s observed). Validation = next claude_code session natural monitor.
- 🟡 **NEW P2-FLAG-CLAUDE-CODE-INTERMITTENT-2026-05-10** — claude_code agent timeout/empty intermittent observed today. §AR.19 LOCK V1 mitigation in place. Continue monitor.
- 🔴 **P1-FLAG-NEW** Codespace `npm install` drift (3 test FILE imports broken: fake-indexeddb + dexie) — OPEN (CI/dev-env only, production unaffected; dedicated chat post Auth Flow)
- 🔴 **P1-FLAG-SCENARIOS-COVERAGE** — Gap ~990-1490 scenarios decisions remaining post-pipeline V1 closure (preserved unchanged, separate axis from V1 implement). Validation Framework LOCKED V1 + simulator skeleton LANDED. Pre-Beta gate criteria LOCKED V1: Gate 1 ≥95% MATCH on 500-query corpus + Gate 2 DROPPED + Gate 3 selective Daniel review.
- 🟢 **P1-FLAG-IOS-PERMANENT** — iOS REJECTED LOCKED PERMANENT (rule lock).
- 🟢 **P1-FLAG-AUTH-DANIEL-PREP** — RESOLVED 2026-05-04 night.
- 🟢 **P1-FLAG-AUTH-PHASE2** — RESOLVED 2026-05-06 morning (SMTP Magic Link COMPLETE end-to-end).
- 🟢 **P1-FLAG-HANDOVER-SPLIT** — RESOLVED 2026-05-05 overnight (split atomic LANDED 7 theme files).

---

## RECENT — Older context preserved (truncate >50 LOC per §CC.6)

- 2026-05-10 chat ACASĂ MCP filesystem vault hygiene massive cleanup execution (precedent §NOW thread) — CURRENT_STATE.md split 596KB→~200LOC §CC.6 compliance + INDEX_MASTER header trim + RECENT_DECIDED_ARCHIVE first populate (cumulative ~719 PRESERVED, vault meta-tooling). Daniel approved Phase 0-9 atomic batch execution claude_code agent. 2 prod bugs flagged for follow-up (consumed chat-current via `05ba372` LANDED).
- 2026-05-10 chat ACASĂ §CC.5 fast handover ingest Direct-to-CC paradigm + §CC.2.1 MCP filesystem PRIMARY LOCK V1 reaffirmation secondary handover consume LANDED (cumulative ~719 PRESERVED, vault meta-tooling)
- 2026-05-10 chat ACASĂ post §CC.5 fast handover ingest MCP filesystem paradigm shift + ADR 005 §AMENDMENT REVERT SUPERSEDE Port-First-Then-React paradigm LOCK V1 LANDED 3 vault meta-tooling commits (`e54c250` §CC.2.1 MCP filesystem PRIMARY + `0c052cf` §CC.5 §AMENDMENT 2026-05-10 inline Direct-to-CC + `a6e2a0e` ADR 005 §AMENDMENT inline REVERT SUPERSEDE)
- 2026-05-10 chat ACASĂ post Phase 3.6 attempt + mockup vs prod distincție + PORT-FIRST-THEN-REACT pivot LOCK V1 LANDED — Phase 3.6 cluster #1 attempt CC autonomous HALT per spec §0; mockup vs prod distincție revealed via Daniel screenshot andura.app prod live = layout VECHI complet diferit de mockup V2; ~70% Phase 1+2+3+3.5 work degeaba pentru prod app live; ~30% util permanent (LOCKED V1 spec valid + mockup design refined ghid React port)
- 2026-05-10 chat ACASĂ orchestrator Phase 1+2 EXECUTION COMPLETE 38/38 ✅ (Tasks 01-38 atomic + 1 mini orchestrator FINAL coordonator)
- 2026-05-10 chat ACASĂ post-noapte continuation §CC.5 fast handover ingest "vault hygiene closure post-§CC.5 ingest pendings + Bugatti reset definition critical + `/compact` insertion strategy + orchestrator clusters bulk delegate strategy"
- 2026-05-10 chat ACASĂ noapte — Path A hotfix + Tasks 3+4+5 WCAG orchestrator LANDED 7/7 + Actions cost optimization 5 fixes + smoke test 4 themes feedback 9 clusters mid-flight + Theme Parity Invariant LOCK V1 + Glossary jargon LOCK V1
- 2026-05-09 chat ACASĂ — themes Batch 2b SCOPE COMPLETE 8/8 LANDED + Batch 1 AUDIT + Batch 2a mecanic LANDED (mockup polish, cumulative ~707-709 PRESERVED + 1 Beta scope V1 LOCK "Cum se face")
- 2026-05-08 chat unified — Faza 3 STRANGLER batches 4-7 LANDED + 4 themes V2 SSOT compliance LANDED chat-current paralel (~10-12 LOCKED V1 cumulative ~697 → ~707-709)
- 2026-05-08 chat NEW acasă — Batch 1 Vite+React 19 Scaffold LANDED + REACT_MIGRATION_STATE_MAPPING_V1 doc canonical SSOT + ADR 005 §AMENDMENT React Migration LOCK V1 (3 LOCKED V1 LANDED) — SUPERSEDED 2026-05-10 by REVERT amendment Port-First-Then-React paradigm
- Older content (2026-05-04 to 2026-05-08 detailed entries + Precedent NOW threads stacked + §JUST_DECIDED both blocks pre-cleanup) moved verbatim to [[../06-sessions-log/RECENT_DECIDED_ARCHIVE]] (3671 LOC first populate 2026-05-10)

---

## POINTERS — Deep history drill-down

- [[../03-decisions/DECISION_LOG]] — full chronologic master log (all LOCKED V1 entries permanent)
- [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] — INDEX post-thematic-split deep archive (7 theme files)
- [[../06-sessions-log/RECENT_DECIDED_ARCHIVE]] — §JUST_DECIDED rolling archive >7 days (rolling migration pattern §CC.6 truncate, first populate 2026-05-10)
- [[../00-index/INDEX_MASTER]] — vault navigation hub
- [[../DIFF_FLAGS]] — outstanding issues P1/P2
- [[../VAULT_RULES]] §CC.6 — append-only architecture spec canonical
- [[../VAULT_RULES]] §AR.13 — PK Growth Control (≤10% soft / ≥20% hard escalate)
- [[../VAULT_RULES]] §AR.19 — claude_code agent timeout MCP delivery ≠ agent crash anti-recurrence rule (NEW 2026-05-10)

---

🦫 **Andura — chat-to-chat seamless. Zero data loss. Bugatti continuity. Quality > Speed default.** ✊
