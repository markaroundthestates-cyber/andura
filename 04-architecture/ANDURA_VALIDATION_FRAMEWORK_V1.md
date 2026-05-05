# ANDURA VALIDATION FRAMEWORK V1

**Status:** SPEC DRAFT V1 — pending Daniel LOCK pre simulator implementation
**Authority:** ground truth for "Andura ≥90-95% Claude parity pe fitness" north star
**Path target:** `04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1.md`

---

## §1 NORTH STAR

**Andura accuracy ≥90-95% vs Claude reasoning pe fitness, bazat pe inputurile pe care le cere.**

Inputs structured finite (Big 6 onboarding + Profile Typing T1+ + Vitality T1+ + CDL behavioral + Pre-session readiness + Pain Button + Equipment override). NU LLM live conversational — decision tree pre-baked offline cu Claude reasoning per branch (per ADR 026).

**Branches count = engineering choice** (1500, 5k, 100k whatever needed pentru parity). NU strategic concern.

**KPI primar pre-Beta:** match rate ≥90% pe full benchmark corpus (auto-eval Claude-judge) + ≥80% human-eval Daniel sample n=50.

---

## §2 BENCHMARK CORPUS DESIGN

### §2.1 Scope

~250-500 fitness queries representative cross-product:

- **Persona dimension** (~10 anchor + ~20 edge): Maria 65 / Gigica 35 / Marius 25 / Daniel 36 / Elena 35 / Gigel 45 / Ana 55 / Iasmina 18 + edge cases (post-bariatric, ED history, pregnant, kidney disease, >75 ani, severe injury <3 luni)
- **Goal × Phase**: 5 templates (Forță / Tonifiere / Slăbire / Longevitate / Sănătate) × 4 phases (CUT / BULK / MAINTAIN / RECOMP)
- **Experience × Frequency**: Beginner/Intermediate/Advanced × 2-6x/săpt
- **Equipment**: Apartament bodyweight / Home gantere / Home barbell / Sală full
- **History**: T0 cold-start / T1 14 zile / T2 28 zile + 12 sesiuni / T3 90+ zile cu pattern stabil
- **Recovery markers**: Vitality HIGH/MED/LOW + Pre-session 🟢/🟡/🔴 + injury flags

### §2.2 Query types per persona

Each persona × ~5-10 query types:
1. Session blueprint request ("Ce sesiune îmi propui pentru azi?")
2. Adjustment mid-session ("M-am simțit mai obosit decât mă așteptam, ce fac?")
3. Plateau response ("3 săptămâni stagnant, ce schimb?")
4. Goal shift consultation ("Vreau să trec de la Cut la Bulk")
5. Substitution request ("Nu am bara azi, ce înlocuiesc?")
6. Pain/contraindication ("Mă doare genunchiul când fac squats")
7. Volume question ("Câte seturi/săpt e prea mult pentru mine?")
8. Deload timing ("Când fac deload?")
9. Specialization eligibility ("Pot prioritiza brațe 4 săpt?")
10. Nutrition phase inference ("Slăbesc prea repede, ce fac?")

### §2.3 Storage

`simulations/validation_corpus_v1.json` — schema:

```json
{
  "corpus_version": "v1",
  "queries": [
    {
      "query_id": "maria65-cut-injury-substitution-001",
      "persona": { "name": "Maria 65", "age": 65, "sex": "F", "kg": 70, "height": 162, "goal": "Slăbire", "phase": "CUT", "experience": "Beginner", "frequency": 3, "equipment": ["bodyweight", "rezistențe"], "history": "T1", "recovery": { "vitality": "MED", "pre_session": "🟡", "injuries": ["genunchi drept arthrosis"] } },
      "query_type": "substitution",
      "query_text": "Programul de azi are squats. Mă doare genunchiul. Ce fac?",
      "expected_dimensions": ["exercise_substitution", "safety_consideration", "deload_signal_check"]
    }
  ]
}
```

---

## §3 GROUND TRUTH METHODOLOGY

### §3.1 Claude reasoning baseline

Per query, Claude (chat strategic) produce reasoning structured:

```
{
  "query_id": "...",
  "claude_reasoning": {
    "session_blueprint": { "exercises": [...], "sets_reps_rir": [...], "rest_periods": [...], "duration_min": N },
    "key_principles_invoked": [...],  // ex: "joint protection arthrosis", "T1 conservative volume"
    "safety_considerations": [...],
    "rationale_3_sentences": "..."
  },
  "produced_at": "2026-05-05T..."
}
```

Stored: `simulations/ground_truth_v1.json` indexed by query_id.

### §3.2 Source = Claude chat strategic NEW dedicated session

Daniel run benchmark corpus prin Claude chat dedicated → batch 50-100 queries/chat → output JSON aggregated. ~5 chat-uri pentru 250-500 corpus complete. **NU CC Opus** (CC = mecanic baker, Claude chat = reasoning ground truth).

