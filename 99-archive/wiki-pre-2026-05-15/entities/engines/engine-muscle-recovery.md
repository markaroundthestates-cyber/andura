---
title: Engine Muscle Recovery — Per-Group Recovery State + Lagging Detection Big 6
type: entity-engine
status: landed
last_updated: 2026-05-12
cross_refs:
  - "[[../adrs/adr-026-offline-coaching-tree]]"
  - "[[../adrs/adr-029-engine-specialization]]"
  - "[[../adrs/adr-032-engine-deload-protocol]]"
  - "[[../../03-decisions/DECISION_LOG]] §2026-05-11 STAGE 4 SUB-BATCH 2"
  - "[[../../../src/engine/muscleRecovery.js]]"
---

# Engine Muscle Recovery — Per-Group Recovery State + Lagging Detection

## Synthesis

**Muscle Recovery engine** = pure functions agregare per-muscle-head recovery (MUSCLE_HEADS recoveryHours) → broad groups **Big 6** (chest/back/shoulders/legs/arms/core) pentru UI consumption + **lagging detection** (muscles sub-volume 2+ săptămâni vs equal Big 6 distribution). Implementation `src/engine/muscleRecovery.js` NEW LANDED STAGE 4 SUB-BATCH 2 2026-05-11 commit `ebd656e` ~85 LOC. Zero DB/DOM deps — inputs logs array only, testable în vacuum.

**State thresholds calibrated:** FATIGUED_THRESHOLD = 35 (peak ~22.5 per primary muscle head, 2-3 hits = fatigued) / PARTIAL_THRESHOLD = 12. State enum: `recovered | partial | fatigued`. GROUP_HEAD_MAP aggregate chest_upper+mid+lower → chest, delt_front+mid+rear+rear_delt_trap → shoulders etc. GROUP_LABELS_RO Romanian-first UI (Pieptul/Spatele/Umerii/Picioarele/Brațele/Core-ul).

Cross-engine integration: **Engine Specialization** (ADR 029) consume lagging detection 4-gate strict activation (Marius Advanced + tier T1+ + Bulk/Recomp + injury auto-disable) + **Engine Deload** (ADR 032) consume fatigued state trigger micro-deload. Coach Director orchestrator (acest entity sibling) dispatch Muscle Recovery state context la engines downstream pipeline §42.10.

## Verbatim quotes Daniel

Daniel verbatim STAGE 4 SUB-BATCH 2 rationale (chat ACASĂ 2026-05-11):
> *"3 engine gap-uri pre-port: muscleRecovery.js NEW + coachDirector 3 methods + usNavyBF.js NEW. Engine spine Big 6 + lagging detection foundation per ADR 029 Specialization 4-gate strict."*

Daniel verbatim Specialization Engine PARALLEL modifier rationale §36.84 Gap #1:
> *"weaknessDetector.js orfan reuse Specialization. Zero new code engine logic detection — pure session builder action layer reuse."*

## Bugatti framing notes

**Gigel test relevance:** Recovery state surface UI minimal — 6 grupe Big 6 status `recovered | partial | fatigued` cu emoji discrete. Anti-jargon (NU "muscle fiber recovery kinetics"). Romanian-first label.

**Quality > Speed via pure functions:** Zero DB/DOM deps + testable în vacuum + 11 tests preserved. Pattern: engine = pure function, dispatch via Coach Director.

**Anti-RE considerations:** State thresholds calibrated against typical session contribution (FATIGUED 35 / PARTIAL 12). NU magic-number arbitrary — anchored la peak hit (~22.5 primary muscle). Post-Beta reconsider dacă user-base demands granularity.

**Anti-paternalism notes:** Lagging detection = signal pentru Specialization Engine OPT-IN propose (NU auto-activate silent per ADR 029 Q15=B). User decides bloc focus. Engine info-only.

**Voice tone notes:** Daniel-ism "engine spine Big 6" recurring pattern (foundational metaphor). GROUP_LABELS_RO preserved Romanian vernacular.

## Cross-refs raw layer

- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §9.X engine specs pipeline §42.10
- [[../../../03-decisions/029-engine-specialization]] §9.6 PARALLEL modifier 4-gate strict (Muscle Recovery lagging input)
- [[../../../03-decisions/032-engine-deload-protocol]] fatigued state trigger micro-deload cross-engine
- [[../../../03-decisions/DECISION_LOG]] §2026-05-11 STAGE 4 SUB-BATCH 2 muscleRecovery.js NEW LANDED commit `ebd656e`
- [[../../../src/engine/muscleRecovery.js]] (pure functions GROUP_HEAD_MAP + state thresholds + lagging detection)
- [[../../../src/engine/muscleMap.js]] (EXERCISE_MUSCLES + MUSCLE_HEADS + getMuscleState input)
- [[../../../src/engine/__tests__/muscleRecovery.test.js]] (11 tests Vitest LANDED zero regression)

🦫 **Engine Muscle Recovery per-group recovery state Big 6 + lagging detection. Pure functions zero DB/DOM. State thresholds calibrated peak hit ~22.5. Cross-engine Specialization (ADR 029) + Deload (ADR 032) integration.**
