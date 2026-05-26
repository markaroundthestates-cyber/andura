#!/usr/bin/env node
// == DEPLOY-RULES -- Firebase CLI rules sync wrapper ======================
// 4-C6 audit fix -- eliminates manual Console publish drift risk.
//
// Wraps `firebase deploy --only firestore:rules,database` with:
//   1. Pre-flight project alias verify (refuses run on wrong project)
//   2. Pre-flight rules file existence check
//   3. Dry-run diff opt
//   4. Post-deploy success log + timestamp
//
// Usage:
//   node scripts/deploy-rules.cjs           # actual deploy
//   node scripts/deploy-rules.cjs --dry-run # validate only, no deploy
//
// Pre-run setup (Daniel one-time):
//   1. npm install -g firebase-tools  (sau npm install --save-dev firebase-tools)
//   2. firebase login
//   3. firebase use default            (selects fittracker-c34e8 via .firebaserc)
//
// Exit code: 0 = success, 1 = pre-flight fail, 2 = deploy fail.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const REPO_ROOT = path.resolve(__dirname, '..');
const EXPECTED_PROJECT_ID = 'fittracker-c34e8';

function log(msg) { console.log(`[deploy-rules] ${msg}`); }
function err(msg) { console.error(`[deploy-rules] ERROR: ${msg}`); }

// Pre-flight 1: rules files exist
const firestoreRulesPath = path.join(REPO_ROOT, 'firestore.rules');
const rtdbRulesPath = path.join(REPO_ROOT, 'database.rules.json');
if (!fs.existsSync(firestoreRulesPath)) {
  err(`Missing ${firestoreRulesPath}`);
  process.exit(1);
}
if (!fs.existsSync(rtdbRulesPath)) {
  err(`Missing ${rtdbRulesPath}`);
  process.exit(1);
}
log(`Rules files OK (firestore.rules ${fs.statSync(firestoreRulesPath).size}B, database.rules.json ${fs.statSync(rtdbRulesPath).size}B)`);

// Pre-flight 2: firebase CLI installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
} catch {
  err('firebase CLI not installed. Run: npm install -g firebase-tools');
  process.exit(1);
}

// Pre-flight 3: active project alias matches expected
let activeProject;
try {
  activeProject = execSync('firebase use', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
} catch {
  err(`firebase use failed -- login expired or .firebaserc missing. Run: firebase login + firebase use default`);
  process.exit(1);
}
if (!activeProject.includes(EXPECTED_PROJECT_ID)) {
  err(`Active project mismatch. Expected ${EXPECTED_PROJECT_ID}, got: ${activeProject}`);
  err(`Run: firebase use default`);
  process.exit(1);
}
log(`Active project OK (${EXPECTED_PROJECT_ID})`);

// Deploy (or dry-run)
const cmd = DRY_RUN
  ? 'firebase deploy --only firestore:rules,database --dry-run'
  : 'firebase deploy --only firestore:rules,database';
log(`Running: ${cmd}`);
try {
  execSync(cmd, { stdio: 'inherit', cwd: REPO_ROOT });
  log(`${DRY_RUN ? 'DRY-RUN' : 'DEPLOY'} success @ ${new Date().toISOString()}`);
  process.exit(0);
} catch {
  err('Deploy failed -- see Firebase CLI output above');
  process.exit(2);
}
