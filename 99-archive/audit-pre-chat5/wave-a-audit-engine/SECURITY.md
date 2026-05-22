# Wave A Security Audit — 2026-05-21 autonomous overnight

**Auditor:** Claude Code Opus (autonomous, overnight)
**Branch:** main (33 commits ahead origin/main)
**Scope:** §A015 + §A016 + §A017 + §A018 + §A007 + §A025 + GDPR erasure + Sentry PII
**Out of scope:** Pre-Wave-A code (Phase 7 already audited), A011-A012 bundle code-split (not touched), A005-A010 missing UI (no code).

---

## Threat 1: Magic Link replay attack

**Mitigation status:** PASS

**Evidence:**
- `src/auth.js:127-147` `verifyMagicLink(email, oobCode)` posts `oobCode` to Firebase REST `accounts:signInWithEmailLink`. Firebase enforces single-use server-side (oobCode is consumed atomically; second use returns `INVALID_OOB_CODE` from Firebase Identity Toolkit). NU client-side cache replay risk.
- `src/auth.js:141-142` clears `pendingEmail` + `pendingEmailExpiry` localStorage on success — prevents replay of stale email param.
- `src/react/routes/screens/AuthCallback.tsx:23-32` validates both `oobCode` AND `email` present before calling verify; missing → redirect `/auth?error=missing_params`.
- URL email param sanitization: `parseMagicLinkUrl` (src/auth.js:156-165) uses `URLSearchParams` (browser-native parser, NU eval/regex). Email value passed straight to Firebase REST as JSON body — Firebase validates email format server-side.

**Residual risk:** Network MITM on continueUrl redirect — mitigated by HTTPS-only `andura.app` deployment (out of scope: deploy infra, not Wave A code). Firebase oobCode TTL = 15min (UI string `Auth.tsx:68` "Linkul expira in 15 min" reflects Firebase default).

---

## Threat 2: Token freshness gate bypass (§A016)

**Mitigation status:** PASS

**Evidence:**
- `src/auth.js:51-54` defines `AUTH_FRESHNESS_WINDOW_MS = 5 * 60 * 1000` (5 min).
- `src/auth.js:376-380` `isAuthFresh()` reads `lastAuthAt` from localStorage; returns false if missing OR `Date.now() - lastAuthAt > 5min`.
- `src/auth.js:354-366` `_persistAuth` sets `lastAuthAt = Date.now()` ONLY on real Firebase REST `_persistAuth` call (post Magic Link verify OR Google OAuth OR token refresh).
- `src/react/routes/screens/cont/SettingsDanger.tsx:62-71` `handleDeleteConfirmed` calls `isAuthFresh()` BEFORE wipe; stale → `authSignOut()` + navigate `/auth?reason=reauth_required_for_delete`.

**Bypass attempts:**
- Attacker tampers `firebase-last-auth-at` localStorage to recent value → mitigation: this is client-side gate only; Wave A explicitly client-side V1 (per comment line 3 SettingsDanger). Real defense requires server-side re-auth on `accounts:delete` REST (out of scope V1 per "ZERO server-side delete V1" comment).
- Refresh token flow: `_persistAuth` on refresh ALSO resets `lastAuthAt` (line 365). Concern: if attacker has refresh token, they can refresh + appear fresh. Mitigation acceptable since refresh token compromise = full account takeover anyway.

**Residual risk:** localStorage tamper = client-side trust boundary. Pre-Beta acceptable (no server-side delete enforcement yet). Phase 7+ planned (line 3 + line 137 SettingsDanger).

---

## Threat 3: Onboarding gate bypass (§A015)

**Mitigation status:** PASS (client-side gate, intended scope)

**Evidence:**
- `src/react/routes/ProtectedRoute.tsx:22-59` enforces TWO gates in sequence:
  1. Line 53: `if (!isAuthenticated) return <Navigate to="/auth" replace />`
  2. Line 56: `if (!onboardingCompleted) return <Navigate to="/onboarding/1" replace />`
