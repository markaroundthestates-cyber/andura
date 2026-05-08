# ADR 030 Q-OPEN-1→7 Resolution Propose DRAFT — Co-CTO read-only analysis

**Status:** DRAFT — Co-CTO recommended resolution per Q-OPEN-1→7 PENDING. ZERO edits applied. Co-CTO va review + lock + livra prompt CC subsequent pentru applied resolution.
**Date:** 2026-05-08
**Scope:** ADR 030 §3 Q-OPEN-1→7 PENDING tactical resolution analysis post pre-flight read ADR 030 + ADR 026 §9.X cross-refs + `src/coach/orchestrator/` V1 stubs commit `5a16550` reusable foundation.

**Read-only inputs verified:**

- `03-decisions/030-adapter-design-pattern.md` (239 LOC) — D1-D5 LOCKED V1 verbatim + Q-OPEN-1→7 verbatim + §5 reconsideration triggers
- `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` cross-refs ADR 030 D2 thin scope + D3 Context Object pattern repeated în §9.1+§9.2+§9.3+§9.5+§9.6+§9.7+§9.8 verbatim
- `src/coach/orchestrator/index.js` — `runPipeline` V1 default continue-on-err (Q-OPEN-6 PENDING comment inline) + structured `ADAPTER_THREW`/`INVALID_ADAPTER` error capture
- `src/coach/orchestrator/types.js` — JSDoc `EngineContext` + `EngineAdapter` + `AdapterResult` + `AdapterError` typedefs per D1-D5
- `src/coach/orchestrator/result.js` — `ok` / `err` / `isOk` / `mapOk` helpers per D4
- `src/coach/orchestrator/contextBuilder.js` — `buildEngineContext` V1 frozen shallow defensive (Q-OPEN-1+5 inline comment)
- `src/coach/orchestrator/utilities/budget.js` — `withBudget` + `DEFAULT_BUDGET_MS=50` + Promise.race timeout (Q-OPEN-2 inline comment, NO AbortController V1)
- `src/coach/orchestrator/utilities/convergenceGuard.js` — `resolveTier` V1 stub passthrough (Q-OPEN-7 inline comment, NO re-eval V1)
- `src/engine/` 8 V1 LANDED engines (periodization + goalAdaptation + energyAdjustment + bayesianNutrition + tempo + specialization + warmup + deload) — per ADR 026 §42.10 pipeline ordering preserved

---

## Foundation D1-D5 LOCKED V1 (verbatim recap)

1. **D1 Per-Engine Topology** — 8 adapters distincte, 1 per engine ADR 026 §42.10 pipeline. Open-Closed plug-in additive per ADR 018 §1 Dimension Registry.
2. **D2 Thin Adapter Responsibility Scope** — Pure shape mapping `engineContext → engineInput` + Result-typed passthrough. 3 layers: engine pure | adapter shape | orchestrator I/O.
3. **D3 Context Object Pre-Built Input Shape** — Orchestrator builds `engineContext = { user, recentSessions, weights, profileTier, ... }` ready-data per session-tick.
4. **D4 Result Type Output Contract** — `{ ok: true, output } | { ok: false, error }` never throws. Errors first-class type system. `isOk(result)` helper.
5. **D5 Cross-Cutting Concerns Location** — Shared utilities orchestrator-level (Convergence Guard tier resolution + Layer D ≤50ms budget + CDL telemetry ADR 011 + FeatureFlags ADR 018 §5 + Sentry).

---

## Q-OPEN-1 — Versioning/migration

**Verbatim Q:** ADR 018 §4 schema evolution — adapter handles migration logic sau out of scope (orchestrator/migration runner separate)?

**Current state:** ADR 030 §3.1 — *"Migration runner ADR 018 §4 LOCKED V1 already (eager migration pe app load). Question = whether per-adapter shape migration belongs to adapter (D2 thin scope violation potential) sau orchestrator context builder (D3 application layer responsibility extension)."* `contextBuilder.js` V1 inline comment: *"Q-OPEN-1 versioning/migration PENDING — orchestrator vs adapter responsibility, defer chat strategic NEW post-Beta concrete signal."*

**Co-CTO recommend:** **Migration runner = orchestrator-level pre-pipeline (in `contextBuilder.js`). Adapter stays D2 thin.**

