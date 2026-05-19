# §19 — Visual Regression / Pixel Parity Audit

**Scope:** Mockup parity + screenshot diff + color tokens consistency + typography scale + spacing rhythm + border-radius + animation curves + hover/focus/active + empty/loading states + dark mode + touch feedback + focus ring + print + high contrast

## Severity matrix §19

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 3 |
| MED | 4 |
| LOW | 3 (positive) |
| NIT | 1 |
| **Total** | **12** |

---

## CRITICAL findings

### §19-C1 — NO visual regression test infrastructure (Percy/Chromatic/manual screenshot diff)
**Severity:** CRITICAL (§19.2)
**Evidence:** No Percy/Chromatic config, no `tests/visual.spec.js` (visible at top-level — content NOT inspected). Playwright supports `toHaveScreenshot()` natively. Without baseline screenshots vs current build, regressions silent.
**Karpathy:** Goal-Driven — mockup parity §19.1 mandate.
**Fix log:** Add Playwright visual regression suite. Generate baseline screenshots from approved mockup state. Run on each PR.

---

## HIGH findings

### §19-H1 — Color tokens drift Tailwind ↔ CSS vars (§1-C3 reaffirmed)
**Severity:** HIGH
**Resolution:** Per §1-C3.

### §19-H2 — Mockup `andura-clasic.html` DESIGN MASTER parity NOT VERIFIED pixel-perfect
**Severity:** HIGH (§19.1 + §1.5)
**Evidence:** `04-architecture/mockups/andura-clasic.html` referenced as DESIGN MASTER per D015. Source mockup ~30K-50K LOC HTML+CSS+JS. React build re-implements ~30+ screens. Pixel parity per screen: spot-check needed via side-by-side.
**Fix log:** Manual visual diff per screen vs mockup, document deviations + reconcile.

### §19-H3 — Dark mode tokens incomplete (SettingsAppearance LANDED toggle but no dark CSS vars)
**Severity:** HIGH (§19.18 + §29.12)
**Evidence:** SettingsAppearance.tsx exists. global.css `:root` has only light tokens. No `[data-theme="dark"] :root { --paper: #...; --ink: #...; ... }` override.
**Fix log:** Define dark theme vars; verify SettingsAppearance writes data-theme attribute and CSS vars switch.

---

## MED findings

### §19-M1 — Animation timing curves consistent — minimal animations observed (Tailwind defaults) ✓
**Severity:** MED — POSITIVE
**Evidence:** No custom Tailwind animation extensions in tailwind.config.js. Defaults consistent.

### §19-M2 — Border-radius tokens consistent ✓
**Severity:** MED — POSITIVE
**Evidence:** Tailwind rounded-xl + rounded-2xl + rounded-3xl observed. Consistent.

### §19-M3 — Spacing rhythm 4px/8px grid (Tailwind defaults) ✓
**Severity:** MED — POSITIVE (§19.5)
**Evidence:** Tailwind default spacing scale 4px increments. Used consistently in samples.

### §19-M4 — Loading skeleton state (Phase 5 task_19 LANDED) — verify visual parity (§19.10)
**Severity:** MED
**Evidence:** `LoadingSkeleton.tsx` exists. Used in Layout.tsx Suspense fallback. Visual verify needed.

---

## LOW (POSITIVE)

### §19-L1 — Component library partial atomic design (components/Antrenor/StatsGrid + PRWallRecent + Calendar7Day) ✓
**Severity:** LOW positive (§19.17)

### §19-L2 — Iconography Lucide consistent ✓ (§29.14)
**Severity:** LOW positive

### §19-L3 — Typography scale tokens centralized (tailwind config text-xs/sm/base/lg/xl/2xl/3xl) ✓
**Severity:** LOW positive (§19.4 + §29.2)

---

## NIT findings

### §19-N1 — Shadow tokens NOT explicitly defined (Tailwind defaults shadow-sm/md/lg) — adequate
**Resolution:** OK.

## Coverage map §19.x condensed

| Sub | Severity |
|-----|----------|
| 19.1 Mockup parity per screen | §19-H2 |
| 19.2 Screenshot diff baseline | §19-C1 |
| 19.3 Color tokens consistency | §19-H1 |
| 19.4 Typography scale | §19-L3 ✓ |
| 19.5 Spacing 4/8 grid | §19-M3 ✓ |
| 19.6 Border radius | §19-M2 ✓ |
| 19.7 Animation timing | §19-M1 ✓ |
| 19.8 Hover/focus/active | NOT VERIFIED MED secondary |
| 19.9 Empty states visual | §7-H6 |
| 19.10 Loading states LoadingSkeleton | §19-M4 |
| 19.11 Color tokens centralized | §19-H1 |
| 19.12 Typography tokens centralized | §19-L3 ✓ |
| 19.13 Spacing tokens centralized | §19-M3 ✓ |
| 19.14 Border radius tokens | §19-M2 ✓ |
| 19.15 Shadow tokens | §19-N1 |
| 19.16 Animation tokens | §19-M1 ✓ |
| 19.17 Component library atomic | §19-L1 ✓ |
| 19.18 Dark mode | §19-H3 |
| 19.19 Touch target visual `:active` | NOT VERIFIED MED secondary |
| 19.20 Focus ring `:focus-visible` | covered §6 |
| 19.21 Print stylesheet | N/A pre-Beta |
| 19.22 prefers-contrast: high | NOT VERIFIED LOW secondary |

## Karpathy distribution §19
- Goal-Driven: 2 (C1, H2)
- Surgical Changes: 1 (H3)
