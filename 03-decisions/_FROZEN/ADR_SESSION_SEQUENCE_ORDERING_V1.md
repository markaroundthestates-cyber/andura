---
title: ADR SESSION_SEQUENCE_ORDERING V1 — Engine Session Exercise Ordering Logic (Goal Templates + Persona Driven, Isolation-First Hypertrofie Default Compound-First Forța Override, Maria Conservative Warm-up Extended)
status: locked-v1
locked_date: 2026-05-13k
authors: Daniel CEO + Co-CTO autonomous chat ACASĂ 2026-05-13k
related_adrs:
  - ADR_ANATOMICAL_CLASSIFICATION_V1.md (LOCK V1 11 categorii canonical muscle_target_primary)
  - ADR-024 Goal-Driven Program Templates (5 templates LOCKED + RIR matrix persona-aware)
  - ADR-026 Offline Coaching Tree (Engine pipeline §42.10 8 engines + Coach Director orchestrator)
  - ADR-029 Engine Specialization (PARALLEL modifier weakness detection downstream)
  - ADR-032 Engine Deload Protocol (Engine 2 deload variant session config)
  - ADR-027 Engine Energy Adjustment (±15% session-level adaptive intensity)
  - ADR-028 Engine Tempo Form Cues (persona-aware notation Maria verbal/Gigica hibrid/Marius numeric)
  - ADR-031 Engine Warm-up Mobility (persona-aware thresholds + Instant Skip T0)
mandatory_pre_beta: true
scope_change_estimate: ~30-50 NEW tests session_sequence_priority schema field + sequence logic engine-side (C5 implementation separate)
supersedes: NONE (NEW ADR V1, first version session sequence ordering)
superseded_by: NONE (LOCK V1 active)
amendments: []
---

# ADR SESSION_SEQUENCE_ORDERING V1 — Engine Session Exercise Ordering Logic

## §1 Context

**Pre-2026-05-13k state engine pipeline §42.10:** Andura engine pipeline 8 engines orchestrated per ADR-026 §9 (Periodization → Goal Adaptation → Energy Adjustment → Bayesian Nutrition → Tempo Form Cues → Specialization → Warm-up Mobility → Deload Protocol). Coach Director orchestrator `buildSession()` dispatch engines secvențial pure-function discipline preserved invariant. **DAR niciunul engine codify explicit session exercise ordering** post 8 engines dispatch — output exerciții listă fără `session_sequence_priority` field deterministic. UI rendering default = insertion order or arbitrary order per implementation accident.

**Gap surfaced chat ACASĂ 2026-05-13k Daniel CEO question verbatim:**

> "in ziua de piept nu e mai bine sa incepi cu peck deck decat cu bench?"

Followed clarification directive:

> "si andura... care nu e destinata powerlifterilor... ce recomanda? ca general public vrea hypertrofie :)"

Final directive Daniel CEO:

> "make it happen ca e core function. Si la fese la fel. Daca ai ceva sa ma intrebi please do, scurt si simplu cat sa inteleg (si sa nu fie cto decision side)"

**Industry context (research-based synthesis):**

- **Powerlifter standard:** Compound-first pattern (heavy multi-joint primary, isolation accessory). Greg Nuckols + Eric Helms strength school. Heavy compound exercises require fresh nervous system + maximum motor unit recruitment for 1RM neural overload.
- **Hypertrofie school general public:** Pre-exhaustion / isolation-first pattern valid + supported by Mike Israetel (Renaissance Periodization) + Jeff Nippard + Bret Contreras (Glute Lab) + Eric Helms hypertrophy contexts. Pre-exhaustion activates target muscle isolation FIRST → compound exercise reached, target muscle already primed (neural + blood flow) + tricep/grip NOT limiting factor + mind-muscle connection improved. Many bodybuilders pro use pre-exhaustion.
- **Trade-off:** 1RM compound load lower with pre-exhaustion (target muscle locally fatigued). For hypertrofie obiectiv = volume + time-under-tension > 1RM neural overload. Acceptable trade-off.

**Andura paradigm decision:**

