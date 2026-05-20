# §4 — Security Audit

**Scope:** OWASP Top 10 + Firebase rules + Magic Link + OAuth + storage exposure + headers (CSP/HSTS/Permissions-Policy/COOP/etc) + SW scope + npm audit + bundle leaks + cross-tab session + IndexedDB quota + encryption + CDL + GDPR + k-anonymity + rate limiting
**Method:** `npm audit --json`, grep aggregated, source review src/firebase.js + src/auth.js + src/util/sentry.js + firestore.rules + database.rules.json + index.html headers inspect

## Severity matrix §4

| Severity | Count |
|----------|-------|
| CRITICAL | 6 |
| HIGH | 7 |
| MED | 6 |
| LOW | 3 |
| NIT | 2 |
| **Total** | **24** |

---

## CRITICAL findings

### §4-C1 — **Sentry is DEAD on production: React main.tsx does NOT initialize Sentry**
**Severity:** CRITICAL (§17.4 + §17.10 production observability blind spot)
**Evidence:**
- `src/main.js:2-3` (vanilla legacy entry): `import { initSentry } from './util/sentry.js'; initSentry();`
- `src/main.tsx:6-10` (React production entry post-D028): imports `StrictMode`, `createRoot`, `RouterProvider`, `router`, `./styles/global.css` — **NO initSentry call**.
- `src/util/sentry.js` exports `initSentry()` + `captureException()`. The functions exist; nobody calls them in React tree.
- @sentry/browser is in dependencies (~50KB gzipped) → ships to production WASTED.
- index.html `<script type="module" src="/src/main.tsx">` post-D028 entry swap → vanilla main.js never executes.
**Karpathy:** Goal-Driven Execution — pre-Beta launch w/o production crash visibility = blind.
**Reasoning:**
- ZERO production user crashes will be captured. Any uncaught error → silent on Sentry dashboard. Daniel discovers issues only via user reports or self-testing.
- Phase 6 task_20 ErrorBoundary `console.error` (the ONLY current error reporting) writes to console — invisible to remote observers.
- Sentry config `beforeSend` filters Firebase errors (line 36) — even if wired, would hide critical Firebase failures (quota exceeded, rate limits, network).
**Fix log:**
- `src/main.tsx` add: `import { initSentry } from './util/sentry.js'; initSentry();` BEFORE `createRoot(...)` call.
- Refactor `sentry.js`:
  - Remove `console.log` debug calls (§1-C2 production strip).
  - REMOVE or REVIEW `beforeSend` Firebase filter — Firebase quota failures are the EXACT signal we want.
  - Move SENTRY_DSN to `VITE_SENTRY_DSN` env var.
- Wire `ErrorBoundary.tsx:31` to call `captureException(error, { extra: { errorInfo, componentStack: errorInfo.componentStack } })`.
- Wire engineWrappers.ts catch blocks to captureException as breadcrumb/exception.
- Document opt-out flag (§17.1 telemetry opt-in default FALSE per Phase 6 task_14) so Sentry respects user telemetry preference.

