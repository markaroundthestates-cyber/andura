# PROMPT CC — FAZA 2B Karpathy CLAUDE.md Schema Adapted Andura Vault

**Model:** Opus (hardcoded — Sonnet retired permanent)
**Branch:** `feature/v2-vanilla-port` (current working branch — vault doc-side commits land here)
**Owner:** Daniel (CEO + Product). Claude Co-CTO autonomous via MCP filesystem direct.
**Date trigger:** 2026-05-11 chat ACASĂ §NEXT P1 ABSOLUTE per `00-index/CURRENT_STATE.md §NOW` + §NEXT priority 1.
**Scope:** Vault meta-tooling pure — ZERO net additive product/architecture LOCK V1. Cumulative ~742 PRESERVED unchanged.

---

## §CC.2 STARTUP MANDATORY (NU shortcut)

Sequential layered read PRIMARY via MCP filesystem direct (Daniel ACASĂ Windows VS Code + PowerShell mediu CC autonomous):
1. **`00-index/CURRENT_STATE.md`** FULL READ — §NOW + §JUST_DECIDED top entry + §NEXT priority order + §ACTIVE_REFS + §ACTIVE_ADRS + §ACTIVE_FLAGS
2. **HANDOVER sections referenced în §ACTIVE_REFS** — drill targeted (NU integral handover)
3. **Top 3 ADRs §ACTIVE_ADRS** — 030 + 026 + 005 (Port-First-Then-React §AMENDMENT 2026-05-10) + ADR_MULTI_TENANT_AUTH_v1
4. **`DIFF_FLAGS.md` P1 ACTIVE_FLAGS** — context curent flags
5. **`VAULT_RULES.md`** §CC.2 + §CC.4 + §CC.5 + §CC.6 + §AR.19 + §HANDOVER_PROTOCOL — protocols deja active înainte de a adăuga §KARPATHY_OPERATIONS

Output §CC.3 format: `Aligned X/Y verified. Last LOCKED [path:§]. Mid-flight. Next P1. Drift.`

**§CC.4 citation enforcement post-startup:** every claim = `path:§` obligatoriu. ZERO memory recall fără citation = VIOLATION. Vault SSOT primat când conflict cu memorie internă.

---

## PRE-FLIGHT

1. `git status` verify clean tree (acceptable: untracked = inbox files current chat-input)
2. `git branch --show-current` verify `feature/v2-vanilla-port` (or document divergence + stay on current)
3. Backup tag pre-execute push origin: `pre-faza-2b-karpathy-schema-2026-05-11` (timestamp suffix ok)
4. Archive precedent `📤_outbox/LATEST.md` → `📤_outbox/_archive/2026-05/<next-NN>_FAZA_2A_KARPATHY_PIVOT_CONSUMED.md` (NN = current max + 1 chronological continuous)
5. Verify Karpathy gist URL accessible: `https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f`

---

## EXECUTION — 5 STEPS atomic commits

### Step 1 — Download + parse Karpathy gist (~30 min)

- WebFetch `https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f` (gist apr 2026, 5000+ stars)
- Parse + extract verbatim:
  - **3-layer architecture**: raw/ (immutable sources) + wiki/ (LLM-generated pages) + CLAUDE.md (schema operating rules)
  - **3 operations**: `/wiki-ingest` (process raw sources → wiki) + `/wiki-query` (answer questions citing wiki) + `/wiki-lint` (health check broken links + orphans + contradictions)
  - **Frontmatter pattern** + cross-refs convention + per-operation pseudocode/protocol
- Save raw reference to `📥_inbox/_karpathy_gist_reference.md` (preserved as raw-layer immutable input, NU deleted post-Faza 2B — serves /wiki-ingest future reruns)
- Atomic commit: `chore(vault): faza 2b step 1 — Karpathy gist downloaded + parsed reference saved`

### Step 2 — Generate `CLAUDE.md` adapted Andura (~30 min)

Create new `CLAUDE.md` at vault root (overwrite existing if any) with sections:

