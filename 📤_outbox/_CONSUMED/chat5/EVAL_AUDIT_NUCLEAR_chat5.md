# Eval Audit Nuclear chat 5 — Pre-Beta AI/Engine Evaluation

**Date:** 2026-05-23
**Auditor:** gsd-eval-auditor Opus subagent (worktree `agent-ad15f20d8a2716868`, read-only)
**Scope:** Pre-Beta evaluation strategy AI features + engine pipeline — distinct lens de security / UI / code review parallel agents
**Framework:** "AI Evals for Everyone" + ai-evals.md reference (~/.claude/get-shit-done/references/ai-evals.md)

> NOTĂ — Andura nu este sistem LLM/agentic. Coach-ul = rule-based engine orchestrator (Big 11 pipeline + composers). Aplicăm framework-ul AI evals la engine outputs deterministe + composer wording (rubric pe accuracy + guardrails + persona scenario coverage + failure-mode surfacing), NU pe LLM judges/RAG. Coach-voice scenarios sunt single open dimension care AR mapa la LLM eval (langwatch) — vezi §3.

---

## §0 Verdict TL;DR

**YELLOW — Engineering eval foundation solidă, dar 3 BLOCKER + 2 WARNING ascund stale-LOCK + persona scenario coverage 0%.**

Engine pipeline = 142 test files (106 engine `.test.js` + 36 React `.test.ts`), 5387+ PASS baseline. Reference dataset 3 personas + 4 edge cases este Bugatti craft. DAR:

- **BLOCKER 1** — D063 LOCKED V1 promises `assert_all_adapters_instrumented.test.ts` anti-drift static-scan file → fișier **NU există în cod**. Real coverage = 12 witness tests în `engineWrappers.sentry.test.ts` (per-call assertion). Future adapter additions break invariant NU emit visible CI failure → silent drift hazard pe care D063 era proiectat să blocheze. PRE_BETA_CHECKLIST §1.3 + §1.6 cite ambele acest fișier "LANDED" — primary-source slip.
- **BLOCKER 2** — `tests/engine/coach-scenarios/coach-voice.scenarios.test.ts` are 7/7 scenarios = `it.todo()` DEFERRED. Persona scenario eval coverage Gigel/Marius/Maria 65 pe coach voice output = **0%**. Engine signals testate dar coach wording string surface (anti-paternalism, RIR safety, joint pain, bulk→cut, recovery, deload, per-set safety) NU evaluat sistematic.
- **BLOCKER 3** — SHAPE_CHECK_INTEGRATION_AUDIT chat 5 CRITICAL #2/#3 (pr-records + logs production-empty post-D028 vanilla retire) **NU rezolvat** (status verificat 2026-05-23 outbox raport singur, citat în DECISIONS_CHAT5_DRAFT §P11). Toate engines downstream care citesc `DB.get('logs')` (readiness, fatigue, adherence, aa, dp, patternLearning, stagnationDetector) silently rulează permanent baseline starved în producție. Eval baseline tests verifică engine logic working, dar producția = input-starved drift care NU prinde dimensionally.
- **WARNING 1** — D063 wording "Big 11 pipeline 11/11 adapters wrapped" conflează React wrapper layer (`engineWrappers.ts` = 11 try/catch + Sentry capture) cu orchestrator pipeline adapters (`src/coach/orchestrator/adapters/*.js` = 8 adapters, ZERO `captureException`). Adapter-level Sentry coverage la pipeline level real = 0/8, NU 11/11. Anti-drift gate misnamed.
- **WARNING 2** — Telemetry events restricted la 13 auth/onboarding/account/merge events (`src/util/telemetry.js`). ZERO engine-output telemetry (e.g., when MMI silent cap activează, when readiness baseline-vs-engine flag flips). Production monitoring observability gap pentru engine layer.

---

## §1 Coverage

### Engine pipeline (Big 11 + adjacent) — JS engine layer

