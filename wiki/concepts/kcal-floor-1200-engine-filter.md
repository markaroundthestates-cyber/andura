---
title: Kcal Floor 1200 Engine Filter (LOCK V1 2026-05-14)
type: concept
status: locked-v1
locked_date: 2026-05-14
authority: Daniel CEO directive verbatim chat birou → acasă 2026-05-14 LOCK 8 product safety condition NEW — informativ + Engine #3 Bayesian Nutrition filter logic engine-side
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[pre-beta-full-scope-lock-v2]]"
  - "[[medical-safety-disclaimer-t-c-mandatory]]"
  - "[[andura-suflet]]"
  - "[[../entities/adrs/adr-022-bayesian-nutrition-inference]]"
  - "[[../entities/adrs/adr-024-goal-driven-program-templates]]"
  - "[[../entities/engines/engine-coach-director]]"
  - "[[../summaries/handover-2026-05-14-chat-birou-acasa-pre-beta-full-scope-lock-v2-plus-safety-disclaimer-t-c-plus-kcal-floor-plus-aggressive-loading-locked]]"
amendments:
  - date: 2026-05-15-chat-current-post-evening
    note: |
      APPEND chat ACASĂ 2026-05-15 chat-current post-evening — **LOCK 8 Kcal Floor 1200 Engine #3 Bayesian Nutrition filter LANDED commit `51728bc` engine-side forward-going infrastructure pre-emptive Co-CTO autonomous PROMPT_CC** per wiki/concepts/kcal-floor-1200-engine-filter LOCK V1 2026-05-14 + pre-beta-full-scope-lock-v2 LOCK 8 cumulative cu LOCK 1 Pre-Beta FULL strict + LOCK 4 Medical Disclaimer cascade.

      **Branch B decided per §0.2 PROMPT_CC** (V1 vanilla port `src/pages/nutrition.js` NU exista yet — mockup design SoT linii 1801-1832 Edit ✎ pencil pattern existing dar NU yet ported v2). Forward-going filter pre-emptive infrastructure ready: pass-through obs fara `kcalDaily` field preserves invariant V1 production weightDelta-only schema; obs cu `kcalDaily<1200` excluded când eventually schema extends post UI nutrition logging port.

      **Implementation 4 files single module `src/engine/bayesianNutrition/`:**
      - MODIFY `src/engine/bayesianNutrition/constants.js` (+37 LOC additive append) — NEW export `KCAL_FLOOR_DAILY_MIN = 1200` constant + NEW export `KCAL_FLOOR_CITATION_SOURCE = 'WHO (Organizatia Mondiala a Sanatatii)'` (no-diacritics rule LOCK V1 PERMANENT verified test regex). JSDoc V2 Bugatti craft anti-paternalism invariant ABSOLUTE preserved.
      - NEW `src/engine/bayesianNutrition/observationFilter.js` (~100 LOC pure-function module) — `filterKcalFloorObservations(observations)` defensive Array.isArray check + filter logic (kcalDaily<1200 excluded, fara kcalDaily field OR non-finite pass-through forward-compatible V1 weightDelta-only schema preserved invariant) returns `{filtered, excludedCount, citationSource, floorMin}` + `getKcalFloorInformativeMessage()` Romanian-first no-diacritics scientific anchored wording exact pattern Bugatti craft. Pure function ZERO mutation input + NEW array reference returned + deterministic same input→same output per ADR 026 §9 + ADR 018 §2 contract.
      - MODIFY `src/engine/bayesianNutrition/index.js` (+13 LOC import + filter integration) — În `evaluate(ctx)` line ~261 Cluster A1 Conjugate Normal-Normal section: apply filter pre sample mean/variance computation. Trace inline `trace.kcalFloorFilter = {excludedCount, citationSource, floorMin}` for CDL audit transparency. ZERO mutation Gaussian Conjugate Prior Normal-Normal closed-form algorithm semantics (ADR 026 §9.4.1 A1 LOCKED V1 preserved invariant) + ZERO touch existing weightDelta extraction logic.
      - NEW `src/engine/bayesianNutrition/tests/observationFilter.test.js` (~200 LOC, 21 tests) — Defensive input handling (4) + kcal floor threshold semantics 800/1200/1199/1500 (4) + forward compatibility 5 tests + constants verify (3) + getKcalFloorInformativeMessage (3) + pure function discipline ADR 026 §9 invariant (3).

      **Tests baseline 3504 → 3525 PASS preserved EXACT (+21 NEW observationFilter.test.js)** ZERO regression cross-engine.

      **Anti-paternalism preserved invariant ABSOLUTE:** NU blocăm log user (autonomy preserved per F2 Sufletul Andura "AI-ul informează NU impune"). CDL log original append-only persists transparency (ADR 011). Engine doar exclude din invatare Cluster A1 sample mean/variance.

      **§6 flag legitim UI nutrition logging implementation Daniel review explicit chat NEW RECOMMENDED** — LOCK 8 LANDED = engine-side filter forward-going infrastructure pre-emptive ready. UI consumer TRIGGER threshold detect <1200 + render `getKcalFloorInformativeMessage()` toast/banner informativ scientific anchored = pending implementation pre-Beta finalize. Status forward-going integration ready (engine layer + constant + function exported) BUT UI consumer pending (`src/pages/nutrition.js` NU exista yet — mockup design SoT 04-architecture/mockups/andura-clasic.html linii 1801-1832 pattern Edit ✎ pencil + manual log min=0 max=9999 inputmode=numeric). Daniel signal pending chat NEW: confirm UI nutrition logging port v2 vanilla scope tactical PROMPT_CC NEW (similar LOCK 4 pattern) ÎNAINTE Beta launch finalize OR defer post-Beta (engine filter already protect calcul obiective + preconizari viitoare per Daniel verbatim — UI trigger informativ doar additional layer transparency).

      Cross-link [[pre-beta-full-scope-lock-v2]] amendments 2026-05-15-chat-current-post-evening + [[medical-safety-disclaimer-t-c-mandatory]] amendments 2026-05-15-chat-current-post-evening + [[../summaries/handover-2026-05-15-chat-acasa-post-evening-triple-landed-c4-8-bayesian-nutrition-plus-lock-4-medical-disclaimer-plus-lock-8-kcal-floor-1200]] §1 NEW summary codify chat-current ACASĂ post-evening cumulative.
