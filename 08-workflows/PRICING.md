---
title: Pricing Tier Definition — V1 Free Beta
status: ACTIVE_SSOT
created: 2026-05-22
authority: §27-H1 audit-nuclear-2026-05-19 closure
cross_refs:
  - 08-workflows/BETA_ENTRY_CRITERIA.md (Free Beta launch gate)
  - 08-workflows/DATA_OWNERSHIP.md §5 (NU vindem, NU profilam)
  - DECISIONS.md (post-Beta tier strategy TBD trigger Daniel CEO)
  - ANDURA_PRIMER.md §1 (V1 Beta Free, pricing post-Beta launch)
---

# Pricing — Andura PWA V1

> **Decizie LOCKED V1:** V1 Beta = **Free** integral. ZERO paid tier,
> ZERO in-app purchase, ZERO subscription, ZERO ads pe perioada Beta.
> Post-Beta tier model = decizie Daniel CEO determinata pre-Launch GA.

---

## §1 V1 Beta — Free integral

**Toate functionalitatile = gratuite pentru testeri Beta:**

- Magic Link sign-in + OAuth Google
- Onboarding Big 6 + Tier T0->T3+ personalization
- Engine pipeline complet (8 engines + MMI #9): periodization, Brzycki 1RM,
  Kalman recovery, demographic prior, calibration tiers, RIR matrix,
  bayesian nutrition, MMI inference
- Coach workout + rest + post-summary
- Library 657/657 exercises full
- Tier 0/1/2 storage (localStorage + IndexedDB + Firebase RTDB backup)
- GDPR Art. 15-22 self-service (export + delete + rectify + telemetry opt)
- PWA install + offline navigation

**ZERO restrictie functionala pe baza de plata** in perioada Beta.

---

## §2 Tier strategy post-Beta — TBD Daniel CEO

Modelele evaluate (NON-LOCKED, decizie Daniel CEO post-Launch):

| Model candidat | Caracteristici | Pros | Cons |
|---|---|---|---|
| **Freemium** | Tier gratuit core + premium features paywall | Onboarding gratuit, conversie post-engagement | Decizie ce features paywall sensibila brand "anti-engagement" D-LEGACY-040 |
| **Subscription lunar/anual** | Acces full contra abonament | Revenue predictabil + alignment value | Bariera entry; nu se aliniaza cu "free pentru toti" stage early |
| **One-time purchase** | Lifetime acces contra plata unica | Aliniere "user owns data" (DATA_OWNERSHIP.md) | Revenue uncertain post-cohort; service hosting recurring |
| **Donation-based** | Free integral + tipping optional | Aliniere brand "anti-extract" | Sustenabilitate uncertain solo founder |

**ZERO decizie LOCKED V1 pre-Launch GA.** Daniel CEO determina post-Beta
feedback + insights cohort 50 testeri inceput.

---

## §3 Authority + change procedure

- **Decision authority:** Daniel CEO + Product Owner singular. ZERO Co-CTO
  Claude autonomous override per scope strategic pricing.
- **Trigger evaluare tier:** post-Beta launch GA (50 testeri concluzii) +
  cohort >= 200 useri activi 30d sustained.
- **Change procedure:** append entry `DECISIONS.md` LOCKED V1 cu wording
  tier definitiv, plus update acest doc §2 -> §1 status.
- **Communication:** user notification email + in-app banner >=30 zile
  inainte de efect (alignment cu DATA_OWNERSHIP.md §8 versioning policy).

---

## §4 Anti-engagement constraints pe future tier model

Indiferent de modelul tier ales post-Beta, constrangerile brand persista:

- **NU dark patterns** — no FOMO countdown, no fake scarcity, no manipulative
  upgrade prompts (D-LEGACY-040 anti-engagement)
- **NU paywall date utilizator** — export GDPR Art. 20 raman free for all
  tiers (DATA_OWNERSHIP.md §1 user owns data principle)
- **NU paywall delete** — Art. 17 erasure raman free for all tiers
- **NU paywall security features** — auth, fresh-gate, breach notify raman
  free for all (DATA_BREACH_RESPONSE.md user safety)
- **NU lock-in artificial** — daca user migreaza la alta platforma, JSON
  export portable Art. 20 ramane available

Aliniere cu Bugatti paradigm: pricing strategy = aliniere cu value real
livrata, NU extragere valoare via friction artificiala.

---

## §5 References

- DECISIONS.md (post-Beta tier strategy append TBD)
- ANDURA_PRIMER.md §1 (V1 Beta Free declaratie)
- BETA_ENTRY_CRITERIA.md (Free Beta launch gate)
- DATA_OWNERSHIP.md §5 (NU vindem, NU profilam)
- GDPR Art. 20 (portability ramane gratis indiferent de tier)

---

**Pricing SSOT** — V1 Free Beta declaratie singulara. §27-H1 closure
2026-05-22. Post-Beta tier strategy decizie viitoare Daniel CEO trigger
post-Launch GA evaluare.
