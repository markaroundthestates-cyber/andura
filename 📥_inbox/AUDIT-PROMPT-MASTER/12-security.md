# SECTION 12 — Security / auth / GDPR / privacy / secrets / route-guards

> **Weight 8% · Gate 100% · CRITICAL.** Zero open FAIL allowed in this section
> for Beta-ready. A wrong RTDB rule or a phantom-auth bypass is a silent total
> data leak the client code cannot detect — every step here is verified with a
> concrete grep / code path / Playwright auth flow, never "looks fine".
>
> **Scope (read line-by-line, not sampled):** `src/auth.js` (Magic Link,
> Google OAuth, token refresh, signOut, freshness gate, soft-delete),
> `src/firebase.js` (RTDB REST per-uid sync, PATCH-not-PUT, DELETE),
> `src/react/routes/ProtectedRoute.tsx` + `router.tsx` (route guards),
> `src/react/routes/screens/{Auth,AuthCallback}.tsx`, the GDPR screens
> (`SettingsExport.tsx` Art.20 / `DeleteAccountConfirm.tsx` Art.17),
> `src/util/sentry.js` (PII scrub + consent gate), `src/main.tsx` (telemetry
> consent gate), `src/storage/db.js` (per-UID IndexedDB), `src/react/lib/paletteSync.ts`
> (the `--brick` accent enum), `.github/workflows/deploy.yml` (secret injection),
> `src/react/stores/onboardingStore.ts` (age gate).
>
> **Known prior findings folded in** (audit-nuclear-2026-05-26 AUDIT-4 +
> audit-fresh-2026-05-25 SECURITY-ANTIRE): RTDB rules not in repo (H-2), legacy
> `users/daniel` node (H-1), k-anonymity Terms-vs-implementation gap, `?auth=`
> JWT-in-URL (L-4, inherent to ADR 002). These get explicit steps below so the
> auditor confirms them rather than re-discovering.

---

## 12.A — Magic Link auth flow (`src/auth.js`)

### [12.001] Magic Link send uses the correct Identity Toolkit endpoint
- **Check:** `sendMagicLink` POSTs to `accounts:sendOobCode` with `requestType:'EMAIL_SIGNIN'` + `canHandleCodeInApp:true` + a `continueUrl`.
- **Where:** `src/auth.js:104-118` (`sendMagicLink`, `AUTH_BASE = identitytoolkit.googleapis.com/v1`).
- **Expected:** body `{ requestType:'EMAIL_SIGNIN', email, continueUrl: <origin>/auth-callback, canHandleCodeInApp:true }`; URL `${AUTH_BASE}/accounts:sendOobCode?key=${FIREBASE_API_KEY}`.
- **Verify:** `grep -nE "sendOobCode|EMAIL_SIGNIN|canHandleCodeInApp" src/auth.js`; unit test `src/__tests__/auth.test.js` exercises sendMagicLink success/4xx/5xx/429.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill: grep output + test pass>
- **Notes:** —

