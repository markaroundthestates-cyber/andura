---
title: ADR SMART_ROUTING_EQUIPMENT v2 — Cascade Ordered List Fallback + Sequence Reordering Pre-Fatigue
type: adr
status: draft-pending-daniel-review
draft_date: 2026-05-13e
draft_revision: rev2 (cascade ordered list pattern locked Daniel principle 2026-05-13e)
supersedes: 03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1.md LOCK V1 2026-05-02
author: Claude chat Co-CTO autonomous via metoda hibridă chat ↔ CC terminal LOCKED V1 §F3.13
implementation_deferred: Bundle 6+ chat NEW post-amendment LANDED Daniel review explicit
revision_history:
  - rev1 2026-05-13e initial draft (Pillar 1 bodyweight lookup + Pillar 2 light variant 1:1 mapping + Pillar 3 pre-fatigue rules — flat fields schema too simple)
  - rev2 2026-05-13e cascade ordered list pattern locked Daniel principle "Daca am tractiuni si nu pot -> helcometru. Daca nu am helcometru -> assisted pullup machine. Daca nu am -> variatie de exercitii fie 1 exercitiu sau 2, care sa acopere dezvoltarea musculara a grupei respective" — Pillar 1+2 unified în fallback_cascade[] ordered list per exercise NU flat fields
---

# ADR SMART_ROUTING_EQUIPMENT v2

## §0 Status & Authority

**DRAFT pending Daniel review explicit.** Per [[CLAUDE.md]] §0-§7 + [[VAULT_RULES.md]] §F3.1-§F3.13 + [[03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1.md]] LOCK V1 2026-05-02 supersede chain. Implementation deferred chat NEW Bundle 6+ post-amendment LANDED Daniel review explicit (NU implement în acest chat — strategic amendment artefact only).

## §1 Synthesis

ADR v2 = extend v1 Tier-aware filtering + similarity ranking cu **cascade ordered list per exercise additive** pentru alternative exhaustion completion + **sequence reordering pre-fatigue avoidance** pentru big lift compound protection.

Daniel verbatim Bundle 4 chat ACASĂ 2026-05-13e cascade exhaustion mechanism full description:

> *"User nu are Pec deck, App ii sugereaza cable fly, user nu are nici cable machine, App ii sugereaza bench incline fly, user nu are nici incline bench, app sugereaza flat bench fly, user nu are nici bench, app ii sugereaza fly pe jos, user nu are nici db, app ii sugereaza un exercitiu care suplineste muscle development pe grupa aia, user nu are nici aia, app ii sugereaza un bodyweight exercise, user pune ca nu poate, app ii sugereaza varianta light de exercitiu etc"*

Daniel verbatim Bundle 5 chat ACASĂ 2026-05-13e cascade ordered list principle LOCKED:

> *"ca idee eu vreau gen asa maparea... si sper sa nu o mai repet de 1000 ori. Daca am tractiuni si nu pot -> helcometru. Daca nu am helcometru -> assisted pullup machine. Daca nu am -> variatie de exercitii fie 1 exercitiu sau 2, care sa acopere dezvoltarea musculara a grupei respective."*

**Cascade ordered list pattern locked principle Daniel:** pre-defined ordered list per exercise în schema, engine traverses cascade până găsește step matching user equipment ownership + capability state real-time. Pattern aplicat universal toate exerciții V1 library (Co-CTO apply singur NU ask 60 times per "sper sa nu o mai repet de 1000 ori" Daniel LOCK).

**2 mecanisme NEW additive (ZERO engine module mutation per ADR 026 §9 invariant preserved):**

1. **Cascade ordered list per exercise** — `fallback_cascade[]` schema field unifying ex-Pillar 1 bodyweight + ex-Pillar 2 light variant + intermediate steps (similar_easier_machine + assisted_variant + muscle_group_compose 1-2 ex)
2. **Sequence reordering pre-fatigue avoidance** — silent reorder post-swap pentru big lift compound protection + fatigue minimization