**Concrete mechanism V1:** `buildEngineContext(userState)` invokes Migration Runner ADR 018 §4 BEFORE shape freeze. Adapter consumes already-migrated canonical shape — D2 pure mapping preserved. Schema version field on EngineContext.meta tracks running migration generation.

**Rationale:**
- D2 thin scope LOCKED V1 explicit "pure shape mapping" — migration logic = side effect (state mutation), violates D2
- D3 LOCKED V1 explicit "schema change rupe 1 loc (orchestrator context builder), NU 8 adapters scattering pull logic" — Q-OPEN-1 = explicit confirm scope locus
- ADR 018 §4 Migration Runner eager-on-app-load LOCKED V1 already centralized — NU duplicate per-adapter
- Trade-off: contextBuilder.js becomes thicker (Migration Runner integration) vs 8 adapters thin preserved — net win Hexagonal authentic + DRY

**Daniel-strategic flag:** NO (pure tactical Hexagonal D2/D3 consistency confirm, NU UX dimension).

**Confidence:** HIGH

---

## Q-OPEN-2 — Layer D ≤50ms enforcement mechanism

**Verbatim Q:** shared util orchestrator pre-pipeline (per D5) — concrete check (synchronous timeout, async profiling, fail-fast on overrun)?

**Current state:** ADR 030 §3.2 — *"Sync timeout = blocker simplu dar UX impact session-tick latency. Async profiling = post-hoc observability NU prevent. Fail-fast = Cascade Defense aligned dar requires baseline budget per engine (NU yet measured Bugatti baseline). Defer post faza 3 batch 1 Periodization wiring + measure actual budget per engine before mechanism choice."* `budget.js` V1 = `Promise.race` timeout fără AbortController cancel — work continues underlying.

**Co-CTO recommend:** **HYBRID 2-stage. V1 = sync Promise.race timeout (current `budget.js`) returns `BUDGET_EXCEEDED` Result; V1.5 trigger = AbortController integration when faza 3 batch 1 Periodization measures concrete baseline budget per engine + ≥1 engine reproducibly exceeds 50ms.**

**Concrete mechanism V1:**
- `withBudget(fn, 50)` Promise.race semantics preserved (current implementation)
- `BUDGET_EXCEEDED` err propagated to orchestrator caller — caller decides per Q-OPEN-6 policy (continue-graceful default; halt-strict if concrete failure scenario surfaces)
- Telemetry hook orchestrator-level CDL writes `budget_exceeded_count` per pipeline event for baseline measurement

**V1.5 trigger criteria (concrete threshold):**
- Faza 3 batch 1 Periodization wiring measures actual median + p95 latency per engine
- ≥1 engine reproducibly p95 >50ms in synthetic stress test → AbortController + cancel-aware adapter contract V1.5 amendment
- Until threshold met: V1 sync timeout sufficient (Bugatti craft "smart trade-offs unde NU contează")

**Rationale:**
- Cascade Defense + D4 favors fail-fast on overrun (errors first-class, NU silent compute on stale)
- AbortController cost: cancel-aware adapters require contract change (D2 thin scope harder), Promise cancellation propagation through engine functions
- Baseline measurement faza 3 batch 1 = decision fuel — Bugatti craft "ship V1 + monitor + iterate concrete signal"
- Counter rejected: async profiling only = post-hoc observability NU prevent (Cascade Silent risk preserved)

**Daniel-strategic flag:** PARTIAL — V1 mechanism (sync Promise.race) = Co-CTO tactical lockable. V1.5 escalation cadence (when AbortController warranted vs Bugatti-cost-not-worth-it) = Daniel input strategic on UX session-tick latency budget vs reliability.

**Confidence:** MEDIUM-HIGH

---

## Q-OPEN-3 — Observability granularity

**Verbatim Q:** per-adapter call telemetry (8 distinct events) sau aggregate orchestrator-level (1 pipeline event with sub-spans)?

**Current state:** ADR 030 §3.3 — *"CDL ADR 011 architecture = log per session-tick, NU per engine call (granularity mismatch). Sentry error logging D5 = per error event NU per success. Question = whether successful adapter calls warrant telemetry at all (telemetry budget vs noise). Defer until faza 3 wiring complete + observability needs surface concrete (e.g., latency hot path identification post-Beta)."*

