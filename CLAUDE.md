---
title: CLAUDE.md — Andura Vault Schema (Karpathy LLM Wiki Real, Option B) — SUPERSEDED 2026-05-15
type: schema
status: SUPERSEDED
locked_date: 2026-05-11
superseded_date: 2026-05-15
superseded_by: DECISIONS.md §D001 SSOT singular reglaj
note: |
  Schema SUPERSEDED 2026-05-15 — current SSOT este DECISIONS.md root §D001 per Daniel CEO directive reglaj 2026-05-15
  *"Ne trebuie un loc special dedicat cu toate deciziile, updatate la fiecare handover, nu trebuie sa avem aceeasi decizie si pas de 10 ori in forme diferite."*
  CLAUDE.md body §0-§7 (Karpathy Real Option B, ~32KB) GUT 2026-05-16 — backup tag `pre-claude-md-gut-2026-05-16-1200` preserves prior content origin. Wiki/ FROZEN imutabilă post 2026-05-15 radical archived 99-archive/wiki-pre-2026-05-15/ off-default-search per DECISIONS.md §D001.
  Karpathy 4 principii core philosophy: [[07-meta/karpathy-skills-ref/CLAUDE.md]] §1-§4 (Think Before Coding + Simplicity First + Surgical Changes + Goal-Driven Execution).
authority: Daniel CEO Option B 2026-05-11 chat ACASĂ post Karpathy gist re-read + graph view orphan screenshot — vault existing FREEZE raw layer immutable + NEW wiki/ pure LLM-generated + voice preservation policy §1 mandatory (HISTORICAL — superseded 2026-05-15 + body GUT 2026-05-16)
supersedes: CLAUDE.md FAZA 2B 2026-05-11 (Karpathy adaptare superficială — entire folders treated as wiki layer fără actual wiki/ folder)
cross_refs:
  - "[[DECISIONS.md]] §D001 SSOT singular reglaj root authority"
  - "[[ANDURA_PRIMER.md]] §3 onboarding chat NEW post-reglaj"
  - "[[07-meta/karpathy-skills-ref/CLAUDE.md]] §1-§4 Karpathy 4 principii core philosophy"
  - "[[99-archive/wiki-pre-2026-05-15/]] wiki radical archived off-default-search"
amendments:
  - date: 2026-05-11
    note: FAZA 3 Phase 2 — Karpathy real rewrite Option B + voice preservation policy §1 MANDATORY per wiki page + 3 operations adapted Andura cu wiki/ pure folder authority
  - date: 2026-05-16
    note: Body §0-§7 (~32KB) GUT — paradigm fragmentation risk eliminat (schema body outdated încărcat default în orice chat fresh confunda DECISIONS.md SSOT real). Replaced cu stub pointer 5 linii. Backup tag `pre-claude-md-gut-2026-05-16-1200` preserves prior content.
---

> ℹ️ **REPO NOTE (for a fresh clone / new agent):** This file points at `DECISIONS.md`, `ANDURA_PRIMER.md`, `CHAT_STATE.md`, `📤_outbox/`, `📥_inbox/`, `07-meta/`, `99-archive/` etc. Those are **VAULT paths** — the developer's private Obsidian planning vault, gitignored and NOT present in this app repo. If you cloned the app, ignore vault references; they will be missing.
>
> **In-repo source of truth** is the code itself plus the tracked docs: `README.md`, `AGENTS.md`, and `SECURITY.md`. The vault is planning-only and external to the build.

---

> 🛑 **STOP. Read [[DECISIONS.md]] instead. Historical Faza 3 reference only.**
>
> Schema body GUT 2026-05-16 — current SSOT is `DECISIONS.md` root §D001. Wiki/ FROZEN imutabilă archived `99-archive/wiki-pre-2026-05-15/`. Karpathy 4 principii core philosophy: [[07-meta/karpathy-skills-ref/CLAUDE.md]] §1-§4. Prior body preserved în backup tag `pre-claude-md-gut-2026-05-16-1200` origin.

---

## Current authority pointers

- **SSOT operations + decizii:** [[DECISIONS.md]] §D001 root (singular reglaj Daniel CEO directive 2026-05-15). Latest LOCKED V1: D045 (2026-05-20).
- **Onboarding chat NEW:** [[ANDURA_PRIMER.md]] §1-§8 (mandatory §CC.2 startup primary read).
- **Karpathy philosophy core:** [[07-meta/karpathy-skills-ref/CLAUDE.md]] §1-§4 (Think Before Coding + Simplicity First + Surgical Changes + Goal-Driven Execution).
- **Prior body archive:** git tag `pre-claude-md-gut-2026-05-16-1200` (Karpathy Real Option B §0-§7 ~32KB historical reference only).

---

## Andura — Project context + workflow (2026-05-20 refresh)

