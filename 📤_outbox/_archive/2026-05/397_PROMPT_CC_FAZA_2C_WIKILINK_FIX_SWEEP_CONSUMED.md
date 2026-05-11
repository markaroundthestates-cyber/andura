# PROMPT CC — FAZA 2C Wikilink Fix Sweep (a+b+c+d+e ALL)

**Model:** Opus
**Branch:** `feature/v2-vanilla-port` (verify + stay)
**Scope:** Wikilink fix sweep complet per `📤_outbox/_archive/2026-05/389_WIKI_LINT_RAPORT_INITIAL_2026-05-11.md` §1.2 categorizare — 64 real broken wikilinks + 5 orphan candidates. ZERO src/ touched, vault meta-tooling pure.
**Authority:** Daniel CEO selected ALL (a+b+c+d+e) batch 2026-05-11 chat ACASĂ post Faza 2B LANDED.

---

## §CC.2 STARTUP MANDATORY

Layered read sequential MCP filesystem direct PRIMARY:
1. `00-index/CURRENT_STATE.md` full — §NOW post Faza 2B LANDED + §JUST_DECIDED + §NEXT priority Faza 2C
2. `📤_outbox/_archive/2026-05/389_WIKI_LINT_RAPORT_INITIAL_2026-05-11.md` FULL READ — source of truth pentru toate mapping (broken wikilinks + orphan candidates + stale + contradictions)
3. `CLAUDE.md` vault root §2 `/wiki-lint` operation reference
4. `VAULT_RULES.md` §KARPATHY_OPERATIONS + §CC.2 + §CC.4 + §CC.6 + §AR.19

§CC.4 citation enforcement post-startup mandatory — every claim path:§.

---

## PRE-FLIGHT

1. `git status` verify clean tree (acceptable: untracked junk Obsidian + this prompt)
2. `git branch --show-current` verify `feature/v2-vanilla-port`
3. Backup tag pre-execute push origin: `pre-faza-2c-wikilink-fix-sweep-2026-05-11` (timestamp suffix ok)
4. Read raport 389 FULL — extract verbatim mapping tables §1.2 cu (source file:line + broken ref + actual file)
5. Verify file existence for all "actual file" targets via filesystem before applying replacements (defensive: ensure NU broken-by-fix)

---

## EXECUTION — 5 ATOMIC BATCHES

### Batch (a) — ADR naming refactor 14 instances (~10 min)

Source raport 389 §1.2 P2 "Old ADR naming" table. Per instance:
- Read source file (DECISION_LOG.md / RECENT_DECIDED_ARCHIVE.md / REACT_MIGRATION_STATE_MAPPING_V1.md / 026-offline-coaching-decision-tree-exhaustive.md / 030-adapter-design-pattern.md / CLAUDE.md)
- Find line N broken ref
- Replace cu canonical `[[<NNN>-<full-slug>]]` form (e.g. `[[ADR_023]]` → `[[023-llm-intent-interpretation]]`)
- Preserve display text dacă există (e.g. `[[012-tier-decay|ADR 012]]` → `[[012-tier-decay-on-inactivity|ADR 012]]`)
- Section anchors preserved unchanged (e.g. `[[ADR_005#AMENDMENT_2026-05-10]]` → `[[005-vanilla-js-no-framework#AMENDMENT 2026-05-10]]` — note: Obsidian section anchors use space not underscore canonical, verify CLAUDE.md L189 reference)

Atomic commit: `fix(vault): faza 2c batch (a) — ADR naming refactor 14 instances cross-refs canonical slugs (broken wikilinks raport 389 §1.2 P2)`

### Batch (b) — Mockup .html refs convert 44 instances (~15 min)

Source raport 389 §1.2 P2 "Mockup .html file refs". Files: `DECISION_LOG.md` + `RECENT_DECIDED_ARCHIVE.md`.

Per instance:
- Find `[[mockups/andura-<theme>]]` wikilink form (themes: clasic / luxury / living-body / brain-coach)
- Replace cu standard markdown link: `[mockups/andura-<theme>.html](../04-architecture/mockups/andura-<theme>.html)` (relative path from `03-decisions/` and `06-sessions-log/` is `../04-architecture/mockups/`)
- Preserve display context dacă include theme name post-pipe (rare — verify)

