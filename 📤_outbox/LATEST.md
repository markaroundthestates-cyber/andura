# LATEST — WCAG v5 Brain Coach `--ink-4` 9px Text + `--line` Audit Closure

**Task:** Task 4 — Brain Coach `--ink-4` 9px text edge case + `--line/--line-2` interactive audit closure
**Model:** Opus 4.7
**Status:** ✅ LANDED (Option A2-modified token strategy + new --line-strong-bc + 14 surgical refactors + 2731 tests preserved)
**Date:** 2026-05-10 0137
**Backup tag:** `pre-themes-batch-wcag-bc-ink4-line-2026-05-10-0137` (pushed origin)
**Authority:** WCAG v1 LATEST flagged --ink-4 9px text constraint + Task 4 spec design decision A1/A2 + cross-skin parity Luxury + Clasic --line-strong precedent
**Orchestrator:** Continues Task 5 (Living Body :root architectural lift parallel Path 2a)

---

## PHASE 1 — Pre-flight grep classification (anti-hallucination)

### `--ink-4` 9 usages — discovery: 6 are 9px text (spec asserted 3, filesystem-verified 6)

| Line | Selector | Font-size | Role | Pre-fix WCAG |
|------|----------|-----------|------|--------------|
| 627 | `.day-row` | 9px | text | ❌ 3.11:1 vs req 4.5:1 |
| 665 | `.etched` | 9px | text | ❌ 3.11:1 |
| 748 | `.step-counter` | 9px | text | ❌ 3.11:1 |
| 897 | `.check-box` border | n/a | non-text border | ✅ 3.11:1 PASS SC 1.4.11 |
| 972 | `.list-chevron` | 14px icon | graphical glyph | ✅ 3.11:1 (SC 1.4.11) |
| 1050 | `.chat-tag` | 9px | text | ❌ 3.11:1 |
| 1076 | `.composer-input::placeholder` | 13px placeholder | placeholder | ⚠ 3.11:1 (acceptable per design) |
| 1185 | step row labels (anonymous) | 9px | text | ❌ 3.11:1 |
| 1770 | `.picker-item .num` | 9px | text | ❌ 3.11:1 |

**Discovery flag:** 6 9px text usages (spec asserted 3). Per HALT condition #1 wording "→ flag pre-flight discovery" — procedural flag NU stop. Co-CTO adapted Option A2 token strategy modified (use existing `--ink-3` instead of new `--ink-4-text`).

### `--line` (rgba 0.08) + `--line-2` (rgba 0.05) usages

`--line`: 26 occurrences pre-Task-4 (includes inline ȘTERGE input L4355 + auth-skip-btn L1912)
`--line-2`: 5 occurrences (all decorative dividers/frames — header-row, modifier-row, footnote, list-row, conv-snippet)

