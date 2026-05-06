# ADR 030 — Adapter Design Pattern

**Status:** 🟢 **SPEC READY V1 (partial — D1-D5 LOCKED foundation Hexagonal + Open Q-uri Q-OPEN-1→7 PENDING)**
**Date:** 2026-05-06 morning acasă (chat strategic faza 2/4 sequence pragmatic post Daniel "vizor fără ușă" reframe LOCKED)
**Cumulative LOCKED:** D1-D5 = **5 substantive decisions LOCKED V1** (per-engine topology + thin adapter scope + context object input + Result type output + cross-cutting concerns orchestrator location). Q-OPEN-1→7 PENDING explicit.
**See also:** [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline §42.10 sequential 8 engines (Periodization → Goal Adaptation → Energy → Bayesian Nutrition → Tempo → Specialization → Warm-up → Deload) | [[018-engine-extensibility-architecture|ADR 018]] §1 Dimension Registry + §2 Standardized Dimension Contract + §5 Feature Flags Infrastructure (foundation Hexagonal + plug-in additive) | [[022-bayesian-nutrition-inference|ADR 022]] Engine #4 Bayesian Nutrition (adapter pure mapping per engine) | [[024-goal-driven-program-templates|ADR 024]] Engine #2 Goal Adaptation (adapter pure mapping per engine) | [[025-andura-gandeste-pentru-user|ADR 025]] graceful degradation engine pre-fills default (cross-cutting orchestrator concern) | [[027-engine-energy-adjustment|ADR 027]] Engine #5 Energy Adjustment (adapter pure mapping per engine) | [[028-engine-tempo-form-cues|ADR 028]] Engine #6 Tempo Form Cues (adapter pure mapping per engine) | [[029-engine-specialization|ADR 029]] Engine #7 Specialization (adapter pure mapping per engine) | [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" Behavioral Validation Rule (cross-cutting all tier transitions, orchestrator-level utility per D5) | [[011-coach-decision-log-architecture|ADR 011]] CDL telemetry hooks (cross-cutting orchestrator concern per D5) | [[ADR_CASCADE_DEFENSE_v1]] §EXT-2 Composite Signal Layer Layer D Budget Reaffirmation (§36.41) + Anti-Cascade Silent precedent (Result type output D4 alignment)

---

## Status Summary

Adapter Design Pattern = architectural foundation pre-wiring engine pipeline §42.10 multi-batch CC implementation. Faza 2/4 sequence pragmatic 4-faze post Daniel "vizor fără ușă" reframe LOCKED 2026-05-06 morning acasă (per `00-index/CURRENT_STATE.md` §NOW + §JUST_DECIDED 2026-05-06 morning acasă entry top).

**Provenance chain D1-D5 LOCKED V1:**

1. **Faza 1/4 (DONE):** ADR 024 Goal-Driven Program Templates compile draft full Q1-Q8 LOCKED V1 (commit `8674782` push origin/main 2026-05-06 morning acasă)
2. **Faza 2/4 (THIS ADR):** ADR 030 NEW Adapter Design Pattern create file SPEC READY V1 partial — D1-D5 LOCKED V1 chat strategic 2026-05-06 morning acasă post ADR 024 compile + Daniel push-back recidivă cadență mecanică Claude ("trebuie sa ma rog de tine sa dam drumul la cc sa lucreze?") rezolvat prin direct execute D1-D5 fără 2-options confirmation theater
3. **Faza 3/4 (PENDING):** Multi-batch CC wiring engine pipeline §42.10 sequential 4-6 batches (Periodization → Goal Adaptation → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload) — pre-wiring blocker absolut acest ADR
4. **Faza 4/4 (PENDING):** Smoke end-to-end Daniel propriu account post wiring

**Decision count V1:** 5 substantive LOCKED (D1-D5 foundation Hexagonal) + 7 Open Questions PENDING (Q-OPEN-1→7 chat strategic NEW push-back natural când are sens). Cross-cutting concerns covered orchestrator V1: Convergence Guard tier resolution + Layer D ≤50ms budget enforcement + CDL telemetry ADR 011 + FeatureFlags ADR 018 §5 + Sentry error logging.

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

### §2.4 D4 LOCKED V1 — Result Type Output Contract

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

## §3 Open Questions PENDING Q-OPEN-1 → Q-OPEN-7

**Status:** PENDING chat strategic NEW push-back natural când are sens. Why deferred: D1-D5 = foundation Hexagonal sufficient pentru faza 3 multi-batch CC wiring start. Q-OPEN-1→7 = refinements operational tactical care apar natural în implementation discovery + post-Beta useri reali signal.

### Q-OPEN-1 — Versioning/migration

**Question:** ADR 018 §4 schema evolution — adapter handles migration logic sau out of scope (orchestrator/migration runner separate)?

**Why deferred:** Migration runner ADR 018 §4 LOCKED V1 already (eager migration pe app load). Question = whether per-adapter shape migration belongs to adapter (D2 thin scope violation potential) sau orchestrator context builder (D3 application layer responsibility extension). Decision needs concrete schema evolution scenario — defer chat strategic NEW când prima schema migration apare în faza 3 wiring.

### Q-OPEN-2 — Layer D ≤50ms enforcement mechanism

**Question:** shared util orchestrator pre-pipeline (per D5) — concrete check (synchronous timeout, async profiling, fail-fast on overrun)?

**Why deferred:** D5 LOCKED utility location orchestrator-level. Question = concrete enforcement mechanism. Sync timeout = blocker simplu dar UX impact session-tick latency. Async profiling = post-hoc observability NU prevent. Fail-fast = Cascade Defense aligned dar requires baseline budget per engine (NU yet measured Bugatti baseline). Defer post faza 3 batch 1 Periodization wiring + measure actual budget per engine before mechanism choice.

### Q-OPEN-3 — Observability granularity

**Question:** per-adapter call telemetry (8 distinct events) sau aggregate orchestrator-level (1 pipeline event with sub-spans)?

**Why deferred:** CDL ADR 011 architecture = log per session-tick, NU per engine call (granularity mismatch). Sentry error logging D5 = per error event NU per success. Question = whether successful adapter calls warrant telemetry at all (telemetry budget vs noise). Defer until faza 3 wiring complete + observability needs surface concrete (e.g., latency hot path identification post-Beta).

### Q-OPEN-4 — Pipeline ordering details §42.10

**Question:** sequential strict (current LOCKED) sau parallel-where-safe (e.g., Volume ⊥ Tempo independent)?

**Why deferred:** ADR 026 §1.10 LOCKED V1 sequential strict — Constraint Object immutable propagated engine-la-engine (TypeScript readonly type-safe). Parallel optimization = post-Beta optimization candidate, NU V1 concern. Bugatti craft "smart trade-offs unde NU contează" — sequential V1 simpler debug + audit trail clean. Defer post-Beta când profiling indică sequential pipeline hot path.

### Q-OPEN-5 — State source resolution

**Question:** Tier 0/1/2 multi-storage (localStorage + IndexedDB + Firestore) — orchestrator context builder ce Tier knows + când fallback?

**Why deferred:** ADR 020 Storage Tiering Strategy + ADR 006 Tier Storage for Logs + ADR 012 Tier Decay LOCKED V1. Question = orchestrator context builder fallback strategy când Tier 1 IndexedDB miss / Tier 2 Firestore offline. Defer chat strategic NEW când prima Tier fallback edge case apare în faza 3 wiring (probabil Periodization batch CDL history Tier 1 read miss scenario).

### Q-OPEN-6 — Error recovery semantics

**Question:** 1 engine fails Result `ok=false` → orchestrator continues remaining engines (graceful) sau halts pipeline (strict)?

**Why deferred:** D4 LOCKED V1 Result type contract `{ ok, output } | { ok, error }`. Question = orchestrator-level policy on fail. Anti-Cascade Silent precedent ADR_CASCADE_DEFENSE_v1 §EXT-2 = NU continue compute on stale data → favors halts pipeline strict. Counter: ADR 025 graceful degradation engine pre-fills default = favors continues remaining engines. Tension between two LOCKED V1 ADRs needs resolution chat strategic NEW per concrete failure scenario (e.g., Periodization fails → Goal Adaptation reads stale Constraint Object Floor/Ceiling → cascade compute on incomplete data).

### Q-OPEN-7 — Convergence Guard interaction tier downgrade

**Question:** re-eval per session-tick sau batch periodic + cooldown protection?

**Why deferred:** ADR 009 §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" LOCKED V1 = behavioral validation rule. Question = re-eval cadence. Per session-tick = real-time accurate dar Layer D ≤50ms budget hot path concern (Q-OPEN-2 dependency). Batch periodic + cooldown = budget-friendly dar tier downgrade lag risk. Defer post-Beta când Q-OPEN-2 enforcement mechanism LOCKED + actual session-tick budget measured Bugatti baseline.

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
7. **Q-OPEN-1 → Q-OPEN-7 PENDING resolution** — chat strategic NEW push-back natural când are sens. Each Open Q has own deferral rationale §3 above + concrete trigger condition (faza 3 wiring discovery / post-Beta useri reali signal / profiling baseline measurement).

**Re-evaluation cadence:** post faza 3 multi-batch CC wiring complete + post-Beta useri reali signal aggregate (similar ADR 026 §1.8 Versioning Additive 18 luni deprecation window cadence). Bugatti craft transparency = ship V1 cu D1-D5 LOCKED + monitor faza 3 implementation discovery + post-Beta signal.

---

🦫 **ADR 030 SPEC READY V1 partial LOCKED 2026-05-06 morning acasă.** D1-D5 foundation Hexagonal LOCKED V1 (per-engine topology + thin adapter scope + context object input + Result type output + cross-cutting concerns orchestrator location). Q-OPEN-1→7 PENDING chat strategic NEW push-back natural. Pre-wiring blocker absolut pentru faza 3 multi-batch CC §42.10 sequential 8 engines. ZERO fabrication — D1-D5 verbatim chat strategic 2026-05-06 morning acasă, Open Q-uri verbatim same source. Reversibil v1.5 amendment per §5 reconsideration triggers when concrete signal post faza 3 wiring + post-Beta useri reali.