Andura primary gym-focused (NU powerlifter destination per Daniel CEO directive 2026-05-13f Andura primary gym-focused paradigm LOCK V1). General public hypertrofie default Goal Template breakdown:

| Goal Template | RIR | Obiectiv |
|---|---|---|
| Forță | 1-3 | Strength / powerlifter override |
| Tonifiere | 0-2 | Hypertrofie/recompoziție |
| Slăbire | 1-2 | Hypertrofie/recompoziție + caloric deficit |
| Longevitate | 2-3 | Hibrid sustainable/safer |
| Sănătate Generală | 2-3 | Hibrid sustainable/safer |

**4/5 templates hypertrofie/recompozitie focus. ONLY 1/5 = Forță strength override.** Andura general public hypertrofie default = isolation-first / pre-exhaustion pattern.

**Gigel-test correction Daniel CEO 2026-05-13j verbatim preserved invariant:**

> "gigel nu o sa gaseasca nici o data exercitiile. Sunt invizibile pt utilizator... doar andura le stie"

Sequence ordering = **engine decides INVISIBLE UX** (NU toggle user-visible). Schema field `session_sequence_priority` INTERNAL engine routing semantic NU UX category navigation. User vede exercițiile în ordine final UI screen — engine final order decided.

**Bugatti FULL QUALITY no EXCUSES directive Daniel CEO 2026-05-13j LOCK reinforced:** Full algorithm 5-step peak craft, NU compromise tactical interim "Refactor later NEVER happens".

**Catalysator chat-current 2026-05-13k:** strategic discussion cluster 'fese' canonical + session sequence ordering = core function Andura — execute autonomous tactical NU strategic CTO discussion side.

## §2 Decision LOCK V1

**Session sequence ordering algorithm V1 deterministic engine-side 5-step:**

### §2.1 Step 1 — Goal Template determining default pattern

| Goal Template | RIR Range | Sequence Pattern |
|---|---|---|
| **Forță** | 1-3 | **Compound-first** (powerlifter standard) — Tier 1 compound force_demand 'high' primary FIRST, Tier 2 isolation accessory AFTER |
| **Tonifiere** | 0-2 | **Isolation-first / pre-exhaustion** (hypertrofie default) — Tier 2 isolation warm-up activation 1-2 sets FIRST, Tier 1 compound principal SECOND, Tier 2/3 finisher LAST |
| **Slăbire** | 1-2 | **Isolation-first / pre-exhaustion** (hypertrofie default same Tonifiere) — same pattern |
| **Longevitate** | 2-3 | **Hybrid / safer pattern** — Tier 1 compound MIDDLE (post warm-up activation Tier 2 light 1 set), Tier 2 isolation BEFORE + AFTER compound (sandwich) |
| **Sănătate Generală** | 2-3 | **Hybrid / safer pattern** (same Longevitate) — same sandwich pattern |

### §2.2 Step 2 — Persona modifier overrides

| Persona | Modifier |
|---|---|
| **Maria 65 (Dual-Layer functional)** | **Conservative warm-up extended** — ALWAYS Tier 2 isolation 2-3 light warm-up sets FIRST (priming joints + neural activation extended), Tier 1 compound IF in session post extensive warm-up, Tier 2/3 accessory finishing. Regardless Goal Template — Maria persona override = isolation-first/hybrid even pentru Forță Template (anti-injury elderly cohort) |
| **Gigica 35 (intermediate)** | **Goal Template default applied as specified** (no persona override) |
| **Marius 25 (advanced)** | **Goal Template applied + Strength block phase override:** if Periodization phase ∈ {`CUT`, `STRENGTH`, `INTENSIFICATION`} → compound-first override regardless Goal Template (overload neural fresh) |

### §2.3 Step 3 — Specialization Engine PARALLEL modifier overlay

Per ADR-029 Engine Specialization PARALLEL modifier (Marius Advanced gate strict): if weakness detected per muscle group + Specialization PARALLEL active → that weak muscle group exercise **PRIORITY BUMP to position 1** in sequence (regardless ordering pattern Step 1+2). Anti-recurrence pattern: weak muscle group fresh nervous system fatigue minimization.

### §2.4 Step 4 — Warm-up Engine prepend

