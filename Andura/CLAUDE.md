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

> 🛑 **STOP. Read [[DECISIONS.md]] instead. Historical Faza 3 reference only.**
>
> Schema body GUT 2026-05-16 — current SSOT is `DECISIONS.md` root §D001. Wiki/ FROZEN imutabilă archived `99-archive/wiki-pre-2026-05-15/`. Karpathy 4 principii core philosophy: [[07-meta/karpathy-skills-ref/CLAUDE.md]] §1-§4. Prior body preserved în backup tag `pre-claude-md-gut-2026-05-16-1200` origin.

---

## Current authority pointers

- **SSOT operations + decizii:** [[DECISIONS.md]] §D001 root (singular reglaj Daniel CEO directive 2026-05-15).
- **Onboarding chat NEW:** [[ANDURA_PRIMER.md]] §3 (wiki archived + DECISIONS.md authoritative post-reglaj).
- **Karpathy philosophy core:** [[07-meta/karpathy-skills-ref/CLAUDE.md]] §1-§4 (Think Before Coding + Simplicity First + Surgical Changes + Goal-Driven Execution).
- **Prior body archive:** git tag `pre-claude-md-gut-2026-05-16-1200` (Karpathy Real Option B §0-§7 ~32KB historical reference only).

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
