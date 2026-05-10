# TASK 10 — 1800 kcal Hardcoded Grep + Remove Production

**Model:** Opus
**Velocity:** ~10-20 min CC autonomous (production code grep + atomic removal)
**Cluster:** #3 Workflow + scope cuts · Atom 1/6
**Authority:** Daniel directive 2026-05-10 chat ACASĂ post-noapte: *"in productie scoate rahatul ala al meu de 1800 kcal ca mai mult ne incurca"* (test data legacy hardcoded)

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate ALL 1800 kcal hardcoded references production code
grep -rniE "1800.*kcal|kcal.*1800|1800.*calorii|calorii.*1800" src/ --include="*.js" --include="*.html" --exclude-dir=node_modules | head -30

# Verify NU în mockup files (those are display-only, scope clarify)
grep -rniE "1800" 04-architecture/mockups/*.html 2>/dev/null | head -20

# Locate auto target engine (preserve, NU remove)
grep -rniE "kcal_target|calorie_target|BMR|TDEE|Mifflin" src/ --include="*.js" | head -20

# Verify test data context (test files OK to keep, production files priority)
grep -rniE "1800" tests/ --include="*.js" | head -10
```

---

## §1 Scope

Remove "1800 kcal" hardcoded test data legacy din production code (`src/`). Engine auto target (BMR/TDEE Mifflin-St Jeor) preserved — DOAR hardcoded overrides removed.

**Acțiuni concrete:**
1. **Grep production code** (`src/`) toate 1800 kcal references
2. **Per match identified:**
   - Dacă = test data legacy hardcoded → **REMOVE** + replace cu engine compute call dacă necesar
   - Dacă = engine auto target compute (Mifflin-St Jeor) → **PRESERVE** (NU 1800 hardcoded, ci computed)
   - Dacă = test fixture / unit test → **PRESERVE** (test data scope)
3. **Verify** 1800 kcal NU apare în UI mockup-uri post-removal (Tasks 06-09 cross-skin)
4. **Engine Bayesian inference** preserved unchanged (silent backend Layer 1-5)

**NU touch:**
- Test fixtures `tests/` (test data scope acceptable)
- Engine compute logic Mifflin-St Jeor (preserved exact)
- Mockup files HTML (separate Tasks 06-09 cross-skin already cosmetic)

---

## §2 Files modify

Determined post-grep — atomic per file modified atomic batch.

Expected candidates (verify pre-flight):
- Possibly `src/state.js` initial state defaults
- Possibly `src/engine/nutrition/*.js` legacy fallbacks
- Possibly `src/pages/weight.js` test data leftovers

---

## §3 Acceptance criteria

1. ✅ Pre-flight grep 1800 kcal production code complete + matches enumerated
2. ✅ Hardcoded test data 1800 kcal REMOVED production
3. ✅ Engine auto target compute Mifflin-St Jeor preserved unchanged
4. ✅ Test fixtures `tests/` preserved
5. ✅ Tests 2731 PASS preserved EXACT (sau update count if 1800 hardcoded test removed legitimate)
6. ✅ Build PASS
7. ✅ Manual smoke flow logging — auto target displays computed value (NU 1800 hardcoded)
8. ✅ Grep post-removal: production `src/` 1800 kcal matches = ZERO

---

## §4 Backup tag

```bash
git tag pre-task10-1800kcal-remove-$(date +%Y-%m-%d-%H%M)
git push origin pre-task10-1800kcal-remove-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
chore(nutrition): remove 1800 kcal hardcoded test data legacy production

Per Daniel directive 2026-05-10 chat ACASĂ post-noapte:
"in productie scoate rahatul ala al meu de 1800 kcal ca mai mult ne incurca"

Removed:
- <list per-file removals identified post-grep>

Preserved:
- Engine auto target compute Mifflin-St Jeor BMR/TDEE
- Test fixtures tests/ scope
- Bayesian inference silent backend (Layer 1-5)

Cluster #3 Workflow + scope cuts · Task 10/16 Phase 1 orchestrator.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 task mecanic clusters
- PRODUCT_STRATEGY §3.5 V3 amendment auto-fill rule
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 10 — 1800 kcal Hardcoded Removal Production

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <grep findings: N matches in M files src/>
- **Modificări per-file:**
  - <file_1>: <line removed/modified>
  - <file_2>: <line removed/modified>
- **Preserved:** Engine Mifflin-St Jeor compute + test fixtures
- **Tests:** 2731 PASS preserved | <count update if test removed>
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Grep post-removal verify:** ZERO matches src/ 1800 kcal
- **Issues:** <none | description>
- **Next action:** TASK 11 (Pain Button idle scos cross-skin × 4)
```
