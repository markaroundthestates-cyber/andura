---
title: ADR Bias Detection Observable v1 (Volume Creep + Auto-pedeapsă)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-05-02
authority: 03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1.md LOCKED V1 Chat D ADR Review Process §36.56 — 0 amendments clean LOCK
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[../concepts/andura-suflet]]"
  - "[[../concepts/anti-recurrence-rules]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[adr-pain-discomfort-button]]"
amendments: []
---

# ADR Bias Detection Observable v1

## Synthesis

ADR_BIAS_DETECTION_OBSERVABLE = Bias detection codificabil determinist via UI events pentru Andura V1 (NU chat → NU language analysis, observable behavior pattern detection only). V1 scope: **Volume Creep + Auto-pedeapsă** (codificabile UI events). **Catastrofizare SCRAP V1, defer V2** (per push-back productive: user matur 2+ skip + manual Reset/Deload = realism + autonomy, NU bias). Nutrition-based bias (binge/restrict patterns) = V2+ (NO nutrition tracking V1).

**Volume Creep Detection §36.18:** Trigger = `(Sesiunea curentă seturi finalizate RPE ≥ 8) AND (User apasă "Adaugă set" 2× consecutiv same exercise)`. Acțiune = friction in-moment la apăsarea 2-a (NU final session), NU blocaj autonomy. Wording UI prompt LOCKED *"Mai mult nu înseamnă întotdeauna mai bine. Vrei să continui?"* [Continuă] [Sunt OK fără]. Înregistrare = recap silent CDL final session, NU re-banner. Pattern detection accumulates over time pentru cooldown adjustments §22 F-NEW-3.

**Auto-pedeapsă Detection §36.19:** Trigger = `(Setul N validat RIR optim §36.16 RIR Matrix) AND (Setul N+1 greutatea redusă manual ≥20%)`. Acțiune = engine NU blochează (autonomy 100%), prompt informativ neutru data-driven. Wording UI LOCKED *"Setul anterior a fost validat la efort optim. Greutatea a fost redusă cu peste 20% — confirmă dacă vrei un progres conservativ sau dacă revii la baseline."* [Continuă cu greutatea redusă] [Revino la baseline].

## Verbatim quotes Daniel

Daniel verbatim §36.18 Volume Creep wording rationale (preserved EXACT 2026-05-02 SUFLET ANDURA ingest):
> *"Mai mult nu înseamnă întotdeauna mai bine. Vrei să continui?"*

Daniel verbatim §36.19 Auto-pedeapsă wording rationale neutru data-driven:
> *"Setul anterior a fost validat la efort optim. Greutatea a fost redusă cu peste 20% — confirmă dacă vrei un progres conservativ sau dacă revii la baseline."*

Daniel verbatim push-back productive Catastrofizare SCRAP V1:
> *"user matur 2+ skip + manual Reset/Deload = realism + autonomy, NU bias. SCRAP catastrofizare detection V1. Defer V2."*

## Bugatti framing notes

**Gigel test relevance:** Wording neutru data-driven *"Mai mult nu înseamnă întotdeauna mai bine"* = anti-paternalism, NU "you're doing wrong". Friction in-moment NU final session = anti-spam pattern.

**Quality > Speed via observable behavior:** UI events deterministic (RPE ≥ 8 + 2× consecutive add set / RIR optim + 20% reduce) = NU NLP runtime. SUFLET ANDURA principle "engine deterministic foundation 75% replicabil".

**Anti-RE considerations:** Pattern detection accumulates over time pentru cooldown adjustments §22 F-NEW-3 = anti-recurrence (re-banner same session = noise). Silent CDL log only post initial prompt.

**Anti-paternalism notes:** Auto-pedeapsă wording explicit *"confirmă dacă vrei un progres conservativ"* = engine NU presupune cauză (somn slab? stres? sicknesss? — NU știe). User decides path, engine info-only.

**Voice tone notes:** Daniel-ism "user matur" pattern preserved (anti-paternalism foundation). Catastrofizare SCRAP V1 + defer V2 = anti-scope-creep discipline.

## Cross-refs raw layer

- [[../../../03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1]] §Decision Volume Creep + Auto-pedeapsă verbatim
- [[../../../01-vision/SUFLET_ANDURA]] §3 bias detection cognitive distortion patterns source
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.18 Volume Creep + §36.19 Auto-pedeapsă + §36.20 (origin) + §22 F-NEW-3 cooldown
- [[../../../03-decisions/011-coach-decision-log-architecture]] silent CDL recap final session
- [[../../../03-decisions/DECISION_LOG]] §2026-05-02 Chat D ADR Review Process §36.56 LOCK 0 amendments

🦫 **ADR Bias Detection Observable LOCKED V1 2026-05-02. Volume Creep + Auto-pedeapsă observable UI events. Catastrofizare SCRAP V1, defer V2. ZERO autonomy blocaj. Data-driven prompt neutru anti-paternalism.**
