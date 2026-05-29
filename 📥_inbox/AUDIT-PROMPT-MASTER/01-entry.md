# SECTION 01 — Entry flow: Splash / Auth / Onboarding

> **Weight 6% · Gate 95% · Critical: no.** Goal: a new user AND a returning user
> gets through the door correctly — splash auto-advances to the right place, auth
> offers the right paths in the right language, and onboarding collects a valid
> Big-7 profile (adults-only, in-bounds) before any engine sees a baseline.
>
> **Surface walked:** `src/react/routes/screens/Splash.tsx`,
> `src/react/routes/screens/Auth.tsx`,
> `src/react/routes/screens/AuthCallback.tsx`,
> `src/react/routes/screens/Onboarding.tsx`,
> `src/react/stores/onboardingStore.ts`,
> `src/react/routes/ProtectedRoute.tsx`, `src/auth.js`, `src/react/stores/appStore.ts`.
> Mockup ref: `04-architecture/mockups/interfata-noua/screens-entry.jsx`
> (SplashScreen ~25-52, AuthScreen ~55-114, OnboardingScreen ~117-262).
> i18n: `src/i18n/en.json` + `src/i18n/ro.json` (cross-ref §09).
>
> **Run prerequisites for the Verify steps:**
> - Dev server: `npm run dev` (vite) → app at `http://localhost:5173`.
> - Unit/store: `npm run test:run` (vitest run) or `npm run test:unit` (watch).
> - Playwright E2E: `npm run test:e2e` (`playwright test`); smoke =
>   `npm run test:e2e:smoke` (`tests/smoke-react.spec.ts tests/magic-link.spec.ts`).
> - Static greps run from repo root.
> - Seeded account per §APPENDIX-SEED for any state-dependent step (returning-user
>   splash target, onboarding-complete redirect).

---

## 01.A — SPLASH (`Splash.tsx`, route `/`)

