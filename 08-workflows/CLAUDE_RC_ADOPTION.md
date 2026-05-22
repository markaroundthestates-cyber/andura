# CLAUDE RC ADOPTION

**Owner:** Daniel (CEO + Product) · Co-CTO Claude chat
**Status:** DEFERRED — Daniel hybrid workflow §F3.13 preferred
**Locked:** 2026-05-22 (Iter 1 Mass Fix V2 audit cluster KAPPA §49-H1)
**Cross-ref:** PROJECT_VISION (workflow context), CLAUDE.md §F3.8 handover

---

## §1 Scop

Document Daniel decision on claude rc (Remote Control) workflow adoption
post-Feb 2026 Max plan release. Status: DEFERRED — Daniel current hybrid
workflow §F3.13 (Claude chat + CC Opus terminal + Obsidian vault MCP)
preferred over claude rc cloud routine.

---

## §2 Context

- **Feb 2026:** Anthropic released claude rc Remote Control feature for
  Max plan subscribers. Enables headless remote agent execution via
  scheduled cron routines.
- **Daniel plan:** Max subscriber, eligible.
- **Workflow current:** §F3.13 hybrid — Claude chat (strategic + Q&A) +
  CC Opus terminal (autonomous batch coding, dangerously-skip-permissions
  mode) + Obsidian vault MCP (SSOT + decisions).

---

## §3 Decizie LOCKED V1 (Co-CTO 2026-05-22)

**Adopt status:** NU adopt pre-Beta. Continuam §F3.13 hybrid.

**Justificare:**

1. **Workflow current proven** — §F3.13 hybrid delivered ~659 LOCKED V1
   decisions + ~46 Wave A commits overnight + Phase 3-7 + Iter 1-9.6
   LANDED. Replacement risk pre-Beta = unwarranted.
2. **claude rc scheduled cron** = useful pentru recurring routines (PR
   monitoring, audit cron, etc.) DAR Andura is bootstrap solo Daniel —
   NOT recurring background work necessary pre-Beta.
3. **Iter 1 Mass Fix V2 in flight** — 14-agent storm + audit + Wave C
   parity + D049 race-mitigation = high-intensity tactical execution.
   Switch workflow mid-iter = risk + zero gain.
4. **Post-Beta consideration** — daca rutina post-Beta surface (e.g.,
   daily user-data backup verify, weekly Sentry alert review, monthly
   dep audit), atunci claude rc cron job natural fit. Re-evaluate
   atunci.

---

## §4 Daniel hybrid §F3.13 components

- **Claude chat acasa** — Strategic + Q&A + decisions + handover narrative
  scribe. MCP filesystem + Obsidian primary truth-source.
- **CC Opus terminal** — Autonomous batch coding, raport
  `📤_outbox/LATEST.md`. Model Opus EXCLUSIVELY (Sonnet retired permanent
  2026-05-03). Startup `claude --dangerously-skip-permissions`.
- **Obsidian vault** — SSOT singular live. DECISIONS.md append-only.
  ANDURA_PRIMER.md §1-§8 onboarding. CHAT_STATE.md conversation
  continuity.
- **Subagents (gsd-* via Skill tool)** — Parallel research / isolated
  execution / fresh-eyes audit. 20+ agents available, Daniel discretion.
- **GitNexus MCP** — Impact analysis pre-edit, code intelligence, blast
  radius pre-commit.

---

## §5 Possible post-Beta adoption scenarios

### §5.1 Scenario A — Daily backup verify routine

- claude rc job: nightly run script `npm run test-restore:dry` + Sentry
  alert query + report to Daniel inbox if anomaly.
- Trigger: post-Beta Daniel on-call cycle setup.

### §5.2 Scenario B — Weekly Sentry alert review

- claude rc job: weekly aggregate Sentry HIGH severity errors → produce
  triage report → Daniel review batch.
- Trigger: post-Beta initial Sentry-wire reliability data.

### §5.3 Scenario C — Monthly dep audit + upgrade ratchet

- claude rc job: monthly run `npm outdated` + propose minor bumps + run
  test suite → if green, auto-commit + Daniel notify.
- Trigger: post-Beta stability + bandwidth Daniel review cadence.

### §5.4 Anti-scenarios — NU adopt claude rc pentru

- Tactical mid-feature work (manual hybrid §F3.13 superior)
- Cross-session continuity (CHAT_STATE.md superior for context)
- Strategic decisions (Daniel CEO inherently NOT delegate-able)
- Vault SSOT edits (claude rc lacks Obsidian MCP precedence)

---

## §6 Re-evaluation trigger

Daniel manual trigger "evaluate claude rc adoption" OR:
- Beta launch milestone hit (1 month stable)
- Recurring background task identified (3+ instances)
- claude rc feature gap closed (Obsidian MCP support, IF Anthropic adds)

---

## §7 Cross-ref

- **§49-H1 audit:** source finding pentru this doc
- **CLAUDE.md §F3.8 handover protocol:** current workflow proof of work
- **MEMORY.md `feedback_autonomous_continuous.md`:** continuous mode
  Co-CTO until Daniel STOP — claude rc cron alternativa pentru
  background-only

---

## §8 Audit chain

- Daniel trigger re-eval → update §3 decision + DECISIONS.md LOCKED V1 entry
- claude rc adopted → migrate §5.x scenarios + new ADR + update §F3.13
- Continued §F3.13 hybrid → annual review cadence post-Launch
