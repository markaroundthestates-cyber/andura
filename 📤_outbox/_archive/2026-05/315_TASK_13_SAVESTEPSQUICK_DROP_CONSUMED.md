# TASK 13 — saveStepsQuick Step Counter DROP

**Model:** Opus
**Velocity:** ~10-20 min CC autonomous (production code grep + atomic removal)
**Cluster:** #3 Workflow + scope cuts · Atom 4/6
**Authority:** Daniel directive 2026-05-10 chat ACASĂ post-noapte: *"saveStepsQuick step counter DROP"* — scope cut

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate saveStepsQuick references production code
grep -rniE "saveStepsQuick|step.counter|stepCounter|saveSteps" src/ --include="*.js" --include="*.html" 2>/dev/null | head -30

# Locate UI mockup references step counter
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin ==="
  grep -niE "saveStepsQuick|pași|steps|step.counter|stepCounter" 04-architecture/mockups/andura-$skin.html | head -10
done

# Verify tests references (preserve test fixtures dacă există)
grep -rniE "saveStepsQuick|stepCounter" tests/ --include="*.js" 2>/dev/null | head -10
```

---

## §1 Scope

DROP `saveStepsQuick` step counter feature production code + UI mockup references cross-skin × 4 (dacă apar). Scope cut consistent.

**Acțiuni concrete:**
1. **Production code:** REMOVE `saveStepsQuick` function + invocations + state references
2. **Mockup files:** REMOVE step counter UI references (button / display / metric tile) cross-skin × 4 dacă exist
3. **Tests:** Update test fixtures dacă step counter test cases break (sau DELETE test cases dacă feature complet dropped)
4. **NU touch** Engine code orthogonal (Wake lock / Inactivity auto-pause = features SEPARATE preserved per scope clarification 6 features recovery)

---

## §2 Files modify

Determined post-grep — atomic per file modified atomic batch.

Expected candidates (verify pre-flight):
- Possibly `src/state.js` step counter state field
- Possibly `src/pages/*.js` step counter UI handler
- Possibly mockup files cross-skin (verify pre-flight)
- Possibly `tests/*.js` step counter test cases

---

## §3 Acceptance criteria

1. ✅ Pre-flight grep saveStepsQuick complete + matches enumerated
2. ✅ Production code `src/` saveStepsQuick references REMOVED
3. ✅ Mockup files step counter UI REMOVED cross-skin × 4 (dacă apar)
4. ✅ Tests updated/removed (step counter test cases) — count update tracked
5. ✅ Tests `npm run test:run` PASS (count maybe 2731 → lower if test cases deleted)
6. ✅ Build PASS
7. ✅ Grep post-removal: ZERO matches saveStepsQuick / step.counter src/ + mockups

---

## §4 Backup tag

```bash
git tag pre-task13-savestepsquick-drop-$(date +%Y-%m-%d-%H%M)
git push origin pre-task13-savestepsquick-drop-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
chore(scope-cut): DROP saveStepsQuick step counter feature

Per Daniel directive 2026-05-10 chat ACASĂ post-noapte scope cut.

Removed:
- src/ saveStepsQuick function + invocations + state references
- Mockup files step counter UI cross-skin × 4 (where applicable)
- tests/ step counter test cases (if any)

Preserved:
- Wake lock feature (orthogonal, scope clarification recovery)
- Inactivity auto-pause feature (orthogonal preserved)

Cluster #3 Workflow + scope cuts · Task 13/16 Phase 1 orchestrator.
Tests count update: <2731 → N if test cases deleted>.

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 scope cut saveStepsQuick
- 6 features recovery scope clarification preserved (Wake lock, Inactivity auto-pause distincte)
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 13 — saveStepsQuick Step Counter DROP

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <grep findings: N matches in M files>
- **Modificări per-file:**
  - <file_1>: <line removed>
  - <file_2>: <line removed>
- **Tests:** <2731 → N count update if test cases deleted>
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Grep post-removal verify:** ZERO matches saveStepsQuick / step.counter
- **Issues:** <none | description>
- **Next action:** TASK 14 (Antrenament liber DROP confirmat cross-skin × 4)
```