### [01.001] Splash route mounts at `/` outside the tab Layout
- **Check:** `<Splash />` is the element for path `/`, rendered as a top-level (no BottomNav) route.
- **Where:** `src/react/routes/router.tsx` (top-level routes block ~L119-139); `Splash.tsx:30`.
- **Expected:** Visiting `/` renders the splash section (`data-testid="splash"`), no bottom nav, no Layout chrome.
- **Verify:** `npm run dev` → navigate `http://localhost:5173/` → `[data-testid="splash"]` present, no `[data-testid="bottom-nav"]`. Static: `grep -nE "path: '/'|<Splash" src/react/routes/router.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.002] PulseMark logo renders on splash
- **Check:** The animated PulseMark brand logo is rendered at size 96.
- **Where:** `Splash.tsx:66` `<PulseMark size={96} />`; component `src/react/components/pulse/PulseMark.tsx`.
- **Expected:** PulseMark SVG visible, wrapped in `.animate-scale-in` entrance.
- **Verify:** Playwright snapshot of `[data-testid="splash"]` → an SVG (PulseMark) is present above the wordmark. `grep -n "PulseMark size={96}" src/react/routes/screens/Splash.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.003] Gradient "Andura" wordmark via i18n key
- **Check:** The wordmark heading text comes from `t('splash.appName')`, not a hardcoded "Andura".
- **Where:** `Splash.tsx:72-77` (h1 with `.pulse-gradtext.font-display`).
- **Expected:** `<h1>` renders `t('splash.appName')`; EN + RO both resolve (brand name may be identical, but routed through `t()`).
- **Verify:** `grep -n "splash.appName" src/react/routes/screens/Splash.tsx` → used at L61 (aria-label) + L76 (heading). Confirm key present both locales: `node -e "..."` lookup `splash.appName` in en.json/ro.json (verified present 2026-05-29).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.004] Tagline (two-line) via i18n
- **Check:** Tagline renders `t('splash.taglineLine1')` + `t('splash.taglineLine2')`.
- **Where:** `Splash.tsx:81-86`.
- **Expected:** Both keys resolve EN+RO, no hardcoded literal tagline.
- **Verify:** `grep -nE "taglineLine1|taglineLine2" src/react/routes/screens/Splash.tsx`. Render check: both lines visible in mono eyebrow style.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.005] Trust footer via i18n with stable testid
- **Check:** Trust footer text renders `t('splash.trustFooter')` and has `data-testid="splash-trust-footer"`.
- **Where:** `Splash.tsx:100-106`.
- **Expected:** Footer string localized; testid present (test anchor preserved from pre-Pulse).
- **Verify:** `grep -nE "splash-trust-footer|splash.trustFooter" src/react/routes/screens/Splash.tsx`. Playwright: `[data-testid="splash-trust-footer"]` visible.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.006] Auto-advance fires at ~2600ms
- **Check:** A single `setTimeout` of `ADVANCE_MS = 2600` calls `advance()` and is cleared on unmount.
- **Where:** `Splash.tsx:28,42-48`.
- **Expected:** After ~2.6s with no interaction, the route changes; the timer is cleared on unmount (no leak / double-fire).
- **Verify:** `npm run dev` → load `/` unauthenticated → wait ~3s → URL becomes `/auth`. Static: `grep -nE "ADVANCE_MS|setTimeout|clearTimeout" src/react/routes/screens/Splash.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.007] Auto-advance routes UNauthenticated user to `/auth`
- **Check:** When `isAuthenticated === false`, advance navigates to `/auth`.
- **Where:** `Splash.tsx:39` `navigate(isAuthenticated ? '/app/antrenor' : '/auth')`.
- **Expected:** Fresh visitor lands on `/auth` after auto-advance or tap.
- **Verify:** Playwright clean storage → load `/` → auto-advance → assert `page.url()` ends `/auth`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.008] Auto-advance routes AUTHENTICATED user to `/app/antrenor`
- **Check:** When `isAuthenticated === true`, advance navigates to `/app/antrenor` (the Coach tab), not `/auth`.
- **Where:** `Splash.tsx:32,39`.
- **Expected:** Returning logged-in user skips auth and lands on Coach.
- **Verify:** Playwright on SEEDED authenticated account (valid `firebase-id-token` in localStorage + onboarding complete) → load `/` → assert URL `/app/antrenor`. Note: `isAuthenticated` here is the appStore selector; ProtectedRoute syncs storage→store, but Splash reads appStore directly — confirm the store is true at splash mount on a real reload (see 01.009).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.009] Returning-user splash target survives a cold reload (store-vs-storage)
- **Check:** On a hard reload of `/`, `appStore.isAuthenticated` is already true at splash mount so the advance targets `/app/antrenor` — NOT a flash of `/auth`.
- **Where:** `Splash.tsx:32` reads `appStore.isAuthenticated`; appStore does NOT persist `isAuthenticated` (only `isSkipAuth` — `appStore.ts:54`). The storage→store bridge lives in `ProtectedRoute.tsx:41-60`, which Splash does NOT mount.
- **Expected:** Returning user with a valid token still routes to the app. **RISK:** appStore.isAuthenticated defaults false on cold load and Splash has no storage-sync effect → a logged-in returning user may be auto-advanced to `/auth` on first load until they hit a ProtectedRoute. Verify actual behavior.
- **Verify:** Playwright: seed valid `firebase-id-token` (+ expiry) in localStorage, clear sessionStorage, hard-navigate `/` → observe whether splash advances to `/app/antrenor` or `/auth`. If `/auth`, this is a FAIL/PARTIAL (returning user friction).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** If FAIL — fix is to run the same `readAuthFromStorage()` sync in Splash (or hoist auth-bootstrap above the router). Cross-ref §08 (state hydration) + §12 (auth gate).

### [01.010] Tap-to-skip advances immediately
- **Check:** Clicking the splash section calls `advance()` before the 2.6s timer.
- **Where:** `Splash.tsx:52` `onClick={advance}`.
- **Expected:** Immediate navigation on tap.
- **Verify:** Playwright: load `/` → `click [data-testid="splash"]` within 1s → URL already changed.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.011] Keyboard Enter/Space skips (a11y) and prevents default scroll
- **Check:** Enter or Space on the focused splash triggers advance; Space does not scroll the page.
- **Where:** `Splash.tsx:53-58` (`onKeyDown`, `e.preventDefault()`).
- **Expected:** Section is `role="button"`, `tabIndex={0}`, `aria-label={t('splash.appName')}`; Enter/Space navigate.
- **Verify:** Playwright: load `/` → `page.keyboard.press('Enter')` → URL changes. Repeat with Space. Cross-ref §10 (a11y).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.012] Double-fire guard (tap + timer cannot both navigate)
- **Check:** `advancedRef` prevents a second `navigate` if the user taps right as the timer fires.
- **Where:** `Splash.tsx:34-40`.
- **Expected:** Exactly one navigation; no double history entry / no nav-during-unmount warning.
- **Verify:** Code review of the ref guard (L37 early-return). Playwright: tap at ~2590ms → no console error, single URL change.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.013] Splash dots are decorative + motion-gated
- **Check:** The 3-dot loader is `aria-hidden`, and its float animation is disabled under `[data-calm="1"]` and `prefers-reduced-motion: reduce`.
- **Where:** `Splash.tsx:90-126` (`aria-hidden="true"`, the inline `<style>` reduced-motion + calm block).
- **Expected:** Dots not announced to SR; animation removed when reduced motion / calm. Cross-ref §10 + §14 (motion budget).
- **Verify:** `grep -nE "aria-hidden|prefers-reduced-motion|data-calm" src/react/routes/screens/Splash.tsx`. Playwright with `reducedMotion: 'reduce'` → dots static.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.014] Splash parity vs mockup SplashScreen
- **Check:** Live splash matches `interfata-noua/screens-entry.jsx` SplashScreen (~25-52): PulseMark + volt→aqua gradient wordmark + mono tagline + 3 dots; the mockup's two CTA buttons are intentionally dropped (auto-advance encodes the routing).
- **Where:** mockup `screens-entry.jsx` ~25-52 vs `Splash.tsx`.
- **Expected:** Layout/color/type within parity tolerance; absence of CTA buttons is by-design (documented `Splash.tsx:9-12`), not a regression. Cross-ref §11.
- **Verify:** Render mockup (HTTP, not file://) vs live `/`; screenshot-diff. Color tokens: gradient uses `--grad-pulse` (volt→aqua), no raw hex.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 01.B — AUTH (`Auth.tsx`, route `/auth`)

### [01.020] Auth screen mounts with stable testid
- **Check:** `/auth` renders the auth section `data-testid="auth"`.
- **Where:** `Auth.tsx:122-126`; router top-level `/auth`.
- **Expected:** Section present, centered card layout, no bottom nav.
- **Verify:** Playwright navigate `/auth` → `[data-testid="auth"]` visible.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.021] Login heading "Bine ai revenit" / "Welcome back" via i18n
- **Check:** In `mode==='login'` (default) the heading renders `t('auth.loginTitle')` ("Bine ai revenit" RO / "Welcome back" EN).
- **Where:** `Auth.tsx:165-167` (heading conditional), `initialMode` default `'login'` (L58-62).
- **Expected:** Default landing shows the login title via key, both locales resolve.
- **Verify:** Playwright `/auth` → heading text = login title. `grep -n "auth.loginTitle" src/react/routes/screens/Auth.tsx`; confirm key in en.json + ro.json (verified present 2026-05-29). RO value must be diacritic-free per D-LEGACY-064 (cross-ref §09).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.022] Login subtitle via i18n
- **Check:** Subtitle renders `t('auth.loginSubtitle')` in login mode.
- **Where:** `Auth.tsx:168-174`.
- **Expected:** Localized, no hardcode.
- **Verify:** `grep -n "auth.loginSubtitle" src/react/routes/screens/Auth.tsx`; key present both locales.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.023] Splash→Auth `state.mode='signup'` lands on signup path
- **Check:** Navigating to `/auth` with `location.state.mode === 'signup'` initializes `mode='signup'`; absent state defaults `'login'`.
- **Where:** `Auth.tsx:58-62`.
- **Expected:** Signup-origin link shows signup title/subtitle; direct `/auth` shows login. NOTE: the current Splash has no CTA buttons (auto-advance only), so the signup-state entry now comes from the in-screen "Creeaza cont" toggle, not Splash — verify the toggle path (01.034) rather than a Splash CTA.
- **Verify:** Playwright: navigate with `{ state: { mode: 'signup' } }` (or via 01.034 toggle) → heading = `t('auth.signupTitle')`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.024] Email field: type, required, autocomplete, inputmode, i18n label
- **Check:** Email input is `type="email"`, `required`, `aria-required`, `autoComplete="email"`, `inputMode="email"`; label `t('auth.emailLabel')`; placeholder `t('auth.emailPlaceholderRo')`.
- **Where:** `Auth.tsx:219-244`.
- **Expected:** All attributes present; label+placeholder localized; testid `auth-email-input`.
- **Verify:** `grep -nE "auth-email-input|autoComplete=\"email\"|inputMode=\"email\"|auth.emailLabel|auth.emailPlaceholderRo|required" src/react/routes/screens/Auth.tsx`. Playwright: assert attributes on `[data-testid="auth-email-input"]`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.025] Email validation gates the primary CTA
- **Check:** Send button is `disabled` until `isValidEmail(email)` passes.
- **Where:** `Auth.tsx:37-39` (regex), `Auth.tsx:292` (`disabled={!isValidEmail(email) || sending || consentRequiredUnmet}`).
- **Expected:** Empty / malformed email → button disabled; valid `a@b.co` → enabled (login mode).
- **Verify:** Playwright: type `abc` → `[data-testid="auth-send"]` disabled; type `gigel@mail.ro` → enabled. Regex check: `^[^\s@]+@[^\s@]+\.[^\s@]+$`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.026] Primary CTA = magic-link "Send sign-in link" (gradient primary)
- **Check:** The primary action is the magic-link send (gradient volt→aqua `pulse-grad-bg`), label via i18n; Google is secondary/ghost beneath (per Pulse mockup; supersedes old Google-primary P-01).
- **Where:** `Auth.tsx:289-302` (primary), styling `pulse-grad-bg pulse-shine`; label `t('auth.sendCtaLogin')` / `t('auth.sendCtaSignup')` / `t('auth.sendingLabel')`.
- **Expected:** Magic-link button visually primary, full-width, labeled correctly per mode + sending state.
- **Verify:** Playwright: `[data-testid="auth-send"]` has gradient class + correct label per mode. `grep -nE "auth-send|pulse-grad-bg|sendCtaLogin|sendCtaSignup|sendingLabel" src/react/routes/screens/Auth.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.027] Send wires REAL `sendMagicLink` and shows the sent state
- **Check:** `handleSend` calls `sendMagicLink(email)` from `src/auth.js`; on `result.ok` sets `sent=true`; on failure sets `error`.
- **Where:** `Auth.tsx:74-85`, import L24.
- **Expected:** Real wire (not a stub); success → `[data-testid="auth-sent"]` card appears.
- **Verify:** Playwright with network mock for the Firebase `sendOobCode` endpoint → assert request fired + sent card shown. Static: `grep -n "sendMagicLink" src/react/routes/screens/Auth.tsx src/auth.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Cross-ref §12 (auth security) for the actual endpoint/TTL/replay behavior.

### [01.028] Sent state: title, body naming the email, change-email back
- **Check:** Sent card shows `t('auth.sent.title')` heading region + body `t('auth.sent.bodyPrefix')` + the literal `email` + `t('auth.sent.bodySuffix')`, plus a "Schimba emailul" back button (`auth-back`) that returns to the form (`setSent(false)`).
- **Where:** `Auth.tsx:166` (title), `Auth.tsx:183-209`.
- **Expected:** Cross-device hint present; the exact typed email shown bold; back button resets to the form.
- **Verify:** Playwright: send → `[data-testid="auth-sent"]` shows the typed email; click `[data-testid="auth-back"]` → form returns.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.029] Sent state shows signup note only in signup mode
- **Check:** `auth-sent-signup-note` (`t('auth.sent.signupNote')`) renders only when `mode==='signup'`.
- **Where:** `Auth.tsx:193-200`.
- **Expected:** Login-mode sent card omits the note; signup-mode shows it.
- **Verify:** Playwright in each mode → assert presence/absence of `[data-testid="auth-sent-signup-note"]`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.030] "Continue with Google" ghost shown only when client ID configured
- **Check:** Google button (`auth-google`) + its "sau" divider render only when `GOOGLE_OAUTH_CLIENT_ID !== ''` AND `mode==='login'`.
- **Where:** `Auth.tsx:33-35` (env read), `Auth.tsx:114` (`showGoogle`), `Auth.tsx:311-337`.
- **Expected:** With `VITE_GOOGLE_OAUTH_CLIENT_ID` unset → button hidden (graceful degradation pre-Daniel-config). With it set → visible as a ghost secondary under the primary.
- **Verify:** Unset env: Playwright `/auth` → `[data-testid="auth-google"]` absent. Set env (build with the var) → present. `grep -nE "VITE_GOOGLE_OAUTH_CLIENT_ID|showGoogle|auth-google" src/react/routes/screens/Auth.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Notes:** **DANIEL ACTION:** Google sign-in is hidden until `VITE_GOOGLE_OAUTH_CLIENT_ID` is set (GitHub Secrets + Google Cloud OAuth provider). Pre-Beta this is expected-hidden, not a bug — record PASS for the gating logic, and flag the config as an open setup item. Cross-ref §12.
- **Evidence:**

