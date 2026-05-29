# SECTION 05 — Account (Cont) tab + every Settings sub-page + every confirm dialog (gate 95%)

> **Goal.** The Account tab is the app's "control room": identity (who am I),
> appearance (how it looks), every preference, the GDPR rights surface (export /
> import / privacy / delete), and the six destructive confirm screens. This
> section verifies, atom by atom, that (a) every row exists, navigates, and is
> i18n-wired; (b) the APPEARANCE accent + Dark/Light controls EXIST on the Cont
> landing and apply LIVE app-wide; (c) every Settings sub-page renders, wires to
> the right store, and is reskinned to the Pulse glass idiom; (d) every confirm
> dialog is *gated* (a real two-step screen, not a one-tap), i18n, glass, and
> performs the exact destructive scope it promises — no false promises, no
> data-resurrection; (e) the GDPR export is Art.20-complete (all tiers, not just
> `wv2-*`), and import history feeds the nutrition brain.
>
> **Why this matters (not CRITICAL-weighted, but trust-critical).** The danger
> screens touch the never-delete-silently + delete-before-signout invariants
> (cross-ref §15 + §12); a logout that leaks the previous user's data on a
> shared device, or a "delete account" that leaves the RTDB backup alive for
> S-07 restore-on-login resurrection, is a privacy breach, not a polish item.
> Those exact regressions were found and fixed (RE-S-01, H1, S-01, S-02) — this
> section pins them so they cannot silently regress.
>
> **Scope of this file.** `src/react/routes/screens/cont/*` in full: the landing
> `Cont.tsx` (avatar pebble + name/email + streak pill + the inline APPEARANCE
> card + 5 section groups + version footer); the 13 routed Settings sub-pages
> (Profile, Notifications, Subscription, Appearance, Prefs, Privacy, Terms,
> Export, Import, Danger, About, Support, FAQ); the 2 cross-tab rows reachable
> from Cont (Aparate lipsa, Ceva nu merge — owned by `antrenor/`); the 6 confirm
> screens (Logout, DeleteAccount, ResetData, ResetCoach, SchimbaFaza,
> RedoOnboarding); the wiring libs (`settingsStore.ts`, `paletteSync.ts`,
> `userProfile.ts`, `dataReset.js`, `dataRegistry.js`). Per-element checks split
> into: existence/route, navigation, store-wiring/behavior, gating (confirm
> screens), GDPR scope, i18n (cross-ref §09), Pulse glass parity (cross-ref §11).
>
> **Run discipline (from 00-MASTER §HOW TO RUN).** One verdict per step.
> Evidence mandatory — a PASS with no `file:line` / computed value / screenshot /
> command output is INVALID and scored FAIL. Behavior steps (logout-wipe,
> delete, weight-edit→bf%, accent-swap-live, import) run against a SEEDED
> populated account (see §APPENDIX-SEED in the master run); empty-state steps run
> against a fresh (T0) account. BLOCKED only when an env dependency is genuinely
> missing — never to dodge a checkable item; >5% BLOCKED in this section fails
> the section regardless.
>
> **⚠️ STALE-AUDIT RESOLUTION (pin this once, read before scoring 05.020-05.030
> and §11.602).** A prior parity step `§11.602` (authored 2026-05-29 ~18:51)
> flagged the APPEARANCE accent picker as a "LIKELY MAJOR PARITY GAP" with the
> evidence *"`global.css:322-324`: no token wiring exists for it yet"* and
> *"SettingsAppearance still pre-Pulse flat card; NO accent swatch picker."*
> **That evidence is STALE.** The inline accent picker was ADDED to `Cont.tsx`
> AFTER that parity step was written: `Cont.tsx` is dated 2026-05-29 **10:00**…
> but the wiring (`settingsStore.accent`, `setAccent`, `applyAccent`) and the
> JSX (`cont-appearance-card`, `cont-accent-*`, `cont-theme-*`) are present in
> the live file, and `paletteSync.ts:51-59 applyAccent` performs the runtime
> `--brick` override. §11.602 looked at the WRONG file — it inspected
> `SettingsAppearance.tsx` (a now-stale flat pre-Pulse sub-page) and the old
> `global.css` comment, not the picker that actually shipped on the Cont
> LANDING. **Resolution (the canonical answer this section pins):**
> 1. The accent picker LIVES IN `Cont.tsx:185-296` (the inline `cont-appearance-card`), NOT in `SettingsAppearance.tsx`. ✅ EXISTS.
> 2. It IS wired to `settingsStore.accent` (`Cont.tsx:179-190`) + applies LIVE via `paletteSync.applyAccent` (`Cont.tsx:181-184` → `paletteSync.ts:51-59`), persisted in `wv2-settings-store`. ✅ WIRED + LIVE.
> 3. `SettingsAppearance.tsx` is a **stale flat pre-Pulse sub-page** (`bg-paper2 border border-line` cards, no `.pulse-card`, theme light/dark/AUTO list + bottom-nav-style, NO accent picker). The Cont row `appearance` still routes to it (`Cont.tsx:92` → `settings-appearance`). This creates a **duplicate / divergent appearance UI**: the inline card (Dark/Light + accent) AND the sub-page (light/dark/auto + nav-style). That is the real, NON-stale finding — see 05.022 (the duplication) + 05.060-05.066 (the sub-page reskin/removal decision). The §11.602 verdict should therefore be re-issued as PARTIAL (picker exists + live; sub-page is a stale flat divergence), NOT the original "MAJOR GAP".

---

## 05.A — Cont landing: route, shell, header, profile card

### [05.001] Cont tab route resolves to the Cont landing screen
- **Check:** Navigating to the Account tab mounts `Cont` at `/app/cont`.
- **Where:** `src/react/routes/router.tsx:35,195` (lazy `Cont`, `path: 'cont'`).
- **Expected:** `/app/cont` renders `data-testid="cont-home"` (`Cont.tsx:193`); bottom nav 4th tab active.
- **Verify:** Playwright → navigate `/app/cont` → `page.locator('[data-testid="cont-home"]')` visible; bottom-nav Account tab marked active.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.002] Cont heading renders via i18n (no hardcode)
- **Check:** The `<h1>` wordmark is `t('tabs.cont.title')`, not a literal.
- **Where:** `Cont.tsx:196`.
- **Expected:** EN renders "Account"; RO renders "Cont" (no-diacritics). Cross-ref §09.
- **Verify:** `grep -nE ">Account<|>Cont<" src/react/routes/screens/cont/Cont.tsx` → zero hardcoded JSX text node; key `tabs.cont.title` present in `en.json` + `ro.json`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.003] Account card renders avatar gradient pebble
- **Check:** The profile header card shows a 54×54 gradient-pebble avatar with the user initial.
- **Where:** `Cont.tsx:202-219` (`cont-account-card` → `cont-account-initial`).
- **Expected:** `cont-account-initial` background = `var(--grad-pulse)`, `box-shadow: 0 0 26px -6px var(--aqua)`, `color: var(--on-accent)`; text = `profile.initial`.
- **Verify:** Playwright on seeded account → `getComputedStyle('[data-testid="cont-account-initial"]').backgroundImage` resolves the Pulse gradient (non-empty / not `none`); inner text = expected initial (e.g. seed email `gigel@…` → "G"). Cross-ref §11.601.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.004] Avatar initial derives from id_token JWT claims (not a hardcoded "A")
- **Check:** The initial comes from the authenticated user's name/email JWT claim, falling back to "A" only when unauthenticated.
- **Where:** `Cont.tsx:146,218` → `userProfile.ts:55-77 getUserProfileDisplay` (decodes `firebase-id-token` payload).
- **Expected:** seeded/authed account → initial = first char of `name` (Google) or email-prefix (Magic Link), uppercased; unauth → "A".
- **Verify:** seed a valid `firebase-id-token` with `email: "gigel@x.ro"` → reload `/app/cont` → `cont-account-initial` text = "G". Clear token → "A".
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.005] Account name renders real display name
- **Check:** `cont-account-name` shows the JWT `name` (or email-prefix fallback), not a generic placeholder when authed.
- **Where:** `Cont.tsx:147,221` (`displayName = profile.name || t('cont.accountFallback')`).
- **Expected:** authed → real name / email-prefix; unauth → `t('cont.accountFallback')`.
- **Verify:** seeded authed → assert `cont-account-name` ≠ fallback string; unauth → equals `t('cont.accountFallback')`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.006] Account email renders real email + truncates
- **Check:** `cont-account-email` shows the JWT `email` claim, truncated (no overflow).
- **Where:** `Cont.tsx:148,222` (`displayEmail = profile.email || t('cont.emailFallback')`, `truncate`).
- **Expected:** authed → real email; unauth → `t('cont.emailFallback')`; long email ellipsizes (`truncate` class present).
- **Verify:** seed token email `verylongaddress.gigelescu@example.com` → `cont-account-email` text matches + `overflow` clipped (scrollWidth > clientWidth with `text-overflow: ellipsis`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.007] Streak pill renders real streak from workoutStore
- **Check:** The flame streak Pill beside the avatar reads `useWorkoutStore.streak`, not a hardcoded number.
- **Where:** `Cont.tsx:153-154,224-227` (`streak`, `streakUnit`).
- **Expected:** Pill shows `{streak} {unit}`; unit pluralizes via `stats.streakUnit_one` / `_other`; volt-coloured Pill with `Flame` icon.
- **Verify:** seed `workoutStore.streak = 7` → reload → Pill text = "7 days" (EN) / "7 zile" (RO); seed `streak = 1` → singular unit. Cross-ref §08 (streak source) + §11.601 (Pill style).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.008] Account card is a Pulse glass card (parity)
- **Check:** `cont-account-card` uses `.pulse-card .pulse-shine`, not the legacy flat `bg-paper2 border`.
- **Where:** `Cont.tsx:202-204`.
- **Expected:** classlist contains `pulse-card` + `pulse-shine`; rises in (`animate-card-rise`). Cross-ref §11.601.
- **Verify:** Playwright → `'[data-testid="cont-account-card"]'.className` contains `pulse-card`; computed `backdrop-filter`/surface fill matches the Pulse glass token.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.009] Version footer + serif tagline render via i18n
- **Check:** `cont-version` + `cont-version-tagline` render localized strings, not literals.
- **Where:** `Cont.tsx:334-341` (`t('cont.version')`, `t('cont.versionTagline')`).
- **Expected:** version line + an italic serif tagline below; both via `t()`. Cross-ref §11.607.
- **Verify:** both testids present + non-empty; `grep -nE "v1\.0\.0|Andura v" src/react/routes/screens/cont/Cont.tsx` → version not hardcoded in JSX (it's via `t('cont.version')`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 05.B — APPEARANCE inline card (the §11.602 resolution surface)

### [05.020] APPEARANCE card EXISTS on the Cont landing
- **Check:** The Cont landing renders an inline APPEARANCE card (not only a row that navigates away).
- **Where:** `Cont.tsx:237-296` (`ZoneHeading t('cont.appearance.heading')` + `cont-appearance-card`).
- **Expected:** `data-testid="cont-appearance-card"` present, a `.pulse-card`, sitting between the account card and the section groups.
- **Verify:** Playwright `/app/cont` → `page.locator('[data-testid="cont-appearance-card"]')` visible. **This step directly REFUTES the stale §11.602 "MAJOR GAP" claim** — record the file:line evidence.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** `Cont.tsx:238` `<div className="pulse-card p-4 …" data-testid="cont-appearance-card">` — card present. (Expected PASS; §11.602 evidence was stale, looked at SettingsAppearance.tsx.)
- **Notes:** Resolves §11.602: picker is on the LANDING, not the sub-page.

### [05.021] APPEARANCE accent picker renders 4 swatches (Volt/Aqua/Ember/Violet)
- **Check:** Four accent swatch buttons render with the documented testids + labels.
- **Where:** `Cont.tsx:185-272` (`ACCENT_OPTIONS` → `cont-accent-volt|aqua|ember|violet`).
- **Expected:** 4 buttons `cont-accent-{volt,aqua,ember,violet}`, each `aria-label = t(opt.labelKey)`, inside `role="group"` `cont-appearance-accent`; swatch bg = `var(--volt|--aqua|--ember|--violet)`.
- **Verify:** Playwright → `page.locator('[data-testid^="cont-accent-"]')` count = 4; ids match the set; each `aria-label` non-empty + localized.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.022] Accent swatch swaps `--brick` LIVE on click (app-wide)
- **Check:** Clicking an accent swatch overrides `documentElement` `--brick` at runtime so the whole app re-tints without reload.
- **Where:** `Cont.tsx:181-184 pickAccent` → `paletteSync.ts:51-59 applyAccent` (`el.style.setProperty('--brick', ACCENT_HEX[accent])`; `volt` clears the override).
- **Expected:** click `cont-accent-aqua` → `document.documentElement.style.getPropertyValue('--brick')` becomes `#4fd6e8`; click `cont-accent-ember` → `#ff7d52`; click `cont-accent-violet` → `#a98bff`; click `cont-accent-volt` → property REMOVED (empty string) so base token owns the look.
- **Verify:** Playwright → for each swatch: `browser_evaluate` `getComputedStyle(document.documentElement).getPropertyValue('--brick').trim()` before/after click → assert the inline override matches `ACCENT_HEX` (aqua/ember/violet) and is cleared for volt; also assert a primary-accent element (e.g. a `bg-brick` CTA) visibly re-tints.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time — this is the load-bearing "it actually works live" proof for §11.602 resolution)_
- **Notes:** `ACCENT_HEX` (paletteSync.ts:40-44): aqua `#4fd6e8`, ember `#ff7d52`, violet `#a98bff`; volt = no override.

