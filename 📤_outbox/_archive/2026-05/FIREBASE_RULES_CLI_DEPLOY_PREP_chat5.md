# Firebase rules CLI deploy prep chat 5 — 2026-05-23

Investigation HIGH security blocker pre-Beta. READ-ONLY raport. ZERO `firebase deploy` actual (require Daniel auth). ZERO src/ touched. Output = recommended setup + Daniel auth steps + risks.

Sursa drivers:
- `📤_outbox/audit-nuclear-2026-05-19/findings-§04.md` §4-C6 CRITICAL — Firestore rules manual Console publish drift risk.
- `📤_outbox/PRE_BETA_CHECKLIST_chat5.md:76` HIGH security blocker pending Daniel trigger.
- `firestore.rules:11-13` comment SSOT spec only, Daniel manual Console publish.
- `📥_inbox/iter-1-mass-fix-v2/_MASTER_BACKLOG.md:339` D015 GD M `firebase.json` + `.firebaserc` + `scripts/deploy-rules.cjs` + nightly drift check.

---

## §1 Current state

### Files prezente

| Path | Status | Detalii |
|------|--------|---------|
| `firestore.rules` | EXISTS | 79 LOC. `rules_version='2'`. Per-UID strict isolation `/users/{uid}`. Soft-delete `/_deleted/{uid}`. Archive `/_archived/anonymous` (server-only). Telemetry `/_telemetry/global` keys-whitelist. Sursa: ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04 §56.16. |
| `database.rules.json` | EXISTS | 10 LOC RTDB. Per-UID `users/$uid` read+write `auth.uid === $uid`. |
| `firebase.json` | MISSING | Required pentru CLI `firebase deploy --only` resolve rules paths. |
| `.firebaserc` | MISSING | Required pentru `firebase use` alias mapping fara Daniel pass project ID per command. |
| `scripts/deploy-rules.cjs` | MISSING | Wrapper opt — `firebase deploy --only firestore:rules,database` cu pre-flight diff + project alias verify. |
| `package.json` script `firebase:deploy:rules` | MISSING | npm convenience entry. |
| `firebase-tools` devDep | MISSING (in `package.json:53-101`) — Daniel rules global install OR `npx firebase-tools` invocation. Recommend devDep pentru reproducible pin. |

### Project identifiers (verified via filesystem)

- **Firebase project ID:** `fittracker-c34e8` (sursa `src/firebase.js:33` + `08-workflows/ENVIRONMENT_STRATEGY.md:99`).
- **Region:** `europe-west1` (RTDB endpoint suffix verified).
- **RTDB URL:** `https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app`.
- **Single-project pre-Beta:** ZERO staging environment activ (ENVIRONMENT_STRATEGY.md §3 staging post-Beta defer).

### Current deploy mecanism

Manual Daniel Console paste (per `firestore.rules:11-13` comment). Zero CLI infrastructure pana acum. Drift risk: Console edit fara repo commit back → repo SSOT spec divergent vs production rules active. Pre-Beta 50 testers protected privacy strict — drift = GDPR exposure §28 audit critical.

---

## §2 Recommended config

### `firebase.json` (repo root, NEW)

```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "database": {
    "rules": "database.rules.json"
  }
}
```

Rationale minimal:
- ZERO `hosting` section — Andura production = GitHub Pages (`andura.app` via gh-pages, NU Firebase Hosting). Per `package.json:14` `deploy` script `gh-pages -d dist`.
- ZERO `functions` section — ZERO Cloud Functions deployed pre-Beta (admin-cleanup manual Daniel weekly).
- ZERO `storage` section — Firebase Storage NU folosit (per `src/firebase.js` REST RTDB only + `src/util/telemetry.js` Firestore direct REST).

### `.firebaserc` (repo root, NEW)

```json
{
  "projects": {
    "default": "fittracker-c34e8"
  }
}
```

Rationale:
- Single alias `default` pre-Beta single-project (per ENVIRONMENT_STRATEGY.md §1 verdict singular V1 Beta).
- Post-Beta staging spawn: append `"staging": "andura-staging"` alias + `firebase use staging` switch (defer per ENVIRONMENT_STRATEGY.md §3.2).

### `scripts/deploy-rules.cjs` (NEW)

```javascript
#!/usr/bin/env node
// ══ DEPLOY-RULES — Firebase CLI rules sync wrapper ═══════════════════════
// §4-C6 audit fix — eliminates manual Console publish drift risk.
//
// Wraps `firebase deploy --only firestore:rules,database` with:
//   1. Pre-flight project alias verify (refuses run pe wrong project)
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
} catch (e) {
  err(`firebase use failed — login expired or .firebaserc missing. Run: firebase login + firebase use default`);
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
  err('Deploy failed — see Firebase CLI output above');
  process.exit(2);
}
```

### `package.json` scripts addition (snippet)

```json
"firebase:deploy:rules": "node scripts/deploy-rules.cjs",
"firebase:deploy:rules:dry": "node scripts/deploy-rules.cjs --dry-run"
```

Recommend devDep:

