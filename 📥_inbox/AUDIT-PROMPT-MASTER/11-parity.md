# SECTION 11 — MOCKUP PARITY (interfata-noua/ ↔ live React)

> **Weight 8% · Gate 90% · Critical: no.**
>
> **What this section is.** Every live screen, element by element, diffed against
> Daniel's hand-built Pulse mockup `04-architecture/mockups/interfata-noua/`
> (`screens-entry.jsx`, `screens-antrenor.jsx`, `screens-workout.jsx`,
> `screens-tabs.jsx`, `ui.jsx`, `index.html <style>`). This is the section that
> would have caught the "days-of-the-week are a different colour than the mockup"
> issue Daniel found on 2026-05-29: a per-ELEMENT colour/spacing/typography diff,
> not a "looks fine" eyeball.
>
> **The mockup is a LAYOUT/INTERACTION + VISUAL spec, NOT an architecture** (per
> `_INTEGRATION-BLUEPRINT.md` cardinal rule 1). Some live deviations are
> *deliberate* (kept routes, kept engine wiring, kept legal/safety gates, WCAG
> nudges off raw mockup hex). Those are recorded as PASS-with-note or PARTIAL
> with the rationale cited — they are NOT silent passes, and the auditor must
> still record the exact delta so Daniel can rule. A deviation with NO documented
> rationale = PARTIAL minimum.
>
> **Method per step.** Render the LIVE screen (seeded account — see
> §APPENDIX-SEED; an empty app hides most of these) AND render the mockup screen
> (`interfata-noua/index.html` served over HTTP — it does NOT run from `file://`,
> per the Pulse-redesign memory note). Compare the named element: colour
> (computed value vs the mockup token/hex), spacing/padding (computed px),
> typography (font-family + size + weight + letter-spacing), composition
> (presence/order/structure of the element).
>
> **Machine bar.** Where a step is a whole-screen pixel diff, the HARNESS
> `tests/visual-regression.spec.ts` (`toHaveScreenshot`, `animations:'disabled'`,
> `maxDiffPixelRatio:0.02`) is the screenshot-diff reference. NOTE: that harness
> currently only shoots the public `/` route at 3 viewports (lines 35-75) and is
> LOCAL-OPT-IN, excluded from CI (lines 11-15) with no committed baselines — so
> the per-screen parity below is mostly JUDGEMENT + computed-value checks a
> screenshot-diff subagent runs ad hoc, NOT a green CI gate. Extending the
> harness to shoot every screen at a frozen baseline is itself step `11.901`.
>
> **Colour discipline.** Every colour step names the EXPECTED Pulse token AND its
> hex from `global.css` / the mockup `index.html` `:root`, and the live check is
> "the computed colour of element X equals that token's resolved value." The Pulse
> palette (dark, the CEO-default look):
> `--volt #b6f23a` · `--aqua #4fd6e8` · `--ember #ff7d52` · `--violet #a98bff` ·
> `--ink #f3f5fc` · `--ink-2 #a7adc4` · `--ink-3 #82889e` (live, nudged from
> mockup `#6a7088` for AA) · `--brick`=`--volt` (the primary accent token) ·
> `--surface rgba(24,29,46,0.72)` (glass card fill) · `--on-accent #0a0c14`.
> Light theme values per `global.css` lines 111-175 / 264-311.

---

## 11.0 — Foundation tokens + shared primitives (gate every screen depends on)

### [11.001] Pulse accent family tokens present + exact hex
- **Check:** The four Pulse accent CSS vars resolve to the mockup's exact hex.
- **Where:** live `src/styles/global.css:100-101` (`:root`/base) vs mockup `interfata-noua/index.html:11` (`:root`).
- **Expected:** `--volt:#b6f23a`, `--volt-deep:#8fd218`, `--aqua:#4fd6e8`, `--aqua-deep:#2bb6cc`, `--ember:#ff7d52`, `--ember-deep:#f4571f`, `--violet:#a98bff` — byte-for-byte.
- **Verify:** Playwright `getComputedStyle(document.documentElement).getPropertyValue('--volt')` etc. → each equals the mockup hex. Or grep both files for each token and compare.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: computed values for all 7 tokens, both files.)_
- **Notes:** —

### [11.002] Gradient tokens match mockup
- **Check:** `--grad-pulse` and `--grad-ember` equal the mockup definitions.
- **Where:** live `global.css:102-103` vs mockup `index.html:13-14`.
- **Expected:** `--grad-pulse: linear-gradient(135deg, var(--volt) 0%, var(--aqua) 100%)`; `--grad-ember: linear-gradient(135deg, var(--ember) 0%, var(--violet) 120%)`.
- **Verify:** grep both; computed `--grad-pulse` resolves to the volt→aqua 135deg gradient.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.003] Font tokens — display / body / mono families
- **Check:** `--font-display`/`--font-body`/`--font-mono` map to Space Grotesk / Manrope / Space Mono.
- **Where:** live `global.css:104-106` (self-host `@fontsource`, lines 30-61) vs mockup `index.html:9,16` (Google Fonts `@import`).
- **Expected:** display = `'Space Grotesk Variable',…`; body = `'Manrope Variable',…`; mono = `'Space Mono',…`. (Live self-hosts via fontsource — DELIBERATE, CSP-safe per global.css:14-29; the FAMILY must match, the loading mechanism is allowed to differ.)
- **Verify:** computed `font-family` on a `.font-display` heading contains "Space Grotesk"; on body contains "Manrope"; on a `.font-mono` element contains "Space Mono". Confirm the WOFF2 actually loads (Network panel / `document.fonts.check`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** If a font fails to load and Inter/system shows instead → PARTIAL (family identity lost). Verify the unicode-range Latin subset covers the no-diacritics RO glyph set.

### [11.004] Radius tokens — 22px / 14px
- **Check:** `--radius:22px`, `--radius-sm:14px`.
- **Where:** live `global.css:107` vs mockup `index.html:15`.
- **Expected:** equal.
- **Verify:** computed values.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.005] Glass surface tokens (dark) — exact alpha
- **Check:** `--surface`, `--surface-2`, `--surface-solid` equal the mockup dark values.
- **Where:** live `global.css:209-211` vs mockup `index.html:20`.
- **Expected:** `--surface:rgba(24,29,46,0.72)`, `--surface-2:rgba(33,39,60,0.78)`, `--surface-solid:#141826`.
- **Verify:** computed values under `[data-theme="dark"]`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** These drive every `.pulse-card`. Any drift = every card off.

### [11.006] `--ink-3` deliberate AA nudge vs mockup raw hex
- **Check:** Live `--ink-3` differs from the mockup on purpose for WCAG AA.
- **Where:** live `global.css:192` (dark `#82889e`) / `:116` (light `#686e82`) vs mockup `index.html:22` dark `#6a7088` / `:31` light `#8a90a5`.
- **Expected:** PARTIAL-by-design — live nudges ink-3 up (5.02:1 dark / 4.45:1 light) over the mockup hex (3.61:1 / 2.79:1, both fail AA). The muted-grey IDENTITY is preserved; the exact hex intentionally differs.
- **Verify:** computed `--ink-3` ≠ mockup hex but within the same cool-grey hue; cross-check §10 a11y contrast.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** PARTIAL is the CORRECT verdict (documented deviation). Record the exact delta. Same class as `--line-strong` (next step).

### [11.007] `--line-strong` deliberate AA nudge (solid vs mockup alpha hairline)
- **Check:** Live `--line-strong` is a solid colour, not the mockup's low-alpha white.
- **Where:** live `global.css:194` (dark `#5c6278`) / `:118` (light `#787e92`) vs mockup `index.html:21` (`rgba(255,255,255,0.17)`) / `:31` (`rgba(12,16,30,0.16)`).
- **Expected:** PARTIAL-by-design — mockup alpha hairline is ~1.6:1 (fails SC 1.4.11 UI boundary); live solidifies to 3.25:1 dark / 3.55:1 light.
- **Verify:** computed value is opaque, ≥3:1 vs surface.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Documented deviation → PARTIAL with rationale. Affects every `--line-strong` border (ob-check, calendar rest dot, sheet grip).

### [11.008] `.pulse-card` treatment = mockup `.card` (glass, not flat)
- **Check:** The live glass-card class reproduces the mockup `.card`: translucent `--surface` fill + `backdrop-filter: blur(14px)` + `1px var(--line)` border + `--shadow-card` + `::before` top sheen.
- **Where:** live `global.css:417-458` (`.pulse-card`) vs mockup `index.html:46,90` (`.card` + `.card::before`).
- **Expected:** background `var(--surface)`; border `1px solid var(--line)`; border-radius `var(--radius)`; box-shadow `var(--shadow-card)`; `::before` linear-gradient sheen `rgba(255,255,255,0.05)→transparent 30%`.
- **Verify:** computed style of a `.pulse-card` element matches each property; `backdrop-filter` present (mockup `.card` has no explicit blur — live ADDS blur:14px deliberately for the glass-over-aurora look; record as enhancement-aligned).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** The FIRST Pulse reskin shipped solid `bg-paper2` (flat) — global.css:413-416 documents migrating containers → `.pulse-card`. Any screen still using `bg-paper2 border border-line rounded-*` instead of `.pulse-card` is a parity FAIL for that card (see per-screen checks, esp. 11.6 Settings).

