# ADDENDUM CHAT STRATEGIC — RECONSIDERĂRI POST-AUDIT CONSOLIDAT

**Date:** 2026-05-03
**Sursă:** Chat strategic Daniel + Claude post-consolidare audit pass 1-9
**Scop:** Suplimentare la `AUDIT_VAULT_CONSOLIDAT_PASS_1-9_2026-05-03.md` cu decizii + reclasificări de finding-uri rezultate din discuție Daniel
**Integrare:** Chat audit grad 2 ingest acest addendum la final + reorganizează findings cu severity/status updated

---

## §1 — RECLASIFICARE FINDING-URI: REZOLVABIL vs ACCEPTABIL TRADE-OFF

Auditul consolidat tratează toate finding-urile uniform ca "issues". Daniel push-back legitim: **NU toate sunt rezolvabile pre-Beta, NU toate sunt bugs.** Reclasificare în 4 buckets:

### A. REZOLVABIL PRE-BETA (must-fix) — ~40-45 finding-uri

Toate CRITICAL (6) + majoritatea HIGH (12-13/15) + MEDIUM cleanup (M1-M4 + DRIFT-1 + DH1-DH2 + spec consolidări TRIPLE-1 + QUADRUPLE-1 + ORPHAN-1).

Effort estimat realist Opus: ~10-15h actual + 5-8h Daniel chat strategic.

### B. REZOLVABIL POST-LAUNCH V1.1 (deferred acceptabil) — ~10-15 finding-uri

- DEAD-1 ADR 021 Faza 2 — depends B2 (T&B) post-launch dacă timeline strâns
- C1-C6 Calibration risks — necesită data reală 100+ useri
- Sprint 4/Wave 6 SensAI features — explicit V1.1 OK
- Anti-RE inventory consolidation — post-launch hygiene

### C. ACCEPTABIL TRADE-OFF PERMANENT (NU se rezolvă, live with) — ~5-8 finding-uri

- **N3 + BACKLOG-1 + R3** — bus factor 1 = pre-revenue acceptat. Daniel solo + Opus adaptive. Post-revenue reconsider hire/co-founder, NU înainte. Rate limit decizii post-launch + SLA explicit "1 dev solo, 48h response critical bugs" în ToS = mitigation parțial.
- **N7 Beta cohort 25-35 din 50 target** — recruitment realitate. Acceptat. Cohort B mai mic (25) cu Beta period extins 6-8 săpt = backup plan.
- **R2 Bugatti perfectionism trap** — trade-off filozofic intentional. Mitigation = Launch Criteria Bugatti measurable (G2).

### D. RECONSIDERATE — DECIZIE DELOCK NEW ⚡

**T2 The Filter** — REZOLVABIL după reconsiderare. Vezi §2.

---

## §2 — DELOCK CANDIDATE: COGNITIVE Q4 "ZERO LLM RUNTIME"

### Context original

**Cognitive Architecture Spec Q4 LOCKED V1:**
> "Reasoning deterministic. NU LLM la runtime. Static dynamic weights audit-able + scope discipline."

Decizia LOCKED cu input din chat-uri Opus precedente — Daniel a confirmat retrospectiv că **acele chat-uri erau halucinante** pe părți. Deci Q4 NU e bătut în cuie.

### Decizie Daniel acest chat

> "Da, tin sa fie free... avand in vedere ca nu producem revenue inca nu merita investitia. Daca putem Gemini free tier fara legal conseq... atunci incercam."

**= LLM runtime ON THE TABLE, NU LOCKED OUT, condiționat de:**
1. Free tier (zero cost pre-revenue)
2. Zero legal consequences (privacy clause N2 NU contradicted)

### Fezabilitate confirmată

**LLM free tier production-ready candidates:**

| Provider | Tier free | Latency | Privacy ToS | Risk |
|----------|-----------|---------|-------------|------|
| Gemini 1.5 Flash | 1500 req/zi | 500ms-1s | "Data may be used for training" | Anonymization mandatory |
| Cloudflare Workers AI (Llama 3.1 70B) | 10k neurons/zi | 1-3s | "No training claim" | Lower risk |
| Groq (Llama 70B) | Generous rate limit | <500ms fast | Limited disclosure | Mid-risk |

**Mitigation legal (rezolvă N2 + privacy concern):**
- **Anonymization aggressive client-side** — engine local strip PII (nume, vârstă raw, locație, kg specific). Trimite features abstracte: `profile_tier="T1+"`, `exercise_category="push"`, `decision_context="plateau_8w"`, `signal_intensity="medium"`.
- **LLM scope limitat — NU fiecare decizie engine = LLM call.** Filter validation only (sample 10-20% decizii audit) sau edge cases unde engine deterministic incertain. Volume scade 10-20× → free tier easy fits Beta cohort 25-35 useri.

### Implicații finding-urile existing

**Rezolvă direct:**
- **T2 The Filter NU codificabil [HIGH]** — devine codificabil. Filter §D = LLM runtime check pe sample decizii. RECLASIFICAT din "acceptable trade-off permanent" la "REZOLVABIL pre-launch".
- **§A Save the week silent** (parțial) — LLM poate face proactivity intelligence layer fără push notif (silent recalibrate cu LLM judge).

