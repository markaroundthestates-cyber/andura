# LATEST — Themes Batch WCAG Audit (silver-3 + ink-3 + ink-4 remediation)

**Task:** WCAG audit + remediate SC 1.4.3 (text 4.5:1 AA) + SC 1.4.11 (non-text 3:1) cross-skin 4 themes — Beta blocker resolution priority 1
**Model:** Opus
**Status:** ⚠️ AUDIT+LAND (3 fixes landed) + HALTED (Clasic `#8a8278` 137× over 50 blast radius — flag Daniel decide architectural)
**Date:** 2026-05-09 2335
**Backup tag:** `pre-themes-batch-wcag-audit-2026-05-09-2335` (pushed origin)
**Authority:** DIFF_FLAGS unresolved priority 1 silver-3 fail Luxury + Daniel directive 2026-05-09 production-ready strict + Beta blocker resolution

---

## PHASE 1 — Pre-flight grep evidence (token usage tables verbatim)

### Luxury `:root` tokens (lines 11-30):
```css
--bleu: #0a2540;          --bleu-deep: #051427;     --bleu-bright: #1d4174;
--carbon: #0d0d0e;        --carbon-2: #16161a;      --noir: #050507;
--silver: #c8c5be;        --silver-2: #8a877f;      --silver-3: #5a5851;
--champagne: #c9a663;     --champagne-bright: #e0bd75;
--champagne-soft: rgba(201,166,99,0.15);  --champagne-faint: rgba(201,166,99,0.05);
--line: rgba(201,166,99,0.12);  --line-strong: rgba(201,166,99,0.28);
--hair: rgba(255,255,255,0.04);
```

**Luxury usage counts** (var(--TOK) grep cross-file): silver=21 / silver-2=74 / silver-3=18 / hair=12 / line=27 / line-strong=8 / champagne-faint=0 (orphan) / champagne-soft=17 / bleu-deep=2 / noir=8 / carbon=7 / carbon-2=7 / champagne=81

### Brain Coach `:root` tokens (lines 11-27):
```css
--bg: #0b0c10;   --bg-2: #12141a;   --bg-3: #1a1d26;   --bg-4: #22262f;
--ink: #f0f1f5;  --ink-2: #b8bcc8;  --ink-3: #6c7280;  --ink-4: #3a3e48;
--line: rgba(255,255,255,0.08);   --line-2: rgba(255,255,255,0.05);
--think: #8b6dff;  --think-soft: #b09cff;  --think-deep: #5b3dcf;
--signal: #4ade80; --warm: #f59e6b; --calm: #5dd6e6; --danger: #ef5a5a;
```

**Brain Coach usage counts**: ink=45 / ink-2=18 / ink-3=26 / ink-4=9 / line=26 / line-2=5 / think=39 / think-soft=31 / think-deep=3 / signal=12 / warm=17 / calm=17 / danger=7 / bg=5 / bg-2=15 / bg-3=3 / bg-4=1

### Clasic + Living Body — NO `:root` declared (hardcoded hex throughout per Batch 2b-iv finding)

**Clasic muted hex usage** (137× ⚠️ HALT trigger): `#8a8278`=137 / `#3a342d`=57 / `#e7e0d0`=49 / `#1a1815`=106 / `#faf7f1`=18 (phone bg) / `#f3ede1`=18

**Living Body muted hex usage**: `#8b8470`=133 / `#b8b0a0`=56 / `#f0eadb`=110 / `#d4a574`=95 / `#03050a`=2 (phone bg) / `#07090f`=9

### Phone backgrounds per skin (contrast denominator):
- **Clasic**: `#faf7f1` (light cream, L≈0.930) — INVERSE polarity vs others (text must be DARK)
- **Living Body**: `#03050a` (very dark, L≈0.0015)
- **Luxury**: `var(--noir) #050507` (very dark, L≈0.0014)
- **Brain Coach**: `var(--bg) #0b0c10` (dark, L≈0.0050)

---

## PHASE 2 — WCAG audit table (manual contrast computation per WCAG 2.1 formula)