### [11.009] `.pulse-card-tight` radius 14px for nested/stat tiles
- **Check:** Nested stat tiles use `--radius-sm` (14px), not 22px.
- **Where:** live `global.css:426` vs mockup `index.html:47` (`.card-tight`).
- **Expected:** border-radius `var(--radius-sm)` = 14px.
- **Verify:** computed border-radius on a stat tile (MiniStat / HistStat equivalents).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.010] `.label` micro-eyebrow style (mono uppercase 10px tracked)
- **Check:** The shared `.label` / `Kicker` style equals the mockup `.label`.
- **Where:** mockup `index.html:45` (`.label`) + `ui.jsx:272-275` (`Kicker`) vs live `Kicker` `src/react/components/pulse/Kicker.tsx`.
- **Expected:** `font-family:var(--font-mono)`, `text-transform:uppercase`, `letter-spacing:0.16em` (Kicker 0.18em), `font-size:10px`, `color:var(--ink-3)` (Kicker overridable).
- **Verify:** read live Kicker.tsx; computed style on a rendered Kicker.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.011] `Pill` primitive — padding/radius/mono/colour-mix bg
- **Check:** Live `Pill` matches mockup `Pill` (`ui.jsx:277-288`).
- **Where:** mockup `ui.jsx:277-288` vs live `src/react/components/pulse/Pill.tsx`.
- **Expected:** `padding:5px 11px`, `border-radius:999`, `font-family:var(--font-mono)`, `font-size:10.5px`, `letter-spacing:0.06em`, uppercase; non-solid bg = `color-mix(in oklab, <color> 16%, transparent)` + `1px color-mix(<color> 40%)` border; solid = fill `<color>` + `--on-accent` text.
- **Verify:** read live Pill.tsx; computed style of a rendered Pill (solid + outline).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.012] `.btn-grad` primary gradient CTA
- **Check:** The volt→aqua gradient CTA reproduces mockup `.btn-grad` (`index.html:55`).
- **Where:** mockup `index.html:51-55,82` (`.btn`,`.btn-grad`, shine `::after`) vs live `.pulse-grad-bg`/`.pulse-shine` (`global.css:874-893`) or whatever class the CTAs use.
- **Expected:** background `var(--grad-pulse)`, `color:var(--on-accent)`, `padding:15px 22px`, `border-radius:999px`, `font-weight:700`, diagonal shine sweep `::after`.
- **Verify:** computed style of a primary CTA (Auth send, CoachToday "Start session", Workout "Confirm set" uses btn-primary). Confirm the shine sweep animates (and collapses under reduced-motion).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.013] `.btn-ghost` secondary CTA
- **Check:** Ghost button = `--surface-2` fill + `--line` border + `--ink` text, 14px×20px pad.
- **Where:** mockup `index.html:56-57` vs live ghost/secondary button class.
- **Expected:** background `var(--surface-2)`, border `1px var(--line)`, padding `14px 20px`, radius 999.
- **Verify:** computed style of a ghost CTA (e.g. Workout exit-sheet "Continue").
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.014] BottomNav — pill indicator + mono labels + accent active
- **Check:** Live `BottomNav` matches mockup `.bnav` (`ui.jsx:236-269`): 4 cols, sliding top pill `.bnav-top i` (30×3 accent w/ glow), active icon chip bg `color-mix(--accent 16%)`, mono 9px uppercase labels.
- **Where:** mockup `ui.jsx:236-269` vs live `src/react/components/BottomNav.tsx`.
- **Expected:** active tab text `var(--accent)`/`--brick`; label `font-mono` 9px letter-spacing 0.1em uppercase; sliding indicator 30px×3px with `box-shadow:0 0 12px var(--accent)`; tab order Coach/Progress/History/Account.
- **Verify:** render app shell; computed styles on active + inactive tab; confirm the indicator slides on tab change. Screenshot-diff the nav bar.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Tab labels go through i18n (`tabs.*`) — confirm RO no-diacritics; mockup hardcodes English.

### [11.015] Aurora background present behind app shell
- **Check:** Three drifting aurora blobs render behind the column (mockup `bg.jsx` + `index.html:58-60` aurora keyframes).
- **Where:** mockup `bg.jsx` vs live `src/react/components/BackgroundAurora.tsx` + `global.css:811-843` (`.animate-aurora-1/2/3`).
- **Expected:** 3 blurred blobs in volt/aqua/ember family, slow 32-44s drift, transform-only, collapse under reduced-motion + `[data-calm="1"]`.
- **Verify:** render shell; confirm 3 blob elements present + animating; confirm glass cards show the aurora through (`--surface` alpha < 1).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** The glass-over-aurora effect is the whole point of `--surface` translucency (11.005/11.008). If aurora is missing, cards float over flat bg = parity FAIL.

### [11.016] Desktop phone bezel (≥768px) renders device frame
- **Check:** On desktop the app renders inside a phone bezel + notch (Daniel "arata mai bine cu el"); mobile stays edge-to-edge.
- **Where:** live `global.css:975-1005+` (desktop bezel block) vs mockup `app.jsx` PhoneFrame (402×856, radius 52/42).
- **Expected:** ≥768px → centered device with bezel ring + notch, internal scroll, sticky SubHeader + fixed BottomNav pin to the SCREEN (not viewport); <768px → no frame.
- **Verify:** resize to 1280px → device frame visible, BottomNav pinned to screen bottom, SubHeader sticks; resize to 390px → edge-to-edge, no frame.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Memory note: the frame previously broke sticky SubHeader + fixed BottomNav; verify those are NOT broken now.

---

## 11.1 — GROUP A · ENTRY (Splash / Auth / Onboarding)

### 11.1.A — SPLASH (`Splash.tsx` ↔ `screens-entry.jsx:25-52`)

### [11.101] Splash — animated PulseMark logo present
- **Check:** Splash shows the animated `PulseMark` (size 96), not the old two-CTA landing.
- **Where:** live `Splash.tsx:65-67` vs mockup `screens-entry.jsx:32` (`PulseMark size=96`).
- **Expected:** `PulseMark size={96}` with the volt→aqua gradient EKG stroke + faint ring (mockup `screens-entry.jsx:5-21`).
- **Verify:** render `/` (unauth) → PulseMark SVG present at ~96px; gradient stroke `url(#lg)` volt→aqua; screenshot-diff vs mockup splash logo.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.102] Splash — "ANDURA" gradient wordmark typography
- **Check:** Wordmark uses Space Grotesk display, 42px, bold, wide tracking, volt→aqua gradient text.
- **Where:** live `Splash.tsx:72-77` (`.pulse-gradtext font-display text-[42px] font-bold tracking-[0.12em]`) vs mockup `screens-entry.jsx:39-41` (`.splash-word`: 42px, weight 700, letter-spacing .32em, gradient).
- **Expected:** font-size 42px; weight 700; gradient fill volt→aqua. **DELTA TO CHECK:** mockup tracking is `0.32em` (with `text-indent:.32em`); live is `0.12em`. Letter-spacing mismatch → PARTIAL.
- **Verify:** computed `letter-spacing` on the live `<h1>` = 0.12em; mockup `.splash-word` = 0.32em. Computed `font-size`/`font-weight` match.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(as of read 2026-05-29: live `tracking-[0.12em]` vs mockup `.32em` — likely PARTIAL on tracking.)_
- **Notes:** Fix: bump live tracking to match `.32em`, or confirm Daniel approved the tighter spacing.

### [11.103] Splash — tagline mono eyebrow
- **Check:** Tagline = mono, ~10-11px, ink-3, wide tracking, uppercase.
- **Where:** live `Splash.tsx:81-86` (`font-mono text-[11px] tracking-[0.22em] uppercase text-ink3`) vs mockup `screens-entry.jsx:42` (`.splash-tag`: 10px, letter-spacing .3em, `--ink-3`).
- **Expected:** mono; ink-3; uppercase. **DELTA:** mockup 10px / .3em vs live 11px / .22em → minor PARTIAL.
- **Verify:** computed font-size + letter-spacing.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Live reuses i18n `splash.taglineLine1/2` (mockup hardcodes "YOUR COACH · A LIVING INSTRUMENT") — wording delta is allowed (i18n mandate); typography is the parity check.

### [11.104] Splash — 3-dot loader (volt/aqua/ember)
- **Check:** Three floating dots coloured volt / aqua / ember.
- **Where:** live `Splash.tsx:90-98,108-122` (`.splash-dot` volt; nth-2 aqua; nth-3 ember; 7px) vs mockup `screens-entry.jsx:35,44-46` (7px; volt/aqua/ember).
- **Expected:** 3 dots, 7px, gap 7px, colours volt→aqua→ember, float animation (collapse under reduced-motion).
- **Verify:** computed background of each dot; size 7px; animation present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.105] Splash — auto-advance + tap-to-skip behavior matches
- **Check:** Auto-advances ~2.6s; tap/Enter/Space skips; routes auth-aware.
- **Where:** live `Splash.tsx:28,36-48,52-61` vs mockup `screens-entry.jsx:26-29,31`.
- **Expected:** 2600ms timer; click + keyboard skip; `navigate(isAuthenticated ? '/app/antrenor' : '/auth')`.
- **Verify:** load `/` → after ~2.6s lands on /auth (unauth); tap before → immediate.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### 11.1.B — AUTH (`Auth.tsx` ↔ `screens-entry.jsx:55-114`)

### [11.110] Auth — PulseMark floaty header
- **Check:** Auth header shows a floating `PulseMark` (~62px).
- **Where:** mockup `screens-entry.jsx:61` (`PulseMark size=62`, `.floaty`) vs live `Auth.tsx` header.
- **Expected:** PulseMark ~62px, centered, with float animation.
- **Verify:** render /auth; PulseMark present at ~62px.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.111] Auth — heading gradient text
- **Check:** "Welcome back / Create account" rendered with `.gradtext` volt→aqua, display 30px bold.
- **Where:** mockup `screens-entry.jsx:62-64` vs live `Auth.tsx` heading.
- **Expected:** `.pulse-gradtext` (or equivalent) display 30px weight 700.
- **Verify:** computed font-family/size/weight + gradient fill on the heading.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** i18n string (RO no-diacritics) replaces the English — wording delta allowed.

