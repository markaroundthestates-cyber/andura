# TASK 06 — 6 Templates V2 Rename Mentenanță + Auto Add · Cross-Skin × 4 Themes

**Model:** Opus
**Velocity:** ~15-25 min CC autonomous (4 mockup files atomic)
**Cluster:** #2 Onboarding inputs UI · Atom 1/4
**Authority:** ONBOARDING_SSOT_V1 §2 §AMENDMENT 2026-05-10 V2 (LANDED `12f1b76`) + production pattern `src/pages/plan.js` `setPhaseOverride()`/`clearPhaseOverride()`

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify state curent templates per skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin ==="
  grep -niE "Sănătate Generală|sanatate generala|Mentenanță|Mentenanta|Auto.*template|Forță|Tonifiere|Slăbire|Longevitate" 04-architecture/mockups/andura-$skin.html | head -15
done

# Verify Auto pattern existing production
grep -niE "setPhaseOverride|clearPhaseOverride|AUTO" src/pages/plan.js | head -20

# Verify spec authoritative ONBOARDING_SSOT V2
grep -niE "Mentenanță SUPERSEDE|Auto al 6-lea|6 templates V2|Forța Tonifiere Slabire" 01-vision/ONBOARDING_SSOT_V1.md | head -15
```

---

## §1 Scope

Apply 6 templates V2 user-facing rename + Auto add cross-skin × 4 atomic per ONBOARDING_SSOT §2 §AMENDMENT 2026-05-10 V2.

**6 templates V2 user-facing LOCK V1 (mapping Gigel-friendly internal):**
1. **Forță** = STRENGTH (preserved)
2. **Tonifiere** = Recomp (preserved)
3. **Slăbire** = CUT (preserved)
4. **Longevitate** = maintain conservative (preserved)
5. **Mentenanță** = MAINTENANCE — **rename SUPERSEDE Sănătate Generală** Gigel-friendly
6. **Auto** = engine decide — **NEW al 6-lea opțiune** production-aligned existing pattern (`setPhaseOverride()`/`clearPhaseOverride()` revine la AUTO)

**Acțiuni atomic cross-skin × 4 mockup files:**
- **Rename** "Sănătate Generală" → "Mentenanță" (toate ocurențele Ecran 1 Obiectiv onboarding + Setări Goal Shift)
- **Add 6th option "Auto"** la lista templates (suff "engine decide" subtitle/tooltip optional explanatory)
- Verify ordine afișare: Forță / Tonifiere / Slăbire / Longevitate / Mentenanță / Auto
- **Theme Parity Invariant V1:** label text identic cross-skin, doar palette/font diferă

**NU touch:**
- Engine code `src/pages/plan.js` (Auto pattern existing prod, NU additive arch)
- Big 6 hard T0 wiring (Tasks 01-04 separat)
- Istoric medical / Vârstă / Sex / Frecvență ecrane

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ "Sănătate Generală" rename "Mentenanță" toate 4 mockup files (ecran Obiectiv + Setări)
2. ✅ "Auto" 6-lea opțiune adăugat fiecare 4 mockup files cu tooltip/subtitle "engine decide"
3. ✅ Ordine 6 templates uniform cross-skin: Forță / Tonifiere / Slăbire / Longevitate / Mentenanță / Auto
4. ✅ **Diff parity verify:** logic identical 4/4 (label text identic, palette/font diferă)
5. ✅ Tests 2731 PASS preserved EXACT
6. ✅ Build PASS
7. ✅ Manual smoke 4 themes — flow Obiectiv ecran walk-through verify 6 templates display + ordering corect

**Fail-cluster mode:** Dacă 1 skin breaks (ex. layout collapse Auto card), log + continue restul 3 skins. Per Daniel reset Bugatti definition: end product perfect, NU process zero-error.

---

## §4 Backup tag

```bash
git tag pre-task06-templates-v2-rename-$(date +%Y-%m-%d-%H%M)
git push origin pre-task06-templates-v2-rename-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(onboarding-templates): 6 templates V2 Mentenanță rename + Auto add cross-skin × 4

Per ONBOARDING_SSOT_V1 §2 §AMENDMENT 2026-05-10 V2:
- Sănătate Generală → Mentenanță rename Gigel-friendly toate skin-uri
- Auto al 6-lea opțiune NEW production-aligned (setPhaseOverride pattern existing)
- Ordering uniform: Forță / Tonifiere / Slăbire / Longevitate / Mentenanță / Auto

Cluster #2 Onboarding inputs · Task 06/16 Phase 1 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- ONBOARDING_SSOT_V1 §2 V2 LANDED `12f1b76`
- src/pages/plan.js setPhaseOverride/clearPhaseOverride (Auto pattern prod)
- CURRENT_STATE §JUST_DECIDED 2026-05-10 6 templates LOCK V1
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 06 — 6 Templates V2 Rename + Auto Add Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings rename targets per skin + Auto pattern verified>
- **Modificări:**
  - Clasic: <atomic diff>
  - Living Body: <atomic diff>
  - Luxury: <atomic diff>
  - Brain Coach: <atomic diff>
- **Diff parity 4/4:** Verified identical logic
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 07 (1 buton "Ceva nu merge" merge cross-skin × 4)
```
