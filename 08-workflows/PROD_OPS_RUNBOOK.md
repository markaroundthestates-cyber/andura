---
title: PROD OPS Runbook V1 — Andura PWA Incident Response
status: ACTIVE_SSOT
created: 2026-05-20
authority: §A031 Wave A iter 1 audit fix (NC§34-C1)
cross_refs:
  - 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md
  - 08-workflows/BETA_ENTRY_CRITERIA.md
  - 08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md
  - .github/workflows/deploy.yml
  - src/util/sentry.js
  - scripts/healthcheck.cjs (A032 PENDING — see §6)
---

# PROD OPS Runbook — Andura PWA V1

Solo founder operational runbook. Daniel = only operator. ZERO escalation chain (no on-call rotation).
Decision tree pentru orice incident production live `andura.app`.

> **Deploy stack note:** Production is **GitHub Pages** (`peaceiris/actions-gh-pages@v4` → `gh-pages` branch),
> NOT Cloudflare Pages. Brief task A031 referenced Cloudflare — corrected here per `.github/workflows/deploy.yml:55-59`.
> If migration to Cloudflare happens later, update §2 + §3 + §5.4.

---

## §1 Severity classification

Daniel sets response time per level. ZERO SLA contract — bootstrap solo, best-effort.

| Level | Trigger | Response time | Action |
|-------|---------|---------------|--------|
| **P0** | Site fully down (DNS/build/deploy broken) | Immediate (within 30 min) | Rollback first, diagnose second |
| **P1** | Auth broken (Magic Link fail, login loop, token reject) | Within 2 hours | Sentry triage → hotfix sau rollback |
| **P2** | Feature degraded (engine wrong, workout flow stuck, Library missing exercises) | Within 24 hours | Diagnose → patch on next deploy |
| **P3** | Cosmetic (CSS glitch, wording, padding) | Next batch | Add to backlog, NU urgent |

**Heuristic:** dacă Gigel (user mediu non-tech RO) nu poate finaliza workout → P0 sau P1. Dacă doar arată urât → P3.

---

## §2 Incident response decision tree

```
Sentry alert sau Daniel observes prod issue
         │
         ▼
Step 1: TRIAGE — open Sentry dashboard (§5.1)
  • Last 24h errors count
  • Filter by tag: source=firebase  → §4.1 Firebase scenarios
  • Filter by tag: source=auth      → §4.4 Magic Link scenarios
  • New error type since last deploy? → §3 ROLLBACK candidate
         │
         ▼
Step 2: CLASSIFY severity (§1)
  P0/P1 → ROLLBACK path (§3)
  P2    → HOTFIX path (next commit)
  P3    → BACKLOG (📥_inbox/iter-1-mass-fix-v2/)
         │
         ▼
Step 3: EXECUTE rollback sau fix
         │
         ▼
Step 4: VERIFY recovery (§5.3 healthcheck + Lighthouse live)
         │
         ▼
Step 5: POST-MORTEM (1 line în CHAT_STATE.md + LATEST.md update if CC involved)
```

---

## §3 Rollback procedure (P0/P1 only)

**Default position:** rollback FIRST, diagnose AFTER. Bugatti paradigm = stable production > clever fix in flight.

### §3.1 Standard rollback (most cases)

```bash
# 1. Confirm bad commit is HEAD on main
git log -3 --oneline

# 2. Revert HEAD (creates new commit reverting bad change)
git revert HEAD --no-edit

# 3. Push to trigger redeploy via .github/workflows/deploy.yml
git push origin main
```

Wait ~2-3 min for GitHub Actions to complete (`deploy` job → `lighthouse-live` job).
Then verify §5.3 (healthcheck + browser smoke).

### §3.2 Multi-commit rollback (if HEAD-1 also bad)

```bash
# Identify last known-good commit (tags pre-major-change recommended)
git log --oneline -10
git revert <bad-commit-hash> --no-edit
# Sau multiple reverts back-to-back if multiple bad commits
git revert <hash-1> <hash-2> --no-edit
git push origin main
```

### §3.3 Emergency manual revert (GitHub Pages branch direct)

Last resort dacă `main` revert nu rezolvă (rare — gh-pages branch out of sync):

```bash
git checkout gh-pages
git log --oneline -5
git reset --hard <previous-known-good-commit>
git push origin gh-pages --force
git checkout main
```

> **Warning:** `--force` push violates default policy. Only use după Daniel explicit confirms (D031 invariant).

---

## §4 Common scenarios + fix recipes

### §4.1 Firebase RTDB quota exceeded

**Symptom:** Sentry errors tagged `source=firebase`, message includes "Quota exceeded" sau 429 status.

**Diagnose:**
1. Open Firebase Console → andura project → Realtime Database → Usage tab
2. Check daily download/connection limits (Spark free tier = 10GB/month, 100 concurrent)

**Fix options:**
- Short-term: rate-limit client reads (add throttle in `src/firebase/rtdb-client.js` — VERIFY exact path before editing)
- Medium-term: upgrade to Blaze pay-as-you-go (Daniel decision pre-Beta NU yet)
- Long-term: migrate hot reads to IndexedDB Tier 0 cache (per Tier strategy A036 PENDING)

### §4.2 Sentry error storm (>100 events/min)

**Symptom:** Sentry inbox flooded with same error type rapidly.

**Diagnose:**
1. Identify error fingerprint (Sentry groups identical errors)
2. Check `src/util/sentry.js:31-42` — is the error type in `beforeSend` filter?

**Fix:**
- If noise (e.g., new ResizeObserver variant): add to `beforeSend` drop list în `src/util/sentry.js:32-36`, commit + deploy
- If real bug: revert per §3.1
- Sentry quota: free tier = 5k errors/month. If flood exhausts quota, raise filter aggression first