**Anti-paternalism preserved invariant v1:** skip exercise propose alternative session structure rămâne final option dacă cascade epuizat (NU forțezi inferior outcome).

**Andura primary gym-focused paradigm LOCK Daniel verbatim 2026-05-13e:**

> *"Andura e primary gym focused... home focus e doar cand gymul e extrem de poor sau chiar nu se duce"*

Gym equipment (helcometru, smith machine, leg press, assisted machines, etc.) = standard expected pe prima treaptă cascade. Bar = standard expected. Home-only/poor-gym edge case = degrade graceful via Cont/Aparate lipsa existing mechanism Bundle 4 (engine skip cascade steps unavailable equipment, advance la next).

**Light variant semantic LOCK Daniel verbatim 2026-05-13e:**

> *"different-exercise-easier (push-up înlocuit cu kneeling push-up etc"*

Different-exercise-easier NU same-exercise-reduced (preserve identity exercise tracking accuracy CDL).

## §2 Schema Additions

### §2.1 Cascade Ordered List Per Exercise

NEW field în `src/schema/exerciseMetadata.js` (additive zero-breaking) per-exercise:

```js
fallback_cascade: [
  { type: 'easier_machine', exercise_id: 'lat_pulldown' },          // step 1: similar machine easier load
  { type: 'assisted_variant', exercise_id: 'assisted_pullup' },     // step 2: assisted variant same movement
  { type: 'muscle_group_compose', exercise_ids: ['db_row', 'face_pull'] }, // step 3: 1-2 ex muscle coverage
  { type: 'bodyweight', exercise_id: 'inverted_row_bar' },          // step 4: bodyweight (gym bar assumed)
  { type: 'light_variant', exercise_id: 'inverted_row_table_low' }, // step 5: different-exercise-easier
  // implicit step 6: skip exercise propose alternative session structure (anti-paternalism v1)
]
```

**Step types canonical (5 unified Pillars 1+2):**
- `easier_machine` — similar machine cu controlled weight / easier load (helcometru pt chin-up; Smith machine pt squat/bench/OHP; trap bar pt deadlift)
- `assisted_variant` — machine assisted (assisted pullup machine; assisted dip machine; band-assisted variants)
- `muscle_group_compose` — 1 sau 2 exerciții complementare care acoperă muscle group development (DB row + face pull pentru lats+rear delts; leg extension + leg curl pentru quad+ham). 1 ex when isolation-style coverage suffices; 2 ex when compound-coverage needed cross multi-muscle
- `bodyweight` — pure-pose bodyweight exercise (push-up; bodyweight squat; pike push-up; plank; inverted row pe bar)
- `light_variant` — different-exercise-easier per Daniel LOCK (kneeling push-up; wall push-up; box squat smaller ROM; assisted single-leg RDL)

**Per-exercise cascade depth varies** — Tier 1 heavy compound (chin-up, bench, squat, deadlift, OHP) usually 5 steps; Tier 2 isolation (lateral raise, curl, calf raise) usually 3-4 steps simpler (direct fallback cable/band/bodyweight + skip).

### §2.2 Mapping Co-CTO Draft Canonical (Apply Universal ~60 Exerciții V1 Library)

**Pull movement (chin-up reference Daniel exemplu Bundle 5):**

| Exercise | fallback_cascade |
|----------|------------------|
| Chin-up / Pull-up | helcometru (lat pulldown) → assisted pullup machine → DB row + face pull → inverted row bar → inverted row table low |
| Barbell Row | T-bar row → helcometru (lat pulldown) → DB row + face pull → inverted row bar → inverted row table low |
| Lat Pulldown (helcometru) | assisted pullup machine → seated cable row → DB row + face pull → inverted row bar → inverted row table low |
| Seated Cable Row | T-bar row → DB row + chest-supported row → DB row + face pull → inverted row bar → inverted row table low |

**Push horizontal (bench press reference):**

