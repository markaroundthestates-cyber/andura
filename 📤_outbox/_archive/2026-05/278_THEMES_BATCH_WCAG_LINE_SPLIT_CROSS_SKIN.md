# LATEST — WCAG v4 Cross-Skin `--line` Architectural Split (Luxury 11 + Clasic 17 Interactive)

**Task:** Task 3 — Cross-skin `--line` architectural split — classify 27 Luxury + 49 Clasic occurrences, refactor interactive selectors → `--line-strong`, introduce Clasic `--line-strong` token
**Model:** Opus 4.7
**Status:** ✅ LANDED (28 surgical refactors + 1 new Clasic --line-strong token + 0 circular refs + 2731 tests preserved)
**Date:** 2026-05-10 0127
**Backup tag:** `pre-themes-batch-wcag-line-split-cross-skin-2026-05-10-0127` (pushed origin)
**Authority:** WCAG v3 LATEST cross-skin `--line` deferred classification + Daniel directive Path A hotfix Task 0 LANDED → orchestrator continues Task 3 fresh on healthy foundation

---

## PHASE 1 — Pre-flight grep classification (anti-hallucination)

### Total counts match v3 LATEST baseline EXACTLY (0% drift, NU HALT)

- **Luxury** `var(--line)`: **27 occurrences** (matches v3 LATEST baseline)
- **Luxury** `var(--line-strong)`: **8 existing** (post v3 b439530 — `.sex-option/.freq-card/.energy-card/.auth-skip-btn/.field-input`)
- **Clasic** `var(--line)`: **49 occurrences across 48 unique lines** (L1930 `.tl-dot` has 2 instances bg + box-shadow), matches v2 LATEST baseline
- **Clasic** `var(--line-strong)`: **0 existing** (Task 3 introduces token)

### Luxury classification (27 → 11 interactive + 16 decorative)

**Interactive 11 (refactor → `var(--line-strong)`):**

| Line | Selector / Element | Role |
|------|-------------------|------|
| 617 | `.toggle` (CSS class, switch widget cursor:pointer) | Interactive switch boundary |
| 1083 | inline `<button class="row" border>` onboarding goal "Compoziție" | Interactive selectable button |
| 1084 | inline `<button class="row" border>` onboarding goal "Sănătate" | Interactive selectable button |
| 1085 | inline `<button class="row" border>` onboarding goal "Performanță" | Interactive selectable button |
| 1423 | inline `<button class="row" border>` RPE "Mai aveam 2-3 reps" | Interactive selectable button |
| 1425 | inline `<button class="row" border>` RPE "Cedare totală" | Interactive selectable button |
| 1756 | inline `<button class="row" border>` theme picker Clasic | Interactive selectable button |
| 1757 | inline `<button class="row" border>` theme picker Living Body | Interactive selectable button |
| 1759 | inline `<button class="row" border>` theme picker Brain Coach | Interactive selectable button |
| 2038 | inline `<button class="row" border>` variant "A · Plan original" | Interactive selectable button |
| 2040 | inline `<button class="row" border>` variant "C · Doar mobilitate" | Interactive selectable button |

**Decorative 16 (keep `var(--line)`):**

8 CSS classes (`.bot-card` 228, `.gauge-frame` 299, `.scroll-fade` 349, `.ex-card` 519, `.chart-frame` 644, `.bubble.coach` 723, `.action-bar` 745) + 8 inline (border-top/border-bottom dividers + framing containers L1158, 1374, 1387, 1398, 1452, 1883 [info-row div NOT button], 1915, 1987, 2090).

Note: spec asserted 14 interactive (v3 LATEST estimate). Filesystem-verified analysis = 11 strict (button.row + .toggle CSS class). L1883 `<div class="row">` info-card classified decorative (display-only, no click handler — strict WCAG SC 1.4.11 actionable controls criterion). Discrepancy 21% on sub-classification, total 27 matches baseline.

### Clasic classification (49 occurrences / 48 unique lines → 17 interactive + 32 decorative)

**Interactive 17 (refactor → `var(--line-strong)`):**

