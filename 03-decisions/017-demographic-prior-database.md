# ADR 017: Demographic Prior Database

**Status:** Accepted
**Date:** 2026-04-27
**See also:** [[018-engine-extensibility-architecture]] | [[016-vitality-layer]] | [[014-onboarding-profile-typing]] | [[013-auto-aggression-detection]] | [[011-coach-decision-log-architecture]] | [[009-calibration-tiers]] | [[INSIGHTS_BACKLOG]] | [[DECISION_LOG]]

---

## Context

SalaFull's engine la cold-start (T0 COLD_START per ADR 009) operează cu signal minim: doar ce a putut user-ul oferi la onboarding (age, sex, kg, height, BMI, equipment availability) plus eventual Profile Typing self-report dacă completed (ADR 014). Engine-ul nu cunoaște user-ul personal — încă nu există behavioral data, încă nu există vitality (T2+ gated per ADR 016), încă nu există adherence patterns.

Memory rule #25 + DECISION_LOG sesiune END 27 apr articulează:
- **T0 skip onboarding = engine generic + demographic prior din synthetic.** User care NU completează onboarding la day 1 = engine acceptabil, NU degraded mode.
- **T1+ Profile Typing override demographic prior.** User signal real (self-report Q1-Q5) ia prioritate când disponibil.
- **Self-selection = feature, NU bug.** Engine nu forțează personalizare premature; signal user investit > coverage population breadth.

Trei opțiuni explorate pre-ADR 017:

1. **Hardcoded defaults pe age bucket.** Pattern existing în SalaFull (cold-start session per ADR 009 cu reps mid-range, weights conservative). Limitare: 1 dimensiune (age), nu captează intersecții reale (job sedentar × stres ridicat × goal aesthetic = baseline radically different vs munca fizică × low stres × goal strength).

2. **Bloodwork integration.** Daniel respins explicit (DECISION_LOG 2026-04-26 + ADR 016 §context): privacy panic Gigel filter, scope creep medical, liability legal. Bloodwork DEFINITIV OUT.

3. **Demographic Prior Database.** 500 profile synthetic diverse × 90 zile sesiuni synthetic = lookup database. La cold start, engine consultă K-nearest profile similar (age × sex × kg × height × BMI × job × lifestyle × goal) → aggregate behavioral signal → personalizat aproximativ încă din sesiunea 1.

**Daniel articulation (DECISION_LOG sesiune END 27 apr, Decision 5):**

> "synthetic 500 profile × 90 zile = Demographic Prior Database. Profile mix: ~50 manually crafted (Daniel HR 36, Gigel mecanic 45, Ana educatoare 55, Iasmina OF 18, Marius office 28, Elena mama 35, etc.) + ~450 algorithmic generated cu variație controlată (age × sex × kg × height × job × lifestyle × goal). Storage: local fixtures generated runtime în memory. NU permanent. Cost $0. Lifecycle build phase only — la launch nu mai avem nevoie."

**Lifecycle insight crucial Daniel:**

> "la launch nu mai avem nevoie de profilele de test... se sterg si firebase ramane gol... ma rog cu mine in el."

Demographic Prior Database = **production infrastructure** pentru build phase + early launch. Post-100+ users reali, real behavioral data deplasează demographic prior. Synthetic data NU contaminează Firebase, NU consumă storage permanent.

**Scope ADR:** principle + 8 componente structurale + plugin architecture aliniat ADR 018 + lifecycle declaration. **NU spec implementabil.** Spec EXEC_QUEUE post-acceptance.

**Dependencies critice:**
- ADR 018 (Engine Extensibility) — ACCEPTED 2026-04-27, foundation pentru plugin
- ADR 014 (Profile Typing) — Profile Typing override T1+ = prior deprecation trigger per user
- ADR 016 (Vitality Layer) — Vitality T2+ = additional override per user
- ADR 009 (Calibration Tiers) — T0 = active singular dimensiune
- ADR 011 (CDL) — demographic prior NU scrie CDL outcome (read-only context source)

---

## Decision

Adoptăm **Demographic Prior Database** ca dimensiune nouă în engine, build pe ADR 018 plugin patterns, cu 8 componente structurale care împreună definesc scope + lifecycle + integration.

### Working title final: "Demographic Prior"

**Considered alternatives:**
- "Synthetic Baseline" — accent pe synthetic, dar sounds artificial UX-wise.
- "Population Prior" — Bayesian-flavored, NU UX-friendly în trace logs.
- "Cold-Start Bridge" — descriptive dar restrictive (sugerează doar T0 use-case).

**Adopted:** "Demographic Prior" — captures intent (prior probabilistic bazat pe demographic match), short pentru cod (`dimensions/demographicPrior.js`), trace-friendly. Decision inline (NU DP) — naming = cosmetic.

---

## 1. Profile schema — dimensiuni descriere profil

### Context

Un profil synthetic trebuie să captureze suficient signal pentru lookup match + behavioral pattern generation, dar fără explozie combinatorială (10 dimensiuni × 4 buckets = 1M combinations, peste cap). Trade-off: discriminative power vs generator complexity.

### Decision

**11 dimensiuni profile. Combinație continuous (age, kg, height, BMI) + categorical (sex, job, lifestyle, goal, training_history, equipment, time_availability).**

```typescript
type SyntheticProfile = {
  id: string,                          // ex: 'crafted_daniel_hr_36' or 'algo_28f_sedentar_aesthetic_12'
  schemaVersion: 1,

  // Demographic continuous
  age: number,                         // years, 16-75
  kg: number,                          // weight, 40-150
  height: number,                      // cm, 150-200
  bmi: number,                         // computed, kg / (height/100)^2

  // Demographic categorical
  sex: 'M' | 'F',
  job: 'sedentary' | 'office' | 'standing' | 'manual_light' | 'manual_heavy' | 'shift_irregular',
  lifestyle: 'low_active' | 'moderate' | 'active' | 'very_active',
  goal: 'aesthetic' | 'strength' | 'general_health' | 'weight_loss' | 'rehab' | 'performance',
  training_history: 'none' | 'beginner' | 'intermediate' | 'advanced',

  // Practical context
  equipment: ('dumbbells' | 'barbell' | 'machines' | 'cables' | 'bodyweight_only' | 'home_gym')[],
  time_availability: 'limited_30min' | 'moderate_60min' | 'flexible_90plus',

  // Crafted personas only
  personaTag: string | null,           // ex: 'Daniel HR 36', 'Gigel mecanic 45', null pentru algorithmic
  craftedBy: 'manual' | 'algorithmic'
};
```

**Rationale dimensiuni alese:**

- **Age + sex + kg + height + BMI** = baseline biometric pe care toate apps-urile fitness se calibrează. Determinist pentru population-prior weights (recovery rate, baseline strength curves).
- **Job** = activity baseline non-gym (sedentary office vs manual heavy). Affects calibration: user mecanic 45 ani are baseline strength compatibil cu intermediate trainee chiar la 0 sesiuni gym.
- **Lifestyle** = total non-gym activity (separate de job — un office worker activ recreational ≠ office worker sedentar).
- **Goal** = direction signal (aesthetic = volume + frequency emphasis; strength = compound focus + lower frequency; rehab = cap intensity hard).
- **Training_history** = previous experience (beginner cap vs intermediate ramp speed).
- **Equipment** = practical filter (recommendations depend pe ce poate face).
- **Time_availability** = duration cap (limited_30min user = max 4 exercises, NU 8).