**§1 — Andura Vault 3-layer mapping (Karpathy adapted):**
- **raw layer** = `📥_inbox/` (Daniel inputs + handover-uri future + `_karpathy_gist_reference.md` immutable) + optional `📥_inbox/_raw/` future Web Clipper articles
- **wiki layer** = `00-index/` (INDEX_MASTER = wiki master index Karpathy equivalent) + `01-vision/` + `02-audit/` + `03-decisions/` (DECISION_LOG + ADRs) + `04-architecture/` + `05-findings-tracker/` + `06-sessions-log/` + `07-meta/` + `08-workflows/` — ALL existing folders devin "wiki layer" LLM-generated cross-refs structured
- **schema layer** = `CLAUDE.md` (this file) + `VAULT_RULES.md` (merge bidirectional — VAULT_RULES preserves protocols §CC.* + §AR.* + §HANDOVER_*; CLAUDE.md adds §KARPATHY_OPERATIONS pointing back)

**§2 — 3 Operations slash commands Andura-specific:**

**`/wiki-ingest <source-path>`** — process raw input → distribute wiki layer:
1. Read raw source (`📥_inbox/<file>.md` typically)
2. Classify content: handover narrative / ADR draft / SPEC DRAFT / prompt CC / plan / raport CC
3. For handover narrative: §CC.5 fast ingest path (CURRENT_STATE §NOW replace + §JUST_DECIDED top entry append + DECISION_LOG entry top cronologic + LATEST.md raport + archive consumed)
4. For ADR draft: place `03-decisions/<NNN-name>.md` + update INDEX_MASTER + DECISION_LOG cross-ref
5. For SPEC DRAFT: place `04-architecture/<name>.md` + update INDEX_MASTER + cross-refs
6. Update INDEX_MASTER `Last updated:` field flip
7. Archive raw source `📤_outbox/_archive/<YYYY-MM>/<NN>_*_CONSUMED.md` (chronological continuous NN)
8. Atomic commit + push origin

**`/wiki-query <question>`** — answer questions citing wiki:
1. Search INDEX_MASTER first for topic anchor
2. Drill DECISION_LOG + ADR-uri active for LOCKED V1 entries
3. Scan wiki sub-indexes (CURRENT_STATE §NOW + §JUST_DECIDED + §RECENT + RECENT_DECIDED_ARCHIVE older)
4. Synthesize answer with citations `path:§` mandatory
5. Flag explicit if no wiki answer found (NU invent — invoke web search separat la Daniel cerere)

**`/wiki-lint`** — health check vault:
1. Scan broken wikilinks (`[[...]]` references pointing nowhere)
2. Scan orphan pages (files no inbound wikilinks AND no INDEX_MASTER entry)
3. Scan stale claims (dated entries > 30 days fără §AMENDMENT update when context evolved)
4. Scan contradictions across wiki layer (cross-file conflict detection — e.g. ADR says X, DECISION_LOG says Y)
5. Output raport `📤_outbox/_archive/<YYYY-MM>/<NN>_WIKI_LINT_RAPORT_<date>.md` (NU fix yet — Daniel review pre-fix actions)
6. Flag P1 critical findings to DIFF_FLAGS as `P1-FLAG-WIKI-LINT-*`

**§3 — Frontmatter template minimal (apply progressive new files, NU mass migration existing):**
```yaml
---
title: <File Name>
type: <wiki|raw|schema>
status: <draft|locked-v1|superseded|amended>
locked_date: <YYYY-MM-DD>
cross_refs:
  - "[[path/to/file]]"
  - "[[other/file]]"
amendments:
  - date: <YYYY-MM-DD>
    note: <brief>
---
```

**§4 — Cross-ref protocol Andura:**
- Wikilinks `[[file]]` or `[[path/file]]` mandatory pentru inter-file references
- §-anchors mandatory pentru section drill-down: `[[CURRENT_STATE#NOW]]`, `[[ADR_005#AMENDMENT_2026-05-10]]`
- `path:§` citation format mandatory în chat answers (per §CC.4)
- Bidirectional refs cross-link both sides când nontrivial (e.g. ADR 005 ↔ DECISION_LOG entry ↔ CURRENT_STATE §NOW)

