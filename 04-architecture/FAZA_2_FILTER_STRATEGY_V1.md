# FAZA 2 FILTER STRATEGY V1

**Status:** SPEC DRAFT V1 — pending Daniel LOCK pre Faza 2 chat-uri kickoff
**Authority:** workflow plan post simulator delivery for Claude reasoning fill + Daniel product policy lock
**Path target:** `04-architecture/FAZA_2_FILTER_STRATEGY_V1.md`

---

## §1 TRIGGER

Post simulator (Artefact 2 + 3) delivery complete:
- `simulations/scenarios_coverage_v1.json` — full report toate branches
- `simulations/scenarios_coverage_v1_flagged_only.json` — subset issues only

Faza 2 = consume `flagged_only.json` → Claude reasoning fill per branch + Daniel product policy lock strategic edge cases.

---

## §2 ESTIMATE FLAGGED ISSUES

**Realist estimate post simulator first run:**
- Total branches: ~1500-2000
- AUTO_RESOLVED: ~85% (engines pipeline deterministic + invariants PASS + no flags)
- FLAGGED: ~15% = ~225-300 branches require Claude reasoning fill

**Distribuție flagged categories estimative:**
- `engines_disagree`: ~40% flagged (~90-120 branches) — most common
- `circuit_breaker_fallback`: ~20% (~45-60 branches)
- `coverage_gap`: ~15% (~35-45 branches)
- `output_non_sane`: ~10% (~22-30 branches) — bug spec gap signals
- `persona_critical_edge`: ~10% (~22-30 branches) — Daniel mandatory review
- `invariant_violation`: <5% (~0-15 branches) — must be zero pre-Beta

**Engine #2 STUB-related flags `engine_2_spec_gap`** = additional ~50-100 branches (consolidate post Engine #2 ADR 024 full spec).

---

## §3 WORKFLOW 3-INSTANCE BUGATTI-GRADE

Per pattern Daniel matured 2026-05-05 (memory rule "Workflow 3-instance Bugatti-grade RECOGNIZED matured"):

```
Claude (chat strategic)  →  Gemini (logic challenge)  →  Claude (Bugatti integrate)  →  Daniel (reality lock)
```

### §3.1 Per-batch flow (~75-100 issues/chat)

1. **Claude reasoning produce** (chat strategic Daniel + Claude):
   - Read batch `flagged_only.json` slice ~75-100 issues
   - Per issue: produce `claude_reasoning_fill` per design Schema (exercises, sets/reps/RIR, rationale, safety considerations)
   - Output JSON aggregated `claude_reasoning_baked/<batch_id>.json`

2. **Gemini challenge** (separate session — Daniel runs):
   - Input: Claude reasoning batch
   - Output: critique per branch (logic gaps, consistency issues, alternative interpretations)
   - ~85% Gemini agreement (no critique) + ~15% real concerns surfaced

3. **Claude integrate Bugatti** (return chat strategic):
   - Consume Gemini critique
   - Refine reasoning per critique sau push-back dacă Gemini halucinație
   - Output refined `claude_reasoning_baked/<batch_id>_v2.json`

4. **Daniel reality lock** (final batch review):
   - Daniel scan refined output
   - Lock product policy strategic edge cases (~3-5 per batch realist)
   - Approve batch → CC bake în decision tree storage

### §3.2 Per-chat estimate

- Daniel-time per chat strategic: ~1.5-2.5h
- Issues per chat: ~75-100
- Total chats Faza 2: ~3 chat-uri (75-100 × 3 = 225-300 issues coverage)

---

## §4 RESIDUAL HUMAN JUDGMENT FINAL

Per estimate 3-instance Bugatti workflow:
- ~85% straightforward Claude reasoning + Gemini agreement = AUTO_FILLED
- ~15% real Daniel judgment finale (~30-50 decisions strategic edge cases)

