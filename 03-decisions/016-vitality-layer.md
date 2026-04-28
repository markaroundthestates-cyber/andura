# ADR 016: Vitality Layer

**Status:** Accepted
**Date:** 2026-04-27
**See also:** [[018-engine-extensibility-architecture]] | [[014-onboarding-profile-typing]] | [[013-auto-aggression-detection]] | [[011-coach-decision-log-architecture]] | [[009-calibration-tiers]] | [[INSIGHTS_BACKLOG]] | [[DECISION_LOG]]

---

## Context

SalaFull's coach calibrează decizii pe ce poate observa: logs (volum, frecvență, RPE), context derivat (readiness, fatigue), profile typing (ADR 014), AA detection (ADR 013). Toate aceste semnale sunt **comportamentale post-acțiune** — ce face user-ul, NU cum se simte user-ul în repaus.

Lipsa unei dimensiuni `state-of-being` produce concrete failures:

1. **AA detection oarbă la condiția de bază.** User cu energie cronic scăzută + somn slab + stres ridicat are pragul "auto-agresivitate" calibrat identic cu user în formă perfectă. Volume creep pe baseline epuizat ≠ volume creep pe baseline odihnit. Threshold-uri rigide produc fals negative pe useri vulnerabili și fals pozitive pe useri robust.

2. **Profile typing one-dimensional.** Sprinter cu motivație înaltă + recovery rapid (Daniel sănătos) primește același tratament ca Sprinter cu motivație fluctuantă + recovery lent (Sprinter post-burnout). Profile = identitate, NU dispoziție curentă. Engine-ul nu poate distinge "Sprinter astăzi obosit" de "Sprinter normal".

3. **Bloodwork OUT (Gigel filter).** Daniel a respins explicit (DECISION_LOG 2026-04-26) integrarea cu bloodwork extern: privacy panic la user mediu RO, scope creep medical, liability legal. Dar nevoia subiacentă (signal pe state-of-being) rămâne validă.

4. **Cold-start state-blind.** ADR 009 cold-start session usese age + experience pentru population-prior weights, fără signal pe energy/sleep/recovery. Doi useri 35 ani cu profil identic la onboarding pot avea state-of-being radical diferit (unul în formă, altul post-burnout) — engine-ul tratează identic.

**Daniel articulation (sesiune 27 apr 2026, INSIGHTS_BACKLOG ADR 016):**

> "intrebari scurte despre user — cum te simti, energic/normal, temperamental, dormi bine, etc. Combinat cu age+kg+height+BMI ne indică direcția approximativ. Behavioral proxy questions = signal puternic, friction zero."

**Soluția:** Vitality Layer = set scurt de behavioral proxy questions opt-in care produc signal pe state-of-being. NU bloodwork. NU clinical. Întrebări fenomenologice pe ce simte user-ul, formulate Gigel-friendly. Combinate cu demographic data (age, kg, height, BMI) → context state pentru calibrare engine.

**Scope ADR:** principle + 8 componente (questions scope, scoring, reconciliation cu Profile Typing, tier gating, storage, plugin arhitectură ADR 018, feature flag rollout). **NU spec implementabil.** Spec EXEC_QUEUE post-acceptance.

**Dependency:** ADR 018 acceptat (componente Dimension Registry + Contract + Cluster + Versioning + Flags). Vitality Layer = primul **greenfield** dimension implementat ca plugin după foundation.

---

## Decision

Adoptăm **Vitality Layer** ca dimensiune nouă în engine, plugged in via ADR 018 patterns, cu 8 componente structurale care împreună definesc scope + integration.

### Working title final: "Vitality Layer"

**Considered alternatives:**
- "State Signals" — precis, dar rece. UI-friendly slab.
- "Lifestyle Layer" — prea broad, evocă nutrition/sleep tracking apps comerciale.
- "Recovery Profile" — prea îngust. Recovery = un singur signal din 6.

**Adopted:** "Vitality Layer" — captures holistic intent (energy + mood + sleep + stress + motivation + recovery), warm enough pentru UI labels (banner "Vitality check-in"), short enough pentru cod (`dimensions/vitality.js`). Decision inline (NU DP) — naming = cosmetic.

---

## 1. Scope întrebări — 6 behavioral proxy areas

### Context

Daniel brainstorm INSIGHTS_BACKLOG enumeră 5 areas: Energie, Stres, Sleep, Motivație, Inflamație. Plus "temperamental" (Reactivitate). 6 total. Întrebările trebuie să fie:

- **Behavioral proxy, NU clinical.** "Te trezești odihnit?" da; "Câte ore dormi?" da; "Ai apnee de somn?" NU.
- **Gigel-friendly.** RO casual, NU jargon medical. Test mental: "Cum reacționează un mecanic 45 ani non-tech?"
- **Scurte.** 4 opțiuni ordinale per întrebare, NU paragrafe libere.
- **Opt-in friction-zero.** User skip mid-flow = OK, parțial fill = OK.

### Decision

6 întrebări în Vitality Layer v1. Wording draft RO mai jos. Implementation va exporta strings ca consts în `src/onboarding/vitalityCopy.js` (pattern ADR 014 §2 — hot-swap post user-test feedback).

#### Q1 — Energie generală

> "Cum te simți cu energia în ultimele 2 săptămâni?"
>
> a) Energic — am chef și putere
> b) Normal — fluctuații obișnuite
> c) Obosit — mai des decât aș vrea
> d) Epuizat — aproape mereu fără energie

**Mapare:** scor ordinal 4→1. a=4 (energetic), d=1 (depleted).

