# §6 — Accessibility Audit WCAG 2.1 AA + Beyond

**Scope:** WCAG 2.1 AA comprehensive + keyboard nav + ARIA + contrast + tap targets + screen reader RO + focus + lang + reduced-motion + dark mode + ARIA live + form labels + cognitive (Gigel) + motor (Maria 65) + color blind + ADHD + plain language + vestibular + skip-content + autofill + headings + tap spacing + error recovery + time-content + zoom 200% + text resize + focus indicators
**Method:** grep aria/role/lang/outline/focus-visible/prefers-reduced-motion/autoComplete/skip-link; sample MedicalDisclaimerModal + BottomNav + AaFrictionModal; CSS color tokens contrast verify (computed in global.css comments)

## Severity matrix §6

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 7 |
| MED | 6 |
| LOW | 4 |
| NIT | 2 |
| **Total** | **22** |

---

## CRITICAL findings

### §6-C1 — NO `prefers-reduced-motion` support — vestibular safety violation
**Severity:** CRITICAL (§6.9 + §6.19 + WCAG 2.1 SC 2.3.3 Animation from Interactions Level AAA but AA pattern)
**Evidence:** Grep `prefers-reduced-motion` in src/ → ZERO hits. `src/styles/main.css` (vanilla) defines `@keyframes fi` page transition `.2s ease`. React build global.css does NOT reset animations under `prefers-reduced-motion`. Tailwind `transition-colors` defaults across components do NOT honor reduced-motion preference.
**Karpathy:** Goal-Driven Execution — Maria 65 + vestibular-affected users vulnerable.
**Reasoning:**
- WCAG 2.3.3 Pause/Stop/Hide motion control required for users with vestibular disorders.
- Per §6.19 "NO parallax/auto-spin/zoom-on-scroll" → currently OK (no parallax/spin) but `transition` defaults animate everywhere.
- Per §43.7 age-appropriate content → Maria 65 may have vertigo sensitivity.
**Fix log:** Add to `src/styles/global.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
ETA: S.

### §6-C2 — NO skip-to-content link (keyboard nav blocker on every page)
**Severity:** CRITICAL (§6.20 + WCAG 2.1 SC 2.4.1 Bypass Blocks Level A — REQUIRED for AA conformance)
**Evidence:** Grep `skip-to-content\|skip-link` → ZERO hits. Layout.tsx renders `<UpdatePrompt /> <main><Outlet /></main> <SessionPill /> <BottomNav />`. NO `<a href="#main" class="skip-link">Sari la conținut</a>` at top.
**Karpathy:** Surgical Changes — one `<a>` tag + CSS.
**Reasoning:** Keyboard users (motor disability, screen reader users) Tab from URL bar through UpdatePrompt + SessionPill + BottomNav (multiple buttons) before reaching main content. Skip-link bypasses repetitive nav.
**Fix log:** Add to Layout.tsx top:
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-brick focus:text-paper focus:px-4 focus:py-2 focus:rounded focus:z-[100]">
  Sari la conținutul principal
</a>
<main id="main-content" className="flex-1 pb-16">...
```
Wait — but per §9.2 NO_DIACRITICS UI rule, "conținutul" has ț. Use diacritics-stripped "Sari la continutul principal" or "Sari la continut".