### [12.002] Invalid email is rejected before any network call
- **Check:** `sendMagicLink` returns `{ok:false,error:'invalid_email'}` for a malformed address without firing fetch.
- **Where:** `src/auth.js:105` (`if (!_isValidEmail(email)) return ...`), `_isValidEmail` `src/auth.js:564-567`.
- **Expected:** the regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` rejects `"foo"`, `"a@b"`, `""`; no fetch issued.
- **Verify:** unit test feeds invalid strings → expect no `fetch` spy call + `error:'invalid_email'`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** Auth.tsx mirrors the same regex (`Auth.tsx:37`) to disable the submit button.

### [12.003] Send is throttled (30s) against spam / quota exhaustion
- **Check:** A second `sendMagicLink` within `MAGIC_LINK_THROTTLE_MS` returns `{ok:false,error:'throttle_cooldown',cooldownMs>0}` and does NOT POST.
- **Where:** `src/auth.js:61` (`MAGIC_LINK_THROTTLE_MS = 30_000`), `:106-108` + `getMagicLinkCooldownMs` `:394-400`.
- **Expected:** cooldown computed from `lastMagicLinkSent`; timestamp set POST-success only (§A018 — a failed send stays retryable).
- **Verify:** unit test: succeed once → immediate second call returns throttle_cooldown; advance fake timer 30s → allowed again. Confirm `lastMagicLinkSent` is written only on `r.ok` (`src/auth.js:143`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** —

### [12.004] Network failure retries 3x with bounded backoff; 4xx does not retry
- **Check:** Transient (network throw / 5xx / 429) retries up to 3 attempts (250/500ms); deterministic 4xx (not 429) returns immediately without retry.
- **Where:** `src/auth.js:127-165` (`MAX_ATTEMPTS=3`, `BACKOFF_MS=[250,500]`, `if (r.status < 500) return` for non-429).
- **Expected:** exactly 1 POST on a 400; up to 3 on repeated 5xx; 429 honors `Retry-After` clamped to `MAX_RETRY_AFTER_MS=60_000`.
- **Verify:** unit test with a fetch mock returning 500,500,200 → 3 calls, ok:true; 400 → 1 call, ok:false; 429 with `Retry-After:120` → delay clamped to 60s (`parseRetryAfter` `:510-532`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** Anti-DoS clamp matters — a malicious server could otherwise request hours via Retry-After.

### [12.005] Magic Link verify exchanges oobCode for tokens
- **Check:** `verifyMagicLink(email,oobCode)` POSTs `accounts:signInWithEmailLink`, persists tokens on success, clears pendingEmail.
- **Where:** `src/auth.js:177-197`.
- **Expected:** success → `_persistAuth(data)` + remove `pendingEmail`/`pendingEmailExpiry`; missing input → `{ok:false,error:'missing_input'}`; non-ok or no idToken → `{ok:false,error:<code>}`.
- **Verify:** unit test happy path (returns `{idToken,refreshToken,localId,expiresIn}`) → tokens in localStorage; failure path leaves no idToken.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** —

### [12.006] All auth fetches have an abort timeout (no hung sign-in)
- **Check:** Every Identity Toolkit / securetoken call goes through `_authFetch`, which attaches `AbortSignal.timeout(AUTH_FETCH_TIMEOUT_MS)`.
- **Where:** `src/auth.js:74` (`AUTH_FETCH_TIMEOUT_MS=15_000`), `_authFetch` `:85-88`; callers `:135,181,259,348`.
- **Expected:** no raw `fetch(` in auth.js bypasses `_authFetch`.
- **Verify:** `grep -nE "fetch\(" src/auth.js` → only inside `_authFetch`; `grep -n "_authFetch" src/auth.js` covers send/verify/idp/refresh.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** A hung 3G socket would otherwise wedge sign-in forever.

---

## 12.B — Token storage, refresh, freshness

### [12.007] AUTH_STORAGE_KEYS is the single source of truth for stored auth
- **Check:** Token keys are centralized in a frozen `AUTH_STORAGE_KEYS` object and used everywhere (persist + signOut + tests).
- **Where:** `src/auth.js:42-51` (`Object.freeze`, keys: idToken/uid/refreshToken/expiry/pendingEmail/pendingEmailExpiry/lastMagicLinkSent/lastAuthAt).
- **Expected:** no stray string literal `'firebase-id-token'` etc. outside this object inside auth.js write/clear paths.
- **Verify:** `grep -nE "'firebase-(id-token|uid|refresh-token)" src/auth.js` → only the `AUTH_STORAGE_KEYS` definition; persist/clear reference the object.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** —

### [12.008] ID token auto-refreshes proactively within skew window
- **Check:** `getIdToken(skewMs=60_000)` returns the cached token if it is comfortably fresh, else refreshes via `refreshIdToken`.
- **Where:** `src/auth.js:303-311`.
- **Expected:** token with >60s remaining returned without network; near-stale token triggers refresh; refresh fail → null.
- **Verify:** unit test with `expiry = now+30s` → refresh called; `expiry = now+1h` → no refresh.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** —

### [12.009] Concurrent refresh requests are de-duplicated (single in-flight POST)
- **Check:** Multiple simultaneous `refreshIdToken()` calls share one in-flight promise (`_refreshInFlight`), cleared on settle.
- **Where:** `src/auth.js:319-336` (`_refreshInFlight` memo) + `_doRefresh` `:345-368`.
- **Expected:** N parallel callers → exactly 1 `securetoken/v1/token` POST.
- **Verify:** unit test fires `Promise.all([refreshIdToken(), refreshIdToken(), refreshIdToken()])` with a fetch spy → spy called once.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** §S-09 — without this, refresh-token rotation can invalidate older tokens and racing `_persistAuth` writes corrupt state on app resume.

### [12.010] restoreSession does not force-sign-out an offline returning user
- **Check:** Boot-time `restoreSession` keeps the session on transient failures (offline/5xx/timeout) and only `signOut()`s on a definitive auth rejection.
- **Where:** `src/auth.js:461-499` + `_isDefinitiveAuthFailure` `:488-499`.
- **Expected:** no refresh token → false, clears nothing; fresh idToken → true, no network; transient refresh fail → false, tokens intact; `TOKEN_EXPIRED`/`USER_DISABLED`/`USER_NOT_FOUND`/`INVALID_REFRESH_TOKEN` → signOut().
- **Verify:** unit test each branch with a refresh mock; assert localStorage tokens survive a network throw but are cleared on `TOKEN_EXPIRED`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** —

### [12.011] Destructive actions are gated by a 5-minute auth-freshness window
- **Check:** `isAuthFresh()` returns true only if `lastAuthAt` is within `AUTH_FRESHNESS_WINDOW_MS`; account-delete enforces it.
- **Where:** `src/auth.js:66` (`AUTH_FRESHNESS_WINDOW_MS=5*60*1000`), `isAuthFresh` `:557-561`, set in `_persistAuth` `:546`; enforced `DeleteAccountConfirm.tsx:81-86`.
- **Expected:** stale/missing lastAuthAt → re-auth required → routes to `/auth?reason=reauth_required_for_delete`; fresh → proceeds.
- **Verify:** Playwright: log in, wait >5min (or fake-clock unit test), open delete-account, confirm → redirected to /auth with the reauth reason; fresh login → delete proceeds.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** §A016 — proof-of-presence for irreversible erasure.

### [12.012] signOut clears ALL auth state (the §A007 logout invariant)
- **Check:** `signOut()` removes idToken, uid, refreshToken, expiry, pendingEmail, pendingEmailExpiry, lastMagicLinkSent, lastAuthAt and dispatches `andura:signedout`.
- **Where:** `src/auth.js:374-386`.
- **Expected:** after signOut, `getAuthState()===null` AND no residual `firebase-*` keys remain; window event fires.
- **Verify:** unit test seeds all 8 keys + spies dispatchEvent → after signOut, all 8 removed + event fired. `grep -c "_removeItem" src/auth.js` covers every AUTH_STORAGE_KEYS entry inside signOut.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** §A007 was a historical CRIT (logout did not authSignOut → phantom session); confirm it stays closed.

### [12.013] React logout/delete paths call authSignOut, not just store flip
- **Check:** Logout and delete-account flows invoke `authSignOut()` (src/auth.js) AND `setAuthenticated(false)` — the store flip alone would leave tokens on disk.
- **Where:** `DeleteAccountConfirm.tsx:15,114-115` (`authSignOut` + `setAuthenticated(false)`); LogoutConfirm screen (`src/react/routes/screens/cont/LogoutConfirm.tsx`).
- **Expected:** both screens import and call the real `signOut` from `auth.js`.
- **Verify:** `grep -n "authSignOut\|signOut" src/react/routes/screens/cont/{LogoutConfirm,DeleteAccountConfirm}.tsx`; component test asserts tokens gone post-logout.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** This is the §A007 fix at the call sites — the subagent fresh-eyes catch. Verify NO logout path skips authSignOut.

### [12.014] pendingEmail honors a 1h TTL (shared-device anti-enumeration)
- **Check:** `getPendingEmail()` returns the cached email only within `PENDING_EMAIL_TTL_MS`; expired/legacy-no-expiry entries are cleared + return null.
- **Where:** `src/auth.js:56` (`PENDING_EMAIL_TTL_MS=1h`), `getPendingEmail` `:409-419`; set with expiry in send `:142`.
- **Expected:** after 1h a later device user cannot read the prior recipient's email from localStorage via the pending cache.
- **Verify:** unit test: set pendingEmail with expiry now-1ms → getPendingEmail returns null + both keys removed.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** §4-H2. AuthCallback also clears pendingEmail on verify-fail (`AuthCallback.tsx:84-87`).

---

## 12.C — Firebase API key gating + placeholder fail-fast (D040)

### [12.015] FIREBASE_API_KEY resolves env → window → placeholder in that order
- **Check:** Key is read from `import.meta.env.VITE_FIREBASE_API_KEY`, then `window.__FIREBASE_API_KEY`, then the `PLACEHOLDER_WEB_API_KEY` literal.
- **Where:** `src/auth.js:25-27`.
- **Expected:** build-time env injection is the primary source; the Web API key is public/embeddable per Firebase docs (not a secret).
- **Verify:** `grep -n "FIREBASE_API_KEY" src/auth.js`; confirm deploy injects it (`deploy.yml:119`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** —

### [12.016] Placeholder key THROWS at boot in production (D040 fail-fast)
- **Check:** If `FIREBASE_API_KEY === 'PLACEHOLDER_WEB_API_KEY'` AND `import.meta.env.PROD`, module init throws; in dev it warns only.
- **Where:** `src/auth.js:32-39`.
- **Expected:** a prod bundle that forgot the secret crashes loudly at boot instead of silently 400-ing every Magic Link (the iter 9.5 regression).
- **Verify:** unit test forces `import.meta.env.PROD=true` + placeholder → expect throw; prod bundle grep `grep -c "PLACEHOLDER_WEB_API_KEY" dist/assets/*.js` after a build WITH the secret → 0 occurrences (real key inlined).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** §B011 / D040 — anti-recurrence of weeks-long silent broken Magic Link.

### [12.017] Deploy workflow injects the real Firebase key + RTDB URL at build
- **Check:** `npm run build` step passes `VITE_FIREBASE_API_KEY` + `VITE_FIREBASE_RTDB_URL` from GitHub Secrets.
- **Where:** `.github/workflows/deploy.yml:117-120`.
- **Expected:** both are `${{ secrets.* }}` env on the build step, BEFORE upload-pages-artifact.
- **Verify:** read deploy.yml; confirm the build step `env:` block lists both secrets; CI gate runs `typecheck` + `test:run` before build (`:111-113`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** —

---

## 12.D — Google OAuth (signInWithIdp → /auth-callback)

### [12.018] buildGoogleSignInUrl requires a client ID and uses a CSPRNG nonce
- **Check:** Throws if `googleClientId` missing; nonce is 16 CSPRNG bytes (`crypto.getRandomValues`), not `Math.random`.
- **Where:** `src/auth.js:231-246`.
- **Expected:** URL `accounts.google.com/o/oauth2/v2/auth` with `response_type=id_token`, `scope='openid email profile'`, `redirect_uri=<origin>/auth-callback`, hex nonce 32 chars.
- **Verify:** `grep -n "getRandomValues\|response_type\|openid email profile" src/auth.js`; unit test asserts thrown on empty id + 32-char nonce.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** §B019 — replaces a ~4-byte Math.random nonce.

### [12.019] Google button is hidden when VITE_GOOGLE_OAUTH_CLIENT_ID is unset
- **Check:** `Auth.tsx` reads the client ID from build env; empty string → `showGoogle=false` → button not rendered, no broken click.
- **Where:** `src/react/routes/screens/Auth.tsx:33-35,104-114,311`.
- **Expected:** pre-Daniel-setup state degrades gracefully (email becomes primary CTA); `handleGoogleSignIn` early-returns if id missing.
- **Verify:** component test render with env unset → `queryByTestId('auth-google')` is null; with env set → button present + click calls `window.location.assign(<google url>)`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** §B005/D-2 — OAuth is code-complete pending only Daniel's console config + the GitHub Secret (deploy.yml:135).

### [12.020] AuthCallback exchanges the Google id_token and strips the hash
- **Check:** On `#id_token=...`, AuthCallback calls `signInWithGoogleIdToken`, then `window.history.replaceState` to remove the fragment BEFORE navigating (anti referrer-leak), then `runPostAuthSync`.
- **Where:** `src/react/routes/screens/AuthCallback.tsx:35-54`; `signInWithGoogleIdToken` `src/auth.js:255-278`.
- **Expected:** success → hash cleared, `setAuthenticated(true)`, navigate `/app/antrenor`; failure → navigate `/auth?error=<reason>`.
- **Verify:** component test with mocked hash → assert `signInWithGoogleIdToken` called + history.replaceState called pre-navigate. `signInWithGoogleIdToken` posts `accounts:signInWithIdp` with `providerId=google.com`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** —

### [12.021] AuthCallback strips Magic Link query params pre-navigate
- **Check:** On Magic Link success, `oobCode/email/apiKey/continueUrl` are removed from the URL via `replaceState` before `runPostAuthSync` fires.
- **Where:** `src/react/routes/screens/AuthCallback.tsx:69-79`.
- **Expected:** the oobCode does not linger in `window.location.search` while the post-auth sync fetch runs (referrer-header leak prevention).
- **Verify:** component test: mock a verify success → assert `history.replaceState(null,'',pathname)` called before navigate.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** §B020.

---

## 12.E — Route guards (`ProtectedRoute.tsx` + `router.tsx`)

### [12.022] /app/* requires (isAuthenticated || isSkipAuth) AND onboardingCompleted
- **Check:** `ProtectedRoute` redirects unauth to `/auth`, and authed-but-not-onboarded to `/onboarding/1`.
- **Where:** `src/react/routes/ProtectedRoute.tsx:64-71` (`passesAuthGate = isAuthenticated || isSkipAuth`; then `if (!onboardingCompleted) Navigate /onboarding/1`).
- **Expected:** both gates enforced in order; children render only when both pass.
- **Verify:** component test matrix: {unauth} → /auth; {auth, !onboarded} → /onboarding/1; {auth, onboarded} → children; {skipAuth, onboarded} → children.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** §A015 — prevents engine T0 baseline pollution via skip-onboarding bypass.

### [12.023] Every /app sub-route sits behind the single ProtectedRoute wrapper
- **Check:** All `/app/*` children (antrenor 14, progres 5, istoric 3, cont 21) are nested under the one `ProtectedRoute`-wrapped `/app` parent — no protected screen is registered as a top-level public route.
- **Where:** `src/react/routes/router.tsx:143-222` (single `{ path:'/app', element:<ProtectedRoute><Layout/></ProtectedRoute>, children:[...] }`).
- **Expected:** only `/`, `/auth`, `/auth/reactivate`, `/auth-callback`, `/onboarding/:step`, `/terms`, `/privacy`, `*` are public; everything else nested under /app.
- **Verify:** read router.tsx; enumerate top-level routes; confirm no `settings-*` / `workout` / `progres` path appears at top level. Playwright: navigate directly to `/app/cont/settings-danger` while logged out → lands on `/auth` (guard redirect).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** `/terms` + `/privacy` are intentionally public (legal pages readable pre-auth, fix for the /terms 404).

### [12.024] No guard was weakened by the themes-removal / Pulse reskin work
- **Check:** The Pulse reskin (2026-05-29) touched Auth.tsx / Layout.tsx styling but did NOT relax `passesAuthGate` or the onboarding gate, nor add an anonymous backend bypass.
- **Where:** `ProtectedRoute.tsx` (unchanged logic), `Auth.tsx:11-17` comment ("the mockup's 'Continue without account' anonymous path is NOT added"), `paletteSync.ts` (accent-only, no routing).
- **Expected:** git history of ProtectedRoute shows no logic change in the Pulse commits; skip-auth remains the only no-magic-link path and it still requires onboarding.
- **Verify:** `git log -p --since=2026-05-27 -- src/react/routes/ProtectedRoute.tsx` → only comments/imports if anything; confirm no new public route added in the Pulse commits to router.tsx.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** Pulse was a reskin (keep engine/testids/i18n) — this step confirms it stayed cosmetic on the auth surface.

### [12.025] ProtectedRoute never force-sets authenticated=false from empty storage
- **Check:** The storage-sync effect sets `true` when storage has auth, but does NOT set `false` when storage is empty (preserves programmatic/dev mock login + test isolation); logout flips false only via the explicit `andura:signedout` listener.
- **Where:** `src/react/routes/ProtectedRoute.tsx:41-60`.
- **Expected:** `sync()` only upgrades to authed; `onSignedOut` is the sole downgrade path.
- **Verify:** component test: programmatic `setAuthenticated(true)` with empty storage → still authed after mount; dispatch `andura:signedout` → flips false.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** §7-C3 — the bidirectional sync is intentionally asymmetric. Confirm this is not exploitable as a stale-true (it tracks real localStorage tokens via `readAuthFromStorage`).

### [12.026] Unknown URLs route to a 404 screen, not a white screen or app shell
- **Check:** Catch-all `*` renders `NotFound` (top-level, unprotected) — a bad URL does not leak an authed shell or crash.
- **Where:** `src/react/routes/router.tsx:225`.
- **Expected:** `/app/cont/does-not-exist` while authed → NotFound; while unauth a bad `/app/*` → guard redirect to /auth first.
- **Verify:** Playwright navigate to a garbage path → NotFound screen with home link.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** —

---

## 12.F — Secrets / no hardcoded keys in src or bundle

### [12.027] No Firebase/Google API key literal committed in src (env-only)
- **Check:** No `AIza...` style key, no service-account JSON, no private OAuth secret in `src/`.
- **Where:** whole `src/` tree.
- **Expected:** the only key-shaped strings are the documented-public Sentry DSN (`sentry.js:9`, write-only ingest) + the `PLACEHOLDER_WEB_API_KEY` literal; real keys arrive via `VITE_*` env.
- **Verify:** `grep -rnE "AIza[0-9A-Za-z_-]{20,}" src/` → zero (excluding the AuthCallback **test fixture** `AuthCallback.test.tsx:147` `apiKey=AIza-x`, which is a fake URL param, not a real key); `grep -rnE "private_key|client_secret|service_account" src/` → zero.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill — note the single test-fixture hit if present>
- **Notes:** Firebase Web API key, projectId, senderId, appId, VAPID, Sentry DSN are all publicly-embeddable per Firebase/Sentry docs — not secrets. The TRUE secrets (none required to be private) are nonetheless injected as GitHub Secrets in deploy.yml.

### [12.028] No hardcoded Bearer token / Authorization header literal
- **Check:** No `Authorization: Bearer <literal>` or hardcoded JWT in src.
- **Where:** whole `src/` tree.
- **Expected:** auth on RTDB REST is via `?auth=<idToken>` query (ADR 002 — RTDB REST does not support Authorization header); no static token anywhere.
- **Verify:** `grep -rniE "authorization['\"]?\s*[:=].*bearer|bearer [A-Za-z0-9._-]{20,}" src/` → zero.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** —

### [12.029] Production bundle contains no leaked secret + no placeholder key
- **Check:** After a CI-equivalent build WITH secrets, `dist/` has no placeholder key and no service-account material.
- **Where:** `dist/assets/*.js` post `npm run build`.
- **Expected:** `PLACEHOLDER_WEB_API_KEY` count = 0 (real key inlined per D040); no `private_key`/`client_secret`.
- **Verify:** build with env set → `grep -rc "PLACEHOLDER_WEB_API_KEY" dist/` = 0; `grep -rE "private_key|client_secret" dist/` = empty.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** If built WITHOUT the secret, D040 throw means the app never boots — that itself is the guard.

### [12.030] No new external network call introduced (egress allowlist)
- **Check:** Runtime fetch/XHR targets are limited to the known set: identitytoolkit, securetoken, the RTDB host, accounts.google.com (redirect, not fetch), Sentry ingest (consent-gated), FCM. No analytics/tracker/3rd-party beacon.
- **Where:** grep all fetch call sites across `src/`.
- **Expected:** every absolute URL maps to one of the above; no `google-analytics`, `facebook`, `doubleclick`, ad/tracker domains.
- **Verify:** `grep -rnE "https?://[a-z0-9.-]+" src/ --include=*.js --include=*.ts --include=*.tsx | grep -viE "andura\.app|googleapis|firebasedatabase|google\.com/o/oauth2|sentry\.io|gstatic|schema\.org|w3\.org"` → review remainder; Playwright: capture `browser_network_requests` during a full session → assert only allowlisted hosts.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** ANTI-RE / privacy-conscious posture — zero silent third-party data egress.

---

## 12.G — Firebase per-UID scoping + sync integrity

### [12.031] getUserPath returns users/<uid> when authed, null when anonymous
- **Check:** `getUserPath()` resolves `users/${auth.uid}` only when `getAuthState().uid` is present; returns null otherwise (never the legacy literal in anon mode).
- **Where:** `src/firebase.js:65-69`.
- **Expected:** anon mode → null → every Firebase op short-circuits (no 401 loop, BUG-2 resolution).
- **Verify:** unit test: no auth → getUserPath()===null; seeded uid → `users/<uid>`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** §56.1.3.

### [12.032] Every RTDB REST call carries the per-uid auth token
- **Check:** `_buildUrl` appends `?auth=<encodeURIComponent(idToken)>` (fetched via `getIdToken`, auto-refresh) to `${FIREBASE_URL}/${path}.json`; all of fbGet/fbPatch/fbRemove route through it.
- **Where:** `src/firebase.js:96-101,166-203`.
- **Expected:** no raw `fetch(FIREBASE_URL...)` bypasses `_buildUrl` + `_fbFetch`; token URL-encoded.
- **Verify:** `grep -nE "fetch\(" src/firebase.js` → only `_fbFetch`; `grep -n "_buildUrl" src/firebase.js` covers get/patch/remove/buildAuthUrl.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** L-4 — JWT-in-URL is the documented RTDB REST contract (no Authorization header support); Sentry scrubs `?auth=` (`sentry.js:64`); HTTPS protects transit. Inherent, accepted.

### [12.033] A user cannot read another user's tree (RTDB rules — server-side)
- **Check:** RTDB security rules enforce `auth.uid === $uid` on `users/{uid}` (read AND write). This is the single largest unauditable-from-repo surface.
- **Where:** server-side `database.rules.json` (NOT in repo per AUDIT-4 H-2) + PRIMER §232 ("Firebase rules deploy LIVE").
- **Expected:** an authed token for user A gets 401/403 on `GET users/<B>.json?auth=<A-token>`.
- **Verify:** **Daniel-side** Firebase console rules read; OR live test: obtain two test-user tokens, curl `GET <RTDB>/users/<otherUid>.json?auth=<myToken>` → expect 401. Recommend committing `database.rules.json` + a rules unit test.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED  *(BLOCKED if rules not inspectable — but this MUST be confirmed before Beta GO; a `.read:true` rule is a silent total leak)*
- **Evidence:** <fill — console screenshot or curl 401>
- **Notes:** AUDIT-4 H-2 — code is correct IF rules are correct. Do not PASS without server-side evidence.

### [12.034] Legacy users/daniel node is locked or deleted post-migration
- **Check:** The exported `USER_PATH = LEGACY_USER_PATH = 'users/daniel'` is read by the one-time auth-path migration; confirm no other authed user can read that node.
- **Where:** `src/firebase.js:40-45`; migration `src/migrations/2026-05-02-auth-path-migration.js`.
- **Expected:** `users/daniel` is either deleted post-migration OR rule-locked so a fresh authed token gets 403.
- **Verify:** **Daniel-side** console: curl `GET <RTDB>/users/daniel.json?auth=<someOtherUserToken>` → expect 401/403 (or 404 if deleted).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED  *(BLOCKED if not server-confirmable)*
- **Evidence:** <fill>
- **Notes:** AUDIT-4 H-1 — only Daniel's own legacy data, but a real cross-user exposure question if the node is open.

### [12.035] syncToFirebase uses PATCH (not PUT) so it never clobbers fcmTokens
- **Check:** The user-tree sync is a PATCH of `SYNC_KEYS` + metadata, leaving sibling nodes (`fcmTokens`, `notificationPrefs`) intact.
- **Where:** `src/firebase.js:184-194` (`fbPatch`) + `:263` (syncToFirebase calls `fbPatch(userPath, payload)`).
- **Expected:** a PUT would replace the whole node and delete the FCM siblings written by pushNotifications.ts / notificationPrefsSync.ts; PATCH merges key-by-key.
- **Verify:** `grep -n "fbPatch\|method: 'PUT'" src/firebase.js` → syncToFirebase uses fbPatch, no whole-tree PUT; unit/integration test asserts a sync after an FCM-token write preserves the token.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** FCM-sync audit fix — a PUT here previously killed push delivery on the next log.

### [12.036] photos are intentionally excluded from cloud sync
- **Check:** `SYNC_KEYS` does NOT include `photos` (base64 images stay local-only — privacy + RTDB size).
- **Where:** `src/firebase.js:78-84`.
- **Expected:** no `'photos'` in SYNC_KEYS; comment documents the deliberate exclusion.
- **Verify:** `grep -n "photos" src/firebase.js` → only the exclusion comment.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** Confirm GDPR export still surfaces photos (local) so the omission is sync-only, not export-only.

---

## 12.H — GDPR Art. 20 (export) + Art. 17 (erasure)

### [12.037] Export collects all stores + Tier-0 keys + Tier-1 IDB, excludes auth tokens
- **Check:** `buildExportPayload` aggregates the 5 zustand stores, all `wv2-*` + canonical legacy data keys, and Tier-1 IDB (cdl/logs/appliedPatterns); it never exports `firebase-*` tokens.
- **Where:** `src/react/routes/screens/cont/SettingsExport.tsx:26-104`.
- **Expected:** `LEGACY_DATA_KEYS = USER_DATA_KEYS + CDL_KEYS + 'pain-cdl'`; auth keys explicitly excluded (S-04); tier1 via `tier1All`.
- **Verify:** unit test on a seeded account → exported JSON contains weights/logs/coach-decisions/pr-records/tier1.cdl AND contains NO `firebase-id-token`/`firebase-refresh-token`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** S-02 — the prior wv2-only loop silently omitted ~38 unprefixed legacy keys; confirm they are now included.

### [12.038] Export works across all tiers and triggers a local download (no server upload)
- **Check:** Export builds a Blob and triggers an anchor download client-side; zero network upload (local-first invariant).
- **Where:** `SettingsExport.tsx:106-139` (`triggerDownload`, Blob + objectURL + revoke).
- **Expected:** clicking export on a seeded account downloads `andura-export-<date>.json`; no fetch fired.
- **Verify:** Playwright on seeded account → SettingsExport → click → assert a download event + no network POST. Run against a populated account (Tier-1 archive present) so tier1 arrays are non-empty.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** Art.20 portability — JSON is machine-readable + reasonably structured.

### [12.039] Account delete wipes localStorage entirely (Tier 0)
- **Check:** `wipeAllLocalData` calls `localStorage.clear()` (not a wv2-prefix loop) since full deletion preserves nothing.
- **Where:** `src/react/routes/screens/cont/DeleteAccountConfirm.tsx:26-51`.
- **Expected:** all ~38 unprefixed legacy keys + device-id + tombstones cleared; sync-suppression marker set AFTER clear.
- **Verify:** unit test seeds prefixed + unprefixed keys → after wipeAllLocalData, localStorage empty except `__suppressFirebaseSyncUntil`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** S-01 (was CRIT) — prior prefix loop left legacy keys on device.

### [12.040] Account delete wipes IndexedDB Tier-1 (+ anonymous residue)
- **Check:** `wipeRemoteData` calls `wipeUserDB(uid)` (deletes `andura_<uid>`) which also sweeps `andura_anonymous_*` DBs.
- **Where:** `DeleteAccountConfirm.tsx:53-59`; `src/storage/db.js:356-369` (`wipeUserDB` → `wipeAnonymousDBs` `:322`).
- **Expected:** post-delete no `andura_<uid>` or `andura_anonymous_*` IDB remains on the device.
- **Verify:** Playwright seeded account → delete → `indexedDB.databases()` returns no andura DBs; unit test `wipeUserDB.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** L-5 caveat — on a shared device with two anonymous users this also deletes the other anon DB (edge; account-delete semantics arguably justify it).

### [12.041] Account delete issues the cloud RTDB DELETE BEFORE clearing tokens
- **Check:** The Tier-2 `DELETE users/<uid>` is AWAITED (with an 8s timeout race) while the token is still valid, THEN `authSignOut()` clears tokens.
- **Where:** `DeleteAccountConfirm.tsx:79-117` (await `wipeRemoteData` → then `authSignOut`); `wipeRemoteData` fetch DELETE `:62-72`.
- **Expected:** the cloud node is deleted; signOut does not race ahead and null the token so getIdToken returns null and the DELETE never fires (the RE-S-01 resurrection bug).
- **Verify:** integration test: spy on the RTDB DELETE fetch → assert it is called with a non-null `?auth=` BEFORE signOut clears tokens. Confirm `Promise.race` timeout (`REMOTE_WIPE_TIMEOUT_MS=8000`) so a hung network can't trap the user.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** RE-S-01 (was CRIT, GDPR Art.17 + S-07 resurrection) — this ordering is the entire fix. Verify it has not regressed.

### [12.042] Delete sets a sync-suppression window so a debounced push can't resurrect
- **Check:** `window._suppressFirebaseSync=true` is set up-front, and `__suppressFirebaseSyncUntil` is persisted after `localStorage.clear()`; `syncToFirebase` and `syncFromFirebase` both honor these.
- **Where:** `DeleteAccountConfirm.tsx:105,47`; `firebase.js:238-241` (syncTo gate) + `:269-277` (syncFrom gate).
- **Expected:** an armed 3s debounced `syncToFirebase` (DB.set override `firebase.js:384-387`) cannot re-PUT `users/<uid>` during the delete window; next boot's syncFromFirebase short-circuits.
- **Verify:** unit test: set the flag, fire a DB.set that would arm the timer, run syncToFirebase → returns false (suppressed); after clear, `__suppressFirebaseSyncUntil` > now.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** RE-S-02 / C3-S-01 — defense-in-depth against data resurrection.

### [12.043] Delete enforces the freshness gate before any wipe
- **Check:** If `!isAuthFresh()`, delete aborts, signs out, and routes to re-auth — no wipe occurs.
- **Where:** `DeleteAccountConfirm.tsx:80-86`.
- **Expected:** stale session → `/auth?reason=reauth_required_for_delete`, zero data touched.
- **Verify:** component test with `isAuthFresh` mocked false → assert no wipe call + navigate to reauth.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** Covered by 12.011 too; here it is the erasure-specific guard.

---

## 12.I — k=5 anonymity / consent / terms / age gate / medical disclaimer

### [12.044] k=5 anonymity claim vs implementation (Terms-vs-code gap)
- **Check:** Terms copy references "k-anonimat 5+"; verify whether any aggregation/cohort pipeline actually enforces k>=5 in src.
- **Where:** Terms copy in Auth.tsx legal modal + `src/i18n/{en,ro}.json`; grep for cohort/anonymity in `src/`.
- **Expected:** EITHER a real k-anon aggregation pipeline exists, OR the Terms wording is softened — the claim must not be ahead of the implementation.
- **Verify:** `grep -rniE "k.?anon|cohort|MIN_COHORT|kThreshold|aggregat.*anon" src/` → AUDIT-4 found ZERO implementation; "telemetry" hits are only the Sentry consent flag + tiering size telemetry. No demographic aggregation ships.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED  *(PARTIAL/FAIL — claim exceeds implementation per AUDIT-4)*
- **Evidence:** <fill — grep zero-result for cohort/k-anon>
- **Notes:** AUDIT-4 bonus finding. Not Beta-blocking (no aggregated data is collected — Sentry is error-only + opt-in), but Daniel must either ship k-anon before claiming it or soften Terms wording. Flag explicitly.

### [12.045] Telemetry (Sentry) is consent-gated and defaults OFF (GDPR Art. 7)
- **Check:** `initSentry()` runs ONLY when `telemetryOptIn===true` (default false in settingsStore); a store subscription inits on later opt-in.
- **Where:** `src/main.tsx:29-45` (`if (useSettingsStore.getState().telemetryOptIn) initSentry()` + subscribe-on-flip); default in settingsStore (`telemetryOptIn` defaults false).
- **Expected:** fresh user → Sentry never inits; toggling opt-in → inits once. Test `src/__tests__/sentry-consent-gate.test.ts`.
- **Verify:** unit test: default state → initSentry NOT called; flip telemetryOptIn true → called once; flip back → not re-called.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** —

### [12.046] Sentry beforeSend scrubs uid, email, and the ?auth= JWT
- **Check:** `beforeSend` redacts uid (anchored `uid=`/`/users/<28>`), email, and `?auth=<jwt>` across exception values, message, request.url, user channels, and breadcrumbs (incl. `breadcrumb.data.url`).
- **Where:** `src/util/sentry.js:32-95`.
- **Expected:** the uid regex is anchored (preserves Vite chunk hashes — the over-broad-regex incident is fixed); `?auth=` → `[REDACTED]`; emails → `<EMAIL>`; `event.user.{email,id,username}` masked.
- **Verify:** unit test `src/util/__tests__/sentryBeforeSend.test.js` feeds a synthetic event with a uid path + `?auth=` URL + email + a webpack chunk ref → assert uid/email/token redacted, chunk hash preserved.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** §S-08 / §S2.1 / §MED-1 — survived the over-broad-regex regression; confirm it stays anchored.

### [12.047] Signup path gates submit on explicit consent (Terms + Privacy)
- **Check:** In `mode==='signup'`, the submit button is disabled until the consent checkbox is ticked; login mode uses implicit-consent footer (existing users already accepted).
- **Where:** `src/react/routes/screens/Auth.tsx:72,75,257-302` (`consentRequiredUnmet = mode==='signup' && !consent`; disabled on button).
- **Expected:** signup without ticking the box → submit blocked; ticking → enabled; links open `/terms` + `/privacy`.
- **Verify:** Playwright: open Auth in signup mode → button disabled → tick consent → enabled; component test asserts `consentRequiredUnmet` blocks `handleSend`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** GDPR consent persisted implicitly via account creation; the explicit checkbox is the affirmative-action record.

### [12.048] Age gate enforces the adults-only 18+ floor consistently
- **Check:** Onboarding age bound is `min:18` and the engine never receives age <18; the input `min` attribute matches (no 16-vs-18 inconsistency).
- **Where:** `src/react/stores/onboardingStore.ts:64-66,85` (`age:{min:18,max:99}`, comment notes CEO 2026-05-27 adults-only 18+ supersedes the GDPR-16 parental-consent default; comment flags the input `min="16"` line L563 as needing consistency).
- **Expected:** the store clamp/validation rejects age <18 AND the corresponding onboarding input `min` attribute is `18` (not `16`). Sub-18 cannot complete onboarding.
- **Verify:** `grep -n "min: 18\|min=\"16\"\|min=\"18\"" src/react/stores/onboardingStore.ts src/react/routes/screens/Onboarding.tsx` → confirm store + input both 18; component test enters age 16 → validation error, cannot proceed.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED  *(PARTIAL if the input still reads min="16" while the store says 18 — a real inconsistency the store comment itself flags)*
- **Evidence:** <fill — both loci's min value>
- **Notes:** CEO LOCK 2026-05-27 = adults-only 18+ (replaces the GDPR-16 + parental-consent path; no minors → no parental-consent flow needed). Confirm there is no separate under-16 parental-consent branch left dangling.

### [12.049] Medical disclaimer (LOCK 4) gate is mounted and blocks the app until acknowledged
- **Check:** `MedicalDisclaimerModal` is rendered in `Layout` with `open={!acceptedDisclaimer}`, acknowledge persists `acceptedDisclaimer` so it does not reappear.
- **Where:** `src/react/routes/Layout.tsx:50-51,96-99`; `src/react/components/MedicalDisclaimerModal.tsx`; settingsStore `acceptDisclaimer` (partialized persist).
- **Expected:** a fresh authed+onboarded user sees the mandatory (no-cancel) disclaimer before any training flow; after acknowledge it persists across reloads.
- **Verify:** component test `Layout.disclaimerGate.test.tsx`: `acceptedDisclaimer=false` → modal open; acknowledge → persists + modal closes; reload → stays closed.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** U-01 (was CRIT) — the gate was built but never mounted; acceptDisclaimer had zero non-test callers until mounted in Layout. Confirm it stays mounted (a reskin could accidentally drop it).

---

## 12.J — XSS / injection sinks

### [12.050] No dangerouslySetInnerHTML / innerHTML / eval / new Function in app code
- **Check:** No React `dangerouslySetInnerHTML`, no direct `innerHTML` assignment, no `eval(`, no `new Function(` in shipped `src/` (excluding tests).
- **Where:** whole `src/` tree (production code).
- **Expected:** zero sinks; AparateLipsa.tsx grep hit is the word "innerHTML" only if it is a comment/identifier — confirm it is NOT a sink (likely a false-positive substring).
- **Verify:** `grep -rnE "dangerouslySetInnerHTML|\.innerHTML\s*=|\beval\(|new Function" src/ --include=*.ts --include=*.tsx --include=*.js | grep -v "__tests__"` → review each hit. The earlier scan flagged `AparateLipsa.tsx`, `sentryBeforeSend.test.js` (test), and pulse test files — confirm the non-test hit is benign (e.g., a string match, not an assignment).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill — each non-test hit classified as sink or false-positive>
- **Notes:** If any real sink exists, it is automatically a section FAIL (CRITICAL gate). React JSX auto-escapes by default — the risk is only the explicit-escape-hatch APIs above.

### [12.051] Accent picker writes --brick from a fixed enum, not user free-text
- **Check:** `applyAccent` sets `--brick` only from the closed `ACCENT_HEX` map keyed by the `Accent` union ('aqua'|'ember'|'violet'); 'volt' clears the override. No arbitrary string reaches `setProperty`.
- **Where:** `src/react/lib/paletteSync.ts:40-59` (`ACCENT_HEX` const + `applyAccent`), `readAccent` validates against the literal union `:67`.
- **Expected:** even a tampered localStorage `accent` value that is not in {volt,aqua,ember,violet} falls back to 'volt' (no override) — a malicious `--brick:url(javascript:...)` cannot be injected.
- **Verify:** unit test: set localStorage `wv2-settings-store` accent to a CSS-injection string → `readAccent` returns 'volt', `applyAccent` removes the property (no setProperty with attacker value). `grep -n "setProperty" src/react/lib/paletteSync.ts` → only `'--brick', ACCENT_HEX[accent]` (enum value).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill — confirm enum-only write>
- **Notes:** VERIFIED-SAFE by design (closed enum) — this step confirms it stays closed (no future "custom hex" picker that would pass user text to setProperty).

### [12.052] No user-supplied string is interpolated into a DOM/URL sink unescaped
- **Check:** User strings (email, profile, notes) are rendered via JSX text (auto-escaped) or `t()` interpolation, never concatenated into `href`/`src`/`style`/`document.write`.
- **Where:** Auth.tsx (email shown via `{email}` JSX), legal modal links are static (`/terms`,`/privacy`,`https://andura.app/terms`), export filename uses a date not user input.
- **Expected:** no `href={`...${userVar}`}` to a non-static scheme; no `window.open(userVar)`; the export download filename is date-based (`andura-export-<date>.json`), not user-named.
- **Verify:** `grep -rnE "href=\{|src=\{|window\.open\(|location\.(assign|href)\s*=" src/react --include=*.tsx` → confirm dynamic targets are auth/Google URLs (built internally) or router paths, never raw user text.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** `window.location.assign(buildGoogleSignInUrl(...))` (Auth.tsx:107) uses an internally-built URL with encoded params — not user free-text.

### [12.053] Data import (Settings) parses JSON defensively, no code execution
- **Check:** The import flow reads a file via FileReader + `JSON.parse` inside try/catch and validates shape; it never `eval`s or trusts arbitrary keys into a sink.
- **Where:** `src/react/routes/screens/cont/SettingsImport.tsx` + `src/react/lib/historyImportParser.ts`.
- **Expected:** malformed JSON → graceful error, no throw-to-crash; imported values are written to stores/localStorage as data, never executed.
- **Verify:** unit test feeds garbage + a hostile payload (e.g., `{"__proto__":{...}}`, a `<script>` string) → parser rejects/sanitizes, no prototype pollution, the script string is stored as inert text (rendered escaped by JSX).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** Untrusted-input boundary — the only place the app ingests an arbitrary external file.

---

## 12.K — Data-at-rest exposure (shared-device)

### [12.054] IndexedDB is namespaced per UID (no cross-user IDB read)
- **Check:** The Dexie DB name is `andura_<uid>` when authed (`andura_anonymous_<deviceId>` when anon) — one user's IDB tier is not readable under another user's namespace.
- **Where:** `src/storage/db.js:10-20,105-122` (`getNamespace` → `_sanitizeNamespace(auth.uid)`; DB name `${DB_NAME_PREFIX}_${namespace}`).
- **Expected:** switching uid switches the DB; no shared default DB holds multiple users' Tier-1 data.
- **Verify:** unit test: seed under uid A → switch to uid B → tier1All returns empty for B; `grep -n "andura_\|_sanitizeNamespace\|getNamespace" src/storage/db.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** —

### [12.055] localStorage (Tier 0) is NOT per-UID — shared-device leak risk (cross-ref §08)
- **Check:** Tier-0 keys (`wv2-*`, auth tokens, legacy data) live in a single shared localStorage namespace, NOT per-uid — so on a shared physical device, user B (after A logs out without device wipe) could see A's residual Tier-0 data if signOut/delete did not clear it.
- **Where:** `src/firebase.js:87-90` (device-id in plain localStorage), AUTH keys in plain localStorage (`auth.js:577-585`), `wv2-*` settings/stores.
- **Expected:** the mitigation is that signOut clears auth tokens (12.012) and account-delete clears ALL of localStorage (12.039); BUT a plain logout (LogoutConfirm) that keeps training data on-device is by design — confirm what logout retains vs clears, and that no OTHER user's session can read it without re-auth (data is local but the app gates on auth/onboarding).
- **Verify:** Playwright on a shared profile: user A logs out (not delete) → inspect localStorage → confirm auth tokens gone but training data may remain (documented); then the app routes to /auth (guard) so the data is not *rendered* to B without B authing. Cross-ref §08 for the full persistence/source-of-truth treatment.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED  *(PARTIAL — shared-device Tier-0 residue is an accepted PWA limitation; confirm logout clears tokens + the guard prevents rendering A's data to B)*
- **Evidence:** <fill — localStorage contents post-logout>
- **Notes:** PWA local-first means Tier-0 is inherently device-scoped, not user-scoped. The real invariants: (a) tokens cleared on logout, (b) full wipe on delete, (c) guard blocks unauthed rendering. Anything beyond (per-uid localStorage partitioning) is a deeper change — flag for §08 + Daniel decision, not a Beta blocker for the single-user assumption.

### [12.056] No secret/token is written to a place the export or a screenshot would leak it
- **Check:** Auth tokens are excluded from GDPR export (12.037); confirm no token is rendered into the DOM (visible text) or logged to console in production.
- **Where:** `SettingsExport.tsx:24-25` (auth keys excluded), `sentry.js` console drop §1-C2, no `console.log(idToken)` anywhere.
- **Verify:** `grep -rniE "console\.(log|warn|error)\(.*(idToken|refreshToken|FIREBASE_API_KEY)" src/` → zero token-logging; export test (12.037) confirms exclusion.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** —

---

## 12.L — Dependencies / supply chain

### [12.057] npm audit (production) reports zero vulnerabilities
- **Check:** Production dependency tree has no known CVEs at audit time.
- **Where:** `package.json` / `package-lock.json`.
- **Expected:** `npm audit --omit=dev` → 0 vulnerabilities (high/critical especially); any finding is triaged.
- **Verify:** run `npm audit --omit=dev --json` → assert `metadata.vulnerabilities.{high,critical}===0`; record total.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill — npm audit summary>
- **Notes:** Dependabot grouped updates + major-tag action pinning is the documented hardening (deploy.yml:38-44); full SHA-pin deferred post-Beta.

### [12.058] CI actions are version-pinned and the deploy gate runs tests before build
- **Check:** GitHub Actions are pinned to major tags; `npm ci --ignore-scripts` + `typecheck` + `test:run` run BEFORE `build`/deploy.
- **Where:** `.github/workflows/deploy.yml:100-117`.
- **Expected:** `--ignore-scripts` on ci (supply-chain — no arbitrary postinstall), test gate blocks a broken/red bundle from shipping.
- **Verify:** read deploy.yml; confirm order: checkout → setup-node → `npm ci --ignore-scripts` → typecheck → test:run → build → upload/deploy.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill>
- **Notes:** §33-C1 / §20-H1/H2 — production never ships unverified code.

---

## 12.M — Section gate summary

### [12.059] No open FAIL in any CRITICAL security step
- **Check:** Aggregate this section; CRITICAL gate is 100% with ZERO open FAIL.
- **Where:** all steps 12.001–12.058.
- **Expected:** every server-side-dependent step (12.033 rules, 12.034 legacy node) is CONFIRMED (not BLOCKED) before Beta GO; XSS sinks (12.050) clean; logout/delete invariants (12.012–12.013, 12.041) PASS; k-anon Terms gap (12.044) resolved (ship or soften).
- **Verify:** compute Section % per scoring; list every FAIL/PARTIAL/BLOCKED with file:line + proposed fix; the audit STOPS here if the gate is not met.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <fill — scorecard row>
- **Notes:** The two unauditable-from-repo items (12.033 / 12.034) MUST be closed in the Firebase console before opening to real users — a wrong rule is a silent total data leak the client cannot detect. Recommend committing `database.rules.json` + a rules unit test to make them auditable in future runs.