**Excluded dimensions (intentional v1):**

- **Injury history** — too complex pentru synthetic (per-injury logic = ADR separate). Reserved v2.
- **Specific medical conditions** — same as bloodwork (Gigel filter fail).
- **Hormonal status** (postmenopausal, postpartum, etc.) — captured indirect via age + sex + persona tag pentru manually crafted, NU dimensiune sintetică.
- **Genetic markers** — pseudo-science territory pentru fitness app v1.

### DP-1: Profile dimension count — 11 vs minimal-set vs comprehensive

Vezi secțiunea finală.

### Implementation notes

- Schema pinned în `tests/fixtures/syntheticProfileSchema.js` ca JSDoc typedefs (pattern ADR 018 §2 vanilla JS).
- BMI computed la generation, NU stored static (consistency guarantee).
- Profile ID format: `crafted_<persona_tag_slug>` pentru manually crafted, `algo_<sex><age>_<job>_<goal>_<seed>` pentru algorithmic. Searchable + de-duplicable.

---

## 2. Generator strategy — manually crafted + algorithmic

### Context

500 profile total = sweet spot per Daniel articulation (DECISION_LOG sesiune END 27 apr). Două strategii viable: pur algorithmic (toate generated) vs hybrid (manual edge cases + algorithmic bulk).

Pur algorithmic = uniform coverage pe spațiul demographic, dar miss edge cases reale (combinații specifice care apar în target population RO). Manually crafted = realism + edge case coverage, dar manual cost mare la scale.

### Decision

**Hybrid: ~50 manually crafted + ~450 algorithmic generated.**

**Manually crafted (50 profile):**
- 6 personas explicit (Daniel HR, Gigel, Ana, Iasmina, Marius, Elena) — vezi §9 personas detaliate
- 44 additional crafted edge cases acoperind:
  - Age extremes (18-22, 60-75)
  - Sex distribution balanced (~50% M, ~50% F)
  - Job rare combinations (shift_irregular + active lifestyle, manual_heavy + low_active recovery)
  - Goal rare combinations (rehab post-injury cu equipment limited, performance amateur cu time_availability limited)
  - BMI extremes (< 18.5 underweight, > 30 obesity class I-II)
  - Training_history advanced cu equipment limited (constraint stress test)

**Algorithmic generated (450 profile):**
- Variație controlată pe 11 dimensiuni
- Distribution per dimension calibrate pe RO population (sex 51%F/49%M, age skewed 25-45 majority, job mix realistic non-stratified)
- Combination filter: drop profile imposibile (ex: 18 ani + advanced training_history + low_active lifestyle = incoerent)
- Seed deterministic per profile (`seed = hash(idx)`) — reproducibility test runs

**Generator parametrizat:** `generateProfiles({ count: 500, manualSeed: 'salafull_v1', distribution: 'ro_population' })`. Scale-able dacă needed (count 1000, 2000) fără rewrite.

### DP-2: Profile mix ratio — 50/450 vs 100/400 vs full algorithmic

Vezi secțiunea finală.

### Implementation notes

- Manually crafted profiles în `tests/fixtures/craftedProfiles.js` ca exports explicit JS objects.
- Algorithmic generator în `tests/fixtures/profileGenerator.js`. Pure function (seed-driven deterministic).
- Validation tests: generated 500 profile → no duplicates by ID → distribution sanity (sex ~50/50, age coverage 16-75 cu majority 25-45 etc.).
- Combination filter logic: rule-based exclusion list (`isPlausible(profile)` returns boolean).

---

## 3. Behavioral pattern generator — 90 zile synthetic sessions per profile

### Context

Profile schema = static descriptor. Engine cold-start are nevoie și de **behavioral pattern** — cum răspund profile similar la load progression, recovery patterns, adherence variance? 

Două abordări viable: deterministic rules per profile (rule-based: "Sprinter user adds volume 8/12 sessions") vs stochastic sampling (distributions per dimension: "user vârstă 45+ has recovery time normal(48h, σ=12h)").

### Decision

**Hybrid: rule-based pattern shape + stochastic noise for realism.**

**90-zile synthetic session log per profile:**

```typescript
type SyntheticSession = {
  date: string,                        // 'YYYY-MM-DD'
  sessionType: 'PUSH' | 'PULL' | 'LEGS' | 'REST',
  proposedVolume: number,              // sets total
  actualVolume: number,                // post-execution (with adherence variance)
  rpeReported: number | null,          // 1-10, null pentru rest
  adherence: 'completed' | 'partial' | 'skipped',
  recoveryHoursPost: number,           // hours user reports needing post-session
  rating: 'easy' | 'normal' | 'hard' | null
};

type SyntheticProfileBehavior = {
  profileId: string,
  schemaVersion: 1,
  sessions: SyntheticSession[],        // ~50-90 sessions over 90 zile (depends adherence rate)
  derivedMetrics: {
    avgFrequencyPerWeek: number,       // ex: 3.2
    skipRate: number,                  // 0-1
    volumeProgressionRate: number,     // % week-over-week
    recoveryDebtAvg: number,           // hours
    rpeDriftPattern: 'stable' | 'climbing' | 'declining',
    earlyEndRate: number               // 0-1
  }
};
```

**Pattern shape rules (per profile dimensions):**

- **age + training_history** → baseline frequency target. Beginner 25 ani = 4x/săpt target, advanced 55 ani = 3x/săpt + recovery emphasis.
- **job + lifestyle** → adherence variance. Shift_irregular = skip rate 20-30%; office moderate = skip rate 10-15%.
- **goal** → volume progression rate. Aesthetic = +10%/săpt early, +3%/săpt late; strength = +5kg/2-săpt; rehab = flat conservative.
- **persona tag manually crafted** = fine-tuned overrides (ex: Elena mama postpartum = 2x/săpt cap pentru first 6 săpt, ramp slow).

**Stochastic noise:**
- RPE Gaussian noise σ=0.5 around predicted base
- Adherence Bernoulli pe `(1 - skipRate)` per scheduled session
- Volume noise ±10% pe actualVolume vs proposedVolume
- Recovery hours log-normal distribution per (age, training_history)

**Seed deterministic per profile + date:** `random_seed(profileId, date)` produces reproducible sessions. Same profile + same date = same synthetic outcome.

### DP-3: Behavioral generator — rule-based vs stochastic vs ML-derived

Vezi secțiunea finală.

### Implementation notes

- Generator `generateBehavior(profile, days=90, seed)` în `tests/fixtures/behaviorGenerator.js`.
- Pure function. `seed` parameter optional pentru test determinism.
- `derivedMetrics` computed post-generation pentru lookup matching efficiency (avoid recompute la fiecare query).
- Stochastic noise calibrate empirically post 50+ users reali: dacă behavioral patterns reali NU match synthetic distributions, recalibrate noise σ + bias.

