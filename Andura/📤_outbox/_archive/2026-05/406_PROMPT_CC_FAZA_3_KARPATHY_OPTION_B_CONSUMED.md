# PROMPT CC — FAZA 3 Karpathy Option B Real Implementation (vault → raw layer + wiki LLM-generated pure)

**Model:** Opus (hardcoded — Sonnet retired permanent).
**Branch:** `feature/v2-vanilla-port` (verify + stay).
**Authority:** Daniel CEO selected Option B 2026-05-11 chat ACASĂ post Karpathy gist re-read + scope realignment screenshot graph view orphans.
**Effort:** ~12-15h CC autonomous overnight multiple sessions + Daniel review iterative fidelity voice.

---

## §0 SCOPE — Option B Karpathy real, NU polish superficial

**Vault existing (TOT ce e azi):** freeze → **raw layer immutable historical**. LLM citește, NU mai modifică.
- Inclusiv: CURRENT_STATE + DECISION_LOG + HANDOVER_GLOBAL + INDEX_MASTER + ADRs + specs + 01-vision + 05-findings + 07-meta + 08-workflows + 📥_inbox + 📤_outbox/_archive.

**NEW `wiki/` folder vault root:** pure LLM-generated Karpathy pattern.
- Entity pages per concept (1 page per ADR concept / engine / feature / decision cluster)
- Summary pages per topic synthesis (auth flow, coach engines, V1 features, autonomy paradigm, etc)
- `wiki/index.md` Karpathy catalog format + `wiki/log.md` chronological signature `## [YYYY-MM-DD] <type> | Title`
- Cross-refs natural built în Wikilinks pure

**Schema:** `CLAUDE.md` vault root rewrite Karpathy real schema + Andura voice preservation policy. `VAULT_RULES.md` §CC.* protocols **redesign complet** — Karpathy flow NU are layered read chat-to-chat (LLM citește wiki natural per query/ingest).

---

## §1 VOICE PRESERVATION POLICY — MANDATORY per wiki page

Risc principal Option B = identity loss Andura prin LLM summary impersonal. Mitigation policy mandatory:

**Per wiki page structure obligatorie:**
- `## Synthesis` (LLM-written summary concept)
- `## Verbatim quotes Daniel` (push-backs key + mea culpa moments + daniel-isms preserved EXACT — "tataie/halucinezi/stai/ia bate-te/se bate sonnet/ups am dat" cu context original)
- `## Bugatti framing notes` (Gigel test rationale dacă aplicabil + Quality > Speed + Anti-RE + Anti-paternalism + voice tone notes)
- `## Cross-refs raw layer` (citation source ADR/HANDOVER/DECISION_LOG specific path:§)

**Hard rule:** NU rezuma push-backs Daniel impersonal "user pushed back" → preserve verbatim "Daniel verbatim: *'...'*". NU lobotomy daniel-isms care formează identity Andura.

---

## §2 RESEARCH SOURCES MANDATORY pre-implementation

1. **Karpathy LLM Wiki pattern gist:** `https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f` (deja salvat `📥_inbox/_karpathy_gist_reference.md` raw layer immutable)
2. **Ar9av/obsidian-wiki framework:** `https://github.com/Ar9av/obsidian-wiki` — implementation reference Obsidian. WebFetch + clone OR study structure pentru patterns concrete (folder structure, frontmatter conventions, slash commands setup, Obsidian-specific tooling).

Parse ambele + extract:
- Folder structure conventions
- Frontmatter template per page type (entity / concept / summary / index / log)
- Slash commands implementation (/wiki-ingest + /wiki-query + /wiki-lint)
- Cross-ref signature conventions
- index.md catalog structure
- log.md chronological signature

---

## §3 PHASES (multi-session CC autonomous)

### Phase 1 — Research + design (~1.5h)
- Read Karpathy gist + Ar9av repo + parse patterns
- Design `wiki/` folder structure adapted Andura (entities/concepts/summaries/sources/index.md/log.md)
- Design schema CLAUDE.md adapted Andura cu voice preservation policy §1
- Output: `wiki/_design/WIKI_DESIGN_SPEC_V1.md` (preserve LOCK design pre-generate)

### Phase 2 — Schema CLAUDE.md rewrite + VAULT_RULES §CC.* protocols redesign (~2h)
- `CLAUDE.md` vault root rewrite Karpathy real schema (NU adaptare superficială ca Faza 2B)
- `VAULT_RULES.md` §CC.2 + §CC.3 + §CC.4 + §CC.5 + §CC.6 redesign — Karpathy flow:
  - NO chat-to-chat layered read mandatory
  - LLM citește wiki natural per query/ingest
  - §AR.* anti-recurrence rules preserved (still relevant)
  - §HANDOVER_PROTOCOL deprecat (replaced de `/wiki-ingest` operation)
- Atomic commit Phase 2

### Phase 3 — Generate wiki/ folder pure LLM (~6-8h, biggest chunk)
- Sweep raw layer existing (ADRs + specs + DECISION_LOG entries cumulative ~742 LOCKED V1 + HANDOVER theme files + CURRENT_STATE precedent threads stacked)
- Generate per concept/decision/feature 1 wiki entity page cu voice preservation policy §1 structure
- Generate summary pages cross-topic (auth flow, coach engines, V1 features, autonomy paradigm, Bugatti craft, Gigel test, etc)
- Generate `wiki/index.md` Karpathy catalog format
- Generate `wiki/log.md` chronological signature `## [YYYY-MM-DD] ingest|query|lint | Title`
- Cross-refs natural built în Wikilinks pure
- Atomic commits per cluster (e.g. ADR-cluster + engine-cluster + decision-cluster + handover-narrative-cluster + meta-cluster)