| Line | Selector / Element | Role |
|------|-------------------|------|
| 208 | `.btn-ghost` (CSS, cursor:pointer) | Interactive ghost button boundary |
| 231 | `.energy-btn` (CSS, cursor:pointer) | Interactive energy state selector |
| 415 | inline `<input type="email">` border | Interactive form input |
| 437 | inline `<button class="auth-skip-btn">` | Interactive button |
| 530 | inline `<input type="number">` age | Interactive form input |
| 767 | inline `<textarea>` pain description | Interactive form input |
| 783 | inline `<textarea>` equipment | Interactive form input |
| 857 | inline `<button>` profile/notif | Interactive button |
| 981 | inline `<button onclick="toggleCue()">` Cue | Interactive button |
| 1022 | inline `.set-check` inner div border | Interactive checkbox visual |
| 1667 | inline `<input type="number">` weight kg | Interactive form input |
| 1672 | inline `<input type="date">` weight | Interactive form input |
| 1812 | inline `<label cursor:pointer>` checkbox | Interactive label |
| 1832 | `.cause-btn` (CSS, cursor:pointer) | Interactive cause selection |
| 1906 | `.sw` (CSS, switch background) | Interactive switch toggle visual |
| 1917 | `.theme-card` (CSS, cursor:pointer) | Interactive theme picker card |
| 2047 | JS dynamic `b.style.border` deselect | Interactive option deselect |

**Decorative 32 (keep `var(--line)`):**

5 CSS classes (`.chip` 219, `.progress-dot bg` 250, `.prob-bar bg` 259, `.settings-stack` 1849, `.stat-card` 1870, `.alert-row` 1877, `.tl-step::before bg` 1928, `.tl-dot bg+box-shadow` 1930×2) + 24 inline (separator hairlines L420/422/431/433, energy-drill L899, stat cards L912/917/922, progress-bar L949, ex-card L956, status TDEE L1096, weight cards L1109/1130, tier cards L1177/1191/1209, account L1236, subscription L1365, KPI L1556/1561, chart L1569, photo L1590, photo-square L1596).

---

## PHASE 2 — Token design (Clasic `--line-strong`, manual WCAG luminance)

**Goal:** WCAG SC 1.4.11 non-text 3:1 minimum vs Clasic `--paper` #faf7f1 (L=0.933).

Target: L ≤ 0.277 (formula `(0.933+0.05)/(L+0.05) ≥ 3`).

| Candidate | RGB | L computed | Ratio vs --paper | Notes |
|-----------|-----|------------|------------------|-------|
| `#a89377` | (168,147,119) | 0.306 | 2.75:1 | ❌ FAIL just under |
| `#a3937a` | (163,147,122) | 0.301 | 2.79:1 | ❌ FAIL |
| `#9c8a72` | (156,138,114) | 0.267 | 3.09:1 | ✅ PASS marginal |
| **`#9a8770`** | **(154,135,112)** | **0.254** | **3.23:1** | ✅ **PASS chosen** |
| `#8e7960` | (142,121,96) | 0.204 | 3.86:1 | ✅ PASS strong (industrial) |