| Exercise | fallback_cascade |
|----------|------------------|
| Bench Press heavy | Smith machine bench → DB bench press → push-up + DB fly → push-up bodyweight → kneeling push-up |
| Incline Bench Press | Smith incline bench → DB incline press → DB shoulder press + push-up incline → pike push-up → wall push-up |
| DB Bench Press | Smith machine bench → push-up + DB fly → push-up bodyweight → kneeling push-up |
| Chest Fly (Pec Deck) | cable fly → DB fly bench → DB fly pe jos → push-up + DB fly → push-up bodyweight |

**Push vertical (OHP reference):**

| Exercise | fallback_cascade |
|----------|------------------|
| OHP / Military Press | Smith machine OHP → DB shoulder press seated → lateral raise + front raise → pike push-up → wall push-up |
| DB Shoulder Press | Smith machine OHP → lateral raise + front raise → pike push-up → wall push-up |
| Arnold Press | Smith machine OHP → DB shoulder press seated → lateral raise + front raise → pike push-up → wall push-up |

**Legs compound (squat / deadlift reference):**

| Exercise | fallback_cascade |
|----------|------------------|
| Squat heavy | Smith machine squat → leg press → leg extension + leg curl → bodyweight squat → box squat smaller ROM |
| Front Squat | Smith machine squat → goblet squat → leg press → bodyweight squat → box squat smaller ROM |
| Deadlift heavy | trap bar deadlift → rack pull partial ROM → Romanian DL + hyperextension → single-leg RDL bodyweight → assisted single-leg RDL |
| Romanian Deadlift | trap bar deadlift → DB Romanian DL → hamstring curl + hyperextension → single-leg RDL bodyweight → assisted single-leg RDL |
| Bulgarian Split Squat | reverse lunge → DB lunge → leg extension + leg curl → bodyweight Bulgarian → assisted Bulgarian (wall touch) |

**Isolation simpler cascade Tier 2-3 (lateral raise reference):**

| Exercise | fallback_cascade |
|----------|------------------|
| Lateral Raise | cable lateral raise → band lateral raise → pike push-up partial ROM (deltoid bias) → skip |
| Biceps Curl | cable curl → band curl → chin-up bar (compound substitute) → skip |
| Hammer Curl | cable hammer curl → band hammer curl → chin-up neutral grip → skip |
| Triceps Pushdown | overhead cable extension → DB overhead extension → diamond push-up → skip |
| Skullcrusher | overhead cable extension → DB overhead extension → diamond push-up → close-grip push-up → skip |
| Leg Extension | cable leg extension → bodyweight squat → assisted squat → skip |
| Leg Curl (Lying) | cable leg curl → glute bridge → single-leg RDL bodyweight → skip |
| Calf Raise | seated calf raise → bodyweight calf raise → wall-supported calf raise → skip |
| Face Pull | cable face pull → band face pull → reverse fly DB → skip |
| Rear Delt Fly | cable rear delt → band rear delt → DB rear delt fly chest-supported → skip |

**Core cascade:**

| Exercise | fallback_cascade |
|----------|------------------|
| Plank | dead bug → bird dog → knee plank → skip |
| Hanging Leg Raise | captain's chair leg raise → lying leg raise floor → dead bug → bird dog |
| Russian Twist DB | cable woodchop → band woodchop → bicycle crunch → bodyweight twist → skip |

**Apply pattern universal toate ~60 exerciții V1 library prin Bundle 6.1 implementation.** Co-CTO bias apply singur per principle Daniel LOCKED 2026-05-13e ("sper sa nu o mai repet de 1000 ori").

### §2.3 Pre-Fatigue Avoidance Pairs Table

NEW table `src/engine/smart-routing/preFatigueRules.js` (orchestrator-level reorder constraint):

| Isolation/Accessory | Avoid Before Heavy Compound |
|---------------------|----------------------------|
| Triceps isolation (skullcrusher, pushdown, dip) | Bench Press, OHP, Incline Bench |
| Biceps isolation (curl, hammer curl) | Chin-up, Row heavy (Barbell Row, T-bar Row) |
| Hamstring curl (lying, seated) | Squat heavy, Deadlift |
| Front delt isolation (front raise, plate raise) | OHP, Incline Bench |
| Calf raise excessive (>3 sets heavy) | Squat heavy |
| Lateral delt isolation (lateral raise excessive >3 sets) | OHP heavy |
| Forearm isolation (wrist curl, reverse curl) | Chin-up, Row heavy, Deadlift heavy |
| Quad isolation excessive (leg extension >3 sets heavy) | Squat heavy |

