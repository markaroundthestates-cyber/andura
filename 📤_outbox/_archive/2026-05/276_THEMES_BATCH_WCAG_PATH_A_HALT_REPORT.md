# LATEST — WCAG v4 Cross-Skin `--line` Split — **HALTED Task 3 Phase 1 (pre-flight)**

**Task:** Cross-skin `--line` architectural split — Luxury 27 + Clasic 49 classify + refactor interactive→`--line-strong`
**Model:** Opus 4.7
**Status:** ⛔ HALTED Phase 1 (anti-hallucination grep detected pre-existing critical bug in v2 commit `dfa3bbd`)
**Date:** 2026-05-10
**Decision needed:** Daniel — remediation path for circular CSS var refs introduced by v2 Path 2a Clasic `:root` lift
**Orchestrator:** STOPPED — Tasks 4 (BC ink-4 line) + 5 (LB :root lift) + consolidated NOT executed per fail-stop rule

---

## CRITICAL FINDING — v2 dfa3bbd introduced circular CSS var refs in Clasic `:root`

The v2 Path 2a Clasic `:root` lift commit (dfa3bbd, "Bulk replace_all 6 hex → var(--TOK) systematic 385 swaps") executed the `replace_all` over the **entire file** — including the `:root` declaration block itself. This produced **5 circular CSS variable references** that resolve to the CSS "guaranteed-invalid value" per spec.

### Current state of `04-architecture/mockups/andura-clasic.html` lines 47-55

```css
:root {
    --paper: var(--paper);     /* ⛔ CIRCULAR — was #faf7f1 */
    --paper-2: var(--paper-2); /* ⛔ CIRCULAR — was #f3ede1 */
    --ink: var(--ink);         /* ⛔ CIRCULAR — was #1a1815 */
    --ink-2: var(--ink-2);     /* ⛔ CIRCULAR — was #3a342d */
    --ink-3: #6e6862;          /* ✅ OK (new hex distinct from replaced #8a8278) */
    --line: var(--line);       /* ⛔ CIRCULAR — was #e7e0d0 */
    --brick: #c8412e;          /* ✅ OK (excluded from bulk replace list) */
}
```

### Root cause

The v2 commit message states:
> "Bulk replace_all 6 hex → var(--TOK) systematic (385 swaps total: 137+57+106+49+18+18)"

The 6 hex values replaced were: `#1a1815`, `#3a342d`, `#8a8278` (→ `#6e6862`), `#e7e0d0`, `#faf7f1`, `#f3ede1`. The `replace_all` matched the hex values **inside the `:root` block itself**, where they had just been inserted — so `--paper: #faf7f1;` became `--paper: var(--paper);`, etc.

`#6e6862` (--ink-3 NEW) and `#c8412e` (--brick) survived because they were NOT in the replace list (they were the substitution targets / a Clasic-specific accent never replaced).

### Visual impact (browser CSS resolution per spec)

Per CSS Custom Properties Level 1 §3.4: a custom property whose computed value contains itself resolves to the **guaranteed-invalid value**. Properties consuming `var(--paper)`, `var(--paper-2)`, `var(--ink)`, `var(--ink-2)`, `var(--line)` then fall back to:
- `background: var(--paper)` → property initial value `transparent` (phone background lost)
- `color: var(--ink)` → typically `canvastext` (text color lost / inherited)
- `border: 1px solid var(--line)` → `currentcolor` (borders inherit text color, NOT the cream divider)

**Net effect:** Clasic mockup is currently visually broken — backgrounds transparent, ink/border colors falling through to inherited values. Tests pass (2731) because they do NOT verify browser-rendered CSS variable resolution.

### Tests-pass illusion

The cumulative WCAG batch ledger (cc98b46 + b439530 + dfa3bbd) reports "Tests 2731 PASS preserved EXACT" each time. This remained true post-v2 because Vitest unit tests assert engine logic / business rules — **not browser CSS variable resolution in mockups**. The bug slipped through CI gates entirely.

---

## PRE-FLIGHT GREP RESULTS (Phase 1 deliverable, partial — Task 3 baseline classification)

### Luxury — `var(--line)` count: **27** ✅ matches v3 LATEST baseline