**Co-CTO recommend:** **Aggregate orchestrator-level (1 pipeline event with sub-spans). Per-adapter telemetry ONLY on err (Sentry per error D5).**

**Concrete mechanism V1:**
- 1 CDL write per session-tick = `pipeline_event` with `subSpans: [{ adapterId, durationMs, ok }]` array
- Sentry capture only when adapter result `ok=false` cu `error.code` taxonomy (per D4)
- Successful adapter calls = sub-span entry only (no distinct event), aggregate aligns ADR 011 cadence

**Rationale:**
- CDL ADR 011 LOCKED per session-tick cadence — 8x granularity multiplier = noise dilutes per-tick signal-to-noise
- Telemetry budget cost (Sentry quota + Firestore Tier 2 sync writes ADR 020) — per-adapter success events = anti-DRY, low value
- Hot path identification post-Beta = sub-spans within 1 pipeline event sufficient (latency p95 per adapter from sub-span array)
- Failures already first-class structured per D4 → Sentry per err event = sufficient observability lane
- Trade-off: per-adapter aggregate event might miss cascading-correlated failures across engines — mitigated by sub-spans inspection în 1 pipeline event payload

**Daniel-strategic flag:** NO (pure tactical observability cost optimization, NU UX dimension).

**Confidence:** HIGH

---

## Q-OPEN-4 — Pipeline ordering details §42.10

**Verbatim Q:** sequential strict (current LOCKED) sau parallel-where-safe (e.g., Volume ⊥ Tempo independent)?

**Current state:** ADR 030 §3.4 — *"ADR 026 §1.10 LOCKED V1 sequential strict — Constraint Object immutable propagated engine-la-engine (TypeScript readonly type-safe). Parallel optimization = post-Beta optimization candidate, NU V1 concern. Bugatti craft 'smart trade-offs unde NU contează' — sequential V1 simpler debug + audit trail clean."* `index.js` V1 = strict sequential `for (const adapter of adapters)` await each.

**Co-CTO recommend:** **V1 SEQUENTIAL STRICT preserved unchanged (per ADR 026 §1.10 LOCKED + index.js V1 implementation). Parallel = §5 reconsideration trigger 6 V1.5 candidate cu concrete threshold.**

**Concrete mechanism V1:**
- `runPipeline(engineContext, adapters)` sequential `for` loop preserved (current implementation `5a16550`)
- Constraint Object immutable propagation = engine-to-engine via shared EngineContext.meta extension (V1 `meta` empty object slot ready, faza 3 batch 1 will populate)
- §5.6 reconsideration trigger LOCKED already: profiling >30% session-tick budget în sequential overhead + parallel safety proof per ≥2 engine pairs

**V1.5 candidate trigger (already documented §5.6):**
- Periodization → Goal Adaptation: dependent (Constraint Object floor/ceiling input) — sequential strict
- Tempo ⊥ Specialization: independent (no shared constraint) — parallel candidate când profiling justifies
- Warm-up ⊥ Deload: independent (different session phases) — parallel candidate

**Rationale:**
- ADR 026 §1.10 LOCKED V1 explicit sequential strict — Q-OPEN-4 alignment, NU divergence
- Constraint Object immutable propagation ADR 030 D3 + ADR 026 §1.10 = sequential mandatory pentru downstream engines
- Bugatti craft "smart trade-offs unde NU contează" — V1 sequential simpler debug + audit trail clean
- Parallel-where-safe complexity cost (concurrent error handling, race conditions, telemetry sub-span ordering) NU justified pre-Beta concrete profile data

**Daniel-strategic flag:** NO (tactical alignment ADR 026 §1.10 LOCKED + reconsideration trigger §5.6 already concrete threshold).

**Confidence:** HIGH

---

## Q-OPEN-5 — State source resolution

**Verbatim Q:** Tier 0/1/2 multi-storage (localStorage + IndexedDB + Firestore) — orchestrator context builder ce Tier knows + când fallback?

**Current state:** ADR 030 §3.5 — *"ADR 020 Storage Tiering Strategy + ADR 006 Tier Storage for Logs + ADR 012 Tier Decay LOCKED V1. Question = orchestrator context builder fallback strategy când Tier 1 IndexedDB miss / Tier 2 Firestore offline. Defer chat strategic NEW când prima Tier fallback edge case apare în faza 3 wiring (probabil Periodization batch CDL history Tier 1 read miss scenario)."* `contextBuilder.js` V1 = accepts `userState` already-aggregated from `coachContext` callers (no Tier resolution în builder yet).

