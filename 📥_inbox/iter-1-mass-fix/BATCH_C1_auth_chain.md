---
title: BATCH_C1 — Auth Chain Wave 1 Critical
status: DESIGN_LANDED_PENDING_EXECUTION
wave: 1 (critical-path, blocks all Wave 2)
tasks: C001-C008 (8 atomic tasks)
eta: ~3-4h Opus continuous
trigger: Daniel paste this file in fresh CC session ACASĂ post design approve
---

# BATCH_C1 — Auth Chain Wire (Wave 1 Critical)

**Daniel paste prompt:** *"Execute BATCH_C1 per spec `📥_inbox/iter-1-mass-fix/BATCH_C1_auth_chain.md`. Read pre-flight + execute tasks C001-C008 sequential. Atomic commits per task. Push origin manual final post-BATCH."*

**Model:** Opus 4.7 EXCLUSIVELY (anti-fallback D029 invariant).
**Stop trigger UNIC:** Daniel explicit STOP signal.
**Procedure:** D031 per-task atomic commit + push manual final mirror.

---

## §0 Pre-flight BATCH (mandatory)

### §0.1 Branch + state verify

```powershell
git status                              # expect: clean OR known modified files (DECISIONS.md / LATEST.md)
git log -3 --oneline                    # confirm HEAD post-design-LANDED commit
git tag pre-batch-c1-auth-chain         # safety tag pre-execution
```

### §0.2 Tests baseline

```powershell
npm run test:run                        # expect: 4522 PASS (per D026 + post-Phase-7-fix `05d0859`)
```

If baseline RED → STOP. Investigate before proceeding (would mask BATCH-introduced regressions).

### §0.3 GitNexus impact analysis

```
gitnexus_impact({target: "Auth", direction: "upstream"})
gitnexus_impact({target: "ProtectedRoute", direction: "upstream"})
gitnexus_impact({target: "sendMagicLink", direction: "upstream"})
gitnexus_impact({target: "initSentry", direction: "upstream"})
```

Report blast radius to Daniel before C001 execution. Expected: HIGH risk (auth chain = entry point for all users) — Daniel acknowledges per directive *"se gandeasca si eventual sa imi faca"*.

### §0.4 Mockup + Audit primary-source read mandatory

Per D008 anti-halucinare:

- Read `📤_outbox/audit-nuclear-2026-05-19/findings-§07.md` lines 19-110 (§7-C1 + §7-C2 + §7-C3 verbatim)
- Read `📤_outbox/audit-nuclear-2026-05-19/findings-§04.md` lines 21-50 (§4-C1 Sentry init verbatim)
- Read `04-architecture/mockups/andura-clasic.html` Auth screen section (search "screen-auth")
- Read `src/auth.js` complete (vanilla sendMagicLink reference implementation)
- Read `src/react/routes/screens/Auth.tsx` complete
- Read `src/react/routes/ProtectedRoute.tsx` complete
- Read `src/main.tsx` complete
- Read `src/util/sentry.js` complete

---

## §1 Task C001 — Auth.tsx wire sendMagicLink

**Source:** NC§7-C2 + NC§31-C1 (cross-referenced reaffirmed)
**File:** `src/react/routes/screens/Auth.tsx:23-28`
**Karpathy:** Think Before Coding (engine integration entry-point) + Goal-Driven (auth = entry of all users)
**Effort:** M (~30min — type-safe import + async/await refactor + error toast UX)

### Implementation

1. `Auth.tsx` add import:
   ```ts
   import { sendMagicLink } from '../../../auth.js';
   // OR migrated TS path if BATCH_B1 vanilla archive landed first:
   // import { sendMagicLink } from '../../auth/sendMagicLink';
   ```
2. Refactor `handleSend`:
   ```ts
   async function handleSend(): Promise<void> {
     if (!isValidEmail(email)) return;
     try {
       setSending(true);
       const result = await sendMagicLink(email);
       if (result.ok) {
         setSent(true);
       } else {
         setError(result.error || 'Eroare la trimiterea link-ului. Verifica conexiunea si incearca din nou.');
       }
     } catch (e) {
       captureException(e); // post-C004 wire
       setError('Eroare neasteptata. Reincearca.');
     } finally {
       setSending(false);
     }
   }
   ```
