# Wave A Code Review — Fresh-Eyes — 2026-05-21

**Scope:** 10 files Wave A iter 1 (src/auth.js + 7 React + 2 scripts).
**Reviewer:** Claude Opus 4.7 fresh-eyes (zero anchoring prior reviews).
**Method:** Each file read line-by-line; cross-refs verified via filesystem (engineWrappers, coachDirectorAggregate, appStore).
**Status:** PASS_WITH_NITS — no production blockers, 4 MEDIUM iter 2 tickets recommended.

---

## CRITICAL findings (blocker pre-Beta)

**None.** All 10 files behave correctly under reproduction of edge cases I attempted (null collisions on `coach.plannedWorkout` are gated by `!coach.isRestDay`, `getPendingEmail` honors TTL, `authSignOut` clears all relevant keys including `lastAuthAt`, `verifyMagicLink` race protected by `cancelled` flag).

---

## MEDIUM findings (Beta-OK but iter 2 ticket)

### M-1 — [scripts/healthcheck.cjs:21] Hardcoded production Sentry DSN as fallback
**Issue:** `SENTRY_DSN` defaults to literal `https://dcbb183e8d98e95c6cd8b2c3c49b2427@o4511269200068608.ingest.de.sentry.io/4511269203869776` when env var unset. DSN keys *are* meant to be public (Sentry ingestion auth model), but baking the production DSN into a script committed to the repo means anyone with read access (future contractors, open-sourcing, leaked clone) gets the live ingestion endpoint and could spam noise events. Same applies to `FIREBASE_RTDB_URL` line 19 (less sensitive).
**Fix:** Drop the hardcoded fallback; fail loudly if env unset.
```js
const SENTRY_DSN = process.env.VITE_SENTRY_DSN;
if (!SENTRY_DSN) { console.error('VITE_SENTRY_DSN required'); process.exit(2); }
```
**Impact:** Pre-Beta acceptable (private repo). Mandatory pre-open-source. Iter 2 ticket.

### M-2 — [src/react/routes/ProtectedRoute.tsx:37-51] One-way sync — storage signOut from another tab NU revoca auth in this tab
**Issue:** `sync()` callback only sets `setAuthenticated(true)` when storage *has* auth; it never sets `false` when storage was cleared by another tab's `signOut()` (or by `SettingsDanger` reset). Comment line 32-33 acknowledges this is intentional ("Empty storage does NOT override programmatic setAuthenticated(true)") to preserve dev mock login — but the consequence is: user logs out in Tab B, Tab A `storage` event fires, sync() reads empty storage, does nothing → Tab A still shows `/app/*` with stale `isAuthenticated=true`. Next protected fetch will 401, but UI navigation is broken until manual reload.
**Reproduce:** Open `/app/antrenor` in two tabs. In Tab B: Cont → Logout. Tab A storage event fires, but stays on `/app/antrenor`. Engine calls fail silently.
**Fix:** Distinguish "storage empty since mount" (dev mock) from "storage cleared after auth" (real logout). Track initial empty state and only revoke when transitions empty→empty via storage event.
```ts
const wasAuthedInStorage = useRef(false);
const sync = (): void => {
  const fromStorage = readAuthFromStorage();
  if (fromStorage) { wasAuthedInStorage.current = true; if (!isAuthenticated) setAuthenticated(true); }
  else if (wasAuthedInStorage.current && isAuthenticated) { setAuthenticated(false); }
};
```
**Impact:** Multi-tab logout broken. Edge case, low-traffic pre-Beta (Daniel solo). Iter 2 ticket.

### M-3 — [src/auth.js:91-115] sendMagicLink throttle marker set BEFORE network attempt — irreversible on transient fail
**Issue:** Line 75 sets `lastMagicLinkSent = Date.now()` *before* the fetch loop. If all 3 retries fail (legitimate network issue, user retries), the 30s cooldown blocks the next user-initiated `sendMagicLink` even though no successful Firebase request was made. Cooldown intent (anti-spam) is reasonable, but applying it to *attempted* sends instead of *successful* sends is asymmetric — Firebase quota wasn't actually consumed.
**Reproduce:** Airplane mode → tap "Trimite Magic Link" → 3 retries fail → re-enable network → tap again → blocked 30s.
**Fix:** Move the throttle write inside `if (r.ok)` block before the `return { ok: true }`. Optionally keep a smaller pre-flight throttle (e.g., 2s) to prevent UI double-tap.
**Impact:** User-visible bug recoverable by waiting 30s. Anti-pattern in retry semantics. Iter 2 ticket.

### M-4 — [src/react/routes/screens/AuthCallback.tsx:36-40] No defense-in-depth against `getPendingEmail()` returning stale email after URL params consumed
**Issue:** Magic Link flow normally puts `email=` in continueUrl, so `urlEmail` wins. But if Firebase rewrites the URL (some mobile email clients strip query params), `getPendingEmail()` returns the localStorage cached value — which may belong to a different user on a shared device. The `getPendingEmail()` TTL gate at 1h (auth.js:330) helps, but the callback never clears `pendingEmail` on failure (only `verifyMagicLink` success path at auth.js:141-142 clears it). After `verify_failed` navigate to `/auth?error=`, the stale pendingEmail lingers up to 1h.
**Fix:** In AuthCallback failure path, clear pendingEmail explicitly so the next attempt forces fresh email entry.
```ts
} else {
  // Clear stale pendingEmail on verify failure (anti shared-device leak).
  localStorage.removeItem('firebase-magic-link-email');
  localStorage.removeItem('firebase-magic-link-email-expiry');
  setError(result.error || 'verify_failed');
  navigate(...)
}
```
**Impact:** Shared-device edge case. Defense-in-depth, not a primary control. Iter 2 ticket.

