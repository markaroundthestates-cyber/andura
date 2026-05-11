---
title: CLAUDE.md — Andura Vault Schema (Karpathy LLM Wiki Pattern Adapted)
type: schema
status: locked-v1
locked_date: 2026-05-11
authority: Karpathy LLM Wiki pattern gist `karpathy/442a6bf555914893e9891c11519de94f` (apr 2026, 5000+ stars) adapted Andura vault context — co-evolved with VAULT_RULES.md existing protocols
cross_refs:
  - "[[VAULT_RULES#KARPATHY_OPERATIONS]] §LOCK V1 2026-05-11 (bidirectional cross-ref schema pointer)"
  - "[[VAULT_RULES#CHAT_CONTINUITY_PROTOCOL]] §CC.2 + §CC.4 + §CC.5 + §CC.6 (integration §5)"
  - "[[VAULT_RULES#ANTI_RECURRENCE_RULES]] §AR.1 + §AR.19 (anti-recurrence preserved)"
  - "[[📥_inbox/_karpathy_gist_reference]] (immutable raw-layer source preserved)"
  - "[[00-index/CURRENT_STATE]] §NOW (live SSOT navigation hub)"
  - "[[00-index/INDEX_MASTER]] (wiki master index Karpathy equivalent)"
amendments:
  - date: 2026-05-11
    note: Initial LOCK V1 schema generation FAZA 2B — 3-layer mapping + 3 operations + frontmatter + cross-refs + integration + Bugatti craft
---

# CLAUDE.md — Andura Vault Schema

**Owner:** Daniel (CEO + Product) + Claude (Co-CTO autonomous chat strategic + claude_code agent via MCP filesystem direct).
**Purpose:** Schema operating rules vault Andura — Karpathy LLM Wiki pattern adapted Andura context, co-evolved cu `VAULT_RULES.md` existing protocols.
**Authority:** Karpathy gist `karpathy/442a6bf555914893e9891c11519de94f` (3 apr 2026, 5000+ stars în zile, 16M+ views X post) + Andura accumulated vault conventions 2026-04-30 → 2026-05-11.

---

## §0 — OUTPUT STYLE (existing preserved)

**Authority:** Daniel preference + VAULT_RULES.md §10.8 raport schema canonical (pre-Karpathy, preserved as-is).

- Post-task CC terminal output: **max 2 linii**: `Task complete. Report: 📤_outbox/LATEST.md`
- ZERO duplicate raport în terminal stdout — `📤_outbox/LATEST.md` e SSOT canonical (Task + Model + Status + Branch + Date + Pre-flight + Modificări + Build+Tests + Commits + Pushed + Issues + Next action)
- NU "Summary:" walk-through în terminal. NU enumerate fișiere modificate. NU recap commit hash. Toate în LATEST.md.
- Mid-task tool calls + reasoning + thinking blocks = OK normal (visibility execution). Restricție DOAR final post task complete.
- Exception: dacă Status=Failed → terminal output OK extended cu ce a eșuat (debug aid imediat fără open LATEST.md).

---

## §1 — Andura Vault 3-Layer Mapping (Karpathy adapted)

Karpathy's 3-layer architecture (`raw/` + `wiki/` + `CLAUDE.md` schema) mapped onto Andura existing folder structure. NU mass migration — existing folders devin "wiki layer" LLM-maintained:

### Layer 1 — Raw sources (immutable inputs)

**Andura mapping:** `📥_inbox/` existing (Daniel inputs + handover narratives + Karpathy gist reference + future Web Clipper articles).

- Files: `HANDOVER_*.md` (Daniel scribe narratives end-of-chat), `PROMPT_CC_*.md` (Daniel input prompts for autonomous CC execution), `PLAN_*.md` (strategic plans Daniel-curated), `_karpathy_gist_reference.md` (immutable Karpathy source preserved), future `📥_inbox/_raw/` subfolder for Web Clipper external articles.
- Convention: NEVER edit body of raw files post-landing — they're immutable. NEVER delete pre-archive — instead move to `📤_outbox/_archive/<YYYY-MM>/<NN>_<TASK>_CONSUMED.md` post `/wiki-ingest` processing.
- Dropzone protocol existing: VAULT_RULES.md §3.5 preserved unchanged (curated input layer, NU CC autonomous random write).