#### Q2 — Sleep quality

> "Te trezești odihnit dimineața?"
>
> a) Da, aproape mereu
> b) De obicei, da
> c) Rar
> d) Aproape niciodată

**Mapare:** 4→1. Behavioral proxy pentru recovery quality, NU ore dormit (ore = unreliable, perceived restoration = signal real).

#### Q3 — Stres cognitiv

> "Cât de stresat te simți în general?"
>
> a) Calm — gestionez bine
> b) Normal — stres OK pentru viața mea
> c) Tensionat — mai des decât aș vrea
> d) Foarte stresat — copleșit frecvent

**Mapare:** 4→1. NU clinical anxiety question. Stres în sens Gigel = "presiune zilnică".

#### Q4 — Motivație

> "Cum e cu motivația în ultimele 2 săptămâni? (general — nu doar la sală)"
>
> a) Înaltă — am chef de tot
> b) OK — funcțională
> c) Redusă — mai mult forțat
> d) Aproape inexistentă — costă efort să fac orice

**Mapare:** 4→1. Phrased "general, NU doar la sală" anti-bias — user motivat la sală dar burnout în viață produce signal valid.

#### Q5 — Recovery post-antrenament

> "După un antrenament intens, cât îți ia să te simți la normal?"
>
> a) Câteva ore — sunt bine de a doua zi
> b) O zi — nimic ieșit din comun
> c) 2-3 zile — mai mult decât m-aș aștepta
> d) Mai mult de 3 zile — recovery lent constant

**Mapare:** 4→1. Self-reported recovery time = behavioral proxy pentru fitness baseline + sleep quality compounding.

#### Q6 — Reactivitate emoțională

> "Te-ai descrie ca echilibrat sau temperamental?"
>
> a) Echilibrat — rareori reactiv
> b) De obicei calm — uneori reactiv
> c) Mai degrabă reactiv — mă enervez/frustrez ușor
> d) Temperamental — schimbări mari de stare

**Mapare:** 4→1. Daniel articulation specific include "temperamental". Behavioral framing OK (Gigel test pass — NU "ai bipolar?", da "te enervezi ușor?").

### Întrebări REJECTED (Gigel filter fail)

- **Libido / erecție** — direct medical. Risk privacy panic + legal.
- **"Inflamație"** ca cuvânt — sounds clinical. Înlocuit cu "dureri musculare/articulare" (dropped din v1, candidate v2 dacă signal needed).
- **Hours of sleep** numeric — unreliable self-report. Înlocuit cu Q2 perceived restoration.
- **"Depresie/anxietate"** label-uri clinice — judgmental. Înlocuit cu Q3 + Q4 behavioral framing.
- **"Cât bei?"** — invasive lifestyle question. NU în scope behavioral coaching.

### DP-1: Delivery moment — onboarding vs in-session vs background

Vezi secțiunea finală.

### Implementation notes

- 6 întrebări = ~45-90 secunde completion. Acceptable friction pentru opt-in.
- Skip per-question allowed. Partial completion = scored cu null pentru skipped (vezi §3 scoring).
- Wording în `src/onboarding/vitalityCopy.js`. Const exports per ADR 014 §2 hot-swap pattern.

---

## 2. Scoring schema

### Context

6 întrebări × 4 opțiuni ordinale → trebuie agregate în signals consumabile de engine. Trei opțiuni viable: numeric ordinal direct (1-4), categorical labels per întrebare, hibrid.

### Decision

**Numeric ordinal 1-4 per întrebare + composite vitality score + flag-uri categorical.**

```typescript
type VitalityResponses = {
  schemaVersion: 1,
  completedAt: number,           // Date.now() la submit
  responses: {
    energy: 1 | 2 | 3 | 4 | null,        // Q1
    sleep: 1 | 2 | 3 | 4 | null,         // Q2
    stress: 1 | 2 | 3 | 4 | null,        // Q3 — INVERTED: 4=calm, 1=foarte stresat
    motivation: 1 | 2 | 3 | 4 | null,    // Q4
    recovery: 1 | 2 | 3 | 4 | null,      // Q5
    reactivity: 1 | 2 | 3 | 4 | null     // Q6 — INVERTED: 4=echilibrat, 1=temperamental
  },
  composite: number | null,      // weighted average pe completed responses, 1-4 scale
  tier: 'HIGH' | 'MED' | 'LOW' | 'INSUFFICIENT' | null,
  flags: string[]                // ex: ['low_energy', 'recovery_lent', 'high_reactivity']
};
```

**Composite formula (v1):**

```
composite = mean(non-null responses)
```

**Tier mapping din composite:**

| Composite | Tier | Semantic |
|---|---|---|
| ≥ 3.5 | HIGH | Vitality robustă — engine poate push intensity |
| 2.5–3.49 | MED | Vitality normală — defaults engine |
| 1.5–2.49 | LOW | Vitality compromisă — recommend deload + watch AA closer |
| < 1.5 | LOW + flag burnout_risk | Vitality critică — gate session-ul + suggest medical consult |

**Flag-uri categorical (independente de composite):**

- `low_energy` — Q1 ≤ 2
- `poor_sleep` — Q2 ≤ 2
- `high_stress` — Q3 ≤ 2 (inverted scale)
- `low_motivation` — Q4 ≤ 2
- `recovery_lent` — Q5 ≤ 2
- `high_reactivity` — Q6 ≤ 2 (inverted scale)
- `burnout_risk` — composite < 1.5 OR (≥3 flags individuale active)
- `insufficient_data` — < 4 din 6 răspunsuri completate (mark `tier: 'INSUFFICIENT'`)