**Co-CTO recommend:** **Hierarchical fallback Tier 1 (primary IndexedDB) → Tier 0 (ephemeral session memory) → Tier 2 (Firestore offline-queue background, NU pipeline blocking). Stale data threshold acceptable per ADR 025 graceful degradation.**

**Concrete mechanism V1:**
- `buildEngineContext(userState)` extension: optional `storageAdapter` parameter cu `read(key)` interface returning `{ value, tier, staleness_ms }` envelope
- Tier 1 IndexedDB primary read — sub-50ms typical Local-First ADR 020
- Tier 0 ephemeral session memory fallback — when Tier 1 miss/error (e.g., Dexie transaction race)
- Tier 2 Firestore async background sync — NEVER pipeline blocking; staleness propagated în EngineContext.meta.staleness for engine awareness

**Rationale:**
- ADR 020 Storage Tiering LOCKED V1 Local-First = Tier 1 primary, Tier 2 background sync — Q-OPEN-5 alignment
- Cascade Defense + D4 fail-fast on missing data → graceful degradation per ADR 025 (engine pre-fills default cu staleness signal) when Tier 1 miss
- Tier 2 pipeline blocking = anti-Bugatti UX (Firestore network round-trip ≥200ms typical >> Layer D ≤50ms budget) — never block
- Concrete fallback semantics needs scenario-driven testing in faza 3 batch 1 — V1 stub `userState` already-aggregated currently sufficient until first concrete Tier miss surfaces

**Daniel-strategic flag:** PARTIAL — V1 default Tier 1 primary (Co-CTO tactical lockable per ADR 020 Local-First) + offline-first behavior threshold (when does coach show "you're offline" vs silent degradation?) = Daniel input strategic on UX expectation.

**Confidence:** MEDIUM (architecture intuit clear din ADR 020/006/012, dar fallback semantics depend on first concrete scenario faza 3 batch 1 + Daniel UX).

---

## Q-OPEN-6 — Error recovery semantics

**Verbatim Q:** 1 engine fails Result `ok=false` → orchestrator continues remaining engines (graceful) sau halts pipeline (strict)?

**Current state:** ADR 030 §3.6 — *"Anti-Cascade Silent precedent ADR_CASCADE_DEFENSE_v1 §EXT-2 = NU continue compute on stale data → favors halts pipeline strict. Counter: ADR 025 graceful degradation engine pre-fills default = favors continues remaining engines. Tension between two LOCKED V1 ADRs needs resolution chat strategic NEW per concrete failure scenario (e.g., Periodization fails → Goal Adaptation reads stale Constraint Object Floor/Ceiling → cascade compute on incomplete data)."* `index.js` V1 default = continue-on-err (graceful, ADR 025 aligned), inline comment "but flag în adapter-level error envelope so orchestrator caller can inspect downstream."

**Co-CTO recommend:** **HYBRID per error code taxonomy. Severity-aware policy resolves ADR 025 vs Anti-Cascade Silent tension.**

**Concrete mechanism V1 — error code → policy taxonomy:**

| Error code | Severity | Policy | Rationale |
|------------|----------|--------|-----------|
| `BUDGET_EXCEEDED` (Q-OPEN-2) | soft | continue-graceful, engine pre-fill default per ADR 025 | Latency overrun ≠ logic violation, downstream may proceed with previous tick value |
| `INVALID_INPUT` | hard | halt-strict | Input contract violation = downstream cannot trust shape |
| `ENGINE_THREW` (D4 violation) | hard | halt-strict | Defensive: engine bug surfaces, NU silent fail |
| `ADAPTER_THREW` | hard | halt-strict | Orchestrator structured fail per `runPipeline` capture |
| `INVALID_ADAPTER` | hard | halt-strict | Pipeline configuration error |
| Engine-emitted err `severity: 'soft'` | soft | continue-graceful | Insufficient data per ADR 025 graceful degradation pre-fill |
| Engine-emitted err `severity: 'hard'` | hard | halt-strict | Constraint violation, downstream Constraint Object stale |

**Adapter contract amendment (D4 extension proposal):** `AdapterError` envelope adds optional `severity: 'soft' \| 'hard'` field. Default `severity: 'hard'` if absent (fail-safe Anti-Cascade Silent default).

