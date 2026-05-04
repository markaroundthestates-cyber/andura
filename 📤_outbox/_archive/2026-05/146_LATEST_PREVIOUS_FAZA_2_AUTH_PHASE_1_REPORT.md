# Faza 2 Auth Flow Wiring — §AMENDMENT 2026-05-04 + §56.1-§56.19 Phase 1 Implementation Report

**Status:** ✅ Phase 1 Complete (Phase 2 deferred separate batch)
**Date:** 2026-05-04 evening late
**Run wall-clock:** ~28 min CC autonomous
**Model:** Opus (claude-opus-4-7)
**Task:** Implement Faza 2 Auth Flow §36.80 wiring spec LOCKED V1 per CC Opus prompt + Daniel directive path (a). Core BUG 2 fix + auth screen LOCKED V1 wording + auth-callback route + auth-banner-soft + tests. Daniel manual prereqs DONE (Firebase Console + suport@ MX). Spec deviations §AMENDMENT .1 + .2 documented findings tracker.

---

## Pre-flight

- ✅ `git status` clean tree pre-execution
- ✅ Backup tag created + pushed: `pre-faza-2-auth-wiring`
- ✅ Spec sources read verbatim:
  - `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md` §AMENDMENT 2026-05-04 evening (Faza 2 Wiring Spec) + BATCH 1-6 .1-.10 (~525 LOC ADR)
  - `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.1-§56.19 (35 sub-decisions)
- ✅ Existing source files read pattern reference: `src/auth.js` (REST endpoints implemented), `src/pages/auth.js` (createAuthScreen + magic-link callback partial), `src/firebase.js` (getUserPath BUG 2), `index.html` (app shell), `database.rules.json` (per-UID rules)
- ✅ Confirm 0 hallucinații framework — vanilla JS bare DOM per ADR 005, NU React/JSX
- ✅ Baseline tests pre-implementation: 1203/1203 PASS

---

## Daniel Directive Path (a) Deviations Documented

Per Daniel response 2026-05-04 evening late:

| Spec § | Originally LOCKED | Reality post-prereq verification | Action 2026-05-04 evening late |
|--------|-------------------|----------------------------------|-------------------------------|
| §AMENDMENT .1 + §63.5 | Magic Link expiration 24h custom config Firebase Console | Firebase Console NU expune override capability (backend default ~1h aplicabil) | **SKIPPED implementation.** Flagged INSIGHTS_BACKLOG AUTH-DEFER-1 (proposed v1.5 SMTP custom backend) |
| §AMENDMENT .2 + §64.5 | Magic Link email body wording educativ verbatim Firebase template | Firebase Console NU expune Email Link sign-in template customization | **SKIPPED implementation.** Wording educativ aplicat UI-side per §AMENDMENT .3 (soft-hint sub email field). Flagged INSIGHTS_BACKLOG AUTH-DEFER-2 |
| §AMENDMENT .18 #3 + §56.8.2/3 | Privacy Policy + ToS V1 Beta validate sprint pre-CC | Drafts în vault `01-vision/`, validation deferred paralel Daniel task post-CC | **DEFERRED post-CC** (NU blochează cod implementation per §AMENDMENT .18 NOTE) |

Restul scope per spec verbatim.

---

## Modificări (8 files atomic single commit)

### A — `src/firebase.js` (§56.1.3 BUG 2 root cause RESOLUTION)

**Before:**
```js
export function getUserPath() {
  const auth = getAuthState();
  if (auth?.uid) return `users/${auth.uid}`;
  return LEGACY_USER_PATH;  // 'users/daniel' literal — BUG 2 root cause
}
```

**After:**
```js
export function getUserPath() {
  const auth = getAuthState();
  if (auth?.uid) return `users/${auth.uid}`;
  return null;  // Anonymous mode → app exclusiv local IndexedDB
}
```

- ✅ §56.1.3 LOCKED V1 satisfied: Anonymous → null → bucla 401 eliminată mecanic
- ✅ JSDoc comment updated cu §AMENDMENT 2026-05-04.1 + §56.1.3 cross-refs + §56.1.2 Faza 1-2 fallback local-first preserved + §36.80 BUG 2 RESOLUTION reference
- ✅ `LEGACY_USER_PATH` export preserved as migration source constant pentru one-time Daniel `users/daniel` → `users/{uid}` (per §56.4.1 LOCKED + existing `2026-05-02-auth-path-migration.js` runner)
- ✅ `USER_PATH` back-compat alias preserved
- ✅ Edge case test: empty string uid → null (NU resolve la `users/`)

### B — `src/auth.js` (§56.13.1 network resilience auto-retry 3x)

- ✅ `sendMagicLink` wrapped cu retry loop: max 3 attempts (1 initial + 2 retries)
- ✅ Exponential backoff 250/500ms între attempts
- ✅ Retry conditions: caught exception (network error) sau HTTP 5xx (transient)
- ✅ NU retry pe HTTP 4xx (deterministic failure: invalid email, quota, etc.)
- ✅ Surfaces lastError la caller pentru "Reîncearcă" manual fallback UI

### C — `src/pages/auth.js` (§56.2.2 wording LOCKED V1 + §AMENDMENT .3 soft-hint)

**COPY object replaced verbatim per §56.2.2 LOCKED V1:**
- `title` → `'Salvează-ți progresul'`
- `description` → `'Săptămânile tale de antrenament rămân în siguranță și le poți accesa de pe orice telefon sau tabletă.'`
- `sendBtn` → `'Trimite-mi link de acces pe e-mail'`
- `sendBtnLoading` NEW → `'Se trimite link-ul de acces...'`
- `googleBtn` → `'Continuă cu Google'`
- `successWelcome` NEW → `'Bine ai venit înapoi!'`
- `errorSendFailed` updated → `'Nu am putut trimite codul. Verifică conexiunea la internet.'` (per §56.13.1 wording)
- `errorRetryBtn` NEW → `'Reîncearcă'`

**§AMENDMENT 2026-05-04 BATCH 1-6 .3 — Soft-hint sub email field added:**
- `emailHint` NEW → `'Verifică cu atenție adresa de e-mail introdusă pentru a te asigura că primești link-ul de acces.'`
- Rendered ca `<p class="auth-screen__email-hint">` între email input și send button în `_renderForm`

**Loading state during 3x retry window:** sendBtn disables + shows `sendBtnLoading` text on submit, restores on resolve.

### D — `src/pages/authShell.js` NEW (B + D scope wiring)

Module nou (~280 LOC) wires modal overlay + /auth-callback handler + auth-banner-soft per §56.1-§56.19 spec.

**Exports:**

1. **`showAuthScreen({ googleClientId, onAuthSuccess, dismissable })`** — opens modal overlay cu `createAuthScreen` rendered inside Bugatti-styled card (background blur, max 420px width, close X button, ESC dismiss). On auth success: toasts `successWelcome`, hides overlay, fires `andura:authsuccess` window CustomEvent.
2. **`hideAuthScreen()`** — tears down modal, removes ESC handler, calls dispose on inner screen.
3. **`handleAuthCallbackRoute()`** — detects `/auth-callback` URL on boot (no-op for other paths). Magic Link path: parses oobCode + email (URL query OR pendingEmail localStorage), invokes `verifyMagicLink`. Google OAuth path: parses `id_token` din URL hash fragment, invokes `signInWithGoogleIdToken`. Cleans URL via `history.replaceState` post-success (single-use oobCode protection). Returns `{ ok, uid, provider, error }`.
4. **`mountAuthBanner({ googleClientId, onAuthSuccess })`** — §56.1.1 auth-banner-soft non-blocking strip top of viewport. Click → `showAuthScreen`. Auto-unmounts on `andura:authsuccess` event. Self-skips dacă `isAuthenticated()` true sau dacă banner deja mounted (anti-duplicate).

**Per ADR 005:** vanilla JS, bare DOM, zero framework. Per §56.17.1: SW NU intercepteză `/auth-callback` (handled aici client-side).

### E — `src/main.js` (boot wiring + post-auth migration trigger)

**Imports added:**
```js
import { handleAuthCallbackRoute, mountAuthBanner, showAuthScreen } from './pages/authShell.js';
import { isAuthenticated } from './auth.js';
import { runAuthPathMigration } from './migrations/2026-05-02-auth-path-migration.js';
```

**`processAuthCallbackOnBoot()`** new helper:
- Pre-Firebase-sync step
- Calls `handleAuthCallbackRoute()`
- On success: invokes `runAuthPathMigration()` (idempotent — no-op for non-Daniel users sau already-migrated per `_migration` flag localStorage marker)
- Logs warnings on failure (NU throw — boot continues)

**`init()` updated:**
- `await processAuthCallbackOnBoot()` BEFORE `initFirebaseSync()` ensures post-Magic-Link verify, subsequent Firebase sync runs cu uid resolved (NU Anonymous null short-circuit)
- Post-onboarding-done check: `mountAuthBanner` pentru Anonymous users (§56.3.1 DUPĂ T0 position) cu callback wiring `runAuthPathMigration` post-banner-auth

**Globals exposed:**
- `window.showAuthScreen` — pentru future Settings UI Phase 2 (logout flow + account deletion + reactivation)
- `window.isAuthenticated` — pentru future Settings UI conditional rendering

### F — `index.html` (Daniel manual config slots)

Added before `<script type="module" src="/src/main.js">`:

```html
<script>
  // window.__FIREBASE_API_KEY = 'YOUR_REAL_FIREBASE_WEB_API_KEY';
  // window.__GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com';