Per ADR-031 Engine Warm-up Mobility persona-aware thresholds: Maria/Gigica/Marius respective warm-up exercises **PREPENDED before Step 1 sequence start** (general warm-up + dynamic mobility specific muscle groups session). Instant Skip T0 default anti-Maria-friction preserved invariant.

### §2.5 Step 5 — Deload Engine override

Per ADR-032 Engine Deload Protocol: if `isDeload === true` session flag → sequence **reduced to Tier 2 isolation only** (skip Tier 1 compound entirely per deload week safety + intentional volume reduction protocol). Goal Template + persona modifier override-ed by deload flag.

### §2.6 Schema field NEW `session_sequence_priority`

In session output Coach Director `buildSession()`:

```js
{
  exercises: [
    {
      exercise_id: 'Pec Deck / Cable Fly',
      muscle_target_primary: 'piept',
      session_sequence_priority: 1,  // NEW field — integer 1-N within session ordering
      sets: 2,
      reps: '12-15',
      rir: 1,
      // ... existing fields preserved
    },
    {
      exercise_id: 'Flat Barbell Bench',
      muscle_target_primary: 'piept',
      session_sequence_priority: 2,
      sets: 4,
      reps: '6-10',
      rir: 2,
      // ...
    },
    {
      exercise_id: 'Cable Fly',
      muscle_target_primary: 'piept',
      session_sequence_priority: 3,  // finisher
      sets: 3,
      reps: '12-15',
      rir: 0,  // close to failure pump finisher
      // ...
    }
  ]
}
```

**INTERNAL engine routing semantic NU UX surface:** `session_sequence_priority` integer used by UI rendering pentru order in session screen list — Gigel vede exercițiile în ordine NU vede numeric priority value. Engine decides invisible.

## §3 Rationale per pattern

### §3.1 Isolation-first / pre-exhaustion (hypertrofie default Tonifiere + Slăbire)

Per Mike Israetel / Jeff Nippard / Bret Contreras synthesis: pre-exhaustion technique activates target muscle isolation FIRST → când compound exercise reached, target muscle already primed (neural + blood flow) + tricep/grip NOT limiting factor + mind-muscle connection improved. Trade-off: 1RM compound load lower (target muscle locally fatigued). For hypertrofie obiectiv = volume + time-under-tension > 1RM neural overload. Acceptable trade-off.

**Example chest day Tonifiere persona Gigica:**

| Priority | Exercise | Sets | Reps | RIR |
|---|---|---|---|---|
| 1 | Pec Deck / Cable Fly | 2 light warm-up activation | 12-15 | warm-up |
| 2 | Flat Barbell Bench | 4 working sets compound principal | 8-10 | 1 |
| 3 | Incline DB Press | 3 working sets second compound | 8-10 | 1 |
| 4 | Cable Fly | 3 sets pump finisher | 12-15 | 0 close failure |

### §3.2 Compound-first (Forța Template + Marius Strength block phase)

Per Mike Israetel / Eric Helms / Greg Nuckols synthesis: heavy multi-joint compound require fresh nervous system + maximum motor unit recruitment. Performing isolation FIRST fatigues stabilizers + primary movers locally → 1RM compound load reduced → strength gain compromised. For strength obiectiv = neural overload > volume. Pattern unambiguous powerlifter standard.

**Example chest day Forța persona Marius:**

| Priority | Exercise | Sets | Reps | RIR |
|---|---|---|---|---|
| 1 | Flat Barbell Bench | 5 working sets heavy | 1-3 | 1 |
| 2 | Incline DB Press | 4 working sets | 5-8 | 2 |
| 3 | Pec Deck / Cable Fly | 3 sets accessory | 10-12 | 2 |

### §3.3 Hybrid sandwich (Longevitate + Sănătate Generală)

Per Eric Helms / Mike Israetel safer-bias synthesis older/general health cohort: warm-up activation set + compound MIDDLE (post warm-up) + isolation finishing BEFORE total fatigue. Reduces injury risk vs pure pre-exhaustion (joint warm-up extended) AND vs pure compound-first (less aggressive overload). Balanced approach.

**Example chest day Longevitate persona Maria override:**

