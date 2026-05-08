# ADR 030 — Adapter Design Pattern

**Status:** 🟢 **SPEC FULL V1 LANDED 2026-05-08 (D1-D5 LOCKED foundation Hexagonal + Q-OPEN-1→7 RESOLVED V1 7/7 Co-CTO tactical lock + D4 amendment additive `severity` field)**
**Date:** 2026-05-06 morning acasă (chat strategic faza 2/4 D1-D5 LOCKED V1) + 2026-05-08 chat NEW birou (Q-OPEN-1→7 RESOLVED V1 + D4 amendment additive)
**Cumulative LOCKED:** D1-D5 = **5 substantive decisions LOCKED V1** + Q-OPEN-1→7 = **7 substantive resolutions LOCKED V1 2026-05-08** + D4 amendment `severity` additive = **1 substantive amendment LOCKED V1 2026-05-08**. Total **13 substantive decisions LOCKED V1** (per-engine topology + thin adapter scope + context object input + Result type output + cross-cutting concerns + 7 Q-OPEN refinements + severity field).
**See also:** [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline §42.10 sequential 8 engines (Periodization → Goal Adaptation → Energy → Bayesian Nutrition → Tempo → Specialization → Warm-up → Deload) | [[018-engine-extensibility-architecture|ADR 018]] §1 Dimension Registry + §2 Standardized Dimension Contract + §5 Feature Flags Infrastructure (foundation Hexagonal + plug-in additive) | [[022-bayesian-nutrition-inference|ADR 022]] Engine #4 Bayesian Nutrition (adapter pure mapping per engine) | [[024-goal-driven-program-templates|ADR 024]] Engine #2 Goal Adaptation (adapter pure mapping per engine) | [[025-andura-gandeste-pentru-user|ADR 025]] graceful degradation engine pre-fills default (cross-cutting orchestrator concern) | [[027-engine-energy-adjustment|ADR 027]] Engine #5 Energy Adjustment (adapter pure mapping per engine) | [[028-engine-tempo-form-cues|ADR 028]] Engine #6 Tempo Form Cues (adapter pure mapping per engine) | [[029-engine-specialization|ADR 029]] Engine #7 Specialization (adapter pure mapping per engine) | [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" Behavioral Validation Rule (cross-cutting all tier transitions, orchestrator-level utility per D5) | [[011-coach-decision-log-architecture|ADR 011]] CDL telemetry hooks (cross-cutting orchestrator concern per D5) | [[ADR_CASCADE_DEFENSE_v1]] §EXT-2 Composite Signal Layer Layer D Budget Reaffirmation (§36.41) + Anti-Cascade Silent precedent (Result type output D4 alignment)

---

## Status Summary

Adapter Design Pattern = architectural foundation pre-wiring engine pipeline §42.10 multi-batch CC implementation. Faza 2/4 sequence pragmatic 4-faze post Daniel "vizor fără ușă" reframe LOCKED 2026-05-06 morning acasă (per `00-index/CURRENT_STATE.md` §NOW + §JUST_DECIDED 2026-05-06 morning acasă entry top).

**Provenance chain D1-D5 LOCKED V1:**

1. **Faza 1/4 (DONE):** ADR 024 Goal-Driven Program Templates compile draft full Q1-Q8 LOCKED V1 (commit `8674782` push origin/main 2026-05-06 morning acasă)
2. **Faza 2/4 (THIS ADR):** ADR 030 NEW Adapter Design Pattern create file SPEC READY V1 partial — D1-D5 LOCKED V1 chat strategic 2026-05-06 morning acasă post ADR 024 compile + Daniel push-back recidivă cadență mecanică Claude ("trebuie sa ma rog de tine sa dam drumul la cc sa lucreze?") rezolvat prin direct execute D1-D5 fără 2-options confirmation theater
3. **Faza 3/4 (PENDING):** Multi-batch CC wiring engine pipeline §42.10 sequential 4-6 batches (Periodization → Goal Adaptation → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload) — pre-wiring blocker absolut acest ADR
4. **Faza 4/4 (PENDING):** Smoke end-to-end Daniel propriu account post wiring

**Decision count V1:** 5 substantive LOCKED (D1-D5 foundation Hexagonal) + 7 Q-OPEN-1→7 RESOLVED V1 2026-05-08 (Co-CTO tactical lock per concrete mechanism + V1.5 trigger thresholds) + D4 amendment additive `severity: 'soft' | 'hard'` field 2026-05-08 = **13 substantive decisions LOCKED V1**. Cross-cutting concerns covered orchestrator V1: Convergence Guard tier resolution + Layer D ≤50ms budget enforcement + CDL telemetry ADR 011 + FeatureFlags ADR 018 §5 + Sentry error logging + severity-aware error policy taxonomy (Q-OPEN-6 hybrid resolves ADR 025 graceful vs Anti-Cascade Silent strict tension).

**Architectural integration:** Adapter pattern = port boundary între engines pure (ADR 018 §2 Standardized Dimension Contract `analyze(input) → DimensionResult`) și app state mutable multi-source (Tier 0/1/2 storage + user profile + recent sessions + weights + profile tier). Engines stay pure (testable în vacuum, ZERO mocks needed) per Hexagonal authentic. Adapter = 1 per engine (D1) thin scope shape mapping only (D2) consume pre-built context object (D3) output Result type predictabil (D4) cross-cutting concerns orchestrator-level (D5).

---

## §1 Context

### §1.1 Faza 2/4 sequence pragmatic post Daniel "vizor fără ușă" reframe

Daniel push-back strategic LOCKED 2026-05-06 morning acasă: *"hai sa ne intelegem... astea sunt chestii mici care putem sa le facem cand avem app complet... e ca si cand am pune vizorul la usa, fara sa punem usa..."* — slip strategic Claude polish UX micro pe Settings când core (engine wiring real în coach decision flow live) NU există ca produs. Specs ADR 026 LOCKED + 8/8 engines SPEC COMPLETE pe hârtie, dar engine-urile NU-s wired în coach decision flow live.

Sequence pragmatic 4-faze agreed:
1. ADR 024 Q6 close → compile draft full (DONE faza 1, commit `8674782`)
2. **Adapter Design Pattern ADR NEW (THIS) — pre-wiring blocker absolute**
3. Multi-batch CC wiring engine pipeline §42.10 sequential 4-6 batches
4. Smoke end-to-end Daniel propriu account

**Push-back recidivă chat strategic 2026-05-06 morning acasă:** *"trebuie sa ma rog de tine sa dam drumul la cc sa lucreze?"* — cadență mecanică recidivă slip Claude pattern 2-options + "tu zici?" repetitiv ultimele 5-6 răspunsuri. Memory rule "decizii tactice decizi singur, NU întreabă confirmare" violated repetitiv. **Mea culpa scribe permanent:** D1-D5 acest ADR = decid tactic singur direct, NU propun multi-options confirmation theater. Pe faza 3 wiring batches sequencing = same rule (eu decid sequencing, NU propun pre-execution).

### §1.2 Need adapter boundary între engines pure ADR 018 vs app state mutable multi-source

**Problem space:**
- Engines per ADR 018 §2 Standardized Dimension Contract = pure functions `analyze(input) → DimensionResult`. Pure = testable în vacuum, ZERO mocks needed, deterministic given input. Raison d'être ADR 018 plug-in additive Open-Closed Principle — engine #9 nou = new dimension additive, NU edit central.
- App state per ADR 020 Storage Tiering Strategy + ADR 011 CDL Architecture + ADR 016 Vitality Layer = multi-source mutable (Tier 0 ephemeral mid-session / Tier 1 IndexedDB Dexie post-session / Tier 2 Firestore sync user-aware). Schema evolution per ADR 018 §4 Schema Versioning + Migration Runner.
- Direct coupling engines ↔ app state = engines lose purity (need state mocks for tests + drift inevitable când schema evoluează + 8 engines pulling overlapping data redundant per session-tick).

**Solution Hexagonal authentic:** Adapter = port boundary single responsibility shape mapping `engineContext → engineInput`. Engines stay pure consume ready-data. App state mutation = orchestrator layer separate (side effects CDL writes ADR 011 + telemetry + Firestore Tier 2 sync = composable + testable independent).

### §1.3 Pre-wiring blocker absolute pentru faza 3 §42.10 multi-batch wiring

Faza 3 multi-batch CC wiring = 4-6 batches sequential per pipeline ADR 026 §42.10 (Periodization → Goal Adaptation → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload). Without ADR 030 LOCKED V1 D1-D5 foundation:
- Batch 1 (Periodization wiring) ar inventa ad-hoc adapter shape inline = anti-Bugatti craft (no SSOT)
- Batches 2-8 ar diverge inevitable (each batch invent own adapter shape) = 8 inconsistent adapters drift
- Cross-cutting concerns (Convergence Guard, Layer D budget, CDL telemetry) ar fi scattered 8 engines = anti-DRY 8 places drift inevitable, 1 missing = silent inconsistency Bugatti FAIL

**Conclusion:** ADR 030 D1-D5 LOCKED V1 = pre-wiring blocker absolut. Faza 3 multi-batch CC start NU before ADR 030 LANDED + reviewed.

---

## §2 Decisions D1-D5 LOCKED V1 verbatim chat strategic 2026-05-06 morning acasă

### §2.1 D1 LOCKED V1 — Per-Engine Topology

**Decision verbatim:** 8 adapters distincte, 1 per engine ADR 026 §42.10 pipeline (Periodization, Goal Adaptation, Energy, Bayesian Nutrition, Tempo, Specialization, Warm-up, Deload).

**Rationale Bugatti:**
- Each engine input shape distinct (Periodization=CDL history, Goal Adaptation=Big 6+template, Energy=manual+stress emoji, Bayesian Nutrition=weight delta+adherence+reported energy, Tempo=set context, Specialization=lagging detection, Warm-up=mood+temperature, Deload=composite trigger)
- Compatibility ADR 018 Dimension Registry plug-in (Open-Closed Principle): engine #9 nou = new adapter additive, NU edit central
- Testing isolation: mock 1 adapter pentru 1 engine, NU mock universe central
- Shared concerns (Convergence Guard cross-cutting per ADR 009 §AMENDMENT, error handling, tier resolution) = utils/traits importate per adapter, NU God object centralizat

**Counter rejected:** central mapper God object 8 inputs distincte = anti-Open-Closed + scattering pull logic peste tot.

**Cross-refs surface:** [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline §42.10 sequential 8 engines | [[018-engine-extensibility-architecture|ADR 018]] §1 Dimension Registry plug-in additive Open-Closed | [[022-bayesian-nutrition-inference|ADR 022]] + [[024-goal-driven-program-templates|ADR 024]] + [[027-engine-energy-adjustment|ADR 027]] + [[028-engine-tempo-form-cues|ADR 028]] + [[029-engine-specialization|ADR 029]] (5 din 8 engines individual ADRs).

### §2.2 D2 LOCKED V1 — Thin Adapter Responsibility Scope

**Decision verbatim:** Thin adapter (pure shape mapping `engineContext → engineInput` + Result-typed output passthrough). 3 layers clean separation: **engine pure | adapter shape | orchestrator I/O**.

**Rationale Hexagonal authentic:**
- Engines = pure functions stay pure (testable în vacuum, ZERO mocks needed)
- Adapter = port boundary single responsibility shape mapping
- Side effects (CDL writes ADR 011, telemetry, Firestore Tier 2 sync) = orchestrator layer separate, composable + testable independent

**Counter rejected:**
- Rich adapter (shape + side effects + telemetry bundled) = mixed responsibilities cluster fuck, anti-Bugatti
- Hybrid (thin core + optional pre/post hooks) = configuration explosion edge cases. Defer v1.5 reconsideration trigger dacă thin proves too rigid

**Cross-refs surface:** [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract `analyze(input) → DimensionResult` purity preserved | [[011-coach-decision-log-architecture|ADR 011]] CDL writes orchestrator-level NOT adapter | reconsideration trigger v1.5 §5 below.

### §2.3 D3 LOCKED V1 — Context Object Pre-Built Input Shape

**Decision verbatim:** Orchestrator builds `engineContext = { user, recentSessions, weights, profileTier, ... }` ready-data per session-tick, adapter receives pure mapping ready data.

**Rationale Hexagonal:**
- Orchestrator = application layer responsibility build context once per session-tick, adapter = pure mapping ready-data
- State shape evolution: schema change rupe 1 loc (orchestrator context builder), NU 8 adapters scattering pull logic
- Testing trivial: provide context object literal `{ ... }`, ZERO mock state stores
- Performance: 1 read pass per session-tick aggregate, NU 8 adapters pulling overlapping data redundant

**Counter rejected:**
- Raw appState dump (adapter pulls) = coupling 8 adapters → global state shape brittle, drift risk
- Hybrid repository handle (lazy reads on-demand) = abstract layer extra debug trace cost. Defer v1.5 reconsideration trigger dacă over-fetch profiling indică hot path waste

**Cross-refs surface:** [[018-engine-extensibility-architecture|ADR 018]] §4 Schema Versioning + Migration Runner (state shape evolution clean break point orchestrator context builder) | reconsideration trigger v1.5 §5 below.

### §2.4 D4 LOCKED V1 — Result Type Output Contract (+ §AMENDMENT 2026-05-08 additive `severity` field)

**§AMENDMENT 2026-05-08 chat NEW birou — `AdapterError.severity: 'soft' | 'hard'` additive field LOCKED V1:**
- D4 contract `{ ok: true, output } | { ok: false, error }` preserved unchanged (additive, NOT breaking)
- `AdapterError` envelope adds optional `severity: 'soft' | 'hard'` field
- **Default `severity: 'hard'` if absent (fail-safe Anti-Cascade Silent default Bugatti craft)** — engine forgets severity field = treated halt-strict, NU silent continue
- Severity-aware policy în orchestrator `runPipeline`: 'soft' → continue-graceful (ADR 025 alignment); 'hard' → halt-strict (Anti-Cascade Silent alignment)
- Resolves Q-OPEN-6 tension ADR 025 graceful vs Anti-Cascade Silent strict per concrete error code taxonomy (see §3.6 RESOLVED V1 table)

**Decision verbatim:** Adapter returns `{ ok: true, output } | { ok: false, error }` never throws. Errors first-class type system.

**Rationale Bugatti + Cascade Defense per [[ADR_CASCADE_DEFENSE_v1]]:**
- Errors first-class în type system, NU silent fail (Bugatti craft compliance)
- Unified contract toate 8 adapters predictabil → orchestrator merge logic simpla `if (result.ok) { ... }` consistent
- Composable: pipeline §42.10 sequential = each step inspect prev result, short-circuit fail-safe Layer D ≤50ms budget preserved
- Anti-Cascade Silent precedent §EXT-2 ADR_CASCADE_DEFENSE_v1: engine fails NU continue compute on stale data

**Counter rejected:**
- Pure passthrough engine output errors throw bubble = boilerplate try/catch 8 calls scattered orchestrator + risk silent if forgot catch = anti-Bugatti
- Lenient envelope `{output, error}` both nullable partial degradation = silent compute on incomplete data = exact anti-pattern Cascade Defense rejects

**Verbosity mitigation:** 1 helper util `isOk(result)` la call site rezolvă ergonomics.

**Cross-refs surface:** [[ADR_CASCADE_DEFENSE_v1]] §EXT-2 Composite Signal Layer Layer D Budget Reaffirmation (§36.41) + Anti-Cascade Silent precedent | [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline sequential short-circuit fail-safe.

### §2.5 D5 LOCKED V1 — Cross-Cutting Concerns Location

**Decision verbatim:** Shared utilities orchestrator-level (pre-pipeline calls + results injected în engineContext per D3 LOCKED).

**Rationale Hexagonal + ADR 018 purity preserve:**
- Convergence Guard "T2 Unlock" per [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after = behavioral validation rule cross-cutting all tier transitions, NU 8 adapters duplicate
- Engine purity ADR 018 §Standardized Dimension Contract preserved: engines compute given tier ready-data, NU decide tier (purity = raison d'être whole pattern)
- Single SSOT propagation: tier resolution + Layer D ≤50ms budget enforcement + telemetry CDL [[011-coach-decision-log-architecture|ADR 011]] + featureFlags [[018-engine-extensibility-architecture|ADR 018]] §5 + Sentry error logging = orchestrator utilities pre-pipeline, results injected
- Reconsideration: update 1 utility = propagate effect all adapters consistent zero drift

**Counter rejected:**
- Per-adapter scattered = anti-DRY 8 places drift inevitable, 1 missing = silent inconsistency Bugatti FAIL
- Engine internal self-gate = breaks ADR 018 pure-function foundation = topple Adapter Pattern raison d'être întreg

**Cross-cutting concerns covered V1 orchestrator utilities:**
1. Convergence Guard tier resolution
2. Layer D ≤50ms budget enforcement
3. CDL telemetry hooks ADR 011
4. FeatureFlags evaluation ADR 018 §5
5. Sentry error logging

**Cross-refs surface:** [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" Behavioral Validation Rule | [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract purity preserve + §5 Feature Flags Infrastructure | [[011-coach-decision-log-architecture|ADR 011]] CDL telemetry hooks | [[ADR_CASCADE_DEFENSE_v1]] §EXT-2 Layer D ≤50ms budget enforcement.

---

## §3 Q-OPEN-1 → Q-OPEN-7 RESOLVED V1 2026-05-08 (Co-CTO tactical lock)

**Status:** ✅ **RESOLVED V1 7/7 — 2026-05-08 chat NEW birou** post Co-CTO read-only analysis DRAFT artefact `030-QOPEN-RESOLUTION-PROPOSE-DRAFT.md` (consumed archive NN 250). Each Q-OPEN locked cu mechanism V1 concret + V1.5 trigger threshold empirical pentru Faza 3 batch 1+ Periodization wiring discovery + post-Beta useri reali signal.

**Provenance:** Co-CTO tactical lock 7/7 (Q-OPEN-1+3+4 pure Hexagonal/Bugatti consistency; Q-OPEN-2+5+6+7 hybrid V1 lock + V1.5 Daniel-strategic input zone preserved). DRAFT artefact propose enumerate Daniel-strategic flag list — toate clarified inline tactical lock V1 cu concrete defaults, Daniel-strategic input zone preserved în V1.5 reconsideration triggers explicit threshold.

### Q-OPEN-1 RESOLVED V1 — Versioning/migration

**Question:** ADR 018 §4 schema evolution — adapter handles migration logic sau out of scope (orchestrator/migration runner separate)?

**LOCK V1:** **Migration Runner orchestrator-level pre-pipeline în `contextBuilder.js`. Adapter D2 thin scope preserved.**

**Mechanism V1:**
- `buildEngineContext(userState)` invokes ADR 018 §4 Migration Runner BEFORE shape freeze
- Schema version field on `EngineContext.meta.schemaVersion` tracks running migration generation
- Adapter consumes already-migrated canonical shape — D2 pure mapping preserved unchanged
- Eager-on-app-load preserved per ADR 018 §4 LOCKED V1 (no per-pipeline migration redundant cost)

**Rationale:**
- D2 thin scope LOCKED V1 explicit "pure shape mapping" — migration logic = side effect (state mutation) violates D2
- D3 LOCKED V1 explicit "schema change rupe 1 loc (orchestrator context builder), NU 8 adapters scattering pull logic" — Q-OPEN-1 = explicit confirm scope locus
- ADR 018 §4 Migration Runner eager-on-app-load LOCKED V1 already centralized — NU duplicate per-adapter
- Trade-off: contextBuilder.js becomes thicker (Migration Runner integration) vs 8 adapters thin preserved — net win Hexagonal authentic + DRY

**V1.5 trigger:** N/A — migration scope architecturally settled. Reconsideration only dacă ADR 018 §4 spec evolves substantively.

**Cross-refs:** [[018-engine-extensibility-architecture|ADR 018]] §4 Schema Versioning + Migration Runner alignment confirm (no amendment needed); D2/D3 confirm.

### Q-OPEN-2 RESOLVED V1 — Layer D ≤50ms enforcement mechanism

**Question:** shared util orchestrator pre-pipeline (per D5) — concrete check (synchronous timeout, async profiling, fail-fast on overrun)?

**LOCK V1 (HYBRID 2-stage):** **V1 = sync `Promise.race` timeout (current `budget.js` implementation). V1.5 trigger = AbortController + cancel-aware adapter contract amendment când Faza 3 batch 1 Periodization wiring measures ≥1 engine reproducibly p95 >50ms în synthetic stress test.**

**Mechanism V1:**
- `withBudget(fn, 50)` Promise.race semantics preserved (current `budget.js` `5a16550`)
- `BUDGET_EXCEEDED` err propagated cu `severity: 'soft'` default (Q-OPEN-6 taxonomy alignment) — orchestrator caller continues-graceful per ADR 025 engine pre-fill default
- Orchestrator-level CDL telemetry hook writes `budget_exceeded_count` per pipeline event for empirical baseline measurement post Faza 3 batch 1

**V1.5 trigger criteria (concrete empirical threshold):**
- Faza 3 batch 1 Periodization wiring measures actual median + p95 latency per engine în synthetic stress test
- ≥1 engine reproducibly p95 >50ms → AbortController + cancel-aware adapter contract V1.5 amendment
- Until threshold met: V1 sync Promise.race sufficient (Bugatti craft "smart trade-offs unde NU contează")

**Rationale:**
- Cascade Defense + D4 favors fail-fast on overrun (errors first-class, NU silent compute on stale)
- AbortController cost: cancel-aware adapters require contract change (D2 thin scope harder), Promise cancellation propagation through engine functions — NU justified pre-empirical signal
- Baseline measurement Faza 3 batch 1 = decision fuel — Bugatti craft "ship V1 + monitor + iterate concrete signal"
- Counter rejected: async profiling only = post-hoc observability NU prevent (Cascade Silent risk preserved)

**Cross-refs:** [[ADR_CASCADE_DEFENSE_v1]] §EXT-2 Composite Signal Layer Layer D Budget Reaffirmation (§36.41); D5 shared utilities; Q-OPEN-6 severity link (`BUDGET_EXCEEDED` → 'soft' default per taxonomy table §3.6).

### Q-OPEN-3 RESOLVED V1 — Observability granularity

**Question:** per-adapter call telemetry (8 distinct events) sau aggregate orchestrator-level (1 pipeline event with sub-spans)?

**LOCK V1:** **Aggregate orchestrator-level (1 CDL `pipeline_event` per session-tick + `subSpans: [{ adapterId, durationMs, ok, errorCode? }]` array). Per-adapter Sentry capture ONLY on err per D4.**

**Mechanism V1:**
- 1 CDL write per session-tick = `pipeline_event` payload `{ pipelineDurationMs, subSpans: [{ adapterId, durationMs, ok, errorCode? }] }` array
- Sentry capture only when adapter result `ok=false` cu `error.code` taxonomy (per D4) + `error.severity` (per Q-OPEN-6 D4 amendment)
- Successful adapter calls = sub-span entry only (no distinct event), aggregate aligns ADR 011 cadence

**Rationale:**
- CDL ADR 011 LOCKED per session-tick cadence — 8x granularity multiplier = noise dilutes per-tick signal-to-noise
- Telemetry budget cost (Sentry quota + Firestore Tier 2 sync writes ADR 020) — per-adapter success events = anti-DRY, low value
- Hot path identification post-Beta = sub-spans within 1 pipeline event sufficient (latency p95 per adapter from sub-span array)
- Failures already first-class structured per D4 → Sentry per err event = sufficient observability lane
- Trade-off: per-adapter aggregate event might miss cascading-correlated failures across engines — mitigated by sub-spans inspection în 1 pipeline event payload

**V1.5 trigger:** Hot path identification post-Beta + concrete debug scenario require per-adapter granularity (e.g., A/B test adapter optimization). Trigger threshold: ≥1 concrete debug scenario where sub-spans payload insufficient.

**Cross-refs:** [[011-coach-decision-log-architecture|ADR 011]] §X amendment defining `pipeline_event` payload schema cu `subSpans[]` (Q-OPEN-3 dependency, applied this batch); ADR 020 Tier 2 sync write impact alignment.

### Q-OPEN-4 RESOLVED V1 — Pipeline ordering details §42.10

**Question:** sequential strict (current LOCKED) sau parallel-where-safe (e.g., Volume ⊥ Tempo independent)?

**LOCK V1:** **SEQUENTIAL STRICT preserved per ADR 026 §1.10 LOCKED V1 + `runPipeline` `for (const adapter of adapters) await` current implementation `5a16550` preserved unchanged.**

**Mechanism V1:**
- `runPipeline(engineContext, adapters)` sequential `for` loop preserved (current `index.js` `5a16550`)
- Constraint Object immutable propagation = engine-to-engine via shared `EngineContext.meta` extension (V1 `meta` empty object slot ready, Faza 3 batch 1 will populate)
- §5.6 reconsideration trigger LOCKED already cu concrete threshold

**V1.5 candidate trigger (already documented §5.6):**
- Periodization → Goal Adaptation: dependent (Constraint Object floor/ceiling input) — sequential strict mandatory
- Tempo ⊥ Specialization: independent (no shared constraint) — parallel candidate când profiling justifies
- Warm-up ⊥ Deload: independent (different session phases) — parallel candidate
- Trigger threshold: profiling indică >30% session-tick budget overhead în sequential + parallel safety proof per ≥2 engine pairs

**Rationale:**
- ADR 026 §1.10 LOCKED V1 explicit sequential strict — Q-OPEN-4 alignment, NU divergence
- Constraint Object immutable propagation D3 + ADR 026 §1.10 = sequential mandatory pentru downstream engines
- Bugatti craft "smart trade-offs unde NU contează" — V1 sequential simpler debug + audit trail clean
- Parallel-where-safe complexity cost (concurrent error handling, race conditions, telemetry sub-span ordering) NU justified pre-Beta concrete profile data

**Cross-refs:** [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline Order LOCKED V1 alignment confirm; §5.6 reconsideration trigger preserved cu concrete empirical threshold.

### Q-OPEN-5 RESOLVED V1 — State source resolution

**Question:** Tier 0/1/2 multi-storage (localStorage + IndexedDB + Firestore) — orchestrator context builder ce Tier knows + când fallback?

**LOCK V1:** **Hierarchical fallback Tier 1 IndexedDB primary → Tier 0 ephemeral session memory → Tier 2 Firestore async background sync (NEVER pipeline blocking). Silent degradation default per ADR 025 "Andura gândește pentru user".**

**Mechanism V1:**
- `buildEngineContext(userState)` extension cu optional `storageAdapter` parameter — `read(key)` returns `{ value, tier, staleness_ms }` envelope
- Tier 1 IndexedDB primary read — sub-50ms typical Local-First ADR 020
- Tier 0 ephemeral session memory fallback — when Tier 1 miss/error (e.g., Dexie transaction race)
- Tier 2 Firestore async background sync — NEVER pipeline blocking; staleness propagated `EngineContext.meta.staleness_ms` for engine awareness
- Engine fallback when Tier miss = pre-fill default per ADR 025 (no user-visible offline indicator V1)

**V1.5 candidate trigger:** User-visible offline indicator deferred Beta concrete signal când ≥3 testers raportează confuzie ("of where data") sau Daniel UX decision că staleness >N min warrants explicit "you're offline" badge.

**Rationale:**
- ADR 020 Storage Tiering LOCKED V1 Local-First = Tier 1 primary, Tier 2 background sync — Q-OPEN-5 alignment
- ADR 025 graceful degradation default silent: engine pre-fills default cu staleness signal când Tier miss — UX consistency cu pattern existing
- Tier 2 pipeline blocking = anti-Bugatti UX (Firestore network round-trip ≥200ms typical >> Layer D ≤50ms budget) — never block
- Concrete fallback semantics needs scenario-driven testing in Faza 3 batch 1 — V1 stub `userState` already-aggregated currently sufficient

**Cross-refs:** [[020-storage-tiering-strategy|ADR 020]] alignment confirm (no amendment needed); [[025-andura-gandeste-pentru-user|ADR 025]] silent degradation default; [[006-tier-storage-for-logs|ADR 006]] Tier Storage for Logs; [[012-tier-decay|ADR 012]] Tier Decay.

### Q-OPEN-6 RESOLVED V1 — Error recovery semantics

**Question:** 1 engine fails Result `ok=false` → orchestrator continues remaining engines (graceful) sau halts pipeline (strict)?

**LOCK V1 (HYBRID per error code taxonomy):** **Severity-aware policy resolves ADR 025 graceful vs Anti-Cascade Silent strict tension. D4 amendment additive `AdapterError.severity: 'soft' | 'hard'` field (default `'hard'` if absent — fail-safe Anti-Cascade Silent).**

**Taxonomy table (error code → severity → policy):**

| Error code | Severity | Policy | Rationale |
|------------|----------|--------|-----------|
| `BUDGET_EXCEEDED` (Q-OPEN-2) | soft | continue-graceful, engine pre-fill default per ADR 025 | Latency overrun ≠ logic violation; downstream may proceed with previous tick value |
| `INVALID_INPUT` | hard | halt-strict | Input contract violation = downstream cannot trust shape |
| `ENGINE_THREW` (D4 violation) | hard | halt-strict | Defensive: engine bug surfaces, NU silent fail |
| `ADAPTER_THREW` | hard | halt-strict | Orchestrator structured fail per `runPipeline` capture |
| `INVALID_ADAPTER` | hard | halt-strict | Pipeline configuration error |
| Engine-emitted err `severity: 'soft'` | soft | continue-graceful | Insufficient data per ADR 025 graceful degradation pre-fill |
| Engine-emitted err `severity: 'hard'` | hard | halt-strict | Constraint violation, downstream Constraint Object stale |

**D4 amendment additive (§2.4 D4 LOCKED V1 unchanged contract preserved + severity field added):** `AdapterError` envelope adds optional `severity: 'soft' | 'hard'` field. **Default `severity: 'hard'` if absent (fail-safe Anti-Cascade Silent default Bugatti craft).**

**Concrete engine severity mapping per ADR-uri LOCKED V1:**
- **Tempo (ADR 028)** form breakdown report → soft (degrade default tempo per ADR 025 graceful)
- **Bayesian Nutrition (ADR 022)** convergence corruption insufficient samples → soft (use prior per ADR 022 fallback)
- **Specialization (ADR 029)** insufficient lagging data → soft (ADR 025 graceful pre-fill no specialization)
- **Periodization (ADR 026 §9.1)** Constraint Object stale CDL corruption → hard (downstream cannot trust Floor/Ceiling baseline)
- **Goal Adaptation (ADR 024)** Big 6 lifecycle phase auto-detection ambiguous → soft (use template default per ADR 024 Q6 D Hybrid)
- **Energy Adjustment (ADR 027)** manual emoji absent (user skipped pre-session) → soft (use neutral 🟡 default per ADR 025)
- **Warm-up (ADR 026 §9.7)** mood + temperature missing → soft (use baseline routine per ADR 025)
- **Deload (ADR 026 §9.8)** composite trigger insufficient signals → soft (defer deload prescription)

**Implementation `runPipeline` policy logic V1:**
```js
// per adapter result inspect:
if (result.ok === false) {
  const severity = result.error?.severity ?? 'hard'; // fail-safe default
  if (severity === 'hard') {
    // halt-strict: aggregate Result ok=false, return early cu first hard error
    return { halted: true, results, firstHardError: result.error };
  }
  // soft: log sub-span err, continue next adapter
}
```

**Rationale:**
- D4 LOCKED V1 Result type contract preserved unchanged — taxonomy refinement = additive (severity field optional, default fail-safe)
- Tension ADR 025 graceful vs Anti-Cascade Silent strict resolved per concrete error semantics: contract violations halt, data degradation graceful
- Engine ADR 025 graceful degradation = engine emits `severity: 'soft'` cu pre-filled default — orchestrator continues
- Engine constraint violation (e.g., Periodization can't compute Floor/Ceiling because corrupted CDL) = `severity: 'hard'` — orchestrator halts, downstream Goal Adaptation NU compute on stale Constraint Object
- Default `severity: 'hard'` if absent = fail-safe Bugatti craft (engine forgets severity field = treated halt-strict, NU silent continue)

**V1.5 trigger:** Daniel UX feedback post-Beta concrete failure scenarios re-evaluate severity per error code (e.g., Tempo form breakdown soft → hard if user safety concern surfaces).

**Cross-refs:** [[025-andura-gandeste-pentru-user|ADR 025]] graceful degradation alignment (severity 'soft' continues with engine pre-fill); [[022-bayesian-nutrition-inference|ADR 022]] fallback prior alignment severity 'soft'; [[ADR_CASCADE_DEFENSE_v1]] §EXT-2 Anti-Cascade Silent strict alignment severity 'hard' default; [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §9.1-§9.8 engine adapters annotate emitted errs cu severity per taxonomy table.

### Q-OPEN-7 RESOLVED V1 — Convergence Guard interaction tier downgrade

**Question:** re-eval per session-tick sau batch periodic + cooldown protection?

**LOCK V1:** **Batch periodic per session-end (NOT per session-tick) + cooldown asymmetric upgrade/downgrade. Aligns ADR 011 CDL cadence + prevents flap.**

**Mechanism V1:**
- `resolveTier(userState)` V1 stub passthrough preserved current implementation `5a16550` (zero-effect baseline)
- V1.5 amendment per session-end: post-session CDL write triggers Convergence Guard re-eval per ADR 009 §AMENDMENT 2026-05-05 birou after Behavioral Validation Rule
- Cooldown 7 zile minim între tier downgrades enforced via `userState.profileTier_lastChange_ts` field check
- **Tier upgrade (T0→T1→T2):** NO cooldown (welcome event, low risk)
- **Tier downgrade (T2→T1, T1→T0):** cooldown 7 zile + N=3 consecutive sessions confirming downgrade pattern (ADR 009 §AMENDMENT Behavioral Validation Rule)
- Engagement-modulated cooldown: DEFER post-Beta concrete signal (scope creep V1)

**Rationale:**
- Per-session-tick = budget hot path NEW concern (Q-OPEN-2 50ms budget) — NU justify reliability gain
- Per-session-end = aligned CDL ADR 011 write cadence (1 write per session-tick = natural batching point)
- Cooldown 7 zile minim = prevents flap on noisy convergence signals (ADR 022 Cluster B Cadence Adaptive T1+ similar reasoning re-prompt fatigue)
- Tier downgrade lag = acceptable trade-off (downgrade rare event, latency days NU min/sec) vs UX disruption flap risk
- Asymmetric upgrade/downgrade cadence: positive UX events instant, negative UX events buffered cooldown — per Bugatti craft user trust building
- N=3 consecutive sessions = ADR 009 §AMENDMENT LOCKED V1 Behavioral Validation Rule reuse (NU NEW threshold)

**V1.5 trigger:** Engagement-modulated cooldown deferred post-Beta concrete signal când persona-tier reveal asymmetric fatigue patterns (Marius 4×/săpt vs Maria 2×/săpt — same 7-day cooldown = different sessions evidence).

**Cross-refs:** [[022-bayesian-nutrition-inference|ADR 022]] Cluster B Cadence reuse pattern; [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Behavioral Validation Rule N=3 consecutive sessions confirm; [[011-coach-decision-log-architecture|ADR 011]] CDL session-end cadence alignment; Q-OPEN-2 budget dependency confirmed (per-session-end avoids 50ms hot path concern).

---

## §4 Cross-references

### Bidirectional ADR cross-refs

- [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline §42.10 sequential 8 engines — adapter pattern foundation per engine pre-wiring (D1 per-engine topology, D4 sequential pipeline short-circuit fail-safe)
- [[018-engine-extensibility-architecture|ADR 018]] §1 Dimension Registry plug-in additive Open-Closed Principle (D1 compatibility) + §2 Standardized Dimension Contract `analyze(input) → DimensionResult` purity preserved (D2 thin scope, D5 cross-cutting NU touch engines) + §4 Schema Versioning + Migration Runner (D3 state evolution Q-OPEN-1) + §5 Feature Flags Infrastructure (D5 cross-cutting orchestrator concern)
- [[022-bayesian-nutrition-inference|ADR 022]] Engine #4 — adapter pure mapping per D1 per-engine topology (Bayesian Nutrition input = weight delta + adherence + reported energy)
- [[024-goal-driven-program-templates|ADR 024]] Engine #2 — adapter pure mapping per D1 per-engine topology (Goal Adaptation input = Big 6 lifecycle + template choice)
- [[025-andura-gandeste-pentru-user|ADR 025]] graceful degradation engine pre-fills default — cross-cutting orchestrator concern per D5 + tension Q-OPEN-6 error recovery semantics
- [[027-engine-energy-adjustment|ADR 027]] Engine #5 — adapter pure mapping per D1 per-engine topology (Energy input = manual + stress emoji)
- [[028-engine-tempo-form-cues|ADR 028]] Engine #6 — adapter pure mapping per D1 per-engine topology (Tempo input = set context)
- [[029-engine-specialization|ADR 029]] Engine #7 — adapter pure mapping per D1 per-engine topology (Specialization input = lagging detection)
- [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" Behavioral Validation Rule — D5 cross-cutting orchestrator utility (tier resolution) + Q-OPEN-7 re-eval cadence interaction
- [[011-coach-decision-log-architecture|ADR 011]] CDL telemetry hooks — D5 cross-cutting orchestrator utility (CDL writes orchestrator-level NOT adapter D2) + Q-OPEN-3 observability granularity
- [[ADR_CASCADE_DEFENSE_v1]] §EXT-2 Composite Signal Layer Layer D Budget Reaffirmation (§36.41) + Anti-Cascade Silent precedent — D4 Result type output contract (errors first-class NU silent fail) + Q-OPEN-2 Layer D ≤50ms enforcement mechanism + Q-OPEN-6 error recovery semantics tension

### Source: chat strategic 2026-05-06 morning acasă

**Provenance:** D1-D5 LOCKED V1 verbatim chat strategic 2026-05-06 morning acasă post ADR 024 compile commit `8674782`. **NU ingestat în vault încă** — separate ingest §CC.5 ulterior va consuma narrative pentru CURRENT_STATE §JUST_DECIDED entry top + DECISION_LOG +1 entry top + INDEX_MASTER ADR 030 entry. Daniel command "Update CURRENT_STATE per inbox handover" trigger ulterior post handover narrative file landing în `📥_inbox/`.

**Backup tag pre-create:** `pre-adr030-create-2026-05-06-1205` pushed origin pre-execution.

---

## §5 Reconsideration triggers

Revisit ADR 030 D1-D5 LOCKED V1 → V1.5 candidate dacă:

1. **D1 Per-Engine Topology** — engine #9 nou adăugat post-Beta cu input shape near-identical engine existing (e.g., engine #9 = Mobility = input near-identical Warm-up). Re-evaluate consolidate adapter shared shape vs strict per-engine topology. Trigger threshold: ≥2 engines cu input shape >80% overlap.
2. **D2 Thin Adapter Scope** — thin proves too rigid în faza 3 wiring (e.g., engine X requires pre-call telemetry hook care orchestrator-level not natural fit). Hybrid hooks v1.5 candidate per Counter rejected note D2. Trigger threshold: ≥2 engines requesting pre/post hook bundling.
3. **D3 Context Object Input** — over-fetch profiling hot path waste post-Beta (e.g., Periodization needs only `recentSessions`, building full context = 5× redundant data per session-tick). Hybrid repository handle lazy reads v1.5 candidate per Counter rejected note D3. Trigger threshold: profiling indică >20% session-tick budget waste building unused context fields.
4. **D4 Result Type Output Contract** — `isOk(result)` helper util ergonomics insufficient (e.g., orchestrator merge logic explodes nested if/else 8 engines). Pattern matching v1.5 candidate (e.g., `match(result).ok(...).err(...)`). Trigger threshold: ≥3 orchestrator merge call sites cu nested >3 levels deep.
5. **D5 Cross-Cutting Concerns Orchestrator Location** — utility coupling cresce post-Beta (e.g., 5 utilities V1 → 12 utilities V2 cu inter-dependencies). Service-locator pattern v1.5 candidate (utilities resolved via locator NU directly imported). Trigger threshold: ≥10 cross-cutting utilities OR ≥3 utility-utility direct imports.
6. **Q-OPEN-4 Pipeline Parallelism** — sequential pipeline §42.10 hot path identified post-Beta + parallel safety proven concrete (e.g., Tempo ⊥ Specialization independent, parallel exec ✓). Q-OPEN-4 unblock V1.5. Trigger threshold: profiling indică >30% session-tick budget în sequential overhead + parallel safety proof per ≥2 engine pairs.
7. ~~**Q-OPEN-1 → Q-OPEN-7 PENDING resolution**~~ — ✅ **RESOLVED V1 2026-05-08 chat NEW birou** (Co-CTO tactical lock 7/7 cu mechanism V1 + V1.5 trigger thresholds concrete per §3 RESOLVED above). V1.5 reconsideration triggers preserved per Q resolution: Q-OPEN-2 V1.5 AbortController amendment (Faza 3 batch 1 ≥1 engine p95 >50ms reproducibly); Q-OPEN-3 V1.5 per-adapter granularity (concrete debug scenario require); Q-OPEN-5 V1.5 user-visible offline indicator (Beta ≥3 testers raportează confuzie); Q-OPEN-6 V1.5 severity re-evaluation per error code (Daniel UX feedback post-Beta concrete failure scenarios); Q-OPEN-7 V1.5 engagement-modulated cooldown (post-Beta persona-tier asymmetric fatigue signal).

**Re-evaluation cadence:** post faza 3 multi-batch CC wiring complete + post-Beta useri reali signal aggregate (similar ADR 026 §1.8 Versioning Additive 18 luni deprecation window cadence). Bugatti craft transparency = ship V1 cu D1-D5 LOCKED + monitor faza 3 implementation discovery + post-Beta signal.

---

🦫 **ADR 030 SPEC FULL V1 LANDED 2026-05-08 chat NEW birou.** D1-D5 foundation Hexagonal LOCKED V1 (per-engine topology + thin adapter scope + context object input + Result type output + cross-cutting concerns orchestrator location) + Q-OPEN-1→7 RESOLVED V1 7/7 Co-CTO tactical lock cu mechanism V1 + V1.5 trigger thresholds concrete + D4 amendment additive `AdapterError.severity` field (default 'hard' fail-safe). **Pre-wiring blocker FAZA 3 STRANGLER closed** — orchestrator V1 stubs `5a16550` ready for Faza 3 batch 1 Periodization wiring real cu Constraint Object immutable propagation + sequential strict pipeline §42.10. ZERO fabrication — D1-D5 verbatim chat strategic 2026-05-06 morning acasă; Q-OPEN-1→7 resolution sourced DRAFT artefact `030-QOPEN-RESOLUTION-PROPOSE-DRAFT.md` (consumed archive NN 250) cu cross-validation ADR 026 §9.X engines V1 LANDED + orchestrator V1 stubs inline Q-OPEN comments. Reversibil v1.5 amendment per §5 reconsideration triggers concrete empirical thresholds post Faza 3 batch 1 + post-Beta useri reali signal.