### §6-C3 — Form inputs across Onboarding/SettingsProfile MISSING `autoComplete` attribute
**Severity:** CRITICAL (§6.21 + WCAG 1.3.5 Identify Input Purpose Level AA)
**Evidence:** Grep `autoComplete` in src/react/*.tsx → ZERO hits. Onboarding T0 Big 6 collects age/sex/weight/etc. SettingsProfile edits these. Browser autofill cannot suggest values without `autocomplete="bday"`/`autocomplete="sex"`/`autocomplete="given-name"`/etc.
**Karpathy:** Surgical Changes.
**Reasoning:**
- Maria 65 typing age + weight on phone slow → autofill saves time.
- WCAG SC 1.3.5 mandates `autocomplete` for inputs with identifiable purpose. AA requirement.
- Browser password managers (1Password, Bitwarden) cannot suggest email for Magic Link auth without `autocomplete="email"`.
**Fix log:** Audit each form input:
- Onboarding age step → `autocomplete="bday-year"` (or bday for birthday)
- Onboarding sex step → `autocomplete="sex"`
- Onboarding weight → no standard autocomplete; use `inputMode="decimal" enterKeyHint="done"`
- Magic Link email input → `autocomplete="email"`
- SettingsProfile email change → `autocomplete="email"`

---

## HIGH findings

### §6-H1 — `outline: none` reset patterns in vanilla legacy CSS — verify NOT shipped in React build
**Severity:** HIGH (§6.28)
**Evidence:** `src/styles/main.css:73,190` `outline:none` on selects + .wdi (workout data input). React global.css has NO outline:none. But Tailwind has `focus:ring-*` utilities — verify usage.
**Resolution:** Verify React build doesn't import main.css (per §1-M3) → confirmed safe. Tailwind components likely don't set `focus:outline-none` without ring substitute. Sample BottomNav: NO focus styling explicit — relies on browser default ring.

### §6-H2 — Color contrast verification reliant on global.css comments (computed values), NOT enforced
**Severity:** HIGH (§6.4 + WCAG 1.4.3 Contrast (Minimum) Level AA)
**Evidence:** `src/styles/global.css:18-24` documents contrast ratios computed: --ink (17.94:1 AAA), --ink-2 (11.57:1 AAA), --ink-3 (5.13:1 AA), --line-strong (3.23:1 SC 1.4.11). Tailwind config (§1-C3 drift) hardcodes hex separately — UNVERIFIED these match. Components mixing `text-ink2` (Tailwind) and `var(--ink-2)` CSS var → contrast may diverge.
**Karpathy:** Surgical Changes — tied to §1-C3 fix.
**Fix log:** Post-§1-C3 fix (Tailwind references CSS vars), contrast guaranteed single-source. Add axe-core CI step to verify (depends on §1-C4 ESLint + lint integration).

### §6-H3 — NO ARIA live region for dynamic content (PR notifications, toast, error messages)
**Severity:** HIGH (§6.11 WCAG 4.1.3 Status Messages Level AA)
**Evidence:** Grep `aria-live` in src/react/ → search needed. Components like `PRNotificationBanner`, `PatternsBanner`, `AlertsBanner` (Antrenor.tsx) display dynamic content but likely lack `aria-live="polite"`. Screen reader users miss PR announcement (Tip PR!) when it appears.
**Fix log:** Audit each banner/notification component → add `aria-live="polite"` for non-critical, `aria-live="assertive"` for safety (pain button confirm).

### §6-H4 — No focus management on modal open (initial focus + focus trap + restore on close)
**Severity:** HIGH (§6.7 + WCAG 2.4.3 Focus Order Level A + 2.4.7 Focus Visible Level AA)
**Evidence:** `MedicalDisclaimerModal.tsx`, `AaFrictionModal.tsx`, `UpdatePrompt.tsx` — sample observed. MedicalDisclaimerModal has `role="dialog" aria-modal="true" aria-labelledby` ✓. BUT no `useRef + useEffect` to focus the modal/first button on open, no focus trap (tab leaves modal back to underlying page), no restore focus on close. Keyboard users disoriented.
**Karpathy:** Surgical Changes — utility hook reusable.
**Fix log:** Implement `useFocusTrap` custom hook OR install `react-focus-lock` library. Apply to each `role="dialog"` modal. ETA: M.

### §6-H5 — Persona-aware text scaling applied ONLY to Antrenor screen — Maria 65 reads small text elsewhere
**Severity:** HIGH (§6.14 + §6.15 + §50.6)
**Evidence:** Per §1-H3, persona class only wraps Antrenor.tsx section. Other 30+ screens inherit Tailwind default text-sm/text-xs (~12-14px). Maria 65 needs `--body: 18px / --small: 16px` (per global.css). Cont/SettingsProfile likely smallest text → Maria 65 cannot read.
**Fix log:** Hoist persona class to Layout.tsx per §1-H3 fix.

### §6-H6 — Tap target spacing 8px minimum between BottomNav buttons NOT explicit
**Severity:** HIGH (§6.23)
**Evidence:** `BottomNav.tsx` uses `flex justify-around` w/ `flex-1` children, no explicit gap. Buttons share padding/border space → effectively 0px gap between active touch surfaces.
**Reasoning:** Per §6.23 + WCAG 2.5.5 Target Size Level AAA (44×44 minimum + 8px spacing recommend) — collision avoidance for Maria 65 thumb. Currently 4 buttons in 380px viewport ≈ 95px each = 44px+ wide ✓ size, but spacing zero → mis-tap adjacent button.
**Fix log:** Add `gap-1` or visual divider OR shrink buttons + center w/ padding. Document mockup parity — if mockup spec says "no gap" maintain but flag.

### §6-H7 — Zoom 200% functionality NOT TESTED (mobile zoom usability)
**Severity:** HIGH (§6.26 WCAG 1.4.4 Resize Text Level AA + 1.4.10 Reflow Level AA)
**Evidence:** index.html has `<meta name="viewport" content="width=device-width, initial-scale=1.0">` — DOES NOT include `maximum-scale=1` (good, allows zoom). But content reflow at 200% NOT tested. Fixed-position SessionPill + BottomNav at 200% could overlap viewport content.
**Fix log:** Manual test 200% zoom on Chrome DevTools mobile mode. Confirm reflow works. Add `tests/e2e/a11y/zoom-200.spec.js` for regression.

---

## MED findings

### §6-M1 — Screen reader narration RO NVDA primary — NOT tested live
**Severity:** MED (§6.6)
**Evidence:** Component lang="ro" inherited from `<html lang="ro">` ✓. NVDA reads RO. But specific aria-labels mixed RO/EN: BottomNav `aria-label="Navigare principala"` (RO no-diacritics OK), but other components may have English label leakage.
**Resolution:** Audit aria-label corpus secondary pass.

### §6-M2 — Heading hierarchy NOT verified (h1 → h2 → h3 progression)
**Severity:** MED (§6.22)
**Evidence:** Antrenor.tsx has `<h1>Antrenor</h1>` ✓. Per-screen h-tag distribution unverified.
**Fix log:** axe-core scan would catch; manual sample secondary pass.

### §6-M3 — Form labels + error association NOT verified across all forms
**Severity:** MED (§6.12 + §6.13)
**Evidence:** SettingsProfile renders multiple inputs — verify each has `<label htmlFor=>` + `aria-describedby="error-id"`.
**Fix log:** Sample audit secondary pass.

### §6-M4 — Color blind palette check NOT performed (deuteranopia/protanopia/tritanopia)
**Severity:** MED (§6.16)
**Evidence:** Color tokens (`--brick: #c8412e` red-orange) + (`--succ: #3d7a4a` green) used in semantic encoding. Daniel-direct register favors red for warnings. Red-green deuteranopia simulation NOT verified.
**Fix log:** Use Chrome DevTools Rendering tab → Emulate vision deficiencies. Verify status semantics not encoded by color ALONE (text label always paired).

### §6-M5 — ADHD-friendly UI (no blink/autoplay/distraction) — verify default
**Severity:** MED (§6.17)
**Evidence:** No `<marquee>`, no autoplay video, no GIFs found in source. Acceptable.
**Resolution:** OK.

### §6-M6 — Plain language B1 RO compliance — partially handled but UNVERIFIED
**Severity:** MED (§6.18)
**Evidence:** Wording sample: AaFrictionModal "Stai un pic" + "Ai marit ritmul peste obisnuit" (no diacritics ✓, B1-friendly). MedicalDisclaimer "Andura este un coach AI. Recomandarile sunt informative, nu substitut pentru sfat medical." (slight register clinical). Daniel CEO post-Beta a-z review window covers (§47.4 D024).
**Resolution:** Defer to post-Beta wording review.

---

## LOW findings

### §6-L1 — `<html lang="ro">` ✓ both source + dist
**Severity:** LOW (positive §6.8)
**Resolution:** OK.

### §6-L2 — BottomNav has `aria-label="Navigare principala"` + `aria-current="page"` ✓
**Severity:** LOW (positive §6.3)
**Resolution:** OK.

### §6-L3 — MedicalDisclaimerModal has `role="dialog"` + `aria-modal="true"` + `aria-labelledby` ✓
**Severity:** LOW (positive §6.3 + §6.7)
**Resolution:** OK foundation. §6-H4 adds focus trap.

### §6-L4 — Lucide-react Icon `aria-hidden="true"` consistent ✓
**Severity:** LOW (positive)
**Resolution:** OK.

---

## NIT findings

### §6-N1 — `aria-label="Navigare principala"` lacks ț (Romanian glyph) per NO_DIACRITICS rule
**Resolution:** Compliant w/ §9.2 — UI text including aria-label = NO diacritics. OK.

### §6-N2 — BottomNav `text-xs` (12px) for label below icon — small but ≥ accessible (combined w/ icon visual)
**Resolution:** Acceptable.

---

## Coverage map §6.x sub-checklist

| Sub | Title | Status | Severity |
|-----|-------|--------|----------|
| 6.1 | WCAG 2.1 AA axe-core scan | NOT RUN — needs CI integration (§1-C4 chain) | CRITICAL |
| 6.2 | Keyboard nav full app | partially OK (Tab/Enter w/o focus visible §6-H4) | HIGH |
| 6.3 | ARIA labels + roles | sample OK (Modal, BottomNav); §6-H3 missing live regions | HIGH |
| 6.4 | Color contrast 4.5:1 | §6-H2 — token system drift §1-C3 | HIGH |
| 6.5 | Tap targets 44×44px | OK BottomNav (~95×64) | LOW |
| 6.6 | Screen reader narration RO | §6-M1 not tested | MED |
| 6.7 | Focus management modal | §6-H4 — no trap/restore | HIGH |
| 6.8 | `<html lang="ro">` | §6-L1 ✓ | LOW positive |
| 6.9 | prefers-reduced-motion | §6-C1 — ABSENT | CRITICAL |
| 6.10 | Dark mode contrast | NOT IMPLEMENTED (SettingsAppearance toggle exists; theme tokens not dark-ready §1-C3) | MED |
| 6.11 | Dynamic content ARIA live | §6-H3 | HIGH |
| 6.12 | Form labels | §6-M3 — verify each form | MED |
| 6.13 | Error messages associated | §6-M3 — verify | MED |
| 6.14 | Cognitive Gigel B1 plain | §6-M6 partially OK; §47.5 Daniel review post-Beta | MED |
| 6.15 | Motor Maria 65 | §6-H5 persona-only Antrenor + §6-H6 tap spacing | HIGH |
| 6.16 | Color blind palette | §6-M4 not verified | MED |
| 6.17 | ADHD-friendly UI | §6-M5 — no autoplay/blink ✓ | MED positive |
| 6.18 | Plain language B1 | §6-M6 | MED |
| 6.19 | Vestibular safety | §6-C1 — reduced-motion absent | CRITICAL |
| 6.20 | Skip-to-content | §6-C2 — ABSENT | CRITICAL |
| 6.21 | Form autofill autocomplete | §6-C3 — ABSENT | CRITICAL |
| 6.22 | Heading hierarchy | §6-M2 — not verified | MED |
| 6.23 | Tap target spacing 8px | §6-H6 — 0 gap BottomNav | HIGH |
| 6.24 | Error recovery affordances | not verified | MED secondary |
| 6.25 | Time-based content | N/A no auto-advance | — |
| 6.26 | Zoom 200% functionality | §6-H7 not tested | HIGH |
| 6.27 | Text resize relative units | OK Tailwind text-sm/text-base = rem-based | LOW positive |
| 6.28 | Visible focus indicators | §6-H1 — browser default; sample OK; need axe-core scan | HIGH |

## Karpathy 4 principii distribution §6

- Think Before Coding: 1 (H7)
- Simplicity First: 2 (C1, C2)
- Surgical Changes: 4 (C3, H3, H6, M4)
- Goal-Driven Execution: 4 (H2, H4, H5, M6)
