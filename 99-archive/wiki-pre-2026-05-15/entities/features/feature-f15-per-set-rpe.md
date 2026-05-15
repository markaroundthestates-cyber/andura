---
title: F15 — Per-Set RPE Granularity (logging.js + session.js setsRPE Collection CDL AA Detector)
type: entity-feature
status: landed
last_updated: 2026-05-12
audit_verdict: keep-verbatim
cross_refs:
  - "[[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F15"
  - "[[../adrs/adr-013-auto-aggression-detection]]"
  - "[[../adrs/adr-011-coach-decision-log-architecture]]"
---

# F15 — Per-Set RPE Granularity

## Synthesis

**F15 Per-Set RPE Granularity** = per-set RPE entry detail în session logs (logging.js + session.js setsRPE collection). V1 prod implementation collect RPE per fiecare set individual NU averaged session. V1_AUDIT verdict **KEEP verbatim** — per-set RPE high signal pentru engine adaptation (Bayesian inference per set NU averaged session). Gigel familiar cu "set greu / set ușor" intuitive. Drop = pierde resolution engine. Direct port.

**BATCH 2 SLICE 0 LANDED preservation invariant:** F15 per-set RPE preservation achieved orthogonally via logging.js untouched + session.js setsRPE collection preserved (V1 lines 217-220 for CDL AA detector ADR 013) + all CDL outcome logic ADR 011 preserved verbatim. Audit conflict reconciliation captured anti-recurrence: F15 preservation (spec §2.1 concern) achieved orthogonal de la rating-time notes injection F13.

**Engine integration:** [[../adrs/adr-011-coach-decision-log-architecture]] CDL append-only persistent + §AMENDMENT 2026-05-08 pipeline_event schema — per-set RPE consumed via CDL AA detector ADR 013 (5 signals cumulative + 4 profiles + 3 severity) + §AMENDED 2026-04-30 force-typing ELIMINATED PERMANENT Anti-paternalism ABSOLUTE invariant preserved. Cross-engine [[../adrs/adr-022-bayesian-nutrition-inference]] Bayesian inference per set NU averaged session enables Kalman filter prior posterior adaptive granularity.

## Verbatim quotes Daniel

Daniel verbatim §F15 keep verbatim rationale high signal engine resolution:
> *"Per-set RPE = high signal pentru engine adaptation (Bayesian inference per set, NU averaged session). Gigel familiar cu 'set greu / set ușor' = intuitive. Drop = pierde resolution engine. Direct port."*

Daniel verbatim BATCH 2 SLICE 0 F15 preservation orthogonal F13 DROP:
> *"F15 per-set RPE preservation (spec §2.1 concern) achieved via logging.js untouched + session.js setsRPE collection preserved — orthogonal to rating-time notes injection F13."*

Daniel verbatim ADR 011 §AMENDMENT pipeline_event schema 2026-05-08:
> *"CDL append-only persistent + pipeline_event schema 2026-05-08 amendment. Per-set RPE consumed via CDL AA detector ADR 013."*

## Bugatti framing notes

**Gigel test relevance:** Per-set RPE entry intuitive "set greu / set ușor" — Gigel familiar cu gym vernacular. Anti-jargon (NU "Rate of Perceived Exertion 8.5/10"). Verbal RPE 3-option cross-feature consistent F12.

**Quality > Speed via per-set NU averaged session:** Engine resolution granular Bayesian inference per set anti-information-loss. Pattern: capture signal granular pentru engine adaptation quality.

**Anti-RE considerations:** Audit conflict reconciliation captured anti-recurrence: F15 preservation orthogonal F13 DROP — logging.js untouched + session.js setsRPE collection preserved. Pattern: orthogonal feature concerns preserve cross-cutting invariant.

**Anti-paternalism notes:** ADR 013 §AMENDED 2026-04-30 force-typing ELIMINATED PERMANENT Anti-paternalism ABSOLUTE invariant preserved. Per-set RPE = optional capture NU mandatory entry user.

**Voice tone notes:** Daniel-ism "set greu / set ușor" vernacular RO gym preserved. Anti-corporate-jargon discipline cross-feature.

## Cross-refs raw layer

- [[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F15 verdict KEEP verbatim
- [[../../../src/pages/coach/logging.js]] (V1 logging untouched BATCH 2 SLICE 0 preserved F15)
- [[../../../src/pages/coach/session.js]] (V1 lines 217-220 setsRPE collection preserved BATCH 2 SLICE 0 commit `324d198`)
- [[../../../03-decisions/011-coach-decision-log-architecture]] §AMENDMENT 2026-05-08 pipeline_event schema CDL append-only
- [[../../../03-decisions/013-auto-aggression-detection]] §AMENDED 2026-04-30 force-typing ELIMINATED PERMANENT 5 signals cumulative
- [[../../../03-decisions/022-bayesian-nutrition-inference]] Bayesian inference per set Kalman filter granular cross-engine
- [[../../../03-decisions/DECISION_LOG]] §2026-05-12 BATCH 2 SLICE 0 F15 preservation orthogonal F13 DROP audit conflict reconciliation

🦫 **F15 Per-Set RPE Granularity KEEP verbatim. logging.js untouched + session.js setsRPE collection preserved orthogonal F13 DROP. Engine adaptation Bayesian inference per set NU averaged session. CDL AA detector ADR 013 consumer. Gym vernacular "set greu / set ușor" Gigel familiar.**
