# TASK 14 — Antrenament Liber DROP Confirmat · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~10-20 min CC autonomous (4 mockup files atomic feature removal)
**Cluster:** #3 Workflow + scope cuts · Atom 5/6
**Authority:** Daniel directive 2026-05-10 chat ACASĂ post-noapte (DROP confirmat preservat chat-NEW2 §5 precedent reaffirmed) — quick-link "+circle Antrenament liber" → user pornește sesiune ad-hoc fără program structurat

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate Antrenament liber references cross-skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin ==="
  grep -niE "antrenament.liber|antrenament.rapid|quick.link|\\+circle|sesiune.*ad.hoc" 04-architecture/mockups/andura-$skin.html | head -15
done

# Verify NU references production code mockup-only scope
grep -rniE "antrenament.liber|antrenamentLiber|quickWorkout|adHocSession" src/ --include="*.js" 2>/dev/null | head -10

# Verify scope-cut precedent chat-NEW2 §5
grep -niE "Antrenament liber DROP|chat-NEW2.*DROP|quick-link.*\\+circle" 03-decisions/DECISION_LOG.md | head -10
```

---

## §1 Scope

DROP "Antrenament liber" quick-link "+circle" feature cross-skin × 4 mockup files atomic. Scope cut confirmat preservat chat-NEW2 §5 precedent.

**Rationale (chat-NEW2 §5 + chat post-noapte reaffirmation):**
- Maria 65 zero need (longevitate template structurat suficient)
- Marius rare frecvență (custom exercises interzis V1 oricum per PRODUCT_STRATEGY §3.2)
- Engine signal corruption fără phase context (sesiune ad-hoc fără program → CDL pollution)
- Scope cut consistent cu Sport plan supervision DROP (Task 12) + Filtru/sort DROP

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Identify** quick-link "+circle Antrenament liber" / "Antrenament rapid" / sesiune ad-hoc trigger per skin
2. **Remove** quick-link/buton + drill flow associated cross-skin × 4
3. **Verify** Antrenor structured flow (template-driven) preserved unchanged
4. **NU touch** Engine code (mockup-only edit, Antrenament liber NU implementat backend prod oricum)

**Theme Parity Invariant V1:** Logic 1:1 strict (Antrenament liber = ZERO toate 4 skin-uri uniform).

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Antrenament liber quick-link/buton REMOVED cross-skin × 4
2. ✅ Antrenor structured flow (template-driven) preserved unchanged
3. ✅ **Diff parity verify:** logic identical 4/4 (Antrenament liber = ZERO uniform)
4. ✅ Tests 2731 PASS preserved EXACT (mockup-only edit)
5. ✅ Build PASS
6. ✅ Manual smoke 4 themes — Antrenor entry points clean, NO quick-link liber/rapid
7. ✅ Grep post-removal: matches Antrenament liber/rapid = ZERO 4 mockup files

---

## §4 Backup tag

```bash
git tag pre-task14-antrenament-liber-drop-$(date +%Y-%m-%d-%H%M)
git push origin pre-task14-antrenament-liber-drop-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
chore(scope-cut): DROP Antrenament liber confirmat cross-skin × 4

Per Daniel directive chat-NEW2 §5 precedent + chat ACASĂ 2026-05-10 reaffirmation.

Removed:
- Quick-link "+circle Antrenament liber" cross-skin × 4 mockup atomic
- Drill flow ad-hoc session associated

Preserved:
- Antrenor structured flow (template-driven, engine phase context)
- Engine src/ untouched (Antrenament liber NU implementat backend oricum)

Rationale:
- Maria 65 zero need (longevitate structurat suficient)
- Marius rare frecvență + custom exercises interzis V1 (PRODUCT_STRATEGY §3.2)
- Engine signal corruption fără phase context (CDL pollution risk)

Cluster #3 Workflow + scope cuts · Task 14/16 Phase 1 orchestrator.
Theme Parity Invariant V1 — Antrenament liber = ZERO 4 skin-uri uniform.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- DECISION_LOG chat-NEW2 §5 DROP V1 precedent
- CURRENT_STATE §JUST_DECIDED 2026-05-10 confirmat preservat
- Task 12 Sport plan DROP consistent scope-cut pattern
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 14 — Antrenament Liber DROP Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings Antrenament liber locations per skin>
- **Modificări per-skin:**
  - Clasic: <atomic diff>
  - Living Body: <atomic diff>
  - Luxury: <atomic diff>
  - Brain Coach: <atomic diff>
- **Diff parity 4/4:** Verified Antrenament liber = ZERO uniform
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 15 (Workflow antrenament audit prod parity cross-skin × 4 read-only)
```