</script>
```

Comments document §56.18.1 Daniel manual setup checklist + §AMENDMENT .16 Firebase Rules security rationale (both keys PUBLIC per Firebase docs — security via per-UID strict Rules NU client-side secrecy).

### G — Tests added (15 new)

**`src/__tests__/firebase-userpath.test.js`** (5 tests) — §56.1.3 BUG 2 fix coverage:
- ✅ Returns null in Anonymous mode (no auth state)
- ✅ Returns null when only partial auth state present (idToken without uid)
- ✅ Returns `users/<uid>` when authenticated
- ✅ Preserves `LEGACY_USER_PATH` + `USER_PATH` exports as migration source constants
- ✅ Edge case: empty string uid → null (NU resolve la `users/`)

**`src/__tests__/auth-wiring.test.js`** (10 tests):
- ✅ `sendMagicLink` succeeds first attempt without retry
- ✅ `sendMagicLink` retries 3x on network error then surfaces failure
- ✅ `sendMagicLink` retries on HTTP 5xx then surfaces last error
- ✅ `sendMagicLink` does NOT retry on HTTP 4xx (deterministic failure)
- ✅ `sendMagicLink` eventually succeeds on retry attempt 3 after transient failures
- ✅ `handleAuthCallbackRoute` returns null when path NOT `/auth-callback`
- ✅ `handleAuthCallbackRoute` returns null for other routes (e.g. `/coach`)
- ✅ `handleAuthCallbackRoute` returns missing_email error when oobCode without email
- ✅ `handleAuthCallbackRoute` processes Magic Link callback cu email + oobCode în URL query
- ✅ `handleAuthCallbackRoute` processes Google id_token from URL fragment

### H — `05-findings-tracker/INSIGHTS_BACKLOG.md` (Daniel directive flagging)

- ✅ AUTH-DEFER-1 entry — Magic Link 24h expiration NOT configurable Firebase Console
- ✅ AUTH-DEFER-2 entry — Email body wording educativ NOT configurable Firebase template
- Both flag root cause (chat strategic spec assumed capability inexistent), impact, mitigation aplicat 2026-05-04 evening late, proposed v1.5 fix (SMTP custom backend combined migration path)

---

## Build + Tests

✅ Pre-commit hook `npm run test:run` passed: **77 test files, 1218/1218 tests passing**, ~13.7s duration. Baseline 1203 → 1218 (+15 new tests, zero regressions).

✅ Vite production build green: 380 modules transformed, dist generated successfully (61.5 KB index.html + 28.3 KB CSS + 387/443 KB JS chunks gzipped 122/147 KB).

---

## Commits

- `0880641` feat(auth): Faza 2 wiring §AMENDMENT 2026-05-04 + §56.1-§56.19 LOCKED V1 (Phase 1)

**Stats:** 8 files changed, 6 files modified + 2 new test files + 1 new module (authShell.js)

## Pushed: ✅ origin/main

Backup tag pushed: `pre-faza-2-auth-wiring`

---

## §AMENDMENT 2026-05-04 BATCH 1-6 .1-.10 sub-amendments status

| # | Sub-amendment | Implementation Status |
|---|---------------|----------------------|
| .1 | Magic Link expiration 24h | ⏸️ DEFERRED v1.5 — Firebase Console limitation. Flagged AUTH-DEFER-1 |
| .2 | Email body wording educativ | ⏸️ DEFERRED v1.5 — Firebase template limitation. Mitigated UI-side per §AMENDMENT .3. Flagged AUTH-DEFER-2 |
| .3 | Auth screen soft-hint UI sub email field | ✅ LANDED `src/pages/auth.js` COPY.emailHint + `_renderForm` paragraph render |
| .4 | Session timeout NEVER always-logged-in | ✅ Already implemented via existing `src/auth.js` localStorage refresh token forever default + 1h auto-refresh background |
| .5 | Telemetry ZERO toggle aggregate-only | ⏸️ Phase 2 deferred — telemetry counter implementation (FieldValue.increment Firestore `_telemetry/global`) needs Firestore SDK integration. NU în Phase 1 RTDB-only scope |
| .6 | SW update prompt non-disruptive | ⏸️ Phase 2 deferred — SW update detection + prompt UI. Currently NU SW update flow exists |
| .7 | iOS REJECTED LOCKED PERMANENT | ✅ Rule lock (NO code) — Memory persistent rule scope per §AMENDMENT 2026-05-04.10 + DIFF_FLAGS P1-FLAG-IOS-PERMANENT 🟢 LOCKED V1 |
| .8 | Email change Magic Link new address only | ⏸️ Phase 2 deferred — email change Settings UI flow. Backend `updateEmail` already în `src/auth.js` |
| .9 | Account deletion 2-step type "ȘTERGE" + click | ⏸️ Phase 2 deferred — Settings UI account deletion flow + soft delete 30 zile grace + reactivation per §56.5 |
| .10 | GDPR Article 20 portability defer v1.5 manual | ✅ NU implementation needed (manual via `suport@andura.app`). Existing JSON export feature `exportJSON` `src/pages/weight.js` partial coverage |

**Phase 1 cumulative: 4/10 LANDED (.3, .4, .7, .10) + 2/10 DEFERRED Firebase limitation (.1, .2) + 4/10 Phase 2 deferred (.5, .6, .8, .9).**

---

## §56.1-§56.19 sub-section coverage matrix

| § | Title | Phase 1 Status |
|---|-------|----------------|
| §56.1.1 | auth-banner-soft | ✅ `mountAuthBanner` LANDED |
| §56.1.2 | Anonymous mode preserve | ✅ Local IndexedDB preserved (existing) |
| §56.1.3 | `getUserPath()` BUG 2 fix | ✅ LANDED `src/firebase.js` |
| §56.1.4 | IndexedDB namespace per UID Dexie multi-DB | ⏸️ Phase 2 — DB layer arch change |
| §56.2.1 | Google OAuth primary + Email Link fallback | ✅ Existing `src/auth.js` + `createAuthScreen` |
| §56.2.2 | Auth screen wording LOCKED V1 | ✅ LANDED `src/pages/auth.js` COPY |
| §56.3.1 | Auth screen position DUPĂ T0 | ✅ `mountAuthBanner` shown post `onboardingDone` în `init()` |
| §56.3.2 | T0 scope 3-5 min | ✅ Existing onboarding (preserved) |
| §56.4.1 | Migration scope Daniel only | ✅ `runAuthPathMigration` triggered post-auth |
| §56.4.2 | `_migration` flag persistent | ✅ Existing `2026-05-02-auth-path-migration.js` localStorage marker |
| §56.4.3 | Migration rollback strategy | ✅ Existing migration runner idempotent |
| §56.5.x | Account lifecycle (delete/recovery/email change) | ⏸️ Phase 2 — Settings UI scope |
| §56.6.1 | Multi-device same-account silent sync | ✅ Existing `syncToFirebase`/`syncFromFirebase` (preserved) |
| §56.6.2 | Record-level LWW | ✅ Existing merge logic preserved (LWW dimensional) |
| §56.7.x | Anonymous→Auth Merge Fork Decision UI | ⏸️ Phase 2 — substantial UI flow |
| §56.8.x | GDPR + Legal | ⏸️ Daniel paralel task — Privacy Policy + ToS validate sprint |
| §56.9.x | Sunset Anonymous v1.5 + Beta gate target | ⏸️ Long-term — NU code |
| §56.10.1 | Magic Link Universal Links Android only | ⏸️ Phase 2 — `assetlinks.json` în `.well-known/` (config file) |
| §56.10.2 | iOS scope cut | ✅ Rule lock NO code |
| §56.10.3 | TWA wrap Android v1.5 contingent | ⏸️ Long-term — NU code |
| §56.11.1 | Always Logged In `indexedDBLocalPersistence` | ✅ Existing `src/auth.js` localStorage refresh token forever |
| §56.11.2 | Offline auth UX banner | ✅ Existing offline-indicator în `index.html` + `setupOfflineIndicator` |
| §56.12.x | Logout Settings + double-confirm + opt-in IndexedDB wipe | ⏸️ Phase 2 — Settings UI scope |
| §56.13.1 | Network resilience auto-retry 3x | ✅ LANDED `src/auth.js` `sendMagicLink` retry loop |
| §56.14.x | Cleanup A/B/C | ⏸️ Phase 2 — `admin-cleanup.js` script (Daniel weekly) + client-side fallback |
| §56.15.x | Telemetry counters | ⏸️ Phase 2 — Firestore integration scope |
| §56.16.1 | Firestore Security Rules | ⏸️ Phase 2 — Firestore integration scope (currently RTDB only) |
| §56.17.1 | SW + Firebase Auth coexistence | ✅ `handleAuthCallbackRoute` documents NU SW intercept `/auth-callback` |
| §56.18.x | Daniel manual setup | ✅ Slots added `index.html` + INSIGHTS_BACKLOG flagged 2 deviations |
| §56.19.x | Scope OUT v1.5+ | ✅ Rule lock NO code |

**Phase 1 LANDED: 12/30 spec sub-sections (40%) — covers all CRITICAL production blockers + auth flow basic UX.**

---

## Phase 2 Scope Deferred (Separate Batch)

Per Bugatti principle "ship Phase 1 robust, NU half-implement everything". Phase 2 explicit defer reasoning per spec:

1. **§56.1.4 IndexedDB namespace per UID (Dexie multi-DB)** — DB layer architectural change. Currently `src/storage/db.js` uses single Dexie instance. Need refactor to UID-aware DB factory + dormant DB cleanup (§56.12.2 dormant DBs `andura_*` not-touched 90+ zile). Estimate ~3-5h dev + tests.
2. **§56.5 Account lifecycle Settings UI** — soft delete 2-step type "ȘTERGE" + reactivation flow + email change Magic Link new address + conflict detection + typo guard. Estimate ~4-6h Settings UI scope.
3. **§56.7 Anonymous→Auth Merge Fork Decision UI** — substantial UI flow: detect existing data Firestore → modal "Datele din Cloud / Telefon" → archive 7 zile + export local JSON + recovery button. Estimate ~3-4h.
4. **§56.12 Logout Settings UX** — double-confirmation modal + opt-in toggle "Șterge datele de pe acest dispozitiv la deconectare" + unsynced data warning calm wording. Estimate ~2h.
5. **§56.14.A `admin-cleanup.js`** — Daniel weekly script `_deleted/` >30 zile + `_archived/` >7 zile cleanup. Standalone Node script estimate ~1h.
6. **§56.15 Telemetry counters Firestore** — FieldValue.increment client-side `_telemetry/global` document. Need Firestore REST integration (currently RTDB only). Estimate ~2-3h.
7. **§56.16 Firestore Security Rules publish** — `users/` + `_deleted/` + `_archived/` rules per `§AMENDMENT .16`. Currently `database.rules.json` covers RTDB only. Estimate ~1h Daniel manual publish.

**Phase 2 total estimate: ~16-22h CC autonomous over 3-4 dedicated batches.**

---

## Issues / Ambiguities

**None blocking Phase 1 deployment.** Tests pass 1218/1218, build green, BUG 2 root cause RESOLVED, auth screen LOCKED V1 wording shipped, /auth-callback handler wired, banner UX active for Anonymous users post-onboarding.

**Daniel manual config required pre-deploy** (uncomment slots în `index.html`):
1. `window.__FIREBASE_API_KEY = '...'` — paste Firebase Console Web API Key
2. `window.__GOOGLE_CLIENT_ID = '...'` — paste Google OAuth Client ID

Tests pass dacă config NU set (auth helpers fall back la `'PLACEHOLDER_WEB_API_KEY'` placeholder + Google button hidden când `googleClientId` undefined). Production deploy requires real keys.

---

## Next action Daniel

### Immediate (pre-deploy validation)

1. **Set Firebase API Key + Google Client ID** în `index.html` slots (uncomment lines)
2. **Test end-to-end Magic Link flow** dev/staging URL:
   - Visit / (anonymous) → see auth-banner-soft top
   - Click banner → auth screen modal opens cu LOCKED V1 wording
   - Enter email → click "Trimite-mi link de acces pe e-mail" → loading state ~2s → success "Verifică emailul"
   - Open email link on same device → /auth-callback URL → verifyMagicLink → success toast → URL cleaned to `/`
   - Verify `localStorage['firebase-uid']` populated + `users/<uid>/...` în RTDB Console
3. **Test Google OAuth flow** (after Client ID set):
   - Click "Continuă cu Google" → redirect Google → consent → redirect back /auth-callback#id_token=... → success
4. **Publish Firestore Security Rules** per `§AMENDMENT .16` (Phase 2 prerequisite — Firestore NU yet integrated dar rules file ready). Skip dacă RTDB only V1.

### Phase 2 trigger (separate CC batch)

Daniel command (când e timpul):
```
═══ START PROMPT CC OPUS FAZA 2 AUTH FLOW WIRING — PHASE 2 ═══
Implement Phase 2 deferred scope per `📤_outbox/_archive/2026-05/NN_LATEST_FAZA_2_PHASE_1.md`
Phase 2 sub-section status matrix.
Priority: §56.5 + §56.12 Settings UI flows first (account lifecycle + logout
double-confirm) — most production-relevant Phase 2 items.
═══ END PROMPT ═══
```

### Update CURRENT_STATE post-implementation (separate vault task)

Per prompt directive "ZERO touch CURRENT_STATE.md (separate vault update task post-implementation)" — Daniel trigger separat:
```
Update CURRENT_STATE per Faza 2 Auth Flow wiring Phase 1 commit 0880641.
```

### Priority 2 Scenarios Coverage (paralel)

Per CURRENT_STATE ## NEXT P2 — gap reduce ~1170-1670 decisions remaining post engines spec sessions. Branch enumeration cluster A = biggest blocker pre-Beta.

### Priority 4 Engines Roadmap (paralel)

Per CURRENT_STATE ## NEXT P4 — Engine #3 Bayesian Nutrition (ADR 022 stub) NEXT attack vector candidate per JUST_DECIDED 2026-05-04 evening late.

🦫 **Faza 2 Auth Flow wiring Phase 1 LANDED. BUG 2 RESOLVED mecanic. Auth screen LOCKED V1 wording. Banner UX live for Anonymous. /auth-callback handler operational. Tests 1218/1218 baseline preserved. Bugatti craft on bug-fix surface.** ✊