```bash
npm install --save-dev firebase-tools
```

Then script can drop global install requirement — `npx firebase-tools deploy` works too dar wrapper deja folosea `firebase` direct. Optional adjustment: înlocuieste `firebase` → `npx firebase-tools` în `deploy-rules.cjs` daca Daniel prefera ZERO global install.

---

## §3 Daniel auth steps (manual, one-time)

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   # SAU local: npm install --save-dev firebase-tools (recommended pin)
   ```

2. **Login (browser OAuth, one-time persistent):**
   ```bash
   firebase login
   ```
   - Daniel Google account cu access la `fittracker-c34e8` project.
   - Token cached `~/.config/configstore/firebase-tools.json` (Linux/Mac) sau `%APPDATA%\firebase-tools` (Windows).

3. **Verify project alias:**
   ```bash
   firebase use default
   # output expected: Now using project fittracker-c34e8
   ```

4. **Dry-run validate primul:**
   ```bash
   npm run firebase:deploy:rules:dry
   ```
   - Firebase CLI valideaza syntax `firestore.rules` + `database.rules.json` fara push live.

5. **Deploy live:**
   ```bash
   npm run firebase:deploy:rules
   ```
   - Live push rules → Firebase Console reflect imediat.

6. **Verify Console:**
   - Firebase Console → Firestore Database → Rules → confirm content match repo.
   - Firebase Console → Realtime Database → Rules → confirm content match repo.

7. **Post-Beta launch:** subsequent rules changes = repo edit → PR review → `npm run firebase:deploy:rules` post-merge. ZERO Console manual edit pre-merge.

---

## §4 Risks + mitigation

### Risk 1 — Wrong rules deploy locks out users (Beta 50 testers protected)

- **Probabilitate:** Medium (Daniel edit greset rules)
- **Impact:** HIGH — users 401/403 toate Firebase ops → app broken
- **Mitigare:**
  - Dry-run mandatory primul (step 4 §3)
  - `git diff firestore.rules database.rules.json` review pre-deploy
  - Quick rollback `git revert <commit>` + redeploy = ~2 min recovery

### Risk 2 — Repo/Console drift (CURRENT STATE)

- **Probabilitate:** HIGH (manual Console edit fara repo back-sync)
- **Impact:** CRITICAL (per §4-C6 audit) — production rules divergent vs SSOT spec, GDPR audit fail
- **Mitigare:**
  - Post-CLI deploy adoption: repo = ONLY source de truth. ZERO Console manual edit.
  - Drift detection cron (§6 opt below).

### Risk 3 — Wrong project deploy (e.g., staging post-spawn)

- **Probabilitate:** Low pre-Beta (single project) → Medium post-staging-spawn
- **Impact:** HIGH (cross-env rules pollution)
- **Mitigare:**
  - `scripts/deploy-rules.cjs` pre-flight check refuses unless `firebase use` matches `EXPECTED_PROJECT_ID`
  - Post-staging-spawn: add CLI flag `--project` explicit pe deploy command in CI

### Risk 4 — `firebase-tools` global version drift dev machine

- **Probabilitate:** Medium (Daniel solo dev, NU CI yet)
- **Impact:** Low-Medium (CLI changes minor pe rules deploy path mature)
- **Mitigare:**
  - Recommend `--save-dev firebase-tools` pin in `package.json` devDeps
  - Lockfile `package-lock.json` pinned version reproducible

### Risk 5 — Login token leak (`~/.config/configstore/firebase-tools.json`)

- **Probabilitate:** Low (machine Daniel local only)
- **Impact:** HIGH (full project access daca leaked)
- **Mitigare:**
  - Daniel BitLocker/FileVault disk encryption verify
  - Periodic `firebase logout` + re-login post-laptop-share scenarios
  - CI fix: service account JSON via GitHub Secrets, NU user token (per §5 opt)

---

## §5 CI workflow (optional, defer post-Beta)

Service account approach (NOT user token, audit-grade):

1. Firebase Console → Project Settings → Service Accounts → Generate new private key
2. Save as `firebase-service-account.json` (already in `.gitignore` line 32-33 per existing admin-cleanup script setup)
3. GitHub repo Secrets: paste JSON content ca `FIREBASE_SERVICE_ACCOUNT_KEY`
4. GitHub Actions workflow `.github/workflows/deploy-rules.yml`:
   ```yaml
   name: Deploy Firebase rules
   on:
     push:
       branches: [main]
       paths:
         - 'firestore.rules'
         - 'database.rules.json'
         - 'firebase.json'
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: '20' }
         - run: npm ci
         - name: Deploy rules
           env:
             GOOGLE_APPLICATION_CREDENTIALS: /tmp/sa.json
             FIREBASE_TOKEN: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_KEY }}
           run: |
             echo "$FIREBASE_TOKEN" > /tmp/sa.json
             npx firebase-tools deploy --only firestore:rules,database --project fittracker-c34e8
   ```

**Defer rationale:** Pre-Beta Daniel singular dev → manual CLI deploy suficient. Post-Beta + multi-contributor → CI auto-deploy + Daniel approve gate via GitHub branch protection rules path-changes.

---

## §6 Drift detection (optional, defer Post-Beta)

Approach: nightly cron compare repo rules vs Firebase Console live rules.

```bash
# scripts/check-rules-drift.cjs (defer)
# 1. firebase-admin SDK fetch live rules via getFirestoreSecurityRules + getRTDBRules
# 2. Compare strict equality vs repo files
# 3. Alert via Sentry capture OR email Daniel daca diff detected
# 4. Exit code 0 = match, 1 = drift
```

GitHub Actions schedule:
```yaml
on:
  schedule:
    - cron: '0 6 * * *'  # 06:00 UTC daily
