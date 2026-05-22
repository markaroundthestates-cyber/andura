# DESIGN_TOKENS.md — Andura design system catalog

**Status:** LOCKED V1 (audit-§29-H3 closure 2026-05-22)
**Owner:** Frontend infra
**Source of truth:** `src/styles/global.css` + `tailwind.config.js`
**Substrate invariant:** B009 — ZERO hardcoded hex in `src/react/**` components. All colors flow via CSS vars OR Tailwind `theme.extend.colors` mapping.

---

## §1. Architecture

Two-layer token system (single source of truth = `:root` declarations in `global.css`):

1. **CSS layer** — `src/styles/global.css` `@layer base` declares all custom properties on `:root` (light theme) + `[data-theme="dark"]` (dark theme inverse polarity).
2. **Tailwind layer** — `tailwind.config.js` `theme.extend.colors` maps Tailwind class names (`text-ink`, `bg-paper`, `border-line`, etc.) to `var(--token)` references. NO hex in config.

**Result:** consumer code uses Tailwind classes only (`<div className="bg-paper text-ink border-line">`), Tailwind compiles to `var(--paper)` etc, CSS vars resolve based on `[data-theme]` attribute on `<html>`. Theme swap = single attribute toggle, propagates instantly.

---

## §2. Token catalog (all CSS vars)

### §2.1 Core surface + text tokens

| CSS var | Tailwind class | Light value | Dark value | Purpose |
|---|---|---|---|---|
| `--paper` | `paper` | `#faf7f1` | `#1a1815` | Phone bg primary (light cream / dark) |
| `--paper-2` | `paper2` | `#f3ede1` | `#2a2622` | Secondary surface (cards, sheets) |
| `--ink` | `ink` | `#1a1815` | `#faf7f1` | Primary text (17.94:1 AAA) |
| `--ink-2` | `ink2` | `#3a342d` | `#d6cfc0` | Secondary text (11.57:1 AAA light / 11.78:1 AAA dark) |
| `--ink-3` | `ink3` | `#6e6862` | `#8a8378` | Muted text (5.13:1 AA light / 5.05:1 AA dark) |
| `--line` | `line` | `#e7e0d0` | `#2e2a25` | Decorative borders (dividers, hairlines) |
| `--line-strong` | `lineStrong` | `#9a8770` | `#5a5249` | Interactive UI essential boundary (3.23:1 / 3.17:1 SC 1.4.11 PASS) |

### §2.2 Accent + signal tokens

| CSS var | Tailwind class | Light value | Dark value | Purpose |
|---|---|---|---|---|
| `--brick` | `brick` | `#c8412e` | `#e85a44` | Accent brick red (Clasic signature) |
| `--brick-dark` | `brickdark` | `#a8351f` | `#c8412e` | Brick hover/pressed variant |
| `--olive` | `olive` | `#6b7142` | `#8f9758` | Olive accent (energy/cardio context) |
| `--deep` | `deep` | `#2d4a6b` | `#4a6b8f` | Deep blue accent (rest/recovery context) |
| `--succ` | `succ` | `#3d7a4a` | `#5a9d68` | Success green |
| `--warn` | `warn` | `#c89321` | `#e8b048` | Warning amber |
| `--danger` | `danger` | `#c8412e` | `#e85a44` | Danger (alias brick) |

### §2.3 Status banner tints (B009)

Paired bg + border + text variants ensure AA contrast in both themes. Used by `<StatusBanner>` patterns (intensity/pattern/alert/rest).

| CSS var | Light value | Dark value |
|---|---|---|
| `--status-success-bg` | `#e7f0e2` | `#1f3527` |
| `--status-success-border` | `#bdd9b3` | `#2e4d39` |
| `--status-success-text` | `#1d4528` | `#b5d9be` |
| `--status-danger-bg` | `#fbe3df` | `#3a1f1c` |
| `--status-danger-border` | `#e8b2a8` | `#5a2e29` |
| `--status-danger-text` | `#6b2418` | `#f0b8ad` |
| `--status-neutral-bg` | `#fdf3df` | `#3a3322` |
| `--status-neutral-border` | `#e8d59a` | `#5a4e30` |
| `--status-neutral-text` | `#6b5a1e` | `#e8d99a` |
| `--status-info-bg` | `#fdeeea` | `#3a2422` |
| `--status-info-border` | `#f0c8be` | `#5a3329` |
| `--status-info-text` | `#6b2418` | `#f0b8ad` |