### Phase 4 — Initial /wiki-lint pass + Daniel review checkpoint (~1h)
- Run /wiki-lint pe nou-generated wiki/
- Health check: contradictions cross-pages + stale claims + orphan pages + missing concepts + voice fidelity scan (verbatim quotes Daniel preserved?)
- Output raport `📤_outbox/_archive/2026-05/<NN>_FAZA_3_WIKI_LINT_INITIAL_RAPORT.md`
- **STOP for Daniel review** before Phase 5 — voice fidelity validation prima

### Phase 5 — Workflow transition + cleanup (~1.5h)
- §CC.5 fast handover ingest = special-case `/wiki-ingest` codified
- Daily flow: Daniel raw input → /wiki-ingest autonomous → wiki updated + log appended → /wiki-query future chats read wiki natural NU CURRENT_STATE 91KB narrative
- `📤_outbox/LATEST.md` raport Faza 3 LANDED full
- Update vault hub: CURRENT_STATE §NOW thread Faza 3 LANDED + §NEXT clear post-Karpathy
- Atomic commit Phase 5 + push origin

---

## §4 ACCEPTANCE CRITERIA

- ✅ `wiki/` folder LANDED vault root cu entities + concepts + summaries + index.md + log.md pure LLM-generated
- ✅ Schema CLAUDE.md rewrite Karpathy real cu voice preservation policy §1 mandatory
- ✅ §CC.* protocols redesign — Karpathy flow no-layered-read
- ✅ Voice fidelity validated post-Phase 4 Daniel review (verbatim quotes + daniel-isms + Bugatti framing preserved per wiki page structure)
- ✅ /wiki-lint pass clean post-Phase 4
- ✅ Tests 2781 PASS preserved EXACT all commits (doc-only ZERO src/ touched)
- ✅ Cumulative ~742 LOCKED V1 PRESERVED unchanged in raw layer (vault existing immutable)
- ✅ Backup tag per Phase pushed origin (rollback safety)
- ✅ Atomic commits per Phase + push origin chain end-of-each-phase

---

## §5 HARD CONSTRAINTS (NU touch)

- 🚫 Vault existing wiki layer = FREEZE raw layer immutable. NU mai modify CURRENT_STATE / DECISION_LOG / HANDOVER / ADRs / specs etc. Even append-only DEPRECATED.
- 🚫 `📥_inbox/PLAN_ANTI_HALUCINATIE_VAULT.md` + `📥_inbox/PROMPT_CC_BATCH_2_ANTRENOR_PORT.md` + `📥_inbox/_karpathy_gist_reference.md` (P2+P3+raw layer preserved)
- 🚫 `src/` + `tests/` (zero touch)
- 🚫 `main` branch (feature/v2-vanilla-port only)
- 🚫 `.obsidian/` config (Daniel UI configure manual)
- 🚫 Memory edits Claude chat + userPreferences UI + system prompt project (OUT OF SCOPE CC, Daniel post-LANDED)

---

## §6 EFFORT + EXECUTION MODEL

**Total estimate:** ~12-15h CC autonomous + ~3-5h Daniel review iterative.

**Execution model:** Multi-session overnight. Phase 1+2 first session (~3.5h). Phase 3 split în 2-3 sessions overnight (CC autonomous batch ADR-cluster → engine-cluster → decision-cluster → handover-narrative → meta-cluster, atomic commits per cluster, push origin chain). Phase 4 STOP Daniel review checkpoint mandatory. Phase 5 post-Daniel-validation only.

**Daniel zero curier paradigm:** invoc claude_code direct via MCP between sessions. ZERO artefacte paste-able Daniel manual drag.

**§AR.19 mitigation:** MCP timeout 4 min delivery ≠ subprocess CLI crash. Filesystem evidence per Phase commits = LANDED verify.

---

## §7 STARTUP MANDATORY (Phase 1 start)

§CC.2 layered read sequential MCP filesystem direct PRIMARY:
1. `00-index/CURRENT_STATE.md` full — §NOW post Faza 2B+2C+2D LANDED
2. `📥_inbox/_karpathy_gist_reference.md` raw layer Karpathy spec
3. `CLAUDE.md` current schema (Faza 2B output) — rewrite full în Phase 2
4. `VAULT_RULES.md` §CC.* + §AR.* — redesign §CC.* în Phase 2
5. `📤_outbox/_archive/2026-05/389_WIKI_LINT_RAPORT_INITIAL_2026-05-11.md` + `393_FAZA_2D_ORPHAN_INVENTORY_RAPORT.md` (lessons learned scan extensive)

§CC.4 citation enforcement post-startup mandatory pe raw layer references.

---

Execute fully autonomous per phases sequential. Phase 4 = HARD STOP Daniel review checkpoint. Report each phase final via LATEST.md updates.

🦫 **Bugatti craft. Karpathy Option B real implementation cu voice preservation policy MANDATORY. Vault existing → raw layer immutable. NEW wiki/ LLM-generated pure. Anti-halucinație max + autonomy MCP compatible. Andura identity preserved prin §1 policy.**
