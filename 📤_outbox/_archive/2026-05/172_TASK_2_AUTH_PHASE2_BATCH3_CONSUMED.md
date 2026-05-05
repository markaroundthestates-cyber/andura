# TASK 2 — Auth Phase 2 Batch 3 (CONDITIONAL on TASK 1 PASS)

═══════════════════════════════════════════════════════════════════
**Source-of-truth:**
- `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §56.12 (Logout) + §56.14.A (admin-cleanup.js skeleton) + §56.15 (Telemetry counters FieldValue.increment) + §56.16 (Firestore Security Rules code update — Console publish Daniel manual post-batch)
- `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §62.8 (anti-tap-accidental Maria 65 wording) + §62.9 (cleanup A weekly script trigger Reminder Calendar Manual) + §64.8 (Telemetry opt-out toggle ZERO Settings)

**Dependency:** Run only if TASK 1 PASS. Else mark SKIPPED.
═══════════════════════════════════════════════════════════════════

## §56.12 Logout Settings double-confirm + opt-in IndexedDB wipe toggle

UI Settings → buton "Deconectare":

**Step 1 — Modal confirm 1:**

> Vei fi deconectat. Continui?

Sub modal: checkbox opt-in default OFF:

> [ ] Șterge și datele locale de pe acest dispozitiv

Buton "Continuă" + buton "Renunță" (close modal).

**Step 2 — Modal confirm 2 (anti-tap-accidental Maria 65):**

> Sigur vrei să te deconectezi?
>
> Va trebui să te autentifici din nou pentru a-ți vedea datele.

Buton "Da, deconectează-mă" + buton "Renunță".

**Logout execution flow:**

1. Firebase Auth REST sign-out (existing `signOut()` în `src/auth.js`)
2. Wipe localStorage tokens: `firebase-id-token`, `firebase-uid`, `firebase-refresh-token`, `firebase-id-token-expiry`
3. **DACĂ checkbox bifat:** wipe IndexedDB user-namespace `andura_${uid}` complete (extend `src/db.js` cu `wipeUserDB(uid)` helper folosind Dexie `db.delete()`)
4. **DACĂ checkbox NU bifat:** PRESERVE local IndexedDB `andura_${uid}` (data remains pentru next sign-in same device)
5. Redirect splash post-logout cu wording:
   > Te-ai deconectat. Revino oricând.

═══════════════════════════════════════════════════════════════════

## §56.14.A admin-cleanup.js Daniel weekly script (skeleton)

Creează fișier `scripts/admin-cleanup.js` (NOT in src/, NOT bundled în app):

**Purpose:** Daniel weekly manual trigger pentru cascade cleanup post-grace-periods.

**Skeleton structure:**

```javascript
#!/usr/bin/env node
// scripts/admin-cleanup.js
// Daniel manual weekly run pentru cascade hard delete:
// 1. Soft-deleted accounts cu scheduledHardDelete < now → hard delete cascade
// 2. Archived data (Anonymous→Auth Merge) > 7 zile → hard delete cascade
//
// Pre-Beta 50 testeri scale-fezabil manual. Cloud Function automation defer v1.5.
//
// Usage:
//   node scripts/admin-cleanup.js [--dry-run]

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const DRY_RUN = process.argv.includes('--dry-run');
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? './firebase-service-account.json';

initializeApp({
  credential: cert(SERVICE_ACCOUNT_PATH),
});

const db = getFirestore();
const auth = getAuth();

async function cleanupSoftDeletedAccounts() {
  const now = Date.now();
  const snapshot = await db.collection('users')
    .where('_deleted.scheduledHardDelete', '<', now)
    .get();

  let deleted = 0;
  for (const doc of snapshot.docs) {
    const uid = doc.id;
    if (DRY_RUN) {
      console.log(`[dry-run] Would hard-delete user ${uid}`);
    } else {
      // Cascade Firestore user document subcollections
      await db.recursiveDelete(doc.ref);
      // Firebase Auth user delete
      try {
        await auth.deleteUser(uid);
      } catch (err) {
        if (err.code !== 'auth/user-not-found') throw err;
      }
      deleted++;
    }
  }
  return deleted;
}

async function cleanupArchivedData() {
  const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
  // _archived/{uid}/{timestamp} sub-collections — iterate users + filter timestamps
  // Implementation: use collectionGroup query pe `_archived` cu filter timestamp
  // Pseudo-code, expand cu actual schema in implementation
  let deleted = 0;
  // ... iterate + delete archive docs cu timestamp < cutoff
  return deleted;
}

(async () => {
  console.log(`[admin-cleanup] Starting ${DRY_RUN ? '(DRY RUN)' : ''}`);
  const accountsDeleted = await cleanupSoftDeletedAccounts();
  const archivesDeleted = await cleanupArchivedData();
  console.log(`[admin-cleanup] Deleted ${accountsDeleted} accounts + ${archivesDeleted} archives`);
})();
```