- `src/react/stores/onboardingStore.ts:49` `finalize: () => set({ completed: true, completedAt: Date.now() })` — `completed` flips ONLY via explicit finalize() call.
- Line 53 store persisted to `wv2-onboarding-store` localStorage.

**Bypass attempts:**
- Direct URL `/app/antrenor` without onboarding → ProtectedRoute redirects `/onboarding/1`. Verified.
- Store manipulation via DevTools (`localStorage.setItem('wv2-onboarding-store', '{"state":{"completed":true},"version":0}')`) → bypasses gate. EXPECTED — engine T0 baseline depends on Big 6 onboarding data. User who DevTools-spoofs `completed:true` without filling data gets degraded engine output (null age/sex/goal → engine baselines null). Pre-Beta acceptable.

**Residual risk:** Client-side store tamper = degraded engine (NOT data-loss, NOT auth-bypass). Out of scope to enforce server-side.

---

## Threat 4: Throttle bypass via localStorage clear (§A018)

**Mitigation status:** PARTIAL (client-side gate only)

**Evidence:**
- `src/auth.js:46-49` defines `MAGIC_LINK_THROTTLE_MS = 30 * 1000`.
- `src/auth.js:72-75` `sendMagicLink` calls `getMagicLinkCooldownMs()` BEFORE Firebase POST; cooldown>0 → returns `{ ok: false, error: 'throttle_cooldown' }`.
- `src/auth.js:315-321` reads `lastMagicLinkSent` from localStorage.

**Bypass:**
- Attacker clears localStorage `firebase-magic-link-last-sent` → bypasses 30s gate. CONFIRMED — code is purely client-side.
- Firebase Identity Toolkit has SERVER-SIDE quota limits (~5 send/hour per email per project default). Quota provides defense-in-depth.

**Residual risk:** Single-attacker quota exhaustion of victim email = possible (5/hr Firebase default). Not Wave A in-scope to add server-side rate-limit (would require Cloud Functions). Pre-Beta acceptable: throttle is UX gate (anti-double-click), NU adversarial primary defense.

---

## Threat 5: TTL evasion stale pendingEmail (§A017)

**Mitigation status:** PASS

**Evidence:**
- `src/auth.js:44` `PENDING_EMAIL_TTL_MS = 60 * 60 * 1000` (1h).
- `src/auth.js:99-100` `sendMagicLink` sets `pendingEmailExpiry = Date.now() + 1h` atomically with pendingEmail.
- `src/auth.js:330-340` `getPendingEmail()` validates expiry > now; stale → removes BOTH keys + returns null.
- `src/react/routes/screens/AuthCallback.tsx:25` uses `getPendingEmail()` (NOT raw localStorage) — TTL enforced at read time.

**Shared device scenario:** User A sends Magic Link 10:00, leaves device. User B at 11:30 (1.5h later) opens app → `getPendingEmail()` returns null + clears keys. User B cannot enumerate User A's email. PASS.

**Residual risk:** Within 1h window, User B can still enumerate User A's email via DevTools localStorage read. Mitigation: physical device security (out of scope).

---

## Threat 6: Logout confirm bypass (§A007)

**Mitigation status:** FAIL (BLOCKER — client-side cleanup incomplete)

**Evidence:**
- `src/react/routes/screens/cont/SettingsDanger.tsx:50-54` `handleLogoutConfirmed` flips ONLY `setAuthenticated(false)` React store; navigates `/auth`.
- **`authSignOut()` (src/auth.js:295-307) is NOT called.** Auth tokens `firebase-id-token`, `firebase-refresh-token`, `firebase-uid`, `firebase-id-token-expiry`, `firebase-last-auth-at` REMAIN in localStorage post-logout.
- `src/react/routes/ProtectedRoute.tsx:37-44` reactive sync: on next mount/visibilitychange, reads `isAuthenticated()` from localStorage tokens → if tokens present, sets `setAuthenticated(true)`. **Logout state reverts on next page navigation/tab focus.**