| Priority | Exercise | Sets | Reps | RIR |
|---|---|---|---|---|
| 1 | Pec Deck / Cable Fly | 3 LIGHT warm-up sets | 12-15 | warm-up |
| 2 | Cable Fly | 2 LIGHT warm-up sets | 12-15 | warm-up |
| 3 | Flat DB Press (NOT Barbell — Maria persona safer DB choice) | 3 working sets | 8-12 | 2-3 |
| 4 | Pec Deck | 3 working sets | 12-15 | 1-2 |

### §3.4 Deload override (any persona + any Goal Template)

Per ADR-032 Engine Deload Protocol: deload week MRV (Minimum Recoverable Volume) reduction safety. Tier 1 compound entire session SKIPPED — only Tier 2 isolation light volume preserve muscle memory + active recovery.

**Example chest day Deload week any persona:**

| Priority | Exercise | Sets | Reps | RIR |
|---|---|---|---|---|
| 1 | Pec Deck / Cable Fly | 2 light sets | 12-15 | 2-3 |
| 2 | Cable Fly | 2 light sets | 12-15 | 2-3 |

ZERO Tier 1 compound week — intentional volume reduction.

### §3.5 Specialization PARALLEL bump (Marius Advanced gate strict)

Per ADR-029: Marius Advanced 4-gate strict (12+ months training + 3+ months consistent + 16+ logged sessions + Weakness Detector identified weak muscle group). PARALLEL modifier active → weak muscle group exercise bumped to position 1 fresh.

**Example chest day Marius PARALLEL weak triceps detected:**

| Priority | Exercise | Sets | Reps | RIR | Note |
|---|---|---|---|---|---|
| 1 | Close-Grip Bench Press | 4 sets | 6-8 | 1 | weak triceps PRIORITY BUMP fresh |
| 2 | Flat Barbell Bench | 4 sets | 6-10 | 1 | chest compound principal post-priority |
| 3 | Incline DB Press | 3 sets | 8-10 | 2 | accessory |
| 4 | Cable Fly | 3 sets | 12-15 | 1 | finisher |

## §4 Anti-decisions explicit

### §4.1 NU toggle UX user-visible "Compound-first / Isolation-first / Hybrid"

- **Gigel-test failure:** user NU înțelege termeni "pre-exhaustion vs compound-first" — engine decides invisible per Daniel CEO directive 2026-05-13j verbatim *"gigel nu o sa gaseasca nici o data exercitiile. Sunt invizibile pt utilizator... doar andura le stie"*.
- **Scope creep + paternalism invers:** give user choice când engine știe mai bine = abandons differentiation Andura coach intelligence (Andura coach = decide automat optimal per user, NU magazin de exerciții cu filter UI).
- **Anti-RE rule LOCK V1 PERMANENT preserved** per ADR-023 LLM intent SUPERSEDED.

### §4.2 NU NLP/LLM runtime decision (deterministic rules engine only)

- Per CLAUDE.md §0 + SUFLET ANDURA §1.1 + ADR-023 LLM intent SUPERSEDED.
- Engine pipeline §42.10 8 engines pure-function discipline preserved invariant per ADR-026 §9.
- Session sequence ordering = deterministic 5-step algorithm (Goal Template → Persona override → Specialization PARALLEL → Warm-up prepend → Deload override) — ALL signals from existing engines + schema fields.

### §4.3 NU user override mid-session reorder UI

- Per ADR-013 Auto-Aggression Detection + ADR-026 anti-paternalism balance: user CAN refuse / skip individual exercise (Bundle 4 LANDED refusal flow), dar NU reorder exercise position UI (engine decides invisible final order, user has refuse/skip mechanism existing).
- **Future v1.5 may add UI affordance "rearrange order"** — defer post-Beta backlog cu signal user agency expansion.

### §4.4 NU multi-session sequence prediction

- Per Engine Periodization mesocycle phase scope: session sequence ordering = SINGLE session scope. Multi-session phase orchestration = separate concern Engine Periodization + Goal Adaptation (Constraint Object phase-aware mesocycle).
- **Anti-scope creep:** session sequence V1 = per-session deterministic ordering, NU phase-aware long-term sequence rotation.