**Rationale:**
- D4 LOCKED V1 Result type contract preserved unchanged — taxonomy refinement = additive
- Tension ADR 025 graceful vs Anti-Cascade Silent strict resolved per concrete error semantics: contract violations halt, data degradation graceful
- Engine ADR 025 graceful degradation = engine emits `severity: 'soft'` cu pre-filled default — orchestrator continues
- Engine constraint violation (e.g., Periodization can't compute Floor/Ceiling because corrupted CDL) = `severity: 'hard'` — orchestrator halts, downstream Goal Adaptation NU compute on stale Constraint Object
- Default `severity: 'hard'` if absent = fail-safe Bugatti craft

**Daniel-strategic flag:** YES — error policy = product UX decision (when does coach fail loudly vs silent fallback?). Daniel scope to lock severity threshold per concrete error code + policy. Examples needing Daniel input:
- Tempo engine "form breakdown" report processing error → soft (degrade to default tempo) OR hard (block session prescription)?
- Bayesian Nutrition convergence guard data corruption → soft (use prior) OR hard (defer adapt T1+ unlock)?
- Specialization weakness detection insufficient data → already ADR 025 graceful (pre-fill no specialization) — confirm soft

**Confidence:** MEDIUM-HIGH (taxonomy clear, concrete severity thresholds per error code = Daniel-strategic input).

---

## Q-OPEN-7 — Convergence Guard interaction tier downgrade

**Verbatim Q:** re-eval per session-tick sau batch periodic + cooldown protection?

**Current state:** ADR 030 §3.7 — *"Per session-tick = real-time accurate dar Layer D ≤50ms budget hot path concern (Q-OPEN-2 dependency). Batch periodic + cooldown = budget-friendly dar tier downgrade lag risk. Defer post-Beta când Q-OPEN-2 enforcement mechanism LOCKED + actual session-tick budget measured Bugatti baseline."* `convergenceGuard.js` V1 stub = passthrough existing `userState.profileTier` no re-eval.

**Co-CTO recommend:** **Batch periodic per session-end (NOT per session-tick) + cooldown 7 zile minim între tier downgrades. Aligns CDL ADR 011 cadence + prevents flap on noisy convergence signals.**

**Concrete mechanism V1:**
- `resolveTier(userState)` V1 stub passthrough current implementation preserved (zero-effect baseline)
- V1.5 amendment per session-end (NOT per session-tick): post-session CDL write trigger Convergence Guard re-eval per ADR 009 §AMENDMENT 2026-05-05 birou after Behavioral Validation Rule
- Cooldown 7 zile minim between tier downgrades enforced via `userState.profileTier_lastChange_ts` field check
- Tier upgrade (T0→T1→T2) NO cooldown (welcome event, low risk)
- Tier downgrade (T2→T1, T1→T0) cooldown 7 zile + N=3 consecutive sessions confirming downgrade pattern (ADR 009 §AMENDMENT N consecutive sessions Behavioral Validation Rule)

**Rationale:**
- Per-session-tick = budget hot path NEW concern (Q-OPEN-2 dependency 50ms budget) — NU justify reliability gain
- Per-session-end = aligned CDL ADR 011 write cadence (1 write per session-tick = natural batching point)
- Cooldown 7 zile minim = prevents flap on noisy convergence signals (Bayesian Nutrition Cluster B Cadence Adaptive T1+ similar reasoning ADR 022 Reconsideration Trigger 4)
- Tier downgrade lag = acceptable trade-off (downgrade rare event, latency days NU min/sec) vs UX disruption flap risk
- Asymmetric upgrade/downgrade cadence: positive UX events instant, negative UX events buffered cooldown — per Bugatti craft user trust building

**Daniel-strategic flag:** YES — cooldown threshold = product UX decision (Daniel CEO Product instinct on tier downgrade frequency vs fatigue). Specific Daniel input needed:
- 7 zile cooldown = appropriate threshold? (Daniel may instinct 14 zile or 3 zile based on persona Maria 65 vs Marius 25 fatigue/recovery patterns)
- N=3 consecutive sessions Behavioral Validation = aligned ADR 009 §AMENDMENT or Daniel preferred N=2 / N=5?
- Should engagement metric (sessions/week) modulate cooldown? (e.g., Marius 4×/săpt = 7 zile = 4 sessions evidence vs Maria 2×/săpt = 7 zile = 2 sessions evidence)

**Confidence:** MEDIUM (cadence rationale clear, concrete thresholds = Daniel-strategic).

---

## Final summary

### Q-uri Daniel-strategic flagged (count + IDs)

**4 flagged (3 partial + 1 full):**

- **Q-OPEN-2** (PARTIAL) — V1 sync Promise.race timeout = Co-CTO lockable; V1.5 AbortController escalation cadence (when faza 3 baseline justifies cost) = Daniel UX vs reliability tradeoff
- **Q-OPEN-5** (PARTIAL) — V1 default Tier 1 primary IndexedDB Local-First = Co-CTO lockable per ADR 020; offline-first behavior + Firestore staleness threshold ("user-visible offline indicator?") = Daniel UX scope
- **Q-OPEN-6** (FULL) — Error policy taxonomy (severity per error code: soft graceful vs hard halt) = product UX decision per concrete engine failure scenarios. Daniel scope examples: Tempo form breakdown soft/hard? Bayesian convergence corruption soft/hard?
- **Q-OPEN-7** (PARTIAL) — Per-session-end cadence + cooldown asymmetric upgrade/downgrade architecture = Co-CTO lockable; concrete thresholds (7 zile? N=3 sessions? engagement-modulated?) = Daniel UX scope

### Q-uri Co-CTO tactical lockable (count + IDs)

**3 fully lockable:**

- **Q-OPEN-1** — Migration runner orchestrator-level pre-pipeline în `contextBuilder.js`. Adapter D2 thin scope preserved. ADR 018 §4 alignment.
- **Q-OPEN-3** — Aggregate orchestrator-level telemetry (1 pipeline event + sub-spans). Per-adapter Sentry only on err. ADR 011 cadence alignment.
- **Q-OPEN-4** — V1 SEQUENTIAL STRICT preserved per ADR 026 §1.10 LOCKED + §5.6 reconsideration trigger concrete threshold. Parallel V1.5 candidate post-Beta profile data.

### Estimated complexity batch resolution V1 prompt CC subsequent

**MEDIUM batch:**

- ADR 030 §3 Q-OPEN-1→7 expansion verbatim resolutions = ~150-250 LOC ADR 030 add (each Q-OPEN gets concrete mechanism subsection + V1.5 trigger threshold + cross-refs)
- ADR 030 §2.4 D4 amendment additive: `AdapterError` envelope `severity: 'soft' \| 'hard'` field (Q-OPEN-6 dependency) = ~30 LOC types.js update + adapter contract spec extension
- `src/coach/orchestrator/contextBuilder.js` Migration Runner integration (Q-OPEN-1) = ~30 LOC + tests
- `src/coach/orchestrator/index.js` policy-aware error halt logic (Q-OPEN-6 hybrid) = ~50 LOC + tests
- `src/coach/orchestrator/utilities/convergenceGuard.js` V1.5 batch periodic + cooldown logic (Q-OPEN-7) = ~80 LOC + tests
- DECISION_LOG entry + INDEX_MASTER stats refresh + CURRENT_STATE §JUST_DECIDED top entry — standard §CC.9 mandatory post-handover updates

**Cumulative LOCKED V1 impact:** estimated +5-7 net LOCKED V1 substantive (D4 severity field additive + Q-OPEN-1+3+4 tactical confirms + Q-OPEN-2+5+6+7 partial Daniel-strategic input). Cumulative ~688 → ~693-695 product/architecture additive (modest, vault meta-tooling tactical alignment NU strategic shift).

**LOC delta ADR 030 expected:** 239 → ~400-450 LOC (Q-OPEN sections expand + cross-refs ADR 011/018/020/025/026 update bidirectional).

### Dependencies cross-ADR identified

- **ADR 011 CDL** — Q-OPEN-3 aggregate sub-span schema needs ADR 011 §X amendment defining `pipeline_event` payload shape with `subSpans[]` array (telemetry budget calibration)
- **ADR 018 §4 Schema Versioning + Migration Runner** — Q-OPEN-1 integration point în `contextBuilder.js` pre-pipeline (no ADR 018 amendment needed — alignment confirmation)
- **ADR 020 Storage Tiering** — Q-OPEN-5 fallback hierarchy alignment (no ADR 020 amendment — confirms Tier 1 primary local-first)
- **ADR 025 Andura Gândește Pentru User** — Q-OPEN-6 graceful degradation policy reaffirm (`severity: 'soft'` alignment); no ADR 025 amendment
- **ADR 026 §9.X engine spec hooks** — Q-OPEN-6 might require engine adapters annotate emitted errs cu `severity` field; concrete engines cu Cluster failure modes need explicit severity decision (e.g., ADR 022 Bayesian Cluster A Convergence Guard data corruption → severity? ADR 028 Tempo form breakdown report → severity?)
- **ADR_CASCADE_DEFENSE_v1 §EXT-2 Layer D ≤50ms budget** — Q-OPEN-2 V1.5 AbortController amendment scope; no V1 amendment
- **`src/coach/orchestrator/` V1 stubs** — index.js + budget.js + convergenceGuard.js + contextBuilder.js all explicitly cross-ref Q-OPEN-X PENDING in inline comments — coherent baseline ready for Q-OPEN resolutions to expand without rewrite

### Anti-recurrence flags

**ZERO drift caught în reading.** Pre-flight grep filesystem real verified:

- ✅ ADR 030 cross-refs valid bidirectional (ADR 011/018/022/024/025/026/027/028/029 + ADR 009 §AMENDMENT + ADR_CASCADE_DEFENSE_v1)
- ✅ Orchestrator V1 stubs `5a16550` explicitly document Q-OPEN ties (budget.js → Q-OPEN-2; convergenceGuard.js → Q-OPEN-7; index.js → Q-OPEN-4+6; contextBuilder.js → Q-OPEN-1+5)
- ✅ ADR 026 §9.X engines V1 LANDED (8/8) `src/engine/` paths verified all 8 directories present
- ✅ D2 thin scope reference repeated verbatim în ADR 026 §9.1+§9.2+§9.3+§9.5+§9.6+§9.7+§9.8 (consistent constraint propagation)
- ✅ §5 reconsideration triggers §5.6 cu concrete threshold (>30% session-tick budget overhead + parallel safety proof ≥2 engine pairs) = Q-OPEN-4 V1.5 candidate already documented
- ✅ Adapter contract `AdapterError` envelope D4 LOCKED leaves room for `severity` additive field (NU breaks existing V1 contract)

**Nothing fabricated.** All recommendations sourced from ADR 030 verbatim + ADR 026 cross-refs + V1 stub inline comments + concrete reconciliation between LOCKED V1 ADRs (ADR 025 vs Anti-Cascade Silent tension Q-OPEN-6).

---

## Next action recommended

**Daniel-strategic input session needed before subsequent prompt CC lock:**

1. **Q-OPEN-6 severity taxonomy concrete examples** — Daniel decide soft/hard policy per concrete engine failure scenarios (Tempo form breakdown, Bayesian convergence corruption, Specialization insufficient data, Periodization Constraint Object stale)
2. **Q-OPEN-7 cooldown threshold concrete values** — Daniel decide 7 zile minim cooldown? N=3 consecutive sessions? engagement-modulated?
3. **Q-OPEN-2 V1.5 escalation cadence** — Daniel decide when AbortController warranted (concrete latency threshold engine reproducibly p95 >50ms, OR concrete UX session-tick latency budget)
4. **Q-OPEN-5 offline-first UX behavior** — Daniel decide user-visible offline indicator threshold (silent staleness OK up to N min? always show "offline" indicator?)

**Co-CTO tactical lockable (Q-OPEN-1+3+4) — ready for prompt CC subsequent without Daniel block:**

Subsequent prompt CC:
- Apply Q-OPEN-1+3+4 tactical resolutions to ADR 030 §3 (Migration Runner integration + aggregate observability + sequential preserved)
- Add D4 amendment `severity` field additive (preparing Q-OPEN-6 hybrid resolution post-Daniel)
- DECISION_LOG entry + CURRENT_STATE §JUST_DECIDED top entry + INDEX_MASTER stats refresh per §CC.9

Q-OPEN-2+5+6+7 = separate strategic chat NEW dedicated cu Daniel CEO Product instinct.

🦫 **Co-CTO read-only analysis ZERO edits, ZERO commits, ZERO writes (except acest DRAFT artefact). Daniel review + lock + livra prompt CC subsequent.**