**Default tier behavior (Maria 65 + Gigica + Gigel):** hard block — orchestrator silent reorder isolation/accessory swap-uri to position post-compound.

**Marius advanced tier override:** intentional pre-fatigue allowed via existing engine-specialization PARALLEL modifier 4-gate strict (per [[wiki/entities/engines/engine-specialization]] §AMENDMENT BATCH 2 + ADR 029). Marius hypertrophy specialization patterns (e.g., front raise pre-OHP pentru rear-delt bias trick) preserved invariant.

## §3 Cascade Traversal Algorithm

Pseudo-code orchestrator-level (per swap event "Nu am" sau "Nu vreau" sau implicit "Nu pot" via refusal counter):

```
function resolveCascadeAlternative(exerciseId, refusalContext, userState):
  cascade = getExerciseFallbackCascade(exerciseId)  // §2.1
  
  // Graceful degradation per ADR 025: if no cascade defined, fallback to v1 findAlternatives()
  if cascade.empty:
    return findAlternativesV1ScoreBased(exerciseId, userState.equipment)
  
  for step in cascade:
    // Skip step if requires equipment user lacks (wv2-missing-equipment Tier 0 registry)
    if step.type in ['easier_machine', 'assisted_variant'] and not userHasEquipment(step.exercise_id, userState.equipment):
      continue
    
    if step.type === 'muscle_group_compose':
      // Filter exercises in compose array by user equipment ownership
      viableExercises = step.exercise_ids.filter(id => userHasEquipment(id, userState.equipment))
      if viableExercises.empty:
        continue  // none of compose exercises viable, advance to next step
      // Return at least 1 viable (1 of 2 OK per Daniel LOCK "fie 1 exercitiu sau 2")
      return { type: 'muscle_group_compose', exercise_ids: viableExercises }
    
    // Skip step if recently refused (wv2-refusal-counter Tier 0)
    if isRecentlyRefused(step.exercise_id, userState.refusalCounter):
      continue
    
    // Found viable step — return alternative
    return step  // { type, exercise_id }
  
  // Cascade exhausted — anti-paternalism skip final option (v1 preserved)
  return skipExerciseProposeAlternativeSessionStructure()
```

**Triggers source unified:**
- `Nu am` (permanent equipment lack) → adds equipment_id to `wv2-skipped-exercises` Tier 0 + traverse cascade skip equipment-dependent steps
- `Nu vreau` (ephemeral session refusal) → increment `wv2-refusal-counter` Tier 0 + traverse cascade skip refused step
- `Nu pot` (capability lack — implicit via "Nu vreau" repeated OR future explicit button) → traverse cascade easier_machine first prioritized natural ordering

**Origin-rooted cascade tracking preserved Bundle 4:** `data-origin-exercise` DOM stable identity attribute → counter cross-session accurate + semantic preserved.

**Counter modal threshold preserved Bundle 4:** la 3 refuses cross-session → modal *"Vrei să nu-l mai propun deloc?"* (anti-paternalism Co-CTO bias 3 — NU 5 paternalism, NU 2 agresiv).

## §4 Sequence Reordering Pre-Fatigue Avoidance Algorithm

Pseudo-code orchestrator-level (post-swap event):