---

## 4. Storage — runtime in-memory, NU persistent

### Context

Daniel articulation crucial (DECISION_LOG sesiune END 27 apr Decision 5):

> "Storage: local fixtures `tests/fixtures/syntheticProfiles.js`. Generated runtime memory pentru test runs. NU persist permanent. **Zero impact pe Firebase production cost.**"

Două opțiuni viable: persist generated database (faster lookup, cost storage) vs runtime regeneration (zero storage, regenerate cost).

### Decision

**Runtime in-memory generation. Zero persistence pe disk sau Firebase.**

**Lifecycle pe app session:**

1. **Build/test phase:** generator runs la test setup, profiles materialize în memory pentru duration test run, garbage collected post-run.
2. **Engine integration phase:** la `coachDirector.buildSession()` first call în session, dacă user T0 + needs prior, generator runs lazy (cached pe app process lifetime), discarded la app restart.
3. **Launch phase:** demographic prior dimension flag `demographic_prior_v1` permite disable global (rollout 0%) — generator NU rulează deloc, zero overhead.

**Storage location:**

- **`tests/fixtures/syntheticProfileSchema.js`** — JSDoc typedefs
- **`tests/fixtures/craftedProfiles.js`** — 50 manually crafted explicit
- **`tests/fixtures/profileGenerator.js`** — algorithmic 450 generator (pure function, seed-driven)
- **`tests/fixtures/behaviorGenerator.js`** — 90-zile session generator per profile
- **`tests/fixtures/demographicPriorIndex.js`** — lookup helper (K-nearest neighbors search)

**NU în:**
- `src/` (engine source) — fixtures separate de runtime engine code
- Firebase storage — zero permanent persistence
- localStorage — NU per-user persistent, regenerate la fiecare session
- IndexedDB — same reason

**Memory footprint estimate:**
- 500 profile × ~500 bytes JSON = 250 KB profiles static
- 500 profile × 90 sessions × ~200 bytes = 9 MB behavior data
- Lookup index (K-NN structure) = ~1-2 MB
- Total ~10-12 MB resident in-memory pentru duration session

Acceptable pentru desktop + mobile modern (10 MB << 100 MB typical webapp).

### DP-4: Storage strategy — runtime vs persisted fixtures

Vezi secțiunea finală.

### Implementation notes

- Generator results memoized în module-level cache: `let _cache = null; function getProfiles() { if (!_cache) _cache = generate(); return _cache; }`. Single generation per process lifetime.
- Test isolation: tests can reset cache via `__resetCache()` helper for determinism per-test.
- Build artifact: production build NU bundle test fixtures (per Vite/Rollup tree-shaking). Demographic prior dimension imports lazy from fixtures path resolve-able only în dev/test environments.
- **Critical guard:** dacă bundle size detection finds fixtures included în production build, abort build cu warning (CI check).

---

## 5. Plugin architecture — implementare ca dimensiune ADR 018

### Context

ADR 018 acceptat 2026-04-27 cu Dimension Registry + Standardized Contract + Decision Cluster + Schema Versioning + Feature Flags. Demographic Prior = greenfield dimension build pe foundation, similar Vitality (ADR 016 §6).

### Decision

**Demographic Prior dimension implementată end-to-end ca plugin per ADR 018 contract.**

**Registry entry (`src/engine/dimensionRegistry.js`):**

```js
import * as demographicPrior from './dimensions/demographicPrior.js';

export const DIMENSIONS = [
  // ... existing entries
  {
    id: 'DEMOGRAPHIC_PRIOR',
    module: demographicPrior,
    stage: 'ADJUSTMENT',                 // calibrate baselines, NU short-circuit
    priority: 40,                        // low priority — only fires when no other signal
    enabledFlag: 'demographic_prior_v1',
    requiresCalibration: 'COLD_START',   // T0 only (auto-deprecated T1+)
    schemaVersion: 1
  }
];
```

**Module signature (`src/engine/dimensions/demographicPrior.js`):**

```js
import { lookupNearestProfiles, aggregateBehavior } from '../../tests/fixtures/demographicPriorIndex.js';

export function analyze(input) {
  const { ctx, userProfile, flags } = input;

  // Auto-deactivate T1+ (Profile Typing override per ADR 014 update + Vitality T2+ per ADR 016)
  if (ctx.calibrationLevel !== 'COLD_START') {
    return {
      id: 'DEMOGRAPHIC_PRIOR',
      tier: 'none',
      confidence: 'low',
      signals: [],
      recommendations: [],
      trace: { reason: 'tier_override_deprecated' },
      meta: {}
    };
  }

  // Insufficient demographic data (skip onboarding entirely + no biometrics) → fail-safe
  if (!userProfile.age || !userProfile.sex) {
    return {
      id: 'DEMOGRAPHIC_PRIOR',
      tier: 'none',
      confidence: 'low',
      signals: [],
      recommendations: [],
      trace: { reason: 'insufficient_demographic_data' },
      meta: {}
    };
  }

  // K-NN lookup pe synthetic database
  const queryProfile = {
    age: userProfile.age,
    sex: userProfile.sex,
    kg: userProfile.kg,
    height: userProfile.height,
    bmi: userProfile.bmi,
    job: userProfile.job || 'office',                  // default fallback
    lifestyle: userProfile.lifestyle || 'moderate',
    goal: userProfile.goal || 'general_health',
    training_history: userProfile.training_history || 'beginner',
    equipment: userProfile.equipment || ['dumbbells'],
    time_availability: userProfile.time_availability || 'moderate_60min'
  };

  const nearestProfiles = lookupNearestProfiles(queryProfile, k=10);
  const aggregateSignal = aggregateBehavior(nearestProfiles);

  const recommendations = [];

  // Recommend baseline frequency target
  if (aggregateSignal.avgFrequencyPerWeek) {
    recommendations.push({
      action: 'set_baseline_frequency',
      priority: 40,
      payload: { target: aggregateSignal.avgFrequencyPerWeek },
      rationale: `Demographic prior: ${nearestProfiles.length} profile similar avg ${aggregateSignal.avgFrequencyPerWeek.toFixed(1)}x/săpt`
    });
  }

  // Recommend baseline volume cap (anti-cold-start overshoot)
  if (aggregateSignal.recommendedStartingVolume) {
    recommendations.push({
      action: 'set_baseline_volume',
      priority: 40,
      payload: { sets: aggregateSignal.recommendedStartingVolume },
      rationale: 'Demographic prior baseline volume — adjusted la real signal post sesiunea 3+'
    });
  }

  return {
    id: 'DEMOGRAPHIC_PRIOR',
    tier: 'LOW',                       // always LOW — prior signal NU dominate, only fill gap
    confidence: nearestProfiles.length >= 5 ? 'medium' : 'low',
    signals: aggregateSignal.dominantTags,    // ex: ['recovery_emphasis', 'beginner_cap']
    recommendations,
    trace: {
      nearestProfileIds: nearestProfiles.map(p => p.id).slice(0, 5),
      matchScore: nearestProfiles[0]?.matchScore,
      kNeighbors: nearestProfiles.length
    },
    meta: { aggregateSignal, queryProfile }
  };
}
```

