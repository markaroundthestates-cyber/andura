---
title: Wiki Design Spec V1 — Karpathy Option B Andura Adaptation
type: schema
status: locked-v1
locked_date: 2026-05-11
authority: Daniel CEO Option B 2026-05-11 chat ACASĂ post Karpathy gist re-read + graph view orphan screenshot + scope realignment
phase: FAZA 3 Phase 1 Research+Design output (pre Phase 2 schema rewrite + Phase 3 generate)
voice_preservation: synthesis + bugatti + crossrefs
cross_refs:
  - "[[../../📥_inbox/_karpathy_gist_reference]] raw immutable source"
  - "[[../../📥_inbox/PROMPT_CC_FAZA_3_KARPATHY_OPTION_B]] §1-§7 Daniel spec"
  - "[[../../CLAUDE]] vault root current schema Faza 2B (rewrite Phase 2)"
  - "[[../../VAULT_RULES#KARPATHY_OPERATIONS]] LOCK V1 2026-05-11 Faza 2B"
  - "[[../../00-index/CURRENT_STATE#NOW]] Faza 2D LANDED + Faza 3 pending"
---

# Wiki Design Spec V1 — Karpathy Option B Andura Adaptation

**Task:** FAZA 3 Phase 1 Research + Design — wiki/ folder structure adapted Andura cu voice preservation policy §1 mandatory.
**Authority:** Daniel CEO Option B select 2026-05-11 (vault existing → raw layer immutable; NEW wiki/ pure LLM-generated; CLAUDE.md rewrite Karpathy real NU adaptare superficială Faza 2B).
**Status:** ✅ LOCK V1 — schema for Phase 2 rewrite + Phase 3 generate execute.

---

## §1 — Folder Structure

