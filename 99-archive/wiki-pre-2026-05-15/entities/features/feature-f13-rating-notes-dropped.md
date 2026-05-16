---
title: F13 — Rating Notes Auto-Apply DROP V1 (Anti-RE Rule LOCKED V1 PERMANENT 2026-05-10)
type: entity-feature
status: dropped
last_updated: 2026-05-12
audit_verdict: drop-v1
cross_refs:
  - "[[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F13"
  - "[[../adrs/adr-023-llm-intent-superseded]]"
  - "[[../concepts/anti-recurrence-rules]]"
---

# F13 — Rating Notes Auto-Apply DROP V1

## Synthesis

**F13 Rating Notes Auto-Apply** = V1 prod rating "easy" → marchează ultimii 3 logs cu note `strong`; "hard" → marchează cu `fatigue`. Engine consume notes pentru adaptation. V1_AUDIT verdict **DROP V1** per Anti-RE rule LOCKED V1 PERMANENT scope universal (Pain free text REMOVED + Equipment free text REMOVED + F13 rating notes drop V1). Cross-ref `03-decisions/DECISION_LOG.md` STAGE 1 ADR 023 SUPERSEDED entry verbatim 2026-05-11.

**BATCH 2 SLICE 0 LANDED commit `041e7f2` rating.js port** F13 DROP V1 applied — remove `noteMap = { 'easy': ['strong'], 'normal': [], 'hard': ['fatigue'] }` + logs[i].notes propagation loop V1 lines 63-76 eliminating auto-injection 'strong'/'fatigue' tags to last 3 session logs. LOC delta rating.js 150 → 137 (-13). Downstream consequence `324d198` session.js dead-code cleanup endSession() V1 lines 175-179 dead-code removed (`notes` aggregate + `feltStrong`/`feltHeavy` filter counts + `moodLabel` ternary computed but never passed to showSessionRating consumer).

**Anti-RE rule rationale:** Auto-injection notes to logs = engine inference on user behavior NOT explicitly signaled = halucinație pattern. Pattern: engine respect explicit user signal (rating 3-option Verbal F12) NU silent inference downstream. F15 per-set RPE preservation orthogonal — logging.js untouched + session.js setsRPE collection preserved.

## Verbatim quotes Daniel

Daniel verbatim DECISION_LOG STAGE 1 ADR 023 SUPERSEDED entry Anti-RE rule LOCKED V1 PERMANENT verbatim 2026-05-11:
> *"Pre-flight Anti-RE rule LOCKED V1 PERMANENT scope universal (Pain free text REMOVED + Equipment free text REMOVED + F13 rating notes drop V1)."*

Daniel verbatim audit conflict reconciliation PROMPT_CC §2.1 PRE-audit text supersede:
> *"PROMPT_CC §2.1 PRE-audit text 'rating.js 150 LOC PRESERVED — NU 70 LOC strip' predates LOCK 2026-05-10 F13 DROP V1 by ~13 ore. Audit primat universal rule pattern applied — F13 DROP per Anti-RE rule LOCKED V1 PERMANENT scope universal."*

Daniel verbatim BATCH 2 SLICE 0 commit `041e7f2` rationale F13 DROP applied:
> *"Remove noteMap = { 'easy': ['strong'], 'normal': [], 'hard': ['fatigue'] } + logs[i].notes propagation loop. F13 rating notes DROP V1 Anti-RE rule LOCKED V1 PERMANENT applied."*

## Bugatti framing notes

**Gigel test relevance:** Drop F13 = engine NU presupune cauză ("you said hard → I'll tag last 3 logs as fatigue"). User explicit signal only (F12 3-option). Anti-paternalism Gigel test PASS.

**Quality > Speed via Anti-RE rule LOCKED V1 PERMANENT scope universal:** Pattern: codify anti-halucinație discipline cross-feature (Pain + Equipment + Rating notes ALL DROP V1 free-text auto-inference). Universal rule preserved invariant.

**Anti-RE considerations:** F13 DROP V1 = anti-recurrence "engine inference on user behavior NOT explicitly signaled" pattern. Pattern: Anti-RE rule LOCKED V1 PERMANENT scope universal preserved cross-feature.

**Anti-paternalism notes:** Auto-injection notes silent = paternalism (engine presupune cauză + tag logs without consent). DROP V1 = anti-paternalism explicit. User agency preserved via explicit F12 3-option signal NU silent inference downstream.

**Voice tone notes:** Daniel-ism "Anti-RE rule LOCKED V1 PERMANENT scope universal" recurring pattern (codified anti-halucinație discipline). Audit primat universal rule cross-feature.

## Cross-refs raw layer

- [[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F13 verdict DROP V1 per Anti-RE rule LOCKED V1 PERMANENT
- [[../../../03-decisions/023-llm-intent-superseded]] SUPERSEDED V1 2026-05-11 Anti-RE rule scope universal
- [[../../../03-decisions/DECISION_LOG]] §2026-05-11 STAGE 1 ADR 023 SUPERSEDED entry verbatim Anti-RE rule LOCKED V1 PERMANENT
- [[../../../src/pages/coach/rating.js]] (F13 DROP V1 applied BATCH 2 SLICE 0 commit `041e7f2`; LOC 150 → 137)
- [[../../../src/pages/coach/session.js]] (dead-code cleanup downstream F13 commit `324d198`; LOC 359 → 353)
- [[../../../03-decisions/DECISION_LOG]] §2026-05-12 BATCH 2 SLICE 0 audit conflict reconciliation PROMPT_CC §2.1 PRE-audit supersede
- [[../concepts/anti-recurrence-rules]] (§AR.* codified slip patterns 2× minimum)

🦫 **F13 Rating Notes Auto-Apply DROP V1. Anti-RE rule LOCKED V1 PERMANENT scope universal (Pain + Equipment + Rating notes ALL DROP V1 free-text auto-inference). BATCH 2 SLICE 0 commit `041e7f2` applied. Audit primat universal rule cross-feature preserved.**