---

# Kcal Floor 1200 Engine Filter

## Synthesis

**Kcal Floor 1200 LOCK V1 NEW 2026-05-14** = safety condition product-side. User logează <1200 kcal/zi → mesaj informativ scientific anchored *"Minimul recomandat de [WHO/instituții] e 1200 kcal/zi. Andura NU include loguri sub acest prag pentru calcul obiective + preconizări viitoare"*. Log rămâne istoric CDL (transparency), Engine #3 Bayesian Nutrition ADR 022 filtrează din input pentru kcal_target inference + Engine #2 Goal Adaptation ADR 024 projection.

**Why:** Daniel CEO directive verbatim *"Daca user vrea sa puna sub 1200 kcal logate, mesaj ca minimul recomandat de institutil bla bla bla este de 1200 si ca andura nu o sa includa loguri mai mici pentru calculul obiectivelor si preconizari viitoare"* — anti-paternalism: NU blocăm log (user autonomy preserved invariant), exclude engine learning + informează scientific anchored (Andura NU recomandă accidentări via under-eating extreme). Cross-link paradigm Andura LOCK V1 chat-current cumulative cu Medical Safety Disclaimer (LOCK 4) + Aggressive Loading Warning (LOCK 9) — toate 3 safety conditions LOCK V1 chat-current 2026-05-14 paradigm "user face ce vrea, app NU recomandă accidentări".

**How to apply:**

**Implementation engine-side:**
- User logează kcal/zi <1200 → trigger mesaj informativ inline UI flow log nutriție
- Wording strict scientific anchored: *"Minimul recomandat de [instituție] e 1200 kcal/zi. Andura NU include loguri sub acest prag pentru calcul obiective + preconizări viitoare"*
- Log persists CDL append-only (transparency) — NU blocăm log, user autonomy preserved
- Engine #3 Bayesian Nutrition ADR 022 §42.10 pipeline filtrează din input pentru kcal_target inference (Kalman filter input excluded sub 1200)
- Engine #2 Goal Adaptation ADR 024 projection filtrează din input pentru kcal_target convergence projection (under-1200 logs not used pentru goal adaptation)

**TBD wording exact instituție citată (la implementation):**
- WHO (World Health Organization) — primary citable global standard
- ESPEN (European Society for Parenteral and Enteral Nutrition) — European-specific clinical
- INS România (Institutul Național de Sănătate) — local Romanian-first preference
- Co-CTO autonomous decide la implementation pre-Beta core scope per LOCK 1 directive "totul pre-Beta" (Recommended: WHO global standard for citation universal applicable + Romanian translation)