**§5 — Integration cu protocols existing:**
- §CC.2 layered read EXTENDED: pre §CC.2 step 1 (CURRENT_STATE read), check if `/wiki-query` slash command applies — Karpathy pattern primary anti-halucinație mechanism
- §CC.4 citation enforcement reaffirmed — every claim `path:§` obligatoriu
- §CC.5 fast handover ingest = special case `/wiki-ingest` operation (handover narrative classifier path)
- §CC.6 ~200 LOC append-only architecture PRESERVED STRICT — CLAUDE.md schema NU inflate CURRENT_STATE
- §AR.19 + alte AR-uri preserved (claude_code agent timeout MCP delivery ≠ agent crash etc)

**§6 — Bugatti craft principle (NU Karpathy native but Andura-specific):**
- Quality > Speed default. Iterare cheap, regression OUT.
- Pre-flight checklist mandatory (grep verbatim + strategy LOCK V1 filter)
- Atomic commits single-concern (NU bulk multi-purpose)
- Anti-recurrence rules track in VAULT_RULES §AR.*

Atomic commit: `feat(vault): faza 2b step 2 — CLAUDE.md Karpathy schema adapted Andura vault root`

### Step 3 — Update `VAULT_RULES.md` §KARPATHY_OPERATIONS section (~30 min)

Append new section to VAULT_RULES.md (post §AR.19, pre §HANDOVER_PROTOCOL or wherever fits structurally):

```markdown
---

## §KARPATHY_OPERATIONS — LLM Wiki Pattern (LOCK V1 2026-05-11)

**Authority:** Karpathy LLM Wiki pattern gist `karpathy/442a6bf555914893e9891c11519de94f` (apr 2026, 5000+ stars). Adapted Andura vault per `CLAUDE.md` schema vault root.

**Primary anti-halucinație mechanism:** LLM-maintained wiki structurat (NU re-derive knowledge each chat) + 3 operations codified + 3-layer architecture (raw + wiki + schema).

**Operations canonical:**
- `/wiki-ingest <source>` — process raw input → wiki layer + archive consumed (canonical: §CC.5 fast handover ingest este special-case)
- `/wiki-query <question>` — answer cu citations `path:§` mandatory (canonical: §CC.4 citation enforcement)
- `/wiki-lint` — health check broken links + orphans + stale + contradictions (NU fix, raport Daniel review)

**Schema reference:** [[CLAUDE]] vault root.

**Cross-refs:** [[CLAUDE]] §1-§6 + [[VAULT_RULES]] §CC.2 + §CC.4 + §CC.5 + §CC.6 + §AR.19.

---
```

Atomic commit: `feat(vault): faza 2b step 3 — VAULT_RULES §KARPATHY_OPERATIONS section LOCK V1 pointing CLAUDE.md schema`

### Step 4 — Initial `/wiki-lint` pass raport (~60 min)

Execute initial /wiki-lint pass on entire vault Andura:

1. **Broken wikilinks scan:** grep all `[[...]]` references. For each, verify target exists (case-insensitive match Obsidian default). Flag missing targets.
2. **Orphan pages scan:** For each markdown file in vault (excluding `node_modules`, `src/`, `tests/`, `scripts/`, `.git/`, `.obsidian/`, `dist/`, `coverage/`, `📤_outbox/_archive/`), check:
   - No inbound `[[file]]` references AND
   - No INDEX_MASTER entry AND
   - Not protected (CLAUDE.md / VAULT_RULES.md / README.md / DIFF_FLAGS.md root)
   - = ORPHAN candidate
