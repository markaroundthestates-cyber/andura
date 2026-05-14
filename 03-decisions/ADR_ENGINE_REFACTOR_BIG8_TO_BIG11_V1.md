---
title: ADR ENGINE_REFACTOR BIG 8 → BIG 11 V1 — Coach Engines cluster refactor post anatomical taxonomy LOCK
status: locked-v1
locked_date: 2026-05-14
authority: Daniel CEO directive verbatim 2026-05-14 chat birou→acasă "asap cu ordine clara" + Co-CTO autonomous tactical scope per project instructions §F3.12 (engine routing INTERNAL NU UX user-facing per Daniel verbatim 2026-05-13j Gigel-test correction)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
scope_change_estimate: ~50-80 NEW tests cumulative + ~8 engines impacted + ~600-900 LOC ADR draft + C4.1-C4.8 sequential implementation phases downstream (separate prompts per phase)
cross_refs:
  - "[[ADR_ANATOMICAL_CLASSIFICATION_V1]]"
  - "[[ADR_SESSION_SEQUENCE_ORDERING_V1]]"
  - "[[026-offline-coaching-decision-tree-exhaustive]]"
  - "[[029-engine-specialization]]"
  - "[[032-engine-deload-protocol]]"
amendments: []
---

# ADR ENGINE_REFACTOR BIG 8 → BIG 11 V1 — Coach Engines cluster refactor post anatomical taxonomy LOCK

## §1 Context

**Pre-2026-05-13k state engines pipeline §42.10:** Andura engine cluster 8 engines orchestrated per ADR-026 §9 (Periodization → Goal Adaptation → Energy Adjustment → Bayesian Nutrition → Tempo Form Cues → Specialization → Warm-up Mobility → Deload Protocol). Coach Director orchestrator `buildSession()` dispatch engines secvențial pure-function discipline preserved invariant per ADR-026 §9 + §42.10. **Engine taxonomy current = Big 6** (chest/back/shoulders/legs/arms/core) per `src/engine/muscleRecovery.js:12 GROUP_HEAD_MAP` LANDED Bundle V1 baseline.

**Catalysator chat-current 2026-05-13k:** Daniel cooperative push-back productive *"De ce defer pe fese/core?"* recovery instant Co-CTO autonomous decision LOCK V1 ADR_ANATOMICAL_CLASSIFICATION_V1 §2 — 11 categorii canonical taxonomy expansion (`piept` / `spate` / `umeri` / `biceps` / `triceps` / `antebrate` NEW / `core` NEW / `picioare-quads` / `picioare-hamstrings` / `fese` NEW / `gambe`).

**Catalysator Pre-Beta scope 2026-05-14 chat birou→acasă:** Daniel CEO directive verbatim *"asap cu ordine clara"* — C4 Engine Refactor Big 8 → Big 11 mandatory pentru Big 8 engines depend de canonical V1 taxonomy. **REFRAMED Co-CTO autonomous tactical scope per project instructions §F3.12** (engine routing INTERNAL NU UX user-facing per Daniel verbatim 2026-05-13j *"sunt invizibile pt utilizator... doar andura le stie"*). Toate 5 decision points (ordine migration + decay rate + cluster definitions + PARALLEL scope + secondary tags consume) = engine routing internal autonomous Co-CTO research-backed.

**Daniel verbatim chat 2026-05-13j Gigel-test correction:** *"sunt invizibile pt utilizator. doar andura le stie. nu vrem complexity user-facing."* — engine taxonomy canonical V1 = INTERNAL routing semantic NU UX category navigation. User vede grupare default UX simple ("Brate", "Picioare", "Spate" etc.) — engine internal routes Big 11 granular per anatomical fiber dominance.

**Daniel verbatim cross-chat 2026-05-13k:** *"make it happen ca e core function... si sa nu fie cto decision side"* — confirmare scope tactical CTO autonomous (NU CEO strategic) decision authority pentru engine refactor cluster.

