// ══ E2E test-user data cleanup (audit 2026-06-10, DATA-HIGH) ═══════════════
// The authenticated E2E suite signs in as the throwaway playwright-test account
// and exercises the REAL core loop against the PRODUCTION RTDB — so every CI run
// accumulated logs/PRs/sessions under that uid forever (829 logs after 3 days).
// Daniel's call: "nu trebuie sa scrie acolo... sau sa scrie si sa stearga dupa"
// → write-then-wipe. This script wipes the TEST uid's user node after the suite.
//
// SAFETY GUARDS (non-negotiable):
//   1. Requires PLAYWRIGHT_AUTH_TEST_UID — no uid, no delete (never guesses).
//   2. Looks the uid up in Firebase Auth and verifies its email matches
//      /^playwright-test/ before deleting ANYTHING. A real account (founder,
//      wife, mark seed) can never match → hard abort with exit 1.
//   3. Deletes ONLY `users/<uid>` (RTDB) — never touches Auth users or other uids.
//
// Env (same contract as tests/auth.setup.ts):
//   FIREBASE_SERVICE_ACCOUNT        inline Admin SA JSON (raw or base64) — CI path.
//   GOOGLE_APPLICATION_CREDENTIALS  SA file path — local path (~/.andura-admin/).
//   PLAYWRIGHT_AUTH_TEST_UID        the test uid to wipe (CI secret).
const admin = require('firebase-admin');

function loadServiceAccount() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (inline) {
    const raw = inline.trim().startsWith('{')
      ? inline
      : Buffer.from(inline, 'base64').toString('utf8');
    return JSON.parse(raw);
  }
  const file = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (file) return require(file);
  return null;
}

(async () => {
  const uid = (process.env.PLAYWRIGHT_AUTH_TEST_UID || '').trim();
  if (!uid) {
    console.log('[e2e-cleanup] no PLAYWRIGHT_AUTH_TEST_UID — nothing to clean (skip).');
    process.exit(0);
  }
  const sa = loadServiceAccount();
  if (!sa) {
    console.log('[e2e-cleanup] no service account in env — skip (SA-free run).');
    process.exit(0);
  }
  admin.initializeApp({
    credential: admin.credential.cert(sa),
    databaseURL:
      process.env.VITE_FIREBASE_RTDB_URL ||
      'https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app',
  });
  // GUARD 2 — identity check: refuse to delete anything that is not the
  // dedicated playwright-test account, whatever the env claims.
  const user = await admin.auth().getUser(uid);
  const email = (user.email || '').toLowerCase();
  if (!/^playwright-test/.test(email)) {
    console.error(`[e2e-cleanup] ABORT: uid ${uid.slice(0, 8)}… resolves to "${email}" — NOT a playwright-test account. Refusing to delete.`);
    process.exit(1);
  }
  const ref = admin.database().ref(`users/${uid}`);
  const before = await ref.once('value');
  const keys = before.exists() ? Object.keys(before.val() || {}).length : 0;
  await ref.remove();
  console.log(`[e2e-cleanup] wiped users/${uid.slice(0, 8)}… (${email}): ${keys} top-level keys removed.`);
  process.exit(0);
})().catch((e) => {
  console.error('[e2e-cleanup] failed:', e.message);
  process.exit(1);
});
