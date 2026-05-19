# admin-cleanup.js — Daniel weekly manual cleanup script

Per §56.14.A LOCKED V1 — pre-Beta 50 testeri scale-fezabil manual. Cloud Function automation defer v1.5.

## Setup (one-time)

1. **Install dev dep (NU în prod deps):**
   ```sh
   npm install --save-dev firebase-admin
   ```

2. **Generate service account JSON:**
   - Firebase Console → Project Settings → Service Accounts → "Generate new private key"
   - Save as `firebase-service-account.json` în repo root
   - **Verify gitignored:** `git check-ignore firebase-service-account.json` should output the path (added to `.gitignore`)

## Usage

**Dry-run preview (recommended first):**
```sh
node scripts/admin-cleanup.js --dry-run
```

**Production cleanup:**
```sh
node scripts/admin-cleanup.js
```

## What it does

1. **Soft-deleted accounts cleanup:** scans `users/{uid}` documents where `_deleted.scheduledHardDelete < now()`, performs:
   - `db.recursiveDelete(usersDoc)` — Firestore cascade subcollections
   - `auth.deleteUser(uid)` — Firebase Auth user removal (catches `auth/user-not-found` gracefully)

2. **Archived data cleanup:** scans `users/{uid}/_archived/{archiveId}` + `_archived/anonymous/items/*` cu `timestamp < (now - 7 zile)`, performs `db.recursiveDelete()`.

## Calendar reminder (Daniel weekly)

Per §62.9 LOCKED V1: trigger reminder Calendar Manual ~5 min duminică.

## Scope

- **Pre-Beta:** 50 testeri max → manual feasible.
- **v1.5+:** migrate to Cloud Function scheduled trigger (defer per §56.14.A).

## Files NOT committed (gitignored)

- `firebase-service-account.json` — secret credentials