Atomic commit: `fix(vault): faza 2c batch (b) — mockup .html refs convert 44 instances DECISION_LOG + RECENT_DECIDED_ARCHIVE wikilinks → relative markdown links (raport 389 §1.2 P2)`

### Batch (c) — Workflow .yml refs convert 4 instances (~5 min)

Source raport 389 §1.2 P2 "GitHub workflow .yml refs". Files: `DECISION_LOG.md:L1068` + `RECENT_DECIDED_ARCHIVE.md:L661`.

Per instance:
- Find `[[../.github/workflows/<name>]]` wikilink (names: ci / deploy / qa-report)
- Replace cu markdown link: `[<name> workflow](../.github/workflows/<name>.yml)` (relative path from `03-decisions/` is `../.github/workflows/`; from `06-sessions-log/` is same `../.github/workflows/`)

Atomic commit: `fix(vault): faza 2c batch (c) — workflow .yml refs convert 4 instances wikilinks → relative markdown links (raport 389 §1.2 P2)`

### Batch (d) — Stale handover refs investigate + fix 2 instances (~10 min)

Source raport 389 §1.2 P2 "Stale handover refs":
- `03-decisions/DECISION_LOG.md:L2511` — `[[../06-sessions-log/HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05]]` (handover split plan LANDED 2026-05-05 overnight, file probably archived `_CONSUMED`)
- `VAULT_RULES.md:L828` — `[[HANDOVER_VAULT_HYGIENE_2026-04-30_evening]]` (historical handover, possibly merged în HANDOVER_GLOBAL split atomic)

Per instance:
1. Verify if file exists at original path: `06-sessions-log/HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05.md` + check filesystem
2. If exists: NOT stale — leave as-is or document in raport
3. If NOT exists: search `📤_outbox/_archive/2026-05/` for `*HANDOVER_GLOBAL_SPLIT_PLAN*_CONSUMED.md` (archive 221 candidate per archive listing) → update ref to archived consumed path
4. If completely obsolete (no archive trace): remove ref + add inline note `<!-- ref removed 2026-05-11: file historical, no replacement -->`

Same logic VAULT_RULES.md L828.

Atomic commit: `fix(vault): faza 2c batch (d) — stale handover refs 2 instances investigated + fixed (raport 389 §1.2 P2)`

### Batch (e) — Orphan candidates review + cleanup 5 instances (~15 min)

Source raport 389 §3 orphan pages (5 candidates). Per file:

**(e.1) `2026-05-11.md` vault root** — likely Obsidian daily-note junk created accidentally. Verify content:
- If empty / trivial (just date heading no content) → DELETE + add `.gitignore` rule `^[0-9]{4}-[0-9]{2}-[0-9]{2}\.md$` at root level pentru future daily-notes Obsidian protect
- If has content → preserve + add inline cross-ref în INDEX_MASTER `## Misc` section pointing it

**(e.2) `Untitled.md` vault root** — Obsidian Cmd+N accidental scratch file. Verify content same logic:
- If empty / trivial → DELETE + add `.gitignore` rule `^Untitled.*\.md$` + `^Untitled.*\.canvas$` pentru protect future accidents
- If has content → rename to descriptive name + place în appropriate folder + cross-ref

**(e.3-e.5) 3 archive/cross-ref candidates** — per raport listing review:
- Examine each for legitimate orphan vs missing cross-ref
- Add cross-ref în INDEX_MASTER `## POINTERS` section sau appropriate sub-index dacă legitimately referenced content
- If truly obsolete: rename `*_DEPRECATED.md` per `_archive/` convention OR move to archive

Output details în Step 5 LATEST raport sub-section "Batch (e) decisions per file".

Atomic commit: `fix(vault): faza 2c batch (e) — orphan candidates 5 instances reviewed + cleanup (delete junk roots + .gitignore protect future + cross-ref legitimate orphans, raport 389 §3)`

---

## STEP 6 — Vault hub sync + LATEST raport (~15 min)

**`00-index/CURRENT_STATE.md`:**
- Header `Updated:` flip 2026-05-11 chat ACASĂ Faza 2C wikilink fix sweep LANDED
- §NOW thread Faza 2C LANDED narrative ~60-100 LOC (5 batches × deliverables + before/after counts broken wikilinks)
- §JUST_DECIDED NEW top entry verbatim ~60-100 LOC
- §NEXT overwrite: P1 = plan anti-halucinație REMAPPED execute (per existing `📥_inbox/PLAN_ANTI_HALUCINATIE_VAULT.md` reorganizat Karpathy pattern) → P2 = BATCH 2 Antrenor port
- §ACTIVE_FLAGS: flip `P1-FLAG-WIKI-LINT-INITIAL-64-BROKEN` 🟡 PENDING_DANIEL_REVIEW → 🟢 RESOLVED LANDED 2026-05-11 Faza 2C
- §RECENT shift older content per §CC.6 truncate

