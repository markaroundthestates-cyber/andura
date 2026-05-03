# ADR 023 — LLM Intent Interpretation & Fallback Architecture

**Status:** ✅ **LOCKED V1 — partial spec ingest** (chat strategic 2026-05-03 audit total addendum)
**Date:** 2026-05-03
**See also:** [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.86 + §36.87 (Cognitive Q4 DELOCK §AMENDMENT) + §36.91 (T2 RESOLVED via this ADR) + [[../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE_SPEC]] Q4 + Q11 + Q26

---

## ⚠️ STATUS — PARTIAL SPEC PENDING UPLOAD

**Source addendum NU în inbox la momentul ingest:** `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` referenced ca sursă spec complet (13 sub-secțiuni A-M) DAR NU delivered acest ingest.

**Per memory rule SUFLET ANDURA precedent (2026-05-02):** partial ingest procedat per zero-info-loss principle — fabricarea conținutului lipsă INTERZISĂ.

**Action Daniel:** upload `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` în `📥_inbox/` pentru ingest viitor cu full sub-sections A-M.

**Acest fișier conține DOAR conținut verificabil din 3 fișiere ingestate:**
- `HANDOVER_AUDIT_TOTAL_2026-05-03.md` §0 + §7
- `AUDIT_VERIFICATION_REPORT.md` §11
- `AUDIT_IDEATION_REPORT.md` §7

**Sub-sections A-M complete vor fi populate post upload addendum.** Cross-ref `DIFF_FLAGS.md` P1 BLOCKER acest ingest.

---

## Context

Pattern emergent vault Andura post audit consolidat 9 passes: engine arhitectural deterministic solid + nevoie LLM intent interpretation pe 2 trigger points strict (Pain text + Equipment text).

**T2 The Filter** finding (NU codificabil prin regex/NLP determinist) era HIGH acceptable trade-off în audit consolidat. Soluție identificată chat strategic 2026-05-03: LLM Intent layer scope strict cu Bugatti sandbox preserved.

**Cognitive Q4 "ZERO LLM runtime"** (LOCKED V1 anterior) DELOCK condiționat per §36.87 §AMENDMENT 2026-05-03 — LLM permis EXCLUSIV pe 2 trigger points definite în această ADR.

## Decision

### Scope STRICT (2 trigger points pre-Beta MANDATORY)

1. **§36.38 Pain Button text input** (Tier 1) — user free-text "Mă doare X în zona Y" → LLM intent classification → routing engine action
2. **§36.55.2 / §36.81.2 Equipment text input** (Tier 2) — user free-text "Aparat ocupat / lipsă" sau echipament alternativ → LLM intent classification → smart-routing alternatives

**ZERO LLM pe:** volume / intensity / progression / abandonment / RPE / outlier detection / streak counter / mode detection / arbitration / calibration / readiness scoring. Determinism preserved pe core engine paths.

### Provider Chain (fallback automat)

1. **Primary:** Groq llama-3-8b-it (cheap, fast, deterministic via temperature 0.0)
2. **Fallback 1:** Gemini 1.5 Flash PAYG (dacă Groq fails / latency exceed / quota exhausted)
3. **Last resort:** Local Regex Static Keywords (deterministic, offline, ZERO cost)

**Fallback trigger conditions:** failure / latency exceed (>2s) / cost cap reached / network unavailable.

### Bugatti Sandbox

- **Temperature 0.0** — determinism (same input → same output)
- **Structured Outputs JSON schema** — engine consume structured intent enum, NU raw text
- **Regex Fallback local** — last resort path always available offline

### Sanitizer Client-Side PII

- **Whitelist exercise names** + **termeni fitness RO** — păstrate
- **Restul user input** — sanitizat / anonimizat client-side ÎNAINTE trimitere la LLM provider
- **Rezolvă N2 Privacy Clause** finding (audit consolidat)

### Async Non-Blocking

- **NU blochează engine decision path** — Cognitive Q11 latency budget (<300ms total decision) preserved
- **UI feedback** "Procesăm..." indicator dacă LLM call active
- **Fallback la regex** dacă timeout >2s

### Cache IndexedDB Local

- **Hit rate target ~55-60%** (input intent classification repetabil)
- **Token economy reduction ~80%** vs zero-cache scenario
- **Invalidare** la schema changes / user explicit "ignore cache"

### Cost Cap

- **Hard cap €10/lună** — enforcement requires Cloud Functions backend (vezi Q11-INFRA D3 + D6 decision pending Daniel)
- **Soft alert €0.50/zi** + **soft alert €2/săpt** — frontend telemetry
- **Frontend-only soft cap** acceptabil dacă D3 = B Spark plan retain (user can bypass cap manual)
- **Backend Cloud Functions hard enforcement** dacă D3 = A Blaze plan upgrade

### CDL Audit Trail Extension

- **`llm_metadata` field NEW** în CDL entry pentru fiecare LLM call:
  - `provider` (groq / gemini / regex)
  - `latency_ms`
  - `token_count_input` + `token_count_output`
  - `fallback_chain_triggered` (boolean)
  - `cache_hit` (boolean)
  - `cost_estimate_eur`
- **MOAT pillar 3 (Decizii verificabile) preserved** — engine recommendations explainable post-mortem

### Gigel Test PASS

- **Maria 65 / Gigica 35 ZERO text input** — folosesc 3 butoane predefined (Pain Button §36.38 EXT-1 + Equipment alternatives substitutions algorithm §36.81.2)
- **Marius 25 optional "Altceva"** text input → LLM intent (advanced user opt-in)
- **NU forced text input** pentru core demographic Maria 65 / Gigica 35

## Consequences

### Positive

- **T2 The Filter RESOLVED** (§36.91)
- **Cognitive Q4 DELOCK** (§36.87) — scope strict, NU full LLM pe engine
- **Bugatti sandbox preserved** (temperature 0.0 + structured outputs + regex fallback)
- **Anti-RE preserved** — engine deterministic, LLM doar intent classification
- **MOAT pillar 3 preserved** — CDL `llm_metadata` extension
- **Privacy preserved** — sanitizer whitelist client-side ZERO PII trimis
- **Latency preserved** — async non-blocking, Q11 budget intact
- **Cost preserved** — €10/lună hard cap

### Negative

- **External provider dependency** — Groq + Gemini availability outside Daniel control
- **Cost monitoring infrastructure** — backend hard cap requires Blaze plan upgrade (D3 + D6 decision pending)
- **Sub-sections A-M full spec PENDING** — implementation cannot start până addendum upload

### Risks

- **Provider deprecation:** Groq llama-3-8b-it model lifecycle uncertain post-2026 → fallback chain mitigates
- **Quota exhaust:** dacă Beta cohort heavy text input → cost cap triggered → fallback regex
- **Whitelist maintenance:** termeni fitness RO + exercise names registry needs ongoing maintenance (NEW-IDEATION-4 audit total ideation)

## Effort Estimate

- **Implementation Tier 1 (Pain) + Tier 2 (Equipment):** ~6-10h Opus
- **Daniel chat strategic refinement:** ~2-3h (already done acest chat — addendum source)
- **Pre-Beta:** mandatory ambele Tier 1 + Tier 2 LIVE

## Pre-Beta Mandatory

- ✅ ADR LOCKED V1 (acest fișier + §36.86 SSOT)
- ⏳ Sub-sections A-M full spec PENDING addendum upload
- ⏳ Implementation pending Daniel chat strategic D1-D6 decision points + sequencing
- ⏳ D3 Cloud Functions Blaze decision (D6 cost monitoring infrastructure depends)
- ⏳ NEW-IDEATION-4 Whitelist maintenance setup

## Cross-References

- **HANDOVER_GLOBAL §36.86** — decision LOCKED V1 acest ingest
- **HANDOVER_GLOBAL §36.87** — Cognitive Q4 §AMENDMENT 2026-05-03 DELOCK
- **HANDOVER_GLOBAL §36.91** — T2 The Filter RESOLVED via this ADR
- **HANDOVER_GLOBAL §36.92** — Audit consolidat reclasificare 4 buckets
- **HANDOVER_GLOBAL §36.38** — Pain/Discomfort Button core (Tier 1 trigger)
- **HANDOVER_GLOBAL §36.81.2** — Substitutions Hierarchy Algorithmic (Tier 2 equipment trigger adjacent)
- **HANDOVER_GLOBAL §36.55** — GDPR Phone Privacy (sanitizer adjacent)
- **04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1** Q4 (DELOCK target) + Q11 (latency preserved) + Q26 (anti-RE preserved)
- **ADR 011 CDL audit trail** — `llm_metadata` extension
- **ADR 014 equipment registry** — whitelist termeni fitness RO cross-ref (NEW-IDEATION-4)
- **N2 Privacy Clause** finding (sanitizer rezolvă)
- **Q11-INFRA Cloud Functions** (D3 decision pending) + **D6 cost monitoring backend** (D3 dependent)
- **NEW-IDEATION-3 SLA disclosure ToS** + **NEW-IDEATION-4 Whitelist maintenance** + **NEW-IDEATION-5 Cost monitoring backend** (audit total ideation §7)

## Reconsideration Triggers

1. **Provider lifecycle:** Groq llama-3-8b-it deprecated → switch to alternative cheap fast LLM
2. **Cost exceeds €10/lună:** evaluate Blaze upgrade cost-benefit (D3 reconsider)
3. **Beta cohort feedback:** dacă LLM intent classification accuracy <85% → tune prompts / structured outputs schema / fallback regex thresholds
4. **Privacy regulator scrutiny:** dacă RO ANSPDCP raises Article 6/9 GDPR concerns despite sanitizer → review consent flow + transparency disclosure
5. **Maria 65 / Gigica 35 use text input:** dacă ZERO text input assumption invalidated post-Beta data → expand UI 3-buttons to cover edge cases (NU expand LLM scope core demographic)

---

*Authored 2026-05-03 audit total addendum. Status: LOCKED V1 — partial spec, full sub-sections A-M PENDING addendum source upload `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md`.*
