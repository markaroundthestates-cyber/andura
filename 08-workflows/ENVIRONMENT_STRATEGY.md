---
title: Environment Strategy — Single Firebase Project Pre-Beta
status: ACTIVE_SSOT
created: 2026-05-22
authority: §24-H3 audit-nuclear-2026-05-19 closure
cross_refs:
  - 08-workflows/FEATURE_FLAGS.md (§24-H1 VITE_* build-time env vars)
  - 08-workflows/AB_TEST_STRATEGY.md (§24-H2 V1 solo defer post-Beta)
  - 08-workflows/BETA_ENTRY_CRITERIA.md §6 (production ops readiness)
  - 08-workflows/BACKUP_DR_RUNBOOK.md (Firebase RTDB backup pre-migration)
  - 08-workflows/PROD_OPS_RUNBOOK.md (deploy + rollback)
  - 08-workflows/DATA_OWNERSHIP.md §6 (data residency europe-west1)
  - src/firebase.js §4-H4 (VITE_FIREBASE_RTDB_URL env-var swap)
  - DECISIONS.md (env split LOCKED V1 entry when triggers)
---

# Environment Strategy — Andura PWA V1

> **Verdict singular V1 Beta:** ONE Firebase project (`fittracker-c34e8`)
> servește dev + prod simultan. Daniel solo founder = single-developer scope;
> cost minimization + ZERO overhead pre-Beta. Staging environment spawn
> post-Beta când multi-user risk emerges.

---

## §1 Setup curent (verified filesystem 2026-05-22)

**Single Firebase project:** `fittracker-c34e8` (verified din `src/firebase.js`
+ `index.html` + telemetry config).

**Componente single-project:**
- **Auth** — Magic Link + OAuth Google (Phase 3 PENDING) — same provider all envs
- **RTDB** — `https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app`
  (per `src/firebase.js` §4-H4 env-var injectabil cu hardcoded fallback)
- **Region** — `europe-west1` (frankfurt) — EU/EEA data residency (per
  `DATA_OWNERSHIP.md` §6)
- **Plan tier** — Spark (free) — pre-Beta cost minimization

**Dev = Prod same project consequences:**
- Daniel local `npm run dev` → scrie în RTDB live production
- Path-isolation prin uid (`/users/<uid>/...`) — Daniel propriu uid izolat
- ZERO cohabitation real users pre-Beta (Daniel + 0 external users)

---

## §2 Rationale single-project pre-Beta

**Pro single-project:**
- **Cost zero overhead** — Spark free tier acoperă Daniel dev + Beta launch
  (≤100 useri primii ~3 luni)
- **Setup velocity** — ZERO env switching context cognitive load
- **Auth simplificat** — same Magic Link + OAuth credentials, ZERO setup
  duplicate
- **Solo developer scope** — N=1 dev means risk collision = self-collision only
- **Pre-Beta = Daniel-only data** — ZERO real user data risk pre-launch

**Con single-project (acknowledged + mitigated):**
- Dev mutations affect "prod" RTDB — mitigat: Daniel solo + path-isolation
  per uid + Daniel testing uid distinct de viitor real users
- Magic Link development → trimite email-uri reale prin SMTP single config —
  mitigat: Daniel propriu inbox testing (ZERO impact externi)
- Sentry production stream include dev errors — mitigat: §17-M3 PII stripped +
  dev events sample 10% diluted post-launch volume

**Decizia explicit pre-Beta:** Risk single-project < cost+overhead dual-project
pentru solo founder. FORWARD_COMPAT_PRINCIPLES §1 documented rationale.

---

## §3 Path migration plan (post-Beta staging spawn)

### §3.1 Trigger conditii

Activeaza staging spawn când ORICARE din:
- ≥1 colaborator extern (≥2 developers concurrent on codebase)
- ≥10 useri real activi săptămânal (real production data sensitive)
- Înainte de orice schema migration majoră (test pe staging primul)
- Pre-Beta launch official anunțat public (zone external traffic real)

### §3.2 Spawn procedure

1. **Create staging Firebase project** — name `andura-staging` (Spark free tier
   continues; cost rămane $0/mo)
2. **Configure region** — `europe-west1` match production (data residency
   consistency)
3. **Generate API credentials** — staging API key + OAuth client distinct
4. **Set staging env vars** în Vercel preview deployment (deploy preview
   branch = staging Firebase project):
   ```
   VITE_FIREBASE_RTDB_URL=https://andura-staging-default-rtdb.europe-west1.firebasedatabase.app
   VITE_FIREBASE_API_KEY=<staging-key>
   VITE_GOOGLE_OAUTH_CLIENT_ID=<staging-oauth-id>
   VITE_SENTRY_DSN=<staging-sentry-project>
   ```
   (per FEATURE_FLAGS.md §2 build-time `VITE_*` flag tier)
