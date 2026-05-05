# SCENARIOS SIMULATOR DESIGN V1

**Status:** SPEC DRAFT V1 — pending Daniel LOCK pre CC implementation
**Authority:** architecture spec for simulator pipeline + judgment hybrid
**Path target:** `04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1.md`

---

## §1 PURPOSE

Scaling Claude reasoning offline to 1500-N branches via:
1. Engines pipeline pure deterministic compute per branch (~85-90% mecanic)
2. Flag flagged issues for Claude reasoning fill (~10-15%)
3. Surface strategic edge cases pentru Daniel product policy lock (~3-5%)

**NU testing infrastructure.** Validation framework (Artefact 1) măsoară correctness — simulator e content production engine.

---

## §2 ARCHITECTURE OVERVIEW

### §2.1 Pure functions per engine

Each engine = pure function `(ConstraintObject, EngineState) → EngineOutput`:
- NU shared state, NU side effects
- Deterministic input → output
- TypeScript readonly types pentru ConstraintObject propagation
- Async-capable per ADR 018 DP-2 (Promise<DimensionResult>)

### §2.2 Pipeline order LOCKED §42.10

```
Periodization (Engine #1)
  ↓
Goal Adaptation (Engine #2)
  ↓
Energy Adjustment (Engine #5)
  ↓
Exercise Selection (alternativeEngine + weaknessDetector existing)
  ↓
Warm-up & Mobility (Engine #8)
  ↓
Execution (sets/reps/RIR matrix)
  ├─ Tempo overlay (Engine #6)
  └─ Specialization layer (Engine #7)
  ↓
Deload trigger evaluation (Engine #4) — last gate
  ↓
Final Session Blueprint
```

Each engine consumes ConstraintObject + previous engines outputs (read-only). NU mutation upstream.

### §2.3 Constraint Object schema

```typescript
type ConstraintObject = Readonly<{
  persona: { name, age, sex, kg, height, bmi, job, lifestyle };
  goal: { template, phase, mode };
  experience: 'beginner' | 'intermediate' | 'advanced';
  equipment: ReadonlyArray<string>;
  schedule: { frequency, session_duration_target };
  history: { tier: 'T0'|'T1'|'T2'|'T3', cdl_window: ReadonlyArray<CDLEntry> };
  recovery: { vitality_tier, pre_session_readiness, injury_flags };
  profile_typing: { primary, secondary, confidence };
  demographic_prior: { anchor_personas: ReadonlyArray<...> };
}>;
```

Engines read selectively — NU need access la tot. Type-narrowing per engine.

---

## §3 PRUNING RULES (3645 → 1500-2000)

### §3.1 Cross-product matrix 7-dim raw

Per ADR 026 Q2: Persona × Goal × Experience × Equipment × Schedule × History × Recovery = 3645 combinatorial.

### §3.2 Pruning rules sistematice

**Pruning A — Persona × Goal incompatibilitate biologică:**
- Maria 65 + Forță Pură (RPE 9-10) = invalid (joint risk + recovery deficit)
- >75 ani + Slăbire Majoră Cut deficit >500 kcal/zi = invalid (sarcopenia risk)
- Pregnant + orice goal Cut/BULK = Passive Mode (single branch tripwire)

**Pruning B — Equipment × Goal redundanță:**
- Apartament bodyweight + Forță Pură = invalid (intensity ceiling biomechanic)
- Sală full + Slăbire dacă user = beginner = redundant cu Tonifiere similar template

**Pruning C — Experience × Frequency biologic:**
- Beginner + 6x/săpt = invalid (recovery deficit + adherence drop predicted)
- Advanced + 2x/săpt = sub-optimal coverage MEV (Minimum Effective Volume)

