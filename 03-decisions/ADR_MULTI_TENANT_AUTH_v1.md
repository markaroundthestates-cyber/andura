# ADR — Multi-Tenant Auth Migration v1

**Status:** Accepted (formalized 2026-04-30 Sprint 3 partial autonomous post chat strategic 2026-04-29 lock decision #8)
**Date:** 2026-04-30
**See also:** [[002-firebase-rest-not-sdk]] | [[007-firebase-open-rules]] | [[001-local-first-storage]] | [[011-coach-decision-log-architecture]] (Reconsideration Trigger #6) | [[COGNITIVE_ARCHITECTURE_SPEC_v1]] §Q14
**Cross-ref audit:** AUDIT_5000Q Q-0353 / Q-1053 / Q-1055 (Anonymous UUID fragility cluster)

---

## Context

SalaFull v1 actual rulează pe **Anonymous UUID local-first** identification:

- `firebase.js:15` — `getDeviceId()` generează UUID stocată în `localStorage['device-id']`
- Firebase RTDB structure: `users/daniel/{coach-decisions, logs, weights, ...}` — hardcoded path single-user
- ADR 007 — Firebase rules open (NU per-UID scoped) — single-user personal app posture
- Multi-device sync = same UUID across phone + desktop... DAR doar dacă user poate transfera UUID manual

**Risc identificat de AUDIT_5000Q (Q-0353/1053/1055 cluster):**

- **UUID lost on device reset** = ALL data inaccessible permanent. User cumpără phone nou, factory reset → UUID generat fresh → user vede zero history.
- **No account recovery mechanism** — user nu poate recupera datele din alt device fără export manual JSON.
- **Onboarding fricțiune cumulativă** — user re-onboarding pe fiecare device, NU same-experience.
- **Multi-tenant deployment imposibil** — single-user `users/daniel` path hardcoded, multi-user requires per-user prefix.

**Decizia chat strategic 2026-04-29 lock #8:** Anonymous UUID fragility = **pre-launch CRITICAL**, NU post-launch deferrable.

**Effort realist:** 15-25h. Scope Sprint 3 full implementation.

**Sprint 3 partial (acest spec):** ADR + architecture spec + migration plan + edge cases. **NU code implementation.**

---

## Decision

Migrate Anonymous UUID → **Firebase Auth real** pre-launch:

### Auth provider — Email Magic Link (primary) + OAuth Google (secondary)

**Email Magic Link rationale:**
- Zero password friction (Bugatti standard ≠ password reset hell)
- Email = recovery vector reliable
- Supported native Firebase Auth REST (no SDK install — preserve ADR 002)
- Privacy preserve — no OAuth data sharing dacă user prefer

**OAuth Google secondary:**
- Faster onboarding pentru users care vor (1-tap)
- Useful pentru EN audience iOS users (PWA + Google account ubiquitous)

**NU OAuth Apple v1** — cost setup Apple Developer + Sign In with Apple complications. Defer v1.x.

### Migration phases (per chat strategic lock decision)

**Faza 1 — Add real auth alongside Anonymous (parallel run):**
- Implement Firebase Auth REST endpoints (signInWithEmailLink, signInWithGoogle)
- Add UI auth flow în onboarding (NU forced — opt-in)
- Mapping table: `users/{anonymousUUID}` ↔ `users/{firebase.uid}` în Firebase via Cloud Function
- Existing Daniel user (single beta user pre-launch): manually migrate `users/daniel` → `users/{daniel.firebase.uid}` via script one-time

**Faza 2 — Prompt existing users link account:**
- 14-day grace period after Faza 1 deployment
- Banner warning soft: "Salvează contul cu email pentru a păstra datele la device reset. Link account →"
- Skip button accepted (NU forced) — Bugatti respect user agency
- Grace period extends as needed pentru beta cohort feedback

**Faza 3 — Sunset Anonymous post 30-day parallel:**
- Anonymous-only users (refuze auth) → grace period extension OR data sunset warning
- New signups post-Faza-3 = auth required (no Anonymous fallback)
- Existing Anonymous users data preserved în Firebase (cleanup post 90-day post-sunset cu privacy disclosure)

### Schema migration — Firebase RTDB

**BEFORE (current):**
```
users/
  daniel/
    coach-decisions: [...]
    logs: [...]
    weights: {...}
    ...
```

**AFTER (multi-tenant):**
```
users/
  {firebase.uid}/
    coach-decisions: [...]
    logs: [...]
    weights: {...}
    ...
auth_migration_map/
  {anonymousUUID}: { firebase_uid: "...", migrated_at: timestamp, status: "complete" }
```

**Path migration rule:**
- Code citește `users/{firebase.uid}/...` în loc de `users/daniel/...` (hardcoded path eliminated)
- Fallback gracefully la `users/{anonymousUUID}/` dacă user NU yet auth (Faza 1-2 transition)
- `firebase.uid` resolved on app load via Auth state observer

### Cloud Function migration script

**Single-user migration (Daniel pre-launch):**
```js
// Cloud Function migrateUserData (HTTP triggered, admin-only)
async function migrateUserData(anonymousUUID, firebaseUid) {
  // 1. Read all data under users/{anonymousUUID}/
  const data = await db.ref(`users/${anonymousUUID}`).once('value');

  // 2. Write to users/{firebaseUid}/ (transactional)
  await db.ref(`users/${firebaseUid}`).set(data.val());

  // 3. Update mapping table
  await db.ref(`auth_migration_map/${anonymousUUID}`).set({
    firebase_uid: firebaseUid,
    migrated_at: Date.now(),
    status: 'complete'
  });

  // 4. Mark old path as MIGRATED (don't delete — backup retention 90 zile)
  await db.ref(`users/${anonymousUUID}/_migrated`).set({
    migrated_to: firebaseUid,
    migrated_at: Date.now()
  });

  // 5. Verify: read both paths, ensure data integrity
  // 6. Return success/error to caller
}
```

**Bulk migration (post-Faza-2):**
- Function `migrateAllPending()` runs over `auth_migration_map` entries marked `status: 'pending_link'`
- Each entry triggers `migrateUserData(anonymousUUID, firebaseUid)`
- Transactional safety: failure on entry N → entry N reverts, continue cu N+1, log Sentry alert

### Edge cases

#### EC-1: User cu 2 anonymous accounts (phone + desktop standalone, NU sync)

**Scenario:** Daniel folosește SalaFull pe phone (UUID-A) + desktop separate (UUID-B), each cu data divergent. La onboarding auth, account merge needed.

**Decision:** **Account merge = OUT_OF_SCOPE v1.0** (per Cognitive Arch §Q14).
- User alege un device "primary" (cel cu cel mai mult data) la auth onboarding
- Alt device data = lost OR exported manually pre-merge prin "Export my data" feature
- Spec final v1.x dacă demand vizibil

#### EC-2: User refuză real auth (post-Faza-3)

**Scenario:** Existing Anonymous user, refuză să link account.

**Decision:** Grace period extension + data export prompt + sunset post 90-day post-Faza-3.
- Banner warning escalation: "Datele tale vor fi șterse în 90 zile dacă NU link account. Export prin Setări → Export my data."
- Post 90-day: Cloud Function GC sterge `users/{anonymousUUID}/` data + mapping table entry
- Acceptable churn — explicit warning + 90-day grace.

#### EC-3: Migration partial fail

**Scenario:** Cloud Function migrateUserData crashează între pasul 2 (write) și pasul 4 (mark migrated).

**Decision:** **Rollback strategy:**
- Step 2 transactional — succeed-or-fail atomic
- Step 4 NOT transactional cu Step 2 — manual reconciliation post-recovery
- Pe app load post-migration: code detects `users/{firebaseUid}` exists + `auth_migration_map` entry status = 'complete' → use new path
- Detect inconsistency: `users/{firebaseUid}` exists DAR mapping status = 'pending' → re-run mark step (idempotent)
- Detect failure: Sentry alert "Migration step 4 failed" + manual Daniel intervention

#### EC-4: Email Magic Link expires

**Scenario:** User clicked link 24h+ later, Firebase rejects.

**Decision:** UI clear error message: "Linkul a expirat. Trimitem unul nou?" → re-trigger flow. Standard Firebase Auth pattern.

#### EC-5: Firebase Auth quota exceeded

**Scenario:** SalaFull viral traction, 10000+ signups/day, Firebase free tier exhausted.

**Decision:** **Pre-monetization risk acceptable** — Firebase Auth free tier = 50k MAU. SalaFull realistic 1000 MAU year 1 (PRODUCT_STRATEGY §10.1). Quota cap distant.

**Plan B post-10k:** upgrade Firebase Blaze plan (~$0.01/auth post 50k MAU).

### Test plan

**Unit tests:**
- Mock `firebase.auth().currentUser` în testing environment
- Test `getUserPath()` returns correct path based on auth state (Anonymous fallback vs auth real)
- Test `migrateUserData()` Cloud Function logic via Firebase emulator

**Integration tests:**
- Firebase emulator simulate Anonymous → Auth migration end-to-end
- Multi-device test scenario: 2 emulator clients with different UUIDs, link to same firebase.uid → expect data merge resolved (EC-1 handling)

**Golden Master Suite:**
- Add manual profiles `manual-021-multi-device-migrate-success.json`, `manual-022-multi-device-merge-conflict.json`, `manual-023-anonymous-refuses-auth.json`

**Manual QA:**
- Daniel testes Faza 1 deployment — link account email magic link end-to-end + verify `users/daniel` data migrated to `users/{daniel.firebase.uid}`

### Rollback procedure

Dacă migration produces silent data loss / incorrectness:

1. **Revert Faza 3 sunset:** restore Anonymous fallback în code via feature flag toggle. Anonymous users continue working old path.
2. **Verify migration map:** scan `auth_migration_map/` for entries cu `status: 'complete'` DAR data missing/wrong la `users/{firebase.uid}/`. Cloud Function re-migrate de la backup `users/{anonymousUUID}/_migrated.original`.
3. **User communication:** in-app banner + email broadcast (SaaS standard) explaining issue + ETA fix.
4. **Hard rollback (worst case):** restore Firebase backup pre-Faza-1 deployment (Firebase RTDB has automatic daily backups — verify retention policy + recovery time pre-launch).

---

## Consequences

### Positive

- **UUID fragility eliminated** — user păstrează data la device reset, OS switch, app reinstall.
- **Multi-device sync seamless** — same firebase.uid across all devices = transparent data continuity.
- **Account recovery** — email magic link = standard recovery vector.
- **Multi-tenant deploy** — `users/{firebase.uid}` schema preps SalaFull pentru N users post-launch.
- **GDPR Article 20 compliant** — data portability prin Export feature already exists, auth real adds account binding.
- **EU AI Act preparedness** — high-risk AI systems require user identification + consent tracking.

### Negative

- **Onboarding friction +30s** (email entry + click magic link). Bugatti tradeoff: account safety > onboarding speed.
- **Code refactor cost ~15-25h Sprint 3 full** (firebase.js path resolution + auth UI + migration Cloud Function + Faza 1-3 rollout + tests).
- **Firebase Auth free tier dependency** — 50k MAU cap. Adequate v1, plan upgrade post-traction.
- **Existing Daniel data migration step** — single-user pre-launch, but manual Cloud Function run pre-Faza-1 = required.

### Risks

- **Migration partial fail** silent corruption (EC-3) — mitigation: transactional steps + Sentry alerts + idempotent re-runs.
- **Account merge complexity** future demand (EC-1) — defer v1.x, accept user choice "primary device" pre-launch.
- **Firebase Auth REST endpoint changes** breaking — Firebase has stable Auth REST API, low risk. Pinnable behavior tested via emulator.
- **EU GDPR data residency** — verified Firebase EU region (`europe-west1`) per Sprint 1 Acțiunea 1. Auth data co-located.

---

## Reconsideration Triggers

1. **Multi-device account merge demand >5%** of users → spec EXEC_QUEUE Sprint 4 sau v1.x.
2. **OAuth Apple Sign In demand** EN iOS audience → add provider Sprint 4 or v1.x.
3. **Firebase Auth quota >50k MAU** → upgrade Blaze plan + cost monitoring.
4. **Real-time auth requirement** (e.g., live coaching collaborative) → re-evaluate ADR 002 (REST not SDK) — may need Firebase SDK for real-time auth listeners.
5. **Privacy-respecting alternative** auth provider request (e.g., self-hosted) → re-evaluate Firebase dependency entirely.

---

## Cross-references

- AUDIT_5000Q Q-0353 / Q-1053 / Q-1055 (UUID fragility)
- ADR 002 (Firebase REST not SDK) — preserve via REST Auth endpoints
- ADR 007 (Firebase open rules) — replace cu per-UID scoped rules post-Faza-1
- ADR 011 Reconsideration Trigger #6 (Multi-tenant auth deployed → CDL path migration)
- COGNITIVE_ARCHITECTURE_SPEC_v1 §Q14 (Identity & Auth lock — Firebase Auth UUID canonical)
- HANDOVER 2026-04-29 §1 chat strategic
- `04-architecture/MULTI_TENANT_AUTH_MIGRATION_SPEC.md` (companion technical spec)

---

*Authored 2026-04-30 Sprint 3 partial autonomous run Opus 4.7. Sign-off implicit via handover lock 2026-04-29 chat strategic Daniel + Claude Opus.*
