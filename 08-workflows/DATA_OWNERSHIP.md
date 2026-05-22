---
title: Data Ownership Statement — User Owns All Data
status: ACTIVE_SSOT
created: 2026-05-22
authority: §50-C3 audit-nuclear-2026-05-19 closure
cross_refs:
  - 08-workflows/DSR_HANDLER.md (§28-H3 GDPR Art. 15-22 manual path)
  - 08-workflows/DELETE_POLICY.md (§50-C4 hard delete decision)
  - 08-workflows/DATA_BREACH_RESPONSE.md (§28-C4 GDPR Art. 33/34)
  - 08-workflows/BETA_ENTRY_CRITERIA.md §8 (GDPR runbooks live-tested)
  - src/react/routes/screens/cont/SettingsPrivacy.tsx (in-app Privacy Policy)
  - src/react/routes/screens/cont/SettingsExport.tsx (Art. 20 portability)
  - src/react/routes/screens/cont/DeleteAccountConfirm.tsx (Art. 17 erasure)
---

# Data Ownership Statement — Andura PWA

> **Principiul fundamental:** Userul detine integral datele sale. Andura este
> custode tehnic, NU proprietar. Toate drepturile GDPR Art. 15-22 sunt
> activate prin self-service in-app (§1) sau handler manual (§2).

---

## §1 Statement public (din Privacy Policy — RO)

**Tu detii datele tale. Andura le pastreaza pentru tine.**

Datele tale (sesiuni de antrenament, profil, masuratori, configurari coach)
sunt ale tale. Andura functioneaza ca custode tehnic — le stocheaza, le
prelucreaza local + in cloud Firebase ca sa-ti returneze coach personalizat,
dar NU le vinde, NU le partajeaza terti pentru marketing, NU le foloseste
pentru training modele AI fara consimtamant explicit.

In orice moment poti:
- **Vedea datele** (Art. 15 — Acces) -> Cont > Descarca date
- **Modifica datele** (Art. 16 — Rectificare) -> Cont > Profil & tinte
- **Exporta datele** (Art. 20 — Portabilitate) -> Cont > Descarca date (JSON)
- **Sterge datele** (Art. 17 — Dreptul la stergere) -> Cont > Sterge cont
- **Opri prelucrarea telemetrie** (Art. 21 — Opozitie) -> Cont > Confidentialitate
- **Limita prelucrarea** (Art. 18 — Restrictie) -> Cont > Deconectare

---

## §2 Coverage matrix per GDPR right

| Drept GDPR | Articol | Path in-app | Scope acoperit |
|---|---|---|---|
| Acces | Art. 15 | Cont > Descarca date | Tier 0 (localStorage `wv2-*`) + Tier 1 (IDB sessions §28-M4 LANDED) |
| Rectificare | Art. 16 | Cont > Profil & tinte | Big 6 + tinte directe |
| Stergere | Art. 17 | Cont > Sterge cont | Tier 0 + Tier 1 IDB + Tier 2 RTDB DELETE (§B039 LANDED) |
| Restrictie | Art. 18 | Cont > Deconectare | Logout opreste scrieri noi backup; date locale raman |
| Portabilitate | Art. 20 | Cont > Descarca date | JSON machine-readable §28-M4 |
| Opozitie telemetrie | Art. 21 | Cont > Confidentialitate | Toggle telemetry default OFF |
| Consimtamant retras | Art. 7(3) | Cont > Sterge cont = retrage tot | Hard delete all tiers |

Pentru cereri OUTSIDE in-app (lost device, ANSPDCP inquiry) vezi `DSR_HANDLER.md`.

---

## §3 Ce date colectam (transparency)

### Tier 0 — Last 24h transient (localStorage)
- `wv2-active-workout` — sesiune curenta in desfasurare
- `wv2-energy-check` — readiness state
- `wv2-pending-rpe` — set log buffer
- Persistare prin Zustand `persist` middleware partialize

### Tier 1 — Last 90d active (Dexie IndexedDB per UID)
- Sesiuni complete cu set log + RPE + tempo
- Tabel `sessions` cu indexes uid + date + exerciseId
- Cleanup rolling 90d via `src/util/tierStorage.js`

### Tier 2 — 90d rolling archive (Firebase RTDB)
- Backup remote pentru cross-device sync + recuperare
- Path `/users/<uid>/sessions/<sessionId>` per ADR 002 REST API
- Retention 90 zile rolling (D045 LOCKED V1); aggregate logs lunar
- Tombstones 90 zile post-erasure (ADR 011)

### Sentry telemetry (opt-in OFF default)
- Error events sample 10% (production) cu PII stripped (§17-M3 LANDED — uid + email patterns redacted in `beforeSend`)
- Toggle on/off via Cont > Confidentialitate

---

## §4 Sub-processors (transparency Art. 28(2))

Lista live publicata in Privacy Policy (§28-H6 LANDED via SettingsPrivacy):

| Sub-processor | Rol | Date partajate |
|---|---|---|
| Firebase (Google Cloud) | Auth + RTDB backup tier | uid + email + Tier 2 sesiuni |
| Sentry (functional.software Romania SRL) | Error monitoring opt-in | Stack traces (PII stripped §17-M3) |
| SendGrid / SES (TBD final pre-Beta) | Magic Link email delivery | email destinatar |
| Vercel | Hosting static PWA | NU date utilizator (CDN cache asseturi) |

Subprocessor list updates published in Privacy Policy version revision.

---

## §5 Ce NU facem cu datele tale

- **NU vindem** date catre terti (publicitate, brokeri, data marketplaces)
- **NU partajam** date cu retele sociale (FB Pixel, Google Ads, TikTok)
- **NU folosim** date pentru training modele AI fara consimtamant explicit
  (anti-engagement: D-LEGACY-040 ZERO addictive pattern)
- **NU stocam** date sensibile (sanatate, religie, orientare politica) —
  exceptie: medical disclaimer consent timestamp (§9-H2 LANDED) Art. 9(2)(a)
- **NU profilam** beyond personalizare coach pipeline §42.10 (NU advertising)

---

## §6 Localizare date (data residency)

- Tier 0 + Tier 1 = device user (RO/EU teritoriu user)
- Tier 2 Firebase RTDB region `europe-west1` (frankfurt) — verificare deploy
- Sentry events: region EU server (Sentry SaaS EU instance)
- Email Magic Link: SendGrid EU pool / SES eu-central-1 (TBD final pre-Beta)

ZERO transferuri in afara EU/EEA pentru date utilizator in V1 Beta.

---

## §7 Pastrare data (retention)

- **Active**: cat timp contul exista
- **Tier 1 IDB**: 90 zile rolling (sliding window post-session)
- **Tier 2 RTDB**: 90 zile rolling (D045 LOCKED V1)
- **Backup snapshots Firebase**: 30 zile auto-cleanup post-erasure (per `DSR_HANDLER.md` §Phase 3)
- **Tombstones erasure**: 90 zile (ADR 011) pentru audit GDPR
- **Sentry events**: 90 zile retention default (Sentry config)

Stergere cont (Art. 17) declanseaza hard delete tot stack-ul — vezi `DELETE_POLICY.md`.

---

## §8 Schimbari (versioning policy)

Modificari materiale ale acestui statement -> notificare email + in-app banner
>=30 zile inainte de efect. Versiune curenta vizibila in Privacy Policy
(SettingsPrivacy.tsx) cu data update.

---

**Data Ownership SSOT** — declaratie singulara pre-Beta. §50-C3 closure
2026-05-22. Sursa de adevar pentru wording Privacy Policy + comunicare cu
useri pe tema proprietate date.