---

## §4 ANDURA OUTPUT CAPTURE

Per query, Andura decision tree returnează:

```json
{
  "query_id": "...",
  "andura_output": {
    "session_blueprint": {...},      // same shape ca claude_reasoning.session_blueprint
    "decision_tree_branch_id": "...",
    "engines_pipeline_trace": {...}, // per Decision Cluster trace ADR 018
    "fallback_used": false           // true dacă Circuit Breaker fallback ADR 026
  }
}
```

Andura runs simulator pipeline (Artefact 2) per query → branch_id matched + output baked.

---

## §5 MATCH METRIC

### §5.1 4 dimensiuni semantic agreement

Per query (Claude reasoning vs Andura output) — score 0-1:

| Dimensiune | Weight | Match criteria |
|-----------|--------|----------------|
| **Exercise selection overlap** | 0.30 | Jaccard similarity exercises set; ≥0.70 = full credit; 0.50-0.70 partial |
| **Sets/reps/RIR band** | 0.25 | Each exercise sets within ±20% Claude band; reps within ±2; RIR within ±1 |
| **Safety considerations** | 0.25 | Claude safety flags ⊆ Andura flags (Andura can include more, NU mai puțin) |
| **Key principles invoked** | 0.20 | Semantic overlap rationale (LLM-judge: "Andura rationale captures Claude's intent?") |

**Per-query match score** = weighted sum 0-1.

**Match threshold per query**: ≥0.85 = MATCH / 0.70-0.85 = PARTIAL / <0.70 = MISS.

### §5.2 Aggregate metric

**Corpus match rate** = (count MATCH / total queries) × 100%.

**Pre-Beta gate**: ≥90% MATCH on full corpus + ≤5% MISS critical (safety-related categories).

---

## §6 EVAL PIPELINE

### §6.1 Auto-eval (Claude-judge as 3rd party)

Separate Claude session per query receives `(claude_reasoning, andura_output)` → returns match score per dimensiune + verdict MATCH/PARTIAL/MISS + diff explanation.

Anti-bias: Claude-judge NU vede `query.persona` directly în prompt (blind eval). Audit trail JSON per query.

### §6.2 Human-eval (Daniel + dietician panel post-Beta v1.5)

Sample n=50 random din corpus, Daniel review manual + dietician panel (post-Beta v1.5 per ADR 022 §4 Validation Strategy). Anti-overconfidence Mensa-grade gate.

### §6.3 Storage

`simulations/validation_runs/<YYYY-MM-DD>/` per run:
- `corpus_run_<id>.json` (full output toate queries)
- `match_aggregate_<id>.md` (summary % MATCH / breakdown per persona / per query_type / critical MISS list)
- `human_eval_sample_<id>.json` (n=50 sample + Daniel verdict)

---

## §7 PRE-BETA GATES

**Gate 1 (auto-eval)**: ≥90% MATCH on full corpus.
**Gate 2 (critical safety)**: ≤5% MISS pe queries marcate `safety_critical=true` (injury, contraindication, pain, pregnant, ED).
**Gate 3 (human-eval)**: ≥80% Daniel approval pe sample n=50.

**Toate 3 gates PASS = Beta launch unblock pe scenarios coverage layer.** Gate fail → pivot fix problematic branches + re-run.

---

## §8 CROSS-REFS

- ADR 026 §status (decision tree exhaustive 1500-2000 branches)
- §42.9 LOCKED V1 testing strategy (Property-based + Persona Suite + 4-Invariant — orthogonal layer engines correctness, NU înlocuiește validation framework)
- ADR 022 §4 Validation Strategy (R²>0.85 simulator gate + dietician panel post-Beta v1.5)
- ADR 017 Demographic Prior Database (anchor personas)
- ADR 014 Profile Typing (T0-T3 maturity tiers)
- DIFF_FLAGS P1-FLAG-SCENARIOS-COVERAGE

---

## §9 DEPENDENCIES + SEQUENCE

**Pre-implementation:**
1. Daniel LOCK §1 north star formulation + §5 match metric weights + §7 gate thresholds
2. Daniel LOCK §2 corpus scope (250 vs 500 queries trade-off)
3. Engine #2 ADR 024 full spec session (recommend separate chat dedicat — currently STUB)
4. Engines #4/#5/#6/#7/#8 ADR-uri canonice consolidate (chat-uri post-hoc, NON-blocker validation framework)

**Implementation order:**
1. CC bake corpus skeleton from §2 schema (~1h CC autonomous)
2. Daniel + Claude chat strategic produce ground truth ~5 chat-uri (Daniel-time ~5-10h cumulative)
3. CC implement match metric utility + auto-eval pipeline (~3-5h CC autonomous)
4. Run full validation post simulator delivery (Artefact 2 + 3 implementation complete)