```
wiki/
├── _design/
│   └── WIKI_DESIGN_SPEC_V1.md      (this file — schema authority Phase 2+3 execute)
├── index.md                         (Karpathy catalog: ALL pages by category + 1-line summary + cross-ref to raw layer)
├── log.md                           (Karpathy chronological: ingest|query|lint entries append-only)
├── entities/                        (1 page per concept/feature/engine/decision/ADR — granular)
│   ├── adrs/                        (42 ADR entity pages)
│   │   ├── adr-001-local-first-storage.md
│   │   ├── adr-005-vanilla-js.md
│   │   ├── adr-023-llm-intent-superseded.md
│   │   ├── adr-026-offline-coaching-tree.md
│   │   ├── adr-030-adapter-design.md
│   │   ├── adr-multi-tenant-auth.md
│   │   ├── ... (43 total: 33 numbered 001-033 + 10 named)
│   ├── engines/                     (coach engines + sub-systems)
│   │   ├── engine-deload.md
│   │   ├── engine-tempo-form-cues.md
│   │   ├── engine-warmup-mobility.md
│   │   ├── engine-energy-adjustment.md
│   │   ├── engine-specialization.md
│   │   ├── engine-muscle-recovery.md
│   │   ├── engine-coach-director.md
│   │   ├── engine-weakness-detector.md
│   │   ├── engine-prengine-pr-wall.md
│   │   ├── engine-readiness.md
│   │   ├── engine-streak-counter.md
│   │   └── ... (8-10 engines per ADR 026 §42.10 pipeline + idle/coach helpers)
│   ├── features/                    (V1 features F1-F15 + auth + onboarding + UI)
│   │   ├── feature-f1-patterns-banner.md
│   │   ├── feature-f2-last-session-memory.md
│   │   ├── feature-f3-fatigue-score.md
│   │   ├── feature-f4-readiness-verdict.md
│   │   ├── feature-f5-aa-friction-modal-deferred.md
│   │   ├── feature-f6-pr-wall.md
│   │   ├── feature-f7-coach-director.md
│   │   ├── feature-f8-streak-counter.md
│   │   ├── feature-f9-bmr-strip.md
│   │   ├── feature-f10-stats-grid.md
│   │   ├── feature-f11-prs-notification.md
│   │   ├── feature-f12-rating-buttons.md
│   │   ├── feature-f13-rating-notes-dropped.md
│   │   ├── feature-f14-ratings-window.md
│   │   ├── feature-f15-per-set-rpe.md
│   │   ├── feature-auth-magic-link.md
│   │   ├── feature-onboarding-t0.md
│   │   ├── feature-mode-detection.md
│   │   ├── feature-tier-storage.md
│   │   └── ...
│   └── specs/                       (architecture SPEC entity pages)
│       ├── spec-cognitive-architecture.md
│       ├── spec-multi-tenant-auth.md
│       ├── spec-tombstone-branching.md
│       ├── spec-data-registry.md
│       ├── spec-port-first-step-1.md
│       ├── spec-react-migration-state-mapping.md
│       ├── spec-andura-validation-framework.md
│       ├── spec-scenarios-simulator.md
│       ├── spec-faza-2-filter-strategy.md
│       └── spec-v1-features-audit.md
├── concepts/                        (cross-cutting concepts — paradigms, strategies, principles)
│   ├── port-first-then-react.md
│   ├── autonomy-paradigm-v1.md
│   ├── bugatti-craft.md
│   ├── gigel-test.md
│   ├── no-diacritics-rule.md
│   ├── strategy-lock-v1.md
│   ├── anti-recurrence-rules.md
│   ├── karpathy-llm-wiki-pattern.md
│   ├── direct-to-cc-paradigm.md
│   ├── mockup-vs-prod-distinction.md
│   ├── append-only-architecture.md
│   ├── voice-preservation-policy.md
│   ├── andura-suflet.md
│   ├── moat-strategy.md
│   ├── product-vision.md
│   └── ... (~15-20 cross-cutting concepts)
├── summaries/                       (topic synthesis cross-multiple entities + concepts)
│   ├── auth-flow-overview.md
│   ├── coach-engines-overview.md
│   ├── v1-features-overview.md
│   ├── onboarding-flow-overview.md
│   ├── mockup-themes-overview.md
│   ├── vault-meta-tooling-overview.md
│   ├── port-first-execution-overview.md
│   ├── react-migration-roadmap.md
│   ├── beta-launch-readiness.md
│   ├── decision-clusters-overview.md
│   ├── daniel-isms-glossary.md
│   ├── slip-patterns-history.md
│   └── ... (~10-15 topic syntheses)
└── sources/                         (pointers la raw layer SSOT files — read-only refs catalog)
    ├── decision-log-pointers.md     (DECISION_LOG entries → wiki entities/concepts cross-ref map)
    ├── handover-themes-pointers.md  (5 HANDOVER theme files → wiki coverage map)
    ├── current-state-pointers.md    (CURRENT_STATE precedent threads → wiki narrative map)
    ├── adr-source-pointers.md       (42 ADR files → wiki entity 1:1 map)
    ├── spec-source-pointers.md      (11 SPEC files → wiki entity map)
    └── vision-source-pointers.md    (9 vision files → wiki concept/summary map)
```

**Total estimated wiki pages:** ~150-200 (42 ADRs + 10 engines + 20 features + 10 specs + 20 concepts + 15 summaries + 6 sources = ~120 base + auxiliary pages per cluster).

---

## §2 — Voice Preservation Policy §1 MANDATORY Per Wiki Page Structure

**Risk Option B (Karpathy real):** LLM summary impersonal → identity loss Andura. Mitigation policy mandatory enforce per wiki page.

### §2.1 — Per Wiki Page Sections Required (ALL 4 sections present)