### [11.112] Auth — email field `.field` styling
- **Check:** Email input = `--surface-2` bg, `1px --line` border, radius 16px, 15px text, focus ring `color-mix(--accent 20%)`.
- **Where:** mockup `screens-entry.jsx:73,103-105` (`.field` + `:focus`) vs live `Auth.tsx` email input (`auth-email-input`).
- **Expected:** padding 15px 16px; radius 16; bg surface-2; focus border `--accent` + 3px ring.
- **Verify:** computed style of `[data-testid="auth-email-input"]`; focus it → ring appears.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.113] Auth — primary send = btn-grad
- **Check:** "Send sign-in link" is the gradient CTA full-width with arrow icon.
- **Where:** mockup `screens-entry.jsx:75-77` vs live `auth-send`.
- **Expected:** btn-grad, width 100%, trailing arrow.
- **Verify:** computed background = grad-pulse; full width.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.114] Auth — "or" divider rule
- **Check:** `.auth-or` divider — mono uppercase "or" centered between two hairlines.
- **Where:** mockup `screens-entry.jsx:78,106-107` vs live divider.
- **Expected:** flexed hairlines `var(--line)` + mono 11px uppercase ink-3 label.
- **Verify:** render; computed style of the divider rule + label.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.115] Auth — Google ghost button (login-only)
- **Check:** "Continue with Google" = ghost button with Google glyph; shows in LOGIN mode only.
- **Where:** mockup `screens-entry.jsx:79-81` (both modes) vs live `auth-google` (`showGoogle && mode==='login'` per blueprint A2).
- **Expected:** btn-ghost styling; Google icon; visible login, hidden signup. **DELIBERATE deviation:** live hides in signup (kept rule) — PASS-with-note, not FAIL.
- **Verify:** login → button present + ghost-styled; switch to signup → button absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Visual styling must still match the ghost spec; the visibility rule difference is allowed.

### [11.116] Auth — signup consent checkbox PRESENT (deliberate add vs mockup)
- **Check:** Signup mode shows the Terms/Privacy consent checkbox the mockup omits.
- **Where:** live `auth-consent`/`auth-consent-checkbox` (blueprint A2) vs mockup (no consent).
- **Expected:** PASS-with-note — live ADDS the legal consent gate; mockup's "Continue without account" is DROPPED. Style the checkbox in the Pulse idiom (line/accent tokens).
- **Verify:** signup → consent checkbox present, send gated until checked; "continue without account" absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Deviation is intentional (legal). Record that the checkbox is themed to Pulse, not an unstyled default.

### [11.117] Auth — magic-link "sent" card
- **Check:** Sent state = glass card with bell icon + expiry copy + "I opened the link" CTA.
- **Where:** mockup `screens-entry.jsx:88-97` vs live `auth-sent`.
- **Expected:** `.pulse-card` + `.sheen`; bell icon aqua; btn-grad continue.
- **Verify:** trigger sent state; card is glass (`--surface`), bell aqua.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.118] Auth — terms footer typography
- **Check:** Footer = ink-3, 11.5px, centered, two lines.
- **Where:** mockup `screens-entry.jsx:99-101` vs live footer.
- **Expected:** ink-3 ~11.5px centered.
- **Verify:** computed style.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### 11.1.C — ONBOARDING (`Onboarding.tsx` ↔ `screens-entry.jsx:117-262`)

### [11.120] Onboarding — top progress bar gradient fill
- **Check:** `.ob-bar` = 6px track `--surface-2` with `--grad-pulse` fill, back chevron left + "N/total" mono right.
- **Where:** mockup `screens-entry.jsx:130-134,165-166` vs live Onboarding step header.
- **Expected:** 6px rounded track; fill `var(--grad-pulse)` width `(step+1)/total`; mono counter ink-3.
- **Verify:** render `/onboarding/:step`; computed track + fill; counter present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Live leads with `age`, mockup with `goal` (blueprint A3) — step ORDER delta is a known structural difference; record but it's not a visual-token FAIL.

### [11.121] Onboarding — STEP kicker + display title 27px
- **Check:** Each step: aqua `Kicker "STEP n"` + display 27px bold title + ink-2 description.
- **Where:** mockup `screens-entry.jsx:137-139` vs live step body.
- **Expected:** Kicker aqua; title `font-display` 27px weight 700 line-height 1.12; desc ink-2 14px.
- **Verify:** computed styles per step.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.122] Onboarding — ChoiceList row (`.ob-row`) selected state
- **Check:** Goal/level rows = `.ob-row` glass, selected → `--accent` border + `color-mix(--accent 9%)` bg + filled check circle.
- **Where:** mockup `screens-entry.jsx:177-202` vs live goal/level step.
- **Expected:** row bg `--surface`, 1.5px `--line`; `.on` border `--accent`; `.ob-check.on` filled `--accent` with `--on-accent` check.
- **Verify:** pick a goal → border turns accent, check fills; computed colours.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Goal IDs map English→RO vocab (blueprint A3); label wording allowed to differ, visual state must match.

### [11.123] Onboarding — sex 2-tile selector
- **Check:** Sex step = 2 tiles (`.ob-tile`), icon recolours to `--accent` when selected.
- **Where:** mockup `screens-entry.jsx:143-153,167-169` vs live sex step.
- **Expected:** grid 1fr 1fr; tile radius 20px; selected border `--accent` + tinted bg; icon stroke `--accent` selected else `--ink-2`.
- **Verify:** render; select → tile + icon recolour.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.124] Onboarding — frequency Stepper (±, big number, dot row)
- **Check:** Freq step = round `--accent` ± buttons (58px), 64px number, row of square dots filling to value.
- **Where:** mockup `screens-entry.jsx:220-238` vs live freq step.
- **Expected:** circular step buttons bg `--accent`, `--on-accent` glyph; number `.num` 64px; dots `--accent` ≤val else `--surface-2`.
- **Verify:** render; computed button bg + number size; dots colour by value.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.125] Onboarding — BigNumberInput (age/kg/cm) underline-accent field
- **Check:** Age/kg/cm steps = giant 58px `.num` input with `2px --accent` bottom border + unit + helper.
- **Where:** mockup `screens-entry.jsx:205-217` vs live age/kg/cm steps.
- **Expected:** input 58px transparent bg, bottom-border 2px `--accent`; unit 22px ink-2; helper ink-3 12.5px.
- **Verify:** render each; computed input size + underline colour.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Blueprint A3 says keep free-type for Maria 65 + leading-0 fix.

### [11.126] Onboarding — summary card rows
- **Check:** Summary = `.pulse-card .sheen` with label/value rows separated by `--line`.
- **Where:** mockup `screens-entry.jsx:241-261` vs live summary step.
- **Expected:** glass card; rows `.label` left + display 15px value right; hairline dividers.
- **Verify:** render summary; computed row layout + dividers.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.127] Onboarding — Continue CTA = btn-grad full width
- **Check:** Bottom Continue / "Let's begin" = gradient CTA.
- **Where:** mockup `screens-entry.jsx:161-163` vs live CTA.
- **Expected:** btn-grad width 100%, trailing arrow.
- **Verify:** computed bg = grad-pulse.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

---

## 11.2 — GROUP B · COACH (`Antrenor.tsx` ↔ `screens-antrenor.jsx`)

### [11.201] Coach — header (mono date eyebrow + display title + PulseMark)
- **Check:** Header = mono date line + display 30px "Coach" title + floaty PulseMark(34) right + serif italic subtitle.
- **Where:** live `Antrenor.tsx:154-170` vs mockup `screens-antrenor.jsx:11-20`.
- **Expected:** date `font-mono text-[11px] tracking-wider text-ink3`; title `font-display text-3xl font-bold`; PulseMark size 34 right; subtitle `font-serif italic text-ink2 text-sm`.
- **Verify:** render `/app/antrenor`; computed styles match each line; PulseMark present at 34px.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** **DELTA:** mockup subtitle is display italic (`font-family:var(--font-display)`); live uses `font-serif italic`. Confirm `font-serif` resolves to the intended Pulse display/serif pairing — if it's a generic serif not in the Pulse system, PARTIAL.

### [11.202] Coach — readiness HERO orb card composition
- **Check:** Hero = glass card (`pulse-card pulse-card-glow`, aqua wash) with `ReadinessOrb` left + verdict block right (aqua Kicker + verdict + PR pill).
- **Where:** live `Antrenor.tsx:223-256` vs mockup `screens-antrenor.jsx:22-33`.
- **Expected:** `.pulse-card` glass, `--wash:var(--aqua)` corner glow; orb 168px; Kicker aqua "TODAY'S VERDICT"; verdict display 22px aqua; canPR → volt solid pill "PRIMED FOR A PR".
- **Verify:** render seeded; orb + verdict + pill present; computed glow wash = aqua; verdict text colour aqua.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Live promotes readiness to the orb (blueprint B1) — matches mockup intent. Empty-state (no history) shows em-dash orb + microcopy (honest invariant) — that path has no mockup equivalent; PASS-with-note.

### [11.203] Coach — ReadinessOrb internals (ring gradient + auras + pulses)
- **Check:** Orb = volt→aqua `Ring` (size 150, stroke 11) + breathing core + 2 counter-rotating auras + 2 halo pulse rings; 52px score; mono label.
- **Where:** live `ReadinessOrb.tsx:43-148` + `Ring.tsx` vs mockup `ui.jsx:117-140`.
- **Expected:** Ring gradId="pulse" volt→aqua; orb-core radial aqua; orb-aura conic volt; orb-aura2 conic aqua; score `.num`/font-display 52px weight 700; label mono uppercase 10.5px ink-3.
- **Verify:** computed ring stroke uses `url(#ringPulse)`; score font 52px; both aura layers present + animating; PR-primed flips pulse colour toward volt (`data-can-pr`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** **DELTA:** mockup orb-aura is 182px/160px; live is 158px both. Minor size delta → record (likely PASS, ring 150 matches; auras are blurred decoration). Mockup label `letter-spacing` via `.label` 0.16em vs live inline 0.18em — trivial.

### [11.204] Coach — COACH TODAY card glass + glow corner
- **Check:** CoachTodayCard = dark gradient/glass card with volt corner glow, volt Kicker "COACH RECOMMENDS TODAY", display title, italic coach quote (volt), lagging signal (ember, dashed top border), meta chips, btn-grad "Start session", override link.
- **Where:** live `src/react/components/Antrenor/CoachTodayCard.tsx` vs mockup `screens-antrenor.jsx:37-56` + `.coach-card`/`.coach-glow` (`:113-117`).
- **Expected:** card bg `linear-gradient(165deg,--surface-solid,…)` + `1px --line-strong`; volt corner glow; quote colour `--coach-lora` (mockup uses `--volt` for quote; live token `--coach-lora` = aqua-deep teal — **DELTA**); lagging `--coach-lagging` ember/amber with dashed top; CTA btn-grad.
- **Verify:** render workout-day seeded; read CoachTodayCard.tsx; computed quote colour vs mockup volt; lagging colour; corner glow present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Mockup quote is `var(--volt)` (green); live `--coach-lora` resolves to aqua-deep teal (`#7fdfe8` dark) per global.css:252. This is a COLOUR DELTA on a distinctive element — same CLASS of bug as the calendar day-dots. Verdict PARTIAL; flag to Daniel whether the quote should be volt (mockup) or aqua (live token).

### [11.205] Coach — meta chips (clock/layers/dumbbell) + "+15%" → engine intensityMod
- **Check:** Meta row = 3 chips (duration / exercise count / intensity), intensity uses engine `intensityMod` not a hardcoded "+15%".
- **Where:** live CoachTodayCard meta vs mockup `screens-antrenor.jsx:47-51` (hardcoded "+15%").
- **Expected:** ink-2 13px chips with lucide icons; intensity value from engine (blueprint B1).
- **Verify:** seed two energy states → intensity chip value changes; styling matches.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.206] Coach — TrainingSchedule pill row vs live Calendar7Day
- **Check:** The 7-day editable schedule renders as the mockup `.sched-row` pill grid (Mon-Sun, on=accent fill + glow, today=aqua outline, pencil/check edit toggle).
- **Where:** live `src/react/components/Calendar7Day.tsx` vs mockup `screens-antrenor.jsx:67-108` (`TrainingSchedule` + `.sched-pill`).
- **Expected:** 7-col pill grid; `.on` pill bg `--accent`/`--brick` + `--on-accent` text + glow; `today` pill aqua outline (`color-mix(--aqua 75%)` 2px offset 2); edit toggle pencil↔check.
- **Verify:** render; computed on-pill bg = brick, today outline = aqua; toggle edit → pencil becomes check.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Blueprint B1: live `Calendar7Day` is wired to `scheduleStore` (keep) but must be reskinned to this pill row. If Calendar7Day still renders the OLD calendar/day style instead of accent pills, PARTIAL/FAIL. Today-outline COLOUR (aqua) is a per-element colour check — same class as the calendar-dot bug.

