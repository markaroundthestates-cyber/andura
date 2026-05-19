# PROMPT_CC_SPRINT4X_BATCH_03_SCHEMA_SUFLET_ANDURA

**Model:** Opus
**Order:** 03
**Dependencies:** None (strict disjunct — modifies src/schema/, src/engine/suflet-andura/, separat de Phase B engines)
**Scope:** §36.36 Schema Extension + Suflet Andura full implementation (RIR Matrix + 4 Moduri UI + Bias Detection + T1+ + Cascade Defense + Outlier Filter)

**Note:** Consolidat 2 batches originale (Schema + Suflet Andura) într-unul singur pentru a respecta §BATCH_PROTOCOL strict disjuncte (Suflet Andura depinde de Schema, deci NU pot fi separate).

---

## TASK 1 — Schema Extension §36.36

Extinde exercise library schema cu equipment metadata (foundation pentru Smart-Routing batch viitor).

### Schema fields ADD

```typescript
interface Exercise {
  // existing fields...
  
  // §36.36 NEW
  equipment_type: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'band';
  equipment_alternatives: string[]; // exercise IDs cu același muscle target, equipment diferit
  force_demand: 'low' | 'medium' | 'high'; // pentru Tier 1 forță detection
  tier: 1 | 2 | 3; // forță / hipertrofie / accesoriu
  muscle_target_primary: string;
  muscle_target_secondary: string[];
}
```

### Migration

Pentru fiecare exercise existent în library, populează fields noi cu defaults conservatoare (manual review post-batch dacă e nevoie). Detalii audit per exercise = backlog separat, NU acest batch.

---

## TASK 2 — Suflet Andura Core

Implementare completă §36.16-§36.26 + RIR Matrix + Cascade Defense + Outlier Filter.

### Module structure

```
src/engine/suflet-andura/
├── rir-matrix.js          # RIR 4-tier scoring per ADR_RIR_MATRIX
├── modes-ui.js            # 4 Moduri UI (Strategic/Executor/Hybrid/Auto)
├── bias-detection.js      # Mode drift detection §36.34
├── tier-progression.js    # T0/T1/T2/T3 personalization tiers
├── cascade-defense.js     # ADR_CASCADE_DEFENSE multi-engine arbitration
├── outlier-filter.js      # ADR_OUTLIER_FILTER rolling window 8 sessions, cooldown 3×8
└── index.js               # public API
```

### RIR Matrix (ADR_RIR_MATRIX)

4-tier intensity scoring: LIMIT (RIR 0-1) / HEAVY (RIR 1-2) / CHALLENGING (RIR 2-3) / COMFORTABLE (RIR 3+). Wording locked per Q26 §36.58.

### 4 Moduri UI

Strategic / Executor / Hybrid / Auto. User declared mode în onboarding, behavior-tracked în background pentru drift detection (§36.34).

### Bias Detection §36.34

Detect mode drift: user declared "Executor" dar comportament real "Strategic" (>5% taps "De ce?", citește explicații lungi). Trigger PROFILE_VALIDATION_PROMPT post-rolling-window analysis.

### Tier Progression T0→T3

- T0 = skip onboarding → engine generic + demographic prior din synthetic database (50+ profile × 90 zile)
- T1+ = Profile Typing complete
- T2+ = Vitality data added
- T3+ = Behavioral real (post 12 sesiuni)

Self-selection = FEATURE NOT bug per persona memory.

### Cascade Defense (ADR_CASCADE_DEFENSE)

Multi-engine arbitration: când engines dau recomandări contradictorii (ex: ProactiveEngine "push harder", StagnationDetector "deload acum"), RuleEngine arbitrează cu priority order: Safety > Recovery > Progression > Optimization.

### Outlier Filter (ADR_OUTLIER_FILTER)

Rolling window 8 sessions, cooldown 3×8, EXT-2 amendment per §36.35: GOAL_SHIFT_CALIBRATION primele 2 sesiuni post-shift NU OUTLIER detection active. Streak counter RESET on goal shift.

### Tests

- `tests/engine/suflet-andura/*.test.js` — unit tests per module
- `tests/integration/cascade-defense.test.js` — multi-engine arbitration scenarios
- `tests/integration/outlier-filter-goal-shift.test.js` — edge case calibration window

---

## VERIFICATION

```bash
# Schema fields present
grep -rn "equipment_type\|equipment_alternatives\|force_demand" src/schema/ src/types/

# Suflet Andura modules created
ls -la src/engine/suflet-andura/

# Tests pass
npm test -- suflet-andura/
npm test -- integration/cascade-defense
npm test -- integration/outlier-filter
```

---

## COMMIT + PUSH

```bash
git add src/schema/ src/engine/suflet-andura/ src/types/ tests/
git commit -m "suflet-andura: full implementation §36.16-§36.26 + schema ext §36.36 + RIR Matrix + Cascade Defense + Outlier Filter"
git push
```

---

## RAPORT — `📤_outbox/LATEST.md`

Move existing LATEST → archive cu next NN.

**Format raport:**
- Task, Model, Status
- Pre-flight: schema files location, suflet-andura dir creation
- Modificări: file paths + line counts (likely 1500-3000 LoC across modules)
- Schema migration: exercise count migrated + defaults populated
- Build + Tests: total tests count, new tests count, pass/fail
- ADR cross-refs: RIR_MATRIX + CASCADE_DEFENSE + OUTLIER_FILTER + MODE_DETECTION_UI status
- Commits: hash
- Pushed: Yes/No
- Issues: detail orice ambiguity în spec
- Next action: BATCH_04 (sequential auto-trigger)