---

## LOW / nits

### L-1 — [src/auth.js:25-27] FIREBASE_API_KEY ternary triple-fallback can resolve to literal `'PLACEHOLDER_WEB_API_KEY'` in production silently
Throws no error if env + window both unset — Magic Link calls just 400. Add startup assert in app entry that warns when key === placeholder.

### L-2 — [src/react/components/Antrenor/CoachTodayCard.tsx:36] Hardcoded RO copy `"Pectoralii recupereaza din marti..."` rendered even when `workout` provided
The italic quote line is a static mockup string regardless of `workout` truthiness. If this is a placeholder for engine-driven micro-coaching text, ticket it; otherwise document it's a permanent design element. Mismatch with `// fallback mockup stub cand workout=null` comment claim (line 7-8).

### L-3 — [src/react/components/ConfirmModal.tsx:35-75] No Escape key + no click-outside-to-close + no focus-trap
Card claims WCAG 2.1 compliance (line 8) but doesn't implement standard a11y modal patterns. `role=dialog + aria-modal=true` alone is insufficient — keyboard users can't dismiss without Tab-to-button-then-Enter. Mockup-parity may not require it for v1, but flag for accessibility audit.

### L-4 — [src/react/routes/screens/cont/SettingsDanger.tsx:18] `import { ... } from '../../../../auth.js'` — 4-level relative traversal fragile to refactor
Consider `@auth` path alias. Same in AuthCallback.tsx:12 (3-level) and ProtectedRoute.tsx:16 (2-level). Inconsistent traversal counts indicate scattered import structure.

### L-5 — [src/react/routes/screens/cont/SettingsDanger.tsx:40-42] `console.warn` survives in production builds
`console.warn('[SettingsDanger] wipe failed:', e);` — wrap in `if (import.meta.env.DEV)` or pipe through Sentry. Same anti-pattern likely elsewhere; not in scope.

### L-6 — [scripts/test-restore.cjs:31-34] Production-safety gate only checks NODE_ENV; ignores hostname check promised in header comment line 14
Header line 14: `refuses to run dacă NODE_ENV=production sau hostname=andura.app.` Implementation only checks `NODE_ENV`. Add hostname check or remove comment claim.
```js
const os = require('os');
if (os.hostname().includes('andura.app')) { console.error('refuses on andura.app host'); process.exit(1); }
```

### L-7 — [scripts/healthcheck.cjs:81] Firebase RTDB "reachable" accepts 401/403 as up
Correct logic, but doesn't validate the response body is actually Firebase (no JSON content-type assert). A misconfigured CDN serving HTML 401 would pass. Low priority — Firebase URL is well-known. Document the assumption.

### L-8 — [src/react/routes/screens/antrenor/Antrenor.tsx:125] Ternary `(coach !== null ? !coach.isRestDay : schedContext === 'workout')` is correct but unreadable
Extract:
```ts
const showWorkoutCard = coach !== null ? !coach.isRestDay : schedContext === 'workout';
```
Already correct logic — just readability.

### L-9 — [src/auth.js:189] `nonce: Math.random().toString(36).slice(2)` — non-cryptographic nonce for OAuth
For Google OAuth nonce, `crypto.getRandomValues` preferred. `Math.random()` is acceptable for nonce-binding (replay protection on caller side), but Bugatti craft would use proper CSPRNG. ~4 bytes entropy via slice(2) is borderline.
```js
nonce: crypto.getRandomValues(new Uint8Array(16)).reduce((s,b)=>s+b.toString(16).padStart(2,'0'),'')
```

### L-10 — [src/react/routes/screens/AuthCallback.tsx:27-31] Double navigation on missing_params
`setError('missing_params')` then `navigate(... replace:true)` — state set will trigger re-render of error UI for one frame before navigation commits. Either remove setError (navigate is sufficient) or skip navigate (error UI handles display). Cosmetic only.

---

## Verdict

- **CRITICAL:** 0
- **MEDIUM:** 4 (Sentry DSN hardcoded, multi-tab logout sync gap, throttle-before-success asymmetry, stale pendingEmail on verify-fail)
- **LOW / nits:** 10
- **Overall:** **PASS_WITH_NITS** — green-light pre-Beta. MEDIUM-1..4 are recoverable edge cases; ticket for iter 2 post-Beta launch. ZERO data-loss, ZERO auth-bypass, ZERO crash risk. Karpathy-compliant (no speculative features beyond spec; single-use abstractions absent; surgical changes traceable to audit fix tags §A001..§A035).

**Beta-blocker filter applied:** Daniel CEO criterion "Gigel reacționează cum?" → Gigel encounters none of these in normal flow. Multi-tab logout (M-2) the closest to user-facing, but Daniel solo pre-Beta makes it acceptable.

---

_Reviewed: 2026-05-21_
_Reviewer: Claude Opus 4.7 (gsd-code-reviewer, fresh-eyes mode)_
_Depth: standard + targeted cross-ref deep_
