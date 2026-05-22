---
title: Communication Template V1 — Andura PWA Beta User Notifications
status: ACTIVE_SSOT
created: 2026-05-22
authority: HIGH-THETA Wave 2a chat 4 closure (recon HIGH-THETA spec)
cross_refs:
  - 08-workflows/PROD_OPS_RUNBOOK.md (§1 severity + §7 post-incident)
  - 08-workflows/POST_MORTEM_TEMPLATE.md
  - 08-workflows/DATA_BREACH_RESPONSE.md (§28-C4 GDPR Art. 33/34 notification)
  - 08-workflows/CONSENT_MGMT.md
---

# Communication Template — Andura PWA V1

Solo-founder operational templates pentru Beta user communication. Romanian-first
matching Andura brand voice — anti-paternalistic, warm-direct (D024 LOCKED V1).

ZERO diacritics în UI strings (D-LEGACY-064); diacritice OK în vault docs.

---

## §1 When to communicate

Communication required pentru:
- **P0 incident** (site down ≥30 min) — proactive notify within 2h post-resolved
- **P1 incident** (auth broken ≥1h) — proactive notify if affected >5 Beta users
- **Data breach** — MANDATORY per GDPR Art. 33/34 (vezi `DATA_BREACH_RESPONSE.md`)
- **Major planned downtime** — pre-announce 24h+ înainte
- **Pricing change** — pre-announce ≥30 days înainte (post-Beta pricing — PRICING.md)
- **Feature deprecation** — pre-announce 60+ days înainte (post-Beta)
- **Policy change** (Terms / Privacy) — notify + opt-in re-consent pentru material changes

Communication NU required pentru:
- P2/P3 degradations (silent fix în next deploy)
- Internal CC/Co-CTO operational notes (CHAT_STATE.md sufficient)
- Bug-fixes with no user-facing visible regression

---

## §2 Channel hierarchy

| Channel | Use case | Pre-Beta status |
|---------|----------|-----------------|
| Email transactional | P0/P1 + GDPR notifications | Firebase Auth SMTP (Daniel solo manual sender pre-Beta) |
| In-app banner | P0 active downtime + post-fix announcement | NOT IMPLEMENTED — A_LATER per BETA_ENTRY_CRITERIA |
| Andura status page | Continuous status + RSS feed | NU implemented (post-Beta consider statuspage.io) |
| Daniel social (Twitter/X) | Brand announcements (NU incident comms) | Daniel personal channels |

**Pre-Beta reality:** email transactional only. Daniel manually composes + sends via
own inbox (no admin tool yet). Beta cohort small (≤50 users) — manual scalable.

---

## §3 Template — P0/P1 incident notification (post-resolution)

Subject (RO no-diacritics):
```
Andura: incident remediat — <2-3 cuvinte topic>
```

Body:
```
Salut,

Astazi intre orele HH:MM si HH:MM (ora Romaniei), <surface broken> nu a functionat
corect. Problema este remediata acum si Andura functioneaza normal.

Ce s-a intamplat:
<2-3 propozitii — fara jargon tehnic, perspectiva user impact>

Ce am facut:
<2 propozitii — actiunea de remediere>

Datele tale: <"Datele tale raman intacte." OR "Cateva sesiuni recente au fost
pierdute — vezi mai jos restoration pas-cu-pas."> 

Ce poti face acum:
<bullets concrete daca user-side action needed; altfel NU>

Imi pare rau pentru deranj. Daca ai intrebari, raspunde direct la acest email.

Multumesc,
Daniel
Andura
```

**Tone invariants:**
- ZERO corporate hedge ("we apologize for any inconvenience") — Daniel direct
- ZERO blame externalize ("third-party provider issue") — Daniel owns it
- ZERO false-precision technical details — translate la user-impact
- DA warmth + concrete action — "ce am facut" specific NU vague
- DA timeline RO format (`intre HH:MM si HH:MM`)

---

## §4 Template — planned downtime (pre-announce)

Subject:
```
Andura: mentenanta planificata — <data> intre HH:MM si HH:MM
```

Body:
```
Salut,

Pe data de <YYYY-MM-DD>, intre orele HH:MM si HH:MM (ora Romaniei), Andura va fi
indisponibila aproximativ <X minute>.

Ce facem:
<1-2 propozitii — upgrade infrastructure / migration / etc.>

Impact:
- Aplicatia va fi inaccesibila pentru aprox. X minute
- Sesiunile in curs vor fi salvate local; sincronizarea reia automat post-mentenanta
- Datele tale raman intacte

Multumesc pentru intelegere,
Daniel
Andura
```

