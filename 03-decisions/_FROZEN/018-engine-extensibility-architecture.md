# ADR 018: Engine Extensibility Architecture

**Status:** Accepted
**Date:** 2026-04-27
**See also:** [[004-rule-engine-numeric-priorities]] | [[011-coach-decision-log-architecture]] | [[013-auto-aggression-detection]] | [[014-onboarding-profile-typing]] | [[INSIGHTS_BACKLOG]] | [[DECISION_LOG]]

---

## Context

Andura engineul actual e construit prin **acumulare hard-coded în `coachDirector.buildSession()`**. Fiecare nouă dimensiune (calibration tier, weakGroups, stagnation, prediction, recompile, AA detection, profile typing) a fost adăugată ca:

1. Un câmp nou pe `ctx` populat în `buildCoachContext()` sau direct în director.
2. Un apel hard-coded în `coachDirector.buildSession()` (ex: `applyAAAdjustments`, `applyPatterns`, `realityEngine.validate`).
3. Reguli noi în `ruleEngine.RULES` cu priorități numerice (ADR 004).

Patternul a funcționat pentru primele 5 dimensiuni dar a atins limita arhitecturală:

- **`coachDirector.buildSession()` are 240+ linii cu 6+ secțiuni hard-coded.** Adăugarea unei noi dimensiuni (Vitality Layer per ADR 016 backlog, Demographic Prior per ADR 017 backlog, Profile Typing tier-aware per ADR 014) forțează edit în director. Fiecare edit = surface refactor + risc regression pe toate dimensiunile existing.
- **Niciun contract uniform între dimensiuni.** AA detection întoarce `{tier, signals, escalating, amplified}`. Profile typing întoarce `{primary, secondary, confidence, scores, flags}`. Stagnation detector întoarce `{maxStagnationWeeks}`. Tooling (testare, debugging, trace) NU poate generaliza — fiecare dimensiune are pipeline propriu.
- **Schema CDL evoluează ad-hoc.** ADR 011 PATCH 2026-04-26 (autoAggression + rest_marked) e exemplu: schema extension fără versioning explicit. Pre-existing entries au `null` și aggregation engines trebuie să gestioneze backward compat manual. Următoarea extension (Vitality, Demographic Prior context, Profile Typing snapshot) repetă același pattern fără infrastructure.
- **Niciun rollout gradual.** Dimensiune nouă = LIVE pentru toți userii la merge time. Risc 0% → 100% fără faze. Vitality Layer cu friction zero-but-untested = candidate clar pentru rollout 10%/50%/100% + metric watch — currently impossible.

**Daniel articulation (sesiune 27 apr 2026 END, INSIGHTS_BACKLOG):**

> "engine extensibil prin natura lui — orice idee viitoare devine layer adăugabil, NU rewrite. Posibilitatea de îmbunătățire în orice etapă fără să moară."

**Problema:** fără un model formal de extensibilitate, fiecare ADR următor (016, 017, viitoare) e un mini-refactor coachDirector. Costul cumulat sufocă velocitatea de iterație. ADR 018 e foundation arhitecturală **înainte** de build features noi, NU after-the-fact cleanup.

**Scope ADR:** principle + 5 componente structurale + migration path pentru dimensiuni existing (AA + Profile Typing) → plugin. **NU spec implementabil.** Spec EXEC_QUEUE per componentă urmează post-acceptance.

---

## Decision

Adoptăm **5 componente structurale** care împreună definesc o arhitectură extensibilă pentru engine:

1. **Dimension Registry** — registru declarativ central (build-time) unde dimensiuni se înregistrează.
2. **Standardized Dimension Contract** — interfață uniformă `analyze(input) → DimensionResult`.
3. **Decision Cluster Engine** — pipeline staged care înlocuiește iteration hard-coded din `coachDirector`.
4. **Schema Versioning + Migration Runner** — versioned schemas + eager migration pe app load.
5. **Feature Flags Infrastructure** — runtime per-user rollout cu hashing deterministic.

Fiecare componentă în secțiunea proprie cu Context, Decision (sau Decision Points unde există trade-off real), Consequences, Implementation notes.

---

## 1. Dimension Registry

### Context

Coach Director are azi 6+ apeluri hard-coded către dimensiuni: `detectWeakGroups`, `detectGlobalStagnation`, `predictToday`, `recompileWeek`, `runProactiveChecks`, `applyAAAdjustments`, `applyPatterns`, `realityEngine.validate`. Fiecare e referit prin `import` direct + apel inline. Adăugarea unei dimensiuni noi = 2 fișiere edit minimum (modul nou + director).

