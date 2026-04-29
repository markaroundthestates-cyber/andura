# Multi-Tenant Auth Migration — Technical Spec

**Status:** DRAFT spec ready pentru Sprint 3 implementation
**Date:** 2026-04-30 (Sprint 3 partial scaffold)
**Companion ADR:** [[ADR_MULTI_TENANT_AUTH_v1]]
**See also:** [[002-firebase-rest-not-sdk]] | [[007-firebase-open-rules]] | [[011-coach-decision-log-architecture]] | [[018-engine-extensibility-architecture]] §4 Schema Versioning
**Cross-ref audit:** AUDIT_5000Q Q-0353 / Q-1053 / Q-1055

---

## Goal

Migrate from Anonymous local-first UUID (`localStorage['device-id']`) to Firebase Auth real (Email Magic Link primary + OAuth Google secondary), preserving all existing data without loss, while keeping ADR 002 (REST not SDK) intact via Firebase Auth REST API.

---

## Schema migration — BEFORE → AFTER

### Current state (Sprint 1-2)

**`firebase.js` paths (hardcoded):**
```js
export const FIREBASE_URL = 'https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app';
export const USER_PATH = 'users/daniel';   // ← hardcoded single-user
```

**RTDB structure:**
```
users/
  daniel/
    coach-decisions: [...]
    logs: [...]
    weights: { "2026-04-29": 75.5, ... }
    settings: {...}
    ...
```

**Auth state:** none. `getDeviceId()` generates UUID stocată în localStorage.

### Target state (Sprint 3 post-implementation)

**`firebase.js` paths (auth-resolved):**
```js
export const FIREBASE_URL = 'https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app';

export function getUserPath() {
  const auth = getAuthState(); // resolves firebase.uid OR null
  if (auth?.uid) return `users/${auth.uid}`;
  // Faza 1-2 transition fallback: anonymous UUID
  const anonymousUuid = localStorage.getItem('device-id');
  return anonymousUuid ? `users/${anonymousUuid}` : null;
}
```

**RTDB structure:**
```
users/
  {firebase.uid}/
    coach-decisions: [...]
    logs: [...]
    weights: {...}
    settings: {...}
    ...

auth_migration_map/
  {anonymousUUID}/
    firebase_uid: "abc123..."
    migrated_at: 1714515600000
    status: "complete" | "pending_link" | "failed"
    error_log: null | "..."
```

**Auth state:** Firebase Auth real, Email Magic Link OR OAuth Google.

---

## Cloud Function pseudocode

### Function 1: `migrateUserData` (admin-triggered)

```javascript
// functions/src/migrateUserData.js
// Triggered: HTTP POST /migrateUserData (admin auth required)
// Input: { anonymousUUID, firebaseUid }
// Output: { status: 'success' | 'failed', error?, dataIntegrityVerified }

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.database();

exports.migrateUserData = functions.https.onCall(async (data, context) => {
  // 1. Auth check — admin only
  if (!context.auth || context.auth.token.admin !== true) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  const { anonymousUUID, firebaseUid } = data;
  if (!anonymousUUID || !firebaseUid) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required IDs');
  }

  try {
    // 2. Read all data under users/{anonymousUUID}/
    const sourceSnap = await db.ref(`users/${anonymousUUID}`).once('value');
    if (!sourceSnap.exists()) {
      throw new functions.https.HttpsError('not-found', `Source path users/${anonymousUUID} empty`);
    }
    const sourceData = sourceSnap.val();

    // 3. Check destination doesn't already have data (avoid overwrite)
    const destSnap = await db.ref(`users/${firebaseUid}`).once('value');
    if (destSnap.exists()) {
      throw new functions.https.HttpsError('already-exists', 'Destination already has data — manual reconciliation needed');
    }

    // 4. Write to users/{firebaseUid}/ atomically
    await db.ref(`users/${firebaseUid}`).set(sourceData);

    // 5. Verify data integrity — read back, deep compare
    const verifySnap = await db.ref(`users/${firebaseUid}`).once('value');
    const verifyData = verifySnap.val();
    if (JSON.stringify(verifyData) !== JSON.stringify(sourceData)) {
      // Rollback dest write
      await db.ref(`users/${firebaseUid}`).remove();
      throw new functions.https.HttpsError('data-loss', 'Verification failed — destination data mismatch source');
    }

    // 6. Update mapping table
    await db.ref(`auth_migration_map/${anonymousUUID}`).set({
      firebase_uid: firebaseUid,
      migrated_at: Date.now(),
      status: 'complete',
    });

    // 7. Mark old path as MIGRATED (preserve for 90-day backup)
    await db.ref(`users/${anonymousUUID}/_migrated`).set({
      migrated_to: firebaseUid,
      migrated_at: Date.now(),
      retention_until: Date.now() + (90 * 24 * 60 * 60 * 1000),
    });

    return { status: 'success', dataIntegrityVerified: true };

  } catch (err) {
    // Update mapping table cu error
    await db.ref(`auth_migration_map/${anonymousUUID}`).set({
      firebase_uid: firebaseUid,
      migrated_at: Date.now(),
      status: 'failed',
      error_log: err.message,
    });
    throw err;
  }
});
```

