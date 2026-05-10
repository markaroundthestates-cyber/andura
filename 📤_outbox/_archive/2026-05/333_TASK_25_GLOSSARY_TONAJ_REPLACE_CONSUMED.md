# TASK 25 — Glossary TONAJ Jargon Gigel-Replace · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~15-25 min CC autonomous (4 mockup files atomic + glossary apply)
**Cluster:** #7 Glossary jargon LOCK V1 · Atom 2/5
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ noapte Glossary jargon LOCK V1 — Daniel-ism verbatim *"wtf suntem camioane?"* Gigel test fail trigger TONAJ TOTAL

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate TONAJ jargon instances cross-skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin TONAJ ==="
  grep -niE "tonaj|TONAJ|volum.*kg|total.*kg|total.*tonaj|kg.*total.*sesiune" 04-architecture/mockups/andura-$skin.html | head -15
done

# Locate TONAJ in production code (preserve internal logic)
grep -rniE "tonnage|totalKg|sessionVolume|volumeKg|computeTonnage" src/ --include="*.js" 2>/dev/null | head -15
```

---

## §1 Scope

Replace TONAJ jargon UI strings cross-skin × 4 mockup files atomic cu Gigel-friendly wording.

**Replacement spec LOCK V1 candidate:**
- **Option A:** "Volum total" (semi-tehnic accesibil — used universal în fitness apps RO/EN community)
- **Option B:** "Total ridicat (kg)" (hyper-explicit dar lung)
- **Option C:** "Greutate totală sesiune" (descriptive long form)

**RECOMMENDED Co-CTO scope:** Option A "Volum total" — Daniel-ism *"wtf suntem camioane?"* indică TONAJ specific friction (truck/cargo connotation). "Volum total" e standard fitness wording neutral. Tooltip inline opțional cu unit "(kg ridicați total)".

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Identify** toate "TONAJ" / "Tonaj" / "tonaj total" string occurrences per skin
2. **Replace** cu Option A "Volum total" — ALL UI labels / metrics tile / dashboard
3. **Tooltip optional** "(kg ridicați total)" cu unit clarification
4. **NU touch** internal code variables / functions (`tonnage`, `totalKg` etc preserved)

**Theme Parity Invariant V1:** Logic 1:1 strict cross-skin (wording identical).

**NU touch:**
- Engine code `src/` tonnage variables (preserved exact)
- Other jargon terms (Tasks 24, 26-28 separate atomic)

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ ALL "TONAJ" UI strings replaced cu "Volum total"
2. ✅ Internal code variables preserved
3. ✅ Cross-skin × 4 wording identical
4. ✅ Tooltip "(kg ridicați total)" optional consistent dacă applied
5. ✅ **Diff parity verify:** logic identical 4/4
6. ✅ Tests 2731 PASS preserved EXACT
7. ✅ Build PASS
8. ✅ Manual smoke 4 themes — Gigel test pass: NU truck/cargo connotation
9. ✅ Grep post-fix: ZERO occurrences "TONAJ" în mockup UI strings

---

## §4 Backup tag

```bash
git tag pre-task25-glossary-tonaj-replace-$(date +%Y-%m-%d-%H%M)
git push origin pre-task25-glossary-tonaj-replace-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
fix(glossary-jargon): replace TONAJ with "Volum total" cross-skin × 4

Per Glossary LOCK V1 + Daniel-ism trigger: "wtf suntem camioane?"

Replacement applied:
- "TONAJ" → "Volum total"
- Tooltip "(kg ridicați total)" optional unit clarification

Preserved internal:
- Engine variables `tonnage`, `totalKg`, `sessionVolume` (untouched)

Cluster #7 Glossary jargon LOCK V1 · Task 25/N Phase 2 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 Glossary jargon LOCK V1
- Task 24 RIR replacement precedent pattern
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 25 — Glossary TONAJ Replace Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings TONAJ occurrences per skin>
- **Modificări per-skin:**
  - Clasic: <count instances replaced>
  - Living Body: <count>
  - Luxury: <count>
  - Brain Coach: <count>
- **Diff parity 4/4:** Verified wording uniform "Volum total"
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 26 (Glossary Pace jargon replace cross-skin × 4)
```