**Stage assignment rationale (per ADR 018 §3 Decision Cluster):**
- `stage: 'ADJUSTMENT'` — Demographic Prior recommendations calibrate baseline (frequency target, starting volume), NU short-circuit gates. Other ADJUSTMENT dimensions (AA, Vitality at T2+) override prin priority.
- Priority **40 = lowest în ADJUSTMENT stack.** Concrete signal user (real adherence patterns, real RPE) ALWAYS wins over demographic prior. Prior fills gap doar la T0 cu zero behavioral data.

**Priority 40 rationale (within ADJUSTMENT stage):**
- AA HIGH GATE = 95 (separate stage)
- AA MED ADJUSTMENT = 75
- Weak group priority = 70
- Profile Typing = 65
- Vitality LOW = 65
- Cut conservative = 55
- **Demographic Prior = 40** (lowest — auto-overridden de orice signal real)

### Implementation notes

- Dimension `analyze()` total function (ADR 018 §2): always returns DimensionResult.
- `requiresCalibration: 'COLD_START'` field în registry filtered de `getActiveDimensions(ctx)` per ADR 018 §1. T1+ user → dimension skipped entirely (zero cost). Defensive double-guard în `analyze()` for safety.
- Async-capable per ADR 018 DP-2: lookup `lookupNearestProfiles()` poate fi sync în v1 (in-memory K-NN), dar contract permite Promise return dacă future migration la indexed structure (ex: VP-tree, ball-tree pentru high-dim).

---

## 6. Tier gating — T0 active singura dimensiune, T1+ deprecated

### Context

Memory rule #25 + Daniel articulation: **T0 skip = engine generic + demographic prior**. T1+ = Profile Typing override (ADR 014 update). T2+ = Vitality + Profile Typing combined (ADR 016).

Demographic Prior NU adaugă signal post-T1 — ar fi noise vs real user data. Trei opțiuni viable: T0-only hard gate, T0-T1 soft decay, T0+T1 weighted blend.

### Decision

**T0-only hard gate. T1+ → dimension skipped entirely.**

**Behavior per tier:**

| Tier | Demographic Prior active? | Override sources |
|---|---|---|
| COLD_START (T0) | YES — primary signal | None — prior dominate |
| INITIAL (T1) | NO | Profile Typing self-report (ADR 014) |
| PERSONALIZING (T2) | NO | Profile Typing self-report + behavioral inference + Vitality (ADR 016) |
| PERSONALIZED (T3) | NO | Full real signal stack |
| OPTIMIZED (T4) | NO | Full real signal stack |

**Rationale hard gate (NU soft decay):**
- Profile Typing self-report la T1 = user signal real (Q1-Q5 ADR 014). Demographic prior = synthetic approximation. Real > synthetic, deterministic. Soft decay (ex: 50% prior + 50% real la T1) = noise.
- ADR 018 contract guarantee `requiresCalibration` field = simple binary check. Soft decay = additional weighting logic, complexity surface.
- Self-selection feature: user care complete onboarding la day 1 demonstrează engagement → engine prioritizează signal-ul user-ului. User skip onboarding → engine cade în prior până când user signal apare (la T1+ cu onboarding completion later, sau eternal T0 dacă skip permanent).

**Eternal T0 user behavior:**
- User care nu completează onboarding ever → rămâne T0 cu demographic prior până când N sesiuni reali = T1 trigger via behavioral data alone (ADR 009 calibration progression).
- ADR 014 update §Tier-Based Personalization: T1+ skip onboarding (atypical edge case) → tratat ca T0 indefinitely până când onboarding completed manual din settings.

### DP-5: Tier gating — T0-only hard vs T0+T1 weighted blend

Vezi secțiunea finală.

### Implementation notes

- `requiresCalibration: 'COLD_START'` registry field handles T1+ skip automatic per ADR 018 §1.
- Defensive guard în `analyze()` pentru tier check (paranoid pattern, anti registry misconfiguration).
- Trace logs explicit `tier_override_deprecated` pentru auditability — clear semantic în CDL trace.

---

## 7. Lookup logic — K-nearest neighbors aggregate

### Context

Given query user (age, sex, kg, height, BMI, job, lifestyle, goal, etc.), engine trebuie să găsească subset din 500 profile synthetic care match best, apoi aggregate behavioral signal (avg frequency, recommended starting volume, etc.).

Trei opțiuni viable: K-nearest neighbors weighted distance, cluster-based pre-grouping (k-means pre-compute clusters, query maps to cluster), exact-match fallback (rule-based bucketing).

### Decision

**K-nearest neighbors (K=10) weighted distance pe 11 dimensiuni.**

**Distance function:**

```typescript
function profileDistance(query, candidate): number {
  const continuous = (
    weightedDist(query.age, candidate.age, weight=0.20, range=60) +
    weightedDist(query.kg, candidate.kg, weight=0.10, range=110) +
    weightedDist(query.height, candidate.height, weight=0.05, range=50) +
    weightedDist(query.bmi, candidate.bmi, weight=0.10, range=20)
  );

  const categorical = (
    discreteMatch(query.sex, candidate.sex, weight=0.15) +
    discreteMatch(query.job, candidate.job, weight=0.10) +
    discreteMatch(query.lifestyle, candidate.lifestyle, weight=0.05) +
    discreteMatch(query.goal, candidate.goal, weight=0.10) +
    discreteMatch(query.training_history, candidate.training_history, weight=0.10) +
    discreteOverlap(query.equipment, candidate.equipment, weight=0.03) +
    discreteMatch(query.time_availability, candidate.time_availability, weight=0.02)
  );

  return continuous + categorical;
}
```

**Weights total = 1.0.** Age + sex + training_history weighted heavier (highest discriminant signal). Equipment + time_availability lower (practical constraints, NU baseline biology).

**K=10:**
- K=1 = nearest single profile = brittle (one outlier dominates)
- K=10 = aggregate smooth, statistical robustness
- K=50 = signal blur (50/500 = 10% population, too generic)
- Reconsiderate trigger #1 dacă K=10 produce signal weak/skewed.

**Aggregate signal:**

```typescript
function aggregateBehavior(nearestProfiles): AggregateSignal {
  // Weighted average pe metric, weight = 1 / (matchScore + epsilon)
  return {
    avgFrequencyPerWeek: weightedAvg(nearestProfiles, p => p.behavior.derivedMetrics.avgFrequencyPerWeek),
    recommendedStartingVolume: weightedAvg(nearestProfiles, p => p.behavior.sessions[0].proposedVolume),
    expectedSkipRate: weightedAvg(nearestProfiles, p => p.behavior.derivedMetrics.skipRate),
    expectedRecoveryHours: weightedAvg(nearestProfiles, p => p.behavior.derivedMetrics.recoveryDebtAvg),
    dominantTags: extractDominantTags(nearestProfiles)  // ex: ['recovery_emphasis', 'beginner_cap']
  };
}
```

**Match score în trace:** top profile match score logged în DimensionResult.trace pentru auditability + debugging.

### DP-6: Lookup algorithm — K-NN vs cluster-based pre-compute

