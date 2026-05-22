<!-- generated-by: gsd-doc-writer -->
---
title: Backup & Disaster Recovery Runbook V1 — Andura PWA
status: ACTIVE_SSOT
created: 2026-05-20
authority: §A034 Wave A iter 1 audit fix (NC§26-C1)
cross_refs:
  - 08-workflows/PROD_OPS_RUNBOOK.md (A031 parallel sibling)
  - 08-workflows/BETA_ENTRY_CRITERIA.md
  - scripts/test-restore.cjs (A035 NEW)
  - src/auth.js (Magic Link restore path)
  - src/util/tierStorage.js (Tier 2 90-day rotation)
  - DECISIONS.md §D045 (Tier 2 90-day rolling rotation V1)
---

# Backup & Disaster Recovery Runbook — Andura PWA V1

Solo-founder Daniel CEO operational doc. Practical steps, ZERO vague guidance.
Tier 1 Firebase RTDB = canonical truth. Tier 2 IndexedDB = local archive. Tier 0 localStorage = regenerable from 1+2.

## §1 Data tier classification (per ADR §35-C1 + D045)

| Tier | Storage | Scope | Backup priority |
|------|---------|-------|-----------------|
| Tier 0 | `localStorage` `wv2-*` + `firebase-*` keys | Auth tokens + UI cache, ephemeral | NU back up (regenerable) |
| Tier 1 | Firebase RTDB `users/{uid}/` | Engine state, sessions, PRs, profile, readiness | CRITICAL — daily export |
| Tier 2 | IndexedDB per UID | Workout logs 90-day rolling rotation | HIGH — weekly export |

Auth tokens (`firebase-id-token`, `firebase-uid`, `firebase-refresh-token`) NU se backup — restore via Magic Link re-auth (see §4).

## §2 Firebase RTDB backup schedule (Tier 1)

**Schedule (LOCKED V1):**
- **Daily** — manual export 09:00-10:00 EET Daniel routine (calendar reminder recurring)
- **Weekly** — Sunday 22:00 EET extended verification (file size delta check + integrity validate)
- **Monthly** — first Sunday quarterly off-site copy to external drive

**Cadence rationale:** daily manual NU cron — Daniel solo bootstrap, Beta scale ≤50 users → infra scheduler over-engineered. Post-Beta revisit cron via Firebase Cloud Function `scheduled-backup-rtdb` (placeholder ADR future).

**Retention policy (rolling window):**
- **7 daily** — last week granular recovery
- **4 weekly** — last month medium-grain
- **12 monthly** — last year coarse-grain
- **Total** ~23 backups disk footprint ~25-50MB rolling (Tier 1 export typical 1-2MB)

**Pruning rule:** oldest daily >7 days → promote to weekly slot OR delete if weekly slot full. Daniel manual prune monthly during routine.

**Storage location:** `~/Documents/andura-backups/` primary. Quarterly off-site mirror to external drive (separate physical media, ransomware isolation per §8.3).

**Steps:**
1. Browse `https://console.firebase.google.com/`
2. Select project Andura (verify project ID matches deploy env `VITE_FIREBASE_RTDB_URL` domain prefix)
3. Sidebar > **Realtime Database**
4. Top-right 3-dot menu > **Export JSON**
5. Save as `andura-rtdb-YYYY-MM-DD.json` în `~/Documents/andura-backups/`
6. Verify file >1KB + valid JSON: `node -e "JSON.parse(require('fs').readFileSync('andura-rtdb-YYYY-MM-DD.json'))"` exit 0

