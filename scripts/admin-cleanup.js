#!/usr/bin/env node
// scripts/admin-cleanup.js
// ══════════════════════════════════════════════════════════════════════════
// Daniel manual weekly run pentru cascade hard delete:
//   1. Soft-deleted accounts cu scheduledHardDelete < now → hard delete cascade
//   2. Archived data (Anonymous→Auth Merge) > 7 zile → hard delete cascade
//
// Pre-Beta 50 testeri scale-fezabil manual. Cloud Function automation defer v1.5.
//
// Usage:
//   node scripts/admin-cleanup.js [--dry-run]
//
// Setup pre-run:
//   1. npm install --save-dev firebase-admin (NU committed în repo deps prod)
//   2. Firebase Console → Project Settings → Service Accounts → Generate new private key
//   3. Save as `firebase-service-account.json` în repo root (gitignored).
//
// Calendar reminder: Daniel duminică ~5 min weekly task per §62.9.
// ══════════════════════════════════════════════════════════════════════════

import { SEVEN_DAYS_MS, isExpiredArchive, isPastHardDeleteSchedule } from '../src/util/adminCleanupHelpers.js';

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(`[admin-cleanup] Starting ${DRY_RUN ? '(DRY RUN)' : ''}`);

  // Lazy-import firebase-admin so script is testable / fails clearly if dep missing.
  let initializeApp, cert, getFirestore, getAuth;
  try {
    const appMod = await import('firebase-admin/app');
    const fsMod = await import('firebase-admin/firestore');
    const authMod = await import('firebase-admin/auth');
    initializeApp = appMod.initializeApp;
    cert = appMod.cert;
    getFirestore = fsMod.getFirestore;
    getAuth = authMod.getAuth;
  } catch (err) {
    console.error('[admin-cleanup] firebase-admin not installed. Run: npm install --save-dev firebase-admin', err);
    process.exit(1);
  }

  const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? './firebase-service-account.json';
  initializeApp({ credential: cert(SERVICE_ACCOUNT_PATH) });
  const db = getFirestore();
  const auth = getAuth();

  const accountsDeleted = await cleanupSoftDeletedAccounts({ db, auth });
  const archivesDeleted = await cleanupArchivedData({ db });
  console.log(`[admin-cleanup] Deleted ${accountsDeleted} accounts + ${archivesDeleted} archives`);
}

async function cleanupSoftDeletedAccounts({ db, auth }) {
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
      await db.recursiveDelete(doc.ref);
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

/**
 * Cleanup archived data (Anonymous→Auth Merge per §56.7) > 7 zile.
 * Iterates `users/*\/_archived/*` + `_archived/anonymous/*` cu timestamp < cutoff.
 *
 * @param {{ db: object }} ctx
 * @returns {Promise<number>}
 */
async function cleanupArchivedData({ db }) {
  const cutoff = Date.now() - SEVEN_DAYS_MS;
  let deleted = 0;

  // Iterate user-namespace _archived sub-collections
  const usersSnap = await db.collection('users').get();
  for (const userDoc of usersSnap.docs) {
    const archiveSnap = await userDoc.ref.collection('_archived')
      .where('timestamp', '<', cutoff)
      .get();
    for (const archiveDoc of archiveSnap.docs) {
      if (DRY_RUN) {
        console.log(`[dry-run] Would delete archive users/${userDoc.id}/_archived/${archiveDoc.id}`);
      } else {
        await db.recursiveDelete(archiveDoc.ref);
        deleted++;
      }
    }
  }

  // Anonymous archive root
  try {
    const anonSnap = await db.collection('_archived').doc('anonymous').collection('items')
      .where('timestamp', '<', cutoff)
      .get();
    for (const archiveDoc of anonSnap.docs) {
      if (DRY_RUN) {
        console.log(`[dry-run] Would delete _archived/anonymous/${archiveDoc.id}`);
      } else {
        await db.recursiveDelete(archiveDoc.ref);
        deleted++;
      }
    }
  } catch {
    // _archived/anonymous/items collection may not exist — silent
  }

  return deleted;
}

// Pure helpers re-exported via `src/util/adminCleanupHelpers.js` (in vitest scope).
export { SEVEN_DAYS_MS, isExpiredArchive, isPastHardDeleteSchedule };

// Entry point — only run when executed directly, NOT on import (test-friendly).
const isDirectRun = (() => {
  try {
    return import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('admin-cleanup.js');
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  main().catch((err) => {
    console.error('[admin-cleanup] Fatal error:', err);
    process.exit(1);
  });
}
