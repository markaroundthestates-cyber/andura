# LATEST — WCAG v2-hotfix Clasic `:root` 5 Circular Var Refs Literal Hex Restore

**Task:** Task 0 — Path A hotfix Clasic `:root` 5 circular CSS var refs (introduced by v2 dfa3bbd bulk replace_all hitting :root declarations)
**Model:** Opus 4.7
**Status:** ✅ LANDED (5 surgical str_replace literal hex restore + 0 circular refs post-fix + 2731 tests preserved)
**Date:** 2026-05-10 0118
**Backup tag:** `pre-hotfix-clasic-circular-refs-v2-2026-05-10-0118` (pushed origin)
**Authority:** Daniel Path A decision post HALT report 2026-05-10 chat ACASĂ — Co-CTO recommended hotfix v2 separat NU bundle scope creep NU revert destructiv
**Orchestrator:** Continues Task 3 fresh on healthy Clasic foundation

---

## PHASE 1 — Pre-flight grep (anti-hallucination)

### Self-ref detection grep pre-fix → 5 matches expected

```
$ grep -nE '--(paper|paper-2|ink|ink-2|line):\s*var\(--' 04-architecture/mockups/andura-clasic.html
48:    --paper: var(--paper);     /* Phone bg cream primary L=0.930 (light theme inverse polarity) */
49:    --paper-2: var(--paper-2);   /* Secondary surface cream variant L≈0.855 */
50:    --ink: var(--ink);       /* Primary text dark L=0.0042 → 17.94:1 vs paper ✅ AAA */
51:    --ink-2: var(--ink-2);     /* Secondary text L=0.0347 → 11.57:1 vs paper ✅ AAA */
53:    --line: var(--line);      /* Decorative border on cream — 1.23:1 vs paper (DEFER strict 3:1...) */
```

✅ Match HALT report state EXACTLY: 5 circular self-refs at lines 48/49/50/51/53.

### Clean tokens preserved (excluded from bulk replace_all v2)

```
52:    --ink-3: #6e6862;     /* Muted text L=0.141 → 5.13:1 vs paper ✅ AA */
54:    --brick: #c8412e;     /* Accent brick red Clasic signature */
```

✅ `--ink-3 #6e6862` (NEW value distinct from replaced `#8a8278`) + `--brick #c8412e` (Clasic-specific accent NU în replace list) intact.

---

## PHASE 2 — LAND (5 surgical str_replace exact strings)

### Modifications

File: `04-architecture/mockups/andura-clasic.html`

| Line | Before | After |
|------|--------|-------|
| 48 | `    --paper: var(--paper);` | `    --paper: #faf7f1;` |
| 49 | `    --paper-2: var(--paper-2);` | `    --paper-2: #f3ede1;` |
| 50 | `    --ink: var(--ink);` | `    --ink: #1a1815;` |
| 51 | `    --ink-2: var(--ink-2);` | `    --ink-2: #3a342d;` |
| 53 | `    --line: var(--line);` | `    --line: #e7e0d0;` |

LOC delta: 0 net (5 lines modified in-place, comments preserved verbatim).

**Bulk replace_all FORBIDDEN per anti-recurrence rule** (v2 slip cause). Used 5× surgical Edit `replace_all=false` with exact unique strings.

---

## PHASE 3 — Post-fix verification (POST_BULK_REPLACE_VERIFICATION V1)

### Self-ref detection grep post-fix → 0 matches expected

```
$ grep -nE '--(paper|paper-2|ink|ink-2|line):\s*var\(--' 04-architecture/mockups/andura-clasic.html
(no output)
```

✅ Zero circular self-refs remaining.

### `:root` block verbatim post-fix (lines 47-55)

```css
:root {
    --paper: #faf7f1;     /* Phone bg cream primary L=0.930 (light theme inverse polarity) */
    --paper-2: #f3ede1;   /* Secondary surface cream variant L≈0.855 */
    --ink: #1a1815;       /* Primary text dark L=0.0042 → 17.94:1 vs paper ✅ AAA */
    --ink-2: #3a342d;     /* Secondary text L=0.0347 → 11.57:1 vs paper ✅ AAA */
    --ink-3: #6e6862;     /* Muted text L=0.141 → 5.13:1 vs paper ✅ AA */
    --line: #e7e0d0;      /* Decorative border on cream — 1.23:1 vs paper */
    --brick: #c8412e;     /* Accent brick red Clasic signature */
}
```

✅ All 7 tokens have literal hex values. Tonal hierarchy preserved.

---

## Build + Tests

```
$ npm run test:run
Test Files  148 passed (148)
     Tests  2731 passed (2731)
  Duration  29.49s
```

✅ 2731 PASS preserved EXACT (gate verde — Vitest baseline matched). Browser smoke deferred Daniel separate post-LANDED full pipeline.

---

## Commits + push

- Backup tag: `pre-hotfix-clasic-circular-refs-v2-2026-05-10-0118` pushed origin (rollback safety).
- Commit: `WCAG v2-hotfix Clasic :root 5 circular var refs literal hex restore (~707-709 LOCKED V1 preserved + Beta blocker partial closure)` — SHA populated post-commit.
- Pushed origin/main.

---

## Issues / Halt conditions

None. Phase 1 grep matched expected state exactly (5 circular + 2 clean). Phase 2 5/5 str_replace successful (unique strings). Phase 3 verification clean (0 self-refs + 7 literal hex tokens + 2731 PASS).

Anti-recurrence rule **POST_BULK_REPLACE_VERIFICATION V1** applied: post-fix self-ref grep mandatory + tests gate. Future bulk operations cross-skin must pass identical verification (Task 5 LB :root lift critical).

---

## Next action

Orchestrator continues **Task 3** (cross-skin --line architectural split Luxury 27 + Clasic 49) on healthy Clasic foundation. Sequential fail-stop atomic per orchestrator spec.

---

## Cumulative state

- **LOCKED V1 ~707-709 PRESERVED** unchanged (hotfix meta-tooling NU additive product/architecture).
- **Beta blocker partial closure:** Clasic browser CSS resolution restored. Tests Vitest gate preserved EXACT 2731 PASS. Browser smoke deferred Daniel post-pipeline-complete.
- **Stack precedent + Task 0:** v1 `cc98b46` + v3 `b439530` + v2 `dfa3bbd` (broken) + Task 0 hotfix (this commit, healing).
- **Archive precedent LATEST (HALT report)** → `📤_outbox/_archive/2026-05/276_THEMES_BATCH_WCAG_PATH_A_HALT_REPORT.md`.