## §5 Engine impact mapping decision LOCK V1

**Per engine implementation impact (C5 separate commit):**

### §5.1 Coach Director Engine (`engine-coach-director`)

MODIFY `buildSession()` method — post 8 engines dispatch complete, NEW final step apply session sequence ordering algorithm 5-step + populate `session_sequence_priority` field per exercise în output. Pure-function discipline preserved invariant (algorithm = deterministic).

Pseudocode:

```js
function buildSession(context) {
  // existing 8 engines dispatch sequential preserved invariant
  const periodizationResult = periodizationEngine.run(context);
  const goalAdaptResult = goalAdaptationEngine.run(context, periodizationResult);
  // ... etc 8 engines

  // NEW final step C5: apply session sequence ordering
  const exercises = collectExercisesFromEngines(...);
  const orderedExercises = applySessionSequenceOrdering(exercises, {
    goalTemplate: goalAdaptResult.currentTemplate,
    persona: context.persona,
    phase: periodizationResult.currentPhase,
    weakMuscleGroup: specializationResult.weakMuscleGroup,
    isDeload: deloadResult.isDeload,
  });
  return { exercises: orderedExercises };
}

function applySessionSequenceOrdering(exercises, signals) {
  // Step 1: Goal Template default pattern selection
  let pattern = GOAL_TEMPLATE_PATTERN_MAP[signals.goalTemplate];
  // Step 2: Persona override
  if (signals.persona === 'Maria') pattern = 'isolation-first-conservative';
  if (signals.persona === 'Marius' && STRENGTH_PHASES.includes(signals.phase)) pattern = 'compound-first';
  // Step 5: Deload override (takes precedence over all)
  if (signals.isDeload) pattern = 'isolation-only';
  // Apply pattern → assign session_sequence_priority integers
  const orderedByPattern = sortByPattern(exercises, pattern);
  // Step 3: Specialization PARALLEL bump (post pattern apply)
  if (signals.weakMuscleGroup) {
    const weakIdx = orderedByPattern.findIndex(e => e.muscle_target_primary === signals.weakMuscleGroup);
    if (weakIdx > 0) {
      const [weakExercise] = orderedByPattern.splice(weakIdx, 1);
      orderedByPattern.unshift(weakExercise);
    }
  }
  // Step 4: Warm-up Mobility prepend handled by Warm-up Engine separately (pipeline §42.10 7th position)
  // Final assign session_sequence_priority 1-N
  return orderedByPattern.map((ex, i) => ({ ...ex, session_sequence_priority: i + 1 }));
}
```

### §5.2 Goal Adaptation Engine (`engine-goal-adaptation` ADR-024)

Signal input — `currentTemplate` ∈ {Forță, Tonifiere, Slăbire, Longevitate, Sănătate Generală} drives Step 1 default pattern. Existing signal preserved.

### §5.3 Periodization Engine (`engine-periodization` ADR-026 §9.1 pipeline §42.10 1st)

Signal input — current `phase` ∈ {NEUTRAL, ACCUMULATION, INTENSIFICATION, REALIZATION, DELOAD, CUT, BULK, MAINTAIN, RECOMP} drives Step 2 Marius persona Strength block override (phase ∈ {CUT, STRENGTH, INTENSIFICATION} → compound-first override).

### §5.4 Specialization Engine (`engine-specialization` ADR-029)

Signal input — `weakMuscleGroup` detected via Weakness Detector Brzycki 1RM Big 7 (per ADR_ANATOMICAL_CLASSIFICATION_V1 §5.3) → PARALLEL modifier drives Step 3 weak muscle group exercise PRIORITY BUMP to position 1.

### §5.5 Warm-up Mobility Engine (`engine-warmup-mobility` ADR-031)

Existing prepend behavior preserved + Step 4 explicit codified in algorithm (persona-aware warm-up exercises BEFORE Step 1 sequence start). Instant Skip T0 default preserved invariant.

### §5.6 Deload Protocol Engine (`engine-deload-protocol` ADR-032)

Signal input — `isDeload` boolean flag drives Step 5 override (Tier 2 isolation only, skip Tier 1 compound entire session).