## Verbatim quotes Daniel

Daniel verbatim chat birou → acasă 2026-05-14 LOCK 8 directive ultra-clear:
> *"Daca user vrea sa puna sub 1200 kcal logate, mesaj ca minimul recomandat de institutil bla bla bla este de 1200 si ca andura nu o sa includa loguri mai mici pentru calculul obiectivelor si preconizari viitoare"*

Daniel verbatim chat birou → acasă 2026-05-14 LOCK 8 + LOCK 9 initiation 2 safety conditions catalysator:
> *"Bun mai e ceva. Punem simplu si urmatoarele conditii"* (initiation 2 safety conditions LOCK V1 — LOCK 8 Kcal Floor 1200 + LOCK 9 Aggressive Loading Warning)

Daniel-ism cross-cluster cooperative simple direct verbatim 2026-05-14:
> *"Punem simplu si urmatoarele conditii"* (Daniel-stil "tu propui, eu bifez" pattern reaffirm — Daniel directive simple ultra-clear, Co-CTO autonomous propose implementation tactical)

## Bugatti framing notes

### Quality > Speed (Simple solution scientific anchored)
Implementation simple Bugatti pur — informativ NU block, scientific anchored citable instituție (WHO/ESPEN/INS România) + filter engine-side existing infrastructure (Engine #3 Bayesian Nutrition ADR 022 + Engine #2 Goal Adaptation ADR 024). Anti-acoperiș-pereți filter validates simple solution NU complex medical knowledge layer.

### Anti-acoperiș-pereți
LOCK 8 implementation pre-Beta core scope (LOCK 1 directive "totul pre-Beta") — wording informativ scientific anchored simple Bugatti pur. Cross-link Engine #3 Bayesian Nutrition existing infrastructure NU engine separat — filter logic engine-side via existing pipeline §42.10 ADR 026.

### Anti-RE considerations
NU blocăm log (user autonomy preserved invariant) + log persists CDL append-only (transparency) = anti-RE protection categorical preserved. Pattern: informativ + filter engine learning, NU restrict user autonomy. Cross-link Anti-RE rule LOCKED V1 PERMANENT scope universal preserved invariant cross-cluster (Pain + Equipment + Rating notes ALL DROP free-text auto-inference precedent).

### Anti-paternalism
Distincția critică paradigm Andura: app informează scientific anchored + filter engine learning **vs** app NU restricționează log autonomy. User face ce vrea (poate logga sub 1200 kcal/zi liber), Andura informează + exclude din engine learning preconizări viitoare. Anti-paternalism ABSOLUTE strategy preserved cross-link Medical Safety Disclaimer paradigm (LOCK 4) + ADR 013 §Force-typing ELIMINATED PERMANENT 2026-04-30 amendment invariant.

### Voice tone notes — Bugatti craft framing
Wording strict scientific anchored *"Minimul recomandat de [instituție]..."* citation evidence-based + informativ NU prescriptive + Romanian-first + Gigel-friendly default cross-link [[gigel-test]] paradigm Marius la sala accesibil. F2 Sufletul Andura "AI-ul informează NU impune" invariant preserved.

## Cross-refs raw layer

- [[../../03-decisions/022-bayesian-nutrition-inference]] §42.10 pipeline Engine #3 — integration Kcal Floor 1200 filter logic engine-side (Kalman filter input excluded sub 1200 pentru kcal_target inference)
- [[../../03-decisions/024-goal-driven-program-templates]] Engine #2 Goal Adaptation §42.10 2nd — projection convergence filter logic (under-1200 logs not used pentru goal adaptation)
- [[../../03-decisions/026-offline-coaching-tree]] §9.3 Engine #2 Goal Adaptation pipeline §42.10 + §9.6 Engine #3 Bayesian Nutrition pipeline §42.10 — engine infrastructure existing preserved invariant cross-link
- [[../../03-decisions/011-coach-decision-log-architecture]] CDL append-only persistent — log persists transparency NU blocăm autonomy user
- [[../../01-vision/SUFLET_ANDURA]] §1.1 F2 "AI-ul informează, NU impune" — invariant preserved cross-13 LOCKs anti-paternalism ABSOLUTE catalysator chat-current 2026-05-14
- [[../../📤_outbox/_archive/2026-05/490_HANDOVER_2026-05-14_pre_beta_full_scope_safety_locks_CONSUMED]] handover source archived chat-current LOCK V1 directive