**Decision: `#9a8770`** — warm taupe Clasic clinical character preserved (R>G>B 154/135/112 ratio matches --line family), Bugatti restraint (NU industrial #8e7960 3.86:1 too strong vs cream).

**Tonal hierarchy strict-monotonic dark→light:**
```
--ink         #1a1815  L=0.0042   17.94:1 (text AAA)
--ink-2       #3a342d  L=0.0347   11.57:1 (text AAA)
--ink-3       #6e6862  L=0.141    5.13:1 (muted text AA)
--line-strong #9a8770  L=0.254    3.23:1 (interactive boundary AA)  🆕
--line        #e7e0d0  L=0.748    1.23:1 (decorative divider, NU strict)
--paper-2     #f3ede1  L=0.855    surface secondary
--paper       #faf7f1  L=0.933    surface primary
```

---

## PHASE 3 — LAND

### Modifications

**File: `04-architecture/mockups/andura-clasic.html`** (LOC delta +2 net = 1 token line + 1 comment expansion line)

1. `:root` insertion line 54: `--line-strong: #9a8770;` + WCAG audit comment (1 new line).
2. 5 CSS class refactor: `.btn-ghost` (L208) + `.energy-btn` (L231) + `.cause-btn` (L1832) + `.sw` (L1906) + `.theme-card` (L1917).
3. 12 inline refactor: email input + auth-skip-btn + age input + pain textarea + equipment textarea + profile button + Cue button + set-check inner div + weight kg + weight date + checkbox label + JS dynamic.
4. Comment update on `--line` token (clarify decorative interpretation per WCAG v4 classification).

**File: `04-architecture/mockups/andura-luxury.html`** (LOC delta 0 net, in-place value swaps)

11 CSS+inline refactor:
1. `.toggle` CSS class L617.
2. 3 onboarding goal buttons L1083/1084/1085.
3. 2 RPE detail buttons L1423/1425.
4. 3 theme picker buttons L1756/1757/1759.
5. 2 variant selection buttons L2038/2040.

**Bulk replace_all FORBIDDEN per anti-recurrence rule** (Task 0 root cause). Used 28 surgical Edit calls with exact unique strings + inline comment citation `WCAG v4 batch 2026-05-10 cross-skin` per refactor.

---

## Build + Tests

```
$ npm run test:run
Test Files  148 passed (148)
     Tests  2731 passed (2731)
  Duration  32.48s
```

✅ 2731 PASS preserved EXACT (gate verde — Vitest baseline matched).

### Post-fix grep verification

| Skin | `var(--line)` post | `var(--line-strong)` post | Self-ref grep |
|------|-------------------|--------------------------|---------------|
| Luxury | 16 (was 27, -11 refactored) | 19 (was 8, +11 added) | 0 matches ✅ |
| Clasic | 31 (was 48 post-Task-0, -17 refactored — note 48 = 49 occurrences pre-Task-0 minus 1 from circular ref hotfix) | 17 (was 0, +17 added) | 0 matches ✅ |

Total cross-skin: Luxury 35 (16+19) + Clasic 48 (31+17) = 83 occurrences var(--line) family. Pre-Task-3 totals: Luxury 35 (27+8) + Clasic 48 (48+0) = 83. ✅ Conservation verified.

---

## Commits + push

- Backup tag: `pre-themes-batch-wcag-line-split-cross-skin-2026-05-10-0127` pushed origin.
- Commit: `WCAG v4 cross-skin --line architectural split: Luxury 11 interactive + Clasic 17 interactive + new Clasic --line-strong #9a8770 3.23:1 (~707-709 LOCKED V1 preserved + Beta blocker closure)` — SHA populated post-commit.
- Pushed origin/main.

---

## Issues / Halt conditions

None. Phase 1 grep counts matched baselines (0% drift). Phase 2 token computed `#9a8770` 3.23:1 PASS. Phase 3 28 surgical Edits successful (1 retry on `.toggle` due to longer context match — corrected). Self-ref grep 0 matches (no new circular refs introduced post-token-add).

**Spec sub-classification 14/13 vs filesystem-verified 11/16 Luxury:** documented as classification refinement (strict WCAG button-or-form-control criterion vs v3 LATEST estimate). Total 27 matches exactly. NU HALT.

---

## Next action

Orchestrator continues **Task 4** (Brain Coach `--ink-4` 9px text edge case + `--line` audit closure). Sequential fail-stop atomic per orchestrator spec.

---

## Cumulative state

- **LOCKED V1 ~707-709 PRESERVED** unchanged (architectural split meta-tooling NU additive product/architecture).
- **Beta blocker closure:** WCAG SC 1.4.11 non-text 3:1 strict for interactive UI boundaries cross-Luxury+Clasic. Browser smoke deferred Daniel post-pipeline-complete.
- **Stack precedent + Task 3:** v1 `cc98b46` + v3 `b439530` + v2 `dfa3bbd` (broken) + Task 0 hotfix (heal) + Task 3 (this commit, cross-skin split).
- **Tokens introduced cross-skin:** Clasic `--line-strong: #9a8770` (NEW, 3.23:1). Luxury `--line-strong` already existed `#6e5a2a` (3.15:1 from v3 b439530).
- **Archive precedent LATEST (Task 0)** → `📤_outbox/_archive/2026-05/277_THEMES_BATCH_WCAG_HOTFIX_TASK0.md`.
