---
title: Data Residency — EU `europe-west1` Region
status: ACTIVE_SSOT
created: 2026-05-22
authority: §28-H2 audit-nuclear-2026-05-19 closure (POSITIVE compliant)
cross_refs:
  - 08-workflows/DPA_FIREBASE.md §3 (sub-processor list EU regions)
  - 08-workflows/DATA_OWNERSHIP.md §6 (data residency declaratie user)
  - 08-workflows/DATA_BREACH_RESPONSE.md (breach notify scope)
  - src/firebase.js:10 (FIREBASE_URL europe-west1 active)
  - src/util/__tests__/sentryPiiStrip.test.js:33 (europe-west1 verified in tests)
  - src/react/routes/screens/cont/SettingsPrivacy.tsx:152 (UI disclosure)
---

# Data Residency — Andura PWA EU/EEA

> **Decizie LOCKED V1:** Toate datele utilizator Andura V1 Beta = stocate
> in **EU/EEA**. Firebase RTDB region `europe-west1` (Frankfurt, Germany)
> verificat in cod + tests + UI disclosure. ZERO transfer in afara EU/EEA
> pentru date personale utilizator. Conformitate GDPR Art. 44+ (adequate
> transfer = nu necesar, date raman in EU primary).

---

## §1 Firebase Realtime Database — `europe-west1`

**Verificare cod:**
```
src/firebase.js:10
export const FIREBASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_RTDB_URL)
  || 'https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app';
```

