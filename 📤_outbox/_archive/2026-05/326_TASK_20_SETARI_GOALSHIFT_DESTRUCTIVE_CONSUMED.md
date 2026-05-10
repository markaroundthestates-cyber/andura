# TASK 20 — Setări Goal Shift Wording Destructive Confirm Pattern · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~15-25 min CC autonomous (4 mockup files atomic + modal pattern wiring)
**Cluster:** #5 Setări BC dead · Atom 2/2 (closure Cluster #5)
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ "Schimbă fază manual destructive confirm pattern LOCK V2 universal" + 6 features recovery scope clarify (Schimbă fază manual override existing prod `setPhaseOverride()` / `clearPhaseOverride()`)

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate Goal Shift / Schimbă fază elements per skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin Goal Shift ==="
  grep -niE "schimbă fază|schimba faza|Goal Shift|fază activă|reset.*calibr|destructive.*confirm" 04-architecture/mockups/andura-$skin.html | head -15
done

# Verify production existing setPhaseOverride pattern
grep -rniE "setPhaseOverride|clearPhaseOverride|phase.*override|CUT.*BULK.*MAINTENANCE" src/pages/plan.js | head -20

# Verify destructive confirm pattern V2 universal LOCK
grep -niE "destructive confirm pattern V2 universal|icon ⚠️|Confirmă roșu|Anulează neutru|drill-down page" 00-index/CURRENT_STATE.md | head -10

# Verify wording draft authoritative
grep -niE "Schimbi faza activă manual|resetează unele calibrări|Continui" 00-index/CURRENT_STATE.md | head -5
```

---

## §1 Scope

Add Schimbă fază manual override UI cu destructive confirm pattern V2 universal cross-skin × 4 mockup files atomic per CURRENT_STATE §JUST_DECIDED 2026-05-10 LOCK V1 + 6 features recovery scope clarify (existing prod preserved).

**Spec LOCK V1 (CURRENT_STATE §JUST_DECIDED 2026-05-10):**
- **Setări → Schimbă fază manual** entry point cu CTA "Schimbă fază"
- **5 opțiuni override** (production existing pattern): CUT / BULK / MAINTENANCE / STRENGTH / AUTO (revert engine decide)
- **Destructive confirm pattern V2 universal:**
  - Icon ⚠️ warning prominent
  - Wording: *"Schimbi faza activă manual? Aceasta resetează unele calibrări. Continui?"*
  - Buton **Confirmă** (roșu / accent destructive)
  - Buton **Anulează** (neutru / secondary)
  - Drill-down page (NU inline modal, full page transition)

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Add Setări → Schimbă fază** entry CTA cross-skin × 4
2. **Drill-down page UI** cu 5 opțiuni (CUT / BULK / MAINTENANCE / STRENGTH / AUTO)
3. **Per opțiune tap → destructive confirm pattern** drill-down secondary:
   - Icon ⚠️
   - Wording verbatim *"Schimbi faza activă manual? Aceasta resetează unele calibrări. Continui?"*
   - Confirmă (roșu) + Anulează (neutru)
4. **AUTO opțiune** = "Lasă engine să decidă" (revert override `clearPhaseOverride()` pattern existing prod)
5. **Engine wiring** placeholder UI — `setPhaseOverride()` / `clearPhaseOverride()` prod preserved exact

**NU touch:**
- Engine code `src/pages/plan.js` (existing prod preserved exact, UI wiring only)
- Other Setări entries (Task 19 separat dead links audit)
- Cont tab (out-of-scope)

**Theme Parity Invariant V1:** Logic 1:1 strict cross-skin (wording verbatim identic, button colors palette diferă structure identic).

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Setări → Schimbă fază entry CTA cross-skin × 4
2. ✅ Drill-down page 5 opțiuni (CUT / BULK / MAINTENANCE / STRENGTH / AUTO) cross-skin × 4
3. ✅ Destructive confirm pattern V2 universal applied per opțiune:
   - Icon ⚠️ present
   - Wording verbatim *"Schimbi faza activă manual? Aceasta resetează unele calibrări. Continui?"*
   - Confirmă (roșu/destructive) + Anulează (neutru) cross-skin × 4
4. ✅ AUTO = "Lasă engine să decidă" wording revert override clear
5. ✅ Engine wiring placeholder (`setPhaseOverride/clearPhaseOverride` prod preserved)
6. ✅ **Diff parity verify:** logic identical 4/4
7. ✅ Tests 2731 PASS preserved EXACT
8. ✅ Build PASS
9. ✅ Manual smoke 4 themes — Schimbă fază flow walk-through tap-through toate 5 opțiuni + confirm/anulează functional

---

## §4 Backup tag

```bash
git tag pre-task20-goal-shift-destructive-$(date +%Y-%m-%d-%H%M)
git push origin pre-task20-goal-shift-destructive-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(setari-goalshift): Schimbă fază manual destructive confirm V2 cross-skin × 4

Per CURRENT_STATE §JUST_DECIDED 2026-05-10 destructive confirm pattern V2 universal:
- Setări → Schimbă fază entry CTA cross-skin × 4
- 5 opțiuni override (CUT / BULK / MAINTENANCE / STRENGTH / AUTO)
- Drill-down page + destructive confirm secondary
- Wording verbatim "Schimbi faza activă manual? Aceasta resetează unele calibrări. Continui?"
- Confirmă (roșu) + Anulează (neutru) pattern V2 universal

Cluster #5 Setări BC dead · Task 20/N (closure Cluster #5) Phase 2 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT (UI mockup, engine prod preserved).

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 destructive confirm V2 universal LOCK
- src/pages/plan.js setPhaseOverride/clearPhaseOverride existing prod
- 6 features recovery scope clarify Schimbă fază manual override
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 20 — Setări Goal Shift Destructive Confirm Cross-Skin × 4 (closure Cluster #5)

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings Goal Shift state per skin + setPhaseOverride prod verified>
- **Modificări per-skin:**
  - Clasic: <atomic diff Schimbă fază + drill + confirm>
  - Living Body: <atomic diff>
  - Luxury: <atomic diff>
  - Brain Coach: <atomic diff>
- **Diff parity 4/4:** Verified identical wording verbatim + structure
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 21 (State bugs audit cross-skin × 4 — Cluster #6 start)
```
