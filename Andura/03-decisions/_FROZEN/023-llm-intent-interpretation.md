# ADR 023 — LLM Intent Interpretation & Fallback Architecture

**Status:** 🟡 **SUPERSEDED V1 — Anti-RE rule LOCKED V1 PERMANENT 2026-05-11 chat ACASĂ continuation drops ALL text input trigger points**
**Date:** 2026-05-03 (V1 partial spec ingest) · **Superseded:** 2026-05-11 chat ACASĂ continuation Co-CTO autonomous
**See also:** [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.86 + §36.87 (Cognitive Q4 DELOCK §AMENDMENT) + §36.91 (T2 RESOLVED via this ADR) + [[../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE_SPEC]] Q4 + Q11 + Q26 · DIFF_FLAGS §P1-FLAG-1 🟢 RESOLVED + §P1-FLAG-ANTI-RE-RULE-LOCKED-V1-PERMANENT · ADDENDUM archived `📤_outbox/_archive/2026-05/376_ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03_CONSUMED_SUPERSEDED_ANTI_RE.md`

---

## §AMENDMENT 2026-05-11 — SUPERSEDED V1 RATIONALE (Anti-RE rule LOCKED V1 PERMANENT)

ADR 023 V1 scope era 2 trigger points text input (§36.38 Pain text + §36.55.2 Equipment text). Anti-RE rule LOCKED V1 PERMANENT 2026-05-11 chat ACASĂ continuation = ZERO text liber user în UX scope universal — Pain free text REMOVED + Equipment free text REMOVED + F13 rating notes drop V1. ADR 023 V1 scope OBSOLET fundamental. ADDENDUM 2026-05-03 sub-secțiuni A-M PRESERVED ca historical reference + future v1.5+ candidate dacă apar trigger points UX noi care acceptă text input. Cognitive Q4 §AMENDMENT 2026-05-03 DELOCK conditional preserved valid (LLM runtime delock conditional = decision intacta, NU revertită — doar V1 implementation dropped fundament missing trigger points).

**Implications:**
- **V1 implementation Tier 1 (Pain) + Tier 2 (Equipment) DROP** — fundament trigger points text input REMOVED chat-current 2026-05-11
- **Cognitive Q4 DELOCK conditional preserved** — decision LLM runtime permis condiționat rămâne valid, NU revertit. V1 execution path simply has no trigger points to invoke it.
- **ADDENDUM body PRESERVED appendix historical** — disponibil reactivation v1.5+ dacă UX scope re-introduce text input acceptance
- **Cumulative LOCKED unchanged ~722-724** — supersede + reclassification only, NU substantive NEW

---

## §HISTORICAL REFERENCE V1 SUPERSEDED

> Original V1 partial spec content preserved verbatim below (Status flag "LOCKED V1 — partial spec ingest" superseded 2026-05-11 chat ACASĂ continuation per §AMENDMENT above).

### ⚠️ STATUS — PARTIAL SPEC PENDING UPLOAD (HISTORICAL — RESOLVED 2026-05-11)

**Source addendum NU în inbox la momentul ingest:** `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` referenced ca sursă spec complet (13 sub-secțiuni A-M) DAR NU delivered acest ingest.

**Per memory rule SUFLET ANDURA precedent (2026-05-02):** partial ingest procedat per zero-info-loss principle — fabricarea conținutului lipsă INTERZISĂ.

**Action Daniel:** upload `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` în `📥_inbox/` pentru ingest viitor cu full sub-sections A-M. **[RESOLVED 2026-05-11 — addendum uploaded + consumed + superseded per Anti-RE rule; archived `📤_outbox/_archive/2026-05/376_*_CONSUMED_SUPERSEDED_ANTI_RE.md`]**

**Acest fișier conține DOAR conținut verificabil din 3 fișiere ingestate:**
- `HANDOVER_AUDIT_TOTAL_2026-05-03.md` §0 + §7
- `AUDIT_VERIFICATION_REPORT.md` §11
- `AUDIT_IDEATION_REPORT.md` §7

**Sub-sections A-M complete vor fi populate post upload addendum.** **[RESOLVED 2026-05-11 — sub-sections A-M PRESERVED §APPENDIX HISTORICAL REFERENCE V1 below, NU integrate ca spec live per Anti-RE rule supersede.]** Cross-ref `DIFF_FLAGS.md` P1 BLOCKER acest ingest.

---

### Context (V1 HISTORICAL)

Pattern emergent vault Andura post audit consolidat 9 passes: engine arhitectural deterministic solid + nevoie LLM intent interpretation pe 2 trigger points strict (Pain text + Equipment text).

**T2 The Filter** finding (NU codificabil prin regex/NLP determinist) era HIGH acceptable trade-off în audit consolidat. Soluție identificată chat strategic 2026-05-03: LLM Intent layer scope strict cu Bugatti sandbox preserved.

**Cognitive Q4 "ZERO LLM runtime"** (LOCKED V1 anterior) DELOCK condiționat per §36.87 §AMENDMENT 2026-05-03 — LLM permis EXCLUSIV pe 2 trigger points definite în această ADR.

### Decision (V1 HISTORICAL — SUPERSEDED 2026-05-11)

#### Scope STRICT (2 trigger points pre-Beta MANDATORY) — **DROPPED V1 per Anti-RE rule 2026-05-11**

1. **§36.38 Pain Button text input** (Tier 1) — user free-text "Mă doare X în zona Y" → LLM intent classification → routing engine action **[Pain free text REMOVED 2026-05-11 — only 3 predefined buttons "Ceva nu merge" Anti-RE compliant]**
2. **§36.55.2 / §36.81.2 Equipment text input** (Tier 2) — user free-text "Aparat ocupat / lipsă" sau echipament alternativ → LLM intent classification → smart-routing alternatives **[Equipment free text REMOVED 2026-05-11 — only predefined alternatives map Anti-RE compliant]**

**ZERO LLM pe:** volume / intensity / progression / abandonment / RPE / outlier detection / streak counter / mode detection / arbitration / calibration / readiness scoring. Determinism preserved pe core engine paths.

#### Provider Chain (fallback automat) — V1 HISTORICAL

1. **Primary:** Groq llama-3-8b-it (cheap, fast, deterministic via temperature 0.0)
2. **Fallback 1:** Gemini 1.5 Flash PAYG (dacă Groq fails / latency exceed / quota exhausted)
3. **Last resort:** Local Regex Static Keywords (deterministic, offline, ZERO cost)

**Fallback trigger conditions:** failure / latency exceed (>2s) / cost cap reached / network unavailable.

#### Bugatti Sandbox — V1 HISTORICAL

- **Temperature 0.0** — determinism (same input → same output)
- **Structured Outputs JSON schema** — engine consume structured intent enum, NU raw text
- **Regex Fallback local** — last resort path always available offline

#### Sanitizer Client-Side PII — V1 HISTORICAL

- **Whitelist exercise names** + **termeni fitness RO** — păstrate
- **Restul user input** — sanitizat / anonimizat client-side ÎNAINTE trimitere la LLM provider
- **Rezolvă N2 Privacy Clause** finding (audit consolidat)

#### Async Non-Blocking — V1 HISTORICAL

- **NU blochează engine decision path** — Cognitive Q11 latency budget (<300ms total decision) preserved
- **UI feedback** "Procesăm..." indicator dacă LLM call active
- **Fallback la regex** dacă timeout >2s

#### Cache IndexedDB Local — V1 HISTORICAL

- **Hit rate target ~55-60%** (input intent classification repetabil)
- **Token economy reduction ~80%** vs zero-cache scenario
- **Invalidare** la schema changes / user explicit "ignore cache"

#### Cost Cap — V1 HISTORICAL

- **Hard cap €10/lună** — enforcement requires Cloud Functions backend (vezi Q11-INFRA D3 + D6 decision pending Daniel)
- **Soft alert €0.50/zi** + **soft alert €2/săpt** — frontend telemetry
- **Frontend-only soft cap** acceptabil dacă D3 = B Spark plan retain (user can bypass cap manual)
- **Backend Cloud Functions hard enforcement** dacă D3 = A Blaze plan upgrade

#### CDL Audit Trail Extension — V1 HISTORICAL

- **`llm_metadata` field NEW** în CDL entry pentru fiecare LLM call:
  - `provider` (groq / gemini / regex)
  - `latency_ms`
  - `token_count_input` + `token_count_output`
  - `fallback_chain_triggered` (boolean)
  - `cache_hit` (boolean)
  - `cost_estimate_eur`
- **MOAT pillar 3 (Decizii verificabile) preserved** — engine recommendations explainable post-mortem

#### Gigel Test PASS — V1 HISTORICAL

- **Maria 65 / Gigica 35 ZERO text input** — folosesc 3 butoane predefined (Pain Button §36.38 EXT-1 + Equipment alternatives substitutions algorithm §36.81.2)
- **Marius 25 optional "Altceva"** text input → LLM intent (advanced user opt-in) **[Marius opt-in path superseded — Anti-RE rule universal scope drops ALL text input including advanced user]**
- **NU forced text input** pentru core demographic Maria 65 / Gigica 35

### Consequences (V1 HISTORICAL)

#### Positive (V1 HISTORICAL)

- **T2 The Filter RESOLVED** (§36.91) **[V1 path no longer applicable per supersede; T2 RESOLVED stands separately because Anti-RE rule eliminates text input entirely, NU prin LLM intent layer]**
- **Cognitive Q4 DELOCK** (§36.87) — scope strict, NU full LLM pe engine **[DELOCK conditional preserved valid 2026-05-11; V1 execution path simply no longer invoked]**
- **Bugatti sandbox preserved** (temperature 0.0 + structured outputs + regex fallback)
- **Anti-RE preserved** — engine deterministic, LLM doar intent classification **[Anti-RE STRENGTHENED 2026-05-11: ZERO text input universal scope > V1 narrow exception]**
- **MOAT pillar 3 preserved** — CDL `llm_metadata` extension
- **Privacy preserved** — sanitizer whitelist client-side ZERO PII trimis
- **Latency preserved** — async non-blocking, Q11 budget intact
- **Cost preserved** — €10/lună hard cap

#### Negative (V1 HISTORICAL)

- **External provider dependency** — Groq + Gemini availability outside Daniel control
- **Cost monitoring infrastructure** — backend hard cap requires Blaze plan upgrade (D3 + D6 decision pending)
- **Sub-sections A-M full spec PENDING** — implementation cannot start până addendum upload **[Moot 2026-05-11 — V1 implementation dropped fundament]**

#### Risks (V1 HISTORICAL)

- **Provider deprecation:** Groq llama-3-8b-it model lifecycle uncertain post-2026 → fallback chain mitigates
- **Quota exhaust:** dacă Beta cohort heavy text input → cost cap triggered → fallback regex **[Moot 2026-05-11 — zero text input universal]**
- **Whitelist maintenance:** termeni fitness RO + exercise names registry needs ongoing maintenance (NEW-IDEATION-4 audit total ideation)

### Effort Estimate (V1 HISTORICAL — moot per supersede)

- **Implementation Tier 1 (Pain) + Tier 2 (Equipment):** ~6-10h Opus **[DROPPED V1]**
- **Daniel chat strategic refinement:** ~2-3h (already done acest chat — addendum source)
- **Pre-Beta:** mandatory ambele Tier 1 + Tier 2 LIVE **[SUPERSEDED 2026-05-11 — NU mandatory pre-Beta per Anti-RE rule]**

### Pre-Beta Mandatory (V1 HISTORICAL — superseded)

- ✅ ADR LOCKED V1 (acest fișier + §36.86 SSOT) **[Status flip 🟡 SUPERSEDED V1 2026-05-11]**
- ⏳ Sub-sections A-M full spec PENDING addendum upload **[RESOLVED 2026-05-11 — preserved §APPENDIX below]**
- ⏳ Implementation pending Daniel chat strategic D1-D6 decision points + sequencing **[DROPPED V1]**
- ⏳ D3 Cloud Functions Blaze decision (D6 cost monitoring infrastructure depends)
- ⏳ NEW-IDEATION-4 Whitelist maintenance setup

### Cross-References (V1 HISTORICAL)

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

### Reconsideration Triggers (V1 HISTORICAL — preserved as guidance for v1.5+ reactivation)

1. **Provider lifecycle:** Groq llama-3-8b-it deprecated → switch to alternative cheap fast LLM
2. **Cost cap reconsider — UPDATED §36.93 (2026-05-03):** D3 LOCKED B Spark plan retain. Blaze upgrade RESPINS pre-Beta. Reconsider TRIGGERS: (a) revenue confirmed (Founding cap 50 + Standard month 6+ runway); (b) Groq deprecation forced; (c) demand spike >5% Groq free tier (~720 calls/zi → ~250 useri activi). Volum realist 50 useri × 4 sesiuni × 2 LLM calls = 57 calls/zi = 0.4% Groq free tier 14400/zi limit. Cost cap €10/lună din §2.H = paranoia, NU nevoie reală. Bootstrap-aware Bugatti: scale când e problemă reală, NU ipotetică. NEW-IDEATION-5 backend cost monitoring DEFERRED post-revenue. Frontend telemetry acceptable D6=B (depends D3=B).
3. **Beta cohort feedback:** dacă LLM intent classification accuracy <85% → tune prompts / structured outputs schema / fallback regex thresholds
4. **Privacy regulator scrutiny:** dacă RO ANSPDCP raises Article 6/9 GDPR concerns despite sanitizer → review consent flow + transparency disclosure
5. **Maria 65 / Gigica 35 use text input:** dacă ZERO text input assumption invalidated post-Beta data → expand UI 3-buttons to cover edge cases (NU expand LLM scope core demographic)
6. **NEW v1.5+ reactivation trigger 2026-05-11:** dacă apar trigger points UX noi care acceptă text input (e.g., advanced user opt-in feedback channel, coach annotation field, structured complaint flow), atunci ADR 023 V1 spec sub-secțiuni A-M (preserved §APPENDIX HISTORICAL REFERENCE V1 below) devine candidate reactivare. Anti-RE rule scope universal would need delocked separately for any text input re-introduction.

---

## §APPENDIX HISTORICAL REFERENCE V1 (ADDENDUM 2026-05-03 body verbatim — preserved future v1.5+ reactivation candidate)

> **Note 2026-05-11:** Conținut ADDENDUM body §2.A-§2.M preserved verbatim din `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` (archived `📤_outbox/_archive/2026-05/376_ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03_CONSUMED_SUPERSEDED_ANTI_RE.md`). NU integrate ca spec live — Anti-RE rule LOCKED V1 PERMANENT 2026-05-11 drops ALL text input trigger points. PRESERVED ca historical reference + future v1.5+ candidate dacă apar trigger points UX noi.

### §2.A — Scope V1 LOCKED (2 trigger points only)

**A. §36.38 Pain/Discomfort UI** — User apasă "Altceva / Detaliază" → text input liber → LLM extract intent + body_part + severity → engine deterministic ajustare exercițiu.

**B. §36.55.2 Dynamic Substitution UI** — User apasă "Aparat ocupat/lipsă" → folosește bara de căutare liberă în loc de listă → LLM extract equipment_class → injectat ca constraint nou în Smart Routing cascade → rerun deterministic.

**Zone excluse explicit (zero LLM):**
- Abandonment §36.55.4 — exclusiv cronometru pauză + inactivitate
- Mid-Set Adjust — exclusiv butoane incrementare + §36.16 RIR Matrix
- Volume / intensity / progression decisions — exclusiv engine deterministic

### §2.B — Sanitizare Client-Side PII (N2 mitigation)

`client_side_sanitizer.js` rulează ÎNAINTE de orice LLM call:
- Regex stripper: emailuri, numere telefon, localități RO, cuvinte cu majuscule consecutive (nume proprii)
- **Whitelist exercise names + termeni fitness RO** (Bench Press, Squat, Deadlift, RDL, etc.) — preserve, NU strip
- Exemplu: "Sunt Daniel din Giurgiu și mă doare umărul la Bench Press" → `"[REDACTED] și mă doare umărul la Bench Press"`

### §2.C — Bugatti Sandbox (preserve determinism)

1. `temperature: 0.0` — eliminăm creativitatea modelului, same input → same output
2. **Structured Outputs** (JSON Mode / Schema Enforcement) — Groq + Gemini garantează schema. Output invalid → fallback chain
3. **Regex Fallback local** — dacă Groq + Gemini offline / invalid → No-Inference Mode (keyword search local "durere", "ocupat")

### §2.D — Schema V1.1 Strict

```json
{
  "intent": ["discomfort_reported", "equipment_missing", "goal_shift_intent"],
  "body_part": ["shoulder", "upper_back", "lower_back", "knee", "hip", "ankle", "wrist", "elbow", "neck", "chest", "none"],
  "severity": ["low", "high"],
  "equipment_class": ["barbell", "dumbbell", "kettlebell", "resistance_band", "machine", "bodyweight", "cable", "none"]
}
```

Cross-ref Injury Body Region Map A (§36.85 backlog) + ADR 014 equipment registry.

### §2.E — Latency & Execution Flow (async non-blocking)

- LLM call 100% ASYNC. Zero UI freeze.
- Engine deterministic rulează în paralel + încarcă state de bază
- LLM background task → loader inline discret pe input button
- Return JSON 400-800ms → injectat silent în ecranul curent
- **NU sync block UI** (rezolvă latency budget Cognitive Q11 conflict)

### §2.F — Pipeline Execuție + Provider Chain

```
[User Text Input]
       ↓
1. Cache local (IndexedDB) → Found? → instant return JSON ($0, 0ms)
       ↓ Not found
2. Groq llama-3-8b-it (Primary) → Success? → Extract + Save Cache
       ↓ Failed
3. Gemini 1.5 Flash PAYG (Fallback) → Success? → Extract + Save Cache
       ↓ Failed
4. Local Regex / Static Keywords (Last resort) → Extract Mode Fallback
```

### §2.G — Caching Strategy (zero-cost execution)

Cache local IndexedDB normalize text → JSON output. Rate cache realist:
- Pain phrasing: 40-50% (variabilitate mare RO: "mă doare", "mă strânge", "mă trage", "mă înțeapă")
- Equipment phrasing: 70-80% (vocabular tehnic limitat)
- **Average global: ~55-60%**
- Token economy reduction: ~80% trafic vs no-cache

### §2.H — Cost Monitoring & Circuit Breaker

Hard limits multi-window pentru spike protection:
- **€0.50/zi soft alert** (notif Daniel)
- **€2/săpt soft alert**
- **€10/lună HARD CAP** → Circuit Breaker TRIPPED → fallback total Local Regex Mode
- Backend counter token + cost per user per window
- Auto-pause Gemini PAYG dacă Groq rate-limited spike

### §2.I — UI Flow: LLM = Context Injector NU Bypass

LLM-ul NU ia decizii înlocuire exerciții. NU scurtcircuitează cascada deterministă.

```
[Bara căutare liberă]
       ↓
[LLM extract: equipment_class="resistance_band"]
       ↓
[Injectare ca filter în Smart Routing existent]
       ↓
[Rerun cascade biomecanică deterministică]
       ↓
[Algoritm determinist = single decident]
```

### §2.J — CDL Audit Trail Extension

Fiecare LLM call logged în CDL entry standard (Firebase RTDB sync per ADR 011), NU storage separat:

```json
{
  "outcome": {
    "llm_metadata": {
      "llm_processed": true,
      "llm_provider": "groq | gemini | local_regex",
      "llm_latency_ms": 450,
      "llm_intent_extracted": "discomfort_reported"
    }
  }
}
```

Cross-device audit trail preserved per ADR 011 sync model.

### §2.K — Gigel Test Compliance

- **Maria 65 / Gigica 35:** ZERO text tastat. Folosesc exclusiv §36.38 PAIN_DISCOMFORT 3 butoane predefined + §36.55.2 listă echipamente predefined. LLM NU touch acest segment.
- **Marius 25 (Power-User):** opțional "Altceva / Scrie detaliat" → text input → LLM activate.
- LLM = **complement la UI predefined NU replacement**.

### §2.L — Cognitive Q4 §AMENDMENT 2026-05-03

> "ZERO LLM runtime DELOCK condiționat. LLM permis EXCLUSIV pentru intent interpretation (parser limbaj natural → JSON metadata) la 2 trigger points: §36.38 Pain text input + §36.55.2 Equipment text input. Scope strict limitat. Engine deterministic rămâne single decision-maker pentru volume / intensity / progression / substitution / abandonment. Anti-RE preserved. Privacy N2 preserved prin client-side anonymization + free tier providers cu clean ToS (Groq primary + Gemini PAYG fallback)."

**Note 2026-05-11:** Cognitive Q4 §AMENDMENT 2026-05-03 DELOCK conditional **preserved valid** — decision LLM runtime permis conditional rămâne valid, NU revertit. V1 implementation Tier 1+Tier 2 dropped per Anti-RE rule supersede fundament trigger points missing. Cognitive Q4 DELOCK = decision intacta; ADR 023 V1 = execution path no longer invoked.

### §2.M — Status implementation (V1 HISTORICAL)

- **Provider Chain:** Groq llama-3-8b-it (Primary) → Gemini 1.5 Flash PAYG (Fallback) → Local Regex Static Keywords (Last resort)
- **Settings:** temperature 0.0, forced strict JSON schema, structured outputs mode
- **Caching:** IndexedDB local client-side
- **Cost cap:** €10/lună hard cap + €0.50/zi + €2/săpt soft alerts
- **Effort estimat:** ~6-10h Opus implementation + ~2-3h Daniel chat strategic refinement (already done acest chat)
- **Pre-Beta:** mandatory Tier 1 (Pain trigger) + Tier 2 (Smart Routing trigger) ambele LIVE **[SUPERSEDED 2026-05-11 — DROP V1 per Anti-RE rule LOCKED V1 PERMANENT]**

### Ground rules NEW pentru LLM integration (V1 HISTORICAL)

1. **Anti-RE absolut NU se schimbă.** LLM = silent validation, NU push notif, NU mesaj user-facing direct fără engine wrapper.
2. **Determinism preserved pentru core decisions.** LLM = layer adițional NU replacement engine deterministic.
3. **Audit trail mandatory.** Fiecare LLM call = logged în CDL cu input anonymized + output + latency.
4. **Fallback graceful.** Free tier rate-limited → engine continue cu deterministic only, no error user-facing.

---

*Authored 2026-05-03 audit total addendum (partial spec). Status flip 2026-05-11 chat ACASĂ continuation Co-CTO autonomous: **🟡 SUPERSEDED V1** — Anti-RE rule LOCKED V1 PERMANENT 2026-05-11 drops ALL text input trigger points. ADDENDUM body preserved §APPENDIX HISTORICAL REFERENCE V1 future v1.5+ reactivation candidate. Cognitive Q4 §AMENDMENT 2026-05-03 DELOCK conditional preserved valid. P1-FLAG-1 flip 🟢 RESOLVED. Cumulative LOCKED PRESERVED ~722-724 (supersede + reclassification only, NU substantive NEW).*