3. **Stale claims scan (limited scope V1):** Check files with `Updated: YYYY-MM-DD` headers > 60 days old vs current chat-current state. Flag candidates (Daniel decides if substantively stale or merely calendar-old).
4. **Contradictions scan (limited scope V1, focus high-value):** Cross-check ADR 005 vanilla JS §AMENDMENT vs CURRENT_STATE §NOW Port-First-Then-React. Cross-check ADR_MULTI_TENANT_AUTH §AMENDMENT 2026-05-04 vs current auth state. Output any divergence detected as candidate flag.
5. **Output raport file:** `📤_outbox/_archive/2026-05/<NN>_WIKI_LINT_RAPORT_INITIAL_2026-05-11.md` cu sections:
   - §1 Broken wikilinks (count + list path:§)
   - §2 Orphan pages (count + list path)
   - §3 Stale candidates (count + list path:Updated_field)
   - §4 Contradiction candidates (count + cross-file pair)
   - §5 Summary + recommendations Daniel review (NU fix yet — Daniel decides per finding)

6. **DIFF_FLAGS update:** If P1 critical findings detected (e.g. broken wikilink la SSOT files like INDEX_MASTER or CURRENT_STATE), add entry `P1-FLAG-WIKI-LINT-INITIAL-<finding>` with severity 🟡 P1 pending Daniel review.

Atomic commit: `feat(vault): faza 2b step 4 — initial /wiki-lint pass raport vault Andura (Daniel review pre-fix)`

### Step 5 — CURRENT_STATE.md §NOW + §JUST_DECIDED update + LATEST.md + DECISION_LOG + cross-refs (~30 min)

Update vault hub files post FAZA 2B LANDED:

**`00-index/CURRENT_STATE.md`:**
- Header `Updated:` field flip 2026-05-11 chat ACASĂ Co-CTO autonomous FAZA 2B Karpathy CLAUDE.md schema LANDED
- `§NOW` replaced cu thread Karpathy schema LANDED narrative ~80-120 LOC (NU inflate §CC.6 ~200 LOC limit)
- `§JUST_DECIDED` NEW top entry verbatim narrativ ~80-120 LOC (5 steps execution log + acceptance criteria met + /wiki-lint raport summary + cross-refs commits)
- `§NEXT` overwrite priority: P1 = `/wiki-lint` raport review Daniel + fix actions per finding (if any P1 critical) → P2 = plan anti-halucinație REMAPPED execute (~6-8h CC autonomous, scope LANDED `📥_inbox/PLAN_ANTI_HALUCINATIE_VAULT.md` reorganizat în Karpathy pattern) → P3 = BATCH 2 Antrenor port `📥_inbox/PROMPT_CC_BATCH_2_ANTRENOR_PORT.md` post P1+P2 LANDED
- `§ACTIVE_FLAGS` update — add P1-FLAG-WIKI-LINT-* entries if any P1 critical detected Step 4
- `§RECENT` shift older content per §CC.6 truncate >50 LOC migrate la RECENT_DECIDED_ARCHIVE

**`03-decisions/DECISION_LOG.md`:**
- Entry top descending cronologic 2026-05-11 chat ACASĂ Co-CTO autonomous FAZA 2B Karpathy CLAUDE.md schema LANDED
- Verbatim narrativ ~30-50 LOC: 5 steps execution log + commits chain + acceptance criteria

**`00-index/INDEX_MASTER.md`:**
- `Last updated:` field flip 2026-05-11
- Add entry pointer `[[CLAUDE]]` vault root schema NEW LOCK V1

**`📤_outbox/LATEST.md`:**
- Overwrite with new raport format standard (preserve Andura §CC.5 conventions):
  - Header: Task + Model + Status + Branch + Date
  - Pre-flight checklist verified
  - Modificări table (5 steps × deliverables)
  - Build + Tests verify (`npm run build` green + `npm test` 2781 PASS preserved EXACT — Faza 2B doc-only ZERO src/ touched)
  - Commits chain 5 atomic + cross-refs
  - Pushed origin verification
  - Issues encountered + resolution
  - Next action P1 (Daniel /wiki-lint raport review)

**Archive moves:**
- Previous `📤_outbox/LATEST.md` already archived Step pre-flight as `<NN>_FAZA_2A_KARPATHY_PIVOT_CONSUMED.md`
- New `📤_outbox/LATEST.md` is THIS Faza 2B raport (next cycle archives this as `<NN+1>_FAZA_2B_KARPATHY_SCHEMA_CONSUMED.md`)