```markdown
---
<frontmatter — see §3>
---

# <Page Title>

## Synthesis

<LLM-written summary concept — concise, max 2-3 paragrafe>
<focus pe ce ESTE entitatea/concept/feature; ce face; cum se conectează cu altele>

## Verbatim quotes Daniel

<push-backs key + mea culpa moments + daniel-isms preserved EXACT verbatim cu context original>
<format: Daniel verbatim chat <DATE> *"<quote-exact>"* (context)>

Examples preserved exact:
- *"tataie ce dracu faci?"*
- *"halucinezi?"*
- *"ia bate-te"*
- *"se bate sonnet"*
- *"ups am dat"*
- *"stai asa de ce ne-am oprit?"*
- *"NU MA MAI INTREBI NIMIC FARA SA VERIFICI"*
- *"ba ce dracu faci? Ai o aplicatie in productie care e vanila..."*
- *"Pe bune exact stilul hai sa punem acoperisul inainte sa punem peretii"*
- *"esti cto sau puppy?"*
- *"daca imi zici reps in reserve ma supar"*
- *"il dai direct la cc tu"*
- *"traiasca api tau"*
- *"ia cauta pe net inainte sa presupui"*
- *"salut acasă"*

## Bugatti framing notes

<Gigel test rationale dacă aplicabil>
<Quality > Speed rationale>
<Anti-RE (anti-recurrence) considerations>
<Anti-paternalism notes>
<Voice tone notes — Bugatti craft framing>

## Cross-refs raw layer

<citation source specific path:§ verbatim — MANDATORY raw layer pointers>
- [[../../03-decisions/<file>]] §<section>
- [[../../04-architecture/<file>]] §<section>
- [[../../06-sessions-log/HANDOVER_*]] §<section>
- [[../../00-index/CURRENT_STATE]] §<section> (precedent thread snapshot)
- [[../../📤_outbox/_archive/2026-05/<NN>_*]] (consumed archive specific raport)
```

### §2.2 — Hard Rules

**HARD RULE 1:** NU rezuma push-backs Daniel impersonal "user pushed back" → preserve EXACT verbatim cu format `Daniel verbatim chat <DATE> *"<quote>"*` cu context.

**HARD RULE 2:** NU lobotomy daniel-isms care formează identity Andura. Daniel-isms catalog include (minimum): "tataie", "halucinezi", "stai", "ia bate-te", "se bate sonnet", "ups am dat", "salut acasă", "ce dracu faci", "ba ce dracu", "Coach urca/reduce", "puppy", "Gigel test", "Bugatti craft", "acoperiș-pereți", "deranjezi", "ma intrerupi inutil", "in inbox sper da?", "ia cauta pe net", "traiasca api tau". Lista extensibilă chat-to-chat.

**HARD RULE 3:** Synthesis section MUST be concise (max 2-3 paragrafe) — wikis goal = LLM bookkeeping, NU narrative repetition. Detailed narrative preserved în Verbatim quotes Daniel + Cross-refs raw layer.

**HARD RULE 4:** Cross-refs raw layer MANDATORY each page (minim 2-3 specific pointers `path:§`). Page fără cross-refs raw layer = orphan din wiki perspective + voice fidelity broken (NU citation lineage).

**HARD RULE 5:** Bugatti framing notes section poate fi gol/minimal pentru entități neutre (e.g. tehnologie pură ADR), dar voice tone notes ar trebui prezente acolo unde aplicabil. NU skip section header — keep header gol cu marker `<!-- N/A pentru această entitate -->` dacă conținut zero.

---

## §3 — Frontmatter Template Per Page Type

### §3.1 — Entity Page Frontmatter

```yaml
---
title: <Entity Name>
type: entity
subtype: adr | engine | feature | spec
status: draft | locked-v1 | superseded | amended | deprecated
locked_date: YYYY-MM-DD
authority: <raw layer source primary path:§>
voice_preservation: synthesis + verbatim + bugatti + crossrefs (sections present)
cross_refs:
  - "[[entities/<other>]]"
  - "[[concepts/<concept>]]"
  - "[[summaries/<summary>]]"
amendments:
  - date: YYYY-MM-DD
    note: <brief>
---
```