**Quarterly off-site:** copy entire `~/Documents/andura-backups/` folder pe external drive sau encrypted cloud (Daniel's personal Drive, NU Andura account — separation of concerns).

## §3 IndexedDB Tier 2 archive (per-UID export)

**Frequency:** weekly manual cycle for primary Daniel account. Beta users' Tier 2 already replicates Tier 1 sync — Tier 2 backup optional for them.
**Tool:** `scripts/test-restore.cjs` (parallel task A035 NEW, parallel sibling to this runbook).

**Steps:**
1. Open `andura.app` în Chrome desktop (sau localhost dev `npm run dev`)
2. DevTools > Application > IndexedDB > select database `andura-{uid}` > Export (3-dot menu)
3. Save as `andura-tier2-backup-YYYY-MM-DD-{uid-first-8-chars}.json`
4. Store alongside Tier 1 backups în `~/Documents/andura-backups/tier2/`

**Note:** Tier 2 is 90-day rolling (D045 LOCKED V1) — older entries auto-aggregated into Tier 1 monthly summaries via `src/util/tierStorage.js` `aggregateLogs()` + `archiveLogs()`. Backup of Tier 2 captures only the live 90-day window.

## §4 Fresh device restore (user lost phone scenario)

Scenario: user phone lost/stolen/broken → new device → restore engine state.

**Steps (user-facing UX):**
1. New device > browser > navigate `andura.app`
2. Install PWA prompt > Add to Home Screen
3. Open Andura > tap **Cont** tab > **Login cu Magic Link**
4. Enter same email used previously
5. Open email > tap Magic Link > auto-redirect `andura.app/auth-callback?oobCode=...`
6. App detects `oobCode` via `parseMagicLinkUrl()` (`src/auth.js:156`) > calls `verifyMagicLink()` (`src/auth.js:127`) > `_persistAuth()` stores new tokens
7. Engine state auto-syncs from Firebase RTDB `users/{uid}/` Tier 1 canonical
8. Tier 2 IndexedDB rebuilds locally as user navigates (lazy fetch + cache)

**Expected restore time:** ~30 seconds active (Magic Link email arrival + tap + redirect). NO data loss for Tier 1 (canonical server source). Tier 2 historical 90-day window restores progressively as user views Sesiuni tab.

**Daniel test cycle:** quarterly wipe-and-restore Daniel test device. Checklist §6.

## §5 Critical data identification — what MUST be backed up

CRITICAL (Tier 1 Firebase RTDB):
- `users/{uid}/profile` — name, age, gym tier, equipment
- `users/{uid}/sessions/` — workout sessions log canonical
- `users/{uid}/PRs/` — personal records all exercises
- `users/{uid}/engineState/` — readiness, fatigue, MMI, 8 engines + #9 MMI pipeline state
- `users/{uid}/settings/` — preferences, notifications, theme
- `users/{uid}/onboarding/` — T0-T3 tier classification + answers

HIGH (Tier 2 IndexedDB):
- Live 90-day workout logs (re-derivable from Tier 1 sessions but slower)
- Local aggregates 90d-1yr (re-computable but expensive)
- Archive >1yr lunar summaries (re-computable but historic detail lost if Tier 1 truncated)

NU backup (regenerable):
- Tier 0 `localStorage` auth tokens (Magic Link re-auth restores)
- Tier 0 `wv2-*` UI cache (computed from Tier 1+2)
- Service Worker cache (rebuilds on next visit)

## §6 Test-restore cycle (quarterly Daniel manual)

**Frequency:** every 3 months Daniel calendar reminder.
**Goal:** verify backup pipeline actually works end-to-end.

**Checklist (10 items):**
1. Export Tier 1 Firebase RTDB JSON fresh (per §2)
2. Open second device (sau Chrome Incognito) NOT logged in
3. Navigate `andura.app` > install PWA > tap **Login cu Magic Link**
4. Enter Daniel test email > receive Magic Link < 60s
5. Tap link > verify auto-redirect to `auth-callback` route
6. Verify Antrenor tab loads cu correct profile name + tier
7. Verify Workout tab shows last session date + readiness score
8. Verify Sesiuni tab shows recent workout history (Tier 1 sync from server)
9. Tap Sesiuni > scroll past 30 days > verify Tier 2 archive lazy loads
10. Logout > re-login Magic Link > verify state persists post-signout (Tier 1 sync re-fetch)

**Pass:** all 10 items verde + no console errors. **Fail:** investigate root cause + fix before next launch milestone.

## §7 RTO + RTPO targets

**Recovery Time Objective (RTO):** ≤ 24h restore for catastrophic Firebase outage scenario.
**Recovery Point Objective (RPO):** ≤ 24h data loss tolerance (matches daily Tier 1 export cadence).

**Realistic expectations:**
- Firebase RTDB SLA = 99.95% uptime → ~4.4h/year planned downtime tolerance
- Magic Link delivery dependent on email provider (Gmail/Outlook typical <60s)
- Cloudflare CDN cached static assets accessible even cu Firebase outage (UI shell loads, data unavailable until RTDB back)

**Solo-founder cap:** Daniel NU 24/7 on-call. If catastrophic incident outside business hours, recovery starts next business day. Beta users informed via `andura.app` status banner (post-Beta consider statuspage.io subscription).

## §8 DR scenarios + recovery plans

### §8.1 Firebase project accidentally deleted

**Detection:** all live users see auth failures + RTDB unreachable.
**Recovery:**
1. Firebase Console > Recently Deleted Projects (30-day grace period)
2. Restore project within grace window
3. If grace expired: create new Firebase project > import last Tier 1 JSON backup via Console > Realtime Database > Import JSON
4. Update `VITE_FIREBASE_API_KEY` + `VITE_FIREBASE_RTDB_URL` în Cloudflare Pages env > redeploy
5. All users must re-auth Magic Link (new project = new uid namespace, NOT compatible cu old uids unless manual migration)

**Worst case:** complete data loss for any user activity post last backup (≤24h per RPO).

### §8.2 Daniel Firebase account compromised

**Detection:** unexpected billing alerts, unknown users in Authentication tab, project settings modified.
**Recovery:**
1. Google account password reset immediate
2. Enable 2FA hardware key (YubiKey) on Google account
3. Firebase Console > Authentication > review user list for unknown additions > delete
4. Project settings > Service Accounts > rotate all keys
5. Cloudflare Pages env vars > rotate API keys
6. Force-redeploy `npm run build && wrangler pages deploy dist` (or equivalent deploy pipeline)
7. Notify Beta users via email if any unauthorized data access suspected

### §8.3 Ransomware on dev machine

**Detection:** files encrypted, ransom note.
**Recovery:**
1. Disconnect dev machine network IMMEDIATELY (anti-spread)
2. Source code recovery: `git clone https://github.com/{daniel}/{andura-repo}` to clean machine (GitHub = off-site canonical)
3. Backup recovery: external drive Tier 1 + Tier 2 JSON files (quarterly off-site per §2)
4. Production unaffected (Firebase + Cloudflare separate from dev machine)
5. Rotate any secrets that may have been în plaintext on dev machine (`.env.local`, Firebase API keys)

### §8.4 Cloudflare account locked

**Detection:** `andura.app` returns 404 sau Cloudflare error page.
**Recovery:**
1. Cloudflare account recovery flow via support
2. If unrecoverable: migrate domain DNS to alternate provider (Vercel, Netlify, fly.io)
3. Rebuild `npm run build` > deploy to new provider
4. Update domain DNS records to point to new provider IPs
5. Firebase backend unaffected — only CDN/hosting layer impacted

**Tip:** keep alternate provider account dormant pre-configured pentru emergency cutover < 2h.

## §9 Backup verification log

Daniel maintains simple text log `~/Documents/andura-backups/_log.txt`:
```
2026-05-20 Tier 1 export OK (1.2MB)
2026-05-20 Tier 2 export OK Daniel uid (450KB)
2026-05-13 Tier 1 export OK (1.1MB)
2026-05-13 Quarterly test-restore PASS 10/10
```

Quick scan = audit trail. NU automation — solo-founder lean.

## §10 Cross-references

- `08-workflows/PROD_OPS_RUNBOOK.md` — A031 parallel sibling, deploy + healthcheck procedures
- `08-workflows/BETA_ENTRY_CRITERIA.md` — §1 §26 Backup/DR closure gate
- `scripts/test-restore.cjs` — A035 NEW automated verification helper
- `src/auth.js` — Magic Link restore implementation (`verifyMagicLink` §1-127, `_persistAuth` §354)
- `src/util/tierStorage.js` — Tier 2 90-day rotation logic
- `DECISIONS.md` §D045 — Tier 2 90-day rolling rotation V1 LOCKED
- ADR §35-C1 — Tier 0/1/2 architecture canonical reference
