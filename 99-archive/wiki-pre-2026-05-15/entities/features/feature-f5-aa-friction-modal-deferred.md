---
title: F5 — AA Friction Modal V2-Deferred (DROP V1 per Audit + ADR 013 §AMENDED Anti-Paternalism ABSOLUTE)
type: entity-feature
status: dropped
last_updated: 2026-05-12
audit_verdict: drop-v1
cross_refs:
  - "[[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F5"
  - "[[../adrs/adr-013-auto-aggression-detection]]"
  - "[[../engines/engine-streak-counter]]"
---

# F5 — AA Friction Modal V2-Deferred

## Synthesis

**F5 AA Friction Modal** = V1 prod modal asks user friction questions on session start (motivație, oboseală, durere) cu dismiss-once-per-day mechanism. V1 prod `showAAFrictionModal` + `isAAFrictionDismissedToday`. V1_AUDIT verdict **DROP V1 defer V2** — modal pe start sesiune = friction Gigel "Întreabă-mă chestii înainte să apuc să-ncep" annoyance pattern + sticky modal Gigel deja a închis.

**V2 path:** Defer la v1.5 cu UX flow inline (NU modal blocking) — eventual integration questions integrate în onboarding extended sau coach idle prompts pasive. Cross-ref ADR 013 §AMENDED 2026-04-30 force-typing ELIMINATED PERMANENT Anti-paternalism ABSOLUTE — pattern preserved invariant SUFLET F2 alignment.

**Implementation status:** Dropped V1 — `showAAFrictionModal` + `isAAFrictionDismissedToday` NU porturi V2. Tests aaFrictionModal.test.js 14 tests preserved (legacy V1 prod parallel) dar V2 vanilla NU re-implementare. Cross-engine [[../engines/engine-streak-counter]] §EXT-1 + §EXT-2 amendment ADR_OUTLIER_FILTER 2026-05-04 alternative signal (streak detection observable NU modal blocking).

## Verbatim quotes Daniel

Daniel verbatim §F5 DROP V1 audit verdict rationale anti-friction Gigel:
> *"Modal pe start sesiune = friction Gigel. 'Întreabă-mă chestii înainte să apuc să-ncep' = annoyance pattern. Plus dismiss-once-per-day = sticky pe modal Gigel deja a închis. Defer la v1.5 cu UX flow inline (NU modal blocking) — eventual integration questions integrate în onboarding extended sau coach idle prompts pasive."*

Daniel verbatim ADR 013 §AMENDED 2026-04-30 force-typing ELIMINATED PERMANENT Anti-paternalism ABSOLUTE rationale:
> *"Force-typing ELIMINATED PERMANENT. Anti-paternalism ABSOLUTE. User agency preserved. Pattern invariant cross-feature."*

## Bugatti framing notes

**Gigel test relevance:** Modal blocking pe start sesiune = friction Gigel test FAIL ("Întreabă-mă chestii înainte să apuc să-ncep"). DROP V1 verdict explicit per audit Co-CTO bias.

**Quality > Speed via DROP V1 defer V2:** Anti-scope-creep V1 discipline. NU forced re-design pre-Beta. Defer la v1.5 cu UX flow inline integrated în onboarding extended.

**Anti-RE considerations:** ADR 013 §AMENDED force-typing ELIMINATED PERMANENT Anti-paternalism ABSOLUTE invariant preserved. Pattern: codify anti-paternalism Anti-RE rule LOCKED V1 PERMANENT (NU revert V2).

**Anti-paternalism notes:** Drop AA friction modal = anti-paternalism ABSOLUTE per ADR 013 §AMENDED. SUFLET F2 "AI-ul informează, nu impune" alignment explicit. User agency preserved zero modal blocking pre-sesiune.

**Voice tone notes:** Daniel-ism "modal Gigel deja a închis" recurring pattern (sticky-modal anti-recurrence). Verbatim friction analysis preserved.

## Cross-refs raw layer

- [[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F5 verdict DROP V1 defer v1.5 UX flow inline
- [[../../../03-decisions/013-auto-aggression-detection]] §AMENDED 2026-04-30 force-typing ELIMINATED PERMANENT Anti-paternalism ABSOLUTE
- [[../../../01-vision/SUFLET_ANDURA]] §F2 "AI-ul informează, nu impune" alignment invariant
- [[../../../src/pages/coach/aaFrictionModal.js]] (V1 prod parallel preserved, NU V2 re-implementare)
- [[../../../src/pages/coach/__tests__/aaFrictionModal.test.js]] (14 tests V1 legacy preserved)
- [[../engines/engine-streak-counter]] (§EXT-1 + §EXT-2 alternative signal observable NU modal blocking)

🦫 **F5 AA Friction Modal DROP V1 defer v1.5 UX flow inline. ADR 013 §AMENDED force-typing ELIMINATED PERMANENT Anti-paternalism ABSOLUTE invariant. Gigel test FAIL modal blocking pre-sesiune. SUFLET F2 alignment explicit.**