### §3.2 — Concept Page Frontmatter

```yaml
---
title: <Concept Name>
type: concept
status: draft | locked-v1 | superseded | amended
locked_date: YYYY-MM-DD
authority: <raw layer source primary path:§>
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[entities/<entity>]]"
  - "[[concepts/<related>]]"
  - "[[summaries/<topic>]]"
amendments:
  - date: YYYY-MM-DD
    note: <brief>
---
```

### §3.3 — Summary Page Frontmatter

```yaml
---
title: <Topic> Overview
type: summary
status: draft | locked-v1
locked_date: YYYY-MM-DD
authority: synthesis of [<entity1>, <entity2>, <concept1>, ...]
voice_preservation: synthesis + verbatim + bugatti + crossrefs
covers_entities:
  - "[[entities/<file>]]"
  - "[[entities/<file>]]"
covers_concepts:
  - "[[concepts/<file>]]"
amendments:
  - date: YYYY-MM-DD
    note: <brief>
---
```

### §3.4 — Source Pointer Page Frontmatter

```yaml
---
title: <Source File> Pointers
type: source
status: locked-v1
locked_date: YYYY-MM-DD
authority: raw layer immutable reference
covers_raw_file: <absolute path la raw layer file>
last_synced: YYYY-MM-DD
---
```

### §3.5 — Index + Log Frontmatter

```yaml
---
title: Wiki Index | Wiki Log
type: index | log
status: live
last_updated: YYYY-MM-DD
---
```

---

## §4 — 3 Operations Spec (Karpathy adapted Andura)

### §4.1 — `/wiki-ingest <source>` (process raw input → distribute wiki layer)

**Trigger:** Daniel adds new file la `📥_inbox/` + signals process, OR autonomous CC detects post-handover.

**Workflow:**
1. **Read raw source** via filesystem direct.
2. **Classify content:** handover narrative / ADR draft / SPEC DRAFT / prompt CC / plan / raport CC / external article (Web Clipper future).
3. **Distribute la wiki layer:**
   - Handover narrative → update relevant `entities/` + `concepts/` + `summaries/` cu narrative slice + Verbatim quotes Daniel append + Bugatti framing notes append + Cross-refs raw layer cite specific. NU touch raw HANDOVER file (immutable).
   - ADR draft → 1 entity page `entities/adrs/adr-<NNN>-<slug>.md` + concept page dacă cross-cutting + cross-refs bidirectional.
   - SPEC DRAFT → 1 entity page `entities/specs/spec-<name>.md` + summary dacă synthesizing multi-spec.
   - Prompt CC / Plan → preserve raw (NU process — Daniel-curated input pending execute, NU wiki summary yet).
   - Raport CC → wiki entity/concept page update cu narrative slice + Cross-refs la `📤_outbox/_archive/` specific.
   - External article → entity page la `entities/external/<name>.md` + concept tag dacă cross-cutting.
4. **Update `wiki/index.md`** entry append (1-line: `[[entities/file]] — one-line summary cross-ref raw layer source`).
5. **Append `wiki/log.md` entry:** `## [YYYY-MM-DD] ingest | <source name>` + brief description what was distributed.
6. **Pre-flight grep wikilinks orphan** mandatory pre-commit.
7. **Backup tag pre-execute:** `pre-wiki-ingest-<source>-<YYYY-MM-DD-HHMM>` pushed origin.
8. **Atomic commit single-concern Bugatti craft** + push origin.
9. **Signal Daniel post-ingest if handover context:** "e timpul pt noul chat" per §CC.5 §AMENDMENT 2026-05-10 Direct-to-CC paradigm.

**Voice preservation enforcement:** ANY wiki page edit/create via `/wiki-ingest` MUST preserve §2.1 4-section structure + §2.2 hard rules. NU shortcut.

### §4.2 — `/wiki-query <question>` (answer questions citing wiki)

