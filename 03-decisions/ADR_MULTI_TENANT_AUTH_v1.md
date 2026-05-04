# ADR — Multi-Tenant Auth Migration v1

**Status:** Accepted — Faza 1 client-side **LANDED 2026-05-02 Batch B** (REST helpers + UI + path migration). Faza 2 banner UX + Faza 3 sunset gate + Cloud Function bulk migration **deferred** to dedicated batch.
**Date:** 2026-04-30 (initial); **2026-05-02 (§AMENDMENT — Sprint 4.x Batch B implementation)**
**See also:** [[002-firebase-rest-not-sdk]] | [[007-firebase-open-rules]] | [[001-local-first-storage]] | [[011-coach-decision-log-architecture]] (Reconsideration Trigger #6) | [[COGNITIVE_ARCHITECTURE_SPEC_v1]] §Q14
**Cross-ref audit:** AUDIT_5000Q Q-0353 / Q-1053 / Q-1055 (Anonymous UUID fragility cluster)

---

## Context

Andura v1 actual rulează pe **Anonymous UUID local-first** identification:

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

**Scenario:** Daniel folosește Andura pe phone (UUID-A) + desktop separate (UUID-B), each cu data divergent. La onboarding auth, account merge needed.

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

**Scenario:** Andura viral traction, 10000+ signups/day, Firebase free tier exhausted.

**Decision:** **Pre-monetization risk acceptable** — Firebase Auth free tier = 50k MAU. Andura realistic 1000 MAU year 1 (PRODUCT_STRATEGY §10.1). Quota cap distant.

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
- **Multi-tenant deploy** — `users/{firebase.uid}` schema preps Andura pentru N users post-launch.
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

---

## §AMENDMENT 2026-05-02 — Sprint 4.x Batch B implementation status

**Scope landed (Faza 1 client-side):**

- `src/auth.js` — Firebase Auth REST helpers per ADR 002 (NO Firebase JS SDK). Endpoints used: `accounts:sendOobCode` (Magic Link), `accounts:signInWithEmailLink`, `accounts:signInWithIdp` (Google), `securetoken/v1/token` (refresh). Token persistence via localStorage cu `firebase-id-token` / `firebase-uid` / `firebase-refresh-token` / `firebase-id-token-expiry`. Proactive refresh (60 s skew) inside `getIdToken()`.
- `src/firebase.js` refactor — `USER_PATH` literal preserved as `LEGACY_USER_PATH` fallback; new `getUserPath()` resolves uid-first cu fallback. All `fbGet/fbSet/fbRemove` thread `?auth=<idToken>` query param via `_buildUrl()` builder. `buildAuthUrl()` exported pentru raw consumers (dataCleanup, migration runner).
- `src/util/dataCleanup.js` — uses `getUserPath() + buildAuthUrl()` instead of literal.
- `src/migrations/2026-05-02-auth-path-migration.js` — idempotent client-side path migration `users/daniel` → `users/<uid>`. Verifies via key-count match. Marks done in localStorage so subsequent boots skip. Returns one of: `migrated | already-populated | no-source | skipped | no-auth | failed`.
- `src/pages/auth.js` — bare-DOM Magic Link UI cu pending state + resend + Google OAuth secondary button (rendered only when `googleClientId` provided to `createAuthScreen`). Wording RO Bugatti factual (NU paternalist, NU emoji).
- Tests: +50 new (auth: 16, tombstones: 22, migration: 12). Baseline 955 → 1005.

**NOT landed (deferred):**

- Firebase Console: Google OAuth Client ID config — Daniel sets manually pre-launch.
- `index.html` route hookup pentru `/auth-callback` — Daniel wires when integrating UI shell (next batch).
- Faza 2 banner UX "Salvează contul" prompt for existing Anonymous users → dedicated 30-min wiring batch.
- Faza 3 sunset gate (post 30-day parallel) → post Daniel dogfood Faza 1.
- Cloud Function `migrateUserData` / `migrateAllPending` / `tombstoneCleanup` (multi-tenant bulk migration) — single-user Daniel pre-launch path migrates client-side via `runAuthPathMigration`; Cloud Function needed only post-launch when N users start linking accounts. Spec preserved verbatim în `MULTI_TENANT_AUTH_MIGRATION_SPEC.md`.
- ADR 007 §AMENDMENT 2026-05-02 production publish — Daniel runs Firebase emulator smoke test against `database.rules.json` post-Magic-Link end-to-end verify, then publishes to Console. Activation gated on Faza 1 dogfood pass.

**Daniel manual steps post-batch:**

1. Firebase Console → Project settings → Web API Key → copy → set `window.__FIREBASE_API_KEY` in `index.html` head OR replace `'PLACEHOLDER_WEB_API_KEY'` în `src/auth.js` constant.
2. Firebase Console → Authentication → Sign-in method → enable "Email link (passwordless sign-in)".
3. (Optional Faza 1+) Firebase Console → Authentication → Sign-in method → enable Google → create OAuth Client ID → pass to `createAuthScreen({ googleClientId: '...' })`.
4. Hook `createAuthScreen()` în onboarding flow / app shell when ready.
5. Run end-to-end Magic Link flow on dev URL → verify `localStorage['firebase-uid']` populated → verify `users/<uid>/...` in RTDB Console after first write.
6. After dogfood pass → publish `database.rules.json` to Firebase Console (per ADR 007 §AMENDMENT 2026-05-02).

**Test coverage of edge cases:**

- EC-3 partial-fail rollback covered: write success but verify count-mismatch → returns `failed`, migration flag NOT set, retry idempotent.
- EC-4 magic-link expired — REST endpoint returns error string, `verifyMagicLink` propagates as `error`. UI surfaces COPY.errorVerifyFailed.
- Token refresh path tested: stale token → `getIdToken()` triggers `refreshIdToken()` → new token persisted.

**Known gaps (intentional, deferred):**

- No request retry/backoff in `_buildUrl` — Firebase REST is reliable, retries can land in dedicated resilience batch.
- Verify step uses key-count match instead of deep-equal (single-user pre-launch acceptable; deep-equal would 2× bandwidth + complexity for marginal correctness gain).
- `users/daniel/_migrated` retention marker NOT written client-side — kept simple. Cloud Function bulk migration (post-V1) writes the retention marker per spec.

**Cross-refs:**

- §34.2 Firebase Rules RTDB Lock (ADR 007 §AMENDMENT)
- Batch B Task 1 implementation (Sprint 4.x)
- Batch A Finding A (Auth Migration prerequisite for Blocker 2 activate)
- `04-architecture/MULTI_TENANT_AUTH_MIGRATION_SPEC.md` (full Cloud Function spec — referenced for post-V1 multi-tenant)

---

## §AMENDMENT 2026-05-04 evening — Faza 2 Wiring Spec LOCKED V1 (Auth Flow §36.80 chat strategic resolution)

**Status:** LOCKED V1 spec ready CC Opus implementation Priority 1 ABSOLUT. Chat strategic 2026-05-04 evening Daniel + Claude — 35 substantive sub-decisions (push-back validated multiple iterations). Full verbatim sub-sections în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.1-§56.19.

**Authority:** §AMENDMENT 2026-05-04 supersedes §AMENDMENT 2026-05-02 Faza 2 PLANNED scope (banner UX + auth-callback route). Faza 2 NU mai e "planned" — e LOCKED V1 spec full ready CC Opus implementation Priority 1 ABSOLUT.

### §AMENDMENT 2026-05-04.1 Auth Pattern UX & Anonymous Mode (HANDOVER §56.1)

- **auth-banner-soft pattern** — Anonymous + prompt "Salvează contul" non-blocking. Bugatti F4 Maria 65 frictionless.
- **Anonymous mode preserve** — fallback local-first per Faza 1-2 design preserved.
- **Code-level fix `getUserPath()` BUG 2 root cause:** Mode Anonymous (`getAuthState() === null`) → `getUserPath()` returnează **obligatoriu `null`** (NU fallback hardcodat `LEGACY_USER_PATH = 'users/daniel'`). Toate apelurile Firebase API blocate când path null → app rulează exclusiv local IndexedDB. Bucla 401 eliminată mecanic.
- **IndexedDB namespace per UID — Dexie multi-DB:** `andura_${uid}` dinamic; `andura_anonymous` users neautentificați; logout User A + login User B same device → `andura_UserA` dormant intact + `andura_UserB` separat (familie share tablet privacy + Daniel multi-account safe).

### §AMENDMENT 2026-05-04.2 Auth Methods (HANDOVER §56.2)

- **Google OAuth primary** (1-tap login PWA cross-context ZERO issues, popup nativ în PWA)
- **Firebase Email Link nativ fallback:** `sendSignInLinkToEmail` + `handleCodeInApp: true` + `continueUrl: https://andura.app/auth-callback` + Universal/App Links interceptor
- **PIN custom 6-digit REJECTED** (scope creep masiv: SMTP backend + Cloud Function = Blaze plan obligatoriu contradicts §36.93 D3 Spark retain LOCKED)
- **Auth screen wording LOCKED V1:** Titlu "Salvează-ți progresul" / Subtitlu "Săptămânile tale de antrenament rămân în siguranță..." / CTA primar "Continuă cu Google" / CTA secundar "Trimite-mi link de acces pe e-mail" / Loading "Se trimite link-ul de acces..." / Success "Bine ai venit înapoi!"

### §AMENDMENT 2026-05-04.3 Onboarding Position (HANDOVER §56.3)

- **Auth screen DUPĂ T0 onboarding** (post Investment Phase commitment psihologic maxim — anti-dropoff Bugatti)
- **T0 scope:** 3-5 min max, 5-7 întrebări cheie (vârstă, sex, istoric medical simplu, obiectiv, frecvență)

### §AMENDMENT 2026-05-04.4 Migration Strategy (HANDOVER §56.4)

- **Migration scope:** Daniel `users/daniel` legacy ONLY pre-Beta (NU Cloud Function generic Spark plan retain)
- **`_migration` flag persistent Firestore:** schema `users/{uid}/_migration: { status: 'pending' | 'complete' | 'failed', attemptedAt, sourceLegacy: 'users/daniel' }`. Retry silent până success. ZERO notificări eroare user.
- **Rollback strategy:** mid-way fail → rollback complet (legacy intacte, status `failed`) + retry next session. Idempotent + zero risc data corruption.

### §AMENDMENT 2026-05-04.5 Account Lifecycle (HANDOVER §56.5)

- **Recovery email lost:** refusal pattern explicit + wording UI exact LOCKED V1 ("Contul tău în cloud nu mai poate fi accesat. Totuși, datele tale de antrenament de pe acest dispozitiv sunt în siguranță și rămân aici. Pierzi doar sincronizarea automată cu alte telefoane sau tablete.")
- **Account deletion GDPR Article 17:** Soft delete 30 zile grace (hard delete imediat REJECTED). Mecanism: `users/{uid}/_deleted` flag + Firebase Auth disabled (NU delete) + 30 zile recovery + post-30 hard cascade
- **Reactivation flow:** catch `auth/user-disabled` + email contact `suport@andura.app` (Daniel manual forward pre-Beta)
- **Email change `updateEmail` nativ:** retain `uid`, NU migrare. Conflict detection preventiv + current address typo guard.

### §AMENDMENT 2026-05-04.6 Multi-device & Concurrent Sessions (HANDOVER §56.6)

- **Multi-device same-account:** silent sync transparent (NU ecrane confirmare device nou pre-Beta)
- **Concurrent session conflict — Record-level Last-Write-Wins** (field-level CRDT-light REJECTED pre-Beta scope creep ~5-10h, defer v1.5 când avem real conflict telemetry)

### §AMENDMENT 2026-05-04.7 Anonymous→Auth Merge (HANDOVER §56.7)

- **Fork Decision UI explicit:** ecran "Am găsit un istoric în cloud. Ce vrei să păstrezi?"
- **Sursa respinsă archive 7 zile + export local JSON:** suprascriere definitivă REJECTED Maria 65 click greșit. Backup local IndexedDB + Firestore `_archived/{uid}/{timestamp}` 7 zile + restore Settings 7 zile + post-7 cascade real
- **Wording LOCKED V1:** "Datele din [Telefon/Cloud] au fost arhivate. Le poți recupera timp de 7 zile din zona de Setări."

### §AMENDMENT 2026-05-04.8 GDPR & Legal (HANDOVER §56.8)

- **GDPR consent double bifa Privacy + ToS** (termen "biometrice" REJECTED legal risc + Andura NU colectează biometric data)
- **Privacy Policy + ToS V1 Beta initial drafts** create în vault `01-vision/PRIVACY_POLICY_V1_BETA.md` + `01-vision/TERMS_OF_SERVICE_V1_BETA.md` din templates LOCKED V1 verbatim. Daniel validate sprint 30-60 min pre-Beta. Audit legal complet + GDPR profundă defer v1.5 (§46 P4 prerequisite).
- **Liability waivers absolute REJECTED** (RO consumer law OUG 21/1992 + Codul Civil + EU Consumer Rights Directive 2011/83 — retain răspundere neglijență gravă/dol cu wording "în măsura permisă de lege")

### §AMENDMENT 2026-05-04.9 Sunset & Beta Gate (HANDOVER §56.9)

- **Sunset Anonymous mode post-Beta v1.5 + 30 zile grace** (NU pre-Beta)
- **Beta launch gate target 1 ianuarie 2027 optimistic** (Quality > Speed strict — decalare septembrie 2026 fără ezitare dacă șlefuire necesară). MUST-HAVE listă în §56.9.2.

### §AMENDMENT 2026-05-04.10 PWA Cross-Context (HANDOVER §56.10)

- **Magic Link Universal Links Android only pre-Beta** (`assetlinks.json` în `.well-known/`)
- **iOS scope cut:** defer v2/v3 demand-driven (Apple Developer $99/an + bundle ID + `apple-app-site-association` = scope creep nejustificat solo dev pre-Beta)
- **TWA wrap Android v1.5 contingent rate fail >30%** (pre-Beta puro: ~70-80% deschide PWA nativ + ~20-30% browser default — accept partial 50 testeri tolerant)

### §AMENDMENT 2026-05-04.11 Session & Offline (HANDOVER §56.11)

- **Always Logged In:** Firebase SDK `indexedDBLocalPersistence` + refresh token forever default + Token ID 1h auto-refresh background
- **Offline auth UX:** local data + non-blocking banner top "Mod offline. Conectează-te la internet pentru a-ți sincroniza datele în cloud."

### §AMENDMENT 2026-05-04.12 Logout Behavior (HANDOVER §56.12)

- **Sign-out UX:** primary Settings bottom + double-confirmation modal (anti-tap-accidental Maria 65)
- **Logout local IndexedDB preserve + opt-in toggle Settings:** wipe IndexedDB la logout REJECTED (bandwidth + battery + quota Spark + offline blocked + trust break Maria 65). Opt-in advanced default OFF "Șterge datele de pe acest dispozitiv la deconectare". Cleanup dormant DBs `andura_*` not-touched 90+ zile (Daniel weekly script optional).
- **Unsynced data warning calm wording LOCKED V1** (NU panic "le poți pierde definitiv" REJECTED inaccurate — IndexedDB local rămâne)

### §AMENDMENT 2026-05-04.13 Network Resilience (HANDOVER §56.13)

- Magic Link request: auto-retry 3x background + manual fallback "Reîncearcă"

### §AMENDMENT 2026-05-04.14 Cleanup Mechanism (HANDOVER §56.14)

- **Cleanup A:** `admin-cleanup.js` Daniel weekly ~5min duminică (`_deleted/` >30 zile + `_archived/` >7 zile)
- **Cleanup B:** Client-side fallback la deschidere app (defense in depth users inactive 60+ zile)
- **Cleanup C (Cloud Function scheduled):** defer post-Beta v1.5 (Spark plan retain §36.93 D3)

### §AMENDMENT 2026-05-04.15 Telemetry (HANDOVER §56.15)

- T0→Auth conversion aggregate counters anonymous GDPR-safe (`onboarding_started`/`onboarding_completed`/`auth_prompt_shown`/`auth_completed`)
- Storage: `_telemetry/global` Firestore document client-side `FieldValue.increment(1)` (Spark plan compatible)

### §AMENDMENT 2026-05-04.16 DB Rules Firestore (HANDOVER §56.16)

```javascript
match /users/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
match /_deleted/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
match /_archived/{uid}/{docId} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

`_migration` flag în `users/{uid}` document — beneficiază automat aceleași rules. Per-UID strict §36.75 preserved + extended `_deleted` + `_archived`.

### §AMENDMENT 2026-05-04.17 Service Worker (HANDOVER §56.17)

SW + Firebase Auth coexistence — Firebase SDK gestionează nativ persistența `indexedDBLocalPersistence`. SW NU intercepteză `/auth-callback` route. Decizie operațională CC Opus implementation.

### §AMENDMENT 2026-05-04.18 Daniel Manual Setup Pre-CC (HANDOVER §56.18)

1. Firebase Auth Console: authorized domains add `andura.app` + Email Template Magic Link RO + Google OAuth Client ID + Action URL `https://andura.app/auth-callback` (~15 min)
2. `suport@andura.app` MX records Namecheap forward Daniel personal sau Google Workspace alt sau temp gmail (~15 min)
3. Privacy Policy + ToS V1 Beta validate sprint 30-60 min (initial drafts created vault `01-vision/`)

### §AMENDMENT 2026-05-04.19 Scope OUT v1.5+ (HANDOVER §56.19)

- Marketing email opt-in (NU pre-Beta newsletter)
- Deep linking (defer v1.5)
- Logout all devices revoke refresh tokens (defer v1.5)

### §AMENDMENT 2026-05-04 Cross-refs

- HANDOVER_GLOBAL §56.1-§56.19 verbatim sub-sections (35 sub-decisions)
- §57 Cumulative LOCKED 216 → 243 (+27 net)
- §58 Priority 1 ABSOLUT CC Opus implementation pending
- §60 Cross-refs Updates Required (INDEX_MASTER + DECISION_LOG)
- DECISION_LOG 2026-05-04 evening entry condensed
- §36.80 BUG 2 Firebase 401 RESOLVED chat strategic + CC implementation pending
- §36.93 D3 Spark retain (Cloud Function defer post-Beta v1.5)
- §36.94 ADR 025 Instant Skip principle reused (`getUserPath()=null` graceful degradation)
- §36.99 offline-first preservation §56.11.2
- §50.4 D1 Q20 §45.3 pattern reuse (record-level LWW NU duplicate logic)
- §46 P4 audit legal post-Beta v1.5 prerequisite (Privacy Policy GDPR profundă)

---

## §AMENDMENT 2026-05-04 evening BATCH 1-6 — Refinements + Edge Cases LOCKED V1 (chat strategic post-§56-§61 ingest)

**Status:** LOCKED V1 spec ready CC Opus implementation Priority 1 ABSOLUT phased per §62.3. Chat strategic 2026-05-04 evening Daniel + Claude post §56-§61 ingest + alignment 12/12 EXCELLENT — 63 substantive sub-decisions LOCKED V1 acoperind Batch 1-6 + Closure (HANDOVER_GLOBAL §62-§68). Cumulative LOCKED 243 → 306 (+63 net post-overlap).

**Authority:** §AMENDMENT 2026-05-04 evening BATCH 1-6 extends §AMENDMENT 2026-05-04 (Faza 2 wiring spec LOCKED V1) cu refinements + overrides + new sub-decisions edge cases. Sub-amendments .1-.10 below mapează direct la HANDOVER §63-§67 sub-sections relevante auth flow.

### §AMENDMENT 2026-05-04 evening BATCH 1-6 .1 Magic Link expiration 24h (override 1h)

Per HANDOVER §63.5 OVERRIDE Q5 reconsider. Magic Link expiration **24h** (NU 1h initial choice). Maria 65 cross-context PWA Android tolerance: telefon slow + email întârzie 20-30 min. 1h = link expirat surpriză + Maria frustrare retry. 24h = balance security/UX Beta 50 testeri familie. Daniel manual config Firebase Auth Console pre-CC.

### §AMENDMENT 2026-05-04 evening BATCH 1-6 .2 Email body wording educativ verbatim (Magic Link)

Per HANDOVER §64.5. Magic Link inexistent email behavior — silent send Firebase native + wording educativ email-side. **Email body wording verbatim:**

> "Dacă ai deja un cont Andura, acest link te va conecta direct la profilul tău existent. Dacă ești la prima accesare, am creat acum un cont nou pentru tine, iar progresul tău va fi salvat automat."

Anti-account-enumeration security preserved (Firebase native) + anti-confusion typo Maria 65 educativ.

### §AMENDMENT 2026-05-04 evening BATCH 1-6 .3 Auth screen soft-hint UI sub email field

Per HANDOVER §64.5. **Auth screen soft-hint UI sub email field wording verbatim:**

> "Verifică cu atenție adresa de e-mail introdusă pentru a te asigura că primești link-ul de acces."

Anti-confusion typo Maria 65 + zero account-enumeration security risk.

### §AMENDMENT 2026-05-04 evening BATCH 1-6 .4 Session timeout NEVER always-logged-in confirm

Per HANDOVER §64.7. Session timeout inactivity = **NEVER**. Confirmă §AMENDMENT 2026-05-04.11 Always Logged In `indexedDBLocalPersistence` + refresh token forever default. NU 30 zile/90 zile re-auth (rejected). Token ID 1h auto-refresh background. Maria 65 NU re-auth surpriză.

### §AMENDMENT 2026-05-04 evening BATCH 1-6 .5 Telemetry ZERO toggle aggregate-only

Per HANDOVER §64.8. Telemetry opt-out toggle = **ZERO toggle Settings**. Aggregate anonymous events (`onboarding_started` + `onboarding_completed` + `auth_prompt_shown` + `auth_completed`) = GDPR-safe by design (FieldValue.increment counter only, ZERO PII). NU încarce interfață Settings. Confirmă §AMENDMENT 2026-05-04.15 telemetry storage `_telemetry/global` Spark plan compatible.

### §AMENDMENT 2026-05-04 evening BATCH 1-6 .6 SW update prompt non-disruptive

Per HANDOVER §64.9. Service Worker update flow — prompt subtil non-disruptive workout-aware:

> "Actualizare disponibilă. Reîncarcă"

NU silent background update (user surprise post-reload). NU force reload immediate (workout interruption disaster). User termină sesiune curentă apoi reload manual.

### §AMENDMENT 2026-05-04 evening BATCH 1-6 .7 iOS REJECTED LOCKED PERMANENT

Per HANDOVER §67.10. **iOS REJECTED LOCKED PERMANENT:**
- Pre-Beta: PWA only iOS users (browser default, ~20-30% rate fail tolerated)
- Post-Beta v1.0: NU iOS distribution
- Post-Beta v1.5: NU iOS distribution
- v2/v3: demand-driven only (real iOS user demand + revenue justify $99/an Apple Developer)

Distribution V1 Beta + post-Beta v1.0/v1.5 = PWA installable browser + TWA wrap Android Play Store (per §AMENDMENT 2026-05-04.10 contingent rate fail >30% activation). Memory persistent rule scope. Cross-ref §AMENDMENT 2026-05-04.10 iOS scope cut PERMANENT extension.

### §AMENDMENT 2026-05-04 evening BATCH 1-6 .8 Email change Magic Link new address only

Per HANDOVER §64.1. Email change verification = Magic Link new address ONLY (NU double confirm Magic Link old + new — over-engineering. NU password-less ZERO friction — security hole). Magic Link new address only validate + auto-update Firebase `updateEmail`. Typo guard preserved §AMENDMENT 2026-05-04.5 (current address typo).

### §AMENDMENT 2026-05-04 evening BATCH 1-6 .9 Account deletion 2-step type "ȘTERGE" + click

Per HANDOVER §64.2. Account deletion confirmation flow = **2-step type "ȘTERGE" manual + click confirm**. NU 1-click + modal final (anti-tap-accidental insufficient). NU 3-step email + 24h delay + click (over-friction). Type "ȘTERGE" manual + click confirm = balance anti-Maria-65-mistake + reasonable friction. Cross-ref §AMENDMENT 2026-05-04.5 soft delete 30 zile grace flow.

### §AMENDMENT 2026-05-04 evening BATCH 1-6 .10 GDPR Article 20 portability defer v1.5 manual

Per HANDOVER §64.3. GDPR data portability Article 20 = **defer v1.5 manual cerere `suport@andura.app`**. Pre-Beta 50 testeri = cerere manuală suport@, Daniel proceseze. NU JSON download imediat Settings (scope creep pre-Beta). NU email cu link 24h expirare (infrastructure). Automated button defer v1.5.

### §AMENDMENT 2026-05-04 evening BATCH 1-6 Cross-refs

- HANDOVER_GLOBAL §63.5 + §64.1-§64.10 + §67.10 (verbatim sub-sections)
- §70 Cumulative LOCKED 243 → 306 (+63 net Batch 1-6 + Closure)
- §71 Priority 1 ABSOLUT CC Opus implementation phased per §62.3 (firebase.js → auth.js → pages/auth.js → rest)
- §73 Cross-references comprehensive (ADR amendments + ADR 014 + ADR 017 + ADR 025 preserved + PRODUCT_STRATEGY + ONBOARDING_SSOT_V1 amendments inline)
- DECISION_LOG 2026-05-04 evening Batch 1-6 entry condensed
- §AMENDMENT 2026-05-04 (predecessor) preserved unchanged
- §62.3 phased implementation order LOCKED
- §62.X META review division of labor (Claude + Gemini text-heavy review cross + Daniel final approve spot-check minim)