5. **Update `src/firebase.js`** — ZERO source change (env-var fallback pattern
   §4-H4 already supports swap without code touch)
6. **CI deploy logic:**
   - `main` branch → production Firebase project (`fittracker-c34e8`)
   - `staging` branch sau Vercel preview → staging Firebase project
     (`andura-staging`)
7. **Seed staging data** — script `npm run seed:staging` pentru baseline test
   user accounts (anonymized synthetic data, NU production export)
8. **DECISIONS.md entry** — LOCKED V1 cu env split rationale + reconsideration
   trigger (when sunset staging dacă scope shrinks)

### §3.3 Pre-launch staging migration checklist

- Daniel dev local → pointed la staging (`.env.local` cu VITE_* staging vars)
- CI builds main branch → production project ONLY
- Backup snapshot production RTDB pre-staging-spawn (per `BACKUP_DR_RUNBOOK.md`)
- Smoke test staging end-to-end (Magic Link + OAuth + onboarding + workout
  flow) ÎNAINTE production traffic real
- Sentry environments separate (`environment: 'production'` vs
  `'staging'` în `src/util/sentry.js`)

---

## §4 Risk acknowledgement pre-Beta single-project

**Risc 1 — Dev data pollution în "prod" RTDB**
- *Probabilitate:* high pe dev cycle
- *Impact:* low pre-Beta (Daniel singular uid path-isolated)
- *Mitigare:* path-isolation `/users/<uid>/...` strict; Daniel testing uid
  distinct (post-auth real uid)
- *Trigger escalation:* ≥1 external user → spawn staging instant

**Risc 2 — Production credentials leak risk via dev environment**
- *Probabilitate:* low (Daniel propriu device hardened)
- *Impact:* medium (Firebase RTDB rules permit only uid match path)
- *Mitigare:* Firebase Security Rules require auth + uid match path; ZERO
  service account keys committed
- *Trigger escalation:* commit accident → revoke + rotate credentials

**Risc 3 — Magic Link email spam dev cycle (SMTP send pe dev)**
- *Probabilitate:* medium pe dev iterations
- *Impact:* low (Daniel propriu inbox)
- *Mitigare:* `import.meta.env.DEV` mock login bypass (per FEATURE_FLAGS.md §1
  + `src/react/routes/screens/Auth.tsx` §7-C1) — folosește mock în dev cycle
- *Trigger escalation:* SMTP daily quota approach → switch pe dev to mock only

**Risc 4 — Sentry mixed dev + prod error stream**
- *Probabilitate:* high
- *Impact:* low (dev events 10% sampled + PII stripped)
- *Mitigare:* `src/util/sentry.js` `MODE !== 'test'` + hostname check skip
  localhost; production events doar via deploy
- *Trigger escalation:* signal-to-noise degrade → split Sentry projects post-Beta

---

## §5 Environment label conventions

Când staging spawns post-Beta:

| Environment | Firebase project | Sentry env | Vercel context | Branch |
|---|---|---|---|---|
| Production | `fittracker-c34e8` | `production` | Production | `main` |
| Staging | `andura-staging` (TBD) | `staging` | Preview | `staging` sau PR previews |
| Dev local | (config Daniel choice) | (skip per hostname check) | N/A | local |

**Label injection:** `VITE_APP_VERSION` (per `src/global.d.ts` schema)
encodează release tag; Sentry `release` per `src/util/sentry.js` §30
(`andura@${VITE_APP_VERSION}`).

---

## §6 Sunset criteria (când deprecate single-project model)

- ≥1 external user activ daily (real production data)
- Schema migration breaking change planned (test pe staging primul)
- Multi-developer collaboration (≥2 devs concurrent)
- Daniel personal device compromise risk increase (work device shared cu altcineva)

**Ownership:** Daniel CEO decide trigger; Co-CTO ridică recommendation când
verified primary-source evidence reached threshold.

---

## §7 Constrains + invarianti

- **ZERO production credentials în git** — `.env.local` ignored + Vercel
  encrypted env vars
- **ZERO dev-only Firebase security rules** — same rules dev + prod (uid match
  path strict)
- **ZERO staging spawn pre-trigger** — YAGNI (Karpathy §2 Simplicity First)
- **ZERO direct prod RTDB mutation script** fără backup snapshot prealabil
  (per `BACKUP_DR_RUNBOOK.md`)
- **ZERO env-specific source code branches** — env-var injection only (per
  `src/firebase.js` §4-H4 pattern)

---

🦫 **Environment Strategy SSOT** — single Firebase project V1 Beta solo founder
cost-minimization + ZERO overhead. Staging spawn post-Beta cand triggers
(≥1 external user OR ≥10 weekly active OR schema migration). §24-H3 closure
2026-05-22.