**Trigger:** Daniel asks question în chat OR Claude needs verify claim pre-action.

**Workflow:**
1. **Read `wiki/index.md` first** for topic anchor (Karpathy native: index-driven navigation, NU embedding RAG).
2. **Drill `wiki/entities/` + `wiki/concepts/` + `wiki/summaries/`** pages relevant per index.
3. **Cite citations `path:§` mandatory** per §CC.4. Format: `Per [[wiki/entities/<file>]] §<section>: ...` OR `Per [[wiki/concepts/<file>]] §<section>: ...` OR drill raw layer specific dacă Synthesis section ambiguă.
4. **Synthesize answer** cu citations multi-source dacă necesar.
5. **Flag explicit if no wiki answer:** "verific cu MCP filesystem raw layer read" OR "necesită Daniel decizie reală" OR "invoke web search Daniel cerere".
6. **File answers back as wiki pages când valoros** (Karpathy native insight): comparison tables + analysis + connections discovered ≠ disappear into chat history. Place în `wiki/summaries/<topic>.md` cu YAML frontmatter + cross-refs.

**Append `wiki/log.md` entry:** `## [YYYY-MM-DD] query | <question topic>` (optional — only when novel synthesis produced).

### §4.3 — `/wiki-lint` (health check)

**Trigger:** Periodic Daniel-invoked OR autonomous CC schedule (post major LOCK V1 batch, post handover, monthly maintenance).

**Workflow (5 scan types):**
1. **Broken wikilinks scan:** Grep all `[[...]]` references across `wiki/` markdown files. For each, verify target file exists. Flag missing targets.
2. **Orphan pages scan:** For each markdown file în `wiki/`, check no inbound `[[file]]` references AND no `wiki/index.md` entry. Flag candidates.
3. **Stale claims scan:** Check files with `last_updated: YYYY-MM-DD` headers > 60 days old vs current chat-current state. Flag candidates Daniel review.
4. **Contradictions scan:** Cross-check dated entries across wiki layer for conflict. Examples Andura-relevant: ADR amendment date Y vs concept page narrative claiming opposite; entity status `locked-v1` vs amendment status `superseded` în different pages.
5. **Voice fidelity scan (NEW Phase 4 mandatory):** For each wiki page cu Verbatim quotes Daniel section, verify quotes preserved EXACT cu daniel-isms catalog (§2.2 minimum list). Flag pages cu Synthesis section dominant + Verbatim quotes empty/minimal/paraphrased (identity loss risk).

**Output raport:** `📤_outbox/_archive/<YYYY-MM>/<NN>_WIKI_LINT_RAPORT_<date>.md` cu §1-§6 sections (5 scans + §6 summary + recommendations).

**Append `wiki/log.md` entry:** `## [YYYY-MM-DD] lint | <findings count summary>`.

**Fix policy:** NU fix automat în `/wiki-lint` pass — Daniel review prima. Each finding decided per case.

**P1 escalation:** If finding critical (broken wikilink la `wiki/index.md` OR voice fidelity broken pe pagini high-value) → add `DIFF_FLAGS.md` entry `P1-FLAG-WIKI-LINT-<finding>` 🟡 P1 pending Daniel review.

---

## §5 — Cross-Ref Convention Wiki Pure

### §5.1 — Within Wiki (wiki-internal)

- Same-folder: `[[file]]` (e.g. `[[adr-005-vanilla-js]]` din `entities/adrs/`)
- Cross-folder wiki: `[[../concepts/port-first-then-react]]` (relative path from current folder)
- Anchor drill-down wiki: `[[entities/adrs/adr-005-vanilla-js#AMENDMENT 2026-05-10]]`

### §5.2 — Wiki → Raw Layer (citation lineage)