### [05.023] Selected accent persists in settingsStore + survives reload
- **Check:** The chosen accent is written to `settingsStore.accent` (persisted `wv2-settings-store`), not ephemeral useState, and re-applies pre-mount (anti-FOUC).
- **Where:** `Cont.tsx:179-184 setAccent`; `settingsStore.ts:53,72,102` (default `volt`, `setAccent`, partialized); `paletteSync.ts:61-77 readAccent/applyInitialAccent` + `main.tsx` pre-mount.
- **Expected:** pick `ember` → `localStorage['wv2-settings-store']` JSON `.state.accent === 'ember'`; reload → `--brick` is `#ff7d52` BEFORE React hydrates (no flash of volt).
- **Verify:** Playwright → pick ember → read localStorage JSON → assert `state.accent === 'ember'` → reload → `getPropertyValue('--brick')` = `#ff7d52` on first paint.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.024] Active accent swatch shows glow + check + scale affordance
- **Check:** The selected swatch gets a glow halo, a check glyph, and a scale-up; `aria-pressed=true`.
- **Where:** `Cont.tsx:244-268` (`active` → `boxShadow`, `transform: scale(1.06)`, `Check` icon, `aria-pressed`).
- **Expected:** for the selected accent, `aria-pressed="true"` + a `Check` rendered inside + `box-shadow` non-`none` + `transform` scaled; others `aria-pressed="false"`.
- **Verify:** Playwright → pick aqua → `cont-accent-aqua` `aria-pressed="true"`, contains an svg check, computed `box-shadow` ≠ none; `cont-accent-volt` `aria-pressed="false"`. Cross-ref §11.603.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.025] Dark/Light segmented toggle renders + wires to settingsStore.theme
- **Check:** A Dark/Light segmented control sits below the accent picker, wired to `settingsStore.theme` (`setTheme`).
- **Where:** `Cont.tsx:163-169,280-295` (`MODE_OPTIONS`, `cont-theme-dark` / `cont-theme-light`).
- **Expected:** two buttons `cont-theme-dark` + `cont-theme-light`; active half = `bg-brick text-paper`; `auto`/`dark` both render Dark as active half (`isLight = theme==='light'`).
- **Verify:** Playwright → click `cont-theme-light` → `settingsStore.theme === 'light'` (read persisted) + `<html data-theme>` flips to light (ThemeSync); click `cont-theme-dark` → back to dark. Cross-ref §11.604.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.026] Dark/Light toggle applies LIVE to `<html data-theme>` + persists
- **Check:** Toggling theme flips the document theme attribute live and persists across reload.
- **Where:** `Cont.tsx:163-164,287 setTheme` → themeSync (`<html data-theme>`) + `settingsStore` persist.
- **Expected:** click Light → `document.documentElement.dataset.theme === 'light'` immediately; reload → still light; click Dark → `dark`.
- **Verify:** Playwright → toggle Light → assert `data-theme="light"` + cream tokens active (computed `--paper` light value); reload → persists; toggle Dark → mov dark restored.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.027] APPEARANCE card strings all via i18n (no hardcode, no diacritics)
- **Check:** heading, accent label, mode label, swatch labels, mode labels all via `t()`.
- **Where:** `Cont.tsx:237,241,278` + `ACCENT_OPTIONS`/`MODE_OPTIONS` labelKeys (`cont.appearance.*`).
- **Expected:** keys `cont.appearance.{heading,accentLabel,modeLabel,accentVolt,accentAqua,accentEmber,accentViolet,modeDark,modeLight}` exist EN+RO; RO no-diacritics.
- **Verify:** confirm keys present in `en.json:1165` + `ro.json:1165` blocks (`accentLabel`/`accentVolt`/`modeDark`/`modeLight` verified present); `grep -nE "Accent|Dark|Light|Mod " src/react/routes/screens/cont/Cont.tsx` → no hardcoded user-facing literal. Cross-ref §09.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** keys confirmed at `en.json:1165-1174` / `ro.json:1165-1174` (`appearance` block). _(verify RO no-diacritics + full key set at audit time)_
- **Notes:** _(fill if deviation)_

### [05.028] Accent picker is keyboard + SR operable
- **Check:** Swatches are real `<button>`s with `aria-pressed` + group `aria-label`; Tab+Enter operate them.
- **Where:** `Cont.tsx:243-269` (`role="group"`, `aria-label`, `aria-pressed`, `aria-label` per swatch).
- **Expected:** Tab reaches each swatch; Enter/Space selects; SR announces "button, Aqua, pressed". Cross-ref §10.
- **Verify:** Playwright keyboard → Tab to `cont-accent-aqua` → Enter → selection applies; axe scan of the card → no violations.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 05.C — Section groups + rows (ACCOUNT / GENERAL / DATA&PRIVACY / DANGER / HELP)