**Pre-Beta progress impact:** Bundle 6.0.5 Arms LANDED 2026-05-14 cumulative 567 entries (+107 NEW Phase A-G post Bundle 6.0.4 cluster 165 NEW). Schema layer Big 11 canonical V1 fully populated post Bundle 6.0.5 Phase G antebrate FIRST POPULATION. Engine layer still Big 6 = mismatch routing semantic — C4.1-C4.8 refactor cap-coadă unblocks Big 11 routing accuracy.

## §2 Decision LOCK V1

**8 engines impacted cluster refactor cap-coadă ordine implementation roadmap (Co-CTO autonomous tactical):**

```
Phase | Engine                                    | Path                                  | Dependency on  | LOC delta estimate
------|-------------------------------------------|---------------------------------------|----------------|-------------------
C4.1  | Muscle Recovery                          | src/engine/muscleRecovery.js          | (foundational) | +60-80 LOC
C4.2  | Weakness Detector                        | src/engine/weaknessDetector.js        | (foundational) | +40-60 LOC
C4.3  | Periodization                            | src/engine/periodization/             | C4.1           | +50-70 LOC
C4.4  | Specialization                           | src/engine/specialization/            | C4.2 + C4.3    | +60-80 LOC
C4.5  | Coach Director                           | src/engine/coachDirector.js           | C4.1-C4.4      | +30-50 LOC
C4.6  | Cascade Defense (composite-signal)       | src/engine/composite-signal/          | (orthogonal)   | +20-30 LOC
C4.7  | Vitality Layer (suflet-andura tier-prog) | src/engine/suflet-andura/             | (orthogonal)   | +20-30 LOC
C4.8  | Bayesian Nutrition                       | src/engine/bayesianNutrition/         | (orthogonal)   | +10-20 LOC TBD
```

**GitNexus impact verify inline (fallback grep evidence — GitNexus MCP not loaded session):**
- `src/engine/muscleRecovery.js:12 GROUP_HEAD_MAP` Big 6 chest/back/shoulders/legs/arms/core — **REFACTOR PRIMARY TARGET C4.1**
- `src/engine/muscleRecovery.js:21 GROUP_LABELS_RO` Big 6 RO labels — expand Big 11 RO labels
- `src/engine/weaknessDetector.js:20-21,59-60` biceps/triceps inference regex — expand antebrate inference + fese inference
- `src/engine/coachDirector.js` orchestrator pipeline §42.10 dispatch — wire Big 11 routing post C4.1-4.4 LANDED
- `src/engine/periodization/` folder — phase template Big 6 split → Hybrid Big 6 cluster + Big 11 weight (Decision §3.3)
- `src/engine/specialization/` folder — PARALLEL modifier Big 6 → 8 of 11 candidates (Decision §3.4)
- `src/engine/composite-signal/` folder — Cascade Defense orthogonal anatomical agnostic minimal mapping update
- `src/engine/suflet-andura/` folder — Vitality Layer orthogonal anatomical agnostic minimal mapping update
- `src/engine/bayesianNutrition/` folder — TBD candidate verify ADR-022 if anatomical refs present

## §3 Rationale per decision point

### §3.1 Ordine migration dependency graph cap-coadă

**Constraints analysis Sequential Thinking inline:**

- **Muscle Recovery = foundational state per-group** (decay 24-72h differential per cluster). Other engines downstream consume recovery state for routing decisions — **blocking dependency**.
- **Weakness Detector = orthogonal foundational** (Brzycki 1RM per Big 11 group lagging detection). Depends on session log history NU on engine state — can refactor parallel to C4.1 BUT logical to land foundational engines together.
- **Periodization = depends on Muscle Recovery state** for phase calibration (recovery-aware phase weight redistribution).
- **Specialization = depends on Weakness Detector + Periodization** output (PARALLEL modifier on lagging group identified by Weakness Detector + phase context from Periodization).
- **Coach Director = orchestrator** consume all engines downstream pipeline §42.10 — **last cluster phase**.
- **Cascade Defense = orthogonal signal arbitration** anatomical agnostic per spec ADR-026 — minimal touch.
- **Vitality Layer = orthogonal behavioral proxy** anatomical agnostic — minimal touch.
- **Bayesian Nutrition = TBD candidate** — verify ADR-022 if anatomical refs present.

