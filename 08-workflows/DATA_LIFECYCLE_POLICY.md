# DATA LIFECYCLE POLICY

**Owner:** Daniel (CEO + Product) · Co-CTO Claude chat
**Status:** LIVE policy doc — pre-Beta baseline; post-Beta refinement
**Locked:** 2026-05-22 (Iter 1 Mass Fix V2 audit cluster KAPPA §50-H5/H6)
**Cross-ref:** ADR 001 local-first-storage, ADR 006 tier-storage-for-logs,
DPA_FIREBASE.md, DSR_HANDLER.md, CONSENT_MGMT.md

---

## §1 Scop

Policy doc descriind ciclul de viata al datelor utilizatorilor Andura, pe
nivelele de stocare (Tier 0/1/2), inclusiv retentie, opt-out, account
dormant, reactivation. Nu este implementare; este contract Daniel cu
utilizatorii + reference pentru audit GDPR (Art. 5 storage limitation,
Art. 17 right to erasure).

---

## §2 Tier-uri stocare (cross-ref ADR 006)

### §2.1 Tier 0 — localStorage browser-local

- **Stocat unde:** `localStorage` namespaced cu UID (`wv2-${uid}-*`)
- **Date tipice:** session in-flight, draft set logs, UI state ephemeral,
  cache scurt-trai
- **Persistenta:** pana cand user clear browser storage SAU 24h policy
  expiry (Tier 0 retention)
- **Sync remote:** NU — pur local-only
- **Cleanup:** purge automat post-24h; orphan keys curatate la fiecare
  login

### §2.2 Tier 1 — IndexedDB Dexie (per UID)

- **Stocat unde:** Dexie DB `andura-tier1-${uid}`
- **Date tipice:** sessions complete (ultimele 90 zile), CDL coach
  decision log, profile data, body composition history scurt
- **Persistenta:** 90 zile rolling window
- **Sync remote:** mirror-up to Tier 2 Firebase la sync interval (online
  reconnect, app close, manual sync)
- **Cleanup:** post-90 zile, aggregate la summary + push Tier 2 archive;
  raw entries deleted local

### §2.3 Tier 2 — Firebase RTDB archive

- **Stocat unde:** Firebase RTDB `users/${uid}/archived/*`
- **Date tipice:** aggregated weekly/monthly summaries, baseline metrics
  trend, body composition long-term, calibration history
- **Persistenta:** indefinita (account active)
- **Sync down:** on-demand cand user navigates Istoric tab > 90 zile back
- **Cleanup:** doar la account deletion (DSR) sau dormant trigger §4.2

---

## §3 Retention policy per data type

| Data type | Tier 0 | Tier 1 | Tier 2 | Erasure trigger |
|-----------|--------|--------|--------|-----------------|
| Session in-flight | 24h | NA | NA | Auto purge |
| Session complete (raw sets) | NA | 90 zile | aggregated post-90z | User DSR |
| Weight logs | NA | 90 zile | indefinit (trend) | User DSR |
| Body composition (BF%, LBM) | NA | 90 zile | indefinit (trend) | User DSR |
| Profile data (name, email, varsta) | NA | indefinit account-active | indefinit account-active | User DSR / account delete |
| CDL coach decision log | NA | 90 zile | aggregated insights | User DSR |
| Calibration history | NA | 90 zile | aggregated baseline | User DSR |
| MMI/momentum signals | session | 90 zile | aggregated | User DSR |
| Sentry breadcrumbs (post-§13-C1) | NA | NA | Sentry 90 zile | Sentry retention policy |
| Analytics events (if added post-Beta) | NA | NA | TBD (anonimizate) | TBD post-Beta ADR |

**Opt-out:** orice categorie poate fi exclusa per user consent toggle in
SettingsPrivacy (GDPR Art. 7 withdraw consent). Cross-ref CONSENT_MGMT.md.

---

## §4 Account lifecycle

### §4.1 Account activ

- User login ultima 30 zile = ACTIVE
- Toate tier-urile operate normal
- Sync remote bi-directional