### [05.030] Five section groups render in documented order
- **Check:** `Cont` renders exactly the 5 groups: `cont` (ACCOUNT), `general` (GENERAL), `privacy` (DATA & PRIVACY), `danger` (DANGER), `help` (HELP).
- **Where:** `Cont.tsx:78-123 SECTIONS` + `:298-329` render.
- **Expected:** `cont-section-cont`, `cont-section-general`, `cont-section-privacy`, `cont-section-danger`, `cont-section-help` in this DOM order.
- **Verify:** Playwright → `page.locator('[data-testid^="cont-section-"]')` ids in document order = `['cont','general','privacy','danger','help']`. Cross-ref §11.605.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.031] Each section heading is a localized Pulse mono eyebrow
- **Check:** Every group heading uses `ZoneHeading` (mono 11px uppercase tracking) with `t(section.titleKey)`.
- **Where:** `Cont.tsx:128-136 ZoneHeading`, `:303` (`t(section.titleKey)`); keys `cont.sections.{cont,general,privacy,danger,help}`.
- **Expected:** 5 mono eyebrow headings, localized; the danger heading uses the brick highlight (`text-brickdark`).
- **Verify:** confirm `cont.sections.*` keys EN+RO present; visual: danger heading colour = brickdark. Cross-ref §09 + §11.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.032] ACCOUNT group rows: Profile / Notifications / Subscription
- **Check:** The `cont` group renders 3 rows with correct testids + nav targets.
- **Where:** `Cont.tsx:82-86` (`cont-row-profile|notifications|subscription` → `settings-profile|settings-notifications|settings-subscription`).
- **Expected:** 3 rows, each `cont-row-{id}`, each navigates to its `gotoPath` target on click.
- **Verify:** Playwright → click `cont-row-profile` → URL `/app/cont/settings-profile` + `settings-profile` mounts; repeat notifications + subscription.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.033] GENERAL group rows: Appearance / Aparate lipsa / Prefs
- **Check:** The `general` group renders Appearance, Aparate lipsa, Prefs rows with correct targets.
- **Where:** `Cont.tsx:91-95` (`cont-row-appearance` → `settings-appearance`; `cont-row-aparate-lipsa` → `aparate-lipsa`; `cont-row-prefs` → `settings-prefs`).
- **Expected:** 3 rows; `appearance` → SettingsAppearance sub-page; `aparate-lipsa` → the cross-tab Aparate lipsa screen; `prefs` → SettingsPrefs.
- **Verify:** Playwright → click each → asserts route + mounted testid (`settings-appearance` / the aparate-lipsa screen testid / `settings-prefs`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** The `appearance` row coexists with the inline APPEARANCE card (05.020) — duplication flagged in 05.022/05.060; not a missing-feature, a divergence.

### [05.034] DATA&PRIVACY group rows: Privacy / Terms / Export / Import
- **Check:** The `privacy` group renders 4 rows with correct targets.
- **Where:** `Cont.tsx:100-104` (`cont-row-privacy|terms|export|import` → `settings-privacy|settings-terms|settings-export|settings-import`).
- **Expected:** 4 rows, each navigates correctly.
- **Verify:** Playwright → click each → route + mounted sub-page testid.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.035] DANGER group: single red row "Logout & delete" routing to settings-danger
- **Check:** The `danger` group renders ONE red row (`danger: true`) → `settings-danger`.
- **Where:** `Cont.tsx:107-112` (`cont-row-danger`, `danger`, → `settings-danger`); row text colour `text-brickdark` (`:315`).
- **Expected:** 1 row, brickdark text, navigates to `/app/cont/settings-danger`.
- **Verify:** Playwright → `cont-row-danger` computed colour = brickdark token; click → `settings-danger` mounts. Cross-ref §11.606.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.036] HELP group rows: Support / Ceva nu merge / About / FAQ
- **Check:** The `help` group renders 4 rows with correct targets.
- **Where:** `Cont.tsx:116-121` (`cont-row-support|ceva-nu-merge|about|faq` → `settings-support|ceva-nu-merge|settings-about|settings-faq`).
- **Expected:** 4 rows; `ceva-nu-merge` → the cross-tab "Ceva nu merge" screen (antrenor-owned).
- **Verify:** Playwright → click each → route + mounted testid.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.037] Every row label is i18n-keyed (no hardcode)
- **Check:** All 15 row labels render `t(row.labelKey)` under `cont.rows.*`, not literals.
- **Where:** `Cont.tsx:322` (`t(row.labelKey)`); SECTIONS labelKeys.
- **Expected:** all `cont.rows.{profile,notifications,subscription,appearance,aparateLipsa,prefs,privacy,terms,export,import,danger,support,cevaNuMerge,about,faq}` present EN+RO; RO no-diacritics.
- **Verify:** confirm keys exist in both bundles; `grep` the row JSX for any hardcoded label. Cross-ref §09.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.038] Rows with no target are disabled, not silently dead
- **Check:** A row without a `target` renders `disabled` (no dead click).
- **Where:** `Cont.tsx:313-315` (`disabled={!row.target}`, `disabled:opacity-50 disabled:cursor-not-allowed`).
- **Expected:** all current rows HAVE targets (so none disabled); if any future row lacks one, it shows the disabled affordance — verify no current row is unexpectedly disabled.
- **Verify:** Playwright → assert every `cont-row-*` is `enabled` (none disabled) given all SECTIONS rows define `target`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time — all 15 rows define a target in SECTIONS)_
- **Notes:** _(fill if deviation)_

### [05.039] Row chevron + icon chip render (Pulse parity)
- **Check:** Each row shows a tinted icon chip + a trailing `ChevronRight`.
- **Where:** `Cont.tsx:317-323`.
- **Expected:** icon chip (`w-9 h-9 rounded-[11px] bg-paper`) + `ChevronRight` `text-ink3`. Cross-ref §11.605.
- **Verify:** Playwright → each row has an svg icon + a trailing chevron svg; computed chip bg = paper token.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 05.D — SettingsProfile sub-page (Big-6 edit + body comp + weight→bf% wiring)

### [05.040] SettingsProfile mounts + back-navs to Cont
- **Check:** `/app/cont/settings-profile` renders `settings-profile` with a working back button.
- **Where:** `SettingsProfile.tsx:188-196`, `router.tsx:198`.
- **Expected:** `settings-profile` visible; `settings-profile-back` returns to `/app/cont`.
- **Verify:** Playwright → navigate → visible → click `settings-profile-back` → URL `/app/cont`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.041] Big-6 fields seed from onboardingStore + edit into draft
- **Check:** Age / Weight / Sex / Height / Frequency / Experience inputs seed from `onboardingStore.data` and edit local draft.
- **Where:** `SettingsProfile.tsx:46,71` (`data`, `draft`), inputs `:212-251,288-301,358-387`.
- **Expected:** seeded account → fields prefilled with stored values; editing updates draft (not store) until Save.
- **Verify:** seeded account (age 30, weight 80) → assert `profile-age-input` = 30, `profile-weight-input` = 80; type new values → store unchanged until Save (read onboardingStore mid-edit).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.042] Save validates age range (rejects out-of-range, Gigel toast)
- **Check:** Saving an out-of-range age aborts with a localized toast, not a silent bad write.
- **Where:** `SettingsProfile.tsx:131-135` (`validateOnboardingField('age', …)` → `toast.show` + return).
- **Expected:** age 8 → Save → toast warning, store NOT updated.
- **Verify:** Playwright → set age 8 → click `settings-profile-save` → a `role="alert"`/toast appears + onboardingStore.age unchanged. Cross-ref §15 (input bounds invariant).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** U-12 audit fix — edit path previously bypassed §30-C1 bounds.

### [05.043] Save validates weight + height range
- **Check:** Out-of-range weight (e.g. 999) or height aborts with toast.
- **Where:** `SettingsProfile.tsx:136-148`.
- **Expected:** weight 999 → toast + no write; height 9 → toast + no write.
- **Verify:** Playwright → weight 999 → Save → toast + store unchanged; repeat height.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.044] Editing weight in Profile UPSERTS into weightLog (the split-source fix)
- **Check:** A changed weight on Save appends/upserts a `weightLog` entry dated today, making the profile edit authoritative for `getCurrentWeightKg()`.
- **Where:** `SettingsProfile.tsx:149-164` (`priorWeight = getCurrentWeightKg()`; if `draft.weight !== priorWeight` → `addWeightEntry({ kg, date: todayIso() })`).
- **Expected:** onboarding weight 110, edit profile to 80 + Save → `progresStore.weightLog` has a today entry 80 → `getCurrentWeightKg()` returns 80 → TDEE/BMR/bf% all read 80.
- **Verify:** seeded (onboarding weight 110) → edit profile weight 80 → Save → read `getCurrentWeightKg()` = 80; navigate Progress → kcal/BMR reflect 80. Cross-ref §03.014, §08 source-of-truth.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time — this is the §08/§03 split-source fix; the weight editor IS the upsert path)_
- **Notes:** §weight-continuity fix. Note §03 pins a residual PARTIAL for back-dated divergence (positional `weightLog[last]` in BodyFatStrip/BMRStrip vs max-by-date `getCurrentWeightKg`) — see 05.045.

### [05.045] bf% auto-estimate reacts to waist/neck/height edits (US-Navy / Deurenberg)
- **Check:** The "BF% auto" row recomputes from waist+neck+height (US-Navy) or falls back to Deurenberg-capped, with a source label.
- **Where:** `SettingsProfile.tsx:87-109` (`estimateBF_USNavy` + `estimateBfDeurenbergCapped`), display `:302-313` (`profile-bf-auto`, `profile-bf-source`).
- **Expected:** enter waist 90 + neck 38 + height 178 + sex m → `profile-bf-auto` shows a US-Navy % + source = `bfSourceUsNavy`; clear waist → falls back to Deurenberg estimate + `bfSourceEstimated`; no inputs → "—".
- **Verify:** Playwright → fill waist/neck/height → assert `profile-bf-auto` numeric + `profile-bf-source` = US-Navy label; clear waist → value changes + source = Estimated. Cross-ref §08 bf% wiring + §03 BodyFatStrip.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.046] Waist/neck persist to progresStore.bodyData on Save (not discarded)
- **Check:** Saved waist/neck write a `progresStore.bodyData` entry (dated today), feeding US-Navy bf% across the app.
- **Where:** `SettingsProfile.tsx:165-175` (`addBodyDataEntry({ date, waistCm?, neckCm? })` when at least one numeric value present).
- **Expected:** enter waist 90 + Save → `progresStore.bodyData` has a today entry `waistCm: 90`; re-open Profile → waist seeds back from history.
- **Verify:** Playwright → set waist 90 → Save → read store → entry present; reload Profile → `profile-waist-input` = 90 (round-trip). Cross-ref §08.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** A2 MED fix — talie/gat previously discarded.