### [11.207] Coach — folded-back banners coexist (Resume/Reactivate/Patterns/Alerts/PRWall)
- **Check:** The engine/UX banners the mockup omits still render (conditionally) without breaking the Pulse layout.
- **Where:** live `Antrenor.tsx:195-211,262,277,284` vs blueprint B1 "DO NOT delete".
- **Expected:** PASS-with-note — Resume/Reactivate top, Patterns/Alerts thin strips, PRWallRecent bottom, each styled in Pulse tokens (glass / status tints), render-nothing when empty.
- **Verify:** seed paused session → ResumeSessionCard glass-styled at top; seed empty → banners absent; confirm none use legacy flat `bg-paper2` un-reskinned.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Per-banner Pulse-reskin must be verified individually — a surviving-but-flat banner is a parity PARTIAL.

---

## 11.3 — GROUP C · WORKOUT FLOW

### 11.3.A — ENERGY CHECK (`EnergyCheck.tsx` ↔ `screens-workout.jsx:32-61`)

### [11.301] Energy — SubHeader sticky gradient
- **Check:** SubHeader = sticky top, back chevron + display 17px title, gradient fade bg.
- **Where:** live `src/react/components/SubHeader.tsx` vs mockup `screens-workout.jsx:20-29`.
- **Expected:** sticky; padding ~52px top; back chevron ink-2; title display 17px weight 600; bg `linear-gradient(180deg,var(--bg) 60%,transparent)`.
- **Verify:** render energy-check; computed SubHeader styles; sticky on scroll.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** SubHeader is shared across the whole workout flow — verify once here, reference in 11.302/11.310/etc.

### [11.302] Energy — 5 glowing-dot energy rows
- **Check:** Energy options = `.energy-row` glass rows with a glowing coloured dot (16px, box-shadow glow) + label + hint + chevron.
- **Where:** live `EnergyCheck.tsx` (`ENERGY_OPTIONS`) vs mockup `screens-workout.jsx:40-58` (`.energy-dot` 16px + `0 0 16px <color>` glow).
- **Expected:** rows `--surface` glass 1px line radius 18; dot 16px with per-level colour + glow; label display 16.5px; hint ink-2.
- **Verify:** render; each row has a glowing dot; computed dot colours per level (verify they match the mockup `D.energy` colour set); chevron present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Blueprint C1: 5 options parity; only diff is the glow. Confirm the per-level colours (excellent/good/normal/low/tired) match — a colour-set mismatch here is the same class as the calendar bug.

### 11.3.B — WORKOUT PREVIEW (`WorkoutPreview.tsx` ↔ `screens-workout.jsx:64-115`)

### [11.310] Preview — TODAY'S SESSION kicker + title + meta row
- **Check:** volt Kicker + display 25px title + 3-chip meta (clock/layers/dumbbell).
- **Where:** live `WorkoutPreview.tsx` (`preview-hero`/`preview-duration`/`-count`/`-volume`) vs mockup `screens-workout.jsx:76-82`.
- **Expected:** Kicker volt; title display 25px 700; meta ink-2 13px chips.
- **Verify:** computed styles; testids present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.311] Preview — intensity banner colour keyed to energy
- **Check:** Intensity banner tints by energy: plus=volt, minus=ember, normal=aqua; `color-mix(<c> 12%, --surface)` bg + `color-mix(<c> 35%)` border + zap icon.
- **Where:** live `preview-intensity-banner` vs mockup `screens-workout.jsx:67-71,83-87`.
- **Expected:** banner colour follows energy → exact token (volt/ember/aqua).
- **Verify:** seed each energy → banner colour switches; computed bg/border colour-mix base = correct token.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Per-element colour-by-state — high-risk for the calendar-class bug. Check all 3 states.

### [11.312] Preview — warm-up kicker + exercise list rows
- **Check:** Warm-up kicker + numbered exercise rows (`.ex-num` badge + name + sets/reps/kg mono + muscle Pill or ExerciseMedia thumb).
- **Where:** live `preview-warmup-row`/`preview-exercise-row` vs mockup `screens-workout.jsx:89-103` (`.ex-num` badge `color-mix(--accent 16%)` + accent text).
- **Expected:** ex-num badge 30px radius 10 accent-tinted bg + accent text; name display 15px; mono spec line ink-3; muscle Pill aqua.
- **Verify:** computed ex-num badge bg/text colour; row layout.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Blueprint C2 recommends KEEPING `ExerciseMedia` thumbnail over the muscle Pill (Daniel "#11" feature) — deviation allowed; verify whichever ships is Pulse-styled.

### [11.313] Preview — Confirm CTA (btn-grad) + bottom gradient fade
- **Check:** "Confirm, let's go" btn-grad full-width in a bottom bar with gradient fade.
- **Where:** live `preview-start-cta` vs mockup `screens-workout.jsx:108-110`.
- **Expected:** btn-grad; bottom bar bg `linear-gradient(0deg,var(--bg) 60%,transparent)`.
- **Verify:** computed CTA bg + bottom-bar fade.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### 11.3.C — LIVE WORKOUT (`Workout.tsx` ↔ `screens-workout.jsx:118-388`) — the big one

### [11.320] Live — header X-exit + progress track + live volume count-up
- **Check:** Header = X close + gradient progress track (`.prog-track` grad-pulse fill + aqua glow) + "n/m sets" mono + live volume count-up (aqua).
- **Where:** live `Workout.tsx` SessionTimer (`workout-title`/`progress`/`elapsed`/`exit-trigger`) vs mockup `screens-workout.jsx:217-228,356-357`.
- **Expected:** track 6px `--surface-2` with `--grad-pulse` fill + `box-shadow:0 0 12px var(--aqua)`; sets mono ink-3; volume `.num` aqua count-up.
- **Verify:** render live (seeded); computed track fill = grad-pulse; volume animates; sets count uses the fixed `setsDone` formula (not stuck at 1).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.321] Live — "EXERCISE n OF m" kicker + Why? trigger + name + muscle pill
- **Check:** aqua Kicker exercise counter + "Why? 💡" link + display 25px name + aqua muscle Pill (+ ember "swapped" pill when swapped).
- **Where:** live `wv2-exname`/`wv2-why-trigger` vs mockup `screens-workout.jsx:231-239`.
- **Expected:** Kicker aqua; why-btn aqua 12px; name display 25px; muscle Pill aqua; swapped Pill ember.
- **Verify:** computed styles; trigger a swap → ember pill appears.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.322] Live — ExerciseMedia placeholder (hatched + "Coming soon")
- **Check:** `.ex-media` = 104px hatched (`repeating-linear-gradient` surface/surface-2) box with play icon + "exercise demo" mono + accent "Coming soon" pill.
- **Where:** live `src/react/components/ExerciseMedia.tsx` vs mockup `screens-workout.jsx:242-246,367-371`.
- **Expected:** hatched bg; play icon ink-3; mono caption; accent-tinted "Coming soon" pill.
- **Verify:** computed bg pattern + caption + pill colour.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.323] Live — form cue collapsible row
- **Check:** `.cue-line` collapsible "💡 Form cue" row + expand chevron + cue text.
- **Where:** live Workout cue vs mockup `screens-workout.jsx:247-251,372-374`.
- **Expected:** glass row `--surface` 1px line radius 13; cue text ink-2 13px.
- **Verify:** render; expand → cue text shows.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Blueprint C3 risk: NO `cue` field in the engine (mock-only); live uses `sub` or flags V2. If the cue row is absent/empty, record as data-availability PARTIAL not a styling FAIL.

### [11.324] Live — set chips row (done/active/pending)
- **Check:** Per-set chips `.set-chip` 36px: done=accent fill + check, active=accent border + glow, pending=surface-2.
- **Where:** live Workout set chips (`set-history`/`set-history-N`) vs mockup `screens-workout.jsx:254-260,359-362`.
- **Expected:** done bg `--accent` + on-accent check; active border `--accent` + glow; pending `--surface-2` border `--line` ink-3.
- **Verify:** log a set → chip flips to done (accent fill); active chip glows; computed colours.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.325] Live — coach adjustment line (volt italic)
- **Check:** `.coach-line` = brain icon + volt-tinted glass card, display italic, fed by engine `adjustNotice`.
- **Where:** live `insession-adjust-notice` vs mockup `screens-workout.jsx:263-268,375-377`.
- **Expected:** bg `color-mix(--volt 11%, --surface)` + `1px color-mix(--volt 32%)`; brain icon volt; display italic 13px.
- **Verify:** trigger adjust (2× hard) → line appears; computed colour = volt-tint.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Blueprint C3(b): keep engine `DP.checkInSessionAdjust` path; the kg math is NOT hand-rolled per mockup. Visual styling is the parity check.