- ADR raw: `[[../../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-10`
- SPEC raw: `[[../../04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1]] §LOCK V1`
- HANDOVER raw: `[[../../06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening]] §X`
- CURRENT_STATE precedent: `[[../../00-index/CURRENT_STATE]] §JUST_DECIDED 2026-05-10` (snapshot citation)
- DECISION_LOG entry: `[[../../03-decisions/DECISION_LOG]] §<date> entry`
- Archive consumed: `[[../../📤_outbox/_archive/2026-05/<NN>_*_CONSUMED]]`

### §5.3 — Wiki Index Catalog Format

```markdown
# Wiki Index — Andura Wiki Catalog

**Last updated:** YYYY-MM-DD

## Entities — ADRs (42 total)

- [[entities/adrs/adr-001-local-first-storage]] — Local-first storage strategy (IndexedDB + Firebase backup tier)
- [[entities/adrs/adr-005-vanilla-js]] — Vanilla JS stack pre-React §AMENDMENT 2026-05-10 Port-First-Then-React LOCK V1
- ... (42 entries)

## Entities — Engines (~10 total)

- [[entities/engines/engine-deload]] — Deload protocol per ADR 032
- [[entities/engines/engine-tempo-form-cues]] — Tempo + form cues per ADR 028
- ... (~10 entries)

## Entities — Features (V1 + Auth + Onboarding ~20 total)

- [[entities/features/feature-f1-patterns-banner]] — V1 LOW_ADHERENCE + STAGNATION (drop HIGH_DEVIATION+EARLY_END+PEAK_HOURS gimmick per audit Gigel-suspect)
- ... (~20 entries)

## Entities — Specs (11 total)

- [[entities/specs/spec-cognitive-architecture]] — Cognitive Architecture SPEC v1
- ... (11 entries)

## Concepts (~15-20 cross-cutting)

- [[concepts/port-first-then-react]] — Port-First-Then-React strategic LOCK V1 2026-05-10
- [[concepts/bugatti-craft]] — Quality > Speed default principle
- [[concepts/gigel-test]] — UX Gigel-friendly test (Marius variant)
- [[concepts/no-diacritics-rule]] — NO_DIACRITICS_RULE LOCK V1 PERMANENT 2026-05-10
- [[concepts/autonomy-paradigm-v1]] — Co-CTO autonomous LOCKED V1 PERMANENT 2026-05-11
- ... (~15-20 entries)

## Summaries (~10-15 topic synthesis)

- [[summaries/auth-flow-overview]] — SMTP Magic Link + ADR_MULTI_TENANT_AUTH integration
- [[summaries/coach-engines-overview]] — 8 prescriptive engines pipeline §42.10 + auxiliary
- [[summaries/daniel-isms-glossary]] — Daniel verbatim catalog preserved identity Andura
- ... (~10-15 entries)

## Sources (raw layer pointers — 6 catalogs)

- [[sources/decision-log-pointers]] — DECISION_LOG entries → wiki coverage map
- [[sources/handover-themes-pointers]] — 5 HANDOVER theme files map
- ... (6 entries)
```

### §5.4 — Wiki Log Chronological Signature

```markdown
# Wiki Log — Chronological Append-Only

## [2026-05-11] ingest | FAZA 3 Phase 1 Research+Design
Initial wiki/ folder skeleton + design spec LANDED. Phase 1 complete.

## [2026-05-11] ingest | FAZA 3 Phase 2 Schema rewrite
CLAUDE.md vault root rewrite Karpathy real + VAULT_RULES §CC.* redesign no-layered-read flow. Phase 2 complete.

## [2026-05-11] ingest | FAZA 3 Phase 3 Wiki generation
Generated 42 ADR entity pages + 10 engine entity pages + 20 feature entity pages + 11 spec entity pages + 18 concept pages + 12 summary pages + 6 source pointer catalogs. Voice preservation policy §1 enforced per page. Phase 3 complete.

## [2026-05-11] lint | FAZA 3 Phase 4 Initial wiki-lint
5 scan types raport LANDED. Voice fidelity validation. HARD STOP Daniel review checkpoint.
```