**Decisions strategic edge cases typical:**
- Maria 65 + injury arthrosis + Cut goal — engine policy combo (ex: deload more frequent? Specialization disabled?)
- Pregnant + Vitality LOW — Passive Mode trigger threshold
- Post-bariatric + BULK request — special priors override?
- ED history flag + behavioral inference disagreement — Claude reasoning conservative vs Daniel product call

---

## §5 TOTAL FAZA 2 DANIEL-TIME

**Estimate concentrate:**
- 3 chat-uri × 1.5-2.5h = ~5-8h Daniel-time strategic
- Vs static enumeration alternative: ~15-30h Daniel-time pe enumerate branches manual
- **Velocity win: ~5-6x**

---

## §6 OUTPUT FORMAT

### §6.1 Per batch

`claude_reasoning_baked/<batch_id>_final.json`:

```json
{
  "batch_id": "faza2-batch-1-engines-disagree-A",
  "issues_count": 100,
  "filled_branches": [
    {
      "branch_id": "...",
      "claude_reasoning_fill": {
        "session_blueprint": {...},
        "rationale_3_sentences": "...",
        "safety_considerations": [...],
        "key_principles_invoked": [...]
      },
      "gemini_critique_summary": "...",
      "claude_v2_refinement": "...",
      "daniel_verdict": "approved" | "modified" | "escalated_product_policy",
      "daniel_modifications": null | {...}
    }
  ],
  "daniel_decisions_locked": [
    { "decision_id": "...", "scope": "...", "verdict": "..." }
  ]
}
```

### §6.2 Aggregated end Faza 2

`📤_outbox/FAZA_2_COMPLETE_REPORT.md`:
- Total branches filled: X / total flagged
- Daniel decisions locked: Y strategic edge cases
- Coverage % final: Z%
- Critical MISS remaining: W (must be 0)
- Next action: re-run validation framework full corpus

---

## §7 INTEGRATION CU VALIDATION FRAMEWORK

Post Faza 2 complete:
1. CC bake all `claude_reasoning_baked/*_final.json` în decision tree storage
2. Re-run simulator full → validate AUTO_RESOLVED rate increase + FLAGGED decrease
3. Run validation framework full corpus per Artefact 1 §6 → match rate vs ground_truth_v1.json
4. Pre-Beta gate eval: ≥90% MATCH on full corpus (Gate 1) + ≤5% MISS critical safety (Gate 2) + ≥80% Daniel approval n=50 sample (Gate 3)

Toate 3 gates PASS = scenarios coverage layer Beta-ready.

---

## §8 CROSS-REFS

- ANDURA_VALIDATION_FRAMEWORK_V1.md (Artefact 1 — gate definition)
- SCENARIOS_SIMULATOR_DESIGN_V1.md (Artefact 2 — pipeline producing flagged_only.json)
- CC_PROMPT_scenarios_simulator_implementation.md (Artefact 3 — implementation prompt)
- ADR 026 (decision tree exhaustive)
- DIFF_FLAGS P1-FLAG-SCENARIOS-COVERAGE
- Memory rule "Workflow 3-instance Bugatti-grade RECOGNIZED matured 2026-05-05"

---

## §9 PRE-LOCK CONSIDERATIONS

**Daniel decide pre-Faza 2 kickoff:**
1. Batch size optim: 75-100 issues/chat sau adjust per first chat reality?
2. Gemini access: Daniel rulează separate session sau workflow async?
3. Engine #2 STUB-flagged branches handling: includ în Faza 2 normal sau defer post Engine #2 ADR full spec?
4. Critical safety branches priorit ordine: persona_critical_edge primul batch sau ultimul (after Claude warmed up)?

Recomand:
1. Start 75 issues/chat batch 1 (calibrate based on bandwidth real)
2. Async (Daniel rulează Gemini între chat-uri Claude)
3. Defer engine_2_spec_gap până post Engine #2 ADR (NU pollute Faza 2 cu rework prevented)
4. persona_critical_edge **PRIMUL batch** — Daniel fresh attention safety-critical, plus Claude calibration cycle pe edge cases setup tone pentru rest