### [11.326] Live — logger NumDial (Weight/Reps ± steppers)
- **Check:** Logger card = SET label + 2 `NumDial` (Weight kg / Reps) with ± buttons + `.num` 28px value + btn-primary "Confirm set".
- **Where:** live `SetLogInput.tsx` (`kg-input`/`reps-input`) vs mockup `screens-workout.jsx:287-298,390-403`.
- **Expected:** NumDial bg `--surface-2` radius 16; ± buttons `.dial-b` 34px; value `.num` 28px; confirm btn-primary.
- **Verify:** computed NumDial layout; ± adjusts value; confirm CTA styled.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Blueprint C3(a): live must ADD the ± dial ALONGSIDE free-type input (Maria 65 types) — keep leading-0 fix + a11y bounds. If only ± and no type-input (or vice-versa), PARTIAL.

### [11.327] Live — feel-mode card (Easy/Right/Hard) + beat-plan pill
- **Check:** Per-set feel = card with "HOW DID SET n FEEL?" + 3 big buttons (Easy volt / Right aqua / Hard ember) + beat-plan pill when kg>target.
- **Where:** live `SetRatingButtons.tsx` (`data-rating` usor/potrivit/greu) vs mockup `screens-workout.jsx:271-285,378-382`.
- **Expected:** feel buttons `.feel-b` surface-2 1.5px line; label colour volt/aqua/ember; active → coloured border + glow; beat-pill volt mono.
- **Verify:** log a set over target → beat-pill volt; feel buttons coloured per rating; computed colours.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Easy/Right/Hard colour set (volt/aqua/ember) is a per-element colour triad — verify exact tokens (calendar-class).

### [11.328] Live — in-session action chips (Pain/Busy/Skip)
- **Check:** 3 action chips `.act-chip` row (heart/dumbbell/arrow icons) styled as glass chips.
- **Where:** live `wv2-ex-actions`/`wv2-ex-action-{ocupat,lipsa,nuvreau}` vs mockup `screens-workout.jsx:302-306,364-365`.
- **Expected:** chips flex-1 `--surface` 1px line radius 14 ink-2 12.5px.
- **Verify:** computed chip styling; chips present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** **DELIBERATE structural delta** (blueprint C3(e)): live has 3 substitution actions Aparat ocupat/lipsa/nu-vreau + Pain/Skip/Finish in the SessionTimer ⋯ menu (refusal-exhaustion moat). The mockup's flat Pain/Busy/Skip is simplified. Map visual styling; the action SET difference is allowed (record it). Don't lose "Aparat lipsa" + refusal exhaustion.

### [11.329] Live — RestOverlay countdown ring (NON-modal bottom card)
- **Check:** Rest = countdown ring (size ~210, grad-pulse, breathing) + "+20 sec" / "Skip rest" — BUT rendered as a NON-modal bottom card, not full-screen `inset:0`.
- **Where:** live `RestOverlay.tsx:14-20` (`rest-overlay`/`rest-skip`) vs mockup `screens-workout.jsx:406-435` (full-screen `.rest-ov` inset:0).
- **Expected:** PARTIAL-by-design — ring visual + breathe match the mockup; layout DELIBERATELY differs (bottom card so X + ⋯ stay clickable during rest — BUG #7+#8 fix). The visual (ring gradient, timer typography, button styling) must still match.
- **Verify:** trigger rest; ring is grad-pulse + breathing + timer `.num` 52px; X/exit still clickable (NOT full-screen-blocked); compare ring visual to mockup.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Layout deviation is intentional + safety-critical → PARTIAL with rationale, NOT a FAIL. But the RING visual itself must match (gradient, size, breathe). If the ring isn't grad-pulse or doesn't breathe → that part is a real FAIL.

### [11.330] Live — exit/why/busy/pain Sheets (bottom-sheet styling)
- **Check:** The 4 bottom sheets (exit/why/busy-swap/pain) use the mockup `Sheet` styling: scrim blur, panel `.card .sheen` radius 26 top, grip handle.
- **Where:** live `ExitConfirmSheet.tsx`/why-modal/`AparatLipsaSheet.tsx`/PainButton sheets vs mockup `ui.jsx:211-233` (`Sheet`) + `screens-workout.jsx:316-353`.
- **Expected:** scrim `rgba(4,5,10,.55)` + `backdrop-filter:blur(3px)`; panel glass radius 26 26 0 0; grip 40×4 `--line-strong`; slide-up animation.
- **Verify:** open each sheet; computed scrim + panel + grip; slide-up present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Busy-swap sheet uses `.pr-ico` aqua thumbnail (mockup `:334-339`) — verify present. Pain sheet = 2-col chip grid (`:348-352`).

### [11.331] Live — transition screen (next exercise)
- **Check:** Between-exercise transition = centered "NEXT EXERCISE" aqua Kicker + display 28px name + muscle Pill + 3-dot loader.
- **Where:** live `transition-screen` vs mockup `screens-workout.jsx:199-211`.
- **Expected:** centered; Kicker aqua; name display 28px; dot-load accent dots.
- **Verify:** advance past last set of an exercise → transition screen shows; computed styles.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.332] Live — PrFlash full-screen celebration
- **Check:** PR hit mid-session → full-screen `PrFlash`: confetti + trophy badge (ember glow) + "NEW RECORD!" ember display + exercise + kg×reps.
- **Where:** live `src/react/components/Workout/PrFlash.tsx` vs mockup `screens-workout.jsx:438-457`.
- **Expected:** radial ember bg; pr-badge 96px ember-tinted; "NEW RECORD!" display 32px ember; confetti.
- **Verify:** seed a PR set → PrFlash shows; computed ember colours + confetti present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Blueprint C3(c): live drives PrFlash from real `getPRDelta` (mockup hardcodes `ex.id==='bench'`). Keep PostSummary banner too.

### 11.3.D — POST-RPE (`PostRpe.tsx` ↔ `screens-workout.jsx:460-492`)

### [11.340] PostRpe — ONE QUESTION layout + 3 rating rows
- **Check:** aqua Kicker "ONE QUESTION" + display 28px "How was the session?" + 3 `.rpe-row` rows (Easy/Right/Hard) with colour border on select + check circle.
- **Where:** live `PostRpe.tsx` (`post-rpe`/`post-rpe-intro`/`data-rating`) vs mockup `screens-workout.jsx:467-483,484-489`.
- **Expected:** rows `--surface` 1.5px line radius 20; selected → `color-mix(<rc> 9%)` bg + `<rc>` border + glow; label colour per rating (volt/aqua/ember); rpe-check fills `<rc>`.
- **Verify:** computed row + selected styling per rating; colours match the volt/aqua/ember triad.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** **Behavioral delta** (blueprint C4): mockup = select-then-Save 2-tap; live = one-tap-submit. Visual parity is the check here; the interaction difference is recorded (keep the finalize pipeline). Easy/Right/Hard colour triad = per-element colour check.

### 11.3.E — SUMMARY (`PostSummary.tsx` ↔ `screens-workout.jsx:495-561`)

### [11.350] Summary — check badge + SESSION COMPLETE heading
- **Check:** Check badge (volt circle, glow) + volt Kicker "SESSION COMPLETE" + display 30px "Good session." heading.
- **Where:** live `PostSummary.tsx` (`summary-heading`/`summary-title`) vs mockup `screens-workout.jsx:501-506,544`.
- **Expected:** `.sum-badge` 72px volt fill + glow; Kicker volt; heading display 30px.
- **Verify:** computed badge colour/glow; heading typography.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.351] Summary — PR banner (ember) + confetti
- **Check:** PR banner = ember-tinted card with trophy + record line; confetti on PR.
- **Where:** live `summary-pr-banner`/`summary-enrichment` + ConfettiBurst vs mockup `screens-workout.jsx:500,508-513,545-546`.
- **Expected:** banner `color-mix(--ember 13%, --surface)` + `color-mix(--ember 38%)` border; ember text; confetti.
- **Verify:** seed PR session → banner ember + confetti; computed colours.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Mockup hardcodes "+5 kg on Bench Press"; live from `prData` — wording allowed to differ.

### [11.352] Summary — stat grid (Duration/Sets/Volume + Kcal)
- **Check:** Stat grid uses `.pulse-card-tight` tiles with count-up `.num` 26px + label.
- **Where:** live `summary-stats-grid`/`summary-duration`/`-sets`/`-volume`/`-kcal` vs mockup `screens-workout.jsx:515-519,553-559` (3 stats only).
- **Expected:** tiles glass-tight; count-up numbers. **DELIBERATE delta:** live keeps a 4TH Kcal stat the mockup omits (blueprint C5 "keep Kcal"). PASS-with-note (4 vs 3).
- **Verify:** computed tile styling; 4 stats present incl Kcal; numbers count up.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Extra Kcal stat is intentional. Record the count (4) vs mockup (3).

### [11.353] Summary — muscle groups (bars vs pills)
- **Check:** Muscle-group breakdown rendering.
- **Where:** live `summary-muscles` vs mockup `screens-workout.jsx:521-532,547-548` (`.mg-track` grad-pulse bars).
- **Expected:** mockup uses animated grad-pulse bars per muscle (label + bar + sets count). Live may use PILLS instead (blueprint C5: per-group `sets` has no real source → keep pills, no count). **DELTA:** bars vs pills.
- **Verify:** render summary; is it bars (grad-pulse, animated) or pills? If pills, record as data-availability deviation (PARTIAL) — the bar visual is unmatched but the data isn't there.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** If live ships pills, that's a documented deviation (no per-group set source) → PARTIAL. Flag whether Daniel wants the bar visual once Phase-5 breakdown lands.