**Attack:**
1. User clicks "Iesi din cont" + confirms → React store says logged out, redirects /auth.
2. User opens new tab on andura.app → ProtectedRoute syncs, reads `firebase-id-token` still in localStorage → flips back to authenticated. **Logout effectively no-op cross-tab.**

**Backend:** Firebase Identity Toolkit refresh tokens have NO server-side revoke without Admin SDK (Wave A doesn't ship Cloud Functions). Even cleared client-side, refresh token remains valid server-side until natural expiry — known limitation. But cleaning localStorage is MINIMUM expected.

**Fix required:** `handleLogoutConfirmed` must call `authSignOut()` to clear all auth localStorage keys (lines 296-303 of src/auth.js). Same fix needed for `handleDeleteConfirmed` success path (line 73 only flips React store; does NOT clear auth tokens — only abort path line 66 calls `authSignOut`).

**Residual risk after fix:** Refresh token revoke server-side absent until Cloud Functions (Phase 7+). Acceptable pre-Beta if localStorage cleared.

---

## Threat 7: GDPR erasure completeness (§A027 wipeAllLocalData)

**Mitigation status:** PARTIAL (Tier 0 only; Tier 1 IndexedDB + Tier 2 Firebase NOT wiped)

**Evidence:**
- `src/react/routes/screens/cont/SettingsDanger.tsx:22-43` `wipeAllLocalData`:
  - Lines 25-31: Resets Zustand stores (workout, nutrition, onboarding, settings, schedule) — wipes IN-MEMORY state + persisted `wv2-*-store` localStorage entries.
  - Lines 34-39: Iterates localStorage, removes ALL keys starting with `wv2-`.
- **Tier 1 IndexedDB:** No `indexedDB.deleteDatabase()` call. Per UID IndexedDB (workout-history, nutrition-logs, biometrics) survives.
- **Tier 2 Firebase RTDB:** No `fetch(rtdbUrl, { method: 'DELETE' })` call. User data at `users/{uid}/*` persists in cloud.
- **Auth tokens:** NOT cleared (no `authSignOut()` call) — same bug as Threat 6.
- Self-acknowledged by code comments: line 3 "ZERO server-side delete V1 (Phase 7+...)" + line 137 SettingsDanger user-facing copy "Stergerea conturilor remote (Firebase backup) este programata Phase 7+. Acum reset/stergere afecteaza doar datele locale."

**GDPR Art. 17 (Right to Erasure) compliance:**
- Privacy Policy `SettingsPrivacy.tsx:122` states: "**Stergere:** sterge tot din Cont > Deconectare & stergere > Sterge cont" — implies COMPLETE deletion.
- Privacy Policy `SettingsPrivacy.tsx:131-133` admits: "Backup-ul Firebase RTDB (optional) pastreaza copie pana stergi contul. ZERO copie pe servere terte. Stergerea = imediata + permanenta."
- **Conflict:** Privacy Policy promises permanent deletion; implementation only wipes Tier 0 localStorage. Tier 1 IndexedDB + Tier 2 Firebase RTDB persist.

**Residual risk:** Pre-Beta GDPR exposure — Privacy Policy text claims more than implementation delivers. Either (a) update Privacy Policy to disclose "client-side only V1, server-side erasure Phase 7+" OR (b) implement IndexedDB + Firebase RTDB DELETE pre-Beta.

---

## Threat 8: PII logging via Sentry

**Mitigation status:** PASS (no PII captured by Wave A code; defensive Sentry config sound)

**Evidence:**
- `src/util/sentry.js:31-42` `beforeSend` filter passes through events but does NOT inject PII; only adds `source=firebase` tag for Firebase errors (line 38-40).
- No `Sentry.setUser({email, uid})` call anywhere in codebase (verified via grep — zero `setUser` matches in src/).
- `captureException` callers (12 files via grep): all pass `tags: { component, op }` — NO email/uid in context payloads. Sample: `coachDirector.js:282` `{ tags: { component: 'coachDirector', op: 'aa_cluster_route' } }`.
- `src/auth.js` does NOT call `captureException` — auth errors return as `{ ok: false, error }` objects, not logged to Sentry.
- Production console.log strip via vite esbuild §1-C2 (comment line 7 sentry.js).

**Residual risk:** If future code adds `captureException(err, { email })`, would leak. No automated PII scanner exists. Recommendation: add lint rule blocking `email`/`uid` keys in `captureException` second-arg (post-Beta).

---

## Verdict overall

- **BLOCKER count:** 1 (Threat 6 — logout does not clear auth tokens, reverts on tab focus via ProtectedRoute reactive sync)
- **MITIGATED count:** 5 (Threats 1, 2, 3, 5, 8)
- **PARTIAL count:** 2 (Threat 4 throttle client-side only — acceptable; Threat 7 GDPR partial — Privacy Policy vs implementation mismatch)
- **FAIL count:** 1 (Threat 6)

### Pre-Beta gate: NO-GO

**Reason:** Threat 6 logout bypass is a functional security defect, NU just hardening gap. User clicks "Iesi din cont" expecting logged-out state; tokens persist; next tab focus restores session. This is:
1. UX defect (user trust violation — "Iesi" doesn't actually exit).
2. Security defect (shared device: User A logs out, User B opens tab, sees User A's session restored).
3. GDPR-adjacent (Privacy Policy implies clean logout).

**Fix scope:** ~2 lines change `handleLogoutConfirmed` + `handleDeleteConfirmed` to call `authSignOut()` before/after React store flip. Also add `indexedDB.deleteDatabase('andura-tier1-{uid}')` calls in `wipeAllLocalData` for Threat 7 completeness — or update Privacy Policy to disclose client-only V1.

**Required actions before Pre-Beta:**
1. **BLOCKER:** Wire `authSignOut()` into `handleLogoutConfirmed` (SettingsDanger.tsx:50-54) + success path of `handleDeleteConfirmed` (line 72-75).
2. **HIGH:** Either implement Tier 1 IndexedDB wipe + Tier 2 Firebase RTDB DELETE in `wipeAllLocalData`, OR amend Privacy Policy to disclose Phase 7+ server-side erasure timeline explicitly (line 131 SettingsPrivacy.tsx needs honesty update).
3. **MEDIUM:** Document accepted residual risks (Threat 4 throttle quota, Threat 2 client-side trust) in DECISIONS.md as LOCKED accepted-risk entries pre-Beta.

### Threats CLOSED (no action needed)

| Threat | Status | Evidence path |
|--------|--------|---------------|
| 1 Magic Link replay | PASS | src/auth.js:127-147 + Firebase server-side oobCode |
| 2 Token freshness gate | PASS | src/auth.js:51-54, 376-380; SettingsDanger.tsx:62-71 |
| 3 Onboarding gate | PASS | ProtectedRoute.tsx:53-58; onboardingStore.ts:49 |
| 5 pendingEmail TTL | PASS | src/auth.js:44, 99-100, 330-340 |
| 8 Sentry PII | PASS | src/util/sentry.js; zero setUser/email in captureException calls |

### Threats requiring fix

| Threat | Status | File:lines |
|--------|--------|------------|
| 6 Logout bypass | BLOCKER | SettingsDanger.tsx:50-54 + 72-75 (missing authSignOut() call) |
| 7 GDPR erasure | PARTIAL | SettingsDanger.tsx:22-43 (Tier 1 IDB + Tier 2 RTDB not wiped) + SettingsPrivacy.tsx:122 vs 131 contradiction |
| 4 Throttle bypass | PARTIAL | src/auth.js:72-75 (client-side gate only — accepted risk) |

---

**Generated:** 2026-05-21 autonomous overnight audit, source files read concrete (no PK / no recall).