3. Add `useState` for `sending`, `error` cu UI feedback (disable button + error banner).
4. Add `data-testid="auth-error-banner"` for E2E.

### Tests

`tests/react/auth/Auth.spec.tsx`:
- Mock sendMagicLink success → expect "Link trimis" rendered
- Mock sendMagicLink error.ok=false → expect error banner rendered + email input still editable
- Mock sendMagicLink throw → expect "Eroare neasteptata" + captureException called

### Commit

```
fix(C001-auth-magic-link): wire real sendMagicLink in Auth.tsx (NC§7-C2)

Closes audit nuclear §7-C2 + §31-C1. handleSend now calls
sendMagicLink from src/auth.js cu retry-aware error handling.
UI shows error banner if send fails; loading state during send.
```

### Verify

```powershell
gitnexus_detect_changes
npm run test:run -- Auth.spec
grep -n "await sendMagicLink" src/react/routes/screens/Auth.tsx
```

---

## §2 Task C002 — Auth.tsx Mock login DEV gate

**Source:** NC§7-C1 + NC§31-C2
**File:** `src/react/routes/screens/Auth.tsx:93-100`
**Karpathy:** Surgical Changes (single-line env gate)
**Effort:** S (~10min)

### Implementation

Wrap Mock login button:
```tsx
{import.meta.env.DEV && (
  <button
    type="button"
    onClick={handleMockLogin}
    data-testid="auth-mock"
    className="w-full mt-3 py-2 text-ink2 text-xs underline"
  >
    Mock login (dev)
  </button>
)}
```

### Commit

```
fix(C002-auth-mock-dev-gate): gate Mock login button by import.meta.env.DEV (NC§7-C1)

Closes audit nuclear §7-C1 + §31-C2. Production andura.app no longer
exposes auth bypass — DEV builds only. Anti-paternalism + brand voice
restored (no English jargon visible to prod users).
```

---

## §3 Task C003 — ProtectedRoute Firebase listener

**Source:** NC§7-C3 + NC§31-C3
**File:** `src/react/routes/ProtectedRoute.tsx`
**Karpathy:** Think Before Coding (Phase 2 stub closure)
**Effort:** M (~45min)

### Implementation

1. Read `src/auth.js` `getIdToken()` + token expiry tracking pattern.
2. ProtectedRoute mount useEffect:
   ```tsx
   useEffect(() => {
     const token = localStorage.getItem('firebase-id-token');
     const uid = localStorage.getItem('firebase-uid');
     const expiry = localStorage.getItem('firebase-id-token-expiry');
     if (token && uid && (!expiry || Date.now() < Number(expiry))) {
       setAuthenticated(true);
       setUid(uid);
     } else if (token) {
       // refresh stale token via getIdToken proactive refresh
       getIdToken().then(fresh => {
         if (fresh) setAuthenticated(true);
         else setAuthenticated(false);
       });
     } else {
       setAuthenticated(false);
     }
   }, [setAuthenticated, setUid]);
   ```
3. Add storage event listener for cross-tab sync (§14 / §4.10).
4. Cleanup on unmount.

### Tests