```

**Defer rationale:** Pre-Beta solo Daniel — adopt CLI deploy = drift gone by discipline. Post-Beta + team contributors → drift detection critical. Implementation = separate scope, ~1h Co-CTO + Daniel test verify.

---

## §7 Effort estimate

| Task | Owner | Estimate |
|------|-------|----------|
| Create `firebase.json` + `.firebaserc` | Co-CTO Tooling | 2 min |
| Write `scripts/deploy-rules.cjs` | Co-CTO Tooling | 10 min (per spec §2) |
| Add `package.json` scripts entry | Co-CTO Tooling | 1 min |
| Optional: `npm install --save-dev firebase-tools` | Daniel manual | 1 min |
| `firebase login` | Daniel manual | 2 min (browser OAuth) |
| `firebase use default` | Daniel manual | 10 sec |
| `npm run firebase:deploy:rules:dry` | Daniel manual | 30 sec |
| `npm run firebase:deploy:rules` (first live) | Daniel manual | 30 sec |
| Firebase Console verify | Daniel manual | 1 min |
| **Total initial setup** | **Co-CTO + Daniel** | **~18 min** |

Ongoing maintenance:
- Per rules edit: `git diff` review + `npm run firebase:deploy:rules:dry` + actual deploy + Console verify = **~2 min Daniel**
- Frequency: low (rules edits rare pre-Beta — last batch 3 extensions 2026-05-06).

---

## §8 Recommendation Co-CTO

**Execute now (READY):**
1. Co-CTO Tooling phase: Create 3 files (`firebase.json` + `.firebaserc` + `scripts/deploy-rules.cjs`) + `package.json` scripts entry. Single Bugatti atomic commit (D031 invariant — NU push). ~13 min.
2. Document in `08-workflows/firebase-rules-publish-workflow.md` (NEW) — Daniel quick-ref pentru CLI deploy procedure.

**Pending Daniel auth trigger (BLOCKING):**
1. `firebase login` browser OAuth (one-time persistent token)
2. `firebase use default` activate alias
3. `npm run firebase:deploy:rules:dry` validate syntax
4. `npm run firebase:deploy:rules` first live deploy
5. Console verify match

**Defer post-Beta:**
- Service account + GitHub Actions CI auto-deploy (audit-grade rotation; pre-Beta solo Daniel manual safe)
- Drift detection cron (adoption discipline mai întâi)
- Staging Firebase project spawn (per ENVIRONMENT_STRATEGY.md §3 defer)

**ZERO blockers tooling side.** Daniel auth steps independent + reversible (re-run safe). Risc mitigare prin dry-run + git revert path documented.

---

## §9 Open questions Daniel CEO (decizii strategice)

| Q | Default Co-CTO recommend |
|---|--------------------------|
| Install `firebase-tools` global vs `--save-dev`? | **`--save-dev`** (lockfile pin reproducible, ZERO global pollution) |
| Adopt drift-detection cron pre-Beta? | **NU** (defer post-Beta; adoption discipline suficient pre-Beta solo) |
| GitHub Actions CI auto-deploy rules pe push main? | **NU pre-Beta** (Daniel manual gate safer; defer post-Beta + multi-contributor) |
| Document procedure în `08-workflows/firebase-rules-publish-workflow.md`? | **DA** (Daniel quick-ref + audit trail) |

---

## §10 Sursa SSOT references

- `firestore.rules:11-13` — manual Console publish current state comment
- `database.rules.json` — RTDB rules SSOT spec
- `src/firebase.js:33` — RTDB URL hardcoded fallback (project ID extract source)
- `08-workflows/ENVIRONMENT_STRATEGY.md:99,157` — single-project pre-Beta verdict
- `08-workflows/DEFINITION_OF_DONE.md:127-129` — DoD entry "New Firebase write path: deploy rules" CLI ref
- `08-workflows/DATA_BREACH_RESPONSE.md:72` — incident response deploy CLI ref
- `📤_outbox/audit-nuclear-2026-05-19/findings-§04.md` §4-C6 — CRITICAL audit finding (drift risk)
- `📥_inbox/iter-1-mass-fix-v2/_MASTER_BACKLOG.md:339` — D015 backlog entry
- `📤_outbox/PRE_BETA_CHECKLIST_chat5.md:76,177` — HIGH security blocker pending Daniel trigger
