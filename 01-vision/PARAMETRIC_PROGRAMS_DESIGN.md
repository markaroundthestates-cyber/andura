# PARAMETRIC PROGRAMS — Design Spec

**Created:** 2026-04-26
**Replaces:** "144 programe generative" anti-pattern in [[PROJECT_VISION]]
**Status:** Design only — implementation FAZA 4+

---

## Why NOT 144 templates

144 = 2 × 4 × 3 × 3 × 2 (gender × age × freq × exp × focus).

Problems:
1. Dimensions are NOT independent — a 55yo woman bulk/5x/week intermediate is NOT just a sum of 5 individual settings
2. Any shared-logic bug requires 144 fixes (or 144 tests to confirm the fix)
3. Adding a new dimension multiplies files by N (e.g., add "recovery_style": 144 → 432)
4. Maintenance hell at scale — Andura's moat is intelligence, not template volume

---

## Architecture

### PROG_BASE

Single source-of-truth program structure. One file. Defines:
- Exercise list per session type (PUSH / PULL / LEGS / FULL / REST)
- Set/rep baseline per exercise category
- Default progression step (weight increment)
- Rest interval baseline

### MODIFIERS

Parametric functions — pure, composable, independently testable:

```javascript
ageModifier(age)         → { recoveryFactor, volumeAdjust }
genderModifier(gender, focus) → { muscleEmphasis }
frequencyModifier(sessionsPerWeek) → { splitType, restDays }
experienceModifier(level) → { progressionStrategy }
focusModifier(goal)       → { volumeMultiplier, intensityHold }
```

### Composition

```javascript
session = applyModifiers(PROG_BASE, {
  age:        user.age,
  gender:     user.gender,
  frequency:  user.targetFrequency,
  experience: user.experienceLevel,
  focus:      user.currentGoal
});
```

Each modifier receives PROG_BASE + previous modifiers' output (pipeline). Order matters: gender → age → frequency → experience → focus.

---

## Modifier specs (v1)

### ageModifier(age)
- < 35: recoveryFactor = 1.0, volumeAdjust = 0
- 35–44: recoveryFactor = 0.95, volumeAdjust = -5%
- 45–54: recoveryFactor = 0.90, volumeAdjust = -10%
- 55+: recoveryFactor = 0.85, volumeAdjust = -15%

### genderModifier(gender, focus)
- M: chest/back emphasis +10%, legs neutral
- F: glutes/legs emphasis +10%, upper neutral

### frequencyModifier(sessionsPerWeek)
- 3/week: full body split or upper/lower alternate
- 4/week: push/pull (A/B week)
- 5/week: push/pull/legs with 2 rest days

### experienceModifier(level)
- BEGINNER: linear progression (add weight every session)
- INTERMEDIATE: undulating periodization (heavy/moderate/light waves)
- ADVANCED: block periodization (3-week accumulation → 1-week deload)

### focusModifier(goal)
- CUT: volume × 0.85, intensityHold +10%
- BULK: volume × 1.20, sets + 1 per compound
- MAINTAIN: volume × 1.0 (baseline)

---

## Why this beats 144 templates

| Criterion | 144 templates | Parametric |
|-----------|---------------|------------|
| Bug fix scope | 1 bug = 144 fixes | 1 bug = 1 modifier |
| Test coverage | 144+ test files | 5 modifiers × N tests each |
| New dimension | × N new files | +1 modifier function |
| Interaction effects | Hidden in each template | Explicit in pipeline order |
| Source of truth | 144 sources | 1 PROG_BASE + 5 modifiers |

---

## Trade-offs

- Initial setup more abstract than copy-paste 144 templates
- Modifier interactions need explicit testing (especially edge cases: 55yo + bulk + 5x/week)
- Pipeline order must be documented and enforced

---

## Implementation roadmap

| Phase | Deliverable |
|-------|-------------|
| v1.5 | PROG_BASE constant + age + frequency + focus modifiers |
| v2 | Gender modifier + experience progression strategies |
| v3 | Machine-learned modifier weights based on user response data |

v1.5 unblocks FAZA 4 launch. v2 in first quarter post-launch. v3 post-PMF.

---

## Testing approach

Unit test each modifier in isolation:
```
ageModifier(55).recoveryFactor === 0.85
frequencyModifier(5).splitType === 'push_pull_legs'
focusModifier('CUT').volumeMultiplier === 0.85
```

Integration test composition:
```
applyModifiers(PROG_BASE, { age:50, gender:'F', frequency:4, experience:'INTERMEDIATE', focus:'BULK' })
→ verify no zero-volume sets, no contradictions, sensible total volume
```
