# TASK 31 — Q1 Engine Aggregator V2 muscleMap.js 19 → 7 Grupes Refactor

**Model:** Opus
**Velocity:** ~60-90 min CC autonomous (engine refactor, NU mockup — complex tests update)
**Cluster:** Standalone · Atom 1 (NU cross-skin, engine-side)
**Authority:** CURRENT_STATE §POINTERS carry-forward backlog "Q1 engine aggregator V2 migration `src/engine/muscleMap.js` 19 heads → 7 grupes" + Q1 LOCKED 2026-05-09 prep wiring (mockup andura-living-body.html line ~comment "Body fatigue V2 prep wiring")

---

## §0 Pre-flight grep MANDATORY (engine refactor — extra critical)

```bash
# Verify muscleMap.js current 19 heads structure
cat src/engine/muscleMap.js | head -100
grep -niE "MUSCLE_HEADS|HEADS|MUSCLE_GROUPS|getMuscleState|exponential decay" src/engine/muscleMap.js | head -30

# Verify Q1 LOCK V1 spec (target 7 grupes)
grep -niE "Q1.*7 grupes|7 grupes|Q1 LOCKED 2026-05-09|aggregator V2" 00-index/CURRENT_STATE.md 03-decisions/DECISION_LOG.md 2>/dev/null | head -15

# Verify usages downstream (impact analysis)
grep -rniE "import.*muscleMap|from.*muscleMap|MUSCLE_HEADS|getMuscleState" src/ --include="*.js" | head -30

# Verify tests baseline impact
grep -rniE "muscleMap|MUSCLE_HEADS|getMuscleState" tests/ --include="*.js" | head -20

# Verify mockup Living Body Q1 wiring prep comment
grep -niE "Body fatigue V2 prep wiring|Q1 LOCKED|DEMO_MUSCLE_STATE|useMuscleState" 04-architecture/mockups/andura-living-body.html | head -10
```

---

## §1 Scope

Refactor `src/engine/muscleMap.js` engine aggregator V2 — 19 individual muscle heads → 7 grupes mari/medii/mici per Q1 LOCK 2026-05-09.

**Spec target 7 grupes (Co-CTO scope candidate, Daniel verify pre-implementation):**
1. **Piept** (chest — pectoral major + minor consolidated)
2. **Spate** (back — lats + traps + rhomboids + erector consolidated)
3. **Umeri** (shoulders — deltoids ant/mid/post consolidated)
4. **Brațe** (arms — biceps + triceps + brachialis + forearms consolidated)
5. **Picioare** (legs — quads + hamstrings + glutes + calves consolidated)
6. **Core** (abs + obliques + lower back consolidated)
7. **Stabilizatori** (small stabilizers — rotator cuff, deep core etc — optional 7th)

**ALTERNATIVE Co-CTO scope:** 6 grupe major (drop Stabilizatori → integrate în Spate + Umeri) — Daniel decide între 6 vs 7.

**NEED_CONTEXT_DANIEL flag:** Verify exact target list 7 grupes per Q1 LOCK 2026-05-09 spec. Co-CTO propose above + Daniel confirm pre-implementation.

**Acțiuni refactor atomic:**
1. **Pre-flight grep** + impact analysis downstream
2. **Migration mapping** 19 heads → 7 grupes (preserve underlying CDL data, aggregate at query time)
3. **Update `getMuscleState()`** signature returns aggregated by 7 grupes
4. **Backwards compat shim** dacă needed (deprecated old 19-head API + new 7-grupe API parallel V1, drop old V2)
5. **Update tests** affected (downstream + new aggregator tests)
6. **Update mockup Living Body** `DEMO_MUSCLE_STATE` placeholder reflect 7 grupes structure
7. **Tests count update tracked** (2731 → N adjusted)

**Cross-impact:**
- Engine downstream consumers (specialization, weakness detector, recovery)
- Mockup Living Body omulețul muscular display (7 grupes color coding vs 19 heads granularity)
- Future React migration mapping ready (per `useMuscleState()` hook plan-and-play)

---

## §2 Files modify

- `src/engine/muscleMap.js` (primary refactor)
- `src/engine/muscleMap.test.js` sau `tests/engine/muscleMap.test.js` (tests update)
- Possibly `src/engine/specialization/weaknessDetector.js` (downstream consumer)
- `04-architecture/mockups/andura-living-body.html` (DEMO_MUSCLE_STATE update reflect)
- Other downstream consumers per pre-flight grep findings

NOT atomic single commit — sequential commits per layer (engine first, tests second, mockup third) pentru granular rollback safety.

---

## §3 Acceptance criteria

1. ✅ Pre-flight grep + impact analysis enumerated downstream
2. ✅ Migration mapping 19 heads → 7 grupes documented
3. ✅ `getMuscleState()` V2 returns aggregated 7 grupes structure
4. ✅ Backwards compat shim dacă needed (NU break existing consumers immediate)
5. ✅ Tests downstream updated + new aggregator V2 tests added
6. ✅ Mockup Living Body DEMO_MUSCLE_STATE reflect 7 grupes
7. ✅ Tests `npm run test:run` PASS (count update tracked 2731 → N)
8. ✅ Build PASS
9. ✅ Manual smoke Living Body Progres tab — omulețul muscular display 7 grupes color coding functional

**NEED_CONTEXT_DANIEL flag:** Daniel verify exact 7 grupes list pre-implementation.

---

## §4 Backup tag

```bash
git tag pre-task31-q1-aggregator-v2-$(date +%Y-%m-%d-%H%M)
git push origin pre-task31-q1-aggregator-v2-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message (multi-commit sequence)

```
refactor(engine-musclemap-v2): aggregator 19 heads → 7 grupes Q1 LOCK V1

Per Q1 LOCKED 2026-05-09 spec + CURRENT_STATE §POINTERS carry-forward backlog.

Migration:
- 19 individual muscle heads → 7 grupes consolidated
- getMuscleState() V2 signature returns aggregated structure
- Backwards compat shim (V1 API deprecated + V2 parallel)

7 grupes target:
1. Piept | 2. Spate | 3. Umeri | 4. Brațe | 5. Picioare | 6. Core | 7. Stabilizatori

Downstream impact:
- Specialization weaknessDetector updated
- Mockup Living Body DEMO_MUSCLE_STATE reflect 7 grupes
- Future React useMuscleState() hook ready

Standalone Task 31/N Phase 2 orchestrator.
Tests <2731 → N> count update tracked.

Cross-refs:
- Q1 LOCKED 2026-05-09 7 grupes spec
- 04-architecture/mockups/andura-living-body.html prep wiring comment
- ADR 018 §2 Standardized Dimension Contract pure functions preserved
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 31 — Q1 Engine Aggregator V2 19→7 Grupes Refactor

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <impact analysis: N downstream consumers identified>
- **Migration mapping:** <19 heads → 7 grupes documented>
- **Files modified:**
  - src/engine/muscleMap.js: <atomic diff>
  - tests/engine/muscleMap.test.js: <updated count>
  - <downstream consumers updated>
  - 04-architecture/mockups/andura-living-body.html: <DEMO_MUSCLE_STATE update>
- **Tests:** <2731 → N count update>
- **Build:** PASS
- **Commits sequence:** <list SHAs per layer engine/tests/mockup>
- **Pushed:** origin/main
- **NEED_CONTEXT_DANIEL:** Daniel verify 7 grupes list pre-merge if implemented Co-CTO scope
- **Issues:** <none | description>
- **Next action:** TASK 32 (showWhyForExercise scope clarify recovery — 6 features start)
```
