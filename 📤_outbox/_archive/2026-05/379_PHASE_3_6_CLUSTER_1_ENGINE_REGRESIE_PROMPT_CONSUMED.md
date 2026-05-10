═══ START PHASE 3.6 CLUSTER #1 — ENGINE INTEGRATION REGRESIE AUDIT-THEN-FIX ═══

**Model:** Opus (hardcoded permanent — Sonnet concediat)
**Branch:** `feature/phase-3-orchestrator-final` (NU main — code work stays separate)
**Scope:** Single cluster atomic — Buguri 6+7+11 ONLY (engine integration regresie prod parity)
**Mode:** audit-then-fix per bug (NU fix orb), per-bug independent (fail one bug → continue alte 2, raport per bug status)
**Constraint single-theme:** Clasic master post STRATEGIC SHIFT LOCK V1. NU touch mockup files `04-architecture/mockups/`. Engine integration = `src/` source code only.

**Reasoning context (Daniel directive 2026-05-10 big picture):**

3 buguri cluster acest = same pattern USER ACTION → ENGINE EVENT EMIT → DOWNSTREAM CONSUME → UI REFRESH:

- Bug 6: User schimbă goal Forța → Mentenanță în Settings/Antrenor → așteaptă Progres reflectă reactive. Engine impact: setPhaseOverride() → Periodization recalibrate volume targets → Bayesian Nutrition recalc kcal (mentenanță = TDEE pure NU surplus) → Progres tab display refresh.
- Bug 7: User bagă greutate 78kg weekly weigh-in → saveW() → engine consume: TDEE Mifflin-St Jeor recalc → kcal target update → Bayesian Nutrition adjust → Progres macros refresh + chart trend update.
- Bug 11: User măsurat caliper BF 18% manual override US Navy → saveBF() → engine consume: lean mass calc → muscle mass derive → Periodization volume scaling per lean mass.

Daniel verbatim: "pe andura.app aia funcționează." = `main` branch behavior. Phase 3+3.5 a rupt observer pattern undeva în src/ pe feature branch. Probabil într-un singur loc (emit / listen / re-render). Fix one-spot repară 3 buguri downstream.

**Trust rationale:** App-ul Andura = guidance ancorat în history reală. User schimbă goal → MUST update reflected immediate. Inconsistency = trust dead = user gone permanent. Daniel verbatim "tu nu ai vrea sa apesi 100x6 si app sa zica 26.6x8" = aceeași principiu — engine NU minte user.

═══ §0 PRE-FLIGHT GREP MANDATORY (BEFORE ANY CHANGE) ═══

Execute toate ÎNAINTE atingi vreun fișier. Output verbatim în `📤_outbox/PHASE_3_6_CLUSTER_1_PREFLIGHT.md` (count occurrences + paths abbreviated).

```bash
cd /workspaces/salafull 2>/dev/null || cd "$HOME/Documents/salafull"

# (a) Engine handlers + emit + listen — primary suspects
grep -rn "setPhaseOverride\|clearPhaseOverride\|getCurrentPhase\|getPhase" src/ 2>/dev/null
grep -rn "saveW\|saveBF\|setBF\|setBodyFat" src/ 2>/dev/null
grep -rn "renderProgres\|renderProgress\|renderProfile" src/ 2>/dev/null
grep -rnE "addEventListener|dispatchEvent|emit\(|on\(" src/ 2>/dev/null | grep -iE "phase|weight|bf|goal" | head -30

# (b) State + DB writes + reads
grep -rnE "DB\.(set|get).*(phase|weight|bodyFat|bf)" src/ 2>/dev/null

# (c) Diff main vs feature primary suspect files
git fetch origin main 2>/dev/null
git diff origin/main..HEAD -- \
  src/pages/plan.js \
  src/pages/weight.js \
  src/pages/progres.js \
  src/pages/settings.js \
  src/pages/coach/ \
  src/state.js \
  src/engine/bayesianNutrition/ \
  > /tmp/cluster_1_diff.txt 2>/dev/null
wc -l /tmp/cluster_1_diff.txt

# (d) Identify regression suspect lines (handlers + listeners + emitters added/removed)
grep -E "^[-+].*setPhaseOverride|^[-+].*saveW|^[-+].*saveBF|^[-+].*renderProgres|^[-+].*addEventListener|^[-+].*dispatchEvent|^[-+].*emit\(" /tmp/cluster_1_diff.txt > /tmp/cluster_1_suspect.txt
wc -l /tmp/cluster_1_suspect.txt

# (e) Test fixtures verify expected handlers still tested (sanity check)
grep -rn "saveW\|saveBF\|setPhaseOverride" src/**/__tests__/ 2>/dev/null | head -20

# (f) BF manual override input handler verify
grep -rnE "bf-input|bfInput|manualBF|edit-bf|manual.*body.*fat" src/ public/ 2>/dev/null
```