**Edge cases:**

| Caz | Composite | Tier | Flags |
|---|---|---|---|
| 6/6 completed, all 4 | 4.0 | HIGH | [] |
| 6/6 completed, mixed | varies | varies | per-flag |
| 4/6 completed | mean of 4 | varies | per-flag, plus `partial_data` |
| 3/6 completed | null | INSUFFICIENT | [`insufficient_data`] |
| 0/6 completed | null | null | [] (treated ca "no signal") |

### DP-2: Response format — Likert numeric vs categorical labels

Vezi secțiunea finală.

### Implementation notes

- Q3 + Q6 are scale inversed (a=high vitality even though a=stres mic / a=echilibrat). Conversion handled în scoring layer, NU exposed la UI.
- Composite formula v1 simple mean. Reconsiderat la trigger #1 dacă weighting selective (ex: sleep × 1.5 pentru recovery primacy) demonstrably improves signal.
- Flag-uri stocate ca `string[]` pentru extensibilitate (v2 poate adăuga `chronic_pain`, `medication_effect`, etc.).

---

## 3. Reconciliation cu Profile Typing (ADR 014)

### Context

Profile Typing (ADR 014) produce primary profile (Sprinter / Marathon / Yo-yo / Strategic) bazat pe Q1-Q5 onboarding + behavioral data. Vitality Layer produce vitality tier + flags bazat pe Q1-Q6 vitality.

**Overlap real:**
- Q4 motivation Vitality ≈ proxy pentru Sprinter "intensity craving" în Profile Typing
- Q5 recovery Vitality ≈ proxy pentru AA detection signal #4 (recovery debt)
- Q6 reactivity Vitality ≈ proxy pentru Sprinter "frustration markers" în AA

Două abordări viable: dimensiuni independente (cleaner contract per ADR 018) vs cross-feed (Vitality refinează Profile Typing thresholds).

### Decision

**Independent dimensions cu read-only cross-reference în Decision Cluster.**

- Vitality Layer = standalone dimension în registry. Output `DimensionResult` per ADR 018 §2.
- Profile Typing = standalone dimension. Output `DimensionResult` per ADR 018 §2.
- **NU cross-feed direct** între `analyze()` functions (s-ar viola ADR 018 contract guarantee "pure function, deterministic, total").
- **Decision Cluster cross-references** outputs ambelor în Stage 2 ADJUSTMENT logic. Exemple:
  - AA detection thresholds calibrate per `(profileTyping.tier, vitality.tier)` matrix. Sprinter+LOW vitality = pragul HIGH AA scade (mai sensibil). Strategic+HIGH vitality = pragul HIGH crește (mai permisiv).
  - Volume multiplier compose multiplicativ: Sprinter base 1.0 × Vitality LOW 0.85 = 0.85 final.
  - Banner injection (Stage 3 ENHANCEMENT): "Vitality LOW detectat — sesiunea redusă cu 15%, recovery prioritar".

