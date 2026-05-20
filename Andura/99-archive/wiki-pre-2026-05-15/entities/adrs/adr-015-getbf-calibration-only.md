---
title: ADR 015 — getBF Calibration-Only Formula (Option B)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-27
authority: 03-decisions/015-getbf-calibration-only.md raw layer §Decision (eliminate Formula A Deurenberg-like + muscular correction dead code, preserve Formula B calibration from START_BF + kgLost only)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[../../concepts/bugatti-craft]]"
amendments: []
---

# ADR 015 — getBF Calibration-Only Formula

## Synthesis

ADR 015 = decision **Eliminate Formula A complet. Păstrează doar Formula B (calibration from start).** Original LOCK V1 2026-04-27. Trigger: `SYS.getBF()` în `src/engine/sys.js` conținea 2 abordări coexistente — Formula A (Deurenberg-like `bf = (1.20 × bmi) + (0.23 × AGE) - 16.2` cu muscular correction `-1.5%` triggered avg DB Shoulder Press / kg > 0.18) + Formula B (calibration from start `calculatedBF = (currentFatKg / kg) × 100` derived START_BF + kgLost cu assumption 75% fat / 25% muscle deficit). Variabila `bf` Formula A modified cu correction muscular dar **niciodată folosită în return** — `return Math.round(Math.max(5, Math.min(45, calculatedBF)) * 10) / 10` returna **doar Formula B**. Formula A dead code. Refactor pur, behavior change ZERO (Formula B already source actual return). Validated empiric Daniel (BF=17.1 identic înainte/după kg=100, START_KG=111.4, START_BF=23). Anti-Recommendation CRITICAL: **NU implementa Option C (hybrid) cu fudge factors arbitrari** (introduce behavior change fără validare empirică pe Daniel, sample size insuficient 5 CDL entries la moment decizie). Reconsideration trigger: 30+ CDL entries lifting history diversă + DEXA scan validation + user segment muscular-heavy non-Daniel. Implementation commit `e97e468` — refactor sys eliminate getBF dead code path Option B Opus spec. Tests 557/557 maintained (T3 replaced 1-for-1 invariance test guard împotriva re-introducerii lifting-history dependency).

## Verbatim quotes Daniel

Verbatim quotes Daniel: catalog pending raw-layer text limited — synthesis-only entity per voice policy §1 footnote 6 exception. ADR 015 raw 2026-04-27 = Opus focused audit (1m 30s) technical refactor decision pre daniel-isms density catalog accumulation.

Daniel articulation chat strategic universal scope dead code elimination (cross-ref [[../../concepts/bugatti-craft]]):

> *"dead code OUT. NU 2 formule competing care induc confusion audits viitoare. Cognitive load lower = un singur path BF."*

(Synthesis paraphrase Daniel approval ADR 015 Option B Opus spec acceptance.)

Daniel articulation cross-ref Anti-Recommendation hybrid Option C (chat strategic Bugatti craft preservation 2026-04-27):

> *"NU hybrid fudge factors. Sample size insuficient. Redesign pornește dintr-o bază clară Formula B, NU dintr-un hybrid cu dead code."*

(Synthesis paraphrase Daniel articulation ADR 015 Anti-Recommendation CRITICAL section.)

## Bugatti framing notes

**Quality > Speed via dead code elimination:** Refactor pur behavior-change-zero (validated empiric BF=17.1 identical pre/post). Cognitive load lower un singur path. Bugatti craft = NU 2 paths competing audits future.

**Anti-RE considerations:** Single path Formula B = transparent calibration mechanism (START_KG + START_BF + kgLost). NU 2 paths obfuscating intent. Anti-RE neutral.

**Voice tone notes:** "Sample size insuficient" + "redesign pornește dintr-o bază clară" = Daniel craft discipline articulation. NU premature optimization hybrid.

**Anti-paternalism notes:** Anti-Recommendation explicit (CRITICAL section) = transparent disclosure NU paternalism. User (Daniel + future maintainers) informed risk hybrid path explicit.

**Gigel test relevance:** BF calculation = engine-internal (NU user-facing surface). User vede integer BF% rezultat. Internal simplification cognitive load engineering side.

## Cross-refs raw layer

- [[../../../03-decisions/015-getbf-calibration-only]] §Decision (Formula B only) + §Anti-Recommendation CRITICAL (NU hybrid Option C) + §Implementation commit e97e468
- [[../../../03-decisions/DECISION_LOG]] §2026-04-27 entry getBF refactor
- [[../../../05-findings-tracker/FINDINGS_MASTER]] (GETBF_DEAD_CODE_FINDING_2026-04-27 closed)
- [[../../../src/engine/sys.js]] §getBF (post-refactor Formula B only — current code)
- [[../../../src/engine/__tests__/sys.test.js]] §Test 3 invariance guard (post-refactor)

🦫 **ADR 015 getBF Calibration-Only Formula LOCK V1 2026-04-27 Opus focused audit. Dead code Formula A eliminated, Formula B preserved single path. Anti-Recommendation CRITICAL NU hybrid Option C fudge factors. Behavior change zero validated empiric Daniel BF=17.1 pre/post.**