Vrem: **director iterează un registry**, dimensiunea nouă = înregistrare nouă, **zero edit director**.

### Decision

Introducem `src/engine/dimensionRegistry.js` — modul export-ează un array static `DIMENSIONS` cu metadata + reference la modulul fiecărei dimensiuni.

```js
// src/engine/dimensionRegistry.js
import * as weakGroups from './dimensions/weakGroups.js';
import * as stagnation from './dimensions/stagnation.js';
import * as autoAggression from './dimensions/autoAggression.js';
import * as profileTyping from './dimensions/profileTyping.js';
// ... future imports

export const DIMENSIONS = [
  {
    id: 'WEAK_GROUPS',
    module: weakGroups,
    stage: 'ADJUSTMENT',
    priority: 70,
    enabledFlag: null,             // null = always on
    requiresCalibration: 'PERSONALIZING',
    schemaVersion: 1
  },
  {
    id: 'AUTO_AGGRESSION',
    module: autoAggression,
    stage: 'GATE',
    priority: 95,
    enabledFlag: 'aa_detection_v1',
    requiresCalibration: null,
    schemaVersion: 2
  },
  // ...
];
```

`coachDirector.buildSession()` iterează `DIMENSIONS`, apelează `module.analyze(input)` pe fiecare dimensiune activă, și pasează rezultatele Decision Cluster Engine (componenta 3).

### DP-1: Static array vs Dynamic registration API

Vezi secțiunea finală pentru detalii decision point.

### Implementation notes

- Registry e **export const** (immutable post-import). Nu există `register()` runtime în v1.
- Each dimension lives în `src/engine/dimensions/<id>.js`. Convenție de naming + locație fixed.
- Registry exportează helper `getActiveDimensions(ctx)` care filtrează pe `enabledFlag` (Feature Flags, componenta 5) + `requiresCalibration` (gate ADR 009).

---

## 2. Standardized Dimension Contract

### Context

Fiecare dimensiune existing întoarce shape diferit. Tooling unificat (trace, testing, CDL outcome injection, debugging UI) e imposibil. Profile Typing v1 (ADR 014) e on-deck pentru implementare — dacă nu pinneză contract acum, divergența se adâncește.

### Decision

Fiecare dimensiune EXPORTĂ funcția `analyze(input) → DimensionResult` cu signature:

```typescript
type DimensionInput = {
  ctx: CoachContext,                // current ctx snapshot
  cdl: CDLEntry[],                  // active (non-superseded) entries, Tier 1
  userProfile: UserProfile,         // tier, profile, settings
  flags: FeatureFlags               // resolved per-user
};

type DimensionResult = {
  id: string,                       // dimension id from registry
  tier: 'none' | 'LOW' | 'MED' | 'HIGH' | string,  // severity-like enum
  confidence: 'low' | 'medium' | 'high',
  signals: string[],                // human-readable signal IDs
  recommendations: Recommendation[],// see below
  trace: object,                    // free-form debug info, NU consumed de engine
  meta: object                      // dimension-specific (AA: {amplified, escalating}; profile typing: {scores, flags})
};

type Recommendation = {
  action: string,                   // 'gate_session' | 'reduce_volume' | 'inject_warning' | etc.
  priority: number,                 // 0-100, ADR 004 scale
  payload: object,                  // action-specific data (multiplier, message, etc.)
  rationale: string                 // human-readable why
};
```

**Contract guarantees:**

- **Pure function.** No side effects, no localStorage writes, no Firebase calls. (Side effects happen în Decision Cluster post-aggregation, vezi componenta 3.)
- **Deterministic.** Same input → same output. No `Date.now()` or `Math.random()` în analyze body — pass timestamp via `ctx`.
- **Total function.** Always returns DimensionResult — never throws on missing data. Insufficient data = `tier: 'none'`, `confidence: 'low'`, empty arrays.

### DP-2: Pure synchronous vs async-capable contract

Vezi secțiunea finală.

### DP-3: Recommendation priority scale — numeric (ADR 004) vs semantic stages only

Vezi secțiunea finală.

### Implementation notes

- Contract pinned în `src/engine/dimensionContract.js` ca JSDoc typedefs (ADR 005 vanilla JS, no TypeScript). Tooling lints conformance via test helper `assertValidDimensionResult(result)`.
- `signals[]` strings standardizate within each dimension (ex: AA `'volume_creep'`, `'frustration_markers'`). Cross-dimension signal IDs pot avea overlap (`'fatigue'` may fire de la AA + Vitality + Stagnation), each prefixed cu dimension id în trace dacă necesar.

