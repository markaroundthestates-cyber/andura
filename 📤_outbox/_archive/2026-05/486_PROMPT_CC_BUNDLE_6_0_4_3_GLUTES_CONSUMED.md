# PROMPT CC — Bundle 6.0.4.3 Glutes Library Extension (~45-50 NEW 'fese' canonical V1)

**Date:** 2026-05-13 (continuation chat ACASĂ post handover 13k LANDED)
**Branch:** `feature/v2-vanilla-port`
**Model:** OPUS EXCLUSIVELY (hardcoded zero exceptions)
**Scope:** Pure schema additive Bundle 6.0.x sub-batch
**Authority precedence:** ADR_ANATOMICAL_CLASSIFICATION_V1 §2.10 'fese' canonical + ADR_SMART_ROUTING_EQUIPMENT_v2 LOCK V2 §2.1 §2.2 cascade ordered list + anti-recurrence-rules §AR.20+§AR.21 grep evidence + CLAUDE.md §0-§7 + VAULT_RULES.md §F3.1-§F3.13

## §-1 INBOX + LATEST CLEANUP MANDATORY PRE-EXECUTE

Before any execute step:

1. Verify `📥_inbox/` clean state — `ls 📥_inbox/` should show only `.gitkeep`. If stale artefacts → move to `📤_outbox/_archive/2026-05/<NN>_<filename>_CONSUMED.md` next-sequential.
2. Archive precedent `📤_outbox/LATEST.md` → `📤_outbox/_archive/2026-05/<NN>_LATEST_PREVIOUS_<previous_topic>_CONSUMED.md`. Most recent LATEST = `LATEST — /wiki-ingest Handover 2026-05-13k Strategic 'Fese' Canonical Cluster + Session Sequence Ordering V1 LANDED — c975cc4`. Find next sequence number by `ls 📤_outbox/_archive/2026-05/ | tail -5`.
3. Save the verbatim PROMPT_CC artefact to `📥_inbox/PROMPT_CC_BUNDLE_6_0_4_3_GLUTES.md` (Daniel courier paste manual practice — preserve historical input record).
4. Continue §0 pre-flight grep evidence post cleanup verified.

## §0 Pre-Flight Grep Evidence Inline Verbatim §AR.20+§AR.21 MANDATORY

Run these and capture verbatim output for LATEST.md §0:

```bash
grep -n "muscle_target_primary: 'fese'" src/schema/exerciseMetadata.js
# Expected: 4 matches (Hip Thrust + Single-Leg Hip Thrust + Cable Pull-Through + Banded Pull-Through)

grep -n "fese" 03-decisions/ADR_ANATOMICAL_CLASSIFICATION_V1.md | head -20
# Expected: §2.10 §3.10 references

grep -n "fallback_cascade" 03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v2.md | head -10
# Expected: §2.1 §2.2 references

grep -c "muscle_target_primary:" src/schema/exerciseMetadata.js
# Expected: 381 baseline

npx vitest run --reporter=dot 2>&1 | tail -5
# Expected: Test Files 169 passed (169) | Tests 3240 passed (3240)
```

**Fail any → ABORT execute, signal back to orchestrator chat-side mismatch state.**

## §1 Scope LOCK V1

Extend `src/schema/exerciseMetadata.js` with ~45-48 NEW glute exercises `muscle_target_primary: 'fese'` canonical V1 + `fallback_cascade[]` populated 5 step types per ADR_SMART_ROUTING_EQUIPMENT_v2 §2.1 LOCK V2.

Schema cumulative target: 381 → ~426-431 entries.
Pre-Beta progress: 355/657 = ~54.0% → ~400-405/657 = ~60.9-61.6%.

Anatomical scope: gluteus maximus + medius + minimus + TFL per ADR_ANATOMICAL_CLASSIFICATION_V1 §3.10.

Bret Contreras Glute Lab school reference — force compound 1RM Hip Thrust standard + glute isolation high-volume specialty pattern.

## §2 Constraints HARD §F3.12 STRICT

### §2.1 ZERO mutation existing 381 entries

- ZERO mutation existing 4 'fese' primary entries (Hip Thrust + Single-Leg Hip Thrust + Cable Pull-Through + Banded Pull-Through) — preserved EXACT.
- ZERO mutation existing 'picioare-hamstrings' / 'picioare-quads' / 'spate' entries.

### §2.2 Cascade entries 5 step types canonical universal apply

### §2.3 NU populate `session_sequence_priority` field
### §2.4 ZERO src/ outside scope
### §2.5 ZERO touch raw layer/wiki/CLAUDE/VAULT_RULES

## §3 Phase Split A-G Discrete-Blocks
- Phase A — Tier 1 Hip Thrust Barbell Extended Variants (~7-8)
- Phase B — Tier 1-2 Smith + Machine Hip Thrust Variants (~5-6)
- Phase C — Tier 1-2 DB Hip Thrust + Glute Bridge Variants (~6-7)
- Phase D — Tier 2 Cable Glute Isolation (~6)
- Phase E — Tier 1-2 Sumo Deadlift Glute-Bias (~5)
- Phase F — Tier 2-3 Step-up + Lunge Glute-Focus + Bodyweight Glute (~7-8)
- Phase G — Tier 2-3 Specialty Glute (~7)

🦫 Bugatti craft. Bundle 6.0.4.3 Glutes PROMPT_CC inbox artefact 2026-05-13l execute pending.