**Recommended LOCK V1 ordine cap-coadă:**
1. **C4.1 Muscle Recovery** — foundational state, blocks downstream
2. **C4.2 Weakness Detector** — orthogonal foundational, parallel-safe with C4.1 but bundled together
3. **C4.3 Periodization** — depends C4.1
4. **C4.4 Specialization** — depends C4.2 + C4.3
5. **C4.5 Coach Director** — orchestrator wire all
6. **C4.6 Cascade Defense** — minimal orthogonal touch
7. **C4.7 Vitality Layer** — minimal orthogonal touch
8. **C4.8 Bayesian Nutrition** — TBD candidate verify

### §3.2 Decay rate Big 11 differential per cluster (research-backed)

**Research reference (NU invent — generic published patterns hypertrophy training literature):**
- Muscle protein synthesis (MPS) elevated 24-48h post-training (Schoenfeld et al. 2016 meta-analysis)
- Small muscle groups (forearms, calves, biceps isolated) recover faster (~12-24h Helms et al. 2018 Renaissance Periodization MEV/MAV/MRV framework)
- Large compound (quads, hams, spate) recover slower (~48-72h DOMS + neural fatigue Schoenfeld 2017)

**Recommended decay rates Big 11 LOCK V1 (differential per cluster):**

| Big 11 cluster      | Decay hours | Rationale                                                     |
|---------------------|-------------|---------------------------------------------------------------|
| `piept`             | 48h         | Medium-large compound (bench primary) + accessory access      |
| `spate`             | 60h         | Largest cluster unified V1 (lats + traps + posterior chain)   |
| `umeri`             | 36h         | Medium-large + frequent volume tolerance                      |
| `biceps`            | 24h         | Small isolation primary, high frequency tolerance             |
| `triceps`           | 24h         | Small isolation primary, high frequency tolerance             |
| `antebrate`         | 12h         | Smallest grip + small muscle highest frequency tolerance     |
| `core`              | 24h         | Mixed isolation + stabilizer endurance high frequency         |
| `picioare-quads`    | 60h         | Largest single-cluster compound + high CNS load               |
| `picioare-hamstrings` | 60h       | Large compound + DOMS prevalent + RDL CNS load                |
| `fese`              | 48h         | Medium-large + high force compound (Hip Thrust + Bret school) |
| `gambe`             | 24h         | Small isolation high frequency tolerance                      |

**Implementation:** Central constant DECAY_RATE_HOURS_BIG11 export from new file `src/engine/muscleRecoveryConstants.js` consumed by `getRecoveryByGroup()` + `daysSinceGroup()`. Pure-function discipline ADR-026 §9 invariant preserved.

### §3.3 Periodization phase cluster definition Hybrid (Big 6 split + Big 11 weight)

**Options considered Sequential Thinking inline:**
- **A — Classic Big 6 split:** push (piept+umeri+triceps) / pull (spate+biceps+antebrate) / legs (picioare-quads+hams+fese+gambe+core) — Big 6 paradigma cu Big 11 internal weight per group. Backwards compatible templates existing.
- **B — Granular Big 11 phase:** Phase cycle per individual canonical category (overkill — 11-cycle phase weekly impossible scheduling).
- **C — Hybrid (RECOMMENDED):** Big 6 cluster phase definition (push/pull/legs/upper/lower/full) + Big 11 weight allocation per session within cluster — engine routes individual category recovery state but periodization phase = cluster-level.