### Layer 2 — Wiki (LLM-generated pages cu cross-refs)

**Andura mapping:** ALL existing 00-08 numbered folders + VAULT_RULES.md + DIFF_FLAGS.md + README.md.

| Andura folder | Wiki role |
|---------------|-----------|
| `00-index/` | INDEX_MASTER = wiki master index Karpathy equivalent + CURRENT_STATE.md = live SSOT navigation hub (§NOW + §JUST_DECIDED + §NEXT + §ACTIVE_REFS + §ACTIVE_ADRS + §ACTIVE_FLAGS + §RECENT + §POINTERS) |
| `01-vision/` | Product vision wiki pages (Daniel's verbatim quotes, strategic LOCK V1 decisions, brand soul, Beta scope) |
| `02-audit/` | Audit raport wiki pages (vault hygiene audits, Run 2/3 codification, drift detection) |
| `03-decisions/` | DECISION_LOG.md = chronological descending append-only (Karpathy `log.md` equivalent) + 42 ADR files numbered (001-033) + named (ADR_MULTI_TENANT_AUTH_v1 etc) = entity/concept pages Karpathy equivalent |
| `04-architecture/` | Architecture spec wiki pages (mockups + SPEC DRAFTs + LOCK V1 paradigms: PORT_FIRST_STEP_1, V1_FEATURES_AUDIT, REACT_MIGRATION_STATE_MAPPING, ANDURA_VALIDATION_FRAMEWORK) |
| `05-findings-tracker/` | Findings + bugs tracker pages |
| `06-sessions-log/` | HANDOVER_GLOBAL deep archive + RECENT_DECIDED_ARCHIVE rolling >7 days (§CC.6 truncate target) |
| `07-meta/` | Meta wiki pages (process docs, retrospectives, slip patterns analysis) |
| `08-workflows/` | Workflow spec pages (PRE_LAUNCH_CHECKLIST_V1 etc) |

### Layer 3 — Schema (operating rules co-evolved)

**Andura mapping:** `CLAUDE.md` (this file, vault root, NEW Faza 2B 2026-05-11) + `VAULT_RULES.md` (existing pre-Karpathy, ~1078 LOC, deep protocols §HANDOVER_PROTOCOL + §CHAT_CONTINUITY_PROTOCOL §CC.* + §ANTI_RECURRENCE_RULES §AR.* + §VAULT_HYGIENE_PASS + §KARPATHY_OPERATIONS NEW Step 3).

**Bidirectional cross-ref:**
- `CLAUDE.md` (this file) §5 Integration points back to VAULT_RULES.md §CC.2 + §CC.4 + §CC.5 + §CC.6 + §AR.19 protocols
- `VAULT_RULES.md` §KARPATHY_OPERATIONS NEW points to CLAUDE.md §1-§6 schema authority

**Co-evolution principle:** Schema evolves cu Andura domain maturity. NU rigid frozen. Daniel + Claude (chat + claude_code) update together when patterns emerge. Slip patterns codify în VAULT_RULES.md §AR.* anti-recurrence rules.

---

## §2 — 3 Operations Slash Commands Andura-Specific

### `/wiki-ingest <source-path>` — Process raw input → distribute wiki layer

**Trigger:** Daniel adds new file la `📥_inbox/` + signals process (or autonomous CC detects post-handover scribe ingest per §CC.5).

**Workflow:**
1. **Read raw source** via MCP filesystem direct (`📥_inbox/<file>.md` typically).
2. **Classify content** — branch logic:
   - **Handover narrative** (scribe end-of-chat aggregate) → §CC.5 fast handover ingest path canonical: CURRENT_STATE §NOW replace (move precedent → §RECENT) + §JUST_DECIDED top entry append + DECISION_LOG entry top descending cronologic + INDEX_MASTER `Last updated:` flip + §ACTIVE_REFS sync + LATEST.md raport + archive consumed
   - **ADR draft** (architectural decision proposal) → place `03-decisions/<NNN-name>.md` cu YAML frontmatter (status=draft initially, locked-v1 post Daniel review) + update INDEX_MASTER entry + DECISION_LOG cross-ref entry
   - **SPEC DRAFT** (architecture spec proposal) → place `04-architecture/<name>.md` cu YAML frontmatter + update INDEX_MASTER + cross-refs bidirectional
   - **Prompt CC** (Daniel input for autonomous CC execution) → preserve `📥_inbox/` pending CC execute (NU archive yet) + Daniel signals when consumed
   - **Plan** (strategic plan) → preserve `📥_inbox/` pending execute + cross-ref în CURRENT_STATE §NEXT priority order
   - **Raport CC** (CC autonomous execution raport) → place `📤_outbox/_archive/<YYYY-MM>/<NN>_*_CONSUMED.md` (post LATEST.md cycle) + cross-ref în relevant DECISION_LOG entry
3. **Update INDEX_MASTER** `Last updated:` field flip (per §CC.9.3 mandatory)
4. **Pre-flight grep wikilinks orphane** mandatory pre-commit (per §CC.9.5)
5. **Backup tag pre-execute:** `pre-handover-<YYYY-MM-DD-HHMM>` pushed origin (§CC.5 / §CC.7 Layer 5 safety net)
6. **Atomic commit single-concern** Bugatti craft + push origin (NU bulk multi-purpose)
7. **Signal Daniel post-ingest:** "e timpul pt noul chat" per §CC.5 §AMENDMENT 2026-05-10 Direct-to-CC paradigm

**Cross-ref:** §CC.5 fast handover ingest existing canonical (`/wiki-ingest` is super-set including non-handover classifiers).

### `/wiki-query <question>` — Answer questions citing wiki

**Trigger:** Daniel asks question în chat OR Claude needs to verify claim pre-action.

**Workflow:**
1. **Search INDEX_MASTER first** for topic anchor (Karpathy native: index-driven navigation, NU embedding RAG).
2. **Drill DECISION_LOG + ADR-uri active** for LOCKED V1 entries cronologic descending (most recent precedence on conflict).
3. **Scan wiki sub-indexes:**
   - `CURRENT_STATE.md` §NOW (active conversation thread)
   - `CURRENT_STATE.md` §JUST_DECIDED (last 24-72h LOCKED entries)
   - `CURRENT_STATE.md` §RECENT (last 3-7 days)
   - `06-sessions-log/RECENT_DECIDED_ARCHIVE.md` (older >7 days rolling)
   - `DIFF_FLAGS.md` active P1/P2 flags
4. **Synthesize answer cu citations `path:§` mandatory** per §CC.4 citation enforcement. Format: `Per CURRENT_STATE §NOW: ...` sau `Per HANDOVER_GLOBAL §X: ...` sau `Per ADR-<NNN> §Y: ...`.
5. **Flag explicit if no wiki answer found** — NU invent. Options:
   - "verific cu MCP filesystem direct read" (acasă PRIMARY per §CC.2.1)
   - "verific cu KB search" (fallback environments)
   - "necesită Daniel decizie reală (NU vault answer)" — escalate Daniel scope
   - "invoke web search separat la Daniel cerere" (external knowledge needed)
6. **File answers back as wiki pages când valoros** (Karpathy native insight): comparison tables + analysis + connections discovered ≠ disappear into chat history. Place în relevant `04-architecture/` sau `07-meta/` cu YAML frontmatter + cross-refs.

**Cross-ref:** §CC.4 citation enforcement canonical (`/wiki-query` is structured invocation of §CC.4 principles).

### `/wiki-lint` — Health check vault

**Trigger:** Periodic Daniel-invoked OR autonomous CC schedule (e.g. post major LOCK V1 batch, post handover, monthly maintenance).

**Workflow (4 scan types):**
1. **Broken wikilinks scan:** Grep all `[[...]]` references across vault markdown files (exclude `node_modules/`, `src/`, `tests/`, `.git/`, `dist/`, `coverage/`, `📤_outbox/_archive/`, `.obsidian/`). For each, verify target file exists (case-insensitive match Obsidian default). Flag missing targets.
2. **Orphan pages scan:** For each markdown file în wiki layer, check:
   - No inbound `[[file]]` references from other vault files AND
   - No INDEX_MASTER entry pointing la file AND
   - Not protected (CLAUDE.md / VAULT_RULES.md / README.md / DIFF_FLAGS.md root + numbered ADR files + LICENSE)
   - = ORPHAN candidate (NOT necessarily wrong — Daniel decides if intentionally standalone or missing cross-refs to add)
3. **Stale claims scan:** Check files with `Updated: YYYY-MM-DD` headers > 60 days old vs current chat-current state. Flag candidates (Daniel decides if substantively stale or merely calendar-old — many ADR-uri permanently LOCKED V1 fără need refresh).
4. **Contradictions scan:** Cross-check dated entries across wiki layer for conflict. Examples Andura-relevant:
   - ADR <X> §AMENDMENT date Y vs CURRENT_STATE §NOW date Z claiming opposite
   - DECISION_LOG entry verbatim vs Daniel quote în 01-vision contradicting
   - DIFF_FLAGS active P1 status vs CURRENT_STATE §ACTIVE_FLAGS mirror drift

**Output raport:** `📤_outbox/_archive/<YYYY-MM>/<NN>_WIKI_LINT_RAPORT_<date>.md` cu sections §1 Broken wikilinks (count + list path:§) + §2 Orphan pages (count + list path) + §3 Stale candidates (count + list path:Updated_field) + §4 Contradiction candidates (count + cross-file pair) + §5 Summary + recommendations Daniel review.

**Fix policy:** NU fix automat în `/wiki-lint` pass — Daniel review prima. Each finding decided per case (some orphans intentional, some stale claims permanent LOCK V1, some contradictions historical record valuable).

**P1 escalation:** If finding critical (broken wikilink la SSOT files: INDEX_MASTER / CURRENT_STATE / DECISION_LOG / VAULT_RULES) → add DIFF_FLAGS entry `P1-FLAG-WIKI-LINT-<finding>` 🟡 P1 pending Daniel review.

---

## §3 — Frontmatter Template Minimal

**Adoption policy:** Apply progressive new files NEW post-Faza 2B. NU mass migration existing files (~250+ markdown files vault, mass edit risk > value, churn deferred to future bulk pass dacă Daniel decides).

**Template canonical:**
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

**Field semantics:**
- `title` — human-readable file name (NOT necessarily matching filesystem path basename)
- `type` — Karpathy 3-layer position: `wiki` (LLM-maintained), `raw` (immutable source), `schema` (operating rules)
- `status` — lifecycle: `draft` (pre-LOCK V1, evolving), `locked-v1` (LOCK V1 stable, NU edit body fără §AMENDMENT), `superseded` (replaced by newer ADR/SPEC, preserved historical reference), `amended` (LOCK V1 cu §AMENDMENT date post-LOCK adjustments)
- `locked_date` — first LOCK V1 date if applicable (NU update post-amendments, separate `amendments` field)
- `cross_refs` — bidirectional cross-refs `[[wikilinks]]` Obsidian-style (drill-down navigation)
- `amendments` — append-only list dates + brief notes for post-LOCK V1 §AMENDMENT entries (preserves history)

**Dataview integration future:** Obsidian Dataview plugin can query YAML frontmatter pentru dynamic tables (e.g. all `status=locked-v1` ADRs sorted by `locked_date` descending). NEW Andura adoption post-Faza 2B optional enhancement.

---

## §4 — Cross-Ref Protocol Andura

### Wikilinks `[[...]]` Obsidian-style mandatory for inter-file references

**Format:**
- Same-folder: `[[FileName]]` (e.g. `[[DECISION_LOG]]` din 03-decisions context)
- Cross-folder: `[[path/to/file]]` (e.g. `[[../03-decisions/030-adapter-design-pattern]]`)
- Anchor drill-down: `[[file#section-anchor]]` (e.g. `[[CURRENT_STATE#NOW]]`, `[[ADR_005#AMENDMENT_2026-05-10]]`)

**Resolution:** Obsidian "Shortest path" mode enabled (settings) → wikilinks resolve to nearest match by filename, supports renaming without breaking refs.

### `path:§` citation format mandatory în chat answers (per §CC.4)

**Format:** `path/to/file:§SECTION_NAME` (e.g. `00-index/CURRENT_STATE.md:§NOW`, `VAULT_RULES.md:§CC.2`, `📥_inbox/PROMPT_CC_FAZA_2B_KARPATHY_CLAUDE_MD.md:§Step 2`).

**Use:** Citation în chat strategic responses + commit messages + raport LATEST.md + claude_code agent prompts.

### Bidirectional cross-link both sides când nontrivial

**Examples:**
- ADR 005 §AMENDMENT 2026-05-10 ↔ DECISION_LOG entry 2026-05-10 chat ACASĂ Port-First-Then-React ↔ CURRENT_STATE §NOW Faza 2B strategic context
- ADR_MULTI_TENANT_AUTH §AMENDMENT 2026-05-04 ↔ HANDOVER_GLOBAL §56.13.1 auto-retry 3x ↔ Auth Phase 2 RESOLVED P1 flag

**Anti-pattern:** unidirectional refs orphan source (target NU knows about reference) → graph view shows disconnected components → discovery friction.

---

## §5 — Integration cu Protocols Existing

### §CC.2 layered read EXTENDED (Karpathy-aware)

Pre-existing §CC.2 mandatory layered read chat NEW startup:
1. `00-index/CURRENT_STATE.md` (full ~200 LOC live SSOT)
2. HANDOVER_GLOBAL sections referenced în §ACTIVE_REFS
3. Top 3 ADRs în §ACTIVE_ADRS
4. `DIFF_FLAGS.md` P1 active

**Karpathy extension (post-Faza 2B):** Pre §CC.2 step 1 (CURRENT_STATE read), check if `/wiki-query` slash command applies — Karpathy pattern primary anti-halucinație mechanism. If user question maps la wiki topic → `/wiki-query` first (INDEX_MASTER → DECISION_LOG → ADR drill) before layered read.

### §CC.4 citation enforcement REAFFIRMED

Every factual claim post-startup = citation `path:§` obligatoriu. Memory recall fără citation verifiabilă = re-verify cu MCP filesystem direct read (PRIMARY) sau project_knowledge_search (FALLBACK) per §CC.2.1. Karpathy `/wiki-query` operation is structured invocation of §CC.4 principles — formalize existing.

### §CC.5 fast handover ingest = special case `/wiki-ingest`

§CC.5 fast handover ingest existing canonical mecanic (CURRENT_STATE move-then-replace + DECISION_LOG entry append + archive consumed + backup tag + commit + push) is special case `/wiki-ingest` operation cu handover-narrative classifier branch. Karpathy generalizes la multi-classifier (handover + ADR draft + SPEC DRAFT + prompt CC + plan + raport CC). §CC.5 mecanic preserved exact — Karpathy adaugă classification taxonomy.

### §CC.6 ~200 LOC append-only architecture PRESERVED STRICT

CURRENT_STATE.md ~200 LOC append-only architecture LOCKED V1 2026-05-10 NU inflate. Karpathy schema operations adăugare NU inflate CURRENT_STATE — toate §1-§6 here în CLAUDE.md vault root (separate file, separate ~200 LOC budget). Anti-recurrence rule: 596KB CURRENT_STATE inflate pre-2026-05-10 hygiene cleanup NEVER recurrence.

### §AR.19 + alte AR-uri preserved

Anti-recurrence rules §AR.1-§AR.19 LOCKED V1 preserved unchanged:
- §AR.1 pre-flight grep filesystem ÎNAINTE reference paths (memory rule `feedback_grep_before_prompt_cc.md`)
- §AR.3 ground truth git verify ÎNAINTE acuzare CC hallucination
- §AR.4 anti-distructive recommendation default
- §AR.19 claude_code agent timeout MCP delivery ≠ agent crash (CC autonomous workflow safety)
- ... (toate §AR.* preserved în VAULT_RULES.md unchanged)

Karpathy schema NU supersede AR-uri — Karpathy adaugă vault-level structure, AR-uri rămân claude_code agent execution discipline.

---

## §6 — Bugatti Craft Principle (Andura-specific, NU Karpathy native)

**Authority:** Daniel preference accumulated 2026-04-30 → 2026-05-11 + commits cu "🦫 Bugatti craft" trailer + raport LATEST.md format standard.

**Principle:** Quality > Speed default. Iterare cheap, regression OUT. Single-concern atomic commits. NU bulk multi-purpose.

**Tactical rules:**
- **Pre-flight checklist mandatory** (grep verbatim + strategy LOCK V1 filter + memory check + verify remote state) — §AR.1 + §AR.3 + §AR.4 + §AR.18 pre-action vault search invariant
- **Atomic commits single-concern** (NU bulk multi-purpose) — each commit one fix, one feature, one doc update; revertable safely
- **Tests baseline preserved EXACT** — vitest 2781 PASS baseline 2026-05-11 (zero regression default; new feature commits add tests, NU subtract)
- **Backup tag pre-execute MANDATORY** — `pre-<task-name>-<YYYY-MM-DD>` pushed origin before any modification batch (rollback safety net)
- **Citation `path:§` mandatory** — §CC.4 anti-hallucination discipline
- **Slip recurrence track în VAULT_RULES §AR.*** — anti-recurrence codified after pattern observed 2× (NU 1×)
- **Memory updates Claude side post-major paradigm shifts** — out of CC autonomous scope (Daniel/Claude chat side ritual post-handover ingest)

**Strategic rules:**
- **Strategy LOCK V1 filter pre-decision** — acoperiș-pereți avoidance: NU plan acoperiș înainte de pereți. Port-First-Then-React (ADR 005 §AMENDMENT 2026-05-10) LOCKED V1 ordering: Step 1 vanilla port → Step 2 React migration mecanic.
- **Co-CTO autonomy LOCKED V1 PERMANENT 2026-05-11** — Daniel zero touch pre-Beta a-z review. CC autonomous decides tactical + strategic + UX + vault + memory în Co-CTO scope. NU artefacte CC manual paste — invoc claude_code direct via MCP filesystem. §CC.2 layered read STRICT 5/5 NEVER lazy 4/5 3/5. Cumulative ~742 LOCKED V1 cum bază.
- **Bugatti SoT clean port single** — mockup-first paradigm: clean state mockup întâi (PORT_FIRST_STEP_1 §LOCK V1 sub-decision #1), port-once Daniel-only env, structural rewrite acceptable pre-Beta (post-Beta react migration).

**Cross-refs:** [[VAULT_RULES#ANTI_RECURRENCE_RULES]] §AR.1-§AR.19 + [[03-decisions/005-vanilla-js-no-framework#AMENDMENT_2026-05-10]] + [[04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1]] + [[04-architecture/V1_FEATURES_AUDIT_V1]] + Daniel autonomy lock EXTINS verbatim *"CEO nu are nici un review de facut. Esti CTO figure it out fara sa ma deranjezi. Run autonomous. O sa fac review inainte de launch beta a-z."* (chat-current 2 2026-05-10).

---

🦫 **Bugatti craft. CLAUDE.md schema Karpathy LLM Wiki pattern adapted Andura vault LOCK V1 2026-05-11 Faza 2B Co-CTO autonomous. Cumulative ~742 PRESERVED unchanged (vault meta-tooling NU additive product/architecture). Co-evolved cu VAULT_RULES.md §KARPATHY_OPERATIONS bidirectional.**