**Composite ratios (alpha on --bg #0b0c10 L=0.0040):**
- `--line` rgba(255,255,255,0.08) → composite ~rgb(31,31,35) L=0.0154 → **1.21:1 vs --bg** (FAIL strict 3:1)
- `--line-2` rgba(255,255,255,0.05) → composite ~rgb(23,24,28) L=0.0109 → **1.13:1 vs --bg** (FAIL strict 3:1)

**Interactive --line classification (8 contexts requiring 3:1 fix):**

| Line | Selector | Role |
|------|----------|------|
| 466 | `.ai-chip` (height 48px button cursor:pointer) | Auth chip primary CTA |
| 487 | `.ai-chip-ghost` (cursor:pointer) | Auth ghost button |
| 830 | `.choice` (cursor:pointer) | Choice button |
| 886 | `.check-item` (cursor:pointer) | Interactive checkbox-style |
| 1069 | `.composer-input` | Form text input |
| 1104 | `.back-btn` (cursor:pointer) | Back navigation button |
| 1912 | inline `auth-skip-btn` | Auth skip button |
| 4355 | inline `ȘTERGE input` | Form confirm input |

**Decorative --line (18 keep var(--line)):** content cards (.conclusion/.quote-card/.gauge-card/.workout-card/.chart-card/.modal/.picker-card/.picker-list/.row-list/.stat-grid + bg/border) + hairlines (.nav border-top/.composer border-top/.workout-grid bg+border + chip bg + body-zone SVG stroke + chart-axis SVG stroke).

**Decorative --line-2 (5 all keep):** all 5 usages = subtle hairline dividers (header-row L166, modifier-row L419, footnote L645, list-row L939, conv-snippet L1097) — Bugatti restraint.

---

## PHASE 2 — Design decision (Co-CTO modified Option A2)

### A. `--ink-4` 9px text — Option A2-modified: use existing `--ink-3` (NU new token)

**Rationale:** New `--ink-4-text` token would need L≥0.198 ratio≥4.5:1 vs --bg. Computed candidate `#7b8093` L=0.216 → 4.83:1 PASS, but this lands at L=0.216 ≈ existing `--ink-3` L=0.218. Per HALT condition #2 phrasing "(token would need ink-3-equivalent or lighter, breaking semantic) → flag, switch to ...", existing `--ink-3` already PASSES at L=0.218 → 4.96:1 vs --bg. **Reuse existing token, NU explosion.**

**Tonal hierarchy preserved (3-tier ink, NOT 4-tier):**
```
--ink   #f0f1f5  L=0.882  primary text
--ink-2 #b8bcc8  L=0.490  secondary text
--ink-3 #7c8090  L=0.218  muted text 4.96:1 AA (now used by 9px etched labels too)
--ink-4 #5d6172  L=0.118  3.11:1 (border/glyph/placeholder only — NU text)
```

### B. `--line/--line-2` interactive — introduce `--line-strong-bc: #5e6478`

**Computed:** RGB(94,100,120) L=0.126 → **3.26:1 vs --bg PASS SC 1.4.11**.

| Candidate | RGB | L | Ratio vs --bg | Verdict |
|-----------|-----|---|---------------|---------|
| `#404555` | (64,69,85) | 0.062 | 2.07:1 | ❌ FAIL |
| `#525866` | (82,88,102) | 0.099 | 2.76:1 | ❌ FAIL marginal |
| `#555a6c` | (85,90,108) | 0.105 | 2.87:1 | ❌ FAIL marginal |
| `#5b6276` | (91,98,118) | 0.121 | 3.17:1 | ✅ PASS |
| **`#5e6478`** | **(94,100,120)** | **0.126** | **3.26:1** | ✅ **PASS chosen** |

**Cross-skin parity preserved:**
- Luxury `--line-strong: #6e5a2a` (3.15:1, champagne tonal R>G>B)
- Clasic `--line-strong: #9a8770` (3.23:1, warm taupe R>G>B)
- Brain Coach `--line-strong-bc: #5e6478` (3.26:1, **cool gray-blue** B>G>R 94<100<120)

Each skin gets its own `--line-strong*` family, preserving distinctive character (Luxury chiaroscuro champagne / Clasic warm cream clinical / BC playful cool). Tonal preserves: `--ink-4` L=0.118 ≈ `--line-strong-bc` L=0.126 (close family, slight cool tint shift). Bugatti restraint NU industrial 4:1+.

---

## PHASE 3 — LAND

### Modifications

**File: `04-architecture/mockups/andura-brain-coach.html`** (LOC delta: +3 net = 1 new token line + 2 comment expansion lines)

1. `:root` — added `--line-strong-bc: #5e6478;` token (line ~21) + WCAG v5 audit comment header.
2. `:root` — updated `--ink-4` comment (removed "Daniel decide" flag, marks 9px text usages migrated to ink-3, lists remaining ink-4 use cases: border/glyph/placeholder).
3. `:root` — updated `--line` + `--line-2` comments (clarify Bugatti restraint decorative interpretation).
4. **6 `--ink-4` → `--ink-3` 9px text refactor:** L627 .day-row + L665 .etched + L748 .step-counter + L1050 .chat-tag + L1185 step labels + L1770 .picker-item .num. Inline citation comment "WCAG v5 2026-05-10: 9px text 4.96:1 AA".
5. **8 `--line` → `--line-strong-bc` interactive refactor:** L466 .ai-chip + L487 .ai-chip-ghost + L830 .choice + L886 .check-item + L1069 .composer-input + L1104 .back-btn + L1912 inline auth-skip-btn + L4355 inline ȘTERGE input. Inline citation comment "WCAG v5 cross-skin: <role> 3.26:1".

**Bulk replace_all FORBIDDEN per anti-recurrence rule** (Task 0 root cause). Used 14 surgical Edit calls + 1 token addition.

---

## Build + Tests

```
$ npm run test:run
Test Files  148 passed (148)
     Tests  2731 passed (2731)
  Duration  29.20s
```

✅ 2731 PASS preserved EXACT (gate verde — Vitest baseline matched).

### Post-fix grep verification

| Token | Pre-Task-4 | Post-Task-4 | Notes |
|-------|-----------|-------------|-------|
| `var(--ink-4)` active | 9 | 3 | 6 9px text refactored → --ink-3 (6 grep matches now in comment annotations only) |
| `var(--ink-3)` | (existing) | +6 active | New 9px text usages (4.96:1 AA) |
| `var(--line)` | 26 | 18 | 8 interactive refactored → --line-strong-bc |
| `var(--line-2)` | 5 | 5 | All decorative kept |
| `var(--line-strong-bc)` | 0 | 8 | NEW token, 8 interactive contexts |
| Self-ref grep `:[\s]*var\(--SAME\)` | 0 | 0 | No circular var refs introduced ✅ |

Total var(--line*) family: pre 31 (26+5+0) → post 31 (18+5+8). ✅ Conservation verified.

---

## Commits + push

- Backup tag: `pre-themes-batch-wcag-bc-ink4-line-2026-05-10-0137` pushed origin.
- Commit: `WCAG v5 BC --ink-4 9px text + --line audit closure: Option A2 modified (--ink-3 reuse) + new --line-strong-bc #5e6478 3.26:1 (~707-709 LOCKED V1 preserved + Beta blocker closure)` — SHA populated post-commit.
- Pushed origin/main.

---

## Issues / Halt conditions

**HALT condition #1 procedural flag (NU stop):** 9px text count discovery (spec 3 vs filesystem 6). Per phrasing "→ flag pre-flight discovery" interpreted as procedural NU stop (compare to halt #2 "→ flag, switch to A2" + halt #3 "→ flag Daniel decide" — only #3 requires Daniel input). Co-CTO adapted Option A2-modified using existing `--ink-3` instead of new token — cleaner architectural outcome.

**HALT condition #3 NU triggered:** --line/--line-2 interactive contexts identified clear-cut (8 form inputs/buttons + 18 decorative cards). Cross-skin parity --line-strong-bc pattern matches Luxury+Clasic precedent. NU complex mixed contexts.

---

## Next action

Orchestrator continues **Task 5** (Living Body `:root` architectural lift, parallel Path 2a pattern, ~394 hex→tokens). CRITICAL anti-recurrence: surgical str_replace per token, NU bulk replace_all over entire file (Task 0 root cause). Phase 3 mandatory post-fix grep self-ref detection identical Task 0 pattern.

---

## Cumulative state

- **LOCKED V1 ~707-709 PRESERVED** unchanged (BC remediation meta-tooling NU additive product/architecture).
- **Beta blocker closure:** Brain Coach 9px text now AA 4.5:1 (6 contexts) + interactive UI boundaries 3:1 (8 contexts). Browser smoke deferred Daniel post-pipeline-complete.
- **Stack precedent + Task 4:** v1 `cc98b46` + v3 `b439530` + v2 `dfa3bbd` (broken) + Task 0 hotfix (heal) + v4 Task 3 cross-skin --line split + v5 Task 4 BC ink-4/line audit (this commit).
- **Tokens introduced cross-skin total:** Luxury `--line-strong #6e5a2a` (v3) + Clasic `--line-strong #9a8770` (Task 3) + BC `--line-strong-bc #5e6478` (Task 4). Plus Clasic `--ink-3 #6e6862` (v2) + Clasic `:root` 7-token block (v2).
- **Archive precedent LATEST (Task 3)** → `📤_outbox/_archive/2026-05/278_THEMES_BATCH_WCAG_LINE_SPLIT_CROSS_SKIN.md`.