**What:** PWA fitness coach AI Romanian-first live `andura.app`. Bootstrap solo Daniel (CEO + Product). Plan x20. Orizont 2-3 ani. Free Beta, pricing post-Beta launch.

**Stack:** React 19 + Vite 5 + TypeScript + Tailwind v3 + Vitest 3 + RTL + React Router DOM 6.28 + Zustand (`appStore`) + Firebase (REST API NU SDK per ADR 002) + IndexedDB per UID + PWA. Production = React Clasic deployed post D028 vanilla→React entry swap 2026-05-19.

**Branch:** `main`. Phase 3/4/5/6/7 + Track 7 + iter 1-9.6 ALL LANDED. Active: Iter 1 Mass Fix V2 design phase (D045 LOCKED V1) — 4 mega-Waves architecture ~305 atomic tasks pending Daniel CEO approve trigger Wave A.

**Personas (Gigel Test mandatory pre-feature):**
- **Gigel** = user mediu non-tech RO. Filter: *"Cum reacționează Gigel? Dubios pentru user?"* (NU "tehnic posibil?")
- **Marius** = performant la sala
- **Maria 65** = conservativ vârstnic

**Bugatti paradigm:** Peak craft, zero compromise, Quality > Speed strict. Refactor later NEVER happens. Bug 02:00 > 5 commits grabă. Quality argumente only — NU timing/effort/deadline ca decizie base. Filter: *"Ar fi mândru un Bugatti engineer?"*

**Daniel = CEO + Product Owner:** Strategic + UX decizii. NU verifică pre-Beta. Smoke test + Bugatti audit nuclear pre-launch only.

**Claude chat = Co-CTO autonomous:** Tactical decizii (path, test names, code, model, sequence) eu decid singur via MCP/Obsidian vault search. Daniel validează post-LANDED. Wording autonomous compose pre-Beta (D024 LOCKED V1, supersede D009). ZERO întrebare aprobare pentru tactical.

**CC Opus terminal = executor:** Autonomous spec din artefact + raport `📤_outbox/LATEST.md`. Model: Opus EXCLUSIVELY (Sonnet concediat permanent 2026-05-03). Daniel startup: `claude --dangerously-skip-permissions`.

### §CC.2 startup ("Salut Acasă" trigger)

1. `tool_search` filesystem (deferred tools load explicit)
2. Read `ANDURA_PRIMER.md` §1-§8 complete (singular briefing instant onboard 7-criterii: ce e Andura + ce face + cum funcționează + ce trebuie să fie + unde am rămas + ce e de făcut + ce vrea Daniel)
3. Read `DECISIONS.md` head 50 lines (SSOT singular live catalog + recent decizii)
4. Read `📤_outbox/LATEST.md` (current state CC autonomous last task)
5. Read `CHAT_STATE.md` (live Claude chat conversation continuity — last 5-7 exchanges + open questions + mid-flight context + next P1, picks up unde Claude chat anterior a rămas)
6. Read targeted section per topic recent identified (on-demand)
7. Output §CC.3 format: `Aligned. Last LOCKED [DECISIONS.md §<ID>]. Mid-flight [if any]. Next P1 [task]. Drift [silent flag if any].`
8. Direct execute P1 autonomous, ZERO "Continuăm?"

### §F3.8 handover ("fă handover" trigger SAU bw ~25%)

1. Eu scriu narrative direct `📥_inbox/HANDOVER_<date>_<topic>.md` (~80-150 LOC conversational scribe flow, NU tabel)
2. PROMPT_CC artefact separat pentru CC distribute (dacă batch work next chat)
3. Invoke claude_code: append decizii noi la `DECISIONS.md` + archive inbox consumed
4. ZERO Daniel courier pentru handover automation (CC handles)

### MCP precedence (ACASĂ default permanent)

`filesystem` MCP + Obsidian PRIMARY real-time SSOT truth-source. PK (`project_knowledge_search`) = FALLBACK doar când Daniel zice "birou" explicit la START chat. "Salut Acasă" ACASĂ trigger = ZERO PK use.

**Tool discipline (D023 LOCKED V1):** `filesystem:write_file` PENTRU TOATE vault writes — NU `obsidian-mcp-tools:create_vault_file` (silent false success Windows emoji paths 📥/📤). Post-write `filesystem:list_directory` verify mandatory.

### Vault SSOT pointers