Formula: L = 0.2126·R + 0.7152·G + 0.0722·B (relative luminance) where channels = sRGB → linear; Contrast = (L₁+0.05)/(L₂+0.05) where L₁ ≥ L₂.

| Token | File | Current | Bg | Token L | Ratio | AA Verdict | Usage | Action |
|-------|------|---------|----|---------|-------|------------|-------|--------|
| `--silver` | Luxury | `#c8c5be` | --noir 0.0014 | 0.566 | 11.98:1 | ✅ AAA | 21 | KEEP |
| `--silver-2` | Luxury | `#8a877f` | --noir | 0.241 | 5.66:1 | ✅ AA | 74 | KEEP |
| `--silver-3` | **Luxury** | **`#5a5851`** | **--noir** | **0.101** | **2.94:1** | ❌ **FAIL AA** | 18 | **FIX → `#7d7a71`** |
| `--champagne` | Luxury | `#c9a663` | --noir | 0.406 | 8.87:1 | ✅ AAA | 81 | KEEP |
| `--line` (alpha 0.12 composited rgb(28,24,18)) | Luxury | rgba(201,166,99,.12) | --noir | ~0.0064 | ~1.31:1 | ❌ FAIL non-text 3:1 | 27 | DEFER (Bugatti restraint) |
| `--line-strong` (alpha 0.28 composited rgb(60,50,33)) | Luxury | rgba(201,166,99,.28) | --noir | 0.0332 | **1.62:1** | ❌ FAIL non-text 3:1 | 8 | DEFER (2b-iv claim 3.1:1 was MISCOMPUTED — actual 1.62:1; α≥0.7 needed for true 3:1 = breaks Luxury restraint) |
| `--ink` | Brain Coach | `#f0f1f5` | --bg 0.0050 | 0.870 | ~16.7:1 | ✅ AAA | 45 | KEEP |
| `--ink-2` | Brain Coach | `#b8bcc8` | --bg | 0.506 | 10.10:1 | ✅ AAA | 18 | KEEP |
| `--ink-3` | **Brain Coach** | **`#6c7280`** | **--bg** | **0.166** | **3.93:1** | ❌ **FAIL AA** | 26 | **FIX → `#7c8090`** |
| `--ink-4` | **Brain Coach** | **`#3a3e48`** | **--bg** | **0.048** | **1.78:1** | ❌ **FAIL AA + non-text** | 9 | **FIX → `#5d6172`** (3.11:1 borders, 9px text edge case flagged) |
| `#8a8278` | **Clasic** | hardcoded text | `#faf7f1` 0.930 | 0.225 | **3.56:1** | ❌ **FAIL AA** | **137** | ⚠️ **HALT** — over 50 blast radius |
| `#3a342d` | Clasic | hardcoded text primary | `#faf7f1` | 0.0347 | 11.57:1 | ✅ AAA | 57 | KEEP |
| `#e7e0d0` | Clasic | hardcoded border | `#faf7f1` | 0.749 | 1.23:1 | ❌ FAIL non-text | 49 | DEFER (decorative) |
| `#8b8470` | Living Body | hardcoded text | `#03050a` 0.0015 | 0.230 | 5.43:1 | ✅ AA | 133 | KEEP |
| `#b8b0a0` | Living Body | hardcoded text | `#03050a` | 0.446 | 9.63:1 | ✅ AAA | 56 | KEEP |

### HALT condition triggered

**Clasic `#8a8278` 137 occurrences (over 50 blast radius threshold)** — fix would cascade visually across all secondary text in Clasic theme (small-text labels, time stamps, etched silver, etc.). Single-token blast radius beyond systematic scope. **Daniel decide architectural:**
1. Accept current 3.56:1 as "decorative muted text" interpretation (NU strict WCAG AA compliance)
2. Adopt `:root` CSS vars in Clasic + Living Body (architectural lift) → systematic fix per-skin like Luxury/Brain Coach
3. Per-batch search-and-replace `#8a8278` → darker shade across 137 contexts (mechanical but visually significant)