### §4-C2 — `FIREBASE_API_KEY = 'PLACEHOLDER_WEB_API_KEY'` shipped if window injection missing
**Severity:** CRITICAL (auth would fail entirely on production)
**Evidence:** `src/auth.js:23-24`:
```js
export const FIREBASE_API_KEY = (typeof window !== 'undefined' && window.__FIREBASE_API_KEY)
  || 'PLACEHOLDER_WEB_API_KEY';
```
Grep for `window.__FIREBASE_API_KEY` setter in entire `src/` → ZERO hits. The runtime injection mechanism is NOT in this codebase (would need to be in index.html `<script>window.__FIREBASE_API_KEY = '...'</script>` BEFORE main.tsx — verify).
- Note: index.html has NO `<script>` setting this either.
- Comment line 22 says "Daniel: replace 'PLACEHOLDER_WEB_API_KEY' with the real key pre-launch publish".
**Karpathy:** Think Before Coding — Magic Link will fail entirely with placeholder key.
**Reasoning:** Firebase REST endpoint `accounts:sendOobCode?key=PLACEHOLDER_WEB_API_KEY` → Firebase rejects 400 invalid key → user cannot sign in → auth-protected /app/* routes inaccessible → app effectively non-functional for new users. CRITICAL pre-Beta blocker.
**Note:** Per Firebase docs, Web API key IS public-safe (NOT a secret). Concern is operational completeness, not security.
**Fix log:** Pick ONE:
- (a) Replace placeholder with real key in source + commit (per Firebase docs API key public-safe — verify project Firebase Security Rules properly restrict).
- (b) Use `import.meta.env.VITE_FIREBASE_API_KEY` with build-time injection via .env file → ship dist with key baked.
- (c) Keep window-injection but actually inject via index.html `<script>` BEFORE main.tsx load.
Option (b) is best practice. ETA: S.

### §4-C3 — NO Content Security Policy (CSP) headers OR `<meta http-equiv>` configuration
**Severity:** CRITICAL (§4.6 OWASP A03 Injection — defense in depth)
**Evidence:** Grep `Content-Security-Policy` in repo (non-Obsidian) → ZERO hits in `index.html`, `vite.config.js`, `deploy.yml`, any production HTML/JS.
**Karpathy:** Surgical Changes — single `<meta>` tag in index.html.
**Reasoning:**
- GH Pages does NOT support custom HTTP response headers → CSP must be set via `<meta http-equiv="Content-Security-Policy" content="...">` in index.html.
- Without CSP, an XSS injection (e.g., if attacker manages to inject `<script>` via Romanian glyph encoding bypass or library bug) executes with full origin privileges → exfiltrate auth tokens from localStorage, exfiltrate user CDL/Big 6 to attacker server, modify DOM to phish.
- Even without active XSS bug, CSP = belt-and-suspenders defense.
- Same goes for: NO X-Frame-Options (clickjacking — andura.app embeddable in attacker iframe), NO Referrer-Policy (referrer leak to fonts.googleapis.com), NO Permissions-Policy (camera/mic default deny absent), NO X-Content-Type-Options nosniff.
**Fix log:** Add to index.html `<head>`:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' https://*.firebaseio.com https://*.firebasedatabase.app https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.sentry.io https://o4511269200068608.ingest.de.sentry.io;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta name="referrer" content="strict-origin-when-cross-origin">
```
Tighten 'unsafe-inline' to nonces post-Beta. Iterate via report-uri header.

### §4-C4 — Auth tokens stored in localStorage (XSS exfiltration risk amplified by §4-C3)
**Severity:** CRITICAL (combined with §4-C3 + §4.5)
**Evidence:** `src/auth.js:27-33` `AUTH_STORAGE_KEYS = { idToken: 'firebase-id-token', uid: 'firebase-uid', refreshToken: 'firebase-refresh-token', expiry: 'firebase-id-token-expiry', pendingEmail: 'firebase-magic-link-email' }` — all in localStorage.
**Karpathy:** Think Before Coding — Firebase REST API doesn't support httpOnly cookies; tokens MUST be JS-accessible → localStorage is the standard but vulnerable.
**Reasoning:**
- With CSP absent (§4-C3) + ESLint absent (§1-C4) → any XSS injection → `localStorage.getItem('firebase-id-token')` → attacker has 1h-valid token → impersonate user → read/write Firebase user data per uid → if Daniel admin, escalated.
- Refresh token = LONG-LIVED → token theft = persistent compromise.
**Reasoning addendum:** PWA SPA architecture has no clean way to use httpOnly cookies for Firebase REST. Mitigation = (a) defensive CSP §4-C3, (b) sub-resource integrity for any inline scripts, (c) optional: use Web Worker for token handling (out of DOM scope) — heavyweight.
**Fix log:** Layer defenses:
- (a) Implement CSP §4-C3 → primary mitigation.
- (b) Add `X-Frame-Options: DENY` via meta + Permissions-Policy.
- (c) Document trust model: "Andura SPA: any XSS = full compromise. Mitigation: tight CSP + dep auditing + zero `innerHTML`/`dangerouslySetInnerHTML` (✓ verified — §4-clean below)."

### §4-C5 — Sentry `beforeSend` SILENTLY DROPS Firebase errors (critical observability gap)
**Severity:** CRITICAL
**Evidence:** `src/util/sentry.js:36` `if (msg.includes('Firebase') || msg.includes('firebasedatabase')) return null;`
**Karpathy:** Think Before Coding — filter is anti-debugging.
**Reasoning:** Firebase errors are PRECISELY the signal needed for production debugging — quota exceeded, rate limits, network 5xx, auth token rejected. Filter eliminates ENTIRE class of production errors from observability.
**Fix log:** Remove Firebase exclusion; instead tag Firebase errors `scope.setTag('source', 'firebase')` so they're queryable but ALL captured. Combined with §4-C1.

### §4-C6 — Firestore rules require MANUAL Console publish — drift risk pre-launch
**Severity:** CRITICAL (§4.2 + §28 GDPR exposure if rules drift)
**Evidence:** `firestore.rules:11-13` comment: "CRITICAL: Daniel must publish manually via Firebase Console (Project Settings → Firestore Database → Rules → paste content + Publish) per §56.16 + §56.18. File în repo = SSOT spec; Console publish = production effect."
**Karpathy:** Goal-Driven — Beta entry §50.3 requires GDPR right-to-erasure functional; depends on rules.
**Reasoning:**
- If Daniel forgets to publish OR Console-edit then forgets to commit back → repo file ↔ live rules drift.
- During audit, NO mechanism verifies repo rules == live Firebase rules.
- Beta launch could ship with permissive rules left from dev → cross-user data exposure CRITICAL.
**Fix log:**
- Use Firebase CLI `firebase deploy --only firestore:rules,database` from CI/CD or manual local. Add `firebase.json` config + `.firebaserc`.
- OR scripted check: nightly cron action calls Firebase API `getFirestoreSecurityRules` (admin SDK), diffs vs repo file, alerts on drift.
- Document procedure in `08-workflows/firebase-rules-publish-workflow.md`.

---

## HIGH findings

### §4-H1 — `npm audit`: 4 moderate vulnerabilities (esbuild, vite, ws, brace-expansion) — fix requires vite v5→v8 major upgrade
**Severity:** HIGH (§4.8)
**Evidence:** `npm audit --json` output:
- `esbuild <=0.24.2` GHSA-67mh-4wv8-2f99 CVSS 5.3 — dev server CWE-346
- `vite <=6.4.1` GHSA-4w7w-66w2-5vf9 — path traversal in .map handling
- `ws 8.0.0-8.20.0` GHSA-58qx-3vcg-4xpx CVSS 4.4 — uninitialized memory disclosure (transitive via @vitest)
- `brace-expansion 5.0.2-5.0.5` GHSA-jxxr-4gwj-5jf2 CVSS 6.5 — DoS protection bypass (transitive)
- All MODERATE severity, NONE HIGH/CRITICAL. ALL are dev-only OR dev-server-mode only — production build artifacts (`dist/`) NOT affected at runtime.
- `fixAvailable: vite v8.0.13` SemVerMajor (breaking).
**Karpathy:** Surgical Changes vs Think Before Coding tension — vite major bump = unknown breakage.
**Fix log:**
- Pre-Beta: defer fix (dev-only, no prod runtime). Document accepted risk.
- Post-Beta: schedule vite v8 migration as separate task. Run smoke + E2E + manual regress.
- Verify `npm audit --omit=dev` returns 0 vulns (likely; confirm).

### §4-H2 — Magic Link `pendingEmail` stored in localStorage AFTER successful sendOobCode (not cleared if user abandons)
**Severity:** HIGH (§4.5 + §31)
**Evidence:** `src/auth.js:74` `_setItem(AUTH_STORAGE_KEYS.pendingEmail, email)` — set on successful send. NOT cleared if user closes browser or doesn't click link. Email persists in localStorage indefinitely. Attacker with later device access (e.g. shared laptop) sees pending email → identifies the user.
**Karpathy:** Surgical Changes.
**Fix log:** TTL-clear pendingEmail (e.g., after 1h auto-expire). Or store in sessionStorage (cleared on tab close).

### §4-H3 — Magic Link sendMagicLink has NO client-side rate limiting beyond retry-backoff
**Severity:** HIGH (§4.16 + §31.4 abuse prevention)
**Evidence:** `src/auth.js:62-86` sendMagicLink retries 3x on network/5xx (300/600ms backoff). NO throttle per email per minute on the SEND button. User (or attacker w/ access) can spam sendMagicLink repeatedly — Firebase Identity Toolkit has its own quota but exhausted quota = lockout for legitimate users.
**Karpathy:** Surgical Changes — 1-line throttle.
**Fix log:** Add `lastMagicLinkSent: localStorage` with min-interval guard (e.g., 30s between sends). UI button disabled state during cooldown. Combined with `aria-disabled` accessibility.

### §4-H4 — Firebase URL hardcoded `https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app`
**Severity:** HIGH (§24.5 config drift)
**Evidence:** `src/firebase.js:7`. Single source ✓ but not env-vared → cannot point at staging Firebase project without code change.
**Karpathy:** Surgical Changes.
**Reasoning:** Pre-Beta single-env OK. But if dev/staging/prod env split (§24.6) wanted in Phase 7+, this is the choke point. Plus revealing project ID in source — info leak via curl source (low risk; project IDs found via Firebase Hosting routing anyway).
**Fix log:** Move to `VITE_FIREBASE_RTDB_URL` env var w/ fallback. Same pattern for Sentry DSN + Firebase API key.

### §4-H5 — Sentry DSN hardcoded `https://dcbb...@o4511...ingest.de.sentry.io/4511...`
**Severity:** HIGH (§4.9 + config drift)
**Evidence:** `src/util/sentry.js:4`. Sentry DSN per docs is "public-safe" but limits rotation flexibility + leaks org ID + environment routing identifier.
**Fix log:** Migrate to `VITE_SENTRY_DSN` env var (also see §4-C1 fix). Add to .env.example template.

### §4-H6 — Subresource Integrity (SRI) absent (no third-party CDN scripts though)
**Severity:** HIGH (§4.26)
**Evidence:** index.html has NO `<script>` tags from third-party CDNs. Vanilla legacy index uses Google Fonts inline CSS link — vite-plugin-pwa workbox CacheFirst caches Google Fonts → if CDN compromised, cache poisons all future loads until 1y maxAge expires.
**Reasoning:** No third-party scripts currently → SRI moot for that vector. BUT Google Fonts CSS load (vanilla legacy only — verify if React build does it too via global.css `@import`?) doesn't allow SRI for dynamic font URLs.
**Fix log:** Self-host fonts (§1-H4 already noted). Eliminates Google Fonts CDN dependency + indirect SRI moot point.

### §4-H7 — Service Worker scope `/` + cache invalidation strategy review needed
**Severity:** HIGH (§4.7 + §16.10-§16.12)
**Evidence:** Per §1-H6, dual SW (manual `public/sw.js` + vite-plugin-pwa generated). Manual sw.js uses cache name `andura-v2` → if version bumped to v3 in deploy, old `andura-v2` cache evicted via `caches.keys().filter(k => k !== CACHE)`. vite-plugin-pwa generates workbox SW with auto-update + `cleanupOutdatedCaches: true`. CONFLICT at /sw.js path.
**Reasoning:** During SW transition: stale SW could serve stale React build → user sees old workout state. Cache poisoning if a malicious cache is somehow injected (unlikely but defense-in-depth).
**Fix log:** Resolve dual-SW per §1-H6 first. Then verify cache invalidation strategy via post-deploy fresh device test (§26.1).

---

## MED findings

### §4-M1 — XSS attack surface analysis: ZERO `dangerouslySetInnerHTML` ✓, `innerHTML` only in vanilla legacy
**Severity:** MED (clean-but-defended)
**Evidence:** Grep `dangerouslySetInnerHTML` → zero hits. `innerHTML` hits all in `src/pages/coach/*.js` (vanilla legacy) — those don't ship per D028.
**Resolution:** Clean React side. Verify after §1-H2 vanilla cleanup.

### §4-M2 — Magic Link auth callback URL validation NOT verified (open redirect potential)
**Severity:** MED (§4.21)
**Evidence:** `src/auth.js:55` `continueUrl: continueUrl || `${_origin()}/auth-callback`` — default uses location.origin. Caller could pass arbitrary URL.
**Reasoning:** Firebase Identity Toolkit validates continueUrl against project's "Authorized domains". If misconfigured (wildcard `*` added), attacker could craft magic-link with `continueUrl=https://evil.com/auth-callback?token=...` → user clicks → token leak.
**Fix log:** Verify Firebase Console > Authentication > Settings > Authorized domains: ONLY andura.app + localhost listed. Document.

### §4-M3 — IndexedDB Dexie quota handling NOT verified — overflow strategy unknown
**Severity:** MED (§4.11)
**Evidence:** `src/db.js` (need read) + `src/react/lib/dexieMigration.ts` likely handle quota. Browser IDB quota varies 50MB-2GB. Long-tail user with 5+ years sessions could approach limit.
**Fix log:** Wrap Dexie writes in try/catch for `QuotaExceededError`; surface UX toast "Spațiu plin local — arhivează data veche". Verify §12.3.

### §4-M4 — CSRF protection NOT applicable (no stateful endpoints in REST flow) but document
**Severity:** MED (§4.18)
**Evidence:** Firebase REST API requires ID token in query param — token = auth context. No session cookies → CSRF SameSite flag moot. Documented good practice in §31.11.
**Resolution:** Acceptable + document trust model.

### §4-M5 — `cache: 'no-store'` on fbGet prevents stale data caching ✓
**Severity:** MED — positive finding
**Evidence:** `src/firebase.js:80` `fetch(url, { cache: 'no-store' })`.
**Resolution:** Good practice; preserves freshness.

### §4-M6 — Refresh token rotation strategy NOT verified
**Severity:** MED (§4.3 + §31.5)
**Evidence:** `src/auth.js` exports `getIdToken()` with proactive refresh. Refresh token assumed long-lived. Firebase Identity Toolkit allows refresh token revocation via signOut. NOT verified: does signOut explicitly call `accounts:signOut` REST endpoint?
**Fix log:** Read full src/auth.js + verify signOut implementation calls Firebase revoke. Audit secondary pass.

---

## LOW findings

### §4-L1 — `device-id` uses `Math.random` (non-cryptographic) — acceptable for non-security identifier
**Severity:** LOW (§4.10 cross-tab)
**Evidence:** `src/firebase.js:75` `id = 'dev-' + Math.random().toString(36).slice(2,10)`. Identifier used for analytics/dedup, not for auth secrets.
**Resolution:** Acceptable. Migrate to `crypto.randomUUID()` post-Beta for forward-looking randomness quality (no security implication).

### §4-L2 — Firestore rules telemetry counter HasOnly enumerated keys ✓ (positive finding)
**Severity:** LOW — positive (§4.32 quota awareness + §17.3)
**Evidence:** `firestore.rules:68-75` `request.resource.data.keys().hasOnly([... 14 counter keys ...])`. Locks down to known telemetry counters → cannot abuse arbitrary writes.

### §4-L3 — RTDB rules minimal `users/$uid` only ✓ — good default-deny
**Severity:** LOW — positive (§4.2)
**Evidence:** `database.rules.json` per-UID strict only on `/users/$uid` path. All other paths default-deny per Firebase RTDB rule cascade. Tight surface.

---

## NIT findings

### §4-N1 — Sentry `console.log` debug calls in production path
**Evidence:** `src/util/sentry.js:31` `console.log('[Sentry] beforeSend:', ...)`. Already covered by §1-C2 console strip recommendation.

### §4-N2 — `_origin()` helper called for default continueUrl — implementation undisclosed in sample
**Resolution:** Likely `() => window.location.origin`. Verify.

---

## Coverage map §4.x sub-checklist

| Sub | Title | Status | Severity |
|-----|-------|--------|----------|
| 4.1 | XSS innerHTML/dangerouslySetInnerHTML | §4-M1 — clean React; legacy only | MED |
| 4.2 | Firebase rules production-grade | firestore.rules ✓; §4-C6 manual publish drift | CRITICAL |
| 4.3 | Magic Link vulnerabilities | §4-H2 + §4-H3 + §4-M2 + §4-M6 | HIGH |
| 4.4 | OAuth Phase 3 PENDING verify | NEED READ §31 deferred; PRIMER §3 says PENDING — verify NU partial wired | covered §31 |
| 4.5 | localStorage/IndexedDB exposure | §4-C4 + §4-H2 | CRITICAL |
| 4.6 | CSP headers | §4-C3 — ABSENT | CRITICAL |
| 4.7 | SW scope + cache | §4-H7 — dual SW conflict | HIGH |
| 4.8 | npm audit + snyk | §4-H1 — 4 moderate dev-only | HIGH |
| 4.9 | Bundle secrets/env leak | §4-C2 placeholder API key + §4-H5 hardcoded Sentry DSN + §4-H4 hardcoded Firebase URL | CRITICAL |
| 4.10 | Cross-tab session race | NOT AUDITED (deferred — Zustand persist + storage event verify §14) | covered §14 |
| 4.11 | IndexedDB quota | §4-M3 — not verified | MED |
| 4.12 | Encryption at rest | Not implemented; rely on platform (Android FDE + Firebase). DOCUMENT trust model. | MED secondary |
| 4.13 | CDL append-only tamper-proof | NEED READ src/util/coachDecisionLog.js — covered §8 + §12 | covered §8 |
| 4.14 | GDPR right-to-erasure | SettingsDanger Phase 6 task_17 LANDED — verify functional §28 | covered §28 |
| 4.15 | k-anonymity k=5 | telemetry counters limited keys ✓ §4-L2; k=5 verify per-event documented §17 | covered §17 |
| 4.16 | Magic Link rate limiting | §4-H3 | HIGH |
| 4.17 | X-Frame-Options | §4-C3 batch — absent | CRITICAL |
| 4.18 | CSRF | §4-M4 — moot architecture-level | MED |
| 4.19 | Magic Link replay | NOT VERIFIED — Firebase enforces oobCode single-use (verify w/ test) | MED secondary |
| 4.20 | Session hijack simulation | NOT TESTED LIVE | MED secondary |
| 4.21 | Open redirect | §4-M2 — verify Firebase authorized domains | MED |
| 4.22 | Path traversal | N/A (no file upload, no path operations) | — |
| 4.23 | HSTS preload | §4-C3 batch — absent | CRITICAL |
| 4.24 | Mixed content | NEED VERIFY: any http://* in source — grep | LOW |
| 4.25 | Subdomain takeover | DNS orphan scan TBD via dnsrecon — out of audit scope | — |
| 4.26 | SRI | §4-H6 — N/A no third-party scripts; Google Fonts indirect | HIGH (process) |
| 4.27 | Referrer-Policy | §4-C3 batch — absent | CRITICAL |
| 4.28 | Permissions-Policy | §4-C3 batch — absent (deny camera/mic/geo default) | CRITICAL |
| 4.29 | X-Content-Type-Options nosniff | §4-C3 batch — absent | CRITICAL |
| 4.30 | COOP/COEP/CORP | §4-C3 batch — absent (less critical for SPA but defense-in-depth) | MED |
| 4.31 | OWASP Top 10 cumulative | A01 access control = Firebase rules §4-C6; A02 crypto failures = §4-C4 token storage; A03 injection = §4-C3 CSP; A05 misconfig = §4-C3 batch; A07 auth = §4-H3; A09 logging = §4-C1 Sentry dead; OWASP coverage HEAVY GAPS | CRITICAL |
| 4.32 | Firebase Spark quota awareness | Spark plan limits documented; telemetry counter limited ✓ | LOW |
| 4.33 | Auth state listener cleanup | NOT AUDITED — verify §14 | covered §14 |
| 4.34 | Storage rules deny-by-default | Firebase Storage rules NOT IN REPO (no storage.rules file). VERIFY Firebase Console. | HIGH secondary |

## Karpathy 4 principii distribution §4

- Think Before Coding: 5 (C1, C2, C4, H2, M6)
- Simplicity First: 1 (M1)
- Surgical Changes: 5 (C3, C5, H3, H4, H5)
- Goal-Driven Execution: 4 (C1, C6, H1, H6)
