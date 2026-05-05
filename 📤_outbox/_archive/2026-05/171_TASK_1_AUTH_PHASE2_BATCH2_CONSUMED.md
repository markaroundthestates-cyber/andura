# TASK 1 — Auth Phase 2 Batch 2

═══════════════════════════════════════════════════════════════════
**Source-of-truth:**
- `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §56.5 (Settings UI account lifecycle) + §56.7 (Anonymous→Auth Merge Fork Decision UI + archive 7 zile flow)
- `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md` §AMENDMENT 2026-05-04.5 + .7
- `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §62.X (META Review Division of Labor) + §63.7 (Fork UI ZERO default highlight) + §64.2 (2-step "ȘTERGE" deletion confirmation)
═══════════════════════════════════════════════════════════════════

## Pre-implementation verify

Before any code:

1. Identify Settings UI page actual: search `src/pages/settings.js` (existing OR creează NEW dacă missing)
2. Identify routing pattern current: read `src/main.js` + `index.html` (route registration pattern existing post Phase 1 wiring commit `0880641` — `src/pages/authShell.js` integrated)
3. Verify §56.1.4 IndexedDB Dexie multi-DB landed corect (batch 1 commit `f9ee75d`):
   - `migrateAnonymousToAuth` helper functional
   - `andura_${uid}` namespace pattern + `anonymous` namespace pre-auth
4. Verify Firebase Auth REST helpers existing `src/auth.js` (Phase 1 LANDED): `sendMagicLink`, `verifyMagicLink`, `signOut`, `getAuthState`, `getIdToken`

═══════════════════════════════════════════════════════════════════

## §56.5.1 Recovery email lost access — refusal pattern explicit

În Settings UI, link/buton "Mi-am pierdut accesul la email" → modal cu wording UI exact LOCKED V1 verbatim:

> Contul tău în cloud nu mai poate fi accesat. Totuși, datele tale de antrenament de pe acest dispozitiv sunt în siguranță și rămân aici. Pierzi doar sincronizarea automată cu alte telefoane sau tablete.

Buton "Înțeleg" close modal. ZERO action backend (refusal pattern explicit pre-Beta — NU SMS verify, NU email secundar).

═══════════════════════════════════════════════════════════════════

## §56.5.2 Account deletion GDPR Article 17 — Soft delete 30 zile grace

**Mecanism:**
- Firestore: scriere flag `users/{uid}/_deleted: { requestedAt: <serverTimestamp>, scheduledHardDelete: <serverTimestamp + 30 days> }`
- Firebase Auth: cont **disabled** imediat (NU delete) — pre-Beta poate fi via Firebase Auth REST `accounts:update` cu `disableUser: true` SAU manual Daniel via Console (decide simplest path: client-side trigger flag + Daniel manual disable post-batch dacă REST endpoint complex)
- Recovery 30 zile via `auth/user-disabled` catch (vezi §56.5.3 mai jos)
- Post 30 zile: hard delete cascade NU în acest batch (admin-cleanup.js script Daniel weekly TASK 2 §56.14.A)

**Confirmation flow per §62.X §64.2 — 2-step type "ȘTERGE":**

UI Settings → buton "Șterge cont definitiv":

1. Modal step 1:
   > Această acțiune va șterge contul în 30 de zile. Te poți răzgândi în acest interval. Pentru a confirma, scrie ȘTERGE mai jos.

2. Input text manual + buton "Confirmă" enabled doar dacă input strict equals "ȘTERGE" (case-sensitive RO diacritics — verifică `Ș` U+0218 NU `S` U+0053)

3. Click confirmă → execute soft delete (write `_deleted` flag + sign-out user) → redirect splash post-delete cu wording:
   > Contul tău este programat pentru ștergere definitivă în 30 de zile. Dacă te răzgândești, trimite un e-mail la suport@andura.app.

NU 1-click + modal final (anti-tap-accidental insufficient). NU 3-step email + 24h delay (over-friction).

═══════════════════════════════════════════════════════════════════

## §56.5.3 Reactivation flow — catch `auth/user-disabled` + email contact

În `src/auth.js`: extend error handling. Când Firebase Auth REST returnează error code `USER_DISABLED` (Magic Link verify SAU Google OAuth signin) → display modal exact LOCKED V1 verbatim:

> Acest cont este dezactivat și programat pentru ștergere definitivă. Dacă te-ai răzgândit și vrei să îl reactivezi, trimite un e-mail la suport@andura.app în termenul de 30 de zile de la solicitare.

NU fail silent. NU generic auth error. Specific catch + dedicated wording.

Pre-Beta 50 testeri: Daniel manual proces reactivation = Firebase Console disable→enable + Firestore `_deleted` field clear. NU automate în acest batch.