**Rationale:**
- Independent contract = testabil isolate (per ADR 018). Mock vitality output în Profile Typing tests și invers.
- Cross-feed în `analyze()` = coupling implicit, harder to debug. Cluster cross-reference = explicit metadata în recommendation rationale.
- Reconciliation problem (mismatch self-report vs behavioral) e specific Profile Typing (ADR 014 §4). Vitality Layer NU are echivalent — vitality e self-report-only în v1, fără behavioral inference (vezi reconsideration trigger #3).

### DP-3: Coupling Vitality ↔ Profile Typing

Vezi secțiunea finală.

### Implementation notes

- Cluster cross-reference logic în `src/engine/decisionCluster.js` Stage 2 helper `resolveAACalibration(profileResult, vitalityResult, ctx)` — pure function, easy to test.
- Vitality flags (ex: `high_reactivity`) NU re-derive în Profile Typing. Single source of truth: vitality dimension.
- Profile Typing reconciliation flow (ADR 014 §4) NU triggered de vitality changes. Profile = identitate stabilă, vitality = state fluctuant. Cross-effect numai în calibrare AA, NU în reconciliation prompt.

---

## 4. Tier gating — T2+ (PERSONALIZING) activate

### Context

ADR 009 calibration tiers (COLD_START → INITIAL → PERSONALIZING → PERSONALIZED → OPTIMIZED). Memory rule #25 (Daniel preference): "T2+ Vitality activate. T0/T1 skip = engine acceptabil baseline din demographic. Self-selection = feature, NU bug."

Trei opțiuni viable: T1+ (early signal), T2+ (clean baseline), T3+ (rigid).

### Decision

**T2+ (PERSONALIZING) activate. T0/T1 skip = engine acceptabil din demographic prior.**

**Rationale per ADR 009 §calibration timing:**
- T0 COLD_START + T1 INITIAL = user în primele 28 zile, < 12 sesiuni. Engine baseline din age/kg/height/BMI + onboarding (ADR 014 Q1-Q5). Adăugarea Vitality la T0/T1 = onboarding overload (5 questions Profile Typing + 6 Vitality = 11 questions = drop-off risk).
- T2+ PERSONALIZING (28 zile + 12 sesiuni) = user has demonstrated commitment. Vitality questions arrive cu trust earned. Friction-zero opt-in semantic preserved.
- Self-selection = feature: useri care ajung la T2+ AND completează Vitality = high-engagement signal pentru engine. Signal quality > coverage breadth.

**Behavior per tier:**

| Tier | Vitality prompt | Vitality respected în engine? |
|---|---|---|
| COLD_START (T0) | NU prompt | NU (no data) |
| INITIAL (T1) | NU prompt | NU (no data) |
| PERSONALIZING (T2) | Prompt opt-in la prima sesiune T2 | YES dacă completed |
| PERSONALIZED (T3) | Re-prompt dacă T2 skipped (1 reminder, then silent) | YES dacă completed |
| OPTIMIZED (T4) | Re-prompt anual sau on profile_history reconciliation | YES dacă completed |

**Skip behavior:**
- T2 user skip prompt = prompt re-shown la T3. T3 skip = silent forever (până la T4 anniversary trigger sau user explicit demand).
- Skip ≠ no-data forever: user poate trigger Vitality manually din settings ("completează Vitality acum").
- Skip ≠ punishment: engine continuă cu defaults, NU degraded mode.

### DP-4: Tier gating threshold — T1 vs T2 vs T3

Vezi secțiunea finală.

### Implementation notes

- Vitality dimension în registry: `requiresCalibration: 'PERSONALIZING'` (per ADR 018 §1 registry helper `getActiveDimensions(ctx)`).
- Prompt timing logic în `src/engine/dimensions/vitality.js` `shouldPromptVitality(ctx)` helper. Re-prompt frequency cap analog ADR 014 §4 (8 săpt minimum între prompts).
- "Self-selection feature" semantic: dacă < 30% T2+ users complete Vitality, NU panic. Vitality e bonus signal, NU foundation. Reconsiderate trigger #2.

---

## 5. Storage schema

### Context

Două opțiuni viable: separate localStorage key `vitality-responses` (pattern ADR 014 §6 `profile-history`), CDL extension (pattern ADR 011 schema versioning).

### Decision

**Separate localStorage key `vitality-responses` + CDL context snapshot nullable extension.**

**Storage 1: `vitality-responses` localStorage key**

```typescript
vitality-responses: {
  schemaVersion: 1,
  history: Array<VitalityResponses>  // multiple entries pentru re-prompts T2/T3/T4
}
```

**Schema VitalityResponses** (vezi §2 scoring) — append-only history per user. Permite tracking evolution: user T2 LOW vitality → T4 HIGH vitality = improvement trajectory.

**Rationale separate key:**
- Pattern existing (ADR 014 §6 `profile-history`) — separate keys for orthogonal lifecycle data.
- Vitality events sunt session-orthogonal (NU per-session decisions). CDL = session-level. Forțarea în CDL = schema misuse per ADR 011 principle.
- Volum mic — 1-5 entries/user/an. Backup overhead minimal.

**Storage 2: CDL context snapshot extension (nullable, per ADR 011 §schema extension pattern)**

Per ADR 018 §4 schema versioning, CDL `context` schema extends with nullable field:

```typescript
context.vitality: {
  tier: 'HIGH' | 'MED' | 'LOW' | 'INSUFFICIENT' | null,
  flags: string[],
  composite: number | null,
  responsesAge_days: number,        // age of latest vitality-responses entry
  schemaVersion: 1
} | null
```

**Semantics:**
- `null` = no vitality data available (T0/T1 user, sau T2+ skipped)
- Object cu `tier: 'INSUFFICIENT'` = vitality completed partial (< 4/6)
- Object cu `tier: HIGH/MED/LOW` = vitality completed, signal active

**Why nullable instead of always-object:** ADR 011 §schema extension precedent (autoAggression + rest_marked nullable). Backward compat trivial. Pre-vitality-extension entries = null forever.

**responsesAge_days field** = freshness indicator. Engine poate decide să prompt user "vitality data 90 zile vechi, refresh?" dacă age > threshold.

**Storage 3: Schema migration (per ADR 018 §4 Migration Runner)**

CDL v_X → v_Y migration trivial: existing entries `context.vitality = null` la migration. Implementation `src/migrations/v_X-to-v_Y.js`:

```js
export const migration = {
  fromVersion: X,
  toVersion: Y,
  description: 'Add context.vitality nullable field',
  storageKeys: ['coach-decisions', 'coach-decisions-aggregate'],
  migrate(entry) {
    return {
      ...entry,
      schemaVersion: Y,
      context: { ...entry.context, vitality: null }
    };
  }
};
```

**Registry placement (per dataRegistry.js conventions):**
- `vitality-responses` în `USER_DATA_KEYS` (NU TEST_RESIDUE_KEYS)
- `SYNC_KEYS` în firebase.js
- **NU în PRESERVE_ON_RESET_KEYS** — wipe la fullReset (rerun vitality = fresh history coerent, analog ADR 014 §6 profile-history)

### DP-5: Storage location — separate key vs CDL context-only

Vezi secțiunea finală.

### Implementation notes

- Read/write helpers în `src/util/vitalityStorage.js`. Single source of truth.
- `vitality.js` dimension consume only via opts parameter (pure function per ADR 018 §2).
- CDL context snapshot populated în `coachDirector.buildSession()` build-context phase, by reading latest non-stale entry din `vitality-responses` history.

---

## 6. Plugin architecture — implementation ca dimensiune ADR 018

### Context

ADR 018 acceptat 2026-04-27 cu 5 componente. Vitality Layer = primul greenfield dimension, build directly pe foundation. Skip legacy path entirely (NU "implement în coachDirector apoi migrate").

### Decision

**Vitality dimension implementată end-to-end ca plugin per ADR 018 contract.**

**Registry entry (`src/engine/dimensionRegistry.js`):**

```js
import * as vitality from './dimensions/vitality.js';

export const DIMENSIONS = [
  // ... existing entries
  {
    id: 'VITALITY',
    module: vitality,
    stage: 'ADJUSTMENT',           // multiplier compose, NU short-circuit
    priority: 65,                  // mid-priority: above weakGroups (70?), below AA HIGH (95)
    enabledFlag: 'vitality_layer_v1',
    requiresCalibration: 'PERSONALIZING',
    schemaVersion: 1
  }
];
```

**Module signature (`src/engine/dimensions/vitality.js`):**

```js
export function analyze(input) {
  const { ctx, userProfile, flags } = input;
  const vitalityData = ctx.vitality;  // populated from latest vitality-responses entry

  if (!vitalityData || vitalityData.tier === 'INSUFFICIENT') {
    return {
      id: 'VITALITY',
      tier: 'none',
      confidence: 'low',
      signals: [],
      recommendations: [],
      trace: { reason: 'no_data_or_insufficient' },
      meta: {}
    };
  }

  const recommendations = [];
  const signals = [...vitalityData.flags];

  // LOW tier — recommend deload + AA threshold tighten
  if (vitalityData.tier === 'LOW') {
    recommendations.push({
      action: 'reduce_volume',
      priority: 65,
      payload: { multiplier: 0.85 },
      rationale: 'Vitality LOW — reduce volume 15% pentru recovery'
    });
    recommendations.push({
      action: 'calibrate_aa_threshold',
      priority: 65,
      payload: { tighten: true },
      rationale: 'Vitality LOW — AA threshold mai sensibil'
    });
  }

  // burnout_risk flag — escalate to GATE-equivalent
  if (signals.includes('burnout_risk')) {
    recommendations.push({
      action: 'inject_warning',
      priority: 90,
      payload: {
        message: 'Vitality critică detectată — consideră o pauză sau consult medical',
        severity: 'high'
      },
      rationale: 'Vitality composite < 1.5 sau ≥3 flags individuale'
    });
  }

  return {
    id: 'VITALITY',
    tier: vitalityData.tier,
    confidence: vitalityData.tier === 'INSUFFICIENT' ? 'low' : 'high',
    signals,
    recommendations,
    trace: { composite: vitalityData.composite, responsesAge_days: vitalityData.responsesAge_days },
    meta: { responses: vitalityData.responses }
  };
}
```

**Stage assignment rationale (per ADR 018 §3 Decision Cluster):**
- `stage: 'ADJUSTMENT'` — Vitality recommendations sunt cumulative (volume multiplier compose multiplicativ), NU short-circuit gates.
- Excepție: `burnout_risk` flag produce recommendation cu `priority: 90` aproape de GATE level. Decision Cluster Stage 2 ADJUSTMENT permite high-priority recommendations din ADJUSTMENT-stage dimensions, NU promote la GATE (anti-pattern). User cu burnout_risk primește warning vizibil + recommend pauză, NU forced rest day. Trust user (ADR 014 §5 pattern).

**Priority 65 rationale:**
- AA HIGH GATE = 95 (gate, separate stage)
- AA MED ADJUSTMENT = 75
- Weak group priority = 70
- Vitality LOW = 65
- Cut conservative = 55

Within ADJUSTMENT stage, AA MED + Vitality LOW + Cut conservative compose multiplicativ. Volume = base × 0.7 × 0.85 × 0.95 = 0.565. Per ADR 018 §3 stage compose semantics.

### Implementation notes

- Vitality dimension `analyze()` e total function (ADR 018 §2): always returns `DimensionResult`, never throws. Missing data = `tier: 'none'`, `confidence: 'low'`, empty arrays.
- `analyze()` e **sync** în v1 — no I/O. Per ADR 018 DP-2, sync wraps trivial via `Promise.resolve()` în Cluster.
- `requiresCalibration: 'PERSONALIZING'` field în registry filtered de helper `getActiveDimensions(ctx)` per ADR 018 §1. T0/T1 user → vitality dimension skipped entirely (zero cost).

---

## 7. Feature flag rollout — `vitality_layer_v1`

### Context

ADR 018 §5 Feature Flags Infrastructure cu per-user hash bucketing. Vitality Layer = primul greenfield dimension folosind acest mechanism (AA detection legacy a aterizat la rollout 1.0, vezi ADR 018 §migration).

### Decision

**Conservative rollout: 0% → 10% → 50% → 100% cu metric watch între faze.**

**Flag definition (per ADR 018 §5 `src/util/featureFlags.js`):**

```js
export const FLAGS = {
  // ...
  vitality_layer_v1: { rollout: 0.00, default: false }
};
```

**Rollout phases:**

| Phase | rollout | Duration | Metric watch | Promotion criteria |
|---|---|---|---|---|
| Phase 0 — Build | 0.00 | Sprint 1-2 implementation | N/A | Code merged, tests pass |
| Phase 1 — Daniel + 1 alpha | 0.10 | 2-4 săpt | Completion rate, engagement, AA threshold drift | ≥80% completion la T2 prompt, NO regression AA detection |
| Phase 2 — 50% production | 0.50 | 4-6 săpt | Same metrics + Sentry errors + composite distribution | Composite distribution sane (NU all-LOW sau all-HIGH skew), error rate < 1% |
| Phase 3 — 100% production | 1.00 | Permanent post-validation | Long-term: vitality tier evolution, profile typing reconciliation correlation | N/A (final state) |

**Rollback path:**
- Flag false → vitality dimension skipped în registry filtering. Zero impact pe pipeline. Other dimensions unchanged.
- CDL context.vitality entries deja scrise = preserved (null pentru entries pre-vitality, populated pentru entries pendant vitality activ). Aggregation engines handle null per ADR 011 nullable patterns.

### DP-6: Rollout pacing — aggressive vs conservative

Vezi secțiunea finală.

### Implementation notes

- Flag changes (rollout %) = cod change (export const). Daniel decision per phase, NU runtime config.
- Local override pentru dev: `localStorage._devFlags = '{"vitality_layer_v1": true}'` per ADR 018 §5.
- Phase 1 → Phase 2 promotion gate: Daniel manual review CDL context.vitality entries pentru sanity check. Composite distribution histogram + flag frequency table.

---

## 8. Cross-references cu alte ADR-uri

### ADR 018 — Engine Extensibility Architecture

Vitality Layer = primul greenfield dimension build pe ADR 018 foundation:
- Componenta 1 (Dimension Registry) — entry `VITALITY` adăugat
- Componenta 2 (Standardized Contract) — `analyze(input) → DimensionResult` implementat
- Componenta 3 (Decision Cluster) — Stage 2 ADJUSTMENT integration
- Componenta 4 (Schema Versioning) — CDL context.vitality nullable extension + migration runner v_X→v_Y
- Componenta 5 (Feature Flags) — `vitality_layer_v1` flag

### ADR 014 — Onboarding Profile Typing

- Storage pattern (separate localStorage key) reused: `vitality-responses` analog `profile-history`
- Wording const exports pattern reused: `vitalityCopy.js` analog `onboarding/copy.js`
- Reconciliation flow pattern partially reused: re-prompt frequency cap (8 săpt minimum)
- **NU shared:** Profile Typing tier reconciliation (mismatch self-report vs behavioral). Vitality v1 = self-report only.

### ADR 013 — Auto-Aggression Detection

- Cross-reference în Decision Cluster: AA threshold calibrate per `(profileTyping.tier, vitality.tier)` matrix
- Vitality LOW + Profile Typing Sprinter = pragul AA HIGH scade
- Implementation: helper `resolveAACalibration(profileResult, vitalityResult, ctx)` în Decision Cluster

### ADR 011 — Coach Decision Log

- CDL context schema extension cu `context.vitality` nullable (precedent: autoAggression + rest_marked nullable extensions)
- Schema migration via ADR 018 Migration Runner

### ADR 009 — Calibration Tiers

- Vitality activates at T2 (PERSONALIZING). T0/T1 skip per Memory rule #25 + Daniel articulation.

---

## Consequences

### Positive

- **State-of-being signal disponibil pentru engine** fără bloodwork (Gigel filter pass).
- **AA detection calibrare cross-dimensional** — Sprinter vulnerable vs Sprinter robust differentiated.
- **Cold-start bridge pentru T2+ users** — Vitality compensa lipsa bloodwork în personalizare aproximativă.
- **Plugin architecture proven** — Vitality = first greenfield ADR 018 dimension, valida foundation patterns.
- **Self-selection = feature** — high-engagement T2+ users = high-quality signal source.
- **Friction zero opt-in preserved** — skip = engine baseline, NU degraded mode.

### Negative

- **6 questions = ~60-90 sec friction la T2 prompt.** Acceptable pentru opt-in semantic, dar non-zero.
- **Self-report bias risk.** Cum răspunde user "obosit" depinde de mood la prompt time. Mitigation: re-prompt anual + history tracking arată evoluție.
- **Cross-reference logic în Decision Cluster** = complexity surface. Trebuie tested cu mock vitality + profile combinations.
- **Schema migration cost** — CDL v_X→v_Y migration pentru context.vitality. Trivial dar non-zero (eager runner ADR 018).
- **Romanian wording empirically untested.** Q1-Q6 v1 strategic, iteration post user-test (analog ADR 014 reconsideration trigger #1).

### Risks

- **Composite formula simple mean over-simplification.** Sleep × 1.5 weight (recovery primacy) might be empirically better. Mitigation: reconsiderate trigger #1 dacă signal weak.
- **Burnout_risk flag false positive.** User cu mood pasager poor → flag → engine sugerează medical consult → user friction. Mitigation: phrasing empathic + threshold conservative + trust user (override always available).
- **Self-selection bias în signal interpretation.** T2+ users care complete Vitality = self-selected high-engagement. Generalization la full population uncertain. Mitigation: scale-aware interpretation, NU treat ca random sample.
- **Profile Typing + Vitality double-counting.** Q4 motivation ≈ Sprinter intensity craving. Risk: same signal weighted twice în engine. Mitigation: cluster cross-reference logic explicit (Profile Typing primary, Vitality refines threshold, NU additive).
- **Vitality stale data.** User T2 completed → 6 luni later still T2 → vitality data 6 luni vechi. Mitigation: `responsesAge_days` field + auto re-prompt la age > threshold (proposed 90 zile, reconsiderate post-data).

---

## Reconsideration Triggers

1. **Composite formula signal weak post 50+ users.** Dacă vitality tier doesn't correlate cu observable outcomes (AA detection accuracy, recovery time post-deload), redesign formula (weighted sum, ML classifier, drop redundant questions).
2. **Completion rate < 30% T2+ users.** Vitality friction prea mare sau opt-in semantic broken. Redesign delivery (background prompt vs explicit modal?) sau reduce questions (6 → 4).
3. **Burnout_risk false positive rate > 20%.** Threshold composite < 1.5 prea conservator sau prompt phrasing creează panic. Recalibrate threshold + revise wording (empathic vs alarmist).
4. **Profile Typing reconciliation conflicts.** Dacă vitality LOW correlates strong cu Sprinter behavioral inference, suggested separate signal redundant. Reconsiderate independent dimensions vs merge.
5. **Vitality stale > 50% users.** `responsesAge_days > 180` pe majoritate. Re-prompt frequency increase sau in-session check-in (sub-question pre-session).
6. **Behavioral inference Vitality v2 candidate.** Post 100+ users, behavioral signals (sleep tracking integration, RPE patterns) might enable Vitality inference fără self-report — analog Profile Typing behavioral inference (ADR 014). Reconsiderate v1 self-report-only.
7. **Cross-dimension dependency formal declaration.** Per ADR 018 reconsideration trigger #5, dacă Vitality + Profile Typing + AA cross-references devin frequently coupled, contract evolution (DimensionResult v2 cu declared dependencies) needed.

---

## Implementation Notes

**Scope ADR:** principle + 8 componente + plugin architecture aliniat ADR 018 + cross-refs. **NU spec implementabil.**

**Dependencies critical:**

- ADR 018 (Engine Extensibility) — **ACCEPTED 2026-04-27**, foundation built or being built
- ADR 014 (Profile Typing) — wording + storage pattern reused
- ADR 011 (CDL) — context schema extension precedent
- ADR 013 (AA detection) — cross-reference în Decision Cluster
- ADR 009 (Calibration tiers) — T2+ gating

**Ordine recomandată implementation:**

1. ADR 016 sign-off Daniel (DP-1...DP-6 rezolvate)
2. ADR 018 foundation Sprint complete (Registry + Contract + Cluster + Versioning + Flags built)
3. Spec EXEC_QUEUE Vitality dimension — `src/engine/dimensions/vitality.js` + `analyze()` + tests (pure function tests independent de UI)
4. Spec EXEC_QUEUE Vitality storage layer — `vitality-responses` localStorage + helpers + dataRegistry.js entry + SYNC_KEYS extension
5. Spec EXEC_QUEUE Vitality UI prompt — Q1-Q6 layout mobile-first + skip semantics + completion handler
6. Spec EXEC_QUEUE CDL context.vitality migration — `src/migrations/v_X-to-v_Y.js` + tests
7. Spec EXEC_QUEUE Decision Cluster cross-reference helper — `resolveAACalibration` + tests
8. Phase 1 rollout 10% → 2-4 săpt metric watch → Phase 2 50% → Phase 3 100%
9. Q1-Q6 wording iteration post user-test feedback (hot-swap consts în `vitalityCopy.js`)

**Wording user-test:** 3-5 useri non-developers, structured interview, output în vault `02-audit/VITALITY_USER_TEST_2026-XX.md`. Paralelizat cu spec writing.

---

## Decision Points — Daniel Sign-Off Required

6 decision points marcate. Toate au trade-off real cu > 1 opțiune viable. Decisions cosmetic (working title, storage key naming, flag naming) decise în-line.

### DP-1: Delivery moment — onboarding append vs in-session prompt vs background prompt

**Options:**
- **A:** Append la onboarding (Q6-Q11 după ADR 014 Q1-Q5)
  - Pros: single completion event, signal disponibil de la T2 instant
  - Cons: onboarding overload (11 questions total) → drop-off risc pre-Q6, ADR 014 wording iteration interference
- **B:** In-session prompt (la prima sesiune T2, înainte de session build)
  - Pros: contextual ("vrem să te cunoaștem mai bine"), trigger natural
  - Cons: blochează session start, friction la momentul în care user e gata să antreneze
- **C:** Background prompt — banner persistent pe coach UI ("Completează Vitality (60s)") cu dismiss option, trigger T2 onset
  - Pros: friction zero, user complete când are timp, reminder vizibil dar non-blocking
  - Cons: completion rate posibil mai mic (no forcing function), banner clutter

**Recommendation:** C — background prompt cu dismiss. Match opt-in friction-zero semantic. Engagement signal valid (high-engagement T2+ users = self-selected). T2 trigger natural — user a demonstrat 28 zile + 12 sesiuni, are trust earned pentru "we want to know you better".

**Need Daniel sign-off:** YES

---

### DP-2: Response format — Likert numeric (1-4) vs categorical labels per question

**Options:**
- **A:** Numeric Likert 4-point ordinal (a/b/c/d cu mapping 4→1)
  - Pros: aggregable matematic (composite, mean, weighted), easy v2 evolution la 5-point sau 7-point, single algorithm
  - Cons: ordinal numeric mascat în UI (user nu vede 1-4, vede labels), dar mapping invisible la user
- **B:** Categorical labels per question (ex: Q1 returnează `'energetic' | 'normal' | 'tired' | 'depleted'`)
  - Pros: explicit semantic, no math, easier audit
  - Cons: aggregare imposibilă fără manual encode-decode (eventually mapped la numeric pentru composite), pleonasm

**Recommendation:** A — Numeric Likert. UI vede labels, engine vede numeric. Composite math trivial, weighted formula future-proof, edge cases (partial completion) explicit handle. Categorical labels = semantic theatre (eventually decoded numeric oricum).

**Need Daniel sign-off:** YES

---

### DP-3: Coupling Vitality ↔ Profile Typing — independent dimensions vs cross-feed

**Options:**
- **A:** Independent dimensions, cross-reference DOAR în Decision Cluster (ambii output `DimensionResult` separat, cluster combină)
  - Pros: clean ADR 018 contract, testabil isolate, debugging clear (single source of truth per dimension)
  - Cons: cross-effect implicit în cluster logic, NU explicit la dimension level
- **B:** Cross-feed direct — Vitality dimension citește Profile Typing result, refines own analysis
  - Pros: explicit dependency, single dimension reasoning over multiple inputs
  - Cons: violates ADR 018 §2 contract guarantees (pure function, deterministic, total) — `analyze()` ar deveni stateful pe registry order. Coupling implicit hard to debug. Cross-dimension dependency necesită contract evolution per ADR 018 reconsideration trigger #5.

**Recommendation:** A — Independent dimensions. Match ADR 018 contract pure function. Cluster cross-reference helper `resolveAACalibration(profileResult, vitalityResult, ctx)` = explicit, testabil. Future evolution (declared dependencies în contract v2) deferred până la trigger.

**Need Daniel sign-off:** YES

---

### DP-4: Tier gating threshold — T1 (INITIAL) vs T2 (PERSONALIZING) vs T3 (PERSONALIZED)

**Options:**
- **A:** T1 INITIAL (7 zile + 3 sesiuni) — early signal
  - Pros: vitality data disponibil înainte de PERSONALIZING engines (weak group, stagnation, prediction) activare. Better cold-start bridge.
  - Cons: prematur — user 1-2 săpt poate raporta "obosit" din cauza adapter-uirii la program nou (NU baseline real). Signal noisy. Plus onboarding overload (Q1-Q5 ADR 014 + Q1-Q6 vitality back-to-back).
- **B:** T2 PERSONALIZING (28 zile + 12 sesiuni) — Memory rule #25 + Daniel articulation
  - Pros: clean baseline, user adapter-uit, trust earned, opt-in friction-zero semantic preserved. Self-selection feature.
  - Cons: T0/T1 users fără signal vitality (engine cu defaults demographic).
- **C:** T3 PERSONALIZED (90 zile + 40 sesiuni) — rigid signal
  - Pros: maximum signal quality, user demonstrably committed
  - Cons: T2 users (28-90 zile) lipsiți de signal pe segment important; AA detection (active T2+) calibrate fără vitality input pe 60+ zile.

**Recommendation:** B — T2 PERSONALIZING. Match Memory rule #25 + Daniel articulation. Clean baseline + opt-in semantic. T0/T1 acceptabil din demographic. Self-selection feature = high-engagement signal.

**Need Daniel sign-off:** YES

---

### DP-5: Storage location — separate `vitality-responses` key + CDL context snapshot vs CDL context-only

**Options:**
- **A:** Dual storage — separate `vitality-responses` localStorage key (pattern ADR 014 §6) + CDL `context.vitality` nullable snapshot (pattern ADR 011 schema extension)
  - Pros: separation of concerns (history în propriul key, snapshot în CDL pentru per-decision context). Read pattern "vitality at time of session X" available via CDL.
  - Cons: dual write (vitality complete → write `vitality-responses` + invalidate CDL context cache), schema migration v_X→v_Y pentru CDL.
- **B:** CDL context-only — vitality responses stocate ca extension CDL `context.vitality` direct, NO separate key
  - Pros: single source of truth, no migration cost
  - Cons: violates ADR 011 §principle "CDL = session-level decisions" (vitality e session-orthogonal). History query "all vitality entries" inefficient (scan CDL). Pattern misalignment cu ADR 014 (profile-history separate key).

**Recommendation:** A — Dual storage. Match ADR 014 storage pattern + ADR 011 schema extension precedent. History query trivial (read `vitality-responses`). Per-session context available (read CDL.context.vitality). Migration cost = single v_X→v_Y trivial migration per ADR 018 Migration Runner.

**Need Daniel sign-off:** YES

---

### DP-6: Rollout pacing — aggressive (0%→100% în 2 săpt) vs conservative (0%→10%→50%→100% în 8-12 săpt)

**Options:**
- **A:** Aggressive — 0% → 10% (Daniel test) → 100% în 2 săpt
  - Pros: feature live fast, rapid iteration
  - Cons: skip metric watch intermediar, surprise patterns (composite distribution skew, completion rate low) afectează 100% users înainte detection
- **B:** Conservative — 0% → 10% (4 săpt) → 50% (4 săpt) → 100% per ADR 018 §5 standard pacing
  - Pros: metric watch per phase, rollback path real, surprise patterns caught early
  - Cons: feature live slower, momentum cost

**Recommendation:** B — Conservative. ADR 018 Feature Flags built specifically pentru gradual rollout. Vitality e primul greenfield dimension — caz tip pentru pacing standard. Phase 1 → Phase 2 gate: composite distribution sanity + completion rate ≥30%. Anti-momentum cost acceptable: vitality NU e blocker pentru beta launch (engine functional fără).

**Need Daniel sign-off:** YES

---

## Sign-Off — 2026-04-27

Daniel approved 6/6 decision points după review post-Opus draft.

- DP-1 Delivery moment: C — background prompt cu dismiss APPROVED
- DP-2 Response format: A — Numeric Likert 4-point APPROVED
- DP-3 Coupling Vitality ↔ Profile Typing: A — Independent dimensions APPROVED
- DP-4 Tier gating: B — T2 PERSONALIZING APPROVED
- DP-5 Storage: A — Dual storage (vitality-responses key + CDL context snapshot) APPROVED
- DP-6 Rollout pacing: B — Conservative (0%→10%→50%→100%) APPROVED

**Reconsider trigger DP-6:** completion rate threshold ≥30% Phase 1 = arbitrar starting point. Recalibrate după Phase 1 data reală (poate 60-80% real dacă T2 self-selected).

*ADR 016 — Accepted 2026-04-27*
