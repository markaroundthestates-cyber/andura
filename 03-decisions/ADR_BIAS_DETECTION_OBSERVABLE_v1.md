# ADR — Bias Detection Observable v1 (Volume Creep + Auto-pedeapsă)

**Status:** **DRAFT — pending Daniel review**
**Date:** 2026-05-02 (SUFLET ANDURA ingest)
**See also:** [[SUFLET_ANDURA]] §3 + HANDOVER_GLOBAL §36.18 + §36.19 + §36.20 + ADR Pattern 14 No-Inference + ADR 011 CDL + §22 F-NEW-4 Anti-RE banner

---

## Context

Sufletul Andura descrie **bias detection** ca pattern critical: AI-ul observă comportamente cognitive distortion (volume creep auto-aggression, auto-pedeapsă post-success, catastrofizare post-skip). În chat conversational, detection prin language analysis. Andura V1 = NU chat → detection trebuie să fie **observabilă din comportament UI**.

V1 scope: **Volume Creep + Auto-pedeapsă** (codificabil determinist via UI events). **Catastrofizare SCRAP V1, defer V2** (per push-back productive: user matur 2+ skip + manual Reset/Deload = realism + autonomy, NU bias).

Nutrition-based bias (binge/restrict patterns) = V2+ (NO nutrition tracking V1).

## Decision

### Volume Creep Detection (per §36.18)

**Trigger:** `(Sesiunea curentă are seturi finalizate la RPE >= 8) AND (User apasă "Adaugă set" 2× consecutiv same exercise)`

**Acțiune:** Friction in-moment la apăsarea 2-a (NU final session), NU blocaj autonomy.

**Wording UI prompt LOCKED:**
> "Mai mult nu înseamnă întotdeauna mai bine. Vrei să continui?"
> [Continuă] [Sunt OK fără]

**Înregistrare:** Recap silent în CDL la final session, NU re-banner. Pattern detection accumulates over time pentru cooldown adjustments §22 F-NEW-3.

### Auto-pedeapsă Detection (per §36.19)

**Trigger:** `(Setul N validat la RIR optim per §36.16 RIR Matrix) AND (Setul N+1 are greutatea redusă manual cu >=20%)`

**Acțiune:** Engine NU blochează (autonomy 100%), prompt informativ neutru data-driven.

**Wording UI LOCKED (sub cartonaș exercițiu):**
> "Setul anterior a fost validat la efort optim. Greutatea a fost redusă cu peste 20% — confirmă dacă vrei un progres conservativ sau dacă revii la baseline."
> [Continuă cu greutatea redusă] [Revino la baseline]

**Filozofie:** ZERO paternalism guru-style. ZERO "corpul tău poate susține" predictiv (engine NU știe). Informare neutră, user decide.

### Catastrofizare SCRAP V1 (per §36.20)

**Decision:** Eliminăm trigger detection catastrofizare V1.

**Rationale:** User-ul matur care vede 2+ skip-uri și încearcă manual Reset/Deload e act de **realism + autonomy**, NU bias negativ. Trigger anterior propus tratează ca infantil.

**V1 coverage:** Banner generic Anti-RE post 2+ skip §22 F-NEW-4 acoperă ~80% risc abandon. Suficient.

**V2 reconsider:** Catastrofizare reală = abandon proces (tap "Termină programul" / dezinstalare flow / reduce manual frecvență 4×→1×). Detection complex, scope V2.

## Consequences

### Positive

- Observable + deterministic + verifiable. ZERO ML/NLP runtime.
- AI informează, NU impune (Sufletul Andura §1.1 F2 alignment).
- User agency 100% preservat — autonomy NU blocked.
- Anti-RE: ZERO cifre user-facing în prompts (no "RPE ≥ 8", no "20% reducere").

### Negative

- False positive Volume Creep: legitim bodybuilder Sprinter pe ziua de "high volume" intentionat → 2× "Adaugă set" = friction prompt despite intentional. Mitigation: prompt acceptable cost (NU blocaj), user dismiss [Continuă] = silent CDL recap.
- False positive Auto-pedeapsă: legitim user reduce greutate post-injury concern → engine prompt friction redundant. Mitigation: prompt informativ (NU blocaj), user [Continuă cu greutatea redusă] dismiss.

### Risks

- Volume Creep RPE threshold: dependent pe §36.16 RIR Matrix verbal feedback → RIR numeric mapping accurate. Dacă mapping wrong, threshold spurious.
- Auto-pedeapsă threshold "20% greutate redusă": suficient pentru detect intentional self-punishment? V1 conservative; V2 calibrate post-data.

## Test plan (deferred Daniel review)

- Unit Volume Creep: RPE 7 + 2× "Adaugă set" = NO trigger / RPE 8 + 2× = trigger / RPE 8 + 1× = NO trigger
- Unit Auto-pedeapsă: set N RIR 6+ + set N+1 -25% = trigger / set N RIR 6+ + set N+1 -15% = NO trigger / set N RIR 0 + set N+1 -25% = NO trigger (justified reduction post-fail)
- Catastrofizare scrap verification: 2+ skip + Reset/Deload manual = ZERO friction prompt (banner Anti-RE F-NEW-4 only)

## Reconsideration triggers

1. False positive rate Volume Creep > 30% (legitim Sprinter days flagged spurious).
2. Auto-pedeapsă threshold tuning post-beta data.
3. V2: catastrofizare detection cu signal "abandon proces" (tap "Termină programul" + dezinstalare flow indicator).
4. V2+: nutrition-based bias detection când nutrition tracking added.

---

*Authored 2026-05-02 SUFLET ANDURA ingest. Status DRAFT — pending Daniel review pre-LOCK.*

---

## §EXTENSION 2026-05-02 CHAT C SELF-CORRECTION EXTENSION (post Chat C ingest)

### EXT-1: Pain/Discomfort Button — Override CDL Log (§36.38)

**Decizie:** Pain Button Cazul 🔴 Red Flag → 3-button anti-paternalism flow include override "Continui pe răspunderea mea" → engine logs immediate în CDL: `[user_override_pain_redflag]`.

**Mecanică log:**
- CDL entry type: `pain_button_override`
- Payload: `{ exerciseId, timestamp, severity: 'red_flag', userAcknowledgedRisk: true }`
- ToS Coverage: "User-acknowledged risk override"
- **V1:** doar logging silent (NU intervention engine)
- **V2 (deferred post-beta):** escalation prompt dacă apăsat 3+ ori în 30 zile

**Filozofie aliniată:**
- SUFLET F2 "AI-ul informează, nu impune" — Cazul 🔴 NU forced skip
- ADR Pattern 14 — engine logs observable behavior, NU forțează acțiune
- Bias Detection v2 deferred — scaling decision post-beta data

**Distincție vs Volume Creep / Auto-pedeapsă (§36.18 + §36.19):**
- Volume Creep + Auto-pedeapsă = friction prompt in-moment (preventive)
- Pain Override = silent CDL log (forensic, NU preventive)
- Both feed engine learning, dar UX different (informare vs friction)

**Cross-ref:** §36.38 Pain/Discomfort Button + §36.18 Volume Creep + §36.19 Auto-pedeapsă + ADR 011 CDL architecture + SUFLET F2 + ADR Pattern 14.

---

*EXT-1 added 2026-05-02 CHAT C SELF-CORRECTION EXTENSION ingest.*