### [01.031] Google sign-in wires `buildGoogleSignInUrl` and redirects
- **Check:** `handleGoogleSignIn` builds the OAuth URL via `buildGoogleSignInUrl(GOOGLE_OAUTH_CLIENT_ID)` and `window.location.assign(url)`; guards empty client ID; sets `google_oauth_init_failed` on throw.
- **Where:** `Auth.tsx:104-112`, import L24.
- **Expected:** Click (when shown) navigates to Google's OAuth endpoint; no-op if client ID empty.
- **Verify:** Code review L104-112; with env set, Playwright intercepts the `window.location.assign` target (or stub) and asserts it is a Google accounts URL. Cross-ref §12.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.032] "Continue without an account" (skip-auth) present in login mode with data-loss warning
- **Check:** The skip-auth button (`auth-skip`, `t('auth.skip.cta')`) appears in login mode with its own "sau" divider, AND a data-loss risk note (`auth-skip-risk-note`, `t('auth.skip.riskNote')`) directly beneath.
- **Where:** `Auth.tsx:375-411` (divider `auth-divider-skip`, button, risk note).
- **Expected:** Skip path visible only in login mode; risk note copy warns local-only data loss (phone reset / cache clear / reinstall). NOTE: the mockup's literal "Continue without account" anonymous backend path is intentionally NOT added (no anonymous backend exists) — the real feature is the Tier-0 local "test drive". Treat the skip-auth + risk-note as the canonical implementation of this requirement.
- **Verify:** Playwright login mode → `[data-testid="auth-skip"]` + `[data-testid="auth-skip-risk-note"]` visible; switch to signup → both absent. `grep -nE "auth-skip|auth-skip-risk-note|skip.cta|skip.riskNote" src/react/routes/screens/Auth.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** The data-loss warning is the safety-relevant copy — verify it is honest + present BEFORE the user commits T0 data. Cross-ref §15 (never-delete / data invariants).

### [01.033] Skip-auth sets `isSkipAuth` and routes to onboarding
- **Check:** `handleSkipAuth` calls `setSkipAuth(true)` then `navigate('/onboarding/1')`; `isSkipAuth` persists across reload (appStore partialize).
- **Where:** `Auth.tsx:95-98`; `appStore.ts:46,54` (`setSkipAuth`, partialize persists only `isSkipAuth`).
- **Expected:** Skip click → store flag true → onboarding starts; ProtectedRoute later honors the flag (`passesAuthGate = isAuthenticated || isSkipAuth`).
- **Verify:** Playwright: click skip → URL `/onboarding/1` → `localStorage` appStore has `isSkipAuth:true`. Cross-ref ProtectedRoute 01.052.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.034] "Creeaza cont" / "No account? Create one" toggle switches to signup
- **Check:** In login mode, `auth-to-signup` (`t('auth.toSignupCta')`) switches `mode='signup'` and clears error; in signup, `auth-to-login` (`t('auth.toLoginPrefix')` + `t('auth.toLoginAction')`) switches back, clears consent + error.
- **Where:** `Auth.tsx:352-371`.
- **Expected:** Reciprocal toggle; state cleared correctly on each switch.
- **Verify:** Playwright: click `[data-testid="auth-to-signup"]` → signup title + consent checkbox appears; click `[data-testid="auth-to-login"]` → back to login, consent reset.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** This is the actual "No account? Create one" entry (Splash CTA was removed in the Pulse reskin).

### [01.035] Signup consent gate blocks submit until checked
- **Check:** In signup mode, `consentRequiredUnmet = mode==='signup' && !consent` keeps the send button disabled until the consent checkbox is ticked.
- **Where:** `Auth.tsx:72` (gate), `Auth.tsx:257-288` (consent block + checkbox `auth-consent-checkbox`), `Auth.tsx:292` (disabled).
- **Expected:** Signup + valid email but unchecked consent → button disabled; tick → enabled.
- **Verify:** Playwright signup mode: valid email, consent unchecked → `[data-testid="auth-send"]` disabled; check `[data-testid="auth-consent-checkbox"]` → enabled.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Cross-ref §12 (GDPR consent) — explicit opt-in for new accounts.

### [01.036] Consent label links to /terms and /privacy (real public routes)
- **Check:** Consent label uses `t('auth.consent.*')` and links via `<Link to="/terms">` + `<Link to="/privacy">` (`auth-consent-terms-link`, `auth-consent-privacy-link`).
- **Where:** `Auth.tsx:268-286`.
- **Expected:** Links resolve to public terms/privacy routes (not ProtectedRoute-gated `/app/cont/*`).
- **Verify:** Playwright: in signup, click each link → lands on `/terms` / `/privacy` without bouncing to `/auth`. Confirm routes are public in `router.tsx`. Cross-ref §05/§12.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.037] Login terms/privacy footer (implicit-consent) via inline LegalModal
- **Check:** In login mode only, the footer (`auth-terms-footer`) renders `t('auth.termsFooter.*')` with two buttons (`auth-terms-link`, `auth-privacy-link`) that open the inline `LegalModal` (NOT links to gated `/app/cont/*`).
- **Where:** `Auth.tsx:435-460` (footer, login-only), modal `LegalModal` L482-584.
- **Expected:** Footer hidden in signup (explicit checkbox replaces it); in login, buttons open a readable modal pre-auth (U-09 fix — was a bounce to `/auth`).
- **Verify:** Playwright login mode → click `[data-testid="auth-terms-link"]` → `[data-testid="auth-legal-modal"]` opens with terms content; signup mode → footer absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.038] LegalModal: a11y (dialog role, focus capture/restore, Escape), i18n bullets
- **Check:** Modal has `role="dialog" aria-modal aria-labelledby`, focuses close button on open, restores focus on close, closes on Escape and backdrop click; bullets render `tArray('auth.legal.terms.bullets')` / `...privacy.bullets`.
- **Where:** `Auth.tsx:489-580`.
- **Expected:** Full focus-trap behavior + localized bullet arrays (terms 5, privacy 4 — verified present 2026-05-29).
- **Verify:** Playwright: open modal → focus on `[data-testid="auth-legal-close"]`; Escape closes + focus returns to opener; backdrop click closes. `node` lookup confirms bullet arrays both locales. Cross-ref §10.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.039] LegalModal full-text live link + GDPR mailto
- **Check:** Modal footer links `https://andura.app/terms` (`auth-legal-live-link`, `target="_blank" rel="noopener noreferrer"`) and, for privacy, `mailto:privacy@andura.app`.
- **Where:** `Auth.tsx:561-580`.
- **Expected:** External link safe (`noopener noreferrer`); GDPR contact present on privacy doc only.
- **Verify:** `grep -nE "andura.app/terms|privacy@andura.app|noopener noreferrer" src/react/routes/screens/Auth.tsx`. Render check both docs.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.040] Back-to-splash button present + labeled
- **Check:** Top-left back button (`auth-back-splash`) navigates to `/` with `aria-label={t('auth.backAriaLabel')}`.
- **Where:** `Auth.tsx:130-138`.
- **Expected:** Returns to splash; SR label localized.
- **Verify:** Playwright: click `[data-testid="auth-back-splash"]` → URL `/`. `grep -n "auth-back-splash" src/react/routes/screens/Auth.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.041] WebView warning banner shown inside FB/IG/etc. webviews
- **Check:** When `detectWebView()` is truthy, the `auth-webview-warning` banner renders with `role="status"` and localized copy naming the source + the "open in Chrome" hint + `t('auth.webview.appUrl')`.
- **Where:** `Auth.tsx:120` (`webViewSource`), `Auth.tsx:140-157`; helper `src/react/lib/webviewDetect`.
- **Expected:** Banner only in webview UAs; copy fully i18n; warns the magic-link-opens-default-browser localStorage-scope trap (§15-H3).
- **Verify:** Playwright with a FB/IG webview UA string → banner present; normal Chrome UA → absent. `grep -nE "auth-webview-warning|detectWebView|auth.webview" src/react/routes/screens/Auth.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.042] Dev mock-login present ONLY in DEV (stripped in prod)
- **Check:** `showMockLogin = import.meta.env.DEV`; the `auth-mock` button (`handleMockLogin` → `setAuthenticated(true)` + `/onboarding/1`) is absent from a production build.
- **Where:** `Auth.tsx:87-90,115,413-422`.
- **Expected:** Prod build: no `[data-testid="auth-mock"]`. Dev: present (login mode only).
- **Verify:** Build prod (`npm run build` + serve `dist`) → assert button absent. Dev → present. `grep -nE "import.meta.env.DEV|auth-mock|handleMockLogin" src/react/routes/screens/Auth.tsx`. Cross-ref §12 (no dev backdoor in prod).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.043] Error UI uses generic key + a11y alert
- **Check:** On send failure, `auth-error` renders `t('auth.errorGeneric')` with `role="alert"`, `id="auth-email-error"`, and the email input gets `aria-invalid`/`aria-describedby` wired to it.
- **Where:** `Auth.tsx:338-347` (error block), `Auth.tsx:235-236` (input aria wiring), `handleSend` L83 sets `error` to the raw reason.
- **Expected:** Error announced to SR; input flagged invalid.
- **Verify:** Playwright: force a failing send (network 400 mock) → `[data-testid="auth-error"]` appears, `role=alert`, input `aria-invalid="true"`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** **Finding to confirm:** `handleSend` stores the specific `result.error` (e.g. `network_error`), but the UI always renders one generic `auth.errorGeneric` string regardless of reason (L345). That is acceptable for Gigel (no leak of internal codes) — but verify the user still gets actionable guidance (e.g. expired-link vs network). If a returning-from-callback `?error=` reason should produce distinct copy, the current screen does not read it. Cross-ref 01.051.

### [01.044] Placeholder Firebase key throws in PROD (D040)
- **Check:** If `FIREBASE_API_KEY === 'PLACEHOLDER_WEB_API_KEY'` and `import.meta.env.PROD`, module load throws (fail-fast); in non-prod it only `console.warn`s.
- **Where:** `src/auth.js:25-39`.
- **Expected:** A prod build that forgot `VITE_FIREBASE_API_KEY` fails loudly at boot (not silent 400s on magic-link). Dev tolerates placeholder with a warning.
- **Verify:** Build prod without the env var → app throws at boot (`[auth] FIREBASE_API_KEY = PLACEHOLDER_WEB_API_KEY ...`). Dev → console warning only, app loads. `grep -nE "PLACEHOLDER_WEB_API_KEY|import.meta.env\?.PROD|throw new Error" src/auth.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** **DANIEL ACTION:** set `VITE_FIREBASE_API_KEY` in deploy env (D040 deploy.yml injection) before launch. Cross-ref §12 + §15 (secrets/invariants).

### [01.045] Auth field focus ring + Pulse parity
- **Check:** Email input focus shows the volt accent ring (`.auth-pulse-field:focus`), and the Auth screen matches mockup AuthScreen (PulseMark, gradient title, pill fields, gradient primary, mono "sau" dividers).
- **Where:** `Auth.tsx:243` (field class), `Auth.tsx:469-474` (focus style), mockup `screens-entry.jsx` AuthScreen ~55-114.
- **Expected:** Focus ring token-only (`--volt` color-mix), motion-safe; visual parity within tolerance. Cross-ref §11.
- **Verify:** Playwright: focus email → ring visible; screenshot-diff vs rendered mockup AuthScreen.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.046] No hardcoded RO/EN user-facing strings on Auth.tsx
- **Check:** Every visible string on Auth.tsx routes through `t()`/`tArray()`; zero literal RO/EN copy.
- **Where:** whole file `Auth.tsx`.
- **Expected:** Scanner clean. Historically Auth was RO-heavy (cross-ref §09).
- **Verify:** `grep -nE "[A-Za-z]{4,}" src/react/routes/screens/Auth.tsx` reviewed for literals in JSX text/aria/placeholder; plus the i18n no-hardcode scanner test for this file. (Note: comments are in RO — exclude; check only JSX text/attrs.)
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 01.C — AUTH CALLBACK (`AuthCallback.tsx`, route `/auth-callback`)

### [01.050] Google return path: parse `#id_token`, exchange, strip hash, route to app
- **Check:** If `window.location.hash` contains `id_token`, `signInWithGoogleIdToken` runs; on ok → `history.replaceState` strips the hash, `setAuthenticated(true)`, `runPostAuthSync()`, navigate `/app/antrenor` (replace).
- **Where:** `AuthCallback.tsx:17-54`.
- **Expected:** Token never lingers in URL post-auth (referrer-leak guard); user lands in app.
- **Verify:** Code review L35-54; Playwright with a stubbed `#id_token=...` + mocked signInWithIdp ok → URL ends `/app/antrenor`, hash cleared. Cross-ref §12.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.051] Magic-link path: parse oobCode+email (with pendingEmail fallback + TTL), verify, route
- **Check:** `parseMagicLinkUrl(search)` → `oobCode`+`email`; falls back to `getPendingEmail()` (1h TTL, §4-H2); missing params → `navigate('/auth?error=missing_params')`; `verifyMagicLink` ok → strip query, authenticate, sync, `/app/antrenor`; fail → clear pendingEmail keys, `navigate('/auth?error=<reason>')`.
- **Where:** `AuthCallback.tsx:56-90`.
- **Expected:** Correct branch for each case; failed verify clears stale pending email (anti shared-device leak); query params stripped before the post-auth sync fetch.
- **Verify:** Playwright matrix: (a) valid oobCode+email mock-ok → app; (b) missing params → `/auth?error=missing_params`; (c) verify-fail mock → `/auth?error=verify_failed` + pendingEmail keys removed. `grep -nE "parseMagicLinkUrl|getPendingEmail|verifyMagicLink|missing_params|AUTH_STORAGE_KEYS" src/react/routes/screens/AuthCallback.tsx`. Cross-ref §08/§12.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** The `?error=<reason>` lands on `/auth`, but Auth.tsx renders only a generic error and does not appear to read `?error` from the URL to surface a specific message — verify whether the returning error is shown at all (cross-ref 01.043). If silent, PARTIAL.

### [01.052] AuthCallback strings are hardcoded Romanian — i18n FAIL
- **Check:** The loading/error copy is rendered via `t()`, not literals.
- **Where:** `AuthCallback.tsx:114-119`.
- **Expected:** `{t('authCallback.*')}` for both states, EN+RO.
- **Verify:** `grep -nE "Eroare la verificare|Te redirectionam catre login|Te conectam|Asteapta o secunda" src/react/routes/screens/AuthCallback.tsx` → returns 4 hardcoded RO literals (L116-119). These are NOT routed through `t()`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL ☐ BLOCKED  *(as of 2026-05-29 — static read)*
- **Evidence:** `AuthCallback.tsx:116` "Eroare la verificare" / "Te conectam...", `:118-119` "Te redirectionam catre login." / "Asteapta o secunda." are literal strings inline, no `t()`. The rest of the entry flow is fully i18n; this screen leaked.
- **Notes:** Fix: extract to `authCallback.loadingTitle/loadingHint/errorTitle/errorHint` in en.json + ro.json (RO no-diacritics per D-LEGACY-064) and wire `t()`. Root cause is the §09 class (manual coverage table missed this lazy-loaded screen). Cross-ref §09.

### [01.053] AuthCallback spinner a11y (status/aria-live, spinner stops on error)
- **Check:** Status region is `role="status" aria-live="polite"`; the spinner ring `animate-spin` is removed when `error` is set (static circle), and is `aria-hidden`.
- **Where:** `AuthCallback.tsx:99-120`.
- **Expected:** Loading→error transition announced; no spinning circle paired with an error message (U-16).
- **Verify:** Playwright: force error path → ring has no `animate-spin`; `role=status` text updated. Cross-ref §10.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.054] AuthCallback wrapped so it does not render inside Layout / white-screen
- **Check:** `/auth-callback` renders via the top-level wrapper (not inside the tab Layout) and shows the spinner section, not a blank screen.
- **Where:** `router.tsx` top-level route for AuthCallback (lazy) + `TopLevelRoute` Suspense wrapper (~L119-139).
- **Expected:** Direct hit of `/auth-callback` shows `[data-testid="auth-callback"]`, no Layout chrome, no white flash.
- **Verify:** Playwright navigate `/auth-callback` (no params) → spinner section visible → redirect to `/auth?error=missing_params`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 01.D — ONBOARDING (`Onboarding.tsx` + `onboardingStore.ts`, route `/onboarding/:step`)

### [01.060] Step param clamps to 1..8; section testid `onboarding-step-N`
- **Check:** `stepNum = clamp(parseInt(step,10), 1, 8)`; section `data-testid="onboarding-step-${stepNum}"`.
- **Where:** `Onboarding.tsx:53-60,131-134`.
- **Expected:** `/onboarding/0` → step 1; `/onboarding/99` → step 8; `/onboarding/abc` → step 1 (NaN→1).
- **Verify:** Playwright navigate each → assert active testid. `grep -nE "Math.max\(1, Math.min\(TOTAL_STEPS|onboarding-step-" src/react/routes/screens/Onboarding.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Clamp to last step lets a direct `/onboarding/8` hit confirm without prior steps — the finalize gate (01.078) is the real guard; verify that direct deep-link still cannot complete with null fields.

### [01.061] Progress indicator: 8 dots + "N din 8" + "Pasul N"
- **Check:** 8 `progress-dot-N` dots with `data-active` (true ≤ current), a counter `t('onboarding.progress', {current,total})` ("N din 8"), and the Kicker `t('onboarding.stepKicker', {n})` ("PASUL N").
- **Where:** `Onboarding.tsx:138-166`.
- **Expected:** Current dot scaled/ink, done = brick, pending = line; counter + kicker localized; testids preserved.
- **Verify:** Playwright per step: count `[data-testid^="progress-dot-"]`=8, `[data-active="true"]` count = stepNum, counter text present. `node` lookup `onboarding.progress`/`onboarding.stepKicker` both locales (present 2026-05-29).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.062] Back/Continue buttons: presence, labels, gating
- **Check:** Back (`onb-back`, `t('onboarding.backCta')`) shown only when stepNum>1; primary (`onb-next`) labeled `t('onboarding.continueCta')` on steps 1-7 and `t('onboarding.finishCta')` ("Gata"/finish) on step 8.
- **Where:** `Onboarding.tsx:185-204`, `next()`/`back()` L97-128.
- **Expected:** Step 1 has no back; step 8 button reads finish.
- **Verify:** Playwright: step 1 → no `[data-testid="onb-back"]`; step 8 → `[data-testid="onb-next"]` label = finishCta.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.063] Back preserves entered data (store-backed)
- **Check:** Navigating back then forward retains previously entered values (store is the source, not local component state).
- **Where:** store `useOnboardingStore` data; `Onboarding.tsx:61-63,173-180`.
- **Expected:** Enter age 30 → step2 → back → age still 30.
- **Verify:** Playwright: fill step1, advance, back → age input value = 30. Cross-ref §08 (persistence).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.064] Step 1 (age): big-number input, type=number, min=18, i18n
- **Check:** Age uses `BigNumberField` with `type="number"`, `inputMode="numeric"`, `min={18} max={99}`, testid `onb-age-input`, label/helper/unit/placeholder via `t('onboarding.steps.1.*')`.
- **Where:** `Onboarding.tsx:309-338` (Step1) + `BigNumberField` L242-307.
- **Expected:** Min attribute = 18 (adults-only). **THIS IS THE AGE-GATE CHECK.** The store bound is `age 18-99` (`onboardingStore.ts:85`); the input `min` MUST agree.
- **Verify:** `grep -n "min={18}" src/react/routes/screens/Onboarding.tsx` → confirmed `Onboarding.tsx:332` `min={18}`. The §15-flagged "stale min=16" refers to the MOCKUP comment (`onboardingStore.ts:64` notes mockup L563 `min="16"`), NOT the React input — the React input already uses 18.
- **Verdict:** ☐ PASS ☑ — *(provisional PASS on static read; confirm at runtime)* ☐ FAIL ☐ BLOCKED
- **Evidence:** `Onboarding.tsx:332` `min={18}`; `onboardingStore.ts:85` `age: { min: 18, max: 99 }`. The two agree. The stale `min="16"` lives only in the mockup HTML referenced by the comment, not in shipped React.
- **Notes:** Confirm the §15 cross-ref points at the mockup, not the live input. If §15 claims the React input is min=16, that claim is stale — record the agreement here.

### [01.065] Age-gate enforced at the validation gate (18+ adults-only)
- **Check:** Entering age 16 (or <18) is blocked on Continue: client error `t('onboarding.steps.1.error')` shows, and `validateCurrentStep` / `validateOnboardingField('age', 16)` returns `{ok:false}` so navigation does NOT proceed; `finalize()` also refuses if age<18.
- **Where:** `Onboarding.tsx:78-81,313-314` (Step1 error <18), `onboardingStore.ts:137-144` (range gate), `onboardingStore.ts:262-265` (finalize range check).
- **Expected:** age 17 → cannot advance past step 1; toast/inline error shown; profile never finalizes with a minor.
- **Verify:** Playwright: step1 type `17` → click `onb-next` → still step 1, error shown. Vitest: `validateOnboardingField('age', 17).ok === false`; `validateOnboardingField('age', 18).ok === true`. `npm run test:run`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** **SAFETY-relevant (adults-only per CEO 2026-05-27).** Cross-ref §15 + §12 (GDPR minors).

### [01.066] Age min-attr vs store-bound agreement (regression pin)
- **Check:** The input `min`/`max` exactly equal `ONBOARDING_BOUNDS.age` (18/99) — no drift.
- **Where:** `Onboarding.tsx:332-333`, `onboardingStore.ts:85`.
- **Expected:** A test pins `min === ONBOARDING_BOUNDS.age.min`. If no such test exists, the agreement is unguarded → PARTIAL (works now, can regress).
- **Verify:** Search tests for a bound-agreement assertion: `grep -rnE "ONBOARDING_BOUNDS|min={18}" tests/ src/`. If none, note the gap.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Proposed: a unit test asserting each numeric input's min/max equals the store bound, so the §15 stale-min class can never recur.

### [01.067] Step 2 (sex): 2-tile picker, aria-pressed, i18n, validation
- **Check:** Two tiles (`onb-sex-m`, `onb-sex-f`) with `aria-pressed`, labels `t('onboarding.options.sex.m'|'f')`; Continue blocked while `sex===null` (`t('onboarding.toast.completeOption')`).
- **Where:** `Onboarding.tsx:340-375` (Step2), gate L82.
- **Expected:** Selecting toggles aria-pressed + accent fill; cannot advance with no selection.
- **Verify:** Playwright: step2 no selection → `onb-next` → toast + still step2; select m → advance.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.068] Step 3 (goal): 5 options, RO vocab, Auto default badge, validation
- **Check:** Five goal rows (`onb-goal-auto|forta|masa|slabire|mentenanta`) with subtitles, Auto carries `onb-goal-auto-badge` (`t('onboarding.options.goal.autoBadge')`) + recommended border; Continue blocked while `goal===null`.
- **Where:** `Onboarding.tsx:377-465` (Step3, `GOAL_OPTIONS`), gate L83. Store type `Goal = 'auto'|'forta'|'masa'|'slabire'|'mentenanta'` (`onboardingStore.ts:19`).
- **Expected:** The 5 store values exactly (longevitate dropped per D080); the mockup's English IDs map to RO vocab; Auto pre-recommended.
- **Verify:** Playwright: assert 5 goal testids; select each maps to store `goal`. `node` lookup goal labels + subtitles both locales. Cross-ref §07 (goal→engine phase) + §09.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.069] Step 4 (frequency): 2/3/4/5 rows, aria-label, validation
- **Check:** Four rows (`onb-freq-2|3|4|5`) with numeric bubble + subtitle + `aria-label={t('onboarding.steps.4.ariaLabelFmt',{n})}`; Continue blocked while `frequency===null`.
- **Where:** `Onboarding.tsx:467-517` (Step4, `FREQ_OPTIONS`), gate L84. Store `Frequency = '2'|'3'|'4'|'5'` (`onboardingStore.ts:22`).
- **Expected:** Exactly 2-5 (the mockup's 2-6 stepper is intentionally narrowed to the store union); each maps to store value.
- **Verify:** Playwright: assert 4 freq testids only (no 6); select 3 → store frequency '3'. Cross-ref §07.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.070] Step 5 (experience): 3 rows, aria-pressed, validation
- **Check:** Three rows (`onb-exp-incepator|intermediar|avansat`) with subtitles; Continue blocked while `experience===null`.
- **Where:** `Onboarding.tsx:519-555` (Step5, `EXP_OPTIONS`), gate L85. Store `Experience = 'incepator'|'intermediar'|'avansat'` (`onboardingStore.ts:23`).
- **Expected:** Three options, store mapping correct, localized.
- **Verify:** Playwright: assert 3 exp testids; select maps to store. `node` lookup labels+subtitles both locales.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.071] Step 6 (weight): decimal big-number, min=30 max=250 step=0.1, validation
- **Check:** Weight `BigNumberField`, `inputMode="decimal"`, `min={30} max={250} step="0.1"`, testid `onb-weight-input`; inline error `t('onboarding.steps.6.error')` when <30 or >250; Continue gate uses `validateOnboardingField('weight', ...)`.
- **Where:** `Onboarding.tsx:557-586` (Step6), gate L86-89; store bound `weight 30-250` (`onboardingStore.ts:86`).
- **Expected:** Decimal entry allowed; out-of-range blocks advance; min/max attrs equal store bound.
- **Verify:** Playwright: type `999` → error + cannot advance; type `82.5` → advances. Vitest: `validateOnboardingField('weight', 999).ok===false`, `(..., 82.5).ok===true`. `grep -n "min={30}\|max={250}\|step=\"0.1\"" src/react/routes/screens/Onboarding.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Cross-ref §15 (mockup shows max=300; store authoritatively narrows to 250 — confirm the input agrees with the store, not the mockup).

### [01.072] Step 7 (height): big-number, min=120 max=230 step=1, validation
- **Check:** Height `BigNumberField`, `inputMode="numeric"`, `min={120} max={230} step="1"`, testid `onb-height-input`; inline error `t('onboarding.steps.7.error')` when <120 or >230; gate uses `validateOnboardingField('height', ...)`.
- **Where:** `Onboarding.tsx:588-622` (Step7Height), gate L90-93; store bound `height 120-230` (`onboardingStore.ts:87`).
- **Expected:** Out-of-range blocks; attrs equal store bound; cross-screen consistency with SettingsProfile composition input (120-230).
- **Verify:** Playwright: type `300` → error + blocked; `178` → advances. Vitest range checks. `grep -n "min={120}\|max={230}" src/react/routes/screens/Onboarding.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Cross-ref §07 (Mifflin-St Jeor BMR + US Navy BF% consume height) + §03.

### [01.073] BigNumberField NaN/paste guard
- **Check:** Pasting non-numeric ("abc") commits `null`, not NaN; empty commits `null`; spinners hidden.
- **Where:** `Onboarding.tsx:269-274` (`Number.isFinite` guard), L304 (webkit spinner CSS); store `isSafeOnboardingValue` rejects NaN/Inf/≤0 (`onboardingStore.ts:110-129`).
- **Expected:** NaN never reaches the store (engine NaN-propagation guard).
- **Verify:** Playwright: paste "abc" into age/weight/height → input clears, store field null. Vitest: `isSafeOnboardingValue('weight', NaN)===false`. Cross-ref §07/§08.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.074] BigNumberField a11y: aria-required, aria-invalid, aria-describedby, role=alert error
- **Check:** Each numeric input is `required aria-required="true"`, sets `aria-invalid`/`aria-describedby` when error, and the error `<p>` has `role="alert"` + matching id (`onb-age-error` etc.).
- **Where:** `Onboarding.tsx:279-303`.
- **Expected:** SR hears the range reason on invalid (WCAG 3.3.1/3.3.3).
- **Verify:** Playwright with out-of-range value → error p role=alert, input aria-invalid=true, describedby matches. Cross-ref §10.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.075] Empty-field Continue is blocked with a Gigel-friendly toast (U-02)
- **Check:** On each step, clicking Continue with the required field empty shows a localized warning toast and does NOT advance.
- **Where:** `Onboarding.tsx:77-101` (`validateCurrentStep` + `next` toast), toast keys `onboarding.toast.complete*`.
- **Expected:** No click-through on empty steps (prevents all-null finalize).
- **Verify:** Playwright per step 1-7: Continue with empty → warning toast + same step. `node` lookup of each `onboarding.toast.complete*` key both locales (sampled present 2026-05-29).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.076] Step 8 (confirm): summary rows reflect entered data + i18n labels/values
- **Check:** Summary card (`onb-summary`) lists 7 rows (age/sex/goal/frequency/experience/weight/height) with icons, labels `t('onboarding.confirm.fields.*')`, values localized (sex/goal/freq/exp/weight/height via `t(...)`, empty → `t('onboarding.confirm.empty')`).
- **Where:** `Onboarding.tsx:624-680` (Step8Summary).
- **Expected:** Values match what was entered; locale switch re-renders (t() at render time).
- **Verify:** Playwright: complete a known profile → step8 rows show those exact values; toggle locale → labels/values translate live.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** targetWeight/targetDate are NOT shown here (optional, set later in Progres) — confirm their absence is intentional, not a missing row.

### [01.077] "Gata"/finish completes onboarding and routes to Coach (§D092 fix)
- **Check:** On step 8, Continue=finish calls `finalize()`; if `completed` becomes true → seed weight timeline (if empty) + `navigate('/app/antrenor')`; else warning toast `t('onboarding.toast.completeAll')`.
- **Where:** `Onboarding.tsx:103-124`; store `finalize` L240-268.
- **Expected:** A complete Big-7 profile finishes and lands on Coach. **§D092 regression:** the optional targetWeight/targetDate must NOT block finalize — `REQUIRED_FIELDS` enumerates only the Big-7 (`onboardingStore.ts:258-260`), skipping the optionals.
- **Verify:** Playwright: complete all 7 → click finish → URL `/app/antrenor`. Vitest: `finalize()` with Big-7 set + targetWeight/targetDate null → `completed===true`. `npm run test:run`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** This pins the "Gata button did nothing" bug Daniel hit 2026-05-28 (optional fields in the null-loop). Cross-ref §08.

### [01.078] finalize() refuses incomplete/out-of-range Big-7 (defense-in-depth)
- **Check:** `finalize` returns without setting `completed` if ANY Big-7 field is null OR fails `validateOnboardingField`.
- **Where:** `onboardingStore.ts:240-268`.
- **Expected:** Direct deep-link `/onboarding/8` with empty store → finish shows "completeAll" toast, does NOT navigate to app, `completed` stays false.
- **Verify:** Vitest: `finalize()` on EMPTY data → `completed===false`. Playwright: hit `/onboarding/8` fresh → finish → toast + still onboarding (also bounced by ProtectedRoute). Cross-ref §07 (engine baseline integrity) + §15.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.079] Weight-timeline seed on finalize (profile↔timeline consistency)
- **Check:** On successful finalize, `progresStore.seedFromProfileIfEmpty(weight, todayIso())` runs (idempotent — does not overwrite real logs).
- **Where:** `Onboarding.tsx:108-117`.
- **Expected:** "Greutate (7 zile)" starts from the onboarding weight, not disconnected/empty.
- **Verify:** Playwright: finish onboarding with weight 80 → Progress weight timeline seeded at 80 for today. Vitest on `seedFromProfileIfEmpty` idempotency. Cross-ref §03 (the body-comp data-wiring class) + §08.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.080] Onboarding store persistence + migration (v5, longevitate→mentenanta)
- **Check:** Store persists to `localStorage['wv2-onboarding-store']`, partialize = data+completed+completedAt (not actions), `version: 5`, and `migrateLegacyGoal` maps `definire→slabire`, `sanatate→mentenanta`, `longevitate→mentenanta`.
- **Where:** `onboardingStore.ts:271-321`; `migrateLegacyGoal` L213-224.
- **Expected:** A persisted pre-v5 user with `goal:'longevitate'` loads as `mentenanta`; missing fields default via `...EMPTY` (height/targetWeight/targetDate null), no corruption.
- **Verify:** Vitest: seed a v<5 persisted blob with `goal:'longevitate'` → after migrate, `goal==='mentenanta'`; with `goal:'definire'` → `'slabire'`. `npm run test:run`. Cross-ref §08.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.081] Step-body fade re-mounts per step (motion) and is reduced-motion safe
- **Check:** Active step wrapped under `key={onb-step-${stepNum}}` so `animate-fade-in-up` replays per navigation; staggered delays do not produce a perceptible wait; reduced-motion collapses them.
- **Where:** `Onboarding.tsx:168-181` + per-option `delay-*` classes; global reduced-motion cap.
- **Expected:** Fade plays once per step; under `prefers-reduced-motion`, no animation. Cross-ref §10/§14.
- **Verify:** Playwright reducedMotion=reduce → no transform animation; normal → fade plays. Visual sanity that max stagger (~600ms summary) is not a wait.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.082] No hardcoded RO/EN strings across Onboarding.tsx
- **Check:** Every visible string (titles, descs, units, helpers, errors, labels, subtitles, toasts, CTAs, summary) routes through `t()`/`tArray()`.
- **Where:** whole `Onboarding.tsx` (steps 1-8 + summary).
- **Expected:** Scanner clean; historically onboarding was RO-heavy (cross-ref §09).
- **Verify:** i18n no-hardcode scanner test for this file; manual grep of JSX text/aria/placeholder for literals (RO comments excluded).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 01.E — ROUTE GUARDS / END-TO-END ENTRY

### [01.090] §A015: authenticated-but-not-onboarded redirects to /onboarding/1
- **Check:** ProtectedRoute redirects to `/onboarding/1` when `passesAuthGate` is true but `onboardingCompleted` is false.
- **Where:** `ProtectedRoute.tsx:29,68-69`.
- **Expected:** A logged-in user who never onboarded is forced through onboarding before any `/app/*` screen (prevents engine T0 baseline pollution + skip bypass).
- **Verify:** Playwright: authenticate (mock or token), reset onboarding store, navigate `/app/antrenor` → redirected to `/onboarding/1`. `grep -nE "A015|onboardingCompleted|/onboarding/1" src/react/routes/ProtectedRoute.tsx`. Cross-ref §07/§12/§15.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.091] Unauthenticated + no-skip → /auth gate
- **Check:** `passesAuthGate = isAuthenticated || isSkipAuth`; when both false, any `/app/*` redirects to `/auth`.
- **Where:** `ProtectedRoute.tsx:64-67`.
- **Expected:** Cold visitor hitting `/app/antrenor` → `/auth`.
- **Verify:** Playwright clean storage → navigate `/app/antrenor` → URL `/auth`. Cross-ref §12.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.092] Skip-auth still requires onboarding before app
- **Check:** With `isSkipAuth=true` but onboarding not complete, ProtectedRoute still redirects to `/onboarding/1`.
- **Where:** `ProtectedRoute.tsx:64-70` (gate passes, onboarding check still applies).
- **Expected:** Test-drive user cannot reach `/app/*` engine screens without onboarding (engine T0 still needs Big-7).
- **Verify:** Playwright: skip-auth from Auth → completes the skip → must finish onboarding before Coach is reachable.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.093] Storage→store auth bridge: cross-tab login + logout
- **Check:** ProtectedRoute syncs `readAuthFromStorage()`→`setAuthenticated(true)` on mount/storage/visibility, and `andura:signedout` → `setAuthenticated(false)` (same-tab logout that storage event misses).
- **Where:** `ProtectedRoute.tsx:41-60`.
- **Expected:** Magic-link landing in another tab propagates auth; same-tab signOut flips state.
- **Verify:** Playwright multi-context: log in tab B → tab A (on a protected route) gains access on focus; dispatch `andura:signedout` → protected route bounces. Cross-ref §08/§12.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Note the asymmetry (01.009): this bridge runs only inside ProtectedRoute, not on Splash/Auth — relevant to the returning-user splash target.

### [01.094] FULL happy-path: new user splash→auth(skip)→onboarding→Coach
- **Check:** End-to-end: `/` → auto-advance `/auth` → skip-auth → `/onboarding/1` → complete 8 steps with valid Big-7 → finish → `/app/antrenor` rendered with seeded baseline.
- **Where:** all entry files above.
- **Expected:** A Gigel-grade new user reaches the Coach tab with a valid profile, no dead-ends, no white screens, correct language.
- **Verify:** Single Playwright flow against `npm run dev` (clean storage): assert each URL transition + final `[data-testid]` for Coach. This is the section's keystone integration test.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [01.095] FULL happy-path: returning magic-link user landing→callback→Coach
- **Check:** End-to-end: open magic link URL (`/auth-callback?...oobCode&email`) → verify ok → authenticated → `/app/antrenor`, onboarding already complete from prior session.
- **Where:** `AuthCallback.tsx` + ProtectedRoute + persisted onboarding store.
- **Expected:** Returning user lands directly in the app; query stripped; no re-onboarding.
- **Verify:** Playwright: seed completed onboarding store + mock `verifyMagicLink` ok → hit callback URL → `/app/antrenor`, URL has no oobCode. Cross-ref §08/§12.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## SECTION 01 SCORE

```
SECTION                          PASS  PART  FAIL  BLOCK   %     GATE   STATUS
01 Entry flow                    --    --    --    --      --%   95%    ----
```

**Pre-filled findings carried in as defaults (confirm at audit time):**
- `01.052` AuthCallback strings hardcoded RO (no `t()`) — **FAIL** (i18n leak, cross-ref §09).
- `01.064` Age input `min=18` agrees with store bound; the "stale min=16" is in the MOCKUP only — provisional **PASS** (refutes the §15 claim if it targets the React input).
- Open items to watch: `01.009` returning-user splash target (store-not-hydrated risk), `01.043`/`01.051` generic error copy ignoring `?error=` reason, `01.066` no test pinning input-min↔store-bound agreement.

> Section gate 95% — the lone confirmed FAIL (01.052) is i18n, not safety; it costs ~1 step and is fixable with a 4-key extraction. The age-gate (01.065), empty-step block (01.075), and finalize gate (01.078) are the entry-flow safety spine and must all PASS for the door to be "correct".
