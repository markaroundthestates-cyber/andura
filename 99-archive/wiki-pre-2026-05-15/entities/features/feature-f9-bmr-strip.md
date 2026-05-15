---
title: F9 — BMR Strip Single-Line Summary (Drop Multi-Component Strip per Audit Modify)
type: entity-feature
status: landed
last_updated: 2026-05-12
audit_verdict: modify-simplified
cross_refs:
  - "[[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F9"
  - "[[../adrs/adr-022-bayesian-nutrition-inference]]"
  - "[[../adrs/adr-015-getbf-calibration-only]]"
---

# F9 — BMR Strip Single-Line Summary

## Synthesis

**F9 BMR Strip** = display visual BMR + TDEE + macro targets inline coach idle. V1 prod implementation probabil multi-component strip elaborate. V1_AUDIT verdict **MODIFY simplified — drop strip, replace cu single-line summary** "🎯 Azi: 2400 kcal · 180g protein" sufficient pentru Gigel. Strip multi-component (BMR, TDEE, kcal target, macro split) = info dump Gigel ignores. Engine corect per Bug 2 fix commit `05ba372` Katch-McArdle BF-aware când finite + Mifflin fallback defensive.

**UX surface mockup V2:** Single line discret Antrenor idle "🎯 Azi: 2400 kcal · 180g protein" + accent color verde dacă on-target/galben dacă deficit. NU strip elaborate multi-row. Pattern preserved cross-feature single signal communication concise.

**Engine integration:** [[../adrs/adr-022-bayesian-nutrition-inference]] Bayesian Nutrition Engine #3 pipeline §42.10 4th — Kalman filter prior posterior adaptive TDEE estimate refined chat-to-chat (NU hardcoded 2000 kcal). Cross-engine [[../adrs/adr-015-getbf-calibration-only]] getBF calibration only Option B Formula B preserved single path Anti-Recommendation NU hybrid Option C fudge factors. STAGE 2 prod bugs reconcile 2026-05-11 P1-FLAG-PROD-AUTO-FAZA + P1-FLAG-PROD-BF-EDIT RESOLVED commit chain `c7d8457 + 05ba372`.

## Verbatim quotes Daniel

Daniel verbatim §F9 modify simplified rationale anti-info-dump:
> *"Strip multi-component (BMR, TDEE, kcal target, macro split) = info dump Gigel ignores. Single line '🎯 Azi: 2400 kcal · 180g protein' = sufficient. Plus per Bug 2 fix `05ba372` BMR auto-calculate Katch-McArdle BF-aware = engine corect, just simplify UI display."*

Daniel verbatim ADR 022 Bayesian inference adaptive anti-2000-kcal-hardcoded:
> *"Bayesian inference adaptive — Kalman filter prior posterior. TDEE estimate refined chat-to-chat. NU hardcoded 2000 kcal."*

Daniel verbatim STAGE 2 prod bugs fix rationale:
> *"in prod nu mai e nimic hardcoded. drop pilotActive gate. Katch-McArdle BF-aware când finite, Mifflin fallback. fix prod bugs reconcile."*

## Bugatti framing notes

**Gigel test relevance:** Single line "🎯 Azi: 2400 kcal · 180g protein" = zero gândire user (instant recognize daily target). Anti-info-dump scope creep. Gigel test PASS.

**Quality > Speed via single line replace strip:** Anti-multi-component visual elaborate. Pattern: communicate target concise (1 line + 1 emoji). Anti-feature-creep V1 discipline.

**Anti-RE considerations:** §AR.3 ground truth git verify applied — STAGE 2 prod bugs reconcile commit `c7d8457 + 05ba372` LANDED. Pattern: bug fix integrated la port NU carry stale hardcoded "2000 kcal" assumption.

**Anti-paternalism notes:** Target informează (numerical goal) NU impune ("trebuie să mănânci 2400 kcal exact"). User decides intake based on context. SUFLET F2 alignment.

**Voice tone notes:** Daniel-ism "info dump Gigel ignores" recurring pattern (anti-cognitive-load discipline). Daniel-ism "in prod nu mai e nimic hardcoded" anti-RE assertion.

## Cross-refs raw layer

- [[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F9 verdict MODIFY simplified single line
- [[../../../03-decisions/022-bayesian-nutrition-inference]] Bayesian Nutrition Engine #3 pipeline §42.10 4th + Kalman filter
- [[../../../03-decisions/015-getbf-calibration-only]] Option B Formula B preserved single path Anti-Recommendation
- [[../../../src/engine/sys.js]] lines 54-67 estimateTDEE Katch-McArdle BF-aware + Mifflin fallback commit `05ba372`
- [[../../../03-decisions/DECISION_LOG]] §2026-05-11 STAGE 2 Prod bugs reconcile P1-FLAG-PROD-AUTO-FAZA + P1-FLAG-PROD-BF-EDIT RESOLVED
- [[../../../DIFF_FLAGS]] §P1-FLAG-PROD-AUTO-FAZA-2026-05-10 RESOLVED + §P1-FLAG-PROD-BF-EDIT-KCAL-2026-05-10 RESOLVED
- [[../../../04-architecture/mockups/andura-clasic.html]] §antrenor BMR single line V2 SoT

🦫 **F9 BMR Strip MODIFY simplified V1 — single line "🎯 Azi: X kcal · Yg protein" + accent color. Drop multi-component strip info dump. Engine Bayesian Nutrition pipeline §42.10 4th adaptive Kalman filter. STAGE 2 prod bugs reconcile integrated commit `05ba372`.**