### Other DEFER decisions (Bugatti aesthetic tradeoff vs strict WCAG)

- **Luxury `--line` / `--line-strong`** (35 total usages): subtle border restraint discipline. Strict 3:1 fix needs α≥0.7 = breaks Luxury aesthetic. Daniel decide aesthetic exemption (decorative borders) OR aesthetic compromise (visible borders).
  - **2b-iv miscalculation flagged:** previous batch claimed `--line-strong` reaches 3.1:1 with α=0.28. Actual contrast on `--noir` = 1.62:1 (proper alpha compositing: result=bg*(1-α)+fg*α → rgb(60,50,33) → L=0.0332 → ratio 1.62:1, NOT 3.1:1). 2b-iv card-border WCAG claim was INCORRECT. This batch corrects record + flags for Daniel decision.
- **Clasic `#e7e0d0`** 49× borders 1.23:1: decorative card boundaries. Daniel decide.

---

## PHASE 3 — Implementation (3 systematic fixes landed)

### Luxury `--silver-3` (line 20)
- Before: `--silver-3: #5a5851;` (2.94:1 FAIL AA)
- After: `--silver-3: #7d7a71;` (~4.69:1 PASS AA 4.5:1)
- L_post = 0.191 (between silver-3 prev 0.101 and silver-2 0.241) — **hierarchy preserved silver-3 < silver-2 < silver**
- Warm tint preserved (R>G>B): rgb(125,122,113) maintains slight warm cast vs prev rgb(90,88,81)
- Inline comment: full audit citation + ratio + hierarchy preservation note

### Brain Coach `--ink-3` (line 17)
- Before: `--ink-3: #6c7280;` (3.93:1 FAIL AA)
- After: `--ink-3: #7c8090;` (~4.85:1 PASS AA 4.5:1)
- L_post = 0.217 (between ink-3 prev 0.166 and ink-2 0.506) — **hierarchy preserved ink-3 < ink-2 < ink**
- Cool tint preserved (B>G>R): rgb(124,128,144) maintains cool cast consistent with Brain Coach palette
- Inline comment: full audit citation

### Brain Coach `--ink-4` (line 18)
- Before: `--ink-4: #3a3e48;` (1.78:1 FAIL AA + non-text)
- After: `--ink-4: #5d6172;` (~3.11:1 PASS SC 1.4.11 non-text 3:1)
- L_post = 0.121 (between ink-4 prev 0.048 and ink-3 0.217) — **hierarchy preserved ink-4 < ink-3**
- **Edge case flagged:** ink-4 used 3 occurrences as 9px etched text — fails strict AA 4.5:1 due to tonal hierarchy constraint (bumping to 4.5:1 collapses ink-4 vs ink-3 distinction). Pragmatic call: pass non-text 3:1 (border usage @1 line 897 toggle) + accept 9px text edge case (3 etched mini-labels). Daniel decide: per-element override OR accept decorative interpretation OR architectural restructure split text vs border tokens.

### Visual integrity check post-fix

