# ANDURA VALIDATION FRAMEWORK V1

**Status:** LOCKED V1 (2026-05-05 evening) — north star ≥95% strict + match weights Safety-dominant universal + Gate 2 DROPPED + Gate 3 reformulat selective + corpus 500 + §9 framing reformulat
**Authority:** ground truth for "Andura ≥95% Claude parity pe fitness" north star
**Path target:** `04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1.md`

---

## §1 NORTH STAR

**Andura accuracy ≥95% vs Claude reasoning pe fitness, bazat pe inputurile pe care le cere.** LOCKED V1 strict 2026-05-05 evening (NU range ambiguu 90-95%, NU aspirațional).

Inputs structured finite (Big 6 onboarding + Profile Typing T1+ + Vitality T1+ + CDL behavioral + Pre-session readiness + Pain Button + Equipment override). NU LLM live conversational — decision tree pre-baked offline cu Claude reasoning per branch (per ADR 026).

**Branches count = engineering choice** (1500, 5k, 100k whatever needed pentru parity). NU strategic concern. Daniel verbatim 2026-05-05 evening: *"poti sa faci si 100000 branches... 10000000000000 branches for all I care"*.

**Rationale ≥95% strict (NU 90% range):** Bugatti philosophy — Faza 2 workflow 3-instance Claude→Gemini→Claude→Daniel (per `04-architecture/FAZA_2_FILTER_STRATEGY_V1.md`) închide 5-10% legitimate disagreement gap exact. Daniel directive permanent (memory rule #26 added 2026-05-05 evening): time/effort/durată NICIODATĂ argumente quality decisions — bootstrap solo zero deadline extern, target 1 ian 2027 aspirațional flexibil per §29.6.1 + §56.9.

**KPI primar pre-Beta:** match rate ≥95% pe full benchmark corpus (auto-eval Claude-judge weighted scoring §5.1 Safety 0.35 dominant) + Daniel review selective pe queries flagged uncertain de Claude-judge §6.1 (qualitative blocker check, NU threshold quantitativ, NU random n=50).

---

## §2 BENCHMARK CORPUS DESIGN

### §2.1 Scope

**500 fitness queries** representative cross-product (LOCKED V1 2026-05-05 evening — Bugatti coverage breadth peak craft, NU 250 minimum):

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

Per query (Claude reasoning vs Andura output) — score 0-1. **Weights LOCKED V1 2026-05-05 evening** (universal Safety-dominant, NU ghilotină conditional pe profile flags):

| Dimensiune | Weight | Match criteria |
|-----------|--------|----------------|
| **Safety considerations** | **0.35** | Claude safety flags ⊆ Andura flags (Andura can include more, NU mai puțin) |
| **Exercise selection overlap** | 0.25 | Jaccard similarity exercises set; ≥0.70 = full credit; 0.50-0.70 partial |
| **Sets/reps/RIR band** | 0.20 | Each exercise sets within ±20% Claude band; reps within ±2; RIR within ±1 |
| **Key principles invoked** | 0.20 | Semantic overlap rationale (LLM-judge: "Andura rationale captures Claude's intent?") |

**Per-query match score** = weighted sum 0-1.

**Match threshold per query**: ≥0.85 = MATCH / 0.70-0.85 = PARTIAL / <0.70 = MISS.

**Rationale Safety 0.35 universal (NU conditional ghilotină pe profile flags vârstă/medical/pregnancy/pain):** Daniel push-back final 2026-05-05 evening LOCKED — Maria 65 100-500 organici în 50k auto-select Longevitate template built-in safety + ~25 edge cases optimization absurd; 1% × Maria selectând altceva = 25 useri în 50k. Calculul concret sparge philosophy "Safety dominant doar conditional pe edge profile flags" — universal weight 0.35 absorbs critical safety semantics. Gate 2 dedicated `safety_critical=true` DROPPED (§7).

### §5.2 Aggregate metric

**Corpus match rate** = (count MATCH / total queries) × 100%.

**Pre-Beta gate**: ≥95% MATCH on full 500-query corpus (LOCKED V1 §1 strict). Gate 2 dedicated critical safety DROPPED — Safety 0.35 universal weight §5.1 absorbs critical safety semantics universal.

---

## §6 EVAL PIPELINE

### §6.1 Auto-eval (Claude-judge as 3rd party)

Separate Claude session per query receives `(claude_reasoning, andura_output)` → returns match score per dimensiune + verdict MATCH/PARTIAL/MISS + diff explanation.

Anti-bias: Claude-judge NU vede `query.persona` directly în prompt (blind eval). Audit trail JSON per query.

### §6.2 Daniel selective review (LOCKED V1 2026-05-05 evening, NU random n=50)

**Daniel review selectiv pe queries flagged uncertain de Claude-judge §6.1** (estimat ~5-15% corpus = ~25-75 queries din 500). NU random sampling, NU threshold quantitativ. Qualitative blocker check:
- Catastrophic safety violation → pre-Beta blocker
- Philosophy violation Bugatti craft → pre-Beta blocker
- Restul nuance disagreement absorbed în Gate 1 weighted scoring §5.1

Daniel directive 2026-05-05 evening verbatim: *"ANDURA să gândească ca Claude sau ca Daniel? Eu fac review unde ai dubii, restul tu analiză mai bună"*.

Dietician panel post-Beta v1.5 per ADR 022 §4 Validation Strategy (separate layer, NU pre-Beta gate).

### §6.3 Storage

`simulations/validation_runs/<YYYY-MM-DD>/` per run:
- `corpus_run_<id>.json` (full output toate queries)
- `match_aggregate_<id>.md` (summary % MATCH / breakdown per persona / per query_type / Claude-judge flagged uncertain list)
- `daniel_review_flagged_<id>.json` (Claude-judge flagged uncertain queries + Daniel verdict per query — blocker / no-blocker / nuance-only)

---

## §7 PRE-BETA GATES (LOCKED V1 2026-05-05 evening)

**Gate 1 (auto-eval)**: ≥95% MATCH on full 500-query corpus (Claude-judge weighted scoring §5.1 Safety 0.35 dominant universal).

**Gate 2:** **DROPPED entirely** (LOCKED V1 2026-05-05 evening). Daniel push-back valid — Maria 65 100-500 organici în 50k auto-select Longevitate template built-in safety, ~25 edge cases optimization absurd; 1% × Maria selectând altceva = 25 useri în 50k → philosophy "drop dedicated critical safety gate, Safety 0.35 universal weight absorbs critical safety semantics". Restul nuance disagreement edge cases absorbed în Gate 1 weighted scoring.

**Gate 3 (Daniel selective review)**: Daniel review pe queries flagged uncertain de Claude-judge §6.1 (~5-15% corpus = ~25-75 queries din 500). NU random n=50, NU threshold quantitativ. Qualitative blocker check (catastrophic safety / philosophy violation = pre-Beta blocker). Daniel directive verbatim: *"Eu fac review unde ai dubii, restul tu analiză mai bună"*.

**Both gates PASS (Gate 1 ≥95% + Gate 3 zero blocker flag) = Beta launch unblock pe scenarios coverage layer.** Gate fail → pivot fix problematic branches + re-run.

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
1. ✅ Daniel LOCK §1 north star ≥95% strict + §5 match weights Safety 0.35 universal + §7 Gates (Gate 1 95% / Gate 2 DROPPED / Gate 3 selective) — **LOCKED V1 2026-05-05 evening**
2. ✅ Daniel LOCK §2 corpus scope = **500 queries** (Bugatti coverage breadth, NU 250 minimum) — LOCKED V1 2026-05-05 evening
3. Engine #2 ADR 024 full spec session (recommend separate chat dedicat — currently STUB, `engine_2_spec_gap` flagged branches defer per `04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1.md` §9 workaround 240 templates fallback)
4. Engines #4/#5/#6/#7/#8 ADR-uri canonice consolidate (chat-uri post-hoc, NON-blocker validation framework)

**Implementation order (framing reformulat LOCKED V1 2026-05-05 evening — NU misleading "Daniel-time 5-10h"):**
1. CC bake corpus skeleton from §2 schema 500-query (~1h CC autonomous)
2. **Claude chat strategic produce ground truth ~5-10h cumulative** (Claude reasoning baseline per §3.2 batch 50-100 queries/chat × ~5 chats) **+ Daniel review reality-lock ~30-60min cumulative** (NU "Daniel-time 5-10h" — slip framing fundamental corectat 2026-05-05 evening, recidivă rapid memory rule #26 time arguments)
3. CC implement match metric utility + auto-eval pipeline (~3-5h CC autonomous)
4. Run full validation post simulator delivery (Artefact 2 + 3 implementation complete)