═══════════════════════════════════════════════════════════════════

## §56.5.4 Email change — retain `uid` + Firebase `updateEmail` nativ

UI Settings → secțiune "Schimbă adresa de e-mail":

1. Input "Adresa nouă"
2. Buton "Trimite link de verificare"
3. Trigger Firebase Auth REST `accounts:sendOobCode` cu `requestType: VERIFY_AND_CHANGE_EMAIL` la noua adresă (alternative dacă REST limitation: `accounts:update` cu newEmail după verify oobCode)
4. User click link în email nou → backend Firebase auto-update + retain `uid`
5. Settings reflect new email post-page-reload

**Conflict detection:** dacă noua adresă deja folosită (alt cont) → error wording:
> Adresa este deja folosită de un alt cont.

(Per §64.1 — Magic Link new address ONLY pattern, NU double confirm old + new. NU password-less ZERO friction.)

**Typo guard:** input cu confirm second pass (re-type adresa) pre-trimite link evita typo.

═══════════════════════════════════════════════════════════════════

## §56.7 Anonymous→Auth Merge Fork Decision UI

**Trigger:** user în Anonymous mode (T0 trial) face Magic Link / Google OAuth sign-in. În `src/auth.js` post `verifyMagicLink` SAU post Google OAuth success:

```javascript
// Pseudo-code post-auth success
const anonymousData = await detectAnonymousLocalData();   // IndexedDB anonymous namespace non-empty?
const cloudData = await detectCloudUserData(authUid);     // Firestore users/{authUid}/... non-empty?

if (anonymousData && cloudData) {
  // Both non-empty → Fork Decision UI blocking modal
  await showForkDecisionModal({ anonymousData, cloudData });
} else if (anonymousData && !cloudData) {
  // Anonymous only → auto-migrate (existing helper §56.1.4 batch 1)
  await migrateAnonymousToAuth(authUid);
} else {
  // Cloud only OR neither → use cloud (or empty state)
  // No-op
}
```

**Fork Decision UI ecran modal blocking:**

> Am găsit un istoric în cloud. Ce vrei să păstrezi?
>
> [Telefon] — Datele de pe acest dispozitiv (anonim)
> [Cloud] — Datele din contul tău existent
>
> Sursa pe care nu o alegi va fi arhivată 7 zile (recuperabilă din Setări).

**Default highlight:** ZERO (force user manual choice anti-mistake Maria 65 §63.7). NU [Cloud] highlighted, NU [Telefon]. Both buttons neutral styling identical, force conscious choice.

**Click [Telefon]:**
1. Archive cloud data: copy `users/{authUid}/...` → `_archived/{authUid}/{timestamp}/...` Firestore (7 zile retention via TTL field)
2. Export local backup: write JSON IndexedDB `archived_cloud_backup_{timestamp}` (Daniel dev fallback)
3. Migrate Anonymous IndexedDB → `users/{authUid}` namespace (use existing `migrateAnonymousToAuth` helper landed batch 1)
4. Toast confirm wording verbatim:
   > Datele din [Cloud] au fost arhivate. Le poți recupera timp de 7 zile din zona de Setări.

**Click [Cloud]:**
1. Archive Anonymous local: copy IndexedDB anonymous namespace → `_archived/anonymous/{timestamp}/...` IndexedDB OR JSON export local
2. Toast confirm reverse wording verbatim:
   > Datele din [Telefon] au fost arhivate. Le poți recupera timp de 7 zile din zona de Setări.
3. Continue user în context cloud existing (Anonymous IndexedDB stays archived, user sees cloud data).

**Restore from archive (7 zile window):** Settings UI → secțiune "Recuperare date arhivate" listă cu timestamps + buton "Restaurare" per archive entry. Click restore → reverse merge (current data goes to fresh `_archived/{timestamp2}/`, restored data goes to active path).

**Post-7 zile:** auto-cascade hard delete archive entries — NU în acest batch (admin-cleanup.js Daniel weekly TASK 2 §56.14.A).

═══════════════════════════════════════════════════════════════════

## Files affected (estimat — verify pre-implementation)

- `src/pages/settings.js` — NEW (most likely) sau extend existing dacă găsit
- `src/pages/auth.js` — extend cu redirect post-auth către Fork Decision UI dacă applicable
- `src/auth.js` — extend cu `disableUserAccount`, `updateUserEmail`, error code catching `USER_DISABLED`, `detectAnonymousLocalData`, `detectCloudUserData`
- `src/firebase.js` — extend cu `archiveData(sourcePath, archivePath)` + `restoreFromArchive(archivePath, targetPath)` helpers
- `src/db.js` (Dexie) — extend cu archive/restore helpers IndexedDB anonymous namespace
- `src/components/forkDecisionModal.js` — NEW component
- `src/components/deleteAccountModal.js` — NEW component (2-step "ȘTERGE")
- `src/components/recoveryEmailLostModal.js` — NEW component (refusal wording)
- `src/components/emailChangeForm.js` — NEW component (typo guard)
- `index.html` — slot adăugare pentru Settings page route dacă routing-based
- `src/main.js` — wire Settings route + Fork Decision check post-auth callback
- Tests vitest: unit tests pentru fiecare flow + components

