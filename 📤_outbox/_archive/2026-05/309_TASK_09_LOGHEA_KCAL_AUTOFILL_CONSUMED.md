# TASK 09 — Loghează kcal+proteine Auto-Fill Rule + UI · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~30-45 min CC autonomous (4 mockup files atomic + UI logging flow + MFP CSV import)
**Cluster:** #2 Onboarding inputs UI · Atom 4/4 (closure Cluster #2)
**Authority:** PRODUCT_STRATEGY_SPEC_v1 §3.5 V3 §AMENDMENT 2026-05-10 (LANDED `12f1b76`) — nutrition logging RE-IN-SCOPE V1 cu auto-fill rule (REVERSAL OUT_OF_SCOPE 2026-04-30)

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify state curent kcal/proteine logging cross-skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin ==="
  grep -niE "kcal|calorii|proteine|nutriți|loghea[zaă]|MFP|MyFitness|CSV import" 04-architecture/mockups/andura-$skin.html | head -15
done

# Verify spec authoritative §3.5 V3 amendment
grep -niE "auto-fill rule|MFP CSV|nutriție.*RE-IN-SCOPE|importMFPNutrition" 01-vision/PRODUCT_STRATEGY_SPEC_v1.md | head -15

# Verify importMFPNutritionCSV existing engine
grep -niE "importMFPNutritionCSV|nutrition.*CSV" src/pages/weight.js 2>/dev/null | head -10

# Verify wording GENERIC mandatory anti-MFP-mention legal cover
grep -niE "Importă nutriție CSV|Import date nutriție|MFP|MyFitnessPal" 01-vision/PRODUCT_STRATEGY_SPEC_v1.md | head -10
```

---

## §1 Scope

Add UI Loghează kcal+proteine auto-fill rule + manual logging optional + MFP CSV import generic wording cross-skin × 4 mockup files atomic.

**Logica Bugatti elegant LOCK V1 (Daniel articulare):**
- **Auto target engine:** ex 2000 kcal + 180g proteine (calculate from BMR/TDEE Mifflin-St Jeor + Big 6 inputs)
- **User NU logheaza** = istoric default ce-i pe auto target
- **User logheaza manual** = istoric calibrat real cu logged values
- **MFP CSV import** = batch logging din MyFitnessPal export (`importMFPNutritionCSV` existing `src/pages/weight.js` preserved)
- **Edit ziua curentă** = buton dedicat override valoarea zilnică

**WORDING GENERIC MANDATORY anti-MFP-mention legal cover (Daniel directive):**
- **NU mention "MyFitnessPal" / "MFP" anywhere UI**
- Wording acceptat: *"Importă nutriție CSV"* / *"Import date nutriție"*
- Help text: *"Compatibil cu majoritatea aplicațiilor de tracking nutriție (export CSV)"*
- Legal cover anti-lawsuit per Daniel directive

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Add Loghează nutriție UI** (Antrenor / Progres context post-Big 6 onboarding)
   - Auto target display (kcal + proteine) read-only
   - Manual log inputs (kcal + proteine) ziua curentă cu buton "Salvează ziua"
   - Buton "Importă nutriție CSV" → file picker generic CSV upload
   - Help text generic NU MFP mention
2. **Edit ziua curentă** buton dedicat override
3. **Visual indicator sursă logging** (auto default / manual / CSV import)
4. **NU touch** Bayesian inference engine (Layer 1-5 silent backend preserved unchanged)

**Theme Parity Invariant V1:** Logic 1:1 strict cross-skin.

**NU touch:**
- Engine code Bayesian inference (silent preserved per §3.5 V3)
- Tab Nutriție UI standalone (REMOVED per §3.5 V3 — integrate inline Antrenor/Progres NU tab dedicat)
- Big 6 onboarding flow

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Auto target display (kcal + proteine) read-only cross-skin × 4
2. ✅ Manual log inputs (kcal + proteine) ziua curentă + buton "Salvează ziua"
3. ✅ Buton "Importă nutriție CSV" generic wording (NU MFP mention anywhere UI)
4. ✅ Edit ziua curentă buton dedicat override
5. ✅ Visual indicator sursă logging
6. ✅ Help text generic *"Compatibil cu majoritatea aplicațiilor de tracking nutriție (export CSV)"*
7. ✅ Tab Nutriție standalone REMOVED (NU re-add)
8. ✅ **Diff parity verify:** logic identical 4/4
9. ✅ Tests 2731 PASS preserved EXACT
10. ✅ Build PASS
11. ✅ Manual smoke 4 themes — flow logging walk-through

**Legal hygiene critical:** ZERO "MFP" / "MyFitnessPal" mentions anywhere UI cross-skin × 4 (per Daniel directive anti-lawsuit cover).

---

## §4 Backup tag

```bash
git tag pre-task09-loghea-kcal-autofill-$(date +%Y-%m-%d-%H%M)
git push origin pre-task09-loghea-kcal-autofill-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(nutrition-logging): Loghează kcal+proteine auto-fill + UI cross-skin × 4

Per PRODUCT_STRATEGY §3.5 V3 §AMENDMENT 2026-05-10 (LANDED 12f1b76):
- Auto target engine kcal+proteine read-only display (BMR/TDEE Mifflin-St Jeor)
- Manual log inputs ziua curentă + buton "Salvează ziua"
- Importă nutriție CSV generic wording (NU MFP mention legal cover)
- Edit ziua curentă buton dedicat override
- Tab Nutriție standalone REMOVED — inline Antrenor/Progres integration

Cluster #2 Onboarding inputs · Task 09/16 (closure Cluster #2).
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT (UI mockup only, Bayesian engine silent preserved).

Cross-refs:
- PRODUCT_STRATEGY §3.5 V3 amendment 2026-05-10 (REVERSAL OUT_OF_SCOPE 2026-04-30)
- src/pages/weight.js importMFPNutritionCSV existing preserved
- CURRENT_STATE §JUST_DECIDED 2026-05-10 +1 net additive Loghează kcal REVERSAL
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 09 — Loghează kcal+proteine Auto-Fill Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings nutrition state per skin + MFP wording legal verified>
- **Modificări:**
  - Clasic: <atomic diff>
  - Living Body: <atomic diff>
  - Luxury: <atomic diff>
  - Brain Coach: <atomic diff>
- **Diff parity 4/4:** Verified identical logic
- **Legal hygiene:** ZERO MFP/MyFitnessPal mentions verified all 4 mockups
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 10 (1800 kcal hardcoded grep+remove production) — Cluster #3 Workflow + scope cuts start
```