**LOCK V1 Decision: Option C Hybrid.** Phase definition cluster Big 6 standard backwards compatible mockup-prescribed session templates + Big 11 granularity engine internal recovery state consume.

**Implementation:** Phase template field `cluster: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full'` (Big 6 cluster) + `weight_distribution: { [big11_group]: percentage }` (Big 11 weight per session within cluster).

### §3.4 Specialization PARALLEL modifier scope Big N

**Per ADR-029 Engine Specialization §3 PARALLEL modifier:** lagging detection → suggest specialization phase 4-week additional volume bumped on lagging group. Big 6 candidates legacy. Big 11 expand scope analysis:

**Realistic candidates Big 11 specialization week-bumped (8 of 11):** `piept`, `spate`, `umeri`, `biceps`, `triceps`, `antebrate` (NEW V1), `core` (NEW V1 reserved), `fese` (NEW V1).

**NOT realistic Big 11 specialization candidates (3 excluded):**
- `picioare-quads` — compound shared session conflict (squat + RDL + leg press shared CNS load — bump conflicts hams session same day)
- `picioare-hamstrings` — same reason (RDL + Romanian Deadlift + leg curl shared CNS load with quads)
- `gambe` — already high frequency tolerance, no specialization phase needed isolated (4-week bump trivial impact)

**LOCK V1 Decision: Big 11 specialization scope = 8 of 11 candidates.** UX exposure preserved Big 6 paradigm Specialization template (piept/spate/umeri/brate/picioare) — Big 11 internal granular weight redistribution per session within cluster bumped per Daniel verbatim 2026-05-13j Gigel-test correction.

### §3.5 Secondary tags consume policy primary-only vs weighted differential per engine

**Constraints analysis per engine consume rules:**

| Engine               | Consume policy             | Rationale                                                                |
|----------------------|----------------------------|--------------------------------------------------------------------------|
| Muscle Recovery      | **primary-only**           | Anatomical fiber primary stress drives MPS — secondary co-engage minor   |
| Periodization        | **primary-only**           | Cluster phase cycle per primary group                                    |
| Weakness Detector    | **primary-only**           | Brzycki 1RM per primary force foundation                                 |
| Specialization       | **primary + weighted sec** | Bundle 6.0.4.2 collision 4 entries spate-primary + hams-secondary anatomically defensible posterior chain dual-cluster — specialization phase should bump weighted by secondary tag ≥30% co-engage |
| Cascade Defense      | N/A (anatomical agnostic)  | Orthogonal signal arbitration                                            |
| Vitality Layer       | N/A (anatomical agnostic)  | Orthogonal behavioral proxy                                              |
| Coach Director       | **aggregate primary + weighted secondary** | Per engine consume rules dispatch                       |
| Bayesian Nutrition   | TBD                        | Verify ADR-022 if anatomical refs present                                |

**LOCK V1 Decision policy differential per engine** (NU universal rule).

**Secondary tag weight default = 0.3** (30% co-engage threshold) for engines consuming weighted secondary (Specialization + Coach Director). Justified per Schoenfeld 2017 — secondary co-engage typically 20-40% MPS contribution vs primary stress.

## §4 Implementation Roadmap C4.1 → C4.8 phases sequential

**Per ADR-026 §9 pure-function paradigm invariant preserved across all phases.** ZERO mutation engine algorithm semantics — refactor scope = taxonomy expansion Big 6 → Big 11 + decay rate constants + secondary consume policy per Decision §3.5.

### §4.1 Phase C4.1 — Muscle Recovery refactor