Vezi secțiunea finală.

### Implementation notes

- Naive K-NN linear scan (500 profiles × 11 dimensions × ~10 ops) = ~50k ops per query. Sub-millisecond la modern CPU. Optimization deferred until needed.
- Distance function pure (no Date.now, no random) per ADR 018 §2 contract.
- Lookup helper în `tests/fixtures/demographicPriorIndex.js`: `lookupNearestProfiles(query, k=10) → SyntheticProfile[]` cu match score attached.
- Test surface: query edge cases (age=16, age=75, BMI extremes, job rare combos) → verify nearest match returns plausible profiles.

---

## 8. Lifecycle — build phase + early launch, deprecate post-100 users

### Context

Daniel articulation crucial:

> "la launch nu mai avem nevoie de profilele de test... se sterg si firebase ramane gol... ma rog cu mine in el."

Demographic Prior = bootstrap mechanism. Post-launch + 100+ users reali, engine has real behavioral data → demographic prior signal becomes redundant noise. Lifecycle declaration explicit în ADR pentru a evita drift "left running forever".

### Decision

**3-phase lifecycle cu explicit deprecation criteria.**

**Phase 1 — Build phase (Sprint 1-3, pre-launch):**
- Demographic Prior LIVE pentru Daniel + alpha users (1-3 useri).
- Generator runs runtime per session.
- Feature flag `demographic_prior_v1: { rollout: 1.00, default: true }`.
- Purpose: validate engine behavior cross-demographic (run synthetic massive → verify NO regressions cross-profile).

**Phase 2 — Early launch (luna 1-3 post-launch, 1-100 useri):**
- Demographic Prior LIVE pentru T0 users (cold-start bridge).
- T1+ users override automatic (per §6 tier gating).
- Feature flag rollout 1.00 menținut.
- Purpose: real users cold-start NU degraded mode. Synthetic prior + real onboarding = personalization aproximativă încă din session 1.

**Phase 3 — Deprecation (luna 3+, 100+ useri):**
- Demographic Prior gradually deprecate.
- Trigger criteria (ANY of):
  - 100+ useri reali T1+ — real behavioral aggregate replaces synthetic prior
  - Per-region/demographic real prior emerges (ex: 50+ users sex=F + age 35-45 → real prior pentru această cohortă)
  - Demographic prior signal reveals empirically uncalibrated (real user T0 patterns ≠ synthetic predictions)
- Rollout decay: 1.00 → 0.50 → 0.10 → 0.00 peste 4-8 săpt watch period.
- Final state: dimension disabled, fixtures rămân în repo pentru historical reference + test data, generator NU mai rulează.

**NU șterge fixtures la deprecation:**
- `tests/fixtures/syntheticProfiles.js` rămân pentru regression tests (engine validation cross-demographic).
- Doar `enabledFlag` rollout 0.0 → dimension dormant în registry.
- Re-activate trivial dacă needed (rollout > 0 → live again).

### DP-7: Lifecycle deprecation trigger — N users vs metric quality vs hybrid

Vezi secțiunea finală.

### Implementation notes

- Phase 3 trigger e Daniel decision (NU automatic) — manual review CDL aggregation patterns + cohort analysis.
- Deprecation log în DECISION_LOG entry când rollout < 0.5 (signal future maintainers că dimension în decay).
- Reactivation gate: dacă cohort gap detected (ex: launch în Spania, 0 useri → cold-start needs prior again pentru new region), re-enable rollout selective.

---

## 9. Manually crafted personas — 6 explicit cases

Personas Daniel-articulated în DECISION_LOG sesiune END 27 apr. Detail bullet-uri scurte per persona — full schema în `tests/fixtures/craftedProfiles.js` post spec EXEC_QUEUE.

### 9.1 Daniel HR 36

```
{
  age: 36, sex: 'M', kg: 78, height: 178, bmi: 24.6,
  job: 'office', lifestyle: 'moderate', goal: 'general_health',
  training_history: 'intermediate',
  equipment: ['dumbbells', 'machines', 'cables'],
  time_availability: 'moderate_60min',
  personaTag: 'Daniel HR 36'
}
```

**Behavioral profile:**
- 4-5x/săpt frequency target (high engagement, hyperfocus risk)
- Adherence 85-90% (strong commitment, occasional skip)
- Sleep variabil din copil mic (recovery hours fluctuate 36-60h post-session)
- Profile typing tendency: Sprinter/Strategic mix (analysis-prone but volume-creep risk)
- Goal expansion over time: general_health → aesthetic → performance progression

**Why this persona:** Daniel real = power user reference. Engine trebuie să handle bine signal pentru high-engagement intermediate user cu sleep variance.

### 9.2 Gigel mecanic 45

```
{
  age: 45, sex: 'M', kg: 88, height: 175, bmi: 28.7,
  job: 'manual_heavy', lifestyle: 'active',
  goal: 'general_health', training_history: 'beginner',
  equipment: ['bodyweight_only', 'dumbbells'],
  time_availability: 'limited_30min',
  personaTag: 'Gigel mecanic 45'
}
```

**Behavioral profile:**
- 2-3x/săpt frequency (cumulative fatigue cu munca fizică)
- Adherence 70-80% (skip pe zile munca grea)
- Recovery slow (48-72h post-session, baseline strain mare)
- Volume cap conservator (NU push beyond ce poate sustain)
- BMI 28.7 = overweight class I — goal weight_loss possibly evolving

**Why this persona:** test case "munca fizică ≠ automatic strong baseline". Engine trebuie să recognize că manual_heavy job = recovery debt, NU stamina free.

### 9.3 Ana educatoare 55

```
{
  age: 55, sex: 'F', kg: 65, height: 162, bmi: 24.8,
  job: 'standing', lifestyle: 'moderate',
  goal: 'general_health', training_history: 'none',
  equipment: ['dumbbells', 'bodyweight_only'],
  time_availability: 'moderate_60min',
  personaTag: 'Ana educatoare 55'
}
```

**Behavioral profile:**
- 2-3x/săpt frequency (low intensity start, hormonal post-menopausal context)
- Adherence 75-85% (consistent dar progress slow)
- Volume conservative initial → ramp 5%/săpt (anti-injury)
- Goal: general_health primary (mobility + bone density secondary motivator)
- RPE reported lower (women 50+ self-report bias, NU under-perform — phenomenon noted în literature)

**Why this persona:** anti-bias case — women 50+ chronically underserved în fitness apps. Engine trebuie să calibreze starter volume rezonabil + progression rate gentle.

### 9.4 Iasmina OF 18

```
{
  age: 18, sex: 'F', kg: 58, height: 168, bmi: 20.6,
  job: 'sedentary', lifestyle: 'moderate',
  goal: 'aesthetic', training_history: 'beginner',
  equipment: ['dumbbells', 'machines', 'cables', 'home_gym'],
  time_availability: 'flexible_90plus',
  personaTag: 'Iasmina OF 18'
}
```

