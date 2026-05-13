# LATEST — Calendar V1 S3 HALT + Handover for Prompt Redo (§AR.20 Quadruple Violation) 🦫

**Task:** Calendar V1 Slice 3 Production Wiring (S3.A → S3.E spec) — HALTED pre-edit per §AR.20 RECURRENCE STRONG pre-flight grep mandatory rule (codified in this chat's `/wiki-ingest` handover §31 ~hours ago). PROMPT CC S3 contains **4 simultaneous spec/reality mismatches** across all slices.
**Model:** Opus EXCLUSIVELY per CEO directive verbatim.
**Status:** ⏸️ **HALTED CLEAN** — backup tag pushed pre-execute, **ZERO `src/` touched**, tests 2984 PASS preserved EXACT, no commits to revert. Recommended next: Daniel rewrite PROMPT CC S3 with grep evidence per slice.
**Branch:** `feature/v2-vanilla-port` (no advancement post commit `aa89602` S2 raport).
**Date:** 2026-05-13 10:50 Co-CTO autonomous via metoda hibridă chat ↔ CC terminal LOCKED V1 2026-05-12 §F3.13.
**Pre-flight tag pushed origin:** `pre-calendar-v1-s3-production-wiring-2026-05-13`

---

## §0 — Why halt (§AR.20 STRONG cited explicitly by S3 prompt itself)

PROMPT CC S3 §0 step 7 declares: *"Citation `mockups/andura-clasic.html §<section>` MANDATORY"* and step 5: *"Fail oricare → STOP, raport finding-ul exact, NU continue."* §4 (S3.C) explicit STOP: *"`state.activeSession` field already exists per `src/state.js` (verify line — pre-stubbed contract). Dacă NU există = STOP, raport spec gap."*

Pre-flight grep across all 4 slice premises caught **5 distinct gaps simultaneously** before any edit. Per prompt's own halt-conditions, execution stops here.

This is the recurrence pattern Daniel codified §AR.20 (`wiki/concepts/anti-recurrence-rules.md` §"Chat-Current Slip Patterns 2026-05-13b") in the very `/wiki-ingest` operation that ran ~hours before this S3 prompt was drafted. **§AR.20 was specifically designed to prevent THIS scenario.**

---

## §1 — Spec/reality matrix per slice (verbatim path:reality grep evidence)

### S3.A — Bar chart "CUM AU FOST SESIUNILE" Propunere A

| Prompt assumption | Grep reality | Severity |
|-------------------|--------------|----------|
| Source data `getAllRatings()` din `src/storage.js` | `src/storage.js` **does not exist** as a file. `wc -l src/storage.js` returns "No such file or directory" | HIGH |
| `getSessionsForMonth(year, month)` query helper for calendar | Function name appears **0× in `src/`** (grep `Found 3 files` all in wiki + archive docs, none in code) | HIGH |
| Mockup section §progress | Section title "CUM AU FOST SESIUNILE" found **only in wiki summaries + archived raports**, never in `04-architecture/mockups/andura-clasic.html` itself | MEDIUM |
| Existing 2-row 90-day grid markup to replace | Grep for "90-day grid" / "CUM AU" against mockup returned 0 hits — markup may exist under different name or may not exist | MEDIUM |

**Verdict:** Entire S3.A premise built on imaginary file (`src/storage.js`) + imaginary helpers (`getAllRatings`, `getSessionsForMonth`) + uncertainty whether mockup section even exists. Cannot proceed without Daniel clarifying:
- Where does session rating data actually live? (probably `DB.get('logs')` based on `db.js:3-6` pattern + session.js:108-110 `DB.set('logs', ...)`)
- Is "CUM AU FOST SESIUNILE" a NEW section to design, or a rename of an existing chart? Which mockup section actually hosts it?

### S3.B — Missing equipment combo refactor

| Prompt assumption | Grep reality | Severity |
|-------------------|--------------|----------|
| `src/storage.js` extend `addMissingEquipment / removeMissingEquipment / getMissingEquipmentRegistry()` utils | File `src/storage.js` doesn't exist. Equivalent utils **already implemented in S2.A** at `src/engine/schedule/scheduleAdapter.js`: `toggleMissingEquipment`, `setMissingEquipment`, `getMissingEquipment` | HIGH (creates conflict — would duplicate S2.A) |
| `smartRouting.findAlternative(exerciseId, ctx.meta.missingEquipment)` API | Actual API at `src/engine/smart-routing/alternative-finder.js:14` is `findAlternatives(exerciseName)` — **plural name, single arg, no missingEquipment param.** Test file confirms signature: `findAlternatives('Lat Pulldown')` | HIGH (signature mismatch) |
| `ctx.meta.missingEquipment` field | S2.B integration writes `ctx.equipment.{available,unavailable}` (engine-domain IDs) + `ctx.meta.calendarOverride`. NO `ctx.meta.missingEquipment` field. User-driven list flows via `ctx.equipment.unavailable` post-translation. | MEDIUM (data model misaligned) |
| REMOVE S1.7 single button preview + Cont picker default-checked | Mockup S1.7 single-button + Cont picker exist in `04-architecture/mockups/andura-clasic.html` (verified my own S1.7 commit `de761f5`). But `src/` parity for these UI surfaces is **not yet wired** (S2.C ported only the aparateLipsa modal; drill destinations Cont/General + workout-preview deferred to S3 per S2 raport §10 path forward #1) | MEDIUM (would need NEW src/ wiring before refactor) |

**Verdict:** S3.B partially REVOKES S1.7 + S2.C work, partially extends with new wiring. Coherent intent but spec references wrong file paths + wrong API signature. Cannot proceed without:
- Reusing S2.A scheduleAdapter utils (not creating new src/storage.js)
- Correcting smart-routing API contract or extending it deliberately
- Deciding whether to wire Cont/General + workout-preview drill destinations FIRST (deferred path forward S2 §10 #1) before refactoring the picker pattern

### S3.C — Session guard double-start

| Prompt assumption | Grep reality | Severity |
|-------------------|--------------|----------|
| `state.activeSession` object with `.finishedAt`/`.abandonedAt`/`.id` fields | `src/state.js:5-8` has scalars: `sessActive: false` (boolean) + `sessStart: null` (timestamp) + `sessTimer: null` + `sessLog: []`. NO `activeSession` object | HIGH (data model misaligned) |
| `showWorkoutOverlay(state.activeSession.id)` function | Grep `showWorkoutOverlay` returns **0 matches anywhere in repo**. Session UI shown imperatively via `$('today-screen').style.display='none'; $('session-ui').style.display='block'` (`src/pages/coach/session.js:52-53,70-71`) | HIGH (function doesn't exist) |
| `state.activeSession.finishedAt` / `.abandonedAt` discriminator fields | Actual end signal: `state.sessActive=false` set in `endSession()` line 106. Field `state.earlyStopReason` for abandon reason (line 26 state.js + line 61 session.js). No finishedAt/abandonedAt | MEDIUM (semantically reachable via real fields but rename required) |

**Verdict:** S3.C intent is sound and adaptable, but the prompt code samples would fail to compile against real state shape. Adapt path: guard `if (state.sessActive && state.sessStart)` → ensure DOM session-ui visible + toast feedback.

### S3.D — Bottom-nav HIDE in-session

| Prompt assumption | Grep reality | Severity |
|-------------------|--------------|----------|
| `bottom-nav` CSS class | Grep across `src/` returned 0 matches for `bottom-nav` (only 4 hits, all in `src/engine/warmup/*` for unrelated logic). Bottom-nav exists in mockup HTML but has no `src/` parity yet | HIGH (no src/ infra to toggle) |
| `body.in-session` class toggle pattern | 0 matches in `src/`. New class would need to be introduced | MEDIUM (greenfield addition fine, but spec implies existing surface) |
| `workout overlay z-index 7500` | Pattern matches existing modals (painButton/equipmentSwap/cevaNuMerge use z-index:8000), but specific `workout overlay` element not located by name | MEDIUM (need to identify actual DOM element) |

**Verdict:** S3.D depends on bottom-nav existing in `src/`. Investigation needed: does `index.html` host a bottom-nav element, or is it mockup-only? If mockup-only, the prerequisite (NEW bottom-nav port to `src/`) is much larger than the slice scope describes.

### S3.E — Tactical polish bundle

Not investigated — scope contingent on S3.A-D. Mockup polish references which would need to be located and verified independently.

---

## §2 — Why this matters more than usual

§AR.20 ("PROMPT CC src/ reference verify ADR primary citation MANDATORY ÎNAINTE write") was codified in this very chat session's `/wiki-ingest` handover (`wiki/concepts/anti-recurrence-rules.md` §"Chat-Current Slip Patterns 2026-05-13b"). The S3 prompt drafted **after** that codification still violates the rule on **4 simultaneous fronts**. This is the recurrence-of-the-recurrence-rule scenario the catalog exists to surface.

Memory `feedback_grep_before_prompt_cc.md` already tracks this pattern as a multi-chat recidiva. Each prior occurrence saved us from broken implementation. This one would have been worse: multi-slice cumulative scope means a broken foundation slice cascades into 3+ downstream commits with rework.

---

## §3 — What was preserved (rollback safety net intact)

- ✅ Backup tag `pre-calendar-v1-s3-production-wiring-2026-05-13` **pushed origin**. Rollback target identical to current state (no commits past S2 raport `aa89602`).
- ✅ **ZERO `src/` touched.** No partial implementation to clean up.
- ✅ Tests baseline **2984 PASS preserved EXACT** (verified post-pre-flight via `npm run test:run` — `Test Files 162 passed (162) · Tests 2984 passed (2984)`).
- ✅ No `wiki/` modifications. No `.obsidian/` touched. No `📥_inbox/` writes.
- ✅ Branch `feature/v2-vanilla-port` advanced only via this raport commit (doc-only).

---

## §4 — Recommendation for prompt redo (path forward)

When Daniel drafts PROMPT CC S3 v2, recommended grep evidence per slice **before** writing the spec:

```bash
# S3.A — confirm rating data source + mockup section
grep -rn "DB\.get('logs')\|getLastN\|getAllLogs" src/        # actual rating data
grep -n "CUM AU FOST\|cum-au-fost\|hist-grid" 04-architecture/mockups/andura-clasic.html  # mockup section name

# S3.B — confirm equipment registry already exists via S2.A
grep -n "wv2-missing-equipment\|toggleMissingEquipment" src/engine/schedule/scheduleAdapter.js  # reuse, don't recreate
grep -n "^export function find" src/engine/smart-routing/*.js  # actual API signatures

# S3.C — confirm session state shape
grep -n "sess\|active" src/state.js     # real field names
grep -rn "function startSession\|export.*startSession" src/  # actual entry point
grep -rn "session-ui\|today-screen" src/  # actual DOM toggle pattern

# S3.D — confirm bottom-nav exists in src/
grep -rn "bottom-nav\|bottomNav\|nav-bottom" src/ index.html  # likely NEW infra needed first
```

**Atomic split recommendation per slice after grep-redo:**
- **S3.A bar chart:** likely a single 30-60 LOC change in `src/pages/dashboard.js` or `src/pages/coach.js` + ~10-15 tests. Source data via existing `DB.get('logs')` aggregation (no new src/storage.js needed).
- **S3.B equipment refactor:** EXTEND existing S2.A `scheduleAdapter.js` utils (don't recreate). REUSE S2.B coachContext integration. NEW: per-exercise inline button in workout-preview + Cont picker default-checked state. ADAPT not REPLACE.
- **S3.C session guard:** small surface — 5-line guard at top of `src/pages/coach/session.js:31 startSession()` using real `sessActive` + `sessStart` fields. ~5-8 tests.
- **S3.D bottom-nav hide:** requires PREREQUISITE — confirm whether bottom-nav exists in `index.html` and which class name. If exists, simple `body.in-session` toggle. If not, this is a NEW infra slice (probably larger than described).
- **S3.E polish:** mockup-only or minimal `src/` parity. Defer to last.

**Bandwidth note:** Even with correct specs, S3.A + S3.B + S3.C + S3.D + S3.E is realistically 2-3 chats of CC autonomous work. Splitting into 2-3 prompt batches (e.g., S3.C+S3.D bundle, then S3.A solo, then S3.B refactor) reduces context risk per chat.

---

## §5 — Anti-recurrence slip captured chat-current (potential §AR.21+ candidate)

**Pattern observation:** §AR.20 was codified ~hours before this S3 prompt was drafted. The prompt itself **cites §AR.20** in its §0 pre-flight as MANDATORY. Yet the prompt violates §AR.20 on 4 fronts. This isn't a failure of the rule — it's a meta-pattern about **rule-citation vs rule-enforcement during prompt drafting**.

**Possible §AR.21 codification candidate (deferred for Daniel decision in fresh chat):**

> "PROMPT CC self-cites §AR.20 mandatory grep but spec body still contains non-existent file/function references. Codify: prompts that cite §AR.20 MUST embed `grep` output snippets verbatim as inline evidence per file/function referenced. Mockup-side mental model + wiki narrative ≠ source-of-truth for src/ implementation specs."

This isn't a new pattern — it's §AR.20 unchanged. But the **citation-without-enforcement** is the meta-slip worth surfacing.

---

## §6 — Daniel-isms preserved (verbatim catalog extensible)

No new daniel-isms surfaced this slice (no chat interaction during this halt — Daniel single-message authorized "Halt + handover" via AskUserQuestion). Catalog from S2 + prior handovers unchanged.

---

## §7 — Cross-refs

- [[../wiki/concepts/anti-recurrence-rules]] §"Chat-Current Slip Patterns 2026-05-13b" §AR.20 RECURRENCE STRONG (rule cited by S3 prompt + violated 4× by same prompt)
- [[../wiki/summaries/slip-patterns-history]] §"Chat-Current Slip Patterns 2026-05-13b" (this halt is a §AR.20 catch event — add chronological entry next `/wiki-ingest`)
- [[../wiki/summaries/calendar-v1-s2-production-wiring-milestone-2026-05-13]] §Synthesis path forward S3 (current state: HALTED post-pre-flight, no commits past S2 raport)
- [[../wiki/concepts/calendar-feature-v1-spec]] §S2 LANDED 2026-05-13b (S3 deferred pending prompt redo)
- [[../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §9 pure-function engines (S2 invariant preserved — would have been respected in S3 too via adapt pattern if spec corrected)
- [[../03-decisions/030-adapter-design-pattern]] §D2 thin scope adapters (S2.A pattern reusable for S3.B if spec corrected)
- [[../03-decisions/020-storage-tiering-strategy]] §1.4 Tier 0 active rolling (already wired via S2.A scheduleAdapter — S3.B should reuse not recreate)
- [[../VAULT_RULES]] §F3.12 HARD CONSTRAINTS + §F3.13 metoda hibridă + §AR.PRE_FLIGHT + §AR.20
- [[../📤_outbox/_archive/2026-05/451_LATEST_PREVIOUS_WIKI_INGEST_2026_05_13b_POST_S2_LANDED_CONSUMED]] (precedent imediat wiki-ingest raport archived pre-S3 halt)
- [[../📤_outbox/_archive/2026-05/450_LATEST_PREVIOUS_CALENDAR_V1_S2_PRODUCTION_WIRING_CONSUMED]] (S2 LANDED raport precedent)

---

## §8 — Next action options (Daniel decides fresh chat)

1. **Rewrite PROMPT CC S3 v2** with grep evidence per slice (§4 recommended grep batch) — split into 2-3 smaller prompts if scope large.
2. **Refocus on S3.C + S3.D bundle** as adapted-execute slice (smallest, most isolated) — written with correct field names. Skip S3.A/S3.B/S3.E until separate prompts.
3. **Pivot to different priority:** P2 alternative exhaustion ADR amendment, P3 Identity palette consolidation, Daniel Gates smoke prod `andura.app` post-deploy, Beta launch readiness consolidation (per S2 raport §10 path forward).
4. **Codify §AR.21 meta-pattern** before drafting any next CC prompt — "citation without enforcement" rule strengthens §AR.20 self-evidence requirement.

---

🦫 **Bugatti craft. S3 HALTED CLEAN per §AR.20 quadruple violation. ZERO `src/` touched, tests 2984 preserved EXACT, backup tag pushed pre-execute, no rollback needed. Pattern recognition: rule-citation vs rule-enforcement during prompt drafting = §AR.21 candidate. Path forward awaits Daniel decision in fresh chat — bandwidth conserved by halting before partial implementation cascade.**