**Documentation:** `scripts/admin-cleanup.README.md` cu:

- Install: `npm install --save-dev firebase-admin`
- Service account JSON setup Firebase Console → Project Settings → Service Accounts → Generate new private key → save `firebase-service-account.json` (gitignored)
- Run manual: `node scripts/admin-cleanup.js` (production) sau `--dry-run` flag pentru preview
- Calendar reminder Daniel duminică ~5 min weekly task per §62.9

Add `scripts/firebase-service-account.json` la `.gitignore` dacă nu e deja.

═══════════════════════════════════════════════════════════════════

## §56.15 Telemetry counters FieldValue.increment Firestore

Creează `src/util/telemetry.js` (sau extend existing dacă găsit).

**Aggregate anonymous events (GDPR-safe by design ZERO PII per §64.8):**

```javascript
// src/util/telemetry.js
import { getDb } from '../firebase.js';
// (Use existing Firestore client wrapper; verify path pre-implementation)

const TELEMETRY_PATH = '_telemetry/global/counters';

const EVENTS = Object.freeze({
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  AUTH_REQUIRED_HIT: 'auth_required_hit',
  AUTH_SIGNIN_SUCCESS: 'auth_signin_success',
  AUTH_SIGNIN_FAIL: 'auth_signin_fail',
  ACCOUNT_DELETED: 'account_deleted',
  ACCOUNT_REACTIVATED: 'account_reactivated',
  MERGE_FORK_TELEFON: 'merge_fork_telefon',
  MERGE_FORK_CLOUD: 'merge_fork_cloud',
  EMAIL_CHANGE_INITIATED: 'email_change_initiated',
  EMAIL_CHANGE_COMPLETED: 'email_change_completed',
  LOGOUT_NO_WIPE: 'logout_no_wipe',
  LOGOUT_WITH_WIPE: 'logout_with_wipe',
});

export async function trackEvent(eventName) {
  if (!Object.values(EVENTS).includes(eventName)) {
    console.warn(`[telemetry] Unknown event: ${eventName}`);
    return;
  }
  try {
    // Use Firestore FieldValue.increment(1) atomic op
    // Implementation: extend existing Firestore wrapper sau direct REST call
    // Pseudo-code:
    await firestoreUpdate(TELEMETRY_PATH, {
      [eventName]: FieldValue.increment(1),
    });
  } catch (err) {
    // Telemetry MUST NOT block app flow — silent fail
    console.warn(`[telemetry] Failed to track ${eventName}:`, err);
  }
}

export { EVENTS };
```

**Wire trackEvent calls in:**

- `src/pages/onboarding.js` (sau equivalent T0 entry) — `EVENTS.ONBOARDING_STARTED` la start, `EVENTS.ONBOARDING_COMPLETED` la finish
- `src/pages/authShell.js` — `EVENTS.AUTH_REQUIRED_HIT` când auth wall triggered
- `src/auth.js` post Magic Link/Google success — `EVENTS.AUTH_SIGNIN_SUCCESS`
- `src/auth.js` post Magic Link/Google fail — `EVENTS.AUTH_SIGNIN_FAIL`
- `src/components/deleteAccountModal.js` post confirm — `EVENTS.ACCOUNT_DELETED`
- `src/components/forkDecisionModal.js` click [Telefon] — `EVENTS.MERGE_FORK_TELEFON`
- `src/components/forkDecisionModal.js` click [Cloud] — `EVENTS.MERGE_FORK_CLOUD`
- `src/components/emailChangeForm.js` initiate — `EVENTS.EMAIL_CHANGE_INITIATED`
- `src/auth.js` post email change verified — `EVENTS.EMAIL_CHANGE_COMPLETED`
- `src/pages/settings.js` logout flow — `EVENTS.LOGOUT_NO_WIPE` SAU `EVENTS.LOGOUT_WITH_WIPE` (per checkbox state)

ZERO toggle Settings opt-out (per §64.8 LOCKED V1 — aggregate anonymous events sunt GDPR-safe by design FieldValue.increment counter only, ZERO PII).

═══════════════════════════════════════════════════════════════════