Atomic commit: `feat(vault): faza 2b step 5 — CURRENT_STATE + DECISION_LOG + INDEX_MASTER + LATEST raport + cross-refs sync`

Final push origin all 5 commits chain.

---

## ACCEPTANCE CRITERIA

- ✅ `CLAUDE.md` LANDED vault root (~150-250 LOC) cu §1-§6 covering 3-layer mapping + 3 operations + frontmatter + cross-refs + integration + Bugatti craft
- ✅ `VAULT_RULES.md` §KARPATHY_OPERATIONS section LANDED pointing CLAUDE.md schema bidirectional
- ✅ `📥_inbox/_karpathy_gist_reference.md` saved as immutable raw-layer reference (NU deleted)
- ✅ `📤_outbox/_archive/2026-05/<NN>_WIKI_LINT_RAPORT_INITIAL_2026-05-11.md` LANDED cu §1-§5 sections (NU fix actions taken yet)
- ✅ CURRENT_STATE.md §NOW + §JUST_DECIDED + §NEXT + §ACTIVE_FLAGS + §RECENT updated atomic
- ✅ DECISION_LOG entry top + INDEX_MASTER `Last updated:` flip + LATEST.md NEW raport
- ✅ 5 atomic commits chain pushed origin `feature/v2-vanilla-port`
- ✅ Backup tag `pre-faza-2b-karpathy-schema-2026-05-11` pushed origin pre-execute
- ✅ Tests baseline 2781 PASS preserved EXACT (Faza 2B doc-only ZERO src/ touched)
- ✅ Build vite green (Faza 2B doc-only verify trivial green)
- ✅ §CC.6 ~200 LOC append-only architecture PRESERVED STRICT (CURRENT_STATE NU inflate)
- ✅ Cumulative ~742 LOCKED V1 PRESERVED unchanged (vault meta-tooling NU additive product/architecture)

---

## HARD CONSTRAINTS (NU touch)

- 🚫 `📥_inbox/PLAN_ANTI_HALUCINATIE_VAULT.md` (P2 preserved for next chat execute post-Faza 2B)
- 🚫 `📥_inbox/PROMPT_CC_BATCH_2_ANTRENOR_PORT.md` (P3 preserved post-P1+P2 LANDED)
- 🚫 `src/` (zero src code touched — Faza 2B doc-only)
- 🚫 `tests/` (zero test code touched — verify run preserved)
- 🚫 `main` branch (work on `feature/v2-vanilla-port` only per Port-First-Then-React §AMENDMENT 2026-05-10 ADR 005)
- 🚫 Memory edits Claude chat side + userPreferences UI Daniel + system prompt project UI Daniel (OUT OF SCOPE CC — Daniel/Claude chat side post-Faza 2B LANDED)

---

## OUTPUT EXPECTED §CC.3 FORMAT POST-EXECUTE

Final raport `📤_outbox/LATEST.md` cu format Andura standard:

```
**Task:** FAZA 2B Karpathy CLAUDE.md schema adapted Andura vault — 5 steps execute autonomous overnight.
**Model:** Opus
**Status:** ✅ Complete
**Branch:** feature/v2-vanilla-port
**Date:** 2026-05-11 chat ACASĂ Co-CTO autonomous Faza 2B Karpathy LANDED.

## Pre-flight: [checklist verified]
## Modificări: [5 steps × deliverables table]
## Build + Tests: vite green + 2781 PASS preserved EXACT
## Commits: [5 atomic chain hashes + cross-refs]
## Pushed origin: ✅
## Issues: [none or resolution]
## Next action P1: Daniel /wiki-lint raport review + decide fix actions per P1 critical finding (if any)
```

---

🦫 **Bugatti craft. FAZA 2B Karpathy CLAUDE.md schema vault meta-tooling LANDED autonomous Co-CTO scope. ZERO net additive product/architecture LOCK V1. Cumulative ~742 PRESERVED unchanged. Path către Beta: P2 plan anti-halucinație REMAPPED ~6-8h → P3 BATCH 2 Antrenor port.**
