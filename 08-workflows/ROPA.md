---
title: ROPA — Records of Processing Activities (GDPR Art. 30)
status: ACTIVE_SSOT
created: 2026-05-25
authority: §28-M5 audit-nuclear-2026-05-19 closure (cluster-4 forensic triage REAL_OPEN)
cross_refs:
  - 08-workflows/DATA_OWNERSHIP.md §3 (ce date colectam) + §7 (retention)
  - 08-workflows/DPA_FIREBASE.md §1 (roluri) + §3 (sub-processors) + §5 (transfer)
  - 08-workflows/CONSENT_MGMT.md §2 (lawful basis Art. 6 + 9)
  - 08-workflows/DATA_RESIDENCY.md (regiune EU verified)
  - 08-workflows/DSR_HANDLER.md (Art. 15-22 fulfillment)
---

# ROPA — Records of Processing Activities (Andura PWA)

> **Pozitie LOCKED V1:** Andura (Daniel Constantin Mazilu sole proprietorship
> pre-Beta) = **single data controller**. Art. 30(5) GDPR **exempteaza foarte
> probabil** acest record formal (organizatie <250 angajati, prelucrare NU
> high-risk, NU sistematica large-scale, NU special-category core business).
> Acest document = record minimal voluntar pentru accountability (Art. 5(2))
> + documentare pozitie exemptie. NU un ROPA corporativ over-engineered.

---

## §1 Pozitie exemptie Art. 30(5)

Art. 30(5) GDPR scuteste de obligatia ROPA formal organizatiile cu **<250
angajati**, EXCEPTAND cazul in care prelucrarea:

| Conditie exceptie Art. 30(5) | Aplicabil Andura? | Nota |
|---|---|---|
| (a) risc pentru drepturi/libertati (NU ocazional) | **NU** | Coach fitness personalizat; NU profiling cu efecte legale/semnificative (D-LEGACY-040 anti-engagement, NU advertising) |
| (b) prelucrare NON-ocazionala | **Discutabil** | Prelucrarea e core-product (NON-ocazionala) — de aceea mentinem record voluntar mai jos prin precautie |
| (c) special-category (Art. 9) sau condamnari (Art. 10) | **Minimal** | Doar medical disclaimer consent timestamp + body measurements (Art. 9(2)(a) explicit consent) — NU core business |

**Verdict:** Andura = 1 persoana (Daniel), prelucrare low-risk, special-category
minimal cu consent explicit. Exemptia se aplica foarte probabil. Totusi, fiindca
prelucrarea e NON-ocazionala (conditia b), **mentinem voluntar record minimal**
(§2-§3) — cost mic, accountability mare, re-utilizeaza date deja in
DATA_OWNERSHIP.md + DPA_FIREBASE.md.

**Re-evaluare:** la depasire prag (angajati, scale, special-category core, sau
profiling cu efecte semnificative) → ROPA formal complet devine obligatoriu.

---

## §2 Record controller (Art. 30(1))

| Camp Art. 30(1) | Valoare |
|---|---|
| **(a) Controller + contact** | Daniel Constantin Mazilu (sole proprietorship pre-Beta), `privacy@andura.app` / `maziludanielconstantin90@gmail.com` |
| **DPO** | NU desemnat (NU obligatoriu Art. 37 — NU large-scale systematic monitoring NU special-category core) |
| **(b) Scopuri prelucrare** | Coach fitness personalizat (generare program + adaptare load/RPE) + backup cross-device + error monitoring opt-in |
| **(c) Categorii data subjects** | Useri Andura (Beta testeri pre-Beta; post-Beta useri inregistrati) |
| **(c) Categorii date** | Identity (email + uid) · profil onboarding (Big 6: varsta, sex, obiectiv, frecventa, experienta, greutate) · sesiuni antrenament (set log + RPE + tempo) · masuratori corp (waist/neck/hip) · consent timestamps |
| **(d) Destinatari** | Sub-processors §3 (Firebase, Sentry opt-in, Vercel, email provider). ZERO vanzare/partajare marketing |
| **(e) Transfer tari terte** | ZERO transfer date utilizator in afara EU/EEA in V1 Beta (DATA_RESIDENCY.md). Acces tehnic ad-hoc US (Google support) acoperit SCC 2021/914 Module 2 + EU-US DPF (DPA_FIREBASE.md §5) |
| **(f) Termene stergere** | Tier 0 last-24h transient · Tier 1 IDB 90 zile rolling · Tier 2 RTDB 90 zile rolling (D045) · tombstones 90 zile post-erasure (ADR 011) · Sentry 90 zile (DATA_OWNERSHIP.md §7) |
| **(g) Masuri securitate** | Encryption in-transit + at-rest (Firebase Art. 32) · telemetry opt-in OFF default + PII stripped `beforeSend` (§17-M3) · local-first Tier 0/1 · IAM Daniel-only · hard delete real-time (DELETE_POLICY.md) |

---

## §3 Activitati de prelucrare (sumar)

Re-utilizeaza lawful basis din CONSENT_MGMT.md §2 + sub-processors din
DPA_FIREBASE.md §3:

| # | Activitate | Lawful basis (Art. 6/9) | Date | Processor |
|---|---|---|---|---|
| 1 | Cont + autentificare | Art. 6(1)(b) contract | email + uid + Magic Link token | Firebase Auth (EU) |
| 2 | Coach personalizat | Art. 6(1)(b) contract + Art. 6(1)(f) legitimate interest | Big 6 + sesiuni + masuratori | Firebase RTDB (europe-west1) |
| 3 | Medical disclaimer + masuratori health-adjacent | Art. 9(2)(a) explicit consent | consent timestamp + body measurements | Tier 0 localStorage (device) |
| 4 | Backup cross-device | Art. 6(1)(b) contract | sesiuni JSON | Firebase RTDB (EU) |
| 5 | Error monitoring | Art. 6(1)(a) consent (opt-in OFF default) | stack traces PII-stripped | Sentry (EU instance) |
| 6 | Magic Link email delivery | Art. 6(1)(b) contract | email destinatar + oobCode | SendGrid/SES (EU pool, TBD final pre-Beta) |

ZERO advertising, ZERO data brokers, ZERO AI training fara consimtamant explicit
(DATA_OWNERSHIP.md §5).

---

## §4 References

- GDPR Art. 30 (Records of Processing Activities) + Art. 30(5) (exemptie <250 angajati)
- GDPR Art. 5(2) (accountability) + Art. 37 (DPO criteria)
- Recital 13 + WP29 position paper Art. 30(5) (derogation small-scale): https://ec.europa.eu/newsroom/article29/items/624045
- ANSPDCP guidance Romania: https://www.dataprotection.ro/
- DATA_OWNERSHIP.md §3 + §7 (categorii date + retention)
- DPA_FIREBASE.md §1 + §3 + §5 (roluri + sub-processors + transfer)
- CONSENT_MGMT.md §2 (lawful basis Art. 6 + 9)

---

**ROPA SSOT** — record minimal voluntar + pozitie exemptie Art. 30(5). §28-M5
closure 2026-05-25. Re-evaluare la depasire prag scale/risc/special-category core.