**Acceptance criteria:**
- `src/engine/muscleRecovery.js` GROUP_HEAD_MAP Big 6 → Big 11 (chest → piept; back → spate; shoulders → umeri; legs → picioare-quads + picioare-hamstrings + fese + gambe; arms → biceps + triceps + antebrate; core → core)
- GROUP_LABELS_RO expand Big 11 RO labels (piept "Pieptul", spate "Spatele", umeri "Umerii", biceps "Bicepsul", triceps "Tricepsul", antebrate "Antebratele", core "Core-ul", picioare-quads "Quadricepsul", picioare-hamstrings "Hamstringii", fese "Fesele", gambe "Gambele")
- DECAY_RATE_HOURS_BIG11 constant new file consume per Decision §3.2
- ZERO mutation algorithm semantics (FATIGUED_THRESHOLD + PARTIAL_THRESHOLD + getRecoveryByGroup() + daysSinceGroup() pure-function preserved)
- Tests +15-20 NEW Big 11 group recovery state assertions

### §4.2 Phase C4.2 — Weakness Detector refactor

**Acceptance criteria:**
- `src/engine/weaknessDetector.js` muscle inference regex expand: biceps/triceps preserved, NEW antebrate inference (`/wrist|forearm|grip|farmer/i`) + NEW fese inference (`/hip thrust|glute|sumo|bulgarian/i`)
- Brzycki 1RM lagging detection per Big 11 group (NU Big 6)
- ZERO mutation Brzycki algorithm semantics
- Tests +10-15 NEW Big 11 inference assertions

### §4.3 Phase C4.3 — Periodization refactor

**Acceptance criteria:**
- `src/engine/periodization/` phase template field `cluster` Big 6 + `weight_distribution` Big 11 per Decision §3.3
- Phase calibration consume Muscle Recovery state Big 11 (post-C4.1)
- ZERO mutation phase cycle algorithm semantics
- Tests +10-15 NEW Hybrid template assertions

### §4.4 Phase C4.4 — Specialization refactor

**Acceptance criteria:**
- `src/engine/specialization/` PARALLEL modifier candidates 8 of 11 per Decision §3.4
- Weighted secondary consume policy 0.3 weight per Decision §3.5 (Bundle 6.0.4.2 RDL/Good Morning posterior chain dual-cluster bump compatible)
- ZERO mutation 4-week phase cycle semantics
- Tests +10-15 NEW Big 11 specialization scope assertions

### §4.5 Phase C4.5 — Coach Director refactor

**Acceptance criteria:**
- `src/engine/coachDirector.js` orchestrator wire all refactored engines C4.1-4.4
- Aggregate primary + weighted secondary consume per Decision §3.5
- ZERO mutation pipeline §42.10 dispatch semantics
- Tests +5-10 NEW orchestrator integration assertions

### §4.6 Phase C4.6 — Cascade Defense (composite-signal) minimal touch

**Acceptance criteria:**
- `src/engine/composite-signal/` anatomical agnostic preserved — minimal mapping update for Big 11 references downstream (if any)
- Tests +0-5 NEW (mostly preservation invariant)

### §4.7 Phase C4.7 — Vitality Layer (suflet-andura tier-progression) minimal touch

**Acceptance criteria:**
- `src/engine/suflet-andura/` anatomical agnostic preserved — same minimal mapping update
- Tests +0-5 NEW

### §4.8 Phase C4.8 — Bayesian Nutrition TBD candidate

**Acceptance criteria:**
- Verify ADR-022 + `src/engine/bayesianNutrition/` if anatomical refs present
- If yes → Big 11 mapping update; if no → SKIP this phase
- Tests +0-10 NEW

## §5 Test Strategy migration estimate ~50-80 NEW tests

**Per phase test additions estimates:**
- C4.1 Muscle Recovery: +15-20 NEW (GROUP_LABELS_RO Big 11 expansion + decay rate per-group + canonical Big 11 invariant)
- C4.2 Weakness Detector: +10-15 NEW (Big 11 inference regex + Brzycki per Big 11)
- C4.3 Periodization: +10-15 NEW (Hybrid template + Big 11 weight distribution)
- C4.4 Specialization: +10-15 NEW (8 of 11 scope + weighted secondary 0.3 consume)
- C4.5 Coach Director: +5-10 NEW (orchestrator integration aggregated consume)
- C4.6-C4.8: +0-15 NEW (mostly preservation + minimal touch)