Existing `--line-strong` usage: **8** (real hex `#6e5a2a` 3.15:1 PASS — healthy from v3 commit b439530).

Luxury `:root` (lines 11-31): **HEALTHY** — all 12 tokens have real hex / rgba values. No circular refs.

### Clasic — `var(--line)` count: **49** ✅ matches v2 LATEST baseline

Existing `--line-strong` usage: **0** (Task 3 was supposed to introduce this token).

Clasic `:root` (lines 47-55): **BROKEN** — 5 of 7 tokens are circular self-references (see above).

Pre-flight grep counts match v3/v2 LATEST baselines exactly — no file drift on usage counts. The drift is in token VALUES at the `:root` block.

---

## DELIVERABLES — NOT EXECUTED

Per HALT, the following Task 3 deliverables were NOT executed:

- ❌ Phase 2 token design (Clasic `--line-strong` candidate hex table) — would have introduced new token next to broken siblings
- ❌ Phase 3 LAND (Luxury 14 interactive refactor + Clasic interactive refactor + token insertion)
- ❌ Backup tag `pre-themes-batch-wcag-line-split-cross-skin-2026-05-10-<HHMM>`
- ❌ Commit `WCAG v4 cross-skin --line architectural split: ...`
- ❌ Push origin
- ❌ Archive precedent LATEST → `📤_outbox/_archive/2026-05/275_THEMES_BATCH_WCAG_CLASIC_PATH2A.md`

**Working tree:** clean. Files NOT modified. v2 LATEST.md content preserved in git: `git show 0a9dcfa:📤_outbox/LATEST.md`.

---

## DECISION NEEDED — DANIEL

Three remediation paths:

### Option A — Hotfix v2 first as separate commit, then re-run orchestrator

Create dedicated `WCAG v2-hotfix` commit fixing the 5 circular refs in Clasic `:root` (substitute back the literal hex values), push, then orchestrator re-runs Task 3 fresh on healthy foundation.

- ✅ Cleanest separation of concerns (hotfix isolated from new work)
- ✅ Clean git history per WCAG batch
- ⏱ +5 min hotfix wall time before orchestrator resumes
- ⚠ Requires re-running Task 3 from Phase 1 (negligible cost, all pre-flight already done here)

### Option B — Bundle hotfix INTO Task 3 commit (extends scope)

Single commit `WCAG v4 cross-skin --line architectural split + v2 hotfix Clasic :root circular refs` covering both fixes.

- ✅ Single commit closes WCAG batch v4 cleanly + fixes upstream defect
- ⚠ Scope creep — commit now covers two distinct issues (architectural split + bug fix)
- ⚠ Departs from one-batch-one-commit precedent established v1+v2+v3

### Option C — Revert v2 `dfa3bbd` entirely + re-do v2 properly + new v4

Revert dfa3bbd (force-push or revert commit), redo v2 with correct `:root` literal hex (no circular refs), then proceed Task 3.

- ✅ Cleanest historical record (no buggy commit in main)
- ⚠ Force-push to main (DESTRUCTIVE — Daniel preference verify against)
- ⚠ Re-runs entire v2 work (~30 min wall time)
- ⚠ Outbox LATEST + archive 274 already reference v2 — would need updates

**Recommended: Option A** (hotfix first, then orchestrator). Smallest blast radius, cleanest separation, preserves git history, minimal wall time.

---

## NEXT ACTION — DANIEL

Pick A / B / C → reply with decision. Orchestrator will resume Task 3 fresh once Clasic `:root` is healthy. Tasks 4 + 5 + consolidated remain queued but NOT touched.

---

## CONTEXT NOTES

- Anti-hallucination grep saved the day (3rd time per memory `feedback_grep_before_prompt_cc.md`). The HALT was triggered DURING Phase 1 pre-flight, BEFORE any file modifications — exactly the design intent.
- Cumulative LOCKED V1 ~707-709 PRESERVED (zero file changes this session).
- No backup tags created, no commits, no push — working tree clean.
- v2 LATEST.md content overwritten by this HALT report. Original recoverable: `git show 0a9dcfa:"📤_outbox/LATEST.md"`.