```
function reorderSessionPostSwap(sessionPlan, swappedSlot, newExercise):
  bigLiftSlots = sessionPlan.filter(slot => 
    slot.exercise.tier === 1 && slot.exercise.force_demand === 'high'
  )
  
  for bigLiftSlot in bigLiftSlots where bigLiftSlot.position > swappedSlot.position:
    if causesPreFatigue(newExercise, bigLiftSlot.exercise):  // §2.3 lookup table
      
      // Marius advanced tier override check
      if userTier === 'marius' && specializationPARALLELModifierActive():
        if intentionalPreFatiguePattern(newExercise, userGoal):
          continue  // SKIP reorder, preserve Marius intentional sequence
      
      safePosition = findSafePositionPostBigLift(newExercise, sessionPlan)
      sessionPlan = reorder(sessionPlan, swappedSlot.position → safePosition)
      
      logCDLEvent('sequence_reorder', {
        reason: 'pre_fatigue_avoidance',
        movedExercise: newExercise.id,
        protectedBigLift: bigLiftSlot.exercise.id,
        fromPosition: swappedSlot.position,
        toPosition: safePosition
      })
      break  // single reorder per swap event
  
  return sessionPlan
```

**Engine invariant ADR 026 §9 preserved:** ZERO engine module mutation. Engine #2 Goal Adaptation `buildSession()` returnează initial session plan; orchestrator post-swap reorder per §2.3 rules in adapter layer (per ADR 030 §D2 thin scope).

## §5 Co-CTO Decisions Motivate

### §5.1 Cascade Ordered List Per Exercise vs Score-Based Ranking (Daniel LOCK)

**Decision:** Cascade ordered list pre-defined per exercise în schema (Daniel principle LOCK 2026-05-13e), NU score-based ranking v1 generic.

**Rationale:** Daniel explicit principle "Daca am tractiuni si nu pot -> helcometru. Daca nu am helcometru -> assisted pullup machine..." = pre-determined ordering specific per exercise prioritized by domain expertise (helcometru BEFORE assisted pullup machine per Daniel; v1 score-based ranking ar fi listat assisted pullup first per same `force_demand` +2 bonus same `equipment_type` +1 bonus = +6 total vs helcometru +3 same `muscle_target_primary` only). Cascade ordered list captures domain expertise hard-coded; score-based ranking algorithmic generic insuficient pentru intent strategic. v1 ranking preserved în engine `findAlternatives()` ca fallback ranking când cascade ordered list nu defined per exercise (graceful degradation per ADR 025).

### §5.2 Cascade Step Types Canonical 5 Unified (ex-Pillars 1+2 Absorbed)

**Decision:** 5 step types canonical = `easier_machine` + `assisted_variant` + `muscle_group_compose` + `bodyweight` + `light_variant` (unified ex-Pillar 1 bodyweight + ex-Pillar 2 light variant + intermediate steps).

**Rationale:** Daniel exemplu Bundle 5 chin-up cascade (helcometru → assisted pullup → muscle group compose 1-2 ex → bodyweight → light variant) demonstrates 5-step pattern universal applicable. Daniel exemplu Bundle 4 chest cascade (Pec deck → cable fly → bench fly → DB fly → bodyweight → light) parallel structure. Pattern apply singur ~60 exerciții V1 library (Co-CTO bias apply NU ask 60 times per Daniel "sper sa nu o mai repet de 1000 ori" LOCK 2026-05-13e). Tier 2-3 isolation cascade simpler (3-4 steps typical: cable → band → bodyweight/compound substitute → skip).

### §5.3 Andura Primary Gym-Focused Paradigm (Daniel LOCK)

**Decision:** Cascade step types `easier_machine` + `assisted_variant` assume gym equipment availability primary path.

**Rationale:** Andura primary gym-focused paradigm LOCK Daniel verbatim 2026-05-13e *"Andura e primary gym focused... home focus e doar cand gymul e extrem de poor sau chiar nu se duce"*. Majoritar gym are helcometru, Smith machine, leg press, assisted pullup machine, cable stations = standard equipment expected. Edge case home-only/poor-gym = engine traverses cascade skip steps unavailable (auto-advance la `muscle_group_compose` step 3 sau direct `bodyweight` step 4 graceful degradation per ADR 025). NO artificial home-substitute (towel curl pe ușă, band-only) — preserve Andura dignity Bugatti paradigm.

### §5.4 Different-Exercise-Easier Light Variant Semantic (Daniel LOCK)

