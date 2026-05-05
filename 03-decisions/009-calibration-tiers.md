# 009. Calibration Tiers for User Maturity

**See also:** [[DECISION_LOG]] | CTX_ALLLOGS_AUDIT_1_5 (audit closed) | [[COGNITIVE_ARCHITECTURE_SPEC_v1]] | [[003-double-progression-engine]]

## Status
Accepted (amended 2026-04-30 — see §AMENDMENT 2026-04-30 below for SSOT clarification: this ADR's 5-level system is the **`calibration_confidence`** axis. The orthogonal **`engine_tier`** axis (T0/T1/T2 — voice weighting, Cognitive Arch R8/Q15) is a separate dimension. **D1 routing 2026-04-30 evening RESOLVED: ADD DEVELOPING tier → canonical 6-tier (COLD_START → INITIAL → DEVELOPING → PERSONALIZING → PERSONALIZED → OPTIMIZED). Sprint 4 implementation ~8-12h.** §Decision table below = active code 5-tier pre-D1; canonical post-D1 6-tier in §AMENDMENT §Migration Plan §Sprint 2 #1 RESOLVED block.)

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

1. **DEVELOPING tier — add or remove?** → ✅ **RESOLVED 2026-04-30 evening (D1 routing locked):**

   **Decision:** Option A — **ADD DEVELOPING tier** (între INITIAL și PERSONALIZING). Canonical 6-tier system post-D1.

   **Rationale Daniel:** "dezvoltam dupa ce terminam cu restul, de ce sa ne dam in cap dupa cu testari?" — Sprint 4 implementation post-Sprint 3 full (T&B + Multi-tenant + Calibration Drift), zero-disruption to ongoing pre-launch work.

   **Sprint timing:** **Sprint 4 implementation ~8-12h** cod + tests update + schema migration runner (ADR 018 §4 v_X→v_Y bump). Boundaries: 14–60 zile / 6–24 sesiuni (between INITIAL 7–28 / 3–12 and PERSONALIZING 28–90 / 12–40).

   **Canonical 6-tier table (post-D1, target Sprint 4 implementation):**

   | Level | ID | Days | Sessions | Patterns | Stagnation | Profile |
   |-------|----|------|----------|----------|------------|---------|
   | COLD_START | 0 | < 7 | < 3 | off | off | off |
   | INITIAL | 1 | 7–28 | 3–12 | high (≥70%) | off | off |
   | **DEVELOPING** | **2** | **14–60** | **6–24** | **high (≥65%)** | **off** | **off** |
   | PERSONALIZING | 3 | 28–90 | 12–40 | med (≥60%) | on | off |
   | PERSONALIZED | 4 | 90–180 | 40–80 | std (≥50%) | on | on |
   | OPTIMIZED | 5 | 180+ | 80+ | low (≥45%) | on | on |

   **Cross-refs canonical:** [[DECISION_LOG]] §2026-04-30 evening D1 + [[HANDOVER_GLOBAL_2026-04-30_evening]] §5 D1 + [[021-calibration-drift-reconciliation]] §Decision SSOT (referențiază 6 nivele ordering enum max-merge).

   **Status active code:** §Decision tabel (lines 24-30 of original §Decision section) reflects 5-tier ID 0-4 active code pre-D1. **Sprint 4 task** = code refactor ID renumber (DEVELOPING=2, PERSONALIZING=3, PERSONALIZED=4, OPTIMIZED=5) + schema migration runner pentru existing users (auto-bucket per session_count + days threshold).

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
- ~~**Discrepanță DEVELOPING** rămâne open Sprint 2 decision.~~ → **RESOLVED 2026-04-30 evening (D1 routing):** ADD DEVELOPING (Option A) = 6 nivele canonical. Sprint 4 implementation ~8-12h. Vezi §Migration Plan §Sprint 2 #1 RESOLVED block above + [[DECISION_LOG]] §2026-04-30 evening D1.

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

---

## §AMENDMENT 2026-05-05 birou after — Convergence Guard "T2 Unlock" Behavioral Validation Rule (NEW arhitectural extension cross-cutting)

**Status:** LOCKED V1 chat strategic 2026-05-05 birou after Daniel + Claude (surfaced mid-Engine #3 Bayesian Nutrition Inference spec session). Cross-cutting architectural extension — applies to ALL tier transitions T1→T2, NU Engine #3 specific.

**Authority:** Daniel push-back fundamental seminal: *"T2 = Behavioral Validation NOT just statistical convergence"* — engine trebuie observe self-report aliniază realitate biologică CDL ÎNAINTE adaptări agresive. Eu (Claude) am gândit pure math (variance σ reducere thresholds), Daniel a articulat scope adevărat T2 = behavioral validation. Formula final post 5 iterations refinement.

### Context (Amendment)

**Original ADR 009 + Amendment 2026-04-30 SSOT:**
- T0 = COLD_START state (no behavioral data, demographic prior baseline)
- T1 = adapting state (initial observations, conservative adjustments)
- T2 = OPTIMIZED state (high confidence, aggressive adaptations enabled)

**Gap identified mid-Engine #3 spec session:** T2 unlock criteria așa cum era articulat = pure statistical (variance σ² reducere threshold). Daniel push-back: insufficient — engine poate ajunge la "convergence statistic" pe self-report data care NU aliniază realitate biologică (Gigel ignoring pain pentru T2 progress = "Bugatti hits guardrail real" anti-pattern).

**Decision:** T2 unlock criteria extend cu **Behavioral Validation conditions** — engine trebuie observe (a) self-report executions actually occur cu high adherence (volume_adherence_vs_pain_adjusted ≥ 80%) și (b) low Pain-Aware session frequency (max 2 din ultimele 10) ÎNAINTE unlock T2.

### Decision SSOT (Amendment)

**T2 Unlock Formula final post 5 iterations refinement:**

```
T2 Unlock = (
  Statistical Convergence: (
    30% reducere σ²(prior_t-1, posterior_t)
    OR
    σ < MAX(10% kcal_baseline, 200 kcal absolute floor)
    OR
    σ < 5% body_weight proportional
  )
)
AND (
  Behavioral Validation: (
    N ≥ 10 sesiuni cu (outcome.executed && volume_adherence_vs_pain_adjusted ≥ 80%)
    AND max 2 Pain-Aware sesiuni din ultimele 10
  )
)
```

**Rationale per condition:**

**Statistical Convergence layer (Engine-specific, exemplificat cu Engine #3 nutrition):**
- σ² 30% reducere = primary statistical convergence signal
- σ < MAX(10% kcal_baseline, 200 kcal absolute floor) = pragmatic noise floor (food tracking realitate ±200 kcal natural — Daniel push-back pragmatic protejare Maria 65)
- σ < 5% body_weight proportional = scale for very-low-kcal-baseline edge cases (small frame Maria 65)

**Behavioral Validation layer (Cross-cutting, applies all engines):**
- N ≥ 10 sesiuni minimum statistical power (avoid premature unlock single-batch flukes)
- volume_adherence_vs_pain_adjusted ≥ 80% — Daniel push-back rejection brittle deviation: swap bar→gantere = signal metabolic VALID, NU penalize substitution. Adherence metric protects against gaming engine via partial-skip patterns.
- max 2 Pain-Aware sesiuni din ultimele 10 = anti-T2-progress-via-pain-ignoring guardrail

### Pain-Aware Definition (Hybrid Spec V1)

**(a) STRICT user-triggered Pain Button only** — NU engine proactive:
- DELOAD modifiers (Engine #4) NU mark `pain_aware: true`
- Energy DOWN modifiers (Engine #5) NU mark `pain_aware: true`
- Goal phase modifiers (Engine #2) NU mark `pain_aware: true`

Rationale: clean signal monitor only USER FRICTION. Decoupling safety/reward via Clean Signal rule (Invariant 5 Medical Safety protect). Engine proactive adjustments = safety mechanism, NU friction signal — would conflate guardrail activation cu user pain experience.

**(i) BINARY V1** — any Pain Button click during session → entire session marked `pain_aware: true`. Granularity = session-level, NU set-level.

**Forward-compat v1.5 silent vector preserved:**
```
CDL session entry extension (additive ZERO schema migration):
  pain_aware: boolean,                    // V1 binary session-level
  pain_trigger_set: [int],                // V1 collect silent (NOT acted upon)
                                          // V1.5 threshold rule (>50% sets affected
                                          //   = stricter T2 gate / dedicated handling)
```

V1 = collect `pain_trigger_set` silent în CDL metadata, NOT acted upon. V1.5 retroactive aware via vector availability — threshold rule activation date-bounded forward (legacy V1 sessions = binary only, acceptable trade-off per Daniel reality lock).

**UX wording Pain Button preserve EXACT:**
> "Siguranța e pe primul loc. Am ajustat restul sesiunii."

ZERO T2 disclosure (anti-regret psychology + anti-behavioral conditioning Gigel ignoring pain pentru T2 progress = "Bugatti hits guardrail real" Daniel articulation).

### Cross-cutting Applicability (NU Engine #3 specific)

This Behavioral Validation layer applies to **ALL T1→T2 tier transitions across ALL engines**:

| Engine | Statistical Convergence layer | Behavioral Validation layer |
|--------|-------------------------------|----------------------------|
| Engine #1 Periodization | σ²(volume_landmarks_inferred) reducere | Same Behavioral Validation rule |
| Engine #2 Goal Adaptation | σ²(phase_likelihoods) reducere | Same Behavioral Validation rule |
| Engine #3 Bayesian Nutrition | σ²(kcal_baseline_posterior) reducere | Same Behavioral Validation rule |
| Engine #4 Deload Protocol | σ²(recovery_signal_aggregate) reducere | Same Behavioral Validation rule |
| Engine #5 Energy Adjustment | σ²(readiness_emoji_inferred) reducere | Same Behavioral Validation rule |
| Future Engines #6 #7 | TBD spec session | Same Behavioral Validation rule |

**Pattern:** Each engine defines its own Statistical Convergence layer (σ² reducere on engine-specific posterior). Behavioral Validation layer = SHARED CROSS-CUTTING (same N≥10 + adherence ≥80% + max 2 Pain-Aware rule applies all engines uniformly).

### Mid-flight Deferred V1.5+ (Amendment)

- **Tier downgrade T2→T1 behavior:** separate spec ADR 009 amendment session viitor. Question scope: dacă T2 unlock atins apoi behavioral validation rate scade (e.g., adherence drops <80% cu 3+ Pain-Aware sesiuni consecutive), engine downgrade T2→T1? Sau preserve T2 cu silent flag CDL? Open Q TBD.
- **RIR/Tempo gate Convergence Guard:** defer v1.5 cu RIR_actual_vs_planned ±1 tolerance. V1 = volume_adherence_vs_pain_adjusted only.
- **Pain-Aware threshold rule (>50% sets affected) retroactive activation:** silent vector forward-compat ZERO schema migration, V1.5 acted upon.

### Consequences (Amendment)

#### Positive

- **Anti-Bugatti-fakery T2 unlock** — engine NU unlock T2 când self-report misaligns biology (Gigel guardrail "Bugatti hits guardrail real" Daniel articulation)
- **Cross-cutting clean** — same Behavioral Validation rule applies all engines uniformly, NU 7× variants per engine
- **Forward-compat v1.5 ZERO migration** — `pain_trigger_set` vector additive, legacy V1 binary acceptable
- **Decoupling safety/reward Invariant 5 protect** — Pain Button = clean signal user friction, NU engine proactive conflated

#### Negative

- **Implementation effort cross-engine** — every engine emit must implement T2 unlock check cu Behavioral Validation layer. Could duplicate logic if NOT factored into shared utility (`tierUnlock.evaluate(engineConvergenceSignal, behavioralValidation)` recommended pattern).
- **Test surface area substantial** — multi-condition formula (3 OR + 2 AND = 6 path combinations) × per-engine variations × Pain-Aware binary V1 + vector forward-compat v1.5 = Property-based + Golden Master mandatory (ADR 026 Q7 3-tier test suite)
- **CDL schema extension required** — `pain_aware` + `pain_trigger_set` fields additive (ZERO migration but mandatory population)

#### Risks

- **Pain-Aware false-positive rate** — user clicks Pain Button without genuine pain (exploration / curiosity / accidental tap Maria 65) → false `pain_aware: true` → false T2 unlock blocking. Mitigation: telemetry monitor click rate post-Beta, threshold rule v1.5 (>50% sets) tightens gate.
- **Adherence ≥80% gaming** — user partial-skips să mențină count fără să facă actually full session. Mitigation: outcome.executed + volume_adherence_vs_pain_adjusted = composite metric, NOT just count. CDL audit trail per session.
- **N≥10 sesiuni gate too slow Maria 65** — Maria frequent low-volume might take 4-6 weeks to reach N=10. Mitigation: T2 unlock = optimization gate, NOT functional gate. T1 fully functional, T2 = aggressive adaptations enabled (acceptable wait period for behavioral evidence accumulation).

### Cross-references update needed (Amendment)

Files care vor primi cross-ref la această amendment:

- `03-decisions/022-bayesian-nutrition-inference.md` — Cluster Convergence Guard "T2 Unlock" cross-cutting (LANDED chat strategic 2026-05-05 birou after, this commit)
- `03-decisions/011-coach-decision-log-architecture.md` — CDL schema extension `pain_aware` + `pain_trigger_set` fields (forward-compat v1.5 vector documented)
- `03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1.md` — Pain-Aware Hybrid Spec V1 (a)+(i) binary + forward-compat v1.5 vector cross-ref
- `03-decisions/DECISION_LOG.md` — entry 2026-05-05 birou after (this commit)
- `00-index/CURRENT_STATE.md` — ACTIVE_ADRS update ADR 009 §AMENDMENT 2026-05-05 birou after (this commit)
- `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` §3.5.1 — Strong Prior tier-based references T2 unlock criteria (potential cross-ref update next sweep)

Future engines #6 + #7 spec sessions vor reference Cross-cutting Applicability matrix (above) as authoritative T2 unlock pattern.

---

*Amendment authored 2026-05-05 birou after chat strategic Daniel + Claude (Engine #3 Bayesian Nutrition spec session, mid-flight Convergence Guard surfaced). Daniel push-back fundamental seminal "T2 = Behavioral Validation NOT just statistical convergence" — formula final post 5 iterations refinement. Sign-off implicit via §CC.5 fast handover ingest.*