### [11.354] Summary — streak card + Done CTA
- **Check:** Streak row (flame icon volt + "n-day streak") + btn-grad "Done".
- **Where:** live `summary-streak`/`summary-finish` vs mockup `screens-workout.jsx:534-542`.
- **Expected:** flame icon volt animated; streak from real `streak` (mockup hardcodes "13-day"); Done btn-grad.
- **Verify:** computed flame colour + Done CTA; streak value is real.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Live keeps Marius-persona detail block (blueprint C5) the mockup omits — PASS-with-note.

---

## 11.4 — GROUP D · PROGRESS (`Progres.tsx` + strips ↔ `screens-tabs.jsx:5-162`)

### [11.401] Progress — header (display 30px + serif italic subtitle)
- **Check:** "Progress" display 30px + italic serif/display subtitle.
- **Where:** live `Progres.tsx` (`progres-home`) vs mockup `screens-tabs.jsx:13-16`.
- **Expected:** title display 30px 700; subtitle font-display italic ink-2 13.5px.
- **Verify:** computed styles.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Same font-serif-vs-display question as 11.201.

### [11.402] Progress — TODAY kcal HERO card
- **Check:** kcal hero = glass card (aqua radial glow) + aqua Kicker "CALORIES RECOMMENDED TODAY" + ember PHASE pill + week meta + 48px count-up kcal + protein/TDEE line + ground-truth note.
- **Where:** live `TDEEStrip.tsx` (`progres-zone-azi`) vs mockup `screens-tabs.jsx:21-39`.
- **Expected:** glass card + aqua glow; kcal `.num` 48px count-up; PHASE Pill ember; protein/TDEE inline.
- **Verify:** seed → kcal hero count-up; computed glow aqua + PHASE pill ember.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.403] Progress — Fatigue + BMR mini-stat pair
- **Check:** 2-col mini-stats: Fatigue (aqua wash) + Base calories/BMR (volt wash), `.pulse-card-tight` with corner radial wash.
- **Where:** live `FatigueStrip.tsx`+`BMRStrip.tsx` (`fatigue-bmr-grid`) vs mockup `screens-tabs.jsx:41-44,123-132` (`MiniStat`).
- **Expected:** tight tiles; tile-wash radial `color-mix(<color> 16%)` top-right corner; Fatigue aqua, BMR volt; `.num` 24px value.
- **Verify:** computed tile wash colours; values present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Per-tile accent colour (aqua/volt) = colour check.

### [11.404] Progress — body-fat strip
- **Check:** Body-fat estimate strip = tight glass row "BODY FAT · ESTIMATE" + `.num` 22% + method Pill (ink-3).
- **Where:** live `BodyFatStrip.tsx` vs mockup `screens-tabs.jsx:45-48`.
- **Expected:** tight card; label; value `.num` 22px; bf-method Pill ink-3.
- **Verify:** computed styling; value present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.405] Progress — TREND weight sparkline card
- **Check:** Weight trend = glass card with aqua Kicker "WEIGHT · 8 WEEKS" + `.num` 30px current + delta Pill (volt) + `Sparkline` (aqua, fill, glow, draw-on animation) + day labels + projection line.
- **Where:** live `Sparkline.tsx` + HeatMapWeekly/ProjectionStrip (`progres-zone-tendinta`) vs mockup `screens-tabs.jsx:52-68` + `ui.jsx:143-176`.
- **Expected:** Sparkline stroke aqua `2.5px` + drop-shadow glow + area gradient fill + draw animation; last-point dot breathing; proj-line with target icon volt.
- **Verify:** render seeded; Sparkline present + aqua + draws; delta Pill volt; computed colours.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Blueprint D: mockup uses Sparkline; real prior used `HeatMapWeekly`+`ProjectionStrip`. Verify the live trend renders the SPARKLINE (volt→aqua line), not the old heatmap. If still heatmap, FAIL/PARTIAL — distinctive-element mismatch.

### [11.406] Progress — ACTIONS (log-weight CTA + last-weigh-in + nav rows)
- **Check:** btn-grad "Log weight today" (left-aligned, scale icon) + last-weigh-in tight card + `.prog-row` nav rows (weight trend / body measurements).
- **Where:** live `cta-log-weight`/`last-weight-card`/`cta-weight-timeline`/`cta-body-data` vs mockup `screens-tabs.jsx:71-84,115`.
- **Expected:** btn-grad full-width left-justified; prog-row glass `--surface` 1px line radius 16 + chevron ink-3.
- **Verify:** computed CTA + row styling; testids present + correct nav.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Document-order invariant: AlertsBanner BEFORE cta-log-weight (blueprint D / Progres:135). Live keeps AlertsBanner + NutritionInline (LOG MANUAL) the mockup omits — PASS-with-note.