### [05.047] Waist/neck seed from aggregated latest measurements (cross-screen)
- **Check:** The form seeds waist+neck from the LATEST value per field across all history (not only the last entry), so a neck entered here + waist entered in Progres both seed.
- **Where:** `SettingsProfile.tsx:65,79-80` (`latestBodyMeasurements(bodyData)` → `lastBody.waistCm/neckCm`).
- **Expected:** waist logged in Progres > Masuratori + neck logged in Profile → re-open Profile → BOTH seed (waist from Progres entry, neck from Profile entry).
- **Verify:** seed two separate bodyData entries (one waist-only, one neck-only) → open Profile → both inputs prefilled. Cross-ref §03.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Smoke 2026-05-28 #15 fix.

### [05.048] Save shows confirmation status (role=status)
- **Check:** After a valid Save, a localized "saved" confirmation appears with `role="status"`.
- **Where:** `SettingsProfile.tsx:180,399-407` (`setSaved(true)` → `settings-profile-saved` `role="status"` `t('settings.profile.profileSavedStatus')`).
- **Expected:** valid Save → `settings-profile-saved` visible + announced.
- **Verify:** Playwright → valid Save → `settings-profile-saved` visible + non-empty localized text.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.049] Manual bf% override checkbox gates a numeric input
- **Check:** The "BF% manual" checkbox enables/disables the override number input.
- **Where:** `SettingsProfile.tsx:81-82,314-339` (`bfManual` gates `profile-bf-override` `disabled={!bfManual}`).
- **Expected:** checkbox off → override input disabled; on → enabled (3-60 range).
- **Verify:** Playwright → toggle `profile-bf-manual` → `profile-bf-override` `disabled` flips.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Verify whether the manual override is actually CONSUMED downstream (bf% source-of-truth) or display-only — flag PARTIAL if it does not affect the canonical bf% used by engines (cross-ref §08).

### [05.050] Profile inputs are label-bound (a11y)
- **Check:** Inputs use implicit `<label>` wrap (LabelRow) and selects use explicit `htmlFor/id` (SelectRow).
- **Where:** `SettingsProfile.tsx:431-472` (LabelRow wraps input; SelectRow binds label).
- **Expected:** each input has an accessible name; no double-dispatch on selects. Cross-ref §10.
- **Verify:** axe scan of `settings-profile` → no label violations; SR reads each field label.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.051] Profile strings all i18n + RO no-diacritics
- **Check:** All Profile labels/sections/CTAs via `t('settings.profile.*')`.
- **Where:** `SettingsProfile.tsx` throughout (`settings.profile.title`, section headings, field labels, `confirmEditCta`, `bodyCompFooter`, `bfSource*`).
- **Expected:** keys present EN+RO; RO no-diacritics. Cross-ref §09.
- **Verify:** `grep -nE "Greutate|Varsta|Inaltime|Talie|Save|Confirm" src/react/routes/screens/cont/SettingsProfile.tsx` → no hardcoded user-facing literals; keys present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 05.E — SettingsNotifications sub-page

### [05.052] Notifications page mounts + back-navs
- **Check:** `/app/cont/settings-notifications` renders `settings-notifications` with working back.
- **Where:** `SettingsNotifications.tsx` SubHeader, `router.tsx:199`.
- **Expected:** screen visible; back → `/app/cont`.
- **Verify:** Playwright → navigate → visible → back → `/app/cont`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.053] Master toggle gates the OS push permission flow
- **Check:** The master notifications toggle calls the real `enablePushNotifications` / `disablePushNotifications`, not a no-op.
- **Where:** `SettingsNotifications.tsx:24` import + toggle handler.
- **Expected:** enabling triggers the Notification permission request path; disabling tears down; permission state surfaced (`default`/`granted`/`denied`/`unsupported`/`no-account`).
- **Verify:** Playwright (grant Notification permission in context) → toggle on → permission requested + reflected; anonymous (no uid) → shows the `no-account` hint. Cross-ref §13 (PWA push).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.054] Frequency / days / time wire to settingsStore + RTDB sync
- **Check:** Frequency (zilnic/saptamanal/off), active-days, and time controls write `settingsStore` + call `syncNotificationPrefs` to RTDB.
- **Where:** `SettingsNotifications.tsx:25,42-46` (`syncNotificationPrefs`, `FREQUENCY_OPTIONS`, `DAY_LABELS`).
- **Expected:** changing frequency persists in `wv2-settings-store` + pushes `notificationPrefs` to `users/<uid>` for the server scheduler.
- **Verify:** Playwright → change frequency → read persisted store + (mocked/observed) RTDB write. Cross-ref §08.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.055] Per-event domain toggles render + persist (wv2-notif-event-*)
- **Check:** The mockup-parity per-event toggles (session-reminder, rest-timer, session-missed, daily-coach, …) render + persist to localStorage `wv2-notif-event-*`.
- **Where:** `SettingsNotifications.tsx:48-70` (`NOTIF_EVENTS_ANTRENAMENT` / `NOTIF_EVENTS_COACHING`, testids `notif-event-*`).
- **Expected:** each event toggle present + persists across reload; defaults per mockup (session-reminder/rest-timer ON, session-missed OFF).
- **Verify:** Playwright → toggle `notif-event-session-missed` on → reload → still on (`localStorage['wv2-notif-event-session-missed']`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.056] Notifications strings all i18n + RO no-diacritics
- **Check:** All titles/descriptions/labels via `t('settings.notifications.*')`; day glyphs are locale-independent single chars (intentional).
- **Where:** `SettingsNotifications.tsx:41-46,58-70`.
- **Expected:** keys present EN+RO; aria-labels for days spoken via `t()`. Cross-ref §09 + §10.
- **Verify:** `grep` the file for hardcoded user-facing strings (excluding the documented single-char day glyphs); keys present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 05.F — SettingsSubscription sub-page

### [05.057] Subscription page renders Beta-free state (honest, no live paywall)
- **Check:** Subscription shows "coming soon" + a free-Beta card; the notify CTA toggles to a notified state; NO live IAP/upgrade flow.
- **Where:** `SettingsSubscription.tsx:19-61` (`subscription-beta-card`, `subscription-notify-cta`).
- **Expected:** coming-soon title/body + free-Beta card; click notify → `notifiedCta` + button disabled; no checkout.
- **Verify:** Playwright → navigate → `subscription-beta-card` visible → click `subscription-notify-cta` → text flips to notified + disabled.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Honesty: V1 has no real subscription tier — confirm it does not falsely imply a paid plan exists.

### [05.058] Subscription strings i18n + back-navs
- **Check:** All copy via `t('settings.subscription.*')`; back → Cont.
- **Where:** `SettingsSubscription.tsx:21-24,34-57`.
- **Expected:** keys present EN+RO; back works. Cross-ref §09.
- **Verify:** keys present; Playwright back → `/app/cont`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 05.G — SettingsAppearance sub-page (the stale flat divergence)