**Total estimated:** ~50-80 NEW tests cumulative across C4.1-C4.8 phases. Vitest baseline preserved EXACT 3286 → ~3336-3366 PASS post all phases LANDED.

## §6 Schema field additions (NEW V1 if any)

**NU additive to EXERCISE_METADATA schema:**
- `session_sequence_priority` per ADR_SESSION_SEQUENCE_v1 §2.6 = RUNTIME-assigned by Coach Director Engine (NU static schema field) — populated post-engines dispatch în output array per session

**ADDITIVE to engine constants (NEW central files):**
- `src/engine/muscleRecoveryConstants.js` NEW file — DECAY_RATE_HOURS_BIG11 constant per Decision §3.2 (+ exports for unit tests)
- `src/engine/anatomicalConstants.js` NEW file — BIG11_CANONICAL array + GROUP_LABELS_RO_BIG11 + cluster mappings (push/pull/legs Big 6 → Big 11 weight) per Decision §3.3

**ZERO mutation existing 567 EXERCISE_METADATA entries** — schema layer Big 11 canonical V1 fully populated post Bundle 6.0.5 Phase G (HARD CONSTRAINT §F3.12 strict).

## §7 Backwards compatibility entries existing 567 + Bundle 6.0.5 Phase A-G

**Schema layer post Bundle 6.0.5 Phase A-G LANDED 2026-05-14:**
- 567 entries cumulative (460 baseline + 107 NEW Phase A-G)
- All entries have `muscle_target_primary` canonical Big 11 V1 per ADR_ANATOMICAL §2 LOCK V1
- Antebrate canonical V1 baseline established 0 → 26 entries primary post Phase G

**Engine layer post-refactor C4.1-C4.8:**
- Engines consume canonical Big 11 directly (NU Big 6 mapping intermediate) — eliminates routing approximation
- Backwards compatible: engines still output Big 6 cluster labels for UX (push/pull/legs templates) per Decision §3.3 Hybrid

## §8 Edge cases compound multi-muscle weighted secondary

**Bundle 6.0.4.2 RDL/Good Morning posterior chain dual-cluster (LANDED Bundle 6.0.4.2 Phase I 2026-05-13j):**
- 4 entries `spate` primary + `picioare-hamstrings` secondary anatomically defensible posterior chain dual-cluster
- Specialization phase phase-Hams should bump weighted secondary ≥30% co-engage (per Decision §3.5 weight 0.3 default)