---

## 3. Decision Cluster Engine

### Context

`coachDirector.buildSession()` azi face manual:

1. Apel `evaluate(ctx)` — Rule Engine ADR 004 returns single winner.
2. Hard-coded short-circuit pe `ruleResult.action === 'rest'`.
3. `applyAAAdjustments(session, ctx)` — manual mutation pe session (volume reduction, banner, blocked flag).
4. `realityEngine.validate(session, ctx)` — separate engine.
5. `applyPatterns(session, ctx)` — manual iteration pe `ctx.patterns`.

Asta e ad-hoc. Nu există un loc unic care decide "cum se combină rezultatele tuturor dimensiunilor în session final". Adăugarea unei dimensiuni noi forțează decision unde să intre în secvență — alegere implicită, nu explicită.

### Decision

Introducem `src/engine/decisionCluster.js` cu un pipeline **staged** în 3 etape:

```
DimensionResult[] → Stage 1 (GATE) → Stage 2 (ADJUSTMENT) → Stage 3 (ENHANCEMENT) → SessionPlan
```

**Stage 1 — GATE (highest priority, can short-circuit):**
- Examples: REST_DAY (readiness < threshold), AA HIGH tier blocker, calibration INITIAL gate
- Behavior: dacă orice dimensiune cu stage `GATE` întoarce recommendation cu `action === 'gate_session'`, pipeline scurt-circuitează → return rest/blocker session immediate. Multiple gates = highest priority wins (ADR 004 numeric).

**Stage 2 — ADJUSTMENT (additive, cumulative):**
- Examples: AA MED tier volume reduction, deload multiplier, weak group priority, stagnation deload, cut conservative
- Behavior: toate dimensiunile cu stage `ADJUSTMENT` aplică recommendations sequential pe session. Volume multipliers compose multiplicativ (`0.9 * 0.7 = 0.63`). Sets reduction caps acumulează.

**Stage 3 — ENHANCEMENT (presentation/UX layer):**
- Examples: pattern early-end shortening, banner injection, friction modal trigger, calibration banner text, alternative exercise resolution
- Behavior: aplicate sequential pe session pre-return. Modify `session.exercises`, attach UI metadata (`session.aaWarning`, `session.calibrationBanner`).

Each dimension declares `stage` în registry (componenta 1). Dimension cu `stage: 'GATE'` NU poate produce recommendation cu `action: 'inject_warning'` (mismatch detected → throw în testing, log warning în prod).

### DP-4: Stacked stages vs single-pass winner-takes-all

Vezi secțiunea finală.

### Implementation notes

- Decision Cluster e modulul care înlocuiește `applyAAAdjustments`, `applyPatterns`, partea de session mutation din `coachDirector`. Director devine subțire: build ctx → analyze all dimensions → cluster.execute(results) → write CDL → return.
- `cluster.execute(results, baseSession)` returnează `{ session, trace }` unde `trace` e structured log al tuturor recommendations + which fired + which were overridden. Aliniat cu ADR 011 §rationale (CDL `proposed.rationale.overridden`).
- Rule Engine (ADR 004) devine **un caz particular**: `ruleEngine.evaluate(ctx)` rămâne ca dimensiune cu `id: 'CORE_RULES'`, `stage: 'GATE'` (rest/deload) + `stage: 'ADJUSTMENT'` (cut conservative, weak group, stagnation). Migration path: split current ruleEngine în 2 dimensiuni (CORE_GATES + CORE_ADJUSTMENTS) sau lasă-l ca single dimension cu recommendations multiple. Decizie spec EXEC_QUEUE (nu DP — dimensional).

---

## 4. Schema Versioning + Migration Runner

### Context

