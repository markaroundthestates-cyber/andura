---
title: Data Processing Agreement — Firebase as Processor
status: ACTIVE_SSOT
created: 2026-05-22
authority: §28-H1 audit-nuclear-2026-05-19 closure
cross_refs:
  - 08-workflows/DATA_OWNERSHIP.md §4 (sub-processors transparency Art. 28(2))
  - 08-workflows/DATA_RESIDENCY.md (region europe-west1 RTDB)
  - 08-workflows/DATA_BREACH_RESPONSE.md (§28-C4 GDPR Art. 33/34 breach notify)
  - 08-workflows/DSR_HANDLER.md (§28-H3 GDPR Art. 15-22 fulfillment)
  - src/firebase.js (FIREBASE_URL europe-west1 active)
---

# Data Processing Agreement — Firebase

> **Decizie LOCKED V1:** Firebase (Google LLC + Google Ireland Limited)
> actioneaza ca **data processor** pentru Andura PWA. Andura (Daniel
> Constantin Mazilu sole proprietorship pre-Beta) = **data controller**
> per GDPR Art. 4(7). Sub-processor list documentat §3. Cross-border
> transfer mecanism = Standard Contractual Clauses Module 2 (controller-to-processor).

---

## §1 Roluri GDPR

| Rol | Entitate | Responsabilitati |
|---|---|---|
| **Controller** | Andura (Daniel Mazilu solo bootstrap pre-Beta) | Determina scopurile + mijloacele prelucrarii (Art. 4(7)). Decide ce date colecteaza, retention, sub-processors. |
| **Processor** | Firebase / Google LLC + Google Ireland Limited | Prelucreaza datele in numele Andura conform instructiunilor scrise (Art. 4(8), Art. 28(3)). NU determina scopuri proprii. |
| **Data subject** | User Andura (Beta tester / post-Beta) | Detine datele (Art. 4(1)). Exerciteaza drepturi Art. 15-22 via in-app SAU `privacy@andura.app`. |

---

## §2 Acceptare DPA Firebase

**Google Cloud Data Processing Addendum** (Firebase incluse in scope):
- URL canonic: https://firebase.google.com/terms/data-processing-terms
- Acceptata automatic la signup Firebase project (Daniel Google account)
- Versiune efectiva pre-Beta launch: aplicabila per Firebase ToS curente
- Tipologie: Standard Contractual Clauses 2021/914 Module 2 (controller-to-processor)
- Confirmare acceptare: Firebase Console > Project Settings > Privacy &
  Security (verifiable in browser session Daniel)

**Privacy & Terms canonice:**
- Google Privacy Policy: https://policies.google.com/privacy
- Firebase Privacy & Security: https://firebase.google.com/support/privacy
- Google Cloud Privacy: https://cloud.google.com/terms/cloud-privacy-notice

---

## §3 Sub-processors active in Andura V1

Lista live aliniata cu DATA_OWNERSHIP.md §4 + Privacy Policy in-app §28-H6:

| Sub-processor | Categorie | Date partajate | Locatie procesare |
|---|---|---|---|
| **Firebase Authentication** (Google) | Auth identity | Email + uid + Magic Link tokens | EU (europe-west1 region preferred; Auth multi-region failover) |
| **Firebase Realtime Database** (Google) | Tier 2 backup remote sessions | uid + sesiuni JSON + Big 6 onboarding | EU `europe-west1` (Frankfurt) verified `src/firebase.js:10` |
| **Firebase Hosting** (Google) | NU folosit V1 (Vercel hosting) | — | n/a |
| **Sentry** (Functional Software Ireland Ltd / Sentry.io) | Error monitoring opt-in OFF default | Stack traces cu PII stripped via `beforeSend` (§17-M3 LANDED) | EU (Sentry SaaS EU instance) |
| **Vercel** | Static PWA hosting + CDN | NU date utilizator (doar asseturi statice cache) | Multi-region CDN (no user data persists) |
| **SendGrid / SES** (TBD final pre-Beta) | Magic Link email delivery | Email destinatar + Magic Link oobCode | EU pool (SendGrid EU) sau eu-central-1 (SES Frankfurt) |

**ZERO sub-processor in afara EU/EEA** pentru date utilizator V1 Beta.
DATA_RESIDENCY.md §1-§2 verifica regiunea fiecaruia.

---

## §4 Sub-processor change procedure (Art. 28(2))

