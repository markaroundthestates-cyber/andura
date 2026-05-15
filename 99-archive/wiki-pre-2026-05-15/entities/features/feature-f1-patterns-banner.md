---
title: F1 — Pattern Banners (5 types, 2 keep V1 + 3 drop V2 per audit Co-CTO bias)
type: entity-feature
status: landed
last_updated: 2026-05-12
audit_verdict: modify-simplified
cross_refs:
  - "[[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F1"
  - "[[../adrs/adr-011-coach-decision-log-architecture]]"
  - "[[../engines/engine-coach-director]]"
---

# F1 — Pattern Banners

## Synthesis

**F1 Pattern Banners** = coach observation UI banners pe pattern-uri detectate. V1 prod implementation `PATTERN_BANNER_STRINGS` map + `shouldShowPatternBanner` + `formatPatternMessage`. V1_AUDIT verdict **MODIFY simplified — keep 2 of 5 patterns**: LOW_ADHERENCE + STAGNATION (high signal user-facing actionable) drop HIGH_DEVIATION + EARLY_END + PEAK_HOURS (paranoid surveillance Gigel suspect trust breach risk). Cross-ref P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER e2e calibration-ui.spec.js:194 SKIP'd post-strip diacritic (F1 port unblocks re-enable).

**UX surface mockup V2:** Banner discret deasupra obiectivelor Antrenor tab — single line message + dismiss button. NU modal blocking. NU multi-line context dump. Pattern preserved cross-engine (Energy DOWN trigger banner similar discret design).

## Verbatim quotes Daniel

Daniel verbatim §F1 audit verdict 2 keep + 3 drop rationale:
> *"LOW_ADHERENCE + STAGNATION = high signal user-facing actionable feedback Gigel înțelege 'OK, lasă-mă să recuperez'. HIGH_DEVIATION + EARLY_END + PEAK_HOURS = gimmick territory paranoid surveillance Gigel suspect → trust breach risk. Drop V2."*

Daniel verbatim "trust breach risk" SUFLET anti-surveillance principle alignment:
> *"Andura NU surveillance system. Coach observat 'faci la 22h' = creepy. Gigel suspect Big Brother monitoring. Drop V2."*

## Bugatti framing notes

**Gigel test relevance:** "Coach detectat că termini devreme / faci la 22h" = paranoid surveillance Gigel suspect (Gigel test FAIL). 2 keep (LOW_ADHERENCE + STAGNATION) = actionable feedback PASS Gigel test.

**Quality > Speed via 2 of 5 selectivity:** Modify simplified preserves high-signal patterns + drops low-signal/high-risk surveillance. Anti-feature-creep V1 discipline.

**Anti-RE considerations:** QA flag P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER e2e SKIP'd post-strip diacritic — fix la port NU carry forward bug. Pattern: bug detection pre-port + fix integrated (NU carry stale).

**Anti-paternalism notes:** Drop HIGH_DEVIATION + EARLY_END + PEAK_HOURS = anti-paternalism explicit (SUFLET §3 anti-surveillance principle). Coach observes patterns BUT user agency preserved (NU "you're failing at 22h" judgment language).

**Voice tone notes:** Daniel-ism "Gigel suspect trust breach risk" recurring pattern (SUFLET filter). Anti-Big-Brother metaphor preserved.

## Cross-refs raw layer

- [[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F1 verdict modify 2 keep / 3 drop V2
- [[../../../03-decisions/011-coach-decision-log-architecture]] (CDL pattern detection audit trail input)
- [[../../../03-decisions/DECISION_LOG]] §2026-05-10 V1_AUDIT LOCK V1 Co-CTO bias verdict
- [[../../../DIFF_FLAGS]] §P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER e2e calibration-ui.spec.js:194 SKIP cross-ref F1 port unblocks
- [[../../../04-architecture/mockups/andura-clasic.html]] §antrenor banner discret design V2 SoT
- [[../../../01-vision/SUFLET_ANDURA]] §3 anti-surveillance principle Gigel trust breach risk

🦫 **F1 Pattern Banners MODIFY simplified V1 — 2 keep (LOW_ADHERENCE + STAGNATION) / 3 drop V2 (paranoid surveillance). Anti-trust-breach Gigel test PASS verdict. QA flag bug fix integrated la port.**