**ADR 023 LLM Intent Interpretation & Fallback Architecture — LOCKED V1 acest chat:**

(Numbering ADR 023 confirmed: ADR 021 = Calibration Drift LIVE, ADR 022 = ORPHAN-1 collision pending fix → ADR 023 next free slot)

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

### §2.M — Status implementation

- **Provider Chain:** Groq llama-3-8b-it (Primary) → Gemini 1.5 Flash PAYG (Fallback) → Local Regex Static Keywords (Last resort)
- **Settings:** temperature 0.0, forced strict JSON schema, structured outputs mode
- **Caching:** IndexedDB local client-side
- **Cost cap:** €10/lună hard cap + €0.50/zi + €2/săpt soft alerts
- **Effort estimat:** ~6-10h Opus implementation + ~2-3h Daniel chat strategic refinement (already done acest chat)
- **Pre-Beta:** mandatory Tier 1 (Pain trigger) + Tier 2 (Smart Routing trigger) ambele LIVE

### Ground rules NEW pentru LLM integration

1. **Anti-RE absolut NU se schimbă.** LLM = silent validation, NU push notif, NU mesaj user-facing direct fără engine wrapper.
2. **Determinism preserved pentru core decisions.** LLM = layer adițional NU replacement engine deterministic.
3. **Audit trail mandatory.** Fiecare LLM call = logged în CDL cu input anonymized + output + latency.
4. **Fallback graceful.** Free tier rate-limited → engine continue cu deterministic only, no error user-facing.

---

## §3 — CLARIFICARE TIME-1 BAYESIAN CONVERGENCE [MEDIUM]

Auditul consolidat marca TIME-1 ca "Beta 4 săpt = ZERO convergență validation. Calibration impossible Beta." Daniel cerut clarificare.

**Realitate cu mitigation:**
- **Synthetic Demographic Prior (ADR 017)** = 500 profile × 90 zile sintetic = pre-calibrare ~70-80% ÎNAINTE Beta cohort real
- Status implementation Demographic Prior = **DEMO-1 finding unverified** (Pass 8) — verify mandatory pre-Beta
- DEMO-1 verify confirms implementation → TIME-1 mitigated semnificativ
- Beta 4 săpt cu prior pre-calibrat → engine acceptable quality (NU ideal, dar NU disaster)

**Status revizuit TIME-1:** **MEDIUM acceptable cu DEMO-1 verify done.** NU mai e "impossible" ci "sub-optimal but acceptable V1, refines post-launch".

---

## §4 — CLARIFICARE BUS FACTOR 1 (N3 + BACKLOG-1 + R3)

Daniel context:
> "Da nu ne permitem pana nu facem revenue... deci Opus adaptive pana incepem sa producem bani... daca producem... dupa ne gandim la hire's"

**Decizie LOCKED:** Bus factor 1 = ACCEPTAT TRADE-OFF pre-revenue. Mitigation:
- **Opus adaptive solo** velocity = sustainable când hyperfocus, sloppy săpt acceptat ca cost
- **SLA documented în ToS** — "1 dev solo, 48h response critical bugs, NU 24/7 support"
- **Rate limit post-launch §36.86** propus — max 1-2 INSIGHTS_BACKLOG items / lună post-V1
- **Quality vault SSOT** = mitigation parțial bus factor (alt dev poate continue teoretic)

**Reconsider trigger:** primul $X revenue (definit Daniel) → hire/co-founder/contractor.

**Status:** ACCEPTABIL PERMANENT pre-revenue. NU pre-Beta blocker.

---

## §5 — CLARIFICARE CALIBRATION 95%

Daniel target: "Calibration C-uri - da, dar trebuie sa fie 95%."

**Realitate fizică pre-Beta:**
- 95% achievable = post-launch luna 3-6 cu 100+ useri activi (data reală)
- Pre-Beta ceiling realist = **85-90%** (NU 95%)
- Synthetic NU înlocuiește data reală — aproximează

**Plan pre-Beta calibration 85-90%:**

**A. Synthetic Demographic Prior scaled (ADR 017)**
- Pre-calibrare AA thresholds + MMI parameters + Voice Tier weights pe 500-1000 profiles
- Effort: 8-12h Opus dacă DEMO-1 verify shows incomplete implementation
- Mandatory pre-Beta

**B. Observation mode prima 2 săpt Beta**
- Engine logează signals + computes recommendations DAR NU intervine activ user-facing
- Săpt 3-4 Beta = recalibrate thresholds pe data reală cohort + activate interventions
- Mitigation false positive risk Maria 65 cohort

**E. Expert validator paid (€500-1000 one-time)**
- 1 strength coach senior RO sau Jeff-Nippard-tier review sample 50 decizii engine pre-Beta
- Quality check uman peste auto-calibration
- Outcome: report findings + recommended threshold adjustments
- Acceptable cost pre-revenue (one-time, NU recurring)