### Function 2: `migrateAllPending` (bulk, post-Faza-2)

```javascript
// functions/src/migrateAllPending.js
// Triggered: HTTP POST /migrateAllPending (admin auth)
// Iterates auth_migration_map status=pending_link entries

exports.migrateAllPending = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  const pendingSnap = await db.ref('auth_migration_map')
    .orderByChild('status')
    .equalTo('pending_link')
    .once('value');

  const results = { migrated: 0, failed: 0, errors: [] };
  const pending = pendingSnap.val() || {};

  for (const [anonymousUUID, entry] of Object.entries(pending)) {
    try {
      // Re-use single-user migration logic (refactored to internal helper)
      await migrateUserDataInternal(anonymousUUID, entry.firebase_uid);
      results.migrated++;
    } catch (err) {
      results.failed++;
      results.errors.push({ anonymousUUID, error: err.message });
    }
  }

  return results;
});
```

### Function 3: `tombstoneCleanup` (cron monthly)

Aliniat cu ADR 011 amendment 90-day retention pattern.

```javascript
// functions/src/tombstoneCleanup.js
// Triggered: Cloud Scheduler cron monthly
// Deletes users/{anonymousUUID}/_migrated entries cu retention_until expired

exports.tombstoneCleanup = functions.pubsub.schedule('0 3 1 * *').onRun(async () => {
  const now = Date.now();
  const allUsersSnap = await db.ref('users').once('value');
  const allUsers = allUsersSnap.val() || {};

  let deletedCount = 0;
  for (const [uuid, data] of Object.entries(allUsers)) {
    if (data?._migrated?.retention_until && data._migrated.retention_until < now) {
      await db.ref(`users/${uuid}`).remove();
      await db.ref(`auth_migration_map/${uuid}`).remove();
      deletedCount++;
    }
  }

  console.log(`[tombstoneCleanup] Deleted ${deletedCount} expired migrated users`);
  return { deletedCount };
});
```

---

## Code refactor — `firebase.js` evolution

### Add Firebase Auth REST helpers

```javascript
// src/auth.js (NEW file)

const FIREBASE_API_KEY = '<api-key-from-firebase-console>'; // env var pre-launch
const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';

// Email Magic Link — send
export async function sendMagicLink(email) {
  const response = await fetch(`${AUTH_BASE}/accounts:sendOobCode?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestType: 'EMAIL_SIGNIN',
      email,
      continueUrl: `${window.location.origin}/auth-callback`,
      canHandleCodeInApp: true,
    }),
  });
  return response.json();
}