## §56.16 Firestore Security Rules — code update only (Console publish Daniel manual post-batch)

Update `firestore.rules` în repo (extended deja batch 1 commit `f9ee75d`) cu noi paths:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Existing user data (extended batch 1)
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // NEW §56.5.2 — Soft delete flag owner-only
    match /users/{uid}/_deleted {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // NEW §56.7 — Archive sub-collection owner-only
    match /users/{uid}/_archived/{archiveId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // NEW §56.7 — Anonymous archive (server-only via admin SDK script)
    match /_archived/anonymous/{timestamp}/{document=**} {
      allow read, write: if false;  // server-only via admin SDK
    }

    // NEW §56.15 — Telemetry counters increment-only validated
    match /_telemetry/global/counters {
      allow read: if false;  // no client read
      allow write: if request.auth != null
        && request.resource.data.keys().hasOnly(allowedTelemetryKeys())
        && validateIncrementOnly(request.resource.data, resource.data);
    }
  }
}

// Helper functions (Firestore Security Rules v2 syntax)
function allowedTelemetryKeys() {
  return [
    'onboarding_started', 'onboarding_completed',
    'auth_required_hit', 'auth_signin_success', 'auth_signin_fail',
    'account_deleted', 'account_reactivated',
    'merge_fork_telefon', 'merge_fork_cloud',
    'email_change_initiated', 'email_change_completed',
    'logout_no_wipe', 'logout_with_wipe',
  ];
}

function validateIncrementOnly(newData, oldData) {
  // Verify each field is FieldValue.increment(1) only — no overwrite arbitrary
  // Note: Firestore Rules don't directly inspect FieldValue ops — accept increment via write op type heuristic
  // Pre-Beta 50 testeri = trust auth + minimal abuse vector. Production v1.5 = Cloud Function intermediary.
  return true;
}
```

**Daniel manual post-batch:** `firebase deploy --only firestore:rules` SAU Console paste manual. NU în acest CC batch — code update doar în repo.

═══════════════════════════════════════════════════════════════════

## Files affected (estimat — verify pre-implementation)

- `src/pages/settings.js` — extend Logout flow + double-confirm modals
- `src/auth.js` — extend signOut wrapper cu opt-in IndexedDB wipe parameter
- `src/db.js` (Dexie) — extend cu `wipeUserDB(uid)` helper
- `scripts/admin-cleanup.js` — NEW
- `scripts/admin-cleanup.README.md` — NEW
- `scripts/firebase-service-account.json` — gitignore add (file NU committed)
- `src/util/telemetry.js` — NEW
- `firestore.rules` — extend cu paths noi
- `.gitignore` — verify `firebase-service-account.json` listed
- Tests vitest

═══════════════════════════════════════════════════════════════════

## Tests required (Bugatti coverage target ≥80%)

- `src/pages/__tests__/settings.logout.test.js` — Logout double-confirm flow + with/without checkbox bifat IndexedDB wipe (mock Dexie + verify db.delete called sau not)
- `src/util/__tests__/telemetry.test.js` — trackEvent fires correct FieldValue.increment (mock Firestore wrapper) + unknown event warns + silent fail no-throw
- `scripts/__tests__/admin-cleanup.test.js` — dry-run mode mock + assert correct cascade detection (no actual deletes, just identification)

═══════════════════════════════════════════════════════════════════

## Acceptance criteria (PASS/FAIL gate)

PASS:
- Logout double-confirm working (anti-tap-accidental)
- Opt-in IndexedDB wipe toggle functional bidirectional (verify DB deleted vs preserved)
- Telemetry events fire corect cu FieldValue.increment (mock verify)
- admin-cleanup.js skeleton + README functional + dry-run mode tested
- firestore.rules code updated în repo (Console publish = Daniel manual flagged în LATEST.md report)
- `npm run test:run` ALL pass + `npm run build` clean
- ZERO regression

FAIL = orice criteria nesatisfăcut → mark FAILED, append LATEST.md, proceed TASK 3.

═══════════════════════════════════════════════════════════════════

## Wording UI verbatim cheatsheet (anti-drift)

§56.12 Logout step 1:
> Vei fi deconectat. Continui?
>
> [ ] Șterge și datele locale de pe acest dispozitiv

§56.12 Logout step 2 (anti-tap-accidental):
> Sigur vrei să te deconectezi?
>
> Va trebui să te autentifici din nou pentru a-ți vedea datele.

§56.12 Splash post-logout:
> Te-ai deconectat. Revino oricând.

═══════════════════════════════════════════════════════════════════