**HALT condition:** if `/tmp/cluster_1_suspect.txt` empty (zero handler-related diff lines) → regresia NU e pe handlers → flag în raport "Hypothesis primary fail — NU regression in handler chain. Investigate alte axe (CSS hidden / state init / DB schema)." NU procedezi blind la fix.

═══ §1 AUDIT PHASE (NU FIX YET) ═══

Per bug, identify root cause în raport `📤_outbox/PHASE_3_6_CLUSTER_1_AUDIT.md` ÎNAINTE execute fix:

**Bug 6 — Goal Forța→Mentenanță NU update Progres:**
1. Read `src/pages/plan.js` setPhaseOverride() implementation
2. Verify: does it `dispatchEvent('phase-changed', { detail: phase })` sau `DB.set('phase', ...)` + emit?
3. Read `src/pages/progres.js` + `src/pages/coach/*` — does it `addEventListener('phase-changed')` sau re-read `DB.get('phase')` on tab switch (`renderProgres()`)?
4. Cross-reference `/tmp/cluster_1_suspect.txt` — what was changed/removed in diff main vs feature?
5. Hypothesis output: emit broken / listener detached / re-render NU triggered
6. **Propose surgical fix verbatim în raport** (file path + line range + before/after snippet ~5-10 LOC)

**Bug 7 — Greutate manual + BF NU propagate engine:**
1. Read `src/pages/weight.js` saveW() implementation
2. Verify: does it `DB.set('weights', ...)` + emit 'weight-changed'?
3. Read `src/engine/bayesianNutrition/*` + `src/pages/progres.js` — does TDEE recalc trigger on weight change?
4. Cross-reference diff suspect file
5. Hypothesis output: emit / listener / re-render breakage
6. **Propose surgical fix verbatim în raport**

**Bug 11 — BF manual checkmark only NU funcțional:**
1. Read `src/pages/weight.js` (sau wherever BF input lives) + `src/pages/settings.js`
2. Verify input change handler: input event → `saveBF(value)` → `DB.set('bodyFat-manual', value)` → emit 'bf-changed'?
3. Hypothesis: input handler wires only `aria-checked` toggle visual, NU actual save (regression Phase 3.5 sau pre-existent?)
4. Cross-reference diff suspect — was Phase 3.5 Task O sau alta a stricat BF input handler?
5. **Propose surgical fix verbatim în raport**

**Audit completion gate:** all 3 buguri propose section completed în raport ÎNAINTE §2 fix execute. Daniel review optional post-raport (autonomy mode = procedezi direct §2 dacă propose clean), but raport must capture full reasoning trail.

═══ §2 FIX PHASE (POST AUDIT, SURGICAL) ═══

Per bug, execute surgical fix per propose în §1. Constraints HARD:

- **Restore parity** main branch behavior (revert specific lines if regression found in diff)
- **NU re-implement de zero** (Phase 3+3.5 deja inventat paradigm — nu repetăm slip)
- **NU add new abstractions** (Observer pattern existing main = source of truth)
- **NU touch alte buguri** (1, 2, 3, 4, 5, 8, 9, 10, 12, 13 = clusters next)
- **NU touch mockup files** (`04-architecture/mockups/` = single-theme Clasic master post strategic shift)
- **NU modify tests** (vitest run for verify only)

Post-fix per bug: capture inline raport `📤_outbox/LATEST.md` §Modificări:
- File path + line range
- Diff snippet ~5-10 LOC verbatim (before/after)
- Grep verify post-fix: handler/listener/emit attached & callable
- Sample HTML/JS evidence (max 10 LOC inline) demonstrating fix wired correct

═══ §3 VERIFY PHASE ═══

```bash
# Tests local vitest preserved EXACT
npm test -- --run 2>&1 | tail -30
# Expect: 2731 PASS / 0 FAIL preserved (zero regression). 
# Dacă count diferit → flag în raport, NU continue.

# Re-grep post-fix verify handlers + listeners + emit
grep -rn "setPhaseOverride\|saveW\|saveBF" src/ 2>/dev/null | head -10
grep -rnE "addEventListener.*(phase|weight|bf)|dispatchEvent.*(phase|weight|bf)" src/ 2>/dev/null | head -10

# Optional: smoke local dev server if available (NU mandatory, raport status if attempted)
# npm run dev & sleep 3 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/ 
```

**Acceptance criteria per bug:**

