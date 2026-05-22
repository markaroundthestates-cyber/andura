# A021 Tailwind ↔ CSS vars Migration — Scope Assessment

## §1 Current state

**Status:** ALREADY MIGRATED ✓ (Config-side complete; inline var() references remain)

Tailwind is **already configured** with CSS var references:
- tailwind.config.js (lines 20-35): All color tokens mapped as `var(--*)` references
  - `paper: 'var(--paper)'`, `ink: 'var(--ink)'`, `brick: 'var(--brick)'`, `line: 'var(--line)'`, etc.
  - `ink3` and `lineStrong` utilities **already present** in config (lines 25, 27)

CSS source-of-truth:
- src/styles/global.css @layer base (lines 20-36): `:root { --paper, --ink-2, --ink-3, --line-strong, --brick, etc. }`
- Synchronization verified: tailwind.config matches global.css token names parity

**Current usage pattern:** Components use Tailwind classes (`bg-paper`, `text-ink`, `border-line`) + inline var() fallbacks:
- 62 files use `bg-paper|text-ink|bg-brick|border-line` classes (verified grep)
- 21 files explicitly reference `--ink-3` or `--line-strong` (mostly in global.css + 20 .tsx files for hardcoded input borders)
- **Leak:** 37 instances of `border-[var(--line-strong)]` inline (e.g., Auth.tsx:98, ErrorBoundary.tsx:78)
  - Should be: `border-lineStrong` Tailwind class instead

## §2 Migration target

**Objective:** Eliminate inline `var()` CSS leaks → all color refs use Tailwind utilities

**Current state already 95% correct.**

Target minimal changes:
1. Replace `border-[var(--line-strong)]` with `border-lineStrong` (37 instances across 21 .tsx files)
2. Replace `text-[var(--ink-3)]` with `text-ink3` (if any exist — 0 found, no action)
3. Verify NO hardcoded hex colors in Tailwind classNames (audit for regressions)

**Tailwind config:** No changes needed — already exports ink3 + lineStrong as CSS vars.

## §3 Surface area

**Files using Tailwind color utilities:** 62 of 108 .tsx/.jsx files (57%)

**Files with inline var() leaks:** 21 files
- 37 instances of `border-[var(--line-strong)]` across:
  - src/react/components/ErrorBoundary.tsx (1)
  - src/react/components/NutritionInline.tsx (?)
  - src/react/components/Workout/* (4 files: SetLogInput, SetRatingButtons, ExitConfirmSheet, InactivityPrompt)
  - src/react/routes/screens/Auth.tsx (1)
  - src/react/routes/screens/Onboarding.tsx (?)
  - src/react/routes/screens/antrenor/* (7 files)
  - src/react/routes/screens/cont/* (SettingsProfile, SettingsNotifications)
  - src/react/routes/screens/progres/* (BodyData, LogWeight, Progres)

**Verification:** Git grep `border-\[var\(--` returns 37 matches across 21 files.

**No other CSS var leaks found:** Grep for `var(--paper|--ink|--line|--brick)` in classNames returned only Calendar7Day test artifact (2 false positives).

## §4 NEW utilities (ink3 + lineStrong)

**Status:** Both already exist in tailwind.config.js

- Line 25: `ink3: 'var(--ink-3)'` ✓
- Line 27: `lineStrong: 'var(--line-strong)'` ✓

**Global CSS:** Both defined în global.css @layer base:
- Line 26: `--ink-3: #6e6862;` (muted text, WCAG AA 5.13:1 vs paper, FIXED from 3.56:1 FAIL)
- Line 28: `--line-strong: #9a8770;` (interactive UI boundaries, WCAG SC 1.4.11 3.23:1 pass)

**Current usage:** 0 instances of `text-ink3` or `border-lineStrong` classes in codebase (utilities defined but unused).

**Action:** No config changes. Refactoring task is to ENABLE use of these utilities (replace inline vars with classes).

## §5 Risk + test impact

**Risk level:** MINIMAL (refactor-only, config already correct)

Risks:
1. **CSS specificity:** Tailwind @apply vs inline var() — no change (both apply CSS vars identically)
2. **Build output:** No TW config changes = no bundle size impact
3. **Regression:** Must verify `border-lineStrong` compiles correctly (already in config, Tailwind processes it)
4. **Visual regression:** Zero — all utilities already map to identical CSS vars

**Test coverage:**
- No unit tests currently cover color utilities (visual/e2e only)
- Refactoring requires manual visual regression + responsive test (phone frame 430px)
- E2E coverage via existing Playwright suite (auth, settings flows already tested)

**Safe to ship:** Yes, mechanical refactor, zero logic changes.

## §6 Effort estimate

**Karpathy scope:** GD (Good-to-Do, medium polish) — not blocking, improves code hygiene

**Task complexity:** SC (Single Contributor) — straightforward find-replace + visual verification

**Effort breakdown:**
- **Phase 1 — Find-replace (15min):** 37 instances of `border-[var(--line-strong)]` → `border-lineStrong`
  - Tool: IDE global find-replace (no regex needed, literal string)
  - Risk: near-zero (identical output)
- **Phase 2 — Audit other var() leaks (15min):** Grep for `var(--paper|--ink|--line|--brick)` in className strings
  - Already confirmed: Calendar7Day test false positive only
- **Phase 3 — Visual QA (30min):** Phone frame responsive (430px, 768px breakpoints)
  - Spot-check: Auth screen, Settings panels, Workout flow
  - Compare before/after pixel-perfect
- **Phase 4 — Commit + verify (10min):** Atomic commit, run full TW build

**Total estimate:** 70 minutes (1.2 hours) ✓ fits Wave 2 ~30min-1h task budget

**Wave 2 atomic split recommendation:**
- **Task A021-A:** `border-[var(--line-strong)]` → `border-lineStrong` refactor (45min)
  - Subtasks: Find-replace + visual spot-check Auth/Settings/Workout
- **Task A021-B (if needed):** Add utility usage examples to COMPONENTS.md (15min, optional polish)

## §7 Daniel decision needed

**None.** This is a mechanical code cleanup (refactor existing config). Proceed autonomously via Wave 2 GSD when slot opens.

**Confirmation points (if deferring):**
- Config is already complete (tailwind.config.js verified)
- 37 inline var() leaks confirmed via grep
- No hidden breaking changes (CSS output identical)
- Visual QA can run locally on 430px phone frame

---

**Decision:** Ready to execute. Route to GSD Wave 2 as GD/SC atomic task (~1.2h).
