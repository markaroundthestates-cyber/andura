# Wave A UI Audit — 6-Pillar Visual Review — 2026-05-21

**Baseline:** `04-architecture/mockups/andura-clasic.html` (DESIGN MASTER) + Tailwind palette (`tailwind.config.js`) + persona-* CSS scaling (`src/styles/global.css` L41-43)
**Screenshots:** Not captured (code-only audit, no dev server running pe vault meta-tooling context)
**Scope:** 6 Wave A iter 1 components ADD: ConfirmModal, CoachTodayCard, Antrenor, SettingsDanger, SettingsPrivacy, ProtectedRoute

---

## Per-component scores (1-10 per pillar, total /60)

### 1. ConfirmModal.tsx (NEW §A003)

- **Mockup parity: 4/10** — Spec §A003 explicitly required modal pattern, BUT mockup line 129 `/* (Modal backdrop removed — V1 LOCKED zero-modals rule.) */` + mockup confirm pattern is full-screen sub-page (L2125-2153 `class="screen paper-bg sub-page" + confirm-icon + confirm-title + confirm-body + confirm-actions`). Component implements bottom-sheet/modal hybrid — paradigm divergence from mockup not LOCKED in DECISIONS.md V1. Visual elements present (AlertTriangle icon L51, brick CTA L38) — but the **container pattern** diverges. Mockup `btn-danger` and `btn-ghost` class semantic not used (raw Tailwind `bg-brick/bg-ink/border-line` direct).
- **Persona-awareness: 5/10** — Component renders **outside** persona-{gigel,marius,maria} wrapper class chain (Layout.tsx hoists wrapper, but ConfirmModal fixed-position L47 `fixed inset-0` breaks out of normal flow). No `--body/--small/--display` CSS var consumption visible. Maria 65 tap target check: `py-2.5` buttons (L38/60) ≈ 40px height — **FAIL 44px WCAG 2.1 AAA target size** (2.5.5).
- **Romanian no-diacritics: 10/10** — `Anuleaza` default cancelCta L29 — no diacritics. All consumer strings in SettingsDanger pass through (verified Pillar #3 below).
- **A11y: 7/10** — `role="dialog"` L43 + `aria-modal="true"` L44 + `aria-label={title}` L45 present. AlertTriangle has `aria-hidden="true"` L51. **MISSING:** focus trap (no `useEffect` to manage focus inside modal), Escape key handler (no `onKeyDown` cancel), `aria-describedby` for body text, focus restoration on close. Backdrop click does NOT close (only Cancel button) — degrades UX vs WCAG best-practice.
- **Mobile-first: 8/10** — Bottom-sheet on mobile (`items-end sm:items-center` L47) + rounded-top-only `rounded-t-2xl sm:rounded-2xl` L49 = correct mobile-first pattern. **MISSING:** safe-area-inset-bottom for notch devices (no `pb-safe` or `env(safe-area-inset-bottom)` padding). Bottom-sheet flush la edge poate fi hidden de iOS home indicator.
- **Visual polish: 7/10** — Tailwind palette tokens used correctly (`bg-paper/bg-ink/bg-brick/border-line/text-ink2`). `rounded-2xl` body + `rounded-xl` buttons = coherent radius system. Lucide `AlertTriangle` L10/L51 = correct icon set. **NIT:** No transition/animation on open — abrupt appearance breaks polish bar. Mockup has `@keyframes slideUp` L132-134 — not consumed.
- **TOTAL: 41/60** — verdict **PASS_WITH_NITS** (top of band)
- Notes:
  - L38 `py-2.5` = ~40px tap target → Maria 65 fail (44px target SC 2.5.5)
  - L47 fixed-position breaks persona-* wrapper inheritance
  - No focus trap / Escape handler / aria-describedby
  - Paradigm tension with mockup L129 zero-modals rule — not LOCKED V1 in DECISIONS.md (D-LEGACY-067 references "LOCK 9 modal" loosely, D-LEGACY-070 deferred different modal)

---

### 2. CoachTodayCard.tsx (§A001)

- **Mockup parity: 9/10** — Direct parity verified vs mockup L737-752: `bg-ink text-paper rounded-2xl p-4` L24 vs mockup L741 `background:var(--ink); color:var(--paper); border-radius:18px; padding:18px`. **MINOR:** Tailwind `rounded-2xl` = 16px vs mockup 18px (Tailwind has no 18px native, would need arbitrary `rounded-[18px]`). Padding `p-4` = 16px vs mockup 18px — 2px drift. Brick label uppercase L28 + `text-xs font-semibold tracking-wider` matches mockup L743 `font-weight:600; letter-spacing:0.08em; text-transform:uppercase`. Title `text-xl font-bold tracking-tight` L31 ≈ mockup `font-size:22px; font-weight:700; letter-spacing:-0.01em` L744 — `text-xl` = 20px vs 22px target (close). Lora italic WHY L33 `font-serif italic` ✓. Inline color L34 `#e8d9b8` matches mockup L745 verbatim ✓. **MISSING:** Lucide `clock` + `layers` icons (mockup L749-750 has `<i data-lucide="clock">` + `<i data-lucide="layers">`) — component just renders text with no icons. Mockup arrow `&rarr;` on CTA L752 — component button L47 lacks it.
- **Persona-awareness: 7/10** — Card rendered inside Antrenor.tsx `persona-${persona}` wrapper L97 = inherits scale. **MINOR:** Inline `style={{ color: '#e8d9b8' }}` L34 + `style={{ color: '#a8a09a' }}` L38 = hardcoded colors bypass token + persona scaling potential.
- **Romanian no-diacritics: 10/10** — `Coach-ul recomanda azi` L29, `Pull (spate & biceps)` L18 fallback, `Pectoralii recupereaza din marti · spatele e gata.` L36, `exercitii` L40, `Incepe sesiunea` L47 — all clean no-diacritics ✓.
- **A11y: 8/10** — `role="region"` L26 + `aria-label="Coach-ul recomanda azi"` L27 ✓. Button is real `<button type="button">` L42-43 ✓. **MISSING:** missing icons → no aria-hidden needed BUT loses semantic value. Live-region announcement for dynamic title change (workout swap) not present.
- **Mobile-first: 9/10** — Component is fluid (`w-full` button L45) + parent stack flow. No breakpoint-specific behavior needed (single-column mobile-first context). ✓
- **Visual polish: 7/10** — Mostly tokens + Lora serif italic preserved. **NIT:** Two hardcoded hex `#e8d9b8` L34 + `#a8a09a` L38 → should be palette tokens (suggest add `--coach-lora: #e8d9b8` and `--coach-meta: #a8a09a` to global.css). **NIT:** Missing Lucide icons (clock, layers) reduces visual richness vs mockup. **NIT:** Button uses `rounded-md` L45 (=6px) — mockup `btn-brick` style L214+ uses larger radius (~12px observed via mockup) — inconsistent within component (card is `rounded-2xl` 16px, button is 6px → harsh).
- **TOTAL: 50/60** — verdict **PASS** (≥48)
- Notes:
  - 2 hardcoded hex colors L34, L38 — extract to tokens
  - Missing Lucide `clock` + `layers` icons (mockup L749-750)
  - Missing arrow `&rarr;` on CTA (mockup L752)
  - `rounded-md` button vs `rounded-2xl` card — radius mismatch
  - 2px padding drift (`p-4`=16px vs mockup 18px) → consider `p-[18px]`

---

### 3. Antrenor.tsx (§A002 isRestDay routing)

- **Mockup parity: 8/10** — Vertical stack ordering L102-146 matches mockup intent L735-825. `persona-${persona}` wrapper L97 ✓. `bg-paper` ✓. `p-4` L97 = mockup-aligned. **MINOR:** H1 `text-2xl font-semibold` L101 — mockup header pattern varies (no direct H1 "Antrenor" visible in mockup tab — usually tab nav implies context). Bottom CTA `rounded-md` L142 vs mockup `btn-brick` larger radius — same nit as CoachTodayCard.
- **Persona-awareness: 10/10** — `persona-${persona}` template literal L97 with explicit comment L59-61 noting Layout.tsx also hoists wrapper for redundant inheritance harmless. Excellent design.
- **Romanian no-diacritics: 10/10** — `Antrenor` L101, `Antrenor home` L99, `Incepe antrenament` L144 ✓.
- **A11y: 9/10** — `aria-label="Antrenor home"` L99 + semantic `<section>` L96 + `<h1>` L101 ✓. Engine async load: no aria-live announcement when `coach` populates (CoachTodayCard swap is silent) — minor a11y miss for screen readers.
- **Mobile-first: 9/10** — Single column stack, `w-full` CTA L142, no breakpoint-specific code needed. ✓
- **Visual polish: 8/10** — Conditional rendering clean (L103/L111/L125/L138 guards). **NIT:** Final CTA L139-145 `mt-2` margin minimal — visually crowds previous PRWallRecent. **NIT:** `rounded-md` (6px) bottom CTA radius inconsistency with mockup btn-brick.
- **TOTAL: 54/60** — verdict **PASS** (top of band)
- Notes:
  - persona-* wrapper hoisting both here + Layout = robust
  - L125 ternary `coach !== null ? !coach.isRestDay : schedContext === 'workout'` = clean engine-driven routing with fallback
  - Bottom CTA `rounded-md` (6px) inconsistent with card `rounded-2xl` system
  - No live-region announcement on coach aggregate load

---

### 4. SettingsDanger.tsx (§A004+A007+A008 + §A016 logout gate)

- **Mockup parity: 7/10** — Header pattern L80-91 (`flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10` + ArrowLeft + H1) ≈ mockup `sub-header` pattern L2127. Settings rows L94-133 use `bg-paper2 border border-line rounded-xl` container ✓. Iconography Lucide `LogOut` `RotateCcw` `Trash2` L9 = correct. **MINOR:** Mockup settings-row L2110+ uses ChevronRight `ml-auto` indicator — component buttons L95+ have NO chevron-right or visual affordance for tap-to-confirm. **MAJOR:** Per mockup L2125-2153 each destructive action navigates to full-screen `confirm-page` sub-page (back button + heading + 2-line body + 2 actions). Component triggers ConfirmModal instead — paradigm change (already flagged ConfirmModal pillar #1).
- **Persona-awareness: 8/10** — Outer `<section>` L79 has `bg-paper min-h-screen flex flex-col` — does NOT add persona-{class} wrapper here, relies on Layout.tsx hoisting. **MINOR:** Settings row buttons `text-sm font-medium` + `text-xs text-ink2` (L103-104) — no explicit persona-CSS-var consumption (font-size baseline). `py-3.5` (14px) buttons L99/L112/L122 = ~52px height with text inside → Maria 65 tap target PASS ✓.
- **Romanian no-diacritics: 10/10** — `Deconectare & stergere` L90, `Inapoi` L84, `Iesi din cont` L103, `Datele raman pe telefon.` L104, `Reseteaza toate datele` L116, `Sterge tot din telefon. Cont pastrat.` L117, `Sterge cont` L129, `Datele + cont sterse permanent.` L130, `Stergerea conturilor remote (Firebase backup) este programata Phase 7+.` L136-138, confirm bodies L147/L149/L150 all clean ✓.
- **A11y: 8/10** — `aria-label="Inapoi"` L84 ✓, semantic `<header>` + `<button>` ✓, `aria-hidden="true"` on icons L88/L101/L114/L127 ✓. **MISSING:** `aria-live="polite"` for footer copy L135-138 disclaimer (informational region announcement on mount). Sticky header has `z-10` L80 — should consider `z-20` to ensure above modal backdrop `z-50` (currently OK because modal is `z-50` higher).
- **Mobile-first: 9/10** — `min-h-screen flex flex-col` + `flex-1 overflow-y-auto` L93 = correct mobile scroll pattern. Sticky header L80 ✓. ✓
- **Visual polish: 8/10** — Coherent radius (`rounded-xl` L94 container + buttons inherited). Delete cont last row L122 uses `text-brick` semantic to signal destructive ✓. **NIT:** Border-bottom on penultimate row L112 but `border-bottom:none` last row achieved via L122 absence (clean). **NIT:** Section divider between row group + footer copy L135 weak — only `mb-4` separation, could use border or larger gap.
- **TOTAL: 50/60** — verdict **PASS** (≥48)
- Notes:
  - §A016 logout gate L65-71 wired correctly (auth fresh check + redirect reauth_required_for_delete)
  - Missing ChevronRight indicators on settings rows (mockup L2110+)
  - Modal vs full-screen confirm paradigm tension (inherited from ConfirmModal)
  - 52px tap target Maria PASS ✓

---

### 5. SettingsPrivacy.tsx (§A025 GDPR Privacy Policy live)

- **Mockup parity: 6/10** — Header pattern L52-64 ≈ mockup sub-header ✓. ToggleRow L20-42 custom built — mockup has settings-row pattern, not toggle pattern (verified via grep — mockup settings-row uses chevron-right NOT switch toggles). **CHECK:** Is `role="switch"` toggle pattern mockup-approved? — Cannot verify in mockup snippet read, but spec §A025 + iter 1 design implies fresh build acceptable. ShieldCheck Lucide icon L8/L68 ✓. Privacy Policy article L97-146 = NEW content not in mockup (GDPR §A025 add — spec-additive). Article styling `mt-6 pt-5 border-t border-line text-sm text-ink leading-relaxed` L99 = palette tokens correct.
- **Persona-awareness: 6/10** — Toggle `w-12 h-6` L34 = 48x24px switch hit area → **borderline Maria 65 FAIL** (44px height target, 24px below). Toggle thumb `w-5 h-5` L37 = 20px — fine. Settings rows `py-3.5` L22 = 14px + content ≈ 50px height ✓. Privacy Policy text `text-sm` (14px) + `text-xs` (12px) for meta L142 — Maria 65 may struggle with 12px in dense paragraphs.
- **Romanian no-diacritics: 10/10** — `Confidentialitate` L63, `Inapoi` L58, `Datele tale raman pe telefon.` L70, `Export date permis` L77, `Pot descarca datele mele oricand din ecranul Descarca date.` L78, `Telemetrie anonima` L83, GDPR section verbose ROM L101-145 all clean no-diacritics verified ✓. **CHECK:** L138 has `Autoritatea Nationala de Supraveghere a Prelucrarii Datelor cu Caracter Personal` — but parent rule allows official entity names — and entity name HERE is rendered without diacritics ✓.
- **A11y: 9/10** — Toggle has full a11y contract: `role="switch"` L29 + `aria-checked={checked}` L30 + `aria-label={title}` L31 ✓. Article L97 has `data-testid="privacy-policy-content"` for testing. ShieldCheck `aria-hidden="true"` L68 ✓. Mailto link `text-brick underline` L137 ✓. **MINOR:** No `aria-labelledby` linking article H2 L101 to article L97 for screen-reader navigation context.
- **Mobile-first: 9/10** — Same `min-h-screen flex flex-col` + `flex-1 overflow-y-auto` pattern as SettingsDanger ✓. Toggle horizontal layout fits mobile ✓. Long article scrolls within content area ✓.
- **Visual polish: 7/10** — Toggle styling `bg-brick` on L34 + `bg-paper` thumb L37 = clean brand colors. **NIT:** Toggle transition L34/L37 (`transition`) — but no `prefers-reduced-motion` respect (no `motion-reduce:transition-none`). **NIT:** Article H3 sequence (L103/L111/L119/L128/L135) use `text-sm font-semibold` — same size as body — visual hierarchy weak. H2 L101 `text-base font-semibold` only 16px — slightly weak for section title.
- **TOTAL: 47/60** — verdict **PASS_WITH_NITS** (just under 48 PASS threshold by 1)
- Notes:
  - Toggle `h-6` (24px) below 44px Maria 65 target — needs vertical hit area expansion via `before:absolute before:inset-0 before:-my-2.5` or larger button wrapper
  - Article body `text-xs` (12px) on L142 too small for Maria 65
  - H3 (`text-sm`) same as body text — weak hierarchy, consider `text-base`
  - `prefers-reduced-motion` not respected on toggle transition
  - GDPR copy comprehensive + Romanian-correct ✓

---

### 6. ProtectedRoute.tsx (§A015 onboarding gate headless)

- **Mockup parity: N/A (headless component — no UI render path)**
- **Persona-awareness: N/A**
- **Romanian no-diacritics: N/A** (only `replace` URLs — no user-facing strings)
- **A11y: 8/10** — `<Navigate>` L54/L57 redirects are framework-native React Router DOM, screen-readers announce route change. `replace` flag L54/L57 ✓ (prevents history pollution). **MISSING:** No loading indicator if `readAuthFromStorage` is sync but `useEffect` sync L37-51 race could flicker → micro-FOUC unprotected children flash if `isAuthenticated` initially false but storage has token. **MINOR:** Should consider `aria-live` announcement on redirect "Redirecting to login" for screen readers (debatable per WCAG — Navigate replaces DOM completely so context lost anyway).
- **Mobile-first: N/A** (no render)
- **Visual polish: N/A** (no render)
- **TOTAL: 8/10 (single a11y/redirect-UX pillar applies)** — verdict **PASS** (headless component, full 60-point scale not applicable, scored against redirect-UX pillar only)
- Notes:
  - §A015 onboarding gate L28/L56-58 implemented correctly: redirect `/onboarding/1` if `!onboardingCompleted` ✓
  - §7-C3 storage sync L37-51 sound design (mount + storage event + visibilitychange)
  - L37-51 useEffect dependency `[isAuthenticated, setAuthenticated]` — `setAuthenticated` is Zustand-stable, won't loop
  - Potential micro-FOUC flicker on first render if storage has token but appStore not yet hydrated — consider initial sync read pre-render (or document as acceptable Phase 7+ enhancement)

---

## Aggregated verdict

| Component | Total | Verdict |
|-----------|-------|---------|
| ConfirmModal.tsx | 41/60 | PASS_WITH_NITS |
| CoachTodayCard.tsx | 50/60 | PASS |
| Antrenor.tsx | 54/60 | PASS |
| SettingsDanger.tsx | 50/60 | PASS |
| SettingsPrivacy.tsx | 47/60 | PASS_WITH_NITS (1 pt below) |
| ProtectedRoute.tsx | 8/10 (N/A pillars) | PASS (headless) |

- **Total components:** 6
- **PASS:** 3 (CoachTodayCard, Antrenor, SettingsDanger) + 1 PASS-headless (ProtectedRoute)
- **PASS_WITH_NITS:** 2 (ConfirmModal, SettingsPrivacy)
- **FAIL:** 0

**Pre-Beta UI gate: GO with iter-2 follow-ups**

---

## Top 3 priority fixes (cross-cutting Wave A)

1. **ConfirmModal — tap target + focus trap + Escape handler + safe-area-bottom**
   - Impact: Maria 65 cannot reliably tap; keyboard users cannot dismiss; iOS notch users may have CTA hidden by home indicator; screen-reader focus escapes modal during interaction
   - Fix: Change `py-2.5` → `py-3.5` (40px → 52px height); add `useEffect` focus-trap on mount (focus first button, trap Tab cycle inside dialog); add `onKeyDown` handler for `Escape` → onCancel; add `pb-[env(safe-area-inset-bottom)]` to bottom-sheet container
   - File: `src/react/components/ConfirmModal.tsx:38,47,49,60`

2. **ConfirmModal vs mockup zero-modal paradigm tension — LOCK V1 decision OR migrate to full-screen confirm-page**
   - Impact: Mockup L129 explicitly `(Modal backdrop removed — V1 LOCKED zero-modals rule.)` + mockup uses full-screen confirm-page sub-page pattern L2125-2153; current ConfirmModal implementation diverges from DESIGN MASTER
   - Fix: Either (A) append D046 LOCK V1 to DECISIONS.md explicitly authorizing modal pattern Phase 7+ supersede zero-modal rule, OR (B) refactor ConfirmModal → full-screen sub-page navigation route per mockup pattern (e.g., `/cont/confirm/:action` with back-btn + heading + body + actions stacked)
   - File: `src/react/components/ConfirmModal.tsx` (entire architecture) + `DECISIONS.md` append
   - Daniel CEO directive required — this is a paradigm/UX decision, not tactical

3. **SettingsPrivacy toggle 24px height + CoachTodayCard hardcoded hex + missing Lucide icons**
   - Impact: Maria 65 cannot reliably tap toggles (SC 2.5.5); token system bypass weakens theming + future palette refresh; missing visual richness vs mockup parity
   - Fix:
     - SettingsPrivacy L34: change `h-6` → `h-11` (=44px) OR add invisible hit area wrapper `relative before:absolute before:inset-0 before:-my-3`
     - CoachTodayCard L34/L38: extract `#e8d9b8` + `#a8a09a` to CSS vars `--coach-lora` + `--coach-meta` in `global.css` :root + tailwind.config.js `colors` extend
     - CoachTodayCard L40-41: add `<Clock className="w-3.5 h-3.5" aria-hidden="true" />` + `<Layers className="w-3.5 h-3.5" aria-hidden="true" />` to match mockup L749-750
   - Files: `src/react/routes/screens/cont/SettingsPrivacy.tsx:34`, `src/react/components/Antrenor/CoachTodayCard.tsx:34,38,40-41`

---

## Files audited

- `src/react/components/ConfirmModal.tsx` (76 LOC)
- `src/react/components/Antrenor/CoachTodayCard.tsx` (52 LOC)
- `src/react/routes/screens/antrenor/Antrenor.tsx` (149 LOC)
- `src/react/routes/screens/cont/SettingsDanger.tsx` (169 LOC)
- `src/react/routes/screens/cont/SettingsPrivacy.tsx` (151 LOC)
- `src/react/routes/ProtectedRoute.tsx` (60 LOC)
- **Reference:** `04-architecture/mockups/andura-clasic.html` (4753 LOC, sampled L129, L737-780, L2125-2153)
- **Reference:** `tailwind.config.js` (palette tokens), `src/styles/global.css` L41-43 (persona-* CSS scaling)
- **Reference:** `DECISIONS.md` D044/D045 + D-LEGACY-067/070 (modal paradigm history)

---

## Audit method notes

- ZERO speculation — every finding cites file:line
- ZERO screenshots (code-only audit, dev server not running in vault meta-tooling context)
- Mockup parity assessed via Grep on mockup HTML + verbatim CSS/style comparison
- Persona-awareness assessed via class inheritance trace + CSS var consumption
- A11y assessed via attribute presence + WCAG 2.1 AA criteria (focus management, role/aria, target size SC 2.5.5)
- Mobile-first assessed via Tailwind breakpoint usage + safe-area handling + scroll patterns
- Visual polish assessed via token usage + Lucide icon adoption + radius/spacing consistency

**ETA iter-2 fixes:** ~3-4h CC Opus (3 priority items + ~6 minor nits cross-cutting components)