**Behavioral profile:**
- 5-6x/săpt frequency target (high engagement, aesthetic-driven)
- Adherence 90-95% (consistency stake-driven via professional reason)
- Volume aggressive ramp tolerant (young, recovery rapid)
- Goal: aesthetic primary (glutes + hamstrings + core focus)
- Risk: AA detection → engine trebuie să cap reasonable, NOT enable overtraining

**Why this persona:** test case "young + high engagement + aesthetic stake = AA risk". Engine trebuie să balance ambition cu sustainability.

### 9.5 Marius office 28

```
{
  age: 28, sex: 'M', kg: 82, height: 182, bmi: 24.7,
  job: 'sedentary', lifestyle: 'low_active',
  goal: 'aesthetic', training_history: 'beginner',
  equipment: ['dumbbells', 'machines'],
  time_availability: 'moderate_60min',
  personaTag: 'Marius office 28'
}
```

**Behavioral profile:**
- 3-4x/săpt frequency target (motivated transition din sedentary)
- Adherence 65-75% early (motivation high, consistency learning curve)
- Volume conservative initial → moderate ramp (sedentary baseline NU strength reserve)
- Goal: aesthetic primary, secondary general_health
- Profile typing tendency: Strategic OR Sprinter (ambivalent, deciding identity early)

**Why this persona:** representative target user demographic RO (28-35 office worker motivated to start). Engine cold-start most often hit acest profil.

### 9.6 Elena mama 35

```
{
  age: 35, sex: 'F', kg: 68, height: 165, bmi: 25.0,
  job: 'office', lifestyle: 'moderate',
  goal: 'weight_loss', training_history: 'beginner',
  equipment: ['bodyweight_only', 'dumbbells'],
  time_availability: 'limited_30min',
  personaTag: 'Elena mama 35 postpartum 6 luni'
}
```

**Behavioral profile:**
- 2-3x/săpt frequency cap (time-constrained postpartum, sleep disruption)
- Adherence 60-70% (life chaos cu copil mic)
- Volume conservative initial → cap pentru first 6 săpt postpartum (recovery primacy)
- Recovery hours elevated (sleep disrupted = baseline fatigue compounds)
- Goal: weight_loss primary (postpartum restoration secondary)

**Why this persona:** test case "time-constrained + sleep-disrupted = different baseline". Engine trebuie să recognize realistic constraints, NU push 4x/săpt schedule.

---

## Cross-references cu alte ADR-uri

### ADR 018 — Engine Extensibility Architecture

Demographic Prior = greenfield dimension build pe ADR 018 foundation:
- Componenta 1 (Dimension Registry) — entry `DEMOGRAPHIC_PRIOR` adăugat
- Componenta 2 (Standardized Contract) — `analyze(input) → DimensionResult` implementat
- Componenta 3 (Decision Cluster) — Stage 2 ADJUSTMENT integration (priority 40 lowest)
- Componenta 5 (Feature Flags) — `demographic_prior_v1` flag, lifecycle decay 1.0 → 0.0

### ADR 016 — Vitality Layer

- Tier gating coexistence: Demographic Prior T0-only, Vitality T2+. Niciodată active simultan pe același user.
- Plugin architecture pattern reused (greenfield dimension via ADR 018)
- Storage decoupling: Demographic Prior NU persist user data — opposite Vitality (`vitality-responses` localStorage key)

### ADR 014 — Onboarding Profile Typing (post-update)

- Tier gating override: Profile Typing T1+ → demographic prior dimension `requiresCalibration: 'COLD_START'` filter skip dimension. Single source of truth: real user signal > synthetic prior.
- Data flow: T0 user skip onboarding → demographic prior fills gap. T0 user complete onboarding → engine still T0 calibrare-wise, dar Profile Typing data stocata pentru T1 activate (per ADR 014 update §Tier-Based Personalization).

### ADR 013 — Auto-Aggression Detection

- Demographic Prior NU triggers AA. AA detection is behavioral-driven (real user volume creep, RPE drift). Synthetic prior NU genera "AA signals" pentru user (would be theatre).
- Cross-effect: la T0 user cu profile Sprinter-prone (manually crafted Daniel HR or Iasmina OF), demographic prior poate suggest baseline volume conservativ, anti-AA preempt. Cluster cross-reference helper `resolveDemographicAACalibration` opțional viitor (NU v1).

### ADR 011 — Coach Decision Log

- Demographic Prior NU scrie CDL outcome — read-only dimension. CDL `proposed.rationale` poate include `demographicPriorMatchScore` în trace pentru transparency.
- Schema migration NU needed pentru CDL — existing context schema sufficient (demographic data deja captured în userProfile, NU per-decision snapshot).

### ADR 009 — Calibration Tiers

- Demographic Prior `requiresCalibration: 'COLD_START'` = active SOLELY at T0. Hard binary gate.
- Tier transition T0 → T1 (7 zile + 3 sesiuni) = automatic deprecation.

---

## Consequences

### Positive

- **T0 user NU degraded mode.** Cold-start session are signal demografic, NU fully generic defaults.
- **Engine validation cross-demographic** pre-launch. Run synthetic 500 profile × 90 zile → verify NO regressions across age/sex/job/goal combinations.
- **Edge cases covered.** Manually crafted 50 personas captures real-world combinations (Elena postpartum, Gigel manual_heavy, Ana 55+) care algorithmic might miss.
- **Zero permanent storage cost.** $0 Firebase impact. Generator runtime memory only.
- **Plugin architecture proven again.** Demographic Prior = second greenfield ADR 018 dimension (after Vitality), valida foundation patterns.
- **Lifecycle declaration explicit.** Phase 3 deprecation criteria cu trigger conditions = anti-drift "left running forever".

### Negative

- **Synthetic data calibration uncertainty.** Behavioral patterns generator (§3) bazat pe heuristic + literature, NU empirical user data. Risk: synthetic predictions diverge de real T0 user behavior.
- **Memory footprint ~10-12 MB resident.** Acceptable pentru desktop/mobile modern, dar NU zero-cost.
- **Generator complexity.** 500 profile × 90 sesiuni × stochastic noise = non-trivial code surface (~200-300 LOC fixtures + generator). Test coverage critical.
- **Lookup performance.** Naive K-NN linear scan O(N×D) pe 500×11 = sub-ms, dar dacă scale 5000+ profile (post-deprecation reactivation expansion), needs optimization.
- **Cross-validation cu real data deferred.** Real T0 user behavior vs synthetic predictions = post-launch metric (Phase 2 metric watch).

### Risks

- **Synthetic prior empirically wrong.** Heuristic shape rules + stochastic noise calibrated pre-empirical data → wrong baseline assumptions. Mitigation: Phase 2 metric watch + recalibration per Reconsideration Trigger #2.
- **Manually crafted personas bias.** 6 personas = Daniel's mental model of target users. Coverage gaps possible (ex: rural RO users, older men 60+ with strength history). Mitigation: 44 additional crafted edge cases + 450 algorithmic generated cu controlled distribution.
- **Generator reproducibility drift.** Seed-based generator + library updates (Math.random internals) could produce different profiles between dev/CI/production. Mitigation: deterministic seed + pinned random implementation (custom mulberry32 seedable PRNG instead of Math.random).
- **Over-reliance pe demographic prior.** Engine T0 might learn to heavy-weight prior, slow tier transition T0→T1. Mitigation: priority 40 lowest în ADJUSTMENT + hard gate `requiresCalibration: 'COLD_START'`.
- **Lifecycle drift (no Phase 3).** Without explicit deprecation, dimension stays alive forever. Mitigation: lifecycle declaration §8 + reconsideration trigger #5.