ADR 011 schema a fost extinsă post-deployment de 3 ori (TASK #30.4 added `proposedSets` + `actualExercises` + `actualDurationMins`; PATCH 2026-04-26 added `outcome.autoAggression` + `outcome.rest_marked`). De fiecare dată: nullable fields + aggregation engines manually handle null = "not evaluated". Pattern funcționează dar e ad-hoc — nu există o `version` field pe entries, nu există migration code dedicat, nu există way de a forța recompute pentru entries vechi.

Cu Vitality Layer + Demographic Prior + Profile Typing snapshot pe roadmap, schema CDL + alte stores (profile-history, etc.) vor primi 3-5+ extension events în următoarele 6 luni. Fără infrastructure, fiecare extension repetă risk-ul.

### Decision

Introducem **schema versioning explicit** + **migration runner eager**:

**Per-entry version field:**

```js
// CDL entry
{
  id: 'cd_2026-...',
  schemaVersion: 3,                 // bumped on each schema change
  // ... rest
}
```

**Migration runner location:** `src/migrations/` cu fișier per migration (`v2-to-v3.js`, `v3-to-v4.js`, ...). Each export-ează:

```js
export const migration = {
  fromVersion: 2,
  toVersion: 3,
  description: 'Add outcome.autoAggression nullable',
  storageKeys: ['coach-decisions', 'coach-decisions-aggregate'],
  migrate(entry) {
    return {
      ...entry,
      schemaVersion: 3,
      outcome: entry.outcome ? { ...entry.outcome, autoAggression: null } : null
    };
  }
};
```

**Trigger:** Eager pe app load. Există un `runMigrations()` apelat o dată pe init (înainte de orice engine read). Migration runner detectează entries cu `schemaVersion < CURRENT_VERSION`, aplică chain de migrations sequential, persist back, log în console (Sentry warning în prod dacă > 100 entries migrate).

**Failsafe:** dacă migration throws pe orice entry, runner persist-ează entries deja migrate + lasă restul în vechi format + raises Sentry critical. App continuă (graceful degradation, aggregation engines deja gestionează null/missing fields per ADR 011 nullable patterns).

### DP-5: Migration trigger eager vs lazy

Vezi secțiunea finală.

### Implementation notes

- Versioning aplicat NU doar la CDL — și la `profile-history`, viitor `vitality-responses`, `coach-decisions-aggregate`. Fiecare storage key are propria current version constant.
- Versioning nu retroactivează: existing entries fără `schemaVersion` field tratate ca `version: 1` implicit la prima migration.
- ADR 011 Reconsideration Trigger #8 (schema drift) devine non-eveniment cu versioning explicit — drift e impossible dacă ADR + migration code + version constant sunt sincronizate (verificat în test).

---

## 5. Feature Flags Infrastructure

### Context

Vitality Layer (ADR 016 backlog) e candidate clar pentru rollout 10% → 50% → 100% — friction zero pe behavioral questions, dar discriminate power neuncalibrat empiric. Vrem să rulăm pe 10% useri, măsurăm engagement + signal quality, scale-up dacă verde.

Currently, niciun flag infrastructure. Tot e merge time = LIVE.

### Decision

Introducem `src/util/featureFlags.js`:

**Flag definition:**

```js
// src/util/featureFlags.js
export const FLAGS = {
  vitality_layer_v1:    { rollout: 0.10, default: false },
  demographic_prior_v1: { rollout: 0.00, default: false },
  aa_detection_v1:      { rollout: 1.00, default: true },
  profile_typing_v1:    { rollout: 0.50, default: false },
  // ...
};

export function isEnabled(flagId, userId) {
  // 1. Check localStorage override (`_devFlags`) — dev-only force
  // 2. Check rollout: hash(userId + flagId) % 100 < rollout * 100
  // 3. Fallback default
}
```

**Per-user deterministic bucketing:** `hash(userId + flagId)` produce un bucket stabil per (user, flag) pair. User în bucket 7/100 e MEREU în bucket 7 pentru flag X. Independent buckets per flag (nu același 10% pentru toate features).

**Local override pentru dev:** `localStorage._devFlags = '{"vitality_layer_v1": true}'` forțează enable indiferent de rollout. Doar pentru testing — strip-uit din production builds (sau warning vizibil în UI dacă active în prod build).

**Integration cu Dimension Registry:** dimensiune cu `enabledFlag: 'vitality_layer_v1'` e skipped în `getActiveDimensions(ctx)` dacă flag false pentru user. Zero apel `analyze()`, zero impact pe pipeline.

### DP-6: Per-user rollout vs global on/off

Vezi secțiunea finală.

### Implementation notes

- userId în Andura e currently anonymized local-first (no real auth — vezi ADR 001 + ADR 011 reconsideration trigger #6). Bucket hash poate folosi `localStorage.user-id` (generated UUID at first run) sau `firebase.uid` când multi-tenant deploys.
- Flag changes (rollout %) = cod change (export const). NU runtime-mutable. Pentru runtime A/B: read flags from Firebase config node `users/_global/featureFlags` (alt scope, viitor extension — nu v1).

---

## Migration Path: AA + Profile Typing → plugin

ADR 013 (AA detection) și ADR 014 (Profile Typing) sunt deja **specificate** și pe cale de implementare. ADR 018 vine în paralel — vrem să le portăm în noua arhitectură **fără rupere**.

### Fase migration

**Faza 0 — Foundation (Sprint 1):**
- Build Dimension Registry + Standardized Contract + Decision Cluster (componente 1, 2, 3) ca module noi, NU connected la coachDirector încă.
- Build Schema Versioning + Migration Runner (componenta 4) cu o migration v1→v2 trivial (add `schemaVersion` field) — exercise infrastructure.
- Build Feature Flags (componenta 5).

> **AMENDMENT 2026-04-30 — clusterTrace adapter status (Q-0080):**
> AUDIT_5000Q Q-0080 a flagged clusterTrace → ADR 011 `proposed.rationale.overridden` adapter ca HIGH-1 deferred status open. Clarification SSOT:
>
> **Status:** **pending Sprint 3 strangler integration.** Adapter NU este in scope Faza 0/Foundation. Integration cu CDL `proposed.rationale.overridden` field happens când strangler swap LWW → T&B (Sprint 3) + AA detection migration la dimension contract (per Faza 1 below) — both depind de schema versioning runner stable.
>
> **Sprint 1 livrează:** doar amendment SSOT (acest paragraf). Sprint 2 = Foundation infrastructure scaffold. Sprint 3 = clusterTrace adapter live integration.
>
> Cross-ref AUDIT_5000Q Q-0080 + [[011-coach-decision-log-architecture]] amendment §Firebase sync (T&B mandatory pre-launch).

**Faza 1 — Strangler pe AA detection (Sprint 2):**
- Re-implement AA detection ca dimension `src/engine/dimensions/autoAggression.js` ce expune `analyze(input)`.
- Register în `dimensionRegistry.js` cu `stage: 'GATE'` (HIGH tier blocker) + `stage: 'ADJUSTMENT'` (MED tier volume reduction). Split în 2 entries dacă necesar sau single cu multiple recommendations.
- `enabledFlag: 'aa_detection_v1'` cu rollout 1.0 (already live functionally).
- coachDirector skip apel direct `applyAAAdjustments` când dimension activ. Rollback path: flag false → director cade pe code path vechi.
- Testing: parallel run pe sample sessions, compare output direct call vs cluster output. Zero divergence requirement.

**Faza 2 — Profile Typing as dimension (Sprint 3):**
- Profile Typing currently spec ADR 014 (nu implementat încă). Implement DIRECT ca dimension de la start — skip legacy path entirely.
- Dimension `src/engine/dimensions/profileTyping.js` cu `analyze(input)` care:
  - Citește profile-history (storage key per ADR 014)
  - Întoarce `tier: 'Sprinter' | 'Marathon' | 'Yo-yo' | 'Strategic' | 'unknown'`
  - `meta: {selfReportPrimary, behavioralPrimary, confidence, scores, flags}`
  - `recommendations: []` în v1 (informational only, downstream dimensiuni consumă tier — ex: AA detection thresholds calibrated per profile).

**Faza 3 — Existing rules → CORE_RULES dimension (Sprint 4):**
- Wrap `evaluate(ruleEngine)` ca dimension cu `id: 'CORE_RULES'`. Multiple recommendations output (one per fired rule).
- Decision Cluster handle composition (REST_DAY → GATE; CUT_CONSERVATIVE/WEAK_GROUP/STAGNATION → ADJUSTMENT; PATTERN_EARLY_END → ENHANCEMENT).
- coachDirector pierde toate apelurile direct la engines. Devine ~50 LOC: build ctx → execute cluster → write CDL → return.

**Faza 4 — Greenfield dimensions (Sprint 5+):**
- Vitality Layer (ADR 016) implementat de la start ca dimension. Rollout 10%.
- Demographic Prior (ADR 017) ca dimension ce inject-ează context la cold start.

### DP-7: Aggressive vs gradual migration tempo

Vezi secțiunea finală.

---

## Consequences

### Positive

- **Zero-edit-director pentru dimensiuni noi.** Înregistrare în registry + creare modul = dimension live. Coach Director becomes generic orchestrator.
- **Tooling unified.** Test helpers, debug UI, CDL trace injection — toate generalizate la DimensionResult contract.
- **Rollout safety.** Vitality + Demographic + future features pot fi deployed pe 10% → 50% → 100% cu metrics watch.
- **Schema evolution explicit.** Versioning + migration runner elimină pattern-ul ad-hoc PATCH-2026-04-26. Drift impossible by construction.
- **AA + Profile Typing future-proof.** Migration path concret + reversible (flag fallback).
- **Ecosystem ready.** ADR 016 (Vitality), ADR 017 (Demographic Prior) build directly pe această fundație — zero refactor cost când ajung la spec.

### Negative

- **Upfront cost ~1-2 sprints (4-6 zile dev).** Foundation work fără feature visible end-user. Daniel sign-off pe trade-off explicitly.
- **Indirection layer.** Debugging un session decision necesită trace prin registry → cluster → dimension. Noile entries în CDL trebuie să capture stage trace (extension la `proposed.rationale`).
- **Contract rigidity.** Toate dimensiunile trebuie să respect signature `analyze(input) → DimensionResult`. Caz edge: dimension care vrea să exporte side-effect (ex: trigger UI prompt) trebuie să încapsuleze ca recommendation cu `action: 'inject_prompt'` consumat de Stage 3 enhancements. Inflexibility intentional.
- **Migration risk.** Faza 1-3 strangler pattern means parallel paths exist temporar. Risk of divergence dacă testing parallel-run insufficient. Mitigation: golden-master tests pe sample sessions (input → expected session output) executate pe ambele paths.

### Risks

- **Over-engineering pentru scale curent.** Andura are 1 user real (Daniel) + ~80 sesiuni. Infrastructure pentru rollout 10% e overkill la N=1. Mitigation: build minimal viable infrastructure now (registry + contract + cluster mandatory; feature flags + migration runner light implementation; expand când scale demands).
- **Dimension Contract evolution.** DimensionResult shape may itself need evolution (ex: cross-dimension dependency declaration). Mitigation: versionează contract ca aircraft engineering (ADR 018 v1, v2 ulterior dacă nevoie).
- **Performance.** Iterating registry + chaining stages adaugă ~ms latency vs hard-coded calls. Mitigation: măsoară pre/post Faza 1 implementation. Threshold concern: > 50ms degradation pe `buildSession()`.

---

## Reconsideration Triggers

1. **Dimension count plateau < 8 după 12 luni** → infrastructure over-built. Audit dacă some abstraction layer poate fi colapsat.
2. **Cluster performance > 100ms** → optimization required (caching, parallel async dimensions).
3. **Schema migration runner failing > 5% entries** → infrastructure design flaw. Consider event-sourcing storage instead of in-place mutation.
4. **Feature flag rollout NU folosit timp de 6 luni** → infrastructure mort, simplifică la global on/off.
5. **Cross-dimension dependencies emerge** (ex: Vitality result feeds AA detection thresholds) → contract necesită extension pentru declared dependencies + topological ordering în cluster.
6. **Multi-tenant auth deployed (per ADR 011 trigger #6)** → flag bucketing migrate de la localStorage uid la firebase auth uid. Schema migration v_X→v_Y (re-bucket all flags).

---

## Implementation Notes

**Scope ADR:** principle + 5 componente structurale + migration path. **NU spec implementabil.**

**Dependencies critical:**

- ADR 004 (Rule Engine numeric priorities) — mostenită. Priority scale 0-100 reused în Recommendation.priority.
- ADR 011 (CDL) — schema versioning runner aplicat la CDL ca first storage. proposeSets versioning pattern clarification în CDL.
- ADR 013 (AA detection) — primul candidate strangler.
- ADR 014 (Profile Typing) — implement direct as dimension, skip legacy path.
- ADR 016 (Vitality, backlog) — depinde de ADR 018 acceptat.
- ADR 017 (Demographic Prior, backlog) — depinde de ADR 018 acceptat.

**Ordine recomandată implementation:**

1. ADR 018 sign-off Daniel (toate DP-uri rezolvate)
2. Foundation Sprint — Registry + Contract + Cluster + Versioning + Flags (4-6 zile)
3. Strangler AA detection (~2-3 zile) — golden-master tests parallel run
4. Profile Typing direct as dimension (paralelizat cu spec EXEC_QUEUE ADR 014) — ~2 zile
5. CORE_RULES wrapping (~1-2 zile, low-risk pure refactor)
6. Vitality Layer + Demographic Prior dimensions ca first greenfield (post-ADR 016 + 017 sign-off)

---

## Decision Points — Daniel Sign-Off Required

7 decision points marcate. Toate au trade-off real cu > 1 opțiune viable. Decision points "best-practice unanim industry" decise în-line în ADR fără DP marker.

### DP-1: Registry — static array vs dynamic registration API

**Options:**
- **A:** Static `export const DIMENSIONS = [...]` build-time array. Adăugare dimensiune = edit registry file.
  - Pros: simple, predictable, zero runtime mutation, easy code-search ("unde e înregistrat X?" = grep id în registry).
  - Cons: imposibil plugin marketplace runtime / config-based dimension activation.
- **B:** Dynamic `register({ id, module, ... })` API + JSON config opțional.
  - Pros: enables config-driven activation (ex: feature flag toggle entire dimension via remote config), plugin marketplace future.
  - Cons: complexity overhead (registry mutation order matters), harder to audit which dimensions active la runtime, premature optimization la scale curent.

**Recommendation:** A — Static array. Andura are 1 user și no plugin marketplace requirement. Static array e zero-cost auditable și migration la dynamic e cheap dacă/când nevoie. YAGNI clearly.

**Need Daniel sign-off:** YES

---

### DP-2: Contract — pure synchronous vs async-capable

**Options:**
- **A:** Sync only. `analyze(input)` întoarce DimensionResult direct.
  - Pros: deterministic, no scheduling complexity, current pattern.
  - Cons: Demographic Prior dimension (ADR 017) consultă fixture lookup which may be lazy-loaded. Future I/O dimensions blocked.
- **B:** Async-capable. `analyze(input)` poate întoarce DimensionResult sau Promise<DimensionResult>; cluster awaits if Promise.
  - Pros: future-proof pentru I/O. Zero cost when unused (sync return wraps trivial).
  - Cons: cluster execution time non-deterministic if any dimension awaits I/O. Cache-unfriendly.

**Recommendation:** B — async-capable cu sync default. Cluster execute via `Promise.all(activeDimensions.map(d => Promise.resolve(d.analyze(input))))`. Sync dimensions cost ~zero overhead. Demographic Prior (ADR 017) și future LLM-backed dimensions need this hatch.

**Need Daniel sign-off:** YES

---

### DP-3: Recommendation — numeric priority (ADR 004) vs semantic stages only

**Options:**
- **A:** Numeric priority 0-100 per recommendation (ADR 004 alignment) + semantic action label.
  - Pros: continuity ADR 004, deterministic conflict resolution (winner-takes-all per stage), trace-friendly.
  - Cons: priority numbers cross-dimension trebuie coordonate (cine e priority 95? AA HIGH? REST_DAY?). Risk de coliziuni.
- **B:** Semantic stages only (`'GATE'`, `'ADJUSTMENT'`, `'ENHANCEMENT'`) fără priority numeric. Conflict resolution = ordine de înregistrare în registry.
  - Pros: simplu, no number coordination. Stages explicit.
  - Cons: ordine în array devine implicit-significant, harder to audit. Conflict ("două ADJUSTMENT-uri vor să modifice volumeMultiplier — care wins?") impossible to reason without explicit priority.

**Recommendation:** A — numeric priority + semantic stage. Hybrid e cheap: stage gates pipeline (componenta 3), priority resolves conflicts within stage. Continuity ADR 004 + trace consistency CDL `rationale.winnerPriority`.

**Need Daniel sign-off:** YES

---

### DP-4: Decision Cluster — stacked stages vs single-pass winner-takes-all

**Options:**
- **A:** Single-pass winner-takes-all (extension ADR 004). All recommendations sorted by priority, highest fires, restul trec în `overridden`.
  - Pros: simplest mental model, ADR 004 continuity literal.
  - Cons: incompatibil cu reality. AA HIGH tier blocker + REST_DAY (readiness <40) — both need to fire (gate + alternate session). Volume multipliers (deload + cut conservative + AA MED) need to compose multiplicativ, NU one-wins.
- **B:** Stacked stages: GATE → ADJUSTMENT → ENHANCEMENT. Stage 1 short-circuits. Stage 2 + 3 cumulate sequential.
  - Pros: matches reality (gates + cumulative adjustments + UX layer). Each stage has clear semantics.
  - Cons: more complex than ADR 004 winner-takes-all. Stage assignment per dimension = design decision per dimension.
- **C:** Fully cumulative (no stages). Toate recommendations apply în order, no short-circuit.
  - Pros: maximum flexibility.
  - Cons: AA HIGH blocker + normal session adjustments fire both = nonsense. Need short-circuit.

**Recommendation:** B — stacked stages. Match arhitectura existing (`coachDirector` already does effective gate-then-adjust-then-enhance, just hard-coded). Formalizes existing pattern + makes stages explicit metadata în registry.

**Need Daniel sign-off:** YES

---

### DP-5: Migration Runner — eager (app load) vs lazy (on read)

**Options:**
- **A:** Eager — `runMigrations()` la app init, before any engine read. Single batch pass.
  - Pros: simpler downstream code (readers assume current schema), single point of failure, fail-loud.
  - Cons: startup latency proporțional cu entries needing migration. User cu 1000 entries × 50ms migration = 50s freeze (unrealistic but illustrative).
- **B:** Lazy — readers check `entry.schemaVersion`, migrate on read.
  - Pros: zero startup cost, amortized across reads.
  - Cons: every reader must know about migrations, harder to reason about consistency (some entries migrated, some not), partial migration state confusing.

**Recommendation:** A — eager. Local-first storage (ADR 001), CDL Tier 1 max ~250 entries (180 days × ~1.4 sessions/day Daniel), migrations sub-millisecond per entry. Fail-loud > fail-silent. Sentry alert pe > 100 entries migrate.

**Need Daniel sign-off:** YES

---

### DP-6: Feature Flags — per-user rollout vs global on/off

**Options:**
- **A:** Per-user rollout cu hash bucketing. Flag `{rollout: 0.10}` enables for 10% users deterministic.
  - Pros: enables 10%/50%/100% gradual rollout per Daniel articulation INSIGHTS_BACKLOG. Independent buckets per flag prevent correlated rollout.
  - Cons: infrastructure overhead (hashing, bucketing logic) la scale N=1 user.
- **B:** Global boolean per flag. `{enabled: true}` all-or-nothing.
  - Pros: dead simple.
  - Cons: doesn't enable gradual rollout. Vitality + Demographic Prior need rollout safety per ADR 016/017 backlog notes.

**Recommendation:** A — per-user rollout. Hash bucketing e ~20 LOC, zero ongoing cost. La N=1 user (Daniel), Daniel = bucket fixed per flag, deterministic for testing. La N=100+ enables real rollout. Build-once, scale-forever.

**Need Daniel sign-off:** YES

---

### DP-7: Migration tempo AA + Profile Typing — aggressive vs gradual

**Options:**
- **A:** Aggressive — refactor coachDirector în-loc, port AA + Profile Typing simultaneously, decommission legacy paths cu același merge.
  - Pros: faster, single coordinated change, no parallel paths.
  - Cons: high blast radius, harder rollback, regression risk pe toate dimensiuni simultane.
- **B:** Gradual strangler — register infrastructure, port one dimension at a time, keep legacy paths active gated by feature flag, remove legacy after parallel-run validation per dimension.
  - Pros: rollback path per dimension, regression isolated, golden-master testing per port.
  - Cons: parallel paths exist temporar (3-5 sprints), harder to read code during transition.

**Recommendation:** B — gradual strangler. Match pattern ADR 011 decommissioning `applied-patterns` (parallel run + triggers + audit gate). Coach Director e core engine — blast radius mare. AA detection currently în production, regression = silent learning corruption.

**Need Daniel sign-off:** YES

---

## Sign-Off — 2026-04-27

Daniel approved 7/7 decision points after triangulation review (Claude chat pre-stance vs Opus draft).

- DP-1 Registry static array: APPROVED
- DP-2 Contract async-capable: APPROVED
- DP-3 Recommendation numeric priority + semantic stage hybrid: APPROVED
- DP-4 Cluster stacked stages (GATE→ADJUSTMENT→ENHANCEMENT): APPROVED
- DP-5 Migration eager: APPROVED
- DP-6 Feature flags per-user rollout cu hash bucketing: APPROVED
- DP-7 Migration tempo gradual strangler: APPROVED

*ADR 018 — Accepted 2026-04-27*

---

## §CROSS-REF 2026-05-08 — ADR 030 §3.1 Q-OPEN-1 RESOLVED V1

ADR 030 §3.1 RESOLVED V1 2026-05-08 chat NEW birou locks Migration Runner orchestrator-level pre-pipeline integration:

- **Integration point:** `src/coach/orchestrator/contextBuilder.js` `buildEngineContext(userState)` invokes ADR 018 §4 Migration Runner BEFORE shape freeze
- **Schema version tracking:** `EngineContext.meta.schemaVersion` field tracks running migration generation
- **Adapter D2 thin scope preserved:** Adapter consumes already-migrated canonical shape — pure mapping unchanged
- **No ADR 018 amendment needed** — §4 eager-on-app-load LOCKED V1 alignment confirm (orchestrator pre-pipeline NOT duplicate per-adapter)

*Cross-ref added 2026-05-08 chat NEW birou Run ADR 030 Q-OPEN-1→7 RESOLVED V1 batch.*