### §2.4 Overlay tokens (B009 closure)

Theme-aware alpha so dark theme can dial up opacity for proper paper-bg separation.

| CSS var | Tailwind class | Light value | Dark value | Purpose |
|---|---|---|---|---|
| `--overlay-strong` | `overlayStrong` | `rgb(0 0 0 / 0.6)` | `rgb(0 0 0 / 0.75)` | Blocking modals (AaFriction, Disclaimer) |
| `--overlay-soft` | `overlaySoft` | `rgb(0 0 0 / 0.3)` | `rgb(0 0 0 / 0.5)` | Bottom sheets (ExitConfirmSheet) |

### §2.5 Istoric heatmap signature tokens

F-istoric-01 + F-istoric-03 signature feature. Each used 2+ times → Bugatti craft justifies vault addition. §29-H1 audit closure 2026-05-22: all 7 tokens have dark-theme parity in `[data-theme="dark"]`.

| CSS var | Tailwind class | Light value | Dark value | Purpose |
|---|---|---|---|---|
| `--heat-usor` | `heatUsor` | `#d4e6cb` | `#2a4a30` | L1 tier — usor sessions |
| `--heat-usor-text` | `heatUsorText` | `#2f5b34` | `#b5d9be` | L1 tier text (7.92:1 / 8.43:1 AAA) |
| `--heat-normal` | `heatNormal` | `#7fb185` | `#4a7a55` | L2 tier — normal sessions |
| `--heat-greu` | `heatGreu` | `#3d7a4a` | `#6b9d72` | L3 tier — greu sessions |
| `--heat-recovery` | `heatRecovery` | `#f5ebd0` | `#3a3322` | Recovery tier (V2 deload flag) |
| `--heat-recovery-border` | `heatRecoveryBorder` | `#e6d49a` | `#5a4e30` | Recovery border (V2) |
| `--rating-usor` | `ratingUsor` | `#a4cfa9` | `#5a9d68` | 90-day strip categorical green |

### §2.6 Persona text scaling tokens

Defined inside `@layer components` per persona class (Maria / Gigel / Marius). Body / small / display sizes adapt per cohort. See `global.css` L114-122.

---

## §3. Tailwind extend mapping (`tailwind.config.js`)

`theme.extend.colors` mirrors every CSS var as a Tailwind class name. Adding a new token = 2-file change:

1. Declare `--token` in `global.css` `:root` + `[data-theme="dark"]`.
2. Add `tokenName: 'var(--token)'` to `tailwind.config.js` `theme.extend.colors`.

`darkMode: ['selector', '[data-theme="dark"]']` — Tailwind `dark:` prefix toggled by `data-theme` attribute, NOT `prefers-color-scheme` (Daniel manual control via `settingsStore.theme` → documentElement).

---

## §4. Usage guidelines (B009 substrate invariant)

### §4.1 Mandatory rules

- **NO hardcoded hex in `src/react/**`** — always use Tailwind classes that map to vars.
- **NO `prefers-color-scheme` media queries in components** — theme is `data-theme` driven; `[data-theme="dark"]` cascade handles overrides automatically.
- **Add new token = declare in BOTH themes** (`:root` + `[data-theme="dark"]`). Audit §29-H1 lesson: missing dark variants ship invisible light-theme hex on dark phone bg → severe contrast fail.
- **Status patterns use status-* tokens** — never reach for `--succ`/`--warn`/`--danger` directly for banner-style UI.
- **Decorative vs interactive borders:** `--line` for hairlines/dividers, `--line-strong` for buttons/inputs/cards with essential boundary (SC 1.4.11 3:1 min).

### §4.2 Adding a new token — checklist