- **`ANDURA_PRIMER.md`** = singular briefing fresh chat instant onboard §1-§8 (mandatory §CC.2 step 2)
- **`DECISIONS.md`** = SSOT singular live decizii append-only (D001-D045+ LOCKED V1, frontmatter `latest_entry` tracks current)
- **`📤_outbox/LATEST.md`** = CC autonomous last raport (mandatory §CC.2 step 4)
- **`CHAT_STATE.md`** = live Claude chat conversation continuity, cross-CC-session pick-up (mandatory §CC.2 step 5) — distinct de LATEST.md (CC task report) + HANDOVER files (end-of-chat narrative) + PRIMER §5 (substantial milestones)
- **`📥_inbox/`** = Daniel inputs + Claude chat narrative handovers + `_CONSUMED/` archive
- **`04-architecture/mockups/interfata-noua/`** = DESIGN MASTER (Pulse, D094 LOCKED — live din 2026-05-29; volt-green/aqua/ember + Space Grotesk/Manrope/Space Mono). `andura-clasic.html` = SUPERSEDED-BY-D094, referinta istorica only
- **`07-meta/karpathy-skills-ref/CLAUDE.md`** §1-§4 = Karpathy 4 principii core philosophy MANDATORY read pre-task tactical
- **`08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md`** = Bugatti gate §0-§11 post-LANDED verification
- **`99-archive/wiki-pre-2026-05-15/`** = FROZEN deep-substance reference on-demand explicit path read only (off-default-search)

### Anti-paternalism absolute

ZERO intermediate review gates pre-Beta (no "run npm dev walkthrough," no "do a local smoke check before X"). Single comprehensive a-z review pre-Beta launch only. Daniel decide când e ready. ZERO sugestie pauză/somn/break/oră.

### Strategy LOCKED V1 active

Port-First-Then-React paradigm split post D015 STRAT PIVOT 2026-05-16 (vanilla legacy retired → React Andura Clasic direct pe `andura-clasic.html`, mockup ulterior SUPERSEDED de Pulse D094) + gym-focused primary + Library 657/657 exercises = 100% LANDED (LOCK 2) + Tier-based personalization T0→T3+ + Pre-Beta FULL strict + Daniel Gates 100% + Bugatti audit nuclear pre-Launch. Engines pipeline 8/8 + MMI Engine #9 LANDED (LOCK 10).

### Testing baseline

Local Vitest + jsdom = fast isolated (~4290+ PASS post Phase 5/6/7). E2E Playwright = live `andura.app` smoke 4 taburi. Daniel Gates production = real Firebase + PWA + localStorage manual smoke. ZERO `src/` touched în vault meta-tooling.

### Romanian no-diacritics (D-LEGACY-064)

UI strings, tests, commit messages = fără diacritice. Vault docs/decizii = diacritice preserved.

### Skills CC ecosystem

Karpathy 4 principii MANDATORY pre-task tactical. Install Pack 12 LANDED 2026-05-12 + GitNexus 2026-05-13 (see GitNexus section below). Sub-agents via Agent tool pentru parallel research / isolated execution / fresh-eyes audit fără context anchor.

### Push policy (D031 invariant)

`git push` = act conștient Daniel-triggered manual ONLY. Branch can be ahead origin/main N commits — that's fine, NU push automatic. Stop hook auto-push removed `f40ebbc` (anti-recurrence b1bd099 mass-delete propagation).

### SSOT auto-sync (Andura vault — no explicit prompt needed)

Daniel prompt implies vault state change → update these automatically pentru SSOT consistency, even fără explicit "update X" instruction:

- **`DECISIONS.md`** → append LOCKED V1 entry pentru decizii noi strategic (NEVER re-open existing per D007 supersede rule literal match)
- **`ANDURA_PRIMER.md` §5 "Unde am rămas"** → 1 line micro-append pentru substantial state change (phase/iter LANDED, milestone, paradigm shift, design phase completion)
- **`📤_outbox/LATEST.md`** → CC autonomous task report state când CC completes work
- **`CHAT_STATE.md`** → live Claude chat continuity post substantive exchange (auto-update per Q&A round sau explicit "update CHAT_STATE" trigger)
- **Frontmatter sync** (e.g., DECISIONS.md `latest_entry` + `total_entries`) când append decizie nouă

**Verify-first protocol (anti-hallucination per regula #1):**
- Read current SSOT file state via filesystem BEFORE editing (anti-stale-baseline)
- Confirm state change is REAL via vault read sau git verify (NU conversational mention)
- IF Daniel mentions speculative/uncertain state (NU LANDED) → defer + ask

**Each SSOT update = separate atomic Bugatti single-concern commit.** NU push (D031 invariant). NU bundle cu unrelated work.

**Anti-overreach lesson** (chat 1 HANDOVER §5 2026-05-20): NU edit `DECISIONS.md` + `LATEST.md` + `PRIMER.md` concurrent cu unrelated execution work BEFORE verify state change real LANDED. Aggregate scribe at handover end-of-chat (§F3.8), NU per-message overreach.

---

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **andura** (15995 symbols, 20055 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/andura/context` | Codebase overview, check index freshness |
| `gitnexus://repo/andura/clusters` | All functional areas |
| `gitnexus://repo/andura/processes` | All execution flows |
| `gitnexus://repo/andura/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