- **Bug 6:** in code, verify setPhaseOverride() emits + progres.js listens + re-renders. Sample evidence inline raport.
- **Bug 7:** verify saveW() emits + engine bayesianNutrition consume + progres.js re-render. Sample evidence inline.
- **Bug 11:** verify BF manual input wires DB.set + emit + engine consume. Sample evidence inline.

**HALT condition:** if tests count regression (≠2731 PASS) → DO NOT COMMIT. Investigate which test broke + raport HALT cu specific test name + assertion failure.

═══ §4 COMMIT + PUSH ═══

```bash
# Backup tag pre-commit (mandatory rollback safety)
TAG="pre-phase-3-6-cluster-1-engine-regresie-$(date +%Y-%m-%d-%H%M)"
git tag "$TAG"
git push origin --tags

# Verify clean staged changes scope (src/ only, NU mockups/tests/etc)
git status --short

# Single commit cluster
git add src/
git commit -m "fix(engine): Phase 3.6 cluster #1 regresie engine integration prod parity

Buguri restored:
- Bug 6: goal change Forța->Mentenanță reactive Progres update
- Bug 7: greutate manual + BF propagate engine consume (TDEE recalc + macros refresh)
- Bug 11: BF manual input wire engine (NU checkmark only)

Method: diff main vs feature -> identify regression -> revert/restore parity surgical.
NU re-implement de zero. NU new abstractions.

Tests local vitest: 2731 PASS preserved EXACT.

Cluster #1 / 4 sequential post smoke validation Daniel Gates -> cluster #2 onboarding integrity.

🦫 Bugatti craft. Trust = engine NU minte user."

git push origin feature/phase-3-orchestrator-final
```

═══ §5 RAPORT `📤_outbox/LATEST.md` ═══

Move precedent LATEST.md → `_archive/2026-05/<NN>_<TASK>_CONSUMED.md` (next NN sequential), then write fresh LATEST.md format strict:

```
# Phase 3.6 Cluster #1 — Engine Integration Regresie

**Task:** Phase 3.6 Cluster #1 audit-then-fix engine integration regresie (Bug 6+7+11)
**Model:** Opus
**Status:** LANDED LOCAL vitest / FAILED [bug N] / AUDIT [bug N] (per bug independent)
**Branch:** feature/phase-3-orchestrator-final
**Scope:** Single-theme Clasic master (post STRATEGIC SHIFT LOCK V1). src/ only, NU mockups.

## Pre-flight grep

[verbatim output sections (a)-(f) abbreviated, count occurrences + key paths]

Suspect lines diff main vs feature: <count> lines în /tmp/cluster_1_suspect.txt

## Audit findings per bug

**Bug 6 (goal Forța→Mentenanță NU update Progres):**
- Root cause: [emit broken / listener detached / re-render NU triggered]
- File path: [src/pages/X.js line N]
- Diff main vs feature: [snippet]
- Surgical fix proposed: [snippet]

**Bug 7 (greutate/BF NU propagate engine):**
- [same structure]

**Bug 11 (BF manual checkmark only):**
- [same structure]

## Modificări (post §2 fix)

**Bug 6:** [file:line range, before/after snippet ~5-10 LOC, grep verify]

**Bug 7:** [same]

**Bug 11:** [same]

Sample HTML/JS evidence inline (max 10 LOC) per bug demonstrating fix wired correct.

## Build + Tests

- npm test --run: 2731 PASS / 0 FAIL ✅ (preserved EXACT)
- Smoke local: [if attempted, status; else "Daniel Gates pending"]

## Commits

- Backup tag: pre-phase-3-6-cluster-1-engine-regresie-YYYY-MM-DD-HHMM
- Fix commit SHA: <sha>

## Pushed

origin/feature/phase-3-orchestrator-final ✅

## Issues

[per bug if FAILED/AUDIT — what blocked, what NEED_CONTEXT_DANIEL]

## Next action

**Daniel Gates smoke verify cluster #1 local browser:**
1. Set goal Forța → switch Progres tab → verify goal Forța displayed correct
2. Schimbă goal Mentenanță → switch Progres → verify Mentenanță displayed reactive (Bug 6)
3. Bagă greutate 78kg → switch Progres → verify TDEE/kcal target updated reflective (Bug 7)
4. Bagă BF manual 18% → switch Progres → verify BF reflected + lean mass calc updated (Bug 11)

**Post Daniel smoke OK** → proceed cluster #2 (onboarding integrity Buguri 1+2+13).
**Post Daniel smoke FAIL** → investigation specifică per bug, NU continue clusters.

🦫 Cluster #1 / 4 sequential. Single-theme Clasic master. Trust restore prod parity.
```

═══ END PHASE 3.6 CLUSTER #1 ═══