---

## §5 Template — data breach notification (GDPR Art. 34)

Refer `DATA_BREACH_RESPONSE.md` pentru full breach handling protocol + 72h ANSPDCP
notification timing. User notification template summary:

Subject:
```
Andura: incident de securitate — actiune recomandata
```

Body:
```
Salut,

Te informez ca pe data de <YYYY-MM-DD> a avut loc un incident de securitate care
a putut afecta datele tale Andura.

Datele expuse:
- <list specific — email/parola/sesiuni/etc.>

Ce am facut:
- <list — patch deployed, sessions invalidated, logs reviewed>
- Am notificat autoritatea de protectie a datelor (ANSPDCP) în 72h conform GDPR

Ce poti face:
- <specific actions — change password if applicable, monitor email, etc.>
- Daca observi activitate suspecta, scrie-mi direct la <email>

Detalii complete: <link to detailed post-mortem if Daniel choses to publish>

Imi pare rau ca s-a intamplat. Andura este un proiect bootstrapped solo si securitatea
ramane prioritate maxima.

Daniel
Andura
```

**GDPR Art. 34 requirements respected:**
- Plain language (NU jargon)
- Specific data categories exposed
- Specific remediation actions
- Contact channel pentru intrebari
- Notification timing per Art. 34 (without undue delay)

---

## §6 Template — policy change (Terms / Privacy update)

Subject:
```
Andura: actualizare <Termeni|Confidentialitate> — review necesar
```

Body:
```
Salut,

Am actualizat <Termenii / Politica de Confidentialitate> Andura. Schimbarile sunt
in vigoare incepand cu <YYYY-MM-DD>.

Ce s-a schimbat:
- <bullets concrete material changes — NU cosmetic typo fixes>

De ce: <1-2 propozitii rationale>

Ce trebuie sa faci:
- Citeste documentul actualizat: <link>
- <"Continui sa folosesti Andura = accepti automat schimbarile" OR "Confirma in
  aplicatie la urmatoarea sesiune" (depinde de severitate)>

Daca nu esti de acord:
- Ai dreptul sa-ti stergi contul: Cont > Sterge contul (vezi DELETE_POLICY.md)
- Datele tale sunt portabile: Cont > Descarca date (per GDPR Art. 20)

Multumesc,
Daniel
Andura
```

---

## §7 Communication frequency limits

Anti-spam discipline pentru Beta cohort trust preservation:

- **Max 1 incident notification per week** — batch P2/P3 fixes silent
- **Max 1 brand/feature announcement per month** — pre-Beta avoid newsletter pattern
- **Mandatory comms** (P0/P1, GDPR, policy) **NU counted toward limit** — always send

---

## §8 Approval gate pre-send

Pre-Beta = Daniel sole approver. Pre-Beta workflow:
1. Draft message în `📥_inbox/COMMS_DRAFT_<topic>_<date>.md`
2. Self-review against templates §3-§6
3. Daniel send manual via own inbox
4. Archive draft → `📥_inbox/_CONSUMED/`
5. Log în `CHAT_STATE.md` § live continuity sau `06-sessions-log/INCIDENT_<date>.md` §10 if incident

Post-Beta consider Co-CTO autonomous compose for routine announcements (per D024
LOCKED V1 pattern) + Daniel approval gate retained for material changes.

---

## §9 Cross-references

- `08-workflows/PROD_OPS_RUNBOOK.md` §1 severity + §7 post-incident
- `08-workflows/POST_MORTEM_TEMPLATE.md` — internal incident documentation
- `08-workflows/DATA_BREACH_RESPONSE.md` — full breach protocol + ANSPDCP path
- `08-workflows/CONSENT_MGMT.md` — consent renewal pentru material policy changes
- `08-workflows/DELETE_POLICY.md` — opt-out path reference
- `DECISIONS.md` §D024 — pre-Beta autonomous wording compose policy

---

🦫 **Communication Template SSOT V1** — Beta user notification protocol Romanian-first
anti-paternalistic Daniel direct tone. HIGH-THETA Wave 2a chat 4 closure 2026-05-22.