// Email Magic Link — verify (after user clicks link)
export async function verifyMagicLink(email, oobCode) {
  const response = await fetch(`${AUTH_BASE}/accounts:signInWithEmailLink?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, oobCode }),
  });
  const data = await response.json();
  if (data.idToken) {
    localStorage.setItem('firebase-id-token', data.idToken);
    localStorage.setItem('firebase-uid', data.localId);
    localStorage.setItem('firebase-refresh-token', data.refreshToken);
  }
  return data;
}

// Resolve current auth state (used by getUserPath)
export function getAuthState() {
  const uid = localStorage.getItem('firebase-uid');
  const idToken = localStorage.getItem('firebase-id-token');
  if (!uid || !idToken) return null;
  // TODO: token refresh logic if expired (Firebase ID tokens expire 1h)
  return { uid, idToken };
}

// Sign out
export function signOut() {
  localStorage.removeItem('firebase-id-token');
  localStorage.removeItem('firebase-uid');
  localStorage.removeItem('firebase-refresh-token');
}
```

### Refactor `firebase.js`

```javascript
// src/firebase.js

import { getAuthState } from './auth.js';

export const FIREBASE_URL = 'https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app';

// REPLACE hardcoded USER_PATH with dynamic resolver
export function getUserPath() {
  const auth = getAuthState();
  if (auth?.uid) return `users/${auth.uid}`;
  // Faza 1-2 transition fallback
  const anonymousUuid = localStorage.getItem('device-id');
  return anonymousUuid ? `users/${anonymousUuid}` : null;
}

// All fbGet/fbSet/fbDelete callers updated să folosească getUserPath()
async function fbGet(path) {
  const userPath = getUserPath();
  if (!userPath) return null;
  const fullPath = `${userPath}/${path}`;
  const r = await fetch(`${FIREBASE_URL}/${fullPath}.json`, { cache: 'no-store' });
  if (!r.ok) return null;
  return await r.json();
}

// Similar refactor pentru fbSet, fbDelete...
```

### UI auth flow component

`src/pages/auth.js` (NEW):
- Email entry form
- "Trimit link magic" button → calls `sendMagicLink(email)`
- Listens for `auth-callback` route → calls `verifyMagicLink(email, oobCode)`
- Post-verify success → redirect to dashboard
- Pre-verify: show "Verifică emailul" UI

`src/pages/onboarding.js` integrates auth flow as Step 1 (mandatory post-Faza-3).

---

## Test scenarios (Golden Master Suite manual additions)

Per `tests/golden-master/profiles/manual/README.md` — adăugare Sprint 3:

- **manual-021-multi-device-migrate-success.json**
  - Profile: 2 anonymous accounts (phone UUID-A 30 sessions + desktop UUID-B 5 sessions)
  - Pre-condition: link account same email
  - Expected behavior: user prompted "alege primary device" → choice phone (UUID-A) → desktop data EITHER export prompt OR lost (user accepted)
  - Engine: post-migration sees `users/{firebase.uid}/` cu UUID-A data complete

- **manual-022-multi-device-merge-conflict.json**
  - Profile: 2 anonymous accounts cu data overlap (same date logs different)
  - Expected: T&B pattern (per ADR 011 amendment) — branch detection on conflicting entries → UI prompt "varianta A sau B?" per entry

- **manual-023-anonymous-refuses-auth.json**
  - Profile: existing user post-Faza-2 prompt, dismiss "link account" 5x
  - Expected: banner escalation to "data sunset 90 zile" warning + Export feature surfaced

- **manual-024-magic-link-expired.json**
  - Profile: user click expired link
  - Expected: UI clear error + re-trigger flow + NO data loss

- **manual-025-migration-partial-fail.json**
  - Profile: simulate Cloud Function crash mid-migration
  - Expected: rollback step 4 — `users/{firebaseUid}/` data exists DAR `auth_migration_map` status='failed' → next app load detects + retry idempotent

---

## Migration phases timeline

### Faza 1 — Add real auth alongside Anonymous (Sprint 3 task ~10h)

- Build `src/auth.js` REST helpers
- Build UI auth component
- Refactor `firebase.js` to use `getUserPath()`
- Cloud Function `migrateUserData` deploy
- Manual Daniel migration: `users/daniel` → `users/{daniel.firebase.uid}` via Cloud Function
- Deploy to PWA — Daniel dogfood Faza 1 cu real auth

### Faza 2 — Prompt existing users link account (Sprint 3 task ~3h)

- Banner UI in coach page: "Link account pentru recovery"
- Skip button + remind later persistence
- 14-day grace period
- Beta cohort feedback collected via Discord

### Faza 3 — Sunset Anonymous post 30-day parallel (Sprint 3 task ~2h)

- New signups post-Faza-3 = auth required (no Anonymous fallback)
- Existing Anonymous-only users (refuze auth) → 90-day sunset warning + Export prompt
- Cloud Function tombstoneCleanup activates monthly cron

### Sprint 3+ post-launch

- Monitor migration success rate via Sentry + auth_migration_map status counts
- Reconsideration triggers per ADR — multi-device merge demand, Firebase quota, etc.

---

## Effort estimate

- **Sprint 3 implementation:** ~15-25h total
  - Faza 1: ~10h (auth REST + UI + firebase.js refactor + Cloud Function + Daniel manual migration)
  - Faza 2: ~3h (banner UI + grace logic)
  - Faza 3: ~2h (sunset gate + cleanup function)
  - Tests + Golden Master Suite manual additions: ~3-5h
  - QA + emulator scenarios: ~2-3h

**Sprint 3 partial (acest spec):** **0h code** — design only.

---

## Cross-references

- AUDIT_5000Q Q-0353 / Q-1053 / Q-1055
- ADR 002 (Firebase REST not SDK) — preserve via REST Auth endpoints
- ADR 007 (Firebase open rules) — Sprint 3 update la per-UID scoped rules post-Faza-1
- ADR 011 Reconsideration Trigger #6 (Multi-tenant auth deployed → CDL path migration)
- ADR_MULTI_TENANT_AUTH_v1 — companion ADR
- COGNITIVE_ARCHITECTURE_SPEC_v1 §Q14 (Identity & Auth)
- HANDOVER 2026-04-29 §1 chat strategic