### §4.3 GitHub Actions deploy failed

**Symptom:** Push to `main` did not refresh `andura.app` after ~5 min.

**Diagnose:**
1. Open `https://github.com/<owner>/salafull/actions` <!-- VERIFY: exact GitHub repo URL -->
2. Last run status: failed?
3. Common failures:
   - `npm ci --ignore-scripts` fail → package-lock.json drift, run `npm install` local then commit lockfile
   - `npm run typecheck` fail → TypeScript error reached main (CI gate caught it — pre-commit hook should have blocked)
   - `npm run test:run` fail → broken test reached main, run `npm run test:run` local + fix
   - `npm run build` fail → Vite build error, check `vite.config.js` + env vars `VITE_FIREBASE_API_KEY` + `VITE_FIREBASE_RTDB_URL` în GitHub Secrets

**Fix:** Address root cause, push fix commit. If urgent and root cause unclear → §3.1 rollback to last green commit.

### §4.4 Magic Link delivery delayed

**Symptom:** User reports no email received after Magic Link request.

**Diagnose:**
1. Firebase Console → Authentication → check sent logs (delivery status)
2. Sentry filter: tag `source=auth` for client-side errors

**Fix:**
- Firebase Auth quota: 100 emails/day free tier (Spark). Check usage.
- Email provider issue: Firebase uses Google SMTP — rare outage
- User in spam: communicate via in-app banner (no admin tooling yet — Daniel manual support email reply)

### §4.5 IndexedDB schema mismatch

**Symptom:** User opens app, gets white screen or "Unable to load data" error. Sentry: `VersionError` or Dexie schema error.

**Diagnose:**
1. Check `src/db/` Dexie schema version (VERIFY exact file before editing) — was version bumped without migration?
2. Sentry tag: search "Dexie" or "IndexedDB"

**Fix:**
- Short-term: user clears site data (Daniel comms in-app)
- Code fix: add Dexie migration in next deploy
- Anti-recurrence: every schema change requires explicit `.upgrade()` block per Dexie API

---

## §5 Dashboards + tools

### §5.1 Sentry dashboard

URL: `https://sentry.io/organizations/<org-slug>/projects/andura/` <!-- VERIFY: Daniel fill exact org slug -->

Project ingest DSN configured în `src/util/sentry.js:9` (org `o4511269200068608`, project `4511269203869776`).

Daniel daily check: morning open Sentry → Issues tab → filter last 24h → triage new errors.

Manual test from browser console (production only, post `initSentry`):
```js
window.testSentry('Manual smoke test from Daniel')
```

### §5.2 GitHub Actions dashboard

URL: `https://github.com/<owner>/salafull/actions` <!-- VERIFY: exact repo path -->

Check after every push to `main`. Three jobs run:
1. `deploy` — typecheck + vitest + build + gh-pages publish
2. `lighthouse-live` — post-deploy LHCI against `https://andura.app`
3. `checkly-deploy` — Checkly synthetic monitor refresh

If `deploy` red → see §4.3.

### §5.3 GitHub Pages settings + custom domain

URL: `https://github.com/<owner>/salafull/settings/pages` <!-- VERIFY: exact repo path -->

`gh-pages` branch must be selected as source. Custom domain `andura.app` configured via CNAME.

### §5.4 Healthcheck script (A032 PENDING)

`scripts/healthcheck.cjs` is NOT YET implemented (per BETA_ENTRY_CRITERIA §6 A032 PENDING).

When LANDED, run cadence:
- After every `git push origin main` → wait 3 min → `node scripts/healthcheck.cjs`
- Daily morning routine (Daniel manual)
- Pre-Beta gate (Bugatti audit V4)

Expected checks (target spec):
- `https://andura.app/` returns 200 + valid HTML
- Magic Link auth endpoint responds (Firebase REST identifier)
- Sentry DSN reachable
- Service Worker registered + cache valid

Until A032 LANDS, manual equivalent:
```bash
npm run lighthouse:live    # LHCI against andura.app
# + browser smoke: open https://andura.app în incognito, login Magic Link, complete 1 workout
```

---

## §6 Daniel contact + escalation

**Solo founder = ZERO escalation chain.** Daniel handles all production incidents.

Communication channels (incoming):
- Email: `maziludanielconstantin90@gmail.com` (verified user-level memory)
- In-app support: NOT IMPLEMENTED YET (user has no in-app feedback channel pre-Beta)

External vendor support:
- Firebase: Firebase Console → Support tab (Spark tier = community only, no paid support)
- Sentry: free tier = email-only support
- GitHub Pages: GitHub Status page <!-- VERIFY: https://www.githubstatus.com/ -->
- Domain registrar: <!-- VERIFY: which registrar holds andura.app DNS -->

---

## §7 Post-incident protocol

After P0/P1 resolved:
1. Append 1-2 line incident note în `CHAT_STATE.md` § live continuity
2. If structural fix needed → new ADR în `DECISIONS.md` (LOCKED V1, append-only)
3. If CC autonomous executed fix → CC writes `📤_outbox/LATEST.md` raport
4. If pattern likely recurs → add scenario to §4 of this runbook (Bugatti anti-recurrence loop)

NO blame-game post-mortem. Solo founder = single accountability. Root cause + anti-recurrence = the only artifacts.

---

🦫 **PROD OPS Runbook SSOT V1** — incident response singular source live `andura.app` production.
Wave A iter 1 A031 LANDED 2026-05-20. Companion artifacts: BETA_ENTRY_CRITERIA §6 ops readiness gate,
A032 healthcheck script PENDING, A033 deploy.yml rollback test PENDING, A034 BACKUP_DR_RUNBOOK PENDING.
