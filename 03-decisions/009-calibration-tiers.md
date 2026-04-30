# 009. Calibration Tiers for User Maturity

**See also:** [[DECISION_LOG]] | [[CTX_ALLLOGS_AUDIT_1_5]] | [[ENGINE_ARCHITECTURE]] | [[003-double-progression-engine]]

## Status
Accepted (amended 2026-04-30 — see §AMENDMENT 2026-04-30 below for SSOT clarification: this ADR's 5-level system is the **`calibration_confidence`** axis. The orthogonal **`engine_tier`** axis (T0/T1/T2 — voice weighting, Cognitive Arch R8/Q15) is a separate dimension)

## Context
The coaching engine must work correctly for a brand-new user (0 sessions) as well as
for a seasoned user with 2 years of history. Without tier gating:

- A user with 2 gym sessions in 56 days saw "Marți 88% skip rate, Joi 100%" — false
  positives from patternLearning counting calendar occurrences as scheduled sessions.
- Cold-start users received no proactive guidance because pattern/stagnation engines
  returned empty results rather than population-prior recommendations.
- Expensive engines (responseProfile, weaknessDetector) ran on every page load even
  with 3 log entries, wasting compute and returning meaningless results.

## Decision

5-tier calibration system determined by **days since first session** AND **unique
session count** (whichever produces the lower tier wins — conservative):

| Tier            | ID | Days   | Sessions | Patterns | Weak Group | Stagnation | Prediction | Profile | Rolling Window |
|-----------------|----|--------|----------|----------|------------|------------|------------|---------|----------------|
| COLD_START      | 0  | < 7    | < 3      | off      | off        | off        | off        | off     | —              |
| INITIAL         | 1  | 7–28   | 3–12     | high (≥70%)| off     | off        | off        | off     | —              |
| PERSONALIZING   | 2  | 28–90  | 12–40    | med (≥60%)| on       | on         | on         | off     | —              |
| PERSONALIZED    | 3  | 90–180 | 40–80    | std (≥50%)| on       | on         | on         | on      | —              |
| OPTIMIZED       | 4  | 180+   | 80+      | low (≥45%)| on       | on         | on         | on      | 6 months       |

**Recalibration frequency** drops with maturity:
- COLD_START: per_session (triggered on session complete, not timer)
- INITIAL: daily (≥ 20h interval)
- PERSONALIZING / PERSONALIZED: weekly (≥ 7 days)
- OPTIMIZED: monthly_or_trigger (≥ 30 days, or forced by PR/injury/break events)

**Cold start is not silence.** COLD_START users receive a `generateColdStartSession()`
based on onboarding (experience, goal) using population-prior starting weights. This
prevents the "no recommendations on day 1" problem.

**Calibration banner** in the coach UI: COLD_START and INITIAL users see a purple
"🧠 Inițializare / Calibrare inițială" banner explaining the learning phase. Banner
disappears at PERSONALIZING and above.

## Consequences

### Positive
- Zero false positives on pattern detection for new users (gates off entirely)
- New users get intelligent, safe starting weights from day 1
- Expensive engines (responseProfile, weaknessDetector) only run when sufficient data exists
- Rolling window at OPTIMIZED prevents old sessions from skewing recommendations
- Transparency: banner informs user the system is still learning
- Recalibration cost scales with tier: cheap for cold start, rare for optimized

### Negative
- 5-tier config adds code surface area
- Unit test matrix grows: every engine needs cold_start + optimized test cases
- `detectCalibrationLevel` is a pure function on `ctx.allLogs` — inaccurate if logs
  are filtered elsewhere before reaching the director

---

## AMENDMENT 2026-04-30 — Tier System SSOT (engine_tier + calibration_confidence ortogonale)

**Status:** Accepted
**Date:** 2026-04-29 (chat strategic Opus 4.7) → formalized 2026-04-30 Sprint 1 autonomous
**Amendment to:** §Decision (above) — clarifies orthogonality with Cognitive Architecture engine_tier axis
**See also:** [[COGNITIVE_ARCHITECTURE_SPEC_v1]] | [[PRODUCT_STRATEGY_SPEC_v1]] | [[018-engine-extensibility-architecture]] | [[DECISION_LOG]]
**Cross-ref audit:** AUDIT_5000Q Q-0182 (3-tier vs N-level system confusion)

### Context (Amendment)

`AUDIT_5000Q` Q-0182 a flagged confuzie aparentă între două sisteme de "tier" descrise în spec-uri:

- **COGNITIVE_ARCHITECTURE_SPEC_v1** (R8 + Q15): sistem **3-tier** (T0 / T1 / T2) folosit pentru voice weighting (REALTIME% / HISTORICAL% / PROJECTION%) și gating cold-start onboarding.
- **ADR 009 (`calibration-tiers`)**: sistem **5-level** (COLD_START → INITIAL → PERSONALIZING → PERSONALIZED → OPTIMIZED) folosit pentru pattern learning gates, expensive engines on/off, recalibration frequency, rolling window.

La citire superficială pare contradicție ("sunt 3 sau 5/6 tiers?"). În realitate, **NU sunt contradictorii** — sunt **2 dimensiuni ortogonale** care reprezintă două axe distincte ale maturității user-ului.

Decizia lock-uită în chat strategic 2026-04-29 (handover integrat în prompt Sprint 1) formalizează separarea explicită a celor două dimensiuni ca SSOT pentru toate spec-urile + cod future.

### Decision SSOT (Amendment)

#### Două axe ortogonale

##### Axa 1 — `engine_tier` (data volume axis)

**Domeniu:** `T0` | `T1` | `T2`

**Semnificație:** cantitatea de date acumulate de user (sesiuni logate). Controlează **voice weighting** în Arbitrator.

**Mapare boundaries (Cognitive Arch Q15):**

| Tier | Sesiuni | Voice weighting (R8) |
|------|---------|----------------------|
| T0 (Cold) | 0–4 | REALTIME 100% |
| T1 (Warming) | 5–20 | REALTIME 70% / HISTORICAL 25% / PROJECTION 5% |
| T2 (Calibrated) | 21+ | HISTORICAL 60% / REALTIME 30% / PROJECTION 10% |

**De ce această axă există:** voice-urile au nevoie de date istorice pentru a fi useful. La T0 zero history → HISTORICAL inutil. La T2 ai 21+ sesiuni → HISTORICAL fiabil să devină dominant.

**Cum se calculează:** session count integer `unique_session_count`. NU days, NU calibrare confidence — pur volum date.

##### Axa 2 — `calibration_confidence` (signal quality axis)

**Domeniu:** `COLD_START` → `INITIAL` → `DEVELOPING` → `PERSONALIZING` → `PERSONALIZED` → `OPTIMIZED`

**Semnificație:** nivelul de încredere statistică în pattern-urile detectate. Controlează **pattern learning gates**, expensive engines (responseProfile, weaknessDetector), recalibration frequency, rolling window.

**Mapare actuală (ADR 009 active code):**

| Level | ID | Days | Sessions | Patterns | Stagnation | Profile |
|-------|----|------|----------|----------|------------|---------|
| COLD_START | 0 | < 7 | < 3 | off | off | off |
| INITIAL | 1 | 7–28 | 3–12 | high (≥70%) | off | off |
| PERSONALIZING | 2 | 28–90 | 12–40 | med (≥60%) | on | off |
| PERSONALIZED | 3 | 90–180 | 40–80 | std (≥50%) | on | on |
| OPTIMIZED | 4 | 180+ | 80+ | low (≥45%) | on | on |

**De ce această axă există:** confidence statistică ≠ volum date. User cu 80 sesiuni dar variance înalt (yo-yo profile) NU are aceeași încredere pattern detection ca user cu 80 sesiuni stabile (strategic profile). Calibration confidence reflectă **calitatea signal-ului**, NU cantitatea sesiunilor.

**Cum se calculează:** `detectCalibrationLevel(ctx.allLogs)` — pure function pe `days_since_first_session` AND `unique_session_count`, conservative (whichever tier wins lower).

#### Mapping matricea engine_tier × calibration_confidence

**18 stări teoretic** (3 × 6), majoritatea practice nu sunt populate simultan, dar sunt valide:

| | COLD_START | INITIAL | DEVELOPING | PERSONALIZING | PERSONALIZED | OPTIMIZED |
|---|---|---|---|---|---|---|
| **T0** (0–4) | ✅ initial state | rare (alergie cold-start, dar few sessions) | unlikely | impossible* | impossible* | impossible* |
| **T1** (5–20) | impossible* | ✅ typical onboarding | ✅ typical onboarding | possible (high variance early) | unlikely | impossible* |
| **T2** (21+) | impossible* | possible (yo-yo gap) | possible (variance) | ✅ typical mature | ✅ typical mature | ✅ ideal mature |

\* "impossible" = inconsistent state — code defensiv să detecteze și log warning Sentry pentru investigation. Valid runtime states = celulele marcate ✅ + cele "possible" + "unlikely" (rare dar legitim, NU bug).

**Beneficiu mapping:** un user nou (T0 + COLD_START) e clearly defined. Un user mature optimal (T2 + OPTIMIZED) la fel. Ambiguitatea apare doar în zonele de tranziție (T1 + DEVELOPING/PERSONALIZING) — exact unde user-ul e cel mai sensibil la decizii engine, deci semantic explicit ajută la debugging.

#### Forward-compatibility — N axes future

SSOT-ul stabilește pattern-ul "axe ortogonale" ca extensibil. Future axes plausible (NU în scope v1):

- `fiber_calibration_per_exercise` — encoding pe ce exerciții fiber type composition deja inferred (FAZA 4 task)
- `nutrition_calibration_confidence` — nivelul de încredere pe Bayesian Nutrition Inference (Sprint 4 task per HANDOVER §2)
- `sleep_inference_confidence` — confidence pe sleep proxy (readiness emoji + post-RPE) per HANDOVER §1
- `injury_risk_calibration` — encoding cumulative joint stress modeling
- `recovery_response_calibration` — confidence per individual recovery curve

**Pattern uniform:** orice nouă axă declarată ca câmp explicit pe `userProfile` sau `coachContext`, cu boundaries documented separat (NU inline în engine code), cu `_meta` rationale per axis (Cognitive Arch §A — JSON Meta-Data Requirement).

**NU adăugăm axe noi în Sprint 1.** Această amendment doar formalizează arhitectura ca extensibilă — implementation per axă vine în spec ADR-uri separate.

### Migration Plan (Amendment)

#### Sprint 1 (acest run) — DOCS ONLY

- ✅ Această ADR amendment scrisă
- ✅ Cross-references update: ADR 009 + COGNITIVE_ARCHITECTURE_SPEC_v1 + PRODUCT_STRATEGY_SPEC_v1 vor primi cross-ref la această amendment
- ❌ **NU code refactor.** Cod actual folosește deja cele 2 axe implicit (R8 voice weighting + ADR 009 calibration_level), doar fără naming SSOT explicit.

#### Sprint 2 (separate session) — DECISION REQUIRED

Două decizii Sprint 2 needed:

1. **DEVELOPING tier — add or remove?**

   **Discrepanță detectată:** handover SSOT (chat strategic 2026-04-29) listează 6 nivele cu DEVELOPING între INITIAL și PERSONALIZING. ADR 009 active code implementează 5 nivele fără DEVELOPING. Vezi §"Push-back / Issues found" în SPRINT1_EXECUTION_REPORT pentru detalii.

   Decizii viable:
   - **Option A:** Add DEVELOPING tier (între INITIAL și PERSONALIZING). Boundaries propose: 14–60 zile / 6–24 sesiuni. Effort: ~8-12h cod + tests update. Justificare: more granularity on transition phase critical pentru AA detection calibration.
   - **Option B:** Revise SSOT la 5 nivele (drop DEVELOPING from amendment). Effort: 0h. Justificare: existing system funcționează, DEVELOPING mai mult conceptual decât practic util.

   **Recommendation Co-CTO:** Option A justifiable doar dacă tier-ul DEVELOPING are utility distinct de INITIAL/PERSONALIZING (ex: AA detection thresholds diferite). Altfel YAGNI — Option B preferred pentru launch v1.

2. **Code refactor renaming — when?**

   Cod actual folosește `calibrationLevel` ca nume canonical (vezi `src/engine/calibration.js`, ADR 011 §context.calibrationLevel). NU reflectă cele 2 axe distinct. Refactor SSOT:
   - Rename `calibrationLevel` → `calibration_confidence` (snake_case JSON-friendly) sau `calibrationConfidence` (camelCase JS-conventional)
   - Add explicit `engine_tier` field în context (currently inferred din session count în R8 logic)
   - Update CDL schema: `context.engineTier` + `context.calibrationConfidence` (vs current single `calibrationLevel`)
   - Schema migration runner ADR 018 §4 → migration `v_X→v_Y` versioning bump

   **Effort estimate:** 4-8h refactor + tests + migration runner. **NU Sprint 1 scope.**

#### Sprint 3+ — Forward-compatible axes

Per HANDOVER 2026-04-29 §2 (Bayesian Nutrition) + §1 (Sleep inference): adăugarea axelor `nutrition_calibration_confidence` + `sleep_inference_confidence` follow același pattern. Build cu pattern uniform = zero rework future.

### Consequences (Amendment)

#### Positive

- **Zero ambiguity SSOT.** "T0/T1/T2" și "COLD_START → OPTIMIZED" referă explicit la 2 lucruri diferite.
- **Audit-friendly.** Q-0182 closed (cross-ref AUDIT_5000Q tracking).
- **Forward-compatible** cu N axes future (nutrition, sleep, fiber calibration, etc.) fără rework arhitectural.
- **Tooling generalize-able.** Future debug UI poate afișa toate axele uniformly.
- **CDL schema clarity.** Engine context snapshot face explicit ce axă în ce stare la decizie time.

#### Negative

- **Documentation surface area** crește (orice nouă axă = update cross-references multiple).
- **Code refactor cost deferred.** Sprint 2 va necesita migration runner + tests update — Sprint 1 nu rezolvă cost-ul, doar documentează.
- **Discrepanță DEVELOPING** rămâne open Sprint 2 decision.

#### Risks

- **Documentation drift.** Dacă viitoarele ADR-uri uită cross-ref aceasta amendment, confuzia 3-tier-vs-5-level reapare. Mitigation: link uniform în orice ADR future care referă "tier".
- **Code-vs-spec divergence.** Cod actual NU folosește naming SSOT. Risk: developer (Claude Code Sonnet sau Daniel) introduce un al 3-lea concept "tier" fără să-l declare ca axă nouă. Mitigation: spec discipline check în code review checklist (Sprint 2+ work).

### Cross-references update needed (Amendment)

Files care vor primi cross-ref la această amendment în Sprint 1:

- `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` (acolo unde menționează tier)
- `04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md` (R8, Q15, R20)
- `03-decisions/009-calibration-tiers.md` (header — link la amendment) ← acest fișier (amendment inline acum)
- `03-decisions/DECISION_LOG.md` (entry nou)

Alte ADR-uri care folosesc `calibrationLevel` semantic (NU update Sprint 1, doar inventar):
- ADR 011 §context.calibrationLevel
- ADR 013 §thresholds (calibration impacts AA detection sensitivity)
- ADR 014 §profile typing reconciliation timing

---

*Amendment authored 2026-04-30 Sprint 1 autonomous run Opus 4.7. Sign-off implicit via handover lock 2026-04-29 chat strategic Daniel + Claude Opus. Consolidated inline 2026-04-30 per VAULT_RULES §3.1 (update-in-place > create-new).*
