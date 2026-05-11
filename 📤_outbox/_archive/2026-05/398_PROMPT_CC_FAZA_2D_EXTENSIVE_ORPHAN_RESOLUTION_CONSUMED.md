# PROMPT CC — FAZA 2D Extensive Orphan Resolution + Markdown → Wikilink Conversion

**Model:** Opus
**Branch:** `feature/v2-vanilla-port` (verify + stay)
**Scope:** Resolve sute orphan nodes graph view Obsidian post Faza 2C (broken wikilinks fix complete dar orphan detection scope prea îngust /wiki-lint Step 4). ZERO src/ touched, vault meta-tooling pure.
**Authority:** Daniel CEO selected 2026-05-11 chat ACASĂ post Faza 2C LANDED + screenshot graph view confirmare sute orfani live.

---

## §CC.2 STARTUP MANDATORY

Layered read sequential MCP filesystem direct PRIMARY:
1. `00-index/CURRENT_STATE.md` full — §NOW post Faza 2C LANDED + §JUST_DECIDED + §NEXT
2. `00-index/INDEX_MASTER.md` FULL — current navigation hub state pentru determine ce cross-refs lipsesc
3. `CLAUDE.md` §2 `/wiki-lint` operation + §4 cross-ref protocol
4. `VAULT_RULES.md` §KARPATHY_OPERATIONS + §CC.2 + §CC.6

§CC.4 citation enforcement post-startup mandatory.

---

## PRE-FLIGHT

1. `git status` verify clean tree
2. `git branch --show-current` verify `feature/v2-vanilla-port`
3. Backup tag pre-execute push origin: `pre-faza-2d-extensive-orphan-resolution-2026-05-11`
4. **Scan orphans full vault (EXTENSIVE, NU limited 5 cum era Faza 2B):**
   - Markdown files (exclude `src/`, `tests/`, `node_modules/`, `.git/`, `dist/`, `coverage/`, `_archive/`, `.obsidian/`, `scripts/`)
   - Pentru fiecare file: count inbound `[[<filename>]]` references across vault (case-insensitive Obsidian default)
   - Plus count inbound markdown links `[text](path/to/file.md)` (also valid backlink semantics but NOT graph)
   - Output classify:
     - **PROTECTED (root SSOT):** CLAUDE.md, VAULT_RULES.md, README.md, DIFF_FLAGS.md, PROMPT_CC_HYGIENE.md (vault root infra files, expected always-orphan in graph)
     - **HUB files:** INDEX_MASTER, CURRENT_STATE, DECISION_LOG, HANDOVER_GLOBAL_*, FINDINGS_MASTER, RECENT_DECIDED_ARCHIVE — should have inbound from INDEX_MASTER + each other
     - **LEAF files vault layer:** ADRs `03-decisions/*.md`, specs `04-architecture/*.md`, vision `01-vision/*.md`, etc — should have inbound from INDEX_MASTER sub-indexes OR DECISION_LOG entries OR cross-cluster
     - **ORPHAN candidates real:** zero inbound wikilinks + zero inbound markdown links + not protected
5. Output raport pre-fix `📤_outbox/_archive/2026-05/<NN>_FAZA_2D_ORPHAN_INVENTORY_RAPORT.md` cu counts + classifications per file (~50-150 LOC)

---

## EXECUTION — 4 BATCHES

### Batch (a) — Markdown links → Wikilinks conversion in WIKI LAYER (~60 min)

Scope: wiki layer files only (NU `📤_outbox/_archive/` archive _CONSUMED + NU `📥_inbox/` raw layer).

Target patterns (Grep approach):
- `\[([^\]]+)\]\(\.\./([^)]+\.md)\)` (relative path markdown links to `.md` files within vault)
- `\[([^\]]+)\]\(([^)]+\.md)\)` (any markdown link to `.md` file)