- MemoryRouter wrap; mock localStorage token → expect /app/* route accessible
- No token → expect Navigate to=/auth
- Expired token → expect getIdToken refresh attempt
- Cross-tab logout sim → expect Navigate to=/auth on storage event

### Commit

```
fix(C003-protectedroute-firebase-listener): wire real auth listener post-Phase-2-stub (NC§7-C3)

Closes audit nuclear §7-C3 + §31-C3. ProtectedRoute syncs Firebase
auth state from localStorage on mount + proactive refresh via getIdToken
+ storage event for cross-tab logout. Onboarding completion gate deferred
to C007 task next.
```

---

## §4 Task C004 — Sentry initSentry main.tsx + ErrorBoundary captureException

**Source:** NC§4-C1 + NC§17-C1 + NC§13-C1
**File:** `src/main.tsx` + `src/react/components/ErrorBoundary.tsx`
**Karpathy:** Goal-Driven (production observability mandatory pre-Beta)
**Effort:** M (~30min)

### Implementation

1. `src/main.tsx` add at top:
   ```ts
   import { initSentry } from './util/sentry.js';
   initSentry();
   ```
2. `ErrorBoundary.tsx:31` replace `console.error` cu:
   ```ts
   import { captureException } from '../../util/sentry.js';
   // ...
   componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
     captureException(error, { extra: { errorInfo, componentStack: errorInfo.componentStack } });
   }
   ```
3. Migrate Sentry DSN to `VITE_SENTRY_DSN` env var (depends on A128 — execute inline if A128 not yet LANDED).

### Tests

- Trigger error in test component → expect captureException invoked w/ correct payload shape

### Commit

```
fix(C004-sentry-init-wire): initialize Sentry in React main.tsx + ErrorBoundary captureException (NC§4-C1 + §17-C1 + §13-C1)

Closes audit nuclear §4-C1 + §17-C1 + §13-C1. Production andura.app
now reports React errors to Sentry. ErrorBoundary forwards
componentStack as extra context. VITE_SENTRY_DSN env-var-driven.
```

---

## §5 Task C005 — Sentry beforeSend remove Firebase exclusion

**Source:** NC§4-C5
**File:** `src/util/sentry.js:36`
**Karpathy:** Think Before Coding (silently dropping debugging signal = anti-debug)
**Effort:** S (~10min)

### Implementation

Replace:
```js
if (msg.includes('Firebase') || msg.includes('firebasedatabase')) return null;
```
With:
```js
if (msg.includes('Firebase') || msg.includes('firebasedatabase')) {
  scope.setTag('source', 'firebase');
}
```

### Commit

```
fix(C005-sentry-firebase-tag-not-drop): tag Firebase errors instead of dropping (NC§4-C5)

Closes audit nuclear §4-C5. Firebase quota / rate-limit / network 5xx
errors are PRECISELY production signals we want — beforeSend now
tags scope.source=firebase instead of returning null.
```

---

## §6 Task C006 — AuthCallback verify + Magic Link finalize

**Source:** Iter 9.6 LANDED `07685c6` (related to §7-C2 closure)
**File:** `src/react/routes/AuthCallback.tsx` (verify exists post-iter-9.6)
**Karpathy:** Surgical Changes (post-iter-9.6 already LANDED — verify no regression)
**Effort:** S (~15min)

### Implementation

1. Read `src/react/routes/AuthCallback.tsx` + verify Magic Link finalize signature call (Firebase REST `signInWithEmailLink` equivalent).
2. If missing, add finalize per Firebase Auth REST `accounts:signInWithEmailLink` semantics.
3. Verify navigate to /app/antrenor on success + show error UX on failure.

### Commit (if no changes needed)

Skip commit if file already complete. Document `_progress.md` as "VERIFIED CLEAN" task.

### Commit (if changes needed)

```
fix(C006-authcallback-finalize): wire Magic Link finalize via Firebase REST (NC§7-* AuthCallback)

Closes Magic Link end-to-end. AuthCallback now finalizes via
signInWithEmailLink + persists tokens to localStorage + navigates
to /app/antrenor on success.
```

---

## §7 Task C007 — Onboarding T0 hard typing gate

**Source:** NC§28-* + NC§9-* (covered §31 part)
**File:** `src/react/routes/ProtectedRoute.tsx` (extend C003)
**Karpathy:** Think Before Coding (gate logic — onboarding-complete OR redirect-to-onboarding)
**Effort:** M (~30min)
**Dependency:** C003 LANDED first

### Implementation

ProtectedRoute extend C003 useEffect:
```tsx
const onboardingComplete = localStorage.getItem('andura-onboarding-complete') === 'true';
if (isAuthenticated && !onboardingComplete && location.pathname.startsWith('/app/')) {
  navigate('/onboarding/1', { replace: true });
}
```

Or in Layout / route guard depending on app structure (read first per D008).

### Commit

```
fix(C007-onboarding-gate): hard typing gate auth → onboarding T0 → /app (NC§28-* + §9-*)

Closes onboarding gate gap. Authenticated user without
onboarding-complete flag → redirected to /onboarding/1 on
/app/* access attempt. Anti-poll-not-fresh state.
```

---

## §8 Task C008 — SettingsDanger account-delete re-auth check

**Source:** NC§31-H4
**File:** `src/react/routes/screens/cont/SettingsDanger.tsx`
**Karpathy:** Surgical Changes (Firebase token freshness check OR re-prompt)
**Effort:** S (~20min)
**Dependency:** C003 LANDED first

### Implementation

Pre-delete handler check:
```tsx
const tokenExpiry = Number(localStorage.getItem('firebase-id-token-expiry') ?? 0);
const freshThreshold = 5 * 60 * 1000; // 5min Firebase recent-auth
if (Date.now() > tokenExpiry - freshThreshold) {
  // require re-Magic-Link OR show re-auth modal
  showReAuthModal();
  return;
}
// proceed cu accounts:delete
```

### Commit

```
fix(C008-settingsdanger-reauth): require recent auth pre-account-delete (NC§31-H4)

Closes audit §31-H4. Account deletion requires Firebase token
freshness ≤ 5min OR triggers re-Magic-Link UX. Anti-stale-token
sensitive-op safeguard.
```

---

## §9 Post-BATCH

### §9.1 Tests post-BATCH

```powershell
npm run test:run                          # expect: 4522 PASS preserved + new auth tests added (+8-12 assertions)
npm run test -- --testNamePattern Auth    # auth scope only verify
```

### §9.2 Manual smoke (Daniel)

1. Open localhost:5173/auth în browser (`npm run dev` first)
2. Paste real email → click "Trimite link"
3. Expect "Link trimis" toast + check email inbox (real send via Firebase)
4. Click Magic Link in email → expect /app/antrenor renders (post AuthCallback finalize)
5. Verify no Mock login button visible în prod build: `npm run build && npm run preview` → /auth → no "Mock login" button

### §9.3 GitNexus convergence verify

```
gitnexus_detect_changes
gitnexus_query({query: "auth"})
```

### §9.4 Tags + push

```powershell
git tag post-batch-c1-auth-chain
git push origin main
git push origin pre-batch-c1-auth-chain post-batch-c1-auth-chain
```

### §9.5 Progress update

Update `📥_inbox/iter-1-mass-fix/_progress.md`:
- BATCH_C1 LANDED `<HEAD-sha>` 2026-XX-XX
- 8 tasks closed (C001-C008)
- Audit findings closed: NC§7-C1 + §7-C2 + §7-C3 + §4-C1 + §4-C5 + §17-C1 + §13-C1 + §31-C1 + §31-C2 + §31-C3 + §31-H4 + §28-* gate (11 distinct CRIT/HIGH findings closed)
- Next: BATCH_D1 trigger

### §9.6 Daniel post-BATCH review

Daniel reviews `git log post-batch-c1-auth-chain ^pre-batch-c1-auth-chain` + manual smoke result. Approve → trigger BATCH_D1.

---

## §10 Fail-stop recovery

Per task fail:
1. `git stash` partial changes
2. Mark task FAILED in `## Failures` section below
3. Skip to next task — DO NOT abort BATCH
4. Continue C002 → C003 → ... → C008
5. Post-BATCH: enumerate failed tasks în `_progress.md §Failures`

### Failures

(none yet — execution-time append)

---

🦫 **BATCH_C1 — Auth Chain Wave 1 Critical. 8 tasks. ~3-4h Opus. Closes 11 distinct CRIT/HIGH findings. BLOCKS Wave 2 ALL.**