### §5.7 Energy Adjustment Engine (`engine-energy-adjustment` ADR-027)

Orthogonal — ±15% session-level intensity adjusts working set load BUT NU touches sequence ordering. Preserved invariant.

### §5.8 Bayesian Nutrition Inference Engine (ADR-022)

Orthogonal — NU touches sequence ordering. Preserved invariant.

### §5.9 Tempo Form Cues Engine (`engine-tempo-form-cues` ADR-028)

Orthogonal — persona-aware notation Maria verbal/Gigica hibrid/Marius numeric applied PER exercise display NU touches sequence ordering. Preserved invariant.

## §6 Consequences

**Tests baseline impact estimate:**

- **C3 (acest commit) ADR creation** ZERO test impact (vault meta-tooling doc-only). Tests 3240 PASS preserved EXACT.
- **C5 implementation engine-side** (separate commit): ~30-50 NEW tests session_sequence_priority field schema validation + algorithm 5-step verification + persona override + Specialization PARALLEL bump + Deload override + edge cases empty session/single exercise/multi-muscle session.

**Cumulative goal post post C5: 3240 → ~3270-3290 PASS** (estimated +30-50 NEW tests).

**Pre-Beta progress impact:** scope library 600-700 ex MANDATORY PRE-BETA preserved invariant. Session sequence ordering V1 implementation C5 = engine-side logic only (NO library extension). C6 Bundle 6.0.4.3 Glutes + C7 cumulative `/wiki-ingest` complete strategic cluster 'fese' canonical + session sequence ordering.

**Wiki layer impact:** NEW concept page `99-archive/wiki-pre-2026-05-15/concepts/session-sequence-ordering-v1.md` distributed via `/wiki-ingest` C7 cumulative cluster (NU acest C3 commit) + UPDATE existing engine pages (engine-coach-director + engine-goal-adaptation + engine-specialization + engine-warmup-mobility + engine-deload-protocol frontmatter `amendments[]` APPEND 2026-05-13k C5 implementation reference).

## §7 Cross-refs raw layer

- [[03-decisions/ADR_ANATOMICAL_CLASSIFICATION_V1.md]] §2 11 categorii canonical V1 + §5 engine impact mapping Big 8
- [[03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v2.md]] §2.1 §2.2 cascade ordered list pattern 5 step types canonical (LOCK V2)
- [[03-decisions/024-goal-driven-program-templates.md]] §2 5 Goal Templates LOCKED V1 + Q1-Q8 LOCKED + Q6 D Hybrid 2026-05-06
- [[03-decisions/026-offline-coaching-decision-tree-exhaustive.md]] §9 pipeline §42.10 8 engines + Coach Director orchestrator + §9.1 Periodization 1st
- [[03-decisions/029-engine-specialization.md]] PARALLEL modifier Big N candidates + 4-gate strict Marius Advanced + weakness detector orfan reuse
- [[03-decisions/031-engine-warmup-mobility.md]] persona-aware thresholds + Instant Skip T0 default anti-Maria-friction
- [[03-decisions/032-engine-deload-protocol.md]] §pipeline 8th cross-engine deload week MRV invariant
- [[99-archive/wiki-pre-2026-05-15/entities/engines/engine-coach-director.md]] §Synthesis orchestrator central pipeline §42.10 (post C5 update amendments)
- [[99-archive/wiki-pre-2026-05-15/entities/engines/engine-periodization.md]] §Synthesis pipeline §42.10 1st position foundational (post C5 update amendments)
- [[src/engine/coachDirector.js]] CoachDirector class `buildSession()` (post C5 implementation target)

---

🦫 **ADR SESSION_SEQUENCE_ORDERING V1 LOCK V1 2026-05-13k.** Daniel CEO directive Bugatti FULL QUALITY no EXCUSES + *"make it happen ca e core function"* trust delegation MAXIMUM Co-CTO autonomous tactical. Session sequence ordering = core function Andura general public hypertrofie default isolation-first / Forța override compound-first / Maria conservative warm-up extended / Specialization PARALLEL bump / Warm-up prepend / Deload isolation-only. Engine decides invisible per Gigel-test correction schema field internal engine routing NU UX surface.