---

## §6 — Generation Strategy Phase 3 (cluster execution)

**Total wiki pages estimate:** ~120-200. NU one-shot generate — atomic commits per cluster Bugatti craft.

**Cluster execution order (Phase 3 sub-phases):**

1. **Cluster A — ADR entity pages (42 pages):** 1 atomic commit. Sweep `03-decisions/` raw → generate `wiki/entities/adrs/adr-*.md` cu voice preservation policy §1 per page. ADR raw source primary cite. Verbatim quotes Daniel preserved din ADR §AMENDMENT history.

2. **Cluster B — Engine entity pages (~10 pages):** 1 atomic commit. Sweep `src/engine/*.js` source + ADR 026 §42.10 pipeline raw → generate `wiki/entities/engines/engine-*.md`.

3. **Cluster C — Feature entity pages (~20 pages):** 1 atomic commit. Sweep V1_FEATURES_AUDIT_V1 + ADR_MULTI_TENANT_AUTH + ADR 014 onboarding + ADR_MODE_DETECTION_UI raw → generate `wiki/entities/features/feature-*.md`.

4. **Cluster D — Spec entity pages (11 pages):** 1 atomic commit. Sweep `04-architecture/*.md` raw → generate `wiki/entities/specs/spec-*.md`.

5. **Cluster E — Concept pages (~15-20 pages):** 1 atomic commit. Cross-cutting paradigms + strategies + principles synthesizing din raw layer history HANDOVER themes + CURRENT_STATE precedent threads + 01-vision/ + DECISION_LOG cumulative.

6. **Cluster F — Summary pages (~10-15 pages):** 1 atomic commit. Topic synthesis cross-multiple entities + concepts.

7. **Cluster G — Source pointer pages (6 catalogs):** 1 atomic commit. Raw layer pointers map.

8. **Cluster H — wiki/index.md + wiki/log.md (2 pages):** 1 atomic commit. Karpathy catalog + chronological log initial populate.

**Total Phase 3 commits projected:** 8 atomic commits + push origin chain end-of-each-cluster.

**Backup tag pre-Phase 3:** `pre-faza-3-phase-3-wiki-generation-2026-05-11` pushed origin.

---

## §7 — Schema CLAUDE.md Rewrite Design (Phase 2 spec)

### §7.1 — Karpathy Real (NU adaptare superficială Faza 2B)

Faza 2B CLAUDE.md (current ~270 LOC §0-§6) = adaptare superficială (mapping conceptual existing folders → wiki layer fără actual wiki/ folder creat). Phase 2 rewrite = Karpathy real:

- **§1 — 3-layer architecture:** raw = vault existing entire (`📥_inbox/` + `00-index/` + `01-vision/` + `02-audit/` + `03-decisions/` + `04-architecture/` + `05-findings-tracker/` + `06-sessions-log/` + `07-meta/` + `08-workflows/` + `📤_outbox/` + `VAULT_RULES.md` + `DIFF_FLAGS.md` + `README.md`) → **TOATE freeze immutable raw layer post-Faza 3**. wiki = NEW `wiki/` folder pure LLM-generated. schema = CLAUDE.md rewrite (this) + VAULT_RULES §CC.* redesign.

- **§2 — 3 Operations canonical:** `/wiki-ingest` + `/wiki-query` + `/wiki-lint` adapted Andura per §4 above. Voice preservation policy §1 mandatory enforce per page.

- **§3 — Voice preservation policy §1 MANDATORY:** per §2 above 4-section structure (Synthesis + Verbatim quotes Daniel + Bugatti framing + Cross-refs raw layer). Hard rules §2.2.

- **§4 — Cross-ref convention:** wiki-internal `[[file]]` + wiki→raw `[[../../path/file]]` + citation lineage mandatory. Wikilinks Obsidian-style canonical.

- **§5 — Frontmatter template per page type:** §3 above 5 templates (entity + concept + summary + source + index/log).