---

## Reconsideration Triggers

1. **K=10 lookup signal weak/skewed post Phase 1.** Top match score consistently low (< 0.5 normalized) sau aggregate signal high variance → recalibrate K (try K=5 or K=20) sau distance function weights.
2. **Real T0 user behavior diverges synthetic predictions.** Compare actual T0 user adherence/RPE/volume patterns vs synthetic prior. Divergence > 30% → recalibrate generator §3 stochastic noise + shape rules.
3. **Manually crafted persona coverage gap.** Real users la launch surface demographic combination NOT covered by 50 crafted profiles → add new persona (Daniel manual review trigger).
4. **Profile generator combination filter false positives.** Algorithmic generator drops too many "implausible" combinations → real-world existence rate reveals gap. Recalibrate `isPlausible(profile)` rules.
5. **Lifecycle Phase 3 trigger.** 100+ users reali T1+ → real behavioral aggregate replaces synthetic prior. Daniel manual decision rollout decay 1.0 → 0.0.
6. **Memory footprint problem.** > 10 MB resident becomes constraint pe mobile low-end → consider lazy load (only generate profiles needed for query, NU full database).
7. **Cross-region launch.** Launch în alt țară/cultură (Spania, Germania, etc.) → demographic distribution shifts (age × job × goal mix). Recalibrate algorithmic distribution per region OR deprecate dimension și re-bootstrap regional priors.
8. **Generator reproducibility drift detected în CI.** Test runs pe CI vs dev produce different profiles → switch la pinned PRNG (mulberry32) sau full snapshot fixture.

---

## Implementation Notes

**Scope ADR:** principle + 8 componente structurale + plugin architecture aliniat ADR 018 + 6 manually crafted personas detaliate + lifecycle declaration. **NU spec implementabil.**

**Dependencies critice:**

- ADR 018 (Engine Extensibility) — **ACCEPTED 2026-04-27**, foundation pentru plugin
- ADR 014 (Profile Typing) — **ACCEPTED 2026-04-26 + Update ACCEPTED 2026-04-27**, Profile Typing override T1+
- ADR 016 (Vitality Layer) — **ACCEPTED 2026-04-27**, Vitality T2+ coexistence
- ADR 009 (Calibration Tiers) — T0 hard gate
- ADR 011 (CDL) — read-only consumer (NU schema migration needed)

**Ordine recomandată implementation post-ADR 017 sign-off:**

1. ADR 017 sign-off Daniel (DP-1...DP-7 rezolvate)
2. ADR 018 foundation Sprint complete (Registry + Contract + Cluster + Versioning + Flags built)
3. Spec EXEC_QUEUE Demographic Prior schema + 6 manually crafted personas (`tests/fixtures/craftedProfiles.js`)
4. Spec EXEC_QUEUE algorithmic generator + 44 additional crafted personas (`tests/fixtures/profileGenerator.js`)
5. Spec EXEC_QUEUE behavior generator (`tests/fixtures/behaviorGenerator.js`)
6. Spec EXEC_QUEUE lookup index + K-NN (`tests/fixtures/demographicPriorIndex.js`)
7. Spec EXEC_QUEUE Demographic Prior dimension (`src/engine/dimensions/demographicPrior.js`) + tests
8. Run synthetic 500 × 90 zile → engine validation cross-demographic
9. Phase 1 LIVE Daniel + alpha (rollout 1.0)
10. Phase 2 launch (luna 1-3 post-launch)
11. Phase 3 deprecation (luna 3+, criteria-driven)

**Test strategy:**
- Unit tests pe `analyze()` cu mock query profiles + verify recommendation shape
- Unit tests pe lookup `lookupNearestProfiles` cu sample queries → verify nearest matches plausible
- Integration tests: full pipeline ctx T0 → demographic prior dimension → cluster → session
- Cross-demographic regression suite: 500 profile × 90 zile → verify NO crashes, NO NaN volume, NO impossible recommendations

---

## Decision Points — Daniel Sign-Off Required

7 decision points marcate. Toate au trade-off real cu > 1 opțiune viable. Decisions cosmetic (dimension id naming, file paths exact, distance function weight tuning) decise în-line.

### DP-1: Profile dimension count — 11 vs minimal-set vs comprehensive

**Options:**
- **A:** Minimal set (5 dimensions: age, sex, kg, height, BMI)
  - Pros: simplest, easy to populate, fast lookup
  - Cons: zero discrimination on intersection (job × goal × lifestyle), back to "age bucket defaults" pattern hardly improving status quo
- **B:** Standard 11 dimensions (proposed) — biometrics + job + lifestyle + goal + training_history + equipment + time_availability
  - Pros: realistic discrimination power, captures intersections (sedentary office × aesthetic = different baseline vs manual heavy × general_health)
  - Cons: combinatorial complexity (more dimensions = sparser coverage per combination at N=500)
- **C:** Comprehensive 18+ dimensions — adds injury history, hormonal status, sleep baseline, stress baseline, supplement use, etc.
  - Pros: maximum signal
  - Cons: scope creep (some bordering bloodwork-territory), generator complexity explosion, manually crafted persona effort 5x

**Recommendation:** B — 11 dimensions. Match Daniel articulation specific dimensions. Scope discrimination viable la N=500 (each combination ~5-10 nearest neighbors). Comprehensive overshoots scope creep + Gigel territory. Minimal underdelivers vs status quo.

**Need Daniel sign-off:** YES

---

### DP-2: Profile mix ratio — 50/450 manual/algorithmic vs 100/400 vs full algorithmic

**Options:**
- **A:** 50/450 (proposed) — 50 manually crafted edge cases + 450 algorithmic
  - Pros: Daniel articulation specific. 6 anchor personas + 44 edge cases + 450 algorithmic bulk = balanced. Manual cost ~1-2 zile.
  - Cons: 50 crafted manual cost non-zero, requires Daniel input/review per persona.
- **B:** 100/400 — heavier manual investment în coverage
  - Pros: more edge cases caught manually, less reliance pe algorithmic plausibility filter
  - Cons: manual cost 4-6 zile (4x), diminishing returns on coverage (algorithmic captures bulk efficiently)
- **C:** Full algorithmic (0/500) — purely generated cu controlled distributions
  - Pros: zero manual cost, fully reproducible
  - Cons: lose 6 anchor personas Daniel-articulated (Daniel HR, Gigel, etc.), edge cases reliant pe distribution coverage (probabilistic miss rare combos)

**Recommendation:** A — 50/450 manual/algorithmic. Match Daniel articulation. 6 anchor personas + 44 edge case crafted = realism + coverage edge cases. 450 algorithmic = bulk coverage cost-efficient. Manual investment ~1-2 zile = acceptable for foundation infrastructure.

**Need Daniel sign-off:** YES

---