**Pruning D — History × Recovery contradiction:**
- T0 + injury severe <3 luni = Passive Mode tripwire (NU engine output — medical referral)
- T3 90+ zile + Vitality LOW chronic = re-eval phase (Engine #5 → Engine #4 deload + medical flag)

**Pruning E — Goal × Phase invalid:**
- Forță & Dezvoltare + Cut deficit aggressive = sub-optimal (force loss > muscle preservation Cut conservative only)
- Longevitate + BULK aggressive = Gigel test fail (Maria 65 NU vrea +5kg muscle)

### §3.3 Output post-pruning

~1500-2000 valid branches. CC implementation enumerates explicit + maps fiecare la branch_id schema.

---

## §4 BRANCH ID SCHEMA

```
<persona-tag>-<goal-phase>-<experience>-<equipment-tag>-<freq>x-<history-tier>-<recovery-flags>

Examples:
maria65-slabire-cut-beginner-bodyweight-3x-T1-arthrosis-vitality-med
marius25-forta-bulk-advanced-salaa-5x-T3-clean
gigel45-tonifiere-recomp-intermediate-home-gantere-3x-T2-low-vitality
elena35-slabire-cut-beginner-bodyweight-3x-T0-pregnant-trip
```

Tags = lowercase kebab-case, deterministic from ConstraintObject.

---

## §5 PER-BRANCH OUTPUT SCHEMA

```json
{
  "branch_id": "maria65-slabire-cut-beginner-bodyweight-3x-T1-arthrosis-vitality-med",
  "input": { /* ConstraintObject snapshot */ },
  "engines_pipeline_output": {
    "periodization": { "linear_block_week": 2, "volume_floor": 8, "volume_ceiling": 12, "phase": "load" },
    "goal_adaptation": { "template": "Slăbire", "kcal_target_delta": -300, "macro_split": { "P": 1.6, "C": 2.0, "F": 0.8 } },
    "energy_adjustment": { "modulation_factor": 0.92, "yo_yo_stabilizer": false },
    "exercise_selection": { "exercises": [...], "substitutions_applied": [...] },
    "warm_up": { "protocol": "joint_mobility_5min", "duration_min": 5 },
    "execution": { "sets_reps_rir": [...], "rest_periods": [...], "tempo_overlay": "controlled" },
    "specialization": { "eligible": false, "reason": "Beginner T1 + arthrosis = NO specialization layer" },
    "deload": { "triggered": false, "depth": null },
    "final_session_blueprint": { /* aggregated final */ }
  },
  "invariants_check": {
    "I1_volume_under_mrv": "PASS",
    "I2_rir_above_zero": "PASS",
    "I3_frequency_under_6": "PASS",
    "I4_deload_mandatory": "PASS",
    "I5_medical_safety": "PASS"
  },
  "flags": [],
  "claude_reasoning_required": false,
  "status": "AUTO_RESOLVED"
}
```

`claude_reasoning_required = true` declanșează Faza 2 filter (Artefact 4).

---

## §6 FLAGGED ISSUE CATEGORIES

Branches care require Claude reasoning fill / Daniel review:

1. **`engines_disagree`** — 2+ engines produce contradicting outputs (ex: Engine #5 UP +15% vs Engine #1 Periodization Ceiling MRV. Engine #2 phase BULK vs Engine #3 inferred phase CUT)
2. **`circuit_breaker_fallback`** — population fallback per ADR 026 Q3 (similarity score K-NN <0.50 = no neighbors — Claude reasoning fill mandatory)
3. **`invariant_violation`** — orice 4-Invariant Safety Stack (§42.9) + 5th Medical Safety §50.3.10 failure → bug spec gap, escalate Daniel
4. **`output_non_sane`** — volume negativ, frequency 0, RIR negativ, kcal sub BMR — semnale concrete spec gap
5. **`coverage_gap`** — combinație în 1500 valid pool care produce no engine output (orphan branch — engines spec missing case)
6. **`persona_critical_edge`** — combinații marcate `safety_critical=true` (Maria 65 + injury combos, pregnant, ED history, post-bariatric) → Daniel product policy mandatory review

---

## §7 PERFORMANCE BUDGET

Per §42.9 Q8 LOCKED V1 + ADR 026 Q8.1:
- Engine pipeline median <50ms per session
- P95 <100ms per session
- Simulator iteration 1500-2000 branches × pipeline ≈ 75-200s total run
- Acceptable batch run, NU realtime (run nightly CI sau on-demand pre-Beta)

---

## §8 STORAGE LAYOUT

```
simulations/
├── scenarios_coverage_v1.json              # full report toate branches
├── scenarios_coverage_v1_flagged_only.json # subset issues only (faster review)
├── validation_corpus_v1.json               # benchmark queries (Artefact 1)
├── ground_truth_v1.json                    # Claude reasoning per query (Artefact 1)
├── validation_runs/
│   └── <YYYY-MM-DD>/
│       ├── corpus_run_<id>.json
│       ├── match_aggregate_<id>.md
│       └── human_eval_sample_<id>.json
└── claude_reasoning_baked/
    └── <branch_id>.json                    # Faza 2 Claude fills (Artefact 4)
```

Markdown summary report `📤_outbox/SCENARIOS_COVERAGE_REPORT_V1.md` post simulator run.

---

## §9 ENGINE #2 STUB CAVEAT

**Issue:** ADR 024 Goal Adaptation Engine = STUB only ("Stub created Faza 3. Full spec PENDING dedicated chat strategic"). 8 Open Questions blocante.

**Workaround pre Engine #2 ADR full spec:**
- Simulator runs Engine #2 stage cu fallback minimal: 5 templates × 4 phases × 3 experience × 4 frequency = 240 templates pre-baked from `01-vision/ONBOARDING_SSOT_V1.md` §2 GOAL TAXONOMY V1 LOCKED
- Branches care depend pe Engine #2 nuance (push-back proporțional, recomp scope, phase auto-detection) = flagged `engine_2_spec_gap`
- Claude reasoning fill direct per branch (fitness expertise standalone) — NU dependent pe Engine #2 spec final

**Post Engine #2 ADR 024 full spec session:** re-run simulator → engines integration complete → flagged_engine_2_spec_gap branches re-evaluated.

**Engines #4/#5/#6/#7/#8 specs dispersed în HANDOVER §45.x:** CC implementation reads HANDOVER chat sessions log direct ca implementation guide (raw read), NU dependent pe ADR-uri canonice consolidate. Trade-off: simulator implementation NOW vs spec consolidation later (separate priority).

---

## §10 CROSS-REFS

- ADR 026 §status (decision tree exhaustive)
- ADR 018 §3 Decision Cluster + §4 Migration Path
- §42.9 LOCKED V1 testing strategy (Property-based + 4-Invariant)
- §42.10 LOCKED V1 pipeline order
- ADR 022 SPEC READY V1 (Bayesian Nutrition Engine #3)
- ADR 014 + 016 + 017 (Profile Typing + Vitality + Demographic Prior — input dimensions)
- ADR 024 STUB (Goal Adaptation Engine #2 — pending full spec)
- DIFF_FLAGS P1-FLAG-SCENARIOS-COVERAGE
- ANDURA_VALIDATION_FRAMEWORK_V1.md (Artefact 1 — orthogonal validation layer)
- FAZA_2_FILTER_STRATEGY_V1.md (Artefact 4 — post-simulator filter workflow)