- Tonal hierarchy intact cross-skin ✅
- Warm/cool semantic preserved per-token ✅
- Skin character preserved (Luxury chiaroscuro restraint, Brain Coach playful cool palette) ✅
- No element exceeds previous siblings (silver-3 #7d7a71 < silver-2 #8a877f, ink-3 #7c8090 < ink-2 #b8bcc8, ink-4 #5d6172 < ink-3 #7c8090) ✅

### Other skins untouched
- `git diff --stat 04-architecture/mockups/andura-clasic.html 04-architecture/mockups/andura-living-body.html` → empty ✅

---

## PHASE 4 — Verify

- **Tests:** 2731 PASS / 0 FAIL (148 files) — baseline preserved exactly (mockup-only edits, ZERO src/ changes)
- **Diff stat:** 3 insertions(+), 3 deletions(-) across 2 files (Luxury 1 line + Brain Coach 2 lines, atomic 1:1 token-level swaps with audit comments)

---

## Modifications

- **Modified:** `04-architecture/mockups/andura-luxury.html` (line 20: --silver-3 #5a5851 → #7d7a71 + audit comment)
- **Modified:** `04-architecture/mockups/andura-brain-coach.html` (line 17: --ink-3 #6c7280 → #7c8090 + audit comment; line 18: --ink-4 #3a3e48 → #5d6172 + audit comment)
- **Untouched:** `andura-clasic.html`, `andura-living-body.html` (Living Body PASSES, Clasic HALT pending Daniel decide)

---

## Commits + Push

- Commit SHA: `(populated post-commit below)`
- Push status: `(populated post-push below)`

---

## Issues / Halt conditions triggered

### ⚠️ HALT — Clasic `#8a8278` 137× usage blast radius

Single-token usage 137 exceeds 50 threshold per scope halt criteria. Architectural decision required:

**Daniel decide path forward:**
1. **Accept current 3.56:1 as decorative muted text** (NU strict AA — pragma exception for cremos light-bg theme where contrast naturally weaker due to small luminance delta). Document in DIFF_FLAGS as known WCAG exemption.
2. **Architectural lift Clasic + Living Body to `:root` CSS vars** (parallel Luxury/Brain Coach pattern). 137 hardcoded → 1 token = systematic fix possible. Estimated ~1-2h CC: introduce `:root` block + replace all `#8a8278` occurrences via sed/replace_all + visual smoke validate. Living Body would benefit too (133× `#8b8470` not failing but 56× `#b8b0a0` would benefit from token discipline).
3. **Per-batch search-and-replace `#8a8278` → darker shade** (e.g., `#6e6862` ratio ~5.0:1) across all 137 contexts — mechanical but skin character changes (text becomes more emphatic, less muted).

Recommendation: Path 2 (architectural lift) for production-ready closure — tokens make future audits trivial + cross-skin consistency improved.

### Bugatti restraint vs strict WCAG tradeoff

Luxury `--line` / `--line-strong` 35× total usage at 1.31:1 / 1.62:1 fail SC 1.4.11 non-text 3:1. Fix would require α≥0.7 (very visible borders) breaking Luxury chiaroscuro restraint. Daniel decide:
- Aesthetic exemption (decorative interpretation — subtle dividers don't carry "essential UI semantic")
- Aesthetic compromise (raise to functional 3:1, sacrifice some chiaroscuro)

### 2b-iv miscalculation correction

Batch 2b-iv (commit `1ca105a`) claimed `--line-strong` (rgba α=0.28) achieves 3.1:1 contrast for frequency cards WCAG SC 1.4.11 fix. **Actual computation per proper alpha compositing: 1.62:1** (not 3.1:1). The frequency card border WCAG claim was INCORRECT. This batch corrects the record. Frequency cards still differ visibly from background due to RGB compositing, but strict WCAG SC 1.4.11 is NOT met. Falls under same Daniel decide above.

### Brain Coach `--ink-4` 9px text edge case

Fixed `--ink-4` to 3:1 non-text minimum (3.11:1) but 3 usages as 9px etched mini-labels technically fail strict AA 4.5:1 for text. Hierarchy preservation prevents pushing to 4.5:1 without collapsing ink-3/ink-4 distinction. Daniel decide: per-element override OR architectural split text vs border tokens.

---

## Next action

Daniel decide HALT path Clasic `#8a8278` (recommend path 2 architectural lift) + decide DEFER tokens (Luxury line/line-strong + Clasic borders + ink-4 9px text). Post-Daniel-decide → potential follow-up batch:
- WCAG audit batch v2: Clasic + Living Body `:root` lift (architectural, ~1-2h CC) + propagate token discipline cross-skin parity
- WCAG audit batch v3: Luxury line/line-strong aesthetic compromise (if Daniel chooses strict compliance over chiaroscuro restraint)

Otherwise: 3 fixes landed = production-ready improvement (silver-3 + ink-3 + ink-4 = 53 token usages elevated to AA/non-text compliance). Mockups improvement preserved cumulative ~707-709 LOCKED V1 + 1 Beta scope V1 LOCK ("Cum se face") unchanged.