**`03-decisions/DECISION_LOG.md`:**
- Entry top descending cronologic 2026-05-11 chat ACASĂ Co-CTO autonomous Faza 2C ~30-40 LOC

**`00-index/INDEX_MASTER.md`:**
- `Last updated:` flip 2026-05-11

**`DIFF_FLAGS.md`:**
- Flip P1-FLAG-WIKI-LINT-INITIAL-64-BROKEN entry status RESOLVED LANDED 2026-05-11 cu count before/after + commits chain SHA

**`📤_outbox/LATEST.md`:**
- NEW raport Andura format standard (overwrite current Faza 2B LATEST after archive precedent)
- Archive precedent `📤_outbox/LATEST.md` (Faza 2B raport) → `📤_outbox/_archive/2026-05/390_FAZA_2B_KARPATHY_SCHEMA_LANDED_CONSUMED.md` (NN 390 next chronological continuous)

Atomic commit: `feat(vault): faza 2c step 6 — vault hub sync + LATEST raport (CURRENT_STATE + DECISION_LOG + INDEX_MASTER + DIFF_FLAGS + LATEST + precedent archived NN 390)`

---

## STEP 7 — Push origin + final verify

- Push origin all atomic commits chain (5 batches + step 6 = 6 commits)
- Verify push successful via `git log origin/feature/v2-vanilla-port -7 --oneline`
- Verify tests 2781 PASS preserved (doc-only — tests automatic via pre-commit hook each commit)
- Verify build vite green (doc-only verify trivial)
- Final LATEST.md raport confirming all acceptance criteria met

---

## ACCEPTANCE CRITERIA

- ✅ 64 → 0 real broken wikilinks (or documented residual cu rationale)
- ✅ 5 orphan candidates resolved (delete junk + .gitignore protect OR cross-ref legitimate)
- ✅ 6 atomic commits LANDED pushed origin `feature/v2-vanilla-port`
- ✅ Backup tag `pre-faza-2c-wikilink-fix-sweep-2026-05-11` pushed origin pre-execute
- ✅ Tests 2781 PASS preserved EXACT (doc-only ZERO src/ touched)
- ✅ DIFF_FLAGS P1-FLAG-WIKI-LINT-INITIAL-64-BROKEN flip 🟢 RESOLVED LANDED
- ✅ §CC.6 ~200 LOC CURRENT_STATE preserved STRICT (NU inflate, append-only narrative compact)
- ✅ Cumulative ~742 LOCKED V1 PRESERVED unchanged (vault meta-tooling NU additive product/architecture)
- ✅ /wiki-lint re-run optional verify post-fix (count broken wikilinks should be 0 or documented residual)

---

## HARD CONSTRAINTS (NU touch)

- 🚫 `📥_inbox/PLAN_ANTI_HALUCINATIE_VAULT.md` + `📥_inbox/PROMPT_CC_BATCH_2_ANTRENOR_PORT.md` (P2+P3 preserved next chats)
- 🚫 `📥_inbox/_karpathy_gist_reference.md` (raw-layer immutable preserved Faza 2B)
- 🚫 `src/` + `tests/` (zero touch — doc-only fix sweep)
- 🚫 `main` branch (feature/v2-vanilla-port only per Port-First-Then-React)
- 🚫 Memory edits Claude chat side + userPreferences UI + system prompt project (OUT OF SCOPE CC)
- 🚫 NU re-write entire CURRENT_STATE.md inflate — append-only §CC.6 strict per existing pattern

---

Execute fully autonomous. Report final via LATEST.md when all 6 commits LANDED + push origin verified + DIFF_FLAGS flag flipped 🟢 RESOLVED.

🦫 **Bugatti craft. FAZA 2C wikilink fix sweep ALL (a+b+c+d+e) autonomous Co-CTO scope. ZERO net additive product/architecture LOCK V1. Vault state post-Faza 2C → graph view orphan nodes dramatic reduced.**