**Plan post-launch convergență 95%:**
- Luna 3 review threshold real performance vs synthetic predictions
- Luna 6 reconsidere AA tier triggers cu 100+ useri data
- Continuous calibration loop institutionalized

**Status calibration:** Pre-Beta 85-90% achievable cu A+B+E plan. 95% post-launch luna 3-6 obligatoriu. NU "rezolvabil pre-Beta 100%", DAR mitigation strategy clear.

---

## §6 — IMPLICAȚII PENTRU AUDIT GRAD 2

### Reclasificări mandatory

| Finding | Status original | Status NEW |
|---------|----------------|------------|
| T2 The Filter NU codificabil | HIGH acceptable trade-off | **REZOLVAT prin ADR 023 LLM Intent Interpretation LOCKED V1** |
| §A Save the week silent | CRITICAL nerezolvat | HIGH parțial mitigated (engine deterministic + ADR 023 enrichment intent only, NU proactivity layer V1) |
| TIME-1 Bayesian convergence | MEDIUM impossible Beta | MEDIUM acceptable cu DEMO-1 verify |
| N3 + BACKLOG-1 + R3 bus factor | MEDIUM/HIGH risk | ACCEPTABLE TRADE-OFF pre-revenue (locked decision) |
| Calibration C-uri | LOW post-Beta | MEDIUM pre-Beta cu plan A+B+E (85-90% achievable) |
| ORPHAN-1 ADR 022 collision | HIGH unresolved | HIGH unchanged — ADR 023 ID liber pentru fix |
| Cognitive Q4 ZERO LLM runtime | LOCKED V1 absolute | **DELOCK confirmed prin §AMENDMENT 2026-05-03 (vezi §2.L)** |

### Finding-uri NEW propuse pentru Faza 2 ideation

1. ~~**ADR_LLM_FILTER_INTEGRATION_V1**~~ = **DONE — ADR 023 LOCKED V1 acest chat (vezi §2 complet specificat)**
2. **Anonymization PII client-side schema** = **DONE — specificat în ADR 023 §2.B cu whitelist exercise names + termeni fitness RO**
3. **Expert validator coach paid €500-1000** = priority MEDIUM ideation pre-Beta. Resurse externe NU în vault current.
4. **Observation mode prima 2 săpt Beta** = priority HIGH adjacent calibration plan. NU în vault current.
5. **SLA documented în ToS** = priority LOW pre-launch. Bus factor 1 disclosure.
6. **NEW: Whitelist exercise names + termeni fitness RO maintenance** = adjacent ADR 023 §2.B. Necesită registry cross-ref ADR 014. Effort ~1-2h.
7. **NEW: Cost monitoring backend infrastructure** = adjacent ADR 023 §2.H. Necesită Cloud Functions sau echivalent pentru hard cap enforcement (vezi Q11-INFRA finding Pass 7 — Spark plan vs Cloud Functions gap). Effort ~3-5h.

### Verification target audit grad 2

Cross-verify cu vault SSOT:
- Cognitive Q4 wording exact (confirm "ZERO LLM runtime" vs nuance)
- Privacy clause N2 wording exact (confirm scope "NU partajat terți")
- ADR 017 Demographic Prior implementation status real (folder count, runner.js wiring)
- Câmpuri profile sincronizate Firebase vs locale only

---

## §7 — DECIZII LOCKED ACEST CHAT (pentru handover global vault)

1. **ADR 023 LLM Intent Interpretation & Fallback Architecture LOCKED V1.** Spec complet specificat în §2 acest addendum. 13 sub-secțiuni A-M. Provider chain Groq → Gemini → Local Regex. Scope strict 2 trigger points (§36.38 Pain text + §36.55.2 Equipment text). Anti-RE preserved. Privacy N2 preserved prin client-side sanitizer. **Status:** LOCKED V1.
2. **Cognitive Q4 §AMENDMENT 2026-05-03 — DELOCK confirmed.** "ZERO LLM runtime" superseded de scope strict ADR 023. **Status:** LOCKED amendment.
3. **Bus factor 1 = ACCEPTABLE TRADE-OFF pre-revenue.** Hire/co-founder reconsider post-revenue. **Status:** LOCKED.
4. **Calibration target pre-Beta = 85-90%, NU 95%.** Plan A+B+E. 95% post-launch obligatoriu luna 3-6. **Status:** LOCKED reality check.
5. **TIME-1 Bayesian status revizuit MEDIUM acceptable cu DEMO-1 verify.** **Status:** LOCKED reclassification.
6. **T2 The Filter REZOLVAT prin ADR 023.** Originally HIGH acceptable trade-off → CLOSED via LLM intent interpretation. **Status:** RESOLVED.

---

🦫 **Addendum complete + ADR 023 LOCKED V1 specificat. Integrare în audit grad 2 după Faza 1 + Faza 2 + reordonare findings cu severity/status updated. ~6 finding-uri reclasificate, 1 DELOCK confirmed (Cognitive Q4), 1 ADR major LOCKED V1 (ADR 023 LLM Intent Interpretation), T2 RESOLVED, 7 finding-uri NEW/adjacent Faza 2 ideation.**
