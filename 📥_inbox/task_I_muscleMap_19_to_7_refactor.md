═══ START PROMPT CC TASK I ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `00-index/CURRENT_STATE.md` Task 31 Q1 muscleMap.js 19→7 grupes refactor deferred
- Read `src/engine/muscleMap.js` complete (19 heads current)
- Grep: ALL consumers of muscleMap exports across codebase (`src/`, `__tests__/`)
- Grep: `DEMO_MUSCLE_STATE` references for fixture update
- Cross-ref ADR if exists: pattern simplificare muscle groups for engine consumption + UI display

§1 SCOPE (atomic)
Refactor Q1: `src/engine/muscleMap.js` reduce de la 19 muscle heads la 7 grupe principale (consolidare upstream pentru engine + UI).

Mapping 19→7 (verify cu Daniel pre-implementare flag NEED_CONTEXT_DANIEL dacă mapping incert):
- Suggested 7 grupes: Piept / Spate / Umeri / Brațe / Picioare / Core / Cardio
- 19 heads detalii (chest-upper, chest-lower, lats, traps, etc) → fold into parent grupes

Update downstream consumers:
- Engine recommendations folosesc 7 grupes (nu 19)
- DEMO_MUSCLE_STATE fixture rebuilt
- Tests adapt to new structure (preserved logic, new structure)
- UI display (muscleViz omuleț Living Body Progres) adapt cu sole exception preserved (visualization unique)

§2 FILES AFFECTED
- `src/engine/muscleMap.js` (primary refactor)
- Consumers list (verify cu grep): TBD per pre-flight result
- `__tests__/` corespondent fixture + assertions update
- DEMO_MUSCLE_STATE fixture (location TBD)
- Living Body mockup omuleț (sole exception preserved unique visualization)

§3 ACCEPTANCE CRITERIA
- `muscleMap.js` exports 7 grupes (cu mapping 19→7 documented inline)
- All consumers updated to consume 7 grupes
- Tests preserved 2731+ PASS (rebuild fixtures dacă necesar)
- Build clean ~4s
- DEMO_MUSCLE_STATE fixture rebuilt
- Living Body omuleț Progres NU regression (unique visualization preserved per Theme Parity Invariant V1 sole exception)
- Flag NEED_CONTEXT_DANIEL inline dacă mapping 19→7 incert (Daniel verify before merge)

§4 BACKUP TAG
git tag pre-task-I-$(date +%Y%m%d_%H%M)

§5 COMMIT
refactor(engine): muscleMap 19 heads → 7 grupes Q1 simplification

§6 RAPORT format invariant per Task A. Plus NEED_CONTEXT_DANIEL inline (mapping detail) + downstream consumer update list.
═══ END PROMPT CC TASK I ═══