1. Justify Bugatti necessity (used 2+ times across features OR signature feature).
2. Light value: WCAG AA contrast vs `--paper` (#faf7f1) verified.
3. Dark value: WCAG AA contrast vs dark `--paper` (#1a1815) verified.
4. Declare in `global.css` `:root` + `[data-theme="dark"]` with inline comment documenting contrast ratio.
5. Add mapping in `tailwind.config.js` `theme.extend.colors`.
6. Append row to relevant table above.
7. Atomic commit `feat(token): <name> [GD]` (substrate addition).

---

## §5. Accessibility — colorblind safety (§29-H2 closure 2026-05-22)

### §5.1 Problem statement

Heat tier palette (`--heat-usor` light green → `--heat-greu` deep green) + RatingsStrip90Day uses green (usor) / taupe (potrivit) / brick-red (greu). Red-green colorblindness (deuteranopia ~5% males, protanopia ~1% males) collapses green↔red distinction, leaving categorical-by-color UI semantically ambiguous.

### §5.2 Resolution — multi-cue principle

WCAG 1.4.1 (Use of Color) requires color NOT be the sole conveyor of information. Andura compliance via mandatory secondary cues:

| Component | Color cue | Secondary cue | Source |
|---|---|---|---|
| `CalendarHeatmap` cells | tier class bg (`bg-heatUsor`/`bg-heatNormal`/`bg-heatGreu`) | `data-tier="l1\|l2\|l3"` attribute + descriptive `aria-label` ("4 mai 2026, antrenament usor") | `src/react/components/Istoric/CalendarHeatmap.tsx` L175-181 |
| `RatingsStrip90Day` cells | rating class bg (`bg-ratingUsor`/`bg-lineStrong`/`bg-brick`) | `data-rating="usor\|potrivit\|greu\|unrated"` attribute | `src/react/components/Istoric/RatingsStrip90Day.tsx` L100 |
| `RatingsStrip90Day` aggregates | text color (`text-heatGreu`/`text-ink`/`text-brick`) | numeric count + label text + group `aria-label="Usor X sesiuni"` | same file L110-136 |
| `CalendarHeatmap` legend | tier swatch | text label adjacent ("Greu" / "Normal" / "Usor" / "Recuperare" / "Zi libera") | same file L199-225 |
| `StatusBanner` (success/danger/warn/info) | tinted bg | icon + heading text | status-* token consumers |

### §5.3 Mandatory pattern for future categorical-by-color UI

When introducing UI that distinguishes states via color hue (not just lightness):

1. **Provide redundant cue** — one of: icon, text label, `data-*` attribute machine-readable, or numeric value.
2. **Verify deuteranopia simulation** — Chrome DevTools → Rendering → Emulate vision deficiency → "Deuteranopia". Visual identity must remain (e.g., shape/position) even if hue collapses.
3. **WCAG SC 1.4.1** — assert in component test: `expect(cell).toHaveAttribute('data-tier')` (machine-readable distinction independent of color).

### §5.4 What we deliberately do NOT do

- **No icon overlay on heatmap cells** — cells are 24-32px touch targets; icon would dominate visual rhythm + clash with Bugatti minimalist aesthetic. Aria-label + data attribute satisfy SC 1.4.1 without visual noise.
- **No alternate "colorblind theme" toggle** — multi-cue baseline serves all users; secondary themes fragment QA surface.

---

## §6. Theming runtime mechanism

- Theme state lives in `settingsStore` (Zustand).
- `settingsStore.theme: 'light' | 'dark'` → `document.documentElement.setAttribute('data-theme', theme)`.
- CSS `[data-theme="dark"]` block redeclares all vars; cascade propagates instantly without component remount.
- Persona scaling parallel: `document.documentElement.classList.add('persona-<name>')` toggles body/small/display sizes via `--body`/`--small`/`--display` vars.

---

## §7. Cross-references

- **Audit closure:** `📤_outbox/consolidation-audit/findings-§29.md` (§29-H1 dark mode, §29-H2 colorblind, §29-H3 docs).
- **Substrate invariant:** DECISIONS.md B009 — token-only colors in `src/react/**`.
- **Mockup parity:** `04-architecture/mockups/andura-clasic.html` DESIGN MASTER (color decisions originate here).
- **WCAG verification log:** `08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md` Bugatti gate §0-§11.