Convert algorithm per match:
- Extract display text + relative path
- Map relative path to vault-root filename (Obsidian shortest path mode)
- Replace with `[[<filename>|<display-text>]]` form (preserve display text)
- Skip if display text identical to filename → use `[[<filename>]]` short form

**HARD EXCEPTION:** Mockup `.html` references stay as markdown links (per Faza 2C Batch (b) decision — Obsidian wikilinks don't resolve `.html`). Same for `.yml` workflow refs.

**Defensive:** Verify file exists post-conversion (no broken-by-fix). Skip conversion if target ambiguous (multiple files match shortest path) → flag for raport.

Atomic commit: `fix(vault): faza 2d batch (a) — markdown links converted to wikilinks wiki layer (<N> instances, mockup .html + workflow .yml preserved markdown)`

### Batch (b) — INDEX_MASTER cross-refs append (~30 min)

Read current INDEX_MASTER.md. Compare cu orphan candidates list (Step pre-flight scan). Pentru fiecare legitimate orphan (NOT protected, NOT archive _CONSUMED):

- Determine appropriate section in INDEX_MASTER:
  - 03-decisions ADRs → §ADRs section / §Decisions
  - 04-architecture specs → §Architecture / §Specs
  - 01-vision vision/strategy → §Vision
  - 06-sessions-log handovers → §Sessions (existing HANDOVER_GLOBAL pointer extended cu specific theme files)
  - 07-meta / 08-workflows → §Meta / §Workflows
- Append wikilink entry `[[<filename>]]` with brief 1-line description from frontmatter title or H1 heading
- Group entries within section (alphabetical OR chronological depending section convention)
- Preserve existing INDEX_MASTER structure (NU rebuild from scratch — extend additively)

Atomic commit: `fix(vault): faza 2d batch (b) — INDEX_MASTER cross-refs added <N> legitimate orphans wiki layer (post-scan extensive)`

### Batch (c) — Archive exclusion documentation (~15 min)

NU touch `.obsidian/` config (Daniel privacy + risk corrupt config — Daniel will configure manually via Obsidian Settings UI per CLAUDE.md notes).

Document in `📤_outbox/_archive/2026-05/<NN>_FAZA_2D_ARCHIVE_EXCLUSION_DOC.md`:
- Recommendation Daniel: Obsidian Settings → Files & Links → Excluded files → add `📤_outbox/_archive/**` glob pattern
- Rationale: archive _CONSUMED files are immutable historical orphans (legit) — exclude from graph for visual clarity
- Alternative: Obsidian graph filters `-path:_archive` (in-graph quick toggle without permanent exclude)
- Expected impact: ~270 archive _CONSUMED files removed from graph orphan count

Atomic commit: `docs(vault): faza 2d batch (c) — archive exclusion recommendation Daniel UI configure manual`

### Batch (d) — Truly obsolete orphan cleanup (~30 min)

Pentru orphan candidates flagged truly obsolete (post-Batch a+b residual care încă NU au inbound + NU sunt în INDEX_MASTER + NU sunt SSOT):

Options per file:
- **Rename `<file>_DEPRECATED.md`** dacă historical but reference value (preserve for git history retrievability)
- **Archive `git mv` la `📤_outbox/_archive/<YYYY-MM>/<NN>_*_CONSUMED.md`** dacă truly consumed
- **Delete** doar dacă pure junk (rare, requires content verify pre-delete — NU mass)

Output decisions per file în raport batch (d).

Atomic commit: `fix(vault): faza 2d batch (d) — truly obsolete orphan cleanup <N> files (rename DEPRECATED / archive CONSUMED / verified delete)`

---

## STEP 5 — Vault hub sync + LATEST raport (~20 min)

**`00-index/CURRENT_STATE.md`:**
- Header `Updated:` flip 2026-05-11 chat ACASĂ Faza 2D extensive orphan resolution LANDED
- §NOW thread Faza 2D LANDED narrative ~80-120 LOC (4 batches × deliverables + counts orphan before/after)
- §JUST_DECIDED NEW top entry verbatim
- §NEXT overwrite: P1 = plan anti-halucinație REMAPPED execute → P2 = BATCH 2 Antrenor port
- §ACTIVE_FLAGS: add `P1-FLAG-FAZA-2D-ORPHAN-RESOLUTION-LANDED` 🟢
- §RECENT shift older content per §CC.6

**`03-decisions/DECISION_LOG.md`:** entry top 2026-05-11 chat ACASĂ Faza 2D ~30-40 LOC

**`00-index/INDEX_MASTER.md`:** `Last updated:` flip + structural changes from Batch (b)

**`DIFF_FLAGS.md`:** entry Faza 2D RESOLVED LANDED

**`📤_outbox/LATEST.md`:** NEW raport Andura format standard (overwrite + archive precedent Faza 2C LATEST → `<NN>_FAZA_2C_WIKILINK_FIX_SWEEP_LANDED_CONSUMED.md`)

Atomic commit: `feat(vault): faza 2d step 5 — vault hub sync + LATEST raport (CURRENT_STATE + DECISION_LOG + INDEX_MASTER + DIFF_FLAGS + LATEST + precedent archived)`

---

## STEP 6 — Push origin + final verify

- Push origin all atomic commits chain (~6-7 commits total: pre-flight raport + 4 batches + Step 5 hub sync)
- Verify push via `git log origin/feature/v2-vanilla-port --oneline -10`
- Verify tests 2781 PASS preserved (doc-only ZERO src/ touched)
- Final LATEST.md raport confirming all acceptance criteria

---

## ACCEPTANCE CRITERIA

- ✅ Orphan inventory raport pre-fix LANDED archive (extensive scan, NU limited 5)
- ✅ Markdown links → wikilinks converted in wiki layer (N instances, count documented)
- ✅ INDEX_MASTER cross-refs added pentru legitimate orphans (N entries)
- ✅ Archive exclusion documentation for Daniel manual UI configure
- ✅ Truly obsolete orphan cleanup (rename DEPRECATED / archive CONSUMED / verify delete)
- ✅ ~6-7 atomic commits LANDED pushed origin `feature/v2-vanilla-port`
- ✅ Backup tag `pre-faza-2d-extensive-orphan-resolution-2026-05-11` pushed origin
- ✅ Tests 2781 PASS preserved EXACT
- ✅ §CC.6 ~200 LOC CURRENT_STATE preserved STRICT
- ✅ Cumulative ~742 LOCKED V1 PRESERVED unchanged
- ✅ Orphan graph view nodes reduction documented: pre-Faza 2D count → post-Faza 2D count

---

## HARD CONSTRAINTS (NU touch)

- 🚫 `📥_inbox/PLAN_ANTI_HALUCINATIE_VAULT.md` + `📥_inbox/PROMPT_CC_BATCH_2_ANTRENOR_PORT.md` + `📥_inbox/_karpathy_gist_reference.md` (preserved)
- 🚫 `src/` + `tests/` (zero touch)
- 🚫 `main` branch (feature/v2-vanilla-port only)
- 🚫 `.obsidian/` config (Daniel UI configure manual — privacy + risk corrupt)
- 🚫 Memory edits Claude chat + userPreferences UI + system prompt project (OUT OF SCOPE CC)
- 🚫 NU re-write entire CURRENT_STATE.md inflate — append-only §CC.6 strict
- 🚫 Mockup `.html` refs + workflow `.yml` refs preserved markdown form (per Faza 2C Batch decisions)

---

Execute fully autonomous. Report final via LATEST.md when 6-7 commits LANDED + push origin verified.

🦫 **Bugatti craft. FAZA 2D extensive orphan resolution autonomous Co-CTO scope. ZERO net additive product/architecture LOCK V1. Vault graph view post-Faza 2D → sute orfani reduced significantly (target ~80-90% reduction post Batch a+b+c+d combined).**
