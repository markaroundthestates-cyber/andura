---
title: Engine Weakness Detector — Brzycki 1RM Relative Lagging Detection Per Muscle Group
type: entity-engine
status: landed
last_updated: 2026-05-12
cross_refs:
  - "[[../adrs/adr-029-engine-specialization]]"
  - "[[../adrs/adr-026-offline-coaching-tree]]"
  - "[[../adrs/adr-017-demographic-prior-database]]"
  - "[[../../../src/engine/weaknessDetector.js]]"
---

# Engine Weakness Detector — Brzycki 1RM Per Muscle Group Lagging

## Synthesis

**Weakness Detector engine** = calculează 1RM estimat per grupă musculară (formula Brzycki `1RM = weight × (36 / (37 - reps))` valid reps 1-10) + identifică grupele cu 1RM relativ cel mai scăzut față de restul. Implementation `src/engine/weaknessDetector.js` — pure function detection. **Wires existing orfan §36.84 Gap #1 reuse** per ADR 029 Engine Specialization §11=B PARALLEL modifier (NU REPLACE Engine #1 Periodization skeleton preserved).

**Mapping muscle heads → grupe:** chest (chest_*) / shoulders (delt_*) / triceps (tri_*) / biceps (bi_*) / back (lat/trap/rear_delt) / legs (quad/hamstring/glute/calf) / core (lower_back/core). `getLastLogPerExercise` extract ultima intrare per exercițiu din logs cu fallback fields (`ex|exercise`, `w|weight`, `reps`).

Cross-engine integration: **Engine Specialization** (ADR 029) consume Weakness Detector output ca input pentru activation gating 4-gate strict (Marius Advanced AND lagging Q12 §45.3 LOCKED + tier T1+ + phase Bulk/Recomp + injury auto-disable). **Pattern reuse anti-duplication §36.84 Gap #1** — zero new code engine logic detection în Specialization Engine implementation. Action layer (PARALLEL volume + frequency modifier) wired via Coach Director orchestrator sibling.

## Verbatim quotes Daniel

Daniel verbatim §36.84 Gap #1 weaknessDetector orfan reuse Specialization rationale:
> *"weaknessDetector.js orfan — reuse Specialization Engine #7 PARALLEL modifier. Zero new code engine logic detection — pure session builder action layer reuse. Anti-duplication pattern."*

Daniel verbatim ADR 029 Q1=C Hybrid 1RM ratio<0.8 + visual/photo subjective override:
> *"Hybrid 1RM ratio<0.8 + visual/photo subjective override Q1=C. Engine detect quantitative BUT user override qualitative (mirror selfie weakness self-perception)."*

## Bugatti framing notes

**Gigel test relevance:** Weakness Detector internal engine signal — surface UI = "Bloc focus [Grupă]" Q17=C RO terminology propose modal cu accept/reject (NU auto-activate silent per ADR 029 Q15=B). User-facing wording vernacular concise.

**Quality > Speed via Brzycki formula:** Battle-tested formula reps 1-10 valid (return null reps > 12 anti-error-extrapolation). Pattern: engine = pure function deterministic, NU heuristic guessing.

**Anti-RE considerations:** Wires existing orfan §36.84 Gap #1 = anti-duplication anti-recurrence. Pattern preserved: detect orfan via vault hygiene + reuse în new engine action layer (NU re-implement detection logic).

**Anti-paternalism notes:** Q1=C Hybrid 1RM quantitative + user override subjective = anti-deterministic-tyranny. Engine signal informează, NU impune. User decision final via Specialization Engine Q15=B propose accept/reject.

**Voice tone notes:** Daniel-ism "orfan reuse" recurring pattern (vault hygiene + engine bridge metaphor). Anti-duplication craft preserved.

## Cross-refs raw layer

- [[../../../03-decisions/029-engine-specialization]] §Q1=C Hybrid + Q11=B PARALLEL + Q15=B propose anti-paternalism
- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §9.6 canonical SSOT 28 decisions Cluster A-E
- [[../../../03-decisions/017-demographic-prior-database]] persona Marius Advanced AND lagging Q12 §45.3 activation gating
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.84 Gap #1 weaknessDetector orfan reuse pattern source
- [[../../../src/engine/weaknessDetector.js]] (Brzycki 1RM + getLastLogPerExercise + _headToGroup mapping)
- [[../../../src/engine/muscleMap.js]] (EXERCISE_MUSCLES input)
- [[../../../src/engine/specialization/]] V1 LANDED Faza 2.5 batch 6 commit `4cf50ab` action layer wires Weakness Detector

🦫 **Engine Weakness Detector Brzycki 1RM per muscle group lagging. Wires orfan §36.84 Gap #1 Specialization Engine reuse pattern. Anti-duplication craft preserved.**