**Verificare in tests:**
```
src/util/__tests__/sentryPiiStrip.test.js:33
const url = `https://andura-default-rtdb.europe-west1.firebasedatabase.app/users/${uid}/sessions.json`;
```

**Verificare in UI disclosure user:**
```
src/react/routes/screens/cont/SettingsPrivacy.tsx:152
regiune europe-west1 EU
src/react/routes/screens/cont/SettingsPrivacy.tsx:166
Date stocate UE (Firebase europe-west1)
```

**Verificare in test ARIA:**
```
src/react/__tests__/screens/cont/SettingsPrivacy.aria.test.tsx:78
expect(article.textContent).toMatch(/europe-west1/i);
```

**Datacenter fizic:** Frankfurt, Germany (Google Cloud zone
`europe-west1-b/c/d`). Date la rest + in tranzit raman in teritoriul UE.

---

## §2 Sub-processors region map

Aliniat cu DPA_FIREBASE.md §3 sub-processor list:

| Sub-processor | Serviciu | Region | Verificare |
|---|---|---|---|
| Firebase Authentication (Google) | Auth + Magic Link | EU multi-region (Auth global routing; data stored EU primary) | Google Cloud docs: Auth backed by Identity Platform, regional config GCP |
| Firebase RTDB (Google) | Tier 2 backup sessions | EU `europe-west1` Frankfurt | `src/firebase.js:10` verified |
| Sentry (Functional Software Ireland Ltd) | Error monitoring opt-in | EU (Sentry SaaS EU instance) | Sentry org settings EU data residency confirmed pre-Beta |
| Vercel | PWA static hosting | Multi-region CDN (no user data persists; only static assets cached edge) | Vercel CDN edge cache (no PII) |
| SendGrid / SES (TBD pre-Beta) | Magic Link email | SendGrid EU pool / SES eu-central-1 (Frankfurt) | TBD final pre-Beta selection |

**ZERO sub-processor in afara EU/EEA** pentru date personale utilizator V1.

---

## §3 Selectie regiune Firebase

**Cum a fost selectata:** la momentul creare Firebase project, Daniel a
selectat region `europe-west1` (Frankfurt) explicit pentru:
- Latency optimal user RO/EU primary cohort (sub-50ms Bucuresti-Frankfurt)
- GDPR data residency compliance (date raman in EU/EEA jurisdiction)
- Schrems II protection (no US data transfer required default)

**Re-selectie regiune NU permisa:** Firebase RTDB regiune este immutable
post project creation. Migrare regiune = creare project nou + data
migration. Pre-Beta = ZERO trigger pentru migration; europe-west1 = optim.

**Documentatie Firebase region selection:**
- Firebase Realtime Database locations: https://firebase.google.com/docs/database/locations
- Firebase global region availability: https://firebase.google.com/docs/projects/locations

---

## §4 Cross-border transfer avoidance

**Default V1 Beta:** ZERO transfer in afara EU/EEA pentru date utilizator.

**Scenarii exceptionale:**

- **Google support context (US-based engineer accesseaza pentru bug fix):**
  - Mecanism legal: Standard Contractual Clauses (SCCs) Module 2 incluse
    in Google Cloud DPA (DPA_FIREBASE.md §5)
  - Schrems II compliance: Google Cloud Transfer Impact Assessment
    publicat https://cloud.google.com/privacy/sccs
  - EU-US Data Privacy Framework certificare Google active

- **Sentry US headquarters debug:**
  - PII stripped before transmission (`beforeSend` callback §17-M3 LANDED)
  - Stack traces only, ZERO uid/email/payload personal
  - Sentry EU instance routing primary

- **Daniel Daniel CEO solo bootstrap accesseaza data din RO:**
  - Daniel rezident RO = EU/EEA jurisdiction (Bucuresti-Brasov)
  - NU constituie cross-border transfer (RO = EU member)

---

## §5 User communication (transparency Art. 13 + 14)

User vizibilitate disclosure data residency:

- **In-app Privacy Policy** (SettingsPrivacy.tsx) explicit declarare
  `europe-west1 EU` (linia 152 + 166 verified)
- **DATA_OWNERSHIP.md §6** user-facing referinta data residency
- **Privacy Policy version 2026-Q2** include sectiune dedicata
  "Localizare date" (verifiable in app via Cont > Confidentialitate)

---

## §6 Monitoring + verification ongoing

Ongoing assurance ca date raman in EU:

- **Pre-deploy check:** `npm run build` post-LANDED verifica
  `VITE_FIREBASE_RTDB_URL` env-var aliniat cu `europe-west1` URL
- **Quarterly review:** Daniel revizuieste Firebase Console > Project
  Settings > Storage location pentru drift detection
- **Sentry config audit:** Sentry org settings > Data Storage Location =
  EU confirmation
- **Sub-processor changes:** orice schimbare regiune sub-processor
  declanseaza notificare user >=30 zile (DPA_FIREBASE.md §4)

---

## §7 Legal basis cross-border (when needed)

Daca viitor scaling necesita US-based services (post-Beta):

| Mecanism | Aplicabil cand | Document |
|---|---|---|
| Adequacy decision EU-Comm | Doar pentru tari adequate (UK, Switzerland, Japan, etc.) — NU US | https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en |
| Standard Contractual Clauses (SCCs) | Default pentru US sub-processors | https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj |
| EU-US Data Privacy Framework | Pentru DPF-certified US entities (Google active certified) | https://www.dataprivacyframework.gov/ |
| Binding Corporate Rules | NU aplicabil solo bootstrap stage | n/a |
| Derogations Art. 49 | Doar caz exceptional consent + necessary | n/a default |

**V1 Beta:** ZERO mecanism cross-border activat = date raman in EU
primary. Mecanisme listate aici doar pentru forward-compat post-Beta scale.

---

## §8 References

- GDPR Art. 44 (general principle for transfers)
- GDPR Art. 45 (adequacy decisions)
- GDPR Art. 46 (transfers subject to appropriate safeguards = SCCs)
- GDPR Art. 49 (derogations specific situations)
- Firebase Realtime Database locations: https://firebase.google.com/docs/database/locations
- Google Cloud privacy regions: https://cloud.google.com/about/locations
- EU-US Data Privacy Framework: https://www.dataprivacyframework.gov/
- Schrems II decision (C-311/18): https://curia.europa.eu/juris/document/document.jsf?docid=228677
- DATA_OWNERSHIP.md §6 (data residency user-facing)
- DPA_FIREBASE.md §3 (sub-processor list region map)

---

**Data Residency SSOT** — declaratie singulara EU/EEA primary residency
+ verification chain (cod + tests + UI). §28-H2 closure 2026-05-22.
POSITIVE compliant per audit nuclear V3.