**Bundle 6.0.5 Phase G Carries (Farmer's Walk + Suitcase) anatomical dual-cluster:**
- 4 entries `antebrate` primary + `spate` secondary trap stabilizer engage
- Specialization phase phase-Spate should bump weighted secondary 0.3 weight

**Bundle 6.0.5 Phase B/C Hammer + Cross-Body + Zottman + Pinwheel + Reverse Curl variants:**
- DB Hammer Curl Standing/Seated + DB Cross-Body Hammer + DB Zottman Curl + Cable Hammer Curl Rope + Cable Curl Standing Rope = `biceps` primary + `antebrate` secondary
- Reverse Curl Barbell/EZ-bar/Cable/DB + Pinwheel Curl DB = `antebrate` primary + `biceps` secondary
- Specialization phase phase-Antebrate should bump weighted secondary biceps 0.3 weight

## §9 Anti-recurrence considerations

**ZERO scope creep:**
- Engine refactor NU touches user-facing UX (schema field INTERNAL routing NU UX surface per Daniel verbatim 2026-05-13j Gigel-test correction)
- ZERO add NEW features (refactor scope only — taxonomy expansion + decay rate constants + secondary consume policy)
- ZERO mutation engine pure-function paradigm ADR-026 §9 invariant preserved across all phases

**ZERO --no-verify bypass:**
- Each phase atomic single-concern commit Bugatti craft
- Pre-commit hook expected pass each phase (vitest 3286 → +N preserved EXACT)

**ZERO mutation existing schema entries:**
- HARD CONSTRAINT §F3.12 strict — refactor scope = engine layer only
- Schema layer post Bundle 6.0.5 567 entries preserved invariant cross-C4 phases

**Backup tag pre-execute MANDATORY each phase:**
- `pre-c4-<phase>-<YYYY-MM-DD>` pushed origin per VAULT_RULES §CC.7 rollback safety net

**Discrete-blocks discipline §AR.22 cumulative validation 9th+ effective per Bundle 6.0.5 Phase A-G atomic single-concern commits LANDED — preserve invariant across C4.1-C4.8 phases**

## §10 Cross-refs raw layer (lineage mandatory)

- [[ADR_ANATOMICAL_CLASSIFICATION_V1]] §2 LOCK V1 (11 categorii canonical)
- [[ADR_ANATOMICAL_CLASSIFICATION_V1]] §3.4 Edge cases (Chin-up = spate primary + biceps secondary)
- [[ADR_ANATOMICAL_CLASSIFICATION_V1]] §3.6 antebrate canonical V1 NEW (Bret Contreras + Mike Israetel reference)
- [[ADR_SESSION_SEQUENCE_ORDERING_V1]] §2.6 session_sequence_priority RUNTIME-assigned NU schema static
- [[ADR_SESSION_SEQUENCE_ORDERING_V1]] §3.5 Specialization PARALLEL bump weighted secondary
- [[ADR_SESSION_SEQUENCE_ORDERING_V1]] §5.1-§5.7 Engine impact mapping per engine (Coach Director + Goal Adaptation + Periodization + Specialization + Warmup + Deload + Energy)
- [[026-offline-coaching-decision-tree-exhaustive]] §9 pipeline §42.10 8 engines orchestrator dispatch pure-function paradigm invariant
- [[029-engine-specialization]] §3 PARALLEL modifier 4-week phase cycle lagging bump
- [[032-engine-deload-protocol]] §X engine override session sequence ordering
- [[022-bayesian-nutrition-inference]] §X TBD anatomical refs verification scope C4.8
- `src/engine/muscleRecovery.js:12 GROUP_HEAD_MAP` Big 6 baseline (REFACTOR PRIMARY TARGET C4.1)
- `src/engine/muscleRecovery.js:21 GROUP_LABELS_RO` Big 6 RO labels (expand Big 11 RO labels)
- `src/engine/weaknessDetector.js:20-21,59-60` biceps/triceps inference regex (expand antebrate + fese inference C4.2)
- `src/engine/coachDirector.js` orchestrator pipeline §42.10 dispatch (wire C4.5 post C4.1-4.4)
- `src/schema/exerciseMetadata.js` 567 entries cumulative Bundle 6.0.5 Phase A-G LANDED 2026-05-14 canonical Big 11 V1 fully populated
- Daniel verbatim chat 2026-05-14 birou→acasă: *"asap cu ordine clara"* (CEO directive C4 ordering authority)
- Daniel verbatim cross-chat 2026-05-13k: *"make it happen ca e core function... si sa nu fie cto decision side"* (scope tactical CTO autonomous authority)
- Daniel verbatim chat 2026-05-13j Gigel-test correction: *"sunt invizibile pt utilizator. doar andura le stie. nu vrem complexity user-facing."* (engine routing INTERNAL NU UX surface authority)

---

🦫 **Bugatti craft. ADR ENGINE_REFACTOR_BIG8_TO_BIG11_V1 LOCK V1 spec draft 2026-05-14 doc-only. ZERO src/ touched (HARD CONSTRAINTS §F3.12 strict). C4.1-C4.8 implementation roadmap sequential cap-coadă defers separate prompts downstream per phase atomic single-concern Bugatti.**