### DP-3: Behavioral generator — rule-based shape vs pure stochastic vs ML-derived

**Options:**
- **A:** Rule-based shape + stochastic noise (proposed) — shape rules per dimension intersection (age + training_history → baseline freq) + Gaussian noise for realism
  - Pros: explainable signal, easy debug, deterministic la seed level, calibratable per Daniel intuition
  - Cons: shape rules = heuristic (NU empirical pre-launch), require recalibration post real data
- **B:** Pure stochastic — distributions per dimension, no rule shape
  - Pros: less Daniel bias în signal, more uniform sampling
  - Cons: signal blur, lose intentional shape (ex: Sprinter intensity craving NU emerges purely stochastic)
- **C:** ML-derived from external dataset
  - Pros: empirical foundation
  - Cons: zero training data pre-launch, external datasets domain-mismatched (RO users ≠ US gym users), black-box

**Recommendation:** A — rule-based + stochastic noise. Match SalaFull principle (explainable engine, NU black-box). Heuristic shape rules + noise = balanced realism + calibratability. Recalibration trigger #2 covers empirical correction post real data. ML deferred until 1000+ real user data.

**Need Daniel sign-off:** YES

---

### DP-4: Storage strategy — runtime in-memory vs persisted fixtures

**Options:**
- **A:** Runtime in-memory generation (proposed) — generate profiles + behavior la app start, garbage collect at exit
  - Pros: zero persistent storage, zero Firebase cost, zero migration cost, lifecycle clean (Phase 3 deprecation = stop generating)
  - Cons: ~10-12 MB resident memory, generation cost ~50-100ms at startup (cached pe process lifetime, single payment)
- **B:** Persisted fixtures (JSON file pre-computed) — generator runs build-time, output baked în fixtures, loaded la query
  - Pros: zero generation runtime cost, deterministic across runs
  - Cons: bundle size impact (10+ MB JSON in build artifact), versioning complexity (regenerate = file diff in git), drift risk
- **C:** IndexedDB cache — generate once per browser, persist in IndexedDB
  - Pros: zero re-generation cost across sessions
  - Cons: stale data risk (generator updates require manual cache bust), additional storage layer complexity

**Recommendation:** A — runtime in-memory. Match Daniel articulation crucial ("la launch nu mai avem nevoie..."). Zero persistence cost = clean lifecycle. ~10 MB memory + ~50ms startup = acceptable trade-off. Persistence (B or C) adds complexity for non-existent scale problem.

**Need Daniel sign-off:** YES

---

### DP-5: Tier gating — T0-only hard vs T0+T1 weighted blend vs T0-T2 with decay

**Options:**
- **A:** T0-only hard gate (proposed) — `requiresCalibration: 'COLD_START'`, T1+ skip dimension entirely
  - Pros: simple, deterministic, real signal user > synthetic prior immediately at T1
  - Cons: T1 user (3 sesiuni reale, behavioral data sparse) might benefit from prior backstop
- **B:** T0+T1 weighted blend — Demographic Prior 100% T0, decay 50% T1, 0% T2+
  - Pros: smooth transition, prior backstops T1 sparse behavioral data
  - Cons: blending complexity, real signal compromised pe weeks 1-4, contract violation (recommendations weighted is non-trivial within Decision Cluster stage compose)
- **C:** T0-T2 with full decay — prior linear decay across calibration levels
  - Pros: maximum smoothing
  - Cons: prior signal influences T2 user (post-personalizing) = noise, violates self-selection feature principle

**Recommendation:** A — T0-only hard gate. Simplest contract, Daniel articulation aligned, real signal > synthetic always wins post T0. Smooth transitions can come from increasing density of behavioral data weights in cluster, NOT from blending prior cu real.

**Need Daniel sign-off:** YES

---

### DP-6: Lookup algorithm — K-NN linear vs cluster pre-compute vs ANN approximate

**Options:**
- **A:** K-NN linear scan (K=10) — naive O(N×D) per query
  - Pros: simple, deterministic, sub-millisecond at N=500, no precompute infrastructure
  - Cons: O(N) doesn't scale beyond ~5000 profiles
- **B:** Cluster pre-compute (k-means pre-group profiles into 50 clusters at startup, query maps to cluster centroid)
  - Pros: O(K + cluster_size) per query, scales better
  - Cons: precompute cost startup, cluster centroids smooth rare combinations away, complexity 3x
- **C:** ANN approximate (LSH, ball-tree, VP-tree) — sub-linear search
  - Pros: scales to 100k profiles, sub-ms even at scale
  - Cons: implementation complexity, dependency footprint, overkill at N=500

**Recommendation:** A — K-NN linear. N=500 scale = sub-ms naive. Optimization deferred until reconsideration trigger #6 (memory) or scale > 5000. YAGNI clearly. Reconsider trigger #1 captures K-tuning needs.

**Need Daniel sign-off:** YES

---

### DP-7: Lifecycle deprecation trigger — N users vs metric quality vs hybrid

**Options:**
- **A:** N users threshold — 100+ users reali T1+ → deprecate
  - Pros: simple measurable trigger, anti-drift
  - Cons: signal weak — 100 users la launch coverage might still be sparse pe certain demographics (ex: 100 users dar 0 women 50+)
- **B:** Metric quality — deprecate când real T1+ behavioral aggregate signal > synthetic prior signal quality (per cohort)
  - Pros: signal-driven, robust to demographic skew
  - Cons: complex to measure objectively, requires cohort analysis infrastructure
- **C:** Hybrid — both N threshold AND per-cohort metric quality (deprecate per-cohort dacă cohort hits N + signal quality bar)
  - Pros: maximum robustness
  - Cons: complexity, requires rollout flag granularity per cohort (NU current ADR 018 §5 capability)

**Recommendation:** A — N users threshold. Match Daniel articulation simplicity. 100 users threshold + Daniel manual review = enough rigor. Per-cohort decay (option C) deferred until reconsideration trigger #7 (cross-region launch). Metric quality (option B) implicit la Daniel manual review.

**Need Daniel sign-off:** YES

---

## Sign-Off — 2026-04-27

Daniel approved 7/7 decision points după review post-Opus draft.

- DP-1 Profile dimensions: B — 11 dimensions APPROVED
- DP-2 Profile mix ratio: A — 50/450 manual/algorithmic APPROVED
- DP-3 Behavioral generator: A — rule-based shape + stochastic noise APPROVED
- DP-4 Storage strategy: A — runtime in-memory APPROVED
- DP-5 Tier gating: A — T0-only hard gate APPROVED
- DP-6 Lookup algorithm: A — K-NN linear K=10 APPROVED
- DP-7 Deprecation trigger: A — 100+ users threshold + Daniel manual review APPROVED

**Reconsider trigger DP-7:** pure N threshold poate deprecate prematur pentru cohorts under-represented (ex: 100 users dar 0 women 50+). Daniel manual review = implicit cohort sanity check. Recalibrate dacă cohort skew real observat post-launch.

---

*ADR 017 — Accepted 2026-04-27. Status: spec architectural complete, gata pentru spec EXEC_QUEUE follow-up post Sprint Foundation ADR 018.*