### [11.407] Progress — MUSCLE RECOVERY ring grid (NET-NEW feature)
- **Check:** Recovery = `.recov-grid` 4-col grid of small `Ring`s (52px, stroke 5) coloured by pct (≥85 volt / ≥60 aqua / else ember) + muscle name.
- **Where:** live `MuscleRecoveryGrid.tsx` vs mockup `screens-tabs.jsx:87-100,113-114`.
- **Expected:** 4-col ring grid; ring colour thresholded volt/aqua/ember; pct `.num` 13px center; staggered entrance.
- **Verify:** render seeded; rings present + colour-thresholded; computed ring colours per pct band.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Blueprint D: net-new (engine has `getRecoveryByGroup`/Big-11 data, tab didn't surface it). If the grid is absent → FAIL (whole zone missing). The volt/aqua/ember threshold colours = colour-by-state check (calendar-class).

### [11.408] Progress — GOAL picker + target/ETA card
- **Check:** GoalPicker `.ob-row` list (same as onboarding) + target-weight/by card.
- **Where:** live `ObiectivGoalCard.tsx`/`ObiectivCard.tsx` (`progres-zone-obiectiv`) vs mockup `screens-tabs.jsx:103-108,134-162`.
- **Expected:** ob-row glass rows w/ accent select; target row `.num` accent value; ETA mono ink-2.
- **Verify:** computed row + target styling; goal pick recolours.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Goal IDs map English→RO vocab; relocated from Coach (blueprint A3/B1).

---

## 11.5 — GROUP E · HISTORY (`Istoric.tsx` + `CalendarHeatmap.tsx` ↔ `screens-tabs.jsx:165-313`)

### [11.501] History — header + 3-stat grid (streak/sessions/records)
- **Check:** "History" display 30px + 3 `HistStat` tiles (flame volt / history aqua / trophy ember) with corner wash + count-up.
- **Where:** live `Istoric.tsx` (`istoric-stats-grid`/`stats-streak`/`-total`/`-pr`) vs mockup `screens-tabs.jsx:189-196,304-313`.
- **Expected:** tight tiles; icon colours flame=volt, sessions=aqua, records=ember; flame animated; count-up values.
- **Verify:** computed icon colours per tile; values from `getStreakStats`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Per-tile icon colour triad (volt/aqua/ember) = colour check.

### [11.502] History — month calendar card (nav + month label)
- **Check:** Calendar card = glass, month label display 16px + prev/next chevron nav buttons (`.cal-nav` surface-2 30px radius 9).
- **Where:** live `CalendarHeatmap.tsx:121-153` vs mockup `screens-tabs.jsx:199-206,280`.
- **Expected:** `.pulse-card`; month label `text-base font-semibold`; nav buttons surface-2 30px radius 9 1px line.
- **Verify:** render `/app/istoric`; computed card + nav button styling; month nav works.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** —

### [11.503] History — weekday header row colour ⚠️ DANIEL SMOKE FINDING 2026-05-29
- **Check:** The M-T-W-T-F-S-S weekday header letters render in the AQUA token, matching the mockup `.cal-wd`.
- **Where:** live `CalendarHeatmap.tsx:155-164` (`text-[10px] text-ink3`) vs mockup `screens-tabs.jsx:207-209,283` (`.cal-wd { color: var(--aqua); }`).
- **Expected:** weekday letters colour = `var(--aqua)` (#4fd6e8). **LIVE IS `text-ink3` (muted grey #82889e) — MISMATCH.** This is exactly the "days of the week are a different colour than the mockup" issue Daniel found.
- **Verify:** computed `color` of a weekday header letter (`CalendarHeatmap.tsx:159`) == `rgb(130,136,158)` (ink-3) — but mockup `.cal-wd` == `rgb(79,214,232)` (aqua). Side-by-side render confirms grey-vs-aqua.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL  *(pre-filled — Daniel smoke 2026-05-29)*
- **Evidence:** `CalendarHeatmap.tsx:159` applies `text-ink3` to the weekday labels; mockup `screens-tabs.jsx:283` sets `.cal-wd { color: var(--aqua); }`. Colour delta: ink-3 grey vs aqua. **This is the canonical bug this whole section exists to catch.**
- **Notes:** Fix: change weekday header label class from `text-ink3` to an aqua token (`text-deep`/inline `var(--aqua)`). Verify against §10 a11y — aqua on the card surface must still clear AA (live `--deep`=aqua resolves to a token already AA-verified). Root cause of the CLASS: the reskin "inherited tokens" (`text-ink3`) instead of matching the mockup's explicit per-element colour — see 11.901.

### [11.504] History — day cell + glowing dot colour by session-state ⚠️ RELATED FINDING
- **Check:** Each logged day shows a glowing dot keyed to the session tier: easy=volt / normal=aqua / hard=ember; rest/future = no dot.
- **Where:** live `CalendarHeatmap.tsx:76-81,230-236` (`tierDotColor`: l1→volt, l2→aqua, l3→ember) vs mockup `screens-tabs.jsx:175-176,217-218` (`stateColor`: hard=ember, normal=aqua, easy=volt, recovery=violet).
- **Expected:** dot colours volt/aqua/ember per tier with `box-shadow:0 0 8px <color>` glow. Live `tierDotColor` MATCHES the mockup easy/normal/hard mapping. **BUT:** the mockup's `cycle` ALSO emits a `recovery` state (violet dot, `screens-tabs.jsx:175,176,184`) — live `tierDotColor` has NO recovery tier (only l1/l2/l3 → volt/aqua/ember), so a recovery/deload day never paints a violet dot.
- **Verify:** seed sessions of each rating → computed dot colour per cell == volt/aqua/ember; seed a recovery/deload day → does live paint violet? (Likely NOT — `ratingToTierClass` has no recovery branch.)
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(pre-investigate: easy/normal/hard dots match; recovery-tier violet dot likely missing → PARTIAL.)_
- **Notes:** PARTIAL: the 3 active tiers match the mockup, but the mockup's 4th paint state (recovery=violet) is unimplemented (data-availability — `deriveSessionRating` returns only usor/potrivit/greu; recovery is a V2 deload flag per global.css:161). Flag whether recovery days should paint violet once deload tracking lands.

### [11.505] History — legend dots colour + ORDER ⚠️ DANIEL SMOKE FINDING 2026-05-29
- **Check:** The 5-item legend matches the mockup: Easy(volt) · Normal(aqua) · Hard(ember) · Recovery(violet) · Rest(surface-2 + line border), in that order, dots glowing.
- **Where:** live `CalendarHeatmap.tsx:256-298` vs mockup `screens-tabs.jsx:185,223-230,292-295`.
- **Expected:** legend order easy→normal→hard→recovery→rest; dot colours volt/aqua/ember/violet/surface; mockup `.leg-dot` is a 9px ROUNDED-SQUARE (`border-radius:3px`), live legend dots are `rounded-full` (circles). **DELTAS:** (a) Recovery dot — mockup `stateColor.recovery = var(--violet)` (#a98bff); live uses `bg-heatRecovery` + `border-heatRecoveryBorder` (an olive-brown `#2a2a18`/`#4a4a28` per global.css:246-247) NOT violet → COLOUR MISMATCH. (b) Rest dot — mockup `--surface-2` fill + `--line-strong` border; live `bg-paper2` + `border-lineStrong` (close). (c) Shape — mockup rounded-square 3px vs live circle.
- **Verify:** computed colour of the Recovery legend dot == violet `#a98bff`? Live resolves to heatRecovery olive-brown → FAIL on colour. Computed border-radius of legend dots: mockup 3px square vs live 9999 circle.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL  *(pre-filled — Daniel smoke 2026-05-29, recovery colour + dot shape)*
- **Evidence:** Live `CalendarHeatmap.tsx:286-287` Recovery dot = `bg-heatRecovery border border-heatRecoveryBorder` (olive-brown tokens), mockup `screens-tabs.jsx:176,226` Recovery = `var(--violet)` (#a98bff). Also live legend dots `rounded-full` (`:262,270,278,286,293`) vs mockup `.leg-dot{border-radius:3px}` rounded-square (`:294`).
- **Notes:** Fix: Recovery legend dot → `var(--violet)` glow (match the cell-dot mapping you'd add in 11.504); change legend dot shape to rounded-square 3px to match `.leg-dot`. Tie-in: legend + cell + day-of-week colours must ALL key off the SAME mockup `stateColor` map — currently they diverge (cell has no recovery, legend uses olive-brown, weekday uses grey).

### [11.506] History — today-cell + future-cell treatment
- **Check:** Today cell = accent ring/outline + accent bold number; future cells = transparent + dimmed ink-3 number.
- **Where:** live `CalendarHeatmap.tsx:196-208` vs mockup `screens-tabs.jsx:287-290`.
- **Expected:** mockup today = `outline:2px solid var(--accent)`; live `ring-2 ring-brick ring-inset` + `text-brick font-bold`. Future = transparent bg + `text-ink3 opacity-50`.
- **Verify:** computed today-cell ring colour = brick; future-cell number opacity 0.5.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Mockup today number uses `--accent` (= volt); live uses `text-brick` (= volt). Should match. Verify the ring vs outline visual is equivalent.

### [11.507] History — "HOW YOUR SESSIONS FELT" 90-day card
- **Check:** Card = aqua Kicker + 3-col Easy/Right/Hard counts (volt/aqua/ember) + animated `.felt-bar` bars.
- **Where:** live `RatingsStrip90Day.tsx` vs mockup `screens-tabs.jsx:234-251,296-297`.
- **Expected:** count `.num` 26px coloured per rating (volt/aqua/ember); felt-bar grad fill animated; footer note ink-3.
- **Verify:** computed count colours; bars animate; values from real ratings.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Easy/Right/Hard colour triad again — verify volt/aqua/ember exact.

### [11.508] History — sessions list rows (+ drill-down preserved)
- **Check:** Session cards = tight glass, title display + PR trophy (ember) + date mono + duration/sets/volume stats; tapping drills into IstoricDetail.
- **Where:** live `VirtualSessionList.tsx` + Istoric onSelect (`pr-row-N`, drill-down `/app/istoric/${idx}`) vs mockup `screens-tabs.jsx:253-277,258`.
- **Expected:** tight glass cards; title display 15.5px; rating Pill (easy=volt/right=aqua/hard=ember); stats mono. **DELIBERATE delta:** live cards DRILL DOWN (mockup cards don't) + list is window-virtualized — both kept (blueprint E). PASS-with-note on the added drill-down.
- **Verify:** computed card styling + rating Pill colours; tap a card → IstoricDetail opens; list virtualized.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Rating Pill colour map (easy/right/hard → volt/aqua/ember) per mockup `ratingMap` (`:167`) — verify. Live also keeps a PR Wall the mockup omits — PASS-with-note.

---

## 11.6 — GROUP F · ACCOUNT (`Cont.tsx` + Settings sub-pages ↔ `screens-tabs.jsx:316-404`)

### [11.601] Account — header + profile card (avatar/name/email/streak pill)
- **Check:** "Account" display 30px + glass profile card: gradient avatar circle (initial, on-accent text), name display 18px, email mono ink-3, streak Pill (volt, flame).
- **Where:** live `Cont.tsx` (`cont-home`/`cont-account-card`/`cont-account-initial`/`-name`/`-email`) vs mockup `screens-tabs.jsx:331-341,390`.
- **Expected:** `.pulse-card .sheen`; `.avatar` 54px `--grad-pulse` fill + aqua glow + on-accent initial; name display 18px; email mono ink-3; streak Pill volt.
- **Verify:** render `/app/cont`; computed avatar gradient + glow; streak pill present (blueprint F add).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Streak pill is a deliberate add (blueprint F) — PASS-with-note if present + styled.

### [11.602] Account — APPEARANCE inline LIVE card ⚠️ LIKELY MAJOR PARITY GAP
- **Check:** Account tab shows an INLINE "APPEARANCE" card with 4 accent swatches (Volt/Aqua/Ember/Violet) + a Dark/Light segmented control, both applying LIVE.
- **Where:** mockup `screens-tabs.jsx:344-363,389-396` (`.acc-sw` swatches + `.seg` toggle, inline on the Account screen) vs live `Cont.tsx` (Appearance is a ROW → navigates to `settings-appearance`) + `SettingsAppearance.tsx`.
- **Expected:** an inline accent-picker (4 swatches, selected → glow + check + scale) + Dark/Light segmented control directly on the Account screen.
- **Verify:** render `/app/cont` → is there an inline APPEARANCE card with accent swatches + dark/light seg? **Per the live read: NO — Appearance is a row that navigates to a separate `SettingsAppearance` screen, AND `SettingsAppearance.tsx:55-101` is NOT Pulse-reskinned (flat `bg-paper2 border border-line rounded-[14px]` list, theme light/dark/auto rows — no accent swatches at all).** Furthermore `global.css:313-324` states accent-swap has "NO token wiring … yet" — the 4-accent picker is unimplemented.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL  *(pre-filled — structural + styling gap, verify live to confirm)*
- **Evidence:** `SettingsAppearance.tsx:55` uses legacy flat `bg-paper2 border border-line rounded-[14px]` (NOT `.pulse-card`); offers theme light/dark/auto + nav-style rows; NO accent swatch picker. `global.css:322-324`: "Accent-swap (volt/aqua/ember/violet) is a Phase 2 runtime picker — no token wiring exists for it yet." Mockup wants 4 inline accent swatches + Dark/Light seg on the Account screen itself.
- **Notes:** Two deltas: (a) the accent picker doesn't exist (token wiring missing) — net-new feature, not just a reskin; (b) the Settings Appearance sub-page is still the pre-Pulse flat card. Blueprint F flags the inline switcher must wire to the REAL `settingsStore`, and that the real theme set is richer than 4 accents (reconcile). Flag to Daniel: implement the 4-accent picker + wire `--accent`, or accept theme-only. Either way the Settings Appearance page must be reskinned to `.pulse-card`.

### [11.603] Account — accent swatch styling (if/when implemented)
- **Check:** Accent swatches = 42px circle dots in volt/aqua/ember/violet, selected → glow `0 0 18px <sw>` + scale 1.06 + check (#0a0c14), mono label below.
- **Where:** mockup `screens-tabs.jsx:347-355,391-393` (`.acc-sw`/`.acc-dot`).
- **Expected:** 4 dots exact hex volt #b6f23a / aqua #4fd6e8 / ember #ff7d52 / violet #a98bff; selected glow + check.
- **Verify:** if picker exists, computed dot colours = the 4 hex; selected glow + check. If not implemented → BLOCKED (feature absent) per 11.602.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Depends on 11.602. The 4 swatch hex are a direct colour check.

### [11.604] Account — Dark/Light segmented control
- **Check:** Mode toggle = `.seg` segmented control (surface-2 track, selected pill = `--accent` fill + on-accent text), LIVE-applying.
- **Where:** mockup `screens-tabs.jsx:357-362,394-396` vs live theme control (SettingsAppearance theme rows / inline seg).
- **Expected:** segmented (NOT a list); selected segment accent fill. **Live delta:** SettingsAppearance uses a vertical list of light/dark/AUTO rows (3 options incl Auto) with `text-brick` + bullet, not a 2-way segmented control. PARTIAL (3-option list vs 2-way seg; Auto is a deliberate add).
- **Verify:** render the theme control; is it a segmented pill or a row list? Auto present?
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(SettingsAppearance.tsx:55-74 = vertical list light/dark/auto, not a segmented control.)_
- **Notes:** Auto (system) is a legit add for Maria 65; the SEGMENTED-vs-LIST visual is the delta → PARTIAL. Switching theme must apply live (themeSync).

### [11.605] Account — grouped row lists (ACCOUNT/GENERAL/DATA&PRIVACY/HELP)
- **Check:** Section groups = zone-h mono headers + glass cards of `.cont-row` (icon chip + title/sub + chevron), hairline dividers.
- **Where:** live `Cont.tsx` (`cont-section-{id}`/`cont-row-{id}`) vs mockup `screens-tabs.jsx:365-381,397-398`.
- **Expected:** zone-h mono uppercase ink-3 headers; `.pulse-card` group; `.cont-row` icon chip 36px surface-2 + title 14.5px + sub ink-3 + chevron ink-3; dividers `--line`.
- **Verify:** render; computed row + icon-chip + header styling.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Live keeps section/row `target` nav + testids (blueprint F). Verify cards are `.pulse-card` glass, not legacy flat.

### [11.606] Account — Logout & Delete danger button
- **Check:** Danger CTA = `.cont-danger` red-tinted button (X icon, #ff5d6c text, `color-mix(#ff5d6c 9%)` bg + `25%` border).
- **Where:** live `Cont.tsx` danger button vs mockup `screens-tabs.jsx:384,399`.
- **Expected:** red-tinted danger button. **DELIBERATE delta:** mockup collapses logout+delete into ONE button; live SEPARATES into `logout-confirm` + `delete-account-confirm` gated screens (blueprint F, legal/safety). PASS-with-note — keep the gating; the danger styling must match.
- **Verify:** computed danger button colour; tapping routes to a confirm screen (not instant delete).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Live uses `--danger`/`--brick-dark` tokens (#ff7d6a dark) vs mockup raw `#ff5d6c` — verify the red is close enough (both AA-checked). Confirm-screen gating is intentional.

### [11.607] Account — version + tagline footer
- **Check:** Footer = "Andura · v2.0.0" ink-3 + italic display tagline "Training with brain."
- **Where:** live `cont-version`/`cont-version-tagline` vs mockup `screens-tabs.jsx:386-387`.
- **Expected:** version ink-3 11px; tagline font-display italic ink-3 12.5px.
- **Verify:** computed footer styling; version string present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Tagline wording via i18n (RO no-diacritics).

### [11.608] Account — every Settings sub-page reskinned to Pulse glass
- **Check:** EACH Settings sub-page (Profile, Notifications, Subscription, Prefs, Privacy, Terms, Export, Import, Support, Faq, About, Danger + the confirm screens) uses `.pulse-card` glass + Pulse tokens, NOT the pre-Pulse flat `bg-paper2 border border-line rounded-[14px]`.
- **Where:** live `src/react/routes/screens/cont/Settings*.tsx` + `*Confirm.tsx` (18 files) vs the Pulse card treatment (no per-page mockup — judge against the design system, 11.008).
- **Expected:** every sub-page card = `.pulse-card`/`.pulse-card-tight`, SubHeader Pulse-styled, accent = brick/volt, tokens not hardcoded hex.
- **Verify:** for EACH sub-page route, grep for `bg-paper2 border border-line rounded-` (legacy flat) vs `pulse-card`; render each → glass or flat?
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(SettingsAppearance.tsx confirmed FLAT — see 11.602. Audit the other 17 the same way; enumerate each as a sub-step 11.608.a … in execution.)_
- **Notes:** This is the catch-all for "a sub-page that inherits tokens / kept the old flat card instead of matching the Pulse system." Settings Appearance is a confirmed instance; the rest must each be checked. Any flat sub-page = PARTIAL for that page.

---

## 11.9 — Cross-cutting parity invariants + harness

### [11.901] No element "inherits a token" where the mockup names an explicit colour
- **Check:** No reskinned element falls back to a generic token (`text-ink3`, default border) where the mockup specifies a DISTINCT per-element colour.
- **Where:** systemic — the root cause of 11.503 (weekday letters `text-ink3` instead of `var(--aqua)`) + 11.505 (Recovery dot heatRecovery instead of violet) + 11.204 (coach quote token vs volt).
- **Expected:** every element whose mockup CSS sets an explicit `color`/`background` (not a default) has the live element set to the SAME token, not a generic inherit.
- **Verify:** for each mockup screen, diff every explicit `color:`/`background:` declaration in the mockup `<style>`/inline against the live element's computed value. A screenshot-diff subagent at `maxDiffPixelRatio` ~0 surfaces these as coloured regions.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(at least 2 confirmed instances: 11.503, 11.505.)_
- **Notes:** This step is the META-CHECK that explains the bug class Daniel found. Treat ANY new instance as FAIL. The fix pattern: key the live element off the same Pulse token the mockup uses, never the muted default.

### [11.902] Token-only colours — zero raw hex in reskinned components
- **Check:** Reskinned components reference Pulse tokens (`var(--volt)`, `text-brick`, etc.), not raw hex literals (except the documented danger `#ff5d6c`-class and WCAG-pinned values).
- **Where:** systemic across all live screen/component files.
- **Expected:** grep reskinned components for `#[0-9a-fA-F]{6}` → only documented exceptions (danger red, calendar tokens already in global.css).
- **Verify:** `rg "#[0-9a-fA-F]{3,6}" src/react/components src/react/routes/screens --type tsx` → triage each hit; raw hex on a visible element that should be a token = FAIL.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Per blueprint cross-cutting note 5 + global.css token-mapping intent. CalendarHeatmap correctly uses `var(--volt/aqua/ember)` for dots (good); the bug there was using the WRONG token for the legend/weekday, not raw hex.

### [11.903] Light theme parity (every screen at `data-theme="light"`)
- **Check:** Each screen renders correctly in LIGHT theme (Pulse light tokens), not just dark.
- **Where:** `global.css:111-175,264-311` (light tokens) vs each screen.
- **Expected:** light theme uses `--brick #477006` (volt-deep, readable as text on light), `--ink #12141f`, cool off-white surfaces; accents stay legible.
- **Verify:** set `data-theme="light"`; render each tab; confirm no invisible volt-green text (light uses volt-deep for text), glass surfaces read as white, contrast holds.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** The mockup's light values map to the live light tokens; verify the DELIBERATE `--brick` swap (volt→volt-deep on light) doesn't break the accent-as-text on any screen.

### [11.904] Reduced-motion parity — animations collapse, layout unchanged
- **Check:** Under `prefers-reduced-motion: reduce`, all Pulse motion (orb auras, shine, gradtext, sparkline draw, confetti, aurora) collapses but the static composition still matches the mockup.
- **Where:** `global.css:924-931` (global cap) + mockup `index.html:97-106` (mockup reduced-motion block) vs each screen.
- **Expected:** with reduced-motion ON, screens look like the mockup's settled/final frame (sparkline filled, count-up at final value, no spin) — no broken/blank states.
- **Verify:** emulate reduced-motion; render each screen; compare static frame to mockup.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** —
- **Notes:** Cross-ref §10 a11y. The mockup explicitly forces `.spark-line` / `.spark-area` / bars to their final state — confirm live does the same (no blank sparkline under reduced-motion).

### [11.905] HARNESS — extend visual-regression to every screen at a frozen baseline
- **Check:** A screenshot-diff baseline exists (or is generated) for EACH screen at mobile 390×844, dark + light, seeded, so parity regressions are machine-caught.
- **Where:** `tests/visual-regression.spec.ts` (currently only `/` at 3 viewports, CI-excluded, no committed baselines).
- **Expected:** per-screen `toHaveScreenshot` specs (splash/auth/onboarding-steps/coach/progress/history/account/workout-phases), `animations:'disabled'`, seeded route, dynamic content masked; baselines committed for the CI platform; promote to CI gate post-design-freeze.
- **Verify:** run `npm run test:visual` → every screen has a baseline + passes; intentional design change regenerates via `npm run visual:update`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(as of read: harness shoots only `/`, local-opt-in, no baselines → the per-screen parity above is JUDGEMENT not machine-gated.)_
- **Notes:** This is the structural fix so the calendar-colour class of bug becomes machine-caught, not smoke-found. Until then, this section is the judgement bar. BLOCKED if no seeded harness route exists; otherwise FAIL until baselines land. Pair the screenshot-diff with a per-element computed-colour assertion for the colour-critical elements (weekday header, legend dots, coach quote, energy dots, recovery rings, feel buttons) so 11.901-class bugs are caught even under the 2% pixel tolerance.

---

## SECTION 11 SCORECARD (fill at audit time)

```
11 Mockup parity                 PASS  PART  FAIL  BLOCK   %     GATE   STATUS
  11.0 foundation (16)           --    --    --    --      --%
  11.1 entry (27)                --    --    --    --      --%
  11.2 coach (7)                 --    --    --    --      --%
  11.3 workout (21)              --    --    --    --      --%
  11.4 progress (8)              --    --    --    --      --%
  11.5 history (8)               --    --    --    --      --%
  11.6 account (8 + 17 subpages) --    --    --    --      --%
  11.9 cross-cutting (5)         --    --    --    --      --%
  ─────────────────────────────────────────────────────────────
  SECTION 11 TOTAL               --    --    --    --      --%   90%    ----
```

> **Pre-filled FAILs to seed the run (Daniel smoke 2026-05-29):**
> - **11.503** — weekday header letters `text-ink3` grey vs mockup `var(--aqua)`. *(the canonical "days of the week wrong colour" bug)*
> - **11.505** — Recovery legend dot olive-brown `heatRecovery` vs mockup `var(--violet)`; legend dot shape circle vs mockup rounded-square.
> - **11.602** — Account APPEARANCE: no inline accent-swatch picker (token wiring missing) + SettingsAppearance still pre-Pulse flat card.
>
> **Pre-flagged PARTIALs (documented deviations — record, don't silently pass):**
> 11.006/11.007 (AA token nudges) · 11.115/11.116 (Google login-only + consent add) · 11.204 (coach quote token vs volt) · 11.328 (substitution-action set) · 11.329 (rest non-modal) · 11.340 (one-tap-submit) · 11.352 (4th Kcal stat) · 11.353 (muscle pills vs bars) · 11.504 (no recovery-tier dot) · 11.604 (theme list vs segmented + Auto) · 11.606 (logout+delete split).
```
```