═══════════════════════════════════════════════════════════════════

## Tests required (Bugatti coverage target ≥80%)

Unit tests vitest:

- `src/components/__tests__/deleteAccountModal.test.js` — 2-step "ȘTERGE" confirmation case-sensitive RO diacritics test (Ș U+0218 valid, S U+0053 invalid, șterge lowercase invalid, "STERGE" without diacritic invalid)
- `src/components/__tests__/forkDecisionModal.test.js` — both branch coverage [Telefon] + [Cloud] + ZERO default highlight verify (no `aria-default` / no autofocus / both buttons identical styling)
- `src/components/__tests__/emailChangeForm.test.js` — typo guard double-input verify
- `src/auth/__tests__/userDisabled.test.js` — Firebase REST error code `USER_DISABLED` triggers correct modal
- `src/auth/__tests__/forkLogic.test.js` — branch logic: both empty → no Fork, anonymous only → auto-migrate, cloud only → use cloud, both non-empty → Fork
- `src/firebase/__tests__/archiveData.test.js` — archive + restore round-trip
- `src/db/__tests__/archive.test.js` — IndexedDB archive namespace round-trip

Edge cases tests:
- Cloud empty + anonymous non-empty → skip Fork, auto-migrate
- Cloud non-empty + anonymous empty → skip Fork, auto-use-cloud
- Both empty → skip Fork, no-op
- Archive fail mid-flow → rollback + retry idempotent (migration pattern existing per `src/migrations/2026-05-02-auth-path-migration.js` reference)

═══════════════════════════════════════════════════════════════════

## Acceptance criteria (PASS/FAIL gate)

PASS:
- TOATE flows §56.5 + §56.7 functional E2E (manual smoke verify în CC)
- Wording UI exact LOCKED V1 verbatim (ZERO drift, even minor punctuation, even RO diacritics — ăâîșțĂÂÎȘȚ exact)
- 2-step "ȘTERGE" confirmation working corect (case-sensitive RO diacritics)
- Fork Decision UI ZERO default highlight enforced (verify HTML/CSS)
- Archive 7 zile flow working bidirectional ([Telefon] + [Cloud])
- Restore from archive Settings flow working
- `npm run test:run` ALL pass (existing baseline + new tests added)
- `npm run build` clean
- ZERO regression pe tests existing

FAIL = orice acceptance criteria nesatisfăcut → ABORT batch, append LATEST.md cu detalii, TASK 2 SKIPPED.

═══════════════════════════════════════════════════════════════════

## Wording UI verbatim cheatsheet (anti-drift reference)

§56.5.1 Recovery email lost (modal):
> Contul tău în cloud nu mai poate fi accesat. Totuși, datele tale de antrenament de pe acest dispozitiv sunt în siguranță și rămân aici. Pierzi doar sincronizarea automată cu alte telefoane sau tablete.

§56.5.2 Delete confirm step 1 (modal):
> Această acțiune va șterge contul în 30 de zile. Te poți răzgândi în acest interval. Pentru a confirma, scrie ȘTERGE mai jos.

§56.5.2 Delete post-confirm (splash):
> Contul tău este programat pentru ștergere definitivă în 30 de zile. Dacă te răzgândești, trimite un e-mail la suport@andura.app.

§56.5.3 Reactivation (modal pe `USER_DISABLED`):
> Acest cont este dezactivat și programat pentru ștergere definitivă. Dacă te-ai răzgândit și vrei să îl reactivezi, trimite un e-mail la suport@andura.app în termenul de 30 de zile de la solicitare.

§56.5.4 Email already used (error):
> Adresa este deja folosită de un alt cont.

§56.7 Fork Decision (modal):
> Am găsit un istoric în cloud. Ce vrei să păstrezi?
>
> [Telefon] — Datele de pe acest dispozitiv (anonim)
> [Cloud] — Datele din contul tău existent
>
> Sursa pe care nu o alegi va fi arhivată 7 zile (recuperabilă din Setări).

§56.7 Click [Telefon] toast:
> Datele din [Cloud] au fost arhivate. Le poți recupera timp de 7 zile din zona de Setări.

§56.7 Click [Cloud] toast:
> Datele din [Telefon] au fost arhivate. Le poți recupera timp de 7 zile din zona de Setări.

═══════════════════════════════════════════════════════════════════
