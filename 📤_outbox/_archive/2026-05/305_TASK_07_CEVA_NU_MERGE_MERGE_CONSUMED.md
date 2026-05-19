# TASK 07 — 1 Buton "Ceva nu merge" Merge Pain+Equipment Unified Drill · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~20-30 min CC autonomous (4 mockup files atomic + drill UI consolidate)
**Cluster:** #2 Onboarding inputs UI · Atom 2/4
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ post-noapte LOCK V1 (+1 net additive) — replace ADR 023 split Pain text + Equipment text drill secundar

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify state curent Pain Button + Equipment buttons cross-skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin ==="
  grep -niE "pain.button|durere|Mă doare|Schimbă echipament|nu am aparat|Ceva nu merge" 04-architecture/mockups/andura-$skin.html | head -15
done

# Verify ADR 023 split current spec
grep -niE "Pain text|Equipment text|drill secundar|split.*Pain.*Equipment" 03-decisions/023-pain-equipment-text-input-layer.md 2>/dev/null | head -10

# Verify alternativeEngine.js existing engine preserved
grep -niE "export function|getAlternative|substitution" src/engine/alternativeEngine.js | head -15
```

---

## §1 Scope

Merge 2 butoane separate (Pain Button mid-session + Equipment Swap "Nu am aparat") la **1 buton unified "Ceva nu merge"** cross-skin × 4 mockup files atomic per CURRENT_STATE §JUST_DECIDED 2026-05-10 LOCK V1.

**Daniel articulare LOCK V1:** *"merită simplificat la 1 buton 'Ceva nu merge'"*. Replace ADR 023 split Pain text + Equipment text drill secundar la single CTA simplificat.

**Acțiuni atomic cross-skin × 4 mockup files:**
- **Replace** Pain Button standalone (mid-session active context) cu buton "Ceva nu merge"
- **Replace** Equipment Swap "Nu am aparat" / "Schimbă echipament" cu buton "Ceva nu merge" merged
- **Drill unified** sub buton: ~3-4 opțiuni preset
  - "Mă doare" → trigger Pain modal flow existing
  - "Nu am aparat" → trigger alternativeEngine.js substitution flow existing
  - "Altceva" → free text Marius power user (preserved per ADR 023 textbox liber)
  - (opțional UX) "Anulează"
- **Engine alternativeEngine.js** existing preserved — DOAR UI wiring 1 CTA consolidat

**NU touch:**
- Engine `src/engine/alternativeEngine.js` (engine logic preserved exact)
- Pain Button **idle** context (separat Task 11 — Pain Button idle scos)
- Other onboarding ecrane

**Theme Parity Invariant V1:** Logic 1:1 strict cross-skin (label "Ceva nu merge" identic, drill 4 opțiuni identic, palette/font diferă).

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Pain Button standalone mid-session replaced cu "Ceva nu merge" cross-skin × 4
2. ✅ Equipment Swap "Nu am aparat" replaced cu "Ceva nu merge" cross-skin × 4
3. ✅ Drill unified 3-4 opțiuni preset (Mă doare / Nu am aparat / Altceva / [Anulează])
4. ✅ Drill flow trigger existing engine paths preserved (Pain modal + alternativeEngine.js substitution + textbox liber)
5. ✅ **Diff parity verify:** logic identical 4/4 mockup files
6. ✅ Tests 2731 PASS preserved EXACT (engine code untouched)
7. ✅ Build PASS
8. ✅ Manual smoke 4 themes — buton "Ceva nu merge" mid-session active context, drill 4 opțiuni functional

**Fail-cluster mode acceptable** dacă 1 skin breaks layout drill, log + continue restul.

---

## §4 Backup tag

```bash
git tag pre-task07-ceva-nu-merge-merge-$(date +%Y-%m-%d-%H%M)
git push origin pre-task07-ceva-nu-merge-merge-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(workout-ui): 1 buton "Ceva nu merge" merge Pain+Equipment cross-skin × 4

Per CURRENT_STATE §JUST_DECIDED 2026-05-10 LOCK V1 (+1 net additive):
- Replace ADR 023 split Pain Button + Equipment Swap la single CTA "Ceva nu merge"
- Drill unified 3-4 opțiuni preset (Mă doare / Nu am aparat / Altceva)
- Engine alternativeEngine.js + Pain modal flow preserved exact (UI wiring only)

Cluster #2 Onboarding inputs · Task 07/16 Phase 1 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 LOCK V1 (+1 net additive)
- ADR 023 split SUPERSEDED preserved istoric
- src/engine/alternativeEngine.js existing engine preserved
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 07 — 1 Buton "Ceva nu merge" Merge Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings Pain+Equipment locations per skin + alternativeEngine verified>
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
- **Next action:** TASK 08 (BF auto US Navy + override manual cross-skin × 4)
```
