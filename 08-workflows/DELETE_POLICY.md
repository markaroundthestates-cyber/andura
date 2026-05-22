---
title: Delete Policy — Hard Delete All Tiers
status: ACTIVE_SSOT
created: 2026-05-22
authority: §50-C4 audit-nuclear-2026-05-19 closure
cross_refs:
  - 08-workflows/DATA_OWNERSHIP.md (§50-C3 user owns all data)
  - 08-workflows/DSR_HANDLER.md (§28-H3 GDPR Art. 17 manual path)
  - src/react/routes/screens/cont/DeleteAccountConfirm.tsx (account erasure)
  - src/react/routes/screens/cont/ResetDataConfirm.tsx (local-only reset)
  - src/storage/db.js wipeUserDB (Tier 1 IDB delete)
  - DECISIONS.md §B039 (Tier 1+2 erasure LANDED)
  - DECISIONS.md §A007 (auth signOut + token clear)
  - DECISIONS.md §A016 (freshness gate destructive ops)
---

# Delete Policy — Andura PWA

> **Decizie LOCKED V1:** Account deletion = **HARD delete all tiers**.
> Soft delete **NOT supported** in V1. Confirmation drill-down -> permanent
> erasure in secunde. Tombstones audit 90 zile (ADR 011) doar pentru
> audit GDPR, NU "soft delete" recoverable.

---

## §1 Decizie singulara

**Cont sters = TOT sters definitiv. Nu se recupereaza.**

Rationale:
- GDPR Art. 17(1)(b) erasure when consent withdrawn = real erasure, NU flag
- Anti-engagement principle (D-LEGACY-040): user decision respected absolut
- Bugatti paradigm: ZERO ambiguity erasure -> trust max + lawyer-friendly
- Tier storage 0/1/2 (D045): wipe synchronous toate trei + Firebase Auth user delete
- Lower complexity: NO `deleted_at` columns + NO restore flow + NO dormant detection V1

**Soft delete (account flag + retention) DEFERRED V2** daca apare cerere
clara user (acum: ZERO).

---

## §2 Paths (in-app self-service)

### §2.1 "Sterge cont" — full erasure

**UI:** Cont > Deconectare & stergere > Sterge cont
**Confirm screen:** `DeleteAccountConfirm.tsx` (D047 RIP-OUT drill-down)
**Pre-condition:** §A016 freshness gate — `isAuthFresh()` must return true,
otherwise redirect `/auth?reason=reauth_required_for_delete`.

**Execution sequence** (atomic, ireversibil):
1. `wipeAllLocalData()` — Tier 0 wipe:
   - Reset 5 Zustand stores: workout + nutrition + onboarding + settings + schedule
   - Clear all `wv2-*` localStorage keys (loop + remove)
2. `wipeRemoteData(uid)` — Tier 1+2 wipe (§B039):
   - `dbModule.wipeUserDB(uid)` — Dexie IDB database delete pentru `andura-<uid>`
   - Firebase RTDB DELETE `/users/<uid>.json?auth=<idToken>` REST API (ADR 002)
3. `authSignOut()` — clear auth state + token (§A007)
4. `setAuthenticated(false)` + redirect `/auth`

**Verification post-erase:**
- Re-login same email -> ONBOARDING T0 fresh (data NOT visible)
- Firebase Console: `/users/<uid>` node missing
- Firebase Auth: user record manual deletion required via Console / Admin SDK (DSR_HANDLER §Phase 3 manual)

### §2.2 "Reseteaza datele" — local-only reset (NU este delete)

**UI:** Cont > Reset data
**Confirm screen:** `ResetDataConfirm.tsx`
**Scope:** Tier 0 only (localStorage `wv2-*` + Zustand stores reset).
**NU touches:** Firebase Auth + Tier 1 IDB + Tier 2 RTDB (sync hydrates back post-restart).

Used pentru "incep-de-la-zero localStorage" without losing cont; redo onboarding flow.

### §2.3 "Reseteaza Coach" — coach state only

**UI:** Cont > Reset Coach
**Util:** `src/util/coachReset.js` `resetCoachState` (16 keys + `aa-cooldown-*` prefix wipe)
**Scope:** Coach context only (NU sesiuni). Preserve user data + sesiuni; reset coach learning state.

---

## §3 Manual handler (outside in-app)

Cand userul NU poate folosi in-app flow (lost device + no Magic Link
delivery), DSR Art. 17 manual workflow in `DSR_HANDLER.md` §Phase 3:

1. Firebase Console > Auth > Users > find uid > Delete user (Firebase Auth)
2. Firebase Console > RTDB > `/users/<uid>` > Delete node
3. Sentry CLI: `issues delete` for uid-tagged events (if any)
4. Email confirmation T+30 max: "Datele tale au fost sterse din serverele
   Andura pe [DATA]. Backup-urile retentie 30 zile se curata automat pana
   pe [DATA + 30 zile]."

---

## §4 Tombstones (audit trail, NU soft delete)

Per ADR 011 §"Tombstone retention":
- Erasure event logged in CDL (Coach Decision Log) ca `event=USER_ERASURE`
- Retention 90 zile post-erasure pentru:
  - Multi-device sync edge cases (alt device offline 7 zile + sync recover)
  - GDPR compliance disclosure (Privacy Policy mentions tombstone period)
  - Audit trail daca apare ANSPDCP inquiry post-erasure
- Auto-cleanup Cloud Function lunar (post-Beta TBD)
- **Tombstone NU este "soft delete recoverable"** — userul NU poate restore.
  Doar metadata `userId + erasureTimestamp` retinuta, ZERO content.

---

## §5 Edge cases

### §5.1 Backup snapshots Firebase
Firebase RTDB are daily automatic backups. Per DSR_HANDLER §Phase 3:
backup-urile retentie 30 zile se curata automat post-erasure -> user
notified "Backup-urile se curata pana pe [DATA + 30 zile]".

### §5.2 Email pending (Magic Link unconsumed)
`pendingEmail` localStorage key cleared in `wipeAllLocalData()` automatic.

### §5.3 Sentry events PII stripped
§17-M3 LANDED: `beforeSend` redacteaza uid + email patterns. Post-erasure
Sentry events nu mai contin PII; cleanup manual rar necesar (DSR_HANDLER §Phase 3.3).

### §5.4 Multi-device user
Userul are sesiuni active pe 2 telefoane (Tier 0 desync transient). Erasure
de pe device 1 -> Tier 1 IDB + Tier 2 RTDB sterse. Device 2 deconectat
offline -> la urmatorul login auth fail (user record deleted Firebase Auth)
-> redirect Onboarding T0 fresh + Tier 0 local stale ignored.

### §5.5 Stergere partiala FAIL (Firebase down)
Daca `wipeRemoteData` esueaza partial (network error mid-fetch DELETE):
- Local Tier 0 deja wipe ok
- IDB partial wipe (Dexie delete database = atomic, all-or-nothing)
- RTDB DELETE partial -> manual cleanup DSR_HANDLER §Phase 3
- Userul vede "Cont sters" UI (redirect /auth) — verbal validation OK
- Background retry NOT implemented V1 (fire-and-forget); monitoring Sentry
  va captura `[DeleteAccountConfirm] Tier 2 RTDB DELETE failed` warnings

V1 acceptance: best-effort delete. Manual handler fallback documented.

---

## §6 Forbidden patterns (anti-violation)

**ZERO `deleted_at` columns in schema RTDB / IDB / localStorage.**
Erasure = field removal, NU flag toggle.

**ZERO "restore account" feature.** Userul sterge prost cont accidental -> 30 zile rabdare -> recreate cont fresh.

**ZERO "deactivate" UI option distinct de "delete".** Single CTA "Sterge
cont". Logout = sesiune inchisa (date raman); Delete = TOT sters.

**ZERO ambiguous wording.** UI text DeleteAccountConfirm:
"Toate datele tale (locale + remote) vor fi sterse imediat. Aceasta
actiune nu poate fi anulata. Nu vei mai putea recupera datele dupa
confirmare."

---

## §7 Verify Beta entry (cross-ref BETA_ENTRY_CRITERIA §8)

GDPR runbook live-tested includes:
- Daniel manual smoke: delete cont test -> Firebase Console verify
  `/users/<uid>` node missing + Auth user missing
- Tier 1 IDB verify: `indexedDB.databases()` pre/post -> andura-<uid> gone
- Tier 0 verify: `localStorage` `wv2-*` keys cleared
- Re-login same email -> Onboarding T0 fresh (data NU vizibila)

---

**Delete Policy SSOT** — decizie singulara hard delete. §50-C4 closure
2026-05-22. ZERO soft delete V1. ZERO restore. Account deletion = TOT
sters definitiv in secunde.