### §4.2 Account dormant (>1 an inactiv)

- User login NULL ultimele 365 zile = DORMANT
- **Notificare reactivare:** la urmatorul login, prompt: "Bine ai venit
  inapoi. Datele tale sunt salvate. Vrei sa continui?" cu CTA "Continua"
  + link "Stergeti contul si datele" pentru opt-out final.
- **Stocare:** Tier 2 retained pana la 2 ani inactivity. Apoi auto-prompt
  email "Vrei sa stergem contul?" cu CTA confirm.
- **Auto-delete pasiv:** post-3 ani inactivity FARA reactivare → account
  marked-for-deletion + 30-zile grace period notification email → hard
  delete via DSR handler.
- **Reactivation flow:** user login dupa dormant → restore Tier 2 data,
  prompt-re-consent privacy toggle, regenerate IndexedDB Tier 1 from
  archive aggregate. (Cross-ref REACTIVATION_FLOW.md.)
- **Status implementare:** POST-BETA — dormancy detection si auto-prompt
  email logic NU implementate pre-Beta. Manual cleanup possible pre-Beta
  via DSR handler. Documented here pentru roadmap.

### §4.3 Account delete (user-initiated DSR Art. 17)

- User access SettingsDanger > "Sterge contul" → ConfirmDeleteAccount
  modal → user confirm → hard delete:
  1. Firebase Auth user record removed
  2. Firebase RTDB `users/${uid}/*` removed (Tier 2 archive)
  3. IndexedDB Tier 1 cleared local
  4. localStorage Tier 0 cleared local
  5. Sentry user mapping anonymized post-§13-C1
- **Confirmation user:** screen final "Contul a fost sters. Multumim."
- **Reversibilitate:** ZERO. Cross-ref Phase 6 task_17 §45-H4 audit.
- **Cross-ref:** DSR_HANDLER.md §1.x deletion path.

---

## §5 GDPR Art. 5 storage limitation alignment

- Tier 0/1 = rolling window (24h/90d) → "kept only as long as necessary"
- Tier 2 archive aggregated, no raw PII pe long-term (decoupling raw from
  identity) → minimization
- User can request export full data anytime (DSR Art. 15) via
  SettingsDanger "Exporta datele" (post-Beta feature).
- Account deletion fully irreversibil → Art. 17 erasure satisfied.

---

## §6 Implementation status

| Mecanism | Status |
|----------|--------|
| Tier 0 24h auto-purge | LANDED (Phase 4 task_06) |
| Tier 1 90-day rolling | LANDED (Phase 4 task_08) |
| Tier 1 -> Tier 2 aggregation pre-archive | PENDING (cross-ref §35-H1 HIGH-IOTA cluster) |
| Tier 2 restore on Istoric back-nav | PENDING (cross-ref §35-H3 HIGH-IOTA) |
| Account delete (full wipe) | LANDED (Phase 6 task_17 §45-H4 verify HIGH-BETA) |
| Dormancy detection logic | POST-BETA |
| Auto-prompt email dormant | POST-BETA |
| 3-year inactive auto-delete | POST-BETA |
| Data export (Art. 15 portability) | POST-BETA |
| Re-consent post-reactivation | POST-BETA |

---

## §7 Open questions

- Cum gestionam un user care si-a sters contul si re-creeaza cu acelasi
  email? Treated as new account, zero data restored. (Default safe.)
- Sentry retention post-§13-C1 wire — verify default 90 zile + ensure NU
  PII raw in breadcrumbs.
- Analytics future ADR pentru anonimizare (k-anonymity Art. 26-h ADR 019
  reference).

---

## §8 Audit chain

- Each policy change → DECISIONS.md LOCKED V1 entry referencing this
  doc + cross-ref linkedge data type impacted.
- Dormancy detection feature → new ADR XXX + Beta entry criteria update.
- Auto-delete cadence change → DPA_FIREBASE.md addendum + user
  notification template update.