Modificari lista sub-processors -> notificare in Privacy Policy in-app
(SettingsPrivacy.tsx) cu data update, plus:

- **Adaugare sub-processor nou:** notificare in-app banner + email
  >=30 zile inainte de effective date
- **Inlocuire sub-processor existent:** acelasi 30 zile notice
- **User objection (Art. 28(2)):** dreptul user de a obiecta (telemetry
  opt-out toggle SettingsPrivacy.tsx Art. 21; account delete Art. 17 daca
  user nu accepta noul sub-processor)

---

## §5 Cross-border transfer mechanism

**Date raman in EU/EEA in V1 Beta** (vezi DATA_RESIDENCY.md). Daca
sub-processor parinte (Google LLC US headquarters) acceseaza tehnic in
context support / audit / debugging:

- **Mecanism legal:** Standard Contractual Clauses (SCCs) 2021/914
  Module 2 incluse in Google Cloud DPA (§2)
- **Adequate protection:** Google Cloud certified ISO 27001 + 27017 +
  27018 (data processor + PII). Vezi https://cloud.google.com/security/compliance
- **Schrems II compliance:** Google Cloud Transfer Impact Assessment
  publicat https://cloud.google.com/privacy/sccs (December 2021 SCCs)

**EU-US Data Privacy Framework (DPF):** Google certified DPF participant
- https://www.dataprivacyframework.gov/list (search "Google LLC")
- Aplicabil pentru orice transfer ad-hoc US-EU support context

---

## §6 Processor obligations key (Art. 28(3))

Firebase ca processor confirma in Google Cloud DPA:

- (a) **Documented instructions** — proceseaza date conform instructiunilor
  controller (Andura via Firebase API calls; no other purposes)
- (b) **Confidentiality** — personal authorized sa proceseze sub obligatie
  confidentialitate
- (c) **Security** — masuri tehnice + organizatorice Art. 32 (encryption
  in-transit + at-rest, access controls, audit logs)
- (d) **Sub-processor authorization** — Google publica list updates via
  Cloud Console + DPA notification
- (e) **Data subject rights assistance** — instrumente Firebase Console
  pentru DSR fulfillment (export + delete) per DSR_HANDLER.md §2
- (f) **Breach notification** — Firebase notifica Andura controller fara
  intarziere; Andura notifica ANSPDCP <=72h per DATA_BREACH_RESPONSE.md
- (g) **DPIA assistance** — Firebase publica Security & Privacy
  documentation pentru DPIA controller
- (h) **Return or deletion** — la incheiere contract DPA, date sterse sau
  returnate conform optiune Andura
- (i) **Audit + inspection** — Firebase ofera SOC 2 Type II + ISO 27001
  audit reports via Compliance Reports Manager

---

## §7 Andura controller obligations (Art. 24 + 28)

Andura ca controller:

- **Lawful basis** documented in Privacy Policy (consent Art. 6(1)(a) for
  account creation + legitimate interest Art. 6(1)(f) for coach personalization)
- **Data minimization** Art. 5(1)(c) — Big 6 onboarding minim necesar
- **Purpose limitation** Art. 5(1)(b) — date folosite doar pentru coach
  personalizat + backup tier
- **Retention** Art. 5(1)(e) — 90 zile rolling tiers per DATA_OWNERSHIP.md §7
- **Accountability** Art. 5(2) — DECISIONS.md SSOT + audit nuclear V3 trail
- **Privacy by Design** Art. 25 — telemetry opt-in OFF default §17-M1 +
  K-anonymity §4-L2 + local-first §D-LEGACY-001

---

## §8 References

- GDPR Art. 4(7-8) (controller + processor definitions)
- GDPR Art. 28 (processor obligations + sub-processors)
- GDPR Art. 44-50 (cross-border transfers)
- Google Cloud Data Processing Addendum: https://firebase.google.com/terms/data-processing-terms
- Standard Contractual Clauses 2021/914: https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj
- EU-US Data Privacy Framework: https://www.dataprivacyframework.gov/
- ANSPDCP guidance Romania: https://www.dataprotection.ro/
- DATA_OWNERSHIP.md §4 (sub-processor list user-facing)
- DATA_RESIDENCY.md (regiune EU verified)

---

**DPA Firebase SSOT** — declaratie singulara controller/processor relation
+ sub-processor list + transfer mechanism. §28-H1 closure 2026-05-22.