| Engine / Module | Has impl | Has tests | Production-wired React | Notes |
|---|---|---|---|---|
| readiness | ✓ `src/engine/readiness.js` | ✓ `readiness.test.js` | ✓ via `engineWrappers.getReadiness` | DB.get('logs') input-starved post-D028 (CRITICAL #3) |
| fatigue | ✓ `fatigue.js` | ✓ `fatigue.test.js` | ✓ via `getFatigue` | Input-starved cascade |
| adherence | ✓ `adherence.js` | ✓ `adherence.test.js` | ✓ via `getAdherenceOutput` | Input-starved cascade |
| prEngine | ✓ `prEngine.js` | ✓ `prEngine.test.js` | ✓ via `getPRDelta` | Session-scope only, no cross-session PR persistence |
| stagnationDetector | ✓ `stagnationDetector.js` | ✓ `stagnationDetector.test.js` | ✓ via `getPatternsBanner` (composer) | Composers consume sessionsHistory (NU starved) |
| patternLearning | ✓ `patternLearning.js` | ✓ `patternLearning.test.js` | partial via coachContext | DB.get('logs') starved |
| dp (deload protocol) | ✓ `dp.js` | ✓ `dp.test.js` | ✓ indirect via orchestrator | Starved |
| aa (anti-abuse) | ✓ `aa.js` | ✓ `aa.test.js` | ✓ direct + golden-master strangler | Starved |
| tempo (warmup blueprint) | ✓ `warmup/routineComposer.js` | ✓ multi-test suite | ✓ via orchestrator `warmupAdapter` | OK (no DB.get reliance) |
| weaknessDetector | ✓ `weaknessDetector.js` | ✓ `weaknessDetector.test.js` | ✓ via `getLaggingSignal` composer | OK |
| muscleRecovery | ✓ `muscleRecovery.js` + constants | ✓ `muscleRecovery.test.js` + DECAY_RATE invariant | ✓ via `getCoachRestReason` composer | OK |
| bayesianNutrition | ✓ module + sub-engines | ✓ 8+ tests + kalman.test invariants (1000 fast-check) + golden-master snapshots persona | ✓ via `getNutritionTargetsToday` | OK |
| MMI Engine #9 (muscleMemoryAdapter + applyMuscleMemoryUpgrade) | ✓ `muscleMemoryAdapter.js` + `muscleMemoryIndex.js` | ✓ `muscleMemoryAdapter.test.js` + 13 tests în `engineWrappers.mmi-silent-cap.test.ts` | ✓ engine LANDED commit `53b97dff` (D066) | **Pr-records DB.get production-empty** = MMI cap niciodată firează în producție real (CRITICAL #2 SHAPE_CHECK) |
| profileTyping | ✓ `profileTyping.js` | ✓ `profileTyping.test.js` + `profileTyping.personas.e2e.test.js` (3 persona scenarios real) | ✓ via coachContext | OK |

### React/Composer layer (`engineWrappers.ts`)

11 wrapper functions cu try/catch + Sentry `captureException` fallback. Coverage:

| Wrapper | Test (in `engineWrappers.sentry.test.ts`) | Notes |
|---|---|---|
| getReadiness | ✓ | Starved input prod |
| getFatigue | ✓ | Starved |
| getPRDelta | ✓ | OK |
| getAdherenceOutput | ✓ | Starved |
| getProactiveAlerts | ✓ | OK |
| getTodayWorkout | ✓ | OK |
| getNutritionTargetsToday | ✓ | OK |
| getPatternsBanner (STAGNATION sub) | ✓ | OK (composer = sessionsHistory) |
| getPatternsBanner (LOW_ADHERENCE sub) | ✓ | OK |
| getCoachRestReason | ✓ | OK |
| getLaggingSignal | ✓ | OK |
| getCoachTodayQuote | ✓ | OK |

12 witnesses ≈ 1 per catch path. **MISSING:** static-scan test that asserts "every exported `engineWrappers.ts` function with a try/catch invokes `captureException` cu `source: engine-adapter-fallback` tag" — this is the actual anti-drift gate D063 promised. Current witness suite = per-call assertion, does NOT fail when new adapter is added without Sentry wrap.

### Orchestrator pipeline (`src/coach/orchestrator/`)

| Adapter | Impl | Parity test | Sentry instrumentation | Notes |
|---|---|---|---|---|
| periodizationAdapter | ✓ | ✓ `periodizationParity.test.js` | ✗ ZERO `captureException` | D063 covers wrapper layer NU pipeline |
| goalAdaptationAdapter | ✓ | ✓ | ✗ | |
| energyAdjustmentAdapter | ✓ | ✓ | ✗ | |
| bayesianNutritionAdapter | ✓ | ✓ | ✗ | |
| tempoAdapter | ✓ | ✓ | ✗ | |
| specializationAdapter | ✓ | ✓ | ✗ | |
| warmupAdapter | ✓ | ✓ | ✗ | |
| deloadAdapter | ✓ | ✓ | ✗ | |

Pipeline-level orchestrator (`runPipeline`) has telemetry sub-span hook `onSubSpan` (ADR 030 §3.3) emit per-adapter `{adapterId, durationMs, ok, errorCode, severity}` — observability hook EXISTS DAR `onSubSpan` consumer NU wired la production Sentry (search shows no caller passes `onSubSpan` from React side). Telemetry hook = orphan.

---

## §2 Eval rubric per engine

### What is rubric-defined per ai-evals.md framework?

Per ai-evals §Rubric Design: rubric must define dimension + scores 1/3/5 (or pass/fail) + domain examples acceptable/unacceptable. **Current Andura state:**

| Dimension | Rubric explicit | Score levels defined | Domain examples | Verdict |
|---|---|---|---|---|
| **Engine numerical output correctness** | Implicit via golden master snapshots (`bayesian-nutrition.test.ts.snap`) | Pass/fail binary | 3 persona contexts (Gigel/Marius/Maria) | COVERED — characterization tests freeze current behavior; PR diff = explicit review trigger |
| **Engine input validation (T0 fresh vs T2+T3 history)** | Implicit via tier system (`T0`/`T1`/`T2`/`T3` în Persona type) | Tier-based gates documented (e.g., `LOW_ADHERENCE_MIN_SESSIONS_GATE=3`) | Persona fixtures explicit covered T0+T2+T3 | COVERED |
| **Kalman convergence + Bayesian posterior validity** | EXPLICIT — `kalman.test.ts` 6+ property-based invariants × 1000 fast-check runs (finite mu+sigma, posterior between prior+observation, sigma never negative, R² gate triggers) | Property invariants binary | All numerical inputs in safe ranges | COVERED |
| **kcal floor invariant (LOCK 8 D-LEGACY-041)** | EXPLICIT — `kcal-floor.test.ts` + observation filter excludes sub-1200 entries | Binary | Sub-1200 observations filtered | COVERED |
| **Coach voice anti-paternalism** | Documented în `coach-voice.scenarios.test.ts` BUT all `it.todo()` | Rubric criteria PRESENT în comments (anti-guilt-tripping, no "you should", RO no-diacritics) | 7 scenarios documented (Gigel skip / Marius PR / Maria joint / bulk→cut / injury / deload / per-set safety) | **MISSING** — implementation = `it.todo()` 7/7. Rubric exists pe paper, ZERO automated check |
| **Adapter severity classification (soft/hard)** | EXPLICIT — `orchestrator.test.js` covers ADR 030 §3.6 taxonomy | Pass/fail per code: BUDGET_EXCEEDED→soft, INVALID_INPUT/ENGINE_THREW/ADAPTER_THREW→hard | Test cases per code | COVERED |
| **Constraint Object propagation** | EXPLICIT — `orchestrator.test.js` verifies frozen + downstream consumer reads | Pass/fail | Periodization→downstream chain tested | COVERED |
| **MMI bucket cap correctness (0.80x / 0.70x / 0.60x by pause months)** | EXPLICIT — `engineWrappers.mmi-silent-cap.test.ts` 13 tests cover all 3 buckets + edge cases | Binary numerical | 7mo/18mo/25mo buckets + userChoice refused + no pr-records | COVERED (logic-level) but **PARTIAL prod relevance** — pr-records empty in production cascade prevents firing |
| **Profile typing behavioral classification** | EXPLICIT — `profileTyping.personas.e2e.test.js` 3 scenarios (Yo-yo Gigel / Strategic Marius / Marathon Maria) | Pass/fail per archetype | Synthetic CDL entries (scenarioYoyo/Strategic/Marathon) | COVERED |
| **Sentry consent gate (D055)** | EXPLICIT — `sentry-consent-gate.test.ts` 9 tests (default + subscribe + anti-drift prod-source check) | Pass/fail | telemetryOptIn false/true/transition | COVERED |
| **Romanian no-diacritics (D-LEGACY-064)** | EXPLICIT — D058 closure + grep-based literal check | Pass/fail | All UI + tests + commits | COVERED |
| **Composer wording correctness (RO patterns)** | Implicit via composer tests + snapshot diff | Pass/fail | Static strings tested | PARTIAL — wording stability via snapshot diff, dar NO LLM-judge calibration pentru voice/tone subjective dimension |

---

## §3 Reference dataset

### Strengths

`tests/fixtures/personas.ts` = Bugatti baseline:

- 3 canonical personas mapped la Andura archetypes:
  - `personaGigelT0` — Tier 0 cold-start novice, 32M, zero history, onboarding incomplete, cut goal
  - `personaMariusT2` — Tier 2 intermediate, 28M, 30 days history (adherence 0.85, kcalBase 2400, seed 1337), cut goal, vitality high
  - `personaMaria65T3` — Tier 3 conservative 67F, 90 days history (adherence 0.7, kcalBase 1700, seed 2026, knee-left joint), maintain goal, vitality medium
- 4 edge cases (perfectAdherence30d, zeroAdherence30d, bulkToCutDay15, injuryRecovery14d)
- Deterministic seeded mulberry32 RNG = reproducible cross CI runs
- Vitest fixture extension pattern (type-safe inject)

PLUS:

- `tests/golden-master/profiles/generated/gen-001..030.json` = 30 generated profiles
- `tests/golden-master/profiles/manual/sample-profile.json` = manual fixture
- `tests/fixtures/cdlEntries.js` = synthetic Coach Decision Log entries scenarioYoyo/Strategic/Marathon

### Diversity coverage assessment

| Dimension | Persona coverage | Verdict |
|---|---|---|
| Tier (T0/T1/T2/T3) | T0+T2+T3 present, T1 absent | PARTIAL — T1 (returning, < 30 day history) not covered |
| Goal (cut/maintain/bulk) | cut+maintain present, bulk only in edgeCases | PARTIAL |
| Age (young/mid/senior) | 32/28/67 — gap mid-50s | PARTIAL |
| Sex (M/F) | 2M + 1F | OK |
| Adherence (low/mid/high) | 0.7/0.85 + edge 0/1 | OK |
| Joint care | knee-left only (Maria) | PARTIAL — back/shoulder/wrist absent |
| Experience (novice/beginner/intermediate/advanced) | novice+beginner+intermediate, advanced absent | PARTIAL |
| Pause months (returning user) | NOT in canonical, only în MMI test fixtures | PARTIAL — `pauseMonths` 7/18/25 hardcoded în mmi-silent-cap test, NU în persona fixture |

### Quantity verdict

3 canonical + 4 edge = 7. Per ai-evals "start with 10-20 high-quality examples" — **slightly below baseline minimum**. Plus 30 generated profiles golden master = quantity OK, but `gen-XXX.json` not yet linked la persona dimension diversity (need spec review).

---

## §4 Failure modes

### Silent degradation patterns

| # | Pattern | Detection mechanism | Status |
|---|---|---|---|
| 1 | Engine input-starved (DB.get('logs') empty post-D028) | None automated — discovered manual chat 5 SHAPE_CHECK_INTEGRATION_AUDIT CRITICAL #3 | **MISSING** — no test asserts "logs populated post first session finish" |
| 2 | Pr-records production-empty (MMI silent cap dead-path) | None automated — discovered chat 5 CRITICAL #2 | **MISSING** — no integration test wires PostRpe → DB.set('pr-records') |
| 3 | Engine returns malformed shape → adapter falls back baseline silently | Sentry capture via `engine-adapter-fallback` tag | COVERED |
| 4 | Engine throws → wrapper returns null/baseline | Same Sentry tag + try/catch | COVERED |
| 5 | New adapter added without Sentry wrap | D063 promised `assert_all_adapters_instrumented.test.ts` static scan | **MISSING** — file does NOT exist; current witness suite only tests existing 11 wrappers |
| 6 | Orchestrator adapter throws bypassing severity classification | `runPipeline` ADAPTER_THREW catch + hard halt | COVERED |
| 7 | LastSessionSummary shape mismatch vs pipeline `recentSessions` (rir/energy/weekIdx/injury absent) | None automated — discovered SHAPE_CHECK HIGH #1 | **MISSING** — no contract test |
| 8 | PR Wall empty (set.isPR never set true in PostRpe) | None automated — discovered SHAPE_CHECK MEDIUM #8 | **MISSING** |
| 9 | userChoice='refused' MMI override respected | mmi-silent-cap test covers explicit refuse | COVERED |
| 10 | Modulepreload stale-hash post deploy | D064 requestIdleCallback hash-agnostic | COVERED design-side |

### Edge cases (per `edgeCases` fixture)

- `perfectAdherence30d` — handled implicit (any pipeline)
- `zeroAdherence30d` — handled implicit
- `bulkToCutDay15` — phase transition, exists fixture but `it.todo()` scenario coach-voice
- `injuryRecovery14d` — exists fixture but `it.todo()` scenario coach-voice

### Persona-specific failure modes documented but uncovered

Per `coach-voice.scenarios.test.ts` comments:
- Scenario 1: Gigel anti-paternalism (no guilt) — `it.todo()`
- Scenario 2: Marius PR safety gate (HARD_CAP_INTENSITY_PCT_1RM 0.90) — `it.todo()`
- Scenario 3: Maria 65 joint pain + medical disclaimer — `it.todo()`
- Scenario 4: bulk→cut phase reset — `it.todo()`
- Scenario 5: Post-injury tier downgrade — `it.todo()`
- Scenario 6: Deload week pattern — `it.todo()`
- Scenario 7: Per-set safety RIR 0 + AaFriction — `it.todo()`

**7/7 persona scenario eval coverage = 0%. Engine signals tested in isolation BUT coach voice output (final user-facing wording) NOT scored.**

---

## §5 Guardrails

| Guardrail | Where | Status | Notes |
|---|---|---|---|
| LOCK 8 kcal floor 1200 (sub-1200 observations excluded from Kalman posterior) | `bayesianNutrition/observationFilter.js` + `engineWrappers.ts:KCAL_FLOOR_DAILY_MIN=1200` | COVERED | Test: `kcal-floor.test.ts` + `priorPosterior.test.js` + Math.max guard |
| HARD_CAP_INTENSITY_PCT_1RM 0.90 (PR attempt safety) | Documented in coach-voice scenario 2 comment | UNVERIFIED — code-side grep didn't surface the constant | Co-CTO follow-up: grep `HARD_CAP_INTENSITY` în src tree |
| MMI bucket cap (0.80x / 0.70x / 0.60x startMultiplier by pause months) | `muscleMemoryAdapter.js` + `engineWrappers.applyMmiCapToWorkout` | COVERED | 13 tests verify all 3 buckets, refusal, no peak fallback, no logs fresh user |
| AaFriction per-set safety (RIR 0) | `aa.js` + golden-master strangler test (`strangler_aa_goldenMaster.test.js`) | COVERED logic-side | Per-set wiring UI = LOCK 9 PerSetSafetyModal post-rename D033 |
| Adapter severity (soft continues, hard halts) | `runPipeline` resolveSeverity ADR 030 §3.6 | COVERED | Default = hard (Anti-Cascade Silent fail-safe) |
| Sentry consent gate (D055) | `main.tsx` if-block + subscribe + `sentry-consent-gate.test.ts` anti-drift prod-source | COVERED | 9 tests + prod-source grep |
| Sentry PII strip (uid/userId/email/uid-in-URL) | `sentry.js` beforeSend + `sentryBeforeSend.test.js` + `sentryPiiStrip.test.js` | COVERED | uid pattern context-anchored to avoid chunk-hash false positives |
| Decay rate dual-SoT clarification (reference NU runtime) | `muscleRecoveryConstants.js` + invariant tests | COVERED | 10 assertions DECAY_RATE_HOURS_BIG11 values + MUSCLE_HEADS separation |
| Engine adapter Sentry fallback wrap | 11 try/catch în `engineWrappers.ts` | COVERED present-state — **MISSING anti-drift static scan** |
| Constraint Object frozen propagation | `runPipeline` `Object.freeze` | COVERED | Test verifies frozen state downstream |
| Romanian no-diacritics enforcement | Manual discipline + D058 closure + grep | PARTIAL — pre-commit hook lint check deferred per D065 §3 |

---

## §6 Production monitoring

### Telemetry events

`src/util/telemetry.js` — 13 events, all auth/onboarding/account/merge scope:

```
ONBOARDING_STARTED + ONBOARDING_COMPLETED
AUTH_REQUIRED_HIT + AUTH_SIGNIN_SUCCESS + AUTH_SIGNIN_FAIL
ACCOUNT_DELETED + ACCOUNT_REACTIVATED
MERGE_FORK_TELEFON + MERGE_FORK_CLOUD
EMAIL_CHANGE_INITIATED + EMAIL_CHANGE_COMPLETED
LOGOUT_NO_WIPE + LOGOUT_WITH_WIPE
```

**Engine-output telemetry = ZERO.** No event fires when:
- MMI silent cap activates (would flag returning user benefit firing in prod)
- Engine adapter returns baseline (would track input-starved pattern)
- Pipeline halt-strict hard fail (would track engine error spike)
- Bayesian Nutrition tier transitions (cold-start → first observation → high confidence)
- Coach wording template selected (would track persona match rate)

### Sentry adapter coverage

- React wrapper layer (`engineWrappers.ts`): **11/11 wrappers** have try/catch + `captureException` cu `source: engine-adapter-fallback` tag (verified grep count = 13 instances inc 2 sub-patterns getPatternsBanner)
- Orchestrator pipeline adapters (`src/coach/orchestrator/adapters/*.js`): **0/8 adapters** have `captureException` (verified `grep -c captureException = 0` per file)
- Sentry init gated D055 (telemetryOptIn) — default FALSE → most production users emit ZERO breadcrumbs

### Observability hooks orphan

`runPipeline(engineContext, adapters, options)` accepts `options.onSubSpan` callback emit per-adapter span `{adapterId, durationMs, ok, errorCode, severity}` (ADR 030 §3.3). **NO React caller passes this callback** — pipeline_event payload schema (ADR 011 §X Changelog 2026-05-08) exists pe paper, ZERO production wire. CoachDecisionLog (CDL) consumes this hypothetically but production grep didn't find consumer.

### Lighthouse perf monitoring

D071 documents 64→97 trajectory + ratchet UP capability D036 §7.6 thresholds. Sustained 97 baseline pre-Beta. Lighthouse CI = production gate active.

### Error rates

Sentry beforeSend filter drops noise (ResizeObserver loops, Script error, NetworkError, Failed to fetch) — covered tests. Firebase errors tagged NOT dropped — queryable production debug retained.

---

## §7 Persona scenario coverage

### Gigel (mediu non-tech, T0 cold-start, novice 32M)

| Dimension | Coverage | Verdict |
|---|---|---|
| Profile typing classification → Yo-yo behavioral | ✓ `profileTyping.personas.e2e.test.js` | COVERED |
| Bayesian Nutrition cold-start (zero observations, tier='none' → baseline fallback) | ✓ Golden master snapshot | COVERED |
| MMI silent cap NOT firing (no logs/pr-records) | ✓ `mmi-silent-cap.test.ts` "no logs at all" case | COVERED |
| LOW_ADHERENCE banner gated (< 3 sessions = no banner) | ✓ `engineWrappers.patternsBanner.test.ts` | COVERED |
| Anti-paternalism coach wording (no guilt-tripping post-skip) | ✗ `it.todo()` scenario 1 | **MISSING** |
| First PR detection scope-session-only edge | ✗ implicit via PR engine test | PARTIAL |

**Verdict Gigel: PARTIAL — engine-side OK, coach voice wording 0%.**

### Marius (performant gym, T2 intermediate, 28M cut, 30 days history)

| Dimension | Coverage | Verdict |
|---|---|---|
| Profile typing → Strategic behavioral | ✓ E2E test | COVERED |
| Bayesian Nutrition mature 30-day Kalman convergence | ✓ Golden master snapshot + kalman.test.ts | COVERED |
| MMI 7-month pause bucket (0.80x cap + 1.25x boost) | ✓ `mmi-silent-cap.test.ts` 7-luni case + Marius persona case (peakKg 240) | COVERED logic, **dead-path prod** (CRITICAL #2) |
| Dual-signal periodization green | ✓ `periodizationParity.test.js` | COVERED |
| PR HARD_CAP_INTENSITY safety gate | ✗ `it.todo()` scenario 2 | **MISSING** |
| Stagnation 2+ weeks detection | ✓ `stagnationDetector.test.js` + composer wire | COVERED |
| LOW_ADHERENCE pattern banner | ✓ | COVERED |

**Verdict Marius: PARTIAL — extensive engine coverage, but PR-safety coach voice + production prod-path dead = WARNING.**

### Maria 65 (conservativ, T3 beginner 67F maintain, 90 days, knee-left)

| Dimension | Coverage | Verdict |
|---|---|---|
| Profile typing → Marathon behavioral | ✓ | COVERED |
| Bayesian Nutrition 90-day conservative posterior | ✓ Golden master snapshot | COVERED |
| MMI 25-month bucket (0.60x start proaspat, no boost) | ✓ Maria persona case în mmi-silent-cap | COVERED logic, dead-path prod |
| A11y baseline (focus-visible, aria-modal, forms aria) | ✓ chat 5 LANDED commits 3e42c164+953d4c06+0b6fddff (D056) | COVERED |
| Joint pain (knee-left) → coach pause/safe + medical disclaimer | ✗ `it.todo()` scenario 3 | **MISSING** |
| Lighthouse mobile 3G perf 97 LCP 2.48s | ✓ D071 | COVERED |
| Coach wording readability + tone calm | ✗ no LLM-judge or fast-check | **MISSING** |

**Verdict Maria 65: PARTIAL — extensive engine + UI/perf coverage, joint-pain coach response + tone-readability = MISSING.**

### Aggregate persona verdict

| Persona | Engine layer | Coach voice | Production prod-path | Aggregate |
|---|---|---|---|---|
| Gigel | COVERED | MISSING (1/7 scenarios pending) | PARTIAL | PARTIAL |
| Marius | COVERED | MISSING (1/7 scenarios pending) | MISSING (CRITICAL #2 dead) | PARTIAL |
| Maria 65 | COVERED | MISSING (1/7 scenarios pending) | PARTIAL | PARTIAL |

---

## §8 Pre-Beta verdict

### Beta-launch ready evaluation-wise: **YELLOW**

| Gate | Status | Justification |
|---|---|---|
| Engine numerical correctness | ✓ COVERED | 106 engine tests + property-based + golden-master + invariants |
| Reference dataset quality | ✓ COVERED (slightly below 10 baseline minimum) | 3 personas + 4 edge + 30 generated profiles |
| Guardrails (kcal floor, MMI bucket, severity, consent gate, PII strip) | ✓ COVERED | Tested + invariant-enforced |
| Sentry adapter coverage (wrapper layer) | ✓ COVERED | 11/11 tested |
| Anti-drift static scan (D063 spec) | ✗ **MISSING** | File `assert_all_adapters_instrumented.test.ts` does NOT exist |
| Coach voice persona scenarios | ✗ **MISSING** (BLOCKER) | 7/7 = `it.todo()` |
| Engine input prod-path (logs + pr-records writeback) | ✗ **MISSING** (BLOCKER) | CRITICAL #2 + #3 SHAPE_CHECK unresolved → engines starved silent |
| Telemetry observability engine layer | ✗ **MISSING** (WARNING) | 13 events auth-scope only, ZERO engine layer |
| Romanian no-diacritics compliance | ✓ COVERED | D058+D065 closure |
| Persona archetype classification (Gigel/Marius/Maria) | ✓ COVERED | E2E test |

### Deferred items (post-Beta acceptable)

- LLM-judge calibration coach voice (requires LLM coach wrapper first — Andura currently rule-based)
- Lighthouse ratchet UP from 97 baseline (post-Beta optimization)
- Critical CSS inline + code-split deeper (§P7+§P12 defer)
- frame-ancestors CSP directive (GH Pages limitation, accept-risk)

### Beta-launch BLOCKERS evaluation-wise

1. **CRITICAL: Logs + pr-records production writeback** — engines silently rulează input-starved post-D028. MMI silent cap = dead path în producție. ~30-50 LOC shim in `workoutStore.finishSession` + `PostRpe.handleSubmit` write `DB.set('logs', ...)` + `DB.set('pr-records', ...)`. Without this, all eval coverage = false-confidence (engines work in test, dormant in prod).
2. **HIGH: `assert_all_adapters_instrumented.test.ts` create** — fulfill D063 spec. Static-scan asserts each exported function in `engineWrappers.ts` cu `try/catch` invokes `captureException` cu `source: 'engine-adapter-fallback'`. ~40 LOC test file. Visible CI gate future engine additions.
3. **MEDIUM: PRE_BETA_CHECKLIST stale-LOCK correction** — §1.3 + §1.6 cite `assert_all_adapters_instrumented.test.ts` as LANDED but file doesn't exist. Singular primary-source slip pe Bugatti audit nuclear doc.

---

## §9 Co-CTO autonomous fix candidates

Per CLAUDE.md Co-CTO mandate (strategic+tactical autonomous până 90-95% bug coverage), Daniel CEO validează final pre-Beta:

### BLOCKER tier (pre-Beta gate hard)

**B-EVAL-001 — Logs + pr-records writeback shim** (~45 LOC + tests)

- `src/react/stores/workoutStore.ts` `finishSession` action append flatten din `session.exercises[*].sets[*]` la `DB.set('logs', ...)` deduplicated cu existing logs
- `src/react/screens/.../PostRpe.tsx` `handleSubmit` recompute peak per exercise → `DB.set('pr-records', ...)`
- New test `engineInputBridge.test.ts` asserts: finishSession() → DB.get('logs').length > 0 + DB.get('pr-records') has expected peaks per exercise
- Cross-ref: SHAPE_CHECK_INTEGRATION_AUDIT_chat5.md §"Top 3 priority" #1
- Severity: CRITICAL — unlock all downstream engine eval prod relevance

**B-EVAL-002 — Anti-drift static scan `assert_all_adapters_instrumented.test.ts`** (~50 LOC)

- New file `src/react/__tests__/lib/assert_all_adapters_instrumented.test.ts`
- Read `engineWrappers.ts` source via `fs.readFileSync`
- Regex extract `export function (\w+)` declarations
- For each exported function name, assert source contains `tags: { source: 'engine-adapter-fallback', adapter: '<funcname>'` pattern
- Whitelist constants/helpers/types via convention (e.g., function name starts with lowercase + has try/catch sibling)
- Fulfill D063 LOCKED V1 spec literally
- Severity: HIGH — visible CI gate future drift catch + closes primary-source slip

**B-EVAL-003 — Coach voice persona scenarios partial activation** (~150 LOC across 7 scenarios)

- `tests/engine/coach-scenarios/coach-voice.scenarios.test.ts` migrate `it.todo()` → `it()` cu rule-based assertions on engine signal output (NOT LLM-judge — defer LLM coach wrapper)
- Scenario 1: Gigel skip 3 workouts → assert engine signals contain `ANTI_PATERNALISM_RESPECT` marker; assert wording `coachPick('preview', ...)` returns string NOT containing forbidden tokens ["ar trebui", "trebuie sa", "rusin", "vinovat"]
- Scenario 2: Marius PR attempt 1.10x max → assert `HARD_CAP_INTENSITY_PCT_1RM` engine flag fires + `AaFriction.trigger=true`
- Scenario 3: Maria 65 joint pain signal → assert pain-button trigger + `MEDICAL_DISCLAIMER_REMINDER` flag
- Scenario 4: bulk→cut day 15 → assert `phase_reset_layer_1_and_2` în BN signals
- Scenario 5: injury 14d recovery → assert `tier_temporary_downgrade` signal
- Scenario 6: deload week → assert deload engine signal fires
- Scenario 7: per-set RIR 0 → assert AaFriction.type='per-set-safety'
- ZERO LLM-judge — pure engine-signal assertion. LLM coach wrapper = post-Beta scope.
- Severity: HIGH — closes persona scenario coverage 0% → 7/7 rule-based asserted

### WARNING tier (high priority post-Beta gate soft)

**W-EVAL-001 — Engine telemetry events emit** (~30 LOC)

- Extend `src/util/telemetry.js` EVENTS const cu:
  - `ENGINE_MMI_CAP_APPLIED` (counter when applyMmiCapToWorkout reduces targetKg)
  - `ENGINE_ADAPTER_FALLBACK_BASELINE` (counter when wrapper returns baseline due to engine throw)
  - `ENGINE_BN_TIER_NONE` (counter when Bayesian Nutrition tier='none' cold-start baseline)
  - `ENGINE_PIPELINE_HARD_HALT` (counter when runPipeline halts on hard severity)
- Update Firestore rules `allowedTelemetryKeys()` union
- Wire `trackEvent(EVENTS.ENGINE_MMI_CAP_APPLIED)` in `applyMmiCapToWorkout` when capping fires
- Aggregate counters surface production engine layer health visible Daniel weekly check
- Severity: MED — observability gap close pre-Beta launch confidence

**W-EVAL-002 — LastSessionSummary → recentSessions shape adapter** (per SHAPE_CHECK HIGH #1)

- `src/react/lib/scheduleAdapterAggregate.ts` add `toEngineSession(summary): RecentSession` mapper
- Derive `rir` from `lastRating` heuristic (usoara→3, normala→2, grea→1)
- Derive `energy` from `readiness` if available
- Derive `weekIdx` from `ts` ISO week diff vs `onboarding.completedAt`
- ZERO src/engine/* mutation
- Severity: MED — periodization/deload/energyAdjustment dual-signal logic unlocked

**W-EVAL-003 — `set.isPR` wire in PostRpe handleSubmit** (per SHAPE_CHECK MED #8, ~15 LOC)

- `PostRpe.tsx` handleSubmit: re-run `detectPR` per exercise + set `isPR=true` on detected set entries
- OR consume `workoutStore.prData` last PR + mark last set per matching exercise
- Severity: LOW — PR Wall populated + Antrenor prWallRecent slice non-empty

### Production prod-path verify gates (post-fix)

- E2E Playwright test: complete session → DB.get('logs').length grows + DB.get('pr-records') updates
- E2E test: returning user simulate (mock `lastSessionDate` 7mo ago) → MMI cap visible în targetKg
- Daniel manual smoke: real session log → verify Sentry production breadcrumb shows `adherence_engine_score` non-baseline

---

## Files audited

Engine layer:
- `src/engine/*.js` (43 root JS files: aa/acceleratedLearning/adherence/.../whyEngine)
- `src/engine/__tests__/*.test.js` (48 test files)
- `src/engine/{bayesianNutrition,deload,energyAdjustment,periodization,specialization,suflet-andura,warmup,...}/` (sub-engines + tests)
- `src/engine/muscleRecoveryConstants.js` (DECAY_RATE_HOURS_BIG11 ref)

Orchestrator:
- `src/coach/orchestrator/index.js` (runPipeline)
- `src/coach/orchestrator/adapters/*.js` (8 adapters)
- `src/coach/orchestrator/__tests__/*.test.js` (10 parity tests)

React layer:
- `src/react/lib/engineWrappers.ts` (918 LOC, 11 wrapper functions)
- `src/react/__tests__/lib/engineWrappers.*.test.ts` (7 test files)
- `src/react/__tests__/lib/coachDirectorAggregate.test.ts`

Util/Sentry:
- `src/util/sentry.js` (initSentry + captureException + beforeSend PII strip)
- `src/util/telemetry.js` (13 events auth-scope)
- `src/util/__tests__/sentry*.test.js` (3 test files)
- `src/__tests__/sentry-consent-gate.test.ts` (9 tests anti-drift prod-source)

Test infrastructure:
- `tests/fixtures/personas.ts` (3 personas + 4 edge cases + vitest fixture extension)
- `tests/fixtures/cdlEntries.js` (scenarioYoyo/Strategic/Marathon)
- `tests/engine/coach-scenarios/coach-voice.scenarios.test.ts` (7 it.todo() + 1 sanity)
- `tests/engine/invariants/kalman.test.ts` + `kcal-floor.test.ts` (property-based + invariants)
- `tests/engine/golden-master/bayesian-nutrition.test.ts` (+ `__snapshots__/`)
- `tests/golden-master/profiles/{generated/gen-001..030.json,manual/sample-profile.json}`
- `tests/simulation/{property-based,parallel-fuzz,sequential-load,calibration-test}.js`

Documentation cross-checked:
- `DECISIONS.md` D055 + D056 + D057 + D063 + D066 + D067 (chat 5 LOCK V1 candidates)
- `📤_outbox/PRE_BETA_CHECKLIST_chat5.md` (§1.3 + §1.6 stale-LOCK slip flagged)
- `📤_outbox/SHAPE_CHECK_INTEGRATION_AUDIT_chat5.md` (CRITICAL #2 + #3 + HIGH #1 unresolved)
- `📤_outbox/DECISIONS_CHAT5_DRAFT.md` (§P5 + §P11 partial closures)

---

**Read-only audit complete. ZERO src/ touched, ZERO git ops, ZERO push. Worktree `agent-ad15f20d8a2716868` ephemeral session.**