### [05.060] SettingsAppearance still mounts (route alive)
- **Check:** `/app/cont/settings-appearance` renders `settings-appearance` (the row still routes here).
- **Where:** `SettingsAppearance.tsx:36-37`, `router.tsx:201`, `Cont.tsx:92`.
- **Expected:** screen visible; back → `/app/cont`.
- **Verify:** Playwright → navigate → `settings-appearance` visible → back → `/app/cont`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.061] SettingsAppearance is a STALE FLAT pre-Pulse card (PARTIAL — divergence)
- **Check:** The sub-page uses legacy flat `bg-paper2 border border-line rounded-[14px]` cards, NOT `.pulse-card`, and offers theme light/dark/AUTO + bottom-nav-style — duplicating/diverging from the inline Cont APPEARANCE card.
- **Where:** `SettingsAppearance.tsx:55,84` (`bg-paper2 border border-line`), `THEME_OPTIONS` (light/dark/**auto**), `NAV_STYLE_OPTIONS` (comfortable/compact). NO accent picker.
- **Expected:** PARTIAL — this is a real, non-stale finding (distinct from the stale §11.602): the app now has TWO appearance UIs. The inline Cont card (Dark/Light + accent, Pulse glass) is the live primary; this sub-page is a flat divergence offering a 3rd theme option (`auto`) the inline card collapses to Dark, plus the bottom-nav-style toggle that exists ONLY here.
- **Verify:** Playwright → `'[data-testid="settings-appearance"] .pulse-card'` count = 0 (flat, not Pulse) → PARTIAL; confirm `theme-auto` + `nav-style-*` controls exist only here. Cross-ref §11.602 (re-issue as PARTIAL) + §11.608.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL→PARTIAL ☐ BLOCKED  *(pre-graded PARTIAL pending audit confirmation)*
- **Evidence:** `SettingsAppearance.tsx:18-22` THEME_OPTIONS incl `auto`; `:55,84` flat cards (no `.pulse-card`); no accent swatches in the file.
- **Notes:** **Resolution decision (Co-CTO recommendation):** the inline Cont card is the keeper. Options: (a) DELETE SettingsAppearance + the `appearance` row's `settings-appearance` target (point the row at nothing / remove the row) and relocate the bottom-nav-style toggle into the inline card; OR (b) reskin SettingsAppearance to Pulse glass + drop its theme list (keep only nav-style) so it's a "Bottom nav" sub-page, not a 2nd theme picker. Recommend (a) for simplicity unless nav-style is judged a needed Maria-65/Marius option (per the in-code §F-pass2 note it was deliberately kept). Either way, the CURRENT duplicate-theme-picker state = PARTIAL.

### [05.062] SettingsAppearance theme + nav-style wire to settingsStore (while it exists)
- **Check:** As long as the sub-page lives, its theme list + nav-style toggle write `settingsStore.theme` / `bottomNavStyle`.
- **Where:** `SettingsAppearance.tsx:31-34,65,93` (`setTheme`, `setBottomNavStyle`).
- **Expected:** picking `theme-auto` sets `theme='auto'`; `nav-style-compact` sets `bottomNavStyle='compact'` (persisted).
- **Verify:** Playwright → pick auto → store theme 'auto'; pick compact → bottom nav restyles + persists. Cross-ref §08.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Note the inconsistency: the inline card has no `auto` option but this page does — picking `auto` here then opening the inline card shows Dark active (`isLight=false`). Document as UX divergence.

---

## 05.H — SettingsPrefs sub-page (units / week-start / LIVE locale / advanced drill-downs)

### [05.063] Prefs page mounts + back-navs
- **Check:** `/app/cont/settings-prefs` renders `settings-prefs` with working back.
- **Where:** `SettingsPrefs.tsx:55-59`, `router.tsx:202`.
- **Expected:** visible; back → `/app/cont`.
- **Verify:** Playwright → navigate → visible → back → `/app/cont`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.064] Units: kg active, lb honestly disabled (no false "switched" state)
- **Check:** kg is the only selectable unit; lb is disabled (post-Beta) — no fake conversion.
- **Where:** `SettingsPrefs.tsx:70-91` (`disabled = opt.value === 'lb'`, `selected = opt.value === 'kg'`).
- **Expected:** `unit-lb` disabled + `aria-pressed=false`; `unit-kg` selected; clicking lb is a no-op.
- **Verify:** Playwright → `unit-lb` `disabled` true; click → no state change; `unit-kg` marked selected. Cross-ref §15 (honesty invariant).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.065] Week-start toggle (L/D) persists to settingsStore
- **Check:** Monday/Sunday week-start wires to `settingsStore.weekStart`.
- **Where:** `SettingsPrefs.tsx:38-39,100-115` (`week-start-L` / `week-start-D`).
- **Expected:** pick Sunday → `weekStart='D'` persisted → calendars/heatmaps start Sunday.
- **Verify:** Playwright → pick `week-start-D` → read store 'D' → History/Progress calendars reflect it. Cross-ref §04 + §08.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.066] LIVE language toggle swaps locale without reload (§09 cross-ref)
- **Check:** Picking RO/EN calls `i18n.setLocale`, persists `sf.locale`, syncs `<html lang>`, and re-renders strings without a full reload.
- **Where:** `SettingsPrefs.tsx:16,46-52,128-147` (`setLocale`, `getCurrentLocale`, `language-en`/`language-ro`).
- **Expected:** default EN; pick RO → UI flips to RO immediately + `<html lang="ro">` + `localStorage['sf.locale']='ro'`; pick EN → flips back.
- **Verify:** Playwright → `language-ro` click → a visible heading flips RO + `document.documentElement.lang === 'ro'` + persisted; reload → stays RO. Cross-ref §09 (live-switch completeness).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Note the heading `{t('settings.prefs.language.heading')} / Language` (`:125`) intentionally appends a literal "Language" so a non-RO/EN reader can find it — confirm that is the intended bilingual affordance, not a hardcode leak (likely PASS-with-note).

### [05.067] Advanced drill-downs route to the gated confirm screens
- **Check:** Reset coach / Redo onboarding / Schimba faza rows navigate to their confirm screens.
- **Where:** `SettingsPrefs.tsx:155-194` (`advanced-reset-coach` → `reset-coach-confirm`; `advanced-redo-onboarding` → `redo-onboarding-confirm`; `advanced-schimba-faza` → `schimba-faza-confirm`).
- **Expected:** each row navigates to the matching confirm screen (no inline destructive action).
- **Verify:** Playwright → click each → URL + mounted confirm-screen testid.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.068] Prefs strings i18n + RO no-diacritics
- **Check:** All Prefs labels via `t('settings.prefs.*')`.
- **Where:** `SettingsPrefs.tsx` throughout.
- **Expected:** keys present EN+RO. Cross-ref §09.
- **Verify:** keys present; `grep` for hardcoded literals (except the documented "/ Language" affordance).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 05.I — SettingsPrivacy sub-page (toggles + live GDPR policy)

### [05.069] Privacy page mounts + back-navs
- **Check:** `/app/cont/settings-privacy` renders `settings-privacy` with back.
- **Where:** `SettingsPrivacy.tsx:53-59`, `router.tsx:203`.
- **Expected:** visible; back → `/app/cont`.
- **Verify:** Playwright → navigate → visible → back.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.070] Telemetry opt-in defaults OFF (anti-paternalism / consent)
- **Check:** Telemetry toggle defaults FALSE; data-export-consent defaults TRUE; both persist.
- **Where:** `SettingsPrivacy.tsx:44-47,77-83`; `settingsStore.ts:60-61` (`telemetryOptIn:false`, `dataExportConsent:true`).
- **Expected:** fresh account → telemetry OFF, export-consent ON; toggling persists.
- **Verify:** fresh account → `privacy-telemetry-toggle` unchecked, `privacy-data-export-toggle` checked; toggle → persists across reload. Cross-ref §12 (consent).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Verify telemetry opt-in actually gates any analytics emission (cross-ref §12) — flag if the toggle is cosmetic.

### [05.071] Live GDPR privacy policy renders (collect/use/rights/storage/sensitive/subprocessors/contact)
- **Check:** A full GDPR policy article renders, including the Art.9 sensitive-data section + sub-processors + mailto contact.
- **Where:** `SettingsPrivacy.tsx:91-169` (`privacy-policy-content`; `collectItems`/`useItems`/`rightsItems` via `tArray`; sensitive + subprocessors + contact sections; `mailto:privacy@andura.app`).
- **Expected:** all sections present; email rendered as a real `mailto:` anchor (not a token); version line present.
- **Verify:** Playwright → `privacy-policy-content` visible; assert headings for collect/use/rights/storage/sensitive/subprocessors/contact; `a[href="mailto:privacy@andura.app"]` exists. Cross-ref §12 (GDPR) + §09.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.072] Privacy toggles + policy strings i18n + RO no-diacritics
- **Check:** All toggle titles/descs + policy items via `t()`/`tArray()`.
- **Where:** `SettingsPrivacy.tsx:49-51,72-89,95-168`.
- **Expected:** keys present EN+RO. Cross-ref §09.
- **Verify:** keys present; `grep` for hardcoded policy text.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 05.J — SettingsTerms sub-page (T&C + Medical disclaimer re-display)

### [05.073] Terms page mounts with T&C / Medical tab toggle
- **Check:** `/app/cont/settings-terms` renders `settings-terms` with two tabs (T&C, Medical), back to Cont.
- **Where:** `SettingsTerms.tsx:24-54`, `router.tsx:204`.
- **Expected:** `terms-tab-tc` + `terms-tab-medical` tabs; default T&C active; back works.
- **Verify:** Playwright → navigate → both tabs present → click Medical → `terms-medical-content` shows → click T&C → `terms-tc-content` shows.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.074] Medical disclaimer content re-displayed (LOCK 4 invariant)
- **Check:** The Medical tab re-displays the medical disclaimer accepted at onboarding (consult-doctor + listen-to-body items).
- **Where:** `SettingsTerms.tsx:82-93` (`medicalItems` via `tArray`, `medicalScreenHeading`, `medicalListenBody`, `medicalAccepted`).
- **Expected:** medical disclaimer items render; "accepted" footer present.
- **Verify:** Playwright → Medical tab → `terms-medical-content` lists disclaimer items + accepted line. Cross-ref §15 (medical disclaimer invariant).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.075] T&C live link + version render; tabs a11y (role=tab/aria-selected)
- **Check:** T&C tab shows a live `andura.app/terms` link + version; tabs use `role="tab"` + `aria-selected`.
- **Where:** `SettingsTerms.tsx:31-54,67-78` (`terms-tc-live-link`, `aria-selected`).
- **Expected:** external link `https://andura.app/terms` (`rel="noopener noreferrer"`); active tab `aria-selected="true"`.
- **Verify:** Playwright → T&C tab → link href + rel correct; `aria-selected` flips between tabs. Cross-ref §10 + §12 (external-link rel).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Tabs lack `role="tablist"` wrapper / arrow-key roving — flag as a11y PARTIAL if §10 requires it.

---

## 05.K — SettingsExport sub-page (GDPR Art.20, all tiers)

### [05.076] Export page mounts + back-navs
- **Check:** `/app/cont/settings-export` renders `settings-export` with back.
- **Where:** `SettingsExport.tsx:143-149`, `router.tsx:205`.
- **Expected:** visible; back → `/app/cont`.
- **Verify:** Playwright → navigate → visible → back.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.077] Export downloads a JSON blob (local-only, no server upload)
- **Check:** The export button builds a JSON payload + triggers a browser download; ZERO network upload.
- **Where:** `SettingsExport.tsx:106-139` (`triggerDownload` Blob+anchor), `:128-139 handleExport`.
- **Expected:** click `settings-export-trigger` → a `andura-export-YYYY-MM-DD.json` download fires; no outbound POST.
- **Verify:** Playwright → intercept network → click export → assert a download event + ZERO upload request; success hint `settings-export-success` shows size. Cross-ref §12 (no exfil).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.078] Export payload includes ALL tiers (Art.20-complete, not just wv2-*)
- **Check:** The payload includes the 5 stores + Tier-0 `wv2-*` keys + canonical UNPREFIXED legacy keys (coach-decisions/logs/pr-records/pain-cdl/CDL) + Tier-1 IDB (cdl/logs/appliedPatterns).
- **Where:** `SettingsExport.tsx:26-30 LEGACY_DATA_KEYS` (USER_DATA_KEYS + CDL_KEYS + 'pain-cdl'); `:52-72 collectTier0Keys` (wv2-* + LEGACY); `:74-104 collectTier1` + `buildExportPayload`.
- **Expected:** seeded account with both prefixed + unprefixed data → exported JSON contains `stores`, `tier0Keys` (incl. unprefixed legacy keys present), `tier1.{cdl,logs,appliedPatterns}`.
- **Verify:** seed a `coach-decisions` + `pr-records` (unprefixed) + a `wv2-*` store → export → parse downloaded JSON → assert unprefixed keys present in `tier0Keys` + tier1 arrays populated. Cross-ref §12 (GDPR Art.20).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time — S-02 fix added the unprefixed legacy keys)_
- **Notes:** S-02 audit fix. Verify `USER_DATA_KEYS`/`CDL_KEYS` in `dataRegistry.js` are the CURRENT SSOT list (no new engine key leaked out of the registry) — a stale registry would silently drop data from the export.

### [05.079] Export EXCLUDES auth tokens (no firebase-* leak)
- **Check:** The export never serializes `firebase-*` auth tokens (S-04 concern).
- **Where:** `SettingsExport.tsx:24-25` comment + `collectTier0Keys` only pulls `wv2-*` + LEGACY_DATA_KEYS (auth keys not in either list).
- **Expected:** exported JSON contains NO `firebase-id-token` / `firebase-refresh-token` / access token.
- **Verify:** seed auth tokens → export → grep downloaded JSON for `firebase-` / token substrings → MUST be absent. Cross-ref §12 (secrets).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.080] Export content-list + strings i18n (tArray)
- **Check:** The "what's included" list + intro/CTA/hints via `t()`/`tArray('settings.export.contentItems')`.
- **Where:** `SettingsExport.tsx:141,152-194`.
- **Expected:** keys present EN+RO; list non-empty. Cross-ref §09.
- **Verify:** keys present; list renders ≥1 item.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 05.L — SettingsImport sub-page (history bootstrap → nutrition brain)

### [05.081] Import page mounts + back-navs
- **Check:** `/app/cont/settings-import` renders `settings-import` with back.
- **Where:** `SettingsImport.tsx:58-64`, `router.tsx:206`.
- **Expected:** visible; back → `/app/cont`.
- **Verify:** Playwright → navigate → visible → back.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.082] CSV file picker accepts multi-select .csv (generic, no "MFP" branding)
- **Check:** The import trigger opens a `.csv` multi-select picker; copy is generic (never shows "MyFitnessPal").
- **Where:** `SettingsImport.tsx:84-98` (`accept=".csv,text/csv" multiple`, `settings-import-input`).
- **Expected:** picker accepts multiple csv; no "MFP"/"MyFitnessPal" string in UI.
- **Verify:** Playwright → `settings-import-input` `accept` contains csv + `multiple`; `grep -ni "myfitnesspal\|MFP" src/react/routes/screens/cont/SettingsImport.tsx` → zero user-facing brand leak.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.083] Parse → preview summary (weight days / nutrition days / skipped rows)
- **Check:** Selecting valid CSVs parses purely + shows a preview with counts; empty/invalid → error state.
- **Where:** `SettingsImport.tsx:32-48 handleFiles` → `parseHistoryImportFiles`; preview `:111-143` (`settings-import-summary-weight/nutrition/skipped`); error `:99-107`.
- **Expected:** valid CSV → `settings-import-preview` with weight/nutrition/skipped counts; empty/garbage → `settings-import-error`.
- **Verify:** Playwright `browser_file_upload` a known CSV → preview counts match; upload a header-only/garbage file → error shown.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.084] Confirm applies import → feeds nutrition brain + weight log
- **Check:** Confirming the preview writes weight + daily-nutrition entries via `applyHistoryImport`, so the Bayesian/Kalman nutrition engine sees the history.
- **Where:** `SettingsImport.tsx:50-54 handleConfirm` → `applyHistoryImport(weightEntries, dailyEntries)`; done state `:145-162`.
- **Expected:** confirm → `done` message with counts; `progresStore.weightLog` + nutrition observations gain the imported entries; Progress kcal posterior shifts toward the imported history.
- **Verify:** seed import of N weight + M nutrition days → confirm → assert weightLog grew by ~N + nutrition store/observations grew; navigate Progress → posterior reflects history. Cross-ref §03 + §07 (nutrition engine) + §08.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Verify import is additive/de-duped (does not silently overwrite existing same-date entries destructively) — cross-ref §15 never-delete.

### [05.085] Import is local-only (no server upload) + strings i18n
- **Check:** Import processes files in-browser (`f.text()`), ZERO upload; copy via `t()`/`tArray`.
- **Where:** `SettingsImport.tsx:35` (`f.text()` local), `:56,67-159` (i18n keys).
- **Expected:** no outbound request on import; keys present EN+RO. Cross-ref §12 + §09.
- **Verify:** Playwright network intercept → no upload on import; keys present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 05.M — SettingsAbout / Support / FAQ sub-pages

### [05.086] About page renders branding + version/build/team rows
- **Check:** `/app/cont/settings-about` renders logo + tagline + andura.app link + version/build/team info.
- **Where:** `SettingsAbout.tsx:18-69` (`about-version`, `about-build`, team row; external link `https://andura.app`).
- **Expected:** version `v1.0.0`, build `2026.05.22`, external link `rel="noopener noreferrer"`; back → Cont.
- **Verify:** Playwright → `about-version` + `about-build` present; link href + rel correct; back works.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Version/build are hardcoded constants (`APP_VERSION`/`APP_BUILD`) — acceptable (non-user-locale data) but flag if they drift from the Cont footer version. Cross-ref §09 (these are NOT translatable strings — fine).

### [05.087] About copy strings i18n (tagline/intro/labels/thanks)
- **Check:** Tagline, intro, labels, thanks via `t('settings.about.*')`.
- **Where:** `SettingsAbout.tsx:30-67`.
- **Expected:** keys present EN+RO. Cross-ref §09.
- **Verify:** keys present; `grep` for hardcoded copy (version/build constants excepted).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.088] Support page renders email + feedback mailto (post-Beta WhatsApp disabled)
- **Check:** `/app/cont/settings-support` shows a support email row + a feedback mailto CTA; WhatsApp row is a disabled post-Beta placeholder.
- **Where:** `SettingsSupport.tsx:34-74` (`support-email` mailto, `support-feedback-mailto`, `support-whatsapp` with `postBetaLabel`).
- **Expected:** `support-email` href `mailto:support@andura.app`; feedback CTA `mailto:…?subject=Andura%20feedback`; WhatsApp shown as post-Beta (not a live link).
- **Verify:** Playwright → assert the two mailto hrefs; WhatsApp row has no actionable link + shows post-Beta label.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.089] Support strings i18n + back-navs
- **Check:** All Support copy via `t('settings.support.*')`; back → Cont.
- **Where:** `SettingsSupport.tsx:19-74`.
- **Expected:** keys present EN+RO; back works. Cross-ref §09.
- **Verify:** keys present; back → `/app/cont`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.090] FAQ page renders 3 sections + accordion expand
- **Check:** `/app/cont/settings-faq` renders training/account/notifications sections; each question expands to its answer.
- **Where:** `SettingsFaq.tsx:25-126` (`FAQ` sections, `faq-q-{id}` buttons, `aria-expanded`, accordion `openId`).
- **Expected:** 3 sections; click a question → answer expands + `aria-expanded=true`; click again → collapses.
- **Verify:** Playwright → click `faq-q-training-0` → answer visible + `aria-expanded="true"`; click again → collapses.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.091] FAQ footer routes to Support + strings i18n
- **Check:** The FAQ footer "still need help?" CTA navigates to Support; all Q/A via `t('settings.faq.*')`.
- **Where:** `SettingsFaq.tsx:112-122` (footer → `settings-support`); items keys.
- **Expected:** footer CTA → `/app/cont/settings-support`; keys present EN+RO. Cross-ref §09.
- **Verify:** Playwright → footer CTA → Support mounts; keys present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 05.N — Cross-tab rows reachable from Cont (Aparate lipsa / Ceva nu merge)

### [05.092] Aparate lipsa reachable from Cont GENERAL group
- **Check:** The `aparate-lipsa` row navigates to the (antrenor-owned) missing-equipment screen.
- **Where:** `Cont.tsx:93` → `gotoPath('aparate-lipsa')` = `/app/antrenor/aparate-lipsa`; screen `antrenor/AparateLipsa.tsx`, `router.tsx:163`.
- **Expected:** click → the AparateLipsa screen mounts (lets the user mark gym equipment as missing, affecting exercise selection).
- **Verify:** Playwright → click `cont-row-aparate-lipsa` → URL `/app/antrenor/aparate-lipsa` + the screen's testid present. Cross-ref §06 (workout equipment).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Reaching an antrenor-tab screen from the Cont tab crosses the bottom-nav context — confirm the bottom nav reflects the right active tab after navigation (UX), flag PARTIAL if it strands the user.

### [05.093] Ceva nu merge reachable from Cont HELP group
- **Check:** The `ceva-nu-merge` row navigates to the "something's broken" report screen.
- **Where:** `Cont.tsx:118` → `gotoPath('ceva-nu-merge')` = `/app/antrenor/ceva-nu-merge`; `router.tsx:160`.
- **Expected:** click → the CevaNuMerge screen mounts.
- **Verify:** Playwright → click `cont-row-ceva-nu-merge` → URL + screen testid. Cross-ref §06.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 05.O — SettingsDanger sub-page (the gateway to destructive confirms)

### [05.094] Danger page mounts with warning banner + 3 destructive rows
- **Check:** `/app/cont/settings-danger` renders a warning banner + Logout / Reset data / Delete account rows.
- **Where:** `SettingsDanger.tsx:18-94` (`danger-warning-banner` `role="status"`; `danger-logout`, `danger-reset`, `danger-delete`).
- **Expected:** banner + 3 rows; delete row brick-coloured; back → Cont.
- **Verify:** Playwright → navigate → banner visible + 3 rows present; back → `/app/cont`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.095] Danger rows route to GATED confirm screens (no inline destruction)
- **Check:** Each danger row navigates to a separate confirm screen — no row performs its action inline.
- **Where:** `SettingsDanger.tsx:47,60,73` (`logout-confirm`, `reset-data-confirm`, `delete-account-confirm`).
- **Expected:** click logout → `/app/cont/logout-confirm`; reset → `/app/cont/reset-data-confirm`; delete → `/app/cont/delete-account-confirm`. NO data wiped on the danger page itself.
- **Verify:** Playwright → click each → route + confirm-screen mounts; confirm no store mutation occurred on the danger page (read stores before/after navigation).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** D047 drill-down paradigm (ConfirmModal removed).

### [05.096] Delete-row copy is honest (no false "30-day grace" promise)
- **Check:** The delete row sub-text does NOT promise a recovery grace period (the React delete is an immediate hard wipe).
- **Where:** `SettingsDanger.tsx:80-84` (U-06 fix removed the "30 zile gratie" copy; `deleteRowSub`).
- **Expected:** delete row sub-text matches reality = immediate irreversible deletion; no "recover within N days".
- **Verify:** read `t('settings.danger.deleteRowSub')` EN+RO → assert no grace-period language; `grep -ni "30 zile\|grace\|recover" src/i18n/*.json` near danger keys → none. Cross-ref §15 (honesty).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** U-06 audit fix.

### [05.097] Danger GDPR footer has no leaked internal decision IDs
- **Check:** The footer GDPR note shows no internal `§B039`/`D-6` prefixes (U-07 fix).
- **Where:** `SettingsDanger.tsx:89-93` (`gdprFooter`).
- **Expected:** footer is clean user copy.
- **Verify:** read `t('settings.danger.gdprFooter')` → no `§`/`D-`/decision-id substrings.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** U-07 audit fix.

---

## 05.P — Confirm dialogs (drill-down) — gating, scope, invariants

### [05.098] LogoutConfirm is a gated two-step screen (i18n, glass, cancel)
- **Check:** Logout requires a dedicated confirm screen with accept + cancel; cancel returns to danger.
- **Where:** `LogoutConfirm.tsx:74-114` (`logout-confirm`, `logout-confirm-accept`, `logout-confirm-cancel` → `settings-danger`).
- **Expected:** screen renders heading/body via `t('confirm.logout.*')`; cancel → `settings-danger`; accept → logout flow.
- **Verify:** Playwright → navigate → accept + cancel both present + i18n; click cancel → back to danger (no logout). Cross-ref §09.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.099] Logout clears auth tokens + resets skip-auth (no re-entry loophole)
- **Check:** Confirming logout calls `authSignOut()` AND `setSkipAuth(false)` so a skip-auth user actually exits.
- **Where:** `LogoutConfirm.tsx:55-68` (`authSignOut()`, `setAuthenticated(false)`, `setSkipAuth(false)`, navigate `/auth`).
- **Expected:** after confirm → `firebase-*` tokens cleared + `isSkipAuth=false` + at `/auth`; ProtectedRoute does not let them back in.
- **Verify:** seed skip-auth session → logout → assert tokens gone + skip-auth false + URL `/auth`; try navigating `/app/cont` → bounced to `/auth`. Cross-ref §12 (auth gate) + §15.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** U-14 + A007 audit fixes.

### [05.100] Logout WIPES local user data on shared device (cloud preserved)
- **Check:** Logout wipes Tier-0 local + IDB user data (so the next person on the browser sees a clean app), but does NOT touch the cloud backup (re-login restores).
- **Where:** `LogoutConfirm.tsx:31-48 wipeLocalUserDataOnLogout` (zustand resets + `wipeUserDataOnLogout()` local+IDB, cloud untouched).
- **Expected:** seeded account → logout → localStorage user keys + IDB cleared; cloud RTDB unchanged; re-login → data restored from cloud.
- **Verify:** seed populated account → logout → assert localStorage user-data keys cleared + IDB empty; (mock) RTDB still has the backup. Cross-ref §08 + §12 (H1 shared-device PII leak).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** H1 fix — logout previously left all Tier-0 data on device.

### [05.101] DeleteAccountConfirm is gated + requires fresh re-auth (§A016)
- **Check:** Delete requires a confirm screen AND a recent re-auth; a stale session bounces to re-auth instead of deleting.
- **Where:** `DeleteAccountConfirm.tsx:79-86` (`if (!isAuthFresh()) → authSignOut + navigate('/auth?reason=reauth_required_for_delete')`).
- **Expected:** stale auth → accept → redirected to `/auth?reason=reauth_required_for_delete`, NO wipe; fresh auth → proceeds.
- **Verify:** simulate stale auth (`isAuthFresh()` false) → accept → URL has `reason=reauth_required_for_delete` + data intact. Cross-ref §12 (re-auth gate).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** §A016 destructive-action freshness gate.

### [05.102] Delete-before-signout invariant (RE-S-01) — cloud DELETE fires with a valid token
- **Check:** The cloud (RTDB) DELETE is AWAITED to completion BEFORE `authSignOut()` clears the tokens, so the DELETE is authorized (no data-resurrection).
- **Where:** `DeleteAccountConfirm.tsx:105-116` (`window._suppressFirebaseSync=true` → `await Promise.race([wipeRemoteData(uid), timeout])` → `wipeAllLocalData()` → `authSignOut()` → navigate). `wipeRemoteData` (`:53-73`) issues the RTDB `DELETE …?auth=<idToken>`.
- **Expected:** order is wipeRemote(await) → wipeLocal → signOut; the DELETE request carries a valid `auth` token (NOT null); a hung network falls back after `REMOTE_WIPE_TIMEOUT_MS` (8000ms) without trapping the user.
- **Verify:** Playwright/network intercept on fresh auth → click delete → observe a `DELETE /users/<uid>.json?auth=<token>` with a non-empty token fired BEFORE tokens are cleared; simulate hung DELETE → user still navigates to `/auth` after ≤8s. Cross-ref §12 + §15 (S-07 data-resurrection invariant). **CRITICAL behavior — a FAIL here is a privacy breach.**
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time — RE-S-01: prior `void wipeRemoteData` ran after signOut → null token → cloud survived)_
- **Notes:** RE-S-01 + RE-S-02 audit fixes. This is the single most important step in §05.

### [05.103] Delete wipes ALL local data (full localStorage.clear, GDPR Art.17)
- **Check:** Delete clears the ENTIRE localStorage namespace (not just `wv2-*`) + Tier-1 IDB, leaving nothing on device.
- **Where:** `DeleteAccountConfirm.tsx:26-51 wipeAllLocalData` (`localStorage.clear()` + zustand resets + IDB via `wipeUserDB`); `:41` clear; `:47` sync-suppression marker set AFTER clear.
- **Expected:** seeded account (with unprefixed legacy keys + device-id + tombstones) → delete → localStorage empty; IDB user DB wiped.
- **Verify:** seed prefixed + unprefixed keys → delete (fresh auth) → assert `localStorage.length === 0` (or only the suppression marker) + IDB user store gone. Cross-ref §08 + §12 (S-01 GDPR Art.17).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** S-01 audit fix — prior wv2-* loop left ~38 unprefixed keys.

### [05.104] Delete sets sync-suppression so no stale-empty push resurrects the account
- **Check:** A suppression window is set both up-front (`window._suppressFirebaseSync=true`) and post-clear (`__suppressFirebaseSyncUntil`), preventing a debounced `syncToFirebase` from recreating `users/{uid}`.
- **Where:** `DeleteAccountConfirm.tsx:105` (up-front flag) + `:47` (post-clear timestamp marker, +10000ms).
- **Expected:** during/after the store resets, no `syncToFirebase` write recreates the cloud node.
- **Verify:** network intercept → during delete, NO `PUT/PATCH users/<uid>` fires after the DELETE; next boot's `syncFromFirebase` short-circuits via the marker. Cross-ref §08 + §15.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** RE-S-02 audit fix.

### [05.105] DeleteAccountConfirm cancel returns to danger (no accidental delete)
- **Check:** Cancel / back returns to `settings-danger` without deleting.
- **Where:** `DeleteAccountConfirm.tsx:119-121,128-129,153-160` (`handleCancel → settings-danger`; back + cancel buttons).
- **Expected:** cancel → danger, data intact.
- **Verify:** Playwright → navigate → cancel → `settings-danger` + data intact.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.106] ResetDataConfirm wipes ALL tiers but keeps the account/session
- **Check:** Reset wipes Tier-0 (prefixed + unprefixed) + Tier-1 IDB + Tier-2 cloud synced keys, but PRESERVES the `firebase-*` session + device-id + theme (stays logged in).
- **Where:** `ResetDataConfirm.tsx:29-53 wipeAllLocalData` (zustand resets + `clearUserDataKeys()` + `clearUserIndexedDB()` + `clearUserCloudData()`); confirm → navigate `/`.
- **Expected:** seeded account → reset → user data gone across tiers, but still authenticated (session preserved) + lands on `/` fresh-start.
- **Verify:** seed populated account → reset → assert user-data keys cleared BUT `firebase-id-token` still present + still on an authed route; cloud synced keys DELETEd. Cross-ref §08 + §15 (the "nu poate fi anulata" copy must be TRUE now — A2 H-1 fix).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** A2 H-1 fix — prior reset cleared only wv2-* (PR wall / Istoric / coach survived → copy was a lie).

### [05.107] ResetData distinct from Delete (no sign-out)
- **Check:** Reset does NOT call `authSignOut` (distinct from delete).
- **Where:** `ResetDataConfirm.tsx:55-65` (no signOut; navigate `/`).
- **Expected:** after reset → still authenticated.
- **Verify:** read auth state post-reset → still signed in.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [05.108] ResetCoachConfirm wipes ONLY coach AI state (training data intact)
- **Check:** Reset coach clears CDL tiers + pattern learning + cooldowns via `resetCoachState()`, preserving workout logs / weight / profile / phase-log.
- **Where:** `ResetCoachConfirm.tsx:14,21-24` (`resetCoachState()`; navigate `settings-prefs`).
- **Expected:** seeded account → reset coach → coach learning state gone; workout logs + weightLog + profile UNCHANGED (copy: "Datele tale de antrenament raman intacte").
- **Verify:** seed coach state + workout logs → reset coach → assert coach CDL cleared BUT logs/weightLog/profile intact. Cross-ref §07 (coach engine) + §15.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Verify the scope claim against `coachReset.resetCoachState` impl — flag PARTIAL if it touches non-coach keys.

### [05.109] SchimbaFazaConfirm radio selector + persists phase override
- **Check:** Manual phase override offers AUTO/CUT/MAINTENANCE/BULK/STRENGTH, shows the auto-detected phase on the AUTO option, and persists `phase-override` + recalibrates engines.
- **Where:** `SchimbaFazaConfirm.tsx:21-53` (`PHASE_OPTIONS`, `getAutoDetectedPhaseLabelRo`, `setPhaseOverride(selected, tdee)`; testids `phase-auto|cut|maintenance|bulk|strength`).
- **Expected:** select CUT → confirm → `phase-override='CUT'` persisted + phase-change-date + phase-log entry; engines (TDEE/volume/progression) read the override next session; AUTO option shows the live auto-detected label.
- **Verify:** Playwright → select CUT → confirm → read `phase-override` = CUT; assert AUTO row hint shows a detected label (or MAINTENANCE cold-start). Cross-ref §07 (periodization) + §08.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Selector uses `aria-pressed` buttons (not role=radiogroup) — documented Karpathy-SF tradeoff; flag only if §10 requires radiogroup semantics.

### [05.110] RedoOnboardingConfirm resets onboarding only (account preserved)
- **Check:** Redo onboarding resets `onboardingStore` + redirects to `/onboarding/1`, preserving the auth account + cont (Tier-0 onboarding only, no Firebase touch).
- **Where:** `RedoOnboardingConfirm.tsx:20-23` (`useOnboardingStore.reset()`; navigate `/onboarding/1`).
- **Expected:** confirm → onboarding answers cleared + at `/onboarding/1`; account still authenticated; other stores untouched.
- **Verify:** seed authed account → redo → assert onboardingStore reset + URL `/onboarding/1` + still authenticated + workout/weight stores intact. Cross-ref §01 (onboarding) + §15.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Reversible per copy (re-completing restores config).

### [05.111] All 6 confirm screens are glass + i18n + cancel-safe (uniform pattern)
- **Check:** Every confirm screen (logout/delete/reset-data/reset-coach/schimba-faza/redo-onboarding) renders the uniform drill-down (icon disc + heading + 2 body paras + accept + cancel), all via `confirm.*` i18n keys, with a non-destructive cancel.
- **Where:** the 6 files' shared structure (`confirm.{logout,deleteAccount,resetData,resetCoach,schimbaFaza,redoOnboarding}.{title,heading,body1,body2,acceptCta,cancelCta}`).
- **Expected:** all 6 have accept + cancel testids; all copy via `t()`; cancel never destroys. Cross-ref §09 + §11.
- **Verify:** for each of the 6: assert `*-confirm-accept` + `*-confirm-cancel` present + i18n keys exist EN+RO; cancel returns without mutation.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Parity note: confirm screens use legacy `bg-paper2 border` discs / flat CTAs (`bg-brick text-paper`), not `.pulse-card` — if §11 requires Pulse glass on confirms, flag PARTIAL (cross-ref §11.608).

---

## 05.Q — Removed surface + routing integrity

### [05.112] SettingsThemes is GONE (no source file)
- **Check:** The old multi-palette "themes" sub-screen `SettingsThemes` no longer exists in the codebase.
- **Where:** `src/react/routes/screens/cont/` (no `SettingsThemes.tsx`).
- **Expected:** zero `SettingsThemes` component file.
- **Verify:** `ls src/react/routes/screens/cont/` → no `SettingsThemes.tsx` (confirmed: directory contains Cont + Settings{About,Appearance,Danger,Export,Faq,Import,Notifications,Prefs,Privacy,Profile,Subscription,Support,Terms} + 6 *Confirm + userProfile — NO SettingsThemes).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** Directory listing confirms no `SettingsThemes.tsx`.
- **Notes:** Pulse redesign dropped the multi-palette system (Cont.tsx header comment + paletteSync.ts:7-14).

### [05.113] No `settings-themes` route registered
- **Check:** The router has no `settings-themes` path + no `SettingsThemes` lazy import.
- **Where:** `router.tsx:82-102,198-218`.
- **Expected:** zero `settings-themes` route; zero `SettingsThemes` import.
- **Verify:** `grep -rn "SettingsThemes\|settings-themes" src/react/routes/router.tsx` → zero matches.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** router cont children = the 13 settings-* + 6 confirm screens only (no settings-themes). _(confirm grep returns empty at audit)_
- **Notes:** _(fill if deviation)_

### [05.114] No dangling `settings-themes` reference anywhere in src
- **Check:** No screen, nav helper, or test references the removed themes route/screen.
- **Where:** whole `src/`.
- **Expected:** zero dangling refs (the only "themes" matches are unrelated: `exerciseLibrary.js` + `dark-palette-variant.test.ts`).
- **Verify:** `grep -rni "SettingsThemes\|settings-themes\|goto('themes')\|'settings-themes'" src/` → zero source/route/nav matches; the two `themes` hits in `exerciseLibrary.js`/`dark-palette-variant.test.ts` are unrelated (exercise data / dark-token test). Confirm `navigation.ts GotoScreen` has no `settings-themes`/palette member (`navigation.ts:41-44` lists only the 13 live settings-* ids).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** `navigation.ts:41-44` GotoScreen union has no themes id; gotoPath (`:104-115`) maps only the 13 live settings-*. paletteSync.ts retains a dead `PaletteTheme` type + `applyPalette` no-op (graceful legacy parse) but exposes NO route.
- **Notes:** Residual: `paletteSync.ts:24,86-89,91-103` keeps a dead `PaletteTheme`/`applyPalette` (clears data-palette, no-op) + `wv2-palette-theme` read for graceful legacy parsing. Not a dangling route, but dead code — flag as a §DEAD-CODE cleanup candidate (PARTIAL only if it misleads; otherwise PASS-with-note).

### [05.115] Every Cont row target is a registered, reachable route
- **Check:** All 15 row targets + all advanced/danger drill-down targets resolve to a registered router path (no 404 / white screen).
- **Where:** `Cont.tsx SECTIONS` targets + `SettingsPrefs`/`SettingsDanger` drill-down targets vs `router.tsx:160-218` + `navigation.ts gotoPath`.
- **Expected:** every `target` in SECTIONS + every confirm/drill-down nav has a matching route; `gotoPath` has no `Unknown screen` throw for any used id.
- **Verify:** Playwright → click EVERY row + EVERY drill-down → assert each mounts a known screen testid (no error boundary); cross-check `routing.test.tsx` covers cont children.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time — router cont children at 198-218 cover all 13 settings-* + 6 confirm; aparate-lipsa/ceva-nu-merge under antrenor at 160-163)_
- **Notes:** _(fill if deviation)_

---

## 05.R — Section roll-up

### [05.116] Account section i18n coverage is complete (no leaks, no diacritics)
- **Check:** Across Cont + all 13 sub-pages + 6 confirms, zero hardcoded user-facing strings + zero RO diacritics.
- **Where:** all `cont/*` files; keys under `cont.*` + `settings.*` + `confirm.*`.
- **Expected:** the i18n scanner (`noHardcodedStrings`/`i18nNoRoLeak`) passes for every `cont/*` file; RO bundle no-diacritics. Cross-ref §09 (authoritative).
- **Verify:** run the §09 scanner restricted to `src/react/routes/screens/cont/` → zero violations; manual `grep` spot-check the documented intentional literals ("/ Language" affordance, version/build constants, single-char day glyphs) are the ONLY non-`t()` user-facing text.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Defer the authoritative i18n verdict to §09; this step is the Account-scoped cross-check.

### [05.117] Account section Pulse parity roll-up (landing reskinned, confirms/sub-pages audited)
- **Check:** The Cont LANDING is fully Pulse-reskinned (glass cards, mono eyebrows, gradient avatar, accent picker); the sub-pages + confirms are enumerated for reskin status.
- **Where:** `Cont.tsx` (Pulse) vs the flat sub-pages (`SettingsAppearance`/`SettingsProfile`/etc. use `bg-paper2 border`) + flat confirms.
- **Expected:** landing PASS (Pulse); sub-pages/confirms = PARTIAL where still legacy-flat (the inline card vs flat sub-pages divergence in 05.061; confirms flat in 05.111). Cross-ref §11.601-11.608 (authoritative parity).
- **Verify:** Playwright → assert `cont-home` cards are `.pulse-card`; enumerate which sub-pages/confirms still use `bg-paper2 border` (flat) → each is a §11.608 PARTIAL.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time — landing Pulse confirmed in code; sub-pages + 6 confirms still flat bg-paper2)_
- **Notes:** Defer authoritative pixel parity to §11; this step is the Account-scoped structural roll-up. Net: the LANDING shipped Pulse; the SUB-PAGES + CONFIRMS are the remaining reskin debt (consistent flat legacy look) — a known, bounded PARTIAL, not a missing feature.