- **§6 — Integration cu protocols existing:** §CC.* redesigned no-layered-read (LLM citește wiki natural per query/ingest) + §AR.* preserved (claude_code agent execution discipline rules invariant) + §HANDOVER_PROTOCOL deprecat (replaced de `/wiki-ingest` operation handover-narrative classifier).

- **§7 — Bugatti craft Andura-specific:** Quality > Speed default + atomic commits single-concern + backup tag mandatory + citation enforcement + autonomy LOCKED V1 PERMANENT.

### §7.2 — VAULT_RULES §CC.* Redesign Design (Phase 2 spec)

**§CC.2 chat NEW startup redesign:**
- **OLD (Faza 2B+):** Sequential layered read mandatory (CURRENT_STATE + HANDOVER refs + Top 3 ADRs + DIFF_FLAGS). Heavy upfront cost.
- **NEW (Faza 3 Karpathy real):** Chat NEW startup = read `wiki/index.md` + `wiki/log.md` last 5-10 entries. Drill `wiki/entities/` + `wiki/concepts/` + `wiki/summaries/` per question/topic via `/wiki-query`. NU mandatory full CURRENT_STATE read (CURRENT_STATE preserved raw layer immutable, citable via `/wiki-query` cross-refs from wiki summaries).

**§CC.4 citation enforcement REAFFIRMED:**
- Citations format `[[wiki/<path>]] §<section>` primary (wiki layer) + fallback `[[<raw layer path>]] §<section>` când wiki summary ambiguă.

**§CC.5 fast handover ingest:**
- Redirect → `/wiki-ingest <handover-source>` (handover narrative classifier branch).
- §CC.5 mecanic preserved exact (CURRENT_STATE update? — clarification needed Phase 2: do we still update CURRENT_STATE post-Faza 3? Recommendation: **NO** — CURRENT_STATE = raw layer immutable post-Faza 3 freeze. Handover narratives distributed direct la `wiki/entities/` + `wiki/concepts/` + `wiki/log.md` chronological).

**§CC.6 ~200 LOC append-only architecture:**
- DEPRECATED post-Faza 3 — CURRENT_STATE freeze raw layer. wiki/index.md + wiki/log.md replace ca live navigation hub.

**§HANDOVER_PROTOCOL:**
- DEPRECATED post-Faza 3 — replaced de `/wiki-ingest` operation handover-narrative classifier branch.

**§AR.* anti-recurrence rules:**
- ALL preserved unchanged. claude_code agent execution discipline invariant.

---

## §8 — Acceptance Criteria Phase 1

- ✅ `wiki/_design/WIKI_DESIGN_SPEC_V1.md` LANDED (this file) cu §1-§7 schema complete
- ✅ `wiki/` folder skeleton created (entities/ + concepts/ + summaries/ + sources/ + _design/)
- ✅ Folder structure §1 documented + page type estimate ~150-200
- ✅ Voice preservation policy §1 mandatory structure §2 documented + 4 hard rules
- ✅ Frontmatter template §3 per page type 5 variants
- ✅ 3 operations §4 spec adapted Andura
- ✅ Cross-ref convention §5 + wiki/index.md catalog format + wiki/log.md chronological signature
- ✅ Phase 3 generation strategy §6 cluster execution order (8 commits projected)
- ✅ Phase 2 schema CLAUDE.md rewrite design §7 + §CC.* redesign blueprint
- ✅ Backup tag `pre-faza-3-phase-1-research-design-2026-05-11` pushed origin pre-execute

---

🦫 **Bugatti craft. WIKI_DESIGN_SPEC_V1 LANDED Phase 1 Research+Design. Voice preservation policy §1 mandatory enforce. Karpathy Option B real schema for Phase 2 rewrite + Phase 3 generate execute. Vault existing → raw layer immutable preserved. NEW wiki/ pure LLM-generated 3-layer Karpathy compliant.**
