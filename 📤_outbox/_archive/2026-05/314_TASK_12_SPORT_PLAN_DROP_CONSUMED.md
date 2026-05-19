# TASK 12 — Sport Plan Supervision DROP Complet · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~10-20 min CC autonomous (4 mockup files atomic feature removal)
**Cluster:** #3 Workflow + scope cuts · Atom 3/6
**Authority:** Daniel directive 2026-05-10 chat ACASĂ post-noapte: *"Sport plan supervision = nu inteleg rostul"* — DROP complet (Auto+Antrenor deja arată în background, nu trebuie tab dedicat)

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate Sport plan supervision references cross-skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin ==="
  grep -niE "sport.plan|supervision|supervizar|tab.*sport|plan sport|plan.*sportiv" 04-architecture/mockups/andura-$skin.html | head -15
done

# Verify NU references în production code (mockup-only scope clarify)
grep -rniE "sport.plan|supervision" src/ --include="*.js" 2>/dev/null | head -10

# Verify Auto+Antrenor background existing prod pattern (preserved)
grep -niE "Antrenor|Auto.*background|setPhaseOverride" 04-architecture/mockups/andura-clasic.html | head -10
```

---

## §1 Scope

DROP Sport plan supervision feature complet cross-skin × 4 mockup files atomic. Replace cu Auto+Antrenor background existing pattern (deja afișează plan în Antrenor tab + Auto template engine override `setPhaseOverride()`/`clearPhaseOverride()`).

**Rationale Daniel:** *"nu inteleg rostul"* — Sport plan supervision = redundant feature suprapus cu Antrenor + Auto template existing prod. Scope cut consistent cu Antrenament liber DROP (Task 14).

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Identify** Sport plan supervision instances per skin (tab dedicat / section / link)
2. **Remove** complet (tab + content + nav references)
3. **Verify** Antrenor + Auto template existing pattern preserved (NU affected)
4. **NU touch** Engine `src/pages/plan.js` `setPhaseOverride()`/`clearPhaseOverride()` (Auto pattern existing prod preserved exact)

**Theme Parity Invariant V1:** Logic 1:1 strict (Sport plan supervision = ZERO toate 4 skin-uri uniform).

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Sport plan supervision feature DROPPED cross-skin × 4 (tab + content + nav)
2. ✅ Antrenor + Auto template existing pattern preserved unchanged
3. ✅ **Diff parity verify:** logic identical 4/4 (Sport plan supervision = ZERO uniform)
4. ✅ Tests 2731 PASS preserved EXACT
5. ✅ Build PASS
6. ✅ Manual smoke 4 themes — nav structure clean, NO Sport plan tab/section
7. ✅ Grep post-removal: matches Sport plan supervision = ZERO 4 mockup files

---

## §4 Backup tag

```bash
git tag pre-task12-sport-plan-drop-$(date +%Y-%m-%d-%H%M)
git push origin pre-task12-sport-plan-drop-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
chore(scope-cut): DROP Sport plan supervision complet cross-skin × 4

Per Daniel directive 2026-05-10 chat ACASĂ post-noapte:
"Sport plan supervision = nu inteleg rostul"

Removed:
- Sport plan supervision tab/section/nav cross-skin × 4 mockup atomic
- Replaced funcțional cu Auto+Antrenor background existing pattern

Preserved:
- Antrenor tab existing prod
- Auto template engine override (src/pages/plan.js setPhaseOverride/clearPhaseOverride)

Cluster #3 Workflow + scope cuts · Task 12/16 Phase 1 orchestrator.
Theme Parity Invariant V1 — Sport plan supervision = ZERO 4 skin-uri uniform.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 scope cut Sport plan supervision
- Task 14 Antrenament liber DROP consistent scope-cut pattern
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 12 — Sport Plan Supervision DROP Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings Sport plan locations per skin>
- **Modificări per-skin:**
  - Clasic: <atomic diff>
  - Living Body: <atomic diff>
  - Luxury: <atomic diff>
  - Brain Coach: <atomic diff>
- **Diff parity 4/4:** Verified Sport plan = ZERO uniform
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 13 (saveStepsQuick step counter DROP)
```