**Decision:** Light variant cascade step = different-exercise-easier (kneeling push-up, wall push-up, box squat smaller ROM, etc.), NU same-exercise-reduced.

**Rationale:** Daniel verbatim LOCK 2026-05-13e *"different-exercise-easier (push-up înlocuit cu kneeling push-up etc"*. Identity exercise tracking accuracy în CDL — light variant logs as separate exercise (preserve progression tracking + analytics integrity downstream Engine #1 Periodization). Future v3 could add weight/reps modifiers as secondary fallback if needed (out-of-scope v2).

### §5.5 Muscle Group Compose 1 OR 2 Exercises (Daniel LOCK)

**Decision:** `muscle_group_compose` step contains 1 OR 2 exercises per exercise mapping decision (Daniel LOCK verbatim *"fie 1 exercitiu sau 2"*).

**Rationale:** 1 ex when single-muscle isolation coverage suffices (e.g., calf raise → seated calf raise alone covers calves); 2 ex when compound exercise had multi-muscle coverage (e.g., chin-up covers lats+biceps+rear delts → DB row + face pull complementary coverage). Co-CTO decision per exercise în mapping draft §2.2; engine runtime filters compose exercises by user equipment ownership + returns viable subset (at least 1 of 2 OK per Daniel anti-perfectionism).

### §5.6 Orchestrator-Only Cascade + Reorder vs Engine Touch

**Decision:** Orchestrator-only cascade traversal + reorder, ZERO engine module mutation.

**Rationale:** ADR 026 §9 pure-function engines invariant preserved Bundle 4 reaffirm. Engine #2 Goal Adaptation `buildSession()` returnează initial plan; orchestrator post-swap cascade traversal + reorder per pre-fatigue rules în adapter layer per ADR 030 §D2 thin scope. Engines pure preserved invariant.

### §5.7 Silent Reorder vs Warn Modal

**Decision:** Silent reorder, NU warn modal pentru reorder action.

**Rationale:** Gigel-friendly anti-paternalism engine intelligence ascunsă (per [[wiki/concepts/andura-suflet]] + [[wiki/concepts/gigel-test]]). User vede session plan actualizat în UI direct post-swap — NU friction modal "exercise X was moved because Y" cognitive load. CDL audit trail preserved (debug visibility post-hoc) fără UI friction. User curious why exercise moved → CDL inspection available via Progres tab future enhancement.

### §5.8 Marius Edge Case via Existing Specialization PARALLEL Modifier

**Decision:** Marius intentional pre-fatigue allowed via engine-specialization PARALLEL modifier 4-gate strict existing (NU NEW carve-out v2).

**Rationale:** Consistency cu existing engine-specialization architecture (ADR 029 + [[wiki/entities/engines/engine-specialization]]). NU duplicate carve-out logic v2. Default tier (Maria/Gigica/Gigel) hard block silent reorder; Marius advanced opt-in via specialization toggle. Reuse existing gate logic + invariant single source of truth for advanced tier behavior.

### §5.9 Pre-Fatigue Pairs Hard-Coded Canonical Table

**Decision:** Hard-coded table `src/engine/smart-routing/preFatigueRules.js` per §2.3 (NU runtime ML detection).

**Rationale:** Deterministic conflict resolution per ADR 004 rule-engine numeric priorities pattern. Canonical exercise science pairs (triceps assist bench, biceps assist chin-up, hamstring assist squat/deadlift, etc.) NU contested — hard-coded simpler + debuggable + testable. Future v3 could extend ML if patterns emerge user-specific via CDL feedback signals.

## §6 Migration v1 → v2 (Zero-Breaking Additive)

**Schema migration:** `fallback_cascade[]` field NEW additive în `exerciseMetadata.js`. Existing exerciții fără field → engine fallback la v1 `findAlternatives()` score-based ranking (graceful degradation per ADR 025). Apply progressive ~60 exerciții V1 library Bundle 6.1 implementation per pattern §2.2 Co-CTO canonical draft.

**Algorithm migration:** v1 Tier-aware filtering + similarity ranking PRESERVED ca fallback când cascade ordered list nu defined per exercise. v2 cascade traversal new primary path când `fallback_cascade[]` populated. ZERO breaking change pentru existing alternatives flow.

**Sequence reordering:** orchestrator-level NEW addition, ZERO engine touch. Pre-fatigue pairs hard-coded table — opt-in via orchestrator post-swap event invocation.

**Storage migration:** ZERO new localStorage keys (uses existing Bundle 4 `wv2-skipped-exercises` + `wv2-refusal-counter` Tier 0 parity preserved invariant).

**Tests preservation:** existing tests 3111 PASS Bundle 4 preserved invariant. NEW tests projected ~100-150 cumulative Bundle 6.1-6.4:
- `exerciseMetadata.fallback_cascade` schema populate ~30 tests (~60 exerciții × cascade step validation)
- cascade traversal algorithm ~25 tests (step skip equipment lack + step skip refusal counter + muscle_group_compose viable subset filter + step types resolve)
- pre-fatigue rules ~25 tests (pairs canonical + Marius edge case override + silent reorder behavior)
- end-to-end cascade integration ~30 tests (cascade exhaustion + anti-paternalism skip final + graceful degradation v1 fallback)
- sequence reordering integration ~20 tests (big lift compound preservation + isolation reorder + CDL audit trail)

## §7 Implementation Deferred Bundle 6+ Chat NEW

**NOT implemented in this chat.** This ADR amendment = strategic decision document only. Implementation execution per Bundle 6+ artefact CC autonomous Opus prin metoda hibridă chat ↔ CC terminal LOCKED V1 §F3.13:

1. **Bundle 6.1 Schema additions + cascade populate** — `src/schema/exerciseMetadata.js` extend `fallback_cascade[]` field + populate ~60 exerciții V1 library per §2.2 mapping Co-CTO canonical draft. Apply pattern universal Daniel LOCK 2026-05-13e principle.
2. **Bundle 6.2 Cascade traversal logic** — `src/engine/smart-routing/cascadeTraversal.js` NEW + integrate `findAlternatives()` orchestrator + graceful degradation v1 score-based fallback când cascade unset
3. **Bundle 6.3 Pre-fatigue rules + sequence reordering** — `src/engine/smart-routing/preFatigueRules.js` NEW + orchestrator post-swap reorder logic + CDL audit trail event
4. **Bundle 6.4 Tests + smoke** — NEW vitest cluster ~100-150 tests + Playwright E2E smoke cascade traversal flow vs live andura.app

**Per metoda hibridă LOCKED V1 §F3.13:** Bundle 6.1-6.4 separate artefacte CC `.md` direct executable cu skills inline (gstack `/qa` post-LANDED full suite + Sequential Thinking cascade algorithm complexity + Impeccable `/critique` UI parity vs mockup `04-architecture/mockups/andura-clasic.html` §screen-workout-preview + §screen-workout mid-session preserved invariant).

## §8 Acceptance Criteria + Cross-Refs

### §8.1 Acceptance Criteria Pre-Implementation

- Daniel review explicit ADR v2 amendment formal LANDED + approve sau push-back specific
- §2.2 mapping Co-CTO draft canonical cascade ordered list per exercise (~20 exemple representative) confirmed sau amendat per Daniel domain feedback
- §2.3 pre-fatigue pairs table confirmed exercise science accurate sau amendat (NU contested clasic, dar Daniel domain check)
- Acceptance Bundle 6+ chat NEW post-LANDED amendment v2 ADR explicit Daniel CTO directive

### §8.2 Cross-Refs Raw Layer

- [[../03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1.md]] LOCK V1 2026-05-02 supersede chain
- [[../03-decisions/026-offline-coaching-decision-tree-exhaustive.md]] §9 pure-function engines invariant preserved
- [[../03-decisions/030-adapter-design-pattern.md]] §D2 thin scope storage edges + engines pure preserved
- [[../03-decisions/020-storage-tiering-strategy.md]] §1.4 Tier 0 active rolling Bundle 4 `wv2-skipped-exercises` + `wv2-refusal-counter` parity preserved
- [[../03-decisions/004-rule-engine-numeric-priorities.md]] deterministic conflict resolution priority scale pattern
- [[../03-decisions/011-coach-decision-log-architecture.md]] CDL audit trail reorder event log
- [[../03-decisions/025-andura-gandeste-pentru-user.md]] graceful degradation engine pre-fills default fallback
- [[../03-decisions/029-engine-specialization.md]] Marius advanced tier PARALLEL modifier 4-gate strict existing
- [[../03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1.md]] §9.4.6 cross-ref Pain-Aware Clean Signal rule
- [[../src/schema/exerciseMetadata.js]] BATCH_03 implementation schema canonical extend additive
- [[../src/engine/smart-routing/]] v1 engine contract LOCK preserved orthogonal v2 additive
- [[../src/pages/coach/equipmentSwap.js]] V1 LANDED BATCH 2 SLICE 2 commit `c5e7288` mockup §equipment-swap V2 SoT free-text fallback preserved invariant
- [[../04-architecture/mockups/andura-clasic.html]] §screen-workout-preview L913-997 + §screen-workout L1340-1400 mid-session DESIGN MASTER

### §8.3 Cross-Refs Wiki Layer

- [[../wiki/entities/adrs/adr-smart-routing-equipment.md]] v1 entity page LOCK 2026-05-02 (supersede chain v2 amendment)
- [[../wiki/summaries/bundle-4-workout-preview-plus-midsession-refusal-flow-landed-milestone-2026-05-13.md]] Bundle 4 LANDED milestone synthesis chain (cascade exhaustion mechanism verbatim Daniel full description)
- [[../wiki/concepts/calendar-feature-v1-spec.md]] §amendments 2026-05-13e Bundle 5 ADR amendment SMART_ROUTING_v2 deferred path forward strategic chat dedicat
- [[../wiki/concepts/bugatti-craft.md]] Quality > Speed dev iteration discipline preserve invariant
- [[../wiki/concepts/gigel-test.md]] anti-paternalism Gigel-friendly engine intelligence ascunsă preserve invariant
- [[../wiki/concepts/andura-suflet.md]] brand soul Gigel-friendly anti-paternalism preserve invariant
- [[../wiki/entities/engines/engine-coach-director.md]] orchestrator pipeline §42.10 + Bundle 4 augmentation preserved invariant
- [[../wiki/entities/engines/engine-specialization.md]] Marius advanced tier PARALLEL modifier 4-gate strict existing carve-out

---

🦫 **ADR SMART_ROUTING_EQUIPMENT v2 DRAFT REV2 pending Daniel review explicit 2026-05-13e Co-CTO autonomous via metoda hibridă chat ↔ CC terminal LOCKED V1 §F3.13. Cascade ordered list pattern locked Daniel principle "Daca am tractiuni si nu pot -> helcometru..." apply universal toate ~60 exerciții V1 library. 5 step types canonical (easier_machine + assisted_variant + muscle_group_compose 1-2 ex + bodyweight + light_variant) unified ex-Pillar 1+2 flat fields. ~25 exemple mapping Co-CTO draft §2.2 representative coverage Tier 1+2+3 exercitii. Implementation deferred Bundle 6+ chat NEW post-amendment LANDED Daniel approve. ZERO engine module mutation per ADR 026 §9 invariant preserved + ZERO breaking change additive schema + storage Tier 0 parity Bundle 4 preserved invariant. Sequence reordering pre-fatigue avoidance orchestrator-level preserved unchanged from rev1 draft. Anti-paternalism skip exercise propose alternative session structure final option v1 preserved. Andura primary gym-focused paradigm — gym equipment standard expected primă treaptă cascade, NO artificial home-substitute. Different-exercise-easier light variant semantic identity exercise tracking accuracy preserved. Co-CTO 9 decisions motivate documented inline + Marius edge case via existing engine-specialization PARALLEL modifier consistency. Graceful degradation v1 score-based ranking fallback când cascade unset per ADR 025.**
