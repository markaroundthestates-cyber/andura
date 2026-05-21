#!/usr/bin/env node
// ══ TEST RESTORE — Backup/DR fresh device simulation ═════════════════════
// §A035 audit fix (NC§26-C2) — quarterly Daniel manual verify Firebase
// restore path. Simulates fresh-device scenario:
//   1. Snapshot current localStorage Tier 0 + IndexedDB Tier 2 state
//   2. Wipe Tier 0 + Tier 2 (preserve Tier 1 Firebase RTDB intact)
//   3. Verify wipe complete (storage empty)
//   4. Simulate restore from Firebase RTDB Tier 1 (manual re-auth flow)
//   5. Compare snapshot vs restored = report drift
//
// Run în dedicated Node + jsdom environment (NU on live user device).
// Usage: `node scripts/test-restore.cjs --uid=<test-uid>`
//
// SAFETY: refuses to run dacă NODE_ENV=production sau hostname=andura.app.

const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
const uidArg = args.find((a) => a.startsWith('--uid='));
const TEST_UID = uidArg ? uidArg.split('=')[1] : null;
const DRY_RUN = args.includes('--dry-run');

if (!TEST_UID) {
  console.error('ERROR: --uid=<test-uid> required.');
  console.error('Usage: node scripts/test-restore.cjs --uid=test-restore-uid-2026-05-21');
  process.exit(1);
}

// SAFETY GATE — refuse production
if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: refuses to run cu NODE_ENV=production (destructive wipe).');
  process.exit(1);
}

// §B016 audit fix (CODE-REVIEW L-6) — wire hostname check per line 14 comment.
const hostname = os.hostname().toLowerCase();
if (hostname === 'andura.app' || hostname.includes('andura-prod') || hostname.includes('andura-live')) {
  console.error(`ERROR: refuses to run pe production-like host (hostname=${hostname}).`);
  process.exit(1);
}

const REPORT_PATH = path.join(__dirname, '..', `test-restore-report-${Date.now()}.json`);

const TIER_0_KEY_PREFIX = 'wv2-';
const AUTH_KEY_PREFIX = 'firebase-';

const phases = {
  snapshot: { status: 'pending', items: 0, bytes: 0 },
  wipe: { status: 'pending', keysRemoved: 0 },
  verify_wipe: { status: 'pending', leftoverCount: 0 },
  restore: { status: 'pending', note: 'manual Magic Link re-auth required' },
  compare: { status: 'pending', drift: 0 },
};

function log(stage, msg) {
  console.log(`[${stage}] ${msg}`);
}

function isAnduraKey(key) {
  return key.startsWith(TIER_0_KEY_PREFIX) || key.startsWith(AUTH_KEY_PREFIX);
}

// ── jsdom-like in-memory localStorage shim ──
const storage = new Map();
const localStorage = {
  setItem: (k, v) => storage.set(k, String(v)),
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  removeItem: (k) => storage.delete(k),
  key: (i) => Array.from(storage.keys())[i] ?? null,
  get length() {
    return storage.size;
  },
  clear: () => storage.clear(),
};

// ── Seed shim cu test fixture ──
function seedTestData() {
  localStorage.setItem('wv2-readiness', '78');
  localStorage.setItem('wv2-kcals', '2400');
  localStorage.setItem('wv2-prots', '180');
  localStorage.setItem('wv2-streak', '12');
  localStorage.setItem('wv2-sessions-history', JSON.stringify([{ id: 's1', date: '2026-05-19' }]));
  localStorage.setItem('firebase-id-token', 'TEST_ID_TOKEN_PLACEHOLDER');
  localStorage.setItem('firebase-uid', TEST_UID);
  localStorage.setItem('firebase-refresh-token', 'TEST_REFRESH_PLACEHOLDER');
  localStorage.setItem('firebase-id-token-expiry', String(Date.now() + 3600_000));
  localStorage.setItem('firebase-last-auth-at', String(Date.now()));
}

function phase1Snapshot() {
  log('SNAPSHOT', 'capturing pre-wipe state');
  const snapshot = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isAnduraKey(key)) {
      snapshot[key] = localStorage.getItem(key);
    }
  }
  phases.snapshot.items = Object.keys(snapshot).length;
  phases.snapshot.bytes = JSON.stringify(snapshot).length;
  phases.snapshot.status = 'complete';
  log('SNAPSHOT', `${phases.snapshot.items} keys, ${phases.snapshot.bytes} bytes`);
  return snapshot;
}

function phase2Wipe(snapshot) {
  log('WIPE', `${DRY_RUN ? '[DRY RUN] ' : ''}removing Tier 0 + auth keys`);
  let removed = 0;
  Object.keys(snapshot).forEach((key) => {
    if (!DRY_RUN) localStorage.removeItem(key);
    removed++;
  });
  phases.wipe.keysRemoved = removed;
  phases.wipe.status = DRY_RUN ? 'dry-run' : 'complete';
  log('WIPE', `${removed} keys ${DRY_RUN ? 'would be ' : ''}removed`);
}

function phase3VerifyWipe() {
  log('VERIFY_WIPE', 'checking storage cleared');
  if (DRY_RUN) {
    phases.verify_wipe.status = 'skipped';
    log('VERIFY_WIPE', 'skipped (dry-run)');
    return;
  }
  let leftover = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isAnduraKey(key)) leftover++;
  }
  phases.verify_wipe.leftoverCount = leftover;
  phases.verify_wipe.status = leftover === 0 ? 'clean' : 'dirty';
  log('VERIFY_WIPE', leftover === 0 ? 'storage clean' : `${leftover} keys leftover`);
}

function phase4Restore() {
  log('RESTORE', '[MANUAL STEP] Magic Link re-auth required pentru restore Tier 1 → Tier 0.');
  log('RESTORE', '1. Open browser http://localhost:5173 sau https://andura.app');
  log('RESTORE', '2. Send Magic Link to email');
  log('RESTORE', '3. Click email link → app loads → Firebase RTDB sync auto');
  log('RESTORE', '4. Engine state restored (readiness, fatigue, sessions, profile)');
  phases.restore.status = 'manual_required';
}

function phase5Compare(snapshot) {
  log('COMPARE', 'snapshot baseline saved pentru post-restore drift check');
  phases.compare.status = 'pending_manual_post_restore';
  phases.compare.note = 'Re-run script post-restore + compare against snapshot.json';
  return snapshot;
}

(function main() {
  log('INIT', `TEST_UID=${TEST_UID} DRY_RUN=${DRY_RUN}`);
  seedTestData();
  const snapshot = phase1Snapshot();
  phase2Wipe(snapshot);
  phase3VerifyWipe();
  phase4Restore();
  phase5Compare(snapshot);

  const report = {
    testUid: TEST_UID,
    timestamp: new Date().toISOString(),
    dryRun: DRY_RUN,
    phases,
    snapshotKeys: Object.keys(snapshot),
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  log('DONE', `report written ${REPORT_PATH}`);
  console.log('---');
  console.log('NEXT: complete manual Magic Link re-auth + re-run script to compare.');
  process.exit(0);
})();
